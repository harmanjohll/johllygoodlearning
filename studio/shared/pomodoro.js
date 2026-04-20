/* =========================================================
   /studio/shared/pomodoro.js
   Floating Pomodoro timer. Opt in on any page via:
     <body data-studio-pomodoro>
   or via a ?pomo=<minutes> query param (Compass uses this).
   Defaults: 25 minutes work, 5 minutes break, auto-advance.
   Records minutes to jgl.progress.effort.dailyMinutes and
   marks the session completed when the final tick fires.
   ========================================================= */

(function (global) {
  const CSS = `
  .studio-pomo {
    position: fixed; right: 18px; bottom: 18px; z-index: 9000;
    background: #0b1320f2; color: #e5e7eb;
    border: 1px solid #233047;
    border-radius: 14px;
    padding: .65rem .85rem .55rem;
    font: 500 .78rem/1.4 'Inter', system-ui, sans-serif;
    min-width: 190px;
    box-shadow: 0 10px 30px rgba(0,0,0,.5);
    user-select: none;
  }
  .studio-pomo.break { border-color: #34d399; }
  .studio-pomo .pm-head {
    display: flex; align-items: center; justify-content: space-between;
    font-size: .64rem; text-transform: uppercase; letter-spacing: .1em;
    color: #94a3b8; font-weight: 800; margin-bottom: .15rem;
  }
  .studio-pomo.break .pm-head .pm-label { color: #34d399; }
  .studio-pomo .pm-head button {
    background: none; border: none; color: #94a3b8; cursor: pointer;
    font-size: .9rem; padding: 0 .15rem; line-height: 1;
  }
  .studio-pomo .pm-head button:hover { color: #e5e7eb; }
  .studio-pomo .pm-time {
    font: 800 1.5rem/1 'Inter', ui-monospace, 'Menlo', monospace;
    letter-spacing: .01em; color: #f1f5f9;
    margin: .15rem 0 .25rem;
  }
  .studio-pomo .pm-actions { display: flex; gap: .3rem; }
  .studio-pomo .pm-actions button {
    flex: 1;
    background: #1a2233; color: #cbd5e1;
    border: 1px solid #2a3b55;
    border-radius: 6px;
    padding: .3rem .4rem;
    font-size: .7rem; font-weight: 700; cursor: pointer;
  }
  .studio-pomo .pm-actions button:hover { border-color: #38bdf8; color: #fff; }
  .studio-pomo.minimised { min-width: 0; padding: .4rem .6rem; }
  .studio-pomo.minimised .pm-time { font-size: .9rem; margin: 0; }
  .studio-pomo.minimised .pm-actions,
  .studio-pomo.minimised .pm-hint { display: none; }
  .studio-pomo .pm-hint {
    margin-top: .35rem; color: #64748b; font-size: .66rem;
  }
  `;
  const style = document.createElement('style');
  style.textContent = CSS;
  document.head.appendChild(style);

  const WORK_DEFAULT = 25;
  const BREAK_DEFAULT = 5;

  const state = {
    mode: 'work',           // 'work' | 'break'
    minutesTotal: WORK_DEFAULT,
    secondsLeft: WORK_DEFAULT * 60,
    running: false,
    minimised: false,
    intervalId: null,
    shell: null,
    tickedMinutes: 0,
    lastTickIso: null,
  };

  function resolveInitialMinutes() {
    const q = new URLSearchParams(location.search).get('pomo');
    const n = q ? parseInt(q, 10) : NaN;
    if (!isNaN(n) && n > 0 && n <= 120) return n;
    return WORK_DEFAULT;
  }

  function format(sec) {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${String(s).padStart(2,'0')}`;
  }

  function render() {
    const s = state;
    const host = s.shell;
    if (!host) return;
    host.className = 'studio-pomo' + (s.mode === 'break' ? ' break' : '') + (s.minimised ? ' minimised' : '');
    host.innerHTML = `
      <div class="pm-head">
        <span class="pm-label">${s.mode === 'break' ? 'Break' : 'Focus'}</span>
        <div style="display:flex;gap:.1rem">
          <button data-act="toggle-min" title="Minimise / expand">${s.minimised ? '▢' : '–'}</button>
          <button data-act="close" title="Close the timer">×</button>
        </div>
      </div>
      <div class="pm-time">${format(s.secondsLeft)}</div>
      <div class="pm-actions">
        <button data-act="toggle">${s.running ? 'Pause' : 'Start'}</button>
        <button data-act="reset">Reset</button>
        <button data-act="skip">Skip</button>
      </div>
      <div class="pm-hint">${s.mode === 'break' ? 'Stand up. Look at something 20 feet away.' : `${s.minutesTotal}-min focus block`}</div>
    `;
    host.querySelectorAll('button[data-act]').forEach(btn => {
      btn.addEventListener('click', () => handle(btn.dataset.act));
    });
  }

  function handle(act) {
    if (act === 'toggle') state.running ? pause() : start();
    else if (act === 'reset') reset();
    else if (act === 'skip') finishBlock();
    else if (act === 'toggle-min') { state.minimised = !state.minimised; render(); }
    else if (act === 'close') destroy();
  }

  function start() {
    if (state.running) return;
    state.running = true;
    state.lastTickIso = new Date().toISOString();
    state.intervalId = setInterval(tick, 1000);
    render();
  }
  function pause() {
    state.running = false;
    if (state.intervalId) clearInterval(state.intervalId);
    state.intervalId = null;
    render();
  }
  function reset() {
    pause();
    state.secondsLeft = state.minutesTotal * 60;
    render();
  }
  function tick() {
    state.secondsLeft -= 1;
    // Track effort per minute tick (work mode only)
    if (state.mode === 'work' && state.secondsLeft % 60 === 0) {
      recordMinute();
    }
    if (state.secondsLeft <= 0) {
      finishBlock();
    } else {
      const timeEl = state.shell && state.shell.querySelector('.pm-time');
      if (timeEl) timeEl.textContent = format(state.secondsLeft);
    }
  }
  function finishBlock() {
    pause();
    try { playTone(); } catch {}
    if (state.mode === 'work') {
      markSessionCompleted();
      state.mode = 'break';
      state.minutesTotal = BREAK_DEFAULT;
      state.secondsLeft = BREAK_DEFAULT * 60;
    } else {
      state.mode = 'work';
      state.minutesTotal = resolveInitialMinutes();
      state.secondsLeft = state.minutesTotal * 60;
    }
    render();
    // Auto-start the next block
    start();
  }
  function playTone() {
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      const ctx = new AC();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.value = state.mode === 'break' ? 660 : 440;
      gain.gain.setValueAtTime(0.0001, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.6);
      osc.connect(gain).connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.65);
    } catch {}
  }

  function recordMinute() {
    if (!window.JglStorage) return;
    const today = new Date().toISOString().slice(0,10);
    window.JglStorage.update(p => {
      p.effort = p.effort || { dailyMinutes: {} };
      p.effort.dailyMinutes[today] = (p.effort.dailyMinutes[today] || 0) + 1;
      return p;
    });
    state.tickedMinutes += 1;
  }

  function markSessionCompleted() {
    if (!window.JglStorage) return;
    window.JglStorage.update(p => {
      p.sessions = p.sessions || [];
      const active = p.sessions[p.sessions.length - 1];
      if (active && !active.endIso) {
        active.endIso = new Date().toISOString();
        active.completed = true;
        active.minutesPlanned = state.minutesTotal;
      }
      return p;
    });
  }

  function destroy() {
    pause();
    if (state.shell && state.shell.parentNode) state.shell.parentNode.removeChild(state.shell);
    state.shell = null;
  }

  function mount(initialMinutes) {
    if (state.shell) return;
    const host = document.createElement('div');
    host.className = 'studio-pomo';
    host.setAttribute('role', 'timer');
    host.setAttribute('aria-label', 'Pomodoro timer');
    document.body.appendChild(host);
    state.shell = host;
    state.mode = 'work';
    state.minutesTotal = initialMinutes || resolveInitialMinutes();
    state.secondsLeft = state.minutesTotal * 60;
    render();
  }

  // Public API
  global.JglPomodoro = {
    mount, destroy, start, pause, reset,
    isActive: () => !!state.shell,
  };

  // Auto-mount if the body opts in or the URL has ?pomo=
  function autoMount() {
    const q = new URLSearchParams(location.search).get('pomo');
    if (document.body && (document.body.hasAttribute('data-studio-pomodoro') || q)) {
      mount();
      if (q) start();
    }
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', autoMount, { once: true });
  } else {
    autoMount();
  }
})(typeof window !== 'undefined' ? window : globalThis);
