/* GeoGames - Flag Frenzy
   Two directions, mixed through the round so the answer is never in the same
   place twice: flag to name, and name to flag. */

import { el, flagImg, sample } from '../engine/ui.js';
import { options, optionGrid, optionLabel, prompt, questionText, nameSimilarity } from './_common.js';
import { DIFFICULTY, buildPool } from '../engine/session.js';

export default {
  id: 'flags',
  title: 'Flag Frenzy',
  emoji: '🚩',
  accent: '#ef476f',
  category: 'Flags',
  blurb: 'Two hundred rectangles. How many can you name?',
  howTo: 'A flag appears. Tap the country it belongs to. Sometimes it runs the other way and you pick the flag.',
  timeLimitMs: 12000,

  build({ rnd, config, countries }) {
    const pool = buildPool(countries, config);
    const n = DIFFICULTY[config.difficulty].options;
    const picks = sample(pool, Math.min(config.rounds, pool.length), rnd);
    return picks.map((answer, i) => ({
      iso: answer.iso,
      reverse: i % 3 === 2,
      answer,
      opts: options(answer, pool, n, rnd, { score: nameSimilarity }),
    }));
  },

  render(host, q, api) {
    if (q.reverse) {
      host.appendChild(questionText(`Which flag is ${q.answer.name}?`));
      const grid = optionGrid(q.opts, {
        correctId: q.answer.iso,
        columns: 2,
        render: c => el('span', { class: 'opt-flagwrap' }, [flagImg(c, { size: 'lg' })]),
        onPick: (id, right) => api.submit({ correct: right, picked: id }),
      });
      host.appendChild(grid.node);
      return grid;
    }

    host.appendChild(prompt([flagImg(q.answer, { size: 'hero', className: 'flag-hero' })]));
    host.appendChild(questionText('Whose flag is this?'));
    const grid = optionGrid(q.opts, {
      correctId: q.answer.iso,
      columns: 2,
      render: c => optionLabel(c.name),
      onPick: (id, right) => api.submit({ correct: right, picked: id }),
    });
    host.appendChild(grid.node);
    return grid;
  },

  factFor(q) {
    const c = q.answer;
    return `${c.name} · capital ${c.capital} · ${c.subregion}`;
  },
};
