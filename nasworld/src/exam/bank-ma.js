// ============================================================
//  EXAM PREP — Mathematics (P1, MOE 2021 syllabus)
// ============================================================
//
//  Generated, not banked: every number is computed, so every answer can
//  be checked by a test rather than trusted. The worked steps are built
//  from the same numbers as the answer.
//
//  Scope, from the MOE 2021 Primary Mathematics syllabus for P1:
//    Numbers to 100   counting, place value, words, comparing, ordering,
//                     patterns, ordinal numbers 1st to 10th
//    Add and subtract within 100
//    Multiplication   concepts, the x sign, multiplying within 40
//    Division         sharing and grouping within 20. The ÷ sign is a
//                     P2 item, so P1 division is asked only in words
//                     and pictures here, never as "12 ÷ 3".
//    Time             telling time to 5 minutes, am and pm, h and min,
//                     durations of one hour and half an hour
//    Length           measuring, comparing and ordering in cm
//    Shapes           rectangle, square, triangle, circle, half circle,
//                     quarter circle; shapes that make up a figure
//    Picture graphs   one picture stands for one thing (no scales: P2)
//
//  Money is in the P1 syllabus too but was not on the list asked for.
//
//  Ground rules that keep every question to one honest answer:
//    - A square is a rectangle. So "rectangle" is never a wrong option
//      when a square is shown, and "how many rectangles?" is never asked
//      of a figure that contains a square.
//    - 4 x 3 and 3 x 4 are never both offered.
//    - Graph values are always distinct, so "the most" is one column.
//    - Word problems repeat the person's name instead of using he/she.
// ============================================================

var MA_NAMES = ['Nas', 'Ali', 'Mei', 'Ben', 'Siti', 'Ravi', 'Hana', 'Jun', 'Priya', 'Omar'];

var MA_ONES = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten',
  'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
var MA_TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

function maWords(n) {
  if (n === 100) return 'one hundred';
  if (n < 20) return MA_ONES[n];
  var t = Math.floor(n / 10), o = n % 10;
  return MA_TENS[t] + (o ? '-' + MA_ONES[o] : '');
}

/** "1 ten", "3 tens"; "1 one", "0 ones". P1 is taught exactly this. */
function maTens(n) { return n + (n === 1 ? ' ten' : ' tens'); }
function maOnes(n) { return n + (n === 1 ? ' one' : ' ones'); }

function maOrd(n) {
  return n + (n === 1 ? 'st' : n === 2 ? 'nd' : n === 3 ? 'rd' : 'th');
}

function maPlural(shape) {
  return shape + 's';
}

/** Distinct values, in a fixed fallback order if the random ones collide. */
function maDistinct(answer, cands, n, rng) {
  var out = [];
  rng.shuffle(cands).forEach(function (c) {
    if (out.length < n && c !== answer && out.indexOf(c) === -1) out.push(c);
  });
  return out;
}

// ---- Column addition and subtraction, explained ---------------------------

function maAddSteps(a, b) {
  var ao = a % 10, at = Math.floor(a / 10), bo = b % 10, bt = Math.floor(b / 10);
  var ones = ao + bo, steps = [];
  var carry = ones >= 10 ? 1 : 0;
  if (carry) {
    steps.push('Add the ones: ' + ao + ' + ' + bo + ' = ' + ones + '. That is 1 ten and ' + maOnes(ones - 10) + '.');
    steps.push('Write ' + (ones - 10) + ' in the ones place. Carry the 1 ten over to the tens.');
  } else {
    steps.push('Add the ones: ' + ao + ' + ' + bo + ' = ' + ones + '.');
  }
  var tens = at + bt + carry;
  var tensLine = 'Add the tens: ' + maTens(at) + (bt ? ' + ' + maTens(bt) : '') + (carry ? ' + 1 ten' : '') + ' = ' + maTens(tens);
  if (!bt && !carry) tensLine = 'The tens stay the same: ' + maTens(at);
  steps.push(tensLine + (tens === 10 ? ', and 10 tens make 100.' : '.'));
  steps.push('So ' + a + ' + ' + b + ' = ' + (a + b) + '.');
  return steps;
}

function maSubSteps(a, b) {
  var ao = a % 10, at = Math.floor(a / 10), bo = b % 10, bt = Math.floor(b / 10);
  var steps = [], d = a - b;
  if (ao >= bo) {
    steps.push('Subtract the ones: ' + ao + ' − ' + bo + ' = ' + (ao - bo) + '.');
    steps.push(bt ? 'Subtract the tens: ' + maTens(at) + ' − ' + maTens(bt) + ' = ' + maTens(at - bt) + '.'
                  : 'The tens stay the same: ' + maTens(at) + '.');
  } else {
    steps.push('Ones: we cannot take ' + bo + ' from ' + ao + ', so regroup. Change 1 ten into 10 ones: ' +
               a + ' is ' + maTens(at - 1) + ' and ' + maOnes(ao + 10) + '.');
    steps.push('Subtract the ones: ' + (ao + 10) + ' − ' + bo + ' = ' + (ao + 10 - bo) + '.');
    steps.push(bt ? 'Subtract the tens: ' + maTens(at - 1) + ' − ' + maTens(bt) + ' = ' + maTens(at - 1 - bt) + '.'
                  : 'The tens left: ' + maTens(at - 1) + '.');
  }
  steps.push('So ' + a + ' − ' + b + ' = ' + d + '.');
  steps.push('Check: ' + d + ' + ' + b + ' = ' + a + '.');
  return steps;
}

// ---- Number generators --------------------------------------------------------

var MA_GENS = [];
// weight < 1 makes a generator come up less often than its siblings.
function maGen(id, topic, fmt, make, weight) {
  MA_GENS.push({ id: id, topic: topic, fmt: fmt, make: make, weight: weight || 1 });
}

function maPickGen(gens, rng) {
  var total = gens.reduce(function (s, g) { return s + g.weight; }, 0);
  var r = rng.next() * total;
  for (var i = 0; i < gens.length; i++) { r -= gens[i].weight; if (r < 0) return gens[i]; }
  return gens[gens.length - 1];
}

// Numbers to 100 ------------------------------------------------------------------

function maWordSteps(n) {
  if (n < 20) return [n + ' is one of the special "teen" words we learn by heart: ' + maWords(n) + '.'];
  var t = Math.floor(n / 10), o = n % 10;
  if (!o) return [n + ' is ' + t + ' tens, and ' + t + ' tens is ' + MA_TENS[t] + '.'];
  return [n + ' is ' + maTens(t) + ' and ' + maOnes(o) + '.',
          t + ' tens is ' + MA_TENS[t] + ', and ' + o + ' is ' + MA_ONES[o] + '.',
          'Put them together with a hyphen: ' + maWords(n) + '.'];
}

maGen('num-words', 'num', 'mcq', function (rng) {
  var n = rng.chance(0.2) ? rng.int(11, 19) : rng.int(21, 99);
  var swap = (n % 10) * 10 + Math.floor(n / 10);
  var cands = [n + 10, n - 10, n + 1, n - 1, n + 20].filter(function (c) { return c >= 11 && c <= 99; });
  var wrong = [];
  if (swap >= 11 && swap <= 99 && swap !== n) wrong.push(swap);
  wrong = wrong.concat(maDistinct(n, cands.filter(function (c) { return c !== swap; }), 3 - wrong.length, rng));
  return {
    skill: 'num', type: 'mcq', prompt: 'Which shows **' + n + '** in words?',
    options: [maWords(n)].concat(wrong.map(maWords)), answer: maWords(n),
    explain: n + ' is written ' + maWords(n) + '.', steps: maWordSteps(n)
  };
});

maGen('num-numerals', 'num', 'short', function (rng) {
  var n = rng.chance(0.2) ? rng.int(11, 19) : rng.int(21, 99);
  return {
    skill: 'num', type: 'number', prompt: 'Write **' + maWords(n) + '** in numerals.', answer: n,
    explain: maWords(n) + ' is ' + n + '.', steps: maWordSteps(n)
  };
});

maGen('num-value', 'num', 'mcq', function (rng) {
  var t, o;
  do { t = rng.int(2, 9); o = rng.int(1, 9); } while (t === o);
  var n = t * 10 + o;
  var askTens = rng.chance(0.6);
  var digit = askTens ? t : o;
  var value = askTens ? t * 10 : o;
  return {
    skill: 'num', type: 'mcq', order: 'ascending',
    prompt: 'In **' + n + '**, the digit **' + digit + '** stands for ___.',
    options: [String(t * 10), String(t), String(o * 10), String(o)], answer: String(value),
    explain: askTens
      ? digit + ' is in the tens place, so it stands for ' + maTens(digit) + ', which is ' + value + '.'
      : digit + ' is in the ones place, so it stands for ' + maOnes(digit) + ', which is ' + value + '.',
    steps: [n + ' is ' + maTens(t) + ' and ' + maOnes(o) + '.',
            'The tens digit ' + t + ' stands for ' + (t * 10) + '. The ones digit ' + o + ' stands for ' + o + '.']
  };
});

