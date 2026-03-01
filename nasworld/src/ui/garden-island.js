// ============================================================
//  GARDEN EVOLUTION — Island that evolves visually with progress
// ============================================================
// The garden transforms from barren dirt → sprouting patch →
// lush meadow → tropical garden → magical floating island
// Based on flower count milestones

var ISLAND_STAGES = [
  {
    name: 'Barren Ground',
    minFlowers: 0,
    bg: 'linear-gradient(180deg, #1a1147 0%, #2d1f6b 40%, #5c4a3d 60%, #3d2b1f 100%)',
    groundColor: '#5c4a3d',
    features: [],
    ambientEmoji: [],
    desc: 'A quiet patch of earth, waiting for life...'
  },
  {
    name: 'Sprouting Patch',
    minFlowers: 3,
    bg: 'linear-gradient(180deg, #1a1147 0%, #2d1f6b 30%, #4a6741 55%, #3d5a35 70%, #2d4228 100%)',
    groundColor: '#4a6741',
    features: ['grass'],
    ambientEmoji: ['\uD83E\uDEB1', '\uD83C\uDF3F'],
    desc: 'Green shoots push through! Your island is waking up!'
  },
  {
    name: 'Blooming Meadow',
    minFlowers: 8,
    bg: 'linear-gradient(180deg, #0f1b4d 0%, #1a3a6b 25%, #2d7a4a 50%, #4a9a5a 65%, #3d7a45 100%)',
    groundColor: '#2d7a4a',
    features: ['grass', 'pond', 'butterflies'],
    ambientEmoji: ['\uD83E\uDD8B', '\uD83D\uDC1B', '\uD83C\uDF3C'],
    desc: 'Butterflies have arrived! A little pond glistens.'
  },
  {
    name: 'Lush Garden',
    minFlowers: 15,
    bg: 'linear-gradient(180deg, #0a1a3d 0%, #1a4a6b 20%, #1a6b4a 45%, #2d9a5a 60%, #4aaa6a 75%, #3d8a50 100%)',
    groundColor: '#2d9a5a',
    features: ['grass', 'pond', 'butterflies', 'trees', 'birds'],
    ambientEmoji: ['\uD83C\uDF33', '\uD83D\uDC26', '\uD83E\uDD8B', '\uD83C\uDF3A'],
    desc: 'Trees grow tall! Birds sing from the branches!'
  },
  {
    name: 'Tropical Paradise',
    minFlowers: 25,
    bg: 'linear-gradient(180deg, #0a0f3d 0%, #1a3a8b 15%, #0a6a9a 30%, #1a8a5a 50%, #3aaa6a 65%, #5aba7a 80%, #4a9a60 100%)',
    groundColor: '#3aaa6a',
    features: ['grass', 'pond', 'butterflies', 'trees', 'birds', 'waterfall', 'rainbow'],
    ambientEmoji: ['\uD83C\uDF34', '\uD83E\uDD9C', '\uD83C\uDF08', '\uD83D\uDC20', '\uD83C\uDF3A'],
    desc: 'A waterfall cascades! Parrots soar! A rainbow shines!'
  },
  {
    name: 'Floating Star Island',
    minFlowers: 35,
    bg: 'linear-gradient(180deg, #050520 0%, #0a0a40 20%, #1a1a6b 35%, #2a4a8b 50%, #3a8a6a 65%, #5aba8a 80%, #7adaa0 95%)',
    groundColor: '#3a8a6a',
    features: ['grass', 'pond', 'butterflies', 'trees', 'birds', 'waterfall', 'rainbow', 'floating', 'aurora', 'crystals'],
    ambientEmoji: ['\uD83D\uDD2E', '\u2728', '\uD83C\uDF1F', '\uD83E\uDD84', '\uD83C\uDF08'],
    desc: 'Your island FLOATS among the stars! Crystals glow with aurora light!'
  }
];

function getIslandStage() {
  var flowers = state.garden ? state.garden.length : 0;
  var stage = 0;
  for (var i = ISLAND_STAGES.length - 1; i >= 0; i--) {
    if (flowers >= ISLAND_STAGES[i].minFlowers) {
      stage = i;
      break;
    }
  }
  return stage;
}

