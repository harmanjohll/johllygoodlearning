// ============================================================
//  WORD DATA — CVC, sight words, vocab, passages, grammar, poetry
// ============================================================

// ------------------------------------
//  1. CVC Word Families
// ------------------------------------
const CVC_FAMILIES = {
  'at': ['cat','bat','hat','mat','rat','sat','fat','pat'],
  'an': ['can','fan','man','pan','ran','van','tan','ban'],
  'ig': ['big','dig','fig','jig','pig','wig'],
  'it': ['bit','fit','hit','kit','sit','wit','lit','pit'],
  'op': ['cop','hop','mop','pop','top','bop'],
  'ot': ['cot','dot','got','hot','lot','not','pot'],
  'ug': ['bug','dug','hug','jug','mug','rug','tug'],
  'en': ['den','hen','men','pen','ten'],
  'et': ['bet','get','jet','let','met','net','pet','set','wet'],
  'in': ['bin','din','fin','pin','tin','win'],
  'ed': ['bed','fed','led','red'],
  'un': ['bun','fun','gun','nun','run','sun'],
  'up': ['cup','pup','sup']
};

// ------------------------------------
//  2. Sight Words (progressive P1 Singapore levels)
// ------------------------------------
const SIGHT_WORDS_BY_LEVEL = [
  ['the','a','I','is','it','in','to','and','we','my','go','no','up','at','on','he','she','do'],
  ['can','has','am','are','you','all','was','his','her','but','not','an','had','one','two','or'],
  ['they','with','this','have','from','what','were','when','there','how','many','some','like','come','make'],
  ['would','find','way','did','get','made','may','part','over','into','time','look','now','long'],
  ['about','because','before','after','then','first','next','last','every','never','always','around','found','should']
];

// ------------------------------------
//  3. Sentence Patterns
// ------------------------------------
const SENTENCE_PATTERNS = [
  { pattern: ['The','_noun','is','_adj','.'], level: 0 },
  { pattern: ['I','can','_verb','the','_noun','.'], level: 0 },
  { pattern: ['The','_adj','_noun','_verb','s','.'], level: 1 },
  { pattern: ['My','_noun','is','very','_adj','.'], level: 1 },
  { pattern: ['The','_noun','and','the','_noun','are','_adj','.'], level: 2 },
  { pattern: ['_name','_verb','s','to','the','_place','.'], level: 2 },
  { pattern: ['I','like','to','_verb','because','it','is','_adj','.'], level: 3 }
];

// ------------------------------------
//  4. Word Banks
// ------------------------------------
const WORD_BANKS = {
  nouns: ['cat','dog','fish','bird','tree','sun','moon','star','book','ball','cake','house','car','boat','hat','box','frog','duck'],
  adjectives: ['big','small','red','blue','happy','tall','soft','fast','new','old','hot','cold','kind','brave','funny','bright'],
  verbs: ['run','jump','swim','fly','eat','read','sing','play','walk','dance','draw','help','look','sit','clap','hop'],
  names: ['Ana','Ben','Lin','Sam','Mei','Tom','Zara','Kai'],
  places: ['park','school','shop','beach','garden','zoo','lake','hill']
};

// ------------------------------------
//  5. Story Prompts (8 original + 4 Singapore-flavoured)
// ------------------------------------
const STORY_PROMPTS = [
  'One sunny morning, a little cat found a golden key...',
  'In a garden full of talking flowers, there lived...',
  'The stars in the sky began to dance because...',
  'A tiny dragon was afraid of fire, so it...',
  'On the deepest part of the ocean floor, a fish discovered...',
  'When the moon turned purple, everyone knew that...',
  'A pencil that could draw real things was found by...',
  'The smallest ant in the colony had the biggest dream...',
  'At the hawker centre, a magic bowl of laksa began to...',
  'A friendly merlion came to life one night and...',
  'Inside the Botanic Gardens, a talking orchid whispered...',
  'On the MRT train, a tiny fairy was spotted by...'
];

