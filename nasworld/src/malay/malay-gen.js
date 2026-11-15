// ============================================================
//  MALAY GENERATORS — Question generators for the Malay skills
// ============================================================

function generateMalayQuestion(skillId) {
  var diff = (typeof getSkillDifficulty === 'function') ? getSkillDifficulty(skillId) : { level: 0 };
  switch (skillId) {
    case 'huruf':    return genMalayHuruf(diff);
    case 'nombor':   return genMalayNombor(diff);
    case 'salam':    return genMalaySalam(diff);
    case 'warna':    return genMalayWarna(diff);
    case 'keluarga': return genMalayKeluarga(diff);
    case 'haiwan':   return genMalayHaiwan(diff);
    case 'badan':    return genMalayBadan(diff);
    case 'makanan':  return genMalayMakanan(diff);
    case 'hari':     return genMalayHari(diff);
    case 'ayat':     return genMalayAyat(diff);
    // Primary 2 layer
    case 'imbuhan':    return genMalayImbuhan(diff);
    case 'ganda':      return genMalayGanda(diff);
    case 'penjodoh':   return genMalayPenjodoh(diff);
    case 'tanya':      return genMalayTanya(diff);
    case 'adjektif':   return genMalayAdjektif(diff);
    case 'sendi':      return genMalaySendi(diff);
    case 'hubung':     return genMalayHubung(diff);
    case 'peribahasa': return genMalayPeribahasa(diff);
    case 'kefahaman':  return genMalayKefahaman(diff);
    case 'binaayat':   return genMalayBinaAyat(diff);
    default:         return genMalaySalam(diff);
  }
}

function _shuffle4(correct, pool) {
  var wrongs = shuffle(pool.filter(function(o) { return o !== correct; })).slice(0, 3);
  return shuffle([correct].concat(wrongs));
}

// ===================== HURUF =====================

function genMalayHuruf(diff) {
  var item = pick(MALAY_SUKU_KATA);
  if (diff.level < 1 || Math.random() < 0.4) {
    var letters = ['a','e','i','o','u','b','k','m','n','p','r','s','t','l'];
    var correct = item.syllable[1]; // the vowel inside the suku kata
    return {
      type: 'malay-vowel',
      syllable: item.syllable,
      options: _shuffle4(correct, MALAY_VOWELS),
      answer: correct,
      hint: 'A vowel hides inside every Malay syllable. Look for a, e, i, o or u.'
    };
  }
  // suku kata to whole word
  var allWords = MALAY_SUKU_KATA.map(function(s) { return s.word; });
  return {
    type: 'malay-suku-word',
    syllables: item.word.match(/[bcdfghjklmnpqrstvwxyz]*[aeiou]+/gi) || [item.syllable, item.word.slice(item.syllable.length)],
    word: item.word,
    meaning: item.meaning,
    emoji: item.emoji,
    options: _shuffle4(item.word, allWords),
    answer: item.word,
    hint: 'Glue the syllables together gently. Say them out loud.'
  };
}

// ===================== NOMBOR =====================

function genMalayNombor(diff) {
  var cap = diff.level < 2 ? 10 : 20;
  var item = pick(MALAY_NUMBERS.slice(0, cap));
  var malayToNumber = Math.random() < 0.5;

  if (malayToNumber) {
    var pool = MALAY_NUMBERS.slice(0, cap).map(function(n) { return String(n.n); });
    return {
      type: 'malay-number',
      prompt: item.word,
      options: _shuffle4(String(item.n), pool),
      answer: String(item.n),
      hint: 'Sing 1-10 in Malay in your head: satu, dua, tiga, empat, lima!'
    };
  }

  var poolW = MALAY_NUMBERS.slice(0, cap).map(function(n) { return n.word; });
  return {
    type: 'malay-number-word',
    number: item.n,
    options: _shuffle4(item.word, poolW),
    answer: item.word,
    hint: 'After sepuluh (10), every number ends in -belas until 20.'
  };
}

// ===================== SALAM =====================

function genMalaySalam(diff) {
  var item = pick(MALAY_GREETINGS);
  var malayToEnglish = Math.random() < 0.5;
  if (malayToEnglish) {
    return {
      type: 'malay-greet',
      prompt: item.malay,
      emoji: item.emoji,
      options: _shuffle4(item.english, MALAY_GREETINGS.map(function(g) { return g.english; })),
      answer: item.english,
      hint: 'Imagine where you would say this: ' + item.context + '.'
    };
  }
  return {
    type: 'malay-greet-context',
    prompt: 'You want to say: <b>"' + item.english + '"</b>',
    context: item.context,
    options: _shuffle4(item.malay, MALAY_GREETINGS.map(function(g) { return g.malay; })),
    answer: item.malay,
    hint: 'Selamat... or terima... or maaf?'
  };
}

// ===================== WARNA =====================

function genMalayWarna(diff) {
  var item = pick(MALAY_COLOURS);
  if (Math.random() < 0.5) {
    return {
      type: 'malay-colour-swatch',
      hex: item.hex,
      options: _shuffle4(item.malay, MALAY_COLOURS.map(function(c) { return c.malay; })),
      answer: item.malay,
      hint: 'Match the swatch to the Malay name!'
    };
  }
  return {
    type: 'malay-colour-word',
    prompt: item.malay,
    emoji: item.emoji,
    options: _shuffle4(item.english, MALAY_COLOURS.map(function(c) { return c.english; })),
    answer: item.english,
    hint: 'Picture an object that colour.'
  };
}

