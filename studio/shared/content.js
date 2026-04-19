/* =========================================================
   /studio/shared/content.js
   Loads topic/theme content JSON from /studio/shared/content/.
   Phase 1: infrastructure only. Themes are seeded progressively
   as topics are extracted from inline HTML (circuits is the
   pilot). Callers get graceful empty objects when data is
   missing, so pages that still render inline HTML keep working.
   Exposes window.JglContent.
   ========================================================= */

(function (global) {
  const THEMES = ['diversity', 'cycles', 'systems', 'interactions', 'energy'];
  const themeCache = Object.create(null);
  const inflight   = Object.create(null);

  function basePath() {
    // Content lives at /studio/shared/content/<theme>.json. Resolve relative
    // to the script location so nested pages (e.g. /studio/topics/<x>/) work.
    const scripts = document.getElementsByTagName('script');
    for (let i = scripts.length - 1; i >= 0; i--) {
      const src = scripts[i].src || '';
      if (src.indexOf('/shared/content.js') !== -1) {
        return src.replace(/content\.js.*$/, 'content/');
      }
    }
    return 'shared/content/';
  }

  async function loadTheme(themeId) {
    if (!THEMES.includes(themeId)) return { topics: {} };
    if (themeCache[themeId]) return themeCache[themeId];
    if (inflight[themeId])   return inflight[themeId];

    const url = basePath() + themeId + '.json';
    inflight[themeId] = fetch(url, { cache: 'no-cache' })
      .then(r => r.ok ? r.json() : { topics: {} })
      .catch(() => ({ topics: {} }))
      .then(data => {
        themeCache[themeId] = data;
        delete inflight[themeId];
        return data;
      });
    return inflight[themeId];
  }

  async function loadAllThemes() {
    const results = await Promise.all(THEMES.map(loadTheme));
    const merged = { topics: {} };
    results.forEach((data, i) => {
      const themeId = THEMES[i];
      if (data && data.topics) {
        Object.entries(data.topics).forEach(([topicId, topic]) => {
          merged.topics[topicId] = { ...topic, _theme: themeId };
        });
      }
    });
    return merged;
  }

  async function loadTopic(topicId) {
    for (const themeId of THEMES) {
      const theme = await loadTheme(themeId);
      if (theme && theme.topics && theme.topics[topicId]) {
        return { ...theme.topics[topicId], _theme: themeId };
      }
    }
    return null;
  }

  global.JglContent = {
    THEMES,
    loadTheme,
    loadTopic,
    loadAllThemes,
  };
})(typeof window !== 'undefined' ? window : globalThis);