// ------------------------------------
//  6. Vocabulary Items (10 original + 12 new)
// ------------------------------------
const VOCAB_ITEMS = [
  { word: 'enormous', meaning: 'very very big', sentence: 'The elephant was enormous.', options: ['very big','very small','very fast','very quiet'] },
  { word: 'tiny', meaning: 'very very small', sentence: 'The ant was tiny.', options: ['very small','very tall','very loud','very slow'] },
  { word: 'furious', meaning: 'very very angry', sentence: 'The king was furious when the crown went missing.', options: ['very angry','very happy','very tired','very hungry'] },
  { word: 'delighted', meaning: 'very very happy', sentence: 'She was delighted to see her best friend.', options: ['very happy','very sad','very scared','very sleepy'] },
  { word: 'ancient', meaning: 'very very old', sentence: 'The castle was ancient and full of cobwebs.', options: ['very old','very new','very clean','very bright'] },
  { word: 'swift', meaning: 'very very fast', sentence: 'The deer was swift and ran across the field.', options: ['very fast','very slow','very heavy','very small'] },
  { word: 'curious', meaning: 'wanting to know more', sentence: 'The curious cat peeked inside the box.', options: ['wanting to know more','feeling tired','feeling angry','wanting to sleep'] },
  { word: 'brave', meaning: 'not afraid', sentence: 'The brave girl saved the puppy from the river.', options: ['not afraid','very small','very quiet','not happy'] },
  { word: 'gorgeous', meaning: 'very very beautiful', sentence: 'The sunset was gorgeous.', options: ['very beautiful','very ugly','very dark','very cold'] },
  { word: 'exhausted', meaning: 'very very tired', sentence: 'After the long race, he was exhausted.', options: ['very tired','very strong','very excited','very hungry'] },
  { word: 'resilient', meaning: 'able to recover quickly from difficulty', sentence: 'The resilient plant grew back after the storm.', options: ['able to recover quickly','very fragile','very colourful','very tiny'] },
  { word: 'vibrant', meaning: 'full of life and colour', sentence: 'The market was vibrant with bright lights and music.', options: ['full of life and colour','very dull','very quiet','very empty'] },
  { word: 'tranquil', meaning: 'calm and peaceful', sentence: 'The lake was tranquil in the early morning.', options: ['calm and peaceful','very noisy','very dangerous','very dirty'] },
  { word: 'diligent', meaning: 'hardworking and careful', sentence: 'The diligent student finished all her homework on time.', options: ['hardworking and careful','very lazy','very forgetful','very naughty'] },
  { word: 'graceful', meaning: 'moving in a smooth and beautiful way', sentence: 'The ballet dancer was graceful on stage.', options: ['moving beautifully','very clumsy','very stiff','very loud'] },
  { word: 'fragile', meaning: 'easy to break', sentence: 'Be careful with the fragile glass vase.', options: ['easy to break','very strong','very heavy','very large'] },
  { word: 'generous', meaning: 'willing to give and share', sentence: 'The generous boy shared his lunch with his friend.', options: ['willing to share','very greedy','very shy','very mean'] },
  { word: 'brilliant', meaning: 'very clever or very bright', sentence: 'She had a brilliant idea for the school project.', options: ['very clever','very silly','very boring','very quiet'] },
  { word: 'timid', meaning: 'shy and easily frightened', sentence: 'The timid rabbit hid behind the bush.', options: ['shy and easily frightened','very brave','very loud','very naughty'] },
  { word: 'soggy', meaning: 'very wet and soft', sentence: 'His shoes were soggy after walking in the rain.', options: ['very wet and soft','very dry','very hard','very clean'] },
  { word: 'gleaming', meaning: 'shining brightly', sentence: 'The gleaming trophy sat on the shelf.', options: ['shining brightly','very dull','very rough','very old'] },
  { word: 'peculiar', meaning: 'strange or unusual', sentence: 'There was a peculiar sound coming from the attic.', options: ['strange or unusual','very normal','very loud','very soft'] }
];

