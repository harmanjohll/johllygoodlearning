// ============================================================
//  STEM SIM 1 — PUSH & PULL PLAYGROUND
//  Drag the box across three surfaces (grass, ice, sand).
//  Friction differs; same push goes different distances.
//  Skill: forces
// ============================================================

var simPushPull = (function() {
  var SURFACES = [
    { id: 'grass', name: 'Grass', emoji: '🌿', friction: 0.85, colour: '#7bc96f', text: 'A bit grippy.' },
    { id: 'ice',   name: 'Ice',   emoji: '🧊', friction: 0.97, colour: '#bfe8ff', text: 'Slippery!' },
    { id: 'sand',  name: 'Sand',  emoji: '🏜️', friction: 0.70, colour: '#ecd197', text: 'Sticky.' }
  ];

  var state = null;

  function render(container) {
    state = { surfaceIdx: 0, boxX: 80, vel: 0, dragging: false, dragStart: 0, dragX: 0, attempts: 0, wins: 0, target: 320, completed: false };
    container.innerHTML =
      '<button class="back-btn" onclick="openSimHub()">← Back to STEM Lab</button>' +
      '<h2 class="sim-title">⚡ Push & Pull Playground</h2>' +
      '<p class="sim-blurb">Pull the box back, then let go to launch it. Get it to the gold star ⭐ on each surface!</p>' +
      '<div class="sim-stage" id="pp-stage">' +
        '<div class="sim-surface-label" id="pp-label"></div>' +
        '<div class="sim-track" id="pp-track">' +
          '<div class="sim-target" id="pp-target">⭐</div>' +
          '<div class="sim-box" id="pp-box">📦</div>' +
        '</div>' +
        '<div class="sim-surface-buttons">' +
          SURFACES.map(function(s, i) {
            return '<button class="sim-surf-btn" data-i="' + i + '">' + s.emoji + ' ' + s.name + '</button>';
          }).join('') +
        '</div>' +
        '<div class="sim-meter" id="pp-meter">Surfaces conquered: <strong>0 / 3</strong></div>' +
      '</div>';

    redraw();
    container.querySelectorAll('.sim-surf-btn').forEach(function(b) {
      b.onclick = function() {
        state.surfaceIdx = parseInt(b.dataset.i, 10);
        state.boxX = 80; state.vel = 0;
        redraw();
      };
    });

    var box = document.getElementById('pp-box');
    var track = document.getElementById('pp-track');
    box.addEventListener('pointerdown', startDrag);
    document.addEventListener('pointermove', onMove);
    document.addEventListener('pointerup', endDrag);
  }

  function startDrag(e) {
    if (!state || state.completed) return;
    state.dragging = true;
    state.dragStart = e.clientX;
    state.dragX = e.clientX;
  }
  function onMove(e) {
    if (!state || !state.dragging) return;
    state.dragX = e.clientX;
    var pull = Math.max(0, state.dragStart - state.dragX);
    var box = document.getElementById('pp-box');
    if (box) box.style.transform = 'translateX(' + (state.boxX - pull) + 'px)';
  }
  function endDrag(e) {
    if (!state || !state.dragging) return;
    state.dragging = false;
    var pull = Math.max(0, state.dragStart - state.dragX);
    state.vel = pull * 0.35;
    animate();
  }
  function animate() {
    if (!state) return;
    var surf = SURFACES[state.surfaceIdx];
    var step = function() {
      state.boxX += state.vel;
      state.vel *= surf.friction;
      var box = document.getElementById('pp-box');
      if (!box) return;
      box.style.transform = 'translateX(' + state.boxX + 'px)';
      if (Math.abs(state.vel) > 0.1) {
        requestAnimationFrame(step);
      } else {
        checkWin();
      }
    };
    step();
  }
  function checkWin() {
    if (!state) return;
    state.attempts++;
    var hit = Math.abs(state.boxX - state.target) < 40;
    if (hit) {
      state.wins++;
      if (typeof lumiReactTo === 'function') lumiReactTo('correct');
      if (typeof spawnParticles === 'function') {
        var rect = document.getElementById('pp-target').getBoundingClientRect();
        spawnParticles(rect.left + rect.width/2, rect.top + rect.height/2, 8, '⭐');
      }
      if (typeof lumiSay === 'function') lumiSay('Nice! ' + SURFACES[state.surfaceIdx].name + ' done. Try the next surface.');
      // Mark surface as won
      SURFACES[state.surfaceIdx]._won = true;
      // Advance
      var nextIdx = SURFACES.findIndex(function(s) { return !s._won; });
      if (nextIdx === -1) finishSim();
      else { state.surfaceIdx = nextIdx; state.boxX = 80; redraw(); }
    } else {
      var diff = state.boxX < state.target ? 'a bit further' : 'a bit gentler';
      if (typeof lumiSay === 'function') lumiSay('Pull ' + diff + '. ' + SURFACES[state.surfaceIdx].text);
      state.boxX = 80;
      redraw();
    }
  }
  function redraw() {
    var stage = document.getElementById('pp-stage');
    var label = document.getElementById('pp-label');
    var track = document.getElementById('pp-track');
    var box = document.getElementById('pp-box');
    if (!stage || !label || !track) return;
    var surf = SURFACES[state.surfaceIdx];
    track.style.background = 'linear-gradient(180deg, transparent 0%, transparent 50%, ' + surf.colour + ' 50%, ' + surf.colour + ' 100%)';
    label.innerHTML = '<span class="sim-surf-pill">' + surf.emoji + ' ' + surf.name + '</span> <span class="sim-surf-note">' + surf.text + '</span>';
    if (box) box.style.transform = 'translateX(' + state.boxX + 'px)';
    var won = SURFACES.filter(function(s){return s._won;}).length;
    var meter = document.getElementById('pp-meter');
    if (meter) meter.innerHTML = 'Surfaces conquered: <strong>' + won + ' / 3</strong>';
  }
  function finishSim() {
    if (!state || state.completed) return;
    state.completed = true;
    if (typeof grantSimReward === 'function') grantSimReward('forces', 'Push & Pull mastered!');
    var stage = document.getElementById('pp-stage');
    if (stage) {
      stage.innerHTML += '<div class="sim-win">🎉 You felt friction! Ice is slippery (low friction). Sand is sticky (high friction). <button class="lesson-btn" onclick="openSimHub()">More Lab →</button></div>';
    }
    // Reset won flags for next play
    SURFACES.forEach(function(s){ delete s._won; });
  }

  function dispose() {
    document.removeEventListener('pointermove', onMove);
    document.removeEventListener('pointerup', endDrag);
    state = null;
  }

  return { id: 'pushpull', name: 'Push & Pull Playground', emoji: '⚡', skill: 'forces', render: render, dispose: dispose };
})();
