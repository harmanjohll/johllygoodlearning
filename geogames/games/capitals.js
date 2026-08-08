/* GeoGames - Capital Clash
   Country to capital, and capital to country. The distractor capitals come from
   the same region, so "somewhere in West Africa" does not narrow it down. */

import { el, flagImg, sample } from '../engine/ui.js';
import { options, optionGrid, optionLabel, prompt, questionText } from './_common.js';
import { DIFFICULTY, buildPool } from '../engine/session.js';

export default {
  id: 'capitals',
  title: 'Capital Clash',
  emoji: '🏛️',
  accent: '#ffd166',
  category: 'Capitals',
  blurb: 'Seats of government, one at a time.',
  howTo: 'Match the country to its capital city, or the capital to its country. Watch for the ones that are not the biggest city.',
  timeLimitMs: 12000,

  build({ rnd, config, countries }) {
    const pool = buildPool(countries, config, c => !!c.capital);
    const n = DIFFICULTY[config.difficulty].options;
    const picks = sample(pool, Math.min(config.rounds, pool.length), rnd);
    return picks.map((answer, i) => ({
      iso: answer.iso,
      reverse: i % 2 === 1,
      answer,
      opts: options(answer, pool, n, rnd),
    }));
  },

  render(host, q, api) {
    if (q.reverse) {
      host.appendChild(prompt([
        el('div', { class: 'capital-badge' }, [
          el('span', { class: 'capital-pin', 'aria-hidden': 'true', text: '📍' }),
          el('span', { class: 'capital-name', text: q.answer.capital }),
        ]),
      ]));
      host.appendChild(questionText('Capital of which country?'));
      const grid = optionGrid(q.opts, {
        correctId: q.answer.iso,
        columns: 2,
        render: c => el('span', { class: 'opt-row' }, [flagImg(c, { size: 'sm' }), optionLabel(c.name)]),
        onPick: (id, right) => api.submit({ correct: right, picked: id }),
      });
      host.appendChild(grid.node);
      return grid;
    }

    host.appendChild(prompt([
      el('div', { class: 'country-badge' }, [
        flagImg(q.answer, { size: 'lg' }),
        el('span', { class: 'country-name', text: q.answer.name }),
      ]),
    ]));
    host.appendChild(questionText('What is the capital?'));
    const grid = optionGrid(q.opts, {
      correctId: q.answer.iso,
      columns: 2,
      render: c => optionLabel(c.capital),
      onPick: (id, right) => api.submit({ correct: right, picked: id }),
    });
    host.appendChild(grid.node);
    return grid;
  },

  factFor(q) {
    const c = q.answer;
    const extras = [];
    if (c.currency && c.currency.name) extras.push(c.currency.name);
    if (c.languages && c.languages.length) extras.push(c.languages.slice(0, 2).join(', '));
    return `${c.capital}, ${c.name}${extras.length ? ' · ' + extras.join(' · ') : ''}`;
  },
};
