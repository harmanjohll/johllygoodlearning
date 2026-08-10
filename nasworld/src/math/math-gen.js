// ============================================================
//  MATH GENERATORS — Question generators for all 28 skills
// ============================================================

function generateMathQuestion(skillId, config) {
  const diff = getSkillDifficulty(skillId);

  // A drill config can override the adaptive number range, so that
  // "practise adding up to 100" means exactly that regardless of level.
  if (config && config.numberRange) {
    diff.numberRange = config.numberRange.slice();
  }
  diff.config = config || null;

  // Word-problem mode short-circuits: if the learner asked for story
  // problems, serve those regardless of which skill she came in through.
  if (config && config.mode === 'word') {
    const wp = generateWordProblemFor(skillId, config, diff);
    if (wp) return wp;
  }

  switch (skillId) {
    // P1
    case 'count': return genCount(diff, config);
    case 'nbond': return genNBond(diff, config);
    case 'add':   return genAdd(diff, config);
    case 'sub':   return genSub(diff, config);
    case 'cmp':   return genCmp(diff);
    case 'pat':   return genPat(diff);
    case 'wp1':   return genWP1(diff, config);
    case 'shp':   return genShp(diff, config);
    // P2
    case 'add100':  return genAdd100(diff, config);
    case 'sub100':  return genSub100(diff, config);
    case 'mul':     return genMul(diff, config);
    case 'div':     return genDiv(diff, config);
    case 'frac1':   return genFrac1(diff, config);
    case 'money':   return genMoney(diff, config);
    case 'time1':   return genTime1(diff, config);
    case 'pgraph':  return genPGraph(diff, config);
    case 'lenmass': return genLenMass(diff, config);
    // P3
    case 'add10k':  return genAdd10k(diff, config);
    case 'sub10k':  return genSub10k(diff, config);
    case 'advmul':  return genAdvMul(diff, config);
    case 'divrem':  return genDivRem(diff, config);
    case 'fracadd': return genFracAdd(diff, config);
    case 'area':    return genArea(diff, config);
    case 'angle':   return genAngle(diff, config);
    case 'bargraph':return genBarGraph(diff, config);
    // P4
    case 'bignum':  return genBigNum(diff, config);
    case 'multiop': return genMultiOp(diff, config);
    case 'factor':  return genFactor(diff, config);
    case 'mixfrac': return genMixFrac(diff, config);
    case 'decimal': return genDecimal(diff, config);
    case 'symm':    return genSymm(diff, config);
    case 'dataan':  return genDataAn(diff, config);
    case 'multiwp': return genMultiWP(diff, config);
    default: return genCount(diff, config);
  }
}

// ===================== DIFFICULTY LADDERS =====================
//
// getSkillDifficulty() hands every skill the same generic numberRange:
// [1,10] at level 0 rising to [1,100] at level 4. That is tuned for P1
// addition and says nothing useful about five-digit place value, decimal
// tenths, or lines of symmetry. So twenty of the generators below used
// to ignore `diff` altogether, which meant the adaptive engine was a
// silent no-op for them: a child struggling at level 0 got exactly the
// same spread of questions as one flying at level 4.
//
// The fix is a per-generator ladder. Each generator declares its own
// five rungs in its own units, and picks one with tier().

/**
 * Pick this learner's rung from a per-generator difficulty ladder.
 * Ladders shorter than five rungs stretch evenly, so a three-rung ladder
 * maps levels 0..4 onto rungs 0, 0, 1, 1, 2.
 */
function tier(diff, ladder) {
  var lvl = (diff && typeof diff.level === 'number') ? diff.level : 0;
  if (!(lvl >= 0)) lvl = 0;          // also catches NaN
  if (lvl > 4) lvl = 4;
  return ladder[Math.floor(lvl * ladder.length / 5)];
}

/**
 * True if column addition of a and b needs at least one carry.
 * Only direct column sums are tested, which is sound in both directions:
 * if no column reaches ten on its own then no carry can propagate in.
 */
function _hasCarry(a, b) {
  while (a > 0 && b > 0) {
    if ((a % 10) + (b % 10) >= 10) return true;
    a = Math.floor(a / 10);
    b = Math.floor(b / 10);
  }
  return false;
}

/** True if column subtraction a - b needs at least one borrow. */
function _hasBorrow(a, b) {
  while (b > 0) {
    if ((a % 10) < (b % 10)) return true;
    a = Math.floor(a / 10);
    b = Math.floor(b / 10);
  }
  return false;
}

/**
 * n different values drawn from lo..hi.
 * Graph questions need this: "which has the most?" has no single right
 * answer if two bars tie, and a tied top bar used to mark a perfectly
 * good answer wrong in a third of picture-graph draws.
 */
function _distinctValues(n, lo, hi) {
  var pool = [];
  for (var v = lo; v <= hi; v++) pool.push(v);
  return shuffle(pool).slice(0, n);
}

// ===================== P1 GENERATORS =====================

function genCount(diff, config) {
  // MOE P1 goes to 100, not 20. Ten-frames stop being readable past 20,
  // so beyond that we switch to base-ten blocks (tens rods and ones),
  // which is the representation Singapore actually teaches.
  const max = (config && config.numberRange) ? config.numberRange[1]
                                             : Math.min(diff.numberRange[1], 20);
  const flag = config && config.flag;

  // Ordinal position ("who is 3rd in the queue?") — a P1 topic that was
  // missing from the app entirely.
  if (flag === 'ordinal' || (!flag && max <= 20 && Math.random() < 0.2)) {
    const queue = rand(5, 9);
    const pos = rand(1, queue);
    return {
      type: 'ordinal-position', queueLength: queue, position: pos,
      answer: ordinalWord(pos), subKey: 'ordinal',
      hint: 'Count from the front of the queue: first, second, third...'
    };
  }

  // Number in words ("which is forty-two?") — also a P1 requirement.
  if (flag === 'words' || (!flag && max > 20 && Math.random() < 0.25)) {
    const nw = rand(1, max);
    return {
      type: 'number-word', number: nw, answer: numberToWords(nw), subKey: 'words',
      hint: 'Say the tens first, then the ones.'
    };
  }

  const n = rand(1, max);
  if (n > 20) {
    return {
      type: 'place-value-count', number: n, answer: n,
      tens: Math.floor(n / 10), ones: n % 10,
      subKey: (config && config.rangeKey) || ('1-' + max),
      hint: 'Count the tens rods in tens, then add the loose ones.'
    };
  }
  return {
    type: 'ten-frame-count', number: n, answer: n,
    subKey: (config && config.rangeKey) || ('1-' + max),
    hint: 'Count each dot carefully! Try counting in groups.'
  };
}

