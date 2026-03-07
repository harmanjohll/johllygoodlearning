/* =========================================================
   Math Model — Interactive Bar Model Builder
   Canvas-based tool for constructing Singapore Model Method
   bar diagrams with guided and free-build modes.
   ========================================================= */

class ModelBuilder {
  constructor(containerId, options = {}) {
    this.containerId = containerId;
    this.container = document.getElementById(containerId);
    if (!this.container) return;

    this.opts = {
      width: options.width || 760,
      height: options.height || 400,
      unitWidth: options.unitWidth || 50,
      barHeight: options.barHeight || 38,
      barGap: options.barGap || 16,
      startX: options.startX || 120,
      startY: options.startY || 50,
      colors: options.colors || ['#38bdf8', '#34d399', '#f97316', '#8b5cf6', '#f59e0b', '#ec4899'],
      mode: options.mode || 'free',  // 'free' | 'guided' | 'demo'
      readOnly: options.readOnly || false,
      showToolbar: options.showToolbar !== false,
      showProps: options.showProps !== false,
      beforeAfter: options.beforeAfter || false,
      onModelChange: options.onModelChange || null,
      onGuidedComplete: options.onGuidedComplete || null,
      ...options
    };

    // Model state
    this.bars = [];
    this.brackets = [];
    this.differences = [];
    this.unitLabels = [];
    this.arrows = [];
    this.selectedBarIdx = -1;
    this.selectedTool = 'select';
    this.history = [];
    this.historyIdx = -1;
    this.colorIdx = 0;

    // Guided mode
    this.guidedSteps = [];
    this.guidedCurrent = 0;
    this.guidedContainer = null;

    // Canvas state
    this.canvas = null;
    this.ctx = null;
    this.dpr = window.devicePixelRatio || 1;
    this.dragging = false;
    this.dragTarget = null;
    this.dragOffsetX = 0;

    this._build();
    this._bindEvents();
    this._saveHistory();
    this.render();
  }

  // ── Build DOM ──────────────────────────────────────
  _build() {
    const c = this.container;
    c.innerHTML = '';

    // Guided instruction area
    if (this.opts.mode === 'guided') {
      this.guidedContainer = document.createElement('div');
      this.guidedContainer.id = this.containerId + '-guided';
      c.appendChild(this.guidedContainer);
    }

    const wrap = document.createElement('div');
    wrap.className = 'builder-container';

    // Toolbar
    if (this.opts.showToolbar && !this.opts.readOnly) {
      const tb = document.createElement('div');
      tb.className = 'builder-toolbar';
      tb.innerHTML = `
        <button class="tool-btn active" data-tool="select" title="Select & move bars">Select</button>
        <button class="tool-btn" data-tool="addBar" title="Add a new bar">+ Bar</button>
        <span class="tool-sep"></span>
        <button class="tool-btn" data-tool="bracket" title="Add bracket to selected bar">Bracket</button>
        <button class="tool-btn" data-tool="diff" title="Mark difference between two bars">Difference</button>
        <button class="tool-btn" data-tool="arrow" title="Add transfer arrow">Arrow</button>
        <span class="tool-sep"></span>
        <button class="tool-btn" data-tool="undo" title="Undo">Undo</button>
        <button class="tool-btn" data-tool="redo" title="Redo">Redo</button>
        <button class="tool-btn" data-tool="clear" title="Clear all">Clear</button>`;
      wrap.appendChild(tb);
    }

    // Canvas
    this.canvas = document.createElement('canvas');
    this.canvas.className = 'builder-canvas';
    this.canvas.style.width = this.opts.width + 'px';
    this.canvas.style.height = this.opts.height + 'px';
    this.canvas.width = this.opts.width * this.dpr;
    this.canvas.height = this.opts.height * this.dpr;
    this.ctx = this.canvas.getContext('2d');
    this.ctx.scale(this.dpr, this.dpr);
    wrap.appendChild(this.canvas);

    // Properties panel
    if (this.opts.showProps && !this.opts.readOnly) {
      const props = document.createElement('div');
      props.className = 'builder-props';
      props.id = this.containerId + '-props';
      props.innerHTML = '<span style="color:var(--muted);font-size:.78rem">Click a bar to edit, or use + Bar to add one.</span>';
      wrap.appendChild(props);
    }

    c.appendChild(wrap);
  }

