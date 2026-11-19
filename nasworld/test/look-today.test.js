// The look (colour schemes and typefaces), the original layout, the daily
// seed and the streak milestones. These replaced a purple theme, a lucky
// spin and random prizes, so the tests pin down the parts that
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
ok('Look: default is Oat and indigo, Fredoka, Andika', run('state.settings = {}; JSON.stringify(getLook())') === '{"tone":"oat","titleFont":"Fredoka","readFont":"Andika"}');
ok('Look: an unknown saved value falls back to the default', run('state.settings = { tone: "neon", titleFont: "Comic", readFont: 7 }; getLook().tone + getLook().titleFont + getLook().readFont') === 'oatFredokaAndika');
ok('Look: four colour schemes and four faces for each role', run('LOOK_TONES.length === 4 && LOOK_TITLE_FONTS.length === 4 && LOOK_READ_FONTS.length === 4'));
{
  const tones = run('LOOK_TONES.map(function (t) { return t.id; })').filter(t => t !== 'oat');
  const missing = tones.filter(t => styles[6].indexOf(':root[data-tone="' + t + '"]') === -1);
  ok('Look: every scheme offered in Settings is defined in app-7.css', missing.length === 0, missing.join(', '));
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
  // A full-size ::before or ::after with a solid fill sits on top of its
  // element and hides what is inside. This happened to the world cards.
  const sheets = [...all.matchAll(/([^{}]*::?(?:before|after)[^{}]*)\{([^{}]*)\}/g)]
    .filter(m => /inset:\s*0\b/.test(m[2]) && /background:\s*var\(--(bg-card|bg-deep|bg-mid|accent)\)/.test(m[2])).map(m => m[1].trim());
  ok('Styles: no solid overlay covers a card', sheets.length === 0, sheets.join(' | '));
  ok('Styles: no text-shadow or backdrop blur', !/text-shadow|backdrop-filter/.test(all));
  ok('Styles: no glow shadows', !/box-shadow:[^;]*(?<!0 )\b0 0 [1-9]\d*px/.test(all));  // a blur with no offset; "0 0 0 2px" is a ring, not a glow
  ok('Styles: no uppercase tracked labels survive', /\[class\] \{ text-transform: none; letter-spacing: 0; \}/.test(styles[6]));
  const loops = (all.match(/animation:[^;]*infinite/g) || []).filter(a => /float|pulse-glow|twinkle|surprise-|banner-shine/.test(a));
  ok('Styles: no decorative looping animation', loops.length === 0, loops.join(' | '));
  const rgbaLit = (styles.slice(1, 6).join('\n').match(/rgba\(\s*(?!0\s*,\s*0\s*,\s*0)\d/g) || []).length;
  ok('Styles: tints come from tokens, not literal rgba', rgbaLit === 0, rgbaLit + ' literal rgba');
}

// ---- The original layout, on the new canvas ----
{
  const html = fs.readFileSync(__dirname + '/../index.html', 'utf8');
  const home = html.slice(html.indexOf('id="screen-home"'), html.indexOf('id="screen-group-practice"'));
  const onHome = ['math-world', 'word-world', 'malay-world', 'stem-world', 'play', 'group-practice', 'group-corner', 'group-learning'];
  const missing = onHome.filter(t => home.indexOf("showScreen('" + t + "')") === -1);
  ok('Home: eight world cards, the four subjects first', missing.length === 0 && (home.match(/class="world-card /g) || []).length === 8 &&
     home.indexOf("showScreen('math-world')") < home.indexOf("showScreen('play')"), missing.join(', '));
  // Consolidating must not lose anything: every place that had a card is still reachable.
  const everywhere = ['practice', 'exam', 'garden', 'stasha', 'compass', 'mirror', 'strategies', 'mega-map', 'sim-hub', 'settings', 'achievements', 'parent-digest'];
  const lost = everywhere.filter(t => html.indexOf("showScreen('" + t + "')") === -1);
  ok('Home: nothing was lost in the consolidation', lost.length === 0, lost.join(', '));
  ok('Home: each group card opens a screen that exists', ['group-practice', 'group-corner', 'group-learning'].every(g => html.indexOf('id="screen-' + g + '"') !== -1));
  ok('Home: every id the page scripts write to still exists exactly once', ['level-text', 'achievement-badge-count', 'streak-count', 'token-count', 'garden-progress', 'mega-progress', 'math-progress', 'word-progress', 'stem-progress', 'malay-progress', 'story-progress-area', 'achievement-showcase', 'dynamic-quest-area', 'wotd-banner', 'daily-seed-area', 'daily-treats-area', 'streak-calendar-area', 'challenges-grid', 'version-banner', 'lumi-speech'].every(id => html.split('id="' + id + '"').length === 2));
  ok('Home: the order is Lumi, the Today panel, the world cards, treats, challenges',
     home.indexOf('class="lumi-container"') < home.indexOf('class="today-panel"') && home.indexOf('class="today-panel"') < home.indexOf('class="worlds-grid"') &&
     home.indexOf('class="worlds-grid"') < home.indexOf('id="daily-treats-area"') && home.indexOf('id="daily-treats-area"') < home.indexOf('id="challenges-grid"'));
  ok('Home: word of the day appears once', code.indexOf('Word of the Day \' + ttsB') === -1 && home.split('id="wotd-banner"').length === 2);
  ok('Challenges: open and unfinished first, then the nearest lock, then finished', run('challengeRank(true, false, 20) < challengeRank(false, false, 3) && challengeRank(false, false, 3) < challengeRank(false, false, 8) && challengeRank(false, false, 99) < challengeRank(true, true, 1)'));
  ok('Home: the seed sits where the spin was', home.indexOf('id="daily-seed-area"') > 0 && home.indexOf('daily-spin-area') === -1);
  ok('Home: the Home button is the plain original', /class="home-btn" onclick="showScreen\('home'\)"/.test(html));
  ok('Removed: the book and Today modules are gone, not left as dead code', ['book', 'book-scenes', 'today', 'icons'].every(f => !fs.existsSync(__dirname + '/../src/ui/' + f + '.js') && html.indexOf('src/ui/' + f + '.js') === -1));
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
