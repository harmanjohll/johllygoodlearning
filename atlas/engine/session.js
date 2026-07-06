/* ===========================================================================
   Family Atlas — Session & Turn orchestration (Layer 3)
   Owns the turn queue and the three modes (solo / teams / coop). Asks a game
   for a question, checks the answer, scores it once, applies rewards, logs a
   self-contained Turn record. Games see none of this.

   THE MULTIPLAYER SEAM: a Turn is { playerId, rank, question, answer, result }.
   Today the transport is this in-memory array on one shared screen. Later,
   own-device play ships the question to a device and the answer back — the
   check/score/reward path here is unchanged, so no game is rewritten.
   =========================================================================== */

import { Profiles } from './profiles.js';
import { buildContext } from './pool.js';
import { score } from './scoring.js';
import { applyTurn, touchStreak, awardComeback } from './gamification.js';
import { Store } from './storage.js';

let _sid = 0;
function newSessionId() { _sid += 1; return 's_' + _sid.toString(36) + Math.floor(performance.now()).toString(36); }

export class Session {
  /**
   * @param {object} cfg
   * @param {object} cfg.game        resolved game module (generate/check/render)
   * @param {string[]} cfg.playerIds
   * @param {'solo'|'teams'|'coop'} cfg.mode
   * @param {string} cfg.region      region id or 'all'
   * @param {number} [cfg.rounds]    questions per player (default 5)
   * @param {object} [cfg.teams]     { teamId: [playerId,...] } for teams mode
   * @param {number} [cfg.seed]      optional fixed seed (daily challenge)
   */
  constructor(cfg) {
    this.id = newSessionId();
    this.game = cfg.game;
    this.gameId = cfg.game.id;
    this.mode = cfg.mode;
    this.region = cfg.region || 'all';
    this.rounds = cfg.rounds || 5;
    this.playerIds = cfg.playerIds.slice();
    this.seedBase = (cfg.seed != null ? cfg.seed : Math.floor(performance.now())) >>> 0;

    // Round-robin so players alternate on the shared screen.
    this.turnOrder = [];
    for (let r = 0; r < this.rounds; r++) this.turnOrder.push(...this.playerIds);
    this.turnIndex = 0;

    // Per-mode tallies
    this.soloScores = Object.fromEntries(this.playerIds.map(id => [id, 0]));
    this.teams = cfg.teams || null;
    this.teamScores = this.teams ? Object.fromEntries(Object.keys(this.teams).map(t => [t, 0])) : null;
    this.coop = this.mode === 'coop'
      ? { sharedScore: 0, target: this.turnOrder.length * 55, lives: 3, maxLives: 3 }
      : null;

    // Session-local streak / miss tracking (for streak bonus + comeback badge)
    this._streaks = Object.fromEntries(this.playerIds.map(id => [id, 0]));
    this._recentMiss = Object.fromEntries(this.playerIds.map(id => [id, 0]));

    this.log = [];
    this._current = null;
    this.status = 'active';
  }

  currentPlayerId() { return this.turnOrder[this.turnIndex] || null; }
  isFinished() { return this.status === 'finished' || this.turnIndex >= this.turnOrder.length || (this.coop && this.coop.lives <= 0); }

  teamOf(playerId) {
    if (!this.teams) return null;
    return Object.keys(this.teams).find(t => this.teams[t].includes(playerId)) || null;
  }

  /** Prepare and return the next turn (question generated), or null if finished. */
  nextTurn() {
    if (this.isFinished()) { this.status = 'finished'; return null; }
    const playerId = this.currentPlayerId();
    const profile = Profiles.get(playerId);
    const seed = (this.seedBase * 2654435761 + this.turnIndex * 40503) >>> 0;
    const ctx = buildContext({ rankId: profile.rank, region: this.region, seed });
    const question = this.game.generate(ctx);
    this._current = { playerId, rank: profile.rank, ctx, question, startedAt: performance.now() };
    return {
      player: profile,
      rank: profile.rank,
      rankCfg: ctx.rankCfg,
      team: this.teamOf(playerId),
      ctx,
      question,
      game: this.game,
      index: this.turnIndex,
      total: this.turnOrder.length,
      round: Math.floor(this.turnIndex / this.playerIds.length) + 1,
      rounds: this.rounds,
    };
  }

