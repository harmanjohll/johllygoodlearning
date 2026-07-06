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
import { subjectPool, buildContext } from './engine/pool.js';
import { BADGES, touchStreak, applyTurn, awardBadge } from './engine/gamification.js';
import * as worldmap from './engine/worldmap.js';
import { sound } from './engine/sound.js';
import { Match, loopbackPair, createRoom, joinRoom } from './engine/netplay.js';
import { challengeFor, todayIso } from './data/challenges.js';
import { el, clear, flagImg, timerBar, toast, stampBurst } from './engine/ui.js';

const app = document.getElementById('app');
const backBtn = document.getElementById('backBtn');

const REGION_META = Object.fromEntries(REGIONS.map(r => [r.id, r]));
const REGION_VAR = { europe: '--r-europe', africa: '--r-africa', asia: '--r-asia', americas: '--r-americas', oceania: '--r-oceania' };
const CAT_VAR = { Countries: '--stamp-teal', Flags: '--stamp-blue', Capitals: '--stamp-red' };
const BADGE_EMOJI = { 'first-steps': '🥾', globetrotter: '🌍', comeback: '💪', 'week-streak': '📅', cartographer: '🧭', 'memory-master': '🃏', speedster: '⚡' };

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
let boardRun = null;          // active board-game run (kind:'board'), else null
let net = null;               // active multiplayer state, else null
let sessionStampEvents = [];  // stamps/badges earned this session, for the results page

// Games offered in multiplayer: turn-based and no map dependency (keeps every
// device light and in sync). Board/map games stay same-device for now.
const NET_GAMES = () => GAMES.filter(g => g.kind !== 'board' && !g.needsMap);

