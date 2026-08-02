# PSLE Science — format and syllabus from 2026

Research compiled 29 July 2026 for the Singapore Primary Science Studio.
Alexey sits PSLE 2026, so **every item below applies to him**.

## How to read this file

Each finding carries a confidence label. Nothing here is invented; where the
evidence was thin or contradictory that is said plainly rather than smoothed over.

| Label | Meaning |
|---|---|
| **CONFIRMED** | Agreed by multiple independent sources, including quoted extracts from the official SEAB or MOE documents |
| **LIKELY** | Consistent across two or more secondary sources, no contradiction found |
| **UNVERIFIED** | Single source, or contradicted on follow-up. Do not build on it |
| **BLOCKED** | Could not be checked from the build environment |

### A limitation to state up front

`seab.gov.sg`, `moe.gov.sg` and `*.moe.edu.sg` are all **blocked by this
environment's network policy** (gateway answers 403 to CONNECT). The primary
documents could not be downloaded and read directly:

- `https://www.seab.gov.sg/files/PSLE Syllabus documents/2026 PSLE/0009_y26_sy.pdf`
- `https://www.moe.gov.sg/api/media/ba3562d3-5b31-4459-8693-45cde7b97273/Primary-Science-Syllabus-2023.pdf`

Everything below therefore rests on search-engine extracts that quote those
documents, plus secondary sources. **If Harman can download those two PDFs and
drop them into this directory, every CONFIRMED item should be re-checked against
them, and the UNVERIFIED items resolved.**

---

## 1. Examination format, from 2026 — CONFIRMED

One written paper, two booklets, single sitting.

| | Questions | Marks each | Total |
|---|---|---|---|
| **Booklet A** | 30 multiple-choice, 4 options | 2 | **60** |
| **Booklet B** | 10–11 structured / open-ended | **2, 3, 4 or 5** | **40** |
| | | | **100** |

**Duration: 1 hour 45 minutes.**

### What changed from the previous format

| | Until 2025 | From 2026 |
|---|---|---|
| Booklet A | 28 MCQ × 2 = 56 | **30 MCQ × 2 = 60** |
| Booklet B | ~44 | **40** |

Weight has shifted **towards** multiple choice. Booklet B is worth less in total
but its questions are individually larger: **40 marks over 10–11 questions is a
mean of about 3.8 marks per question**, so the paper is built around 3, 4 and
5 mark items rather than a long tail of 2 markers.

---

## 2. Content changes in the MOE Primary Science Syllabus (2023) — CONFIRMED

The 2023 syllabus is examined at PSLE **from 2026 onwards**. It reached P3 in
2023 and has moved up a year at a time since.

### Cells has been removed

**The standalone topic of Cells (under Systems) is gone.** Students are no
longer expected to know cell parts such as cytoplasm, nucleus or cell membrane.
The concept survives only incidentally within Reproduction.

This is the single most widely reported change and appears in every source
checked, official extract and tuition centre alike.

### Topics are now fixed to levels

The old lower-block (P3/P4) and upper-block (P5/P6) flexibility is gone. Every
school now teaches a fixed sequence, so a topic belongs to exactly one level.

The five themes are unchanged: **Diversity, Cycles, Systems, Interactions, Energy.**

### P5 and P6 topic lists — LIKELY

Assembled from secondary sources; not read off the official syllabus.

**P5** — plant transport system; human respiratory system; human circulatory
system (taught as two separate topics because of their depth); cycles in matter
and water; cycles in plants and animals (reproduction); electrical system.

**P6** — photosynthesis; energy and energy conversion; interaction of forces
(frictional, gravitational, elastic spring); interactions within the environment;
adaptations and man's impact on the environment; water cycle; cycles in plants.

---

## 3. Emphasis has moved towards inquiry and application — CONFIRMED

Consistently reported across official extracts and secondary sources:

- Greater weight on **scientific inquiry skills**: fair tests, identifying and
  controlling variables, interpreting data, forming hypotheses.
