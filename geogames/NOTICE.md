# GeoGames — data sources, licences and honest limits

GeoGames is a static site. It fetches nothing at runtime except its own
`data/shapes.json`, stores everything in `localStorage`, and has no server,
no account and no analytics.

---

## Country outlines — `data/shapes.json`

Derived from **Natural Earth**, 1:50m Admin 0 Countries
(<https://www.naturalearthdata.com/>).

Natural Earth is in the **public domain**. From their terms:

> No permission is needed to use Natural Earth. Crediting the authors is
> unnecessary.

We credit them anyway, in the app footer and here.

`tools/build-shapes.py` turns the source GeoJSON into the packed format the app
reads. It keeps only the 194 countries this site knows about, simplifies each
ring with Douglas-Peucker at roughly a 4 km tolerance, drops islands below
about a 600th of a country's largest landmass, and quantises coordinates to a
hundredth of a degree (about 1.1 km) stored as integers.

**What that means in practice.** These outlines are for playing with, not for
navigating by. At 1:50m, Singapore is seven points and Malta is fourteen; the
Silhouette game excludes every country under 9,000 km² for exactly that reason.
Holes inside countries are dropped, so Lesotho is not cut out of South Africa.
Disputed and de facto borders follow Natural Earth's choices, which are their
own editorial calls, not ours.

**Reproducing it:**

```sh
curl -O https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_50m_admin_0_countries.geojson
python3 -c "import json,re; print(json.dumps(sorted(set(re.findall(r'\"iso\":\"(\w\w)\"', open('../atlas/data/countries.js').read())))))" > iso.json
python3 tools/build-shapes.py ne_50m_admin_0_countries.geojson iso.json data/shapes.json
```

---

## Country facts — `data/countries.js`

Merged by `tools/build-countries.py` from three places:

1. **`../atlas/data/countries.js`** — this site's own list of the 194 UN member
   states, with hand-curated fame tiers, name aliases and flag filenames.
2. **[mledoze/countries](https://github.com/mledoze/countries)** — area,
   land borders, coordinates, currency, languages, demonym, dialling code,
   landlocked flag and ISO alpha-3. Licensed **ODbL 1.0**.
3. **Natural Earth** `POP_EST` — population estimates. Public domain. A handful
   of micro-states have no Natural Earth polygon of their own, so their
   populations are rounded UN / national-statistics figures written into the
   build script by hand.

Facts about countries — a capital city, a land area — are not themselves
copyrightable. The ODbL applies to mledoze's *compilation*, which is why it is
credited here.

**Known caveats.**

- Population figures are estimates of varying vintage. They are good enough to
  ask "which of these two has more people" and not good enough to quote.
- `borders` is land borders only. Sri Lanka's entry for India was removed,
  because it is a maritime boundary and Border Chain treats the graph as a
  walkable one.
- Vatican City is included, so this is 194 states rather than the UN's 193.
- Country names follow the source data, including `Türkiye` and `Czechia`.

**Reproducing it:**

```sh
curl -O https://raw.githubusercontent.com/mledoze/countries/master/dist/countries.json
python3 tools/build-countries.py ../atlas/data/countries.js countries.json \
        ne_50m_admin_0_countries.geojson data/countries.js
```

---

## Flags

The 195 SVG flags come from **`../atlas/assets/flags/`** and are referenced
from there rather than copied, so the two apps cannot drift apart and the repo
does not carry 1.9 MB twice. See `../atlas/assets/flags/NOTICE.md` for their
provenance and licence.

If GeoGames is ever moved out of this repository, that directory has to travel
with it.

---

## Historical eras — `data/eras.js`

**Written by hand for this app, and deliberately approximate.**

Each era paints today's country shapes in the colours of the powers that held
that ground at that date. That is wrong in the details, and the file says so at
the top and the app says so on screen every time it draws one:

> Historical extents, painted approximately over modern borders.

Historical borders did not follow modern ones. Empires held coastlines, river
valleys and trade routes rather than whole modern nations. Vassals and
tributaries were not provinces. Where a claim is especially rough — Anatolia
under the Ilkhanate, the Ottoman grip on its North African provinces, the
Spanish claim to the South American interior — the polity carries a `caveat`
field and the app shows it.

Countries with no entry in an era are drawn in neutral grey and labelled
**"other states and peoples"**, never "empty". It never was.

Quiz questions are only ever built from countries that sit inside exactly one
power in that year, so there is never a defensible second answer.

Dates and extents were written from general historical knowledge and are best
treated as a good museum poster rather than a source. Corrections are welcome:
the whole dataset is one readable file.

---

## Fonts

Space Grotesk and Inter Tight, served by Google Fonts. If the request is
blocked or offline, the CSS falls back to the system UI stack and everything
still works.

---

## Sound

Synthesised in the browser with WebAudio. No audio files.

---

## Third-party code

None. No framework, no bundler, no CDN scripts, no build step. The projections
(orthographic and Equal Earth), the Douglas-Peucker simplifier, the sphere
clipping and the confetti are all in this repository and commented where they
are not obvious.

**Equal Earth** is the projection by Bojan Šavrič, Tom Patterson and Bernhard
Jenny (2018). The coefficients in `engine/geo.js` are from their published
paper. It is equal-area, which is why the flat map does not make Greenland look
the size of Africa.