maGen('num-tens-ones', 'num', 'short', function (rng) {
  var t = rng.int(1, 9), o = rng.int(0, 9), n = t * 10 + o;
  var kind = rng.int(0, 3);
  if (kind === 0) {
    return { skill: 'num', type: 'number', prompt: '**' + maTens(t) + '** and **' + maOnes(o) + '** make ___.', answer: n,
      explain: maTens(t) + ' is ' + (t * 10) + '. Add ' + maOnes(o) + ' to get ' + n + '.',
      steps: [maTens(t) + ' = ' + (t * 10) + '.', (t * 10) + ' + ' + o + ' = ' + n + '.'] };
  }
  if (kind === 1 && o > 0) {
    return { skill: 'num', type: 'number', prompt: n + ' = ___ tens and ' + maOnes(o), answer: t,
      explain: 'The tens digit of ' + n + ' is ' + t + ', so ' + n + ' has ' + maTens(t) + '.',
      steps: [n + ' is ' + maTens(t) + ' and ' + maOnes(o) + '.'] };
  }
  if (kind === 2) {
    return { skill: 'num', type: 'number', prompt: n + ' = ' + maTens(t) + ' and ___ ones', answer: o,
      explain: 'The ones digit of ' + n + ' is ' + o + '.',
      steps: [n + ' is ' + maTens(t) + ' and ' + maOnes(o) + '.'] };
  }
  return { skill: 'num', type: 'number', prompt: 'How many small cubes are there altogether?',
    visual: { kind: 'blocks', tens: t, ones: o }, answer: n,
    explain: 'Each long rod is a ten. There are ' + maTens(t) + ' and ' + maOnes(o) + '.',
    steps: ['Count the rods in tens: ' + (t ? Array.apply(null, Array(t)).map(function (_, i) { return (i + 1) * 10; }).join(', ') : '0') + '.',
            (o ? 'Then count on the ' + o + ' single cube' + (o === 1 ? '' : 's') + ': ' + n + '.' : 'There are no single cubes, so there are ' + n + '.')] };
});

/** "a", "a and b", "a, b and c" */
function maList(xs) {
  return xs.length < 2 ? String(xs[0]) : xs.slice(0, -1).join(', ') + ' and ' + xs[xs.length - 1];
}

/** Tens first; and if the winning tens digit is shared, say to compare the ones. */
function maCompareSteps(set, ans, most) {
  var t = Math.floor(ans / 10);
  var steps = ['Look at the tens digits: ' + set.map(function (s) { return s + ' has ' + maTens(Math.floor(s / 10)); }).join(', ') + '.'];
  var tied = set.filter(function (s) { return Math.floor(s / 10) === t && s !== ans; });
  if (tied.length) {
    var group = [ans].concat(tied);
    steps.push('The ' + (most ? 'most' : 'fewest') + ' tens is ' + t + ', but ' + maList(group) +
               (group.length === 2 ? ' both have ' : ' all have ') + maTens(t) + '. So compare the ones: ' +
               group.map(function (s) { return s + ' has ' + maOnes(s % 10); }).join(', ') + '.');
  }
  steps.push('The ' + (most ? 'greatest' : 'smallest') + ' is ' + ans + '.');
  return steps;
}

maGen('num-compare', 'num', 'mcq', function (rng) {
  var most = rng.chance(0.5);
  var set = [];
  var base = rng.int(21, 89);
  var swap = (base % 10) * 10 + Math.floor(base / 10);
  [base, swap, base + rng.int(1, 9), base - rng.int(1, 9), Math.floor(base / 10) * 10 + rng.int(0, 9), rng.int(11, 99)]
    .forEach(function (c) { if (c >= 11 && c <= 99 && set.indexOf(c) === -1 && set.length < 4) set.push(c); });
  while (set.length < 4) { var x = rng.int(11, 99); if (set.indexOf(x) === -1) set.push(x); }
  var ans = most ? Math.max.apply(null, set) : Math.min.apply(null, set);
  return {
    skill: 'num', type: 'mcq', order: 'keep',
    prompt: 'Which number is the **' + (most ? 'greatest' : 'smallest') + '**?',
    options: rng.shuffle(set.map(String)), answer: String(ans),
    explain: 'Compare the tens first. If the tens are the same, compare the ones.',
    steps: maCompareSteps(set, ans, most)
  };
});

maGen('num-order', 'num', 'short', function (rng) {
  var set = [];
  while (set.length < 4) { var x = rng.int(11, 99); if (set.indexOf(x) === -1) set.push(x); }
  var up = rng.chance(0.6);
  var sorted = set.slice().sort(function (a, b) { return up ? a - b : b - a; });
  return {
    skill: 'num', type: 'arrange', tiles: set.map(String),
    prompt: 'Put the numbers in order, from the **' + (up ? 'smallest' : 'greatest') + '** to the **' + (up ? 'greatest' : 'smallest') + '**.',
    answer: sorted.join(' '),
    explain: 'Compare the tens first, then the ones.',
    steps: ['Look at the tens digits first; when the tens are the same, look at the ones.',
            'In order: ' + sorted.join(', ') + '.']
  };
});

maGen('num-more-less', 'num', 'short', function (rng) {
  var kinds = [['10 more', 10], ['1 more', 1], ['1 less', -1], ['10 less', -10]];
  var k = rng.pick(kinds), n;
  do { n = rng.int(11, 99); } while (n + k[1] < 1 || n + k[1] > 100);
  var r = n + k[1];
  var steps = [n + (k[1] > 0 ? ' + ' : ' − ') + Math.abs(k[1]) + ' = ' + r + '.'];
  if (Math.abs(k[1]) === 10 && r < 100) steps.unshift('10 ' + (k[1] > 0 ? 'more' : 'less') + ' changes the tens digit by 1 and keeps the ones digit the same.');
  return {
    skill: 'num', type: 'number', prompt: 'What number is **' + k[0] + '** than **' + n + '**?', answer: r,
    explain: k[0] + ' than ' + n + ' is ' + r + '.', steps: steps
  };
});

maGen('num-pattern', 'num', 'short', function (rng) {
  var step = rng.pick([1, 2, 5, 10, -1, -2, -5, -10]);
  var start, terms;
  do {
    start = rng.int(1, 95);
    if (Math.abs(step) === 5 || Math.abs(step) === 10) start = Math.round(start / 5) * 5 || 5;
    terms = [0, 1, 2, 3, 4].map(function (i) { return start + i * step; });
  } while (terms.some(function (t) { return t < 0 || t > 100; }));
  var miss = rng.int(1, 4);
  var shown = terms.map(function (t, i) { return i === miss ? '___' : String(t); });
  var a = miss >= 2 ? terms[0] : terms[2], b = miss >= 2 ? terms[1] : terms[3];
  return {
    skill: 'num', type: 'number', prompt: 'Fill in the missing number: ' + shown.join(', '), answer: terms[miss],
    explain: 'The numbers go ' + (step > 0 ? 'up' : 'down') + ' by ' + Math.abs(step) + ' each time.',
    steps: ['Find the rule: from ' + a + ' to ' + b + ' is ' + (step > 0 ? '+' : '−') + Math.abs(step) + '.',
            miss > 0
              ? 'So the missing number is ' + terms[miss - 1] + (step > 0 ? ' + ' : ' − ') + Math.abs(step) + ' = ' + terms[miss] + '.'
              : 'So the missing number is ' + terms[1] + (step > 0 ? ' − ' : ' + ') + Math.abs(step) + ' = ' + terms[0] + '.']
  };
});

var MA_ROW_ANIMALS = ['🐱', '🐶', '🐰', '🐻', '🐼', '🐸', '🐵', '🐷', '🐮', '🐯', '🐨', '🦁', '🐔', '🐧'];

maGen('num-ordinal', 'num', 'mcq', function (rng) {
  var row = rng.shuffle(MA_ROW_ANIMALS).slice(0, 7);
  var pos = rng.int(2, 6);              // 1-based
  var fromLeft = rng.chance(0.6);
  var idx = fromLeft ? pos - 1 : row.length - pos;
  var mirror = fromLeft ? row.length - pos : pos - 1;
  var cands = [row[mirror], row[idx - 1], row[idx + 1], row[(idx + 3) % row.length]].filter(Boolean);
  var wrong = [];
  cands.forEach(function (c) { if (c !== row[idx] && wrong.indexOf(c) === -1 && wrong.length < 3) wrong.push(c); });
  return {
    skill: 'num', type: 'mcq', visual: { kind: 'row', items: row },
    prompt: 'Which animal is **' + maOrd(pos) + '** from the **' + (fromLeft ? 'left' : 'right') + '**?',
    options: [row[idx]].concat(wrong), answer: row[idx],
    explain: 'Start counting at the ' + (fromLeft ? 'left' : 'right') + ' end: the ' + maOrd(pos) + ' one is ' + row[idx] + '.',
    steps: ['Start at the ' + (fromLeft ? 'left' : 'right') + ' end.',
            'Count ' + (fromLeft ? row.slice(0, pos) : row.slice().reverse().slice(0, pos)).map(function (a, i) { return maOrd(i + 1) + ' ' + a; }).join(', ') + '.']
  };
});

