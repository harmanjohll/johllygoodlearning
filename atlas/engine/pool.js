/* ===========================================================================
   Family Atlas — Question pool + GameContext builder
   Turns (rank, region, seed) into the context a sub-game needs: which countries
   this player may be asked (subjects), a seeded RNG, and a distractor picker
   that prefers plausible same-region wrong answers.
   =========================================================================== */

import { COUNTRIES, BY_ISO } from '../data/countries.js';
import { rankCfg } from '../data/tiers.js';

// Deterministic RNG (mulberry32) so the daily challenge is reproducible.
export function makeRng(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle(arr, rng) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Countries a player of this rank may be ASKED about, within a region. */
export function subjectPool(rankId, region) {
  const cfg = rankCfg(rankId);
  const tiers = new Set(cfg.tiers);
  let list = COUNTRIES.filter(c => tiers.has(c.tier));
  if (region && region !== 'all') list = list.filter(c => c.region === region);
  // Prefer the most famous when we must cap: sort by tier then name.
  list.sort((a, b) => a.tier - b.tier || a.name.localeCompare(b.name));
  return list.slice(0, cfg.maxCountries);
}

/** Broader pool (all regions) at this rank, for sourcing wrong answers. */
export function distractorPool(rankId) {
  const cfg = rankCfg(rankId);
  const tiers = new Set(cfg.tiers);
  return COUNTRIES.filter(c => tiers.has(c.tier));
}

/**
 * Build the GameContext handed to a sub-game (Layer 1).
 * The game never sees ranks-as-policy beyond rankCfg, nor scoring, nor turns.
 */
export function buildContext({ rankId, region, seed }) {
  const cfg = rankCfg(rankId);
  const rng = makeRng(seed);
  const pool = subjectPool(rankId, region);
  const distractors = distractorPool(rankId);

  return {
    rank: rankId,
    rankCfg: cfg,
    region: region || 'all',
    pool,
    rankPool: distractors,        // all-region countries at this rank (for cross-region distractors)
    countries: BY_ISO,
    rng,
    shuffle: (arr) => shuffle(arr, rng),

    /** Pick one subject country for the question. */
    pickSubject() {
      return pool[Math.floor(rng() * pool.length)];
    },

    /**
     * n plausible wrong-answer countries, distinct from `correct`.
     * Prefers same subregion, then same region, then anything at this rank.
     */
    pick(correct, n) {
      const not = c => c.iso !== correct.iso;
      const sameSub = distractors.filter(c => not(c) && c.subregion === correct.subregion);
      const sameReg = distractors.filter(c => not(c) && c.region === correct.region && c.subregion !== correct.subregion);
      const rest = distractors.filter(c => not(c) && c.region !== correct.region);
      const ordered = [...shuffle(sameSub, rng), ...shuffle(sameReg, rng), ...shuffle(rest, rng)];
      return ordered.slice(0, n);
    },
  };
}
