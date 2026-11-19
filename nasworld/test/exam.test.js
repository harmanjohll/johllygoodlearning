// Exam Prep: engine, banks, generators and screens.
//
// The banks are where a mistake costs most, because a wrong answer key or
// a defensible "wrong" option teaches a child the wrong thing. So most of
// what follows checks content, and several checks exist because the bug
// they catch was found by hand while this module was being built:
//
//   - Comprehension questions were filed under section "undefined", so the
//     Comprehension bar on the results screen stayed empty.
//   - Malay distractors like "pelajar" made true sentences ("Saya pelajar
//     di darjah satu" is good Malay), and "padang bola" made a second word
//     order correct.
//   - A maths step said "1 tens", and "87, 80 and 85 both have 8 tens".
//   - A chained step ("8 + 8 = 10 + 6 = 16") defeated a naive checker,
//     which is why arithmetic is checked here with a real evaluator.
//
// Every section reports "NOT EXPOSED" instead of passing quietly if the
// thing it tests is missing.

const fs = require('fs');
const vm = require('vm');

process.on('uncaughtException', e => { if (!/Cannot (set|read) propert/.test(String(e && e.message))) throw e; });
process.on('unhandledRejection', e => { if (!/Cannot (set|read) propert/.test(String(e && e.message))) throw e; });
// The handlers above also swallow a real crash in a test, which would end
// the run early with exit code 0. So a run that never reached report()
// fails.
let reported = false;
process.on('exit', () => {
  if (!reported) { console.log('\n> FAIL < the test run stopped before the end (a crash in a test?)'); process.exitCode = 1; }
});

const ROOT = __dirname + '/..';
const html = fs.readFileSync(ROOT + '/dist/bundle.html', 'utf8');
const code = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m => m[1]).sort((a, b) => b.length - a.length)[0];

const noop = () => {};
const el = () => {
  const n = { classList: { add: noop, remove: noop, toggle: noop, contains: () => false }, style: {}, dataset: {},
    setAttribute: noop, getAttribute: () => null, addEventListener: noop, removeEventListener: noop,
    textContent: '', innerHTML: '', value: '', appendChild: c => c, removeChild: noop, remove: noop,
    insertAdjacentHTML: noop, focus: noop, children: [], getBoundingClientRect: () => ({ left: 0, top: 0, width: 100, height: 100 }),
    getContext: () => null, closest: () => null, cloneNode: () => el() };
  n.querySelector = () => null; n.querySelectorAll = () => [];
  return n;
};
const store = {};
const sandbox = {
  console, setTimeout: noop, clearTimeout: noop, setInterval: () => 1, clearInterval: noop, requestAnimationFrame: noop,
  Math, Date, JSON, Set, Map, Object, Array, String, Number, Boolean, isFinite, isNaN, parseInt, parseFloat, RegExp, Error,
  encodeURIComponent, AbortController: function () { this.abort = noop; this.signal = null; },
  fetch: () => Promise.reject(new Error('offline in test')), navigator: { onLine: false },
  localStorage: { getItem: k => (k in store ? store[k] : null), setItem: (k, v) => { store[k] = String(v); }, removeItem: k => { delete store[k]; } },
  document: { getElementById: () => null, querySelector: () => null, querySelectorAll: () => [], createElement: el,
    body: el(), head: el(), addEventListener: noop, documentElement: el() },
  window: {}
};
sandbox.window = sandbox;
sandbox.globalThis = sandbox;
vm.createContext(sandbox);
try { vm.runInContext(code, sandbox); } catch (e) {
  if (!/Cannot (set|read)/.test(String(e.message))) console.log('LOAD WARN:', e.message.slice(0, 120));
}
const S = sandbox;
const run = expr => vm.runInContext(expr, sandbox);

const R = [];
const ok = (name, cond, extra = '') => R.push({ name, pass: !!cond, extra });
const exposed = ['examMark', 'examBuildPaper', 'examFreezeItem', 'examHandIn', 'examItemHTML', 'examSheetHTML', 'EXAM_SUBJECTS', 'MA_GENS']
  .filter(n => typeof S[n] === 'undefined');
if (exposed.length) {
  ok('exam module is loaded in the bundle', false, 'NOT EXPOSED: ' + exposed.join(', '));
  report();
}

// ---------------------------------------------------------------------
// 1. Marking
// ---------------------------------------------------------------------
{
  const m = (q, r) => S.examMark(q, r);
  const num = { type: 'number', answer: 12 };
  const word = { type: 'word', answer: 'giraffe', accept: ['toy giraffe'] };
  const caseW = { type: 'word', answer: 'Peanut', caseSensitive: true };
  const arr = { type: 'arrange', tiles: ['Adik', 'pergi', 'ke', 'sekolah', 'dengan', 'bas'], answer: 'Adik pergi ke sekolah dengan bas',
                accept: ['Adik pergi dengan bas ke sekolah'] };
  const sel = { type: 'select', tokens: ['on', 'monday,', 'ben', 'and', 'i'], answer: [0, 1, 2, 4] };
  const time = { type: 'time', answer: { h: 7, m: 25 } };
  const checks = [
    ['number "12"', m(num, '12'), true], ['number " 12 "', m(num, ' 12 '), true], ['number "012"', m(num, '012'), true],
    ['number "1 2"', m(num, '1 2'), false], ['number "12a"', m(num, '12a'), false], ['number empty', m(num, ''), false],
    ['word in capitals', m(word, 'GIRAFFE'), true], ['word with full stop', m(word, 'giraffe.'), true],
    ['word accepted alternative', m(word, 'Toy giraffe'), true], ['word wrong', m(word, 'giraff'), false],
    ['case-sensitive word', m(caseW, 'peanut'), false], ['curly apostrophe folds', m({ type: 'word', answer: "it's" }, 'it’s'), true],
    ['arrange main order', m(arr, [0, 1, 2, 3, 4, 5]), true], ['arrange accepted order', m(arr, [0, 1, 4, 5, 2, 3]), true],
    ['arrange wrong order', m(arr, [1, 0, 2, 3, 4, 5]), false], ['arrange incomplete', m(arr, [0, 1, 2]), false],
    ['select any order', m(sel, [4, 2, 1, 0]), true], ['select missing one', m(sel, [0, 1, 2]), false],
    ['select one too many', m(sel, [0, 1, 2, 3, 4]), false],
    ['time right', m(time, { h: 7, m: 25 }), true], ['time hour only', m(time, { h: 7, m: null }), false],
    ['time wrong minutes', m(time, { h: 7, m: 5 }), false]
  ];
  const bad = checks.filter(c => c[1] !== c[2]).map(c => c[0] + ' gave ' + c[1]);
  ok('marking: every answer type accepts what it should and nothing else', bad.length === 0, bad.length ? bad.join('; ') : checks.length + ' cases');

  const partial = [
    S.examIsAnswered(time, { h: 7, m: null }), S.examIsAnswered(arr, [0, 1]), S.examIsAnswered(num, '  '),
    !S.examIsAnswered(time, { h: 7, m: 25 }), !S.examIsAnswered(arr, [0, 1, 2, 3, 4, 5])
  ];
  ok('a half-set clock or a half-built sentence does not count as answered', partial.every(x => x === false), JSON.stringify(partial));

  const t1 = S.examParseTime('7.25'), t2 = S.examParseTime('7:25'), t3 = S.examParseTime('seven');
  ok('typed times accept both 7.25 and 7:25', t1 && t1.h === 7 && t1.m === 25 && t2 && t2.m === 25 && t3 === null);
}

