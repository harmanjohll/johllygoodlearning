# MyHome — interactive space planner

A design tool for one specific flat: **Blk 522 Bishan**, drawn from the Destino Deco
"Proposed Space Planning" sheet. Move walls that can be moved, refuse to move the ones
that cannot, place real furniture at real sizes, test a style direction across the whole
plan, and get both offline and AI-assisted design advice.

Live: `https://harmanjohll.github.io/johllygoodlearning/myhome/`

No build step, no framework, no server. Plain HTML, CSS and JavaScript, deployable
straight to GitHub Pages like everything else in this repository.

---

## Read this first: the seed plan is a reconstruction

The room list, the numbering, the adjacencies, the position of the entrance, the wet
core and the bedroom wing all follow the original drawing. **The millimetres do not.**
A photograph of a printed plan cannot be measured to the millimetre, so the geometry is
a careful reconstruction that sits at a realistic 111.25 m² for a five-room HDB flat.

To make it true:

1. **Settings → Trace your own drawing** and load a scan or photo of the plan.
2. **Set scale from two points** — click two points whose real distance you know, type
   the distance, and the underlay is scaled to match.
3. Switch to the Select tool and drag wall ends onto the traced lines.

Until you do that, the header note in the Inspector says "Not calibrated yet" and every
dimension the app reports should be treated as provisional.

---

## Scale

Scale is the thing this app takes most seriously, because a plan that is not to scale is
a picture, not a plan.

- **The model is millimetres, everywhere.** Nothing is stored in pixels.
- **The scale readout is a true architect's ratio.** A CSS pixel is defined as 1/96 inch,
  so at 1:50 the drawing on your screen really is 1:50, and printing gives you 1:50 on paper.
  Zoom presets for 1:20, 1:50, 1:100 and 1:200 are in the header.
- **Type any unit.** `3600`, `3.6m`, `360cm`, `12'`, `11'6"` and `141in` all parse. The
  display unit is switchable between mm, cm, m and feet-and-inches.
- **A scale bar and a north arrow** sit on the drawing, and adapt to a narrow screen.
- **Overall dimension lines** run outside the envelope; every room carries its own
  width × depth and its area in both m² and square feet.
- **Snapping** at 10, 25, 50 or 100 mm, with a live dimension readout while drawing.
- **A person is in the catalogue** at 1750 mm tall. Drop one in whenever a room stops
  feeling real.

## Walls

Wall construction drives colour, thickness and whether the app will let you touch it,
mirroring what HDB will and will not approve.

| Shown as | Construction | Can you remove it? |
|---|---|---|
| Solid dark | Reinforced concrete, structural, 200 mm | No |
| Solid dark, thinner | Internal RC / shear wall, 150 mm | No |
| Blue-grey, heavy | Household shelter, 300 mm | No — Civil Defence Shelter Act |
| Hatched grey | Brick or block partition, 100 mm | Yes, with a permit |
| Hatched pale | Drywall / stud partition, 90 mm | Yes |
| Amber | A new wall you are proposing | Yes |

Demolishing leaves a dashed ghost so you can still see what was there and price the
hacking. The Schedule tab totals the run in metres and gives an indicative cost.

## What you can place

133 catalogue items at Singapore retail dimensions, all editable once placed:

- **Beds** in local sizes, including super single (1070 × 1900), which does not exist
  in most other markets.
- **TVs** from 43 to 85 inch, where the diagonal converts to a true 16:9 width and
  height, and the advisor checks it against your actual viewing distance.
- **Sliding doors** in one, two and three panel, plus pocket sliders, bifolds, barn
  doors, cased openings and arches.
- **Bookshelves** at 2000 × 1200 as specified, plus the same footprint turned upright
  and several other sizes.
- **An upright piano** at 1200 × 600 as specified, plus a baby grand.
- Kitchen islands, breakfast bars, wet-kitchen counters, extractor hoods, integrated
  appliances, wardrobes (hinged, sliding and walk-in), sanitaryware, laundry, aircon
  fan coils and condensers, ceiling fans, planters, aquariums, and a distribution board.

Every item takes a width, depth, height, rotation and colour. Nothing is fixed except
the main entrance door and the household shelter door.

## Styles, materials and colour

Fourteen style directions, each with a full specification rather than a mood word:

Japandi · Norwegian/Nordic · Minimalist · Eclectic · Wabi-sabi · Mid-century modern ·
Industrial · Coastal/Resort · Tropical Modern · Modern Luxe (dark) · Biophilic ·
Bauhaus/Modernist · Maximalist · Warm Contemporary

Each carries a palette with hex values and **Light Reflectance Values**, named timbers,
surfaces, metals and textiles, a lighting specification with colour temperature and CRI,
explicit do and do-not lists, signature pieces, a budget band, and a **Singapore note**
covering what that style does in 70–90% relative humidity. Choosing a style restyles the
drawing and the 3D view live.

