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
    case 'count': return genCount(diff);
    case 'nbond': return genNBond(diff, config);
    case 'add':   return genAdd(diff, config);
    case 'sub':   return genSub(diff, config);
    case 'cmp':   return genCmp(diff);
    case 'pat':   return genPat(diff);
    case 'wp1':   return genWP1(diff, config);
    case 'shp':   return genShp(diff);
    // P2
    case 'add100':  return genAdd100(diff, config);
    case 'sub100':  return genSub100(diff, config);
    case 'mul':     return genMul(diff, config);
    case 'div':     return genDiv(diff, config);
    case 'frac1':   return genFrac1(diff);
    case 'money':   return genMoney(diff, config);
    case 'time1':   return genTime1(diff, config);
    case 'pgraph':  return genPGraph(diff);
    case 'lenmass': return genLenMass(diff);
    // P3
    case 'add10k':  return genAdd10k(diff);
    case 'sub10k':  return genSub10k(diff);
    case 'advmul':  return genAdvMul(diff);
    case 'divrem':  return genDivRem(diff);
    case 'fracadd': return genFracAdd(diff);
    case 'area':    return genArea(diff);
    case 'angle':   return genAngle(diff);
    case 'bargraph':return genBarGraph(diff);
    // P4
    case 'bignum':  return genBigNum(diff);
    case 'multiop': return genMultiOp(diff);
    case 'factor':  return genFactor(diff);
    case 'mixfrac': return genMixFrac(diff);
    case 'decimal': return genDecimal(diff);
    case 'symm':    return genSymm(diff);
    case 'dataan':  return genDataAn(diff);
    case 'multiwp': return genMultiWP(diff);
    default: return genCount(diff);
  }
}

// ===================== P1 GENERATORS =====================

