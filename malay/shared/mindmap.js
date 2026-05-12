/* =========================================================
   /malay/shared/mindmap.js
   D3-based interactive concept map for /malay/ topic pages.
   Ported from /studio/shared.js ScienceMindMap (Obsidian-style
   force layout) with the malay_mindmap_<topicId> localStorage
   key. Requires d3 v7 to be loaded on the page.

   Exposes window.MalayMindMap. The class definition replaces
   the Phase 1 stub in /malay/shared.js when this script
   loads after shared.js.
   ========================================================= */

(function (global) {
  class MalayMindMap {
    constructor(containerId, topicId, template) {
      this.containerId = containerId;
      this.topicId     = topicId;
      this.template    = template || { nodes: [], edges: [], required: [] };
      this.nodes = [];
      this.links = [];
      this.sim   = null;
      this.focusId = null;
      this.linkingFrom = null;
      this.nodeIdCounter = 1000;
      this.transform = (typeof d3 !== 'undefined') ? d3.zoomIdentity : { x: 0, y: 0, k: 1 };
      this._initD3();
    }

    _initD3() {
      const container = document.getElementById(this.containerId);
      if (!container) return;
      if (typeof d3 === 'undefined') {
        container.innerHTML = '<div style="color:#94a3b8;padding:1rem;font-size:.85rem">Peta minda memerlukan D3.js — periksa sambungan internet anda.</div>';
        return;
      }

      container.innerHTML = '';
      container.style.position = 'relative';
      container.style.overflow = 'hidden';
      this.svg = d3.select(container).append('svg')
        .attr('class', 'malay-mm-svg')
        .attr('width', '100%')
        .attr('height', '100%')
        .style('display', 'block')
        .style('touch-action', 'none')
        .style('cursor', 'default');
      this.root  = this.svg.append('g').attr('class', 'malay-mm-root');
      this.edgeG = this.root.append('g').attr('class', 'malay-mm-edges');
      this.nodeG = this.root.append('g').attr('class', 'malay-mm-nodes');

      if (!document.getElementById('malay-mm-style')) {
        const s = document.createElement('style');
        s.id = 'malay-mm-style';
        s.textContent = `
          .malay-mm-svg .node text {
            pointer-events: none; fill: #cfd3df;
            font-family: 'Inter Tight','Inter',system-ui,sans-serif;
            font-weight: 600; paint-order: stroke;
            stroke: #0d1a2e; stroke-width: 3.5; stroke-linejoin: round;
          }
          .malay-mm-svg .node.root text { fill: #ffffff; font-weight: 800; }
          .malay-mm-svg .node circle { cursor: pointer; transition: stroke-width .12s, opacity .15s; }
          .malay-mm-svg .node.focus circle { stroke-width: 3.5; filter: drop-shadow(0 0 6px currentColor); }
          .malay-mm-svg .node.dim circle { opacity: .22; }
          .malay-mm-svg .node.dim text   { opacity: .28; }
          .malay-mm-svg .edge { fill: none; stroke: #64748b; stroke-width: .9; opacity: .45; }
          .malay-mm-svg .edge.active { stroke: #e879f9; opacity: 1; stroke-width: 1.6; }
          .malay-mm-svg .edge.dim { opacity: .1; }
          .malay-mm-svg.linking { cursor: crosshair; }
        `;
        document.head.appendChild(s);
      }

      this._loadFromTemplate();
      this._layoutSeed();
      this._initSim();
      this._initZoom();
      this._initDblClick();
      this._render();
      this._checkSizeSoon();
    }

    _checkSizeSoon() {
      const container = document.getElementById(this.containerId);
      if (!container) return;
      const poll = () => {
        const r = container.getBoundingClientRect();
        if (r.width > 10 && r.height > 10) {
          this._onResize();
          this.sim && this.sim.alpha(0.7).restart();
          setTimeout(() => this.svg && this._centreView(), 60);
          return;
        }
        setTimeout(poll, 200);
      };
      poll();
    }

    _loadFromTemplate() {
      this.nodes = (this.template.nodes || []).map(n => ({
        id: n.id, label: n.label || 'Node', _root: !!n.color, _colour: (n.color && n.color.border) || '#e879f9',
      }));
      this.links = (this.template.edges || []).map(e => ({ source: e.from, target: e.to, label: e.label || '' }));
    }

    _layoutSeed() {
      const container = document.getElementById(this.containerId);
      const r = container.getBoundingClientRect();
      const cx = (r.width || 800) / 2, cy = (r.height || 420) / 2;
      const radius = Math.min(r.width || 800, r.height || 420) * 0.30 || 160;
      const n = this.nodes.length || 1;
      this.nodes.forEach((node, i) => {
        if (node._root || i === 0) { node.x = cx; node.y = cy; return; }
        const a = ((i - 1) / Math.max(1, n - 1)) * Math.PI * 2 - Math.PI / 2;
        node.x = cx + radius * Math.cos(a);
        node.y = cy + radius * Math.sin(a);
      });
    }

    _initSim() {
      const container = document.getElementById(this.containerId);
      const r = container.getBoundingClientRect();
      const cx = (r.width || 800) / 2, cy = (r.height || 420) / 2;
      this.sim = d3.forceSimulation(this.nodes)
        .alphaDecay(0.03)
        .velocityDecay(0.5)
        .force('link',    d3.forceLink(this.links).id(d => d.id).distance(110).strength(0.55))
        .force('charge',  d3.forceManyBody().strength(d => d._root ? -900 : -380))
        .force('collide', d3.forceCollide().radius(28).strength(0.9))
        .force('x',       d3.forceX(cx).strength(0.04))
        .force('y',       d3.forceY(cy).strength(0.04))
        .on('tick', () => this._tick());
    }

    _initZoom() {
      const zoom = d3.zoom()
        .scaleExtent([0.3, 3])
        .filter(ev => {
          if (ev.type === 'dblclick') return false;
          return !ev.target.closest('g.node');
        })
        .on('zoom', (ev) => { this.transform = ev.transform; this.root.attr('transform', ev.transform); });
      this.svg.call(zoom).on('dblclick.zoom', null);
      this._zoom = zoom;
    }

    _initDblClick() {
      this.svg.on('dblclick', (ev) => {
        if (ev.target.closest('g.node')) return;
        const [x, y] = this.transform.invert(d3.pointer(ev));
        const lbl = prompt('Label nod baharu:');
        if (lbl && lbl.trim()) this._addNodeAt(lbl.trim(), x, y);
      });
    }

    _centreView() {
      if (!this._zoom) return;
      this.svg.transition().duration(300).call(this._zoom.transform, d3.zoomIdentity);
    }

    _onResize() {
      const container = document.getElementById(this.containerId);
      if (!container || !this.sim) return;
      const r = container.getBoundingClientRect();
      if (r.width < 10) return;
      const cx = r.width / 2, cy = r.height / 2;
      this.sim.force('x').x(cx);
      this.sim.force('y').y(cy);
      this.sim.alpha(0.3).restart();
    }

    _tick() {
      this.edgeG.selectAll('path.edge')
        .attr('d', d => {
          const a = typeof d.source === 'object' ? d.source : this._byId(d.source);
          const b = typeof d.target === 'object' ? d.target : this._byId(d.target);
          if (!a || !b) return '';
          return `M${a.x},${a.y} L${b.x},${b.y}`;
        });
      this.nodeG.selectAll('g.node').attr('transform', d => `translate(${d.x || 0},${d.y || 0})`);
    }

    _byId(id) { return this.nodes.find(n => n.id === id); }

    _render() {
      const edgeKey = d => {
        const s = typeof d.source === 'object' ? d.source.id : d.source;
        const t = typeof d.target === 'object' ? d.target.id : d.target;
        return s + '→' + t;
      };
      const esel = this.edgeG.selectAll('path.edge').data(this.links, edgeKey);
      esel.exit().remove();
      esel.enter().append('path').attr('class', 'edge');

      const nsel = this.nodeG.selectAll('g.node').data(this.nodes, d => d.id);
      nsel.exit().remove();
      const enter = nsel.enter().append('g').attr('class', d => 'node' + (d._root ? ' root' : ''));
      enter.append('circle')
        .attr('r', d => d._root ? 14 : 8)
        .attr('fill', '#0d1a2e')
        .attr('stroke-width', d => d._root ? 2 : 1.5);
      enter.append('text')
        .attr('text-anchor', 'middle')
        .attr('dy', d => d._root ? 30 : 22)
        .attr('font-size', d => d._root ? 13 : 11);

      const all = enter.merge(nsel);
      all.select('circle').attr('stroke', d => d._colour || '#e879f9');
      all.select('text').text(d => d.label);

      all.on('click', (ev, d) => this._onClickNode(ev, d))
         .call(this._dragBehavior());

      if (this.sim) {
        this.sim.nodes(this.nodes);
        this.sim.force('link').links(this.links);
        this.sim.alpha(0.6).restart();
      }
    }

    _dragBehavior() {
      const self = this;
      return d3.drag()
        .on('start', (ev, d) => {
          if (!ev.active) self.sim.alphaTarget(0.3).restart();
          d.fx = d.x; d.fy = d.y;
        })
        .on('drag', (ev, d) => { d.fx = ev.x; d.fy = ev.y; })
        .on('end', (ev, d) => {
          if (!ev.active) self.sim.alphaTarget(0);
        });
    }

    _onClickNode(ev, d) {
      if (this.linkingFrom) {
        if (d.id !== this.linkingFrom) {
          this.links.push({ source: this.linkingFrom, target: d.id });
          this._render();
          if (typeof showToast === 'function') showToast('Disambungkan.');
        }
        this.linkingFrom = null;
        this.svg.classed('linking', false);
        return;
      }
      this.focusId = this.focusId === d.id ? null : d.id;
      this._applyFocus();
    }

    _applyFocus() {
      const id = this.focusId;
      const adj = new Set(id ? [id] : []);
      if (id) this.links.forEach(l => {
        const s = typeof l.source === 'object' ? l.source.id : l.source;
        const t = typeof l.target === 'object' ? l.target.id : l.target;
        if (s === id) adj.add(t);
        if (t === id) adj.add(s);
      });
      this.nodeG.selectAll('g.node')
        .classed('dim',   d => id && !adj.has(d.id))
        .classed('focus', d => d.id === id);
      this.edgeG.selectAll('path.edge').each(function (l) {
        const s = typeof l.source === 'object' ? l.source.id : l.source;
        const t = typeof l.target === 'object' ? l.target.id : l.target;
        const active = id && (s === id || t === id);
        d3.select(this).classed('active', !!active).classed('dim', id && !active);
      });
    }

    _addNodeAt(label, x, y) {
      const id = ++this.nodeIdCounter;
      this.nodes.push({ id, label, x, y, _colour: '#34d399' });
      this._render();
      return id;
    }

    // ── Public API (mirrors Studio's ScienceMindMap) ──
    addNode(label) {
      const container = document.getElementById(this.containerId);
      const r = container.getBoundingClientRect();
      const id = ++this.nodeIdCounter;
      this.nodes.push({
        id, label: label || 'Idea Baharu',
        x: r.width / 2 + (Math.random() - .5) * 60,
        y: r.height / 2 + (Math.random() - .5) * 60,
        _colour: '#34d399',
      });
      this._render();
      return id;
    }

    addEdge() {
      if (this.nodes.length < 2) { if (typeof showToast === 'function') showToast('Tambah lebih banyak nod dahulu.'); return; }
      if (typeof showToast === 'function') showToast('Klik nod pertama, kemudian nod kedua, untuk menyambungkannya.');
      this.linkingFrom = null;
      this.svg.classed('linking', true);
      const once = (ev) => {
        const target = ev.target.closest('g.node');
        if (!target) return;
        const dat = d3.select(target).datum();
        if (!this.linkingFrom) { this.linkingFrom = dat.id; }
        this.svg.node().removeEventListener('click', once, true);
      };
      this.svg.node().addEventListener('click', once, true);
    }

    deleteSelected() {
      if (!this.focusId) { if (typeof showToast === 'function') showToast('Klik nod untuk memilih, kemudian tekan Padam.'); return; }
      const id = this.focusId;
      this.nodes = this.nodes.filter(n => n.id !== id);
      this.links = this.links.filter(l => {
        const s = typeof l.source === 'object' ? l.source.id : l.source;
        const t = typeof l.target === 'object' ? l.target.id : l.target;
        return s !== id && t !== id;
      });
      this.focusId = null;
      this._render();
      this._applyFocus();
    }

    togglePhysics() {
      const anyPinned = this.nodes.some(n => n.fx != null);
      if (anyPinned) {
        this.nodes.forEach(n => { delete n.fx; delete n.fy; });
        this.sim.alpha(0.7).restart();
        if (typeof showToast === 'function') showToast('Susun-atur automatik DIHIDUPKAN.');
      } else {
        this.nodes.forEach(n => { n.fx = n.x; n.fy = n.y; });
        this.sim.alphaTarget(0).alpha(0);
        if (typeof showToast === 'function') showToast('Disematkan. Seret untuk menyusun semula.');
      }
    }

    save() {
      const data = {
        nodes: this.nodes.map(n => ({ id: n.id, label: n.label, _root: n._root, _colour: n._colour, fx: n.fx, fy: n.fy })),
        edges: this.links.map(l => ({
          from: typeof l.source === 'object' ? l.source.id : l.source,
          to:   typeof l.target === 'object' ? l.target.id : l.target,
          label: l.label || ''
        }))
      };
      try { localStorage.setItem(`malay_mindmap_${this.topicId}`, JSON.stringify(data)); } catch {}
      if (typeof Progress !== 'undefined') Progress.recordMindMap(this.topicId);
      if (typeof showToast === 'function') showToast('Peta minda disimpan.');
      return data;
    }

    load() {
      try {
        const raw = localStorage.getItem(`malay_mindmap_${this.topicId}`);
        if (!raw) { if (typeof showToast === 'function') showToast('Tiada peta minda yang disimpan.'); return; }
        const saved = JSON.parse(raw);
        this.nodes = (saved.nodes || []).map(n => ({ ...n }));
        this.links = (saved.edges || []).map(e => ({ source: e.from, target: e.to, label: e.label || '' }));
        this._render();
        if (typeof showToast === 'function') showToast('Peta minda dimuat.');
      } catch { if (typeof showToast === 'function') showToast('Tidak dapat memuat peta minda.'); }
    }

    check() {
      const required  = this.template.required || [];
      const allLabels = this.nodes.map(n => (n.label || '').toLowerCase());
      const missing   = required.filter(r => !allLabels.some(l => l.includes(r.toLowerCase())));
      const found     = required.filter(r =>  allLabels.some(l => l.includes(r.toLowerCase())));
      let fb = `<strong>Semakan Peta Minda</strong><br><br>`;
      fb += `✅ Dijumpai (${found.length}/${required.length}): ${found.join(', ') || 'tiada'}<br>`;
      if (missing.length) fb += `💡 Pertimbangkan untuk menambah: <em>${missing.join(', ')}</em>`;
      else                fb += `🏆 Cemerlang. Peta anda merangkumi semua idea yang diperlukan.`;
      const box = document.getElementById('mindmap-feedback');
      if (box) { box.innerHTML = fb; box.style.display = 'block'; }
      return missing;
    }

    reset() {
      this._loadFromTemplate();
      this._layoutSeed();
      this.focusId = null;
      this._render();
      this.sim && this.sim.alpha(0.8).restart();
      this._centreView();
    }
  }

  global.MalayMindMap = MalayMindMap;
})(typeof window !== 'undefined' ? window : globalThis);