// ---------------------------------------------------------------------
// 2. Building papers
// ---------------------------------------------------------------------
{
  const bad = [];
  let built = 0;
  ['el', 'ma', 'ml'].forEach(sub => {
    const def = S.EXAM_SUBJECTS[sub];
    const modes = [['full', null]].concat(S.examPracticeSections(def).map(s => ['section', s.id]));
    for (let n = 1; n <= S.EXAM_PAPER_COUNT; n++) modes.push(['paper', null, n]);
    modes.forEach(([mode, sec, paperNo]) => {
      for (let seed = 1; seed <= 12; seed++) {
        const p = S.examBuildPaper(sub, mode, sec, seed * 7919 + (sec ? String(sec).length : 0), paperNo);
        built++;
        if (!p.items.length) { bad.push(sub + '/' + (sec || 'full') + ' built an empty paper'); continue; }
        const uids = new Set(p.items.map(q => q.uid));
        if (uids.size !== p.items.length) bad.push(sub + ' duplicate uids');
        p.sections.forEach(s => {
          for (let i = s.from; i < s.to; i++) {
            if (p.items[i].section !== s.id) bad.push(sub + '/' + (sec || 'full') + ' item ' + p.items[i].id + ' has section ' + p.items[i].section + ', paper section ' + s.id);
          }
        });
        const whole = mode === 'full' || mode === 'paper';
        if (whole && sub !== 'ma' && p.items.length !== 29) bad.push(sub + ' ' + mode + ' paper has ' + p.items.length + ' items');
        if (whole && sub === 'ma' && p.items.length !== 25) bad.push('maths ' + mode + ' paper has ' + p.items.length + ' items');
      }
    });
  });
  ok('every paper in every subject and practice section builds, with each item in its own section', bad.length === 0,
     bad.length ? bad.slice(0, 5).join(' | ') : built + ' papers built');

  const a = JSON.stringify(S.examBuildPaper('ml', 'full', null, 4242).items.map(q => q.id + q.options));
  const b = JSON.stringify(S.examBuildPaper('ml', 'full', null, 4242).items.map(q => q.id + q.options));
  ok('the same seed rebuilds the same paper', a === b);

  // a paper never contains the same question twice
  let dupes = 0;
  ['el', 'ml'].forEach(sub => { for (let s = 1; s <= 40; s++) {
    const p = S.examBuildPaper(sub, 'full', null, s * 104729);
    if (new Set(p.items.map(q => q.id)).size !== p.items.length) dupes++;
  } });
  ok('no paper repeats a question', dupes === 0, dupes + ' papers with a repeat');

  // stretch items stay a small share of any section
  let heavy = 0;
  for (let s = 1; s <= 60; s++) {
    const p = S.examBuildPaper('el', 'full', null, s * 31337);
    p.sections.forEach(sec => {
      const its = p.items.slice(sec.from, sec.to);
      if (its.filter(q => q.level === 3).length > Math.max(1, Math.floor(its.length * 0.2))) heavy++;
    });
  }
  ok('stretch questions never make up more than a fifth of a section', heavy === 0, heavy + ' sections over');
}