var ORDINAL_WORDS = ['first','second','third','fourth','fifth','sixth','seventh','eighth','ninth','tenth'];
function ordinalWord(n) { return ORDINAL_WORDS[n - 1] || (n + 'th'); }

var _ONES_WORDS = ['zero','one','two','three','four','five','six','seven','eight','nine','ten',
  'eleven','twelve','thirteen','fourteen','fifteen','sixteen','seventeen','eighteen','nineteen'];
var _TENS_WORDS = ['','','twenty','thirty','forty','fifty','sixty','seventy','eighty','ninety'];
function numberToWords(n) {
  if (n < 20) return _ONES_WORDS[n];
  if (n === 100) return 'one hundred';
  var t = Math.floor(n / 10), o = n % 10;
  return _TENS_WORDS[t] + (o ? '-' + _ONES_WORDS[o] : '');
}

function genNBond(diff, config) {
  // A drill config pins the whole ("bonds to 10"); otherwise it follows level.
  const maxNum = (config && config.numberRange) ? config.numberRange[1]
                                                : (diff.level >= 2 ? 20 : 10);
  // Bonds to a FIXED whole are the ones worth automating, so when the
  // learner picks "bonds to 10" we hold the whole at 10 most of the time.
  const whole = (config && config.numberRange && Math.random() < 0.75)
    ? maxNum
    : rand(3, maxNum);
  const partA = rand(1, whole - 1);
  const partB = whole - partA;
  const missingPart = Math.random() < 0.5 ? 'left' : 'right';
  return {
    type: 'number-bond', whole, partA, partB, missingPart,
    answer: missingPart === 'left' ? partA : partB,
    subKey: (config && config.rangeKey) || ('to-' + maxNum),
    hint: 'If the whole is ' + whole + ' and one part is ' + (missingPart === 'left' ? partB : partA) + ', what\'s the other part?',
    isConcrete: diff.isConcrete
  };
}

function genAdd(diff, config) {
  // Singapore framing: a range of [1,10] means "addition WITHIN 10",
  // i.e. the SUM must not exceed 10. The old code halved the range and
  // so "up to 10" quietly meant "addends up to 5".
  const max = diff.numberRange[1];
  const a = rand(1, Math.max(1, max - 1));
  const b = rand(1, Math.max(1, max - a));
  const sum = a + b;
  const emoji = pick(OBJECT_EMOJIS);
  const subKey = (config && config.rangeKey) || ('1-' + max);
  const base = { a: a, b: b, answer: sum, subKey: subKey };

  if (diff.isConcrete) {
    return Object.assign(base, { type: 'addition-concrete', emoji: emoji,
      hint: 'Count all the objects together! ' + a + ' and ' + b + ' more makes...' });
  } else if (diff.isPictorial) {
    return Object.assign(base, { type: 'addition-pictorial', emoji: emoji,
      hint: 'Look at the bar model. How many in total?' });
  }
  return Object.assign(base, { type: 'addition-abstract',
    hint: a >= b ? ('Try counting on from ' + a + '.') : ('Try counting on from ' + b + '.') });
}

function genSub(diff, config) {
  // "Subtraction within 20" means the STARTING number can be up to 20.
  const max = diff.numberRange[1];
  const a = rand(2, max);
  const b = rand(1, a - 1);          // never negative, never trivially zero
  const result = a - b;
  const emoji = pick(OBJECT_EMOJIS);
  const subKey = (config && config.rangeKey) || ('1-' + max);
  const base = { a: a, b: b, answer: result, subKey: subKey };

  if (diff.isConcrete) {
    return Object.assign(base, { type: 'subtraction-concrete', emoji: emoji,
      hint: 'Start with ' + a + ', then take away ' + b + '. How many are left?' });
  }
  return Object.assign(base, { type: 'subtraction-abstract',
    hint: b > result ? ('Try counting up from ' + b + ' to ' + a + '.')
                     : ('Start at ' + a + ' and count back ' + b + '.') });
}

function genCmp(diff) {
  const [min, max] = diff.numberRange;
  var a, b;
  do { a = rand(min, max); b = rand(min, max); } while (a === b);
  return { type: 'comparing', a, b, answer: a > b ? '>' : '<',
    hint: 'Which number is bigger? Think about which comes later when counting.',
    isConcrete: diff.isConcrete };
}

function genPat(diff) {
  if (Math.random() < 0.5 || diff.level < 2) {
    var emojis = shuffle(['\uD83D\uDD34','\uD83D\uDD35','\uD83D\uDFE1','\uD83D\uDFE2','\uD83D\uDFE3','\uD83D\uDFE0']).slice(0, rand(2, 3));
    var pattern = [];
    for (var i = 0; i < 6; i++) pattern.push(emojis[i % emojis.length]);
    var answer = emojis[6 % emojis.length];
    return { type: 'pattern-shape', pattern, answer, options: shuffle([...emojis, pick(['\u26AB','\u26AA','\uD83D\uDFE4'])]),
      hint: 'Look at how the shapes repeat. What comes next?' };
  } else {
    var start = rand(1, 10);
    var step = rand(1, diff.level >= 3 ? 5 : 3);
    var pat = Array.from({length: 5}, function(_, i) { return start + i * step; });
    var ans = start + 5 * step;
    return { type: 'pattern-number', pattern: pat, answer: ans, step,
      hint: 'Look at the gaps between numbers. Each number goes up by...?' };
  }
}

function genWP1(diff) {
  var templates = [
    { text: function(a,b) { return 'Anastasia has ' + a + ' ' + pick(['apples','stickers','marbles','stars']) + '. She gets ' + b + ' more. How many does she have now?'; }, op: '+' },
    { text: function(a,b) { return 'There are ' + a + ' ' + pick(['birds','butterflies','fish']) + ' in the ' + pick(['tree','pond','garden']) + '. ' + b + ' fly away. How many are left?'; }, op: '-' },
    { text: function(a,b) { return 'Anastasia has ' + a + ' ' + pick(['cookies','sweets','cards']) + '. She gives ' + b + ' to her friend. How many does she have left?'; }, op: '-' },
    { text: function(a,b) { return a + ' ' + pick(['children','kittens','puppies']) + ' are playing. ' + b + ' more join them. How many are there now?'; }, op: '+' }
  ];
  var t = pick(templates);
  var mn = diff.numberRange[0], mx = diff.numberRange[1];
  var a, b, answer;
  if (t.op === '+') {
    a = rand(mn, Math.floor(mx/2)); b = rand(mn, Math.floor(mx/2)); answer = a + b;
  } else {
    b = rand(mn, Math.floor(mx/2)); a = rand(b+1, Math.min(b+Math.floor(mx/2), mx)); answer = a - b;
  }
  return { type: 'word-problem', text: t.text(a, b), a, b, answer, op: t.op,
    hint: 'Is it asking you to put together or take away?', isConcrete: diff.isConcrete };
}

