/* Data integrity checks for the MyHome planner.
   Run with:  node myhome/test/validate.js
   Pure Node, no dependencies. Exits non-zero if anything is wrong. */
const fs = require('fs'), path = require('path'), vm = require('vm');

const dir = path.join(__dirname, '..', 'js');
/* The data files are plain browser scripts: they do `window.MH = window.MH || {}`
   and then refer to a bare `MH`. Making the sandbox its own `window` reproduces
   that, so the files load unmodified. */
const sandbox = { console };
sandbox.window = sandbox;
/* core.js persists to localStorage inside a try/catch, so a stub is enough to
   run the whole model layer here. Nothing below this line touches the DOM. */
sandbox.localStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {} };
vm.createContext(sandbox);
['data-styles.js', 'data-catalog.js', 'data-plan.js', 'core.js', 'advisor.js', 'packs.js'].forEach(f => {
  vm.runInContext(fs.readFileSync(path.join(dir, f), 'utf8'), sandbox, { filename: f });
});
const MH = sandbox.window.MH;

let fails = 0;
const check = (name, ok, detail) => {
  if (ok) console.log('  ok   ' + name + (detail ? '  ' + detail : ''));
  else { console.log('  FAIL ' + name + (detail ? '  ' + detail : '')); fails++; }
};
const dupes = arr => arr.filter((v, i, a) => a.indexOf(v) !== i);

console.log('\nCatalogue');
check('items present', MH.CATALOG.length >= 100, MH.CATALOG.length + ' items');
check('no duplicate ids', dupes(MH.CATALOG.map(c => c.id)).length === 0, dupes(MH.CATALOG.map(c => c.id)).join(','));
check('every item has w/d/h/glyph/cat',
  MH.CATALOG.every(c => c.w > 0 && c.d > 0 && c.h > 0 && c.glyph && c.cat),
  MH.CATALOG.filter(c => !(c.w > 0 && c.d > 0 && c.h > 0 && c.glyph && c.cat)).map(c => c.id).join(','));
const cats = new Set(MH.CATEGORIES.map(c => c.id));
check('categories all known', MH.CATALOG.every(c => cats.has(c.cat)),
  MH.CATALOG.filter(c => !cats.has(c.cat)).map(c => c.id).join(','));
check('TV sizes are true 16:9', MH.CATALOG.filter(c => c.tv).every(c => {
  const s = MH.tvSize(c.tv);
  return Math.abs(s.w - c.w) <= 2 && Math.abs(s.h - c.h) <= 2;
}));
check('openings present', MH.OPENINGS.length >= 12, MH.OPENINGS.length);
check('wall types complete', Object.values(MH.WALL_TYPES).every(t => t.thickness > 0 && t.fill && t.note));

console.log('\nStyles and materials');
check('styles present', MH.STYLES.length >= 12, MH.STYLES.length + ' styles');
check('no duplicate style ids', dupes(MH.STYLES.map(s => s.id)).length === 0);
const styleKeys = ['name', 'tagline', 'origin', 'palette', 'woods', 'surfaces', 'metals', 'textiles',
  'lighting', 'dos', 'donts', 'signature', 'sgNotes', 'budget', 'floor', 'wall', 'accent', 'wood', 'metal'];
const incomplete = MH.STYLES.filter(s => styleKeys.some(k => !s[k]));
check('every style complete', incomplete.length === 0,
  incomplete.map(s => s.id + ' missing ' + styleKeys.filter(k => !s[k]).join('/')).join('; '));
const hex = /^#[0-9A-Fa-f]{6}$/;
const badHex = MH.STYLES.flatMap(s => [s.floor, s.wall, s.accent, s.wood, s.metal].filter(h => !hex.test(h)).map(h => s.id + ':' + h))
  .concat(MH.STYLES.flatMap(s => s.palette.filter(p => !hex.test(p.hex)).map(p => s.id + ':' + p.name)));
