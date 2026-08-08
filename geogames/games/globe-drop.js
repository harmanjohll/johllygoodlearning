/* GeoGames - Globe Drop
   Spin the planet and put your finger on the country. There are no options to
   eliminate, and being wrong is not binary: the score is how close you landed,
   so a guess in the right neighbourhood still earns something. This is the one
   that turns a quiz into a game people shout at. */

import { el, sample, fmt } from '../engine/ui.js';
import { haversineKm } from '../engine/geo.js';
import { GlobeView } from '../engine/globe-view.js';
import { questionText } from './_common.js';
import { buildPool } from '../engine/session.js';
import { sound } from '../engine/audio.js';

/* How fast the score falls away with distance. At 500 km you keep four fifths,
   at 2500 km about a third, past 10000 km effectively nothing. */
const DECAY_KM = 2500;

export default {
  id: 'globe-drop',
  title: 'Globe Drop',
  emoji: '🌍',
  accent: '#4cc9f0',
  category: 'Map',
  blurb: 'Spin the globe. Land on the country. Close counts.',
  howTo: 'Drag to spin, scroll or pinch to zoom, then tap where you think the country is. Points scale with how close you land, so always guess.',
  timeLimitMs: 22000,
  scoring: 'accuracy',
  needsShapes: true,

  build({ rnd, config, countries, shapes }) {
    const pool = buildPool(countries, config, c => !!shapes[c.iso]);
    const picks = sample(pool, Math.min(config.rounds, pool.length), rnd);
    return picks.map(answer => ({
      iso: answer.iso,
      answer,
      // Family mode opens on the right part of the world; Expert drops you
      // somewhere arbitrary and you have to find your own way there.
      start: config.difficulty === 'family'
        ? jitter(regionCentre(answer.region), 28, rnd)
        : config.difficulty === 'explorer'
          ? jitter(regionCentre(answer.region), 75, rnd)
          : [rnd() * 360 - 180, rnd() * 90 - 45],
    }));
  },

  render(host, q, api) {
    host.appendChild(questionText(`Find ${q.answer.name}`, 'Drag to spin. Tap to drop your pin.'));

    const stage = el('div', { class: 'globe-stage' });
    const readout = el('div', { class: 'globe-readout', 'aria-live': 'polite' });
    host.appendChild(stage);
    host.appendChild(readout);

    let answered = false;
    const globe = new GlobeView(stage, api.shapes, {
      autoSpin: false,
      hover: false,
      ariaLabel: `Globe. Find ${q.answer.name}. Drag or use arrow keys to spin, Enter to drop a pin at the centre.`,
      onPick: (iso, ll) => {
        if (answered || !ll) return;
        answered = true;
        resolve(ll, iso);
      },
    });
    globe.globe.set(q.start[0], q.start[1]);
    globe.setPaint(() => '#33506d');

    api.onCleanup(() => globe.destroy());

    function resolve(ll, iso) {
      const truthIso = q.answer.iso;
      const home = api.shapes[truthIso].centre;
      const inside = iso === truthIso;
      const km = inside ? 0 : distanceToCountry(api.shapes[truthIso], ll[0], ll[1]);
      const accuracy = inside ? 1 : Math.exp(-km / DECAY_KM);

      globe.setMarkers([
        { lon: ll[0], lat: ll[1], colour: inside ? '#06d6a0' : '#ef476f', label: 'you' },
        { lon: home[0], lat: home[1], colour: '#ffd166', pulse: true },
      ]);
      globe.setHighlight([truthIso]);
      globe.setPaint(i => (i === truthIso ? '#ffd166' : '#2a4360'));
      if (!inside) {
        globe.setArcs([{ from: ll, to: home, colour: 'rgba(255,209,102,0.85)', dash: [5, 5] }]);
      }
      globe.flyTo(home[0], home[1], { ms: 800 });
      sound.proximity(accuracy);

      readout.textContent = inside
        ? 'Dead on.'
        : `${fmt.km(km)} away · ${Math.round(accuracy * 100)}% of the points`;
      readout.classList.add(inside ? 'is-bullseye' : km < 1500 ? 'is-close' : 'is-far');

      api.submit({ correct: inside || km < 400, accuracy, detail: { km, inside } });
    }

    return {
      /* Time ran out with no pin dropped: reveal the answer, score nothing. */
      timeout() {
        if (answered) return;
        answered = true;
        const truth = api.shapes[q.answer.iso];
        globe.setHighlight([q.answer.iso]);
        globe.setPaint(i => (i === q.answer.iso ? '#ffd166' : '#2a4360'));
        globe.setMarkers([{ lon: truth.centre[0], lat: truth.centre[1], colour: '#ffd166', pulse: true }]);
        globe.flyTo(truth.centre[0], truth.centre[1], { ms: 700 });
        readout.textContent = 'No pin dropped.';
        api.submit({ correct: false, accuracy: 0, detail: { km: null, inside: false } });
      },
      get settled() { return answered; },
    };
  },

  factFor(q) {
    const c = q.answer;
    return `${c.name} · ${c.capital} · ${c.subregion}${c.landlocked ? ' · landlocked' : ''}`;
  },
};

/* Shortest distance from a point to a country, approximated as the distance to
   its nearest outline vertex. At 1:50m resolution the vertices are a few
   kilometres apart, which is far finer than the scoring cares about. */
function distanceToCountry(country, lon, lat) {
  let best = Infinity;
  for (const ring of country.rings) {
    for (let i = 0; i < ring.n; i++) {
      const km = haversineKm(lon, lat, ring.ll[i * 2], ring.ll[i * 2 + 1]);
      if (km < best) best = km;
    }
  }
  return best;
}

const REGION_CENTRES = {
  europe: [15, 52],
  africa: [20, 2],
  asia: [88, 32],
  americas: [-75, 5],
  oceania: [150, -22],
};

function regionCentre(region) {
  return REGION_CENTRES[region] || [10, 20];
}

function jitter([lon, lat], deg, rnd) {
  return [lon + (rnd() - 0.5) * deg * 2, Math.max(-70, Math.min(70, lat + (rnd() - 0.5) * deg))];
}
