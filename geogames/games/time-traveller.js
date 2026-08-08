/* GeoGames - Time Traveller
   History, played on the map. Three question shapes are drawn from the era
   data in data/eras.js: read a painted world and date it, work out who ruled a
   highlighted country, or pick which country belonged to a given power.

   The era maps colour today's borders by yesterday's powers, which is a
   simplification the app states plainly every time it shows one. Questions are
   only ever built from countries that sit in exactly one power that year, so
   there is never a defensible second answer. */

import { el, flagImg, shuffle, sample, pick } from '../engine/ui.js';
import { MapView } from '../engine/map-view.js';
import { optionGrid, optionLabel, questionText } from './_common.js';
import { ERAS } from '../data/eras.js';

const REGION_COLOURS = {
  europe: '#6b8fd4', africa: '#e08b3c', asia: '#c94f4f',
  americas: '#5aa96b', oceania: '#8f6bb5',
};

/* iso -> polity for one era. First listed power wins where two overlap, which
   matches the order the eras are written in: the dominant power comes first. */
export function eraOwners(era) {
  const owners = {};
  if (era.byRegion) return owners;
  for (const p of era.polities) {
    for (const iso of p.iso) if (!owners[iso]) owners[iso] = p;
  }
  return owners;
}

/* Countries claimed by exactly one power that year. Everything a question is
   built from comes from this list. */
function unambiguous(era) {
  const count = {};
  for (const p of era.polities) for (const iso of p.iso) count[iso] = (count[iso] || 0) + 1;
  return Object.keys(count).filter(iso => count[iso] === 1);
}

export function paintEra(era, byIso) {
  if (era.byRegion) {
    return iso => (byIso[iso] ? REGION_COLOURS[byIso[iso].region] : null);
  }
  const owners = eraOwners(era);
  return iso => (owners[iso] ? owners[iso].colour : null);
}