// ── helpers ─────────────────────────────────────────────────
let screenCleanup = null;   // runs when the screen changes (stops stray timers)
function screen(node) {
  if (screenCleanup) { try { screenCleanup(); } catch {} screenCleanup = null; }
  clear(app); app.appendChild(node); window.scrollTo(0, 0);
}
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
  boardRun = null;
  leaveNet();
  const players = Profiles.list();
  const root = el('div');

  // Cover hero
  const chal = challengeFor();
  const cover = el('div', { class: 'cover' }, [
    el('div', { class: 'globe-stage' }, [el('div', { class: 'globe' }, [el('div', { class: 'globe-ring' })])]),
    el('div', { class: 'cover-emblem', text: '🧭' }),
    el('div', { class: 'eyebrow', text: 'The Johll Family · Mission Control' }),
    el('h1', {}, [el('span', { class: 'foil', text: 'FAMILY ATLAS' })]),
    el('p', { class: 'lede', text: 'A world tour for the whole crew. Everyone plays the same mission at their own level — collect stamps across the planet.' }),
    el('div', { class: 'cover-cta' }, [
      el('button', { class: 'btn btn-primary btn-lg', text: 'Launch a mission', onclick: () => { sound.click(); Router.go('setup'); } }),
      el('button', { class: 'btn btn-ghost', text: '📡 Separate devices', onclick: () => { sound.click(); Router.go('net'); } }),
      el('button', { class: 'btn btn-ghost', text: 'Passports', onclick: () => { if (players[0]) Router.go('passport/' + players[0].id); else openAddPlayer(); } }),
      el('button', { class: 'btn btn-ghost', title: 'Sound', text: sound.enabled() ? '🔊' : '🔇', onclick: (e) => { const on = sound.toggle(); e.target.textContent = on ? '🔊' : '🔇'; if (on) sound.click(); } }),
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
    el('div', {}, [el('div', { class: 'eyebrow', text: 'Mission briefing' }), el('h2', { text: 'Assemble the crew' })]),
  ]));

  // players + inline level (tap card to join · tap the level pill to change difficulty)
  root.appendChild(el('div', { class: 'setup-block' }, [el('span', { class: 'eyebrow', text: 'Crew · tap a card to join, tap the level to change it' })]));
  const pWrap = el('div', { class: 'travellers' });
  function refreshPlayers() {
    clear(pWrap);
    Profiles.list().forEach(p => {
      const sel = draft.players.includes(p.id);
      const chip = el('button', { class: 'traveller' + (sel ? ' is-sel' : ''), type: 'button', onclick: () => {
        sound.select();
        if (sel) draft.players = draft.players.filter(id => id !== p.id);
        else draft.players.push(p.id);
        refreshPlayers(); refreshTeams(); refreshBegin();
      } }, [
        el('span', { class: 'tv-emoji', text: p.emoji }),
        el('span', {}, [
          el('div', { class: 'tv-name', text: p.name }),
          el('div', { class: 'tv-meta', text: 'Lvl ' + (p.level || 1) }),
        ]),
      ]);
      if (sel) {
        chip.appendChild(el('span', {
          class: 'rank-pill', title: RANKS[p.rank].blurb,
          text: RANKS[p.rank].emoji + ' ' + RANKS[p.rank].name,
          onclick: (e) => {
            e.stopPropagation();
            const idx = RANK_ORDER.indexOf(p.rank);
            Profiles.setRank(p.id, RANK_ORDER[(idx + 1) % RANK_ORDER.length]);
            sound.click(); refreshPlayers(); refreshTeams();
          },
        }));
      }
      pWrap.appendChild(chip);
    });
    pWrap.appendChild(el('button', { class: 'traveller traveller-add', type: 'button', onclick: () => openAddPlayer((p) => { draft.players.push(p.id); refreshPlayers(); refreshTeams(); refreshBegin(); }) }, [
      el('span', { class: 'tv-emoji', text: '＋' }), el('span', { class: 'tv-name', text: 'Add' }),
    ]));
  }
  root.appendChild(pWrap);
  const refreshRanks = () => {}; // rank now lives on the crew cards

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

async function beginSession() {
  const game = gameById(draft.gameId);
  if (game.needsMap) {
    if (!worldmap.isReady() && !worldmap.failed()) { renderMapLoading(); await worldmap.ready(); }
    if (worldmap.failed()) { toast('The world map could not load. Try another game.'); Router.go('setup'); return; }
  }
  if (game.kind === 'board') {
    session = null;
    boardRun = { game, playerIds: draft.players.slice(), region: draft.region, idx: 0, results: [], seedBase: (draft.seed != null ? draft.seed : Math.floor(performance.now())) >>> 0 };
    sessionStampEvents = [];
    Router.go('play');
    return;
  }
  boardRun = null;
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

function renderMapLoading() {
  screen(el('div', { class: 'arena' }, [
    el('div', { class: 'sheet q-card', style: { textAlign: 'center', padding: '48px 24px' } }, [
      el('div', { style: { fontSize: '2.6rem' }, text: '🗺️' }),
      el('h2', { class: 'q-region', text: 'Unrolling the map…' }),
      el('p', { class: 'muted', text: 'One moment.' }),
    ]),
  ]));
}

// ── PLAY ─────────────────────────────────────────────────────
function renderPlay() {
  if (boardRun) { showBack(true); boardNext(); return; }
  if (!session) { Router.go('home'); return; }
  showBack(true);
  nextStep();
}

// ── Board games (self-contained; players play in sequence) ───
function boardNext() {
  if (boardRun.idx >= boardRun.playerIds.length) { renderBoardResults(); return; }
  const myRun = boardRun;
  const profile = Profiles.get(boardRun.playerIds[boardRun.idx]);
  const startBoard = () => {
    const seed = (boardRun.seedBase * 2654435761 + boardRun.idx * 40503) >>> 0;
    const ctx = buildContext({ rankId: profile.rank, region: boardRun.region, seed });
    const arena = el('div', { class: 'arena' }, [
      el('div', { class: 'turn-banner' }, [
        el('div', { class: 'turn-who' }, [el('span', { class: 'tv-emoji', text: profile.emoji }), el('span', { text: profile.name }), el('span', { class: 'turn-rank', text: RANKS[profile.rank].name })]),
        el('div', { class: 'turn-progress', text: `${boardRun.idx + 1} / ${boardRun.playerIds.length}` }),
      ]),
    ]);
    const card = el('div', { class: 'sheet q-card' });
    arena.appendChild(card);
    screen(arena);
    let done = false;
    boardRun.game.run(card, ctx, (result) => {
      if (done || boardRun !== myRun) return; done = true;
      applyBoardResult(profile, result || {}, boardRun.game.id);
      boardRun.results.push({ playerId: profile.id, name: profile.name, emoji: profile.emoji, score: (result && result.score) || 0, detail: (result && result.detail) || '' });
      boardRun.idx++;
      const cont = el('button', { class: 'btn btn-primary', style: { display: 'block', margin: '18px auto 0' }, text: boardRun.idx >= boardRun.playerIds.length ? 'See results' : 'Next player', onclick: boardNext });
      card.appendChild(el('div', { class: 'feedback ok' }, [
        el('div', { class: 'fb-head', text: 'Round done' }),
        el('div', { class: 'fb-detail', text: `${profile.name}: ${(result && result.detail) || ''}` }),
        el('div', { class: 'fb-points', text: '+' + ((result && result.score) || 0) + ' pts' }),
        cont,
      ]));
      sound.win();
    });
  };
  if (boardRun.playerIds.length > 1) renderPassInterstitialFor(profile, boardRun.idx, boardRun.playerIds.length, startBoard);
  else startBoard();
}

function applyBoardResult(profile, result, gameId) {
  touchStreak(profile);
  (result.correctIsos || []).forEach(iso => {
    const c = BY_ISO[iso]; if (!c) return;
    const events = applyTurn(profile, { correct: true, region: c.region, iso, rankId: profile.rank, scored: { xpGained: 6 }, gameId });
    (events || []).forEach(e => { if (['stamp', 'region', 'badge', 'level'].includes(e.type)) sessionStampEvents.push(e); });
  });
  let earned = null;
  if (gameId === 'flags/memory-match' && result.correct >= (result.total || 1)) earned = awardBadge(profile, 'memory-master');
  if (gameId === 'names/speed-sweep' && (result.correct || 0) >= 10) earned = awardBadge(profile, 'speedster');
  if (earned) sessionStampEvents.push(earned);
}

function renderPassInterstitialFor(p, idx, total, onReady) {
  screen(el('div', { class: 'arena' }, [
    el('div', { class: 'sheet q-card', style: { textAlign: 'center', padding: '48px 24px' } }, [
      el('div', { class: 'eyebrow', text: `Player ${idx + 1} of ${total}` }),
      el('div', { style: { fontSize: '3.4rem', margin: '10px 0' }, text: p.emoji }),
      el('h2', { class: 'q-region', text: `${p.name}, you’re up` }),
      el('button', { class: 'btn btn-primary btn-lg', style: { marginTop: '20px' }, text: 'I’m ready', onclick: onReady }),
    ]),
  ]));
}

function renderBoardResults() {
  showBack(false);
  const game = gameById(boardRun.game.id);
  const standings = boardRun.results.slice().sort((a, b) => b.score - a.score);
  const root = el('div');
  sound.win();
  root.appendChild(el('div', { class: 'section-head' }, [el('div', {}, [el('div', { class: 'eyebrow', text: 'Mission complete' }), el('h2', { text: 'Mission report' })])]));
  const main = el('div', { class: 'bp-main' }, [el('div', { class: 'bp-label', text: game.title + ' · ' + (boardRun.region === 'all' ? 'Whole world' : REGION_META[boardRun.region].name) }), el('div', { class: 'bp-title', text: 'Scores' })]);
  standings.forEach((s, i) => main.appendChild(el('div', { class: 'bp-row' + (i === 0 ? ' win' : '') }, [
    el('span', {}, [el('span', { style: { marginRight: '8px' }, text: s.emoji }), el('span', { text: (i === 0 ? '🏆 ' : '') + s.name })]),
    el('span', { class: 'bp-rank', text: s.score + ' pts' }),
  ])));
  const stamps = sessionStampEvents.filter(e => e.type === 'stamp');
  const stub = el('div', { class: 'bp-stub' }, [el('div', { class: 'bp-label', text: 'Stamps earned' }), el('div', { style: { fontFamily: 'var(--font-mono)', fontSize: '2.2rem', fontWeight: '700' }, text: String(stamps.length) })]);
  root.appendChild(el('div', { class: 'boarding-pass' }, [main, stub]));
  root.appendChild(el('div', { class: 'cover-cta', style: { marginTop: '24px' } }, [
    el('button', { class: 'btn btn-primary', text: 'Play again', onclick: () => { boardRun.idx = 0; boardRun.results = []; sessionStampEvents = []; Router.go('play'); } }),
    el('button', { class: 'btn btn-ghost', text: 'Change game', onclick: () => Router.go('setup') }),
    el('button', { class: 'btn btn-ghost', text: 'Home', onclick: () => Router.go('home') }),
  ]));
  Store.clearSession();
  screen(root);
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
    if (answered || !session) return;
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
  screenCleanup = () => timer.stop();
}

function showFeedback(qcard, res, turn) {
  const subject = res.subject || turn.question.subject;
  const answerText = turn.game.describe ? turn.game.describe(turn.question).answer : (subject ? subject.name : '');
  const box = el('div', { class: 'feedback ' + (res.correct ? 'ok' : 'no') });
  if (res.correct) {
    box.appendChild(el('div', { class: 'fb-head', text: pick(['Stamped!', 'Correct!', 'Locked in!', 'Yes!']) }));
    box.appendChild(el('div', { class: 'fb-detail', text: String(answerText) }));
    box.appendChild(el('div', { class: 'fb-points', text: '+' + res.scored.weightedScore + ' pts' }));
    stampBurst(qcard, subject ? subject.iso : '✓');
    sound.correct(); if ((res.events || []).some(e => e.type === 'stamp')) sound.stamp();
  } else {
    const head = res.closeness > 0.6 ? 'So close' : 'Not this time';
    box.appendChild(el('div', { class: 'fb-head', text: head }));
    box.appendChild(el('div', { class: 'fb-detail', text: 'Answer: ' + String(answerText) }));
    sound.wrong();
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

  sound.win();
  root.appendChild(el('div', { class: 'section-head' }, [
    el('div', {}, [el('div', { class: 'eyebrow', text: 'Mission complete' }), el('h2', { text: 'Mission report' })]),
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

  // "Where you've been" map (filled async once the world map is ready)
  if (!worldmap.failed()) {
    const stampedIsos = p.stamps.filter(s => !s.startsWith('region:')).map(s => s.split(':')[1]);
    const mapSheet = el('div', { class: 'sheet pp-map-sheet', style: { marginTop: '16px' } }, [
      el('div', { class: 'region-page' }, [
        el('h3', {}, [el('span', { text: '🧳' }), el('span', { text: 'Where you’ve been' }),
          el('span', { class: 'rp-count', text: `  ${stampedIsos.length} countries` })]),
        el('div', { class: 'pp-map-mount', text: '' }),
      ]),
    ]);
    root.appendChild(mapSheet);
    worldmap.ready().then(() => {
      if (worldmap.failed()) { mapSheet.remove(); return; }
      const paint = {};
      stampedIsos.forEach(iso => { const c = BY_ISO[iso]; if (c && worldmap.hasCountry(iso)) paint[iso.toLowerCase()] = regionColor(c.region); });
      const svg = worldmap.buildLocateMap({ interactive: [], paint });
      const mountEl = mapSheet.querySelector('.pp-map-mount');
      if (svg && mountEl) { mountEl.classList.add('pp-map'); mountEl.appendChild(svg); mountEl.appendChild(el('div', { class: 'map-credit', text: 'Map: simple-world-map, CC BY-SA 3.0' })); }
      else if (mountEl) mountEl.appendChild(el('p', { class: 'muted', text: 'Map unavailable.' }));
    });
  }

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

// ── Multiplayer (separate devices, PeerJS) ───────────────────
function leaveNet() {
  if (!net) return;
  try { if (net.conn) net.conn.send({ t: 'leave' }); } catch {}
  try { if (net.room && net.room.destroy) net.room.destroy(); } catch {}
  try { if (net.link && net.link.destroy) net.link.destroy(); } catch {}
  net = null;
}

function renderNetEntry() {
  showBack(true);
  leaveNet();
  const players = Profiles.list();
  let mePid = players[0] ? players[0].id : null;
  const codeInput = el('input', { type: 'text', maxlength: '4', placeholder: 'CODE', style: { textTransform: 'uppercase', maxWidth: '140px' } });

  const root = el('div');
  root.appendChild(el('div', { class: 'section-head' }, [el('div', {}, [el('div', { class: 'eyebrow', text: 'Separate devices' }), el('h2', { text: 'Play across the room' })])]));
  root.appendChild(el('p', { class: 'lede', style: { marginBottom: '18px' }, text: 'One device hosts and shares a 4-letter code; everyone else joins from their own phone. Same age-fair scoring.' }));

  root.appendChild(el('div', { class: 'setup-block' }, [el('span', { class: 'eyebrow', text: 'You are' })]));
  const meWrap = el('div', { class: 'travellers' });
  function refreshMe() {
    clear(meWrap);
    Profiles.list().forEach(p => meWrap.appendChild(el('button', { class: 'traveller' + (mePid === p.id ? ' is-sel' : ''), type: 'button', onclick: () => { mePid = p.id; sound.select(); refreshMe(); } }, [
      el('span', { class: 'tv-emoji', text: p.emoji }), el('span', {}, [el('div', { class: 'tv-name', text: p.name }), el('div', { class: 'tv-meta', text: RANKS[p.rank].name })]),
    ])));
    meWrap.appendChild(el('button', { class: 'traveller traveller-add', type: 'button', onclick: () => openAddPlayer((p) => { mePid = p.id; refreshMe(); }) }, [el('span', { class: 'tv-emoji', text: '＋' }), el('span', { class: 'tv-name', text: 'Add' })]));
  }
  refreshMe();
  root.appendChild(meWrap);

  root.appendChild(el('div', { class: 'grid grid-2', style: { marginTop: '26px' } }, [
    el('div', { class: 'sheet', style: { padding: '22px' } }, [
      el('h3', { text: 'Host a room' }), el('p', { class: 'muted', style: { margin: '6px 0 14px' }, text: 'Create a code others join.' }),
      el('button', { class: 'btn btn-primary', text: 'Create room', onclick: () => { const me = Profiles.get(mePid); if (!me) return toast('Pick who you are first.'); sound.click(); startHosting(me); } }),
    ]),
    el('div', { class: 'sheet', style: { padding: '22px' } }, [
      el('h3', { text: 'Join a room' }), el('p', { class: 'muted', style: { margin: '6px 0 14px' }, text: 'Enter the host’s code.' }),
      el('div', { style: { display: 'flex', gap: '8px' } }, [codeInput, el('button', { class: 'btn btn-ghost', text: 'Join', onclick: () => { const me = Profiles.get(mePid); if (!me) return toast('Pick who you are first.'); const code = codeInput.value.trim().toUpperCase(); if (code.length < 4) return toast('Enter the 4-letter code.'); sound.click(); startJoining(me, code); } })]),
    ]),
  ]));
  screen(root);
}

function netStatus(title, sub) {
  screen(el('div', { class: 'arena' }, [el('div', { class: 'sheet q-card', style: { textAlign: 'center', padding: '48px 24px' } }, [
    el('div', { style: { fontSize: '2.4rem' }, text: '📡' }), el('h2', { class: 'q-region', text: title }), sub ? el('p', { class: 'muted', text: sub }) : null,
  ])]));
}

function bindConn(conn) { conn.on(netHandle); conn.onClose(() => { if (net && net.role === 'client') { toast('Lost connection to the room.'); Router.go('home'); } }); }

async function startHosting(me) {
  net = { role: 'host', me: { name: me.name, emoji: me.emoji, rank: me.rank }, roster: [], config: null };
  net.match = new Match();
  const [hostLocal, hostConn] = loopbackPair();
  net.conn = hostConn; net.match.addConnection(hostLocal); bindConn(hostConn);
  netStatus('Opening a room…', 'Contacting the peer network.');
  try {
    net.room = await createRoom({ onConnection: (t) => net.match.addConnection(t) });
  } catch (e) { toast('Could not open a room. ' + (e.message || '')); Router.go('home'); return; }
  if (!net) return; // left while opening
  net.code = net.room.code;
  net.conn.send({ t: 'join', name: net.me.name, emoji: net.me.emoji, rank: net.me.rank });
  renderLobby();
}

async function startJoining(me, code) {
  net = { role: 'client', me: { name: me.name, emoji: me.emoji, rank: me.rank }, roster: [], config: null, code };
  netStatus('Joining room ' + code + '…', 'Connecting to the host.');
  try {
    net.link = await joinRoom(code);
  } catch (e) { toast(e.message || 'Could not join.'); Router.go('net'); return; }
  if (!net) return;
  net.conn = net.link.transport; bindConn(net.conn);
  net.conn.send({ t: 'join', name: net.me.name, emoji: net.me.emoji, rank: net.me.rank });
  renderLobby();
}

function netHandle(msg) {
  if (!net || !msg || !msg.t) return;
  if (msg.t === 'joined') { net.myId = msg.id; }
  else if (msg.t === 'roster') { net.roster = msg.players; if (net.stage !== 'play') renderLobby(); }
  else if (msg.t === 'config') { net.config = msg; net.stage = 'play'; netStatus('Get ready…', gameById(msg.gameId).title); }
  else if (msg.t === 'question') { renderNetQuestion(msg); }
  else if (msg.t === 'spectate') { renderNetSpectate(msg); }
  else if (msg.t === 'scoreboard') { net.standings = msg.standings; updateNetScores(); }
  else if (msg.t === 'result') { netResult(msg); }
  else if (msg.t === 'end') { renderNetResults(msg.standings); }
}

function renderLobby() {
  showBack(true);
  net.stage = 'lobby';
  const root = el('div');
  const isHost = net.role === 'host';
  root.appendChild(el('div', { class: 'section-head' }, [el('div', {}, [el('div', { class: 'eyebrow', text: isHost ? 'You are hosting' : 'In the room' }), el('h2', { text: 'Lobby' })])]));

  root.appendChild(el('div', { class: 'sheet', style: { padding: '22px', textAlign: 'center', marginBottom: '18px' } }, [
    el('div', { class: 'bp-label', text: 'Room code' }),
    el('div', { style: { fontFamily: 'var(--font-mono)', fontSize: '2.6rem', fontWeight: '700', letterSpacing: '.3em', color: 'var(--cyan-2)' }, text: net.code || '····' }),
    el('p', { class: 'muted', text: isHost ? 'Share this code — others tap Join and enter it.' : 'Waiting for the host to start.' }),
  ]));

  const crew = el('div', { class: 'travellers' });
  (net.roster || []).forEach(p => crew.appendChild(el('div', { class: 'traveller is-sel' }, [el('span', { class: 'tv-emoji', text: p.emoji }), el('span', {}, [el('div', { class: 'tv-name', text: p.name }), el('div', { class: 'tv-meta', text: RANKS[p.rank] ? RANKS[p.rank].name : '' })])])));
  root.appendChild(el('div', { class: 'setup-block' }, [el('span', { class: 'eyebrow', text: `Crew · ${(net.roster || []).length} here` }), crew]));

  if (isHost) {
    let gameId = (NET_GAMES()[0] || {}).id, region = 'all', mode = 'race';
    const mk = (opts, cur, set) => { const wrap = el('div', { class: 'chips' }); opts.forEach(o => { const c = el('button', { class: 'chip' + (cur() === o.v ? ' is-sel' : ''), type: 'button', onclick: () => { set(o.v); wrap.querySelectorAll('.chip').forEach(x => x.classList.remove('is-sel')); c.classList.add('is-sel'); } }, [el('span', { text: o.label })]); wrap.appendChild(c); }); return wrap; };
    root.appendChild(el('div', { class: 'setup-block' }, [el('span', { class: 'eyebrow', text: 'Game' }), mk(NET_GAMES().map(g => ({ v: g.id, label: g.emoji + ' ' + g.title })), () => gameId, v => gameId = v)]));
    root.appendChild(el('div', { class: 'setup-block' }, [el('span', { class: 'eyebrow', text: 'Where to?' }), mk([{ v: 'all', label: '🌐 Whole world' }, ...REGIONS.map(r => ({ v: r.id, label: r.emoji + ' ' + r.name }))], () => region, v => region = v)]));
    root.appendChild(el('div', { class: 'setup-block' }, [el('span', { class: 'eyebrow', text: 'How to play' }), mk([{ v: 'race', label: '⚡ Live race' }, { v: 'turn', label: '🔄 Turn by turn' }], () => mode, v => mode = v)]));
    root.appendChild(el('div', { class: 'setup-block' }, [el('button', { class: 'btn btn-primary btn-lg', text: 'Start the mission', onclick: () => { if ((net.roster || []).length < 1) return toast('Wait for someone to join.'); sound.click(); net.match.start({ gameId, region, mode, rounds: 6 }); } })]));
  }
  screen(root);
}

function netMe() { return (net.standings || net.roster || []).find(p => p.id === net.myId); }

function renderNetQuestion(msg) {
  net.stage = 'play';
  const game = gameById(net.config.gameId);
  const ctx = buildContext({ rankId: net.me.rank, region: net.config.region, seed: 1 });
  const arena = el('div', { class: 'arena' });
  arena.appendChild(el('div', { class: 'turn-banner' }, [
    el('div', { class: 'turn-who' }, [el('span', { class: 'tv-emoji', text: net.me.emoji }), el('span', { text: net.me.name }), el('span', { class: 'turn-rank', text: RANKS[net.me.rank].name })]),
    el('div', { class: 'turn-progress', text: (msg.index + 1) + ' / ' + msg.total }),
  ]));
  const timer = timerBar(ctx.rankCfg.timerMs, () => submit(null, { timedOut: true }));
  arena.appendChild(timer.node);
  const mount = el('div', {});
  const qcard = el('div', { class: 'sheet q-card' }, [mount]);
  net.curCard = qcard;
  arena.appendChild(qcard);
  arena.appendChild(netScoreboardEl());
  const started = performance.now();
  let answered = false;
  function submit(value, meta = {}) {
    if (answered || !net) return; answered = true; timer.stop();
    net.conn.send({ t: 'answer', value, ms: Math.round(performance.now() - started), index: msg.index, usedHint: !!meta.usedHint, timedOut: !!meta.timedOut });
    mount.appendChild(el('div', { class: 'feedback', style: { opacity: '.7' } }, [el('div', { class: 'muted', text: 'Answer sent — waiting…' })]));
  }
  game.render(msg.q, mount, ctx, submit);
  screen(arena); timer.start(); screenCleanup = () => timer.stop();
}

function renderNetSpectate(msg) {
  net.stage = 'play';
  const arena = el('div', { class: 'arena' });
  arena.appendChild(el('div', { class: 'sheet q-card', style: { textAlign: 'center', padding: '40px 24px' } }, [
    el('div', { style: { fontSize: '3rem' }, text: msg.activeEmoji || '🎮' }),
    el('h2', { class: 'q-region', text: msg.activeName + ' is answering' }),
    el('p', { class: 'muted', text: 'Watch the scores move.' }),
  ]));
  arena.appendChild(netScoreboardEl());
  screen(arena);
}

function netResult(msg) {
  if (!net.curCard) return;
  sound[msg.correct ? 'correct' : 'wrong']();
  net.curCard.appendChild(el('div', { class: 'feedback ' + (msg.correct ? 'ok' : 'no') }, [
    el('div', { class: 'fb-head', text: msg.correct ? 'Correct!' : 'Not this time' }),
    el('div', { class: 'fb-detail', text: 'Answer: ' + String(msg.answer || '') }),
    msg.correct ? el('div', { class: 'fb-points', text: '+' + msg.points + ' pts' }) : null,
  ]));
}

function netScoreboardEl() {
  const bar = el('div', { class: 'scorebar', id: 'net-scores' });
  fillNetScores(bar);
  return bar;
}
function updateNetScores() { const bar = document.getElementById('net-scores'); if (bar) { clear(bar); fillNetScores(bar); } }
function fillNetScores(bar) {
  (net.standings || net.roster || []).forEach(s => bar.appendChild(el('div', { class: 'score-pill' + (s.id === net.myId ? ' is-sel' : '') }, [
    el('span', { class: 'sp-emoji', text: s.emoji }), el('span', { text: s.name }), el('span', { class: 'sp-score', text: String(s.score || 0) }), s.done ? el('span', { class: 'turn-rank', text: '✓' }) : null,
  ])));
}

function renderNetResults(standings) {
  showBack(false); sound.win();
  const root = el('div');
  root.appendChild(el('div', { class: 'section-head' }, [el('div', {}, [el('div', { class: 'eyebrow', text: 'Mission complete' }), el('h2', { text: 'Mission report' })])]));
  const main = el('div', { class: 'bp-main' }, [el('div', { class: 'bp-label', text: 'Multiplayer · ' + (net.config ? gameById(net.config.gameId).title : '') }), el('div', { class: 'bp-title', text: 'Final standings' })]);
  standings.forEach((s, i) => main.appendChild(el('div', { class: 'bp-row' + (i === 0 ? ' win' : '') }, [
    el('span', {}, [el('span', { style: { marginRight: '8px' }, text: s.emoji }), el('span', { text: (i === 0 ? '🏆 ' : '') + s.name })]),
    el('span', { class: 'bp-rank', text: s.score + ' pts' }),
  ])));
  const stub = el('div', { class: 'bp-stub' }, [el('div', { class: 'bp-label', text: 'Room' }), el('div', { style: { fontFamily: 'var(--font-mono)', fontSize: '1.8rem', fontWeight: '700' }, text: net.code || '' })]);
  root.appendChild(el('div', { class: 'boarding-pass' }, [main, stub]));
  const cta = el('div', { class: 'cover-cta', style: { marginTop: '24px' } });
  if (net.role === 'host') cta.appendChild(el('button', { class: 'btn btn-primary', text: 'Back to lobby', onclick: () => { net.match.status = 'lobby'; renderLobby(); } }));
  cta.appendChild(el('button', { class: 'btn btn-ghost', text: 'Leave room', onclick: () => Router.go('home') }));
  root.appendChild(cta);
  screen(root);
}

// Offline loopback demo (unlinked; for previewing/verifying multiplayer without
// the peer network): a real host UI plus an auto-answering bot over loopback.
function craftNetAnswer(q) {
  if (q.options) return q.answer;
  if (typeof q.answer === 'boolean') return q.answer;
  if (q.variant === 'clue') return q.subject.name;
  if (q.inputMode === 'typed') return (q.prompt && q.prompt.type === 'capital-of') ? q.answer : q.subject.name;
  return q.answer;
}
function botDrive(farEnd, player) {
  farEnd.on((msg) => {
    if (msg.t === 'question') { const v = craftNetAnswer(msg.q); setTimeout(() => farEnd.send({ t: 'answer', value: v, ms: 1500, index: msg.index }), 400 + Math.floor(Math.random() * 400)); }
  });
  farEnd.send({ t: 'join', name: player.name, emoji: player.emoji, rank: player.rank });
}
function startNetDemo() {
  leaveNet();
  net = { role: 'host', me: { name: 'You', emoji: '🙂', rank: 'navigator' }, roster: [], config: null, code: 'DEMO' };
  net.match = new Match();
  const [hl, hc] = loopbackPair(); net.conn = hc; net.match.addConnection(hl); bindConn(hc);
  const [bl, bc] = loopbackPair(); net.match.addConnection(bl); botDrive(bc, { name: 'Robo', emoji: '🤖', rank: 'explorer' });
  net.room = { destroy() {} };
  net.conn.send({ t: 'join', name: net.me.name, emoji: net.me.emoji, rank: net.me.rank });
  renderLobby();
}

// ── Routes ───────────────────────────────────────────────────
Router
  .on('home', renderHome)
  .on('setup', renderSetup)
  .on('net', renderNetEntry)
  .on('net-demo', startNetDemo)
  .on('play', renderPlay)
  .on('results', renderResults)
  .on('passport/:id', renderPassport);

backBtn.addEventListener('click', () => {
  const path = Router.current() && Router.current().path;
  if (net) { if (net.stage === 'play' && !confirm('Leave the multiplayer game?')) return; leaveNet(); Router.go('home'); return; }
  if (path === 'play') { if (!confirm('Leave this game? Progress in this round will be lost.')) return; Store.clearSession(); }
  Router.go('home');
});

worldmap.loadWorldMap();  // preload so map games are ready by play time; degrades if it fails
Router.start();
