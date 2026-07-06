/* ===========================================================================
   Family Atlas — Daily family challenge
   Deterministic by calendar date: everyone in the family gets the SAME game +
   region on a given day, with no server. Same date -> same pick, always.
   =========================================================================== */

import { REGIONS } from './countries.js';

// Kept in sync with engine/registry.js game ids. Listed here (not imported) so
// this module stays free of circular deps.
const CHALLENGE_GAMES = [
  'flags/guess-the-flag',
  'capitals/match',
  'capitals/capital-or-not',
  'names/country-round',
  'names/map-locate',
  'names/name-the-shape',
];

// A tiny deterministic hash of the ISO date string, e.g. "2026-07-06".
function hashDate(iso) {
  let h = 2166136261;
  for (let i = 0; i < iso.length; i++) {
    h ^= iso.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

/** The challenge for a given date (defaults to today). Pure and stable. */
export function challengeFor(iso = todayIso()) {
  const h = hashDate(iso);
  const game = CHALLENGE_GAMES[h % CHALLENGE_GAMES.length];
  const region = REGIONS[(h >>> 5) % REGIONS.length];
  return { date: iso, gameId: game, region: region.id, regionName: region.name };
}
