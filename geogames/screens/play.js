/* ===========================================================================
   GeoGames - The play screen

   Drives one Session: draws the frame, runs the clock, hands each question to
   its game, collects the answer, shows the reveal, runs the steal, and passes
   the device on. Games handle none of this.
   =========================================================================== */

import { el, clear, fmt, confetti, prefersReducedMotion } from '../engine/ui.js';
import { sound } from '../engine/audio.js';
import { DIFFICULTY } from '../engine/session.js';

const STEAL_MS = 7000;

export function playScreen(root, { session, data, onFinish, onQuit }) {
  const { shapes, countries, byIso } = data;
  let cleanup = [];
  let timerRaf = 0;
  let handle = null;
  let keyHandler = null;
  let advanceHandler = null;

  const scoreValue = el('span', { class: 'hud-score-value', text: '0' });
  const progressValue = el('span', { class: 'hud-progress', text: '' });
  const playerChip = el('div', { class: 'hud-player' });
  const timerFill = el('div', { class: 'timer-fill' });
  const timerBar = el('div', { class: 'timer', 'aria-hidden': 'true' }, [timerFill]);
  const stage = el('div', { class: 'q-stage' });
  const footer = el('div', { class: 'q-footer', 'aria-live': 'polite' });

  const frame = el('div', { class: 'play' }, [
    el('header', { class: 'hud' }, [
      el('button', {
        class: 'hud-quit', type: 'button', 'aria-label': 'Leave this game',
        text: '←', onclick: () => confirmQuit(),
      }),
      el('div', { class: 'hud-mid' }, [
        el('div', { class: 'hud-title', text: session.game.title }),
        progressValue,
      ]),
      el('div', { class: 'hud-score' }, [el('span', { class: 'hud-score-label', text: 'score' }), scoreValue]),
    ]),
    playerChip,
    timerBar,
    stage,
    footer,
  ]);

  clear(root).appendChild(frame);
  document.addEventListener('keydown', onKey);

  startQuestion();

  /* ── question lifecycle ────────────────────────────────────────────────── */
  function startQuestion() {
    runCleanup();
    clear(stage);
    clear(footer);
    frame.classList.remove('is-revealed');
    timerBar.classList.remove('is-hidden');

    const q = session.question;
    const game = session.game;
    progressValue.textContent = `${session.index + 1} of ${session.total}`;
    scoreValue.textContent = fmt.int(session.players.reduce((s, p) => s + p.score, 0));
    frame.style.setProperty('--accent', (q.game || game).accent || '#4cc9f0');
    renderPlayerChip();

    const perQuestion = game.timeLimitFor ? game.timeLimitFor(q) : game.timeLimitMs;
    const limit = session.config.timer && perQuestion
      ? perQuestion * DIFFICULTY[session.config.difficulty].timeScale
      : null;

    let answered = false;
    const startedAt = performance.now();

    const api = {
      shapes, countries, byIso,
      config: session.config,
      player: session.player,
      index: session.index,
      total: session.total,
      onCleanup: fn => cleanup.push(fn),
      submit(result) {
        if (answered) return;
        answered = true;
        stopTimer();
        const timeLeftFraction = limit ? Math.max(0, 1 - (performance.now() - startedAt) / limit) : null;
        const entry = session.submit({ ...result, timeLeftFraction });
        onAnswered(entry, q, game);
      },
    };

    handle = game.render(stage, q, api) || {};
    keyHandler = handle.keys || null;

    if (limit) startTimer(limit, () => {
      if (answered) return;
      sound.timeUp();
      if (handle.timeout) handle.timeout();
      if (!answered) {
        answered = true;
        const entry = session.submit({ correct: false, accuracy: 0, timedOut: true });
        onAnswered(entry, q, game, true);
      }
    });
    else timerBar.classList.add('is-hidden');

    // Announce the question for screen readers without stealing focus from the
    // options, which are the thing a keyboard player wants next.
    const heading = stage.querySelector('h2');
    if (heading) heading.setAttribute('role', 'status');
  }

  function onAnswered(entry, q, game, timedOut = false) {
    frame.classList.add('is-revealed');
    scoreValue.textContent = fmt.int(session.players.reduce((s, p) => s + p.score, 0));

    // Distance-scored games play their own proximity tone on submit, so the
    // buzzer would step on it.
    const scoring = game.scoringFor ? game.scoringFor(q) : game.scoring;
    if (entry.correct) {
      sound.correct();
      if (entry.points >= 140 && !prefersReducedMotion()) {
        confetti({ count: 46, origin: [0.5, 0.4], colours: [(q.game || game).accent, '#ffd166', '#ffffff'] });
      }
    } else if (scoring !== 'accuracy') {
      sound.wrong();
    }

    // A steal is only offered on a live miss with options left to choose from.
    // Not after a timeout: the clock ran out in front of everybody, and the
    // grid has already shown the answer.
    const stealer = !entry.correct && !entry.stolen && !timedOut && q.opts && q.opts.length > 1
      ? session.stealer : null;
    if (stealer) {
      offerSteal(entry, q, game, stealer);
    } else {
      if (handle && handle.reveal) handle.reveal();
      showFeedback(entry, q, game, timedOut);
    }
  }

  /* ── steal ─────────────────────────────────────────────────────────────── */
  function offerSteal(entry, q, game, stealer) {
    sound.pass();
    const idOf = (handle && handle.idOf) || defaultIdOf;
    const correctId = (handle && handle.correctId)
      || q.correctId || (q.answer && q.answer.iso) || (q.odd && q.odd.iso) || q.winner;
    const items = (handle && handle.items) || q.opts;
    const draw = (handle && handle.render) || (o => el('span', { text: o.name || o.title || String(o) }));
    const remaining = items.filter(o => idOf(o) !== entry.pickedId);

    const bar = el('div', { class: 'steal-bar' });
    const panel = el('div', { class: 'steal' }, [
      el('div', { class: 'steal-head' }, [
        el('span', { class: 'steal-emoji', text: stealer.emoji }),
        el('span', {}, [
          el('strong', { text: `${stealer.name}, steal it` }),
          el('span', { class: 'steal-sub', text: 'Half points. Wrong costs you nothing.' }),
        ]),
      ]),
      bar,
      el('div', { class: 'steal-opts' }, remaining.map(o => el('button', {
        class: 'steal-opt', type: 'button',
        onclick: () => finish(idOf(o) === correctId),
      }, [draw(o)]))),
      el('button', { class: 'btn btn-ghost steal-pass', type: 'button', text: 'Pass', onclick: () => finish(false) }),
    ]);
    footer.appendChild(panel);

    let done = false;
    const start = performance.now();
    const fill = el('div', { class: 'steal-fill' });
    bar.appendChild(fill);
    (function tick(now) {
      if (done) return;
      const t = Math.min(1, (now - start) / STEAL_MS);
      fill.style.transform = `scaleX(${1 - t})`;
      if (t >= 1) finish(false);
      else timerRaf = requestAnimationFrame(tick);
    })(start);

    function finish(won) {
      if (done) return;
      done = true;
      cancelAnimationFrame(timerRaf);
      if (won) {
        session.submit({ correct: true }, { stolenBy: stealer });
        sound.correct();
      }
      if (handle && handle.reveal) handle.reveal();
      clear(footer);
      scoreValue.textContent = fmt.int(session.players.reduce((s, p) => s + p.score, 0));
      showFeedback({ ...entry, stolenBy: won ? stealer : null }, q, game, false);
    }
  }

  /* ── feedback and advance ──────────────────────────────────────────────── */
  function showFeedback(entry, q, game, timedOut) {
    const fact = game.factFor ? game.factFor(q) : '';
    const scoring = game.scoringFor ? game.scoringFor(q) : game.scoring;

    // Distance-scored games have no clean right or wrong: landing 300 km out
    // is not a failure, and telling the player it was while handing them 88
    // points reads as a bug. Grade the near miss instead.
    const partial = scoring === 'accuracy' && !entry.correct && !timedOut && entry.accuracy > 0.08;
    const tone = entry.correct ? 'good' : partial ? 'stolen' : entry.stolenBy ? 'stolen' : 'bad';
    const headline = entry.correct
      ? pickPraise(entry.points)
      : timedOut ? 'Out of time'
      : entry.stolenBy ? `${entry.stolenBy.name} stole it`
      : partial ? nearMiss(entry.accuracy)
      : 'Not this time';

    const next = el('button', {
      class: 'btn btn-primary btn-lg', type: 'button',
      text: session.index + 1 >= session.total ? 'See the results' : 'Next',
      onclick: () => advance(),
    });
    advanceHandler = () => advance();

    footer.appendChild(el('div', { class: `feedback is-${tone}` }, [
      el('div', { class: 'feedback-main' }, [
        el('span', { class: 'feedback-mark', 'aria-hidden': 'true', text: entry.correct ? '✓' : partial ? '◎' : '✗' }),
        el('div', {}, [
          el('div', { class: 'feedback-head', text: headline }),
          fact ? el('div', { class: 'feedback-fact', text: fact }) : null,
        ]),
        el('div', { class: 'feedback-points', text: entry.points > 0 ? `+${entry.points}` : '0' }),
      ]),
      next,
    ]));
    requestAnimationFrame(() => next.focus());
  }

  function advance() {
    advanceHandler = null;
    if (!session.next()) {
      teardown();
      onFinish(session);
      return;
    }
    if (session.players.length > 1) passDevice(session.player, startQuestion);
    else startQuestion();
  }

  /* ── pass and play ─────────────────────────────────────────────────────── */
  function passDevice(player, then) {
    runCleanup();
    clear(stage);
    clear(footer);
    timerBar.classList.add('is-hidden');
    sound.pass();
    const go = el('button', {
      class: 'btn btn-primary btn-lg', type: 'button', text: "I'm ready",
      onclick: () => { sound.click(); then(); },
    });
    stage.appendChild(el('div', {
      class: 'pass', style: { '--player': player.colour },
    }, [
      el('div', { class: 'pass-emoji', text: player.emoji }),
      el('h2', { text: `Pass to ${player.name}` }),
      session.mode === 'teams' ? el('p', { class: 'pass-team', text: player.team }) : null,
      el('p', { class: 'pass-score', text: `${fmt.int(player.score)} points so far` }),
      go,
    ]));
    advanceHandler = () => { sound.click(); then(); };
    requestAnimationFrame(() => go.focus());
  }

  function renderPlayerChip() {
    clear(playerChip);
    if (session.players.length < 2) { playerChip.classList.add('is-hidden'); return; }
    playerChip.classList.remove('is-hidden');
    const p = session.player;
    playerChip.style.setProperty('--player', p.colour);
    playerChip.appendChild(el('span', { class: 'hud-player-emoji', text: p.emoji }));
    playerChip.appendChild(el('span', { class: 'hud-player-name', text: p.name }));
    if (p.streak >= 2) {
      playerChip.appendChild(el('span', { class: 'hud-streak', text: `${p.streak} in a row` }));
    }
    if (session.mode === 'teams') {
      playerChip.appendChild(el('span', { class: 'hud-team', text: p.team }));
    }
  }

  /* ── clock ─────────────────────────────────────────────────────────────── */
  function startTimer(limit, onExpire) {
    const start = performance.now();
    let warned = false;
    timerFill.style.background = 'var(--accent)';
    (function tick(now) {
      const t = Math.min(1, (now - start) / limit);
      timerFill.style.transform = `scaleX(${1 - t})`;
      if (t > 0.75 && !warned) { warned = true; timerFill.style.background = '#ef476f'; }
      if (t >= 1) onExpire();
      else timerRaf = requestAnimationFrame(tick);
    })(start);
  }

  function stopTimer() {
    cancelAnimationFrame(timerRaf);
    timerBar.classList.add('is-spent');
  }

  /* ── keyboard ──────────────────────────────────────────────────────────── */
  function onKey(e) {
    if (e.target.matches('input, textarea')) return;
    if (e.key === 'Escape') { e.preventDefault(); confirmQuit(); return; }
    if ((e.key === 'Enter' || e.key === ' ') && advanceHandler) {
      // Let a focused button handle its own activation.
      if (document.activeElement && document.activeElement.tagName === 'BUTTON') return;
      e.preventDefault();
      advanceHandler();
      return;
    }
    if (keyHandler && !advanceHandler) keyHandler(e);
  }

  function confirmQuit() {
    if (session.index === 0 || window.confirm('Leave this game? The score will not be saved.')) {
      teardown();
      onQuit();
    }
  }

  function runCleanup() {
    for (const fn of cleanup) { try { fn(); } catch { /* a view already gone */ } }
    cleanup = [];
    cancelAnimationFrame(timerRaf);
  }

  function teardown() {
    runCleanup();
    document.removeEventListener('keydown', onKey);
  }

  return { teardown };
}

function defaultIdOf(o) { return o.iso || o.id; }

const PRAISE_HIGH = ['Nailed it', 'Instant', 'No hesitation', 'Textbook'];
const PRAISE_OK = ['Correct', 'Got it', 'Yes', 'That is the one'];
function pickPraise(points) {
  const list = points >= 140 ? PRAISE_HIGH : PRAISE_OK;
  return list[Math.floor(Math.random() * list.length)];
}

function nearMiss(accuracy) {
  if (accuracy > 0.7) return 'Very warm';
  if (accuracy > 0.45) return 'Close';
  if (accuracy > 0.2) return 'In the right region';
  return 'Wrong neighbourhood';
}
