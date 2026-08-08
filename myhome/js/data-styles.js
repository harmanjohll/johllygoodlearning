/* =============================================================================
   MyHome — Style packs, palettes, materials
   -----------------------------------------------------------------------------
   Every palette entry carries:
     hex  — the colour
     role — where it belongs in the 60/30/10 hierarchy
     lrv  — Light Reflectance Value (0 = black, 100 = pure white).
            Rule of thumb for Singapore interiors: LRV 70+ on ceilings,
            55+ on walls in rooms with a single window, and never drop below
            LRV 25 on a large wall in a room narrower than 3 m.
   Material notes are written for a hot-humid climate (Singapore: 25-32 degC,
   70-90% RH year round), because that changes what actually survives.
   ========================================================================== */
window.MH = window.MH || {};

MH.STYLES = [
  {
    id: 'japandi',
    name: 'Japandi',
    tagline: 'Scandinavian function meets Japanese restraint.',
    origin: 'A hybrid that emerged in the 2010s: Nordic craft and daylight discipline crossed with Japanese wabi-sabi, ma (negative space) and low horizons.',
    mood: ['calm', 'warm', 'quiet', 'tactile'],
    palette: [
      { name: 'Shoji white',     hex: '#F4F1EA', role: 'Ceiling + main walls',  lrv: 88 },
      { name: 'Oat plaster',     hex: '#E4DCCD', role: 'Feature wall / plaster', lrv: 74 },
      { name: 'Warm ash',        hex: '#C9BEAC', role: 'Soft furnishings',      lrv: 55 },
      { name: 'Sumi charcoal',   hex: '#3A3733', role: 'Joinery accents, frames', lrv: 6 },
      { name: 'Clay',            hex: '#B98C6E', role: 'Accent 10%',            lrv: 32 },
      { name: 'Matcha',          hex: '#8B9578', role: 'Accent 10% / greenery', lrv: 29 }
    ],
    woods: ['White oak (rift-sawn, matt hardwax oil)', 'Ash', 'Bamboo (carbonised)', 'Walnut in small doses only'],
    surfaces: ['Lime plaster / limewash walls', 'Honed travertine', 'Tatami-look woven vinyl', 'Washi and rice-paper screens', 'Microcement in wet areas'],
    metals: ['Blackened steel', 'Unlacquered brass (let it patina)', 'Bronze — matt, never polished'],
    textiles: ['Washed linen', 'Raw cotton', 'Undyed wool (thin weave)', 'Paper cord (Wegner-style seats)'],
    lighting: { temp: '2700K', cri: '90+', notes: 'Layered and low. Paper pendants (Akari), wall washers, no bare downlight grids. Aim for 4-6 light sources per room, each dimmable.' },
    dos: [
      'Keep a low horizon: sofa backs, sideboards and beds should sit below eye level.',
      'Leave 30-40% of every wall empty. Negative space is the material.',
      'Choose one wood tone and repeat it. Two at most.',
      'Handleless or slim-profile joinery; push-to-open or a 10 mm shadow-gap pull.'
    ],
    donts: [
      'No high-gloss lacquer, no chrome, no mirrored surfaces.',
      'No cool-white light (4000K reads clinical against warm timber).',
      'Avoid gallery walls; one large piece beats nine small ones.',
      'Do not mix orange-toned teak with grey-toned oak.'
    ],
    signature: ['Low platform bed', 'Noguchi-style paper pendant', 'Slat / batten timber screen', 'Hand-thrown stoneware', 'Floor cushion or bench seating'],
    sgNotes: 'Solid oak moves in SG humidity. Use engineered oak (min. 3 mm wear layer) over solid, and keep aircon set to a stable 25 degC rather than cycling hard. Washi screens mildew near wet areas — keep them out of the yard and bathrooms.',
    budget: 'Mid to high. The look depends on joinery quality, not on furniture spend.',
    floor: '#D8C7AC', wall: '#F4F1EA', accent: '#B98C6E', wood: '#C9A87C', metal: '#3A3733'
  },
  {
    id: 'nordic',
    name: 'Norwegian / Nordic',
    tagline: 'Light first. Everything else is negotiable.',
    origin: 'Functionalism from 1950s Norway, Sweden and Denmark: pale timber, honest joints, and a national obsession with making a dark winter feel liveable. Koselig is the Norwegian word — closer to "cosy shelter" than to hygge.',
    mood: ['bright', 'airy', 'unfussy', 'cosy'],
    palette: [
      { name: 'Snow',            hex: '#FBFAF7', role: 'Ceiling + walls',       lrv: 92 },
      { name: 'Birch',           hex: '#E8DCC8', role: 'Floors, timber',        lrv: 76 },
      { name: 'Fjord grey-blue', hex: '#93A6AF', role: 'Secondary 30%',         lrv: 38 },
      { name: 'Lichen',          hex: '#A8AE96', role: 'Accent',                lrv: 40 },
      { name: 'Deep spruce',     hex: '#2F4438', role: 'Accent 10%',            lrv: 8 },
      { name: 'Ink black',       hex: '#1D1D1B', role: 'Frames, legs, hardware', lrv: 3 }
    ],
    woods: ['Birch', 'Light ash', 'Whitewashed pine', 'Pale oak'],
    surfaces: ['Painted timber panelling (vertical, 90-120 mm)', 'Matt white emulsion', 'Terrazzo in small format', 'Wool rugs over pale floor'],
    metals: ['Brushed steel', 'Matt black', 'Aged nickel'],
    textiles: ['Linen sheers (never blackout in the living areas)', 'Wool throws', 'Sheepskin', 'Cotton canvas'],
    lighting: { temp: '2700K', cri: '95', notes: 'Norwegians light rooms from many small warm points, not one bright ceiling fixture. Table lamps in the corners, a pendant low over the table, candles. Never a single central downlight.' },
    dos: [
      'Push furniture off the walls a little; let light travel behind it.',
      'Use sheer window treatments. Daylight is the primary material.',
      'Legs, not plinths — raised furniture makes floors read larger.',
      'One strong colour moment per room against all that white.'
    ],
    donts: [
      'No heavy dark curtains.',
      'No dark grout on a pale floor tile; it fragments the plane.',
      'Do not over-warm it into farmhouse; edges stay crisp.'
    ],
    signature: ['Wishbone or Series 7 chair', 'Low-slung sofa in pale bouclé or wool', 'Slim-legged sideboard', 'Enamel pendant over the dining table', 'Stack of firewood-look storage (decorative in SG)'],
    sgNotes: 'The Nordic wool-and-sheepskin layer is unwearable in Singapore. Keep the palette and the silhouettes, swap the textiles for washed linen, cotton percale and flat-weave jute. Pale birch veneers yellow under strong equatorial daylight — specify UV-stable lacquer or film the windows.',
    budget: 'Low to mid. This is the most achievable style on a modest budget.',
    floor: '#E8DCC8', wall: '#FBFAF7', accent: '#93A6AF', wood: '#DCC9A6', metal: '#8C9095'
  },
  {
    id: 'minimalist',
    name: 'Minimalist',
    tagline: 'One material, one line, nothing spare.',
    origin: 'From Donald Judd and John Pawson: reduction as a discipline. The luxury is in the tolerances, not the objects.',
    mood: ['still', 'precise', 'monastic', 'expensive-quiet'],
    palette: [
      { name: 'Chalk',           hex: '#F2F0EC', role: 'Everything, mostly',    lrv: 87 },
      { name: 'Bone',            hex: '#E3DED4', role: 'Joinery',               lrv: 76 },
      { name: 'Mushroom',        hex: '#B4ADA3', role: 'Secondary',             lrv: 45 },
      { name: 'Graphite',        hex: '#4A4A48', role: 'Accent, hardware',      lrv: 11 },
      { name: 'Pale oak',        hex: '#D6C2A3', role: 'The single wood',       lrv: 62 }
    ],
    woods: ['Pale oak veneer (one tone throughout)', 'Fenix NTM or similar matt laminate for joinery'],
    surfaces: ['Microcement (walls and floors)', 'Sintered stone / large-format porcelain 1200x2400', 'Matt paint, level 5 skim', 'Shadow-gap skirting'],
    metals: ['Matt black', 'Stainless in a brushed 4-finish', 'No visible hardware at all where possible'],
    textiles: ['Heavy plain linen', 'Undyed cotton', 'Flat wool rug in a single tone'],
    lighting: { temp: '3000K', cri: '90+', notes: 'Recessed, trimless, in a plotted grid. Cove lighting to wash ceilings. Zero visible fittings is the goal; if a fitting is visible it must be the one deliberate object in the room.' },
    dos: [
      'Storage must absorb everything. Budget 15-20% of floor area as concealed storage.',
      'Align every edge: door heads, joinery tops, window heads on one datum line.',
      'Full-height doors (2400 mm+) rather than 2100 mm with a gap above.',
      'Use a shadow gap instead of skirting; it is the single biggest tell.'
    ],
    donts: [
      'No open shelving unless you will actually curate it weekly.',
      'No visible cables, no visible sockets on feature walls.',
      'Do not confuse minimalist with empty — the few things present must be excellent.'
    ],
    signature: ['Full-height flush doors', 'Handleless island in one slab material', 'Single sculptural chair', 'Linear cove light', 'Waterfall stone edge'],
    sgNotes: 'Microcement in a Singapore bathroom needs a proper waterproofing membrane below and a good sealer above, reapplied every 2-3 years. Large-format porcelain is a safer bet for wet areas. Matt paint shows mould faster in unconditioned rooms — use a fungicidal-additive emulsion in the yard and bathrooms.',
    budget: 'High. Minimalism costs more than it looks, because every flaw is visible.',
    floor: '#DCD6CC', wall: '#F2F0EC', accent: '#4A4A48', wood: '#D6C2A3', metal: '#6E6E6C'
  },
  {
    id: 'eclectic',
    name: 'Eclectic',
    tagline: 'Collected, not decorated.',
    origin: 'Not a period style but a method: layering objects from different eras and geographies held together by a disciplined colour spine.',
    mood: ['personal', 'layered', 'lively', 'warm'],
    palette: [
      { name: 'Parchment',       hex: '#EFE6D6', role: 'Base 60%',              lrv: 82 },
      { name: 'Terracotta',      hex: '#C4693F', role: 'Accent',                lrv: 26 },
      { name: 'Teal',            hex: '#2E6B6B', role: 'Accent',                lrv: 15 },
      { name: 'Ochre',           hex: '#D19A3E', role: 'Accent',                lrv: 40 },
      { name: 'Aubergine',       hex: '#553348', role: 'Deep anchor',           lrv: 8 },
      { name: 'Walnut',          hex: '#6B4A32', role: 'Timber',                lrv: 14 }
    ],
    woods: ['Walnut', 'Teak (vintage)', 'Rattan and cane', 'Painted timber'],
    surfaces: ['Encaustic / Peranakan cement tiles', 'Patterned kilim rugs', 'Wallpaper on one wall only', 'Marble in small doses'],
    metals: ['Antique brass', 'Copper', 'Wrought iron'],
    textiles: ['Velvet', 'Ikat and block-print cotton', 'Kilim', 'Embroidered linen'],
    lighting: { temp: '2700K', cri: '90+', notes: 'Mismatched on purpose: a vintage floor lamp, a modern pendant, a pair of sconces. Warm and pooled, never even.' },
    dos: [
      'Hold it together with a rule: everything shares one of three hues, or everything shares a metal.',
      'Mix pattern scales — one large, one medium, one small. Never three mediums.',
      'Repeat each accent colour at least three times around the room.',
      'Let one wall carry the boldest move and leave the opposite wall calm.'
    ],
    donts: [
      'Do not buy a matching set of anything.',
      'Avoid symmetry everywhere; break it at least once per room.',
      'Do not let the collection grow without editing — remove one thing for each new one.'
    ],
    signature: ['Gallery wall with mixed frames', 'Peranakan or encaustic tile inlay', 'Vintage rug over neutral flooring', 'Rattan or cane cabinet', 'Statement pendant that does not match anything'],
    sgNotes: 'Peranakan tiles are locally sourceable and give an eclectic Singapore scheme real provenance. Vintage teak is abundant on the second-hand market here, but check for powderpost beetle before bringing it in — humidity accelerates infestation.',
    budget: 'Flexible. This is the style that rewards patience and second-hand hunting over spend.',
    floor: '#C9A87C', wall: '#EFE6D6', accent: '#C4693F', wood: '#6B4A32', metal: '#A8813C'
  },
  {
    id: 'wabisabi',
    name: 'Wabi-sabi',
    tagline: 'Imperfect, impermanent, incomplete.',
    origin: 'A Japanese aesthetic rooted in Zen and the tea ceremony. Value is found in weathering, asymmetry and the mark of the hand.',
    mood: ['grounded', 'raw', 'meditative', 'earthy'],
    palette: [
      { name: 'Raw plaster',     hex: '#E7E0D4', role: 'Walls',                 lrv: 78 },
      { name: 'Stone',           hex: '#C3BBAE', role: 'Secondary',             lrv: 53 },
      { name: 'Ash grey',        hex: '#948C82', role: 'Depth',                 lrv: 30 },
      { name: 'Rust',            hex: '#9C5B3C', role: 'Accent',                lrv: 18 },
      { name: 'Ink',             hex: '#2B2823', role: 'Anchor',                lrv: 4 }
    ],
    woods: ['Reclaimed timber with visible grain and knots', 'Shou sugi ban (charred cedar) as an accent', 'Unfinished oak'],
    surfaces: ['Hand-applied lime plaster with trowel marks', 'Raw or waxed concrete', 'Rough linen', 'Hand-thrown unglazed ceramic'],
    metals: ['Blackened iron', 'Raw copper allowed to verdigris'],
    textiles: ['Slubby linen', 'Hemp', 'Undyed cotton with visible weave'],
    lighting: { temp: '2400-2700K', cri: '90+', notes: 'Very warm, very low, deliberately uneven. Shadow is part of the design — read Tanizaki, In Praise of Shadows.' },
    dos: [
      'Choose materials that will look better in five years, not worse.',
      'Allow one wall to be genuinely irregular in finish.',
      'Odd numbers, asymmetric placement, off-centre hanging.'
    ],
    donts: [
      'Nothing machine-perfect or repeat-printed.',
      'No bright whites; everything is a broken white.',
      'Do not fake it with distressed factory finishes.'
    ],
    signature: ['Lime-plastered feature wall', 'Single branch in a heavy vessel', 'Low, chunky timber bench', 'Linen curtain hung simply from a rod', 'Handmade tableware left visible'],
    sgNotes: 'Lime plaster is genuinely breathable, which suits SG walls that suffer from rising damp better than vinyl-based paints do. Find a specialist applicator — this is not a standard local painter finish. Raw copper patinates fast in coastal Singapore air, which is either the point or a problem.',
    budget: 'Mid. Spend on the plaster and one or two hand-made objects; save everywhere else.',
    floor: '#B9AC96', wall: '#E7E0D4', accent: '#9C5B3C', wood: '#8A7358', metal: '#3A352E'
  },
  {
    id: 'midcentury',
    name: 'Mid-century modern',
    tagline: 'Warm timber, tapered legs, optimistic colour.',
    origin: '1945-1969, from Scandinavia and California. Post-war optimism, new manufacturing, open plan living, indoor-outdoor flow.',
    mood: ['optimistic', 'graphic', 'warm', 'sociable'],
    palette: [
      { name: 'Warm white',      hex: '#F5F0E6', role: 'Walls',                 lrv: 86 },
      { name: 'Teak',            hex: '#A0714A', role: 'Timber 30%',            lrv: 26 },
      { name: 'Mustard',         hex: '#D6A02E', role: 'Accent',                lrv: 41 },
      { name: 'Olive',           hex: '#6E7343', role: 'Accent',                lrv: 19 },
      { name: 'Burnt orange',    hex: '#C05A2B', role: 'Accent',                lrv: 22 },
      { name: 'Slate',           hex: '#42474B', role: 'Anchor',                lrv: 8 }
    ],
    woods: ['Teak', 'Walnut', 'Afromosia', 'Rosewood veneer (accent only)'],
    surfaces: ['Terrazzo', 'Cork', 'Wood-slat screens', 'Geometric tile'],
    metals: ['Brass', 'Powder-coated steel in colour', 'Chrome (this is the one style where chrome works)'],
    textiles: ['Wool bouclé', 'Tweed', 'Leather (tan, cognac)', 'Graphic prints'],
    lighting: { temp: '2700K', cri: '90+', notes: 'Sculptural fittings are the point: globe pendants, arc floor lamps, Sputnik chandeliers. Fittings are furniture here.' },
    dos: [
      'Raise everything on legs — this style hates plinths.',
      'Pair one timber tone with one bold accent colour and stay disciplined.',
      'Use a sideboard as the anchor of the living room.',
      'Geometric, not organic, in your patterns.'
    ],
    donts: [
      'No heavy ornament, no traditional mouldings.',
      'Do not overdo the retro or it becomes a themed diner.',
      'Avoid cool grey — this palette runs warm.'
    ],
    signature: ['Teak sideboard', 'Egg / Eames lounge chair', 'Arc floor lamp', 'Starburst clock (one only)', 'Terrazzo coffee table'],
    sgNotes: 'Teak is the local historical timber, and Singapore has a strong vintage-teak market. Original 1960s pieces here are often already acclimatised to humidity, which makes them safer than imported European walnut.',
    budget: 'Mid to high if buying originals; low if buying good reproductions and one real piece.',
    floor: '#B98A5E', wall: '#F5F0E6', accent: '#D6A02E', wood: '#A0714A', metal: '#B08D4F'
  },
  {
    id: 'industrial',
    name: 'Industrial',
    tagline: 'Structure left visible.',
    origin: 'Converted New York and London warehouses, 1970s onwards. The guts of the building become the finish.',
    mood: ['raw', 'urban', 'masculine', 'robust'],
    palette: [
      { name: 'Concrete',        hex: '#B7B4AE', role: 'Walls, floors',         lrv: 46 },
      { name: 'Off-white',       hex: '#EDEAE4', role: 'Ceiling',               lrv: 84 },
      { name: 'Steel black',     hex: '#2A2A2C', role: 'Frames, structure',     lrv: 4 },
      { name: 'Brick red',       hex: '#8C4B38', role: 'Accent',                lrv: 15 },
      { name: 'Tan leather',     hex: '#9C6B45', role: 'Furniture',             lrv: 22 }
    ],
    woods: ['Reclaimed scaffold board', 'Rough-sawn pine', 'Dark-stained oak'],
    surfaces: ['Screed / polished concrete', 'Exposed brick', 'Wire mesh', 'Blackened steel plate', 'Cement-look porcelain'],
    metals: ['Black steel', 'Galvanised', 'Raw aluminium'],
    textiles: ['Aged leather', 'Heavy canvas', 'Denim-weight cotton'],
    lighting: { temp: '2700K', cri: '85+', notes: 'Track lighting, cage pendants, articulated wall lamps. Keep the fittings honest but use modern warm LED — genuine filament bulbs are dim and hot.' },
    dos: [
      'Expose the ceiling services if the slab height allows (SG HDB gives you about 2600 mm — it usually does not).',
      'Use black metal-framed glazing to divide space without losing light.',
      'Ground the hard materials with one very soft element: a rug or a deep sofa.'
    ],
    donts: [
      'Do not go all-grey; this style needs the tan-leather and timber warmth to stay habitable.',
      'Avoid exposed conduit in a home with children unless properly rated.',
      'No fake brick wallpaper.'
    ],
    signature: ['Black metal-framed glass partition', 'Chesterfield or tan leather sofa', 'Cage or dome pendant on a long flex', 'Open steel shelving', 'Concrete-look feature wall'],
    sgNotes: 'HDB ceilings around 2.6 m make true loft industrial hard. Take the material palette rather than the volume. Exposed concrete in SG humidity can sweat where aircon runs cold — seal it. Black metal frames get hot in direct west sun.',
    budget: 'Mid. Concrete-look porcelain is far cheaper and more practical than real polished screed.',
    floor: '#A9A69F', wall: '#B7B4AE', accent: '#8C4B38', wood: '#7A5C42', metal: '#2A2A2C'
  },
  {
    id: 'coastal',
    name: 'Coastal / Resort',
    tagline: 'The holiday you do not have to fly to.',
    origin: 'Hamptons and Balinese resort vernacular, adapted across Southeast Asia. Pale, breezy, low-contrast.',
    mood: ['relaxed', 'breezy', 'bright', 'generous'],
    palette: [
      { name: 'Shell white',     hex: '#FAF7F0', role: 'Walls, ceiling',        lrv: 91 },
      { name: 'Sand',            hex: '#E0D3BC', role: 'Secondary',             lrv: 67 },
      { name: 'Driftwood',       hex: '#B3A692', role: 'Timber',                lrv: 41 },
      { name: 'Seafoam',         hex: '#9BB8B4', role: 'Accent',                lrv: 45 },
      { name: 'Deep ocean',      hex: '#2C4A5C', role: 'Accent 10%',            lrv: 9 }
    ],
    woods: ['Teak (outdoor grade)', 'Whitewashed oak', 'Rattan', 'Bamboo'],
    surfaces: ['Limewash walls', 'Jute and sisal rugs', 'Linen sheers', 'Travertine or shell-stone'],
    metals: ['Brushed brass', 'Weathered nickel', 'Rope and natural cord details'],
    textiles: ['Washed linen', 'Cotton slub', 'Jute', 'Light canvas'],
    lighting: { temp: '2700-3000K', cri: '90', notes: 'Daylight-led. Rattan pendants, plaster wall lights, and a ceiling fan that is part of the look rather than an apology.' },
    dos: [
      'Maximise cross-ventilation; this style assumes moving air.',
      'Keep contrast low — it is what makes a room feel cool.',
      'Natural fibre underfoot in every room.'
    ],
    donts: [
      'No literal nautical motifs. No anchors, no stripes-on-everything.',
      'Avoid heavy dark timber.',
      'Do not use rattan in an unconditioned yard; it goes brittle and mouldy.'
    ],
    signature: ['Rattan pendant', 'Slipcovered sofa in white linen', 'Louvred or plantation shutters', 'Large-leaf greenery', 'Timber ceiling fan'],
    sgNotes: 'This is arguably the most climate-honest style for Singapore. Ceiling fans plus 27 degC aircon beats 23 degC aircon alone, and the palette holds up in strong daylight. Specify marine-grade or powder-coated hardware; SG air is corrosive to untreated steel.',
    budget: 'Low to mid.',
    floor: '#E0D3BC', wall: '#FAF7F0', accent: '#9BB8B4', wood: '#C4B190', metal: '#B49A6B'
  },
  {
    id: 'tropicalmodern',
    name: 'Tropical Modern',
    tagline: 'Built for this climate, not imported into it.',
    origin: 'Geoffrey Bawa in Sri Lanka, Kerry Hill and the Singapore black-and-white bungalow tradition. Deep shade, cross-breeze, timber screens, hard local materials.',
    mood: ['shaded', 'green', 'crafted', 'cool'],
    palette: [
      { name: 'Lime white',      hex: '#F3F1E9', role: 'Walls',                 lrv: 89 },
      { name: 'Terrazzo grey',   hex: '#CFCDC4', role: 'Floors',                lrv: 60 },
      { name: 'Chengal brown',   hex: '#7A5738', role: 'Timber screens',        lrv: 15 },
      { name: 'Monstera',        hex: '#3F6B45', role: 'Accent / planting',     lrv: 15 },
      { name: 'Black',           hex: '#1E1E1E', role: 'Frames, grilles',       lrv: 3 },
      { name: 'Coral clay',      hex: '#C97F5E', role: 'Accent 10%',            lrv: 27 }
    ],
    woods: ['Chengal', 'Balau', 'Teak', 'Bamboo'],
    surfaces: ['In-situ terrazzo', 'Cement screed', 'Breeze blocks / perforated screens', 'Timber batten screens', 'Terracotta'],
    metals: ['Black powder-coated aluminium', 'Marine-grade stainless'],
    textiles: ['Batik accents', 'Raw cotton', 'Rattan weave'],
    lighting: { temp: '2700K', cri: '90', notes: 'Uplights into planting, low-level path lighting, warm and sparse. Let daylight do the heavy lifting and shade it rather than blocking it.' },
    dos: [
      'Screen the west sun — battens, louvres or planting, not curtains.',
      'Terrazzo or screed floors stay cool underfoot and never warp.',
      'Design for a breeze path: an opening on both sides of every room you can manage.',
      'Bring planting inside; it is a material, not decoration.'
    ],
    donts: [
      'No wall-to-wall carpet.',
      'Avoid MDF joinery in the yard or near windows — it swells.',
      'Do not seal the flat and rely purely on aircon; you will fight mould.'
    ],
    signature: ['Timber batten screen', 'In-situ terrazzo floor', 'Large ceiling fan', 'Indoor planter run', 'Black-framed full-height glazing'],
    sgNotes: 'This is the native answer. Terrazzo is locally poured and lasts decades. Chengal and balau tolerate SG humidity without deforming. Perforated screens on the service yard keep rain out while keeping the flat ventilated when the aircon is off.',
    budget: 'Mid to high — in-situ terrazzo and hardwood screens are the cost drivers.',
    floor: '#CFCDC4', wall: '#F3F1E9', accent: '#3F6B45', wood: '#7A5738', metal: '#1E1E1E'
  },
  {
    id: 'modernluxe',
    name: 'Modern Luxe (dark)',
    tagline: 'Deep tones, fluted timber, controlled glow.',
    origin: 'Contemporary hotel design: the Aman and Park Hyatt palette brought home. Dark, enveloping, and lit like a bar.',
    mood: ['moody', 'enveloping', 'polished', 'intimate'],
    palette: [
      { name: 'Greige',          hex: '#D9D3C9', role: 'Ceiling, relief',       lrv: 66 },
      { name: 'Deep forest',     hex: '#2C3B33', role: 'Feature walls',         lrv: 6 },
      { name: 'Charcoal',        hex: '#33322F', role: 'Joinery',               lrv: 4 },
      { name: 'Fluted walnut',   hex: '#5A3D28', role: 'Timber 30%',            lrv: 9 },
      { name: 'Brushed brass',   hex: '#A8894F', role: 'Accent 10%',            lrv: 27 },
      { name: 'Bone',            hex: '#E8E1D5', role: 'Relief, textiles',      lrv: 78 }
    ],
    woods: ['Fluted / reeded walnut', 'Smoked oak', 'Ebonised ash'],
    surfaces: ['Sintered stone with dramatic veining', 'Fluted glass', 'Velvet', 'Brushed metal inlay', 'Book-matched slab'],
    metals: ['Brushed brass', 'Gunmetal', 'Champagne bronze'],
    textiles: ['Velvet', 'Heavy linen', 'Silk-look blends', 'Deep-pile rugs'],
    lighting: { temp: '2700K', cri: '95', notes: 'Cove lighting, concealed strips under joinery, wall washers and dimmers everywhere. Ambient plus accent only — never a bright general layer. Every circuit must dim.' },
    dos: [
      'Reserve dark walls for the rooms with the most daylight, or the ones you only use at night.',
      'Balance every dark surface with one reflective one — fluted glass, brushed metal, stone.',
      'Vertical fluting makes a 2.6 m HDB ceiling read taller.',
      'Put a dimmer on everything. The style lives or dies on it.'
    ],
    donts: [
      'Do not paint a small bedroom dark on all four walls; do the headboard wall only.',
      'Avoid polished chrome; it cheapens the brass.',
      'No cool white light anywhere in this scheme.'
    ],
    signature: ['Fluted walnut feature wall', 'Book-matched stone slab backsplash', 'Brass linear pendant', 'Velvet armchair', 'Concealed cove lighting'],
    sgNotes: 'Dark matt paint shows dust and hand marks quickly in a humid climate — use a washable eggshell rather than a true matt. Real marble stains fast in a Singapore kitchen; sintered stone (Dekton, Neolith, Lamitak-type surfaces) gives the same drama and survives.',
    budget: 'High. Fluted joinery and stone slabs are the cost.',
    floor: '#4A4038', wall: '#2C3B33', accent: '#A8894F', wood: '#5A3D28', metal: '#A8894F'
  },
  {
    id: 'biophilic',
    name: 'Biophilic',
    tagline: 'Design as if you were still an animal.',
    origin: 'From E.O. Wilson\'s biophilia hypothesis, formalised for buildings by Stephen Kellert and by the WELL standard. Measurable effects on stress, recovery and attention.',
    mood: ['alive', 'green', 'restorative', 'soft'],
    palette: [
      { name: 'Cloud',           hex: '#F4F3EE', role: 'Walls',                 lrv: 90 },
      { name: 'Moss',            hex: '#7E8C63', role: 'Secondary',             lrv: 27 },
      { name: 'Deep leaf',       hex: '#354E38', role: 'Accent',                lrv: 8 },
      { name: 'Bark',            hex: '#6E5741', role: 'Timber',                lrv: 14 },
      { name: 'River stone',     hex: '#A9A79E', role: 'Stone, texture',        lrv: 40 },
      { name: 'Sunlight',        hex: '#E5C77E', role: 'Warmth accent',         lrv: 60 }
    ],
    woods: ['Oak with strong visible grain', 'Bamboo', 'Cork'],
    surfaces: ['Living green wall', 'Natural stone with fossil texture', 'Cork flooring', 'Wool and jute', 'Water feature'],
    metals: ['Aged brass', 'Blackened steel'],
    textiles: ['Wool', 'Jute', 'Organic cotton', 'Leaf-pattern prints at large scale'],
    lighting: { temp: 'Tunable 2700-4000K', cri: '95', notes: 'Circadian: cooler and brighter in the morning, warmer and dimmer after 7pm. Prioritise daylight access to every habitable room; a view of greenery from the desk is worth more than any fitting.' },
    dos: [
      'Group plants in threes at different heights rather than dotting them singly.',
      'Choose plants that actually thrive indoors in SG: pothos, monstera, snake plant, ZZ, philodendron, fiddle-leaf fig near a bright window.',
      'Introduce natural pattern — wood grain, stone veining, leaf shapes at varied scale.',
      'Prospect and refuge: a seat with a view out and something solid behind it.'
    ],
    donts: [
      'No plastic plants; they defeat the entire evidence base.',
      'Do not put a plant somewhere with under 200 lux — it will die and depress the room.',
      'Avoid pure grey; nature has almost no true neutrals.'
    ],
    signature: ['Planter run along a window', 'Timber slat ceiling detail', 'Natural stone basin', 'Large-scale botanical artwork', 'Reading chair facing the window'],
    sgNotes: 'Singapore is the easiest place on earth to do this. Balcony and service-yard planting thrives year round. Watch drainage: standing water is an Aedes mosquito breeding offence under NEA rules, so specify self-watering pots with sealed reservoirs.',
    budget: 'Low to mid. Plants and daylight are cheap; the green wall is not.',
    floor: '#B99C74', wall: '#F4F3EE', accent: '#7E8C63', wood: '#6E5741', metal: '#8A7448'
  },
  {
    id: 'bauhaus',
    name: 'Bauhaus / Modernist',
    tagline: 'Form follows function, and colour is a system.',
    origin: 'Weimar and Dessau, 1919-1933. Primary colours, geometric clarity, tubular steel, and the belief that good design is a social good.',
    mood: ['graphic', 'rational', 'bold', 'clean'],
    palette: [
      { name: 'White',           hex: '#FAFAF8', role: 'Ground',                lrv: 92 },
      { name: 'Bauhaus red',     hex: '#C1272D', role: 'Primary accent',        lrv: 13 },
      { name: 'Bauhaus blue',    hex: '#22467F', role: 'Primary accent',        lrv: 9 },
      { name: 'Bauhaus yellow',  hex: '#F1C40F', role: 'Primary accent',        lrv: 62 },
      { name: 'Black',           hex: '#111111', role: 'Line',                  lrv: 2 },
      { name: 'Grey',            hex: '#A7A9AC', role: 'Neutral',               lrv: 40 }
    ],
    woods: ['Beech', 'Birch ply with exposed edges', 'Black-stained ash'],
    surfaces: ['Flat colour paint blocks', 'Linoleum', 'Glass block', 'Steel mesh'],
    metals: ['Chrome tubular steel', 'Black powder coat'],
    textiles: ['Flat woven wool in geometric blocks (Anni Albers)', 'Canvas', 'Leather straps'],
    lighting: { temp: '3000K', cri: '90', notes: 'Opal glass globes, Wagenfeld table lamp, Kaiser Idell. Fittings are geometry: sphere, cylinder, cone.' },
    dos: [
      'Use colour as a plane, not as an accessory — paint one whole wall or one whole joinery run.',
      'Keep the geometry pure: circle, square, triangle.',
      'Expose the construction. Visible fixings are honest, not unfinished.'
    ],
    donts: [
      'No more than three primaries in one room.',
      'Avoid ornament entirely.',
      'Do not soften it with pattern.'
    ],
    signature: ['Wassily or Cesca chair', 'Wagenfeld lamp', 'Colour-blocked joinery', 'Bauhaus poster (real reproduction, framed simply)', 'Tubular steel shelving'],
    sgNotes: 'Chrome pits in humid coastal air. Specify triple-plated chrome or substitute black powder coat. Strong equatorial daylight will fade Bauhaus red and yellow on a west wall within a few years — use UV-filtering window film.',
    budget: 'Mid. Colour is cheap; the licensed furniture is not.',
    floor: '#D9D6D0', wall: '#FAFAF8', accent: '#C1272D', wood: '#D2B48C', metal: '#B8BCC0'
  },
  {
    id: 'maximalist',
    name: 'Maximalist',
    tagline: 'More is more, held together by nerve.',
    origin: 'A reaction to minimalism, from the Memphis Group through to contemporary British decorators. Saturated colour, dense pattern, unapologetic layering.',
    mood: ['bold', 'joyful', 'dense', 'theatrical'],
    palette: [
      { name: 'Emerald',         hex: '#1D5C4C', role: 'Walls',                 lrv: 10 },
      { name: 'Fuchsia',         hex: '#B03060', role: 'Accent',                lrv: 12 },
      { name: 'Saffron',         hex: '#E0A22B', role: 'Accent',                lrv: 44 },
      { name: 'Cobalt',          hex: '#2A4B9B', role: 'Accent',                lrv: 12 },
      { name: 'Cream',           hex: '#F3EBDC', role: 'Relief',                lrv: 84 },
      { name: 'Gold',            hex: '#B8944D', role: 'Metal',                 lrv: 31 }
    ],
    woods: ['Lacquered timber in colour', 'Burl veneer', 'Dark stained oak'],
    surfaces: ['Bold wallpaper', 'Patterned tile', 'Marble', 'Mirror', 'Velvet everywhere'],
    metals: ['Polished brass', 'Gold', 'Lacquered colour'],
    textiles: ['Velvet', 'Silk', 'Large-scale florals', 'Fringe and trim'],
    lighting: { temp: '2700K', cri: '90+', notes: 'Lamps everywhere, shaded and warm. Pools of light rather than general illumination; the room should have shadows for the pattern to fall into.' },
    dos: [
      'Anchor the chaos: one repeated colour through every room.',
      'Vary pattern scale deliberately — large, medium, small, never three of one size.',
      'Paint the ceiling too. A maximalist room with a white ceiling looks unfinished.',
      'Symmetry helps. Dense plus symmetrical reads as considered; dense plus random reads as clutter.'
    ],
    donts: [
      'Do not skip the edit — the difference between maximalist and messy is roughly 20% fewer things.',
      'Avoid cool light; it flattens saturated colour.',
      'Do not do it in a small dark room with one window.'
    ],
    signature: ['Papered or colour-drenched walls including the ceiling', 'Velvet sofa in a strong colour', 'Gallery wall, densely hung', 'Patterned rug over patterned floor', 'Collections displayed en masse'],
    sgNotes: 'Colour-drenching (walls, ceiling, joinery and trim in one colour) is the cheapest way to get this look and works well in HDB rooms where architectural detail is absent. Wallpaper needs a mould-resistant adhesive here, and never goes on an external wall that gets afternoon sun.',
    budget: 'Flexible. Paint is cheap; the layering takes time rather than money.',
    floor: '#7A5230', wall: '#1D5C4C', accent: '#B03060', wood: '#5B3A22', metal: '#B8944D'
  },
  {
    id: 'warmcontemporary',
    name: 'Warm Contemporary',
    tagline: 'The safe, good default. Neutral but not cold.',
    origin: 'The mainstream of 2020s interiors: soft neutrals, curved forms, warm woods, quiet luxury. Low risk, ages well, sells well.',
    mood: ['comfortable', 'soft', 'current', 'easy'],
    palette: [
      { name: 'Alabaster',       hex: '#F6F2EA', role: 'Walls, ceiling',        lrv: 88 },
      { name: 'Greige',          hex: '#DAD2C5', role: 'Secondary 30%',         lrv: 68 },
      { name: 'Taupe',           hex: '#A99B8B', role: 'Depth',                 lrv: 36 },
      { name: 'Caramel',         hex: '#B07E52', role: 'Leather, accent',       lrv: 25 },
      { name: 'Espresso',        hex: '#3B322B', role: 'Anchor',                lrv: 5 },
      { name: 'Sage',            hex: '#9AA891', role: 'Optional accent',       lrv: 38 }
    ],
    woods: ['Natural oak', 'Light walnut', 'Oak-look laminate for budget joinery'],
    surfaces: ['Quartz or sintered stone', 'Large-format porcelain', 'Bouclé', 'Rounded plaster forms', 'Fluted panel in small doses'],
    metals: ['Brushed brass', 'Matt black', 'Brushed nickel'],
    textiles: ['Bouclé', 'Linen blend', 'Chenille', 'Cotton velvet'],
    lighting: { temp: '3000K', cri: '90', notes: 'A general layer on a dimmer plus task and accent. Magnetic track systems are the current practical answer in HDB flats — flexible and easy to re-aim.' },
    dos: [
      'Curves in at least two places per room: an arch, a round table, a bullnosed counter.',
      'Repeat your metal finish consistently within a room.',
      'Buy the sofa well; it carries the whole scheme.'
    ],
    donts: [
      'Do not use more than two metal finishes in one space.',
      'Avoid grey-beige overload — you need the caramel and espresso for depth.',
      'Do not match the timber floor to the timber joinery exactly; go two shades apart or make them clearly different.'
    ],
    signature: ['Bouclé curved sofa', 'Arched mirror', 'Fluted island front', 'Brushed brass tapware', 'Oak herringbone floor'],
    sgNotes: 'The default local ID look, which means contractors know how to build it and materials are easy to source. Herringbone in engineered oak or vinyl plank both work in HDB. Bouclé attracts dust and can mildew in an unconditioned room — keep it in the aircon zone.',
    budget: 'Mid. Very achievable with local ID contractors.',
    floor: '#C9A87C', wall: '#F6F2EA', accent: '#B07E52', wood: '#BE9A6E', metal: '#A88C5C'
  }
];