function genShp(diff, config) {
  // Circle, square and triangle first. Pentagon and hexagon are the two
  // P1 children reliably confuse, so they only join once the easy three
  // are secure. Naming a shape is recognition; counting its sides from
  // memory is recall, so the side-count question weights in later.
  var pool = tier(diff, [
    ['circle', 'square', 'triangle'],
    ['circle', 'square', 'triangle', 'rectangle'],
    ['circle', 'square', 'triangle', 'rectangle', 'pentagon'],
    null,
    null
  ]);
  var data = pool
    ? SHAPE_DATA.filter(function(s) { return pool.indexOf(s.name) >= 0; })
    : SHAPE_DATA;
  var sidesChance = tier(diff, [0, 0.25, 0.4, 0.5, 0.65]);

  if (Math.random() >= sidesChance) {
    var shape = pick(data);
    var wrong = shuffle(SHAPE_DATA.filter(function(s) { return s.name !== shape.name; })).slice(0, 3);
    // answer is carried explicitly as well as inside `shape`, so any
    // generic consumer (review screen, spaced repetition, stats) can
    // read q.answer without special-casing this question type.
    return { type: 'shape-identify', shape: shape, answer: shape.name,
      options: shuffle([shape].concat(wrong)), hint: 'Count the sides and corners!' };
  }
  var sh = pick(data);
  return { type: 'shape-properties', shape: sh, answer: sh.sides, hint: 'Trace around the shape and count each side.' };
}

// ===================== P2 GENERATORS =====================

function genAdd100(diff, config) {
  // Regrouping ("carrying") is the actual hurdle in 2-digit addition,
  // so the drill screen lets her practise with it or without it.
  var flag = config && config.flag;
  var a, b;

  if (flag === 'noRegroup') {
    // Guarantee ones digits sum to under 10 so no carry is needed.
    var aOnes = rand(0, 8), bOnes = rand(0, 9 - aOnes);
    var aTens = rand(1, 8), bTens = rand(1, 9 - aTens);
    a = aTens * 10 + aOnes;
    b = bTens * 10 + bOnes;
  } else if (flag === 'regroup') {
    // Force the ones digits to cross ten.
    var aO = rand(2, 9), bO = rand(10 - aO, 9);
    var aT = rand(1, 7), bT = rand(1, 8 - aT);
    a = aT * 10 + aO;
    b = bT * 10 + bO;
  } else if (diff.isConcrete) {
    a = rand(10, 50); b = rand(10, 49);
  } else if (diff.isPictorial) {
    a = rand(20, 60); b = rand(20, 39);
  } else {
    a = rand(10, 89); b = rand(10, Math.max(10, 99 - a));
  }
  return { type: 'addition-100', a: a, b: b, answer: a + b,
    subKey: (config && config.rangeKey) || 'mixed',
    isConcrete: diff.isConcrete, isPictorial: diff.isPictorial,
    hint: ((a % 10) + (b % 10) >= 10)
      ? 'The ones add up past ten, so you will need to carry one ten over.'
      : 'Try adding the tens first, then the ones.' };
}

function genSub100(diff, config) {
  var flag = config && config.flag;
  var a, b;

  if (flag === 'noRegroup') {
    // Every digit of b is <= the matching digit of a, so no borrowing.
    var aT = rand(2, 9), aO = rand(1, 9);
    a = aT * 10 + aO;
    b = rand(1, aT - 1) * 10 + rand(0, aO);
  } else if (flag === 'regroup') {
    // Ones digit of b exceeds ones digit of a, forcing a borrow.
    var at = rand(2, 9), ao = rand(0, 7);
    a = at * 10 + ao;
    b = rand(1, at - 1) * 10 + rand(ao + 1, 9);
  } else {
    a = rand(30, 99);
    b = rand(10, a - 1);
  }
  return { type: 'subtraction-100', a: a, b: b, answer: a - b,
    subKey: (config && config.rangeKey) || 'mixed',
    isConcrete: diff.isConcrete,
    hint: ((a % 10) < (b % 10))
      ? 'The ones will not go, so break one ten open and borrow it.'
      : 'Try subtracting the tens first, then the ones.' };
}

function genMul(diff, config) {
  // Honour an explicit table selection from the Drill screen. Without
  // one, fall back to the tables a P2 child is expected to know.
  var tables = (config && config.tables && config.tables.length)
    ? config.tables
    : [2, 3, 4, 5, 10];

  // Bias selection toward the tables she is weakest at, so a mixed
  // drill still spends its time where it is needed.
  var table = _weightedPickSubSkill('mul', tables);
  var n = rand(1, 12);

  // Missing-factor variants build true fluency rather than recall of a
  // chant. Only once she is past the concrete stage.
  var variant = 'product';
  if (!diff.isConcrete && Math.random() < 0.25) variant = 'missing-factor';

  var answer = table * n;
  if (variant === 'missing-factor') {
    return {
      type: 'multiplication', variant: 'missing-factor',
      table: table, n: n, product: answer, answer: n,
      subKey: String(table),
      isConcrete: false, isPictorial: false,
      hint: 'How many ' + table + 's make ' + answer + '? Count up in ' + table + 's.'
    };
  }

  return {
    type: 'multiplication', variant: 'product',
    table: table, n: n, answer: answer,
    subKey: String(table),
    isConcrete: diff.isConcrete, isPictorial: diff.isPictorial,
    hint: table + ' times ' + n + ' means ' + n + ' groups of ' + table + '.'
  };
}

/**
 * Pick a sub-skill (times table, number band) with a bias toward the
 * ones the learner is weakest at. Untried items get a middling weight
 * so brand-new material still appears without dominating.
 */
function _weightedPickSubSkill(skillId, candidates) {
  if (!candidates || candidates.length === 0) return null;
  if (candidates.length === 1) return candidates[0];
  if (typeof subSkillMastery !== 'function') return pick(candidates);

  var weights = candidates.map(function(c) {
    var m = subSkillMastery(skillId, c);
    if (m === null) return 3;           // untried: moderate priority
    if (m >= 85) return 1;              // mastered: keep it warm, no more
    if (m >= 60) return 3;
    if (m >= 35) return 5;
    return 7;                            // weak: hammer it
  });
  var total = weights.reduce(function(a, b) { return a + b; }, 0);
  var r = Math.random() * total;
  for (var i = 0; i < candidates.length; i++) {
    r -= weights[i];
    if (r <= 0) return candidates[i];
  }
  return candidates[candidates.length - 1];
}