// ---------------------------------------------------------------------
// 2b. The fixed practice papers
// ---------------------------------------------------------------------
// What a word-spelling item must never meet on its own paper, checked
// here independently of examShownText: every word printed on the paper.
function printedWords(q, pas) {
  const parts = [q.prompt || ''].concat(q.options || []);
  if (q.type === 'arrange') [q.answer].concat(q.accept || []).forEach(a => parts.push(Array.isArray(a) ? a.join(' ') : a));
  if (q.tokens) parts.push(q.tokens.join(' '));
  if (pas) parts.push(pas.title || '', ...pas.paras);
  return new Set(parts.join(' ').toLowerCase().split(/[^a-z'-]+/).filter(Boolean));
}
function spellingClashes(sub, items) {
  const out = [];
  items.filter(q => q.spell).forEach(s => {
    const want = String(s.answer).toLowerCase();
    items.forEach(o => {
      if (o.id === s.id) return;
      if (printedWords(o, o.passage ? S.examPassageById(sub, o.passage) : null).has(want)) out.push(s.id + ' (' + want + ') shown by ' + o.id);
    });
  });
  return out;
}
{
  const N = S.EXAM_PAPER_COUNT;
  const bad = [], clash = [];
  const sig = q => q.id + '|' + q.prompt + '|' + JSON.stringify(q.answer) + '|' + JSON.stringify(q.visual || null);
  ['el', 'ma', 'ml'].forEach(sub => {
    const def = S.EXAM_SUBJECTS[sub];
    const plan = S.examPaperPlan(sub);
    if (!plan || plan.length !== N) { bad.push(sub + ': ' + (plan ? plan.length : 0) + ' papers'); return; }
    const seen = {};
    plan.forEach(p => {
      const all = [];
      def.sections.forEach(sec => {
        const its = p.sections[sec.id] || [];
        const want = sec.passages ? sec.passages * (sec.perPassage || 5) : sec.count;
        if (its.length !== want) bad.push(sub + ' paper ' + p.no + ' ' + sec.id + ': ' + its.length + ' of ' + want);
        its.forEach(q => {
          if (q.section !== sec.id) bad.push(q.id + ' filed under ' + q.section);
          const k = sub === 'ma' ? sig(q) : q.id;
          if (seen[k]) bad.push(sub + ': ' + q.id + ' in papers ' + seen[k] + ' and ' + p.no);
          seen[k] = p.no;
          all.push(q);
        });
        const cap = Math.max(1, Math.floor(want * 0.2));
        if (its.filter(q => q.level === 3).length > cap) bad.push(sub + ' paper ' + p.no + ' ' + sec.id + ': too many stretch');
        // Spread: no skill takes much more than its share of the bank.
        if (!sec.passages && sub !== 'ma') {
          const pool = def.items.filter(q => q.section === sec.id);
          const tally = {};
          its.forEach(q => { tally[q.skill] = (tally[q.skill] || 0) + 1; });
          Object.keys(tally).forEach(k => {
            const share = pool.filter(q => q.skill === k).length / pool.length;
            if (tally[k] > Math.ceil(share * want) + 1) bad.push(sub + ' paper ' + p.no + ' ' + sec.id + ': ' + tally[k] + ' of ' + k);
          });
        }
      });
      if (sub !== 'ma') spellingClashes(sub, all).forEach(c => clash.push(sub + ' paper ' + p.no + ': ' + c));
    });
  });
  ok('each subject has ' + N + ' full practice papers, no question in two of them, spread across skills', bad.length === 0,
     bad.length ? bad.slice(0, 5).join(' | ') : '3 subjects × ' + N + ' papers');
  ok('no practice paper prints a word that another of its questions asks her to spell', clash.length === 0, clash.slice(0, 4).join(' | '));

  // And no giveaway of any kind, item against item and passage against
  // passage, as examGiveaways defines it.
  const given = [];
  ['el', 'ml'].forEach(sub => S.examPaperPlan(sub).forEach(p => {
    const units = [], byPassage = {};
    [].concat(...Object.values(p.sections)).forEach(q => {
      if (!q.passage) { units.push({ id: q.id, shown: S.examShownText(q), gives: S.examGiveaways(q) }); return; }
      if (byPassage[q.passage]) return;
      const pas = S.examPassageById(sub, q.passage);
      byPassage[q.passage] = true;
      units.push({ id: pas.id, shown: S.examPassageShown(pas), gives: S.examPassageGives(pas) });
    });
    units.forEach(u => units.forEach(v => {
      if (u !== v) u.gives.forEach(g => { if (g && v.shown.indexOf(' ' + g + ' ') !== -1) given.push(sub + ' paper ' + p.no + ': ' + u.id + ' "' + g + '" in ' + v.id); });
    }));
  }));
  ok('no question on a practice paper gives away another\'s answer', given.length === 0, given.slice(0, 3).join(' | '));

  // Pairs found by hand that must never share a paper.
  const apart = [['ml', 'ml-im-men-13', 'ml-su-6'], ['ml', 'ml-ko-ctx-1', 'ml-su-2'], ['ml', 'ml-ko-ctx-1', 'ml-ko-kt-5'],
                 ['ml', 'ml-ko-ctx-6', 'ml-su-12'], ['ml', 'ml-ko-pb-11', 'ml-p-arnab'], ['ml', 'ml-p-pasar', 'ml-p-pasarmalam'],
                 ['ml', 'ml-p-harijadi', 'ml-p-zoo'], ['el', 'el-gr-past-1', 'el-p-zoo'],
                 ['el', 'el-gr-has-2', 'el-pu-end-12'], ['el', 'el-gr-plt-9', 'el-gr-pl-2']];
  // Each of those pairs really does clash, and an unrelated pair does not,
  // so the list cannot pass by going stale.
  const unit = (sub, id) => {
    const def = S.EXAM_SUBJECTS[sub];
    const pas = def.passages.filter(p => p.id === id)[0];
    if (pas) return { shown: S.examPassageShown(pas), gives: S.examPassageGives(pas) };
    const q = def.items.filter(x => x.id === id)[0];
    return q ? { shown: S.examShownText(q), gives: S.examGiveaways(q) } : null;
  };
  const clashes = (sub, a, b) => { const x = unit(sub, a), y = unit(sub, b); return !!x && !!y && S.examSheetClash(x, y.shown, y.gives); };
  const stale = apart.filter(([sub, a, b]) => !clashes(sub, a, b)).map(t => t[1] + ' + ' + t[2]);
  ok('each known giveaway is still detected, and unrelated questions do not clash',
     stale.length === 0 && !clashes('ml', 'ml-ko-pic-1', 'ml-su-1') && !clashes('el', 'el-vo-pic-1', 'el-gr-be-1'), stale.join(', '));
  const together = apart.filter(([sub, a, b]) => S.examPaperPlan(sub).some(p => {
    const ids = [].concat(...Object.values(p.sections)).map(q => q.id + ' ' + (q.passage || ''));
    const has = x => ids.some(s => s.split(' ').indexOf(x) !== -1);
    return has(a) && has(b);
  }));
  ok('questions that give each other away never share a practice paper', together.length === 0,
     together.length ? together.map(t => t[1] + ' + ' + t[2]).join(', ') : apart.length + ' known pairs apart');

  // The same paper every time, and on every device: rebuilt from nothing.
  const keys = sub => S.examPaperPlan(sub).map(p => p.key).join(',');
  const before = ['el', 'ma', 'ml'].map(keys).join('/');
  run('_examPlans = {};');
  const after = ['el', 'ma', 'ml'].map(keys).join('/');
  const a = S.examBuildPaper('ml', 'paper', null, 11, 3), b = S.examBuildPaper('ml', 'paper', null, 9999, 3);
  const sameQs = JSON.stringify(a.items.map(q => q.id)) === JSON.stringify(b.items.map(q => q.id));
  const reshuffled = a.items.some((q, i) => q.options && JSON.stringify(q.options) !== JSON.stringify(b.items[i].options));
  ok('a practice paper has the same questions every sitting, with the answer choices reshuffled', before === after && sameQs && reshuffled &&
     a.paperNo === 3 && a.planKey === S.examPaperKey('ml', 3), 'same plan ' + (before === after) + ', same questions ' + sameQs + ', reshuffled ' + reshuffled);

  // Adding an item can move questions between papers; their old bests
  // must then stop counting. Rewording an item must not.
  run("EL_ITEMS.push({ id: 'el-test-extra', section: 'punct', skill: 'end-mark', level: 1, type: 'mcq', prompt: 'x', options: ['a', 'b', 'c'], answer: 'a', explain: 'x' }); _examPlans = {};");
  const moved = keys('el');
  // Reword an item that is on a paper (a trailing space: same words, so no new clash).
  run("EL_ITEMS.pop(); _examPlans = {}; var _onPaper = EL_ITEMS.filter(function (q) { return q.id === examPaperPlan('el')[0].sections.grammar[0].id; })[0];" +
      " _onPaper.prompt = _onPaper.prompt + ' '; _examPlans = {};");
  const reworded = keys('el');
  run("_onPaper.prompt = _onPaper.prompt.slice(0, -1); _examPlans = {};");
  ok('a paper\'s key changes when its questions change, and not when one is reworded',
     moved !== before.split('/')[0] && reworded === before.split('/')[0] && keys('el') === before.split('/')[0]);

  // Mixed papers fit questions round each other the same way.
  const mixed = [];
  ['el', 'ml'].forEach(sub => { for (let s = 1; s <= 60; s++) {
    const p = S.examBuildPaper(sub, 'full', null, s * 7717);
    spellingClashes(sub, p.items).forEach(c => mixed.push(c));
  } });
  ok('no mixed paper prints a word that another of its questions asks her to spell', mixed.length === 0, mixed.slice(0, 3).join(' | '));

  // A kloz blank must not be answered elsewhere in its own passage.
  const self = [];
  S.EXAM_SUBJECTS.ml.passages.filter(p => p.kind === 'kloz').forEach(p => {
    const shown = S.examPassageShown(p);
    p.items.forEach(q => S.examGiveaways(q, p).forEach(g => { if (shown.indexOf(' ' + g + ' ') !== -1) self.push(q.id + ': "' + g + '"'); }));
  });
  ok('no kloz passage answers its own blank elsewhere in the text', self.length === 0, self.join(', '));
}

// Practice papers: sitting one, best scores, the next paper, stars.
{
  run('state = state || {}; state.tokens = 0;');
  delete store.nasworld_exam_v1;
  run('_examStoreCache = null;');
  const sit = (sub, n, rightEvery) => {
    const p = S.examStart(sub, 'paper', null, n);
    p.items.forEach((q, i) => { if (q.type === 'mcq' && i % rightEvery === 0) S.examSetAnswer(q.uid, q.answer); });
    return S.examHandIn();
  };
  const first = sit('el', 1, 1), firstStars = first.stars;
  const best1 = S.examBest('el', 'paper', null, 1);
  ok('handing in a practice paper files its best score and moves "next" on',
     first.mode === 'paper' && first.paperNo === 1 && best1 === first.score / first.total && S.examNextPaper('el') === 2 &&
     S.examPaperTimes('el', 1) === 1, 'best ' + best1 + ', next ' + S.examNextPaper('el'));
  const again = sit('el', 1, 3);
  ok('a retake earns half the base stars, and a worse score leaves the best alone',
     firstStars >= 8 && again.stars === 4 && S.examBest('el', 'paper', null, 1) === best1 && S.examPaperTimes('el', 1) === 2,
     'first ' + firstStars + ', retake ' + again.stars);
  // If the bank changes so that Practice Paper 1 holds other questions,
  // a best earned on the old questions no longer counts.
  run("examStore().attempts.forEach(function (a) { if (a.mode === 'paper') a.planKey = 'old'; }); (examStore().bests['el/paper/1'] || {}).key = 'old';");
  const afterChange = S.examBest('el', 'paper', null, 1), nextAfter = S.examNextPaper('el');
  run("var _k = examPaperKey('el', 1); examStore().attempts.forEach(function (a) { if (a.mode === 'paper') a.planKey = _k; }); (examStore().bests['el/paper/1'] || {}).key = _k;");
  ok('a best earned on questions that have since changed no longer counts', afterChange === null && nextAfter === 1 &&
     S.examBest('el', 'paper', null, 1) === best1, 'best ' + afterChange + ', next ' + nextAfter);
  for (let i = 0; i < 30; i++) { S.examStart('ml', 'section', 'susun'); S.examHandIn(); }
  run('_examStoreCache = null;');
  ok('best scores outlive the capped history', S.examStore().attempts.every(x => x.mode !== 'paper') &&
     S.examBest('el', 'paper', null, 1) === best1 && S.examNextPaper('el') === 2);

  const hub = S.examHubHTML();
  const cards = (hub.match(/data-mode="paper" data-paper="\d"/g) || []).length;
  ok('the hub shows every practice paper with its best, a next-paper button, a mixed paper and one section',
     cards === 3 * (S.EXAM_PAPER_COUNT + 1) && /Next: Practice Paper 2/.test(hub) && /Start Practice Paper 1/.test(hub) &&
     /Mixed paper · new every time/.test(hub) && /1 of 8 done/.test(hub) && new RegExp(Math.round(best1 * 100) + '%').test(hub) &&
     !/undefined|NaN/.test(hub), cards + ' paper buttons');
  const introAgain = S.examIntroHTML({ subject: 'el', mode: 'paper', paper: 1 });
  const introNew = S.examIntroHTML({ subject: 'el', mode: 'paper', paper: 5 });
  ok('a practice paper\'s start page says whether she has done it before', /Practice Paper 1/.test(introAgain) &&
     /done this paper before/.test(introAgain) && !/done this paper before/.test(introNew) && /data-paper="5"/.test(introNew));
  const res = S.examResultsHTML({ attemptId: first.id });
  ok('the results of a practice paper offer the next one', /Practice Paper 1/.test(res) && /Next: Practice Paper 2/.test(res));
  delete store.nasworld_exam_v1;
  run('_examStoreCache = null;');
}

// ---------------------------------------------------------------------
// 3. Sitting, handing in, redoing, history
// ---------------------------------------------------------------------
{
  run('state = state || {}; state.tokens = 0;');
  delete store.nasworld_exam_v1;
  run('_examStoreCache = null;');
  const p = S.examStart('el', 'full', null);
  const plan = {};
  p.items.forEach((q, i) => {
    const right = i % 3 !== 0;
    plan[q.uid] = right;
    let r;
    if (q.type === 'mcq') r = right ? q.answer : q.options.find(o => o !== q.answer);
    else if (q.type === 'word') r = right ? q.answer : 'qqq';
    else if (q.type === 'select') r = right ? q.answer.slice() : [];
    else if (q.type === 'arrange') r = right ? (q.answerTiles || q.answer.split(' ')).map(t => q.tiles.indexOf(t)) : q.tileOrder.slice();
    if (r !== undefined) S.examSetAnswer(q.uid, r);
  });
  const att = S.examHandIn();
  const mism = Object.keys(plan).filter(u => !!att.marks[u] !== plan[u]);
  const want = Object.values(plan).filter(Boolean).length;
  ok('handing in marks exactly the questions answered correctly', att.score === want && mism.length === 0,
     'score ' + att.score + ', expected ' + want + (mism.length ? ', mismatched ' + mism.join(',') : ''));
  const secTotal = Object.values(att.bySection).reduce((s, x) => s + x.total, 0);
  ok('every question is counted in a real section', secTotal === att.total && !att.bySection.undefined,
     JSON.stringify(Object.keys(att.bySection)));
  ok('finishing a paper awards stars', run('state.tokens') === att.stars && att.stars >= 8, 'stars ' + att.stars);
  ok('the in-progress paper is cleared on hand-in', S.examCurrent() === null);

  const redo = S.examStartRedo(att.id);
  const wrongIds = att.items.filter(q => !att.marks[q.uid]).map(q => q.id).sort();
  ok('the redo paper is exactly the questions that were wrong', redo && JSON.stringify(redo.items.map(q => q.id).sort()) === JSON.stringify(wrongIds),
     redo ? redo.items.length + ' redo, ' + wrongIds.length + ' wrong' : 'no redo');
  S.examDiscard();

  // storage survives a reload
  run('_examStoreCache = null;');
  const back = S.examAttemptById(att.id);
  ok('history survives a reload from storage', back && back.score === att.score);

  // history is capped
  for (let i = 0; i < 30; i++) { S.examStart('ml', 'section', 'susun'); S.examHandIn(); }
  run('_examStoreCache = null;');
  ok('history keeps at most ' + S.EXAM_HISTORY_LIMIT + ' papers', S.examStore().attempts.length === S.EXAM_HISTORY_LIMIT,
     S.examStore().attempts.length + ' kept');
  delete store.nasworld_exam_v1;
  run('_examStoreCache = null;');
}

// ---------------------------------------------------------------------
// 4. The English and Malay banks
// ---------------------------------------------------------------------
function bankItems(sub) {
  const def = S.EXAM_SUBJECTS[sub];
  return def.items.map(q => ({ q, pas: null }))
    .concat(...def.passages.map(p => p.items.map(q => ({ q, pas: p }))));
}

function perms(n) {
  const out = [];
  (function go(a, rest) { if (!rest.length) { out.push(a); return; } rest.forEach((r, i) => go(a.concat(r), rest.slice(0, i).concat(rest.slice(i + 1)))); })([], [...Array(n).keys()]);
  return out;
}

['el', 'ml'].forEach(sub => {
  const bad = [];
  const ids = new Set();
  bankItems(sub).forEach(({ q, pas }) => {
    if (ids.has(q.id)) bad.push('duplicate id ' + q.id); ids.add(q.id);
    if (!q.explain) bad.push(q.id + ': no explanation');
    if (sub === 'ml' && !q.gloss && !(pas && pas.gloss)) bad.push(q.id + ': no English gloss');
    if (/undefined|NaN|\[object/.test(JSON.stringify(q))) bad.push(q.id + ': undefined leaks into the item');
    if (q.type === 'mcq') {
      const hits = q.options.filter(o => o === q.answer).length;
      if (hits !== 1) bad.push(q.id + ': answer appears ' + hits + ' times');
      if (new Set(q.options).size !== q.options.length) bad.push(q.id + ': repeated option');
      const twoWay = q.skill === 'true-false';
      if (q.options.length < (twoWay ? 2 : 3)) bad.push(q.id + ': only ' + q.options.length + ' options');
      Object.keys(q.why || {}).forEach(k => {
        if (q.options.indexOf(k) === -1) bad.push(q.id + ': explains a wrong option that is not offered (' + k + ')');
        if (k === q.answer) bad.push(q.id + ': "why wrong" written for the right answer');
      });
    }
    if (q.type === 'select' && !q.answer.every(i => i >= 0 && i < q.tokens.length)) bad.push(q.id + ': token index out of range');
    if (q.type === 'word' && !q.answer) bad.push(q.id + ': empty typed answer');
    if (q.type === 'arrange') {
      if (new Set(q.tiles).size !== q.tiles.length) bad.push(q.id + ': repeated tile');
      const f = S.examFreezeItem(q, 'q0', S.examRng(9));
      const right = perms(q.tiles.length).filter(pm => S.examOrderIsCorrect(f, pm)).map(pm => pm.map(i => q.tiles[i]).join(' '));
      const want = [q.answer].concat(q.accept || []).map(a => Array.isArray(a) ? a.join(' ') : a);
      if (right.length !== want.length || !want.every(w => right.indexOf(w) !== -1)) {
        bad.push(q.id + ': marks ' + right.length + ' orders right, intended ' + want.length);
      }
      if (sub === 'ml') want.forEach(w => { if (!/^[A-Z]/.test(w)) bad.push(q.id + ': an accepted order starts without its capital letter'); });
      if (S.examOrderIsCorrect(f, f.tileOrder)) bad.push(q.id + ': tiles presented already in order');
    }
    if (q.blank && pas && pas.paras.join(' ').indexOf('{' + q.blank + '}') === -1) bad.push(q.id + ': blank not in its passage');
  });
  S.EXAM_SUBJECTS[sub].passages.filter(p => p.kind === 'kloz').forEach(p => {
    const n = (p.paras.join(' ').match(/\{\d+\}/g) || []).length;
    if (n !== p.items.length) bad.push(p.id + ': ' + n + ' blanks, ' + p.items.length + ' questions');
  });
  ok((sub === 'el' ? 'English' : 'Malay') + ' bank: every item is well-formed and has exactly one right answer', bad.length === 0,
     bad.length ? bad.slice(0, 6).join(' | ') : ids.size + ' items checked');
});

// Malay: the accuracy guards
{
  const def = S.EXAM_SUBJECTS.ml;
  // 4a. Every word has been checked by hand.
  const reviewed = new Set(JSON.parse(fs.readFileSync(__dirname + '/exam-malay-reviewed.json', 'utf8')).words);
  const used = [...S.sheetWordList(def).matchAll(/<div>([^<]+)<\/div>/g)].map(m => m[1]);
  const unreviewed = used.filter(w => !reviewed.has(w));
  ok('Malay: every word in the bank is on the hand-reviewed list', used.length > 400 && unreviewed.length === 0,
     unreviewed.length ? 'UNREVIEWED (check spelling, then add to test/exam-malay-reviewed.json): ' + unreviewed.join(', ') : used.length + ' words');

  // 4b. No distractor that can make a true sentence. Person nouns turn
  // "Kami ___ ikan" into a valid equative ("Kami pembeli ikan": we are
  // fish buyers), and these passives are good Malay with a person subject.
  const banned = ['pembaca', 'penulis', 'pelukis', 'pemain', 'pekerja', 'pemasak', 'pembeli', 'pengutip', 'pendengar',
    'penangis', 'penendang', 'penjemput', 'pejalan', 'perenang', 'pelajar', 'pengajar', 'penolong', 'pemasang', 'peniup',
    'penyapu', 'pencuci', 'penyiram', 'pembawa', 'berpakaian', 'dijemput', 'direhatkan', 'ditolong', 'membacakan'];
  const hits = [];
  def.items.concat(...def.passages.map(p => p.items)).forEach(q => {
    (q.options || []).forEach(o => { if (banned.indexOf(o) !== -1) hits.push(q.id + ':' + o); });
  });
  ok('Malay: no option that could form a correct sentence of its own', hits.length === 0, hits.join(', '));

  // 4c. The typed affix answers obey the meN- and ber- rules they teach.
  const rule = (prefix, root) => {
    if (prefix === 'ter') return 'ter' + root;
    if (prefix === 'ber') {
      if (root === 'ajar') return 'belajar';
      if (root[0] === 'r' || /^[^aeiou]er/.test(root)) return 'be' + root;
      return 'ber' + root;
    }
    const c = root[0], c2 = root.slice(0, 2);
    if (c2 === 'ny' || c2 === 'ng' || 'lmnrwy'.indexOf(c) !== -1) return 'me' + root;
    if ('bfv'.indexOf(c) !== -1) return 'mem' + root;
    if (c === 'p') return 'mem' + root.slice(1);
    if ('cdjz'.indexOf(c) !== -1) return 'men' + root;
    if (c === 't') return 'men' + root.slice(1);
    if (c === 's') return 'meny' + root.slice(1);
    if (c === 'k') return 'meng' + root.slice(1);
    return 'meng' + root;
  };
  const wrongForms = [];
  let typed = 0;
  def.items.filter(q => q.type === 'word' && q.section === 'imbuhan').forEach(q => {
    const m = q.prompt.match(/\*\*(\w+)-\*\* pada kata dasar \*\*(\w+)\*\*/);
    if (!m) { wrongForms.push(q.id + ': prompt not understood'); return; }
    typed++;
    const want = rule(m[1], m[2]);
    if (want !== q.answer) wrongForms.push(q.id + ': ' + m[1] + '- + ' + m[2] + ' should be ' + want + ', bank says ' + q.answer);
  });
  ok('Malay: every typed affix answer follows the rules it teaches', typed > 30 && wrongForms.length === 0,
     wrongForms.length ? wrongForms.join('; ') : typed + ' forms checked against the rules');

  // 4d. Word orders that were reviewed as genuinely correct Malay. A test
  // cannot know a second order is valid unless it is told, so these are
  // pinned: dropping one would quietly mark a correct sentence wrong.
  const secondOrders = {
    'ml-su-7':  'Kucing tidur di atas kerusi itu',
    'ml-su-17': 'Cikgu kami mengajar membaca',
    'ml-su-8':  'Adik pergi dengan bas ke sekolah',
    'ml-su-18': 'Abang dengan ayah bermain badminton',
    'ml-su-24': 'Kami bersama-sama menonton televisyen'
  };
  const lost = [];
  Object.keys(secondOrders).forEach(id => {
    const q = def.items.filter(x => x.id === id)[0];
    if (!q) { lost.push(id + ' missing'); return; }
    const f = S.examFreezeItem(q, 'q0', S.examRng(5));
    const right = perms(q.tiles.length).filter(pm => S.examOrderIsCorrect(f, pm)).map(pm => pm.map(i => q.tiles[i]).join(' '));
    if (right.indexOf(secondOrders[id]) === -1) lost.push(id + ' no longer accepts "' + secondOrders[id] + '"');
  });
  ok('Malay: sentences with two correct word orders accept both', lost.length === 0, lost.join('; ') || Object.keys(secondOrders).length + ' items');
}

// ---------------------------------------------------------------------
// 5. Maths generators
// ---------------------------------------------------------------------
{
  const bad = {};
  const note = (g, msg) => { (bad[g] = bad[g] || []); if (bad[g].length < 2) bad[g].push(msg); };
  // "8 + 8 = 10 + 6 = 16": every side of the chain must agree. × first.
  const evalExpr = e => {
    const t = e.trim().split(/\s+/);
    if (t.length % 2 !== 1) return NaN;
    const terms = [], ops = [];
    for (let i = 0; i < t.length; i++) { if (i % 2 === 0) { if (!/^\d+$/.test(t[i])) return NaN; terms.push(+t[i]); } else ops.push(t[i]); }
    for (let j = 0; j < ops.length;) { if (ops[j] === '×') { terms.splice(j, 2, terms[j] * terms[j + 1]); ops.splice(j, 1); } else j++; }
    let v = terms[0];
    for (let k = 0; k < ops.length; k++) { if (ops[k] === '+') v += terms[k + 1]; else if (ops[k] === '−') v -= terms[k + 1]; else return NaN; }
    return v;
  };
  const arith = (g, s) => {
    s = s.replace(/(\d+) (?:groups|rows) of (\d+)/g, '$1 × $2');
    const re = /\d+(?:\s*[+−×]\s*\d+)*(?:\s*=\s*\d+(?:\s*[+−×]\s*\d+)*)+/g;
    let m;
    while ((m = re.exec(s))) {
      const sides = m[0].replace(/([+−×=])/g, ' $1 ').split('=').map(evalExpr);
      if (sides.some(isNaN)) note(g, 'cannot read: ' + m[0]);
      else if (sides.some(x => x !== sides[0])) note(g, 'false step: ' + m[0]);
    }
  };
  let n = 0;
  S.MA_GENS.forEach(gen => {
    const rng = S.examRng(1000 + gen.id.length * 17);
    for (let i = 0; i < 1500; i++) {
      const q = S.maMake(gen, rng, 'T'); n++;
      const all = JSON.stringify(q);
      if (/÷/.test(all)) note(gen.id, 'uses ÷, a P2 sign');
      if (/\b(he|she|his|her|him)\b/i.test(q.prompt + ' ' + (q.steps || []).join(' '))) note(gen.id, 'he/she instead of the name');
      if (/(^|[^0-9])1 (tens|ones)\b/.test(q.prompt + ' ' + q.explain + ' ' + (q.steps || []).join(' '))) note(gen.id, '"1 tens" or "1 ones"');
      if (/, \d+ and \d+ both\b/.test((q.steps || []).join(' '))) note(gen.id, '"both" for three numbers');
      if (!q.explain) note(gen.id, 'no explanation');
      if (q.type === 'mcq') {
        if (q.options.filter(o => o === q.answer).length !== 1) note(gen.id, 'answer not exactly once among the options');
        if (new Set(q.options).size !== q.options.length) note(gen.id, 'repeated option');
      }
      if (q.type === 'number' && !(Number.isInteger(q.answer) && q.answer >= 0 && q.answer <= 100)) note(gen.id, 'answer out of range: ' + q.answer);
      if (q.type === 'time' && !(q.answer.h >= 1 && q.answer.h <= 12 && q.answer.m % 5 === 0)) note(gen.id, 'bad time');
      (q.steps || []).concat([q.explain || '']).forEach(s => arith(gen.id, s));
      const v = q.visual;
      if (gen.id === 'mul-count') { const c = v.kind === 'array' ? v.rows * v.cols : v.groups * v.each; if (c !== q.answer || c > 40) note(gen.id, 'picture and answer disagree, or over 40'); }
      if (gen.id === 'mul-sentence' && v.groups !== v.each && q.options.indexOf(v.each + ' × ' + v.groups) !== -1) note(gen.id, 'offers both 4 × 3 and 3 × 4');
      if (/^div-/.test(gen.id) && /(\d+)/.test(q.prompt) && +q.prompt.match(/(\d+)/)[1] > 20) note(gen.id, 'division over 20');
      if (gen.id === 'num-tens-ones' && v && v.tens * 10 + v.ones !== q.answer) note(gen.id, 'blocks and answer disagree');
      if (gen.id === 'len-measure' && v.to - v.from !== q.answer) note(gen.id, 'ruler and answer disagree');
      if (gen.id === 'len-which' && q.options.some(o => q.optionVisuals[o].to > 12)) note(gen.id, 'object runs off the ruler');
      if (gen.id === 'shp-count') { const c = S.examFigureCounts(v.name), k = q.prompt.match(/\*\*(.+?)s\*\*/)[1]; if (c[k] !== q.answer) note(gen.id, 'count wrong'); if (k === 'rectangle' && c.square) note(gen.id, 'asks for rectangles beside a square'); }
      if (gen.id === 'shp-notused') { const c = S.examFigureCounts(v.name); const un = q.options.filter(o => !c[o]); if (un.length !== 1 || un[0] !== q.answer) note(gen.id, 'not exactly one unused shape'); if (q.answer === 'rectangle' && c.square) note(gen.id, '"rectangle not used" beside a square'); }
      if (/^shp-(name|which|riddle)$/.test(gen.id) && ((q.answer === 'rectangle' && q.options.indexOf('square') !== -1) || (q.answer === 'square' && q.options.indexOf('rectangle') !== -1))) note(gen.id, 'square and rectangle both offered');
      if (/^graph/.test(gen.id)) { const vals = v.rows.map(r => r.count); if (new Set(vals).size !== vals.length) note(gen.id, 'two bars tie'); }
      if (gen.id === 'time-read' && q.answer !== S.examFormatTime(v.h, v.m)) note(gen.id, 'clock and answer disagree');
      if (gen.id === 'time-show' && (q.answer.h !== v.h || q.answer.m !== v.m)) note(gen.id, 'clock and answer disagree');
      if (/^time-(duration|wp)$/.test(gen.id) && /\b12\.\d\d/.test(JSON.stringify(q.options || []) + q.prompt + JSON.stringify(q.answer))) note(gen.id, 'crosses 12 o\'clock');
    }
  });
  const keys = Object.keys(bad);
  ok('maths: all ' + S.MA_GENS.length + ' generators give true answers, true working and fair options', S.MA_GENS.length >= 45 && keys.length === 0,
     keys.length ? keys.map(k => k + ': ' + bad[k].join('; ')).slice(0, 5).join(' | ') : n + ' questions generated and checked');

  // The clock is drawn honestly: the hour hand moves with the minutes.
  const a = S.examClockAngles(7, 25), b = S.examClockAngles(7, 0), c = S.examClockAngles(12, 30);
  ok('clock: at 7.25 the hour hand is between 7 and 8, not on the 7', a.hour > 210 && a.hour < 240 && Math.abs(a.hour - 222.5) < 1e-9 &&
     b.hour === 210 && a.minute === 150 && c.hour === 15, 'hour hand ' + a.hour + ' degrees');
}

// ---------------------------------------------------------------------
// 6. Screens and sheets
// ---------------------------------------------------------------------
{
  const bad = [];
  let drawn = 0;
  ['el', 'ma', 'ml'].forEach(sub => {
    for (let s = 1; s <= 6; s++) {
      const p = S.examBuildPaper(sub, 'full', null, s * 2027);
      p.items.forEach(q => {
        ['answer', 'review'].forEach(mode => {
          let h = '';
          try { h = S.examItemHTML(q, undefined, mode); } catch (e) { bad.push(sub + ' ' + q.id + ' ' + mode + ' threw ' + e.message); return; }
          drawn++;
          if (/undefined|NaN|\[object/.test(h)) bad.push(sub + ' ' + q.id + ' ' + mode + ' shows undefined');
          if (mode === 'answer' && q.type === 'mcq' && (h.match(/data-act="pick"/g) || []).length !== q.options.length) bad.push(q.id + ' has unclickable options');
          if (mode === 'answer' && /\*\*/.test(h)) bad.push(q.id + ' shows raw ** marks');
        });
      });
    }
  });
  ok('every question draws cleanly before and after marking', bad.length === 0, bad.length ? bad.slice(0, 4).join(' | ') : drawn + ' renders');

  // A whole paper's screens: hub, paper, confirm, results, history.
  delete store.nasworld_exam_v1; run('_examStoreCache = null;');
  const p = S.examStart('ml', 'full', null);
  const views = [];
  views.push(['hub', S.examHubHTML()]);
  views.push(['paper', S.examPaperHTML({ index: 20 })]);
  views.push(['confirm', S.examPaperHTML({ index: 0, confirm: true })]);
  const att = S.examHandIn();
  views.push(['results', S.examResultsHTML({ attemptId: att.id })]);
  views.push(['results-all', S.examResultsHTML({ attemptId: att.id, filter: 'all' })]);
  views.push(['history', S.examHistoryHTML()]);
  views.push(['gate', S.examGateHTML({})]);
  views.push(['keys', S.examKeysHTML()]);
  const vbad = views.filter(([, h]) => !h || /undefined|NaN|\[object/.test(h)).map(([n]) => n);
  ok('every screen renders without leaks: hub, paper, hand-in, results, history, grown-ups', vbad.length === 0, vbad.join(', ') || views.length + ' screens');
  ok('an empty paper handed in scores zero and lists every question to fix',
     att.score === 0 && (views[3][1].match(/exam-review no/g) || []).length === att.total, att.score + '/' + att.total);
  delete store.nasworld_exam_v1; run('_examStoreCache = null;');

  const sheet = sub => S.examSheetHTML(sub);
  const ml = sheet('ml'), el = sheet('el'), ma = sheet('ma');
  const mlItems = bankItems('ml').length, elItems = bankItems('el').length;
  const rows = h => (h.match(/<td class="box">☐<\/td><td class="box">☐<\/td>/g) || []).length;
  ok('the Malay review sheet lists every item with tick boxes and the word list',
     rows(ml) === mlItems && /Every word used/.test(ml) && !/undefined|NaN/.test(ml), rows(ml) + ' of ' + mlItems + ' items');
  ok('the English answer key lists every item', rows(el) === elItems && !/undefined|NaN/.test(el), rows(el) + ' of ' + elItems);
  ok('the maths sheet shows three worked examples per generator', (ma.match(/<ol class="steps">/g) || []).length === S.MA_GENS.length * 3 && !/undefined|NaN/.test(ma));
  const perPaper = 29, N = S.EXAM_PAPER_COUNT;
  const tagged = h => (h.match(/<td class="pp">\d<\/td>/g) || []).length;
  ok('the English and Malay sheets say which practice paper each question is in',
     tagged(el) === N * perPaper && tagged(ml) === N * perPaper && (ml.match(/· Practice Paper \d/g) || []).length === 2 * N,
     tagged(el) + ' and ' + tagged(ml) + ' of ' + N * perPaper);
  ok('the maths sheet has the answer key to every practice paper',
     (ma.match(/<h3>Practice Paper \d<\/h3>/g) || []).length === N && (ma.match(/<td class="id" style="width:4%">/g) || []).length === N * 25);
}

// ---------------------------------------------------------------------
// 7. Wiring
// ---------------------------------------------------------------------
{
  const idx = fs.readFileSync(ROOT + '/index.html', 'utf8');
  const nav = fs.readFileSync(ROOT + '/src/ui/navigation.js', 'utf8');
  const files = fs.readdirSync(ROOT + '/src/exam').filter(f => /\.js$/.test(f));
  const missing = files.filter(f => idx.indexOf('<script src="src/exam/' + f + '"></script>') === -1);
  ok('index.html loads every exam file, has the screen and the home tile',
     missing.length === 0 && /id="screen-exam"/.test(idx) && /id="exam-content"/.test(idx) && /showScreen\('exam'\)/.test(idx) &&
     /styles\/app-6\.css/.test(idx), missing.length ? 'missing: ' + missing.join(', ') : files.length + ' files');
  ok('opening the screen draws the hub', /screenId === 'exam'[\s\S]{0,80}renderExamHub\(\)/.test(nav));
}

report();

function report() {
  reported = true;
  console.log('\n================ EXAM PREP TEST ================\n');
  let pass = 0, fail = 0;
  R.forEach(r => {
    console.log((r.pass ? '  PASS  ' : '> FAIL <') + ' ' + r.name + (r.extra ? '   [' + r.extra + ']' : ''));
    r.pass ? pass++ : fail++;
  });
  console.log('\n  ' + pass + ' passed, ' + fail + ' failed, ' + R.length + ' total\n');
  process.exit(fail ? 1 : 0);
}