export default {
  id: 'time-traveller',
  title: 'Time Traveller',
  emoji: '⏳',
  accent: '#c9a227',
  category: 'History',
  blurb: 'Same planet, different centuries. Read the map and work out when you are.',
  howTo: 'Date a map from how the world is carved up, name who ruled a place, or spot which country belonged to an empire. The maps are approximate, and say so.',
  timeLimitMs: 25000,
  needsShapes: true,

  build({ rnd, config, countries }) {
    const byIso = Object.fromEntries(countries.map(c => [c.iso, c]));
    const dated = ERAS.filter(e => !e.byRegion);
    const out = [];
    let guard = 0;

    while (out.length < config.rounds && guard++ < config.rounds * 40) {
      const kind = pick(['year', 'year', 'ruler', 'ruler', 'member'], rnd);
      const era = pick(dated, rnd);

      if (kind === 'year') {
        const others = sample(ERAS.filter(e => e.id !== era.id), 3, rnd);
        if (others.length < 3) continue;
        out.push({
          kind, era,
          opts: shuffle([era, ...others], rnd),
          correctId: era.id,
        });
        continue;
      }

      if (kind === 'ruler') {
        const solo = unambiguous(era).filter(iso => byIso[iso]);
        if (solo.length < 4 || era.polities.length < 4) continue;
        const iso = pick(solo, rnd);
        const owners = eraOwners(era);
        const truth = owners[iso];
        const wrong = sample(era.polities.filter(p => p.id !== truth.id), 3, rnd);
        if (wrong.length < 3) continue;
        out.push({
          kind, era, iso, country: byIso[iso], truth,
          opts: shuffle([truth, ...wrong], rnd),
          correctId: truth.id,
        });
        continue;
      }

      // kind === 'member'
      const solo = new Set(unambiguous(era));
      const polity = pick(era.polities.filter(p => p.iso.some(i => solo.has(i) && byIso[i])), rnd);
      if (!polity) continue;
      const member = new Set(polity.iso);
      const answer = byIso[pick(polity.iso.filter(i => solo.has(i) && byIso[i]), rnd)];
      // Decoys are preferably countries that belonged to a rival power that
      // same year: they are period-plausible, so the question tests knowledge
      // rather than which name sounds oldest.
      const rivals = era.polities
        .filter(p => p.id !== polity.id)
        .flatMap(p => p.iso)
        .filter(i => byIso[i] && !member.has(i));
      const fallback = countries.filter(c => !member.has(c.iso)).map(c => c.iso);
      const decoyIsos = sample([...new Set(rivals)], 3, rnd);
      while (decoyIsos.length < 3) {
        const extra = pick(fallback, rnd);
        if (extra && !decoyIsos.includes(extra) && !member.has(extra)) decoyIsos.push(extra);
      }
      const decoys = decoyIsos.slice(0, 3).map(i => byIso[i]).filter(Boolean);
      if (decoys.length < 3 || !answer) continue;
      out.push({
        kind, era, polity, iso: answer.iso, answer,
        opts: shuffle([answer, ...decoys], rnd),
        correctId: answer.iso,
      });
    }
    return out;
  },

  render(host, q, api) {
    const byIso = api.byIso;

    if (q.kind === 'member') {
      host.appendChild(questionText(
        `Which of these was part of the ${q.polity.name}?`,
        `As it stood in ${q.era.year}.`
      ));
      const grid = optionGrid(q.opts, {
        correctId: q.correctId,
        columns: 2,
        render: c => el('span', { class: 'opt-row' }, [flagImg(c, { size: 'sm' }), optionLabel(c.name)]),
        onPick: (id, right) => api.submit({ correct: right, picked: id }),
      });
      host.appendChild(grid.node);
      return grid;
    }

    // Both map questions show the era map.
    const stage = el('div', { class: 'era-map' });
    host.appendChild(stage);
    const map = new MapView(stage, api.shapes, { interactive: false, dimUnpainted: true });
    map.setPaint(paintEra(q.era, byIso));
    if (q.kind === 'ruler') map.setHighlight([q.iso]);
    api.onCleanup(() => map.destroy());

    host.appendChild(el('p', {
      class: 'era-caveat',
      text: 'Historical extents, painted approximately over modern borders.',
    }));

    if (q.kind === 'ruler') {
      host.appendChild(questionText(
        `Who ruled ${q.country.name} in ${q.era.year}?`,
        'The country is outlined in white.'
      ));
      const grid = optionGrid(q.opts, {
        correctId: q.correctId,
        columns: 2,
        idOf: p => p.id,
        render: p => el('span', { class: 'opt-row' }, [
          el('span', { class: 'era-swatch', style: { background: p.colour }, 'aria-hidden': 'true' }),
          optionLabel(p.name),
        ]),
        onPick: (id, right) => {
          const home = api.shapes[q.iso];
          if (home) map.flyTo(home.centre[0], home.centre[1], { ms: 600, zoom: 2.2 });
          api.submit({ correct: right, picked: id });
        },
      });
      host.appendChild(grid.node);
      return grid;
    }

    host.appendChild(questionText('When is this?', 'Colours are the powers of the day.'));
    const grid = optionGrid(q.opts, {
      correctId: q.correctId,
      columns: 2,
      idOf: e => e.id,
      // Year only. Showing each era's title next to it would hand the answer
      // over: nobody needs to read a map to pair "1279" with "The Mongol
      // Century" when the map is plainly full of Mongols.
      render: e => optionLabel(e.id === 'today' ? 'Today' : String(e.year)),
      onPick: (id, right) => api.submit({ correct: right, picked: id }),
    });
    host.appendChild(grid.node);
    return grid;
  },

  factFor(q) {
    if (q.kind === 'year') return `${q.era.year} — ${q.era.title}. ${q.era.subtitle}.`;
    if (q.kind === 'ruler') return `${q.truth.name}. ${q.truth.blurb}`;
    return `${q.answer.name} sat inside the ${q.polity.name}. ${q.polity.blurb}`;
  },
};
