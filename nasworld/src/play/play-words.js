// ============================================================
//  WORD PLAY — word search and a picture crossword.
//
//  Word lists are drawn from the app's own P1 vocabulary where
//  possible, so playing here quietly rehearses the same sight
//  words and topic words she meets in Word World and Dunia Melayu.
// ============================================================

var PLAY_WORD_SETS = [
  { theme: 'Animals',  emoji: '🐾', words: ['CAT','DOG','HEN','PIG','COW','FOX','BEE','OWL'] },
  { theme: 'Colours',  emoji: '🎨', words: ['RED','BLUE','PINK','GOLD','GREY','GREEN'] },
  { theme: 'Family',   emoji: '👪', words: ['MUM','DAD','BABY','NAN','SON','AUNT'] },
  { theme: 'Food',     emoji: '🍜', words: ['RICE','EGG','CAKE','SOUP','MILK','BUN'] },
  { theme: 'School',   emoji: '🎒', words: ['BOOK','PEN','DESK','BAG','GLUE','MAP'] },
  { theme: 'Malay',    emoji: '🌺', words: ['SATU','DUA','TIGA','BUKU','MEJA','MATA'] },
  { theme: 'Space',    emoji: '🚀', words: ['STAR','MOON','SUN','MARS','SKY'] },
  { theme: 'Body',     emoji: '👀', words: ['EYE','EAR','ARM','LEG','HAND','NOSE'] }
];

