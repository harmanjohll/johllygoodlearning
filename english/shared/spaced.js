/* =========================================================
   /english/shared/spaced.js
   Scaffold for the SM-2-style scheduler (CLAUDE.md §8.3).
   Phase 1 exports stubs that compute deterministic next-due
   dates; later phases replace them with the real scheduler.
   Verbatim copy of /malay/shared/spaced.js and
   /studio/shared/spaced.js — single source of truth.
   ========================================================= */

(function (global) {
  if (global.JglSpaced) return;

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

  global.JglSpaced = { INTERVALS_DAYS, nextDue };
})(typeof window !== 'undefined' ? window : globalThis);
