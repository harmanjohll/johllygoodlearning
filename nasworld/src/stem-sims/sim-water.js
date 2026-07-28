// ============================================================
//  STEM SIM 9 — WATER CYCLE
//  Watch and learn: sun heats water → evaporates → cloud → rain → river → sea.
//  Tap to advance through each stage.
//  Skill: earth
// ============================================================

var simWater = (function() {
  var STAGES = [
    { id: 'start',     name: '☀️ Start',        msg: 'Tap to start the water cycle. The sun warms the sea.' },
    { id: 'evaporate', name: '💨 Evaporation',   msg: 'Heat turns water into invisible vapour. It rises up.' },
    { id: 'condense',  name: '☁️ Condensation', msg: 'High up, the vapour cools and gathers into clouds.' },
    { id: 'rain',      name: '🌧️ Precipitation', msg: 'Heavy clouds drop the water as rain.' },
    { id: 'flow',      name: '🏞️ Collection',   msg: 'Rain flows down rivers, back to the sea. The cycle starts again!' },
    { id: 'done',      name: '🔁 Cycle complete', msg: 'You watched the whole cycle. The same water keeps going around forever.' }
  ];
  var state = null;

  function render(container) {
    state = { stageIdx: 0, completed: false };
    container.innerHTML =
      '<button class="back-btn" onclick="openSimHub()">← Back to STEM Lab</button>' +
      '<h2 class="sim-title">💧 Water Cycle</h2>' +
      '<p class="sim-blurb">Tap "Next" to follow the water on its journey.</p>' +
      '<div class="sim-stage">' +
        '<div class="water-scene">' +
          '<div class="water-sun">☀️</div>' +
          '<div class="water-cloud" id="water-cloud">☁️</div>' +
          '<div class="water-vapour"  id="water-vapour"></div>' +
          '<div class="water-rain"   id="water-rain"></div>' +
          '<div class="water-mountain">⛰️</div>' +
          '<div class="water-river"  id="water-river">~~~</div>' +
          '<div class="water-sea"></div>' +
        '</div>' +
        '<div class="water-stage-name" id="water-stage-name"></div>' +
        '<div class="water-msg" id="water-msg"></div>' +
        '<button class="lesson-btn lesson-btn-done" id="water-next">▶ Next stage</button>' +
        '<div class="sim-meter" id="water-meter">Stage: <strong>1 / ' + STAGES.length + '</strong></div>' +
      '</div>';
    document.getElementById('water-next').onclick = next;
    showStage();
  }

  function showStage() {
    var s = STAGES[state.stageIdx];
    var nameEl = document.getElementById('water-stage-name');
    var msgEl = document.getElementById('water-msg');
    var meter = document.getElementById('water-meter');
    var vapour = document.getElementById('water-vapour');
    var cloud  = document.getElementById('water-cloud');
    var rain   = document.getElementById('water-rain');
    var river  = document.getElementById('water-river');
    var next   = document.getElementById('water-next');

    if (nameEl) nameEl.textContent = s.name;
    if (msgEl)  msgEl.textContent  = s.msg;
    if (meter)  meter.innerHTML    = 'Stage: <strong>' + (state.stageIdx + 1) + ' / ' + STAGES.length + '</strong>';

    if (vapour) vapour.className = 'water-vapour' + (s.id === 'evaporate' ? ' show' : '');
    if (cloud)  cloud.className  = 'water-cloud'  + (['condense','rain','flow','done'].indexOf(s.id) !== -1 ? ' show' : '');
    if (rain)   rain.className   = 'water-rain'   + (['rain','flow','done'].indexOf(s.id) !== -1 ? ' show' : '');
    if (river)  river.className  = 'water-river'  + (['flow','done'].indexOf(s.id) !== -1 ? ' show' : '');

    if (next) {
      if (state.stageIdx >= STAGES.length - 1) {
        next.textContent = '🎉 Done!';
        if (!state.completed) finishSim();
      } else {
        next.textContent = '▶ Next stage';
      }
    }
  }
  function next() {
    if (state.stageIdx < STAGES.length - 1) {
      state.stageIdx++;
      showStage();
      if (typeof lumiReactTo === 'function') lumiReactTo('correct');
    }
  }

  function finishSim() {
    state.completed = true;
    if (typeof grantSimReward === 'function') grantSimReward('earth', 'Water cycle understood!');
    var stage = document.querySelector('.sim-stage');
    if (stage) stage.innerHTML += '<div class="sim-win">💧 Same water cycles forever: sea → vapour → cloud → rain → river → sea. The water you drink today might once have been in a dinosaur! <button class="lesson-btn" onclick="openSimHub()">More Lab →</button></div>';
  }

  function dispose() { state = null; }

  return { id: 'water', name: 'Water Cycle', emoji: '💧', skill: 'earth', render: render, dispose: dispose };
})();
