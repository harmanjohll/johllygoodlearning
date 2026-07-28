/* Capital Match — given a country, name its capital (choose or type by rank). */
import { flagImg, mcqButtons, typedAnswer, el } from '../../engine/ui.js';
import { matchCapital } from '../_contract.js';

export const capitalMatch = {
  id: 'capitals/match',
  title: 'Capital Match',
  category: 'Capitals',
  emoji: '\u{1F3DB}',
  blurb: 'Name the capital city of a country.',

  generate(ctx) {
    const subject = ctx.pickSubject();
    const input = ctx.rankCfg.input;
    const inputMode = input === 'typed' ? 'typed'
      : input === 'mixed' ? (ctx.rng() < 0.4 ? 'typed' : 'mcq')
      : 'mcq';
    let choices = null;
    if (inputMode === 'mcq') {
      const distractors = ctx.pick(subject, ctx.rankCfg.choices - 1).map(c => c.capital);
      choices = ctx.shuffle([subject.capital, ...distractors]);
    }
    return {
      subjectIso: subject.iso, subject,
      prompt: { type: 'capital-of', iso: subject.iso },
      answer: subject.capital, inputMode, choices,
    };
  },

  render(question, mount, ctx, submit) {
    let usedHint = false;
    const c = question.subject;
    mount.appendChild(el('div', { class: 'q-prompt' }, [
      el('div', { class: 'q-kicker', text: 'What is the capital of' }),
      el('div', { class: 'q-subject' }, [
        flagImg(c, 'flag flag-sm'),
        el('span', { class: 'q-subject-name', text: c.name + '?' }),
      ]),
    ]));

    if (question.inputMode === 'mcq') {
      const options = question.choices.map(cap => ({ label: cap, value: cap }));
      mount.appendChild(mcqButtons({
        options, correctValue: question.answer,
        onPick: (v) => submit(v, { usedHint }),
      }));
    } else {
      const typed = typedAnswer({
        placeholder: 'Name the capital city',
        check: (v) => matchCapital(v, c),
        onSubmit: (v) => submit(v, { usedHint }),
      });
      mount.appendChild(typed);
      typed.focusInput();
    }

    if (ctx.rankCfg.hints) {
      const hintBtn = el('button', {
        class: 'hint-btn', type: 'button', text: 'Need a hint?',
        onclick: () => {
          usedHint = true;
          hintBtn.replaceWith(el('div', { class: 'hint-text',
            text: `It begins with “${c.capital[0]}” and has ${c.capital.replace(/\s/g, '').length} letters.` }));
        },
      });
      mount.appendChild(hintBtn);
    }
  },

  check(question, value) {
    if (question.inputMode === 'typed') return matchCapital(value, question.subject);
    const ok = String(value) === String(question.answer);
    return { correct: ok, closeness: ok ? 1 : 0 };
  },

  describe(question) { return { answer: question.answer, iso: question.subjectIso }; },
};
