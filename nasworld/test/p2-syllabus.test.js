// P2 syllabus coverage (MOE 2021 Primary Mathematics).
//
// The maths world was audited against the P2 syllabus and seven gaps
// were closed: money in dollars and cents, time to five minutes with am
// and pm and durations, numbers to 1000, mass and volume, picture graphs
// with a key, two-step word problems, and fractions to twelfths.
//
// Every generator here is run a few hundred times at every level. The
// checks are the ones that matter to the child reading the card:
//
//   1. The answer key is right. It is worked out again here from the
//      numbers in the question, by a different route wherever possible,
//      so a wrong formula in the generator cannot agree with itself.
//   2. There is exactly one right answer among the choices, no choice
//      is printed twice, and no wrong choice is the right answer in
//      another form (2/4 beside 1/2).
//   3. Each rung of the ladder stays inside its own range.
//   4. Every type that comes out has a renderer, the card has no
//      "undefined" on it, and exactly one button is the right one.

const fs = require('fs');
const vm = require('vm');

process.on('uncaughtException', e => { if (!/Cannot (set|read) propert/.test(String(e && e.message))) throw e; });
process.on('unhandledRejection', e => { if (!/Cannot (set|read) propert/.test(String(e && e.message))) throw e; });

const html = fs.readFileSync(__dirname + '/../dist/bundle.html', 'utf8');
const blocks = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m => m[1]);
const code = blocks.sort((a, b) => b.length - a.length)[0];

const noop = () => {};
const el = () => ({
  classList: { add: noop, remove: noop, toggle: noop, contains: () => false },
  style: {}, dataset: {}, appendChild: noop, remove: noop, removeAttribute: noop,
  setAttribute: noop, getAttribute: () => null, addEventListener: noop,
  querySelector: () => null, querySelectorAll: () => [], insertAdjacentHTML: noop,
  textContent: '', innerHTML: '', offsetHeight: 0, focus: noop, parentElement: null,
  getBoundingClientRect: () => ({ left: 0, top: 0, width: 100, height: 100 })
});

const store = {};
const sandbox = {
  console,
  setTimeout: noop, clearTimeout: noop, setInterval: () => 1, clearInterval: noop,
  requestAnimationFrame: noop,
  Math, Date, JSON, Set, Map, Object, Array, String, Number, Boolean, isFinite, isNaN,
  parseInt, parseFloat, RegExp, Error, encodeURIComponent,
  AbortController: function () { this.abort = noop; this.signal = null; },
  fetch: () => Promise.reject(new Error('offline in test')),
  navigator: { onLine: false },
  localStorage: {
    getItem: k => (k in store ? store[k] : null),
    setItem: (k, v) => { store[k] = String(v); },
    removeItem: k => { delete store[k]; }
  },
  document: {
    getElementById: () => null, querySelector: () => null, querySelectorAll: () => [],
    createElement: el, body: el(), addEventListener: noop, documentElement: el()
  },
  window: {}
};
sandbox.window = sandbox;
sandbox.globalThis = sandbox;
vm.createContext(sandbox);

try { vm.runInContext(code, sandbox); } catch (e) {
  if (!/Cannot (set|read)/.test(String(e.message))) console.log('LOAD WARN:', e.message.slice(0, 120));
}

const R = [];
const ok = (name, cond, extra = '') => R.push({ name, pass: !!cond, extra });

// Each block below is an ordinary function, run inside the bundle's own
// context so that it sees the real generators and renderers.
const inApp = fn => vm.runInContext('(' + fn.toString() + ')()', sandbox);

vm.runInContext('state = state || {}; state.skills = {}; state.tokens = 0; state.drillConfigs = {};', sandbox);

// Shared helpers, defined once inside the app context.
inApp(function () {
  window.__t = {
    // Run a generator n times at one level, handing each question to `each`.
    sweep: function (skill, level, n, config, each) {
      state.skills = {};
      getSkillState(skill).level = level;
      for (var i = 0; i < n; i++) each(generateMathQuestion(skill, config || null));
      state.skills = {};
    },
    // Problems with a set of choices: wrong size, answer missing or
    // repeated, a choice printed twice, or an empty choice.
    choiceFault: function (q, want) {
      if (!Array.isArray(q.options)) return 'no choices';
      if (want && q.options.length !== want) return q.options.length + ' choices instead of ' + want;
      var hits = q.options.filter(function (o) { return String(o) === String(q.answer); }).length;
      if (hits !== 1) return 'answer appears ' + hits + ' times';
      var seen = {};
      for (var i = 0; i < q.options.length; i++) {
        var k = String(q.options[i]);
        if (k === 'undefined' || k === 'null' || k === 'NaN' || k === '') return 'empty choice';
        if (seen[k]) return 'choice "' + k + '" twice';
        seen[k] = true;
      }
      return '';
    },
    digits: function (n) { return [Math.floor(n / 100) % 10, Math.floor(n / 10) % 10, n % 10]; },
    collector: function () {
      var bad = [], out = { bad: bad, checked: 0, seen: {} };
      out.note = function (m) { if (bad.length < 5 && bad.indexOf(m) === -1) bad.push(m); };
      out.mark = function (k) { out.seen[k] = (out.seen[k] || 0) + 1; };
      return out;
    }
  };
});

const summary = c => c.bad.length ? c.bad.join(' | ') : c.checked + ' questions checked';

// ---------------------------------------------------------------------
// 1. Numbers to 1000
// ---------------------------------------------------------------------

const num = inApp(function () {
  var T = window.__t, c = T.collector();
  var perLevel = {};
  for (var lvl = 0; lvl <= 4; lvl++) {
    var L = perLevel[lvl] = { types: {}, steps: {}, back: 0, midBlank: 0, zeroBlocks: 0, sameHundreds: 0, compares: 0, permuted: 0 };
    T.sweep('num1000', lvl, 500, null, function (q) {
      c.checked++;
      var key = q.type + (q.variant ? ':' + q.variant : '');
      L.types[key] = true;
      var fault = T.choiceFault(q, q.type === 'compare-1000' ? 0 : 4);
      if (fault) c.note('L' + lvl + ' ' + key + ': ' + fault);

      if (q.type === 'pv-1000') {
        if (!(q.number >= 100 && q.number <= 999)) c.note(key + ': number ' + q.number + ' is not three digits');
        var d = T.digits(q.number);
        if (q.variant === 'blocks') {
          if (q.hundreds * 100 + q.tens * 10 + q.ones !== q.number || q.answer !== q.number) c.note('blocks do not make ' + q.number);
          if (d[1] === 0 || d[2] === 0) L.zeroBlocks++;
        } else if (q.variant === 'digit') {
          var pos = ['hundreds', 'tens', 'ones'].indexOf(q.place);
          if (pos < 0 || q.answer !== d[pos]) c.note('digit in the ' + q.place + ' place of ' + q.number + ' keyed as ' + q.answer);
        } else if (q.variant === 'value') {
          var at = d.indexOf(q.digit);
          if (at < 0 || d.lastIndexOf(q.digit) !== at) c.note('digit ' + q.digit + ' is not in ' + q.number + ' exactly once');
          else if (q.answer !== q.digit * [100, 10, 1][at]) c.note('value of ' + q.digit + ' in ' + q.number + ' keyed as ' + q.answer);
          if (q.digit === 0) c.note('asked for the value of a zero');
        } else if (q.variant === 'words') {
          if (numberToWords(q.answer) !== q.words || q.answer !== q.number) c.note('words "' + q.words + '" keyed as ' + q.answer);
        } else c.note('unknown variant ' + q.variant);
      } else if (q.type === 'compare-1000') {
        L.compares++;
        var uniq = {}; q.numbers.forEach(function (n) { uniq[n] = true; });
        if (Object.keys(uniq).length !== q.numbers.length) c.note('compare: two equal numbers');
        var want = q.want === 'greatest' ? Math.max.apply(null, q.numbers) : Math.min.apply(null, q.numbers);
        if (q.answer !== want) c.note('compare: ' + q.want + ' of ' + q.numbers.join(',') + ' keyed as ' + q.answer);
        var hs = {}; q.numbers.forEach(function (n) { hs[Math.floor(n / 100)] = true; });
        if (Object.keys(hs).length === 1) L.sameHundreds++;
        var sig = q.numbers.map(function (n) { return T.digits(n).sort().join(''); });
        if (sig.every(function (s) { return s === sig[0]; })) L.permuted++;
        if (q.numbers.some(function (n) { return n < 100 || n > 999; })) c.note('compare: number out of range');
      } else if (q.type === 'order-1000') {
        var asc = q.numbers.slice().sort(function (a, b) { return a - b; });
        if (asc[0] === asc[1] || asc[1] === asc[2]) c.note('order: two equal numbers');
        var wantO = (q.direction === 'smallest' ? asc : asc.reverse()).join(', ');
        if (q.answer !== wantO) c.note('order: keyed "' + q.answer + '", should be "' + wantO + '"');
      } else if (q.type === 'pattern-1000') {
        L.steps[q.step] = true;
        if (q.direction < 0) L.back++;
        if (q.blank !== 4) L.midBlank++;
        for (var i = 1; i < q.terms.length; i++) {
          if (q.terms[i] - q.terms[i - 1] !== q.step * q.direction) c.note('pattern: gap is not ' + q.step + ' in ' + q.terms.join(','));
        }
        if (q.terms.length !== 5) c.note('pattern: ' + q.terms.length + ' terms');
        if (q.answer !== q.terms[q.blank]) c.note('pattern: key is not the missing term');
        if (q.terms.some(function (n) { return n < 1 || n > 1000; })) c.note('pattern: term outside 1 to 1000 in ' + q.terms.join(','));
      } else c.note('unexpected type ' + q.type);
    });
    L.types = Object.keys(L.types).sort();
    L.steps = Object.keys(L.steps).map(Number).sort(function (a, b) { return a - b; });
  }
  c.levels = perLevel;
  c.words = [406, 460, 999, 110, 700, 315, 1000].map(numberToWords).join('|');
  return c;
});
ok('numbers to 1000: every key is right and every set of choices is sound', num.bad.length === 0, summary(num));
ok('numbers to 1000: three-digit numbers are read out in words correctly',
   num.words === 'four hundred and six|four hundred and sixty|nine hundred and ninety-nine|one hundred and ten|seven hundred|three hundred and fifteen|one thousand',
   num.words);
