/* Name the Shape — a country's silhouette is shown; name it (choose or type). */
import { mcqButtons, typedAnswer, el } from '../../engine/ui.js';
import { matchCountryName } from '../_contract.js';
import { cloneCountry, hasCountry } from '../../engine/worldmap.js';

const REGION_NAMES = { europe: 'Europe', africa: 'Africa', asia: 'Asia', americas: 'the Americas', oceania: 'Oceania' };

function pickMapped(ctx) {
  const onMap = ctx.pool.filter(c => hasCountry(c.iso));
  if (onMap.length) return onMap[Math.floor(ctx.rng() * onMap.length)];
  return ctx.pickSubject();
}

export const nameTheShape = {
  id: 'names/name-the-shape',
  title: 'Name the Shape',
  category: 'Countries',
  emoji: '\u{1F5FA}',
  blurb: 'Name a country from its outline.',
  needsMap: true,

  generate(ctx) {
    const subject = pickMapped(ctx);
    const input = ctx.rankCfg.input;
    const inputMode = input === 'typed' ? 'typed'
      : input === 'mixed' ? (ctx.rng() < 0.4 ? 'typed' : 'mcq')
      : 'mcq';
    let choices = null;
    if (inputMode === 'mcq') {
      const distractors = ctx.pick(subject, ctx.rankCfg.choices - 1);
      choices = ctx.shuffle([subject, ...distractors]).map(c => c.iso);
    }
    return {
      subjectIso: subject.iso, subject,
      prompt: { type: 'shape', iso: subject.iso },
      answer: subject.iso, answerName: subject.name,
      inputMode, choices,
    };
  },

  render(question, mount, ctx, submit) {
    let usedHint = false;
    const shape = cloneCountry(question.subject.iso);
    mount.appendChild(el('div', { class: 'q-prompt' }, [
      el('div', { class: 'q-kicker', text: 'Which country has this outline?' }),
      el('div', { class: 'shape-stage' }, [shape || el('div', { class: 'muted', text: '(map unavailable)' })]),
    ]));

    if (question.inputMode === 'mcq') {
      const options = question.choices.map(iso => ({ label: ctx.countries[iso].name, value: iso }));
      mount.appendChild(mcqButtons({ options, correctValue: question.answer, onPick: (v) => submit(v, { usedHint }) }));
    } else {
      const typed = typedAnswer({
        placeholder: 'Name the country',
        check: (v) => matchCountryName(v, question.subject),
        onSubmit: (v) => submit(v, { usedHint }),
      });
      mount.appendChild(typed);
      typed.focusInput();
    }

    if (ctx.rankCfg.hints) {
      const c = question.subject;
      const hintBtn = el('button', {
        class: 'hint-btn', type: 'button', text: 'Need a hint?',
        onclick: () => {
          usedHint = true;
          hintBtn.replaceWith(el('div', { class: 'hint-text',
            text: `It is in ${REGION_NAMES[c.region] || c.region}, and starts with “${c.name[0]}”.` }));
        },
      });
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
