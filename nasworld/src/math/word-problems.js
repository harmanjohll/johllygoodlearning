// ============================================================
//  WORD PROBLEMS — Singapore-style story problem engine.
//
//  Before this file the whole app had SEVEN word problem templates
//  (four in genWP1, three in genMultiWP). That is not enough to
//  practise with; a child sees the same sentence within minutes.
//
//  This bank is organised by the problem STRUCTURES that Singapore
//  Math teaches explicitly, because naming the structure is what
//  lets a child recognise it again in an exam:
//
//    part-whole   two parts combine into a whole
//    change       a quantity grows or shrinks over time
//    comparison   how many more / fewer than
//    groups       equal groups, arrays, sharing
//    rate         cost per item, items per box
//    before-after a state changes and we work backwards
//
//  Every template also emits BAR MODEL data so the child can be
//  shown the model drawing that Singapore Math is built on.
// ============================================================

// ---- Personal context ---------------------------------------------------

var WP_NAMES = ['Anastasia', 'Nas', 'Mei Ling', 'Arjun', 'Siti', 'Wei Jie', 'Priya', 'Daniel', 'Nadia', 'Ravi'];
var WP_FAMILY = ['Mummy', 'Daddy', 'her grandmother', 'her cousin', 'her uncle', 'Nenek'];

var WP_CONTEXTS = {
  animals:  { items: [['kitten','🐱'],['puppy','🐶'],['rabbit','🐰'],['duckling','🦆'],['fish','🐟'],['butterfly','🦋'],['bird','🐦']], place: 'the pet shop' },
  flowers:  { items: [['flower','🌸'],['sunflower','🌻'],['rose','🌹'],['tulip','🌷'],['seed','🌱'],['leaf','🍃']], place: 'the garden' },
  food:     { items: [['cookie','🍪'],['apple','🍎'],['orange','🍊'],['banana','🍌'],['sweet','🍬'],['curry puff','🥟'],['kaya toast','🍞']], place: 'the hawker centre' },
  school:   { items: [['pencil','✏️'],['crayon','🖍️'],['sticker','⭐'],['book','📚'],['eraser','🧽'],['ruler','📏']], place: 'the classroom' },
  space:    { items: [['star','⭐'],['planet','🪐'],['rocket','🚀'],['moon rock','🌑'],['comet','☄️']], place: 'space camp' },
  toys:     { items: [['marble','🔵'],['balloon','🎈'],['toy car','🚗'],['building block','🧱'],['doll','🪆']], place: 'the toy box' },
  football: { items: [['goal','⚽'],['football card','🃏'],['medal','🏅'],['cone','🔺']], place: 'the field' }
};

function _wpCtx(theme) {
  var keys = Object.keys(WP_CONTEXTS);
  var key = (theme && theme !== 'mixed' && WP_CONTEXTS[theme]) ? theme : pick(keys);
  var ctx = WP_CONTEXTS[key];
  var item = pick(ctx.items);
  return { key: key, noun: item[0], nounPlural: _wpPlural(item[0]), emoji: item[1], place: ctx.place };
}
function _wpPlural(n) {
  if (/(s|x|ch|sh)$/.test(n)) return n + 'es';
  if (/[^aeiou]y$/.test(n)) return n.slice(0, -1) + 'ies';
  return n + 's';
}
function _wpName() { return pick(WP_NAMES); }

// ---- Bar model data -----------------------------------------------------
//
//  { style: 'part-whole' | 'comparison', parts: [{label, value, unknown}],
//    total: {label, value, unknown} }
//  The renderer draws proportional bars from this.

function _barPartWhole(parts, total) {
  return { style: 'part-whole', parts: parts, total: total };
}
function _barComparison(bigger, smaller, difference) {
  return { style: 'comparison', bigger: bigger, smaller: smaller, difference: difference };
}

// ---- Template bank ------------------------------------------------------
//
//  Each template is a function(max, ctx) returning a question object.
//  `max` caps the largest number involved so a template can serve both
//  a P1 "within 10" drill and a P3 "within 1000" drill.

