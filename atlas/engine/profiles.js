/* ===========================================================================
   Family Atlas — Player profiles
   CRUD + the XP/level curve. A profile is the durable record of one traveller:
   their rank, passport stamps, streak and lifetime stats.
   =========================================================================== */

import { Store } from './storage.js';

// Level curve: gentle at first, never punishing. level 1 at 0xp, and each level
// costs a bit more than the last (quadratic). Denormalised onto the profile.
export function levelForXp(xp) {
  return Math.floor(Math.sqrt(Math.max(0, xp) / 45)) + 1;
}
export function xpForLevel(level) {
  return Math.round(45 * (level - 1) ** 2);
}
export function levelProgress(xp) {
  const level = levelForXp(xp);
  const base = xpForLevel(level);
  const next = xpForLevel(level + 1);
  return { level, into: xp - base, span: next - base, pct: Math.round(((xp - base) / (next - base)) * 100) };
}

const AVATARS = ['\u{1F98A}', '\u{1F435}', '\u{1F431}', '\u{1F438}', '\u{1F984}', '\u{1F419}',
  '\u{1F427}', '\u{1F981}', '\u{1F43C}', '\u{1F98B}', '\u{1F41D}', '\u{1F422}'];

let _seq = 0;
function newId() {
  // No Date.now()/Math.random() reliance for the prefix; a counter + perf-ish salt.
  _seq += 1;
  return 'p_' + (_seq).toString(36) + '_' + Math.floor(performance.now()).toString(36);
}

function blank(name, emoji, rank) {
  return {
    id: newId(),
    name: name.trim().slice(0, 20) || 'Traveller',
    emoji: emoji || AVATARS[0],
    rank: rank || 'explorer',
    xp: 0,
    level: 1,
    stamps: [],              // e.g. "europe:FR", "region:europe", "game:flags/guess-the-flag:first"
    regionsSeen: [],         // regions the player has answered in
    badges: [],              // effort badges (ids)
    streak: { count: 0, lastPlayed: null, best: 0 },
    stats: { played: 0, correct: 0, byGame: {} },
    createdAt: null,         // set lazily below to keep newId deterministic-ish
  };
}

export const Profiles = {
  AVATARS,

  all() { return Store.profiles(); },
  list() { return Object.values(this.all()); },
  get(id) { return this.all()[id] || null; },

  create(name, emoji, rank) {
    const p = blank(name, emoji, rank);
    const all = this.all();
    all[p.id] = p;
    Store.saveProfiles(all);
    return p;
  },

  save(profile) {
    const all = this.all();
    all[profile.id] = profile;
    Store.saveProfiles(all);
    return profile;
  },

  update(id, patch) {
    const all = this.all();
    if (!all[id]) return null;
    all[id] = { ...all[id], ...patch };
    Store.saveProfiles(all);
    return all[id];
  },

  remove(id) {
    const all = this.all();
    delete all[id];
    Store.saveProfiles(all);
  },

  setRank(id, rank) { return this.update(id, { rank }); },
};