maGen('num-neighbours', 'num', 'short', function (rng) {
  var k = rng.int(0, 2), n;
  if (k === 0) { n = rng.int(10, 99); return { skill: 'num', type: 'number', prompt: 'Which number comes just **after** ' + n + '?', answer: n + 1,
      explain: 'Just after means 1 more: ' + n + ' + 1 = ' + (n + 1) + '.', steps: [n + ' + 1 = ' + (n + 1) + '.'] }; }
  if (k === 1) { n = rng.int(11, 100); return { skill: 'num', type: 'number', prompt: 'Which number comes just **before** ' + n + '?', answer: n - 1,
      explain: 'Just before means 1 less: ' + n + ' − 1 = ' + (n - 1) + '.', steps: [n + ' − 1 = ' + (n - 1) + '.'] }; }
  n = rng.int(11, 98);
  return { skill: 'num', type: 'number', prompt: 'Which number comes **between** ' + n + ' and ' + (n + 2) + '?', answer: n + 1,
    explain: 'Count: ' + n + ', ' + (n + 1) + ', ' + (n + 2) + '.', steps: ['Count on from ' + n + ': ' + n + ', ' + (n + 1) + ', ' + (n + 2) + '.'] };
});

// Addition and subtraction within 100 -------------------------------------------

function maAddPair(rng, kind) {
  var a, b, guard = 0;
  do {
    if (kind === 0) { a = rng.int(11, 98); b = rng.int(1, 9); }
    else { a = rng.int(11, 89); b = rng.int(11, 89); }
    var carry = (a % 10) + (b % 10) >= 10;
    var want = rng.chance(0.55);
    guard++;
    if (a + b <= 100 && (carry === want || guard > 40)) break;
  } while (true);
  return [a, b];
}

maGen('as-add', 'addsub', 'short', function (rng) {
  var p = maAddPair(rng, rng.chance(0.3) ? 0 : 1);
  var carry = (p[0] % 10) + (p[1] % 10) >= 10;
  return { skill: 'addsub', type: 'number', level: carry ? 2 : 1, prompt: p[0] + ' + ' + p[1] + ' = ___', answer: p[0] + p[1],
    explain: 'Add the ones first, then the tens.' + (carry ? ' The ones make more than 9, so carry a ten.' : ''),
    steps: maAddSteps(p[0], p[1]) };
});

maGen('as-sub', 'addsub', 'short', function (rng) {
  var a, b, guard = 0, borrow;
  var oneDigit = rng.chance(0.3), want = rng.chance(0.55);
  do {
    a = rng.int(20, 99);
    b = oneDigit ? rng.int(1, 9) : rng.int(11, a - 1);
    borrow = (a % 10) < (b % 10);
    guard++;
  } while ((borrow !== want && guard < 40) || b >= a);
  return { skill: 'addsub', type: 'number', level: borrow ? 2 : 1, prompt: a + ' − ' + b + ' = ___', answer: a - b,
    explain: 'Subtract the ones first, then the tens.' + (borrow ? ' The ones are too few, so regroup a ten into 10 ones.' : ''),
    steps: maSubSteps(a, b) };
});

maGen('as-missing', 'addsub', 'short', function (rng) {
  var k = rng.int(0, 3), a, b, s;
  if (k <= 1) {
    a = rng.int(11, 60); b = rng.int(11, 39); s = a + b;
    var prompt = k === 0 ? '___ + ' + b + ' = ' + s : a + ' + ___ = ' + s;
    var known = k === 0 ? b : a, ans = k === 0 ? a : b;
    return { skill: 'addsub', type: 'number', level: 2, prompt: prompt, answer: ans,
      explain: 'The missing number and ' + known + ' make ' + s + '. Find it by subtracting.',
      steps: ['The missing number and ' + known + ' make ' + s + '.', s + ' − ' + known + ' = ' + ans + '.',
              'Check: ' + (k === 0 ? ans + ' + ' + b : a + ' + ' + ans) + ' = ' + s + '.'] };
  }
  a = rng.int(30, 99); b = rng.int(11, a - 11); var d = a - b;
  if (k === 2) {
    return { skill: 'addsub', type: 'number', level: 2, prompt: a + ' − ___ = ' + d, answer: b,
      explain: 'Take the missing number away from ' + a + ' and ' + d + ' is left. So the missing number is ' + a + ' − ' + d + '.',
      steps: [a + ' − ' + d + ' = ' + b + '.', 'Check: ' + a + ' − ' + b + ' = ' + d + '.'] };
  }
  return { skill: 'addsub', type: 'number', level: 2, prompt: '___ − ' + b + ' = ' + d, answer: a,
    explain: 'Take ' + b + ' away from the missing number and ' + d + ' is left. So the missing number is ' + d + ' + ' + b + '.',
    steps: [d + ' + ' + b + ' = ' + a + '.', 'Check: ' + a + ' − ' + b + ' = ' + d + '.'] };
});

maGen('as-bond', 'addsub', 'short', function (rng) {
  var whole, p1;
  if (rng.chance(0.6)) { whole = rng.int(11, 20); p1 = rng.int(2, whole - 2); }
  else { whole = rng.int(3, 10) * 10; p1 = rng.int(1, whole / 10 - 1) * 10; }
  var p2 = whole - p1;
  var k = rng.int(0, 2);
  if (k === 2) {
    return { skill: 'addsub', type: 'number', prompt: 'Find the missing number in the number bond.',
      visual: { kind: 'bond', whole: null, parts: [p1, p2] }, answer: whole,
      explain: 'The two parts together make the whole.', steps: [p1 + ' + ' + p2 + ' = ' + whole + '.'] };
  }
  var parts = k === 0 ? [p1, null] : [null, p2];
  var ans = k === 0 ? p2 : p1, known = k === 0 ? p1 : p2;
  return { skill: 'addsub', type: 'number', prompt: 'Find the missing number in the number bond.',
    visual: { kind: 'bond', whole: whole, parts: parts }, answer: ans,
    explain: 'The two parts make the whole, so the missing part is the whole take away the part we know.',
    steps: [known + ' and the missing part make ' + whole + '.', whole + ' − ' + known + ' = ' + ans + '.'] };
});

maGen('as-make10', 'addsub', 'mcq', function (rng) {
  var a, b;
  do { a = rng.int(6, 9); b = rng.int(3, 9); } while (a + b < 11 || a + b > 18 || b > a);
  var need = 10 - a, rest = b - need, s = a + b;
  var opts = ['10 + ' + rest, '10 + ' + b, a + ' + 10', '10 + ' + (rest - 1)];
  if (rest - 1 < 1) opts[3] = '10 + ' + (rest + 1);
  return { skill: 'addsub', type: 'mcq', prompt: 'Which is the same as **' + a + ' + ' + b + '**?',
    options: opts, answer: '10 + ' + rest,
    explain: 'Make a ten first. ' + a + ' needs ' + need + ' more to make 10.',
    steps: [a + ' + ' + need + ' = 10. Take the ' + need + ' from the ' + b + ', which leaves ' + rest + '.',
            'So ' + a + ' + ' + b + ' = 10 + ' + rest + ' = ' + s + '.'] };
});

maGen('as-mental', 'addsub', 'mcq', function (rng) {
  var k = rng.int(0, 2), a, b, r, sign;
  if (k === 0) { a = rng.int(11, 89); b = 10; sign = '+'; r = a + b; }
  else if (k === 1) { a = rng.int(2, 9) * 10; b = rng.int(1, a / 10 - 1) * 10; sign = '−'; r = a - b; }
  else { a = rng.int(2, 8) * 10; b = rng.int(1, 9); sign = '+'; r = a + b; }
  var wrong = maDistinct(r, [r + 10, r - 10, r + 1, r - 1, r + 2].filter(function (x) { return x >= 0 && x <= 100; }), 3, rng);
  return { skill: 'addsub', type: 'mcq', order: 'ascending', prompt: '**' + a + ' ' + sign + ' ' + b + '** = ___',
    options: [String(r)].concat(wrong.map(String)), answer: String(r),
    explain: k === 0 ? 'Adding 10 makes the tens digit 1 bigger.' : k === 1 ? 'Subtract the tens: ' + maTens(a / 10) + ' − ' + maTens(b / 10) + '.' : 'Tens and ones: ' + maTens(a / 10) + ' and ' + maOnes(b) + '.',
    steps: [a + ' ' + sign + ' ' + b + ' = ' + r + '.'] };
});

maGen('as-pair', 'addsub', 'mcq', function (rng) {
  var target = rng.int(3, 9) * 10;
  var x = rng.int(1, target / 10 - 1) * 10;
  var right = x + ' and ' + (target - x);
  var wrongs = [], tries = 0;
  while (wrongs.length < 3 && tries++ < 50) {
    var y = rng.int(1, target / 10 - 1) * 10, off = rng.pick([10, -10, 1, -1]);
    var z = target - y + off;
    var s = y + ' and ' + z;
    if (z > 0 && s !== right && wrongs.indexOf(s) === -1 && y + z !== target) wrongs.push(s);
  }
  return { skill: 'addsub', type: 'mcq', prompt: 'Which pair of numbers adds up to **' + target + '**?',
    options: [right].concat(wrongs), answer: right,
    explain: x + ' + ' + (target - x) + ' = ' + target + '.',
    steps: ['Add each pair. Only ' + x + ' + ' + (target - x) + ' makes ' + target + '.'] };
});

var MA_THINGS = ['stickers', 'marbles', 'beads', 'stamps', 'crayons', 'shells', 'balloons', 'cards'];

