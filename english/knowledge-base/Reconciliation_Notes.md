# Reconciliation Notes — English Knowledge Base

> **Authored:** 2026-05-13.
> **Branch:** `claude/analyze-knowledge-bases-ZIrRn`.
> **Status:** Working audit trail of every edit applied to `english/knowledge-base/` during the reconcile-and-supplement phase. Read once in this order to understand what changed and why.

---

## §1 — Format verification

### §1.1 What the in-folder files said before reconciliation

Two competing format claims sat side-by-side in the same folder:

| File | Paper 1 | Paper 2 | Paper 3 | Paper 4 | Total | S&T present? |
|---|---|---|---|---|---|---|
| `SEAB_Official_EL_Format_Syllabus_2026.md` | 70m (Sit 30 + Cont 40) | 95m (28+67) | 20m | 30m (RA 10 + SBC 20) | **215** | **No** |
| `Master_PSLE_EL_KB.md` | 50m (Sit 14 + Cont 36) | 90m | 20m | 40m | **200** | (implicit yes; mentions "synthesis" elsewhere) |
| `Master_PSLE_EL_KB2.md` | 50m (Sit 14 + Cont 36) | 90m (implicit) | 20m (implicit) | 40m | **200** | (silent) |
| `PSLE_EL_Knowledge_Schema.md` | 70m | 95m | 20m | 30m | **215** | (silent) |
| `Composition_Writing_Guide.md` | 70m (Sit 30 + Cont 40) | — | — | — | — | — |
| `Comprehension_Strategy_Guide.md` | — | "Booklet B = 67m" (two passages, 15+15) | — | — | — | (silent) |
| `Oral_Communication_Guide.md` | — | — | — | 30m (RA 10 + SBC 20) | — | — |

### §1.2 What the open-web evidence says

