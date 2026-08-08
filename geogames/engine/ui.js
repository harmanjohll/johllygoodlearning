/* ===========================================================================
   GeoGames - DOM helpers
   A very small element builder, plus the handful of shared widgets that more
   than one screen needs. No framework, no virtual DOM, no build step.
   =========================================================================== */

const FLAG_DIR = '../atlas/assets/flags/';

/* el('div', {class, text, html, ...attrs, on*: handler, style: {}}, children) */
export function el(tag, props = {}, children = []) {
  const node = document.createElement(tag);
  for (const key in props) {
    const v = props[key];
    if (v === null || v === undefined || v === false) continue;
    if (key === 'text') node.textContent = v;
    else if (key === 'html') node.innerHTML = v;
    else if (key === 'class') node.className = v;
    else if (key === 'style' && typeof v === 'object') Object.assign(node.style, v);
    else if (key === 'dataset') Object.assign(node.dataset, v);
    else if (key.startsWith('on') && typeof v === 'function') {
      node.addEventListener(key.slice(2).toLowerCase(), v);
    } else node.setAttribute(key, v === true ? '' : v);
  }
  for (const c of [].concat(children)) {
    if (c === null || c === undefined || c === false) continue;
    node.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
  }
  return node;
}

export function clear(node) {
  while (node.firstChild) node.removeChild(node.firstChild);
  return node;
}

export function frag(children) {
  const f = document.createDocumentFragment();
  for (const c of children) if (c) f.appendChild(c);
  return f;
}

/* Flags are shared with the Family Atlas rather than copied; see NOTICE.md. */
export function flagImg(country, { size = 'md', className = '' } = {}) {
  return el('img', {
    class: `flag flag-${size} ${className}`.trim(),
    src: FLAG_DIR + country.flag,
    alt: `Flag of ${country.name}`,
    loading: 'lazy',
    decoding: 'async',
    draggable: 'false',
  });
}

export function icon(name) {
  return el('span', { class: 'ico', 'aria-hidden': 'true', text: name });
}

/* ── formatting ─────────────────────────────────────────────────────────── */
export const fmt = {
  int: n => (n || 0).toLocaleString('en-GB'),
  km2: n => n >= 1000000 ? `${(n / 1000000).toFixed(2)}m km²`
          : n >= 1000 ? `${fmt.int(Math.round(n))} km²`
          : `${n} km²`,
  people: n => {
    if (!n) return 'no figure';
    if (n >= 1e9) return `${(n / 1e9).toFixed(2)} billion`;
    if (n >= 1e6) return `${(n / 1e6).toFixed(n < 1e7 ? 2 : 1)} million`;
    if (n >= 1e3) return `${fmt.int(Math.round(n / 1e3))},000`;
    return fmt.int(n);
  },
  km: n => n < 10 ? `${n.toFixed(1)} km`
        : n < 1000 ? `${Math.round(n)} km`
        : `${fmt.int(Math.round(n))} km`,
  ordinal: n => {
    const s = ['th', 'st', 'nd', 'rd'], v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  },
  clock: ms => {
    const t = Math.max(0, Math.ceil(ms / 1000));
    return `${Math.floor(t / 60)}:${String(t % 60).padStart(2, '0')}`;
  },
};

/* ── toast ──────────────────────────────────────────────────────────────── */
let toastHost = null;
export function toast(message, { tone = 'info', ms = 2600 } = {}) {
  if (!toastHost) {
    toastHost = el('div', { class: 'toast-host', role: 'status', 'aria-live': 'polite' });
    document.body.appendChild(toastHost);
  }
  const t = el('div', { class: `toast toast-${tone}`, text: message });
  toastHost.appendChild(t);
  setTimeout(() => {
    t.classList.add('is-out');
    setTimeout(() => t.remove(), 320);
  }, ms);
  return t;
}

/* ── modal ──────────────────────────────────────────────────────────────── */
export function modal(title, body, { actions = [], onClose, wide = false } = {}) {
  const previouslyFocused = document.activeElement;
  const closeBtn = el('button', {
    class: 'modal-x', type: 'button', 'aria-label': 'Close', text: '×',
    onclick: () => close(),
  });
  const panel = el('div', {
    class: 'modal-panel' + (wide ? ' is-wide' : ''),
    role: 'dialog', 'aria-modal': 'true', 'aria-label': title,
  }, [
    el('div', { class: 'modal-head' }, [el('h2', { text: title }), closeBtn]),
    el('div', { class: 'modal-body' }, [].concat(body)),
    actions.length ? el('div', { class: 'modal-actions' }, actions) : null,
  ]);
  const back = el('div', { class: 'modal-back', onclick: e => { if (e.target === back) close(); } }, [panel]);

  function onKey(e) {
    if (e.key === 'Escape') { e.stopPropagation(); close(); }
    if (e.key === 'Tab') trapFocus(e, panel);
  }
  function close() {
    document.removeEventListener('keydown', onKey, true);
    back.classList.add('is-out');
    setTimeout(() => back.remove(), 200);
    if (previouslyFocused && previouslyFocused.focus) previouslyFocused.focus();
    if (onClose) onClose();
  }

  document.addEventListener('keydown', onKey, true);
  document.body.appendChild(back);
  requestAnimationFrame(() => {
    const first = panel.querySelector('input, button, select, textarea, [tabindex]');
    (first || closeBtn).focus();
  });
  return { close, panel };
}

