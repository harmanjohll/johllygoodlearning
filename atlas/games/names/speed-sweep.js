/* Speed Sweep (board game) — 60 seconds to name as many countries as you can.
   Typed for older players; tap-the-country for Explorers (no typing). */
import { el, mcqButtons } from '../../engine/ui.js';
import { matchCountryName } from '../_contract.js';
import { sound } from '../../engine/sound.js';
import { REGIONS } from '../../data/countries.js';

const DURATION = 60000;
const REGION_NAMES = { europe: 'Europe', africa: 'Africa', asia: 'Asia', americas: 'the Americas', oceania: 'Oceania' };

export const speedSweep = {
  id: 'names/speed-sweep',
  title: 'Speed Sweep',
  category: 'Countries',
  emoji: '\u{26A1}',
  blurb: 'Name as many countries as you can in 60s.',
  kind: 'board',

  run(mount, ctx, finish) {
    const tap = ctx.rankCfg.input === 'mcq';
    const found = new Set();
    let score = 0, ended = false;
    const scopeLabel = ctx.region === 'all' ? 'the world' : REGION_NAMES[ctx.region] || ctx.region;

    const scoreEl = el('span', { class: 'mm-stat', text: '0 found' });
    const bar = el('div', { class: 'timer' }, [el('div', { class: 'timer-fill' })]);
    const body = el('div', {});
    mount.appendChild(el('div', { class: 'q-prompt' }, [
      el('div', { class: 'q-kicker', text: tap ? `Tap a country in ${scopeLabel}` : `Type countries in ${scopeLabel} — go!` }),
    ]));
    mount.appendChild(el('div', { class: 'mm-status' }, [scoreEl]));
    mount.appendChild(bar);
    mount.appendChild(body);

    // countdown
    const start = performance.now();
    const fill = bar.querySelector('.timer-fill');
    const iv = setInterval(() => {
      const left = Math.max(0, 1 - (performance.now() - start) / DURATION);
      fill.style.transform = `scaleX(${left})`;
      if (left <= 0.28) bar.classList.add('is-low');
      if (left <= 0) end();
    }, 100);

    function bump(country) {
      found.add(country.iso); score += 10;
      scoreEl.textContent = `${found.size} found`;
      sound.correct();
    }

    if (tap) {
      const next = () => {
        if (ended) return;
        // pick a target region (session region, or random each round if 'all')
        const regionId = ctx.region === 'all' ? REGIONS[Math.floor(ctx.rng() * REGIONS.length)].id : ctx.region;
        const inRegion = ctx.rankPool.filter(c => c.region === regionId && !found.has(c.iso));
        const pickList = inRegion.length ? inRegion : ctx.rankPool.filter(c => c.region === regionId);
        if (!pickList.length) return;
        const subject = pickList[Math.floor(ctx.rng() * pickList.length)];
        const others = ctx.rankPool.filter(c => c.region !== regionId);
        const opts = ctx.shuffle([subject, ...ctx.shuffle(others).slice(0, 3)]).map(c => c.iso);
        clearBody();
        body.appendChild(el('div', { class: 'q-region', style: { textAlign: 'center', marginBottom: '10px' }, text: `Which is in ${REGION_NAMES[regionId]}?` }));
        body.appendChild(mcqButtons({
          options: opts.map(iso => ({ label: ctx.countries[iso].name, value: iso })),
          correctValue: subject.iso,
          onPick: (v) => { if (v === subject.iso) bump(subject); else sound.wrong(); setTimeout(next, 260); },
        }));
      };
      next();
    } else {
      const input = el('input', { class: 'typed-input', type: 'text', placeholder: 'A country…', autocomplete: 'off', autocapitalize: 'words', spellcheck: 'false' });
      const chips = el('div', { class: 'sweep-chips' });
      const form = el('form', { class: 'typed', style: { maxWidth: '380px', margin: '0 auto' }, onsubmit: (e) => {
        e.preventDefault();
        const v = input.value.trim(); input.value = '';
        if (!v || ended) return;
        const hit = ctx.pool.find(c => !found.has(c.iso) && matchCountryName(v, c).correct);
        if (hit) { bump(hit); chips.appendChild(el('span', { class: 'sweep-chip', text: hit.name })); }
        else { input.classList.add('shake'); setTimeout(() => input.classList.remove('shake'), 300); sound.wrong(); }
      } }, [input, el('button', { class: 'typed-go', type: 'submit', text: 'Go' })]);
      body.appendChild(form); body.appendChild(chips);
      setTimeout(() => input.focus(), 40);
    }

    function clearBody() { while (body.firstChild) body.removeChild(body.firstChild); }
    function end() {
      if (ended) return; ended = true; clearInterval(iv);
      finish({ score, correct: found.size, total: found.size, correctIsos: [...found], detail: `${found.size} countries` });
    }
  },
};
