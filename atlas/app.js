/* ===========================================================================
   Family Atlas — Shell controller
   Renders the passport home, session setup, the play arena (pass-and-play),
   the boarding-pass results, and each traveller's passport page. Talks to the
   engine through Session; knows nothing about how a game builds a question.
   =========================================================================== */

import { Router } from './engine/router.js';
import { Profiles, levelProgress } from './engine/profiles.js';
import { Session } from './engine/session.js';
import { Store } from './engine/storage.js';
import { GAMES, CATEGORIES, gameById } from './engine/registry.js';
import { REGIONS, COUNTRIES, BY_ISO } from './data/countries.js';
import { RANKS, RANK_ORDER } from './data/tiers.js';
import { subjectPool } from './engine/pool.js';
import { BADGES } from './engine/gamification.js';
import { challengeFor, todayIso } from './data/challenges.js';
import { el, clear, flagImg, timerBar, toast, stampBurst } from './engine/ui.js';

const app = document.getElementById('app');
const backBtn = document.getElementById('backBtn');

const REGION_META = Object.fromEntries(REGIONS.map(r => [r.id, r]));
const REGION_VAR = { europe: '--r-europe', africa: '--r-africa', asia: '--r-asia', americas: '--r-americas', oceania: '--r-oceania' };
const CAT_VAR = { Countries: '--stamp-teal', Flags: '--stamp-blue', Capitals: '--stamp-red' };
const BADGE_EMOJI = { 'first-steps': '🥾', globetrotter: '🌍', comeback: '💪', 'week-streak': '📅', cartographer: '🧭' };

// Session-setup draft (lives only while arranging a game).
const draft = {
  players: [],          // ordered playerIds
  gameId: 'flags/guess-the-flag',
  region: 'all',
  mode: 'solo',
  teamOf: {},           // playerId -> 'kids' | 'parents'
  seed: null,
};

let session = null;
let sessionStampEvents = [];  // stamps/badges earned this session, for the results page

// ── helpers ─────────────────────────────────────────────────
function screen(node) { clear(app); app.appendChild(node); window.scrollTo(0, 0); }
function showBack(show) { backBtn.style.visibility = show ? 'visible' : 'hidden'; }
function regionColor(id) { return `var(${REGION_VAR[id] || '--stamp-teal'})`; }

function travellerChip(p, { selected, onClick, showRank = true } = {}) {
  return el('button', { class: 'traveller' + (selected ? ' is-sel' : ''), type: 'button', onclick: onClick }, [
    el('span', { class: 'tv-emoji', text: p.emoji }),
    el('span', {}, [
      el('div', { class: 'tv-name', text: p.name }),
      showRank ? el('div', { class: 'tv-meta', text: `Lvl ${p.level} · ${RANKS[p.rank].name}` }) : null,
    ]),
  ]);
}

