/* ===========================================================================
   GeoGames - Shell

   Boot, routing and the screens that are not a game: home, setup, results,
   the player roster and settings. Games live in games/, the play loop lives in
   screens/play.js, the atlas lives in screens/explore.js.
   =========================================================================== */

import { COUNTRIES, BY_ISO } from './data/countries.js';
import { prepareShapes } from './engine/geo.js';
import { el, clear, fmt, flagImg, toast, modal, confetti, pick, hashSeed } from './engine/ui.js';
import { sound } from './engine/audio.js';
import { Store, todayIso } from './engine/store.js';
import { Session, DIFFICULTY, MODES, dailySeed } from './engine/session.js';
import { ALL_GAMES, GAMES, GAME_BY_ID, grandTour } from './games/index.js';
import { playScreen } from './screens/play.js';
import { exploreScreen } from './screens/explore.js';
import { GlobeView } from './engine/globe-view.js';

const root = document.getElementById('app');

const REGIONS = [
  { id: 'all', name: 'The whole world', emoji: '🌍' },
  { id: 'europe', name: 'Europe', emoji: '🏰' },
  { id: 'africa', name: 'Africa', emoji: '🦁' },
  { id: 'asia', name: 'Asia', emoji: '🏯' },
  { id: 'americas', name: 'Americas', emoji: '🗽' },
  { id: 'oceania', name: 'Oceania', emoji: '🏝️' },
];

const PLAYER_COLOURS = ['#4cc9f0', '#ef476f', '#ffd166', '#06d6a0', '#b388ff', '#f7854a', '#ff7ab6', '#8ecae6'];
const PLAYER_EMOJI = ['🦊', '🐙', '🦅', '🐼', '🦖', '🦩', '🐝', '🦉', '🐬', '🦜', '🐨', '🦈'];

let data = null;
let currentScreen = null;
let pendingSession = null;
let lastResults = null;

/* ── boot ──────────────────────────────────────────────────────────────────
   The shape file is the only thing fetched at runtime, so a failure there is
   the one loading error worth explaining properly. */
boot();

async function boot() {
  try {
    const res = await fetch(new URL('./data/shapes.json', import.meta.url));
    if (!res.ok) throw new Error(`shapes.json returned ${res.status}`);
    const raw = await res.json();
    data = {
      countries: COUNTRIES,
      byIso: BY_ISO,
      shapes: prepareShapes(raw),
    };
    window.addEventListener('hashchange', route);
    route();
  } catch (err) {
    console.error(err);
    clear(root).appendChild(el('div', { class: 'boot-error' }, [
      el('h1', { text: 'The map data did not load' }),
      el('p', { text: 'GeoGames needs data/shapes.json, which has to be served over http rather than opened as a file.' }),
      el('p', { class: 'boot-detail', text: String(err.message || err) }),
      el('p', { text: 'If you are running this locally, try: python3 -m http.server, then open the printed address.' }),
    ]));
  }
}

/* ── routing ───────────────────────────────────────────────────────────── */
function route() {
  const hash = (location.hash || '#/').slice(2);
  const [name, arg] = hash.split('/');
  if (currentScreen && currentScreen.teardown) {
    try { currentScreen.teardown(); } catch { /* already gone */ }
  }
  currentScreen = null;
  window.scrollTo(0, 0);

  switch (name) {
    case 'setup':   return setupScreen(arg);
    case 'play':    return startPlay();
    case 'results': return resultsScreen();
    case 'explore': return (currentScreen = exploreScreen(root, { data, onBack: () => go('') }));
    default:        return homeScreen();
  }
}

function go(path) { location.hash = '#/' + path; }

/* ═══════════════════════════════════════════════════════════════════════════
   HOME
   ═══════════════════════════════════════════════════════════════════════════ */
