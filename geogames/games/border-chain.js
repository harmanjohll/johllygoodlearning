/* GeoGames - Border Chain
   A walk across the world by land. Each step asks which of four countries
   actually touches the one you are standing in, and the chain builds up on the
   map behind the question. The whole route is planned when the round is built,
   so a wrong answer costs you the point but never strands the walk. */

import { el, flagImg, shuffle, pick } from '../engine/ui.js';
import { MapView } from '../engine/map-view.js';
import { optionGrid, optionLabel, questionText } from './_common.js';
import { DIFFICULTY, buildPool } from '../engine/session.js';

export default {
  id: 'border-chain',
  title: 'Border Chain',
  emoji: '🔗',
  accent: '#f7854a',
  category: 'Borders',
  blurb: 'Walk across the world without getting your feet wet.',
  howTo: 'One of the four countries shares a land border with the one you are in. Pick it and the walk continues from there.',
  timeLimitMs: 15000,
  needsShapes: true,

  build({ rnd, config, countries, shapes }) {
    const byIso = Object.fromEntries(countries.map(c => [c.iso, c]));
    const optCount = DIFFICULTY[config.difficulty].options;

    // The walk must stay inside the chosen region, and inside difficulty, or
    // the options stop being fair.
    const allowed = new Set(
      buildPool(countries, config, c => c.borders.length > 0 && !!shapes[c.iso]).map(c => c.iso)
    );
    const decoyPool = buildPool(countries, config);
    const neighbours = iso => (byIso[iso] ? byIso[iso].borders.filter(b => allowed.has(b)) : []);

    const starts = [...allowed].filter(iso => neighbours(iso).length >= 2);
    if (!starts.length) return [];

    const questions = [];
    let current = pick(starts, rnd);
    const walked = new Set([current]);

    for (let step = 0; step < config.rounds; step++) {
      let next = shuffle(neighbours(current), rnd).find(n => !walked.has(n));
      if (!next) {
        // Dead end: hop to a fresh start rather than repeat ground.
        const fresh = starts.filter(s => !walked.has(s));
        if (!fresh.length) break;
        current = pick(fresh, rnd);
        walked.add(current);
        next = shuffle(neighbours(current), rnd).find(n => !walked.has(n));
        if (!next) break;
      }

      const touching = new Set(byIso[current].borders);
      const decoys = shuffle(decoyPool.filter(c =>
        c.iso !== current && c.iso !== next && !touching.has(c.iso)), rnd)
        .slice(0, optCount - 1);
      if (decoys.length < optCount - 1) break;

      questions.push({
        iso: next,
        from: byIso[current],
        answer: byIso[next],
        chain: [...walked],
        opts: shuffle([byIso[next], ...decoys], rnd),
      });

      walked.add(next);
      current = next;
    }
    return questions;
  },

  render(host, q, api) {
    host.appendChild(questionText(
      `You are in ${q.from.name}. Which of these can you walk into?`,
      `Step ${q.chain.length}. No boats, no flights.`
    ));

    const stage = el('div', { class: 'chain-map' });
    host.appendChild(stage);
    const chain = new Set(q.chain);
    const map = new MapView(stage, api.shapes, {
      interactive: false,
      dimUnpainted: true,
    });
    map.setPaint(iso => (iso === q.from.iso ? '#f7854a' : chain.has(iso) ? '#8a4f2e' : null));
    map.setHighlight([q.from.iso]);
    const home = api.shapes[q.from.iso];
    if (home) map.flyTo(home.centre[0], home.centre[1], { ms: 0, zoom: 2.4 });
    api.onCleanup(() => map.destroy());

    const grid = optionGrid(q.opts, {
      correctId: q.answer.iso,
      columns: 2,
      render: c => el('span', { class: 'opt-row' }, [flagImg(c, { size: 'sm' }), optionLabel(c.name)]),
      onPick: (id, right) => {
        const target = api.shapes[q.answer.iso];
        map.setPaint(iso => iso === q.answer.iso ? '#06d6a0'
                          : iso === q.from.iso ? '#f7854a'
                          : chain.has(iso) ? '#8a4f2e' : null);
        map.setHighlight([q.from.iso, q.answer.iso]);
        if (target) map.flyTo((home.centre[0] + target.centre[0]) / 2, (home.centre[1] + target.centre[1]) / 2, { ms: 600, zoom: 2 });
        api.submit({ correct: right, picked: id });
      },
    });
    host.appendChild(grid.node);
    return grid;
  },

  factFor(q) {
    const n = q.from.borders.length;
    return `${q.from.name} borders ${n} ${n === 1 ? 'country' : 'countries'}: ${q.from.borders.join(', ')}`;
  },
};
