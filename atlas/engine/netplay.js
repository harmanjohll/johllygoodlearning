/* ===========================================================================
   Family Atlas — Netplay (Phase 4)
   Peer-to-peer multiplayer over PeerJS, host-authoritative. The host runs the
   authoritative Match (generates questions, checks answers, scores, keeps the
   live scoreboard); every player — including the host — talks to it through the
   SAME transport contract, so one client code path drives both.

   Transport contract (duck-typed): { send(obj), on(fn), onClose(fn), close() }.
   Two implementations: a network transport (PeerJS DataConnection) and an
   in-process loopback pair used for headless tests. PeerJS is lazy-loaded from a
   CDN only when a real room is created/joined, so same-device play never depends
   on the network.
   =========================================================================== */

import { gameById } from './registry.js';
import { buildContext } from './pool.js';
import { score } from './scoring.js';

const PEERJS_CDN = 'https://cdn.jsdelivr.net/npm/peerjs@1.5.4/+esm';
const ID_PREFIX = 'jgl-atlas-';
const CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'; // no ambiguous chars

function clone(o) { try { return structuredClone(o); } catch { return JSON.parse(JSON.stringify(o)); } }

// ── Loopback transport (tests / host-local player) ──────────
export function loopbackPair() {
  const mk = () => ({ _peer: null, _closed: false, _msg: [], _close: [],
    send(obj) { const p = this._peer; if (!p || p._closed) return; const m = clone(obj); Promise.resolve().then(() => p._msg.forEach(fn => fn(m))); },
    on(fn) { this._msg.push(fn); return this; },
    onClose(fn) { this._close.push(fn); return this; },
    close() { if (this._closed) return; this._closed = true; const p = this._peer; this._close.forEach(fn => fn()); if (p && !p._closed) p.close(); } });
  const a = mk(), b = mk(); a._peer = b; b._peer = a; return [a, b];
}

function wrapPeerConn(conn) {
  const t = { _msg: [], _close: [],
    send(obj) { try { conn.send(obj); } catch {} },
    on(fn) { this._msg.push(fn); return this; },
    onClose(fn) { this._close.push(fn); return this; },
    close() { try { conn.close(); } catch {} } };
  conn.on('data', d => t._msg.forEach(fn => fn(d)));
  conn.on('close', () => t._close.forEach(fn => fn()));
  return t;
}

let _PeerCtor = null;
async function loadPeer() {
  if (_PeerCtor) return _PeerCtor;
  const mod = await import(/* @vite-ignore */ PEERJS_CDN);
  _PeerCtor = mod.Peer || mod.default || (mod.default && mod.default.Peer);
  if (!_PeerCtor) throw new Error('PeerJS failed to load');
  return _PeerCtor;
}

function randomCode() {
  let s = ''; for (let i = 0; i < 4; i++) s += CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)];
  return s;
}

// ── Host: accept connections, expose them to a Match ────────
export async function createRoom({ onConnection, onError } = {}) {
  const Peer = await loadPeer();
  let code, peer;
  // try a few codes in case of collision on the public broker
  for (let attempt = 0; attempt < 5; attempt++) {
    code = randomCode();
    const ok = await new Promise((resolve) => {
      peer = new Peer(ID_PREFIX + code);
      const to = setTimeout(() => resolve(false), 8000);
      peer.on('open', () => { clearTimeout(to); resolve(true); });
      peer.on('error', (e) => { clearTimeout(to); if (e && e.type === 'unavailable-id') { try { peer.destroy(); } catch {} resolve(false); } else { if (onError) onError(e); resolve(true); } });
    });
    if (ok) break;
  }
  peer.on('connection', (conn) => { conn.on('open', () => onConnection && onConnection(wrapPeerConn(conn))); });
  return { code, transport: null, destroy() { try { peer.destroy(); } catch {} } };
}

// ── Client: connect to a host code ──────────────────────────
export async function joinRoom(code) {
  const Peer = await loadPeer();
  const peer = new Peer();
  return await new Promise((resolve, reject) => {
    const to = setTimeout(() => reject(new Error('Could not reach the room. Check the code.')), 12000);
    peer.on('open', () => {
      const conn = peer.connect(ID_PREFIX + code.toUpperCase(), { reliable: true });
      conn.on('open', () => { clearTimeout(to); resolve({ transport: wrapPeerConn(conn), destroy() { try { peer.destroy(); } catch {} } }); });
      conn.on('error', (e) => { clearTimeout(to); reject(e); });
    });
    peer.on('error', (e) => { clearTimeout(to); reject(e); });
  });
}

// ── Match: host-authoritative game controller (DOM-free) ────
export class Match {
  constructor({ onEvent } = {}) {
    this.players = new Map();     // id -> state
    this.order = [];
    this.config = null;
    this.status = 'lobby';
    this.turnPtr = 0;
    this._seed = 1;
    this.onEvent = onEvent || (() => {});
  }

