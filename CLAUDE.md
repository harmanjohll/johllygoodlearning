# CLAUDE.md
# Singapore Primary Science Lab — AL1 Upgrade
# Build contract for Claude Code

Repo: `harmanjohll/johllygoodlearning` (public)
Pages path: `/lab/`
Live site: https://harmanjohll.github.io/johllygoodlearning/lab/index.html
Owner: Harman Johll
Primary learner: Alexey Mikhail Johll, age 14, P6, aiming for AL1 at PSLE
AI provider: Google Gemini (user supplies own key via the existing Set Up AI Quizzes flow)

---

## 1. Read this file fully before every session

This file is the complete specification for the next four phases of work on the Singapore Primary Science Lab. It describes the current state, the target state, the pedagogical foundations, the architecture, the four phases with acceptance gates, and the voice and ethics of the system.

Re-read before every new session. Do not skim. The earlier sections set the constraints that later sections assume.

---

## 2. The student

Alexey is a bright, curious fourteen year old in Primary 6 in Singapore. He enjoys football and astronomy. He has strong computational intuition but struggles to:

- Hold scientific concepts precisely in his own words
- Write definitions that match the PSLE register
- Answer open ended questions with the causal completeness, scientific vocabulary, and question architecture literacy that AL1 requires
- Consolidate fragmented knowledge into transferable schemas
- Study consistently without external scaffolding

The platform exists to move him from "sort of knows" to AL1, and to do so in a way that protects his wellbeing and builds durable habits of mind.

---

## 3. Mission

Make the Singapore Primary Science Lab the best single platform for a P5 or P6 student aiming at AL1 in PSLE Science. Serve the whole learner, not only the cognitive surface. Combine content, coaching, cross topic integration, and behavioural scaffolding into one coherent experience.

---

## 4. Current state (as of this brief)

The Lab is already mature. Do not rebuild it. Extend it.

### 4.1 Hub (`/lab/index.html`)
- Five theme cards: Diversity, Cycles, Systems, Interactions, Energy
- Summary stats: Topics, Simulations, Overall mastery percentage, Mind Maps saved
- Study streak widget
- Mastery meter across all topics
- Start Learning CTA (currently hardcoded to circuits)
- Footer strip listing features: Cornell Notes, Interactive Simulations, Mind Maps, Mastery Quizzes, AI Quizzes, Synoptic Assessment
- Navigation out to cross topic modes

