/* =========================================================
   /studio/shared/openended.js
   Loads the canonical Booklet B open-ended question bank from
   /studio/shared/content/openended/<theme>.json.

   One bank, several consumers: the Answer Trainer teaches the
   three skills (decode the question, choose the words, build the
   causal chain) and the Structured Answer Builder marks a full
   draft against the same mark points.

   Question shape:
     id, topicId, topicName, theme
     commandWord      one of describe|explain|infer|predict|suggest|compare
     commandDemand    what that command word obliges the answer to do
     marks            1-5; markPoints.length always equals this
     stimulusType     none|scenario|data
     stimulus         the scenario or data table, or null
     stem             the question as it would be printed
     requiredTerms    scientific terms the answer is expected to contain
     fuzzyTraps       [{vague, precise}] everyday phrasing and its upgrade
     chain            [{step, text}] the causal skeleton, in order
     modelAnswer      full AL1 answer
     markPoints       one entry per mark
     whyMarksLost     what the examiner sees go wrong most often
     themesCovered    for synoptic filtering

   Exposes window.JglOpenEnded.
   ========================================================= */

(function (global) {
  const THEMES = ['diversity', 'cycles', 'systems', 'interactions', 'energy'];
  const COMMAND_WORDS = ['describe', 'explain', 'infer', 'predict', 'suggest', 'compare'];

  let bankCache = null;
  let inflight   = null;

  function basePath() {
    const scripts = document.getElementsByTagName('script');
    for (let i = scripts.length - 1; i >= 0; i--) {
      const src = scripts[i].src || '';
      if (src.indexOf('/shared/openended.js') !== -1) {
        return src.replace(/openended\.js.*$/, 'content/openended/');
      }
    }
    return 'shared/content/openended/';
  }

  /* Load every theme file once and flatten into a single array. A
     missing or malformed theme file degrades to an empty list rather
     than taking the whole bank down. */
  async function loadAll() {
    if (bankCache) return bankCache;
    if (inflight)  return inflight;

    const base = basePath();
    inflight = Promise.all(THEMES.map(theme =>
      fetch(base + theme + '.json', { cache: 'no-cache' })
        .then(r => (r.ok ? r.json() : { questions: [] }))
        .catch(() => ({ questions: [] }))
        .then(d => (Array.isArray(d && d.questions) ? d.questions : []))
    )).then(lists => {
      bankCache = lists.flat();
      inflight  = null;
      return bankCache;
    });
    return inflight;
  }

  /* Questions on content the 2026 syllabus removed carry examinable:false.
     They stay in the bank as background reading but are kept out of every
     default pool, so practice time is never spent on unexaminable content.
     Pass {includeRemoved:true} to opt back in. */
  function examinable(q) { return q.examinable !== false; }

  async function byTopic(topicId, opts) {
    const all = await loadAll();
    return all.filter(q => q.topicId === topicId &&
      ((opts && opts.includeRemoved) || examinable(q)));
  }

  async function byCommandWord(word, opts) {
    const all = await loadAll();
    return all.filter(q => q.commandWord === word &&
      ((opts && opts.includeRemoved) || examinable(q)));
  }

  /* Topics present in the bank, for building selectors. Topics whose whole
     content was removed are omitted unless asked for. */
  async function topics(opts) {
    const all = await loadAll();
    const seen = new Map();
    all.forEach(q => {
      if (!(opts && opts.includeRemoved) && !examinable(q)) return;
      if (!seen.has(q.topicId)) {
        seen.set(q.topicId, {
          id: q.topicId, name: q.topicName, theme: q.theme,
          count: 0, examinable: examinable(q),
        });
      }
      seen.get(q.topicId).count++;
    });
    return [...seen.values()].sort((a, b) => a.name.localeCompare(b.name));
  }

  /* Filtered pick. opts: {topicId, commandWord, marks, minMarks, theme,
     exclude:[ids], includeRemoved} */
  async function pick(opts) {
    const o = opts || {};
    const all = await loadAll();
    let pool = all.filter(q =>
      (o.includeRemoved || examinable(q)) &&
      (!o.topicId     || q.topicId     === o.topicId) &&
      (!o.commandWord || q.commandWord === o.commandWord) &&
      (!o.theme       || q.theme       === o.theme) &&
      (!o.marks       || q.marks       === o.marks) &&
      (!o.minMarks    || q.marks       >= o.minMarks)
    );
    if (o.exclude && o.exclude.length) {
      const skip = new Set(o.exclude);
      const fresh = pool.filter(q => !skip.has(q.id));
      // Fall back to the full pool rather than returning nothing once
      // every question in a narrow filter has been seen.
      if (fresh.length) pool = fresh;
    }
    if (!pool.length) return null;
    return pool[Math.floor(Math.random() * pool.length)];
  }

  async function byId(id) {
    const all = await loadAll();
    return all.find(q => q.id === id) || null;
  }

  global.JglOpenEnded = {
    THEMES,
    COMMAND_WORDS,
    loadAll,
    byTopic,
    byCommandWord,
    topics,
    pick,
    byId,
    examinable,
  };
})(typeof window !== 'undefined' ? window : globalThis);
