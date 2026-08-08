/* ===========================================================================
   GeoGames - Local storage

   Everything lives in the browser under a single key, `geogames.v1`. Nothing
   is sent anywhere: there is no server, no account and no analytics. Clearing
   site data clears the lot, which is the whole of the privacy policy.
   =========================================================================== */

const KEY = 'geogames.v1';

const BLANK = {
  version: 1,
  players: [],          // { id, name, emoji, colour }
  lastRoster: [],       // player ids selected for the previous game
  settings: {
    sound: true,
    timer: true,
    difficulty: 'explorer',   // family | explorer | expert
    region: 'all',
    rounds: 10,
    steal: true,
    labels: false,            // show country names on the maps
  },
  stats: {},            // gameId -> { plays, best, totalScore, correct, asked }
  seen: {},             // iso -> { asked, correct, lastIso8601 }
  visited: [],          // iso codes the player has correctly identified at least once
  daily: {},            // yyyy-mm-dd -> { gameId, best }
};

let cache = null;

function read() {
  if (cache) return cache;
  try {
    const raw = localStorage.getItem(KEY);
    cache = raw ? migrate(JSON.parse(raw)) : structuredClone(BLANK);
  } catch {
    // Private browsing, a full quota or corrupted JSON: play on with defaults
    // rather than showing the player an error they cannot act on.
    cache = structuredClone(BLANK);
  }
  return cache;
}

function migrate(data) {
  const out = { ...structuredClone(BLANK), ...data };
  out.settings = { ...BLANK.settings, ...(data.settings || {}) };
  out.version = BLANK.version;
  return out;
}

let writeTimer = 0;
function write() {
  clearTimeout(writeTimer);
  writeTimer = setTimeout(() => {
    try { localStorage.setItem(KEY, JSON.stringify(cache)); } catch { /* quota; keep playing */ }
  }, 120);
}

export const Store = {
  all: () => read(),

  settings: () => read().settings,
  setSetting(key, value) {
    read().settings[key] = value;
    write();
  },

  /* ── players ─────────────────────────────────────────────────────────── */
  players: () => read().players,
  addPlayer({ name, emoji, colour }) {
    const p = {
      id: 'p' + Math.random().toString(36).slice(2, 9),
      name: (name || 'Player').slice(0, 16),
      emoji: emoji || '🙂',
      colour: colour || '#4cc9f0',
    };
    read().players.push(p);
    write();
    return p;
  },
  updatePlayer(id, patch) {
    const p = read().players.find(x => x.id === id);
    if (p) { Object.assign(p, patch); write(); }
    return p;
  },
  removePlayer(id) {
    const s = read();
    s.players = s.players.filter(p => p.id !== id);
    s.lastRoster = s.lastRoster.filter(x => x !== id);
    write();
  },
  setRoster(ids) { read().lastRoster = ids.slice(); write(); },
  roster: () => read().lastRoster,

  /* ── results ─────────────────────────────────────────────────────────── */
  recordGame(gameId, { score, correct, asked }) {
    const s = read();
    const st = s.stats[gameId] || { plays: 0, best: 0, totalScore: 0, correct: 0, asked: 0 };
    st.plays++;
    st.best = Math.max(st.best, score);
    st.totalScore += score;
    st.correct += correct;
    st.asked += asked;
    s.stats[gameId] = st;
    write();
    return st;
  },
  stats: gameId => read().stats[gameId] || null,
  allStats: () => read().stats,

  /* Per-country accuracy, which drives the "shaky ground" practice list and
     the passport map of everywhere you have correctly named. */
  recordCountry(iso, wasCorrect) {
    const s = read();
    const rec = s.seen[iso] || { asked: 0, correct: 0, last: null };
    rec.asked++;
    if (wasCorrect) {
      rec.correct++;
      if (!s.visited.includes(iso)) s.visited.push(iso);
    }
    rec.last = new Date().toISOString().slice(0, 10);
    s.seen[iso] = rec;
    write();
  },
  seen: () => read().seen,
  visited: () => read().visited,

  /* Countries asked at least twice and wrong more often than right. */
  shaky(limit = 12) {
    const seen = read().seen;
    return Object.entries(seen)
      .filter(([, r]) => r.asked >= 2 && r.correct / r.asked < 0.5)
      .sort((a, b) => (a[1].correct / a[1].asked) - (b[1].correct / b[1].asked))
      .slice(0, limit)
      .map(([iso]) => iso);
  },

  /* ── daily challenge ─────────────────────────────────────────────────── */
  daily(date) { return read().daily[date] || null; },
  recordDaily(date, gameId, score) {
    const s = read();
    const prev = s.daily[date];
    if (!prev || score > prev.best) s.daily[date] = { gameId, best: score };
    write();
  },

  reset() {
    cache = structuredClone(BLANK);
    try { localStorage.removeItem(KEY); } catch { /* nothing to do */ }
  },
};

export function todayIso() {
  return new Date().toISOString().slice(0, 10);
}
