# PSLE EL Knowledge Schema
### Structured Domain Map + Practice Question Formats

> **Status:** Corrected 2026-05-13 against the 2025+ SEAB EL Syllabus 0001 (see `source/syllabus/MOE_SEAB_EL_2025_Format_Excerpts.md`). An earlier version of this file used a 215-mark structure; total is **200 marks**, Paper 1 is **50**, Paper 4 is **40**, comprehension is **one passage**, **Synthesis & Transformation** is present in Booklet B. See `Reconciliation_Notes.md` §2.2.

---

## Domain Tree

```
PSLE ENGLISH LANGUAGE (200 marks)
│
├── PAPER 1: WRITING (50 marks, 1h 10m)
│   ├── Part 1: Situational Writing (14 marks)
│   │   ├── Formal Letter
│   │   ├── Informal Letter / Email
│   │   ├── Report
│   │   ├── Speech
│   │   ├── Article (new in 2025)
│   │   ├── Review
│   │   ├── Recount / Diary
│   │   └── Notice / Announcement
│   │
│   └── Part 2: Continuous Writing (36 marks)
│       ├── Content (~18 marks)
│       │   ├── Relevance
│       │   ├── Development
│       │   └── Engagement / Sensory & Emotional Depth
│       └── Language & Organisation (~18 marks)
│           ├── Vocabulary range
│           ├── Sentence variety
│           ├── Grammar accuracy
│           ├── Paragraphing
│           ├── Opening / Hook
│           └── Reflective ending (R.E.F. — Reflection / Emotions / Future-action)
│
├── PAPER 2: LANGUAGE USE & COMPREHENSION (90 marks, 1h 50m)
│   ├── Booklet A: MCQ (25 marks)
│   │   ├── Grammar MCQ (10 marks, 10 × 1m)
│   │   │   ├── Tenses
│   │   │   ├── Subject-Verb Agreement
│   │   │   ├── Articles
│   │   │   ├── Prepositions
│   │   │   ├── Conjunctions
│   │   │   └── Pronouns
│   │   ├── Vocabulary MCQ (5 marks, 5 × 1m)
│   │   │   └── Word meaning / synonym in context
│   │   ├── Vocabulary Cloze (5 marks, 5 × 1m)
│   │   │   └── Best-fit word from 4 options
│   │   └── Visual Text Comprehension (5 marks, 5 × 1m)
│   │       ├── Literal recognition
│   │       ├── Inferential
│   │       ├── Language use (word/phrase choice)
│   │       └── Purpose / audience
│   │
│   └── Booklet B: Open-ended (65 marks)
│       ├── Grammar Cloze (10 marks, 10 × 1m)
│       ├── Editing for Grammar & Spelling (10 marks, 10 × 1m)
│       │   ├── Spelling errors (~5)
│       │   └── Grammar errors (~5)
│       ├── Comprehension Cloze (15 marks, 15 × 1m)
│       │   ├── Grammar clues
│       │   ├── Context clues
│       │   └── Collocation clues
│       ├── Synthesis & Transformation (10 marks, 5 × 2m)
│       │   ├── Conjunctions (combine into one sentence)
│       │   ├── Relative clauses
│       │   ├── If-conditionals
│       │   ├── Direct ↔ Reported speech
│       │   ├── Active ↔ Passive voice
│       │   └── Inversion / emphasis structures
│       └── Comprehension Open-Ended (20 marks, ~10 questions, ONE passage 500–600 words)
│           ├── Literal
│           ├── Inferential
│           ├── Vocabulary-in-context
│           ├── Language use / Writer's craft
│           ├── Author's purpose / Personal response
│           └── Note: the passage is narrative OR non-narrative; genre rotates between years
│
├── PAPER 3: LISTENING COMPREHENSION (20 marks, ~35m)
│   ├── 20 MCQ × 1m
│   ├── Factual / literal
│   ├── Inferential
│   ├── Main idea
│   ├── Vocabulary-in-context
│   └── Purpose / context
│
└── PAPER 4: ORAL COMMUNICATION (40 marks, ~10m per student)
    ├── Reading Aloud (15 marks)
    │   ├── Preamble (new in 2025) — interpret using PACT
    │   │   ├── Purpose
    │   │   ├── Audience
    │   │   ├── Context
    │   │   └── Tone
    │   ├── Delivery — REAP
    │   │   ├── Rhythm
    │   │   ├── Expression
    │   │   ├── Articulation
    │   │   └── Pace
    │   └── Marking strands: Pronunciation, Fluency & Pace, Expression & Stress
    └── Stimulus-Based Conversation (25 marks)
        ├── Stimulus = real-life photograph (new in 2025)
        ├── Independent from Reading Aloud topic (new in 2025)
        ├── Q1 Observation + Inference (describe → infer)
        ├── Q2 Personal Experience (PEEL primary, OREO alternative)
        ├── Q3 Critical Opinion (VBP — Validate, Bridge, Persuade)
        └── Marking strands: Communication of Ideas, Vocabulary, Language Accuracy
```