check('all colours are 6-digit hex', badHex.length === 0, badHex.join(','));
check('LRV values sane', MH.STYLES.every(s => s.palette.every(p => p.lrv >= 0 && p.lrv <= 100)));
check('materials present', MH.MATERIALS.length >= 25, MH.MATERIALS.length + ' materials');
check('materials complete', MH.MATERIALS.every(m => m.cat && m.name && hex.test(m.hex) && m.price && m.humidity >= 1 && m.humidity <= 5 && m.note));
check('at least four floor finishes', MH.MATERIALS.filter(m => m.cat === 'Floor').length >= 4);

console.log('\nSeed plan');
const S = MH.SEED;
check('twelve rooms from the HDB sheet', S.rooms.length === 12, S.rooms.length);
check('no duplicate room ids', dupes(S.rooms.map(r => r.id)).length === 0);
check('no duplicate wall ids', dupes(S.walls.map(w => w.id)).length === 0);
check('no duplicate item ids', dupes(S.items.map(i => i.id)).length === 0);
const catIds = new Set(MH.CATALOG.map(c => c.id));
check('all seed items exist in the catalogue', S.items.every(i => catIds.has(i.catId)),
  S.items.filter(i => !catIds.has(i.catId)).map(i => i.catId).join(','));
const wallIds = new Set(S.walls.map(w => w.id));
check('all openings sit on a real wall', S.openings.every(o => wallIds.has(o.wallId)),
  S.openings.filter(o => !wallIds.has(o.wallId)).map(o => o.id).join(','));
const typeIds = new Set(Object.keys(MH.WALL_TYPES));
check('all wall types are known', S.walls.every(w => typeIds.has(w.type)),
  S.walls.filter(w => !typeIds.has(w.type)).map(w => w.type).join(','));

const wlen = w => Math.hypot(w.x2 - w.x1, w.y2 - w.y1);
const overflow = S.openings.filter(o => {
  const w = S.walls.find(x => x.id === o.wallId);
  return o.pos - o.w / 2 < -1 || o.pos + o.w / 2 > wlen(w) + 1;
});
check('every opening fits its wall', overflow.length === 0,
  overflow.map(o => o.id + ' pos ' + o.pos + ' w ' + o.w).join(','));

const byWall = {};
S.openings.forEach(o => (byWall[o.wallId] = byWall[o.wallId] || []).push(o));
const clashes = [];
Object.entries(byWall).forEach(([wid, os]) => {
  os.sort((a, b) => a.pos - b.pos);
  for (let i = 1; i < os.length; i++) {
    if (os[i].pos - os[i].w / 2 < os[i - 1].pos + os[i - 1].w / 2) clashes.push(wid + ': ' + os[i - 1].id + ' / ' + os[i].id);
  }
});
check('no two openings overlap on a wall', clashes.length === 0, clashes.join(', '));

/* Rooms should tile the envelope without overlapping each other. */
const overlaps = [];
for (let a = 0; a < S.rooms.length; a++) {
  for (let b = a + 1; b < S.rooms.length; b++) {
    const A = S.rooms[a], B = S.rooms[b];
    const w = Math.min(A.x2, B.x2) - Math.max(A.x1, B.x1);
    const h = Math.min(A.y2, B.y2) - Math.max(A.y1, B.y1);
    if (w > 1 && h > 1) overlaps.push(A.id + ' / ' + B.id);
  }
}
check('room zones do not overlap', overlaps.length === 0, overlaps.join(', '));

const gross = S.rooms.reduce((s, r) => s + Math.abs((r.x2 - r.x1) * (r.y2 - r.y1)), 0) / 1e6;
const ledge = S.ledges.reduce((s, l) => s + Math.abs((l.x2 - l.x1) * (l.y2 - l.y1)), 0) / 1e6;
/* The outline the rooms tile, measured to the printed grid. Held to the mm so
   that moving a wall has to be a deliberate act, not a slip. */
check('rooms tile the outline traced from the sheet', Math.abs(gross - 94.329) < 0.02,
  gross.toFixed(3) + ' m²');

