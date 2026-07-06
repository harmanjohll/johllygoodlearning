/* Two Roads — two cities shown; pick which one is the country's capital. */
import { flagImg, mcqButtons, el } from '../../engine/ui.js';

export const twoRoads = {
  id: 'capitals/two-roads',
  title: 'Two Roads',
  category: 'Capitals',
  emoji: '\u{1F6E3}',
  blurb: 'Two cities — pick the real capital.',

  generate(ctx) {
    const subject = ctx.pickSubject();
    const other = ctx.pick(subject, 1)[0];
    const decoy = other && other.capital && other.capital !== subject.capital ? other.capital : subject.capital;
    const options = ctx.shuffle([subject.capital, decoy]);
    return {
      subjectIso: subject.iso, subject,
      prompt: { type: 'two-roads', iso: subject.iso },
      answer: subject.capital, options,
    };
  },

  render(question, mount, ctx, submit) {
    const c = question.subject;
    mount.appendChild(el('div', { class: 'q-prompt' }, [
      el('div', { class: 'q-kicker', text: 'Which is the capital of' }),
      el('div', { class: 'q-subject' }, [flagImg(c, 'flag flag-sm'), el('span', { class: 'q-subject-name', text: c.name + '?' })]),
    ]));
    mount.appendChild(mcqButtons({
      columns: 2,
      correctValue: question.answer,
      onPick: (v) => submit(v, {}),
      options: question.options.map(city => ({ label: city, value: city })),
    }));
  },

  check(question, value) {
    const ok = String(value) === String(question.answer);
    return { correct: ok, closeness: ok ? 1 : 0 };
  },

  describe(question) { return { answer: question.answer, iso: question.subjectIso }; },
};
