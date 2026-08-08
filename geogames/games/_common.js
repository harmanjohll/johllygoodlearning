/* ===========================================================================
   GeoGames - Shared game furniture

   Multiple-choice rendering, and the picking of wrong answers. The second one
   matters more than it sounds: a question is only as good as its distractors.
   Offering Brazil, Chad, Norway and Japan for a South American flag is not a
   question, it is a colour test.
   =========================================================================== */

import { el, shuffle, pick, sample } from '../engine/ui.js';
import { sound } from '../engine/audio.js';

/* Choose n wrong answers that are plausibly confusable with `answer`.
   Preference order: same subregion, then same region, then anywhere. A scoring
   function can be passed to bias further, for example towards flags with the
   same dominant colours. */
export function distractors(answer, pool, n, rnd, { score = null } = {}) {
  const others = pool.filter(c => c.iso !== answer.iso);
  if (others.length <= n) return others;

  const tiers = [
    others.filter(c => c.subregion === answer.subregion),
    others.filter(c => c.region === answer.region && c.subregion !== answer.subregion),
    others.filter(c => c.region !== answer.region),
  ];

  if (score) {
    for (const t of tiers) t.sort((a, b) => score(b, answer) - score(a, answer));
  }

  const out = [];
  // Mostly near neighbours, but always at least one from further away so the
  // answer is not simply "the odd one out geographically".
  const wantNear = Math.max(1, n - 1);
  for (const t of tiers) {
    const take = out.length < wantNear ? wantNear - out.length : n - out.length;
    if (take <= 0) break;
    const picked = score ? t.slice(0, Math.min(t.length, take * 2)) : t;
    for (const c of shuffle(picked, rnd).slice(0, take)) {
      if (!out.some(x => x.iso === c.iso)) out.push(c);
    }
  }
  for (const c of shuffle(others, rnd)) {
    if (out.length >= n) break;
    if (!out.some(x => x.iso === c.iso)) out.push(c);
  }
  return out.slice(0, n);
}

/* Names that look alike trip people up more than names that sound alike, so
   this rewards shared prefixes and shared length. */
export function nameSimilarity(a, b) {
  const x = a.name.toLowerCase(), y = b.name.toLowerCase();
  let shared = 0;
  while (shared < x.length && shared < y.length && x[shared] === y[shared]) shared++;
  return shared * 3 - Math.abs(x.length - y.length) * 0.4;
}

/* Build a shuffled option list with the answer in it. */
export function options(answer, pool, count, rnd, opts) {
  return shuffle([answer, ...distractors(answer, pool, count - 1, rnd, opts)], rnd);
}

/* ── the option grid ────────────────────────────────────────────────────────
   Renders buttons, wires up number-key shortcuts, and on a pick freezes the
   grid and marks both the chosen answer and the true one. Correctness is never
   shown by colour alone: every marked button also carries a tick or a cross
   and an aria-label, for players who cannot rely on green and red. */
export function optionGrid(items, { correctId, onPick, render, columns = 2, idOf = x => x.iso }) {
  const buttons = [];
  let settled = false;

  const grid = el('div', { class: `opt-grid opt-cols-${columns}`, role: 'group' });

  items.forEach((item, i) => {
    const id = idOf(item);
    const btn = el('button', {
      class: 'opt', type: 'button', 'data-id': id,
      onclick: () => choose(id),
      onmouseenter: () => { if (!settled) sound.hover(); },
    }, [
      el('kbd', { class: 'opt-key', 'aria-hidden': 'true', text: String(i + 1) }),
      render(item),
    ]);
    buttons.push(btn);
    grid.appendChild(btn);
  });

  let revealed = false;

  function mark(id, cls, symbol, note) {
    const b = buttons.find(x => x.dataset.id === id);
    if (!b) return;
    b.classList.add(cls);
    b.appendChild(el('span', { class: 'opt-mark', 'aria-hidden': 'true', text: symbol }));
    // Read the option's own text, skipping the shortcut digit and the tick, so
    // a screen reader announces "Wrong: Colombia" rather than "Wrong: 1Colombia".
    const label = [...b.childNodes]
      .filter(n => !(n.classList && (n.classList.contains('opt-key') || n.classList.contains('opt-mark'))))
      .map(n => n.textContent)
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();
    b.setAttribute('aria-label', `${note}: ${label}`);
  }

  function freeze() {
    buttons.forEach(b => { b.disabled = true; b.classList.add('is-settled'); });
  }

  /* Showing the true answer is the shell's call, not this grid's. On a miss in
     a party game the next player may be about to steal, and a grid that has
     already ticked the right box has just handed them the point. */
  function reveal(note = 'The answer was') {
    if (revealed) return;
    revealed = true;
    mark(correctId, 'is-right', '✓', note);
  }

  function choose(id) {
    if (settled) return;
    settled = true;
    freeze();
    const right = id === correctId;
    if (right) reveal('Correct');
    else mark(id, 'is-wrong', '✗', 'Wrong');
    onPick(id, right);
  }

  function keys(e) {
    if (settled) return;
    const n = parseInt(e.key, 10);
    if (n >= 1 && n <= items.length) {
      e.preventDefault();
      buttons[n - 1].focus();
      choose(idOf(items[n - 1]));
    }
  }

  return {
    node: grid,
    keys,
    reveal,
    /* Exposed so the steal panel can redraw the same options the same way. A
       "what is the capital?" question must not turn into "name the country"
       just because someone else is answering it. */
    items, render, idOf, correctId,
    /* Called when the clock runs out with nothing picked. */
    timeout() {
      if (settled) return;
      settled = true;
      freeze();
      reveal();
    },
    get settled() { return settled; },
  };
}

/* Standard label used inside option buttons. */
export function optionLabel(text, sub) {
  return el('span', { class: 'opt-label' }, [
    el('span', { class: 'opt-title', text }),
    sub ? el('span', { class: 'opt-sub', text: sub }) : null,
  ]);
}

/* A prompt block: the big thing the player is looking at. */
export function prompt(children, { className = '' } = {}) {
  return el('div', { class: `q-prompt ${className}`.trim() }, [].concat(children));
}

export function questionText(text, hint) {
  return el('div', { class: 'q-text' }, [
    el('h2', { text }),
    hint ? el('p', { class: 'q-hint', text: hint }) : null,
  ]);
}

export { pick, sample, shuffle };
