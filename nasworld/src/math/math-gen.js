// ============================================================
//  MATH GENERATORS — Question generators for every maths skill
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
    case 'num1000':    return genNum1000(diff, config);
    case 'addsub1000': return genAddSub1000(diff, config);
    case 'mass':       return genMass(diff, config);
    case 'volume':     return genVolume(diff, config);
    case 'wp2':        return genWP2(diff, config);
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

/**
 * Four choices: the answer plus the first three usable wrong answers.
 *
 * `wrongs` is listed most-telling first, so the mistakes children really
 * make (forgetting to regroup, reading the wrong hand) are offered ahead
 * of plain near-misses. Anything equal to the answer, repeated, or not a
 * real value is dropped, and `filler` tops the list up when the
 * misconceptions collapse onto each other, as they do in easy questions.
 */
function _choices(answer, wrongs, filler) {
  var opts = [answer], seen = {};
  seen[String(answer)] = true;
  function take(v) {
    if (v === null || v === undefined) return;
    if (typeof v === 'number' && !(isFinite(v) && v >= 0)) return;
    var k = String(v);
    if (seen[k] || opts.length >= 4) return;
    seen[k] = true;
    opts.push(v);
  }
  (wrongs || []).forEach(take);
  var guard = 0;
  while (opts.length < 4 && filler && guard++ < 200) take(filler(guard));
  return shuffle(opts);
}

/** 240 -> "$2.40". Money is held in whole cents so sums stay exact. */
function moneyStr(cents) {
  var c = cents % 100;
  return '$' + Math.floor(cents / 100) + '.' + (c < 10 ? '0' : '') + c;
}

/** "3:05". The maths world writes times with a colon throughout. */
function clockStr(hour, minutes) {
  return hour + ':' + (minutes < 10 ? '0' : '') + minutes;
}

/** The three digits of a number under 1000, hundreds first. */
function _digits3(n) {
  return [Math.floor(n / 100) % 10, Math.floor(n / 10) % 10, n % 10];
}

/** Column addition with every carry forgotten: 347 + 285 -> 522. */
function _addNoCarry(a, b) {
  var da = _digits3(a), db = _digits3(b);
  return ((da[0] + db[0]) % 10) * 100 + ((da[1] + db[1]) % 10) * 10 + ((da[2] + db[2]) % 10);
}

/**
 * Column subtraction done by taking the smaller digit from the larger in
 * every column, which is what a child does instead of regrouping:
 * 523 - 187 -> 464.
 */
function _subSmallFromLarge(a, b) {
  var da = _digits3(a), db = _digits3(b);
  return Math.abs(da[0] - db[0]) * 100 + Math.abs(da[1] - db[1]) * 10 + Math.abs(da[2] - db[2]);
}

/** Which columns carry: 0 none, 1 ones only, 2 tens only, 3 both. */
function _carryPattern(a, b) {
  var c1 = ((a % 10) + (b % 10) >= 10) ? 1 : 0;
  var c2 = ((Math.floor(a / 10) % 10) + (Math.floor(b / 10) % 10) + c1 >= 10) ? 1 : 0;
  return c1 + 2 * c2;
}

/** Which columns borrow: 0 none, 1 ones only, 2 tens only, 3 both. */
function _borrowPattern(a, b) {
  var b1 = ((a % 10) < (b % 10)) ? 1 : 0;
  var b2 = ((Math.floor(a / 10) % 10) - b1 < (Math.floor(b / 10) % 10)) ? 1 : 0;
  return b1 + 2 * b2;
}

function _capFirst(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

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
  if (n === 1000) return 'one thousand';
  if (n >= 100) {
    // British usage, which is what she is taught: "four hundred and six".
    var h = Math.floor(n / 100), rest = n % 100;
    return _ONES_WORDS[h] + ' hundred' + (rest ? ' and ' + numberToWords(rest) : '');
  }
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
  // Halves and quarters are the entry point. Thirds and sixths need a
  // child to accept that a bigger denominator means a smaller piece,
  // which is the classic misconception, so they arrive later.
  //
  // MOE P2 goes further than naming a shaded part: denominators run to
  // twelve, unit fractions and like fractions are compared and put in
  // order, and like fractions are added and subtracted within one whole.
  // Those are the upper rungs. Naming comes first, then shading, then
  // comparing, then the arithmetic.
  var t = tier(diff, [
    { denoms: [2, 4],                                kinds: ['identify'] },
    { denoms: [2, 3, 4],                             kinds: ['identify', 'identify', 'shade'] },
    { denoms: [2, 3, 4, 5, 6, 8],                    kinds: ['identify', 'shade', 'compare-unit'] },
    { denoms: [2, 3, 4, 5, 6, 8, 10],                kinds: ['shade', 'compare-unit', 'compare-like', 'add'] },
    { denoms: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],  kinds: ['identify', 'shade', 'compare-unit', 'compare-like', 'order', 'add', 'sub'] }
  ]);
  var kind = pick(t.kinds);
  var fr = function (n, d) { return n === d ? '1' : n + '/' + d; };
  var d, n, fracs, labels;

  if (kind === 'compare-unit' || kind === 'compare-like' || kind === 'order') {
    var unit = kind === 'compare-unit' || (kind === 'order' && Math.random() < 0.5);
    if (unit) {
      fracs = shuffle(t.denoms).slice(0, 3).map(function (dd) { return { n: 1, d: dd }; });
    } else {
      // Three different numerators need a denominator of at least four.
      d = pick(t.denoms.filter(function (x) { return x >= 4; }));
      fracs = _distinctValues(3, 1, d - 1).map(function (nn) { return { n: nn, d: d }; });
    }
    labels = fracs.map(function (f) { return f.n + '/' + f.d; });
    // Same numerators or same denominators throughout, so the sizes can
    // be compared exactly by cross-multiplying whole numbers.
    var bySize = fracs.slice().sort(function (p, q) { return p.n * q.d - q.n * p.d; });
    var hintC = unit
      ? 'Each fraction is one part. The more equal parts a whole is cut into, the smaller each part is.'
      : 'The parts are all the same size, so look at how many parts each fraction has.';

    if (kind === 'order') {
      var dir = pick(['smallest', 'greatest']);
      var ordered = (dir === 'smallest' ? bySize : bySize.slice().reverse())
        .map(function (f) { return f.n + '/' + f.d; });
      var perms = [[0, 1, 2], [0, 2, 1], [1, 0, 2], [1, 2, 0], [2, 0, 1], [2, 1, 0]]
        .map(function (p) { return [ordered[p[0]], ordered[p[1]], ordered[p[2]]].join(', '); });
      // The reversed order is the mistake that matters: it is what
      // "bigger bottom number means bigger fraction" produces.
      return { type: 'fraction-order', fractions: fracs, labels: labels, direction: dir,
        answer: perms[0], options: _choices(perms[0], [perms[5]].concat(shuffle(perms.slice(1, 5)))),
        hint: hintC };
    }
    var want = pick(['greatest', 'smallest']);
    var chosen = want === 'greatest' ? bySize[2] : bySize[0];
    return { type: 'fraction-compare', fractions: fracs, labels: labels, want: want,
      answer: chosen.n + '/' + chosen.d, options: labels.slice(),
      // Bars are the pictorial stage. Once she is past it she compares
      // from the numbers alone.
      showBars: diff.level <= 2, hint: hintC };
  }

  if (kind === 'add' || kind === 'sub') {
    d = pick(t.denoms);
    var a, b, ans, wrongs;
    if (kind === 'add') {
      // Within one whole: the sum may reach the whole but never pass it.
      a = rand(1, d - 1);
      b = rand(1, d - a);
      ans = a + b;
      wrongs = [
        ans + '/' + (2 * d),                           // added the bottom numbers too
        a !== b ? fr(Math.abs(a - b), d) : null,       // took away instead
        ans - 1 >= 1 ? fr(ans - 1, d) : null,
        ans + 1 <= d ? fr(ans + 1, d) : null
      ];
    } else {
      // Start from as much as one whole; always leave at least one part.
      a = rand(2, d);
      b = rand(1, a - 1);
      ans = a - b;
      wrongs = [
        a + b <= d ? fr(a + b, d) : null,              // added instead
        b !== ans ? fr(b, d) : null,                   // gave back what was taken
        ans + 1 <= d ? fr(ans + 1, d) : null,
        ans - 1 >= 1 ? fr(ans - 1, d) : null
      ];
    }
    return { type: 'fraction-like-op', a: a, b: b, denom: d, op: kind === 'add' ? '+' : '-',
      aLabel: fr(a, d), bLabel: fr(b, d), answerNum: ans, answer: fr(ans, d),
      options: _choices(fr(ans, d), wrongs, function (k) {
        if (k % 2) return fr(rand(1, d), d);
        // A filler over twice the denominator must not be the answer in
        // disguise: 2/4 is a second right answer to 1/2.
        var m = rand(1, 2 * d);
        return m === 2 * ans ? null : m + '/' + (2 * d);
      }),
      hint: 'The parts are the same size. ' + (kind === 'add' ? 'Add' : 'Take away') +
            ' the number of parts. The size of each part does not change.' };
  }

  d = pick(t.denoms);
  n = rand(1, d - 1);
  if (kind === 'shade') {
    return { type: 'fraction-shade', numerator: n, denominator: d, answer: n,
      hint: 'Shade ' + n + ' out of ' + d + ' parts.' };
  }
  // Wrong choices are the three ways children misread a shaded bar:
  // counting the unshaded parts, comparing shaded with unshaded, and
  // writing the fraction upside down.
  return { type: 'fraction-identify', numerator: n, denominator: d, answer: n + '/' + d,
    options: _choices(n + '/' + d, [
      (d - n) + '/' + d,
      n + '/' + (d - n),
      d + '/' + n,
      (n + 1) + '/' + d,
      n - 1 >= 1 ? (n - 1) + '/' + d : null,
      n + '/' + (d + 1)
    ]),
    hint: 'Count how many parts are shaded out of the total.' };
}

