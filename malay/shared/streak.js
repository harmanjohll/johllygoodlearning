/* =========================================================
   /malay/shared/streak.js
   Humane streak manager, ported from /studio/shared/streak.js.
   - record()       : called when a session begins; updates current
                      streak honouring "never miss twice" and rest days.
   - takeRestDay()  : marks today as rest; does NOT reset the streak.
   - status()       : returns { current, longest, lastIso, gapDays,
                      isRestDay, shouldOfferRest, neverMissTwice }.
   Reads/writes p.streak inside the shared jgl.progress key when
   JglStorage is present, and mirrors into malay_meta for the
   site-local Streak widget in /malay/shared.js.
   Exposes window.MalayStreak.
   ========================================================= */

(function (global) {
  function iso(d)       { return (d || new Date()).toISOString().slice(0, 10); }
  function addDays(s, n) { const d = new Date(s); d.setUTCDate(d.getUTCDate() + n); return iso(d); }
  function diffDays(a, b) {
    if (!a || !b) return Infinity;
    const A = Date.parse(a), B = Date.parse(b);
    return Math.round((B - A) / 86400000);
  }

  function ensureStreak(p) {
    p.streak = p.streak || {};
    if (typeof p.streak.current !== 'number')      p.streak.current = 0;
    if (typeof p.streak.longest !== 'number')      p.streak.longest = 0;
    if (typeof p.streak.restDaysUsed !== 'number') p.streak.restDaysUsed = 0;
    if (!Array.isArray(p.streak.activeDays))       p.streak.activeDays = [];
    if (!Array.isArray(p.streak.restDays))         p.streak.restDays = [];
    return p.streak;
  }

  function record() {
    if (!global.JglStorage) return null;
    const today = iso();
    let snapshot = null;
    global.JglStorage.update(p => {
      const s = ensureStreak(p);
      if (s.lastStudiedIso === today) { snapshot = { ...s }; return p; }

      const last = s.lastStudiedIso;
      if (!last) {
        s.current = 1;
      } else {
        const gap = diffDays(last, today);
        if (gap === 1) {
          s.current += 1;
        } else if (gap >= 2) {
          let allRested = true;
          for (let i = 1; i < gap; i++) {
            const d = addDays(last, i);
            if (!s.restDays.includes(d)) { allRested = false; break; }
          }
          s.current = allRested ? s.current + 1 : 1;
        }
      }
      s.lastStudiedIso = today;
      s.longest = Math.max(s.longest, s.current);
      if (!s.activeDays.includes(today)) s.activeDays.push(today);
      s.activeDays = s.activeDays.slice(-60);
      snapshot = { ...s };
      return p;
    });
    syncToMalayMeta(snapshot);
    return snapshot;
  }

  function syncToMalayMeta(s) {
    try {
      const raw = localStorage.getItem('malay_meta');
      const meta = raw ? JSON.parse(raw) : {};
      meta.streak = s.current || 0;
      meta.longestStreak = Math.max(meta.longestStreak || 0, s.longest || 0);
      meta.lastActivity = s.lastStudiedIso || meta.lastActivity || null;
      const days = Array.isArray(meta.activeDays) ? meta.activeDays : [];
      const today = iso();
      if (s.lastStudiedIso === today && !days.includes(today)) days.push(today);
      meta.activeDays = days.slice(-14);
      localStorage.setItem('malay_meta', JSON.stringify(meta));
    } catch {}
  }

  function takeRestDay() {
    if (!global.JglStorage) return null;
    const today = iso();
    let snapshot = null;
    global.JglStorage.update(p => {
      const s = ensureStreak(p);
      if (!s.restDays.includes(today)) {
        s.restDays.push(today);
        s.restDaysUsed = (s.restDaysUsed || 0) + 1;
      }
      s.restDays = s.restDays.slice(-60);
      snapshot = { ...s };
      return p;
    });
    syncToMalayMeta(snapshot);
    return snapshot;
  }

  function status() {
    if (!global.JglStorage) {
      return { current: 0, longest: 0, lastIso: null, gapDays: Infinity,
               isRestDay: false, shouldOfferRest: false, neverMissTwice: false };
    }
    const p = global.JglStorage.getProgress();
    const s = ensureStreak(p);
    const today = iso();
    const gap = s.lastStudiedIso ? diffDays(s.lastStudiedIso, today) : Infinity;
    const isRestDay = s.restDays && s.restDays.includes(today);
    const shouldOfferRest = s.current >= 5 && s.lastStudiedIso !== today && !isRestDay;
    let interveningRested = false;
    if (s.lastStudiedIso && gap >= 2) {
      interveningRested = true;
      for (let i = 1; i < gap; i++) {
        if (!s.restDays.includes(addDays(s.lastStudiedIso, i))) { interveningRested = false; break; }
      }
    }
    const neverMissTwice = gap >= 2 && !interveningRested;
    return {
      current: s.current || 0,
      longest: s.longest || 0,
      lastIso: s.lastStudiedIso || null,
      gapDays: gap,
      isRestDay,
      shouldOfferRest,
      neverMissTwice,
      restDaysUsed: s.restDaysUsed || 0,
      activeDays: s.activeDays ? s.activeDays.slice() : [],
    };
  }

  global.MalayStreak = { record, takeRestDay, status };
})(typeof window !== 'undefined' ? window : globalThis);
