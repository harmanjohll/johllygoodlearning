# Anastasia's Learning Universe — Project Brief

## Overview
A comprehensive adaptive learning application for a Primary 1 student in Singapore named Anastasia. She is bright with high fluency and potential for Olympiad-level work, but not particularly motivated. The app must be engaging, gamified, and pedagogically rigorous.

## Key Principles

### Pedagogical Framework
- **ZPD (Zone of Proximal Development)**: The adaptive engine must keep Anastasia working at the edge of her ability — not too easy (boredom), not too hard (frustration)
- **CPA Progression (Singapore Math)**: Every math skill must progress through Concrete (physical/visual manipulatives) → Pictorial (bar models, diagrams) → Abstract (numbers only) → Fluency (speed, larger ranges) → Challenge (Olympiad-style). The system auto-advances when accuracy over last 8 attempts ≥85%, and scaffolds back when <40%
- **Assessment as Learning**: Metacognitive prompts appear ~30% of the time ("What helped you figure that out?", "How did your brain solve that?"). Growth mindset messaging on errors. The learner should think about her thinking
- **Knowledge, Skills, and Dispositions**: The adaptive system tracks not just correctness but confidence, hint usage, streak patterns, and engagement

### Technical Requirements
- Multi-file project structure (modular, maintainable)
- Must include a build script that bundles everything into a SINGLE self-contained HTML file for offline use (she double-clicks one file and it works)
- State persistence via localStorage (single user, single browser)
- No backend, no database, no network dependency for the bundled version
- Designed for desktop/laptop (primary device)
- Architecture must support future addition of Malay Language module (language abstraction layer)

### Existing Progress (CRITICAL — MUST PRESERVE)
Anastasia has been using v1 of this app. Her progress is stored in localStorage under the key `anas_gameState`. The v1 state structure uses these skill IDs:
- `counting`, `number-bonds`, `addition`, `subtraction`, `comparing`, `patterns`, `word-problems`, `shapes` (math)
- `phonics`, `sight-words`, `spelling`, `sentence-building`, `vocabulary`, `story-garden` (word)

The v2 system uses new IDs. A migration layer must map:
```
counting → count, number-bonds → nbond, addition → add, subtraction → sub,
comparing → cmp, patterns → pat, word-problems → wp1, shapes → shp,
phonics → phon, sight-words → sight, spelling → spell,
sentence-building → sent, vocabulary → vocab, story-garden → story
```

The migration must preserve: tokens, streak, bestStreak, totalCorrect, totalAttempts, sessionsCompleted, level, garden[], stories[], achievements[], dailyQuest, lastVisit, and all per-skill data (level, mastery, recent results, streak).

## Architecture

```
anastasia-universe/
├── index.html              # App shell, CSS design system, screen containers
├── build.sh                # Concatenates everything into dist/bundle.html
├── dist/
│   └── bundle.html         # The single-file output Anastasia actually uses
├── src/
│   ├── core/
│   │   ├── state.js        # State management, localStorage, migration
│   │   ├── adaptive.js     # ZPD engine, skill tracking, difficulty calc
│   │   ├── audio.js        # Web Audio API sound effects
│   │   └── utils.js        # Helpers: rand, pick, shuffle, clamp
│   ├── ui/
│   │   ├── navigation.js   # Screen management, routing
│   │   ├── topbar.js       # Token/streak/level display
│   │   ├── home.js         # Home screen, Lumi companion, daily quest
│   │   ├── feedback.js     # Correct/wrong overlays, particles, metacognition
│   │   └── garden.js       # Garden renderer
│   ├── math/
│   │   ├── math-tree.js    # Skill tree definition + unlock logic
│   │   ├── math-gen.js     # Question generators for all 28 skills
│   │   └── math-render.js  # Interactive renderers (ten frames, number bonds, bar models, etc.)
│   ├── word/
│   │   ├── word-tree.js    # Skill tree definition
│   │   ├── word-gen.js     # Question generators
│   │   ├── word-render.js  # Renderers (sentence builder, spelling, etc.)
│   │   └── word-data.js    # CVC families, sight words, vocab, story prompts
│   ├── stem/
│   │   ├── stem-tree.js    # Science + coding skill tree
│   │   ├── science-gen.js  # Science question generators
│   │   ├── science-sim.js  # Interactive simulations (circuits, forces, life cycles)
│   │   ├── code-engine.js  # Coding playground (grid, block programming, interpreter)
│   │   └── code-levels.js  # Coding puzzle level data
│   ├── challenges/
│   │   ├── star-trials.js  # Synoptic assessments
│   │   └── escape-rooms.js # Escape room engine + room definitions
│   └── data/
│       ├── encouragements.js
│       └── wotd.js         # Word of the Day bank
├── PROJECT_BRIEF.md        # This file
└── README.md
```

