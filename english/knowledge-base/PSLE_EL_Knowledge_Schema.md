# PSLE EL Knowledge Schema
### Structured Domain Map + Practice Question Formats

---

## Domain Tree

```
PSLE ENGLISH LANGUAGE (215 marks)
│
├── PAPER 1: WRITING (70 marks)
│   ├── Part 1: Situational Writing (30 marks)
│   │   ├── Formal Letter
│   │   ├── Informal Letter / Email
│   │   ├── Report
│   │   ├── Speech
│   │   ├── Review
│   │   └── Notice / Announcement
│   │
│   └── Part 2: Continuous Writing (40 marks)
│       ├── Content (20 marks)
│       │   ├── Relevance
│       │   ├── Development
│       │   └── Engagement / Detail
│       ├── Language (15 marks)
│       │   ├── Vocabulary range
│       │   ├── Sentence variety
│       │   └── Grammar accuracy
│       └── Organisation (5 marks)
│           ├── Paragraphing
│           ├── Opening
│           └── Ending
│
├── PAPER 2: LANGUAGE USE & COMPREHENSION (95 marks)
│   ├── Booklet A: MCQ (~28 marks)
│   │   ├── Grammar Cloze (~10 marks)
│   │   │   ├── Tenses
│   │   │   ├── Subject-Verb Agreement
│   │   │   ├── Articles
│   │   │   ├── Prepositions
│   │   │   ├── Conjunctions
│   │   │   └── Pronouns
│   │   └── Vocabulary MCQ (~18 marks)
│   │       ├── Vocabulary Cloze (context-based)
│   │       └── Vocabulary (synonym / meaning)
│   │
│   └── Booklet B: Open-Ended (~67 marks)
│       ├── Visual Text Comprehension (10 marks)
│       │   ├── Literal questions
│       │   ├── Inferential questions
│       │   └── Language use questions
│       ├── Comprehension Cloze (15 marks)
│       │   ├── Grammar clues
│       │   ├── Context clues
│       │   └── Collocation clues
│       ├── Editing (12 marks)
│       │   ├── Spelling errors (6 marks)
│       │   └── Grammar errors (6 marks)
│       ├── Narrative Comprehension (15 marks)
│       │   ├── Literal
│       │   ├── Inferential
│       │   ├── Vocabulary-in-context
│       │   ├── Language use / Writer's craft
│       │   └── Author's purpose / Personal response
│       └── Non-Narrative Comprehension (15 marks)
│           ├── Literal
│           ├── Inferential
│           ├── Vocabulary-in-context
│           ├── Text organisation
│           └── Evaluative / Opinion-based
│
├── PAPER 3: LISTENING COMPREHENSION (20 marks)
│   ├── Factual questions
│   ├── Inferential questions
│   ├── Main idea questions
│   ├── Vocabulary-in-context
│   └── Purpose questions
│
└── PAPER 4: ORAL COMMUNICATION (30 marks)
    ├── Reading Aloud (10 marks)
    │   ├── Pronunciation
    │   ├── Fluency & Pace
    │   └── Expression & Stress
    └── Stimulus-Based Conversation (20 marks)
        ├── Communication of Ideas
        ├── Vocabulary
        └── Language Accuracy
```

---

## JSON Practice Question Formats

The following JSON schemas define the structure for practice questions in each component. These can be used to prompt Claude to generate questions in the correct format.

### Grammar Cloze (MCQ)

```json
{
  "component": "grammar_cloze",
  "paper": 2,
  "booklet": "A",
  "total_marks": 10,
  "format": {
    "type": "passage_with_blanks",
    "blanks_count": 10,
    "options_per_blank": 4,
    "marks_per_blank": 1
  },
  "sample_question": {
    "passage_excerpt": "Every morning, the children _____ (1) to school together. Yesterday, however, it _____ (2) so heavily that their mother decided to drive them instead.",
    "blank_1": {
      "blank_number": 1,
      "options": {
        "A": "walk",
        "B": "walks",
        "C": "walked",
        "D": "are walking"
      },
      "answer": "A",
      "skill_tested": "simple_present_tense_plural_subject"
    },
    "blank_2": {
      "blank_number": 2,
      "options": {
        "A": "rains",
        "B": "rained",
        "C": "had rained",
        "D": "is raining"
      },
      "answer": "B",
      "skill_tested": "simple_past_tense"
    }
  }
}
```

---

### Vocabulary MCQ

```json
{
  "component": "vocabulary_mcq",
  "paper": 2,
  "booklet": "A",
  "format": {
    "type": "synonym_or_context",
    "options_per_question": 4,
    "marks_per_question": 1
  },
  "sample_question": {
    "instruction": "Choose the word closest in meaning to the underlined word.",
    "sentence": "The exhausted climbers finally reached the summit of the mountain.",
    "target_word": "exhausted",
    "options": {
      "A": "determined",
      "B": "drained",
      "C": "frustrated",
      "D": "cautious"
    },
    "answer": "B",
    "explanation": "Exhausted means very tired / drained of energy."
  }
}
```

---

### Comprehension Open-Ended