// ===================== KELUARGA =====================

function genMalayKeluarga(diff) {
  var item = pick(MALAY_FAMILY);
  return {
    type: 'malay-family',
    prompt: item.malay,
    emoji: item.emoji,
    options: _shuffle4(item.english, MALAY_FAMILY.map(function(f) { return f.english; })),
    answer: item.english,
    hint: 'Older or younger? Ibu, bapa, abang, kakak, adik...'
  };
}

// ===================== HAIWAN =====================

function genMalayHaiwan(diff) {
  var item = pick(MALAY_ANIMALS);
  var malayToEnglish = Math.random() < 0.5;
  if (malayToEnglish) {
    return {
      type: 'malay-animal',
      prompt: item.malay,
      emoji: item.emoji,
      options: _shuffle4(item.english, MALAY_ANIMALS.map(function(a) { return a.english; })),
      answer: item.english,
      hint: 'Picture the haiwan in your head.'
    };
  }
  return {
    type: 'malay-animal-emoji',
    emoji: item.emoji,
    options: _shuffle4(item.malay, MALAY_ANIMALS.map(function(a) { return a.malay; })),
    answer: item.malay,
    hint: 'What does this animal say in Malay?'
  };
}

// ===================== BADAN =====================

function genMalayBadan(diff) {
  var item = pick(MALAY_BODY);
  return {
    type: 'malay-body',
    prompt: item.malay,
    emoji: item.emoji,
    options: _shuffle4(item.english, MALAY_BODY.map(function(b) { return b.english; })),
    answer: item.english,
    hint: 'Point at your body while you guess.'
  };
}

// ===================== MAKANAN =====================

function genMalayMakanan(diff) {
  var item = pick(MALAY_FOOD);
  var malayToEnglish = Math.random() < 0.5;
  if (malayToEnglish) {
    return {
      type: 'malay-food',
      prompt: item.malay,
      emoji: item.emoji,
      options: _shuffle4(item.english, MALAY_FOOD.map(function(f) { return f.english; })),
      answer: item.english,
      hint: 'Imagine the food on your plate.'
    };
  }
  return {
    type: 'malay-food-emoji',
    emoji: item.emoji,
    options: _shuffle4(item.malay, MALAY_FOOD.map(function(f) { return f.malay; })),
    answer: item.malay,
    hint: 'Hawker centre menu: which word do you spot?'
  };
}

// ===================== HARI / CUACA =====================

function genMalayHari(diff) {
  if (Math.random() < 0.6) {
    var d = pick(MALAY_DAYS);
    return {
      type: 'malay-day',
      prompt: d.malay,
      options: _shuffle4(d.english, MALAY_DAYS.map(function(x) { return x.english; })),
      answer: d.english,
      hint: 'Mon → Sun: Isnin, Selasa, Rabu, Khamis, Jumaat, Sabtu, Ahad.'
    };
  }
  var w = pick(MALAY_WEATHER);
  return {
    type: 'malay-weather',
    prompt: w.malay,
    emoji: w.emoji,
    options: _shuffle4(w.english, MALAY_WEATHER.map(function(x) { return x.english; })),
    answer: w.english,
    hint: 'Look at the emoji for a clue!'
  };
}

// ===================== AYAT =====================

function genMalayAyat(diff) {
  var rolls = [
    function() {
      var f = pick(MALAY_FOOD);
      return {
        type: 'malay-sentence',
        prompt: '"I like ' + f.english + '"',
        emoji: f.emoji,
        options: shuffle([
          'Saya suka ' + f.malay + '.',
          f.malay + ' suka saya.',
          'Saya tidak suka ' + f.malay + '.',
          'Suka saya ' + f.malay + '.'
        ]),
        answer: 'Saya suka ' + f.malay + '.',
        hint: 'Saya (I) + suka (like) + makanan = ?'
      };
    },
    function() {
      var a = pick(MALAY_ANIMALS);
      return {
        type: 'malay-sentence',
        prompt: '"This is a ' + a.english + '"',
        emoji: a.emoji,
        options: shuffle([
          'Ini ialah ' + a.malay + '.',
          a.malay + ' ialah ini.',
          'Saya ialah ' + a.malay + '.',
          'Ini bukan ' + a.malay + '.'
        ]),
        answer: 'Ini ialah ' + a.malay + '.',
        hint: 'Ini ialah ___.'
      };
    },
    function() {
      var fam = pick(MALAY_FAMILY);
      // The family words are stored lower-case ("ibu", "pak cik"), and
      // this used to splice them straight into the front of the sentence,
      // so the CORRECT answer read "ibu saya baik." Malay capitalises the
      // first word of a sentence exactly as English does.
      var cap = function(s) { return s.charAt(0).toUpperCase() + s.slice(1); };
      return {
        type: 'malay-sentence',
        prompt: '"My ' + fam.english + ' is kind"',
        emoji: fam.emoji,
        options: shuffle([
          cap(fam.malay) + ' saya baik.',
          'Saya baik ' + fam.malay + '.',
          cap(fam.malay) + ' baik saya.',
          'Baik saya ' + fam.malay + '.'
        ]),
        answer: cap(fam.malay) + ' saya baik.',
        hint: 'Owner comes after in Malay: ibu saya, not saya ibu.'
      };
    }
  ];
  return pick(rolls)();
}

