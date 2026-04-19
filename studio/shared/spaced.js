/* =========================================================
   /studio/shared/spaced.js
   Scaffold for the SM-2-style scheduler (CLAUDE.md §8.3).
   Phase 1 exports stubs that compute deterministic next-due
   dates; Phase 4 replaces them with the real scheduler.
   ========================================================= */

(function (global) {
  const INTERVALS_DAYS = [1, 2, 4, 8, 16, 30];

  function addDays(iso, days) {
    const base = iso ? new Date(iso) : new Date();
    base.setUTCDate(base.getUTCDate() + days);
    return base.toISOString().slice(0, 10);
  }

  function nextDue({ attempts = 0, success = true, fromIso = null }) {
    if (!success) return addDays(fromIso, INTERVALS_DAYS[0]);
    const idx = Math.min(attempts, INTERVALS_DAYS.length - 1);
    return addDays(fromIso, INTERVALS_DAYS[idx]);
  }

  global.JglSpaced = {
    INTERVALS_DAYS,
    nextDue,
  };
})(typeof window !== 'undefined' ? window : globalThis);