ok('numbers to 1000: level 0 is blocks with no empty place, comparing and counting in tens and hundreds',
   num.levels[0].types.join(',') === 'compare-1000,pattern-1000,pv-1000:blocks' &&
   num.levels[0].steps.join(',') === '10,100' && num.levels[0].zeroBlocks === 0 &&
   num.levels[0].back === 0 && num.levels[0].midBlank === 0 && num.levels[0].sameHundreds === 0,
   JSON.stringify(num.levels[0]));
ok('numbers to 1000: by level 4 patterns count on and back in 2s, 3s, 4s, 5s, 10s and 100s',
   num.levels[4].steps.join(',') === '2,3,4,5,10,100' && num.levels[4].back > 0 && num.levels[4].midBlank > 0 &&
   num.levels[2].back === 0,
   'L4 steps ' + num.levels[4].steps.join('/') + ', ' + num.levels[4].back + ' counting back');
ok('numbers to 1000: comparisons close up, ending on the same three digits rearranged',
   num.levels[2].sameHundreds === num.levels[2].compares && num.levels[4].permuted === num.levels[4].compares &&
   num.levels[4].compares > 0 && num.levels[4].types.indexOf('order-1000') >= 0 && num.levels[4].types.indexOf('pv-1000:words') >= 0,
   'L2 ' + num.levels[2].sameHundreds + '/' + num.levels[2].compares + ' share a hundreds digit, L4 ' +
   num.levels[4].permuted + '/' + num.levels[4].compares + ' are rearrangements');

// ---------------------------------------------------------------------
// 2. Addition and subtraction within 1000
// ---------------------------------------------------------------------

const addsub = inApp(function () {
  var T = window.__t, c = T.collector();
  // Worked out here digit by digit, independently of the generator's
  // own carry detector.
  function carries(a, b) {
    var da = T.digits(a), db = T.digits(b);
    var c1 = da[2] + db[2] >= 10 ? 1 : 0;
    var c2 = da[1] + db[1] + c1 >= 10 ? 1 : 0;
    return [c1, c2];
  }
  function borrows(a, b) {
    var da = T.digits(a), db = T.digits(b);
    var b1 = da[2] < db[2] ? 1 : 0;
    var b2 = da[1] - b1 < db[1] ? 1 : 0;
    return [b1, b2];
  }
  var per = {};
  for (var lvl = 0; lvl <= 4; lvl++) {
    var L = per[lvl] = { none: 0, onesOnly: 0, tensOnly: 0, both: 0, n: 0, ops: {}, trap: 0, trapDue: 0, simpleB: 0 };
    T.sweep('addsub1000', lvl, 600, null, function (q) {
      c.checked++; L.n++; L.ops[q.op] = true;
      var fault = T.choiceFault(q, 4);
      if (fault) c.note('L' + lvl + ' ' + q.a + q.op + q.b + ': ' + fault);
      if (q.type !== 'addsub-1000') c.note('unexpected type ' + q.type);
      var want = q.op === '+' ? q.a + q.b : q.a - q.b;
      if (q.answer !== want) c.note(q.a + ' ' + q.op + ' ' + q.b + ' keyed as ' + q.answer);
      if (!(q.answer > 0 && q.answer <= 1000)) c.note('answer ' + q.answer + ' is outside 1 to 1000');
      if (!(q.a >= 100 && q.a <= 999 && q.b >= 1 && q.b <= 999)) c.note('operands out of range: ' + q.a + ', ' + q.b);
      var r = q.op === '+' ? carries(q.a, q.b) : borrows(q.a, q.b);
      if (!r[0] && !r[1]) L.none++;
      else if (r[0] && !r[1]) L.onesOnly++;
      else if (!r[0] && r[1]) L.tensOnly++;
      else L.both++;
      if (q.regroup !== !!(r[0] || r[1])) c.note('regroup flag wrong for ' + q.a + q.op + q.b);
      if (q.b < 10 || q.b % 10 === 0 && (q.b < 100 || q.b % 100 === 0)) L.simpleB++;
      // The answer a child gets by ignoring regrouping must be offered
      // whenever regrouping is needed.
      var da = T.digits(q.a), db = T.digits(q.b), slip = 0;
      for (var i = 0; i < 3; i++) {
        slip = slip * 10 + (q.op === '+' ? (da[i] + db[i]) % 10 : Math.abs(da[i] - db[i]));
      }
      if ((r[0] || r[1]) && slip > 0 && slip !== q.answer) {
        L.trapDue++;
        if (q.options.indexOf(slip) >= 0) L.trap++;
      }
      if (q.options.some(function (o) { return typeof o !== 'number' || o < 0 || o !== Math.round(o); })) c.note('a choice is not a whole number');
    });
    L.ops = Object.keys(L.ops).sort().join('');
  }
  c.levels = per;
  // Drill filters.
  var onlyAdd = true, onlySub = true;
  T.sweep('addsub1000', 2, 100, { flag: 'add' }, function (q) { if (q.op !== '+') onlyAdd = false; });
  T.sweep('addsub1000', 2, 100, { flag: 'sub' }, function (q) { if (q.op !== '-') onlySub = false; });
  c.filters = onlyAdd && onlySub;
  return c;
});
ok('add and subtract to 1000: every key is right, within 1000, with sound choices', addsub.bad.length === 0, summary(addsub));
ok('add and subtract to 1000: no regrouping at levels 0 and 1, and a one-place second number at level 0',
   addsub.levels[0].none === addsub.levels[0].n && addsub.levels[1].none === addsub.levels[1].n &&
   addsub.levels[0].simpleB === addsub.levels[0].n && addsub.levels[1].simpleB < addsub.levels[1].n,
   'L0 ' + addsub.levels[0].none + '/' + addsub.levels[0].n + ', L1 ' + addsub.levels[1].none + '/' + addsub.levels[1].n);
ok('add and subtract to 1000: ones only at level 2, one place at level 3, both places at level 4',
   addsub.levels[2].onesOnly === addsub.levels[2].n &&
   addsub.levels[3].onesOnly + addsub.levels[3].tensOnly === addsub.levels[3].n && addsub.levels[3].tensOnly > 0 &&
   addsub.levels[4].both === addsub.levels[4].n,
   'L2 ones ' + addsub.levels[2].onesOnly + '  L3 ones ' + addsub.levels[3].onesOnly + ' tens ' + addsub.levels[3].tensOnly +
   '  L4 both ' + addsub.levels[4].both + '/' + addsub.levels[4].n);
ok('add and subtract to 1000: the forgot-to-regroup answer is always among the wrong choices',
   [2, 3, 4].every(function (l) { return addsub.levels[l].trapDue > 0 && addsub.levels[l].trap === addsub.levels[l].trapDue; }),
   [2, 3, 4].map(function (l) { return 'L' + l + ' ' + addsub.levels[l].trap + '/' + addsub.levels[l].trapDue; }).join('  '));