// ============================================================
//  PRIMARY 2 LAYER — generators
//
//  AWAITING HUMAN REVIEW by a Malay speaker (see P2_REVIEW.md).
//
//  Every P2 question is one of three types:
//    malay-p2-mcq      pick one of the choices
//    malay-p2-passage  the same, with a reading passage above it
//    malay-p2-order    tap the word tiles into a sentence
//
//  Every question carries `gloss`, the English shown once she has
//  answered, and where it makes sense `full`, the finished Malay
//  sentence. Nothing is built from a text template with slots, so
//  there is no placeholder to leak onto the screen.
// ============================================================

var MALAY_P2_SKILLS = ['imbuhan', 'ganda', 'penjodoh', 'tanya', 'adjektif',
                       'sendi', 'hubung', 'peribahasa', 'kefahaman', 'binaayat'];

var _p2Recent = {};

/** Pick from a pool, steering away from the last few picks for this key. */
function _p2Pick(key, pool) {
  var recent = _p2Recent[key] || (_p2Recent[key] = []);
  var fresh = pool.filter(function (x) { return recent.indexOf(x) === -1; });
  var item = pick(fresh.length ? fresh : pool);
  recent.push(item);
  var keep = Math.min(8, Math.max(0, pool.length - 1));
  while (recent.length > keep) recent.shift();
  return item;
}

function _p2Cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

/** Put the answer into the blank of a sentence. */
function _p2Fill(sentence, word) { return sentence.replace('____', word); }

/** Choose which of several weighted question makers to run. */
function _p2Roll(table) {
  var total = 0, i;
  for (i = 0; i < table.length; i++) total += table[i][0];
  var r = Math.random() * total;
  for (i = 0; i < table.length; i++) {
    r -= table[i][0];
    if (r < 0) return table[i][1]();
  }
  return table[table.length - 1][1]();
}

function _p2Mcq(q) {
  q.type = q.type || 'malay-p2-mcq';
  q.options = shuffle(q.options);
  return q;
}

// ---------- 1. IMBUHAN ----------

/** Which spelling rule a meN- root follows, in words a child can read. */
function malayP2MenRule(root) {
  var c = root.charAt(0);
  var vowels = (root.match(/[aeiou]/g) || []).length;
  if (vowels === 1) return 'A root with only one beat takes menge-.';
  if (root.slice(0, 2) === 'ny' || 'lmnrwy'.indexOf(c) !== -1) return 'Roots that start with l, m, n or r just take me-.';
  if (c === 'b') return 'Roots that start with b take mem-.';
  if (c === 'p') return 'Roots that start with p take mem-, and the p drops out.';
  if ('cdj'.indexOf(c) !== -1) return 'Roots that start with c, d or j take men-.';
  if (c === 't') return 'Roots that start with t take men-, and the t drops out.';
  if (c === 'k') return 'Roots that start with k take meng-, and the k drops out.';
  if (c === 's') return 'Roots that start with s take meny-, and the s drops out.';
  return 'Roots that start with a vowel, g or h take meng-.';
}

/** Wrong spellings for a meN- word: the other prefixes glued straight on. */
function malayP2MenWrong(item) {
  var known = {};
  MALAY_P2_MEN.forEach(function (m) { known[m.form] = true; });
  MALAY_P2_MEN_REAL_WORDS.forEach(function (w) { known[w] = true; });
  var out = [];
  ['me', 'mem', 'men', 'meng', 'meny', 'menge'].forEach(function (pre) {
    var w = pre + item.root;
    if (w !== item.form && !known[w] && out.indexOf(w) === -1) out.push(w);
  });
  return out;
}

function malayP2BerWrong(item) {
  return ['be', 'bel', 'ber'].map(function (pre) { return pre + item.root; })
    .filter(function (w) { return w !== item.form; });
}

function _p2MenIsPlain(m) {
  // No letter drops and it is not a one-beat root: the easy end.
  return m.form.slice(-m.root.length) === m.root && m.form.indexOf('menge') !== 0;
}