function homeScreen() {
  const players = Store.players();
  const stats = Store.allStats();
  const totalPlays = Object.values(stats).reduce((s, x) => s + x.plays, 0);
  const visited = Store.visited().length;

  const heroGlobe = el('div', { class: 'hero-globe' });

  const daily = dailyPick();
  const dailyDone = Store.daily(todayIso());

  const page = el('div', { class: 'home' }, [
    el('header', { class: 'hero' }, [
      heroGlobe,
      el('div', { class: 'hero-copy' }, [
        el('a', { class: 'up-link', href: '../index.html', text: '← Jolly Good Learning' }),
        el('h1', {}, [el('span', { class: 'wordmark', text: 'GeoGames' })]),
        el('p', { class: 'lede', text: 'Eight games about the whole planet. Flags, capitals, coastlines, borders and seven centuries of history, on a globe you can spin.' }),
        el('div', { class: 'hero-cta' }, [
          el('button', {
            class: 'btn btn-primary btn-lg', type: 'button',
            onclick: () => { sound.click(); go('setup/grand-tour'); },
          }, [el('span', { text: '🎪 Start a Grand Tour' })]),
          el('button', {
            class: 'btn btn-ghost btn-lg', type: 'button', text: '🌍 Explore the world',
            onclick: () => { sound.click(); go('explore'); },
          }),
        ]),
        el('p', { class: 'hero-note', text: 'One device, any number of players. Nothing is uploaded anywhere.' }),
      ]),
    ]),

    // Daily challenge
    el('section', { class: 'section' }, [
      el('div', { class: 'daily', style: { '--accent': daily.game.accent } }, [
        el('div', { class: 'daily-stamp' }, [
          el('span', { text: 'DAILY' }),
          el('strong', { text: todayIso().slice(5) }),
        ]),
        el('div', { class: 'daily-body' }, [
          el('h3', { text: `Today: ${daily.game.title}` }),
          el('p', { text: `${REGIONS.find(r => r.id === daily.region).name} · the same questions for everyone, everywhere, today.` }),
          dailyDone ? el('p', { class: 'daily-done', text: `Your best today: ${fmt.int(dailyDone.best)} points.` }) : null,
        ]),
        el('button', {
          class: 'btn btn-primary', type: 'button', text: dailyDone ? 'Play again' : 'Play',
          onclick: () => {
            sound.click();
            startSession(daily.game, {
              ...defaultConfig(),
              region: daily.region,
              rounds: 10,
            }, rosterPlayers(), 'solo', dailySeed(daily.game.id), { daily: true });
          },
        }),
      ]),
    ]),

    // Games
    el('section', { class: 'section' }, [
      el('div', { class: 'section-head' }, [
        el('h2', { text: 'The games' }),
        el('p', { text: 'Any of them work solo, pass-and-play or in teams.' }),
      ]),
      el('div', { class: 'game-grid' }, ALL_GAMES.map(gameCard)),
    ]),

    // Players
    el('section', { class: 'section' }, [
      el('div', { class: 'section-head' }, [
        el('h2', { text: 'Players' }),
        el('button', { class: 'btn btn-ghost btn-sm', type: 'button', text: '+ Add', onclick: () => addPlayerDialog(homeScreen) }),
      ]),
      players.length
        ? el('div', { class: 'player-strip' }, players.map(p => playerChip(p, homeScreen)))
        : el('p', { class: 'muted', text: 'Add everyone who is playing and the games will take it in turns. Or just hit start and play solo.' }),
    ]),

    // Progress
    el('section', { class: 'section' }, [
      el('div', { class: 'section-head' }, [el('h2', { text: 'Your record' })]),
      el('div', { class: 'stat-row wide' }, [
        bigStat(fmt.int(totalPlays), 'games played'),
        bigStat(`${visited}`, 'of 194 named right'),
        bigStat(fmt.int(Object.values(stats).reduce((s, x) => s + x.best, 0)), 'best scores added up'),
      ]),
      shakyPanel(),
    ]),

    el('footer', { class: 'foot' }, [
      el('p', {}, [
        'Country outlines from ',
        el('a', { href: 'https://www.naturalearthdata.com/', target: '_blank', rel: 'noopener', text: 'Natural Earth' }),
        ' (public domain). Flags and country facts shared with the ',
        el('a', { href: '../atlas/index.html', text: 'Family Atlas' }),
        '. Full credits in ',
        el('a', { href: 'NOTICE.md', text: 'NOTICE.md' }),
        '.',
      ]),
      el('p', { class: 'muted' }, [
        'Everything is stored in this browser only. ',
        el('button', { class: 'linkish', type: 'button', text: 'Settings', onclick: settingsDialog }),
        ' · ',
        el('button', { class: 'linkish', type: 'button', text: 'Clear my data', onclick: confirmReset }),
      ]),
    ]),
  ]);

  clear(root).appendChild(page);

  // A slowly turning globe behind the title. Purely decorative, so it is
  // hidden from assistive tech and pauses for reduced-motion users.
  const globe = new GlobeView(heroGlobe, data.shapes, {
    interactive: false,
    dimUnpainted: true,
  });
  globe.setPaint(iso => {
    const c = BY_ISO[iso];
    if (!c) return null;
    return Store.visited().includes(iso) ? '#06d6a0' : {
      europe: '#3b5f97', africa: '#8a5a2a', asia: '#8a3535',
      americas: '#356b45', oceania: '#5a4585',
    }[c.region];
  });
  globe.globe.set(20, 22);
  currentScreen = { teardown: () => globe.destroy() };
}

