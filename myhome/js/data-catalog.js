/* =============================================================================
   MyHome — Item catalogue
   -----------------------------------------------------------------------------
   All dimensions in MILLIMETRES, always.
     w = width  (along the item's local X, i.e. its "face" width)
     d = depth  (along the item's local Y)
     h = height (vertical, used by the 3D view and by clearance checks)
   `clear` describes the free floor space the item needs, in mm, measured from
   the named face. The advisor uses it to flag layouts that will annoy you.
   Sizes follow Singapore retail norms (bed sizes, HDB door leaves, 600 mm
   kitchen modules) rather than US or European ones.
   ========================================================================== */
window.MH = window.MH || {};

MH.CATEGORIES = [
  { id:'living',    name:'Living',        icon:'sofa' },
  { id:'dining',    name:'Dining',        icon:'table' },
  { id:'kitchen',   name:'Kitchen',       icon:'kitchen' },
  { id:'bedroom',   name:'Bedroom',       icon:'bed' },
  { id:'storage',   name:'Storage',       icon:'shelf' },
  { id:'bathroom',  name:'Bathroom',      icon:'bath' },
  { id:'utility',   name:'Utility',       icon:'washer' },
  { id:'media',     name:'Media & music', icon:'tv' },
  { id:'work',      name:'Work & study',  icon:'desk' },
  { id:'green',     name:'Plants & decor',icon:'plant' },
  { id:'services',  name:'Services',      icon:'fan' }
];

/* Helper: 16:9 screen geometry from a diagonal in inches. */
MH.tvSize = function (inches) {
  const diag = inches * 25.4;
  const ratio = Math.hypot(16, 9);
  return { w: Math.round(diag * 16 / ratio), h: Math.round(diag * 9 / ratio) };
};

