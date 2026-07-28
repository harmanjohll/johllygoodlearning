// ============================================================
//  STEM SIM 5 — FLOAT OR SINK
//  Predict first, then drop. Curiosity, not correctness, is the reward.
//  Skill: material
// ============================================================

var simFloat = (function() {
  var ITEMS = [
    { emoji: '🪨', name: 'Stone',       floats: false, why: 'Stone is dense — heavier than water for its size.' },
    { emoji: '🍂', name: 'Dry Leaf',    floats: true,  why: 'Leaves are light and full of air pockets.' },
    { emoji: '🪙', name: 'Coin',        floats: false, why: 'Metal coins are heavier than the water they push aside.' },
    { emoji: '🧽', name: 'Sponge',      floats: true,  why: 'Sponges are mostly air — very light for their size.' },
    { emoji: '🔑', name: 'Old Key',     floats: false, why: 'Metal is denser than water.' },
    { emoji: '🍎', name: 'Apple',       floats: true,  why: 'Most apples are 25% air inside — they float!' },
    { emoji: '🥚', name: 'Egg',         floats: false, why: 'Most eggs sink in plain water (but float in salty water!).' },
    { emoji: '🪵', name: 'Wood Block',  floats: true,  why: 'Wood is less dense than water — it floats.' },
    { emoji: '⚽', name: 'Football',    floats: true,  why: 'Hollow and full of air — definitely floats.' },
    { emoji: '🍇', name: 'Grape',       floats: false, why: 'Grapes are surprisingly dense — they sink!' }
  ];
  var state = null;

  function render(container) {
    var pool = ITEMS.slice().sort(function() { return Math.random() - 0.5; }).slice(0, 6);
    state = { pool: pool, idx: 0, predictions: 0, prediction: null, droppedItems: [], completed: false };

    container.innerHTML =
      '<button class="back-btn" onclick="openSimHub()">← Back to STEM Lab</button>' +
      '<h2 class="sim-title">🌊 Float or Sink?</h2>' +
      '<p class="sim-blurb">Look at the item. Guess first: float or sink? Then drop it in!</p>' +
      '<div class="sim-stage float-stage">' +
        '<div class="float-item" id="float-item"></div>' +
        '<div class="float-predict" id="float-predict">' +
          '<button class="lesson-btn float-btn" data-p="float">🟢 Float</button>' +
          '<button class="lesson-btn float-btn" data-p="sink">🔵 Sink</button>' +
        '</div>' +
        '<div class="float-result" id="float-result"></div>' +
        '<div class="float-tank">' +
          '<div class="float-water"></div>' +
          '<div class="float-shelf" id="float-shelf"></div>' +
          '<div class="float-bed" id="float-bed"></div>' +
        '</div>' +
        '<div class="sim-meter">Items tested: <strong id="float-count">0 / 6</strong></div>' +
      '</div>';

    showItem();
    document.querySelectorAll('.float-btn').forEach(function(b) {
      b.onclick = function() { onPredict(b.dataset.p); };
    });
  }

  function showItem() {
    if (!state) return;
    if (state.idx >= state.pool.length) { finishSim(); return; }
    var it = state.pool[state.idx];
    var el = document.getElementById('float-item');
    if (el) el.innerHTML = '<div class="float-item-emoji">' + it.emoji + '</div><div class="float-item-name">' + it.name + '</div>';
    state.prediction = null;
    var pred = document.getElementById('float-predict');
    var result = document.getElementById('float-result');
    if (pred) pred.style.display = 'flex';
    if (result) result.innerHTML = '';
  }

  function onPredict(choice) {
    if (!state || state.prediction !== null) return;
    state.prediction = choice;
    state.predictions++;
    var pred = document.getElementById('float-predict');
    if (pred) pred.style.display = 'none';
    var it = state.pool[state.idx];
    var correctWord = it.floats ? 'float' : 'sink';
    var matched = choice === correctWord;
    var result = document.getElementById('float-result');
    var verdict = it.floats ? '🟢 It floats!' : '🔵 It sinks!';
    var msg = matched ? 'You guessed it!' : 'Curious! You predicted ' + (choice === 'float' ? 'float' : 'sink') + '.';
    if (result) result.innerHTML = '<div class="float-verdict">' + verdict + '</div><div class="float-why">' + msg + ' ' + it.why + '</div><button class="lesson-btn" id="float-next">Next item →</button>';

    // Animate the item dropping
    var shelf = document.getElementById('float-shelf');
    var bed = document.getElementById('float-bed');
    var item = it.emoji;
    if (it.floats && shelf) shelf.innerHTML = '<span class="float-bobber">' + item + '</span>';
    else if (bed) bed.innerHTML = '<span class="float-sinker">' + item + '</span>';

    if (matched && typeof lumiReactTo === 'function') lumiReactTo('correct');
    if (typeof spawnParticles === 'function') {
      var target = document.querySelector('.float-tank').getBoundingClientRect();
      spawnParticles(target.left + target.width/2, target.top + 30, 5, '💧');
    }

    setTimeout(function() {
      var nxt = document.getElementById('float-next');
      if (nxt) nxt.onclick = function() {
        state.idx++;
        // Clear floats from previous
        if (shelf) shelf.innerHTML = '';
        if (bed) bed.innerHTML = '';
        showItem();
        var meter = document.getElementById('float-count');
        if (meter) meter.textContent = state.idx + ' / ' + state.pool.length;
      };
    }, 100);
  }

  function finishSim() {
    if (!state || state.completed) return;
    state.completed = true;
    if (typeof grantSimReward === 'function') grantSimReward('material', 'Scientist! You predicted and tested.');
    var stage = document.querySelector('.float-stage');
    if (stage) stage.innerHTML += '<div class="sim-win">🌊 Floating depends on density — how heavy something is for its size. Air inside = float; solid metal/stone = sink. <button class="lesson-btn" onclick="openSimHub()">More Lab →</button></div>';
  }

  function dispose() { state = null; }

  return { id: 'float', name: 'Float or Sink?', emoji: '🌊', skill: 'material', render: render, dispose: dispose };
})();