  // ── Event Binding ──────────────────────────────────
  _bindEvents() {
    // Toolbar clicks
    const toolbar = this.container.querySelector('.builder-toolbar');
    if (toolbar) {
      toolbar.addEventListener('click', e => {
        const btn = e.target.closest('.tool-btn');
        if (!btn) return;
        const tool = btn.dataset.tool;

        if (tool === 'undo') { this.undo(); return; }
        if (tool === 'redo') { this.redo(); return; }
        if (tool === 'clear') { this.clear(); return; }
        if (tool === 'addBar') { this._addBarInteractive(); return; }
        if (tool === 'bracket') { this._addBracketInteractive(); return; }
        if (tool === 'diff') { this._addDiffInteractive(); return; }
        if (tool === 'arrow') { this._addArrowInteractive(); return; }

        // Toggle tool
        toolbar.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.selectedTool = tool;
      });
    }

    // Canvas interactions
    this.canvas.addEventListener('mousedown', e => this._onMouseDown(e));
    this.canvas.addEventListener('mousemove', e => this._onMouseMove(e));
    this.canvas.addEventListener('mouseup', e => this._onMouseUp(e));
    this.canvas.addEventListener('dblclick', e => this._onDblClick(e));

    // Touch support
    this.canvas.addEventListener('touchstart', e => { e.preventDefault(); this._onMouseDown(this._touchToMouse(e)); }, { passive: false });
    this.canvas.addEventListener('touchmove', e => { e.preventDefault(); this._onMouseMove(this._touchToMouse(e)); }, { passive: false });
    this.canvas.addEventListener('touchend', e => { e.preventDefault(); this._onMouseUp(this._touchToMouse(e)); }, { passive: false });
  }

  _touchToMouse(e) {
    const touch = e.touches[0] || e.changedTouches[0];
    const rect = this.canvas.getBoundingClientRect();
    return { offsetX: touch.clientX - rect.left, offsetY: touch.clientY - rect.top };
  }

  _getMousePos(e) {
    return { x: e.offsetX, y: e.offsetY };
  }

  // ── Mouse Handlers ─────────────────────────────────
  _onMouseDown(e) {
    if (this.opts.readOnly) return;
    const pos = this._getMousePos(e);
    const hitBar = this._hitTestBar(pos);

    if (this.selectedTool === 'select') {
      if (hitBar !== -1) {
        this.selectedBarIdx = hitBar;
        this.dragging = true;
        this.dragTarget = 'bar';
        this.dragOffsetX = pos.x - this._getBarX(hitBar);
        this.canvas.style.cursor = 'grabbing';
      } else {
        this.selectedBarIdx = -1;
      }
      this._updateProps();
      this.render();
    }
  }

  _onMouseMove(e) {
    if (!this.dragging || this.opts.readOnly) return;
    // Currently we don't support free dragging — bars auto-layout
    // But we could allow horizontal resize by dragging right edge
    const pos = this._getMousePos(e);
    if (this.dragTarget === 'resize' && this.selectedBarIdx >= 0) {
      const bar = this.bars[this.selectedBarIdx];
      const barX = this._getBarX(this.selectedBarIdx);
      const newWidth = Math.max(pos.x - barX, this.opts.unitWidth);
      const newUnits = Math.max(1, Math.round(newWidth / this.opts.unitWidth));
      if (newUnits !== bar.units) {
        bar.units = newUnits;
        this.render();
        this._notifyChange();
      }
    }
  }

  _onMouseUp(e) {
    if (this.dragging) {
      this.dragging = false;
      this.canvas.style.cursor = 'crosshair';
      if (this.dragTarget === 'resize') {
        this._saveHistory();
      }
    }
  }

  _onDblClick(e) {
    if (this.opts.readOnly) return;
    const pos = this._getMousePos(e);
    const hitBar = this._hitTestBar(pos);
    if (hitBar >= 0) {
      this._editBarLabel(hitBar);
    }
  }

  _hitTestBar(pos) {
    for (let i = 0; i < this.bars.length; i++) {
      const bx = this._getBarX(i);
      const by = this._getBarY(i);
      const bw = this.bars[i].units * this.opts.unitWidth;
      const bh = this.opts.barHeight;
      if (pos.x >= bx && pos.x <= bx + bw && pos.y >= by && pos.y <= by + bh) {
        return i;
      }
    }
    return -1;
  }