---

## JSON Practice Question Formats

The following JSON schemas define the structure for practice questions in each component. These can be used to prompt Claude / Gemini to generate questions in the correct format.

### Grammar MCQ

```json
{
  "component": "grammar_mcq",
  "paper": 2,
  "booklet": "A",
  "total_marks": 10,
  "format": {
    "type": "isolated_sentence_or_short_passage",
    "items": 10,
    "options_per_item": 4,
    "marks_per_item": 1
  },
  "sample_item": {
    "stem": "Every morning, the children _____ to school together.",
    "options": { "A": "walk", "B": "walks", "C": "walked", "D": "is walking" },
    "answer": "A",
    "skill_tested": "subject_verb_agreement_plural"
  }
}
```

### Grammar Cloze (Booklet B, open response)

```json
{
  "component": "grammar_cloze",
  "paper": 2,
  "booklet": "B",
  "total_marks": 10,
  "format": {
    "type": "passage_with_blanks",
    "blanks_count": 10,
    "words_per_blank": 1,
    "marks_per_blank": 1
  },
  "sample_question": {
    "passage_excerpt": "Yesterday, the children walked to school. By the time they arrived, it _____ (1) heavily for nearly an hour.",
    "blank_1": {
      "acceptable_answers": ["had", "had been"],
      "clue_type": "tense + auxiliary needed before past participle"
    }
  }
}
```

### Vocabulary MCQ

```json
{
  "component": "vocabulary_mcq",
  "paper": 2,
  "booklet": "A",
  "total_marks": 5,
  "format": {
    "type": "synonym_or_context",
    "items": 5,
    "options_per_item": 4,
    "marks_per_item": 1
  },
  "sample_question": {
    "instruction": "Choose the word closest in meaning to the underlined word.",
    "sentence": "The exhausted climbers finally reached the summit of the mountain.",
    "target_word": "exhausted",
    "options": { "A": "determined", "B": "drained", "C": "frustrated", "D": "cautious" },
    "answer": "B",
    "explanation": "Exhausted means very tired / drained of energy."
  }
}
```

### Vocabulary Cloze (MCQ best-fit)

```json
{
  "component": "vocabulary_cloze",
  "paper": 2,
  "booklet": "A",
  "total_marks": 5,
  "format": {
    "type": "passage_with_blanks_mcq",
    "blanks_count": 5,
    "options_per_blank": 4,
    "marks_per_blank": 1
  }
}
```

### Visual Text Comprehension

```json
{
  "component": "visual_text",
  "paper": 2,
  "booklet": "A",
  "total_marks": 5,
  "format": {
    "type": "image_plus_mcq",
    "image_types": ["poster", "advertisement", "infographic", "brochure", "webpage_screenshot"],
    "items": 5,
    "options_per_item": 4,
    "marks_per_item": 1
  },
  "skills_tested": ["literal_recognition", "inferential", "language_use", "purpose"]
}
```

### Editing for Grammar & Spelling