MH.CATALOG = [
  /* ---------------------------------------------------------------- LIVING */
  { id:'sofa2',      cat:'living', name:'Sofa, 2 seat',        w:1600, d:900,  h:800, glyph:'sofa', tags:['seating'], note:'Allow 400-450 mm between the sofa front and the coffee table.' },
  { id:'sofa25',     cat:'living', name:'Sofa, 2.5 seat',      w:1900, d:900,  h:800, glyph:'sofa' },
  { id:'sofa3',      cat:'living', name:'Sofa, 3 seat',        w:2200, d:950,  h:820, glyph:'sofa',
    note:'2200 mm is the practical maximum for an HDB living hall if you still want a walkway behind it.' },
  { id:'sofa4',      cat:'living', name:'Sofa, 4 seat',        w:2600, d:1000, h:820, glyph:'sofa' },
  { id:'sofaL',      cat:'living', name:'L-shape sectional',   w:2600, d:1700, h:820, glyph:'sofaL',
    note:'Put the chaise on the side away from the main circulation route, or it becomes a hurdle.' },
  { id:'sofaU',      cat:'living', name:'U-shape sectional',   w:2800, d:2400, h:820, glyph:'sofaU' },
  { id:'daybed',     cat:'living', name:'Daybed',              w:1900, d:900,  h:600, glyph:'bed' },
  { id:'armchair',   cat:'living', name:'Armchair',            w:800,  d:850,  h:800, glyph:'armchair' },
  { id:'loungechair',cat:'living', name:'Lounge chair + ottoman', w:850, d:1300, h:900, glyph:'armchair' },
  { id:'coffee-r',   cat:'living', name:'Coffee table, rect',  w:1200, d:600,  h:400, glyph:'coffeeTable',
    note:'Roughly two-thirds the length of the sofa is the classic proportion.' },
  { id:'coffee-o',   cat:'living', name:'Coffee table, round', w:900,  d:900,  h:400, glyph:'coffeeRound', round:true,
    note:'A round table is worth 150 mm of extra circulation in a tight living hall.' },
  { id:'sidetable',  cat:'living', name:'Side table',          w:450,  d:450,  h:550, glyph:'sideTable' },
  { id:'console',    cat:'living', name:'Console table',       w:1200, d:350,  h:800, glyph:'box' },
  { id:'tvconsole',  cat:'living', name:'TV console',          w:1800, d:400,  h:450, glyph:'box',
    note:'Make it at least 300 mm wider than the TV on each side, or the TV looks stranded.' },
  { id:'rug-s',      cat:'living', name:'Rug 1600 x 2300',     w:2300, d:1600, h:10,  glyph:'rug' },
  { id:'rug-m',      cat:'living', name:'Rug 2000 x 3000',     w:3000, d:2000, h:10,  glyph:'rug',
    note:'The rug should sit under at least the front legs of every seat around it. Floating a small rug in the middle is the commonest error.' },
  { id:'rug-l',      cat:'living', name:'Rug 2400 x 3400',     w:3400, d:2400, h:10,  glyph:'rug' },
  { id:'rug-round',  cat:'living', name:'Rug, round 2000',     w:2000, d:2000, h:10,  glyph:'rugRound', round:true },
  { id:'floorlamp',  cat:'living', name:'Floor lamp',          w:400,  d:400,  h:1600, glyph:'lamp', round:true },
  { id:'arclamp',    cat:'living', name:'Arc floor lamp',      w:1800, d:400,  h:2100, glyph:'arcLamp' },
  { id:'pouffe',     cat:'living', name:'Pouffe / ottoman',    w:600,  d:600,  h:420, glyph:'coffeeRound', round:true },
  { id:'firepl',     cat:'living', name:'Media / feature wall',w:3000, d:250,  h:2400, glyph:'featureWall' },

  /* ---------------------------------------------------------------- DINING */
  { id:'dine4',      cat:'dining', name:'Dining table, 4 seat',  w:1200, d:750,  h:750, glyph:'tableRect', seats:4,
    clear:{ all:900 }, note:'Chairs need 900 mm behind them to pull out and sit down; 1100 mm if someone must walk past.' },
  { id:'dine6',      cat:'dining', name:'Dining table, 6 seat',  w:1600, d:900,  h:750, glyph:'tableRect', seats:6, clear:{ all:900 } },
  { id:'dine8',      cat:'dining', name:'Dining table, 8 seat',  w:2200, d:1000, h:750, glyph:'tableRect', seats:8, clear:{ all:900 } },
  { id:'dine10',     cat:'dining', name:'Dining table, 10 seat', w:2800, d:1050, h:750, glyph:'tableRect', seats:10, clear:{ all:900 } },
  { id:'dineR4',     cat:'dining', name:'Round table, 4 seat',   w:1000, d:1000, h:750, glyph:'tableRound', round:true, seats:4, clear:{ all:900 } },
  { id:'dineR6',     cat:'dining', name:'Round table, 6 seat',   w:1300, d:1300, h:750, glyph:'tableRound', round:true, seats:6, clear:{ all:900 },
    note:'A round table seats an awkward number more graciously and has no corners to bruise a hip on.' },
  { id:'dineR8',     cat:'dining', name:'Round table, 8 seat',   w:1500, d:1500, h:750, glyph:'tableRound', round:true, seats:8, clear:{ all:900 } },
  { id:'dineR10',    cat:'dining', name:'Round table, 10 seat',  w:1800, d:1800, h:750, glyph:'tableRound', round:true, seats:10, clear:{ all:1000 },
    note:'With a lazy susan this is the classic Singapore family table. 1800 mm needs a 3.6 m clear span.' },
  { id:'dinechair',  cat:'dining', name:'Dining chair',          w:450,  d:520,  h:850, glyph:'chair' },
  { id:'bench',      cat:'dining', name:'Dining bench',          w:1400, d:350,  h:450, glyph:'box' },
  { id:'sideboard',  cat:'dining', name:'Sideboard',             w:1600, d:450,  h:800, glyph:'sideboard' },
  { id:'bar2',       cat:'dining', name:'Bar stool',             w:400,  d:400,  h:750, glyph:'chair', round:true },

  /* --------------------------------------------------------------- KITCHEN */
  { id:'island',     cat:'kitchen', name:'Kitchen island',        w:1800, d:900,  h:900, glyph:'island',
    clear:{ all:1000 }, note:'900 mm all round is the absolute minimum; 1000-1200 mm if two people cook or a dishwasher door opens into it.' },
  { id:'island-l',   cat:'kitchen', name:'Kitchen island, large', w:2400, d:1000, h:900, glyph:'island', clear:{ all:1000 } },
  { id:'island-brk', cat:'kitchen', name:'Island + breakfast bar',w:2400, d:1100, h:900, glyph:'islandBar', clear:{ all:1000 },
    note:'Allow 600 mm of bar width per stool and a 300 mm overhang for knees.' },
  { id:'peninsula',  cat:'kitchen', name:'Peninsula',             w:1800, d:650,  h:900, glyph:'counter', clear:{ front:1000 } },
  { id:'base600',    cat:'kitchen', name:'Base cabinet run',      w:1800, d:600,  h:900, glyph:'counter', clear:{ front:1000 } },
  { id:'tall600',    cat:'kitchen', name:'Tall unit / larder',    w:600,  d:600,  h:2200, glyph:'tallUnit' },
  { id:'tall1200',   cat:'kitchen', name:'Tall unit run',         w:1200, d:600,  h:2200, glyph:'tallUnit' },
  { id:'fridge2',    cat:'kitchen', name:'Fridge, 2 door',        w:700,  d:700,  h:1800, glyph:'fridge', clear:{ front:1100 },
    note:'Add 50 mm at the hinge side and 25 mm behind for the coils, or the door will not clear 90 degrees.' },
  { id:'fridgeSbS',  cat:'kitchen', name:'Fridge, side by side',  w:910,  d:750,  h:1780, glyph:'fridge', clear:{ front:1100 } },
  { id:'fridgeInt',  cat:'kitchen', name:'Fridge, integrated',    w:600,  d:600,  h:1770, glyph:'fridge', clear:{ front:1000 } },
  { id:'hob60',      cat:'kitchen', name:'Hob, 600',              w:600,  d:520,  h:60,  glyph:'hob', mounted:'counter',
    note:'Singapore fire code: keep a hob at least 300 mm from a side wall or a combustible surface.' },
  { id:'hob90',      cat:'kitchen', name:'Hob, 900',              w:900,  d:520,  h:60,  glyph:'hob', mounted:'counter', },
  { id:'hood',       cat:'kitchen', name:'Extractor hood',        w:900,  d:500,  h:600, glyph:'hood', overhead:true,
    note:'Hood should be at least as wide as the hob and mounted 650-750 mm above it. Singapore wok cooking wants 900 m3/h or more.' },
  { id:'sink1',      cat:'kitchen', name:'Sink, single bowl',     w:600,  d:450,  h:200, glyph:'sink', mounted:'counter', },
  { id:'sink2',      cat:'kitchen', name:'Sink, double bowl',     w:800,  d:450,  h:200, glyph:'sinkDouble', mounted:'counter', },
  { id:'oven',       cat:'kitchen', name:'Built-in oven',         w:600,  d:560,  h:600, glyph:'oven', mounted:'counter', clear:{ front:1100 } },
  { id:'ovencol',    cat:'kitchen', name:'Oven + microwave column',w:600, d:600,  h:2200, glyph:'tallUnit', clear:{ front:1100 } },
  { id:'dishwasher', cat:'kitchen', name:'Dishwasher',            w:600,  d:600,  h:850, glyph:'appliance', mounted:'counter', clear:{ front:1200 },
    note:'The open door needs about 1200 mm. Check it does not collide with the island.' },
  { id:'winefridge', cat:'kitchen', name:'Wine fridge',           w:600,  d:600,  h:850, glyph:'appliance' },
  { id:'pantry',     cat:'kitchen', name:'Walk-in pantry',        w:1200, d:1200, h:2400, glyph:'zoneBox' },
  { id:'wetkitchen', cat:'kitchen', name:'Wet kitchen counter',   w:2400, d:600,  h:900, glyph:'counter',
    note:'A separated wet kitchen keeps frying smells and grease out of the living areas. Standard practice in Singapore homes that cook daily.' },

  /* --------------------------------------------------------------- BEDROOM */
  { id:'bed-single', cat:'bedroom', name:'Bed, single (900 x 1900)',       w:900,  d:1900, h:600, glyph:'bed', clear:{ sides:600, front:750 } },
  { id:'bed-ss',     cat:'bedroom', name:'Bed, super single (1070 x 1900)',w:1070, d:1900, h:600, glyph:'bed', clear:{ sides:600, front:750 },
    note:'Super single is a Singapore-specific size. It does not exist in most other markets.' },
  { id:'bed-queen',  cat:'bedroom', name:'Bed, queen (1520 x 1900)',       w:1520, d:1900, h:600, glyph:'bed', clear:{ sides:600, front:750 } },
  { id:'bed-king',   cat:'bedroom', name:'Bed, king (1820 x 1900)',        w:1820, d:1900, h:600, glyph:'bed', clear:{ sides:600, front:750 },
    note:'A king needs a 3.4 m clear wall to leave 600 mm each side. Below that, go queen.' },
  { id:'bed-bunk',   cat:'bedroom', name:'Bunk bed',                       w:1070, d:1980, h:1700, glyph:'bunk' },
  { id:'crib',       cat:'bedroom', name:'Cot / crib',                     w:700,  d:1300, h:900, glyph:'bed' },
  { id:'nightstand', cat:'bedroom', name:'Bedside table',                  w:450,  d:400,  h:550, glyph:'sideTable', beside:'bed' },
  { id:'wardrobe2',  cat:'bedroom', name:'Wardrobe, 2 door (900)',         w:900,  d:600,  h:2200, glyph:'wardrobe', clear:{ front:900 } },
  { id:'wardrobe3',  cat:'bedroom', name:'Wardrobe, 3 door (1350)',        w:1350, d:600,  h:2200, glyph:'wardrobe', clear:{ front:900 } },
  { id:'wardrobe4',  cat:'bedroom', name:'Wardrobe, 4 door (1800)',        w:1800, d:600,  h:2400, glyph:'wardrobe', clear:{ front:900 } },
  { id:'wardrobeS',  cat:'bedroom', name:'Wardrobe, sliding (2400)',       w:2400, d:650,  h:2400, glyph:'wardrobeSlide', clear:{ front:750 },
    note:'Sliding doors save 900 mm of swing but you can only ever see half the wardrobe at once.' },
  { id:'walkin',     cat:'bedroom', name:'Walk-in wardrobe zone',          w:2400, d:1800, h:2400, glyph:'zoneBox',
    note:'A walk-in needs 1000 mm of clear aisle between hanging rails at 600 mm depth each.' },
  { id:'dresser',    cat:'bedroom', name:'Chest of drawers',               w:1000, d:450,  h:800, glyph:'box', clear:{ front:900 } },
  { id:'vanity',     cat:'bedroom', name:'Dressing table',                 w:1100, d:450,  h:750, glyph:'desk', clear:{ front:800 } },
  { id:'mirror-f',   cat:'bedroom', name:'Full-length mirror',             w:600,  d:60,   h:1800, glyph:'mirror' },

  /* --------------------------------------------------------------- STORAGE */
  { id:'bookshelf-200x120', cat:'storage', name:'Bookshelf 2000 x 1200', w:2000, d:350, h:1200, glyph:'bookshelf',
    note:'Sized to the brief: 2000 mm wide, 1200 mm tall, 350 mm deep. Change any dimension in the inspector. Below 1200 mm it doubles as a low room divider.' },
  { id:'bookshelf-tall',    cat:'storage', name:'Bookshelf, tall (1200 x 2000)', w:1200, d:350, h:2000, glyph:'bookshelf',
    note:'The same 2000 x 1200 footprint turned upright, if that is what you meant. Anchor anything over 1500 mm tall to the wall.' },
  { id:'bookcase-s',        cat:'storage', name:'Bookcase, 800 wide',    w:800,  d:300, h:1800, glyph:'bookshelf' },
  { id:'shelf-open',        cat:'storage', name:'Open shelving unit',    w:1000, d:400, h:2000, glyph:'bookshelf' },
  { id:'shoecab',           cat:'storage', name:'Shoe cabinet',          w:1200, d:350, h:1200, glyph:'box',
    note:'Allow 350 mm depth for adult shoes stored front-on, or 280 mm on a tilting rack.' },
  { id:'shoecab-s',         cat:'storage', name:'Shoe cabinet, narrow',  w:600,  d:350, h:1200, glyph:'box',
    note:'For a foyer that is mostly doorway. Between a front door, a shelter door and the opening into the living room, 600 mm is often the longest clear run of wall an HDB entrance has.' },
  { id:'fullheight',        cat:'storage', name:'Full-height storage wall', w:2400, d:600, h:2600, glyph:'tallUnit',
    note:'Taking storage to the ceiling adds roughly 25% capacity and removes the dust ledge.' },
  { id:'storagebench',      cat:'storage', name:'Storage bench',         w:1200, d:400, h:450, glyph:'box' },
  { id:'altar',             cat:'storage', name:'Altar / prayer cabinet',w:900,  d:450, h:1800, glyph:'box' },
  { id:'sideboard-l',       cat:'storage', name:'Low sideboard',         w:2000, d:450, h:700, glyph:'sideboard' },

  /* -------------------------------------------------------------- BATHROOM */
  { id:'wc',        cat:'bathroom', name:'WC',                     w:380, d:700,  h:800, glyph:'wc', clear:{ front:600, sides:200 },
    note:'Singapore practice: 380 mm to the centreline from any side wall, 600 mm clear in front.' },
  { id:'wc-wall',   cat:'bathroom', name:'Wall-hung WC + cistern',  w:380, d:560,  h:400, glyph:'wc', clear:{ front:600 },
    note:'A concealed cistern eats 200 mm of depth but makes the floor sweepable and the room read larger.' },
  { id:'basin',     cat:'bathroom', name:'Basin',                   w:500, d:400,  h:850, glyph:'basin', clear:{ front:700 } },
  { id:'vanity-b',  cat:'bathroom', name:'Vanity + basin',          w:800, d:480,  h:850, glyph:'vanityBasin', clear:{ front:700 } },
  { id:'vanity-d',  cat:'bathroom', name:'Double vanity',           w:1500,d:520,  h:850, glyph:'vanityBasin', clear:{ front:900 } },
  { id:'shower',    cat:'bathroom', name:'Shower, 900 x 900',       w:900, d:900,  h:2000, glyph:'shower', passable:true },
  { id:'shower-l',  cat:'bathroom', name:'Shower, 1200 x 900',      w:1200,d:900,  h:2000, glyph:'shower', passable:true,
    note:'1200 x 900 is the comfortable minimum for an adult. Below 900 x 900 you will elbow the glass.' },
  { id:'bath',      cat:'bathroom', name:'Bathtub 1700',            w:1700,d:750,  h:580, glyph:'bathtub', passable:true, clear:{ front:750 } },
  { id:'bath-free', cat:'bathroom', name:'Freestanding tub',        w:1600,d:800,  h:600, glyph:'bathtubFree', passable:true, round:true, clear:{ all:200 } },
  { id:'towelrail', cat:'bathroom', name:'Towel rail',              w:600, d:100,  h:1200, glyph:'box' },

  /* --------------------------------------------------------------- UTILITY */
  { id:'washer',    cat:'utility', name:'Washing machine',         w:600, d:600, h:850, glyph:'appliance', clear:{ front:1000 } },
  { id:'dryer',     cat:'utility', name:'Dryer',                   w:600, d:600, h:850, glyph:'appliance', clear:{ front:1000 } },
  { id:'washstack', cat:'utility', name:'Washer + dryer, stacked', w:600, d:650, h:1700, glyph:'appliance', clear:{ front:1000 },
    note:'Stacking frees 600 mm of yard width. You need a proper stacking kit, not just gravity.' },
  { id:'laundry',   cat:'utility', name:'Laundry rack (ceiling)',  w:1800, d:600, h:200, glyph:'laundryRack', overhead:true,
    note:'The ceiling-mounted pulley rack is the Singapore standard. Site it where it does not block the yard door.' },
  { id:'basin-u',   cat:'utility', name:'Utility sink',            w:600, d:500, h:900, glyph:'sink' },
  { id:'heater',    cat:'utility', name:'Storage water heater',    w:450, d:450, h:900, glyph:'cylinder', round:true },
  { id:'db',        cat:'utility', name:'Distribution board',      w:450, d:120, h:350, glyph:'box', overhead:true,
    note:'Mounted high on the wall, usually about 1.8 m above the floor near the entrance, so it takes no floor space. Fixed position all the same — the DB cannot move without a licensed electrical worker and an SP Group application.' },
  { id:'bins',      cat:'utility', name:'Recycling / bins',        w:700, d:400, h:900, glyph:'box' },
  { id:'ironboard', cat:'utility', name:'Ironing station',         w:1400, d:400, h:900, glyph:'box' },

  /* ----------------------------------------------------------------- MEDIA */
  { id:'tv43', cat:'media', name:'TV 43 inch',  w:952,  d:60, h:535,  glyph:'tv', tv:43 },
  { id:'tv50', cat:'media', name:'TV 50 inch',  w:1107, d:60, h:622,  glyph:'tv', tv:50 },
  { id:'tv55', cat:'media', name:'TV 55 inch',  w:1218, d:60, h:685,  glyph:'tv', tv:55,
    note:'55 inch suits a 1.7-2.2 m viewing distance at 4K. The most common HDB living-hall size.' },
  { id:'tv65', cat:'media', name:'TV 65 inch',  w:1439, d:60, h:810,  glyph:'tv', tv:65,
    note:'65 inch wants 2.0-2.6 m. Measure from the sofa back, not the sofa front.' },
  { id:'tv75', cat:'media', name:'TV 75 inch',  w:1660, d:60, h:934,  glyph:'tv', tv:75 },
  { id:'tv85', cat:'media', name:'TV 85 inch',  w:1882, d:60, h:1058, glyph:'tv', tv:85,
    note:'85 inch needs 2.6-3.4 m and a wall at least 2.6 m wide to not look absurd.' },
  { id:'projector', cat:'media', name:'Projector screen', w:2200, d:80, h:1300, glyph:'tv' },
  { id:'soundbar',  cat:'media', name:'Soundbar',         w:1100, d:120, h:70,  glyph:'box', mounted:'counter' },
  { id:'speaker',   cat:'media', name:'Floorstanding speaker', w:250, d:320, h:1000, glyph:'box' },
  { id:'piano-upright', cat:'media', name:'Upright piano (1200 x 600)', w:1200, d:600, h:1250, glyph:'piano',
    clear:{ front:900 },
    note:'Sized to the brief. Needs 900 mm of clear floor behind the stool. Keep it off an external wall and out of the direct aircon draught; Singapore humidity swings are what put pianos out of tune, not playing them.' },
  { id:'piano-grand',   cat:'media', name:'Baby grand piano',   w:1500, d:1900, h:1000, glyph:'grandPiano', clear:{ all:600 },
    note:'A baby grand needs roughly 1500 x 1900 mm plus 600 mm to walk around, so about 5 sqm in practice.' },
  { id:'digitalpiano', cat:'media', name:'Digital piano',       w:1400, d:400, h:800, glyph:'box', clear:{ front:900 } },
  { id:'guitar',    cat:'media', name:'Instrument stand',       w:400, d:400, h:1000, glyph:'box' },

  /* ------------------------------------------------------------------ WORK */
  { id:'desk-s',    cat:'work', name:'Desk 1200',             w:1200, d:600, h:750, glyph:'desk', clear:{ front:900 } },
  { id:'desk-m',    cat:'work', name:'Desk 1600',             w:1600, d:700, h:750, glyph:'desk', clear:{ front:900 } },
  { id:'desk-l',    cat:'work', name:'Desk 1800 (sit-stand)', w:1800, d:800, h:750, glyph:'desk', clear:{ front:1000 } },
  { id:'desk-L',    cat:'work', name:'L-shape desk',          w:1600, d:1600, h:750, glyph:'deskL', clear:{ front:900 } },
  { id:'taskchair', cat:'work', name:'Task chair',            w:650, d:650, h:1100, glyph:'chair', round:true },
  { id:'studytable',cat:'work', name:'Study table (child)',   w:1000, d:600, h:730, glyph:'desk', clear:{ front:900 } },
  { id:'filing',    cat:'work', name:'Filing / drawer unit',  w:420, d:500, h:600, glyph:'box' },

  /* --------------------------------------------------------------- GREENERY */
  { id:'plant-s',   cat:'green', name:'Plant, small',          w:300, d:300, h:500,  glyph:'plant', round:true },
  { id:'plant-m',   cat:'green', name:'Plant, medium',         w:500, d:500, h:1200, glyph:'plant', round:true },
  { id:'plant-l',   cat:'green', name:'Plant, large (fiddle-leaf class)', w:800, d:800, h:2000, glyph:'plant', round:true,
    note:'Needs 200+ lux to survive. Within 1.5 m of a window in Singapore is comfortably enough.' },
  { id:'planter',   cat:'green', name:'Planter run',           w:1800, d:350, h:600, glyph:'planter',
    note:'Use sealed self-watering reservoirs. Standing water in an open tray is an NEA mosquito-breeding offence.' },
  { id:'greenwall', cat:'green', name:'Green wall',            w:2000, d:250, h:2200, glyph:'featureWall' },
  { id:'artwork',   cat:'green', name:'Artwork (wall)',        w:1200, d:50,  h:900, glyph:'mirror',
    note:'Hang so the centre of the piece is 1450-1500 mm above the floor. Over a sofa, leave 200-250 mm above the back.' },
  { id:'aquarium',  cat:'green', name:'Aquarium',              w:1200, d:450, h:1400, glyph:'box',
    note:'A 4 ft tank plus water and cabinet is roughly 250 kg over 0.54 sqm. HDB floor loading is 1.5 kN/sqm; spread the load along a wall, not into a corner.' },
  { id:'mirror-w',  cat:'green', name:'Wall mirror',           w:1000, d:50,  h:1400, glyph:'mirror',
    note:'A mirror facing a window bounces daylight deep into a plan. A mirror facing a blank wall just doubles the blank wall.' },

  /* -------------------------------------------------------------- SERVICES */
  { id:'fcu',       cat:'services', name:'Aircon FCU (wall)',    w:1050, d:250, h:300, glyph:'fcu', overhead:true,
    note:'Never blow directly onto a bed, a desk chair or a piano. Site it so the throw runs along the room, not across a seat.' },
  { id:'fcu-cass',  cat:'services', name:'Aircon cassette',      w:840, d:840, h:250, glyph:'fcu', overhead:true, round:false },
  { id:'condenser', cat:'services', name:'Condenser (ledge)',    w:900, d:350, h:700, glyph:'appliance',
    note:'Aircon ledge only. Leave 300 mm at the back and 500 mm in front for airflow and servicing.' },
  { id:'ceilingfan',cat:'services', name:'Ceiling fan',          w:1400, d:1400, h:300, glyph:'fan', overhead:true, round:true,
    note:'A fan plus aircon at 26-27 degC is more comfortable and much cheaper than aircon alone at 23 degC. Blade tip needs 500 mm from any wall.' },
  { id:'column',    cat:'services', name:'Structural column',    w:300, d:300, h:2600, glyph:'column', locked:true },
  { id:'bulkhead',  cat:'services', name:'Bulkhead / false ceiling zone', w:2000, d:600, h:300, glyph:'zoneBox', overhead:true,
    note:'Aircon trunking usually needs a 250-350 mm bulkhead. Draw it early; it changes where tall joinery can go.' },
  { id:'human',     cat:'services', name:'Person (scale reference)', w:450, d:300, h:1750, glyph:'human', round:true,
    note:'1750 mm tall, 450 mm across the shoulders. Drop one in whenever a space stops feeling real.' }
];

