// ============================================================
//  BRAIN GAMES — three short timed tasks.
//
//  Each is an adaptation of a standard cognitive-psychology
//  paradigm. These are the same public tasks commercial brain
//  trainers build on; none of this copies anyone's artwork,
//  naming or level design.
//
//    Memory Grid   Corsi block-tapping task (Corsi, 1972) —
//                  visuo-spatial working memory span.
//    Colour Muddle Stroop task (Stroop, 1935) — inhibiting an
//                  automatic response (reading) in favour of a
//                  slower one (naming the ink colour).
//    Dot Trail     Trail Making Test (Army Individual Test, 1944) —
//                  visual search and set-switching.
//
//  All three are deliberately gentle: no failure sounds, no
//  streak-loss guilt, and the round always finishes.
// ============================================================

// ---------------------------------------------------------------
//  MEMORY GRID  (Corsi block-tapping)
// ---------------------------------------------------------------
var playMemoryGrid = (function () {
  var st = null;
  var timers = [];

  function clearTimers() { timers.forEach(clearTimeout); timers = []; }

  function render(container) {
    var ps = getPlayState('memgrid');
    st = { size: 3, tiles: [], shown: [], picked: [], phase: 'show', round: 1, best: 0, done: false };

    var html = playHeader(playMemoryGrid, '<span class="play-pill" id="mg-round">Round 1</span>');
    html += '<p class="play-instr">Watch which squares light up, then tap them in <b>any order</b>.</p>';
    html += '<div class="mg-wrap"><div class="mg-grid" id="mg-grid"></div></div>';
    html += '<div class="play-status" id="mg-status">Watch carefully…</div>';
    container.innerHTML = html;
    startRound();
  }

  function startRound() {
    if (!st) return;
    // Grid grows as she gets further: 3x3 -> 4x4 -> 5x5
    st.size = st.round <= 3 ? 3 : (st.round <= 7 ? 4 : 5);
    var cells = st.size * st.size;
    var count = Math.min(cells - 1, 2 + st.round);      // tiles to remember

    var idx = [];
    for (var i = 0; i < cells; i++) idx.push(i);
    shufflePlay(idx);
    st.shown = idx.slice(0, count);
    st.picked = [];
    st.phase = 'show';

    paint();
    setStatus('Watch carefully…');
    var el = document.getElementById('mg-round');
    if (el) el.textContent = 'Round ' + st.round;

    // Reveal, then hide.
    clearTimers();
    timers.push(setTimeout(function () {
      st.phase = 'recall';
      paint();
      setStatus('Now tap the ' + st.shown.length + ' squares you saw.');
    }, 900 + count * 320));
  }

  function paint() {
    var g = document.getElementById('mg-grid');
    if (!g || !st) return;
    g.style.gridTemplateColumns = 'repeat(' + st.size + ',1fr)';
    var html = '';
    for (var i = 0; i < st.size * st.size; i++) {
      var cls = 'mg-cell';
      if (st.phase === 'show' && st.shown.indexOf(i) !== -1) cls += ' lit';
      if (st.phase !== 'show' && st.picked.indexOf(i) !== -1) {
        cls += st.shown.indexOf(i) !== -1 ? ' hit' : ' miss';
      }
      if (st.phase === 'over' && st.shown.indexOf(i) !== -1 && st.picked.indexOf(i) === -1) cls += ' missed';
      html += '<div class="' + cls + '" data-i="' + i + '"></div>';
    }
    g.innerHTML = html;
    g.querySelectorAll('.mg-cell').forEach(function (el) {
      el.onclick = function () { tap(parseInt(el.dataset.i, 10)); };
    });
  }

  function setStatus(t) { var s = document.getElementById('mg-status'); if (s) s.textContent = t; }

  function tap(i) {
    if (!st || st.phase !== 'recall') return;
    if (st.picked.indexOf(i) !== -1) return;
    st.picked.push(i);

    var right = st.shown.indexOf(i) !== -1;
    if (typeof playSound === 'function') playSound(right ? 'correct' : 'wrong');
    paint();

    if (!right) { endGame(false); return; }

    if (st.picked.length === st.shown.length) {
      st.best = st.shown.length;
      st.round++;
      setStatus('Yes! Next round…');
      clearTimers();
      timers.push(setTimeout(startRound, 850));
    }
  }

  function endGame() {
    if (!st || st.done) return;
    st.done = true;
    st.phase = 'over';
    paint();
    clearTimers();
    var score = st.best;
    var res = playFinish('memgrid', score, { levelUp: score >= 5 });
    var c = document.getElementById('play-game-content');
    if (c) {
      c.innerHTML += playWinPanel('memgrid', 'You remembered ' + score + ' squares',
        score >= 5 ? 'That is a strong span for your age.' : 'The grey squares are the ones you missed.', res);
    }
  }

  function dispose() { clearTimers(); st = null; }

  return {
    id: 'memgrid', name: 'Memory Grid', emoji: '🧠', category: 'brain',
    blurb: 'Remember which squares lit up.',
    render: render, dispose: dispose
  };
})();

