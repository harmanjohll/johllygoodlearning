# Exam Prep (`src/exam/`)

Practice papers for English, Maths and Bahasa Melayu at P1 end-of-year
level. Nas answers a whole paper, hands it in, and only then sees her
marks, each with the right answer and why.

The module is near-standalone. It owns one screen (`#screen-exam`), one
localStorage key (`nasworld_exam_v1`), its own banks and its own styles
(`styles/app-6.css`). It touches the rest of the app only to award stars
and play sounds, and always behind a `typeof` check.

## Files

| File | What it does |
|---|---|
| `exam-core.js` | Seeded paper assembly, marking, hand-in, history, stars. Also the item contract every bank must meet. |
| `exam-visuals.js` | Every picture, drawn as SVG or HTML from a small spec: clocks, rulers, shapes, figures, picture graphs, groups. |
| `bank-ma.js` | Maths: 49 question generators. Answers and working are computed, never typed in. |
| `bank-el.js` | English: hand-written items and comprehension passages. |
| `bank-ml.js` | Malay: hand-written items and passages, each with an English gloss. |
| `exam-ui.js` | The screens: hub, paper, hand-in, results, history, grown-ups' page. |
| `exam-sheet.js` | The printable answer keys and the Malay review sheet. |

## Adding or changing items

Each bank file's header says what the rules are, and `test/exam.test.js`
enforces them. The short version: every multiple-choice item has exactly
one option that is right **in context**, and every other option is
wrong, not merely less likely.

For Malay, three extra rules, each learnt the hard way while writing
these:

1. **No person nouns as wrong options.** Malay needs no "is", so
   "Kami *pembeli* ikan di pasar" is a true sentence ("we are fish
   buyers"). Use -an nouns or verb forms that cannot fit instead.
2. **No passive *di-* option when the subject could be on the receiving
   end.** "Kakak *dijemput* kawannya" is good Malay.
3. **Every word must be hand-reviewed.** `test/exam-malay-reviewed.json`
   lists every word in the bank. If you add a word that is not on it,
   the tests fail and name it: check its spelling and usage, then add it.

After the Malay reviewer has been through the printed sheet, fix
anything they flag and re-run `bash test/run.sh`.

## Testing

`bash test/run.sh` builds the bundle and runs every suite. The exam
suite marks every answer type, builds every paper, checks every bank
item, checks tens of thousands of generated maths questions with real
arithmetic, and renders every screen.
