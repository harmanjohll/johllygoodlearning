# Writing a GeoGames game

A game is a plain object with the members below, default-exported from a module
in this directory and added to the list in `index.js`. It knows nothing about
players, turns, scoring, the clock or the steal rule — the shell owns all of
that, so a game only has to build questions and draw one.

```js
export default {
  id: 'my-game',            // unique, kebab-case, used in the URL hash
  title: 'My Game',
  emoji: '🎲',
  accent: '#4cc9f0',        // one colour, inherited as --accent by the screen
  category: 'Facts',
  blurb: 'One line for the game card on the home screen.',
  howTo: 'One or two sentences shown on the setup screen.',
  timeLimitMs: 15000,       // per question; omit or null for untimed
  scoring: undefined,       // 'accuracy' for distance-style partial credit
  needsShapes: false,       // true if it draws a map or an outline

  build(ctx) { ... },       // -> array of question objects
  render(host, q, api) { ... },   // -> handle (see below)
  factFor(q) { return '...' },    // the line under the feedback headline
};
```

## build(ctx)

`ctx` is `{ rnd, config, countries, shapes, pool }`.

- `rnd` is a **seeded** generator. Use it for every random choice, never
  `Math.random`, or the daily challenge will differ between devices and a
  reported bug will not reproduce.
- `config` is `{ difficulty, region, rounds, timer, steal }`.
- Filter the country list with `buildPool(countries, config, require)` from
  `engine/session.js` rather than filtering by hand, so difficulty and region
  mean the same thing in every game. `require` is an optional predicate for
  what your game needs — a land border, a drawable outline, a capital.
- Return **at most** `config.rounds` questions. Returning fewer is fine;
  returning none makes the shell tell the player the combination was too narrow.

Give each question `iso` (or `isos` for several) so per-country accuracy gets
recorded. Give it `opts` if it is multiple choice, which is what lets the shell
offer a steal.

## render(host, q, api)

Append your question to `host`. `api` is:

| member | what it is |
| --- | --- |
| `api.submit(result)` | call exactly once when the player answers |
| `api.onCleanup(fn)` | register teardown, e.g. `globe.destroy()` |
| `api.shapes`, `api.countries`, `api.byIso` | the data |
| `api.config`, `api.player`, `api.index`, `api.total` | the run |

`result` is `{ correct, picked?, accuracy?, detail? }`. `accuracy` is only read
when the game sets `scoring: 'accuracy'`.

Return a **handle**. Every member is optional:

| member | when the shell calls it |
| --- | --- |
| `keys(e)` | on every keydown while the question is live |
| `timeout()` | when the clock expires with no answer |
| `reveal()` | when it is time to show the true answer |
| `items`, `render`, `idOf`, `correctId` | to redraw the options in a steal |
| `settled` | getter, true once answered |

`optionGrid()` in `_common.js` returns a conforming handle already, so most
games can just return it.

## Why reveal() is separate from the pick

In a party game a miss may pass to the next player. If the grid ticked the
right answer the moment the first player was wrong, the steal would be free.
So `optionGrid` marks only the wrong pick, and the shell calls `reveal()` once
it knows nobody else is going to answer. If you write a bespoke handle, keep
that split.

## Distractors

Wrong answers are most of the work. `distractors()` in `_common.js` prefers
the same subregion, then the same region, then anywhere, and always keeps one
option from further afield so the answer is not simply the geographic odd one
out. Pass `{ score: nameSimilarity }` when lookalike names are the real trap.

Offering Brazil, Chad, Norway and Japan for a South American flag is not a
question, it is a colour test.