Twenty-five independent Singapore publications (Geniebook, Academia.com.sg, Writing Samurai, AGrader, The Write Connection, KeyNote Learning, illum.e, doappliedlearning, SGSchoolKaki, Creative Campus, Writers At Work, Your English Genie, SGPrimarySchool, Lil But Mighty English, EDU FIRST, Dr Zam's Academy, Sowing Seedz, PSLE Journey, Thinking Factory, Smile Tutor, plus a Cedar Primary MOE-hosted parent-engagement PDF) converge on a **200-mark structure** that is the **2025+ revision** of the SEAB EL Syllabus 0001. Full citations are in `source/syllabus/MOE_SEAB_EL_2025_Format_Excerpts.md` §"Source web references".

The verified 2025+ structure:

| Paper | Marks | Components |
|---|---|---|
| 1 — Writing | **50** | Situational 14m (6 content points incl. 1 critical-thinking) + Continuous 36m (narrative, ≥150w) |
| 2 — Language Use & Comprehension | **90** | **Booklet A 25m**: Grammar MCQ 10 + Vocab MCQ 5 + Vocab Cloze 5 + Visual Text 5. **Booklet B 65m**: Grammar Cloze 10 + Editing 10 + Comp Cloze 15 + **Synthesis & Transformation 10** + Comp OE 20 (one passage, narrative *or* non-narrative) |
| 3 — Listening | **20** | 20 MCQ × 1m |
| 4 — Oral | **40** | Reading Aloud 15m (new PACT preamble framework) + SBC 25m (real-life photo stimuli, no longer thematically linked to RA) |
| **Total** | **200** | |

### §1.3 Resolution — direction inverted from the plan default

The plan's default ("SEAB_Official as the spine, edit Master_KB to match") inverts based on this evidence.

**Truth ordering (after reconciliation):**

1. **Master_PSLE_EL_KB.md** and **Master_PSLE_EL_KB2.md** — RIGHT about the format. Their "2025 Edition" tag, "Paper 4 carries 40 marks", and "Continuous Writing 36 marks" claims are all confirmed by 25+ independent sources. These files become the **format spine**.
2. **`source/syllabus/MOE_SEAB_EL_2025_Format_Excerpts.md`** — the new authority-anchoring document for everything downstream.
3. **`SEAB_Official_EL_Format_Syllabus_2026.md`** — WRONG. Was created internally with pre-2025 numbers and an inaccurate "2024 onwards" citation. **Rewritten in this branch** to reflect the actual 2025+ syllabus, citing the source/syllabus/ excerpts file.
4. **`PSLE_EL_Knowledge_Schema.md`** — WRONG (same 215-mark structure). **Rewritten** to match.
5. **`Composition_Writing_Guide.md`** — WRONG on Paper 1 marks. **Edited** to the 50-mark structure.
6. **`Comprehension_Strategy_Guide.md`** — WRONG on Paper 2 components (Booklet B 67m, two passages, Editing 12m, Visual Text 10m in Booklet B). **Restructured** to match (one passage 20m, Editing 10m, Visual Text 5m in Booklet A, Synthesis & Transformation 10m added).
7. **`Oral_Communication_Guide.md`** — WRONG on Paper 4 marks. **Edited** to 40m structure with PACT preamble framework.
8. **`Listening_Comprehension_Guide.md`** — internal numbers correct (Paper 3 = 20m, unchanged in 2025 reform). Minor cross-reference touch-up only.
9. **`PSLE_EL_Revision_Strategy.md`** — fix Paper 1 duration claims (110 min → 70 min) where they appear.
10. **`Grammar_Complete_Reference.md`**, **`Vocabulary_Idioms_Bank.md`** — no format claims; **untouched**.

The plan's principle ("align with the actual SEAB 2025+ syllabus") is preserved; only the *direction* of correction inverts.

### §1.4 Open follow-up

- [ ] Download the canonical SEAB PDF (`0001_y25_sy.pdf`) into `source/syllabus/` when network permits (the SEAB site returned HTTP 403 from this environment).
- [ ] Confirm Editing 10m split (grammar vs spelling) against the SEAB PDF.
- [ ] Confirm the SEAB band cut-points for the Situational and Continuous Writing rubrics.

---

## §2 — File-by-file edits

### §2.1 `SEAB_Official_EL_Format_Syllabus_2026.md` — rewritten

**Before (key claims):**
- Paper 1 = 70m (Sit 30 + Cont 40); total 215m.
- Cites *"SEAB EL (Primary) Syllabus 2024 onwards (applies to PSLE 2026)"*.
- No S&T listed.
- Comprehension is two 15m passages (Narrative + Non-Narrative).
- Visual Text 10m in Booklet B.

**After:**
- Paper 1 = 50m (Sit 14 + Cont 36); total 200m.
- Cites SEAB syllabus 0001 (2025 implementation onwards), with URL pointing at `https://www.seab.gov.sg/files/PSLE%20Syllabus%20documents/2025%20PSLE/0001_y25_sy.pdf`.
- Synthesis & Transformation 10m listed in Booklet B.
- Comprehension is one passage (20m, narrative *or* non-narrative).
- Visual Text 5m in Booklet A.

**Status header added** stating the file was corrected on 2026-05-13 against `source/syllabus/MOE_SEAB_EL_2025_Format_Excerpts.md`.

### §2.2 `PSLE_EL_Knowledge_Schema.md` — rewritten

**Before:** Domain tree pegged to 215m total, with two 15m comprehension components, Visual Text 10m in Booklet B, no S&T.

**After:** Domain tree pegged to 200m, one comprehension passage 20m, Visual Text 5m in Booklet A, S&T 10m in Booklet B. JSON practice-question schemas preserved where they don't conflict with the new mark allocations.

### §2.3 `Composition_Writing_Guide.md` — surgical edits

- Paper 1 header "70 marks, 1 hour 50 minutes" → "50 marks, 1 hour 10 minutes".
- Section title "PART 1: SITUATIONAL WRITING (30 marks)" → "PART 1: SITUATIONAL WRITING (14 marks)".
- Section title "PART 2: CONTINUOUS WRITING (40 marks)" → "PART 2: CONTINUOUS WRITING (36 marks)".
- Continuous-writing sub-bands "Content 20 / Language 15 / Organisation 5" — updated to the published 36-mark structure (Content 18 / Language 18 split per Master_KB band descriptors; pending SEAB PDF confirmation).
- **Promoted "critical-thinking point" rule** from `Master_KB2` §"2025 Format Conventions" into the Situational Writing section: *"One of the 6 content points is underlined (the 'critical-thinking' or 'expository' point). The information for that point is NOT in the stimulus. You must infer or generate a specific, realistic detail."*
- **Promoted "numbers under ten spelled out" rule** from `Master_KB2` §"The Reader's Lens" into a new sub-section *"Mechanics worth automating"* near the end of the Continuous Writing section.
- **Promoted "onomatopoeia without inverted commas" rule** from `Master_KB2` into the same sub-section.
- Added a one-line cross-reference to `ShowDontTell_KB.md` from the Show vs Tell sub-section.
- Word-count guidance preserved (150 minimum; 200–300 target).

### §2.4 `Oral_Communication_Guide.md` — surgical edits

- Paper 4 header "30 marks" → "40 marks".
- Reading Aloud header "10 marks" → "15 marks".
- SBC header "20 marks" → "25 marks".
- **Added** the PACT framework (Purpose, Audience, Context, Tone) for interpreting the **new 2025 preamble**, with cross-reference to Master_KB's REAP framework (Rhythm, Expression, Articulation, Pace) as the **delivery** framework. PACT = how to read the preamble; REAP = how to deliver the reading. Both are kept; no collision.
- **SBC frameworks layered, not collided.** Each SBC question type gets its canonical framework: Q1 (Observation + Inference) → describe-then-infer pattern; Q2 (Personal Experience) → **PEEL** is the primary, **OREO** kept as an alternative scaffold; Q3 (Critical Opinion) → **VBP** (Validate-Bridge-Persuade). The "competing frameworks" concern from the audit is resolved by mapping framework → question type instead of treating all three as competitors.
- **Noted** that 2025+ stimuli are **real-life photographs**, not posters/drawings, and that RA and SBC are no longer thematically linked.
- Theme vocabulary banks preserved.

### §2.5 `Comprehension_Strategy_Guide.md` — restructured

- Paper 2 Booklet B "67 marks" header → "65 marks".
- **Visual Text Comprehension moved** from Booklet B (10m) to Booklet A (5m, MCQ). Question types preserved but reframed as MCQ analysis rather than 1–3 sentence answers.
- **Editing** mark allocation changed from 12 marks (6 spelling + 6 grammar) to **10 marks** (split TBD pending SEAB PDF).
- **Comprehension Cloze** unchanged at 15 marks.
- **Two-passage comprehension structure** (Narrative 15 + Non-Narrative 15 = 30) **collapsed** to **one-passage structure** (Narrative *or* Non-Narrative, ~10 OE questions, 20 marks total). The RACE framework and question-type taxonomy survive intact; the two component sections are merged.
- **Synthesis & Transformation 10m added** as a new Booklet B component, with a placeholder sub-section that points at the new `SynthesisTransformation_KB.md` if/when authored. (S&T is not part of this six-KB supplementation batch; the placeholder is enough to make the strategy guide complete.)

### §2.6 `Listening_Comprehension_Guide.md` — minor touch-up

- Confirmed Paper 3 = 20 marks (1 mark each, 20 items). Unchanged.
- Added a single line noting that audio types in the 2025 paper include conversations, announcements, instructions, narratives, and short talks (this was implicit before; making it explicit for KB consistency).

### §2.7 `PSLE_EL_Revision_Strategy.md` — timing fix only

- Replaced "Full Paper 1 OR Paper 2 (timed) — 110 min" with separate Paper 1 (70 min) and Paper 2 (110 min) lines where the original text conflated them.
- Replaced "Full Paper 1 under exam conditions — 110 min" with "Full Paper 1 under exam conditions — 70 min".

### §2.8 `Master_PSLE_EL_KB.md` — header note only

No content changes. Added a single Status line at the top stating that the file was confirmed correct against the 2025+ SEAB syllabus and is the canonical AL1 reference for this folder.

### §2.9 `Master_PSLE_EL_KB2.md` — header note only

No content changes. Added a Status line acknowledging that the numbered references [1]–[44] point to an external document (likely a SEAB or MOE marking document or a tuition-centre rubric). Until the reference list is provided, the citations are preserved as in-text markers rather than removed, so the audit chain is visible.

### §2.10 `Grammar_Complete_Reference.md` and `Vocabulary_Idioms_Bank.md` — untouched

No format claims; no edits needed.

### §2.11 `README.md` — untouched (placeholder)

The folder-level README is a 34-byte placeholder. Left as-is; will be populated when the `/english/` site shell is built.

---

## §3 — Framework canonicalisation

Recorded here so future contributors do not re-introduce the collisions audited at the start.

| Domain | Canonical primary framework | Alternative scaffold(s) | Used for |
|---|---|---|---|
| Continuous Writing story arc | **Story Mountain** — Introduction → Rising Action → Climax → Falling Action → Conclusion | C.O.R.E. / S.T.E.P. / P.E.A.K. / E.A.S.E. / R.E.F. (Master_KB2 acronymic memory aids) | Composition planning, paragraphing |
| Show vs Tell | **F.A.S.T.** (Face / Actions / Speech / Thoughts) | Paired flat-vs-shown examples (see `ShowDontTell_KB.md`) | Both Continuous Writing and SBC Q1 |
| Continuous Writing climax → ending | **R.E.F.** (Reflection / Emotions / Future-action) | Banned-phrase list ("I learnt a valuable lesson") | Last paragraph of every narrative |
| Situational Writing planning | **P.A.C.W.** (Purpose / Audience / Context / Writer-persona) + 10-Minute Formula | — | Situational Writing first 2 minutes |
| Oral Reading Aloud — preamble interpretation | **PACT** (Purpose / Audience / Context / Tone) | — | New 2025 preamble |
| Oral Reading Aloud — delivery | **REAP** (Rhythm / Expression / Articulation / Pace) | — | Actual reading aloud |
| SBC Q1 (Observation + Inference) | Describe-then-infer; cite visual evidence | — | Q1 only |
| SBC Q2 (Personal Experience) | **PEEL** (Point / Evidence/Elaborate / Explain / Link) | **OREO** (Opinion / Reason / Example / Opinion) — secondary | Q2 only |
| SBC Q3 (Critical Opinion) | **VBP** (Validate / Bridge / Persuade) | — | Q3 only |
| Comprehension OE answers | **RACE** (Restate / Answer / Cite / Explain) | — | Every 2+ mark OE question |
| Idiom-use frequency in writing | 1–2 per Continuous Writing piece; 0–1 per Situational Writing where register permits | — | Both Paper 1 components |

---

## §4 — Orphan rule promotions (already noted above; collated here for audit)

| Rule | Original location | New canonical location |
|---|---|---|
| Critical-thinking point (one of six is underlined; not in stimulus) | `Master_KB2` §2025 Format Conventions | `Composition_Writing_Guide.md` Situational Writing section |
| Numbers under ten spelled out | `Master_KB2` §Reader's Lens | `Composition_Writing_Guide.md` Mechanics sub-section |
| Onomatopoeia without inverted commas | `Master_KB2` §Reader's Lens | `Composition_Writing_Guide.md` Mechanics sub-section |
| PACT for Reading Aloud preamble | (none — newly added from web evidence) | `Oral_Communication_Guide.md` Reading Aloud section |
| SBC framework → question-type mapping | (none — scattered across Master_KB and Oral guide) | `Oral_Communication_Guide.md` SBC section |
| One comprehension passage (not two) | (none — implicit only in Master_KB) | `Comprehension_Strategy_Guide.md` rewritten |
| Synthesis & Transformation 10m | (none in strategy guide) | `Comprehension_Strategy_Guide.md` placeholder section |

---

## §5 — Citation handling for `Master_PSLE_EL_KB2.md`

The bracketed citations [1]–[44] in Master_KB2 reference an external document that is not in the folder. After consideration:

- **Decision:** preserve the [n] markers as audit anchors and add a Status note at the top of the file explaining the reference list is not yet present. The owner can supply the source later; until then, the claims stand on their own pedagogical merit (every contested claim has been independently verified against the web sources catalogued in `source/syllabus/MOE_SEAB_EL_2025_Format_Excerpts.md`).
- **Rejected alternative:** strip the [n] markers. Rejected because doing so would erase the audit chain and make it harder for the owner to drop the original reference document in later.

---

## §6 — What is intentionally *not* changed

- `Master_PSLE_EL_KB.md` content. It is correct; this branch preserves it.
- `Vocabulary_Idioms_Bank.md`. The new `Idioms_Expanded_KB.md` adds breadth and frequency tags; the original 30-idiom bank stays as the curated starter set.
- `Grammar_Complete_Reference.md`. No format claims and no collisions; preserved verbatim.
- Anything under `/lab/`, `/studio/`, `/malay/`, `/mathmodel/`, `/nasworld/`, `/p1/`. The CLAUDE.md §13.2 protect list is honoured.

---

## §7 — Open items for the owner

Listed once here so they do not get lost downstream:

1. Download `0001_y25_sy.pdf` from SEAB into `source/syllabus/` when network permits.
2. Confirm Editing 10m split (grammar vs spelling) against the SEAB PDF — current guides assume 5/5 but this is a placeholder.
3. Confirm Continuous Writing sub-band split (Content / Language / Organisation breakdown of the 36 marks) against the SEAB PDF.
4. Supply the source for the [1]–[44] reference list in `Master_PSLE_EL_KB2.md` if available, so citations can be resolved.
5. Decide whether to publish or keep private `source/papers/` content once past PSLE EL papers are sourced.
