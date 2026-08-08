/* Node test for the geometry engine. Run: node test/geo.test.mjs
   No framework: a tiny assert helper, exit code 1 on any failure. */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import {
  prepareShapes, Globe, FlatMap, haversineKm, pointInRing, countryAt,
  nearestCountry, equalEarth, silhouettePaths, lonDelta,
} from '../engine/geo.js';

const here = dirname(fileURLToPath(import.meta.url));
const raw = JSON.parse(readFileSync(join(here, '../data/shapes.json'), 'utf8'));
const countries = prepareShapes(raw);

let failures = 0;
function ok(cond, msg) {
  if (!cond) { console.error('  FAIL ' + msg); failures++; }
}
function near(a, b, tol, msg) {
  ok(Math.abs(a - b) <= tol, `${msg} (got ${a}, want ${b} +/- ${tol})`);
}
function section(name) { console.log('\n' + name); }

// ── data ────────────────────────────────────────────────────────────────────
section('shape data');
ok(Object.keys(countries).length === 194, 'has 194 countries');
ok(countries.RU.rings.length > 1, 'Russia has several rings');
ok(countries.RU.rings[0].n > countries.RU.rings[1].n, 'rings sorted, biggest first');
for (const iso in countries) {
  for (const r of countries[iso].rings) {
    ok(r.bbox[2] - r.bbox[0] <= 180, `${iso} ring does not cross the antimeridian`);
  }
}

// ── distance ────────────────────────────────────────────────────────────────
section('haversine');
near(haversineKm(0, 0, 0, 90), 10007.5, 5, 'equator to north pole');
near(haversineKm(103.8, 1.35, 0, 51.5), 10850, 60, 'Singapore to London');
near(haversineKm(-74, 40.7, -74, 40.7), 0, 1e-9, 'zero distance');
near(haversineKm(179, 0, -179, 0), 222.4, 2, 'across the antimeridian');

section('lonDelta');
near(lonDelta(179, -179), 2, 1e-9, 'wraps forwards over the antimeridian');
near(lonDelta(-179, 179), -2, 1e-9, 'wraps backwards');

// ── point in polygon ────────────────────────────────────────────────────────
section('hit testing');
const cases = [
  ['FR', 2.35, 48.85, 'Paris'],
  ['JP', 139.7, 35.68, 'Tokyo'],
  ['BR', -47.9, -15.8, 'Brasilia'],
  ['AU', 133.0, -25.0, 'central Australia'],
  ['ZA', 28.0, -26.2, 'Johannesburg'],
  ['US', -104.9, 39.7, 'Denver'],
  ['RU', 90.0, 62.0, 'Siberia'],
  ['CA', -113.5, 53.5, 'Edmonton'],
  ['IN', 77.2, 28.6, 'Delhi'],
  ['EG', 31.2, 30.0, 'Cairo'],
];
for (const [iso, lon, lat, label] of cases) {
  ok(countryAt(countries, lon, lat) === iso, `${label} is in ${iso}`);
}
ok(countryAt(countries, -30, 35) === null, 'mid Atlantic is nobody');
ok(countryAt(countries, -150, -40) === null, 'south Pacific is nobody');

section('nearest country from open water');
const nr = nearestCountry(countries, -20, 30);
ok(['MA', 'EH', 'PT', 'ES', 'MR', 'CV'].includes(nr.iso), `Atlantic falls near ${nr.iso}`);
ok(nr.km > 100, 'and reports a real distance');

// ── every country has a usable centre ───────────────────────────────────────
section('country centres');
let centresInside = 0;
for (const iso in countries) {
  const c = countries[iso];
  if (c.rings.some(r => pointInRing(c.centre[0], c.centre[1], r))) centresInside++;
}
ok(centresInside >= 190, `centres land on land for ${centresInside}/194`);

