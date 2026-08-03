// ============================================================
//  AI CORE — Gemini wrapper for Nasworld.
//
//  Design rules (non-negotiable):
//  1. The app MUST work perfectly with no key and no internet.
//     AI is a topping, never the cake. Every AI path has a local
//     fallback that fires instantly.
//  2. A child never waits on a network call. Questions are
//     pre-fetched in the background and queued; if the queue is
//     empty we serve a local generator question immediately.
//  3. Output is forced into the EXACT question shapes the existing
//     renderers already understand (see math-render.js dispatch).
//  4. Content is age-locked by the system prompt and re-validated
//     locally before it is ever shown.
// ============================================================

var AI_KEY_STORAGE = 'nas.geminiKey';
var AI_MODEL_STORAGE = 'nas.geminiModel';
var AI_DEFAULT_MODEL = 'gemini-2.5-flash';

function aiGetKey() {
  try { return localStorage.getItem(AI_KEY_STORAGE) || ''; } catch (e) { return ''; }
}
function aiSetKey(key) {
  try {
    if (key) localStorage.setItem(AI_KEY_STORAGE, key.trim());
    else localStorage.removeItem(AI_KEY_STORAGE);
  } catch (e) {}
}
function aiGetModel() {
  try { return localStorage.getItem(AI_MODEL_STORAGE) || AI_DEFAULT_MODEL; } catch (e) { return AI_DEFAULT_MODEL; }
}
function aiSetModel(m) {
  try { localStorage.setItem(AI_MODEL_STORAGE, m || AI_DEFAULT_MODEL); } catch (e) {}
}
function aiEnabled() {
  return !!aiGetKey() && navigator.onLine !== false && !aiInCooldown();
}

// ---- Core fetch wrapper -------------------------------------------------

/**
 * Ask Gemini for JSON. Returns a parsed object, or throws.
 * responseSchema forces structured output so we never parse prose.
 */
function askGeminiJSON(opts) {
  var key = aiGetKey();
  if (!key) return Promise.reject(new Error('no-key'));

  var model = opts.model || aiGetModel();
  var url = 'https://generativelanguage.googleapis.com/v1beta/models/' +
    model + ':generateContent?key=' + encodeURIComponent(key);

  var body = {
    systemInstruction: opts.system ? { parts: [{ text: opts.system }] } : undefined,
    contents: [{ role: 'user', parts: [{ text: opts.prompt }] }],
    generationConfig: {
      temperature: opts.temperature != null ? opts.temperature : 0.9,
      maxOutputTokens: opts.maxTokens || 2048,
      responseMimeType: 'application/json',
      responseSchema: opts.schema
    },
    safetySettings: [
      { category: 'HARM_CATEGORY_HARASSMENT',        threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      { category: 'HARM_CATEGORY_HATE_SPEECH',       threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_LOW_AND_ABOVE' },
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' }
    ]
  };

  var controller = new AbortController();
  var timeout = setTimeout(function() { controller.abort(); }, opts.timeoutMs || 20000);

  return fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal: controller.signal
  }).then(function(res) {
    clearTimeout(timeout);
    if (!res.ok) {
      return res.text().then(function(t) {
        throw new Error('gemini-' + res.status + ': ' + t.slice(0, 200));
      });
    }
    return res.json();
  }).then(function(data) {
    var text = data &&
      data.candidates &&
      data.candidates[0] &&
      data.candidates[0].content &&
      data.candidates[0].content.parts &&
      data.candidates[0].content.parts[0] &&
      data.candidates[0].content.parts[0].text;
    if (!text) throw new Error('empty-response');
    return JSON.parse(text);
  });
}

// ---- Kid-safety system prompt ------------------------------------------

