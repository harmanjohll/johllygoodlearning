/* =========================================================
   /studio/shared/gemini.js
   Single Gemini API wrapper. Replaces duplicated fetches in
   assess/explain/structured and the LLMQuizEngine.
   Exposes window.askGemini — browser-global, no module system.
   ========================================================= */

(function (global) {
  const DEFAULT_MODEL = 'gemini-2.5-flash';
  const BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models';

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
