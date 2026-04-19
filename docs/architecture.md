# Architecture note — Singapore Primary Science Lab, Phase 1

**Scope.** This note covers the state of the `/lab/` codebase before Phase 1 consolidation, the target state of the new `/studio/` folder, and the migration contract between them. Phases 2–4 are not in scope here.

**Date:** 2026-04-19. **Author:** Claude Code, on the `claude/read-claude-md-wmQho` branch.

---

## 1. Preservation contract

`/lab/` is a **frozen snapshot**. No file under `/lab/` is modified in Phase 1. The live site at `https://harmanjohll.github.io/johllygoodlearning/lab/index.html` continues to work exactly as it does today. All new work lives under `/studio/`.

Protect list (CLAUDE.md §13.2) applies to both trees: Circuit Builder, Conductor Test, Ohm's Law sim, Check My Map, the 45-minute Paper 1 timer, the C-E-R scaffold, and the hub emoji theme icons are not touched.

---

## 2. File inventory (`/lab/`, pre-Phase-1)

Total: 27,843 lines across 31 files.

### Hub and shared

| Path | Lines | Role |
|---|---|---|
| `lab/index.html` | 515 | Hub page, theme grid, streak widget, mastery meter |
| `lab/shared.js` | 896 | Progress, Streak, AIConfig, Quiz engines, MindMap, toasts |
| `lab/style.css` | 723 | Site-wide CSS |
| `lab/questions.json` | 122 | Cross-topic question bank |

### Cross-topic modes

| Path | Lines |
|---|---|
| `lab/assess/index.html` | 1280 |
| `lab/commands/index.html` | 893 |
| `lab/diagrams/index.html` | 1264 |
| `lab/explain/index.html` | 1062 |
| `lab/flashcards/index.html` | 618 |
| `lab/psle-tips/index.html` | 417 |
| `lab/structured/index.html` | 1399 |
| `lab/vocab/index.html` | 867 |

### Topics (19)

| Path | Lines | Path | Lines |
|---|---|---|---|
| `topics/cell-system/index.html` | 1140 | `topics/life-cycles/index.html` | 694 |
| `topics/circuits/index.html` | 905 | `topics/light/index.html` | 623 |
| `topics/circulatory/index.html` | 1409 | `topics/magnets/index.html` | 583 |
| `topics/digestive/index.html` | 561 | `topics/materials/index.html` | 680 |
| `topics/diversity/index.html` | 1103 | `topics/plant-reproduction/index.html` | 871 |
| `topics/ecosystems/index.html` | 1149 | `topics/plants/index.html` | 788 |
| `topics/forces/index.html` | 792 | `topics/respiratory/index.html` | 1093 |
| `topics/habitats/index.html` | 1113 | `topics/sound/index.html` | 871 |
| `topics/heat/index.html` | 1098 | `topics/water-cycle/index.html` | 1186 |
| `topics/human-reproduction/index.html` | 1128 | | |

---

## 3. Where content currently lives

**Topic content is inline in each topic's `index.html`.** No external data module is used today.

- **Glossary.** Each topic page embeds 8–14 `<div class="glossary-term">` blocks containing term name and definition. Expand/collapse is handled by the shared `initGlossary()` helper (`shared.js:286`).
- **Key questions and learn prose.** Written as HTML inside the Learn tab of each topic page.
- **Simulations.** Each topic's simulator is a topic-specific `<canvas>` or DOM widget in inline `<script>` blocks.
- **PSLE tips, summary, observe-and-infer.** Inline HTML, topic-by-topic.
- **Questions.** A small global question bank lives at `lab/questions.json` (122 lines). Per-topic Quiz tabs use `QuizEngine` / `LLMQuizEngine` from `shared.js` to generate or fetch items.

**`/lab/shared.js` already centralises** the moving parts: `Progress`, `Streak`, `AIConfig`, `showAISetup`, `initTabs`, `initGlossary`, `showToast`, `QuizEngine`, `LLMQuizEngine`, `ScienceMindMap`.

---

## 4. `localStorage` keys in use

| Key | Set / read from | Holds |
|---|---|---|
| `sciLab_progress` | `shared.js:7-74` (`Progress`), `lab/index.html:403` | `{ [topicId]: { quizScore, quizTotal, simUsed, mindMapSaved, visitCount, lastQuizDate, flashcardCounts } }` |
| `sciLab_meta` | `shared.js:77-119` (`Streak`); re-implemented in `vocab/index.html:347-350` | `{ streak, longestStreak, lastActivity, activeDays[] }` |
| `sciLab_gemini_key` | `shared.js:124-130` (`AIConfig`) | Gemini API key (string) |
| `sciLab_levels` | `shared.js:132-146` (`AIConfig`) | `{ [topicId]: 3..6 }` adaptive difficulty |
| `sciLab_fcStreak` | `flashcards/index.html:381-388` | Flashcard-only streak `{ count, lastDate }` (separate from `sciLab_meta`) |
| `sciLab_mindmap_${topicId}` | `shared.js:840, 847` (`ScienceMindMap`) | Topic mind map canvas state |

---

## 5. Gemini key flow

**Canonical path:** `AIConfig.getKey()` / `AIConfig.setKey()` in `shared.js:124-130`. The setup modal `showAISetup()` (`shared.js:150-266`) validates a key by calling `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent` at `shared.js:245`.

**Duplication:** The full Gemini fetch URL and request/response handling is re-implemented in four more places:

- `shared.js:522` — `LLMQuizEngine.generate()`
- `assess/index.html:988`
- `explain/index.html:877`
- `structured/index.html:1041`

