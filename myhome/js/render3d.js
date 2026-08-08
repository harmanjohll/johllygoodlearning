/* =============================================================================
   MyHome — axonometric "dollhouse" view
   -----------------------------------------------------------------------------
   No WebGL, no library. A painter's-algorithm axonometric projection over the
   same millimetre model the plan uses, with the walls cut at a viewing height
   so you can see in. Rotate in 90 degree steps to look from any corner.
   ========================================================================== */
window.MH = window.MH || {};

MH.R3 = (function () {
  const DEG = Math.PI / 180;

  /* Rotate the plan about its vertical axis by `yaw`, then tilt the camera
     down by `pitch`. Height maps straight up the screen. Depth is the rotated
     y, which is what the painter's-algorithm sort uses: small = far away. */
  function makeProjector(view, centre) {
    const yaw = (view.yaw === undefined ? 30 : view.yaw) * DEG;
    const pitch = (view.pitch === undefined ? 56 : view.pitch) * DEG;
    const cy = Math.cos(yaw), sy = Math.sin(yaw);
    const kv = Math.sin(pitch);             // how much the floor plane squashes
    const kh = Math.cos(pitch);             // how tall a wall reads
    return function (x, y, h) {
      const dx = x - centre.x, dy = y - centre.y;
      const rx = dx * cy - dy * sy;
      const ry = dx * sy + dy * cy;
      return { x: rx, y: ry * kv - (h || 0) * kh, depth: ry };
    };
  }

  function shade(hex, pct) { return MH.R2.shade(hex, pct); }
  function mat(id) { return MH.MATERIALS.find(m => m.id === id); }

  function quad(g, pts, fillCol, strokeCol, lw) {
    g.beginPath();
    pts.forEach((p, i) => i ? g.lineTo(p.x, p.y) : g.moveTo(p.x, p.y));
    g.closePath();
    if (fillCol) { g.fillStyle = fillCol; g.fill(); }
    if (strokeCol) { g.strokeStyle = strokeCol; g.lineWidth = lw || 1; g.stroke(); }
  }

  /* An extruded rectangular prism, correctly ordered for a convex solid. */
  function prism(list, P, cx, cy, w, d, rot, h0, h1, top, side, edge) {
    const c = MH.G.corners(cx, cy, w, d, rot);
    const b = c.map(pt => P(pt.x, pt.y, h0));
    const t = c.map(pt => P(pt.x, pt.y, h1));
    const faces = [];
    for (let i = 0; i < 4; i++) {
      const j = (i + 1) % 4;
      const dep = (b[i].depth + b[j].depth) / 2;
      /* Face normal in world terms, so the same wall direction always catches
         the same amount of light however the item is rotated. */
      const nx = c[j].y - c[i].y, ny = c[i].x - c[j].x;
      const l = Math.hypot(nx, ny) || 1;
      const lambert = (nx / l) * -0.55 + (ny / l) * -0.83;   // light from up-left
      faces.push({ depth: dep, pts: [b[i], b[j], t[j], t[i]], fill: shade(side, -14 + lambert * 10), stroke: edge });
    }
    faces.sort((a, b2) => a.depth - b2.depth);
    const depth = (b[0].depth + b[1].depth + b[2].depth + b[3].depth) / 4;
    list.push({ depth, draw: g => { faces.forEach(f => quad(g, f.pts, f.fill, f.stroke, 0.8)); quad(g, t, top, edge, 0.9); } });
  }

  function itemTone(it, p) {
    const c = MH.Store.catalogById(it.catId) || {};
    if (it.colour) return it.colour;
    switch (c.cat) {
      case 'living':   return it.glyph === 'rug' || it.glyph === 'rugRound' ? p.accent : p.soft;
      case 'dining':   return p.wood;
      case 'kitchen':  return '#E5E1D9';
      case 'bedroom':  return it.glyph === 'bed' ? '#F5F1EA' : p.wood;
      case 'storage':  return p.wood;
      case 'bathroom': return '#F4F6F7';
      case 'utility':  return '#D9DDDF';
      case 'media':    return it.glyph === 'tv' ? '#1B1D20' : (it.glyph === 'piano' || it.glyph === 'grandPiano' ? '#22201E' : p.wood);
      case 'work':     return p.wood;
      case 'green':    return '#6E8A62';
      case 'services': return '#DDE2E4';
      default:         return p.wood;
    }
  }

  function draw(cv, state, opts) {
    opts = opts || {};
    const g = cv.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const cssW = cv.clientWidth, cssH = cv.clientHeight;
    if (cv.width !== Math.round(cssW * dpr) || cv.height !== Math.round(cssH * dpr)) {
      cv.width = Math.round(cssW * dpr); cv.height = Math.round(cssH * dpr);
    }
    g.setTransform(dpr, 0, 0, dpr, 0, 0);

    const p = MH.R2.palette(state);
    const dark = state.settings.theme === 'dark';
    const grad = g.createLinearGradient(0, 0, 0, cssH);
    if (dark) { grad.addColorStop(0, '#1A1C21'); grad.addColorStop(1, '#0E0F12'); }
    else { grad.addColorStop(0, '#EFEDE7'); grad.addColorStop(1, '#DAD6CE'); }
    g.fillStyle = grad; g.fillRect(0, 0, cssW, cssH);

    const v3 = state.view3 || (state.view3 = { yaw: 30, pitch: 56, zoom: 1, cut: 1200, ox: 0, oy: 0 });
    const b = MH.R2.planBounds(state);
    const centre = { x: (b.x1 + b.x2) / 2, y: (b.y1 + b.y2) / 2 };
    const P0 = makeProjector(v3, centre);

    /* auto-fit */
    const probe = [];
    [[b.x1, b.y1], [b.x2, b.y1], [b.x2, b.y2], [b.x1, b.y2]].forEach(([x, y]) => {
      probe.push(P0(x, y, 0)); probe.push(P0(x, y, state.meta.ceiling || 2600));
    });
    let mnx = Infinity, mny = Infinity, mxx = -Infinity, mxy = -Infinity;
    probe.forEach(q => { mnx = Math.min(mnx, q.x); mny = Math.min(mny, q.y); mxx = Math.max(mxx, q.x); mxy = Math.max(mxy, q.y); });
    const s = Math.min((cssW - 80) / (mxx - mnx || 1), (cssH - 100) / (mxy - mny || 1)) * (v3.zoom || 1);

    g.save();
    g.translate(cssW / 2 + (v3.ox || 0), cssH / 2 + (v3.oy || 0) + 20);
    g.scale(s, s);
    g.translate(-(mnx + mxx) / 2, -(mny + mxy) / 2);
    g.lineJoin = 'round';

    const P = P0;
    const list = [];
    const cut = v3.cut === undefined ? 1100 : v3.cut;
    const edge = dark ? 'rgba(0,0,0,.45)' : 'rgba(60,55,48,.5)';

    /* ground shadow */
    (function () {
      const c = [P(b.x1 - 400, b.y1 - 400, 0), P(b.x2 + 400, b.y1 - 400, 0), P(b.x2 + 400, b.y2 + 400, 0), P(b.x1 - 400, b.y2 + 400, 0)];
      list.push({ depth: -1e9, draw: gg => quad(gg, c, dark ? 'rgba(0,0,0,.35)' : 'rgba(120,110,95,.28)', null) });
    })();

    /* floors */
    state.rooms.forEach(r => {
      const m = mat(r.floor);
      const base = m ? m.hex : p.floor;
      const c = [P(r.x1, r.y1, 0), P(r.x2, r.y1, 0), P(r.x2, r.y2, 0), P(r.x1, r.y2, 0)];
      const dep = (c[0].depth + c[2].depth) / 2;
      list.push({
        depth: dep - 1e6, draw: gg => {
          quad(gg, c, dark ? shade(base, -34) : base, dark ? 'rgba(255,255,255,.05)' : 'rgba(0,0,0,.07)', 0.6);
        }
      });
    });

    /* walls */
    state.walls.forEach(w => {
      if (w.demolished) return;
      const T = MH.Store.wallType(w);
      const t = MH.Store.thickness(w);
      const L = MH.G.wallLen(w);
      const vv = MH.G.wallVec(w);
      const ow = state.openings.filter(o => o.wallId === w.id).sort((a, b2) => a.pos - b2.pos);
      const wallH = Math.min(cut, state.meta.ceiling || 2600);
      const face = T.id === 'shelter' ? '#3C4A55' : (T.hackable ? shade(p.wall, -6) : shade(p.wall, -14));
      const topC = T.hackable ? shade(p.wall, -22) : (T.id === 'shelter' ? '#2A353E' : '#4A443C');

      const cuts = [];
      ow.forEach(o => {
        if (o.type === 'window') return;                 // windows keep a sill below the cut
        cuts.push({ a: Math.max(0, o.pos - o.w / 2), b: Math.min(L, o.pos + o.w / 2) });
      });
      cuts.sort((a, b2) => a.a - b2.a);
      let cursor = 0; const runs = [];
      cuts.forEach(c => { if (c.a > cursor) runs.push([cursor, c.a]); cursor = Math.max(cursor, c.b); });
      if (cursor < L) runs.push([cursor, L]);

      runs.forEach(([a, bb]) => {
        const mid = (a + bb) / 2, len = bb - a;
        if (len <= 1) return;
        const c = MH.G.pointAlong(w, mid);
        const rot = Math.atan2(vv.dy, vv.dx) / DEG;
        prism(list, P, c.x, c.y, len, t, rot, 0, wallH, topC, face, edge);
      });

      /* window glass sitting in its own hole */
      ow.filter(o => o.type === 'window').forEach(o => {
        const c = MH.G.pointAlong(w, o.pos);
        const rot = Math.atan2(vv.dy, vv.dx) / DEG;
        const sill = o.sill === undefined ? 900 : o.sill;
        if (sill > 0) prism(list, P, c.x, c.y, o.w, t, rot, 0, Math.min(sill, wallH), topC, face, edge);
        if (sill < wallH) {
          const gl = MH.G.corners(c.x, c.y, o.w, t * 0.3, rot);
          const lo = gl.map(pt => P(pt.x, pt.y, sill)), hi = gl.map(pt => P(pt.x, pt.y, wallH));
          list.push({
            depth: lo[0].depth + 40, draw: gg => {
              quad(gg, [lo[0], lo[1], hi[1], hi[0]], 'rgba(150,195,215,.5)', 'rgba(90,130,150,.7)', 0.8);
            }
          });
        }
      });
    });

    /* items */
    state.items.forEach(it => {
      if (it.hidden) return;
      const tone = itemTone(it, p);
      const h = it.h || 700;
      if (it.glyph === 'rug' || it.glyph === 'rugRound') {
        const c = MH.G.corners(it.x, it.y, it.w, it.d, it.rot).map(pt => P(pt.x, pt.y, 6));
        list.push({ depth: (c[0].depth + c[2].depth) / 2 - 5e5, draw: gg => quad(gg, c, MH.R2.tint(tone, 0.55), null) });
        return;
      }
      if (it.glyph === 'tv') {
        prism(list, P, it.x, it.y, it.w, Math.max(it.d, 80), it.rot, 600, 600 + h, '#101215', '#1B1D20', edge);
        return;
      }
      if (it.glyph === 'plant') {
        const c = MH.G.corners(it.x, it.y, it.w * 0.45, it.d * 0.45, it.rot);
        prism(list, P, it.x, it.y, it.w * 0.45, it.d * 0.45, it.rot, 0, h * 0.3, shade('#8A6E52', 8), '#8A6E52', edge);
        const canopy = MH.G.corners(it.x, it.y, it.w, it.d, it.rot).map(pt => P(pt.x, pt.y, h));
        list.push({ depth: canopy[0].depth + 1e3, draw: gg => quad(gg, canopy, 'rgba(96,132,88,.85)', 'rgba(50,80,50,.6)', 0.8) });
        return;
      }
      if (it.glyph === 'bed') {
        prism(list, P, it.x, it.y, it.w, it.d, it.rot, 0, 320, shade(p.wood, -6), p.wood, edge);
        prism(list, P, it.x, it.y, it.w - 60, it.d - 60, it.rot, 320, 620, '#F7F4EE', '#E7E2D8', edge);
        const a = (it.rot || 0) * DEG;
        const px = it.x + Math.sin(a) * (it.d / 2 - 260), py = it.y - Math.cos(a) * (it.d / 2 - 260);
        prism(list, P, px, py, it.w - 220, 380, it.rot, 620, 760, '#FFFFFF', '#F0ECE4', edge);
        prism(list, P, it.x + Math.sin(a) * (it.d / 2 + 30), it.y - Math.cos(a) * (it.d / 2 + 30), it.w, 90, it.rot, 0, 1050, shade(p.wood, -14), shade(p.wood, -8), edge);
        return;
      }
      if (it.glyph === 'sofa' || it.glyph === 'sofaL' || it.glyph === 'sofaU' || it.glyph === 'armchair') {
        prism(list, P, it.x, it.y, it.w, it.d, it.rot, 0, 420, shade(tone, 6), tone, edge);
        const a = (it.rot || 0) * DEG;
        const bx = it.x - Math.sin(a) * (it.d / 2 - 110), by = it.y + Math.cos(a) * (it.d / 2 - 110);
        prism(list, P, bx, by, it.w, 220, it.rot, 0, h, shade(tone, -4), shade(tone, -8), edge);
        return;
      }
      if (it.glyph === 'tableRect' || it.glyph === 'tableRound' || it.glyph === 'desk' || it.glyph === 'deskL' || it.glyph === 'coffeeTable' || it.glyph === 'coffeeRound') {
        prism(list, P, it.x, it.y, it.w * 0.82, it.d * 0.82, it.rot, 0, h - 40, shade(tone, -18), shade(tone, -22), edge);
        prism(list, P, it.x, it.y, it.w, it.d, it.rot, h - 40, h, shade(tone, 8), tone, edge);
        return;
      }
      prism(list, P, it.x, it.y, it.w, it.d, it.rot, it.glyph === 'fcu' ? 2000 : 0, (it.glyph === 'fcu' ? 2000 : 0) + h, shade(tone, 8), tone, edge);
    });

    list.sort((a, b2) => a.depth - b2.depth);
    list.forEach(o => o.draw(g));
    g.restore();

    /* HUD */
    g.fillStyle = dark ? 'rgba(220,216,208,.75)' : 'rgba(58,55,51,.7)';
    g.font = '500 11px "IBM Plex Mono", ui-monospace, monospace';
    g.textAlign = 'left';
    g.fillText('yaw ' + Math.round(v3.yaw) + '°   cut ' + MH.U.dim(cut) + '   ' + (p.style ? p.style.name : ''), 16, cssH - 16);
  }

  return { draw };
})();
