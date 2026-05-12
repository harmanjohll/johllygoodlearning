/* =========================================================
   /malay/shared/storage.js
   Canonical progress store for /malay/. Reuses the shared
   `jgl.progress` v2 schema so the cross-site Mirror/Compass
   can read effort, streak, sessions, and wellbeing alongside
   Studio data. Per-topic Malay state lives in `malay_progress`
   (parallel to Studio's `sciLab_progress`).

   No Supabase. Everything stays in localStorage, on this device.

   Exposes window.JglStorage with the same API surface as
   /studio/shared/storage.js — if Studio's storage.js is loaded
   first the existing instance wins (single source of truth).
   ========================================================= */

(function (global) {
  // If Studio already mounted JglStorage, reuse it. Both sites
  // funnel into the same `jgl.progress` key.
  if (global.JglStorage && global.JglStorage.STORAGE_KEY === 'jgl.progress') return;

  const STORAGE_KEY     = 'jgl.progress';
  const KEY_GEMINI      = 'jgl.geminiKey';
  const CURRENT_VERSION = 2;

  // Optional fallbacks: if Studio is the only site that's been
  // used, the existing legacy Gemini key under sciLab_gemini_key
  // is still honoured so the student does not re-enter it.
  const SCILAB_GEMINI = 'sciLab_gemini_key';

  function emptyProgress() {
    return {
      version: CURRENT_VERSION,
      student:   { id: null, level: null },
      streak:    { current: 0, longest: 0, lastStudiedIso: null, restDaysUsed: 0, activeDays: [], restDays: [] },
      terms:     {},
      questions: {},
      topics:    {},
      sessions:  [],
      effort:    { dailyMinutes: {} },
      wellbeing: { lastCheckInIso: null, recentMoodScores: [] },
    };
  }

  function readJSON(key, fallback = null) {
    try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; }
    catch { return fallback; }
  }

  function writeJSON(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); }
    catch (err) { console.warn('JglStorage write failed for', key, err); }
  }

  function readRaw(key) {
    try { return localStorage.getItem(key) || null; } catch { return null; }
  }

  function getProgress() {
    const stored = readJSON(STORAGE_KEY, null) || emptyProgress();
    stored.version = CURRENT_VERSION;
    return stored;
  }

  function setProgress(next) {
    if (!next || typeof next !== 'object') return;
    next.version = CURRENT_VERSION;
    writeJSON(STORAGE_KEY, next);
  }

  function update(mutator) {
    const p = getProgress();
    const result = mutator(p);
    setProgress(result || p);
  }

  function getGeminiKey() {
    return readRaw(KEY_GEMINI) || readRaw(SCILAB_GEMINI) || '';
  }

  function setGeminiKey(key) {
    const trimmed = (key || '').trim();
    if (!trimmed) return;
    const prev = getGeminiKey();
    try { localStorage.setItem(KEY_GEMINI, trimmed); } catch {}
    if (prev !== trimmed) {
      try {
        document.dispatchEvent(new CustomEvent('jgl:gemini-key-changed', {
          detail: { key: trimmed, hadKey: !!prev }
        }));
      } catch {}
    }
  }

  // Ensure jgl.progress exists once /malay/ is opened, even before
  // any session is recorded, so Mirror has a non-null shape to read.
  try { getProgress(); } catch (err) { console.warn('JglStorage init failed', err); }

  global.JglStorage = {
    STORAGE_KEY,
    CURRENT_VERSION,
    getProgress,
    setProgress,
    update,
    getGeminiKey,
    setGeminiKey,
  };
})(typeof window !== 'undefined' ? window : globalThis);
