/* ===========================================================================
   Family Atlas — Shared UI helpers
   Small, dependency-free DOM builders used by every sub-game so they look and
   behave as one system: flags, MCQ options, typed answers, a countdown bar,
   toasts and the passport-stamp flourish.
   =========================================================================== */

export function el(tag, props = {}, children = []) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(props)) {
    if (v == null) continue;
    if (k === 'class') node.className = v;
    else if (k === 'html') node.innerHTML = v;
    else if (k === 'text') node.textContent = v;
    else if (k === 'dataset') Object.assign(node.dataset, v);
    else if (k.startsWith('on') && typeof v === 'function') node.addEventListener(k.slice(2).toLowerCase(), v);
    else if (k === 'style' && typeof v === 'object') Object.assign(node.style, v);
    else node.setAttribute(k, v);
  }
  (Array.isArray(children) ? children : [children]).forEach(c => {
    if (c == null) return;
    node.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
  });
  return node;
}

export function clear(node) { while (node.firstChild) node.removeChild(node.firstChild); }

const FLAG_BASE = 'assets/flags/';
/** A flag image that falls back to the emoji flag if the SVG can't load. */
export function flagImg(country, cls = 'flag') {
  const img = el('img', {
    class: cls,
    src: FLAG_BASE + country.flag,
    alt: 'Flag of ' + country.name,
    loading: 'eager',
    draggable: 'false',
  });
  img.addEventListener('error', () => {
    const span = el('span', { class: cls + ' flag-fallback', text: country.flagEmoji || country.iso });
    img.replaceWith(span);
  });
  return img;
}

/**
 * Multiple-choice options. Owns its own reveal so every game shows correct/wrong
 * the same way. Calls onPick(value) after marking.
 */
export function mcqButtons({ options, correctValue, onPick, columns = 2 }) {
  const wrap = el('div', { class: 'mcq', style: { '--cols': String(columns) } });
  let locked = false;
  options.forEach(opt => {
    const btn = el('button', {
      class: 'mcq-btn', type: 'button',
      onclick: () => {
        if (locked) return;
        locked = true;
        const buttons = [...wrap.querySelectorAll('.mcq-btn')];
        buttons.forEach(b => { b.disabled = true; });
        buttons.forEach(b => { if (b.dataset.value === String(correctValue)) b.classList.add('is-correct'); });
        if (String(opt.value) !== String(correctValue)) btn.classList.add('is-wrong');
        onPick(opt.value);
      },
      dataset: { value: String(opt.value) },
    }, opt.node ? [opt.node] : [el('span', { class: 'mcq-label', text: opt.label })]);
    if (opt.sublabel) btn.appendChild(el('span', { class: 'mcq-sub', text: opt.sublabel }));
    wrap.appendChild(btn);
  });
  return wrap;
}

/** Two big choice buttons for true/false style games. */
export function binaryButtons({ onPick, correctValue, labels = ['Yes', 'No'] }) {
  return mcqButtons({
    columns: 2,
    correctValue,
    onPick,
    options: [
      { label: labels[0], value: true },
      { label: labels[1], value: false },
    ],
  });
}

/** A typed answer with reveal. onSubmit(value) fires after the reveal styling. */
export function typedAnswer({ placeholder = 'Type your answer', check, onSubmit, hint }) {
  let locked = false;
  const input = el('input', { class: 'typed-input', type: 'text', placeholder, autocomplete: 'off', autocapitalize: 'words', spellcheck: 'false' });
  const feedback = el('div', { class: 'typed-feedback' });
  const submit = () => {
    if (locked) return;
    const value = input.value.trim();
    if (!value) { input.focus(); return; }
    locked = true;
    input.disabled = true;
    const res = check ? check(value) : { correct: false };
    form.classList.add(res.correct ? 'is-correct' : 'is-wrong');
    onSubmit(value);
  };
  const form = el('form', {
    class: 'typed', onsubmit: (e) => { e.preventDefault(); submit(); },
  }, [
    input,
    el('button', { class: 'typed-go', type: 'submit', text: 'Go' }),
  ]);
  const wrap = el('div', { class: 'typed-wrap' }, [form, hint ? el('div', { class: 'typed-hint', text: hint }) : null, feedback]);
  wrap.focusInput = () => setTimeout(() => input.focus(), 30);
  return wrap;
}

/** Countdown bar. start() begins the drain; onExpire fires once at zero. */
export function timerBar(durationMs, onExpire) {
  const fill = el('div', { class: 'timer-fill' });
  const node = el('div', { class: 'timer', role: 'timer' }, [fill]);
  let raf = null, startTs = null, stopped = false;
  const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function frame(ts) {
    if (stopped) return;
    if (startTs == null) startTs = ts;
    const elapsed = ts - startTs;
    const left = Math.max(0, 1 - elapsed / durationMs);
    fill.style.transform = `scaleX(${left})`;
    if (left <= 0.28) node.classList.add('is-low');
    if (left <= 0) { stopped = true; onExpire && onExpire(); return; }
    raf = requestAnimationFrame(frame);
  }
  return {
    node,
    start() { if (reduce) { fill.style.transform = 'scaleX(1)'; return; } raf = requestAnimationFrame(frame); },
    stop() { stopped = true; if (raf) cancelAnimationFrame(raf); },
    ms() { return startTs == null ? 0 : Math.round(performance.now() - (performance.timeOrigin ? 0 : 0)); },
  };
}

// ── Flourishes ──────────────────────────────────────────────
let toastTimer = null;
export function toast(msg, kind = '') {
  let host = document.querySelector('.toast-host');
  if (!host) { host = el('div', { class: 'toast-host' }); document.body.appendChild(host); }
  const t = el('div', { class: 'toast ' + kind, text: msg });
  host.appendChild(t);
  requestAnimationFrame(() => t.classList.add('in'));
  setTimeout(() => { t.classList.remove('in'); setTimeout(() => t.remove(), 300); }, 2600);
}

/** The passport-stamp thunk: a stamp mark rotates in over the target node. */
export function stampBurst(targetNode, label) {
  const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const stamp = el('div', { class: 'stamp-burst', text: label || '✓' });
  targetNode.appendChild(stamp);
  if (!reduce) requestAnimationFrame(() => stamp.classList.add('in'));
  else stamp.classList.add('in');
  setTimeout(() => stamp.remove(), 1500);
}