## Feature Specifications

### 1. Number World — Full P1–P4 Skill Tree (28 skills)

Skills auto-unlock when all dependencies reach ≥40% mastery. The UI only shows unlocked skills prominently; locked ones are dimmed with "master X first" text.

#### P1 (Foundation)
- **Counting & Ten Frames**: Interactive ten-frame grids (click to fill/empty). Count objects displayed as emoji groups
- **Number Bonds**: Visual bond diagram (circle at top = whole, two circles at bottom = parts). One part is missing. At concrete level, show objects to count
- **Addition**: CPA journey — concrete (grouped emoji objects), pictorial (bar models showing parts and whole), abstract (type the answer)
- **Subtraction**: CPA journey — concrete (objects with crossed-out items), pictorial (bar models), abstract
- **Comparing Numbers**: Concrete (stacked objects), abstract (> < symbols)
- **Patterns**: Shape/emoji repeating patterns AND number sequences (find the rule)
- **Word Problems**: Story problems with bar model scaffolding at concrete/pictorial levels. Use Anastasia's name in problems
- **Shapes 2D**: Identify shapes, count sides and corners

#### P2 (Expansion)
- **Addition/Subtraction to 100**: With regrouping. Show place value blocks at concrete level
- **Multiplication**: Times tables 2,3,4,5,10. Concrete = groups of objects. Pictorial = arrays. Abstract = bare equation
- **Division**: Equal sharing and grouping. Concrete = distribute objects. Pictorial = partition diagrams
- **Fractions Basics**: Interactive fraction bars/pies — shade parts, identify fractions
- **Money**: Singapore dollars and cents. Adding prices, making change
- **Time**: Clock face (SVG) with draggable/readable hands. Hours and minutes
- **Picture Graphs**: Read and interpret bar/picture graphs
- **Length & Mass**: Comparing measurements, simple calculations

#### P3 (Deepening)
- **Addition/Subtraction to 10,000**: Column method with regrouping visualization
- **Advanced Multiplication**: Times tables 6-9, multiplying by 1-digit
- **Division with Remainder**: Show the leftover visually
- **Fraction Addition/Subtraction**: Same denominator, visual bar support
- **Area & Perimeter**: Clickable grid to count squares (area) or trace edges (perimeter)
- **Angles**: Right angles, acute, obtuse. Visual angle explorer
- **Bar Graphs**: Read and interpret with questions

#### P4 (Mastery)
- **Big Numbers**: Place value to 100,000, rounding
- **Multi-digit Operations**: Long multiplication, long division with scaffolding
- **Factors & Multiples**: Factor trees, common factors, LCM
- **Mixed Fractions**: Convert between improper and mixed, equivalence
- **Decimals**: Tenths, hundredths, comparing, simple operations
- **Symmetry**: Interactive — draw/identify lines of symmetry
- **Data Analysis**: Tables, line graphs, averages
- **Multi-step Word Problems**: Complex problems requiring 2-3 operations

### 2. Word World — Expanded (11 skills)

#### Foundation
- **Phonics**: CVC word families (at, an, ig, it, op, ot, ug, en, et, in, un, up). Build words by dragging letters. Match words to families
- **Sight Words**: P1 Singapore high-frequency words across 5 progressive levels. Flash recognition