function gameCard(game) {
  const st = Store.stats(game.id);
  return el('button', {
    class: 'game-card' + (game.mixed ? ' is-feature' : ''),
    type: 'button',
    style: { '--accent': game.accent },
    onclick: () => { sound.click(); go('setup/' + game.id); },
    onmouseenter: () => sound.hover(),
  }, [
    el('span', { class: 'gc-emoji', 'aria-hidden': 'true', text: game.emoji }),
    el('span', { class: 'gc-body' }, [
      el('span', { class: 'gc-title', text: game.title }),
      el('span', { class: 'gc-blurb', text: game.blurb }),
    ]),
    st ? el('span', { class: 'gc-best', text: `best ${fmt.int(st.best)}` }) : el('span', { class: 'gc-best is-new', text: 'new' }),
  ]);
}

function playerChip(p, refresh) {
  return el('button', {
    class: 'player-chip', type: 'button', style: { '--player': p.colour },
    onclick: () => editPlayerDialog(p, refresh),
    'aria-label': `Edit ${p.name}`,
  }, [
    el('span', { class: 'pc-emoji', text: p.emoji }),
    el('span', { class: 'pc-name', text: p.name }),
  ]);
}

function bigStat(value, label) {
  return el('div', { class: 'stat' }, [
    el('span', { class: 'stat-value', text: value }),
    el('span', { class: 'stat-label', text: label }),
  ]);
}

function shakyPanel() {
  const shaky = Store.shaky(10).map(iso => BY_ISO[iso]).filter(Boolean);
  if (shaky.length < 3) return null;
  return el('div', { class: 'shaky' }, [
    el('h3', { text: 'Shaky ground' }),
    el('p', { class: 'muted', text: 'Countries you have got wrong more often than right.' }),
    el('div', { class: 'chip-row' }, shaky.map(c => el('span', { class: 'chip' }, [
      flagImg(c, { size: 'sm' }), el('span', { text: c.name }),
    ]))),
  ]);
}

/* The daily challenge is derived from the date, so every device shows the same
   one without a server telling it to. */
function dailyPick() {
  const seed = hashSeed(todayIso());
  const game = GAMES[seed % GAMES.length];
  // `>>>` (unsigned) not `>>`: hashSeed returns a full 32-bit value, so on the
  // ~43% of dates whose hash has the top bit set, a signed shift would go
  // negative and index REGIONS out of bounds, crashing the whole home screen.
  const region = REGIONS[(seed >>> 8) % REGIONS.length].id;
  return { game, region };
}

/* ═══════════════════════════════════════════════════════════════════════════
   SETUP
   ═══════════════════════════════════════════════════════════════════════════ */
