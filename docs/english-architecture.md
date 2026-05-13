# Architecture note — PSLE English Language Studio (`/english/`), Phase 1 plan

**Scope.** This note describes the target Phase-1 layout for a new `/english/` sub-site, mirroring the conventions of `/lab/` → `/studio/` (Science) and `/malay/` (Bahasa Melayu). Phases 2–4 are sketched at the end but **not** in scope here. **No code, HTML, JS, or CSS is written as part of this document.**

**Date:** 2026-05-13. **Author:** Claude Code, on branch `claude/analyze-knowledge-bases-ZIrRn`.

---

## 1. Preservation contract

The existing `/lab/`, `/studio/`, and `/malay/` trees are **untouched** by any `/english/` build. The CLAUDE.md §13.2 protect list continues to apply:

- `/lab/` Circuit Builder, Conductor Test, Ohm's Law simulator, Check My Map, the 45-minute Paper 1 timer, the C-E-R scaffold, hub emoji theme icons.
- `/malay/` Karangan-planner, Karangan-cloud, Peribahasa-SRS, the Anotasi annotator mode in `/malay/structured/`.

All new work for English lives under `/english/`, with knowledge-base derivation already in place at `/english/knowledge-base/` (12 curated KBs + a `source/` drop zone of 5 sub-bins; see §4 below).

---

## 2. The format spine

`/english/` builds against the **200-mark 2025+ SEAB EL Syllabus 0001**, verified during reconciliation against 25+ independent Singapore publications (see `english/knowledge-base/source/syllabus/MOE_SEAB_EL_2025_Format_Excerpts.md` and `english/knowledge-base/Reconciliation_Notes.md` §1).

| Paper | Marks | Time | Components |
|---|---|---|---|
| 1 — Writing | 50 | 1h 10m | Situational 14 + Continuous 36 |
| 2 — Language Use & Comprehension | 90 | 1h 50m | Booklet A 25 (Grammar MCQ 10 + Vocab MCQ 5 + Vocab Cloze 5 + Visual Text 5). Booklet B 65 (Grammar Cloze 10 + Editing 10 + Comp Cloze 15 + S&T 10 + Comp OE 20) |
| 3 — Listening | 20 | ~35m | 20 MCQ × 1m |
| 4 — Oral | 40 | ~10m | Reading Aloud 15 (PACT preamble + REAP delivery) + SBC 25 (real-life photo) |
| **Total** | **200** | | |

The thesis from CLAUDE.md applies: the gap between AL2 and AL1 in English is about **precision**, **causal completeness in reasoning**, **command-word literacy** ("describe / explain / infer / predict / evaluate"), and **transfer** to unfamiliar contexts. Every cognitive feature should serve one or more of these.

---

## 3. File inventory (existing `/english/`)

As of this branch's merge from `origin/main`, `/english/` contains **only** the knowledge-base tier. No HTML, JS, CSS, or content JSON has been written.

### Knowledge-base files (top level — 12 files)

| File | Lines | Role |
|---|---|---|
| `english/knowledge-base/SEAB_Official_EL_Format_Syllabus_2026.md` | ~210 | Format spine (reconciled to 200-mark structure on this branch) |
| `english/knowledge-base/Master_PSLE_EL_KB.md` | ~250 | AL1 craft reference (Continuous Writing, Situational Writing, Oral) |
| `english/knowledge-base/Master_PSLE_EL_KB2.md` | ~90 | Companion AL1 reference with mnemonic acronyms |
| `english/knowledge-base/Composition_Writing_Guide.md` | ~700 | Paper 1 priority reference (7 situational genres + Continuous Writing craft) |
| `english/knowledge-base/Comprehension_Strategy_Guide.md` | ~500 | Paper 2 priority reference (Visual Text MCQ, Cloze, Editing, S&T, Comp OE) |
| `english/knowledge-base/Grammar_Complete_Reference.md` | ~480 | Encyclopedic grammar reference (Editing + Grammar Cloze backbone) |
| `english/knowledge-base/Listening_Comprehension_Guide.md` | ~170 | Paper 3 reference |
| `english/knowledge-base/Oral_Communication_Guide.md` | ~270 | Paper 4 reference (PACT + REAP + SBC framework-by-question-type) |
| `english/knowledge-base/Vocabulary_Idioms_Bank.md` | ~320 | Themed vocab + 30+ idioms (starter set) |
| `english/knowledge-base/PSLE_EL_Knowledge_Schema.md` | ~430 | Domain tree + JSON practice-question schemas |
| `english/knowledge-base/PSLE_EL_Revision_Strategy.md` | ~245 | June → October revision plan + parent-facing guidance |
| `english/knowledge-base/Reconciliation_Notes.md` | ~280 | This branch's audit trail (format inversion + framework canonicalisation + orphan-rule promotions) |

