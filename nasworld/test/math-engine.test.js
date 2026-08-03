// Functional test of the math generators inside the built bundle.
const fs = require('fs');
const vm = require('vm');

// The bundle's init() runs against the DOM stub after our tests finish and
// throws; that noise is expected and must not be mistaken for a failure.
process.on('uncaughtException', e => { if (!/Cannot (set|read) propert/.test(String(e && e.message))) throw e; });
process.on('unhandledRejection', e => { if (!/Cannot (set|read) propert/.test(String(e && e.message))) throw e; });



const html = fs.readFileSync('' + __dirname + '/../dist/bundle.html', 'utf8');
// The bundle inlines all classic JS into one <script> block (the module
// block for Three.js is separate and marked type="module").
const blocks = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m => m[1]);
const code = blocks.sort((a, b) => b.length - a.length)[0];

const noop = () => {};
const el = () => ({
  classList: { add: noop, remove: noop, toggle: noop, contains: () => false },
  style: {}, dataset: {}, appendChild: noop, remove: noop, removeAttribute: noop,
  setAttribute: noop, getAttribute: () => null, addEventListener: noop,
  querySelector: () => null, querySelectorAll: () => [], insertAdjacentHTML: noop,
  textContent: '', innerHTML: '', offsetHeight: 0, focus: noop, parentElement: null,
  getBoundingClientRect: () => ({ left:0, top:0, width:100, height:100 })
});

const store = {};
const sandbox = {
  console,
  setTimeout: noop, clearTimeout: noop, setInterval: () => 1, clearInterval: noop,
  requestAnimationFrame: noop,
  Math, Date, JSON, Set, Map, Object, Array, String, Number, Boolean, isFinite, isNaN,
  parseInt, parseFloat, RegExp, Error, encodeURIComponent, AbortController: function(){ this.abort=noop; this.signal=null; },
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
  window: {},
};
sandbox.window = sandbox;
sandbox.globalThis = sandbox;
vm.createContext(sandbox);

try { vm.runInContext(code, sandbox); } catch (e) {
  // init() will throw on the DOM stub; that's fine, definitions are loaded.
  if (!/Cannot (set|read)/.test(String(e.message))) {
    console.log('LOAD WARN:', e.message.slice(0, 120));
  }
}

const R = [];
const ok = (name, cond, extra='') => R.push({ name, pass: !!cond, extra });

vm.runInContext(`
  state = state || {};
  state.skills = {};
  state.tokens = 0;
  state.drillConfigs = {};
`, sandbox);

// ---- 1. Specific times table drill ----
const mulTest = vm.runInContext(`
  (function(){
    var out = { tables: {}, variants: {}, subKeys: {} };
    for (var i = 0; i < 300; i++) {
      var q = generateMathQuestion('mul', { tables: [7], mode: 'practice', count: 10 });
      out.tables[q.table] = (out.tables[q.table]||0) + 1;
      out.variants[q.variant] = (out.variants[q.variant]||0)+1;
      out.subKeys[q.subKey] = (out.subKeys[q.subKey]||0)+1;
      if (q.variant === 'missing-factor') {
        if (q.table * q.answer !== q.product) return { ERROR: 'missing-factor math wrong: '+JSON.stringify(q) };
      } else {
        if (q.table * q.n !== q.answer) return { ERROR: 'product wrong: '+JSON.stringify(q) };
      }
    }
    return out;
  })()
`, sandbox);
ok('mul: ONLY the 7 times table when tables:[7]',
   !mulTest.ERROR && Object.keys(mulTest.tables).length === 1 && mulTest.tables['7'] === 300,
   JSON.stringify(mulTest.tables || mulTest.ERROR));
ok('mul: emits subKey for per-table tracking', !mulTest.ERROR && mulTest.subKeys['7'] === 300);
ok('mul: all arithmetic correct over 300 draws', !mulTest.ERROR, mulTest.ERROR || '');
// At level 0 (Concrete) a beginner should NOT get missing-factor puzzles.
ok('mul: no missing-factor at Concrete level (correct for a beginner)',
   !mulTest.ERROR && !mulTest.variants['missing-factor'], JSON.stringify(mulTest.variants || {}));

