/* Zoom Out — a flag starts extreme-close and zooms out over the timer.
   Answer early (while still zoomed) for the speed bonus. Choose or type by rank. */
import { flagImg, mcqButtons, typedAnswer, el } from '../../engine/ui.js';
import { matchCountryName } from '../_contract.js';

export const zoomOut = {
  id: 'flags/zoom-out',
  title: 'Zoom Out',
  category: 'Flags',
  emoji: '\u{1F50D}',
  blurb: 'Name the flag before it zooms out.',

  generate(ctx) {
    const subject = ctx.pickSubject();
    const input = ctx.rankCfg.input;
    const inputMode = input === 'typed' ? 'typed' : input === 'mixed' ? (ctx.rng() < 0.4 ? 'typed' : 'mcq') : 'mcq';
    let choices = null;
    if (inputMode === 'mcq') {
      const distractors = ctx.pick(subject, ctx.rankCfg.choices - 1);
      choices = ctx.shuffle([subject, ...distractors]).map(c => c.iso);
    }
    // focal point for the zoom, deterministic via rng
    const fx = Math.round(25 + ctx.rng() * 50), fy = Math.round(25 + ctx.rng() * 50);
    return { subjectIso: subject.iso, subject, prompt: { type: 'zoom', iso: subject.iso }, answer: subject.iso, answerName: subject.name, inputMode, choices, fx, fy };
  },

  render(question, mount, ctx, submit) {
    let usedHint = false;
    const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const img = flagImg(question.subject, 'zoom-flag');
    const view = el('div', { class: 'zoom-viewport' }, [img]);
    mount.appendChild(el('div', { class: 'q-prompt' }, [
      el('div', { class: 'q-kicker', text: 'Name the flag as it zooms out' }),
      view,
    ]));
    // kick off the zoom
    img.style.transformOrigin = `${question.fx}% ${question.fy}%`;
    if (reduce) {
      img.style.transform = 'scale(2)';
    } else {
      img.style.transform = 'scale(7)';
      img.style.transition = `transform ${ctx.rankCfg.timerMs}ms linear`;
      requestAnimationFrame(() => requestAnimationFrame(() => { img.style.transform = 'scale(1)'; }));
    }
    const freeze = () => { const cur = getComputedStyle(img).transform; img.style.transition = 'none'; img.style.transform = cur; };

    if (question.inputMode === 'mcq') {
      const options = question.choices.map(iso => ({ label: ctx.countries[iso].name, value: iso }));
      mount.appendChild(mcqButtons({ options, correctValue: question.answer, onPick: (v) => { freeze(); submit(v, { usedHint }); } }));
    } else {
      const typed = typedAnswer({ placeholder: 'Name the country', check: (v) => matchCountryName(v, question.subject), onSubmit: (v) => { freeze(); submit(v, { usedHint }); } });
      mount.appendChild(typed); typed.focusInput();
    }

    if (ctx.rankCfg.hints) {
      const cc = question.subject;
      const hintBtn = el('button', { class: 'hint-btn', type: 'button', text: 'Need a hint?', onclick: () => {
        usedHint = true;
        hintBtn.replaceWith(el('div', { class: 'hint-text', text: `It starts with “${cc.name[0]}”.` }));
      } });
      mount.appendChild(hintBtn);
    }
  },

  check(question, value) {
    if (question.inputMode === 'typed') return matchCountryName(value, question.subject);
    const ok = String(value) === String(question.answer);
    return { correct: ok, closeness: ok ? 1 : 0 };
  },

  describe(question) { return { answer: question.answerName, iso: question.subjectIso }; },
};
