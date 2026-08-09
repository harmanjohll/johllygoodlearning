// ============================================================
//  THE TRACHTENBERG SYSTEM
//
//  Jakow Trachtenberg (1888-1953) was a Russian-born engineer who
//  was imprisoned in a Nazi concentration camp. To keep his mind
//  alive he worked entirely in his head, and built a complete system
//  of rapid mental arithmetic with no paper. He survived, escaped to
//  Switzerland, and founded a school to teach it. The system asks you
//  to memorise no times tables at all — only to be able to add, and
//  to halve.
//
//  ---------------------------------------------------------------
//  ACCURACY NOTE. These rules are easy to misremember, and a rule
//  stated confidently but wrongly is far worse than no rule. Every
//  rule below is implemented as executable code and brute-forced
//  against ordinary multiplication over every integer in a wide
//  range by test/trachtenberg.test.js. If a rule here were misstated,
//  that test would fail rather than a child being taught nonsense.
//  ---------------------------------------------------------------
//
//  SHARED CONVENTIONS, which is where most published versions go wrong:
//   1. Write the number with a LEADING ZERO: 6314 becomes 06314.
//      That leading zero is a real working position, not decoration.
//   2. Work RIGHT TO LEFT.
//   3. A digit's "neighbour" is the digit to its RIGHT.
//      The rightmost digit's neighbour is 0.
//   4. "Half" always means HALVE AND THROW AWAY THE REMAINDER.
//      Half of 7 is 3. Half of 5 is 2.
//   5. "+5 if the digit is odd" refers to the DIGIT ITSELF being odd,
//      not the half, not the neighbour.
//   6. Carries move leftward exactly as in ordinary addition.
// ============================================================

function _halve(n) { return Math.floor(n / 2); }
function _isOdd(n) { return (n % 2) === 1; }

/**
 * Run a Trachtenberg rule and return the full working, so the UI can
 * show a child each digit as it is produced.
 *
 * Returns:
 *   { multiplicand, multiplier, padded, steps: [...], answer, check }
 * Each step is one digit position, right to left:
 *   { position, digit, neighbour, expression, raw, carryIn, written, carryOut }
 */
function trachtenberg(n, multiplier) {
  var digits = String(n).split('').map(Number);
  var padded = [0].concat(digits);           // the leading zero
  var last = padded.length - 1;
  var steps = [];
  var carry = 0;
  var out = [];

  for (var i = last; i >= 0; i--) {
    var d = padded[i];
    var nb = (i === last) ? 0 : padded[i + 1];   // neighbour = digit to the RIGHT
    var isRightmost = (i === last);
    var isLeading = (i === 0);
    var r = _trachRule(multiplier, d, nb, isRightmost, isLeading);
    if (r === null) return null;

    var raw = r.value + carry;
    var written = ((raw % 10) + 10) % 10;
    var carryOut = Math.floor(raw / 10);

    steps.push({
      position: i,
      digit: d,
      neighbour: nb,
      expression: r.expr,
      value: r.value,
      carryIn: carry,
      raw: raw,
      written: written,
      carryOut: carryOut,
      isRightmost: isRightmost,
      isLeading: isLeading
    });

    out.unshift(written);
    carry = carryOut;
  }

  // Any carry left over at the far left becomes new leading digits.
  while (carry > 0) {
    out.unshift(carry % 10);
    carry = Math.floor(carry / 10);
  }

  var answer = Number(out.join('')) || 0;
  return {
    multiplicand: n,
    multiplier: multiplier,
    padded: padded.join(''),
    steps: steps,
    answer: answer,
    check: n * multiplier,
    correct: answer === n * multiplier
  };
}

/**
 * The rules themselves. Each returns the value contributed at one
 * digit position, plus a human-readable expression for the UI.
 *
 * Positional vocabulary:
 *   rightmost  — the units digit (its neighbour is 0)
 *   middle     — any digit that is neither the units digit nor the
 *                leading zero
 *   leading    — the padded zero at the far left
 *
 * The "subtract from 10 / from 9" family (3, 4, 8, 9) treats these
 * three positions DIFFERENTLY. That is the single most common source
 * of error in published versions of this system.
 */
