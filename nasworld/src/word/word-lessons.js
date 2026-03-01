// ============================================================
//  WORD LESSONS — Visual step-by-step lessons for English skills
//  Adapted for P1 learner (age 6-7)
// ============================================================

var WORD_LESSONS = {
  phon: {
    title: 'Phonics — Word Families',
    icon: '🔤',
    lumiSays: 'Let\'s learn how letters make sounds!',
    steps: [
      { visual: '<div class="phon-demo"><span class="phon-letter">c</span><span class="phon-blend">+</span><span class="phon-family">at</span><span class="phon-blend">=</span><span class="phon-word">cat</span> 🐱</div>', text: 'The <b>-at</b> family! Change the first letter to make new words.', lumiTip: 'Word families share the same ending sound!' },
      { visual: '<div class="phon-family-list"><span>c<b>at</b> 🐱</span><span>b<b>at</b> 🏏</span><span>h<b>at</b> 🎩</span><span>m<b>at</b> 🧹</span><span>r<b>at</b> 🐀</span><span>s<b>at</b> 💺</span></div>', text: 'All these words rhyme! They end in <b>-at</b>.', lumiTip: 'Rhyming words sound the same at the end.' },
      { visual: '<div class="phon-family-list"><span>p<b>ig</b> 🐷</span><span>b<b>ig</b> 📏</span><span>d<b>ig</b> ⛏️</span><span>w<b>ig</b> 💇</span></div>', text: 'The <b>-ig</b> family! Same idea, different ending.', lumiTip: 'Learning one family helps you read many words!' },
      { type: 'try', prompt: 'Which word is in the -at family?', options: ['cat', 'cup', 'dog', 'pig'], answer: 'cat', successMsg: 'Cat ends in -at!' },
      { type: 'try', prompt: 'What word do these letters make? h + o + t', options: ['hat', 'hot', 'hit'], answer: 'hot', successMsg: 'h-o-t = hot! 🔥' }
    ]
  },

  sight: {
    title: 'Sight Words',
    icon: '👀',
    lumiSays: 'Sight words are words you see everywhere! Let\'s learn to recognise them fast!',
    steps: [
      { visual: '<div class="sight-demo"><span class="sight-big">the</span></div>', text: '<b>"the"</b> is the most common word in English!<br>Example: <i>the cat sat on the mat</i>', lumiTip: 'You\'ll see "the" in almost every sentence!' },
      { visual: '<div class="sight-demo"><span class="sight-big">is</span></div>', text: '<b>"is"</b> tells us about something.<br>Example: <i>She is happy.</i>', lumiTip: 'Sight words don\'t always follow phonics rules.' },
      { visual: '<div class="sight-word-grid"><span>the</span><span>is</span><span>and</span><span>a</span><span>to</span><span>in</span><span>it</span><span>he</span><span>she</span><span>we</span></div>', text: 'These are <b>Level 1</b> sight words. Learn them by heart!', lumiTip: 'The more you read, the faster you\'ll spot them!' },
      { type: 'try', prompt: 'Which is a sight word?', options: ['the', 'xyz', 'bloop'], answer: 'the', successMsg: '"the" is the most common sight word!' }
    ]
  },

  spell: {
    title: 'Spelling',
    icon: '✏️',
    lumiSays: 'Spelling helps us write words correctly!',
    steps: [
      { visual: '<div class="spell-demo">🐱 = <span class="spell-letter">c</span><span class="spell-letter">a</span><span class="spell-letter">t</span></div>', text: 'Listen to each sound: /k/ /a/ /t/ → <b>cat</b>', lumiTip: 'Say the word slowly. Listen to each sound.' },
      { text: '<b>Spelling tips:</b><br>1. Say the word slowly<br>2. Listen to each sound<br>3. Write the letter for each sound<br>4. Check: does it look right?', lumiTip: 'Practise makes perfect!' },
      { type: 'try', visual: '🐕 = d-o-?', prompt: 'What is the last letter?', options: ['f', 'g', 'p'], answer: 'g', successMsg: 'd-o-g spells dog! 🐕' }
    ]
  },

  gram: {
    title: 'Grammar',
    icon: '📖',
    lumiSays: 'Grammar helps us put words in the right order!',
    steps: [
      { text: '<b>Nouns</b> are naming words.<br>They name people, animals, places, or things.<br><span style="color:var(--sky)">girl</span>, <span style="color:var(--sky)">cat</span>, <span style="color:var(--sky)">school</span>, <span style="color:var(--sky)">ball</span>', lumiTip: 'If you can touch it or see it, it\'s probably a noun!' },
      { text: '<b>Verbs</b> are doing words.<br>They tell us what someone does.<br><span style="color:var(--coral)">run</span>, <span style="color:var(--coral)">eat</span>, <span style="color:var(--coral)">sleep</span>, <span style="color:var(--coral)">play</span>', lumiTip: 'Can you act it out? Then it\'s a verb!' },
      { text: '<b>Adjectives</b> are describing words.<br>They tell us more about nouns.<br><span style="color:var(--mint)">big</span>, <span style="color:var(--mint)">happy</span>, <span style="color:var(--mint)">red</span>, <span style="color:var(--mint)">tall</span>', lumiTip: 'Adjectives answer: what kind? how many? which one?' },
      { type: 'sort', text: 'Sort these words into the right group!', categories: [
        { name: 'Nouns', items: ['cat', 'ball', 'tree'] },
        { name: 'Verbs', items: ['run', 'jump', 'eat'] }
      ]},
      { type: 'try', prompt: 'What type of word is "happy"?', options: ['Noun', 'Verb', 'Adjective'], answer: 'Adjective', successMsg: '"Happy" describes how someone feels!' }
    ]
  },

  vocab: {
    title: 'Vocabulary',
    icon: '📚',
    lumiSays: 'Big words make your writing sparkle!',
    steps: [
      { visual: '<div class="vocab-compare"><div class="vocab-plain">big</div><div class="vocab-arrow">→</div><div class="vocab-fancy">enormous</div></div>', text: 'Instead of <b>big</b>, try <b>enormous</b>! It means very, very big!', lumiTip: 'Strong words make your stories more interesting!' },
      { visual: '<div class="vocab-compare"><div class="vocab-plain">happy</div><div class="vocab-arrow">→</div><div class="vocab-fancy">delighted</div></div>', text: 'Instead of <b>happy</b>, try <b>delighted</b>!', lumiTip: 'Collect big words like treasure!' },
      { visual: '<div class="vocab-compare"><div class="vocab-plain">said</div><div class="vocab-arrow">→</div><div class="vocab-fancy">exclaimed</div></div>', text: 'Instead of <b>said</b>, try <b>exclaimed</b>! It means said with excitement!', lumiTip: 'Using different "said" words makes dialogue better.' },
      { type: 'try', prompt: '"The elephant is very big." Which word could replace "very big"?', options: ['tiny', 'enormous', 'quiet'], answer: 'enormous', successMsg: 'Enormous means really, really big!' }
    ]
  },

  sent: {
    title: 'Sentence Building',
    icon: '🏗️',
    lumiSays: 'Let\'s build sentences step by step!',
    steps: [
      { text: '<b>A sentence needs:</b><br>1. A <span style="color:var(--sky)">capital letter</span> at the start<br>2. A <span style="color:var(--coral)">verb</span> (doing word)<br>3. A <span style="color:var(--gold)">full stop</span> at the end', lumiTip: 'Every sentence is a complete thought!' },
      { visual: '<div class="sent-demo"><span class="sent-cap">T</span>he cat <span class="sent-verb">sat</span> on the mat<span class="sent-end">.</span></div>', text: 'Capital T, doing word "sat", full stop at the end!', lumiTip: 'Read it aloud. Does it sound complete?' },
      { text: '<b>Make it better!</b><br>❌ the cat sat → missing capital and full stop<br>✅ The fluffy cat sat on the soft mat. → much better!', lumiTip: 'Add adjectives to make sentences sparkle!' },
      { type: 'try', prompt: 'Which is a correct sentence?', options: ['the dog runs', 'The dog runs.', 'dog runs.'], answer: 'The dog runs.', successMsg: 'Capital letter + full stop = correct sentence!' }
    ]
  },

  comp: {
    title: 'Reading Comprehension',
    icon: '📰',
    lumiSays: 'Let\'s read and understand stories!',
    steps: [
      { text: '<b>How to read carefully:</b><br>1. Read the story <b>once</b> for fun<br>2. Read it <b>again</b> slowly<br>3. Look for <b>key words</b> in the question<br>4. Find the answer <b>in the text</b>', lumiTip: 'Always read the story at least twice!' },
      { text: '<div style="background:var(--bg-mid);padding:12px;border-radius:12px;margin-bottom:8px;font-style:italic">"Sam has a red ball. He plays with it in the park every day."</div><b>Question:</b> What colour is Sam\'s ball?<br><b>Answer:</b> Red! (It says "red ball" in the story.)', lumiTip: 'The answer is always in the text!' },
      { type: 'try', prompt: '"Lumi is a golden star. She lives in the sky." Where does Lumi live?', options: ['Under the sea', 'In the sky', 'On a mountain'], answer: 'In the sky', successMsg: 'You found it in the text!' }
    ]
  },

  poetry: {
    title: 'Poetry Corner',
    icon: '🎭',
    lumiSays: 'Poems are like songs made of words!',
    steps: [
      { text: '<b>Rhyming words</b> sound the same at the end:<br>cat / hat / mat<br>star / far / car<br>moon / spoon / June', lumiTip: 'Most poems use rhyming words!' },
      { visual: '<div class="poem-demo"><div class="poem-line">Twinkle twinkle little <b>star</b>,</div><div class="poem-line">How I wonder what you <b>are</b>.</div></div>', text: '<b>star</b> and <b>are</b> rhyme! They have the same ending sound.', lumiTip: 'Listen for the rhyme at the end of each line.' },
      { type: 'try', prompt: 'Which word rhymes with "cat"?', options: ['cup', 'hat', 'dog'], answer: 'hat', successMsg: 'Cat and hat both end in -at!' }
    ]
  },

  story: {
    title: 'Story Garden',
    icon: '🌱',
    lumiSays: 'Let\'s grow stories from tiny seeds!',
    steps: [
      { text: '<b>Every story needs:</b><br>📍 <b>Beginning:</b> Who? Where?<br>⚡ <b>Middle:</b> What happened?<br>🌟 <b>End:</b> How was it solved?', lumiTip: 'Think: beginning → middle → end!' },
      { text: '<b>Story starter words:</b><br>"Once upon a time..."<br>"One sunny morning..."<br>"Long ago, in a land far away..."', lumiTip: 'Good beginnings make readers want to read more!' },
      { text: '<b>Start small:</b><br>First, try completing a sentence:<br>"The cat went to the ___."<br>Then try writing 2 sentences.<br>Then a whole paragraph!', lumiTip: 'Writing is like a muscle — it gets stronger with practice!' },
      { type: 'try', prompt: 'What goes at the END of a story?', options: ['Who the characters are', 'How the problem is solved', 'Where it takes place'], answer: 'How the problem is solved', successMsg: 'The ending wraps up the story!' }
    ]
  },

  para: {
    title: 'Paragraph Writing',
    icon: '📝',
    lumiSays: 'A paragraph is a group of sentences about one thing!',
    steps: [
      { text: '<b>A paragraph has:</b><br>1. <span style="color:var(--gold)">Topic sentence</span> — what it\'s about<br>2. <span style="color:var(--sky)">Detail sentences</span> — more information<br>3. <span style="color:var(--mint)">Closing sentence</span> — wraps it up', lumiTip: 'Think of a paragraph like a sandwich!' },
      { text: '<b>Example:</b><br><span style="color:var(--gold)">I love going to the beach.</span> <span style="color:var(--sky)">The sand is warm and soft. I like to build sandcastles. The waves are fun to splash in.</span> <span style="color:var(--mint)">The beach is my favourite place!</span>', lumiTip: 'The first and last sentences are special!' },
      { type: 'try', prompt: 'Which is a good topic sentence about pets?', options: ['Dogs bark.', 'I love my pet hamster.', 'The end.'], answer: 'I love my pet hamster.', successMsg: 'It tells us what the paragraph will be about!' }
    ]
  }
};