// ...but it must appear once she is past the concrete stage.
const mfAbstract = vm.runInContext(`
  (function(){
    state.skills = {}; getSkillState('mul').level = 2;
    var v = {};
    for (var i=0;i<300;i++){
      var q = generateMathQuestion('mul',{tables:[7]});
      v[q.variant]=(v[q.variant]||0)+1;
      if (q.variant==='missing-factor' && q.table*q.answer!==q.product) return {ERROR:'bad mf'};
    }
    state.skills = {};
    return v;
  })()
`, sandbox);
ok('mul: missing-factor appears at Abstract level',
   !mfAbstract.ERROR && (mfAbstract['missing-factor']||0) > 0, JSON.stringify(mfAbstract));

// multi-table selection
const multiTable = vm.runInContext(`
  (function(){
    var seen = {};
    for (var i=0;i<400;i++){ var q = generateMathQuestion('mul',{tables:[3,8]}); seen[q.table]=1; }
    return Object.keys(seen).sort();
  })()
`, sandbox);
ok('mul: multi-select [3,8] yields exactly those two',
   JSON.stringify(multiTable) === JSON.stringify(['3','8']), JSON.stringify(multiTable));

// ---- 2. Division divisor selection ----
const divTest = vm.runInContext(`
  (function(){
    var seen={}, bad=null;
    for (var i=0;i<200;i++){
      var q=generateMathQuestion('div',{tables:[6]});
      seen[q.divisor]=1;
      if (q.dividend / q.divisor !== q.answer) bad = JSON.stringify(q);
      if (q.dividend % q.divisor !== 0) bad = 'not exact: '+JSON.stringify(q);
    }
    return { seen: Object.keys(seen), bad: bad };
  })()
`, sandbox);
ok('div: only divisor 6 when selected', JSON.stringify(divTest.seen) === JSON.stringify(['6']), JSON.stringify(divTest.seen));
ok('div: always divides exactly, answer correct', !divTest.bad, divTest.bad || '');

// ---- 3. Addition "within N" semantics ----
const addTest = vm.runInContext(`
  (function(){
    var maxSum=0, minSum=999, bad=null;
    for (var i=0;i<400;i++){
      var q=generateMathQuestion('add',{numberRange:[1,10],rangeKey:'1-10'});
      if (q.a + q.b !== q.answer) bad='wrong sum '+JSON.stringify(q);
      maxSum=Math.max(maxSum,q.answer); minSum=Math.min(minSum,q.answer);
    }
    return {maxSum:maxSum,minSum:minSum,bad:bad};
  })()
`, sandbox);
ok('add: "within 10" never exceeds 10', addTest.maxSum <= 10, 'maxSum='+addTest.maxSum);
ok('add: arithmetic correct', !addTest.bad, addTest.bad||'');

const add100 = vm.runInContext(`
  (function(){
    var noCarry=true, allCarry=true, bad=null;
    for (var i=0;i<200;i++){
      var q=generateMathQuestion('add100',{numberRange:[1,99],flag:'noRegroup',rangeKey:'no-regroup'});
      if (q.a+q.b!==q.answer) bad='sum wrong';
      if ((q.a%10)+(q.b%10) >= 10) noCarry=false;
      if (q.answer>99) bad='over 100: '+q.a+'+'+q.b;
    }
    for (var j=0;j<200;j++){
      var r=generateMathQuestion('add100',{numberRange:[1,99],flag:'regroup',rangeKey:'regroup'});
      if ((r.a%10)+(r.b%10) < 10) allCarry=false;
      if (r.answer>99) bad='regroup over 100: '+r.a+'+'+r.b;
    }
    return {noCarry:noCarry,allCarry:allCarry,bad:bad};
  })()
`, sandbox);
ok('add100: "no carrying" truly never carries', add100.noCarry);
ok('add100: "with carrying" always carries', add100.allCarry);
ok('add100: stays under 100', !add100.bad, add100.bad||'');

const sub100 = vm.runInContext(`
  (function(){
    var noBorrow=true, allBorrow=true, neg=false;
    for (var i=0;i<200;i++){
      var q=generateMathQuestion('sub100',{flag:'noRegroup',rangeKey:'no-regroup'});
      if ((q.a%10) < (q.b%10)) noBorrow=false;
      if (q.answer<0) neg=true;
    }
    for (var j=0;j<200;j++){
      var r=generateMathQuestion('sub100',{flag:'regroup',rangeKey:'regroup'});
      if ((r.a%10) >= (r.b%10)) allBorrow=false;
      if (r.answer<0) neg=true;
    }
    return {noBorrow:noBorrow,allBorrow:allBorrow,neg:neg};
  })()
`, sandbox);
ok('sub100: "no borrowing" truly never borrows', sub100.noBorrow);
ok('sub100: "with borrowing" always borrows', sub100.allBorrow);
ok('sub100: never negative', !sub100.neg);