maGen('as-wp', 'addsub', 'wp', function (rng) {
  var n1 = rng.pick(MA_NAMES), n2;
  do { n2 = rng.pick(MA_NAMES); } while (n2 === n1);
  var thing = rng.pick(MA_THINGS);
  var k = rng.int(0, 6), a, b, ans, prompt, steps;
  if (k === 0) {
    do { a = rng.int(11, 60); b = rng.int(11, 39); } while (a + b > 100);
    ans = a + b;
    prompt = n1 + ' has ' + a + ' red ' + thing + ' and ' + b + ' blue ' + thing + '. How many ' + thing + ' does ' + n1 + ' have altogether?';
    steps = ['We know the two parts: ' + a + ' red and ' + b + ' blue.', 'We want the whole, so add: part + part = whole.',
             a + ' + ' + b + ' = ' + ans + '.', n1 + ' has ' + ans + ' ' + thing + ' altogether.'];
  } else if (k === 1) {
    a = rng.int(30, 90); b = rng.int(11, a - 5); ans = a - b;
    var ctx = rng.pick([['children', 'in the hall', 'left'], ['cars', 'in the car park', 'drove away'], ['passengers', 'on the bus', 'got off']]);
    prompt = 'There were ' + a + ' ' + ctx[0] + ' ' + ctx[1] + '. ' + b + ' ' + ctx[0] + ' ' + ctx[2] + '. How many ' + ctx[0] + ' were ' + ctx[1] + ' then?';
    steps = ['We start with ' + a + ' and ' + b + ' go away.', 'Taking away means subtract.', a + ' − ' + b + ' = ' + ans + '.',
             'There were ' + ans + ' ' + ctx[0] + ' ' + ctx[1] + ' then.'];
  } else if (k === 2) {
    a = rng.int(15, 60); b = rng.int(5, 30);
    if (a + b > 100) b = 100 - a;
    ans = a + b;
    prompt = n1 + ' has ' + a + ' ' + thing + '. ' + n2 + ' has ' + b + ' more ' + thing + ' than ' + n1 + '. How many ' + thing + ' does ' + n2 + ' have?';
    steps = [n2 + ' has ' + b + ' MORE than ' + n1 + ', so ' + n2 + ' has ' + n1 + '\'s number and ' + b + ' more.', a + ' + ' + b + ' = ' + ans + '.',
             n2 + ' has ' + ans + ' ' + thing + '.'];
  } else if (k === 3) {
    a = rng.int(25, 90); b = rng.int(5, a - 10); ans = a - b;
    prompt = n1 + ' has ' + a + ' ' + thing + '. ' + n2 + ' has ' + b + ' fewer ' + thing + ' than ' + n1 + '. How many ' + thing + ' does ' + n2 + ' have?';
    steps = [n2 + ' has ' + b + ' FEWER than ' + n1 + ', so take ' + b + ' away from ' + n1 + '\'s number.', a + ' − ' + b + ' = ' + ans + '.',
             n2 + ' has ' + ans + ' ' + thing + '.'];
  } else if (k === 4) {
    a = rng.int(30, 95); b = rng.int(11, a - 5); ans = a - b;
    prompt = n1 + ' has ' + a + ' ' + thing + '. ' + n2 + ' has ' + b + ' ' + thing + '. How many more ' + thing + ' does ' + n1 + ' have than ' + n2 + '?';
    steps = ['"How many more" means find the difference.', 'Bigger number − smaller number: ' + a + ' − ' + b + ' = ' + ans + '.',
             n1 + ' has ' + ans + ' more ' + thing + ' than ' + n2 + '.'];
  } else if (k === 5) {
    do { a = rng.int(11, 60); b = rng.int(5, 39); } while (a + b > 100);
    ans = a + b;
    prompt = 'There were ' + a + ' birds on a tree. Then ' + b + ' more birds came. How many birds were on the tree then?';
    steps = ['We start with ' + a + ' and ' + b + ' more join them.', 'Joining means add.', a + ' + ' + b + ' = ' + ans + '.',
             'There were ' + ans + ' birds on the tree.'];
  } else {
    a = rng.int(25, 60); b = rng.int(5, a - 10); ans = a - b;
    prompt = n1 + ' baked ' + a + ' cookies and gave some to a neighbour. ' + n1 + ' had ' + b + ' cookies left. How many cookies did ' + n1 + ' give away?';
    steps = ['The whole is ' + a + ' cookies. One part is the ' + b + ' left. We want the other part.', 'Whole − part = part.',
             a + ' − ' + b + ' = ' + ans + '.', n1 + ' gave away ' + ans + ' cookies.'];
  }
  return { skill: 'addsub', type: 'number', prompt: prompt, answer: ans,
    explain: 'Decide first: are we putting together, taking away, or comparing?', steps: steps };
});

// Multiplication within 40 ----------------------------------------------------------

var MA_GROUP_ICONS = [['🍓', 'strawberries'], ['🌸', 'flowers'], ['⭐', 'stars'], ['🍪', 'cookies'],
                      ['🎈', 'balloons'], ['🍎', 'apples'], ['⚽', 'balls'], ['🐟', 'fish']];

function maGroupPair(rng, minGroups) {
  var g, k;
  do { g = rng.int(minGroups || 2, 6); k = rng.int(2, 8); } while (g * k > 40);
  return [g, k];
}

function maSkip(k, g) {
  var out = [];
  for (var i = 1; i <= g; i++) out.push(i * k);
  return out.join(', ');
}

maGen('mul-sentence', 'mul', 'mcq', function (rng) {
  var gk = maGroupPair(rng, 3), g = gk[0], k = gk[1];
  var ic = rng.pick(MA_GROUP_ICONS);
  var right = g + ' × ' + k;
  var cands = [(g + 1) + ' × ' + k, g + ' × ' + (k + 1), g + ' + ' + k,
               Array.apply(null, Array(g - 1)).map(function () { return k; }).join(' + ')];
  if (g - 1 >= 2) cands.push((g - 1) + ' × ' + k);
  var wrong = maDistinct(right, cands.filter(function (c) { return c !== k + ' × ' + g; }), 3, rng);
  return { skill: 'mul', type: 'mcq', visual: { kind: 'groups', groups: g, each: k, icon: ic[0] },
    prompt: 'Which number sentence matches the picture?', options: [right].concat(wrong), answer: right,
    explain: 'There are ' + g + ' groups with ' + k + ' in each group: ' + g + ' groups of ' + k + ' is ' + g + ' × ' + k + '.',
    steps: ['Count the groups: ' + g + '.', 'Count how many in one group: ' + k + '.', g + ' groups of ' + k + ' is written ' + g + ' × ' + k + '.'] };
});

maGen('mul-count', 'mul', 'short', function (rng) {
  var gk = maGroupPair(rng), g = gk[0], k = gk[1];
  var ic = rng.pick(MA_GROUP_ICONS);
  var arr = rng.chance(0.35);
  return { skill: 'mul', type: 'number',
    visual: arr ? { kind: 'array', rows: g, cols: k, icon: ic[0] } : { kind: 'groups', groups: g, each: k, icon: ic[0] },
    prompt: 'How many ' + ic[1] + ' are there altogether?', answer: g * k,
    explain: (arr ? g + ' rows of ' + k : g + ' groups of ' + k) + ' is ' + g + ' × ' + k + ' = ' + (g * k) + '.',
    steps: [(arr ? 'There are ' + g + ' rows, with ' + k + ' in each row.' : 'There are ' + g + ' groups, with ' + k + ' in each group.'),
            'Count in ' + k + 's: ' + maSkip(k, g) + '.', g + ' × ' + k + ' = ' + (g * k) + '.'] };
});

maGen('mul-repeated', 'mul', 'short', function (rng) {
  var gk = maGroupPair(rng, 3), g = gk[0], k = gk[1];
  var sum = Array.apply(null, Array(g)).map(function () { return k; }).join(' + ');
  var askGroups = rng.chance(0.5);
  return { skill: 'mul', type: 'number', level: 2,
    prompt: sum + ' = ' + (askGroups ? '___ × ' + k : g + ' × ___'), answer: askGroups ? g : k,
    explain: 'Adding ' + k + ' again and again, ' + g + ' times, is ' + g + ' groups of ' + k + ', which is ' + g + ' × ' + k + '.',
    steps: ['Count how many ' + k + 's are added: there are ' + g + '.', 'So it is ' + g + ' groups of ' + k + ': ' + g + ' × ' + k + '.'] };
});

maGen('mul-fact', 'mul', 'short', function (rng) {
  var g, k;
  do { g = rng.pick([2, 3, 4, 5, 10]); k = rng.int(2, 9); } while (g * k > 40);
  return { skill: 'mul', type: 'number', prompt: g + ' × ' + k + ' = ___', answer: g * k,
    explain: g + ' × ' + k + ' means ' + g + ' groups of ' + k + '.',
    steps: [g + ' groups of ' + k + '.', 'Count in ' + k + 's: ' + maSkip(k, g) + '.', g + ' × ' + k + ' = ' + (g * k) + '.'] };
});

