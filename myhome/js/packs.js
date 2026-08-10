/* =============================================================================
   MyHome — furnishing packs
   -----------------------------------------------------------------------------
   Whole-flat layouts you can drop in with one click, and empty again with
   another. These are generated from the room geometry rather than stored as
   fixed coordinates, so they still work after you have moved a wall.

   Rotation convention, same as everywhere else in the app: an item faces its
   own local +y. So rot 0 faces south, 90 faces west, 180 faces north, 270
   faces east. `against(box, 'n', ...)` therefore returns rot 0: the item's
   back is on the north wall and it looks into the room.
   ========================================================================== */
window.MH = window.MH || {};

MH.PACKS = [
  { id: 'family',  name: 'Family of four',
    note: 'Three beds, a table for four, a proper sofa and somewhere to put the shoes.' },
  { id: 'minimal', name: 'Just the essentials',
    note: 'Somewhere to sleep, somewhere to sit, somewhere to eat. Nothing else.' },
  { id: 'wfh',     name: 'Two people working from home',
    note: 'A desk in the main bedroom and in Bedroom 2, and a smaller dining table to make room.' },
  { id: 'music',   name: 'Music at the centre',
    note: 'The upright piano gets the long internal wall, with the seating turned to face into the room.' },
  { id: 'guests',  name: 'Couple who entertain',
    note: 'A six-seat table, a bigger sofa, a bigger screen, and Bedroom 3 kept as a guest room.' }
];

