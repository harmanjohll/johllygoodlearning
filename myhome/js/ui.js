/* =============================================================================
   MyHome — interface
   ========================================================================== */
window.MH = window.MH || {};

MH.App = (function () {
  const $ = s => document.querySelector(s);
  const $$ = s => Array.from(document.querySelectorAll(s));
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  let S = null;                 // store state
  let c2, c3, stage;
  let tool = 'select';
  let ui = { hover: null, draft: null, view3: false };
  let drag = null;
  let raf = null;
  let aiHistory = [];
  let calib = null;

  /* ------------------------------------------------------------- HELPERS */
  function toast(msg, warn) {
    const t = document.createElement('div');
    t.className = 'toast' + (warn ? ' warn' : '');
    t.textContent = msg;
    $('#toasts').appendChild(t);
    setTimeout(() => { t.style.opacity = '0'; t.style.transition = 'opacity .3s'; }, warn ? 3600 : 2200);
    setTimeout(() => t.remove(), warn ? 4000 : 2600);
  }
  function requestDraw() {
    if (raf) return;
    raf = requestAnimationFrame(() => {
      raf = null;
      try {
        if (ui.view3) MH.R3.draw(c3, S, {});
        else MH.R2.draw(c2, S, ui);
      } catch (e) { console.error('render', e); }
      $('#scaleRatio').textContent = MH.U.ratio(S.view.z);
      if (!drag) renderBubble(); else hideBubble();
    });
  }
  function toWorld(ev) {
    const r = c2.getBoundingClientRect();
    return {
      x: (ev.clientX - r.left - S.view.ox) / S.view.z,
      y: (ev.clientY - r.top - S.view.oy) / S.view.z
    };
  }
  function snapV(v) { return MH.G.snap(v, S.settings.snap); }

  /* Very small markdown renderer for AI replies. */
  function md(src) {
    const lines = String(src || '').split('\n');
    let out = '', inUl = false, inOl = false;
    const inline = t => esc(t)
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/`(.+?)`/g, '<code>$1</code>')
      .replace(/(?<![*\w])\*(?!\s)(.+?)(?<!\s)\*(?![*\w])/g, '<em>$1</em>');
    const closeLists = () => { if (inUl) { out += '</ul>'; inUl = false; } if (inOl) { out += '</ol>'; inOl = false; } };
    lines.forEach(raw => {
      const l = raw.trim();
      if (!l) { closeLists(); return; }
      let m;
      if ((m = l.match(/^###\s+(.*)/))) { closeLists(); out += `<h3>${inline(m[1])}</h3>`; return; }
      if ((m = l.match(/^##\s+(.*)/)))  { closeLists(); out += `<h2>${inline(m[1])}</h2>`; return; }
      if ((m = l.match(/^#\s+(.*)/)))   { closeLists(); out += `<h2>${inline(m[1])}</h2>`; return; }
      if ((m = l.match(/^[-*]\s+(.*)/))) { if (inOl) { out += '</ol>'; inOl = false; } if (!inUl) { out += '<ul>'; inUl = true; } out += `<li>${inline(m[1])}</li>`; return; }
      if ((m = l.match(/^\d+[.)]\s+(.*)/))) { if (inUl) { out += '</ul>'; inUl = false; } if (!inOl) { out += '<ol>'; inOl = true; } out += `<li>${inline(m[1])}</li>`; return; }
      closeLists();
      out += `<p>${inline(l)}</p>`;
    });
    closeLists();
    return out;
  }

  /* =========================================================== CANVAS I/O */
  function hitHandle(w) {
    const sel = MH.Store.selected();
    for (const { kind, obj } of sel) {
      if (kind === 'item') {
        const a = (obj.rot || 0) * Math.PI / 180;
        const hx = obj.x + Math.sin(a) * (obj.d / 2 + 420), hy = obj.y - Math.cos(a) * (obj.d / 2 + 420);
        if (Math.hypot(w.x - hx, w.y - hy) * S.view.z < 12) return { type: 'rotate', obj };
        const c = MH.G.corners(obj.x, obj.y, obj.w, obj.d, obj.rot);
        for (let i = 0; i < 4; i++) if (Math.hypot(w.x - c[i].x, w.y - c[i].y) * S.view.z < 10) return { type: 'scale', obj, corner: i };
      } else if (kind === 'room') {
        const pts = [[obj.x1, obj.y1, 'nw'], [obj.x2, obj.y1, 'ne'], [obj.x2, obj.y2, 'se'], [obj.x1, obj.y2, 'sw']];
        for (const [x, y, c] of pts) if (Math.hypot(w.x - x, w.y - y) * S.view.z < 11) return { type: 'roomCorner', obj, corner: c };
      } else if (kind === 'wall') {
        if (Math.hypot(w.x - obj.x1, w.y - obj.y1) * S.view.z < 11) return { type: 'wallEnd', obj, end: 1 };
        if (Math.hypot(w.x - obj.x2, w.y - obj.y2) * S.view.z < 11) return { type: 'wallEnd', obj, end: 2 };
      }
    }
    return null;
  }

  function onDown(ev) {
    try { ev.currentTarget.setPointerCapture(ev.pointerId); } catch (e) { /* older Safari */ }
    if (ui.view3) {
      if (!S.view3) S.view3 = { yaw: 30, pitch: 56, zoom: 1, cut: 1200, ox: 0, oy: 0 };
      drag = { mode: 'orbit3', sx: ev.clientX, sy: ev.clientY, yaw: S.view3.yaw, ox: S.view3.ox || 0, oy: S.view3.oy || 0, pan: ev.shiftKey || ev.button === 1 };
      return;
    }
    const w = toWorld(ev);

    if (ui.placing && ev.button === 0) {
      const cat = MH.Store.catalogById(ui.placing.catId);
      addFromCatalog(ui.placing.catId, snapV(w.x), snapV(w.y));
      if (!ev.shiftKey) cancelPlacing();      // Shift keeps placing more
      return;
    }

    if (ev.button === 1 || ev.button === 2 || ev.altKey) {
      drag = { mode: 'pan', sx: ev.clientX, sy: ev.clientY, ox: S.view.ox, oy: S.view.oy };
      return;
    }

    if (tool === 'calibrate') {
      if (!calib || calib.done) calib = { a: w, done: false };
      else { calib.b = w; calib.done = true; askCalibration(); }
      requestDraw(); return;
    }
    if (tool === 'measure') { ui.draft = { kind: 'measure', x1: w.x, y1: w.y, x2: w.x, y2: w.y }; drag = { mode: 'measure' }; return; }
    if (tool === 'wall') {
      const p = { x: snapV(w.x), y: snapV(w.y) };
      ui.draft = { kind: 'wall', type: $('#newWallType').value, x1: p.x, y1: p.y, x2: p.x, y2: p.y };
      drag = { mode: 'wall' }; return;
    }
    if (tool === 'room') {
      const p = { x: snapV(w.x), y: snapV(w.y) };
      ui.draft = { kind: 'room', x1: p.x, y1: p.y, x2: p.x, y2: p.y };
      drag = { mode: 'room' }; return;
    }
    if (tool === 'demolish') { demolishAt(w); return; }
    if (tool === 'door' || tool === 'window') { placeOpening(w); return; }

    /* select tool */
    const h = hitHandle(w);
    if (h) {
      MH.Store.begin(h.type === 'rotate' ? 'Rotate' : 'Resize');
      drag = { mode: h.type, h, start: w, snap0: JSON.parse(JSON.stringify(h.obj)) };
      return;
    }
    const hit = MH.R2.pick(S, w.x, w.y);
    if (hit) {
      if (!S.selection.includes(hit.id)) MH.Store.select(hit.id, ev.shiftKey);
      else if (ev.shiftKey) MH.Store.select(hit.id, true);
      const sel = MH.Store.selected();
      MH.Store.begin('Move');
      drag = {
        mode: 'move', start: w, moved: false,
        objs: sel.map(s => ({ kind: s.kind, obj: s.obj, snap: JSON.parse(JSON.stringify(s.obj)) }))
      };
    } else {
      if (!ev.shiftKey) MH.Store.select([]);
      drag = { mode: 'pan', sx: ev.clientX, sy: ev.clientY, ox: S.view.ox, oy: S.view.oy };
    }
  }

  function onMove(ev) {
    if (ui.view3) {
      if (drag && drag.mode === 'orbit3') {
        if (drag.pan) { S.view3.ox = drag.ox + (ev.clientX - drag.sx); S.view3.oy = drag.oy + (ev.clientY - drag.sy); }
        else { S.view3.yaw = (drag.yaw + (ev.clientX - drag.sx) * 0.4) % 360; $('#v3yaw').value = ((S.view3.yaw % 360) + 360) % 360; }
        requestDraw();
      }
      return;
    }
    const w = toWorld(ev);
    $('#stCoord').textContent = MH.U.dim(w.x) + ', ' + MH.U.dim(w.y);

    if (ui.placing) {
      ui.placing.x = snapV(w.x); ui.placing.y = snapV(w.y);
      requestDraw();
      return;
    }

    if (!drag) {
      const hit = (tool === 'demolish' || tool === 'door' || tool === 'window')
        ? MH.R2.pickWall(S, w.x, w.y, 500)
        : MH.R2.pick(S, w.x, w.y);
      const changed = (hit && hit.id) !== (ui.hover && ui.hover.id);
      ui.hover = hit ? { kind: hit.kind, id: hit.id } : null;
      /* A locked wall says so before you click, not after. */
      const lockedHover = hit && hit.kind === 'wall' && !MH.Store.wallType(hit.obj).hackable;
      c2.style.cursor = tool === 'select'
        ? (hitHandle(w) ? 'grab' : (hit ? 'move' : 'default'))
        : (lockedHover && tool !== 'select' ? 'not-allowed' : 'crosshair');
      if (changed) requestDraw();
      return;
    }

    if (drag.mode === 'pan') {
      S.view.ox = drag.ox + (ev.clientX - drag.sx);
      S.view.oy = drag.oy + (ev.clientY - drag.sy);
      requestDraw(); return;
    }
    if (drag.mode === 'measure' || drag.mode === 'wall' || drag.mode === 'room') {
      let x = w.x, y = w.y;
      if (drag.mode !== 'measure') { x = snapV(x); y = snapV(y); }
      if (drag.mode === 'wall' && !ev.shiftKey) {
        if (Math.abs(x - ui.draft.x1) > Math.abs(y - ui.draft.y1)) y = ui.draft.y1; else x = ui.draft.x1;
      }
      if (drag.mode === 'measure' && ev.shiftKey) {
        if (Math.abs(x - ui.draft.x1) > Math.abs(y - ui.draft.y1)) y = ui.draft.y1; else x = ui.draft.x1;
      }
      ui.draft.x2 = x; ui.draft.y2 = y;
      requestDraw(); return;
    }
    if (drag.mode === 'move') {
      ui.guides = null;
      const dx = w.x - drag.start.x, dy = w.y - drag.start.y;
      if (Math.abs(dx) + Math.abs(dy) > 20) drag.moved = true;
      drag.objs.forEach(({ kind, obj, snap }) => {
        if (kind === 'item') {
          if (obj.locked) return;
          obj.x = snapV(snap.x + dx); obj.y = snapV(snap.y + dy);
          if (drag.objs.length === 1 && !ev.altKey) applyGuides(obj);
        } else if (kind === 'room') {
          obj.x1 = snapV(snap.x1 + dx); obj.y1 = snapV(snap.y1 + dy);
          obj.x2 = snapV(snap.x2 + dx); obj.y2 = snapV(snap.y2 + dy);
        } else if (kind === 'wall') {
          obj.x1 = snapV(snap.x1 + dx); obj.y1 = snapV(snap.y1 + dy);
          obj.x2 = snapV(snap.x2 + dx); obj.y2 = snapV(snap.y2 + dy);
        } else if (kind === 'opening') {
          const wl = MH.Store.wall(obj.wallId); if (!wl) return;
          const pr = MH.G.projectOnWall(wl, w.x, w.y);
          obj.pos = Math.max(obj.w / 2, Math.min(MH.G.wallLen(wl) - obj.w / 2, snapV(pr.t)));
        }
      });
      requestDraw(); return;
    }
    if (drag.mode === 'rotate') {
      const o = drag.h.obj;
      let a = Math.atan2(w.x - o.x, -(w.y - o.y)) * 180 / Math.PI;
      if (!ev.shiftKey) a = Math.round(a / 15) * 15;
      o.rot = ((Math.round(a) % 360) + 360) % 360;
      requestDraw(); return;
    }
    if (drag.mode === 'scale') {
      const o = drag.h.obj;
      const a = -(o.rot || 0) * Math.PI / 180;
      const dx = w.x - o.x, dy = w.y - o.y;
      const lx = dx * Math.cos(a) - dy * Math.sin(a);
      const ly = dx * Math.sin(a) + dy * Math.cos(a);
      o.w = Math.max(80, snapV(Math.abs(lx) * 2));
      o.d = Math.max(80, snapV(Math.abs(ly) * 2));
      requestDraw(); return;
    }
    if (drag.mode === 'roomCorner') {
      const o = drag.h.obj, c = drag.h.corner;
      const x = snapV(w.x), y = snapV(w.y);
      if (c.includes('w')) o.x1 = x; else o.x2 = x;
      if (c.includes('n')) o.y1 = y; else o.y2 = y;
      requestDraw(); return;
    }
    if (drag.mode === 'wallEnd') {
      const o = drag.h.obj;
      let x = snapV(w.x), y = snapV(w.y);
      const ox = drag.h.end === 1 ? o.x2 : o.x1, oy = drag.h.end === 1 ? o.y2 : o.y1;
      if (!ev.shiftKey) { if (Math.abs(x - ox) > Math.abs(y - oy)) y = oy; else x = ox; }
      if (drag.h.end === 1) { o.x1 = x; o.y1 = y; } else { o.x2 = x; o.y2 = y; }
      requestDraw(); return;
    }
  }

  function onUp(ev) {
    if (!drag) return;
    const mode = drag.mode, moved = drag.moved; drag = null;
    ui.guides = null;
    if (mode === 'wall' && ui.draft) {
      const d = ui.draft; ui.draft = null;
      const len = Math.hypot(d.x2 - d.x1, d.y2 - d.y1);
      if (len > 150) {
        MH.Store.commit('Draw wall', s => {
          const id = MH.Store.uid('w');
          s.walls.push({ id, x1: d.x1, y1: d.y1, x2: d.x2, y2: d.y2, type: d.type });
          s.selection = [id];
        });
        toast('Wall added, ' + MH.U.dim(len));
      }
      requestDraw(); return;
    }
    if (mode === 'room' && ui.draft) {
      const d = ui.draft; ui.draft = null;
      if (Math.abs(d.x2 - d.x1) > 400 && Math.abs(d.y2 - d.y1) > 400) {
        MH.Store.commit('Add room', s => {
          const id = MH.Store.uid('r');
          s.rooms.push({
            id, name: 'New room', num: (s.rooms.length + 1),
            x1: Math.min(d.x1, d.x2), y1: Math.min(d.y1, d.y2),
            x2: Math.max(d.x1, d.x2), y2: Math.max(d.y1, d.y2),
            floor: 'porcelain-lf'
          });
          s.selection = [id];
        });
        setPane('right', 'pInspect');
      }
      requestDraw(); return;
    }
    if (mode === 'measure') { requestDraw(); return; }
    if (mode === 'move' && !moved) { MH.Store.cancelGesture(); return; }
    if (['move', 'rotate', 'scale', 'roomCorner', 'wallEnd'].includes(mode)) {
      MH.Store.endGesture();
      return;
    }
    requestDraw();
  }

  function onWheel(ev) {
    ev.preventDefault();
    if (ui.view3) {
      S.view3.zoom = Math.max(0.4, Math.min(3, (S.view3.zoom || 1) * (ev.deltaY < 0 ? 1.1 : 0.9)));
      $('#v3zoom').value = S.view3.zoom;
      requestDraw(); return;
    }
    const r = c2.getBoundingClientRect();
    const mx = ev.clientX - r.left, my = ev.clientY - r.top;
    const wx = (mx - S.view.ox) / S.view.z, wy = (my - S.view.oy) / S.view.z;
    const f = ev.deltaY < 0 ? 1.12 : 1 / 1.12;
    S.view.z = Math.max(0.006, Math.min(1.2, S.view.z * f));
    S.view.ox = mx - wx * S.view.z;
    S.view.oy = my - wy * S.view.z;
    requestDraw();
  }

  /* touch pinch */
  let pinch = null;
  function onTouchStart(ev) {
    if (ev.touches.length === 2) {
      const [a, b] = ev.touches;
      pinch = { d: Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY), z: S.view.z,
        cx: (a.clientX + b.clientX) / 2, cy: (a.clientY + b.clientY) / 2, ox: S.view.ox, oy: S.view.oy };
      drag = null;
    }
  }
  function onTouchMove(ev) {
    if (pinch && ev.touches.length === 2) {
      ev.preventDefault();
      const [a, b] = ev.touches;
      const d = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
      const r = c2.getBoundingClientRect();
      const mx = pinch.cx - r.left, my = pinch.cy - r.top;
      const wx = (mx - pinch.ox) / pinch.z, wy = (my - pinch.oy) / pinch.z;
      S.view.z = Math.max(0.006, Math.min(1.2, pinch.z * (d / pinch.d)));
      S.view.ox = mx - wx * S.view.z;
      S.view.oy = my - wy * S.view.z;
      requestDraw();
    }
  }
  function onTouchEnd(ev) { if (ev.touches.length < 2) pinch = null; }

  /* --------------------------------------------------------- TOOL ACTIONS */
  function demolishAt(w) {
    const hit = MH.R2.pickWall(S, w.x, w.y, 500);
    if (!hit) { toast('Click closer to a wall'); return; }
    const wall = hit.obj, T = MH.Store.wallType(wall);
    if (!T.hackable) {
      MH.Store.select(wall.id);
      setPane('right', 'pInspect');
      toast(T.name + ' cannot be removed', true);
      requestDraw(); return;
    }
    MH.Store.commit(wall.demolished ? 'Restore wall' : 'Demolish wall', s => {
      const ww = s.walls.find(x => x.id === wall.id);
      ww.demolished = !ww.demolished;
      if (ww.demolished) s.openings = s.openings.filter(o => o.wallId !== ww.id || o.locked);
    });
    toast(wall.demolished ? 'Wall restored' : 'Wall marked for demolition, ' + MH.U.dim(MH.G.wallLen(wall)));
  }

  function placeOpening(w) {
    const hit = MH.R2.pickWall(S, w.x, w.y, 500);
    if (!hit) { toast('Click closer to a wall to place it'); return; }
    const wall = hit.obj;
    if (wall.demolished) { toast('That wall is demolished', true); return; }
    const T = MH.Store.wallType(wall);
    if (!T.hackable) { toast('You cannot cut an opening in ' + T.name.toLowerCase(), true); return; }
    const spec = MH.OPENINGS.find(o => o.id === $('#openingType').value) || MH.OPENINGS[0];
    const L = MH.G.wallLen(wall);
    if (spec.w + 200 > L) { toast('That wall is too short for a ' + MH.U.dim(spec.w) + ' opening', true); return; }
    const pr = MH.G.projectOnWall(wall, w.x, w.y);
    let pos = Math.max(spec.w / 2 + 60, Math.min(L - spec.w / 2 - 60, snapV(pr.t)));

    /* An opening cannot sit on top of another one. Try to slide it clear
       before giving up, because "it did not fit" is a useless answer. */
    const others = S.openings.filter(o => o.wallId === wall.id);
    const clashes = at => others.some(o => Math.abs(o.pos - at) < (o.w + spec.w) / 2 + 50);
    if (clashes(pos)) {
      let found = null;
      for (let step = 50; step < L && found === null; step += 50) {
        for (const cand of [pos - step, pos + step]) {
          if (cand < spec.w / 2 + 60 || cand > L - spec.w / 2 - 60) continue;
          if (!clashes(cand)) { found = cand; break; }
        }
      }
      if (found === null) {
        toast('There is no clear run of wall left for a ' + MH.U.dim(spec.w) + ' opening here', true);
        return;
      }
      pos = found;
    }

    MH.Store.commit('Place ' + spec.name, s => {
      const id = MH.Store.uid('o');
      s.openings.push({
        id, wallId: wall.id, pos, w: spec.w, h: spec.h, type: spec.type,
        swing: spec.swing || 'left', flip: false, sill: spec.sill, label: spec.name
      });
      s.selection = [id];
    });
    setPane('right', 'pInspect');
  }

  function addFromCatalog(catId, x, y) {
    const c = MH.Store.catalogById(catId); if (!c) return;
    if (x === undefined) {
      const r = c2.getBoundingClientRect();
      x = snapV((r.width / 2 - S.view.ox) / S.view.z);
      y = snapV((r.height / 2 - S.view.oy) / S.view.z);
    }
    MH.Store.addItem(catId, x, y);
    pushRecent(catId);
    toast(c.name + ' added — drag it where you want it');
  }

  /* ================================================================ PANES */
  function setPane(side, id) {
    const panel = side === 'left' ? $('#panelL') : $('#panelR');
    panel.querySelectorAll('.tabs button').forEach(b => b.classList.toggle('on', b.dataset.pane === id));
    panel.querySelectorAll('.pane').forEach(p => p.classList.toggle('on', p.id === id));
    if (window.innerWidth <= 940) panel.classList.add('open');
    renderPanels();
  }

  /* --------------------------------------------------------- CATALOGUE */
  let catFilter = 'all', catQuery = '';
  const QUICK = ['sofa3', 'dine4', 'bed-queen', 'wardrobe3', 'tv55', 'coffee-r',
                 'piano-upright', 'bookshelf-200x120', 'desk-m', 'plant-l',
                 'island', 'fcu'];
  function recents() { try { return JSON.parse(localStorage.getItem('myhome.recent') || '[]'); } catch (e) { return []; } }
  function pushRecent(id) {
    const r = recents().filter(x => x !== id); r.unshift(id);
    try { localStorage.setItem('myhome.recent', JSON.stringify(r.slice(0, 6))); } catch (e) {}
  }
  const thumbObserver = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      drawThumb(e.target);
      thumbObserver.unobserve(e.target);
    });
  }, { rootMargin: '120px' });

  function drawThumb(cv) {
    const c = MH.Store.catalogById(cv.dataset.cat); if (!c) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const W = cv.clientWidth || 110, H = cv.clientHeight || 46;
    cv.width = W * dpr; cv.height = H * dpr;
    const g = cv.getContext('2d');
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    const p = MH.R2.palette(S);
    const pad = 6;
    const sc = Math.min((W - pad * 2) / Math.max(c.w, 420), (H - pad * 2) / Math.max(c.d, 420));
    g.save(); g.translate(W / 2, H / 2); g.scale(sc, sc);
    const it = MH.Store.hydrateItem({ catId: c.id, x: 0, y: 0 });
    const fn = MH.R2.GLYPHS[c.glyph] || MH.R2.GLYPHS.box;
    try { fn(g, it, p, sc); } catch (e) { }
    g.restore();
  }
  function card(c) {
    return `<button class="cat-card" data-add="${c.id}" draggable="true" title="${esc(c.note || c.name)}">
      <canvas data-cat="${c.id}"></canvas>
      <b>${esc(c.name)}</b><small>${Math.round(c.w / 10)} × ${Math.round(c.d / 10)} cm</small></button>`;
  }

  function renderCatalog() {
    const chips = $('#catChips');
    if (!chips.dataset.built) {
      chips.innerHTML = `<button class="chip on" data-cat="all">All</button>` +
        MH.CATEGORIES.map(c => `<button class="chip" data-cat="${c.id}">${esc(c.name)}</button>`).join('');
      chips.dataset.built = '1';
      chips.addEventListener('click', e => {
        const b = e.target.closest('.chip'); if (!b) return;
        catFilter = b.dataset.cat;
        chips.querySelectorAll('.chip').forEach(x => x.classList.toggle('on', x === b));
        renderCatalog();
      });
    }
    if (!$('#quickAdd').dataset.built) {
      $('#quickAdd').innerHTML = QUICK.map(id => {
        const c = MH.Store.catalogById(id); if (!c) return '';
        return `<button data-add="${id}" title="${esc(c.name)}"><canvas data-cat="${id}"></canvas><span>${esc(c.name.split(',')[0].split('(')[0].trim())}</span></button>`;
      }).join('');
      $('#quickAdd').dataset.built = '1';
      $$('#quickAdd canvas').forEach(cv => thumbObserver.observe(cv));
    }

    const rec = recents().map(id => MH.Store.catalogById(id)).filter(Boolean);
    $('#recentWrap').style.display = rec.length ? '' : 'none';
    if (rec.length) {
      $('#recentList').innerHTML = rec.map(card).join('');
      $$('#recentList canvas').forEach(cv => thumbObserver.observe(cv));
    }

    const q = catQuery.trim().toLowerCase();
    const list = MH.CATALOG.filter(c => {
      if (catFilter !== 'all' && c.cat !== catFilter) return false;
      if (!q) return true;
      return (c.name + ' ' + c.id + ' ' + c.cat).toLowerCase().includes(q) ||
        String(c.w).includes(q) || String(c.d).includes(q) ||
        String(Math.round(c.w / 10)).includes(q);
    });
    $('#catList').innerHTML = list.map(card).join('') ||
      `<p class="hint" style="grid-column:span 2">Nothing matches “${esc(catQuery)}”. Try a room name, or a size like 1800.</p>`;
    $$('#catList canvas').forEach(cv => thumbObserver.observe(cv));
  }

  /* ---------------------------------------------------------- STRUCTURE */
  function renderStructure() {
    const sel = $('#newWallType');
    if (!sel.dataset.built) {
      sel.innerHTML = Object.values(MH.WALL_TYPES).filter(t => t.hackable || t.id === 'proposed')
        .map(t => `<option value="${t.id}">${esc(t.name)} · ${t.thickness} mm</option>`).join('');
      sel.value = 'proposed';
      sel.dataset.built = '1';
      sel.addEventListener('change', renderStructure);
      const os = $('#openingType');
      os.innerHTML = MH.OPENINGS.filter(o => !o.locked).map(o => `<option value="${o.id}">${esc(o.name)} · ${o.w} mm</option>`).join('');
      os.addEventListener('change', renderStructure);
    }
    const t = MH.WALL_TYPES[sel.value];
    $('#newWallNote').textContent = t ? t.note : '';
    const os = MH.OPENINGS.find(o => o.id === $('#openingType').value);
    $('#openingNote').textContent = os && os.note ? os.note : '';

  }

  /* -------------------------------------------------------------- ROOMS */
  function renderRooms(a) {
    $('#roomList').innerHTML = a.stats.rooms.map(r => {
      const on = S.selection.includes(r.id);
      return `<button class="wall-row ${on ? 'on' : ''}" data-room="${r.id}">
        <i style="background:${(MH.MATERIALS.find(m => m.name === r.floor) || { hex: '#ccc' }).hex}"></i>
        <span class="t"><b>${esc(r.name)}</b>
        <small>${Math.round(r.w)} × ${Math.round(r.d)} mm · ${r.area.sqm} m² · ${r.area.sqft} sq ft</small></span>
      </button>`;
    }).join('') +
      `<div class="note" style="margin-top:10px">
         <b>${a.stats.gross.label}</b> across ${a.stats.rooms.length} rooms.
         The HDB sheet states ${S.meta.statedInternal || 90} m² internal and ${S.meta.statedArea || 93} m² including the air-con ledge.
       </div>`;

    /* --- walls ------------------------------------------------------- */
    const std = S.walls.filter(w => !w.demolished);
    const canGo = std.filter(w => MH.Store.wallType(w).hackable);
    const locked = std.filter(w => !MH.Store.wallType(w).hackable);
    const gone = S.walls.filter(w => w.demolished);
    const m = arr => (arr.reduce((t, w) => t + MH.G.wallLen(w), 0) / 1000).toFixed(1);
    $('#wallSummary').innerHTML = `<div class="wall-sum">
      <div><b>${canGo.length}</b><span>you can remove</span></div>
      <div><b>${locked.length}</b><span>fixed forever</span></div>
      <div><b>${gone.length}</b><span>coming down</span></div>
    </div>`;

    const xray = !!S.settings.xray;
    $('#setXray').checked = xray;
    const show = xray ? S.walls.filter(w => MH.Store.wallType(w).hackable) : S.walls;
    $('#wallList').innerHTML = show.map(w => {
      const T = MH.Store.wallType(w);
      const on = S.selection.includes(w.id);
      const where = wallWhere(w);
      return `<button class="wall-row ${on ? 'on' : ''}" data-wall="${w.id}">
        <i style="background:${T.fill}"></i>
        <span class="t"><b>${esc(where)}${w.demolished ? ' — coming down' : ''}</b>
        <small>${T.short} · ${Math.round(MH.G.wallLen(w))} mm</small></span>
        <span class="lockbadge ${T.hackable ? 'yes' : 'no'}">${T.hackable ? 'can go' : 'fixed'}</span>
      </button>`;
    }).join('') || '<p class="hint">No removable walls in this flat.</p>';
  }

  /* Name a wall by the rooms it stands between, which is how a person
     thinks about it. "w-kitS" means nothing; "Kitchen / Entrance" does. */
  function wallWhere(w) {
    const v = MH.G.wallVec(w);
    const mid = MH.G.pointAlong(w, MH.G.wallLen(w) / 2);
    const t = MH.Store.thickness(w) / 2 + 250;
    const a = MH.G.roomAt(S.rooms, mid.x + v.nx * t, mid.y + v.ny * t);
    const b = MH.G.roomAt(S.rooms, mid.x - v.nx * t, mid.y - v.ny * t);
    if (a && b) return a.name + ' / ' + b.name;
    if (a || b) return 'Outside / ' + (a || b).name;
    return 'Wall';
  }

  /* -------------------------------------------------------------- STYLE */
  function renderStyle() {
    $('#styleGrid').innerHTML = MH.STYLES.map(s => `
      <button class="style-card ${s.id === S.style ? 'on' : ''}" data-style="${s.id}">
        <span class="bars">${s.palette.slice(0, 5).map(p => `<i style="background:${p.hex}"></i>`).join('')}</span>
        <b>${esc(s.name)}</b><small>${esc(s.tagline)}</small>
      </button>`).join('');

    const st = MH.STYLES.find(s => s.id === S.style) || MH.STYLES[0];
    $('#styleDetail').innerHTML = `
      <div class="group"><h4>${esc(st.name)}</h4>
        <p class="hint" style="margin-bottom:8px">${esc(st.origin)}</p>
        ${st.palette.map(p => `<div class="pal-row"><i style="background:${p.hex}"></i>
          <span class="t"><b>${esc(p.name)}</b><small>${esc(p.role)}</small></span>
          <code>${p.hex}<br>LRV ${p.lrv}</code></div>`).join('')}
      </div>
      <div class="group"><h4>Materials</h4>
        <p class="hint"><b>Timber.</b> ${esc(st.woods.join(', '))}</p>
        <p class="hint"><b>Surfaces.</b> ${esc(st.surfaces.join(', '))}</p>
        <p class="hint"><b>Metal.</b> ${esc(st.metals.join(', '))}</p>
        <p class="hint"><b>Textiles.</b> ${esc(st.textiles.join(', '))}</p>
      </div>
      <div class="group"><h4>Lighting</h4>
        <p class="hint"><b>${esc(st.lighting.temp)} · CRI ${esc(st.lighting.cri)}</b><br>${esc(st.lighting.notes)}</p>
      </div>
      <div class="group"><h4>Do</h4>${st.dos.map(d => `<p class="hint">· ${esc(d)}</p>`).join('')}</div>
      <div class="group"><h4>Do not</h4>${st.donts.map(d => `<p class="hint">· ${esc(d)}</p>`).join('')}</div>
      <div class="group"><h4>Signature pieces</h4><p class="hint">${esc(st.signature.join(' · '))}</p></div>
      <div class="note"><b>In Singapore.</b> ${esc(st.sgNotes)}</div>
      <div class="note"><b>Budget.</b> ${esc(st.budget)}</div>
      <div class="btn-row" style="margin-top:12px">
        <button class="btn dark full" data-ai="style">Turn this into a spec with AI</button>
      </div>`;
  }

  /* ------------------------------------------------------------ INSPECT */
  function numRow(label, id, mmValue, extra) {
    return `<div class="field mono"><label>${esc(label)}</label>
      <input type="text" data-num="${id}" value="${esc(MH.U.fmt(mmValue, MH.U.unit, { bare: true }))}" ${extra || ''}></div>`;
  }

  function renderInspect(a) {
    const pane = $('#pInspect');
    const sel = MH.Store.selected();
    if (!sel.length) {
      pane.innerHTML = `
        <div class="group"><h4>${esc(S.meta.name)}</h4>
          <p class="hint">${esc(S.meta.unitType)} · ceiling ${MH.U.dim(S.meta.ceiling)} · gross ${a.stats.gross.label}</p>
        </div>
        <div class="scores">
          <div class="score big"><b>${a.scores.overall}</b><span>Plan health</span><div class="bar"><i style="width:${a.scores.overall}%"></i></div></div>
          <div class="score"><b>${a.scores.circulation}</b><span>Circulation</span><div class="bar"><i style="width:${a.scores.circulation}%"></i></div></div>
          <div class="score"><b>${a.scores.ergonomics}</b><span>Ergonomics</span><div class="bar"><i style="width:${a.scores.ergonomics}%"></i></div></div>
          <div class="score"><b>${a.scores.daylight}</b><span>Daylight</span><div class="bar"><i style="width:${a.scores.daylight}%"></i></div></div>
          <div class="score"><b>${a.scores.compliance}</b><span>Compliance</span><div class="bar"><i style="width:${a.scores.compliance}%"></i></div></div>
        </div>
        <div class="note"><b>Click anything on the plan.</b> A little toolbar pops up next to it with everything you can do. Double-click a room to fill the screen with it.</div>
        <div class="note"><b>Black walls stay put.</b> Your HDB sheet shades structural columns and walls in black, and the household shelter is protected by law. Press <b>What can I change?</b> in the toolbar to see only the walls that can actually come down.</div>
        ${S.meta.calibrated ? '' : `<div class="note warn"><b>Working from the official sheet.</b> The overall dimensions, room sizes and the ${S.meta.statedInternal || 90} m² / ${S.meta.statedArea || 93} m² areas all come from your HDB plan. If you want it exact to the millimetre, open Settings, drop your scan in as an underlay and drag the walls onto it.</div>`}`;
      return;
    }

    if (sel.length > 1) {
      pane.innerHTML = `<div class="sel-head"><div><span class="kind">Selection</span><h3>${sel.length} items</h3></div></div>
        <div class="btn-row">
          <button class="btn" data-act="dup">Duplicate</button>
          <button class="btn danger" data-act="del">Delete</button>
        </div>
        <div class="btn-row" style="margin-top:6px">
          <button class="btn" data-act="alignL">Align left</button>
          <button class="btn" data-act="alignT">Align top</button>
        </div>`;
      return;
    }

    const { kind, obj } = sel[0];

    if (kind === 'item') {
      const c = MH.Store.catalogById(obj.catId) || {};
      const st = MH.R2.palette(S).style;
      const room = MH.G.roomAt(S.rooms, obj.x, obj.y);
      pane.innerHTML = `
        <div class="sel-head"><div><span class="kind">${esc((MH.CATEGORIES.find(x => x.id === c.cat) || {}).name || 'Item')}</span>
          <h3>${esc(obj.name)}</h3></div></div>
        <div class="field"><label>Label</label><input type="text" data-str="name" value="${esc(obj.name)}"></div>
        <div class="row c3">
          ${numRow('Width', 'w', obj.w)}
          ${numRow('Depth', 'd', obj.d)}
          ${numRow('Height', 'h', obj.h)}
        </div>
        <div class="row c3">
          ${numRow('X', 'x', obj.x)}
          ${numRow('Y', 'y', obj.y)}
          <div class="field mono"><label>Rotation</label><input type="number" data-rot="1" step="15" value="${obj.rot || 0}"></div>
        </div>
        ${c.tv ? `<div class="field"><label>Screen size</label><select data-tv="1">
          ${[43, 50, 55, 65, 75, 85].map(n => `<option value="${n}" ${c.tv === n ? 'selected' : ''}>${n} inch · ${MH.tvSize(n).w} × ${MH.tvSize(n).h} mm</option>`).join('')}
        </select><div class="hint">Diagonal converts to a true 16:9 width and height. Comfortable viewing at 4K is 1.2 to 1.8 times the diagonal.</div></div>` : ''}
        <div class="group" style="margin-top:14px"><h4>Colour</h4>
          <div class="swatches">
            <button class="swatch ${!obj.colour ? 'on' : ''}" data-col="" style="background:linear-gradient(135deg,#fff 45%,#bbb 45%,#bbb 55%,#fff 55%)" title="Style default"></button>
            ${st.palette.map(p => `<button class="swatch ${obj.colour === p.hex ? 'on' : ''}" data-col="${p.hex}" style="background:${p.hex}" title="${esc(p.name)}"></button>`).join('')}
          </div>
          <div class="field" style="margin-top:8px"><label>Custom</label><input type="color" data-colpick="1" value="${obj.colour || '#C9A87C'}" style="width:100%;height:30px;padding:2px;border:1px solid var(--line);border-radius:var(--r-sm);background:var(--panel-2)"></div>
        </div>
        <div class="switch"><span>Lock in place</span><input type="checkbox" data-bool="locked" ${obj.locked ? 'checked' : ''}></div>
        <div class="switch"><span>Hide</span><input type="checkbox" data-bool="hidden" ${obj.hidden ? 'checked' : ''}></div>
        <div class="btn-row" style="margin-top:10px">
          <button class="btn" data-act="dup">Duplicate</button>
          <button class="btn" data-act="rot90">Rotate 90°</button>
          <button class="btn danger" data-act="del">Delete</button>
        </div>
        ${room ? `<div class="hint" style="margin-top:10px">Sitting in <b>${esc(room.name)}</b>.</div>` : `<div class="note warn">This is outside every room zone.</div>`}
        ${c.note ? `<div class="note">${esc(c.note)}</div>` : ''}
        ${obj.note ? `<div class="note"><b>AI note.</b> ${esc(obj.note)}</div>` : ''}`;
      return;
    }

    if (kind === 'wall') {
      const T = MH.Store.wallType(obj);
      pane.innerHTML = `
        <div class="sel-head"><div><span class="kind">Wall between</span><h3>${esc(wallWhere(obj))}</h3></div></div>
        <div class="note ${T.hackable ? '' : 'warn'}" style="margin-bottom:12px">
          <b>${esc(T.name)}${T.hackable ? ' — you may remove this.' : ' — this one has to stay.'}</b><br>${esc(T.why)}
        </div>
        <div class="row c2">
          ${numRow('Length', 'wlen', MH.G.wallLen(obj), T.hackable ? '' : 'disabled')}
          ${numRow('Thickness', 'wthk', MH.Store.thickness(obj), T.hackable ? '' : 'disabled')}
        </div>
        <div class="row c2">${numRow('Start X', 'x1', obj.x1)}${numRow('Start Y', 'y1', obj.y1)}</div>
        <div class="row c2">${numRow('End X', 'x2', obj.x2)}${numRow('End Y', 'y2', obj.y2)}</div>
        <div class="field"><label>Construction</label>
          <select data-walltype="1" ${T.hackable ? '' : 'disabled'}>
            ${Object.values(MH.WALL_TYPES).map(t => `<option value="${t.id}" ${t.id === obj.type ? 'selected' : ''}>${esc(t.name)}</option>`).join('')}
          </select></div>
        <div class="note ${T.hackable ? '' : 'warn'}">${esc(T.note)}</div>
        ${T.hackable ? `<div class="btn-row" style="margin-top:10px">
            <button class="btn ${obj.demolished ? '' : 'danger'}" data-act="demo">${obj.demolished ? 'Restore this wall' : 'Demolish this wall'}</button>
            <button class="btn danger" data-act="del">Delete</button>
          </div>
          <div class="hint">Demolishing keeps a dashed ghost on the drawing so you can see what was there and price the hacking. Deleting removes it entirely.</div>`
          : `<div class="btn-row" style="margin-top:10px"><button class="btn" disabled>Cannot be removed</button></div>`}`;
      return;
    }

    if (kind === 'opening') {
      const w = MH.Store.wall(obj.wallId);
      pane.innerHTML = `
        <div class="sel-head"><div><span class="kind">Opening</span><h3>${esc(obj.label || obj.type)}</h3></div></div>
        <div class="field"><label>Label</label><input type="text" data-str="label" value="${esc(obj.label || '')}"></div>
        <div class="row c2">${numRow('Width', 'ow', obj.w)}${numRow('Height', 'oh', obj.h || 2100)}</div>
        <div class="row c2">
          ${numRow('Position along wall', 'opos', obj.pos)}
          ${obj.type === 'window' ? numRow('Sill height', 'osill', obj.sill === undefined ? 900 : obj.sill) : ''}
        </div>
        <div class="field"><label>Type</label><select data-otype="1">
          ${['door', 'slide', 'slide2', 'slide3', 'pocket', 'bifold', 'barn', 'open', 'arch', 'window']
            .map(t => `<option value="${t}" ${obj.type === t ? 'selected' : ''}>${t}</option>`).join('')}
        </select></div>
        ${obj.type === 'door' ? `<div class="field"><label>Hinge</label><select data-swing="1">
          <option value="left" ${obj.swing === 'left' ? 'selected' : ''}>Left</option>
          <option value="right" ${obj.swing === 'right' ? 'selected' : ''}>Right</option>
          <option value="double" ${obj.swing === 'double' ? 'selected' : ''}>Double</option>
        </select></div>` : ''}
        <div class="btn-row" style="margin-top:8px">
          <button class="btn" data-act="flip">Flip side</button>
          ${obj.locked ? '' : '<button class="btn danger" data-act="del">Delete</button>'}
        </div>
        <div class="hint" style="margin-top:8px">On ${esc(w ? MH.Store.wallType(w).name : 'a wall')}, ${w ? Math.round(MH.G.wallLen(w)) : '?'} mm long.</div>
        ${obj.locked ? '<div class="note warn">This opening is fixed. The main entrance and the household shelter door cannot be moved or removed.</div>' : ''}`;
      return;
    }

    if (kind === 'room') {
      const area = MH.U.area(MH.G.rectArea(obj));
      pane.innerHTML = `
        <div class="sel-head"><div><span class="kind">Room zone</span><h3>${esc(obj.name)}</h3></div></div>
        <div class="field"><label>Name</label><input type="text" data-str="name" value="${esc(obj.name)}"></div>
        <div class="row c2">${numRow('Width', 'rw', Math.abs(obj.x2 - obj.x1))}${numRow('Depth', 'rd', Math.abs(obj.y2 - obj.y1))}</div>
        <div class="row c2">${numRow('Left', 'x1', Math.min(obj.x1, obj.x2))}${numRow('Top', 'y1', Math.min(obj.y1, obj.y2))}</div>
        <div class="note">${area.label}${obj.protected ? ' · protected household shelter' : ''}</div>
        <div class="group" style="margin-top:14px"><h4>Floor finish</h4>
          <div class="matlist">
            ${MH.MATERIALS.filter(m => m.cat === 'Floor').map(m => `
              <button class="mat ${obj.floor === m.id ? 'on' : ''}" data-floor="${m.id}">
                <i style="background:${m.hex}"></i>
                <span class="t"><b>${esc(m.name)}</b><small>${esc(m.note)}</small>
                <span class="meta">${esc(m.price)} · maintenance ${esc(m.maintenance)} · humidity
                <span class="hum">${[1, 2, 3, 4, 5].map(n => `<i class="${n <= m.humidity ? 'on' : ''}"></i>`).join('')}</span></span></span>
              </button>`).join('')}
          </div>
        </div>
        <div class="switch"><span>Wet area</span><input type="checkbox" data-bool="wet" ${obj.wet ? 'checked' : ''}></div>
        <div class="btn-row" style="margin-top:10px">
          <button class="btn dark" data-act="autolayout">Suggest a layout</button>
          <button class="btn" data-ai="room">Ask AI about this room</button>
        </div>
        <div class="btn-row" style="margin-top:6px">
          <button class="btn danger full" data-act="del">Delete zone</button>
        </div>`;
      return;
    }
  }

  /* ----------------------------------------------------------- INSIGHTS */
  function renderInsights(a) {
    const counts = { error: 0, warn: 0, tip: 0, good: 0 };
    a.issues.forEach(i => counts[i.level]++);
    $('#pInsight').innerHTML = `
      <div class="scores">
        <div class="score big"><b>${a.scores.overall}</b><span>Plan health</span><div class="bar"><i style="width:${a.scores.overall}%"></i></div></div>
        <div class="score"><b>${a.scores.circulation}</b><span>Circulation</span><div class="bar"><i style="width:${a.scores.circulation}%"></i></div></div>
        <div class="score"><b>${a.scores.ergonomics}</b><span>Ergonomics</span><div class="bar"><i style="width:${a.scores.ergonomics}%"></i></div></div>
        <div class="score"><b>${a.scores.daylight}</b><span>Daylight</span><div class="bar"><i style="width:${a.scores.daylight}%"></i></div></div>
        <div class="score"><b>${a.scores.compliance}</b><span>Compliance</span><div class="bar"><i style="width:${a.scores.compliance}%"></i></div></div>
      </div>
      <div class="advice-head">
        <span><b>${counts.error}</b>to fix</span>
        <span><b>${counts.warn}</b>to watch</span>
        <span><b>${counts.tip}</b>ideas</span>
        <span><b>${counts.good}</b>looking good</span>
      </div>
      ${a.issues.map((i, n) => `
        <div class="advice ${i.level}">
          <b>${esc(i.title)}</b><p>${esc(i.detail)}</p>
          ${i.ids.length ? `<button class="show" data-issue="${n}">Show me on the plan →</button>` : ''}
        </div>`).join('') ||
        '<p class="hint">Nothing to flag. Move something and this will fill up.</p>'}
      <div class="note">Every one of these is measured, not guessed: real clearances from your drawing, checked against published ergonomic standards, HDB renovation rules and the Civil Defence Shelter Act. It runs offline and costs nothing. <b>Ask AI</b> adds the judgement a checklist cannot make.</div>`;
    $('#pInsight')._issues = a.issues;
  }

  /* ---------------------------------------------------------- SCHEDULE */
  function renderSchedule(a) {
    const groups = {};
    a.budget.lines.forEach(l => { (groups[l.group] = groups[l.group] || []).push(l); });
    const money = n => 'S$' + Math.round(n).toLocaleString();
    $('#pSched').innerHTML = `
      <div class="group"><h4>Areas</h4>
        <table class="sched">
          <tr><th>Room</th><th class="n">Size</th><th class="n">m²</th><th class="n">sq ft</th></tr>
          ${a.stats.rooms.map(r => `<tr><td>${r.num ? r.num + '. ' : ''}${esc(r.name)}</td>
            <td class="n">${Math.round(r.w)}×${Math.round(r.d)}</td>
            <td class="n">${r.area.sqm}</td><td class="n">${r.area.sqft}</td></tr>`).join('')}
          <tr class="total"><td>Gross internal</td><td class="n"></td>
            <td class="n">${a.stats.gross.sqm}</td><td class="n">${a.stats.gross.sqft}</td></tr>
        </table>
      </div>
      <div class="group"><h4>Indicative budget</h4>
        <table class="sched">
          <tr><th>Item</th><th class="n">Qty</th><th class="n">Low</th><th class="n">High</th></tr>
          ${Object.entries(groups).map(([g, ls]) => `
            <tr class="grp"><td colspan="4">${esc(g)}</td></tr>
            ${ls.map(l => `<tr><td>${esc(l.name)}</td><td class="n">${esc(l.qty)}</td>
              <td class="n">${money(l.lo)}</td><td class="n">${money(l.hi)}</td></tr>`).join('')}`).join('')}
          <tr class="total"><td>Total</td><td class="n"></td>
            <td class="n">${money(a.budget.lo)}</td><td class="n">${money(a.budget.hi)}</td></tr>
        </table>
        <div class="note">Indicative Singapore supply-and-install ranges, not a quotation. They exclude professional fees, HDB permits, electrical and plumbing works, air-conditioning, false ceilings, painting and haulage. Use them to compare options against each other, then get three real quotes.</div>
      </div>
      <div class="group"><h4>Walls</h4>
        <table class="sched">
          <tr><th>Construction</th><th class="n">Run</th><th class="n">Status</th></tr>
          ${Object.values(MH.WALL_TYPES).map(T => {
            const ws = S.walls.filter(w => w.type === T.id);
            if (!ws.length) return '';
            const len = ws.reduce((s, w) => s + MH.G.wallLen(w), 0);
            const gone = ws.filter(w => w.demolished).length;
            return `<tr><td>${esc(T.name)}</td><td class="n">${(len / 1000).toFixed(2)} m</td>
              <td class="n">${gone ? gone + ' removed' : (T.hackable ? 'hackable' : 'locked')}</td></tr>`;
          }).join('')}
        </table>
      </div>
      <div class="group"><h4>Lighting targets</h4>
        <table class="sched">
          <tr><th>Space</th><th class="n">Lux</th><th class="n">Colour</th></tr>
          ${MH.LIGHTING_GUIDE.map(l => `<tr><td>${esc(l.space)}<br><small style="color:var(--ink-3)">${esc(l.notes)}</small></td>
            <td class="n">${esc(l.lux)}</td><td class="n">${esc(l.temp)}</td></tr>`).join('')}
        </table>
      </div>`;
  }

  /* ---------------------------------------------------------------- AI */
  function renderAI() {
    const cfg = MH.AI.config();
    const has = MH.AI.hasKey();
    $('#aiKeyWarn').innerHTML = has ? '' :
      `<div class="note warn" style="margin-bottom:10px"><b>No API key yet.</b> The AI consultant needs either an Anthropic or a Gemini key. Open Settings, paste one in, and it stays in this browser only. Everything else in this app works without it.
      <div class="btn-row" style="margin-top:8px"><button class="btn full" data-open="mSettings">Open Settings</button></div></div>`;
    $('#aiMsgs').innerHTML = aiHistory.map(m => {
      if (m.role === 'user') return `<div class="msg user">${esc(m.content)}</div>`;
      if (m.role === 'error') return `<div class="msg err">${esc(m.content)}</div>`;
      if (m.role === 'busy') return `<div class="msg ai"><span class="spin"></span> ${esc(m.content)}</div>`;
      return `<div class="msg ai">${md(m.content)}</div>`;
    }).join('') || `<div class="hint">Ask about anything on the plan. The consultant is sent your room dimensions, wall types, furniture positions, the automated checks and the budget, so answers are about <em>this</em> flat rather than about flats in general.<br><br>Provider: <b>${esc(cfg.provider === 'anthropic' ? 'Claude' : 'Gemini')}</b> · <b>${esc(cfg.model)}</b></div>`;
    $('#aiMsgs').scrollTop = 1e6;
  }

  function pushAI(role, content) { aiHistory.push({ role, content }); renderAI(); }
  function busy(msg) { aiHistory.push({ role: 'busy', content: msg }); renderAI(); return aiHistory.length - 1; }
  function resolve(i, role, content) { aiHistory[i] = { role, content }; renderAI(); }

  async function runAI(kind, brief, roomId) {
    if (!MH.AI.hasKey()) { openModal('mSettings'); toast('Add an API key first', true); return; }
    setPane('right', 'pAI');
    const labels = {
      critique: 'Reviewing the whole plan…', style: 'Working up the style scheme…',
      room: 'Thinking about that room…', layout: 'Laying out the room…',
      palette: 'Choosing a palette…', chat: 'Thinking…'
    };
    const i = busy(labels[kind] || 'Thinking…');
    try {
      if (kind === 'critique') resolve(i, 'assistant', await MH.AI.critique(S));
      else if (kind === 'style') resolve(i, 'assistant', await MH.AI.styleAdvice(S, S.style, brief));
      else if (kind === 'room') resolve(i, 'assistant', await MH.AI.roomBrief(S, roomId, brief));
      else if (kind === 'chat') resolve(i, 'assistant', await MH.AI.chat(S, aiHistory.filter(m => m.role === 'user' || m.role === 'assistant').slice(0, -1), brief));
      else if (kind === 'layout') {
        const plan = await MH.AI.layoutRoom(S, roomId, brief);
        const room = MH.Store.room(roomId);
        MH.Store.commit('AI layout: ' + room.name, s => {
          if (plan.replace) s.items = s.items.filter(it => { const r = MH.G.roomAt(s.rooms, it.x, it.y); return !r || r.id !== roomId; });
          plan.add.forEach(a => s.items.push(MH.Store.hydrateItem({ catId: a.catId, x: a.x, y: a.y, rot: a.rot, w: a.w, d: a.d, note: a.note, id: MH.Store.uid('i') })));
          s.selection = [];
        });
        resolve(i, 'assistant', `**${room.name} laid out.** ${plan.notes}\n\n` +
          plan.add.map(a => `- **${(MH.Store.catalogById(a.catId) || {}).name || a.catId}** — ${a.note || 'placed'}`).join('\n') +
          `\n\nCheck the Insights tab; the deterministic clearance checks have re-run over the new layout. Undo with Ctrl+Z if you hate it.`);
        toast('Layout applied to ' + room.name);
      } else if (kind === 'palette') {
        const p = await MH.AI.paletteFor(S, brief);
        MH.Store.commit('AI palette: ' + (p.name || 'scheme'), s => {
          s.paletteOverride = { accent: p.accent, wood: p.wood, metal: p.metal, soft: p.soft, wall: (p.rooms[0] || {}).wall };
          p.rooms.forEach(r => { const rr = s.rooms.find(x => x.id === r.roomId); if (rr && r.floor) rr.floor = r.floor; });
        });
        resolve(i, 'assistant', `**${p.name}**\n\n${p.rationale}\n\n` +
          p.rooms.map(r => `- **${(MH.Store.room(r.roomId) || {}).name || r.roomId}** — walls ${r.wallName || ''} \`${r.wall || ''}\`, floor ${(MH.MATERIALS.find(m => m.id === r.floor) || {}).name || r.floor}`).join('\n') +
          `\n\nFloors are applied to the drawing. Wall colours are listed for your painter; the plan view shows floors, not walls.`);
        toast('Palette applied');
      }
    } catch (e) {
      resolve(i, 'error', e.message || String(e));
    }
  }


  /* ==================================================== ON-CANVAS BUBBLE ===
     The single biggest usability change: what you can do to a thing appears
     next to the thing, not in a panel on the far side of the screen. */
  const ICON = n => `<svg><use href="#i-${n}"/></svg>`;

  function hideBubble() { const b = $('#bubble'); if (b) b.hidden = true; }

  function renderBubble() {
    const b = $('#bubble');
    if (!b) return;
    /* While a drawing tool is active the bubble would sit between you and the
       plan you are trying to draw on, so it stands down. */
    if (ui.view3 || drag || ui.placing || tool !== 'select') { b.hidden = true; return; }
    const sel = MH.Store.selected();
    if (sel.length !== 1) { b.hidden = true; return; }
    const { kind, obj } = sel[0];

    let anchor, html = '';
    if (kind === 'item') {
      const bb = MH.G.aabb(MH.G.corners(obj.x, obj.y, obj.w, obj.d, obj.rot));
      anchor = { x: (bb.x1 + bb.x2) / 2, y: bb.y1 };
      const st = MH.R2.palette(S).style;
      html = `<div class="bubble-title"><b>${esc(obj.name)}</b>
                <span>${Math.round(obj.w)} × ${Math.round(obj.d)} mm</span></div>
        <div class="bubble-row">
          <button class="bb" data-bb="rot">${ICON('rotate')}Turn</button>
          <button class="bb" data-bb="dup">${ICON('copy')}Copy</button>
          <button class="bb" data-bb="more">${ICON('gear')}Size &amp; more</button>
          <button class="bb kill" data-bb="del">${ICON('trash')}</button>
        </div>
        <div class="bubble-sw">
          <i data-bbcol="" style="background:linear-gradient(135deg,#fff 45%,#bbb 45%,#bbb 55%,#fff 55%)" title="Default"></i>
          ${st.palette.slice(0, 6).map(c => `<i data-bbcol="${c.hex}" style="background:${c.hex}" title="${esc(c.name)}"></i>`).join('')}
        </div>`;
    } else if (kind === 'wall') {
      const T = MH.Store.wallType(obj);
      const mid = MH.G.pointAlong(obj, MH.G.wallLen(obj) / 2);
      anchor = { x: mid.x, y: mid.y - MH.Store.thickness(obj) / 2 };
      const len = Math.round(MH.G.wallLen(obj));
      if (!T.hackable) {
        html = `<div class="bubble-title"><b>${esc(wallWhere(obj))}</b><span>${len} mm</span></div>
          <div class="bubble-locked">${ICON('lock')}
            <span><b>${esc(T.name)} — this one has to stay.</b>${esc(T.why)}</span></div>
          <div class="bubble-row"><button class="bb" data-bb="more">Read the rule</button></div>`;
      } else if (obj.demolished) {
        html = `<div class="bubble-title"><b>${esc(wallWhere(obj))}</b><span>coming down · ${len} mm</span></div>
          <div class="bubble-row">
            <button class="bb go" data-bb="undemo">${ICON('undo')}Put it back</button>
            <button class="bb" data-bb="more">Details</button>
          </div>`;
      } else {
        html = `<div class="bubble-title"><b>${esc(wallWhere(obj))}</b><span>${esc(T.short)} · ${len} mm</span></div>
          <div class="bubble-row">
            <button class="bb go" data-bb="demo">${ICON('hammer')}Take this wall down</button>
            <button class="bb" data-bb="more">${ICON('gear')}</button>
          </div>`;
      }
    } else if (kind === 'room') {
      anchor = { x: (obj.x1 + obj.x2) / 2, y: Math.min(obj.y1, obj.y2) };
      const area = MH.U.area(MH.G.rectArea(obj));
      html = `<div class="bubble-title"><b>${esc(obj.name)}</b><span>${area.sqm} m² · ${area.sqft} sq ft</span></div>
        <div class="bubble-row">
          <button class="bb" data-bb="furnish">${ICON('magic')}Furnish it</button>
          <button class="bb" data-bb="floor">${ICON('paint')}Floor</button>
          <button class="bb" data-bb="zoom">${ICON('fit')}Zoom in</button>
          <button class="bb" data-bb="more">${ICON('gear')}</button>
        </div>`;
    } else if (kind === 'opening') {
      const w = MH.Store.wall(obj.wallId); if (!w) { b.hidden = true; return; }
      const c = MH.G.pointAlong(w, obj.pos);
      anchor = { x: c.x, y: c.y - MH.Store.thickness(w) / 2 };
      const isDoor = obj.type !== 'window';
      html = `<div class="bubble-title"><b>${esc(obj.label || (isDoor ? 'Door' : 'Window'))}</b>
                <span>${Math.round(obj.w)} mm wide</span></div>
        <div class="bubble-row">
          ${obj.locked ? '' : `<button class="bb" data-bb="owide">${ICON('plus')}Wider</button>
          <button class="bb" data-bb="onarrow">${ICON('minus')}Narrower</button>`}
          ${isDoor ? `<button class="bb" data-bb="oflip">${ICON('rotate')}Flip</button>` : ''}
          ${obj.locked ? `<button class="bb" data-bb="more">Details</button>`
                       : `<button class="bb kill" data-bb="del">${ICON('trash')}</button>`}
        </div>`;
    } else { b.hidden = true; return; }

    b.innerHTML = html;
    b.hidden = false;
    const r = stage.getBoundingClientRect();
    const sx = anchor.x * S.view.z + S.view.ox;
    const sy = anchor.y * S.view.z + S.view.oy;
    const bw = b.offsetWidth, bh = b.offsetHeight;
    let px = Math.max(bw / 2 + 8, Math.min(r.width - bw / 2 - 8, sx));
    let py = sy - 14;
    if (py - bh < 6) py = sy + bh + 34;          // flip below when it would clip
    b.style.left = px + 'px';
    b.style.top = py + 'px';
  }

  function bubbleAction(act) {
    const sel = MH.Store.selected(); if (!sel.length) return;
    const { kind, obj } = sel[0];
    switch (act) {
      case 'rot': MH.Store.commit('Turn', () => { const o = MH.Store.item(obj.id); if (o) o.rot = ((o.rot || 0) + 90) % 360; }); break;
      case 'dup': MH.Store.duplicateSelected(); break;
      case 'del': MH.Store.deleteSelected(); toast('Deleted. Ctrl+Z brings it back.'); break;
      case 'more': setPane('right', 'pInspect'); if (window.innerWidth <= 940) $('#panelR').classList.add('open'); break;
      case 'demo': case 'undemo': demolishWall(obj); break;
      case 'zoom': zoomToRoom(obj); break;
      case 'floor': setPane('right', 'pInspect'); toast('Pick a floor finish on the right'); break;
      case 'furnish': autoFurnish(obj); break;
      case 'oflip': MH.Store.commit('Flip', () => { const o = MH.Store.opening(obj.id); if (o) o.flip = !o.flip; }); break;
      case 'owide': resizeOpening(obj, 100); break;
      case 'onarrow': resizeOpening(obj, -100); break;
    }
  }
  function resizeOpening(o, d) {
    const w = MH.Store.wall(o.wallId); if (!w) return;
    const max = MH.G.wallLen(w) - 200;
    MH.Store.commit(d > 0 ? 'Widen' : 'Narrow', () => {
      const x = MH.Store.opening(o.id); if (!x) return;
      x.w = Math.max(600, Math.min(max, x.w + d));
      x.pos = Math.max(x.w / 2, Math.min(MH.G.wallLen(w) - x.w / 2, x.pos));
    });
  }
  function zoomToRoom(r) {
    const rect = stage.getBoundingClientRect();
    const w = Math.abs(r.x2 - r.x1), h = Math.abs(r.y2 - r.y1);
    S.view.z = Math.max(0.006, Math.min(1.2, Math.min((rect.width - 120) / w, (rect.height - 120) / h)));
    S.view.ox = rect.width / 2 - (r.x1 + r.x2) / 2 * S.view.z;
    S.view.oy = rect.height / 2 - (r.y1 + r.y2) / 2 * S.view.z;
    requestDraw(); renderBubble();
  }
  function autoFurnish(r) {
    const add = MH.Advisor.suggestLayout(S, r.id);
    if (!add.length) { toast('No standard layout for a room called “' + r.name + '”. Try Ask AI.', true); return; }
    MH.Store.commit('Furnish ' + r.name, st => {
      st.items = st.items.filter(it => { const rr = MH.G.roomAt(st.rooms, it.x, it.y); return !rr || rr.id !== r.id; });
      add.forEach(a => st.items.push(MH.Store.hydrateItem(Object.assign({ id: MH.Store.uid('i') }, a))));
    });
    toast(r.name + ' furnished. Ctrl+Z if you hate it.');
  }
  function demolishWall(w) {
    const T = MH.Store.wallType(w);
    if (!T.hackable) {
      MH.Store.select(w.id); setPane('right', 'pInspect');
      toast(T.name + ' cannot be removed', true);
      return;
    }
    MH.Store.commit(w.demolished ? 'Put the wall back' : 'Take the wall down', st => {
      const ww = st.walls.find(x => x.id === w.id);
      ww.demolished = !ww.demolished;
      if (ww.demolished) st.openings = st.openings.filter(o => o.wallId !== ww.id || o.locked);
      st.selection = [ww.id];
    });
    toast(w.demolished ? 'Wall restored' : 'Wall marked to come down — ' + MH.U.dim(MH.G.wallLen(w)) + ' of hacking');
  }

  /* ================================================== ALIGNMENT GUIDES ===
     While you drag, edges and centres snap to the things already there. This
     is the difference between "roughly there" and "actually against the wall". */
  function snapTargets(exceptId) {
    const xs = [], ys = [];
    S.items.forEach(it => {
      if (it.id === exceptId || it.hidden) return;
      const b = MH.G.aabb(MH.G.corners(it.x, it.y, it.w, it.d, it.rot));
      xs.push(b.x1, b.x2, (b.x1 + b.x2) / 2);
      ys.push(b.y1, b.y2, (b.y1 + b.y2) / 2);
    });
    S.walls.forEach(w => {
      if (w.demolished) return;
      const t = MH.Store.thickness(w) / 2;
      if (Math.abs(w.x1 - w.x2) < 1) { xs.push(w.x1 - t, w.x1 + t); }
      if (Math.abs(w.y1 - w.y2) < 1) { ys.push(w.y1 - t, w.y1 + t); }
    });
    S.rooms.forEach(r => { xs.push(r.x1, r.x2, (r.x1 + r.x2) / 2); ys.push(r.y1, r.y2, (r.y1 + r.y2) / 2); });
    return { xs, ys };
  }
  function applyGuides(it) {
    const tol = 9 / S.view.z;
    const t = snapTargets(it.id);
    const b = MH.G.aabb(MH.G.corners(it.x, it.y, it.w, it.d, it.rot));
    const guides = [];
    const best = (vals, edges) => {
      let bd = tol, adj = 0, line = null;
      edges.forEach(e => vals.forEach(v => {
        const d = Math.abs(v - e);
        if (d < bd) { bd = d; adj = v - e; line = v; }
      }));
      return line === null ? null : { adj, line };
    };
    const gx = best(t.xs, [b.x1, b.x2, (b.x1 + b.x2) / 2]);
    const gy = best(t.ys, [b.y1, b.y2, (b.y1 + b.y2) / 2]);
    if (gx) { it.x += gx.adj; guides.push({ axis: 'x', v: gx.line }); }
    if (gy) { it.y += gy.adj; guides.push({ axis: 'y', v: gy.line }); }
    ui.guides = guides;
  }

  /* ==================================================== GHOST PLACEMENT ===
     Click a catalogue item, then click where it goes. A preview follows the
     cursor so you can see the real footprint before you commit. */
  function startPlacing(catId) {
    const c = MH.Store.catalogById(catId); if (!c) return;
    ui.placing = { catId, name: c.name, w: c.w, d: c.d, rot: 0, x: null, y: null };
    MH.Store.select([]);
    setTool('select');
    setStatus();
    c2.style.cursor = 'copy';
    toast('Click where the ' + c.name.toLowerCase() + ' should go — Esc to cancel');
  }
  function cancelPlacing() {
    if (!ui.placing) return;
    ui.placing = null; c2.style.cursor = 'default'; setStatus(); requestDraw();
  }

  /* ============================================================== STATUS === */
  const TOOL_HINT = {
    select:   ['Select', 'Click anything to change it. Drag to move. Scroll to zoom.'],
    wall:     ['Draw a wall', 'Drag from one point to another. Hold <b>Shift</b> for a free angle.'],
    demolish: ['Take down', 'Click a wall to mark it for demolition. Concrete and the shelter will say no.'],
    door:     ['Add a door', 'Click on any wall you are allowed to cut into.'],
    window:   ['Add a window', 'Click on an outside wall.'],
    room:     ['Draw a room', 'Drag out a rectangle, then give it a name.'],
    measure:  ['Measure', 'Drag from one point to another. Hold <b>Shift</b> to keep it straight.'],
    calibrate:['Set the scale', 'Click two points on your scan whose real distance you know.']
  };
  function setStatus() {
    const t = ui.placing
      ? ['Placing', 'Click where the <b>' + esc(ui.placing.name) + '</b> should go. <b>Esc</b> cancels.']
      : (TOOL_HINT[tool] || ['Select', '']);
    $('#stTool').textContent = t[0];
    $('#stHint').innerHTML = t[1];
    const sel = MH.Store.selected();
    $('#stSel').textContent = sel.length === 1
      ? (sel[0].kind === 'wall' ? wallWhere(sel[0].obj) : (sel[0].obj.name || sel[0].obj.label || ''))
      : (sel.length ? sel.length + ' selected' : '');
  }

  /* ================================================================ TOUR === */
  const TOUR = [
    { sel: '#stage', title: 'This is your flat',
      body: 'Blk 522, 4-Room Type-I, straight off the HDB sheet: 90 m² inside plus the air-con ledge. Click any room, wall or piece of furniture and it will tell you what you can do with it.' },
    { sel: '#legend', title: 'Black means it stays',
      body: 'Your HDB plan shades structural columns and walls in black. Those hold the building up, and the household shelter is protected by law. This app will refuse to remove them, exactly as HDB would. Everything drawn in hatched grey is a partition you may take out with a permit.' },
    { sel: '#btnXray', title: 'Not sure what you can touch?',
      body: 'Press this and the plan fades everything you are not allowed to change, leaving only the walls that can actually come down.' },
    { sel: '#pAdd', title: 'Add anything, at real sizes',
      body: 'Click something to pick it up, then click on the plan to drop it. Every item is a real product size in millimetres, and you can type your own dimensions afterwards.' },
    { sel: '.panel.right .tabs', title: 'It checks your work as you go',
      body: '<b>Advice</b> measures door swings, walking room, the kitchen work triangle and TV distance every time you move something. <b>Ask AI</b> adds a design consultant if you give it a key.' }
  ];
  let tourAt = -1;
  function startTour() { tourAt = -1; $('#tour').hidden = false; nextTour(); }
  function nextTour() {
    tourAt++;
    if (tourAt >= TOUR.length) { $('#tour').hidden = true; try { localStorage.setItem('myhome.tour', '1'); } catch (e) {} return; }
    const st = TOUR[tourAt];
    const el = document.querySelector(st.sel);
    const r = el ? el.getBoundingClientRect() : { left: innerWidth / 2 - 100, top: innerHeight / 2 - 60, width: 200, height: 120 };
    const pad = 6;
    const spot = $('#tourSpot');
    spot.style.left = (r.left - pad) + 'px'; spot.style.top = (r.top - pad) + 'px';
    spot.style.width = (r.width + pad * 2) + 'px'; spot.style.height = (r.height + pad * 2) + 'px';
    $('#tourStep').textContent = 'Step ' + (tourAt + 1) + ' of ' + TOUR.length;
    $('#tourTitle').textContent = st.title;
    $('#tourBody').innerHTML = st.body;
    $('#tourNext').textContent = tourAt === TOUR.length - 1 ? 'Start designing' : 'Next';
    const card = $('#tourCard');
    const cw = 330, ch = card.offsetHeight || 190;
    let left = r.left + r.width / 2 - cw / 2;
    let top = r.bottom + 14;
    if (top + ch > innerHeight - 10) top = Math.max(10, r.top - ch - 14);
    card.style.left = Math.max(12, Math.min(innerWidth - cw - 12, left)) + 'px';
    card.style.top = top + 'px';
  }

  /* ------------------------------------------------------------- MODALS */
  function openModal(id) { $('#' + id).classList.add('on'); if (id === 'mSettings') fillSettings(); if (id === 'mHelp') fillHelp(); }
  function closeModal(el) { el.classList.remove('on'); }

  function fillHelp() {
    $('#helpBody').innerHTML = `
      <div class="group"><h4>1 · Scale is the whole game</h4>
        <p class="hint">Everything in this app is stored in millimetres. The scale readout at the top right tells you the true architect's ratio for your screen, so at 1:50 a printed page really is 1:50. Type dimensions in whatever unit you like: <kbd>3600</kbd>, <kbd>3.6m</kbd>, <kbd>360cm</kbd>, <kbd>11'6"</kbd> all work.</p>
        <p class="hint" style="margin-top:6px">The seed plan is reconstructed from a photograph of the Destino Deco drawing. The room list, adjacencies and door positions follow it; the millimetres are provisional. To make them true: <b>Settings → Trace your own drawing</b>, drop in the scan, <b>Set scale from two points</b>, then drag wall ends onto the traced lines.</p>
      </div>
      <div class="group"><h4>2 · Some walls cannot come down</h4>
        <p class="hint">Solid dark walls are reinforced concrete and carry the building. The blue-grey ones are the household shelter, protected by the Civil Defence Shelter Act, where even a nail is an offence. The app refuses to demolish either, which is exactly what HDB will do. Hatched walls are brick or drywall partitions: those you can take out with a permit and a registered contractor.</p>
      </div>
      <div class="group"><h4>3 · Rooms are labels, walls are fabric</h4>
        <p class="hint">A room zone carries the name, the area and the floor finish. Demolishing a wall does not merge two zones automatically; drag one zone over the space or redraw it. This keeps the area schedule honest.</p>
      </div>
      <div class="group"><h4>4 · The checks run offline</h4>
        <p class="hint">Clearances, work triangle, viewing distances, daylight, storage ratio, floor loading and the legal constraints are all measured deterministically on every edit. No key needed. The AI tab is a second opinion on top, not the source of the numbers.</p>
      </div>
      <div class="group"><h4>5 · Shortcuts</h4>
        <p class="hint">
          <kbd>V</kbd> select · <kbd>W</kbd> wall · <kbd>X</kbd> demolish · <kbd>D</kbd> door · <kbd>N</kbd> window · <kbd>R</kbd> room · <kbd>M</kbd> measure<br>
          <kbd>Tab</kbd> plan / dollhouse · <kbd>F</kbd> fit · <kbd>Ctrl</kbd>+<kbd>Z</kbd> undo · <kbd>Ctrl</kbd>+<kbd>D</kbd> duplicate · <kbd>Del</kbd> delete<br>
          <kbd>[</kbd> <kbd>]</kbd> rotate 15° · <kbd>Shift</kbd> while drawing frees the angle · <kbd>Alt</kbd>+drag pans · scroll zooms
        </p>
      </div>
      <div class="group"><h4>6 · Nothing leaves this browser</h4>
        <p class="hint">The plan is saved to localStorage on this device. API keys are stored the same way. Plan data is only ever transmitted when you press an AI button, and then only to the provider you chose.</p>
      </div>`;
  }

  function fillSettings() {
    const cfg = MH.AI.config();
    $('#setProvider').value = cfg.provider;
    const models = MH.AI.MODELS[cfg.provider] || [];
    $('#setModel').innerHTML = models.map(m => `<option value="${m.id}" ${m.id === cfg.model ? 'selected' : ''}>${esc(m.name)}</option>`).join('');
    const cur = models.find(m => m.id === cfg.model) || models[0];
    $('#setModelNote').textContent = cur ? cur.note : '';
    $('#setAnthropicKey').value = cfg.anthropicKey || '';
    $('#setGeminiKey').value = cfg.geminiKey || '';
    $('#fldAnthropic').style.display = cfg.provider === 'anthropic' ? '' : 'none';
    $('#fldGemini').style.display = cfg.provider === 'gemini' ? '' : 'none';

    $('#setUnit').value = S.settings.unit;
    $('#setSnap').value = String(S.settings.snap);
    $('#setCeiling').value = MH.U.fmt(S.meta.ceiling, MH.U.unit, { bare: true });
    $('#setNorth').value = S.meta.northAngle || 0;
    $('#setGrid').checked = S.settings.grid;
    $('#setLabels').checked = S.settings.showLabels;
    $('#setDims').checked = S.settings.showDims;
    $('#setFurn').checked = S.settings.showFurniture;
    $('#setClear').checked = S.settings.showClearance;
    $('#setGhosts').checked = S.settings.showGhosts;
    $('#setTheme').checked = S.settings.theme === 'dark';
    $('#setName').value = S.name || '';

    const u = S.underlay;
    $('#underlayCtl').style.display = u && u.src ? '' : 'none';
    if (u && u.src) {
      $('#ulOpacity').value = u.opacity === undefined ? 0.45 : u.opacity;
      $('#ulX').value = MH.U.fmt(u.x, MH.U.unit, { bare: true });
      $('#ulY').value = MH.U.fmt(u.y, MH.U.unit, { bare: true });
      $('#ulW').value = MH.U.fmt(u.w, MH.U.unit, { bare: true });
      $('#ulRot').value = u.rot || 0;
    }
    $('#calibHint').textContent = S.meta.calibrated
      ? 'This plan has been calibrated. Dimensions are true to your drawing.'
      : 'Not calibrated. Seed dimensions are a reconstruction.';
  }

  function askCalibration() {
    const d = Math.hypot(calib.b.x - calib.a.x, calib.b.y - calib.a.y);
    const answer = prompt(
      'You measured ' + MH.U.dim(d) + ' between those two points on the drawing.\n\n' +
      'What is the real distance? (e.g. 3600, 3.6m, 360cm, 11\'6")', '3600');
    if (!answer) { calib = null; setTool('select'); requestDraw(); return; }
    const real = MH.U.parse(answer);
    if (!isFinite(real) || real <= 0) { toast('Could not read that dimension', true); calib = null; setTool('select'); return; }
    const k = real / d;
    MH.Store.commit('Calibrate underlay', s => {
      if (s.underlay) {
        s.underlay.w *= k; s.underlay.h *= k;
        s.underlay.x = calib.a.x - (calib.a.x - s.underlay.x) * k;
        s.underlay.y = calib.a.y - (calib.a.y - s.underlay.y) * k;
      }
      s.meta.calibrated = true;
    });
    toast('Underlay scaled by ' + k.toFixed(3) + '×. Now trace the walls onto it.');
    calib = null; setTool('select');
  }

  /* -------------------------------------------------------------- TOOLS */
  function setTool(t) {
    tool = t;
    if (t !== 'select') cancelPlacing();
    $$('#toolbar .tool').forEach(b => b.classList.toggle('on', b.dataset.tool === t));
    c2.style.cursor = t === 'select' ? 'default' : 'crosshair';
    if (t !== 'measure') ui.draft = null;
    /* Synchronously, not on the next frame: a stale bubble left floating over
       the plan would swallow the very first click of the new tool. */
    renderBubble();
    setStatus();
    requestDraw();
  }

  function setView3(on) {
    ui.view3 = on;
    $('#stage').classList.toggle('view3', on);
    $('#view3ctl').style.display = on ? '' : 'none';
    $('#legend').style.display = on ? 'none' : '';
    $('#btnView').classList.toggle('on', on);
    $('#btnView').querySelector('span').textContent = on ? 'Plan' : '3D';
    if (on && !S.view3) S.view3 = { yaw: 30, pitch: 56, zoom: 1, cut: 1200, ox: 0, oy: 0 };
    if (on) { $('#v3yaw').value = S.view3.yaw; $('#v3cut').value = S.view3.cut; $('#v3zoom').value = S.view3.zoom || 1; }
    requestDraw();
  }

  /* --------------------------------------------------------------- WIRE */
  function renderPanels() {
    /* One advisor pass feeds every panel; it is the most expensive thing we
       do on each edit and there is no reason to run it four times. */
    const a = MH.Advisor.run(S);
    renderCatalog(); renderStructure(); renderRooms(a); renderStyle();
    renderInspect(a); renderInsights(a); renderSchedule(a); renderAI();
    $('#btnUndo').disabled = !MH.Store.canUndo();
    $('#btnRedo').disabled = !MH.Store.canRedo();
    $('#btnXray').classList.toggle('on', !!S.settings.xray);
    document.documentElement.dataset.theme = S.settings.theme === 'dark' ? 'dark' : '';
    renderBubble();
    setStatus();
  }

  function commitField(target) {
    const sel = MH.Store.selected();
    if (!sel.length) return;
    const { kind, obj } = sel[0];
    const key = target.dataset.num;
    const v = MH.U.parse(target.value);
    if (!isFinite(v)) { toast('Could not read that dimension', true); renderInspect(); return; }
    MH.Store.commit('Edit', s => {
      const o = MH.Store.findAny(obj.id);
      if (!o) return;
      if (kind === 'item') {
        if (key === 'w') o.w = Math.max(50, v);
        else if (key === 'd') o.d = Math.max(50, v);
        else if (key === 'h') o.h = Math.max(10, v);
        else if (key === 'x') o.x = v;
        else if (key === 'y') o.y = v;
      } else if (kind === 'wall') {
        if (key === 'wlen') {
          const vv = MH.G.wallVec(o);
          o.x2 = o.x1 + vv.ux * Math.max(100, v); o.y2 = o.y1 + vv.uy * Math.max(100, v);
        } else if (key === 'wthk') o.thickness = Math.max(40, v);
        else o[key] = v;
      } else if (kind === 'opening') {
        const wl = MH.Store.wall(o.wallId);
        if (key === 'ow') o.w = Math.max(200, Math.min(wl ? MH.G.wallLen(wl) - 100 : 4000, v));
        else if (key === 'oh') o.h = Math.max(300, v);
        else if (key === 'opos') o.pos = Math.max(o.w / 2, Math.min(wl ? MH.G.wallLen(wl) - o.w / 2 : v, v));
        else if (key === 'osill') o.sill = Math.max(0, v);
      } else if (kind === 'room') {
        const x1 = Math.min(o.x1, o.x2), y1 = Math.min(o.y1, o.y2);
        if (key === 'rw') { o.x1 = x1; o.x2 = x1 + Math.max(300, v); }
        else if (key === 'rd') { o.y1 = y1; o.y2 = y1 + Math.max(300, v); }
        else if (key === 'x1') { const w = Math.abs(o.x2 - o.x1); o.x1 = v; o.x2 = v + w; }
        else if (key === 'y1') { const h = Math.abs(o.y2 - o.y1); o.y1 = v; o.y2 = v + h; }
      }
    });
  }

  function wire() {
    /* tabs */
    $$('.tabs button').forEach(b => b.addEventListener('click', () => {
      setPane(b.closest('.panel').classList.contains('left') ? 'left' : 'right', b.dataset.pane);
    }));
    /* tools */
    $$('#toolbar .tool').forEach(b => b.addEventListener('click', () => setTool(b.dataset.tool)));
    document.addEventListener('click', e => {
      const tb = e.target.closest('[data-tool-btn]');
      if (tb) { setTool(tb.dataset.toolBtn); toast('Now click on the plan'); }
      const om = e.target.closest('[data-open]');
      if (om) openModal(om.dataset.open);
    });

    /* canvas */
    [c2, c3].forEach(cv => {
      cv.addEventListener('pointerdown', onDown);
      cv.addEventListener('pointermove', onMove);
      cv.addEventListener('pointerup', onUp);
      cv.addEventListener('pointercancel', onUp);
      cv.addEventListener('wheel', onWheel, { passive: false });
      cv.addEventListener('contextmenu', e => e.preventDefault());
      cv.addEventListener('touchstart', onTouchStart, { passive: true });
      cv.addEventListener('touchmove', onTouchMove, { passive: false });
      cv.addEventListener('touchend', onTouchEnd);
      cv.addEventListener('dragover', e => { e.preventDefault(); e.dataTransfer.dropEffect = 'copy'; });
      cv.addEventListener('drop', e => {
        e.preventDefault();
        const id = e.dataTransfer.getData('text/mh-item'); if (!id) return;
        const w = toWorld(e);
        addFromCatalog(id, snapV(w.x), snapV(w.y));
      });
    });

    /* catalogue */
    $('#catSearch').addEventListener('input', e => { catQuery = e.target.value; renderCatalog(); });
    $('#pAdd').addEventListener('click', e => {
      const b = e.target.closest('[data-add]'); if (b) startPlacing(b.dataset.add);
    });
    $('#pAdd').addEventListener('dragstart', e => {
      const b = e.target.closest('[data-add]'); if (!b) return;
      e.dataTransfer.setData('text/mh-item', b.dataset.add);
      e.dataTransfer.effectAllowed = 'copy';
    });

    /* the bubble */
    $('#bubble').addEventListener('click', e => {
      const b = e.target.closest('[data-bb]');
      if (b) return bubbleAction(b.dataset.bb);
      const c = e.target.closest('[data-bbcol]');
      if (c) {
        const sel = MH.Store.selected(); if (!sel.length) return;
        MH.Store.commit('Colour', () => { const o = MH.Store.item(sel[0].obj.id); if (o) o.colour = c.dataset.bbcol || null; });
      }
    });

    /* show-me-what-I-can-change */
    const toggleXray = () => MH.Store.commit('X-ray', st => { st.settings.xray = !st.settings.xray; });
    $('#btnXray').addEventListener('click', toggleXray);
    $('#setXray').addEventListener('change', toggleXray);

    /* double-click a room to fill the screen with it */
    c2.addEventListener('dblclick', e => {
      const w = toWorld(e);
      const hit = MH.R2.pick(S, w.x, w.y);
      if (hit && hit.kind === 'room') zoomToRoom(hit.obj);
      else if (hit && hit.kind === 'item') { MH.Store.select(hit.id); setPane('right', 'pInspect'); }
    });

    /* the colour key folds away once you know it */
    $('#legendToggle').addEventListener('click', () => {
      const l = $('#legend'); l.classList.toggle('closed');
      try { localStorage.setItem('myhome.legend', l.classList.contains('closed') ? '0' : '1'); } catch (e) {}
    });
    if (localStorage.getItem('myhome.legend') === '0') $('#legend').classList.add('closed');

    /* tour */
    $('#tourNext').addEventListener('click', nextTour);
    $('#tourSkip').addEventListener('click', () => { $('#tour').hidden = true; try { localStorage.setItem('myhome.tour', '1'); } catch (er) {} });

    /* lists */
    $('#wallList').addEventListener('click', e => {
      const b = e.target.closest('[data-wall]'); if (!b) return;
      MH.Store.select(b.dataset.wall); setPane('right', 'pInspect'); focusOn(MH.Store.wall(b.dataset.wall));
    });
    $('#roomList').addEventListener('click', e => {
      const b = e.target.closest('[data-room]'); if (!b) return;
      MH.Store.select(b.dataset.room); setPane('right', 'pInspect'); focusOn(MH.Store.room(b.dataset.room));
    });
    $('#styleGrid').addEventListener('click', e => {
      const b = e.target.closest('[data-style]'); if (!b) return;
      MH.Store.commit('Style: ' + b.dataset.style, s => { s.style = b.dataset.style; s.paletteOverride = null; });
      toast((MH.STYLES.find(x => x.id === b.dataset.style) || {}).name + ' applied');
    });

    /* inspector delegation */
    $('#pInspect').addEventListener('change', e => {
      const t = e.target;
      if (t.dataset.num) return commitField(t);
      const sel = MH.Store.selected(); if (!sel.length) return;
      const { kind, obj } = sel[0];
      if (t.dataset.str) MH.Store.commit('Rename', s => { const o = MH.Store.findAny(obj.id); if (o) o[t.dataset.str] = t.value; });
      else if (t.dataset.rot) MH.Store.commit('Rotate', s => { const o = MH.Store.findAny(obj.id); if (o) o.rot = ((Number(t.value) % 360) + 360) % 360; });
      else if (t.dataset.bool) MH.Store.commit('Toggle', s => { const o = MH.Store.findAny(obj.id); if (o) o[t.dataset.bool] = t.checked; });
      else if (t.dataset.walltype) MH.Store.commit('Wall type', s => { const o = MH.Store.wall(obj.id); if (o) { o.type = t.value; delete o.thickness; } });
      else if (t.dataset.otype) MH.Store.commit('Opening type', s => {
        const o = MH.Store.opening(obj.id); if (!o) return;
        o.type = t.value; if (t.value === 'window' && o.sill === undefined) o.sill = 900;
      });
      else if (t.dataset.swing) MH.Store.commit('Hinge', s => { const o = MH.Store.opening(obj.id); if (o) o.swing = t.value; });
      else if (t.dataset.tv) MH.Store.commit('TV size', s => {
        const o = MH.Store.item(obj.id); if (!o) return;
        const n = Number(t.value), dims = MH.tvSize(n);
        o.catId = 'tv' + n; o.name = 'TV ' + n + ' inch'; o.w = dims.w; o.h = dims.h;
      });
      else if (t.dataset.colpick) MH.Store.commit('Colour', s => { const o = MH.Store.item(obj.id); if (o) o.colour = t.value; });
    });
    $('#pInspect').addEventListener('input', e => {
      if (e.target.dataset.colpick) {
        const sel = MH.Store.selected(); if (!sel.length) return;
        const o = MH.Store.item(sel[0].obj.id); if (o) { o.colour = e.target.value; requestDraw(); }
      }
    });
    $('#pInspect').addEventListener('keydown', e => {
      if (e.key === 'Enter' && e.target.dataset.num) { e.preventDefault(); commitField(e.target); }
    });
    $('#pInspect').addEventListener('click', e => {
      const sw = e.target.closest('[data-col]');
      if (sw) {
        const sel = MH.Store.selected(); if (!sel.length) return;
        MH.Store.commit('Colour', s => { const o = MH.Store.item(sel[0].obj.id); if (o) o.colour = sw.dataset.col || null; });
        return;
      }
      const fl = e.target.closest('[data-floor]');
      if (fl) {
        const sel = MH.Store.selected(); if (!sel.length) return;
        MH.Store.commit('Floor finish', s => { const o = MH.Store.room(sel[0].obj.id); if (o) o.floor = fl.dataset.floor; });
        return;
      }
      const ac = e.target.closest('[data-act]');
      if (!ac) return;
      const sel = MH.Store.selected();
      const act = ac.dataset.act;
      if (act === 'del') MH.Store.deleteSelected();
      else if (act === 'dup') MH.Store.duplicateSelected();
      else if (act === 'rot90') MH.Store.commit('Rotate', s => sel.forEach(x => { const o = MH.Store.item(x.obj.id); if (o) o.rot = ((o.rot || 0) + 90) % 360; }));
      else if (act === 'flip') MH.Store.commit('Flip', s => { const o = MH.Store.opening(sel[0].obj.id); if (o) o.flip = !o.flip; });
      else if (act === 'demo') { const w = sel[0].obj; demolishAt(MH.G.pointAlong(w, MH.G.wallLen(w) / 2)); }
      else if (act === 'alignL') { const x = Math.min(...sel.map(s => s.obj.x)); MH.Store.commit('Align', s => sel.forEach(o => { const it = MH.Store.item(o.obj.id); if (it) it.x = x; })); }
      else if (act === 'alignT') { const y = Math.min(...sel.map(s => s.obj.y)); MH.Store.commit('Align', s => sel.forEach(o => { const it = MH.Store.item(o.obj.id); if (it) it.y = y; })); }
      else if (act === 'autolayout') {
        const r = sel[0].obj;
        const add = MH.Advisor.suggestLayout(S, r.id);
        if (!add.length) { toast('No rule-based layout for a room called "' + r.name + '". Try the AI layout instead.', true); return; }
        MH.Store.commit('Suggest layout', s => {
          s.items = s.items.filter(it => { const rr = MH.G.roomAt(s.rooms, it.x, it.y); return !rr || rr.id !== r.id; });
          add.forEach(a => s.items.push(MH.Store.hydrateItem(Object.assign({ id: MH.Store.uid('i') }, a))));
        });
        toast('Layout suggested for ' + r.name + '. Ctrl+Z to undo.');
      }
    });

    /* insights → select */
    $('#pInsight').addEventListener('click', e => {
      const b = e.target.closest('[data-issue]'); if (!b) return;
      const issues = $('#pInsight')._issues || [];
      const iss = issues[Number(b.dataset.issue)];
      if (iss && iss.ids.length) {
        MH.Store.select(iss.ids.filter(id => MH.Store.findAny(id)));
        const o = MH.Store.findAny(iss.ids[0]);
        if (o) { S.view.z = Math.max(S.view.z, 0.06); focusOn(o); }
        if (window.innerWidth <= 940) $('#panelR').classList.remove('open');
      }
    });

    /* AI */
    document.addEventListener('click', e => {
      const b = e.target.closest('[data-ai]'); if (!b) return;
      const kind = b.dataset.ai;
      if (kind === 'critique') return runAI('critique');
      if (kind === 'style') return openPrompt('Style scheme', 'A brief helps: who lives here, how you cook, what you own already.', null, t => runAI('style', t));
      if (kind === 'palette') return openPrompt('Propose a palette', 'The consultant will pick floor finishes and wall colours room by room, and apply the floors to the drawing.', null, t => runAI('palette', t));
      if (kind === 'room') {
        const sel = MH.Store.selected().find(s => s.kind === 'room');
        return openPrompt('Ask about a room', 'A focused design note on one room.', sel ? sel.obj.id : null, (t, rid) => runAI('room', t, rid));
      }
      if (kind === 'layout') {
        const sel = MH.Store.selected().find(s => s.kind === 'room');
        return openPrompt('Lay out a room', 'The consultant returns real coordinates and the app places the furniture for you. Undo works.', sel ? sel.obj.id : null, (t, rid) => runAI('layout', t, rid));
      }
    });
    $('#btnAI').addEventListener('click', () => { setPane('right', 'pAI'); if (window.innerWidth <= 940) $('#panelR').classList.add('open'); });
    $('#aiSend').addEventListener('click', sendChat);
    $('#aiQ').addEventListener('keydown', e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) sendChat(); });
    $('#aiClear').addEventListener('click', () => { aiHistory = []; renderAI(); });

    function sendChat() {
      const q = $('#aiQ').value.trim(); if (!q) return;
      $('#aiQ').value = '';
      pushAI('user', q);
      runAI('chat', q);
    }

    /* prompt modal */
    let promptCb = null;
    window.openPrompt = function (title, sub, roomId, cb) {
      $('#promptTitle').textContent = title;
      $('#promptSub').textContent = sub;
      $('#promptText').value = '';
      const needRoom = /room/i.test(title);
      $('#promptRoomWrap').style.display = needRoom ? '' : 'none';
      if (needRoom) {
        $('#promptRoom').innerHTML = S.rooms.map(r => `<option value="${r.id}" ${r.id === roomId ? 'selected' : ''}>${esc(r.name)}</option>`).join('');
      }
      promptCb = cb;
      openModal('mPrompt');
    };
    $('#promptGo').addEventListener('click', () => {
      const t = $('#promptText').value.trim();
      const rid = $('#promptRoomWrap').style.display === 'none' ? null : $('#promptRoom').value;
      closeModal($('#mPrompt'));
      if (promptCb) promptCb(t, rid);
    });

    /* modals */
    $$('.scrim').forEach(sc => {
      sc.addEventListener('click', e => { if (e.target === sc || e.target.closest('[data-close]')) closeModal(sc); });
    });
    $('#btnSettings').addEventListener('click', () => openModal('mSettings'));
    $('#btnHelp').addEventListener('click', () => openModal('mHelp'));

    /* settings wiring */
    $('#setProvider').addEventListener('change', e => { MH.AI.setConfig({ provider: e.target.value, model: (MH.AI.MODELS[e.target.value][0] || {}).id }); fillSettings(); renderAI(); });
    $('#setModel').addEventListener('change', e => { MH.AI.setConfig({ model: e.target.value }); fillSettings(); renderAI(); });
    $('#setAnthropicKey').addEventListener('change', e => { MH.AI.setConfig({ anthropicKey: e.target.value.trim() }); renderAI(); });
    $('#setGeminiKey').addEventListener('change', e => { MH.AI.setConfig({ geminiKey: e.target.value.trim() }); renderAI(); });
    $('#btnTestKey').addEventListener('click', async () => {
      $('#keyResult').innerHTML = '<div class="note"><span class="spin"></span> Testing…</div>';
      try { const r = await MH.AI.testKey(); $('#keyResult').innerHTML = `<div class="note">Working. The model replied: “${esc(r.slice(0, 60))}”</div>`; }
      catch (e) { $('#keyResult').innerHTML = `<div class="note warn">${esc(e.message)}</div>`; }
    });
    $('#btnForgetKeys').addEventListener('click', () => {
      localStorage.removeItem('myhome.ai'); localStorage.removeItem('jgl.geminiKey');
      fillSettings(); renderAI(); toast('Keys removed from this browser');
    });

    const bindSetting = (sel, key, fn) => $(sel).addEventListener('change', e => {
      MH.Store.commit('Setting', s => fn(s, e.target));
    });
    bindSetting('#setUnit', 'unit', (s, t) => { s.settings.unit = t.value; MH.U.unit = t.value; });
    bindSetting('#setSnap', 'snap', (s, t) => { s.settings.snap = Number(t.value); });
    bindSetting('#setGrid', 'grid', (s, t) => { s.settings.grid = t.checked; });
    bindSetting('#setLabels', 'showLabels', (s, t) => { s.settings.showLabels = t.checked; });
    bindSetting('#setDims', 'showDims', (s, t) => { s.settings.showDims = t.checked; });
    bindSetting('#setFurn', 'showFurniture', (s, t) => { s.settings.showFurniture = t.checked; });
    bindSetting('#setClear', 'showClearance', (s, t) => { s.settings.showClearance = t.checked; });
    bindSetting('#setGhosts', 'showGhosts', (s, t) => { s.settings.showGhosts = t.checked; });
    bindSetting('#setTheme', 'theme', (s, t) => { s.settings.theme = t.checked ? 'dark' : 'light'; });
    bindSetting('#setNorth', 'north', (s, t) => { s.meta.northAngle = Number(t.value) || 0; });
    bindSetting('#setName', 'name', (s, t) => { s.name = t.value; });
    $('#setCeiling').addEventListener('change', e => {
      const v = MH.U.parse(e.target.value);
      if (isFinite(v) && v > 1500) MH.Store.commit('Ceiling', s => { s.meta.ceiling = v; });
      else toast('Could not read that height', true);
    });

    $('#unitSel').addEventListener('change', e => {
      MH.Store.commit('Units', s => { s.settings.unit = e.target.value; MH.U.unit = e.target.value; });
    });
    $('#zoomPreset').addEventListener('change', e => {
      const v = e.target.value; e.target.value = '';
      if (!v) return;
      if (v === 'fit') { MH.R2.fit(S, c2.clientWidth, c2.clientHeight); }
      else {
        const r = c2.getBoundingClientRect();
        const cx = (r.width / 2 - S.view.ox) / S.view.z, cy = (r.height / 2 - S.view.oy) / S.view.z;
        S.view.z = MH.U.pxPerMmForRatio(Number(v));
        S.view.ox = r.width / 2 - cx * S.view.z; S.view.oy = r.height / 2 - cy * S.view.z;
      }
      requestDraw();
    });

    /* underlay */
    $('#underlayFile').addEventListener('change', e => {
      const f = e.target.files && e.target.files[0]; if (!f) return;
      const rd = new FileReader();
      rd.onload = () => {
        const img = new Image();
        img.onload = () => {
          const b = MH.R2.planBounds(S);
          const w = (b.x2 - b.x1) * 1.1;
          MH.Store.commit('Add underlay', s => {
            s.underlay = { src: rd.result, x: b.x1 - (b.x2 - b.x1) * 0.05, y: b.y1 - (b.y2 - b.y1) * 0.05, w, h: w * img.naturalHeight / img.naturalWidth, opacity: 0.45, rot: 0 };
          });
          fillSettings();
          toast('Underlay loaded. Now set the scale from two points you know.');
        };
        img.src = rd.result;
      };
      rd.readAsDataURL(f);
    });
    $('#ulOpacity').addEventListener('input', e => { if (S.underlay) { S.underlay.opacity = Number(e.target.value); requestDraw(); } });
    ['ulX', 'ulY', 'ulW'].forEach(id => $('#' + id).addEventListener('change', e => {
      const v = MH.U.parse(e.target.value); if (!isFinite(v) || !S.underlay) return;
      MH.Store.commit('Underlay', s => {
        if (id === 'ulX') s.underlay.x = v;
        if (id === 'ulY') s.underlay.y = v;
        if (id === 'ulW') { const k = v / s.underlay.w; s.underlay.w = v; s.underlay.h *= k; }
      });
    }));
    $('#ulRot').addEventListener('change', e => { MH.Store.commit('Underlay', s => { if (s.underlay) s.underlay.rot = Number(e.target.value) || 0; }); });
    $('#btnCalibrate').addEventListener('click', () => {
      closeModal($('#mSettings')); calib = null; setTool('calibrate');
      toast('Click two points on the underlay whose real distance you know');
    });
    $('#btnDropUnderlay').addEventListener('click', () => { MH.Store.commit('Remove underlay', s => { s.underlay = null; }); fillSettings(); });

    /* export */
    $('#btnExport').addEventListener('click', () => {
      const blob = new Blob([MH.Store.serialise()], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = (S.name || 'myhome').replace(/\W+/g, '-').toLowerCase() + '.json';
      a.click(); URL.revokeObjectURL(a.href);
    });
    $('#btnImport').addEventListener('click', () => $('#importFile').click());
    $('#importFile').addEventListener('change', e => {
      const f = e.target.files && e.target.files[0]; if (!f) return;
      const rd = new FileReader();
      rd.onload = () => {
        try {
          const data = JSON.parse(rd.result);
          if (!data.walls || !data.rooms) throw new Error('Not a MyHome scheme');
          MH.Store.commit('Import', s => { Object.keys(s).forEach(k => { if (k !== 'selection') delete s[k]; }); Object.assign(s, data); s.selection = []; });
          MH.U.unit = S.settings.unit;
          MH.R2.fit(S, c2.clientWidth, c2.clientHeight);
          toast('Scheme imported');
        } catch (err) { toast(err.message, true); }
      };
      rd.readAsText(f);
    });
    $('#btnPNG').addEventListener('click', () => {
      const src = ui.view3 ? c3 : c2;
      const a = document.createElement('a');
      a.href = src.toDataURL('image/png');
      a.download = (S.name || 'myhome') + (ui.view3 ? '-3d' : '-plan') + '.png';
      a.click();
    });
    $('#btnPrint').addEventListener('click', () => { closeModal($('#mSettings')); setTimeout(() => window.print(), 120); });
    $('#btnReset').addEventListener('click', () => {
      if (!confirm('Discard every change and go back to the original floor plan?')) return;
      MH.Store.reset(); S = MH.Store.get(); MH.U.unit = S.settings.unit;
      MH.R2.fit(S, c2.clientWidth, c2.clientHeight);
      aiHistory = []; closeModal($('#mSettings')); toast('Reset');
    });

    /* zoom + view */
    $('#zIn').addEventListener('click', () => zoomBy(1.25));
    $('#zOut').addEventListener('click', () => zoomBy(0.8));
    $('#zFit').addEventListener('click', () => { MH.R2.fit(S, c2.clientWidth, c2.clientHeight); requestDraw(); });
    $('#btnView').addEventListener('click', () => setView3(!ui.view3));
    $('#btnUndo').addEventListener('click', () => { const l = MH.Store.undo(); if (l) toast('Undo: ' + l); });
    $('#btnRedo').addEventListener('click', () => { const l = MH.Store.redo(); if (l) toast('Redo: ' + l); });
    $('#v3yaw').addEventListener('input', e => { S.view3.yaw = Number(e.target.value); requestDraw(); });
    $('#v3cut').addEventListener('input', e => { S.view3.cut = Number(e.target.value); requestDraw(); });
    $('#v3zoom').addEventListener('input', e => { S.view3.zoom = Number(e.target.value); requestDraw(); });

    /* mobile panels */
    $('#tgL').addEventListener('click', () => { $('#panelL').classList.toggle('open'); $('#panelR').classList.remove('open'); });
    $('#tgR').addEventListener('click', () => { $('#panelR').classList.toggle('open'); $('#panelL').classList.remove('open'); });

    /* keyboard */
    document.addEventListener('keydown', e => {
      const typing = /input|textarea|select/i.test(e.target.tagName);
      if (typing) return;
      const meta = e.metaKey || e.ctrlKey;
      if (meta && e.key.toLowerCase() === 'z') { e.preventDefault(); const l = e.shiftKey ? MH.Store.redo() : MH.Store.undo(); if (l) toast((e.shiftKey ? 'Redo: ' : 'Undo: ') + l); return; }
      if (meta && e.key.toLowerCase() === 'd') { e.preventDefault(); MH.Store.duplicateSelected(); return; }
      if (meta && e.key.toLowerCase() === 'a') { e.preventDefault(); MH.Store.select(S.items.map(i => i.id)); return; }
      if (e.key === 'Delete' || e.key === 'Backspace') { e.preventDefault(); MH.Store.deleteSelected(); return; }
      if (e.key === 'Escape') { cancelPlacing(); MH.Store.select([]); setTool('select'); ui.draft = null; requestDraw(); return; }
      if (e.key.toLowerCase() === 'l') { MH.Store.commit('X-ray', st => { st.settings.xray = !st.settings.xray; }); return; }
      if (e.key === '?') { openModal('mHelp'); return; }
      if (e.key === 'Tab') { e.preventDefault(); setView3(!ui.view3); return; }
      const keys = { v: 'select', w: 'wall', x: 'demolish', d: 'door', n: 'window', r: 'room', m: 'measure' };
      if (keys[e.key.toLowerCase()]) { setTool(keys[e.key.toLowerCase()]); return; }
      if (e.key.toLowerCase() === 'f') { MH.R2.fit(S, c2.clientWidth, c2.clientHeight); requestDraw(); return; }
      if (e.key === '[' || e.key === ']') {
        const sel = MH.Store.selected().filter(s => s.kind === 'item');
        if (sel.length) MH.Store.commit('Rotate', s => sel.forEach(x => { const o = MH.Store.item(x.obj.id); if (o) o.rot = (((o.rot || 0) + (e.key === ']' ? 15 : -15)) % 360 + 360) % 360; }));
        return;
      }
      if (e.key.startsWith('Arrow')) {
        const step = e.shiftKey ? 500 : (S.settings.snap || 50);
        const dx = e.key === 'ArrowLeft' ? -step : e.key === 'ArrowRight' ? step : 0;
        const dy = e.key === 'ArrowUp' ? -step : e.key === 'ArrowDown' ? step : 0;
        const sel = MH.Store.selected();
        if (sel.length) {
          e.preventDefault();
          MH.Store.commit('Nudge', s => sel.forEach(({ kind, obj }) => {
            const o = MH.Store.findAny(obj.id); if (!o) return;
            if (kind === 'item') { o.x += dx; o.y += dy; }
            else if (kind === 'room' || kind === 'wall') { o.x1 += dx; o.y1 += dy; o.x2 += dx; o.y2 += dy; }
          }));
        }
      }
    });

    /* Keep the drawing sensible across a rotation or a window resize: hold the
       centre point still for small changes, refit for large ones. */
    let lastSize = null;
    const onResize = () => {
      const w = c2.clientWidth, h = c2.clientHeight;
      if (!w || !h) return;
      if (lastSize) {
        const dw = Math.abs(w - lastSize.w) / lastSize.w;
        const dh = Math.abs(h - lastSize.h) / lastSize.h;
        if (dw > 0.3 || dh > 0.3) {
          MH.R2.fit(S, w, h);
        } else {
          S.view.ox += (w - lastSize.w) / 2;
          S.view.oy += (h - lastSize.h) / 2;
        }
      }
      lastSize = { w, h };
      requestDraw();
    };
    window.addEventListener('resize', onResize);
    if (window.ResizeObserver) new ResizeObserver(onResize).observe(stage);
  }

  function zoomBy(f) {
    const r = c2.getBoundingClientRect();
    const cx = r.width / 2, cy = r.height / 2;
    const wx = (cx - S.view.ox) / S.view.z, wy = (cy - S.view.oy) / S.view.z;
    S.view.z = Math.max(0.006, Math.min(1.2, S.view.z * f));
    S.view.ox = cx - wx * S.view.z; S.view.oy = cy - wy * S.view.z;
    requestDraw();
  }
  function focusOn(o) {
    if (!o) return;
    const cx = o.x !== undefined ? o.x : (o.x1 + o.x2) / 2;
    const cy = o.y !== undefined ? o.y : (o.y1 + o.y2) / 2;
    const r = c2.getBoundingClientRect();
    S.view.ox = r.width / 2 - cx * S.view.z;
    S.view.oy = r.height / 2 - cy * S.view.z;
    requestDraw();
  }

  /* ---------------------------------------------------------------- INIT */
  function init() {
    c2 = document.getElementById('c2');
    c3 = document.getElementById('c3');
    stage = document.getElementById('stage');
    S = MH.Store.init();
    MH.Store.subscribe(s => { S = s; requestDraw(); renderPanels(); });
    MH.R2.fit(S, c2.clientWidth || 900, c2.clientHeight || 600);
    wire();
    renderPanels();
    setTool('select');
    requestDraw();
    if (!localStorage.getItem('myhome.tour')) setTimeout(startTour, 500);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

  return { requestDraw, toast, get state() { return S; }, get ui() { return ui; }, setTool, openModal, startTour };
})();
