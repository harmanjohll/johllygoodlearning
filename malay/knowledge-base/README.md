# Knowledge Base — PSLE Bahasa Melayu Studio

Source-of-truth markdown for every Malay topic in `/malay/`.

The hub, topic pages, and quizzes all derive from the curated JSON files
under `/malay/shared/content/`. Those JSONs are seeded from these
markdown KBs and stay in sync with them.

## Ported verbatim from `harmanjohll/learnML`

These four files come from the original Malay Language Adventure repo
(`learnML`) and are kept here unchanged so the content authored there
remains the canonical reference for these topics.

| File | Topic | Origin |
|---|---|---|
| `Imbuhan_KB.md` | Imbuhan (affixes) — meN-, beR-, peN-, di-, ter-, ke-an | learnML |
| `Peribahasa_KB.md` | Peribahasa & Simpulan Bahasa (80+ entries) | learnML |
| `PenjodohBilangan_KB.md` | Penjodoh Bilangan (numerical classifiers) | learnML |
| `QuestionsBank_KB.md` | Static question bank used as quiz seed | learnML |

## To be authored (Phase 2–4)

These KBs will be written as each phase ships. Net-new content will be
flagged in its commit so it can be audited against the MOE syllabus or
a trusted workbook before being seeded into the JSON content layer.

| File | Topic | Phase |
|---|---|---|
| `KataNama_KB.md` | Kata Nama (am, khas, mujarad; bentuk jamak) | 2 |
| `KataKerja_KB.md` | Kata Kerja (transitif / tak transitif; sedang, telah, akan) | 2 |
| `KataAdjektif_KB.md` | Kata Adjektif (darjah perbandingan, kolokasi) | 2 |
| `KataHubung_KB.md` | Kata Hubung (dan, atau, tetapi, kerana, supaya, walaupun) | 2 |
| `KataSendi_KB.md` | Kata Sendi Nama (di, ke, dari, daripada, kepada, pada, untuk) | 2 |
| `KataGantiNama_KB.md` | Kata Ganti Nama (diri, tunjuk, tanya) | 2 |
| `SinonimAntonim_KB.md` | Sinonim & Antonim (pasangan mengikut tema) | 3 |
| `Kefahaman_KB.md` | Petikan kefahaman + soalan probe (literal, inferens) | 4 |
| `Karangan_KB.md` | Karangan terancang, bersituasi, deskriptif, naratif | 4 |

## Notes

- All files use UTF-8. Malay accented characters and Jawi loan-words
  should render correctly.
- Each KB should include: definition, P5/P6 scope, worked examples,
  practice items at three difficulty tiers, and common-mistake notes.
- The KBs feed the AI Coach as well as the static quiz pool. A well-
  authored KB means a smarter Coach probe.