function renderGardenIsland() {
  var container = document.getElementById('garden-island');
  if (!container) return;

  var stageIdx = getIslandStage();
  var stage = ISLAND_STAGES[stageIdx];
  var flowers = state.garden ? state.garden.length : 0;
  var nextStage = stageIdx < ISLAND_STAGES.length - 1 ? ISLAND_STAGES[stageIdx + 1] : null;

  var html = '';

  // Island stage title
  html += '<div class="island-stage-title">';
  html += '<span class="island-stage-name">' + stage.name + '</span>';
  if (nextStage) {
    var needed = nextStage.minFlowers - flowers;
    html += '<span class="island-stage-next">' + needed + ' more flower' + (needed > 1 ? 's' : '') + ' to evolve</span>';
  } else {
    html += '<span class="island-stage-next" style="color:var(--gold)">Maximum evolution!</span>';
  }
  html += '</div>';

  // Evolution progress dots
  html += '<div class="island-evo-dots">';
  for (var d = 0; d < ISLAND_STAGES.length; d++) {
    html += '<div class="island-evo-dot' + (d <= stageIdx ? ' active' : '') + '">' +
      (d <= stageIdx ? '\u2B50' : '\u2606') + '</div>';
  }
  html += '</div>';

  // The island visual
  html += '<div class="island-visual" style="background:' + stage.bg + '">';

  // Sky elements
  html += '<div class="island-sky">';
  if (stage.features.indexOf('aurora') >= 0) {
    html += '<div class="island-aurora"></div>';
  }
  if (stage.features.indexOf('rainbow') >= 0) {
    html += '<div class="island-rainbow">\uD83C\uDF08</div>';
  }
  if (stage.features.indexOf('birds') >= 0) {
    html += '<div class="island-bird bird-1">\uD83D\uDC26</div>';
    html += '<div class="island-bird bird-2">\uD83E\uDD9C</div>';
  }
  if (stage.features.indexOf('butterflies') >= 0) {
    html += '<div class="island-butterfly bf-1">\uD83E\uDD8B</div>';
    html += '<div class="island-butterfly bf-2">\uD83E\uDD8B</div>';
  }
  html += '</div>';

  // Ground layer
  html += '<div class="island-ground" style="background:' + stage.groundColor + '">';

  // Floating effect
  if (stage.features.indexOf('floating') >= 0) {
    html += '<div class="island-float-rocks"></div>';
  }

  // Landscape features
  if (stage.features.indexOf('trees') >= 0) {
    html += '<div class="island-tree tree-1">\uD83C\uDF33</div>';
    html += '<div class="island-tree tree-2">\uD83C\uDF34</div>';
  }
  if (stage.features.indexOf('waterfall') >= 0) {
    html += '<div class="island-waterfall">\uD83C\uDF0A</div>';
  }
  if (stage.features.indexOf('pond') >= 0) {
    html += '<div class="island-pond">\uD83D\uDCA7</div>';
  }
  if (stage.features.indexOf('crystals') >= 0) {
    html += '<div class="island-crystal c-1">\uD83D\uDD2E</div>';
    html += '<div class="island-crystal c-2">\uD83D\uDD2E</div>';
  }
  if (stage.features.indexOf('grass') >= 0) {
    html += '<div class="island-grass">\uD83C\uDF3F \uD83C\uDF3F \uD83C\uDF3F</div>';
  }

  // Planted flowers on the island
  var gardenFlowers = state.garden || [];
  html += '<div class="island-flowers">';
  gardenFlowers.forEach(function(g, idx) {
    var x = 10 + (idx * 37 % 80);
    var y = 5 + (idx * 23 % 60);
    var size = g.type === 'golden' ? 22 : 18;
    html += '<span class="island-flower' + (g.type === 'golden' ? ' golden' : '') + '" style="left:' + x + '%;top:' + y + '%;font-size:' + size + 'px">' + g.emoji + '</span>';
  });
  html += '</div>';

  html += '</div>'; // ground
  html += '</div>'; // island-visual

  // Description
  html += '<div class="island-desc">' + stage.desc + '</div>';

  container.innerHTML = html;
}

// Check if island evolved (called after adding flower)
function checkIslandEvolution() {
  if (!state._lastIslandStage) state._lastIslandStage = 0;
  var newStage = getIslandStage();

  if (newStage > state._lastIslandStage) {
    state._lastIslandStage = newStage;
    var stage = ISLAND_STAGES[newStage];

    // Celebration!
    if (typeof playSound === 'function') playSound('escape');
    if (typeof spawnParticles === 'function') {
      spawnParticles(window.innerWidth / 2, window.innerHeight / 2, 20, pick(stage.ambientEmoji));
    }
    if (typeof lumiReactTo === 'function') {
      lumiReactTo('gardenGrow');
    }
    if (typeof lumiSay === 'function') {
      setTimeout(function() {
        lumiSay('Your island evolved to ' + stage.name + '! ' + stage.desc);
      }, 1500);
    }

    // Show evolution overlay
    showIslandEvolution(newStage);
    return true;
  }
  return false;
}

function showIslandEvolution(stageIdx) {
  var stage = ISLAND_STAGES[stageIdx];
  var overlay = document.getElementById('island-evo-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'island-evo-overlay';
    overlay.className = 'island-evo-overlay';
    document.body.appendChild(overlay);
  }

  overlay.innerHTML =
    '<div class="island-evo-card">' +
      '<div class="island-evo-badge">Island Evolution!</div>' +
      '<div class="island-evo-icon">' + (stage.ambientEmoji[0] || '\u2728') + '</div>' +
      '<div class="island-evo-name">' + stage.name + '</div>' +
      '<div class="island-evo-desc">' + stage.desc + '</div>' +
      '<div class="island-evo-features">' +
        stage.ambientEmoji.join(' ') +
      '</div>' +
      '<button class="lesson-btn lesson-btn-done" onclick="closeIslandEvolution()">Amazing! \u2192</button>' +
    '</div>';

  overlay.classList.add('show');
}

function closeIslandEvolution() {
  var overlay = document.getElementById('island-evo-overlay');
  if (overlay) overlay.classList.remove('show');
}