// ── HOME ─────────────────────────────────────────────────────
function renderHome() {
  showBack(false);
  const players = Profiles.list();
  const root = el('div');

  // Cover hero
  const chal = challengeFor();
  const cover = el('div', { class: 'cover' }, [
    el('div', { class: 'cover-emblem', text: '🧭' }),
    el('div', { class: 'eyebrow', text: 'The Johll Family' }),
    el('h1', {}, [el('span', { class: 'foil', text: 'FAMILY ATLAS' })]),
    el('p', { class: 'lede', text: 'A world tour for the whole family. Everyone plays the same game at their own level — collect stamps as you go.' }),
    el('div', { class: 'cover-cta' }, [
      el('button', { class: 'btn btn-primary btn-lg', text: 'Start a session', onclick: () => Router.go('setup') }),
      el('button', { class: 'btn btn-ghost', text: 'Passports', onclick: () => { if (players[0]) Router.go('passport/' + players[0].id); else openAddPlayer(); } }),
    ]),
  ]);
  root.appendChild(cover);

  // Daily challenge
  const chalGame = gameById(chal.gameId);
  root.appendChild(el('div', { class: 'section' }, [
    el('div', { class: 'daily' }, [
      el('div', { class: 'daily-stamp', html: 'DAILY<br>' + chal.date.slice(5) }),
      el('div', { class: 'daily-body' }, [
        el('h3', { text: 'Today’s family challenge' }),
        el('p', { text: `${chalGame.title} · ${REGION_META[chal.region].name}. Same game for everyone today.` }),
      ]),
      el('button', { class: 'btn btn-primary', text: 'Play', onclick: () => {
        draft.gameId = chal.gameId; draft.region = chal.region; draft.seed = hashSeed(chal.date + chal.gameId);
        Router.go('setup');
      } }),
    ]),
  ]));

  // Games
  const gamesSection = el('div', { class: 'section' }, [
    el('div', { class: 'section-head' }, [el('h2', { text: 'Games' })]),
  ]);
  const gGrid = el('div', { class: 'grid grid-2' });
  GAMES.forEach(g => {
    gGrid.appendChild(el('button', {
      class: 'game-card', type: 'button', style: { '--accent': `var(${CAT_VAR[g.category]})` },
      onclick: () => { draft.gameId = g.id; draft.seed = null; Router.go('setup'); },
    }, [
      el('div', { class: 'gc-emoji', text: g.emoji }),
      el('div', { class: 'gc-title', text: g.title }),
      el('div', { class: 'gc-tag', text: g.blurb }),
      el('div', { class: 'gc-sub', text: g.category }),
    ]));
  });
  gamesSection.appendChild(gGrid);
  root.appendChild(gamesSection);

  // Travellers
  const tSection = el('div', { class: 'section' }, [
    el('div', { class: 'section-head' }, [el('h2', { text: 'Travellers' })]),
  ]);
  const strip = el('div', { class: 'travellers' });
  players.forEach(p => strip.appendChild(travellerChip(p, { onClick: () => Router.go('passport/' + p.id) })));
  strip.appendChild(el('button', { class: 'traveller traveller-add', type: 'button', onclick: openAddPlayer }, [
    el('span', { class: 'tv-emoji', text: '＋' }),
    el('span', { class: 'tv-name', text: 'Add traveller' }),
  ]));
  if (!players.length) tSection.appendChild(el('p', { class: 'empty-note', text: 'No travellers yet. Add the family to begin.' }));
  tSection.appendChild(strip);
  root.appendChild(tSection);

  screen(root);
}

function hashSeed(str) { let h = 2166136261; for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }

// ── ADD / EDIT PLAYER MODAL ──────────────────────────────────
function openAddPlayer(afterCreate) {
  let chosenEmoji = Profiles.AVATARS[0];
  let chosenRank = 'explorer';
  const nameInput = el('input', { type: 'text', maxlength: '20', placeholder: 'Name' });

  const avatarGrid = el('div', { class: 'avatar-grid' });
  Profiles.AVATARS.forEach((a, i) => {
    const opt = el('button', { class: 'avatar-opt' + (i === 0 ? ' is-sel' : ''), type: 'button', text: a, onclick: () => {
      chosenEmoji = a; avatarGrid.querySelectorAll('.avatar-opt').forEach(o => o.classList.remove('is-sel')); opt.classList.add('is-sel');
    } });
    avatarGrid.appendChild(opt);
  });

  const rankChips = el('div', { class: 'chips' });
  RANK_ORDER.forEach((rid, i) => {
    const c = el('button', { class: 'chip' + (i === 0 ? ' is-sel' : ''), type: 'button', onclick: () => {
      chosenRank = rid; rankChips.querySelectorAll('.chip').forEach(o => o.classList.remove('is-sel')); c.classList.add('is-sel');
    } }, [el('span', { text: RANKS[rid].emoji }), el('span', { text: RANKS[rid].name })]);
    rankChips.appendChild(c);
  });

  const scrim = el('div', { class: 'modal-scrim', onclick: (e) => { if (e.target === scrim) scrim.remove(); } }, [
    el('div', { class: 'modal sheet' }, [
      el('h3', { text: 'New traveller' }),
      el('label', { text: 'Name' }), nameInput,
      el('label', { text: 'Avatar' }), avatarGrid,
      el('label', { text: 'Starting level' }), rankChips,
      el('div', { class: 'modal-actions' }, [
        el('button', { class: 'btn btn-ghost', text: 'Cancel', onclick: () => scrim.remove() }),
        el('button', { class: 'btn btn-primary', text: 'Add', onclick: () => {
          const p = Profiles.create(nameInput.value || 'Traveller', chosenEmoji, chosenRank);
          scrim.remove();
          if (afterCreate) afterCreate(p); else Router._resolve();
        } }),
      ]),
    ]),
  ]);
  document.body.appendChild(scrim);
  setTimeout(() => nameInput.focus(), 40);
}

