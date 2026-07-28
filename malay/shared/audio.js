/* =========================================================
   /malay/shared/audio.js
   Cross-browser microphone capture for the Oral modes.

   The whole point of this module: MediaRecorder's supported
   container differs by browser. Chrome/Edge/Firefox produce
   audio/webm (Opus). Safari — macOS AND iOS — produces
   audio/mp4 (AAC) and will THROW if handed a webm mimeType.
   Hardcoding 'audio/webm' silently breaks every Apple device,
   which is most of the Singapore student market. So we
   negotiate.

   Exposes window.JglAudio:
     JglAudio.support()                    -> {ok, reason, mimeType}
     JglAudio.createRecorder(opts)         -> recorder
       opts: { onLevel(0..1), onTick(ms), maxMs }
     await rec.start()                     -> requests mic
     await rec.stop()                      -> {blob,url,mimeType,durationMs,base64}
     rec.cancel()
     rec.isRecording()
     JglAudio.geminiMime(mimeType)         -> mime Gemini accepts
     JglAudio.blobToBase64(blob)           -> raw base64 (no data: prefix)

   Errors thrown from start() carry a .code:
     INSECURE_CONTEXT | UNSUPPORTED | PERM_DENIED | NO_DEVICE | BUSY
   ========================================================= */

(function (global) {
  if (global.JglAudio) return;

  // Preference order. Opus-in-WebM first (best quality per byte and
  // what Gemini handles most reliably), then Ogg, then the Apple path.
  const CANDIDATES = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/ogg;codecs=opus',
    'audio/ogg',
    'audio/mp4;codecs=mp4a.40.2',
    'audio/mp4',
    'audio/aac',
    '', // let the browser choose — Safari lands here on older versions
  ];

  function isSecure() {
    // localhost is treated as secure by browsers, so mirror that.
    if (global.isSecureContext === true) return true;
    const h = global.location ? global.location.hostname : '';
    return h === 'localhost' || h === '127.0.0.1' || h === '[::1]' || global.location?.protocol === 'file:';
  }

  function pickMime() {
    if (typeof MediaRecorder === 'undefined') return null;
    // Older Safari shipped MediaRecorder without isTypeSupported.
    if (typeof MediaRecorder.isTypeSupported !== 'function') return '';
    for (const m of CANDIDATES) {
      if (m === '') return '';
      try { if (MediaRecorder.isTypeSupported(m)) return m; } catch (_) { /* keep looking */ }
    }
    return '';
  }

  function support() {
    if (!isSecure()) {
      return { ok: false, reason: 'INSECURE_CONTEXT', mimeType: '' };
    }
    if (!global.navigator || !navigator.mediaDevices || typeof navigator.mediaDevices.getUserMedia !== 'function') {
      return { ok: false, reason: 'NO_GETUSERMEDIA', mimeType: '' };
    }
    if (typeof MediaRecorder === 'undefined') {
      return { ok: false, reason: 'NO_MEDIARECORDER', mimeType: '' };
    }
    const mimeType = pickMime();
    return { ok: true, reason: 'OK', mimeType: mimeType === '' ? '(browser default)' : mimeType };
  }

  // Map whatever the browser produced onto a mime Gemini's inline
  // audio part accepts. Gemini takes the base container type without
  // the codecs= suffix.
  function geminiMime(mimeType) {
    const m = String(mimeType || '').toLowerCase();
    if (m.indexOf('webm') !== -1) return 'audio/webm';
    if (m.indexOf('ogg')  !== -1) return 'audio/ogg';
    if (m.indexOf('mp4')  !== -1 || m.indexOf('m4a') !== -1) return 'audio/mp4';
    if (m.indexOf('aac')  !== -1) return 'audio/aac';
    if (m.indexOf('wav')  !== -1) return 'audio/wav';
    if (m.indexOf('mpeg') !== -1 || m.indexOf('mp3') !== -1) return 'audio/mpeg';
    if (m.indexOf('flac') !== -1) return 'audio/flac';
    // Unknown container: mp4 is the safest guess because the only
    // browsers that leave us guessing are Apple's.
    return 'audio/mp4';
  }

  function blobToBase64(blob) {
    return new Promise((resolve, reject) => {
      const fr = new FileReader();
      fr.onerror = () => reject(new Error('Could not read the recording.'));
      fr.onload = () => {
        const s = String(fr.result || '');
        const comma = s.indexOf(',');
        resolve(comma === -1 ? s : s.slice(comma + 1)); // strip 'data:...;base64,'
      };
      fr.readAsDataURL(blob);
    });
  }

  function mapGumError(e) {
    const name = e && e.name ? e.name : '';
    const err = new Error('');
    if (name === 'NotAllowedError' || name === 'SecurityError' || name === 'PermissionDeniedError') {
      err.code = 'PERM_DENIED';
      err.message = 'Microphone permission was blocked. Click the padlock or camera icon in the address bar, set Microphone to Allow, then reload this page.';
    } else if (name === 'NotFoundError' || name === 'DevicesNotFoundError' || name === 'OverconstrainedError') {
      err.code = 'NO_DEVICE';
      err.message = 'No microphone was found. Plug one in, or check your system sound settings, then reload.';
    } else if (name === 'NotReadableError' || name === 'TrackStartError') {
      err.code = 'BUSY';
      err.message = 'Your microphone is already in use by another app or tab. Close it, then try again.';
    } else {
      err.code = 'UNSUPPORTED';
      err.message = 'Recording could not start on this browser. Try Chrome, Edge, or Safari, and make sure the page is on https.';
    }
    err.cause = e;
    return err;
  }

  function createRecorder(opts) {
    const { onLevel, onTick, onAutoStop, maxMs = 180000 } = opts || {};

    let stream = null;
    let recorder = null;
    let chunks = [];
    let startedAt = 0;
    let tickHandle = null;
    let rafHandle = null;
    let audioCtx = null;
    let analyser = null;
    let srcNode = null;
    let stopping = null;      // Promise resolver bundle
    let pendingTake = null;   // take produced by an auto-stop, not yet claimed
    let usedMime = '';
    let cancelled = false;

    function teardown() {
      if (tickHandle) { clearInterval(tickHandle); tickHandle = null; }
      if (rafHandle)  { cancelAnimationFrame(rafHandle); rafHandle = null; }
      try { if (srcNode) srcNode.disconnect(); } catch (_) {}
      try { if (analyser) analyser.disconnect(); } catch (_) {}
      // Safari leaks the mic indicator unless every track is stopped.
      try { if (stream) stream.getTracks().forEach(t => t.stop()); } catch (_) {}
      try { if (audioCtx && audioCtx.state !== 'closed') audioCtx.close(); } catch (_) {}
      srcNode = null; analyser = null; audioCtx = null; stream = null;
    }

    function startLevelMeter() {
      if (typeof onLevel !== 'function') return;
      const Ctx = global.AudioContext || global.webkitAudioContext;
      if (!Ctx) return;
      try {
        audioCtx = new Ctx();
        // Safari starts the context suspended until a user gesture.
        if (audioCtx.state === 'suspended' && audioCtx.resume) audioCtx.resume().catch(() => {});
        srcNode  = audioCtx.createMediaStreamSource(stream);
        analyser = audioCtx.createAnalyser();
        analyser.fftSize = 512;
        srcNode.connect(analyser);
        const buf = new Uint8Array(analyser.fftSize);
        const loop = () => {
          if (!analyser) return;
          analyser.getByteTimeDomainData(buf);
          let peak = 0;
          for (let i = 0; i < buf.length; i++) {
            const v = Math.abs(buf[i] - 128) / 128;
            if (v > peak) peak = v;
          }
          // Light compression so quiet speech still moves the bar.
          try { onLevel(Math.min(1, Math.pow(peak, 0.6) * 1.35)); } catch (_) {}
          rafHandle = requestAnimationFrame(loop);
        };
        rafHandle = requestAnimationFrame(loop);
      } catch (_) { /* metering is a nicety, never fatal */ }
    }

    async function start() {
      const s = support();
      if (!s.ok) {
        const err = new Error(
          s.reason === 'INSECURE_CONTEXT'
            ? 'Recording needs a secure connection. Open this page over https (or on localhost) and try again.'
            : 'This browser cannot record audio. Try Chrome, Edge, or Safari.'
        );
        err.code = s.reason === 'INSECURE_CONTEXT' ? 'INSECURE_CONTEXT' : 'UNSUPPORTED';
        throw err;
      }

      cancelled = false;
      chunks = [];
      pendingTake = null;

      try {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        });
      } catch (e) {
        throw mapGumError(e);
      }

      const preferred = pickMime();
      try {
        recorder = preferred
          ? new MediaRecorder(stream, { mimeType: preferred })
          : new MediaRecorder(stream);
      } catch (_) {
        // Some builds reject the options object outright.
        try { recorder = new MediaRecorder(stream); }
        catch (e2) { teardown(); throw mapGumError(e2); }
      }
      usedMime = recorder.mimeType || preferred || '';

      recorder.addEventListener('dataavailable', (e) => {
        if (e.data && e.data.size > 0) chunks.push(e.data);
      });

      recorder.addEventListener('stop', async () => {
        const durationMs = Date.now() - startedAt;
        teardown();
        // A genuine cancel() throws the audio away. Everything else must
        // produce a take — including the maxMs auto-stop, where nobody
        // has called stop() yet so there is no promise to resolve. If we
        // bailed here (as an earlier version did) the student would hit
        // the time cap and silently lose the whole recording.
        if (cancelled) { chunks = []; return; }
        const type = usedMime || (chunks[0] && chunks[0].type) || 'audio/webm';
        const blob = new Blob(chunks, { type });
        chunks = [];
        let take;
        try {
          take = {
            blob,
            url: URL.createObjectURL(blob),
            mimeType: type,
            durationMs,
            base64: await blobToBase64(blob),
          };
        } catch (e) {
          if (stopping) { stopping.reject(e); stopping = null; }
          return;
        }
        if (stopping) {
          stopping.resolve(take);
          stopping = null;
        } else {
          // Auto-stopped. Hold the take so a later stop() still gets it,
          // and tell the page so it can render playback immediately.
          pendingTake = take;
          if (typeof onAutoStop === 'function') {
            try { onAutoStop(take); } catch (_) {}
          }
        }
      });

      // timeslice keeps Safari flushing data instead of buffering it all
      // into a single chunk it sometimes never emits on long takes.
      try { recorder.start(1000); } catch (_) { recorder.start(); }
      startedAt = Date.now();

      startLevelMeter();

      if (typeof onTick === 'function') {
        tickHandle = setInterval(() => {
          const ms = Date.now() - startedAt;
          try { onTick(ms); } catch (_) {}
          if (maxMs && ms >= maxMs && recorder && recorder.state === 'recording') {
            try { recorder.stop(); } catch (_) {}
          }
        }, 200);
      } else if (maxMs) {
        tickHandle = setInterval(() => {
          if (Date.now() - startedAt >= maxMs && recorder && recorder.state === 'recording') {
            try { recorder.stop(); } catch (_) {}
          }
        }, 500);
      }

      return true;
    }

    function stop() {
      return new Promise((resolve, reject) => {
        // Already auto-stopped at the time cap: hand over that take
        // rather than pretending nothing was recorded.
        if (pendingTake) { const t = pendingTake; pendingTake = null; resolve(t); return; }
        if (!recorder || recorder.state === 'inactive') {
          reject(Object.assign(new Error('Nothing is being recorded.'), { code: 'NOT_RECORDING' }));
          return;
        }
        stopping = { resolve, reject };
        try { recorder.stop(); }
        catch (e) { stopping = null; teardown(); reject(e); }
      });
    }

    function cancel() {
      cancelled = true;
      stopping = null;
      pendingTake = null;
      try { if (recorder && recorder.state !== 'inactive') recorder.stop(); } catch (_) {}
      teardown();
      chunks = [];
    }

    function isRecording() {
      return !!(recorder && recorder.state === 'recording');
    }

    return { start, stop, cancel, isRecording, get mimeType() { return usedMime; } };
  }

  global.JglAudio = { support, createRecorder, geminiMime, blobToBase64, CANDIDATES };
})(typeof window !== 'undefined' ? window : globalThis);
