// ============================================================
//  STEM SIM HUB — Index + reward bridge
// ============================================================

var SIM_REGISTRY = null;
function getSimRegistry() {
  if (SIM_REGISTRY) return SIM_REGISTRY;
  SIM_REGISTRY = {};
  [simPushPull, simPlant, simShadow, simRecycle, simFloat,
   simBalance, simMagnets, simLiving, simWater].forEach(function(s) {
    if (s) SIM_REGISTRY[s.id] = s;
  });
  return SIM_REGISTRY;
}

function renderSimHub() {
  var c = document.getElementById('sim-hub-content');
  if (!c) return;
  var reg = getSimRegistry();
  if (!state.simPlays) state.simPlays = {};
  var played = state.simPlays;

  var html = '<button class="back-btn" onclick="showScreen(\'home\')">← Back to Home</button>';
  html += '<h2 class="sim-hub-title">🔬 STEM Lab</h2>';
  html += '<p class="sim-hub-blurb">Five real experiments. Curiosity earns stars.</p>';
  html += '<div class="sim-hub-grid">';
  Object.keys(reg).forEach(function(id) {
    var s = reg[id];
    var p = played[id] || 0;
    var skillName = '';
    if (typeof STEM_TREE !== 'undefined' && STEM_TREE[s.skill]) {
      skillName = STEM_TREE[s.skill].name;
    }
    html += '<div class="sim-card" onclick="openSim(\'' + id + '\')">' +
      '<div class="sim-card-emoji">' + s.emoji + '</div>' +
      '<div class="sim-card-name">' + s.name + '</div>' +
      '<div class="sim-card-skill">' + (skillName ? '⭐ ' + skillName : '') + '</div>' +
      '<div class="sim-card-plays">' + (p > 0 ? '✅ Played ' + p + 'x' : 'Tap to play →') + '</div>' +
    '</div>';
  });
  html += '</div>';
  c.innerHTML = html;
}

function openSim(simId) {
  var reg = getSimRegistry();
  var sim = reg[simId];
  if (!sim) return;
  // Dispose previous
  if (window._currentSim && window._currentSim.dispose) {
    try { window._currentSim.dispose(); } catch(e) {}
  }
  window._currentSim = sim;
  showScreen('sim');
  var c = document.getElementById('sim-content');
  if (c) sim.render(c);
}

function openSimHub() {
  if (window._currentSim && window._currentSim.dispose) {
    try { window._currentSim.dispose(); } catch(e) {}
  }
  window._currentSim = null;
  showScreen('sim-hub');
}

// Reward bridge — called by sims on completion
function grantSimReward(skillId, message) {
  if (!state.simPlays) state.simPlays = {};
  var sim = window._currentSim;
  if (sim) state.simPlays[sim.id] = (state.simPlays[sim.id] || 0) + 1;

  // First play of a sim → bigger reward; replays → smaller
  var times = sim ? state.simPlays[sim.id] : 1;
  var tokens = times === 1 ? 20 : 5;
  state.tokens = (state.tokens || 0) + tokens;

  // Mastery bump
  if (skillId && typeof state.skills === 'object') {
    if (!state.skills[skillId]) state.skills[skillId] = { mastery: 0, totalAttempts: 0, correctAttempts: 0 };
    var bump = times === 1 ? 8 : 3;
    state.skills[skillId].mastery = Math.min(100, (state.skills[skillId].mastery || 0) + bump);
    state.skills[skillId].totalAttempts = (state.skills[skillId].totalAttempts || 0) + 1;
    state.skills[skillId].correctAttempts = (state.skills[skillId].correctAttempts || 0) + 1;
  }

  // Lumi reaction + token particles
  if (typeof lumiReactTo === 'function') lumiReactTo('quizComplete', { pct: 100 });
  if (typeof spawnParticles === 'function') {
    spawnParticles(window.innerWidth/2, window.innerHeight/3, 12, '⭐');
  }
  if (typeof lumiSay === 'function') lumiSay('+' + tokens + ' stars! ' + (message || ''));

  saveState();
  if (typeof updateTokenDisplay === 'function') updateTokenDisplay();
  if (typeof renderHome === 'function') renderHome();
}

window.openSim = openSim;
window.openSimHub = openSimHub;
window.renderSimHub = renderSimHub;
window.grantSimReward = grantSimReward;