function genMalayImbuhan(diff) {
  var lvl = diff.level || 0;

  function menForm(pool) {
    var m = _p2Pick('imbuhan-men', pool);
    return _p2Mcq({
      subKey: 'me',
      instruction: 'Add <b>me-</b> to this root word. Which spelling is correct?',
      stem: m.root,
      stemNote: 'to ' + m.en,
      options: [m.form].concat(shuffle(malayP2MenWrong(m)).slice(0, 3)),
      answer: m.form,
      gloss: m.form + ' = to ' + m.en,
      note: malayP2MenRule(m.root),
      hint: 'Look at the first letter of the root. Does it stay, or does it drop out?',
      text: 'me- + ' + m.root
    });
  }
  function berForm() {
    var b = _p2Pick('imbuhan-ber', MALAY_P2_BER);
    var rule = b.root.charAt(0) === 'r' ? 'Before r the prefix is just be-, so the word has only one r.'
      : b.root === 'kerja' ? 'Kerja is a special one. It takes be-, not ber-.'
      : 'Most roots simply take ber-.';
    return _p2Mcq({
      subKey: 'ber',
      instruction: 'Add <b>ber-</b> to this root word. Which spelling is correct?',
      stem: b.root,
      stemNote: 'to ' + b.en,
      options: [b.form].concat(malayP2BerWrong(b)),
      answer: b.form,
      gloss: b.form + ' = to ' + b.en,
      note: rule,
      hint: 'Say each one out loud. Which one have you heard before?',
      text: 'ber- + ' + b.root
    });
  }
  function sentence(prefixes) {
    var pool = MALAY_P2_IMBUHAN_AYAT.filter(function (x) { return prefixes.indexOf(x.p) !== -1; });
    var it = _p2Pick('imbuhan-ayat', pool);
    var notes = {
      me: 'A me- verb tells us what the doer is doing.',
      ber: 'A ber- verb tells us what someone is doing.',
      di: 'A di- verb is used when something is done to the thing, often with oleh (by).',
      ter: 'A ter- verb can show that something happened by accident.'
    };
    return _p2Mcq({
      subKey: it.p,
      instruction: 'Choose the word that completes the sentence.',
      stem: it.s,
      options: [it.a].concat(it.o),
      answer: it.a,
      full: _p2Fill(it.s, it.a),
      gloss: it.en,
      note: notes[it.p],
      hint: 'Who is doing the action? Or is it being done to something?',
      text: it.s
    });
  }

  var plain = MALAY_P2_MEN.filter(_p2MenIsPlain);
  var tricky = MALAY_P2_MEN.filter(function (m) { return !_p2MenIsPlain(m); });

  if (lvl <= 0) return menForm(plain);
  if (lvl === 1) return _p2Roll([[3, function () { return menForm(tricky); }],
                                 [2, function () { return menForm(plain); }],
                                 [2, berForm]]);
  if (lvl === 2) return _p2Roll([[3, function () { return menForm(MALAY_P2_MEN); }],
                                 [2, berForm],
                                 [4, function () { return sentence(['me', 'ber']); }]]);
  if (lvl === 3) return _p2Roll([[2, function () { return menForm(tricky); }],
                                 [1, berForm],
                                 [6, function () { return sentence(['me', 'ber', 'di']); }]]);
  return _p2Roll([[2, function () { return menForm(tricky); }],
                  [8, function () { return sentence(['me', 'ber', 'di', 'ter']); }]]);
}

// ---------- 2. KATA GANDA ----------

function genMalayGanda(diff) {
  var lvl = diff.level || 0;

  function plural() {
    var it = _p2Pick('ganda-plural', MALAY_P2_GANDA_PLURAL);
    var others = shuffle(MALAY_P2_GANDA_PLURAL.filter(function (x) { return x !== it; })).slice(0, 2);
    var word = it.w + '-' + it.w;
    return _p2Mcq({
      subKey: 'plural',
      instruction: 'What does this word mean?',
      stem: word,
      options: [it.many, it.one, others[0].many, others[1].many],
      answer: it.many,
      gloss: word + ' = ' + it.many,
      note: 'Saying a naming word twice shows there is more than one.',
      hint: 'The word is said twice. One thing, or more than one?',
      text: word
    });
  }
  function semu() {
    var it = _p2Pick('ganda-semu', MALAY_P2_GANDA_SEMU);
    var others = shuffle(MALAY_P2_GANDA_SEMU.filter(function (x) { return x !== it; })).slice(0, 3);
    return _p2Mcq({
      subKey: 'semu',
      instruction: 'What is this?',
      stem: it.w,
      options: [it.en].concat(others.map(function (x) { return x.en; })),
      answer: it.en,
      gloss: it.w + ' = ' + it.en,
      note: 'This word is always said twice. It is a name, not a way of saying many.',
      hint: 'Some doubled words are simply the name of a thing.',
      text: it.w
    });
  }
  function frasa() {
    var it = _p2Pick('ganda-frasa', MALAY_P2_GANDA_FRASA);
    var ok = it.num + ' ' + it.pb + ' ' + it.n;
    var doubled = it.n + '-' + it.n;
    return _p2Mcq({
      subKey: 'rule',
      instruction: 'Which one is correct?',
      options: [ok, it.num + ' ' + it.pb + ' ' + doubled, it.pb + ' ' + it.num + ' ' + doubled],
      answer: ok,
      gloss: ok + ' = ' + it.en,
      note: 'After a number, the naming word is said once only.',
      hint: 'The number already tells us how many.',
      text: 'Which is correct: ' + ok + ' or ' + it.num + ' ' + it.pb + ' ' + doubled
    });
  }
  function ayat() {
    var it = _p2Pick('ganda-ayat', MALAY_P2_GANDA_AYAT);
    return _p2Mcq({
      subKey: 'rule',
      instruction: 'Choose the word that completes the sentence.',
      stem: it.s,
      options: [it.a].concat(it.o),
      answer: it.a,
      full: _p2Fill(it.s, it.a),
      gloss: it.en,
      note: 'After a number, or after semua, banyak, beberapa, para, setiap and kedua-dua, the naming word is said once only.',
      hint: 'Is there already a word in the sentence that tells us how many?',
      text: it.s
    });
  }
  function pilih() {
    var it = _p2Pick('ganda-pilih', MALAY_P2_GANDA_PILIH);
    var doubled = it.n + '-' + it.n;
    var plainRight = _p2Cap(doubled) + ' ' + it.pred + '.';
    var numRight = it.num + ' ' + it.n + ' ' + it.pred + '.';
    var wrongSemua = 'Semua ' + doubled + ' ' + it.pred + '.';
    var wrongNum = it.num + ' ' + doubled + ' ' + it.pred + '.';
    var useNum = Math.random() < 0.5;
    var right = useNum ? numRight : plainRight;
    return _p2Mcq({
      subKey: 'rule',
      instruction: 'Which sentence is correct?',
      options: [right, wrongSemua, wrongNum],
      answer: right,
      full: right,
      gloss: useNum ? it.enNum : it.en,
      note: useNum ? 'With a number in front, the naming word is said once only.'
                   : 'With no number and no word like semua in front, doubling the word shows there are many.',
      hint: 'Look for a number or the word semua. If one is there, do not double.',
      text: 'Which sentence is correct?'
    });
  }

  if (lvl <= 0) return plural();
  if (lvl === 1) return _p2Roll([[3, plural], [3, semu], [2, frasa]]);
  if (lvl === 2) return _p2Roll([[1, plural], [2, semu], [4, frasa], [2, ayat]]);
  if (lvl === 3) return _p2Roll([[1, semu], [3, frasa], [5, ayat], [2, pilih]]);
  return _p2Roll([[2, frasa], [5, ayat], [5, pilih]]);
}

