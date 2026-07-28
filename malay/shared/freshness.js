/* =========================================================
   /malay/shared/freshness.js
   The anti-repeat ledger.

   Practice only works if the material keeps moving. Every
   generator in the studio routes through here: before asking
   Gemini for a new passage / stimulus / item set, it injects
   avoidList() into the prompt so the model knows what it has
   already produced; after a successful generation it calls
   mark() so the same thing never comes back.

   Buckets in use (Malay studio):
     'aloud'     Reading Aloud passages
     'sbc'       Stimulus-Based Conversation scenes
     'oralmock'  Full Paper 4 mock sets
     'listen'    Listening passages
     'compcloze' | 'gcloze' | 'editing' | 'synthesis' | 'visualtext' | 'compoe'
     'composition' composition prompts
     'daily'     Daily 10 item ids

   Exposes window.JglFresh.
   ========================================================= */

(function (global) {
  if (global.JglFresh) return;

  const KEY = 'jgl.malay.freshness';
  const CAP = 400;          // per bucket
  const AVOID_DEFAULT = 12;

  function readAll() {
    try { return JSON.parse(localStorage.getItem(KEY) || '{}') || {}; }
    catch { return {}; }
  }
  function writeAll(o) {
    try { localStorage.setItem(KEY, JSON.stringify(o)); } catch (_) { /* quota — silently degrade */ }
  }

  // FNV-1a. Short, stable, collision-tolerant enough for "have I
  // shown this before" — we are not signing anything.
  function hash(str) {
    let h = 0x811c9dc5;
    const s = String(str == null ? '' : str);
    for (let i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = (h + ((h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24))) >>> 0;
    }
    return h.toString(36);
  }

  // Normalise before hashing so trivial whitespace/case/punctuation
  // differences do not read as "brand new".
  function normKey(str) {
    return hash(String(str == null ? '' : str)
      .toLowerCase()
      .replace(/[^a-z0-9 ]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 300));
  }

  function list(bucket) {
    const all = readAll();
    return Array.isArray(all[bucket]) ? all[bucket] : [];
  }

  function seen(bucket, key) {
    const k = String(key);
    return list(bucket).some(e => e && e.key === k);
  }

  function mark(bucket, key, meta) {
    if (!bucket || key == null) return;
    const all = readAll();
    const arr = Array.isArray(all[bucket]) ? all[bucket] : [];
    const k = String(key);
    const existing = arr.findIndex(e => e && e.key === k);
    const entry = { key: k, meta: meta || {}, iso: new Date().toISOString() };
    if (existing !== -1) arr.splice(existing, 1);   // re-marking bumps it to newest
    arr.push(entry);
    all[bucket] = arr.slice(-CAP);
    writeAll(all);
  }

  function recent(bucket, n) {
    const arr = list(bucket).slice();
    arr.reverse();                                   // newest first
    return typeof n === 'number' ? arr.slice(0, n) : arr;
  }

  // Turn the ledger into prompt-ready text. Generators paste this in
  // under a "do NOT produce anything similar to these" heading.
  function avoidList(bucket, n) {
    return recent(bucket, n || AVOID_DEFAULT)
      .map(e => {
        const m = e.meta || {};
        const bits = [m.title, m.type, m.theme, m.topic, m.label, m.first]
          .filter(Boolean)
          .map(x => String(x).slice(0, 90));
        return bits.length ? bits.join(' — ') : e.key;
      })
      .filter(Boolean);
  }

  // Convenience for curated banks: hand it the array and a key fn,
  // get back the first unseen item, else the one seen longest ago.
  function pickUnseen(bucket, items, keyFn) {
    const arr = Array.isArray(items) ? items : [];
    if (!arr.length) return null;
    const kf = typeof keyFn === 'function' ? keyFn : (x => normKey(JSON.stringify(x)));

    for (const it of arr) {
      if (!seen(bucket, kf(it))) return it;
    }
    // Everything has been seen — return the least recently seen.
    const order = list(bucket).map(e => e.key);        // oldest first
    let best = arr[0];
    let bestIdx = Infinity;
    for (const it of arr) {
      const idx = order.indexOf(String(kf(it)));
      const rank = idx === -1 ? -1 : idx;              // -1 sorts first
      if (rank < bestIdx) { bestIdx = rank; best = it; }
    }
    return best;
  }

  function stats(bucket) {
    const arr = list(bucket);
    const cutoff = Date.now() - 7 * 86400000;
    let last7 = 0;
    arr.forEach(e => {
      const t = Date.parse(e.iso || '');
      if (!isNaN(t) && t >= cutoff) last7 += 1;
    });
    return { total: arr.length, last7 };
  }

  function clear(bucket) {
    const all = readAll();
    if (bucket) delete all[bucket]; else return writeAll({});
    writeAll(all);
  }

  function buckets() {
    return Object.keys(readAll());
  }

  global.JglFresh = {
    hash, normKey, seen, mark, recent, avoidList, pickUnseen, stats, clear, buckets,
    KEY, CAP,
  };
})(typeof window !== 'undefined' ? window : globalThis);
