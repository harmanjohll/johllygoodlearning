/* ===========================================================================
   GeoGames - Explore

   The non-competitive half of the app: a globe, a flat map, a country dossier
   and a time machine that repaints the world at seven moments in history.
   Nothing here is scored. It is where you go to settle the argument the game
   just started.
   =========================================================================== */

import { el, clear, fmt, flagImg, normalise } from '../engine/ui.js';
import { GlobeView } from '../engine/globe-view.js';
import { MapView } from '../engine/map-view.js';
import { sound } from '../engine/audio.js';
import { Store } from '../engine/store.js';
import { ERAS } from '../data/eras.js';
import { eraOwners, paintEra } from '../games/time-traveller.js';

const REGION_COLOURS = {
  europe: '#6b8fd4', africa: '#e08b3c', asia: '#c94f4f',
  americas: '#5aa96b', oceania: '#8f6bb5',
};
const REGION_NAMES = {
  europe: 'Europe', africa: 'Africa', asia: 'Asia',
  americas: 'Americas', oceania: 'Oceania',
};

export function exploreScreen(root, { data, onBack }) {
  const { shapes, countries, byIso } = data;
  const todayEra = ERAS[ERAS.length - 1];

  let view = null;
  let mode = 'globe';
  let era = todayEra;
  let selected = null;
  let labels = Store.settings().labels;

  const stage = el('div', { class: 'explore-stage' });
  const sidebar = el('aside', { class: 'explore-side' });
  const legend = el('div', { class: 'era-legend' });
  const eraNote = el('div', { class: 'era-note' });

  const searchInput = el('input', {
    class: 'search-input', type: 'search', placeholder: 'Find a country…',
    'aria-label': 'Find a country', autocomplete: 'off',
  });
  const searchResults = el('ul', { class: 'search-results', role: 'listbox' });

  const modeBtns = [
    ['globe', '🌍 Globe'],
    ['map', '🗺️ Flat map'],
  ].map(([id, label]) => el('button', {
    class: 'seg' + (id === mode ? ' is-on' : ''), type: 'button', text: label,
    'aria-pressed': id === mode ? 'true' : 'false',
    onclick: () => setMode(id),
  }));

  const labelToggle = el('button', {
    class: 'seg' + (labels ? ' is-on' : ''), type: 'button', text: '🏷️ Labels',
    'aria-pressed': labels ? 'true' : 'false',
    onclick: () => {
      labels = !labels;
      Store.setSetting('labels', labels);
      labelToggle.classList.toggle('is-on', labels);
      labelToggle.setAttribute('aria-pressed', labels ? 'true' : 'false');
      if (view) view.setLabels(labels);
    },
  });

  const timeline = el('div', { class: 'timeline', role: 'group', 'aria-label': 'Choose a moment in history' });
  const eraButtons = ERAS.map(e => {
    const b = el('button', {
      class: 'era-pip' + (e.id === era.id ? ' is-on' : ''),
      type: 'button',
      'aria-pressed': e.id === era.id ? 'true' : 'false',
      onclick: () => setEra(e),
    }, [
      el('span', { class: 'era-year', text: e.id === 'today' ? 'Today' : String(e.year) }),
      el('span', { class: 'era-title', text: e.title }),
    ]);
    timeline.appendChild(b);
    return b;
  });

  const frame = el('div', { class: 'explore' }, [
    el('header', { class: 'explore-head' }, [
      el('button', { class: 'hud-quit', type: 'button', text: '←', 'aria-label': 'Back to the games', onclick: onBack }),
      el('h1', { text: 'Explore' }),
      el('div', { class: 'explore-tools' }, [...modeBtns, labelToggle]),
    ]),
    timeline,
    eraNote,
    el('div', { class: 'explore-body' }, [
      el('div', { class: 'explore-main' }, [stage, legend]),
      sidebar,
    ]),
  ]);

  clear(root).appendChild(frame);
  setMode('globe');
  setEra(todayEra);
  renderSidebar();

  /* ── view switching ────────────────────────────────────────────────────── */
  function setMode(next) {
    mode = next;
    modeBtns.forEach(b => {
      const on = b.textContent.includes(next === 'globe' ? 'Globe' : 'Flat');
      b.classList.toggle('is-on', on);
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
    if (view) view.destroy();
    clear(stage);
    const Ctor = next === 'globe' ? GlobeView : MapView;
    view = new Ctor(stage, shapes, {
      hover: true,
      dimUnpainted: true,
      autoSpin: !selected,
      labelFor: iso => (byIso[iso] ? byIso[iso].name : iso),
      onPick: iso => select(iso),
      ariaLabel: next === 'globe'
        ? 'Interactive globe. Drag to spin, tap a country to read about it.'
        : 'Interactive world map. Drag to pan, tap a country to read about it.',
    });
    view.setLabels(labels);
    applyPaint();
    if (selected && shapes[selected]) {
      view.setHighlight([selected]);
      view.flyTo(shapes[selected].centre[0], shapes[selected].centre[1], { ms: 0, zoom: next === 'globe' ? 1.6 : 2.4 });
    }
  }

  function applyPaint() {
    if (!view) return;
    view.setPaint(paintEra(era, byIso));
  }

  /* ── eras ──────────────────────────────────────────────────────────────── */
  function setEra(next) {
    era = next;
    eraButtons.forEach((b, i) => {
      const on = ERAS[i].id === era.id;
      b.classList.toggle('is-on', on);
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
    sound.click();
    applyPaint();
    renderEraNote();
    renderLegend();
    if (selected) renderSidebar();
  }

  function renderEraNote() {
    clear(eraNote);
    eraNote.appendChild(el('div', { class: 'era-note-head' }, [
      el('strong', { text: era.id === 'today' ? 'Today' : String(era.year) }),
      el('span', { text: era.title }),
    ]));
    eraNote.appendChild(el('p', { text: era.note }));
    if (!era.byRegion) {
      eraNote.appendChild(el('p', {
        class: 'era-caveat',
        text: 'These are approximate extents painted over modern borders. Empires did not follow the lines you see, and the grey is not empty: it is everyone whose lands were not held by the powers listed.',
      }));
    }
  }

  function renderLegend() {
    clear(legend);
    const items = era.byRegion
      ? Object.entries(REGION_COLOURS).map(([id, colour]) => ({ id, name: REGION_NAMES[id], colour }))
      : era.polities;
    for (const p of items) {
      legend.appendChild(el('button', {
        class: 'legend-item', type: 'button',
        title: p.blurb || '',
        onclick: () => {
          if (p.blurb) showPolity(p);
          else highlightRegion(p.id);
        },
      }, [
        el('span', { class: 'legend-swatch', style: { background: p.colour }, 'aria-hidden': 'true' }),
        el('span', { text: p.name }),
      ]));
    }
    legend.appendChild(el('button', {
      class: 'legend-item is-muted', type: 'button', disabled: true,
    }, [
      el('span', { class: 'legend-swatch', style: { background: '#22334d' }, 'aria-hidden': 'true' }),
      el('span', { text: era.byRegion ? 'not shown' : 'other states and peoples' }),
    ]));
  }

  function highlightRegion(region) {
    const isos = countries.filter(c => c.region === region).map(c => c.iso);
    view.setHighlight(isos);
    setTimeout(() => view.setHighlight(selected ? [selected] : []), 1800);
  }

  function showPolity(p) {
    view.setHighlight(p.iso.filter(i => shapes[i]));
    selected = null;
    clear(sidebar);
    sidebar.appendChild(el('div', { class: 'dossier' }, [
      el('div', { class: 'dossier-head' }, [
        el('span', { class: 'legend-swatch lg', style: { background: p.colour }, 'aria-hidden': 'true' }),
        el('div', {}, [
          el('h2', { text: p.name }),
          el('p', { class: 'dossier-sub', text: `${era.title} · ${era.year}` }),
        ]),
      ]),
      el('p', { class: 'dossier-blurb', text: p.blurb }),
      p.caveat ? el('p', { class: 'dossier-caveat', text: 'Caveat: ' + p.caveat }) : null,
      el('h3', { text: `Modern countries shaded (${p.iso.length})` }),
      el('div', { class: 'chip-row' }, p.iso.map(iso => byIso[iso]
        ? el('button', { class: 'chip', type: 'button', text: byIso[iso].name, onclick: () => select(iso) })
        : el('span', { class: 'chip is-muted', text: iso }))),
    ]));
  }

  /* ── selection and the dossier ─────────────────────────────────────────── */
  function select(iso) {
    if (!iso || !byIso[iso]) return;
    selected = iso;
    sound.click();
    view.setAutoSpin(false);
    view.setHighlight([iso]);
    if (shapes[iso]) {
      view.flyTo(shapes[iso].centre[0], shapes[iso].centre[1],
                 { ms: 700, zoom: mode === 'globe' ? 1.8 : 3 });
    }
    renderSidebar();
    sidebar.scrollTop = 0;
  }

  function renderSidebar() {
    clear(sidebar);
    sidebar.appendChild(el('div', { class: 'search' }, [searchInput, searchResults]));

    if (!selected) {
      sidebar.appendChild(el('div', { class: 'dossier is-empty' }, [
        el('h2', { text: 'Pick a country' }),
        el('p', { text: mode === 'globe'
          ? 'Spin the globe and tap anywhere. Drag to turn it, scroll or pinch to zoom in.'
          : 'Tap any country on the map, or search above.' }),
        el('p', { text: 'The timeline above repaints the same world at seven moments in history.' }),
        el('div', { class: 'stat-row' }, [
          stat('194', 'countries'),
          stat(String(ERAS.length), 'eras'),
          stat(String(Store.visited().length), 'named right'),
        ]),
      ]));
      return;
    }

    const c = byIso[selected];
    const geo = shapes[selected];
    const seen = Store.seen()[selected];

    const facts = [
      ['Capital', c.capital || '—'],
      ['Region', `${REGION_NAMES[c.region]} · ${c.subregion}`],
      ['Area', c.area ? fmt.km2(c.area) : '—'],
      ['People', c.pop ? fmt.people(c.pop) : '—'],
      ['Density', c.pop && c.area ? `${Math.round(c.pop / c.area).toLocaleString('en-GB')} per km²` : '—'],
      ['Currency', c.currency ? `${c.currency.name} (${c.currency.code})` : '—'],
      ['Languages', c.languages && c.languages.length ? c.languages.join(', ') : '—'],
      ['Demonym', c.demonym || '—'],
      ['Dialling code', c.phone || '—'],
      ['Neighbours', c.borders.length ? `${c.borders.length}` : c.landlocked ? 'none, and landlocked' : 'none, an island or coastal state'],
    ];

    sidebar.appendChild(el('div', { class: 'dossier' }, [
      el('div', { class: 'dossier-head' }, [
        flagImg(c, { size: 'lg' }),
        el('div', {}, [
          el('h2', { text: c.name }),
          el('p', { class: 'dossier-sub', text: `${c.emoji} ${c.iso} · ${c.iso3}` }),
        ]),
      ]),

      el('dl', { class: 'facts' }, facts.flatMap(([k, v]) => [
        el('dt', { text: k }), el('dd', { text: v }),
      ])),

      c.borders.length ? el('div', {}, [
        el('h3', { text: 'Shares a land border with' }),
        el('div', { class: 'chip-row' }, c.borders.map(b => byIso[b]
          ? el('button', { class: 'chip', type: 'button', onclick: () => select(b) }, [
              el('span', { text: byIso[b].emoji + ' ' + byIso[b].name }),
            ])
          : null).filter(Boolean)),
      ]) : null,

      el('div', {}, [
        el('h3', { text: 'Through the eras' }),
        el('ul', { class: 'era-history' }, ERAS.filter(e => !e.byRegion).map(e => {
          const owner = eraOwners(e)[selected];
          return el('li', {}, [
            el('button', {
              class: 'era-history-btn', type: 'button',
              onclick: () => setEra(e),
            }, [
              el('span', { class: 'era-history-year', text: String(e.year) }),
              el('span', { class: 'legend-swatch', 'aria-hidden': 'true',
                style: { background: owner ? owner.colour : '#22334d' } }),
              el('span', { text: owner ? owner.name : 'not under a power listed for this era' }),
            ]),
          ]);
        })),
      ]),

      seen ? el('p', { class: 'dossier-record', text:
        `You have been asked about ${c.name} ${seen.asked} ${seen.asked === 1 ? 'time' : 'times'} and got it right ${seen.correct}.` }) : null,

      geo ? el('p', { class: 'dossier-record', text:
        `Outline centre ${Math.abs(geo.centre[1]).toFixed(1)}° ${geo.centre[1] >= 0 ? 'N' : 'S'}, ${Math.abs(geo.centre[0]).toFixed(1)}° ${geo.centre[0] >= 0 ? 'E' : 'W'}.` }) : null,
    ]));
  }

  function stat(value, label) {
    return el('div', { class: 'stat' }, [
      el('span', { class: 'stat-value', text: value }),
      el('span', { class: 'stat-label', text: label }),
    ]);
  }

  /* ── search ────────────────────────────────────────────────────────────── */
  searchInput.addEventListener('input', () => {
    const q = normalise(searchInput.value);
    clear(searchResults);
    if (q.length < 2) return;
    const hits = countries
      .map(c => ({ c, score: matchScore(c, q) }))
      .filter(x => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 7);
    for (const { c } of hits) {
      searchResults.appendChild(el('li', {}, [
        el('button', { class: 'search-hit', type: 'button', onclick: () => {
          searchInput.value = '';
          clear(searchResults);
          select(c.iso);
        } }, [
          flagImg(c, { size: 'sm' }),
          el('span', { text: c.name }),
          el('span', { class: 'search-cap', text: c.capital }),
        ]),
      ]));
    }
    if (!hits.length) {
      searchResults.appendChild(el('li', { class: 'search-empty', text: 'Nothing matches that.' }));
    }
  });

  searchInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      const first = searchResults.querySelector('.search-hit');
      if (first) { e.preventDefault(); first.click(); }
    }
  });

  return {
    teardown() { if (view) view.destroy(); },
  };
}

function matchScore(c, q) {
  const name = normalise(c.name);
  if (name === q) return 100;
  if (name.startsWith(q)) return 80;
  if (name.includes(q)) return 60;
  if (normalise(c.capital).startsWith(q)) return 50;
  if (c.aliases.some(a => normalise(a).startsWith(q))) return 40;
  if (c.iso.toLowerCase() === q || c.iso3.toLowerCase() === q) return 90;
  return 0;
}
