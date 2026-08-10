// Difficulty-ladder and answer-key tests for the math generators.
//
// Every assertion here corresponds to a defect that was live in the app,
// measured before it was fixed:
//
//   * 20 of 33 generators ignored `diff` entirely, so the adaptive engine
//     was a silent no-op for them. A child at level 0 got exactly the same
//     questions as one at level 4.
//   * genDataAn rounded the mean: 80% of "average" questions had an answer
//     key that was not the answer.
//   * genPGraph tied its top bar in 35% of draws (genBarGraph in 13.5%),
//     so "which has the most?" marked a correct answer wrong.
//   * renderFractionOp shuffled the correct answer out of the four choices
//     in 5.2% of questions, making them unanswerable.
//
// The point of a difficulty test is that it must be able to fail. Each one
// below reports "GENERATOR NOT EXPOSED" rather than silently passing if it
// cannot reach the function it is meant to exercise.

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
const run = expr => vm.runInContext(expr, sandbox);

run('state = state || {}; state.skills = {}; state.tokens = 0; state.drillConfigs = {};');

// ---------------------------------------------------------------------
// 1. Every generator must actually respond to the difficulty level.
// ---------------------------------------------------------------------
//
// "Responds" is measured as: the set of questions produced at level 0 is
// materially different from the set produced at level 4. We fingerprint
// each question by the numbers in it and the question type, then compare
// the two distributions. A generator that ignores `diff` produces
// statistically identical output and is caught here.

const SKILLS = [
  'shp', 'frac1', 'pgraph', 'lenmass',
  'add10k', 'sub10k', 'divrem', 'fracadd', 'area', 'angle', 'bargraph',
  'bignum', 'multiop', 'factor', 'mixfrac', 'decimal', 'symm', 'dataan', 'multiwp'
];

// 1a. Static check: the generator must actually consult `diff`.
//
// This is the exact shape of the original defect and it cannot be flaky.
// A distribution comparison cannot replace it: several of these question
// types carry all their content in nested objects and strings, so a
// naive fingerprint sees two identical questions where the ladder really
// did change which shape, which denominator, or which angle was shown.

const GEN_FOR = {
  shp: 'genShp', frac1: 'genFrac1', pgraph: 'genPGraph', lenmass: 'genLenMass',
  add10k: 'genAdd10k', sub10k: 'genSub10k', divrem: 'genDivRem', fracadd: 'genFracAdd',
  area: 'genArea', angle: 'genAngle', bargraph: 'genBarGraph', bignum: 'genBigNum',
  multiop: 'genMultiOp', factor: 'genFactor', mixfrac: 'genMixFrac', decimal: 'genDecimal',
  symm: 'genSymm', dataan: 'genDataAn', multiwp: 'genMultiWP',
  count: 'genCount', nbond: 'genNBond', add: 'genAdd', sub: 'genSub', cmp: 'genCmp',
  pat: 'genPat', wp1: 'genWP1', add100: 'genAdd100', sub100: 'genSub100',
  mul: 'genMul', div: 'genDiv', money: 'genMoney', time1: 'genTime1', advmul: 'genAdvMul'
};

const statik = run(`
  (function () {
    var names = ${JSON.stringify(Object.values(GEN_FOR))};
    var missing = [], notFound = [];
    names.forEach(function (n) {
      var f;
      try { f = eval(n); } catch (e) { notFound.push(n); return; }
      if (typeof f !== 'function') { notFound.push(n); return; }
      // Body only: the parameter list always mentions diff.
      var src = String(f);
      var body = src.slice(src.indexOf(')') + 1);
      if (!/\\bdiff\\b/.test(body)) missing.push(n);
    });
    return { missing: missing, notFound: notFound, total: names.length };
  })()
`);
ok('every one of the 33 generators reads the difficulty level',
   statik.notFound.length === 0 && statik.missing.length === 0,
   statik.notFound.length ? ('NOT EXPOSED: ' + statik.notFound.join(', '))
     : (statik.missing.length ? ('IGNORES diff: ' + statik.missing.join(', '))
        : statik.total + ' generators checked'));