function aiSystemPrompt() {
  var name = (typeof state !== 'undefined' && state.name) ? state.name : 'Anastasia';
  return [
    'You write primary-school MATHEMATICS questions for the Singapore MOE syllabus.',
    'The learner is a 6 to 7 year old girl named ' + name + '. She is in Primary 1 in Singapore.',
    'Her family is Singaporean and Russian. She likes animals, flowers, space, and her family.',
    '',
    'ABSOLUTE RULES:',
    '1. Every question must be solvable by a Primary 1-4 child using ONLY the arithmetic stated in the request.',
    '2. Numbers must stay inside the stated range. Never produce a negative answer for addition/subtraction questions.',
    '3. Use Singapore contexts naturally: hawker centre, MRT, void deck, kopi, nasi lemak, Singapore dollars and cents.',
    '4. Language must be simple. Short sentences. A 6 year old must be able to read it.',
    '5. Absolutely no violence, death, injury, money worries, family conflict, dieting, or anything frightening.',
    '6. Never mention that you are an AI. Never address the child directly with instructions beyond the question.',
    '7. The answer field must be the exact final numeric answer with no units and no words, unless the schema says otherwise.',
    '8. Double-check your own arithmetic before answering. A wrong answer key is the worst possible failure.',
    '',
    'Return ONLY valid JSON matching the provided schema.'
  ].join('\n');
}

// ---- Local validation (never trust the model) --------------------------

/**
 * Check the model's own working and confirm it produces the answer it
 * claims. A wrong answer key is the worst failure mode in the whole
 * app: the child solves it correctly and is told she is wrong. Any
 * question whose working does not evaluate to its answer is discarded.
 *
 * Returns true if verified OR if the working is not machine-checkable
 * (we do not throw away a good question just because we cannot parse
 * its prose) — but a working that IS parseable and disagrees is fatal.
 */
function aiVerifyArithmetic(raw) {
  if (!raw || !raw.working) return true;          // nothing to check
  var expr = String(raw.working);

  // Take the last "= <number>" as the claimed result of the chain.
  var parts = expr.split('=');
  if (parts.length < 2) return true;
  var claimed = Number(String(parts[parts.length - 1]).replace(/[^0-9.\-]/g, ''));
  if (!isFinite(claimed)) return true;

  // The answer must match what the working says it is.
  if (Math.abs(claimed - Number(raw.answer)) > 1e-9) return false;

  // Evaluate each "a OP b = c" step ourselves. No eval: a strict
  // tokenizer, so nothing from the model is ever executed.
  var ok = true;
  parts.forEach(function(seg, i) {
    if (i >= parts.length - 1) return;
    var m = String(seg).match(/(-?\d+(?:\.\d+)?)\s*([+\-x*×\/÷])\s*(-?\d+(?:\.\d+)?)\s*$/);
    if (!m) return;                                // unparseable step: skip
    var a = Number(m[1]), op = m[2], b = Number(m[3]);
    var next = Number(String(parts[i + 1]).replace(/[^0-9.\-]/g, ''));
    if (!isFinite(next)) return;
    var val;
    if (op === '+') val = a + b;
    else if (op === '-') val = a - b;
    else if (op === 'x' || op === '*' || op === '×') val = a * b;
    else if (op === '/' || op === '÷') { if (b === 0) { ok = false; return; } val = a / b; }
    else return;
    if (Math.abs(val - next) > 1e-9) ok = false;
  });
  return ok;
}

/**
 * Reject anything that would confuse or upset a child, or that is
 * arithmetically wrong. Returns true if the question is safe to show.
 */
function aiValidateQuestion(q, constraints) {
  if (!q || typeof q !== 'object') return false;
  if (!q.text || typeof q.text !== 'string') return false;
  if (q.text.length > 300) return false;
  if (q.answer === undefined || q.answer === null || q.answer === '') return false;

  // Answer must be numeric for the question types we request.
  var ans = Number(q.answer);
  if (!isFinite(ans)) return false;
  if (ans < 0) return false;

  // Range guard
  if (constraints && constraints.maxAnswer != null && ans > constraints.maxAnswer) return false;

  // Blocklist — a cheap second line of defence behind the safety settings.
  var banned = /\b(kill|die|died|death|dead|blood|gun|knife|war|hate|stupid|fat|ugly|drunk|beer|wine|sexy|hell|damn)\b/i;
  if (banned.test(q.text)) return false;

  // The text must actually contain a question.
  if (q.text.indexOf('?') === -1) return false;

  // Never show a question whose own working contradicts its answer.
  if (!aiVerifyArithmetic(q)) return false;

  return true;
}

// ---- Question queue (pre-fetch so nobody waits) ------------------------

var _aiQueue = {};      // { cacheKey: [question, question, ...] }
var _aiInFlight = {};   // { cacheKey: true }

function _aiCacheKey(skillId, config) {
  return skillId + '|' + JSON.stringify(config || {});
}

/**
 * Pull one AI question if we have a warm one, else null (caller falls
 * back to the local generator instantly). Always triggers a background
 * refill.
 */