// Things a P2 child in Singapore actually buys, with the article she
// would read in a sentence.
var MONEY_ITEMS = [
  // lo and hi are the cheapest and dearest it can sensibly be, in cents,
  // so that a cup of Milo never costs more than a storybook.
  { name: 'pencil case',    a: 'a pencil case',    lo: 250, hi: 995 },
  { name: 'notebook',       a: 'a notebook',       lo: 100, hi: 450 },
  { name: 'storybook',      a: 'a storybook',      lo: 400, hi: 995 },
  { name: 'box of crayons', a: 'a box of crayons', lo: 200, hi: 800 },
  { name: 'water bottle',   a: 'a water bottle',   lo: 300, hi: 995 },
  { name: 'curry puff',     a: 'a curry puff',     lo: 50,  hi: 250 },
  { name: 'kaya toast set', a: 'a kaya toast set', lo: 200, hi: 600 },
  { name: 'cup of Milo',    a: 'a cup of Milo',    lo: 50,  hi: 250 },
  { name: 'bowl of fishball noodles', a: 'a bowl of fishball noodles', lo: 300, hi: 700 },
  { name: 'ice cream',      a: 'an ice cream',     lo: 50,  hi: 350 }
];
var MONEY_TENDER = { 100: 'a $1 coin', 200: 'a $2 note', 500: 'a $5 note', 1000: 'a $10 note' };

