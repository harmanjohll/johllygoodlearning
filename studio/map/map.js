/* =========================================================
   /studio/map/map.js
   Mega concept map. Deterministic radial layout built with D3.
   Two modes: Deductive (themes outward) and Inductive (phenomenon up).
   Coach sidebar probes via shared/gemini.js; falls back to a
   deterministic scaffold when no key is set.
   ========================================================= */

const THEME_COLOURS = {
  diversity:    '#10b981',
  cycles:       '#3b82f6',
  systems:      '#a78bfa',
  interactions: '#f87171',
  energy:       '#f59e0b',
};

const STATE = {
  mode: 'deductive', // 'deductive' | 'inductive'
  data: null,        // loaded mega.json
  nodesById: null,
  edgesByNode: null,
  themeToTopics: null,
  topicToPhenomena: null,
  expanded: new Set(), // theme ids currently expanded
  focusId: null,
  size: { w: 0, h: 0 },
};

const svg = d3.select('#map-svg');
const tooltip = document.getElementById('tooltip');

function loadMega() {
  // Resolve relative to /studio/map/
  return fetch('../shared/content/mega.json', { cache: 'no-cache' })
    .then(r => r.ok ? r.json() : Promise.reject(new Error('mega.json fetch failed')))
    .catch(err => { console.error('[map] cannot load mega.json', err); return null; });
}

function indexData(data) {
  const themes = data.themes.map(t => ({ ...t, kind: 'theme' }));
  const topics = data.topics.map(t => ({ ...t, kind: 'topic' }));
  const phenomena = data.phenomena.map(p => ({ ...p, kind: 'phenomenon' }));

  const nodesById = new Map();
  themes.forEach(n => nodesById.set(n.id, n));
  topics.forEach(n => nodesById.set(n.id, n));
  phenomena.forEach(n => nodesById.set(n.id, n));

  const themeToTopics = new Map();
  themes.forEach(t => themeToTopics.set(t.id, []));
  topics.forEach(t => {
    if (themeToTopics.has(t.theme)) themeToTopics.get(t.theme).push(t.id);
  });

  const topicToPhenomena = new Map();
  topics.forEach(t => topicToPhenomena.set(t.id, []));
  phenomena.forEach(p => {
    (p.topics || []).forEach(tid => {
      if (topicToPhenomena.has(tid)) topicToPhenomena.get(tid).push(p.id);
    });
  });

  const edgesByNode = new Map();
  const addEdge = (a, e) => {
    if (!edgesByNode.has(a)) edgesByNode.set(a, []);
    edgesByNode.get(a).push(e);
  };
  (data.edges || []).forEach(e => {
    if (!nodesById.has(e.from) || !nodesById.has(e.to)) return;
    addEdge(e.from, e);
    addEdge(e.to, e);
  });

  STATE.data = { themes, topics, phenomena, edges: data.edges || [] };
  STATE.nodesById = nodesById;
  STATE.themeToTopics = themeToTopics;
  STATE.topicToPhenomena = topicToPhenomena;
  STATE.edgesByNode = edgesByNode;
}

function nodeTheme(node) {
  if (!node) return null;
  if (node.kind === 'theme')  return node.id;
  if (node.kind === 'topic')  return node.theme;
  if (node.kind === 'phenomenon') {
    const first = (node.topics || [])[0];
    const t = STATE.nodesById.get(first);
    return t ? t.theme : null;
  }
  return null;
}

function nodeColour(node) {
  const t = nodeTheme(node);
  return THEME_COLOURS[t] || '#94a3b8';
}

