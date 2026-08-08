/* ===========================================================================
   GeoGames - Game registry

   Every game is a plain object with the same handful of members, listed in
   games/_contract.md. Adding one means writing the module and adding it here.
   =========================================================================== */

import flags from './flags.js';
import capitals from './capitals.js';
import outline from './outline.js';
import globeDrop from './globe-drop.js';
import higherLower from './higher-lower.js';
import borderChain from './border-chain.js';
import timeTraveller from './time-traveller.js';
import oddOneOut from './odd-one-out.js';
import { shuffle } from '../engine/ui.js';

export const GAMES = [
  flags, capitals, outline, globeDrop,
  higherLower, borderChain, oddOneOut, timeTraveller,
];

/* ── Grand Tour ─────────────────────────────────────────────────────────────
   Every game, shuffled together. This is the party default: nobody has to
   agree on a category, and the person who only knows flags still gets a turn
   at something they are good at. Each question carries its own game, so the
   shell renders and times it exactly as that game would. */
export const grandTour = {
  id: 'grand-tour',
  title: 'Grand Tour',
  emoji: '🎪',
  accent: '#ffd166',
  category: 'Mixed',
  blurb: 'All eight games, shuffled. The party default.',
  howTo: 'Questions arrive from every game in turn. Whatever you are good at, it will come round.',
  needsShapes: true,
  mixed: true,

  build(ctx) {
    const perGame = Math.max(1, Math.ceil(ctx.config.rounds / GAMES.length));
    const batches = GAMES.map(game => {
      let built = [];
      try {
        built = game.build({ ...ctx, config: { ...ctx.config, rounds: perGame } }) || [];
      } catch (err) {
        // One misbehaving game must not take the whole party down with it.
        console.error(`Grand Tour: ${game.id} failed to build`, err);
        return [];
      }
      return built.map(q => ({ ...q, game }));
    });

    // Round-robin rather than concatenate, so the mix feels mixed from the
    // first question, then trimmed to the requested length.
    const woven = [];
    for (let i = 0; i < perGame; i++) {
      for (const b of shuffle(batches, ctx.rnd)) if (b[i]) woven.push(b[i]);
    }
    return woven.slice(0, ctx.config.rounds);
  },

  render(host, q, api) { return q.game.render(host, q, api); },
  factFor(q) { return q.game.factFor ? q.game.factFor(q) : ''; },
  timeLimitFor(q) { return q.game.timeLimitMs; },
  scoringFor(q) { return q.game.scoring; },
};

export const ALL_GAMES = [grandTour, ...GAMES];
export const GAME_BY_ID = Object.fromEntries(ALL_GAMES.map(g => [g.id, g]));

export const CATEGORIES = [...new Set(GAMES.map(g => g.category))];