  // ── Bar Positioning ────────────────────────────────
  _getBarX(idx) {
    return this.opts.startX;
  }

  _getBarY(idx) {
    let section = 0;
    if (this.opts.beforeAfter) {
      const bar = this.bars[idx];
      section = bar.section || 0; // 0 = before, 1 = after
    }
    let count = 0;
    for (let i = 0; i < idx; i++) {
      if (!this.opts.beforeAfter || (this.bars[i].section || 0) === section) count++;
    }
    const sectionOffset = section === 1 ? this.opts.height / 2 + 10 : 0;
    return this.opts.startY + sectionOffset + count * (this.opts.barHeight + this.opts.barGap);
  }

  // ── Interactive Actions ────────────────────────────
  _addBarInteractive() {
    const label = prompt('Enter label for this bar (e.g., Ali, Ben):');
    if (!label) return;
    const unitsStr = prompt('How many units?', '3');
    const units = parseInt(unitsStr) || 3;
    this.addBar(label, units);
  }

  _addBracketInteractive() {
    if (this.bars.length === 0) { Toast.show('Add bars first', 'info'); return; }

    const type = prompt('Bracket type? Enter:\n1 = Total (spans full bar)\n2 = Partial (spans some units)\n3 = Multi-bar (spans multiple bars)', '1');
    if (!type) return;

    if (type === '1' && this.selectedBarIdx >= 0) {
      const label = prompt('Bracket label (e.g., 56, ?):', '?');
      if (label === null) return;
      this.addBracket({
        barIdx: this.selectedBarIdx,
        startUnit: 0,
        endUnit: this.bars[this.selectedBarIdx].units - 1,
        label: label,
        side: 'bottom'
      });
    } else if (type === '2' && this.selectedBarIdx >= 0) {
      const bar = this.bars[this.selectedBarIdx];
      const start = parseInt(prompt(`Start unit (0 to ${bar.units - 1}):`, '0')) || 0;
      const end = parseInt(prompt(`End unit (${start} to ${bar.units - 1}):`, String(bar.units - 1)));
      const label = prompt('Label:', '?');
      if (label === null) return;
      this.addBracket({ barIdx: this.selectedBarIdx, startUnit: start, endUnit: end, label, side: 'bottom' });
    } else if (type === '3') {
      const from = parseInt(prompt(`From bar index (0 to ${this.bars.length - 1}):`, '0')) || 0;
      const to = parseInt(prompt(`To bar index (0 to ${this.bars.length - 1}):`, String(this.bars.length - 1)));
      const label = prompt('Label:', '?');
      if (label === null) return;
      this.addBracket({ barIdxStart: from, barIdxEnd: to, label, side: 'right' });
    }
  }

  _addDiffInteractive() {
    if (this.bars.length < 2) { Toast.show('Need at least 2 bars', 'info'); return; }
    const b1 = parseInt(prompt(`First bar index (0 to ${this.bars.length - 1}):`, '0')) || 0;
    const b2 = parseInt(prompt(`Second bar index (0 to ${this.bars.length - 1}):`, '1'));
    const label = prompt('Difference label:', '?');
    if (label === null) return;
    this.addDifference(b1, b2, label);
  }

  _addArrowInteractive() {
    if (this.bars.length < 2) { Toast.show('Need at least 2 bars', 'info'); return; }
    const from = parseInt(prompt(`From bar index (0 to ${this.bars.length - 1}):`, '0')) || 0;
    const to = parseInt(prompt(`To bar index (0 to ${this.bars.length - 1}):`, '1'));
    const label = prompt('Arrow label (e.g., "gave 5"):', '');
    this.addArrow(from, to, label || '');
  }

  _editBarLabel(idx) {
    const bar = this.bars[idx];
    const newLabel = prompt('Edit label:', bar.label);
    if (newLabel !== null && newLabel !== bar.label) {
      bar.label = newLabel;
      this._saveHistory();
      this.render();
      this._notifyChange();
    }
  }