### New KBs authored on this branch (6 files)

| File | Role |
|---|---|
| `english/knowledge-base/Collocations_KB.md` | ≥170 collocations across 8 categories |
| `english/knowledge-base/Register_KB.md` | Formal/neutral/informal markers + genre matrix |
| `english/knowledge-base/Idioms_Expanded_KB.md` | 80+ idioms with frequency tags + use-context |
| `english/knowledge-base/ShowDontTell_KB.md` | 45+ paired flat ↔ shown examples across 9 emotion/state categories |
| `english/knowledge-base/VisualText_Examples_KB.md` | 6+ Singaporean public visual texts described with sample MCQ items |
| `english/knowledge-base/Connectors_KB.md` | 60+ discourse markers across 8 functions |

### `source/` drop zone (already created on this branch)

```
english/knowledge-base/source/
├── README.md                             (cowork drop-zone notes, mirrors malay/)
├── syllabus/
│   └── MOE_SEAB_EL_2025_Format_Excerpts.md   (authoritative 200-mark excerpt)
├── papers/.gitkeep                       (drop PSLE EL Papers 1–4 + listening transcripts)
├── workbooks/.gitkeep                    (drop publisher workbooks)
├── reports/.gitkeep                      (drop SEAB / MOE examiner reports)
└── reference/.gitkeep                    (drop dictionaries, style guides, exemplar essays)
```

### To-be-authored (Phase 2+)

- **`SynthesisTransformation_KB.md`** — catalogue of the ~25 recurring S&T patterns with worked examples and Coach probes. Placeholder reference is already in `Comprehension_Strategy_Guide.md` §"COMPONENT 5".
- **`ModelEssays_Annotated_KB.md`** — landing zone for the owner's "fodder / mentoring exemplars" (offered in session 2026-05-13). Goes under `english/knowledge-base/source/reference/exemplars/` first, then curated up.

---

## 4. Where content currently lives, where it should land

Content lives entirely in markdown KBs today. Phase 1 builds a `/english/shared/content/*.json` projection layer modelled on `/malay/shared/content/*.json`.

| Source (markdown KB) | Target (runtime JSON) |
|---|---|
| `SEAB_Official…` + `Master_PSLE_EL_KB*` + `PSLE_EL_Knowledge_Schema.md` | `english/shared/content/format.json` (single source of truth for paper structure, marks, time) |
| `Composition_Writing_Guide.md` + `Register_KB.md` + `Master_PSLE_EL_KB*` (Situational + Continuous sections) | `english/shared/content/writing.json` |
| `Comprehension_Strategy_Guide.md` + `Grammar_Complete_Reference.md` (Editing & Cloze sections) | `english/shared/content/comprehension.json` |
| `VisualText_Examples_KB.md` | `english/shared/content/visual-text.json` |
| `Listening_Comprehension_Guide.md` | `english/shared/content/listening.json` |
| `Oral_Communication_Guide.md` + `Master_PSLE_EL_KB.md` (Oral section) | `english/shared/content/oral.json` |
| `Vocabulary_Idioms_Bank.md` + `Idioms_Expanded_KB.md` + `Collocations_KB.md` + `Connectors_KB.md` | `english/shared/content/vocab.json` |
| `ShowDontTell_KB.md` | `english/shared/content/show-dont-tell.json` |
| `PSLE_EL_Revision_Strategy.md` | `english/shared/content/strategies.json` |
| `SynthesisTransformation_KB.md` (Phase 2) | `english/shared/content/synthesis.json` |

---

## 5. Target `/english/` layout (Phase 1)

