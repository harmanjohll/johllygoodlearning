// ============================================================
//  MATHS TRICKS — the scaffolding that turns "work it out" into
//  "I know a way to do this".
//
//  Three tiers, so a six year old is never shown a Trachtenberg rule
//  before she can make ten:
//
//    starter  — P1. Counting, bonds, doubles, make-ten.
//    builder  — P2/P3. Times-table strategies, x10 place value.
//    master   — Trachtenberg and the show-off tricks. Stretch material,
//               genuinely reachable, and clearly marked as extra.
//
//  Every trick carries: the idea in one line, WHY it works (never
//  "just because"), a concrete visual model, worked examples, and a
//  one-tap route into practising it.
//
//  Accuracy rule for this file: any trick that makes an arithmetic
//  claim has that claim checked by test/tricks.test.js, which runs the
//  trick's own `check` function against ordinary arithmetic across a
//  wide range. A trick that cannot be checked does not ship.
// ============================================================

var TRICK_TIERS = {
  starter: { label: 'Starter Tricks',  blurb: 'The ones that make everything else easier.', colour: '#7bffb5', icon: '🌱' },
  builder: { label: 'Builder Tricks',  blurb: 'Times tables without memorising all of them.', colour: '#ffd166', icon: '🔨' },
  master:  { label: 'Master Tricks',   blurb: 'Real speed-maths. Show these to a grown-up.', colour: '#b57bff', icon: '🎩' }
};