ok('add and subtract to 1000: both operations at every level, and the drill filter picks one',
   [0, 1, 2, 3, 4].every(function (l) { return addsub.levels[l].ops === '+-'; }) && addsub.filters,
   [0, 1, 2, 3, 4].map(function (l) { return addsub.levels[l].ops; }).join(' '));

// ---------------------------------------------------------------------
// 3. Mass and volume
// ---------------------------------------------------------------------

const measure = inApp(function () {
  var T = window.__t, c = T.collector();
  var per = { mass: {}, volume: {} };
  ['mass', 'volume'].forEach(function (skill) {
    for (var lvl = 0; lvl <= 4; lvl++) {
      var L = per[skill][lvl] = { types: {}, units: {}, maxCalc: 0, between: 0, scales: 0, items: {} };
      T.sweep(skill, lvl, 500, null, function (q) {
        c.checked++;
        L.types[q.type] = true; L.units[q.unit] = true;
        var tag = skill + ' L' + lvl + ' ' + q.type;
        if (q.quantity !== skill) c.note(tag + ': quantity is ' + q.quantity);
        var fault = T.choiceFault(q, q.type === 'measure-compare' ? 0 : 4);
        if (fault) c.note(tag + ': ' + fault);

        if (q.type === 'measure-compare') {
          L.items[q.items.length] = true;
          var vals = q.items.map(function (it) { return it.value; });
          var names = q.items.map(function (it) { return it.name; });
          if (vals.some(function (v, i) { return vals.indexOf(v) !== i; })) c.note(tag + ': two equal amounts');
          if (names.some(function (v, i) { return names.indexOf(v) !== i; })) c.note(tag + ': the same thing twice');
          // "more", "most", "heavier", "heaviest" ask for the largest.
          var wantMax = /heav|more|most/.test(q.text);
          var wantMin = /light|less|least/.test(q.text);
          if (wantMax === wantMin) c.note(tag + ': cannot tell what "' + q.text + '" asks for');
          var target = wantMax ? Math.max.apply(null, vals) : Math.min.apply(null, vals);
          if (q.answer !== names[vals.indexOf(target)]) c.note(tag + ': "' + q.text + '" keyed as ' + q.answer);
          if (vals.some(function (v) { return !(v > 0) || v !== Math.round(v); })) c.note(tag + ': bad amount');
        } else if (q.type === 'measure-scale') {
          L.scales++;
          if (q.answer !== q.value) c.note(tag + ': key is not the reading');
          if (!(q.value > 0 && q.value < q.max)) c.note(tag + ': reading ' + q.value + ' is off the scale of ' + q.max);
          if (q.value % q.tickStep !== 0) c.note(tag + ': reading ' + q.value + ' is not on a mark');
          if (q.max % q.labelStep !== 0 || q.labelStep % q.tickStep !== 0) c.note(tag + ': scale marks do not divide evenly');
          if (q.value % q.labelStep !== 0) L.between++;
          if (q.options.some(function (o) { return !(o > 0 && o <= q.max); })) c.note(tag + ': a choice is off the scale');
        } else if (q.type === 'measure-calc') {
          var want = q.op === '+' ? q.a + q.b : q.a - q.b;
          if (q.answer !== want) c.note(tag + ': ' + q.a + q.op + q.b + ' keyed as ' + q.answer);
          if (!(q.answer > 0)) c.note(tag + ': answer ' + q.answer);
          // Both amounts must really be printed in the story, with the unit.
          if (q.text.indexOf(q.a + ' ' + q.unit) === -1 || q.text.indexOf(q.b + ' ' + q.unit) === -1) c.note(tag + ': amounts missing from the story');
          var asksSum = /total|altogether/.test(q.text);
          if (asksSum !== (q.op === '+')) c.note(tag + ': the story and the operation disagree');
          L.maxCalc = Math.max(L.maxCalc, q.a, q.b, q.answer);
        } else c.note(tag + ': unexpected type');
      });
      L.types = Object.keys(L.types).sort().join(',');
      L.units = Object.keys(L.units).sort().join(',');
      L.items = Object.keys(L.items).sort().join(',');
    }
  });
  c.levels = per;
  // Drill filters.
  var seen = {};
  ['compare', 'scale', 'calc'].forEach(function (f) {
    var types = {};
    T.sweep('mass', 0, 60, { flag: f }, function (q) { types[q.type] = true; });
    T.sweep('volume', 0, 60, { flag: f }, function (q) { types[q.type] = true; if (!(q.answer !== undefined)) types.BAD = true; });
    seen[f] = Object.keys(types).join(',');
  });
  c.filters = seen;
  return c;
});
ok('mass and volume: every key is right and every set of choices is sound', measure.bad.length === 0, summary(measure));
ok('mass: kilograms first, grams from level 2, sums only from level 1',
   measure.levels.mass[0].units === 'kg' && measure.levels.mass[1].units === 'kg' &&
   [2, 3, 4].every(function (l) { return measure.levels.mass[l].units === 'g'; }) &&
   measure.levels.mass[0].types === 'measure-compare,measure-scale' &&
   measure.levels.mass[1].types === 'measure-calc,measure-compare,measure-scale',
   [0, 1, 2, 3, 4].map(function (l) { return 'L' + l + ' ' + measure.levels.mass[l].units; }).join(' '));
ok('mass: sums stay within 20 kg, then within 1000 g',
   measure.levels.mass[1].maxCalc <= 20 && [2, 3, 4].every(function (l) { return measure.levels.mass[l].maxCalc <= 1000 && measure.levels.mass[l].maxCalc > 100; }),
   [1, 2, 3, 4].map(function (l) { return 'L' + l + ' max ' + measure.levels.mass[l].maxCalc; }).join(' '));
ok('volume: litres throughout, sums within 100',
   [0, 1, 2, 3, 4].every(function (l) { return measure.levels.volume[l].units === 'ℓ'; }) &&
   [1, 2, 3, 4].every(function (l) { return measure.levels.volume[l].maxCalc <= 100; }) &&
   measure.levels.volume[4].maxCalc > measure.levels.volume[1].maxCalc,
   [1, 2, 3, 4].map(function (l) { return 'L' + l + ' max ' + measure.levels.volume[l].maxCalc; }).join(' '));
ok('mass and volume: every mark is numbered at level 0; later most readings fall between the numbers',
   measure.levels.mass[0].between === 0 && measure.levels.volume[0].between === 0 &&
   measure.levels.mass[4].between > measure.levels.mass[4].scales * 0.6 &&
   measure.levels.volume[4].between > measure.levels.volume[4].scales * 0.6,
   'mass L4 ' + measure.levels.mass[4].between + '/' + measure.levels.mass[4].scales +
   ', volume L4 ' + measure.levels.volume[4].between + '/' + measure.levels.volume[4].scales);
ok('mass and volume: two things to compare at first, three from level 2',
   measure.levels.mass[0].items === '2' && measure.levels.mass[2].items === '3' &&
   measure.levels.volume[0].items === '2' && measure.levels.volume[4].items === '3',
   'mass ' + measure.levels.mass[0].items + ' then ' + measure.levels.mass[2].items);
ok('mass and volume: the Practice filters each give one kind of question',
   measure.filters.compare === 'measure-compare' && measure.filters.scale === 'measure-scale' && measure.filters.calc === 'measure-calc',
   JSON.stringify(measure.filters));

// ---------------------------------------------------------------------
// 4. Picture graphs with a key
// ---------------------------------------------------------------------