  _updateProps() {
    const props = document.getElementById(this.containerId + '-props');
    if (!props) return;

    if (this.selectedBarIdx < 0 || this.selectedBarIdx >= this.bars.length) {
      props.innerHTML = '<span style="color:var(--muted);font-size:.78rem">Click a bar to edit, or use + Bar to add one.</span>';
      return;
    }

    const bar = this.bars[this.selectedBarIdx];
    props.innerHTML = `
      <label>Label: <input type="text" value="${bar.label}" id="prop-label" style="width:100px"></label>
      <label>Units: <input type="number" value="${bar.units}" min="1" max="20" id="prop-units" style="width:55px"></label>
      <label>Unit label:
        <input type="text" placeholder="e.g. 12 each" id="prop-unitlabel" style="width:90px"
          value="${bar.unitLabel || ''}">
      </label>
      <button class="tool-btn" id="prop-delete" style="margin-left:auto;color:var(--wrong)">Delete</button>`;

    props.querySelector('#prop-label').addEventListener('change', e => {
      bar.label = e.target.value;
      this._saveHistory();
      this.render();
      this._notifyChange();
    });
    props.querySelector('#prop-units').addEventListener('change', e => {
      bar.units = Math.max(1, parseInt(e.target.value) || 1);
      this._saveHistory();
      this.render();
      this._notifyChange();
    });
    props.querySelector('#prop-unitlabel').addEventListener('change', e => {
      bar.unitLabel = e.target.value;
      this._saveHistory();
      this.render();
      this._notifyChange();
    });
    props.querySelector('#prop-delete').addEventListener('click', () => {
      this.removeBar(this.selectedBarIdx);
    });
  }

  // ── Public API ─────────────────────────────────────
  addBar(label, units = 3, options = {}) {
    const bar = {
      label: label,
      units: units,
      color: options.color || this.opts.colors[this.colorIdx % this.opts.colors.length],
      unitLabel: options.unitLabel || '',
      section: options.section || 0, // 0 = before/main, 1 = after
      highlights: options.highlights || [] // [{startUnit, endUnit, color}]
    };
    this.colorIdx++;
    this.bars.push(bar);
    this._saveHistory();
    this.render();
    this._notifyChange();
    return this.bars.length - 1;
  }

  removeBar(idx) {
    if (idx < 0 || idx >= this.bars.length) return;
    this.bars.splice(idx, 1);
    // Clean up related elements
    this.brackets = this.brackets.filter(b =>
      b.barIdx !== idx && b.barIdxStart !== idx && b.barIdxEnd !== idx
    );
    this.differences = this.differences.filter(d => d.bar1 !== idx && d.bar2 !== idx);
    this.arrows = this.arrows.filter(a => a.fromBar !== idx && a.toBar !== idx);

    if (this.selectedBarIdx === idx) this.selectedBarIdx = -1;
    else if (this.selectedBarIdx > idx) this.selectedBarIdx--;

    this._saveHistory();
    this._updateProps();
    this.render();
    this._notifyChange();
  }

  setBarUnits(idx, units) {
    if (idx < 0 || idx >= this.bars.length) return;
    this.bars[idx].units = Math.max(1, units);
    this._saveHistory();
    this.render();
    this._notifyChange();
  }

  addBracket(config) {
    this.brackets.push({
      barIdx: config.barIdx ?? -1,
      barIdxStart: config.barIdxStart ?? -1,
      barIdxEnd: config.barIdxEnd ?? -1,
      startUnit: config.startUnit ?? 0,
      endUnit: config.endUnit ?? 0,
      label: config.label || '?',
      side: config.side || 'bottom'
    });
    this._saveHistory();
    this.render();
    this._notifyChange();
  }

  addDifference(bar1Idx, bar2Idx, label) {
    this.differences.push({ bar1: bar1Idx, bar2: bar2Idx, label: label || '?' });
    this._saveHistory();
    this.render();
    this._notifyChange();
  }

  addArrow(fromBar, toBar, label) {
    this.arrows.push({ fromBar, toBar, label: label || '' });
    this._saveHistory();
    this.render();
    this._notifyChange();
  }

  addUnitLabel(barIdx, startUnit, endUnit, label) {
    this.unitLabels.push({ barIdx, startUnit, endUnit, label });
    this._saveHistory();
    this.render();
    this._notifyChange();
  }