var MATH_TRICKS = [

  // ============================================================
  //  STARTER — P1
  // ============================================================
  {
    id: 'bonds-10',
    name: 'Friends of Ten',
    icon: '🤝',
    tier: 'starter',
    skills: ['nbond', 'add', 'sub'],
    oneLiner: 'Two numbers that hold hands to make 10.',
    why: 'Ten is the number our whole counting system is built on. Once the pairs that make ten are automatic, every other calculation gets shorter, because you can always break a number up to reach a ten first.',
    model: 'ten-frame-pair',
    demo: { pairs: [[1,9],[2,8],[3,7],[4,6],[5,5]] },
    steps: [
      { text: 'Fill a ten-frame with 6 counters.', visual: { type: 'tenframe', filled: 6 } },
      { text: 'How many empty holes are left? Count them: 4.', visual: { type: 'tenframe', filled: 6, highlightEmpty: true } },
      { text: 'So 6 and 4 are friends of ten. 6 + 4 = 10.', visual: { type: 'bond', whole: 10, parts: [6, 4] } }
    ],
    examples: ['6 + 4 = 10', '3 + 7 = 10', '8 + 2 = 10'],
    funFact: 'There are only five pairs to learn, because 3+7 and 7+3 are the same pair holding hands the other way round.',
    tryIt: { skillId: 'nbond', config: { rangeKey: 'to-10' } },
    check: function () {
      for (var a = 0; a <= 10; a++) { if (a + (10 - a) !== 10) return false; }
      return true;
    }
  },

  {
    id: 'make-ten',
    name: 'Make Ten First',
    icon: '🔟',
    tier: 'starter',
    skills: ['add', 'add100'],
    oneLiner: 'Fill up to ten, then add what is left.',
    why: 'Adding to ten is easy because ten just changes the tens digit. So you borrow exactly enough from the second number to fill the first one up to ten, then add the rest.',
    model: 'ten-frame-bridge',
    demo: { a: 8, b: 5 },
    steps: [
      { text: 'We want 8 + 5. Put 8 in the frame.', visual: { type: 'tenframe', filled: 8 } },
      { text: 'The frame needs 2 more to be full. Take 2 from the 5.', visual: { type: 'bond', whole: 5, parts: [2, 3] } },
      { text: '8 + 2 = 10. The frame is full.', visual: { type: 'tenframe', filled: 10 } },
      { text: '3 is left over. 10 + 3 = 13.', visual: { type: 'tenframe2', filled: 13 } }
    ],
    examples: ['8 + 5 = 10 + 3 = 13', '9 + 4 = 10 + 3 = 13', '7 + 6 = 10 + 3 = 13'],
    funFact: 'Notice those three all landed on 13. Different pairs, same total, because each one gave up just enough to fill the ten.',
    tryIt: { skillId: 'add', config: { rangeKey: '1-20' } },
    check: function () {
      for (var a = 1; a <= 9; a++) for (var b = 1; b <= 9; b++) {
        var need = 10 - a, rest = b - need;
        if (b >= need && (10 + rest) !== a + b) return false;
      }
      return true;
    }
  },

  {
    id: 'count-on-larger',
    name: 'Start With The Bigger One',
    icon: '🐘',
    tier: 'starter',
    skills: ['add'],
    oneLiner: 'Put the big number in your head, count on the small one.',
    why: 'Adding gives the same answer whichever way round you do it, so you may as well do the easy version. Counting on 2 from 9 takes two hops. Counting on 9 from 2 takes nine, and nine hops is nine chances to lose your place.',
    model: 'number-line-hops',
    demo: { a: 2, b: 9 },
    steps: [
      { text: '2 + 9. Starting at 2 means nine hops. That is a lot of hops.', visual: { type: 'numberline', start: 2, hops: 9, max: 14 } },
      { text: 'Flip it round: 9 + 2. Now it is only two hops.', visual: { type: 'numberline', start: 9, hops: 2, max: 14 } },
      { text: 'Same answer, less work: 11.', visual: { type: 'bond', whole: 11, parts: [9, 2] } }
    ],
    examples: ['2 + 9 → 9 + 2 = 11', '3 + 8 → 8 + 3 = 11', '1 + 7 → 7 + 1 = 8'],
    funFact: 'This is called the commutative law. It works for adding and for times, but NOT for taking away: 9 − 2 and 2 − 9 are very different.',
    tryIt: { skillId: 'add', config: { rangeKey: '1-20' } },
    check: function () {
      for (var a = 0; a <= 20; a++) for (var b = 0; b <= 20; b++) { if (a + b !== b + a) return false; }
      return true;
    }
  },

  {
    id: 'doubles',
    name: 'Doubles And Near Doubles',
    icon: '👯',
    tier: 'starter',
    skills: ['add', 'mul'],
    oneLiner: 'If you know 6 + 6, you nearly know 6 + 7.',
    why: 'Doubles stick in the memory easily because both halves match. Any pair of numbers that are next to each other is just a double with one extra, so one remembered fact unlocks two more.',
    model: 'double-bars',
    demo: { n: 6 },
    steps: [
      { text: '6 + 6 = 12. Two matching bars.', visual: { type: 'doublebar', a: 6, b: 6 } },
      { text: '6 + 7 is the same, with one extra block.', visual: { type: 'doublebar', a: 6, b: 7, extra: true } },
      { text: 'So 6 + 7 = 12 + 1 = 13.', visual: { type: 'bond', whole: 13, parts: [12, 1] } }
    ],
    examples: ['6 + 7 = 12 + 1 = 13', '8 + 9 = 16 + 1 = 17', '4 + 5 = 8 + 1 = 9'],
    funFact: 'Doubles are also the 2 times table wearing a different hat. 7 + 7 and 7 x 2 are the same question.',
    tryIt: { skillId: 'add', config: { rangeKey: '1-20' } },
    check: function () {
      for (var n = 0; n <= 50; n++) { if (n + (n + 1) !== 2 * n + 1) return false; }
      return true;
    }
  },

  {
    id: 'add-nine',
    name: 'Adding 9 The Lazy Way',
    icon: '🦥',
    tier: 'starter',
    skills: ['add', 'add100'],
    oneLiner: 'Add 10, then give one back.',
    why: 'Nine is only one less than ten, and ten is trivial to add because only the tens digit changes. So add the easy number and correct by one.',
    model: 'number-line-overshoot',
    demo: { a: 34 },
    steps: [
      { text: '34 + 9 looks fiddly.', visual: { type: 'numberline', start: 34, hops: 0, max: 46, label: 'start' } },
      { text: 'Add 10 instead. That is just a jump to 44.', visual: { type: 'numberline', start: 34, hops: 10, max: 46, big: true } },
      { text: 'You added one too many. Step back one: 43.', visual: { type: 'numberline', start: 44, hops: -1, max: 46 } }
    ],
    examples: ['34 + 9 = 44 − 1 = 43', '56 + 9 = 66 − 1 = 65', '17 + 9 = 27 − 1 = 26'],
    funFact: 'The same trick works for 8 (add 10, give back 2) and for 19, 29 and 99.',
    tryIt: { skillId: 'add100', config: { rangeKey: 'mixed' } },
    check: function () {
      for (var n = 0; n <= 200; n++) { if (n + 9 !== n + 10 - 1) return false; }
      return true;
    }
  },

  // ============================================================
  //  BUILDER — P2 / P3
  // ============================================================
  {
    id: 'times-ten',
    name: 'The Times Ten Slide',
    icon: '🎢',
    tier: 'builder',
    skills: ['mul', 'money', 'lenmass'],
    oneLiner: 'Every digit slides one place to the left.',
    why: 'This is NOT "add a zero" — that is a lie that breaks the moment you meet decimals. What really happens is that every digit moves one column to the left, so ones become tens and tens become hundreds. The zero appears only because the ones column is now empty.',
    model: 'place-value-slide',
    demo: { n: 7 },
    steps: [
      { text: '7 sits in the ones column.', visual: { type: 'pvslide', n: 7, shifted: false } },
      { text: 'Times ten: the 7 slides left into the tens column.', visual: { type: 'pvslide', n: 7, shifted: true } },
      { text: 'Nothing is left in the ones, so a 0 holds the empty space: 70.', visual: { type: 'pvslide', n: 70, shifted: true, showZero: true } }
    ],
    examples: ['7 x 10 = 70', '43 x 10 = 430', '10 x 10 = 100'],
    funFact: 'Teachers avoid "just add a zero" because 0.5 x 10 is 5, not 0.50. The sliding story keeps working forever; the zero story does not.',
    tryIt: { skillId: 'mul', config: { tables: [10] } },
    check: function () {
      for (var n = 0; n <= 500; n++) { if (n * 10 !== Number(String(n) + '0')) return false; }
      return true;
    }
  },

  {
    id: 'five-is-half-ten',
    name: 'Five Is Half Of Ten',
    icon: '✋',
    tier: 'builder',
    skills: ['mul'],
    oneLiner: 'Times ten, then halve it.',
    why: 'Five is exactly half of ten, so five lots of something is half of ten lots of it. Ten times is the easiest thing in maths, and halving is the second easiest.',
    model: 'halve-bar',
    demo: { n: 8 },
    steps: [
      { text: 'You want 8 x 5. First do the easy one: 8 x 10 = 80.', visual: { type: 'bar', value: 80, label: '8 x 10' } },
      { text: 'Five is half of ten, so halve your answer.', visual: { type: 'barhalf', value: 80 } },
      { text: 'Half of 80 is 40. So 8 x 5 = 40.', visual: { type: 'bar', value: 40, label: '8 x 5' } }
    ],
    examples: ['8 x 5 = 80 ÷ 2 = 40', '6 x 5 = 60 ÷ 2 = 30', '7 x 5 = 70 ÷ 2 = 35'],
    funFact: 'Every answer in the 5 times table ends in 5 or 0, and it alternates. That is a free way to spot a wrong answer.',
    tryIt: { skillId: 'mul', config: { tables: [5] } },
    check: function () {
      for (var n = 0; n <= 200; n++) { if (n * 5 !== (n * 10) / 2) return false; }
      return true;
    }
  },

  {
    id: 'double-double',
    name: 'Double, Double',
    icon: '🐇',
    tier: 'builder',
    skills: ['mul'],
    oneLiner: 'Times four is double, then double again.',
    why: 'Four is two twos, so multiplying by four is multiplying by two twice. Eight is three twos, so it is doubling three times. You only ever need to be good at doubling.',
    model: 'doubling-chain',
    demo: { n: 7 },
    steps: [
      { text: 'Start with 7.', visual: { type: 'chain', values: [7] } },
      { text: 'Double it: 14. That is 7 x 2.', visual: { type: 'chain', values: [7, 14] } },
      { text: 'Double again: 28. That is 7 x 4.', visual: { type: 'chain', values: [7, 14, 28] } },
      { text: 'Once more: 56. That is 7 x 8.', visual: { type: 'chain', values: [7, 14, 28, 56] } }
    ],
    examples: ['7 x 4 = 7 → 14 → 28', '9 x 8 = 9 → 18 → 36 → 72', '6 x 4 = 6 → 12 → 24'],
    funFact: 'The 2, 4 and 8 times tables are one single skill in disguise. Learn to double and you get three tables for free.',
    tryIt: { skillId: 'mul', config: { tables: [2, 4, 8] } },
    check: function () {
      for (var n = 0; n <= 200; n++) {
        if (n * 4 !== n * 2 * 2) return false;
        if (n * 8 !== n * 2 * 2 * 2) return false;
      }
      return true;
    }
  },

  {
    id: 'nine-ten-minus',
    name: 'The Nine Shortcut',
    icon: '9️⃣',
    tier: 'builder',
    skills: ['mul'],
    oneLiner: 'Times ten, then take one lot away.',
    why: 'Nine lots of something is ten lots minus one lot. Since times ten is easy, this turns the hardest-looking table into an easy one followed by a subtraction.',
    model: 'nine-bar',
    demo: { n: 7 },
    steps: [
      { text: '7 x 9. Do 7 x 10 first: 70.', visual: { type: 'bar', value: 70, label: '7 x 10' } },
      { text: 'That is one 7 too many. Take one 7 away.', visual: { type: 'barminus', value: 70, minus: 7 } },
      { text: '70 − 7 = 63. So 7 x 9 = 63.', visual: { type: 'bar', value: 63, label: '7 x 9' } }
    ],
    examples: ['7 x 9 = 70 − 7 = 63', '4 x 9 = 40 − 4 = 36', '8 x 9 = 80 − 8 = 72'],
    funFact: 'Look at the 9 times table: 9, 18, 27, 36, 45... the tens digit climbs by one and the ones digit falls by one, and the two digits ALWAYS add up to 9.',
    tryIt: { skillId: 'mul', config: { tables: [9] } },
    check: function () {
      for (var n = 0; n <= 200; n++) { if (n * 9 !== n * 10 - n) return false; }
      return true;
    }
  },

  {
    id: 'nine-fingers',
    name: 'The Nine Finger Trick',
    icon: '🖐️',
    tier: 'builder',
    skills: ['mul'],
    oneLiner: 'Your hands know the whole 9 times table.',
    why: 'Folding down the nth finger leaves (n−1) fingers on its left and (10−n) on its right. That is exactly the tens and ones of 9 x n, because 9n = 10(n−1) + (10−n).',
    model: 'fingers',
    demo: { n: 7 },
    steps: [
      { text: 'Hold up all ten fingers. For 9 x 7, count to the 7th finger.', visual: { type: 'fingers', fold: 0 } },
      { text: 'Fold that finger down.', visual: { type: 'fingers', fold: 7 } },
      { text: '6 fingers stand to the left, 3 to the right. The answer is 63.', visual: { type: 'fingers', fold: 7, showCount: true } }
    ],
    examples: ['9 x 7 → 6 left, 3 right → 63', '9 x 3 → 2 left, 7 right → 27', '9 x 9 → 8 left, 1 right → 81'],
    funFact: 'It works because 9n is the same as 10(n−1) + (10−n). Your hands are doing real algebra.',
    tryIt: { skillId: 'mul', config: { tables: [9] } },
    check: function () {
      for (var n = 1; n <= 10; n++) {
        var left = n - 1, right = 10 - n;
        if (left * 10 + right !== 9 * n) return false;
      }
      return true;
    }
  },

  {
    id: 'flip-it',
    name: 'Flip It Round',
    icon: '🔄',
    tier: 'builder',
    skills: ['mul', 'div'],
    oneLiner: '3 x 8 and 8 x 3 are the same. Do whichever is easier.',
    why: 'An array of 3 rows of 8 is the same array turned sideways: 8 rows of 3. The number of dots cannot change just because you tilted your head. So you may always take the easier route.',
    model: 'array-rotate',
    demo: { a: 3, b: 8 },
    steps: [
      { text: '3 rows of 8 dots.', visual: { type: 'array', rows: 3, cols: 8 } },
      { text: 'Turn it sideways. Now it is 8 rows of 3.', visual: { type: 'array', rows: 8, cols: 3 } },
      { text: 'Nobody added or removed a dot, so both are 24.', visual: { type: 'array', rows: 3, cols: 8, total: 24 } }
    ],
    examples: ['3 x 8 = 8 x 3 = 24', '2 x 9 = 9 x 2 = 18', '4 x 7 = 7 x 4 = 28'],
    funFact: 'This halves how much you have to learn. Of the 100 facts up to 10 x 10, only 55 are genuinely different — the rest are flips of one you already know.',
    tryIt: { skillId: 'mul', config: { tables: [3, 4, 6, 7, 8] } },
    check: function () {
      for (var a = 0; a <= 12; a++) for (var b = 0; b <= 12; b++) { if (a * b !== b * a) return false; }
      return true;
    }
  },

  // ============================================================
  //  MASTER — Trachtenberg and friends
  // ============================================================
  {
    id: 'eleven-neighbour',
    name: 'Times 11: Add The Neighbour',
    icon: '🏘️',
    tier: 'master',
    trachtenberg: true,
    skills: ['mul'],
    oneLiner: 'Drop the outside digits down, add each pair in the middle.',
    why: 'Multiplying by 11 is multiplying by 10 and then adding one more copy. The times-ten copy is shifted one place left, so when you add the two copies each column ends up holding a digit plus the digit to its right — its neighbour.',
    model: 'neighbour-chain',
    demo: { n: 23 },
    steps: [
      { text: '23 x 11. Write the outside digits down: 2 ... 3.', visual: { type: 'neighbour', n: 23, stage: 'ends' } },
      { text: 'Add the two digits: 2 + 3 = 5. That goes in the middle.', visual: { type: 'neighbour', n: 23, stage: 'sum' } },
      { text: 'The answer is 253.', visual: { type: 'neighbour', n: 23, stage: 'done' } },
      { text: 'If the middle goes over 9, carry it left. 87 x 11: 8 + 7 = 15, so write 5 and carry 1 into the 8, giving 957.', visual: { type: 'neighbour', n: 87, stage: 'carry' } }
    ],
    examples: ['23 x 11 = 253', '61 x 11 = 671', '87 x 11 = 957 (carried)'],
    funFact: 'Trachtenberg worked this out for numbers of ANY length. 123456 x 11 = 1358016, all done by adding neighbours right to left.',
    tryIt: { skillId: 'mul', config: { tables: [11] } },
    check: function () {
      for (var n = 10; n <= 99; n++) {
        var t = Math.floor(n / 10), u = n % 10, mid = t + u;
        var val = mid < 10 ? (t * 100 + mid * 10 + u) : ((t + 1) * 100 + (mid - 10) * 10 + u);
        if (val !== n * 11) return false;
      }
      return true;
    }
  },

  {
    id: 'trach-12',
    name: 'Times 12: Double Plus Neighbour',
    icon: '🎩',
    tier: 'master',
    trachtenberg: true,
    skills: ['mul'],
    oneLiner: 'Double each digit, then add its neighbour.',
    why: 'Twelve is ten plus two. The "double" handles the two, and the "add the neighbour" handles the ten, because the times-ten copy sits one column to the left.',
    model: 'trachtenberg-steps',
    demo: { n: 314, multiplier: 12 },
    steps: [],
    examples: ['314 x 12 = 3768', '23 x 12 = 276', '45 x 12 = 540'],
    funFact: 'Trachtenberg never asks you to learn a times table. Every rule uses only doubling, halving and adding.',
    tryIt: { skillId: 'mul', config: { tables: [12] } },
    check: function () { return _trachCheck(12); }
  },

  {
    id: 'trach-6',
    name: 'Times 6: Add Half The Neighbour',
    icon: '🎩',
    tier: 'master',
    trachtenberg: true,
    skills: ['mul'],
    oneLiner: 'Each digit, plus half its neighbour, plus 5 if the digit is odd.',
    why: 'Six is five plus one. The "plus the digit itself" is the one; "half the neighbour" plus the odd-number correction is a neat way of doing the five, because five is half of ten.',
    model: 'trachtenberg-steps',
    demo: { n: 357, multiplier: 6 },
    steps: [],
    examples: ['42 x 6 = 252', '357 x 6 = 2142', '8 x 6 = 48'],
    funFact: 'Halving always throws away the remainder. Half of 7 is 3, not 3.5. The "+5 if odd" is what quietly puts the lost half back.',
    tryIt: { skillId: 'mul', config: { tables: [6] } },
    check: function () { return _trachCheck(6); }
  },

  {
    id: 'trach-9',
    name: 'Times 9: Take From Ten',
    icon: '🎩',
    tier: 'master',
    trachtenberg: true,
    skills: ['mul'],
    oneLiner: 'First digit: 10 minus it. Middle: 9 minus it, plus the neighbour.',
    why: 'Nine is one less than ten, so every column ends up wanting a subtraction from 9 or 10, with the neighbour carried across from the times-ten part.',
    model: 'trachtenberg-steps',
    demo: { n: 42, multiplier: 9 },
    steps: [],
    examples: ['42 x 9 = 378', '123 x 9 = 1107', '8 x 9 = 72'],
    funFact: 'The digits of any multiple of 9 add up to 9, or to a number whose digits add up to 9. 4653 x 9 = 41877, and 4+1+8+7+7 = 27, and 2+7 = 9.',
    tryIt: { skillId: 'mul', config: { tables: [9] } },
    check: function () { return _trachCheck(9); }
  },

  {
    id: 'square-five',
    name: 'Squaring Anything Ending In 5',
    icon: '⭐',
    tier: 'master',
    skills: ['mul'],
    oneLiner: 'Tens digit times the next number up, then stick 25 on the end.',
    why: 'A number like 35 is 30 + 5. Squaring it gives 30x30 + 2x30x5 + 25, which tidies up to 30 x 40 + 25 — that is the tens digit times the next number up, followed by 25.',
    model: 'square-five',
    demo: { n: 35 },
    steps: [
      { text: '35 squared. Take the tens digit: 3.', visual: { type: 'sq5', n: 35, stage: 'tens' } },
      { text: 'Multiply it by the next number up: 3 x 4 = 12.', visual: { type: 'sq5', n: 35, stage: 'product' } },
      { text: 'Write 25 after it: 1225. That is 35 x 35.', visual: { type: 'sq5', n: 35, stage: 'done' } }
    ],
    examples: ['35² = 3x4 then 25 = 1225', '75² = 7x8 then 25 = 5625', '15² = 1x2 then 25 = 225'],
    funFact: 'It works for any size. 105² = 10 x 11 then 25 = 11025.',
    tryIt: { skillId: 'mul', config: { tables: [5] } },
    check: function () {
      for (var t = 1; t <= 20; t++) {
        var n = t * 10 + 5;
        if (Number(String(t * (t + 1)) + '25') !== n * n) return false;
      }
      return true;
    }
  },

  {
    id: 'casting-nines',
    name: 'Casting Out Nines',
    icon: '🕵️',
    tier: 'master',
    skills: ['mul', 'add100', 'multiop'],
    oneLiner: 'A quick way to catch your own mistakes.',
    why: 'Add up the digits of a number over and over until one digit is left. That single digit survives multiplication: if you do it to both numbers and multiply those, you should get the same digit as doing it to your answer. If you do not, your answer is definitely wrong.',
    model: 'casting-nines',
    demo: { a: 23, b: 7 },
    steps: [
      { text: 'Check 23 x 7 = 161. Add the digits of 23: 2 + 3 = 5.', visual: { type: 'cast', n: 23, root: 5 } },
      { text: 'Digits of 7: just 7.', visual: { type: 'cast', n: 7, root: 7 } },
      { text: '5 x 7 = 35, and 3 + 5 = 8.', visual: { type: 'cast', n: 35, root: 8 } },
      { text: 'Now the answer: 1 + 6 + 1 = 8. They match, so 161 passes the check.', visual: { type: 'cast', n: 161, root: 8, match: true } }
    ],
    examples: ['23 x 7 = 161 → 5 x 7 → 8, and 1+6+1 = 8 ✓', '12 x 12 = 144 → 3 x 3 = 9, and 1+4+4 = 9 ✓'],
    funFact: 'It cannot prove you are right, only catch you being wrong — a wrong answer sneaks past about one time in nine. Trachtenberg taught it as the habit of always checking your own work.',
    tryIt: { skillId: 'mul', config: { tables: [7, 8, 9] } },
    check: function () {
      for (var a = 1; a <= 200; a++) for (var b = 1; b <= 30; b++) {
        var dr = function (x) { var r = x % 9; return r === 0 ? 9 : r; };
        if (dr(dr(a) * dr(b)) !== dr(a * b)) return false;
      }
      return true;
    }
  }
];