function genDiv(diff, config) {
  var divisors = (config && config.tables && config.tables.length)
    ? config.tables
    : [2, 3, 4, 5, 10];
  var divisor = _weightedPickSubSkill('div', divisors);
  var quotient = rand(1, 12);
  var dividend = divisor * quotient;
  return {
    type: 'division', dividend: dividend, divisor: divisor, answer: quotient,
    subKey: String(divisor),
    isConcrete: diff.isConcrete,
    hint: 'Share ' + dividend + ' equally into ' + divisor + ' groups. How many in each group?'
  };
}

function genFrac1(diff, config) {
  // Halves and quarters are the P2 entry point. Thirds and sixths need a
  // child to accept that a bigger denominator means a smaller piece,
  // which is the classic misconception, so they arrive later.
  var denoms = tier(diff, [
    [2, 4],
    [2, 3, 4],
    [2, 3, 4, 6],
    [2, 3, 4, 6, 8],
    [2, 3, 4, 5, 6, 8]
  ]);
  var denom = pick(denoms);
  var numer = rand(1, denom - 1);
  // Reading a shaded diagram is easier than producing one, so shading
  // only starts once she is past the concrete stage.
  var shadeChance = tier(diff, [0, 0.35, 0.5, 0.5, 0.6]);
  if (Math.random() >= shadeChance) {
    return { type: 'fraction-identify', numerator: numer, denominator: denom, answer: numer + '/' + denom,
      hint: 'Count how many parts are shaded out of the total.' };
  }
  return { type: 'fraction-shade', numerator: numer, denominator: denom, answer: numer,
    hint: 'Shade ' + numer + ' out of ' + denom + ' parts.' };
}

function genMoney(diff, config) {
  var flag = config && config.flag;
  // Round ten-cent prices first, because they can be counted in tens.
  // Five-cent prices come next, and only at the top does she meet prices
  // like 87 cents, where the change has to be worked out digit by digit.
  // Giving change is the harder of the two operations, so a beginner
  // only adds unless she has explicitly chosen to drill change.
  // Prices stay under a dollar throughout: this renderer prints cents,
  // and "390 cents" is not how a P2 child writes three dollars ninety.
  // The top rung gets its difficulty from prices no longer being round,
  // not from being large.
  var t = tier(diff, [
    { step: 10, lo: 1,  hi: 4,  changeOK: false },
    { step: 10, lo: 1,  hi: 8,  changeOK: true  },
    { step: 5,  lo: 2,  hi: 16, changeOK: true  },
    { step: 5,  lo: 4,  hi: 19, changeOK: true  },
    { step: 1,  lo: 25, hi: 99, changeOK: true  }
  ]);
  var price = function () { return rand(t.lo, t.hi) * t.step; };
  var items = [
    { name: 'pencil',   price: price() },
    { name: 'eraser',   price: price() },
    { name: 'notebook', price: price() },
    { name: 'ruler',    price: price() },
    { name: 'sticker',  price: price() }
  ];
  var item = pick(items);
  var wantAdd = flag === 'add' ? true
    : (flag === 'change' ? false
      : (!t.changeOK ? true : Math.random() < 0.5));
  if (wantAdd) {
    var item2 = pick(items.filter(function(i) { return i.name !== item.name; }));
    var total = item.price + item2.price;
    return { type: 'money-add', item1: item, item2: item2, answer: total,
      subKey: (config && config.rangeKey) || 'mixed',
      hint: 'Add the two prices together. ' + item.price + ' + ' + item2.price + ' cents.' };
  } else {
    var paid = Math.ceil(item.price / 100) * 100;
    if (paid <= item.price) paid = item.price + rand(1, 5) * 10;
    var change = paid - item.price;
    return { type: 'money-change', item, paid, answer: change,
      subKey: (config && config.rangeKey) || 'mixed',
      hint: 'How much change from ' + paid + ' cents after buying something for ' + item.price + ' cents?' };
  }
}

function genTime1(diff, config) {
  var hour = rand(1, 12);
  var minutes;
  var flag = config && config.flag;
  if (flag === 'oclock')        minutes = 0;
  else if (flag === 'half')     minutes = pick([0, 30]);
  else if (flag === 'quarter')  minutes = pick([0, 15, 30, 45]);
  else if (flag === 'fivemin')  minutes = pick([0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55]);
  else if (diff.level <= 1)     minutes = pick([0, 30]);
  else                          minutes = pick([0, 15, 30, 45]);
  var timeStr = hour + ':' + (minutes < 10 ? '0' : '') + minutes;
  var subKey = (config && config.rangeKey) || 'mixed';

  if (Math.random() < 0.5) {
    return { type: 'time-read', hour, minutes, answer: timeStr, subKey: subKey,
      hint: 'The short hand shows the hour, the long hand shows the minutes.' };
  }

  // "Which clock shows...?" — the mirror of reading a clock: she is
  // given the time in words and picks the matching face.
  //
  // This replaces the old 'time-set' type, which was broken twice over:
  // it rendered through renderTimeRead (asking "what time does the clock
  // show?" while displaying the answer) and its hint printed the answer
  // verbatim ("Set the clock to show 6:00").
  var words = timeInWords(hour, minutes);
  var faces = [{ hour: hour, minutes: minutes }];
  var guard = 0;
  while (faces.length < 4 && guard++ < 60) {
    var fh = rand(1, 12);
    var fm = pick(minutes === 0 ? [0, 30] : [0, 15, 30, 45]);
    if (!faces.some(function(f) { return f.hour === fh && f.minutes === fm; })) {
      faces.push({ hour: fh, minutes: fm });
    }
  }
  return {
    type: 'time-match', hour: hour, minutes: minutes,
    words: words, answer: timeStr, faces: shuffle(faces), subKey: subKey,
    hint: 'The short hand points to the hour. The long hand tells you how far past it.'
  };
}

/** "half past 3", "3 o'clock", "quarter past 3", "quarter to 4". */
function timeInWords(hour, minutes) {
  if (minutes === 0)  return hour + " o'clock";
  if (minutes === 30) return 'half past ' + hour;
  if (minutes === 15) return 'quarter past ' + hour;
  if (minutes === 45) return 'quarter to ' + (hour === 12 ? 1 : hour + 1);
  if (minutes < 30)   return minutes + ' minutes past ' + hour;
  return (60 - minutes) + ' minutes to ' + (hour === 12 ? 1 : hour + 1);
}

