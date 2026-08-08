/* GeoGames - Silhouette
   The country's real coastline, drawn from Natural Earth data, with nothing
   around it. On Expert the outline is rotated and sometimes mirrored, which
   removes the "I recognise the picture" shortcut and leaves only the shape. */

import { el, sample, prefersReducedMotion } from '../engine/ui.js';
import { silhouettePaths } from '../engine/geo.js';
import { options, optionGrid, optionLabel, questionText, nameSimilarity } from './_common.js';
import { DIFFICULTY, buildPool } from '../engine/session.js';

/* Below roughly this area a 1:50m outline is a blob, and no player could
   fairly be asked to name it. Singapore, Malta and Bahrain sit out. */
const MIN_AREA_KM2 = 9000;

export default {
  id: 'outline',
  title: 'Silhouette',
  emoji: '🗺️',
  accent: '#06d6a0',
  category: 'Shapes',
  blurb: 'Just the outline. No flag, no label, no help.',
  howTo: 'Name the country from its shape alone. On Expert the outline may be turned or flipped.',
  timeLimitMs: 14000,

  build({ rnd, config, countries, shapes }) {
    const drawable = c => shapes[c.iso] && c.area >= MIN_AREA_KM2;
    const pool = buildPool(countries, config, drawable);
    const n = DIFFICULTY[config.difficulty].options;
    const hard = config.difficulty === 'expert';
    const picks = sample(pool, Math.min(config.rounds, pool.length), rnd);
    return picks.map(answer => ({
      iso: answer.iso,
      answer,
      rotate: hard ? (rnd() - 0.5) * Math.PI * 1.2 : 0,
      mirror: hard && rnd() < 0.3,
      opts: options(answer, pool, n, rnd, { score: nameSimilarity }),
    }));
  },

  render(host, q, api) {
    const stage = el('div', { class: 'silhouette-stage' });
    const canvas = el('canvas', {
      class: 'silhouette', role: 'img',
      'aria-label': 'The outline of a country, to be identified',
    });
    stage.appendChild(canvas);
    host.appendChild(stage);
    host.appendChild(questionText('Which country is this?'));

    drawSilhouette(canvas, api.shapes[q.iso], q);

    const grid = optionGrid(q.opts, {
      correctId: q.answer.iso,
      columns: 2,
      render: c => optionLabel(c.name),
      onPick: (id, right) => api.submit({ correct: right, picked: id }),
    });
    host.appendChild(grid.node);
    return grid;
  },

  factFor(q) {
    const c = q.answer;
    const rank = c.area >= 1e6 ? 'one of the giants'
               : c.area >= 3e5 ? 'a mid-sized country'
               : 'a small country';
    return `${c.name} · ${rank} at ${Math.round(c.area).toLocaleString('en-GB')} km² · ${c.subregion}`;
  },
};

function drawSilhouette(canvas, country, q) {
  const paint = () => {
    const rect = canvas.getBoundingClientRect();
    const size = Math.max(120, Math.min(rect.width, rect.height));
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, size, size);

    const pad = size * 0.08;
    const inner = size - pad * 2;
    const rings = silhouettePaths(country, { rotate: q.rotate, mirror: q.mirror });

    ctx.beginPath();
    for (const pts of rings) {
      for (let i = 0; i < pts.length; i += 2) {
        const x = pad + pts[i] * inner;
        const y = pad + pts[i + 1] * inner;
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.closePath();
    }

    const grad = ctx.createLinearGradient(0, 0, size, size);
    grad.addColorStop(0, '#7ee8c4');
    grad.addColorStop(1, '#2fb98c');
    ctx.fillStyle = grad;
    ctx.shadowColor = 'rgba(6,214,160,0.45)';
    ctx.shadowBlur = size * 0.06;
    ctx.fill('evenodd');
    ctx.shadowBlur = 0;
    ctx.lineJoin = 'round';
    ctx.lineWidth = Math.max(1, size / 260);
    ctx.strokeStyle = 'rgba(255,255,255,0.75)';
    ctx.stroke();
  };

  // The stage is sized by CSS, so wait a frame for layout before measuring.
  requestAnimationFrame(paint);
  if (window.ResizeObserver) {
    const ro = new ResizeObserver(paint);
    ro.observe(canvas);
    // Stop observing once the canvas leaves the document.
    const mo = new MutationObserver(() => {
      if (!canvas.isConnected) { ro.disconnect(); mo.disconnect(); }
    });
    mo.observe(document.body, { childList: true, subtree: true });
  }
  if (!prefersReducedMotion()) canvas.classList.add('is-entering');
}