  clear() {
    this.bars = [];
    this.brackets = [];
    this.differences = [];
    this.unitLabels = [];
    this.arrows = [];
    this.selectedBarIdx = -1;
    this.colorIdx = 0;
    this._saveHistory();
    this._updateProps();
    this.render();
    this._notifyChange();
  }

  // ── History (Undo/Redo) ────────────────────────────
  _saveHistory() {
    const state = JSON.stringify({
      bars: this.bars, brackets: this.brackets,
      differences: this.differences, unitLabels: this.unitLabels,
      arrows: this.arrows
    });
    // Truncate future
    this.history = this.history.slice(0, this.historyIdx + 1);
    this.history.push(state);
    this.historyIdx = this.history.length - 1;
    // Limit history
    if (this.history.length > 50) {
      this.history.shift();
      this.historyIdx--;
    }
  }

  _restoreHistory(idx) {
    const state = JSON.parse(this.history[idx]);
    this.bars = state.bars;
    this.brackets = state.brackets;
    this.differences = state.differences;
    this.unitLabels = state.unitLabels;
    this.arrows = state.arrows;
    this.selectedBarIdx = -1;
    this._updateProps();
    this.render();
    this._notifyChange();
  }

  undo() {
    if (this.historyIdx > 0) {
      this.historyIdx--;
      this._restoreHistory(this.historyIdx);
    }
  }

  redo() {
    if (this.historyIdx < this.history.length - 1) {
      this.historyIdx++;
      this._restoreHistory(this.historyIdx);
    }
  }

  // ── Load/Export ────────────────────────────────────
  getModel() {
    return {
      bars: JSON.parse(JSON.stringify(this.bars)),
      brackets: JSON.parse(JSON.stringify(this.brackets)),
      differences: JSON.parse(JSON.stringify(this.differences)),
      unitLabels: JSON.parse(JSON.stringify(this.unitLabels)),
      arrows: JSON.parse(JSON.stringify(this.arrows))
    };
  }

  loadModel(data) {
    this.bars = data.bars || [];
    this.brackets = data.brackets || [];
    this.differences = data.differences || [];
    this.unitLabels = data.unitLabels || [];
    this.arrows = data.arrows || [];
    this.selectedBarIdx = -1;
    this.colorIdx = this.bars.length;
    this._saveHistory();
    this._updateProps();
    this.render();
  }

  toImage() {
    return this.canvas.toDataURL('image/png');
  }

  // ── Guided Mode ────────────────────────────────────
  startGuided(steps) {
    this.guidedSteps = steps;
    this.guidedCurrent = 0;
    this.opts.mode = 'guided';
    this.clear();
    this._renderGuidedStep();
  }

  _renderGuidedStep() {
    if (!this.guidedContainer) return;
    if (this.guidedCurrent >= this.guidedSteps.length) {
      this.guidedContainer.innerHTML = `
        <div class="guided-instruction" style="border-color:var(--correct);background:rgba(16,185,129,.1);color:var(--correct)">
          Model complete! Well done.
        </div>`;
      if (this.opts.onGuidedComplete) this.opts.onGuidedComplete();
      return;
    }

    const step = this.guidedSteps[this.guidedCurrent];
    const total = this.guidedSteps.length;

    this.guidedContainer.innerHTML = `
      <div class="guided-instruction">
        <div class="guided-step-num">${this.guidedCurrent + 1}</div>
        <div style="flex:1">
          <div>${step.instruction}</div>
          ${step.hint ? `<div style="font-size:.75rem;color:var(--muted);margin-top:.2rem">${step.hint}</div>` : ''}
        </div>
        <button class="btn btn-primary btn-sm" id="guided-do">Do It</button>
      </div>
      <div class="guided-progress">
        ${Array.from({ length: total }, (_, i) =>
          `<div class="guided-dot ${i < this.guidedCurrent ? 'done' : i === this.guidedCurrent ? 'current' : ''}"></div>`
        ).join('')}
      </div>`;

    this.guidedContainer.querySelector('#guided-do').addEventListener('click', () => {
      this._executeGuidedStep(step);
    });
  }

