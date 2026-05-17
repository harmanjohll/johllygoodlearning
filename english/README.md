# PSLE English Language Studio (`/english/`)

A PSLE English Language learning Studio for Singapore Primary 6 candidates, sibling to `/lab/` (Science) and `/malay/` (Bahasa Melayu). Static HTML + vanilla JS + Google Gemini AI. **No server, no database.** Everything lives in the browser.

## Status

**Live and feature-complete for PSLE 2026.** Every section of every paper has a deep drill or sprint, and nine surfaces generate fresh practice material on demand via Gemini.

| Component | Status |
|---|---|
| Hub + 12 topic pages | ✓ |
| Compass (mood + session planner) | ✓ |
| Daily 10 (mastery-weighted mixed test) | ✓ |
| PSLE 2026 Countdown (20-week plan, 60 checkpoints) | ✓ |
| Mirror (paper-readiness, mismatch nudge, wellbeing pulse, cross-site mastery) | ✓ |
| Mega Map (with cross-paper "Bridges only" toggle) | ✓ |
| Paper 1 simulator (timed, dual AI examiner) | ✓ |
| Paper 2 mini simulator (60 min, auto-marked) | ✓ |
| Section sprints: Editing, Synthesis, Grammar Cloze, Comp Cloze, Visual Text, Comp OE | ✓ |
| Listening Practice (Web Speech, 3 curated + AI-generated) | ✓ |
| Reading Aloud (MediaRecorder + AI coach pointer) | ✓ |
| SBC Practice (8 stimuli + AI-generated, Coach vs Examiner mode) | ✓ |
| Composition Builder (Examiner / Coach / Annotator modes) | ✓ |
| Mentor Essays (3 Band-5 annotated) | ✓ |
| Cheat Cards (4 paper-level + 12 topic-level, print-ready) | ✓ |
| Word Lab (paste a word → calibrated AL1 card) | ✓ |
| My Bank (saved annotated essays + word cards, patterns roll-up) | ✓ |
| Idioms SRS (80+ idioms, SM-2 spaced) | ✓ |
| Collocations + Connectors drills | ✓ |

## Format covered

PSLE English Language 2025+ syllabus (SEAB 0001), 200 marks total:

| Paper | Marks | Time | Components |
|---|---|---|---|
| 1 — Writing | 50 | 1 h 10 min | Situational 14 + Continuous 36 |
| 2 — Lang Use & Comp | 90 | 1 h 50 min | Booklet A 25 + Booklet B 65 |
| 3 — Listening | 20 | ~35 min | 20 MCQ × 1m |
| 4 — Oral | 40 | ~10 min | Reading Aloud 15 + SBC 25 |
| **Total** | **200** | | |

See `knowledge-base/SEAB_Official_EL_Format_Syllabus_2026.md` for the full component breakdown.

## File layout

```
english/
├── index.html                 (hub — grouped CTAs + streak + plan + power-ups)
├── shared/
│   ├── shared.js, storage.js, gemini.js, coach.js, content.js
│   ├── drill.js, english-topic.js, spaced.js, pomodoro.js
│   └── content/*.json         (projections of the markdown KBs)
├── topics/                    (12 topic pages: Learn / Drill / Quiz / Mind Map)
├── compass/, daily/, countdown/, mirror/, map/, review/
├── structured/, simulate/, simulate-p2/, listen/, aloud/, sbc/
├── editing/, synthesis-drill/, cloze-drill/, comp-cloze-drill/
├── visualtext-drill/, comp-oe-drill/
├── drills/collocations/, drills/connectors/
├── idioms-srs/, word-lab/, bank/
├── mentors/, cards/, strategies/, format/, how-to-use/
└── knowledge-base/            (20+ curated markdown KBs + source/ drop zone)
```

## Cross-site state (shared with `/lab/`, `/malay/`)

| Key | Holds |
|---|---|
| `jgl.geminiKey` | Shared Gemini API key. One key, all three studios. |
| `jgl.progress` | Cross-site progress (sessions, wellbeing, mood log) |
| `english_progress` | Per-topic mastery + drill use + mind-map saves |
| `english_meta` | Streak meta (active days, rest days used) |
| `sciLab_progress` / `malay_progress` | Read-only inputs to the Mirror's cross-site readout |

Several other studio-specific keys are documented inline in `shared/storage.js` and in the individual feature pages (e.g. `jgl.english.daily`, `jgl.english.countdown.ticks`, `jgl.english.wordlab.bank`, `jgl.english.annotator.bank`, `jgl.english.mindmap.<topicId>`).

## Running locally

Static HTML. Serve the repo root with any static server, then open `http://localhost:PORT/english/`.

```sh
python -m http.server 8000
# then http://localhost:8000/english/
```

Get a free Gemini key at https://aistudio.google.com/app/apikey.

## Knowledge base

The studio is built on a curated knowledge base at `english/knowledge-base/`:

- `SEAB_Official_EL_Format_Syllabus_2026.md` — format spine, 200 marks
- `Master_PSLE_EL_KB.md` / `Master_KB2.md` — AL1 craft references
- `Composition_Writing_Guide.md` — Paper 1 priority
- `Comprehension_Strategy_Guide.md` — Paper 2 priority
- `Grammar_Complete_Reference.md`
- `Listening_Comprehension_Guide.md` — Paper 3
- `Oral_Communication_Guide.md` — Paper 4 (PACT + REAP + SBC)
- `Vocabulary_Idioms_Bank.md`, `Collocations_KB.md`, `Idioms_Expanded_KB.md`
- `ShowDontTell_KB.md`, `Register_KB.md`, `Connectors_KB.md`
- `VisualText_Examples_KB.md`, `ModelEssays_Annotated_KB.md`
- `source/syllabus/0001_y25_sy.pdf` (canonical SEAB PDF)
- `source/reference/Mentor_Texts.md` (3 Band-5 mentor essays)
