/* =============================================================================
   MyHome — the flat
   -----------------------------------------------------------------------------
   Built from the official HDB sheet: 4-Room, Type-I, Blk 522.
     Floor Area          93 m²  (internal 90 m² plus the air-con ledge)
     Internal Floor Area 90 m²  measured from the centre-line of the walls

   EVERY dimension below is a number printed on that sheet.

     across   2695 (yard/kitchen) + 1590 (baths) + 1400 (passage) + 3550 (bedrooms) = 9235
     down     1470 (yard) + 3595 (kitchen)  = 5065
              2500 (bath 1) + 2565 (bath 2) = 5065
              ^ the two columns break on the same line, which is what locks
                the whole plan together
     bedrooms 3100 (main) + 2950 (bedroom 2) + 3695 (bedroom 3) = 9745
     shelter  1700 x 1700
     ledge    2695 x 1090

   And it closes on the printed areas:
              9235 x 9745            = 90.00 m²  ->  printed 90 m² internal
              + ledge 2695 x 1090    = 92.93 m²  ->  printed 93 m²

   Only Bedroom 3's 3695 depth is not printed directly; it is the remainder
   once the other two bedrooms are taken off the overall.

   LEGEND, verbatim from the sheet:
     "Structural column(s)/wall(s) which are shaded in black and all
      beams/slabs shall not be hacked, removed or tampered with."
   Everything below marked `rc`, `rcInternal` or `shelter` is one of those and
   the app refuses to remove it, which is the answer HDB gives.

   THE WAY IN is on the west wall, into the Entrance, beside the household
   shelter. It is marked on the plan and cannot be deleted.
   ========================================================================== */
window.MH = window.MH || {};