/* The sheet's own note: "Internal Floor Area is computed from the centre-line
   of the walls of the flat". The printed grid is the outer face, so the
   centre-line figure is the outline less half a wall all the way round. Get
   this reconciliation wrong and the plan has stopped describing the real flat,
   however tidy its own arithmetic looks. */
const perim = (() => {
  const v = [[0, 0], [9100, 0], [9100, 1400], [12650, 1400], [12650, 7850], [9100, 7850],
             [9100, 9235], [4035, 9235], [4035, 6540], [1090, 6540], [1090, 4950], [0, 4950]];
  return v.reduce((s, p, i) => {
    const q = v[(i + 1) % v.length];
    return s + Math.abs(q[0] - p[0]) + Math.abs(q[1] - p[1]);
  }, 0);
})();
check('outline perimeter is 43770', perim === 43770, perim + ' mm');
const centreLine = gross - perim * 100 / 1e6;
check('matches the sheet: 90 m² internal, centre-line', Math.abs(centreLine - 90) < 0.15,
  centreLine.toFixed(2) + ' m² (outline ' + gross.toFixed(2) + ' less ' + (perim * 100 / 1e6).toFixed(2) + ' of wall)');
check('matches the sheet: 93 m² with the ledge', Math.abs(centreLine + ledge - 93) < 0.4,
  (centreLine + ledge).toFixed(2) + ' m²');

/* Every wall in the plan must sit on a grid line that is derivable from the
   dimensions printed on the HDB sheet. This is the real contract: not that a
   room's size happens to be printed, but that its edges come from the drawing. */
const GRID = {
  x: {
    0:     'origin',
    1090:  'printed (west of bath 1)',
    3100:  'printed (main bedroom)',
    3590:  '1090 + 2500 (+ bath 1)',
    4035:  '12650 - (1470 + 3595 + 3550), where the bottom chain starts',
    5505:  '4035 + 1470 (+ service yard)',
    6050:  '3100 + 2950 (main bedroom + bedroom 2)',
    6155:  '3590 + 2565 (+ bath 2)',
    9100:  '6050 + 3050 = 5505 + 3595  <- bedroom 3 and the kitchen end together',
    10950: '12650 - 1700 (the shelter is 1700 wide)',
    12650: 'printed overall'
  },
  y: {
    0:    'origin',
    1400: 'printed (right chain: the void above the living room)',
    3550: 'printed (right chain: living room depth)',
    4950: 'printed (left chain) = 1400 + 3550  <- the line that locks the plan',
    6540: '4950 + 1590 (+ the bath band)',
    7850: '4950 + 2900 (+ the shelter band)',
    9235: 'printed overall = 6540 + 2695'
  }
};
const offGrid = [];
S.rooms.forEach(r => {
  [['x', r.x1], ['x', r.x2], ['y', r.y1], ['y', r.y2]].forEach(([ax, v]) => {
    if (!Object.keys(GRID[ax]).some(g => Math.abs(Number(g) - v) < 2)) offGrid.push(r.name + ' ' + ax + '=' + v);
  });
});
check('every room edge sits on a grid line from the sheet', offGrid.length === 0, offGrid.join(', '));
S.walls.forEach(w => {
  const vert = Math.abs(w.x1 - w.x2) < 1;
  const v = vert ? w.x1 : w.y1;
  const ax = vert ? 'x' : 'y';
  if (!Object.keys(GRID[ax]).some(g => Math.abs(Number(g) - v) < 2)) offGrid.push('wall ' + w.id);
});
check('every wall sits on a grid line from the sheet', offGrid.length === 0, offGrid.join(', '));

check('there is a marked entrance', S.openings.some(o => o.entrance));
check('the entrance cannot be deleted', S.openings.filter(o => o.entrance).every(o => o.locked));
check('every wall type has a plain-English name and a reason',
  Object.values(MH.WALL_TYPES).every(t => t.short && t.why && t.name));

const floors = new Set(MH.MATERIALS.filter(m => m.cat === 'Floor').map(m => m.id));
check('room floor finishes are real materials', S.rooms.every(r => floors.has(r.floor)),
  S.rooms.filter(r => !floors.has(r.floor)).map(r => r.floor).join(','));
