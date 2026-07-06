/* ===========================================================================
   Family Atlas — localStorage accessor
   Namespaced under atlas_*, same try/JSON.parse/catch idiom as the Science Lab
   (lab/shared.js Progress) so the codebase reads as one hand.
   =========================================================================== */

const KEYS = {
  profiles: 'atlas_profiles',   // { [playerId]: profile }
  meta: 'atlas_meta',           // { lastPlayers, dailyDoneDate, installDate }
  session: 'atlas_session',     // compact snapshot of one resumable session
  challenge: 'atlas_challenge', // { [date]: { gameId, region, done:{ [playerId]:true } } }
};

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function write(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* private-mode / quota — the app stays playable in-memory this session */
  }
}

export const Store = {
  KEYS,

  profiles() { return read(KEYS.profiles, {}); },
  saveProfiles(all) { write(KEYS.profiles, all); },

  meta() { return read(KEYS.meta, {}); },
  saveMeta(patch) { write(KEYS.meta, { ...this.meta(), ...patch }); },

  session() { return read(KEYS.session, null); },
  saveSession(snapshot) { write(KEYS.session, snapshot); },
  clearSession() { try { localStorage.removeItem(KEYS.session); } catch {} },

  challenges() { return read(KEYS.challenge, {}); },
  saveChallenges(all) { write(KEYS.challenge, all); },

  /** Wipe everything Atlas owns. Used by the "reset" affordance. */
  wipe() {
    Object.values(KEYS).forEach(k => { try { localStorage.removeItem(k); } catch {} });
  },
};