MH.SEED = {
  meta: {
    name: 'Blk 522 — 4-Room, Type-I',
    client: 'Harman & Kelly',
    designer: 'HDB standard floor plan',
    unitType: 'HDB 4-Room (Type-I)',
    statedArea: 93,
    statedInternal: 90,
    ceiling: 2600,
    falseCeiling: 2400,
    northAngle: 0,
    calibrated: false,
    notes: 'Every room dimension is taken from the HDB sheet and the totals close on the printed 90 and 93 m².'
  },

  /* x grid:  0 · 2585 · 2695 · 4285 · 5685 · 9235
     y grid:  0 · 1470 · 2500 · 3100 · 5065 · 6050 · 6765 · 9745            */
  rooms: [
    { id:'r-yard',    name:'Service Yard',      x1:0,    y1:0,    x2:2695, y2:1470, floor:'porcelain-lf', wet:true },
    { id:'r-kitchen', name:'Kitchen',           x1:0,    y1:1470, x2:2695, y2:5065, floor:'porcelain-lf' },
    { id:'r-entry',   name:'Entrance',          x1:0,    y1:5065, x2:2585, y2:6765, floor:'porcelain-lf' },
    { id:'r-shelter', name:'Household Shelter', x1:2585, y1:5065, x2:4285, y2:6765, floor:'porcelain-lf', protected:true },
    { id:'r-bath1',   name:'Bath / WC 1',       x1:2695, y1:0,    x2:4285, y2:2500, floor:'porcelain-lf', wet:true },
    { id:'r-bath2',   name:'Bath / WC 2',       x1:2695, y1:2500, x2:4285, y2:5065, floor:'porcelain-lf', wet:true },
    { id:'r-pass',    name:'Passageway',        x1:4285, y1:0,    x2:5685, y2:6765, floor:'porcelain-lf' },
    { id:'r-main',    name:'Main Bedroom',      x1:5685, y1:0,    x2:9235, y2:3100, floor:'engineered-oak' },
    { id:'r-bed2',    name:'Bedroom 2',         x1:5685, y1:3100, x2:9235, y2:6050, floor:'engineered-oak' },
    { id:'r-bed3',    name:'Bedroom 3',         x1:5685, y1:6050, x2:9235, y2:9745, floor:'engineered-oak' },
    { id:'r-living',  name:'Living / Dining',   x1:0,    y1:6765, x2:5685, y2:9745, floor:'porcelain-lf' }
  ],

  /* Part of the 93 m², outside the internal 90. */
  ledges: [
    { id:'l-ac', name:'Air-con Ledge', x1:0, y1:-1090, x2:2695, y2:0 }
  ],

  walls: [
    /* --- external envelope: structural concrete, shaded black ------------ */
    { id:'w-n', x1:0,    y1:0,    x2:9235, y2:0,    type:'rc' },
    { id:'w-e', x1:9235, y1:0,    x2:9235, y2:9745, type:'rc' },
    { id:'w-s', x1:9235, y1:9745, x2:0,    y2:9745, type:'rc' },
    { id:'w-w', x1:0,    y1:9745, x2:0,    y2:0,    type:'rc' },

    /* --- the wet core: structural, shaded black -------------------------- */
    { id:'w-wetW', x1:2695, y1:0,    x2:2695, y2:5065, type:'rcInternal' },
    { id:'w-wetE', x1:4285, y1:0,    x2:4285, y2:5065, type:'rcInternal' },
    { id:'w-bathM',x1:2695, y1:2500, x2:4285, y2:2500, type:'rcInternal' },

    /* --- household shelter: Civil Defence Shelter Act -------------------- */
    { id:'w-hs-n', x1:2585, y1:5065, x2:4285, y2:5065, type:'shelter' },
    { id:'w-hs-w', x1:2585, y1:5065, x2:2585, y2:6765, type:'shelter' },
    { id:'w-hs-e', x1:4285, y1:5065, x2:4285, y2:6765, type:'shelter' },
    { id:'w-hs-s', x1:2585, y1:6765, x2:4285, y2:6765, type:'shelter' },

    /* --- bedroom spine: structural, shaded black ------------------------- */
    { id:'w-spine', x1:5685, y1:0, x2:5685, y2:6765, type:'rcInternal' },

    /* --- partitions you may remove with a permit ------------------------- */
    { id:'w-yard',  x1:0,    y1:1470, x2:2695, y2:1470, type:'brick' },
    { id:'w-kitS',  x1:0,    y1:5065, x2:2695, y2:5065, type:'brick' },
    { id:'w-entS',  x1:0,    y1:6765, x2:2585, y2:6765, type:'brick' },
    { id:'w-bed12', x1:5685, y1:3100, x2:9235, y2:3100, type:'brick' },
    { id:'w-bed23', x1:5685, y1:6050, x2:9235, y2:6050, type:'brick' },
    { id:'w-bed3W', x1:5685, y1:6765, x2:5685, y2:9745, type:'brick' }
  ],

  openings: [
    { id:'o-main', wallId:'w-w', pos:3845, w:1000, type:'door', swing:'left', flip:false,
      h:2100, label:'MAIN ENTRANCE', entrance:true, locked:true },
    { id:'o-hs', wallId:'w-hs-w', pos:850, w:750, type:'door', swing:'right', flip:true,
      h:2000, label:'Shelter door', locked:true },

    { id:'o-kit',   wallId:'w-kitS',  pos:1700, w:900,  type:'slide2', h:2200, label:'Kitchen' },
    { id:'o-yard',  wallId:'w-yard',  pos:1350, w:900,  type:'open',   h:2100, label:'To the yard' },
    { id:'o-ledge', wallId:'w-n',     pos:1900, w:900,  type:'door', swing:'left', h:2100, label:'To the A/C ledge' },
    { id:'o-ent',   wallId:'w-entS',  pos:700,  w:1200, type:'open',   h:2200, label:'Into the living room' },
    { id:'o-bath1', wallId:'w-wetE',  pos:1250, w:750,  type:'door', swing:'left',  h:2100, label:'Bath / WC 1' },
    { id:'o-bath2', wallId:'w-wetE',  pos:3800, w:750,  type:'door', swing:'right', h:2100, label:'Bath / WC 2' },
    { id:'o-mainbed',wallId:'w-spine',pos:1550, w:900,  type:'door', swing:'left',  flip:true, h:2100, label:'Main Bedroom' },
    { id:'o-bed2',  wallId:'w-spine', pos:4600, w:900,  type:'door', swing:'right', flip:true, h:2100, label:'Bedroom 2' },
    { id:'o-bed3',  wallId:'w-bed3W', pos:2400, w:900,  type:'door', swing:'left',  flip:true, h:2100, label:'Bedroom 3' },

    { id:'o-win-main',  wallId:'w-n', pos:7460, w:1800, type:'window', h:1400, sill:900, label:'Main Bedroom window' },
    { id:'o-win-main2', wallId:'w-e', pos:1550, w:1500, type:'window', h:1400, sill:900, label:'Main Bedroom window' },
    { id:'o-win-b2',    wallId:'w-e', pos:4575, w:1500, type:'window', h:1400, sill:900, label:'Bedroom 2 window' },
    { id:'o-win-b3',    wallId:'w-e', pos:7900, w:1500, type:'window', h:1400, sill:900, label:'Bedroom 3 window' },
    { id:'o-win-b3s',   wallId:'w-s', pos:1775, w:1800, type:'window', h:1500, sill:900, label:'Bedroom 3 window' },
    { id:'o-win-liv',   wallId:'w-s', pos:6435, w:2600, type:'window', h:1500, sill:900, label:'Living room window' },
    { id:'o-win-kit',   wallId:'w-w', pos:6545, w:1500, type:'window', h:1400, sill:900, label:'Kitchen window' },
    { id:'o-win-yard',  wallId:'w-w', pos:9045, w:1200, type:'window', h:1400, sill:900, label:'Service yard window' }
  ],

  /* The starting furniture. Change anything, or use Furnish in the Add panel
     to swap the whole flat over to a different arrangement, or empty it. */
  items: [
    /* Living / dining. The seating group sits south of the opening from the
       entrance, so the way in stays clear; the dining end takes the corner by
       the passage. */
    { id:'i01', catId:'sofa3',     x:575,  y:8600, rot:270 },
    { id:'i02', catId:'rug-s',     x:1600, y:8600, rot:90 },
    { id:'i03', catId:'coffee-r',  x:1700, y:8600, rot:90 },
    { id:'i04', catId:'tvconsole', x:2675, y:8600, rot:90 },
    { id:'i05', catId:'tv55',      x:2610, y:8600, rot:90 },
    { id:'i06', catId:'dine4',     x:4600, y:8300, rot:0 },

    /* kitchen */
    { id:'i10', catId:'base600',  x:400,  y:3200, rot:270, w:3300 },
    { id:'i11', catId:'sink2',    x:400,  y:2200, rot:270 },
    { id:'i12', catId:'hob60',    x:400,  y:3900, rot:270 },
    { id:'i13', catId:'hood',     x:400,  y:3900, rot:270 },
    { id:'i14', catId:'fridge2',  x:2245, y:1900, rot:90 },
    { id:'i15', catId:'tall1200', x:2295, y:3300, rot:90 },

    /* Service yard and the ledge. The washer stands on the west wall so the
       door out to the air-con ledge has its full swing. */
    { id:'i20', catId:'washstack', x:425,  y:1116, rot:270 },
    { id:'i21', catId:'basin-u',   x:599,  y:350,  rot:0 },
    { id:'i22', catId:'laundry',   x:1348, y:735,  rot:0 },
    { id:'i23', catId:'condenser', x:900,  y:-600, rot:0 },

    /* Main bedroom. Bed head on the east wall, wardrobe on the partition to
       Bedroom 2, so the two 900 mm clearances do not fight each other and the
       bedroom door opens onto floor rather than onto a mattress. */
    { id:'i30', catId:'bed-queen',  x:8185, y:1550, rot:90 },
    { id:'i31', catId:'nightstand', x:8910, y:525,  rot:90 },
    { id:'i32', catId:'wardrobe3',  x:6388, y:2700, rot:180 },
    /* The fan coil throws across the room rather than down the length of the
       bed. The north wall is nearly all window, so it goes on the partition. */
    { id:'i33', catId:'fcu',        x:6288, y:2875, rot:180 },

    /* bedroom 2 */
    { id:'i40', catId:'bed-ss',    x:8185, y:4575, rot:90 },
    { id:'i41', catId:'wardrobe3', x:6500, y:3450, rot:0 },
    { id:'i42', catId:'fcu',       x:6300, y:5900, rot:180 },

    /* bedroom 3 */
    { id:'i50', catId:'bed-ss',            x:6700, y:7150, rot:0 },
    { id:'i51', catId:'wardrobe3',         x:8835, y:7000, rot:90 },
    { id:'i52', catId:'bookshelf-200x120', x:7900, y:9470, rot:180 },
    { id:'i53', catId:'fcu',               x:7900, y:6300, rot:0 },

    /* bath / wc 1 */
    { id:'i60', catId:'wc',     x:3000, y:2050, rot:180 },
    { id:'i61', catId:'basin',  x:3900, y:350,  rot:0 },
    { id:'i62', catId:'shower', x:3700, y:1150, rot:0 },

    /* bath / wc 2 */
    { id:'i70', catId:'wc',     x:3000, y:4600, rot:180 },
    { id:'i71', catId:'basin',  x:3900, y:2800, rot:0 },
    { id:'i72', catId:'shower', x:3700, y:3600, rot:0 },

    /* entrance */
    { id:'i80', catId:'shoecab', x:1900, y:6540, rot:180 },
    /* High on the wall beside the entrance, the way HDB hands the flat over. */
    { id:'i81', catId:'db',      x:700,  y:5130, rot:0 }
  ]
};