const graph = inApp(function () {
  var T = window.__t, c = T.collector();
  var per = {};
  for (var lvl = 0; lvl <= 4; lvl++) {
    var L = per[lvl] = { scales: {}, kinds: {}, trap: 0, trapDue: 0, max: 0 };
    T.sweep('pgraph', lvl, 500, null, function (q) {
      c.checked++;
      var scale = q.scale || 1;
      L.scales[scale] = true;
      var kind = q.qType.split('_')[0];
      L.kinds[kind] = true;
      var tag = 'L' + lvl + ' ' + q.qType;
      if (q.values.some(function (v, i) { return q.values.indexOf(v) !== i; })) c.note(tag + ': two rows tie');
      L.max = Math.max(L.max, Math.max.apply(null, q.values));
      if (scale > 1) {
        if (!q.counts || q.counts.length !== q.values.length) c.note(tag + ': picture counts missing');
        else q.counts.forEach(function (n, i) {
          if (n * scale !== q.values[i]) c.note(tag + ': ' + n + ' pictures at ' + scale + ' each is not ' + q.values[i]);
          if (!(n >= 1) || n !== Math.round(n)) c.note(tag + ': ' + n + ' pictures');
        });
      } else if (q.counts || q.options) c.note(tag + ': a one-for-one graph carries key data');

      var parts = q.qType.split('_'), want, forgot = null;
      var total = q.values.reduce(function (a, b) { return a + b; }, 0);
      if (kind === 'most') want = q.categories[q.values.indexOf(Math.max.apply(null, q.values))];
      else if (kind === 'least') want = q.categories[q.values.indexOf(Math.min.apply(null, q.values))];
      else if (kind === 'total') { want = total; forgot = scale > 1 ? total / scale : null; }
      else if (kind === 'howmany') { want = q.values[+parts[1]]; forgot = scale > 1 ? want / scale : null; }
      else if (kind === 'more') {
        want = q.values[+parts[1]] - q.values[+parts[2]];
        forgot = want / scale;
        if (!(want > 0)) c.note(tag + ': "how many more" is ' + want);
      } else c.note(tag + ': unknown question');
      if (q.answer !== want) c.note(tag + ': keyed ' + q.answer + ', should be ' + want);

      if (scale > 1 && typeof q.answer === 'number') {
        var fault = T.choiceFault(q, 4);
        if (fault) c.note(tag + ': ' + fault);
        // Counting the pictures and ignoring the key is the mistake
        // this topic exists to prevent, so it must be on offer.
        L.trapDue++;
        if (q.options.indexOf(forgot) >= 0) L.trap++;
      }
    });
    L.scales = Object.keys(L.scales).map(Number).sort(function (a, b) { return a - b; });
    L.kinds = Object.keys(L.kinds).sort();
  }
  c.levels = per;

  // The drawn graph must show pictures and a key and never the totals.
  state.skills = {}; getSkillState('pgraph').level = 4;
  var leaks = 0, dotsWrong = 0, noKey = 0, drawn = 0;
  for (var i = 0; i < 300; i++) {
    var q = generateMathQuestion('pgraph', null);
    var card = { innerHTML: '' };
    renderMathQuestion(card, q);
    drawn++;
    var dots = (card.innerHTML.match(/border-radius:50%/g) || []).length;
    if (dots !== q.counts.reduce(function (a, b) { return a + b; }, 0) + 1) dotsWrong++;
    if (card.innerHTML.indexOf('stands for ' + q.scale + ' fruits') === -1) noKey++;
    // Everything before the first answer button is the picture.
    var picture = card.innerHTML.split('answer-options')[0].replace(/<[^>]*>/g, ' ');
    var printed = (picture.match(/\d+/g) || []).map(Number);
    if (printed.length !== 1 || printed[0] !== q.scale) leaks++;
  }
  state.skills = {};
  c.draw = { leaks: leaks, dotsWrong: dotsWrong, noKey: noKey, drawn: drawn };
  return c;
});
ok('picture graphs: every key is right, rows never tie, choices are sound', graph.bad.length === 0, summary(graph));
ok('picture graphs: one picture for one thing at levels 0 and 1',
   graph.levels[0].scales.join(',') === '1' && graph.levels[1].scales.join(',') === '1',
   'L0 ' + graph.levels[0].scales.join('/') + '  L1 ' + graph.levels[1].scales.join('/'));
ok('picture graphs: a key of 2 at level 2, then 2, 5 and 10, then 3, 4, 5 and 10',
   graph.levels[2].scales.join(',') === '2' && graph.levels[3].scales.join(',') === '2,5,10' &&
   graph.levels[4].scales.join(',') === '3,4,5,10',
   'L2 ' + graph.levels[2].scales.join('/') + '  L3 ' + graph.levels[3].scales.join('/') + '  L4 ' + graph.levels[4].scales.join('/'));
ok('picture graphs: "how many more" joins at level 3, and totals stay within 1000',
   graph.levels[2].kinds.indexOf('more') === -1 && graph.levels[3].kinds.indexOf('more') >= 0 &&
   graph.levels[4].kinds.indexOf('more') >= 0 && graph.levels[4].max <= 100,
   'L3 ' + graph.levels[3].kinds.join('+') + '  largest row at L4 ' + graph.levels[4].max);
ok('picture graphs: the "counted the pictures, ignored the key" answer is always among the choices',
   [2, 3, 4].every(function (l) { return graph.levels[l].trapDue > 0 && graph.levels[l].trap === graph.levels[l].trapDue; }),
   [2, 3, 4].map(function (l) { return 'L' + l + ' ' + graph.levels[l].trap + '/' + graph.levels[l].trapDue; }).join('  '));
ok('picture graphs: the drawing shows the right number of pictures and a key, and no totals',
   graph.draw.drawn === 300 && graph.draw.leaks === 0 && graph.draw.dotsWrong === 0 && graph.draw.noKey === 0,
   JSON.stringify(graph.draw));

// ---------------------------------------------------------------------
// 5. Two-step word problems
// ---------------------------------------------------------------------

const wp2 = inApp(function () {
  var T = window.__t, c = T.collector();
  var ceilings = [50, 100, 300, 600, 1000];
  var per = {};
  // Work the story out again from its own words. Each pattern below is
  // one way of telling a two-step problem; the numbers are read straight
  // from the sentence in the order they appear.
  function solve(text) {
    var n = (text.replace(/Primary \d/g, '').match(/\d+/g) || []).map(Number);
    if (/altogether\. .*How many more/.test(text)) return { v: 2 * n[1] - n[0], mid: n[0] - n[1] };
    if (/ more .* fewer .* than /.test(text)) return { v: n[0] + n[1] - n[2], mid: n[0] + n[1] };
    if (/ more .*altogether\?/.test(text)) return { v: n[0] + n[0] + n[1], mid: n[0] + n[1] };
    if (/ fewer .*altogether\?/.test(text)) return { v: n[0] + n[0] - n[1], mid: n[0] - n[1] };
    if (/The rest are/.test(text)) return { v: n[0] - n[1] - n[2], mid: n[1] + n[2], alt: n[0] - n[1] };
    if (/on Monday and|boys and \d+ girls/.test(text)) return { v: n[0] + n[1] - n[2], mid: n[0] + n[1] };
    return null;
  }
  for (var lvl = 0; lvl <= 4; lvl++) {
    var L = per[lvl] = { structures: {}, biggest: 0, texts: {}, midOffered: 0, n: 0, bars: 0 };
    T.sweep('wp2', lvl, 500, null, function (q) {
      c.checked++; L.n++;
      var tag = 'L' + lvl;
      if (!q || q.type !== 'word-problem') { c.note(tag + ': not a word problem'); return; }
      L.structures[q.structure] = true;
      L.texts[q.text] = true;
      if (q.steps !== 2) c.note(tag + ': marked as ' + q.steps + ' step');
      var fault = T.choiceFault(q, 4);
      if (fault) c.note(tag + ' "' + q.text.slice(0, 40) + '": ' + fault);
      var s = solve(q.text);
      if (!s) { c.note(tag + ': story not recognised: ' + q.text); return; }
      if (q.answer !== s.v) c.note(tag + ': keyed ' + q.answer + ', the story gives ' + s.v + ': ' + q.text);
      if (!(q.answer > 0) || q.answer !== Math.round(q.answer)) c.note(tag + ': answer ' + q.answer);
      var nums = (q.text.replace(/Primary \d/g, '').match(/\d+/g) || []).map(Number).concat([q.answer, s.mid]);
      var top = Math.max.apply(null, nums);
      if (top > L.biggest) L.biggest = top;
      if (top > ceilings[lvl]) c.note(tag + ': ' + top + ' is over the ceiling of ' + ceilings[lvl]);
      if (nums.some(function (v) { return !(v > 0); })) c.note(tag + ': a number in the story is not positive: ' + q.text);
      if (q.text.indexOf('?') === -1 || /!/.test(q.text) || /undefined|NaN/.test(q.text)) c.note(tag + ': text is malformed: ' + q.text);
      // The middle number: what a child has after doing only step one.
      if (q.options.indexOf(s.mid) >= 0 || (s.alt !== undefined && q.options.indexOf(s.alt) >= 0)) L.midOffered++;
      if (q.bar) L.bars++;
      if (q.options.some(function (o) { return typeof o !== 'number' || !(o > 0); })) c.note(tag + ': a choice is not a positive number');
      // The working shown afterwards must end on the answer.
      var last = q.working ? Number(q.working.split('=').pop()) : NaN;
      if (last !== q.answer) c.note(tag + ': working ends on ' + last + ' but the key is ' + q.answer);
    });
    L.structures = Object.keys(L.structures).sort().join(',');
    L.texts = Object.keys(L.texts).length;
  }
  c.levels = per;
  var only = {};
  T.sweep('wp2', 2, 150, { mode: 'word', structure: 'two-step-cmp' }, function (q) { only[q.structure] = true; });
  c.filter = Object.keys(only).join(',');
  return c;
});
ok('two-step problems: every key matches the story when it is worked out again from the words', wp2.bad.length === 0, summary(wp2));
ok('two-step problems: both part-whole and comparison stories at every level, each with a bar model',
   [0, 1, 2, 3, 4].every(function (l) { return wp2.levels[l].structures === 'two-step-cmp,two-step-pw' && wp2.levels[l].bars === wp2.levels[l].n; }),
   wp2.levels[0].structures);
