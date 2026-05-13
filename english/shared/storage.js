/* =========================================================
   /english/shared/storage.js
   Canonical progress store for /english/. Reuses the shared
   `jgl.progress` v2 schema so the cross-site Mirror/Compass
   can read effort, streak, sessions, and wellbeing alongside
   Science and Malay data. Per-topic English state lives in
   `english_progress` (parallel to `malay_progress` and
   `sciLab_progress`).

   No Supabase. Everything stays in localStorage, on this device.

   Exposes window.JglStorage with the same API surface as the
   Malay and Studio storage helpers — if either was loaded
   first the existing instance wins (single source of truth).
   ========================================================= */

(function (global) {
  if (global.JglStorage && global.JglStorage.STORAGE_KEY === 'jgl.progress') return;

  const STORAGE_KEY     = 'jgl.progress';
  const KEY_GEMINI      = 'jgl.geminiKey';
  const CURRENT_VERSION = 2;
  const SCILAB_GEMINI   = 'sciLab_gemini_key';

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
  function readRaw(key) { try { return localStorage.getItem(key) || null; } catch { return null; } }

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
