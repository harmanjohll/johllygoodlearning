// ============================================================
//  STEM SIM 6 — BALANCE / SEESAW
//  Drag items onto the pans. Heavier side tips down.
//  Skill: lenmass (Length & Mass — comparison)
// ============================================================

var simBalance = (function() {
  var ITEMS = [
    { id: 'feather',  emoji: '🪶', name: 'Feather',   mass: 1 },
    { id: 'apple',    emoji: '🍎', name: 'Apple',     mass: 4 },
    { id: 'book',     emoji: '📚', name: 'Big Book',  mass: 8 },
    { id: 'orange',   emoji: '🍊', name: 'Orange',    mass: 3 },
    { id: 'rock',     emoji: '🪨', name: 'Rock',      mass: 10 },
    { id: 'banana',   emoji: '🍌', name: 'Banana',    mass: 2 },
    { id: 'pumpkin',  emoji: '🎃', name: 'Pumpkin',   mass: 12 },
    { id: 'pencil',   emoji: '✏️', name: 'Pencil',    mass: 1 }
  ];
  var state = null;

  function render(container) {
    var pool = ITEMS.slice().sort(function(){return Math.random()-0.5;}).slice(0,6);
    state = { left: [], right: [], pool: pool, rounds: 0, target: 4, completed: false };
    container.innerHTML =
      '<button class="back-btn" onclick="openSimHub()">← Back to STEM Lab</button>' +
      '<h2 class="sim-title">⚖️ Balance Beam</h2>' +
      '<p class="sim-blurb">Drag items onto the pans. Which side is heavier? The heavier side tips down!</p>' +
      '<div class="sim-stage">' +
        '<div class="balance-beam">' +
          '<svg viewBox="-180 -80 360 220" class="balance-svg">' +
            '<line x1="0" y1="0" x2="0" y2="100" stroke="#bb9bff" stroke-width="6" />' +
            '<polygon points="-20,100 20,100 0,140" fill="#7b3aff" />' +
            '<g id="balance-bar"><line x1="-140" y1="0" x2="140" y2="0" stroke="#ffd166" stroke-width="6" stroke-linecap="round" />' +
              '<line x1="-140" y1="0" x2="-140" y2="40" stroke="#ffd166" stroke-width="3" />' +
              '<line x1="140" y1="0" x2="140" y2="40" stroke="#ffd166" stroke-width="3" />' +
              '<ellipse cx="-140" cy="50" rx="50" ry="10" fill="rgba(255,255,255,0.18)" stroke="#ffd166" stroke-width="2" />' +
              '<ellipse cx="140"  cy="50" rx="50" ry="10" fill="rgba(255,255,255,0.18)" stroke="#ffd166" stroke-width="2" />' +
              '<text id="balance-left-emoji"  x="-140" y="35" text-anchor="middle" font-size="32"></text>' +
              '<text id="balance-right-emoji" x="140"  y="35" text-anchor="middle" font-size="32"></text>' +
            '</g>' +
          '</svg>' +
          '<div class="balance-result" id="balance-result">Empty — drop something on a pan!</div>' +
        '</div>' +
        '<div class="balance-tray" id="balance-tray"></div>' +
        '<div class="balance-controls">' +
          '<button class="lesson-btn" onclick="simBalanceReset()">↻ Reset pans</button>' +
        '</div>' +
        '<div class="sim-meter" id="balance-meter">Comparisons: <strong>0 / 4</strong></div>' +
      '</div>';
    renderTray();
    renderBeam();
    wireDrop();
  }

  function renderTray() {
    var tray = document.getElementById('balance-tray');
    if (!tray) return;
    tray.innerHTML = state.pool.map(function(it) {
      return '<div class="balance-item" draggable="true" data-id="' + it.id + '">' +
        '<div class="balance-item-emoji">' + it.emoji + '</div>' +
        '<div class="balance-item-name">' + it.name + '</div></div>';
    }).join('');
    tray.querySelectorAll('.balance-item').forEach(function(el) {
      el.addEventListener('dragstart', function(e) { e.dataTransfer.setData('text/plain', el.dataset.id); });
      el.addEventListener('click', function() { addToLighterPan(el.dataset.id); });
    });
  }

  function wireDrop() {
    var bar = document.querySelector('.balance-svg');
    if (!bar) return;
    bar.addEventListener('dragover', function(e) { e.preventDefault(); });
    bar.addEventListener('drop', function(e) {
      e.preventDefault();
      var id = e.dataTransfer.getData('text/plain');
      var rect = bar.getBoundingClientRect();
      var midX = rect.left + rect.width / 2;
      addToPan(id, e.clientX < midX ? 'left' : 'right');
    });
  }
  function addToLighterPan(id) {
    var L = totalMass(state.left), R = totalMass(state.right);
    addToPan(id, L <= R ? 'left' : 'right');
  }
  function addToPan(id, side) {
    var it = ITEMS.find(function(x){return x.id === id;});
    if (!it) return;
    state[side].push(it);
    renderBeam();
  }
  function totalMass(arr) { return arr.reduce(function(s,it){return s + it.mass;}, 0); }

  function renderBeam() {
    var L = totalMass(state.left), R = totalMass(state.right);
    var bar = document.getElementById('balance-bar');
    if (bar) {
      var diff = L - R;
      // Cap tilt at ±12 degrees
      var angle = Math.max(-12, Math.min(12, diff * 1.5));
      bar.setAttribute('transform', 'rotate(' + angle + ' 0 0)');
    }
    var leftEmoji = document.getElementById('balance-left-emoji');
    var rightEmoji = document.getElementById('balance-right-emoji');
    if (leftEmoji)  leftEmoji.textContent  = state.left.map(function(i){return i.emoji;}).join('');
    if (rightEmoji) rightEmoji.textContent = state.right.map(function(i){return i.emoji;}).join('');

    var result = document.getElementById('balance-result');
    if (result) {
      if (L === 0 && R === 0) result.textContent = 'Empty — drop something on a pan!';
      else if (L === R) result.innerHTML = '⚖️ <strong>Balanced!</strong> Same mass on both sides.';
      else if (L > R) result.innerHTML = '⬅️ Left is heavier (' + L + ' vs ' + R + ').';
      else result.innerHTML = '➡️ Right is heavier (' + R + ' vs ' + L + ').';
      // Each unique non-empty state counts as a comparison.
      if (L > 0 || R > 0) {
        var sig = L + '|' + R;
        if (state._lastSig !== sig) {
          state._lastSig = sig;
          state.rounds++;
          var meter = document.getElementById('balance-meter');
          if (meter) meter.innerHTML = 'Comparisons: <strong>' + Math.min(state.rounds, state.target) + ' / ' + state.target + '</strong>';
          if (state.rounds >= state.target && !state.completed) finishSim();
        }
      }
    }
  }

  function reset() { state.left = []; state.right = []; renderBeam(); }

  function finishSim() {
    if (state.completed) return;
    state.completed = true;
    if (typeof grantSimReward === 'function') grantSimReward('lenmass', 'Balance beam mastered!');
    var stage = document.querySelector('.sim-stage');
    if (stage) stage.innerHTML += '<div class="sim-win">⚖️ Mass is how much "stuff" something has. Heavier mass = pan tips down. Try equal masses to balance! <button class="lesson-btn" onclick="openSimHub()">More Lab →</button></div>';
  }

  function dispose() { state = null; }

  window.simBalanceReset = reset;
  return { id: 'balance', name: 'Balance Beam', emoji: '⚖️', skill: 'lenmass', render: render, dispose: dispose };
})();
