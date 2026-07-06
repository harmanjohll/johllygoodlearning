/* Capital or Not — a fast true/false: is this city really the capital? */
import { flagImg, mcqButtons, el } from '../../engine/ui.js';

export const capitalOrNot = {
  id: 'capitals/capital-or-not',
  title: 'Capital or Not',
  category: 'Capitals',
  emoji: '\u{2705}',
  blurb: 'True or false: is this the real capital?',

  generate(ctx) {
    const subject = ctx.pickSubject();
    const showReal = ctx.rng() < 0.5;
    let city = subject.capital;
    if (!showReal) {
      // A plausible wrong city: a capital from a same-region country.
      const other = ctx.pick(subject, 1)[0];
      city = other ? other.capital : subject.capital;
      if (city === subject.capital) { city = subject.capital; } // fall back to true if collision
    }
    const isTrue = city === subject.capital;
    return {
      subjectIso: subject.iso, subject,
      prompt: { type: 'is-capital', iso: subject.iso, city },
      city, answer: isTrue,
    };
  },

  render(question, mount, ctx, submit) {
    const c = question.subject;
    mount.appendChild(el('div', { class: 'q-prompt' }, [
      el('div', { class: 'q-subject' }, [flagImg(c, 'flag flag-sm')]),
      el('div', { class: 'q-statement' }, [
        el('span', { class: 'q-city', text: question.city }),
        el('span', { class: 'q-is', text: ' is the capital of ' }),
        el('span', { class: 'q-country', text: c.name }),
      ]),
    ]));
    mount.appendChild(mcqButtons({
      columns: 2,
      correctValue: question.answer,
      onPick: (v) => submit(v, {}),
      options: [
        { label: 'True', value: true },
        { label: 'False', value: false },
      ],
    }));
  },

  check(question, value) {
    const v = value === true || value === 'true';
    const ok = v === question.answer;
    return { correct: ok, closeness: ok ? 1 : 0 };
  },

  describe(question) {
    return { answer: `${question.answer ? 'True' : 'False'} — ${question.subject.name}'s capital is ${question.subject.capital}`, iso: question.subjectIso };
  },
};