#### Building
- **Spelling**: Type the word from picture/audio cue. Word family hints
- **Vocabulary**: Rich words (enormous, peculiar, magnificent...) with context sentences. Pick the meaning
- **Sentence Building**: Drag-and-drop word tiles to construct sentences. Includes distractor words. Progressive complexity
- **Comprehension**: Short passages followed by questions. Literal → inferential progression
- **Grammar**: Nouns, verbs, adjectives identification. Subject-verb agreement. Progressive complexity

#### Creative
- **Story Garden**: PROGRESSIVE writing — starts with "complete this sentence" (2 words), grows to "write 2 sentences", then "write a paragraph", then free creative writing. Word suggestion bank. Every submission is "correct" (formative)
- **Paragraph Writing**: Guided paragraph structure — topic sentence, supporting details, conclusion
- **Poetry Corner**: Rhyming words, simple poem structures, syllable counting

#### Daily
- **Word of the Day**: Appears on home screen via Lumi. Tap to learn definition, see it in a sentence, earn 3 stars. Bank of 50+ interesting words

### 3. STEM World

#### Science (aligned to Singapore MOE P3-P4)

Each science topic should have BOTH knowledge questions (MCQ) AND interactive simulations:

- **Life Cycles**: Drag-and-arrange lifecycle stages (butterfly, frog, plant). Animated metamorphosis visualization
- **Plant Systems**: Interactive photosynthesis diagram — tap sun/water/CO2 to see the process. Label plant parts
- **Human Body**: Body system explorer — click organs to learn about them
- **Materials**: Sort materials by properties (drag into categories: transparent/opaque, conductor/insulator, flexible/rigid)
- **Magnets**: Drag magnets near objects — see attract/repel. North/south pole interactions
- **Forces**: Ramp simulation — adjust angle, surface friction, push force, see the object respond. Push/pull demonstrations
- **Energy**: Match energy types to sources. Simple energy transformation chains
- **Electrical Circuits**: FULL circuit builder — drag battery, wires, bulbs, switches onto a board. Circuit completes = bulb lights. Test open vs closed circuits. Series vs parallel (advanced)
- **Water Cycle**: Animated cycle — tap the sun to start evaporation, watch condensation, trigger precipitation. Label each stage

#### Coding Playground (Swift Playgrounds–inspired, progressive)

**Sequences (Level 1)**:
- Grid-based puzzle. Anastasia controls a robot/character on a grid
- Arrow command buttons: ↑ ↓ ← →
- She builds a sequence of commands, then hits "Run" to watch the robot execute them
- Progressive complexity: bigger grids, walls/obstacles, gems to collect along the way
- At least 15 unique levels with increasing difficulty

**Loops (Level 2)**:
- Introduce a "Repeat X times" block that wraps around other commands
- Puzzles designed so brute-force sequences are tediously long but loops make them elegant
- Visual: the repeat block visually groups commands

**Conditionals (Level 3)**:
- "If [condition] then [action] else [action]" blocks
- Grid now has colored tiles — "if on red tile, turn left; if on blue tile, turn right"
- Decision-tree visualization

**Functions (Level 4)**:
- Define a named sequence ("dance" = spin + jump + spin)
- Call it by name. Puzzles require using functions to stay within a command limit

**Debugging (runs alongside from Level 1)**:
- Given pre-written code with a bug. Watch the robot fail. Find and fix the bug
- Builds critical thinking and code reading skills

**Variables (Level 5)**:
- "Let score = 0, score = score + 1" type puzzles
- Visual variable boxes that update as code runs
- Gradually introduces real syntax concepts alongside visual blocks

### 4. Escape Rooms (unlock at garden milestones)

Multi-puzzle narrative experiences that blend skills across all worlds. Each room:
- Has a theme and storyline
- Contains 4-6 puzzles of mixed types (math, word, science, coding logic)
- Has a 5-minute timer (adjustable)
- Completing a room earns 30 stars + a golden trophy flower in the garden

**Room 1: "Lumi's Lost Stars"** (unlocks at 10 flowers)
- Lumi's star friends are trapped! Solve constellation math, navigate a code maze, unscramble star names, answer a science question about the Sun

