// ============================================================
//  THE BOOK OF NASWORLD — home is a storybook of maps.
// ============================================================
//
//  The first redesign made home tidy and gave a seven year old a list
//  of destinations. A child wants somewhere to go, not a menu. So home
//  is a book: a cover that opens, a contents page, and chapters. Each
//  chapter is a place (a harbour, a forest, a kampung, a peak) with a
//  path through it, and each skill is a stop on that path, in learning
//  order. She can see how far she has come and what lies ahead.
//
//  Today's three steps hang from the book as a ribbon bookmark: one tap
//  away, without replacing the world.
//
//  Nothing here owns progress. Stops read mastery from state.skills and
//  open the same skill view the old grids did.

var BOOK_CHAPTERS = [
  { id: 'math',  n: 1, title: 'Number Harbour',  blurb: 'Count, weigh and measure by the sea', tree: function () { return typeof MATH_TREE  !== 'undefined' ? MATH_TREE  : {}; } },
  { id: 'word',  n: 2, title: 'Word Forest',     blurb: 'Where words and stories grow',        tree: function () { return typeof WORD_TREE  !== 'undefined' ? WORD_TREE  : {}; } },
  { id: 'malay', n: 3, title: 'Kampung Melayu',  blurb: 'Bahasa Melayu, from home to market',  tree: function () { return typeof MALAY_TREE !== 'undefined' ? MALAY_TREE : {}; } },
  { id: 'stem',  n: 4, title: 'Discovery Peak',  blurb: 'Look closely at how the world works', tree: function () { return typeof STEM_TREE  !== 'undefined' ? STEM_TREE  : {}; } }
];
// The order pages turn in.
var BOOK_ORDER = ['contents', 'today', 'math', 'word', 'malay', 'stem', 'play', 'board', 'back'];
var BOOK_TITLES = { contents: 'Contents', today: 'Today\'s page', play: 'The Playground', board: 'The Notice Board', back: 'At the back of the book' };

var bookState = { view: 'cover', part: {} };

function _bookChapter(id) { for (var i = 0; i < BOOK_CHAPTERS.length; i++) if (BOOK_CHAPTERS[i].id === id) return BOOK_CHAPTERS[i]; return null; }

/** A chapter's skills, grouped into parts by the tree's own grade labels, in tree order. */
function bookParts(ch) {
  var tree = ch.tree(), parts = [], byName = {};
  Object.keys(tree).forEach(function (id) {
    var g = tree[id].grade || 'Stops';
    if (!byName[g]) { byName[g] = { name: g, stops: [] }; parts.push(byName[g]); }
    byName[g].stops.push(tree[id]);
  });
  return parts;
}

/** 'done', 'started', 'open', 'locked' or 'checking' for one skill. */
function bookStopStatus(def) {
  if (def.awaitingReview) return 'checking';
  if (typeof isSkillUnlocked === 'function' && !isSkillUnlocked(def)) return 'locked';
  var s = (state.skills && state.skills[def.id]) || {};
  if ((s.mastery || 0) >= 80) return 'done';
  if ((s.totalAttempts || 0) > 0) return 'started';
  return 'open';
}

function bookChapterProgress(ch) {
  var tree = ch.tree(), ids = Object.keys(tree), done = 0;
  ids.forEach(function (id) { if (bookStopStatus(tree[id]) === 'done') done++; });
  return { done: done, total: ids.length };
}

/** Where Lumi stands: the first stop on this part that is open and not yet done. */
function bookNextStop(stops) {
  for (var i = 0; i < stops.length; i++) { var st = bookStopStatus(stops[i]); if (st === 'started' || st === 'open') return stops[i].id; }
  return null;
}

/** The part she should land on: the first one with something still to do. */
function bookDefaultPart(ch) {
  var parts = bookParts(ch);
  for (var i = 0; i < parts.length; i++) if (bookNextStop(parts[i].stops)) return i;
  return 0;
}

/**
 * Lay stops along a path that winds from the bottom of the picture to
 * the top. Returns [{x, y}] in percentages of the scene box.
 */
function bookPathPoints(n) {
  var pts = [];
  for (var i = 0; i < n; i++) {
    var t = n === 1 ? 0.5 : i / (n - 1);
    pts.push({ x: 50 + 30 * Math.sin(i * 1.25 + 0.6), y: 90 - t * 78 });
  }
  return pts;
}