// ── SETUP ────────────────────────────────────────────────────
function renderSetup() {
  showBack(true);
  const root = el('div');
  root.appendChild(el('div', { class: 'section-head' }, [
    el('div', {}, [el('div', { class: 'eyebrow', text: 'Arrange a game' }), el('h2', { text: 'Who is playing?' })]),
  ]));

  // players
  const pWrap = el('div', { class: 'travellers setup-block' });
  function refreshPlayers() {
    clear(pWrap);
    Profiles.list().forEach(p => {
      const sel = draft.players.includes(p.id);
      pWrap.appendChild(travellerChip(p, { selected: sel, onClick: () => {
        if (sel) draft.players = draft.players.filter(id => id !== p.id);
        else draft.players.push(p.id);
        refreshPlayers(); refreshRanks(); refreshTeams(); refreshBegin();
      } }));
    });
    pWrap.appendChild(el('button', { class: 'traveller traveller-add', type: 'button', onclick: () => openAddPlayer((p) => { draft.players.push(p.id); refreshPlayers(); refreshRanks(); refreshTeams(); refreshBegin(); }) }, [
      el('span', { class: 'tv-emoji', text: '＋' }), el('span', { class: 'tv-name', text: 'Add' }),
    ]));
  }
  root.appendChild(pWrap);

  // per-player rank
  const rankBlock = el('div', { class: 'setup-block' }, [el('span', { class: 'eyebrow', text: 'Each traveller’s level' })]);
  const rankList = el('div');
  rankBlock.appendChild(rankList);
  function refreshRanks() {
    clear(rankList);
    const chosen = draft.players.map(id => Profiles.get(id)).filter(Boolean);
    if (!chosen.length) { rankList.appendChild(el('p', { class: 'empty-note', text: 'Pick at least one traveller above.' })); return; }
    chosen.forEach(p => {
      const chips = el('div', { class: 'chips' });
      RANK_ORDER.forEach(rid => {
        const c = el('button', { class: 'chip' + (p.rank === rid ? ' is-sel' : ''), type: 'button', title: RANKS[rid].blurb, onclick: () => {
          Profiles.setRank(p.id, rid); refreshRanks();
        } }, [el('span', { text: RANKS[rid].emoji }), el('span', { text: RANKS[rid].name })]);
        chips.appendChild(c);
      });
      rankList.appendChild(el('div', { class: 'player-rank-row' }, [
        el('div', { class: 'prr-who' }, [el('span', { class: 'tv-emoji', text: p.emoji }), el('span', { text: p.name })]),
        chips,
      ]));
    });
  }
  root.appendChild(rankBlock);

  // game
  const gameBlock = el('div', { class: 'setup-block' }, [el('span', { class: 'eyebrow', text: 'Game' })]);
  const gameChips = el('div', { class: 'chips' });
  GAMES.forEach(g => {
    const c = el('button', { class: 'chip' + (draft.gameId === g.id ? ' is-sel' : ''), type: 'button', onclick: () => {
      draft.gameId = g.id; gameChips.querySelectorAll('.chip').forEach(o => o.classList.remove('is-sel')); c.classList.add('is-sel');
    } }, [el('span', { text: g.emoji }), el('span', { text: g.title })]);
    gameChips.appendChild(c);
  });
  gameBlock.appendChild(gameChips);
  root.appendChild(gameBlock);

  // region
  const regionBlock = el('div', { class: 'setup-block' }, [el('span', { class: 'eyebrow', text: 'Where to?' })]);
  const regionChips = el('div', { class: 'chips' });
  const regionOpts = [{ id: 'all', name: 'Whole world', emoji: '🌐' }, ...REGIONS];
  regionOpts.forEach(r => {
    const c = el('button', { class: 'chip' + (draft.region === r.id ? ' is-sel' : ''), type: 'button', onclick: () => {
      draft.region = r.id; regionChips.querySelectorAll('.chip').forEach(o => o.classList.remove('is-sel')); c.classList.add('is-sel');
    } }, [el('span', { text: r.emoji }), el('span', { text: r.name })]);
    regionChips.appendChild(c);
  });
  regionBlock.appendChild(regionChips);
  root.appendChild(regionBlock);

  // mode
  const modeBlock = el('div', { class: 'setup-block' }, [el('span', { class: 'eyebrow', text: 'How to play' })]);
  const modeChips = el('div', { class: 'chips' });
  const MODES = [
    { id: 'solo', label: 'Everyone for themselves', sub: 'Age-balanced scores' },
    { id: 'teams', label: 'Teams', sub: 'Kids vs grown-ups' },
    { id: 'coop', label: 'Co-op', sub: 'Family vs the game' },
  ];
  MODES.forEach(m => {
    const c = el('button', { class: 'chip rank-chip' + (draft.mode === m.id ? ' is-sel' : ''), type: 'button', onclick: () => {
      draft.mode = m.id; modeChips.querySelectorAll('.chip').forEach(o => o.classList.remove('is-sel')); c.classList.add('is-sel'); refreshTeams(); refreshBegin();
    } }, [el('div', { class: 'rc-top', text: m.label }), el('div', { class: 'rc-blurb', text: m.sub })]);
    modeChips.appendChild(c);
  });
  modeBlock.appendChild(modeChips);
  root.appendChild(modeBlock);

  // teams assignment (only when mode === teams)
  const teamBlock = el('div', { class: 'setup-block' });
  root.appendChild(teamBlock);
  function refreshTeams() {
    clear(teamBlock);
    if (draft.mode !== 'teams') return;
    teamBlock.appendChild(el('span', { class: 'eyebrow', text: 'Teams' }));
    const list = el('div');
    draft.players.map(id => Profiles.get(id)).filter(Boolean).forEach(p => {
      // smart default: cartographers -> parents, else kids
      if (!draft.teamOf[p.id]) draft.teamOf[p.id] = p.rank === 'cartographer' ? 'parents' : 'kids';
      const chips = el('div', { class: 'chips' });
      [['kids', 'Kids'], ['parents', 'Grown-ups']].forEach(([tid, label]) => {
        const c = el('button', { class: 'chip' + (draft.teamOf[p.id] === tid ? ' is-sel' : ''), type: 'button', onclick: () => {
          draft.teamOf[p.id] = tid; refreshTeams(); refreshBegin();
        } }, [el('span', { text: label })]);
        chips.appendChild(c);
      });
      list.appendChild(el('div', { class: 'player-rank-row' }, [
        el('div', { class: 'prr-who' }, [el('span', { class: 'tv-emoji', text: p.emoji }), el('span', { text: p.name })]),
        chips,
      ]));
    });
    teamBlock.appendChild(list);
  }

  // begin
  const beginBtn = el('button', { class: 'btn btn-primary btn-lg', text: 'Begin the tour', onclick: beginSession });
  const beginNote = el('p', { class: 'empty-note', style: { marginTop: '10px' } });
  root.appendChild(el('div', { class: 'setup-block' }, [beginBtn, beginNote]));
  function refreshBegin() {
    let ok = draft.players.length >= 1;
    let note = '';
    if (!draft.players.length) note = 'Pick at least one traveller.';
    if (draft.mode === 'teams') {
      const teams = new Set(draft.players.map(id => draft.teamOf[id] || (Profiles.get(id).rank === 'cartographer' ? 'parents' : 'kids')));
      if (teams.size < 2) { ok = false; note = 'Teams need players on both sides.'; }
    }
    beginBtn.disabled = !ok;
    beginNote.textContent = note;
  }

  refreshPlayers(); refreshRanks(); refreshTeams(); refreshBegin();
  screen(root);
}

