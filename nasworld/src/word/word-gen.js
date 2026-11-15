// ============================================================
//  WORD GENERATORS — Question generators for all 11 word skills
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
    case 'punct':         return genPunct(diff);
    default:              return genPhonics(diff);
  }
}

// ===================== PUNCTUATION =====================

var PUNCT_BANK = [
  { sentence: 'Where is my school bag __',           mark: '?', kind: 'question' },
  { sentence: 'Watch out for that puddle __',        mark: '!', kind: 'exclaim' },
  { sentence: 'I love going to the beach __',        mark: '.', kind: 'full-stop' },
  { sentence: 'Are you ready to go __',              mark: '?', kind: 'question' },
  { sentence: 'That cake smells amazing __',         mark: '!', kind: 'exclaim' },
  { sentence: 'The cat is sleeping on the mat __',   mark: '.', kind: 'full-stop' },
  { sentence: 'Can I have a glass of water __',      mark: '?', kind: 'question' },
  { sentence: 'Yikes, a spider __',                  mark: '!', kind: 'exclaim' },
  { sentence: 'I packed apples __ pears and plums.', mark: ',', kind: 'comma-list' },
  { sentence: 'After lunch __ we walked to the park.',mark: ',', kind: 'comma-pause' },
  { sentence: 'Dear Nenek __',                       mark: ',', kind: 'comma-greet' },
  { sentence: 'My favourite colours are red __ blue and gold.', mark: ',', kind: 'comma-list' }
];

var PUNCT_PURPOSE = [
  { mark: '.',  purpose: 'end a normal sentence' },
  { mark: '?',  purpose: 'end a question' },
  { mark: '!',  purpose: 'show a strong feeling' },
  { mark: ',',  purpose: 'pause or separate things in a list' },
  { mark: '\'', purpose: 'show a shortcut or who owns something' },
  { mark: '""', purpose: 'show the exact words someone says' }
];

var PUNCT_SCENARIO = [
  { setting: 'A surprised shout to your friend',          best: '!' },
  { setting: 'Asking Mum where your shoes are',           best: '?' },
  { setting: 'Listing the fruits in your lunchbox',       best: ',' },
  { setting: 'A friendly letter to Nenek',                best: ',' },
  { setting: 'Writing "I am" in a shorter way',           best: '\'' },
  { setting: 'Writing what your teacher said in a story', best: '""' }
];