var WP_TEMPLATES = {

  // ============ PART-WHOLE ============
  'part-whole': [
    function(max, ctx) {
      var a = rand(2, Math.max(2, Math.floor(max * 0.6)));
      var b = rand(1, Math.max(1, max - a));
      var name = _wpName();
      return {
        text: name + ' has ' + a + ' red ' + ctx.nounPlural + ' and ' + b + ' blue ' + ctx.nounPlural +
              '. How many ' + ctx.nounPlural + ' does ' + name + ' have altogether?',
        answer: a + b,
        working: a + ' + ' + b + ' = ' + (a + b),
        hint: 'Two parts joining together. Add them.',
        bar: _barPartWhole(
          [{ label: 'red', value: a }, { label: 'blue', value: b }],
          { label: 'total', value: a + b, unknown: true }
        )
      };
    },
    function(max, ctx) {
      var total = rand(5, Math.max(5, max));
      var a = rand(1, total - 1);
      var name = _wpName();
      return {
        text: 'There are ' + total + ' ' + ctx.nounPlural + ' in ' + ctx.place + '. ' + a +
              ' of them belong to ' + name + '. How many belong to somebody else?',
        answer: total - a,
        working: total + ' - ' + a + ' = ' + (total - a),
        hint: 'You know the whole and one part. Take the part away from the whole.',
        bar: _barPartWhole(
          [{ label: name, value: a }, { label: 'others', value: total - a, unknown: true }],
          { label: 'total', value: total }
        )
      };
    },
    function(max, ctx) {
      var a = rand(2, Math.max(2, Math.floor(max * 0.4)));
      var b = rand(1, Math.max(1, Math.floor(max * 0.3)));
      var c = rand(1, Math.max(1, max - a - b));
      var name = _wpName();
      return {
        text: name + ' picked ' + a + ' ' + ctx.nounPlural + ' on Monday, ' + b + ' on Tuesday and ' +
              c + ' on Wednesday. How many did she pick in all?',
        answer: a + b + c,
        working: a + ' + ' + b + ' + ' + c + ' = ' + (a + b + c),
        hint: 'Three parts making one whole. Add them all.',
        bar: _barPartWhole(
          [{ label: 'Mon', value: a }, { label: 'Tue', value: b }, { label: 'Wed', value: c }],
          { label: 'total', value: a + b + c, unknown: true }
        )
      };
    }
  ],

  // ============ CHANGE ============
  'change': [
    function(max, ctx) {
      var a = rand(2, Math.max(2, Math.floor(max * 0.7)));
      var b = rand(1, Math.max(1, max - a));
      var name = _wpName();
      return {
        text: name + ' had ' + a + ' ' + ctx.nounPlural + '. ' + pick(WP_FAMILY) + ' gave her ' + b +
              ' more. How many ' + ctx.nounPlural + ' does she have now?',
        answer: a + b,
        working: a + ' + ' + b + ' = ' + (a + b),
        hint: 'She started with some and got more. That means add.',
        bar: _barPartWhole(
          [{ label: 'at first', value: a }, { label: 'more', value: b }],
          { label: 'now', value: a + b, unknown: true }
        )
      };
    },
    function(max, ctx) {
      var a = rand(3, Math.max(3, max));
      var b = rand(1, a - 1);
      var name = _wpName();
      return {
        text: name + ' had ' + a + ' ' + ctx.nounPlural + '. She gave ' + b +
              ' to her friend. How many does she have left?',
        answer: a - b,
        working: a + ' - ' + b + ' = ' + (a - b),
        hint: 'She started with some and gave some away. That means take away.',
        bar: _barPartWhole(
          [{ label: 'gave away', value: b }, { label: 'left', value: a - b, unknown: true }],
          { label: 'at first', value: a }
        )
      };
    },
    function(max, ctx) {
      var start = rand(3, Math.max(3, Math.floor(max * 0.8)));
      var lost = rand(1, Math.min(start - 1, 4));
      var found = rand(1, Math.max(1, max - start + lost));
      var name = _wpName();
      return {
        text: name + ' had ' + start + ' ' + ctx.nounPlural + '. She lost ' + lost +
              ' and then found ' + found + ' more. How many does she have now?',
        answer: start - lost + found,
        working: start + ' - ' + lost + ' + ' + found + ' = ' + (start - lost + found),
        hint: 'Two changes. Do them one at a time, in order.',
        steps: 2
      };
    }
  ],

  // ============ COMPARISON ============
  'comparison': [
    function(max, ctx) {
      var big = rand(4, Math.max(4, max));
      var small = rand(1, big - 1);
      var n1 = _wpName(), n2 = _wpName();
      if (n2 === n1) n2 = 'her friend';
      return {
        text: n1 + ' has ' + big + ' ' + ctx.nounPlural + '. ' + n2 + ' has ' + small +
              '. How many more ' + ctx.nounPlural + ' does ' + n1 + ' have than ' + n2 + '?',
        answer: big - small,
        working: big + ' - ' + small + ' = ' + (big - small),
        hint: '"How many more" means find the difference. Subtract.',
        bar: _barComparison(
          { label: n1, value: big },
          { label: n2, value: small },
          { label: 'difference', value: big - small, unknown: true }
        )
      };
    },
    function(max, ctx) {
      var small = rand(2, Math.max(2, Math.floor(max * 0.6)));
      var diff = rand(1, Math.max(1, max - small));
      var n1 = _wpName(), n2 = _wpName();
      if (n2 === n1) n2 = 'her cousin';
      return {
        text: n1 + ' has ' + small + ' ' + ctx.nounPlural + '. ' + n2 + ' has ' + diff +
              ' more than ' + n1 + '. How many does ' + n2 + ' have?',
        answer: small + diff,
        working: small + ' + ' + diff + ' = ' + (small + diff),
        hint: '"More than" here means you add to find the bigger amount.',
        bar: _barComparison(
          { label: n2, value: small + diff, unknown: true },
          { label: n1, value: small },
          { label: 'more', value: diff }
        )
      };
    },
    function(max, ctx) {
      var big = rand(4, Math.max(4, max));
      var diff = rand(1, big - 1);
      var n1 = _wpName(), n2 = _wpName();
      if (n2 === n1) n2 = 'her brother';
      return {
        text: n1 + ' has ' + big + ' ' + ctx.nounPlural + '. ' + n2 + ' has ' + diff +
              ' fewer than ' + n1 + '. How many does ' + n2 + ' have?',
        answer: big - diff,
        working: big + ' - ' + diff + ' = ' + (big - diff),
        hint: '"Fewer than" means the other person has less. Subtract.',
        bar: _barComparison(
          { label: n1, value: big },
          { label: n2, value: big - diff, unknown: true },
          { label: 'fewer', value: diff }
        )
      };
    }
  ],

  // ============ GROUPS (multiplication / division) ============
  'groups': [
    function(max, ctx, cfg) {
      var table = _wpTable(cfg);
      var n = rand(2, 10);
      return {
        text: 'There are ' + n + ' ' + (n === 1 ? 'box' : 'boxes') + '. Each box has ' + table + ' ' +
              ctx.nounPlural + ' inside. How many ' + ctx.nounPlural + ' are there altogether?',
        answer: table * n,
        working: n + ' × ' + table + ' = ' + (table * n),
        hint: n + ' groups of ' + table + '. That is multiplication.',
        subKey: String(table),
        bar: _barPartWhole(
          Array.from({ length: Math.min(n, 6) }, function() { return { label: String(table), value: table }; }),
          { label: 'total', value: table * n, unknown: true }
        )
      };
    },
    function(max, ctx, cfg) {
      var divisor = _wpTable(cfg);
      var quotient = rand(2, 10);
      var total = divisor * quotient;
      var name = _wpName();
      return {
        text: name + ' shares ' + total + ' ' + ctx.nounPlural + ' equally among ' + divisor +
              ' friends. How many does each friend get?',
        answer: quotient,
        working: total + ' ÷ ' + divisor + ' = ' + quotient,
        hint: 'Sharing equally means divide.',
        subKey: String(divisor)
      };
    },
    function(max, ctx, cfg) {
      var perRow = _wpTable(cfg);
      var rows = rand(2, 9);
      return {
        text: ctx.nounPlural.charAt(0).toUpperCase() + ctx.nounPlural.slice(1) + ' are planted in ' + rows +
              ' rows. Each row has ' + perRow + '. How many ' + ctx.nounPlural + ' are there in total?',
        answer: perRow * rows,
        working: rows + ' × ' + perRow + ' = ' + (perRow * rows),
        hint: 'An array. Rows times how many in each row.',
        subKey: String(perRow)
      };
    }
  ],

  // ============ RATE ============
  'rate': [
    function(max, ctx, cfg) {
      var price = _wpTable(cfg);
      var qty = rand(2, 9);
      return {
        text: 'One ' + ctx.noun + ' costs $' + price + '. How much do ' + qty + ' ' + ctx.nounPlural + ' cost?',
        answer: price * qty,
        working: qty + ' × $' + price + ' = $' + (price * qty),
        hint: 'Cost of one, times how many. Multiply.',
        subKey: String(price)
      };
    },
    function(max, ctx, cfg) {
      var perPack = _wpTable(cfg);
      var packs = rand(2, 8);
      return {
        text: 'Each packet holds ' + perPack + ' ' + ctx.nounPlural + '. ' + _wpName() + ' buys ' + packs +
              ' packets. How many ' + ctx.nounPlural + ' does she have?',
        answer: perPack * packs,
        working: packs + ' × ' + perPack + ' = ' + (perPack * packs),
        hint: 'How many in one packet, times the number of packets.',
        subKey: String(perPack)
      };
    }
  ],

  // ============ BEFORE-AFTER (two-step) ============
  'before-after': [
    function(max, ctx) {
      var price = rand(2, 12);
      var qty = rand(2, 5);
      var cost = price * qty;
      var paid = cost + rand(1, 20);
      return {
        text: _wpName() + ' buys ' + qty + ' ' + ctx.nounPlural + ' at $' + price +
              ' each. She pays with $' + paid + '. How much change does she get?',
        answer: paid - cost,
        working: qty + ' × $' + price + ' = $' + cost + ', then $' + paid + ' - $' + cost + ' = $' + (paid - cost),
        hint: 'First find the total cost. Then take that from what she paid.',
        steps: 2
      };
    },
    function(max, ctx) {
      var start = rand(20, 60);
      var sold = rand(5, start - 5);
      var got = rand(5, 30);
      return {
        text: ctx.place.charAt(0).toUpperCase() + ctx.place.slice(1) + ' had ' + start + ' ' + ctx.nounPlural +
              '. ' + sold + ' were sold in the morning and ' + got + ' more arrived in the afternoon. How many are there now?',
        answer: start - sold + got,
        working: start + ' - ' + sold + ' = ' + (start - sold) + ', then + ' + got + ' = ' + (start - sold + got),
        hint: 'Work through the day in order. Take away, then add.',
        steps: 2
      };
    },
    function(max, ctx) {
      var each = rand(3, 12);
      var people = rand(2, 6);
      var extra = rand(1, 5) * people;
      return {
        text: people + ' children each have ' + each + ' ' + ctx.nounPlural + '. They are given ' + extra +
              ' more to share equally. How many does each child have now?',
        answer: each + extra / people,
        working: extra + ' ÷ ' + people + ' = ' + (extra / people) + ', then ' + each + ' + ' + (extra / people) + ' = ' + (each + extra / people),
        hint: 'First share the extra out. Then add it to what each child already had.',
        steps: 2
      };
    }
  ]
};

