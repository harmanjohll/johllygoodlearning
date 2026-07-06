/* Memory Match (board game) — flip cards to pair each flag with its country.
   Fewer moves + faster = higher score. Great for the youngest. */
import { flagImg, el } from '../../engine/ui.js';
import { sound } from '../../engine/sound.js';

const PAIRS_BY_RANK = { explorer: 4, navigator: 6, cartographer: 8 };

export const memoryMatch = {
  id: 'flags/memory-match',
  title: 'Memory Match',
  category: 'Flags',
  emoji: '\u{1F0CF}',
  blurb: 'Flip cards to pair flags with countries.',
  kind: 'board',
  needsMapNo: false,

  run(mount, ctx, finish) {
    const n = Math.min(PAIRS_BY_RANK[ctx.rank] || 5, ctx.pool.length);
    const picks = ctx.shuffle(ctx.pool).slice(0, n);
    // build 2n cards: one flag + one name per country
    let cards = [];
    picks.forEach(c => {
      cards.push({ iso: c.iso, kind: 'flag', country: c });
      cards.push({ iso: c.iso, kind: 'name', country: c });
    });
    cards = ctx.shuffle(cards);

    let moves = 0, matched = 0, startedAt = performance.now();
    let first = null, busy = false;
    const matchedIsos = [];

    const status = el('div', { class: 'mm-status' }, [
      el('span', { class: 'mm-stat', id: 'mm-pairs', text: `0 / ${n} pairs` }),
      el('span', { class: 'mm-stat', id: 'mm-moves', text: '0 moves' }),
    ]);
    const grid = el('div', { class: 'mm-grid', style: { '--mm-cols': String(Math.min(cards.length, cards.length <= 8 ? 4 : cards.length <= 12 ? 4 : 4)) } });

    mount.appendChild(el('div', { class: 'q-prompt' }, [el('div', { class: 'q-kicker', text: 'Pair every flag with its country' })]));
    mount.appendChild(status);
    mount.appendChild(grid);

    function faceContent(card) {
      if (card.kind === 'flag') return flagImg(card.country, 'mm-flag');
      return el('span', { class: 'mm-name', text: card.country.name });
    }

    cards.forEach((card, i) => {
      const face = el('div', { class: 'mm-face' }, [faceContent(card)]);
      const cardEl = el('button', { class: 'mm-card', type: 'button', 'aria-label': 'card', dataset: { iso: card.iso, kind: card.kind }, onclick: () => flip(card, cardEl, face) }, [
        el('div', { class: 'mm-back', text: '🌐' }),
        face,
      ]);
      card.el = cardEl;
      grid.appendChild(cardEl);
    });

    function flip(card, cardEl) {
      if (busy || card.matched || card === first || cardEl.classList.contains('is-up')) return;
      cardEl.classList.add('is-up');
      sound.tick();
      if (!first) { first = card; return; }
      moves++; status.querySelector('#mm-moves').textContent = moves + (moves === 1 ? ' move' : ' moves');
      if (first.iso === card.iso && first.kind !== card.kind) {
        // match
        card.matched = first.matched = true;
        card.el.classList.add('is-matched'); first.el.classList.add('is-matched');
        matchedIsos.push(card.iso);
        matched++; status.querySelector('#mm-pairs').textContent = `${matched} / ${n} pairs`;
        sound.correct();
        first = null;
        if (matched === n) endGame();
      } else {
        busy = true; sound.wrong();
        const a = first, b = card; first = null;
        setTimeout(() => { a.el.classList.remove('is-up'); b.el.classList.remove('is-up'); busy = false; }, 750);
      }
    }

    function endGame() {
      const seconds = Math.round((performance.now() - startedAt) / 1000);
      const score = Math.max(50, 1000 - moves * 15 - seconds * 3 + n * 40);
      setTimeout(() => finish({ score, correct: n, total: n, correctIsos: matchedIsos, detail: `${moves} moves · ${seconds}s` }), 500);
    }
  },
};
