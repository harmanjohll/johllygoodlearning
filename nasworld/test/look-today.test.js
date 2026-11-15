// The look (tones and typefaces), the Today plan, the daily seed and the
// streak milestones. These replaced a purple theme, a fifteen-tile home,
// a lucky spin and random prizes, so the tests pin down the parts that
// must not drift back: nothing left to chance, and no literal colours
// creeping into the stylesheets again.
const fs = require('fs');
const vm = require('vm');

process.on('uncaughtException', e => { if (!/Cannot (set|read) propert/.test(String(e && e.message))) throw e; });
process.on('unhandledRejection', e => { if (!/Cannot (set|read) propert/.test(String(e && e.message))) throw e; });

const html = fs.readFileSync(__dirname + '/../dist/bundle.html', 'utf8');
const code = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m => m[1])
  .sort((a, b) => b.length - a.length)[0];

const noop = () => {};
const mkEl = () => ({
  classList: { add: noop, remove: noop, toggle: noop, contains: () => false },
  style: {}, dataset: {}, appendChild: noop, remove: noop, setAttribute: noop,
  addEventListener: noop, querySelector: () => null, querySelectorAll: () => [],
  insertAdjacentHTML: noop, textContent: '', innerHTML: '', offsetHeight: 0, focus: noop, select: noop,
  getBoundingClientRect: () => ({ left: 0, top: 0, width: 100, height: 100 })
});
const store = {};
const sandbox = {
  console, setTimeout: (f) => 0, clearTimeout: noop, setInterval: () => 1, clearInterval: noop,
  requestAnimationFrame: noop, Math, Date, JSON, Set, Map, Object, Array, String, Number, Boolean,
  isFinite, isNaN, parseInt, parseFloat, RegExp, Error, encodeURIComponent,
  AbortController: function () { this.abort = noop; this.signal = null; },
  fetch: () => Promise.reject(new Error('offline')), navigator: { onLine: false },
  localStorage: { getItem: k => (k in store ? store[k] : null), setItem: (k, v) => { store[k] = String(v); }, removeItem: k => { delete store[k]; } },
  document: { getElementById: () => null, querySelector: () => null, querySelectorAll: () => [], createElement: mkEl, body: mkEl(), addEventListener: noop, documentElement: mkEl() },
  window: {}
};
sandbox.window = sandbox; sandbox.globalThis = sandbox;
vm.createContext(sandbox);
try { vm.runInContext(code, sandbox); } catch (e) {}
vm.runInContext('state = state || {}; state.tokens = 0; state.skills = {};', sandbox);


const R = [];
const ok = (n, c, e = '') => R.push({ n, p: !!c, e });
const run = (c) => vm.runInContext(c, sandbox);
const styles = [1, 2, 3, 4, 5, 6, 7].map(i => fs.readFileSync(__dirname + '/../styles/app-' + i + '.css', 'utf8'));

// ---- Look ----
ok('Look: default is Japandi, Fredoka, Andika', run('state.settings = {}; JSON.stringify(getLook())') === '{"tone":"japandi","titleFont":"Fredoka","readFont":"Andika"}');
ok('Look: an unknown saved value falls back to the default', run('state.settings = { tone: "neon", titleFont: "Comic", readFont: 7 }; getLook().tone + getLook().titleFont + getLook().readFont') === 'japandiFredokaAndika');
ok('Look: four tones and four faces for each role', run('LOOK_TONES.length === 4 && LOOK_TITLE_FONTS.length === 4 && LOOK_READ_FONTS.length === 4'));
{
  const tones = run('LOOK_TONES.map(function (t) { return t.id; })').filter(t => t !== 'japandi');
  const missing = tones.filter(t => styles[6].indexOf(':root[data-tone="' + t + '"]') === -1);
  ok('Look: every tone offered in Settings is defined in app-7.css', missing.length === 0, missing.join(', '));
  const html = fs.readFileSync(__dirname + '/../index.html', 'utf8');
  const fonts = run('LOOK_TITLE_FONTS.concat(LOOK_READ_FONTS).map(function (f) { return f.id; })');
  const unloaded = fonts.filter(f => html.indexOf('family=' + f.replace(/ /g, '+')) === -1 && html.indexOf('&family=' + f.replace(/ /g, '+')) === -1);
  ok('Look: every typeface offered is loaded by index.html', unloaded.length === 0, unloaded.join(', '));
}

