// ============================================================
//  PLAY — puzzles and brain games.
//
//  Two kinds of thing live here:
//
//  PUZZLES   jigsaw, word search, crossword, number pyramid.
//            Classic, untimed, satisfying to finish.
//
//  BRAIN GAMES  short timed tasks adapted from the standard
//            cognitive-psychology paradigms that brain-training apps
//            like Lumosity are themselves built on:
//              Memory Grid   <- Corsi block-tapping task (1972)
//              Colour Muddle <- Stroop task (1935)
//              Dot Trail     <- Trail Making Test (Army, 1944)
//              Speed Match   <- delayed match-to-sample / 1-back
//            These are public paradigms, not copies of anyone's
//            artwork or level design.
//
//  HONESTY NOTE, which matters because this is a child's app:
//  brain-training games make you better at the game. The evidence
//  that they make you generally smarter or better at school is weak
//  - Lumos Labs paid a $2m FTC settlement in 2016 over exactly that
//  claim. So nothing here is sold to Anastasia as making her cleverer.
//  They are framed as what they are: good fun, and good practice at
//  paying attention. The actual learning lives in the other worlds.
// ============================================================

var PLAY_CATEGORIES = [
  { id: 'puzzle', label: 'Puzzles',     blurb: 'Take your time. Finish the picture.', icon: '🧩' },
  { id: 'brain',  label: 'Brain Games', blurb: 'Quick games. Beat your own best.',    icon: '⚡' },
  { id: 'word',   label: 'Word Play',   blurb: 'Letters, words and clues.',           icon: '🔤' }
];

var PLAY_REGISTRY = null;
function getPlayRegistry() {
  if (PLAY_REGISTRY) return PLAY_REGISTRY;
  PLAY_REGISTRY = {};
  [
    typeof playJigsaw     !== 'undefined' ? playJigsaw     : null,
    typeof playNumPyramid !== 'undefined' ? playNumPyramid : null,
    typeof playMemoryGrid !== 'undefined' ? playMemoryGrid : null,
    typeof playSpeedMatch !== 'undefined' ? playSpeedMatch : null,
    typeof playStroop     !== 'undefined' ? playStroop     : null,
    typeof playTrail      !== 'undefined' ? playTrail      : null,
    typeof playWordSearch !== 'undefined' ? playWordSearch : null,
    typeof playCrossword  !== 'undefined' ? playCrossword  : null,
    typeof playPairs      !== 'undefined' ? playPairs      : null,
    typeof playPatterns   !== 'undefined' ? playPatterns   : null,
    typeof playSudoku     !== 'undefined' ? playSudoku     : null
  ].forEach(function (g) { if (g && g.id) PLAY_REGISTRY[g.id] = g; });
  return PLAY_REGISTRY;
}

// ---- Per-game progress --------------------------------------------------

function getPlayState(gameId) {
  if (!state.play) state.play = {};
  if (!state.play[gameId]) {
    state.play[gameId] = { plays: 0, best: null, level: 1, lastPlayed: 0 };
  }
  return state.play[gameId];
}

/**
 * Record a finished game.
 *   score      higher-is-better number (or seconds if lowerIsBetter)
 *   opts.lowerIsBetter  for timed puzzles where fast is good
 *   opts.levelUp        true if she should move up a difficulty
 */
function playFinish(gameId, score, opts) {
  opts = opts || {};
  var ps = getPlayState(gameId);
  ps.plays++;
  ps.lastPlayed = Date.now();

  var isBest = false;
  if (ps.best === null) { ps.best = score; isBest = ps.plays > 0; }
  else if (opts.lowerIsBetter ? score < ps.best : score > ps.best) { ps.best = score; isBest = true; }

  if (opts.levelUp && ps.level < 10) ps.level++;

  // Stars: a flat, modest reward. Play is not where the mastery is,
  // so it must not out-earn the actual learning.
  var stars = ps.plays === 1 ? 10 : (isBest ? 6 : 3);
  state.tokens = (state.tokens || 0) + stars;

  saveState();
  if (typeof updateTokenDisplay === 'function') updateTokenDisplay();
  if (typeof playSound === 'function') playSound(isBest ? 'levelup' : 'correct');
  if (typeof spawnParticles === 'function') {
    spawnParticles(window.innerWidth / 2, window.innerHeight / 3, isBest ? 14 : 7, isBest ? '🏆' : '⭐');
  }
  if (typeof lumiSay === 'function') {
    lumiSay(isBest && ps.plays > 1 ? ('New best! +' + stars + ' stars.') : ('+' + stars + ' stars!'));
  }
  return { stars: stars, isBest: isBest, best: ps.best, level: ps.level };
}