// ---------------------------------------------------------------
//  WORD SEARCH
// ---------------------------------------------------------------
var playWordSearch = (function () {
  var st = null;
  var LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

  function render(container) {
    var ps = getPlayState('wordsearch');
    var set = PLAY_WORD_SETS[Math.floor(Math.random() * PLAY_WORD_SETS.length)];
    var size = ps.level <= 2 ? 8 : (ps.level <= 5 ? 10 : 12);
    var maxWords = ps.level <= 2 ? 4 : (ps.level <= 5 ? 5 : 6);
    var words = set.words.slice().sort(function () { return Math.random() - 0.5; })
                  .filter(function (w) { return w.length <= size; })
                  .slice(0, maxWords);

    var placed = placeWords(words, size, ps.level >= 4);
    st = { size: size, grid: placed.grid, words: placed.placed, found: {},
           sel: [], set: set, started: Date.now(), done: false };

    var html = playHeader(playWordSearch, '<span class="play-pill">' + set.emoji + ' ' + set.theme + '</span>');
    html += '<p class="play-instr">Drag across the letters to find each word. They can go across or down' +
            (ps.level >= 4 ? ', and sometimes backwards' : '') + '.</p>';
    html += '<div class="ws-grid" id="ws-grid"></div>';
    html += '<div class="ws-words" id="ws-words"></div>';
    html += '<button class="lesson-btn" onclick="openPlayGame(\'wordsearch\')">↻ New puzzle</button>';
    container.innerHTML = html;
    paint();
    wire();
  }

  function placeWords(words, size, allowReverse) {
    var grid = [];
    for (var r = 0; r < size; r++) { grid.push(new Array(size).fill('')); }
    var placed = [];

    words.forEach(function (w) {
      var dirs = [[0, 1], [1, 0]];
      if (allowReverse) dirs = dirs.concat([[0, -1], [-1, 0]]);
      for (var attempt = 0; attempt < 220; attempt++) {
        var d = dirs[Math.floor(Math.random() * dirs.length)];
        var r0 = Math.floor(Math.random() * size);
        var c0 = Math.floor(Math.random() * size);
        var rEnd = r0 + d[0] * (w.length - 1);
        var cEnd = c0 + d[1] * (w.length - 1);
        if (rEnd < 0 || rEnd >= size || cEnd < 0 || cEnd >= size) continue;
        var ok = true, cells = [];
        for (var i = 0; i < w.length; i++) {
          var rr = r0 + d[0] * i, cc = c0 + d[1] * i;
          var cur = grid[rr][cc];
          if (cur !== '' && cur !== w[i]) { ok = false; break; }
          cells.push([rr, cc]);
        }
        if (!ok) continue;
        cells.forEach(function (p, i) { grid[p[0]][p[1]] = w[i]; });
        placed.push({ word: w, cells: cells.map(function (p) { return p[0] + ',' + p[1]; }) });
        return;
      }
      // If it would not fit we simply drop it rather than ship a
      // puzzle containing a word that cannot be found.
    });

    for (var r2 = 0; r2 < size; r2++) {
      for (var c2 = 0; c2 < size; c2++) {
        if (grid[r2][c2] === '') grid[r2][c2] = LETTERS[Math.floor(Math.random() * 26)];
      }
    }
    return { grid: grid, placed: placed };
  }

  function paint() {
    var g = document.getElementById('ws-grid');
    if (!g || !st) return;
    g.style.gridTemplateColumns = 'repeat(' + st.size + ',1fr)';
    var foundCells = {};
    Object.keys(st.found).forEach(function (w) {
      var entry = st.words.find(function (x) { return x.word === w; });
      if (entry) entry.cells.forEach(function (k) { foundCells[k] = true; });
    });
    var html = '';
    for (var r = 0; r < st.size; r++) {
      for (var c = 0; c < st.size; c++) {
        var key = r + ',' + c;
        var cls = 'ws-cell';
        if (foundCells[key]) cls += ' found';
        if (st.sel.indexOf(key) !== -1) cls += ' sel';
        html += '<div class="' + cls + '" data-k="' + key + '">' + st.grid[r][c] + '</div>';
      }
    }
    g.innerHTML = html;

    var wl = document.getElementById('ws-words');
    if (wl) {
      wl.innerHTML = st.words.map(function (w) {
        return '<span class="ws-word' + (st.found[w.word] ? ' done' : '') + '">' + w.word + '</span>';
      }).join('');
    }
  }

  function wire() {
    var g = document.getElementById('ws-grid');
    if (!g) return;
    var dragging = false;

    function keyAt(target) {
      return target && target.classList && target.classList.contains('ws-cell') ? target.dataset.k : null;
    }
    function add(k) {
      if (!k || st.sel.indexOf(k) !== -1) return;
      st.sel.push(k);
      paint();
    }
    g.addEventListener('pointerdown', function (e) {
      if (st.done) return;
      dragging = true; st.sel = [];
      add(keyAt(e.target));
      e.preventDefault();
    });
    g.addEventListener('pointermove', function (e) {
      if (!dragging) return;
      var el = document.elementFromPoint(e.clientX, e.clientY);
      add(keyAt(el));
    });
    function release() {
      if (!dragging) return;
      dragging = false;
      checkSelection();
    }
    g.addEventListener('pointerup', release);
    g.addEventListener('pointercancel', release);
    g.addEventListener('pointerleave', release);
  }

  function checkSelection() {
    if (!st || st.sel.length < 2) { st.sel = []; paint(); return; }
    var picked = st.sel.join('|');
    var match = st.words.find(function (w) {
      return !st.found[w.word] &&
        (w.cells.join('|') === picked || w.cells.slice().reverse().join('|') === picked);
    });
    if (match) {
      st.found[match.word] = true;
      if (typeof playSound === 'function') playSound('correct');
      if (typeof lumiSay === 'function') lumiSay('Found ' + match.word + '!');
    }
    st.sel = [];
    paint();
    if (Object.keys(st.found).length === st.words.length && !st.done) finish();
  }

  function finish() {
    st.done = true;
    var secs = Math.round((Date.now() - st.started) / 1000);
    var res = playFinish('wordsearch', secs, { lowerIsBetter: true, levelUp: true });
    var c = document.getElementById('play-game-content');
    if (c) {
      c.innerHTML += playWinPanel('wordsearch', 'All words found!',
        'Theme: ' + st.set.theme + ' · ' + secs + ' seconds.', res);
    }
  }

  function dispose() { st = null; }

  return {
    id: 'wordsearch', name: 'Word Search', emoji: '🔍', category: 'word',
    blurb: 'Drag to find the hidden words.',
    lowerIsBetter: true, render: render, dispose: dispose
  };
})();

