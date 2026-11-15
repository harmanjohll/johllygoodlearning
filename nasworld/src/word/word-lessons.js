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
      { text: '<b>Pronouns</b> replace nouns so we don\'t repeat them.<br><i>Lina has a doll. Lina loves the doll.</i> → <i>Lina has a doll. <b>She</b> loves <b>it</b>.</i><br>Common pronouns: <b>I, you, he, she, it, we, they</b>', lumiTip: 'Use a pronoun the second time you mention something.' },
      { text: '<b>Plurals</b> mean more than one.<br>Most words just add <b>-s</b>: cat → cats, book → books.<br>Words ending in <b>-s, -x, -ch, -sh</b> add <b>-es</b>: bus → bus<b>es</b>, fox → fox<b>es</b>.<br>A few are tricky: child → <b>children</b>, mouse → <b>mice</b>, foot → <b>feet</b>.', lumiTip: 'Listen for the hiss sound. If it hisses, use -es!' },
      { text: '<b>Articles:</b> tiny words before a noun.<br><b>a</b> = one, used before a consonant sound: <i>a cat, a banana</i><br><b>an</b> = one, used before a vowel sound: <i>an apple, an egg</i><br><b>the</b> = a specific one: <i>the cat on the mat</i>', lumiTip: 'Hear the first sound, not the first letter. "an hour" sounds like "owur"!' },
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

WORD_LESSONS.punct = {
  title: 'Punctuation',
  icon: '❕',
  lumiSays: 'Punctuation tells the reader how your sentence sounds. It is like the rests, drums and exclaim marks in music!',
  steps: [
    { text: '<b>Full stop</b> <span style="color:var(--gold);font-size:24px">.</span><br>Use it at the END of a normal sentence.<br>Examples: <i>The cat is fluffy. I like ice cream.</i>', lumiTip: 'A full stop is a tiny dot that says "I am done!"' },
    { text: '<b>Question mark</b> <span style="color:var(--gold);font-size:24px">?</span><br>Use it at the end of a question.<br>Examples: <i>Where is my bag? Are you okay?</i>', lumiTip: 'Anytime you can answer with "yes", "no", or info — a question mark belongs.' },
    { text: '<b>Exclamation mark</b> <span style="color:var(--gold);font-size:24px">!</span><br>Use it for surprise, loud voices, or strong feelings.<br>Examples: <i>Watch out! That was amazing!</i>', lumiTip: 'Use sparingly — too many and they lose their pop.' },
    { text: '<b>Comma</b> <span style="color:var(--gold);font-size:24px">,</span><br>Use it for tiny pauses, lists, and after greetings.<br>Lists: <i>I packed apples, pears, plums.</i><br>Pause: <i>After lunch, we went to the park.</i><br>Greeting: <i>Dear Nenek,</i>', lumiTip: 'Read it out loud. Where you pause is usually where the comma goes.' },
    { text: '<b>Apostrophe</b> <span style="color:var(--gold);font-size:24px">\'</span><br>Use it for shortcuts (it\'s = it is) and to show ownership (Lumi\'s sparkle = the sparkle belonging to Lumi).<br>Examples: <i>Don\'t worry. That is Anna\'s book.</i>', lumiTip: 'Shortcuts: do not → don\'t. The little flick stands in for missing letters.' },
    { text: '<b>Quotation marks</b> <span style="color:var(--gold);font-size:24px">""</span><br>Wrap the exact words someone says.<br>Example: Mum smiled. <i>"Time for bed!"</i> she said.', lumiTip: 'Only the words spoken out loud go inside the quotes.' },
    { text: '<b>Scenarios — same words, different punctuation:</b><br><i>You finished your homework</i> — full stop. (calm)<br><i>You finished your homework!</i> — exclamation. (surprised)<br><i>You finished your homework?</i> — question. (asking)<br>Same words, very different feeling!', lumiTip: 'Punctuation gives the sentence its voice.' },
    { text: '<b>Where you write changes which marks you use:</b><br>📝 <b>SMS / chat to friend:</b> short sentences, lots of !!! and ?<br>📩 <b>Letter to Nenek:</b> commas after greeting, full stops, polite tone<br>📖 <b>Story:</b> all the marks — quotation marks for talking parts<br>📋 <b>List:</b> commas between items, full stop at the end', lumiTip: 'Same words, different setting, different punctuation!' },
    { type: 'try', prompt: 'Where is my hat ___', options: ['.', '?', '!'], answer: '?', successMsg: 'It is a question, so a question mark!' },
    { type: 'try', prompt: 'Watch out for that puddle ___', options: ['.', '?', '!'], answer: '!', successMsg: 'Strong feeling = exclamation mark!' },
    { type: 'try', prompt: 'I packed apples ___ pears and plums.', options: [',', '.', '!'], answer: ',', successMsg: 'Commas separate items in a list!' },
    { type: 'try', prompt: 'Which is correct?', options: ['I dont like it.', 'I don\'t like it.', 'I do not\'t like it.'], answer: 'I don\'t like it.', successMsg: 'Shortcuts use an apostrophe where letters are missing.' }
  ]
};

