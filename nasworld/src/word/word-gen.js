// ============================================================
//  WORD GENERATORS — Question generators for all 10 word skills
// ============================================================

function generateWordQuestion(skillId) {
  var diff = getSkillDifficulty(skillId);
  switch (skillId) {
    case 'phonics':       return genPhonics(diff);
    case 'sight':         return genSight(diff);
    case 'spell':         return genSpell(diff);
    case 'grammar':       return genGrammar(diff);
    case 'vocab':         return genVocab(diff);
    case 'sentence':      return genSentence(diff);
    case 'comprehension': return genComprehension(diff);
    case 'poetry':        return genPoetry(diff);
    case 'story':         return genStory(diff);
    case 'paragraph':     return genParagraph(diff);
    default:              return genPhonics(diff);
  }
}

// ===================== P1 GENERATORS =====================

function genPhonics(diff) {
  var families = Object.keys(CVC_FAMILIES);
  var family = pick(families);
  var words = CVC_FAMILIES[family];
  var word = pick(words);

  if (diff.level < 2) {
    // Which word belongs to the -XX family?
    var correct = word;
    var wrongFamilies = families.filter(function(f) { return f !== family; });
    var wrongs = wrongFamilies.slice(0, 3).map(function(f) { return pick(CVC_FAMILIES[f]); });
    return {
      type: 'phonics-family',
      family: family,
      word: correct,
      options: shuffle([correct].concat(wrongs)),
      answer: correct,
      hint: 'This word ends with -' + family + '. Sound it out!'
    };
  } else {
    // What sound does this word start with?
    var firstLetter = word[0].toUpperCase();
    var otherLetters = shuffle('BCDFGHJKLMNPRSTVW'.split('')).filter(function(l) {
      return l !== firstLetter;
    }).slice(0, 3);
    return {
      type: 'phonics-initial',
      word: word,
      options: shuffle([firstLetter].concat(otherLetters)),
      answer: firstLetter,
      hint: 'Say the word slowly. What sound do you hear first?'
    };
  }
}

function genSight(diff) {
  var level = Math.min(diff.level, SIGHT_WORDS_BY_LEVEL.length - 1);
  // Pool words from current level and below
  var pool = [];
  for (var i = 0; i <= level; i++) {
    pool = pool.concat(SIGHT_WORDS_BY_LEVEL[i]);
  }
  var word = pick(pool);

  if (Math.random() < 0.5) {
    // Pick the correct word
    var wrongs = shuffle(pool.filter(function(w) { return w !== word; })).slice(0, 3);
    return {
      type: 'sight-pick',
      targetWord: word,
      options: shuffle([word].concat(wrongs)),
      answer: word,
      hint: 'Look carefully at each word. Which one matches?'
    };
  } else {
    // Find the word that matches (shown briefly, then hidden — flash card style)
    var wrongs2 = shuffle(pool.filter(function(w) { return w !== word; })).slice(0, 3);
    return {
      type: 'sight-flash',
      targetWord: word,
      options: shuffle([word].concat(wrongs2)),
      answer: word,
      hint: 'Try to remember the word you saw. Sound it out in your head!'
    };
  }
}

function genSpell(diff) {
  // Pick a CVC word that has a picture
  var spellableWords = Object.keys(SPELLING_PIC_MAP);
  var word = pick(spellableWords);
  var emoji = SPELLING_PIC_MAP[word];

  if (diff.level < 2) {
    // Fill in the missing letter
    var pos = rand(0, word.length - 1);
    var blank = word.substring(0, pos) + '_' + word.substring(pos + 1);
    var correctLetter = word[pos];
    var otherLetters = shuffle('abcdefghijklmnoprstuvw'.split('')).filter(function(l) {
      return l !== correctLetter;
    }).slice(0, 3);
    return {
      type: 'spell-missing',
      word: word,
      emoji: emoji,
      blank: blank,
      missingLetter: correctLetter,
      options: shuffle([correctLetter].concat(otherLetters)),
      answer: correctLetter,
      hint: 'Say the word for the picture. What letter is missing?'
    };
  } else {
    // Type the full word
    return {
      type: 'spell-full',
      word: word,
      emoji: emoji,
      answer: word,
      hint: 'Look at the picture. Sound out each letter: ' + word.split('').join('-') + '.'
    };
  }
}

// ===================== P2 GENERATORS =====================

function genGrammar(diff) {
  var exercises = GRAMMAR_EXERCISES;
  var ex = pick(exercises);

  return {
    type: 'grammar-mcq',
    instruction: ex.instruction,
    sentence: ex.sentence,
    options: shuffle(ex.options),
    answer: ex.answer,
    grammarType: ex.type,
    hint: ex.type.indexOf('noun') >= 0 ? 'A noun is a person, place, animal, or thing.' :
          ex.type.indexOf('verb') >= 0 ? 'A verb is an action word — something you can do.' :
          ex.type.indexOf('adj') >= 0 ? 'An adjective describes what something is like.' :
          'Think about what sounds right when you say it out loud.'
  };
}