// ---------------------------------------------------------------
//  COLOUR MUDDLE  (Stroop)
// ---------------------------------------------------------------
var playStroop = (function () {
  var COLOURS = [
    { name: 'RED',    hex: '#ff6b6b' },
    { name: 'BLUE',   hex: '#5aa9ff' },
    { name: 'GREEN',  hex: '#5fd68a' },
    { name: 'YELLOW', hex: '#ffd35c' }
  ];
  var st = null, tick = null;

  function render(container) {
    st = { score: 0, wrong: 0, timeLeft: 45, q: null, done: false };
    var html = playHeader(playStroop, '<span class="play-pill" id="st-time">45s</span>');
    html += '<p class="play-instr">Tap the <b>colour of the ink</b>, not the word. Tricky!</p>';
    html += '<div class="stroop-word" id="stroop-word">·</div>';
    html += '<div class="stroop-btns" id="stroop-btns"></div>';
    html += '<div class="play-status" id="st-status">Score: 0</div>';
    container.innerHTML = html;

    var btns = document.getElementById('stroop-btns');
    if (btns) {
      btns.innerHTML = COLOURS.map(function (c) {
        return '<button class="stroop-btn" data-c="' + c.name + '" style="background:' + c.hex + '">' +
               c.name.charAt(0) + c.name.slice(1).toLowerCase() + '</button>';
      }).join('');
      btns.querySelectorAll('.stroop-btn').forEach(function (b) {
        b.onclick = function () { answer(b.dataset.c); };
      });
    }

    nextQ();
    clearInterval(tick);
    tick = setInterval(function () {
      if (!st || st.done) return;
      st.timeLeft--;
      var t = document.getElementById('st-time');
      if (t) t.textContent = st.timeLeft + 's';
      if (st.timeLeft <= 0) finish();
    }, 1000);
  }

  function nextQ() {
    if (!st) return;
    var word = COLOURS[Math.floor(Math.random() * COLOURS.length)];
    var ink = COLOURS[Math.floor(Math.random() * COLOURS.length)];
    // Two thirds of trials are incongruent - that is where the task bites.
    if (Math.random() < 0.66) {
      while (ink.name === word.name) ink = COLOURS[Math.floor(Math.random() * COLOURS.length)];
    } else { ink = word; }
    st.q = { word: word, ink: ink };
    var el = document.getElementById('stroop-word');
    if (el) { el.textContent = word.name; el.style.color = ink.hex; }
  }

  function answer(name) {
    if (!st || st.done || !st.q) return;
    var right = (name === st.q.ink.name);
    if (right) { st.score++; if (typeof playSound === 'function') playSound('correct'); }
    else { st.wrong++; if (typeof playSound === 'function') playSound('wrong'); }
    var s = document.getElementById('st-status');
    if (s) s.textContent = 'Score: ' + st.score + (st.wrong ? '  ·  ' + st.wrong + ' slips' : '');
    nextQ();
  }

  function finish() {
    if (!st || st.done) return;
    st.done = true;
    clearInterval(tick);
    var res = playFinish('stroop', st.score, { levelUp: st.score >= 20 });
    var c = document.getElementById('play-game-content');
    if (c) {
      c.innerHTML += playWinPanel('stroop', st.score + ' correct in 45 seconds',
        'Your brain wants to read the word. Beating that urge is the whole game.', res);
    }
  }

  function dispose() { clearInterval(tick); st = null; }

  return {
    id: 'stroop', name: 'Colour Muddle', emoji: '🎨', category: 'brain',
    blurb: 'Tap the ink colour, not the word.',
    render: render, dispose: dispose
  };
})();

