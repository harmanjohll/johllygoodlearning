# Source Material — Cowork Drop Zone

Drop external source material into the appropriate subdirectory.
**These files are never edited.** They are the audit trail behind
the curated KBs at the parent level.

## Where to put what

| Subdir | What goes here | Example filenames |
|---|---|---|
| `syllabus/` | MOE Sukatan Pelajaran (BM Sekolah Rendah), curriculum docs | `MOE_Sukatan_BM_2024.pdf` |
| `papers/` | Past PSLE BM papers — Paper 1, Paper 2, listening transcripts | `2019_PSLE_BM_Paper1.pdf`, `2020_PSLE_BM_Paper2.pdf` |
| `workbooks/` | Tuition / publisher workbooks (Marshall Cavendish, EPH, SAP, Casco) | `EPH_P6_BM_Workbook_2023.pdf` |
| `reports/` | SEAB examiner reports for BM (if any are public) | `SEAB_BM_ExaminerReport_2019.pdf` |
| `reference/` | Anything else — dictionaries, MOE teacher notes, Kamus Dewan | `Kamus_Dewan_excerpts.pdf` |

## Naming convention

Keep filenames machine-friendly: lowercase or PascalCase, underscores
or hyphens (no spaces), include year where relevant.

```
2019_PSLE_BM_Paper1.pdf       ✓
2019 PSLE Malay Paper 1.pdf   ✗ (spaces, "Malay" instead of "BM")
```

## How sources flow into KBs

1. **Drop** the file here (this directory).
2. **Cite** it in the KB markdown when an entry is derived from it.

   ```markdown
   ### sebuah (large objects)

   _Example: Mereka tinggal di **sebuah rumah**._
   _(= They live in a house.)_

   > Source: 2019 PSLE BM Paper 1 Q14 (sebuah rumah · sebuah kereta).
   ```

3. **Annotate** the commit message: `Calibrate KataSendi questions
   against 2019 PSLE BM Paper 1`.

## What doesn't go here

- Copyrighted material we don't have permission to redistribute on a
  public repo. (Past papers from publishers are typically OK for
  personal study but may not be redistributable. If in doubt, keep
  the source material locally and only commit the curated KB
  derivatives.)
- Generated content (AI-authored questions, etc.). Those live in
  `/malay/shared/content/*.json`, not here.

## Cowork pull priorities (high → low)

1. 2–3 past PSLE Bahasa Melayu papers (any year)
2. SEAB / MOE Sukatan Pelajaran Bahasa Melayu Sekolah Rendah
3. Public SEAB examiner reports for PSLE BM
4. Karangan model answers with annotated marking
5. A reputable P6 BM workbook PDF

If the priority 1 item lands, the Tatabahasa, Kosa Kata, and
Karangan KBs all get noticeably sharper on the next calibration pass.
