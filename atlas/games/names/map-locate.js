/* Map Locate — "Find France": tap the country on a continent-zoomed map. */
import { el } from '../../engine/ui.js';
import { buildLocateMap, markCountry, hasCountry } from '../../engine/worldmap.js';
import { COUNTRIES } from '../../data/countries.js';

const REGION_NAMES = { europe: 'Europe', africa: 'Africa', asia: 'Asia', americas: 'the Americas', oceania: 'Oceania' };

function regionIsos(region) {
  return COUNTRIES.filter(c => c.region === region && hasCountry(c.iso)).map(c => c.iso);
}

function pickMapped(ctx) {
  const onMap = ctx.pool.filter(c => hasCountry(c.iso));
  if (onMap.length) return onMap[Math.floor(ctx.rng() * onMap.length)];
  return ctx.pickSubject();
}

export const mapLocate = {
  id: 'names/map-locate',
  title: 'Map Locate',
  category: 'Countries',
  emoji: '\u{1F4CD}',
  blurb: 'Find a country on the map.',
  needsMap: true,

  generate(ctx) {
    const subject = pickMapped(ctx);
    return {
      subjectIso: subject.iso, subject,
      prompt: { type: 'locate', iso: subject.iso, region: subject.region },
      answer: subject.iso,
    };
  },

  render(question, mount, ctx, submit) {
    let usedHint = false;
    const c = question.subject;
    const focus = regionIsos(c.region);

    mount.appendChild(el('div', { class: 'q-prompt' }, [
      el('div', { class: 'q-kicker', text: `Find this country in ${REGION_NAMES[c.region] || c.region}` }),
      el('div', { class: 'q-region', text: c.name }),
    ]));

    const svg = buildLocateMap({
      focusIsos: focus,
      interactive: focus,
      onPick: (id) => {
        const correct = id.toUpperCase() === question.answer;
        if (!correct) markCountry(svg, id, 'is-wrong');
        markCountry(svg, question.answer, 'is-correct');
        submit(id.toUpperCase(), { usedHint });
      },
    });
    const stage = el('div', { class: 'map-stage' }, [
      svg || el('div', { class: 'muted', text: '(map unavailable)' }),
      el('div', { class: 'map-credit', text: 'Map: simple-world-map, CC BY-SA 3.0' }),
    ]);
    mount.appendChild(stage);

    if (ctx.rankCfg.hints && svg) {
      const hintBtn = el('button', {
        class: 'hint-btn', type: 'button', text: 'Show me roughly where',
        onclick: () => {
          usedHint = true;
          const el2 = markCountry(svg, question.answer, 'wm-hint');
          setTimeout(() => { if (el2) el2.classList.remove('wm-hint'); }, 1100);
          hintBtn.disabled = true;
        },
      });
      mount.appendChild(hintBtn);
    }
  },

  check(question, value) {
    const ok = String(value).toUpperCase() === String(question.answer);
    return { correct: ok, closeness: ok ? 1 : 0 };
  },

  describe(question) { return { answer: question.subject.name, iso: question.subjectIso }; },
};
