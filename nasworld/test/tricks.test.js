// Verifies every maths trick and every Trachtenberg rule by EXECUTING
// them against ordinary arithmetic. A trick that makes a false claim
// fails here rather than reaching a six year old.
const fs = require('fs');
const vm = require('vm');

process.on('uncaughtException', e => { if (!/Cannot (set|read) propert/.test(String(e && e.message))) throw e; });
process.on('unhandledRejection', e => { if (!/Cannot (set|read) propert/.test(String(e && e.message))) throw e; });

const html = fs.readFileSync(__dirname + '/../dist/bundle.html', 'utf8');
const code = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m => m[1])
  .sort((a, b) => b.length - a.length)[0];

const noop = () => {};
const el = () => ({
  classList: { add: noop, remove: noop, toggle: noop, contains: () => false },
  style: {}, dataset: {}, appendChild: noop, remove: noop, setAttribute: noop,
  addEventListener: noop, querySelector: () => null, querySelectorAll: () => [],
  insertAdjacentHTML: noop, textContent: '', innerHTML: '', offsetHeight: 0, focus: noop,
  getBoundingClientRect: () => ({ left: 0, top: 0, width: 100, height: 100 })
});
const store = {};
const sandbox = {
  console, setTimeout: noop, clearTimeout: noop, setInterval: () => 1, clearInterval: noop,
  requestAnimationFrame: noop, Math, Date, JSON, Set, Map, Object, Array, String, Number,
  Boolean, isFinite, isNaN, parseInt, parseFloat, RegExp, Error, encodeURIComponent,
  AbortController: function () { this.abort = noop; this.signal = null; },
  fetch: () => Promise.reject(new Error('offline')), navigator: { onLine: false },
  localStorage: {
    getItem: k => (k in store ? store[k] : null),
    setItem: (k, v) => { store[k] = String(v); }, removeItem: k => { delete store[k]; }
  },
  document: {
    getElementById: () => null, querySelector: () => null, querySelectorAll: () => [],
    createElement: el, body: el(), addEventListener: noop, documentElement: el()
  },
  window: {}
};
sandbox.window = sandbox; sandbox.globalThis = sandbox;
vm.createContext(sandbox);
try { vm.runInContext(code, sandbox); } catch (e) {}
vm.runInContext('state = state || {}; state.skills = {}; state.tricks = {}; state.tokens = 0;', sandbox);

const R = [];
const ok = (name, cond, extra = '') => R.push({ name, pass: !!cond, extra });

// ---- 1. Every Trachtenberg rule, brute forced ----
const trach = vm.runInContext(`
  (function(){
    var out = {};
    TRACHTENBERG_MULTIPLIERS.forEach(function(m){
      var fails = 0, first = null;
      for (var n = 1; n <= 20000; n++) {
        var r = trachtenberg(n, m);
        if (!r || r.answer !== n * m) { fails++; if (!first) first = n + ' x ' + m + ' gave ' + (r&&r.answer) + ' want ' + (n*m); }
      }
      out['x' + m] = { fails: fails, first: first };
    });
    return out;
  })()
`, sandbox);
Object.keys(trach).forEach(k => {
  ok('Trachtenberg ' + k + ': correct for every n in 1..20000',
     trach[k].fails === 0, trach[k].first || '');
});

// ---- 2. Trachtenberg step working is internally consistent ----
const steps = vm.runInContext(`
  (function(){
    var bad = null, checked = 0;
    [3,4,6,7,8,9,11,12].forEach(function(m){
      for (var n = 7; n <= 999; n += 7) {
        var r = trachtenberg(n, m);
        checked++;
        // Rebuild the answer from the written digits + final carry.
        var digits = r.steps.map(function(s){ return s.written; }).reverse();
        var carry = r.steps[r.steps.length-1].carryOut;
        var rebuilt = Number((carry ? String(carry) : '') + digits.join(''));
        if (rebuilt !== n * m) bad = n + ' x ' + m + ': steps rebuild to ' + rebuilt + ', want ' + (n*m);
        // Each step must show its own arithmetic honestly.
        r.steps.forEach(function(s){
          if (s.raw !== s.value + s.carryIn) bad = 'raw mismatch at ' + n + 'x' + m;
          if (s.written !== s.raw % 10) bad = 'written mismatch at ' + n + 'x' + m;
          if (s.carryOut !== Math.floor(s.raw / 10)) bad = 'carry mismatch at ' + n + 'x' + m;
        });
      }
    });
    return { bad: bad, checked: checked };
  })()
`, sandbox);
ok('Trachtenberg: the displayed working rebuilds the right answer',
   !steps.bad, steps.bad || ('checked ' + steps.checked));