function layout() {
  const { width, height } = svg.node().getBoundingClientRect();
  STATE.size.w = width;
  STATE.size.h = height;
  const cx = width / 2, cy = height / 2;

  const themes = STATE.data.themes;
  const nThemes = themes.length;
  const rTheme = Math.min(width, height) * 0.14;
  const rTopic = Math.min(width, height) * 0.30;
  const rPhen  = Math.min(width, height) * 0.45;

  // Themes at even angles round the circle
  themes.forEach((t, i) => {
    const a = (i / nThemes) * Math.PI * 2 - Math.PI / 2;
    t._x = cx + rTheme * Math.cos(a);
    t._y = cy + rTheme * Math.sin(a);
    t._angle = a;
  });

  // Topics: fan out around their theme's angle
  STATE.data.topics.forEach(t => {
    const theme = STATE.nodesById.get(t.theme);
    const siblings = STATE.themeToTopics.get(t.theme) || [];
    const idx = siblings.indexOf(t.id);
    const n = siblings.length;
    const spread = Math.PI / 2.2; // ~80 deg fan
    const start = theme._angle - spread / 2;
    const a = n > 1 ? start + (idx / (n - 1)) * spread : theme._angle;
    t._x = cx + rTopic * Math.cos(a);
    t._y = cy + rTopic * Math.sin(a);
    t._angle = a;
  });

  // Phenomena: place around their first topic
  STATE.data.phenomena.forEach(p => {
    const primaryId = (p.topics || [])[0];
    const primary = STATE.nodesById.get(primaryId);
    const siblings = STATE.topicToPhenomena.get(primaryId) || [];
    const idx = siblings.indexOf(p.id);
    const n = siblings.length;
    const spread = Math.PI / 4; // ~45 deg fan from the topic
    const base = primary ? primary._angle : 0;
    const start = base - spread / 2;
    const a = n > 1 ? start + (idx / (n - 1)) * spread : base;
    p._x = cx + rPhen * Math.cos(a);
    p._y = cy + rPhen * Math.sin(a);
  });
}

function isVisible(node) {
  if (node.kind === 'theme') return true;
  if (STATE.mode === 'inductive') {
    // In inductive mode, keep everything rendered but dim by default.
    return true;
  }
  // Deductive mode
  if (node.kind === 'topic') {
    return STATE.expanded.has(node.theme);
  }
  if (node.kind === 'phenomenon') {
    // Visible if any of its topics' themes is expanded AND the topic itself is expanded (focus).
    return (node.topics || []).some(tid => {
      const topic = STATE.nodesById.get(tid);
      return topic && STATE.expanded.has(topic.theme) && STATE.expanded.has(tid);
    });
  }
  return true;
}

function nodesOnScreen() {
  const out = [];
  out.push(...STATE.data.themes);
  out.push(...STATE.data.topics);
  out.push(...STATE.data.phenomena);
  return out;
}

function edgesForRender() {
  const edges = [];
  // Hierarchy edges: theme → topic, topic → phenomenon
  STATE.data.topics.forEach(t => {
    edges.push({ from: t.theme, to: t.id, type: 'is-a', _hier: true });
  });
  STATE.data.phenomena.forEach(p => {
    (p.topics || []).forEach(tid => {
      if (STATE.nodesById.has(tid)) edges.push({ from: tid, to: p.id, type: 'example-of', _hier: true });
    });
  });
  // Typed edges from data
  (STATE.data.edges || []).forEach(e => edges.push({ ...e, _hier: false }));
  return edges;
}

function isCrossThemeEdge(edge) {
  const a = nodeTheme(STATE.nodesById.get(edge.from));
  const b = nodeTheme(STATE.nodesById.get(edge.to));
  return a && b && a !== b;
}

function connectedIds(id) {
  const ids = new Set([id]);
  (STATE.edgesByNode.get(id) || []).forEach(e => {
    ids.add(e.from); ids.add(e.to);
  });
  const node = STATE.nodesById.get(id);
  if (node) {
    if (node.kind === 'theme') {
      (STATE.themeToTopics.get(id) || []).forEach(tid => ids.add(tid));
    } else if (node.kind === 'topic') {
      ids.add(node.theme);
      (STATE.topicToPhenomena.get(id) || []).forEach(pid => ids.add(pid));
    } else if (node.kind === 'phenomenon') {
      (node.topics || []).forEach(tid => {
        ids.add(tid);
        const t = STATE.nodesById.get(tid);
        if (t) ids.add(t.theme);
      });
    }
  }
  return ids;
}