function getWordLesson(skillId) {
  return WORD_LESSONS[skillId] || null;
}

// Flashcards for sight words (P1 high-frequency words)
function getWordFlashcards(skillId) {
  if (skillId === 'sight') {
    return [
      { front: 'the', back: 'Used before a noun', example: 'The cat is sleeping.', image: '👀' },
      { front: 'is', back: 'Tells about something', example: 'She is happy.', image: '👀' },
      { front: 'and', back: 'Joins two things', example: 'Mum and Dad', image: '👀' },
      { front: 'a', back: 'Means one of something', example: 'I see a bird.', image: '👀' },
      { front: 'to', back: 'Shows direction', example: 'Go to school.', image: '👀' },
      { front: 'in', back: 'Means inside', example: 'The toy is in the box.', image: '👀' },
      { front: 'it', back: 'Replaces a thing', example: 'I like it.', image: '👀' },
      { front: 'he', back: 'A boy or man', example: 'He is tall.', image: '👀' },
      { front: 'she', back: 'A girl or woman', example: 'She can sing.', image: '👀' },
      { front: 'we', back: 'Me and you', example: 'We are friends.', image: '👀' },
      { front: 'can', back: 'Means able to', example: 'I can swim.', image: '👀' },
      { front: 'said', back: 'Past of say', example: '"Hello!" said Tom.', image: '👀' },
      { front: 'you', back: 'The person I\'m talking to', example: 'How are you?', image: '👀' },
      { front: 'was', back: 'Past of is', example: 'It was raining.', image: '👀' },
      { front: 'they', back: 'More than one person', example: 'They are playing.', image: '👀' },
      { front: 'my', back: 'Belongs to me', example: 'This is my book.', image: '👀' },
      { front: 'are', back: 'For more than one', example: 'We are here.', image: '👀' },
      { front: 'has', back: 'Means owns or holds', example: 'He has a toy.', image: '👀' },
      { front: 'his', back: 'Belongs to him', example: 'That is his bag.', image: '👀' },
      { front: 'her', back: 'Belongs to her', example: 'I like her dress.', image: '👀' }
    ];
  }

  if (skillId === 'vocab') {
    return [
      { front: 'enormous', back: 'Very, very big', example: 'The elephant is enormous!', image: '📚' },
      { front: 'delighted', back: 'Very happy', example: 'She was delighted to see her friend.', image: '📚' },
      { front: 'peculiar', back: 'Strange or unusual', example: 'The bird had a peculiar cry.', image: '📚' },
      { front: 'exclaimed', back: 'Said with excitement', example: '"Wow!" exclaimed Lumi.', image: '📚' },
      { front: 'magnificent', back: 'Wonderful and impressive', example: 'The palace was magnificent.', image: '📚' },
      { front: 'furious', back: 'Very angry', example: 'The dragon was furious.', image: '📚' },
      { front: 'exhausted', back: 'Very tired', example: 'After running, she was exhausted.', image: '📚' },
      { front: 'glistened', back: 'Sparkled in the light', example: 'The snow glistened in the sun.', image: '📚' },
      { front: 'whispered', back: 'Said very quietly', example: '"Shh," whispered the girl.', image: '📚' },
      { front: 'trembled', back: 'Shook with fear', example: 'The mouse trembled with fear.', image: '📚' }
    ];
  }

  if (skillId === 'phon') {
    return [
      { front: 'c + at = ?', back: 'cat 🐱', image: '🔤' },
      { front: 'b + at = ?', back: 'bat 🏏', image: '🔤' },
      { front: 'h + at = ?', back: 'hat 🎩', image: '🔤' },
      { front: 'p + ig = ?', back: 'pig 🐷', image: '🔤' },
      { front: 'd + og = ?', back: 'dog 🐕', image: '🔤' },
      { front: 'h + ot = ?', back: 'hot 🔥', image: '🔤' },
      { front: 'b + us = ?', back: 'bus 🚌', image: '🔤' },
      { front: 'c + up = ?', back: 'cup ☕', image: '🔤' },
      { front: 's + un = ?', back: 'sun ☀️', image: '🔤' },
      { front: 'r + ed = ?', back: 'red 🔴', image: '🔤' }
    ];
  }

  return null;
}