// ---- No slop creeping back into the stylesheets ----
{
  const all = styles.join('\n');
  // Avatar backdrops are pictures, not chrome.
  const chrome = all.split('\n').filter(l => l.indexOf('.stasha-stage.bg-') === -1).join('\n');
  ok('Styles: no gradients in the chrome', !/gradient\(/.test(chrome), (chrome.match(/[^\n]*gradient\([^\n]*/) || [''])[0].slice(0, 90));
  ok('Styles: no text-shadow or backdrop blur', !/text-shadow|backdrop-filter/.test(all));
  ok('Styles: no glow shadows', !/box-shadow:[^;]*(?<!0 )\b0 0 [1-9]\d*px/.test(all));  // a blur with no offset; "0 0 0 2px" is a ring, not a glow
  ok('Styles: no uppercase tracked labels survive', /\[class\] \{ text-transform: none; letter-spacing: 0; \}/.test(styles[6]));
  const loops = (all.match(/animation:[^;]*infinite/g) || []).filter(a => /float|pulse-glow|twinkle|surprise-|banner-shine/.test(a));
  ok('Styles: no decorative looping animation', loops.length === 0, loops.join(' | '));
  const rgbaLit = (styles.slice(1, 6).join('\n').match(/rgba\(\s*(?!0\s*,\s*0\s*,\s*0)\d/g) || []).length;
  ok('Styles: tints come from tokens, not literal rgba', rgbaLit === 0, rgbaLit + ' literal rgba');
}

// ---- Icons ----
{
  const html = fs.readFileSync(__dirname + '/../index.html', 'utf8');
  const used = [...html.matchAll(/data-icon="([a-z]+)"/g)].map(m => m[1]);
  const unknown = [...new Set(used)].filter(n => !run('icon("' + n + '")'));
  ok('Icons: every icon named in index.html is drawn', used.length > 15 && unknown.length === 0, unknown.join(', '));
  const home = html.slice(html.indexOf('id="screen-home"'), html.indexOf('<!-- MATH WORLD SCREEN'));
  ok('Home: no emoji and no exclamation marks in the markup', !/&#1\d{5};|[\u{1F300}-\u{1FAFF}]/u.test(home) && home.replace(/<!--[\s\S]*?-->/g, '').indexOf('!') === -1);
  ok('Home: Today has its own page in the book, and a ribbon to reach it', home.indexOf('data-view="today"') > 0 && home.indexOf('id="book-ribbon"') > 0);
}

// ---- Today ----
{
  run('state.skills = {}; delete state.today;');
  const plan = run('JSON.stringify(getTodayPlan().steps)');
  const steps = JSON.parse(plan);
  ok('Today: three steps for a new learner', steps.length === 3, plan);
  ok('Today: each step is from a different world', new Set(steps.map(s => s.world)).size === steps.length, plan);
  ok('Today: the plan does not reshuffle within the day', run('JSON.stringify(getTodayPlan().steps)') === plan);
  ok('Today: never offers a skill she cannot open', steps.every(s => run('isSkillUnlocked((MATH_TREE["' + s.id + '"] || WORD_TREE["' + s.id + '"] || MALAY_TREE["' + s.id + '"] || STEM_TREE["' + s.id + '"]))')), plan);
  ok('Today: never offers unreviewed Malay', run('getTodayPlan().steps.every(function (s) { return !(MALAY_TREE[s.id] && MALAY_TREE[s.id].awaitingReview); })'));
  run('todayMarkDone("' + steps[0].id + '")');
  ok('Today: finishing a session ticks its step, and only that step', run('getTodayPlan().steps.filter(function (s) { return s.done; }).length') === 1);
  run('state.today.date = "Thu Jan 01 2026";');
  ok('Today: a new day gets a new plan with nothing ticked', run('getTodayPlan().steps.every(function (s) { return !s.done; }) && state.today.date === new Date().toDateString()'));
  // Something started and weak should come before something brand new.
  run('state.skills = {}; delete state.today; getSkillState("add").totalAttempts = 20; getSkillState("add").mastery = 30;');
  ok('Today: a weak skill she has started is chosen for its world', run('getTodayPlan().steps.some(function (s) { return s.id === "add"; })'), run('JSON.stringify(getTodayPlan().steps)'));
  run('state.skills = {}; delete state.today;');
}

// ---- The book ----
{
  run('state.skills = {};');
  const chapters = run('BOOK_CHAPTERS.map(function (c) { return c.id; }).join(",")');
  ok('Book: four chapters, one per world', chapters === 'math,word,malay,stem');
  // Every skill in every tree must be a stop somewhere, exactly once.
  const lost = run('(function () { var bad = []; BOOK_CHAPTERS.forEach(function (c) { var seen = {}; bookParts(c).forEach(function (p) { p.stops.forEach(function (s) { seen[s.id] = (seen[s.id] || 0) + 1; }); }); Object.keys(c.tree()).forEach(function (id) { if (seen[id] !== 1) bad.push(id); }); }); return bad.join(","); })()');
  ok('Book: every skill is a stop on exactly one map', lost === '', lost);
  const off = run('(function () { var bad = 0; for (var n = 1; n <= 20; n++) bookPathPoints(n).forEach(function (p) { if (!(p.x >= 12 && p.x <= 88 && p.y >= 8 && p.y <= 92)) bad++; }); return bad; })()');
  ok('Book: stops stay inside the picture for any number of stops', off === 0, off + ' off the page');
  ok('Book: the path climbs from the bottom of the picture to the top', run('(function () { var p = bookPathPoints(9); for (var i = 1; i < p.length; i++) if (p[i].y >= p[i - 1].y) return false; return true; })()'));
  ok('Book: a new learner starts at the first stop of Part 1', run('bookNextStop(bookParts(BOOK_CHAPTERS[0])[0].stops)') === run('Object.keys(MATH_TREE)[0]'));
  run('getSkillState("count").mastery = 90; getSkillState("count").totalAttempts = 20;');
  ok('Book: a finished stop is marked done and Lumi moves on', run('bookStopStatus(MATH_TREE.count)') === 'done' && run('bookNextStop(bookParts(BOOK_CHAPTERS[0])[0].stops)') !== 'count');
  ok('Book: unreviewed Malay shows as being checked, not open', run('bookStopStatus(MALAY_TREE.imbuhan)') === 'checking');
  ok('Book: every chapter and the cover has a picture', run('["cover","math","word","malay","stem"].every(function (id) { return bookScene(id).length > 500; })'));
  ok('Book: every page it can turn to exists in the markup', run('BOOK_ORDER.join(",")').split(',').every(v => ['contents', 'math', 'word', 'malay', 'stem'].indexOf(v) !== -1 || fs.readFileSync(__dirname + '/../index.html', 'utf8').indexOf('data-view="' + v + '"') !== -1));
  run('state.skills = {};');
}

// ---- Daily seed ----
{
  // The DOM stub has no top bar; planting must not depend on one here.
  run('updateUI = function () {}; renderDailySeed = function () {}; saveState = function () {}; playSound = function () {};');
  run('delete state._seedEarnedDay; delete state._seedPlantedDay; state.garden = [];');
  ok('Seed: waiting until she has finished something', run('dailySeedStatus()') === 'waiting');
  run('plantDailySeed()');
  ok('Seed: cannot be planted before it is earned', run('state.garden.length') === 0);
  run('markDailyEffort()');
  ok('Seed: ready once she finishes an activity', run('dailySeedStatus()') === 'ready');
  run('plantDailySeed(); plantDailySeed(); plantDailySeed();');
  ok('Seed: exactly one flower, however many times she taps', run('state.garden.length') === 1 && run('dailySeedStatus()') === 'planted');
  ok('Spin: the lucky spin is gone', run('typeof triggerDailyLuckySpin') === 'undefined' && code.indexOf('Daily Lucky Spin!') === -1);
}

// ---- Milestones, not dice ----
{
  const body = run('rollForSurprise.toString()');
  ok('Prizes: nothing after a correct answer is left to chance', !/Math\.random|\.chance/.test(body));
  const hits = [];
  for (let s = 1; s <= 25; s++) if (run('!!milestoneForStreak(' + s + ')')) hits.push(s);
  ok('Prizes: celebrations fall on streaks of 5, 10, 15 and 20 only', hits.join(',') === '5,10,15,20', hits.join(','));
  ok('Prizes: the gambles are not wired to any milestone', !/MysteryBox|BonusRain|LuckyStreak|GoldenQuestion|TimeWarp|ShootingStar/.test(run('Object.keys(STREAK_MILESTONES).map(function (k) { return STREAK_MILESTONES[k].toString(); }).join(" ")')));
}

const failed = R.filter(r => !r.p);
R.forEach(r => console.log((r.p ? '  ok   ' : '> FAIL < ') + r.n + (r.p || !r.e ? '' : '  [' + r.e + ']')));
console.log('\n  ' + (R.length - failed.length) + ' passed, ' + failed.length + ' failed, ' + R.length + ' total');
process.exit(failed.length ? 1 : 0);
