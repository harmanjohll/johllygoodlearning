/* =========================================================
   /studio/shared/gemini.js
   Single Gemini API wrapper. Replaces duplicated fetches in
   assess/explain/structured and the LLMQuizEngine.
   Exposes window.askGemini — browser-global, no module system.
   ========================================================= */

(function (global) {
  // Model selection.
  //
  // gemini-2.5-flash began returning HTTP 404 "no longer available" on
  // 9 July 2026 — ahead of its own published 16 October shutdown date —
  // which silently killed every AI feature in this studio, including the
  // Test Key button, which then reported valid keys as broken. So we do
  // not trust any single hardcoded id to stay alive.
  //
  // Order: an explicit arg, then a user override, then whatever last
  // worked on this device, then the current default, then a rolling
  // alias Google repoints on each Flash release, then older generations.
  // A retirement 404 walks to the next candidate and the winner is
  // remembered, so the studio heals itself without an edit.
  const DEFAULT_MODEL = 'gemini-3.6-flash';
  const FALLBACK_MODELS = ['gemini-flash-latest', 'gemini-3.5-flash', 'gemini-2.0-flash'];
  const MODEL_PREF_KEY  = 'jgl.geminiModel';
  const MODEL_OK_KEY    = 'jgl.geminiModelOk';
  const BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models';

  function lsGet(k) { try { return localStorage.getItem(k) || ''; } catch (_) { return ''; } }
  function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (_) {} }

  function isRetiredModelError(status, message) {
    if (status !== 404) return false;
    const m = String(message || '').toLowerCase();
    return m.indexOf('no longer available') !== -1 ||
           m.indexOf('not found') !== -1 ||
           m.indexOf('is not supported') !== -1 ||
           m.indexOf('deprecated') !== -1;
  }

  function modelCandidates(explicit) {
    const list = [explicit, lsGet(MODEL_PREF_KEY), lsGet(MODEL_OK_KEY), DEFAULT_MODEL].concat(FALLBACK_MODELS);
    const seen = {};
    return list.filter(m => m && !seen[m] && (seen[m] = true));
  }

  function resolveKey() {
    // JglStorage is the canonical reader (checks both jgl.geminiKey
    // and sciLab_gemini_key). Fall back to AIConfig (which itself
    // now delegates to JglStorage when present), then to raw
    // localStorage if neither module has loaded.
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
    // If both { and [ appear, pick whichever opens first so array
    // wrappers aren't swallowed by an inner object match.
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
      thinkingBudget,            // number | undefined. 0 disables extended
                                 // thinking on gemini-2.5 models so short
                                 // replies do not get clipped by the
                                 // thinking budget eating maxOutputTokens.
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

    // Walk the candidate models. A retirement 404 means that id is gone,
    // so try the next. Anything else (bad key, rate limit, network) fails
    // immediately — retrying another model would not help and burns quota.
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
