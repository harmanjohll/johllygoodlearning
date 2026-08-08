/* ===========================================================================
   GeoGames - Sound

   Synthesised with WebAudio, so there are no audio files to download and the
   whole thing works offline. Browsers refuse to start an AudioContext before a
   user gesture, so the context is created lazily on the first sound and any
   failure is swallowed: a party game must never break because audio did.
   =========================================================================== */

import { Store } from './store.js';

let ctx = null;
let master = null;

function audio() {
  if (ctx) return ctx;
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0.22;
    master.connect(ctx.destination);
  } catch { ctx = null; }
  return ctx;
}

function blip(freq, { type = 'sine', dur = 0.14, at = 0, gain = 1, slideTo = null } = {}) {
  const c = audio();
  if (!c) return;
  if (c.state === 'suspended') c.resume().catch(() => {});
  const t = c.currentTime + at;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(gain, t + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(g); g.connect(master);
  osc.start(t);
  osc.stop(t + dur + 0.02);
}

function noise({ dur = 0.25, gain = 0.4 } = {}) {
  const c = audio();
  if (!c) return;
  const frames = Math.floor(c.sampleRate * dur);
  const buf = c.createBuffer(1, frames, c.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < frames; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / frames) ** 2;
  const src = c.createBufferSource();
  const g = c.createGain();
  const filter = c.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = 1400;
  g.gain.value = gain;
  src.buffer = buf;
  src.connect(filter); filter.connect(g); g.connect(master);
  src.start();
}

const on = () => Store.settings().sound !== false;

export const sound = {
  enabled: on,
  toggle() {
    const next = !on();
    Store.setSetting('sound', next);
    if (next) sound.click();
    return next;
  },

  click() { if (on()) blip(520, { type: 'triangle', dur: 0.05, gain: 0.5 }); },
  hover() { if (on()) blip(760, { type: 'sine', dur: 0.03, gain: 0.16 }); },

  correct() {
    if (!on()) return;
    blip(523.25, { type: 'triangle', dur: 0.12, gain: 0.7 });
    blip(659.25, { type: 'triangle', dur: 0.12, gain: 0.7, at: 0.09 });
    blip(783.99, { type: 'triangle', dur: 0.22, gain: 0.8, at: 0.18 });
  },

  wrong() {
    if (!on()) return;
    blip(196, { type: 'sawtooth', dur: 0.22, gain: 0.45, slideTo: 130 });
  },

  /* Distance games: pitch carries how close the guess was, which turns the
     score into something you feel before you read it. */
  proximity(closeness) {
    if (!on()) return;
    const f = 260 + closeness * 620;
    blip(f, { type: 'sine', dur: 0.18, gain: 0.55 });
    if (closeness > 0.8) blip(f * 1.5, { type: 'sine', dur: 0.2, gain: 0.4, at: 0.12 });
  },

  tick() { if (on()) blip(1200, { type: 'square', dur: 0.02, gain: 0.1 }); },
  timeUp() {
    if (!on()) return;
    blip(330, { type: 'square', dur: 0.1, gain: 0.4 });
    blip(247, { type: 'square', dur: 0.28, gain: 0.4, at: 0.11 });
  },

  pass() {
    if (!on()) return;
    blip(392, { type: 'sine', dur: 0.1, gain: 0.4 });
    blip(587, { type: 'sine', dur: 0.16, gain: 0.4, at: 0.08 });
  },

  fanfare() {
    if (!on()) return;
    [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => {
      blip(f, { type: 'triangle', dur: 0.3, gain: 0.7, at: i * 0.11 });
    });
    noise({ dur: 0.5, gain: 0.25 });
  },

  whoosh() { if (on()) noise({ dur: 0.32, gain: 0.2 }); },
};