// ------------------------------------
//  7. Comprehension Passages (12 passages)
// ------------------------------------
const COMPREHENSION_PASSAGES = [
  {
    title: 'The Lost Kitten',
    text: 'Mei found a tiny kitten under the bench at the park. It was grey and wet from the rain. She gently picked it up and brought it home. Her mother helped her dry the kitten with a soft towel.',
    questions: [
      { question: 'Where did Mei find the kitten?', options: ['Under a bench at the park','In her house','At the school','In a shop'], answer: 'Under a bench at the park' },
      { question: 'What colour was the kitten?', options: ['Grey','White','Black','Brown'], answer: 'Grey' },
      { question: 'How do you think Mei felt when she found the kitten?', options: ['Caring and kind','Angry and upset','Bored','Scared'], answer: 'Caring and kind' }
    ]
  },
  {
    title: 'The Big Race',
    text: 'Sam and Ben had a race in the school field. Sam ran as fast as he could but tripped on a stone. Ben stopped running and helped Sam get up. They walked to the finish line together.',
    questions: [
      { question: 'Where did Sam and Ben have their race?', options: ['In the school field','At the park','At the beach','In the garden'], answer: 'In the school field' },
      { question: 'What happened to Sam during the race?', options: ['He tripped on a stone','He won the race','He fell into a puddle','He ran the wrong way'], answer: 'He tripped on a stone' },
      { question: 'What does this story tell us about Ben?', options: ['He is a kind friend','He is very fast','He does not like racing','He is afraid of stones'], answer: 'He is a kind friend' }
    ]
  },
  {
    title: 'A Visit to the Zoo',
    text: 'Lin went to the Singapore Zoo with her family on Saturday. She saw tall giraffes eating leaves from the trees. Her favourite animal was the baby elephant because it sprayed water with its trunk. Lin wished she could visit the zoo every week.',
    questions: [
      { question: 'When did Lin go to the zoo?', options: ['On Saturday','On Sunday','On Monday','On Friday'], answer: 'On Saturday' },
      { question: 'What were the giraffes doing?', options: ['Eating leaves from the trees','Drinking water','Sleeping on the grass','Running around'], answer: 'Eating leaves from the trees' },
      { question: 'Why was the baby elephant Lin\u2019s favourite?', options: ['It sprayed water with its trunk','It was very tall','It could fly','It was sleeping'], answer: 'It sprayed water with its trunk' }
    ]
  },
  {
    title: 'The Magic Paintbrush',
    text: 'Tom found a paintbrush in the garden. When he painted a bird, it came to life and flew away! He painted a plate of cookies next. The cookies became real and he shared them with his sister.',
    questions: [
      { question: 'Where did Tom find the paintbrush?', options: ['In the garden','In his room','At school','In a shop'], answer: 'In the garden' },
      { question: 'What happened when Tom painted a bird?', options: ['It came to life and flew away','It stayed on the paper','It turned into a fish','It disappeared'], answer: 'It came to life and flew away' },
      { question: 'What kind of person is Tom?', options: ['He likes to share','He is selfish','He is lazy','He is always angry'], answer: 'He likes to share' }
    ]
  },
  {
    title: 'Rainy Day Fun',
    text: 'It rained all day so Ana could not go outside to play. She decided to build a fort with pillows and blankets in the living room. Her brother Kai helped her. They pretended they were explorers in a cave.',
    questions: [
      { question: 'Why could Ana not go outside?', options: ['It was raining all day','She was sick','Her mother said no','It was too hot'], answer: 'It was raining all day' },
      { question: 'What did Ana build?', options: ['A fort with pillows and blankets','A sandcastle','A paper boat','A puzzle'], answer: 'A fort with pillows and blankets' },
      { question: 'What did Ana and Kai pretend to be?', options: ['Explorers in a cave','Pirates on a ship','Teachers at school','Chefs in a kitchen'], answer: 'Explorers in a cave' }
    ]
  },
  {
    title: 'The Helpful Ant',
    text: 'A little ant saw a butterfly stuck in a spider web. The ant was very small but it was also very brave. It climbed up and bit through the web thread by thread. The butterfly was free at last and thanked the ant.',
    questions: [
      { question: 'What was stuck in the spider web?', options: ['A butterfly','A bee','A ladybird','A dragonfly'], answer: 'A butterfly' },
      { question: 'How did the ant free the butterfly?', options: ['It bit through the web thread by thread','It called for help','It pushed the butterfly out','It cut the web with a leaf'], answer: 'It bit through the web thread by thread' },
      { question: 'What lesson does this story teach?', options: ['Even small creatures can do big things','Spiders are mean','Ants are stronger than butterflies','Never go near spider webs'], answer: 'Even small creatures can do big things' }
    ]
  },
  {
    title: 'Baking Day',
    text: 'Zara and her grandmother baked a cake together. They mixed flour, eggs, sugar, and butter in a big bowl. Zara stirred the batter while her grandmother turned on the oven. The cake smelled wonderful when it was done.',
    questions: [
      { question: 'Who did Zara bake with?', options: ['Her grandmother','Her mother','Her sister','Her father'], answer: 'Her grandmother' },
      { question: 'What did Zara do while her grandmother turned on the oven?', options: ['She stirred the batter','She ate the batter','She washed the dishes','She set the table'], answer: 'She stirred the batter' },
      { question: 'How do you think the kitchen felt during baking?', options: ['Warm and cheerful','Cold and dark','Empty and quiet','Messy and sad'], answer: 'Warm and cheerful' }
    ]
  },
  {
    title: 'The Garden Surprise',
    text: 'Every morning, Kai watered the seeds he had planted in a small pot. For many days, nothing happened. Then one morning, he saw a tiny green shoot poking out of the soil. Kai was so happy he ran to tell his mother.',
    questions: [
      { question: 'What did Kai do every morning?', options: ['He watered his seeds','He went for a run','He fed the birds','He read a book'], answer: 'He watered his seeds' },
      { question: 'What appeared from the soil?', options: ['A tiny green shoot','A flower','A worm','A stone'], answer: 'A tiny green shoot' },
      { question: 'Why was Kai happy?', options: ['His seeds finally started to grow','He found money','His friend visited','He got a new toy'], answer: 'His seeds finally started to grow' }
    ]
  },
  {
    title: 'Feeding the Fish',
    text: 'Ana has three goldfish in a glass tank. She feeds them every morning before school. The fish swim to the top when they see her because they know it is feeding time. Ana named them Sunny, Goldie, and Splash.',
    questions: [
      { question: 'How many goldfish does Ana have?', options: ['Three','Two','Four','Five'], answer: 'Three' },
      { question: 'When does Ana feed her fish?', options: ['Every morning before school','Every night before bed','Only on weekends','After lunch'], answer: 'Every morning before school' },
      { question: 'Why do the fish swim to the top when they see Ana?', options: ['They know it is feeding time','They are scared','They want to jump out','They are playing'], answer: 'They know it is feeding time' }
    ]
  },
  {
    title: 'The School Library',
    text: 'Every Wednesday, the class visits the school library. Mei always picks a book about animals. Last week she read about dolphins and learned they are very smart. She told her friends all about it during recess.',
    questions: [
      { question: 'When does the class visit the library?', options: ['Every Wednesday','Every Monday','Every Friday','Every day'], answer: 'Every Wednesday' },
      { question: 'What kind of books does Mei like?', options: ['Books about animals','Books about space','Books about food','Books about cars'], answer: 'Books about animals' },
      { question: 'When did Mei tell her friends about dolphins?', options: ['During recess','During class','After school','At the library'], answer: 'During recess' }
    ]
  },
  {
    title: 'A Trip to the Hawker Centre',
    text: 'Sam went to the hawker centre with his father for dinner. There were so many stalls selling different food. Sam chose chicken rice because it is his favourite. His father had a bowl of hot fish soup.',
    questions: [
      { question: 'Who did Sam go to the hawker centre with?', options: ['His father','His mother','His sister','His friend'], answer: 'His father' },
      { question: 'What did Sam choose to eat?', options: ['Chicken rice','Fish soup','Noodles','Satay'], answer: 'Chicken rice' },
      { question: 'Why do you think there were many stalls?', options: ['A hawker centre has many food sellers','It was a supermarket','There was a party','It was a school canteen'], answer: 'A hawker centre has many food sellers' }
    ]
  },
  {
    title: 'The New Student',
    text: 'A new girl joined the class today. Her name was Priya and she looked a little shy. Lin walked up to her and said hello. By the end of the day, Priya had made three new friends.',
    questions: [
      { question: 'What was the new student\u2019s name?', options: ['Priya','Mei','Zara','Ana'], answer: 'Priya' },
      { question: 'How did Priya feel at first?', options: ['A little shy','Very excited','Very angry','Very sleepy'], answer: 'A little shy' },
      { question: 'What does this story tell us about Lin?', options: ['She is friendly and welcoming','She is quiet and shy','She does not like new students','She likes to be alone'], answer: 'She is friendly and welcoming' }
    ]
  }
];