// 1b. Behavioural check: harder means bigger, where the ladder is numeric.
// The scan recurses into arrays and nested objects, because angles,
// graph values and item lengths all live one level down.

const respond = run(`
  (function () {
    var SKILLS = ${JSON.stringify(SKILLS)};
    var out = {};
    function scan(v, acc, depth) {
      if (v === null || v === undefined || depth > 3) return;
      if (typeof v === 'number') { if (v > acc.max) acc.max = v; if (v < acc.min) acc.min = v; return; }
      if (typeof v === 'object') Object.keys(v).forEach(function (k) { scan(v[k], acc, depth + 1); });
    }
    function sample(skill, level, n) {
      state.skills = {};
      getSkillState(skill).level = level;
      var acc = { max: -Infinity, min: Infinity };
      for (var i = 0; i < n; i++) {
        var q = generateMathQuestion(skill, null);
        Object.keys(q).forEach(function (k) { if (k !== 'hint' && k !== 'text') scan(q[k], acc, 0); });
      }
      return acc;
    }
    SKILLS.forEach(function (s) {
      out[s] = { lo: sample(s, 0, 400), hi: sample(s, 4, 400) };
    });
    return out;
  })()
`);

// dataan is deliberately absent: its level-0 questions ask for a TOTAL of
// four values up to ten, which reaches 40, while its level-4 questions ask
// for a mean or range of six values up to 40, whose largest single number
// is also 40. The two tie on "biggest number in the question" perhaps one
// run in thirty, which made this assertion flaky. Its ladder is real and
// is checked directly below on the thing that actually grows: the data.
const NUMERIC = ['add10k', 'sub10k', 'divrem', 'area', 'bignum', 'multiop', 'mixfrac', 'multiwp', 'pgraph', 'bargraph', 'lenmass', 'fracadd', 'factor'];
const notBigger = NUMERIC.filter(s => !(respond[s].hi.max > respond[s].lo.max));
ok('numeric skills reach larger numbers at level 4 than at level 0',
   notBigger.length === 0,
   notBigger.length ? notBigger.map(s => s + ' lo=' + respond[s].lo.max + ' hi=' + respond[s].hi.max).join('; ')
     : NUMERIC.length + ' skills');

// 1c. Behavioural check for the ladders that change WHICH question is
// asked rather than how big the numbers are. Each of these is the
// specific promise its ladder makes, so each can genuinely fail.

const shape = run(`
  (function () {
    function survey(skill, level, n, collect) {
      state.skills = {}; getSkillState(skill).level = level;
      var seen = {};
      for (var i = 0; i < n; i++) collect(generateMathQuestion(skill, null), seen);
      return seen;
    }
    var byName  = function (q, s) { s[q.shape ? q.shape.name : q.type] = true; };
    var byType  = function (q, s) { s[q.type] = true; };
    var byDenom = function (q, s) { s[q.denominator || q.denom] = true; };
    var byCats  = function (q, s) { s[q.categories.length] = true; };

    // Angles: how close to a right angle the tricky ones get.
    function angleEdge(level, n) {
      state.skills = {}; getSkillState('angle').level = level;
      var closest = 90;
      for (var i = 0; i < n; i++) {
        var q = generateMathQuestion('angle', null);
        if (q.angle.type !== 'right') closest = Math.min(closest, Math.abs(90 - q.angle.degrees));
      }
      return closest;
    }
    // Decimals: does adding the tenths carry a whole?
    function crossRate(level, n) {
      state.skills = {}; getSkillState('decimal').level = level;
      var add = 0, crossed = 0;
      for (var i = 0; i < n; i++) {
        var q = generateMathQuestion('decimal', null);
        if (q.type !== 'decimal-add') continue;
        add++;
        var ta = Math.round(parseFloat(q.a) * 10) % 10, tb = Math.round(parseFloat(q.b) * 10) % 10;
        if (ta + tb >= 10) crossed++;
      }
      return add ? crossed / add : -1;
    }
    // Two-step problems: is the sharing template (a hidden division) in play?
    function shareRate(level, n) {
      state.skills = {}; getSkillState('multiwp').level = level;
      var hit = 0;
      for (var i = 0; i < n; i++) {
        if (/share equally/.test(generateMathQuestion('multiwp', null).text)) hit++;
      }
      return hit / n;
    }
    return {
      shpLo: Object.keys(survey('shp', 0, 400, byName)),
      shpHi: Object.keys(survey('shp', 4, 400, byName)),
      shpTypeLo: Object.keys(survey('shp', 0, 400, byType)),
      shpTypeHi: Object.keys(survey('shp', 4, 400, byType)),
      fracLo: Object.keys(survey('frac1', 0, 400, byDenom)).sort(),
      fracHi: Object.keys(survey('frac1', 4, 400, byDenom)).sort(),
      lenLo: Object.keys(survey('lenmass', 0, 400, byType)),
      lenHi: Object.keys(survey('lenmass', 4, 400, byType)),
      symmLo: Object.keys(survey('symm', 0, 400, byName)),
      symmHi: Object.keys(survey('symm', 4, 400, byName)),
      catsLo: Object.keys(survey('pgraph', 0, 200, byCats)),
      catsHi: Object.keys(survey('pgraph', 4, 200, byCats)),
      angleLo: angleEdge(0, 500), angleHi: angleEdge(4, 500),
      crossLo: crossRate(0, 500), crossHi: crossRate(4, 500),
      shareLo: shareRate(0, 300), shareHi: shareRate(4, 300)
    };
  })()
`);