/* ---------------------------------------------------------------------------
   Material library. priceBand is an indicative Singapore supply-and-install
   range in SGD. These move; treat them as order-of-magnitude, not a quote.
   humidity: 1 = struggles in SG, 5 = thrives.
   ------------------------------------------------------------------------ */
MH.MATERIALS = [
  // --- Flooring ---
  { id:'porcelain-lf', cat:'Floor', name:'Large-format porcelain (600x1200 / 800x800)', hex:'#DAD6CE',
    price:'S$8-18 psf', humidity:5, maintenance:'Very low',
    note:'The default HDB floor for good reason: dimensionally stable, cool underfoot, waterproof. Rectified edges give a 2 mm grout line and a near-seamless plane. Matt finish is safer than polished in a wet-shoe household.' },
  { id:'engineered-oak', cat:'Floor', name:'Engineered oak (3-4 mm wear layer)', hex:'#C9A87C',
    price:'S$12-25 psf', humidity:3, maintenance:'Medium',
    note:'Multi-ply core handles SG humidity far better than solid oak. Insist on a 3 mm+ wear layer so it can be sanded once. Acclimatise 72 hours on site before laying. Not for the yard or bathrooms.' },
  { id:'vinyl-spc', cat:'Floor', name:'SPC / rigid-core vinyl plank', hex:'#C0A382',
    price:'S$4-9 psf', humidity:5, maintenance:'Very low',
    note:'Stone-polymer core: waterproof, click-lock, 4-6 mm, quiet underfoot. The pragmatic choice for HDB bedrooms. Check the wear layer is at least 0.5 mm and that it is phthalate-free.' },
  { id:'terrazzo', cat:'Floor', name:'In-situ terrazzo', hex:'#CFCDC4',
    price:'S$25-45 psf', humidity:5, maintenance:'Low (reseal ~5 yrs)',
    note:'Poured, ground and polished on site — genuinely seamless, cool, and lasts 40+ years. Singapore has a real terrazzo tradition and remaining craftsmen. Needs 5-7 days of site time and adds ~15 mm of height.' },
  { id:'microcement', cat:'Floor', name:'Microcement / seamless screed', hex:'#BEB9B0',
    price:'S$20-35 psf', humidity:3, maintenance:'Medium (reseal 2-3 yrs)',
    note:'2-3 mm applied over existing substrate. Beautiful and continuous, but hairline cracking is normal and it is unforgiving of substrate movement. In wet areas the membrane underneath does the real work.' },
  { id:'cork', cat:'Floor', name:'Cork', hex:'#C79A63',
    price:'S$10-16 psf', humidity:3, maintenance:'Medium',
    note:'Warm, quiet, resilient, renewable. Good under a piano or in a study. Dents under point loads and fades in direct sun.' },

  // --- Walls ---
  { id:'emulsion', cat:'Wall', name:'Matt emulsion, fungicidal', hex:'#F2EFE8',
    price:'S$1.50-3 psf', humidity:4, maintenance:'Repaint 4-6 yrs',
    note:'In Singapore always specify an anti-fungal / anti-bacterial formulation on external walls, bathroom ceilings and the yard. Nippon Odour-less Anti-Formaldehyde and Dulux Ambiance are the common local specs.' },
  { id:'limewash', cat:'Wall', name:'Limewash / lime plaster', hex:'#E7E0D4',
    price:'S$8-20 psf', humidity:5, maintenance:'Low',
    note:'Breathable, mineral, and mildly alkaline so mould struggles on it — genuinely well suited to SG walls with rising damp. Gives soft cloudy movement no paint can imitate. Needs a specialist applicator.' },
  { id:'fluted-panel', cat:'Wall', name:'Fluted / reeded timber panel', hex:'#8A6647',
    price:'S$25-60 psf', humidity:3, maintenance:'Low, dusts easily',
    note:'Vertical fluting adds perceived ceiling height, which matters at HDB 2.6 m. Specify MDF-core with veneer for stability, or solid ash if budget allows. Keep it out of wet zones.' },
  { id:'microcement-wall', cat:'Wall', name:'Microcement wall finish', hex:'#C6C1B8',
    price:'S$18-32 psf', humidity:4, maintenance:'Medium',
    note:'Seamless and monolithic. Works beautifully in a shower if the waterproofing membrane and sealer are done properly by a specialist.' },
  { id:'wallpaper', cat:'Wall', name:'Non-woven wallpaper', hex:'#E4DACB',
    price:'S$6-20 psf', humidity:2, maintenance:'Medium',
    note:'Use only on internal, air-conditioned walls. On an external HDB wall in SG it will lift or grow mould behind within a few years. Mould-resistant adhesive is essential.' },
  { id:'tile-subway', cat:'Wall', name:'Ceramic tile (subway / zellige-look)', hex:'#E8E4DA',
    price:'S$5-25 psf', humidity:5, maintenance:'Very low',
    note:'Zellige-look glazed tile gives handmade variation without the price or the fragility of real zellige. Dark grout hides kitchen life; light grout looks better for about a year.' },

  // --- Worktops ---
  { id:'sintered', cat:'Worktop', name:'Sintered stone (Dekton / Neolith class)', hex:'#EDEAE4',
    price:'S$180-320 per ft run', humidity:5, maintenance:'Very low',
    note:'Non-porous, heat-proof, UV-stable, will not stain from turmeric or soy. The right answer for a Singapore kitchen that actually cooks Asian food. Can chip on a sharp edge impact.' },
  { id:'quartz', cat:'Worktop', name:'Engineered quartz', hex:'#E6E2DA',
    price:'S$110-220 per ft run', humidity:5, maintenance:'Low',
    note:'93% quartz in resin. Excellent stain resistance, but the resin will scorch — never put a hot wok down directly. Discolours slightly under years of direct sunlight.' },
  { id:'solid-surface', cat:'Worktop', name:'Solid surface (acrylic)', hex:'#F0EDE6',
    price:'S$90-160 per ft run', humidity:5, maintenance:'Low, repairable',
    note:'Seamless joints and integrated sinks are its trick. Scratches, but sands out. Poor heat tolerance.' },
  { id:'stainless', cat:'Worktop', name:'Stainless steel', hex:'#C6CACC',
    price:'S$120-250 per ft run', humidity:5, maintenance:'Low, shows marks',
    note:'The professional-kitchen answer and very common in Singapore wet kitchens. Hygienic, heatproof, indestructible. Will show every fingerprint and fine scratch — which becomes a patina.' },
  { id:'marble', cat:'Worktop', name:'Natural marble', hex:'#EFEDE8',
    price:'S$150-400+ per ft run', humidity:4, maintenance:'High',
    note:'Etches on contact with lime, vinegar, tomato. Beautiful and honest if you accept patina; a mistake if you want it to look new. Consider it for a dry-kitchen island only.' },

  // --- Joinery ---
  { id:'ply-veneer', cat:'Joinery', name:'Plywood carcass with veneer', hex:'#C9A87C',
    price:'S$180-320 per ft run', humidity:4, maintenance:'Low',
    note:'Marine or moisture-resistant ply is the durable HDB carcass spec. Costs 20-30% more than MDF and is worth every dollar in this climate, especially in the kitchen and yard.' },
  { id:'mdf-laminate', cat:'Joinery', name:'MDF carcass with laminate', hex:'#D8D2C6',
    price:'S$120-220 per ft run', humidity:2, maintenance:'Low',
    note:'The standard budget spec. Swells irreversibly if it gets wet — never under a sink, never in the yard. Fine for bedroom wardrobes in an air-conditioned room.' },
  { id:'fenix', cat:'Joinery', name:'Fenix NTM / anti-fingerprint matt laminate', hex:'#3F3F3D',
    price:'S$260-420 per ft run', humidity:5, maintenance:'Very low',
    note:'Soft-touch, genuinely matt, thermally repairable micro-scratches. The best surface for a dark handleless kitchen where fingerprints would otherwise ruin it.' },
  { id:'rattan-cane', cat:'Joinery', name:'Cane / rattan webbing insert', hex:'#C6A377',
    price:'S$40-90 per panel', humidity:3, maintenance:'Medium',
    note:'Adds craft and lets cabinets breathe. In SG keep it inside the air-conditioned zone; in a humid yard it sags and spots.' },

  // --- Metal & tapware ---
  { id:'brushed-brass', cat:'Metal', name:'Brushed brass / PVD gold', hex:'#A8894F',
    price:'Premium 30-60% over chrome', humidity:4, maintenance:'Low if PVD',
    note:'Specify PVD-coated rather than lacquered brass — lacquer fails in SG humidity and then the brass blotches. Unlacquered brass is fine if you want the patina deliberately.' },
  { id:'matt-black', cat:'Metal', name:'Matt black powder coat', hex:'#2A2A2C',
    price:'Standard to +15%', humidity:5, maintenance:'Shows limescale',
    note:'Durable and universally available locally. Singapore water is soft-to-moderate so limescale is manageable, but white water spots show on black more than on chrome.' },
  { id:'stainless-316', cat:'Metal', name:'Marine-grade stainless 316', hex:'#C6CACC',
    price:'+40% over 304', humidity:5, maintenance:'Very low',
    note:'Use 316 rather than 304 for anything on the service yard, balcony or aircon ledge. Coastal air in Singapore will tea-stain 304 within a couple of years.' },

  // --- Textiles ---
  { id:'linen', cat:'Textile', name:'Washed linen', hex:'#DCD5C7',
    price:'S$40-120 per m', humidity:5, maintenance:'Low',
    note:'The best upholstery and curtain fibre for this climate: breathable, fast-drying, gets better with washing. Creasing is the aesthetic, not a fault.' },
  { id:'boucle', cat:'Textile', name:'Bouclé', hex:'#E5E0D5',
    price:'S$70-180 per m', humidity:2, maintenance:'High',
    note:'The signature contemporary texture, but it traps dust and can mildew in a room that is never air-conditioned. Choose a synthetic-blend bouclé over pure wool in Singapore.' },
  { id:'performance-weave', cat:'Textile', name:'Performance / solution-dyed acrylic', hex:'#CFC8BC',
    price:'S$60-140 per m', humidity:5, maintenance:'Very low',
    note:'Sunbrella-class fabrics: bleach-cleanable, UV-stable, mould-resistant. The sensible answer for a family sofa near a window in SG.' },
  { id:'jute', cat:'Textile', name:'Jute / sisal rug', hex:'#C4A87A',
    price:'S$150-600 per rug', humidity:3, maintenance:'Medium',
    note:'Cool underfoot and beautifully textural, but absorbs spills permanently and can smell in high humidity. Keep it out of the dining zone.' },

  // --- Glazing & screening ---
  { id:'slim-frame-glass', cat:'Glazing', name:'Slim black-framed glass partition', hex:'#2A2A2C',
    price:'S$180-320 psf', humidity:5, maintenance:'Low',
    note:'The best way to close off a study or kitchen without losing daylight — critical in a deep-plan HDB flat. Specify tempered safety glass; in Singapore this is mandatory for full-height panels.' },
  { id:'timber-batten', cat:'Glazing', name:'Timber batten screen', hex:'#7A5738',
    price:'S$30-70 psf', humidity:4, maintenance:'Low',
    note:'Filters light, hides clutter, and lets air move. 40-60 mm battens at 40-80 mm gaps is the sweet spot. Chengal or balau outdoors, oak or ash indoors.' },
  { id:'sheer-linen', cat:'Glazing', name:'Sheer linen curtain + blackout track', hex:'#EFEAE0',
    price:'S$60-160 per m width', humidity:5, maintenance:'Low',
    note:'Double track is standard in SG: a day sheer to diffuse the glare and a night blackout for the bedrooms. Ceiling-recessed curtain pelmet makes a 2.6 m ceiling read taller.' }
];