// ---------- 3. PENJODOH BILANGAN ----------

var MALAY_P2_PB_NOTE = {
  orang: 'Orang is for people.',
  ekor: 'Ekor is for animals.',
  buah: 'Buah is for big or solid things.',
  biji: 'Biji is for small round things and fruit.',
  batang: 'Batang is for long things.',
  helai: 'Helai is for thin, soft things such as cloth and paper.',
  keping: 'Keping is for thin, flat pieces.',
  kuntum: 'Kuntum is for flowers.',
  pasang: 'Pasang is for things that come in twos.',
  bilah: 'Bilah is for things with a blade.',
  pucuk: 'Pucuk is for letters.',
  utas: 'Utas is for things like rope and chains.',
  ketul: 'Ketul is for lumps.',
  bentuk: 'Bentuk is for rings.',
  kaki: 'Kaki is for umbrellas.'
};

/** Three wrong classifiers for a noun, never one that could also be right. */
function malayP2PbWrong(item) {
  var not = item.not || [];
  return shuffle(MALAY_P2_PB_CORE.filter(function (pb) {
    return pb !== item.pb && not.indexOf(pb) === -1;
  })).slice(0, 3);
}

function genMalayPenjodoh(diff) {
  var lvl = diff.level || 0;
  var numbers = Object.keys(MALAY_P2_NUM_EN);

  function poolFor(pbs, extra) {
    return MALAY_P2_PB.filter(function (x) {
      if (x.extra) return !!extra;
      return !pbs || pbs.indexOf(x.pb) !== -1;
    });
  }
  function phrase(pool) {
    var it = _p2Pick('pb-phrase', pool);
    var num = pick(numbers);
    var ok = num + ' ' + it.pb + ' ' + it.n;
    return _p2Mcq({
      subKey: it.pb,
      instruction: 'Choose the counting word (penjodoh bilangan).',
      stem: num + ' ____ ' + it.n,
      options: [it.pb].concat(malayP2PbWrong(it)),
      answer: it.pb,
      gloss: ok + ' = ' + MALAY_P2_NUM_EN[num] + ' ' + it.many,
      note: MALAY_P2_PB_NOTE[it.pb],
      hint: 'Is it a person, an animal or a thing? What shape is it?',
      text: num + ' ____ ' + it.n
    });
  }
  function seForm(pool) {
    var it = _p2Pick('pb-se', pool);
    var ok = 'se' + it.pb + ' ' + it.n;
    return _p2Mcq({
      subKey: it.pb,
      instruction: 'Only one this time. Which is correct?',
      options: [ok].concat(malayP2PbWrong(it).map(function (pb) { return 'se' + pb + ' ' + it.n; })),
      answer: ok,
      gloss: ok + ' = one ' + it.one,
      note: 'For one, satu shrinks to se- and joins the counting word. ' + MALAY_P2_PB_NOTE[it.pb],
      hint: 'Find the counting word hiding after se-.',
      text: 'se____ ' + it.n
    });
  }
  function sentence() {
    var it = _p2Pick('pb-ayat', MALAY_P2_PB_AYAT);
    return _p2Mcq({
      subKey: it.a,
      instruction: 'Choose the counting word that completes the sentence.',
      stem: it.s,
      options: [it.a].concat(it.o),
      answer: it.a,
      full: _p2Fill(it.s, it.a),
      gloss: it.en,
      note: MALAY_P2_PB_NOTE[it.a],
      hint: 'Look at the word just after the blank. What kind of thing is it?',
      text: it.s
    });
  }

  if (lvl <= 0) return phrase(poolFor(['orang', 'ekor', 'buah']));
  if (lvl === 1) return phrase(poolFor(['orang', 'ekor', 'buah', 'biji', 'batang', 'helai']));
  if (lvl === 2) return _p2Roll([[5, function () { return phrase(poolFor(null)); }],
                                 [3, function () { return seForm(poolFor(null)); }]]);
  if (lvl === 3) return _p2Roll([[3, function () { return phrase(poolFor(['biji', 'batang', 'helai', 'keping', 'kuntum', 'pasang'])); }],
                                 [2, function () { return seForm(poolFor(null)); }],
                                 [4, sentence]]);
  return _p2Roll([[3, function () { return phrase(poolFor(null, true)); }],
                  [2, function () { return seForm(poolFor(null, true)); }],
                  [2, function () { return phrase(poolFor(['keping', 'kuntum', 'pasang', 'helai', 'batang'])); }],
                  [4, sentence]]);
}