// ============================================================
//  P2 LADDER — lesson steps for the P2 grammar core, joining
//  sentences, the four kinds of reading question, and working out a
//  word from its sentence. Added to the end of the existing lessons so
//  the earlier steps stay as they were.
// ============================================================

function wordTry(prompt, options, answer, rule) {
  return { type: 'try', prompt: prompt, options: options, answer: answer, successMsg: rule, explanation: rule };
}

WORD_LESSONS.gram.steps = WORD_LESSONS.gram.steps.concat([
  { text: '<b>Past tense</b> tells us that something is over.<br>Most verbs add <b>-ed</b>: walk → walk<b>ed</b>, clean → clean<b>ed</b>.<br>Time words such as <i>yesterday</i> and <i>last night</i> are clues.', lumiTip: 'If the action is finished, the verb must show it.' },
  { text: '<b>Spelling the -ed ending</b><br>Ends in e: add d. bake → bake<b>d</b><br>Ends in a consonant and y: change y to i. cry → cr<b>ied</b><br>Short vowel and one consonant: double it. stop → sto<b>pped</b>', lumiTip: 'Look at the last two letters of the verb before you add the ending.' },
  wordTry('Yesterday, Siti ___ her grandmother.', ['visit', 'visited', 'visits'], 'visited', 'Yesterday shows that the action is over, so the verb takes -ed.'),
  { text: '<b>Irregular verbs</b> do not take -ed. They change in their own way.<br>go → <b>went</b>, eat → <b>ate</b>, see → <b>saw</b><br>buy → <b>bought</b>, catch → <b>caught</b>, write → <b>wrote</b>', lumiTip: 'These have to be learnt by heart. Reading a lot helps them to stick.' },
  { text: 'After <b>did</b> and <b>did not</b>, use the plain verb.<br><i>Did you <b>see</b> it?</i> We do not say <i>Did you saw it?</i><br><i>I did not <b>go</b>.</i> We do not say <i>I did not went.</i>', lumiTip: 'Did already shows the past, so the next verb does not need to.' },
  wordTry('Last week, we ___ to the zoo.', ['go', 'goed', 'went'], 'went', 'Go is an irregular verb. Its past tense is went.'),
  { text: '<b>The verb must match the subject.</b><br>One person or thing: the verb takes <b>-s</b>. <i>The cat sit<b>s</b>.</i><br>More than one: no -s. <i>The cats sit.</i><br>Use <b>is</b> and <b>has</b> for one, <b>are</b> and <b>have</b> for more than one. With I, use <b>am</b>.', lumiTip: 'Find who or what the sentence is about before you choose the verb.' },
  wordTry('The boys ___ in the field.', ['is', 'are', 'am'], 'are', 'The boys are more than one, so the verb is are.'),
  { text: '<b>Pronouns change with their job.</b><br>Doing the action: <b>I, he, she, we, they</b><br>Receiving the action: <b>me, him, her, us, them</b><br>Showing belonging: <b>my, his, her, our, their</b><br><i><b>She</b> gave <b>him</b> <b>her</b> pencil.</i>', lumiTip: 'To choose between I and me, try the sentence with only that one word.' },
  { text: '<b>Prepositions</b> tell us where or when.<br>Where: <b>in</b> the box, <b>on</b> the table, <b>under</b> the bed, <b>between</b> two friends<br>When: <b>at</b> ten o\'clock, <b>on</b> Monday, <b>in</b> March', lumiTip: 'At for a clock time, on for a day, in for a month.' },
  { text: '<b>Joining words</b> link ideas.<br><b>and</b> adds: <i>I have a pen and a ruler.</i><br><b>but</b> shows a difference: <i>I am small but I am strong.</i><br><b>because</b> gives the reason: <i>I ate because I was hungry.</i><br><b>so</b> gives the result: <i>I was hungry, so I ate.</i><br><b>or</b> gives a choice: <i>Would you like milk or juice?</i>', lumiTip: 'Because points back to the reason. So points forward to the result.' },
  wordTry('Hakim took an umbrella ___ it was raining.', ['so', 'because', 'but'], 'because', 'The rain is the reason, and because comes before the reason.'),
  { text: '<b>Comparing</b><br>Two things: add <b>-er</b> and use <b>than</b>. <i>A bus is longer than a car.</i><br>Three or more: add <b>-est</b> and use <b>the</b>. <i>The train is the longest.</i><br>Long words use <b>more</b> and <b>most</b>: <i>more careful, the most careful</i><br>Two are special: <b>good, better, best</b> and <b>bad, worse, worst</b>', lumiTip: 'Never use more and -er together.' },
  wordTry('Kai is ___ than his sister.', ['tall', 'taller', 'tallest'], 'taller', 'Two people are being compared, so add -er and use than.'),
  { text: '<b>Question words</b><br><b>Who</b> asks about a person. <b>What</b> asks about a thing.<br><b>Where</b> asks about a place. <b>When</b> asks about a time.<br><b>Why</b> asks for a reason. <b>How</b> asks about the way.<br><b>Which</b> asks you to choose. <b>Whose</b> asks who owns something.', lumiTip: 'Think of the answer you expect. It tells you which question word to use.' },
  { text: '<b>Short forms</b> join two words. The apostrophe stands where letters are left out.<br>I am → <b>I\'m</b>, it is → <b>it\'s</b>, do not → <b>don\'t</b><br>cannot → <b>can\'t</b>, will not → <b>won\'t</b><br>Take care: <b>it\'s</b> means it is, but <b>its</b> shows belonging.', lumiTip: 'Say the two full words. If the sentence still makes sense, the apostrophe belongs.' },
  wordTry('Which is the short form of they are?', ['their', 'they\'re', 'there'], 'they\'re', 'The apostrophe takes the place of the letter a in are.')
]);