// ---- 4. Subtraction never negative ----
const subTest = vm.runInContext(`
  (function(){
    var neg=false,bad=null;
    for (var i=0;i<400;i++){
      var q=generateMathQuestion('sub',{numberRange:[1,20],rangeKey:'1-20'});
      if (q.answer<0) neg=true;
      if (q.a-q.b!==q.answer) bad=JSON.stringify(q);
      if (q.a>20) bad='over range '+q.a;
    }
    return {neg:neg,bad:bad};
  })()
`, sandbox);
ok('sub: never negative, within range', !subTest.neg && !subTest.bad, subTest.bad||'');

// ---- 5. Word problems ----
const wpTest = vm.runInContext(`
  (function(){
    var structures={}, texts={}, bad=null, bars=0;
    for (var i=0;i<300;i++){
      var q=generateMathQuestion('wp1',{mode:'word',structure:'mixed',numberRange:[1,20],theme:'mixed'});
      if (!q) return {ERROR:'no word problem generated'};
      if (q.type!=='word-problem') return {ERROR:'wrong type '+q.type};
      structures[q.structure]=(structures[q.structure]||0)+1;
      texts[q.text]=1;
      if (q.bar) bars++;
      if (typeof q.answer!=='number'||q.answer<0||!isFinite(q.answer)) bad=JSON.stringify(q);
      if (q.text.indexOf('?')===-1) bad='no question mark: '+q.text;
    }
    return {structures:structures,unique:Object.keys(texts).length,bad:bad,bars:bars};
  })()
`, sandbox);
ok('wp: generates word problems in word mode', !wpTest.ERROR, wpTest.ERROR||'');
ok('wp: multiple Singapore structures used',
   !wpTest.ERROR && Object.keys(wpTest.structures||{}).length >= 3, JSON.stringify(wpTest.structures||{}));
ok('wp: high variety (>100 unique texts in 300 draws)',
   !wpTest.ERROR && wpTest.unique > 100, 'unique='+wpTest.unique);
ok('wp: answers valid & non-negative', !wpTest.ERROR && !wpTest.bad, wpTest.bad||'');
ok('wp: bar-model data emitted', !wpTest.ERROR && wpTest.bars > 0, 'bars='+wpTest.bars);

// structure filter
const wpStruct = vm.runInContext(`
  (function(){
    var s={};
    for(var i=0;i<100;i++){
      var q=generateMathQuestion('wp1',{mode:'word',structure:'comparison',numberRange:[1,20]});
      s[q.structure]=1;
    }
    return Object.keys(s);
  })()
`, sandbox);
ok('wp: structure filter works (comparison only)',
   JSON.stringify(wpStruct)===JSON.stringify(['comparison']), JSON.stringify(wpStruct));

// mul word problems respect table selection
const wpMul = vm.runInContext(`
  (function(){
    var keys={};
    for(var i=0;i<150;i++){
      var q=generateMathQuestion('mul',{mode:'word',tables:[9]});
      if(q && q.subKey) keys[q.subKey]=1;
    }
    return Object.keys(keys);
  })()
`, sandbox);
ok('wp: multiplication stories respect chosen table [9]',
   JSON.stringify(wpMul)===JSON.stringify(['9']), JSON.stringify(wpMul));

// ---- 6. Sub-skill mastery tracking ----
const subSkill = vm.runInContext(`
  (function(){
    state.skills={};
    for(var i=0;i<10;i++) recordSubSkill('mul','7',true,3000);
    for(var j=0;j<10;j++) recordSubSkill('mul','8',false,9000);
    var m7=subSkillMastery('mul','7'), m8=subSkillMastery('mul','8');
    var weakest=weakestSubSkills('mul',[7,8],1);
    return {m7:m7,m8:m8,weakest:weakest,untried:subSkillMastery('mul','3')};
  })()
`, sandbox);
ok('subskill: strong table scores high', subSkill.m7 >= 70, 'm7='+subSkill.m7);
ok('subskill: weak table scores low', subSkill.m8 <= 20, 'm8='+subSkill.m8);
ok('subskill: untried returns null', subSkill.untried === null);
ok('subskill: weakest picks the weak one', String(subSkill.weakest[0])==='8', JSON.stringify(subSkill.weakest));