// ── globe projection ────────────────────────────────────────────────────────
section('globe projection');
const g = new Globe();
g.radius = 300; g.cx = 400; g.cy = 400;
g.set(0, 0);
let p = g.project(0, 0);
near(p[0], 400, 1e-9, 'centre projects to cx');
near(p[1], 400, 1e-9, 'centre projects to cy');
ok(g.project(120, 0) === null, 'far side returns null');
ok(g.project(90.001, 0) === null, 'just past the limb returns null');
p = g.project(45, 0);
near(p[0], 400 + 300 * Math.SQRT1_2, 1e-6, '45E is east of centre');

section('globe invert round trip');
for (const [lam, phi] of [[0, 0], [130, -20], [-75, 45], [179, 80], [-179, -60]]) {
  g.set(lam, phi);
  const clamp = v => Math.max(-88, Math.min(88, v));
  for (const [lon, lat] of [[lam, phi], [lam + 20, clamp(phi - 10)], [lam - 35, clamp(phi + 15)]]) {
    const q = g.project(lon, lat);
    ok(q !== null, `visible at rotation ${lam},${phi}`);
    if (!q) continue;
    const back = g.invert(q[0], q[1]);
    near(lonDelta(lon, back[0]), 0, 1e-6, `lon round trip ${lon}`);
    near(back[1], lat, 1e-6, `lat round trip ${lat}`);
  }
}
ok(g.invert(0, 0) === null, 'a click outside the disc inverts to null');

section('globe visibility helpers');
g.set(0, 0);
ok(g.visible(10, 10) === true, 'near side visible');
ok(g.visible(170, 0) === false, 'far side hidden');
ok(g.mayBeVisible(countries.FR) === true, 'France may be visible from 0,0');
ok(g.mayBeVisible(countries.NZ) === false, 'New Zealand rejected from 0,0');
g.set(174, -41);
ok(g.mayBeVisible(countries.NZ) === true, 'New Zealand visible from 174,-41');

// ── ring tracing, with a recording context ──────────────────────────────────
section('globe ring tracing');
function recorder() {
  const ops = [];
  return {
    ops,
    moveTo: (x, y) => ops.push(['M', x, y]),
    lineTo: (x, y) => ops.push(['L', x, y]),
    arc: (x, y, r, a, b, ccw) => ops.push(['A', a, b, ccw]),
    closePath: () => ops.push(['Z']),
  };
}
function finite(ops) {
  return ops.every(o => o.slice(1).every(v => typeof v !== 'number' || Number.isFinite(v)));
}

g.set(0, 20);
let rec = recorder();
ok(g.traceRing(rec, countries.FR.rings[0]) === true, 'France traces');
ok(rec.ops.length > 10 && finite(rec.ops), 'France path is finite');
ok(rec.ops.filter(o => o[0] === 'A').length === 0, 'France needs no limb stitching');

rec = recorder();
ok(g.traceRing(rec, countries.NZ.rings[0]) === false, 'New Zealand is skipped from 0,20');

// Rotate so a big country straddles the limb, at many angles, and confirm we
// always produce a closed finite path with stitching.
let stitched = 0;
for (let lam = -180; lam < 180; lam += 5) {
  g.set(lam, 15);
  for (const iso of ['RU', 'US', 'BR', 'CN', 'AU', 'CA', 'ID', 'CL', 'ZA', 'KI']) {
    const c = countries[iso];
    for (const ring of c.rings) {
      const r = recorder();
      const drew = g.traceRing(r, ring);
      if (!drew) continue;
      ok(finite(r.ops), `${iso} finite at lambda ${lam}`);
      ok(r.ops[0][0] === 'M', `${iso} path starts with moveTo at lambda ${lam}`);
      ok(r.ops[r.ops.length - 1][0] === 'Z', `${iso} path closes at lambda ${lam}`);
      const arcs = r.ops.filter(o => o[0] === 'A').length;
      if (arcs) stitched++;
      for (const o of r.ops.filter(o => o[0] === 'A')) {
        ok(typeof o[3] === 'boolean', 'arc direction is a boolean');
      }
    }
  }
}
ok(stitched > 100, `limb stitching exercised ${stitched} times`);

