// The English P2 ladder: grammar, vocabulary, sentence work, reading.
//
// These banks are hand-written, which is exactly why they need a
// machine to read them back. A hand-written bank fails in ordinary
// ways: an answer that is not among its own choices, the same choice
// typed twice, an item pasted in twice, a level nobody filled, a new
// question type with nothing to draw it. None of those would show up
// until a seven year old met them, and each one tells her she was
// wrong when she was right.
//
// What this file cannot check is the English. Whether a wrong choice
// could be argued right, and whether a second word order is also good
// English, were checked by hand when the items were written. The
// rules that were followed are in the comments beside each bank in
// src/word/word-data.js.
//
// Runs against the built bundle, like every other suite here.

const fs = require('fs');
const vm = require('vm');

process.on('uncaughtException', e => { if (!/Cannot (set|read) propert/.test(String(e && e.message))) throw e; });
process.on('unhandledRejection', e => { if (!/Cannot (set|read) propert/.test(String(e && e.message))) throw e; });

const html = fs.readFileSync(__dirname + '/../dist/bundle.html', 'utf8');
const code = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m => m[1])
  .sort((a, b) => b.length - a.length)[0];

const noop = () => {};
const el = () => {
  const node = {
    classList: { add: noop, remove: noop, toggle: noop, contains: () => false },
    style: {}, dataset: {}, remove: noop, removeAttribute: noop, setAttribute: noop,
    getAttribute: () => null, addEventListener: noop, removeEventListener: noop,
    insertAdjacentHTML: noop, insertBefore: noop, textContent: '', innerHTML: '', value: '',
    offsetHeight: 0, offsetWidth: 0, focus: noop, blur: noop, click: noop,
    parentElement: null, firstChild: null, lastElementChild: null, children: [], childNodes: [],
    getBoundingClientRect: () => ({ left: 0, top: 0, right: 100, bottom: 100, width: 100, height: 100 }),
    getContext: () => null, closest: () => null, contains: () => false, replaceWith: noop
  };
  node.querySelector = () => el();
  node.querySelectorAll = () => [];
  node.appendChild = child => child;
  node.cloneNode = () => el();
  return node;
};

const store = {};
const sandbox = {
  console, setTimeout: noop, clearTimeout: noop, setInterval: () => 1, clearInterval: noop,
  requestAnimationFrame: noop,
  Math, Date, JSON, Set, Map, Object, Array, String, Number, Boolean, isFinite, isNaN,
  parseInt, parseFloat, RegExp, Error, encodeURIComponent,
  AbortController: function () { this.abort = noop; this.signal = null; },
  fetch: () => Promise.reject(new Error('offline in test')),
  navigator: { onLine: false },
  localStorage: {
    getItem: k => (k in store ? store[k] : null),
    setItem: (k, v) => { store[k] = String(v); },
    removeItem: k => { delete store[k]; }
  },
  document: {
    getElementById: () => el(), querySelector: () => el(), querySelectorAll: () => [],
    createElement: el, createTextNode: () => el(), createElementNS: el,
    body: el(), head: el(), addEventListener: noop, removeEventListener: noop,
    documentElement: el(), activeElement: null
  },
  getComputedStyle: () => ({ getPropertyValue: () => '' }),
  SVGElement: function () {},
  __card: () => el(),
  window: {}
};
sandbox.window = sandbox;
sandbox.globalThis = sandbox;
vm.createContext(sandbox);
try { vm.runInContext(code, sandbox); } catch (e) {
  if (!/Cannot (set|read)/.test(String(e.message))) console.log('LOAD WARN:', e.message.slice(0, 120));
}

const R = [];
const ok = (name, cond, extra = '') => R.push({ name, pass: !!cond, extra: String(extra || '') });
const run = expr => vm.runInContext(expr, sandbox);
const get = name => { try { return JSON.parse(run('JSON.stringify(' + name + ')')); } catch (e) { return null; } };

run('state = state || {}; state.skills = {}; state.tokens = 0;');

const GRAMMAR = get('GRAMMAR_ITEMS') || [];
const CORE = get('GRAMMAR_CORE_TYPES') || [];
const VOCAB = get('VOCAB_ITEMS') || [];
const RELATE = get('VOCAB_RELATE') || [];
const SENT = get('SENTENCE_ITEMS') || [];
const JOIN = get('JOIN_ITEMS') || [];
const READING = get('READING_PASSAGES') || [];
const OLD_PASSAGES = get('COMPREHENSION_PASSAGES') || [];

// ---- helpers -----------------------------------------------------------
const show = list => list.slice(0, 5).join(' | ') + (list.length > 5 ? ' ... +' + (list.length - 5) : '');
const levelsOf = items => [1, 2, 3, 4, 5].map(l => items.filter(i => i.level === l).length);
const allLevels = items => levelsOf(items).every(n => n > 0);
const dupes = keys => { const seen = {}, d = []; keys.forEach(k => { if (seen[k]) d.push(k); seen[k] = true; }); return d; };
const words = s => String(s).toLowerCase().replace(/[.,?]/g, ' ').split(/\s+/).filter(Boolean);