function aiTakeQuestion(skillId, config) {
  if (!aiEnabled()) return null;
  var key = _aiCacheKey(skillId, config);
  var q = null;
  if (_aiQueue[key] && _aiQueue[key].length > 0) {
    q = _aiQueue[key].shift();
  }
  // Refill when running low
  if (!_aiQueue[key] || _aiQueue[key].length < 3) {
    aiPrefetch(skillId, config);
  }
  return q;
}

// Circuit breaker. Without this, a bad key or a model that keeps
// returning rejects would retry on EVERY question, billing the parent's
// card in a loop for nothing. Failures back off exponentially and the
// whole AI path goes quiet until the cooldown expires.
var _aiFails = 0;
var _aiCooldownUntil = 0;

function aiInCooldown() { return Date.now() < _aiCooldownUntil; }

/**
 * Fill the queue in the background. Never throws, never blocks.
 */
function aiPrefetch(skillId, config) {
  if (!aiEnabled()) return Promise.resolve();
  if (aiInCooldown()) return Promise.resolve();
  var key = _aiCacheKey(skillId, config);
  if (_aiInFlight[key]) return Promise.resolve();
  if (_aiQueue[key] && _aiQueue[key].length >= 6) return Promise.resolve();
  _aiInFlight[key] = true;

  return aiGenerateWordProblems(skillId, config, 6).then(function(list) {
    if (!_aiQueue[key]) _aiQueue[key] = [];
    list.forEach(function(q) { _aiQueue[key].push(q); });
    _aiInFlight[key] = false;
    _aiFails = 0;                       // recovered
    _aiCooldownUntil = 0;
    if (typeof aiUpdateStatusPill === 'function') aiUpdateStatusPill();
  }).catch(function(err) {
    _aiInFlight[key] = false;
    _aiFails++;
    // 2s, 4s, 8s, 16s, 32s, capped at 60s.
    _aiCooldownUntil = Date.now() + Math.min(60000, 2000 * Math.pow(2, _aiFails - 1));
    _aiNoteError(err);
  });
}

var _aiLastError = null;
function _aiNoteError(err) {
  _aiLastError = (err && err.message) || String(err);
  // A missing/blocked key is worth surfacing once in Settings, but we
  // never interrupt a child mid-quiz over it.
  if (typeof console !== 'undefined') console.warn('[AI]', _aiLastError);
}
function aiLastError() { return _aiLastError; }

// ---- The actual question generator -------------------------------------

var AI_WORD_PROBLEM_SCHEMA = {
  type: 'object',
  properties: {
    questions: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          text:      { type: 'string', description: 'The word problem. One or two short sentences ending in a question.' },
          answer:    { type: 'string', description: 'The final numeric answer only. No units, no words.' },
          hint:      { type: 'string', description: 'One short sentence nudging the child toward the method. Never gives the answer.' },
          working:   { type: 'string', description: 'The arithmetic ONLY, using digits and + - x / and = . For example "7 x 4 = 28" or "20 - 8 = 12". No words.' },
          structure: { type: 'string', description: 'One of: part-whole, comparison, change, groups, rate, before-after' },
          emoji:     { type: 'string', description: 'A single emoji matching the story context.' },
          barA:      { type: 'number', description: 'First quantity in the story, for the bar model.' },
          barB:      { type: 'number', description: 'Second quantity in the story, for the bar model.' },
          barALabel: { type: 'string', description: 'Two or three word label for the first quantity.' },
          barBLabel: { type: 'string', description: 'Two or three word label for the second quantity.' },
          unknownIs: { type: 'string', description: 'Which part the question asks for: "total", "part", or "difference".' }
        },
        required: ['text', 'answer', 'hint', 'working', 'structure', 'emoji',
                   'barA', 'barB', 'barALabel', 'barBLabel', 'unknownIs']
      }
    }
  },
  required: ['questions']
};

/**
 * Ask Gemini for a batch of word problems tuned to a skill + drill config.
 * Returns an array of question objects in the shape renderWordProblem
 * already understands. Rejects silently on failure (caller falls back).
 */
