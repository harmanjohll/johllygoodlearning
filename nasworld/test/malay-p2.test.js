// Dunia Melayu, Primary 2 layer.
//
// A previous round shipped three Malay mistakes to a child: a sentence
// that began with a small letter, "angin" glossed as "windy", and raw
// template slots printed on a card. Each of those is cheap to catch by
// machine, so this file catches them, along with the usual ways a
// generated question goes wrong (the answer missing from the choices, a
// choice offered twice, a type nothing knows how to draw).
//
// What a machine cannot do is tell whether the Malay is right. That is
// the job of src/malay/P2_REVIEW.md and a Malay speaker. This file only
// checks that the sheet is the one the data would produce today, so the
// reviewer is never ticking a stale list.

const fs = require('fs');
const vm = require('vm');
const path = require('path');

process.on('uncaughtException', e => { if (!/Cannot (set|read) propert/.test(String(e && e.message))) throw e; });
process.on('unhandledRejection', e => { if (!/Cannot (set|read) propert/.test(String(e && e.message))) throw e; });

const html = fs.readFileSync(path.join(__dirname, '../dist/bundle.html'), 'utf8');
const blocks = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m => m[1]);
const code = blocks.sort((a, b) => b.length - a.length)[0];

const noop = () => {};
const el = () => {
  const node = {
    classList: { add: noop, remove: noop, toggle: noop, contains: () => false },
    style: {}, dataset: {}, appendChild: c => c, removeChild: noop, remove: noop,
    removeAttribute: noop, setAttribute: noop, getAttribute: () => null,
    addEventListener: noop, removeEventListener: noop, insertAdjacentHTML: noop,
    textContent: '', innerHTML: '', innerText: '', value: '', checked: false,
    offsetHeight: 0, offsetWidth: 0, scrollIntoView: noop, focus: noop, blur: noop, click: noop,
    parentElement: null, parentNode: null, firstChild: null, children: [], childNodes: [],
    getBoundingClientRect: () => ({ left: 0, top: 0, right: 100, bottom: 100, width: 100, height: 100 }),
    getContext: () => null, closest: () => null, contains: () => false,
    cloneNode: () => el(), replaceWith: noop, after: noop, before: noop,
    animate: () => ({ finished: Promise.resolve(), cancel: noop })
  };
  node.querySelector = () => el();
  node.querySelectorAll = () => [];
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
const ok = (name, cond, extra = '') => R.push({ name, pass: !!cond, extra: extra || '' });
const run = expr => vm.runInContext(expr, sandbox);
const D = name => JSON.parse(run('JSON.stringify(' + name + ')'));
const first = (arr, n = 5) => arr.slice(0, n).join(' | ');

run('state = state || {}; state.skills = {}; state.tokens = 0;');

const P2 = ['imbuhan', 'ganda', 'penjodoh', 'tanya', 'adjektif', 'sendi', 'hubung', 'peribahasa', 'kefahaman', 'binaayat'];
const P1 = ['huruf', 'nombor', 'salam', 'warna', 'keluarga', 'haiwan', 'badan', 'makanan', 'hari', 'ayat'];
const TYPES = ['malay-p2-mcq', 'malay-p2-passage', 'malay-p2-order'];

const SENTENCE = /^[A-Z][^]*[.?]$/;
const PLACEHOLDER = /[{}]|undefined|\bnull\b|NaN|\[object/;
const EMOJI = /[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{FE0F}]/u;

// ------------------------------------------------------------------
// 1. The tree
// ------------------------------------------------------------------
const tree = D('MALAY_TREE');
ok('Tree: the ten P1 skills are still there, untouched ids', P1.every(id => tree[id] && tree[id].id === id && /^P1 /.test(tree[id].grade)));
ok('Tree: ten P2 skills, all graded "P2 Expansion"',
   P2.every(id => tree[id] && tree[id].id === id && tree[id].grade === 'P2 Expansion') && Object.keys(tree).length === 20,
   Object.keys(tree).length + ' skills in the tree');
{
  const bad = [];
  P2.forEach(id => {
    const deps = (tree[id] || {}).deps || [];
    if (!deps.length) bad.push(id + ' has no deps');
    deps.forEach(d => { if (P1.indexOf(d) === -1) bad.push(id + ' depends on ' + d); });
    if (!tree[id].name || !tree[id].icon || !tree[id].desc) bad.push(id + ' is missing name, icon or desc');
  });
  ok('Tree: every P2 skill depends on P1 skills that exist', bad.length === 0, first(bad));
}
ok('Generators: the skill list in malay-gen.js matches the tree', JSON.stringify(D('MALAY_P2_SKILLS').slice().sort()) === JSON.stringify(P2.slice().sort()));

// ------------------------------------------------------------------
// 2. Generate a few hundred of each and check what she would see
// ------------------------------------------------------------------
const PER_LEVEL = 120;            // x 5 levels = 600 per skill
const seen = {};                  // skill -> Set of distinct questions
const typesSeen = new Set();

P2.forEach(skill => {
  seen[skill] = new Set();
  const bad = {};
  const note = k => { bad[k] = (bad[k] || 0) + 1; };
  const levelsWithOutput = new Set();

  for (let lvl = 0; lvl <= 4; lvl++) {
    for (let i = 0; i < PER_LEVEL; i++) {
      run('state.skills = {}; getSkillState(' + JSON.stringify(skill) + ').level = ' + lvl + ';');
      let q;
      try { q = JSON.parse(run('JSON.stringify(generateMalayQuestion(' + JSON.stringify(skill) + '))')); }
      catch (e) { note('generator threw: ' + String(e.message).slice(0, 60)); continue; }
      if (!q || typeof q !== 'object') { note('generator returned nothing'); continue; }
      levelsWithOutput.add(lvl);
      typesSeen.add(q.type);
      if (TYPES.indexOf(q.type) === -1) { note('unknown type ' + q.type); continue; }

      const label = '[' + (q.text || q.stem || q.answer) + ']';
      seen[skill].add(q.type === 'malay-p2-order' ? q.answer : (q.instruction + '|' + (q.stem || '') + '|' + q.answer));

      // Nothing she reads may carry a template slot, an "undefined", an
      // exclamation mark or an emoji.
      (function walk(v, key) {
        if (typeof v === 'string') {
          if (PLACEHOLDER.test(v)) note('placeholder in ' + key + ' ' + label);
          if (v.indexOf('!') !== -1) note('exclamation mark in ' + key + ' ' + label);
          if (EMOJI.test(v)) note('emoji in ' + key + ' ' + label);
          if (!v.trim() && key !== 'full') note('empty string in ' + key + ' ' + label);
        } else if (Array.isArray(v)) v.forEach(x => walk(x, key));
        else if (v && typeof v === 'object') Object.keys(v).forEach(k => walk(v[k], k));
        else if (v === null || v === undefined) note('null in ' + key + ' ' + label);
      })(q, 'q');

      // The English shown after answering.
      if (typeof q.gloss !== 'string' || q.gloss.length < 3) note('no English gloss ' + label);
      if (typeof q.instruction !== 'string' || !q.instruction) note('no instruction ' + label);
      if (typeof q.hint !== 'string' || !q.hint) note('no hint ' + label);

      // A finished Malay sentence is a sentence.
      if (q.full !== undefined) {
        if (!SENTENCE.test(q.full)) note('"full" is not a capitalised, punctuated sentence ' + label);
        if (q.full.indexOf('____') !== -1) note('"full" still has a blank ' + label);
      }
      // Anything that ends like a sentence must start like one. A blank
      // at the very front is allowed: its choices are checked below.
      ['stem', 'stemReply'].forEach(k => {
        const s = q[k];
        if (typeof s === 'string' && /[.?]$/.test(s) && !/^(____|[A-Z])/.test(s)) note(k + ' starts with a small letter ' + label);
      });
      if (typeof q.stem === 'string' && (q.stem.match(/____/g) || []).length > 1) note('more than one blank ' + label);
      if (q.passage) {
        q.passage.text.split(/(?<=[.?])\s+/).forEach(s => { if (!SENTENCE.test(s)) note('passage sentence malformed: ' + s.slice(0, 30)); });
      }

      if (q.type === 'malay-p2-order') {
        const words = q.answer.split(' ');
        if (!SENTENCE.test(q.answer)) note('order answer is not a sentence ' + label);
        if (words.length < 5 || words.length > 8) note('order sentence has ' + words.length + ' words ' + label);
        if (JSON.stringify(q.words.slice().sort()) !== JSON.stringify(words.slice().sort())) note('tiles do not match the answer ' + label);
        if (q.words.join(' ') === q.answer) note('tiles arrive already in order ' + label);
        if (new Set(q.words).size !== q.words.length) note('two identical tiles ' + label);
        if (!Array.isArray(q.accept) || q.accept.indexOf(q.answer) === -1) note('accept list lacks the answer ' + label);
        sandbox.__q = q;
        if (!run('malayP2OrderIsRight(__q, __q.answer)')) note('checker rejects the right order ' + label);
        if (run('malayP2OrderIsRight(__q, __q.words.join(" "))')) note('checker accepts the scrambled order ' + label);
        const swapped = words.slice(); const t = swapped[1]; swapped[1] = swapped[2]; swapped[2] = t;
        sandbox.__s = swapped.join(' ');
        if (run('malayP2OrderIsRight(__q, __s)')) note('checker accepts a swapped order ' + label);
      } else {
        const o = q.options;
        if (!Array.isArray(o) || o.length < 3) { note('fewer than three choices ' + label); }
        else {
          const hits = o.filter(x => String(x) === String(q.answer)).length;
          if (hits !== 1) note('answer appears ' + hits + ' times in the choices ' + label);
          if (new Set(o.map(String)).size !== o.length) note('same choice twice ' + label);
          // A choice that stands at the front of a sentence, or is a
          // whole sentence, must be capitalised.
          const frontBlank = typeof q.stem === 'string' && q.stem.indexOf('____') === 0;
          o.forEach(x => {
            if ((frontBlank || /[.?]$/.test(x)) && !/^[A-Z]/.test(x)) note('choice "' + x + '" needs a capital ' + label);
            if (/[.?]$/.test(x) && !SENTENCE.test(x)) note('choice "' + x + '" is a malformed sentence ' + label);
          });
          if (q.full && typeof q.stem === 'string' && q.stem.indexOf('____') !== -1 &&
              q.full.indexOf(q.stem.replace('____', q.answer)) !== 0) note('"full" is not the stem with the answer in ' + label);
        }
      }

      // It must draw, and the card must be clean too.
      sandbox.__q = q;
      const out = run('(function () { var c = __card(); var h; try { h = renderMalayQuestion(c, __q); } catch (e) { return { err: String(e.message) }; } return { handled: h, html: String(c.innerHTML) }; })()');
      if (out.err) note('renderer threw: ' + out.err.slice(0, 50));
      else {
        if (out.handled !== true) note('no renderer for type ' + q.type);
        if (!out.html) note('empty card ' + label);
        if (PLACEHOLDER.test(out.html)) note('placeholder on the card ' + label);
        if (out.html.replace(/<[^>]*>/g, '').indexOf('!') !== -1) note('exclamation mark on the card ' + label);
      }
      // And so must the panel shown after answering, right or wrong.
      [true, false].forEach(right => {
        sandbox.__right = right;
        const rev = run('malayP2RevealHTML(__q, __right)');
        if (PLACEHOLDER.test(rev)) note('placeholder in the reveal ' + label);
        if (rev.indexOf('In English:') === -1 || rev.indexOf(run('_malayP2Esc(__q.gloss)')) === -1) note('reveal does not show the English ' + label);
        if (!right && rev.indexOf(run('_malayP2Esc(__q.answer)')) === -1) note('reveal does not show the answer ' + label);
      });
    }
  }
  const keys = Object.keys(bad);
  ok(skill + ': ' + (PER_LEVEL * 5) + ' generated questions are clean, answerable and drawable',
     keys.length === 0 && levelsWithOutput.size === 5,
     keys.length ? first(keys.map(k => k + ' (x' + bad[k] + ')'), 4) : seen[skill].size + ' distinct questions seen');
});

P2.forEach(skill => ok(skill + ': at least 25 distinct questions', seen[skill].size >= 25, seen[skill].size + ' distinct'));
ok('Every emitted type has a renderer', [...typesSeen].every(t => TYPES.indexOf(t) !== -1) && typesSeen.size === 3, [...typesSeen].join(', '));
ok('An unknown type is still refused by the Malay renderer', run('renderMalayQuestion(__card(), { type: "malay-p2-nope" })') === false);

// The difficulty ladder does something: the bottom and top rungs differ.
P2.forEach(skill => {
  const at = lvl => {
    const s = new Set();
    for (let i = 0; i < 150; i++) {
      run('state.skills = {}; getSkillState(' + JSON.stringify(skill) + ').level = ' + lvl + ';');
      const q = JSON.parse(run('JSON.stringify(generateMalayQuestion(' + JSON.stringify(skill) + '))'));
      s.add((q.instruction || '') + '|' + (q.stem || q.answer));
    }
    return s;
  };
  const low = at(0), high = at(4);
  const onlyHigh = [...high].filter(x => !low.has(x)).length;
  ok(skill + ': level 4 asks things level 0 does not', onlyHigh > 0, onlyHigh + ' of ' + high.size + ' are new at level 4');
});

// ------------------------------------------------------------------
// 3. The data itself
// ------------------------------------------------------------------

// meN- assimilation, from an independent statement of the rule.
function meN(root) {
  const c = root[0];
  if ((root.match(/[aeiou]/g) || []).length === 1) return 'menge' + root;
  if (root.startsWith('ny')) return 'me' + root;
  if ('lmnrwy'.includes(c)) return 'me' + root;
  if (c === 'b') return 'mem' + root;
  if (c === 'p') return 'mem' + root.slice(1);
  if ('cdjz'.includes(c)) return 'men' + root;
  if (c === 't') return 'men' + root.slice(1);
  if (c === 'k') return 'meng' + root.slice(1);
  if (c === 's') return 'meny' + root.slice(1);
  if ('aeiough'.includes(c)) return 'meng' + root;
  return null;
}
const MEN = D('MALAY_P2_MEN');
{
  const bad = MEN.filter(m => meN(m.root) !== m.form).map(m => m.root + ' -> ' + m.form + ' (rule says ' + meN(m.root) + ')');
  ok('Imbuhan: every me- form follows the assimilation rule', MEN.length >= 60 && bad.length === 0, bad.length ? first(bad) : MEN.length + ' roots');

  const spot = { pukul: 'memukul', tulis: 'menulis', kira: 'mengira', sapu: 'menyapu', baca: 'membaca', cari: 'mencari', ambil: 'mengambil', lukis: 'melukis', cat: 'mengecat' };
  const got = {}; MEN.forEach(m => { got[m.root] = m.form; });
  const miss = Object.keys(spot).filter(r => got[r] !== spot[r]);
  ok('Imbuhan: the nine textbook examples are present and right', miss.length === 0, miss.join(', '));

  const classes = { me: 0, mem: 0, memDrop: 0, men: 0, menDrop: 0, meng: 0, mengDrop: 0, meny: 0, menge: 0 };
  MEN.forEach(m => {
    const c = m.root[0];
    if (m.form.startsWith('menge') && (m.root.match(/[aeiou]/g) || []).length === 1) classes.menge++;
    else if (c === 'p') classes.memDrop++; else if (c === 'b') classes.mem++;
    else if (c === 't') classes.menDrop++; else if ('cdj'.includes(c)) classes.men++;
    else if (c === 'k') classes.mengDrop++; else if (c === 's') classes.meny++;
    else if ('aeiough'.includes(c)) classes.meng++; else classes.me++;
  });
  ok('Imbuhan: every form of meN- is represented', Object.values(classes).every(n => n >= 3), JSON.stringify(classes));

  const forms = new Set(MEN.map(m => m.form));
  const real = new Set(D('MALAY_P2_MEN_REAL_WORDS'));
  const clash = [];
  MEN.forEach(m => {
    sandbox.__m = m;
    const wrong = JSON.parse(run('JSON.stringify(malayP2MenWrong(__m))'));
    if (wrong.length < 3) clash.push(m.root + ' has only ' + wrong.length + ' wrong spellings');
    wrong.forEach(w => { if (forms.has(w) || real.has(w) || w === m.form) clash.push(m.root + ': "' + w + '" is a real word'); });
  });
  ok('Imbuhan: no wrong spelling is itself a real word on our lists', clash.length === 0, first(clash));
  ok('Imbuhan: no root appears twice', new Set(MEN.map(m => m.root)).size === MEN.length);
}
{
  const BER = D('MALAY_P2_BER');
  const rule = r => r === 'ajar' ? 'belajar' : (r === 'kerja' ? 'bekerja' : (r[0] === 'r' ? 'be' + r : 'ber' + r));
  const bad = BER.filter(b => rule(b.root) !== b.form).map(b => b.root + ' -> ' + b.form);
  ok('Imbuhan: every ber- form follows the rule (be- before r, bekerja)', BER.length >= 10 && bad.length === 0, first(bad));
}

// Fill-in sentences, across every skill that has them.
const blanks = [];
const addBlanks = (name, rows, ansKey) => rows.forEach(r => { if (r.s) blanks.push({ src: name, s: r.s, a: r[ansKey || 'a'], o: r.o || [] }); });
addBlanks('imbuhan', D('MALAY_P2_IMBUHAN_AYAT'));
addBlanks('ganda', D('MALAY_P2_GANDA_AYAT'));
addBlanks('penjodoh', D('MALAY_P2_PB_AYAT'));
addBlanks('adjektif', D('MALAY_P2_ADJ_AYAT'));
addBlanks('sendi', D('MALAY_P2_SENDI'));
addBlanks('hubung', D('MALAY_P2_HUBUNG'));
addBlanks('peribahasa', D('MALAY_P2_SIMPULAN'), 'id');
{
  const bad = [];
  blanks.forEach(b => {
    if ((b.s.match(/____/g) || []).length !== 1) bad.push(b.src + ': not exactly one blank: ' + b.s);
    const full = b.s.replace('____', b.a);
    if (!SENTENCE.test(full)) bad.push(b.src + ': not a sentence: ' + full);
    if (/\s\s|\s[.?,]/.test(full)) bad.push(b.src + ': stray space: ' + full);
    if (b.o.length < 2) bad.push(b.src + ': fewer than two wrong choices: ' + b.s);
    if (b.o.indexOf(b.a) !== -1) bad.push(b.src + ': the answer is also a wrong choice: ' + b.s);
    if (new Set(b.o).size !== b.o.length) bad.push(b.src + ': a wrong choice twice: ' + b.s);
    if (b.s.indexOf('____') === 0) b.o.concat(b.a).forEach(x => { if (!/^[A-Z]/.test(x)) bad.push(b.src + ': front-of-sentence choice needs a capital: ' + x); });
  });
  ok('Fill-in sentences: one blank, capital, full stop, clean choices', blanks.length >= 150 && bad.length === 0, bad.length ? first(bad, 3) : blanks.length + ' sentences');
  ok('Fill-in sentences: no sentence is used twice', new Set(blanks.map(b => b.s)).size === blanks.length);
}
{
  // "Ali tertendang bola" is good Malay, so ter- must never be a decoy.
  const bad = D('MALAY_P2_IMBUHAN_AYAT').filter(x => x.o.some(w => /^ter/.test(w))).map(x => x.s);
  const each = ['me', 'ber', 'di', 'ter'].map(p => D('MALAY_P2_IMBUHAN_AYAT').filter(x => x.p === p).length);
  ok('Imbuhan: ter- is never a wrong choice, and all four prefixes have sentences', bad.length === 0 && each.every(n => n >= 5), first(bad) || each.join('/'));
}
{
  const bad = [];
  D('MALAY_P2_GANDA_AYAT').forEach(x => {
    if (x.a.indexOf('-') !== -1) bad.push('answer is doubled: ' + x.s);
    x.o.forEach(w => { const p = w.split('-'); if (p.length !== 2 || p[0] !== p[1]) bad.push('wrong choice is not a doubled word: ' + w); });
    if (!/\b(dua|tiga|empat|lima|enam|tujuh|lapan|sembilan|sepuluh|semua|banyak|beberapa|para|setiap|kedua-dua)\b/i.test(x.s)) bad.push('no number or quantity word: ' + x.s);
  });
  D('MALAY_P2_GANDA_PLURAL').forEach(x => { if (!x.one || !x.many || x.one === x.many) bad.push('plural gloss: ' + x.w); });
  D('MALAY_P2_GANDA_SEMU').forEach(x => { const p = x.w.split('-'); if (p.length !== 2 || p[0] !== p[1]) bad.push('not doubled: ' + x.w); });
  ok('Kata ganda: the rule items really are rule items', bad.length === 0, first(bad));
}
{
  const core = D('MALAY_P2_PB_CORE'), extra = D('MALAY_P2_PB_EXTRA'), PB = D('MALAY_P2_PB');
  const bad = [];
  const nouns = new Set();
  PB.forEach(x => {
    if (nouns.has(x.n)) bad.push('noun twice: ' + x.n); nouns.add(x.n);
    if ((x.extra ? extra : core).indexOf(x.pb) === -1) bad.push(x.n + ': classifier ' + x.pb + ' is on the wrong list');
    (x.not || []).forEach(n => { if (core.indexOf(n) === -1) bad.push(x.n + ': "not" names unknown ' + n); });
    if (!x.one || !x.many) bad.push(x.n + ': missing English');
    for (let i = 0; i < 20; i++) {
      sandbox.__m = x;
      const wrong = JSON.parse(run('JSON.stringify(malayP2PbWrong(__m))'));
      if (wrong.length !== 3) bad.push(x.n + ': ' + wrong.length + ' wrong classifiers');
      wrong.forEach(w => { if (w === x.pb || (x.not || []).indexOf(w) !== -1) bad.push(x.n + ': offered ' + w + ' as wrong'); });
    }
  });
  const want = ['orang', 'ekor', 'buah', 'biji', 'batang', 'helai', 'keping', 'kuntum', 'pasang'];
  const have = want.filter(w => PB.filter(x => x.pb === w).length >= 4);
  D('MALAY_P2_PB_AYAT').forEach(x => { x.o.concat(x.a).forEach(w => { if (core.indexOf(w) === -1) bad.push('sentence uses unknown classifier ' + w); }); });
  ok('Penjodoh: all nine core classifiers, and a debatable one is never marked wrong', bad.length === 0 && have.length === 9, first([...new Set(bad)]) || PB.length + ' nouns');
}
{
  const T = D('MALAY_P2_TANYA'), TA = D('MALAY_P2_TANYA_AYAT');
  const bad = [];
  ['apa', 'siapa', 'bila', 'di mana', 'mengapa', 'bagaimana', 'berapa'].forEach(w => {
    if (!T.some(t => t.w === w)) bad.push('missing ' + w);
    if (TA.filter(x => x.w === w).length < 3) bad.push('fewer than three sentences for ' + w);
  });
  T.forEach(t => { if (!/^[A-Z].*kah$/.test(t.kah)) bad.push('-kah form: ' + t.kah); });
  TA.forEach(x => {
    if (x.q.indexOf('____') !== 0 || !/\?$/.test(x.q)) bad.push('question shape: ' + x.q);
    if (!SENTENCE.test(x.r)) bad.push('reply is not a sentence: ' + x.r);
    (x.not || []).forEach(n => { if (!T.some(t => t.w === n)) bad.push('"not" names unknown ' + n); });
  });
  ok('Kata tanya: all seven words, questions end in ?, replies are sentences', bad.length === 0, first(bad));
}
{
  const A = D('MALAY_P2_ANTONIM'), S = D('MALAY_P2_SINONIM');
  const bad = [];
  const words = [];
  A.forEach(p => { words.push(p.a, p.b); if (!p.ea || !p.eb) bad.push('missing English: ' + p.a); });
  if (new Set(words).size !== words.length) bad.push('a word sits in two antonym pairs');
  A.forEach(p => p.avoid.forEach(w => { if (words.indexOf(w) === -1) bad.push(p.a + ': avoid names unknown ' + w); }));
  // Avoid lists must hold both ways, or the clash leaks through the other side.
  A.forEach(p => p.avoid.forEach(w => {
    const other = A.filter(o => o.a === w || o.b === w)[0];
    if (other && other.avoid.indexOf(p.a) === -1 && other.avoid.indexOf(p.b) === -1) bad.push(p.a + '/' + p.b + ' avoids ' + w + ' but not the reverse');
  }));
  S.forEach(p => {
    if (p.o.length !== 3 || new Set(p.o).size !== 3) bad.push(p.a + ': needs three different wrong choices');
    if (p.o.indexOf(p.a) !== -1 || p.o.indexOf(p.b) !== -1) bad.push(p.a + ': the pair is among its own wrong choices');
    // No wrong choice may be a listed synonym of either word.
    S.forEach(o => { if (o !== p && (p.o.indexOf(o.a) !== -1) !== (p.o.indexOf(o.b) !== -1) && (o.a === p.a || o.b === p.b)) bad.push(p.a + ': clash with ' + o.a); });
  });
  ['besar', 'kecil', 'rajin', 'malas'].forEach(w => { if (words.indexOf(w) === -1) bad.push('missing ' + w); });
  ok('Adjektif: antonym and synonym tables are consistent', A.length >= 20 && S.length >= 10 && bad.length === 0, first(bad) || A.length + ' antonym pairs, ' + S.length + ' synonym pairs');
}
{
  const S = D('MALAY_P2_SENDI');
  const six = ['di', 'ke', 'dari', 'pada', 'kepada', 'daripada'];
  const bad = [];
  S.forEach(x => x.o.concat(x.a).forEach(w => { if (six.indexOf(w.toLowerCase()) === -1) bad.push('unknown word ' + w); }));
  six.forEach(w => { if (S.filter(x => x.a.toLowerCase() === w).length < 5) bad.push('fewer than five sentences for ' + w); });
  // The classic pairs must actually be set against each other somewhere.
  const versus = (a, b) => S.some(x => x.a === a && x.o.indexOf(b) !== -1);
  if (!versus('pada', 'di')) bad.push('pada is never set against di');
  if (!versus('kepada', 'ke')) bad.push('kepada is never set against ke');
  if (!versus('daripada', 'dari')) bad.push('daripada is never set against dari');
  if (!versus('dari', 'daripada')) bad.push('dari is never set against daripada');
  ok('Kata sendi nama: all six, and place is set against person and time', bad.length === 0, first(bad) || S.length + ' sentences');
}
{
  const H = D('MALAY_P2_HUBUNG');
  const six = ['dan', 'tetapi', 'kerana', 'atau', 'lalu', 'sambil'];
  const bad = [];
  H.forEach(x => x.o.concat(x.a).forEach(w => { if (six.indexOf(w) === -1) bad.push('unknown word ' + w); }));
  six.forEach(w => { if (H.filter(x => x.a === w).length < 5) bad.push('fewer than five sentences for ' + w); });
  ok('Kata hubung: all six joining words have sentences', bad.length === 0, first(bad) || H.length + ' sentences');
}
{
  const P = D('MALAY_P2_SIMPULAN');
  const ids = P.map(p => p.id);
  const bad = [];
  ['ringan tulang', 'buah tangan', 'anak emas', 'kaki bangku', 'panjang tangan', 'besar hati', 'ada hati', 'cahaya mata', 'buah hati', 'campur tangan']
    .forEach(w => { if (ids.indexOf(w) === -1) bad.push('missing ' + w); });
  if (new Set(ids).size !== ids.length) bad.push('an idiom is listed twice');
  if (new Set(P.map(p => p.en)).size !== P.length) bad.push('two idioms share one English meaning');
  P.forEach(p => {
    p.avoid.forEach(a => { if (ids.indexOf(a) === -1) bad.push(p.id + ': avoid names unknown ' + a); });
    if (!p.s) return;
    if (p.o.length !== 3) bad.push(p.id + ': needs three wrong choices');
    p.o.forEach(w => {
      if (ids.indexOf(w) === -1) bad.push(p.id + ': wrong choice ' + w + ' is not a listed idiom');
      const other = P.filter(x => x.id === w)[0];
      if (p.avoid.indexOf(w) !== -1 || (other && other.avoid.indexOf(p.id) !== -1)) bad.push(p.id + ': wrong choice ' + w + ' is too close in meaning');
    });
    if (!p.sen) bad.push(p.id + ': sentence has no English');
  });
  ok('Peribahasa: the ten named idioms and more, with no near-synonym as a decoy', P.length >= 20 && bad.length === 0, first(bad) || P.length + ' idioms');
}
{
  const K = D('MALAY_P2_KEFAHAMAN');
  const bad = [];
  let nq = 0;
  K.forEach(p => {
    const n = p.text.split(/\s+/).length;
    if (n < 40 || n > 80) bad.push(p.id + ': ' + n + ' words');
    p.text.split(/(?<=[.?])\s+/).forEach(s => { if (!SENTENCE.test(s)) bad.push(p.id + ': malformed sentence: ' + s.slice(0, 30)); });
    if (!p.en || !p.title) bad.push(p.id + ': no title or English');
    p.qs.forEach(q => {
      nq++;
      if (!/^[A-Z].*\?$/.test(q.q)) bad.push(p.id + ': question shape: ' + q.q);
      if (q.o.length !== 2 || q.o.indexOf(q.a) !== -1 || q.o[0] === q.o[1]) bad.push(p.id + ': choices: ' + q.q);
      if (!q.en) bad.push(p.id + ': no English: ' + q.q);
      // A stated-fact answer must be findable in the passage, and a
      // wrong choice must not be (unless the question is "which is not").
      const text = p.text.toLowerCase();
      const isNot = /\btidak\b/.test(q.q);
      if (q.lvl < 2 && text.indexOf(q.a.toLowerCase().replace(/^(pada waktu |pada |di |dengan )/, '')) === -1) bad.push(p.id + ': answer not in passage: ' + q.a);
      if (isNot && text.indexOf(q.a.toLowerCase()) !== -1 && q.a !== 'membuat bising') bad.push(p.id + ': "not" answer is in the passage: ' + q.a);
    });
    if (![0, 1, 2].every(l => p.qs.some(q => q.lvl === l))) bad.push(p.id + ': needs a question at every level');
  });
  ok('Kefahaman: passages of 40 to 80 words, every sentence well-formed, answers in the text', K.length >= 5 && nq >= 25 && bad.length === 0, first(bad, 3) || K.length + ' passages, ' + nq + ' questions');
}
{
  const B = D('MALAY_P2_BINA');
  const bad = [];
  B.forEach(x => {
    const w = x.s.split(' ');
    if (!SENTENCE.test(x.s)) bad.push('not a sentence: ' + x.s);
    if (w.length < 5 || w.length > 8) bad.push(w.length + ' words: ' + x.s);
    if (new Set(w).size !== w.length) bad.push('repeated word: ' + x.s);
    // Only the first tile may be capitalised, unless it is the last one
    // (which the full stop already pins). Otherwise two tiles could
    // each claim the front.
    w.slice(1, -1).forEach(t => { if (/^[A-Z]/.test(t)) bad.push('capital in the middle: ' + x.s); });
    if (/[,;:]/.test(x.s)) bad.push('inner punctuation: ' + x.s);
    if (!x.en) bad.push('no English: ' + x.s);
  });
  if (new Set(B.map(x => x.s)).size !== B.length) bad.push('a sentence is listed twice');
  ok('Bina ayat: 5 to 8 words, one capital, one full stop, no repeated tile', B.length >= 25 && bad.length === 0, first(bad, 3) || B.length + ' sentences');
}

// Every Malay string in the P2 data: no Indonesian forms, no exclamation
// marks, no emoji, no placeholders.
{
  // Listed by hand: these are `const`, so they are not on the global object.
  const names = ['MALAY_P2_MEN', 'MALAY_P2_MEN_REAL_WORDS', 'MALAY_P2_BER', 'MALAY_P2_IMBUHAN_AYAT',
    'MALAY_P2_GANDA_PLURAL', 'MALAY_P2_GANDA_SEMU', 'MALAY_P2_GANDA_FRASA', 'MALAY_P2_GANDA_AYAT', 'MALAY_P2_GANDA_PILIH',
    'MALAY_P2_PB_CORE', 'MALAY_P2_PB_EXTRA', 'MALAY_P2_PB', 'MALAY_P2_NUM_EN', 'MALAY_P2_PB_AYAT', 'MALAY_P2_PB_NOTE',
    'MALAY_P2_TANYA', 'MALAY_P2_TANYA_AYAT', 'MALAY_P2_ANTONIM', 'MALAY_P2_SINONIM', 'MALAY_P2_ADJ_AYAT',
    'MALAY_P2_SENDI', 'MALAY_P2_SENDI_NOTE', 'MALAY_P2_HUBUNG_KATA', 'MALAY_P2_HUBUNG', 'MALAY_P2_HUBUNG_NOTE',
    'MALAY_P2_SIMPULAN', 'MALAY_P2_KEFAHAMAN', 'MALAY_P2_BINA'];
  const declared = (code.match(/^(?:const|var) (MALAY_P2_[A-Z_]+) =/gm) || []).map(l => l.replace(/^(?:const|var) /, '').replace(' =', ''))
    .filter(n => n !== 'MALAY_P2_SKILLS');
  ok('P2 data: this test knows about every MALAY_P2_ table', declared.every(n => names.indexOf(n) !== -1) && declared.length === names.length,
     declared.filter(n => names.indexOf(n) === -1).join(', '));
  const all = [];
  names.forEach(n => (function walk(v) {
    if (typeof v === 'string') all.push(v);
    else if (Array.isArray(v)) v.forEach(walk);
    else if (v && typeof v === 'object') Object.keys(v).forEach(k => walk(v[k]));
  })(D(n)));
  const INDONESIAN = /\b(bisa|sepeda|karena|mobil|sepatu|uang|kantor|kamar|sore|senin|kamis|jumat|minggu depan|gimana|nggak|bicara|pintar|cantik sekali banget)\b/i;
  const bad = all.filter(s => INDONESIAN.test(s) || s.indexOf('!') !== -1 || EMOJI.test(s) || PLACEHOLDER.test(s));
  ok('P2 data: no Indonesian forms, exclamation marks, emoji or placeholders', all.length > 1500 && bad.length === 0, first(bad, 3) || all.length + ' strings');
  ok('P2 data: "baharu" is used for the adjective new', all.some(s => /\bbaharu\b/.test(s)) && !all.some(s => /\b(baju|mainan|kasut|buku|rumah|kereta) baru\b/.test(s)));
}

// ------------------------------------------------------------------
// 4. Lessons and flashcards
// ------------------------------------------------------------------
{
  const bad = [];
  P2.forEach(id => {
    sandbox.__id = id;
    const L = JSON.parse(run('JSON.stringify(getMalayLesson(__id))'));
    if (!L || !L.title || !L.lumiSays || !Array.isArray(L.steps) || L.steps.length < 4) { bad.push(id + ': no lesson'); return; }
    if (L.title !== tree[id].name) bad.push(id + ': lesson title differs from the skill name');
    const tries = L.steps.filter(s => s.type === 'try');
    if (tries.length < 2) bad.push(id + ': fewer than two try-it steps');
    tries.forEach(s => {
      if (s.options.filter(o => o === s.answer).length !== 1) bad.push(id + ': try-it answer not among its options exactly once');
      if (new Set(s.options).size !== s.options.length) bad.push(id + ': try-it repeats an option');
      if (!s.successMsg || !s.explanation) bad.push(id + ': try-it lacks feedback text');
    });
    const text = JSON.stringify(L);
    if (text.indexOf('!') !== -1) bad.push(id + ': exclamation mark in the lesson');
    if (EMOJI.test(text)) bad.push(id + ': emoji in the lesson');
    if (/undefined|\bnull\b|NaN/.test(text)) bad.push(id + ': placeholder in the lesson');
    const cards = JSON.parse(run('JSON.stringify(getMalayFlashcards(__id))'));
    cards.forEach(c => { if (!c.front || !c.back || /undefined|[{}!]/.test(c.front + c.back)) bad.push(id + ': bad flashcard ' + JSON.stringify(c)); });
    if (id !== 'kefahaman' && cards.length < 5) bad.push(id + ': fewer than five flashcards');
  });
  ok('Lessons: every P2 skill has a lesson with two checked try-it steps, and clean flashcards', bad.length === 0, first(bad));
  ok('Lessons: the ten P1 lessons are still there', P1.every(id => { sandbox.__id = id; return run('!!getMalayLesson(__id)'); }));
}

// ------------------------------------------------------------------
// 5. Wiring outside src/malay
// ------------------------------------------------------------------
ok('Wiring: every P2 skill resolves to the Malay world', P2.every(id => { sandbox.__id = id; return run('getSkillWorld(__id)') === 'malay'; }));
{
  const nodes = JSON.parse(run('JSON.stringify(getMegaNodes())')).filter(n => n.kind === 'skill' && n.world === 'malay');
  const edges = JSON.parse(run('JSON.stringify(buildMegaEdges())'));
  const linked = P2.filter(id => edges.some(e => e.type === 'phenomenon' && e.to === id));
  ok('Wiring: all twenty Malay skills are on the mega map, and P2 skills join its themes', nodes.length === 20 && linked.length >= 5,
     nodes.length + ' nodes, ' + linked.length + ' P2 skills linked to a theme');
}
{
  // While the layer awaits a Malay speaker's review it stays closed no
  // matter how well she is doing. See the review gate in malay-tree.js.
  run('state.skills = {}; getSkillState("ayat").mastery = 100;');
  const gated = run('DUNIA_P2_REVIEWED === false && MALAY_TREE.imbuhan.awaitingReview === true && isSkillUnlocked(MALAY_TREE.imbuhan) === false');
  ok('Review gate: unreviewed P2 Malay stays closed to her', gated === true);
  // With the gate lifted: locked until the P1 skill it builds on reaches 40, then open.
  run('Object.keys(MALAY_TREE).forEach(function (id) { delete MALAY_TREE[id].awaitingReview; });');
  run('state.skills = {};');
  const lockedFirst = run('isSkillUnlocked(MALAY_TREE.imbuhan)');
  run('getSkillState("ayat").mastery = 40;');
  const openAfter = run('isSkillUnlocked(MALAY_TREE.imbuhan)');
  run('state.skills = {};');
  ok('Wiring: a P2 skill unlocks when its P1 skill reaches 40', lockedFirst === false && openAfter === true);
}

// ------------------------------------------------------------------
// 6. The review sheet is current
// ------------------------------------------------------------------
{
  const { build, OUT } = require('./make-p2-review.js');
  let onDisk = '';
  try { onDisk = fs.readFileSync(OUT, 'utf8'); } catch (e) {}
  const fresh = build();
  ok('Review sheet: src/malay/P2_REVIEW.md matches the data (else run: node test/make-p2-review.js)', onDisk === fresh);
  ok('Review sheet: it says plainly that it is awaiting human review', /AWAITING HUMAN REVIEW/.test(onDisk));
  const missing = blanks.map(b => b.s.replace('____', b.a)).concat(D('MALAY_P2_BINA').map(b => b.s), MEN.map(m => m.form))
    .filter(s => onDisk.indexOf(s) === -1);
  ok('Review sheet: every sentence and every me- form is on it', missing.length === 0, first(missing, 3));
}

// ------------------------------------------------------------------
// 7. The tap flow: answer, read the English, tap Next, then it scores
// ------------------------------------------------------------------
{
  // A small fake page, enough to follow the buttons around.
  const mk = id => {
    const n = el(); n.id = id; n.kids = []; n.html = '';
    n.appendChild = c => { if (c.parentElement && c.parentElement.kids) c.parentElement.kids = c.parentElement.kids.filter(k => k !== c); n.kids.push(c); c.parentElement = n; return c; };
    n.querySelectorAll = () => n.kids.slice();
    n.insertAdjacentHTML = (pos, h) => { n.html += h; };
    return n;
  };
  const page = {};
  const fresh = () => { ['question-card', 'malay-order-result', 'malay-order-bank', 'malay-order-msg', 'malay-order-actions', 'malay-p2-next'].forEach(id => { page[id] = mk(id); }); };
  sandbox.__page = page;
  sandbox.__calls = [];
  run('document.getElementById = function (id) { return __page[id] || null; };' +
      'handleCorrect = function () { __calls.push("correct"); };' +
      'handleWrong = function (a) { __calls.push("wrong:" + a); };' +
      'playSound = function () {};');

  const bad = [];
  // Multiple choice, answered right and then wrong.
  [true, false].forEach(right => {
    fresh(); sandbox.__calls.length = 0;
    run('state.skills = {}; getSkillState("sendi").level = 2;');
    run('__q = generateMalayQuestion("sendi"); renderMalayQuestion(__page["question-card"], __q);');
    const q = sandbox.__q;
    const idx = right ? q.options.indexOf(q.answer) : q.options.findIndex(o => o !== q.answer);
    const group = mk('opts');
    const btns = q.options.map(() => { const b = el(); const cls = []; b.classList = { add: c => cls.push(c) }; b.cls = cls; group.appendChild(b); return b; });
    sandbox.__btn = btns[idx]; sandbox.__idx = idx;
    run('malayP2Pick(__btn, __idx)');
    const card = page['question-card'];
    if (sandbox.__calls.length !== 0) bad.push('scored before Next was tapped');
    if (card.html.indexOf('In English:') === -1 || card.html.indexOf(q.full.replace(/&/g, '&amp;')) === -1) bad.push('reveal lacks the Malay sentence or its English');
    if (btns[q.options.indexOf(q.answer)].cls.indexOf('correct') === -1) bad.push('right choice not marked');
    if (!right && btns[idx].cls.indexOf('wrong') === -1) bad.push('wrong pick not marked');
    const before = card.html;
    run('malayP2Pick(__btn, __idx)');
    if (card.html !== before) bad.push('a second tap answered again');
    run('malayP2Next(' + right + '); malayP2Next(' + right + ');');
    const want = right ? 'correct' : 'wrong:' + q.answer;
    if (sandbox.__calls.join(',') !== want) bad.push('scoring was "' + sandbox.__calls.join(',') + '", wanted "' + want + '"');
  });

  // Bina ayat: built right, built wrong, and checked too early.
  ['right', 'wrong', 'early'].forEach(mode => {
    fresh(); sandbox.__calls.length = 0;
    run('state.skills = {}; getSkillState("binaayat").level = 1;');
    run('__q = generateMalayQuestion("binaayat"); renderMalayQuestion(__page["question-card"], __q);');
    const q = sandbox.__q;
    const tiles = {};
    q.words.forEach(w => { const b = el(); b.textContent = w; page['malay-order-bank'].appendChild(b); tiles[w] = b; });
    let order = q.answer.split(' ');
    if (mode === 'wrong') { const t = order[1]; order[1] = order[2]; order[2] = t; }
    if (mode === 'early') order = order.slice(0, 2);
    order.forEach(w => { sandbox.__btn = tiles[w]; run('malayP2Tile(__btn)'); });
    const built = page['malay-order-result'].kids.map(k => k.textContent).join(' ');
    if (built !== order.join(' ')) bad.push('tiles did not move into the sentence in tap order');
    if (mode === 'right') {
      // Tapping a placed tile sends it back; tap it again to re-place it.
      sandbox.__btn = tiles[order[order.length - 1]];
      run('malayP2Tile(__btn)');
      if (page['malay-order-bank'].kids.length !== 1) bad.push('a placed tile did not go back to the bank');
      run('malayP2Tile(__btn)');
    }
    run('malayP2CheckOrder()');
    const card = page['question-card'];
    if (mode === 'early') {
      if (card.html || sandbox.__calls.length) bad.push('checked a half-built sentence');
      if (page['malay-order-msg'].textContent.indexOf('every word') === -1) bad.push('no nudge to use every word');
      return;
    }
    if (card.html.indexOf('In English:') === -1 || card.html.indexOf(q.answer) === -1) bad.push('order reveal lacks the sentence or its English');
    if (sandbox.__calls.length !== 0) bad.push('order scored before Next');
    run('malayP2Next(' + (mode === 'right') + ')');
    const want = mode === 'right' ? 'correct' : 'wrong:' + q.answer;
    if (sandbox.__calls.join(',') !== want) bad.push('order scoring was "' + sandbox.__calls.join(',') + '", wanted "' + want + '"');
  });
  ok('Tap flow: the English appears first, and the answer is scored once, on Next', bad.length === 0, first([...new Set(bad)]));
}

// ---- report ----
console.log('\n============ DUNIA MELAYU: PRIMARY 2 LAYER ============\n');
let pass = 0, fail = 0;
R.forEach(r => {
  console.log((r.pass ? '  PASS  ' : '> FAIL <') + ' ' + r.name + (r.extra ? '\n            [' + r.extra + ']' : ''));
  r.pass ? pass++ : fail++;
});
console.log('\n  ' + pass + ' passed, ' + fail + ' failed, ' + R.length + ' total\n');
process.exit(fail ? 1 : 0);