function _wpTable(cfg) {
  if (cfg && cfg.tables && cfg.tables.length) {
    if (typeof _weightedPickSubSkill === 'function') {
      return _weightedPickSubSkill('mul', cfg.tables);
    }
    return pick(cfg.tables);
  }
  return pick([2, 3, 4, 5, 10]);
}

// ---- Which structures suit which skill ---------------------------------

var WP_SKILL_STRUCTURES = {
  add:     ['part-whole', 'change'],
  sub:     ['change', 'comparison', 'part-whole'],
  add100:  ['part-whole', 'change'],
  sub100:  ['change', 'comparison'],
  wp1:     ['part-whole', 'change', 'comparison'],
  mul:     ['groups', 'rate'],
  div:     ['groups'],
  money:   ['rate', 'before-after'],
  multiwp: ['before-after'],
  multiop: ['before-after', 'rate']
};

/** Ceiling for the numbers used, derived from the drill config. */
function _wpMax(skillId, config, diff) {
  if (config && config.numberRange) return config.numberRange[1];
  if (diff && diff.numberRange) return diff.numberRange[1];
  return 20;
}

/**
 * Main entry. Returns a word-problem question object, or null if this
 * skill has no word-problem structures defined.
 *
 * If AI is switched on and a pre-fetched question is waiting, that is
 * used instead — but only if it is already in the queue. We never make
 * a child wait for the network.
 */