// ---------------------------------------------------------------
//  DOT TRAIL  (Trail Making Test)
// ---------------------------------------------------------------
var playTrail = (function () {
  var st = null, tick = null;

  function render(container) {
    var ps = getPlayState('trail');
    // Part A = numbers only. Part B = alternate number/letter (harder).
    var partB = ps.level >= 4;
    var count = partB ? 10 : Math.min(15, 6 + ps.level * 2);

    var seq = [];
    for (var i = 1; i <= count; i++) {
      if (partB) seq.push(i % 2 === 1 ? String((i + 1) / 2) : 'ABCDE'[(i / 2) - 1]);
      else seq.push(String(i));
    }

    // Scatter without overlapping too much.
    var dots = [];
    seq.forEach(function (label) {
      var tries = 0, x, y, ok;
      do {
        ok = true;
        x = 8 + Math.random() * 84;
        y = 8 + Math.random() * 84;
        for (var k = 0; k < dots.length; k++) {
          if (Math.hypot(dots[k].x - x, dots[k].y - y) < 16) { ok = false; break; }
        }
      } while (!ok && tries++ < 80);
      dots.push({ label: label, x: x, y: y });
    });

    st = { seq: seq, dots: dots, next: 0, started: Date.now(), done: false, wrong: 0, partB: partB };

    var html = playHeader(playTrail, '<span class="play-pill">' + (partB ? '1-A-2-B' : '1-2-3') + '</span>');
    html += '<p class="play-instr">' + (partB
      ? 'Tap in order, swapping between numbers and letters: 1, A, 2, B, 3…'
      : 'Tap the numbers in order, as fast as you can: 1, 2, 3…') + '</p>';
    html += '<div class="trail-board" id="trail-board"></div>';
    html += '<div class="play-status" id="trail-status">Next: ' + seq[0] + '</div>';
    container.innerHTML = html;
    paint();

    clearInterval(tick);
    tick = setInterval(function () {
      if (!st || st.done) return;
      var el = document.getElementById('trail-status');
      if (el) {
        var secs = ((Date.now() - st.started) / 1000).toFixed(1);
        el.textContent = 'Next: ' + st.seq[st.next] + '   ·   ' + secs + 's';
      }
    }, 100);
  }

  function paint() {
    var b = document.getElementById('trail-board');
    if (!b || !st) return;
    var html = '';
    // Draw the line already travelled.
    if (st.next > 0) {
      html += '<svg class="trail-svg" viewBox="0 0 100 100" preserveAspectRatio="none">';
      for (var i = 1; i < st.next; i++) {
        var a = st.dots[i - 1], c = st.dots[i];
        html += '<line x1="' + a.x + '" y1="' + a.y + '" x2="' + c.x + '" y2="' + c.y + '" />';
      }
      html += '</svg>';
    }
    st.dots.forEach(function (d, i) {
      var cls = 'trail-dot' + (i < st.next ? ' done' : '') + (i === st.next ? ' next' : '');
      html += '<button class="' + cls + '" style="left:' + d.x + '%;top:' + d.y + '%" data-i="' + i + '">' +
              d.label + '</button>';
    });
    b.innerHTML = html;
    b.querySelectorAll('.trail-dot').forEach(function (el) {
      el.onclick = function () { tap(parseInt(el.dataset.i, 10)); };
    });
  }

  function tap(i) {
    if (!st || st.done) return;
    if (i !== st.next) {
      st.wrong++;
      if (typeof playSound === 'function') playSound('wrong');
      var el = document.querySelector('.trail-dot[data-i="' + i + '"]');
      if (el) { el.classList.add('shake'); setTimeout(function () { el.classList.remove('shake'); }, 350); }
      return;
    }
    st.next++;
    if (typeof playSound === 'function') playSound('click');
    paint();
    if (st.next >= st.dots.length) finish();
  }

  function finish() {
    st.done = true;
    clearInterval(tick);
    var secs = Math.round((Date.now() - st.started) / 10) / 100;
    var res = playFinish('trail', secs, { lowerIsBetter: true, levelUp: st.wrong === 0 });
    var c = document.getElementById('play-game-content');
    if (c) {
      c.innerHTML += playWinPanel('trail', 'Done in ' + secs + ' seconds',
        st.wrong === 0 ? 'Not a single wrong tap.' : st.wrong + ' wrong taps along the way.', res);
    }
  }

  function dispose() { clearInterval(tick); st = null; }

  return {
    id: 'trail', name: 'Dot Trail', emoji: '🔗', category: 'brain',
    blurb: 'Join the dots in order, against the clock.',
    lowerIsBetter: true, render: render, dispose: dispose
  };
})();

if (typeof window !== 'undefined') {
  window.playMemoryGrid = playMemoryGrid;
  window.playStroop = playStroop;
  window.playTrail = playTrail;
}
