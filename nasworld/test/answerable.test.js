// Whole-app sweep: every question must be answerable.
//
// This is subject-agnostic on purpose. The math generators turned out to
// have four separate ways of producing a question that punished a child
// for being right - a rounded answer key, two bars tied for "the most",
// a correct option shuffled off the end of the list, and a picture that
// showed the wrong shape. None of those were exotic. They are the normal
// failure modes of generated questions, so English, Science, Malay and
// Coding are swept for the same things here.
//
// The invariants, all of which are about the child rather than the code:
//
//   1. If a question offers choices, the right answer is one of them.
//   2. It is one of them exactly once, so there is no second right answer
//      sitting there marked wrong.
//   3. No choice appears twice, which would look like a printing mistake.
//   4. Nothing shows up as undefined, null or NaN.
//   5. Something is actually drawn on the card.
//
// A sweep is only worth having if it can fail, so each subject reports
// "NOT EXPOSED" rather than quietly passing when its generator is missing.

const fs = require('fs');
const vm = require('vm');

process.on('uncaughtException', e => { if (!/Cannot (set|read) propert/.test(String(e && e.message))) throw e; });
process.on('unhandledRejection', e => { if (!/Cannot (set|read) propert/.test(String(e && e.message))) throw e; });

const html = fs.readFileSync(__dirname + '/../dist/bundle.html', 'utf8');
const blocks = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m => m[1]);
const code = blocks.sort((a, b) => b.length - a.length)[0];

const noop = () => {};

// Unlike the other test files, this stub hands back a live-looking element
// for every lookup instead of null. The interactive renderers - the
// sentence builder, the science simulations, the coding grid - reach into
// the document for the widgets they have just written, and a null there
// aborts them with "Cannot set properties of undefined" before they have
// drawn anything. That would report a harness limitation as an app bug.
const el = () => {
  const node = {
    classList: { add: noop, remove: noop, toggle: noop, contains: () => false },
    style: {}, dataset: {}, appendChild: noop, removeChild: noop, remove: noop,
    removeAttribute: noop, setAttribute: noop, getAttribute: () => null,
    addEventListener: noop, removeEventListener: noop, insertAdjacentHTML: noop,
    textContent: '', innerHTML: '', innerText: '', value: '', checked: false,
    offsetHeight: 0, offsetWidth: 0, offsetLeft: 0, offsetTop: 0,
    scrollIntoView: noop, focus: noop, blur: noop, click: noop,
    parentElement: null, parentNode: null, firstChild: null, children: [],
    childNodes: [], nextSibling: null, previousSibling: null,
    getBoundingClientRect: () => ({ left: 0, top: 0, right: 100, bottom: 100, width: 100, height: 100 }),
    getContext: () => null, closest: () => null, contains: () => false,
    cloneNode: () => el(), replaceWith: noop, after: noop, before: noop,
    setPointerCapture: noop, releasePointerCapture: noop, animate: () => ({ finished: Promise.resolve(), cancel: noop })
  };
  node.querySelector = () => el();
  node.querySelectorAll = () => [];
  node.appendChild = child => child;
  return node;
};

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
    getElementById: () => el(), querySelector: () => el(), querySelectorAll: () => [],
    createElement: el, createTextNode: () => el(), createElementNS: el,
    body: el(), head: el(), addEventListener: noop, removeEventListener: noop,
    documentElement: el(), activeElement: null
  },
  getComputedStyle: () => ({ getPropertyValue: () => '' }),
  SVGElement: function () {},
  // The card handed to a renderer must be a real element, not a bare
  // object with an innerHTML on it. The sentence builder and the coding
  // grid stash the expected answer on card.dataset before wiring up their
  // drag handlers, and a card without a dataset throws there.
  __card: () => el(),
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

const SUBJECTS = {
  English: {
    gen: 'generateWordQuestion', render: 'renderWordQuestion',
    skills: ['phonics', 'sight', 'spell', 'grammar', 'vocab', 'sentence',
             'comprehension', 'poetry', 'story', 'paragraph', 'punct']
  },
  Science: {
    gen: 'generateScienceQuestion', render: 'renderScienceQuestion',
    skills: ['living', 'material', 'forces', 'earth', 'body', 'senses',
             'plants', 'animals', 'seasons', 'sound', 'light']
  },
  Malay: {
    gen: 'generateMalayQuestion', render: 'renderMalayQuestion',
    skills: ['huruf', 'nombor', 'salam', 'warna', 'keluarga', 'haiwan',
             'badan', 'makanan', 'hari', 'ayat']
  },
  Coding: {
    gen: 'generateCodeQuestion', render: 'renderCodeQuestion',
    skills: ['cseq', 'cloop', 'ccond', 'cvar', 'cdebug', 'cevent', 'cfunc']
  },
  Math: {
    gen: 'generateMathQuestion', render: 'renderMathQuestion',
    skills: ['count', 'nbond', 'add', 'sub', 'cmp', 'pat', 'wp1', 'shp',
             'add100', 'sub100', 'mul', 'div', 'frac1', 'money', 'time1', 'pgraph', 'lenmass',
             'add10k', 'sub10k', 'advmul', 'divrem', 'fracadd', 'area', 'angle', 'bargraph',
             'bignum', 'multiop', 'factor', 'mixfrac', 'decimal', 'symm', 'dataan', 'multiwp']
  }
};