// ---- 7. Weighted bias toward weak tables ----
const bias = vm.runInContext(`
  (function(){
    state.skills={};
    for(var i=0;i<12;i++) recordSubSkill('mul','2',true,2000);
    for(var j=0;j<12;j++) recordSubSkill('mul','8',false,9000);
    var counts={2:0,8:0};
    for(var k=0;k<600;k++){ var q=generateMathQuestion('mul',{tables:[2,8]}); counts[q.table]++; }
    return counts;
  })()
`, sandbox);
ok('bias: weak table (8) drilled more than mastered table (2)',
   bias['8'] > bias['2'] * 1.3, '8:'+bias['8']+' vs 2:'+bias['2']);

// ---- 8. Smart distractors ----
const distract = vm.runInContext(`
  (function(){
    var bad=null, dupes=0;
    for(var i=0;i<200;i++){
      var q=generateMathQuestion('mul',{tables:[7]});
      var opts=mathSmartOptions(q.answer,q);
      if(opts.length!==4) bad='not 4 options: '+opts.length;
      if(opts.indexOf(q.answer)===-1) bad='answer missing from options';
      var uniq={}; opts.forEach(function(o){uniq[o]=1;});
      if(Object.keys(uniq).length!==4) dupes++;
      if(opts.some(function(o){return o<0;})) bad='negative option';
    }
    return {bad:bad,dupes:dupes};
  })()
`, sandbox);
ok('distractors: always 4 unique options incl. the answer, none negative',
   !distract.bad && distract.dupes===0, distract.bad||('dupes='+distract.dupes));

// ---- 9. Drill config plumbing ----
const cfgTest = vm.runInContext(`
  (function(){
    state.drillConfigs={};
    var c=getDrillConfig('mul');
    var before=JSON.stringify(c.tables);
    setDrillConfig('mul',{tables:[6,7],count:20,mode:'speed'});
    var r=resolveDrillConfig('mul');
    return {before:before,resolvedTables:r.tables,count:r.count,mode:r.mode,
            hasDrillMul:skillHasDrill('mul'),hasDrillCount:skillHasDrill('count'),
            hasDrillPat:skillHasDrill('pat')};
  })()
`, sandbox);
ok('config: saves and resolves table selection',
   JSON.stringify(cfgTest.resolvedTables)===JSON.stringify([6,7]), JSON.stringify(cfgTest.resolvedTables));
ok('config: question count + mode carried through',
   cfgTest.count===20 && cfgTest.mode==='speed');
// mul and count both have drill options; pat has none, so it should
// fall straight through to a plain quiz.
ok('config: skillHasDrill correct',
   cfgTest.hasDrillMul===true && cfgTest.hasDrillCount===true && cfgTest.hasDrillPat===false,
   JSON.stringify(cfgTest));

// ---- 10. Time & money variants ----
const timeTest = vm.runInContext(`
  (function(){
    var oc={},fm={};
    for(var i=0;i<100;i++){ oc[generateMathQuestion('time1',{flag:'oclock'}).minutes]=1; }
    for(var j=0;j<200;j++){ fm[generateMathQuestion('time1',{flag:'fivemin'}).minutes]=1; }
    return {oclock:Object.keys(oc),fivemin:Object.keys(fm).length};
  })()
`, sandbox);
ok("time: o'clock only gives minutes=0 always",
   JSON.stringify(timeTest.oclock)===JSON.stringify(['0']), JSON.stringify(timeTest.oclock));
ok('time: five-minute mode gives many minute values', timeTest.fivemin>=8, 'distinct='+timeTest.fivemin);

const moneyTest = vm.runInContext(`
  (function(){
    var t={};
    for(var i=0;i<100;i++){ t[generateMathQuestion('money',{flag:'change'}).type]=1; }
    return Object.keys(t);
  })()
`, sandbox);
ok('money: "giving change" filter works',
   JSON.stringify(moneyTest)===JSON.stringify(['money-change']), JSON.stringify(moneyTest));

