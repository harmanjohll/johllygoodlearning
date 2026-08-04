# PSLE Science — the shapes of Booklet B open-ended questions

Research compiled 29 July 2026. Companion to `PSLE_Science_Format_Syllabus_2026.md`.
Implemented as `studio/shared/content/archetypes.json`, surfaced at `/studio/signposts/`
and drilled in `/studio/trainer/`.

## The claim this rests on

Booklet B questions recur in a **small number of shapes**. The topic changes every
paper; the shape does not. A question about evaporation, one about magnets and one
about food chains can share a shape, and the shape — not the topic — determines what
the mark scheme rewards.

This is not a novel observation. It is the consensus across every teaching source
consulted, stated most directly as: *once a student can name the type, the shape of
the answer becomes predictable, because each type rewards a specific structure.*

The corollary, also widely reported, is the important one:

> The most common cause of lost marks is not weak knowledge but answering a
> "compare" question as if it were an "explain", or a "design an experiment"
> question without naming variables.

That is a **decoding failure, not a knowledge failure** — which is exactly the
weakness this platform was asked to address.

## Confidence

Same labelling as the companion file.

- **CONFIRMED** — agreed across multiple independent teaching sources
- **LIKELY** — consistent, no contradiction found
- **JUDGEMENT** — my synthesis, not something a source states in these words
- **BLOCKED** — could not be checked from this environment

`seab.gov.sg`, `moe.gov.sg` and `moe.edu.sg` remain **BLOCKED** by the network policy,
so no official mark scheme or examiner report could be read directly. **Nothing here
rests on a real mark scheme.** It rests on teaching sources describing what mark
schemes do, plus my own construction. Treat the taxonomy as a well-grounded teaching
model, not as a documented specification.

---

## 1. Question types — CONFIRMED that types exist and matter

Sources converge on roughly six families: **explain, predict, compare, data,
experiment, draw**. That is a useful coarse split but too coarse to teach from — it
collapses several distinct answer structures into "explain", and it is organised by
command word rather than by what the answer must do.

The taxonomy shipped here uses **fifteen shapes**, split where the required structure
genuinely differs. **JUDGEMENT.** The splits that matter most:

| Split out of | Into | Because the structure differs |
|---|---|---|
| explain | **mechanism** vs **contrast** | A contrast question has an "even though" clause that must be resolved; a plain mechanism question does not |
| explain | **feature-function** | Must terminate at survival or purpose, which a general mechanism answer need not |
| data | **data-inference** vs **relationship** vs **trend** vs **identify-justify** | Each has a different fixed output: a conclusion with evidence, a fixed sentence form, a described curve with a reason, or a label with decisive evidence |
| experiment | **fair-test** vs **design** vs **aim** | Critiquing, building, and stating the purpose are three different tasks |
| suggest | **suggestion** vs **best-choice** | Best-choice requires rejecting the alternatives, which a plain suggestion does not |

## 2. Fixed sentence forms — CONFIRMED

Two shapes have answer forms that sources state almost verbatim, which makes them
free marks once known:

**Relationship.** *"As the [changed variable] increases, the [measured variable]
increases / decreases."* Sources give this as a template to be followed literally.

**Aim.** *"To find out how [changed variable] affects [measured variable]"*, or
*"To test the hypothesis that…"*. Both variables must be named.

Neither is currently drilled by a question in the bank — relationship has 3 items and
aim has none. Aim and fair-test are covered instead by Process Skills. **Flagged in
the UI** rather than hidden, so the gap is visible.

## 3. Frameworks in circulation — CONFIRMED they exist, JUDGEMENT on which to use

Three named frameworks appear repeatedly:

- **C-E-R** — Claim, Evidence, Reasoning. Already in the Structured Answer Builder and on the protect list.
- **PEEL** — Point, Evidence/Explanation, Link. Recommended for 2 to 3 mark questions.
- **TRACCER** — Topic, Recall, Aim, Compare, Claim, Evidence, Reason.

**I did not add a fourth framework.** TRACCER in particular is a seven-step
mnemonic that a student under time pressure will not execute, and its steps do not
map cleanly onto what any single question needs. The taxonomy replaces the
one-size-fits-all framework with a **per-shape skeleton**, which is the same idea
applied at the resolution where it is actually useful.

## 4. Failure modes — CONFIRMED

Reported consistently across sources, and each is now a universal heuristic in the app:

| Reported failure | Heuristic that addresses it |
|---|---|
| Vague language: "it changes", "it becomes more" | Name the process, do not describe it |
| Incomplete cause-and-effect chains; students give one end but not the other | State the middle, not just the ends |
| Answers that repeat the question instead of explaining it | Never hand the question back |
| Right concept, wrong term — still marked wrong | Name the process; the term is the mark |
| Everyday meanings of scientific words | Nothing is used up, nothing is given by nature |
| Missing comparisons | If two things are named, answer about both |
| Answering the wrong question type | The whole taxonomy |

The last one is the reason this file exists.

## 5. Signposts — JUDGEMENT

The 23 signpost phrases are my construction. Sources confirm that stems end in
recognisable phrases and that command words carry specific demands; the specific
mapping from phrase to required structure is mine, built from the pattern of the
questions themselves.

The highest-value entries, in my view:

- **"even though" / "although"** — an examiner has planted a contradiction on purpose. The clause after it is where the mark sits, and students routinely answer only the first half of the sentence.
- **"using the results" / "from the table"** — data is never decoration. An inference containing no figures drops a mark.
- **"in terms of"** — restricts the vocabulary. Anything outside the named idea, however true, is off target.
- **"give a reason for your answer"** — the identification is the cheap mark; the reason is the real one.

## 6. What was deliberately not done

**No claim about specific past-year papers.** I have no access to past PSLE papers,
and the request mentioned examining questions "across the years". I could not do that
directly. What I could do was work from teaching sources that describe recurring
patterns, plus the structure of the questions in our own bank. **Any statement here
about what "usually" appears is inference from those, not a count of real papers.**
If Harman has past papers, dropping them into `studio/knowledge-base/source/` would
let the taxonomy be checked against actual frequencies, and would let the shape
distribution in the bank be matched to the real one.

**No fourth framework**, for the reason in section 3.

---

## Sources

- Ancourage Academy — PSLE Science open-ended question types guide; primary science answering tips
- The Nuggets Academy — 7 PSLE Science answering techniques for open-ended questions
- BlueTree Education — 5 common types of primary science open-ended questions; how to get better at OEQs; 5 common mistakes in PSLE OEQs
- OwlSmart — how to score for explanatory questions; experiment-based questions
- Crucible Jr. — relationship, aim and explain questions
- Geniebook — mastering question types and answering techniques
- IllumiTutor — how to answer PSLE Science OEQs and why marks get lost
- MCQ.SG — MCQ and open-ended answering techniques
- Explico, Learning Point, MindFlex, Tutopiya, SkillsUp, AGrader, Study Room, Ace Scorers, EDU FIRST

*Compiled by Claude. The taxonomy is a teaching model built from secondary sources and
reasoning, not a transcription of any official mark scheme.*
