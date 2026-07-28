/* Guess the Flag — a flag is shown; name the country (choose or type by rank). */
import { flagImg, mcqButtons, typedAnswer, el } from '../../engine/ui.js';
import { matchCountryName } from '../_contract.js';

const REGION_NAMES = { europe: 'Europe', africa: 'Africa', asia: 'Asia', americas: 'the Americas', oceania: 'Oceania' };

export const guessTheFlag = {
  id: 'flags/guess-the-flag',
  title: 'Guess the Flag',
  category: 'Flags',
  emoji: '\u{1F3F3}',
  blurb: 'A flag appears — name the country.',

  generate(ctx) {
    const subject = ctx.pickSubject();
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
      prompt: { type: 'flag', iso: subject.iso },
      answer: subject.iso, answerName: subject.name,
      inputMode, choices,
    };
  },

  render(question, mount, ctx, submit) {
    let usedHint = false;
    mount.appendChild(el('div', { class: 'q-prompt' }, [
      el('div', { class: 'q-kicker', text: 'Which country flies this flag?' }),
      el('div', { class: 'flag-stage' }, [flagImg(question.subject, 'flag flag-lg')]),
    ]));

    if (question.inputMode === 'mcq') {
      const options = question.choices.map(iso => ({ label: ctx.countries[iso].name, value: iso }));
      mount.appendChild(mcqButtons({
        options, correctValue: question.answer,
        onPick: (v) => submit(v, { usedHint }),
      }));
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
    return { correct: String(value) === String(question.answer), closeness: String(value) === String(question.answer) ? 1 : 0 };
  },

  describe(question) { return { answer: question.answerName, iso: question.subjectIso }; },
};