function genMoney(diff, config) {
  var flag = config && config.flag;
  // Round ten-cent prices first, because they can be counted in tens,
  // then five-cent prices and change from one dollar. Those two rungs
  // stay in cents, where a beginner can treat a price as a plain number.
  //
  // The upper three rungs are the P2 work proper: prices written in
  // dollars and cents ($2.40), added and subtracted, with change from
  // $1, $2, $5 and $10. Everything is held in whole cents and only
  // turned into "$2.40" for display, so no sum can pick up a rounding
  // error on the way.
  var t = tier(diff, [
    { unit: 'c', step: 10, lo: 1,   hi: 4,   changeOK: false },
    { unit: 'c', step: 5,  lo: 2,   hi: 19,  changeOK: true  },
    { unit: 'd', step: 10, lo: 110, hi: 490, carry: 'no',  kinds: ['convert', 'add', 'change'] },
    { unit: 'd', step: 5,  lo: 55,  hi: 895, carry: 'any', kinds: ['convert', 'add', 'change', 'diff'] },
    { unit: 'd', step: 5,  lo: 105, hi: 995, carry: 'yes', kinds: ['add', 'change', 'diff'] }
  ]);
  // "Dollars and cents" on the Practice screen means exactly that, even
  // for a child whose level would still serve her cents.
  if (flag === 'dollars' && t.unit === 'c') {
    t = { unit: 'd', step: 10, lo: 110, hi: 490, carry: 'no', kinds: ['convert', 'add', 'change'] };
  }
  var subKey = (config && config.rangeKey) || 'mixed';

  if (t.unit === 'c') {
    var price = function () { return rand(t.lo, t.hi) * t.step; };
    var items = [
      { name: 'pencil',   price: price() },
      { name: 'eraser',   price: price() },
      { name: 'notebook', price: price() },
      { name: 'ruler',    price: price() },
      { name: 'sticker',  price: price() }
    ];
    var item = pick(items);
    // Giving change is the harder of the two operations, so a beginner
    // only adds unless she has explicitly chosen to drill change.
    var wantAdd = flag === 'add' ? true
      : (flag === 'change' ? false
        : (!t.changeOK ? true : Math.random() < 0.5));
    if (wantAdd) {
      var item2 = pick(items.filter(function(i) { return i.name !== item.name; }));
      var total = item.price + item2.price;
      return { type: 'money-add', item1: item, item2: item2, answer: total, subKey: subKey,
        hint: 'Add the two prices together. ' + item.price + ' + ' + item2.price + ' cents.' };
    }
    var paid = Math.ceil(item.price / 100) * 100;
    if (paid <= item.price) paid = item.price + rand(1, 5) * 10;
    return { type: 'money-change', item: item, paid: paid, answer: paid - item.price, subKey: subKey,
      hint: 'How much change from ' + paid + ' cents after buying something for ' + item.price + ' cents?' };
  }

  // ---- dollars and cents ----
  var amount = function () { return rand(t.lo / t.step, t.hi / t.step) * t.step; };
  // A price for one thing: inside this rung's range and inside what
  // that thing can sensibly cost. Every item's band overlaps every rung.
  var priceOf = function (it) {
    return rand(Math.ceil(Math.max(t.lo, it.lo) / t.step), Math.floor(Math.min(t.hi, it.hi) / t.step)) * t.step;
  };
  var kind = flag === 'add' ? 'add' : (flag === 'change' ? 'change' : pick(t.kinds));
  var shop = shuffle(MONEY_ITEMS);
  var the = function (it) { return it.a.replace(/^an? /, 'the '); };
  var near = function (base) {
    return function () { var v = base + rand(-8, 8) * t.step; return v > 0 ? moneyStr(v) : null; };
  };
  var p1, p2, guard = 0, ans, wrongs;

  if (kind === 'convert') {
    // A price with no ten-cent digit ($3.05) is where the zero gets lost.
    var v = Math.random() < 0.35 ? rand(1, 9) * 100 + 5 : amount();
    var D = Math.floor(v / 100), C = v % 100;
    if (Math.random() < 0.5) {
      return { type: 'money-convert', cents: v, direction: 'to-cents', subKey: subKey,
        text: 'How many cents is ' + moneyStr(v) + '?',
        answer: v + ' cents',
        options: _choices(v + ' cents', [
          C < 10 ? (D * 10 + C) + ' cents' : null,          // lost the zero
          C % 10 === 0 && C > 0 ? (D * 10 + C / 10) + ' cents' : null,
          (v * 10) + ' cents',
          (D + C) + ' cents'                                // added dollars to cents
        ], function () { var f = v + rand(-9, 9) * 10; return f > 0 ? f + ' cents' : null; }),
        hint: 'One dollar is 100 cents. Change the dollars into cents first, then add the cents.' };
    }
    return { type: 'money-convert', cents: v, direction: 'to-dollars', subKey: subKey,
      text: 'Write ' + v + ' cents in dollars and cents.',
      answer: moneyStr(v),
      options: _choices(moneyStr(v), [
        C < 10 ? moneyStr(D * 100 + C * 10) : null,          // 305 cents read as $3.50
        '$' + v + '.00',
        moneyStr(v * 10),
        C % 10 === 0 ? moneyStr(v / 10) : null
      ], near(v)),
      hint: 'Every 100 cents makes one dollar. The cents left over go after the dot.' };
  }

  if (kind === 'add') {
    do {
      p1 = priceOf(shop[0]); p2 = priceOf(shop[1]);
      var cc = (p1 % 100) + (p2 % 100);
    } while (((t.carry === 'no' && cc >= 100) || (t.carry === 'yes' && cc < 100)) && guard++ < 200);
    ans = p1 + p2;
    wrongs = [
      (p1 % 100) + (p2 % 100) >= 100 ? ans - 100 : null,    // did not change 100 cents for a dollar
      p1 !== p2 ? Math.abs(p1 - p2) : null,                  // took away instead
      ans + 100, ans - 10, ans + 10
    ];
    return { type: 'money-add', inDollars: true, subKey: subKey,
      item1: { name: shop[0].name, price: p1 }, item2: { name: shop[1].name, price: p2 },
      text: _capFirst(shop[0].a) + ' costs ' + moneyStr(p1) + '. ' + _capFirst(shop[1].a) + ' costs ' +
            moneyStr(p2) + '. How much do they cost altogether?',
      answer: moneyStr(ans), answerCents: ans,
      options: _choices(moneyStr(ans), wrongs.map(function (w) { return w > 0 ? moneyStr(w) : null; }), near(ans)),
      hint: 'Add the cents and add the dollars. If the cents make 100 or more, change 100 cents for 1 dollar.' };
  }

  if (kind === 'diff') {
    do {
      // A fresh pair of things each try, so that the dearer one is
      // always the one named first.
      shop = shuffle(MONEY_ITEMS);
      p1 = priceOf(shop[0]); p2 = priceOf(shop[1]);
    } while ((p1 <= p2 || (t.carry === 'yes' && (p1 % 100) >= (p2 % 100))) && guard++ < 400);
    if (p1 <= p2) { p1 = 850; p2 = 275; shop = [MONEY_ITEMS[2], MONEY_ITEMS[5]]; }
    ans = p1 - p2;
    wrongs = [
      (p1 % 100) < (p2 % 100)                                // took the smaller cents from the larger
        ? (Math.floor(p1 / 100) - Math.floor(p2 / 100)) * 100 + ((p2 % 100) - (p1 % 100)) : null,
      p1 + p2,                                               // added instead
      ans + 100, ans + 10, ans - 10
    ];
    return { type: 'money-diff', inDollars: true, subKey: subKey,
      item1: { name: shop[0].name, price: p1 }, item2: { name: shop[1].name, price: p2 },
      text: _capFirst(shop[0].a) + ' costs ' + moneyStr(p1) + '. ' + _capFirst(shop[1].a) + ' costs ' +
            moneyStr(p2) + '. How much more does ' + the(shop[0]) + ' cost than ' + the(shop[1]) + '?',
      answer: moneyStr(ans), answerCents: ans,
      options: _choices(moneyStr(ans), wrongs.map(function (w) { return w > 0 ? moneyStr(w) : null; }), near(ans)),
      hint: 'Take the smaller price away from the bigger price. If there are not enough cents, change 1 dollar for 100 cents.' };
  }

  // Change. She pays with one coin or note that is more than the price:
  // usually the smallest that will do, sometimes a bigger one.
  p1 = priceOf(shop[0]);
  var tenders = [100, 200, 500, 1000].filter(function (x) { return x > p1; });
  var paidD = (tenders.length === 1 || Math.random() < 0.6) ? tenders[0] : pick(tenders.slice(1));
  ans = paidD - p1;
  wrongs = [
    p1 % 100 !== 0                                           // did not regroup a dollar into cents
      ? (Math.floor(paidD / 100) - Math.floor(p1 / 100)) * 100 + (p1 % 100) : null,
    ans + 100,                                               // regrouped, then forgot the dollar was spent
    ans + 10, ans - 10, paidD + p1
  ];
  return { type: 'money-change', inDollars: true, subKey: subKey,
    item: { name: shop[0].name, price: p1 }, paid: paidD,
    text: 'Nas buys ' + shop[0].a + ' for ' + moneyStr(p1) + '. She pays with ' + MONEY_TENDER[paidD] +
          '. How much change does she get?',
    answer: moneyStr(ans), answerCents: ans,
    options: _choices(moneyStr(ans), wrongs.map(function (w) { return w > 0 ? moneyStr(w) : null; }), near(ans)),
    hint: 'Change is the money paid take away the price. Try counting on from the price up to the money paid.' };
}

var TIME_HALF = [0, 30];
var TIME_QUARTER = [0, 15, 30, 45];
var TIME_FIVE = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];