```json
{
  "component": "editing",
  "paper": 2,
  "booklet": "B",
  "total_marks": 10,
  "format": {
    "error_types": ["spelling", "grammar"],
    "approx_split": "5 + 5",
    "total_errors": 10,
    "some_lines_have_no_error": true,
    "marks_per_correct_identification_and_correction": 1
  },
  "sample_item": {
    "line_text": "The children runned as fast as they could to reach the finish line.",
    "error_word": "runned",
    "correct_word": "ran",
    "error_type": "grammar",
    "skill": "irregular_past_tense"
  }
}
```

### Comprehension Cloze

```json
{
  "component": "comprehension_cloze",
  "paper": 2,
  "booklet": "B",
  "total_marks": 15,
  "format": {
    "type": "passage_with_blanks",
    "blanks_count": 15,
    "words_per_blank": 1,
    "marks_per_blank": 1
  },
  "sample_question": {
    "passage_excerpt": "The old lighthouse had stood at the edge of the cliff for over a century. Its white walls, once bright and gleaming, had been _____ (1) by years of salt and wind to a dull, weathered grey.",
    "blank_1": {
      "acceptable_answers": ["worn", "faded", "bleached", "eroded", "reduced"],
      "clue_type": "context + grammar (past participle needed after 'been')"
    }
  }
}
```

### Synthesis & Transformation

```json
{
  "component": "synthesis_transformation",
  "paper": 2,
  "booklet": "B",
  "total_marks": 10,
  "format": {
    "items": 5,
    "marks_per_item": 2,
    "preserve_meaning": true,
    "no_extraneous_content": true
  },
  "sample_items": [
    {
      "instruction": "Begin: Hardly had…",
      "stem": "As soon as the bell rang, the students rushed out.",
      "model_answer": "Hardly had the bell rung when the students rushed out.",
      "skill": "inversion_after_hardly"
    },
    {
      "instruction": "Use: despite",
      "stem": "Although it was raining heavily, the football match continued.",
      "model_answer": "Despite the heavy rain, the football match continued.",
      "skill": "although_to_despite"
    }
  ]
}
```

### Comprehension Open-Ended

```json
{
  "component": "comprehension_open_ended",
  "paper": 2,
  "booklet": "B",
  "total_marks": 20,
  "passage": {
    "genre_rotates": ["narrative", "non_narrative"],
    "length_words": "500-600",
    "questions_count": 10
  },
  "question_types": [
    { "type": "literal", "marks": "1-2" },
    { "type": "inferential", "marks": "2-3", "framework": "RACE" },
    { "type": "vocabulary_in_context", "marks": "1-2" },
    { "type": "language_use", "marks": "2", "format": "technique + effect on reader" },
    { "type": "author_purpose_or_personal_response", "marks": "2" }
  ]
}
```

### Situational Writing (Paper 1 Part 1)

```json
{
  "component": "situational_writing",
  "paper": 1,
  "part": 1,
  "total_marks": 14,
  "marking_criteria": {
    "task_fulfilment": 6,
    "language_and_organisation": 8
  },
  "sample_task": {
    "text_type": "formal_letter",
    "situation": "You are a student at Greenfield Primary School. Your school recently started a recycling programme. Write a letter to the principal of a neighbouring school to share about this programme and encourage them to start one too.",
    "bullet_points_to_address": [
      "Describe what the recycling programme involves",
      "Share two benefits of the programme",
      "Suggest how they can start a similar programme",
      "Mention an upcoming inter-school environment fair",
      "Offer student volunteers to help set up",
      "Underlined critical-thinking point: invent a realistic specific detail (NOT in the stimulus) — e.g., a concrete result of the programme such as 'we reduced our weekly waste by 32 kg'"
    ],
    "register": "formal",
    "audience": "school_principal",
    "critical_thinking_point_index": 6
  }
}
```

### Continuous Writing (Paper 1 Part 2)

```json
{
  "component": "continuous_writing",
  "paper": 1,
  "part": 2,
  "total_marks": 36,
  "marking_criteria": {
    "content": 18,
    "language_and_organisation": 18,
    "note": "Sub-band split to be verified against SEAB PDF"
  },
  "word_count": { "minimum": 150, "target": "200-300" },
  "format": "three_topic_options_each_with_picture; student picks one",
  "sample_topics": [
    { "option": "A", "title": "Write a story about a time when you had to make a difficult choice.", "type": "narrative_personal" },
    { "option": "B", "title": "Write a story that begins with: 'The moment I saw the note on the door, I knew something was wrong.'", "type": "narrative_prompted_opening" },
    { "option": "C", "title": "Write a story in which an unexpected friendship changes someone's life.", "type": "narrative_thematic" }
  ]
}
```