/** Every way a list of choices can let a child down. */
function optionFaults(label, options, answer) {
  const f = [];
  if (!Array.isArray(options) || options.length < 3) { f.push(label + ': fewer than 3 choices'); return f; }
  const hits = options.filter(o => o === answer).length;
  if (hits === 0) f.push(label + ': answer "' + answer + '" is not among the choices');
  if (hits > 1) f.push(label + ': answer appears ' + hits + ' times');
  if (new Set(options).size !== options.length) f.push(label + ': the same choice twice');
  if (new Set(options.map(o => String(o).toLowerCase().trim())).size !== options.length) f.push(label + ': two choices differ only by capitals or spaces');
  if (options.some(o => o === undefined || o === null || String(o).trim() === '')) f.push(label + ': an empty choice');
  return f;
}

// Text she reads must be plain: no exclamation marks, no emoji, and
// none of the American spellings that slip in from habit.
const EMOJI = /[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}]/u;
const AMERICAN = /\b(color|colors|colored|favorite|favorites|neighbor|neighbors|center|centers|theater|practiced|practicing|realize|realized|organize|organized|gray|mom|mommy|math|soccer|cookie|cookies|candy|sidewalk|trash|vacation|apartment|elevator|grade|airplane|pajamas|traveled|traveling|honor|meter|meters|kilometer|program|flavor|learned|spelled|dreamed)\b/i;
function textFaults(label, strings) {
  const f = [];
  strings.forEach(s => {
    if (typeof s !== 'string') return;
    if (s.indexOf('!') >= 0) f.push(label + ': exclamation mark in "' + s.slice(0, 40) + '"');
    if (EMOJI.test(s)) f.push(label + ': emoji in "' + s.slice(0, 40) + '"');
    const m = s.match(AMERICAN);
    if (m) f.push(label + ': American spelling "' + m[0] + '"');
    if (/undefined|NaN|\[object/.test(s)) f.push(label + ': broken text "' + s.slice(0, 40) + '"');
  });
  return f;
}

// =======================================================================
//  1. GRAMMAR
// =======================================================================
{
  const core = GRAMMAR.filter(g => CORE.indexOf(g.type) >= 0);
  ok('grammar: at least 150 hand-written items on the P2 core', core.length >= 150, core.length + ' core items, ' + GRAMMAR.length + ' in all');

  const wanted = ['past-reg', 'past-irr', 'sv', 'pronoun', 'prep', 'conj', 'adj', 'article', 'qword', 'contraction'];
  const thin = wanted.filter(t => GRAMMAR.filter(g => g.type === t).length < 12);
  ok('grammar: every P2 core type is declared and has at least 12 items',
     wanted.every(t => CORE.indexOf(t) >= 0) && thin.length === 0,
     thin.length ? 'THIN: ' + thin.join(', ') : wanted.map(t => t + ' ' + GRAMMAR.filter(g => g.type === t).length).join(', '));

  const conj = GRAMMAR.filter(g => g.type === 'conj').map(g => g.answer.toLowerCase());
  ok('grammar: and, but, because, so and or are each the answer somewhere',
     ['and', 'but', 'because', 'so', 'or'].every(c => conj.indexOf(c) >= 0));

  ok('grammar: levels 1 to 5 are all populated, with at least 30 items each',
     allLevels(GRAMMAR) && levelsOf(GRAMMAR).every(n => n >= 30), 'per level: ' + levelsOf(GRAMMAR).join(', '));

  const spread = CORE.filter(t => new Set(GRAMMAR.filter(g => g.type === t).map(g => g.level)).size < 4);
  ok('grammar: every core type climbs through at least four levels', spread.length === 0, spread.join(', '));

  let faults = [];
  GRAMMAR.forEach(g => {
    const label = g.type + ' "' + g.sentence.slice(0, 30) + '"';
    faults = faults.concat(optionFaults(label, g.options, g.answer));
    if (g.options.length !== 4) faults.push(label + ': ' + g.options.length + ' choices, not 4');
    if (!(g.level >= 1 && g.level <= 5) || g.level !== Math.floor(g.level)) faults.push(label + ': level ' + g.level);
    if (!g.instruction) faults.push(label + ': no instruction');
    if (!g.type) faults.push(label + ': no grammar type');
  });
  ok('grammar: every item has its answer among four distinct choices, a type and a level', faults.length === 0, show(faults));

  const noWhy = GRAMMAR.filter(g => !g.why || g.why.length < 15 || g.why.length > 130 || /\n/.test(g.why) || !/[.]$/.test(g.why));
  ok('grammar: every item has a one-line reason', noWhy.length === 0, show(noWhy.map(g => g.sentence.slice(0, 30) + ' -> "' + g.why + '"')));

  // A reason that never mentions the answer or the rule word is usually
  // one pasted from the item above.
  const cheer = GRAMMAR.filter(g => /\b(well done|great|good job|awesome|brilliant|clever you|you got)\b/i.test(g.why));
  ok('grammar: reasons state the rule and do not cheer', cheer.length === 0, show(cheer.map(g => g.why)));

  const d = dupes(GRAMMAR.map(g => g.type + '|' + g.sentence));
  ok('grammar: no item appears twice', d.length === 0, show(d));

  // Fill-in items need a blank or a bold target, or there is nothing to answer.
  const noGap = GRAMMAR.filter(g => g.type.indexOf('identify') !== 0 && g.sentence.indexOf('___') < 0 && g.sentence.indexOf('<b>') < 0);
  ok('grammar: every fill-in item shows a blank or a word in bold', noGap.length === 0, show(noGap.map(g => g.sentence)));

  // "The" is nearly always grammatical, so an a/an item must not offer it.
  const theTrap = GRAMMAR.filter(g => g.type === 'article' && /^an?$/i.test(g.answer) &&
    g.options.some(o => /^the$/i.test(o)) && !/^What ___/.test(g.sentence));
  ok('grammar: a/an items never offer "the" as a rival answer', theTrap.length === 0, show(theTrap.map(g => g.sentence)));

  const t = textFaults('grammar', [].concat(...GRAMMAR.map(g => [g.sentence, g.why, g.instruction].concat(g.options))));
  ok('grammar: plain text, British spelling, no exclamation marks or emoji', t.length === 0, show(t));
}

// =======================================================================
//  2. VOCABULARY
// =======================================================================
{
  ok('vocabulary: at least 100 items', VOCAB.length + RELATE.length >= 100,
     VOCAB.length + ' meaning items + ' + RELATE.length + ' synonym and antonym items');

  ok('vocabulary: levels 1 to 5 are all populated for meanings, and for synonyms and antonyms',
     allLevels(VOCAB) && allLevels(RELATE.filter(r => r.kind === 'synonym')) && allLevels(RELATE.filter(r => r.kind === 'antonym')),
     'meanings ' + levelsOf(VOCAB).join(', ') + '; relate ' + levelsOf(RELATE).join(', '));

  ok('vocabulary: there are synonym items and antonym items',
     RELATE.filter(r => r.kind === 'synonym').length >= 10 && RELATE.filter(r => r.kind === 'antonym').length >= 10,
     RELATE.filter(r => r.kind === 'synonym').length + ' synonyms, ' + RELATE.filter(r => r.kind === 'antonym').length + ' antonyms');

  let faults = [];
  VOCAB.forEach(v => {
    faults = faults.concat(optionFaults(v.word, v.options, v.meaning));
    if (!v.cat) faults.push(v.word + ': no meaning group');
    if (!(v.level >= 1 && v.level <= 5)) faults.push(v.word + ': level ' + v.level);
    if (words(v.sentence).indexOf(v.word.toLowerCase()) < 0) faults.push(v.word + ': not used in its own sentence');
    if (words(v.sentence).length < 7) faults.push(v.word + ': sentence too short to give the meaning away');
    if (v.options.some(o => words(o).indexOf(v.word.toLowerCase()) >= 0)) faults.push(v.word + ': a choice repeats the word itself');
  });
  RELATE.forEach(r => {
    const label = r.kind + ' ' + r.word;
    faults = faults.concat(optionFaults(label, r.options, r.answer));
    if (!(r.level >= 1 && r.level <= 5)) faults.push(label + ': level ' + r.level);
    if (words(r.sentence).indexOf(r.word.toLowerCase()) < 0) faults.push(label + ': not used in its own sentence');
    if (r.options.indexOf(r.word) >= 0) faults.push(label + ': offers the word itself as a choice');
    if (r.kind !== 'synonym' && r.kind !== 'antonym') faults.push(label + ': unknown kind');
  });
  ok('vocabulary: every item has its answer among distinct choices and sits in a sentence', faults.length === 0, show(faults));

  const d = dupes(VOCAB.map(v => v.word)).concat(dupes(RELATE.map(r => r.kind + '|' + r.word)));
  ok('vocabulary: no word appears twice in a bank', d.length === 0, show(d));

  // Two words with the same meaning text must share a group, or one
  // could be offered as a wrong answer to the other.
  const byMeaning = {};
  const clash = [];
  VOCAB.forEach(v => {
    const prev = byMeaning[v.meaning];
    if (prev && prev.cat !== v.cat) clash.push(prev.word + ' / ' + v.word);
    byMeaning[v.meaning] = v;
  });
  ok('vocabulary: words with the same meaning share a meaning group', clash.length === 0, show(clash));

  const t = textFaults('vocab', [].concat(...VOCAB.map(v => [v.sentence].concat(v.options)), ...RELATE.map(r => [r.sentence].concat(r.options))));
  ok('vocabulary: plain text, British spelling, no exclamation marks or emoji', t.length === 0, show(t));
}

// =======================================================================
//  3. SENTENCE WORK
// =======================================================================
{
  ok('sentences: at least 30 curated sentences to rearrange and 20 pairs to join',
     SENT.length >= 30 && JOIN.length >= 20, SENT.length + ' to rearrange, ' + JOIN.length + ' to join');
  ok('sentences: rearranging covers levels 1 to 5, and joining covers 2 to 5',
     allLevels(SENT) && levelsOf(JOIN).slice(1).every(n => n > 0),
     'rearrange ' + levelsOf(SENT).join(', ') + '; join ' + levelsOf(JOIN).join(', '));

  let faults = [];
  SENT.forEach(s => {
    const label = '"' + s.answer + '"';
    if (!Array.isArray(s.tiles) || s.tiles.length < 3) faults.push(label + ': fewer than 3 tiles');
    if (s.answer !== s.tiles.join(' ') + '.') faults.push(label + ': answer is not its tiles in order');
    if (!/^[A-Z]/.test(s.answer)) faults.push(label + ': no capital letter');
    const base = words(s.answer).sort().join(' ');
    (s.also || []).forEach(a => {
      if (words(a).sort().join(' ') !== base) faults.push(label + ': other order "' + a + '" does not use the same words');
      if (words(a).join(' ') === words(s.answer).join(' ')) faults.push(label + ': other order repeats the answer');
      if (!/^[A-Z].*\.$/.test(a)) faults.push(label + ': other order "' + a + '" is not written as a sentence');
    });
    if (dupes((s.also || []).map(a => words(a).join(' '))).length) faults.push(label + ': an other order is listed twice');
  });
  ok('sentences: every accepted order uses exactly the words on the tiles', faults.length === 0, show(faults));

  // Each other order must be reachable with the tiles as they are cut:
  // a tile such as "the zoo" cannot be split to make it.
  const unreachable = [];
  SENT.forEach(s => (s.also || []).forEach(a => {
    const target = words(a).join(' ');
    const tiles = s.tiles.map(t => words(t).join(' '));
    let found = false;
    (function walk(left, built) {
      if (found) return;
      if (!left.length) { if (built.join(' ') === target) found = true; return; }
      for (let i = 0; i < left.length; i++) {
        const next = built.concat(left[i]);
        if (target.indexOf(next.join(' ')) !== 0) continue;
        walk(left.slice(0, i).concat(left.slice(i + 1)), next);
      }
    })(tiles, []);
    if (!found) unreachable.push('"' + a + '"');
  }));
  ok('sentences: every accepted order can be built from the tiles as cut', unreachable.length === 0, show(unreachable));

  const d = dupes(SENT.map(s => s.answer)).concat(dupes(JOIN.map(j => j.answer)));
  ok('sentences: no sentence appears twice', d.length === 0, show(d));

  // The checker itself: every listed order is right, a scramble is wrong.
  const verdict = JSON.parse(run(`
    (function () {
      var bad = [];
      SENTENCE_ITEMS.forEach(function (s) {
        var accept = [s.answer].concat(s.also);
        accept.forEach(function (a) {
          var typed = a.replace(/\\.$/, '');
          if (!wordSentenceMatches(typed, accept)) bad.push('rejected a listed order: ' + a);
          if (!wordSentenceMatches(typed.toLowerCase(), accept)) bad.push('rejected for capitals: ' + a);
        });
        var reversed = s.tiles.slice().reverse().join(' ');
        if (accept.map(wordNormaliseSentence).indexOf(wordNormaliseSentence(reversed)) < 0 &&
            wordSentenceMatches(reversed, accept)) bad.push('accepted a scramble: ' + reversed);
        if (wordSentenceMatches(s.tiles.slice(1).join(' '), accept)) bad.push('accepted a sentence with a word missing: ' + s.answer);
      });
      return JSON.stringify(bad);
    })()
  `));
  ok('sentences: the checker accepts every listed order and rejects a scramble', verdict.length === 0, show(verdict));

  const some = SENT.filter(s => (s.also || []).length > 0).length;
  ok('sentences: sentences with a second good order are present and accept it', some >= 10, some + ' sentences accept more than one order');

  faults = [];
  const conjs = {};
  JOIN.forEach(j => {
    const label = 'join "' + j.answer.slice(0, 34) + '"';
    conjs[j.conj] = (conjs[j.conj] || 0) + 1;
    faults = faults.concat(optionFaults(label, j.options, j.answer));
    if (j.options.length !== 4) faults.push(label + ': ' + j.options.length + ' choices, not 4');
    if (words(j.answer).indexOf(j.conj) < 0) faults.push(label + ': answer does not use "' + j.conj + '"');
    j.options.forEach(o => { if (words(o).indexOf(j.conj) < 0) faults.push(label + ': a choice does not use "' + j.conj + '"'); });
    if (!j.a || !j.b || !/\.$/.test(j.a) || !/\.$/.test(j.b)) faults.push(label + ': needs two full sentences to join');
    if (!j.why || j.why.length < 15 || j.why.length > 130) faults.push(label + ': no one-line reason');
    if (!(j.level >= 2 && j.level <= 5)) faults.push(label + ': level ' + j.level);
    if (words(j.answer).length >= words(j.a).length + words(j.b).length + 2) faults.push(label + ': joined sentence is longer than its parts');
  });
  ok('sentences: every joining item has its answer among four distinct choices and a reason', faults.length === 0, show(faults));
  ok('sentences: joining uses and, but, because, so and or',
     ['and', 'but', 'because', 'so', 'or'].every(c => conjs[c] >= 3) && Object.keys(conjs).length === 5, JSON.stringify(conjs));

  const t = textFaults('sentences', SENT.map(s => s.answer).concat(...SENT.map(s => s.also || []), ...JOIN.map(j => [j.a, j.b, j.why].concat(j.options))));
  ok('sentences: plain text, British spelling, no exclamation marks or emoji', t.length === 0, show(t));
}

// =======================================================================
//  4. READING
// =======================================================================
{
  ok('reading: at least 10 new passages', READING.length >= 10, READING.length + ' new passages, ' + OLD_PASSAGES.length + ' short ones kept');

  const lengths = READING.map(p => p.text.split(/\s+/).length);
  const offLength = READING.filter((p, i) => lengths[i] < 60 || lengths[i] > 120).map((p, i) => p.title);
  ok('reading: every new passage is 60 to 120 words', offLength.length === 0,
     offLength.length ? show(offLength) : 'shortest ' + Math.min(...lengths) + ', longest ' + Math.max(...lengths));

  const offCount = READING.filter(p => p.questions.length < 4 || p.questions.length > 5).map(p => p.title);
  ok('reading: every new passage has 4 or 5 questions', offCount.length === 0, show(offCount));

  const all = [].concat(...READING.map(p => p.questions.map(q => q.kind)));
  const kinds = ['literal', 'sequence', 'vocab', 'inference'];
  const count = k => all.filter(x => x === k).length;
  ok('reading: literal, sequencing, vocabulary and inference questions are all asked',
     kinds.every(k => count(k) >= 8) && all.every(k => kinds.indexOf(k) >= 0), kinds.map(k => k + ' ' + count(k)).join(', '));

  const narrow = READING.filter(p => new Set(p.questions.map(q => q.kind)).size < 3 ||
    !p.questions.some(q => q.kind === 'literal') || !p.questions.some(q => q.kind === 'inference')).map(p => p.title);
  ok('reading: every new passage mixes at least three kinds, with a literal and an inference question', narrow.length === 0, show(narrow));

  const withOld = OLD_PASSAGES.map(p => Object.assign({ level: 1 }, p)).concat(READING);
  ok('reading: levels 1 to 5 are all populated', allLevels(withOld) && READING.every(p => p.level >= 2 && p.level <= 5),
     'per level: ' + levelsOf(withOld).join(', '));

  let faults = [];
  withOld.forEach(p => {
    p.questions.forEach(q => {
      const label = p.title + ' "' + q.question.slice(0, 28) + '"';
      faults = faults.concat(optionFaults(label, q.options, q.answer));
    });
    if (dupes(p.questions.map(q => q.question)).length) faults.push(p.title + ': a question is asked twice');
  });
  READING.forEach(p => p.questions.forEach(q => {
    const label = p.title + ' "' + q.question.slice(0, 28) + '"';
    if (q.options.length !== 4) faults.push(label + ': ' + q.options.length + ' choices, not 4');
    if (q.kind === 'vocab') {
      const m = q.question.match(/"([^"]+)"/);
      if (!m) faults.push(label + ': vocabulary question does not quote its word');
      else if (words(p.text).indexOf(m[1].toLowerCase()) < 0) faults.push(label + ': "' + m[1] + '" is not in the passage');
    }
    if (q.kind !== 'literal' && (!q.why || q.why.length < 15)) faults.push(label + ': no reason given for a ' + q.kind + ' question');
    if (q.why && q.why.length > 130) faults.push(label + ': reason is longer than one line');
  }));
  ok('reading: every question has its answer among distinct choices, and vocabulary words are in the passage', faults.length === 0, show(faults));

  // A literal answer should be findable: its key words are in the text.
  const adrift = [];
  READING.forEach(p => p.questions.filter(q => q.kind === 'literal').forEach(q => {
    const text = words(p.text);
    const key = words(q.answer).filter(w => w.length > 3);
    const found = key.filter(w => text.indexOf(w) >= 0 || text.some(t => t.indexOf(w.slice(0, 4)) === 0));
    if (key.length && found.length < Math.ceil(key.length / 2)) adrift.push(p.title + ': "' + q.answer + '"');
  }));
  ok('reading: literal answers can be found in the words of the passage', adrift.length === 0, show(adrift));

  const d = dupes(withOld.map(p => p.title));
  ok('reading: no passage appears twice', d.length === 0, show(d));

  const t = textFaults('reading', [].concat(...READING.map(p => [p.title, p.text].concat(...p.questions.map(q => [q.question, q.why].concat(q.options))))));
  ok('reading: plain text, British spelling, no exclamation marks or emoji', t.length === 0, show(t));
}