function beginSession() {
  const game = gameById(draft.gameId);
  let teams = null;
  if (draft.mode === 'teams') {
    teams = { kids: Object.assign([], { label: 'Kids' }), parents: Object.assign([], { label: 'Grown-ups' }) };
    draft.players.forEach(id => { const t = draft.teamOf[id] || (Profiles.get(id).rank === 'cartographer' ? 'parents' : 'kids'); teams[t].push(id); });
  }
  session = new Session({
    game, playerIds: draft.players, mode: draft.mode, region: draft.region,
    rounds: 5, teams, seed: draft.seed,
  });
  sessionStampEvents = [];
  Router.go('play');
}

// ── PLAY ─────────────────────────────────────────────────────
function renderPlay() {
  if (!session) { Router.go('home'); return; }
  showBack(true);
  nextStep();
}

function nextStep() {
  const turn = session.nextTurn();
  if (!turn) return Router.go('results');
  if (session.playerIds.length > 1) renderPassInterstitial(turn);
  else renderTurn(turn);
}

function renderPassInterstitial(turn) {
  const p = turn.player;
  const root = el('div', { class: 'arena' }, [
    el('div', { class: 'sheet q-card', style: { textAlign: 'center', padding: '48px 24px' } }, [
      el('div', { class: 'eyebrow', text: `Round ${turn.round} of ${turn.rounds} · ${turn.index + 1}/${turn.total}` }),
      el('div', { style: { fontSize: '3.4rem', margin: '10px 0' }, text: p.emoji }),
      el('h2', { class: 'q-region', text: `${p.name}, you’re up` }),
      el('p', { class: 'muted', text: `${RANKS[p.rank].name} · ${gameById(session.gameId).title}` }),
      el('button', { class: 'btn btn-primary btn-lg', style: { marginTop: '20px' }, text: 'I’m ready', onclick: () => renderTurn(turn) }),
    ]),
  ]);
  screen(root);
}