function genPGraph(diff, config) {
  // Reading one bar is easier than comparing bars, which is easier than
  // summing them all, so the question types ladder up alongside the size
  // of the numbers. Note the renderer only understands most, least,
  // total and howmany_N; anything else prints "How many undefined?".
  var t = tier(diff, [
    { cats: 3, max: 6,  types: ['howmany', 'most'] },
    { cats: 3, max: 8,  types: ['howmany', 'most', 'least'] },
    { cats: 4, max: 10, types: ['howmany', 'most', 'least', 'total'] },
    { cats: 4, max: 12, types: ['most', 'least', 'total'] },
    { cats: 5, max: 15, types: ['least', 'total', 'howmany'] }
  ]);
  var categories = shuffle(['Apples', 'Bananas', 'Oranges', 'Grapes', 'Strawberries']).slice(0, t.cats);
  // Distinct values throughout, so "which has the most?" always has
  // exactly one right answer.
  var values = _distinctValues(t.cats, 1, t.max);
  var qType = pick(t.types);
  var answer;
  if (qType === 'most') answer = categories[values.indexOf(Math.max.apply(null, values))];
  else if (qType === 'least') answer = categories[values.indexOf(Math.min.apply(null, values))];
  else if (qType === 'total') answer = values.reduce(function(a, b) { return a + b; }, 0);
  else { var idx = rand(0, categories.length - 1); answer = values[idx]; qType = 'howmany_' + idx; }
  return { type: 'picture-graph', categories: categories, values: values, qType: qType, answer: answer,
    hint: 'Look at the graph carefully. Count the pictures.' };
}

function genLenMass(diff, config) {
  // Comparing two lengths is a judgement; finding the difference is a
  // subtraction, so it weights in later. The gap between the two items
  // also narrows as she improves, because 30cm against 4cm is obvious
  // and 30cm against 27cm is not.
  var t = tier(diff, [
    { scale: 1,   diffChance: 0,    minGap: 8 },
    { scale: 1,   diffChance: 0.3,  minGap: 6 },
    { scale: 1,   diffChance: 0.5,  minGap: 4 },
    { scale: 2,   diffChance: 0.6,  minGap: 3 },
    { scale: 3,   diffChance: 0.7,  minGap: 2 }
  ]);
  var items, a, b, guard = 0;
  do {
    items = [
      { name: 'pencil', length: rand(10, 20) * t.scale },
      { name: 'book',   length: rand(20, 35) * t.scale },
      { name: 'ruler',  length: 30 * t.scale },
      { name: 'eraser', length: rand(3, 8) * t.scale }
    ];
    a = pick(items);
    b = pick(items.filter(function(i) { return i.name !== a.name; }));
  } while (Math.abs(a.length - b.length) < t.minGap && guard++ < 60);
  // A tie would make "which is longer?" unanswerable, so never ship one
  // even if the loop above ran out of attempts.
  if (a.length === b.length) b = { name: b.name, length: b.length + t.minGap };

  if (Math.random() >= t.diffChance) {
    return { type: 'length-compare', itemA: a, itemB: b, answer: a.length > b.length ? a.name : b.name,
      hint: 'Which item is longer?' };
  }
  return { type: 'length-difference', itemA: a, itemB: b, answer: Math.abs(a.length - b.length),
    hint: 'What is the difference in length?' };
}

// ===================== P3 GENERATORS =====================

function genAdd10k(diff, config) {
  // MOE P3 works to 10 000. The step that actually trips children is
  // regrouping, so the ladder walks digit count first and only then
  // starts insisting on carries.
  var t = tier(diff, [
    { lo: 10,   hi: 99,   carry: false },
    { lo: 100,  hi: 999,  carry: false },
    { lo: 100,  hi: 999,  carry: true  },
    { lo: 1000, hi: 4999, carry: true  },
    { lo: 1000, hi: 9999, carry: true  }
  ]);
  var a, b, guard = 0;
  do {
    a = rand(t.lo, t.hi);
    b = rand(t.lo, t.hi);
  } while (_hasCarry(a, b) !== t.carry && guard++ < 80);
  return { type: 'column-add', a: a, b: b, answer: a + b,
    hint: 'Line up the digits. Add ones first, then tens, then hundreds.' };
}

function genSub10k(diff, config) {
  var t = tier(diff, [
    { lo: 20,   hi: 99,   borrow: false },
    { lo: 100,  hi: 999,  borrow: false },
    { lo: 100,  hi: 999,  borrow: true  },
    { lo: 1000, hi: 4999, borrow: true  },
    { lo: 1000, hi: 9999, borrow: true  }
  ]);
  var a, b, guard = 0;
  do {
    a = rand(t.lo + 1, t.hi);
    b = rand(t.lo, a - 1);
  } while (_hasBorrow(a, b) !== t.borrow && guard++ < 80);
  return { type: 'column-sub', a: a, b: b, answer: a - b,
    hint: 'Line up the digits. Subtract ones first. Remember to regroup if needed.' };
}

function genAdvMul(diff) {
  var table = pick([6, 7, 8, 9]);
  var n = rand(2, 12);
  if (diff.level >= 3) {
    var a = rand(10, 99);
    var b = rand(2, 9);
    return { type: 'multi-digit-mul', a, b, answer: a * b,
      hint: 'Multiply the ones first, then the tens. Add them together.' };
  }
  return { type: 'multiplication', table, n, answer: table * n, isConcrete: diff.isConcrete, isPictorial: diff.isPictorial,
    hint: table + ' x ' + n + ' = ?' };
}

function genDivRem(diff, config) {
  var t = tier(diff, [
    { divisors: [2, 3],                qLo: 2, qHi: 5  },
    { divisors: [2, 3, 4, 5],          qLo: 2, qHi: 8  },
    { divisors: [2, 3, 4, 5, 6],       qLo: 3, qHi: 12 },
    { divisors: [3, 4, 5, 6, 7, 8],    qLo: 4, qHi: 15 },
    { divisors: [4, 5, 6, 7, 8, 9],    qLo: 6, qHi: 20 }
  ]);
  var divisor = pick(t.divisors);
  var quotient = rand(t.qLo, t.qHi);
  var remainder = rand(1, divisor - 1);
  var dividend = divisor * quotient + remainder;
  return { type: 'division-remainder', dividend: dividend, divisor: divisor,
    quotient: quotient, remainder: remainder, answer: quotient + ' R ' + remainder,
    hint: 'Divide ' + dividend + ' by ' + divisor + '. What\'s left over?' };
}

