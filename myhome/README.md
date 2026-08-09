# MyHome — interactive space planner

A design tool for one specific flat: **Blk 522, 4-Room Type-I**, built from the official
HDB floor plan. Move the walls you are allowed to move, get refused on the ones you are
not, place furniture at real sizes, test a style across the whole flat, and get both
offline and AI-assisted design advice.

Live: `https://harmanjohll.github.io/johllygoodlearning/myhome/`

No build step, no framework, no server. Plain HTML, CSS and JavaScript, deployable
straight to GitHub Pages like everything else in this repository.

---

## The flat

Straight off the HDB sheet:

| | |
|---|---|
| Type | 4-Room, Type-I |
| Floor area | **93 m²** including the air-con ledge |
| Internal floor area | **90 m²**, measured from the centre-line of the walls |
| Overall | 9235 across, 9745 deep |
| Rooms | Main Bedroom · Bedroom 2 · Bedroom 3 · Bath/WC 1 · Bath/WC 2 · Kitchen · Service Yard · Household Shelter · Living/Dining · Entrance · Passageway · Air-con Ledge |

Everything here is derived from the dimension chains printed on the sheet, not fitted to
them afterwards. The line that locks the plan is that the yard-and-kitchen chain and the
two-bathroom chain both close on the same figure:

```
across   2695 (yard/kitchen) + 1590 (baths) + 1400 (passage) + 3550 (bedrooms) = 9235
down     1470 (yard) + 3595 (kitchen)  = 5065
         2500 (bath 1) + 2565 (bath 2) = 5065     <- the two columns break on one line
bedrooms 3100 (main) + 2950 (bedroom 2) + 3695 (bedroom 3) = 9745
shelter  1700 x 1700 ; ledge 2695 x 1090
```

`9235 × 9745` is **90.00 m²** against a printed 90, and with the ledge **92.93** against a
printed 93. Both figures land on the nose, which is how you know the geometry is right
rather than merely close.

`node myhome/test/validate.js` treats the sheet as a contract. It asserts both printed
areas, and that every room edge and every wall sits on a grid line derivable from a
printed dimension. If a future edit moves a wall off the drawing, the tests fail.

### What the sheet says you may not touch

> Structural column(s)/wall(s) which are shaded in black and all beams/slabs
> shall not be hacked, removed or tampered with.

Those walls are drawn black here and the app refuses to remove them, which is the same
answer HDB gives. The household shelter is stricter still: under the Civil Defence
Shelter Act you may not hack, drill, nail or block its vents. **The main entrance is
marked with a red arrow** so you can always see how the flat is entered.

Press **What can I change?** in the toolbar and everything fixed fades back, leaving only
the six partitions that can actually come down.

### If you want it exact to the millimetre

Settings → **Trace your plan**: load the scan, click two points whose real distance you
know, type it, then drag wall ends onto the traced lines. The overall dimensions and room
sizes here come from the sheet, but a photograph of a printed plan cannot be read to the
millimetre, so calibrate before ordering anything.

---

## How you use it

Everything happens on the plan, not in a panel.

- **Furnish the whole flat in one click.** Five arrangements — *Family of four*, *Just
  the essentials*, *Two people working from home*, *Music at the centre*, *Couple who
  entertain* — each fitting out all eleven spaces. **Empty the flat** takes it all back
  out again, leaving only the things you cannot move: the distribution board and the
  condenser. Both are one `Ctrl+Z` from undone.
- **Click anything** — a small toolbar appears next to it with what you can do. A wall
  tells you its length and offers to take it down, or shows a padlock and the reason it
  has to stay. A room offers to furnish itself. A piece of furniture offers to turn,
  copy, recolour or go.
- **Click something in the catalogue, then click on the plan.** A ghost of the real
  footprint follows the cursor so you see the size before you commit. Hold Shift to keep
  placing more.
- **Drag and things line up.** Edges and centres snap to other furniture and to wall
  faces, with a guide line showing what they caught on. Hold Alt to drag freely.
