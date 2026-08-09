/* =============================================================================
   MyHome — 2D plan renderer
   -----------------------------------------------------------------------------
   Everything is drawn in world millimetres; the canvas transform does the
   scaling. Line weights are therefore divided by the zoom so that a 1 px
   hairline stays a 1 px hairline at every scale, exactly as it would on a
   printed drawing.
   ========================================================================== */
window.MH = window.MH || {};

MH.R2 = (function () {
  /* Style-driven palette, with a neutral fallback. */
  function palette(state) {
    const st = (MH.STYLES.find(s => s.id === state.style)) || MH.STYLES[0];
    const o = state.paletteOverride || {};
    return {
      style: st,
      floor: st.floor,
      wall: o.wall || st.wall,
      accent: o.accent || st.accent,
      wood: o.wood || st.wood,
      metal: o.metal || st.metal,
      soft: o.soft || st.palette[Math.min(2, st.palette.length - 1)].hex,
      ink: '#232320'
    };
  }

  function mat(id) { return MH.MATERIALS.find(m => m.id === id); }

  /* ------------------------------------------------------------- GLYPHS --- */
  /* Every glyph draws with the item centred on 0,0, `w` across, `d` deep,
     facing "up" (-y). Units are millimetres. */
  const G = {};
  const R = (g, x, y, w, h, r) => { g.beginPath(); g.roundRect ? g.roundRect(x, y, w, h, r || 0) : g.rect(x, y, w, h); };

  function stroke(g, col, px, z) { g.strokeStyle = col; g.lineWidth = px / z; g.stroke(); }
  function fill(g, col) { g.fillStyle = col; g.fill(); }

  G.box = (g, it, p, z) => {
    R(g, -it.w / 2, -it.d / 2, it.w, it.d, 20);
    fill(g, it.colour || p.wood); stroke(g, p.ink, 1.1, z);
  };
  G.zoneBox = (g, it, p, z) => {
    R(g, -it.w / 2, -it.d / 2, it.w, it.d, 20);
    g.fillStyle = 'rgba(140,140,130,.13)'; g.fill();
    g.setLineDash([80 / z * z, 60]); stroke(g, p.ink, 1, z); g.setLineDash([]);
  };
  G.sofa = (g, it, p, z) => {
    const w = it.w, d = it.d, arm = Math.min(180, w * 0.12), back = Math.min(200, d * 0.24);
    R(g, -w / 2, -d / 2, w, d, 40); fill(g, it.colour || p.soft); stroke(g, p.ink, 1.1, z);
    R(g, -w / 2, -d / 2, w, back, 30); fill(g, shade(it.colour || p.soft, -12));       // back
    R(g, -w / 2, -d / 2 + back, arm, d - back, 24); fill(g, shade(it.colour || p.soft, -8));
    R(g, w / 2 - arm, -d / 2 + back, arm, d - back, 24); fill(g, shade(it.colour || p.soft, -8));
    const seats = Math.max(1, Math.round((w - arm * 2) / 620));
    const sw = (w - arm * 2) / seats;
    g.beginPath();
    for (let i = 1; i < seats; i++) { const x = -w / 2 + arm + sw * i; g.moveTo(x, -d / 2 + back); g.lineTo(x, d / 2); }
    stroke(g, 'rgba(0,0,0,.28)', 1, z);
    R(g, -w / 2, -d / 2, w, d, 40); stroke(g, p.ink, 1.2, z);
  };
  G.sofaL = (g, it, p, z) => {
    const w = it.w, d = it.d, seat = Math.min(900, d * 0.55);
    g.beginPath(); g.moveTo(-w / 2, -d / 2); g.lineTo(w / 2, -d / 2); g.lineTo(w / 2, -d / 2 + seat);
    g.lineTo(-w / 2 + seat, -d / 2 + seat); g.lineTo(-w / 2 + seat, d / 2); g.lineTo(-w / 2, d / 2); g.closePath();
    fill(g, it.colour || p.soft); stroke(g, p.ink, 1.2, z);
    g.beginPath(); g.moveTo(-w / 2, -d / 2 + 180); g.lineTo(w / 2 - 180, -d / 2 + 180);
    g.lineTo(w / 2 - 180, -d / 2 + seat); stroke(g, 'rgba(0,0,0,.25)', 1, z);
  };
  G.sofaU = (g, it, p, z) => {
    const w = it.w, d = it.d, s = Math.min(900, w * 0.32);
    g.beginPath(); g.moveTo(-w / 2, -d / 2); g.lineTo(w / 2, -d / 2); g.lineTo(w / 2, d / 2);
    g.lineTo(w / 2 - s, d / 2); g.lineTo(w / 2 - s, -d / 2 + s); g.lineTo(-w / 2 + s, -d / 2 + s);
    g.lineTo(-w / 2 + s, d / 2); g.lineTo(-w / 2, d / 2); g.closePath();
    fill(g, it.colour || p.soft); stroke(g, p.ink, 1.2, z);
  };
  G.armchair = (g, it, p, z) => {
    const w = it.w, d = it.d;
    R(g, -w / 2, -d / 2, w, d, 60); fill(g, it.colour || p.soft); stroke(g, p.ink, 1.1, z);
    R(g, -w / 2, -d / 2, w, Math.min(170, d * 0.28), 40); fill(g, shade(it.colour || p.soft, -12));
    R(g, -w / 2 + 60, -d / 2 + 180, w - 120, d - 240, 40); stroke(g, 'rgba(0,0,0,.22)', 1, z);
  };
  G.bed = (g, it, p, z) => {
    const w = it.w, d = it.d;
    R(g, -w / 2, -d / 2, w, d, 30); fill(g, '#F7F4EE'); stroke(g, p.ink, 1.2, z);
    R(g, -w / 2, -d / 2, w, 120, 20); fill(g, shade(p.wood, -10));                    // headboard
    const pw = Math.min(680, (w - 180) / (w > 1300 ? 2 : 1)), py = -d / 2 + 190;
    if (w > 1300) {
      R(g, -w / 2 + 90, py, pw, 340, 40); fill(g, '#FFFFFF'); stroke(g, 'rgba(0,0,0,.3)', 1, z);
      R(g, w / 2 - 90 - pw, py, pw, 340, 40); fill(g, '#FFFFFF'); stroke(g, 'rgba(0,0,0,.3)', 1, z);
    } else {
      R(g, -pw / 2, py, pw, 320, 40); fill(g, '#FFFFFF'); stroke(g, 'rgba(0,0,0,.3)', 1, z);
    }
    g.beginPath(); g.moveTo(-w / 2, -d / 2 + 700); g.lineTo(w / 2, -d / 2 + 700);
    stroke(g, 'rgba(0,0,0,.25)', 1, z);
    R(g, -w / 2, d / 2 - 420, w, 420, 20); g.fillStyle = 'rgba(0,0,0,.05)'; g.fill();
  };
  G.bunk = (g, it, p, z) => {
    G.bed(g, it, p, z);
    R(g, -it.w / 2 + 60, -it.d / 2 + 60, it.w - 120, it.d - 120, 20); g.setLineDash([120, 90]);
    stroke(g, p.ink, 1, z); g.setLineDash([]);
  };
  G.tableRect = (g, it, p, z) => {
    R(g, -it.w / 2, -it.d / 2, it.w, it.d, 30); fill(g, it.colour || p.wood); stroke(g, p.ink, 1.3, z);
    chairsRect(g, it, p, z);
  };
  G.tableRound = (g, it, p, z) => {
    g.beginPath(); g.ellipse(0, 0, it.w / 2, it.d / 2, 0, 0, Math.PI * 2);
    fill(g, it.colour || p.wood); stroke(g, p.ink, 1.3, z);
    const n = it.seats || 6, rr = it.w / 2 + 330;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 - Math.PI / 2;
      chairAt(g, Math.cos(a) * rr, Math.sin(a) * rr, a * 180 / Math.PI + 90, p, z);
    }
  };
  function chairsRect(g, it, p, z) {
    const n = it.seats || 0; if (!n) return;
    const perSide = Math.max(1, Math.floor(n / 2) - (n % 2 === 0 && n >= 6 ? 1 : 0));
    const long = Math.max(1, Math.round((n - (n >= 6 ? 2 : 0)) / 2));
    const gap = it.w / (long + 1);
    for (let i = 1; i <= long; i++) {
      chairAt(g, -it.w / 2 + gap * i, -it.d / 2 - 320, 180, p, z);
      chairAt(g, -it.w / 2 + gap * i, it.d / 2 + 320, 0, p, z);
    }
    if (n >= 6) { chairAt(g, -it.w / 2 - 320, 0, 90, p, z); chairAt(g, it.w / 2 + 320, 0, -90, p, z); }
  }
  function chairAt(g, x, y, rotDeg, p, z) {
    g.save(); g.translate(x, y); g.rotate(rotDeg * Math.PI / 180);
    R(g, -215, -230, 430, 460, 60); fill(g, shade(p.wood, 14)); stroke(g, 'rgba(0,0,0,.42)', 1, z);
    R(g, -215, 150, 430, 80, 30); fill(g, 'rgba(0,0,0,.16)');
    g.restore();
  }
  G.chair = (g, it, p, z) => {
    R(g, -it.w / 2, -it.d / 2, it.w, it.d, 60); fill(g, shade(p.wood, 14)); stroke(g, p.ink, 1.1, z);
    R(g, -it.w / 2, it.d / 2 - 90, it.w, 90, 30); fill(g, 'rgba(0,0,0,.18)');
  };
  G.coffeeTable = (g, it, p, z) => { R(g, -it.w / 2, -it.d / 2, it.w, it.d, 40); fill(g, it.colour || p.wood); stroke(g, p.ink, 1.2, z); };
  G.coffeeRound = (g, it, p, z) => {
    g.beginPath(); g.ellipse(0, 0, it.w / 2, it.d / 2, 0, 0, Math.PI * 2);
    fill(g, it.colour || p.wood); stroke(g, p.ink, 1.2, z);
  };
  G.sideTable = G.coffeeTable;
  G.sideboard = (g, it, p, z) => {
    R(g, -it.w / 2, -it.d / 2, it.w, it.d, 16); fill(g, it.colour || p.wood); stroke(g, p.ink, 1.2, z);
    const n = Math.max(2, Math.round(it.w / 500));
    g.beginPath(); for (let i = 1; i < n; i++) { const x = -it.w / 2 + it.w / n * i; g.moveTo(x, -it.d / 2); g.lineTo(x, it.d / 2); }
    stroke(g, 'rgba(0,0,0,.3)', 1, z);
  };
  G.desk = (g, it, p, z) => {
    R(g, -it.w / 2, -it.d / 2, it.w, it.d, 16); fill(g, it.colour || p.wood); stroke(g, p.ink, 1.2, z);
    R(g, -260, -it.d / 2 + 60, 520, 300, 12); stroke(g, 'rgba(0,0,0,.3)', 1, z);   // screen footprint
  };
  G.deskL = (g, it, p, z) => {
    const w = it.w, d = it.d, t = 700;
    g.beginPath(); g.moveTo(-w / 2, -d / 2); g.lineTo(w / 2, -d / 2); g.lineTo(w / 2, -d / 2 + t);
    g.lineTo(-w / 2 + t, -d / 2 + t); g.lineTo(-w / 2 + t, d / 2); g.lineTo(-w / 2, d / 2); g.closePath();
    fill(g, it.colour || p.wood); stroke(g, p.ink, 1.2, z);
  };
  G.wardrobe = (g, it, p, z) => {
    R(g, -it.w / 2, -it.d / 2, it.w, it.d, 8); fill(g, it.colour || shade(p.wood, 10)); stroke(g, p.ink, 1.2, z);
    const n = Math.max(2, Math.round(it.w / 500)), dw = it.w / n;
    g.beginPath();
    for (let i = 1; i < n; i++) { const x = -it.w / 2 + dw * i; g.moveTo(x, -it.d / 2); g.lineTo(x, it.d / 2); }
    stroke(g, 'rgba(0,0,0,.35)', 1, z);
    g.beginPath();
    for (let i = 0; i < n; i++) {
      const x0 = -it.w / 2 + dw * i, dir = i % 2 ? -1 : 1;
      const hx = dir > 0 ? x0 : x0 + dw;
      g.moveTo(hx, it.d / 2); g.lineTo(hx + dir * dw, it.d / 2 + dw * 0.55);
      g.arc(hx, it.d / 2, dw, dir > 0 ? 0 : Math.PI, dir > 0 ? Math.PI * 0.5 : Math.PI * 0.5, dir < 0);
    }
    g.setLineDash([60, 60]); stroke(g, 'rgba(0,0,0,.3)', 1, z); g.setLineDash([]);
  };
  G.wardrobeSlide = (g, it, p, z) => {
    R(g, -it.w / 2, -it.d / 2, it.w, it.d, 8); fill(g, it.colour || shade(p.wood, 10)); stroke(g, p.ink, 1.2, z);
    const n = 2, dw = it.w / n;
    g.beginPath();
    for (let i = 0; i < n; i++) {
      const y = it.d / 2 - 60 - i * 55;
      g.moveTo(-it.w / 2 + (i ? dw : 0), y); g.lineTo(-it.w / 2 + dw + (i ? dw : 0), y);
    }
    stroke(g, 'rgba(0,0,0,.45)', 2, z);
  };
  G.bookshelf = (g, it, p, z) => {
    R(g, -it.w / 2, -it.d / 2, it.w, it.d, 6); fill(g, it.colour || shade(p.wood, -6)); stroke(g, p.ink, 1.2, z);
    const n = Math.max(2, Math.round(it.w / 800));
    g.beginPath(); for (let i = 1; i < n; i++) { const x = -it.w / 2 + it.w / n * i; g.moveTo(x, -it.d / 2); g.lineTo(x, it.d / 2); }
    stroke(g, 'rgba(0,0,0,.3)', 1, z);
    g.beginPath();
    for (let x = -it.w / 2 + 40; x < it.w / 2 - 40; x += 55) { g.moveTo(x, -it.d / 2 + 40); g.lineTo(x, it.d / 2 - 40); }
    stroke(g, 'rgba(0,0,0,.16)', 1, z);
  };
  G.tallUnit = (g, it, p, z) => {
    R(g, -it.w / 2, -it.d / 2, it.w, it.d, 6); fill(g, it.colour || shade(p.wood, 6)); stroke(g, p.ink, 1.3, z);
    g.beginPath(); g.moveTo(-it.w / 2, -it.d / 2); g.lineTo(it.w / 2, it.d / 2);
    g.moveTo(it.w / 2, -it.d / 2); g.lineTo(-it.w / 2, it.d / 2);
    stroke(g, 'rgba(0,0,0,.22)', 1, z);
  };
  G.counter = (g, it, p, z) => {
    R(g, -it.w / 2, -it.d / 2, it.w, it.d, 6); fill(g, it.colour || '#E8E4DC'); stroke(g, p.ink, 1.3, z);
    g.beginPath(); g.moveTo(-it.w / 2, it.d / 2 - 60); g.lineTo(it.w / 2, it.d / 2 - 60); stroke(g, 'rgba(0,0,0,.3)', 1, z);
    const n = Math.max(1, Math.round(it.w / 600));
    g.beginPath(); for (let i = 1; i < n; i++) { const x = -it.w / 2 + it.w / n * i; g.moveTo(x, -it.d / 2); g.lineTo(x, it.d / 2 - 60); }
    stroke(g, 'rgba(0,0,0,.18)', 1, z);
  };
  G.island = (g, it, p, z) => {
    R(g, -it.w / 2, -it.d / 2, it.w, it.d, 20); fill(g, it.colour || '#EDEAE4'); stroke(g, p.ink, 1.5, z);
    R(g, -it.w / 2 + 70, -it.d / 2 + 70, it.w - 140, it.d - 140, 12); stroke(g, 'rgba(0,0,0,.24)', 1, z);
  };
  G.islandBar = (g, it, p, z) => {
    G.island(g, it, p, z);
    g.beginPath(); g.moveTo(-it.w / 2, it.d / 2 - 300); g.lineTo(it.w / 2, it.d / 2 - 300);
    g.setLineDash([100, 80]); stroke(g, 'rgba(0,0,0,.45)', 1.2, z); g.setLineDash([]);
    const n = Math.max(2, Math.floor(it.w / 600));
    for (let i = 0; i < n; i++) {
      const x = -it.w / 2 + it.w / n * (i + 0.5);
      g.beginPath(); g.ellipse(x, it.d / 2 + 320, 190, 190, 0, 0, Math.PI * 2);
      fill(g, shade(p.wood, 16)); stroke(g, 'rgba(0,0,0,.4)', 1, z);
    }
  };
  G.fridge = (g, it, p, z) => {
    R(g, -it.w / 2, -it.d / 2, it.w, it.d, 8); fill(g, it.colour || '#D9DDDF'); stroke(g, p.ink, 1.3, z);
    g.beginPath(); g.moveTo(0, -it.d / 2); g.lineTo(0, it.d / 2); stroke(g, 'rgba(0,0,0,.35)', 1.2, z);
    g.beginPath(); g.moveTo(-it.w / 2 + 60, it.d / 2 - 50); g.lineTo(it.w / 2 - 60, it.d / 2 - 50);
    stroke(g, 'rgba(0,0,0,.3)', 2, z);
  };
  G.appliance = (g, it, p, z) => {
    R(g, -it.w / 2, -it.d / 2, it.w, it.d, 8); fill(g, it.colour || '#D9DDDF'); stroke(g, p.ink, 1.3, z);
    g.beginPath(); g.ellipse(0, 40, Math.min(it.w, it.d) * 0.28, Math.min(it.w, it.d) * 0.28, 0, 0, Math.PI * 2);
    stroke(g, 'rgba(0,0,0,.35)', 1.2, z);
  };
  G.oven = G.appliance;
  G.hob = (g, it, p, z) => {
    R(g, -it.w / 2, -it.d / 2, it.w, it.d, 20); fill(g, it.colour || '#2E2E30'); stroke(g, p.ink, 1.2, z);
    const rx = it.w / 4, ry = it.d / 4;
    [[-rx, -ry], [rx, -ry], [-rx, ry], [rx, ry]].forEach(([x, y]) => {
      g.beginPath(); g.ellipse(x, y, Math.min(rx, ry) * 0.66, Math.min(rx, ry) * 0.66, 0, 0, Math.PI * 2);
      stroke(g, 'rgba(255,255,255,.55)', 1.4, z);
    });
  };
  G.hood = (g, it, p, z) => {
    R(g, -it.w / 2, -it.d / 2, it.w, it.d, 20);
    g.fillStyle = 'rgba(120,130,140,.22)'; g.fill();
    g.setLineDash([90, 70]); stroke(g, p.metal, 1.4, z); g.setLineDash([]);
  };
  G.sink = (g, it, p, z) => {
    R(g, -it.w / 2, -it.d / 2, it.w, it.d, 24); fill(g, '#CFD6D9'); stroke(g, p.ink, 1.2, z);
    R(g, -it.w / 2 + 60, -it.d / 2 + 70, it.w - 120, it.d - 140, 30); stroke(g, 'rgba(0,0,0,.4)', 1.2, z);
    g.beginPath(); g.ellipse(0, 0, 40, 40, 0, 0, Math.PI * 2); stroke(g, 'rgba(0,0,0,.5)', 1, z);
    g.beginPath(); g.ellipse(0, -it.d / 2 + 30, 45, 45, 0, 0, Math.PI * 2); fill(g, p.metal);
  };
  G.sinkDouble = (g, it, p, z) => {
    R(g, -it.w / 2, -it.d / 2, it.w, it.d, 24); fill(g, '#CFD6D9'); stroke(g, p.ink, 1.2, z);
    R(g, -it.w / 2 + 60, -it.d / 2 + 70, it.w / 2 - 90, it.d - 140, 24); stroke(g, 'rgba(0,0,0,.4)', 1.2, z);
    R(g, 30, -it.d / 2 + 70, it.w / 2 - 90, it.d - 140, 24); stroke(g, 'rgba(0,0,0,.4)', 1.2, z);
    g.beginPath(); g.ellipse(0, -it.d / 2 + 30, 45, 45, 0, 0, Math.PI * 2); fill(g, p.metal);
  };
  G.wc = (g, it, p, z) => {
    const w = it.w, d = it.d;
    R(g, -w / 2, -d / 2, w, d * 0.3, 10); fill(g, '#FFFFFF'); stroke(g, p.ink, 1.2, z);   // cistern
    g.beginPath(); g.ellipse(0, d * 0.1, w * 0.44, d * 0.32, 0, 0, Math.PI * 2);
    fill(g, '#FFFFFF'); stroke(g, p.ink, 1.2, z);
    g.beginPath(); g.ellipse(0, d * 0.1, w * 0.3, d * 0.21, 0, 0, Math.PI * 2); stroke(g, 'rgba(0,0,0,.35)', 1, z);
  };
  G.basin = (g, it, p, z) => {
    g.beginPath(); g.ellipse(0, 0, it.w / 2, it.d / 2, 0, 0, Math.PI * 2);
    fill(g, '#FFFFFF'); stroke(g, p.ink, 1.2, z);
    g.beginPath(); g.ellipse(0, 20, it.w / 2 - 70, it.d / 2 - 60, 0, 0, Math.PI * 2); stroke(g, 'rgba(0,0,0,.32)', 1, z);
    g.beginPath(); g.ellipse(0, -it.d / 2 + 30, 40, 40, 0, 0, Math.PI * 2); fill(g, p.metal);
  };
  G.vanityBasin = (g, it, p, z) => {
    R(g, -it.w / 2, -it.d / 2, it.w, it.d, 10); fill(g, it.colour || shade(p.wood, 4)); stroke(g, p.ink, 1.2, z);
    const bw = Math.min(520, it.w - 160);
    if (it.w > 1200) {
      [-it.w / 4, it.w / 4].forEach(cx => {
        g.beginPath(); g.ellipse(cx, 20, bw / 2.4, it.d / 2 - 70, 0, 0, Math.PI * 2);
        fill(g, '#FFFFFF'); stroke(g, 'rgba(0,0,0,.4)', 1, z);
      });
    } else {
      g.beginPath(); g.ellipse(0, 20, bw / 2, it.d / 2 - 70, 0, 0, Math.PI * 2);
      fill(g, '#FFFFFF'); stroke(g, 'rgba(0,0,0,.4)', 1, z);
    }
  };
  G.shower = (g, it, p, z) => {
    R(g, -it.w / 2, -it.d / 2, it.w, it.d, 10); fill(g, 'rgba(187,215,224,.5)'); stroke(g, p.ink, 1.3, z);
    g.beginPath(); g.moveTo(-it.w / 2, -it.d / 2); g.lineTo(it.w / 2, it.d / 2);
    stroke(g, 'rgba(0,0,0,.25)', 1, z);
    g.beginPath(); g.ellipse(0, 0, 55, 55, 0, 0, Math.PI * 2); stroke(g, 'rgba(0,0,0,.45)', 1.2, z);
    g.beginPath(); g.ellipse(-it.w / 2 + 200, -it.d / 2 + 200, 110, 110, 0, 0, Math.PI * 2); stroke(g, p.metal, 1.4, z);
  };
  G.bathtub = (g, it, p, z) => {
    R(g, -it.w / 2, -it.d / 2, it.w, it.d, 40); fill(g, '#FFFFFF'); stroke(g, p.ink, 1.3, z);
    R(g, -it.w / 2 + 80, -it.d / 2 + 80, it.w - 160, it.d - 160, 120); stroke(g, 'rgba(0,0,0,.35)', 1.2, z);
    g.beginPath(); g.ellipse(it.w / 2 - 220, 0, 45, 45, 0, 0, Math.PI * 2); stroke(g, 'rgba(0,0,0,.5)', 1, z);
  };
  G.bathtubFree = (g, it, p, z) => {
    g.beginPath(); g.ellipse(0, 0, it.w / 2, it.d / 2, 0, 0, Math.PI * 2);
    fill(g, '#FFFFFF'); stroke(g, p.ink, 1.3, z);
    g.beginPath(); g.ellipse(0, 0, it.w / 2 - 90, it.d / 2 - 90, 0, 0, Math.PI * 2); stroke(g, 'rgba(0,0,0,.35)', 1.2, z);
  };
  G.tv = (g, it, p, z) => {
    R(g, -it.w / 2, -it.d / 2, it.w, Math.max(it.d, 70), 8); fill(g, '#1B1D20'); stroke(g, '#000', 1.2, z);
    g.beginPath(); g.moveTo(-it.w / 2 + 40, 0); g.lineTo(it.w / 2 - 40, 0); stroke(g, 'rgba(255,255,255,.4)', 1.4, z);
  };
  G.piano = (g, it, p, z) => {
    R(g, -it.w / 2, -it.d / 2, it.w, it.d, 10); fill(g, it.colour || '#22201E'); stroke(g, '#000', 1.4, z);
    R(g, -it.w / 2 + 60, it.d / 2 - 170, it.w - 120, 130, 6); fill(g, '#F6F3ED'); stroke(g, 'rgba(0,0,0,.5)', 1, z);
    g.beginPath();
    const n = Math.floor((it.w - 120) / 42);
    for (let i = 1; i < n; i++) { const x = -it.w / 2 + 60 + (it.w - 120) / n * i; g.moveTo(x, it.d / 2 - 170); g.lineTo(x, it.d / 2 - 40); }
    stroke(g, 'rgba(0,0,0,.4)', 0.8, z);
    g.beginPath(); g.ellipse(0, it.d / 2 + 330, 190, 190, 0, 0, Math.PI * 2);
    fill(g, shade(p.wood, 10)); stroke(g, 'rgba(0,0,0,.4)', 1, z);
  };
  G.grandPiano = (g, it, p, z) => {
    const w = it.w, d = it.d;
    g.beginPath();
    g.moveTo(-w / 2, d / 2); g.lineTo(w / 2, d / 2); g.lineTo(w / 2, d / 2 - d * 0.28);
    g.bezierCurveTo(w / 2, -d / 2, -w / 2 + w * 0.1, -d / 2, -w / 2, d / 2 - d * 0.55);
    g.closePath();
    fill(g, it.colour || '#22201E'); stroke(g, '#000', 1.4, z);
    R(g, -w / 2 + 40, d / 2 - 170, w - 80, 130, 6); fill(g, '#F6F3ED'); stroke(g, 'rgba(0,0,0,.5)', 1, z);
    g.beginPath(); g.ellipse(0, d / 2 + 330, 190, 190, 0, 0, Math.PI * 2); fill(g, shade(p.wood, 10));
  };
  G.rug = (g, it, p, z) => {
    R(g, -it.w / 2, -it.d / 2, it.w, it.d, 30);
    g.fillStyle = tint(it.colour || p.accent, 0.22); g.fill();
    g.setLineDash([140, 100]); stroke(g, it.colour || p.accent, 1.4, z); g.setLineDash([]);
  };
  G.rugRound = (g, it, p, z) => {
    g.beginPath(); g.ellipse(0, 0, it.w / 2, it.d / 2, 0, 0, Math.PI * 2);
    g.fillStyle = tint(it.colour || p.accent, 0.22); g.fill();
    g.setLineDash([140, 100]); stroke(g, it.colour || p.accent, 1.4, z); g.setLineDash([]);
  };
  G.plant = (g, it, p, z) => {
    const r = Math.min(it.w, it.d) / 2;
    g.beginPath(); g.ellipse(0, 0, r, r, 0, 0, Math.PI * 2); fill(g, 'rgba(96,128,88,.32)');
    for (let i = 0; i < 7; i++) {
      const a = i / 7 * Math.PI * 2;
      g.beginPath(); g.ellipse(Math.cos(a) * r * 0.5, Math.sin(a) * r * 0.5, r * 0.42, r * 0.28, a, 0, Math.PI * 2);
      fill(g, 'rgba(86,120,80,.55)');
    }
    g.beginPath(); g.ellipse(0, 0, r * 0.34, r * 0.34, 0, 0, Math.PI * 2); fill(g, shade(p.wood, -14));
  };
  G.planter = (g, it, p, z) => {
    R(g, -it.w / 2, -it.d / 2, it.w, it.d, 12); fill(g, shade(p.wood, -12)); stroke(g, p.ink, 1.2, z);
    for (let x = -it.w / 2 + 200; x < it.w / 2; x += 380) {
      g.beginPath(); g.ellipse(x, 0, 150, it.d / 2 - 40, 0, 0, Math.PI * 2); fill(g, 'rgba(86,120,80,.55)');
    }
  };
  G.featureWall = (g, it, p, z) => {
    R(g, -it.w / 2, -it.d / 2, it.w, it.d, 4); fill(g, it.colour || shade(p.accent, -6)); stroke(g, p.ink, 1.3, z);
    g.beginPath(); for (let x = -it.w / 2 + 60; x < it.w / 2; x += 90) { g.moveTo(x, -it.d / 2); g.lineTo(x, it.d / 2); }
    stroke(g, 'rgba(0,0,0,.2)', 1, z);
  };
  G.mirror = (g, it, p, z) => {
    R(g, -it.w / 2, -it.d / 2, it.w, Math.max(it.d, 50), 4);
    fill(g, 'rgba(190,215,225,.75)'); stroke(g, p.metal, 1.6, z);
  };
  G.lamp = (g, it, p, z) => {
    g.beginPath(); g.ellipse(0, 0, it.w / 2, it.d / 2, 0, 0, Math.PI * 2);
    fill(g, 'rgba(255,225,170,.5)'); stroke(g, p.metal, 1.3, z);
    g.beginPath(); g.ellipse(0, 0, 45, 45, 0, 0, Math.PI * 2); fill(g, p.metal);
  };
  G.arcLamp = (g, it, p, z) => {
    g.beginPath(); g.moveTo(-it.w / 2, 0); g.quadraticCurveTo(0, -it.d, it.w / 2, 0);
    stroke(g, p.metal, 2, z);
    g.beginPath(); g.ellipse(-it.w / 2, 0, 180, 180, 0, 0, Math.PI * 2); fill(g, p.metal);
    g.beginPath(); g.ellipse(it.w / 2, 0, 140, 140, 0, 0, Math.PI * 2); fill(g, 'rgba(255,225,170,.6)');
  };
  G.fan = (g, it, p, z) => {
    const r = it.w / 2;
    g.beginPath(); g.ellipse(0, 0, r, r, 0, 0, Math.PI * 2);
    g.setLineDash([120, 100]); stroke(g, 'rgba(90,100,110,.7)', 1.2, z); g.setLineDash([]);
    for (let i = 0; i < 3; i++) {
      const a = i / 3 * Math.PI * 2;
      g.save(); g.rotate(a); R(g, 0, -90, r, 180, 60); fill(g, 'rgba(120,130,140,.4)'); g.restore();
    }
    g.beginPath(); g.ellipse(0, 0, 110, 110, 0, 0, Math.PI * 2); fill(g, p.metal);
  };
  G.fcu = (g, it, p, z) => {
    R(g, -it.w / 2, -it.d / 2, it.w, it.d, 30); fill(g, '#EEF1F2'); stroke(g, p.metal, 1.4, z);
    g.beginPath();
    for (let x = -it.w / 2 + 80; x < it.w / 2 - 60; x += 90) { g.moveTo(x, -it.d / 2 + 50); g.lineTo(x + 50, it.d / 2 - 50); }
    stroke(g, 'rgba(0,0,0,.25)', 1, z);
  };
  G.cylinder = (g, it, p, z) => {
    g.beginPath(); g.ellipse(0, 0, it.w / 2, it.d / 2, 0, 0, Math.PI * 2);
    fill(g, '#D9DDDF'); stroke(g, p.ink, 1.2, z);
  };
  G.column = (g, it, p, z) => {
    R(g, -it.w / 2, -it.d / 2, it.w, it.d, 0); fill(g, '#2E2A26'); stroke(g, '#000', 1.2, z);
  };
  G.laundryRack = (g, it, p, z) => {
    R(g, -it.w / 2, -it.d / 2, it.w, it.d, 8);
    g.setLineDash([100, 80]); stroke(g, p.metal, 1.4, z); g.setLineDash([]);
    g.beginPath();
    for (let y = -it.d / 2 + 120; y < it.d / 2; y += 160) { g.moveTo(-it.w / 2, y); g.lineTo(it.w / 2, y); }
    stroke(g, 'rgba(90,100,110,.6)', 1.1, z);
  };
  G.human = (g, it, p, z) => {
    g.beginPath(); g.ellipse(0, 0, 110, 110, 0, 0, Math.PI * 2); fill(g, 'rgba(60,60,60,.55)');
    g.beginPath(); g.ellipse(0, 60, it.w / 2, it.d / 2, 0, 0, Math.PI * 2);
    g.fillStyle = 'rgba(60,60,60,.2)'; g.fill(); stroke(g, 'rgba(40,40,40,.6)', 1.1, z);
  };

  /* ------------------------------------------------------------- COLOUR --- */
  function hexToRgb(h) {
    h = (h || '#888').replace('#', '');
    if (h.length === 3) h = h.split('').map(c => c + c).join('');
    return { r: parseInt(h.slice(0, 2), 16), g: parseInt(h.slice(2, 4), 16), b: parseInt(h.slice(4, 6), 16) };
  }
  function shade(hex, pct) {
    const { r, g, b } = hexToRgb(hex);
    const f = v => Math.max(0, Math.min(255, Math.round(v + 255 * pct / 100)));
    return `rgb(${f(r)},${f(g)},${f(b)})`;
  }
  function tint(hex, alpha) { const { r, g, b } = hexToRgb(hex); return `rgba(${r},${g},${b},${alpha})`; }
  function luminance(hex) { const { r, g, b } = hexToRgb(hex); return (0.299 * r + 0.587 * g + 0.114 * b) / 255; }

  /* --------------------------------------------------------------- WALLS --- */
  function wallQuad(w, t) {
    const v = MH.G.wallVec(w), h = t / 2;
    return [
      { x: w.x1 + v.nx * h, y: w.y1 + v.ny * h },
      { x: w.x2 + v.nx * h, y: w.y2 + v.ny * h },
      { x: w.x2 - v.nx * h, y: w.y2 - v.ny * h },
      { x: w.x1 - v.nx * h, y: w.y1 - v.ny * h }
    ];
  }
  function segQuad(w, t, t0, t1) {
    const v = MH.G.wallVec(w), h = t / 2;
    const a = MH.G.pointAlong(w, t0), b = MH.G.pointAlong(w, t1);
    return [
      { x: a.x + v.nx * h, y: a.y + v.ny * h },
      { x: b.x + v.nx * h, y: b.y + v.ny * h },
      { x: b.x - v.nx * h, y: b.y - v.ny * h },
      { x: a.x - v.nx * h, y: a.y - v.ny * h }
    ];
  }
  function poly(g, pts) { g.beginPath(); pts.forEach((p, i) => i ? g.lineTo(p.x, p.y) : g.moveTo(p.x, p.y)); g.closePath(); }

  /* Extend a wall's drawn ends by half the thickness so corners close up. */
  function extended(w, t) {
    const v = MH.G.wallVec(w), h = t / 2;
    return { x1: w.x1 - v.ux * h, y1: w.y1 - v.uy * h, x2: w.x2 + v.ux * h, y2: w.y2 + v.uy * h };
  }

  /* ----------------------------------------------------------------- DRAW --- */
  function draw(cv, state, ui) {
    const g = cv.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const cssW = cv.clientWidth, cssH = cv.clientHeight;
    if (cv.width !== Math.round(cssW * dpr) || cv.height !== Math.round(cssH * dpr)) {
      cv.width = Math.round(cssW * dpr); cv.height = Math.round(cssH * dpr);
    }
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    const p = palette(state);
    const dark = state.settings.theme === 'dark';
    g.fillStyle = dark ? '#15161A' : '#F7F5F1';
    g.fillRect(0, 0, cssW, cssH);

    const v = state.view, z = v.z;
    g.save();
    g.translate(v.ox, v.oy); g.scale(z, z);

    const labels = [];   // drawn later, in screen space, so text is never scaled oddly

    drawGrid(g, state, cssW, cssH, dark);
    drawUnderlay(g, state);
    drawLedges(g, state, p, labels, dark);
    drawRooms(g, state, p, labels, dark, ui);
    drawWalls(g, state, p, z, dark, ui);
    if (state.settings.showFurniture) drawItems(g, state, p, z, labels, ui);
    if (state.settings.showClearance) drawClearances(g, state, z);
    drawDimensions(g, state, p, z, labels, ui);
    drawSelection(g, state, p, z, ui);
    if (ui && ui.guides) drawGuides(g, state, ui.guides, z);
    if (ui && ui.placing) drawGhost(g, state, ui.placing, p, z, labels);
    if (ui && ui.draft) drawDraft(g, state, ui, p, z, labels);

    g.restore();

    drawLabels(g, labels, state, dark, cssW, cssH);
    drawScaleBar(g, state, cssW, cssH, dark);
    if (state.settings.xray) {
      g.save();
      g.font = '600 11px "Inter Tight", system-ui, sans-serif';
      const txt = 'Showing only what you are allowed to remove';
      const w = g.measureText(txt).width + 26;
      g.fillStyle = 'rgba(94,140,90,.95)';
      g.beginPath();
      (g.roundRect ? g.roundRect(cssW / 2 - w / 2, 12, w, 26, 13) : g.rect(cssW / 2 - w / 2, 12, w, 26));
      g.fill();
      g.fillStyle = '#fff'; g.textAlign = 'center'; g.textBaseline = 'middle';
      g.fillText(txt, cssW / 2, 25);
      g.restore();
    }
    drawNorth(g, state, cssW, dark);
    return { labels };
  }

  function drawGrid(g, state, cssW, cssH, dark) {
    if (!state.settings.grid) return;
    const z = state.view.z, v = state.view;
    const x0 = -v.ox / z, y0 = -v.oy / z, x1 = (cssW - v.ox) / z, y1 = (cssH - v.oy) / z;
    const minor = state.settings.gridStep || 100, major = 1000;
    if (minor * z > 5) {
      g.beginPath();
      for (let x = Math.floor(x0 / minor) * minor; x < x1; x += minor) { g.moveTo(x, y0); g.lineTo(x, y1); }
      for (let y = Math.floor(y0 / minor) * minor; y < y1; y += minor) { g.moveTo(x0, y); g.lineTo(x1, y); }
      g.strokeStyle = dark ? 'rgba(255,255,255,.045)' : 'rgba(40,40,40,.055)'; g.lineWidth = 1 / z; g.stroke();
    }
    g.beginPath();
    for (let x = Math.floor(x0 / major) * major; x < x1; x += major) { g.moveTo(x, y0); g.lineTo(x, y1); }
    for (let y = Math.floor(y0 / major) * major; y < y1; y += major) { g.moveTo(x0, y); g.lineTo(x1, y); }
    g.strokeStyle = dark ? 'rgba(255,255,255,.09)' : 'rgba(40,40,40,.1)'; g.lineWidth = 1 / z; g.stroke();
  }

  const underlayImg = {};
  function drawUnderlay(g, state) {
    const u = state.underlay;
    if (!u || !u.src) return;
    let img = underlayImg[u.src];
    if (!img) {
      img = new Image(); img.src = u.src;
      underlayImg[u.src] = img;
      img.onload = () => { if (MH.App && MH.App.requestDraw) MH.App.requestDraw(); };
    }
    if (!img.complete || !img.naturalWidth) return;
    g.save();
    g.globalAlpha = u.opacity === undefined ? 0.45 : u.opacity;
    g.translate(u.x, u.y);
    if (u.rot) { g.translate(u.w / 2, u.h / 2); g.rotate(u.rot * Math.PI / 180); g.translate(-u.w / 2, -u.h / 2); }
    g.drawImage(img, 0, 0, u.w, u.h);
    g.restore();
  }

  function drawLedges(g, state, p, labels, dark) {
    (state.ledges || []).forEach(l => {
      g.beginPath(); g.rect(l.x1, l.y1, l.x2 - l.x1, l.y2 - l.y1);
      g.fillStyle = dark ? 'rgba(255,255,255,.04)' : 'rgba(60,60,60,.06)'; g.fill();
      g.setLineDash([200, 140]); g.strokeStyle = dark ? 'rgba(255,255,255,.3)' : 'rgba(60,60,60,.4)';
      g.lineWidth = 1.5 / state.view.z; g.stroke(); g.setLineDash([]);
      labels.push({ x: (l.x1 + l.x2) / 2, y: (l.y1 + l.y2) / 2, text: l.name.toUpperCase(), size: 10, weight: 600, colour: dark ? '#8B8F96' : '#7C7C78', track: 1.4 });
    });
  }

  function drawRooms(g, state, p, labels, dark, ui) {
    const sel = new Set(state.selection || []);
    state.rooms.forEach(r => {
      const m = mat(r.floor);
      const base = m ? m.hex : p.floor;
      g.beginPath(); g.rect(Math.min(r.x1, r.x2), Math.min(r.y1, r.y2), Math.abs(r.x2 - r.x1), Math.abs(r.y2 - r.y1));
      g.fillStyle = dark ? tint(base, 0.30) : tint(base, 0.72);
      g.fill();
      if (r.protected) {
        g.fillStyle = 'rgba(40,70,95,.10)'; g.fill();
      }
      if (sel.has(r.id)) { g.fillStyle = 'rgba(200,150,60,.22)'; g.fill(); }
      g.strokeStyle = dark ? 'rgba(255,255,255,.06)' : 'rgba(0,0,0,.06)';
      g.lineWidth = 1 / state.view.z; g.stroke();
    });

    if (!state.settings.showLabels) return;
    const z = state.view.z;
    state.rooms.forEach(r => {
      const c = MH.G.rectCentre(r);
      const sw = Math.abs(r.x2 - r.x1) * z;         // room size on screen, px
      const sh = Math.abs(r.y2 - r.y1) * z;
      if (sw < 44 || sh < 26) return;               // no room for any text

      const name = (r.num ? r.num + '. ' : '') + r.name.toUpperCase();
      /* Shrink the name until it fits the room rather than letting it run out
         over the neighbours. 0.66 approximates the average glyph width. */
      let size = Math.min(11, Math.max(6.5, (sw - 10) / (name.length * 0.66)));
      const track = size >= 9 ? 1 : 0;
      const fits = name.length * size * 0.66 + name.length * track < sw - 6;
      const line = px => px / z;                    // px offset -> world units

      if (fits) {
        labels.push({ x: c.x, y: c.y - line(sh > 52 ? size * 0.85 : 0), text: name, size, weight: 700, colour: dark ? '#D8D4CC' : '#3A3733', track });
      } else {
        labels.push({ x: c.x, y: c.y, text: String(r.num || ''), size: 12, weight: 700, colour: dark ? '#D8D4CC' : '#3A3733' });
        return;
      }
      if (!state.settings.showAreas || sh < 52) return;
      const a = MH.U.area(MH.G.rectArea(r));
      labels.push({ x: c.x, y: c.y + line(size * 0.75), text: a.sqm + ' m²', size: Math.min(9.5, size), weight: 500, colour: dark ? '#9AA0A6' : '#6E6A63' });
      if (sh < 86) return;
      labels.push({
        x: c.x, y: c.y + line(size * 1.95),
        text: MH.U.dim(Math.abs(r.x2 - r.x1)) + ' × ' + MH.U.dim(Math.abs(r.y2 - r.y1)),
        size: Math.min(8.5, size), weight: 400, colour: dark ? '#7C838A' : '#8A857D'
      });
    });
  }

  function openingsOn(state, wallId) {
    return state.openings.filter(o => o.wallId === wallId).sort((a, b) => a.pos - b.pos);
  }

  function drawWalls(g, state, p, z, dark, ui) {
    const sel = new Set(state.selection || []);
    const hoverId = ui && ui.hover && ui.hover.kind === 'wall' ? ui.hover.id : null;

    state.walls.forEach(w => {
      const T = MH.Store.wallType(w);
      const t = MH.Store.thickness(w);
      const L = MH.G.wallLen(w);
      const ext = extended(w, t);
      const ow = openingsOn(state, w.id);

      if (w.demolished) {
        if (!state.settings.showGhosts) return;
        poly(g, wallQuad(ext, t));
        g.fillStyle = dark ? 'rgba(255,255,255,.035)' : 'rgba(0,0,0,.035)'; g.fill();
        g.setLineDash([160, 120]); g.strokeStyle = '#C4553A'; g.lineWidth = 1.4 / z; g.stroke(); g.setLineDash([]);
        return;
      }

      /* Solid runs between openings. Windows keep a thin band of wall. */
      const cuts = [];
      ow.forEach(o => {
        const half = o.w / 2;
        cuts.push({ a: Math.max(0, o.pos - half), b: Math.min(L, o.pos + half) });
      });
      cuts.sort((a, b) => a.a - b.a);
      let cursor = 0;
      const runs = [];
      cuts.forEach(c => { if (c.a > cursor) runs.push([cursor, c.a]); cursor = Math.max(cursor, c.b); });
      if (cursor < L) runs.push([cursor, L]);

      /* "What can I change?" fades the fixed structure right back and lights
         up the partitions you are actually allowed to touch. */
      const xray = !!state.settings.xray;
      let fillCol = dark ? shade(T.fill, -18) : T.fill;
      if (xray) fillCol = T.hackable ? '#5E8C5A' : (dark ? '#26282C' : '#DBD7D0');
      runs.forEach(([a, b], i) => {
        const A = (i === 0 && a === 0) ? -t / 2 : a;
        const B = (i === runs.length - 1 && b === L) ? L + t / 2 : b;
        const q = segQuad(w, t, A, B);
        poly(g, q); g.fillStyle = fillCol; g.fill();
        if (T.hackable && !xray) { poly(g, q); hatchFill(g, q, dark ? 'rgba(255,255,255,.16)' : 'rgba(0,0,0,.18)', 130, z); }
        poly(g, q);
        g.strokeStyle = xray ? (T.hackable ? '#3E6B3A' : (dark ? '#33363B' : '#CFCAC2')) : T.stroke;
        g.lineWidth = 1.1 / z; g.stroke();
      });

      /* Openings on top. */
      ow.forEach(o => drawOpening(g, state, w, o, t, p, z, dark, sel.has(o.id)));

      if (sel.has(w.id) || hoverId === w.id) {
        const can = T.hackable;
        poly(g, wallQuad(ext, t + 90));
        g.strokeStyle = can ? (sel.has(w.id) ? '#C8963C' : 'rgba(200,150,60,.55)') : '#B5462C';
        g.lineWidth = 2.4 / z; g.stroke();
        if (!can) padlock(g, MH.G.pointAlong(w, L / 2), z);
      }
    });
  }

  /* A padlock drawn over a wall you are not allowed to remove, so the answer
     arrives before the click rather than after it. */
  function padlock(g, c, z) {
    const s = 16 / z;
    g.save(); g.translate(c.x, c.y);
    g.beginPath(); g.ellipse(0, 0, s * 1.15, s * 1.15, 0, 0, Math.PI * 2);
    g.fillStyle = '#B5462C'; g.fill();
    g.strokeStyle = '#fff'; g.lineWidth = 1.7 / z;
    g.beginPath();
    (g.roundRect ? g.roundRect(-s * .42, -s * .1, s * .84, s * .62, s * .12) : g.rect(-s * .42, -s * .1, s * .84, s * .62));
    g.stroke();
    g.beginPath(); g.arc(0, -s * .1, s * .27, Math.PI, 0); g.stroke();
    g.restore();
  }

  /* 45-degree hatch clipped to a quad, drawn in world space so the spacing
     stays true to the drawing rather than to the screen. */
  function hatchFill(g, q, colour, spacing, z) {
    const bb = MH.G.aabb(q);
    g.save(); g.clip();
    g.beginPath();
    const span = (bb.x2 - bb.x1) + (bb.y2 - bb.y1);
    for (let s = -span; s < span; s += spacing) {
      g.moveTo(bb.x1 + s, bb.y1);
      g.lineTo(bb.x1 + s + (bb.y2 - bb.y1), bb.y2);
    }
    g.strokeStyle = colour; g.lineWidth = Math.max(1.3 / z, 14); g.stroke();
    g.restore();
  }

  function drawOpening(g, state, w, o, t, p, z, dark, isSel) {
    const v = MH.G.wallVec(w);
    const c = MH.G.pointAlong(w, o.pos);
    const ang = Math.atan2(v.dy, v.dx);
    g.save();
    g.translate(c.x, c.y); g.rotate(ang);
    const hw = o.w / 2, ht = t / 2;
    const flip = o.flip ? -1 : 1;

    if (o.type === 'window') {
      g.beginPath(); g.rect(-hw, -ht, o.w, t);
      g.fillStyle = dark ? '#1E2529' : '#EAF1F4'; g.fill();
      g.strokeStyle = dark ? '#5B6B73' : '#7C929B'; g.lineWidth = 1.1 / z; g.stroke();
      g.beginPath();
      g.moveTo(-hw, -ht * 0.35); g.lineTo(hw, -ht * 0.35);
      g.moveTo(-hw, ht * 0.35); g.lineTo(hw, ht * 0.35);
      g.strokeStyle = '#6E97A3'; g.lineWidth = 1.6 / z; g.stroke();
    } else if (o.type === 'door') {
      g.beginPath(); g.rect(-hw, -ht, o.w, t); g.fillStyle = dark ? '#15161A' : '#F7F5F1'; g.fill();
      g.beginPath();
      g.moveTo(-hw, -ht); g.lineTo(-hw, ht); g.moveTo(hw, -ht); g.lineTo(hw, ht);
      g.strokeStyle = dark ? '#6B6B68' : '#4A4742'; g.lineWidth = 1.4 / z; g.stroke();
      if (o.swing === 'double') {
        drawLeaf(g, -hw, o.w / 2, 1, flip, z, p);
        drawLeaf(g, hw, o.w / 2, -1, flip, z, p);
      } else {
        const dir = o.swing === 'right' ? -1 : 1;      // which end the hinge is on
        drawLeaf(g, dir > 0 ? -hw : hw, o.w, dir, flip, z, p);
      }
    } else if (o.type === 'slide' || o.type === 'slide2' || o.type === 'slide3' || o.type === 'pocket') {
      const panels = o.type === 'slide3' ? 3 : (o.type === 'slide2' ? 2 : 1);
      g.beginPath(); g.rect(-hw, -ht, o.w, t); g.fillStyle = dark ? '#15161A' : '#F7F5F1'; g.fill();
      g.strokeStyle = dark ? '#6B6B68' : '#4A4742'; g.lineWidth = 1.2 / z;
      g.beginPath(); g.moveTo(-hw, -ht); g.lineTo(-hw, ht); g.moveTo(hw, -ht); g.lineTo(hw, ht); g.stroke();
      const pw = o.w / panels;
      for (let i = 0; i < panels; i++) {
        const y = flip * (ht * 0.45 - i * (t * 0.32));
        g.beginPath(); g.rect(-hw + pw * i, y - 22, pw, 44);
        g.fillStyle = o.type === 'pocket' ? 'rgba(120,140,150,.5)' : 'rgba(150,180,192,.75)'; g.fill();
        g.strokeStyle = '#5E7A85'; g.lineWidth = 1 / z; g.stroke();
      }
      if (o.type === 'pocket') {
        g.setLineDash([90, 70]); g.beginPath();
        g.rect(hw, -ht, o.w, t); g.strokeStyle = 'rgba(120,120,120,.7)'; g.lineWidth = 1 / z; g.stroke(); g.setLineDash([]);
      }
    } else if (o.type === 'bifold' || o.type === 'barn') {
      g.beginPath(); g.rect(-hw, -ht, o.w, t); g.fillStyle = dark ? '#15161A' : '#F7F5F1'; g.fill();
      g.beginPath();
      g.moveTo(-hw, 0); g.lineTo(-hw + o.w * 0.25, flip * -o.w * 0.28);
      g.lineTo(-hw + o.w * 0.5, 0); g.lineTo(-hw + o.w * 0.75, flip * -o.w * 0.28); g.lineTo(hw, 0);
      g.strokeStyle = p.ink; g.lineWidth = 1.6 / z; g.stroke();
    } else { /* open / arch */
      g.beginPath(); g.rect(-hw, -ht, o.w, t); g.fillStyle = dark ? '#15161A' : '#F7F5F1'; g.fill();
      g.beginPath();
      g.moveTo(-hw, -ht); g.lineTo(-hw, ht); g.moveTo(hw, -ht); g.lineTo(hw, ht);
      g.strokeStyle = dark ? '#6B6B68' : '#4A4742'; g.lineWidth = 1.4 / z; g.stroke();
      if (o.type === 'arch') {
        g.beginPath(); g.arc(0, ht, hw, Math.PI, 0, true);
        g.setLineDash([70, 60]); g.strokeStyle = 'rgba(120,120,120,.8)'; g.lineWidth = 1.2 / z; g.stroke(); g.setLineDash([]);
      }
    }
    if (isSel) {
      g.beginPath(); g.rect(-hw - 40, -ht - 40, o.w + 80, t + 80);
      g.strokeStyle = '#C8963C'; g.lineWidth = 2.2 / z; g.stroke();
    }
    g.restore();

    /* Mark the ways in and out. The main door especially: everything about
       how a flat works starts from where you come through the door. */
    if (o.entrance || /entrance|main door/i.test(o.label || '')) {
      const nx = v.nx, ny = v.ny;
      const px = c.x + nx * (t / 2 + 380), py = c.y + ny * (t / 2 + 380);
      g.save();
      g.beginPath(); g.ellipse(px, py, 190, 190, 0, 0, Math.PI * 2);
      g.fillStyle = '#C4553A'; g.fill();
      g.strokeStyle = '#fff'; g.lineWidth = 2 / z; g.stroke();
      g.beginPath();
      const a2 = Math.atan2(-ny, -nx);
      g.moveTo(px + Math.cos(a2) * 95, py + Math.sin(a2) * 95);
      g.lineTo(px - Math.cos(a2) * 60, py - Math.sin(a2) * 60);
      g.moveTo(px + Math.cos(a2) * 95, py + Math.sin(a2) * 95);
      g.lineTo(px + Math.cos(a2 + 2.4) * 70, py + Math.sin(a2 + 2.4) * 70);
      g.moveTo(px + Math.cos(a2) * 95, py + Math.sin(a2) * 95);
      g.lineTo(px + Math.cos(a2 - 2.4) * 70, py + Math.sin(a2 - 2.4) * 70);
      g.strokeStyle = '#fff'; g.lineWidth = 2.4 / z; g.stroke();
      g.restore();
    }
  }
  /* hingeX: where the hinge sits along the wall (local x).
     dir  : +1 when the closed leaf lies towards +x, -1 towards -x.
     side : +1 opens to +y (below the wall on plan), -1 opens to -y. */
  function drawLeaf(g, hingeX, leaf, dir, side, z, p) {
    g.save();
    g.beginPath(); g.moveTo(hingeX, 0); g.lineTo(hingeX, side * leaf);
    g.strokeStyle = p.ink; g.lineWidth = 2.4 / z; g.stroke();
    const a0 = side > 0 ? Math.PI / 2 : -Math.PI / 2;
    const a1 = dir > 0 ? 0 : Math.PI * (side > 0 ? 1 : -1);
    g.beginPath();
    g.arc(hingeX, 0, leaf, a0, a1, (dir > 0) === (side > 0));
    g.setLineDash([60, 55]); g.strokeStyle = 'rgba(90,90,88,.8)'; g.lineWidth = 1.1 / z; g.stroke(); g.setLineDash([]);
    g.restore();
  }

  function drawItems(g, state, p, z, labels, ui) {
    const dark = state.settings.theme === 'dark';
    const sel = new Set(state.selection || []);
    const hoverId = ui && ui.hover && ui.hover.kind === 'item' ? ui.hover.id : null;
    /* rugs and zones first so they sit under everything */
    const order = state.items.slice().sort((a, b) => rank(a) - rank(b));
    order.forEach(it => {
      if (it.hidden) return;
      g.save();
      g.translate(it.x, it.y); g.rotate((it.rot || 0) * Math.PI / 180);
      const fn = G[it.glyph] || G.box;
      try { fn(g, it, p, z); } catch (e) { G.box(g, it, p, z); }
      g.restore();

      if (sel.has(it.id) || hoverId === it.id) {
        const c = MH.G.corners(it.x, it.y, it.w, it.d, it.rot);
        poly(g, c);
        g.strokeStyle = sel.has(it.id) ? '#C8963C' : 'rgba(200,150,60,.5)';
        g.lineWidth = (sel.has(it.id) ? 2.4 : 1.6) / z; g.stroke();
      }
      /* Item names are noise at plan scale. Show them for what is selected or
         hovered, and for everything only when zoomed right in. */
      const named = sel.has(it.id) || hoverId === it.id;
      if (state.settings.showLabels && (named || Math.min(it.w, it.d) * z > 130)) {
        labels.push({
          x: it.x, y: it.y + it.d / 2 + 60 / z, text: it.name,
          size: 9.5, weight: named ? 600 : 500,
          colour: named ? (dark ? '#E6D9BC' : '#7C6132') : 'rgba(126,121,113,.9)',
          chip: named
        });
      }
    });
  }
  function rank(it) {
    if (it.glyph === 'rug' || it.glyph === 'rugRound') return 0;
    if (it.glyph === 'zoneBox') return 1;
    if (it.glyph === 'fan' || it.glyph === 'hood') return 9;
    return 5;
  }

  function drawClearances(g, state, z) {
    state.items.forEach(it => {
      const c = MH.Store.catalogById(it.catId);
      if (!c || !c.clear) return;
      g.save(); g.translate(it.x, it.y); g.rotate((it.rot || 0) * Math.PI / 180);
      g.fillStyle = 'rgba(200,120,60,.13)';
      if (c.clear.all) {
        g.beginPath(); g.rect(-it.w / 2 - c.clear.all, -it.d / 2 - c.clear.all, it.w + c.clear.all * 2, it.d + c.clear.all * 2);
        g.rect(-it.w / 2, -it.d / 2, it.w, it.d);
        g.fill('evenodd');
      }
      if (c.clear.front) { g.beginPath(); g.rect(-it.w / 2, it.d / 2, it.w, c.clear.front); g.fill(); }
      if (c.clear.sides) {
        g.beginPath(); g.rect(-it.w / 2 - c.clear.sides, -it.d / 2, c.clear.sides, it.d);
        g.rect(it.w / 2, -it.d / 2, c.clear.sides, it.d); g.fill();
      }
      g.restore();
    });
  }

  function drawDimensions(g, state, p, z, labels, ui) {
    if (!state.settings.showDims) return;
    const b = planBounds(state);
    const off = 700;
    dimLine(g, b.x1, b.y1 - off, b.x2, b.y1 - off, b.x2 - b.x1, labels, z, 'h');
    dimLine(g, b.x1 - off, b.y1, b.x1 - off, b.y2, b.y2 - b.y1, labels, z, 'v');
  }
  function dimLine(g, x1, y1, x2, y2, value, labels, z, dir) {
    g.beginPath(); g.moveTo(x1, y1); g.lineTo(x2, y2);
    g.strokeStyle = 'rgba(120,115,108,.85)'; g.lineWidth = 1.1 / z; g.stroke();
    const tick = 90;
    g.beginPath();
    if (dir === 'h') { g.moveTo(x1, y1 - tick); g.lineTo(x1, y1 + tick); g.moveTo(x2, y2 - tick); g.lineTo(x2, y2 + tick); }
    else { g.moveTo(x1 - tick, y1); g.lineTo(x1 + tick, y1); g.moveTo(x2 - tick, y2); g.lineTo(x2 + tick, y2); }
    g.stroke();
    labels.push({ x: (x1 + x2) / 2, y: (y1 + y2) / 2 - (dir === 'h' ? 150 : 0), text: MH.U.dim(value), size: 10, weight: 600, colour: 'rgba(90,86,80,.95)', rot: dir === 'v' ? -90 : 0 });
  }

  function planBounds(state) {
    let x1 = Infinity, y1 = Infinity, x2 = -Infinity, y2 = -Infinity;
    state.walls.forEach(w => {
      x1 = Math.min(x1, w.x1, w.x2); y1 = Math.min(y1, w.y1, w.y2);
      x2 = Math.max(x2, w.x1, w.x2); y2 = Math.max(y2, w.y1, w.y2);
    });
    if (!isFinite(x1)) { x1 = 0; y1 = 0; x2 = 9200; y2 = 11400; }
    return { x1, y1, x2, y2 };
  }

  function drawSelection(g, state, p, z, ui) {
    const sel = MH.Store.selected();
    sel.forEach(({ kind, obj }) => {
      if (kind === 'item') {
        const c = MH.G.corners(obj.x, obj.y, obj.w, obj.d, obj.rot);
        c.forEach(pt => { g.beginPath(); g.ellipse(pt.x, pt.y, 7 / z, 7 / z, 0, 0, Math.PI * 2); g.fillStyle = '#C8963C'; g.fill(); });
        const a = (obj.rot || 0) * Math.PI / 180;
        const hx = obj.x + Math.sin(a) * (obj.d / 2 + 420), hy = obj.y - Math.cos(a) * (obj.d / 2 + 420);
        g.beginPath(); g.moveTo(obj.x, obj.y); g.lineTo(hx, hy); g.strokeStyle = 'rgba(200,150,60,.7)'; g.lineWidth = 1.4 / z; g.stroke();
        g.beginPath(); g.ellipse(hx, hy, 9 / z, 9 / z, 0, 0, Math.PI * 2); g.fillStyle = '#fff'; g.fill();
        g.strokeStyle = '#C8963C'; g.lineWidth = 2 / z; g.stroke();
      } else if (kind === 'room') {
        [[obj.x1, obj.y1], [obj.x2, obj.y1], [obj.x2, obj.y2], [obj.x1, obj.y2]].forEach(([x, y]) => {
          g.beginPath(); g.rect(x - 8 / z, y - 8 / z, 16 / z, 16 / z); g.fillStyle = '#C8963C'; g.fill();
        });
      } else if (kind === 'wall') {
        [[obj.x1, obj.y1], [obj.x2, obj.y2]].forEach(([x, y]) => {
          g.beginPath(); g.ellipse(x, y, 8 / z, 8 / z, 0, 0, Math.PI * 2); g.fillStyle = '#fff'; g.fill();
          g.strokeStyle = '#C8963C'; g.lineWidth = 2.4 / z; g.stroke();
        });
      }
    });
  }

  function drawDraft(g, state, ui, p, z, labels) {
    const d = ui.draft;
    if (d.kind === 'wall' && d.x1 !== undefined) {
      const t = (MH.WALL_TYPES[d.type] || MH.WALL_TYPES.proposed).thickness;
      poly(g, wallQuad({ x1: d.x1, y1: d.y1, x2: d.x2, y2: d.y2 }, t));
      g.fillStyle = 'rgba(201,160,90,.5)'; g.fill();
      g.strokeStyle = '#8A6A2E'; g.lineWidth = 1.4 / z; g.stroke();
      const len = Math.hypot(d.x2 - d.x1, d.y2 - d.y1);
      labels.push({ x: (d.x1 + d.x2) / 2, y: (d.y1 + d.y2) / 2 - 200, text: MH.U.dim(len), size: 11, weight: 700, colour: '#8A6A2E', chip: true });
    }
    if (d.kind === 'measure' && d.x1 !== undefined) {
      g.beginPath(); g.moveTo(d.x1, d.y1); g.lineTo(d.x2, d.y2);
      g.strokeStyle = '#C4553A'; g.lineWidth = 2 / z; g.stroke();
      [[d.x1, d.y1], [d.x2, d.y2]].forEach(([x, y]) => {
        g.beginPath(); g.ellipse(x, y, 6 / z, 6 / z, 0, 0, Math.PI * 2); g.fillStyle = '#C4553A'; g.fill();
      });
      const len = Math.hypot(d.x2 - d.x1, d.y2 - d.y1);
      labels.push({ x: (d.x1 + d.x2) / 2, y: (d.y1 + d.y2) / 2 - 160, text: MH.U.dim(len), size: 12, weight: 700, colour: '#fff', chip: '#C4553A' });
    }
    if (d.kind === 'room' && d.x1 !== undefined) {
      g.beginPath(); g.rect(Math.min(d.x1, d.x2), Math.min(d.y1, d.y2), Math.abs(d.x2 - d.x1), Math.abs(d.y2 - d.y1));
      g.fillStyle = 'rgba(200,150,60,.2)'; g.fill();
      g.strokeStyle = '#C8963C'; g.lineWidth = 1.6 / z; g.stroke();
    }
  }

  /* Dashed magenta rules showing what the thing you are dragging lined up
     with. They vanish the moment you let go. */
  function drawGuides(g, state, guides, z) {
    const b = planBounds(state);
    g.save();
    g.setLineDash([180 / (z * 60), 120 / (z * 60)].map(v => Math.max(60, v)));
    g.strokeStyle = '#C8963C'; g.lineWidth = 1.4 / z;
    guides.forEach(gu => {
      g.beginPath();
      if (gu.axis === 'x') { g.moveTo(gu.v, b.y1 - 1200); g.lineTo(gu.v, b.y2 + 1200); }
      else { g.moveTo(b.x1 - 1200, gu.v); g.lineTo(b.x2 + 1200, gu.v); }
      g.stroke();
    });
    g.setLineDash([]); g.restore();
  }

  /* The footprint of the thing you are about to place, following the cursor. */
  function drawGhost(g, state, pl, p, z, labels) {
    if (pl.x === null || pl.x === undefined) return;
    const it = MH.Store.hydrateItem({ catId: pl.catId, x: pl.x, y: pl.y, rot: pl.rot || 0 });
    g.save();
    g.globalAlpha = 0.62;
    g.translate(it.x, it.y); g.rotate((it.rot || 0) * Math.PI / 180);
    const fn = G[it.glyph] || G.box;
    try { fn(g, it, p, z); } catch (e) { G.box(g, it, p, z); }
    g.restore();
    const c = MH.G.corners(it.x, it.y, it.w, it.d, it.rot);
    poly(g, c);
    g.setLineDash([140, 100]); g.strokeStyle = '#C8963C'; g.lineWidth = 2 / z; g.stroke(); g.setLineDash([]);
    labels.push({
      x: it.x, y: it.y - it.d / 2 - 220,
      text: it.name + '  ·  ' + Math.round(it.w) + ' × ' + Math.round(it.d),
      size: 10.5, weight: 600, colour: '#7C6132', chip: true
    });
  }

  function drawLabels(g, labels, state, dark, cssW, cssH) {
    const v = state.view;
    g.save();
    g.textAlign = 'center'; g.textBaseline = 'middle';
    labels.forEach(L => {
      const sx = L.x * v.z + v.ox, sy = L.y * v.z + v.oy;
      if (sx < -200 || sy < -200 || sx > cssW + 200 || sy > cssH + 200) return;
      g.save();
      g.translate(sx, sy);
      if (L.rot) g.rotate(L.rot * Math.PI / 180);
      g.font = `${L.weight || 500} ${L.size || 10}px "Inter Tight", "DM Sans", system-ui, sans-serif`;
      if (L.track) g.letterSpacing = L.track + 'px';
      if (L.chip) {
        const w = g.measureText(L.text).width + 18;
        g.fillStyle = typeof L.chip === 'string' ? L.chip : (dark ? 'rgba(20,22,26,.88)' : 'rgba(255,255,255,.9)');
        g.beginPath();
        (g.roundRect ? g.roundRect(-w / 2, -11, w, 22, 6) : g.rect(-w / 2, -11, w, 22));
        g.fill();
      }
      g.fillStyle = L.colour || (dark ? '#D8D4CC' : '#3A3733');
      g.fillText(L.text, 0, 0);
      g.letterSpacing = '0px';
      g.restore();
    });
    g.restore();
  }

  function drawScaleBar(g, state, cssW, cssH, dark) {
    const z = state.view.z;
    const targets = [500, 1000, 2000, 5000, 10000];
    let unitMm = 1000;
    for (const t of targets) { if (t * z >= 70) { unitMm = t; break; } unitMm = t; }
    let segs = 4, px = unitMm * z;
    /* On a narrow canvas a four-segment bar runs off the edge. */
    while (segs > 1 && px * segs + 150 > cssW - 30) segs = segs === 4 ? 2 : 1;
    const x0 = 22, y0 = cssH - 34;
    g.save();
    g.fillStyle = dark ? 'rgba(22,24,28,.86)' : 'rgba(255,255,255,.88)';
    g.beginPath(); (g.roundRect ? g.roundRect(x0 - 10, y0 - 24, px * segs + 130, 44, 8) : g.rect(x0 - 10, y0 - 24, px * segs + 130, 44)); g.fill();
    for (let i = 0; i < segs; i++) {
      g.fillStyle = i % 2 ? (dark ? '#E6E2DA' : '#2E2A26') : (dark ? '#3A3E44' : '#EDE9E2');
      g.fillRect(x0 + i * px, y0 - 8, px, 9);
    }
    g.strokeStyle = dark ? '#8A9096' : '#5A564F'; g.lineWidth = 1;
    g.strokeRect(x0, y0 - 8, px * segs, 9);
    g.fillStyle = dark ? '#B9BEC4' : '#5A564F';
    g.font = '500 10px "IBM Plex Mono", ui-monospace, monospace';
    g.textAlign = 'left'; g.textBaseline = 'middle';
    g.fillText('0', x0 - 2, y0 + 12);
    g.fillText(MH.U.dim(unitMm * segs), x0 + px * segs - 12, y0 + 12);
    g.fillText(MH.U.ratio(z), x0 + px * segs + 22, y0 - 3);
    g.restore();
  }

  function drawNorth(g, state, cssW, dark) {
    const a = (state.meta.northAngle || 0) * Math.PI / 180;
    /* On a phone the floating tool strip owns the top centre and right, so the
       compass moves to the free corner rather than sitting under a button. */
    const narrow = cssW < 560;
    const x = narrow ? 46 : cssW - 46, y = 46;
    g.save(); g.translate(x, y); g.rotate(a);
    g.beginPath(); g.moveTo(0, -18); g.lineTo(7, 10); g.lineTo(0, 5); g.lineTo(-7, 10); g.closePath();
    g.fillStyle = dark ? '#E6E2DA' : '#2E2A26'; g.fill();
    g.restore();
    g.save(); g.translate(x, y);
    g.beginPath(); g.ellipse(0, 0, 24, 24, 0, 0, Math.PI * 2);
    g.strokeStyle = dark ? 'rgba(230,226,218,.4)' : 'rgba(46,42,38,.35)'; g.lineWidth = 1; g.stroke();
    g.font = '700 9px "Inter Tight", system-ui, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillStyle = dark ? '#E6E2DA' : '#2E2A26';
    g.fillText('N', 0, -30);
    g.restore();
  }

  /* ------------------------------------------------------------ PICKING --- */
  function pick(state, wx, wy, tol) {
    tol = tol || 120;
    /* items first (top of the stack), then openings, walls, rooms */
    for (let i = state.items.length - 1; i >= 0; i--) {
      const it = state.items[i];
      if (it.hidden) continue;
      if (MH.G.pointInRotRect(wx, wy, it.x, it.y, Math.max(it.w, 160), Math.max(it.d, 160), it.rot)) return { kind: 'item', id: it.id, obj: it };
    }
    for (const o of state.openings) {
      const w = MH.Store.wall(o.wallId); if (!w || w.demolished) continue;
      const c = MH.G.pointAlong(w, o.pos);
      const t = MH.Store.thickness(w);
      if (Math.hypot(wx - c.x, wy - c.y) < Math.max(o.w / 2, t)) return { kind: 'opening', id: o.id, obj: o };
    }
    let best = null, bestD = Infinity;
    for (const w of state.walls) {
      const t = MH.Store.thickness(w);
      const pr = MH.G.projectOnWall(w, wx, wy);
      const d = pr.dist;
      if (d < t / 2 + tol * 0.35 && d < bestD) { bestD = d; best = { kind: 'wall', id: w.id, obj: w }; }
    }
    if (best) return best;
    const r = MH.G.roomAt(state.rooms, wx, wy);
    if (r) return { kind: 'room', id: r.id, obj: r };
    return null;
  }

  /* The wall tools must never grab a sofa that happens to sit against the
     wall you are aiming at, so they get their own picker. */
  function pickWall(state, wx, wy, tol) {
    tol = tol === undefined ? 400 : tol;
    let best = null, bestD = Infinity;
    for (const w of state.walls) {
      const t = MH.Store.thickness(w);
      const pr = MH.G.projectOnWall(w, wx, wy);
      const d = Math.max(0, pr.dist - t / 2);
      if (d < tol && d < bestD) { bestD = d; best = w; }
    }
    return best ? { kind: 'wall', id: best.id, obj: best, dist: bestD } : null;
  }

  function fit(state, cssW, cssH, pad) {
    const b = planBounds(state);
    pad = pad === undefined ? 56 : pad;
    const w = (b.x2 - b.x1) || 1000, h = (b.y2 - b.y1) || 1000;
    /* Headroom for the dimension lines and the air-con ledge. */
    const z = Math.min((cssW - pad * 2) / (w + 1900), (cssH - pad * 2) / (h + 1900));
    state.view.z = z;
    state.view.ox = cssW / 2 - (b.x1 + b.x2) / 2 * z;
    state.view.oy = cssH / 2 - (b.y1 + b.y2) / 2 * z;
  }

  return { draw, pick, pickWall, fit, palette, planBounds, shade, tint, luminance, hexToRgb, GLYPHS: G };
})();