/* Lighting reference used by the Insights panel. */
MH.LIGHTING_GUIDE = [
  { space:'Living hall',   lux:'100-300 general, 500 for reading', temp:'2700-3000K', notes:'Four or more sources. A single ceiling light is the most common mistake in an HDB living room.' },
  { space:'Dining',        lux:'150-300 on the table',             temp:'2700K',      notes:'Pendant 750-850 mm above the tabletop. Width of pendant roughly one-third to one-half the table width.' },
  { space:'Kitchen',       lux:'300-500 general, 500-750 task',    temp:'3000-4000K', notes:'Under-cabinet task lighting is non-negotiable; overheads throw your own shadow onto the worktop.' },
  { space:'Bedroom',       lux:'100-200 general, 300 reading',     temp:'2700K',      notes:'Bedside light must be controllable from the bed. Avoid downlights directly above the pillow.' },
  { space:'Bathroom',      lux:'200-300 general, 500 at mirror',   temp:'3000K',      notes:'Light the face from both sides at eye level, not from above. IP44 minimum within 600 mm of a shower.' },
  { space:'Study',         lux:'500-750 at the desk',              temp:'4000K day / 3000K night', notes:'Task lamp from the non-dominant side. Screen should not face a window directly.' },
  { space:'Service yard',  lux:'200-300',                          temp:'4000K',      notes:'Cooler and brighter; this is a working space. Weatherproof fitting if the yard is open.' }
];