// ---------- 4. KATA TANYA ----------

function genMalayTanya(diff) {
  var lvl = diff.level || 0;

  function toEnglish() {
    var it = _p2Pick('tanya-en', MALAY_P2_TANYA);
    return _p2Mcq({
      subKey: it.w,
      instruction: 'What does this question word mean?',
      stem: it.w,
      options: _shuffle4(it.en, MALAY_P2_TANYA.map(function (x) { return x.en; })),
      answer: it.en,
      gloss: it.w + ' = ' + it.en,
      hint: 'Think of a question you ask every day with this word.',
      text: it.w
    });
  }
  function toMalay() {
    var it = _p2Pick('tanya-ms', MALAY_P2_TANYA);
    return _p2Mcq({
      subKey: it.w,
      instruction: 'Which question word means <b>' + it.en + '</b>?',
      options: _shuffle4(it.w, MALAY_P2_TANYA.map(function (x) { return x.w; })),
      answer: it.w,
      gloss: it.w + ' = ' + it.en,
      hint: 'Apa, siapa, bila, di mana, mengapa, bagaimana, berapa.',
      text: 'Question word for: ' + it.en
    });
  }
  function sentence(words) {
    var pool = MALAY_P2_TANYA_AYAT.filter(function (x) { return !words || words.indexOf(x.w) !== -1; });
    var it = _p2Pick('tanya-ayat', pool);
    var not = it.not || [];
    function shown(t) { return it.bare ? _p2Cap(t.w) : t.kah; }
    var right = MALAY_P2_TANYA.filter(function (t) { return t.w === it.w; })[0];
    var wrong = shuffle(MALAY_P2_TANYA.filter(function (t) {
      return t.w !== it.w && not.indexOf(t.w) === -1;
    })).slice(0, 3);
    return _p2Mcq({
      subKey: it.w,
      instruction: 'Choose the question word. The reply will help you.',
      stem: it.q,
      stemReply: it.r,
      options: [shown(right)].concat(wrong.map(shown)),
      answer: shown(right),
      full: _p2Fill(it.q, shown(right)) + ' ' + it.r,
      gloss: it.en,
      note: right.w + ' = ' + right.en,
      hint: 'Read the reply. Is it a person, a place, a time, a reason, a way or a number?',
      text: it.q
    });
  }

  if (lvl <= 0) return toEnglish();
  if (lvl === 1) return _p2Roll([[1, toEnglish], [1, toMalay]]);
  if (lvl === 2) return _p2Roll([[2, toMalay], [5, function () { return sentence(['apa', 'siapa', 'di mana', 'berapa']); }]]);
  return _p2Roll([[1, toMalay], [8, function () { return sentence(null); }]]);
}

// ---------- 5. KATA ADJEKTIF ----------

function genMalayAdjektif(diff) {
  var lvl = diff.level || 0;

  // Every antonym word as its own entry, carrying its partner.
  function sides() {
    var out = [];
    MALAY_P2_ANTONIM.forEach(function (p) {
      out.push({ w: p.a, en: p.ea, opp: p.b, oppEn: p.eb, pair: p });
      out.push({ w: p.b, en: p.eb, opp: p.a, oppEn: p.ea, pair: p });
    });
    return out;
  }
  // Words safe to sit beside this one as wrong choices.
  function safeOthers(side, all) {
    return all.filter(function (o) {
      return o.pair !== side.pair &&
             side.pair.avoid.indexOf(o.w) === -1 &&
             o.pair.avoid.indexOf(side.w) === -1 &&
             o.pair.avoid.indexOf(side.opp) === -1;
    });
  }
  function meaning() {
    var all = sides();
    var it = _p2Pick('adj-mean', all);
    var others = shuffle(safeOthers(it, all)).slice(0, 3);
    return _p2Mcq({
      subKey: 'meaning',
      instruction: 'What does this describing word mean?',
      stem: it.w,
      options: [it.en].concat(others.map(function (o) { return o.en; })),
      answer: it.en,
      gloss: it.w + ' = ' + it.en,
      hint: 'Picture something you would describe with this word.',
      text: it.w
    });
  }
  function antonym() {
    var all = sides();
    var it = _p2Pick('adj-ant', all);
    var others = shuffle(safeOthers(it, all)).slice(0, 3);
    return _p2Mcq({
      subKey: 'antonim',
      instruction: 'Choose the opposite (antonim).',
      stem: it.w,
      options: [it.opp].concat(others.map(function (o) { return o.w; })),
      answer: it.opp,
      gloss: it.w + ' = ' + it.en + ', ' + it.opp + ' = ' + it.oppEn,
      hint: 'Think of the word that means the other end.',
      text: 'Opposite of ' + it.w
    });
  }
  function synonym() {
    var it = _p2Pick('adj-syn', MALAY_P2_SINONIM);
    var flip = Math.random() < 0.5;
    var shownWord = flip ? it.b : it.a;
    var right = flip ? it.a : it.b;
    return _p2Mcq({
      subKey: 'sinonim',
      instruction: 'Choose the word with the same meaning (sinonim).',
      stem: shownWord,
      options: [right].concat(it.o),
      answer: right,
      gloss: it.a + ' and ' + it.b + ' both mean ' + it.en,
      hint: 'Two different words, one meaning.',
      text: 'Same meaning as ' + shownWord
    });
  }
  function sentence() {
    var it = _p2Pick('adj-ayat', MALAY_P2_ADJ_AYAT);
    return _p2Mcq({
      subKey: 'ayat',
      instruction: 'Choose the describing word that completes the sentence.',
      stem: it.s,
      options: [it.a].concat(it.o),
      answer: it.a,
      full: _p2Fill(it.s, it.a),
      gloss: it.en,
      note: 'Tetapi means but, so the second part is the opposite of the first.',
      hint: 'Tetapi means but. What is the opposite of the first describing word?',
      text: it.s
    });
  }

  if (lvl <= 0) return meaning();
  if (lvl === 1) return _p2Roll([[2, meaning], [4, antonym]]);
  if (lvl === 2) return _p2Roll([[4, antonym], [3, synonym]]);
  if (lvl === 3) return _p2Roll([[3, antonym], [3, synonym], [3, sentence]]);
  return _p2Roll([[2, antonym], [4, synonym], [4, sentence]]);
}

