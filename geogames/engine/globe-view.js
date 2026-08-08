/* ===========================================================================
   GeoGames - Interactive globe

   A canvas orthographic globe you can spin, zoom, click and fly to. All the
   projection maths lives in geo.js; this file is the rendering and the input.

   Usage:
     const globe = new GlobeView(hostEl, countries, { onPick });
     globe.setPaint(iso => colour);
     globe.flyTo(lon, lat);
     globe.destroy();
   =========================================================================== */

import { Globe, haversineKm } from './geo.js';
import { prefersReducedMotion } from './ui.js';

const SPIN_DEG_PER_SEC = 3.2;
const IDLE_BEFORE_SPIN_MS = 2600;

export class GlobeView {
  constructor(host, countries, opts = {}) {
    this.host = host;
    this.countries = countries;
    this.opts = opts;
    this.globe = new Globe();
    this.paintFn = null;
    this.highlight = new Set();
    this.markers = [];        // { lon, lat, colour, label, pulse }
    this.arcs = [];           // { from:[lon,lat], to:[lon,lat], colour }
    this.labels = false;
    this.interactive = opts.interactive !== false;
    this.autoSpin = opts.autoSpin !== false && !prefersReducedMotion();
    this.zoom = 1;
    this.lastInteraction = 0;
    this.hoverIso = null;
    this.dimUnpainted = !!opts.dimUnpainted;
    this.visibleOnly = opts.visibleOnly || null;   // restrict picking to a list
    this._fly = null;
    this._velocity = { lambda: 0, phi: 0 };
    this._dragging = false;
    this._pointers = new Map();
    this._pinchStart = null;
    this._destroyed = false;

    this.canvas = document.createElement('canvas');
    this.canvas.className = 'globe-canvas';
    if (this.interactive) {
      this.canvas.tabIndex = 0;
      this.canvas.setAttribute('role', 'application');
      this.canvas.setAttribute('aria-label',
        opts.ariaLabel || 'Interactive globe. Drag to spin, or use the arrow keys.');
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

  /* ── configuration ───────────────────────────────────────────────────── */
  setPaint(fn) { this.paintFn = fn; this.dirty = true; return this; }
  setHighlight(isos) { this.highlight = new Set(isos || []); this.dirty = true; return this; }
  setMarkers(markers) { this.markers = markers || []; this.dirty = true; return this; }
  setArcs(arcs) { this.arcs = arcs || []; this.dirty = true; return this; }
  setLabels(on) { this.labels = !!on; this.dirty = true; return this; }
  setAutoSpin(on) { this.autoSpin = on && !prefersReducedMotion(); return this; }

  setZoom(z) {
    this.zoom = Math.max(1, Math.min(6, z));
    this.resize();
    return this;
  }

  /* Animate the camera to a lon/lat, optionally zooming as it arrives. */
  flyTo(lon, lat, { ms = 900, zoom = null } = {}) {
    if (prefersReducedMotion() || ms <= 0) {
      this.globe.set(lon, lat);
      if (zoom) this.setZoom(zoom);
      this.dirty = true;
      return Promise.resolve();
    }
    const from = { l: this.globe.lambda, p: this.globe.phi, z: this.zoom };
    // Always take the short way round, even across the antimeridian.
    let dl = ((lon - from.l + 540) % 360) - 180;
    const dp = lat - from.p;
    const dz = (zoom || from.z) - from.z;
    const start = performance.now();
    this.autoSpinPaused = true;
    return new Promise(resolve => {
      this._fly = { start, ms, from, dl, dp, dz, resolve };
    });
  }

  /* ── sizing ──────────────────────────────────────────────────────────── */
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
    this.globe.cx = w / 2;
    this.globe.cy = h / 2;
    // A host that has not been laid out yet measures 0x0, which would give a
    // negative radius and make createRadialGradient throw. Keep it positive and
    // let the ResizeObserver correct it on the next frame.
    this.globe.radius = Math.max(8, (Math.min(w, h) / 2 - 6) * this.zoom);
    this.dirty = true;
  }

  /* ── input ───────────────────────────────────────────────────────────── */
  _bindInput() {
    const cv = this.canvas;
    let moved = 0;

    const down = e => {
      cv.setPointerCapture(e.pointerId);
      this._pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      moved = 0;
      if (this._pointers.size === 1) {
        this._dragging = true;
        this._velocity = { lambda: 0, phi: 0 };
        this._fly = null;
      } else if (this._pointers.size === 2) {
        this._pinchStart = { dist: this._pinchDistance(), zoom: this.zoom };
      }
      this.lastInteraction = performance.now();
    };

    const move = e => {
      const prev = this._pointers.get(e.pointerId);
      if (!prev) {
        if (!this._dragging) this._updateHover(e);
        return;
      }
      const dx = e.clientX - prev.x, dy = e.clientY - prev.y;
      this._pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      moved += Math.abs(dx) + Math.abs(dy);
      this.lastInteraction = performance.now();

      if (this._pointers.size >= 2 && this._pinchStart) {
        const d = this._pinchDistance();
        if (d > 0) this.setZoom(this._pinchStart.zoom * (d / this._pinchStart.dist));
        return;
      }
      // Degrees per pixel scales with the drawn radius, so the point under the
      // finger stays roughly under the finger at any zoom.
      const k = 180 / (Math.PI * this.globe.radius);
      const dLambda = -dx * k * 1.35;
      const dPhi = dy * k * 1.35;
      this.globe.set(this.globe.lambda + dLambda, this.globe.phi + dPhi);
      this._velocity = { lambda: dLambda, phi: dPhi };
      this.dirty = true;
    };

    const up = e => {
      const had = this._pointers.delete(e.pointerId);
      if (this._pointers.size < 2) this._pinchStart = null;
      if (this._pointers.size === 0) {
        this._dragging = false;
        this.lastInteraction = performance.now();
        if (had && moved < 8 && this.opts.onPick) this._pick(e);
      }
    };

    cv.addEventListener('pointerdown', down);
    cv.addEventListener('pointermove', move);
    cv.addEventListener('pointerup', up);
    cv.addEventListener('pointercancel', up);
    cv.addEventListener('pointerleave', () => {
      if (!this._dragging && this.hoverIso) { this.hoverIso = null; this.dirty = true; }
    });

    cv.addEventListener('wheel', e => {
      e.preventDefault();
      this.lastInteraction = performance.now();
      this.setZoom(this.zoom * (e.deltaY < 0 ? 1.12 : 1 / 1.12));
    }, { passive: false });

    // Keyboard equivalents, so the globe games are playable without a mouse.
    cv.addEventListener('keydown', e => {
      const step = e.shiftKey ? 18 : 6;
      const g = this.globe;
      let handled = true;
      switch (e.key) {
        case 'ArrowLeft':  g.set(g.lambda - step, g.phi); break;
        case 'ArrowRight': g.set(g.lambda + step, g.phi); break;
        case 'ArrowUp':    g.set(g.lambda, g.phi + step); break;
        case 'ArrowDown':  g.set(g.lambda, g.phi - step); break;
        case '+': case '=': this.setZoom(this.zoom * 1.2); break;
        case '-': case '_': this.setZoom(this.zoom / 1.2); break;
        case 'Enter': case ' ':
          if (this.opts.onPick) {
            this.opts.onPick(this._isoAt(g.lambda, g.phi), [g.lambda, g.phi]);
          }
          break;
        default: handled = false;
      }
      if (handled) {
        e.preventDefault();
        this.lastInteraction = performance.now();
        this.dirty = true;
      }
    });
  }

  _pinchDistance() {
    const [a, b] = [...this._pointers.values()];
    return Math.hypot(a.x - b.x, a.y - b.y);
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
        if (pointInRingFast(lon, lat, ring)) return iso;
      }
    }
    return null;
  }

  _updateHover(e) {
    if (!this.opts.hover) return;
    const [x, y] = this._canvasPoint(e);
    const ll = this.globe.invert(x, y);
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
    const ll = this.globe.invert(x, y);
    if (!ll) { this.opts.onPick(null, null); return; }
    this.opts.onPick(this._isoAt(ll[0], ll[1]), ll);
  }

  /* ── the render loop ─────────────────────────────────────────────────── */
  _loop(now) {
    if (this._destroyed) return;
    this._raf = requestAnimationFrame(this._loop);
    const dt = Math.min(64, now - (this._last || now));
    this._last = now;

    if (this._fly) {
      const f = this._fly;
      const t = Math.min(1, (now - f.start) / f.ms);
      const e = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;   // easeInOutCubic
      this.globe.set(f.from.l + f.dl * e, f.from.p + f.dp * e);
      if (f.dz) this.setZoom(f.from.z + f.dz * e);
      this.dirty = true;
      if (t >= 1) { this._fly = null; this.autoSpinPaused = false; f.resolve(); }
    } else if (!this._dragging) {
      // Momentum from the last drag, then a slow idle spin once it settles.
      const v = this._velocity;
      if (Math.abs(v.lambda) > 0.01 || Math.abs(v.phi) > 0.01) {
        this.globe.set(this.globe.lambda + v.lambda, this.globe.phi + v.phi);
        v.lambda *= 0.94; v.phi *= 0.94;
        this.dirty = true;
      } else if (this.autoSpin && !this.autoSpinPaused &&
                 now - this.lastInteraction > IDLE_BEFORE_SPIN_MS) {
        this.globe.set(this.globe.lambda + SPIN_DEG_PER_SEC * dt / 1000, this.globe.phi);
        this.dirty = true;
      }
    }

    if (this.dirty || this.markers.some(m => m.pulse)) {
      this.dirty = false;
      this.draw();
    }
  }

  draw() {
    const { ctx, w, h, dpr } = this;
    const g = this.globe;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);

    const R = g.radius, cx = g.cx, cy = g.cy;

    // Atmosphere: a soft halo just outside the limb.
    const halo = ctx.createRadialGradient(cx, cy, R * 0.94, cx, cy, R * 1.16);
    halo.addColorStop(0, 'rgba(96,165,250,0.34)');
    halo.addColorStop(1, 'rgba(96,165,250,0)');
    ctx.fillStyle = halo;
    ctx.beginPath();
    ctx.arc(cx, cy, R * 1.16, 0, Math.PI * 2);
    ctx.fill();

    // Ocean, lit from the upper left so the disc reads as a ball.
    const sea = ctx.createRadialGradient(cx - R * 0.35, cy - R * 0.4, R * 0.05, cx, cy, R);
    sea.addColorStop(0, '#1c3f6e');
    sea.addColorStop(0.55, '#12294a');
    sea.addColorStop(1, '#08152b');
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, Math.PI * 2);
    ctx.fillStyle = sea;
    ctx.fill();

    // Clip everything else to the disc so no stray stitch escapes the planet.
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, Math.PI * 2);
    ctx.clip();

    this._drawGraticule();

    const scale = R / 200;
    ctx.lineJoin = 'round';
    ctx.lineWidth = Math.max(0.4, 0.65 * scale);

    const highlighted = [];
    for (const iso in this.countries) {
      const c = this.countries[iso];
      if (!g.mayBeVisible(c)) continue;
      if (this.highlight.has(iso)) { highlighted.push(c); continue; }
      this._fillCountry(c, this._colourFor(iso), false);
    }
    // Highlights last, so their glow sits above their neighbours.
    for (const c of highlighted) this._fillCountry(c, this._colourFor(c.iso), true);

    if (this.labels) this._drawLabels();
    this._drawArcs();
    this._drawMarkers();

    ctx.restore();

    // Shading pass: darkens the lower right limb, which is what actually sells
    // the sphere. Drawn over land and sea alike.
    const shade = ctx.createRadialGradient(cx - R * 0.3, cy - R * 0.35, R * 0.1, cx, cy, R * 1.02);
    shade.addColorStop(0, 'rgba(255,255,255,0.10)');
    shade.addColorStop(0.5, 'rgba(0,0,0,0)');
    shade.addColorStop(1, 'rgba(0,0,0,0.46)');
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, Math.PI * 2);
    ctx.fillStyle = shade;
    ctx.fill();

    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(147,197,253,0.5)';
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  _colourFor(iso) {
    if (this.paintFn) {
      const c = this.paintFn(iso);
      if (c) return c;
    }
    return this.dimUnpainted ? '#22334d' : '#2f4a63';
  }

  _fillCountry(country, colour, glow) {
    const ctx = this.ctx;
    ctx.beginPath();
    let any = false;
    for (const ring of country.rings) {
      if (this.globe.traceRing(ctx, ring)) any = true;
    }
    if (!any) return;
    if (glow) {
      ctx.save();
      ctx.shadowColor = colour;
      ctx.shadowBlur = 18 * (this.globe.radius / 220);
    }
    ctx.fillStyle = colour;
    ctx.fill('evenodd');
    ctx.strokeStyle = glow ? 'rgba(255,255,255,0.95)'
                     : country.iso === this.hoverIso ? 'rgba(255,255,255,0.85)'
                     : 'rgba(8,20,38,0.55)';
    ctx.lineWidth = glow || country.iso === this.hoverIso
      ? Math.max(1.2, 1.6 * (this.globe.radius / 200))
      : Math.max(0.4, 0.65 * (this.globe.radius / 200));
    ctx.stroke();
    if (glow) ctx.restore();
  }

  _drawGraticule() {
    const ctx = this.ctx, g = this.globe;
    ctx.strokeStyle = 'rgba(148,197,253,0.13)';
    ctx.lineWidth = 0.6;
    ctx.beginPath();
    for (let lon = -180; lon < 180; lon += 30) {
      let started = false;
      for (let lat = -90; lat <= 90; lat += 3) {
        const p = g.project(lon, lat);
        if (!p) { started = false; continue; }
        if (!started) { ctx.moveTo(p[0], p[1]); started = true; }
        else ctx.lineTo(p[0], p[1]);
      }
    }
    for (let lat = -60; lat <= 60; lat += 30) {
      let started = false;
      for (let lon = -180; lon <= 180; lon += 3) {
        const p = g.project(lon, lat);
        if (!p) { started = false; continue; }
        if (!started) { ctx.moveTo(p[0], p[1]); started = true; }
        else ctx.lineTo(p[0], p[1]);
      }
    }
    ctx.stroke();

    // The equator gets its own weight; it is the one line people look for.
    ctx.strokeStyle = 'rgba(148,197,253,0.24)';
    ctx.beginPath();
    let started = false;
    for (let lon = -180; lon <= 180; lon += 2) {
      const p = g.project(lon, 0);
      if (!p) { started = false; continue; }
      if (!started) { ctx.moveTo(p[0], p[1]); started = true; }
      else ctx.lineTo(p[0], p[1]);
    }
    ctx.stroke();
  }

  _drawLabels() {
    const ctx = this.ctx, g = this.globe;
    const min = 26000 / Math.max(1, g.radius);   // hide labels for tiny countries
    ctx.font = `600 ${Math.max(9, Math.min(14, g.radius / 22))}px "Inter Tight", system-ui, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.lineWidth = 3;
    ctx.strokeStyle = 'rgba(3,10,22,0.85)';
    ctx.fillStyle = 'rgba(226,238,255,0.92)';
    const placed = [];
    for (const iso in this.countries) {
      const c = this.countries[iso];
      if (c.area < min) continue;
      const p = g.project(c.centre[0], c.centre[1]);
      if (!p || p[2] < 0.28) continue;
      if (placed.some(q => Math.abs(q[0] - p[0]) < 46 && Math.abs(q[1] - p[1]) < 13)) continue;
      placed.push(p);
      const name = this.opts.labelFor ? this.opts.labelFor(iso) : iso;
      if (!name) continue;
      ctx.strokeText(name, p[0], p[1]);
      ctx.fillText(name, p[0], p[1]);
    }
  }

  _drawArcs() {
    const ctx = this.ctx, g = this.globe;
    for (const arc of this.arcs) {
      ctx.strokeStyle = arc.colour || 'rgba(255,209,102,0.95)';
      ctx.lineWidth = Math.max(1.5, 2 * (g.radius / 220));
      ctx.setLineDash(arc.dash || []);
      ctx.beginPath();
      let started = false;
      const steps = 64;
      for (let i = 0; i <= steps; i++) {
        const [lon, lat] = slerp(arc.from, arc.to, i / steps);
        const p = g.project(lon, lat);
        if (!p) { started = false; continue; }
        if (!started) { ctx.moveTo(p[0], p[1]); started = true; }
        else ctx.lineTo(p[0], p[1]);
      }
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }

  _drawMarkers() {
    const ctx = this.ctx, g = this.globe;
    const t = performance.now() / 1000;
    for (const m of this.markers) {
      const p = g.project(m.lon, m.lat);
      if (!p) continue;
      const base = Math.max(4, 6 * (g.radius / 220));
      if (m.pulse) {
        const phase = (t % 1.4) / 1.4;
        ctx.beginPath();
        ctx.arc(p[0], p[1], base + phase * base * 3, 0, Math.PI * 2);
        ctx.strokeStyle = withAlpha(m.colour || '#ffd166', 1 - phase);
        ctx.lineWidth = 2;
        ctx.stroke();
      }
      ctx.beginPath();
      ctx.arc(p[0], p[1], base, 0, Math.PI * 2);
      ctx.fillStyle = m.colour || '#ffd166';
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = 'rgba(3,10,22,0.9)';
      ctx.stroke();
      if (m.label) {
        ctx.font = `700 ${Math.max(10, g.radius / 20)}px "Inter Tight", system-ui, sans-serif`;
        ctx.textAlign = 'center';
        ctx.lineWidth = 3.5;
        ctx.strokeStyle = 'rgba(3,10,22,0.9)';
        ctx.strokeText(m.label, p[0], p[1] - base - 6);
        ctx.fillStyle = '#fff';
        ctx.fillText(m.label, p[0], p[1] - base - 6);
      }
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

/* Inlined point-in-ring without the bbox test, which the caller already did. */
function pointInRingFast(lon, lat, ring) {
  const { ll, n } = ring;
  let inside = false;
  for (let i = 0, j = n - 1; i < n; j = i++) {
    const yi = ll[i * 2 + 1], yj = ll[j * 2 + 1];
    if ((yi > lat) !== (yj > lat)) {
      const xi = ll[i * 2], xj = ll[j * 2];
      if (lon < (xj - xi) * (lat - yi) / (yj - yi) + xi) inside = !inside;
    }
  }
  return inside;
}

/* Spherical interpolation between two lon/lat points, so an arc drawn between
   them follows the great circle rather than cutting through the planet. */
export function slerp(a, b, t) {
  const d = Math.PI / 180;
  const [x1, y1, z1] = unit(a[0] * d, a[1] * d);
  const [x2, y2, z2] = unit(b[0] * d, b[1] * d);
  const dot = Math.max(-1, Math.min(1, x1 * x2 + y1 * y2 + z1 * z2));
  const omega = Math.acos(dot);
  if (omega < 1e-8) return [a[0], a[1]];
  const s = Math.sin(omega);
  const k1 = Math.sin((1 - t) * omega) / s, k2 = Math.sin(t * omega) / s;
  const x = x1 * k1 + x2 * k2, y = y1 * k1 + y2 * k2, z = z1 * k1 + z2 * k2;
  return [Math.atan2(x, z) / d, Math.asin(Math.max(-1, Math.min(1, y))) / d];
}

function unit(lon, lat) {
  const cl = Math.cos(lat);
  return [cl * Math.sin(lon), Math.sin(lat), cl * Math.cos(lon)];
}

function withAlpha(hex, a) {
  const h = hex.replace('#', '');
  const n = parseInt(h.length === 3 ? h.split('').map(c => c + c).join('') : h, 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${Math.max(0, a).toFixed(3)})`;
}

export { haversineKm };