- Explanations framed as **cause, process, outcome** chains.
- Booklet B carries **more skills-based questions and fewer pure recall
  questions**.
- Parent and tutor commentary summarises it as *"more application, so more
  'explain' type questions."*

**This validates the Process Skills mode and the Answer Trainer's causal-chain
stage.** Both were built before this research and both target exactly what the
new syllabus emphasises.

---

## 4. Claims examined and NOT accepted

### Blood terminology — UNVERIFIED, do not act on

One tuition source claimed the syllabus replaced *oxygenated* and
*deoxygenated* with *oxygen-rich* and *carbon dioxide-rich*, and dropped the
naming of blood vessels in favour of broader concepts.

A targeted follow-up search **did not confirm this**. Other sources use both
sets of terms interchangeably, and no official statement of a terminology change
was found. Treated as unverified and **no content was changed on the strength of
it**.

This matters because the studio currently teaches *oxygenated / deoxygenated* as
the mark-scheme wording. If the change is real, that guidance is wrong. **Worth
checking against the official syllabus PDF when it can be obtained.**

---

## 5. What this means for the studio

### Confirmed defect: the mark spread in the open-ended bank

`studio/shared/content/openended/` holds 168 questions:

| Marks | In the bank | In the real paper |
|---|---|---|
| 2 | 138 (82%) | yes |
| 3 | 30 (17%) | yes |
| 4 | **none** | yes |
| 5 | **none** | yes |

Bank mean **2.18 marks** against a real mean of about **3.81**. The bank is
badly skewed towards short answers, which is the opposite of the direction the
new format moved. **A student drilled only on this bank would never practise the
4 and 5 mark items that now carry Booklet B.**

### Confirmed defect: cell-system is no longer examinable

`cell-system` carries 7 open-ended questions (`cel-01` to `cel-07`), 7 key ideas
and a 12-entry glossary, all built for a topic the syllabus has removed.

Note that not all of it is dead: the questions on **specialised cells and the
surface-area principle** (`cel-03` root hair, `cel-04` red blood cell, `cel-07`
specialisation) still describe ideas that appear inside other topics. The
questions on **plant versus animal cell structure** (`cel-02`) and on the
**cell-tissue-organ-system hierarchy** (`cel-01`) are the ones that test removed
content directly.

### Validated by the research

- Process Skills mode — the new syllabus raises exactly these skills.
- The Answer Trainer's causal-chain stage — cause, process, outcome is named
  explicitly in the syllabus emphasis.
- Command-word coverage — more "explain" is precisely what is reported.

---

## Sources

Official documents, quoted via search extracts but **not directly readable from
this environment**:

- SEAB, *PSLE Science, for examination from 2026* — `seab.gov.sg/files/PSLE Syllabus documents/2026 PSLE/0009_y26_sy.pdf`
- SEAB, *PSLE Foundation Science, for examination from 2026* — `0039_y26_sy.pdf`
- MOE, *Primary Science Syllabus 2023* — `moe.gov.sg/api/media/ba3562d3-5b31-4459-8693-45cde7b97273/Primary-Science-Syllabus-2023.pdf`

Secondary sources consulted:

- Geniebook — PSLE 2026 exam format; P6 Science syllabus
- BlueTree Education — 2026 PSLE Science syllabus changes; P5 Science topics
- Ancourage Academy — PSLE 2026 syllabus changes; open-ended question types
- The Learning Lab — new changes to the MOE Science syllabus
- The Nuggets Academy — 5 changes to the 2026 PSLE syllabus and exam format
- Overmugged — PSLE 2026 syllabus changes
- Future Academy (fa.edu.sg) — PSLE Science syllabus updates from 2026
- LevelUp Tuition, AGrader, Stepping Stones, TLS Tutorials, Science Shifu, eduKate
- KiasuParents forum — *2026 PSLE Discussions and Strategies (children born in 2014)*

*Compiled by Claude. Re-verify against the primary PDFs before treating any
CONFIRMED item as settled.*
