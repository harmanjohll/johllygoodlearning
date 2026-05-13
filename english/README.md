# PSLE English Language Studio (`/english/`)

A PSLE English Language learning Studio for Singapore Primary 6 candidates, sibling to `/malay/` (Bahasa Melayu) and `/studio/` (Science). Static HTML + vanilla JS + Google Gemini AI. **No server, no database.** Everything lives in the browser.

## Status

**Pre-build (this commit): knowledge-base tier only.** The `/english/` site shell has not been written yet. The knowledge base under `english/knowledge-base/` is the curated foundation. The site shell is Phase 1 of the next branch.

See `docs/english-architecture.md` for the full Phase-1 plan (mirrors `docs/architecture.md` for `/lab/`).

## What lives here today

```
english/
├── README.md                 ← this file
└── knowledge-base/           ← curated KBs (18 markdown files) + source/ drop zone
    ├── SEAB_Official_EL_Format_Syllabus_2026.md   (format spine, 200 marks)
    ├── Master_PSLE_EL_KB.md / Master_KB2.md       (AL1 craft references)
    ├── Composition_Writing_Guide.md               (Paper 1 priority)
    ├── Comprehension_Strategy_Guide.md            (Paper 2 priority)
    ├── Grammar_Complete_Reference.md
    ├── Listening_Comprehension_Guide.md           (Paper 3)
    ├── Oral_Communication_Guide.md                (Paper 4: PACT + REAP + SBC)
    ├── Vocabulary_Idioms_Bank.md
    ├── Collocations_KB.md                         (170+ collocations)
    ├── Idioms_Expanded_KB.md                      (80+ idioms with frequency tags)
    ├── ShowDontTell_KB.md                         (45+ flat ↔ shown pairs)
    ├── Register_KB.md                             (formal/informal markers by genre)
    ├── Connectors_KB.md                           (60+ discourse markers)
    ├── VisualText_Examples_KB.md                  (6 Singapore visual texts described)
    ├── PSLE_EL_Knowledge_Schema.md                (domain tree + JSON schemas)
    ├── PSLE_EL_Revision_Strategy.md
    ├── Reconciliation_Notes.md                    (audit trail of KB reconciliation)
    └── source/
        ├── syllabus/0001_y25_sy.pdf               (SEAB EL Syllabus, canonical PDF)
        ├── syllabus/MOE_SEAB_EL_2025_Format_Excerpts.md
        ├── reference/Mentor_Texts.md              (3 Band-5 model essays + craft notes)
        ├── papers/        (drop zone for past PSLE EL papers)
        ├── workbooks/     (drop zone for publisher workbooks)
        └── reports/       (drop zone for SEAB / MOE examiner reports)
```

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

## Planned site layout (Phase 1, not built yet)

```
english/
├── index.html                 (hub — theme grid + streak + mastery + practice rails)
├── shared/
│   ├── style.css, shared.js, storage.js, gemini.js, coach.js, content.js
│   └── content/*.json         (projections from the markdown KBs)
├── topics/
│   ├── grammar/, vocab/, composition/, situational/, visual-text/
│   ├── cloze/, editing/, synthesis/, comprehension/
│   └── listening/, oral-reading/, oral-sbc/
└── compass/, mirror/, review/, map/, structured/, format/, psle-tips/, how-to-use/
```

The full plan is in `/docs/english-architecture.md`.

## Cross-site state (shared with `/lab/`, `/studio/`, `/malay/`)

| Key | Holds |
|---|---|
| `jgl.geminiKey` | **Shared** Gemini API key. One key, all four sites. |
| `jgl.progress` | **Shared** cross-site progress (effort, sessions, wellbeing, streak) |
| `jgl.progress.english.*` | Per-topic mastery, terms, questions for EL (Phase 1) |

## Running locally

It's static HTML. Once Phase 1 lands, serve the repo root with any static server, then open `http://localhost:PORT/english/index.html`.

```sh
python -m http.server 8000
# then http://localhost:8000/english/index.html
```

Get a free Gemini key at https://aistudio.google.com/app/apikey.