ok('two-step problems: numbers within 50 at level 0, growing to within 1000 at level 4',
   wp2.levels[0].biggest <= 50 && wp2.levels[1].biggest <= 100 && wp2.levels[2].biggest <= 300 &&
   wp2.levels[3].biggest <= 600 && wp2.levels[4].biggest <= 1000 && wp2.levels[4].biggest > 600,
   [0, 1, 2, 3, 4].map(function (l) { return 'L' + l + ' up to ' + wp2.levels[l].biggest; }).join('  '));
ok('two-step problems: the stopped-after-step-one answer is nearly always among the choices',
   [0, 1, 2, 3, 4].every(function (l) { return wp2.levels[l].midOffered >= wp2.levels[l].n * 0.97; }),
   [0, 1, 2, 3, 4].map(function (l) { return 'L' + l + ' ' + wp2.levels[l].midOffered + '/' + wp2.levels[l].n; }).join('  '));
ok('two-step problems: plenty of variety, and the Practice filter gives one structure',
   wp2.levels[2].texts > 300 && wp2.filter === 'two-step-cmp',
   wp2.levels[2].texts + ' different stories in 500, filter gave ' + wp2.filter);

// ---------------------------------------------------------------------
// 6. Fractions to twelfths
// ---------------------------------------------------------------------

const frac = inApp(function () {
  var T = window.__t, c = T.collector();
  // A fraction written as text, turned into [top, bottom]. "1" is one whole.
  function parse(s) {
    if (s === '1') return [1, 1];
    var m = /^(\d+)\/(\d+)$/.exec(String(s));
    return m ? [Number(m[1]), Number(m[2])] : null;
  }
  function same(a, b) { return a[0] * b[1] === b[0] * a[1]; }
  function less(a, b) { return a[0] * b[1] < b[0] * a[1]; }
  var per = {};
  for (var lvl = 0; lvl <= 4; lvl++) {
    var L = per[lvl] = { types: {}, maxDenom: 0, addDenoms: 0, addDue: 0, wholes: 0, bars: 0, compares: 0 };
    T.sweep('frac1', lvl, 700, null, function (q) {
      c.checked++;
      L.types[q.type] = true;
      var tag = 'L' + lvl + ' ' + q.type;
      var denoms = q.fractions ? q.fractions.map(function (f) { return f.d; }) : [q.denominator || q.denom];
      denoms.forEach(function (d) {
        if (!(d >= 2 && d <= 12)) c.note(tag + ': denominator ' + d);
        if (d > L.maxDenom) L.maxDenom = d;
      });
      if (q.type === 'fraction-shade') {
        if (q.answer !== q.numerator || !(q.numerator >= 1 && q.numerator < q.denominator)) c.note(tag + ': bad shading target');
        return;
      }
      var fault = T.choiceFault(q, (q.type === 'fraction-compare') ? 3 : 4);
      if (fault) c.note(tag + ': ' + fault);
      var ans = q.type === 'fraction-order' ? null : parse(q.answer);

      if (q.type === 'fraction-identify') {
        if (q.answer !== q.numerator + '/' + q.denominator || !(q.numerator >= 1 && q.numerator < q.denominator)) c.note(tag + ': key wrong');
      } else if (q.type === 'fraction-compare') {
        L.compares++; if (q.showBars) L.bars++;
        var fs = q.fractions.map(function (f) { return [f.n, f.d]; });
        var unit = fs.every(function (f) { return f[0] === 1; });
        var like = fs.every(function (f) { return f[1] === fs[0][1]; });
        if (!unit && !like) c.note(tag + ': neither unit fractions nor like fractions');
        if (fs.some(function (f) { return !(f[0] >= 1 && f[0] < f[1]); })) c.note(tag + ': not a proper fraction');
        for (var i = 0; i < fs.length; i++) for (var j = i + 1; j < fs.length; j++) {
          if (same(fs[i], fs[j])) c.note(tag + ': two fractions of equal size');
        }
        var best = fs[0];
        fs.forEach(function (f) { if (q.want === 'greatest' ? less(best, f) : less(f, best)) best = f; });
        if (!ans || !same(ans, best) || q.answer !== best[0] + '/' + best[1]) c.note(tag + ': ' + q.want + ' of ' + q.labels.join(', ') + ' keyed as ' + q.answer);
      } else if (q.type === 'fraction-order') {
        var list = q.answer.split(', ').map(parse);
        if (list.length !== 3 || list.some(function (f) { return !f; })) { c.note(tag + ': key is not three fractions'); return; }
        for (var k = 1; k < 3; k++) {
          var okStep = q.direction === 'smallest' ? less(list[k - 1], list[k]) : less(list[k], list[k - 1]);
          if (!okStep) c.note(tag + ': "' + q.answer + '" is not in order, ' + q.direction + ' first');
        }
        if (q.answer.split(', ').slice().sort().join() !== q.labels.slice().sort().join()) c.note(tag + ': key does not use the three fractions shown');
        q.options.forEach(function (o) {
          if (o.split(', ').slice().sort().join() !== q.labels.slice().sort().join()) c.note(tag + ': a choice uses other fractions');
        });
      } else if (q.type === 'fraction-like-op') {
        var want = q.op === '+' ? q.a + q.b : q.a - q.b;
        if (q.answerNum !== want) c.note(tag + ': ' + q.a + q.op + q.b + ' keyed as ' + q.answerNum);
        if (!(want >= 1 && want <= q.denom)) c.note(tag + ': ' + want + '/' + q.denom + ' is outside one whole');
        if (!(q.a >= 1 && q.a <= q.denom && q.b >= 1 && q.b <= q.denom)) c.note(tag + ': a part is outside one whole');
        if (!ans || !same(ans, [want, q.denom])) c.note(tag + ': answer text ' + q.answer + ' is not ' + want + '/' + q.denom);
        if (want === q.denom) { L.wholes++; if (q.answer !== '1') c.note(tag + ': a whole written as ' + q.answer); }
        if (q.aLabel !== (q.a === q.denom ? '1' : q.a + '/' + q.denom)) c.note(tag + ': first fraction mislabelled');
        if (q.op === '+') {
          L.addDue++;
          if (q.options.indexOf(want + '/' + (2 * q.denom)) >= 0) L.addDenoms++;
        }
      } else c.note(tag + ': unexpected type');

      // No wrong choice may be the right answer written another way.
      if (ans) {
        q.options.forEach(function (o) {
          var f = parse(o);
          if (!f) c.note(tag + ': choice "' + o + '" is not a fraction');
          else if (String(o) !== String(q.answer) && same(f, ans)) c.note(tag + ': choice ' + o + ' equals the answer ' + q.answer);
        });
      }
    });
    L.types = Object.keys(L.types).sort();
  }
  c.levels = per;
  return c;
});
ok('fractions: every key is right, and no wrong choice is the answer in another form', frac.bad.length === 0, summary(frac));
ok('fractions: denominators stop at 4, 4, 8, 10 and 12 as the levels rise',
   [0, 1, 2, 3, 4].map(function (l) { return frac.levels[l].maxDenom; }).join(',') === '4,4,8,10,12',
   [0, 1, 2, 3, 4].map(function (l) { return frac.levels[l].maxDenom; }).join(','));
ok('fractions: comparing from level 2, like-fraction sums from level 3, ordering and subtraction at level 4',
   frac.levels[1].types.indexOf('fraction-compare') === -1 && frac.levels[2].types.indexOf('fraction-compare') >= 0 &&
   frac.levels[2].types.indexOf('fraction-like-op') === -1 && frac.levels[3].types.indexOf('fraction-like-op') >= 0 &&
   frac.levels[3].types.indexOf('fraction-order') === -1 && frac.levels[4].types.indexOf('fraction-order') >= 0,
   [2, 3, 4].map(function (l) { return 'L' + l + ' ' + frac.levels[l].types.join('+'); }).join('  '));
