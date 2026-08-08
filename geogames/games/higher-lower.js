/* GeoGames - Higher or Lower
   Two countries, one question, and a room full of people who are certain they
   are right. Deliberately the simplest game here: no typing, no map, two big
   targets, and an argument every time. */

import { el, flagImg, fmt, shuffle, pick } from '../engine/ui.js';
import { questionText } from './_common.js';
import { buildPool } from '../engine/session.js';

const METRICS = [
  {
    id: 'pop',
    ask: 'Which country has MORE people?',
    of: c => c.pop,
    show: c => fmt.people(c.pop),
    ok: c => c.pop > 0,
  },
  {
    id: 'area',
    ask: 'Which country is LARGER?',
    of: c => c.area,
    show: c => fmt.km2(c.area),
    ok: c => c.area > 0,
  },
  {
    id: 'borders',
    ask: 'Which country has MORE neighbours?',
    of: c => c.borders.length,
    show: c => c.borders.length === 0 ? 'no land neighbours'
             : c.borders.length === 1 ? '1 neighbour'
             : `${c.borders.length} neighbours`,
    ok: c => true,
  },
  {
    id: 'north',
    ask: 'Which country is FURTHER NORTH?',
    of: c => c.lat,
    show: c => `${Math.abs(c.lat).toFixed(0)}° ${c.lat >= 0 ? 'north' : 'south'}`,
    ok: c => true,
  },
  {
    id: 'density',
    ask: 'Which country is more CROWDED, per square kilometre?',
    of: c => c.pop / c.area,
    show: c => `${Math.round(c.pop / c.area).toLocaleString('en-GB')} people per km²`,
    ok: c => c.pop > 0 && c.area > 0,
  },
];

export default {
  id: 'higher-lower',
  title: 'Higher or Lower',
  emoji: '⚖️',
  accent: '#b388ff',
  category: 'Facts',
  blurb: 'Two countries. One is bigger. Probably not the one you think.',
  howTo: 'Pick the country that wins on the measure shown. Population, area, neighbours, latitude, crowding.',
  timeLimitMs: 15000,

  build({ rnd, config, countries }) {
    const pool = buildPool(countries, config);
    const out = [];
    let guard = 0;
    while (out.length < config.rounds && guard++ < config.rounds * 60) {
      const metric = pick(METRICS, rnd);
      const valid = pool.filter(metric.ok);
      if (valid.length < 2) continue;
      const [a, b] = shuffle(valid, rnd).slice(0, 2);
      const va = metric.of(a), vb = metric.of(b);
      if (va === vb) continue;
      const loose = guard > config.rounds * 30;    // stop being fussy near the end
      if (metric.id === 'north') {
        // Latitude is a difference, not a ratio. Cameroon against Turkey is
        // not a question; Italy against Turkey is.
        const gap = Math.abs(va - vb);
        if (!loose && (gap > 22 || gap < 1.5)) continue;
      } else {
        // Skip pairings where one side is more than eight times the other:
        // those are trivia only in the sense that nobody has to think.
        const ratio = Math.max(Math.abs(va), Math.abs(vb)) / Math.max(1e-6, Math.min(Math.abs(va), Math.abs(vb)));
        if (!loose && ratio > 8) continue;
      }
      out.push({
        metric: metric.id, a, b,
        isos: [a.iso, b.iso],
        winner: va > vb ? a.iso : b.iso,
        opts: [a, b],          // lets the shell offer a steal on this game too
      });
    }
    return out;
  },

  render(host, q, api) {
    const metric = METRICS.find(m => m.id === q.metric);
    host.appendChild(questionText(metric.ask));

    let settled = false;
    const cards = [q.a, q.b].map(c => {
      const value = el('span', { class: 'hl-value', text: '' });
      const card = el('button', {
        class: 'hl-card', type: 'button', 'data-id': c.iso,
        onclick: () => choose(c.iso),
      }, [
        flagImg(c, { size: 'lg' }),
        el('span', { class: 'hl-name', text: c.name }),
        value,
      ]);
      return { c, card, value };
    });

    host.appendChild(el('div', { class: 'hl-grid' }, [
      cards[0].card,
      el('div', { class: 'hl-vs', 'aria-hidden': 'true', text: 'vs' }),
      cards[1].card,
    ]));

    let revealed = false;

    /* Held back until the shell says so: the figures are the answer, and a
       steal would be free if they were already on screen. */
    function reveal() {
      if (revealed) return;
      revealed = true;
      for (const { c, card, value } of cards) {
        value.textContent = metric.show(c);
        if (c.iso === q.winner) {
          card.classList.add('is-right');
          card.appendChild(el('span', { class: 'opt-mark', 'aria-hidden': 'true', text: '✓' }));
          card.setAttribute('aria-label', `Correct answer: ${c.name}, ${metric.show(c)}`);
        }
      }
    }

    function choose(iso) {
      if (settled) return;
      settled = true;
      const right = iso === q.winner;
      for (const { c, card } of cards) {
        card.disabled = true;
        card.classList.add('is-settled');
        if (!right && c.iso === iso) {
          card.classList.add('is-wrong');
          card.appendChild(el('span', { class: 'opt-mark', 'aria-hidden': 'true', text: '✗' }));
          card.setAttribute('aria-label', `Your answer, wrong: ${c.name}`);
        }
      }
      if (right) reveal();
      api.submit({ correct: right, picked: iso });
    }

    return {
      node: null,
      reveal,
      items: [q.a, q.b],
      idOf: c => c.iso,
      correctId: q.winner,
      render: c => el('span', { class: 'opt-row' }, [flagImg(c, { size: 'sm' }), el('span', { text: c.name })]),
      keys(e) {
        if (settled) return;
        if (e.key === '1') { e.preventDefault(); choose(q.a.iso); }
        if (e.key === '2') { e.preventDefault(); choose(q.b.iso); }
      },
      timeout() {
        if (settled) return;
        settled = true;
        for (const { card } of cards) { card.disabled = true; card.classList.add('is-settled'); }
        reveal();
      },
      get settled() { return settled; },
    };
  },

  factFor(q) {
    const metric = METRICS.find(m => m.id === q.metric);
    return `${q.a.name}: ${metric.show(q.a)} · ${q.b.name}: ${metric.show(q.b)}`;
  },
};
