// ============================================================
//  THE BOOK OF NASWORLD — home is a storybook of maps.
// ============================================================
//
//  Home has been three things. First, fifteen equal glowing tiles.
//  Then a tidy list, which read as a dashboard. Then a book with a
//  cover and a contents page, which hid everything behind page turns.
//  This is the blend that was asked for: the original's big picture
//  cards, with Lumi front and centre and the daily things in view, and
//  the book's best idea kept. Tap a chapter card and it opens on a
//  place (a harbour, a forest, a kampung, a peak) with a path through
//  it. Each skill is a stop on that path, in learning order, so she can
//  see how far she has come and what lies ahead.
//
//  Nothing here owns progress. Stops read mastery from state.skills and
//  open the same skill view the old grids did.

var BOOK_CHAPTERS = [
  { id: 'math',  n: 1, colour: '#2f6b8a', title: 'Number Harbour',  blurb: 'Count, weigh and measure by the sea', tree: function () { return typeof MATH_TREE  !== 'undefined' ? MATH_TREE  : {}; } },
  { id: 'word',  n: 2, colour: '#3f8a4d', title: 'Word Forest',     blurb: 'Where words and stories grow',        tree: function () { return typeof WORD_TREE  !== 'undefined' ? WORD_TREE  : {}; } },
  { id: 'malay', n: 3, colour: '#b8503c', title: 'Kampung Melayu',  blurb: 'Bahasa Melayu, from home to market',  tree: function () { return typeof MALAY_TREE !== 'undefined' ? MALAY_TREE : {}; } },
  { id: 'stem',  n: 4, colour: '#96671a', title: 'Discovery Peak',  blurb: 'Look closely at how the world works', tree: function () { return typeof STEM_TREE  !== 'undefined' ? STEM_TREE  : {}; } }
];
// The order pages turn in. 'home' is the main page: Lumi, Today, and a
// big picture card for every place. The chapters follow.
var BOOK_ORDER = ['home', 'math', 'word', 'malay', 'stem'];

var bookState = { view: 'home', part: {} };

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

/** The chapter cards on the main page: a picture, a name, and how far she has got. */
function renderHomeChapters() {
  var el = document.getElementById('home-chapters');
  if (!el) return;
  el.innerHTML = BOOK_CHAPTERS.map(function (ch) {
    var p = bookChapterProgress(ch), pct = p.total ? Math.round(p.done / p.total * 100) : 0;
    return '<button type="button" class="pcard pcard-chapter" style="--card-c:' + ch.colour + '" onclick="bookGo(\'' + ch.id + '\')">' +
      '<span class="pcard-art">' + bookScene(ch.id) + '</span>' +
      '<span class="pcard-body"><span class="pcard-kicker">Chapter ' + ch.n + '</span><span class="pcard-title">' + ch.title + '</span>' +
      '<span class="pcard-desc">' + ch.blurb + '</span>' +
      '<span class="pcard-progress"><span class="pcard-bar"><span class="pcard-bar-fill" style="width:' + pct + '%"></span></span><span class="pcard-count">' + p.done + ' of ' + p.total + '</span></span></span></button>';
  }).join('');
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
  var v = bookState.view, ch = _bookChapter(v);
  if (!ch) v = bookState.view = 'home';
  var home = document.getElementById('home-main'), book = document.getElementById('book'), page = document.getElementById('book-page');
  if (home) home.hidden = !!ch;
  if (book) { book.hidden = !ch; book.setAttribute('data-view', v); }
  if (!ch) { renderHomeChapters(); return; }

  // Each chapter wears its own colour: finished stops, the ribbon, the tabs.
  if (book && book.style && book.style.setProperty) { book.style.setProperty('--accent', ch.colour); book.style.setProperty('--on-accent', '#ffffff'); }
  if (page) page.innerHTML = _bookChapterView(ch);

  var idx = BOOK_ORDER.indexOf(v), nav = document.getElementById('book-nav');
  if (nav) {
    var prev = BOOK_ORDER[idx - 1], next = BOOK_ORDER[idx + 1];
    nav.innerHTML = '<button type="button" class="book-turn" onclick="bookGo(\'' + prev + '\')" aria-label="Previous page">' + icon('arrow', 'flip') + '</button>' +
      '<button type="button" class="book-turn book-turn-mid" onclick="bookGo(\'home\')">Home</button>' +
      (next ? '<button type="button" class="book-turn" onclick="bookGo(\'' + next + '\')" aria-label="Next chapter">' + icon('arrow') + '</button>' : '<span class="book-turn-gap"></span>');
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

/**
 * The Home button. Home is the main page, from anywhere:
 * another screen, or a chapter deep inside the book. (It used to call
 * showScreen('home'), which redrew whatever page the book was already
 * on, so pressing Home from a chapter appeared to do nothing.)
 */
function goHome() {
  bookState.view = 'home';
  if (typeof showScreen === 'function') showScreen('home');
  bookGo('home');
}

/** Open a chapter from elsewhere (the old world screens redirect here). */
function bookOpenChapter(chId) { if (_bookChapter(chId)) { bookState.view = chId; } }

if (typeof window !== 'undefined') {
  window.bookRender = bookRender; window.renderHomeChapters = renderHomeChapters; window.bookGo = bookGo; window.bookSetPart = bookSetPart; window.bookOpenChapter = bookOpenChapter; window.goHome = goHome;
  window.bookParts = bookParts; window.bookStopStatus = bookStopStatus; window.bookPathPoints = bookPathPoints; window.bookNextStop = bookNextStop;
}
