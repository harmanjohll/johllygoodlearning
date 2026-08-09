/* =============================================================================
   MyHome — the flat
   -----------------------------------------------------------------------------
   Built from the official HDB sheet: 4-Room, Type-I, Blk 522.
     Floor Area          93 m²  (internal 90 m² + air-con ledge)
     Internal Floor Area 90 m²  measured from the centre-line of the walls

   The overall dimensions come straight off the drawing's dimension chains, and
   they check out against the printed areas:

     across   2695 + 1590 + 4950 = 9235
     down     1090 + 1470 + 3595 + 3550 = 9705      (the 1090 is the A/C ledge)
     flat     9235 x (9705 - 1090) ... plus the ledge band
              9235 x 9705 = 89.6 m²  ->  the printed 90 m² internal
              ledge 2695 x 1090 = 2.94 m²
              89.6 + 2.94 = 92.6 m²  ->  the printed 93 m²

   Room sizes also come off the drawing: baths 1590 wide by 2500 and 2565 deep,
   bedrooms 3100 / 2950 / 3050, living band 3550, kitchen 3595, yard 1470,
   household shelter 1700, kitchen opening 1890, passage 1400.

   LEGEND, from the sheet:
     "Structural column(s)/wall(s) which are shaded in black and all
      beams/slabs shall not be hacked, removed or tampered with."
   Everything marked `rc`, `rcInternal` or `shelter` below is one of those.
   The app will not let you remove them, which is the same answer HDB gives.

   Where the drawing is unambiguous, this file follows it exactly. Where a
   photograph of a printed sheet cannot be read to the millimetre, it is a
   careful reconstruction — use Settings > Trace your plan to lay the scan
   underneath and drag anything into place.
   ========================================================================== */
window.MH = window.MH || {};

