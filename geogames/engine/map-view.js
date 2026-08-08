/* ===========================================================================
   GeoGames - Flat map

   An Equal Earth world map on canvas, with the same public shape as GlobeView
   so a screen can swap between the two without knowing which it is holding.
   Equal Earth is an equal-area projection, which matters here: on the Mercator
   map most people grew up with, Greenland looks the size of Africa when it is
   actually about a fourteenth of it.
   =========================================================================== */

import { FlatMap } from './geo.js';
import { prefersReducedMotion } from './ui.js';

export class MapView {
  constructor(host, countries, opts = {}) {
    this.host = host;
    this.countries = countries;
    this.opts = opts;
    this.map = new FlatMap();
    this.paintFn = null;
    this.highlight = new Set();
    this.markers = [];
    this.labels = false;
    this.hoverIso = null;
    this.dimUnpainted = !!opts.dimUnpainted;
    this.interactive = opts.interactive !== false;
    this.visibleOnly = opts.visibleOnly || null;
    this._pointers = new Map();
    this._pinchStart = null;
    this._destroyed = false;
    this._fly = null;

    this.canvas = document.createElement('canvas');
    this.canvas.className = 'map-canvas';
    if (this.interactive) {
      this.canvas.tabIndex = 0;
      this.canvas.setAttribute('role', 'application');
      this.canvas.setAttribute('aria-label', opts.ariaLabel || 'World map. Drag to pan, scroll to zoom.');
    } else {
      this.canvas.setAttribute('aria-hidden', 'true');
    }
    host.appendChild(this.canvas);
    this.ctx = this.canvas.getContext('2d');

    this._onResize = () => this.resize();
    window.addEventListener('resize', this._onResize, { passive: true });
    if (window.ResizeObserver) {
      this._ro = new ResizeObserver(() => this.resize());
      this._ro.observe(host);
    }
    if (this.interactive) this._bindInput();

    this.resize();
    this._loop = this._loop.bind(this);
    this._raf = requestAnimationFrame(this._loop);
  }

  setPaint(fn) { this.paintFn = fn; this.dirty = true; return this; }
  setHighlight(isos) { this.highlight = new Set(isos || []); this.dirty = true; return this; }
  setMarkers(m) { this.markers = m || []; this.dirty = true; return this; }
  setArcs() { return this; }               // no arcs on the flat map
  setLabels(on) { this.labels = !!on; this.dirty = true; return this; }
  setAutoSpin() { return this; }

  setZoom(z, anchor = null) {
    const next = Math.max(1, Math.min(8, z));
    if (anchor) {
      // Keep the point under the cursor fixed while zooming.
      const before = this.map.invert(anchor[0], anchor[1]);
      this.map.zoom = next;
      const after = before ? this.map.project(before[0], before[1]) : null;
      if (after) {
        this.map.panX += anchor[0] - after[0];
        this.map.panY += anchor[1] - after[1];
      }
    } else {
      this.map.zoom = next;
    }
    this.zoom = next;
    this._clampPan();
    this.dirty = true;
    return this;
  }

  flyTo(lon, lat, { ms = 700, zoom = null } = {}) {
    const target = zoom || this.map.zoom;
    const apply = () => {
      this.map.zoom = target;
      this.map.panX = 0; this.map.panY = 0;
      const p = this.map.project(lon, lat);
      this.map.panX = this.map.cx - p[0];
      this.map.panY = this.map.cy - p[1];
      this._clampPan();
      this.dirty = true;
    };
    if (prefersReducedMotion() || ms <= 0) { apply(); return Promise.resolve(); }
    const from = { x: this.map.panX, y: this.map.panY, z: this.map.zoom };
    apply();
    const to = { x: this.map.panX, y: this.map.panY, z: this.map.zoom };
    this.map.panX = from.x; this.map.panY = from.y; this.map.zoom = from.z;
    const start = performance.now();
    return new Promise(resolve => { this._fly = { start, ms, from, to, resolve }; });
  }

  resize() {
    if (this._destroyed) return;
    const rect = this.host.getBoundingClientRect();
    const w = Math.max(1, Math.round(rect.width));
    const h = Math.max(1, Math.round(rect.height));
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    if (this.canvas.width !== w * dpr || this.canvas.height !== h * dpr) {
      this.canvas.width = w * dpr;
      this.canvas.height = h * dpr;
      this.canvas.style.width = w + 'px';
      this.canvas.style.height = h + 'px';
    }
    this.w = w; this.h = h; this.dpr = dpr;
    this.map.fit(w, h);
    this._clampPan();
    this.dirty = true;
  }

  /* Stop the world being dragged entirely off screen. */
  _clampPan() {
    const halfW = this.map.scale * this.map.zoom * 2.7;
    const halfH = this.map.scale * this.map.zoom * 1.35;
    const limX = Math.max(0, halfW - this.w / 2 + 40);
    const limY = Math.max(0, halfH - this.h / 2 + 40);
    this.map.panX = Math.max(-limX, Math.min(limX, this.map.panX));
    this.map.panY = Math.max(-limY, Math.min(limY, this.map.panY));
  }