function genPunct(diff) {
  var roll = Math.random();

  if (roll < 0.45) {
    var item = pick(PUNCT_BANK);
    var allMarks = ['.', '?', '!', ','];
    var opts = shuffle(allMarks.filter(function(m) { return m !== item.mark; })).slice(0, 3);
    return {
      type: 'punct-pick',
      sentence: item.sentence,
      options: shuffle([item.mark].concat(opts)),
      answer: item.mark,
      hint: 'Read it aloud and listen — is it asking, exclaiming, listing, or just telling?'
    };
  }

  if (roll < 0.75) {
    var p = pick(PUNCT_PURPOSE);
    var allM = PUNCT_PURPOSE.map(function(x) { return x.mark; });
    var wrongs = shuffle(allM.filter(function(m) { return m !== p.mark; })).slice(0, 3);
    return {
      type: 'punct-purpose',
      prompt: 'Which mark would you use to <b>' + p.purpose + '</b>?',
      options: shuffle([p.mark].concat(wrongs)),
      answer: p.mark,
      hint: 'Think about the job each mark does.'
    };
  }

  var s = pick(PUNCT_SCENARIO);
  var allMS = ['.', '?', '!', ',', '\'', '""'];
  var ws = shuffle(allMS.filter(function(m) { return m !== s.best; })).slice(0, 3);
  return {
    type: 'punct-scenario',
    setting: s.setting,
    options: shuffle([s.best].concat(ws)),
    answer: s.best,
    hint: 'Where you write changes what marks fit.'
  };
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
//
//  The P2 layer is a ladder, not a lucky dip. Every item carries a
//  level from 1 to 5 and the generator reads the skill's difficulty
//  (0 to 4) to decide which rung to draw from: mostly the rung she is
//  on, with about a quarter from the rung below so that what she has
//  just learnt keeps coming back.

// Items seen lately, per bank, so that a session does not repeat itself
// and she cannot get by on remembering last time's answers. Kept in
// memory only; nothing here is saved.
var _wordRecent = {};

/** The item level (1 to 5) for a skill difficulty (0 to 4). */
function wordTargetLevel(diff) {
  var lvl = (diff && typeof diff.level === 'number') ? diff.level : 0;
  return Math.max(1, Math.min(5, lvl + 1));
}

/** Items on the rung for this difficulty, falling back to the nearest
 *  rung that has any, so a thin bank can never return nothing. */
function wordTierPool(items, diff, stayChance) {
  var target = wordTargetLevel(diff);
  var want = target;
  if (target > 1 && Math.random() >= (stayChance === undefined ? 0.75 : stayChance)) want = target - 1;
  for (var step = 0; step < 5; step++) {
    var levels = step === 0 ? [want] : [want - step, want + step];
    for (var i = 0; i < levels.length; i++) {
      var L = levels[i];
      var pool = items.filter(function(it) { return (it.level || 1) === L; });
      if (pool.length) return pool;
    }
  }
  return items;
}

/** Each rung of each bank remembers what it has already served. */
function wordSeenList(pool, bank) {
  var key = bank + ':' + ((pool[0] && pool[0].level) || 1);
  return _wordRecent[key] || (_wordRecent[key] = []);
}

// What has been asked in the session now being built. startGame() makes
// a new currentGame object for every session, which is how one session
// is told from the next without the engine having to say so.
var _wordSession = { game: null, keys: {}, count: 0 };

function wordSession() {
  var game = null;
  try { game = currentGame; } catch (e) { game = null; }
  if (game !== _wordSession.game || _wordSession.count > 60) {
    _wordSession = { game: game, keys: {}, count: 0 };
  }
  return _wordSession;
}

/** Items on this rung that have not been asked in this session. */
function wordUnaskedThisSession(pool, bank, keyOf) {
  var asked = wordSession().keys;
  return pool.filter(function(it) { return !asked[bank + '|' + keyOf(it)]; });
}

/** Pick without repeating. Every item on a rung is served once before
 *  any comes round again, and when a rung does start again it still
 *  will not repeat something from the session in hand. */
function wordPickFresh(pool, bank, keyOf) {
  var seen = wordSeenList(pool, bank);
  var session = wordSession();
  var unasked = wordUnaskedThisSession(pool, bank, keyOf);
  var fresh = unasked.filter(function(it) { return seen.indexOf(keyOf(it)) < 0; });
  if (!fresh.length) {           // the whole rung has been seen: start it again
    seen.length = 0;
    fresh = unasked.length ? unasked : pool;
  }
  var item = pick(fresh);
  seen.push(keyOf(item));
  session.keys[bank + '|' + keyOf(item)] = true;
  session.count++;
  return item;
}

function genGrammar(diff) {
  var pool = wordTierPool(GRAMMAR_ITEMS, diff);
  var ex = wordPickFresh(pool, 'grammar', function(it) { return it.type + '|' + it.sentence; });

  return {
    type: 'grammar-mcq',
    instruction: ex.instruction,
    sentence: ex.sentence,
    options: shuffle(ex.options),
    answer: ex.answer,
    grammarType: ex.type,
    subKey: ex.type,
    level: ex.level,
    why: ex.why,
    hint: GRAMMAR_HINTS[ex.type] || 'Say each choice aloud in the sentence.'
  };
}

function wordCapital(str) {
  return String(str).charAt(0).toUpperCase() + String(str).slice(1);
}

function genVocab(diff) {
  var roll = Math.random();

  // About one question in four is a synonym or an antonym.
  if (roll < 0.25) {
    var rel = wordPickFresh(wordTierPool(VOCAB_RELATE, diff), 'vocab-relate', function(it) { return it.kind + '|' + it.word; });
    return {
      type: 'vocab-relate',
      kind: rel.kind,
      word: rel.word,
      sentence: rel.sentence,
      options: shuffle(rel.options),
      answer: rel.answer,
      subKey: rel.kind,
      level: rel.level,
      why: rel.kind === 'antonym'
        ? wordCapital(rel.word) + ' and ' + rel.answer + ' are opposites.'
        : wordCapital(rel.word) + ' and ' + rel.answer + ' mean almost the same.',
      hint: rel.kind === 'antonym'
        ? 'An opposite turns the meaning of the sentence round.'
        : 'Try each choice in place of the word. Which one keeps the meaning?'
    };
  }

  var item = wordPickFresh(wordTierPool(VOCAB_ITEMS, diff), 'vocab', function(it) { return it.word; });
  var why = wordCapital(item.word) + ' means ' + item.meaning + '.';

  if (roll >= 0.6) {
    // Meaning to word. The wrong words come from other meaning groups
    // and from nearby rungs, so none of them can also be right.
    var near = VOCAB_ITEMS.filter(function(v) {
      return v.cat !== item.cat && Math.abs(v.level - item.level) <= 1;
    });
    var wrongs = [], cats = {};
    shuffle(near).forEach(function(v) {
      if (wrongs.length < 3 && !cats[v.cat]) { cats[v.cat] = true; wrongs.push(v.word); }
    });
    if (wrongs.length === 3) {
      return {
        type: 'vocab-word',
        meaning: item.meaning,
        options: shuffle([item.word].concat(wrongs)),
        answer: item.word,
        subKey: 'meaning',
        level: item.level,
        why: why,
        hint: 'Say each word in a sentence of your own. Which one fits the meaning?'
      };
    }
  }

  return {
    type: 'vocab-meaning',
    word: item.word,
    sentence: item.sentence,
    options: shuffle(item.options),
    answer: item.meaning,
    subKey: 'meaning',
    level: item.level,
    why: why,
    hint: 'Read the whole sentence. The other words are clues to what "' + item.word + '" means.'
  };
}

/** Lower case, no punctuation, single spaces: how two sentences are compared. */
function wordNormaliseSentence(str) {
  return String(str).toLowerCase().replace(/[.,?]/g, ' ').replace(/\s+/g, ' ').trim();
}

/** True if what she built is any one of the accepted orders. */
function wordSentenceMatches(built, accepted) {
  var b = wordNormaliseSentence(built);
  return (accepted || []).some(function(a) { return wordNormaliseSentence(a) === b; });
}

function genSentence(diff) {
  // Joining starts on the second rung; the first is rearranging only.
  // If she has just been through every pair on this rung, rearrange
  // instead of asking the same pair again.
  var joinKey = function(it) { return it.answer; };
  var joinPool = wordTargetLevel(diff) >= 2 ? wordTierPool(JOIN_ITEMS, diff) : [];
  if (joinPool.length && Math.random() < 0.4 && wordUnaskedThisSession(joinPool, 'join', joinKey).length > 0) {
    var j = wordPickFresh(joinPool, 'join', joinKey);
    return {
      type: 'sentence-join',
      first: j.a,
      second: j.b,
      conj: j.conj,
      options: shuffle(j.options),
      answer: j.answer,
      subKey: 'join-' + j.conj,
      level: j.level,
      why: j.why,
      hint: 'Read each choice aloud. It must sound right and still say what the two sentences say.'
    };
  }

  var s = wordPickFresh(wordTierPool(SENTENCE_ITEMS, diff), 'sentence', function(it) { return it.answer; });
  var scrambled = shuffle(s.tiles);
  var safety = 0;
  while (scrambled.join(' ') === s.tiles.join(' ') && safety < 10) {
    scrambled = shuffle(s.tiles);
    safety++;
  }

  return {
    type: 'sentence-build',
    words: scrambled,
    answer: s.answer,
    accept: [s.answer].concat(s.also),
    correctOrder: s.tiles,
    subKey: 'rearrange',
    level: s.level,
    hint: 'Find who the sentence is about, then what that person does. The word with a capital letter usually comes first.'
  };
}

// ===================== READING COMPREHENSION =====================
//
//  A session asks for its questions one at a time and knows nothing
//  about passages, so the generator keeps a small queue: it picks a
//  passage, hands out that passage's questions in order, and only then
//  moves to another. An eight question session is therefore two or
//  three passages read properly, not eight passages glanced at.

var COMPREHENSION_HINTS = {
  literal:   'The answer is written in the passage. Find the sentence that tells you.',
  sequence:  'Look for order words such as first, next, then, after and before.',
  vocab:     'Read the sentence with the word again. Try each choice in its place.',
  inference: 'The passage does not say it straight out. Put the clues together.'
};

var _compQueue = [];
var _compSession = null;

/** Every passage, with the twelve short ones counted as level 1. */
function wordAllPassages() {
  return COMPREHENSION_PASSAGES.map(function(p) {
    return { level: p.level || 1, title: p.title, text: p.text, questions: p.questions };
  }).concat(READING_PASSAGES);
}

function genComprehension(diff) {
  // A new session starts on a new passage rather than part-way through
  // the one the last session stopped on.
  var session = wordSession();
  if (session !== _compSession) {
    _compSession = session;
    _compQueue = [];
  }

  if (!_compQueue.length) {
    var passage = wordPickFresh(wordTierPool(wordAllPassages(), diff), 'passage', function(p) { return p.title; });
    var total = passage.questions.length;
    _compQueue = passage.questions.map(function(q, i) {
      var kind = q.kind || 'literal';
      return {
        type: 'comprehension-mcq',
        title: passage.title,
        text: passage.text,
        question: q.question,
        options: shuffle(q.options),
        answer: q.answer,
        kind: kind,
        subKey: kind,
        level: passage.level,
        partIndex: i + 1,
        partTotal: total,
        why: q.why || '',
        hint: COMPREHENSION_HINTS[kind] || COMPREHENSION_HINTS.literal
      };
    });
  }
  return _compQueue.shift();
}

// ===================== P3 GENERATORS =====================

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