// ---- 11. AI graceful degradation ----
const aiTest = vm.runInContext(`
  (function(){
    var enabled = aiEnabled();
    var taken = aiTakeQuestion('mul',{tables:[7]});
    var q = generateMathQuestion('mul',{mode:'word',tables:[7],useAI:true});
    return {enabled:enabled,taken:taken,gotLocal:!!q,type:q&&q.type};
  })()
`, sandbox);
ok('ai: disabled with no key', aiTest.enabled===false);
ok('ai: takeQuestion returns null when unavailable', aiTest.taken===null);
ok('ai: falls back to a local word problem instantly',
   aiTest.gotLocal && aiTest.type==='word-problem', JSON.stringify(aiTest));

// ---- 12. No regressions on untouched skills ----
const regress = vm.runInContext(`
  (function(){
    var ids=['count','nbond','cmp','pat','shp','frac1','pgraph','lenmass','add10k','sub10k',
             'advmul','divrem','fracadd','area','angle','bargraph','bignum','multiop',
             'factor','mixfrac','decimal','symm','dataan','multiwp','wp1','time1','money'];
    var bad=[];
    ids.forEach(function(id){
      try {
        for(var i=0;i<20;i++){
          var q=generateMathQuestion(id);
          if(!q||!q.type) bad.push(id+':no-type');
          if(q.answer===undefined||q.answer===null) bad.push(id+':no-answer');
        }
      } catch(e){ bad.push(id+':THREW '+e.message); }
    });
    return bad;
  })()
`, sandbox);
ok('regression: all 27 other skills still generate valid questions',
   regress.length===0, regress.slice(0,5).join(', '));

// ---- 13. Regressions for bugs found by audit + verified by execution ----
const crit = vm.runInContext(`
  (function(){
    var out={};
    // A. grantSimReward must not corrupt the skill record (used to crash
    //    updateSkillState on the next quiz answer with "reading 'push'").
    state.skills={}; window._currentSim={id:'balance'};
    grantSimReward('lenmass','t');
    var crash=null;
    try { updateSkillState('lenmass', true, 3); } catch(e){ crash=e.message; }
    out.simRewardCrash=crash;
    out.simRecordSane=Array.isArray(state.skills['lenmass'].recentResults);

    // B. Passive tab-opening must not reach the 40% dependency unlock.
    state.skills={};
    var s=getSkillState('add');
    if(typeof recordSkillActivity==='function'){recordSkillActivity('add','learn');recordSkillActivity('add','explore');}
    s.lessonViewed={add:true};
    out.passiveMastery=(typeof computeMultiFactorMastery==='function')?computeMultiFactorMastery('add'):0;

    // C. time-set (which showed its own answer) must be gone.
    var types={};
    for(var i=0;i<200;i++){types[generateMathQuestion('time1',{}).type]=1;}
    out.timeTypes=Object.keys(types).sort();

    // D. No time question may print its answer in the hint.
    var leak=0;
    for(var j=0;j<200;j++){
      var q=generateMathQuestion('time1',{});
      if(q.hint&&String(q.answer)&&q.hint.indexOf(String(q.answer))!==-1) leak++;
    }
    out.timeHintLeaks=leak;

    // E. find-lcm must not pick pairs where one divides the other.
    var degenerate=0;
    for(var k=0;k<400;k++){
      var f=generateMathQuestion('factor');
      if(f.type==='find-lcm' && (f.b%f.a===0||f.a%f.b===0)) degenerate++;
    }
    out.lcmDegenerate=degenerate;

    // F. shape-identify must carry a top-level answer.
    var noAns=0;
    for(var m=0;m<200;m++){
      var sh=generateMathQuestion('shp');
      if(sh.type==='shape-identify'&&(sh.answer===undefined||sh.answer===null)) noAns++;
    }
    out.shapeNoAnswer=noAns;
    state.skills={};
    return out;
  })()
`, sandbox);
ok('CRIT: STEM sim reward no longer corrupts skill state (was a crash)',
   crit.simRewardCrash===null && crit.simRecordSane, String(crit.simRewardCrash));
ok('CRIT: opening tabs alone cannot unlock the skill tree (<40%)',
   crit.passiveMastery < 40, 'mastery='+crit.passiveMastery);
ok('CRIT: broken self-revealing time-set question is gone',
   crit.timeTypes.indexOf('time-set')===-1, JSON.stringify(crit.timeTypes));
ok('CRIT: no time question leaks its answer in the hint',
   crit.timeHintLeaks===0, 'leaks='+crit.timeHintLeaks);
ok('CRIT: find-lcm never picks a degenerate pair',
   crit.lcmDegenerate===0, 'degenerate='+crit.lcmDegenerate);
