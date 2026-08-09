// ============================================================
//  MORE PLAY — memory pairs, pattern sequences, sudoku-lite.
//
//  Three more games, chosen to cover gaps the first batch left:
//    Memory Pairs   classic concentration. Pure recall, no timer,
//                   the gentlest game in the app.
//    What Comes Next  pattern continuation - the reasoning skill
//                   behind sequences, times tables and algebra later.
//    Mini Sudoku    4x4 and 6x6 with symbols instead of digits for
//                   the youngest level, so it is a logic puzzle
//                   rather than a reading test.
// ============================================================

// ---------------------------------------------------------------
//  MEMORY PAIRS
// ---------------------------------------------------------------
var playPairs = (function () {
  var FACES = ['🐱','🐶','🦊','🐼','🐸','🦋','🌻','⭐','🚀','🍎','🐧','🦄'];
  var st = null, flipTimer = null;

  /** Build a shuffled deck containing each face exactly twice. */
  function makeDeck(pairCount) {
    var faces = FACES.slice().sort(function () { return Math.random() - 0.5; }).slice(0, pairCount);
    return shufflePlay(faces.concat(faces));
  }

  function render(container) {
    var ps = getPlayState('pairs');
    var pairCount = ps.level <= 2 ? 6 : (ps.level <= 5 ? 8 : 10);
    var deck = makeDeck(pairCount);

    st = { deck: deck, flipped: [], matched: {}, moves: 0, started: Date.now(), done: false, busy: false };

    var cols = pairCount <= 6 ? 4 : (pairCount <= 8 ? 4 : 5);
    var html = playHeader(playPairs, '<span class="play-pill">' + pairCount + ' pairs</span>');
    html += '<p class="play-instr">Turn over two cards. If they match they stay up. Find every pair!</p>';
    html += '<div class="pairs-grid" id="pairs-grid" style="grid-template-columns:repeat(' + cols + ',1fr)"></div>';
    html += '<div class="play-status" id="pairs-status">0 turns</div>';
    html += '<button class="lesson-btn" onclick="openPlayGame(\'pairs\')">↻ New game</button>';
    container.innerHTML = html;
    paint();
  }

  function paint() {
    var g = document.getElementById('pairs-grid');
    if (!g || !st) return;
    var html = '';
    st.deck.forEach(function (face, i) {
      var isUp = st.flipped.indexOf(i) !== -1 || st.matched[i];
      html += '<button class="pair-card' + (isUp ? ' up' : '') + (st.matched[i] ? ' matched' : '') +
              '" data-i="' + i + '">' + (isUp ? face : '?') + '</button>';
    });
    g.innerHTML = html;
    g.querySelectorAll('.pair-card').forEach(function (el) {
      el.onclick = function () { flip(parseInt(el.dataset.i, 10)); };
    });
    var s = document.getElementById('pairs-status');
    if (s) s.textContent = st.moves + (st.moves === 1 ? ' turn' : ' turns');
  }

  function flip(i) {
    if (!st || st.done || st.busy) return;
    if (st.matched[i] || st.flipped.indexOf(i) !== -1) return;

    st.flipped.push(i);
    if (typeof playSound === 'function') playSound('click');
    paint();

    if (st.flipped.length < 2) return;

    st.moves++;
    var a = st.flipped[0], b = st.flipped[1];
    if (st.deck[a] === st.deck[b]) {
      st.matched[a] = true; st.matched[b] = true;
      st.flipped = [];
      if (typeof playSound === 'function') playSound('correct');
      paint();
      if (Object.keys(st.matched).length === st.deck.length) finish();
    } else {
      // Leave both visible briefly so she can actually see them.
      st.busy = true;
      paint();
      clearTimeout(flipTimer);
      flipTimer = setTimeout(function () {
        if (!st) return;
        st.flipped = [];
        st.busy = false;
        paint();
      }, 850);
    }
  }

  function finish() {
    st.done = true;
    var secs = Math.round((Date.now() - st.started) / 1000);
    var perfect = st.deck.length / 2;
    var res = playFinish('pairs', st.moves, { lowerIsBetter: true, levelUp: st.moves <= perfect * 2 });
    var c = document.getElementById('play-game-content');
    if (c) {
      c.innerHTML += playWinPanel('pairs', 'Every pair found!',
        st.moves + ' turns in ' + secs + ' seconds. A perfect game would be ' + perfect + '.', res);
    }
  }

  function dispose() { clearTimeout(flipTimer); st = null; }

  return {
    id: 'pairs', name: 'Memory Pairs', emoji: '🃏', category: 'puzzle',
    blurb: 'Turn cards over and find the matching pairs.',
    lowerIsBetter: true, render: render, dispose: dispose,
    _makeDeck: makeDeck
  };
})();