Each inlines its own error handling, JSON parsing, and timeout behaviour. This is the single largest consolidation win in Phase 1.

---

## 6. Duplicated code (flagged, not fixed outside `/studio/`)

1. **Streak tracking.** `Streak` in `shared.js:77-119` is the canonical implementation; `vocab/index.html:347-350` re-declares its own `_getMeta`/`_setMeta` against the same `sciLab_meta` key; `flashcards/index.html:381-388` invents a parallel `sciLab_fcStreak` key with its own load/save.
2. **Gemini fetch.** Five separate implementations (see §5).
3. **Mastery percentage.** `Progress.masteryPct()` in `shared.js:25-33` is mirrored by a `computeMastery()` block in `lab/index.html:470-476` with identical weights.
4. **Glossary term markup.** Every topic page hand-writes its glossary entries as inline HTML; there is no shared glossary renderer driven by data.

---

## 7. Target `/studio/` layout

```
studio/
  index.html                      (thin shell, initial clone of lab/index.html)
  shared/
    lab.css                       (migrated from lab/style.css)
    lab.js                        (glue, router, Settings modal)
    storage.js                    (jgl.progress v2 read/write, migration)
    gemini.js                     (single askGemini() wrapper)
    content.js                    (loadTopic(id), loadTheme(id), cache)
    coach.js                      (scaffold, populated in Phase 2/3)
    spaced.js                     (scaffold, populated in Phase 4)
    content/
      diversity.json
      cycles.json
      systems.json
      interactions.json
      energy.json
    strategies.json               (scaffold, populated in Phase 4)
  topics/<topic>/index.html       (19 thin shells, render from content/)
  {assess,explain,structured,commands,flashcards,vocab,diagrams,psle-tips}/
    index.html                    (inline Gemini calls removed; delegate to shared/gemini.js)
docs/
  architecture.md                 (this file)
```

Topic-to-theme assignment (CLAUDE.md §4.1 five-theme model, best-effort placement; revisit in Phase 2):

- **Diversity.** diversity, materials
- **Cycles.** life-cycles, plant-reproduction, human-reproduction, water-cycle
- **Systems.** cell-system, circuits, circulatory, digestive, respiratory, plants
- **Interactions.** ecosystems, habitats, forces, magnets
- **Energy.** heat, light, sound

---

## 8. Migration from `sciLab_*` → `jgl.progress` v2

Runs **once**, on first load of any `/studio/` page, guarded by `jgl.progress.version === 2`. Copy-only: `sciLab_*` keys are left in place so the frozen `/lab/` site continues to work.

| Source (read) | Target (write) |
|---|---|
| `sciLab_progress[topicId]` | `jgl.progress.topics[topicId]` — `mastery` derived via existing formula; `timeSpentMs: 0`; `lastOpenedIso: null`; keep `quizScore`, `quizTotal`, `simUsed`, `mindMapSaved`, `visitCount`, `lastQuizDate`, `flashcardCounts` under an explicit `legacy` sub-key for continuity |
| `sciLab_meta` | `jgl.progress.streak` = `{ current, longest, lastStudiedIso, restDaysUsed: 0 }` |
| `sciLab_gemini_key` | `jgl.geminiKey` (top-level, per CLAUDE.md §11.1) |
| `sciLab_levels[topicId]` | `jgl.progress.topics[topicId].level` |
| `sciLab_fcStreak` | Folded into `jgl.progress.streak` (pick the higher `current`) |
| `sciLab_mindmap_${topicId}` | `jgl.progress.topics[topicId].mindMap` |

Phase-4 fields (`terms`, `questions`, `sessions`, `effort`, `wellbeing` from CLAUDE.md §8.3) are initialised empty in Phase 1.

---

## 9. Risks and open questions

1. **Same-origin state divergence.** `/lab/` and `/studio/` share `localStorage`. After Alexey uses `/studio/`, his `jgl.progress` will diverge from `sciLab_progress`. The frozen `/lab/` continues to read its old keys and will look "stuck" at pre-migration state. This is expected and acceptable; `/lab/` is a reference snapshot, not a co-primary UI.
2. **Topic ID to theme assignment.** The mapping in §7 is a first pass. Phase 2's mega-map design may suggest moving e.g. `plants` from Systems to Cycles; the JSON split can be renamed cheaply.
3. **`al1_content_pack.json`** (repo root, 34 KB) is out of scope for Phase 1 but its schema informs the JSON shape we pick, so Phase 3 ingestion is a merge rather than a reshape.
4. **No build step.** The `/studio/shared/*.js` modules use plain browser modules (`<script type="module">`) or a single-file re-export pattern. Confirm which at implementation time; the plain global-script pattern `/lab/` uses today is also acceptable and keeps parity.
5. **Adaptive level** (`sciLab_levels`) has no place in the CLAUDE.md §8.3 schema; placing it on `topics[id].level` preserves behaviour without blocking Phase 4.

---

## 10. Acceptance signals for Phase 1

- `/studio/index.html` renders visually identical to `/lab/index.html` on a 1280px laptop and 390px phone.
- `/studio/topics/circuits/` passes the protect-list check (Circuit Builder, Conductor Test, Ohm's Law, Check My Map all unchanged in behaviour).
- `jgl.progress` exists in localStorage with `version: 2` after a single page load.
- Setting a Gemini key once from the `/studio/` Settings modal unlocks `/studio/assess/`, `/studio/explain/`, and `/studio/structured/` without further prompts.
- `git diff main -- lab/` is empty at the end of Phase 1.