function genCount(diff) {
  const [min, max] = diff.numberRange;
  const n = rand(min, Math.min(max, 20));
  return { type: 'ten-frame-count', number: n, answer: n, hint: 'Count each dot carefully! Try counting in groups.' };
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

function genShp(diff) {
  if (Math.random() < 0.5) {
    var shape = pick(SHAPE_DATA);
    var wrong = shuffle(SHAPE_DATA.filter(function(s) { return s.name !== shape.name; })).slice(0, 3);
    // answer is carried explicitly as well as inside `shape`, so any
    // generic consumer (review screen, spaced repetition, stats) can
    // read q.answer without special-casing this question type.
    return { type: 'shape-identify', shape, answer: shape.name,
      options: shuffle([shape, ...wrong]), hint: 'Count the sides and corners!' };
  } else {
    var sh = pick(SHAPE_DATA);
    return { type: 'shape-properties', shape: sh, answer: sh.sides, hint: 'Trace around the shape and count each side.' };
  }
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

function genFrac1(diff) {
  var denoms = [2, 3, 4, 6, 8];
  var denom = pick(denoms);
  var numer = rand(1, denom - 1);
  if (Math.random() < 0.5) {
    return { type: 'fraction-identify', numerator: numer, denominator: denom, answer: numer + '/' + denom,
      hint: 'Count how many parts are shaded out of the total.' };
  } else {
    return { type: 'fraction-shade', numerator: numer, denominator: denom, answer: numer,
      hint: 'Shade ' + numer + ' out of ' + denom + ' parts.' };
  }
}

function genMoney(diff, config) {
  var flag = config && config.flag;
  var items = [
    { name: 'pencil', price: rand(1, 5) * 10 },
    { name: 'eraser', price: rand(1, 3) * 10 },
    { name: 'notebook', price: rand(1, 8) * 10 + rand(0, 1) * 5 },
    { name: 'ruler', price: rand(2, 6) * 10 },
    { name: 'sticker', price: rand(1, 4) * 10 + rand(0, 1) * 5 }
  ];
  var item = pick(items);
  var wantAdd = flag === 'add' ? true : (flag === 'change' ? false : Math.random() < 0.5);
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

function genPGraph(diff) {
  var categories = shuffle(['Apples', 'Bananas', 'Oranges', 'Grapes', 'Strawberries']).slice(0, 4);
  var values = categories.map(function() { return rand(1, 10); });
  var qType = pick(['most', 'least', 'total', 'howmany']);
  var answer;
  if (qType === 'most') answer = categories[values.indexOf(Math.max(...values))];
  else if (qType === 'least') answer = categories[values.indexOf(Math.min(...values))];
  else if (qType === 'total') answer = values.reduce(function(a,b) { return a + b; }, 0);
  else { var idx = rand(0, categories.length - 1); answer = values[idx]; qType = 'howmany_' + idx; }
  return { type: 'picture-graph', categories, values, qType, answer,
    hint: 'Look at the graph carefully. Count the pictures.' };
}

function genLenMass(diff) {
  var items = [
    { name: 'pencil', length: rand(10, 20) },
    { name: 'book', length: rand(20, 35) },
    { name: 'ruler', length: 30 },
    { name: 'eraser', length: rand(3, 8) }
  ];
  var a = pick(items);
  var b = pick(items.filter(function(i) { return i.name !== a.name; }));
  if (Math.random() < 0.5) {
    return { type: 'length-compare', itemA: a, itemB: b, answer: a.length > b.length ? a.name : b.name,
      hint: 'Which item is longer?' };
  } else {
    var diff2 = Math.abs(a.length - b.length);
    return { type: 'length-difference', itemA: a, itemB: b, answer: diff2,
      hint: 'What is the difference in length?' };
  }
}

// ===================== P3 GENERATORS =====================

function genAdd10k(diff) {
  var a = rand(100, 5000);
  var b = rand(100, 5000);
  return { type: 'column-add', a, b, answer: a + b,
    hint: 'Line up the digits. Add ones first, then tens, then hundreds.' };
}

function genSub10k(diff) {
  var a = rand(500, 9999);
  var b = rand(100, a - 1);
  return { type: 'column-sub', a, b, answer: a - b,
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

function genDivRem(diff) {
  var divisor = pick([2, 3, 4, 5, 6, 7]);
  var quotient = rand(2, 12);
  var remainder = rand(1, divisor - 1);
  var dividend = divisor * quotient + remainder;
  return { type: 'division-remainder', dividend, divisor, quotient, remainder, answer: quotient + ' R ' + remainder,
    hint: 'Divide ' + dividend + ' by ' + divisor + '. What\'s left over?' };
}

function genFracAdd(diff) {
  var denom = pick([2, 3, 4, 5, 6, 8]);
  var a = rand(1, denom - 1);
  var b = rand(1, denom - a);
  var isAdd = Math.random() < 0.6;
  if (!isAdd) {
    // Ensure a > b so answer is at least 1/denom (never zero)
    if (a <= b) { var tmp = a; a = b; b = tmp; }
    if (a === b) { isAdd = true; } // fallback to addition if equal
  }
  var answer = isAdd ? a + b : a - b;
  return { type: 'fraction-operation', a, b, denom, op: isAdd ? '+' : '-', answer: answer + '/' + denom,
    answerNum: answer, hint: 'The denominators are the same, so just ' + (isAdd ? 'add' : 'subtract') + ' the numerators.' };
}

function genArea(diff) {
  var w = rand(2, 6);
  var h = rand(2, 5);
  if (Math.random() < 0.5) {
    return { type: 'area-count', width: w, height: h, answer: w * h,
      hint: 'Count all the squares inside the shape. Or use length x width.' };
  } else {
    return { type: 'perimeter-count', width: w, height: h, answer: 2 * (w + h),
      hint: 'Add up all the sides. Or use 2 x (length + width).' };
  }
}

function genAngle(diff) {
  var angles = [
    { type: 'right', degrees: 90, desc: 'exactly 90 degrees' },
    { type: 'acute', degrees: rand(20, 80), desc: 'less than 90 degrees' },
    { type: 'obtuse', degrees: rand(100, 170), desc: 'more than 90 degrees' }
  ];
  var angle = pick(angles);
  return { type: 'angle-identify', angle, answer: angle.type,
    options: shuffle(['right', 'acute', 'obtuse']),
    hint: 'A right angle is exactly 90 degrees. Acute is smaller, obtuse is larger.' };
}

function genBarGraph(diff) {
  var categories = shuffle(['Mon', 'Tue', 'Wed', 'Thu', 'Fri']).slice(0, 4);
  var values = categories.map(function() { return rand(2, 15); });
  var maxVal = Math.max(...values);
  var minVal = Math.min(...values);
  var maxDay = categories[values.indexOf(maxVal)];
  var total = values.reduce(function(a,b) { return a + b; }, 0);
  var qType = pick(['most', 'total', 'howmany']);
  var answer;
  if (qType === 'most') answer = maxDay;
  else if (qType === 'total') answer = total;
  else { var idx = rand(0, categories.length - 1); answer = values[idx]; qType = 'howmany_' + idx; }
  return { type: 'bar-graph', categories, values, qType, answer,
    hint: 'Read the graph carefully. Compare the heights of the bars.' };
}

// ===================== P4 GENERATORS =====================

function genBigNum(diff) {
  var n = rand(10000, 99999);
  var qTypes = ['place-value', 'rounding', 'comparison'];
  var qType = pick(qTypes);
  if (qType === 'place-value') {
    var places = ['ones', 'tens', 'hundreds', 'thousands', 'ten thousands'];
    var placeIdx = rand(0, 4);
    var digit = Math.floor(n / Math.pow(10, placeIdx)) % 10;
    return { type: 'big-number-pv', number: n, place: places[placeIdx], answer: digit,
      hint: 'Look at the digit in the ' + places[placeIdx] + ' place.' };
  } else if (qType === 'rounding') {
    var roundTo = pick([10, 100, 1000]);
    var rounded = Math.round(n / roundTo) * roundTo;
    return { type: 'big-number-round', number: n, roundTo, answer: rounded,
      hint: 'Look at the digit to the right of where you are rounding.' };
  } else {
    var n2 = n + rand(-5000, 5000);
    while (n2 === n) n2 = n + rand(1, 1000);
    return { type: 'comparing', a: n, b: n2, answer: n > n2 ? '>' : '<',
      hint: 'Compare the digits from left to right.', isConcrete: false };
  }
}

function genMultiOp(diff) {
  if (Math.random() < 0.5) {
    var a = rand(10, 99);
    var b = rand(10, 99);
    return { type: 'long-multiplication', a, b, answer: a * b,
      hint: 'Multiply by ones digit, then by tens digit, then add.' };
  } else {
    var divisor = rand(2, 9);
    var quotient = rand(10, 99);
    var dividend = divisor * quotient;
    return { type: 'long-division', dividend, divisor, answer: quotient,
      hint: 'How many times does ' + divisor + ' go into ' + dividend + '?' };
  }
}

function genFactor(diff) {
  var n = pick([12, 18, 24, 30, 36, 40, 48, 60]);
  if (Math.random() < 0.5) {
    var factors = [];
    for (var i = 1; i <= n; i++) { if (n % i === 0) factors.push(i); }
    return { type: 'find-factors', number: n, answer: factors.join(','), factors,
      hint: 'Which numbers divide evenly into ' + n + '?' };
  } else {
    // Avoid pairs where one divides the other: there the LCM is simply
    // the larger number, which the hint would then hand over for free.
    var a = pick([2, 3, 4, 5, 6]);
    var b = pick([3, 4, 5, 6, 7, 8]);
    var guardL = 0;
    while ((a === b || b % a === 0 || a % b === 0) && guardL++ < 40) {
      b = pick([3, 4, 5, 6, 7, 8]);
    }
    return { type: 'find-lcm', a, b, answer: lcm(a, b),
      hint: 'List multiples of ' + a + ' and ' + b + '. Find the smallest number in both lists.' };
  }
}

function genMixFrac(diff) {
  var whole = rand(1, 5);
  var denom = pick([2, 3, 4, 5]);
  var numer = rand(1, denom - 1);
  var improper = whole * denom + numer;
  if (Math.random() < 0.5) {
    return { type: 'mixed-to-improper', whole, numer, denom, answer: improper + '/' + denom,
      hint: 'Multiply the whole number by the denominator, then add the numerator.' };
  } else {
    return { type: 'improper-to-mixed', improper, denom, answer: whole + ' ' + numer + '/' + denom,
      wholeAnswer: whole, numerAnswer: numer,
      hint: 'Divide ' + improper + ' by ' + denom + '. The quotient is the whole number, remainder is the numerator.' };
  }
}

function genDecimal(diff) {
  if (Math.random() < 0.5) {
    var n = rand(1, 99);
    var decimal = (n / 10).toFixed(1);
    return { type: 'decimal-identify', fraction: n + '/10', answer: decimal,
      hint: 'Divide by 10: move the decimal point one place left.' };
  } else {
    var a = (rand(1, 50) / 10).toFixed(1);
    var b = (rand(1, 50) / 10).toFixed(1);
    var sum = (parseFloat(a) + parseFloat(b)).toFixed(1);
    return { type: 'decimal-add', a, b, answer: sum,
      hint: 'Line up the decimal points, then add normally.' };
  }
}

function genSymm(diff) {
  var shapes = [
    { name: 'square', lines: 4 },
    { name: 'rectangle', lines: 2 },
    { name: 'circle', lines: 'infinite' },
    { name: 'equilateral triangle', lines: 3 },
    { name: 'isosceles triangle', lines: 1 },
    { name: 'regular hexagon', lines: 6 }
  ];
  var shape = pick(shapes);
  var opts = shape.lines === 'infinite'
    ? shuffle([0, 1, 2, 4, 6, 'infinite'])
    : shuffle([0, 1, 2, 3, 4, 6]);
  return { type: 'symmetry', shape, answer: shape.lines,
    options: opts,
    hint: 'A line of symmetry divides a shape into two matching halves.' };
}

function genDataAn(diff) {
  var data = Array.from({length: 5}, function() { return rand(5, 30); });
  var total = data.reduce(function(a,b) { return a + b; }, 0);
  var avg = Math.round(total / data.length);
  var qType = pick(['average', 'total', 'range']);
  var answer;
  if (qType === 'average') answer = avg;
  else if (qType === 'total') answer = total;
  else answer = Math.max(...data) - Math.min(...data);
  return { type: 'data-analysis', data, qType, answer,
    hint: qType === 'average' ? 'Add all numbers, then divide by how many there are.' :
          qType === 'total' ? 'Add all the numbers together.' :
          'Subtract the smallest from the largest.' };
}

function genMultiWP(diff) {
  var templates = [
    function() {
      var price = rand(3, 15);
      var qty = rand(2, 5);
      var money = rand(qty * price + 1, qty * price + 20);
      return { text: 'Anastasia buys ' + qty + ' pens at $' + price + ' each. She pays with $' + money + '. How much change does she get?',
        answer: money - (qty * price), hint: 'First find the total cost, then subtract from the amount paid.' };
    },
    function() {
      var a = rand(10, 50);
      var b = rand(5, 20);
      var c = rand(5, 15);
      return { text: 'A shop has ' + a + ' apples. They sell ' + b + ' in the morning and receive ' + c + ' more in the afternoon. How many apples are there now?',
        answer: a - b + c, hint: 'Start with ' + a + ', take away ' + b + ', then add ' + c + '.' };
    },
    function() {
      var people = rand(3, 8);
      var each = rand(4, 12);
      var extraPerPerson = rand(1, 4);
      var extra = extraPerPerson * people;
      return { text: people + ' children each have ' + each + ' stickers. They are given ' + extra + ' more to share equally. How many stickers does each child have now?',
        answer: each + extraPerPerson, hint: 'First find the total, then add the shared extra.' };
    }
  ];
  var gen = pick(templates)();
  return { type: 'multi-step-wp', text: gen.text, answer: gen.answer, hint: gen.hint };
}
