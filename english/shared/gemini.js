/* =========================================================
   /english/shared/gemini.js
   Single Gemini API wrapper, identical to /malay/shared/gemini.js
   and /studio/shared/gemini.js. Exposes window.askGemini.
   ========================================================= */

(function (global) {
  if (typeof global.askGemini === 'function') return;

  // Model selection.
  //
  // gemini-2.5-flash began returning HTTP 404 "no longer available" on
  // 9 July 2026 — earlier than its own published 16 October shutdown
  // date — which silently killed every AI feature in this studio. So we
  // do not trust any single hardcoded id to stay alive.
  //
  // Order: an explicit user override, then the current default, then a
  // rolling alias that Google repoints on each Flash release, then the
  // previous generation. On a retirement 404 we walk down the list and
  // remember what worked, so the studio heals itself without an edit.
  const DEFAULT_MODEL = 'gemini-3.6-flash';
  const FALLBACK_MODELS = ['gemini-flash-latest', 'gemini-3.5-flash', 'gemini-2.0-flash'];
  const MODEL_PREF_KEY  = 'jgl.geminiModel';   // user override, set in Settings
  const MODEL_OK_KEY    = 'jgl.geminiModelOk'; // last id known to work
  const BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models';

  function lsGet(k) { try { return localStorage.getItem(k) || ''; } catch (_) { return ''; } }
  function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (_) {} }

  // A 404 that means "this model is retired", as opposed to a bad path.
  function isRetiredModelError(status, message) {
    if (status !== 404) return false;
    const m = String(message || '').toLowerCase();
    return m.indexOf('no longer available') !== -1 ||
           m.indexOf('not found') !== -1 ||
           m.indexOf('is not supported') !== -1 ||
           m.indexOf('deprecated') !== -1;
  }

  // Candidate order for this call, de-duplicated, honouring any override
  // and any id we have already proved works on this device.
  function modelCandidates(explicit) {
    const known = lsGet(MODEL_OK_KEY);
    const pref  = lsGet(MODEL_PREF_KEY);
    const list  = [explicit, pref, known, DEFAULT_MODEL].concat(FALLBACK_MODELS);
    const seen = {};
    return list.filter(m => m && !seen[m] && (seen[m] = true));
  }

  function resolveKey() {
    if (global.JglStorage && typeof global.JglStorage.getGeminiKey === 'function') {
      const k = global.JglStorage.getGeminiKey();
      if (k) return k;
    }
    if (global.AIConfig && typeof global.AIConfig.getKey === 'function') {
      const k = global.AIConfig.getKey();
      if (k) return k;
    }
    return localStorage.getItem('jgl.geminiKey') || localStorage.getItem('sciLab_gemini_key') || '';
  }

  function extractText(data) {
    const parts = data.candidates?.[0]?.content?.parts || [];
    return parts.filter(p => !p.thought).map(p => p.text || '').join('');
  }

  function parseJsonLoose(text) {
    try { return JSON.parse(text); } catch (_) { /* fall through */ }
    const firstObj = text.indexOf('{');
    const firstArr = text.indexOf('[');
    const candidates = [];
    if (firstArr !== -1 && (firstArr < firstObj || firstObj === -1)) {
      candidates.push(text.match(/\[[\s\S]*\]/));
      candidates.push(text.match(/\{[\s\S]*\}/));
    } else {
      candidates.push(text.match(/\{[\s\S]*\}/));
      candidates.push(text.match(/\[[\s\S]*\]/));
    }
    for (const m of candidates) {
      if (!m) continue;
      try { return JSON.parse(m[0]); } catch (_) {}
    }
    throw new Error('Unexpected response format from Gemini.');
  }

  // Gemini accepts these inline image containers.
  const IMAGE_MIMES = ['image/png', 'image/jpeg', 'image/webp', 'image/heic', 'image/heif'];

  function normaliseImageMime(mt) {
    const m = String(mt || '').toLowerCase().split(';')[0].trim();
    if (IMAGE_MIMES.indexOf(m) !== -1) return m;
    if (m.indexOf('jpg') !== -1 || m.indexOf('jpeg') !== -1) return 'image/jpeg';
    if (m.indexOf('png')  !== -1) return 'image/png';
    if (m.indexOf('webp') !== -1) return 'image/webp';
    if (m.indexOf('heic') !== -1) return 'image/heic';
    if (m.indexOf('heif') !== -1) return 'image/heif';
    return 'image/jpeg';
  }

  // Gemini accepts these inline audio containers. Anything else gets
  // coerced to the closest match rather than rejected outright.
  const AUDIO_MIMES = ['audio/wav', 'audio/mp3', 'audio/mpeg', 'audio/aiff', 'audio/aac', 'audio/ogg', 'audio/flac', 'audio/webm', 'audio/mp4'];

  function normaliseAudioMime(mt) {
    const m = String(mt || '').toLowerCase().split(';')[0].trim();
    if (AUDIO_MIMES.indexOf(m) !== -1) return m;
    if (m.indexOf('webm') !== -1) return 'audio/webm';
    if (m.indexOf('ogg')  !== -1) return 'audio/ogg';
    if (m.indexOf('mp4')  !== -1 || m.indexOf('m4a') !== -1) return 'audio/mp4';
    if (m.indexOf('aac')  !== -1) return 'audio/aac';
    if (m.indexOf('wav')  !== -1) return 'audio/wav';
    if (m.indexOf('mp3')  !== -1) return 'audio/mp3';
    return 'audio/mp4';
  }

  async function askGemini(opts) {
    const {
      prompt,
      system,
      messages,
      temperature = 0.6,
      maxTokens = 800,
      model = DEFAULT_MODEL,
      responseMimeType,
      asJson = false,
      thinkingBudget,
      audio,   // { base64, mimeType } — raw base64, no data: prefix
      image,   // { base64, mimeType } — a real photograph for SBC / Visual Text
    } = opts || {};

    const key = resolveKey();
    if (!key) {
      const err = new Error('No Gemini key set. Open Settings to add one.');
      err.code = 'NO_KEY';
      throw err;
    }

    let contents;
    if (Array.isArray(messages) && messages.length) {
      contents = messages.map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      }));
    } else {
      contents = [{ parts: [{ text: String(prompt || '') }] }];
    }

    // Inline audio. The audio part goes FIRST so the model has the
    // recording in context before it reads the marking instructions.
    // Strips a data: prefix if the caller forgot to.
    if (audio && audio.base64) {
      const raw = String(audio.base64);
      const comma = raw.indexOf('base64,');
      const data = comma === -1 ? raw : raw.slice(comma + 7);
      const target = contents[contents.length - 1];
      target.parts = [
        { inlineData: { mimeType: normaliseAudioMime(audio.mimeType), data } },
      ].concat(target.parts || []);
      // ~1MB of base64 per 10s of Opus; the request ceiling is ~20MB.
      if (data.length > 18 * 1024 * 1024) {
        const err = new Error('That recording is too long to send. Keep takes under about three minutes.');
        err.code = 'AUDIO_TOO_LARGE';
        throw err;
      }
    }
    // Inline image. Like audio, the media part goes FIRST so the model
    // has the picture in context before it reads the instructions. This
    // is what lets SBC and Visual Text run on a REAL photograph — the
    // student looks at the same image the model does, instead of
    // reading a description that has already done the noticing for them.
    if (image && image.base64) {
      const rawI = String(image.base64);
      const commaI = rawI.indexOf('base64,');
      const dataI = commaI === -1 ? rawI : rawI.slice(commaI + 7);
      if (dataI.length > 18 * 1024 * 1024) {
        const err = new Error('That picture is too large to send. Use one under about 12MB.');
        err.code = 'IMAGE_TOO_LARGE';
        throw err;
      }
      const targetI = contents[contents.length - 1];
      targetI.parts = [{ inlineData: { mimeType: normaliseImageMime(image.mimeType), data: dataI } }].concat(targetI.parts || []);
    }


    // thinkingConfig is only understood by the newer models. Older fallbacks
    // such as gemini-2.0-flash reject the whole request with
    // 400 INVALID_ARGUMENT ("request contains an invalid argument"), so it is
    // built separately and dropped on a 400 retry rather than baked in.
    function buildBody(withThinking) {
      const b = {
        contents,
        generationConfig: {
          temperature,
          maxOutputTokens: maxTokens,
          ...(responseMimeType ? { responseMimeType } : {}),
          ...(withThinking && typeof thinkingBudget === 'number'
            ? { thinkingConfig: { thinkingBudget } } : {}),
        },
      };
      if (system) b.systemInstruction = { parts: [{ text: system }] };
      return b;
    }
    const body = buildBody(true);

    // Walk the candidate models. A retirement 404 is not a failure — it
    // means that id is gone, so try the next one. Anything else (bad key,
    // rate limit, network) fails immediately, because retrying a
    // different model would not help and would burn quota.
    const candidates = modelCandidates(opts && opts.model);
    let lastErr = null;

    for (let i = 0; i < candidates.length; i++) {
      const candidate = candidates[i];
      const url = `${BASE_URL}/${encodeURIComponent(candidate)}:generateContent?key=${encodeURIComponent(key)}`;

      let resp;
      try {
        resp = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        // "Request contains an invalid argument" is almost always a config key
        // this model does not know, and thinkingConfig is the usual culprit.
        // Retry the same model once without it before giving up on it.
        if (resp.status === 400 && typeof thinkingBudget === 'number') {
          resp = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(buildBody(false)),
          });
        }
      } catch (networkErr) {
        const err = new Error('Could not reach Gemini. Check your internet connection.');
        err.code = 'NETWORK';
        err.cause = networkErr;
        throw err;
      }

      if (resp.ok) {
        if (lsGet(MODEL_OK_KEY) !== candidate) lsSet(MODEL_OK_KEY, candidate);
        const data = await resp.json();
        const text = extractText(data);
        return asJson ? parseJsonLoose(text) : text;
      }

      const payload = await resp.json().catch(() => ({}));
      const msg = (payload.error && payload.error.message) || `API error ${resp.status}`;

      if (isRetiredModelError(resp.status, msg) && i < candidates.length - 1) {
        // This id is gone. Forget it if we had cached it, and try the next.
        if (lsGet(MODEL_OK_KEY) === candidate) lsSet(MODEL_OK_KEY, '');
        lastErr = msg;
        continue;
      }

      // A 400 that survived the no-thinking retry means this model cannot
      // serve this request at all. Move to the next candidate rather than
      // showing the student a raw API string.
      if (resp.status === 400 && i < candidates.length - 1) {
        if (lsGet(MODEL_OK_KEY) === candidate) lsSet(MODEL_OK_KEY, '');
        lastErr = msg;
        continue;
      }

      const err = new Error(msg);
      err.code = resp.status === 429 ? 'RATE_LIMIT'
               : resp.status === 404 ? 'MODEL_GONE'
               : 'API_ERROR';
      err.status = resp.status;
      throw err;
    }

    const err = new Error(
      'None of the available Gemini models responded. Google may have retired the model this app uses. ' +
      'Last message: ' + (lastErr || 'unknown') + '. Tried: ' + candidates.join(', ') + '.'
    );
    err.code = 'MODEL_GONE';
    throw err;
  }

  global.askGemini = askGemini;
})(typeof window !== 'undefined' ? window : globalThis);