function _trachRule(m, d, nb, isRightmost, isLeading) {
  switch (String(m)) {

    // ---- 2: simply double ----
    case '2':
      return { value: 2 * d, expr: '2 x ' + d };

    // ---- 11: add the neighbour ----
    case '11':
      return { value: d + nb, expr: d + ' + ' + nb };

    // ---- 12: double, add the neighbour ----
    case '12':
      return { value: 2 * d + nb, expr: '2 x ' + d + ' + ' + nb };

    // ---- 5: half the neighbour, +5 if the digit is odd ----
    case '5':
      return {
        value: _halve(nb) + (_isOdd(d) ? 5 : 0),
        expr: 'half of ' + nb + ' = ' + _halve(nb) + (_isOdd(d) ? '  (+5, ' + d + ' is odd)' : '')
      };

    // ---- 6: the digit + half the neighbour, +5 if the digit is odd ----
    case '6':
      return {
        value: d + _halve(nb) + (_isOdd(d) ? 5 : 0),
        expr: d + ' + half of ' + nb + ' (' + _halve(nb) + ')' + (_isOdd(d) ? ' + 5 (odd)' : '')
      };

    // ---- 7: double the digit + half the neighbour, +5 if odd ----
    case '7':
      return {
        value: 2 * d + _halve(nb) + (_isOdd(d) ? 5 : 0),
        expr: '2 x ' + d + ' + half of ' + nb + ' (' + _halve(nb) + ')' + (_isOdd(d) ? ' + 5 (odd)' : '')
      };

    // ---- 9 ----
    //   rightmost : 10 - digit
    //   middle    : 9 - digit + neighbour
    //   leading   : neighbour - 1
    case '9':
      if (isRightmost) return { value: 10 - d, expr: '10 - ' + d };
      if (isLeading)   return { value: nb - 1, expr: nb + ' - 1' };
      return { value: 9 - d + nb, expr: '9 - ' + d + ' + ' + nb };

    // ---- 8 ----
    //   rightmost : (10 - digit) x 2
    //   middle    : (9 - digit) x 2 + neighbour
    //   leading   : neighbour - 2
    case '8':
      if (isRightmost) return { value: (10 - d) * 2, expr: '(10 - ' + d + ') x 2' };
      if (isLeading)   return { value: nb - 2, expr: nb + ' - 2' };
      return { value: (9 - d) * 2 + nb, expr: '(9 - ' + d + ') x 2 + ' + nb };

    // ---- 4 ----
    //   rightmost : 10 - digit, +5 if the digit is odd
    //   middle    : 9 - digit + half the neighbour, +5 if the digit is odd
    //   leading   : half the neighbour - 1
    case '4':
      if (isRightmost) return {
        value: (10 - d) + (_isOdd(d) ? 5 : 0),
        expr: '10 - ' + d + (_isOdd(d) ? ' + 5 (odd)' : '')
      };
      if (isLeading) return { value: _halve(nb) - 1, expr: 'half of ' + nb + ' - 1' };
      return {
        value: (9 - d) + _halve(nb) + (_isOdd(d) ? 5 : 0),
        expr: '9 - ' + d + ' + half of ' + nb + ' (' + _halve(nb) + ')' + (_isOdd(d) ? ' + 5 (odd)' : '')
      };

    // ---- 3 ----
    //   rightmost : (10 - digit) x 2, +5 if the digit is odd
    //   middle    : (9 - digit) x 2 + half the neighbour, +5 if odd
    //   leading   : half the neighbour - 2
    case '3':
      if (isRightmost) return {
        value: (10 - d) * 2 + (_isOdd(d) ? 5 : 0),
        expr: '(10 - ' + d + ') x 2' + (_isOdd(d) ? ' + 5 (odd)' : '')
      };
      if (isLeading) return { value: _halve(nb) - 2, expr: 'half of ' + nb + ' - 2' };
      return {
        value: (9 - d) * 2 + _halve(nb) + (_isOdd(d) ? 5 : 0),
        expr: '(9 - ' + d + ') x 2 + half of ' + nb + ' (' + _halve(nb) + ')' + (_isOdd(d) ? ' + 5 (odd)' : '')
      };

    // ---- 10: everyone's favourite ----
    case '10':
      return { value: nb, expr: 'bring down ' + nb };

    default:
      return null;
  }
}

/** Which multipliers we have a verified rule for. */
var TRACHTENBERG_MULTIPLIERS = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

/**
 * Casting out nines — Trachtenberg taught this as the check on your
 * own work. The digit sum of a number, reduced to one digit, behaves
 * the same under multiplication as the number itself does.
 */
function digitalRoot(n) {
  n = Math.abs(Math.round(n));
  if (n === 0) return 0;
  var r = n % 9;
  return r === 0 ? 9 : r;
}

function castingOutNines(a, b, claimedProduct) {
  var expect = digitalRoot(digitalRoot(a) * digitalRoot(b));
  var actual = digitalRoot(claimedProduct);
  return {
    rootA: digitalRoot(a),
    rootB: digitalRoot(b),
    expected: expect,
    actual: actual,
    passes: expect === actual
  };
}

if (typeof window !== 'undefined') {
  window.trachtenberg = trachtenberg;
  window.TRACHTENBERG_MULTIPLIERS = TRACHTENBERG_MULTIPLIERS;
  window.digitalRoot = digitalRoot;
  window.castingOutNines = castingOutNines;
}