function setupScreen(gameId) {
  const game = GAME_BY_ID[gameId] || grandTour;
  const s = Store.settings();
  const draft = {
    difficulty: s.difficulty,
    region: s.region,
    rounds: s.rounds,
    timer: s.timer,
    steal: s.steal,
    mode: Store.roster().length > 1 ? 'pass' : 'solo',
    roster: new Set(Store.roster().filter(id => Store.players().some(p => p.id === id))),
  };

  function render() {
    const players = Store.players();
    const chosen = players.filter(p => draft.roster.has(p.id));

    const page = el('div', { class: 'setup', style: { '--accent': game.accent } }, [
      el('header', { class: 'setup-head' }, [
        el('button', { class: 'hud-quit', type: 'button', text: '←', 'aria-label': 'Back', onclick: () => go('') }),
        el('div', {}, [
          el('h1', {}, [el('span', { class: 'setup-emoji', text: game.emoji }), game.title]),
          el('p', { class: 'lede', text: game.howTo }),
        ]),
      ]),

      // Who is playing
      el('section', { class: 'card' }, [
        el('h2', { text: 'Who is playing?' }),
        el('div', { class: 'player-strip' }, [
          ...players.map(p => el('button', {
            class: 'player-chip' + (draft.roster.has(p.id) ? ' is-on' : ''),
            type: 'button', style: { '--player': p.colour },
            'aria-pressed': draft.roster.has(p.id) ? 'true' : 'false',
            onclick: () => {
              draft.roster.has(p.id) ? draft.roster.delete(p.id) : draft.roster.add(p.id);
              if (draft.roster.size < 2) draft.mode = 'solo';
              else if (draft.mode === 'solo') draft.mode = 'pass';
              sound.click();
              render();
            },
          }, [
            el('span', { class: 'pc-emoji', text: p.emoji }),
            el('span', { class: 'pc-name', text: p.name }),
            el('span', { class: 'pc-tick', 'aria-hidden': 'true', text: draft.roster.has(p.id) ? '✓' : '' }),
          ])),
          el('button', { class: 'player-chip is-add', type: 'button', onclick: () => addPlayerDialog(render) }, [
            el('span', { class: 'pc-emoji', text: '＋' }),
            el('span', { class: 'pc-name', text: 'Add player' }),
          ]),
        ]),
        chosen.length > 1 ? el('div', { class: 'seg-row' }, Object.entries(MODES)
          .filter(([id]) => id !== 'solo')
          .map(([id, m]) => el('button', {
            class: 'seg' + (draft.mode === id ? ' is-on' : ''), type: 'button',
            'aria-pressed': draft.mode === id ? 'true' : 'false',
            onclick: () => { draft.mode = id; sound.click(); render(); },
          }, [
            el('strong', { text: m.label }),
            el('span', { class: 'seg-sub', text: m.blurb }),
          ]))) : el('p', { class: 'muted', text: chosen.length === 1
            ? `Solo run for ${chosen[0].name}. Pick a second player for pass-and-play.`
            : 'Nobody picked, so this will be an anonymous solo run. That is fine.' }),
      ]),

      // Difficulty
      el('section', { class: 'card' }, [
        el('h2', { text: 'How hard?' }),
        el('div', { class: 'seg-row' }, Object.entries(DIFFICULTY).map(([id, d]) => el('button', {
          class: 'seg' + (draft.difficulty === id ? ' is-on' : ''), type: 'button',
          'aria-pressed': draft.difficulty === id ? 'true' : 'false',
          onclick: () => { draft.difficulty = id; sound.click(); render(); },
        }, [
          el('strong', { text: d.label }),
          el('span', { class: 'seg-sub', text: d.blurb }),
        ]))),
      ]),

      // Region
      el('section', { class: 'card' }, [
        el('h2', { text: 'Where in the world?' }),
        el('div', { class: 'chip-row' }, REGIONS.map(r => el('button', {
          class: 'chip is-choice' + (draft.region === r.id ? ' is-on' : ''), type: 'button',
          'aria-pressed': draft.region === r.id ? 'true' : 'false',
          onclick: () => { draft.region = r.id; sound.click(); render(); },
        }, [el('span', { text: `${r.emoji} ${r.name}` })]))),
      ]),

      // Length and rules
      el('section', { class: 'card' }, [
        el('h2', { text: 'Length and rules' }),
        el('div', { class: 'chip-row' }, [6, 10, 16, 24].map(n => el('button', {
          class: 'chip is-choice' + (draft.rounds === n ? ' is-on' : ''), type: 'button',
          'aria-pressed': draft.rounds === n ? 'true' : 'false',
          onclick: () => { draft.rounds = n; sound.click(); render(); },
        }, [el('span', { text: `${n} questions` })]))),
        el('div', { class: 'switch-row' }, [
          toggle('Timer', draft.timer, v => { draft.timer = v; render(); },
                 'A clock per question, and faster answers score more.'),
          chosen.length > 1
            ? toggle('Steals', draft.steal, v => { draft.steal = v; render(); },
                     'A miss passes to the next player for half points.')
            : null,
        ]),
      ]),

      el('div', { class: 'setup-go' }, [
        el('button', {
          class: 'btn btn-primary btn-xl', type: 'button', text: 'Start',
          onclick: () => {
            Store.setSetting('difficulty', draft.difficulty);
            Store.setSetting('region', draft.region);
            Store.setSetting('rounds', draft.rounds);
            Store.setSetting('timer', draft.timer);
            Store.setSetting('steal', draft.steal);
            Store.setRoster([...draft.roster]);
            sound.click();
            startSession(game, {
              difficulty: draft.difficulty,
              region: draft.region,
              rounds: draft.rounds,
              timer: draft.timer,
              steal: draft.steal,
            }, chosen.length ? chosen : rosterPlayers(), draft.mode);
          },
        }),
      ]),
    ]);
    clear(root).appendChild(page);
  }

  render();
}