```
english/
  index.html                     (hub — theme grid + streak + mastery + practice rails)
  shared/
    style.css                    (migrated from /malay/style.css with EL palette)
    shared.js                    (Progress, Streak, AIConfig, QuizEngine — patterned on /malay/)
    storage.js                   (jgl.progress v2 reader/writer; cross-site)
    gemini.js                    (single askGemini() wrapper; shared key)
    coach.js                     (EL Coach voice prelude; per-mode prompt builders in Phase 2/3)
    content.js                   (loadContent(strand); cache)
    bilingual.js                 (defer; only needed if EL ↔ ML cross-links go live)
    lab.js                       (router helpers)
    streak.js                    (rest-day-aware streak, shared across sites)
    pomodoro.js, spaced.js       (ported from /malay/, unchanged)
    content/
      format.json
      writing.json
      comprehension.json
      visual-text.json
      listening.json
      oral.json
      vocab.json
      show-dont-tell.json
      strategies.json
      mega.json                  (Phase 2 mega-map seed)
    strategies.json              (study strategy library, ported from /malay/ pattern)
  topics/
    grammar/index.html           (Grammar reference + drills — feeds Editing + Grammar Cloze)
    vocab/index.html             (Vocab + idioms + collocations + connectors)
    composition/index.html       (Continuous Writing topic-options + craft)
    situational/index.html       (Situational Writing 7 genres + critical-thinking point)
    visual-text/index.html       (Visual text reader + MCQ drill)
    cloze/index.html             (Comprehension Cloze)
    editing/index.html           (Editing drill)
    synthesis/index.html         (Synthesis & Transformation drill, Phase 2)
    comprehension/index.html     (Comprehension OE passage + RACE coach)
    listening/index.html         (Paper 3 listening drill)
    oral-reading/index.html      (Reading Aloud recorder + PACT + REAP coach)
    oral-sbc/index.html          (SBC photo stimulus + Q1/Q2/Q3 coach)
  compass/index.html             (session opener; shared with /malay/, /studio/)
  mirror/index.html              (progress dashboard; shared)
  review/index.html              (spaced-repetition queue surfacing; shared)
  map/index.html                 (mega map; Phase 2)
  structured/index.html          (Composition + Comprehension Builder with Examiner / Coach / Annotator modes)
  builder/index.html             (alias of structured; or merge into structured)
  format/index.html              (static reference: the 200-mark layout, paper-by-paper)
  psle-tips/index.html           (general PSLE tips; ported pattern)
  flashcards/index.html          (idioms + collocations + connectors via SRS)
  commands/index.html            (command-word literacy — describe / explain / infer / etc.)
  emotions/index.html            (Show-don't-tell drill from ShowDontTell_KB.md)
  confidence/index.html          (low-stakes warm-up rail)
  how-to-use/index.html          (parent + student onboarding)
```

### Topic-to-paper mapping

| Topic ID | Paper | Marks at stake | KB source |
|---|---|---|---|
| `grammar` | P2 Booklet A (10 Grammar MCQ) + P2 Booklet B (10 Grammar Cloze + 5 Grammar marks in Editing) | 25 | `Grammar_Complete_Reference.md` |
| `vocab` | P2 Booklet A (5 Vocab MCQ + 5 Vocab Cloze) | 10 | `Vocabulary_Idioms_Bank.md` + `Idioms_Expanded_KB.md` + `Collocations_KB.md` |
| `composition` | P1 Continuous Writing | 36 | `Composition_Writing_Guide.md` (Part 2) + `ShowDontTell_KB.md` + `Master_PSLE_EL_KB*` |
| `situational` | P1 Situational Writing | 14 | `Composition_Writing_Guide.md` (Part 1) + `Register_KB.md` |
| `visual-text` | P2 Booklet A (Visual Text MCQ) | 5 | `VisualText_Examples_KB.md` |
| `cloze` | P2 Booklet B (Comprehension Cloze) | 15 | `Comprehension_Strategy_Guide.md` + `Collocations_KB.md` + `Connectors_KB.md` |
| `editing` | P2 Booklet B (Editing) | 10 | `Grammar_Complete_Reference.md` + `Comprehension_Strategy_Guide.md` |
| `synthesis` | P2 Booklet B (S&T) — Phase 2 | 10 | `SynthesisTransformation_KB.md` (to author) |
| `comprehension` | P2 Booklet B (Comp OE) | 20 | `Comprehension_Strategy_Guide.md` |
| `listening` | P3 | 20 | `Listening_Comprehension_Guide.md` |
| `oral-reading` | P4 (Reading Aloud) | 15 | `Oral_Communication_Guide.md` (PACT + REAP) |
| `oral-sbc` | P4 (SBC) | 25 | `Oral_Communication_Guide.md` (Q1/Q2/Q3 frameworks) |
| `commands` | Cross-paper (command-word literacy) | — | (new mini-KB to author Phase 2) |
| `emotions` | Cross — Continuous Writing + Comp OE + SBC | — | `ShowDontTell_KB.md` |