function renderTurn(turn) {
  const p = turn.player;
  const arena = el('div', { class: 'arena' });

  arena.appendChild(el('div', { class: 'turn-banner' }, [
    el('div', { class: 'turn-who' }, [
      el('span', { class: 'tv-emoji', text: p.emoji }),
      el('span', { text: p.name }),
      el('span', { class: 'turn-rank', text: RANKS[p.rank].name }),
    ]),
    el('div', { class: 'turn-progress', text: `${turn.index + 1} / ${turn.total}` }),
  ]));

  const timer = timerBar(turn.rankCfg.timerMs, () => submit(null, { timedOut: true }));
  arena.appendChild(timer.node);

  const mount = el('div', {});
  const qcard = el('div', { class: 'sheet q-card' }, [mount]);
  arena.appendChild(qcard);
  arena.appendChild(scoreboard());

  let answered = false;
  function submit(value, meta = {}) {
    if (answered) return;
    answered = true;
    timer.stop();
    const res = session.submitAnswer(value, meta);
    (res.events || []).forEach(ev => { if (ev.type === 'stamp' || ev.type === 'region' || ev.type === 'badge' || ev.type === 'level') sessionStampEvents.push(ev); });
    showFeedback(qcard, res, turn);
    celebrate(res.events || []);
    refreshScoreboard(arena);
  }

  turn.game.render(turn.question, mount, turn.ctx, submit);
  screen(arena);
  timer.start();
}

function showFeedback(qcard, res, turn) {
  const subject = res.subject || turn.question.subject;
  const answerText = turn.game.describe ? turn.game.describe(turn.question).answer : (subject ? subject.name : '');
  const box = el('div', { class: 'feedback ' + (res.correct ? 'ok' : 'no') });
  if (res.correct) {
    box.appendChild(el('div', { class: 'fb-head', text: pick(['Stamped!', 'Correct!', 'Yes!']) }));
    box.appendChild(el('div', { class: 'fb-detail', text: String(answerText) }));
    box.appendChild(el('div', { class: 'fb-points', text: '+' + res.scored.weightedScore + ' pts' }));
    stampBurst(qcard, subject ? subject.iso : '✓');
  } else {
    const head = res.closeness > 0.6 ? 'So close' : 'Not this time';
    box.appendChild(el('div', { class: 'fb-head', text: head }));
    box.appendChild(el('div', { class: 'fb-detail', text: 'Answer: ' + String(answerText) }));
  }
  const cont = el('button', { class: 'btn btn-primary', style: { marginTop: '14px' }, text: res.finished ? 'See results' : 'Continue', onclick: nextStep });
  box.appendChild(cont);
  qcard.appendChild(box);
  setTimeout(() => cont.focus(), 40);
}

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

function celebrate(events) {
  let delay = 500;
  events.forEach(ev => {
    let msg = null;
    if (ev.type === 'level') msg = `⭐ Level ${ev.level}!`;
    else if (ev.type === 'region') msg = `🗺️ ${ev.label}`;
    else if (ev.type === 'badge') msg = `🎖️ Badge: ${ev.label}`;
    if (msg) { const m = msg; setTimeout(() => toast(m, 'gold'), delay); delay += 700; }
  });
}