ok('shapes: fewer shapes and no side-counting for a beginner, both at level 4',
   shape.shpLo.length === 3 && shape.shpHi.length === 6 &&
   shape.shpTypeLo.length === 1 && shape.shpTypeHi.length === 2,
   'L0 ' + shape.shpLo.length + ' shapes/' + shape.shpTypeLo.join('+') +
   '  L4 ' + shape.shpHi.length + ' shapes/' + shape.shpTypeHi.join('+'));

ok('fractions: halves and quarters only at level 0, six denominators at level 4',
   shape.fracLo.join(',') === '2,4' && shape.fracHi.length === 6,
   'L0 [' + shape.fracLo.join(',') + ']  L4 [' + shape.fracHi.join(',') + ']');

ok('length: comparing only at level 0, differences too at level 4',
   shape.lenLo.length === 1 && shape.lenLo[0] === 'length-compare' && shape.lenHi.length === 2,
   'L0 ' + shape.lenLo.join('+') + '  L4 ' + shape.lenHi.join('+'));

ok('symmetry: the shapes with no axis at all are held back to level 4',
   shape.symmLo.indexOf('parallelogram') === -1 && shape.symmHi.indexOf('parallelogram') >= 0 &&
   shape.symmHi.length > shape.symmLo.length,
   'L0 ' + shape.symmLo.length + ' shapes  L4 ' + shape.symmHi.length + ' shapes');

ok('graphs: three bars to read at level 0, five at level 4',
   shape.catsLo.join(',') === '3' && shape.catsHi.join(',') === '5',
   'L0 ' + shape.catsLo.join('/') + '  L4 ' + shape.catsHi.join('/'));

ok('angles: kept clear of 90 degrees early, within a few degrees at level 4',
   shape.angleLo >= 10 && shape.angleHi <= 5,
   'closest non-right angle: L0 ' + shape.angleLo + ' deg from square, L4 ' + shape.angleHi);

ok('decimals: tenths never carry a whole at level 0, always at level 4',
   shape.crossLo === 0 && shape.crossHi === 1,
   'carry rate L0 ' + shape.crossLo + '  L4 ' + shape.crossHi);

ok('two-step problems: the hidden-division template only appears from level 2',
   shape.shareLo === 0 && shape.shareHi > 0.15,
   'L0 ' + shape.shareLo + '  L4 ' + Math.round(shape.shareHi * 100) / 100);