### 4.2 Topic pages (`/lab/topics/<topic>/index.html`)
Each topic page has:
- Theme and level tags (e.g. Systems, P5, P6)
- Per topic mastery indicator
- Four mode tabs: Learn, Simulate, Quiz, Mind Map
- Key Questions block (inductive entry point)
- Full glossary with precise definitions
- Learn content with structured prose and diagrams
- Summary block
- Observe and Infer prompts (for simulations)
- Interactive simulation (topic specific; circuits has ammeter readings, conductor test, circuit builder, Ohm's Law)
- PSLE Tip block with the C-E-R framework (Claim, Evidence, Reasoning)
- Per topic concept map builder with add, connect, delete, reset, relayout, load, save, and "Check My Map" AI button

### 4.3 Cross topic modes
- `/lab/assess/` — Synoptic Assessment (Synoptic, PSLE Practice with 45 minute timer, Topic Drill; multiple choice and open ended; AI generated)
- `/lab/explain/` — Explain It Back (Feynman Technique, Gemini graded, returns Strengths, Gaps, Keywords)
- `/lab/structured/` — Structured Answer Builder (PSLE open ended with C-E-R scaffold, marked by Gemini 2.5 Flash, examiner style feedback, model answers)
- `/lab/commands/` — Command Words (describe, explain, infer, predict, suggest, compare)
- `/lab/flashcards/` — Flashcards
- `/lab/vocab/` — Vocab Drill
- `/lab/diagrams/` — Label Diagrams
- `/lab/psle-tips/` — PSLE Tips
- "Set Up AI Quizzes" — Gemini key management (store in localStorage)

### 4.4 Pattern to confirm in Phase 1
- Whether topic content is embedded inline in each topic HTML or extracted to a shared data module
- Whether progress state is one localStorage key or many
- Whether Gemini key management is centralised or per page
- Whether the glossary is per topic only or also global

---

## 5. The AL1 thesis (drives every feature choice)

The gap between "sort of knows" and AL1 is not about knowing more. It is about knowing more precisely, more causally, and more structurally. Four things separate AL1 from AL3 in PSLE Science:

1. **Scientific language discipline.** Fuzzy verbs ("makes", "gets", "changes") become precise scientific terms ("photosynthesises", "absorbs", "condenses").
2. **Causal completeness.** AL3 answers state A and C; AL1 answers explain the mechanism B that connects them.
3. **Question architecture literacy.** The student decodes whether a stem asks them to describe, explain, infer, predict, suggest, or compare, and structures accordingly.
4. **Transfer.** Novel scenarios do not rattle them, because they have internalised the principle, not the example.

Every cognitive feature in the platform should serve one or more of these four.

---

## 6. The whole learner thesis

Most students who stall at AL2 or AL3 are cognitively capable. What they lack is consistency, self regulation, the ability to study when they do not feel like it, the wisdom to stop when they are spent, and the strategy sense to know what to do next.

We address this through three layers wrapping the cognitive tools:

### 6.1 The Compass (session opener)
Greets the student, reads their state with one short question, proposes a session length and focus calibrated to that state and to the spaced repetition queue, and invites an implementation intention ("in the next 20 minutes I will complete two Answer Trainer questions on Energy"). Handles streaks humanely, with rest days built in.

### 6.2 The Coach (cross mode companion)
The Gemini companion that probes, marks, and encourages across every mode. Praises strategy over ability. Calls out what is close, not what is wrong. Offers study strategies on demand. Its tone is defined in section 12 of this file.

### 6.3 The Mirror (honest progress dashboard)
Replaces the single mastery percentage with a short, true story: what has been consolidated, what is on the edge of memory and needs surfacing, where time has gone, whether that matches where he is weakest, and the trajectory over time. Effort has its own track, separate from performance.

---

## 7. Pedagogical foundations

The following research traditions are named because the platform should implement an informed version of them, not a generic "study app" skin.

- **Tiny habits and anchoring (BJ Fogg).** Small, reliable behaviours anchored to existing routines beat grand plans.
- **Context over willpower (Wendy Wood).** Habits live in environments; design the cues.
- **Never miss twice (James Clear).** Missing one day is noise; missing two begins the end.
- **Flow and challenge matching (Mihaly Csikszentmihalyi).** Keep difficulty just above comfortable; below that, boredom; above that, anxiety.
- **Desirable difficulty, spacing, interleaving, retrieval (Robert Bjork).** What feels slow is often the most durable. Rereading is a weak study strategy; retrieval is strong.
- **Self determination (Edward Deci and Richard Ryan).** Autonomy, competence, relatedness are the three fuels of intrinsic motivation.
- **Growth mindset (Carol Dweck).** Praise strategy and effort, not traits.
- **The progress principle (Teresa Amabile).** Small wins that are seen and acknowledged sustain motivation.
- **Implementation intentions (Peter Gollwitzer).** "When X happens, I will do Y" roughly doubles follow through.
- **Defaults (Richard Thaler and Cass Sunstein).** Most people take the path of least resistance; design defaults that serve them.
- **Present bias (Daniel Kahneman).** Future benefits are discounted steeply; make today's session feel proximate and concrete.
- **Sleep, light, rest (Matthew Walker, Andrew Huberman).** Non negotiable inputs to memory consolidation and mood.
- **Stress reframing (Kelly McGonigal).** Stress is a feature, not a bug, when reframed as mobilisation.
- **Feynman technique.** Explain it simply, notice where you cannot, go back and fill the gap.

See section 18 for a short citable primer embedded in this file.

---

## 8. Architectural decisions

### 8.1 Stack
- Vanilla HTML, CSS, JavaScript. No build step unless unavoidable.
- One shared CSS file at `/lab/shared/lab.css`. New work uses this. Migrate existing inline CSS into it in Phase 1.
- One shared JS module at `/lab/shared/lab.js` for utilities (state, storage, Gemini wrapper, coach prompt builder).
- D3.js (via CDN) for the mega concept map. Deterministic layout, not force directed.
- No framework. No bundler. This must remain a static site deployable to GitHub Pages.

### 8.2 Data model (canonical)
Introduce a shared content module at `/lab/shared/content.js` (or `content.json` loaded at runtime). All topic content sources from here. Topic HTML pages become thin shells that render from this data.

Minimum schema:

```
content = {
  themes: {
    diversity: { id, name, tagline, colour, topics: [...] },
    cycles:    { ... },
    systems:   { ... },
    interactions: { ... },
    energy:    { ... },
  },
  topics: {
    circuits: {
      id, title, themes: [...], levels: ["P5","P6"],
      keyQuestions: [...],
      keyIdeas: [...],           // NEW: AL1 distilled ideas (7-9 per topic)
      glossary: [{term, definition, template}],
      learnHTML: "...",          // existing prose
      summaryHTML: "...",
      simulation: { /* topic-specific */ },
      pslePrompts: [...],        // C-E-R tips
      questions: [{              // open ended items, used by Structured Answer Builder + Coach Mode
        id, stem, marks, commandWord,
        modelAnswer, markScheme,
        themesCovered: [...]     // supports synoptic filtering
      }],
      phenomena: [...]           // NEW: concrete observations for the mega map
    },
    // ... for all 16 or so topics
  },
  mega: {
    nodes: [...],   // themes, topics, phenomena
    edges: [...]    // typed: is-a | part-of | causes | example-of | links-to
  },
  strategies: [...]  // study strategy library, keyed to modes
}
```

The AL1 content pack (companion file `al1_content_pack.json`) seeds this for P6 content. Phase 1 folds existing content into the same shape.

### 8.3 Progress state
One top level key in localStorage: `jgl.progress`. Structured as:

```
{
  version: 2,
  student: { id, level },
  streak: { current, longest, lastStudiedIso, restDaysUsed },
  terms:     { "topicId:termId": { attempts, mastered, lastSeenIso, nextDueIso } },
  questions: { "questionId": { attempts, bestScore, lastSeenIso, nextDueIso } },
  topics:    { "topicId": { mastery, timeSpentMs, lastOpenedIso } },
  sessions:  [ { startIso, endIso, mode, focus, intention, completed } ],
  effort:    { dailyMinutes: { "2026-04-19": 23, ... } },
  wellbeing: { lastCheckInIso, recentMoodScores: [...] }
}
```

Spaced repetition uses `nextDueIso`, doubling intervals on success (1d, 2d, 4d, 8d, 16d, 30d), resetting to 1d on miss.

### 8.4 File structure
```
/lab/
  index.html                  (hub, refreshed in Phase 4)
  shared/
    lab.css
    lab.js
    content.js                (or content.json)
    content/
      diversity.json
      cycles.json
      systems.json
      interactions.json
      energy.json
    strategies.json
    gemini.js                 (API wrapper)
    coach.js                  (prompt builders for all coach contexts)
    storage.js                (progress state read/write)
    spaced.js                 (SM-2 style scheduler)
  topics/<topic>/index.html   (existing; add Key Ideas tab)
  map/index.html              (NEW: mega concept map)
  compass/index.html          (NEW: session opener, may be inlined in hub)
  mirror/index.html           (NEW: progress story dashboard, may be inlined in hub)
  strategies/index.html       (NEW: study strategies library)
  assess/index.html           (existing)
  explain/index.html          (existing)
  structured/index.html       (existing; add Coach toggle)
  commands/index.html         (existing)
  flashcards/index.html       (existing)
  vocab/index.html            (existing; upgraded with template-based construction)
  diagrams/index.html         (existing)
  psle-tips/index.html        (existing)
```

### 8.5 Routing
Static relative links, same as current pattern. No SPA.

---

## 9. Target navigation after all phases

Hub top level:

1. **Compass** (greeting, session plan, start)
2. **Themes** (existing 5-card grid → topic pages)
3. **Mega Map** (new)
4. **Practice**
   - Synoptic Assessment
   - Structured Answers (Examiner or Coach mode)
   - Explain It Back
   - Vocab Drill (with Definition Gym upgrade)
   - Flashcards
   - Command Words
   - Label Diagrams
5. **Mirror** (progress story)
6. **Strategies** (study strategy library)
7. **PSLE Tips**
8. **Settings** (AI key, preferences)

---

## 10. Phased delivery

Four phases. Each ends with an acceptance gate. Do not start the next phase until the current one is approved.

### Phase 1 — Inventory and data consolidation
**Goal.** Produce a clean, shared content model so the remaining phases build on firm ground. Do not change what the student sees.

**Tasks.**
1. Read every file under `/lab/`. Produce an architecture note (`/docs/architecture.md` in the repo) covering:
   - File inventory with line counts
   - Where topic content currently lives (inline in HTML, shared file, or mixed)
   - How progress is tracked today (localStorage keys in use)
   - How the Gemini key is stored and consumed across modes
   - Any dead or duplicated code
2. Create `/lab/shared/` with `lab.css`, `lab.js`, `storage.js`, `gemini.js`, and `content.js`.
3. Extract the existing topic content from each topic HTML into `/lab/shared/content/<theme>.json`. Do not add or rewrite content at this stage.
4. Migrate each existing topic page to read content from the shared module. HTML pages become thin shells that render from data.
5. Centralise Gemini key management. Create a single settings modal, accessible from every page.
6. Consolidate localStorage into the `jgl.progress` schema defined in section 8.3. Write a one time migration for any existing keys.
7. Add a lightweight router helper in `lab.js` so all pages can link consistently.

**Acceptance gate.**
- Architecture note delivered and approved.
- Site visually identical to before; no regressions.
- Progress state readable via `jgl.progress` in localStorage.
- Gemini key set once, usable everywhere.
- Topic pages render from data, not inline HTML.

### Phase 2 — The Mega Concept Map
**Goal.** Build the single feature most capable of moving Alexey to AL1: a system wide map that reveals the network between topics and themes, traversable both deductively and inductively.

**Tasks.**
1. Seed the mega map data. Populate `content.mega.nodes` and `content.mega.edges` for all five themes, all sixteen topics, and at least four phenomena per topic (80+ phenomena total).
2. Type every edge: `is-a`, `part-of`, `causes`, `example-of`, or `links-to` (reserved for cross theme connections).
3. Build `/lab/map/index.html`. Render the map with D3 using a deterministic radial or hierarchical layout. Themes innermost or top, topics in the second tier, phenomena on the outer tier.
4. Colour nodes by theme. Render cross theme (`links-to`) edges with a distinct style (dashed, slightly curved, faintly brighter).
5. Build two traversal modes, togglable:
   - **Deductive.** Default. Expand from themes outward. Click a theme to fan out its topics; click a topic to fan out its phenomena. Collapsed siblings dim. Currently expanded path is highlighted.
   - **Inductive.** Entered from a phenomenon. Click a phenomenon to trace up: which topic, which theme, which related phenomena across other themes. The upward trace is animated and persistent until reset.
6. Hover behaviour. Hover any node to highlight all connected nodes across the graph. Show a tooltip with the node's short descriptor.
7. Click behaviour. Click a topic node to deep link to the topic page. Click a phenomenon to open a small panel with a scientific explanation and links to the two most relevant topics.
8. Coach integration. When a node is focused, a sidebar Coach panel asks one short probing question calibrated to the direction of travel. Implement the prompt templates in `coach.js`. Log every Coach interaction to a session trace in progress state.
9. Performance budget. Map renders in under 300ms on a 2020 laptop. Under 200 nodes.
10. Responsive. Works on a 1280px laptop and a 768px tablet. Phones can show a simplified list view.

**Acceptance gate.**
- Map data covers all themes, all topics, and at least 80 phenomena.
- Deductive and inductive modes both function.
- Cross theme edges are visually distinct.
- Coach panel probes correctly in each direction.
- Topic nodes deep link correctly.
- Performance budget met.

### Phase 3 — AL1 content and Coach mode
**Goal.** Inject the AL1 content pack. Add a second feedback mode to the Structured Answer Builder so the student can choose Examiner or Coach. Upgrade Vocab Drill with template based construction.

**Tasks.**
1. Ingest `al1_content_pack.json` (companion file shipped with this brief). Merge its P6 content into the shared content module. For each topic:
   - Add the `keyIdeas` array (7-9 numbered ideas in precise AL1 language).
   - Merge the `terms` array (term, template, definition) into the existing glossary, enriching with templates where templates are missing.
   - Merge the `questions` array into the existing question databank, tagged by topic and themesCovered.
2. Add a **Key Ideas** tab to every topic page, alongside Learn, Simulate, Quiz, Mind Map. Renders the keyIdeas array as numbered prose with generous whitespace. Includes a "Say it back" button that unlocks the next idea only after a successful recall attempt (optional spaced repetition integration).
3. Upgrade Vocab Drill. Each term flow becomes:
   - Show term and template (e.g. "A vertebrate that has ___, gives birth to ___...")
   - Student writes their attempt
   - Reveal model definition
   - Self check mastery, or optional Coach check (Gemini reviews the attempt and returns Strengths and Gaps, no score)
4. Add **Coach mode** toggle to Structured Answer Builder. Default remains Examiner. Coach mode:
   - Takes the student's draft
   - Never reveals the model answer
   - Replies with a single probing question calibrated to the gap between the draft and the model
   - Allows back and forth until the student marks "I have nailed this one", at which point the model answer is offered for comparison, not as a correction
   - Uses the Coach voice from section 12
5. Track the student's Coach vs Examiner preference in progress state so the default adapts over time (if the student switches mode three times, the default follows).

**Acceptance gate.**
- All P6 key ideas, terms, and questions from the content pack are live in the shared module.
- Key Ideas tab present on every topic page.
- Vocab Drill includes template based construction step.
- Structured Answer Builder offers both Examiner and Coach modes.
- Coach never reveals the model answer unprompted.

### Phase 4 — The behavioural layer (Compass, Coach, Mirror)
**Goal.** Serve the whole learner. Add the Compass, integrate the Coach across the platform, replace the mastery meter with the Mirror, introduce the behavioural features, and give the hub a visual refresh.

**Tasks.**

**4A. Compass (session opener).**
- Greet Alexey by name and by time of day.
- Ask one short wellbeing question per session ("How are you feeling about studying right now?" on a 5 point scale: drained, low, okay, good, strong).
- Propose a session length based on state:
  - drained/low → 15 minutes, gentle mode (revision of mastered content)
  - okay → 20 minutes, balanced
  - good/strong → 25 minutes, stretch (new material or synoptic)
- Propose focus based on spaced repetition queue and mega map gaps.
- Invite an implementation intention. Student completes the template: "In the next ___ minutes I will ___ on ___."
- Rest day handling: after five consecutive days, the Compass proactively offers a rest day and explains why ("Consolidation happens during rest"). A rest day does not break the streak.
- "Never miss twice" gentle nudge after any missed day.

**4B. Coach (cross mode).**
- `coach.js` exports prompt builders for each context: map, vocab, structured answer, explain it back, synoptic, key ideas.
- Shared Coach principles and voice guidelines (section 12) live in one constant and are prepended to every prompt.
- Coach respects the student's current state from the Compass. If Alexey marked "drained", the Coach opens with "This is a lot. Want to start with something you have already mastered?" before diving in.

**4C. Mirror (progress story).**
Replace the single mastery percentage on the hub with four tiles:
1. **Consolidated.** Count of terms, questions, and key ideas that have been mastered and stayed mastered through at least one spaced repetition cycle.
2. **On the edge.** Count of items due for review today, with a CTA to surface them.
3. **Where your time is going.** A small stacked bar showing hours by theme over the past seven days, alongside a weakest theme tag. If theme time does not match theme weakness, a gentle line: "You have spent more time on Cycles than Forces. Forces is where the marks are."
4. **Effort.** A calendar heatmap of minutes studied per day over the last 28 days. Effort is its own story, independent of performance. On a hard day, showing up is enough.

**4D. Pomodoro timer.**
Accessible from Compass and from every practice mode. Default 25 on, 5 off, auto-advance. A 3 minute warning before each break. Breaks suggest standing, hydrating, looking at something 20 feet away.

**4E. Spaced repetition.**
Implemented in `spaced.js`. SM-2 style scheduler. Terms, questions, and key ideas are all schedulable. The Compass's "On the edge" surfaces due items; the student can also drill manually from Flashcards.

**4F. Adaptive difficulty.**
Synoptic Assessment and the Answer Trainer widen or narrow difficulty based on rolling performance. Target 70-80% success rate. Too low → regress to a recently mastered item. Too high → push to harder.

**4G. Metacognitive prompts.**
- Before any mode, one question: "How confident are you, 1 to 5?"
- After any mode, one question: "In one sentence, what did you learn?"
- Both saved to session trace.

**4H. Strategy library (`/lab/strategies/`).**
A readable page of study strategies written for a fourteen year old, keyed to modes in the app. Examples:
- "Feynman it: go to Explain It Back and teach the concept in your own words."
- "Interleave: do not spend a whole session on one topic. Mix two or three per session."
- "Retrieve, don't reread: set the Cornell Notes aside and write what you can recall before checking."
- "Space it: today, tomorrow, day after, in four days, in a week. The app will surface it for you."
- "Sleep on it: eight hours tonight does more for tomorrow's recall than one more hour now."
Each strategy has a one click "Try this now" button that opens the relevant mode with the right pre-fill.

**4I. Parent digest (opt in).**
Weekly, emailed or exported as a copyable text block. Content:
- Minutes studied this week
- Topics covered
- One thing that clicked
- One thing that is still hard
- A suggested conversation starter
Framed as a bridge, not surveillance. Alexey sees the digest before it goes anywhere.

**4J. Visual refresh.**
Hub gets a calmer, more honest design. Less emoji ornament; keep theme icons where they aid recognition. Typography: Fraunces for display, Inter Tight or DM Sans for body, IBM Plex Mono for monospace. Colour palette stays theme-aligned (one per theme, desaturated) against a warm off-white. Study streak and mastery are less gamified and more diaristic.

**Acceptance gate.**
- Compass guides every session.
- Mirror replaces the single mastery percentage.
- Pomodoro, spaced repetition, adaptive difficulty, metacognitive prompts all live.
- Strategy library present and linked from every mode's empty state.
- Parent digest generated weekly on demand, opt in only.
- Visual refresh shipped on hub; topic pages receive at minimum the new colour and typography tokens.

---

## 11. The Gemini integration pattern

### 11.1 Key storage
User enters their Gemini API key once, through the Settings modal. Stored in localStorage under `jgl.geminiKey`. Never leaves the browser. Every mode reads from this single key.

### 11.2 Model
Default `gemini-2.5-flash` for speed and cost. Expose a setting for `gemini-2.5-pro` for users who prefer quality over speed.

### 11.3 Fetch wrapper
In `gemini.js`:

```javascript
export async function askGemini({ system, messages, temperature = 0.6, maxTokens = 800, model = 'gemini-2.5-flash' }) {
  const key = localStorage.getItem('jgl.geminiKey');
  if (!key) throw new Error('No Gemini key set. Open Settings to add one.');
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;
  const body = {
    systemInstruction: system ? { parts: [{ text: system }] } : undefined,
    contents: messages.map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    })),
    generationConfig: {
      temperature,
      maxOutputTokens: maxTokens,
    },
    safetySettings: [
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_ONLY_HIGH' },
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_ONLY_HIGH' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_ONLY_HIGH' },
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_ONLY_HIGH' },
    ],
  };
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Gemini error: ${res.status}`);
  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
}
```

### 11.4 Error handling
- Missing key → prompt the user to open Settings.
- Network error → retry once with backoff; if still failing, show a calm message, never a red panic.
- Safety block → ask the student to rephrase; log so we can spot false positives.
- Rate limit → inform the student, offer to wait, suggest a shorter input.

### 11.5 Token discipline
Cap student input to 1500 characters for structured answers, 500 for vocab definitions, 200 per turn in Coach dialogues. Cap model replies to 800 tokens. Keep system prompts under 1500 tokens.

---

## 12. The Coach voice

This voice is used in every AI mediated exchange: Mega Map coaching, Vocab Coach, Structured Answer Coach mode, Explain It Back, Synoptic probing.

### 12.1 Principles
- **Warm and professional.** A very good tutor. Not a friend. Not a fan. Not a coach in the sports sense.
- **Specific.** Praise strategy, not traits. "You used C-E-R to structure that." Not "great job."
- **Honest.** Say what is missing. Never fake cheer.
- **One probe at a time.** Two to four sentences. One question, not three.
- **Causal first.** When a chain is broken, ask what connects A to C before anything else.
- **Precise language.** Mirror the student's fuzzy word back and ask for the scientific term.
- **Scaffold, do not solve.** After two or three probes on the same gap, offer a small hint, not the answer.
- **Never reveal the model unprompted.** The student opts in to see it.

### 12.2 Voice guardrails
- No emoji in Coach replies. Emoji live in UI, not in speech.
- No "Great job!" or "Wonderful!" openers. Specific praise or direct probe.
- No hyphens or em dashes in replies. Commas, semicolons, colons.
- No "I" statements of feeling from the Coach ("I am excited for you"). Keep focus on the student.
- No patronising scaffolds ("Let me think about this for you"). The Coach probes; it does not think for the student.

### 12.3 Worked example (Structured Answer Coach mode)

Question: *"When Alexey comes out of a swimming pool on a hot day, he feels cold even though the air is warm. Explain why."*

Student draft: *"The water on his skin makes him cold."*

Bad Coach reply: "Great start! Can you tell me more?"

Good Coach reply: "You have the right observation, the water on his skin matters. What is the scientific name for the process by which water on his skin turns into water vapour?"

Student: *"Evaporation."*

Good Coach reply: "Yes. Evaporation takes something from his skin in order to happen. What does it take?"

Student: *"Heat."*

Good Coach reply: "That is the causal link. Now put it together in one sentence that starts with the water on his skin and ends with Alexey feeling cold."

### 12.4 Compass voice
The Compass is slightly warmer than the Coach. It is the concierge, not the tutor. Brief, calm, affirming. A single sentence for state check in; a short proposal; an invitation to commit.

### 12.5 Mirror voice
The Mirror is the honest friend. Neutral. Factual. No cheerleading, no doom. "You studied 142 minutes this week. That is your strongest week this month." "Forces is still your weakest theme by 14 percentage points. Try a Synoptic on Forces and Energy tomorrow."

---

## 13. Ethics and protect list

### 13.1 Things that are never OK
- Dark patterns. No fake urgency, no "if you leave you lose your streak" guilt, no variable reward schedules designed to hook.
- Fake empathy. The Coach does not claim to feel things.
- Surveillance. The parent digest is opt in, opens with Alexey's consent, and Alexey sees it first.
- Data exfiltration. Everything stays in localStorage; no server is introduced.
- Misrepresenting AI marks as examiner marks. The Structured Answer Builder already makes this clear; preserve that framing.

### 13.2 Protect list (do not touch without explicit instruction)
- The existing topic content and glossary entries. Extend, do not overwrite.
- The Circuit Builder simulation, the Conductor Test, and the Ohm's Law simulator on `/topics/circuits/`. These are working well.
- The Check My Map AI button on topic level concept maps.
- The 45 minute Paper 1 timer in Synoptic Assessment.
- The C-E-R scaffold text in Structured Answer Builder.
- The emoji theme icons on the hub (they aid recognition). Reduce emoji ornament elsewhere.

### 13.3 Content guardrails
If Alexey's writing ever indicates distress, the Coach does not diagnose. It responds once, briefly, with a suggestion to speak to a trusted adult, and invites him to pause the session. Log the trigger. This is a rare path but must be present.

---

## 14. Knowledge bases to ingest or align with

1. **MOE Primary Science Syllabus 2023.** Canonical content boundary. Everything taught must sit inside this scope.
2. **SEAB examiner reports (recent years).** Where students lose marks and what examiners reward. Use to refine model answers and Coach probes.
3. **Past PSLE Science papers.** Calibration for question style, stem wording, and expected answer length.
4. **Primary Science common misconceptions literature.** So Coach probes target real errors, not generic ones. Good sources: Driver's *Making Sense of Secondary Science* and MOE teacher notes.
5. **Behavioural research primer (embedded in section 18).** So Claude Code implements an informed version.
6. **Harman's own library (optional).** If Harman supplies any of: past papers, assessment books, teacher notes, tuition worksheets, ingest them into `/content/source/` and adapt question style accordingly.

If any of the above is missing, do not invent. Flag honestly in the architecture note and in session updates.

---

## 15. Commit, branch, PR conventions

- One feature branch per phase: `phase-1-inventory`, `phase-2-map`, `phase-3-al1`, `phase-4-behavioural`.
- Commit messages: imperative mood, short subject, optional body. `Add shared lab.js with storage, gemini, and router helpers`.
- PR per phase. Title is the phase name. Body lists acceptance gate items with checkboxes.
- Do not merge a phase PR until Harman signs off in writing.
- Keep the `main` branch deployable at all times. GitHub Pages serves `main` directly.

---

## 16. Testing and quality

No framework. Manual testing checklist per phase, written into the PR body:
- Clean localStorage test (new student experience).
- Existing progress test (migrated student experience from Phase 1 onwards).
- Missing key test (Gemini modes behave gracefully).
- Slow network test (loading states, no panic UI).
- Mobile test at 390px wide (iPhone SE class) and 768px tablet.
- Accessibility pass: keyboard navigation, colour contrast, focus rings visible.

---

## 17. Acceptance criteria summary

**Phase 1.** Architecture note delivered. No visual regressions. Shared `content.js` drives topic pages. Single `jgl.progress` key. Central Gemini settings modal.

**Phase 2.** Mega map at `/lab/map/`. All themes, all topics, 80+ phenomena. Deductive and inductive modes. Distinct cross theme edges. Coach sidebar with direction aware prompts. Sub 300ms render under 200 nodes.

**Phase 3.** Key Ideas tab on every topic. Vocab Drill with template construction. Structured Answer Builder offers Coach mode alongside Examiner. AL1 content pack fully ingested.

**Phase 4.** Compass opens every session. Mirror replaces mastery percentage. Pomodoro, spaced repetition, adaptive difficulty, metacognitive prompts all live. Strategy library at `/lab/strategies/`. Parent digest on demand, opt in. Visual refresh on hub.

---

## 18. Research primer (embedded, for direct citation)

### 18.1 Tiny Habits — BJ Fogg (2019)
Behaviour change is easiest when the new habit is small, specific, and anchored to an existing routine. *After I put down my school bag, I will open the Compass.* Start tiny. Celebrate immediately to wire in the feeling.

### 18.2 Good Habits, Bad Habits — Wendy Wood (2019)
Habits are not driven by willpower but by context. To change behaviour, change cues and friction. The Compass reduces the friction of starting; the Mirror raises the reward salience of showing up.

### 18.3 Atomic Habits — James Clear (2018)
Systems beat goals. Never miss twice. Make it obvious, attractive, easy, satisfying. Identity follows repeated action. Use the two minute rule when starting a session that feels hard.

### 18.4 Flow — Csikszentmihalyi (1990)
Engagement is highest when perceived challenge matches perceived skill. Below that: boredom; above: anxiety. Adaptive difficulty must keep the student at the edge, not over it.

### 18.5 Desirable difficulty — Robert and Elizabeth Bjork (1994 onwards)
What feels slow is often the most durable: spaced practice over massed, interleaving over blocked, testing over rereading. The cost of fluency is often retention.

### 18.6 Self Determination Theory — Deci and Ryan (2000)
Intrinsic motivation rests on three needs: autonomy (the student chooses), competence (the student improves), relatedness (the student feels seen). The Coach's specific praise serves competence; the Compass's choice options serve autonomy; the parent digest, used well, serves relatedness.

### 18.7 Mindset — Carol Dweck (2006)
Praise strategy and effort, not ability or traits. "You used C-E-R" beats "you're smart." Growth framing protects effort on hard days.

### 18.8 The Progress Principle — Teresa Amabile and Steven Kramer (2011)
Small wins that are noticed are the single strongest daily motivator. The Mirror's "Consolidated" count makes progress visible.

### 18.9 Implementation Intentions — Peter Gollwitzer (1999)
"When situation X arises, I will perform response Y." Roughly doubles follow through in studies. The Compass's intention prompt is exactly this.

### 18.10 Nudge — Thaler and Sunstein (2008)
Defaults determine outcomes more than preferences do. Design the default path so that the lazy choice is the good choice.

### 18.11 Thinking, Fast and Slow — Kahneman (2011)
Present bias discounts future benefit steeply. Counteract by making today's reward concrete: the Mirror's daily effort block, the streak, the finished session summary.

### 18.12 Why We Sleep — Matthew Walker (2017)
Sleep is when learning consolidates. A tired brain learns poorly and remembers worse. The Compass respects this; the Strategy library teaches it.

### 18.13 The Upside of Stress — Kelly McGonigal (2015)
Stress can be reframed as mobilisation. Taught correctly, the physiology of stress can become a tool. The Coach's pre session check in normalises difficult feelings without pathologising them.

### 18.14 Feynman technique
If you cannot explain it simply, you do not understand it. The Explain It Back mode is the direct implementation; the Coach uses it implicitly by asking for "one sentence" versions.

---

## 19. End notes

Keep this file alive. Every major decision that affects the platform's behaviour goes in here, with a date. Every new phase begins with Claude Code re-reading the whole file. Disagreements with anything in this file are surfaced to Harman as a question, not resolved silently.

The student this serves is real. Build accordingly.

*Last updated: 19 April 2026*
*Author: Harman Johll, with Claude (Anthropic)*
*Non Vi Sed Arte*