function render() {
  layout();

  const allNodes = nodesOnScreen();
  const edges = edgesForRender();

  // Edges
  const edgeSel = svg.selectAll('g.edges').data([0]);
  const edgeG = edgeSel.enter().append('g').attr('class', 'edges').merge(edgeSel);

  const edgeLine = edgeG.selectAll('path.edge').data(edges, e => e.from + '\u2192' + e.to);
  edgeLine.exit().remove();
  const edgeEnter = edgeLine.enter().append('path').attr('class', e => 'edge' + (isCrossThemeEdge(e) ? ' cross' : ''));
  edgeEnter.merge(edgeLine)
    .attr('class', e => 'edge' + (isCrossThemeEdge(e) ? ' cross' : ''))
    .attr('stroke', e => {
      const a = STATE.nodesById.get(e.from);
      return nodeColour(a);
    })
    .attr('d', e => {
      const a = STATE.nodesById.get(e.from);
      const b = STATE.nodesById.get(e.to);
      if (!a || !b) return '';
      const isCross = isCrossThemeEdge(e);
      if (isCross) {
        const mx = (a._x + b._x) / 2, my = (a._y + b._y) / 2;
        const dx = b._x - a._x, dy = b._y - a._y;
        const nx = -dy, ny = dx;
        const len = Math.hypot(nx, ny) || 1;
        const curve = 38;
        return `M${a._x},${a._y} Q${mx + (nx / len) * curve},${my + (ny / len) * curve} ${b._x},${b._y}`;
      }
      return `M${a._x},${a._y} L${b._x},${b._y}`;
    })
    .attr('data-from', e => e.from)
    .attr('data-to', e => e.to);

  // Nodes
  const nodeSel = svg.selectAll('g.nodes').data([0]);
  const nodeG = nodeSel.enter().append('g').attr('class', 'nodes').merge(nodeSel);

  const nodes = nodeG.selectAll('g.node').data(allNodes, d => d.id);
  nodes.exit().remove();
  const nodeEnter = nodes.enter().append('g').attr('class', 'node');
  nodeEnter.append('circle');
  nodeEnter.append('text').attr('text-anchor', 'middle');

  const all = nodeEnter.merge(nodes);
  all
    .attr('transform', d => `translate(${d._x}, ${d._y})`)
    .attr('data-id', d => d.id)
    .attr('data-kind', d => d.kind)
    .on('mouseenter', onHover)
    .on('mouseleave', onHoverEnd)
    .on('click', onClick);

  all.select('circle')
    .attr('r', d => d.kind === 'theme' ? 26 : d.kind === 'topic' ? 15 : 7)
    .attr('fill', d => d.kind === 'theme' ? '#0b1220' : '#101a2e')
    .attr('stroke', d => nodeColour(d));

  all.select('text')
    .attr('dy', d => d.kind === 'theme' ? 4 : (d.kind === 'topic' ? 30 : 18))
    .attr('font-size', d => d.kind === 'theme' ? 13 : d.kind === 'topic' ? 11 : 9)
    .attr('font-weight', d => d.kind === 'theme' ? 800 : 600)
    .text(d => d.label);

  applyVisibility();
}

function applyVisibility() {
  svg.selectAll('g.node').each(function (d) {
    const el = d3.select(this);
    const visible = isVisible(d);
    el.style('display', visible ? null : 'none');
  });

  // Dim state: in deductive mode, non-expanded branches stay dim
  svg.selectAll('g.node').classed('dim', false).classed('focus', false);
  svg.selectAll('path.edge').classed('dim', false).classed('active', false);

  if (STATE.focusId) {
    const ids = connectedIds(STATE.focusId);
    svg.selectAll('g.node').each(function (d) {
      const on = ids.has(d.id);
      d3.select(this).classed('dim', !on).classed('focus', d.id === STATE.focusId);
    });
    svg.selectAll('path.edge').each(function (e) {
      const on = ids.has(e.from) && ids.has(e.to);
      d3.select(this).classed('active', on).classed('dim', !on);
    });
  } else if (STATE.mode === 'inductive') {
    svg.selectAll('g.node').filter(d => d.kind !== 'phenomenon').classed('dim', true);
  }
}

function onHover(_, d) {
  const rect = svg.node().getBoundingClientRect();
  const x = d._x + 14;
  const y = d._y + 14;
  tooltip.style.left = x + 'px';
  tooltip.style.top  = y + 'px';
  tooltip.innerHTML = `<div class="tt-kind">${d.kind}</div><div class="tt-title">${d.label}</div>${d.tagline ? '<div>' + d.tagline + '</div>' : ''}`;
  tooltip.classList.add('show');
  tooltip.setAttribute('aria-hidden', 'false');
}

function onHoverEnd() {
  tooltip.classList.remove('show');
  tooltip.setAttribute('aria-hidden', 'true');
}