### Listening Comprehension

```json
{
  "component": "listening_comprehension",
  "paper": 3,
  "total_marks": 20,
  "format": {
    "items": 20,
    "marks_per_item": 1,
    "type": "mcq",
    "audio_played_once_or_twice": true,
    "text_types": ["conversation", "announcement", "instruction", "narrative", "short_talk"]
  }
}
```

### Oral — Reading Aloud

```json
{
  "component": "reading_aloud",
  "paper": 4,
  "total_marks": 15,
  "preamble_present": true,
  "preamble_framework": "PACT (Purpose, Audience, Context, Tone)",
  "delivery_framework": "REAP (Rhythm, Expression, Articulation, Pace)",
  "marking_strands": ["pronunciation", "fluency_and_pace", "expression_and_stress"],
  "passage_length_words": "~150"
}
```

### Oral — Stimulus-Based Conversation

```json
{
  "component": "sbc",
  "paper": 4,
  "total_marks": 25,
  "stimulus": "real_life_photograph",
  "independent_from_reading_aloud": true,
  "question_arc": [
    { "q": 1, "type": "observation_inference", "framework": "describe_then_infer" },
    { "q": 2, "type": "personal_experience", "framework_primary": "PEEL", "framework_alternative": "OREO" },
    { "q": 3, "type": "critical_opinion", "framework": "VBP" }
  ],
  "marking_strands": ["communication_of_ideas", "vocabulary", "language_accuracy"]
}
```

---

## Target Scores and AL Benchmarks

| Paper | Full Marks | AL1 Target (~90%) | AL2 Target (~85%) | AL3 Target (~80%) |
|-------|-----------|-------------------|-------------------|-------------------|
| Paper 1 | 50 | 45+ | 43+ | 40+ |
| Paper 2 | 90 | 81+ | 77+ | 72+ |
| Paper 3 | 20 | 18+ | 17+ | 16+ |
| Paper 4 | 40 | 36+ | 34+ | 32+ |
| **Total** | **200** | **180+** | **171+** | **160+** |

### Scoring Focus

For AL1 (approximately 90%+):
- **Paper 2** is where most marks are available (45% of the exam) — highest ROI for revision time. The 45 constructed-response marks (Comp Cloze 15, S&T 10, Comp OE 20) are the hardest to score; drill these.
- **Paper 1 Continuous Writing** is difficult to score 33+/36 without strong vocabulary, sensory craft, and a reflective image-anchored ending.
- **Paper 4 Oral** can be maximised with daily 5-minute practice (highest effort-to-reward ratio). The new 25-mark SBC weight makes oral confidence more important than under the pre-2025 format.

---

## Key Metrics for Tracking Progress

| Metric | Measure | Target |
|--------|---------|--------|
| Comprehension OE accuracy | % of questions with full marks | 70% → 85%+ |
| RACE usage | % of 2+ mark questions answered with RACE | 100% |
| Continuous Writing band | Band achieved per attempt | Band 2 → Band 1 (33+/36) |
| Situational Writing band | Band achieved per attempt | Top band (13+/14) |
| Critical-thinking point | Was the underlined point invented well? (rubric) | Pass on every attempt |
| Grammar MCQ + Cloze accuracy | Correct out of 20 | 17/20+ |
| Editing accuracy | Correct out of 10 | 8/10+ |
| Synthesis & Transformation accuracy | Correct out of 5 (full marks per item) | 4/5+ |
| Vocabulary (active in writing) | New words used correctly per composition | 3+ per composition |
| Idiom use | Composition idioms used naturally | 1–2 per Continuous Writing piece |
| Oral SBC observe → infer | Q1 infers, not just describes | Always |

---

*End of PSLE EL Knowledge Schema.*
