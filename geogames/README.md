# GeoGames

Eight geography games for a room full of people, plus an atlas to settle the
arguments they start. Static HTML, CSS and ES modules — no build step, no
framework, no server.

Live at `/geogames/`.

## The games

| Game | What it asks |
| --- | --- |
| **Grand Tour** | All eight, shuffled. The party default. |
| Flag Frenzy | Flag to country, and country to flag |
| Capital Clash | Country to capital, and back |
| Silhouette | The real coastline, no label. Rotated and mirrored on Expert |
| Globe Drop | Spin the globe and drop a pin. Scored by great-circle distance, so close counts |
| Higher or Lower | Population, area, neighbours, latitude, crowding |
| Border Chain | Which of these can you walk into from here |
| Odd One Out | Three share something. The rule is only revealed afterwards |
| Time Traveller | Date a historical map, name who ruled a place, spot who belonged to an empire |

**Explore** is the non-competitive half: a spinnable globe, an Equal Earth flat
map, a country dossier, and a timeline that repaints the world at seven moments
between 1279 and today.

## Playing with other people

Add players on the home screen, then pick them on any game's setup. Three modes:

- **Solo** — just you.
- **Pass and play** — one device, turn by turn, with a "pass to X" card between
  turns so nobody sees the next question early.
- **Teams** — two sides, alternating, one running score.

**Steals** are on by default: a miss passes to the next player for half points,
on a seven-second clock. The answer stays hidden until the steal resolves,
which is the whole point of it.

Difficulty controls which countries can appear (`Family` is household names
only, `Expert` is all 194) and how fast the clock runs. Region narrows it to one
continent. Both are remembered.

## Layout

```
geogames/
  index.html          shell
  app.js              boot, hash routing, home / setup / results / roster
  style.css           everything visual; one --accent per game
  data/
    countries.js      194 countries, generated  (see NOTICE.md)
    shapes.json       packed country outlines, generated
    eras.js           historical eras, hand-written
  engine/
    geo.js            projections, sphere maths, hit testing   ← the tricky part
    globe-view.js     interactive orthographic globe on canvas
    map-view.js       interactive Equal Earth flat map, same interface
    session.js        questions, turns, scoring, steals
    store.js          localStorage
    ui.js             DOM helpers, seeded random, fuzzy answer matching
    audio.js          WebAudio blips; no sound files
  games/              one module per game — see games/_contract.md
  screens/
    play.js           the question loop
    explore.js        the atlas and the time machine
  test/               node tests for the geometry engine
  tools/              the two Python scripts that generate data/
```

## Running it locally

`data/shapes.json` is fetched at runtime, so `file://` will not work:

```sh
python3 -m http.server        # from the repository root
# then open http://localhost:8000/geogames/
```

## Tests

```sh
./test/run.sh
```

Covers the geometry engine: projection round-trips, antimeridian handling,
hit testing against known city coordinates, horizon clipping at every rotation,
and a frame-budget guard (a full globe trace runs in about 1.3 ms).

The games and screens are checked by playing them. The engine gets tests
because a projection bug is silent — it still draws something, just in the
wrong place.

## Data, licences and what is approximate

See **[NOTICE.md](NOTICE.md)**. Short version: outlines are Natural Earth
(public domain), country facts are mledoze/countries (ODbL) plus this repo's
own list, flags are shared with `../atlas/`, and the historical eras are
hand-written and deliberately approximate — the app says so on screen every
time it draws one.

## Adding a game

Write a module in `games/`, add it to the list in `games/index.js`. The
contract is in **[games/_contract.md](games/_contract.md)**. A game builds
questions and draws one; the shell owns players, turns, the clock, scoring and
the steal rule.