MH.SEED = {
  meta: {
    name: 'Blk 522 — 4-Room, Type-I',
    client: 'Harman & Kelly',
    designer: 'HDB standard floor plan',
    unitType: 'HDB 4-Room (Type-I)',
    statedArea: 93,          // m², inclusive of the A/C ledge
    statedInternal: 90,      // m², to wall centre-lines
    ceiling: 2600,
    falseCeiling: 2400,
    northAngle: 0,
    calibrated: false,
    notes: 'Overall dimensions and room sizes taken from the HDB sheet. Black walls are structural and cannot be altered.'
  },

  /* x grid:  0 · 2695 · 4285 · 5685 · 9235
     y grid:  0 · 1470 · 2500 · 3550 · 5065 · 6500 · 6765 · 9705          */
  rooms: [
    { id:'r-yard',    name:'Service Yard',      x1:0,    y1:0,    x2:2695, y2:1470, floor:'porcelain-lf', wet:true },
    { id:'r-kitchen', name:'Kitchen',           x1:0,    y1:1470, x2:2695, y2:5065, floor:'porcelain-lf' },
    { id:'r-foyer',   name:'Entrance',          x1:0,    y1:5065, x2:2695, y2:6765, floor:'porcelain-lf' },
    { id:'r-bath1',   name:'Bath / WC 1',       x1:2695, y1:0,    x2:4285, y2:2500, floor:'porcelain-lf', wet:true },
    { id:'r-bath2',   name:'Bath / WC 2',       x1:2695, y1:2500, x2:4285, y2:5065, floor:'porcelain-lf', wet:true },
    { id:'r-shelter', name:'Household Shelter', x1:2695, y1:5065, x2:4285, y2:6765, floor:'porcelain-lf', protected:true },
    { id:'r-pass',    name:'Passageway',        x1:4285, y1:0,    x2:5685, y2:6765, floor:'porcelain-lf' },
    { id:'r-main',    name:'Main Bedroom',      x1:5685, y1:0,    x2:9235, y2:3550, floor:'engineered-oak' },
    { id:'r-bed2',    name:'Bedroom 2',         x1:5685, y1:3550, x2:9235, y2:6500, floor:'engineered-oak' },
    { id:'r-bed3',    name:'Bedroom 3',         x1:5685, y1:6500, x2:9235, y2:9705, floor:'engineered-oak' },
    { id:'r-living',  name:'Living / Dining',   x1:0,    y1:6765, x2:5685, y2:9705, floor:'porcelain-lf' }
  ],

  /* Outside the flat's internal area, but part of the 93 m². */
  ledges: [
    { id:'l-ac', name:'Air-con Ledge', x1:0, y1:-1090, x2:2695, y2:0 }
  ],

  walls: [
    /* --- external envelope: structural concrete, shown black ------------- */
    { id:'w-n', x1:0,    y1:0,    x2:9235, y2:0,    type:'rc' },
    { id:'w-e', x1:9235, y1:0,    x2:9235, y2:9705, type:'rc' },
    { id:'w-s', x1:9235, y1:9705, x2:0,    y2:9705, type:'rc' },
    { id:'w-w', x1:0,    y1:9705, x2:0,    y2:0,    type:'rc' },

    /* --- the wet core: structural, shown black --------------------------- */
    { id:'w-wetW', x1:2695, y1:0,    x2:2695, y2:5065, type:'rcInternal' },
    { id:'w-wetE', x1:4285, y1:0,    x2:4285, y2:5065, type:'rcInternal' },
    { id:'w-bathM',x1:2695, y1:2500, x2:4285, y2:2500, type:'rcInternal' },

    /* --- household shelter: protected by the Civil Defence Shelter Act --- */
    { id:'w-hs-n', x1:2695, y1:5065, x2:4285, y2:5065, type:'shelter' },
    { id:'w-hs-w', x1:2695, y1:5065, x2:2695, y2:6765, type:'shelter' },
    { id:'w-hs-e', x1:4285, y1:5065, x2:4285, y2:6765, type:'shelter' },
    { id:'w-hs-s', x1:2695, y1:6765, x2:4285, y2:6765, type:'shelter' },

    /* --- bedroom spine: structural, shown black -------------------------- */
    { id:'w-spine', x1:5685, y1:0, x2:5685, y2:6765, type:'rcInternal' },

    /* --- everything below is a partition you may remove with a permit ---- */
    { id:'w-yard',   x1:0,    y1:1470, x2:2695, y2:1470, type:'brick' },
    { id:'w-kitS',   x1:0,    y1:5065, x2:2695, y2:5065, type:'brick' },
    { id:'w-foyerS', x1:0,    y1:6765, x2:2695, y2:6765, type:'brick' },
    { id:'w-bed12',  x1:5685, y1:3550, x2:9235, y2:3550, type:'brick' },
    { id:'w-bed23',  x1:5685, y1:6500, x2:9235, y2:6500, type:'brick' },
    { id:'w-bed3W',  x1:5685, y1:6765, x2:5685, y2:9705, type:'brick' }
  ],

  /* `pos` is millimetres from the wall's start point to the opening centre. */
  openings: [
    /* the way in */
    { id:'o-main', wallId:'w-w', pos:3805, w:1000, type:'door', swing:'left', flip:false,
      h:2100, label:'MAIN ENTRANCE', entrance:true, locked:true },

    /* the shelter door: steel, fixed, part of the protected structure */
    { id:'o-hs', wallId:'w-hs-w', pos:850, w:750, type:'door', swing:'right', flip:true,
      h:2000, label:'Shelter door', locked:true },

    /* internal doors and openings */
    { id:'o-kit',    wallId:'w-kitS',  pos:1350, w:1890, type:'slide2', h:2200, label:'Kitchen' },
    { id:'o-liv',    wallId:'w-foyerS',pos:2000, w:1200, type:'open',   h:2200, label:'Into the living room' },
    { id:'o-yard',   wallId:'w-yard',  pos:1350, w:900,  type:'open',   h:2100, label:'To the yard' },
    { id:'o-ledge',  wallId:'w-n',     pos:600,  w:900,  type:'door', swing:'left', h:2100, label:'To the A/C ledge' },
    { id:'o-bath1',  wallId:'w-wetE',  pos:1400, w:750,  type:'door', swing:'left',  flip:false, h:2100, label:'Bath / WC 1' },
    { id:'o-bath2',  wallId:'w-wetE',  pos:3900, w:750,  type:'door', swing:'right', flip:false, h:2100, label:'Bath / WC 2' },
    { id:'o-main-b', wallId:'w-spine', pos:1800, w:900,  type:'door', swing:'left',  flip:true,  h:2100, label:'Main Bedroom' },
    { id:'o-bed2',   wallId:'w-spine', pos:5000, w:900,  type:'door', swing:'right', flip:true,  h:2100, label:'Bedroom 2' },
    { id:'o-bed3',   wallId:'w-bed3W', pos:2200, w:900,  type:'door', swing:'left',  flip:true,  h:2100, label:'Bedroom 3' },

    /* windows */
    { id:'o-win-main',  wallId:'w-n', pos:7460, w:1800, type:'window', h:1400, sill:900, label:'Main Bedroom window' },
    { id:'o-win-main2', wallId:'w-e', pos:1800, w:1500, type:'window', h:1400, sill:900, label:'Main Bedroom window' },
    { id:'o-win-b2',    wallId:'w-e', pos:5000, w:1500, type:'window', h:1400, sill:900, label:'Bedroom 2 window' },
    { id:'o-win-b3',    wallId:'w-e', pos:8100, w:1500, type:'window', h:1400, sill:900, label:'Bedroom 3 window' },
    { id:'o-win-b3s',   wallId:'w-s', pos:1735, w:1800, type:'window', h:1500, sill:900, label:'Bedroom 3 window' },
    { id:'o-win-liv',   wallId:'w-s', pos:6435, w:2600, type:'window', h:1500, sill:900, label:'Living room window' },
    { id:'o-win-kit',   wallId:'w-w', pos:6505, w:1500, type:'window', h:1400, sill:900, label:'Kitchen window' },
    { id:'o-win-yard',  wallId:'w-w', pos:9005, w:1200, type:'window', h:1400, sill:900, label:'Service yard window' }
  ],

  /* A starting layout. Move anything, delete anything, add anything. */
  items: [
    /* living / dining */
    { id:'i01', catId:'sofa3',     x:575,  y:8400, rot:270 },
    { id:'i02', catId:'rug-s',     x:1600, y:8400, rot:90 },
    { id:'i03', catId:'coffee-r',  x:1700, y:8400, rot:90 },
    { id:'i04', catId:'tvconsole', x:2675, y:8400, rot:90 },
    { id:'i05', catId:'tv55',      x:2610, y:8400, rot:90 },
    { id:'i06', catId:'dine4',     x:4600, y:8100, rot:0 },

    /* kitchen */
    { id:'i10', catId:'base600',  x:400,  y:2925, rot:270, w:2750 },
    { id:'i11', catId:'sink2',    x:400,  y:2100, rot:270 },
    { id:'i12', catId:'hob60',    x:400,  y:3800, rot:270 },
    { id:'i13', catId:'hood',     x:400,  y:3800, rot:270 },
    { id:'i14', catId:'fridge2',  x:2245, y:2000, rot:90 },
    { id:'i15', catId:'tall1200', x:2295, y:3400, rot:90 },

    /* service yard + ledge */
    { id:'i20', catId:'washstack', x:2245, y:1000, rot:90 },
    { id:'i21', catId:'basin-u',   x:1600, y:350,  rot:0 },
    { id:'i22', catId:'laundry',   x:1300, y:900,  rot:0 },
    { id:'i23', catId:'condenser', x:1900, y:-600, rot:0 },

    /* main bedroom */
    { id:'i30', catId:'bed-queen',  x:7450, y:1050, rot:0 },
    { id:'i31', catId:'nightstand', x:6300, y:350,  rot:0 },
    { id:'i32', catId:'nightstand', x:8500, y:350,  rot:0 },
    { id:'i33', catId:'wardrobe3',  x:7450, y:3200, rot:180 },
    { id:'i34', catId:'fcu',        x:6300, y:2900, rot:270 },

    /* bedroom 2 */
    { id:'i40', catId:'bed-ss',    x:8185, y:5025, rot:90 },
    { id:'i41', catId:'wardrobe3', x:6500, y:3900, rot:0 },
    { id:'i42', catId:'fcu',       x:6500, y:3750, rot:0 },

    /* bedroom 3 */
    { id:'i50', catId:'bed-ss',              x:7000, y:7550, rot:0 },
    { id:'i51', catId:'wardrobe3',           x:8835, y:7300, rot:90 },
    { id:'i52', catId:'bookshelf-200x120',   x:7700, y:9430, rot:180 },
    { id:'i53', catId:'fcu',                 x:7900, y:6700, rot:0 },

    /* bath / wc 1 */
    { id:'i60', catId:'wc',     x:3000, y:2050, rot:180 },
    { id:'i61', catId:'basin',  x:3900, y:300,  rot:0 },
    { id:'i62', catId:'shower', x:3650, y:1000, rot:0 },

    /* bath / wc 2 */
    { id:'i70', catId:'wc',     x:3000, y:4600, rot:180 },
    { id:'i71', catId:'basin',  x:3900, y:2800, rot:0 },
    { id:'i72', catId:'shower', x:3650, y:3550, rot:0 },

    /* entrance */
    { id:'i80', catId:'db',      x:2500, y:5300, rot:270 }
  ]
};