function trapFocus(e, panel) {
  const items = [...panel.querySelectorAll('a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])')]
    .filter(n => n.offsetParent !== null);
  if (!items.length) return;
  const first = items[0], last = items[items.length - 1];
  if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
  else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
}

/* ── celebration ────────────────────────────────────────────────────────────
   Canvas confetti, sized to the burst and cleaned up after itself. Skipped
   entirely when the player has asked for reduced motion. */
export function confetti({ count = 90, origin = [0.5, 0.35], colours } = {}) {
  if (prefersReducedMotion()) return;
  const palette = colours || ['#ffd166', '#ef476f', '#06d6a0', '#4cc9f0', '#b388ff', '#ffffff'];
  const cv = el('canvas', { class: 'confetti-canvas', 'aria-hidden': 'true' });
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  const w = window.innerWidth, h = window.innerHeight;
  cv.width = w * dpr; cv.height = h * dpr;
  document.body.appendChild(cv);
  const ctx = cv.getContext('2d');
  ctx.scale(dpr, dpr);

  const bits = Array.from({ length: count }, () => {
    const a = Math.random() * Math.PI * 2;
    const sp = 5 + Math.random() * 9;
    return {
      x: origin[0] * w, y: origin[1] * h,
      vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 5,
      s: 4 + Math.random() * 7, r: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 0.4,
      c: palette[(Math.random() * palette.length) | 0],
      life: 0,
    };
  });

  let raf = 0;
  const start = performance.now();
  (function tick(now) {
    const t = now - start;
    ctx.clearRect(0, 0, w, h);
    for (const b of bits) {
      b.vy += 0.32; b.vx *= 0.995; b.x += b.vx; b.y += b.vy; b.r += b.vr;
      ctx.save();
      ctx.translate(b.x, b.y);
      ctx.rotate(b.r);
      ctx.globalAlpha = Math.max(0, 1 - t / 2200);
      ctx.fillStyle = b.c;
      ctx.fillRect(-b.s / 2, -b.s / 2, b.s, b.s * 0.6);
      ctx.restore();
    }
    if (t < 2200) raf = requestAnimationFrame(tick);
    else { cancelAnimationFrame(raf); cv.remove(); }
  })(start);
}

export function prefersReducedMotion() {
  return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/* ── deterministic randomness ───────────────────────────────────────────────
   Seeded so a daily challenge is the same puzzle for everyone, and so a failing
   round can be reproduced from its seed. */
export function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function hashSeed(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function shuffle(arr, rnd = Math.random) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = (rnd() * (i + 1)) | 0;
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function pick(arr, rnd = Math.random) {
  return arr[(rnd() * arr.length) | 0];
}

export function sample(arr, n, rnd = Math.random) {
  return shuffle(arr, rnd).slice(0, n);
}

/* ── text matching, for the typed-answer games ──────────────────────────────
   Forgiving about accents, punctuation, "the", and one or two typos, because
   a party game should not be a spelling test. */
export function normalise(s) {
  return (s || '')
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9 ]/g, ' ')
    .replace(/\b(the|of|and|republic|kingdom|state|states|democratic|people s|federal|united)\b/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function levenshtein(a, b) {
  if (a === b) return 0;
  if (!a.length || !b.length) return Math.max(a.length, b.length);
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    for (let j = 1; j <= b.length; j++) {
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
    prev = cur;
  }
  return prev[b.length];
}

/* True when `guess` is close enough to any of `accepted`. Tolerance grows with
   word length: "Chad" must be exact, "Liechtenstein" can take two slips. */
export function matchesAnswer(guess, accepted) {
  const g = normalise(guess);
  if (!g) return false;
  for (const raw of accepted) {
    const a = normalise(raw);
    if (!a) continue;
    if (g === a) return true;
    const budget = a.length <= 4 ? 0 : a.length <= 7 ? 1 : 2;
    if (budget && levenshtein(g, a) <= budget) return true;
  }
  return false;
}
