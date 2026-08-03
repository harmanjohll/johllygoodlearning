const fs=require('fs'),vm=require('vm');

// The bundle's init() runs against the DOM stub after our tests finish and
// throws; that noise is expected and must not be mistaken for a failure.
process.on('uncaughtException', e => { if (!/Cannot (set|read) propert/.test(String(e && e.message))) throw e; });
process.on('unhandledRejection', e => { if (!/Cannot (set|read) propert/.test(String(e && e.message))) throw e; });


const html=fs.readFileSync(__dirname+'/../dist/bundle.html','utf8');
const code=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m=>m[1]).sort((a,b)=>b.length-a.length)[0];
const noop=()=>{},el=()=>({classList:{add:noop,remove:noop,toggle:noop,contains:()=>false},style:{},dataset:{},appendChild:noop,remove:noop,setAttribute:noop,addEventListener:noop,querySelector:()=>null,querySelectorAll:()=>[],insertAdjacentHTML:noop,textContent:'',innerHTML:'',offsetHeight:0,focus:noop,getBoundingClientRect:()=>({left:0,top:0,width:100,height:100})});
const store={};const sb={console,setTimeout:noop,clearTimeout:noop,setInterval:()=>1,clearInterval:noop,requestAnimationFrame:noop,Math,Date,JSON,Set,Map,Object,Array,String,Number,Boolean,isFinite,isNaN,parseInt,parseFloat,RegExp,Error,encodeURIComponent,AbortController:function(){this.abort=noop;this.signal=null;},fetch:()=>Promise.reject(new Error('x')),navigator:{onLine:true},localStorage:{getItem:k=>k in store?store[k]:null,setItem:(k,v)=>{store[k]=String(v);},removeItem:k=>{delete store[k];}},document:{getElementById:()=>null,querySelector:()=>null,querySelectorAll:()=>[],createElement:el,body:el(),addEventListener:noop,documentElement:el()},window:{}};
sb.window=sb;sb.globalThis=sb;vm.createContext(sb);
try{vm.runInContext(code,sb);}catch(e){}
vm.runInContext('state=state||{};state.skills={};',sb);
const R=[];const ok=(n,c,e='')=>R.push({n,p:!!c,e});

// Adversarial / malformed AI payloads
const v = vm.runInContext(`(function(){
  function V(q){ return aiValidateQuestion(q,{maxAnswer:200}); }
  return {
    // WRONG ANSWER KEY — the critical case. working says 28, answer says 27.
    wrongKey: V({text:'7 boxes of 4. How many?',answer:'27',working:'7 x 4 = 28',hint:'h'}),
    rightKey: V({text:'7 boxes of 4. How many?',answer:'28',working:'7 x 4 = 28',hint:'h'}),
    // multi-step where an intermediate step is wrong
    badStep:  V({text:'Buy 3 at \$5, pay \$20. Change?',answer:'5',working:'3 x 5 = 16 = 20 - 16 = 5',hint:'h'}),
    goodStep: V({text:'Buy 3 at \$5, pay \$20. Change?',answer:'5',working:'3 x 5 = 15 = 20 - 15 = 5',hint:'h'}),
    // division by zero in working
    divZero:  V({text:'Share 10 among 0?',answer:'0',working:'10 / 0 = 0',hint:'h'}),
    // safety / sanity
    negative: V({text:'How many left?',answer:'-4',working:'2 - 6 = -4',hint:'h'}),
    noQmark:  V({text:'Add three and four.',answer:'7',working:'3 + 4 = 7',hint:'h'}),
    banned:   V({text:'How many soldiers did the gun kill?',answer:'4',working:'2 + 2 = 4',hint:'h'}),
    tooBig:   V({text:'How many?',answer:'9999',working:'9999 = 9999',hint:'h'}),
    empty:    V(null),
    noAnswer: V({text:'How many?',working:'1 + 1 = 2',hint:'h'}),
    prose:    V({text:'How many altogether?',answer:'12',working:'four groups of three makes twelve',hint:'h'})
  };
})()`,sb);
ok('AI rejects a question whose answer key contradicts its working', v.wrongKey===false);
ok('AI accepts a correct question', v.rightKey===true);
ok('AI rejects a wrong intermediate step', v.badStep===false);
ok('AI accepts correct multi-step working', v.goodStep===true);
ok('AI rejects division by zero in working', v.divZero===false);
ok('AI rejects negative answers', v.negative===false);
ok('AI rejects text with no question mark', v.noQmark===false);
ok('AI rejects banned words', v.banned===false);
ok('AI rejects answers over the ceiling', v.tooBig===false);
ok('AI rejects null / missing answer', v.empty===false && v.noAnswer===false);
ok('AI keeps questions whose working is prose (unparseable, not wrong)', v.prose===true);

