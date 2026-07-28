/* ===========================================================================
   Family Atlas — Game registry
   Static imports of every sub-game. Drives the home grid and lets the session
   resolve a game module by id. Adding a game = import it and add a row.
   =========================================================================== */

import { guessTheFlag } from '../games/flags/guess-the-flag.js';
import { capitalMatch } from '../games/capitals/match.js';
import { capitalOrNot } from '../games/capitals/capital-or-not.js';
import { countryRound } from '../games/names/country-round.js';
import { nameTheShape } from '../games/names/name-the-shape.js';
import { mapLocate } from '../games/names/map-locate.js';
import { zoomOut } from '../games/flags/zoom-out.js';
import { twoRoads } from '../games/capitals/two-roads.js';
import { memoryMatch } from '../games/flags/memory-match.js';
import { speedSweep } from '../games/names/speed-sweep.js';

export const GAMES = [
  countryRound, mapLocate, nameTheShape, speedSweep,
  guessTheFlag, zoomOut, memoryMatch,
  capitalMatch, capitalOrNot, twoRoads,
];

const BY_ID = Object.fromEntries(GAMES.map(g => [g.id, g]));
export function gameById(id) { return BY_ID[id] || null; }

/** Grouped for the home screen: Countries · Flags · Capitals. */
export const CATEGORIES = [
  { id: 'Countries', emoji: '\u{1F30D}', tagline: 'Know the world’s countries' },
  { id: 'Flags', emoji: '\u{1F6A9}', tagline: 'Read the flags of the world' },
  { id: 'Capitals', emoji: '\u{1F3DB}', tagline: 'Match countries to capitals' },
];
