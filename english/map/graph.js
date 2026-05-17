/* =========================================================
   /english/map/graph.js
   Force-directed mega map for PSLE English.
   - All nodes loaded once from /english/shared/content/mega.json.
   - Force sim runs, settles, and stays settled.
   - Nodes are draggable (positions pinned + persisted to
     jgl.progress.mega.layout).
   - Click only toggles a focus highlight via CSS classes —
     no rebuild, no flicker.
   - Pattern lifted verbatim from /malay/map/graph.js (same engine).
   Exposes window.MM.api for the sidebar coach to call.
   ========================================================= */

(function () {
  const THEME_COLOURS = {
    composition:   '#fb7185',
    grammar:       '#34d399',
    vocab:         '#fbbf24',
    comprehension: '#60a5fa',
    oral:          '#e879f9',
  };

  const STATE = window.MM = {
    data: null,
    nodes: [],
    links: [],
    nodesById: new Map(),
    edgesByNode: new Map(),
    sim: null,
    focusId: null,
    search: '',
    transform: d3.zoomIdentity,
    viewport: { w: 0, h: 0 },
    api: {},
  };

  const svg     = d3.select('#svg');
  const tooltip = document.getElementById('tooltip');
  const rootG   = svg.append('g').attr('class', 'root');
  const edgeG   = rootG.append('g').attr('class', 'edges');
  const nodeG   = rootG.append('g').attr('class', 'nodes');

  function setViewport() {
    const r = svg.node().getBoundingClientRect();
    STATE.viewport.w = r.width;
    STATE.viewport.h = r.height;
  }

  async function loadMega() {
    const r = await fetch('../shared/content/mega.json', { cache: 'no-cache' });
    if (!r.ok) throw new Error('mega.json fetch failed');
    return r.json();
  }

  // ── Persistent layout (jgl.progress.mega.layout) ─────────
  function readLayout() {
    try { return (window.JglStorage.getProgress().mega || {}).layout || {}; }
    catch { return {}; }
  }
  function saveLayout(id, patch) {
    if (!window.JglStorage) return;
    window.JglStorage.update(p => {
      p.mega = p.mega || {};
      p.mega.layout = p.mega.layout || {};
      p.mega.layout[id] = { ...(p.mega.layout[id] || {}), ...patch };
      return p;
    });
  }
  function clearAllPins() {
    if (!window.JglStorage) return;
    window.JglStorage.update(p => {
      if (p.mega && p.mega.layout) {
        Object.values(p.mega.layout).forEach(v => { delete v.fx; delete v.fy; });
      }
      return p;
    });
  }

  // ── Build graph from mega.json ───────────────────────────
  function buildGraph() {
    STATE.nodes = [];
    STATE.links = [];
    STATE.nodesById.clear();
    STATE.edgesByNode.clear();

    const layout = readLayout();
    const cx = STATE.viewport.w / 2, cy = STATE.viewport.h / 2;
    const shortSide = Math.min(STATE.viewport.w, STATE.viewport.h) || 720;
    const rTheme = Math.max(180, shortSide * 0.22);
    const rTopic = Math.max(330, shortSide * 0.42);
    const rPhen  = Math.max(500, shortSide * 0.66);

    function addNode(n) {
      const saved = layout[n.id] || {};
      if (typeof saved.x === 'number') n.x = saved.x;
      if (typeof saved.y === 'number') n.y = saved.y;
      if (typeof saved.fx === 'number') n.fx = saved.fx;
      if (typeof saved.fy === 'number') n.fy = saved.fy;
      STATE.nodes.push(n);
      STATE.nodesById.set(n.id, n);
    }

    // themes — ring 1
    const themeId = (k) => 'theme:' + k;
    const themes = STATE.data.themes;
    themes.forEach((t, i) => {
      const a = (i / themes.length) * Math.PI * 2 - Math.PI / 2;
      addNode({
        id: themeId(t.id), themeKey: t.id, kind: 'theme',
        label: t.label, tagline: t.tagline,
        x: cx + rTheme * Math.cos(a), y: cy + rTheme * Math.sin(a),
      });
    });

    // topics — ring 2, fan around parent theme
    STATE.data.topics.forEach(t => {
      const parent = STATE.nodesById.get(themeId(t.theme));
      const sibs = STATE.data.topics.filter(tt => tt.theme === t.theme);
      const idx  = sibs.indexOf(t);
      const spread = Math.PI / 2.4;
      const base = parent ? Math.atan2(parent.y - cy, parent.x - cx) : 0;
      const a = sibs.length > 1 ? base - spread / 2 + (idx / (sibs.length - 1)) * spread : base;
      addNode({
        id: t.id, kind: 'topic', label: t.label, theme: t.theme, link: t.link,
        x: cx + rTopic * Math.cos(a), y: cy + rTopic * Math.sin(a),
      });
    });

    // Compute which paper(s) each topic belongs to, so phenomena can
    // be tagged as cross-paper "bridges" (touching ≥2 of P1/P2/P3/P4).
    const TOPIC_TO_PAPER = {
      composition: 'P1', situational: 'P1',
      grammar: 'P2', vocab: 'P2', 'visual-text': 'P2', cloze: 'P2',
      editing: 'P2', synthesis: 'P2', comprehension: 'P2',
      listening: 'P3',
      'oral-reading': 'P4', 'oral-sbc': 'P4',
    };

    // phenomena — ring 3, fan around primary topic
    STATE.data.phenomena.forEach(p => {
      const primaryId = (p.topics || [])[0];
      const primary = STATE.nodesById.get(primaryId);
      const sibs = STATE.data.phenomena.filter(pp => (pp.topics || [])[0] === primaryId);
      const idx  = sibs.indexOf(p);
      const spread = Math.PI / 3;
      const base = primary ? Math.atan2(primary.y - cy, primary.x - cx) : 0;
      const a = sibs.length > 1 ? base - spread / 2 + (idx / (sibs.length - 1)) * spread : base;
      const papers = Array.from(new Set((p.topics || []).map(t => TOPIC_TO_PAPER[t]).filter(Boolean))).sort();
      addNode({
        id: p.id, kind: 'phenomenon', label: p.label,
        topics: p.topics || [], blurb: p.blurb || '',
        papers,                   // ['P1','P2','P4'] etc.
        isBridge: papers.length >= 2,
        x: cx + rPhen * Math.cos(a), y: cy + rPhen * Math.sin(a),
      });
    });

    // hierarchy links
    STATE.data.topics.forEach(t => {
      STATE.links.push({ source: themeId(t.theme), target: t.id, type: 'is-a', _hier: true });
    });
    STATE.data.phenomena.forEach(p => {
      (p.topics || []).forEach(tid => {
        if (STATE.nodesById.has(tid)) {
          STATE.links.push({ source: tid, target: p.id, type: 'example-of', _hier: true });
        }
      });
    });

    // typed cross-links
    (STATE.data.edges || []).forEach(e => {
      if (!STATE.nodesById.has(e.from) || !STATE.nodesById.has(e.to)) return;
      STATE.links.push({ source: e.from, target: e.to, type: e.type || 'links-to', reason: e.reason || '', _hier: false });
    });

    // Edge-per-node index
    STATE.links.forEach(l => {
      const s = typeof l.source === 'object' ? l.source.id : l.source;
      const t = typeof l.target === 'object' ? l.target.id : l.target;
      [s, t].forEach(id => {
        if (!STATE.edgesByNode.has(id)) STATE.edgesByNode.set(id, []);
        STATE.edgesByNode.get(id).push(l);
      });
    });
  }

  // ── Helpers ──────────────────────────────────────────────
  function nodeTheme(n) {
    if (!n) return null;
    if (n.kind === 'theme')      return n.themeKey;
    if (n.kind === 'topic')      return n.theme;
    if (n.kind === 'phenomenon') {
      const first = (n.topics || [])[0];
      const t = STATE.nodesById.get(first);
      return t ? t.theme : null;
    }
    return null;
  }
  function nodeColour(n) {
    return THEME_COLOURS[nodeTheme(n)] || '#94a3b8';
  }
  // Topic-only: dim the fill toward grey when mastery is low. Theme &
  // phenomenon nodes keep their themed dark fill. A 0% topic looks
  // muted grey; a 100% topic gets a saturated themed centre. Stroke
  // (the outer ring) stays full-colour so the topic remains identifiable.
  function topicMastery(n) {
    if (n.kind !== 'topic') return null;
    try {
      // `Progress` is declared as a top-level `const` in /malay/shared.js.
      // In non-module scripts, `const` lives in the global lexical scope —
      // accessible by bareword from any later script (including this IIFE)
      // but NOT visible as `window.Progress`. So we use a typeof guard.
      // eslint-disable-next-line no-undef
      if (typeof Progress === 'undefined') return 0;
      // eslint-disable-next-line no-undef
      return Progress.masteryPct(n.id) || 0;
    } catch { return 0; }
  }
  function nodeFill(n) {
    const baseDark = '#0d1a2e';
    if (n.kind !== 'topic') return baseDark;
    const pct = topicMastery(n);
    if (pct <= 0) return baseDark;
    // Interpolate from baseDark to theme colour at the requested
    // saturation. Use d3 colour interpolation for a clean ramp.
    const themeC = nodeColour(n);
    return d3.interpolateRgb(baseDark, themeC)(Math.min(pct, 100) / 100 * 0.78);
  }
  function nodeRadius(n) {
    return n.kind === 'theme' ? 16 : n.kind === 'topic' ? 8 : 4;
  }
  function labelColliderRadius(n) {
    const base = nodeRadius(n);
    const len  = (n.label || '').length;
    if (n.kind === 'theme')      return base + 48;
    if (n.kind === 'topic')      return base + Math.min(36 + len * 1.5, 80);
    if (n.kind === 'phenomenon') return base + Math.min(34 + len * 2.0, 92);
    return base + 28;
  }
  function isCross(l) {
    const a = STATE.nodesById.get(typeof l.source === 'object' ? l.source.id : l.source);
    const b = STATE.nodesById.get(typeof l.target === 'object' ? l.target.id : l.target);
    const ta = nodeTheme(a), tb = nodeTheme(b);
    return ta && tb && ta !== tb;
  }
  function connectedIds(id) {
    const out = new Set([id]);
    (STATE.edgesByNode.get(id) || []).forEach(l => {
      out.add(typeof l.source === 'object' ? l.source.id : l.source);
      out.add(typeof l.target === 'object' ? l.target.id : l.target);
    });
    return out;
  }

  // ── Simulation ───────────────────────────────────────────
  function initSim() {
    if (STATE.sim) STATE.sim.stop();
    const cx = STATE.viewport.w / 2, cy = STATE.viewport.h / 2;
    const shortSide = Math.min(STATE.viewport.w, STATE.viewport.h) || 720;
    const rTheme = Math.max(160, shortSide * 0.20);
    const rTopic = Math.max(310, shortSide * 0.38);
    const rPhen  = Math.max(460, shortSide * 0.58);
    const radiusFor = d => d.kind === 'theme' ? rTheme
                         : d.kind === 'topic' ? rTopic
                         : d.kind === 'phenomenon' ? rPhen
                         : rTopic;

    STATE.sim = d3.forceSimulation(STATE.nodes)
      .alphaDecay(0.04)
      .velocityDecay(0.55)
      .force('link', d3.forceLink(STATE.links)
        .id(d => d.id)
        .distance(l => l.type === 'is-a' ? 150 : l.type === 'example-of' ? 120 : 180)
        .strength(l => l._hier ? 0.7 : 0.22))
      .force('charge', d3.forceManyBody().strength(d => d.kind === 'theme' ? -1400 : d.kind === 'topic' ? -600 : -260))
      .force('collide', d3.forceCollide().radius(labelColliderRadius).strength(0.92))
      .force('radial', d3.forceRadial(radiusFor, cx, cy).strength(0.18))
      .on('tick', tick);
  }

  // ── Render ───────────────────────────────────────────────
  function pathFor(d) {
    const a = typeof d.source === 'object' ? d.source : STATE.nodesById.get(d.source);
    const b = typeof d.target === 'object' ? d.target : STATE.nodesById.get(d.target);
    if (!a || !b) return '';
    if (isCross(d)) {
      const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
      const dx = b.x - a.x, dy = b.y - a.y;
      const nx = -dy, ny = dx;
      const len = Math.hypot(nx, ny) || 1;
      const curve = 22;
      return `M${a.x},${a.y} Q${mx + (nx / len) * curve},${my + (ny / len) * curve} ${b.x},${b.y}`;
    }
    return `M${a.x},${a.y} L${b.x},${b.y}`;
  }
  function edgeStroke(d) {
    const a = STATE.nodesById.get(typeof d.source === 'object' ? d.source.id : d.source);
    return nodeColour(a);
  }
  function edgeClass(d) {
    return 'edge' + (isCross(d) ? ' cross' : '');
  }
  function keyEdge(d) {
    const s = typeof d.source === 'object' ? d.source.id : d.source;
    const t = typeof d.target === 'object' ? d.target.id : d.target;
    return s + '→' + t + ':' + (d.type || 'hier');
  }

  function renderEdges() {
    const sel = edgeG.selectAll('path.edge').data(STATE.links, keyEdge);
    sel.exit().remove();
    sel.enter().append('path')
      .attr('class', edgeClass)
      .attr('stroke', edgeStroke);
  }

  function renderNodes() {
    const sel = nodeG.selectAll('g.node').data(STATE.nodes, d => d.id);
    sel.exit().remove();

    const enter = sel.enter().append('g')
      .attr('class', d => 'node ' + d.kind + (d.isBridge ? ' bridge' : ''))
      .attr('data-id', d => d.id)
      .attr('data-papers', d => (d.papers || []).join(','));

    enter.append('circle')
      .attr('r', d => nodeRadius(d))
      .attr('fill', d => nodeFill(d))
      .attr('stroke', d => nodeColour(d))
      .attr('stroke-width', d => d.kind === 'theme' ? 2.2 : 1.6)
      .style('color', d => nodeColour(d));

    // Refresh fill on existing nodes too (mastery may have ticked up
    // since last render).
    nodeG.selectAll('g.node circle').attr('fill', function (d) { return nodeFill(d); });

    enter.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', d => nodeRadius(d) + 13)
      .attr('font-size', d => d.kind === 'theme' ? 14 : d.kind === 'topic' ? 11 : 10)
      .text(d => d.label);

    enter.on('mouseenter', onHover)
         .on('mouseleave', onHoverEnd)
         .call(dragBehavior());

    nodeG.selectAll('g.node').call(dragBehavior());
  }

  function tick() {
    edgeG.selectAll('path.edge').attr('d', pathFor);
    nodeG.selectAll('g.node').attr('transform', d => `translate(${d.x || 0},${d.y || 0})`);
  }

  // ── Interaction ──────────────────────────────────────────
  function dragBehavior() {
    let startPos = null;
    return d3.drag()
      .on('start', (event, d) => {
        startPos = { x: event.x, y: event.y };
        if (!event.active) STATE.sim.alphaTarget(0.25).restart();
        d.fx = d.x; d.fy = d.y;
      })
      .on('drag', (event, d) => {
        d.fx = event.x; d.fy = event.y;
      })
      .on('end', (event, d) => {
        if (!event.active) STATE.sim.alphaTarget(0);
        saveLayout(d.id, { x: d.x, y: d.y, fx: d.fx, fy: d.fy });
        if (startPos) {
          const dist = Math.hypot(event.x - startPos.x, event.y - startPos.y);
          if (dist < 4) handleClick(d);
          startPos = null;
        }
      });
  }

  function handleClick(d) {
    if (STATE.focusId === d.id) { clearFocus(); return; }
    focusNode(d.id);
  }

  function onHover(event, d) {
    const tk = d.kind === 'theme' ? 'Tema' : d.kind === 'topic' ? 'Topik' : 'Konsep';
    let body = '';
    if (d.tagline) body = d.tagline;
    else if (d.blurb) body = d.blurb;
    tooltip.innerHTML = `<div class="tk">${tk}</div><div class="tt">${escapeHtml(d.label)}</div>${body ? '<div>' + escapeHtml(body) + '</div>' : ''}`;
    const rect = svg.node().getBoundingClientRect();
    tooltip.style.left = (event.clientX - rect.left + 14) + 'px';
    tooltip.style.top  = (event.clientY - rect.top + 14) + 'px';
    tooltip.classList.add('show');
  }
  function onHoverEnd() {
    tooltip.classList.remove('show');
  }

  function focusNode(id) {
    STATE.focusId = id;
    applyFilters();
    const n = STATE.nodesById.get(id);
    if (STATE.api.onFocus) STATE.api.onFocus(n);
  }
  function clearFocus() {
    STATE.focusId = null;
    applyFilters();
    if (STATE.api.onFocus) STATE.api.onFocus(null);
  }

  function applyFilters() {
    const q = (STATE.search || '').trim().toLowerCase();
    const hasQuery = q.length > 0;
    const matchIds = new Set();
    if (hasQuery) {
      STATE.nodes.forEach(n => {
        if ((n.label || '').toLowerCase().includes(q)) matchIds.add(n.id);
      });
    }
    const focusIds = STATE.focusId ? connectedIds(STATE.focusId) : null;

    nodeG.selectAll('g.node').each(function (d) {
      const el = d3.select(this);
      let dim = false;
      if (focusIds) dim = !focusIds.has(d.id);
      else if (hasQuery) dim = !matchIds.has(d.id);
      el.classed('dim', dim);
      el.classed('focus', d.id === STATE.focusId);
      el.classed('match', hasQuery && matchIds.has(d.id));
    });
    edgeG.selectAll('path.edge').each(function (l) {
      const s = typeof l.source === 'object' ? l.source.id : l.source;
      const t = typeof l.target === 'object' ? l.target.id : l.target;
      const el = d3.select(this);
      let dim = false, active = false;
      if (focusIds) {
        const both = focusIds.has(s) && focusIds.has(t);
        dim = !both;
        active = both && (s === STATE.focusId || t === STATE.focusId);
      } else if (hasQuery) {
        dim = !(matchIds.has(s) && matchIds.has(t));
      }
      el.classed('dim', dim).classed('active', active);
    });
  }

  // ── Zoom + pan ───────────────────────────────────────────
  function initZoom() {
    const zoom = d3.zoom()
      .scaleExtent([0.3, 4])
      .filter(event => {
        if (event.type === 'wheel') return true;
        if (event.type === 'dblclick') return false;
        return !event.target.closest('g.node');
      })
      .on('zoom', (event) => {
        STATE.transform = event.transform;
        rootG.attr('transform', event.transform);
      });
    svg.call(zoom).on('dblclick.zoom', null);

    // Click on empty canvas clears focus
    let bgDown = null;
    svg.on('mousedown', (ev) => {
      if (ev.target.closest('g.node')) { bgDown = null; return; }
      bgDown = { x: ev.clientX, y: ev.clientY, t: Date.now() };
    });
    svg.on('mouseup', (ev) => {
      if (!bgDown) return;
      const moved = Math.hypot(ev.clientX - bgDown.x, ev.clientY - bgDown.y);
      const dt = Date.now() - bgDown.t;
      bgDown = null;
      if (moved < 4 && dt < 400 && !ev.target.closest('g.node')) {
        if (STATE.focusId) clearFocus();
      }
    });

    STATE.api.centre = () => svg.transition().duration(400).call(zoom.transform, d3.zoomIdentity);
  }

  // ── Public API ───────────────────────────────────────────
  STATE.api.setSearch = (q) => { STATE.search = q; applyFilters(); };
  STATE.api.focusNode = focusNode;
  STATE.api.clearFocus = clearFocus;
  STATE.api.unpinAll = () => {
    STATE.nodes.forEach(n => { delete n.fx; delete n.fy; });
    clearAllPins();
    STATE.sim.alpha(0.6).restart();
  };
  STATE.api.nodesById = STATE.nodesById;
  STATE.api.connectedIds = connectedIds;

  // Cross-paper bridge toggle. When on, non-bridge phenomena fade and
  // non-bridge cross-link edges fade. Themes/topics stay visible.
  STATE.api.setBridgesOnly = (on) => {
    svg.classed('bridges-only', !!on);
  };

  // ── Search + buttons wiring ──────────────────────────────
  const searchInput = document.getElementById('search');
  searchInput.addEventListener('input', (e) => STATE.api.setSearch(e.target.value));
  document.addEventListener('keydown', (e) => {
    if (e.key === '/' && document.activeElement !== searchInput) {
      e.preventDefault(); searchInput.focus();
    } else if (e.key === 'Escape') {
      if (STATE.focusId) clearFocus();
      else if (document.activeElement === searchInput) {
        searchInput.value = ''; STATE.api.setSearch(''); searchInput.blur();
      }
    }
  });
  document.getElementById('unpin-btn').addEventListener('click', () => STATE.api.unpinAll());
  document.getElementById('center-btn').addEventListener('click', () => STATE.api.centre && STATE.api.centre());

  function escapeHtml(s) {
    return String(s || '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  async function init() {
    setViewport();
    const data = await loadMega();
    STATE.data = data;
    buildGraph();
    initSim();
    renderEdges();
    renderNodes();
    initZoom();

    window.addEventListener('resize', () => {
      setViewport();
      initSim();
      STATE.sim.alpha(0.3).restart();
    });
  }

  init().catch(err => {
    console.error('[map] init failed', err);
    const probe = document.getElementById('focus-card');
    if (probe) probe.innerHTML = '<div class="fk">Error</div><div class="fl">Could not load the map.</div><div class="ft">' + err.message + '</div>';
  });
})();