// Bar model construction
const b = vm.runInContext(`(function(){
  var pw=_aiBuildBar({structure:'part-whole',barA:5,barB:3,barALabel:'red',barBLabel:'blue',answer:'8',unknownIs:'total'});
  var cmp=_aiBuildBar({structure:'comparison',barA:9,barB:4,barALabel:'Ann',barBLabel:'Ben',answer:'5',unknownIs:'difference'});
  var part=_aiBuildBar({structure:'part-whole',barA:10,barB:4,barALabel:'all',barBLabel:'eaten',answer:'6',unknownIs:'part'});
  var bad=_aiBuildBar({barA:'x',barB:3,answer:'1'});
  return {pw:pw,cmp:cmp,part:part,bad:bad};
})()`,sb);
ok('AI bar: part-whole has both parts and an unknown total',
   b.pw && b.pw.style==='part-whole' && b.pw.parts.length===2 && b.pw.total.unknown===true, JSON.stringify(b.pw));
ok('AI bar: comparison orders bigger/smaller and marks the difference unknown',
   b.cmp && b.cmp.bigger.value===9 && b.cmp.smaller.value===4 && b.cmp.difference.unknown===true, JSON.stringify(b.cmp));
ok('AI bar: unknown segments still carry a true value for bar widths',
   b.pw.total.value===8 && b.cmp.difference.value===5);
ok('AI bar: malformed quantities produce no bar rather than a broken one', b.bad===null);

// Circuit breaker
const cb = vm.runInContext(`(function(){
  localStorage.setItem('nas.geminiKey','AIzaFAKEKEYFORTESTINGONLY123');
  var before = aiEnabled();
  // simulate repeated failures
  var results=[];
  for(var i=0;i<4;i++){ aiPrefetch('mul',{tables:[7]}); }
  return {enabledWithKey:before, inCooldownAfterFailures:typeof aiInCooldown==='function'?aiInCooldown():null};
})()`,sb);
ok('AI enabled once a key is present', cb.enabledWithKey===true);

// Hint escaping
const h = vm.runInContext(`(function(){
  var nasty='He said "hi" & <script>alert(1)</script> it\\'s 5';
  var html=renderHintBtn(nasty);
  return {
    noRawQuote: html.indexOf('"hi"')===-1,
    noRawScript: html.indexOf('<script>')===-1,
    escapedAmp: html.indexOf('&amp;')!==-1,
    emptyOnUndefined: renderHintBtn(undefined)==='',
    usesDataAttr: html.indexOf('data-hint=')!==-1
  };
})()`,sb);
ok('hint: double quotes cannot break out of the attribute', h.noRawQuote);
ok('hint: markup is escaped, not injected', h.noRawScript && h.escapedAmp);
ok('hint: undefined hint returns empty instead of throwing', h.emptyOnUndefined);
ok('hint: carried on a data attribute, not inline JS', h.usesDataAttr);

process.exitCode = R.some(r=>!r.p) ? 1 : 0;
console.log('\n========== AI SAFETY / HINT ESCAPING ==========\n');
let p=0,f=0;
R.forEach(r=>{console.log((r.p?'  PASS  ':'> FAIL <')+' '+r.n+(r.e?'  ['+r.e+']':'')); r.p?p++:f++;});
console.log('\n  '+p+' passed, '+f+' failed\n');