ok('fractions: bars are drawn for comparing at level 2 and taken away after it',
   frac.levels[2].bars === frac.levels[2].compares && frac.levels[2].compares > 0 && frac.levels[4].bars === 0 && frac.levels[4].compares > 0,
   'L2 ' + frac.levels[2].bars + '/' + frac.levels[2].compares + '  L4 ' + frac.levels[4].bars + '/' + frac.levels[4].compares);
ok('fractions: sums can reach one whole, and the added-the-bottom-numbers answer is always offered',
   frac.levels[4].wholes > 0 && frac.levels[4].addDue > 0 && frac.levels[4].addDenoms === frac.levels[4].addDue &&
   frac.levels[3].addDenoms === frac.levels[3].addDue,
   'L4 ' + frac.levels[4].wholes + ' sums make a whole, trap offered ' + frac.levels[4].addDenoms + '/' + frac.levels[4].addDue);

// ---------------------------------------------------------------------
// 7. Money in dollars and cents (keys are checked in difficulty.test.js)
// ---------------------------------------------------------------------

const money = inApp(function () {
  var T = window.__t, c = T.collector();
  var per = {};
  for (var lvl = 2; lvl <= 4; lvl++) {
    var L = per[lvl] = { carry: 0, adds: 0, borrow: 0, diffs: 0, lowZero: 0, step5: 0, trap: 0, trapDue: 0 };
    T.sweep('money', lvl, 700, null, function (q) {
      c.checked++;
      var tag = 'L' + lvl + ' ' + q.type;
      var fault = T.choiceFault(q, 4);
      if (fault) c.note(tag + ': ' + fault);
      var dollarForm = /^\$\d+\.\d\d$/;
      if (q.type === 'money-convert' && q.direction === 'to-cents') {
        if (q.options.some(function (o) { return !/^\d+ cents$/.test(o); })) c.note(tag + ': a choice is not written in cents');
      } else if (q.options.some(function (o) { return !dollarForm.test(o); })) {
        c.note(tag + ': a choice is not written as dollars and cents: ' + q.options.join(' '));
      }
      // Every amount in the sentence is written $d.cc, never "240 cents"
      // or "$2.4", except the cents being converted.
      var amounts = q.text.match(/\$[\d.]+/g) || [];
      amounts.forEach(function (a) {
        if (!dollarForm.test(a.replace(/\.$/, '')) && !/^\$(1|2|5|10)$/.test(a)) c.note(tag + ': amount written as ' + a);
      });
      if (/!/.test(q.text)) c.note(tag + ': exclamation mark in the question');
      if (q.type === 'money-add') {
        L.adds++;
        if ((q.item1.price % 100) + (q.item2.price % 100) >= 100) L.carry++;
        if (q.text.indexOf(moneyStr(q.item1.price)) === -1 || q.text.indexOf(moneyStr(q.item2.price)) === -1) c.note(tag + ': prices missing from the sentence');
        if (q.item1.name === q.item2.name) c.note(tag + ': the same thing bought twice');
      } else if (q.type === 'money-diff') {
        L.diffs++;
        if ((q.item1.price % 100) < (q.item2.price % 100)) L.borrow++;
      } else if (q.type === 'money-change') {
        if (q.text.indexOf(moneyStr(q.item.price)) === -1) c.note(tag + ': price missing from the sentence');
        var note = { 100: '$1 coin', 200: '$2 note', 500: '$5 note', 1000: '$10 note' }[q.paid];
        if (!note || q.text.indexOf(note) === -1) c.note(tag + ': paid ' + q.paid + ' but the sentence does not say so');
        // $5.00 - $2.40 worked without regrouping gives $3.40.
        if (q.item.price % 100 !== 0) {
          L.trapDue++;
          var slip = (Math.floor(q.paid / 100) - Math.floor(q.item.price / 100)) * 100 + (q.item.price % 100);
          if (q.options.indexOf(moneyStr(slip)) >= 0) L.trap++;
        }
      } else if (q.type === 'money-convert') {
        if (q.cents % 100 < 10) L.lowZero++;
      } else c.note(tag + ': unexpected type');
      var prices = q.type === 'money-convert' ? [] : (q.item ? [q.item.price] : [q.item1.price, q.item2.price]);
      prices.forEach(function (p) {
        if (p % 5 !== 0) c.note(tag + ': price ' + p + ' cannot be paid in Singapore coins');
        if (p % 10 !== 0) L.step5++;
      });
    });
  }
  c.levels = per;
  // "Dollars and cents" on the Practice screen overrides a low level.
  var forced = 0, n = 0;
  T.sweep('money', 0, 200, { flag: 'dollars' }, function (q) { n++; if (q.inDollars || q.type === 'money-convert') forced++; });
  c.forced = forced + '/' + n;
  // Every saved Practice choice, old and new, still produces a question.
  var keys = [];
  ['coins', 'add', 'change', 'dollars'].forEach(function (k) {
    state.drillConfigs = {}; setDrillConfig('money', { rangeKey: k, mode: 'practice' });
    var q = generateMathQuestion('money', resolveDrillConfig('money'));
    if (q && q.type && q.answer !== undefined) keys.push(k);
  });
  state.drillConfigs = {};
  c.keys = keys.join(',');
  return c;
});
ok('money: dollar questions are written as dollars and cents with four sound choices', money.bad.length === 0, summary(money));
ok('money: ten-cent prices and no regrouping at level 2; always regrouping at level 4',
   money.levels[2].carry === 0 && money.levels[2].adds > 0 && money.levels[2].step5 === 0 &&
   money.levels[4].carry === money.levels[4].adds && money.levels[4].borrow === money.levels[4].diffs &&
   money.levels[4].diffs > 0 && money.levels[4].step5 > 0,
   'L2 ' + money.levels[2].carry + '/' + money.levels[2].adds + ' sums regroup, L4 ' + money.levels[4].carry + '/' + money.levels[4].adds);
ok('money: the did-not-regroup answer is always offered when change is worked out',
   [2, 3, 4].every(function (l) { return money.levels[l].trapDue > 0 && money.levels[l].trap === money.levels[l].trapDue; }),
   [2, 3, 4].map(function (l) { return 'L' + l + ' ' + money.levels[l].trap + '/' + money.levels[l].trapDue; }).join('  '));
ok('money: converting includes amounts such as $3.05, where the zero is easy to lose',
   money.levels[2].lowZero > 0 && money.levels[3].lowZero > 0,
   'L2 ' + money.levels[2].lowZero + '  L3 ' + money.levels[3].lowZero);
ok('money: the Practice screen can ask for dollars at any level, and every saved choice still works',
   money.forced === '200/200' && money.keys === 'coins,add,change,dollars', money.forced + '  ' + money.keys);

// ---------------------------------------------------------------------
// 8. Time: five minutes, am and pm, how long
// ---------------------------------------------------------------------