const dataan = run(`
  (function () {
    function survey(level, n) {
      state.skills = {}; getSkillState('dataan').level = level;
      var lo = Infinity, hi = -Infinity, sizes = {}, types = {};
      for (var i = 0; i < n; i++) {
        var q = generateMathQuestion('dataan', null);
        sizes[q.data.length] = true;
        types[q.qType] = true;
        q.data.forEach(function (v) { if (v < lo) lo = v; if (v > hi) hi = v; });
      }
      return { lo: lo, hi: hi, sizes: Object.keys(sizes).join('/'), types: Object.keys(types).sort().join('+') };
    }
    return { lo: survey(0, 600), hi: survey(4, 600) };
  })()
`);
ok('data handling: four small numbers and only totals at level 0, six larger ones and means at level 4',
   dataan.lo.sizes === '4' && dataan.hi.sizes === '6' &&
   dataan.lo.hi <= 10 && dataan.hi.lo >= 10 && dataan.hi.hi > dataan.lo.hi &&
   dataan.lo.types === 'total' && dataan.hi.types.indexOf('average') >= 0,
   'L0 ' + dataan.lo.sizes + ' values in ' + dataan.lo.lo + '-' + dataan.lo.hi + ' (' + dataan.lo.types + ')' +
   '   L4 ' + dataan.hi.sizes + ' values in ' + dataan.hi.lo + '-' + dataan.hi.hi + ' (' + dataan.hi.types + ')');

// Money is a ladder of price shape rather than price size, and the
// renderer prints cents, so totals must stay in a range a P2 child would
// actually write.
const money = run(`
  (function () {
    function survey(level, n) {
      state.skills = {}; getSkillState('money').level = level;
      var round10 = 0, seen = 0, maxAmount = 0, change = 0, bad = '';
      for (var i = 0; i < n; i++) {
        var q = generateMathQuestion('money', null);
        var prices = q.type === 'money-add' ? [q.item1.price, q.item2.price] : [q.item.price];
        prices.forEach(function (p) {
          seen++;
          if (p % 10 === 0) round10++;
          if (p <= 0) bad = 'non-positive price ' + p;
        });
        if (q.type === 'money-change') {
          change++;
          if (q.answer !== q.paid - q.item.price) bad = 'change key wrong';
          if (q.answer <= 0) bad = 'change of ' + q.answer + ' cents';
        } else if (q.answer !== q.item1.price + q.item2.price) bad = 'total key wrong';
        var big = q.type === 'money-add' ? q.answer : q.paid;
        if (big > maxAmount) maxAmount = big;
      }
      return { round10: round10, seen: seen, maxAmount: maxAmount, change: change, bad: bad };
    }
    return { lo: survey(0, 400), hi: survey(4, 400) };
  })()
`);
ok('money: every price is a round ten cents at level 0, and no change to give yet',
   !money.lo.bad && money.lo.round10 === money.lo.seen && money.lo.change === 0,
   money.lo.bad || (money.lo.round10 + '/' + money.lo.seen + ' prices round, ' + money.lo.change + ' change questions'));
ok('money: awkward prices and giving change by level 4, all still under two dollars',
   !money.hi.bad && money.hi.round10 < money.hi.seen * 0.25 && money.hi.change > 0 && money.hi.maxAmount <= 200,
   money.hi.bad || (money.hi.round10 + '/' + money.hi.seen + ' prices round, ' + money.hi.change +
                    ' change questions, largest amount ' + money.hi.maxAmount + 'c'));

// ---------------------------------------------------------------------
// 2. Answer keys must be the actual answers.
// ---------------------------------------------------------------------