// ---------------------------------------------------------------
//  WHAT COMES NEXT  (pattern continuation)
// ---------------------------------------------------------------
var playPatterns = (function () {
  var st = null;

  /** Each generator returns {seq, answer, why} — `why` is shown after. */
  var KINDS = [
    // repeating shape pattern (easiest, pre-numeric)
    function () {
      var pool = ['🔴','🔵','🟡','🟢','🟣'];
      var a = pool[Math.floor(Math.random() * pool.length)];
      var b = pool.filter(function (x) { return x !== a; })[Math.floor(Math.random() * 4)];
      var unit = Math.random() < 0.5 ? [a, b] : [a, a, b];
      var seq = [];
      for (var i = 0; i < 7; i++) seq.push(unit[i % unit.length]);
      return { seq: seq.slice(0, 6), answer: seq[6], why: 'The pattern repeats ' + unit.join('') + ' over and over.',
               options: pool };
    },
    // count on by n
    function () {
      var start = 1 + Math.floor(Math.random() * 5);
      var step = [2, 3, 5, 10][Math.floor(Math.random() * 4)];
      var seq = [];
      for (var i = 0; i < 5; i++) seq.push(String(start + step * i));
      var ans = String(start + step * 5);
      return { seq: seq, answer: ans, why: 'Each one goes up by ' + step + '.', numeric: true };
    },
    // count back
    function () {
      var step = [2, 3, 5][Math.floor(Math.random() * 3)];
      var start = 30 + Math.floor(Math.random() * 20);
      var seq = [];
      for (var i = 0; i < 5; i++) seq.push(String(start - step * i));
      var ans = String(start - step * 5);
      return { seq: seq, answer: ans, why: 'Each one goes down by ' + step + '.', numeric: true };
    },
    // doubling
    function () {
      var start = [1, 2, 3][Math.floor(Math.random() * 3)];
      var seq = [], v = start;
      for (var i = 0; i < 5; i++) { seq.push(String(v)); v *= 2; }
      return { seq: seq, answer: String(v), why: 'Each one is double the one before.', numeric: true };
    },
    // growing size pattern
    function () {
      var emoji = ['⭐','🌸','🍀','🐟'][Math.floor(Math.random() * 4)];
      var seq = [];
      for (var i = 1; i <= 5; i++) seq.push(emoji.repeat(i));
      return { seq: seq, answer: emoji.repeat(6), why: 'One more is added each time.',
               options: [emoji.repeat(4), emoji.repeat(5), emoji.repeat(6), emoji.repeat(7)] };
    }
  ];

  function render(container) {
    var ps = getPlayState('patterns');
    // Younger levels stay on the visual patterns; numeric appears later.
    var pool = ps.level <= 2 ? [KINDS[0], KINDS[4]] : KINDS;
    st = { round: 1, score: 0, wrong: 0, done: false, pool: pool, q: null };

    var html = playHeader(playPatterns, '<span class="play-pill" id="pat-round">1 of 8</span>');
    html += '<p class="play-instr">Look at the pattern. What comes next?</p>';
    html += '<div class="pat-seq" id="pat-seq"></div>';
    html += '<div class="pat-opts" id="pat-opts"></div>';
    html += '<div class="play-status" id="pat-status"></div>';
    container.innerHTML = html;
    nextQ();
  }

  function nextQ() {
    if (!st) return;
    st.q = st.pool[Math.floor(Math.random() * st.pool.length)]();
    var q = st.q;

    // Build four options including the answer.
    var opts = [q.answer];
    if (q.numeric) {
      var n = Number(q.answer);
      [n + 1, n - 1, n + 2, n - 2, n + 5].forEach(function (v) {
        if (v > 0 && opts.length < 4 && opts.indexOf(String(v)) === -1) opts.push(String(v));
      });
    } else if (q.options) {
      q.options.forEach(function (o) { if (opts.length < 4 && opts.indexOf(o) === -1) opts.push(o); });
    }
    while (opts.length < 4) opts.push(String(Math.floor(Math.random() * 50) + 1));
    shufflePlay(opts);

    var seqEl = document.getElementById('pat-seq');
    if (seqEl) {
      seqEl.innerHTML = q.seq.map(function (s) { return '<span class="pat-item">' + s + '</span>'; }).join('') +
                        '<span class="pat-item mystery">?</span>';
    }
    var optEl = document.getElementById('pat-opts');
    if (optEl) {
      optEl.innerHTML = opts.map(function (o) {
        return '<button class="pat-opt" data-v="' + String(o).replace(/"/g, '&quot;') + '">' + o + '</button>';
      }).join('');
      optEl.querySelectorAll('.pat-opt').forEach(function (b) {
        b.onclick = function () { answer(b.dataset.v, b); };
      });
    }
    var r = document.getElementById('pat-round');
    if (r) r.textContent = st.round + ' of 8';
  }

  function answer(v, btn) {
    if (!st || st.done) return;
    var right = (v === String(st.q.answer));
    if (right) { st.score++; if (typeof playSound === 'function') playSound('correct'); }
    else { st.wrong++; if (typeof playSound === 'function') playSound('wrong'); }
    if (btn) btn.classList.add(right ? 'right' : 'wrong');

    var s = document.getElementById('pat-status');
    if (s) s.textContent = (right ? '✓ ' : '✗ ') + st.q.why;

    // Keep the flow: move on by itself, like the quizzes now do.
    setTimeout(function () {
      if (!st || st.done) return;
      st.round++;
      if (st.round > 8) finish();
      else { nextQ(); var st2 = document.getElementById('pat-status'); if (st2) st2.textContent = ''; }
    }, right ? 900 : 2200);
  }

  function finish() {
    st.done = true;
    var res = playFinish('patterns', st.score, { levelUp: st.score >= 7 });
    var c = document.getElementById('play-game-content');
    if (c) {
      c.innerHTML += playWinPanel('patterns', st.score + ' out of 8 right',
        'Spotting patterns is the same thinking you use for times tables.', res);
    }
  }

  function dispose() { st = null; }

  return {
    id: 'patterns', name: 'What Comes Next', emoji: '🔮', category: 'puzzle',
    blurb: 'Work out what continues the pattern.',
    render: render, dispose: dispose
  };
})();

// ---------------------------------------------------------------
//  MINI SUDOKU  (4x4 with symbols, 6x6 with digits later)
// ---------------------------------------------------------------
var playSudoku = (function () {
  var st = null;

  /** Generate a solved 4x4 latin square with 2x2 boxes. */
  function solved4() {
    // Start from a known valid grid, then permute symbols, rows within
    // bands, and columns within stacks. All of those preserve validity.
    var g = [[1,2,3,4],[3,4,1,2],[2,1,4,3],[4,3,2,1]];
    var perm = [1,2,3,4]; shufflePlay(perm);
    g = g.map(function (row) { return row.map(function (v) { return perm[v - 1]; }); });
    if (Math.random() < 0.5) { var t = g[0]; g[0] = g[1]; g[1] = t; }
    if (Math.random() < 0.5) { var u = g[2]; g[2] = g[3]; g[3] = u; }
    if (Math.random() < 0.5) { for (var r = 0; r < 4; r++) { var x = g[r][0]; g[r][0] = g[r][1]; g[r][1] = x; } }
    if (Math.random() < 0.5) { for (var r2 = 0; r2 < 4; r2++) { var y = g[r2][2]; g[r2][2] = g[r2][3]; g[r2][3] = y; } }
    return g;
  }

  function render(container) {
    var ps = getPlayState('sudoku');
    var useSymbols = ps.level <= 3;
    var SYMS = ['🍎','⭐','🌸','🐱'];
    var grid = solved4();

    // Remove cells. 4x4 stays comfortably solvable at 6-8 blanks.
    var blanks = ps.level <= 1 ? 5 : (ps.level <= 4 ? 7 : 9);
    var given = grid.map(function (r) { return r.slice(); });
    var cells = [];
    for (var r = 0; r < 4; r++) for (var c = 0; c < 4; c++) cells.push([r, c]);
    shufflePlay(cells);
    for (var i = 0; i < blanks; i++) { given[cells[i][0]][cells[i][1]] = 0; }

    st = { grid: grid, given: given, vals: {}, syms: useSymbols ? SYMS : ['1','2','3','4'],
           sel: null, started: Date.now(), done: false };

    var html = playHeader(playSudoku, '<span class="play-pill">4×4</span>');
    html += '<p class="play-instr">Every row, every column and every little 2×2 box must have all four ' +
            (useSymbols ? 'pictures' : 'numbers') + ' — with none repeated.</p>';
    html += '<div class="sud-grid" id="sud-grid"></div>';
    html += '<div class="sud-pal" id="sud-pal"></div>';
    html += '<div class="play-status" id="sud-status"></div>';
    html += '<button class="lesson-btn" onclick="openPlayGame(\'sudoku\')">↻ New puzzle</button>';
    container.innerHTML = html;
    paint();
  }

  function paint() {
    var g = document.getElementById('sud-grid');
    if (!g || !st) return;
    var html = '';
    for (var r = 0; r < 4; r++) {
      for (var c = 0; c < 4; c++) {
        var key = r + ',' + c;
        var fixed = st.given[r][c] !== 0;
        var v = fixed ? st.given[r][c] : (st.vals[key] || 0);
        var bad = !fixed && v !== 0 && v !== st.grid[r][c];
        var cls = 'sud-cell' + (fixed ? ' fixed' : '') + (bad ? ' bad' : '') +
                  (st.sel === key ? ' sel' : '') +
                  ((r === 1 || r === 3) ? ' bband' : '') + ((c === 1 || c === 3) ? ' bstack' : '');
        html += '<button class="' + cls + '" data-k="' + key + '">' + (v ? st.syms[v - 1] : '') + '</button>';
      }
    }
    g.innerHTML = html;
    g.querySelectorAll('.sud-cell').forEach(function (el) {
      el.onclick = function () {
        var k = el.dataset.k, p = k.split(',');
        if (st.given[+p[0]][+p[1]] !== 0) return;      // cannot change a clue
        st.sel = k;
        paint();
      };
    });

    var pal = document.getElementById('sud-pal');
    if (pal) {
      pal.innerHTML = st.syms.map(function (s, i) {
        return '<button class="sud-key" data-v="' + (i + 1) + '">' + s + '</button>';
      }).join('') + '<button class="sud-key clear" data-v="0">✕</button>';
      pal.querySelectorAll('.sud-key').forEach(function (b) {
        b.onclick = function () { place(parseInt(b.dataset.v, 10)); };
      });
    }
    updateStatus();
  }

  function place(v) {
    if (!st || st.done || !st.sel) return;
    if (v === 0) delete st.vals[st.sel];
    else st.vals[st.sel] = v;
    if (typeof playSound === 'function') playSound('click');
    paint();
    checkDone();
  }

  function updateStatus() {
    var s = document.getElementById('sud-status');
    if (!s || !st) return;
    var blanks = 0, filled = 0;
    for (var r = 0; r < 4; r++) for (var c = 0; c < 4; c++) {
      if (st.given[r][c] === 0) { blanks++; if (st.vals[r + ',' + c]) filled++; }
    }
    s.textContent = st.sel ? (filled + ' of ' + blanks + ' filled — now pick a picture below')
                           : (filled + ' of ' + blanks + ' filled — tap an empty square');
  }

  function checkDone() {
    if (!st || st.done) return;
    for (var r = 0; r < 4; r++) for (var c = 0; c < 4; c++) {
      if (st.given[r][c] !== 0) continue;
      if (st.vals[r + ',' + c] !== st.grid[r][c]) return;
    }
    st.done = true;
    var secs = Math.round((Date.now() - st.started) / 1000);
    var res = playFinish('sudoku', secs, { lowerIsBetter: true, levelUp: true });
    var c2 = document.getElementById('play-game-content');
    if (c2) c2.innerHTML += playWinPanel('sudoku', 'Sudoku solved!', secs + ' seconds.', res);
  }

  function dispose() { st = null; }

  return {
    id: 'sudoku', name: 'Mini Sudoku', emoji: '🔢', category: 'puzzle',
    blurb: 'Four pictures, no repeats in any row, column or box.',
    lowerIsBetter: true, render: render, dispose: dispose,
    _solved4: solved4
  };
})();

if (typeof window !== 'undefined') {
  window.playPairs = playPairs;
  window.playPatterns = playPatterns;
  window.playSudoku = playSudoku;
}