  _bindInput() {
    const cv = this.canvas;
    let moved = 0;

    cv.addEventListener('pointerdown', e => {
      cv.setPointerCapture(e.pointerId);
      this._pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      moved = 0;
      this._fly = null;
      if (this._pointers.size === 2) {
        this._pinchStart = { dist: this._pinchDistance(), zoom: this.map.zoom };
      }
    });

    cv.addEventListener('pointermove', e => {
      const prev = this._pointers.get(e.pointerId);
      if (!prev) { this._updateHover(e); return; }
      const dx = e.clientX - prev.x, dy = e.clientY - prev.y;
      this._pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      moved += Math.abs(dx) + Math.abs(dy);
      if (this._pointers.size >= 2 && this._pinchStart) {
        const d = this._pinchDistance();
        if (d > 0) this.setZoom(this._pinchStart.zoom * (d / this._pinchStart.dist), this._pinchCentre());
        return;
      }
      this.map.panX += dx;
      this.map.panY += dy;
      this._clampPan();
      this.dirty = true;
    });

    const up = e => {
      const had = this._pointers.delete(e.pointerId);
      if (this._pointers.size < 2) this._pinchStart = null;
      if (this._pointers.size === 0 && had && moved < 8 && this.opts.onPick) this._pick(e);
    };
    cv.addEventListener('pointerup', up);
    cv.addEventListener('pointercancel', up);
    cv.addEventListener('pointerleave', () => {
      if (this.hoverIso) { this.hoverIso = null; this.dirty = true; }
    });

    cv.addEventListener('wheel', e => {
      e.preventDefault();
      this.setZoom(this.map.zoom * (e.deltaY < 0 ? 1.14 : 1 / 1.14), this._canvasPoint(e));
    }, { passive: false });

    cv.addEventListener('keydown', e => {
      const step = e.shiftKey ? 120 : 45;
      let handled = true;
      switch (e.key) {
        case 'ArrowLeft':  this.map.panX += step; break;
        case 'ArrowRight': this.map.panX -= step; break;
        case 'ArrowUp':    this.map.panY += step; break;
        case 'ArrowDown':  this.map.panY -= step; break;
        case '+': case '=': this.setZoom(this.map.zoom * 1.2); break;
        case '-': case '_': this.setZoom(this.map.zoom / 1.2); break;
        default: handled = false;
      }
      if (handled) { e.preventDefault(); this._clampPan(); this.dirty = true; }
    });
  }

  _pinchDistance() {
    const [a, b] = [...this._pointers.values()];
    return Math.hypot(a.x - b.x, a.y - b.y);
  }

  _pinchCentre() {
    const [a, b] = [...this._pointers.values()];
    const r = this.canvas.getBoundingClientRect();
    return [(a.x + b.x) / 2 - r.left, (a.y + b.y) / 2 - r.top];
  }

  _canvasPoint(e) {
    const r = this.canvas.getBoundingClientRect();
    return [e.clientX - r.left, e.clientY - r.top];
  }

  _isoAt(lon, lat) {
    const list = this.visibleOnly || Object.keys(this.countries);
    for (const iso of list) {
      const c = this.countries[iso];
      if (!c) continue;
      for (const ring of c.rings) {
        const b = ring.bbox;
        if (lat < b[1] || lat > b[3] || lon < b[0] || lon > b[2]) continue;
        const { ll, n } = ring;
        let inside = false;
        for (let i = 0, j = n - 1; i < n; j = i++) {
          const yi = ll[i * 2 + 1], yj = ll[j * 2 + 1];
          if ((yi > lat) !== (yj > lat)) {
            const xi = ll[i * 2], xj = ll[j * 2];
            if (lon < (xj - xi) * (lat - yi) / (yj - yi) + xi) inside = !inside;
          }
        }
        if (inside) return iso;
      }
    }
    return null;
  }

  _updateHover(e) {
    if (!this.opts.hover) return;
    const [x, y] = this._canvasPoint(e);
    const ll = this.map.invert(x, y);
    const iso = ll ? this._isoAt(ll[0], ll[1]) : null;
    if (iso !== this.hoverIso) {
      this.hoverIso = iso;
      this.canvas.style.cursor = iso ? 'pointer' : 'grab';
      this.dirty = true;
      if (this.opts.onHover) this.opts.onHover(iso);
    }
  }

  _pick(e) {
    const [x, y] = this._canvasPoint(e);
    const ll = this.map.invert(x, y);
    if (!ll) { this.opts.onPick(null, null); return; }
    this.opts.onPick(this._isoAt(ll[0], ll[1]), ll);
  }

  _loop(now) {
    if (this._destroyed) return;
    this._raf = requestAnimationFrame(this._loop);
    if (this._fly) {
      const f = this._fly;
      const t = Math.min(1, (now - f.start) / f.ms);
      const e = 1 - Math.pow(1 - t, 3);
      this.map.zoom = f.from.z + (f.to.z - f.from.z) * e;
      this.map.panX = f.from.x + (f.to.x - f.from.x) * e;
      this.map.panY = f.from.y + (f.to.y - f.from.y) * e;
      this.dirty = true;
      if (t >= 1) { this._fly = null; f.resolve(); }
    }
    if (this.dirty || this.markers.some(m => m.pulse)) {
      this.dirty = false;
      this.draw();
    }
  }