  /**
   * Submit the active player's answer. Checks, scores, rewards, logs, advances.
   * @param {*} answerValue
   * @param {object} meta { ms, usedHint, timedOut }
   */
  submitAnswer(answerValue, meta = {}) {
    const cur = this._current;
    if (!cur) throw new Error('No active turn');
    const profile = Profiles.get(cur.playerId);
    const rankCfg = cur.ctx.rankCfg;
    const ms = meta.ms != null ? meta.ms : Math.round(performance.now() - cur.startedAt);

    const checked = meta.timedOut ? { correct: false, closeness: 0 } : this.game.check(cur.question, answerValue);
    const correct = !!checked.correct;

    // session streak (consecutive correct) feeds a small scoring bonus
    const streakBefore = this._streaks[cur.playerId];
    const scored = score({
      mode: this.mode, rank: cur.rank, correct, ms,
      usedHint: !!meta.usedHint, closeness: checked.closeness || 0,
      rankCfg, streak: streakBefore,
    });

    // Route the SAME scored object by mode.
    if (this.mode === 'solo') {
      this.soloScores[cur.playerId] += scored.weightedScore;
    } else if (this.mode === 'teams') {
      const t = this.teamOf(cur.playerId);
      if (t) this.teamScores[t] += scored.rawScore;
    } else if (this.mode === 'coop') {
      this.coop.sharedScore += scored.rawScore;
      if (!correct) this.coop.lives = Math.max(0, this.coop.lives - 1);
    }

    // streak + comeback bookkeeping
    let events = [];
    if (correct) {
      if (this._recentMiss[cur.playerId] >= 2) {
        const cb = awardComeback(profile);
        if (cb) events.push(cb);
      }
      this._streaks[cur.playerId] += 1;
      this._recentMiss[cur.playerId] = 0;
    } else {
      this._streaks[cur.playerId] = 0;
      this._recentMiss[cur.playerId] += 1;
    }

    // durable rewards (XP, stamps, streak day)
    events = events.concat(touchStreak(profile));
    const subject = this._subjectCountry(cur.question);
    events = events.concat(applyTurn(profile, {
      correct, region: subject ? subject.region : this.region,
      iso: subject ? subject.iso : null, rankId: cur.rank, scored,
      gameId: this.gameId,
    }));

    // Turn record — the serializable unit that would travel over a network later.
    this.log.push({
      turnIndex: this.turnIndex, playerId: cur.playerId, rank: cur.rank,
      question: this.game.describe ? this.game.describe(cur.question) : { answer: cur.question.answer },
      answer: { value: answerValue, ms, usedHint: !!meta.usedHint, timedOut: !!meta.timedOut },
      result: { correct, ...scored },
    });

    this.turnIndex += 1;
    if (this.isFinished()) this.status = 'finished';
    this._current = null;
    this.persist();

    return {
      correct, closeness: checked.closeness || 0, scored, events,
      subject, standings: this.standings(), coop: this.coop, finished: this.isFinished(),
    };
  }

  _subjectCountry(question) {
    // Games expose the answer ISO on the question (prompt.iso or answer) so the
    // session can attribute a stamp without knowing the game's internals.
    const iso = (question.prompt && question.prompt.iso) || question.subjectIso || (typeof question.answer === 'string' && question.answer.length === 2 ? question.answer : null);
    return iso ? this._current?.ctx.countries[iso] || null : (question.subject || null);
  }

  standings() {
    if (this.mode === 'teams') {
      return Object.keys(this.teamScores).map(t => ({
        kind: 'team', id: t, name: this.teams[t].label || t,
        score: this.teamScores[t],
        members: this.teams[t].map ? this.teams[t] : [],
      })).sort((a, b) => b.score - a.score);
    }
    if (this.mode === 'coop') {
      return [{ kind: 'coop', sharedScore: this.coop.sharedScore, target: this.coop.target, lives: this.coop.lives }];
    }
    return this.playerIds.map(id => {
      const p = Profiles.get(id);
      return { kind: 'solo', id, name: p.name, emoji: p.emoji, rank: p.rank, score: this.soloScores[id] };
    }).sort((a, b) => b.score - a.score);
  }

  // ── Persistence (resume) ────────────────────────────────────
  snapshot() {
    return {
      id: this.id, gameId: this.gameId, mode: this.mode, region: this.region,
      rounds: this.rounds, playerIds: this.playerIds, seedBase: this.seedBase,
      turnIndex: this.turnIndex, soloScores: this.soloScores, teams: this.teams,
      teamScores: this.teamScores, coop: this.coop, status: this.status,
      streaks: this._streaks, recentMiss: this._recentMiss, logLen: this.log.length,
    };
  }
  persist() { Store.saveSession(this.snapshot()); }

  static restore(snap, game) {
    const s = new Session({ game, playerIds: snap.playerIds, mode: snap.mode, region: snap.region, rounds: snap.rounds, teams: snap.teams, seed: snap.seedBase });
    Object.assign(s, {
      id: snap.id, turnIndex: snap.turnIndex, soloScores: snap.soloScores,
      teamScores: snap.teamScores, coop: snap.coop, status: snap.status,
      _streaks: snap.streaks || s._streaks, _recentMiss: snap.recentMiss || s._recentMiss,
    });
    return s;
  }
}
