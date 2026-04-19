/* =========================================================
   /studio/shared/storage.js
   Canonical progress store for /studio/. Backed by
   localStorage key `jgl.progress`, v2 schema (CLAUDE.md §8.3).
   Runs one-time migration from the legacy sciLab_* keys.
   sciLab_* keys are NEVER deleted — /lab/ keeps reading them.
   Exposes window.JglStorage.
   ========================================================= */

(function (global) {
  const STORAGE_KEY = 'jgl.progress';
  const KEY_GEMINI  = 'jgl.geminiKey';
  const CURRENT_VERSION = 2;

  const SCILAB_PROGRESS = 'sciLab_progress';
  const SCILAB_META     = 'sciLab_meta';
  const SCILAB_GEMINI   = 'sciLab_gemini_key';
  const SCILAB_LEVELS   = 'sciLab_levels';
  const SCILAB_FCSTREAK = 'sciLab_fcStreak';
  const SCILAB_MINDMAP_PREFIX = 'sciLab_mindmap_';

  function emptyProgress() {
    return {
      version: CURRENT_VERSION,
      student: { id: null, level: null },
      streak: { current: 0, longest: 0, lastStudiedIso: null, restDaysUsed: 0, activeDays: [] },
      terms: {},
      questions: {},
      topics: {},
      sessions: [],
      effort: { dailyMinutes: {} },
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

  function masteryFromLegacy(p) {
    if (!p) return 0;
    let score = 0;
    if ((p.visitCount || 0) > 0) score += 10;
    if (p.simUsed)               score += 30;
    if (p.mindMapSaved)          score += 20;
    if ((p.quizTotal || 0) > 0)  score += Math.round((p.quizScore / p.quizTotal) * 40);
    return Math.min(score, 100);
  }

  function migrateFromSciLab(current) {
    const out = current || emptyProgress();

    const legacyProgress = readJSON(SCILAB_PROGRESS, {}) || {};
    const legacyLevels   = readJSON(SCILAB_LEVELS, {})   || {};

    const topicIds = new Set([...Object.keys(legacyProgress), ...Object.keys(legacyLevels)]);
    topicIds.forEach(id => {
      const legacy = legacyProgress[id] || {};
      const mindMapRaw = readRaw(SCILAB_MINDMAP_PREFIX + id);
      out.topics[id] = {
        mastery:       masteryFromLegacy(legacy),
        timeSpentMs:   0,
        lastOpenedIso: legacy.lastQuizDate || null,
        level:         legacyLevels[id] || null,
        legacy:        { ...legacy },
        mindMap:       mindMapRaw ? JSON.parse(mindMapRaw) : null,
      };
    });

    const meta = readJSON(SCILAB_META, {}) || {};
    if (meta && Object.keys(meta).length) {
      out.streak.current        = meta.streak || 0;
      out.streak.longest        = Math.max(meta.longestStreak || 0, out.streak.longest || 0);
      out.streak.lastStudiedIso = meta.lastActivity || null;
      out.streak.activeDays     = Array.isArray(meta.activeDays) ? meta.activeDays.slice(-28) : [];
    }

    const fc = readJSON(SCILAB_FCSTREAK, null);
    if (fc && typeof fc.count === 'number') {
      out.streak.current = Math.max(out.streak.current, fc.count);
      if (fc.lastDate && !out.streak.lastStudiedIso) out.streak.lastStudiedIso = fc.lastDate;
    }

    const gemini = readRaw(SCILAB_GEMINI);
    if (gemini && !readRaw(KEY_GEMINI)) {
      try { localStorage.setItem(KEY_GEMINI, gemini); } catch {}
    }

    out.version = CURRENT_VERSION;
    return out;
  }

  function getProgress() {
    // Phase 1 stance: sciLab_* keys remain the live source of truth
    // (/lab/ still writes them, /studio/'s shared.js still writes them),
    // so we re-run the migration on every load to keep jgl.progress
    // reflective of current state. Phase 2+ will flip the direction
    // once /studio/ reads/writes jgl.progress natively.
    const stored = readJSON(STORAGE_KEY, null) || emptyProgress();
    const synced = migrateFromSciLab(stored);
    writeJSON(STORAGE_KEY, synced);
    return synced;
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
    try { localStorage.setItem(KEY_GEMINI, trimmed); } catch {}
    // Keep legacy key in sync so shared.js AIConfig continues to work.
    try { localStorage.setItem(SCILAB_GEMINI, trimmed); } catch {}
  }

  // Auto-run on first load so jgl.progress always exists once /studio/ is opened.
  try { getProgress(); } catch (err) { console.warn('JglStorage init failed', err); }

  global.JglStorage = {
    STORAGE_KEY,
    CURRENT_VERSION,
    getProgress,
    setProgress,
    update,
    getGeminiKey,
    setGeminiKey,
    migrateFromSciLab,
  };
})(typeof window !== 'undefined' ? window : globalThis);