- **Double-click a room** to fill the screen with it.
- **A status bar at the bottom** always says what the current tool does.
- **A five-step tour** runs the first time, and again from the help button.

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
| Solid black | Concrete wall, 200 mm | No — it holds the building up |
| Solid black, thinner | Concrete wall (internal), 150 mm | No |
| Blue-grey, heavy | Household shelter, 300 mm | No — Civil Defence Shelter Act |
| Hatched grey | Brick wall, 100 mm | Yes, with a permit |
| Hatched pale | Stud partition, 90 mm | Yes |
| Amber | A wall you have added | Yes |

Demolishing leaves a dashed ghost so you can still see what was there and price the
hacking. The Schedule tab totals the run in metres and gives an indicative cost.

## Furnishing packs

Five whole-flat arrangements, in the panel above the catalogue. They are **generated from
the geometry**, not stored as coordinates, so they still work after you have moved a wall
or knocked one down.

| Pack | What it assumes |
|---|---|
| Family of four | Three beds, a table for four, a proper sofa, somewhere for the shoes |
| Just the essentials | Somewhere to sleep, sit and eat. Nothing else |
| Two people working from home | A desk in the main bedroom and in Bedroom 2, smaller table |
| Music at the centre | The upright piano takes the long internal wall, seating turned in |
| Couple who entertain | Six-seat table, bigger sofa, bigger screen, Bedroom 3 as a guest room |

Placing furniture well in an HDB flat is mostly a fight over the same square metre, so
each room proposes every sensible arrangement of its defining pieces and the app scores
them: through a wall, in a doorway, on top of each other, or standing in the space
something else needs to open. The best one wins. Then a resolver nudges each piece along
its wall until it is genuinely clear, and leaves out anything that never gets there
rather than drawing a clash.

The result is measured against the advisor on every run, and it is a checked-in test:
`node myhome/test/validate.js` fails if any pack drops a piece or scores a single
warning. All five currently place everything they propose and score 100.

Three things stay put when you empty the flat: the distribution board, the condenser on
the ledge, and any structural column. Everything else goes.

## What you can place

134 catalogue items at Singapore retail dimensions, all editable once placed:

- **A quick-add row** of the twelve things people reach for first, plus a memory of what
  you used recently.
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
- **Shoe cabinets in two widths**, because between a front door, a shelter door and the
  opening into the living room, 600 mm is often the longest clear run of wall an HDB
  entrance actually has.

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
and you can stand in a shower tray. It measures the work triangle inside the kitchen, so
the utility sink out in the yard never gets counted as the kitchen sink, and it measures
viewing distance from the sofa rather than from an armchair pulled in at the side.

It also knows the difference between an obstruction and a graze: something has to be
genuinely standing in a clearance or a door approach before it is reported, because an
advisor that flags a 10 mm overlap is one you learn to ignore.

Findings are scored into five meters and each one is clickable: it selects and centres
the thing it is complaining about.

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
`Tab` plan / dollhouse · `L` what can I change · `F` fit · `?` help
`Ctrl+Z` undo · `Ctrl+Shift+Z` redo · `Ctrl+D` duplicate · `Ctrl+A` select all · `Del` delete
`[` `]` rotate 15° · arrows nudge (with `Shift` for 500 mm) · `Esc` cancels anything

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
  js/packs.js           whole-flat furnishing packs, arrangement search, resolver
  js/ai.js              Anthropic and Gemini wrappers, prompts, response validation
  js/ui.js              panels, tools, pointer handling, modals
  test/validate.js      data and pack checks — node myhome/test/validate.js
```

## Where the numbers come from

Clearances follow Neufert's *Architects' Data*; viewing angles follow SMPTE and THX;
lighting targets follow SS 531 and common Singapore practice; what may and may not be
altered follows HDB renovation guidelines and the Civil Defence Shelter Act. Costs are
indicative Singapore supply-and-install ranges and move constantly — use them to compare
options against each other, then get three real quotes.