MH.Packs = (function () {
  const cat = id => MH.Store.catalogById(id);

  /* Usable rectangle: the room less an approximation of the wall faces. */
  function box(r, inset) {
    inset = inset === undefined ? 100 : inset;
    return {
      x1: Math.min(r.x1, r.x2) + inset, y1: Math.min(r.y1, r.y2) + inset,
      x2: Math.max(r.x1, r.x2) - inset, y2: Math.max(r.y1, r.y2) - inset
    };
  }
  const W = b => b.x2 - b.x1;
  const D = b => b.y2 - b.y1;

  /* Put an item against one edge, looking into the room.
     `along` is 0..1 across that edge; `gap` pushes it off the wall. */
  function against(b, edge, catId, along, gap, over) {
    const c = cat(catId); if (!c) return null;
    along = along === undefined ? 0.5 : along;
    gap = gap || 0;
    const w = (over && over.w) || c.w, d = (over && over.d) || c.d;
    let x, y, rot;
    if (edge === 'n')      { rot = 0;   x = b.x1 + W(b) * along; y = b.y1 + gap + d / 2; }
    else if (edge === 's') { rot = 180; x = b.x1 + W(b) * along; y = b.y2 - gap - d / 2; }
    else if (edge === 'w') { rot = 270; x = b.x1 + gap + d / 2;  y = b.y1 + D(b) * along; }
    else                   { rot = 90;  x = b.x2 - gap - d / 2;  y = b.y1 + D(b) * along; }
    return Object.assign({ catId, x: Math.round(x), y: Math.round(y), rot }, over || {});
  }
  /* Free-standing: not against a wall, so the resolver may nudge it in any
     direction rather than sliding it along a wall it is not on. */
  function at(catId, x, y, rot, over) {
    return Object.assign({ catId, x: Math.round(x), y: Math.round(y), rot: rot || 0, _free: true }, over || {});
  }

  /* Which edge of a room backs onto an internal wall rather than the facade?
     Used for the piano, and for anything else that should not sit on an
     external wall. Falls back to north. */
  function internalEdge(state, r) {
    const mid = { x: (r.x1 + r.x2) / 2, y: (r.y1 + r.y2) / 2 };
    const edges = [
      ['n', mid.x, Math.min(r.y1, r.y2)],
      ['s', mid.x, Math.max(r.y1, r.y2)],
      ['w', Math.min(r.x1, r.x2), mid.y],
      ['e', Math.max(r.x1, r.x2), mid.y]
    ];
    for (const [e, x, y] of edges) {
      const hit = state.walls.find(w => !w.demolished &&
        MH.G.projectOnWall(w, x, y).dist < MH.Store.thickness(w) / 2 + 60);
      if (hit && !['rc', 'parapet'].includes(hit.type)) return e;
    }
    return 'n';
  }

  /* ------------------------------------------------------------ FITTING ---
     Every room generator faces the same question: of the arrangements that
     will physically go in, which one leaves the room usable? Encoding that
     as rules produced a stack that fixed one room and broke the next, so
     the generators propose arrangements instead and this scores them.
     Lower is better. The weights are an argument about what a room is for:
     you must be able to get in, open what opens, and walk round the rest. */
  function scorer(state, room) {
    const zones = doorZones(state);
    const wins = windowBoxes(state);
    const rb = box(room, 40);

    function rect(it) {
      const c = cat(it.catId) || {};
      return { x: it.x, y: it.y, w: it.w || c.w, d: it.d || c.d, rot: it.rot || 0 };
    }
    /* How far a rectangle sticks out past where it is allowed to be. */
    function outside(r) {
      const bb = MH.G.aabb(MH.G.corners(r.x, r.y, r.w, r.d, r.rot));
      return Math.max(0, rb.x1 - bb.x1) + Math.max(0, bb.x2 - rb.x2) +
             Math.max(0, rb.y1 - bb.y1) + Math.max(0, bb.y2 - rb.y2);
    }
    return function penalty(items) {
      const live = items.filter(it => cat(it.catId) && isSolid(it));
      const rs = live.map(rect);
      let p = 0;
      rs.forEach((r, i) => {
        p += outside(r) * 40;                                        // through a wall
        /* How much of the doorway is blocked, not merely whether anything
           touches it. Clipping the far corner of an approach costs almost
           nothing; standing in the middle of it costs more than any clash. */
        zones.forEach(z => { p += 13000 * Math.min(1, overlap(r, z) / areaOf(z)); });
        for (let j = i + 1; j < rs.length; j++)
          if (MH.G.rectsOverlap(r, rs[j])) p += 20000;               // on top of each other
        /* Tall things should not stand in front of the only window. */
        if ((cat(live[i].catId).h || 0) > 1000) wins.forEach(w => { if (MH.G.rectsOverlap(r, w)) p += 700; });
      });
      live.forEach((owner, i) => clearZones(owner).forEach(z => {
        p += outside(z) * (z.sideways ? 4 : 25);                     // working space inside a wall
        rs.forEach((r, j) => { if (i !== j && MH.G.rectsOverlap(z, r)) p += 9000; });
      }));
      return p;
    };
  }

  /* Try every arrangement `build` can make from `opts` and keep the best.
     `opts` is a list of option-lists; build receives one pick from each.
     `extra` adds a quality term on top of the failure score, so a room can
     say what it wants as well as what it will not tolerate. Keep those terms
     well under the 9000 a real clash costs, or a merely nice arrangement
     will beat a usable one. */
  function bestOf(penalty, opts, build, base, extra) {
    let best = null;
    const walk = (i, picks) => {
      if (i === opts.length) {
        const items = build.apply(null, picks);
        if (!items) return;
        const p = penalty((base || []).concat(items)) + (extra ? extra(items, picks) : 0);
        if (!best || p < best.p) best = { p, items, picks: picks.slice() };
        return;
      }
      opts[i].forEach(o => walk(i + 1, picks.concat([o])));
    };
    walk(0, []);
    return best;
  }

  /* ------------------------------------------------------------- ROOMS --- */

  function living(state, room, b, pack, internal) {
    internal = internal || 'n';
    const penalty = scorer(state, room);
    const wide = W(b) >= D(b);
    /* Biggest first: a sofa that will not go in loses to one that will. */
    const sofaIds = pack === 'minimal' ? ['sofa25', 'sofa2']
      : pack === 'guests' ? ['sofa4', 'sofa3', 'sofa25'] : ['sofa3', 'sofa25', 'sofa2'];
    const tvId = pack === 'minimal' ? 'tv43' : (pack === 'guests' ? 'tv65' : 'tv55');

    /* Pick the table from the room, then give its end of the room the space
       it actually needs. Splitting by a fixed percentage produced a dining
       zone you could not pull a chair out in. */
    const area = W(b) * D(b) / 1e6;
    const tableId = pack === 'guests' && area > 14 ? 'dineR6'
      : pack === 'wfh' || pack === 'minimal' ? 'dine4'
        : area > 15 ? 'dine6' : 'dine4';
    const t = cat(tableId), GAP = 900;
    const along = wide ? W(b) : D(b);
    const dineLen = Math.min(along * 0.42, Math.max(t.w, t.d) + 900);
    const cut = along - GAP - dineLen;      // where the seating zone ends

    /* Which end takes the seating is itself a choice: the dining table is the
       one that wants to be near the kitchen, but only the doors know where
       that is, so try both ends and score them. */
    const zoneAt = (from, len) => wide
      ? { x1: b.x1 + from, y1: b.y1, x2: b.x1 + from + len, y2: b.y2 }
      : { x1: b.x1, y1: b.y1 + from, x2: b.x2, y2: b.y1 + from + len };

    /* The defining pieces go down together, because they constrain each other:
       where the sofa faces decides where the screen goes, and how the table
       turns decides whether a chair can come out. */
    /* What a good living room is, over and above one that merely fits: the
       sofa is as big as the room will take, and it sits the right distance
       from the screen. 1.5 diagonals is the middle of the comfortable band. */
    const wantDist = cat(tvId).tv * 25.4 * 1.5;
    const biggest = cat(sofaIds[0]).w;
    const quality = (items, picks) => {
      const dist = Math.hypot(items[0].x - items[1].x, items[0].y - items[1].y);
      return Math.abs(dist - wantDist) * 1.1 + (biggest - cat(picks[0]).w) * 2.2;
    };

    const best = bestOf(penalty,
      [sofaIds, [0, 1], ['w', 'e', 'n', 's'], [0.5, 0.3, 0.7], [0.5, 0.3, 0.7], [0.5, 0.7], [0, 90]],
      (sofaId, flip, sofaEdge, sAlong, cAlong, tAlong, tRot) => {
        const seat = flip ? zoneAt(along - cut, cut) : zoneAt(0, cut);
        const dine = flip ? zoneAt(0, dineLen) : zoneAt(along - dineLen, dineLen);
        const opp = { n: 's', s: 'n', w: 'e', e: 'w' }[sofaEdge];
        /* The screen has to have somewhere to go, so the sofa cannot sit on
           an edge whose opposite number is right behind it. */
        if ((['n', 's'].includes(sofaEdge) ? D(seat) : W(seat)) < 1900) return null;
        const items = [
          against(seat, sofaEdge, sofaId, sAlong, 0),
          against(seat, opp, 'tvconsole', cAlong, 0)
        ];
        if (!items[0] || !items[1]) return null;
        items.push(at(tableId,
          dine.x1 + W(dine) * (wide ? tAlong : 0.5),
          dine.y1 + D(dine) * (wide ? 0.5 : tAlong), tRot));
        return items;
      }, null, quality);
    if (!best) return [];
    const [sofa, con] = best.items;
    const out = best.items.slice();

    /* The screen sits just in front of its console, and is sized to the
       distance it will actually be watched from rather than to the budget.
       A 65 inch screen 1.6 m from the sofa is a headache, not a treat. The
       distance is measured to the screen, not to the console it stands on,
       which is the same measurement the advisor will take. */
    const push = (cat('tvconsole').d / 2) - 30;
    const tv = { catId: tvId, rot: con.rot, x: con.x, y: con.y };
    if (con.rot === 90) tv.x = con.x + push;
    else if (con.rot === 270) tv.x = con.x - push;
    else if (con.rot === 180) tv.y = con.y + push;
    else tv.y = con.y - push;
    const dist = Math.hypot(sofa.x - tv.x, sofa.y - tv.y);
    const capIn = cat(tvId).tv;
    const fits = MH.CATALOG.filter(c => c.tv && c.tv <= capIn && c.tv * 25.4 * 1.2 <= dist)
      .sort((a, c) => c.tv - a.tv);
    tv.catId = (fits[0] || MH.CATALOG.filter(c => c.tv).sort((a, c) => a.tv - c.tv)[0]).id;
    out.push(tv);

    /* Everything below is optional: it goes in only if it does not make the
       room worse. `face` is the direction the sofa is looking. */
    const fa = (sofa.rot || 0) * Math.PI / 180;
    const face = { x: -Math.sin(fa), y: Math.cos(fa) };
    const add = (items) => { if (penalty(out.concat(items)) <= best.p) items.forEach(i => out.push(i)); };

    /* Coffee table: measured off the front of the sofa, not the middle of
       the room, because 400 to 450 mm from the seat is the whole point of it. */
    const cofId = pack === 'music' ? 'coffee-o' : 'coffee-r';
    const cof = cat(cofId), sofaC = cat(best.picks[0]);
    const reach = sofaC.d / 2 + 430 + cof.d / 2;
    const rugRot = ['n', 's'].includes(best.picks[2]) ? 90 : 0;
    add([at(Math.min(W(b), D(b)) > 2600 ? 'rug-m' : 'rug-s',
      sofa.x + face.x * (reach + 200), sofa.y + face.y * (reach + 200), rugRot)]);
    if (pack !== 'minimal') add([at(cofId, sofa.x + face.x * reach, sofa.y + face.y * reach, sofa.rot)]);

    /* The piano must not go on an external wall: Singapore facades move with
       the weather and carry damp. `internalEdge` is worked out from the walls,
       so this holds up even after you have moved one. */
    if (pack === 'music') {
      /* The other edges are only a fallback. Costing them 6000 keeps the piano
         off the facade unless the internal wall is genuinely impossible, since
         a real clash costs 9000 and would still win. */
      const pick = bestOf(penalty, [[internal, 'n', 's', 'w', 'e'], [0.3, 0.5, 0.15, 0.7, 0.85]],
        (e, a) => [against(b, e, 'piano-upright', a, 0)], out,
        (items, picks) => picks[0] === internal ? 0 : 6000);
      if (pick && pick.p < 9000) out.push(pick.items[0]);
      /* A listening chair, turned in towards the room rather than the wall. */
      const chair = bestOf(penalty, [['n', 's', 'w', 'e'], [0.8, 0.2, 0.5]],
        (e, a) => [against(b, e, 'armchair', a, 200)], out);
      if (chair && chair.p < 9000) out.push(chair.items[0]);
    }
    return out.filter(Boolean);
  }

  /* A bedroom is the hardest room to place by rule, because the bed and the
     wardrobe both want the same 900 mm of floor and an HDB bedroom rarely has
     it twice over. Every extra rule fixed one room and broke another, so this
     searches instead: it lays out every sensible bed-and-wardrobe pairing,
     measures which one leaves the room genuinely usable, and keeps the best.
     Roughly a hundred candidates per room, each a handful of rectangle tests. */
  function bedroom(state, room, b, pack, isMain) {
    const bedId = isMain ? 'bed-queen' : (pack === 'minimal' ? 'bed-single' : 'bed-ss');
    const wardId = pack === 'minimal' ? 'wardrobe2' : 'wardrobe3';
    const bed = cat(bedId), ward = cat(wardId);
    if (!bed || !ward) return [];

    const zones = doorZones(state);
    const wins = windowBoxes(state);
    const rb = box(room, 40);                 // where furniture is allowed to be
    const EDGES = ['n', 's', 'w', 'e'];

    function rect(it) {
      const c = cat(it.catId) || {};
      return { x: it.x, y: it.y, w: it.w || c.w, d: it.d || c.d, rot: it.rot || 0 };
    }
    function outside(r) {
      const bb = MH.G.aabb(MH.G.corners(r.x, r.y, r.w, r.d, r.rot));
      return Math.max(0, rb.x1 - bb.x1) + Math.max(0, bb.x2 - rb.x2) +
             Math.max(0, rb.y1 - bb.y1) + Math.max(0, bb.y2 - rb.y2);
    }

    /* Lower is better. The weights say what a bedroom is for: you must be able
       to get in, open the wardrobe, and walk round the bed, in that order. */
    function penalty(items) {
      let p = 0;
      const rs = items.map(rect);
      const cz = items.flatMap(it => clearZones(it).map(z => ({ z, owner: it })));
      rs.forEach(r => {
        p += outside(r) * 40;                                     // through a wall
        zones.forEach(z => { if (MH.G.rectsOverlap(r, z)) p += 12000; });   // in a doorway
      });
      for (let i = 0; i < rs.length; i++)
        for (let j = i + 1; j < rs.length; j++)
          if (MH.G.rectsOverlap(rs[i], rs[j])) p += 20000;        // on top of each other
      cz.forEach(({ z, owner }) => {
        p += outside(z) * 25;                                     // working space inside a wall
        items.forEach((it, k) => { if (it !== owner && MH.G.rectsOverlap(z, rs[k])) p += 9000; });
      });
      /* Preferences, an order of magnitude below the hard failures. */
      const wr = rs[1];
      wins.forEach(w => { if (MH.G.rectsOverlap(wr, w)) p += 700; });   // wardrobe over a window
      zones.forEach(z => { if (MH.G.rectsOverlap(rs[0], z)) p += 400; });
      return p;
    }

    let best = null;
    const alongs = [0.5, 0.18, 0.82, 0.3, 0.7];
    EDGES.forEach(head => EDGES.forEach(wEdge => {
      if (wEdge === head) return;                 // never share the headboard wall
      alongs.forEach(ba => alongs.forEach(wa => {
        const items = [against(b, head, bedId, ba, 0), against(b, wEdge, wardId, wa, 0)];
        if (!items[0] || !items[1]) return;
        const p = penalty(items);
        if (!best || p < best.p) best = { p, items, head, wEdge, ba };
      }));
    }));
    if (!best) return [];
    const out = best.items.slice();
    const bedIt = out[0];

    /* A nightstand only earns its place if it fits beside the head without
       eating the walking side of the bed. */
    if (isMain) {
      const ns = cat('nightstand');
      const side = ['n', 's'].includes(best.head) ? 'x' : 'y';
      [1, -1].forEach(dir => {
        if (out.length > 2) return;               // one is enough
        const c = Object.assign({}, bedIt, { catId: 'nightstand', w: ns.w, d: ns.d });
        const off = bed.w / 2 + ns.w / 2 + 40;
        if (side === 'x') { c.x = bedIt.x + dir * off; c.y = bedIt.y - (bedIt.d - ns.d) / 2 * (best.head === 'n' ? -1 : 1); }
        else { c.y = bedIt.y + dir * off; c.x = bedIt.x - (bedIt.w - ns.w) / 2 * (best.head === 'w' ? -1 : 1); }
        if (penalty(out.concat([c])) <= best.p) out.push(c);
      });
    }

    /* A desk needs 900 mm of chair room behind it. Try every remaining wall
       and keep it only if one of them can actually give it. */
    if (pack === 'wfh') {
      let pick = null;
      EDGES.forEach(e => {
        if (e === best.head || e === best.wEdge) return;
        [0.5, 0.22, 0.78].forEach(a => {
          const d = against(b, e, 'desk-s', a, 0);
          if (!d) return;
          const p = penalty(out.concat([d]));
          if (p <= best.p && (!pick || p < pick.p)) pick = { p, d };
        });
      });
      if (pick) out.push(pick.d);
    }

    /* The fan coil goes high on a wall and must throw *across* the room, never
       down the length of the bed onto a pillow or into the back of a chair.
       So it is scored on aim, the same test the advisor will apply. */
    const targets = out.filter(it => /bed|desk/.test(it.catId));
    let fcuBest = null;
    EDGES.forEach(e => [0.5, 0.15, 0.85].forEach(a => {
      const f = against(b, e, 'fcu', a, 0); if (!f) return;
      const ang = (f.rot || 0) * Math.PI / 180;
      const fx = -Math.sin(ang), fy = Math.cos(ang);
      let worst = 0;
      targets.forEach(t => {
        const dx = t.x - f.x, dy = t.y - f.y, dist = Math.hypot(dx, dy) || 1;
        const aim = (dx / dist) * fx + (dy / dist) * fy;
        if (dist < 2600) worst = Math.max(worst, aim);
      });
      if (!fcuBest || worst < fcuBest.worst) fcuBest = { worst, f };
    }));
    if (fcuBest) out.push(fcuBest.f);
    return out.filter(Boolean);
  }

  function kitchen(state, room, b, pack) {
    const penalty = scorer(state, room);
    const out = [];
    /* Which wall the run goes on is not a matter of taste: a galley run needs
       an unbroken length of wall, and in this flat the obvious one is mostly
       a 1890 opening into the dining bay. So try all four and measure. */
    const pick = bestOf(penalty, [['n', 's', 'w', 'e'], [0.5, 0.35, 0.65]], (e, a) => {
      const along = ['n', 's'].includes(e) ? W(b) : D(b);
      const len = Math.min(along - 300, 3600);
      if (len < 1800) return null;
      return [against(b, e, 'base600', a, 0, { w: len })];
    });
    if (!pick) return [];
    const runEdge = pick.picks[0];
    const oppEdge = { n: 's', s: 'n', w: 'e', e: 'w' }[runEdge];
    const tall = ['w', 'e'].includes(runEdge);
    const runLen = Math.min((tall ? D(b) : W(b)) - 300, 3600);
    out.push(pick.items[0]);
    const run = out[0];
    const half = runLen / 2;
    /* Sink and hob need at least 1.2 m between centres, which is where the
       draining board and the chopping board live. Kitchen fitters aim for
       about 1.4 m. Below that you are washing and frying in the same square
       foot, and the advisor is right to complain. */
    const slack = half - Math.max(cat('sink2').w, cat('hob60').w) / 2 - 60;
    const sep = Math.min(Math.max(1200, runLen * 0.45), 1600, slack * 2);
    const off = d => tall ? { x: run.x, y: run.y + d } : { x: run.x + d, y: run.y };
    const s = off(-sep / 2), h = off(sep / 2);
    out.push(at('sink2', s.x, s.y, run.rot));
    out.push(at('hob60', h.x, h.y, run.rot));
    out.push(at('hood', h.x, h.y, run.rot));
    const fridge = bestOf(penalty, [[oppEdge, runEdge], [0.28, 0.1, 0.5, 0.85]],
      (e, a) => [against(b, e, 'fridge2', a, 0)], out);
    if (fridge) out.push(fridge.items[0]);
    if ((tall ? D(b) : W(b)) > 3000) {
      const base = penalty(out);
      const tallU = bestOf(penalty, [[oppEdge, runEdge, 'n', 's', 'w', 'e'], [0.72, 0.9, 0.5, 0.15, 0.3]],
        (e, a) => [against(b, e, 'tall1200', a, 0)], out);
      if (tallU && tallU.p <= base) out.push(tallU.items[0]);
    }
    if (pack === 'guests' && Math.min(W(b), D(b)) > 3600) out.push(at('island', (b.x1 + b.x2) / 2, (b.y1 + b.y2) / 2, 0));
    return out.filter(Boolean);
  }

  /* A dining bay that is its own room rather than one end of the living room:
     a table, and a sideboard if the walls will take one. */
  function dining(state, room, b, pack) {
    const penalty = scorer(state, room);
    const id = pack === 'minimal' || pack === 'wfh' ? 'dine4' : (pack === 'guests' ? 'dineR6' : 'dine6');
    const pick = bestOf(penalty, [[id, 'dine4'], [0, 90], [0.5, 0.4, 0.6]],
      (t, rot, a) => [at(t, b.x1 + W(b) * a, b.y1 + D(b) * 0.5, rot)]);
    if (!pick) return [];
    const out = [pick.items[0]];
    const side = bestOf(penalty, [['n', 's', 'w', 'e'], [0.5, 0.2, 0.8]],
      (e, a) => [against(b, e, 'sideboard', a, 0)], out);
    if (side && side.p <= pick.p) out.push(side.items[0]);
    return out.filter(Boolean);
  }

  function bathroom(b) {
    const tall = D(b) >= W(b);
    return [
      against(b, tall ? 's' : 'e', 'wc', 0.2, 0),
      against(b, tall ? 'n' : 'w', 'basin', 0.75, 0),
      against(b, tall ? 'n' : 'w', 'shower', 0.75, cat('basin').d + 150)
    ].filter(Boolean);
  }

  /* A service yard is small, has a door at each end and a 1 m standing space
     in front of the machine, so which wall the washer goes on is not a
     preference, it is the whole problem. */
  function yard(state, room, b) {
    const penalty = scorer(state, room);
    const EDGES = ['n', 's', 'w', 'e'];
    const out = [];
    const wash = bestOf(penalty, [EDGES, [0.8, 0.5, 0.2, 0.9]],
      (e, a) => [against(b, e, 'washstack', a, 0)]);
    if (wash) out.push(wash.items[0]);
    const sink = bestOf(penalty, [EDGES, [0.2, 0.5, 0.8, 0.1]],
      (e, a) => [against(b, e, 'basin-u', a, 0)], out);
    if (sink) out.push(sink.items[0]);
    /* Ceiling rack: overhead, so it only has to fit. It is 1800 long and a
       Singapore service yard is often narrower than that, so it runs with the
       room rather than across it. */
    out.push(at('laundry', (b.x1 + b.x2) / 2, (b.y1 + b.y2) / 2, W(b) >= D(b) ? 0 : 90));
    return out.filter(Boolean);
  }

  /* An HDB foyer is mostly doorway. Between the front door, the shelter door
     and the two openings there is often no run of wall long enough for a full
     1200 shoe cabinet, so try the narrow one before giving up on shoes. */
  function entrance(state, room, b) {
    const penalty = scorer(state, room);
    const pick = bestOf(penalty, [['shoecab', 'shoecab-s'], ['n', 's', 'w', 'e'], [0.5, 0.15, 0.85, 0.3, 0.7]],
      (id, e, a) => [against(b, e, id, a, 0)]);
    return pick && pick.p < 9000 ? pick.items : [];
  }

  /* ------------------------------------------------------------- BUILD --- */

  function forRoom(state, room, packId) {
    const b = box(room);
    if (W(b) < 700 || D(b) < 700) return [];
    const n = (room.name || '').toLowerCase();
    /* Dining before living: this flat has a dining bay that is its own room,
       and running the living-room generator on it produces a second sofa and
       a second television. */
    if (/^dining/.test(n))           return dining(state, room, b, packId);
    if (/living|dining/.test(n))     return living(state, room, b, packId, internalEdge(state, room));
    if (/main bedroom/.test(n))      return bedroom(state, room, b, packId, true);
    if (/bedroom|study/.test(n))     return bedroom(state, room, b, packId, false);
    if (/kitchen/.test(n))           return kitchen(state, room, b, packId);
    if (/bath|wc|toilet/.test(n))    return bathroom(b);
    if (/yard|utility/.test(n))      return yard(state, room, b);
    if (/entrance|foyer/.test(n))    return entrance(state, room, b);
    return [];   // passage, shelter, store: deliberately left empty
  }

  /* Whole flat. Bedroom 3 is left as a guest room in the entertaining pack,
     which means a bed and a wardrobe and nothing else. */
  function forFlat(state, packId) {
    const out = [];
    state.rooms.forEach(r => {
      if (r.protected) return;
      /* Remember which room each piece was generated for. Without this the
         resolver has no idea where a thing belongs, and a dining table that
         cannot find space slides out into the passage, or off the plan. */
      forRoom(state, r, packId).forEach(it => out.push(Object.assign({ _room: r.id }, it)));
    });
    return out;
  }

  /* --------------------------------------------------------- RESOLVER ---
     Generated layouts must not hand the advisor a clash it can only complain
     about. So after generating, every piece is nudged along the wall it sits
     against until it is clear of the door swings, the walls and each other,
     and dropped if it never gets clear. */

  function doorZones(state) {
    const out = [];
    state.openings.forEach(o => {
      const w = MH.Store.wall(o.wallId);
      if (!w || w.demolished || o.type === 'window') return;
      const v = MH.G.wallVec(w);
      const c = MH.G.pointAlong(w, o.pos);
      const swingSide = o.flip ? -1 : 1;
      const isSwing = o.type === 'door' || o.type === 'bifold';
      [1, -1].forEach(side => {
        const need = (isSwing && side === swingSide) ? o.w : 620;
        const t = MH.Store.thickness(w) / 2;
        out.push({
          x: c.x + v.nx * side * (need / 2 + t),
          y: c.y + v.ny * side * (need / 2 + t),
          w: o.w + 60, d: need,
          rot: Math.atan2(v.dy, v.dx) * 180 / Math.PI
        });
      });
    });
    return out;
  }

  /* A window and the strip of floor in front of it. Nothing tall should stand
     here; it is the only daylight the room gets. */
  function windowBoxes(state) {
    return state.openings.map(o => {
      if (o.type !== 'window') return null;
      const w = MH.Store.wall(o.wallId); if (!w || w.demolished) return null;
      const v = MH.G.wallVec(w), c = MH.G.pointAlong(w, o.pos);
      return {
        x: c.x, y: c.y, w: o.w, d: MH.Store.thickness(w) + 600,
        rot: Math.atan2(v.dy, v.dx) * 180 / Math.PI
      };
    }).filter(Boolean);
  }

  function wallBoxes(state) {
    return state.walls.filter(w => !w.demolished).map(w => {
      const t = MH.Store.thickness(w), v = MH.G.wallVec(w);
      const nx = Math.abs(v.nx) * t / 2, ny = Math.abs(v.ny) * t / 2;
      return {
        x: (w.x1 + w.x2) / 2, y: (w.y1 + w.y2) / 2, rot: 0,
        w: Math.abs(w.x2 - w.x1) + nx * 2, d: Math.abs(w.y2 - w.y1) + ny * 2
      };
    });
  }

  /* The free floor an item needs in order to be usable, as world rectangles.
     This mirrors the advisor's clearance test exactly, front, back and both
     sides, because the whole job of the resolver is to avoid handing the
     advisor a clash it can only complain about. `sideways` marks the zones
     the advisor treats gently: a wall alongside something is usually where
     you meant to push it, a wall in front of it never is. */
  function clearZones(it) {
    const c = cat(it.catId) || {};
    if (!c.clear) return [];
    const w = it.w || c.w, d = it.d || c.d;
    const a = (it.rot || 0) * Math.PI / 180;
    /* Very slightly tighter than the advisor's own tolerance, so the resolver
       stays on the safe side of it and never places a piece the advisor will
       then complain about. */
    const shrink = 0.97;
    const put = (ox, oy, zw, zd, sideways) => ({
      x: it.x + (ox * Math.cos(a) - oy * Math.sin(a)),
      y: it.y + (ox * Math.sin(a) + oy * Math.cos(a)),
      w: zw, d: zd, rot: it.rot || 0, sideways: !!sideways
    });
    const front = n => put(0, d / 2 + n / 2, w * shrink, n * shrink, false);
    const back  = n => put(0, -(d / 2 + n / 2), w * shrink, n * shrink, false);
    const left  = n => put(-(w / 2 + n / 2), 0, n * shrink, d * shrink, true);
    const right = n => put(w / 2 + n / 2, 0, n * shrink, d * shrink, true);
    const out = [];
    if (c.clear.front) out.push(front(c.clear.front));
    if (c.clear.sides) { out.push(left(c.clear.sides)); out.push(right(c.clear.sides)); }
    if (c.clear.all) { out.push(front(c.clear.all)); out.push(back(c.clear.all)); out.push(left(c.clear.all)); out.push(right(c.clear.all)); }
    return out;
  }

  /* Axis-aligned overlap area. Everything the packs place sits at a multiple
     of 90 degrees, so the bounding boxes are the rectangles themselves. */
  function overlap(a, b) {
    const A = MH.G.aabb(MH.G.corners(a.x, a.y, a.w, a.d, a.rot || 0));
    const B = MH.G.aabb(MH.G.corners(b.x, b.y, b.w, b.d, b.rot || 0));
    return Math.max(0, Math.min(A.x2, B.x2) - Math.max(A.x1, B.x1)) *
           Math.max(0, Math.min(A.y2, B.y2) - Math.max(A.y1, B.y1));
  }
  const areaOf = r => Math.max(1, r.w * r.d);

  function isSolid(it) {
    const c = cat(it.catId) || {};
    /* A screen hangs on the wall or stands on its console: it is not something
       you walk into, and the advisor ghosts it for the same reason. */
    return !(c.overhead || c.mounted || c.passable ||
      ['rug', 'rugRound', 'zoneBox', 'tv'].includes(c.glyph));
  }

  function resolve(state, items, room) {
    const zones = doorZones(state);
    const walls = wallBoxes(state);
    const kept = [];
    const fixed = room ? box(room, 0) : null;

    items.forEach(it => {
      const c = cat(it.catId); if (!c) return;
      const w = it.w || c.w, d = it.d || c.d;
      const solid = isSolid(it);
      /* Against a wall: slide along it. Free-standing: it may move either way. */
      const alongX = (it.rot || 0) % 180 === 0;
      /* Nothing may leave the room it was drawn for, and nothing at all may
         leave the flat. */
      const home = fixed || (it._room ? box(MH.Store.room(it._room) || {}, 0) : null);
      const rb = home && isFinite(home.x1) ? home : null;

      const tryAt = (x, y) => {
        const me = { x, y, w, d, rot: it.rot || 0 };
        if (rb) {
          const bb = MH.G.aabb(MH.G.corners(x, y, w, d, it.rot || 0));
          if (bb.x1 < rb.x1 - 60 || bb.x2 > rb.x2 + 60 || bb.y1 < rb.y1 - 60 || bb.y2 > rb.y2 + 60) return false;
        }
        if (!solid) return true;
        /* Same tolerance the advisor applies: a graze is not a blocked door. */
        for (const z of zones) if (overlap(me, z) / areaOf(z) > 0.04) return false;
        /* My own working space must be free of everything already placed. */
        const mine = clearZones(Object.assign({}, it, { x, y }));
        for (const z of mine) {
          for (const k of kept) {
            if (!isSolid(k)) continue;
            const kc = cat(k.catId);
            if (MH.G.rectsOverlap(z, { x: k.x, y: k.y, w: k.w || kc.w, d: k.d || kc.d, rot: k.rot || 0 })) return false;
          }
        }
        /* And I must not be standing in anyone else's. */
        for (const k of kept) {
          for (const z of clearZones(k)) if (MH.G.rectsOverlap(me, z)) return false;
        }
        for (const wb of walls) {
          const bb = MH.G.aabb(MH.G.corners(x, y, w, d, it.rot || 0));
          const ov = Math.max(0, Math.min(bb.x2, wb.x + wb.w / 2) - Math.max(bb.x1, wb.x - wb.w / 2)) *
                     Math.max(0, Math.min(bb.y2, wb.y + wb.d / 2) - Math.max(bb.y1, wb.y - wb.d / 2));
          if (ov / ((bb.x2 - bb.x1) * (bb.y2 - bb.y1)) > 0.18) return false;
        }
        for (const k of kept) {
          if (!isSolid(k)) continue;
          const kc = cat(k.catId);
          if (MH.G.rectsOverlap(me, { x: k.x, y: k.y, w: k.w || kc.w, d: k.d || kc.d, rot: k.rot || 0 })) return false;
        }
        return true;
      };

      const take = (x, y) => {
        const out = Object.assign({}, it, { x, y });
        delete out._room; delete out._free;      // bookkeeping, not item data
        kept.push(out);
      };

      if (tryAt(it.x, it.y)) { take(it.x, it.y); return; }
      for (let step = 100; step <= 3000; step += 100) {
        /* A wall piece slides along its wall. A free-standing piece may also
           step off it, so a table can shuffle sideways as well as up. */
        const tries = it._free
          ? [[step, 0], [-step, 0], [0, step], [0, -step], [step, step], [-step, -step], [step, -step], [-step, step]]
          : (alongX ? [[step, 0], [-step, 0]] : [[0, step], [0, -step]]);
        for (const [dx, dy] of tries) {
          if (tryAt(it.x + dx, it.y + dy)) { take(it.x + dx, it.y + dy); return; }
        }
      }
      /* no home for it: leave it out rather than draw a clash */
    });
    return kept;
  }

  /* Kept for callers that only want the overlap pass. */
  function deClash(items) {
    const keep = [];
    const solid = it => {
      const c = cat(it.catId) || {};
      return !(c.overhead || c.mounted || c.passable ||
        ['rug', 'rugRound', 'zoneBox'].includes(c.glyph));
    };
    items.forEach(it => {
      const c = cat(it.catId); if (!c) return;
      const me = { x: it.x, y: it.y, w: it.w || c.w, d: it.d || c.d, rot: it.rot || 0 };
      if (solid(it)) {
        for (const k of keep) {
          if (!solid(k)) continue;
          const kc = cat(k.catId);
          const other = { x: k.x, y: k.y, w: k.w || kc.w, d: k.d || kc.d, rot: k.rot || 0 };
          if (MH.G.rectsOverlap(me, other)) return;
        }
      }
      keep.push(it);
    });
    return keep;
  }

  return { forRoom, forFlat, deClash, resolve, doorZones, box };
})();
