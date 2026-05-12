# PSLE Bahasa Melayu Studio (`/malay/`)

A Malay Language learning Studio for Singapore PSLE candidates, sibling
to the `/studio/` Science Studio. Static HTML + vanilla JS + Google
Gemini AI. **No server, no database, no Supabase.** Everything lives
in the browser.

## Status

**Phase 1 (this commit): scaffold.** Hub renders, shared kernel ported,
four learnML knowledge bases mirrored. Topic pages and modes land in
subsequent phases.

See `/root/.claude/plans/look-at-the-learnml-clever-stonebraker.md`
for the full plan (Phases 1–5).

## Themes

| Theme | Strand | Phase |
|---|---|---|
| Tatabahasa | Imbuhan, Kata Nama, Kata Kerja, Kata Adjektif, Kata Hubung, Kata Sendi, Kata Ganti Nama, Penjodoh Bilangan | 2 |
| Kosa Kata | Daily vocab, Sinonim & Antonim | 3 |
| Peribahasa | Peribahasa, Simpulan Bahasa | 3 |
| Kefahaman | Comprehension passages with literal/inference probes | 4 |
| Penulisan | Karangan (directed, situational, descriptive, narrative) | 4 |

## State

| Key | Holds |
|---|---|
| `malay_progress` | Per-topic mastery, visits, quiz scores, mind-map saved flag |
| `malay_meta` | Streak, longest streak, last activity, active days (14d window) |
| `malay_levels` | Per-topic adaptive AI quiz level (4–6) |
| `malay_mindmap_<topicId>` | Saved mind-map JSON per topic |
| `jgl.geminiKey` | **Shared** with `/studio/`. One key, both sites. |
| `jgl.progress` | **Shared** cross-site progress (effort, sessions, wellbeing) |

## Shared kernel

| File | Role |
|---|---|
| `shared.js` | `Progress`, `Streak`, `AIConfig`, `QuizEngine`, `LLMQuizEngine`, `MalayMindMap`, `showAISetup`, `initAIQuizToggle` |
| `shared/storage.js` | `JglStorage` over `jgl.progress`; defers to Studio's instance if loaded |
| `shared/gemini.js` | `askGemini()` fetch wrapper, shared key |
| `shared/coach.js` | `MalayCoach` voice prelude (Phase 2/3 add per-mode prompt builders) |
| `shared/content.js` | `MalayContent` — loads `content/<theme>.json` |
| `shared/streak.js` | `MalayStreak` — rest-day-aware streak inside `jgl.progress` |
| `shared/pomodoro.js`, `spaced.js`, `lab.js` | Ported from `/studio/`, unchanged |

## Running locally

It's static HTML. Serve the repo root with any static server, then
open `http://localhost:PORT/malay/index.html`.

```sh
python -m http.server 8000
# then http://localhost:8000/malay/index.html
```

The Gemini key flow lives in the **🤖 Set Up AI Quizzes** button on
the hub. Get a free key at https://aistudio.google.com/app/apikey.