function genFracAdd(diff, config) {
  // Same-denominator work only, which is the P3 boundary. Halves are
  // excluded because 1/2 + 1/2 is the one sum this renderer would have
  // to write as 2/2, and no child says it that way.
  var t = tier(diff, [
    { denoms: [3, 4],              subChance: 0    },
    { denoms: [3, 4, 5],           subChance: 0.3  },
    { denoms: [3, 4, 5, 6],        subChance: 0.4  },
    { denoms: [4, 5, 6, 8],        subChance: 0.5  },
    { denoms: [5, 6, 8, 10, 12],   subChance: 0.5  }
  ]);
  var denom = pick(t.denoms);
  var isAdd = Math.random() >= t.subChance;
  var a, b;
  if (isAdd) {
    // Keep the sum a proper fraction, so the answer is never a whole.
    a = rand(1, denom - 2);
    b = rand(1, denom - 1 - a);
  } else {
    // a > b guarantees a positive answer of at least 1/denom.
    a = rand(2, denom - 1);
    b = rand(1, a - 1);
  }
  var answer = isAdd ? a + b : a - b;
  return { type: 'fraction-operation', a: a, b: b, denom: denom, op: isAdd ? '+' : '-',
    answer: answer + '/' + denom, answerNum: answer,
    hint: 'The denominators are the same, so just ' + (isAdd ? 'add' : 'subtract') + ' the numerators.' };
}

function genArea(diff, config) {
  // Both question types draw a grid, so the rectangle has to stay small
  // enough to count. Perimeter is the harder of the two (children reach
  // for length x width out of habit), so it weights in later.
  var t = tier(diff, [
    { wLo: 2, wHi: 4,  hLo: 2, hHi: 3, perimChance: 0.2 },
    { wLo: 2, wHi: 6,  hLo: 2, hHi: 5, perimChance: 0.35 },
    { wLo: 3, wHi: 8,  hLo: 2, hHi: 6, perimChance: 0.5 },
    { wLo: 4, wHi: 10, hLo: 3, hHi: 7, perimChance: 0.55 },
    { wLo: 5, wHi: 12, hLo: 4, hHi: 8, perimChance: 0.6 }
  ]);
  var w = rand(t.wLo, t.wHi);
  var h = rand(t.hLo, t.hHi);
  if (Math.random() >= t.perimChance) {
    return { type: 'area-count', width: w, height: h, answer: w * h,
      hint: 'Count all the squares inside the shape. Or use length x width.' };
  }
  return { type: 'perimeter-count', width: w, height: h, answer: 2 * (w + h),
    hint: 'Add up all the sides. Or use 2 x (length + width).' };
}

function genAngle(diff, config) {
  // Near-90 angles are the whole difficulty of this skill: 85 and 95
  // look identical at a glance. Early on, keep them well clear of the
  // corner so the judgement is honest rather than a coin flip.
  var t = tier(diff, [
    { acute: [20, 60], obtuse: [120, 170] },
    { acute: [20, 70], obtuse: [110, 170] },
    { acute: [25, 80], obtuse: [100, 165] },
    { acute: [40, 85], obtuse: [95, 150] },
    { acute: [60, 88], obtuse: [92, 130] }
  ]);
  var angles = [
    { type: 'right',  degrees: 90, desc: 'exactly 90 degrees' },
    { type: 'acute',  degrees: rand(t.acute[0], t.acute[1]),   desc: 'less than 90 degrees' },
    { type: 'obtuse', degrees: rand(t.obtuse[0], t.obtuse[1]), desc: 'more than 90 degrees' }
  ];
  var angle = pick(angles);
  return { type: 'angle-identify', angle: angle, answer: angle.type,
    options: shuffle(['right', 'acute', 'obtuse']),
    hint: 'A right angle is exactly 90 degrees. Acute is smaller, obtuse is larger.' };
}

function genBarGraph(diff, config) {
  var t = tier(diff, [
    { cats: 3, lo: 2, hi: 8,  types: ['howmany', 'most'] },
    { cats: 4, lo: 2, hi: 10, types: ['howmany', 'most', 'least'] },
    { cats: 4, lo: 2, hi: 15, types: ['most', 'least', 'total'] },
    { cats: 5, lo: 5, hi: 20, types: ['most', 'total', 'howmany'] },
    { cats: 5, lo: 5, hi: 30, types: ['least', 'total'] }
  ]);
  var categories = shuffle(['Mon', 'Tue', 'Wed', 'Thu', 'Fri']).slice(0, t.cats);
  // Distinct heights, so the "busiest day" question has one right answer.
  var values = _distinctValues(t.cats, t.lo, t.hi);
  var qType = pick(t.types);
  var answer;
  if (qType === 'most') answer = categories[values.indexOf(Math.max.apply(null, values))];
  else if (qType === 'least') answer = categories[values.indexOf(Math.min.apply(null, values))];
  else if (qType === 'total') answer = values.reduce(function(a, b) { return a + b; }, 0);
  else { var idx = rand(0, categories.length - 1); answer = values[idx]; qType = 'howmany_' + idx; }
  return { type: 'bar-graph', categories: categories, values: values, qType: qType, answer: answer,
    hint: 'Read the graph carefully. Compare the heights of the bars.' };
}

// ===================== P4 GENERATORS =====================

function genBigNum(diff, config) {
  // MOE P4 goes to 100 000, so the ladder climbs digit count within that
  // ceiling and then makes the work harder rather than the numbers
  // bigger: coarser rounding, and comparisons that differ only deep in
  // the number so left-to-right reading has to go all the way.
  var t = tier(diff, [
    { lo: 1000,  hi: 9999,  digits: 4, roundTo: [10, 100],         gap: 3000 },
    { lo: 1000,  hi: 9999,  digits: 4, roundTo: [10, 100, 1000],   gap: 1000 },
    { lo: 10000, hi: 99999, digits: 5, roundTo: [10, 100, 1000],   gap: 5000 },
    { lo: 10000, hi: 99999, digits: 5, roundTo: [100, 1000],       gap: 900  },
    { lo: 10000, hi: 99999, digits: 5, roundTo: [1000, 10000],     gap: 90   }
  ]);
  var n = rand(t.lo, t.hi);
  var qType = pick(['place-value', 'rounding', 'comparison']);
  if (qType === 'place-value') {
    var places = ['ones', 'tens', 'hundreds', 'thousands', 'ten thousands'];
    // Only ask about places the number actually has.
    var placeIdx = rand(0, t.digits - 1);
    var digit = Math.floor(n / Math.pow(10, placeIdx)) % 10;
    return { type: 'big-number-pv', number: n, place: places[placeIdx], answer: digit,
      hint: 'Look at the digit in the ' + places[placeIdx] + ' place.' };
  } else if (qType === 'rounding') {
    var roundTo = pick(t.roundTo);
    var rounded = Math.round(n / roundTo) * roundTo;
    return { type: 'big-number-round', number: n, roundTo: roundTo, answer: rounded,
      hint: 'Look at the digit to the right of where you are rounding.' };
  }
  var delta = rand(1, t.gap) * (Math.random() < 0.5 ? -1 : 1);
  var n2 = n + delta;
  if (n2 < 1 || n2 === n) n2 = n + t.gap;
  return { type: 'comparing', a: n, b: n2, answer: n > n2 ? '>' : '<',
    hint: 'Compare the digits from left to right.', isConcrete: false };
}