function toggle(label, value, onChange, hint) {
  const input = el('input', {
    type: 'checkbox', class: 'switch-input', checked: value ? true : null,
    onchange: e => { sound.click(); onChange(e.target.checked); },
  });
  return el('label', { class: 'switch' }, [
    input,
    el('span', { class: 'switch-ui', 'aria-hidden': 'true' }),
    el('span', { class: 'switch-text' }, [
      el('strong', { text: label }),
      hint ? el('span', { class: 'seg-sub', text: hint }) : null,
    ]),
  ]);
}

function rosterPlayers() {
  return [{ id: 'solo', name: 'You', emoji: '🌍', colour: '#4cc9f0' }];
}

function defaultConfig() {
  const s = Store.settings();
  return { difficulty: s.difficulty, region: s.region, rounds: s.rounds, timer: s.timer, steal: s.steal };
}

/* ═══════════════════════════════════════════════════════════════════════════
   PLAY
   ═══════════════════════════════════════════════════════════════════════════ */
function startSession(game, config, players, mode, seed = undefined, extra = {}) {
  let session;
  try {
    session = new Session({
      game,
      config: { ...config, countries: COUNTRIES, shapes: data.shapes },
      players,
      mode,
      seed,
    });
  } catch (err) {
    console.error(err);
    toast('That game could not be built. Try a wider region or difficulty.', { tone: 'bad' });
    return;
  }

  if (!session.questions.length) {
    toast('Not enough countries for that combination. Try the whole world, or Expert.', { tone: 'bad' });
    return;
  }
  session.extra = extra;
  pendingSession = session;
  go('play');
}

function startPlay() {
  if (!pendingSession) { go(''); return; }
  const session = pendingSession;
  currentScreen = playScreen(root, {
    session,
    data,
    onFinish: s => {
      lastResults = s;
      pendingSession = null;
      const sum = s.summary();
      Store.recordGame(s.game.id, { score: sum.score, correct: sum.correct, asked: sum.asked });
      if (s.extra && s.extra.daily) Store.recordDaily(todayIso(), s.game.id, sum.score);
      go('results');
    },
    onQuit: () => { pendingSession = null; go(''); },
  });
}

/* ═══════════════════════════════════════════════════════════════════════════
   RESULTS
   ═══════════════════════════════════════════════════════════════════════════ */