---

## 6. `localStorage` schema

Reuses the same `jgl.progress` v2 schema already established by `/malay/` and `/studio/`. No new top-level key needed. EL entries are namespaced inside:

```
jgl.progress.english = {
  topics: {
    grammar: { mastery: 0-100, timeSpentMs, lastOpenedIso, level: 3-6 },
    vocab:   { ... },
    ...
  },
  terms:     { "vocab:idiom-cloud-nine": { attempts, mastered, lastSeenIso, nextDueIso }, ... },
  questions: { "synthesis:hardly-inversion-001": { attempts, bestScore, ... }, ... },
}
```

Cross-site keys remain singular and shared:
- `jgl.geminiKey` — one key, all three sub-sites.
- `jgl.progress.streak` — one streak across Science, Malay, English.
- `jgl.progress.effort.dailyMinutes` — combined effort heatmap.
- `jgl.progress.wellbeing` — Compass check-ins shared.

---

## 7. Gemini integration

Inherits the existing `gemini.js` wrapper (`/malay/shared/gemini.js`), copied (not re-implemented) into `/english/shared/gemini.js`. Per-mode prompt builders go in `/english/shared/coach.js`. Coach voice rules from CLAUDE.md §12 apply unchanged.

EL-specific Coach probes (sketched here; full builders are Phase 2):

| Mode | Probe pattern |
|---|---|
| Situational Coach | "You have addressed 5 of the 6 content points. Which is missing? Read the underlined item again — what specific detail could you generate that is NOT in the stimulus?" |
| Continuous Coach (Annotator) | Tags sentences by error type (Tense / SVA / Article / Preposition / WordChoice / Cliche / **ShowDontTell**) and asks ONE probing question per draft, not a list. |
| Comprehension OE Coach | "You said the character felt 'sad'. Find the line in the passage that tells you HOW he felt sad. Now write that line as your evidence." |
| Cloze Coach | "What word in the NEXT sentence tells you the answer to this blank cannot be 'and'? Try again." |
| Synthesis Coach | "You have used 'although'. The instruction says 'Use: despite'. What follows 'despite' — a clause or a noun phrase?" |
| Editing Coach | "You found a line with an error. Is the error spelling or grammar? If grammar, which of the six grammar areas does it fall under?" |
| Oral Reading Aloud | "Read me the preamble. What is the TONE — hopeful, urgent, sombre? Now read the first sentence in that tone." |
| SBC Q1 | "You have described what is in the photograph. Now infer — what does the body language SUGGEST about what they are feeling?" |
| SBC Q2 | "Use PEEL. You have a Point and an Example, but you skipped Elaboration. Why do you hold this view?" |
| SBC Q3 | "Before you state your view, validate the other side. What might a reasonable person who disagrees say first?" |

---

## 8. Patterns to lift from `/malay/` (and patterns to adapt)