function _bookEsc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;'); }

// ---------- Views ----------

function _bookCover() {
  return '<div class="book-cover">' +
    '<div class="book-cover-art">' + bookScene('cover') + '</div>' +
    '<div class="book-cover-text"><div class="book-cover-kicker">The Book of</div><h1 class="book-cover-title">Nasworld</h1>' +
    '<button type="button" class="book-open" onclick="bookGo(\'contents\')">Open the book</button></div></div>';
}

function _bookContents() {
  var h = '<div class="book-leaf"><h1 class="book-h1">Contents</h1><ol class="book-toc">';
  h += '<li><button type="button" class="book-toc-row" onclick="bookGo(\'today\')"><span class="book-toc-n book-toc-ribbon"></span><span class="book-toc-text"><span class="book-toc-title">Today\'s page</span><span class="book-toc-sub" id="book-toc-today"></span></span></button></li>';
  BOOK_CHAPTERS.forEach(function (ch) {
    var p = bookChapterProgress(ch);
    h += '<li><button type="button" class="book-toc-row" onclick="bookGo(\'' + ch.id + '\')">' +
      '<span class="book-toc-thumb">' + bookScene(ch.id) + '</span>' +
      '<span class="book-toc-text"><span class="book-toc-kicker">Chapter ' + ch.n + '</span><span class="book-toc-title">' + ch.title + '</span>' +
      '<span class="book-toc-sub">' + ch.blurb + '</span></span>' +
      '<span class="book-toc-count">' + p.done + ' of ' + p.total + '</span></button></li>';
  });
  [['play', 'Chapter 5', 'The Playground', 'Games, experiments and challenges', 'play'],
   ['exam', 'Chapter 6', 'The Exam Hall', 'Practice papers, marked with reasons', 'exam'],
   ['board', '', 'The Notice Board', 'Word of the day, quests and Lumi\'s story', 'star'],
   ['back', '', 'At the back of the book', 'Your garden, Stasha, the Mirror and more', 'garden']].forEach(function (r) {
    var go = r[0] === 'exam' ? 'showScreen(\'exam\')' : 'bookGo(\'' + r[0] + '\')';
    h += '<li><button type="button" class="book-toc-row" onclick="' + go + '"><span class="book-toc-n">' + (typeof icon === 'function' ? icon(r[4]) : '') + '</span>' +
      '<span class="book-toc-text">' + (r[1] ? '<span class="book-toc-kicker">' + r[1] + '</span>' : '') + '<span class="book-toc-title">' + r[2] + '</span><span class="book-toc-sub">' + r[3] + '</span></span></button></li>';
  });
  return h + '</ol></div>';
}

function _bookChapterView(ch) {
  var parts = bookParts(ch), prog = bookChapterProgress(ch);
  if (bookState.part[ch.id] == null || bookState.part[ch.id] >= parts.length) bookState.part[ch.id] = bookDefaultPart(ch);
  var pi = bookState.part[ch.id], part = parts[pi] || { name: '', stops: [] };
  var stops = part.stops, pts = bookPathPoints(stops.length), next = bookNextStop(stops);
  var d = pts.map(function (p, i) { return (i ? 'L' : 'M') + p.x.toFixed(1) + ' ' + p.y.toFixed(1); }).join(' ');
  var height = Math.max(560, stops.length * 92 + 120);

  var h = '<div class="book-leaf book-chapter"><div class="book-kicker">Chapter ' + ch.n + '</div><h1 class="book-h1">' + ch.title + '</h1>' +
    '<p class="book-blurb">' + ch.blurb + '. ' + prog.done + ' of ' + prog.total + ' stops finished</p>';
  if (parts.length > 1) {
    h += '<div class="book-parts" role="tablist">';
    parts.forEach(function (p, i) {
      h += '<button type="button" role="tab" aria-selected="' + (i === pi) + '" class="book-part' + (i === pi ? ' on' : '') + '" onclick="bookSetPart(\'' + ch.id + '\',' + i + ')">' + _bookEsc(p.name) + '</button>';
    });
    h += '</div>';
  }
  h += '<div class="book-map" style="height:' + height + 'px"><div class="book-map-art">' + bookScene(ch.id) + '</div>' +
    '<svg class="book-path" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><path class="book-path-sand" d="' + d + '"/><path class="book-path-dash" d="' + d + '"/></svg>';
  stops.forEach(function (def, i) {
    var st = bookStopStatus(def), p = pts[i], isNext = def.id === next;
    var open = st !== 'locked' && st !== 'checking';
    var mark = st === 'done' ? icon('check') : (st === 'locked' || st === 'checking') ? icon('lock') : (i + 1);
    var note = st === 'checking' ? 'Being checked' : st === 'locked' ? 'Further on' : st === 'done' ? 'Finished' : isNext ? 'You are here' : '';
    h += '<button type="button" class="book-stop ' + st + (isNext ? ' next' : '') + '" style="left:' + p.x.toFixed(1) + '%;top:' + p.y.toFixed(1) + '%"' +
      (open ? ' onclick="openSkillView(\'' + def.id + '\',\'' + ch.id + '\')"' : ' disabled') + '>' +
      (isNext && typeof lumiSvg === 'function' ? '<span class="book-stop-lumi">' + lumiSvg(36) + '</span>' : '') +
      '<span class="book-stone">' + mark + '</span>' +
      '<span class="book-stop-label"><span class="book-stop-name">' + _bookEsc(def.name) + '</span>' + (note ? '<span class="book-stop-note">' + note + '</span>' : '') + '</span></button>';
  });
  return h + '</div></div>';
}

