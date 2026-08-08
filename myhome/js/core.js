/* =============================================================================
   MyHome — core: units, geometry, state
   -----------------------------------------------------------------------------
   The single most important rule in this file: the model is always in
   millimetres. Nothing else. Every conversion to pixels, centimetres, metres
   or feet happens at the edge, on the way to a screen or a label.
   ========================================================================== */
window.MH = window.MH || {};

/* ---------------------------------------------------------------- UNITS --- */
MH.U = (function () {
  /* A CSS pixel is defined as 1/96 inch. That is what lets us report a true
     drawing scale (1:50, 1:100) and print at it. */
  const MM_PER_CSSPX = 25.4 / 96;          // 0.2645833...
  const SQFT_PER_SQM = 10.7639104;

  function round(v, dp) { const m = Math.pow(10, dp); return Math.round(v * m) / m; }

  /* Accepts: 3600 | 3600mm | 360cm | 3.6m | 12' | 11'6" | 11 ft 6 in | 141in */
  function parse(input, defaultUnit) {
    if (input === null || input === undefined) return NaN;
    let s = String(input).trim().toLowerCase().replace(/\s+/g, '');
    if (!s) return NaN;

    // feet + inches, e.g. 11'6"  or 11ft6in
    let m = s.match(/^(-?[\d.]+)(?:'|ft|feet)(?:([\d.]+)(?:"|in|inch(?:es)?)?)?$/);
    if (m) return (parseFloat(m[1]) * 12 + (m[2] ? parseFloat(m[2]) : 0)) * 25.4;

    m = s.match(/^(-?[\d.]+)(?:"|in|inch(?:es)?)$/);
    if (m) return parseFloat(m[1]) * 25.4;

    m = s.match(/^(-?[\d.]+)(mm|cm|m)$/);
    if (m) {
      const v = parseFloat(m[1]);
      return m[2] === 'mm' ? v : m[2] === 'cm' ? v * 10 : v * 1000;
    }

    m = s.match(/^-?[\d.]+$/);
    if (!m) return NaN;
    const v = parseFloat(s);
    switch (defaultUnit || MH.U.unit) {
      case 'cm':   return v * 10;
      case 'm':    return v * 1000;
      case 'ftin': return v * 25.4 * 12;
      default:     return v;                 // mm
    }
  }

  function fmt(mm, unit, opts) {
    unit = unit || MH.U.unit;
    opts = opts || {};
    if (!isFinite(mm)) return '—';
    switch (unit) {
      case 'cm': return round(mm / 10, 1) + (opts.bare ? '' : ' cm');
      case 'm':  return round(mm / 1000, opts.dp === undefined ? 2 : opts.dp) + (opts.bare ? '' : ' m');
      case 'ftin': {
        const totalIn = mm / 25.4;
        let ft = Math.floor(totalIn / 12);
        let inch = totalIn - ft * 12;
        let sixteenths = Math.round(inch * 16);
        if (sixteenths === 192) { ft += 1; sixteenths = 0; }
        const whole = Math.floor(sixteenths / 16);
        const frac = sixteenths % 16;
        const g = (a, b) => b ? g(b, a % b) : a;
        let fs = '';
        if (frac) { const d = g(frac, 16); fs = ' ' + (frac / d) + '/' + (16 / d); }
        return ft + "' " + whole + fs + '"';
      }
      default: return Math.round(mm) + (opts.bare ? '' : ' mm');
    }
  }

  /* Short label used on dimension lines, where space is tight. */
  function dim(mm) {
    if (MH.U.unit === 'ftin') return fmt(mm, 'ftin');
    if (mm >= 1000) return round(mm / 1000, 2) + ' m';
    return Math.round(mm) + '';
  }

  function area(mm2) {
    const sqm = mm2 / 1e6;
    return {
      sqm: round(sqm, 2),
      sqft: round(sqm * SQFT_PER_SQM, 1),
      label: round(sqm, 2) + ' m²  ·  ' + round(sqm * SQFT_PER_SQM, 0) + ' sq ft'
    };
  }

  /* Drawing scale as an architect would state it. pxPerMm is the current zoom. */
  function ratio(pxPerMm) {
    const n = 1 / (pxPerMm * MM_PER_CSSPX);
    if (n >= 100) return '1 : ' + Math.round(n / 10) * 10;
    if (n >= 20)  return '1 : ' + Math.round(n / 5) * 5;
    return '1 : ' + Math.max(1, Math.round(n));
  }
  /* Inverse: what zoom gives a true 1:N on this display? */
  function pxPerMmForRatio(n) { return 1 / (n * MM_PER_CSSPX); }

  return {
    unit: 'mm', MM_PER_CSSPX, SQFT_PER_SQM,
    parse, fmt, dim, area, ratio, pxPerMmForRatio, round
  };
})();

/* ------------------------------------------------------------- GEOMETRY --- */
MH.G = (function () {
  const rad = d => d * Math.PI / 180;

  function wallVec(w) {
    const dx = w.x2 - w.x1, dy = w.y2 - w.y1;
    const len = Math.hypot(dx, dy) || 1;
    return { dx, dy, len, ux: dx / len, uy: dy / len, nx: -dy / len, ny: dx / len };
  }
  function wallLen(w) { return Math.hypot(w.x2 - w.x1, w.y2 - w.y1); }
  function pointAlong(w, t) {           // t in mm from start
    const v = wallVec(w);
    return { x: w.x1 + v.ux * t, y: w.y1 + v.uy * t };
  }
  function projectOnWall(w, px, py) {   // returns { t, dist }
    const v = wallVec(w);
    const t = (px - w.x1) * v.ux + (py - w.y1) * v.uy;
    const cl = Math.max(0, Math.min(v.len, t));
    const p = pointAlong(w, cl);
    return { t: cl, tRaw: t, dist: Math.hypot(px - p.x, py - p.y), x: p.x, y: p.y };
  }

  /* Four corners of a rotated rectangle, in world mm. */
  function corners(cx, cy, w, d, rot) {
    const a = rad(rot || 0), c = Math.cos(a), s = Math.sin(a);
    const hw = w / 2, hd = d / 2;
    return [[-hw, -hd], [hw, -hd], [hw, hd], [-hw, hd]].map(([x, y]) => ({
      x: cx + x * c - y * s,
      y: cy + x * s + y * c
    }));
  }
  function aabb(pts) {
    let x1 = Infinity, y1 = Infinity, x2 = -Infinity, y2 = -Infinity;
    for (const p of pts) { x1 = Math.min(x1, p.x); y1 = Math.min(y1, p.y); x2 = Math.max(x2, p.x); y2 = Math.max(y2, p.y); }
    return { x1, y1, x2, y2 };
  }
  function pointInRotRect(px, py, cx, cy, w, d, rot) {
    const a = rad(-(rot || 0)), c = Math.cos(a), s = Math.sin(a);
    const dx = px - cx, dy = py - cy;
    const lx = dx * c - dy * s, ly = dx * s + dy * c;
    return Math.abs(lx) <= w / 2 && Math.abs(ly) <= d / 2;
  }

  /* Separating-axis test between two rotated rectangles. Used for collisions. */
  function rectsOverlap(A, B) {
    const pa = corners(A.x, A.y, A.w, A.d, A.rot), pb = corners(B.x, B.y, B.w, B.d, B.rot);
    const axes = [];
    for (const pts of [pa, pb]) {
      for (let i = 0; i < 2; i++) {
        const p1 = pts[i], p2 = pts[i + 1];
        const ex = p2.x - p1.x, ey = p2.y - p1.y;
        const l = Math.hypot(ex, ey) || 1;
        axes.push({ x: -ey / l, y: ex / l });
      }
    }
    for (const ax of axes) {
      let a0 = Infinity, a1 = -Infinity, b0 = Infinity, b1 = -Infinity;
      for (const p of pa) { const v = p.x * ax.x + p.y * ax.y; a0 = Math.min(a0, v); a1 = Math.max(a1, v); }
      for (const p of pb) { const v = p.x * ax.x + p.y * ax.y; b0 = Math.min(b0, v); b1 = Math.max(b1, v); }
      if (a1 < b0 + 1 || b1 < a0 + 1) return false;
    }
    return true;
  }

  function rectArea(r) { return Math.abs((r.x2 - r.x1) * (r.y2 - r.y1)); }
  function rectCentre(r) { return { x: (r.x1 + r.x2) / 2, y: (r.y1 + r.y2) / 2 }; }
  function pointInRect(px, py, r) {
    return px >= Math.min(r.x1, r.x2) && px <= Math.max(r.x1, r.x2) &&
           py >= Math.min(r.y1, r.y2) && py <= Math.max(r.y1, r.y2);
  }
  function roomAt(rooms, px, py) {
    for (let i = rooms.length - 1; i >= 0; i--) if (pointInRect(px, py, rooms[i])) return rooms[i];
    return null;
  }
  /* Straight-line clearance from a point to the nearest standing wall. */
  function distToWalls(walls, px, py) {
    let best = Infinity;
    for (const w of walls) {
      if (w.demolished) continue;
      const p = projectOnWall(w, px, py);
      best = Math.min(best, p.dist);
    }
    return best;
  }
  function snap(v, step) { return step ? Math.round(v / step) * step : v; }

  return {
    rad, wallVec, wallLen, pointAlong, projectOnWall, corners, aabb,
    pointInRotRect, rectsOverlap, rectArea, rectCentre, pointInRect,
    roomAt, distToWalls, snap
  };
})();

/* ---------------------------------------------------------------- STORE --- */
MH.Store = (function () {
  const LS_KEY = 'myhome.v1';
  const HISTORY_MAX = 80;

  let state = null;
  let past = [], future = [];
  const listeners = [];

  function clone(o) { return JSON.parse(JSON.stringify(o)); }
  function uid(prefix) { return (prefix || 'x') + Math.random().toString(36).slice(2, 9); }

  function fresh() {
    const s = clone(MH.SEED);
    s.style = 'japandi';
    s.underlay = null;              // { src, x, y, w, h, opacity, locked, rot }
    s.settings = {
      unit: 'mm', snap: 50, grid: true, gridStep: 100,
      showDims: true, showAreas: true, showFurniture: true, showLabels: true,
      showClearance: false, showGhosts: true, theme: 'light',
      budgetOn: false
    };
    s.view = { ox: 0, oy: 0, z: 0.06 };
    s.selection = [];
    s.name = 'Scheme A';
    s.savedAt = null;
    // give every seeded item a stable id and resolve catalogue defaults
    s.items = s.items.map(it => hydrateItem(it));
    return s;
  }

  function catalogById(id) { return MH.CATALOG.find(c => c.id === id); }

  function hydrateItem(it) {
    const c = catalogById(it.catId) || {};
    return Object.assign({
      id: it.id || uid('i'),
      catId: it.catId,
      name: it.name || c.name || 'Item',
      x: 0, y: 0, rot: 0,
      w: c.w || 600, d: c.d || 600, h: c.h || 750,
      glyph: c.glyph || 'box',
      round: !!c.round,
      seats: c.seats || 0,
      colour: null, locked: !!c.locked, hidden: false, note: ''
    }, it, {
      w: it.w || c.w || 600,
      d: it.d || c.d || 600,
      h: it.h || c.h || 750,
      glyph: it.glyph || c.glyph || 'box'
    });
  }

  function emit() { listeners.forEach(fn => { try { fn(state); } catch (e) { console.error(e); } }); }
  function subscribe(fn) { listeners.push(fn); return () => { const i = listeners.indexOf(fn); if (i >= 0) listeners.splice(i, 1); }; }

  /* Every mutation goes through here so undo always works. */
  function commit(label, mutator) {
    past.push({ label, snap: serialise() });
    if (past.length > HISTORY_MAX) past.shift();
    future.length = 0;
    mutator(state);
    persist();
    emit();
  }
  /* For continuous gestures: mutate freely, then call `commit` once at the end. */
  function begin(label) { past.push({ label, snap: serialise() }); if (past.length > HISTORY_MAX) past.shift(); future.length = 0; }
  function endGesture() { persist(); emit(); }
  /* A gesture that turned out to change nothing should not clutter the undo
     stack: drop the snapshot we optimistically pushed on pointerdown. */
  function cancelGesture() { past.pop(); emit(); }
  function touch() { emit(); }

  function serialise() {
    const { selection, ...rest } = state;
    return JSON.stringify(rest);
  }
  function restore(json) {
    const sel = state ? state.selection : [];
    state = JSON.parse(json);
    state.selection = sel.filter(id => findAny(id));
    emit();
  }
  function undo() {
    if (!past.length) return false;
    const entry = past.pop();
    future.push({ label: entry.label, snap: serialise() });
    restore(entry.snap); persist();
    return entry.label;
  }
  function redo() {
    if (!future.length) return false;
    const entry = future.pop();
    past.push({ label: entry.label, snap: serialise() });
    restore(entry.snap); persist();
    return entry.label;
  }
  function canUndo() { return past.length > 0; }
  function canRedo() { return future.length > 0; }

  function persist() {
    try {
      const payload = { active: state.name, savedAt: new Date().toISOString(), data: JSON.parse(serialise()) };
      localStorage.setItem(LS_KEY, JSON.stringify(payload));
    } catch (e) { /* quota or private mode; not fatal */ }
  }
  function load() {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (!raw) return false;
      const payload = JSON.parse(raw);
      if (!payload || !payload.data || !payload.data.walls) return false;
      state = payload.data;
      state.selection = [];
      state.items = (state.items || []).map(hydrateItem);
      if (!state.settings) state.settings = fresh().settings;
      MH.U.unit = state.settings.unit || 'mm';
      emit();
      return true;
    } catch (e) { return false; }
  }

  function reset() { state = fresh(); past = []; future = []; MH.U.unit = state.settings.unit; persist(); emit(); }

  function init() {
    if (!load()) reset();
    MH.U.unit = state.settings.unit || 'mm';
    return state;
  }

  /* --- lookups -------------------------------------------------------- */
  function get() { return state; }
  function wall(id)  { return state.walls.find(w => w.id === id); }
  function room(id)  { return state.rooms.find(r => r.id === id); }
  function item(id)  { return state.items.find(i => i.id === id); }
  function opening(id) { return state.openings.find(o => o.id === id); }
  function findAny(id) { return wall(id) || room(id) || item(id) || opening(id) || null; }
  function kindOf(id) {
    if (wall(id)) return 'wall';
    if (room(id)) return 'room';
    if (item(id)) return 'item';
    if (opening(id)) return 'opening';
    return null;
  }

  function wallType(w) { return MH.WALL_TYPES[w.type] || MH.WALL_TYPES.brick; }
  function thickness(w) { return w.thickness || wallType(w).thickness; }

  /* --- selection ------------------------------------------------------ */
  function select(ids, additive) {
    const arr = Array.isArray(ids) ? ids : (ids ? [ids] : []);
    if (additive) {
      arr.forEach(id => { const i = state.selection.indexOf(id); if (i >= 0) state.selection.splice(i, 1); else state.selection.push(id); });
    } else {
      state.selection = arr;
    }
    emit();
  }
  function selected() { return state.selection.map(id => ({ id, kind: kindOf(id), obj: findAny(id) })).filter(s => s.obj); }

  /* --- item helpers --------------------------------------------------- */
  function addItem(catId, x, y, extra) {
    const it = hydrateItem(Object.assign({ catId, x, y, id: uid('i') }, extra || {}));
    commit('Add ' + it.name, s => { s.items.push(it); s.selection = [it.id]; });
    return it;
  }
  function deleteSelected() {
    const sel = selected();
    if (!sel.length) return;
    commit('Delete', s => {
      sel.forEach(({ id, kind }) => {
        if (kind === 'item') s.items = s.items.filter(i => i.id !== id);
        else if (kind === 'opening') { const o = s.openings.find(o2 => o2.id === id); if (o && !o.locked) s.openings = s.openings.filter(o2 => o2.id !== id); }
        else if (kind === 'wall') { const w = s.walls.find(w2 => w2.id === id); if (w && (MH.WALL_TYPES[w.type] || {}).hackable) s.walls = s.walls.filter(w2 => w2.id !== id); }
        else if (kind === 'room') s.rooms = s.rooms.filter(r => r.id !== id);
      });
      s.selection = [];
    });
  }
  function duplicateSelected() {
    const sel = selected().filter(s => s.kind === 'item');
    if (!sel.length) return;
    const copies = sel.map(s => Object.assign(clone(s.obj), { id: uid('i'), x: s.obj.x + 300, y: s.obj.y + 300 }));
    commit('Duplicate', s => { s.items.push(...copies); s.selection = copies.map(c => c.id); });
  }

  return {
    init, reset, get, subscribe, commit, begin, endGesture, cancelGesture, touch,
    undo, redo, canUndo, canRedo, persist, serialise, restore,
    wall, room, item, opening, findAny, kindOf, wallType, thickness,
    select, selected, addItem, deleteSelected, duplicateSelected,
    hydrateItem, catalogById, uid, clone, fresh
  };
})();