// =======================================================================
//  5. THE LADDER IN USE: generators, tiers, renderers
// =======================================================================
{
  const res = JSON.parse(run(`
    (function () {
      var out = { bad: {}, types: {}, levels: {}, positions: [0, 0, 0, 0], firstItems: {}, whyMissing: 0, n: 0, subKeys: {} };
      function note(k) { out.bad[k] = (out.bad[k] || 0) + 1; }
      ['grammar', 'vocab', 'sentence', 'comprehension'].forEach(function (skill) {
        for (var lvl = 0; lvl <= 4; lvl++) {
          state.skills = {};
          getSkillState(skill).level = lvl;
          var seen = {};
          for (var i = 0; i < 400; i++) {
            // Sessions of eight, as the app plays them: startGame() makes
            // a new currentGame object and then asks for its questions.
            if (i % 8 === 0) currentGame = { questions: [] };
            var q;
            try { q = generateWordQuestion(skill); } catch (e) { note(skill + ' threw: ' + String(e.message).slice(0, 60)); continue; }
            if (!q) { note(skill + ' returned nothing'); continue; }
            out.n++;
            out.types[q.type] = (out.types[q.type] || 0) + 1;
            if (q.subKey) out.subKeys[skill + ':' + q.subKey] = true; else note(skill + ':' + q.type + ' has no sub-skill key');
            if (typeof q.level !== 'number') note(skill + ':' + q.type + ' has no level');
            else {
              var target = lvl + 1;
              // A rung with no items of a kind may borrow from the nearest one;
              // only joining (which starts on rung 2) ever needs to.
              if (q.level > target || q.level < target - 1) note(skill + ':' + q.type + ' at difficulty ' + lvl + ' served level ' + q.level);
              var key = skill + ':' + lvl; out.levels[key] = out.levels[key] || {}; out.levels[key][q.level] = (out.levels[key][q.level] || 0) + 1;
            }
            if (Array.isArray(q.options)) {
              var idx = q.options.indexOf(q.answer);
              if (idx < 0) note(skill + ':' + q.type + ' answer not among choices');
              else if (q.options.length === 4) out.positions[idx]++;
              if (q.options.filter(function (o) { return o === q.answer; }).length !== 1) note(skill + ':' + q.type + ' answer not there exactly once');
              var s = {}; q.options.forEach(function (o) { if (s[o]) note(skill + ':' + q.type + ' repeats a choice'); s[o] = 1; });
            }
            if (q.type === 'grammar-mcq' || q.type === 'sentence-join' || q.type === 'vocab-meaning' || q.type === 'vocab-word' || q.type === 'vocab-relate') {
              if (!q.why) out.whyMissing++;
            }
            if (q.type === 'vocab-word') {
              var ans = VOCAB_ITEMS.filter(function (v) { return v.word === q.answer; })[0];
              var cats = {}; cats[ans.cat] = 1;
              q.options.forEach(function (o) {
                if (o === q.answer) return;
                var v = VOCAB_ITEMS.filter(function (x) { return x.word === o; })[0];
                if (!v) note('vocab-word offers a word that is not in the bank');
                else if (cats[v.cat]) note('vocab-word offers two words from one meaning group (' + q.answer + ', ' + o + ')');
                else cats[v.cat] = 1;
              });
            }
            if (q.type === 'sentence-build') {
              if (!q.accept || q.accept.indexOf(q.answer) !== 0) note('sentence-build does not carry its accepted orders');
              if (q.words.slice().sort().join('|') !== q.correctOrder.slice().sort().join('|')) note('sentence-build tiles do not match the answer');
            }
            var card = __card(), handled;
            try { handled = renderWordQuestion(card, q); } catch (e) { note(skill + ':' + q.type + ' renderer threw: ' + String(e.message).slice(0, 50)); continue; }
            if (handled !== true) note(skill + ' emits a type with no renderer: ' + q.type);
            else if (!card.innerHTML) note(skill + ':' + q.type + ' renders an empty card');
            else if (/undefined|NaN|\\[object Object\\]/.test(card.innerHTML)) note(skill + ':' + q.type + ' shows broken text');
            seen[q.type + '|' + (q.sentence || q.question || q.answer)] = 1;
          }
          out.firstItems[skill + ':' + lvl] = Object.keys(seen).length;
        }
      });
      return JSON.stringify(out);
    })()
  `));
  const bad = Object.keys(res.bad).map(k => k + ' (x' + res.bad[k] + ')');
  ok('ladder: every generated P2 question is answerable, levelled, tracked and drawn', bad.length === 0 && res.n === 8000,
     bad.length ? show(bad) : res.n + ' questions');

  const wantTypes = ['grammar-mcq', 'vocab-meaning', 'vocab-word', 'vocab-relate', 'sentence-build', 'sentence-join', 'comprehension-mcq'];
  const missing = wantTypes.filter(t => !res.types[t]);
  ok('ladder: every P2 question type is emitted and has a renderer', missing.length === 0,
     missing.length ? 'NEVER EMITTED: ' + missing.join(', ') : wantTypes.map(t => t + ' ' + res.types[t]).join(', '));

  // Tier selection: the rung she is on dominates, the one below comes back.
  const tierFaults = [];
  ['grammar', 'vocab', 'comprehension'].forEach(skill => {
    for (let lvl = 0; lvl <= 4; lvl++) {
      const got = res.levels[skill + ':' + lvl] || {};
      const total = Object.values(got).reduce((a, b) => a + b, 0);
      const onRung = (got[lvl + 1] || 0) / total;
      if (onRung < 0.6) tierFaults.push(skill + ' at difficulty ' + lvl + ': only ' + Math.round(onRung * 100) + '% on its own rung');
      if (lvl > 0 && !(got[lvl] > 0)) tierFaults.push(skill + ' at difficulty ' + lvl + ': never revisits the rung below');
    }
  });
  ok('ladder: difficulty picks the rung, with revision from the rung below', tierFaults.length === 0, show(tierFaults));

  const few = Object.keys(res.firstItems).filter(k => res.firstItems[k] < 12);
  ok('ladder: every rung of every skill has at least 12 different questions', few.length === 0,
     few.length ? show(few.map(k => k + ' has ' + res.firstItems[k])) : 'fewest: ' + Math.min(...Object.values(res.firstItems)));

  // Answer positions come from a runtime shuffle; check it really is one.
  const total = res.positions.reduce((a, b) => a + b, 0);
  const share = res.positions.map(n => Math.round(n / total * 100));
  ok('ladder: the right answer lands in each of the four positions about equally', share.every(p => p >= 21 && p <= 29), share.join('% ') + '%');

  ok('ladder: grammar, joining and vocabulary questions all carry a reason', res.whyMissing === 0, res.whyMissing + ' without');

  const sub = Object.keys(res.subKeys);
  ok('ladder: sub-skills are keyed for the tracker math already uses',
     CORE.every(t => sub.indexOf('grammar:' + t) >= 0) && ['literal', 'sequence', 'vocab', 'inference'].every(k => sub.indexOf('comprehension:' + k) >= 0) &&
     sub.indexOf('sentence:rearrange') >= 0 && sub.indexOf('vocab:synonym') >= 0 && sub.indexOf('vocab:antonym') >= 0, sub.length + ' keys');
}