maGen('mul-wp', 'mul', 'wp', function (rng) {
  var ctxs = [
    function () { var g, k; do { g = rng.int(3, 6); k = rng.int(3, 6); } while (g * k > 40);
      return [g, k, 'There are ' + g + ' plates. Each plate has ' + k + ' cupcakes. How many cupcakes are there altogether?', 'cupcakes', 'plates']; },
    function () { var g = rng.int(3, 8);
      return [g, 4, 'A car has 4 wheels. How many wheels do ' + g + ' cars have?', 'wheels', 'cars']; },
    function () { var g = rng.int(2, 5);
      return [g, 8, 'A spider has 8 legs. How many legs do ' + g + ' spiders have?', 'legs', 'spiders']; },
    function () { var g = rng.int(3, 8);
      return [g, 5, 'Each vase has 5 flowers. How many flowers are there in ' + g + ' vases?', 'flowers', 'vases']; },
    function () { var g = rng.int(3, 10);
      return [g, 3, 'A tricycle has 3 wheels. How many wheels do ' + g + ' tricycles have?', 'wheels', 'tricycles']; }
  ];
  var c = rng.pick(ctxs)();
  var g = c[0], k = c[1];
  return { skill: 'mul', type: 'number', prompt: c[2], answer: g * k,
    explain: 'Equal groups: ' + g + ' ' + c[4] + ' with ' + k + ' ' + c[3] + ' each is ' + g + ' groups of ' + k + '.',
    steps: [g + ' groups of ' + k + ' = ' + g + ' × ' + k + '.', 'Count in ' + k + 's: ' + maSkip(k, g) + '.',
            g + ' × ' + k + ' = ' + (g * k) + '. There are ' + (g * k) + ' ' + c[3] + '.'] };
});

// Division within 20, in words: sharing and grouping ---------------------------------

var MA_SHARE_ICONS = [['🍬', 'sweets'], ['🍪', 'cookies'], ['🍓', 'strawberries'], ['✏️', 'pencils'], ['🍎', 'apples'], ['🎈', 'balloons']];

function maDivPair(rng) {
  var p, q;
  do { p = rng.int(2, 5); q = rng.int(2, 9); } while (p * q > 20);
  return [p, q];
}

maGen('div-share', 'div', 'short', function (rng) {
  var pq = maDivPair(rng), p = pq[0], q = pq[1], total = p * q;
  var ic = rng.pick(MA_SHARE_ICONS);
  return { skill: 'div', type: 'number', visual: { kind: 'share', total: total, people: p, icon: ic[0] },
    prompt: 'Share ' + total + ' ' + ic[1] + ' equally among ' + p + ' children. How many ' + ic[1] + ' does each child get?', answer: q,
    explain: 'Sharing equally means every child gets the same number.',
    steps: ['Give out the ' + ic[1] + ' one at a time, one to each child, until none are left.',
            'Each child ends up with ' + q + '.', 'Check: ' + p + ' groups of ' + q + ' = ' + total + '.'] };
});

maGen('div-group', 'div', 'short', function (rng) {
  var s, g;
  do { s = rng.pick([2, 3, 4, 5, 10]); g = rng.int(2, 9); } while (s * g > 20);
  var total = s * g;
  var ic = rng.pick(MA_SHARE_ICONS);
  return { skill: 'div', type: 'number', visual: { kind: 'share', total: total, icon: ic[0] },
    prompt: 'Put ' + total + ' ' + ic[1] + ' into groups of ' + s + '. How many groups are there?', answer: g,
    explain: 'Make groups of ' + s + ' until all ' + total + ' are used up, then count the groups.',
    steps: ['Count in ' + s + 's up to ' + total + ': ' + maSkip(s, g) + '.', 'That is ' + g + ' groups.',
            'Check: ' + g + ' groups of ' + s + ' = ' + total + '.'] };
});

maGen('div-mcq', 'div', 'mcq', function (rng) {
  var pq = maDivPair(rng), p = pq[0], q = pq[1], total = p * q;
  var ic = rng.pick(MA_SHARE_ICONS);
  var wrong = maDistinct(q, [q + 1, q - 1, p, total - p, q + 2].filter(function (x) { return x >= 1; }), 3, rng);
  return { skill: 'div', type: 'mcq', order: 'ascending',
    prompt: total + ' ' + ic[1] + ' are shared equally ' + (p === 2 ? 'between' : 'among') + ' ' + p + ' plates. How many ' + ic[1] + ' are on each plate?',
    options: [String(q)].concat(wrong.map(String)), answer: String(q),
    explain: 'Each plate gets the same number. ' + p + ' groups of ' + q + ' make ' + total + '.',
    steps: ['Share them out one by one onto the ' + p + ' plates.', 'Each plate gets ' + q + '.', 'Check: ' + p + ' groups of ' + q + ' = ' + total + '.'] };
});

maGen('div-wp', 'div', 'wp', function (rng) {
  var k = rng.int(0, 1);
  if (k === 0) {
    var pq = maDivPair(rng), p = pq[0], q = pq[1];
    return { skill: 'div', type: 'number',
      prompt: 'A baker puts ' + (p * q) + ' buns equally into ' + p + ' boxes. How many buns are there in each box?', answer: q,
      explain: 'Putting things equally into boxes is sharing.',
      steps: ['Share ' + (p * q) + ' buns equally into ' + p + ' boxes.', 'Each box gets ' + q + '.', 'Check: ' + p + ' groups of ' + q + ' = ' + (p * q) + '.'] };
  }
  var s, g;
  do { s = rng.pick([2, 4, 5]); g = rng.int(2, 9); } while (s * g > 20);
  return { skill: 'div', type: 'number',
    prompt: (s * g) + ' children play a game in teams of ' + s + '. How many teams are there?', answer: g,
    explain: 'Making teams of the same size is grouping.',
    steps: ['Count in ' + s + 's up to ' + (s * g) + ': ' + maSkip(s, g) + '.', 'That is ' + g + ' teams.'] };
});

// Time ---------------------------------------------------------------------------------

function maT(h, m) { return examFormatTime(h, m); }

function maHourHandWords(h, m) {
  var next = h === 12 ? 1 : h + 1;
  return m === 0 ? 'The short hand (the hour hand) points at ' + h + '.'
                 : 'The short hand (the hour hand) is between ' + h + ' and ' + next + ', so the hour is ' + h + '.';
}

function maMinuteWords(m) {
  if (m === 0) return 'The long hand (the minute hand) points at 12, so it is exactly on the hour.';
  var fives = [];
  for (var i = 5; i <= m; i += 5) fives.push(i);
  return 'The long hand (the minute hand) points at ' + (m / 5) + '. Count in fives from the 12: ' + fives.join(', ') + '. That is ' + m + ' minutes.';
}

function maReadSteps(h, m) {
  return [maHourHandWords(h, m), maMinuteWords(m), 'The time is ' + maT(h, m) + (m === 0 ? ', or ' + h + ' o\'clock.' : m === 30 ? ', or half past ' + h + '.' : '.')];
}

/** Wrong readings a child actually makes, each with what went wrong. */
function maTimeTraps(h, m) {
  var traps = [];
  var sh = m === 0 ? 12 : m / 5, sm = (h * 5) % 60;
  if (!(sh === h && sm === m)) traps.push([sh, sm, 'That reads the hands the wrong way round. The SHORT hand shows the hour; the LONG hand shows the minutes.']);
  var nh = h === 12 ? 1 : h + 1;
  traps.push([nh, m, m === 0 ? 'The short hand points exactly at ' + h + ', not ' + nh + '.'
                             : 'The short hand has gone past ' + h + ' but has not reached ' + nh + ' yet, so the hour is still ' + h + '.']);
  if (m === 25 || m === 50) traps.push([h, m / 5, 'The long hand points at ' + (m / 5) + ', but each number on the clock stands for 5 minutes. Count in fives: it shows ' + m + ' minutes.']);
  var ph = h === 1 ? 12 : h - 1;
  traps.push([ph, m, 'The short hand has already gone past ' + ph + '. The hour is ' + h + '.']);
  return traps;
}

function maRandTime(rng) { return [rng.int(1, 12), rng.int(0, 11) * 5]; }

maGen('time-read', 'time', 'mcq', function (rng) {
  var t = maRandTime(rng), h = t[0], m = t[1];
  var ans = maT(h, m), opts = [ans], why = {};
  maTimeTraps(h, m).forEach(function (tr) {
    var s = maT(tr[0], tr[1]);
    if (opts.length < 4 && opts.indexOf(s) === -1) { opts.push(s); why[s] = tr[2]; }
  });
  while (opts.length < 4) { var r = maRandTime(rng), s = maT(r[0], r[1]); if (opts.indexOf(s) === -1) opts.push(s); }
  return { skill: 'time', type: 'mcq', visual: { kind: 'clock', h: h, m: m },
    prompt: 'What time does the clock show?', options: opts, answer: ans, why: why,
    explain: 'Read the short hand for the hour and the long hand for the minutes.', steps: maReadSteps(h, m) };
});

maGen('time-show', 'time', 'short', function (rng) {
  var t = maRandTime(rng), h = t[0], m = t[1];
  return { skill: 'time', type: 'time', visual: { kind: 'clock', h: h, m: m },
    prompt: 'What time does the clock show? Choose the hour and the minutes.', answer: { h: h, m: m },
    explain: 'Short hand for the hour, long hand for the minutes.', steps: maReadSteps(h, m) };
});