Object.keys(SUBJECTS).forEach(subject => {
  const s = SUBJECTS[subject];
  const res = run(`
    (function () {
      var genName = ${JSON.stringify(s.gen)}, renderName = ${JSON.stringify(s.render)};
      var gen, render;
      try { gen = eval(genName); } catch (e) { return { unavailable: 'generator ' + genName }; }
      if (typeof gen !== 'function') return { unavailable: 'generator ' + genName };
      try { render = eval(renderName); } catch (e) { render = null; }

      var skills = ${JSON.stringify(s.skills)};
      var bad = {}, checked = 0, withOptions = 0, rendered = 0;
      function note(k) { bad[k] = (bad[k] || 0) + 1; }

      // Compare loosely: an option may be the number 4 while the answer
      // is the string "4", and the click handler treats those as equal.
      function same(a, b) {
        if (a === b) return true;
        if (a === null || b === null || a === undefined || b === undefined) return false;
        if (typeof a === 'object' || typeof b === 'object') return false;
        return String(a) === String(b);
      }
      function label(o) {
        if (o !== null && typeof o === 'object') return o.name || o.text || o.label || o.word || JSON.stringify(o);
        return o;
      }

      for (var si = 0; si < skills.length; si++) {
        var skill = skills[si];
        for (var lvl = 0; lvl <= 4; lvl++) {
          state.skills = {};
          if (typeof getSkillState === 'function') getSkillState(skill).level = lvl;
          for (var i = 0; i < 60; i++) {
            var q;
            try { q = gen(skill, null); } catch (e) {
              note(skill + ': generator threw "' + String(e.message).slice(0, 50) + '"');
              continue;
            }
            if (!q || typeof q !== 'object') { note(skill + ': generator returned nothing'); continue; }
            checked++;

            // 4. There must be an answer at all. What she actually reads
            //    is checked after rendering below, because a stray
            //    undefined can come from the renderer just as easily as
            //    from the generator.
            if (q.answer === undefined || q.answer === null) note(skill + ':' + q.type + ' has no answer');
            else if (typeof q.answer === 'number' && !isFinite(q.answer)) note(skill + ':' + q.type + ' answer is ' + q.answer);

            // 1-3. Choices must contain the answer exactly once, no repeats.
            if (Array.isArray(q.options) && q.options.length) {
              withOptions++;
              var labels = q.options.map(label);
              var hits = labels.filter(function (o) { return same(o, q.answer); }).length;
              // Some renderers key the answer off a nested field rather
              // than q.answer, so accept a match on any of those too.
              if (hits === 0 && q.shape) hits = labels.filter(function (o) { return same(o, q.shape.name); }).length;
              if (hits === 0) note(skill + ':' + q.type + ' answer "' + q.answer + '" is not among its ' + labels.length + ' choices');
              else if (hits > 1) note(skill + ':' + q.type + ' answer appears ' + hits + ' times in the choices');

              var seen = {}, dupes = 0;
              labels.forEach(function (o) { var k = String(o); if (seen[k]) dupes++; seen[k] = true; });
              if (dupes) note(skill + ':' + q.type + ' offers the same choice twice');

              if (labels.some(function (o) { return o === undefined || o === null || String(o) === 'undefined'; })) {
                note(skill + ':' + q.type + ' has an empty choice');
              }
            }

            // 5. The card must actually draw something.
            if (render) {
              var card = __card();
              var handled;
              try { handled = render(card, q); } catch (e) {
                note(skill + ':' + q.type + ' renderer threw "' + String(e.message).slice(0, 40) + '"');
                continue;
              }
              rendered++;
              // What she actually reads on screen. A stray "undefined" here
              // is the most visible way a generated question can look
              // broken to a six year old, and it can be introduced at any
              // point between the generator and the card.
              var leak = String(card.innerHTML).match(/undefined|NaN|\\[object Object\\]/);
              if (leak) note(skill + ':' + q.type + ' shows "' + leak[0] + '" on the card');

              if (handled === false) note(skill + ' emits unrenderable type "' + q.type + '"');
              else if (!card.innerHTML) note(skill + ':' + q.type + ' renders an empty card');
            }
          }
        }
      }
      return { bad: Object.keys(bad).map(function (k) { return k + ' (x' + bad[k] + ')'; }),
               checked: checked, withOptions: withOptions, rendered: rendered };
    })()
  `);

  ok(subject + ': every question is answerable and renders',
     !res.unavailable && res.bad.length === 0,
     res.unavailable ? ('NOT EXPOSED: ' + res.unavailable + ' - test could not run')
       : (res.bad.length ? res.bad.slice(0, 6).join(' | ')
          : res.checked + ' questions, ' + res.withOptions + ' with choices, ' + res.rendered + ' rendered'));
});

// ---- report ----
console.log('\n============ WHOLE-APP ANSWERABILITY SWEEP ============\n');
let pass = 0, fail = 0;
R.forEach(r => {
  console.log((r.pass ? '  PASS  ' : '> FAIL <') + ' ' + r.name + (r.extra ? '\n            [' + r.extra + ']' : ''));
  r.pass ? pass++ : fail++;
});
console.log('\n  ' + pass + ' passed, ' + fail + ' failed, ' + R.length + ' total\n');
process.exit(fail ? 1 : 0);
