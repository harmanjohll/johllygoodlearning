/* =============================================================================
   MyHome — the flat
   -----------------------------------------------------------------------------
   Built from the official HDB sheet: 4-Room, Type-I, Blk 522.
     Floor Area          93 m²  (internal 90 m² plus the air-con ledge)
     Internal Floor Area 90 m²  measured from the centre-line of the walls

   THE DIMENSION CHAINS, as printed on the sheet
   ---------------------------------------------
     overall     12650 across, 9235 down
     top         3100 (main bedroom) + 2950 (bedroom 2) + 3050 (bedroom 3)
                 + 3550 (living/dining)                              = 12650
     left        4950 (bedrooms + passage) + 1590 (baths)
                 + 2695 (yard/kitchen)                               =  9235
     right       1400 (void) + 3550 (living) + 2900 (shelter band)
                 + 1385 (kitchen band)                               =  9235
     bath row    1090 + 2500 (bath 1) + 2565 (bath 2)
     bottom      1470 (service yard) + 3595 (kitchen) + 3550
     shelter     1700 wide

   TWO CROSS-CHECKS THAT FALL OUT ON THEIR OWN
   -------------------------------------------
   These are what say the reading is right, rather than merely plausible:

     left 4950  ==  right 1400 + 3550        the same line runs across the flat
     12650 - (1470 + 3595 + 3550) = 4035     and the kitchen's east wall then
                                             lands on 9100, the same line as
                                             bedroom 3's east wall

   AND IT RECONCILES WITH THE PRINTED AREA
   ---------------------------------------
   Tiled to the printed grid the outline is 94.33 m². The sheet says internal
   floor area is computed from the CENTRE-LINE of the walls, and the outline's
   perimeter is 43770 mm, so half a wall off all round is 43.77 x 0.1 = 4.38 m².

              94.33 - 4.38 = 89.95  ->  printed 90 m² internal
              + ledge 2500 x 1090   ->  printed 93 m²

   So the numbers below are the printed grid: every room reads on screen exactly
   as it reads on the sheet, and the 90 m² is what HDB gets after deducting the
   walls. Do not "correct" the gross to 90; that would put every room 100 mm out.

   READ FROM THE DRAWING RATHER THAN PRINTED, and the first things to check if
   this plan is ever disputed:
     - the 3550 / 1400 split of the 4950 band into bedrooms and passage
       (the alternative reading is 3850 + 1100)
     - the household shelter filling the whole 2900 band rather than ~2000 of it
     - 1890, printed between bath 2 and the living room; taken here as the
       kitchen opening, which is the only thing it fits

   LEGEND, verbatim from the sheet:
     "Structural column(s)/wall(s) which are shaded in black and all
      beams/slabs shall not be hacked, removed or tampered with."
   Everything below marked `rc`, `rcInternal` or `shelter` is one of those and
   the app refuses to remove it, which is the answer HDB gives.

   THE WAY IN is on the south wall of the Entrance, beside the household
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
    notes: 'Every dimension is a number printed on the HDB sheet. Gross to the printed grid is 94.33 m²; deducting half a wall all round gives the printed 90 m² internal.'
  },

  /* x grid:  0 · 1090 · 3100 · 3590 · 4035 · 5505 · 6050 · 6155 · 9100 · 10950 · 12650
     y grid:  0 · 1400 · 3550 · 4950 · 6540 · 7850 · 9235                    */
  rooms: [
    /* Three bedrooms across the north, 3550 deep, widths straight off the top
       chain: 3100 + 2950 + 3050, with the living/dining taking the last 3550. */
    { id:'r-main',    name:'Main Bedroom',      x1:0,     y1:0,    x2:3100,  y2:3550, floor:'engineered-oak' },
    { id:'r-bed2',    name:'Bedroom 2',         x1:3100,  y1:0,    x2:6050,  y2:3550, floor:'engineered-oak' },
    { id:'r-bed3',    name:'Bedroom 3',         x1:6050,  y1:0,    x2:9100,  y2:3550, floor:'engineered-oak' },
    /* 4950 less the 3550 bedroom depth leaves 1400 of passage. */
    { id:'r-pass',    name:'Passageway',        x1:0,     y1:3550, x2:6155,  y2:4950, floor:'porcelain-lf' },
    /* The wet core: 1590 deep, 2500 and 2565 wide, starting 1090 off the west. */
    { id:'r-bath1',   name:'Bath / WC 1',       x1:1090,  y1:4950, x2:3590,  y2:6540, floor:'porcelain-lf', wet:true },
    { id:'r-bath2',   name:'Bath / WC 2',       x1:3590,  y1:4950, x2:6155,  y2:6540, floor:'porcelain-lf', wet:true },
    /* Living/dining is an L: the 3550 strip down the east, plus the bay that
       reaches west between bedroom 3 and the kitchen. */
    { id:'r-living',  name:'Living / Dining',   x1:9100,  y1:1400, x2:12650, y2:4950, floor:'porcelain-lf' },
    { id:'r-dining',  name:'Dining',            x1:6155,  y1:3550, x2:9100,  y2:6540, floor:'porcelain-lf' },
    /* Entrance and shelter share the 2900 band; the shelter is the printed 1700. */
    { id:'r-entry',   name:'Entrance',          x1:9100,  y1:4950, x2:10950, y2:7850, floor:'porcelain-lf' },
    { id:'r-shelter', name:'Household Shelter', x1:10950, y1:4950, x2:12650, y2:7850, floor:'porcelain-lf', protected:true },
    /* The bottom band, 2695 deep: yard 1470 then kitchen 3595, ending on 9100. */
    { id:'r-yard',    name:'Service Yard',      x1:4035,  y1:6540, x2:5505,  y2:9235, floor:'porcelain-lf', wet:true },
    { id:'r-kitchen', name:'Kitchen',           x1:5505,  y1:6540, x2:9100,  y2:9235, floor:'porcelain-lf' }
  ],

  /* Part of the 93 m², outside the internal 90. Hangs off the yard's west wall. */
  ledges: [
    { id:'l-ac', name:'Air-con Ledge', x1:1535, y1:6540, x2:4035, y2:7630 }
  ],

  walls: [
    /* --- external envelope: structural concrete, shaded black ------------
       Traced clockwise from the north-west corner. The two steps are the
       void above the living room and the notch under the bathrooms.        */
    { id:'w-n',   x1:0,     y1:0,    x2:9100,  y2:0,    type:'rc' },
    { id:'w-ne',  x1:9100,  y1:0,    x2:9100,  y2:1400, type:'rc' },
    { id:'w-n2',  x1:9100,  y1:1400, x2:12650, y2:1400, type:'rc' },
    { id:'w-e',   x1:12650, y1:1400, x2:12650, y2:7850, type:'rc' },
    { id:'w-s3',  x1:12650, y1:7850, x2:9100,  y2:7850, type:'rc' },
    { id:'w-e2',  x1:9100,  y1:7850, x2:9100,  y2:9235, type:'rc' },
    { id:'w-s',   x1:9100,  y1:9235, x2:4035,  y2:9235, type:'rc' },
    { id:'w-w3',  x1:4035,  y1:9235, x2:4035,  y2:6540, type:'rc' },
    { id:'w-s2',  x1:4035,  y1:6540, x2:1090,  y2:6540, type:'rc' },
    { id:'w-w2',  x1:1090,  y1:6540, x2:1090,  y2:4950, type:'rc' },
    { id:'w-s1',  x1:1090,  y1:4950, x2:0,     y2:4950, type:'rc' },
    { id:'w-w',   x1:0,     y1:4950, x2:0,     y2:0,    type:'rc' },

    /* --- internal structural: shaded black on the sheet ------------------ */
    { id:'w-bed3E', x1:9100, y1:1400, x2:9100, y2:3550, type:'rcInternal' },
    { id:'w-kitE',  x1:9100, y1:6540, x2:9100, y2:7850, type:'rcInternal' },
    { id:'w-wetN',  x1:1090, y1:4950, x2:6155, y2:4950, type:'rcInternal' },
    { id:'w-wetS',  x1:4035, y1:6540, x2:6155, y2:6540, type:'rcInternal' },
    { id:'w-wetE',  x1:6155, y1:4950, x2:6155, y2:6540, type:'rcInternal' },
    { id:'w-bathM', x1:3590, y1:4950, x2:3590, y2:6540, type:'rcInternal' },

    /* --- household shelter: Civil Defence Shelter Act -------------------- */
    { id:'w-hs-w', x1:10950, y1:4950, x2:10950, y2:7850, type:'shelter' },
    { id:'w-hs-n', x1:10950, y1:4950, x2:12650, y2:4950, type:'shelter' },

    /* --- partitions you may remove with a permit ------------------------- */
    { id:'w-bedS',  x1:0,    y1:3550, x2:9100, y2:3550, type:'brick' },
    { id:'w-bed12', x1:3100, y1:0,    x2:3100, y2:3550, type:'brick' },
    { id:'w-bed23', x1:6050, y1:0,    x2:6050, y2:3550, type:'brick' },
    { id:'w-kitN',  x1:6155, y1:6540, x2:9100, y2:6540, type:'brick' },
    { id:'w-yardE', x1:5505, y1:6540, x2:5505, y2:9235, type:'brick' }
  ],

  openings: [
    /* w-s3 runs east to west, so pos is measured from x = 12650. */
    { id:'o-main', wallId:'w-s3', pos:2650, w:1000, type:'door', swing:'left', flip:true,
      h:2100, label:'MAIN ENTRANCE', entrance:true, locked:true },
    { id:'o-hs', wallId:'w-hs-w', pos:1950, w:750, type:'door', swing:'right', flip:false,
      h:2000, label:'Shelter door', locked:true },

    /* Bedroom doors off the passage. w-bedS runs west to east. */
    { id:'o-mainbed', wallId:'w-bedS', pos:1550, w:900, type:'door', swing:'left',  h:2100, label:'Main Bedroom' },
    { id:'o-bed2',    wallId:'w-bedS', pos:4575, w:900, type:'door', swing:'right', h:2100, label:'Bedroom 2' },
    { id:'o-bed3',    wallId:'w-bedS', pos:7575, w:900, type:'door', swing:'left',  h:2100, label:'Bedroom 3' },

    /* Bathrooms off the passage. w-wetN runs west to east from x = 1090. */
    { id:'o-bath1', wallId:'w-wetN', pos:1250, w:750, type:'door', swing:'left',  h:2100, label:'Bath / WC 1' },
    { id:'o-bath2', wallId:'w-wetN', pos:3780, w:750, type:'door', swing:'right', h:2100, label:'Bath / WC 2' },

    /* 1890 on the sheet, taken as the kitchen opening off the dining bay. */
    { id:'o-kit',   wallId:'w-kitN',  pos:1470, w:1890, type:'open', h:2200, label:'Kitchen' },
    { id:'o-kitE',  wallId:'w-kitE',  pos:655,  w:900,  type:'open', h:2100, label:'From the entrance' },
    { id:'o-yard',  wallId:'w-yardE', pos:1350, w:900,  type:'open', h:2100, label:'To the yard' },
    { id:'o-ledge', wallId:'w-w3',    pos:1350, w:900,  type:'door', swing:'left', h:2100, label:'To the A/C ledge' },

    /* Windows. */
    { id:'o-win-main',  wallId:'w-n', pos:1550, w:1800, type:'window', h:1400, sill:900, label:'Main Bedroom window' },
    { id:'o-win-b2',    wallId:'w-n', pos:4575, w:1500, type:'window', h:1400, sill:900, label:'Bedroom 2 window' },
    { id:'o-win-b3',    wallId:'w-n', pos:7575, w:1500, type:'window', h:1400, sill:900, label:'Bedroom 3 window' },
    { id:'o-win-liv',   wallId:'w-e', pos:1800, w:2600, type:'window', h:1500, sill:900, label:'Living room window' },
    { id:'o-win-liv2',  wallId:'w-n2',pos:1775, w:1800, type:'window', h:1500, sill:900, label:'Living room window' },
    { id:'o-win-kit',   wallId:'w-s', pos:1800, w:1500, type:'window', h:1400, sill:900, label:'Kitchen window' },
    { id:'o-win-yard',  wallId:'w-s', pos:4330, w:1200, type:'window', h:1400, sill:900, label:'Service yard window' }
  ],

  /* The starting furniture, laid out on this plan rather than carried over
     from an earlier one. Change anything, or use Furnish in the Add panel to
     swap the whole flat over to a different arrangement, or empty it. */
  items: [

    /* main bedroom */
    { id:'i01', catId:'bed-queen',    x:1550, y:1050, rot:0 },
    { id:'i02', catId:'wardrobe3',    x:400, y:2847, rot:270 },
    { id:'i03', catId:'fcu',          x:2875, y:2948, rot:90 },

    /* bedroom 2 */
    { id:'i04', catId:'bed-ss',       x:4575, y:1050, rot:0 },
    { id:'i05', catId:'wardrobe3',    x:3500, y:2847, rot:270 },
    { id:'i06', catId:'fcu',          x:5825, y:2948, rot:90 },

    /* bedroom 3 */
    { id:'i07', catId:'bed-ss',       x:7575, y:1050, rot:0 },
    { id:'i08', catId:'wardrobe3',    x:6450, y:2847, rot:270 },
    { id:'i09', catId:'fcu',          x:8875, y:2948, rot:90 },

    /* bath / wc 1 */
    { id:'i10', catId:'wc',           x:3140, y:5328, rot:90 },
    { id:'i11', catId:'basin',        x:1390, y:6093, rot:270 },
    { id:'i12', catId:'shower',       x:2190, y:6093, rot:270 },

    /* bath / wc 2 */
    { id:'i13', catId:'wc',           x:5705, y:5328, rot:90 },
    { id:'i14', catId:'basin',        x:3890, y:6093, rot:270 },
    { id:'i15', catId:'shower',       x:4690, y:6093, rot:270 },

    /* living / dining */
    { id:'i16', catId:'sofa2',        x:11820, y:1950, rot:0 },
    { id:'i17', catId:'tvconsole',    x:11720, y:4650, rot:180 },
    { id:'i18', catId:'dine4',        x:10185, y:3175, rot:0 },
    { id:'i19', catId:'tv55',         x:11820, y:4820, rot:180 },
    { id:'i20', catId:'rug-m',        x:11620, y:3330, rot:90 },

    /* dining */
    { id:'i21', catId:'dine4',        x:7628, y:5045, rot:0 },

    /* entrance */
    { id:'i22', catId:'shoecab',      x:10025, y:5225, rot:0 },

    /* service yard */
    { id:'i23', catId:'washstack',    x:5151, y:6965, rot:0 },
    { id:'i24', catId:'basin-u',      x:4389, y:6890, rot:0 },
    { id:'i25', catId:'laundry',      x:4770, y:7888, rot:90 },

    /* kitchen */
    { id:'i26', catId:'base600',      x:7303, y:8835, rot:180 },
    { id:'i27', catId:'sink2',        x:6607, y:8835, rot:180 },
    { id:'i28', catId:'hob60',        x:7999, y:8835, rot:180 },
    { id:'i29', catId:'hood',         x:7999, y:8835, rot:180 },
    { id:'i30', catId:'fridge2',      x:5945, y:6990, rot:0 },

    /* fixed by the developer, and by SP Group */
    { id:'i90', catId:'condenser', x:2300, y:7100, rot:0 },
    { id:'i91', catId:'db',        x:9500, y:5060, rot:0 }
  ]
};