// ------------------------------------
//  8. Grammar Exercises (18 exercises)
// ------------------------------------
const GRAMMAR_EXERCISES = [
  // Identify nouns
  { type: 'identify-noun', instruction: 'Which word is a noun?', sentence: 'The happy dog runs fast.', options: ['dog','happy','runs','fast'], answer: 'dog' },
  { type: 'identify-noun', instruction: 'Which word is a noun?', sentence: 'A bright star shines at night.', options: ['star','bright','shines','at'], answer: 'star' },
  { type: 'identify-noun', instruction: 'Which word is a noun?', sentence: 'My little sister likes cake.', options: ['cake','little','likes','My'], answer: 'cake' },
  { type: 'identify-noun', instruction: 'Which word is a noun?', sentence: 'The red ball rolled away.', options: ['ball','red','rolled','away'], answer: 'ball' },
  { type: 'identify-noun', instruction: 'Which word is a noun?', sentence: 'We saw a beautiful rainbow.', options: ['rainbow','beautiful','saw','We'], answer: 'rainbow' },

  // Identify verbs
  { type: 'identify-verb', instruction: 'Which word is a verb?', sentence: 'She reads a big book.', options: ['reads','She','big','book'], answer: 'reads' },
  { type: 'identify-verb', instruction: 'Which word is a verb?', sentence: 'The children play in the park.', options: ['play','children','park','the'], answer: 'play' },
  { type: 'identify-verb', instruction: 'Which word is a verb?', sentence: 'He draws a pretty picture.', options: ['draws','pretty','picture','He'], answer: 'draws' },
  { type: 'identify-verb', instruction: 'Which word is a verb?', sentence: 'The bird sings a sweet song.', options: ['sings','bird','sweet','song'], answer: 'sings' },
  { type: 'identify-verb', instruction: 'Which word is a verb?', sentence: 'My brother eats his lunch quickly.', options: ['eats','brother','lunch','quickly'], answer: 'eats' },

  // Identify adjectives
  { type: 'identify-adj', instruction: 'Which word is an adjective?', sentence: 'The tall tree has green leaves.', options: ['tall','tree','has','leaves'], answer: 'tall' },
  { type: 'identify-adj', instruction: 'Which word is an adjective?', sentence: 'She wore a pretty dress.', options: ['pretty','wore','dress','She'], answer: 'pretty' },
  { type: 'identify-adj', instruction: 'Which word is an adjective?', sentence: 'The cold wind blew hard.', options: ['cold','wind','blew','hard'], answer: 'cold' },
  { type: 'identify-adj', instruction: 'Which word is an adjective?', sentence: 'I found a shiny coin on the floor.', options: ['shiny','coin','floor','found'], answer: 'shiny' },

  // Subject-verb agreement
  { type: 'sv-agreement', instruction: 'Pick the correct word.', sentence: 'The cat ___ on the mat.', options: ['sits','sit','sitting','sitted'], answer: 'sits' },
  { type: 'sv-agreement', instruction: 'Pick the correct word.', sentence: 'The birds ___ in the sky.', options: ['fly','flies','flying','flyed'], answer: 'fly' },
  { type: 'sv-agreement', instruction: 'Pick the correct word.', sentence: 'She ___ to school every day.', options: ['walks','walk','walking','walkies'], answer: 'walks' },
  { type: 'sv-agreement', instruction: 'Pick the correct word.', sentence: 'They ___ playing in the garden.', options: ['are','is','am','be'], answer: 'are' }
];

