/* ===========================================================================
   Family Atlas — Rank policy (Layer 2)
   Difficulty is DATA, not code branches. A game reads rankCfg.input / .hints /
   .timerMs and adapts. Adding a fourth rank later = one row here, zero game edits.
   =========================================================================== */

export const RANKS = {
  explorer: {
    id: 'explorer',
    name: 'Explorer',
    blurb: 'Tap to choose. Famous countries, hints on, plenty of time.',
    emoji: '\u{1F9F8}',        // teddy — youngest
    tiers: [1],
    maxCountries: 40,
    timerMs: 22000,
    input: 'mcq',              // multiple choice, never typing
    choices: 4,
    hints: true,
    handicap: 1.4,             // solo-mode score multiplier so the youngest can win
    accent: '#e8974a',
  },
  navigator: {
    id: 'navigator',
    name: 'Navigator',
    blurb: 'Choose or type. A wider world, a tighter clock.',
    emoji: '\u{1F9ED}',        // compass
    tiers: [1, 2],
    maxCountries: 100,
    timerMs: 14000,
    input: 'mixed',            // mostly MCQ, sometimes typed
    choices: 4,
    hints: false,
    handicap: 1.15,
    accent: '#2a7d6f',
  },
  cartographer: {
    id: 'cartographer',
    name: 'Cartographer',
    blurb: 'Type your answer. Every country, no hints, fast.',
    emoji: '\u{1F5FA}',        // world map
    tiers: [1, 2, 3],
    maxCountries: 194,
    timerMs: 9000,
    input: 'typed',
    choices: 4,
    hints: false,
    handicap: 1.0,
    accent: '#b23a48',
  },
};

export const RANK_ORDER = ['explorer', 'navigator', 'cartographer'];

export function rankCfg(rankId) {
  return RANKS[rankId] || RANKS.explorer;
}
