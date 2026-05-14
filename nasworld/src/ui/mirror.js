// ============================================================
//  MIRROR — Honest progress dashboard.
//  Four panels: Consolidated · On the Edge · Time by World · Effort.
//  Voice: factual, kind, no fake cheer.
// ============================================================

function _allTreesMap() {
  return Object.assign({},
    typeof MATH_TREE  !== 'undefined' ? MATH_TREE  : {},
    typeof WORD_TREE  !== 'undefined' ? WORD_TREE  : {},
    typeof STEM_TREE  !== 'undefined' ? STEM_TREE  : {},
    typeof MALAY_TREE !== 'undefined' ? MALAY_TREE : {}
  );
}

function mirrorSkillWorld(skillId) {
  if (typeof MATH_TREE  !== 'undefined' && MATH_TREE[skillId])  return 'math';
  if (typeof WORD_TREE  !== 'undefined' && WORD_TREE[skillId])  return 'word';
  if (typeof STEM_TREE  !== 'undefined' && STEM_TREE[skillId])  return 'stem';
  if (typeof MALAY_TREE !== 'undefined' && MALAY_TREE[skillId]) return 'malay';
  return null;
}

function mirrorStats() {
  var consolidated = 0;
  var onEdge = [];
  var attempted = 0;
  var totalSkills = 0;
  var byWorld = { math: 0, word: 0, stem: 0, malay: 0 };
  var weakestWorld = null;
  var trees = _allTreesMap();

  Object.keys(trees).forEach(function(id) {
    totalSkills++;
    var s = state.skills && state.skills[id];
    var w = mirrorSkillWorld(id);
    if (s && (s.totalAttempts || 0) > 0) attempted++;
    if (s && (s.mastery || 0) >= 80) {
      consolidated++;
    }
    if (w) {
      byWorld[w] = (byWorld[w] || 0) + (s ? (s.mastery || 0) : 0);
    }
  });

  // Normalise byWorld to averages
  var counts = { math: 0, word: 0, stem: 0, malay: 0 };
  Object.keys(trees).forEach(function(id) {
    var w = mirrorSkillWorld(id);
    if (w) counts[w]++;
  });
  var avgByWorld = {};
  Object.keys(counts).forEach(function(w) {
    avgByWorld[w] = counts[w] ? Math.round(byWorld[w] / counts[w]) : 0;
  });
  // Weakest world among those with at least one skill
  var minPct = 200;
  Object.keys(avgByWorld).forEach(function(w) {
    if (counts[w] > 0 && avgByWorld[w] < minPct) { minPct = avgByWorld[w]; weakestWorld = w; }
  });

  // On the edge = due for review (spaced review module)
  if (typeof getSkillsDueForReview === 'function') {
    onEdge = getSkillsDueForReview();
  }

  return {
    consolidated: consolidated,
    attempted: attempted,
    totalSkills: totalSkills,
    onEdge: onEdge,
    avgByWorld: avgByWorld,
    weakestWorld: weakestWorld
  };
}

// Effort heatmap: read state.visitHistory + sessionsCompleted.
function mirrorEffortMinutesByDay() {
  var byDay = {};
  // Use compass mood history as a proxy for "showed up today"
  var hist = (state.compass && state.compass.moodHistory) ? state.compass.moodHistory : [];
  hist.forEach(function(entry) {
    var d = new Date(entry.date).toISOString().slice(0,10);
    byDay[d] = (byDay[d] || 0) + 10;   // approx 10 min per mood check
  });
  // Visit history adds a baseline 5 min per visit day
  (state.visitHistory || []).forEach(function(dStr) {
    var d = new Date(dStr).toISOString().slice(0,10);
    byDay[d] = (byDay[d] || 0) + 5;
  });
  // Sessions completed roughly today
  if (state.lastVisit) {
    var today = new Date().toISOString().slice(0,10);
    if (!byDay[today]) byDay[today] = 5;
  }
  return byDay;
}