// ------------------------------------
//  9. Poetry Data
// ------------------------------------
const POETRY_DATA = {
  rhymeSets: [
    ['cat','hat','bat','mat','sat','flat'],
    ['day','play','say','way','may','stay'],
    ['tree','bee','sea','free','me','see'],
    ['sun','fun','run','bun','done','one'],
    ['night','light','bright','right','sight','flight'],
    ['rain','train','main','plain','gain','lane'],
    ['star','far','car','jar','bar'],
    ['moon','soon','tune','spoon','noon','balloon']
  ],
  syllableWords: {
    1: ['cat','dog','sun','tree','ball','star','run','big','red','fish'],
    2: ['happy','garden','rabbit','purple','window','playing','singing','tiger','button','kitten'],
    3: ['butterfly','elephant','beautiful','adventure','umbrella','wonderful','imagine','discover','banana','dinosaur']
  },
  poemTemplates: [
    { name: 'Couplet', lines: 2, desc: 'Two lines that rhyme', example: 'I saw a cat / Wearing a hat' },
    { name: 'Haiku', lines: 3, desc: '5-7-5 syllables', example: 'A gentle spring rain / Flowers bloom in the garden / Butterflies will dance' },
    { name: 'Acrostic', lines: 4, desc: 'First letters spell a word', example: 'Sunny days are fun / Trees are swaying in the wind / And birds are singing / Rainbows fill the sky' }
  ]
};