const time = inApp(function () {
  var T = window.__t, c = T.collector();
  var per = {};
  function label(halves) {
    var whole = Math.floor(halves / 2);
    if (halves === 1) return 'half an hour';
    if (halves % 2) return whole + ' and a half hours';
    return whole + (whole === 1 ? ' hour' : ' hours');
  }
  function str(mins, period) { return Math.floor(mins / 60) + ':' + (mins % 60 < 10 ? '0' : '') + (mins % 60) + (period ? ' ' + period : ''); }
  for (var lvl = 0; lvl <= 4; lvl++) {
    var L = per[lvl] = { types: {}, minutes: {}, periods: {}, variants: {}, longest: 0 };
    T.sweep('time1', lvl, 700, null, function (q) {
      c.checked++;
      L.types[q.type] = true;
      var tag = 'L' + lvl + ' ' + q.type;
      if (q.hint && q.hint.indexOf(String(q.answer)) !== -1) c.note(tag + ': the hint gives away ' + q.answer);
      if (q.type === 'time-read' || q.type === 'time-match') {
        L.minutes[q.minutes] = true;
        if (q.answer !== str(q.hour * 60 + q.minutes)) c.note(tag + ': key ' + q.answer + ' for ' + q.hour + 'h ' + q.minutes + 'm');
        if (!(q.hour >= 1 && q.hour <= 12)) c.note(tag + ': hour ' + q.hour);
        if (q.type === 'time-read' && q.options) {
          var fault = T.choiceFault(q, 4);
          if (fault) c.note(tag + ': ' + fault);
          // Wrong choices must look like the right one: real times on a
          // five-minute clock face.
          q.options.forEach(function (o) {
            var m = /^(\d{1,2}):(\d\d)$/.exec(o);
            if (!m || +m[1] < 1 || +m[1] > 12 || +m[2] > 59) c.note(tag + ': choice ' + o + ' is not a time');
          });
        }
        if (q.type === 'time-read' && lvl >= 2 && !q.options) c.note(tag + ': five-minute reading without its own choices');
        if (q.type === 'time-match') {
          var hits = q.faces.filter(function (f) { return f.hour === q.hour && f.minutes === q.minutes; }).length;
          var keys = q.faces.map(function (f) { return f.hour + ':' + f.minutes; });
          if (q.faces.length !== 4 || hits !== 1) c.note(tag + ': ' + q.faces.length + ' faces, ' + hits + ' correct');
          if (keys.some(function (k, i) { return keys.indexOf(k) !== i; })) c.note(tag + ': the same clock twice');
          if (q.words !== timeInWords(q.hour, q.minutes)) c.note(tag + ': words do not match the time');
        }
      } else if (q.type === 'time-ampm') {
        L.periods[q.period] = true;
        var fa = T.choiceFault(q, 4);
        if (fa) c.note(tag + ': ' + fa);
        if (q.answer !== str(q.hour * 60 + q.minutes, q.period)) c.note(tag + ': key ' + q.answer);
        if (!(q.hour >= 1 && q.hour <= 11)) c.note(tag + ': twelve o\'clock is ambiguous here');
        // The sentence has to settle am or pm on its own.
        var morning = /morning|breakfast/.test(q.text), later = /afternoon|evening|night|lunch|dinner/.test(q.text);
        if (morning === later) c.note(tag + ': the sentence does not decide am or pm: ' + q.text);
        else if ((q.period === 'am') !== morning) c.note(tag + ': ' + q.period + ' for "' + q.text + '"');
        if (q.options.some(function (o) { return !/^\d{1,2}:\d\d (am|pm)$/.test(o); })) c.note(tag + ': a choice is not a time with am or pm');
      } else if (q.type === 'time-duration') {
        L.variants[q.variant] = true;
        var fd = T.choiceFault(q, 4);
        if (fd) c.note(tag + ': ' + fd);
        var start = q.startHour * 60 + q.startMinutes, end = q.endHour * 60 + q.endMinutes;
        if (end - start !== q.halves * 30) c.note(tag + ': ' + str(start) + ' to ' + str(end) + ' is not ' + q.halves + ' half hours');
        if (q.halves < 1 || q.halves > 6) c.note(tag + ': lasts ' + q.halves + ' half hours');
        if (q.halves > L.longest) L.longest = q.halves;
        if (q.startHour < 1 || q.endHour > 11) c.note(tag + ': crosses twelve o\'clock');
        if (q.startMinutes % 30 || q.endMinutes % 30) c.note(tag + ': not on the hour or half hour');
        if (q.text.indexOf(str(start, q.period)) === -1) c.note(tag + ': start time missing from the sentence');
        if (q.variant === 'how-long') {
          if (q.answer !== label(q.halves)) c.note(tag + ': ' + q.halves + ' half hours keyed as "' + q.answer + '"');
          if (q.text.indexOf(str(end, q.period)) === -1) c.note(tag + ': end time missing from the sentence');
        } else if (q.variant === 'end') {
          if (q.answer !== str(end, q.period)) c.note(tag + ': end keyed as ' + q.answer);
          if (q.text.indexOf(label(q.halves)) === -1) c.note(tag + ': the length is missing from the sentence');
          if (q.text.indexOf(q.answer) !== -1) c.note(tag + ': the sentence contains the answer');
        } else c.note(tag + ': unknown variant');
      } else c.note(tag + ': unexpected type');
      // One way of writing a time throughout: a colon, as the rest of
      // the maths world does.
      var shown = [String(q.answer)].concat(q.options || []).concat(q.text ? [q.text] : []).join(' ');
      if (/\d\.\d\d ?(am|pm)/.test(shown)) c.note(tag + ': a time written with a dot');
      if (/!/.test(q.text || '')) c.note(tag + ': exclamation mark in the question');
    });
    L.types = Object.keys(L.types).sort().join(',');
    L.minutes = Object.keys(L.minutes).map(Number).sort(function (a, b) { return a - b; });
    L.periods = Object.keys(L.periods).sort().join(',');
    L.variants = Object.keys(L.variants).sort().join(',');
  }
  c.levels = per;
  var flags = {};
  ['ampm', 'duration', 'fivemin'].forEach(function (f) {
    var types = {};
    T.sweep('time1', 0, 80, { flag: f }, function (q) { types[q.type] = true; });
    flags[f] = Object.keys(types).sort().join(',');
  });
  c.flags = flags;
  return c;
});
ok('time: every key is right, no hint gives the answer away, choices are sound', time.bad.length === 0, summary(time));
ok('time: hour and half hour at level 0, quarters at level 1, five minutes from level 2',
   time.levels[0].minutes.join(',') === '0,30' && time.levels[1].minutes.join(',') === '0,15,30,45' &&
   [2, 3, 4].every(function (l) { return time.levels[l].minutes.length === 12; }),
   [0, 1, 2].map(function (l) { return 'L' + l + ' [' + time.levels[l].minutes.join(',') + ']'; }).join(' '));
ok('time: am and pm from level 3, how long from level 4, neither before',
   [0, 1, 2].every(function (l) { return time.levels[l].types === 'time-match,time-read'; }) &&
   time.levels[3].types === 'time-ampm,time-match,time-read' &&
   time.levels[4].types === 'time-ampm,time-duration,time-match,time-read',
   [2, 3, 4].map(function (l) { return 'L' + l + ' ' + time.levels[l].types; }).join('  '));
ok('time: both am and pm come up, and durations ask both how long and when it ends, up to three hours',
   time.levels[3].periods === 'am,pm' && time.levels[4].variants === 'end,how-long' && time.levels[4].longest === 6,
   time.levels[3].periods + '  ' + time.levels[4].variants + '  longest ' + time.levels[4].longest + ' half hours');
ok('time: the Practice filters for am and pm, how long, and five minutes each work',
   time.flags.ampm === 'time-ampm' && time.flags.duration === 'time-duration' && time.flags.fivemin === 'time-match,time-read',
   JSON.stringify(time.flags));

// ---------------------------------------------------------------------
// 9. Everything that comes out can be drawn, and exactly one button is right
// ---------------------------------------------------------------------

const drawn = inApp(function () {
  var skills = ['money', 'time1', 'frac1', 'pgraph', 'num1000', 'addsub1000', 'mass', 'volume', 'wp2'];
  var bad = {}, types = {}, checked = 0;
  function note(m) { bad[m] = (bad[m] || 0) + 1; }
  skills.forEach(function (skill) {
    for (var lvl = 0; lvl <= 4; lvl++) {
      state.skills = {}; getSkillState(skill).level = lvl;
      for (var i = 0; i < 150; i++) {
        var q = generateMathQuestion(skill, null);
        var tag = skill + ':' + q.type;
        types[tag] = true;
        var card = { innerHTML: '' }, handled;
        try { handled = renderMathQuestion(card, q); } catch (e) { note(tag + ' renderer threw ' + String(e.message).slice(0, 50)); continue; }
        checked++;
        if (handled !== true) { note(tag + ' has no renderer'); continue; }
        var h = String(card.innerHTML);
        if (!h) { note(tag + ' draws an empty card'); continue; }
        var leak = h.match(/undefined|NaN|\[object Object\]|null/);
        if (leak) note(tag + ' shows "' + leak[0] + '"');
        if (q.answer === undefined || q.answer === null || q.answer === '') note(tag + ' has no answer');
        if (!q.hint) note(tag + ' has no hint');

        // Buttons. Each call is checkAnswer(given, correct, this): both
        // must be a quoted string or a plain number, and exactly one
        // button may have given equal to correct.
        var calls = h.match(/checkAnswer\(([^)]*)\)/g) || [];
        if (!calls.length) {
          if (!/submitTextAnswer|checkFractionShade/.test(h)) note(tag + ' cannot be answered');
          continue;
        }
        var right = 0, labels = {};
        calls.forEach(function (call) {
          var m = /^checkAnswer\((?:'([^']*)'|(-?\d+(?:\.\d+)?)), (?:'([^']*)'|(-?\d+(?:\.\d+)?)), this$/.exec(call.slice(0, -1));
          if (!m) { note(tag + ' emits a malformed button: ' + call.slice(0, 60)); return; }
          var given = m[1] !== undefined ? m[1] : m[2], correct = m[3] !== undefined ? m[3] : m[4];
          if (given === correct) right++;
          if (labels[given]) note(tag + ' prints the same choice twice');
          labels[given] = true;
        });
        if (right !== 1) note(tag + ' has ' + right + ' correct buttons');
        if (Array.isArray(q.options) && q.type !== 'time-match' && calls.length !== q.options.length) {
          note(tag + ' draws ' + calls.length + ' buttons for ' + q.options.length + ' choices');
        }
      }
    }
  });
  state.skills = {};
  return { bad: Object.keys(bad).map(function (k) { return k + ' (x' + bad[k] + ')'; }), checked: checked, types: Object.keys(types).sort() };
});
ok('render: every P2 question type is drawn, with nothing undefined on the card and exactly one right button',
   drawn.bad.length === 0, drawn.bad.length ? drawn.bad.slice(0, 5).join(' | ') : drawn.checked + ' cards across ' + drawn.types.length + ' skill and type pairs');