// ---------- 6. KATA SENDI NAMA ----------

var MALAY_P2_SENDI_NOTE = {
  di: 'Di shows the place where something is.',
  ke: 'Ke shows the place someone is going to.',
  dari: 'Dari is for the place, or the time, that something starts from.',
  pada: 'Pada is for a time. It is also used when something is with a person.',
  kepada: 'Kepada is used when the one receiving is a person.',
  daripada: 'Daripada is for a person something comes from, for comparing, and for what a thing is made of.'
};

function genMalaySendi(diff) {
  var lvl = diff.level || 0;
  var sets = [
    ['di', 'ke'],
    ['di', 'ke', 'dari', 'pada'],
    ['di', 'ke', 'dari', 'pada', 'kepada', 'daripada'],
    ['dari', 'pada', 'kepada', 'daripada'],
    ['pada', 'kepada', 'daripada', 'dari']
  ];
  var allowed = sets[Math.max(0, Math.min(4, lvl))];
  var pool = MALAY_P2_SENDI.filter(function (x) { return allowed.indexOf(x.a.toLowerCase()) !== -1; });
  var it = _p2Pick('sendi', pool);
  return _p2Mcq({
    subKey: it.a.toLowerCase(),
    instruction: 'Choose the word that completes the sentence.',
    stem: it.s,
    options: [it.a].concat(it.o),
    answer: it.a,
    full: _p2Fill(it.s, it.a),
    gloss: it.en,
    note: MALAY_P2_SENDI_NOTE[it.a.toLowerCase()],
    hint: 'Is the word after the blank a place, a time or a person?',
    text: it.s
  });
}

// ---------- 7. KATA HUBUNG ----------

var MALAY_P2_HUBUNG_NOTE = {
  dan: 'Dan (and) adds one thing to another.',
  tetapi: 'Tetapi (but) joins two ideas that pull opposite ways.',
  kerana: 'Kerana (because) gives the reason.',
  atau: 'Atau (or) offers a choice.',
  lalu: 'Lalu (and then) shows what happened next.',
  sambil: 'Sambil (while) shows one person doing two things at the same time.'
};

function genMalayHubung(diff) {
  var lvl = diff.level || 0;

  function meaning() {
    var it = _p2Pick('hubung-kata', MALAY_P2_HUBUNG_KATA);
    return _p2Mcq({
      subKey: it.w,
      instruction: 'What does this joining word mean?',
      stem: it.w,
      options: _shuffle4(it.en, MALAY_P2_HUBUNG_KATA.map(function (x) { return x.en; })),
      answer: it.en,
      gloss: it.w + ' = ' + it.en,
      hint: 'Think of a sentence where you have heard this word.',
      text: it.w
    });
  }
  function sentence(words) {
    var pool = MALAY_P2_HUBUNG.filter(function (x) { return words.indexOf(x.a) !== -1; });
    var it = _p2Pick('hubung-ayat', pool);
    return _p2Mcq({
      subKey: it.a,
      instruction: 'Choose the joining word that completes the sentence.',
      stem: it.s,
      options: [it.a].concat(it.o),
      answer: it.a,
      full: _p2Fill(it.s, it.a),
      gloss: it.en,
      note: MALAY_P2_HUBUNG_NOTE[it.a],
      hint: 'Is the second part adding, giving a reason, a choice, or what came next?',
      text: it.s
    });
  }

  if (lvl <= 0) return _p2Roll([[3, meaning], [4, function () { return sentence(['dan', 'kerana']); }]]);
  if (lvl === 1) return _p2Roll([[1, meaning], [6, function () { return sentence(['dan', 'kerana', 'tetapi']); }]]);
  if (lvl === 2) return sentence(['dan', 'kerana', 'tetapi', 'atau']);
  if (lvl === 3) return sentence(['tetapi', 'kerana', 'atau', 'lalu', 'sambil']);
  return sentence(['tetapi', 'atau', 'lalu', 'sambil']);
}