// ------------------------------------
//  10. Paragraph Prompts (10 topics)
// ------------------------------------
const PARAGRAPH_PROMPTS = [
  { topic: 'My Favourite Animal', starter: 'My favourite animal is', hints: ['What does it look like?', 'Where does it live?', 'Why do you like it?'] },
  { topic: 'A Fun Day Out', starter: 'Last weekend, I went to', hints: ['Where did you go?', 'Who was with you?', 'What did you do?'] },
  { topic: 'My Best Friend', starter: 'My best friend is', hints: ['What is their name?', 'What do you like to do together?', 'Why are they special?'] },
  { topic: 'My Favourite Food', starter: 'The food I like most is', hints: ['What does it taste like?', 'When do you eat it?', 'Who makes it for you?'] },
  { topic: 'A Rainy Day', starter: 'One rainy day, I', hints: ['What did you do indoors?', 'How did you feel?', 'What happened next?'] },
  { topic: 'My Family', starter: 'My family is special because', hints: ['Who is in your family?', 'What do you do together?', 'What makes them special?'] },
  { topic: 'At the Playground', starter: 'I love going to the playground because', hints: ['What do you play on?', 'Who do you play with?', 'What is your favourite thing to do there?'] },
  { topic: 'My School', starter: 'My school is a great place because', hints: ['What is your favourite subject?', 'Who is your favourite teacher?', 'What do you do during recess?'] },
  { topic: 'A Trip to the Beach', starter: 'When I went to the beach, I', hints: ['What did the beach look like?', 'What did you do in the water?', 'What did you build in the sand?'] },
  { topic: 'If I Could Fly', starter: 'If I could fly, I would', hints: ['Where would you go first?', 'What would you see from above?', 'How would you feel?'] }
];

// ------------------------------------
//  11. Spelling Picture Map (emoji for CVC words)
// ------------------------------------
const SPELLING_PIC_MAP = {
  cat:'\uD83D\uDC31',bat:'\uD83E\uDD87',hat:'\uD83C\uDFA9',rat:'\uD83D\uDC00',
  pig:'\uD83D\uDC37',bug:'\uD83D\uDC1B',sun:'\u2600\uFE0F',cup:'\u2615',
  hen:'\uD83D\uDC14',bed:'\uD83D\uDECF\uFE0F',net:'\uD83E\uDD45',pin:'\uD83D\uDCCC',
  fan:'\uD83C\uDF00',van:'\uD83D\uDE90',rug:'\uD83E\uDDF6',mug:'\u2615',
  jug:'\uD83C\uDFFA',pen:'\uD83D\uDD8A\uFE0F',jet:'\u2708\uFE0F',dog:'\uD83D\uDC15'
};