function genMultiOp(diff, config) {
  // Two-digit by two-digit is the P4 target. Getting there means going
  // through two-by-one first, which is where the partial-products idea
  // is actually learned.
  var t = tier(diff, [
    { aLo: 11, aHi: 30, bLo: 2,  bHi: 5,  dvLo: 2, dvHi: 4, qLo: 10, qHi: 30 },
    { aLo: 11, aHi: 50, bLo: 2,  bHi: 9,  dvLo: 2, dvHi: 6, qLo: 10, qHi: 40 },
    { aLo: 11, aHi: 99, bLo: 3,  bHi: 9,  dvLo: 2, dvHi: 9, qLo: 10, qHi: 60 },
    { aLo: 12, aHi: 99, bLo: 11, bHi: 30, dvLo: 3, dvHi: 9, qLo: 15, qHi: 80 },
    { aLo: 15, aHi: 99, bLo: 11, bHi: 99, dvLo: 4, dvHi: 9, qLo: 20, qHi: 99 }
  ]);
  if (Math.random() < 0.5) {
    var a = rand(t.aLo, t.aHi);
    var b = rand(t.bLo, t.bHi);
    return { type: 'long-multiplication', a: a, b: b, answer: a * b,
      hint: 'Multiply by ones digit, then by tens digit, then add.' };
  }
  var divisor = rand(t.dvLo, t.dvHi);
  var quotient = rand(t.qLo, t.qHi);
  var dividend = divisor * quotient;
  return { type: 'long-division', dividend: dividend, divisor: divisor, answer: quotient,
    hint: 'How many times does ' + divisor + ' go into ' + dividend + '?' };
}

function genFactor(diff, config) {
  // Numbers with plenty of factors first; the awkward ones (28, 42, 54)
  // where a child has to test past the obvious 2 and 3 come later.
  var t = tier(diff, [
    { nums: [6, 8, 10, 12],           lcmA: [2, 3],       lcmB: [3, 4, 5] },
    { nums: [12, 15, 16, 18, 20],     lcmA: [2, 3, 4],    lcmB: [3, 4, 5, 6] },
    { nums: [18, 24, 28, 30, 36],     lcmA: [2, 3, 4, 5], lcmB: [3, 4, 5, 6, 8] },
    { nums: [36, 40, 42, 48, 54],     lcmA: [3, 4, 5, 6], lcmB: [4, 5, 6, 7, 8] },
    { nums: [48, 56, 60, 64, 72],     lcmA: [4, 5, 6, 7], lcmB: [6, 7, 8, 9, 10] }
  ]);
  var n = pick(t.nums);
  if (Math.random() < 0.5) {
    var factors = [];
    for (var i = 1; i <= n; i++) { if (n % i === 0) factors.push(i); }
    return { type: 'find-factors', number: n, answer: factors.join(','), factors,
      hint: 'Which numbers divide evenly into ' + n + '?' };
  } else {
    // Avoid pairs where one divides the other: there the LCM is simply
    // the larger number, which the hint would then hand over for free.
    var a = pick(t.lcmA);
    var b = pick(t.lcmB);
    var guardL = 0;
    while ((a === b || b % a === 0 || a % b === 0) && guardL++ < 40) {
      b = pick(t.lcmB);
    }
    return { type: 'find-lcm', a: a, b: b, answer: lcm(a, b),
      hint: 'List multiples of ' + a + ' and ' + b + '. Find the smallest number in both lists.' };
  }
}

function genMixFrac(diff, config) {
  var t = tier(diff, [
    { wLo: 1, wHi: 3, denoms: [2, 3, 4] },
    { wLo: 1, wHi: 4, denoms: [2, 3, 4, 5] },
    { wLo: 1, wHi: 5, denoms: [2, 3, 4, 5, 6] },
    { wLo: 2, wHi: 7, denoms: [3, 4, 5, 6, 8] },
    { wLo: 2, wHi: 9, denoms: [4, 5, 6, 8, 10] }
  ]);
  var whole = rand(t.wLo, t.wHi);
  var denom = pick(t.denoms);
  var numer = rand(1, denom - 1);
  var improper = whole * denom + numer;
  if (Math.random() < 0.5) {
    return { type: 'mixed-to-improper', whole: whole, numer: numer, denom: denom,
      answer: improper + '/' + denom,
      hint: 'Multiply the whole number by the denominator, then add the numerator.' };
  }
  return { type: 'improper-to-mixed', improper: improper, denom: denom,
    answer: whole + ' ' + numer + '/' + denom,
    wholeAnswer: whole, numerAnswer: numer,
    hint: 'Divide ' + improper + ' by ' + denom + '. The quotient is the whole number, remainder is the numerator.' };
}

function genDecimal(diff, config) {
  // Tenths only for conversion, because the renderer builds its wrong
  // answers as one-decimal-place numbers; a two-place answer would stand
  // out from three one-place distractors and give itself away. The
  // ladder therefore grows the addition instead, and brings in sums that
  // cross a whole number, which is where the real difficulty lives.
  // `cross` is the real ladder here. Adding 1.2 and 3.4 is two digits set
  // side by side and teaches nothing; adding 1.7 and 3.6 forces a whole
  // to be carried out of the tenths, which is the actual skill. So early
  // levels deliberately avoid the carry and later ones insist on it.
  var t = tier(diff, [
    { fracHi: 9,  addHi: 20, cross: 'no'  },
    { fracHi: 29, addHi: 40, cross: 'no'  },
    { fracHi: 59, addHi: 60, cross: 'yes' },
    { fracHi: 99, addHi: 90, cross: 'yes' },
    { fracHi: 99, addHi: 99, cross: 'yes' }
  ]);
  if (Math.random() < 0.5) {
    var n = rand(1, t.fracHi);
    return { type: 'decimal-identify', fraction: n + '/10', answer: (n / 10).toFixed(1),
      hint: 'Divide by 10: move the decimal point one place left.' };
  }
  var an, bn, guard = 0;
  do {
    an = rand(1, t.addHi);
    bn = rand(1, t.addHi);
  } while ((((an % 10) + (bn % 10) >= 10) !== (t.cross === 'yes')) && guard++ < 80);
  return { type: 'decimal-add', a: (an / 10).toFixed(1), b: (bn / 10).toFixed(1),
    answer: ((an + bn) / 10).toFixed(1),
    hint: 'Line up the decimal points, then add normally.' };
}