function resultsScreen() {
  const session = lastResults;
  if (!session) { go(''); return; }
  const standings = session.standings();
  const sum = session.summary();
  const misses = session.log.filter(e => !e.correct);

  const page = el('div', { class: 'results', style: { '--accent': session.game.accent } }, [
    el('header', { class: 'results-head' }, [
      el('p', { class: 'kicker', text: session.game.title }),
      el('h1', { text: headline(session, standings) }),
      el('p', { class: 'lede', text: `${sum.correct} of ${sum.asked} right · ${fmt.int(sum.score)} points · ${Math.round(sum.elapsedMs / 1000)}s` }),
    ]),

    standings.length > 1 ? el('section', { class: 'podium' }, standings.map((p, i) => el('div', {
      class: 'podium-slot' + (i === 0 ? ' is-first' : ''), style: { '--player': p.colour },
    }, [
      el('span', { class: 'podium-rank', text: fmt.ordinal(i + 1) }),
      el('span', { class: 'podium-emoji', text: p.emoji }),
      el('span', { class: 'podium-name', text: p.name }),
      el('span', { class: 'podium-score', text: fmt.int(p.score) }),
      el('span', { class: 'podium-meta', text: `${p.correct}/${p.asked} · best run ${p.bestStreak}` }),
    ]))) : el('section', { class: 'stat-row wide' }, [
      bigStat(fmt.int(sum.score), 'points'),
      bigStat(`${Math.round(sum.accuracy * 100)}%`, 'accuracy'),
      bigStat(String(standings[0] ? standings[0].bestStreak : 0), 'best run'),
    ]),

    misses.length ? el('section', { class: 'section' }, [
      el('div', { class: 'section-head' }, [
        el('h2', { text: 'The ones that got away' }),
        el('p', { text: 'Worth a look before the next round.' }),
      ]),
      el('ul', { class: 'miss-list' }, misses.map(e => {
        const q = e.question;
        const iso = q.iso || (q.answer && q.answer.iso) || (q.odd && q.odd.iso);
        const c = iso ? BY_ISO[iso] : null;
        const g = q.game || session.game;
        // The fact line from a game usually opens with the country name, which
        // the heading already carries. Trim the repeat rather than say it twice.
        const raw = g.factFor ? g.factFor(q) : '';
        const heading = c ? c.name : g.title;
        const fact = raw.startsWith(heading)
          ? raw.slice(heading.length).replace(/^[\s·.,-]+/, '')
          : raw;
        return el('li', { class: 'miss' }, [
          c ? flagImg(c, { size: 'sm' }) : el('span', { class: 'miss-emoji', text: g.emoji }),
          el('div', {}, [
            el('strong', { text: heading }),
            el('span', { class: 'miss-fact', text: fact }),
          ]),
        ]);
      })),
    ]) : null,

    el('div', { class: 'results-cta' }, [
      el('button', {
        class: 'btn btn-primary btn-lg', type: 'button', text: 'Play again',
        onclick: () => {
          sound.click();
          startSession(session.game, session.config, session.players.map(p => ({
            id: p.id, name: p.name, emoji: p.emoji, colour: p.colour,
          })), session.mode);
        },
      }),
      el('button', { class: 'btn btn-ghost btn-lg', type: 'button', text: 'Another game', onclick: () => go('') }),
      el('button', { class: 'btn btn-ghost btn-lg', type: 'button', text: '🌍 Look it up', onclick: () => go('explore') }),
    ]),
  ]);

  clear(root).appendChild(page);
  sound.fanfare();
  confetti({ count: 120, origin: [0.5, 0.3], colours: [session.game.accent, '#ffd166', '#ffffff', '#06d6a0'] });
}

function headline(session, standings) {
  if (standings.length > 1) {
    const [first, second] = standings;
    if (second && first.score === second.score) return 'A dead heat';
    return `${first.name} wins`;
  }
  const pct = session.summary().accuracy;
  if (pct === 1) return 'A clean sweep';
  if (pct >= 0.8) return 'Strong round';
  if (pct >= 0.5) return 'Solid enough';
  return 'Room to grow';
}

/* ═══════════════════════════════════════════════════════════════════════════
   PLAYERS AND SETTINGS
   ═══════════════════════════════════════════════════════════════════════════ */
