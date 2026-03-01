// ============================================================
//  MATH GENERATORS — Question generators for all 28 skills
// ============================================================

function generateMathQuestion(skillId) {
  const diff = getSkillDifficulty(skillId);
  switch (skillId) {
    // P1
    case 'count': return genCount(diff);
    case 'nbond': return genNBond(diff);
    case 'add':   return genAdd(diff);
    case 'sub':   return genSub(diff);
    case 'cmp':   return genCmp(diff);
    case 'pat':   return genPat(diff);
    case 'wp1':   return genWP1(diff);
    case 'shp':   return genShp(diff);
    // P2
    case 'add100':  return genAdd100(diff);
    case 'sub100':  return genSub100(diff);
    case 'mul':     return genMul(diff);
    case 'div':     return genDiv(diff);
    case 'frac1':   return genFrac1(diff);
    case 'money':   return genMoney(diff);
    case 'time1':   return genTime1(diff);
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

function genNBond(diff) {
  const maxNum = diff.level >= 2 ? 20 : 10;
  const whole = rand(3, maxNum);
  const partA = rand(1, whole - 1);
  const partB = whole - partA;
  const missingPart = Math.random() < 0.5 ? 'left' : 'right';
  return {
    type: 'number-bond', whole, partA, partB, missingPart,
    answer: missingPart === 'left' ? partA : partB,
    hint: 'If the whole is ' + whole + ' and one part is ' + (missingPart === 'left' ? partB : partA) + ', what\'s the other part?',
    isConcrete: diff.isConcrete
  };
}

function genAdd(diff) {
  const [min, max] = diff.numberRange;
  const a = rand(min, Math.floor(max / 2));
  const b = rand(min, Math.floor(max / 2));
  const sum = a + b;
  const emoji = pick(OBJECT_EMOJIS);
  if (diff.isConcrete) {
    return { type: 'addition-concrete', a, b, answer: sum, emoji, hint: 'Count all the objects together! ' + a + ' and ' + b + ' more makes...' };
  } else if (diff.isPictorial) {
    return { type: 'addition-pictorial', a, b, answer: sum, emoji, hint: 'Look at the bar model. How many in total?' };
  } else {
    return { type: 'addition-abstract', a, b, answer: sum, hint: 'Try counting on from the bigger number.' };
  }
}

function genSub(diff) {
  const [min, max] = diff.numberRange;
  const b = rand(min, Math.floor(max / 2));
  const a = rand(b + 1, Math.min(b + Math.floor(max / 2), max));
  const result = a - b;
  const emoji = pick(OBJECT_EMOJIS);
  if (diff.isConcrete) {
    return { type: 'subtraction-concrete', a, b, answer: result, emoji, hint: 'Start with ' + a + ', then take away ' + b + '. How many are left?' };
  } else {
    return { type: 'subtraction-abstract', a, b, answer: result, hint: 'Start at ' + a + ' and count back ' + b + '.' };
  }
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
    return { type: 'shape-identify', shape, options: shuffle([shape, ...wrong]), hint: 'Count the sides and corners!' };
  } else {
    var sh = pick(SHAPE_DATA);
    return { type: 'shape-properties', shape: sh, answer: sh.sides, hint: 'Trace around the shape and count each side.' };
  }
}

// ===================== P2 GENERATORS =====================

function genAdd100(diff) {
  var a, b;
  if (diff.isConcrete) {
    a = rand(10, 50); b = rand(10, 50);
  } else if (diff.isPictorial) {
    a = rand(20, 60); b = rand(20, 40);
  } else {
    a = rand(10, 99); b = rand(10, 99 - a);
  }
  return { type: 'addition-100', a, b, answer: a + b, isConcrete: diff.isConcrete, isPictorial: diff.isPictorial,
    hint: 'Try adding the tens first, then the ones.' };
}

function genSub100(diff) {
  var a = rand(30, 99);
  var b = rand(10, a - 1);
  return { type: 'subtraction-100', a, b, answer: a - b, isConcrete: diff.isConcrete,
    hint: 'Try subtracting the tens first, then the ones.' };
}

function genMul(diff) {
  var tables = [2, 3, 4, 5, 10];
  var table = pick(tables);
  var n = rand(1, 10);
  var answer = table * n;
  return { type: 'multiplication', table, n, answer, isConcrete: diff.isConcrete, isPictorial: diff.isPictorial,
    hint: table + ' times ' + n + ' means ' + n + ' groups of ' + table + '.' };
}

function genDiv(diff) {
  var divisors = [2, 3, 4, 5];
  var divisor = pick(divisors);
  var quotient = rand(1, 10);
  var dividend = divisor * quotient;
  return { type: 'division', dividend, divisor, answer: quotient, isConcrete: diff.isConcrete,
    hint: 'Share ' + dividend + ' equally into ' + divisor + ' groups. How many in each group?' };
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

function genMoney(diff) {
  var items = [
    { name: 'pencil', price: rand(1, 5) * 10 },
    { name: 'eraser', price: rand(1, 3) * 10 },
    { name: 'notebook', price: rand(1, 8) * 10 + rand(0, 1) * 5 },
    { name: 'ruler', price: rand(2, 6) * 10 },
    { name: 'sticker', price: rand(1, 4) * 10 + rand(0, 1) * 5 }
  ];
  var item = pick(items);
  if (Math.random() < 0.5) {
    var item2 = pick(items.filter(function(i) { return i.name !== item.name; }));
    var total = item.price + item2.price;
    return { type: 'money-add', item1: item, item2: item2, answer: total,
      hint: 'Add the two prices together. ' + item.price + ' + ' + item2.price + ' cents.' };
  } else {
    var paid = Math.ceil(item.price / 100) * 100;
    if (paid <= item.price) paid = item.price + rand(1, 5) * 10;
    var change = paid - item.price;
    return { type: 'money-change', item, paid, answer: change,
      hint: 'How much change from ' + paid + ' cents after buying something for ' + item.price + ' cents?' };
  }
}

function genTime1(diff) {
  var hour = rand(1, 12);
  var minutes;
  if (diff.level <= 1) {
    minutes = pick([0, 30]);
  } else {
    minutes = pick([0, 15, 30, 45]);
  }
  if (Math.random() < 0.5) {
    return { type: 'time-read', hour, minutes, answer: hour + ':' + (minutes < 10 ? '0' : '') + minutes,
      hint: 'The short hand shows the hour, the long hand shows the minutes.' };
  } else {
    return { type: 'time-set', hour, minutes, answer: hour * 60 + minutes,
      hint: 'Set the clock to show ' + hour + ':' + (minutes < 10 ? '0' : '') + minutes + '.' };
  }
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
  if (!isAdd && a < b) { var tmp = a; a = b; b = tmp; }
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
  var maxDay = categories[values.indexOf(maxVal)];
  var total = values.reduce(function(a,b) { return a + b; }, 0);
  var qType = pick(['highest', 'total', 'difference']);
  var answer;
  if (qType === 'highest') answer = maxDay;
  else if (qType === 'total') answer = total;
  else {
    var sorted = [...values].sort(function(a,b) { return b - a; });
    answer = sorted[0] - sorted[sorted.length - 1];
  }
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
    var a = pick([2, 3, 4, 5, 6]);
    var b = pick([3, 4, 5, 6, 7, 8]);
    while (a === b) b = pick([3, 4, 5, 6, 7, 8]);
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
  return { type: 'symmetry', shape, answer: shape.lines,
    options: shuffle([0, 1, 2, 3, 4, 6]),
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
      var extra = rand(5, 20);
      return { text: people + ' children each have ' + each + ' stickers. They are given ' + extra + ' more to share equally. How many stickers does each child have now?',
        answer: each + Math.floor(extra / people), hint: 'First find the total, then add the shared extra.' };
    }
  ];
  var gen = pick(templates)();
  return { type: 'multi-step-wp', text: gen.text, answer: gen.answer, hint: gen.hint };
}