| `/malay/` pattern | `/english/` equivalent | Lift cleanly or adapt? |
|---|---|---|
| Karangan-planner (6 W's: Who / Where / When / What / How / Lesson + peribahasa picker + opener/closer banks + AI Coach probe + save-and-copy) | EL Continuous Writing planner with same 6 boxes + an Idioms picker (instead of Peribahasa) + Show-Don't-Tell hook + opener/closer banks | Lift; minor adapt |
| Karangan-cloud (D3 graph of category → vocab → peribahasa → sample lines) | EL Composition Cloud — replace Peribahasa node-type with **Idioms** and **Collocations**; replace setting phrases with sensory-detail banks keyed by Singapore settings (hawker centre, MRT, void deck, etc.) | Lift; content swap |
| Structured Builder modes: Pemeriksa / Coach / **Anotasi** (Examiner / Coach / Annotator) | EL Builder modes: Examiner / Coach / **Annotator** with EL-specific error typology (Tense / SVA / Article / Preposition / PronounReference / ParallelStructure / Modifier / WordChoice-Register / Collocation / Punctuation / Spelling / Repetition / Cliche / **ShowDontTell**) | Lift architecturally; rebuild typology |
| Peribahasa-SRS | Idioms-SRS (drives 80+ idioms via SM-2 scheduling, ratchets daily) + Collocations-SRS as second deck | Lift |
| Listen (Mendengar K3) | EL Listening (Paper 3) — same player UI, 2-plays-then-locked, MCQ | Lift; content swap |
| Vocab Drill template-construction | EL Vocab Drill — definition + part-of-speech + sample sentence + collocation | Lift; richer construction |
| Flashcards | EL Flashcards (idioms front/back, irregular verbs, commonly-confused-word pairs like *affect/effect*) | Lift |
| Compass / Mirror / Review / Pomodoro / Spaced | Shared across sites; nothing to rebuild | Inherit |
| Mega Map (themes → topics → phenomena) | EL Mega Map — themes are **paper components** (P1/P2/P3/P4) → topics → cross-paper links (e.g. *idioms* → composition + SBC + comprehension) | Lift architecturally; redraw nodes |
| Format (paper structure) | EL Format static reference | Lift; content swap |
| Confidence (low-stakes warm-up) | EL Confidence | Lift; content swap |

---

## 9. EL-specific modes that have NO Malay analogue

These need new design (Phase 2+):

1. **Situational Writing genre selector + critical-thinking-point coach.** ML has only one composition; EL has two parts in Paper 1.
2. **Synthesis & Transformation drill.** No ML equivalent at all.
3. **Visual Text reader (MCQ analysis).** ML Kefahaman is text-only.
4. **Oral Reading Aloud recorder.** Records the student's read, transcribes via Web Audio + Gemini, returns PACT-tone + REAP-delivery feedback.
5. **SBC photo stimulus picker + 3-question coach arc.** Real-life photographs (not drawings); Q1 observation-infer, Q2 personal experience (PEEL/OREO), Q3 critical opinion (VBP).
6. **Editing drill** with line-by-line spelling/grammar identification.
7. **Comprehension Cloze trainer** with the four-clue-type Coach probe pattern.
8. **Show-Don't-Tell rewrite drill** (one of the highest-leverage AL1 features).
9. **Command-word literacy** mini-mode (describe / explain / infer / predict / suggest / evaluate).

---

## 10. Phased delivery for `/english/`

Mirrors the CLAUDE.md §10 four-phase contract. **This document covers only the Phase-1-equivalent plan.**

### Phase 1 (target of the next build branch)

**Goal:** produce a clean, shared content model and a runnable hub. No new pedagogical features; the student sees a usable but minimal `/english/` index.

1. Author the `english/shared/` kernel: `style.css`, `shared.js`, `storage.js`, `gemini.js`, `content.js`, `coach.js`, `streak.js`, `pomodoro.js`, `spaced.js`, `lab.js` — patterned on `/malay/`'s kernel.
2. Project each KB into `english/shared/content/*.json` per §4.
3. Build `english/index.html` (hub) with: theme grid (one card per topic ID), streak widget, mastery meter, practice rails for Composition / Comprehension / Vocab / Oral, settings (shared AI key).
4. Build placeholder topic shells under `english/topics/<id>/index.html` for the 14 topic IDs. Each topic shell reads from its JSON and renders a Learn tab.
5. Add `english/format/` (static reference of the 200-mark structure).
6. Add `english/how-to-use/` (parent + student onboarding).
7. Wire cross-site Compass / Mirror / Review / Pomodoro to recognise the new `english.*` namespace.

**Phase 1 acceptance gate:**
- Architecture note delivered and approved (this file).
- `english/index.html` renders without console errors on a 1280px laptop and a 390px phone.
- Setting a Gemini key once unlocks every AI-bearing mode across `/lab/`, `/studio/`, `/malay/`, and `/english/`.
- `jgl.progress.english.*` is created on first load.
- No regression in `/lab/`, `/studio/`, or `/malay/` (visual snapshot comparison).
- `git diff` shows only files under `english/` and `docs/`.

### Phase 2 — Mega Map + Vocab/Idioms/Collocations/Connectors as runnable modes

Goal: ship the highest-leverage non-AI modes (Idioms-SRS, Collocations drill, Connectors drill, Vocab Drill template-construction, Visual Text reader) and the Mega Map.

### Phase 3 — Writing modes (Situational + Continuous) with Examiner / Coach / Annotator

Goal: composition support. The Annotator with EL-specific typology is the largest individual feature.

### Phase 4 — Oral, Listening, Comprehension OE, Synthesis & Transformation + Compass / Mirror polish

Goal: complete the four-paper coverage and ship the behavioural layer at parity with `/studio/`.

---

## 11. Risks and open questions

1. **SEAB PDF not yet in repo.** The format spine relies on web-aggregated summaries. Owner action: drop `0001_y25_sy.pdf` into `english/knowledge-base/source/syllabus/` when network permits.
2. **Editing 10m grammar/spelling split.** Web sources are not unanimous; assumed 5/5. Verify against SEAB PDF.
3. **Article writing genre format conventions.** New in 2025. Web evidence is strong but the exact header/byline conventions vary by tuition centre; verify against a specimen.
4. **SBC stimulus photographs.** Cannot be sourced from the open web at PSLE scale; owner action — either commission a small curated photo bank or label news photos for educational use.
5. **Oral Reading Aloud transcription.** Web Audio + Gemini transcription is plausible but pronunciation marking is hard to score automatically. Phase 4 should treat this as a "Coach feedback" mode, not an "Examiner marking" mode.
6. **Master_KB2 [1]–[44] citations.** Unresolved external reference. Owner can supply, otherwise treat the marked claims as confirmed-by-web-only.
7. **Shared `jgl.progress` collisions.** EL and ML both want to use `terms` and `questions` sub-keys at the top level; namespace each as `english.terms` / `malay.terms` to avoid collision.

---

## 12. Reuse references (concrete paths)

- **`/malay/knowledge-base/README.md`** — table-driven KB inventory; mirror for `/english/knowledge-base/README.md` (to author).
- **`/malay/knowledge-base/source/README.md`** — drop-zone notes; already mirrored as `/english/knowledge-base/source/README.md`.
- **`/malay/karangan-planner/index.html`** — gold-standard planner UI; lift architecturally for `english/topics/composition/planner.html` (or fold into the topic page).
- **`/malay/karangan-cloud/cloud.js`** + **`/malay/karangan-cloud/index.html`** — D3 graph patterns; lift for the EL Composition Cloud.
- **`/malay/structured/index.html`** — Examiner / Coach / Anotasi mode-tab pattern; lift directly for `english/structured/index.html`.
- **`/malay/listen/index.html`** — Paper 3 audio player; lift directly for `english/topics/listening/`.
- **`/malay/peribahasa-srs/index.html`** — SM-2 SRS pattern; lift for `english/topics/vocab/idioms-srs.html`.
- **`/malay/compass/index.html`**, **`/malay/mirror/index.html`**, **`/malay/review/index.html`** — already shared via `jgl.progress`; no rebuild.
- **`/docs/architecture.md`** — sibling Science architecture note; this file is the EL equivalent.

---

## 13. Acceptance signals for Phase 1

- `/english/index.html` renders visually consistent with `/malay/index.html` (same kernel, same hub pattern, EL-themed palette).
- All 13 listed topic shells exist and render their JSON content without console errors.
- Gemini key set once from any sub-site, usable everywhere including `/english/`.
- `jgl.progress.english.*` exists in localStorage after first page load.
- `git diff origin/main -- malay/ lab/ studio/` is empty at the end of Phase 1 (protect list honoured).

---

*End of `/english/` architecture note (Phase 1 plan).*
