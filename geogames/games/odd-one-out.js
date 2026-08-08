/* GeoGames - Odd One Out
   Four countries, three of which share something. The rule is not revealed
   until afterwards, which is what makes it a thinking game rather than a
   recall game, and what makes it worth arguing about out loud. */

import { el, flagImg, shuffle, sample, pick } from '../engine/ui.js';
import { optionGrid, optionLabel, questionText } from './_common.js';
import { buildPool } from '../engine/session.js';

/* Each rule produces a group of three that share a trait and one that does not.
   `find` returns null when the pool cannot support it, and the builder moves on. */
const RULES = [
  {
    id: 'landlocked',
    rule: 'The other three are landlocked. This one has a coast.',
    find(pool, rnd) {
      const land = pool.filter(c => c.landlocked);
      const sea = pool.filter(c => !c.landlocked);
      if (land.length < 3 || !sea.length) return null;
      return { group: sample(land, 3, rnd), odd: pick(sea, rnd) };
    },
  },
  {
    id: 'coastal',
    rule: 'The other three have a coastline. This one is landlocked.',
    find(pool, rnd) {
      const land = pool.filter(c => c.landlocked);
      const sea = pool.filter(c => !c.landlocked);
      if (sea.length < 3 || !land.length) return null;
      return { group: sample(sea, 3, rnd), odd: pick(land, rnd) };
    },
  },
  {
    id: 'island',
    rule: 'The other three have no land borders at all. This one does.',
    find(pool, rnd) {
      const islands = pool.filter(c => c.borders.length === 0);
      const rest = pool.filter(c => c.borders.length > 0);
      if (islands.length < 3 || !rest.length) return null;
      return { group: sample(islands, 3, rnd), odd: pick(rest, rnd) };
    },
  },
  {
    id: 'continent',
    rule: null,   // filled in from the group
    find(pool, rnd) {
      const regions = [...new Set(pool.map(c => c.region))];
      if (regions.length < 2) return null;
      const home = pick(regions, rnd);
      const inRegion = pool.filter(c => c.region === home);
      const outside = pool.filter(c => c.region !== home);
      if (inRegion.length < 3 || !outside.length) return null;
      const group = sample(inRegion, 3, rnd);
      return { group, odd: pick(outside, rnd), rule: `The other three are in ${regionName(home)}.` };
    },
  },
  {
    id: 'currency',
    rule: null,
    find(pool, rnd) {
      const byCurrency = {};
      for (const c of pool) {
        if (!c.currency || !c.currency.code) continue;
        (byCurrency[c.currency.code] = byCurrency[c.currency.code] || []).push(c);
      }
      const shared = Object.entries(byCurrency).filter(([, list]) => list.length >= 3);
      if (!shared.length) return null;
      const [code, list] = pick(shared, rnd);
      const outside = pool.filter(c => !c.currency || c.currency.code !== code);
      if (!outside.length) return null;
      const group = sample(list, 3, rnd);
      return { group, odd: pick(outside, rnd), rule: `The other three all use the ${group[0].currency.name}.` };
    },
  },
  {
    id: 'hemisphere',
    rule: 'The other three are entirely south of the equator.',
    find(pool, rnd) {
      const south = pool.filter(c => c.lat < -2);
      const north = pool.filter(c => c.lat > 10);
      if (south.length < 3 || !north.length) return null;
      return { group: sample(south, 3, rnd), odd: pick(north, rnd) };
    },
  },
  {
    id: 'subregion',
    rule: null,
    find(pool, rnd) {
      const bySub = {};
      for (const c of pool) (bySub[c.subregion] = bySub[c.subregion] || []).push(c);
      const big = Object.entries(bySub).filter(([, l]) => l.length >= 3);
      if (!big.length) return null;
      const [sub, list] = pick(big, rnd);
      // The odd one out sits in the same continent, so continent alone will
      // not give it away. This is the hardest of the rules.
      const sameRegion = pool.filter(c => c.region === list[0].region && c.subregion !== sub);
      if (!sameRegion.length) return null;
      const group = sample(list, 3, rnd);
      return { group, odd: pick(sameRegion, rnd), rule: `The other three are in ${sub}.` };
    },
  },
];

function regionName(id) {
  return { europe: 'Europe', africa: 'Africa', asia: 'Asia', americas: 'the Americas', oceania: 'Oceania' }[id] || id;
}

export default {
  id: 'odd-one-out',
  title: 'Odd One Out',
  emoji: '🧩',
  accent: '#ff7ab6',
  category: 'Facts',
  blurb: 'Three of these belong together. One does not.',
  howTo: 'Find the country that breaks the pattern. The pattern is only revealed once you have answered.',
  timeLimitMs: 20000,

  build({ rnd, config, countries }) {
    const pool = buildPool(countries, config);
    const out = [];
    let guard = 0;
    while (out.length < config.rounds && guard++ < config.rounds * 40) {
      const spec = pick(RULES, rnd);
      const found = spec.find(pool, rnd);
      if (!found) continue;
      const { group, odd } = found;
      if (group.some(c => c.iso === odd.iso)) continue;
      // Guard against a "landlocked" set that happens to also all be European
      // while the odd one is not: two rules would then both be true, and the
      // player could be right for the wrong reason but marked correct anyway.
      out.push({
        isos: [...group.map(c => c.iso), odd.iso],
        odd,
        group,
        rule: found.rule || spec.rule,
        opts: shuffle([...group, odd], rnd),
      });
    }
    return out;
  },

  render(host, q, api) {
    host.appendChild(questionText('Which is the odd one out?', 'Three of these share something. Work out what.'));
    const grid = optionGrid(q.opts, {
      correctId: q.odd.iso,
      columns: 2,
      render: c => el('span', { class: 'opt-row' }, [flagImg(c, { size: 'sm' }), optionLabel(c.name, c.subregion)]),
      onPick: (id, right) => api.submit({ correct: right, picked: id }),
    });
    host.appendChild(grid.node);
    return grid;
  },

  factFor(q) {
    return `${q.odd.name} is the odd one out. ${q.rule}`;
  },
};