Alongside them, 31 materials with indicative Singapore supply-and-install prices, a
maintenance rating, a 1–5 humidity-suitability rating and a paragraph on where the
material earns its keep and where it fails here.

## Insights: the offline advisor

Runs on every edit, needs no API key, and costs nothing. It measures:

- Item collisions, and furniture buried in walls
- Door swing and approach clearances, with the correct rule for swing vs sliding
- Working clearances in front of and beside every item that needs them
- Kitchen work triangle (3.6–8.0 m total, no leg under 1.2 m) and hob landing space
- TV viewing distance against screen diagonal (1.2× to 1.8× at 4K)
- Sofa-to-coffee-table gap, bed foot clearance, corridor width
- Rooms with no daylight, and total glazing as a share of floor area
- Wet-area floor finishes, storage as a share of floor area, floor loading for heavy items
- Piano placement: external walls, aircon draught and direct sun
- Aircon fan coils blowing onto a bed or a desk
- What the law says about the household shelter

It knows about walls, so a wardrobe in Bedroom 3 is never reported as blocking a bed in
Bedroom 2. It knows a sink belongs inside a counter, a bedside table belongs beside a bed
and you can stand in a shower tray. Findings are scored into five meters and each one is
clickable: it selects and centres the thing it is complaining about.

## The AI consultant

Optional. Everything else works without it.

Bring your own key from either provider; it is stored in this browser's localStorage and
nothing is transmitted until you press an AI button.

- **Anthropic (Claude)** — Sonnet 5, Opus 5 or Haiku 4.5
- **Google (Gemini)** — 2.5 Flash or 2.5 Pro

The Gemini key is shared with the rest of this repository under `jgl.geminiKey`, so if
you have already set one up for the Science Lab you do not need to enter it again.

Every prompt carries the real plan: room dimensions, wall types and which are locked,
opening sizes, furniture positions, the advisor's findings and the budget. So the answers
are about this flat, not about flats in general.

| Action | What it does |
|---|---|
| Review my plan | A consultant's first-meeting critique, structured and specific |
| Style scheme | Turns a style direction into a buildable spec, room by room |
| Lay out a room | Returns real coordinates; **the app places the furniture for you**, and undo works |
| Propose a palette | Picks floor finishes and wall colours, and applies the floors to the drawing |
| Ask anything | Open conversation about the plan |

The layout and palette responses are validated before they touch the drawing: unknown
catalogue ids are dropped, coordinates are clamped inside the room, and malformed JSON
produces a readable message rather than a stack trace.

## Views and output

- **Plan** — the main drawing, with grid, snapping, dimensions, areas and a clearance overlay
- **Dollhouse** — an axonometric 3D view built on the same model, with a turn dial and an
  adjustable wall cut height so you can see in. No WebGL, no library.
- **Schedule** — area schedule in m² and sq ft, an indicative Singapore budget broken down
  by trade and by item, wall runs by construction type, and target lux levels per space
- Export the scheme as JSON, the drawing as PNG, or print to true scale

## Keyboard

`V` select · `W` wall · `X` demolish · `D` door · `N` window · `R` room · `M` measure
`Tab` plan / dollhouse · `F` fit · `Ctrl+Z` undo · `Ctrl+Shift+Z` redo · `Ctrl+D` duplicate ·
`Ctrl+A` select all · `Del` delete · `[` `]` rotate 15° · arrows nudge (with `Shift` for 500 mm)

Hold `Shift` while drawing to free the angle. `Alt`-drag or right-drag pans. Scroll zooms.
Pinch and drag work on touch.

## Privacy

The plan is saved to this browser's localStorage. API keys are stored the same way.
No server is involved. Plan data leaves the machine only when you press an AI button,
and then only to the provider you chose.

## Files

```
myhome/
  index.html            markup and the SVG icon sprite
  css/app.css           the whole interface
  js/data-styles.js     14 style packs, 31 materials, lighting targets
  js/data-catalog.js    133 items, 17 opening types, 8 wall constructions
  js/data-plan.js       the seed floor plan
  js/core.js            units and parsing, geometry, state with undo/redo
  js/render2d.js        the plan renderer and the glyph library
  js/render3d.js        the axonometric dollhouse
  js/advisor.js         offline design checks, scoring, budget, auto-layout
  js/ai.js              Anthropic and Gemini wrappers, prompts, response validation
  js/ui.js              panels, tools, pointer handling, modals
  test/validate.js      data integrity checks — node myhome/test/validate.js
```

## Where the numbers come from

Clearances follow Neufert's *Architects' Data*; viewing angles follow SMPTE and THX;
lighting targets follow SS 531 and common Singapore practice; what may and may not be
altered follows HDB renovation guidelines and the Civil Defence Shelter Act. Costs are
indicative Singapore supply-and-install ranges and move constantly — use them to compare
options against each other, then get three real quotes.
