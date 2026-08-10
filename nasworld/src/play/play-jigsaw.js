// ============================================================
//  JIGSAW — a picture cut into tiles, shuffled, dragged back.
//
//  The "picture" is drawn in CSS from a palette rather than loaded
//  as an image file, so it works offline and never 404s. Each puzzle
//  is a grid of coloured cells forming a simple scene, plus a big
//  emoji subject on top.
// ============================================================

var playJigsaw = (function () {

  // Each scene: a background gradient, and a subject emoji laid over it.
  var SCENES = [
    { name: 'Sunflower',  emoji: '🌻', from: '#87ceeb', to: '#f5e6a3' },
    { name: 'Rocket',     emoji: '🚀', from: '#0b1a4a', to: '#4a2a6a' },
    { name: 'Butterfly',  emoji: '🦋', from: '#c8f5d0', to: '#7fd4a0' },
    { name: 'Cat',        emoji: '🐱', from: '#ffe4c4', to: '#ffb877' },
    { name: 'Rainbow',    emoji: '🌈', from: '#b8e6ff', to: '#ffd9ec' },
    { name: 'Hawker Bowl',emoji: '🍜', from: '#ffe8b0', to: '#ff9d5c' },
    { name: 'Unicorn',    emoji: '🦄', from: '#f3d9ff', to: '#c9a0ff' },
    { name: 'Football',   emoji: '⚽', from: '#a8e88a', to: '#5fae44' }
  ];

  var st = null;

  function sizeForLevel(level) {
    if (level <= 2) return 3;          // 3x3 = 9 pieces
    if (level <= 5) return 4;          // 4x4 = 16
    return 5;                          // 5x5 = 25
  }

  function render(container) {
    var ps = getPlayState('jigsaw');
    var n = sizeForLevel(ps.level);
    var scene = SCENES[Math.floor(Math.random() * SCENES.length)];

    // order[i] = which piece index currently sits in slot i
    var order = [];
    for (var i = 0; i < n * n; i++) order.push(i);
    // Shuffle, but never hand back an already-solved board.
    do { shufflePlay(order); } while (isSolved(order));

    st = { n: n, scene: scene, order: order, selected: null, moves: 0, started: Date.now(), done: false };

    var html = playHeader(playJigsaw, '<span class="play-pill">' + n + '×' + n + '</span>');
    html += '<p class="play-instr">Tap two pieces to swap them. Build the picture!</p>';
    html += '<div class="jig-wrap">';
    html += '<div class="jig-board" id="jig-board" style="grid-template-columns:repeat(' + n + ',1fr)"></div>';
    html += '<div class="jig-target">';
    html += '<div class="jig-target-label">Make this</div>';
    html += '<div class="jig-thumb" style="background:linear-gradient(160deg,' + scene.from + ',' + scene.to + ')">' +
            '<span>' + scene.emoji + '</span></div>';
    html += '<div class="jig-scene-name">' + scene.name + '</div>';
    html += '</div>';
    html += '</div>';
    html += '<div class="play-status" id="jig-status">0 moves</div>';
    html += '<button class="lesson-btn" onclick="openPlayGame(\'jigsaw\')">↻ New picture</button>';
    container.innerHTML = html;
    paint();
  }

  function isSolved(order) {
    for (var i = 0; i < order.length; i++) if (order[i] !== i) return false;
    return true;
  }

  function paint() {
    var board = document.getElementById('jig-board');
    if (!board || !st) return;
    var n = st.n, sc = st.scene;
    var html = '';
    for (var slot = 0; slot < n * n; slot++) {
      var piece = st.order[slot];
      var row = Math.floor(piece / n), col = piece % n;
      // Show the correct slice of the gradient + emoji by shifting a
      // background that is n times the tile size.
      var pos = (n === 1) ? '0 0' : ((col / (n - 1)) * 100) + '% ' + ((row / (n - 1)) * 100) + '%';
      var correct = (piece === slot);
      html += '<div class="jig-piece' + (correct ? ' right' : '') +
              (st.selected === slot ? ' sel' : '') + '" data-slot="' + slot + '" ' +
              'style="background:linear-gradient(160deg,' + sc.from + ',' + sc.to + ');' +
              'background-size:' + (n * 100) + '% ' + (n * 100) + '%;background-position:' + pos + '">';
      html += '<span class="jig-emoji" style="background-position:' + pos + '">' + sc.emoji + '</span>';
      html += '</div>';
    }
    board.innerHTML = html;
    board.querySelectorAll('.jig-piece').forEach(function (el) {
      el.onclick = function () { tap(parseInt(el.dataset.slot, 10)); };
    });
    var s = document.getElementById('jig-status');
    if (s) s.textContent = st.moves + (st.moves === 1 ? ' move' : ' moves');
  }

  function tap(slot) {
    if (!st || st.done) return;
    if (st.selected === null) { st.selected = slot; paint(); return; }
    if (st.selected === slot) { st.selected = null; paint(); return; }

    var a = st.selected, b = slot;
    var tmp = st.order[a]; st.order[a] = st.order[b]; st.order[b] = tmp;
    st.selected = null;
    st.moves++;
    if (typeof playSound === 'function') playSound('click');
    paint();

    if (isSolved(st.order)) finish();
  }

  function finish() {
    st.done = true;
    var secs = Math.round((Date.now() - st.started) / 1000);
    // Perfect play is (n*n - 1) swaps at best; reward finishing, not speed.
    var res = playFinish('jigsaw', st.moves, {
      lowerIsBetter: true,
      levelUp: st.moves <= st.n * st.n * 1.5
    });
    var c = document.getElementById('play-game-content');
    if (c) {
      c.innerHTML += playWinPanel('jigsaw', st.scene.name + ' complete!',
        st.moves + ' moves in ' + secs + ' seconds.', res);
    }
  }

  function dispose() { st = null; }

  return {
    id: 'jigsaw', name: 'Jigsaw', emoji: '🧩', category: 'puzzle',
    blurb: 'Swap the pieces to rebuild the picture.',
    lowerIsBetter: true, render: render, dispose: dispose
  };
})();

/** Fisher-Yates. Local to the play module so it cannot clash. */
function shufflePlay(a) {
  for (var i = a.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var t = a[i]; a[i] = a[j]; a[j] = t;
  }
  return a;
}

if (typeof window !== 'undefined') {
  window.playJigsaw = playJigsaw;
  window.shufflePlay = shufflePlay;
}