/** Standard "you finished" panel every game can call. */
function playWinPanel(gameId, headline, detail, res) {
  var g = getPlayRegistry()[gameId];
  var html = '<div class="play-win">';
  html += '<div class="play-win-icon">' + (res && res.isBest ? '🏆' : '🎉') + '</div>';
  html += '<div class="play-win-head">' + headline + '</div>';
  if (detail) html += '<div class="play-win-detail">' + detail + '</div>';
  if (res) {
    html += '<div class="play-win-stars">+' + res.stars + ' ⭐</div>';
    if (res.isBest) html += '<div class="play-win-best">That is your new personal best.</div>';
  }
  html += '<div class="play-win-btns">';
  html += '<button class="lesson-btn lesson-btn-done" onclick="openPlayGame(\'' + gameId + '\')">Play again</button>';
  html += '<button class="lesson-btn" onclick="openPlayHub()">Back to Play</button>';
  html += '</div></div>';
  return html;
}

// ---- Hub ---------------------------------------------------------------

function renderPlayHub() {
  var c = document.getElementById('play-content');
  if (!c) return;
  var reg = getPlayRegistry();

  var html = '<button class="back-btn" onclick="showScreen(\'home\')">← Back to Home</button>';
  html += '<div class="play-head">';
  html += '<div class="play-head-icon">🎲</div>';
  html += '<h2 class="play-title">Play</h2>';
  html += '<p class="play-sub">Puzzles and quick brain games. No wrong answers here — just have a go.</p>';
  html += '</div>';

  PLAY_CATEGORIES.forEach(function (cat) {
    var games = Object.keys(reg).map(function (k) { return reg[k]; })
      .filter(function (g) { return g.category === cat.id; });
    if (games.length === 0) return;

    html += '<div class="play-group">';
    html += '<div class="play-group-head"><span class="play-group-icon">' + cat.icon + '</span>';
    html += '<div><div class="play-group-label">' + cat.label + '</div>';
    html += '<div class="play-group-blurb">' + cat.blurb + '</div></div></div>';
    html += '<div class="play-grid">';
    games.forEach(function (g) {
      var ps = getPlayState(g.id);
      var bestTxt = ps.best === null ? 'Not tried yet'
        : (g.lowerIsBetter ? ('Best: ' + ps.best + 's') : ('Best: ' + ps.best));
      html += '<button class="play-card" onclick="openPlayGame(\'' + g.id + '\')">';
      html += '<div class="play-card-icon">' + g.emoji + '</div>';
      html += '<div class="play-card-name">' + g.name + '</div>';
      html += '<div class="play-card-blurb">' + g.blurb + '</div>';
      html += '<div class="play-card-foot">' + bestTxt + (ps.plays ? ' · ' + ps.plays + ' plays' : '') + '</div>';
      html += '</button>';
    });
    html += '</div></div>';
  });

  html += '<div class="play-note">A note for grown-ups: brain games mostly make you better at ' +
          'the game itself. The evidence that they raise general intelligence is weak, so these are ' +
          'here for fun and focus, not as schoolwork.</div>';

  c.innerHTML = html;
}

function openPlayGame(gameId) {
  var g = getPlayRegistry()[gameId];
  if (!g) return;
  if (window._currentPlay && window._currentPlay.dispose) {
    try { window._currentPlay.dispose(); } catch (e) {}
  }
  window._currentPlay = g;
  showScreen('play-game');
  var c = document.getElementById('play-game-content');
  if (c) g.render(c);
}

function openPlayHub() {
  if (window._currentPlay && window._currentPlay.dispose) {
    try { window._currentPlay.dispose(); } catch (e) {}
  }
  window._currentPlay = null;
  showScreen('play');
}

/** Shared header every game shows. */
function playHeader(g, right) {
  var ps = getPlayState(g.id);
  var html = '<button class="back-btn" onclick="openPlayHub()">← Back to Play</button>';
  html += '<div class="play-game-head">';
  html += '<div><span class="play-game-icon">' + g.emoji + '</span> ';
  html += '<span class="play-game-name">' + g.name + '</span></div>';
  html += '<div class="play-game-right">' + (right || '') +
          (ps.best !== null ? '<span class="play-best-pill">best ' + ps.best + (g.lowerIsBetter ? 's' : '') + '</span>' : '') +
          '</div>';
  html += '</div>';
  return html;
}

if (typeof window !== 'undefined') {
  window.renderPlayHub = renderPlayHub;
  window.openPlayGame = openPlayGame;
  window.openPlayHub = openPlayHub;
  window.getPlayState = getPlayState;
  window.playFinish = playFinish;
  window.playWinPanel = playWinPanel;
  window.playHeader = playHeader;
  window.getPlayRegistry = getPlayRegistry;
}