function onClick(_, d) {
  STATE.focusId = d.id;
  if (STATE.mode === 'deductive') {
    if (d.kind === 'theme') {
      if (STATE.expanded.has(d.id)) STATE.expanded.delete(d.id);
      else STATE.expanded.add(d.id);
    } else if (d.kind === 'topic') {
      STATE.expanded.add(d.theme);
      if (STATE.expanded.has(d.id)) STATE.expanded.delete(d.id);
      else STATE.expanded.add(d.id);
    } else if (d.kind === 'phenomenon') {
      (d.topics || []).forEach(tid => {
        const t = STATE.nodesById.get(tid);
        if (t) { STATE.expanded.add(t.theme); STATE.expanded.add(t.id); }
      });
    }
  } else {
    // inductive mode: clicking any node collapses to its upward trace
    if (d.kind === 'phenomenon') {
      STATE.expanded.clear();
      (d.topics || []).forEach(tid => {
        const t = STATE.nodesById.get(tid);
        if (t) { STATE.expanded.add(t.theme); STATE.expanded.add(t.id); }
      });
    }
  }
  applyVisibility();
  updateCoach(d);
}

function setMode(mode) {
  STATE.mode = mode;
  STATE.expanded.clear();
  STATE.focusId = null;
  document.getElementById('mode-deductive').classList.toggle('active', mode === 'deductive');
  document.getElementById('mode-inductive').classList.toggle('active', mode === 'inductive');
  document.getElementById('mode-deductive').setAttribute('aria-pressed', mode === 'deductive');
  document.getElementById('mode-inductive').setAttribute('aria-pressed', mode === 'inductive');
  if (mode === 'deductive') {
    STATE.data.themes.forEach(t => STATE.expanded.add(t.id));
  }
  applyVisibility();
  resetCoach();
}

function resetAll() {
  STATE.focusId = null;
  STATE.expanded.clear();
  if (STATE.mode === 'deductive') {
    STATE.data.themes.forEach(t => STATE.expanded.add(t.id));
  }
  applyVisibility();
  resetCoach();
}

// ════════ Coach panel ════════
const coachFocus = document.getElementById('coach-focus');
const coachProbe = document.getElementById('coach-probe');
const coachRegen = document.getElementById('coach-regen');
document.getElementById('coach-settings').addEventListener('click', () => window.JglLab && window.JglLab.openSettings());
document.getElementById('foot-settings-link').addEventListener('click', (e) => { e.preventDefault(); window.JglLab && window.JglLab.openSettings(); });
coachRegen.addEventListener('click', () => { if (STATE.focusId) renderCoachProbe(STATE.nodesById.get(STATE.focusId), true); });

function resetCoach() {
  coachFocus.innerHTML = `
    <div class="focus-kind">Nothing selected</div>
    <div class="focus-label">Hover or click a theme, topic, or phenomenon</div>
    <div class="focus-tagline">In Deductive mode, click a theme to fan out its topics and phenomena. In Inductive mode, click a phenomenon to trace up to the topics and theme it belongs to.</div>
  `;
  coachProbe.innerHTML = '<span class="probe-label">Coach probe</span><span class="probe-empty">Pick a node to see a probing question.</span>';
  coachRegen.disabled = true;
}

function updateCoach(node) {
  if (!node) return resetCoach();
  const themeLabel = THEME_COLOURS[nodeTheme(node)] ? (STATE.nodesById.get(nodeTheme(node))?.label || '') : '';
  const tagline = node.kind === 'theme' ? (node.tagline || '')
    : node.kind === 'topic' ? `Part of ${themeLabel}`
    : `Observed in ${(node.topics || []).map(t => STATE.nodesById.get(t)?.label).filter(Boolean).join(', ') || 'multiple topics'}`;
  const deepHref = node.kind === 'topic' ? `../topics/${node.id}/index.html`
    : node.kind === 'theme' ? `../index.html#theme-${node.id}`
    : '';
  coachFocus.innerHTML = `
    <div class="focus-kind">${node.kind}</div>
    <div class="focus-label">${escapeHtml(node.label)}</div>
    <div class="focus-tagline">${escapeHtml(tagline)}</div>
    ${deepHref ? `<a class="focus-deeplink" href="${deepHref}">Open \u2192</a>` : ''}
  `;
  coachRegen.disabled = false;
  renderCoachProbe(node, false);
}

function fallbackProbe(node) {
  const mode = STATE.mode;
  if (node.kind === 'theme') {
    return mode === 'deductive'
      ? `You have opened ${node.label}. Pick one topic under it. In one sentence, why does it belong to ${node.label} rather than another theme?`
      : `${node.label} is the theme above many topics. Name one phenomenon you would expect under ${node.label}, and one you would not.`;
  }
  if (node.kind === 'topic') {
    const themeName = STATE.nodesById.get(node.theme)?.label || node.theme;
    const phens = (STATE.topicToPhenomena.get(node.id) || []).map(id => STATE.nodesById.get(id)?.label).filter(Boolean);
    const one = phens[0] || 'one observation you have seen';
    return `${node.label} sits under ${themeName}. Think about "${one}". In one sentence, what makes this an example of ${node.label}?`;
  }
  // phenomenon
  const topicLabels = (node.topics || []).map(id => STATE.nodesById.get(id)?.label).filter(Boolean);
  const first = topicLabels[0] || 'its topic';
  return `You picked the observation: "${node.label}". Which scientific idea from ${first} explains why this happens? Start your sentence with the key term.`;
}