// ---------------------------------------------------------------
//  PICTURE CROSSWORD
//  Clues are emoji, not sentences, so a 6 year old who cannot yet
//  read a clue can still play.
// ---------------------------------------------------------------
var playCrossword = (function () {

  // Hand-built mini grids. Each is verified by the test suite to be
  // internally consistent (crossing letters must agree).
  var PUZZLES = [
    // Crossings verified by test/play.test.js: (0,0)=C shared by CAT/COW,
    // (0,2)=T shared by CAT/TEN, (2,0)=W shared by COW/WIN,
    // (2,2)=N shared by TEN/WIN.
    {
      size: 5,
      entries: [
        { word: 'CAT',  emoji: '🐱', r: 0, c: 0, dir: 'A', clue: 'says meow' },
        { word: 'COW',  emoji: '🐄', r: 0, c: 0, dir: 'D', clue: 'gives milk' },
        { word: 'TEN',  emoji: '🔟', r: 0, c: 2, dir: 'D', clue: 'how many fingers you have' },
        { word: 'WIN',  emoji: '🏆', r: 2, c: 0, dir: 'A', clue: 'to come first' }
      ]
    },
    {
      size: 5,
      entries: [
        { word: 'SUN',  emoji: '☀️', r: 0, c: 0, dir: 'A', clue: 'shines in the day' },
        { word: 'STAR', emoji: '⭐', r: 0, c: 0, dir: 'D', clue: 'twinkles at night' },
        { word: 'NEST', emoji: '🪹', r: 0, c: 2, dir: 'D', clue: 'a bird lives here' },
        { word: 'RAT',  emoji: '🐀', r: 3, c: 0, dir: 'A', clue: 'a long-tailed animal' }
      ]
    },
    {
      size: 5,
      entries: [
        { word: 'BUS',  emoji: '🚌', r: 0, c: 0, dir: 'A', clue: 'you ride it to school' },
        { word: 'BED',  emoji: '🛏️', r: 0, c: 0, dir: 'D', clue: 'you sleep in it' },
        { word: 'SKY',  emoji: '☁️', r: 0, c: 2, dir: 'D', clue: 'clouds float in it' },
        { word: 'DAY',  emoji: '📅', r: 2, c: 0, dir: 'A', clue: 'opposite of night' }
      ]
    }
  ];

  var st = null;

  function render(container) {
    var p = PUZZLES[Math.floor(Math.random() * PUZZLES.length)];
    // Build the cell map: key -> {answer, entries[]}
    var cells = {};
    p.entries.forEach(function (e, ei) {
      for (var i = 0; i < e.word.length; i++) {
        var r = e.r + (e.dir === 'D' ? i : 0);
        var c = e.c + (e.dir === 'A' ? i : 0);
        var k = r + ',' + c;
        if (!cells[k]) cells[k] = { answer: e.word[i], entries: [] };
        cells[k].entries.push(ei);
      }
    });
    st = { p: p, cells: cells, vals: {}, started: Date.now(), done: false };

    var html = playHeader(playCrossword, '');
    html += '<p class="play-instr">Type a letter in each square. The pictures are the clues.</p>';
    html += '<div class="cw-grid" id="cw-grid" style="grid-template-columns:repeat(' + p.size + ',1fr)"></div>';
    html += '<div class="cw-clues" id="cw-clues"></div>';
    html += '<button class="lesson-btn" onclick="openPlayGame(\'crossword\')">↻ New crossword</button>';
    container.innerHTML = html;
    paint();
  }

  function paint() {
    var g = document.getElementById('cw-grid');
    if (!g || !st) return;
    var html = '';
    for (var r = 0; r < st.p.size; r++) {
      for (var c = 0; c < st.p.size; c++) {
        var k = r + ',' + c;
        if (!st.cells[k]) { html += '<div class="cw-cell blank"></div>'; continue; }
        var num = st.p.entries.findIndex(function (e) { return e.r === r && e.c === c; });
        var v = st.vals[k] || '';
        var ok = v && v === st.cells[k].answer;
        html += '<div class="cw-cell">' +
          (num >= 0 ? '<span class="cw-num">' + (num + 1) + '</span>' : '') +
          '<input maxlength="1" class="cw-in' + (ok ? ' ok' : (v ? ' bad' : '')) + '" ' +
          'value="' + v + '" data-k="' + k + '"></div>';
      }
    }
    g.innerHTML = html;
    g.querySelectorAll('.cw-in').forEach(function (el) {
      el.oninput = function () {
        var v = (el.value || '').toUpperCase().replace(/[^A-Z]/g, '');
        el.value = v;
        st.vals[el.dataset.k] = v;
        paint();
        if (v) focusNext(el.dataset.k);
        check();
      };
      el.onfocus = function () { el.select(); };
    });

    var cl = document.getElementById('cw-clues');
    if (cl) {
      cl.innerHTML = st.p.entries.map(function (e, i) {
        var solved = e.word.split('').every(function (ch, j) {
          var r = e.r + (e.dir === 'D' ? j : 0), c = e.c + (e.dir === 'A' ? j : 0);
          return st.vals[r + ',' + c] === ch;
        });
        return '<div class="cw-clue' + (solved ? ' done' : '') + '">' +
          '<span class="cw-clue-n">' + (i + 1) + (e.dir === 'A' ? '→' : '↓') + '</span>' +
          '<span class="cw-clue-emoji">' + e.emoji + '</span>' +
          '<span class="cw-clue-text">' + e.clue + ' (' + e.word.length + ')</span></div>';
      }).join('');
    }
  }

  function focusNext(k) {
    var keys = Object.keys(st.cells).sort();
    var i = keys.indexOf(k);
    for (var j = i + 1; j < keys.length; j++) {
      var el = document.querySelector('.cw-in[data-k="' + keys[j] + '"]');
      if (el && !el.value) { el.focus(); return; }
    }
  }

  function check() {
    if (!st || st.done) return;
    var all = Object.keys(st.cells).every(function (k) { return st.vals[k] === st.cells[k].answer; });
    if (all) {
      st.done = true;
      var secs = Math.round((Date.now() - st.started) / 1000);
      var res = playFinish('crossword', secs, { lowerIsBetter: true, levelUp: true });
      var c = document.getElementById('play-game-content');
      if (c) c.innerHTML += playWinPanel('crossword', 'Crossword solved!', secs + ' seconds.', res);
    }
  }

  function dispose() { st = null; }

  return {
    id: 'crossword', name: 'Picture Crossword', emoji: '✏️', category: 'word',
    blurb: 'Emoji clues, no reading needed.',
    lowerIsBetter: true, render: render, dispose: dispose,
    _puzzles: PUZZLES
  };
})();