const expectTypes = [
  'addsub1000:addsub-1000', 'frac1:fraction-compare', 'frac1:fraction-identify', 'frac1:fraction-like-op',
  'frac1:fraction-order', 'frac1:fraction-shade', 'mass:measure-calc', 'mass:measure-compare', 'mass:measure-scale',
  'money:money-add', 'money:money-change', 'money:money-convert', 'money:money-diff',
  'num1000:compare-1000', 'num1000:order-1000', 'num1000:pattern-1000', 'num1000:pv-1000',
  'pgraph:picture-graph', 'time1:time-ampm', 'time1:time-duration', 'time1:time-match', 'time1:time-read',
  'volume:measure-calc', 'volume:measure-compare', 'volume:measure-scale', 'wp2:word-problem'
];
ok('render: the sweep really did reach every new question type',
   JSON.stringify(drawn.types) === JSON.stringify(expectTypes),
   'missing: ' + expectTypes.filter(t => drawn.types.indexOf(t) === -1).join(', ') +
   '  extra: ' + drawn.types.filter(t => expectTypes.indexOf(t) === -1).join(', '));

// The scale drawings carry the question, so check what they draw.
const scales = inApp(function () {
  var bad = [], n = 0;
  function note(m) { if (bad.length < 5) bad.push(m); }
  ['mass', 'volume'].forEach(function (skill) {
    for (var lvl = 0; lvl <= 4; lvl++) {
      state.skills = {}; getSkillState(skill).level = lvl;
      for (var i = 0; i < 80; i++) {
        var q = generateMathQuestion(skill, { flag: 'scale' });
        var card = { innerHTML: '' };
        renderMathQuestion(card, q);
        n++;
        var svg = (card.innerHTML.match(/<svg[\s\S]*?<\/svg>/) || [''])[0];
        if (!svg) { note(skill + ' L' + lvl + ': no scale drawn'); continue; }
        var marks = (svg.match(/<line /g) || []).length;
        // The dial has one line per mark plus the needle; the tank has one per mark.
        var want = q.max / q.tickStep + (skill === 'mass' ? 1 : 0);
        if (marks !== want) note(skill + ' L' + lvl + ': ' + marks + ' marks drawn, expected ' + want);
        var numbers = (svg.match(/>(\d+)(?: [^<]*)?<\/text>/g) || []).length;
        if (numbers !== q.max / q.labelStep) note(skill + ' L' + lvl + ': ' + numbers + ' numbers on the scale, expected ' + (q.max / q.labelStep));
        // The reading must not be printed anywhere except on its button.
        var body = card.innerHTML.split('answer-options')[0];
        if (q.value % q.labelStep !== 0 && new RegExp('>' + q.value + '( |<)').test(body)) note(skill + ' L' + lvl + ': the reading ' + q.value + ' is printed on the picture');
        if (card.innerHTML.indexOf("checkAnswer('" + q.value + ' ' + q.unit + "', '" + q.value + ' ' + q.unit + "'") === -1) note(skill + ' L' + lvl + ': the right button does not carry the unit');
      }
    }
  });
  state.skills = {};
  return { bad: bad, n: n };
});
ok('render: scales draw every mark, number only the labelled ones, and never print the reading',
   scales.bad.length === 0, scales.bad.length ? scales.bad.join(' | ') : scales.n + ' scales drawn');

// ---------------------------------------------------------------------
// 10. The new skills are wired in everywhere a skill has to be
// ---------------------------------------------------------------------

const wiring = inApp(function () {
  var ids = ['num1000', 'addsub1000', 'mass', 'volume', 'wp2'];
  var bad = [];
  ids.forEach(function (id) {
    var t = MATH_TREE[id];
    if (!t) { bad.push(id + ': not in the tree'); return; }
    if (t.id !== id || !t.name || !t.icon || !t.desc) bad.push(id + ': tree entry incomplete');
    if (t.grade !== 'P2 Expansion') bad.push(id + ': grade is ' + t.grade);
    (t.deps || []).forEach(function (d) { if (!MATH_TREE[d]) bad.push(id + ': depends on unknown skill ' + d); });
    // A dependency chain must come to an end.
    var seen = {}, queue = (t.deps || []).slice(), guard = 0;
    while (queue.length && guard++ < 200) {
      var d = queue.shift();
      if (d === id) { bad.push(id + ': depends on itself'); break; }
      if (seen[d]) continue;
      seen[d] = true;
      queue = queue.concat((MATH_TREE[d] && MATH_TREE[d].deps) || []);
    }
    var lesson = getMathLesson(id);
    if (!lesson || !lesson.steps || lesson.steps.length < 3) bad.push(id + ': no lesson');
    else {
      var tries = lesson.steps.filter(function (s) { return s.type === 'try'; });
      if (tries.length !== 1) bad.push(id + ': lesson has ' + tries.length + ' try-it steps');
      tries.forEach(function (s) {
        if (s.options.filter(function (o) { return o === s.answer; }).length !== 1) bad.push(id + ': lesson answer is not one of its choices');
      });
      if (/!/.test(JSON.stringify(lesson))) bad.push(id + ': lesson has an exclamation mark');
    }
    if (!skillHasDrill(id)) bad.push(id + ': no Practice options');
    else {
      var listed = PRACTICE_GROUPS.some(function (g) { return g.skills.indexOf(id) >= 0; });
      if (!listed) bad.push(id + ': not listed on the Practice screen');
      state.drillConfigs = {};
      var cfg = resolveDrillConfig(id);
      var q = generateMathQuestion(id, cfg);
      if (!q || !q.type || q.answer === undefined) bad.push(id + ': the default Practice setting gives no question');
    }
    // A brand-new skill starts from an ordinary empty record.
    state.skills = {};
    var s = getSkillState(id);
    if (!s || s.level !== 0) bad.push(id + ': fresh state is not level 0');
    try { updateSkillState(id, true, 3); } catch (e) { bad.push(id + ': recording an answer threw ' + e.message); }
  });
  state.skills = {}; state.drillConfigs = {};
  // Skills that existed before must still be there, unchanged in place.
  var before = ['count', 'nbond', 'add', 'sub', 'cmp', 'pat', 'wp1', 'shp', 'time1', 'add100', 'sub100', 'mul', 'div',
    'frac1', 'money', 'pgraph', 'lenmass', 'add10k', 'sub10k', 'advmul', 'divrem', 'fracadd', 'area', 'angle', 'bargraph',
    'bignum', 'multiop', 'factor', 'mixfrac', 'decimal', 'symm', 'dataan', 'multiwp'];
  before.forEach(function (id) { if (!MATH_TREE[id]) bad.push(id + ': an existing skill has gone missing'); });
  return { bad: bad, total: Object.keys(MATH_TREE).length };
});
ok('wiring: each new skill has a tree entry, a lesson, Practice options and a clean starting state',
   wiring.bad.length === 0, wiring.bad.length ? wiring.bad.slice(0, 5).join(' | ') : wiring.total + ' maths skills in the tree');

// ---- report ----
console.log('\n================ P2 SYLLABUS TEST ================\n');
let pass = 0, fail = 0;
R.forEach(r => {
  console.log((r.pass ? '  PASS  ' : '> FAIL <') + ' ' + r.name + (r.extra ? '   [' + r.extra + ']' : ''));
  r.pass ? pass++ : fail++;
});
console.log('\n  ' + pass + ' passed, ' + fail + ' failed, ' + R.length + ' total\n');
process.exit(fail ? 1 : 0);