/* Openings that live inside a wall rather than on the floor. */
MH.OPENINGS = [
  { id:'door-single',  name:'Door, single swing',   type:'door',   w:900,  h:2100, swing:'left',  note:'HDB internal doors are usually 850-900 mm. 800 mm is the practical minimum for moving furniture.' },
  { id:'door-800',     name:'Door, 800 (bathroom)', type:'door',   w:800,  h:2100, swing:'left' },
  { id:'door-double',  name:'Door, double',         type:'door',   w:1500, h:2100, swing:'double' },
  { id:'door-sliding', name:'Sliding door',         type:'slide',  w:900,  h:2100, note:'Saves the 900 mm swing but needs an equal length of clear wall to slide onto.' },
  { id:'door-slide2',  name:'Sliding, 2 panel',     type:'slide2', w:1800, h:2100 },
  { id:'door-slide3',  name:'Sliding, 3 panel',     type:'slide3', w:2700, h:2400, note:'Glass sliding partitions are the usual way to close a Singapore kitchen off without losing daylight.' },
  { id:'door-pocket',  name:'Pocket / cavity slider',type:'pocket',w:900,  h:2100, note:'Best space saver there is, but the wall it slides into cannot then carry heavy fixings.' },
  { id:'door-bifold',  name:'Bifold door',          type:'bifold', w:900,  h:2100 },
  { id:'door-barn',    name:'Barn door',            type:'barn',   w:1000, h:2200 },
  { id:'opening',      name:'Cased opening',        type:'open',   w:1200, h:2200, note:'No door at all. The cheapest way to make two small rooms feel like one.' },
  { id:'arch',         name:'Arched opening',       type:'arch',   w:1100, h:2200 },
  { id:'main-door',    name:'Main entrance door',   type:'door',   w:1000, h:2100, swing:'left', locked:true },
  { id:'window-1',     name:'Window, 1200',         type:'window', w:1200, h:1400, sill:900 },
  { id:'window-2',     name:'Window, 1800',         type:'window', w:1800, h:1400, sill:900 },
  { id:'window-full',  name:'Full-height glazing',  type:'window', w:2400, h:2200, sill:150 },
  { id:'window-bay',   name:'Bay / casement bank',  type:'window', w:3000, h:1500, sill:800 },
  { id:'hatch',        name:'Service hatch',        type:'open',   w:900,  h:900,  sill:1000 }
];

