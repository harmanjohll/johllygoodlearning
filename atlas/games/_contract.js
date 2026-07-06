/* ===========================================================================
   Family Atlas — Sub-game contract (Layer 1) + shared answer matching
   ---------------------------------------------------------------------------
   Every sub-game is an object shaped like this:

     {
       id, title, category, blurb, emoji,
       generate(ctx) -> Question,          // pure w.r.t. ctx; sets question.subjectIso
       render(question, mount, ctx, submit) -> void,   // submit(value, {usedHint})
       check(question, value) -> { correct, closeness },
       describe(question) -> object        // small record for the turn log (optional)
     }

   A game reads ctx.rankCfg.input / .hints / .timerMs to adapt to the player.
   It NEVER computes points, touches storage, or knows about turns or modes.
   =========================================================================== */

/** Fold accents, lowercase, drop punctuation and a leading "the". */
export function normalize(s) {
  return String(s || '')
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[.'’`\-]/g, ' ')
    .replace(/[^a-z0-9 ]/g, '')
    .replace(/\bthe\b/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function levenshtein(a, b) {
  const m = a.length, n = b.length;
  if (!m) return n; if (!n) return m;
  let prev = Array.from({ length: n + 1 }, (_, i) => i);
  for (let i = 1; i <= m; i++) {
    let cur = [i];
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + cost);
    }
    prev = cur;
  }
  return prev[n];
}

/** 0..1 similarity between two strings (1 = identical after normalising). */
export function similarity(a, b) {
  const x = normalize(a), y = normalize(b);
  if (!x || !y) return 0;
  if (x === y) return 1;
  const dist = levenshtein(x, y);
  return 1 - dist / Math.max(x.length, y.length);
}

/** Match a typed answer against a set of accepted strings, tolerating typos. */
export function matchAny(value, accepted) {
  const v = normalize(value);
  if (!v) return { correct: false, closeness: 0 };
  let best = 0;
  for (const a of accepted) {
    const na = normalize(a);
    if (!na) continue;
    if (na === v) return { correct: true, closeness: 1 };
    best = Math.max(best, similarity(v, na));
  }
  // Accept close typos on longer words; report closeness for near-misses.
  return { correct: best >= 0.86, closeness: best };
}

export function matchCountryName(value, country) {
  return matchAny(value, [country.name, ...(country.aliases || [])]);
}

export function matchCapital(value, country) {
  return matchAny(value, [country.capital, ...(country.capitalAliases || [])]);
}