function genVocab(diff) {
  var item = pick(VOCAB_ITEMS);

  if (Math.random() < 0.6) {
    // Pick the meaning
    return {
      type: 'vocab-meaning',
      word: item.word,
      sentence: item.sentence,
      options: shuffle(item.options),
      answer: item.options[0],
      hint: 'Read the sentence. What does "' + item.word + '" mean?'
    };
  } else {
    // Pick the word from meaning
    var wrongs = shuffle(VOCAB_ITEMS.filter(function(v) { return v.word !== item.word; })).slice(0, 3);
    return {
      type: 'vocab-word',
      meaning: item.meaning,
      options: shuffle([item.word].concat(wrongs.map(function(v) { return v.word; }))),
      answer: item.word,
      hint: 'Which word means "' + item.meaning + '"?'
    };
  }
}

function genSentence(diff) {
  var level = Math.min(diff.level, 3);
  var patterns = SENTENCE_PATTERNS.filter(function(p) { return p.level <= level; });
  var pat = pick(patterns);

  // Build the sentence
  var words = pat.pattern.map(function(token) {
    if (token === '_noun') return pick(WORD_BANKS.nouns);
    if (token === '_adj') return pick(WORD_BANKS.adjectives);
    if (token === '_verb') return pick(WORD_BANKS.verbs);
    if (token === '_name') return pick(WORD_BANKS.names);
    if (token === '_place') return pick(WORD_BANKS.places);
    return token;
  });

  var correctSentence = words.join(' ').replace(/ \./g, '.').replace(/ s\./g, 's.');

  // Scramble the words (excluding punctuation)
  var content = words.filter(function(w) { return w !== '.'; });
  var scrambled = shuffle(content);
  // Make sure it's actually scrambled
  var safety = 0;
  while (scrambled.join(' ') === content.join(' ') && safety < 10) {
    scrambled = shuffle(content);
    safety++;
  }

  return {
    type: 'sentence-build',
    words: scrambled,
    answer: correctSentence,
    correctOrder: content,
    hint: 'Start with a capital letter. End with a full stop. What makes sense?'
  };
}

// ===================== P3 GENERATORS =====================

function genComprehension(diff) {
  var passage = pick(COMPREHENSION_PASSAGES);
  var q = pick(passage.questions);

  return {
    type: 'comprehension-mcq',
    title: passage.title,
    text: passage.text,
    question: q.question,
    options: shuffle(q.options),
    answer: q.answer,
    hint: 'Read the passage carefully. The answer is in the text!'
  };
}

function genPoetry(diff) {
  if (diff.level < 2) {
    // Rhyming word match
    var set = pick(POETRY_DATA.rhymeSets);
    var target = pick(set);
    var correctRhyme = pick(set.filter(function(w) { return w !== target; }));
    var otherSets = POETRY_DATA.rhymeSets.filter(function(s) { return s !== set; });
    var wrongs = otherSets.slice(0, 3).map(function(s) { return pick(s); });
    return {
      type: 'poetry-rhyme',
      targetWord: target,
      options: shuffle([correctRhyme].concat(wrongs)),
      answer: correctRhyme,
      hint: 'Which word sounds like "' + target + '" at the end?'
    };
  } else if (diff.level < 3) {
    // Syllable counting
    var syllLevel = pick([1, 2, 3]);
    var word = pick(POETRY_DATA.syllableWords[syllLevel]);
    var options = shuffle([1, 2, 3]);
    if (!options.includes(syllLevel)) options.push(syllLevel);
    options = shuffle(options).slice(0, 4);
    return {
      type: 'poetry-syllable',
      word: word,
      answer: syllLevel,
      options: options,
      hint: 'Clap the word out. How many beats? ' + word
    };
  } else {
    // Complete the couplet
    var rhymeSet = pick(POETRY_DATA.rhymeSets);
    var wordA = rhymeSet[0];
    var wordB = rhymeSet[1];
    var wrongs2 = POETRY_DATA.rhymeSets.filter(function(s) { return s !== rhymeSet; }).slice(0, 3).map(function(s) { return s[0]; });
    return {
      type: 'poetry-couplet',
      line1End: wordA,
      options: shuffle([wordB].concat(wrongs2)),
      answer: wordB,
      hint: 'The second line should rhyme with "' + wordA + '".'
    };
  }
}

// ===================== P4 GENERATORS =====================

function genStory(diff) {
  var prompt = pick(STORY_PROMPTS);
  return {
    type: 'story-write',
    prompt: prompt,
    answer: '__story__',
    hint: 'Let your imagination fly! Write at least 2 sentences.'
  };
}

function genParagraph(diff) {
  var item = pick(PARAGRAPH_PROMPTS);
  return {
    type: 'paragraph-write',
    topic: item.topic,
    starter: item.starter,
    hints: item.hints,
    answer: '__paragraph__',
    hint: 'Use the helper questions to guide your writing!'
  };
}