  _executeGuidedStep(step) {
    switch (step.action) {
      case 'addBar':
        this.addBar(step.label, step.units, step.options || {});
        break;
      case 'addBracket':
        this.addBracket(step.config);
        break;
      case 'addDifference':
        this.addDifference(step.bar1, step.bar2, step.label);
        break;
      case 'addUnitLabel':
        this.addUnitLabel(step.barIdx, step.startUnit, step.endUnit, step.label);
        break;
      case 'addArrow':
        this.addArrow(step.fromBar, step.toBar, step.label);
        break;
    }
    this.guidedCurrent++;
    this._renderGuidedStep();
  }

  // ── Demo Mode (Animated Build) ─────────────────────
  async playDemo(steps, delay = 800) {
    this.clear();
    for (const step of steps) {
      await new Promise(r => setTimeout(r, delay));
      this._executeGuidedStep(step);
    }
  }

  // ── Rendering ──────────────────────────────────────
  render() {
    const ctx = this.ctx;
    const w = this.opts.width;
    const h = this.opts.height;

    // Clear
    ctx.fillStyle = '#0d1117';
    ctx.fillRect(0, 0, w, h);

    // Before/After divider
    if (this.opts.beforeAfter) {
      const midY = h / 2;
      // Before label
      ctx.fillStyle = '#94a3b8';
      ctx.font = '600 11px Inter, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('BEFORE', 8, 18);
      // Divider
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1;
      ctx.setLineDash([6, 4]);
      ctx.beginPath();
      ctx.moveTo(0, midY);
      ctx.lineTo(w, midY);
      ctx.stroke();
      ctx.setLineDash([]);
      // After label
      ctx.fillText('AFTER', 8, midY + 18);
    }

    // Draw bars
    this.bars.forEach((bar, i) => {
      this._drawBar(ctx, bar, i);
    });

    // Draw brackets
    this.brackets.forEach(br => {
      this._drawBracket(ctx, br);
    });

    // Draw differences
    this.differences.forEach(d => {
      this._drawDifference(ctx, d);
    });

    // Draw unit labels
    this.unitLabels.forEach(ul => {
      this._drawUnitLabel(ctx, ul);
    });

    // Draw arrows
    this.arrows.forEach(a => {
      this._drawArrow(ctx, a);
    });
  }

