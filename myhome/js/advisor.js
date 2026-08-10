/* =============================================================================
   MyHome — design advisor
   -----------------------------------------------------------------------------
   Deterministic, offline checks against published ergonomic and regulatory
   norms. This runs on every edit and needs no API key. The AI layer sits on
   top of it and is given these findings as context, so it critiques a plan it
   has actually been told the measurements of.

   Sources behind the numbers: Neufert Architects' Data (4th ed.) for
   clearances, SMPTE/THX for viewing angles, HDB renovation guidelines and the
   SCDF Civil Defence Shelter Act for what may and may not be altered, and
   BCA/SS 531 for lighting levels.
   ========================================================================== */
window.MH = window.MH || {};

MH.Advisor = (function () {
  const mm = v => MH.U.dim(v);

  function catOf(it) { return MH.Store.catalogById(it.catId) || {}; }

  /* Four kinds of thing the geometry checks have to treat differently:
       soft      — floor coverings, zones and reference figures. Not obstacles.
       overhead  — ceiling or high-wall mounted. Nothing at floor level at all.
       mounted   — sits inside a worktop or on top of another item by design.
       passable  — a shower tray or a bath: you can stand in it, so it does not
                   block the clearance in front of something else.
     Getting these wrong is what turns a useful advisor into a nagging one. */
  function isSoft(it) { return ['rug', 'rugRound', 'zoneBox', 'featureWall', 'mirror', 'human', 'column'].includes(it.glyph); }
  function isOverhead(it) { return !!catOf(it).overhead; }
  function isMounted(it) { return !!catOf(it).mounted; }
  function isPassable(it) { return !!catOf(it).passable; }
  /* Not an obstacle for anything: excluded from every geometric test. */
  function ghost(it) { return it.hidden || isSoft(it) || isOverhead(it) || isMounted(it) || it.glyph === 'tv'; }
  function roomOf(state, it) { return MH.G.roomAt(state.rooms, it.x, it.y); }
  function itemsIn(state, roomId) { return state.items.filter(i => { const r = roomOf(state, i); return r && r.id === roomId; }); }

  function issue(level, title, detail, ids, tag) {
    return { level, title, detail, ids: ids || [], tag: tag || 'layout' };
  }

  /* Do two line segments cross? Used to answer the single most important
     question in this file: is there a wall between these two things? Without
     it, a wardrobe in bedroom 3 gets reported as blocking a bed in bedroom 2. */
  function segCross(ax, ay, bx, by, cx, cy, dx, dy) {
    const d1 = (dx - cx) * (ay - cy) - (dy - cy) * (ax - cx);
    const d2 = (dx - cx) * (by - cy) - (dy - cy) * (bx - cx);
    const d3 = (bx - ax) * (cy - ay) - (by - ay) * (cx - ax);
    const d4 = (bx - ax) * (dy - ay) - (by - ay) * (dx - ax);
    return ((d1 > 0) !== (d2 > 0)) && ((d3 > 0) !== (d4 > 0));
  }
  function wallBetween(state, ax, ay, bx, by) {
    for (const w of state.walls) {
      if (w.demolished) continue;
      if (!segCross(ax, ay, bx, by, w.x1, w.y1, w.x2, w.y2)) continue;
      /* An opening in the way means the two really can see each other. */
      const pr = MH.G.projectOnWall(w, (ax + bx) / 2, (ay + by) / 2);
      const through = state.openings.some(o =>
        o.wallId === w.id && o.type !== 'window' && Math.abs(o.pos - pr.t) < o.w / 2);
      if (!through) return true;
    }
    return false;
  }

  /* --------------------------------------------------------------- CHECKS --- */

  function checkOverlaps(state, out) {
    const list = state.items.filter(i => !ghost(i));
    for (let a = 0; a < list.length; a++) {
      for (let b = a + 1; b < list.length; b++) {
        const A = list[a], B = list[b];
        if (Math.hypot(A.x - B.x, A.y - B.y) > (Math.max(A.w, A.d) + Math.max(B.w, B.d)) / 2 + 50) continue;
        if (MH.G.rectsOverlap(A, B)) {
          out.push(issue('error', 'Two things occupy the same floor',
            `${A.name} and ${B.name} overlap. One of them has to move.`, [A.id, B.id], 'clash'));
        }
      }
    }
  }

  /* Axis-aligned overlap area between two boxes, in mm². Walls are always
     orthogonal here and furniture nearly always is, so the AABB answer is
     close enough and far more stable than counting corners. */
  function overlapArea(a, b) {
    const w = Math.min(a.x2, b.x2) - Math.max(a.x1, b.x1);
    const h = Math.min(a.y2, b.y2) - Math.max(a.y1, b.y1);
    return w > 0 && h > 0 ? w * h : 0;
  }
  function wallBox(w) {
    const t = MH.Store.thickness(w);
    const v = MH.G.wallVec(w);
    const nx = Math.abs(v.nx) * t / 2, ny = Math.abs(v.ny) * t / 2;
    return {
      x1: Math.min(w.x1, w.x2) - nx, x2: Math.max(w.x1, w.x2) + nx,
      y1: Math.min(w.y1, w.y2) - ny, y2: Math.max(w.y1, w.y2) + ny
    };
  }
  function itemBox(it) { return MH.G.aabb(MH.G.corners(it.x, it.y, it.w, it.d, it.rot)); }

  function checkItemsVsWalls(state, out) {
    const walls = state.walls.filter(w => !w.demolished);
    state.items.forEach(it => {
      if (ghost(it)) return;
      const ib = itemBox(it);
      const area = (ib.x2 - ib.x1) * (ib.y2 - ib.y1);
      if (area <= 0) return;
      for (const w of walls) {
        /* More than a fifth of the footprint inside the wall means it is not
           "against" the wall, it is inside it. */
        if (overlapArea(ib, wallBox(w)) / area > 0.2) {
          out.push(issue('error', 'Furniture buried in a wall',
            `${it.name} is pushed into ${MH.Store.wallType(w).name.toLowerCase()}. Pull it back to the wall face.`, [it.id, w.id], 'clash'));
          break;
        }
      }
    });
  }

  function checkDoorApproach(state, out) {
    state.openings.forEach(o => {
      const w = MH.Store.wall(o.wallId);
      if (!w || w.demolished) return;
      if (o.type === 'window') return;
      const v = MH.G.wallVec(w);
      const c = MH.G.pointAlong(w, o.pos);
      /* A swing door needs its whole leaf clear on the side it opens to; every
         opening needs a 600 mm standing space on the other side. Sliding and
         cased openings only ever need the 600. */
      const swingSide = o.flip ? -1 : 1;
      const isSwing = o.type === 'door' || o.type === 'bifold';
      [1, -1].forEach(side => {
        const need = (isSwing && side === swingSide) ? o.w : 600;
        const cx = c.x + v.nx * side * (need / 2 + MH.Store.thickness(w) / 2);
        const cy = c.y + v.ny * side * (need / 2 + MH.Store.thickness(w) / 2);
        const zone = { x: cx, y: cy, w: o.w, d: need, rot: Math.atan2(v.dy, v.dx) * 180 / Math.PI };
        const zb = MH.G.aabb(MH.G.corners(cx, cy, o.w, need, zone.rot));
        const za = (zb.x2 - zb.x1) * (zb.y2 - zb.y1);
        state.items.forEach(it => {
          if (ghost(it) || isPassable(it)) return;
          if (wallBetween(state, cx, cy, it.x, it.y)) return;
          if (MH.G.rectsOverlap(zone, it)) {
            /* The corner of a cabinet clipping the very edge of an approach is
               not what stops the door opening. Something has to be in the way. */
            const ib = MH.G.aabb(MH.G.corners(it.x, it.y, it.w, it.d, it.rot || 0));
            if (za > 0 && overlapArea(zb, ib) / za < 0.04) return;
            out.push(issue('warn', 'Door swing is blocked',
              `${it.name} sits in the ${(isSwing && side === swingSide) ? 'swing' : 'approach'} of "${o.label || 'a door'}". A swing door needs its full leaf width clear on the side it opens to, and 600 mm to stand in on the other.`,
              [it.id, o.id], 'circulation'));
          }
        });
      });
    });
  }

  function checkClearances(state, out) {
    state.items.forEach(it => {
      const c = catOf(it);
      if (!c.clear || ghost(it)) return;
      const isBed = it.glyph === 'bed';
      const a = (it.rot || 0) * Math.PI / 180;

      const test = (offX, offY, w, d, label, need, sideways) => {
        const cx = it.x + (offX * Math.cos(a) - offY * Math.sin(a));
        const cy = it.y + (offX * Math.sin(a) + offY * Math.cos(a));
        const zone = { x: cx, y: cy, w, d, rot: it.rot || 0 };
        const zb = MH.G.aabb(MH.G.corners(cx, cy, w, d, it.rot));
        const za = (zb.x2 - zb.x1) * (zb.y2 - zb.y1);
        let hit = null;
        for (const other of state.items) {
          if (other.id === it.id || ghost(other) || isPassable(other)) continue;
          /* A bedside table belongs beside a bed; it is not an obstruction. */
          if (isBed && catOf(other).beside === 'bed') continue;
          /* Measure from the item, not from the zone: a clearance zone can
             legitimately straddle a wall, and what matters is whether the
             blocker is on the same side of it as the item. */
          if (wallBetween(state, it.x, it.y, other.x, other.y)) continue;
          if (!MH.G.rectsOverlap(zone, other)) continue;
          /* Something has to be standing in the space, not grazing the corner
             of it. A sofa 10 mm into the end of a dining chair's pull-out is
             not what stops you sitting down, and reporting it as though it
             were is how an advisor teaches you to ignore it. */
          const ob = MH.G.aabb(MH.G.corners(other.x, other.y, other.w, other.d, other.rot || 0));
          if (za > 0 && overlapArea(zb, ob) / za < 0.06) continue;
          hit = other; break;
        }
        let wallHit = null;
        if (!hit) {
          for (const w2 of state.walls) {
            if (w2.demolished) continue;
            if (za > 0 && overlapArea(zb, wallBox(w2)) / za > 0.25) {
              wallHit = { name: MH.Store.wallType(w2).name.toLowerCase(), id: w2.id };
              break;
            }
          }
        }
        /* A wall alongside something is usually deliberate (a bed or a sofa
           pushed against it). A wall in front of it is not. */
        if (!hit && wallHit && sideways && !c.clear.all) return;
        if (!hit && wallHit && sideways) {
          out.push(issue('tip', it.name + ' is hard against a wall',
            `There is ${mm(need)} of working space wanted ${label} and ${wallHit.name} there instead. Fine if that side is deliberate; awkward if two people use it.`,
            [it.id, wallHit.id], 'ergonomics'));
          return;
        }
        const blocker = hit || wallHit;
        if (blocker) {
          out.push(issue('warn', 'Not enough room to use it',
            `${it.name} wants ${mm(need)} clear ${label}, and ${blocker.name} is in the way.` + (c.note ? ' ' + c.note : ''),
            [it.id, blocker.id], 'ergonomics'));
        }
      };

      /* The foot of a bed is handled by checkBeds, with better wording. */
      if (c.clear.front && !isBed) test(0, it.d / 2 + c.clear.front / 2, it.w, c.clear.front, 'in front', c.clear.front, false);
      if (c.clear.sides) {
        test(-(it.w / 2 + c.clear.sides / 2), 0, c.clear.sides, it.d, 'on the left', c.clear.sides, true);
        test(it.w / 2 + c.clear.sides / 2, 0, c.clear.sides, it.d, 'on the right', c.clear.sides, true);
      }
      if (c.clear.all) {
        test(0, it.d / 2 + c.clear.all / 2, it.w, c.clear.all, 'behind', c.clear.all, false);
        test(0, -(it.d / 2 + c.clear.all / 2), it.w, c.clear.all, 'in front', c.clear.all, false);
        test(-(it.w / 2 + c.clear.all / 2), 0, c.clear.all, it.d, 'on the left', c.clear.all, true);
        test(it.w / 2 + c.clear.all / 2, 0, c.clear.all, it.d, 'on the right', c.clear.all, true);
      }
    });
  }

  function checkTV(state, out) {
    const tvs = state.items.filter(i => i.glyph === 'tv' && catOf(i).tv);
    const seats = state.items.filter(i => ['sofa', 'sofaL', 'sofaU', 'armchair'].includes(i.glyph));
    tvs.forEach(tv => {
      const diagMm = catOf(tv).tv * 25.4;
      /* Measure from where the room is actually watched from, which is the
         sofa. An occasional armchair pulled in at the side is not the viewing
         position, and judging a whole room by it condemns arrangements that
         are perfectly comfortable to sit in. */
      const inView = seats.filter(s => !wallBetween(state, s.x, s.y, tv.x, tv.y));
      const primary = inView.filter(s => s.glyph !== 'armchair');
      const pool = primary.length ? primary : inView;
      let nearest = null, nd = Infinity;
      pool.forEach(s => {
        const d = Math.hypot(s.x - tv.x, s.y - tv.y);
        if (d < nd) { nd = d; nearest = s; }
      });
      if (!nearest) {
        out.push(issue('tip', 'Nothing to watch it from',
          `${tv.name} has no seating facing it yet. At 4K the comfortable range is ${mm(diagMm * 1.2)} to ${mm(diagMm * 1.8)} from the screen.`, [tv.id], 'media'));
        return;
      }
      const lo = diagMm * 1.2, hi = diagMm * 1.8;
      if (nd < lo) {
        out.push(issue('warn', 'The TV is too big for the distance',
          `You are ${mm(nd)} from a ${catOf(tv).tv} inch screen. Comfortable is ${mm(lo)} to ${mm(hi)}. Either move the sofa back or drop to a ${Math.round(nd / 25.4 / 1.4)} inch screen.`,
          [tv.id, nearest.id], 'media'));
      } else if (nd > hi * 1.25) {
        const better = Math.round(nd / 25.4 / 1.5);
        out.push(issue('tip', 'You could go bigger',
          `At ${mm(nd)} away, a ${catOf(tv).tv} inch screen subtends a narrow angle. Up to about ${better} inches would still sit inside the recommended range.`,
          [tv.id], 'media'));
      }
    });
  }

  function checkSofaTable(state, out) {
    const sofas = state.items.filter(i => ['sofa', 'sofaL', 'sofaU'].includes(i.glyph));
    const tables = state.items.filter(i => ['coffeeTable', 'coffeeRound'].includes(i.glyph));
    sofas.forEach(s => {
      let nd = Infinity, best = null;
      tables.forEach(t => {
        if (wallBetween(state, s.x, s.y, t.x, t.y)) return;
        const d = Math.hypot(s.x - t.x, s.y - t.y) - (s.d + t.d) / 2;
        if (d < nd) { nd = d; best = t; }
      });
      if (!best) return;
      if (nd < 300) out.push(issue('warn', 'Coffee table too close to the sofa',
        `${mm(Math.max(0, nd))} between them. 400 to 450 mm is the sweet spot: close enough to reach a cup, far enough for shins.`, [s.id, best.id], 'ergonomics'));
      else if (nd > 700) out.push(issue('tip', 'Coffee table adrift',
        `${mm(nd)} from the sofa. Anything over about 550 mm and you have to stand up to reach it.`, [s.id, best.id], 'ergonomics'));
    });
  }

  function checkKitchen(state, out) {
    const hobs = state.items.filter(i => i.glyph === 'hob');
    /* The triangle is a property of one kitchen, so it is measured from the
       hob outwards and every leg has to stay inside that room, or at worst
       reach into a space the cook can walk to without opening a door. The
       utility sink out in the service yard is not the kitchen sink, and
       measuring to it turns a tidy galley into an eight metre hike. */
    const hob = hobs[0];
    const kitchen = hob ? roomOf(state, hob) : state.rooms.find(r => /kitchen/i.test(r.name));
    const reachable = it => {
      const r = roomOf(state, it);
      if (kitchen && r && r.id === kitchen.id) return true;              // same room, always
      if (!hob) return false;
      if (r && /yard|utility|bath|wc|shelter/i.test(r.name)) return false; // never the wet fringe
      return !wallBetween(state, hob.x, hob.y, it.x, it.y);              // open-plan kitchens
    };
    const nearestTo = (hx, hy) => (a, b) =>
      Math.hypot(a.x - hx, a.y - hy) - Math.hypot(b.x - hx, b.y - hy);
    const pick = pred => {
      const all = state.items.filter(pred);
      const ok = hob ? all.filter(reachable) : [];
      return (ok.length ? ok : []).sort(nearestTo(hob ? hob.x : 0, hob ? hob.y : 0))[0];
    };
    const s = pick(i => i.glyph === 'sink' || i.glyph === 'sinkDouble');
    const h = hob;
    const f = pick(i => i.glyph === 'fridge');
    if (!s || !h || !f) {
      if (state.rooms.some(r => /kitchen/i.test(r.name))) {
        out.push(issue('tip', 'Work triangle incomplete',
          'Put a sink, a hob and a fridge in the kitchen and the advisor will measure your work triangle. The classic target is a total of 3.6 to 8.0 m with no single leg under 1.2 m.', [], 'kitchen'));
      }
      return;
    }
    const a = Math.hypot(s.x - h.x, s.y - h.y), b = Math.hypot(h.x - f.x, h.y - f.y), c = Math.hypot(f.x - s.x, f.y - s.y);
    const total = a + b + c;
    const legs = [['sink to hob', a], ['hob to fridge', b], ['fridge to sink', c]];
    if (total > 8000) out.push(issue('warn', 'Work triangle too spread out',
      `Total ${mm(total)}. Over about 8 m and you walk more than you cook. Pull the fridge closer to the prep zone.`, [s.id, h.id, f.id], 'kitchen'));
    else if (total < 3600) out.push(issue('warn', 'Work triangle too tight',
      `Total ${mm(total)}. Under 3.6 m and two people cannot work without colliding.`, [s.id, h.id, f.id], 'kitchen'));
    else out.push(issue('good', 'Work triangle is well proportioned',
      `Total ${mm(total)} (${legs.map(l => l[0] + ' ' + mm(l[1])).join(', ')}). That sits inside the 3.6 to 8.0 m target.`, [s.id, h.id, f.id], 'kitchen'));

    legs.forEach(([name, d]) => {
      if (d < 1200) out.push(issue('warn', 'Work triangle leg is cramped',
        `${name} is only ${mm(d)}. Below 1.2 m there is no landing space between them.`, [], 'kitchen'));
    });

    /* Landing space beside the hob, measured only along the hob's own width
       axis. Measuring in every direction would flag the wall the hob backs
       onto, which is exactly where a hob is supposed to be. */
    hobs.forEach(hb => {
      const a = (hb.rot || 0) * Math.PI / 180;
      const ux = Math.cos(a), uy = Math.sin(a);       // hob's local +x in world
      let worst = Infinity, culprit = null;
      state.walls.forEach(w => {
        if (w.demolished) return;
        const v = MH.G.wallVec(w);
        /* only walls running across the hob, not behind it */
        if (Math.abs(v.ux * ux + v.uy * uy) > 0.3) return;
        const pr = MH.G.projectOnWall(w, hb.x, hb.y);
        if (pr.tRaw < -200 || pr.tRaw > MH.G.wallLen(w) + 200) return;
        const gap = pr.dist - MH.Store.thickness(w) / 2 - hb.w / 2;
        if (gap < worst) { worst = gap; culprit = w; }
      });
      if (isFinite(worst) && worst < 300 && worst > -100) {
        out.push(issue('warn', 'Hob too close to a side wall',
          `About ${mm(Math.max(0, worst))} of landing beside the hob. Keep 300 mm of non-combustible surface to the side; it is both a fire-safety norm and where the hot wok has to go.`,
          [hb.id, culprit && culprit.id].filter(Boolean), 'kitchen'));
      }
    });
  }

  function checkBeds(state, out) {
    state.items.filter(i => i.glyph === 'bed' && /bed/i.test(i.catId)).forEach(bed => {
      const a = (bed.rot || 0) * Math.PI / 180;
      const sides = [
        { name: 'left', dx: -(bed.w / 2 + 300), dy: 0, need: 600 },
        { name: 'right', dx: (bed.w / 2 + 300), dy: 0, need: 600 },
        { name: 'the foot', dx: 0, dy: (bed.d / 2 + 375), need: 750 }
      ];
      sides.forEach(s => {
        const cx = bed.x + (s.dx * Math.cos(a) - s.dy * Math.sin(a));
        const cy = bed.y + (s.dx * Math.sin(a) + s.dy * Math.cos(a));
        const zone = { x: cx, y: cy, w: s.name === 'the foot' ? bed.w : 600, d: s.name === 'the foot' ? 750 : bed.d, rot: bed.rot || 0 };
        let blocked = null;
        for (const other of state.items) {
          if (other.id === bed.id || ghost(other) || catOf(other).beside === 'bed') continue;
          if (['wardrobe', 'wardrobeSlide', 'box', 'desk', 'tallUnit', 'bookshelf'].includes(other.glyph) && MH.G.rectsOverlap(zone, other)) { blocked = other; break; }
        }
        const pts = MH.G.corners(cx, cy, zone.w, zone.d, zone.rot);
        if (!blocked) {
          for (const w of state.walls) {
            if (w.demolished) continue;
            let n = 0;
            for (const pt of pts) {
              const pr = MH.G.projectOnWall(w, pt.x, pt.y);
              if (pr.dist < MH.Store.thickness(w) / 2 && pr.tRaw > 0 && pr.tRaw < MH.G.wallLen(w)) n++;
            }
            if (n >= 3 && s.name !== 'left') { blocked = { name: 'the wall', id: w.id }; break; }
          }
        }
        if (blocked && s.name === 'the foot') {
          out.push(issue('warn', 'No room at the foot of the bed',
            `${blocked.name} leaves under 750 mm at the foot of the ${bed.name.toLowerCase()}. That is the width you need to walk round and to make the bed.`, [bed.id, blocked.id], 'ergonomics'));
        }
      });
    });
  }

  function checkPiano(state, out) {
    const pianos = state.items.filter(i => i.glyph === 'piano' || i.glyph === 'grandPiano');
    pianos.forEach(pn => {
      /* external wall proximity */
      let onExternal = false, extWall = null;
      state.walls.forEach(w => {
        if (w.demolished) return;
        if (!['rc', 'parapet'].includes(w.type)) return;
        const pr = MH.G.projectOnWall(w, pn.x, pn.y);
        if (pr.tRaw > -200 && pr.tRaw < MH.G.wallLen(w) + 200 && pr.dist < MH.Store.thickness(w) / 2 + Math.max(pn.d, pn.w) / 2 + 120) { onExternal = true; extWall = w; }
      });
      if (onExternal) {
        out.push(issue('warn', 'Piano against an external wall',
          'External walls in Singapore swing with the weather and can carry damp. Move it to an internal wall if you can, and keep it out of direct sun. Humidity swings, not playing, are what put a piano out of tune here.', [pn.id, extWall && extWall.id].filter(Boolean), 'wellbeing'));
      }
      /* aircon draught */
      const fcus = state.items.filter(i => i.glyph === 'fcu');
      fcus.forEach(f => {
        if (wallBetween(state, f.x, f.y, pn.x, pn.y)) return;
        const d = Math.hypot(f.x - pn.x, f.y - pn.y);
        if (d < 2500) out.push(issue('warn', 'Piano in the aircon draught',
          `The fan coil is ${mm(d)} away. A cold dry jet onto a soundboard is the fastest way to crack it. Aim for 2.5 m plus, or re-aim the louvres.`, [pn.id, f.id], 'wellbeing'));
      });
      /* window proximity */
      state.openings.filter(o => o.type === 'window').forEach(o => {
        const w = MH.Store.wall(o.wallId); if (!w) return;
        const c = MH.G.pointAlong(w, o.pos);
        const d = Math.hypot(c.x - pn.x, c.y - pn.y);
        if (d < 1500) out.push(issue('tip', 'Piano beside a window',
          'Direct equatorial sun will bleach the case and heat the strings unevenly. A sheer curtain solves it; so does turning the piano to face in.', [pn.id, o.id], 'wellbeing'));
      });
      out.push(issue('good', 'Piano needs a floor that will take it',
        `An upright is roughly 200 to 250 kg over about ${MH.U.area(pn.w * pn.d).sqm} m². HDB floor loading is 1.5 kN/m² (about 150 kg/m²) so spread it along a wall rather than concentrating it, and never on a raised platform without checking.`, [pn.id], 'wellbeing'));
    });
  }

  function checkFCU(state, out) {
    const fcus = state.items.filter(i => i.glyph === 'fcu');
    fcus.forEach(f => {
      /* What matters is not how close the fan coil is, it is whether it is
         pointing at you. A unit 1.5 m away blowing along the wall is fine;
         one 2.5 m away aimed at the pillow is not. */
      const a = (f.rot || 0) * Math.PI / 180;
      const fx = -Math.sin(a), fy = Math.cos(a);          // the throw direction
      state.items.filter(i => i.glyph === 'bed' || i.glyph === 'desk').forEach(target => {
        if (wallBetween(state, f.x, f.y, target.x, target.y)) return;
        const dx = target.x - f.x, dy = target.y - f.y;
        const d = Math.hypot(dx, dy) || 1;
        const aim = (dx / d) * fx + (dy / d) * fy;         // 1 = straight at it
        if (d < 2600 && aim > 0.72) {
          out.push(issue('warn', 'Aircon blowing straight onto the ' + target.name.toLowerCase(),
            `The fan coil is ${mm(d)} away and pointing at it. Turn the unit so the throw runs along the room rather than across a pillow or a desk chair. This is the commonest cause of a sore throat in a new flat.`,
            [f.id, target.id], 'comfort'));
        }
      });
    });
    const bedrooms = state.rooms.filter(r => /bedroom/i.test(r.name));
    bedrooms.forEach(r => {
      if (!itemsIn(state, r.id).some(i => i.glyph === 'fcu')) {
        out.push(issue('tip', 'No aircon shown in ' + r.name,
          'Add a fan coil so the bulkhead and trunking route can be planned before the joinery is drawn. Retro-fitting trunking through a finished wardrobe is a bad afternoon.', [r.id], 'services'));
      }
    });
  }

  function checkDaylight(state, out) {
    const winRooms = new Set();
    state.openings.filter(o => o.type === 'window').forEach(o => {
      const w = MH.Store.wall(o.wallId); if (!w || w.demolished) return;
      const c = MH.G.pointAlong(w, o.pos), v = MH.G.wallVec(w);
      [1, -1].forEach(side => {
        const r = MH.G.roomAt(state.rooms, c.x + v.nx * side * 400, c.y + v.ny * side * 400);
        if (r) winRooms.add(r.id);
      });
    });
    /* A room that is open to a daylit one is daylit. The dining bay of an
       open-plan living room has no window of its own and never will, and
       reporting it as dark is reporting the floor plan, not a problem. Two
       rooms count as open to each other when you can walk between them
       without passing through a wall. */
    const openTo = (a, b) => !wallBetween(state,
      (a.x1 + a.x2) / 2, (a.y1 + a.y2) / 2, (b.x1 + b.x2) / 2, (b.y1 + b.y2) / 2);
    state.rooms.forEach(r => {
      if (winRooms.has(r.id)) return;
      if (state.rooms.some(o => o.id !== r.id && winRooms.has(o.id) && openTo(r, o))) winRooms.add(r.id);
    });

    state.rooms.forEach(r => {
      if (r.protected) return;
      if (/passage|foyer|entrance|lobby|shelter|bath|wc|store/i.test(r.name)) return;
      if (!winRooms.has(r.id)) {
        out.push(issue('warn', r.name + ' has no daylight',
          'A habitable room with no window relies entirely on artificial light and will feel smaller than it is. If a wall between it and a daylit space is hackable, a glass partition or a high-level opening buys you the light without losing the separation.', [r.id], 'daylight'));
      }
    });
    const area = state.rooms.reduce((s, r) => s + MH.G.rectArea(r), 0);
    let glazing = 0;
    state.openings.filter(o => o.type === 'window').forEach(o => { glazing += o.w * (o.h || 1400); });
    const ratio = glazing / area;
    if (ratio < 0.10) out.push(issue('tip', 'Glazing is on the low side',
      `Window area is about ${(ratio * 100).toFixed(1)}% of floor area. Anything under 10% reads as dim; 15 to 20% is generous. You cannot enlarge an HDB window, but you can stop blocking the ones you have with tall joinery.`, [], 'daylight'));
  }

  function checkShelter(state, out) {
    const shelter = state.rooms.find(r => r.protected || /shelter/i.test(r.name));
    if (!shelter) return;
    const inside = itemsIn(state, shelter.id);
    const heavy = inside.filter(i => !isSoft(i) && ['wardrobe', 'wardrobeSlide', 'tallUnit', 'bookshelf', 'fridge'].includes(i.glyph));
    if (heavy.length) {
      out.push(issue('warn', 'Fixed joinery inside the household shelter',
        'You may use the shelter as a store, but nothing may be drilled, nailed or bonded to its walls, ceiling or door, and the ventilation openings must stay clear. Free-standing shelving only.', heavy.map(h => h.id), 'legal'));
    }
    out.push(issue('good', 'Household shelter is protected',
      'Under the Civil Defence Shelter Act the HS walls, slab, door and vents may not be altered, hacked, tiled over or penetrated. The app will not let you demolish them. Storage inside is fine; fixings are not.', [shelter.id], 'legal'));
  }

  function checkWetAreas(state, out) {
    state.rooms.forEach(r => {
      if (!r.wet) return;
      const m = MH.MATERIALS.find(x => x.id === r.floor);
      if (m && m.humidity <= 3 && /oak|cork|vinyl-spc/.test(m.id) === false) {
        out.push(issue('warn', 'Wrong floor for a wet area',
          `${r.name} is specified in ${m.name}. In a Singapore wet area you want a fully waterproof finish with a fall to the drain: large-format porcelain, terrazzo or a properly membraned microcement.`, [r.id], 'materials'));
      } else if (m && /engineered-oak|cork/.test(m.id)) {
        out.push(issue('error', 'Timber floor in a wet area',
          `${r.name} is set to ${m.name}. Timber and constant water do not coexist here. Change it to porcelain or terrazzo.`, [r.id], 'materials'));
      }
    });
  }

  function checkWalls(state, out) {
    const gone = state.walls.filter(w => w.demolished);
    if (gone.length) {
      const lm = gone.reduce((s, w) => s + MH.G.wallLen(w), 0);
      out.push(issue('good', gone.length + ' wall' + (gone.length > 1 ? 's' : '') + ' marked for demolition',
        `About ${mm(lm)} run. Every one of them is a non-structural partition, so this is permittable work. Budget for hacking, debris disposal, making good the floor and ceiling line, and re-screeding where the wall sat. HDB requires a registered renovation contractor and a permit; expect roughly S$60 to S$120 per metre run for hacking and disposal alone.`,
        gone.map(w => w.id), 'construction'));
    }
    const added = state.walls.filter(w => w.type === 'proposed');
    if (added.length) {
      out.push(issue('tip', added.length + ' new wall' + (added.length > 1 ? 's' : '') + ' proposed',
        'New partitions add dead load. HDB approves lightweight stud or aerated block far more readily than solid brickwork, and a stud wall is also what you want acoustically once you add insulation and double board.',
        added.map(w => w.id), 'construction'));
    }
  }

  function checkRoomSizes(state, out) {
    state.rooms.forEach(r => {
      const a = MH.G.rectArea(r) / 1e6;
      const w = Math.abs(r.x2 - r.x1), d = Math.abs(r.y2 - r.y1);
      const narrow = Math.min(w, d);
      if (/bedroom/i.test(r.name) && a < 7) {
        out.push(issue('warn', r.name + ' is tight',
          `${a.toFixed(1)} m². A bed plus a wardrobe plus a walkway wants about 8 m². Below 7 m² something has to be built in.`, [r.id], 'space'));
      }
      if (/living|dining/i.test(r.name) && narrow < 2600 && narrow > 0) {
        out.push(issue('warn', r.name + ' is narrow',
          `The short dimension is ${mm(narrow)}. Below about 2.8 m a sofa plus a walkway stops working; consider losing the wall on the long side.`, [r.id], 'space'));
      }
      if (/passage/i.test(r.name) && narrow < 900) {
        out.push(issue('warn', 'Corridor under 900 mm',
          `${mm(narrow)} clear. 900 mm is the comfortable minimum for one person, 1100 mm to pass someone, 1200 mm if you ever need a wheelchair.`, [r.id], 'circulation'));
      }
    });
  }

  function checkStyleCoherence(state, out) {
    const st = MH.STYLES.find(s => s.id === state.style);
    if (!st) return;
    const custom = state.items.filter(i => i.colour);
    const tones = new Set(custom.map(i => i.colour.toLowerCase()));
    if (tones.size > 5) {
      out.push(issue('tip', 'Colour is getting away from you',
        `${tones.size} custom colours in play. ${st.name} works on a 60/30/10 split: one dominant, one supporting, one accent. Try pulling everything back to the ${st.name} palette and re-adding just one accent.`, [], 'style'));
    }
    const woods = state.items.filter(i => ['wardrobe', 'bookshelf', 'sideboard', 'tableRect', 'tableRound', 'desk'].includes(i.glyph) && i.colour);
    if (new Set(woods.map(w => w.colour)).size > 2) {
      out.push(issue('tip', 'More than two timber tones',
        'Two is the working limit in one open space; three reads as accidental. Match the joinery to itself and let the floor be the different one.', [], 'style'));
    }
  }

  function checkStorage(state, out) {
    const floor = state.rooms.reduce((s, r) => s + MH.G.rectArea(r), 0);
    const storage = state.items
      .filter(i => ['wardrobe', 'wardrobeSlide', 'tallUnit', 'bookshelf', 'sideboard'].includes(i.glyph))
      .reduce((s, i) => s + i.w * i.d, 0);
    const pct = storage / floor * 100;
    if (pct < 8) out.push(issue('tip', 'Storage looks thin',
      `Enclosed storage is about ${pct.toFixed(1)}% of floor area. In a family flat with no basement and no loft, 12 to 15% is what stops the clutter reaching the surfaces.`, [], 'storage'));
    else out.push(issue('good', 'Storage ratio is healthy',
      `${pct.toFixed(1)}% of floor area is enclosed storage. 12 to 15% is the target for a family flat.`, [], 'storage'));
  }

  function checkHeavy(state, out) {
    state.items.filter(i => i.catId === 'aquarium').forEach(a => {
      out.push(issue('warn', 'Check the floor loading for the aquarium',
        `A ${mm(a.w)} tank with water and a cabinet runs to roughly 250 kg over ${MH.U.area(a.w * a.d).sqm} m², which is about ${Math.round(250 / (a.w * a.d / 1e6))} kg/m². HDB design loading is 150 kg/m² for residential floors. Run it along a wall, spanning several slab strips, and do not put it in the middle of a span.`, [a.id], 'structure'));
    });
  }

  /* ---------------------------------------------------------------- SCORES --- */
  function scores(state, issues) {
    const errs = issues.filter(i => i.level === 'error').length;
    const warns = issues.filter(i => i.level === 'warn').length;
    const byTag = t => issues.filter(i => i.tag === t && i.level !== 'good' && i.level !== 'tip').length;
    const clamp = v => Math.max(0, Math.min(100, Math.round(v)));
    return {
      overall: clamp(100 - errs * 14 - warns * 5),
      circulation: clamp(100 - byTag('circulation') * 18 - byTag('clash') * 12),
      ergonomics: clamp(100 - byTag('ergonomics') * 14),
      daylight: clamp(100 - byTag('daylight') * 20),
      compliance: clamp(100 - byTag('legal') * 40 - byTag('structure') * 20)
    };
  }

  /* HDB prints internal floor area measured from the centre-line of the walls,
     while the room rectangles here run to the printed structural grid. Half a
     wall all the way round the outline is the difference, and it is the
     difference between the 94.33 the rooms add up to and the 90 on the sheet.
     Showing the bigger number as though it were the flat's area would be
     flattering and wrong. */
  function centreLineArea(state) {
    const gross = state.rooms.reduce((s, r) => s + MH.G.rectArea(r), 0);
    const outer = state.walls.filter(w => !w.demolished && ['rc', 'parapet'].includes(w.type));
    const perim = outer.reduce((s, w) => s + MH.G.wallLen(w), 0);
    const t = outer.length ? outer.reduce((s, w) => s + MH.Store.thickness(w), 0) / outer.length : 200;
    return Math.max(0, gross - perim * t / 2);
  }

  function stats(state) {
    const gross = centreLineArea(state);
    const byRoom = state.rooms.map(r => ({
      id: r.id, name: r.name, num: r.num,
      w: Math.abs(r.x2 - r.x1), d: Math.abs(r.y2 - r.y1),
      area: MH.U.area(MH.G.rectArea(r)),
      floor: (MH.MATERIALS.find(m => m.id === r.floor) || {}).name || '—'
    })).sort((a, b) => (a.num || 99) - (b.num || 99));
    return {
      gross: MH.U.area(gross),
      rooms: byRoom,
      itemCount: state.items.length,
      wallsStanding: state.walls.filter(w => !w.demolished).length,
      wallsRemoved: state.walls.filter(w => w.demolished).length,
      ceiling: state.meta.ceiling
    };
  }

  /* ---------------------------------------------------------------- BUDGET --- */
  /* Indicative Singapore ranges, SGD. Renovation prices move; treat these as
     a way to compare options against each other, not as a quotation. */
  const COST = {
    perSqmFloor: { 'porcelain-lf': [90, 190], 'engineered-oak': [130, 270], 'vinyl-spc': [45, 95],
      'terrazzo': [270, 480], 'microcement': [215, 375], 'cork': [110, 175] },
    item: {
      sofa2: [900, 3500], sofa25: [1100, 4200], sofa3: [1400, 6000], sofa4: [1800, 8000],
      sofaL: [2200, 9000], sofaU: [3000, 12000], armchair: [400, 2800], loungechair: [900, 7000],
      'coffee-r': [250, 1800], 'coffee-o': [250, 1800], sidetable: [120, 800], console: [300, 1600],
      tvconsole: [400, 2600], 'rug-s': [200, 1400], 'rug-m': [350, 2400], 'rug-l': [500, 3200],
      'rug-round': [250, 1600], floorlamp: [120, 1400], arclamp: [300, 2200], pouffe: [120, 700],
      dine4: [400, 2500], dine6: [700, 4500], dine8: [1100, 7000], dine10: [1500, 9000],
      dineR4: [400, 2600], dineR6: [700, 4600], dineR8: [1000, 6500], dineR10: [1400, 9000],
      dinechair: [90, 700], bench: [180, 1100], sideboard: [500, 3200], bar2: [90, 600],
      island: [2200, 7000], 'island-l': [3000, 9500], 'island-brk': [3200, 10000], peninsula: [1600, 5000],
      base600: [1800, 5400], tall600: [700, 2200], tall1200: [1300, 4000],
      fridge2: [700, 2600], fridgeSbS: [1500, 6000], fridgeInt: [1800, 5000],
      hob60: [300, 1600], hob90: [500, 2600], hood: [400, 2600], sink1: [180, 1200], sink2: [280, 1800],
      oven: [600, 3500], ovencol: [1400, 6000], dishwasher: [700, 2800], winefridge: [500, 2500],
      wetkitchen: [2000, 5500], pantry: [1500, 5000],
      'bed-single': [300, 1600], 'bed-ss': [350, 1900], 'bed-queen': [600, 4500], 'bed-king': [800, 6000],
      'bed-bunk': [600, 2600], crib: [200, 1200], nightstand: [120, 900],
      wardrobe2: [900, 2600], wardrobe3: [1300, 3800], wardrobe4: [1700, 5200], wardrobeS: [2200, 6500],
      walkin: [3000, 11000], dresser: [300, 1800], vanity: [350, 2000], 'mirror-f': [120, 900],
      'bookshelf-200x120': [400, 2400], 'bookshelf-tall': [400, 2400], 'bookcase-s': [200, 1200],
      'shelf-open': [300, 1600], shoecab: [500, 2200], fullheight: [2400, 7000], storagebench: [200, 1200],
      altar: [500, 3000], 'sideboard-l': [700, 4000],
      wc: [250, 1600], 'wc-wall': [700, 3200], basin: [150, 900], 'vanity-b': [600, 2600],
      'vanity-d': [1200, 4500], shower: [500, 2600], 'shower-l': [700, 3400], bath: [700, 4000],
      'bath-free': [1500, 9000], towelrail: [60, 500],
      washer: [500, 2200], dryer: [500, 2200], washstack: [1200, 4200], laundry: [180, 700],
      'basin-u': [180, 900], heater: [300, 1200], db: [0, 0], bins: [80, 400], ironboard: [150, 800],
      tv43: [450, 1100], tv50: [600, 1600], tv55: [700, 2600], tv65: [1000, 4500],
      tv75: [1600, 7000], tv85: [2600, 12000], projector: [400, 4000], soundbar: [200, 2500],
      speaker: [300, 6000], 'piano-upright': [2500, 20000], 'piano-grand': [12000, 90000],
      digitalpiano: [700, 6000], guitar: [40, 300],
      'desk-s': [200, 1400], 'desk-m': [300, 2000], 'desk-l': [700, 3000], 'desk-L': [500, 3000],
      taskchair: [150, 2000], studytable: [180, 900], filing: [120, 700],
      'plant-s': [20, 120], 'plant-m': [50, 300], 'plant-l': [120, 700], planter: [200, 1400],
      greenwall: [1200, 6000], artwork: [100, 5000], aquarium: [600, 4000], 'mirror-w': [150, 1200],
      fcu: [900, 2200], 'fcu-cass': [1400, 3200], condenser: [1200, 3500], ceilingfan: [250, 1800],
      column: [0, 0], bulkhead: [300, 900], human: [0, 0]
    },
    work: {
      hackPerM: [60, 120],
      newWallPerM: [90, 190],
      paintPerSqm: [8, 22],
      electricalPoint: [70, 160],
      plumbingPoint: [180, 450],
      falseCeilingPerSqm: [45, 95]
    }
  };

  function budget(state) {
    const lines = [];
    let lo = 0, hi = 0;

    /* flooring */
    const byFloor = {};
    state.rooms.forEach(r => { byFloor[r.floor] = (byFloor[r.floor] || 0) + MH.G.rectArea(r) / 1e6; });
    Object.entries(byFloor).forEach(([id, sqm]) => {
      const rate = COST.perSqmFloor[id];
      const m = MH.MATERIALS.find(x => x.id === id);
      if (!rate || !m) return;
      const a = rate[0] * sqm, b = rate[1] * sqm;
      lines.push({ group: 'Finishes', name: m.name, qty: sqm.toFixed(1) + ' m²', lo: a, hi: b });
      lo += a; hi += b;
    });

    /* hacking + new walls */
    const hackM = state.walls.filter(w => w.demolished).reduce((s, w) => s + MH.G.wallLen(w), 0) / 1000;
    if (hackM > 0.1) {
      const a = hackM * COST.work.hackPerM[0], b = hackM * COST.work.hackPerM[1];
      lines.push({ group: 'Builder’s work', name: 'Hacking and debris disposal', qty: hackM.toFixed(1) + ' m', lo: a, hi: b });
      lo += a; hi += b;
    }
    const newM = state.walls.filter(w => w.type === 'proposed' && !w.demolished).reduce((s, w) => s + MH.G.wallLen(w), 0) / 1000;
    if (newM > 0.1) {
      const a = newM * COST.work.newWallPerM[0], b = newM * COST.work.newWallPerM[1];
      lines.push({ group: 'Builder’s work', name: 'New partitions', qty: newM.toFixed(1) + ' m', lo: a, hi: b });
      lo += a; hi += b;
    }

    /* items */
    const groups = {};
    state.items.forEach(it => {
      const rate = COST.item[it.catId];
      if (!rate || (!rate[0] && !rate[1])) return;
      const c = catOf(it);
      const g = (MH.CATEGORIES.find(x => x.id === c.cat) || {}).name || 'Other';
      groups[g] = groups[g] || {};
      const key = it.name;
      groups[g][key] = groups[g][key] || { n: 0, lo: 0, hi: 0 };
      groups[g][key].n++; groups[g][key].lo += rate[0]; groups[g][key].hi += rate[1];
    });
    Object.entries(groups).forEach(([g, items]) => {
      Object.entries(items).forEach(([name, v]) => {
        lines.push({ group: g, name, qty: v.n + ' no.', lo: v.lo, hi: v.hi });
        lo += v.lo; hi += v.hi;
      });
    });

    return { lines, lo: Math.round(lo), hi: Math.round(hi) };
  }

  /* ------------------------------------------------------------------ RUN --- */
  function run(state) {
    const out = [];
    try {
      checkOverlaps(state, out);
      checkItemsVsWalls(state, out);
      checkDoorApproach(state, out);
      checkClearances(state, out);
      checkTV(state, out);
      checkSofaTable(state, out);
      checkKitchen(state, out);
      checkBeds(state, out);
      checkPiano(state, out);
      checkFCU(state, out);
      checkDaylight(state, out);
      checkShelter(state, out);
      checkWetAreas(state, out);
      checkWalls(state, out);
      checkRoomSizes(state, out);
      checkStyleCoherence(state, out);
      checkStorage(state, out);
      checkHeavy(state, out);
    } catch (e) { console.error('advisor', e); }

    /* de-duplicate identical titles+detail */
    const seen = new Set();
    const issues = out.filter(i => { const k = i.level + i.title + i.detail; if (seen.has(k)) return false; seen.add(k); return true; });
    const order = { error: 0, warn: 1, tip: 2, good: 3 };
    issues.sort((a, b) => order[a.level] - order[b.level]);
    return { issues, scores: scores(state, issues), stats: stats(state), budget: budget(state) };
  }

  /* --------------------------------------------------------- AUTO LAYOUT --- */
  /* Rule-based, not AI. Places the usual suspects sensibly inside a room. */
  function suggestLayout(state, roomId) {
    const r = MH.Store.room(roomId); if (!r) return [];
    const w = Math.abs(r.x2 - r.x1), d = Math.abs(r.y2 - r.y1);
    const cx = (r.x1 + r.x2) / 2, cy = (r.y1 + r.y2) / 2;
    const add = [];
    const wide = w >= d;
    const name = r.name.toLowerCase();

    if (/living/.test(name)) {
      const sofaId = w > 4200 ? 'sofa3' : (w > 3400 ? 'sofa25' : 'sofa2');
      const sc = MH.Store.catalogById(sofaId);
      add.push({ catId: sofaId, x: cx, y: r.y2 - 350 - sc.d / 2, rot: 180 });
      add.push({ catId: 'coffee-r', x: cx, y: r.y2 - 350 - sc.d - 450 - 300, rot: 0 });
      const tvId = d > 4000 ? 'tv75' : (d > 3200 ? 'tv65' : 'tv55');
      add.push({ catId: 'tvconsole', x: cx, y: r.y1 + 300, rot: 0 });
      add.push({ catId: tvId, x: cx, y: r.y1 + 260, rot: 0 });
      add.push({ catId: 'rug-m', x: cx, y: cy + 200, rot: 0 });
      add.push({ catId: 'plant-m', x: r.x2 - 600, y: r.y1 + 600, rot: 0 });
    } else if (/dining/.test(name)) {
      const seats = w * d / 1e6 > 12 ? 'dineR8' : (w * d / 1e6 > 8 ? 'dineR6' : 'dine4');
      add.push({ catId: seats, x: cx, y: cy, rot: 0 });
      add.push({ catId: 'sideboard', x: cx, y: r.y1 + 300, rot: 0 });
    } else if (/master bedroom/.test(name)) {
      add.push({ catId: 'bed-queen', x: cx, y: r.y1 + 400 + 950, rot: 0 });
      add.push({ catId: 'nightstand', x: cx - 1000, y: r.y1 + 600, rot: 0 });
      add.push({ catId: 'nightstand', x: cx + 1000, y: r.y1 + 600, rot: 0 });
      add.push({ catId: 'wardrobeS', x: cx, y: r.y2 - 400, rot: 180 });
    } else if (/bedroom/.test(name)) {
      const bed = w * d / 1e6 > 9 ? 'bed-queen' : 'bed-ss';
      add.push({ catId: bed, x: r.x2 - 700, y: cy, rot: 90 });
      add.push({ catId: 'wardrobe3', x: r.x1 + 900, y: r.y1 + 400, rot: 0 });
      add.push({ catId: 'desk-s', x: r.x1 + 900, y: r.y2 - 400, rot: 180 });
    } else if (/kitchen/.test(name)) {
      add.push({ catId: 'base600', x: cx, y: r.y2 - 350, rot: 0, w: Math.min(w - 400, 3000) });
      add.push({ catId: 'sink2', x: cx - 700, y: r.y2 - 350, rot: 0 });
      add.push({ catId: 'hob60', x: cx + 700, y: r.y2 - 350, rot: 0 });
      add.push({ catId: 'fridge2', x: r.x1 + 500, y: r.y1 + 450, rot: 180 });
      if (Math.min(w, d) > 3400) add.push({ catId: 'island', x: cx, y: cy, rot: 0 });
    } else if (/bathroom/.test(name)) {
      add.push({ catId: 'wc', x: r.x1 + 500, y: r.y2 - 500, rot: 0 });
      add.push({ catId: 'vanity-b', x: cx, y: r.y1 + 300, rot: 0 });
      add.push({ catId: 'shower', x: r.x2 - 550, y: r.y2 - 550, rot: 0 });
    } else if (/study|work/.test(name)) {
      add.push({ catId: 'desk-m', x: cx, y: r.y1 + 400, rot: 0 });
      add.push({ catId: 'taskchair', x: cx, y: r.y1 + 1100, rot: 0 });
      add.push({ catId: 'bookshelf-200x120', x: cx, y: r.y2 - 250, rot: 180 });
    }
    return add;
  }

  return { run, suggestLayout, COST };
})();
