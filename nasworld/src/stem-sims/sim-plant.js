// ============================================================
//  STEM SIM 2 — PLANT TIME-LAPSE
//  Plant a seed. Give it water, sun, and time. Watch it grow.
//  Skill: plants
// ============================================================

var simPlant = (function() {
  // Growth stages
  var STAGES = [
    { id: 'seed',     emoji: '🌰', label: 'Seed',           waterNeeded: 1, sunNeeded: 0 },
    { id: 'sprout',   emoji: '🌱', label: 'Sprout',         waterNeeded: 1, sunNeeded: 1 },
    { id: 'seedling', emoji: '🌿', label: 'Seedling',       waterNeeded: 1, sunNeeded: 1 },
    { id: 'bud',      emoji: '🌾', label: 'Bud',            waterNeeded: 0, sunNeeded: 2 },
    { id: 'flower',   emoji: '🌻', label: 'Flower!',         waterNeeded: 0, sunNeeded: 0 }
  ];

  var state = null;

  function render(container) {
    state = { stageIdx: 0, water: 0, sun: 0, dryDays: 0, completed: false };
    container.innerHTML =
      '<button class="back-btn" onclick="openSimHub()">← Back to STEM Lab</button>' +
      '<h2 class="sim-title">🌻 Plant Time-Lapse</h2>' +
      '<p class="sim-blurb">Give your plant water and sunshine. See it grow from seed to flower!</p>' +
      '<div class="sim-stage plant-stage">' +
        '<div class="plant-scene">' +
          '<div class="plant-sky" id="plant-sky"></div>' +
          '<div class="plant-soil"><div class="plant-emoji" id="plant-emoji">🌰</div></div>' +
        '</div>' +
        '<div class="plant-status">' +
          '<div class="plant-stage-name" id="plant-stage-name">Seed — needs water</div>' +
          '<div class="plant-meters">' +
            '<div class="plant-meter">💧 Water: <span id="plant-water">0</span></div>' +
            '<div class="plant-meter">☀️ Sun: <span id="plant-sun">0</span></div>' +
          '</div>' +
        '</div>' +
        '<div class="plant-actions">' +
          '<button class="lesson-btn" id="plant-water-btn">💧 Water it</button>' +
          '<button class="lesson-btn" id="plant-sun-btn">☀️ Give sun</button>' +
        '</div>' +
        '<div class="plant-tip" id="plant-tip">Tip: Seeds need water first to sprout!</div>' +
      '</div>';

    document.getElementById('plant-water-btn').onclick = giveWater;
    document.getElementById('plant-sun-btn').onclick = giveSun;
    redraw();
  }

  function giveWater() {
    if (!state || state.completed) return;
    state.water++;
    var sky = document.getElementById('plant-sky');
    if (sky) {
      sky.innerHTML = '💧';
      sky.className = 'plant-sky drop-anim';
      setTimeout(function() { if (sky) sky.className = 'plant-sky'; }, 700);
    }
    if (typeof playSound === 'function') playSound('correct');
    checkGrowth();
  }
  function giveSun() {
    if (!state || state.completed) return;
    state.sun++;
    var sky = document.getElementById('plant-sky');
    if (sky) {
      sky.innerHTML = '☀️';
      sky.className = 'plant-sky sun-anim';
      setTimeout(function() { if (sky) sky.className = 'plant-sky'; }, 900);
    }
    if (typeof playSound === 'function') playSound('correct');
    checkGrowth();
  }
  function checkGrowth() {
    var stage = STAGES[state.stageIdx];
    if (state.water >= stage.waterNeeded && state.sun >= stage.sunNeeded) {
      state.stageIdx++;
      state.water = 0;
      state.sun = 0;
      if (typeof spawnParticles === 'function') {
        var el = document.getElementById('plant-emoji');
        if (el) {
          var r = el.getBoundingClientRect();
          spawnParticles(r.left + r.width/2, r.top, 6, '✨');
        }
      }
      if (typeof lumiSay === 'function') lumiSay('It grew into a ' + STAGES[state.stageIdx].label + '! What else does it need?');
      if (state.stageIdx >= STAGES.length - 1) {
        // Reached flower
        redraw();
        finishSim();
        return;
      }
    } else {
      // Hint
      var nm = stage.waterNeeded - state.water;
      var ns = stage.sunNeeded - state.sun;
      var hint = '';
      if (nm > 0 && ns > 0) hint = 'Needs ' + nm + ' more 💧 and ' + ns + ' more ☀️';
      else if (nm > 0) hint = 'Needs ' + nm + ' more 💧';
      else hint = 'Needs ' + ns + ' more ☀️';
      var tip = document.getElementById('plant-tip');
      if (tip) tip.textContent = hint;
    }
    redraw();
  }
  function redraw() {
    if (!state) return;
    var emojiEl = document.getElementById('plant-emoji');
    var stageEl = document.getElementById('plant-stage-name');
    var waterEl = document.getElementById('plant-water');
    var sunEl = document.getElementById('plant-sun');
    if (!emojiEl) return;
    var stage = STAGES[Math.min(state.stageIdx, STAGES.length - 1)];
    emojiEl.textContent = stage.emoji;
    emojiEl.style.fontSize = (40 + state.stageIdx * 10) + 'px';
    if (stageEl) stageEl.textContent = stage.label + (state.stageIdx < STAGES.length - 1 ? ' — keep going!' : ' 🎉');
    if (waterEl) waterEl.textContent = state.water + ' / ' + stage.waterNeeded;
    if (sunEl) sunEl.textContent = state.sun + ' / ' + stage.sunNeeded;
  }
  function finishSim() {
    if (!state || state.completed) return;
    state.completed = true;
    if (typeof grantSimReward === 'function') grantSimReward('plants', 'Plant grown!');
    var c = document.querySelector('.plant-stage');
    if (c) c.innerHTML += '<div class="sim-win">🌻 Your seed became a flower! Plants need water, sunlight, and time. Soon it will make new seeds. <button class="lesson-btn" onclick="openSimHub()">More Lab →</button></div>';
  }

  function dispose() { state = null; }

  return { id: 'plant', name: 'Plant Time-Lapse', emoji: '🌻', skill: 'plants', render: render, dispose: dispose };
})();