function scoreboard() {
  const bar = el('div', { class: 'scorebar', id: 'scorebar' });
  fillScoreboard(bar);
  return bar;
}
function refreshScoreboard(arena) { const bar = arena.querySelector('#scorebar'); if (bar) { clear(bar); fillScoreboard(bar); } }
function fillScoreboard(bar) {
  const st = session.standings();
  if (session.mode === 'coop') {
    const c = st[0];
    bar.appendChild(el('div', { class: 'coop-meter' }, [
      el('div', { class: 'coop-lives', text: '❤️'.repeat(c.lives) + '🖤'.repeat(3 - c.lives) }),
      el('div', { class: 'coop-bar' }, [el('span', { style: { width: Math.min(100, Math.round(c.sharedScore / c.target * 100)) + '%' } })]),
      el('div', { class: 'turn-progress', style: { textAlign: 'center', marginTop: '6px' }, text: `${c.sharedScore} / ${c.target} to win together` }),
    ]));
    return;
  }
  st.forEach(s => {
    bar.appendChild(el('div', { class: 'score-pill' }, [
      el('span', { class: 'sp-emoji', text: s.emoji || (s.kind === 'team' ? '👥' : '•') }),
      el('span', { text: s.name }),
      el('span', { class: 'sp-score', text: String(s.score) }),
    ]));
  });
}

// ── RESULTS (boarding pass) ──────────────────────────────────
function renderResults() {
  if (!session) { Router.go('home'); return; }
  showBack(false);
  const st = session.standings();
  const game = gameById(session.gameId);
  const root = el('div');

  root.appendChild(el('div', { class: 'section-head' }, [
    el('div', {}, [el('div', { class: 'eyebrow', text: 'Tour complete' }), el('h2', { text: 'Boarding pass' })]),
  ]));

  const main = el('div', { class: 'bp-main' });
  main.appendChild(el('div', { class: 'bp-label', text: game.title + ' · ' + (session.region === 'all' ? 'Whole world' : REGION_META[session.region].name) }));

  if (session.mode === 'coop') {
    const c = st[0];
    const won = c.sharedScore >= c.target && c.lives > 0;
    main.appendChild(el('div', { class: 'bp-title', text: won ? 'The family made it! 🎉' : 'A good run' }));
    main.appendChild(el('div', { class: 'bp-big', text: c.sharedScore + ' pts' }));
    main.appendChild(el('p', { class: 'muted', text: won ? `You reached ${c.target} together with ${c.lives} lives to spare.` : `You needed ${c.target}. Another lap and you’ll have it.` }));
  } else {
    main.appendChild(el('div', { class: 'bp-title', text: session.mode === 'teams' ? 'Team standings' : 'Final standings' }));
    st.forEach((s, i) => {
      main.appendChild(el('div', { class: 'bp-row' + (i === 0 ? ' win' : '') }, [
        el('span', {}, [el('span', { style: { marginRight: '8px' }, text: s.emoji || '👥' }), el('span', { text: (i === 0 ? '🏆 ' : '') + s.name })]),
        el('span', { class: 'bp-rank', text: s.score + ' pts' }),
      ]));
    });
    if (session.mode === 'solo' && st.length > 1) main.appendChild(el('p', { class: 'muted', style: { marginTop: '10px' }, text: 'Scores are balanced by level, so the youngest can win fair and square.' }));
  }

  // stamps earned this session
  const stamps = sessionStampEvents.filter(e => e.type === 'stamp');
  const badges = sessionStampEvents.filter(e => e.type === 'badge' || e.type === 'region');
  const stub = el('div', { class: 'bp-stub' }, [
    el('div', { class: 'bp-label', text: 'Stamps earned' }),
    el('div', { style: { fontFamily: 'var(--font-mono)', fontSize: '2.2rem', fontWeight: '700' }, text: String(stamps.length) }),
    badges.length ? el('div', { class: 'bp-label', style: { marginTop: '8px' }, text: badges.map(b => b.label).join(' · ') }) : null,
  ]);

  root.appendChild(el('div', { class: 'boarding-pass' }, [main, stub]));

  root.appendChild(el('div', { class: 'cover-cta', style: { marginTop: '24px' } }, [
    el('button', { class: 'btn btn-primary', text: 'Play again', onclick: () => { session = new Session({ game, playerIds: session.playerIds, mode: session.mode, region: session.region, rounds: session.rounds, teams: session.teams }); sessionStampEvents = []; Router.go('play'); } }),
    el('button', { class: 'btn btn-ghost', text: 'Change game', onclick: () => Router.go('setup') }),
    el('button', { class: 'btn btn-ghost', text: 'Home', onclick: () => Router.go('home') }),
  ]));

  Store.clearSession();
  screen(root);
}

