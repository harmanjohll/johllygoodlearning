/* ===========================================================================
   Family Atlas — Sound & haptics
   Tiny WebAudio synth (no asset files) for UI blips + navigator.vibrate.
   Muted state persists in atlas_meta. Created lazily on first user gesture so
   browsers don't block the AudioContext.
   =========================================================================== */

import { Store } from './storage.js';

let _ctx = null;
function ctx() {
  if (_ctx) return _ctx;
  try { _ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch { _ctx = null; }
  return _ctx;
}

function enabled() { return Store.meta().muted !== true; }

function tone(freq, dur = 0.09, type = 'sine', gain = 0.05, when = 0) {
  if (!enabled()) return;
  const ac = ctx(); if (!ac) return;
  if (ac.state === 'suspended') ac.resume().catch(() => {});
  const t0 = ac.currentTime + when;
  const osc = ac.createOscillator();
  const g = ac.createGain();
  osc.type = type; osc.frequency.setValueAtTime(freq, t0);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(gain, t0 + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(g); g.connect(ac.destination);
  osc.start(t0); osc.stop(t0 + dur + 0.02);
}

function vibrate(ms) { try { if (enabled() && navigator.vibrate) navigator.vibrate(ms); } catch {} }

export const sound = {
  enabled,
  toggle() { const on = !enabled(); Store.saveMeta({ muted: !on }); return on; },
  click() { tone(420, 0.05, 'triangle', 0.04); },
  select() { tone(560, 0.06, 'triangle', 0.04); },
  correct() { tone(660, 0.09, 'sine', 0.05); tone(990, 0.12, 'sine', 0.05, 0.08); vibrate(20); },
  wrong() { tone(200, 0.16, 'sawtooth', 0.04); vibrate([12, 40, 12]); },
  stamp() { tone(320, 0.07, 'square', 0.04); tone(120, 0.14, 'sine', 0.05, 0.02); vibrate(30); },
  win() { [523, 659, 784, 1046].forEach((f, i) => tone(f, 0.14, 'triangle', 0.05, i * 0.1)); vibrate([20, 30, 20]); },
  tick() { tone(880, 0.03, 'sine', 0.02); },
};