maGen('time-match', 'time', 'mcq', function (rng) {
  var t = maRandTime(rng), h = t[0], m = t[1];
  if (rng.chance(0.5)) m = rng.pick([0, 30]);
  var words = m === 0 ? h + ' o\'clock' : m === 30 ? 'half past ' + h : maT(h, m);
  var times = [[h, m]];
  maTimeTraps(h, m).forEach(function (tr) {
    if (times.length < 4 && !times.some(function (x) { return x[0] === tr[0] && x[1] === tr[1]; })) times.push([tr[0], tr[1]]);
  });
  while (times.length < 4) { var r = maRandTime(rng); if (!times.some(function (x) { return x[0] === r[0] && x[1] === r[1]; })) times.push(r); }
  var keys = [], vis = {}, txt = {};
  times.forEach(function (tt, i) {
    var key = 'clock-' + tt[0] + '-' + tt[1];
    keys.push(key); vis[key] = { kind: 'clock', h: tt[0], m: tt[1] }; txt[key] = 'the clock showing ' + maT(tt[0], tt[1]);
  });
  return { skill: 'time', type: 'mcq', prompt: 'Which clock shows **' + words + '**?',
    options: keys, optionVisuals: vis, optionText: txt, answer: keys[0],
    explain: 'For ' + words + ', the long hand points at ' + (m === 0 ? 12 : m / 5) + ' and the short hand ' + (m === 0 ? 'points at ' + h : 'is between ' + h + ' and ' + (h === 12 ? 1 : h + 1)) + '.',
    steps: [maMinuteWords(m), maHourHandWords(h, m)] };
});

var MA_AMPM = [
  ['wakes up at 6.30', 'am'], ['eats breakfast at 7.00', 'am'], ['gets to school at 7.15', 'am'],
  ['eats lunch at 1.00', 'pm'], ['goes swimming after school at 4.00', 'pm'],
  ['eats dinner at 7.00', 'pm'], ['goes to bed at 9.00', 'pm']
];

maGen('time-ampm', 'time', 'mcq', function (rng) {
  var n = rng.pick(MA_NAMES), c = rng.pick(MA_AMPM);
  return { skill: 'time', type: 'mcq', order: 'keep', prompt: n + ' ' + c[0] + ' ___.', options: ['am', 'pm'], answer: c[1],
    explain: c[1] === 'am' ? 'am is for the morning: from midnight until 12 noon.' : 'pm is for the afternoon, evening and night: from 12 noon until midnight.',
    steps: ['Ask: is this in the morning, or after 12 noon?', c[1] === 'am' ? 'It is in the morning, so am.' : 'It is after 12 noon, so pm.'] };
});

maGen('time-duration', 'time', 'mcq', function (rng) {
  // Starts on the hour or half hour, and never crosses 12 noon, where
  // am turns into pm and would make this a different question.
  // A morning start that lasts an hour is held to 9.30 at the latest, so
  // no option can reach 12.00, where "am" would mean midnight.
  var pm = rng.chance(0.5);
  var dur = rng.pick([30, 60]);
  var h = pm ? rng.int(1, 7) : rng.int(7, dur === 60 ? 9 : 10);
  var m = rng.pick([0, 30]);
  var eh = h, em = m;
  if (dur === 60) eh = h + 1; else if (m === 30) { em = 0; eh = h + 1; } else { em = 30; }
  var suffix = pm ? ' pm' : ' am';
  var thing = rng.pick(['cartoon', 'swimming lesson', 'piano lesson', 'football game']);
  if (rng.chance(0.5)) {
    var ans = maT(eh, em) + suffix;
    var opts = [ans, maT(h, m) + suffix];
    var later = dur === 30 ? [eh, em === 0 ? 30 : 0] : [h + 2 > 12 ? 1 : h + 2, m];
    if (dur === 30 && em === 30) later = [eh + 1, 0];
    opts.push(maT(later[0], later[1]) + suffix);
    var alt = dur === 60 ? maT(m === 0 ? h : h + 1, m === 0 ? 30 : 0) + suffix : maT(h + 1, m) + suffix;
    if (opts.indexOf(alt) === -1) opts.push(alt);
    while (opts.length < 4) { var x = maT(rng.int(1, 11), rng.pick([0, 30])) + suffix; if (opts.indexOf(x) === -1) opts.push(x); }
    return { skill: 'time', type: 'mcq',
      prompt: 'A ' + thing + ' starts at ' + maT(h, m) + suffix + '. It lasts ' + (dur === 60 ? '1 hour' : 'half an hour') + '. What time does it end?',
      options: opts, answer: ans,
      explain: (dur === 60 ? '1 hour later, the hour goes up by 1 and the minutes stay the same.' : 'Half an hour is 30 minutes: the long hand goes halfway round the clock.'),
      steps: [(dur === 60 ? 'In 1 hour the long hand goes all the way round once.' : 'In half an hour the long hand goes halfway round, from ' + (m === 0 ? '12 to 6' : '6 to 12') + '.'),
              'It ends at ' + ans + '.'] };
  }
  var ansD = dur === 60 ? '1 h' : '30 min';
  return { skill: 'time', type: 'mcq', prompt: 'A ' + thing + ' starts at ' + maT(h, m) + suffix + ' and ends at ' + maT(eh, em) + suffix + '. How long is it?',
    options: ['30 min', '1 h', '2 h', '10 min'], answer: ansD,
    explain: dur === 60 ? 'From ' + maT(h, m) + ' to ' + maT(eh, em) + ' the long hand goes all the way round once: 1 hour.'
                        : 'From ' + maT(h, m) + ' to ' + maT(eh, em) + ' the long hand goes halfway round: 30 minutes, which is half an hour.',
    steps: ['Start: ' + maT(h, m) + '. End: ' + maT(eh, em) + '.', dur === 60 ? 'The hour went up by 1 and the minutes are the same: 1 h.' : 'Halfway round the clock is 30 minutes: 30 min.'] };
});

maGen('time-units', 'time', 'mcq', function (rng) {
  var v = rng.pick([
    { p: 'We can write **1 hour** in short as ___.', o: ['1 h', '1 min', '1 cm'], a: '1 h', e: 'h is short for hour.' },
    { p: 'We can write **30 minutes** in short as ___.', o: ['30 min', '30 h', '30 cm'], a: '30 min', e: 'min is short for minutes.' },
    { p: '**2 h** means ___.', o: ['2 hours', '2 minutes', '2 o\'clock'], a: '2 hours', e: 'h stands for hours. 2 h is 2 hours, which is how long something takes, not a time on the clock.' },
    { p: 'Which is longer: **1 h** or **30 min**?', o: ['1 h', '30 min'], a: '1 h', e: '30 minutes is half an hour, so 1 hour is longer.' }
  ]);
  return { skill: 'time', type: 'mcq', prompt: v.p, options: v.o, answer: v.a, explain: v.e, steps: [v.e] };
}, 0.4);

maGen('time-wp', 'time', 'wp', function (rng) {
  var n = rng.pick(MA_NAMES);
  var pm = rng.chance(0.6);
  var dur = rng.pick([30, 60]);
  var h = pm ? rng.int(1, 7) : rng.int(7, 10);
  var m = rng.pick([0, 30]);
  var eh = h, em = m;
  if (dur === 60) eh = h + 1; else if (m === 30) { em = 0; eh = h + 1; } else { em = 30; }
  var act = rng.pick(['starts reading a book', 'starts a piano lesson', 'starts to bake a cake', 'starts playing football']);
  return { skill: 'time', type: 'time', answer: { h: eh, m: em },
    prompt: n + ' ' + act + ' at ' + maT(h, m) + (pm ? ' pm' : ' am') + ' and stops ' + (dur === 60 ? '1 hour' : 'half an hour') +
            ' later. What time does ' + n + ' stop? Choose the hour and the minutes.',
    explain: dur === 60 ? '1 hour later: the hour goes up by 1, the minutes stay the same.' : 'Half an hour is 30 minutes.',
    steps: ['Start at ' + maT(h, m) + '.',
            dur === 60 ? 'Add 1 hour: the long hand goes all the way round once.' : 'Add half an hour: the long hand goes halfway round, 30 minutes.',
            n + ' stops at ' + maT(eh, em) + (pm ? ' pm' : ' am') + '.'] };
});

// Length in cm ------------------------------------------------------------------------

var MA_LEN_THINGS = [['pencil', 'pencil'], ['crayon', 'crayon'], ['ribbon', 'ribbon'], ['stick', 'stick'], ['straw', 'straw'], ['worm', 'worm']];

maGen('len-measure', 'length', 'short', function (rng) {
  var obj = rng.pick(MA_LEN_THINGS)[0];
  var offset = rng.chance(0.2);
  var from = offset ? rng.int(1, 4) : 0;
  var to = rng.int(from + 3, 14);
  var len = to - from;
  var steps = offset
    ? ['The ' + obj + ' does not start at 0. It starts at ' + from + ' and ends at ' + to + '.',
       'Count the centimetres from ' + from + ' to ' + to + ', or subtract: ' + to + ' − ' + from + ' = ' + len + '.',
       'The ' + obj + ' is ' + len + ' cm long.']
    : ['The ' + obj + ' starts at 0 and ends at ' + to + '.', 'So the ' + obj + ' is ' + to + ' cm long.'];
  return { skill: 'length', type: 'number', level: offset ? 3 : 1, unit: 'cm',
    visual: { kind: 'ruler', from: from, to: to, object: obj }, prompt: 'How long is the ' + obj + '?', answer: len,
    explain: offset ? 'Read where it starts and where it ends, then find the difference.' : 'Read where the end of the ' + obj + ' lines up on the ruler.',
    steps: steps };
});