/** Shared checker for the Trachtenberg tricks: brute force the rule. */
function _trachCheck(multiplier) {
  if (typeof trachtenberg !== 'function') return true;   // engine not loaded
  for (var n = 1; n <= 3000; n++) {
    var r = trachtenberg(n, multiplier);
    if (!r || r.answer !== n * multiplier) return false;
  }
  return true;
}

// ---- Lookup helpers -----------------------------------------------------

function tricksForSkill(skillId) {
  return MATH_TRICKS.filter(function (t) {
    return t.skills && t.skills.indexOf(skillId) !== -1;
  });
}

function getTrick(id) {
  return MATH_TRICKS.find(function (t) { return t.id === id; });
}

function tricksByTier(tier) {
  return MATH_TRICKS.filter(function (t) { return t.tier === tier; });
}

/** Progress: which tricks she has read, and which she has practised. */
function getTrickState(id) {
  if (!state.tricks) state.tricks = {};
  if (!state.tricks[id]) state.tricks[id] = { seen: false, practised: 0, lastSeen: 0 };
  return state.tricks[id];
}

function markTrickSeen(id) {
  var t = getTrickState(id);
  if (!t.seen) {
    t.seen = true;
    state.tokens = (state.tokens || 0) + 3;
    if (typeof lumiSay === 'function') lumiSay('New trick learned! +3 stars.');
  }
  t.lastSeen = Date.now();
  saveState();
}

if (typeof window !== 'undefined') {
  window.MATH_TRICKS = MATH_TRICKS;
  window.TRICK_TIERS = TRICK_TIERS;
  window.tricksForSkill = tricksForSkill;
  window.getTrick = getTrick;
  window.tricksByTier = tricksByTier;
  window.getTrickState = getTrickState;
  window.markTrickSeen = markTrickSeen;
}