const keys = run(`
  (function () {
    var bad = [], checked = 0;
    function note(m) { if (bad.length < 6) bad.push(m); }
    for (var lvl = 0; lvl <= 4; lvl++) {
      state.skills = {};
      ['dataan','fracadd','divrem','area','bignum','multiop','mixfrac','decimal','multiwp','pgraph','bargraph','lenmass']
        .forEach(function (s) { getSkillState(s).level = lvl; });

      for (var i = 0; i < 500; i++) {
        var q;

        // -- data analysis: mean, total and range must be exact
        q = generateMathQuestion('dataan', null); checked++;
        var sum = q.data.reduce(function (a, b) { return a + b; }, 0);
        if (q.qType === 'average') {
          if (sum % q.data.length !== 0) note('dataan L' + lvl + ': mean not whole, data=' + q.data.join(','));
          else if (q.answer !== sum / q.data.length) note('dataan L' + lvl + ': mean key wrong ' + q.answer + ' vs ' + (sum / q.data.length));
        } else if (q.qType === 'total') {
          if (q.answer !== sum) note('dataan L' + lvl + ': total key wrong');
        } else if (q.answer !== Math.max.apply(null, q.data) - Math.min.apply(null, q.data)) {
          note('dataan L' + lvl + ': range key wrong');
        }

        // -- same-denominator fractions: never zero, never improper
        q = generateMathQuestion('fracadd', null); checked++;
        var expect = q.op === '+' ? q.a + q.b : q.a - q.b;
        if (q.answerNum !== expect) note('fracadd L' + lvl + ': ' + q.a + q.op + q.b + ' key ' + q.answerNum);
        if (q.answerNum < 1) note('fracadd L' + lvl + ': answer is zero or negative');
        if (q.answerNum >= q.denom) note('fracadd L' + lvl + ': answer ' + q.answerNum + '/' + q.denom + ' is not a proper fraction');

        // -- division with remainder
        q = generateMathQuestion('divrem', null); checked++;
        if (q.divisor * q.quotient + q.remainder !== q.dividend) note('divrem L' + lvl + ': does not reconstruct');
        if (q.remainder < 1 || q.remainder >= q.divisor) note('divrem L' + lvl + ': remainder ' + q.remainder + ' invalid for divisor ' + q.divisor);

        // -- area and perimeter
        q = generateMathQuestion('area', null); checked++;
        if (q.type === 'area-count' && q.answer !== q.width * q.height) note('area L' + lvl + ': area key wrong');
        if (q.type === 'perimeter-count' && q.answer !== 2 * (q.width + q.height)) note('area L' + lvl + ': perimeter key wrong');

        // -- place value, rounding, comparison
        q = generateMathQuestion('bignum', null); checked++;
        if (q.type === 'big-number-round' && q.answer !== Math.round(q.number / q.roundTo) * q.roundTo) note('bignum L' + lvl + ': rounding key wrong');
        if (q.type === 'comparing') {
          if (q.a === q.b) note('bignum L' + lvl + ': comparing two equal numbers');
          else if (q.answer !== (q.a > q.b ? '>' : '<')) note('bignum L' + lvl + ': comparison key wrong');
        }

        // -- long multiplication and division
        q = generateMathQuestion('multiop', null); checked++;
        if (q.type === 'long-multiplication' && q.answer !== q.a * q.b) note('multiop L' + lvl + ': product wrong');
        if (q.type === 'long-division' && q.divisor * q.answer !== q.dividend) note('multiop L' + lvl + ': quotient wrong');

        // -- mixed and improper fractions
        q = generateMathQuestion('mixfrac', null); checked++;
        if (q.type === 'mixed-to-improper' && q.answer !== (q.whole * q.denom + q.numer) + '/' + q.denom) note('mixfrac L' + lvl + ': improper key wrong');
        if (q.type === 'improper-to-mixed') {
          if (q.wholeAnswer !== Math.floor(q.improper / q.denom)) note('mixfrac L' + lvl + ': whole part wrong');
          if (q.numerAnswer !== q.improper % q.denom) note('mixfrac L' + lvl + ': remainder part wrong');
        }

        // -- decimals
        q = generateMathQuestion('decimal', null); checked++;
        if (q.type === 'decimal-add') {
          var s2 = (parseFloat(q.a) + parseFloat(q.b)).toFixed(1);
          if (q.answer !== s2) note('decimal L' + lvl + ': ' + q.a + '+' + q.b + ' key ' + q.answer + ' vs ' + s2);
        }
        if (q.type === 'decimal-identify') {
          var num = parseInt(q.fraction.split('/')[0], 10);
          if (q.answer !== (num / 10).toFixed(1)) note('decimal L' + lvl + ': conversion key wrong');
        }
      }
    }
    return { bad: bad, checked: checked };
  })()
`);
ok('answer keys are the real answers across all five levels',
   keys.bad.length === 0, keys.bad.length ? keys.bad.join(' | ') : keys.checked + ' questions verified');

// ---------------------------------------------------------------------
// 3. No question may be ambiguous or unanswerable.
// ---------------------------------------------------------------------