function aiGenerateWordProblems(skillId, config, count) {
  config = config || {};
  count = count || 5;

  var spec = _aiSkillSpec(skillId, config);
  var themeLine = config.theme && config.theme !== 'mixed'
    ? 'Every problem must be set in this theme: ' + config.theme + '.'
    : 'Vary the setting across the batch: home, school, hawker centre, garden, playground, space, animals.';

  var prompt = [
    'Write ' + count + ' DIFFERENT ' + spec.label + ' word problems.',
    '',
    'Mathematical constraint: ' + spec.constraint,
    'Maximum allowed answer: ' + spec.maxAnswer,
    themeLine,
    '',
    'Vary the STRUCTURE across the batch. Use a mix of these Singapore Math structures:',
    '- part-whole (two parts combine into a whole)',
    '- comparison (how many more / fewer)',
    '- change (something is added or taken away over time)',
    '- groups (equal groups, arrays, sharing)',
    '',
    'Each problem must be a different story. Do not reuse the same objects twice in this batch.',
    'Check your arithmetic twice.'
  ].join('\n');

  return askGeminiJSON({
    system: aiSystemPrompt(),
    prompt: prompt,
    schema: AI_WORD_PROBLEM_SCHEMA,
    temperature: 1.0,
    maxTokens: 2048
  }).then(function(data) {
    var out = [];
    (data.questions || []).forEach(function(raw) {
      if (!aiValidateQuestion(raw, { maxAnswer: spec.maxAnswer })) return;
      out.push({
        type: 'word-problem',
        text: raw.text,
        answer: Number(raw.answer),
        hint: raw.hint,
        working: raw.working,
        structure: raw.structure,
        emoji: raw.emoji,
        bar: _aiBuildBar(raw),
        _ai: true
      });
    });
    if (out.length === 0) throw new Error('all-rejected');
    return out;
  });
}

/**
 * Build renderBarModel-compatible data from the model's quantities.
 *
 * Note for anyone editing: `value` must carry the TRUE number even when
 * `unknown: true`, because the renderer sizes the bars from it. The
 * renderer prints "?" for unknown segments, so the number is never
 * shown to the child.
 */
function _aiBuildBar(raw) {
  var a = Number(raw.barA), b = Number(raw.barB);
  if (!isFinite(a) || !isFinite(b) || a < 0 || b < 0) return null;
  var ans = Number(raw.answer);
  var labelA = String(raw.barALabel || 'part').slice(0, 18);
  var labelB = String(raw.barBLabel || 'part').slice(0, 18);

  if (raw.structure === 'comparison' || raw.unknownIs === 'difference') {
    var bigger  = a >= b ? { label: labelA, value: a } : { label: labelB, value: b };
    var smaller = a >= b ? { label: labelB, value: b } : { label: labelA, value: a };
    return {
      style: 'comparison',
      bigger: bigger,
      smaller: smaller,
      difference: { label: 'difference', value: Math.abs(a - b), unknown: raw.unknownIs === 'difference' }
    };
  }
  if (raw.unknownIs === 'part') {
    // Whole is known; one part is being asked for.
    return {
      style: 'part-whole',
      parts: [{ label: labelB, value: b }, { label: 'this part', value: ans, unknown: true }],
      total: { label: labelA, value: a }
    };
  }
  return {
    style: 'part-whole',
    parts: [{ label: labelA, value: a }, { label: labelB, value: b }],
    total: { label: 'altogether', value: a + b, unknown: true }
  };
}

/**
 * Translate a skill + drill config into a plain-English mathematical
 * constraint the model can respect, plus a ceiling for validation.
 */
