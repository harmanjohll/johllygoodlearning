/* Country Round — knowing country names & where they sit.
   MCQ ranks: "Which country is in <continent>?" (pick the one that belongs).
   Typed rank: name the country from a capital + region clue. No map needed. */
import { mcqButtons, typedAnswer, el } from '../../engine/ui.js';
import { matchCountryName } from '../_contract.js';

const REGION_NAMES = { europe: 'Europe', africa: 'Africa', asia: 'Asia', americas: 'the Americas', oceania: 'Oceania' };

export const countryRound = {
  id: 'names/country-round',
  title: 'Country Round',
  category: 'Countries',
  emoji: '\u{1F30D}',
  blurb: 'Spot which country belongs — or name it from a clue.',

  generate(ctx) {
    const subject = ctx.pickSubject();
    if (ctx.rankCfg.input === 'typed') {
      return {
        variant: 'clue', subjectIso: subject.iso, subject,
        prompt: { type: 'clue', iso: subject.iso },
        answer: subject.name,
      };
    }
    // locate variant: subject is the correct answer; distractors from OTHER regions.
    const others = ctx.rankPool.filter(c => c.region !== subject.region && c.iso !== subject.iso);
    const distractors = ctx.shuffle(others).slice(0, ctx.rankCfg.choices - 1);
    const choices = ctx.shuffle([subject, ...distractors]).map(c => c.iso);
    return {
      variant: 'locate', subjectIso: subject.iso, subject,
      prompt: { type: 'locate', iso: subject.iso, region: subject.region },
      answer: subject.iso, choices,
    };
  },

  render(question, mount, ctx, submit) {
    let usedHint = false;
    if (question.variant === 'clue') {
      const c = question.subject;
      mount.appendChild(el('div', { class: 'q-prompt' }, [
        el('div', { class: 'q-kicker', text: 'Name the country' }),
        el('div', { class: 'clue-card' }, [
          el('div', { class: 'clue-row' }, [el('span', { class: 'clue-key', text: 'Capital' }), el('span', { class: 'clue-val', text: c.capital })]),
          el('div', { class: 'clue-row' }, [el('span', { class: 'clue-key', text: 'Region' }), el('span', { class: 'clue-val', text: c.subregion || REGION_NAMES[c.region] })]),
        ]),
      ]));
      const typed = typedAnswer({
        placeholder: 'Which country?',
        check: (v) => matchCountryName(v, c),
        onSubmit: (v) => submit(v, { usedHint }),
      });
      mount.appendChild(typed);
      typed.focusInput();
      return;
    }

    // locate
    mount.appendChild(el('div', { class: 'q-prompt' }, [
      el('div', { class: 'q-kicker', text: 'Which of these countries is in' }),
      el('div', { class: 'q-region', text: REGION_NAMES[question.prompt.region] + '?' }),
    ]));
    const options = question.choices.map(iso => ({ label: ctx.countries[iso].name, value: iso }));
    mount.appendChild(mcqButtons({
      options, correctValue: question.answer,
      onPick: (v) => submit(v, { usedHint }),
    }));

    if (ctx.rankCfg.hints) {
      const hintBtn = el('button', {
        class: 'hint-btn', type: 'button', text: 'Need a hint?',
        onclick: () => {
          usedHint = true;
          const right = ctx.countries[question.answer];
          hintBtn.replaceWith(el('div', { class: 'hint-text',
            text: `The answer starts with “${right.name[0]}”.` }));
        },
      });
      mount.appendChild(hintBtn);
    }
  },

  check(question, value) {
    if (question.variant === 'clue') return matchCountryName(value, question.subject);
    const ok = String(value) === String(question.answer);
    return { correct: ok, closeness: ok ? 1 : 0 };
  },

  describe(question) {
    return { answer: question.subject.name, iso: question.subjectIso };
  },
};
