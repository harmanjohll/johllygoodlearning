/* =============================================================================
   MyHome — seed floor plan
   -----------------------------------------------------------------------------
   Reconstructed from the Destino Deco "Proposed Space Planning" drawing for
   Blk 522 Bishan. The twelve numbered spaces, their adjacencies, the position
   of the entrance, the wet core and the bedroom wing all follow that drawing.
   The millimetres are a careful reconstruction, because a photograph of a
   printed plan cannot be measured to the millimetre.

   ==> Calibrate before you trust a number.
       Settings > Trace your own drawing. Drop in the scan, click two points
       whose real distance you know, type it, and the drawing is set to true
       scale. Then drag the wall ends onto the traced lines.

   Wall convention, matching the drawing:
       solid dark   = reinforced concrete, structural, cannot be hacked
       hatched grey = brick or block partition, hackable with an HDB permit
       blue-grey    = household shelter, protected by law, never touch

   Grid used below (mm):
       x: 0 · 2900 · 4800 · 6100 · 8900
       y: 0 · 2000 · 2800 · 3700 · 4800 · 6600 · 7100 · 9500 · 12500
   ========================================================================== */
window.MH = window.MH || {};

MH.SEED = {
  meta: {
    name: 'Blk 522 Bishan — proposed space planning',
    client: 'Harman & Kelly',
    designer: 'Destino Deco (original drawing)',
    unitType: 'HDB 5-room',
    ceiling: 2600,          // structural soffit
    falseCeiling: 2400,     // typical once aircon trunking is boxed in
    northAngle: 0,
    calibrated: false,
    notes: 'Seed geometry is a reconstruction. Calibrate against the original drawing before ordering anything.'
  },

  rooms: [
    { id:'r-foyer',   num:1,  name:'Entrance Foyer',    x1:0,    y1:4800,  x2:1800, y2:7100,  floor:'porcelain-lf' },
    { id:'r-shelter', num:2,  name:'Household Shelter', x1:0,    y1:7100,  x2:1800, y2:9500,  floor:'porcelain-lf', protected:true },
    { id:'r-dining',  num:3,  name:'Dining Hall',       x1:1800, y1:4800,  x2:4800, y2:9500,  floor:'porcelain-lf' },
    { id:'r-kitchen', num:4,  name:'Kitchen',           x1:0,    y1:2000,  x2:2900, y2:4800,  floor:'porcelain-lf' },
    { id:'r-yard',    num:5,  name:'Service Yard',      x1:0,    y1:0,     x2:2900, y2:2000,  floor:'porcelain-lf', wet:true },
    { id:'r-living',  num:6,  name:'Living Hall',       x1:0,    y1:9500,  x2:8900, y2:12500, floor:'porcelain-lf' },
    { id:'r-pass',    num:7,  name:'Passageway',        x1:4800, y1:3700,  x2:6100, y2:9500,  floor:'porcelain-lf' },
    { id:'r-master',  num:8,  name:'Master Bedroom',    x1:4800, y1:0,     x2:8900, y2:3700,  floor:'engineered-oak' },
    { id:'r-bed2',    num:9,  name:'Bedroom 2',         x1:6100, y1:3700,  x2:8900, y2:6600,  floor:'engineered-oak' },
    { id:'r-bed3',    num:10, name:'Bedroom 3',         x1:6100, y1:6600,  x2:8900, y2:9500,  floor:'engineered-oak' },
    { id:'r-mbath',   num:11, name:'Master Bathroom',   x1:2900, y1:0,     x2:4800, y2:2800,  floor:'porcelain-lf', wet:true },
    { id:'r-cbath',   num:12, name:'Common Bathroom',   x1:2900, y1:2800,  x2:4800, y2:4800,  floor:'porcelain-lf', wet:true }
  ],

  ledges: [
    { id:'l-ac', name:'Air-con Ledge', x1:300, y1:-1500, x2:2100, y2:0 }
  ],

  walls: [
    /* external envelope, reinforced concrete */
    { id:'w-n',   x1:0,    y1:0,     x2:8900, y2:0,     type:'rc' },
    { id:'w-e',   x1:8900, y1:0,     x2:8900, y2:12500, type:'rc' },
    { id:'w-s',   x1:8900, y1:12500, x2:0,    y2:12500, type:'rc' },
    { id:'w-w1',  x1:0,    y1:12500, x2:0,    y2:9500,  type:'rc' },
    { id:'w-w2',  x1:0,    y1:9500,  x2:0,    y2:7100,  type:'shelter' },
    { id:'w-w3',  x1:0,    y1:7100,  x2:0,    y2:0,     type:'rc' },

    /* household shelter, protected by the Civil Defence Shelter Act */
    { id:'w-hs-n', x1:0,    y1:7100, x2:1800, y2:7100, type:'shelter' },
    { id:'w-hs-e', x1:1800, y1:7100, x2:1800, y2:9500, type:'shelter' },
    { id:'w-hs-s', x1:0,    y1:9500, x2:1800, y2:9500, type:'shelter' },

    /* the wet core, cast in reinforced concrete */
    { id:'w-bathW', x1:2900, y1:0,    x2:2900, y2:4800, type:'rcInternal' },
    { id:'w-bathE', x1:4800, y1:0,    x2:4800, y2:4800, type:'rcInternal' },
    { id:'w-bathM', x1:2900, y1:2800, x2:4800, y2:2800, type:'rcInternal' },
    { id:'w-bathS', x1:2900, y1:4800, x2:4800, y2:4800, type:'rcInternal' },

    /* brick and block partitions: hackable with a permit */
    { id:'w-yard',   x1:0,    y1:2000, x2:2900, y2:2000, type:'drywall' },
    { id:'w-kitS',   x1:0,    y1:4800, x2:2900, y2:4800, type:'brick' },
    { id:'w-foyerE', x1:1800, y1:4800, x2:1800, y2:7100, type:'brick' },
    { id:'w-masterS',x1:4800, y1:3700, x2:8900, y2:3700, type:'brick' },
    { id:'w-passE',  x1:6100, y1:3700, x2:6100, y2:9500, type:'brick' },
    { id:'w-passW',  x1:4800, y1:4800, x2:4800, y2:9500, type:'brick' },
    { id:'w-bed23',  x1:6100, y1:6600, x2:8900, y2:6600, type:'brick' },
    { id:'w-dinS',   x1:1800, y1:9500, x2:4800, y2:9500, type:'brick' },
    { id:'w-bed3S',  x1:6100, y1:9500, x2:8900, y2:9500, type:'brick' }
  ],

  /* `pos` is measured in mm from the wall's start point to the opening centre. */
  openings: [
    { id:'o-main',   wallId:'w-w3',     pos:1200, w:1000, type:'door',  swing:'right', flip:false, h:2100, label:'Main door', locked:true },
    { id:'o-foyer',  wallId:'w-foyerE', pos:1100, w:1100, type:'open',  h:2200, label:'Foyer opening' },
    { id:'o-kit',    wallId:'w-kitS',   pos:2350, w:1000, type:'slide',  h:2200, label:'Kitchen sliding' },
    { id:'o-yard',   wallId:'w-yard',   pos:1450, w:900,  type:'open',  h:2100, label:'To yard' },
    { id:'o-mbath',  wallId:'w-bathE',  pos:1400, w:800,  type:'door',  swing:'left',  flip:true, h:2100, label:'Master bath' },
    { id:'o-cbath',  wallId:'w-bathE',  pos:4200, w:800,  type:'door',  swing:'right', flip:true, h:2100, label:'Common bath' },
    { id:'o-master', wallId:'w-masterS',pos:700,  w:900,  type:'door',  swing:'left',  h:2100, label:'Master bedroom' },
    { id:'o-bed2',   wallId:'w-passE',  pos:700,  w:900,  type:'door',  swing:'right', h:2100, label:'Bedroom 2' },
    { id:'o-bed3',   wallId:'w-passE',  pos:3700, w:900,  type:'door',  swing:'left',  h:2100, label:'Bedroom 3' },
    { id:'o-hs',     wallId:'w-hs-n',   pos:900,  w:750,  type:'door',  swing:'right', h:2000, label:'HS steel door', locked:true },

    { id:'o-win-m',  wallId:'w-n',  pos:6900, w:1800, type:'window', h:1400, sill:900, label:'Master window' },
    { id:'o-win-b2', wallId:'w-e',  pos:5100, w:1500, type:'window', h:1400, sill:900, label:'Bedroom 2 window' },
    { id:'o-win-b3', wallId:'w-e',  pos:8000, w:1500, type:'window', h:1400, sill:900, label:'Bedroom 3 window' },
    { id:'o-win-l1', wallId:'w-s',  pos:2600, w:2400, type:'window', h:2200, sill:150, label:'Living glazing' },
    { id:'o-win-l2', wallId:'w-s',  pos:6300, w:2400, type:'window', h:2200, sill:150, label:'Living glazing' },
    { id:'o-win-k',  wallId:'w-w3', pos:3500, w:1200, type:'window', h:1400, sill:900, label:'Kitchen window' },
    { id:'o-win-y',  wallId:'w-w3', pos:6200, w:1500, type:'window', h:1400, sill:900, label:'Yard window' }
  ],

  /* A starting layout, arranged so the clearances actually pass. Everything
     here is movable; nothing here is a recommendation, it is a starting point. */
  items: [
    /* --- living hall ------------------------------------------------- */
    { id:'i01', catId:'tvconsole',         x:4200, y:9750,  rot:0 },
    { id:'i02', catId:'tv65',              x:4200, y:9690,  rot:0 },
    { id:'i03', catId:'rug-m',             x:4200, y:11000, rot:0 },
    { id:'i04', catId:'coffee-r',          x:4200, y:10700, rot:0 },
    { id:'i05', catId:'sofa3',             x:4200, y:11900, rot:180 },
    { id:'i06', catId:'armchair',          x:6300, y:11400, rot:200 },
    { id:'i07', catId:'bookshelf-200x120', x:7100, y:9725,  rot:0 },
    { id:'i08', catId:'plant-l',           x:8300, y:10400, rot:0 },
    { id:'i09', catId:'piano-upright',     x:1000, y:10000, rot:0 },

    /* --- dining ------------------------------------------------------ */
    { id:'i10', catId:'dineR6',    x:3400, y:7300, rot:0 },
    { id:'i11', catId:'sideboard', x:3900, y:5075, rot:0 },

    /* --- kitchen: galley, counter on the left, tall run on the right -- */
    { id:'i20', catId:'base600',  x:400,  y:3400, rot:270, w:2700 },
    { id:'i21', catId:'sink2',    x:400,  y:2650, rot:270 },
    { id:'i22', catId:'hob60',    x:400,  y:4150, rot:270 },
    { id:'i23', catId:'hood',     x:400,  y:4150, rot:270 },
    { id:'i24', catId:'fridge2',  x:2500, y:2400, rot:90 },
    { id:'i25', catId:'tall1200', x:2550, y:3400, rot:90 },

    /* --- service yard ------------------------------------------------ */
    { id:'i30', catId:'washstack', x:2500, y:1600, rot:180 },
    { id:'i31', catId:'basin-u',   x:700,  y:400,  rot:0 },
    { id:'i32', catId:'laundry',   x:1400, y:700,  rot:0 },
    { id:'i33', catId:'condenser', x:1000, y:-750, rot:0 },

    /* --- master bedroom ---------------------------------------------- */
    { id:'i40', catId:'bed-king',   x:7200, y:1100, rot:0 },
    { id:'i41', catId:'nightstand', x:5950, y:350,  rot:0 },
    { id:'i42', catId:'nightstand', x:8450, y:350,  rot:0 },
    { id:'i43', catId:'wardrobeS',  x:7200, y:3300, rot:180 },
    { id:'i44', catId:'fcu',        x:5500, y:250,  rot:0 },

    /* --- bedroom 2 ---------------------------------------------------- */
    { id:'i50', catId:'bed-ss',    x:7850, y:6015, rot:90 },
    { id:'i51', catId:'wardrobe3', x:8100, y:4050, rot:0 },
    { id:'i52', catId:'fcu',       x:6800, y:3900, rot:0 },

    /* --- bedroom 3 ---------------------------------------------------- */
    { id:'i60', catId:'bed-ss',    x:7850, y:8915, rot:90 },
    { id:'i61', catId:'wardrobe3', x:8100, y:6950, rot:0 },
    { id:'i62', catId:'fcu',       x:6800, y:6800, rot:0 },

    /* --- master bathroom ---------------------------------------------- */
    { id:'i70', catId:'shower-l', x:3600, y:550,  rot:0 },
    { id:'i71', catId:'wc',       x:3200, y:2375, rot:180 },
    { id:'i72', catId:'vanity-b', x:4200, y:2375, rot:180 },

    /* --- common bathroom ---------------------------------------------- */
    { id:'i75', catId:'shower',   x:3450, y:3340, rot:0 },
    { id:'i76', catId:'vanity-b', x:4300, y:3125, rot:0 },
    { id:'i77', catId:'wc',       x:3200, y:4350, rot:180 },

    /* --- foyer --------------------------------------------------------- */
    { id:'i80', catId:'shoecab', x:1000, y:5050, rot:180 },
    { id:'i81', catId:'db',      x:160,  y:5100, rot:90 }
  ]
};