function _aiSkillSpec(skillId, config) {
  var r = (config && config.numberRange) || null;
  switch (skillId) {
    case 'add':
      return { label: 'addition', constraint: 'Single-step addition of two numbers, each between 1 and ' + (r ? r[1] : 10) + '.', maxAnswer: (r ? r[1] : 10) * 2 };
    case 'sub':
      return { label: 'subtraction', constraint: 'Single-step subtraction. The answer must never be negative. Numbers up to ' + (r ? r[1] : 10) + '.', maxAnswer: (r ? r[1] : 10) };
    case 'add100':
      return { label: 'addition within 100', constraint: 'Addition of two numbers, sum must not exceed 100.', maxAnswer: 100 };
    case 'sub100':
      return { label: 'subtraction within 100', constraint: 'Subtraction within 100. Never negative.', maxAnswer: 100 };
    case 'mul': {
      var tables = (config && config.tables && config.tables.length) ? config.tables : [2, 3, 4, 5, 10];
      return {
        label: 'multiplication',
        constraint: 'Multiplication using ONLY these times tables: ' + tables.join(', ') + '. The other factor must be between 1 and 12.',
        maxAnswer: Math.max.apply(null, tables) * 12
      };
    }
    case 'div': {
      var dv = (config && config.tables && config.tables.length) ? config.tables : [2, 3, 4, 5, 10];
      return {
        label: 'division (equal sharing or grouping)',
        constraint: 'Division that divides EXACTLY with no remainder, using only these divisors: ' + dv.join(', ') + '.',
        maxAnswer: 144
      };
    }
    case 'money':
      return { label: 'money (Singapore dollars and cents)', constraint: 'Money problems using Singapore dollars and cents. Totals under $20. Answers in dollars, as a number only.', maxAnswer: 100 };
    case 'time1':
      return { label: 'telling the time', constraint: 'Reading clocks at o\'clock and half past only. Answer as the number of the hour.', maxAnswer: 12 };
    case 'frac1':
      return { label: 'simple fractions', constraint: 'Halves, thirds and quarters of small whole numbers only.', maxAnswer: 50 };
    case 'wp1':
      return { label: 'one-step addition or subtraction', constraint: 'One-step addition or subtraction within ' + (r ? r[1] : 20) + '. Never negative.', maxAnswer: (r ? r[1] : 20) * 2 };
    case 'multiwp':
      return { label: 'two-step', constraint: 'Exactly two steps. Each step is addition, subtraction, multiplication or division within 100.', maxAnswer: 500 };
    default:
      return { label: 'primary mathematics', constraint: 'Simple arithmetic within 20.', maxAnswer: 40 };
  }
}

// ---- Explanations for wrong answers ------------------------------------

var AI_EXPLAIN_SCHEMA = {
  type: 'object',
  properties: {
    explanation: { type: 'string', description: 'Two or three very short sentences explaining the method to a 6 year old. Warm, never scolding.' },
    step:        { type: 'string', description: 'The arithmetic written out, e.g. "3 + 4 = 7"' }
  },
  required: ['explanation', 'step']
};

/**
 * When a child gets something wrong, offer a kind explanation.
 * Returns a Promise<string> or null if AI is unavailable.
 */
function aiExplainWrongAnswer(question, givenAnswer) {
  if (!aiEnabled()) return null;
  var qText = question.text || (question.a + ' ' + (question.op || '+') + ' ' + question.b);
  var prompt = [
    'A 6 year old answered this question wrongly.',
    '',
    'Question: ' + qText,
    'Correct answer: ' + question.answer,
    'She answered: ' + givenAnswer,
    '',
    'Explain the method in two or three VERY short sentences a 6 year old can follow.',
    'Be warm and encouraging. Never say she is wrong or bad. Focus on the method, not the mistake.',
    'If her answer suggests a specific misconception, gently address that misconception.'
  ].join('\n');

  return askGeminiJSON({
    system: aiSystemPrompt(),
    prompt: prompt,
    schema: AI_EXPLAIN_SCHEMA,
    temperature: 0.5,
    maxTokens: 300
  }).then(function(d) {
    return d.explanation + (d.step ? ('\n' + d.step) : '');
  }).catch(function(e) {
    _aiNoteError(e);
    return null;
  });
}

// ---- Connection test (used by the Settings screen) ---------------------

function aiTestConnection() {
  return askGeminiJSON({
    system: 'You reply in JSON only.',
    prompt: 'Reply with {"ok": true, "greeting": "a four word hello for a child"}',
    schema: {
      type: 'object',
      properties: { ok: { type: 'boolean' }, greeting: { type: 'string' } },
      required: ['ok', 'greeting']
    },
    temperature: 0.3,
    maxTokens: 100,
    timeoutMs: 15000
  });
}

window.aiGetKey = aiGetKey;
window.aiSetKey = aiSetKey;
window.aiGetModel = aiGetModel;
window.aiSetModel = aiSetModel;
window.aiEnabled = aiEnabled;
window.aiTakeQuestion = aiTakeQuestion;
window.aiPrefetch = aiPrefetch;
window.aiGenerateWordProblems = aiGenerateWordProblems;
window.aiExplainWrongAnswer = aiExplainWrongAnswer;
window.aiTestConnection = aiTestConnection;
window.aiLastError = aiLastError;
window.askGeminiJSON = askGeminiJSON;
