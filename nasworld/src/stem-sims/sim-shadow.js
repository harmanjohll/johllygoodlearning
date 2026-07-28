// ============================================================
//  STEM SIM 3 — LIGHT & SHADOW
//  Move the torch around the tree. Shadow lands on the opposite side.
//  Hit the 3 target spots.
//  Skill: light
// ============================================================

var simShadow = (function() {
  // The tree sits at center. Torch can be placed anywhere around it.
  // Target zones: north, southeast, west.
  var TARGETS = [
    { angle: 90,  label: 'point UP',    name: 'north' },
    { angle: 315, label: 'point DOWN-LEFT', name: 'southwest' },
    { angle: 180, label: 'point RIGHT',  name: 'east' }
  ];
  var state = null;

  function render(container) {
    state = { torchAngle: 270, torchR: 110, completed: false, hits: [] };
    container.innerHTML =
      '<button class="back-btn" onclick="openSimHub()">← Back to STEM Lab</button>' +
      '<h2 class="sim-title">🔦 Light & Shadow</h2>' +
      '<p class="sim-blurb">Drag the torch around the tree. Watch the shadow move! Get the shadow to ' + TARGETS.length + ' target spots.</p>' +
      '<div class="sim-stage">' +
        '<svg id="shadow-svg" viewBox="-160 -160 320 320" class="shadow-svg">' +
          // Targets (grey circles)
          TARGETS.map(function(t, i) {
            var rad = t.angle * Math.PI / 180;
            var tx = Math.cos(rad) * 100;
            var ty = -Math.sin(rad) * 100;
            return '<circle cx="' + tx + '" cy="' + ty + '" r="22" class="shadow-target" data-i="' + i + '"></circle>' +
                   '<text x="' + tx + '" y="' + (ty + 5) + '" class="shadow-target-label" data-i="' + i + '">' + (i+1) + '</text>';
          }).join('') +
          '<line id="shadow-line" x1="0" y1="0" x2="0" y2="0" class="shadow-line"></line>' +
          '<ellipse id="shadow-blob" cx="0" cy="0" rx="32" ry="14" class="shadow-blob"></ellipse>' +
          '<text id="tree" x="0" y="8" class="shadow-tree">🌳</text>' +
          '<text id="torch" x="0" y="0" class="shadow-torch">🔦</text>' +
        '</svg>' +
        '<div class="sim-meter" id="shadow-meter">Targets hit: <strong>0 / 3</strong></div>' +
        '<p class="sim-blurb-sm">💡 Light travels in straight lines. The shadow always lands opposite the light.</p>' +
      '</div>';

    var svg = document.getElementById('shadow-svg');
    svg.addEventListener('pointerdown', onPointer);
    svg.addEventListener('pointermove', onPointer);
    redraw();
  }

  function onPointer(e) {
    if (!state || state.completed) return;
    if (e.buttons === 0 && e.type !== 'pointerdown') return;
    var svg = document.getElementById('shadow-svg');
    var pt = svg.createSVGPoint();
    pt.x = e.clientX; pt.y = e.clientY;
    var loc = pt.matrixTransform(svg.getScreenCTM().inverse());
    var angle = Math.atan2(-loc.y, loc.x) * 180 / Math.PI;
    if (angle < 0) angle += 360;
    state.torchAngle = angle;
    redraw();
    checkHit();
  }

  function redraw() {
    if (!state) return;
    var rad = state.torchAngle * Math.PI / 180;
    var tx = Math.cos(rad) * state.torchR;
    var ty = -Math.sin(rad) * state.torchR;
    var torch = document.getElementById('torch');
    var line = document.getElementById('shadow-line');
    var blob = document.getElementById('shadow-blob');
    if (torch) { torch.setAttribute('x', tx); torch.setAttribute('y', ty + 6); }
    if (line) { line.setAttribute('x1', tx); line.setAttribute('y1', ty); line.setAttribute('x2', 0); line.setAttribute('y2', 0); }
    // Shadow: opposite direction at same radius
    var sx = -Math.cos(rad) * 80;
    var sy = Math.sin(rad) * 80;
    if (blob) {
      blob.setAttribute('cx', sx);
      blob.setAttribute('cy', sy);
      // Orient shadow along the light-to-tree axis
      var shadowAngle = Math.atan2(sy, sx) * 180 / Math.PI;
      blob.setAttribute('transform', 'rotate(' + shadowAngle + ' ' + sx + ' ' + sy + ')');
    }
    // Mark hit targets visually
    TARGETS.forEach(function(t, i) {
      var el = document.querySelector('.shadow-target[data-i="' + i + '"]');
      if (el) el.classList.toggle('hit', state.hits.indexOf(i) !== -1);
    });
    var meter = document.getElementById('shadow-meter');
    if (meter) meter.innerHTML = 'Targets hit: <strong>' + state.hits.length + ' / ' + TARGETS.length + '</strong>';
  }

  function checkHit() {
    var rad = state.torchAngle * Math.PI / 180;
    var sx = -Math.cos(rad) * 80;
    var sy = Math.sin(rad) * 80;
    TARGETS.forEach(function(t, i) {
      if (state.hits.indexOf(i) !== -1) return;
      var trad = t.angle * Math.PI / 180;
      var tx = Math.cos(trad) * 100;
      var ty = -Math.sin(trad) * 100;
      var dist = Math.hypot(sx - tx, sy - ty);
      if (dist < 30) {
        state.hits.push(i);
        if (typeof lumiReactTo === 'function') lumiReactTo('correct');
        if (typeof lumiSay === 'function') lumiSay('Yes! Shadow at target ' + (i+1) + '. ' + (state.hits.length === TARGETS.length ? 'Last one!' : 'Two more to go!'));
        if (state.hits.length === TARGETS.length) finishSim();
      }
    });
    redraw();
  }

  function finishSim() {
    if (!state || state.completed) return;
    state.completed = true;
    if (typeof grantSimReward === 'function') grantSimReward('light', 'Shadow detective!');
    var stage = document.querySelector('#screen-sim .sim-stage');
    if (stage) stage.innerHTML += '<div class="sim-win">🔦 Light goes in a straight line. When the tree blocks it, you get a shadow on the other side! <button class="lesson-btn" onclick="openSimHub()">More Lab →</button></div>';
  }

  function dispose() {
    var svg = document.getElementById('shadow-svg');
    if (svg) {
      svg.removeEventListener('pointerdown', onPointer);
      svg.removeEventListener('pointermove', onPointer);
    }
    state = null;
  }

  return { id: 'shadow', name: 'Light & Shadow', emoji: '🔦', skill: 'light', render: render, dispose: dispose };
})();
