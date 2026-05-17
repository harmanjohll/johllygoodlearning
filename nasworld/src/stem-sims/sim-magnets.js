// ============================================================
//  STEM SIM 7 — MAGNETS
//  Drag a magnet over items. Magnetic ones stick. Others don't.
//  Skill: forces
// ============================================================

var simMagnets = (function() {
  var ITEMS = [
    { id: 'paperclip', emoji: '📎', name: 'Paperclip', magnetic: true },
    { id: 'nail',      emoji: '🔩', name: 'Iron Nail', magnetic: true },
    { id: 'key',       emoji: '🔑', name: 'Steel Key', magnetic: true },
    { id: 'pin',       emoji: '📌', name: 'Pin',       magnetic: true },
    { id: 'pencil',    emoji: '✏️', name: 'Pencil',    magnetic: false },
    { id: 'eraser',    emoji: '🧽', name: 'Eraser',    magnetic: false },
    { id: 'coin',      emoji: '🪙', name: 'Coin (brass)', magnetic: false },
    { id: 'leaf',      emoji: '🍃', name: 'Leaf',      magnetic: false }
  ];
  var state = null;

  function render(container) {
    state = { stuck: [], tested: 0, target: 6, completed: false };
    container.innerHTML =
      '<button class="back-btn" onclick="openSimHub()">← Back to STEM Lab</button>' +
      '<h2 class="sim-title">🧲 Magnets</h2>' +
      '<p class="sim-blurb">Drag the magnet over each item. Which ones stick?</p>' +
      '<div class="sim-stage">' +
        '<div class="magnet-field" id="magnet-field">' +
          ITEMS.map(function(it){
            return '<div class="magnet-item" data-id="' + it.id + '" data-mag="' + it.magnetic + '">' +
              '<div class="magnet-emoji">' + it.emoji + '</div>' +
              '<div class="magnet-name">' + it.name + '</div></div>';
          }).join('') +
          '<div id="magnet-tool" class="magnet-tool">🧲</div>' +
        '</div>' +
        '<div class="sim-meter" id="magnet-meter">Items tested: <strong>0 / 6</strong></div>' +
        '<p class="sim-blurb-sm">💡 Magnets pull on iron and steel. Other metals (like brass coins) and most non-metals don\'t feel it.</p>' +
      '</div>';
    wireDrag();
  }

  function wireDrag() {
    var tool = document.getElementById('magnet-tool');
    var field = document.getElementById('magnet-field');
    if (!tool || !field) return;
    var dragging = false;
    tool.addEventListener('pointerdown', function(e) {
      dragging = true;
      tool.setPointerCapture(e.pointerId);
    });
    tool.addEventListener('pointermove', function(e) {
      if (!dragging) return;
      var rect = field.getBoundingClientRect();
      var x = e.clientX - rect.left;
      var y = e.clientY - rect.top;
      tool.style.left = (x - 30) + 'px';
      tool.style.top  = (y - 30) + 'px';
      checkProximity(x, y);
    });
    tool.addEventListener('pointerup', function() { dragging = false; });
  }

  function checkProximity(x, y) {
    var field = document.getElementById('magnet-field');
    if (!field) return;
    var fieldRect = field.getBoundingClientRect();
    field.querySelectorAll('.magnet-item').forEach(function(el) {
      var rect = el.getBoundingClientRect();
      var cx = rect.left - fieldRect.left + rect.width / 2;
      var cy = rect.top  - fieldRect.top  + rect.height / 2;
      var d = Math.hypot(cx - x, cy - y);
      if (d < 70) {
        var id = el.dataset.id;
        var isMag = el.dataset.mag === 'true';
        if (state.stuck.indexOf(id) !== -1) return;
        if (isMag) {
          state.stuck.push(id);
          el.classList.add('stuck');
          if (typeof spawnParticles === 'function') {
            spawnParticles(rect.left + rect.width/2, rect.top, 4, '⚡');
          }
          if (typeof lumiSay === 'function') lumiSay(ITEMS.find(function(i){return i.id===id;}).name + ' STUCK to the magnet!');
        } else {
          el.classList.add('tested');
          if (typeof lumiSay === 'function') lumiSay(ITEMS.find(function(i){return i.id===id;}).name + ' — no pull. Not magnetic!');
        }
        state.tested++;
        var meter = document.getElementById('magnet-meter');
        if (meter) meter.innerHTML = 'Items tested: <strong>' + Math.min(state.tested, state.target) + ' / ' + state.target + '</strong>';
        if (state.tested >= state.target && !state.completed) finishSim();
      }
    });
  }

  function finishSim() {
    state.completed = true;
    if (typeof grantSimReward === 'function') grantSimReward('forces', 'Magnet detective!');
    var stage = document.querySelector('.sim-stage');
    if (stage) stage.innerHTML += '<div class="sim-win">🧲 Magnets pull on iron and steel — that\'s why paperclips, nails, and keys stick. Wood, plastic, brass and rubber don\'t feel the pull. <button class="lesson-btn" onclick="openSimHub()">More Lab →</button></div>';
  }

  function dispose() { state = null; }

  return { id: 'magnets', name: 'Magnets', emoji: '🧲', skill: 'forces', render: render, dispose: dispose };
})();