const amb = run(`
  (function () {
    var bad = [], checked = 0;
    function note(m) { if (bad.length < 6) bad.push(m); }
    for (var lvl = 0; lvl <= 4; lvl++) {
      state.skills = {};
      ['pgraph','bargraph','lenmass','symm','shp'].forEach(function (s) { getSkillState(s).level = lvl; });

      for (var i = 0; i < 500; i++) {
        // -- graphs: "the most" must mean exactly one bar
        ['pgraph', 'bargraph'].forEach(function (skill) {
          var q = generateMathQuestion(skill, null); checked++;
          var mx = Math.max.apply(null, q.values), mn = Math.min.apply(null, q.values);
          var nMax = q.values.filter(function (v) { return v === mx; }).length;
          var nMin = q.values.filter(function (v) { return v === mn; }).length;
          if (q.qType === 'most' && nMax > 1) note(skill + ' L' + lvl + ': ' + nMax + ' bars tie for most');
          if (q.qType === 'least' && nMin > 1) note(skill + ' L' + lvl + ': ' + nMin + ' bars tie for least');
          if (q.qType === 'total' && q.answer !== q.values.reduce(function (a, b) { return a + b; }, 0)) note(skill + ' L' + lvl + ': total wrong');
          if (/^howmany_/.test(q.qType)) {
            var idx = parseInt(q.qType.split('_')[1], 10);
            if (!(idx >= 0 && idx < q.categories.length)) note(skill + ' L' + lvl + ': howmany index out of range');
            else if (q.answer !== q.values[idx]) note(skill + ' L' + lvl + ': howmany answer wrong');
          }
        });

        // -- "which is longer?" needs two different lengths
        var q2 = generateMathQuestion('lenmass', null); checked++;
        if (q2.type === 'length-compare' && q2.itemA.length === q2.itemB.length) note('lenmass L' + lvl + ': two items of equal length');
        if (q2.type === 'length-difference' && q2.answer !== Math.abs(q2.itemA.length - q2.itemB.length)) note('lenmass L' + lvl + ': difference wrong');

        // -- multiple choice must contain the answer exactly once, and
        //    the rendered onclick must be valid JavaScript. renderSymmetry
        //    decides whether to quote the options by looking at
        //    typeof q.answer, so a numeric answer sitting beside the
        //    string 'infinite' would emit checkAnswer(infinite, 5, this):
        //    a bare identifier that throws the moment she taps it.
        var q3 = generateMathQuestion('symm', null); checked++;
        var hits = q3.options.filter(function (o) { return o === q3.answer; }).length;
        if (hits !== 1) note('symm L' + lvl + ': answer appears ' + hits + ' times in options');
        if (typeof renderSymmetry === 'function') {
          var card3 = { innerHTML: '' };
          renderSymmetry(card3, q3);
          var calls = card3.innerHTML.match(/checkAnswer\\(([^)]*)\\)/g) || [];
          if (calls.length !== q3.options.length) note('symm L' + lvl + ': ' + calls.length + ' clickable options for ' + q3.options.length + ' choices');
          calls.forEach(function (c) {
            // Each argument must be a quoted string or a bare number.
            var args = c.slice('checkAnswer('.length, -1).split(',').slice(0, 2);
            args.forEach(function (a) {
              a = a.trim();
              if (!/^'[^']*'$/.test(a) && !/^-?\\d+(\\.\\d+)?$/.test(a)) {
                note('symm L' + lvl + ': onclick emits bare identifier "' + a + '"');
              }
            });
          });
        }

        var q4 = generateMathQuestion('shp', null); checked++;
        if (q4.type === 'shape-identify') {
          var h2 = q4.options.filter(function (o) { return o.name === q4.answer; }).length;
          if (h2 !== 1) note('shp L' + lvl + ': shape answer appears ' + h2 + ' times');
        }
      }
    }
    return { bad: bad, checked: checked };
  })()
`);
ok('no ambiguous or unanswerable questions across all five levels',
   amb.bad.length === 0, amb.bad.length ? amb.bad.join(' | ') : amb.checked + ' questions verified');