// ── Equal Earth ─────────────────────────────────────────────────────────────
section('equal earth');
let e = equalEarth(0, 0);
near(e[0], 0, 1e-12, 'origin x');
near(e[1], 0, 1e-12, 'origin y');
ok(equalEarth(180, 0)[0] > 0 && equalEarth(-180, 0)[0] < 0, 'east is positive');
ok(Math.abs(equalEarth(0, 90)[1] + equalEarth(0, -90)[1]) < 1e-9, 'poles are symmetric');

section('equal earth invert round trip');
const fm = new FlatMap();
fm.fit(1000, 520);
for (const [lon, lat] of [[0, 0], [103.8, 1.35], [-74, 40.7], [37.6, 55.7], [151.2, -33.9], [-58.4, -34.6], [0, 85], [0, -85]]) {
  const s = fm.project(lon, lat);
  const back = fm.invert(s[0], s[1]);
  ok(back !== null, `invert returns a point for ${lon},${lat}`);
  if (!back) continue;
  near(back[0], lon, 1e-6, `flat lon round trip ${lon}`);
  near(back[1], lat, 1e-6, `flat lat round trip ${lat}`);
}
ok(fm.invert(-9999, fm.cy) === null, 'far off the left edge inverts to null');

section('flat map hit testing');
for (const [iso, lon, lat, label] of cases) {
  const s = fm.project(lon, lat);
  const back = fm.invert(s[0], s[1]);
  ok(countryAt(countries, back[0], back[1]) === iso, `flat ${label} still resolves to ${iso}`);
}

// ── silhouettes ─────────────────────────────────────────────────────────────
section('silhouettes');
for (const iso of ['CL', 'RU', 'IT', 'NZ', 'FJ', 'JP', 'ZA', 'FR']) {
  const rings = silhouettePaths(countries[iso]);
  ok(rings.length >= 1, `${iso} produces rings`);
  let lo = Infinity, hi = -Infinity;
  for (const pts of rings) for (const v of pts) { lo = Math.min(lo, v); hi = Math.max(hi, v); }
  ok(Number.isFinite(lo) && lo >= -0.001 && hi <= 1.001, `${iso} fits the unit box (${lo.toFixed(3)}..${hi.toFixed(3)})`);
  ok(hi - lo > 0.9, `${iso} fills the box on its long axis`);
}
const plain = silhouettePaths(countries.IT)[0];
const flipped = silhouettePaths(countries.IT, { mirror: true })[0];
ok(Math.abs(plain[0] - flipped[0]) > 1e-6, 'mirroring changes the outline');
const spun = silhouettePaths(countries.IT, { rotate: Math.PI / 2 })[0];
ok(Math.abs(plain[1] - spun[1]) > 1e-6, 'rotation changes the outline');

// ── performance guard ───────────────────────────────────────────────────────
section('performance');
const nullCtx = { moveTo() {}, lineTo() {}, arc() {}, closePath() {} };
const t0 = performance.now();
const FRAMES = 30;
for (let f = 0; f < FRAMES; f++) {
  g.set(f * 12, 15);
  for (const iso in countries) {
    const c = countries[iso];
    if (!g.mayBeVisible(c)) continue;
    for (const ring of c.rings) g.traceRing(nullCtx, ring);
  }
}
const perFrame = (performance.now() - t0) / FRAMES;
console.log(`  whole-globe trace: ${perFrame.toFixed(2)} ms/frame`);
ok(perFrame < 16, `a full globe frame stays under 16ms (${perFrame.toFixed(2)})`);

console.log(failures ? `\n${failures} FAILURE(S)` : '\nAll geometry tests passed.');
process.exit(failures ? 1 : 0);
