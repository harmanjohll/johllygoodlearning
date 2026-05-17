// ============================================================
//  STEM SIM 8 — LIVING vs NON-LIVING
//  Sort items into two columns.
//  Skill: living
// ============================================================

var simLiving = (function() {
  var ALL = [
    { id: 'cat',     emoji: '🐱', name: 'Cat',     living: true,  hint: 'Eats, grows, breathes.' },
    { id: 'tree',    emoji: '🌳', name: 'Tree',    living: true,  hint: 'Grows, needs water and sun.' },
    { id: 'flower',  emoji: '🌻', name: 'Flower',  living: true,  hint: 'Grows from a seed.' },
    { id: 'butterfly', emoji: '🦋', name: 'Butterfly', living: true, hint: 'Eats nectar, lays eggs.' },
    { id: 'fish',    emoji: '🐟', name: 'Fish',    living: true,  hint: 'Breathes through gills.' },
    { id: 'frog',    emoji: '🐸', name: 'Frog',    living: true,  hint: 'Tadpole → frog. Definitely alive!' },
    { id: 'rock',    emoji: '🪨', name: 'Rock',    living: false, hint: 'Does not grow or eat.' },
    { id: 'chair',   emoji: '🪑', name: 'Chair',   living: false, hint: 'Made from wood, but no longer alive.' },
    { id: 'phone',   emoji: '📱', name: 'Phone',   living: false, hint: 'Needs a battery, not food!' },
    { id: 'cloud',   emoji: '☁️', name: 'Cloud',   living: false, hint: 'Water vapour. Moves, but not alive.' },
    { id: 'spoon',   emoji: '🥄', name: 'Spoon',   living: false, hint: 'A tool. Doesn\'t grow.' },
    { id: 'ball',    emoji: '⚽', name: 'Ball',    living: false, hint: 'A toy. No heartbeat!' }
  ];
  var state = null;

  function render(container) {
    var items = ALL.slice().sort(function(){return Math.random()-0.5;}).slice(0,8);
    state = { items: items, sorted: 0, target: items.length, completed: false };
    container.innerHTML =
      '<button class="back-btn" onclick="openSimHub()">← Back to STEM Lab</button>' +
      '<h2 class="sim-title">🌱 Living or Non-Living?</h2>' +
      '<p class="sim-blurb">Drag each item to the right column. Living things grow, eat, and breathe!</p>' +
      '<div class="sim-stage">' +
        '<div class="living-tray" id="living-tray">' +
          items.map(function(it){
            return '<div class="living-item" draggable="true" data-id="' + it.id + '" data-living="' + it.living + '">' +
              '<div class="living-emoji">' + it.emoji + '</div>' +
              '<div class="living-name">' + it.name + '</div></div>';
          }).join('') +
        '</div>' +
        '<div class="living-cols">' +
          '<div class="living-col living-yes" data-living="true"><div class="living-col-title">🌱 Living</div><div class="living-col-body" data-living="true"></div></div>' +
          '<div class="living-col living-no" data-living="false"><div class="living-col-title">🪨 Non-Living</div><div class="living-col-body" data-living="false"></div></div>' +
        '</div>' +
        '<div class="sim-meter" id="living-meter">Sorted: <strong>0 / ' + state.target + '</strong></div>' +
      '</div>';

    var draggables = container.querySelectorAll('.living-item');
    draggables.forEach(function(el) {
      el.addEventListener('dragstart', function(e) {
        e.dataTransfer.setData('text/plain', el.dataset.id);
      });
      el.addEventListener('click', function() {
        // Mobile tap: cycle through (move to first empty)
        var living = el.dataset.living === 'true';
        dropItem(el.dataset.id, living);
      });
    });
    container.querySelectorAll('.living-col-body').forEach(function(col) {
      col.addEventListener('dragover', function(e) { e.preventDefault(); col.classList.add('hover'); });
      col.addEventListener('dragleave', function() { col.classList.remove('hover'); });
      col.addEventListener('drop', function(e) {
        e.preventDefault(); col.classList.remove('hover');
        var id = e.dataTransfer.getData('text/plain');
        var living = col.dataset.living === 'true';
        dropItem(id, living);
      });
    });
  }

  function dropItem(id, intoLiving) {
    var it = ALL.find(function(x){return x.id === id;});
    if (!it) return;
    var el = document.querySelector('.living-item[data-id="' + id + '"]');
    if (!el || el.classList.contains('placed')) return;
    var correct = it.living === intoLiving;
    if (correct) {
      var col = document.querySelector('.living-col-body[data-living="' + intoLiving + '"]');
      if (col) col.appendChild(el);
      el.classList.add('placed');
      state.sorted++;
      if (typeof lumiReactTo === 'function') lumiReactTo('correct');
      if (typeof spawnParticles === 'function') {
        var r = el.getBoundingClientRect();
        spawnParticles(r.left + r.width/2, r.top + r.height/2, 3, '✨');
      }
      var meter = document.getElementById('living-meter');
      if (meter) meter.innerHTML = 'Sorted: <strong>' + state.sorted + ' / ' + state.target + '</strong>';
      if (state.sorted >= state.target && !state.completed) finishSim();
    } else {
      if (typeof lumiSay === 'function') lumiSay('Hmm — ' + it.name + '? ' + it.hint);
      if (typeof playSound === 'function') playSound('wrong');
      el.classList.add('shake');
      setTimeout(function(){ el.classList.remove('shake'); }, 400);
    }
  }

  function finishSim() {
    state.completed = true;
    if (typeof grantSimReward === 'function') grantSimReward('living', 'You can spot life!');
    var stage = document.querySelector('.sim-stage');
    if (stage) stage.innerHTML += '<div class="sim-win">🌱 Living things grow, breathe, eat, and have babies. Non-living things don\'t do any of those. <button class="lesson-btn" onclick="openSimHub()">More Lab →</button></div>';
  }

  function dispose() { state = null; }

  return { id: 'living', name: 'Living or Non-Living', emoji: '🌱', skill: 'living', render: render, dispose: dispose };
})();