**Room 2: "The Enchanted Garden"** (unlocks at 20 flowers)
- The garden gate is locked. Multiplication key, photosynthesis knowledge, word puzzle, coding loop challenge

**Room 3: "Circuit Mystery"** (unlocks at 30 flowers)
- The lab is dark. Build a circuit, crack a prime number code, debug a program, decode a word cipher

**Room 4: "The Time Traveller's Riddle"** (unlocks at 40 flowers)
- Clock-reading puzzle, fraction challenge, historical science fact, sequence coding challenge

**Room 5: "Deep Sea Discovery"** (unlocks at 50 flowers)
- Water cycle knowledge, division treasure sharing, comprehension passage about marine life, multi-step coding navigation

### 5. Star Trials (synoptic assessments)

- Unlock when garden reaches milestones (every 10 flowers)
- 10 mixed questions drawn from ALL mastered skills in a world
- Scoring 80%+ earns a golden flower + 15 bonus stars
- These should feel like a celebration, not an exam — Lumi frames it as "Show me how much you've grown!"

### 6. Gamification System

- **Stars (⭐)**: 5 for first-try correct, 3 for second try, 2 if hint used. Bonus for perfect sessions, daily quests, escape rooms
- **Streak (🔥)**: Consecutive correct answers. Celebration at 5, 10, 20
- **Levels**: Sprout (0) → Seedling (50★) → Bloom (150★) → Star (400★) → Supernova (1000★) → Galaxy (2500★)
- **Lumi**: Animated star companion on home screen. Time-of-day greetings. Random encouraging messages. Celebrates milestones
- **Daily Quest**: Complete 5 challenges = 20 bonus stars
- **Garden**: Visual mastery map. Normal flowers for skill level-ups. Golden flowers for Star Trials and Escape Rooms. Should feel like a living, growing achievement wall
- **Word of the Day**: Learn a new word, earn 3 stars

### 7. Design System

- **Theme**: Deep space / cosmic — dark purple-blue background with starfield, glowing elements
- **Fonts**: Fredoka (display/headings), Quicksand (body), Patrick Hand (handwritten/story elements)
- **Colors**: Gold (#ffd700), Coral (#ff7b7b), Mint (#7bffb5), Lavender (#b57bff), Sky (#7bb3ff), Teal (#7bffe0)
- **Animations**: Pop-in for new elements, float for Lumi, celebrate for correct answers, shake for wrong, particle bursts for achievements
- **Sound**: Web Audio API — chimes for correct, gentle tone for wrong, fanfare for level-ups, coin sound for tokens
- **Tone**: Warm, encouraging, never punitive. Mistakes = "your brain is growing stronger"

### 8. Build System

The `build.sh` script should:
1. Concatenate all JS modules in dependency order
2. Inline all JS into the HTML file
3. Output a single `dist/bundle.html` that works offline from `file://`
4. Preserve all CSS (either inline or in `<style>` tags)

## What to Build First

1. **Core infrastructure**: state.js, adaptive.js, utils.js, audio.js, navigation.js, home.js, feedback.js
2. **Math module**: Full P1-P4 with proper CPA renderers for every skill
3. **Coding playground**: The interactive grid-based programming environment
4. **Science simulations**: Circuit builder, forces sim, life cycles, water cycle
5. **Word module**: Expanded with comprehension, grammar, progressive story writing
6. **Escape rooms**: 5 themed rooms with mixed-skill puzzles
7. **Build script**: Bundle everything into single HTML
8. **Test the migration**: Ensure v1 localStorage data carries over perfectly

## About the Learner

Anastasia is in early P1 in Singapore. She progresses fast, demonstrates high fluency, catches things quickly, but is not intrinsically motivated to do "school work." The app must:
- Never feel like homework
- Surprise and delight her
- Let her feel autonomous (she chooses what to explore)
- Challenge her just enough to trigger flow state
- Make the Olympiad-level thinking feel like games, not tests
- Build her disposition for learning as much as her knowledge and skills