// ---- a session does not repeat itself, and reading stays on a passage ----
{
  const res = JSON.parse(run(`
    (function () {
      var out = { repeats: [], sessions: [] };
      ['grammar', 'vocab', 'sentence'].forEach(function (skill) {
        for (var lvl = 0; lvl <= 4; lvl++) {
          state.skills = {}; getSkillState(skill).level = lvl;
          for (var s = 0; s < 30; s++) {
            currentGame = { questions: [] };
            var seen = {};
            for (var i = 0; i < 8; i++) {
              var q = generateWordQuestion(skill);
              var k = (q.grammarType || q.kind || '') + '|' + (q.sentence || q.word || q.meaning || q.answer);
              if (seen[k]) out.repeats.push(skill + ' L' + lvl + ': ' + k.slice(0, 40));
              seen[k] = 1;
              currentGame.questions.push(q);
            }
          }
        }
      });
      for (var lvl2 = 0; lvl2 <= 4; lvl2++) {
        state.skills = {}; getSkillState('comprehension').level = lvl2;
        for (var s2 = 0; s2 < 20; s2++) {
          currentGame = { questions: [] };
          var qs = [];
          for (var j = 0; j < 8; j++) { var cq = generateWordQuestion('comprehension'); qs.push({ t: cq.title, q: cq.question, i: cq.partIndex, n: cq.partTotal }); currentGame.questions.push(cq); }
          out.sessions.push(qs);
        }
      }
      return JSON.stringify(out);
    })()
  `));
  ok('ladder: no question is asked twice in one eight-question session', res.repeats.length === 0, show(res.repeats));

  const sessionFaults = [];
  let most = 0, fewest = 99;
  res.sessions.forEach(qs => {
    if (qs[0].i !== 1) sessionFaults.push('session opens part-way through "' + qs[0].t + '"');
    const titles = [];
    qs.forEach((q, i) => {
      if (titles[titles.length - 1] !== q.t) { if (titles.indexOf(q.t) >= 0) sessionFaults.push('returns to "' + q.t + '" after leaving it'); titles.push(q.t); }
      if (i > 0 && qs[i - 1].t === q.t && q.i !== qs[i - 1].i + 1) sessionFaults.push('questions out of order on "' + q.t + '"');
      if (i > 0 && qs[i - 1].t !== q.t && (qs[i - 1].i !== qs[i - 1].n || q.i !== 1)) sessionFaults.push('left "' + qs[i - 1].t + '" before its last question');
    });
    if (dupes(qs.map(q => q.t + '|' + q.q)).length) sessionFaults.push('a question repeated in one session');
    most = Math.max(most, titles.length); fewest = Math.min(fewest, titles.length);
  });
  ok('reading: a session works through whole passages, several questions each, in order',
     sessionFaults.length === 0 && most <= 3 && fewest >= 2, sessionFaults.length ? show(sessionFaults) : fewest + ' to ' + most + ' passages per session of 8');
}