// ---- 3. Every trick's own check() ----
const checks = vm.runInContext(`
  (function(){
    var res = {};
    MATH_TRICKS.forEach(function(t){
      if (typeof t.check !== 'function') { res[t.id] = 'NO CHECK'; return; }
      try { res[t.id] = t.check() ? 'pass' : 'FAIL'; }
      catch(e){ res[t.id] = 'THREW ' + e.message; }
    });
    return res;
  })()
`, sandbox);
Object.keys(checks).forEach(id => {
  ok('trick "' + id + '" arithmetic claim holds', checks[id] === 'pass', checks[id]);
});

// ---- 4. Content integrity ----
const content = vm.runInContext(`
  (function(){
    var problems = [];
    var ids = {};
    MATH_TRICKS.forEach(function(t){
      if (ids[t.id]) problems.push('duplicate id ' + t.id);
      ids[t.id] = 1;
      if (!t.name || !t.oneLiner) problems.push(t.id + ': missing name/oneLiner');
      if (!t.why || t.why.length < 40) problems.push(t.id + ': why is too thin');
      if (!TRICK_TIERS[t.tier]) problems.push(t.id + ': bad tier');
      if (!t.skills || !t.skills.length) problems.push(t.id + ': no skills attached');
      if (!t.examples || t.examples.length < 2) problems.push(t.id + ': needs 2+ examples');
      // Every skill referenced must exist in the math tree.
      t.skills.forEach(function(s){ if (!MATH_TREE[s]) problems.push(t.id + ': unknown skill ' + s); });
      // tryIt must point at a real drill.
      if (t.tryIt && !DRILL_OPTIONS[t.tryIt.skillId]) problems.push(t.id + ': tryIt skill has no drill');
      // Steps must have text.
      (t.steps||[]).forEach(function(s,i){ if(!s.text) problems.push(t.id+': step '+i+' has no text'); });
    });
    return { problems: problems, count: MATH_TRICKS.length };
  })()
`, sandbox);
ok('tricks: content integrity (ids, tiers, skills, examples, drill links)',
   content.problems.length === 0, content.problems.slice(0, 4).join(' | '));
ok('tricks: a useful number of tricks exist', content.count >= 14, 'count=' + content.count);

// ---- 5. Worked examples inside the text are arithmetically true ----
// Pull every "a op b = c" out of the examples and verify it.
const examples = vm.runInContext(`
  (function(){
    var bad = [], checked = 0;
    MATH_TRICKS.forEach(function(t){
      (t.examples||[]).forEach(function(ex){
        // Match simple binary statements, allowing chains like "= 10 + 3 = 13".
        var m = ex.match(/^(\\d+)\\s*([+\\-x×÷])\\s*(\\d+)\\s*=\\s*.*?(\\d+)\\s*$/);
        if (!m) return;
        var a = Number(m[1]), op = m[2], b = Number(m[3]), claimed = Number(m[4]);
        var val;
        if (op === '+') val = a + b;
        else if (op === '-' || op === '−') val = a - b;
        else if (op === 'x' || op === '×') val = a * b;
        else if (op === '÷') val = a / b;
        else return;
        checked++;
        if (val !== claimed) bad.push(t.id + ': "' + ex + '" -> ' + val);
      });
    });
    return { bad: bad, checked: checked };
  })()
`, sandbox);
ok('tricks: every worked example in the text is arithmetically correct',
   examples.bad.length === 0, examples.bad.slice(0, 3).join(' | ') || ('checked ' + examples.checked));