// ---------- Rendering and turning pages ----------

function bookRender() {
  var page = document.getElementById('book-page');
  if (!page) return;
  var v = bookState.view, ch = _bookChapter(v), html = '';
  if (v === 'cover') html = _bookCover();
  else if (v === 'contents') html = _bookContents();
  else if (ch) html = _bookChapterView(ch);
  else html = '<div class="book-leaf"><h1 class="book-h1">' + (BOOK_TITLES[v] || '') + '</h1></div>';
  page.innerHTML = html;

  // Pages whose content lives in the static markup (today, play, board, back).
  document.querySelectorAll('.book-static').forEach(function (el) { el.hidden = el.getAttribute('data-view') !== v; });
  var book = document.getElementById('book');
  if (book) book.setAttribute('data-view', v);

  var idx = BOOK_ORDER.indexOf(v), nav = document.getElementById('book-nav');
  if (nav) {
    nav.hidden = v === 'cover';
    var prev = idx > 0 ? BOOK_ORDER[idx - 1] : 'cover', next = idx >= 0 && idx < BOOK_ORDER.length - 1 ? BOOK_ORDER[idx + 1] : null;
    nav.innerHTML = '<button type="button" class="book-turn" onclick="bookGo(\'' + prev + '\')" aria-label="Previous page">' + icon('arrow', 'flip') + '</button>' +
      '<button type="button" class="book-turn book-turn-mid" onclick="bookGo(\'contents\')">Contents</button>' +
      (next ? '<button type="button" class="book-turn" onclick="bookGo(\'' + next + '\')" aria-label="Next page">' + icon('arrow') + '</button>' : '<span class="book-turn-gap"></span>');
  }
  var ribbon = document.getElementById('book-ribbon');
  if (ribbon) ribbon.hidden = v === 'cover' || v === 'today';

  var sub = document.getElementById('book-toc-today');
  if (sub && typeof getTodayPlan === 'function') {
    var steps = getTodayPlan().steps, done = steps.filter(function (s) { return s.done; }).length;
    sub.textContent = done === steps.length && steps.length ? 'All done for today' : done + ' of ' + steps.length + ' steps done';
  }
}

function bookGo(view) {
  bookState.view = view;
  bookRender();
  var page = document.getElementById('book');
  if (page && page.classList) { page.classList.remove('turning'); void page.offsetWidth; page.classList.add('turning'); }
  if (typeof window !== 'undefined' && window.scrollTo) window.scrollTo(0, 0);
}

function bookSetPart(chId, i) { bookState.part[chId] = i; bookRender(); }

/** Open a chapter from elsewhere (the old world screens redirect here). */
function bookOpenChapter(chId) { if (_bookChapter(chId)) { bookState.view = chId; } }

if (typeof window !== 'undefined') {
  window.bookRender = bookRender; window.bookGo = bookGo; window.bookSetPart = bookSetPart; window.bookOpenChapter = bookOpenChapter;
  window.bookParts = bookParts; window.bookStopStatus = bookStopStatus; window.bookPathPoints = bookPathPoints; window.bookNextStop = bookNextStop;
}
