/* ===========================================================================
   GeoGames - Session

   Owns a single run of a game: the question list, whose turn it is, the score,
   the streak and the steal rule. Games do not know about players; the shell
   does not know how a question was built. This sits between them.
   =========================================================================== */

import { Store } from './store.js';
import { mulberry32, hashSeed, shuffle } from './ui.js';

export const DIFFICULTY = {
  family:   { label: 'Family',   tiers: [1],       options: 3, timeScale: 1.7, blurb: 'Household-name countries, three options, generous clock.' },
  explorer: { label: 'Explorer', tiers: [1, 2],    options: 4, timeScale: 1.0, blurb: 'The countries most people have heard of.' },
  expert:   { label: 'Expert',   tiers: [1, 2, 3], options: 4, timeScale: 0.7, blurb: 'All 194, including the ones that end friendships.' },
};

export const MODES = {
  solo:  { label: 'Solo',          blurb: 'Just you against the world.' },
  pass:  { label: 'Pass and play', blurb: 'One device, take it in turns. Best with snacks.' },
  teams: { label: 'Teams',         blurb: 'Two sides, alternating turns, one running score.' },
};

const BASE_POINTS = 100;
const MAX_SPEED_BONUS = 60;
const MAX_STREAK_BONUS = 50;
const STEAL_FRACTION = 0.5;

export class Session {
  constructor({ game, config, players, mode, seed }) {
    this.game = game;
    this.config = config;
    this.mode = players.length > 1 ? mode : 'solo';
    this.seed = seed ?? (Math.random() * 2 ** 32) >>> 0;
    this.rnd = mulberry32(this.seed);

    this.players = players.map(p => ({
      ...p, score: 0, correct: 0, asked: 0, streak: 0, bestStreak: 0,
    }));
    if (this.mode === 'teams') this._assignTeams();

    this.questions = game.build({
      rnd: this.rnd,
      config,
      countries: config.countries,
      shapes: config.shapes,
      pool: config.pool,
    });
    this.index = 0;
    this.turn = 0;
    this.log = [];
    this.stealOpen = null;      // { fromIndex, question } while a steal is live
    this.startedAt = Date.now();
  }

  _assignTeams() {
    const names = ['Team A', 'Team B'];
    const order = shuffle(this.players, this.rnd);
    order.forEach((p, i) => { p.team = names[i % 2]; });
    // Play in A, B, A, B order so the sides genuinely alternate.
    this.players.sort((a, b) => a.team.localeCompare(b.team));
    const a = this.players.filter(p => p.team === names[0]);
    const b = this.players.filter(p => p.team === names[1]);
    const woven = [];
    for (let i = 0; i < Math.max(a.length, b.length); i++) {
      if (a[i]) woven.push(a[i]);
      if (b[i]) woven.push(b[i]);
    }
    this.players = woven;
  }

  get total() { return this.questions.length; }
  get question() { return this.questions[this.index]; }
  get player() { return this.players[this.turn % this.players.length]; }
  get done() { return this.index >= this.questions.length; }

  /* Who would get a steal if the current player misses. Null in solo, or when
     the rule is switched off, or when there is nobody else to steal. */
  get stealer() {
    if (!this.config.steal || this.players.length < 2) return null;
    const next = this.players[(this.turn + 1) % this.players.length];
    if (this.mode === 'teams' && next.team === this.player.team) return null;
    return next;
  }

  /* result: { correct, accuracy?, timeLeftFraction?, detail? } */
  submit(result, { stolenBy = null } = {}) {
    const player = stolenBy || this.player;
    const q = this.question;
    const correct = !!result.correct;
    const accuracy = result.accuracy != null ? Math.max(0, Math.min(1, result.accuracy)) : (correct ? 1 : 0);

    let points = 0;
    // Grand Tour mixes games with different scoring rules, so the question can
    // name its own.
    const scoring = this.game.scoringFor ? this.game.scoringFor(q) : this.game.scoring;
    if (scoring === 'accuracy') {
      points = Math.round(BASE_POINTS * 1.6 * accuracy);
    } else if (correct) {
      points = BASE_POINTS;
      if (this.config.timer && result.timeLeftFraction != null) {
        points += Math.round(MAX_SPEED_BONUS * Math.max(0, result.timeLeftFraction));
      }
      points += Math.min(MAX_STREAK_BONUS, Math.max(0, player.streak) * 10);
    }
    if (stolenBy) points = Math.round(points * STEAL_FRACTION);

    player.asked++;
    player.score += points;
    if (correct) {
      player.correct++;
      player.streak++;
      player.bestStreak = Math.max(player.bestStreak, player.streak);
    } else {
      player.streak = 0;
    }

    if (q.iso) Store.recordCountry(q.iso, correct);
    if (q.isos) for (const iso of q.isos) Store.recordCountry(iso, correct);

    const entry = {
      index: this.index, playerId: player.id, correct, points, accuracy,
      pickedId: result.picked ?? null, stolen: !!stolenBy, question: q,
    };
    this.log.push(entry);
    return entry;
  }

  next() {
    this.index++;
    this.turn++;
    this.stealOpen = null;
    return !this.done;
  }

  /* Standings, highest first. Teams are summed; solo and pass-and-play list
     individuals. */
  standings() {
    if (this.mode === 'teams') {
      const byTeam = {};
      for (const p of this.players) {
        const t = byTeam[p.team] || (byTeam[p.team] = {
          id: p.team, name: p.team, emoji: '🏳️', colour: p.team === 'Team A' ? '#4cc9f0' : '#ef476f',
          score: 0, correct: 0, asked: 0, bestStreak: 0, members: [],
        });
        t.score += p.score; t.correct += p.correct; t.asked += p.asked;
        t.bestStreak = Math.max(t.bestStreak, p.bestStreak);
        t.members.push(p);
      }
      return Object.values(byTeam).sort((a, b) => b.score - a.score);
    }
    return this.players.slice().sort((a, b) => b.score - a.score);
  }

  summary() {
    const score = this.players.reduce((s, p) => s + p.score, 0);
    const correct = this.players.reduce((s, p) => s + p.correct, 0);
    const asked = this.players.reduce((s, p) => s + p.asked, 0);
    return {
      score, correct, asked,
      accuracy: asked ? correct / asked : 0,
      elapsedMs: Date.now() - this.startedAt,
      seed: this.seed,
    };
  }
}

/* ── the question pool ──────────────────────────────────────────────────────
   Every game builds from the same filtered pool, so difficulty and region mean
   the same thing everywhere. `require` lets a game insist on countries that
   have what it needs, for example a land border or a drawable outline. */
export function buildPool(countries, config, require = null) {
  const tiers = DIFFICULTY[config.difficulty].tiers;
  let pool = countries.filter(c => tiers.includes(c.tier));
  if (config.region && config.region !== 'all') {
    pool = pool.filter(c => c.region === config.region);
  }
  if (require) pool = pool.filter(require);

  // A region plus a strict filter can leave too few countries to make four
  // plausible options. Widen the tiers before giving up on the region, because
  // "I picked Africa" is a stronger preference than "I picked Explorer".
  if (pool.length < 8) {
    let wider = countries.filter(c => !config.region || config.region === 'all' || c.region === config.region);
    if (require) wider = wider.filter(require);
    if (wider.length >= 8) return wider;
    return countries.filter(c => (require ? require(c) : true));
  }
  return pool;
}

export function dailySeed(gameId) {
  return hashSeed(new Date().toISOString().slice(0, 10) + ':' + gameId);
}
