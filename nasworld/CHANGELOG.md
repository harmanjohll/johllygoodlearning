# Nasworld changelog

The version a person sees lives in `src/core/version.js` and is rendered
into the home-screen banner at runtime. Bump it and add an entry here in
the same commit as the work it describes; `build.sh` warns when `src/`
has moved a long way ahead of the last bump.

Note that `state.version` in `src/core/state.js` is a different number.
It is the localStorage schema version and only changes when saved
progress needs migrating, so the two move independently.

---

## v3.1 — Exam Prep (2026-10-19)

### Added
- **Exam Prep**, a new home tile and a near-standalone module
  (`src/exam/`, `styles/app-6.css`). Full practice papers, or one
  section at a time, for three subjects at P1 end-of-year level:
  - **English**: Grammar, Vocabulary, Punctuation, Comprehension.
    29 questions a paper, from 203 items and 6 passages.
  - **Maths**: numbers to 100, adding and subtracting within 100,
    multiplication, division, time, length, shapes, picture graphs.
    Generated from 49 question types in three sections (multiple
    choice, short answer, word problems), 25 questions a paper.
  - **Bahasa Melayu**: Kosa Kata, Imbuhan, Prosedur Kloz, Susun
    Perkataan, Kefahaman Objektif. 29 questions a paper, from 129 items
    and 12 passages.
- A paper is answered whole, with answers changeable and questions
  flaggable, and marked only on hand-in. Every question then shows the
  right answer and why; maths shows the working, built from the
  question's own numbers; Malay shows the English meaning.
- Redo just the mistakes; practise the weakest section; past papers.
- For grown-ups, behind a sum: printable answer keys, worked maths
  examples, and a **Malay review sheet** with a tick/flag column for a
  reviewer and the full list of Malay words for one spelling pass.

### Fixed
- In Dunia Melayu, the family-sentence question gave a correct answer
  starting with a small letter ("ibu saya baik."). Weather glossed
  *angin* (wind) as windy; it is now *berangin*. The sentence flashcards
  printed raw placeholders ("Saya ada {number} {food}.").

### Notes on scope
- Follows the MOE 2021 Primary Mathematics syllabus for P1. Division is
  asked only in words and pictures, because the ÷ sign is a P2 item.
  Picture graphs use one picture for one thing (scales are P2).
- Money is in the P1 syllabus but was not on the list asked for, so it
  is not included.
- Time is written 7.25 am, with a dot. Change `EXAM_TIME_SEP` in
  `src/exam/exam-core.js` if her school writes 7:25; typed answers
  accept either.

## v3.0 — Play, Puzzles & Sharper Maths (2026-08-10)

The first bump since April. Everything below had already shipped under a
banner still reading v2.1, which is what prompted the versioning fix.

### Added
- **Play** — a new section with eleven games in three groups.
  Puzzles: Jigsaw, Number Pyramid, Picture Crossword, Word Search,
  Memory Pairs, What Comes Next, Mini Sudoku. Brain games: Memory Grid,
  Colour Muddle, Dot Trail, Speed Match. The brain games are built on the
  published cognitive paradigms (Corsi 1972, Stroop 1935, Trail Making
  1944, 1-back) and are framed as fun and focus practice, not as making
  anyone cleverer — the evidence for far transfer is weak and the hub
  says so plainly to grown-ups.
- **Practice** — pick exactly what to drill: a single times table, a
  number band, a word-problem structure. Sub-skill mastery tracking makes
  "your weakest table is 8" an answerable question.
- **Maths tricks** — 17 across three tiers, each with worked examples and
  a concrete visual model rather than a bare rule.
- **Trachtenberg system** — all 11 multiplication rules, verified against
  ordinary arithmetic over 220,000 multiplications.
- **Word problems** in the Singapore structures, emitting bar-model data.
- Quiz pacing toggle in Settings.

### Changed
- **No more pop-up after every question.** Correct answers show a slim
  inline bar and advance after 0.7s; wrong answers hold for 2.6s and can
  be tapped through. The old modal is still available via Settings.
- **Adaptive difficulty is real.** 21 of the 33 maths generators never
  read the level they were handed, so the adaptive engine was a silent
  no-op for them. Each now has its own ladder climbing what is actually
  hard for that skill: regrouping, denominator size, nearness to a right
  angle, whether decimal tenths carry a whole, whether a price is round.
- Version banner now renders from a single constant instead of being
  hand-typed into `index.html`.

### Fixed
- **Six Science topics showed "undefined" instead of the question.**
  Senses, Plants, Animals, Seasons, Sound and Light rendered a thinking
  face and four answer buttons with nothing to answer. Every question,
  every time. The bank helper emitted `prompt`; the renderer reads `text`.
- **"Average" questions rounded the answer key**, so a child computing
  7.2 correctly was marked wrong — 80% of them.
- **Picture graphs tied their tallest bar** in 35% of draws, so "which
  has the most?" had two right answers and accepted one. Bar graphs, the
  same, in 13.5%.
- **Fraction questions dropped the correct answer** from the four choices
  in 5.2% of cases, making them unanswerable.
- Symmetry questions drew a white square whatever shape they named.
- `grantSimReward` corrupted skill state and crashed the next answer.
- Mastery could be gamed to 50% by opening two tabs.
- Time-setting questions showed the answer in the question.
- Two unsolvable crosswords.
- Stasha: full body visible, two-axis rotation, wardrobe items anchored
  to body landmarks rather than canvas coordinates.

### Infrastructure
- Test suite grew from 2 files to 6, 154 assertions. New:
  `difficulty.test.js` (ladders and answer keys) and
  `answerable.test.js` (a whole-app sweep of 21,600 questions per run
  across all five subjects). Both mutation-tested.
- `build.sh` drift guard: fails loudly when `index.html` is missing a
  script the bundle includes. That divergence had already happened once
  silently, leaving 15 modules dead on the live site.
- Version staleness guard in `build.sh`.

---

## v2.1 — Garden Island + Sims + Surprises (2026-04-24)

Garden Island, interactive STEM simulations, and surprise events.
Recorded retrospectively; there was no changelog at the time.