WORD_LESSONS.vocab.steps = WORD_LESSONS.vocab.steps.concat([
  { text: '<b>Working out a new word</b><br>You do not need to know every word. The sentence around it gives clues.<br><i>His shoes were <b>soggy</b> after he walked through the puddles.</i><br>Puddles are wet, so soggy must mean very wet.', lumiTip: 'Read to the end of the sentence before you decide.' },
  wordTry('The famished children ate three plates of noodles each. What does famished mean?', ['very hungry', 'very sleepy', 'very neat'], 'very hungry', 'They ate three plates each, which shows that they were very hungry.'),
  { text: '<b>Synonyms</b> are words that mean almost the same.<br>big and <b>large</b>, begin and <b>start</b>, quiet and <b>silent</b><br><b>Antonyms</b> are opposites.<br>full and <b>empty</b>, early and <b>late</b>, polite and <b>rude</b>', lumiTip: 'To test a synonym, swap it into the sentence. The meaning should stay the same.' },
  wordTry('Which word is the opposite of heavy?', ['large', 'light', 'strong'], 'light', 'Heavy and light are opposites.')
]);

WORD_LESSONS.sent.steps = WORD_LESSONS.sent.steps.concat([
  { text: '<b>Putting words in order</b><br>1. Find who the sentence is about.<br>2. Find what that person does.<br>3. Add the rest: what, where, when.<br><i>She</i> + <i>reads</i> + <i>a book</i> + <i>every night</i>.', lumiTip: 'Some sentences have two good orders. Every night she reads a book is right too.' },
  { text: '<b>Joining two sentences</b><br><i>Siti has a cat. Siti has a rabbit.</i><br>Join them with <b>and</b>: <i>Siti has a cat and a rabbit.</i><br>We do not need to say Siti has twice.', lumiTip: 'A joined sentence should be shorter and still say everything.' },
  { text: '<b>Because and so</b><br><i>It was raining. Arjun took an umbrella.</i><br><b>because</b> comes before the reason: <i>Arjun took an umbrella because it was raining.</i><br><b>so</b> comes before the result: <i>It was raining, so Arjun took an umbrella.</i>', lumiTip: 'Ask which part happened first. That part is the reason.' },
  wordTry('Join these with so: The floor was wet. Ravi slipped.', ['Ravi slipped, so the floor was wet.', 'The floor was wet, so Ravi slipped.', 'So the floor was wet Ravi slipped.'], 'The floor was wet, so Ravi slipped.', 'So comes before the result. Slipping is the result of the wet floor.')
]);