function addPlayerDialog(refresh) {
  const used = Store.players();
  const name = el('input', { class: 'text-input', type: 'text', maxlength: '16', placeholder: 'Name', 'aria-label': 'Player name' });
  let emoji = pick(PLAYER_EMOJI.filter(e => !used.some(p => p.emoji === e))) || pick(PLAYER_EMOJI);
  let colour = PLAYER_COLOURS.find(c => !used.some(p => p.colour === c)) || pick(PLAYER_COLOURS);

  const emojiRow = el('div', { class: 'picker-row' }, PLAYER_EMOJI.map(e => el('button', {
    class: 'picker' + (e === emoji ? ' is-on' : ''), type: 'button', text: e,
    'aria-label': `Choose ${e}`,
    onclick: ev => {
      emoji = e;
      emojiRow.querySelectorAll('.picker').forEach(b => b.classList.remove('is-on'));
      ev.currentTarget.classList.add('is-on');
    },
  })));

  const colourRow = el('div', { class: 'picker-row' }, PLAYER_COLOURS.map(c => el('button', {
    class: 'picker is-colour' + (c === colour ? ' is-on' : ''), type: 'button',
    style: { background: c }, 'aria-label': `Choose colour ${c}`,
    onclick: ev => {
      colour = c;
      colourRow.querySelectorAll('.picker').forEach(b => b.classList.remove('is-on'));
      ev.currentTarget.classList.add('is-on');
    },
  })));

  const m = modal('Add a player', [
    el('label', { class: 'field' }, [el('span', { text: 'Name' }), name]),
    el('label', { class: 'field' }, [el('span', { text: 'Badge' }), emojiRow]),
    el('label', { class: 'field' }, [el('span', { text: 'Colour' }), colourRow]),
  ], {
    actions: [
      el('button', { class: 'btn btn-ghost', type: 'button', text: 'Cancel', onclick: () => m.close() }),
      el('button', {
        class: 'btn btn-primary', type: 'button', text: 'Add',
        onclick: () => {
          const value = name.value.trim();
          if (!value) { name.focus(); toast('Give them a name first.'); return; }
          Store.addPlayer({ name: value, emoji, colour });
          m.close();
          refresh();
        },
      }),
    ],
  });
  name.addEventListener('keydown', e => {
    if (e.key === 'Enter') { e.preventDefault(); m.panel.querySelector('.btn-primary').click(); }
  });
}

function editPlayerDialog(player, refresh) {
  const name = el('input', { class: 'text-input', type: 'text', maxlength: '16', value: player.name, 'aria-label': 'Player name' });
  const m = modal(`Edit ${player.name}`, [
    el('label', { class: 'field' }, [el('span', { text: 'Name' }), name]),
    el('p', { class: 'muted', text: `${player.emoji} · played under this badge so far.` }),
  ], {
    actions: [
      el('button', {
        class: 'btn btn-ghost is-danger', type: 'button', text: 'Remove',
        onclick: () => {
          if (!window.confirm(`Remove ${player.name}?`)) return;
          Store.removePlayer(player.id);
          m.close();
          refresh();
        },
      }),
      el('button', {
        class: 'btn btn-primary', type: 'button', text: 'Save',
        onclick: () => {
          Store.updatePlayer(player.id, { name: name.value.trim() || player.name });
          m.close();
          refresh();
        },
      }),
    ],
  });
}

function settingsDialog() {
  const s = Store.settings();
  modal('Settings', [
    toggle('Sound', s.sound !== false, v => Store.setSetting('sound', v), 'Blips, buzzes and the winner fanfare.'),
    toggle('Timer', s.timer !== false, v => Store.setSetting('timer', v), 'Turn it off for a slower, calmer game.'),
    toggle('Map labels', !!s.labels, v => Store.setSetting('labels', v), 'Country names drawn on the globe and map.'),
    el('p', { class: 'muted', text: 'Everything is kept in this browser. There is no account, no server and nothing to sign into.' }),
  ], { actions: [] });
}

function confirmReset() {
  if (!window.confirm('Clear every player, score and record kept in this browser?')) return;
  Store.reset();
  toast('Cleared.');
  homeScreen();
}