// ---- 6. Casting out nines actually catches errors ----
const cast = vm.runInContext(`
  (function(){
    var falseNeg = 0, trueOK = 0;
    for (var a = 2; a <= 120; a++) for (var b = 2; b <= 20; b++) {
      var right = castingOutNines(a, b, a*b);
      if (!right.passes) falseNeg++;           // must never reject a correct answer
      var wrong = castingOutNines(a, b, a*b + 1);
      if (!wrong.passes) trueOK++;             // should usually catch a wrong one
    }
    return { falseNeg: falseNeg, caught: trueOK };
  })()
`, sandbox);
ok('casting out nines: never rejects a correct answer', cast.falseNeg === 0, 'falseNeg=' + cast.falseNeg);
ok('casting out nines: catches most wrong answers', cast.caught > 1500, 'caught=' + cast.caught);

// ---- 7. Visual models render without throwing ----
const visuals = vm.runInContext(`
  (function(){
    var kinds = [
      {type:'tenframe',filled:6},{type:'tenframe',filled:6,highlightEmpty:true},
      {type:'tenframe2',filled:13},{type:'bond',whole:10,parts:[6,4]},
      {type:'numberline',start:2,hops:9,max:14},{type:'numberline',start:44,hops:-1,max:46},
      {type:'doublebar',a:6,b:7,extra:true},{type:'pvslide',n:70,shifted:true,showZero:true},
      {type:'bar',value:80,label:'x'},{type:'barhalf',value:80},{type:'barminus',value:70,minus:7},
      {type:'chain',values:[7,14,28,56]},{type:'fingers',fold:7,showCount:true},
      {type:'array',rows:3,cols:8,total:24},{type:'neighbour',n:23,stage:'sum'},
      {type:'neighbour',n:87,stage:'carry'},{type:'sq5',n:35,stage:'done'},
      {type:'cast',n:161,root:8,match:true}
    ];
    var bad=[];
    kinds.forEach(function(k){
      try {
        var h = trickVisual(k);
        if (!h || h.length < 10) bad.push(k.type + ' produced nothing');
      } catch(e){ bad.push(k.type + ' THREW ' + e.message); }
    });
    // And every step of every trick.
    MATH_TRICKS.forEach(function(t){
      (t.steps||[]).forEach(function(s){
        if (!s.visual) return;
        try { trickVisual(s.visual); } catch(e){ bad.push(t.id + ' step visual THREW ' + e.message); }
      });
    });
    return bad;
  })()
`, sandbox);
ok('models: every visual renders without throwing', visuals.length === 0, visuals.slice(0, 3).join(' | '));

// ---- 8. Finger trick and x11 shortcut agree with real multiplication ----
const spot = vm.runInContext(`
  (function(){
    var bad = [];
    for (var n = 1; n <= 10; n++) {
      if ((n-1)*10 + (10-n) !== 9*n) bad.push('fingers ' + n);
    }
    for (var t = 1; t <= 9; t++) for (var u = 0; u <= 9; u++) {
      var num = t*10+u, mid = t+u;
      var val = mid < 10 ? t*100 + mid*10 + u : (t+1)*100 + (mid-10)*10 + u;
      if (val !== num*11) bad.push('x11 ' + num);
    }
    for (var k = 1; k <= 20; k++) {
      var n5 = k*10+5;
      if (Number(String(k*(k+1)) + '25') !== n5*n5) bad.push('sq5 ' + n5);
    }
    return bad;
  })()
`, sandbox);
ok('spot checks: finger trick, x11 shortcut and squares-ending-in-5 all exact',
   spot.length === 0, spot.slice(0, 4).join(', '));

console.log('\n============ TRICKS & TRACHTENBERG ============\n');
let pass = 0, fail = 0;
R.forEach(r => {
  console.log((r.pass ? '  PASS  ' : '> FAIL <') + ' ' + r.name + (r.extra ? '   [' + r.extra + ']' : ''));
  r.pass ? pass++ : fail++;
});
console.log('\n  ' + pass + ' passed, ' + fail + ' failed, ' + R.length + ' total\n');
process.exitCode = fail ? 1 : 0;