// ---------------------------------------------------------------------
// 4. The fraction renderer must always offer the correct answer.
// ---------------------------------------------------------------------
// This is the bug that made 1 in 20 fraction questions impossible: the
// options were built up to five, the answer appended, then the whole lot
// shuffled and sliced back to four. Exercise the real renderer.

const fracRender = run(`
  (function () {
    if (typeof renderFractionOp !== 'function') return { unavailable: true };
    var bad = 0, checked = 0, sample = '';
    for (var lvl = 0; lvl <= 4; lvl++) {
      state.skills = {}; getSkillState('fracadd').level = lvl;
      for (var i = 0; i < 600; i++) {
        var q = generateMathQuestion('fracadd', null);
        var card = { innerHTML: '' };
        renderFractionOp(card, q);
        checked++;
        // The answer must appear as a real choice, not merely as text.
        var needle = "checkAnswer('" + q.answer + "', '" + q.answer + "'";
        if (card.innerHTML.indexOf(needle) === -1) {
          bad++;
          if (!sample) sample = 'L' + lvl + ' ' + q.a + q.op + q.b + '/' + q.denom + ' answer ' + q.answer;
        }
      }
    }
    return { bad: bad, checked: checked, sample: sample };
  })()
`);
ok('fraction questions always render the correct answer as a choice',
   !fracRender.unavailable && fracRender.bad === 0,
   fracRender.unavailable ? 'GENERATOR NOT EXPOSED - test could not run'
     : (fracRender.bad ? fracRender.bad + '/' + fracRender.checked + ' unanswerable, e.g. ' + fracRender.sample
        : fracRender.checked + ' rendered'));

// ---------------------------------------------------------------------
// 5. The ladder helper itself.
// ---------------------------------------------------------------------

const tierT = run(`
  (function () {
    if (typeof tier !== 'function') return { unavailable: true };
    var five = [], three = [], two = [];
    for (var l = 0; l <= 4; l++) {
      five.push(tier({ level: l }, [0, 1, 2, 3, 4]));
      three.push(tier({ level: l }, ['a', 'b', 'c']));
      two.push(tier({ level: l }, ['x', 'y']));
    }
    return {
      five: five.join(','), three: three.join(','), two: two.join(','),
      // Out-of-range and missing levels must not fall off the end.
      guards: [tier(null, ['a','b']), tier({}, ['a','b']), tier({ level: -3 }, ['a','b']),
               tier({ level: 99 }, ['a','b']), tier({ level: NaN }, ['a','b'])].join(',')
    };
  })()
`);
ok('tier: a five-rung ladder maps levels 0-4 one to one',
   !tierT.unavailable && tierT.five === '0,1,2,3,4', tierT.unavailable ? 'NOT EXPOSED' : tierT.five);
ok('tier: shorter ladders stretch evenly instead of clipping',
   !tierT.unavailable && tierT.three === 'a,a,b,b,c' && tierT.two === 'x,x,x,y,y',
   tierT.unavailable ? 'NOT EXPOSED' : tierT.three + ' / ' + tierT.two);
ok('tier: missing, negative, NaN and oversized levels all stay in range',
   !tierT.unavailable && tierT.guards === 'a,a,a,b,a', tierT.unavailable ? 'NOT EXPOSED' : tierT.guards);

// ---------------------------------------------------------------------
// 6. Regrouping ladders must do what they claim.
// ---------------------------------------------------------------------