```json
{
  "component": "comprehension_open_ended",
  "paper": 2,
  "booklet": "B",
  "passage_type": "narrative",
  "total_marks": 15,
  "question_types": [
    {
      "type": "literal",
      "marks": 1,
      "sample": "According to the text, where did Marcus find the letter?",
      "expected_answer_format": "Short phrase or sentence; direct answer from text"
    },
    {
      "type": "inferential",
      "marks": 2,
      "sample": "How do you know that Marcus was nervous? Support your answer with evidence from the text.",
      "expected_answer_format": "RACE: Inference + quote + explanation",
      "mark_scheme_notes": "1 mark for inference with general reference; 2 marks for specific quote + explanation"
    },
    {
      "type": "vocabulary_in_context",
      "marks": 1,
      "sample": "What does the word 'reluctant' mean as used in paragraph 3?",
      "expected_answer_format": "Synonym or explanation that fits the context"
    },
    {
      "type": "language_use",
      "marks": 2,
      "sample": "Explain the effect of the simile 'his heart sank like a stone' in paragraph 5.",
      "expected_answer_format": "Name technique (1m) + explain effect on reader (1m)"
    },
    {
      "type": "personal_response",
      "marks": 2,
      "sample": "Do you think Marcus made the right decision at the end of the story? Give reasons for your answer, referring to the text.",
      "expected_answer_format": "Clear stance + reason from text + own reasoning"
    }
  ]
}
```

---

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
      "blank_number": 1,
      "acceptable_answers": ["worn", "faded", "bleached", "eroded", "reduced"],
      "clue_type": "context + grammar (past participle needed after 'been')"
    }
  }
}
```

---

### Editing

```json
{
  "component": "editing",
  "paper": 2,
  "booklet": "B",
  "total_marks": 12,
  "format": {
    "error_types": ["spelling", "grammar"],
    "errors_of_each_type": 6,
    "total_errors": 12,
    "some_lines_have_no_error": true,
    "marks_per_correct_identification_and_correction": 1
  },
  "sample_question": {
    "line_text": "The children runned as fast as they could to reach the finish line.",
    "error_word": "runned",
    "correct_word": "ran",
    "error_type": "grammar",
    "skill": "irregular_past_tense"
  }
}
```

---

### Situational Writing

```json
{
  "component": "situational_writing",
  "paper": 1,
  "part": 1,
  "total_marks": 30,
  "marking_criteria": {
    "task_achievement": 12,
    "language": 12,
    "format_and_register": 6
  },
  "sample_task": {
    "text_type": "formal_letter",
    "situation": "You are a student at Greenfield Primary School. Your school recently started a recycling programme. Write a letter to the principal of a neighbouring school to share about this programme and encourage them to start one too.",
    "bullet_points_to_address": [
      "Describe what the recycling programme involves",
      "Share two benefits of the programme",
      "Suggest how they can start a similar programme in their school"
    ],
    "register": "formal",
    "audience": "school_principal"
  }
}
```

---

### Continuous Writing

```json
{
  "component": "continuous_writing",
  "paper": 1,
  "part": 2,
  "total_marks": 40,
  "marking_criteria": {
    "content": 20,
    "language": 15,
    "organisation": 5
  },
  "word_count": {
    "minimum": 150,
    "maximum": 300,
    "target": "200-250"
  },
  "sample_topics": [
    {
      "option": "A",
      "title": "Write a story about a time when you had to make a difficult choice.",
      "type": "narrative_personal"
    },
    {
      "option": "B",
      "title": "Write a story that begins with: 'The moment I saw the note on the door, I knew something was wrong.'",
      "type": "narrative_prompted_opening"
    },
    {
      "option": "C",
      "title": "Write a story in which an unexpected friendship changes someone's life.",
      "type": "narrative_thematic"
    },
    {
      "option": "D",
      "title": "Picture prompt (description of a scene to be used as story inspiration)",
      "type": "picture_prompt"
    }
  ]
}
```

---

## Target Scores and AL Benchmarks

| Paper | Full Marks | AL1 Target (~90%) | AL2 Target (~85%) | AL3 Target (~80%) |
|-------|-----------|-------------------|-------------------|-------------------|
| Paper 1 | 70 | 63+ | 60+ | 56+ |
| Paper 2 | 95 | 86+ | 81+ | 76+ |
| Paper 3 | 20 | 18+ | 17+ | 16+ |
| Paper 4 | 30 | 27+ | 26+ | 24+ |
| **Total** | **215** | **194+** | **183+** | **172+** |

### Scoring Focus

For AL1 (approximately 90%+):
- Paper 2 is where most marks are available — high ROI for revision time
- Paper 1 Continuous Writing is difficult to score 38+/40 without strong vocabulary
- Paper 4 Oral can be maximised with daily practice (high effort-to-reward ratio)

---

## Key Metrics for Tracking Progress

| Metric | Measure | Target |
|--------|---------|--------|
| Comprehension accuracy | % of open-ended questions with full marks | 70% → 85%+ |
| RACE usage | % of 2-mark questions answered with RACE | 100% |
| Composition Content score | Band achieved per attempt | Band 2 → Band 1 |
| Grammar Cloze accuracy | Correct out of 10 | 8/10+ |
| Editing accuracy | Correct out of 12 | 10/12+ |
| Vocabulary (active) | New words used correctly in compositions | 3+ per composition |

---

*End of PSLE EL Knowledge Schema*
