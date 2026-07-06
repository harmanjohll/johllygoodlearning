/* ===========================================================================
   Family Atlas — Scoring (pure, the single source of truth)
   Games return only correctness (+ optional closeness for typed answers). All
   points are computed here so no game reimplements scoring, and so the three
   session modes route the SAME scored object differently.
   =========================================================================== */

/**
 * @param {object} p
 * @param {'solo'|'teams'|'coop'} p.mode
 * @param {string} p.rank
 * @param {boolean} p.correct
 * @param {number} p.ms          time taken to answer
 * @param {boolean} p.usedHint
 * @param {number} [p.closeness] 0..1 for typed near-misses
 * @param {object} p.rankCfg
 * @param {number} [p.streak]    current in-session correct streak (for a small bonus)
 * @returns {{rawScore:number, weightedScore:number, xpGained:number, speedBonus:number}}
 */
export function score({ mode, rank, correct, ms, usedHint, closeness = 0, rankCfg, streak = 0 }) {
  if (!correct) {
    // A near-miss (typed answer very close) still earns a little effort XP.
    const effortXp = closeness > 0.6 ? 3 : 1;
    return { rawScore: 0, weightedScore: 0, xpGained: effortXp, speedBonus: 0 };
  }

  const timer = rankCfg.timerMs || 15000;
  const speed = Math.max(0, 1 - ms / timer);            // 1.0 instant -> 0 at timeout
  const speedBonus = Math.round(40 * speed);
  const hintPenalty = usedHint ? 15 : 0;
  const streakBonus = Math.min(streak, 5) * 4;          // caps at +20
  const raw = Math.max(10, 60 + speedBonus + streakBonus - hintPenalty);

  // Age handicap only applies in SOLO mode, so the youngest can genuinely win.
  // In teams/coop the balance comes from the easier pool, not a multiplier.
  const handicap = mode === 'solo' ? (rankCfg.handicap || 1) : 1;
  const weighted = Math.round(raw * handicap);

  const xpGained = 8 + Math.round(12 * speed) + (usedHint ? 0 : 2);

  return { rawScore: raw, weightedScore: weighted, xpGained, speedBonus };
}