// =======================================================================
//  6. TREE, UNLOCKING AND LESSONS
// =======================================================================
{
  const tree = get('WORD_TREE') || {};
  const ids = Object.keys(tree);
  ok('tree: existing skill ids are all still there',
     ['phonics', 'sight', 'spell', 'punct', 'grammar', 'vocab', 'sentence', 'comprehension', 'poetry', 'story', 'paragraph'].every(id => tree[id] && tree[id].id === id),
     ids.join(', '));

  const danglers = [].concat(...ids.map(id => (tree[id].deps || []).filter(d => !tree[d]).map(d => id + ' -> ' + d)));
  ok('tree: every dependency names a real skill', danglers.length === 0, show(danglers));

  const c = tree.comprehension || {};
  ok('tree: reading comprehension is a P2 skill', /^P2/.test(c.grade || ''), c.grade);

  // A P2 child can reach it: 40% on sight words and vocabulary is enough.
  const reach = JSON.parse(run(`
    (function () {
      state.skills = {};
      var locked = isSkillUnlocked(WORD_TREE.comprehension);
      getSkillState('sight').mastery = 40;
      getSkillState('vocab').mastery = 40;
      var open = isSkillUnlocked(WORD_TREE.comprehension);
      state.skills = {};
      return JSON.stringify({ lockedAtStart: !locked, openAfterVocab: open });
    })()
  `));
  ok('tree: comprehension is locked at the start and opens once vocabulary is under way',
     reach.lockedAtStart && reach.openAfterVocab, JSON.stringify(reach));

  const lessons = JSON.parse(run(`
    (function () {
      var out = { none: [], bad: [], steps: {} };
      Object.keys(WORD_TREE).forEach(function (id) {
        var l = getWordLesson(id);
        if (!l || !l.steps || !l.steps.length) { out.none.push(id); return; }
        out.steps[id] = l.steps.length;
        l.steps.forEach(function (st, i) {
          if (st.type === 'try') {
            if (!st.options || st.options.indexOf(st.answer) < 0) out.bad.push(id + ' step ' + (i + 1) + ': answer not among choices');
            if (st.options && st.options.some(function (o) { return String(o).indexOf('"') >= 0; })) out.bad.push(id + ' step ' + (i + 1) + ': a choice contains a double quote');
          } else if (st.type !== 'sort' && st.type !== 'match' && !st.text && !st.visual) out.bad.push(id + ' step ' + (i + 1) + ': nothing to show');
        });
      });
      return JSON.stringify(out);
    })()
  `));
  ok('lessons: every English skill has a lesson that can be found by its skill id', lessons.none.length === 0,
     lessons.none.length ? 'NO LESSON: ' + lessons.none.join(', ') : Object.keys(lessons.steps).length + ' skills');
  ok('lessons: every try-it step has its answer among its choices', lessons.bad.length === 0, show(lessons.bad));

  const text = JSON.parse(run(`JSON.stringify(['grammar','sentence','comprehension','vocab'].map(function (id) { return getWordLesson(id).steps.map(function (s) { return (s.text || '') + ' ' + (s.prompt || '') + ' ' + (s.lumiTip || ''); }).join(' '); }))`));
  const [gram, sent, comp, voc] = text;
  const need = [
    ['past tense', /Past tense/.test(gram) && /Irregular/.test(gram)],
    ['subject-verb agreement', /match the subject/.test(gram)],
    ['pronouns', /Pronouns change/.test(gram)],
    ['prepositions', /Prepositions/.test(gram)],
    ['conjunctions', /Joining words/.test(gram)],
    ['comparatives', /Comparing/.test(gram)],
    ['articles', /Articles/.test(gram)],
    ['question words', /Question words/.test(gram)],
    ['contractions', /Short forms/.test(gram)],
    ['joining sentences', /Joining two sentences/.test(sent) && /Because and so/.test(sent)],
    ['kinds of reading question', /Four kinds of question/.test(comp)],
    ['synonyms and antonyms', /Synonyms/.test(voc) && /Antonyms/.test(voc)]
  ].filter(n => !n[1]).map(n => n[0]);
  ok('lessons: each new topic is taught before it is tested', need.length === 0, need.length ? 'MISSING: ' + need.join(', ') : '12 topics');
}

// ---- report ----
console.log('\n============ ENGLISH P2 LADDER ============\n');
let pass = 0, fail = 0;
R.forEach(r => {
  console.log((r.pass ? '  PASS  ' : '> FAIL <') + ' ' + r.name + (r.extra ? '\n            [' + r.extra + ']' : ''));
  r.pass ? pass++ : fail++;
});
console.log('\n  ' + pass + ' passed, ' + fail + ' failed, ' + R.length + ' total\n');
process.exit(fail ? 1 : 0);