// ── PASSPORT PAGE ────────────────────────────────────────────
function renderPassport(params) {
  const p = Profiles.get(params.id);
  if (!p) { Router.go('home'); return; }
  showBack(true);
  const root = el('div');
  const lp = levelProgress(p.xp);

  root.appendChild(el('div', { class: 'sheet' }, [
    el('div', { class: 'pp-head' }, [
      el('div', { class: 'pp-photo', text: p.emoji }),
      el('div', { class: 'pp-id' }, [
        el('div', { class: 'pp-line', text: 'Passport · Family Atlas' }),
        el('h2', { text: p.name }),
        el('div', { class: 'pp-line', text: `${RANKS[p.rank].name} · Level ${lp.level} · ${p.stats.correct} correct · 🔥 ${p.streak.count}-day streak` }),
        el('div', { class: 'pp-xp' }, [el('div', { class: 'xp-bar' }, [el('span', { style: { width: lp.pct + '%' } })]), el('div', { class: 'pp-line', style: { marginTop: '4px' }, text: `${lp.into} / ${lp.span} xp to level ${lp.level + 1}` })]),
      ]),
      el('button', { class: 'btn btn-ink', text: 'Change level', onclick: () => cycleRank(p) }),
    ]),
  ]));

  // badges
  if (p.badges.length) {
    const brow = el('div', { class: 'badge-row', style: { marginTop: '16px' } });
    p.badges.forEach(bid => {
      const b = BADGES[bid]; if (!b) return;
      brow.appendChild(el('div', { class: 'badge' }, [
        el('span', { class: 'b-emoji', text: BADGE_EMOJI[bid] || '🎖️' }),
        el('span', {}, [el('div', { class: 'b-name', text: b.label }), el('div', { class: 'b-desc', text: b.desc })]),
      ]));
    });
    root.appendChild(el('div', { class: 'section' }, [el('div', { class: 'section-head' }, [el('h2', { text: 'Badges' })]), brow]));
  }

  // stamps by region
  const stampSet = new Set(p.stamps.filter(s => !s.startsWith('region:')).map(s => s.split(':')[1]));
  REGIONS.forEach(r => {
    const targets = subjectPool(p.rank, r.id);
    const got = targets.filter(c => stampSet.has(c.iso));
    const page = el('div', { class: 'sheet region-page', style: { marginTop: '16px', '--accent': regionColor(r.id) } });
    page.appendChild(el('h3', {}, [el('span', { text: r.emoji }), el('span', { text: r.name }), el('span', { class: 'rp-count', text: `  ${got.length}/${targets.length}` })]));
    const grid = el('div', { class: 'stamp-grid' });
    targets.forEach((c, i) => {
      const has = stampSet.has(c.iso);
      grid.appendChild(el('div', {
        class: 'stamp' + (has ? '' : ' empty'),
        style: { '--accent': regionColor(r.id), '--rot': (((i * 37) % 13) - 6) + 'deg' },
        title: c.name,
        text: has ? c.iso : '·',
      }));
    });
    page.appendChild(grid);
    root.appendChild(page);
  });

  screen(root);
}

function cycleRank(p) {
  const idx = RANK_ORDER.indexOf(p.rank);
  const next = RANK_ORDER[(idx + 1) % RANK_ORDER.length];
  Profiles.setRank(p.id, next);
  toast(`${p.name} is now a ${RANKS[next].name}`);
  Router._resolve();
}

// ── Routes ───────────────────────────────────────────────────
Router
  .on('home', renderHome)
  .on('setup', renderSetup)
  .on('play', renderPlay)
  .on('results', renderResults)
  .on('passport/:id', renderPassport);

backBtn.addEventListener('click', () => {
  const path = Router.current() && Router.current().path;
  if (path === 'play') { if (!confirm('Leave this game? Progress in this round will be lost.')) return; Store.clearSession(); }
  Router.go(path === 'setup' || path === 'results' || (path && path.startsWith('passport')) ? 'home' : 'home');
});

Router.start();
