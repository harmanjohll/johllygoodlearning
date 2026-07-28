/* =========================================================
   /english/shared/imagein.js
   Real-photograph input for the stimulus-based modes.

   Why this exists: PSLE English Paper 4 SBC shows the student an
   actual PHOTOGRAPH (real-life photos replaced drawings and posters
   in 2025), and Paper 2 Visual Text prints a real poster. Practising
   against a written description defeats the point of Q1 — the skill
   being tested is noticing things in an image, and a description has
   already done the noticing for you.

   We cannot ship copyrighted photos into a public repo, so instead the
   student supplies the image: camera, file picker, drag-and-drop, or
   paste. Gemini sees the same picture they do.

   Everything is client-side. The picture is downscaled in a canvas
   before it is encoded, which keeps the request small and, incidentally,
   means the original full-resolution file never leaves the device.

   Exposes window.JglImageIn:
     JglImageIn.mount(hostEl, { onPick(pic), label, hint })  -> controller
     JglImageIn.fromFile(file)                               -> Promise<pic>
     pic = { base64, mimeType, url, width, height, bytes, name }
   ========================================================= */

(function (global) {
  if (global.JglImageIn) return;

  const MAX_EDGE = 1280;   // plenty for Gemini to read a scene or a poster
  const QUALITY  = 0.82;
  const ACCEPT   = 'image/png,image/jpeg,image/jpg,image/webp,image/heic,image/heif';

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, c =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  // Draw into a canvas at a bounded size, then re-encode. Also strips
  // EXIF (including any GPS tags) as a side effect of the redraw, which
  // matters because these are often family photos.
  function downscale(img, mimeHint) {
    const w = img.naturalWidth || img.width;
    const h = img.naturalHeight || img.height;
    const scale = Math.min(1, MAX_EDGE / Math.max(w, h));
    const cw = Math.max(1, Math.round(w * scale));
    const ch = Math.max(1, Math.round(h * scale));

    const canvas = document.createElement('canvas');
    canvas.width = cw; canvas.height = ch;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, cw, ch);

    // HEIC/HEIF cannot be re-encoded by canvas on most browsers, and PNG
    // screenshots of posters keep text crisper. Everything else -> JPEG.
    const outMime = /png/i.test(mimeHint || '') ? 'image/png' : 'image/jpeg';
    const dataUrl = canvas.toDataURL(outMime, QUALITY);
    return { dataUrl, mimeType: outMime, width: cw, height: ch };
  }

  function fromFile(file) {
    return new Promise((resolve, reject) => {
      if (!file) { reject(new Error('No picture chosen.')); return; }
      if (!/^image\//.test(file.type) && !/\.(jpe?g|png|webp|heic|heif)$/i.test(file.name || '')) {
        reject(Object.assign(new Error('That file is not a picture. Choose a JPG, PNG or WEBP.'), { code: 'NOT_IMAGE' }));
        return;
      }
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        let out;
        try { out = downscale(img, file.type); }
        catch (e) {
          URL.revokeObjectURL(url);
          reject(Object.assign(new Error('That picture could not be read. Some iPhone HEIC photos need to be saved as JPG first.'), { code: 'DECODE_FAILED' }));
          return;
        }
        URL.revokeObjectURL(url);
        const comma = out.dataUrl.indexOf(',');
        const base64 = comma === -1 ? out.dataUrl : out.dataUrl.slice(comma + 1);
        resolve({
          base64,
          mimeType: out.mimeType,
          url: out.dataUrl,
          width: out.width,
          height: out.height,
          bytes: Math.round(base64.length * 3 / 4),
          name: file.name || 'picture',
        });
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(Object.assign(new Error('That picture could not be opened. If it came from an iPhone, save it as JPG and try again.'), { code: 'DECODE_FAILED' }));
      };
      img.src = url;
    });
  }

  function mount(host, opts) {
    const { onPick, label, hint } = opts || {};
    if (!host) return null;

    const id = 'imgin-' + Math.random().toString(36).slice(2, 8);
    host.innerHTML = `
      <div class="imgin" id="${id}" style="background:var(--card);border:1px dashed var(--border);border-radius:12px;padding:1rem 1.15rem;">
        <div style="display:flex;align-items:baseline;gap:.55rem;flex-wrap:wrap;margin-bottom:.4rem;">
          <span style="font-size:.66rem;color:var(--accent);text-transform:uppercase;letter-spacing:.07em;font-weight:800;">📷 ${esc(label || 'Your picture')}</span>
        </div>
        <p style="font-size:.83rem;color:var(--muted);line-height:1.6;margin-bottom:.7rem;">
          ${esc(hint || 'Use a real photograph, the way the examiner will. Take one now, pick one from this device, drag one in, or paste one.')}
        </p>
        <div style="display:flex;gap:.5rem;flex-wrap:wrap;align-items:center;">
          <button type="button" class="btn btn-primary" data-act="camera" style="font-size:.8rem;padding:.42rem .85rem;">Take a photo</button>
          <button type="button" class="btn btn-secondary" data-act="file" style="font-size:.8rem;padding:.42rem .85rem;">Choose a picture</button>
          <span data-role="status" style="font-size:.78rem;color:var(--muted);"></span>
        </div>
        <input type="file" data-role="file-input"   accept="${ACCEPT}" style="display:none;">
        <input type="file" data-role="camera-input" accept="image/*" capture="environment" style="display:none;">
        <div data-role="preview" style="margin-top:.8rem;"></div>
      </div>
    `;

    const root    = host.querySelector('.imgin');
    const fileIn  = root.querySelector('[data-role="file-input"]');
    const camIn   = root.querySelector('[data-role="camera-input"]');
    const status  = root.querySelector('[data-role="status"]');
    const preview = root.querySelector('[data-role="preview"]');
    let current = null;

    function fail(e) {
      status.style.color = '#f87171';
      status.textContent = (e && e.message) ? e.message : 'That picture could not be used.';
    }

    function accept(pic) {
      current = pic;
      status.style.color = 'var(--accent)';
      status.textContent = pic.width + '×' + pic.height + ' · ' + Math.round(pic.bytes / 1024) + ' KB';
      preview.innerHTML =
        '<img src="' + pic.url + '" alt="The picture you chose" ' +
        'style="max-width:100%;border-radius:9px;border:1px solid var(--border);display:block;">' +
        '<div style="font-size:.74rem;color:var(--muted);margin-top:.4rem;">' +
        'Stays on this device apart from the one request that asks the examiner to look at it.</div>';
      root.style.borderStyle = 'solid';
      if (typeof onPick === 'function') { try { onPick(pic); } catch (_) {} }
    }

    function handleFile(f) {
      status.style.color = 'var(--muted)';
      status.textContent = 'Reading the picture…';
      fromFile(f).then(accept).catch(fail);
    }

    root.querySelector('[data-act="file"]').addEventListener('click', () => fileIn.click());
    root.querySelector('[data-act="camera"]').addEventListener('click', () => {
      // capture= is honoured on phones; on a laptop this just opens the
      // normal picker, which is the sensible fallback.
      camIn.click();
    });
    fileIn.addEventListener('change', e => { if (e.target.files && e.target.files[0]) handleFile(e.target.files[0]); });
    camIn.addEventListener('change',  e => { if (e.target.files && e.target.files[0]) handleFile(e.target.files[0]); });

    ['dragenter', 'dragover'].forEach(ev => root.addEventListener(ev, e => {
      e.preventDefault(); e.stopPropagation();
      root.style.borderColor = 'var(--accent)';
    }));
    ['dragleave', 'drop'].forEach(ev => root.addEventListener(ev, e => {
      e.preventDefault(); e.stopPropagation();
      root.style.borderColor = 'var(--border)';
    }));
    root.addEventListener('drop', e => {
      const f = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
      if (f) handleFile(f);
    });

    // Paste works nicely on a laptop: screenshot a poster, then Ctrl+V.
    function onPaste(e) {
      const items = (e.clipboardData && e.clipboardData.items) || [];
      for (let i = 0; i < items.length; i++) {
        if (items[i].type && items[i].type.indexOf('image') === 0) {
          const f = items[i].getAsFile();
          if (f) { handleFile(f); e.preventDefault(); return; }
        }
      }
    }
    document.addEventListener('paste', onPaste);

    return {
      get: () => current,
      clear() {
        current = null;
        preview.innerHTML = '';
        status.textContent = '';
        root.style.borderStyle = 'dashed';
        fileIn.value = ''; camIn.value = '';
      },
      destroy() { document.removeEventListener('paste', onPaste); },
    };
  }

  global.JglImageIn = { mount, fromFile, MAX_EDGE };
})(typeof window !== 'undefined' ? window : globalThis);
