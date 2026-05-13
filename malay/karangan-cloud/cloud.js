/* =========================================================
   /malay/karangan-cloud/cloud.js
   Karangan vocabulary cloud — force-cluster per category.
   Pattern derived from /malay/map/graph.js (drag-pinning, click
   only adds focus class, search filter).

   For the selected karangan category, the category sits at the
   centre and items radiate out across 6 coloured layers:
     kata_kerja · sifat · latar · penghubung · peribahasa · simpulan

   On hover, tooltip. On click, side panel with the term's
   usage example + a list of OTHER categories where the same
   term appears (cross-link pills).

   Layout positions persist to jgl.progress.cloudLayout[categoryId].
   ========================================================= */

(function () {
  const LAYER_COLOURS = {
    kata_kerja: '#34d399',  // green (action)
    sifat:      '#fbbf24',  // gold (character)
    latar:      '#60a5fa',  // blue (setting)
    penghubung: '#a78bfa',  // purple (connector)
    peribahasa: '#e879f9',  // magenta (proverb)
    simpulan:   '#fb7185',  // coral (idiom)
  };
  const LAYER_LABELS = {
    kata_kerja: 'Kata Kerja',
    sifat:      'Sifat',
    latar:      'Latar / Suasana',
    penghubung: 'Penghubung',
    peribahasa: 'Peribahasa',
    simpulan:   'Simpulan Bahasa',
  };
  const LAYER_ORDER = ['kata_kerja', 'sifat', 'latar', 'penghubung', 'peribahasa', 'simpulan'];

  const state = {
    data: null,        // full karangan-clouds.json
    categoryId: null,  // currently selected category
    nodes: [],
    links: [],
    sim: null,
    focusId: null,
    crossIndex: new Map(), // term → [categoryId, ...]
    viewport: { w: 0, h: 0 },
  };

  const svg = d3.select('#svg');
  const tooltip = document.getElementById('tooltip');
  const rootG = svg.append('g').attr('class', 'root');
  const edgeG = rootG.append('g').attr('class', 'edges');
  const nodeG = rootG.append('g').attr('class', 'nodes');

  function setViewport() {
    const r = svg.node().getBoundingClientRect();
    state.viewport.w = r.width;
    state.viewport.h = r.height;
  }

  // ── Persistence ─────────────────────────────────────────
  function readLayout(catId) {
    try {
      const p = window.JglStorage.getProgress();
      return (p.cloudLayout || {})[catId] || {};
    } catch { return {}; }
  }
  function saveLayout(catId, id, patch) {
    if (!window.JglStorage) return;
    window.JglStorage.update(p => {
      p.cloudLayout = p.cloudLayout || {};
      p.cloudLayout[catId] = p.cloudLayout[catId] || {};
      p.cloudLayout[catId][id] = { ...(p.cloudLayout[catId][id] || {}), ...patch };
      return p;
    });
  }
  function clearAllPins(catId) {
    if (!window.JglStorage) return;
    window.JglStorage.update(p => {
      if (p.cloudLayout && p.cloudLayout[catId]) {
        Object.values(p.cloudLayout[catId]).forEach(v => { delete v.fx; delete v.fy; });
      }
      return p;
    });
  }

  function readScratchpad() {
    try { return JSON.parse(localStorage.getItem('malay.karangan.scratch') || '[]'); } catch { return []; }
  }
  function writeScratchpad(arr) {
    try { localStorage.setItem('malay.karangan.scratch', JSON.stringify(arr.slice(-50))); } catch {}
  }

  function readPractice(catId) {
    try {
      const p = window.JglStorage.getProgress();
      return ((p.karanganPractice || {})[catId]) || 0;
    } catch { return 0; }
  }
  function bumpPractice(catId) {
    if (!window.JglStorage) return;
    window.JglStorage.update(p => {
      p.karanganPractice = p.karanganPractice || {};
      p.karanganPractice[catId] = (p.karanganPractice[catId] || 0) + 1;
      return p;
    });
  }

  function sortedCategories() {
    return state.data.categories
      .map((c, i) => ({ c, i, n: readPractice(c.id) }))
      .sort((a, b) => a.n - b.n || a.i - b.i)
      .map(x => x.c);
  }

  // ── Data load ───────────────────────────────────────────
  async function loadData() {
    const r = await fetch('../shared/content/karangan-clouds.json', { cache: 'no-cache' });
    if (!r.ok) throw new Error('karangan-clouds.json fetch failed');
    state.data = await r.json();
    buildCrossIndex();
  }

  function buildCrossIndex() {
    state.crossIndex.clear();
    (state.data.categories || []).forEach(cat => {
      LAYER_ORDER.forEach(layer => {
        (cat.layers[layer] || []).forEach(term => {
          const key = term.toLowerCase().trim();
          if (!state.crossIndex.has(key)) state.crossIndex.set(key, []);
          state.crossIndex.get(key).push({ categoryId: cat.id, categoryTitle: cat.title, layer });
        });
      });
    });
  }

  function crossLinksFor(term) {
    const arr = state.crossIndex.get(term.toLowerCase().trim()) || [];
    return arr.filter(x => x.categoryId !== state.categoryId);
  }

  // ── Build graph for selected category ───────────────────
  function buildGraph(categoryId) {
    state.categoryId = categoryId;
    state.nodes = [];
    state.links = [];
    state.focusId = null;

    const cat = state.data.categories.find(c => c.id === categoryId);
    if (!cat) return;

    const cx = state.viewport.w / 2, cy = state.viewport.h / 2;
    const shortSide = Math.min(state.viewport.w, state.viewport.h) || 600;
    const rRing = Math.max(180, shortSide * 0.34);
    const layout = readLayout(categoryId);

    // Centre node — the category
    state.nodes.push({
      id: '__category__',
      kind: 'category',
      label: cat.title,
      blurb: cat.blurb,
      x: cx, y: cy, fx: cx, fy: cy, // pin centre
    });

    // Layer nodes
    LAYER_ORDER.forEach((layer, lIdx) => {
      const items = cat.layers[layer] || [];
      if (!items.length) return;
      const layerAngle = (lIdx / LAYER_ORDER.length) * Math.PI * 2 - Math.PI / 2;
      items.forEach((term, iIdx) => {
        const spread = Math.PI / LAYER_ORDER.length * 0.85;
        const a = layerAngle - spread / 2 + (iIdx / Math.max(1, items.length - 1)) * spread;
        const r = rRing * (0.7 + (iIdx % 2) * 0.18 + (lIdx % 2) * 0.06);
        const id = layer + ':' + term;
        const saved = layout[id] || {};
        state.nodes.push({
          id, kind: 'item', layer,
          label: term,
          x: typeof saved.x === 'number' ? saved.x : cx + r * Math.cos(a),
          y: typeof saved.y === 'number' ? saved.y : cy + r * Math.sin(a),
          fx: typeof saved.fx === 'number' ? saved.fx : undefined,
          fy: typeof saved.fy === 'number' ? saved.fy : undefined,
        });
        state.links.push({ source: '__category__', target: id, layer });
      });
    });
  }

  // ── Helpers ─────────────────────────────────────────────
  function nodeRadius(n) { return n.kind === 'category' ? 22 : 6; }
  function nodeColour(n) { return n.kind === 'category' ? '#38bdf8' : (LAYER_COLOURS[n.layer] || '#94a3b8'); }
  function labelCollideRadius(n) {
    const base = nodeRadius(n);
    const len  = (n.label || '').length;
    if (n.kind === 'category') return base + 36;
    return base + Math.min(28 + len * 1.6, 110);
  }

  function initSim() {
    if (state.sim) state.sim.stop();
    const cx = state.viewport.w / 2, cy = state.viewport.h / 2;
    state.sim = d3.forceSimulation(state.nodes)
      .alphaDecay(0.04)
      .velocityDecay(0.55)
      .force('link', d3.forceLink(state.links).id(d => d.id).distance(d => d.layer ? 130 : 90).strength(0.5))
      .force('charge', d3.forceManyBody().strength(d => d.kind === 'category' ? -2000 : -240))
      .force('collide', d3.forceCollide().radius(labelCollideRadius).strength(0.9))
      .force('x', d3.forceX(cx).strength(0.06))
      .force('y', d3.forceY(cy).strength(0.06))
      .on('tick', tick);
  }

  function tick() {
    edgeG.selectAll('path.edge').attr('d', d => {
      const a = typeof d.source === 'object' ? d.source : state.nodes.find(n => n.id === d.source);
      const b = typeof d.target === 'object' ? d.target : state.nodes.find(n => n.id === d.target);
      if (!a || !b) return '';
      return `M${a.x},${a.y} L${b.x},${b.y}`;
    });
    nodeG.selectAll('g.node').attr('transform', d => `translate(${d.x || 0},${d.y || 0})`);
  }

  function renderEdges() {
    const sel = edgeG.selectAll('path.edge').data(state.links, d => `${d.source.id || d.source}->${d.target.id || d.target}`);
    sel.exit().remove();
    sel.enter().append('path')
      .attr('class', 'edge')
      .attr('stroke', d => LAYER_COLOURS[d.layer] || '#475569')
      .attr('stroke-width', 1)
      .attr('opacity', 0.4);
  }

  function renderNodes() {
    const sel = nodeG.selectAll('g.node').data(state.nodes, d => d.id);
    sel.exit().remove();

    const enter = sel.enter().append('g').attr('class', d => 'node ' + d.kind).attr('data-id', d => d.id);
    enter.append('circle');
    enter.append('text').attr('text-anchor', 'middle');

    // Merge enter + update so that switching category re-paints the
    // centre node with the new label/colour. Without this, d3 treats
    // the stable id `__category__` as an UPDATE and never re-runs the
    // append/text calls, leaving the centre showing the FIRST chosen
    // category forever.
    const all = enter.merge(sel);
    all.attr('class', d => 'node ' + d.kind).attr('data-id', d => d.id);

    all.select('circle')
      .attr('r', nodeRadius)
      .attr('fill', d => d.kind === 'category' ? '#0d1a2e' : nodeColour(d))
      .attr('stroke', d => nodeColour(d))
      .attr('stroke-width', d => d.kind === 'category' ? 3 : 1.5);

    all.select('text')
      .attr('dy', d => nodeRadius(d) + 12)
      .attr('font-size', d => d.kind === 'category' ? 15 : 11)
      .attr('font-weight', d => d.kind === 'category' ? 800 : 600)
      .text(d => d.label);

    all.on('mouseenter', onHover)
       .on('mouseleave', onHoverEnd)
       .call(dragBehavior());
  }

  function dragBehavior() {
    let startPos = null;
    return d3.drag()
      .on('start', (event, d) => {
        if (d.kind === 'category') return; // don't move the centre
        startPos = { x: event.x, y: event.y };
        if (!event.active) state.sim.alphaTarget(0.25).restart();
        d.fx = d.x; d.fy = d.y;
      })
      .on('drag', (event, d) => {
        if (d.kind === 'category') return;
        d.fx = event.x; d.fy = event.y;
      })
      .on('end', (event, d) => {
        if (d.kind === 'category') return;
        if (!event.active) state.sim.alphaTarget(0);
        saveLayout(state.categoryId, d.id, { x: d.x, y: d.y, fx: d.fx, fy: d.fy });
        if (startPos) {
          const dist = Math.hypot(event.x - startPos.x, event.y - startPos.y);
          if (dist < 4) handleClick(d);
          startPos = null;
        }
      });
  }

  function handleClick(d) {
    if (d.kind === 'category') { showSide(null); return; }
    if (state.focusId === d.id) { state.focusId = null; applyFilters(); showSide(null); return; }
    state.focusId = d.id;
    applyFilters();
    showSide(d);
  }

  function onHover(event, d) {
    const layerLabel = d.layer ? LAYER_LABELS[d.layer] : 'Kategori';
    tooltip.innerHTML = `<div class="tk">${layerLabel}</div><div class="tt">${escapeHtml(d.label)}</div>`;
    const rect = svg.node().getBoundingClientRect();
    tooltip.style.left = (event.clientX - rect.left + 14) + 'px';
    tooltip.style.top  = (event.clientY - rect.top + 14) + 'px';
    tooltip.classList.add('show');
  }
  function onHoverEnd() { tooltip.classList.remove('show'); }

  function applyFilters() {
    const focusId = state.focusId;
    const connected = new Set();
    if (focusId) {
      connected.add(focusId);
      connected.add('__category__');
    }
    nodeG.selectAll('g.node').each(function (d) {
      const el = d3.select(this);
      el.classed('dim', !!focusId && !connected.has(d.id));
      el.classed('focus', d.id === focusId);
    });
    edgeG.selectAll('path.edge').each(function (l) {
      const s = typeof l.source === 'object' ? l.source.id : l.source;
      const t = typeof l.target === 'object' ? l.target.id : l.target;
      const el = d3.select(this);
      el.classed('dim', focusId && !(connected.has(s) && connected.has(t)));
      el.classed('active', focusId && (s === focusId || t === focusId));
    });
  }

  // ── Side panel ──────────────────────────────────────────
  function showSide(node) {
    const empty = document.getElementById('side-empty');
    const filled = document.getElementById('side-filled');
    if (!node) {
      empty.style.display = 'block';
      filled.style.display = 'none';
      return;
    }
    empty.style.display = 'none';
    filled.style.display = 'block';

    document.getElementById('side-layer').textContent = LAYER_LABELS[node.layer] || 'Item';
    document.getElementById('side-layer').style.color = LAYER_COLOURS[node.layer] || '#38bdf8';
    document.getElementById('side-term').textContent = node.label;

    // Cross-links
    const crossList = document.getElementById('side-cross');
    const cross = crossLinksFor(node.label);
    if (cross.length === 0) {
      crossList.innerHTML = '<div style="font-size:.76rem;color:var(--muted);font-style:italic">Hanya digunakan dalam kategori ini.</div>';
    } else {
      crossList.innerHTML = '<div class="side-cross-label">Juga sesuai untuk:</div>' +
        cross.map(c => `<button class="cross-pill" data-cat="${c.categoryId}">${escapeHtml(c.categoryTitle)}</button>`).join('');
      crossList.querySelectorAll('.cross-pill').forEach(b => {
        b.addEventListener('click', () => {
          selectCategory(b.dataset.cat);
        });
      });
    }

    // Actions
    const scratch = readScratchpad();
    const isInScratch = scratch.includes(node.label);
    document.getElementById('side-add').textContent = isInScratch ? '✓ Sudah dalam draf' : '+ Tambah ke draf';
    document.getElementById('side-add').disabled = isInScratch;
    document.getElementById('side-add').onclick = () => {
      const s = readScratchpad();
      if (!s.includes(node.label)) {
        s.push(node.label);
        writeScratchpad(s);
        renderScratchpad();
        // First add to this category in this session counts as deliberate practice.
        if (!state.bumpedThisLoad) {
          bumpPractice(state.categoryId);
          state.bumpedThisLoad = true;
        }
        showSide(node);
      }
    };
  }

  function renderScratchpad() {
    const wrap = document.getElementById('scratchpad');
    const list = readScratchpad();
    if (list.length === 0) {
      wrap.innerHTML = '<div style="font-size:.74rem;color:var(--muted);font-style:italic">Belum ada perkataan dalam draf. Klik mana-mana nod, kemudian "Tambah ke draf".</div>';
      return;
    }
    wrap.innerHTML = `
      <div class="scratch-head">
        <span class="scratch-count">${list.length} perkataan</span>
        <button id="scratch-copy" class="btn btn-ghost" style="font-size:.7rem">📋 Salin</button>
        <button id="scratch-send" class="btn btn-primary" style="font-size:.7rem">📨 Hantar ke Pelan</button>
        <button id="scratch-clear" class="btn btn-ghost" style="font-size:.7rem">↺ Kosongkan</button>
      </div>
      <div class="scratch-list">
        ${list.map(t => `<span class="scratch-chip">${escapeHtml(t)} <button data-rm="${escapeHtml(t)}">×</button></span>`).join('')}
      </div>
    `;
    document.getElementById('scratch-copy').onclick = () => {
      navigator.clipboard.writeText(list.join(', ')).then(() => {
        document.getElementById('scratch-copy').textContent = '✓ Disalin';
        setTimeout(() => document.getElementById('scratch-copy').textContent = '📋 Salin', 1200);
      });
    };
    document.getElementById('scratch-send').onclick = () => {
      // Persist a handoff blob the planner reads on load, then deep-link.
      const handoff = {
        categoryId: state.categoryId,
        terms: list,
        sentIso: new Date().toISOString(),
      };
      try { localStorage.setItem('malay.karangan.handoff', JSON.stringify(handoff)); } catch {}
      const url = '../karangan-planner/index.html?cat=' + encodeURIComponent(state.categoryId) + '&from=cloud';
      window.location.href = url;
    };
    document.getElementById('scratch-clear').onclick = () => {
      if (confirm('Kosongkan draf?')) { writeScratchpad([]); renderScratchpad(); }
    };
    wrap.querySelectorAll('button[data-rm]').forEach(b => {
      b.onclick = () => {
        const rm = b.dataset.rm;
        const s = readScratchpad().filter(x => x !== rm);
        writeScratchpad(s);
        renderScratchpad();
      };
    });
  }

  // ── Category picker ─────────────────────────────────────
  function buildPicker() {
    const wrap = document.getElementById('picker');
    const ordered = sortedCategories();
    wrap.innerHTML = ordered.map(c => {
      const n = readPractice(c.id);
      const badge = n === 0 ? '<span class="cat-new-badge" title="Belum diterokai">●</span>' : '';
      return `<button class="cat-chip${n === 0 ? ' fresh' : ''}" data-id="${c.id}">${badge}${escapeHtml(c.title)}</button>`;
    }).join('');
    wrap.querySelectorAll('.cat-chip').forEach(b => {
      b.addEventListener('click', () => selectCategory(b.dataset.id));
    });
  }

  function selectCategory(catId) {
    document.querySelectorAll('.cat-chip').forEach(b => b.classList.toggle('active', b.dataset.id === catId));
    document.getElementById('cat-title').textContent = state.data.categories.find(c => c.id === catId).title;
    document.getElementById('cat-blurb').textContent = state.data.categories.find(c => c.id === catId).blurb || '';
    showSide(null);
    state.bumpedThisLoad = false;
    buildGraph(catId);
    initSim();
    renderEdges();
    renderNodes();
    state.sim.alpha(0.9).restart();
  }

  // ── Zoom / pan ──────────────────────────────────────────
  function initZoom() {
    const zoom = d3.zoom()
      .scaleExtent([0.4, 3])
      .filter(event => {
        if (event.type === 'wheel') return true;
        if (event.type === 'dblclick') return false;
        return !event.target.closest('g.node');
      })
      .on('zoom', (event) => rootG.attr('transform', event.transform));
    svg.call(zoom).on('dblclick.zoom', null);

    // background click clears focus
    svg.on('mousedown.bg', null);
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
        if (state.focusId) { state.focusId = null; applyFilters(); showSide(null); }
      }
    });
  }

  // ── Buttons ─────────────────────────────────────────────
  function bindButtons() {
    document.getElementById('unpin-btn').addEventListener('click', () => {
      state.nodes.forEach(n => { if (n.kind !== 'category') { delete n.fx; delete n.fy; } });
      clearAllPins(state.categoryId);
      state.sim.alpha(0.8).restart();
    });
  }

  function escapeHtml(s) {
    return String(s || '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  async function init() {
    setViewport();
    try {
      await loadData();
    } catch (err) {
      document.getElementById('side-empty').innerHTML = '<div class="fk">Ralat</div><div class="fl">Tidak dapat memuat data: ' + escapeHtml(err.message) + '</div>';
      return;
    }
    buildPicker();
    initZoom();
    bindButtons();
    renderScratchpad();
    // Auto-pick the first category in practice-aware order so a new
    // visitor lands on something un-explored.
    const ordered = sortedCategories();
    selectCategory(ordered[0].id);

    window.addEventListener('resize', () => {
      setViewport();
      if (state.categoryId) {
        buildGraph(state.categoryId);
        initSim();
        renderEdges();
        renderNodes();
        state.sim.alpha(0.5).restart();
      }
    });
  }

  init();
})();
