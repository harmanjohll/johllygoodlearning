// ============================================================
//  EXAM PREP — core engine
// ============================================================
//
//  A standalone module for revising before a school test. It owns one
//  screen (#screen-exam), one storage key, and its own item banks, and
//  touches the rest of the app only to award stars and play a sound.
//  Lift src/exam/ and styles/app-6.css out together and it still works.
//
//  A sitting is shaped like a real paper on purpose:
//    1. Choose a subject, then a full paper or a single section.
//    2. Answer everything, in any order, changing answers freely.
//       Nothing is marked while she works.
//    3. Hand in. Only then is it marked, with the right answer, the
//       reason, and for maths a worked method.
//
//  ITEM CONTRACT. Every bank must satisfy this; test/exam.test.js
//  checks every item, so a bank that breaks it fails the build.
//
//    id        stable, unique string. History and the review sheet use it.
//    section   which paper section the item belongs to.
//    skill     a finer tag. Papers are spread across skills, and the
//              results screen names the weakest one to practise.
//    level     1 core, 2 harder core, 3 stretch (beyond the usual P1
//              bar, labelled as such on screen).
//    type      'mcq' | 'number' | 'word' | 'arrange' | 'select' | 'time'
//    prompt    the question text. '___' marks a blank.
//    answer    the canonical correct answer; its shape depends on type,
//              see examMark().
//    explain   why the answer is right, in plain words.
//
//  Optional:
//    options   (mcq) distinct strings, exactly one equal to answer.
//    order     (mcq) 'shuffle' (default) | 'keep' | 'ascending'.
//    accept    other answers that are equally correct.
//    tiles     (arrange) the pieces to put in order.
//    tokens    (select) the words of a sentence to tap.
//    visual    a picture spec, drawn by exam-visuals.js.
//    optionVisuals  (mcq) { option: visual spec } for picture options.
//    steps     worked method, one line per step (maths).
//    gloss     an English rendering of the correct sentence (Malay).
//    unit      shown after a number box, e.g. 'cm'.
//    passage   id of the shared passage the item belongs to.
//    blank     (kloz) which numbered blank in the passage it fills.
// ============================================================

var EXAM_STORE_KEY = 'nasworld_exam_v1';
var EXAM_HISTORY_LIMIT = 24;

// How time is written. Singapore primary maths writes 7.25 am, with a
// dot and no full stops in "am". If her school uses 7:25, change the
// separator here; typed answers accept either form regardless.
var EXAM_TIME_SEP = '.';

var EXAM_SUBJECTS = {};

/** Bank files call this to plug a subject in. */
function registerExamSubject(def) {
  EXAM_SUBJECTS[def.id] = def;
}

function examSubjectList() {
  return ['el', 'ma', 'ml']
    .map(function (id) { return EXAM_SUBJECTS[id]; })
    .filter(Boolean);
}

// ---- Seeded randomness -------------------------------------------------
// Every paper is built from a seed that is saved with it, so a paper can
// be rebuilt exactly and a maths question regenerated identically.

