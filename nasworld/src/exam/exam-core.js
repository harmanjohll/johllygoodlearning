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
//    1. Choose a subject, then one of its practice papers, a mixed
//       paper, or a single section.
//    2. Answer everything, in any order, changing answers freely.
//       Nothing is marked while she works.
//    3. Hand in. Only then is it marked, with the right answer, the
//       reason, and for maths a worked method.
//
//  Three kinds of paper:
//    paper    Practice Paper 1 to 8. Fixed: the same questions every
//             time, and no question in two of them, so working through
//             all eight covers the bank. Answer choices are reshuffled
//             on a retake, so she cannot answer from memory of "B".
//    full     A mixed paper, new every time, favouring questions she
//             has seen least. Called "Mixed paper" on screen.
//    section  One section (for maths, one topic) at a time.
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
//    spell     (word) the answer is a spelling to produce, so it must not
//              appear anywhere else on the same paper.
// ============================================================

var EXAM_STORE_KEY = 'nasworld_exam_v1';
var EXAM_HISTORY_LIMIT = 24;

// How many fixed practice papers each subject has. English and Malay
// share their banks out across them, so raising this needs more items:
// test/exam.test.js fails, naming the section, if a paper comes up short.
var EXAM_PAPER_COUNT = 8;

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

/** FNV-1a: a fixed 32-bit number from a string, for seeds and keys. */
function examHash(str) {
  var h = 0x811c9dc5;
  for (var i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h;
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
    data = { version: 1, attempts: [], inProgress: null, seen: {}, bests: {} };
  }
  if (!data.attempts) data.attempts = [];
  if (!data.seen) data.seen = {};
  // Best scores are kept apart from the history, which is capped: after
  // two dozen more papers the attempt itself is gone, but "Practice Paper
  // 3: best 92%" must not go with it.
  if (!data.bests) data.bests = {};
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

// ---- Questions that give each other away --------------------------------
// One question on a paper must not hand over another's answer:
//   - a word she has to spell (foxes, menyapu) printed anywhere else on
//     the paper, in a passage, an option or a sentence to unjumble;
//   - a gap whose answer stands next to the same word elsewhere, as when
//     "Kakak ___ pokok bunga. (siram)" shares a paper with the jumbled
//     sentence "Kakak menyiram pokok bunga", or "I ___ two pet fish."
//     with "I have two sisters".
// Each item has the text it shows and the phrases that would give it
// away; two items clash when either's giveaways appear in the other's
// text. Practice papers are dealt so that nothing clashes, and mixed
// papers pass over a question that would.

// Words too common to give anything away on their own. A giveaway always
// includes the answer and at least one word that is not on this list.
var EXAM_LIGHT_WORDS = {};
('a an the is are am was were be to of in on at for and or but so my your his her its our their this that ' +
 'these those it i you we they he she with from by very do does did has have had not please question answer ' +
 'di ke dari pada untuk dengan kepada daripada yang itu ini dan atau tetapi kerana supaya juga sangat sedang ' +
 'akan sudah telah ada saya kamu kami kita mereka dia ia soalan jawapan ' +
 'dalam atas bawah luar tepi sebelah belakang depan se').split(' ')
  .forEach(function (w) { EXAM_LIGHT_WORDS[w] = true; });

/**
 * Lower case, words only. Gaps and kloz blanks become "|", a wall no
 * phrase crosses. A Malay classifier with se- is split ("seekor" to
 * "se ekor"), so "Adik ada seekor arnab" is seen to give away the ekor
 * in "dua ___ arnab".
 */
function examNorm(s) {
  return String(s === undefined || s === null ? '' : s).toLowerCase()
    .replace(/\*\*/g, ' ')
    .replace(/_{3,}|\{\d+\}/g, ' | ')
    .replace(/[^a-z0-9'|-]+/g, ' ')
    .replace(/(^|\s)['-]+|['-]+(?=\s|$)/g, ' ')
    .replace(/(^|\s)se(buah|ekor|orang|helai|batang|biji|kuntum|pasang|keping)(?=\s|$)/g, '$1se $2')
    .replace(/\s+/g, ' ').trim();
}

function examJoined(a) { return Array.isArray(a) ? a.join(' ') : String(a); }

/** Everything an item puts in front of her while she works. */
function examShownText(q, pas) {
  var parts = [q.prompt || ''].concat(q.options || []);
  if (q.type === 'arrange') parts = parts.concat([q.answer].concat(q.accept || []).map(examJoined));
  if (q.tokens) parts.push(q.tokens.join(' '));
  if (pas) parts = parts.concat([pas.title || '']).concat(pas.paras);
  return ' ' + parts.map(examNorm).join(' | ') + ' ';
}

/** The phrases that would give this item's answer away if shown elsewhere. */
function examGiveaways(q, pas) {
  if (q.spell) return [q.answer].concat(q.accept || []).map(examNorm);
  if (q.type === 'arrange' && !q.list) {
    // The opening of the sentence: who, and what they do.
    return [q.answer].concat(q.accept || []).map(function (a) {
      return examNorm(examJoined(a)).split(' ').slice(0, 3).join(' ');
    });
  }
  if (q.type !== 'mcq' || q.skill === 'end-mark') return [];
  var line = null, mark = 'qqgapqq';
  if (q.blank && pas) {
    // The sentence holding the blank. (No lookbehind in the regex: older
    // iPad Safari cannot parse one, and it would stop the whole app.)
    line = pas.paras.join(' ').replace(/([.!?])\s+/g, '$1\n').split('\n').filter(function (s) {
      return s.indexOf('{' + q.blank + '}') !== -1;
    })[0];
    if (line) line = line.replace('{' + q.blank + '}', mark);
  } else if (q.prompt && q.prompt.indexOf('___') !== -1) {
    line = q.prompt.split('\n').filter(function (s) { return s.indexOf('___') !== -1; })[0]
      .replace(/^(Question|Soalan):\s*/, '')
      .replace(/\s*\([^)]*\)\s*$/, '')
      .replace(/_{3,}/, mark);
  }
  if (!line) return [];
  var toks = examNorm(line).split(' ');
  var at = toks.indexOf(mark);
  if (at === -1) return [];
  var ans = examNorm(q.answer).split(' ');
  // "sebiji epal" is given away by "dua biji epal" too, so the giveaway
  // on the noun's side leaves out the se-.
  var core = ans.length > 1 && ans[0] === 'se' ? ans.slice(1) : ans;
  var out = [];
  // Reach out from the gap, one side at a time, until a word that is
  // not light is included; a wall or the end of the sentence stops it.
  [-1, 1].forEach(function (dir) {
    var got = [];
    for (var i = at + dir; i >= 0 && i < toks.length && toks[i] !== '|'; i += dir) {
      got.push(toks[i]);
      if (!EXAM_LIGHT_WORDS[toks[i]]) {
        if (dir < 0) got.reverse();
        out.push((dir < 0 ? got.concat(ans) : core.concat(got)).join(' '));
        return;
      }
    }
  });
  return out;
}

/** A running record of what a paper shows and what would give it away. */
function examNewSheet() { return { shown: ' ', gives: [] }; }

function examSheetClash(sheet, shown, gives) {
  for (var i = 0; i < gives.length; i++) {
    if (gives[i] && sheet.shown.indexOf(' ' + gives[i] + ' ') !== -1) return true;
  }
  for (var j = 0; j < sheet.gives.length; j++) {
    if (sheet.gives[j] && shown.indexOf(' ' + sheet.gives[j] + ' ') !== -1) return true;
  }
  return false;
}

function examSheetAdd(sheet, shown, gives) {
  sheet.shown += shown + ' | ';
  sheet.gives = sheet.gives.concat(gives);
}

/** Would this item clash with what is already on the paper? */
function examItemClashes(sheet, it, pas) {
  return examSheetClash(sheet, examShownText(it, pas), examGiveaways(it, pas));
}

function examAddItem(sheet, it, pas) {
  examSheetAdd(sheet, examShownText(it, pas), examGiveaways(it, pas));
}

/**
 * A whole passage, checked as one: its questions may share its text
 * with each other, but not give away anything else on the paper.
 */
function examPassageShown(p) {
  return p.items.map(function (it) { return examShownText(it, p); }).join(' | ');
}

function examPassageGives(p) {
  return [].concat.apply([], p.items.map(function (it) { return examGiveaways(it, p); }));
}

// ---- Choosing questions ------------------------------------------------

/**
 * Pick n items so that the paper spreads across skills, prefers what she
 * has seen least, and keeps stretch items to a small share. Given a
 * sheet, it passes over items that would clash with it, and adds the
 * ones it picks.
 */
function examPickStratified(pool, n, rng, seen, sheet) {
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
        if (sheet && examItemClashes(sheet, it)) continue;
        if (it.level === 3) stretch++;
        if (sheet) examAddItem(sheet, it);
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

/**
 * Pick whole passages, least seen first, passing over any that would
 * clash with the sheet. Returns their items in order.
 */
function examPickPassages(def, sec, howMany, rng, seen, sheet) {
  var pool = (def.passages || []).filter(function (p) { return p.section === sec.id; });
  var scored = rng.shuffle(pool).sort(function (a, b) {
    return examPassageSeen(a, seen) - examPassageSeen(b, seen);
  });
  var chosen = [];
  scored.forEach(function (p) {
    if (chosen.length >= howMany) return;
    if (sheet) {
      var shown = examPassageShown(p), gives = examPassageGives(p);
      if (examSheetClash(sheet, shown, gives)) return;
      examSheetAdd(sheet, shown, gives);
    }
    chosen.push(p);
  });
  return examPassageItems(chosen, sec);
}

function examPassageItems(passages, sec) {
  var items = [];
  passages.forEach(function (p) {
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

// ---- The fixed practice papers -------------------------------------------
// Worked out once per subject from a seed that never changes, so Practice
// Paper 3 holds the same questions on every visit and every device. A
// change to the bank can move questions between papers: an item added or
// removed, or a rewording that makes two items clash. Each paper's key is
// the list of its questions, so a best score counts for as long as the
// questions it was earned on, and no longer.

var _examPlans = {};

function examById(a, b) { return a.id < b.id ? -1 : a.id > b.id ? 1 : 0; }

/**
 * Share a section's items out across the papers, per items each and no
 * item in two papers. Each paper is spread across skills and levels,
 * holds no more stretch items than examPickStratified would allow, and
 * gets nothing that clashes with what its sheet already holds.
 */
function examDealItems(pool, per, rng, sheets) {
  var n = sheets.length;
  var maxStretch = Math.max(1, Math.floor(per * 0.2));
  var groups = {};
  pool.slice().sort(examById).forEach(function (it) {
    (groups[it.skill] = groups[it.skill] || []).push(it);
  });
  var skills = rng.shuffle(Object.keys(groups).sort());
  skills.forEach(function (k) { groups[k] = rng.shuffle(groups[k]); });

  // One item from each skill in turn, so that whatever is left over once
  // the papers are full comes from the skills with the most items. Stretch
  // items are dealt first, while every paper still has room for one.
  var seq = [], more = true;
  while (more) {
    more = false;
    skills.forEach(function (k) {
      if (groups[k].length) { seq.push(groups[k].shift()); more = true; }
    });
  }
  seq = seq.filter(function (it) { return it.level === 3; })
    .concat(seq.filter(function (it) { return it.level !== 3; }));

  var papers = [];
  for (var i = 0; i < n; i++) papers.push({ items: [], skill: {}, level: {}, stretch: 0, sheet: sheets[i] });
  var room = n * per, turn = 0;
  seq.forEach(function (it) {
    if (!room) return;
    var lv = it.level || 1, best = null, bestScore = null;
    for (var j = 0; j < n; j++) {
      var p = papers[(turn + j) % n];
      if (p.items.length >= per || (lv === 3 && p.stretch >= maxStretch)) continue;
      if (examItemClashes(p.sheet, it)) continue;
      // Fewest of this skill, then fewest of this level, then emptiest.
      var score = [p.skill[it.skill] || 0, p.level[lv] || 0, p.items.length];
      if (!best || score[0] < bestScore[0] || (score[0] === bestScore[0] &&
          (score[1] < bestScore[1] || (score[1] === bestScore[1] && score[2] < bestScore[2])))) {
        best = p; bestScore = score;
      }
    }
    if (!best) return;
    best.items.push(it);
    examAddItem(best.sheet, it);
    best.skill[it.skill] = (best.skill[it.skill] || 0) + 1;
    best.level[lv] = (best.level[lv] || 0) + 1;
    if (lv === 3) best.stretch++;
    room--;
    turn = (turn + 1) % n;
  });
  // Easy before hard, as on a real paper.
  return papers.map(function (p) {
    return rng.shuffle(p.items).sort(function (a, b) { return (a.level || 1) - (b.level || 1); });
  });
}

/**
 * Whole passages, so many to a paper, each passage in one paper only and
 * none clashing with what its paper already holds. A small search: with
 * eight papers and eight passages it settles at once.
 */
function examDealPassages(def, sec, rng, sheets) {
  var n = sheets.length, k = sec.passages;
  var order = rng.shuffle((def.passages || []).filter(function (p) { return p.section === sec.id; }).sort(examById));
  var info = order.map(function (p) { return { p: p, shown: examPassageShown(p), gives: examPassageGives(p) }; });
  var slots = [], used = {};
  for (var s = 0; s < n * k; s++) slots.push(null);

  // Checking a passage against its paper's sheet and the passages already
  // chosen for the same paper in this section.
  var fits = function (slot, cand) {
    var paper = Math.floor(slot / k);
    if (examSheetClash(sheets[paper], cand.shown, cand.gives)) return false;
    for (var j = paper * k; j < slot; j++) {
      var o = slots[j];
      if (examSheetClash({ shown: o.shown, gives: o.gives }, cand.shown, cand.gives)) return false;
    }
    return true;
  };
  var steps = 0;
  var fill = function (slot) {
    if (slot === n * k) return true;
    for (var c = 0; c < info.length; c++) {
      if (used[c] || ++steps > 20000 || !fits(slot, info[c])) continue;
      used[c] = true; slots[slot] = info[c];
      if (fill(slot + 1)) return true;
      used[c] = false; slots[slot] = null;
    }
    return false;
  };
  if (info.length < n * k || !fill(0)) {
    // Too few passages, or no way round a clash. The tests forbid both;
    // if it ever happens, every paper still gets a passage.
    for (var t = 0; t < n * k; t++) slots[t] = info[t % info.length];
  }

  var out = [];
  for (var i = 0; i < n; i++) {
    var mine = slots.slice(i * k, i * k + k).filter(Boolean);
    mine.forEach(function (x) { examSheetAdd(sheets[i], x.shown, x.gives); });
    out.push(examPassageItems(mine.map(function (x) { return x.p; }), sec));
  }
  return out;
}

/**
 * The practice papers for a subject, as [{ no, key, sections: {id: items} }].
 * `key` changes only if the paper's questions do, and best scores are
 * filed under it.
 */
function examPaperPlan(subjectId) {
  if (_examPlans[subjectId]) return _examPlans[subjectId];
  var def = EXAM_SUBJECTS[subjectId];
  if (!def) return null;
  var papers = [];
  for (var i = 1; i <= EXAM_PAPER_COUNT; i++) papers.push({ no: i, key: '', sections: {} });

  if (def.generate) {
    // Generated subjects (maths): each paper from a seed of its own, and
    // no question that an earlier paper already has.
    var avoid = {};
    papers.forEach(function (paper) {
      var rng = examRng(examHash(subjectId + '/paper/' + paper.no));
      def.sections.forEach(function (sec) {
        paper.sections[sec.id] = def.generate(sec, sec.count, rng, avoid);
      });
    });
  } else {
    var sheets = papers.map(function () { return examNewSheet(); });
    var poolOf = function (sec) { return def.items.filter(function (it) { return it.section === sec.id; }); };
    // Passages first, being whole and carrying the most text. Then the
    // other sections, the one with fewest spare items first, so the
    // sections with room to spare are the ones that work round a clash.
    var order = def.sections.filter(function (s) { return s.passages; }).concat(
      def.sections.filter(function (s) { return !s.passages; }).sort(function (a, b) {
        return (poolOf(a).length - a.count * EXAM_PAPER_COUNT) - (poolOf(b).length - b.count * EXAM_PAPER_COUNT) ||
               (a.id < b.id ? -1 : 1);
      }));
    order.forEach(function (sec) {
      var rng = examRng(examHash(subjectId + '/papers/' + sec.id));
      var dealt = sec.passages ? examDealPassages(def, sec, rng, sheets) : examDealItems(poolOf(sec), sec.count, rng, sheets);
      papers.forEach(function (paper, j) { paper.sections[sec.id] = dealt[j]; });
    });
  }

  papers.forEach(function (paper) {
    var parts = [];
    def.sections.forEach(function (sec) {
      (paper.sections[sec.id] || []).forEach(function (it) {
        // A banked item is its id. A generated one is only itself with
        // its numbers, so those go into the key too.
        parts.push(def.generate ? it.id + '|' + it.prompt + '|' + JSON.stringify(it.answer) : it.id);
      });
    });
    paper.key = examHash(parts.join('\n')).toString(36);
  });
  _examPlans[subjectId] = papers;
  return papers;
}

function examPaperKey(subjectId, paperNo) {
  var plan = examPaperPlan(subjectId);
  var paper = plan && plan[paperNo - 1];
  return paper ? paper.key : null;
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
 * Build a paper. mode is 'paper' (practice paper number paperNo), 'full'
 * (a mixed paper of every section) or 'section' (one section).
 *
 * The seed only decides what is left to chance on this sitting. For a
 * practice paper that is the order of the answer choices and tiles; the
 * questions themselves come from the fixed plan.
 */
function examBuildPaper(subjectId, mode, sectionId, seed, paperNo) {
  var def = EXAM_SUBJECTS[subjectId];
  if (!def) return null;
  seed = (seed === undefined || seed === null) ? examNewSeed() : seed;
  var rng = examRng(seed);
  var seen = examStore().seen;

  var fixed = null;
  if (mode === 'paper') {
    var plan = examPaperPlan(subjectId);
    fixed = plan && plan[paperNo - 1];
    if (!fixed) return null;
  }

  var secs = mode === 'section'
    ? examPracticeSections(def).filter(function (s) { return s.id === sectionId; })
    : def.sections;

  var paper = {
    id: 'p' + seed.toString(36) + Date.now().toString(36),
    subject: subjectId, mode: mode, sectionId: mode === 'section' ? sectionId : null,
    paperNo: fixed ? fixed.no : null, planKey: fixed ? fixed.key : null,
    seed: seed, createdAt: Date.now(), activeMs: 0,
    sections: [], items: [], answers: {}, flags: {}
  };

  var avoid = {};                // generated questions already on this paper
  var sheet = examNewSheet();    // banked ones, so that none gives another away
  var single = mode === 'section';
  var chosen = {};
  // Passages are chosen first and the single questions fitted round them;
  // the paper still runs in its usual section order.
  secs.filter(function (s) { return s.passages; }).concat(secs.filter(function (s) { return !s.passages; }))
    .forEach(function (sec) {
      if (fixed) {
        chosen[sec.id] = fixed.sections[sec.id] || [];
      } else if (sec.passages) {
        chosen[sec.id] = examPickPassages(def, sec, single ? (sec.practicePassages || 2) : sec.passages, rng, seen, sheet);
      } else if (def.generate) {
        chosen[sec.id] = def.generate(sec, single ? (sec.practiceCount || sec.count) : sec.count, rng, avoid);
      } else {
        var pool = def.items.filter(function (it) { return it.section === sec.id; });
        chosen[sec.id] = examPickStratified(pool, single ? (sec.practiceCount || sec.count) : sec.count, rng, seen, sheet);
      }
    });

  secs.forEach(function (sec) {
    var picked = chosen[sec.id];
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

function examStart(subjectId, mode, sectionId, paperNo) {
  var paper = examBuildPaper(subjectId, mode, sectionId, null, paperNo);
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

  var prevBest = examBest(p.subject, p.mode, p.sectionId, p.paperNo);
  var attempt = {
    id: p.id, subject: p.subject, mode: p.mode, sectionId: p.sectionId, redoOf: p.redoOf || null,
    paperNo: p.paperNo || null, planKey: p.planKey || null,
    seed: p.seed, createdAt: p.createdAt, finishedAt: Date.now(), activeMs: p.activeMs || 0,
    sections: p.sections, items: p.items, answers: p.answers,
    marks: marks, score: score, total: p.items.length,
    bySection: bySection, bySkill: bySkill
  };
  attempt.stars = examStarsFor(attempt, prevBest);
  attempt.isBest = prevBest !== null && (attempt.score / attempt.total) > prevBest;

  var bk = examBestKey(p.subject, p.mode, p.sectionId, p.paperNo);
  if (bk) {
    var rec = store.bests[bk];
    // A practice paper whose questions have changed starts afresh.
    if (!rec || (p.mode === 'paper' && rec.key !== p.planKey)) rec = store.bests[bk] = { best: 0, n: 0 };
    rec.best = Math.max(rec.best, attempt.total ? attempt.score / attempt.total : 0);
    rec.n++;
    rec.last = attempt.finishedAt;
    if (p.mode === 'paper') rec.key = p.planKey;
  }

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
 * A practice paper she has finished before earns half the base, since
 * the questions are ones she has met.
 */
function examStarsFor(att, prevBest) {
  var base = att.mode === 'redo' ? 2 : att.mode === 'section' ? 4 : 8;
  if (att.mode === 'paper' && prevBest !== null) base = 4;
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

/** Where a best score is filed: "el/paper/3", "el/full", "el/section/grammar". */
function examBestKey(subjectId, mode, sectionId, paperNo) {
  if (mode === 'paper') return paperNo ? subjectId + '/paper/' + paperNo : null;
  if (mode === 'full') return subjectId + '/full';
  if (mode === 'section') return subjectId + '/section/' + sectionId;
  return null;   // a redo has no best of its own
}

/**
 * Best score as a fraction, or null if there is none. For a practice
 * paper, only attempts at the paper as it now stands count. Attempts
 * still in the history are read as well as the kept bests, so papers
 * finished before bests were kept still show.
 */
function examBest(subjectId, mode, sectionId, paperNo) {
  var store = examStore();
  var key = mode === 'paper' ? examPaperKey(subjectId, paperNo) : null;
  var best = null;
  var rec = store.bests[examBestKey(subjectId, mode, sectionId, paperNo)];
  if (rec && rec.n && (mode !== 'paper' || rec.key === key)) best = rec.best;
  store.attempts.forEach(function (a) {
    if (a.subject !== subjectId || a.mode !== mode) return;
    if (mode === 'section' && a.sectionId !== sectionId) return;
    if (mode === 'paper' && (a.paperNo !== paperNo || a.planKey !== key)) return;
    var f = a.total ? a.score / a.total : 0;
    if (best === null || f > best) best = f;
  });
  return best;
}

/** How many times this practice paper, as it now stands, has been finished. */
function examPaperTimes(subjectId, paperNo) {
  var rec = examStore().bests[examBestKey(subjectId, 'paper', null, paperNo)];
  return rec && rec.key === examPaperKey(subjectId, paperNo) ? rec.n : 0;
}

/** The first practice paper not yet done, or null when all are. */
function examNextPaper(subjectId) {
  for (var i = 1; i <= EXAM_PAPER_COUNT; i++) {
    if (examBest(subjectId, 'paper', null, i) === null) return i;
  }
  return null;
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
