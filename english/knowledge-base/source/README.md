# Source Material — Cowork Drop Zone (English Language)

Drop external source material into the appropriate subdirectory.
**These files are never edited.** They are the audit trail behind
the curated KBs at the parent level.

Mirrors the convention of `/malay/knowledge-base/source/`.

## Where to put what

| Subdir | What goes here | Example filenames |
|---|---|---|
| `syllabus/` | MOE EL Syllabus (Primary), SEAB syllabus PDFs | `SEAB_PSLE_EL_Syllabus_0001_y25.pdf`, `MOE_EL_Syllabus_2020_Primary.pdf` |
| `papers/` | Past PSLE EL papers — Papers 1, 2, 3 (listening transcripts), and any oral past-year question lists | `2023_PSLE_EL_Paper1.pdf`, `2023_PSLE_EL_Paper2.pdf`, `2023_PSLE_EL_Paper3_Transcript.pdf` |
| `workbooks/` | Tuition / publisher workbooks (Marshall Cavendish, EPH, SAP, Casco) | `EPH_P6_EL_Workbook_2023.pdf` |
| `reports/` | SEAB / MOE examiner-style reports for EL (if any are public) | `SEAB_EL_ExaminerReport_2019.pdf` |
| `reference/` | Anything else — Oxford Collocations Dictionary excerpts, idiom dictionaries, MOE STELLAR resources, style guides | `OxfordCollocations_excerpts.md`, `idioms_singaporean_context.md` |

## Naming convention

Keep filenames machine-friendly: lowercase or PascalCase, underscores
or hyphens (no spaces), include year where relevant.

```
2023_PSLE_EL_Paper1.pdf        ✓
2023 PSLE English Paper 1.pdf  ✗ (spaces, "English" instead of "EL")
```

## How sources flow into KBs

1. **Drop** the file here (this directory).
2. **Cite** it in the KB markdown when an entry is derived from it.

   ```markdown
   ### make a decision (verb–noun collocation)

   _Example: She had to **make a decision** quickly._

   > Source: Oxford Collocations Dictionary, "decision".
   ```

3. **Annotate** the commit message: `Calibrate Editing KB against 2023 PSLE EL Paper 2`.

## What doesn't go here

- Copyrighted material we don't have permission to redistribute on a
  public repo. Past papers from SEAB / publishers are typically OK for
  personal study but may not be redistributable. If in doubt, keep the
  source material locally and only commit the curated KB derivatives.
- Generated content (AI-authored practice items, model essays, etc.).
  Those live in `/english/shared/content/*.json` (future), not here.

## Cowork pull priorities (high → low)

1. 2–3 past PSLE EL papers from 2023–2025 (Papers 1, 2, 3 transcripts).
2. SEAB PSLE EL Syllabus 0001_y25 PDF (2025 implementation onwards).
3. MOE EL Primary Syllabus 2020 PDF.
4. SEAB examiner-style commentary on common loss-of-marks patterns.
5. A reputable P6 EL workbook PDF (one publisher).
6. Five to ten annotated SBC stimulus photographs with sample probes.

If priority 1 lands, the Composition, Comprehension, Editing,
Synthesis & Transformation, and Cloze KBs all get noticeably sharper
on the next calibration pass.

## Note on the syllabus excerpt

The curated `syllabus/MOE_SEAB_EL_2025_Format_Excerpts.md` file at
`syllabus/` was authored against publicly available web summaries of
the SEAB PSLE EL Syllabus 0001_y25 (implemented from PSLE 2025). The
canonical SEAB PDF (`https://www.seab.gov.sg/files/PSLE%20Syllabus%20documents/2025%20PSLE/0001_y25_sy.pdf`)
should be downloaded into `syllabus/` when network access permits, so
the markdown excerpt can be re-calibrated against the source.