// ---------- 8. PERIBAHASA MUDAH ----------

function genMalayPeribahasa(diff) {
  var lvl = diff.level || 0;

  function clash(a, b) {
    return a.avoid.indexOf(b.id) !== -1 || b.avoid.indexOf(a.id) !== -1;
  }
  function others(it) {
    return shuffle(MALAY_P2_SIMPULAN.filter(function (x) { return x !== it && !clash(it, x); })).slice(0, 3);
  }
  function meaning() {
    var it = _p2Pick('simpulan-mean', MALAY_P2_SIMPULAN);
    return _p2Mcq({
      subKey: 'meaning',
      instruction: 'What does this simpulan bahasa mean?',
      stem: it.id,
      options: [it.en].concat(others(it).map(function (x) { return x.en; })),
      answer: it.en,
      gloss: it.id + ' = ' + it.en,
      note: 'A simpulan bahasa is two words that together mean something new.',
      hint: 'The two words together do not mean what they say one by one.',
      text: it.id
    });
  }
  function reverse() {
    var it = _p2Pick('simpulan-rev', MALAY_P2_SIMPULAN);
    return _p2Mcq({
      subKey: 'meaning',
      instruction: 'Which simpulan bahasa means <b>' + it.en + '</b>?',
      options: [it.id].concat(others(it).map(function (x) { return x.id; })),
      answer: it.id,
      gloss: it.id + ' = ' + it.en,
      hint: 'Say each one and picture what it describes.',
      text: 'Simpulan bahasa for: ' + it.en
    });
  }
  function usage() {
    var it = _p2Pick('simpulan-use', MALAY_P2_SIMPULAN.filter(function (x) { return !!x.s; }));
    return _p2Mcq({
      subKey: 'usage',
      instruction: 'Choose the simpulan bahasa that fits.',
      stem: it.s,
      options: [it.id].concat(it.o),
      answer: it.id,
      full: _p2Fill(it.s, it.id),
      gloss: it.sen,
      note: it.id + ' = ' + it.en,
      hint: 'Read the whole thing first. What kind of person or thing is being described?',
      text: it.s
    });
  }

  if (lvl <= 0) return meaning();
  if (lvl === 1) return _p2Roll([[3, meaning], [2, reverse]]);
  if (lvl === 2) return _p2Roll([[2, meaning], [2, reverse], [3, usage]]);
  if (lvl === 3) return _p2Roll([[1, reverse], [3, usage]]);
  return _p2Roll([[1, reverse], [5, usage]]);
}

// ---------- 9. KEFAHAMAN ----------
// Questions are dealt from one passage until it runs out, so a session
// reads a passage and answers a few questions on it, instead of meeting
// a new passage for every single question.

var _p2Kef = { id: null, level: -1, left: [] };

function genMalayKefahaman(diff) {
  var lvl = diff.level || 0;
  var maxTier = lvl <= 0 ? 0 : (lvl === 1 ? 1 : 2);

  if (!_p2Kef.left.length || _p2Kef.level !== lvl) {
    var passage = _p2Pick('kefahaman', MALAY_P2_KEFAHAMAN);
    _p2Kef.id = passage.id;
    _p2Kef.level = lvl;
    _p2Kef.left = passage.qs.filter(function (q) { return q.lvl <= maxTier; });
  }
  var p = MALAY_P2_KEFAHAMAN.filter(function (x) { return x.id === _p2Kef.id; })[0];
  var q = _p2Kef.left.shift();

  return _p2Mcq({
    type: 'malay-p2-passage',
    subKey: p.id,
    instruction: 'Read the passage, then answer the question.',
    passage: { title: p.title, text: p.text },
    passageEn: p.en,
    stem: q.q,
    options: [q.a].concat(q.o),
    answer: q.a,
    gloss: q.en,
    hint: 'The answer is in the passage. Find the sentence that talks about it.',
    text: q.q
  });
}

// ---------- 10. BINA AYAT ----------

function genMalayBinaAyat(diff) {
  var lvl = diff.level || 0;
  var range = [[5, 5], [5, 6], [6, 6], [6, 7], [6, 8]][Math.max(0, Math.min(4, lvl))];
  var pool = MALAY_P2_BINA.filter(function (x) {
    var n = x.s.split(' ').length;
    return n >= range[0] && n <= range[1];
  });
  var it = _p2Pick('bina', pool);
  var words = it.s.split(' ');
  var tiles = shuffle(words);
  // A shuffle that lands back on the answer is no puzzle at all.
  for (var tries = 0; tries < 8 && tiles.join(' ') === it.s; tries++) tiles = shuffle(words);
  if (tiles.join(' ') === it.s) tiles = words.slice(1).concat(words[0]);

  return {
    type: 'malay-p2-order',
    subKey: 'len' + words.length,
    instruction: 'Tap the words in order to build a sentence.',
    words: tiles,
    answer: it.s,
    accept: [it.s].concat(it.also || []),
    gloss: it.en,
    hint: 'The word with a capital letter goes first. The word with the full stop goes last.',
    text: 'Bina ayat: ' + tiles.join(' / ')
  };
}
