# Exam Prep (`src/exam/`)

Practice papers for English, Maths and Bahasa Melayu at P1 end-of-year
level. Nas answers a whole paper, hands it in, and only then sees her
marks, each with the right answer and why.

Each subject has eight fixed **practice papers**, a **mixed paper**
that is new every time, and practice **one section** (for maths, one
topic) at a time.

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

## Practice papers

`examPaperPlan(subject)` works the eight papers out once, from a seed
that never changes, so Practice Paper 3 is the same on every device.

- **English and Malay** share each section's items out across the
  papers: no item in two papers, each paper spread across skills and
  levels, stretch items capped. Passages go one to a paper. A section
  needs at least eight papers' worth of items; the tests name any
  section that comes up short.
- **Maths** generates each paper from a seed of its own, and never
  repeats a question an earlier paper has.
- Each paper's **key** is the list of its questions. Best scores are
  filed under it, so if a change to the bank moves questions between
  papers, the old best for those papers stops counting.
- On a retake the questions stay put and the answer choices and tiles
  are reshuffled.

## Questions that give each other away

No paper may hand over one question's answer in another. Every item has
the text it shows and its giveaways (`examGiveaways`): for a word to
spell, the word itself; for a gap, the answer with its neighbouring
word; for a jumbled sentence, its first three words. Two items clash if
either's giveaways appear in the other's text. Practice papers are dealt
so that nothing clashes, and mixed papers skip a clashing question.

This catches things that are easy to write without noticing: a passage
whose title is the answer to its own first blank ("Ke Pasar" over
"pergi ___ pasar"), or "I have two sisters" on the same paper as
"I ___ two pet fish".

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
4. **A jumbled sentence must have one order, or list them all.** Three
   ways a second order sneaks in: a person noun later in the sentence
   joining the first word as a possessive ("Cikgu kami mengajar
   membaca"); ke + a place standing as the verb ("Kami ke zoo naik
   bas"); two nouns making a compound ("di pasar sayur"). The comment
   above the Susun items in `bank-ml.js` has the details.

After the Malay reviewer has been through the printed sheet, fix
anything they flag and re-run `bash test/run.sh`.

## Testing

`bash test/run.sh` builds the bundle and runs every suite. The exam
suite marks every answer type, builds every paper, checks that the
practice papers are full, separate and free of giveaways, checks every
bank item, checks tens of thousands of generated maths questions with
real arithmetic, and renders every screen. A suite counts as passed
only if it runs to the end and prints "0 failed".
