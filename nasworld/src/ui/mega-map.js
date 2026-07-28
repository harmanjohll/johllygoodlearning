// ============================================================
//  MEGA MAP UI — Cross-world concept map.
//  Vanilla SVG; no D3 dependency so it works offline.
//
//  Layout: 4 worlds in the four quadrants, each with their skills
//  fanning out around them. Phenomena ring the outside, with
//  cross-world links drawn dashed.
//
//  Skill brightness scales with mastery. Hover highlights the
//  network. Click a skill to open its lesson/quiz.
// ============================================================

(function() {

var VIEW = 1000;          // SVG viewBox size (square)
var CENTRE = VIEW / 2;
var WORLD_RADIUS_OUTER = 380;
var WORLD_RADIUS_INNER = 140;
var PHENOMENON_RADIUS = 460;

// World anchor positions (NW, NE, SW, SE)
var WORLD_ANCHORS = {
  math:  { angle: 225 },
  word:  { angle: 315 },
  stem:  { angle: 135 },
  malay: { angle: 45  }
};

function polarToXY(cx, cy, r, angleDeg) {
  var a = (angleDeg - 90) * Math.PI / 180;
  return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
}

function clampNum(n, lo, hi) {
  return Math.max(lo, Math.min(hi, n));
}

// Compute node positions, returned keyed by node id.
function layoutMega(nodes) {
  var positions = {};

  // World hubs
  MEGA_WORLDS.forEach(function(w) {
    var a = WORLD_ANCHORS[w.id] ? WORLD_ANCHORS[w.id].angle : 0;
    var p = polarToXY(CENTRE, CENTRE, WORLD_RADIUS_INNER, a);
    positions[w.id] = p;
  });

  // Skills fan out around their world hub
  MEGA_WORLDS.forEach(function(w) {
    var skills = nodes.filter(function(n) { return n.kind === 'skill' && n.world === w.id; });
    var anchor = WORLD_ANCHORS[w.id].angle;
    var halfFan = 50;  // degrees on either side
    var step = skills.length > 1 ? (2 * halfFan) / (skills.length - 1) : 0;
    skills.forEach(function(s, i) {
      var deg = anchor - halfFan + i * step;
      var jitter = (i % 2 === 0 ? 20 : -10);   // tiered ring
      var r = WORLD_RADIUS_OUTER - 70 + jitter;
      r = clampNum(r, WORLD_RADIUS_INNER + 80, WORLD_RADIUS_OUTER);
      positions[s.id] = polarToXY(CENTRE, CENTRE, r, deg);
    });
  });

  // Phenomena scattered on outer ring (cardinal + diagonal)
  var phenomena = nodes.filter(function(n) { return n.kind === 'phenomenon'; });
  phenomena.forEach(function(p, i) {
    var deg = (360 / phenomena.length) * i + 18;
    positions[p.id] = polarToXY(CENTRE, CENTRE, PHENOMENON_RADIUS, deg);
  });

  return positions;
}

function masteryAlpha(mastery) {
  // Map 0..100 to 0.35..1.0
  return 0.35 + 0.65 * (mastery / 100);
}

function escapeAttr(s) {
  return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function buildEdgesSvg(edges, positions, hoveredId) {
  var svg = '';
  edges.forEach(function(e) {
    var p1 = positions[e.from];
    var p2 = positions[e.to];
    if (!p1 || !p2) return;
    var opacity, dash, stroke;
    if (e.type === 'phenomenon') {
      opacity = hoveredId && (hoveredId === e.from || hoveredId === e.to) ? 0.9 : 0.18;
      dash = '6 4';
      stroke = '#ffd700';
    } else if (e.type === 'belongs-to') {
      opacity = 0.32;
      dash = '0';
      stroke = '#b57bff';
    } else { // depends-on
      opacity = 0.18;
      dash = '2 4';
      stroke = '#7bb3ff';
    }
    // Quadratic curve through centre for a softer look on cross links
    if (e.type === 'phenomenon') {
      var midX = (p1.x + p2.x) / 2;
      var midY = (p1.y + p2.y) / 2;
      var dx = p2.x - p1.x;
      var dy = p2.y - p1.y;
      var nx = -dy * 0.12;
      var ny = dx * 0.12;
      svg += '<path d="M' + p1.x + ' ' + p1.y + ' Q' + (midX + nx) + ' ' + (midY + ny) + ' ' + p2.x + ' ' + p2.y + '" ' +
             'fill="none" stroke="' + stroke + '" stroke-opacity="' + opacity + '" stroke-width="1.5" stroke-dasharray="' + dash + '"/>';
    } else {
      svg += '<line x1="' + p1.x + '" y1="' + p1.y + '" x2="' + p2.x + '" y2="' + p2.y +
             '" stroke="' + stroke + '" stroke-opacity="' + opacity + '" stroke-width="1.2" stroke-dasharray="' + dash + '"/>';
    }
  });
  return svg;
}

function buildNodesSvg(nodes, positions, hoveredId) {
  var svg = '';
  nodes.forEach(function(n) {
    var pos = positions[n.id];
    if (!pos) return;

    if (n.kind === 'world') {
      var dim = hoveredId && hoveredId !== n.id ? 0.55 : 1;
      svg += '<g class="mega-node mega-world" data-id="' + escapeAttr(n.id) + '" style="cursor:pointer;opacity:' + dim + '">';
      svg += '<circle cx="' + pos.x + '" cy="' + pos.y + '" r="58" fill="' + n.colour + '" fill-opacity="0.22" stroke="' + n.colour + '" stroke-width="2.5"/>';
      svg += '<text x="' + pos.x + '" y="' + (pos.y - 4) + '" text-anchor="middle" font-size="34">' + n.emoji + '</text>';
      svg += '<text x="' + pos.x + '" y="' + (pos.y + 26) + '" text-anchor="middle" font-size="13" fill="#fff" font-weight="700">' + escapeAttr(n.label) + '</text>';
      svg += '</g>';
    } else if (n.kind === 'skill') {
      var col = getWorldColour(n.world);
      var alpha = masteryAlpha(n.mastery || 0);
      var r = 22 + (n.mastery || 0) * 0.07;
      var dim2 = hoveredId && hoveredId !== n.id && (typeof megaEdgeMap === 'undefined' || !isLinked(hoveredId, n.id)) ? 0.4 : 1;
      svg += '<g class="mega-node mega-skill" data-id="' + escapeAttr(n.id) + '" data-world="' + escapeAttr(n.world) + '" style="cursor:pointer;opacity:' + dim2 + '">';
      svg += '<circle cx="' + pos.x + '" cy="' + pos.y + '" r="' + r + '" fill="' + col + '" fill-opacity="' + alpha + '" stroke="' + col + '" stroke-width="2"/>';
      svg += '<text x="' + pos.x + '" y="' + (pos.y + 6) + '" text-anchor="middle" font-size="18">' + n.emoji + '</text>';
      if (n.mastery >= 80) {
        svg += '<text x="' + (pos.x + 18) + '" y="' + (pos.y - 16) + '" font-size="14">⭐</text>';
      }
      svg += '</g>';
    } else if (n.kind === 'phenomenon') {
      var unlocked = !!n.unlocked;
      var pcol = unlocked ? '#ffd700' : '#7a6b9a';
      var alpha2 = unlocked ? 0.9 : 0.4;
      var dim3 = hoveredId && hoveredId !== n.id && !isLinked(hoveredId, n.id) ? 0.4 : 1;
      svg += '<g class="mega-node mega-phen" data-id="' + escapeAttr(n.id) + '" data-thread="' + escapeAttr(n.threadId || '') + '" style="cursor:pointer;opacity:' + dim3 + '">';
      svg += '<circle cx="' + pos.x + '" cy="' + pos.y + '" r="26" fill="' + pcol + '" fill-opacity="' + (alpha2 * 0.3) + '" stroke="' + pcol + '" stroke-width="2" stroke-dasharray="' + (unlocked ? '0' : '3 3') + '"/>';
      svg += '<text x="' + pos.x + '" y="' + (pos.y + 8) + '" text-anchor="middle" font-size="22">' + n.emoji + '</text>';
      svg += '<text x="' + pos.x + '" y="' + (pos.y + 48) + '" text-anchor="middle" font-size="11" fill="' + (unlocked ? '#fff' : '#b8a9d4') + '" font-weight="600">' + escapeAttr(n.label) + '</text>';
      svg += '</g>';
    }
  });
  return svg;
}

// === Edge index for hover-highlight ===
var megaEdgeMap = {};   // id -> Set of connected ids

function buildEdgeIndex(edges) {
  megaEdgeMap = {};
  edges.forEach(function(e) {
    if (!megaEdgeMap[e.from]) megaEdgeMap[e.from] = {};
    if (!megaEdgeMap[e.to]) megaEdgeMap[e.to] = {};
    megaEdgeMap[e.from][e.to] = true;
    megaEdgeMap[e.to][e.from] = true;
  });
}

function isLinked(a, b) {
  if (!a || !b) return false;
  if (a === b) return true;
  return !!(megaEdgeMap[a] && megaEdgeMap[a][b]);
}

// ============================================================
//  Public: render the mega map screen
// ============================================================
var _hoveredNodeId = null;

function renderMegaMap() {
  var container = document.getElementById('mega-map-content');
  if (!container) return;

  var nodes = getMegaNodes();
  var edges = buildMegaEdges();
  buildEdgeIndex(edges);
  var positions = layoutMega(nodes);

  // Stats
  var skillNodes = nodes.filter(function(n) { return n.kind === 'skill'; });
  var mastered = skillNodes.filter(function(n) { return n.mastery >= 80; }).length;
  var attempted = skillNodes.filter(function(n) { return n.attempts > 0; }).length;
  var threadsUnlocked = nodes.filter(function(n) { return n.kind === 'phenomenon' && n.unlocked; }).length;

  var legendHtml = '<div class="mega-legend">';
  MEGA_WORLDS.forEach(function(w) {
    legendHtml += '<span class="mega-legend-chip" style="background:' + w.colour + '22;border-color:' + w.colour + '88;color:' + w.colour + '">' + w.emoji + ' ' + w.label + '</span>';
  });
  legendHtml += '<span class="mega-legend-chip" style="background:#ffd70022;border-color:#ffd70088;color:#ffd700">⭐ Real-World Adventure</span>';
  legendHtml += '</div>';

  var statsHtml = '<div class="mega-stats">' +
    '<div class="mega-stat"><b>' + attempted + '</b>/' + skillNodes.length + ' explored</div>' +
    '<div class="mega-stat"><b>' + mastered + '</b> mastered ⭐</div>' +
    '<div class="mega-stat"><b>' + threadsUnlocked + '</b>/' + nodes.filter(function(n) { return n.kind === 'phenomenon'; }).length + ' adventures unlocked</div>' +
    '</div>';

  var svg = '<svg id="mega-map-svg" viewBox="0 0 ' + VIEW + ' ' + VIEW + '" xmlns="http://www.w3.org/2000/svg">';
  svg += '<defs><radialGradient id="megaCentreGlow"><stop offset="0%" stop-color="#ffd700" stop-opacity="0.4"/><stop offset="60%" stop-color="#b57bff" stop-opacity="0.1"/><stop offset="100%" stop-color="#0f0b2e" stop-opacity="0"/></radialGradient></defs>';
  svg += '<circle cx="' + CENTRE + '" cy="' + CENTRE + '" r="' + (PHENOMENON_RADIUS + 30) + '" fill="url(#megaCentreGlow)"/>';
  svg += '<circle cx="' + CENTRE + '" cy="' + CENTRE + '" r="50" fill="#251b5e" stroke="#ffd700" stroke-width="2"/>';
  svg += '<text x="' + CENTRE + '" y="' + (CENTRE - 4) + '" text-anchor="middle" font-size="26">✨</text>';
  svg += '<text x="' + CENTRE + '" y="' + (CENTRE + 20) + '" text-anchor="middle" font-size="11" fill="#ffd700" font-weight="700">Nasworld</text>';
  svg += buildEdgesSvg(edges, positions, _hoveredNodeId);
  svg += buildNodesSvg(nodes, positions, _hoveredNodeId);
  svg += '</svg>';

  var detailHtml = '<div id="mega-detail" class="mega-detail">Hover a node to see what it connects to. Tap a skill to play, or tap a glowing adventure to start a real-world quest.</div>';

  container.innerHTML = legendHtml + statsHtml + '<div class="mega-canvas">' + svg + '</div>' + detailHtml;

  // Wire up interactions
  var svgEl = document.getElementById('mega-map-svg');
  if (!svgEl) return;

  var nodeEls = svgEl.querySelectorAll('.mega-node');
  nodeEls.forEach(function(el) {
    el.addEventListener('mouseenter', function() {
      _hoveredNodeId = el.dataset.id;
      // Light re-render of just the detail panel — cheaper than full re-render
      var node = nodes.find(function(n) { return n.id === _hoveredNodeId; });
      if (node) showMegaDetail(node);
      // Re-render once with new hover state
      renderMegaMap();
    });
    el.addEventListener('mouseleave', function() {
      _hoveredNodeId = null;
    });
    el.addEventListener('click', function(e) {
      e.stopPropagation();
      var id = el.dataset.id;
      var node = nodes.find(function(n) { return n.id === id; });
      if (!node) return;

      if (node.kind === 'world') {
        var worldScreen = { math: 'math-world', word: 'word-world', stem: 'stem-world', malay: 'malay-world' }[node.id];
        if (worldScreen && typeof showScreen === 'function') showScreen(worldScreen);
      } else if (node.kind === 'skill') {
        var w = getSkillWorld(node.id);
        if (w && typeof openSkillView === 'function') openSkillView(node.id, w);
      } else if (node.kind === 'phenomenon') {
        var threadId = node.threadId || el.dataset.thread;
        if (threadId && typeof openThreadView === 'function') openThreadView(threadId);
      }
    });
  });
}

function showMegaDetail(node) {
  var d = document.getElementById('mega-detail');
  if (!d) return;
  if (node.kind === 'world') {
    d.innerHTML = '<b style="color:' + node.colour + '">' + node.emoji + ' ' + node.label + '</b><br><span>' + node.desc + '</span>';
  } else if (node.kind === 'skill') {
    var related = skillToPhenomena(node.id);
    var relList = related.map(function(p) { return p.emoji + ' ' + p.label; }).join(' · ');
    var mast = '<b style="color:#ffd700">' + (node.mastery || 0) + '% mastery</b>';
    d.innerHTML = '<b>' + node.emoji + ' ' + node.label + '</b> &nbsp; ' + mast +
      '<br><span>' + node.desc + '</span>' +
      (relList ? '<br><span style="color:#ffd700">Used in: ' + relList + '</span>' : '');
  } else if (node.kind === 'phenomenon') {
    var status = node.unlocked ? '<b style="color:#ffd700">Unlocked!</b>' : '<b style="color:#b8a9d4">Touch skills in 2 worlds to unlock</b>';
    d.innerHTML = '<b>' + node.emoji + ' ' + node.label + '</b> &nbsp; ' + status + '<br><span>' + node.desc + '</span>';
  }
}

// ============================================================
//  Thread view — opens a chapter-by-chapter real-world story
// ============================================================

function openThreadView(threadId) {
  var thread = THREADS[threadId];
  if (!thread) return;

  var screen = document.getElementById('screen-thread');
  var content = document.getElementById('thread-content');
  if (!screen || !content) return;

  var st = getThreadState(threadId);
  if (!st.unlocked) {
    content.innerHTML = '<div class="thread-locked">' +
      '<div style="font-size:54px">🔒</div>' +
      '<h3>' + thread.emoji + ' ' + thread.title + '</h3>' +
      '<p>' + thread.blurb + '</p>' +
      '<p style="color:#b8a9d4;margin-top:14px">Try a skill in any two worlds to unlock this adventure.</p>' +
      '<button class="lesson-btn" onclick="showScreen(\'mega-map\')">Back to Map</button>' +
      '</div>';
    if (typeof showScreen === 'function') showScreen('thread');
    return;
  }

  var html = '<button class="back-btn" onclick="showScreen(\'mega-map\')">← Back to Map</button>';
  html += '<div class="thread-hero" style="border-color:' + thread.colour + '">';
  html += '<div class="thread-hero-emoji">' + thread.emoji + '</div>';
  html += '<h2>' + thread.title + '</h2>';
  html += '<p>' + thread.blurb + '</p>';
  html += '</div>';

  html += '<div class="thread-chapters">';
  thread.chapters.forEach(function(ch) {
    var done = st.completedChapters.indexOf(ch.id) !== -1;
    var current = ch.id === st.currentChapter && !done;
    var locked = ch.id > st.currentChapter;
    var stateClass = done ? 'done' : (current ? 'current' : (locked ? 'locked' : ''));
    html += '<div class="thread-chapter ' + stateClass + '">';
    html += '<div class="thread-chapter-num">' + (done ? '✓' : ch.id) + '</div>';
    html += '<div class="thread-chapter-body">';
    html += '<div class="thread-chapter-title">' + ch.title + '</div>';
    html += '<div class="thread-chapter-scene">' + ch.scene + '</div>';
    html += '<div class="thread-chapter-action">' + ch.action + '</div>';
    if (!locked) {
      html += '<div class="thread-chapter-buttons">';
      html += '<button class="lesson-btn" onclick="threadGoToSkill(\'' + ch.skill + '\',\'' + ch.worldType + '\')">Open ' + (typeof getSkillName === 'function' ? getSkillName(ch.skill) : ch.skill) + ' →</button>';
      if (current) {
        html += '<button class="lesson-btn lesson-btn-done" onclick="threadMarkChapterDone(\'' + threadId + '\')">Mark Chapter Done +5⭐</button>';
      }
      html += '</div>';
    }
    html += '</div>';
    html += '</div>';
  });
  html += '</div>';

  content.innerHTML = html;
  if (typeof showScreen === 'function') showScreen('thread');
}

function threadGoToSkill(skillId, worldType) {
  if (typeof openSkillView === 'function') openSkillView(skillId, worldType);
}

function threadMarkChapterDone(threadId) {
  if (typeof completeThreadChapter === 'function') completeThreadChapter(threadId);
  if (typeof playSound === 'function') playSound('levelup');
  if (typeof spawnParticles === 'function') {
    spawnParticles(window.innerWidth / 2, window.innerHeight / 3, 8, '⭐');
  }
  openThreadView(threadId);
}

function getSkillName(skillId) {
  var trees = [
    typeof MATH_TREE  !== 'undefined' ? MATH_TREE  : {},
    typeof WORD_TREE  !== 'undefined' ? WORD_TREE  : {},
    typeof STEM_TREE  !== 'undefined' ? STEM_TREE  : {},
    typeof MALAY_TREE !== 'undefined' ? MALAY_TREE : {}
  ];
  for (var i = 0; i < trees.length; i++) {
    if (trees[i][skillId]) return trees[i][skillId].name;
  }
  return skillId;
}

// Expose to global so navigation/onclick handlers can reach them
window.renderMegaMap = renderMegaMap;
window.openThreadView = openThreadView;
window.threadGoToSkill = threadGoToSkill;
window.threadMarkChapterDone = threadMarkChapterDone;
window.getSkillName = getSkillName;

})();