/* Wall construction types. `hackable:false` means the app will refuse to
   demolish it, which mirrors what HDB will refuse to approve. */
MH.WALL_TYPES = {
  rc: {
    id:'rc', name:'Concrete wall', short:'Concrete', thickness:200, hackable:false,
    fill:'#2E2A26', stroke:'#141210',
    why:'This is one of the walls shaded black on your HDB plan. It holds the building up.',
    note:'Structural reinforced concrete. The HDB sheet says it plainly: walls shaded in black, and all beams and slabs, shall not be hacked, removed or tampered with. Not even a deep chase for conduit without approval.'
  },
  rcInternal: {
    id:'rcInternal', name:'Concrete wall (internal)', short:'Concrete', thickness:150, hackable:false,
    fill:'#3A342E', stroke:'#141210',
    why:'Shaded black on your plan. It carries load down through every storey.',
    note:'Internal structural concrete. An opening here changes the load path for every flat above yours, which is why HDB will not approve one.'
  },
  shelter: {
    id:'shelter', name:'Household shelter', short:'Shelter', thickness:300, hackable:false,
    fill:'#1F2A33', stroke:'#0C1319',
    why:'The bomb shelter. Protected by law, not just by HDB policy.',
    note:'Under the Civil Defence Shelter Act you may not hack, drill, nail, tile over the door, or block the ventilation openings. Storage inside is fine. Fixings are not. This is the one wall with criminal penalties attached.'
  },
  brick: {
    id:'brick', name:'Brick wall', short:'Brick', thickness:100, hackable:true,
    fill:'#B9AEA0', stroke:'#7C7266',
    why:'A partition. It holds nothing up but itself.',
    note:'Non load-bearing brick or block. Removable with an HDB permit and a registered renovation contractor. Budget for hacking, debris disposal, and making good the floor and ceiling where it stood.'
  },
  drywall: {
    id:'drywall', name:'Stud partition', short:'Stud', thickness:90, hackable:true,
    fill:'#D2C9BC', stroke:'#948B7E',
    why:'A lightweight partition. The easiest thing in the flat to remove.',
    note:'Timber or metal stud with board both sides. Quick to remove and quick to add. Poor at stopping sound unless you specify insulation and a double layer of board.'
  },
  glass: {
    id:'glass', name:'Glass partition', short:'Glass', thickness:60, hackable:true,
    fill:'#BBD7E0', stroke:'#6E97A3',
    why:'Divides the space without blocking the daylight.',
    note:'The best way to close off a room in a deep plan without making it dark. Tempered safety glass is mandatory for full-height panels in Singapore.'
  },
  proposed: {
    id:'proposed', name:'New wall', short:'New', thickness:100, hackable:true,
    fill:'#C9A05A', stroke:'#8A6A2E',
    why:'A wall you are adding.',
    note:'New partitions add dead load, so HDB approves lightweight stud or aerated block far more readily than solid brickwork. A stud wall is also what you want acoustically.'
  },
  parapet: {
    id:'parapet', name:'Parapet', short:'Parapet', thickness:150, hackable:false,
    fill:'#4A4A48', stroke:'#22221F',
    why:'Part of the building facade, not part of your flat.',
    note:'External parapet or ledge upstand. Belongs to the building envelope and is not yours to alter.'
  }
};