  draw() {
    const { ctx, w, h, dpr } = this;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);

    // The sea: the projection outline, traced as the meridians at +/-180.
    ctx.beginPath();
    for (let lat = -90; lat <= 90; lat += 2) {
      const p = this.map.project(-180, lat);
      lat === -90 ? ctx.moveTo(p[0], p[1]) : ctx.lineTo(p[0], p[1]);
    }
    for (let lat = 90; lat >= -90; lat -= 2) {
      const p = this.map.project(180, lat);
      ctx.lineTo(p[0], p[1]);
    }
    ctx.closePath();
    ctx.fillStyle = '#0f2440';
    ctx.fill();
    ctx.strokeStyle = 'rgba(147,197,253,0.28)';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.save();
    ctx.clip();

    // Graticule
    ctx.strokeStyle = 'rgba(148,197,253,0.10)';
    ctx.lineWidth = 0.6;
    ctx.beginPath();
    for (let lon = -150; lon <= 150; lon += 30) {
      for (let lat = -90; lat <= 90; lat += 2) {
        const p = this.map.project(lon, lat);
        lat === -90 ? ctx.moveTo(p[0], p[1]) : ctx.lineTo(p[0], p[1]);
      }
    }
    for (let lat = -60; lat <= 60; lat += 30) {
      for (let lon = -180; lon <= 180; lon += 4) {
        const p = this.map.project(lon, lat);
        lon === -180 ? ctx.moveTo(p[0], p[1]) : ctx.lineTo(p[0], p[1]);
      }
    }
    ctx.stroke();

    ctx.lineJoin = 'round';
    const highlighted = [];
    for (const iso in this.countries) {
      if (this.highlight.has(iso)) { highlighted.push(this.countries[iso]); continue; }
      this._fillCountry(this.countries[iso], false);
    }
    for (const c of highlighted) this._fillCountry(c, true);

    if (this.labels) this._drawLabels();
    this._drawMarkers();
    ctx.restore();
  }

  _fillCountry(country, glow) {
    const ctx = this.ctx;
    const colour = (this.paintFn && this.paintFn(country.iso)) ||
                   (this.dimUnpainted ? '#22334d' : '#33506d');
    ctx.beginPath();
    for (const ring of country.rings) this.map.traceRing(ctx, ring);
    if (glow) {
      ctx.save();
      ctx.shadowColor = colour;
      ctx.shadowBlur = 14;
    }
    ctx.fillStyle = colour;
    ctx.fill('evenodd');
    const hovered = country.iso === this.hoverIso;
    ctx.strokeStyle = glow ? 'rgba(255,255,255,0.95)'
                     : hovered ? 'rgba(255,255,255,0.8)'
                     : 'rgba(10,24,44,0.7)';
    ctx.lineWidth = glow || hovered ? 1.6 : 0.5;
    ctx.stroke();
    if (glow) ctx.restore();
  }

  _drawLabels() {
    const ctx = this.ctx;
    const min = 90000 / (this.map.zoom * this.map.zoom);
    ctx.font = '600 11px "Inter Tight", system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.lineWidth = 3;
    ctx.strokeStyle = 'rgba(3,10,22,0.85)';
    ctx.fillStyle = 'rgba(226,238,255,0.94)';
    const placed = [];
    for (const iso in this.countries) {
      const c = this.countries[iso];
      if (c.area < min) continue;
      const p = this.map.project(c.centre[0], c.centre[1]);
      if (p[0] < -40 || p[0] > this.w + 40 || p[1] < -20 || p[1] > this.h + 20) continue;
      if (placed.some(q => Math.abs(q[0] - p[0]) < 44 && Math.abs(q[1] - p[1]) < 12)) continue;
      placed.push(p);
      const name = this.opts.labelFor ? this.opts.labelFor(iso) : iso;
      if (!name) continue;
      ctx.strokeText(name, p[0], p[1]);
      ctx.fillText(name, p[0], p[1]);
    }
  }

  _drawMarkers() {
    const ctx = this.ctx;
    const t = performance.now() / 1000;
    for (const m of this.markers) {
      const p = this.map.project(m.lon, m.lat);
      if (m.pulse) {
        const phase = (t % 1.4) / 1.4;
        ctx.beginPath();
        ctx.arc(p[0], p[1], 6 + phase * 18, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255,209,102,${(1 - phase).toFixed(3)})`;
        ctx.lineWidth = 2;
        ctx.stroke();
      }
      ctx.beginPath();
      ctx.arc(p[0], p[1], 6, 0, Math.PI * 2);
      ctx.fillStyle = m.colour || '#ffd166';
      ctx.fill();
      ctx.strokeStyle = 'rgba(3,10,22,0.9)';
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }

  destroy() {
    this._destroyed = true;
    cancelAnimationFrame(this._raf);
    window.removeEventListener('resize', this._onResize);
    if (this._ro) this._ro.disconnect();
    this.canvas.remove();
  }
}