WORD_LESSONS.comp.steps = WORD_LESSONS.comp.steps.concat([
  { text: '<b>Four kinds of question</b><br>1. <b>Find it:</b> the answer is written in the passage.<br>2. <b>Order:</b> what happened first, next or last.<br>3. <b>Word meaning:</b> what a word means in that sentence.<br>4. <b>Think about it:</b> the answer is not written, but the clues point to it.', lumiTip: 'Knowing the kind of question tells you where to look.' },
  { text: '<b>Order words</b><br><b>First</b>, <b>next</b>, <b>then</b>, <b>after</b>, <b>before</b> and <b>last of all</b> show the order of events.<br><i>First, Aisha filled the pot. Next, she pressed in the seeds.</i>', lumiTip: 'Put a finger on each order word as you read.' },
  { text: '<b>Reading the clues</b><br><i>Hakim sat very still, with crumbs on his chin.</i><br>The passage does not say that Hakim ate the cake. The crumbs tell us.', lumiTip: 'Ask yourself: how do I know? Point to the words that told you.' },
  wordTry('Mei Ling put on her raincoat and took her umbrella. What was the weather like?', ['It was sunny', 'It was rainy', 'It was windy'], 'It was rainy', 'A raincoat and an umbrella are clues that it was raining.')
]);

// The lessons were first written against shorter skill ids (gram, sent,
// comp, phon, para). The tree uses the long ones, so without this map
// those five lessons were never found and never shown.
var WORD_LESSON_ALIAS = {
  phonics: 'phon',
  grammar: 'gram',
  sentence: 'sent',
  comprehension: 'comp',
  paragraph: 'para'
};

function getWordLesson(skillId) {
  return WORD_LESSONS[skillId] || WORD_LESSONS[WORD_LESSON_ALIAS[skillId]] || null;
}

// Flashcards for sight words (P1 high-frequency words)
function getWordFlashcards(skillId) {
  if (skillId === 'phonics') skillId = 'phon';   // same id mismatch as the lessons
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

  if (skillId === 'punct') {
    return [
      { front: '.', back: 'Full stop — end of a normal sentence.', image: '❕' },
      { front: '?', back: 'Question mark — for asking.',          image: '❓' },
      { front: '!', back: 'Exclamation mark — for strong feelings.', image: '❗' },
      { front: ',', back: 'Comma — tiny pause, list, or after a greeting.', image: '🟡' },
      { front: '\'',back: 'Apostrophe — shortcuts (don\'t) and ownership (Lumi\'s).', image: '➰' },
      { front: '""',back: 'Quotation marks — wrap the words someone says aloud.', image: '🗯️' },
      { front: ':', back: 'Colon — introduces a list or explanation.', image: '🔸' },
      { front: ';', back: 'Semicolon — like a slightly stronger comma.', image: '🟠' }
    ];
  }

  return null;
}