// ---------------------------------------------------------------
//  SPEED MATCH  (delayed match-to-sample / 1-back)
// ---------------------------------------------------------------
var playSpeedMatch = (function () {
  var SYMBOLS = ['🍎', '⭐', '🌸', '🐱', '🚀', '🎈'];
  var st = null, tick = null;

  function render(container) {
    st = { prev: null, cur: null, score: 0, wrong: 0, timeLeft: 45, done: false };
    var html = playHeader(playSpeedMatch, '<span class="play-pill" id="sm-time">45s</span>');
    html += '<p class="play-instr">Does this card match the one <b>before</b> it? Tap Same or Different.</p>';
    html += '<div class="sm-cards">';
    html += '<div class="sm-prev" id="sm-prev"><span class="sm-label">before</span><span class="sm-face">·</span></div>';
    html += '<div class="sm-cur" id="sm-cur"><span class="sm-label">now</span><span class="sm-face">·</span></div>';
    html += '</div>';
    html += '<div class="sm-btns">';
    html += '<button class="sm-btn same" onclick="playSpeedMatchAnswer(true)">Same</button>';
    html += '<button class="sm-btn diff" onclick="playSpeedMatchAnswer(false)">Different</button>';
    html += '</div>';
    html += '<div class="play-status" id="sm-status">Score: 0</div>';
    container.innerHTML = html;

    next();
    clearInterval(tick);
    tick = setInterval(function () {
      if (!st || st.done) return;
      st.timeLeft--;
      var t = document.getElementById('sm-time');
      if (t) t.textContent = st.timeLeft + 's';
      if (st.timeLeft <= 0) finish();
    }, 1000);
  }

  function next() {
    if (!st) return;
    st.prev = st.cur;
    // Half the time repeat the previous symbol, so Same/Different is balanced.
    if (st.prev && Math.random() < 0.5) st.cur = st.prev;
    else {
      var s;
      do { s = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]; } while (s === st.prev && Math.random() < 0.8);
      st.cur = s;
    }
    var p = document.querySelector('#sm-prev .sm-face');
    var c = document.querySelector('#sm-cur .sm-face');
    if (p) p.textContent = st.prev || '·';
    if (c) c.textContent = st.cur;
  }

  function answer(saidSame) {
    if (!st || st.done) return;
    if (st.prev === null) { next(); return; }   // first card has nothing to compare
    var isSame = (st.cur === st.prev);
    if (saidSame === isSame) { st.score++; if (typeof playSound === 'function') playSound('correct'); }
    else { st.wrong++; if (typeof playSound === 'function') playSound('wrong'); }
    var s = document.getElementById('sm-status');
    if (s) s.textContent = 'Score: ' + st.score + (st.wrong ? '  ·  ' + st.wrong + ' slips' : '');
    next();
  }

  function finish() {
    if (!st || st.done) return;
    st.done = true;
    clearInterval(tick);
    var res = playFinish('speedmatch', st.score, { levelUp: st.score >= 25 });
    var c = document.getElementById('play-game-content');
    if (c) {
      c.innerHTML += playWinPanel('speedmatch', st.score + ' correct in 45 seconds',
        'You had to hold the last card in your head while judging the new one.', res);
    }
  }

  function dispose() { clearInterval(tick); st = null; }

  if (typeof window !== 'undefined') window.playSpeedMatchAnswer = answer;

  return {
    id: 'speedmatch', name: 'Speed Match', emoji: '⚡', category: 'brain',
    blurb: 'Same as the card before? Quick!',
    render: render, dispose: dispose
  };
})();

if (typeof window !== 'undefined') {
  window.playWordSearch = playWordSearch;
  window.playCrossword = playCrossword;
  window.playSpeedMatch = playSpeedMatch;
  window.PLAY_WORD_SETS = PLAY_WORD_SETS;
}