/* Two of the shelter's four walls are the flat's external envelope, so they are
   already structural concrete. What matters is not how many carry the `shelter`
   type but that nothing bounding it can be taken down. */
const hs = S.rooms.find(r => r.protected);
const bounds = S.walls.filter(w => {
  const vert = Math.abs(w.x1 - w.x2) < 1;
  const lo = Math.min(vert ? w.y1 : w.x1, vert ? w.y2 : w.x2);
  const hi = Math.max(vert ? w.y1 : w.x1, vert ? w.y2 : w.x2);
  const at = vert ? w.x1 : w.y1;
  const [a1, a2, b1, b2] = vert ? [hs.x1, hs.x2, hs.y1, hs.y2] : [hs.y1, hs.y2, hs.x1, hs.x2];
  return (Math.abs(at - a1) < 2 || Math.abs(at - a2) < 2) && lo < b2 - 1 && hi > b1 + 1;
});
check('household shelter is protected', !!hs && bounds.length >= 4 &&
  bounds.every(w => MH.WALL_TYPES[w.type].hackable === false),
  bounds.length + ' walls bound it: ' + bounds.map(w => w.type).join(', '));
check('structural walls are not hackable',
  S.walls.filter(w => ['rc', 'rcInternal', 'shelter', 'parapet'].includes(w.type))
    .every(w => MH.WALL_TYPES[w.type].hackable === false));

/* --------------------------------------------------------------------------
   The furnishing packs. These are generated from the room geometry rather
   than stored as coordinates, so they have to be re-measured, not eyeballed.
   The bar is the advisor's own: a pack that hands the user a layout the app
   then complains about is worse than no pack at all.
   -------------------------------------------------------------------------- */
console.log('\nFurnishing packs');
const state = MH.Store.init();
const seedIssues = MH.Advisor.run(state).issues.filter(i => i.level === 'error' || i.level === 'warn');
check('the flat as handed over has nothing to fix', seedIssues.length === 0,
  seedIssues.map(i => i.title).join('; '));

check('five packs offered', MH.PACKS.length === 5, MH.PACKS.map(p => p.id).join(','));
check('every pack has a name and a note', MH.PACKS.every(p => p.id && p.name && p.note));

MH.PACKS.forEach(p => {
  const want = MH.Packs.forFlat(state, p.id);
  const got = MH.Packs.resolve(state, want);
  const st = JSON.parse(JSON.stringify(state));
  st.items = st.items.filter(it => ['db', 'condenser', 'column'].includes(it.catId));
  got.forEach((g, n) => st.items.push(MH.Store.hydrateItem(Object.assign({ id: 'p' + n }, g))));
  const res = MH.Advisor.run(st);
  const bad = res.issues.filter(i => i.level === 'error' || i.level === 'warn');
  check('pack "' + p.id + '" furnishes the whole flat', got.length >= 25, got.length + ' pieces');
  check('pack "' + p.id + '" places everything it proposes', got.length === want.length,
    (want.length - got.length) + ' dropped');
  check('pack "' + p.id + '" passes the advisor', bad.length === 0,
    bad.length ? bad.map(i => i.title).join('; ') : 'health ' + res.scores.overall);
  /* Somewhere to sleep, sit, eat and cook, in every pack. */
  const has = g => got.some(it => (MH.Store.catalogById(it.catId) || {}).glyph === g);
  check('pack "' + p.id + '" covers the basics', has('bed') && has('sofa') &&
    (has('tableRect') || has('tableRound')) && has('hob'),
    ['bed', 'sofa', 'table', 'hob'].filter((n, i) =>
      ![has('bed'), has('sofa'), has('tableRect') || has('tableRound'), has('hob')][i]).join(',') || 'all present');
});

console.log(fails ? '\n' + fails + ' check(s) failed\n' : '\nAll data checks passed\n');
process.exit(fails ? 1 : 0);