function genSymm(diff, config) {
  // Shapes with an obvious axis first. The two that catch children out
  // are the parallelogram (none at all, despite looking regular) and the
  // scalene triangle, so they arrive last.
  var all = [
    { name: 'square', lines: 4 },
    { name: 'rectangle', lines: 2 },
    { name: 'circle', lines: 'infinite' },
    { name: 'equilateral triangle', lines: 3 },
    { name: 'isosceles triangle', lines: 1 },
    { name: 'regular hexagon', lines: 6 },
    { name: 'regular pentagon', lines: 5 },
    { name: 'parallelogram', lines: 0 },
    { name: 'scalene triangle', lines: 0 }
  ];
  var names = tier(diff, [
    ['square', 'rectangle', 'circle'],
    ['square', 'rectangle', 'circle', 'equilateral triangle'],
    ['square', 'rectangle', 'circle', 'equilateral triangle', 'isosceles triangle', 'regular hexagon'],
    ['rectangle', 'equilateral triangle', 'isosceles triangle', 'regular hexagon', 'regular pentagon', 'parallelogram'],
    null
  ]);
  var shapes = names ? all.filter(function(s) { return names.indexOf(s.name) >= 0; }) : all;
  var shape = pick(shapes);
  // Build the choices around the answer rather than from a fixed list:
  // a fixed list of [0,1,2,3,4,6] cannot express a pentagon's five.
  //
  // The options must all be the same type. The renderer decides whether
  // to quote them by looking at typeof q.answer, so slipping the string
  // 'infinite' in beside a numeric answer would emit a bare identifier
  // into the onclick and throw a ReferenceError the moment she taps it.
  var opts;
  if (shape.lines === 'infinite') {
    opts = shuffle([0, 1, 2, 3, 4, 5, 6]).slice(0, 3).concat(['infinite']);
  } else {
    opts = [0, 1, 2, 3, 4, 5, 6].filter(function(o) { return o !== shape.lines; });
    opts = shuffle(opts).slice(0, 3).concat([shape.lines]);
  }
  return { type: 'symmetry', shape: shape, answer: shape.lines,
    options: shuffle(opts),
    hint: 'A line of symmetry divides a shape into two matching halves.' };
}

function genDataAn(diff, config) {
  var t = tier(diff, [
    { n: 4, lo: 2,  hi: 10, types: ['total'] },
    { n: 4, lo: 2,  hi: 12, types: ['total', 'range'] },
    { n: 5, lo: 5,  hi: 20, types: ['total', 'range', 'average'] },
    { n: 5, lo: 5,  hi: 30, types: ['total', 'range', 'average'] },
    { n: 6, lo: 10, hi: 40, types: ['range', 'average'] }
  ]);
  var qType = pick(t.types);
  var data = [];
  var i;
  if (qType === 'average') {
    // The mean has to come out whole. The old version drew free data and
    // then rounded the mean, so four times in five the answer key was
    // not the answer: a child who correctly worked out 7.2 was marked
    // wrong, and one who answered 7 was marked right for bad arithmetic.
    // Build the set around a chosen mean instead, as pairs that cancel,
    // which keeps every value inside the band and the total exact.
    var mean = rand(t.lo + 2, t.hi - 2);
    var span = Math.min(mean - t.lo, t.hi - mean);
    if (t.n % 2 === 1) data.push(mean);
    var first = true;
    while (data.length < t.n) {
      var d = first ? rand(1, span) : rand(0, span);
      first = false;
      data.push(mean - d);
      data.push(mean + d);
    }
    data = shuffle(data);
  } else {
    for (i = 0; i < t.n; i++) data.push(rand(t.lo, t.hi));
  }
  var total = data.reduce(function(a, b) { return a + b; }, 0);
  var answer;
  if (qType === 'average') answer = total / data.length;
  else if (qType === 'total') answer = total;
  else answer = Math.max.apply(null, data) - Math.min.apply(null, data);
  return { type: 'data-analysis', data: data, qType: qType, answer: answer,
    hint: qType === 'average' ? 'Add all numbers, then divide by how many there are.' :
          qType === 'total' ? 'Add all the numbers together.' :
          'Subtract the smallest from the largest.' };
}

function genMultiWP(diff, config) {
  // Two-step problems are hard because of the hidden middle number, not
  // because of the arithmetic, so the ladder grows the numbers modestly
  // and holds back the sharing problem, which needs a division as its
  // second step.
  var t = tier(diff, [
    { scale: 0.5, share: false },
    { scale: 0.7, share: false },
    { scale: 1,   share: true  },
    { scale: 1.4, share: true  },
    { scale: 2,   share: true  }
  ]);
  // Round up so the smallest tier never collapses a range to nothing.
  var s = function(n) { return Math.max(1, Math.round(n * t.scale)); };

  var templates = [
    function() {
      var price = rand(s(3), s(15));
      var qty = rand(2, Math.max(3, s(5)));
      var money = rand(qty * price + 1, qty * price + s(20));
      return { text: 'Anastasia buys ' + qty + ' pens at $' + price + ' each. She pays with $' + money + '. How much change does she get?',
        answer: money - (qty * price), hint: 'First find the total cost, then subtract from the amount paid.' };
    },
    function() {
      var a = rand(s(20), s(50));
      var b = rand(s(5), s(20));
      var c = rand(s(5), s(15));
      if (b > a) { var swap = a; a = b; b = swap; }   // never sell more than the shop has
      return { text: 'A shop has ' + a + ' apples. They sell ' + b + ' in the morning and receive ' + c + ' more in the afternoon. How many apples are there now?',
        answer: a - b + c, hint: 'Start with ' + a + ', take away ' + b + ', then add ' + c + '.' };
    }
  ];
  if (t.share) {
    templates.push(function() {
      var people = rand(3, Math.max(4, s(8)));
      var each = rand(s(4), s(12));
      var extraPerPerson = rand(1, Math.max(2, s(4)));
      var extra = extraPerPerson * people;
      return { text: people + ' children each have ' + each + ' stickers. They are given ' + extra + ' more to share equally. How many stickers does each child have now?',
        answer: each + extraPerPerson, hint: 'First find the total, then add the shared extra.' };
    });
  }
  var gen = pick(templates)();
  return { type: 'multi-step-wp', text: gen.text, answer: gen.answer, hint: gen.hint };
}