// Things that can only happen in the morning or only after noon, so
// that am or pm is decided by the sentence and never by guessing.
// Twelve o'clock is left out on purpose: whether noon is am or pm is a
// separate puzzle from the one being asked here.
var TIME_DAY_EVENTS = [
  { text: 'Nas wakes up in the morning.',                    period: 'am', lo: 6, hi: 6 },
  { text: 'Nas eats breakfast before school.',               period: 'am', lo: 6, hi: 7 },
  { text: 'Nas has recess at school in the morning.',        period: 'am', lo: 9, hi: 10 },
  { text: 'Nas eats lunch after school.',                    period: 'pm', lo: 1, hi: 2 },
  { text: 'Nas plays at the playground in the afternoon.',   period: 'pm', lo: 4, hi: 5 },
  { text: 'Nas eats dinner with her family in the evening.', period: 'pm', lo: 6, hi: 7 },
  { text: 'Nas goes to bed at night.',                       period: 'pm', lo: 8, hi: 9 }
];

// Start hours are chosen so that even the longest activity ends before
// twelve, which keeps start and end on the same side of noon.
var TIME_ACTIVITIES = [
  { name: 'An art class',           period: 'am', lo: 7, hi: 8 },
  { name: 'A visit to the library', period: 'am', lo: 7, hi: 8 },
  { name: 'A bus ride to the zoo',  period: 'am', lo: 7, hi: 8 },
  { name: 'A swimming lesson',      period: 'pm', lo: 2, hi: 5 },
  { name: 'A football match',       period: 'pm', lo: 3, hi: 5 },
  { name: 'A piano lesson',         period: 'pm', lo: 1, hi: 6 },
  { name: 'A birthday party',       period: 'pm', lo: 1, hi: 5 }
];

/** 1 -> "half an hour", 3 -> "1 and a half hours", 4 -> "2 hours". */
function durationLabel(halves) {
  var whole = Math.floor(halves / 2);
  if (halves === 1) return 'half an hour';
  if (halves % 2) return whole + ' and a half hours';
  return whole + (whole === 1 ? ' hour' : ' hours');
}

/** The hour a child reads when she takes the wrong number for the hour hand. */
function _nearHour(hour, minutes) {
  // Past the half hour the short hand sits close to the next number.
  if (minutes >= 30) return hour % 12 + 1;
  return hour === 1 ? 2 : hour - 1;
}

/** The time read with the two hands mixed up: 3:35 becomes 7:15. */
function _swapHands(hour, minutes) {
  return { hour: minutes === 0 ? 12 : minutes / 5, minutes: (hour % 12) * 5 };
}