function examRng(seed) {
  var s = (seed >>> 0) || 1;
  function next() {
    s = (s + 0x6D2B79F5) >>> 0;              // mulberry32
    var t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
  return {
    next: next,
    int: function (a, b) { return a + Math.floor(next() * (b - a + 1)); },
    pick: function (arr) { return arr[Math.floor(next() * arr.length)]; },
    chance: function (p) { return next() < p; },
    shuffle: function (arr) {
      var a = arr.slice();
      for (var i = a.length - 1; i > 0; i--) {
        var j = Math.floor(next() * (i + 1));
        var t = a[i]; a[i] = a[j]; a[j] = t;
      }
      return a;
    }
  };
}

function examNewSeed() {
  return (Date.now() ^ Math.floor(Math.random() * 0x7fffffff)) >>> 0;
}

// ---- Storage -----------------------------------------------------------
// Its own key rather than a field on the main state blob: a history of
// papers, each with its questions frozen for later review, would slow
// every save the rest of the app makes.

var _examStoreCache = null;

function examStore() {
  if (_examStoreCache) return _examStoreCache;
  var data = null;
  try {
    var raw = localStorage.getItem(EXAM_STORE_KEY);
    if (raw) data = JSON.parse(raw);
  } catch (e) { data = null; }
  if (!data || data.version !== 1) {
    data = { version: 1, attempts: [], inProgress: null, seen: {} };
  }
  if (!data.attempts) data.attempts = [];
  if (!data.seen) data.seen = {};
  _examStoreCache = data;
  return data;
}

function examSave() {
  var data = examStore();
  if (data.attempts.length > EXAM_HISTORY_LIMIT) {
    data.attempts = data.attempts.slice(data.attempts.length - EXAM_HISTORY_LIMIT);
  }
  try { localStorage.setItem(EXAM_STORE_KEY, JSON.stringify(data)); } catch (e) {}
}

// ---- Choosing questions ------------------------------------------------

/**
 * Pick n items so that the paper spreads across skills, prefers what she
 * has seen least, and keeps stretch items to a small share.
 */
function examPickStratified(pool, n, rng, seen) {
  var maxStretch = Math.max(1, Math.floor(n * 0.2));
  var groups = {};
  pool.forEach(function (it) {
    (groups[it.skill] = groups[it.skill] || []).push(it);
  });
  var skills = rng.shuffle(Object.keys(groups));
  skills.forEach(function (k) {
    // Shuffle first, then stable-sort by times seen, so ties stay random.
    groups[k] = rng.shuffle(groups[k]).sort(function (a, b) {
      return (seen[a.id] || 0) - (seen[b.id] || 0);
    });
  });

  var out = [], stretch = 0, round = 0, progress = true;
  while (out.length < n && progress) {
    progress = false;
    for (var i = 0; i < skills.length && out.length < n; i++) {
      var g = groups[skills[i]];
      while (g.length) {
        var it = g.shift();
        if (it.level === 3 && stretch >= maxStretch) continue;
        if (it.level === 3) stretch++;
        out.push(it);
        progress = true;
        break;
      }
    }
    round++;
  }
  // Easy before hard, as on a real paper; random within a level.
  return rng.shuffle(out).sort(function (a, b) { return (a.level || 1) - (b.level || 1); });
}

/** Pick whole passages, least seen first. Returns their items in order. */
function examPickPassages(def, sec, howMany, rng, seen) {
  var pool = (def.passages || []).filter(function (p) { return p.section === sec.id; });
  var scored = rng.shuffle(pool).sort(function (a, b) {
    return examPassageSeen(a, seen) - examPassageSeen(b, seen);
  });
  var items = [];
  scored.slice(0, howMany).forEach(function (p) {
    p.items.forEach(function (it) {
      // Passage questions are authored inside their passage, so they do
      // not carry a section of their own. Without this they were marked
      // under "undefined" and the Comprehension bar on the results screen
      // stayed empty.
      items.push(Object.assign({}, it, { passage: p.id, section: sec.id }));
    });
  });
  return items;
}

function examPassageSeen(p, seen) {
  return p.items.reduce(function (s, it) { return s + (seen[it.id] || 0); }, 0);
}

function examPassageById(subjectId, passageId) {
  var def = EXAM_SUBJECTS[subjectId];
  if (!def || !def.passages) return null;
  for (var i = 0; i < def.passages.length; i++) {
    if (def.passages[i].id === passageId) return def.passages[i];
  }
  return null;
}

/**
 * Copy an item into the paper with its options put in order. The copy is
 * what gets saved, so a paper can be reviewed later even if the bank has
 * been edited since.
 */
function examFreezeItem(it, uid, rng) {
  var q = JSON.parse(JSON.stringify(it));
  q.uid = uid;
  if (!q.level) q.level = 1;
  if (q.type === 'mcq' && q.options) {
    if (q.order === 'ascending') {
      q.options = q.options.slice().sort(function (a, b) { return Number(a) - Number(b); });
    } else if (q.order !== 'keep') {
      q.options = rng.shuffle(q.options);
    }
  }
  if (q.type === 'arrange' && q.tiles) {
    // An answer may be authored as the tiles in order (needed when tiles
    // are phrases, so they can be shown as steps). Marking always works
    // on the space-joined form.
    if (Array.isArray(q.answer)) { q.answerTiles = q.answer.slice(); q.answer = q.answer.join(' '); }
    if (q.accept) q.accept = q.accept.map(function (a) { return Array.isArray(a) ? a.join(' ') : a; });
    // Never present the tiles already in a correct order.
    var tries = 0, order;
    do {
      order = rng.shuffle(q.tiles.map(function (_, i) { return i; }));
      tries++;
    } while (tries < 20 && examOrderIsCorrect(q, order));
    q.tileOrder = order;
  }
  return q;
}

/**
 * Build a paper. mode is 'full' (every section) or 'section' (one).
 */
function examBuildPaper(subjectId, mode, sectionId, seed) {
  var def = EXAM_SUBJECTS[subjectId];
  if (!def) return null;
  seed = (seed === undefined || seed === null) ? examNewSeed() : seed;
  var rng = examRng(seed);
  var seen = examStore().seen;

  var secs = mode === 'section'
    ? examPracticeSections(def).filter(function (s) { return s.id === sectionId; })
    : def.sections;

  var paper = {
    id: 'p' + seed.toString(36) + Date.now().toString(36),
    subject: subjectId, mode: mode, sectionId: sectionId || null,
    seed: seed, createdAt: Date.now(), activeMs: 0,
    sections: [], items: [], answers: {}, flags: {}
  };

  secs.forEach(function (sec) {
    var picked;
    var single = mode === 'section';
    if (sec.passages) {
      picked = examPickPassages(def, sec, single ? (sec.practicePassages || 2) : sec.passages, rng, seen);
    } else if (def.generate) {
      picked = def.generate(sec, single ? (sec.practiceCount || sec.count) : sec.count, rng);
    } else {
      var pool = def.items.filter(function (it) { return it.section === sec.id; });
      picked = examPickStratified(pool, single ? (sec.practiceCount || sec.count) : sec.count, rng, seen);
    }
    var start = paper.items.length;
    picked.forEach(function (it) {
      paper.items.push(examFreezeItem(it, 'q' + paper.items.length, rng));
    });
    paper.sections.push({ id: sec.id, name: sec.name, instructions: sec.instructions,
                          from: start, to: paper.items.length });
  });
  return paper;
}

/** A follow-up paper made of exactly the questions she got wrong. */
function examBuildRedo(attempt) {
  var seed = examNewSeed();
  var rng = examRng(seed);
  var wrong = attempt.items.filter(function (q) { return !attempt.marks[q.uid]; });
  var paper = {
    id: 'r' + seed.toString(36) + Date.now().toString(36),
    subject: attempt.subject, mode: 'redo', sectionId: null, redoOf: attempt.id,
    seed: seed, createdAt: Date.now(), activeMs: 0,
    sections: [], items: [], answers: {}, flags: {}
  };
  var bySec = {};
  wrong.forEach(function (q) { (bySec[q.section] = bySec[q.section] || []).push(q); });
  attempt.sections.forEach(function (sec) {
    var list = bySec[sec.id];
    if (!list || !list.length) return;
    var start = paper.items.length;
    list.forEach(function (q) {
      var clean = JSON.parse(JSON.stringify(q));
      delete clean.uid; delete clean.tileOrder;
      paper.items.push(examFreezeItem(clean, 'q' + paper.items.length, rng));
    });
    paper.sections.push({ id: sec.id, name: sec.name, instructions: sec.instructions,
                          from: start, to: paper.items.length });
  });
  return paper;
}

// ---- Marking -----------------------------------------------------------

function examNormWord(s) {
  return String(s === undefined || s === null ? '' : s)
    .replace(/[‘’ʼ]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^[.,!?;:'"()]+|[.,!?;:'"()]+$/g, '')
    .trim();
}

function examParseNumber(s) {
  var t = String(s === undefined || s === null ? '' : s).trim();
  if (!/^\d{1,4}$/.test(t)) return NaN;
  return parseInt(t, 10);
}

/** "7.25", "7:25" or "7 25" -> {h:7, m:25}; anything else -> null. */
function examParseTime(s) {
  var m = String(s || '').trim().match(/^(\d{1,2})\s*[.:\s]\s*(\d{2})$/);
  if (!m) return null;
  return { h: parseInt(m[1], 10), m: parseInt(m[2], 10) };
}

function examFormatTime(h, m) {
  return h + EXAM_TIME_SEP + (m < 10 ? '0' : '') + m;
}

function examOrderText(q, order) {
  return order.map(function (i) { return q.tiles[i]; }).join(' ');
}

/** For showing in a review: sentences read as words, lists as steps. */
function examOrderShow(q, order) {
  return order.map(function (i) { return q.tiles[i]; }).join(q.list ? '  →  ' : ' ');
}

function examOrderIsCorrect(q, order) {
  if (!order || order.length !== q.tiles.length) return false;
  var said = examOrderText(q, order);
  var okays = [q.answer].concat(q.accept || []);
  return okays.some(function (a) { return a === said; });
}

/**
 * True if the response earns the mark. Answer shapes:
 *   mcq      the exact option string
 *   number   a whole number
 *   word     a string; compared without case or surrounding punctuation
 *            unless the item sets caseSensitive
 *   arrange  the tiles joined by single spaces, in the correct order
 *   select   the sorted token indices that must all be chosen, and no more
 *   time     {h, m}
 */
function examMark(q, r) {
  if (r === undefined || r === null || r === '') return false;
  switch (q.type) {
    case 'mcq':
      return r === q.answer;
    case 'number':
      return examParseNumber(r) === Number(q.answer);
    case 'word': {
      var said = examNormWord(r);
      var okays = [q.answer].concat(q.accept || []).map(examNormWord);
      if (q.caseSensitive) return okays.indexOf(said) !== -1;
      said = said.toLowerCase();
      return okays.some(function (a) { return a.toLowerCase() === said; });
    }
    case 'arrange':
      return examOrderIsCorrect(q, r);
    case 'select': {
      if (!Array.isArray(r)) return false;
      var a = r.slice().sort(function (x, y) { return x - y; });
      var b = q.answer.slice().sort(function (x, y) { return x - y; });
      return a.length === b.length && a.every(function (v, i) { return v === b[i]; });
    }
    case 'time':
      return !!r && r.h === q.answer.h && r.m === q.answer.m;
  }
  return false;
}

/** What to show as "your answer" / "the answer" in the review. */
function examDescribe(q, r) {
  if (r === undefined || r === null || r === '' ||
      (Array.isArray(r) && !r.length)) return null;
  switch (q.type) {
    case 'arrange': return examOrderShow(q, r);
    case 'select':
      return r.slice().sort(function (x, y) { return x - y; })
        .map(function (i) { return q.tokens[i]; }).join(', ');
    case 'time': return examFormatTime(r.h, r.m);
    case 'number': return String(r).trim() + (q.unit ? ' ' + q.unit : '');
    case 'mcq': return (q.optionText && q.optionText[r]) || String(r);
    default: return String(r);
  }
}

function examDescribeAnswer(q) {
  switch (q.type) {
    case 'arrange': return q.answerTiles ? q.answerTiles.join(q.list ? '  →  ' : ' ') : String(q.answer);
    case 'select': return q.answer.map(function (i) { return q.tokens[i]; }).join(', ');
    case 'time': return examFormatTime(q.answer.h, q.answer.m);
    case 'number': return String(q.answer) + (q.unit ? ' ' + q.unit : '');
    case 'mcq': return (q.optionText && q.optionText[q.answer]) || String(q.answer);
    default: return String(q.answer);
  }
}

/**
 * The sections offered for "one section" practice. Usually the paper's
 * own sections; maths overrides this with topics, because a maths paper's
 * sections are formats (multiple choice, short answer, word problems)
 * while revision is done topic by topic.
 */
function examPracticeSections(def) {
  return def.practice || def.sections;
}

function examSectionDef(def, id) {
  var all = def.sections.concat(def.practice || []);
  for (var i = 0; i < all.length; i++) if (all[i].id === id) return all[i];
  return null;
}

// ---- Sitting a paper ----------------------------------------------------

function examStart(subjectId, mode, sectionId) {
  var paper = examBuildPaper(subjectId, mode, sectionId);
  if (!paper || !paper.items.length) return null;
  examStore().inProgress = paper;
  examSave();
  return paper;
}

function examStartRedo(attemptId) {
  var att = examAttemptById(attemptId);
  if (!att) return null;
  var paper = examBuildRedo(att);
  if (!paper.items.length) return null;
  examStore().inProgress = paper;
  examSave();
  return paper;
}

function examCurrent() { return examStore().inProgress; }

function examSetAnswer(uid, value) {
  var p = examCurrent();
  if (!p) return;
  if (value === undefined || value === null || value === '' ||
      (Array.isArray(value) && !value.length)) {
    delete p.answers[uid];
  } else {
    p.answers[uid] = value;
  }
  examSave();
}

function examToggleFlag(uid) {
  var p = examCurrent();
  if (!p) return;
  if (p.flags[uid]) delete p.flags[uid]; else p.flags[uid] = true;
  examSave();
}

/**
 * Has she given a complete answer? A clock with only the hour chosen, or
 * a sentence with some tiles still in the bank, is not yet an answer.
 */
function examIsAnswered(q, r) {
  if (r === undefined || r === null || r === '') return false;
  if (q.type === 'time') return typeof r.h === 'number' && typeof r.m === 'number';
  if (q.type === 'arrange') return Array.isArray(r) && r.length === q.tiles.length;
  if (Array.isArray(r)) return r.length > 0;
  return String(r).trim() !== '';
}

function examUnanswered(paper) {
  return paper.items.filter(function (q) { return !examIsAnswered(q, paper.answers[q.uid]); });
}

function examDiscard() {
  examStore().inProgress = null;
  examSave();
}

/** Mark the paper, file it in history, and award stars. */
function examHandIn() {
  var store = examStore();
  var p = store.inProgress;
  if (!p) return null;

  var marks = {}, score = 0;
  var bySection = {}, bySkill = {};
  p.items.forEach(function (q) {
    var ok = examMark(q, p.answers[q.uid]);
    marks[q.uid] = ok;
    if (ok) score++;
    var s = bySection[q.section] = bySection[q.section] || { score: 0, total: 0 };
    s.total++; if (ok) s.score++;
    var k = bySkill[q.skill] = bySkill[q.skill] || { score: 0, total: 0, section: q.section };
    k.total++; if (ok) k.score++;
    store.seen[q.id] = (store.seen[q.id] || 0) + 1;
  });

  var prevBest = examBest(p.subject, p.mode, p.sectionId);
  var attempt = {
    id: p.id, subject: p.subject, mode: p.mode, sectionId: p.sectionId, redoOf: p.redoOf || null,
    seed: p.seed, createdAt: p.createdAt, finishedAt: Date.now(), activeMs: p.activeMs || 0,
    sections: p.sections, items: p.items, answers: p.answers,
    marks: marks, score: score, total: p.items.length,
    bySection: bySection, bySkill: bySkill
  };
  attempt.stars = examStarsFor(attempt, prevBest);
  attempt.isBest = prevBest !== null && (attempt.score / attempt.total) > prevBest;

  store.attempts.push(attempt);
  store.inProgress = null;
  examSave();

  if (typeof state !== 'undefined' && state) {
    state.tokens = (state.tokens || 0) + attempt.stars;
    if (typeof saveState === 'function') saveState();
    if (typeof updateUI === 'function') { try { updateUI(); } catch (e) {} }
  }
  return attempt;
}

/**
 * Stars for finishing, not for scoring, plus a little for doing better.
 * Kept modest: the paper is practice, and it must not out-earn learning.
 */
function examStarsFor(att, prevBest) {
  var base = att.mode === 'full' ? 8 : (att.mode === 'redo' ? 2 : 4);
  var pct = att.total ? att.score / att.total : 0;
  var bonus = (pct >= 0.8 ? 3 : 0) + (prevBest !== null && pct > prevBest ? 4 : 0);
  return base + bonus;
}

function examAttemptsFor(subjectId) {
  return examStore().attempts.filter(function (a) { return a.subject === subjectId; });
}

function examAttemptById(id) {
  var list = examStore().attempts;
  for (var i = list.length - 1; i >= 0; i--) if (list[i].id === id) return list[i];
  return null;
}

/** Best score as a fraction for this subject and mode, or null if none. */
function examBest(subjectId, mode, sectionId) {
  var best = null;
  examStore().attempts.forEach(function (a) {
    if (a.subject !== subjectId || a.mode !== mode) return;
    if (mode === 'section' && a.sectionId !== sectionId) return;
    var f = a.total ? a.score / a.total : 0;
    if (best === null || f > best) best = f;
  });
  return best;
}

/**
 * The practice section most worth doing next, from one attempt. For a
 * subject whose practice sections are topics (maths), this reads the
 * per-skill tally, since each maths item's skill is its topic.
 */
function examWeakest(attempt) {
  var def = EXAM_SUBJECTS[attempt.subject];
  var tally = (def && def.practice) ? attempt.bySkill : attempt.bySection;
  var worst = null;
  Object.keys(tally).forEach(function (id) {
    if (def && !examSectionDef(def, id)) return;
    var s = tally[id];
    if (s.total < 2 || s.score === s.total) return;
    var f = s.score / s.total;
    if (!worst || f < worst.f) worst = { id: id, f: f, s: s };
  });
  return worst;
}

if (typeof window !== 'undefined') {
  window.registerExamSubject = registerExamSubject;
  window.examStore = examStore;
  window.examMark = examMark;
}
