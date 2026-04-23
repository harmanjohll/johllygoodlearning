/* =========================================================
   /studio/map/graph.js
   Force-directed graph: data, simulation, drag, zoom, focus, search.
   Mutates shared window.MAP state. Exposes MAP.api for vault.js
   and coach.js to call (focus, linkMode, unpin, etc.).
   ========================================================= */

(function () {
  const THEME_COLOURS = {
    diversity:    '#10b981',
    cycles:       '#3b82f6',
    systems:      '#a78bfa',
    interactions: '#f87171',
    energy:       '#f59e0b',
  };
  const NOTE_COLOUR = '#fbbf24';

  const STATE = window.MAP = {
    data: null,           // { themes, topics, phenomena, edges }
    nodes: [],            // force-sim node array
    links: [],            // force-sim link array
    nodesById: new Map(),
    edgesByNode: new Map(),
    sim: null,
    focusId: null,
    search: '',
    linking: null,        // { noteId, source } when in link mode
    transform: d3.zoomIdentity,
    viewport: { w: 0, h: 0 },
    api: {},
    hooks: { onFocus: null, onDblClickCanvas: null, onLinkPicked: null },
  };

  const svg = d3.select('#svg');
  const tooltipEl = document.getElementById('tooltip');
  const bannerEl = document.getElementById('banner');
  const rootG    = svg.append('g').attr('class', 'root');
  const edgeG    = rootG.append('g').attr('class', 'edges');
  const haloG    = rootG.append('g').attr('class', 'spark-halos');
  const coreG    = rootG.append('g').attr('class', 'spark-cores');
  const pingG    = rootG.append('g').attr('class', 'pings');
  const nodeG    = rootG.append('g').attr('class', 'nodes');

  function setViewport() {
    const r = svg.node().getBoundingClientRect();
    STATE.viewport.w = r.width;
    STATE.viewport.h = r.height;
  }

  async function loadMega() {
    return fetch('../shared/content/mega.json', { cache: 'no-cache' })
      .then(r => r.ok ? r.json() : Promise.reject(new Error('mega.json fetch failed')));
  }

  function readLayout() {
    try { return (window.JglStorage.getProgress().mega || {}).layout || {}; }
    catch { return {}; }
  }
  function saveLayout(id, patch) {
    if (!window.JglStorage) return;
    window.JglStorage.update(p => {
      p.mega = p.mega || {};
      p.mega.layout = p.mega.layout || {};
      if (!patch) delete p.mega.layout[id];
      else p.mega.layout[id] = { ...(p.mega.layout[id] || {}), ...patch };
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

  // ── Build nodes and links from mega data + notes ─────────
  function buildGraph() {
    STATE.nodes = [];
    STATE.links = [];
    STATE.nodesById.clear();
    STATE.edgesByNode.clear();

    const layout = readLayout();
    const cx = STATE.viewport.w / 2, cy = STATE.viewport.h / 2;

    function addNode(n) {
      const saved = layout[n.id] || {};
      if (typeof saved.x === 'number') n.x = saved.x;
      if (typeof saved.y === 'number') n.y = saved.y;
      if (typeof saved.fx === 'number') n.fx = saved.fx;
      if (typeof saved.fy === 'number') n.fy = saved.fy;
      STATE.nodes.push(n);
      STATE.nodesById.set(n.id, n);
    }

    // Seed positions on three well-separated rings so the force sim
    // starts from a clean, breathing layout rather than clustered.
    const themes = STATE.data.themes;
    const shortSide = Math.min(STATE.viewport.w, STATE.viewport.h) || 720;
    const rTheme = Math.max(220, shortSide * 0.30);
    const rTopic = Math.max(380, shortSide * 0.52);
    const rPhen  = Math.max(560, shortSide * 0.78);
    themes.forEach((t, i) => {
      const a = (i / themes.length) * Math.PI * 2 - Math.PI / 2;
      addNode({ id: t.id, kind: 'theme', label: t.label, tagline: t.tagline,
                x: cx + rTheme * Math.cos(a), y: cy + rTheme * Math.sin(a) });
    });
    STATE.data.topics.forEach((t, i) => {
      const theme = STATE.nodesById.get(t.theme);
      const sibs = STATE.data.topics.filter(tt => tt.theme === t.theme);
      const idx = sibs.indexOf(t);
      const spread = Math.PI / 2.3; // 80deg fan around the theme
      const base = theme ? Math.atan2(theme.y - cy, theme.x - cx) : 0;
      const a = sibs.length > 1 ? base - spread/2 + (idx/(sibs.length - 1)) * spread : base;
      addNode({ id: t.id, kind: 'topic', label: t.label, theme: t.theme,
                x: cx + rTopic * Math.cos(a), y: cy + rTopic * Math.sin(a) });
    });
    STATE.data.phenomena.forEach((p, i) => {
      const primaryId = (p.topics || [])[0];
      const primary = STATE.nodesById.get(primaryId);
      const sibs = STATE.data.phenomena.filter(pp => (pp.topics || [])[0] === primaryId);
      const idx = sibs.indexOf(p);
      const spread = Math.PI / 3; // 60deg fan around the parent topic
      const base = primary ? Math.atan2(primary.y - cy, primary.x - cx) : 0;
      const a = sibs.length > 1 ? base - spread/2 + (idx/(sibs.length - 1)) * spread : base;
      addNode({ id: p.id, kind: 'phenomenon', label: p.label, topics: p.topics || [],
                x: cx + rPhen * Math.cos(a), y: cy + rPhen * Math.sin(a) });
    });

    // hierarchy links
    STATE.data.topics.forEach(t => STATE.links.push({ source: t.theme, target: t.id, type: 'is-a', _hier: true }));
    STATE.data.phenomena.forEach(p => {
      (p.topics || []).forEach(tid => {
        if (STATE.nodesById.has(tid)) STATE.links.push({ source: tid, target: p.id, type: 'example-of', _hier: true });
      });
    });
    // typed cross-links from data
    (STATE.data.edges || []).forEach(e => {
      if (!STATE.nodesById.has(e.from) || !STATE.nodesById.has(e.to)) return;
      STATE.links.push({ source: e.from, target: e.to, type: e.type, reason: e.reason, _hier: false });
    });

    // notes (from vault) get added after buildGraph via api.rebuildNotes
    STATE.links.forEach(l => {
      [l.source, l.target].forEach(id => {
        if (!STATE.edgesByNode.has(id)) STATE.edgesByNode.set(id, []);
        STATE.edgesByNode.get(id).push(l);
      });
    });
  }

  // ── Helpers ──────────────────────────────────────────────
  function nodeTheme(n) {
    if (!n) return null;
    if (n.kind === 'theme')  return n.id;
    if (n.kind === 'topic')  return n.theme;
    if (n.kind === 'phenomenon') {
      const first = (n.topics || [])[0];
      const t = STATE.nodesById.get(first);
      return t ? t.theme : null;
    }
    return null;
  }
  function nodeColour(n) {
    if (n.kind === 'note') return NOTE_COLOUR;
    return THEME_COLOURS[nodeTheme(n)] || '#94a3b8';
  }
  function nodeRadius(n) {
    return n.kind === 'theme' ? 14 : n.kind === 'topic' ? 7 : n.kind === 'note' ? 6 : 3.5;
  }
  // Collide radius accounts for the label's horizontal extent: long
  // phenomenon labels (20-30 chars) are much wider than the circle, so
  // we grow the collider with label length to stop label overlap.
  function labelColliderRadius(n) {
    const base = nodeRadius(n);
    const len  = (n.label || '').length;
    if (n.kind === 'theme')      return base + 46;
    if (n.kind === 'topic')      return base + Math.min(34 + len * 1.5, 80);
    if (n.kind === 'phenomenon') return base + Math.min(32 + len * 2.0, 90);
    if (n.kind === 'note')       return base + 28;
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
    STATE.sim = d3.forceSimulation(STATE.nodes)
      .alphaDecay(0.025)
      .velocityDecay(0.48)
      .force('link', d3.forceLink(STATE.links)
        .id(d => d.id)
        .distance(l => l.type === 'is-a' ? 260 : l.type === 'example-of' ? 210 : l.type === 'part-of' ? 230 : 340)
        .strength(l => l._hier ? 0.42 : 0.15))
      .force('charge', d3.forceManyBody().strength(d => d.kind === 'theme' ? -2600 : d.kind === 'topic' ? -1100 : -520))
      .force('collide', d3.forceCollide().radius(labelColliderRadius).strength(0.95))
      .force('x', d3.forceX(cx).strength(0.006))
      .force('y', d3.forceY(cy).strength(0.006))
      .on('tick', tick);
  }

  // ── Render ───────────────────────────────────────────────
  function edgeStroke(d) {
    if (d.kind === 'note-link') return NOTE_COLOUR;
    const a = STATE.nodesById.get(typeof d.source === 'object' ? d.source.id : d.source);
    return nodeColour(a);
  }
  function haloClass(d) { return 'spark-halo' + (isCross(d) ? ' cross' : '') + (d.kind === 'note-link' ? ' note-link' : ''); }
  function coreClass(d) { return 'spark-core' + (isCross(d) ? ' cross' : '') + (d.kind === 'note-link' ? ' note-link' : ''); }

  function renderEdges() {
    // Threads (muted base line)
    const sel = edgeG.selectAll('path.edge').data(STATE.links, d => keyEdge(d));
    sel.exit().remove();
    const enter = sel.enter().append('path')
      .attr('class', d => edgeClass(d))
      .attr('stroke', edgeStroke)
      // Stagger the thread's dash-drift so the whole web isn't in sync.
      .style('animation-delay', () => (Math.random() * -4.5) + 's');
    enter.merge(sel)
      .attr('class', d => edgeClass(d))
      .attr('stroke', edgeStroke);

    // Jarvis-style packet: two synced layers per edge.
    // - halo: wide theme-coloured glow
    // - core: bright near-white centre line on top
    // Both share the same per-link animation-delay so they travel
    // together as a single "hot core + glow" packet.
    STATE.links.forEach(l => { if (l._sparkDelay == null) l._sparkDelay = Math.random() * -3.6; });

    const hSel = haloG.selectAll('path.spark-halo').data(STATE.links, d => keyEdge(d));
    hSel.exit().remove();
    const hEnter = hSel.enter().append('path')
      .attr('class', haloClass)
      .attr('stroke', edgeStroke)
      .style('color', edgeStroke)
      .style('animation-delay', d => d._sparkDelay + 's');
    hEnter.merge(hSel)
      .attr('class', haloClass)
      .attr('stroke', edgeStroke)
      .style('color', edgeStroke)
      .style('animation-delay', d => d._sparkDelay + 's');

    const cSel = coreG.selectAll('path.spark-core').data(STATE.links, d => keyEdge(d));
    cSel.exit().remove();
    const cEnter = cSel.enter().append('path')
      .attr('class', coreClass)
      .style('animation-delay', d => d._sparkDelay + 's');
    cEnter.merge(cSel)
      .attr('class', coreClass)
      .style('animation-delay', d => d._sparkDelay + 's');
  }
  function edgeClass(d) {
    if (d.kind === 'note-link') return 'edge note-link';
    return 'edge' + (isCross(d) ? ' cross' : '');
  }
  function keyEdge(d) {
    const s = typeof d.source === 'object' ? d.source.id : d.source;
    const t = typeof d.target === 'object' ? d.target.id : d.target;
    return s + '→' + t + ':' + (d.type || 'hier');
  }

  function renderNodes() {
    const sel = nodeG.selectAll('g.node').data(STATE.nodes, d => d.id);
    sel.exit().remove();
    const enter = sel.enter().append('g').attr('class', d => 'node ' + d.kind).attr('data-id', d => d.id);
    enter.each(function (d) {
      const g = d3.select(this);
      // Stagger the node-breathe animation per node so the pulse feels
      // like a living mesh rather than a synchronised blink.
      const breatheDelay = (Math.random() * -7) + 's';
      if (d.kind === 'note') {
        g.append('rect')
          .attr('width',  2 * nodeRadius(d))
          .attr('height', 2 * nodeRadius(d))
          .attr('x', -nodeRadius(d))
          .attr('y', -nodeRadius(d))
          .attr('transform', 'rotate(45)')
          .style('animation-delay', breatheDelay);
      } else {
        g.append('circle').attr('r', nodeRadius(d))
          .style('animation-delay', breatheDelay);
      }
      g.append('text')
        .attr('text-anchor', 'middle')
        .attr('dy', nodeRadius(d) + 12)
        .attr('font-size', d.kind === 'theme' ? 13 : d.kind === 'topic' ? 11 : 9)
        .text(d.label);
    });

    const all = enter.merge(sel);
    all.attr('class', d => 'node ' + d.kind)
       .on('mouseenter', onHover)
       .on('mouseleave', onHoverEnd)
       .on('click', onClick)
       .call(dragBehavior());

    all.select('circle, rect')
       .attr('fill', d => d.kind === 'theme' ? '#0b1220' : (d.kind === 'note' ? '#2a1e05' : '#111a2d'))
       .attr('stroke', d => nodeColour(d))
       .attr('stroke-width', d => d.kind === 'theme' ? 2 : 1.5)
       // Set CSS color so currentColor in drop-shadow filters resolves
       // to the theme colour — otherwise the halo is a dim grey.
       .style('color', d => nodeColour(d));

    applyFilters();
  }

  function pathFor(d) {
    const a = typeof d.source === 'object' ? d.source : STATE.nodesById.get(d.source);
    const b = typeof d.target === 'object' ? d.target : STATE.nodesById.get(d.target);
    if (!a || !b) return '';
    if (isCross(d) || d.kind === 'note-link') {
      const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
      const dx = b.x - a.x, dy = b.y - a.y;
      const nx = -dy, ny = dx;
      const len = Math.hypot(nx, ny) || 1;
      const curve = 22;
      return `M${a.x},${a.y} Q${mx + (nx/len)*curve},${my + (ny/len)*curve} ${b.x},${b.y}`;
    }
    return `M${a.x},${a.y} L${b.x},${b.y}`;
  }

  function tick() {
    edgeG.selectAll('path.edge').attr('d', pathFor);
    // Mirror the same geometry onto both synapse layers so the
    // bright packet travels along the exact same curve as the thread.
    haloG.selectAll('path.spark-halo').attr('d', pathFor);
    coreG.selectAll('path.spark-core').attr('d', pathFor);
    nodeG.selectAll('g.node').attr('transform', d => `translate(${d.x||0},${d.y||0})`);
    pingG.selectAll('circle.ping').attr('transform', d => `translate(${d.x||0},${d.y||0})`);
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
        // Keep pin so position persists. User clicks "Unpin all" to release.
        saveLayout(d.id, { x: d.x, y: d.y, fx: d.fx, fy: d.fy });
        // Detect a click vs drag by total distance
        if (startPos) {
          const dist = Math.hypot(event.x - startPos.x, event.y - startPos.y);
          if (dist < 4) handlePrimaryClick(d);
          startPos = null;
        }
      });
  }

  function handlePrimaryClick(d) {
    // If in linking mode, pick this node as the link target
    if (STATE.linking && STATE.linking.noteId && d.id !== STATE.linking.noteId) {
      if (STATE.hooks.onLinkPicked) STATE.hooks.onLinkPicked(STATE.linking.noteId, d.id);
      exitLinking();
      return;
    }
    // Clicking the already-focused node clears the selection (toggle).
    if (STATE.focusId === d.id) { clearFocus(); return; }
    focusNode(d.id);
  }

  function onClick(event, d) {
    // suppress if drag moved meaningfully (handled in drag end)
  }

  function onHover(event, d) {
    tooltipEl.innerHTML = `<div class="tk">${d.kind}</div><div class="tt">${escapeHtml(d.label)}</div>${d.tagline ? '<div>' + escapeHtml(d.tagline) + '</div>' : ''}`;
    const rect = svg.node().getBoundingClientRect();
    tooltipEl.style.left = (event.clientX - rect.left + 14) + 'px';
    tooltipEl.style.top  = (event.clientY - rect.top + 14) + 'px';
    tooltipEl.classList.add('show');
    tooltipEl.setAttribute('aria-hidden', 'false');
  }
  function onHoverEnd() {
    tooltipEl.classList.remove('show');
    tooltipEl.setAttribute('aria-hidden', 'true');
  }

  function focusNode(id) {
    STATE.focusId = id;
    applyFilters();
    const n = STATE.nodesById.get(id);
    if (STATE.hooks.onFocus) STATE.hooks.onFocus(n);
  }
  function clearFocus() {
    STATE.focusId = null;
    applyFilters();
    if (STATE.hooks.onFocus) STATE.hooks.onFocus(null);
  }

  // ── Filters: focus + search + dim ────────────────────────
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
    // Mirror dim/active onto the two synapse layers (halo + core) so
    // the bright packets brighten and quicken when their edge is active.
    function classifyEdge(l) {
      const s = typeof l.source === 'object' ? l.source.id : l.source;
      const t = typeof l.target === 'object' ? l.target.id : l.target;
      let dim = false, active = false;
      if (focusIds) {
        const both = focusIds.has(s) && focusIds.has(t);
        dim = !both;
        active = both && (s === STATE.focusId || t === STATE.focusId);
      } else if (hasQuery) {
        dim = !(matchIds.has(s) && matchIds.has(t));
      }
      return { dim, active };
    }
    haloG.selectAll('path.spark-halo').each(function (l) {
      const c = classifyEdge(l);
      d3.select(this).classed('dim', c.dim).classed('active', c.active);
    });
    coreG.selectAll('path.spark-core').each(function (l) {
      const c = classifyEdge(l);
      d3.select(this).classed('dim', c.dim).classed('active', c.active);
    });
    renderPing();
  }

  // Ensures the focus ping exists on the focused node and nowhere
  // else. Separate so repeated applyFilters calls (e.g. for search)
  // don't restart its animation unless the focused node has changed.
  function renderPing() {
    const want = STATE.focusId || null;
    const existing = pingG.selectAll('circle.ping');
    const have = existing.size() ? existing.attr('data-for') : null;
    if (have === want) return;
    existing.remove();
    if (!want) return;
    const fn = STATE.nodesById.get(want);
    if (!fn) return;
    const pingR = Math.max(nodeRadius(fn) + 4, 10);
    pingG.append('circle')
      .attr('class', 'ping')
      .attr('data-for', want)
      .attr('r', pingR)
      .attr('stroke', nodeColour(fn))
      .style('color', nodeColour(fn))
      .datum(fn)
      .attr('transform', `translate(${fn.x||0},${fn.y||0})`);
  }

  // ── Zoom / pan ───────────────────────────────────────────
  function initZoom() {
    const zoom = d3.zoom()
      .scaleExtent([0.3, 4])
      .filter(event => {
        // allow wheel + drag on background but not on nodes (nodes use d3.drag)
        if (event.type === 'wheel') return true;
        if (event.type === 'dblclick') return false;
        return !event.target.closest('g.node');
      })
      .on('zoom', (event) => {
        STATE.transform = event.transform;
        rootG.attr('transform', event.transform);
      });
    svg.call(zoom).on('dblclick.zoom', null);

    // double-click on empty canvas → delegate to vault.onDblClickCanvas
    svg.on('dblclick', (event) => {
      if (event.target.closest('g.node')) return;
      if (!STATE.hooks.onDblClickCanvas) return;
      const [x, y] = STATE.transform.invert(d3.pointer(event));
      STATE.hooks.onDblClickCanvas(x, y);
    });

    // Click on empty canvas (not on a node, not a pan-drag) clears the
    // current focus so the student can get back to the full map.
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
        if (STATE.linking) { exitLinking(); return; }
        if (STATE.focusId) clearFocus();
      }
    });

    STATE.api.centre = () => {
      svg.transition().duration(400).call(zoom.transform, d3.zoomIdentity);
    };
  }

  // ── Linking mode ─────────────────────────────────────────
  function enterLinking(noteId) {
    STATE.linking = { noteId };
    svg.classed('linking', true);
    bannerEl.classList.add('show');
  }
  function exitLinking() {
    STATE.linking = null;
    svg.classed('linking', false);
    bannerEl.classList.remove('show');
  }

  // ── API for vault.js + coach.js ──────────────────────────
  STATE.api.setSearch = (q) => { STATE.search = q; applyFilters(); };
  STATE.api.focusNode = focusNode;
  STATE.api.clearFocus = clearFocus;
  STATE.api.enterLinking = enterLinking;
  STATE.api.exitLinking = exitLinking;
  STATE.api.rebuildNotes = (notes) => {
    // Remove any existing note nodes + note-link edges
    STATE.nodes = STATE.nodes.filter(n => n.kind !== 'note');
    STATE.links = STATE.links.filter(l => l.kind !== 'note-link');
    (notes || []).forEach(n => {
      const existing = STATE.nodesById.get(n.id);
      const x = existing?.x ?? STATE.viewport.w / 2;
      const y = existing?.y ?? STATE.viewport.h / 2;
      const layout = readLayout()[n.id] || {};
      STATE.nodes.push({
        id: n.id, kind: 'note', label: n.label || 'Untitled note',
        body: n.body || '', links: n.links || [],
        x: typeof layout.x === 'number' ? layout.x : (typeof n.x === 'number' ? n.x : x),
        y: typeof layout.y === 'number' ? layout.y : (typeof n.y === 'number' ? n.y : y),
        fx: typeof layout.fx === 'number' ? layout.fx : undefined,
        fy: typeof layout.fy === 'number' ? layout.fy : undefined,
      });
      (n.links || []).forEach(targetId => {
        if (STATE.nodesById.has(targetId) || (notes || []).some(nn => nn.id === targetId)) {
          STATE.links.push({ source: n.id, target: targetId, kind: 'note-link' });
        }
      });
    });
    // Rebuild index
    STATE.nodesById.clear();
    STATE.nodes.forEach(n => STATE.nodesById.set(n.id, n));
    STATE.edgesByNode.clear();
    STATE.links.forEach(l => {
      const s = typeof l.source === 'object' ? l.source.id : l.source;
      const t = typeof l.target === 'object' ? l.target.id : l.target;
      [s, t].forEach(id => {
        if (!STATE.edgesByNode.has(id)) STATE.edgesByNode.set(id, []);
        STATE.edgesByNode.get(id).push(l);
      });
    });
    // Restart sim with new node list
    STATE.sim.nodes(STATE.nodes);
    STATE.sim.force('link').links(STATE.links);
    STATE.sim.alpha(0.4).restart();
    renderEdges();
    renderNodes();
  };
  STATE.api.unpinAll = () => {
    STATE.nodes.forEach(n => { delete n.fx; delete n.fy; });
    clearAllPins();
    STATE.sim.alpha(0.6).restart();
  };
  STATE.api.nodesById = STATE.nodesById;

  // ── Search input + shortcut ──────────────────────────────
  const searchInput = document.getElementById('search');
  searchInput.addEventListener('input', (e) => STATE.api.setSearch(e.target.value));
  document.addEventListener('keydown', (e) => {
    if (e.key === '/' && document.activeElement !== searchInput) {
      e.preventDefault(); searchInput.focus();
    } else if (e.key === 'Escape') {
      if (STATE.linking) exitLinking();
      else if (STATE.focusId) clearFocus();
      else if (document.activeElement === searchInput) { searchInput.value = ''; STATE.api.setSearch(''); searchInput.blur(); }
    }
  });
  document.getElementById('unpin-btn').addEventListener('click', () => STATE.api.unpinAll());
  document.getElementById('center-btn').addEventListener('click', () => STATE.api.centre && STATE.api.centre());

  // Sidebar tabs
  const coachTab = document.getElementById('tab-coach');
  const vaultTab = document.getElementById('tab-vault');
  const coachPane = document.getElementById('pane-coach');
  const vaultPane = document.getElementById('pane-vault');
  coachTab.addEventListener('click', () => {
    coachTab.classList.add('active'); vaultTab.classList.remove('active');
    coachPane.style.display = ''; vaultPane.style.display = 'none';
  });
  vaultTab.addEventListener('click', () => {
    vaultTab.classList.add('active'); coachTab.classList.remove('active');
    vaultPane.style.display = ''; coachPane.style.display = 'none';
  });

  function escapeHtml(s) {
    return String(s || '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }

  // ── Bootstrap ────────────────────────────────────────────
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
      STATE.sim.force('x').x(STATE.viewport.w / 2);
      STATE.sim.force('y').y(STATE.viewport.h / 2);
      STATE.sim.alpha(0.25).restart();
    });

    // Ask vault.js + coach.js to hydrate if they loaded
    if (STATE.api.hydrateVault) STATE.api.hydrateVault();
    if (STATE.api.hydrateCoach) STATE.api.hydrateCoach();
  }

  init().catch(err => {
    console.error('[map] init failed', err);
    document.getElementById('probe').innerHTML = '<span class="probe-label">Error</span>Could not load the map data.';
  });
})();