maGen('len-which', 'length', 'mcq', function (rng) {
  var obj = rng.pick(MA_LEN_THINGS)[0];
  var target = rng.int(4, 11);
  // Every option must fit on the 12 cm ruler it is drawn on.
  var lens = [target].concat(maDistinct(target, [target - 1, target + 1, target - 2, target + 2, target + 3]
    .filter(function (l) { return l >= 2 && l <= 12; }), 3, rng));
  var keys = [], vis = {}, txt = {};
  lens.forEach(function (l) {
    var key = 'len-' + l; keys.push(key);
    vis[key] = { kind: 'ruler', from: 0, to: l, object: obj, max: 12 }; txt[key] = 'the ' + obj + ' that is ' + l + ' cm long';
  });
  // optionsWide: two columns at full size. Squeezed four across, the
  // numbers at the right-hand end of each ruler run together, and that
  // is exactly where 9, 10 and 11 cm have to be told apart.
  return { skill: 'length', type: 'mcq', prompt: 'Which ' + obj + ' is **' + target + ' cm** long?',
    options: keys, optionVisuals: vis, optionText: txt, answer: keys[0], optionsWide: true,
    explain: 'Each one starts at 0, so look at where it ends.', steps: ['Look at where each ' + obj + ' ends on the ruler.', 'The one ending at ' + target + ' is ' + target + ' cm long.'] };
});

function maThreeLengths(rng) {
  var names = rng.shuffle(['pencil', 'crayon', 'ribbon', 'straw', 'stick']).slice(0, 3);
  var lens = [];
  while (lens.length < 3) { var l = rng.int(4, 20); if (lens.indexOf(l) === -1) lens.push(l); }
  return names.map(function (n, i) { return { name: n, len: lens[i] }; });
}

maGen('len-compare', 'length', 'mcq', function (rng) {
  var items = maThreeLengths(rng);
  var longest = rng.chance(0.5);
  var pick = items.slice().sort(function (a, b) { return longest ? b.len - a.len : a.len - b.len; })[0];
  return { skill: 'length', type: 'mcq', order: 'keep',
    prompt: items.map(function (it) { return 'The ' + it.name + ' is ' + it.len + ' cm long.'; }).join(' ') +
            ' Which is the **' + (longest ? 'longest' : 'shortest') + '**?',
    options: items.map(function (it) { return 'the ' + it.name; }), answer: 'the ' + pick.name,
    explain: 'The ' + (longest ? 'longest has the most' : 'shortest has the fewest') + ' centimetres: ' + pick.len + ' cm.',
    steps: ['Compare the numbers: ' + items.map(function (it) { return it.len; }).join(', ') + '.',
            'The ' + (longest ? 'greatest' : 'smallest') + ' is ' + pick.len + ', so the ' + pick.name + ' is the ' + (longest ? 'longest' : 'shortest') + '.'] };
});

maGen('len-order', 'length', 'short', function (rng) {
  var items = maThreeLengths(rng);
  var sorted = items.slice().sort(function (a, b) { return a.len - b.len; });
  return { skill: 'length', type: 'arrange', tiles: items.map(function (it) { return it.name; }),
    prompt: items.map(function (it) { return 'The ' + it.name + ' is ' + it.len + ' cm long.'; }).join(' ') +
            ' Put them in order, from the **shortest** to the **longest**.',
    answer: sorted.map(function (it) { return it.name; }).join(' '),
    explain: 'Order the lengths from the fewest centimetres to the most.',
    steps: ['Shortest to longest: ' + sorted.map(function (it) { return it.name + ' (' + it.len + ' cm)'; }).join(', ') + '.'] };
});

maGen('len-wp', 'length', 'wp', function (rng) {
  var n = rng.pick(MA_NAMES);
  if (rng.chance(0.5)) {
    var a = rng.int(10, 20), b = rng.int(3, a - 2);
    return { skill: 'length', type: 'number', unit: 'cm',
      prompt: 'A pencil is ' + a + ' cm long. A crayon is ' + b + ' cm long. How much longer is the pencil than the crayon?', answer: a - b,
      explain: '"How much longer" means find the difference.',
      steps: ['Longer − shorter = difference.', a + ' − ' + b + ' = ' + (a - b) + '.', 'The pencil is ' + (a - b) + ' cm longer.'] };
  }
  var x = rng.int(8, 30), y = rng.int(5, 25);
  return { skill: 'length', type: 'number', unit: 'cm',
    prompt: n + ' has two ribbons. One is ' + x + ' cm long and the other is ' + y + ' cm long. How long are the two ribbons altogether?', answer: x + y,
    explain: 'Altogether means add the two lengths.',
    steps: [x + ' + ' + y + ' = ' + (x + y) + '.', 'The two ribbons are ' + (x + y) + ' cm long altogether.'] };
});

// Shapes ------------------------------------------------------------------------------

var MA_SHAPES = ['rectangle', 'square', 'triangle', 'circle', 'half circle', 'quarter circle'];
var MA_SHAPE_WHY = {
  'rectangle': 'It has 4 straight sides and 4 corners. The sides opposite each other are the same length: 2 long sides and 2 short sides.',
  'square': 'It has 4 straight sides that are all the same length, and 4 corners.',
  'triangle': 'It has 3 straight sides and 3 corners.',
  'circle': 'It is round all the way, with no straight sides and no corners.',
  'half circle': 'It is half of a circle: one curved edge and one straight edge.',
  'quarter circle': 'It is a quarter of a circle: one curved edge and two straight edges that meet at a corner.'
};

/** Options that cannot make two answers right: never "rectangle" beside a square. */
function maShapeOptions(target, rng, n) {
  var pool = MA_SHAPES.filter(function (s) {
    if (s === target) return false;
    if (target === 'square' && s === 'rectangle') return false;
    if (target === 'rectangle' && s === 'square') return false;
    return true;
  });
  return [target].concat(rng.shuffle(pool).slice(0, n - 1));
}

maGen('shp-name', 'shape', 'mcq', function (rng) {
  var s = rng.pick(MA_SHAPES);
  return { skill: 'shape', type: 'mcq', visual: { kind: 'shape', name: s }, prompt: 'What is the name of this shape?',
    options: maShapeOptions(s, rng, 4), answer: s, explain: MA_SHAPE_WHY[s], steps: [MA_SHAPE_WHY[s], 'So it is a ' + s + '.'] };
});

maGen('shp-which', 'shape', 'mcq', function (rng) {
  var s = rng.pick(MA_SHAPES);
  var names = maShapeOptions(s, rng, 4);
  var vis = {}, txt = {};
  names.forEach(function (n) { vis[n] = { kind: 'shape', name: n }; txt[n] = 'the ' + n; });
  return { skill: 'shape', type: 'mcq', prompt: 'Which shape is a **' + s + '**?', options: names, optionVisuals: vis, optionText: txt,
    answer: s, explain: MA_SHAPE_WHY[s], steps: [MA_SHAPE_WHY[s]] };
});

maGen('shp-count', 'shape', 'short', function (rng) {
  var figs = Object.keys(EXAM_FIGURES), fig, counts, kinds, guard = 0;
  do {
    fig = rng.pick(figs);
    counts = examFigureCounts(fig);
    kinds = Object.keys(counts).filter(function (k) { return !(k === 'rectangle' && counts.square); });
  } while (!kinds.length && guard++ < 20);
  var k = rng.pick(kinds);
  return { skill: 'shape', type: 'number', visual: { kind: 'figure', name: fig },
    prompt: 'How many **' + maPlural(k) + '** are used to make this figure?', answer: counts[k],
    explain: 'Count each ' + k + ' once. Touch each one as you count it.',
    steps: ['Look for every ' + k + ': ' + MA_SHAPE_WHY[k].charAt(0).toLowerCase() + MA_SHAPE_WHY[k].slice(1),
            'There ' + (counts[k] === 1 ? 'is 1 ' + k : 'are ' + counts[k] + ' ' + maPlural(k)) + '.'] };
});

maGen('shp-notused', 'shape', 'mcq', function (rng) {
  var fig = rng.pick(Object.keys(EXAM_FIGURES));
  var counts = examFigureCounts(fig);
  var used = Object.keys(counts);
  var unused = MA_SHAPES.filter(function (s) {
    if (used.indexOf(s) !== -1) return false;
    if (s === 'rectangle' && counts.square) return false;   // a square is a rectangle
    return true;
  });
  var ans = rng.pick(unused);
  var shownUsed = rng.shuffle(used).slice(0, 3);
  return { skill: 'shape', type: 'mcq', visual: { kind: 'figure', name: fig },
    prompt: 'Which shape is **not** used to make this figure?', options: shownUsed.concat([ans]), answer: ans,
    explain: 'The figure is made of ' + used.map(function (u) { return counts[u] + ' ' + (counts[u] === 1 ? u : maPlural(u)); }).join(', ') + '. There is no ' + ans + '.',
    steps: ['Find each shape in the figure.', 'Used: ' + used.join(', ') + '.', 'Not used: ' + ans + '.'] };
});

maGen('shp-props', 'shape', 'short', function (rng) {
  var v = rng.pick([
    ['sides', 'triangle', 3], ['corners', 'triangle', 3], ['sides', 'rectangle', 4], ['corners', 'rectangle', 4],
    ['sides', 'square', 4], ['corners', 'square', 4], ['corners', 'circle', 0]
  ]);
  return { skill: 'shape', type: 'number', prompt: 'How many ' + v[0] + ' does a ' + v[1] + ' have?', answer: v[2],
    explain: MA_SHAPE_WHY[v[1]], steps: [MA_SHAPE_WHY[v[1]]] };
});