  roster() { return this.order.map(id => { const p = this.players.get(id); return { id, name: p.name, emoji: p.emoji, rank: p.rank, score: p.score, done: p.done }; }); }
  broadcast(msg) { this.players.forEach(p => p.conn.send(msg)); }
  _sendRoster() { this.broadcast({ t: 'roster', players: this.roster() }); this.onEvent('roster', this.roster()); }
  _sendScoreboard() { const s = this.roster().sort((a, b) => b.score - a.score); this.broadcast({ t: 'scoreboard', standings: s }); this.onEvent('scoreboard', s); }

  /** Register a transport as a pending player; it becomes active on its 'join'. */
  addConnection(conn) {
    conn.on((msg) => this._onMessage(conn, msg));
    conn.onClose(() => this._removeByConn(conn));
  }

  _onMessage(conn, msg) {
    if (!msg || !msg.t) return;
    if (msg.t === 'join') {
      const id = msg.id || ('p' + (this.players.size + 1) + Math.floor(Math.random() * 1e4).toString(36));
      this.players.set(id, { id, name: (msg.name || 'Player').slice(0, 16), emoji: msg.emoji || '🙂', rank: msg.rank || 'explorer', conn, score: 0, roundIdx: 0, done: false, currentQ: null });
      if (!this.order.includes(id)) this.order.push(id);
      conn._pid = id;
      conn.send({ t: 'joined', id });
      this._sendRoster();
    } else if (msg.t === 'answer') {
      this._onAnswer(conn._pid, msg);
    } else if (msg.t === 'leave') {
      this._removeByConn(conn);
    }
  }

  _removeByConn(conn) {
    const id = conn._pid;
    if (id && this.players.has(id)) {
      this.players.delete(id);
      this.order = this.order.filter(x => x !== id);
      if (this.status === 'lobby') this._sendRoster();
      else { this._sendScoreboard(); if (this.status === 'turn') this._maybeAdvanceTurn(id); if (this._allRaceDone()) this._end(); }
      this.onEvent('leave', id);
    }
  }

  start(config) {
    this.config = { rounds: 6, ...config };
    this.status = config.mode === 'turn' ? 'turn' : 'race';
    this.turnPtr = 0;
    this.players.forEach(p => { p.score = 0; p.roundIdx = 0; p.done = false; });
    this.broadcast({ t: 'config', ...this.config });
    if (this.status === 'race') { this.players.forEach(p => this._sendQuestion(p)); }
    else { this._sendTurn(); }
    this._sendScoreboard();
  }

  _ctx(rank) { this._seed = (this._seed * 1103515245 + 12345) >>> 0; return buildContext({ rankId: rank, region: this.config.region, seed: this._seed }); }
  _game() { return gameById(this.config.gameId); }

  _sendQuestion(p) {
    const game = this._game();
    const q = game.generate(this._ctx(p.rank));
    p.currentQ = q;
    p.conn.send({ t: 'question', mode: 'race', q: clone(q), index: p.roundIdx, total: this.config.rounds });
  }

  _sendTurn() {
    const n = this.order.length;
    if (!n) return this._end();
    if (this.turnPtr >= this.config.rounds * n) return this._end();
    const activeId = this.order[this.turnPtr % n];
    const active = this.players.get(activeId);
    if (!active) { this.turnPtr++; return this._sendTurn(); }
    const game = this._game();
    const q = game.generate(this._ctx(active.rank));
    active.currentQ = q;
    active.conn.send({ t: 'question', mode: 'turn', q: clone(q), index: this.turnPtr, total: this.config.rounds * n });
    this.players.forEach(p => { if (p.id !== activeId) p.conn.send({ t: 'spectate', activeId, activeName: active.name, activeEmoji: active.emoji }); });
    this._activeTurnId = activeId;
  }

  _maybeAdvanceTurn(leftId) { if (this._activeTurnId === leftId) { this.turnPtr++; this._sendTurn(); } }

  _onAnswer(pid, msg) {
    const p = this.players.get(pid);
    if (!p || !p.currentQ) return;
    if (this.status === 'race' && msg.index !== p.roundIdx) return;
    const game = this._game();
    const checked = msg.timedOut ? { correct: false, closeness: 0 } : game.check(p.currentQ, msg.value);
    const rankCfg = this._ctx(p.rank).rankCfg;
    const scored = score({ mode: 'solo', rank: p.rank, correct: checked.correct, ms: msg.ms || 0, usedHint: !!msg.usedHint, closeness: checked.closeness || 0, rankCfg });
    p.score += scored.weightedScore;
    const answer = game.describe ? game.describe(p.currentQ).answer : '';
    p.conn.send({ t: 'result', correct: checked.correct, points: scored.weightedScore, answer, closeness: checked.closeness || 0 });
    p.currentQ = null;
    this._sendScoreboard();
    if (this.status === 'race') {
      p.roundIdx++;
      if (p.roundIdx >= this.config.rounds) { p.done = true; if (this._allRaceDone()) this._end(); }
      else this._sendQuestion(p);
    } else {
      this.turnPtr++;
      this._sendTurn();
    }
  }

  _allRaceDone() { return this.order.length > 0 && this.order.every(id => { const p = this.players.get(id); return p && p.done; }); }

  _end() {
    this.status = 'ended';
    const standings = this.roster().sort((a, b) => b.score - a.score);
    this.broadcast({ t: 'end', standings });
    this.onEvent('end', standings);
  }
}
