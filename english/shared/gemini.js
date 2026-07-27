/* =========================================================
   /english/shared/gemini.js
   Single Gemini API wrapper, identical to /malay/shared/gemini.js
   and /studio/shared/gemini.js. Exposes window.askGemini.
   ========================================================= */

(function (global) {
  if (typeof global.askGemini === 'function') return;

  const DEFAULT_MODEL = 'gemini-2.5-flash';
  const BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models';

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

    const body = {
      contents,
      generationConfig: {
        temperature,
        maxOutputTokens: maxTokens,
        ...(responseMimeType ? { responseMimeType } : {}),
        ...(typeof thinkingBudget === 'number' ? { thinkingConfig: { thinkingBudget } } : {}),
      },
    };
    if (system) body.systemInstruction = { parts: [{ text: system }] };

    const url = `${BASE_URL}/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(key)}`;

    let resp;
    try {
      resp = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
    } catch (networkErr) {
      const err = new Error('Could not reach Gemini. Check your internet connection.');
      err.code = 'NETWORK';
      err.cause = networkErr;
      throw err;
    }

    if (!resp.ok) {
      const payload = await resp.json().catch(() => ({}));
      const msg = payload.error?.message || `API error ${resp.status}`;
      const err = new Error(msg);
      err.code = resp.status === 429 ? 'RATE_LIMIT' : 'API_ERROR';
      err.status = resp.status;
      throw err;
    }

    const data = await resp.json();
    const text = extractText(data);
    return asJson ? parseJsonLoose(text) : text;
  }

  global.askGemini = askGemini;
})(typeof window !== 'undefined' ? window : globalThis);
