// ============================================================
//  STEM SIM 4 — SORT THE RECYCLING
//  Drag each item to the right bin. Wrong bins bounce it back.
//  Skill: material
// ============================================================

var simRecycle = (function() {
  var BINS = [
    { id: 'paper',   emoji: '📄', name: 'Paper',   colour: '#7bb3ff' },
    { id: 'plastic', emoji: '♻️', name: 'Plastic', colour: '#ffd166' },
    { id: 'metal',   emoji: '🥫', name: 'Metal',   colour: '#bcc6cc' },
    { id: 'food',    emoji: '🍂', name: 'Food / Compost', colour: '#8bd17c' }
  ];
  var ALL_ITEMS = [
    { emoji: '📰', name: 'Newspaper',  bin: 'paper' },
    { emoji: '📦', name: 'Cardboard',  bin: 'paper' },
    { emoji: '📚', name: 'Old Book',   bin: 'paper' },
    { emoji: '🧴', name: 'Shampoo Bottle', bin: 'plastic' },
    { emoji: '🥤', name: 'Plastic Cup',  bin: 'plastic' },
    { emoji: '🛍️', name: 'Plastic Bag', bin: 'plastic' },
    { emoji: '🥫', name: 'Tin Can',     bin: 'metal' },
    { emoji: '🔑', name: 'Old Key',     bin: 'metal' },
    { emoji: '⚙️', name: 'Metal Gear',  bin: 'metal' },
    { emoji: '🍌', name: 'Banana Peel', bin: 'food' },
    { emoji: '🍎', name: 'Apple Core',  bin: 'food' },
    { emoji: '🥚', name: 'Eggshells',   bin: 'food' }
  ];

  var state = null;

  function render(container) {
    // Pick 8 random items
    var items = ALL_ITEMS.slice().sort(function() { return Math.random() - 0.5; }).slice(0, 8);
    state = { items: items, idx: 0, sorted: 0, completed: false };

    container.innerHTML =
      '<button class="back-btn" onclick="openSimHub()">← Back to STEM Lab</button>' +
      '<h2 class="sim-title">♻️ Sort the Recycling</h2>' +
      '<p class="sim-blurb">Drag each item to its bin. Some are tricky! Lumi will hint if you get stuck.</p>' +
      '<div class="sim-stage">' +
        '<div class="recycle-current" id="recycle-current"></div>' +
        '<div class="recycle-bins">' +
          BINS.map(function(b) {
            return '<div class="recycle-bin" data-bin="' + b.id + '" style="border-color:' + b.colour + '">' +
              '<div class="recycle-bin-emoji">' + b.emoji + '</div>' +
              '<div class="recycle-bin-name">' + b.name + '</div>' +
            '</div>';
          }).join('') +
        '</div>' +
        '<div class="sim-meter">Sorted: <strong id="recycle-count">0 / 8</strong></div>' +
      '</div>';

    showItem();
    document.querySelectorAll('.recycle-bin').forEach(function(el) {
      el.onclick = function() { tryBin(el.dataset.bin); };
      el.addEventListener('dragover', function(e) { e.preventDefault(); el.classList.add('hover'); });
      el.addEventListener('dragleave', function() { el.classList.remove('hover'); });
      el.addEventListener('drop', function(e) { e.preventDefault(); el.classList.remove('hover'); tryBin(el.dataset.bin); });
    });
  }

  function showItem() {
    if (!state) return;
    var cur = document.getElementById('recycle-current');
    if (!cur) return;
    if (state.idx >= state.items.length) { finishSim(); return; }
    var it = state.items[state.idx];
    cur.innerHTML =
      '<div class="recycle-item" draggable="true">' +
        '<div class="recycle-item-emoji">' + it.emoji + '</div>' +
        '<div class="recycle-item-name">' + it.name + '</div>' +
      '</div>';
    var el = cur.querySelector('.recycle-item');
    if (el) {
      el.addEventListener('dragstart', function(e) {
        e.dataTransfer.setData('text/plain', it.bin);
      });
    }
  }

  function tryBin(binId) {
    if (!state || state.idx >= state.items.length) return;
    var it = state.items[state.idx];
    var correct = it.bin === binId;
    if (correct) {
      state.sorted++;
      state.idx++;
      if (typeof lumiReactTo === 'function') lumiReactTo('correct');
      if (typeof spawnParticles === 'function') {
        var binEl = document.querySelector('.recycle-bin[data-bin="' + binId + '"]');
        if (binEl) {
          var r = binEl.getBoundingClientRect();
          spawnParticles(r.left + r.width/2, r.top + r.height/2, 4, '✨');
        }
      }
      document.getElementById('recycle-count').textContent = state.sorted + ' / ' + state.items.length;
      if (state.idx >= state.items.length) {
        setTimeout(finishSim, 300);
      } else {
        showItem();
      }
    } else {
      // Hint
      if (typeof lumiSay === 'function') {
        var bin = BINS.find(function(b) { return b.id === it.bin; });
        lumiSay('Not quite — that goes in ' + bin.name + '. Try again!');
      }
      if (typeof playSound === 'function') playSound('wrong');
      var el = document.querySelector('.recycle-item');
      if (el) { el.classList.add('shake'); setTimeout(function() { el.classList.remove('shake'); }, 400); }
    }
  }

  function finishSim() {
    if (!state || state.completed) return;
    state.completed = true;
    if (typeof grantSimReward === 'function') grantSimReward('material', 'Recycling champion!');
    var stage = document.querySelector('#screen-sim .sim-stage');
    if (stage) stage.innerHTML += '<div class="sim-win">♻️ Sorting helps Earth. Paper, plastic, metal, and food all get reused in different ways! <button class="lesson-btn" onclick="openSimHub()">More Lab →</button></div>';
  }

  function dispose() { state = null; }

  return { id: 'recycle', name: 'Sort the Recycling', emoji: '♻️', skill: 'material', render: render, dispose: dispose };
})();
