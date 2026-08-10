// ============================================================
//  NUMBER PYRAMID — each brick is the sum of the two beneath it.
//
//  A genuinely mathematical puzzle rather than a dressed-up drill:
//  she has to reason backwards ("if this brick is 12 and the one
//  under it is 5, the other must be 7"), which is missing-addend
//  thinking - exactly the P1 skill that makes subtraction click.
//
//  The generator builds a valid pyramid first, then blanks cells,
//  so every puzzle is guaranteed solvable.
// ============================================================

var playNumPyramid = (function () {

  var st = null;

  function rowsForLevel(level) {
    if (level <= 2) return 3;
    if (level <= 5) return 4;
    return 5;
  }
  function baseMaxForLevel(level) {
    if (level <= 1) return 5;
    if (level <= 3) return 9;
    if (level <= 6) return 15;
    return 25;
  }

  /** rows[0] is the base (widest). Each row above sums adjacent pairs. */
  function buildPyramid(rows, baseMax) {
    var grid = [];
    var base = [];
    for (var i = 0; i < rows; i++) base.push(1 + Math.floor(Math.random() * baseMax));
    grid.push(base);
    for (var r = 1; r < rows; r++) {
      var prev = grid[r - 1], cur = [];
      for (var c = 0; c < prev.length - 1; c++) cur.push(prev[c] + prev[c + 1]);
      grid.push(cur);
    }
    return grid;
  }

  function render(container) {
    var ps = getPlayState('pyramid');
    var rows = rowsForLevel(ps.level);
    var grid = buildPyramid(rows, baseMaxForLevel(ps.level));

    // Choose which cells to hide. Never hide so many that a row is
    // fully unknown with no way in.
    var hidden = {};
    var totalCells = grid.reduce(function (s, r) { return s + r.length; }, 0);
    var target = Math.max(2, Math.round(totalCells * (ps.level >= 4 ? 0.42 : 0.3)));
    var attempts = 0;
    while (Object.keys(hidden).length < target && attempts++ < 200) {
      var r = Math.floor(Math.random() * grid.length);
      var c = Math.floor(Math.random() * grid[r].length);
      var key = r + ',' + c;
      if (hidden[key]) continue;
      // keep at least one known cell in every row
      var knownInRow = grid[r].length - grid[r].filter(function (_, ci) { return hidden[r + ',' + ci]; }).length;
      if (knownInRow <= 1) continue;
      hidden[key] = true;
    }

    st = { grid: grid, hidden: hidden, answers: {}, rows: rows, started: Date.now(), done: false, wrong: 0 };

    var html = playHeader(playNumPyramid, '<span class="play-pill">' + rows + ' rows</span>');
    html += '<p class="play-instr">Every brick is the two bricks under it <b>added together</b>. Fill the empty ones.</p>';
    html += '<div class="pyr" id="pyr"></div>';
    html += '<div class="play-status" id="pyr-status"></div>';
    html += '<button class="lesson-btn" onclick="openPlayGame(\'pyramid\')">↻ New pyramid</button>';
    container.innerHTML = html;
    paint();
  }

  function paint() {
    var host = document.getElementById('pyr');
    if (!host || !st) return;
    var html = '';
    // Draw top row first (narrowest) so it looks like a pyramid.
    for (var r = st.grid.length - 1; r >= 0; r--) {
      html += '<div class="pyr-row">';
      for (var c = 0; c < st.grid[r].length; c++) {
        var key = r + ',' + c;
        if (st.hidden[key]) {
          var val = st.answers[key];
          var okCls = val === undefined ? '' : (Number(val) === st.grid[r][c] ? ' ok' : ' bad');
          html += '<input class="pyr-brick input' + okCls + '" inputmode="numeric" ' +
                  'value="' + (val === undefined ? '' : val) + '" data-key="' + key + '" maxlength="4">';
        } else {
          html += '<div class="pyr-brick given">' + st.grid[r][c] + '</div>';
        }
      }
      html += '</div>';
    }
    host.innerHTML = html;
    host.querySelectorAll('.pyr-brick.input').forEach(function (el) {
      el.oninput = function () {
        st.answers[el.dataset.key] = el.value.replace(/[^0-9]/g, '');
        el.value = st.answers[el.dataset.key];
        check(el);
      };
    });
    updateStatus();
  }

  function check(el) {
    var key = el.dataset.key;
    var parts = key.split(',');
    var want = st.grid[+parts[0]][+parts[1]];
    var got = st.answers[key];
    el.classList.remove('ok', 'bad');
    if (got === '' || got === undefined) { updateStatus(); return; }
    if (Number(got) === want) {
      el.classList.add('ok');
      if (typeof playSound === 'function') playSound('correct');
    } else {
      el.classList.add('bad');
      st.wrong++;
    }
    updateStatus();
    if (allCorrect() && !st.done) finish();
  }

  function allCorrect() {
    return Object.keys(st.hidden).every(function (k) {
      var p = k.split(',');
      return Number(st.answers[k]) === st.grid[+p[0]][+p[1]];
    });
  }

  function updateStatus() {
    var s = document.getElementById('pyr-status');
    if (!s || !st) return;
    var total = Object.keys(st.hidden).length;
    var done = Object.keys(st.hidden).filter(function (k) {
      var p = k.split(',');
      return Number(st.answers[k]) === st.grid[+p[0]][+p[1]];
    }).length;
    s.textContent = done + ' of ' + total + ' bricks filled in';
  }

  function finish() {
    st.done = true;
    var secs = Math.round((Date.now() - st.started) / 1000);
    var res = playFinish('pyramid', secs, { lowerIsBetter: true, levelUp: st.wrong <= 1 });
    var c = document.getElementById('play-game-content');
    if (c) {
      c.innerHTML += playWinPanel('pyramid', 'Pyramid complete!',
        'Finished in ' + secs + ' seconds' + (st.wrong ? ' with ' + st.wrong + ' retries.' : ' with no mistakes!'), res);
    }
  }

  function dispose() { st = null; }

  return {
    id: 'pyramid', name: 'Number Pyramid', emoji: '🔺', category: 'puzzle',
    blurb: 'Each brick is the two below it added up.',
    lowerIsBetter: true, render: render, dispose: dispose
  };
})();

if (typeof window !== 'undefined') window.playNumPyramid = playNumPyramid;