function generateWordProblemFor(skillId, config, diff) {
  // 1. Try a warm AI question first (instant, already downloaded).
  if (config && config.useAI && typeof aiTakeQuestion === 'function') {
    var aiQ = aiTakeQuestion(skillId, config);
    if (aiQ) return aiQ;
  }

  // 2. Fall back to the local bank — always available, always instant.
  var structures = WP_SKILL_STRUCTURES[skillId];
  if (!structures || structures.length === 0) return null;

  var wanted = (config && config.structure && config.structure !== 'mixed')
    ? config.structure
    : pick(structures);
  if (!WP_TEMPLATES[wanted]) wanted = pick(structures);

  var templates = WP_TEMPLATES[wanted];
  if (!templates || templates.length === 0) return null;

  var max = _wpMax(skillId, config, diff);
  var ctx = _wpCtx(config && config.theme);
  var built = pick(templates)(max, ctx, config);

  return {
    type: 'word-problem',
    text: built.text,
    answer: built.answer,
    hint: built.hint,
    working: built.working,
    structure: wanted,
    emoji: ctx.emoji,
    bar: built.bar || null,
    steps: built.steps || 1,
    subKey: built.subKey || (config && config.rangeKey) || null
  };
}

window.generateWordProblemFor = generateWordProblemFor;
window.WP_TEMPLATES = WP_TEMPLATES;
window.WP_SKILL_STRUCTURES = WP_SKILL_STRUCTURES;