  _drawBar(ctx, bar, idx) {
    const x = this._getBarX(idx);
    const y = this._getBarY(idx);
    const totalW = bar.units * this.opts.unitWidth;
    const h = this.opts.barHeight;

    // Bar fill
    ctx.fillStyle = bar.color + '33'; // semi-transparent
    ctx.fillRect(x, y, totalW, h);

    // Bar border
    ctx.strokeStyle = bar.color;
    ctx.lineWidth = idx === this.selectedBarIdx ? 2.5 : 1.5;
    ctx.strokeRect(x, y, totalW, h);

    // Unit divisions
    if (bar.units > 1) {
      ctx.strokeStyle = bar.color + '66';
      ctx.lineWidth = 1;
      for (let u = 1; u < bar.units; u++) {
        const ux = x + u * this.opts.unitWidth;
        ctx.beginPath();
        ctx.moveTo(ux, y);
        ctx.lineTo(ux, y + h);
        ctx.stroke();
      }
    }

    // Highlights
    if (bar.highlights) {
      bar.highlights.forEach(hl => {
        const hx = x + hl.startUnit * this.opts.unitWidth;
        const hw = (hl.endUnit - hl.startUnit + 1) * this.opts.unitWidth;
        ctx.fillStyle = (hl.color || '#f59e0b') + '44';
        ctx.fillRect(hx, y, hw, h);
      });
    }

    // Unit value labels inside bar
    if (bar.unitLabel) {
      ctx.fillStyle = bar.color;
      ctx.font = '600 11px Inter, sans-serif';
      ctx.textAlign = 'center';
      for (let u = 0; u < bar.units; u++) {
        const cx = x + u * this.opts.unitWidth + this.opts.unitWidth / 2;
        ctx.fillText(bar.unitLabel, cx, y + h / 2 + 4);
      }
    }

    // Bar label (left side)
    ctx.fillStyle = '#e2e8f0';
    ctx.font = '600 13px Inter, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(bar.label, x - 10, y + h / 2 + 5);

    // Selection indicator
    if (idx === this.selectedBarIdx) {
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 3]);
      ctx.strokeRect(x - 3, y - 3, totalW + 6, h + 6);
      ctx.setLineDash([]);
    }
  }

  _drawBracket(ctx, br) {
    if (br.side === 'right' && br.barIdxStart >= 0 && br.barIdxEnd >= 0) {
      // Multi-bar bracket on the right
      const y1 = this._getBarY(br.barIdxStart);
      const y2 = this._getBarY(br.barIdxEnd) + this.opts.barHeight;
      const maxW = Math.max(
        ...this.bars.slice(br.barIdxStart, br.barIdxEnd + 1).map(b => b.units)
      ) * this.opts.unitWidth;
      const x = this.opts.startX + maxW + 15;

      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      // Curly-ish bracket
      ctx.moveTo(x, y1);
      ctx.lineTo(x + 8, y1);
      ctx.lineTo(x + 8, y2);
      ctx.lineTo(x, y2);
      ctx.stroke();
      // Tick in middle
      const midY = (y1 + y2) / 2;
      ctx.beginPath();
      ctx.moveTo(x + 8, midY);
      ctx.lineTo(x + 14, midY);
      ctx.stroke();

      // Label
      ctx.fillStyle = '#e2e8f0';
      ctx.font = '700 13px Inter, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(br.label, x + 18, midY + 5);
      return;
    }

    if (br.barIdx < 0 || br.barIdx >= this.bars.length) return;
    const bar = this.bars[br.barIdx];
    const bx = this._getBarX(br.barIdx);
    const by = this._getBarY(br.barIdx);

    const startX = bx + br.startUnit * this.opts.unitWidth;
    const endX = bx + (br.endUnit + 1) * this.opts.unitWidth;
    const bWidth = endX - startX;

    if (br.side === 'bottom') {
      const bracketY = by + this.opts.barHeight + 6;
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(startX, bracketY);
      ctx.lineTo(startX, bracketY + 8);
      ctx.lineTo(endX, bracketY + 8);
      ctx.lineTo(endX, bracketY);
      ctx.stroke();
      // Tick
      const midX = (startX + endX) / 2;
      ctx.beginPath();
      ctx.moveTo(midX, bracketY + 8);
      ctx.lineTo(midX, bracketY + 14);
      ctx.stroke();

      ctx.fillStyle = '#e2e8f0';
      ctx.font = '700 13px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(br.label, midX, bracketY + 26);
    } else if (br.side === 'top') {
      const bracketY = by - 6;
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(startX, bracketY);
      ctx.lineTo(startX, bracketY - 8);
      ctx.lineTo(endX, bracketY - 8);
      ctx.lineTo(endX, bracketY);
      ctx.stroke();
      const midX = (startX + endX) / 2;
      ctx.beginPath();
      ctx.moveTo(midX, bracketY - 8);
      ctx.lineTo(midX, bracketY - 14);
      ctx.stroke();

      ctx.fillStyle = '#e2e8f0';
      ctx.font = '700 13px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(br.label, midX, bracketY - 18);
    }
  }

  _drawDifference(ctx, diff) {
    if (diff.bar1 >= this.bars.length || diff.bar2 >= this.bars.length) return;
    const bar1 = this.bars[diff.bar1];
    const bar2 = this.bars[diff.bar2];
    const w1 = bar1.units * this.opts.unitWidth;
    const w2 = bar2.units * this.opts.unitWidth;

    const shorter = Math.min(w1, w2);
    const longer = Math.max(w1, w2);
    const x = this.opts.startX + shorter;
    const endX = this.opts.startX + longer;

    const y1 = this._getBarY(diff.bar1) + this.opts.barHeight / 2;
    const y2 = this._getBarY(diff.bar2) + this.opts.barHeight / 2;

    // Difference area (shaded)
    const topY = Math.min(this._getBarY(diff.bar1), this._getBarY(diff.bar2));
    const botY = Math.max(
      this._getBarY(diff.bar1) + this.opts.barHeight,
      this._getBarY(diff.bar2) + this.opts.barHeight
    );

    ctx.fillStyle = 'rgba(239,68,68,.08)';
    ctx.fillRect(x, topY, endX - x, botY - topY);

    // Bracket on the right of the difference
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 1.5;
    const bx = endX + 4;
    ctx.beginPath();
    ctx.moveTo(x, y1);
    ctx.lineTo(bx, y1);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y2);
    ctx.lineTo(bx, y2);
    ctx.stroke();
    // Vertical line
    ctx.beginPath();
    ctx.moveTo(bx, y1);
    ctx.lineTo(bx, y2);
    ctx.stroke();
    // Arrow
    const midY = (y1 + y2) / 2;
    ctx.beginPath();
    ctx.moveTo(bx, midY);
    ctx.lineTo(bx + 8, midY);
    ctx.stroke();

    // Label
    ctx.fillStyle = '#fca5a5';
    ctx.font = '700 13px Inter, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(diff.label, bx + 12, midY + 5);
  }

  _drawUnitLabel(ctx, ul) {
    if (ul.barIdx >= this.bars.length) return;
    const bx = this._getBarX(ul.barIdx);
    const by = this._getBarY(ul.barIdx);

    const startX = bx + ul.startUnit * this.opts.unitWidth;
    const endX = bx + (ul.endUnit + 1) * this.opts.unitWidth;
    const midX = (startX + endX) / 2;

    // Small bracket above the units
    const bracketY = by - 4;
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(startX + 2, bracketY);
    ctx.lineTo(startX + 2, bracketY - 5);
    ctx.lineTo(endX - 2, bracketY - 5);
    ctx.lineTo(endX - 2, bracketY);
    ctx.stroke();

    ctx.fillStyle = '#fcd34d';
    ctx.font = '600 11px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(ul.label, midX, bracketY - 9);
  }

  _drawArrow(ctx, arrow) {
    if (arrow.fromBar >= this.bars.length || arrow.toBar >= this.bars.length) return;

    const fromY = this._getBarY(arrow.fromBar) + this.opts.barHeight / 2;
    const toY = this._getBarY(arrow.toBar) + this.opts.barHeight / 2;
    const fromW = this.bars[arrow.fromBar].units * this.opts.unitWidth;
    const toW = this.bars[arrow.toBar].units * this.opts.unitWidth;

    const x = this.opts.startX + Math.max(fromW, toW) + 30;

    ctx.strokeStyle = '#818cf8';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(x, fromY);
    ctx.quadraticCurveTo(x + 25, (fromY + toY) / 2, x, toY);
    ctx.stroke();

    // Arrowhead
    const headSize = 6;
    const angle = toY > fromY ? Math.PI / 2 : -Math.PI / 2;
    ctx.fillStyle = '#818cf8';
    ctx.beginPath();
    ctx.moveTo(x, toY);
    ctx.lineTo(x - headSize * Math.cos(angle - 0.5), toY - headSize * Math.sin(angle - 0.5));
    ctx.lineTo(x - headSize * Math.cos(angle + 0.5), toY - headSize * Math.sin(angle + 0.5));
    ctx.closePath();
    ctx.fill();

    // Label
    if (arrow.label) {
      ctx.fillStyle = '#a5b4fc';
      ctx.font = '600 11px Inter, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(arrow.label, x + 28, (fromY + toY) / 2 + 4);
    }
  }

  // ── Notification ───────────────────────────────────
  _notifyChange() {
    if (this.opts.onModelChange) {
      this.opts.onModelChange(this.getModel());
    }
  }
}

// ── Static Demo Builder (for worked examples) ────────
function renderStaticModel(containerId, modelData, options = {}) {
  const builder = new ModelBuilder(containerId, {
    readOnly: true,
    showToolbar: false,
    showProps: false,
    width: options.width || 620,
    height: options.height || 250,
    beforeAfter: options.beforeAfter || false,
    ...options
  });
  if (modelData.bars) {
    modelData.bars.forEach(b => builder.addBar(b.label, b.units, b));
  }
  if (modelData.brackets) {
    modelData.brackets.forEach(br => builder.addBracket(br));
  }
  if (modelData.differences) {
    modelData.differences.forEach(d => builder.addDifference(d.bar1, d.bar2, d.label));
  }
  if (modelData.unitLabels) {
    modelData.unitLabels.forEach(ul => builder.addUnitLabel(ul.barIdx, ul.startUnit, ul.endUnit, ul.label));
  }
  if (modelData.arrows) {
    modelData.arrows.forEach(a => builder.addArrow(a.fromBar, a.toBar, a.label));
  }
  return builder;
}