ok('CRIT: shape-identify always carries an answer field',
   crit.shapeNoAnswer===0, 'missing='+crit.shapeNoAnswer);

// ---- 14. Render-layer guarantees ----
const rend = vm.runInContext(`
  (function(){
    function card(){return {innerHTML:''};}
    function spans(h){var m=h.match(/font-size:20px/g);return m?m.length:0;}
    var out={};
    var big={type:'multiplication',variant:'product',table:12,n:12,answer:144,isConcrete:true,hint:'h'};
    var c1=card(); renderMultiplication(c1,big);
    out.bigEmoji=spans(c1.innerHTML); out.bigGrid=/area-grid/.test(c1.innerHTML);
    var small={type:'multiplication',variant:'product',table:3,n:4,answer:12,isConcrete:true,hint:'h'};
    var c2=card(); renderMultiplication(c2,small);
    out.smallEmoji=spans(c2.innerHTML);
    var wp=generateMathQuestion('wp1',{mode:'word',structure:'part-whole',numberRange:[1,20]});
    var c4=card(); renderWordProblem(c4,wp);
    out.bar=/bar-model-v2/.test(c4.innerHTML);
    out.barHidden=/wp-bar-wrap hidden/.test(c4.innerHTML);
    out.tag=/wp-structure-tag/.test(c4.innerHTML);
    return out;
  })()
`, sandbox);
ok('render: 12x12 uses an array, not 144 countable emoji',
   rend.bigEmoji===0 && rend.bigGrid, 'emoji='+rend.bigEmoji);
ok('render: small facts still get true concrete emoji groups', rend.smallEmoji===12, 'emoji='+rend.smallEmoji);
ok('render: word problems draw a bar model, hidden until asked for',
   rend.bar && rend.barHidden && rend.tag, JSON.stringify(rend));

// ---- 15. P1 syllabus coverage: numbers to 100, words, ordinals ----
const p1 = vm.runInContext(`
  (function(){
    var out={types:{},bad:null};
    for(var i=0;i<300;i++){
      var q=generateMathQuestion('count',{numberRange:[1,100],rangeKey:'to-100'});
      out.types[q.type]=(out.types[q.type]||0)+1;
      if(q.answer==null) out.bad='no answer';
      if(q.type==='place-value-count' && q.tens*10+q.ones!==q.number) out.bad='tens/ones mismatch';
      if(q.type==='place-value-count' && q.number<=20) out.bad='blocks used below 21';
      if(q.type==='ten-frame-count' && q.number>20) out.bad='ten-frame above 20';
    }
    out.words=numberToWords(42)+'|'+numberToWords(7)+'|'+numberToWords(30)+'|'+numberToWords(100);
    out.ord=ordinalWord(3);
    var ordOK=true;
    for(var k=0;k<80;k++){
      var o=generateMathQuestion('count',{numberRange:[1,10],flag:'ordinal',rangeKey:'ordinal'});
      if(o.type!=='ordinal-position'||o.position>o.queueLength) ordOK=false;
    }
    out.ordOK=ordOK;
    var wOK=true;
    for(var m=0;m<80;m++){
      var w=generateMathQuestion('count',{numberRange:[1,100],flag:'words',rangeKey:'words'});
      if(w.type!=='number-word'||typeof w.answer!=='string') wOK=false;
    }
    out.wOK=wOK;
    return out;
  })()
`, sandbox);
ok('P1: counting now reaches 100 with base-ten blocks',
   !p1.bad && (p1.types['place-value-count']||0) > 0, p1.bad || JSON.stringify(p1.types));
ok('P1: ten-frames only below 21, blocks only above 20', !p1.bad, p1.bad||'');
ok('P1: number-to-words correct', p1.words==='forty-two|seven|thirty|one hundred', p1.words);
ok('P1: ordinal questions valid', p1.ordOK && p1.ord==='third', p1.ord);
ok('P1: number-in-words drill filter works', p1.wOK);

// ---- report ----
console.log('\n================ MATH ENGINE TEST ================\n');
let pass=0, fail=0;
R.forEach(r => {
  console.log((r.pass ? '  PASS  ' : '> FAIL <') + ' ' + r.name + (r.extra ? '   [' + r.extra + ']' : ''));
  r.pass ? pass++ : fail++;
});
console.log('\n  ' + pass + ' passed, ' + fail + ' failed, ' + R.length + ' total\n');
process.exit(fail ? 1 : 0);