function renderMirror() {
  var container = document.getElementById('mirror-content');
  if (!container) return;
  var stats = mirrorStats();
  var heat = mirrorEffortMinutesByDay();

  var worldLabels = { math: '🔢 Number', word: '📖 Word', stem: '🔬 STEM', malay: '🌺 Melayu' };
  var worldColours = { math: '#7bb3ff', word: '#ff7b7b', stem: '#7bffb5', malay: '#ff7bdb' };

  var html = '<button class="back-btn" onclick="showScreen(\'home\')">← Back to Home</button>';
  html += '<div class="mirror-shell">';
  html += '<div class="mirror-intro">The honest story of how things are going. No fake cheer.</div>';

  // Tile 1: Consolidated
  html += '<div class="mirror-tile">';
  html += '<div class="mirror-tile-label">Consolidated</div>';
  html += '<div class="mirror-tile-big">' + stats.consolidated + '<span class="mirror-tile-of">/' + stats.totalSkills + '</span></div>';
  html += '<div class="mirror-tile-sub">skills at 80% mastery or higher</div>';
  if (stats.consolidated === 0) {
    html += '<div class="mirror-tile-note">No skills mastered yet — that is okay. First five are the hardest.</div>';
  } else if (stats.consolidated < 3) {
    html += '<div class="mirror-tile-note">Three more and you will have a real momentum.</div>';
  } else {
    html += '<div class="mirror-tile-note">Real progress. You are not new at this anymore.</div>';
  }
  html += '</div>';

  // Tile 2: On the Edge
  html += '<div class="mirror-tile">';
  html += '<div class="mirror-tile-label">On the Edge</div>';
  html += '<div class="mirror-tile-big">' + stats.onEdge.length + '</div>';
  html += '<div class="mirror-tile-sub">skill' + (stats.onEdge.length === 1 ? '' : 's') + ' due for a quick review today</div>';
  if (stats.onEdge.length > 0) {
    html += '<div class="mirror-tile-list">';
    stats.onEdge.slice(0, 3).forEach(function(id) {
      var w = mirrorSkillWorld(id) || 'math';
      var nm = (typeof getSkillName === 'function') ? getSkillName(id) : id;
      html += '<button class="mirror-tile-chip" onclick="openSkillView(\'' + id + '\',\'' + w + '\')">' + nm + ' →</button>';
    });
    html += '</div>';
  } else {
    html += '<div class="mirror-tile-note">Nothing waiting today. Use the time for something new.</div>';
  }
  html += '</div>';

  // Tile 3: Time by World
  html += '<div class="mirror-tile">';
  html += '<div class="mirror-tile-label">Where you are at, by World</div>';
  html += '<div class="mirror-world-bars">';
  Object.keys(worldLabels).forEach(function(w) {
    var pct = stats.avgByWorld[w] || 0;
    html += '<div class="mirror-world-row">';
    html += '<span class="mirror-world-name">' + worldLabels[w] + '</span>';
    html += '<div class="mirror-world-bar"><div class="mirror-world-fill" style="width:' + pct + '%;background:' + worldColours[w] + '"></div></div>';
    html += '<span class="mirror-world-pct">' + pct + '%</span>';
    html += '</div>';
  });
  html += '</div>';
  if (stats.weakestWorld) {
    html += '<div class="mirror-tile-note">Softest spot right now: <b style="color:' + worldColours[stats.weakestWorld] + '">' + worldLabels[stats.weakestWorld] + '</b>. Worth a session this week.</div>';
  }
  html += '</div>';

  // Tile 4: Effort heatmap (28 days)
  html += '<div class="mirror-tile">';
  html += '<div class="mirror-tile-label">Showing Up — last 28 days</div>';
  html += '<div class="mirror-heatmap">';
  for (var i = 27; i >= 0; i--) {
    var d = new Date();
    d.setDate(d.getDate() - i);
    var key = d.toISOString().slice(0,10);
    var mins = heat[key] || 0;
    var bucket = mins === 0 ? 0 : mins < 5 ? 1 : mins < 15 ? 2 : mins < 30 ? 3 : 4;
    var dayShort = d.toDateString().slice(0,3);
    html += '<div class="mirror-heat-cell heat-' + bucket + '" title="' + key + ': ' + mins + ' min">' +
      (i % 7 === 0 ? '<span class="mirror-heat-tick">' + dayShort + '</span>' : '') +
      '</div>';
  }
  html += '</div>';
  html += '<div class="mirror-tile-note">Effort is its own story. On a hard day, showing up is enough.</div>';
  html += '</div>';

  html += '</div>';   // mirror-shell
  container.innerHTML = html;
}

window.renderMirror = renderMirror;
