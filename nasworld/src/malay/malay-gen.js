// ============================================================
//  MALAY GENERATORS — Question generators for the 10 Malay skills
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
      return {
        type: 'malay-sentence',
        prompt: '"My ' + fam.english + ' is kind"',
        emoji: fam.emoji,
        options: shuffle([
          fam.malay + ' saya baik.',
          'Saya baik ' + fam.malay + '.',
          fam.malay + ' baik saya.',
          'Baik saya ' + fam.malay + '.'
        ]),
        answer: fam.malay + ' saya baik.',
        hint: 'Owner comes after in Malay: ibu saya, not saya ibu.'
      };
    }
  ];
  return pick(rolls)();
}