function genTime1(diff, config) {
  var flag = config && config.flag;
  // P1 reads the hour and the half hour. P2 reads to five minutes, says
  // whether it is am or pm, and finds how long something lasts in hours
  // and half hours. The ladder walks through them in that order; a drill
  // flag pins one step regardless of level.
  var t;
  if (flag === 'oclock')         t = { mins: [0],          kinds: ['read', 'match'] };
  else if (flag === 'half')      t = { mins: TIME_HALF,    kinds: ['read', 'match'] };
  else if (flag === 'quarter')   t = { mins: TIME_QUARTER, kinds: ['read', 'match'] };
  else if (flag === 'fivemin')   t = { mins: TIME_FIVE,    kinds: ['read', 'match'] };
  else if (flag === 'ampm')      t = { mins: TIME_FIVE,    kinds: ['ampm'] };
  else if (flag === 'duration')  t = { mins: TIME_FIVE,    kinds: ['duration'] };
  else t = tier(diff, [
    { mins: TIME_HALF,    kinds: ['read', 'match'] },
    { mins: TIME_QUARTER, kinds: ['read', 'match'] },
    { mins: TIME_FIVE,    kinds: ['read', 'match'] },
    { mins: TIME_FIVE,    kinds: ['read', 'match', 'ampm', 'ampm'] },
    { mins: TIME_FIVE,    kinds: ['read', 'match', 'ampm', 'duration', 'duration'] }
  ]);
  var subKey = (config && config.rangeKey) || 'mixed';
  var kind = pick(t.kinds);
  if (kind === 'ampm') return _genTimeAmPm(subKey);
  if (kind === 'duration') return _genTimeDuration(subKey);

  var hour = rand(1, 12);
  var minutes = pick(t.mins);
  var fine = t.mins.length > 4;
  var timeStr = clockStr(hour, minutes);
  var nh = _nearHour(hour, minutes);
  var sw = _swapHands(hour, minutes);

  if (kind === 'read') {
    var q = { type: 'time-read', hour: hour, minutes: minutes, answer: timeStr, subKey: subKey,
      hint: 'The short hand shows the hour, the long hand shows the minutes.' };
    if (fine) {
      // To five minutes the wrong choices have to be five-minute times
      // too, or the right one stands out. They are the three real
      // misreadings: the wrong hour, the hands mixed up, and the number
      // the long hand points at taken as the minutes.
      q.options = _choices(timeStr, [
        clockStr(nh, minutes),
        clockStr(sw.hour, sw.minutes),
        clockStr(hour, minutes === 0 ? 12 : minutes / 5)
      ], function () { return clockStr(rand(1, 12), pick(TIME_FIVE)); });
      q.hint = 'The long hand shows the minutes. Count in fives from the 12.';
    }
    return q;
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
  var addFace = function (fh, fm) {
    if (faces.length < 4 && !faces.some(function(f) { return f.hour === fh && f.minutes === fm; })) {
      faces.push({ hour: fh, minutes: fm });
    }
  };
  if (fine) {
    addFace(sw.hour, sw.minutes);
    addFace(nh, minutes);
  }
  var guard = 0;
  while (faces.length < 4 && guard++ < 60) {
    addFace(rand(1, 12), pick(fine ? TIME_FIVE : (minutes === 0 ? TIME_HALF : TIME_QUARTER)));
  }
  return {
    type: 'time-match', hour: hour, minutes: minutes,
    words: words, answer: timeStr, faces: shuffle(faces), subKey: subKey,
    hint: 'The short hand points to the hour. The long hand tells you how far past it.'
  };
}

function _genTimeAmPm(subKey) {
  var ev = pick(TIME_DAY_EVENTS);
  var hour = rand(ev.lo, ev.hi);
  var minutes = pick(TIME_FIVE);
  var other = ev.period === 'am' ? 'pm' : 'am';
  var nh = _nearHour(hour, minutes);
  var answer = clockStr(hour, minutes) + ' ' + ev.period;
  return { type: 'time-ampm', hour: hour, minutes: minutes, period: ev.period, subKey: subKey,
    text: ev.text + ' Look at the clock. What time is it?',
    answer: answer,
    options: shuffle([answer, clockStr(hour, minutes) + ' ' + other,
                      clockStr(nh, minutes) + ' ' + ev.period, clockStr(nh, minutes) + ' ' + other]),
    hint: 'We write am from midnight until just before noon. We write pm from noon until just before midnight.' };
}

function _genTimeDuration(subKey) {
  var act = pick(TIME_ACTIVITIES);
  var start = rand(act.lo, act.hi) * 60 + pick(TIME_HALF);
  // Hours and half hours only, up to three hours, always ending by 11:30.
  var halves = rand(1, Math.min(6, Math.floor((690 - start) / 30)));
  var end = start + halves * 30;
  var show = function (mins) { return clockStr(Math.floor(mins / 60), mins % 60) + ' ' + act.period; };
  var q = { type: 'time-duration', period: act.period, halves: halves, subKey: subKey,
    startHour: Math.floor(start / 60), startMinutes: start % 60,
    endHour: Math.floor(end / 60), endMinutes: end % 60 };

  if (Math.random() < 0.5) {
    q.variant = 'how-long';
    q.text = act.name + ' starts at ' + show(start) + ' and ends at ' + show(end) + '. How long is it?';
    q.answer = durationLabel(halves);
    var hoursOnly = 2 * (q.endHour - q.startHour);        // looked at the hours and ignored the minutes
    q.options = _choices(q.answer, [
      hoursOnly >= 1 ? durationLabel(hoursOnly) : null,
      durationLabel(halves + 1),
      halves - 1 >= 1 ? durationLabel(halves - 1) : null,
      durationLabel(halves + 2)
    ], function () { return durationLabel(rand(1, 8)); });
    q.hint = 'Count on from the start time in jumps of 30 minutes. Two jumps make a full hour.';
    return q;
  }
  q.variant = 'end';
  q.text = act.name + ' starts at ' + show(start) + '. It lasts ' + durationLabel(halves) + '. What time does it end?';
  q.answer = show(end);
  var inDay = function (mins) { return (mins >= 60 && mins <= 690 && mins !== start) ? show(mins) : null; };
  q.options = _choices(q.answer, [
    halves % 2 ? inDay(end - 30) : null,                  // added the hours and forgot the half
    inDay(end + 30), inDay(end - 30), inDay(end + 60), inDay(end - 60)
  ], function () { return inDay(rand(2, 23) * 30); });
  q.hint = 'Start at the first time. Count on the whole hours, then the half hour if there is one.';
  return q;
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
  // total, howmany_N and more_A_B; anything else prints "How many
  // undefined?".
  //
  // The top three rungs are the P2 picture graph proper: one picture
  // stands for 2, 3, 4, 5 or 10. `counts` is how many pictures are
  // drawn and `values` is what they are worth, so every answer is still
  // read straight off `values`.
  var t = tier(diff, [
    { cats: 3, max: 6, scales: [1],           types: ['howmany', 'most'] },
    { cats: 3, max: 8, scales: [1],           types: ['howmany', 'most', 'least'] },
    { cats: 4, max: 6, scales: [2],           types: ['howmany', 'most', 'least', 'total'] },
    { cats: 4, max: 7, scales: [2, 5, 10],    types: ['howmany', 'total', 'more'] },
    { cats: 5, max: 8, scales: [3, 4, 5, 10], types: ['howmany', 'least', 'total', 'more'] }
  ]);
  var categories = shuffle(['Apples', 'Bananas', 'Oranges', 'Grapes', 'Strawberries']).slice(0, t.cats);
  var scale = pick(t.scales);
  // Distinct values throughout, so "which has the most?" always has
  // exactly one right answer.
  var counts = _distinctValues(t.cats, 1, t.max);
  var values = counts.map(function (c) { return c * scale; });
  var sum = function (arr) { return arr.reduce(function(a, b) { return a + b; }, 0); };
  var qType = pick(t.types);
  var answer, wrongs = null;
  if (qType === 'most') answer = categories[values.indexOf(Math.max.apply(null, values))];
  else if (qType === 'least') answer = categories[values.indexOf(Math.min.apply(null, values))];
  else if (qType === 'total') {
    answer = sum(values);
    wrongs = [sum(counts), answer - scale, answer + scale];
  } else if (qType === 'more') {
    var pair = _distinctValues(2, 0, t.cats - 1);
    var hi = values[pair[0]] > values[pair[1]] ? pair[0] : pair[1];
    var lo = hi === pair[0] ? pair[1] : pair[0];
    answer = values[hi] - values[lo];
    qType = 'more_' + hi + '_' + lo;
    wrongs = [counts[hi] - counts[lo], values[hi] + values[lo], answer + scale, answer - scale];
  } else {
    var idx = rand(0, categories.length - 1);
    answer = values[idx];
    qType = 'howmany_' + idx;
    wrongs = [counts[idx], counts[idx] + scale, answer + scale, answer - scale];
  }
  var q = { type: 'picture-graph', categories: categories, values: values, qType: qType, answer: answer,
    hint: 'Look at the graph carefully. Count the pictures.' };
  if (scale > 1) {
    q.scale = scale;
    q.counts = counts;
    q.hint = 'Read the key first. Each picture stands for more than one, so count on in ' + scale + 's.';
    // The first wrong choice is always the number of pictures: the
    // answer of a child who did not read the key.
    if (wrongs) {
      q.options = _choices(answer, wrongs.map(function (w) { return w > 0 ? w : null; }),
        function () { return answer + rand(-4, 4) * scale; });
    }
  }
  return q;
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

// ===================== P2: NUMBERS TO 1000 =====================

/**
 * A few different numbers under 1000, and how alike they are.
 * 0: different hundreds, so the first digit settles it.
 * 1: same hundreds, different tens.
 * 2: same hundreds and tens, so only the ones differ.
 * 3: the same three digits in different orders, which is the real test
 *    of whether place decides size.
 */
function _numSet1000(count, near) {
  var h, t;
  if (near >= 3) {
    var d = _distinctValues(3, 1, 9);
    return shuffle([[0, 1, 2], [0, 2, 1], [1, 0, 2], [1, 2, 0], [2, 0, 1], [2, 1, 0]])
      .slice(0, count)
      .map(function (p) { return d[p[0]] * 100 + d[p[1]] * 10 + d[p[2]]; });
  }
  if (near === 2) {
    h = rand(1, 9); t = rand(0, 9);
    return _distinctValues(count, 0, 9).map(function (o) { return h * 100 + t * 10 + o; });
  }
  if (near === 1) {
    h = rand(1, 9);
    return _distinctValues(count, 0, 9).map(function (tt) { return h * 100 + tt * 10 + rand(0, 9); });
  }
  return _distinctValues(count, 1, 9).map(function (hh) { return hh * 100 + rand(0, 99); });
}

function genNum1000(diff, config) {
  // Place value comes first because everything else rests on it: a child
  // who reads 305 as "thirty-five" cannot compare it or count on from
  // it. So the ladder starts with base-ten blocks, moves to what each
  // digit is worth, then to comparing and ordering numbers that look
  // more and more alike, with number patterns running alongside.
  var t = tier(diff, [
    { kinds: ['blocks', 'blocks', 'compare', 'pattern'],         steps: [10, 100],              near: 0, zero: false, n: 2, back: false, mid: false },
    { kinds: ['blocks', 'value', 'compare', 'pattern'],          steps: [2, 5, 10, 100],        near: 0, zero: true,  n: 3, back: false, mid: false },
    { kinds: ['value', 'words', 'compare', 'order', 'pattern'],  steps: [2, 3, 4, 5, 10, 100],  near: 1, zero: true,  n: 3, back: false, mid: false },
    { kinds: ['value', 'words', 'order', 'pattern'],             steps: [2, 3, 4, 5, 10, 100],  near: 2, zero: true,  n: 3, back: true,  mid: true  },
    { kinds: ['value', 'words', 'compare', 'order', 'pattern'],  steps: [2, 3, 4, 5, 10, 100],  near: 3, zero: true,  n: 3, back: true,  mid: true  }
  ]);
  var flag = config && config.flag;
  var kind = flag === 'place' ? pick(['blocks', 'value', 'words'])
    : flag === 'compare' ? pick(['compare', 'order'])
    : flag === 'pattern' ? 'pattern'
    : pick(t.kinds);
  var subKey = (config && config.rangeKey) || 'mixed';
  var n, h, tn, o;

  if (kind === 'blocks') {
    h = rand(1, 9);
    tn = t.zero ? rand(0, 9) : rand(1, 9);
    o = t.zero ? rand(0, 9) : rand(1, 9);
    n = h * 100 + tn * 10 + o;
    return { type: 'pv-1000', variant: 'blocks', number: n, hundreds: h, tens: tn, ones: o,
      answer: n, subKey: subKey,
      options: _choices(n, [
        tn === 0 ? h * 10 + o : (o === 0 ? h * 10 + tn : null),   // left out the empty place
        o * 100 + tn * 10 + h,                                    // read the places backwards
        h + tn + o,                                               // counted every block as one
        n + 10, n - 10, n + 100
      ], function () { return n + rand(-20, 20); }),
      hint: 'Count the hundreds first, then the tens, then the ones.' };
  }

  if (kind === 'value') {
    // Three different digits, so "the digit 4" can only mean one place.
    var dg = _distinctValues(3, t.zero ? 0 : 1, 9);
    if (dg[0] === 0) { var s0 = dg[0]; dg[0] = dg[1]; dg[1] = s0; }
    n = dg[0] * 100 + dg[1] * 10 + dg[2];
    var places = ['hundreds', 'tens', 'ones'];
    var worth = [100, 10, 1];
    if (Math.random() < 0.5) {
      var pi = rand(0, 2);
      return { type: 'pv-1000', variant: 'digit', number: n, place: places[pi],
        answer: dg[pi], subKey: subKey,
        options: _choices(dg[pi], [dg[(pi + 1) % 3], dg[(pi + 2) % 3]],
          function () { return rand(0, 9); }),
        hint: 'From the left, the places are hundreds, tens and ones.' };
    }
    // Only a digit that is not zero has a value worth asking about.
    var cand = [0, 1, 2].filter(function (i) { return dg[i] !== 0; });
    var vi = pick(cand);
    var val = dg[vi] * worth[vi];
    var otherIdx = cand.filter(function (i) { return i !== vi; });
    return { type: 'pv-1000', variant: 'value', number: n, digit: dg[vi], place: places[vi],
      answer: val, subKey: subKey,
      // The same digit in each of the three places, then a different
      // digit of the number at its own value.
      options: _choices(val, [dg[vi], dg[vi] * 10, dg[vi] * 100]
          .concat(otherIdx.map(function (i) { return dg[i] * worth[i]; })),
        function () { return n; }),
      hint: 'Find which place the digit is in: hundreds, tens or ones.' };
  }

  if (kind === 'words') {
    h = rand(1, 9);
    // Numbers with nothing in the tens place are the ones children
    // write wrongly, so they come up more often than chance would give.
    var rest = Math.random() < 0.4 ? rand(1, 9) : rand(1, 99);
    n = h * 100 + rest;
    tn = Math.floor(rest / 10); o = rest % 10;
    return { type: 'pv-1000', variant: 'words', number: n, words: numberToWords(n),
      answer: n, subKey: subKey,
      options: _choices(n, [
        parseInt(String(h * 100) + String(rest), 10),      // wrote it as it sounds: 400 then 6
        tn !== o ? h * 100 + o * 10 + tn : null,           // tens and ones the wrong way round
        tn === 0 ? h * 10 + o : null,                      // left out the zero
        n + 10, n + 100
      ], function () { return n + rand(-30, 30); }),
      hint: 'Write the hundreds first. If there are no tens, put a zero in the tens place.' };
  }

  if (kind === 'compare') {
    var cs = _numSet1000(t.n, t.near);
    var want = pick(['greatest', 'smallest']);
    return { type: 'compare-1000', numbers: cs, want: want, subKey: subKey,
      answer: want === 'greatest' ? Math.max.apply(null, cs) : Math.min.apply(null, cs),
      options: cs.slice(),
      hint: 'Compare the hundreds first. If they are the same, compare the tens, then the ones.' };
  }

  if (kind === 'order') {
    var os = _numSet1000(3, t.near);
    var dir = pick(['smallest', 'greatest']);
    var sorted = os.slice().sort(function (a, b) { return dir === 'smallest' ? a - b : b - a; });
    var perms = [[0, 1, 2], [0, 2, 1], [1, 0, 2], [1, 2, 0], [2, 0, 1], [2, 1, 0]]
      .map(function (p) { return [sorted[p[0]], sorted[p[1]], sorted[p[2]]].join(', '); });
    return { type: 'order-1000', numbers: os, direction: dir, subKey: subKey,
      answer: perms[0],
      // The whole list backwards is the likeliest slip: right sizes,
      // wrong end to start from.
      options: _choices(perms[0], [perms[5]].concat(shuffle(perms.slice(1, 5)))),
      hint: 'Compare the hundreds first. If they are the same, compare the tens, then the ones.' };
  }

  // Number pattern: count on (or back) in equal steps, one number missing.
  var step = pick(t.steps);
  var dirn = (t.back && Math.random() < 0.4) ? -1 : 1;
  // Early on the numbers are the ones she chants: multiples of the step.
  // Later the pattern can start anywhere, which tests the step itself.
  var grid = t.near === 0 ? (step === 100 ? 10 : step) : 1;
  var lowest = Math.max(grid, Math.floor(rand(100, 1000 - 4 * step) / grid) * grid);
  var terms = [];
  for (var i = 0; i < 5; i++) terms.push(lowest + i * step);
  if (dirn < 0) terms.reverse();
  var blank = t.mid ? rand(0, 4) : 4;
  var ansP = terms[blank];
  // The steps children muddle with one another.
  var alt = { 2: [1, 3], 3: [2, 4], 4: [5, 3], 5: [10, 4], 10: [100, 1], 100: [10, 1] }[step];
  return { type: 'pattern-1000', terms: terms, blank: blank, step: step, direction: dirn,
    answer: ansP, subKey: subKey,
    options: _choices(ansP, [
      ansP + dirn * (alt[0] - step),                         // right start, wrong size of step
      ansP + step, ansP - step,                              // one step too far, or too few
      ansP + dirn * (alt[1] - step)
    ], function () { return ansP + rand(-9, 9); }),
    hint: 'Find the gap between two numbers that are next to each other. The gap is the same every time.' };
}

// ===================== P2: ADD AND SUBTRACT WITHIN 1000 =====================

// Only used if two hundred random draws somehow all miss the wanted
// regrouping pattern. The answer is still worked out from these.
var _ADDSUB_FALLBACK = {
  '+': { 0: [321, 145], 1: [327, 145], 2: [381, 145], 3: [387, 145] },
  '-': { 0: [587, 245], 1: [582, 245], 2: [527, 245], 3: [522, 245] }
};

function genAddSub1000(diff, config) {
  // Regrouping is the whole difficulty here, so it is the ladder: none,
  // then in the ones, then in the ones or the tens, then in both at
  // once. The last rung is where 500 - 237 lives.
  var t = tier(diff, [
    { b: 'simple', patterns: [0] },
    { b: 'any',    patterns: [0] },
    { b: 'any',    patterns: [1] },
    { b: 'any',    patterns: [1, 2] },
    { b: 'any',    patterns: [3] }
  ]);
  var flag = config && config.flag;
  var op = flag === 'add' ? '+' : (flag === 'sub' ? '-' : pick(['+', '-']));
  var a, b, guard = 0, okPair = false;
  while (!okPair && guard++ < 200) {
    a = rand(101, 989);
    // "Simple" keeps the second number to one place: ones, tens or hundreds.
    b = t.b === 'simple' ? pick([rand(1, 9), rand(1, 9) * 10, rand(1, 8) * 100]) : rand(11, 889);
    if (op === '+') okPair = a + b <= 1000 && t.patterns.indexOf(_carryPattern(a, b)) >= 0;
    else okPair = b < a && t.patterns.indexOf(_borrowPattern(a, b)) >= 0;
  }
  if (!okPair) {
    var fb = _ADDSUB_FALLBACK[op][t.patterns[0]];
    a = fb[0]; b = fb[1];
  }
  var regroup = op === '+' ? _carryPattern(a, b) > 0 : _borrowPattern(a, b) > 0;
  var answer, wrongs, hint;
  if (op === '+') {
    answer = a + b;
    wrongs = [
      _addNoCarry(a, b),                 // forgot to regroup
      answer + 10,                       // regrouped twice
      a - b,                             // took away instead
      answer - 100, answer + 100, answer - 10
    ];
    hint = regroup
      ? 'Add the ones first. If they make 10 or more, regroup 10 ones as 1 ten. Do the same with the tens.'
      : 'Add the ones, then the tens, then the hundreds.';
  } else {
    answer = a - b;
    wrongs = [
      _subSmallFromLarge(a, b),          // took the smaller digit from the larger in each place
      answer + 10,                       // regrouped a ten but did not take it off the tens
      answer + 100,
      a + b <= 1000 ? a + b : null,      // added instead
      answer - 10
    ];
    hint = regroup
      ? 'Start with the ones. If there are not enough, regroup 1 ten as 10 ones. Do the same with the tens.'
      : 'Subtract the ones, then the tens, then the hundreds.';
  }
  return { type: 'addsub-1000', a: a, b: b, op: op, answer: answer, regroup: regroup,
    subKey: (config && config.rangeKey) || 'mixed',
    options: _choices(answer, wrongs.map(function (w) { return w > 0 ? w : null; }),
      function () { return answer + rand(-12, 12); }),
    hint: hint };
}

// ===================== P2: MASS AND VOLUME =====================

var MEASURE_SPECS = {
  mass: {
    names: {
      kg: ['watermelon', 'bag of rice', 'durian', 'pumpkin', 'school bag', 'box of books', 'sack of potatoes'],
      g:  ['mango', 'apple', 'curry puff', 'packet of noodles', 'carrot', 'bun', 'tin of biscuits', 'papaya']
    },
    words: { more2: 'heavier', less2: 'lighter', most: 'the heaviest', least: 'the lightest' },
    // kg first, because a child can lift a kilogram and feel it. Grams
    // bring bigger numbers and a scale whose small marks are worth more
    // than one, which is the hard part of reading it.
    tiers: [
      { kinds: ['compare', 'scale'],         unit: 'kg', n: 2, lo: 1,  hi: 9,   mult: 1,  gap: 3,   scale: { max: 10,   label: 1,   tick: 1 },  calcHi: 10 },
      { kinds: ['compare', 'scale', 'calc'], unit: 'kg', n: 2, lo: 2,  hi: 19,  mult: 1,  gap: 2,   scale: { max: 20,   label: 2,   tick: 1 },  calcHi: 20 },
      { kinds: ['compare', 'scale', 'calc'], unit: 'g',  n: 3, lo: 50, hi: 950, mult: 50, gap: 100, scale: { max: 1000, label: 100, tick: 50 }, calcHi: 1000 },
      { kinds: ['compare', 'scale', 'calc'], unit: 'g',  n: 3, lo: 50, hi: 950, mult: 10, gap: 30,  scale: { max: 500,  label: 100, tick: 20 }, calcHi: 1000 },
      { kinds: ['compare', 'scale', 'calc'], unit: 'g',  n: 3, lo: 50, hi: 950, mult: 5,  gap: 10,  scale: { max: 500,  label: 100, tick: 10 }, calcHi: 1000 }
    ]
  },
  volume: {
    names: {
      // Past about twenty litres no kettle or pail is believable, so the
      // big numbers belong to plain lettered tanks.
      small: ['pail', 'basin', 'kettle', 'watering can', 'cooking pot', 'fish bowl'],
      big:   ['Tank A', 'Tank B', 'Tank C']
    },
    words: { more2: 'more water', less2: 'less water', most: 'the most water', least: 'the least water' },
    tiers: [
      { kinds: ['compare', 'scale'],         unit: 'ℓ', n: 2, lo: 1,  hi: 9,  mult: 1, gap: 2, scale: { max: 5,  label: 1,  tick: 1 }, calcHi: 10 },
      { kinds: ['compare', 'scale', 'calc'], unit: 'ℓ', n: 2, lo: 2,  hi: 18, mult: 1, gap: 2, scale: { max: 10, label: 2,  tick: 1 }, calcHi: 20 },
      { kinds: ['compare', 'scale', 'calc'], unit: 'ℓ', n: 3, lo: 5,  hi: 30, mult: 1, gap: 3, scale: { max: 10, label: 5,  tick: 1 }, calcHi: 50 },
      { kinds: ['compare', 'scale', 'calc'], unit: 'ℓ', n: 3, lo: 10, hi: 60, mult: 1, gap: 2, scale: { max: 20, label: 5,  tick: 1 }, calcHi: 100 },
      { kinds: ['compare', 'scale', 'calc'], unit: 'ℓ', n: 3, lo: 20, hi: 99, mult: 1, gap: 1, scale: { max: 50, label: 10, tick: 2 }, calcHi: 100 }
    ]
  }
};

function _aOrAn(name) {
  if (/^Tank /.test(name)) return name;
  return (/^[aeiou]/i.test(name) ? 'an ' : 'a ') + name;
}
function _theName(name) { return /^Tank /.test(name) ? name : 'the ' + name; }

function _genMeasure(quantity, diff, config) {
  var spec = MEASURE_SPECS[quantity];
  var t = tier(diff, spec.tiers);
  var flag = config && config.flag;
  var kind = (flag === 'compare' || flag === 'scale') ? flag
    : (flag === 'calc' ? 'calc' : pick(t.kinds));
  var subKey = (config && config.rangeKey) || 'mixed';
  var unit = t.unit;
  var pool = quantity === 'mass' ? spec.names[unit] : (t.hi > 20 ? spec.names.big : spec.names.small);
  var names = shuffle(pool);
  var W = spec.words;

  if (kind === 'compare') {
    // Different amounts, at least `gap` apart, so there is one answer
    // and it can be seen. The gap closes as she improves.
    var vals, guard = 0, apart;
    do {
      vals = _distinctValues(t.n, t.lo / t.mult, t.hi / t.mult).map(function (v) { return v * t.mult; });
      apart = vals.every(function (v, i) {
        return vals.every(function (w, j) { return i === j || Math.abs(v - w) >= t.gap; });
      });
    } while (!apart && guard++ < 100);
    var items = vals.map(function (v, i) { return { name: names[i], value: v }; });
    var most = Math.random() < 0.5;
    var target = items.reduce(function (best, it) {
      return (most ? it.value > best.value : it.value < best.value) ? it : best;
    });
    var ask = quantity === 'mass'
      ? 'Which is ' + (t.n === 2 ? (most ? W.more2 : W.less2) : (most ? W.most : W.least)) + '?'
      : 'Which holds ' + (t.n === 2 ? (most ? W.more2 : W.less2) : (most ? W.most : W.least)) + '?';
    return { type: 'measure-compare', quantity: quantity, unit: unit, items: items, text: ask,
      answer: target.name, options: items.map(function (it) { return it.name; }), subKey: subKey,
      hint: 'Compare the numbers. They are all in the same unit.' };
  }

  if (kind === 'scale') {
    var sc = t.scale;
    var value, tries = 0;
    // When the small marks are not numbered, land between the numbers
    // most of the time: that is the reading worth practising.
    do {
      value = rand(1, sc.max / sc.tick - 1) * sc.tick;
    } while (sc.label > sc.tick && value % sc.label === 0 && Math.random() < 0.85 && tries++ < 40);
    var below = Math.floor(value / sc.label) * sc.label;
    var marks = (value - below) / sc.tick;
    return { type: 'measure-scale', quantity: quantity, unit: unit,
      max: sc.max, labelStep: sc.label, tickStep: sc.tick, value: value,
      item: names[0],
      text: quantity === 'mass'
        ? _capFirst(_aOrAn(names[0])) + ' is on the weighing scale. What is its mass?'
        : 'How much water is in the tank?',
      answer: value, subKey: subKey,
      options: _choices(value, [
        marks > 0 && sc.tick !== 1 ? below + marks : null,          // counted each small mark as 1
        marks > 0 && sc.tick !== 10 ? below + marks * 10 : null,    // counted each small mark as 10
        marks > 0 && below > 0 ? below : null,                      // read the number just before
        marks > 0 ? below + sc.label : null,                        // read the number just after
        value + sc.tick, value - sc.tick
      ].map(function (w) { return (w > 0 && w <= sc.max) ? w : null; }),
        function (k) { var f = value + rand(-4, 4) * sc.tick; return (f > 0 && f <= sc.max) ? f : null; }),
      hint: sc.label > sc.tick
        ? 'Find the numbered marks on each side. Work out what one small mark is worth, then count on.'
        : 'Find the mark the ' + (quantity === 'mass' ? 'needle points to' : 'water reaches') + '. Read the number beside it.' };
  }

  // One-step sum or difference, in one unit.
  var step = t.mult;
  var mode = pick(['total', 'more', 'left']);
  var a, b, ans, text, wrongs;
  var amt = function (v) { return v + ' ' + unit; };
  // Nothing in a story is smaller than the rung's smallest amount, so
  // no apple weighs 5 g and no pail holds 1 litre at the top level.
  var loU = Math.ceil(t.lo / step), hiU = Math.floor(t.calcHi / step);
  if (mode === 'total') {
    a = rand(loU, hiU - loU) * step;
    b = rand(loU, hiU - a / step) * step;
    ans = a + b;
    text = quantity === 'mass'
      ? _capFirst(_aOrAn(names[0])) + ' has a mass of ' + amt(a) + '. ' + _capFirst(_aOrAn(names[1])) +
        ' has a mass of ' + amt(b) + '. What is their total mass?'
      : _capFirst(_aOrAn(names[0])) + ' holds ' + amt(a) + ' of water. ' + _capFirst(_aOrAn(names[1])) +
        ' holds ' + amt(b) + ' of water. How much water do they hold altogether?';
    wrongs = [a !== b ? Math.abs(a - b) : null, _addNoCarry(a, b), ans + 10, ans - 10, ans + step, ans - step];
  } else {
    a = rand(2 * loU, hiU) * step;
    b = rand(loU, a / step - loU) * step;
    ans = a - b;
    if (mode === 'more') {
      text = quantity === 'mass'
        ? _capFirst(_aOrAn(names[0])) + ' has a mass of ' + amt(a) + '. ' + _capFirst(_aOrAn(names[1])) +
          ' has a mass of ' + amt(b) + '. How much heavier is ' + _theName(names[0]) + ' than ' + _theName(names[1]) + '?'
        : _capFirst(_aOrAn(names[0])) + ' holds ' + amt(a) + ' of water. ' + _capFirst(_aOrAn(names[1])) +
          ' holds ' + amt(b) + ' of water. How much more water does ' + _theName(names[0]) + ' hold than ' + _theName(names[1]) + '?';
    } else {
      text = quantity === 'mass'
        ? (unit === 'kg'
            ? 'A shop had ' + amt(a) + ' of rice. It sold ' + amt(b) + ' of rice. How much rice is left?'
            : 'Mummy had ' + amt(a) + ' of flour. She used ' + amt(b) + ' of flour to bake a cake. How much flour is left?')
        : 'A tank had ' + amt(a) + ' of water. Daddy used ' + amt(b) + ' of water for the plants. How much water is left in the tank?';
    }
    wrongs = [a + b, _subSmallFromLarge(a, b), ans + 10, ans - 10, ans + step, ans - step];
  }
  return { type: 'measure-calc', quantity: quantity, unit: unit, a: a, b: b,
    op: mode === 'total' ? '+' : '-', mode: mode, text: text, answer: ans, subKey: subKey,
    options: _choices(ans, wrongs.map(function (w) { return w > 0 ? w : null; }),
      function () { var f = ans + rand(-6, 6) * step; return f > 0 ? f : null; }),
    hint: mode === 'total' ? 'Altogether means put the two amounts together. Add.'
      : 'Find the difference between the two amounts. Subtract the smaller from the bigger.' };
}

function genMass(diff, config)   { return _genMeasure('mass', diff, config); }
function genVolume(diff, config) { return _genMeasure('volume', diff, config); }

// ===================== P2: TWO-STEP WORD PROBLEMS =====================

function genWP2(diff, config) {
  // The stories live in word-problems.js with the rest of the bank. The
  // ceiling for the numbers is set there from this skill's level.
  var cfg = {};
  if (config) Object.keys(config).forEach(function (k) { cfg[k] = config[k]; });
  cfg.mode = 'word';
  return generateWordProblemFor('wp2', cfg, diff);
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