const carry = run(`
  (function () {
    if (typeof _hasCarry !== 'function' || typeof _hasBorrow !== 'function') return { unavailable: true };
    // Verify the detectors themselves against long-hand arithmetic first,
    // otherwise the ladder is being checked with the same broken ruler.
    var det = 0;
    for (var a = 0; a < 1000; a++) {
      for (var b = 0; b < 1000; b += 7) {
        var expect = String(a + b).length > Math.max(String(a).length, String(b).length) ||
                     (a % 10) + (b % 10) >= 10 ||
                     (Math.floor(a / 10) % 10) + (Math.floor(b / 10) % 10) >= 10 ||
                     (Math.floor(a / 100) % 10) + (Math.floor(b / 100) % 10) >= 10;
        if (_hasCarry(a, b) !== expect) det++;
      }
    }
    // Now the generators: level 0 and 1 must never need regrouping,
    // level 4 must essentially always need it.
    function rate(skill, lvl, n) {
      state.skills = {}; getSkillState(skill).level = lvl;
      var hit = 0;
      for (var i = 0; i < n; i++) {
        var q = generateMathQuestion(skill, null);
        if (skill === 'add10k' ? _hasCarry(q.a, q.b) : _hasBorrow(q.a, q.b)) hit++;
      }
      return hit / n;
    }
    return {
      detectorMismatches: det,
      addL0: rate('add10k', 0, 400), addL1: rate('add10k', 1, 400), addL4: rate('add10k', 4, 400),
      subL0: rate('sub10k', 0, 400), subL1: rate('sub10k', 1, 400), subL4: rate('sub10k', 4, 400)
    };
  })()
`);
ok('carry detector agrees with long-hand arithmetic over 143k pairs',
   !carry.unavailable && carry.detectorMismatches === 0,
   carry.unavailable ? 'NOT EXPOSED' : carry.detectorMismatches + ' mismatches');
ok('addition to 10k: no carrying at levels 0-1, always carrying at level 4',
   !carry.unavailable && carry.addL0 === 0 && carry.addL1 === 0 && carry.addL4 > 0.97,
   carry.unavailable ? 'NOT EXPOSED' : 'L0=' + carry.addL0 + ' L1=' + carry.addL1 + ' L4=' + carry.addL4);
ok('subtraction to 10k: no borrowing at levels 0-1, always borrowing at level 4',
   !carry.unavailable && carry.subL0 === 0 && carry.subL1 === 0 && carry.subL4 > 0.97,
   carry.unavailable ? 'NOT EXPOSED' : 'L0=' + carry.subL0 + ' L1=' + carry.subL1 + ' L4=' + carry.subL4);

// ---------------------------------------------------------------------
// 7. Every generated question must still be renderable.
// ---------------------------------------------------------------------
// Scaling a generator is worthless if it starts emitting a question type
// no renderer handles: that shows the child a blank card.

const renderable = run(`
  (function () {
    if (typeof renderMathQuestion !== 'function') return { unavailable: true };
    var SKILLS = ${JSON.stringify(SKILLS)};
    var bad = {}, checked = 0;
    for (var lvl = 0; lvl <= 4; lvl++) {
      for (var s = 0; s < SKILLS.length; s++) {
        state.skills = {}; getSkillState(SKILLS[s]).level = lvl;
        for (var i = 0; i < 60; i++) {
          var q = generateMathQuestion(SKILLS[s], null);
          var card = { innerHTML: '' };
          var handled = false;
          try { handled = renderMathQuestion(card, q); } catch (e) {
            bad[SKILLS[s] + ':' + q.type + ' threw ' + String(e.message).slice(0, 40)] = true;
            continue;
          }
          checked++;
          if (!handled) bad[SKILLS[s] + ' emits unrenderable type "' + q.type + '"'] = true;
          else if (!card.innerHTML) bad[SKILLS[s] + ':' + q.type + ' rendered empty'] = true;
        }
      }
    }
    return { bad: Object.keys(bad), checked: checked };
  })()
`);
ok('every question every generator emits has a renderer and draws something',
   !renderable.unavailable && renderable.bad.length === 0,
   renderable.unavailable ? 'RENDERER NOT EXPOSED - test could not run'
     : (renderable.bad.length ? renderable.bad.slice(0, 5).join(' | ') : renderable.checked + ' rendered across 5 levels'));

// ---- report ----
console.log('\n============ DIFFICULTY & ANSWER-KEY TEST ============\n');
let pass = 0, fail = 0;
R.forEach(r => {
  console.log((r.pass ? '  PASS  ' : '> FAIL <') + ' ' + r.name + (r.extra ? '   [' + r.extra + ']' : ''));
  r.pass ? pass++ : fail++;
});
console.log('\n  ' + pass + ' passed, ' + fail + ' failed, ' + R.length + ' total\n');
process.exit(fail ? 1 : 0);