async function renderCoachProbe(node, regen) {
  const base = fallbackProbe(node);
  coachProbe.innerHTML = '<span class="probe-label">Coach probe</span>' + escapeHtml(base);
  if (!window.askGemini) return;
  const key = (window.JglStorage && window.JglStorage.getGeminiKey && window.JglStorage.getGeminiKey()) ||
              localStorage.getItem('sciLab_gemini_key') || localStorage.getItem('jgl.geminiKey') || '';
  if (!key) return; // fallback only

  const voice = (window.JglCoach && window.JglCoach.VOICE) || '';
  const direction = STATE.mode === 'deductive'
    ? 'The student is moving from the general to the specific.'
    : 'The student is moving from a concrete observation back to the principle.';
  const context = [
    `Node kind: ${node.kind}`,
    `Node label: ${node.label}`,
    node.tagline ? `Tagline: ${node.tagline}` : '',
    node.kind === 'topic' ? `Theme: ${STATE.nodesById.get(node.theme)?.label}` : '',
    node.kind === 'phenomenon' ? `Related topics: ${(node.topics || []).map(id => STATE.nodesById.get(id)?.label).filter(Boolean).join(', ')}` : '',
    `Traversal direction: ${direction}`,
  ].filter(Boolean).join('\n');
  const system = voice + '\nYou are probing a Primary 6 student studying for PSLE Science. Reply with ONE short probing question (1 to 2 sentences). No preamble, no bullet lists, no "great job".';
  const prompt = `${context}\n\nWrite one short probing question tailored to this node and direction.${regen ? ' Vary it from any previous question on this node.' : ''}`;
  coachProbe.innerHTML = '<span class="probe-label">Coach probe</span><span style="opacity:.6">Thinking...</span>';
  try {
    const text = await window.askGemini({ system, prompt, temperature: regen ? 0.85 : 0.6, maxTokens: 140 });
    coachProbe.innerHTML = '<span class="probe-label">Coach probe</span>' + escapeHtml((text || base).trim());
  } catch (err) {
    coachProbe.innerHTML = `<span class="probe-label">Coach probe</span>${escapeHtml(base)}<br><span class="probe-error">(${escapeHtml(err.message || 'AI unavailable')})</span>`;
  }
}

function escapeHtml(s) {
  return String(s || '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

// ════════ Mobile fallback list ════════
function renderMobileList() {
  const list = document.getElementById('mobile-list');
  list.setAttribute('aria-hidden', 'false');
  let html = '<h3>Themes &amp; topics</h3>';
  STATE.data.themes.forEach(theme => {
    html += `<div style="font-weight:700;color:${THEME_COLOURS[theme.id]};margin-top:.5rem">${escapeHtml(theme.label)}</div>`;
    html += '<ul>';
    (STATE.themeToTopics.get(theme.id) || []).forEach(tid => {
      const t = STATE.nodesById.get(tid);
      if (!t) return;
      html += `<li><a href="../topics/${t.id}/index.html">${escapeHtml(t.label)}</a></li>`;
    });
    html += '</ul>';
  });
  list.innerHTML = html;
}

// ════════ Bootstrap ════════
async function init() {
  const tStart = performance.now();
  const data = await loadMega();
  if (!data) {
    coachProbe.innerHTML = '<span class="probe-label">Error</span> Mega map data could not be loaded.';
    return;
  }
  indexData(data);
  STATE.data.themes.forEach(t => STATE.expanded.add(t.id));

  document.getElementById('mode-deductive').addEventListener('click', () => setMode('deductive'));
  document.getElementById('mode-inductive').addEventListener('click', () => setMode('inductive'));
  document.getElementById('reset-btn').addEventListener('click', resetAll);

  render();
  renderMobileList();

  window.addEventListener('resize', () => {
    render();
    if (STATE.focusId) updateCoach(STATE.nodesById.get(STATE.focusId));
  });

  const elapsed = performance.now() - tStart;
  console.info(`[map] initial render in ${elapsed.toFixed(1)}ms (${STATE.nodesById.size} nodes)`);
}

init();