maGen('shp-riddle', 'shape', 'mcq', function (rng) {
  var v = rng.pick([
    ['I have 3 straight sides and 3 corners. What shape am I?', 'triangle'],
    ['I am round and I have no corners. What shape am I?', 'circle'],
    ['I have 4 sides that are all the same length, and 4 corners. What shape am I?', 'square'],
    ['I have 4 corners, 2 long sides and 2 short sides. What shape am I?', 'rectangle'],
    ['I am half of a circle. What shape am I?', 'half circle']
  ]);
  return { skill: 'shape', type: 'mcq', prompt: v[0], options: maShapeOptions(v[1], rng, 4), answer: v[1],
    explain: MA_SHAPE_WHY[v[1]], steps: [MA_SHAPE_WHY[v[1]], 'So it is a ' + v[1] + '.'] };
});

// Picture graphs (one picture = one thing) --------------------------------------------

// Every graph is a "favourite" survey so the same wording fits them all:
// "How many children chose Football?" reads properly; "come by Walk"
// would not.
var MA_GRAPHS = [
  { title: 'Our favourite fruit', noun: 'fruit', cats: ['🍎 Apple', '🍌 Banana', '🍊 Orange', '🍇 Grapes', '🍉 Watermelon'] },
  { title: 'Our favourite pet', noun: 'pet', cats: ['🐱 Cat', '🐶 Dog', '🐟 Fish', '🐰 Rabbit', '🐦 Bird'] },
  { title: 'Our favourite sport', noun: 'sport', cats: ['⚽ Football', '🏸 Badminton', '🏊 Swimming', '🏀 Basketball', '🎾 Tennis'] },
  { title: 'Our favourite ice cream', noun: 'flavour', cats: ['🍫 Chocolate', '🍓 Strawberry', '🍦 Vanilla', '🥭 Mango', '🍪 Cookie'] }
];

function maGraphData(rng) {
  var g = rng.pick(MA_GRAPHS);
  var cats = rng.shuffle(g.cats).slice(0, 4);
  var vals = rng.shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]).slice(0, 4);   // distinct: "the most" is one column
  return { g: g, rows: cats.map(function (c, i) { return { label: c, count: vals[i] }; }) };
}

function maGraphVisual(d) {
  return { kind: 'pgraph', title: d.g.title, symbol: '🙂', unitWord: 'child', rows: d.rows };
}

function maLabelWord(label) { return label.replace(/^\S+\s/, ''); }

maGen('graph-read', 'graph', 'short', function (rng) {
  var d = maGraphData(rng), r = rng.pick(d.rows);
  return { skill: 'graph', type: 'number', visual: maGraphVisual(d),
    prompt: 'How many children chose **' + maLabelWord(r.label) + '**?', answer: r.count,
    explain: 'Each 🙂 stands for 1 child, so count the 🙂 above ' + maLabelWord(r.label) + '.',
    steps: ['Find ' + maLabelWord(r.label) + ' at the bottom of the graph.', 'Count the 🙂 above it: ' + r.count + '.'] };
});

maGen('graph-most', 'graph', 'mcq', function (rng) {
  var d = maGraphData(rng), most = rng.chance(0.5);
  var pick = d.rows.slice().sort(function (a, b) { return most ? b.count - a.count : a.count - b.count; })[0];
  return { skill: 'graph', type: 'mcq', order: 'keep', visual: maGraphVisual(d),
    prompt: 'Which ' + d.g.noun + ' did the **' + (most ? 'most' : 'fewest') + '** children choose?',
    options: d.rows.map(function (r) { return maLabelWord(r.label); }), answer: maLabelWord(pick.label),
    explain: 'The ' + (most ? 'tallest' : 'shortest') + ' column has the ' + (most ? 'most' : 'fewest') + ' 🙂.',
    steps: ['Count each column: ' + d.rows.map(function (r) { return maLabelWord(r.label) + ' ' + r.count; }).join(', ') + '.',
            'The ' + (most ? 'most' : 'fewest') + ' is ' + maLabelWord(pick.label) + ', with ' + pick.count + '.'] };
});

maGen('graph-more', 'graph', 'wp', function (rng) {
  var d = maGraphData(rng);
  var two = rng.shuffle(d.rows).slice(0, 2).sort(function (a, b) { return b.count - a.count; });
  var a = two[0], b = two[1];
  return { skill: 'graph', type: 'number', visual: maGraphVisual(d),
    prompt: 'How many more children chose **' + maLabelWord(a.label) + '** than **' + maLabelWord(b.label) + '**?', answer: a.count - b.count,
    explain: '"How many more" means find the difference.',
    steps: [maLabelWord(a.label) + ': ' + a.count + '. ' + maLabelWord(b.label) + ': ' + b.count + '.',
            a.count + ' − ' + b.count + ' = ' + (a.count - b.count) + '.'] };
});

maGen('graph-total', 'graph', 'wp', function (rng) {
  var d = maGraphData(rng);
  var sum = d.rows.reduce(function (s, r) { return s + r.count; }, 0);
  return { skill: 'graph', type: 'number', visual: maGraphVisual(d),
    prompt: 'How many children are there altogether in the graph?', answer: sum,
    explain: 'Add up all the columns.',
    steps: [d.rows.map(function (r) { return r.count; }).join(' + ') + ' = ' + sum + '.', 'There are ' + sum + ' children altogether.'] };
});

// ---- Putting a paper together ----------------------------------------------------------

var MA_SECTIONS = [
  { id: 'A', name: 'Section A: Multiple choice', count: 10, fmt: 'mcq',
    instructions: 'Choose the correct answer.',
    slots: ['num', 'num', 'addsub', 'addsub', 'muldiv', 'time', 'time', 'length', 'shape', 'graph'] },
  { id: 'B', name: 'Section B: Short answers', count: 10, fmt: 'short',
    instructions: 'Work out each answer and write it in the box.',
    slots: ['num', 'num', 'addsub', 'addsub', 'addsub', 'mul', 'div', 'time', 'length', 'shape'] },
  { id: 'C', name: 'Section C: Word problems', count: 5, fmt: 'wp',
    instructions: 'Read each question twice. What do you know? What must you find? Then work it out.',
    slots: ['addsub', 'addsub', 'muldiv', 'measure', 'graph'] }
];

var MA_TOPICS = [
  { id: 'num',    name: 'Numbers to 100',          blurb: 'Place value, words, order, patterns, 1st to 10th' },
  { id: 'addsub', name: 'Adding and subtracting',  blurb: 'Within 100, with and without regrouping' },
  { id: 'mul',    name: 'Multiplication',          blurb: 'Equal groups and the × sign, within 40' },
  { id: 'div',    name: 'Division',                blurb: 'Sharing and grouping, within 20' },
  { id: 'time',   name: 'Time',                    blurb: 'To 5 minutes, am and pm, how long' },
  { id: 'length', name: 'Length',                  blurb: 'Measuring and comparing in cm' },
  { id: 'shape',  name: 'Shapes',                  blurb: 'Naming shapes and finding them in figures' },
  { id: 'graph',  name: 'Picture graphs',          blurb: 'Reading picture graphs' }
].map(function (t) { return Object.assign({ count: 10 }, t); });

function maGensFor(topic, fmt) {
  var list = MA_GENS.filter(function (g) { return g.topic === topic && (!fmt || g.fmt === fmt); });
  return list.length ? list : MA_GENS.filter(function (g) { return g.topic === topic; });
}

function maMake(gen, rng, sectionId) {
  var it = gen.make(rng);
  it.id = 'ma-' + gen.id;
  it.section = sectionId;
  if (!it.level) it.level = 1;
  return it;
}

function maSignature(it) {
  return it.prompt + '|' + JSON.stringify(it.answer) + '|' + JSON.stringify(it.visual || null);
}

/**
 * n questions for a section. `avoid` holds the signatures of questions
 * already on this paper, or for the practice papers on any earlier one;
 * new questions are added to it.
 */
function maGenerate(sec, n, rng, avoid) {
  var out = [], seen = {};
  avoid = avoid || {};
  var add = function (gens) {
    // Something new to the whole paper (and to the other practice papers)
    // if 30 tries find it; failing that, at least new to this section.
    var spare = null;
    for (var t = 0; t < 30; t++) {
      var it = maMake(maPickGen(gens, rng), rng, sec.id);
      var sig = maSignature(it);
      if (seen[sig]) continue;
      if (!avoid[sig]) { seen[sig] = avoid[sig] = 1; out.push(it); return; }
      if (!spare) spare = { it: it, sig: sig };
    }
    if (spare) { seen[spare.sig] = 1; out.push(spare.it); }
  };
  if (sec.slots) {
    rng.shuffle(sec.slots).slice(0, n).forEach(function (slot) {
      var topic = slot === 'muldiv' ? rng.pick(['mul', 'div']) : slot === 'measure' ? rng.pick(['time', 'length']) : slot;
      add(maGensFor(topic, sec.fmt));
    });
    // Formats, then a gentle easy-to-hard order within the section.
    return out.sort(function (a, b) { return (a.level || 1) - (b.level || 1); });
  }
  // A topic practice: mostly quick questions, with word problems last.
  var plan = [];
  for (var i = 0; i < n; i++) plan.push(i < Math.ceil(n * 0.4) ? 'mcq' : i < n - 2 ? 'short' : 'wp');
  plan.forEach(function (fmt) { add(maGensFor(sec.id, fmt)); });
  return out;
}

registerExamSubject({
  id: 'ma', name: 'Maths', icon: '🔢', lang: 'en-GB', minutes: 50,
  sections: MA_SECTIONS, practice: MA_TOPICS,
  generate: maGenerate,
  gens: MA_GENS
});
