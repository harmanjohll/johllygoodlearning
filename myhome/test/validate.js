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
vm.createContext(sandbox);
['data-styles.js', 'data-catalog.js', 'data-plan.js'].forEach(f => {
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
check('twelve numbered rooms', S.rooms.length === 12, S.rooms.length);
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
const env = 8900 * 12500 / 1e6;
check('rooms tile the envelope', Math.abs(gross - env) < 0.5, gross.toFixed(2) + ' m² of ' + env.toFixed(2) + ' m²');
check('gross area realistic for a 5-room HDB', gross > 95 && gross < 125, gross.toFixed(2) + ' m²');

const floors = new Set(MH.MATERIALS.filter(m => m.cat === 'Floor').map(m => m.id));
check('room floor finishes are real materials', S.rooms.every(r => floors.has(r.floor)),
  S.rooms.filter(r => !floors.has(r.floor)).map(r => r.floor).join(','));
check('household shelter is protected', S.rooms.some(r => r.protected) &&
  S.walls.filter(w => w.type === 'shelter').length >= 4);
check('structural walls are not hackable',
  S.walls.filter(w => ['rc', 'rcInternal', 'shelter', 'parapet'].includes(w.type))
    .every(w => MH.WALL_TYPES[w.type].hackable === false));

console.log(fails ? '\n' + fails + ' check(s) failed\n' : '\nAll data checks passed\n');
process.exit(fails ? 1 : 0);
