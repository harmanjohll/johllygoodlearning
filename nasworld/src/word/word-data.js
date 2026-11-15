// ============================================================
//  WORD DATA — CVC, sight words, vocab, sentences, passages, grammar, poetry
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
//  6. Vocabulary ladder
//
//  Level 1 is everyday P2 words; level 5 is P3 to P4 stretch. Each
//  word sits in a sentence that gives its meaning away to a careful
//  reader, because working a word out from context is the skill.
//
//  cat groups words that are close in meaning. The "which word
//  means..." question only draws its wrong choices from OTHER groups,
//  so two near-synonyms can never sit side by side as rival answers.
//  When adding a word, give it the cat of anything it could be
//  mistaken for.
// ------------------------------------
function wvItem(word, level, cat, meaning, sentence, w1, w2, w3) {
  return { word: word, level: level, cat: cat, meaning: meaning, sentence: sentence, options: [meaning, w1, w2, w3] };
}

const VOCAB_ITEMS = [
  // ----- Level 1: everyday words -----
  wvItem('tiny', 1, 'size', 'very small', 'The ant was so tiny that I could hardly see it.', 'very tall', 'very loud', 'very slow'),
  wvItem('huge', 1, 'size', 'very big', 'The huge lorry could not fit through the small gate.', 'very fast', 'very old', 'very quiet'),
  wvItem('glad', 1, 'feeling', 'happy and pleased', 'Siti was glad that her lost kitten had come home.', 'sad and upset', 'tired and sleepy', 'hungry and thirsty'),
  wvItem('quick', 1, 'speed', 'fast', 'Be quick, or we will miss the bus.', 'slow', 'quiet', 'careful'),
  wvItem('noisy', 1, 'sound', 'making a lot of sound', 'The canteen was so noisy that I could not hear my friend.', 'very clean', 'very dark', 'very empty'),
  wvItem('clever', 1, 'clever', 'quick to learn and understand', 'The clever girl solved the puzzle in one minute.', 'slow to wake up', 'afraid of the dark', 'good at running'),
  wvItem('shut', 1, 'action', 'to close', 'Please shut the window before the rain comes in.', 'to open', 'to clean', 'to break'),
  wvItem('chilly', 1, 'temperature', 'rather cold', 'The air-conditioned room was chilly, so Mei Ling put on her jacket.', 'rather hot', 'rather dark', 'rather noisy'),
  wvItem('tidy', 1, 'state', 'neat and in order', 'Hakim keeps his desk tidy, so he can always find his pencils.', 'dirty and messy', 'old and broken', 'big and heavy'),
  wvItem('afraid', 1, 'feeling', 'scared', 'The little boy was afraid of the loud thunder and hid under his blanket.', 'happy', 'sleepy', 'hungry'),
  wvItem('giggle', 1, 'sound', 'to laugh in a light, silly way', 'The joke made the girls giggle behind their hands.', 'to cry loudly', 'to shout angrily', 'to sing sweetly'),
  wvItem('brave', 1, 'character', 'not afraid to do something hard', 'The brave boy climbed up to rescue the kitten from the tree.', 'too shy to speak', 'quick to get angry', 'slow to wake up'),
  wvItem('shiny', 1, 'look', 'bright when light falls on it', 'Papa polished his shoes until they were shiny.', 'wet and muddy', 'old and torn', 'soft and warm'),
  wvItem('hurry', 1, 'speed', 'to move or do something fast', 'We had to hurry because the school bus was about to leave.', 'to wait quietly', 'to sit down', 'to fall asleep'),

  // ----- Level 2 -----
  wvItem('enormous', 2, 'size', 'very, very big', 'The enormous tree was taller than our block of flats.', 'very, very small', 'very, very old', 'very, very soft'),
  wvItem('delighted', 2, 'feeling', 'very happy', 'Mei Ling was delighted when she won first prize.', 'very sad', 'very scared', 'very sleepy'),
  wvItem('furious', 2, 'feeling', 'very angry', 'Mr Lim was furious when he saw the broken window.', 'very happy', 'very tired', 'very hungry'),
  wvItem('exhausted', 2, 'body', 'very tired', 'After the long race, Arjun was so exhausted that he lay down on the grass.', 'very strong', 'very excited', 'very hungry'),
  wvItem('swift', 2, 'speed', 'very fast', 'The swift cat caught the lizard before it could run away.', 'very slow', 'very heavy', 'very gentle'),
  wvItem('curious', 2, 'think', 'wanting to know more', 'The curious boy opened every box to see what was inside.', 'feeling very tired', 'not wanting to share', 'afraid of new things'),
  wvItem('soggy', 2, 'state', 'very wet and soft', 'His shoes were soggy after he walked through the puddles.', 'very dry and hard', 'very clean and new', 'very hot and dusty'),
  wvItem('whisper', 2, 'sound', 'to speak very softly', 'We had to whisper in the library so that we did not disturb the readers.', 'to shout loudly', 'to sing happily', 'to run quickly'),
  wvItem('gentle', 2, 'character', 'soft and careful', 'Be gentle with the baby rabbit, or you may hurt it.', 'rough and fast', 'loud and rude', 'tall and strong'),
  wvItem('ancient', 2, 'time', 'very, very old', 'The ancient temple was built hundreds of years ago.', 'very new', 'very clean', 'very small'),
  wvItem('gorgeous', 2, 'look', 'very beautiful', 'Everyone stopped to look at the gorgeous sunset over the sea.', 'very dull', 'very loud', 'very cold'),
  wvItem('peek', 2, 'see', 'to take a quick look', 'Kai opened the oven door a little to peek at the cake.', 'to take a big bite', 'to take a long nap', 'to give a loud shout'),
  wvItem('stroll', 2, 'move', 'to walk slowly in a relaxed way', 'After dinner, we like to stroll along the beach and enjoy the breeze.', 'to run as fast as you can', 'to swim under water', 'to climb up high'),
  wvItem('starving', 2, 'body', 'very hungry', 'I had no breakfast, so by recess I was starving.', 'very sleepy', 'very cold', 'very clean'),
  wvItem('crowded', 2, 'place', 'full of people', 'The MRT train was so crowded that we could not find a seat.', 'empty and quiet', 'clean and bright', 'old and slow'),
  wvItem('spotless', 2, 'state', 'perfectly clean', 'Ah Ma mopped the floor until it was spotless.', 'covered in dirt', 'full of holes', 'rough and bumpy'),
  wvItem('delicious', 2, 'taste', 'very tasty', 'The chicken rice was so delicious that I asked for a second plate.', 'too spicy to eat', 'cold and hard', 'very cheap'),

  // ----- Level 3 -----
  wvItem('timid', 3, 'feeling', 'shy and easily frightened', 'The timid kitten hid under the sofa whenever visitors came.', 'bold and noisy', 'greedy and rude', 'strong and fast'),
  wvItem('fragile', 3, 'state', 'easy to break', 'Carry the fragile glass vase with both hands so that it does not crack.', 'hard to lift', 'easy to clean', 'nice to smell'),
  wvItem('generous', 3, 'character', 'happy to give and share', 'The generous boy gave half of his sandwich to a friend who had no lunch.', 'afraid to try', 'quick to complain', 'slow to learn'),
  wvItem('brilliant', 3, 'clever', 'very clever', 'Priya had a brilliant idea that solved the problem at once.', 'very silly', 'very boring', 'very late'),
  wvItem('gleaming', 3, 'look', 'shining brightly', 'Papa washed the car until it was gleaming in the sun.', 'covered in mud', 'full of scratches', 'making a noise'),
  wvItem('peculiar', 3, 'odd', 'strange or unusual', 'There was a peculiar smell in the kitchen, and nobody knew where it came from.', 'sweet and pleasant', 'very common', 'hard to notice'),
  wvItem('vanish', 3, 'hide', 'to disappear suddenly', 'The magician made the coin vanish, and no one could find it.', 'to grow bigger', 'to make a loud noise', 'to change colour'),
  wvItem('glance', 3, 'see', 'a quick look', 'Ravi took a glance at the clock and saw that he was late.', 'a long sleep', 'a loud laugh', 'a deep breath'),
  wvItem('drowsy', 3, 'body', 'sleepy', 'The warm afternoon made Jun Hao feel drowsy, and his eyes began to close.', 'hungry', 'cheerful', 'angry'),
  wvItem('annoyed', 3, 'feeling', 'a little angry', 'Farah was annoyed because her brother kept taking her pencils.', 'a little sleepy', 'very proud', 'very thankful'),
  wvItem('scorching', 3, 'temperature', 'very hot', 'It was a scorching afternoon, so we looked for shade under a tree.', 'very cold', 'very windy', 'very dark'),
  wvItem('drenched', 3, 'state', 'completely wet', 'Devi forgot her umbrella and was drenched by the time she reached home.', 'completely dry', 'covered in sand', 'dressed neatly'),
  wvItem('chuckle', 3, 'sound', 'to laugh quietly', 'The funny cartoon made Ah Gong chuckle to himself.', 'to cry softly', 'to cough loudly', 'to yawn widely'),
  wvItem('rapid', 3, 'speed', 'very quick', 'With rapid steps, Mr Tan reached the bus stop just in time.', 'very slow', 'very quiet', 'very heavy'),
  wvItem('nibble', 3, 'eat', 'to eat in very small bites', 'The hamster began to nibble the carrot a little at a time.', 'to swallow whole', 'to throw away', 'to hide quickly'),
  wvItem('grateful', 3, 'feeling', 'thankful', 'Siti was grateful to the lady who returned her lost wallet.', 'angry', 'bored', 'afraid'),
  wvItem('assist', 3, 'help', 'to help', 'The prefects assist the teachers by handing out the books.', 'to stop', 'to copy', 'to forget'),
  wvItem('purchase', 3, 'buy', 'to buy', 'Mama went to the supermarket to purchase rice and eggs.', 'to sell', 'to cook', 'to borrow'),
  wvItem('gloomy', 3, 'weather', 'dark and dull', 'The sky was gloomy, and we knew that rain was coming.', 'bright and clear', 'full of stars', 'hot and dry'),
  wvItem('rescue', 3, 'help', 'to save from danger', 'The firefighter climbed the ladder to rescue the cat from the roof.', 'to chase away', 'to take a photo of', 'to feed'),
  wvItem('drizzle', 3, 'weather', 'light rain', 'It was only a drizzle, so we did not need our umbrellas.', 'a strong wind', 'a loud thunderstorm', 'a thick fog'),

  // ----- Level 4 -----
  wvItem('vibrant', 4, 'look', 'full of life and colour', 'The night market was vibrant with bright lanterns and cheerful music.', 'dull and grey', 'empty and silent', 'cold and wet'),
  wvItem('tranquil', 4, 'calm', 'calm and peaceful', 'The reservoir was tranquil in the early morning, with not a ripple on the water.', 'noisy and busy', 'dirty and smelly', 'rough and stormy'),
  wvItem('diligent', 4, 'effort', 'hardworking and careful', 'The diligent pupil checked every answer twice before handing in her work.', 'lazy and careless', 'funny and loud', 'shy and quiet'),
  wvItem('graceful', 4, 'move', 'moving in a smooth and beautiful way', 'The graceful dancer seemed to float across the stage.', 'moving in a clumsy way', 'speaking in a loud voice', 'dressed in bright colours'),
  wvItem('reluctant', 4, 'feeling', 'not willing', 'Kai was reluctant to jump into the cold pool, so he stood at the edge for a long time.', 'very eager', 'very skilled', 'quite proud'),
  wvItem('astonished', 4, 'feeling', 'very surprised', 'We were astonished when the small boy lifted the heavy box by himself.', 'very bored', 'very sleepy', 'very hungry'),
  wvItem('famished', 4, 'body', 'extremely hungry', 'After swimming for two hours, the famished children ate three plates of noodles each.', 'extremely sleepy', 'extremely shy', 'extremely neat'),
  wvItem('cautious', 4, 'character', 'careful to avoid danger', 'Be cautious when you cross the road, and always look both ways.', 'quick to get angry', 'happy to share', 'slow to wake up'),
  wvItem('deserted', 4, 'place', 'empty, with no people', 'The playground was deserted during the thunderstorm.', 'full of children', 'newly painted', 'brightly lit'),
  wvItem('murmur', 4, 'sound', 'to speak in a low, soft voice', 'I heard my sister murmur something in her sleep, but I could not make out the words.', 'to shout angrily', 'to sing loudly', 'to laugh happily'),
  wvItem('ordinary', 4, 'odd', 'normal, not special', 'It looked like an ordinary pencil, but it could write in three colours.', 'very expensive', 'very strange', 'broken and useless'),
  wvItem('observe', 4, 'see', 'to watch carefully', 'We used a magnifying glass to observe the ants carrying food to their nest.', 'to chase away', 'to count quickly', 'to feed well'),
  wvItem('sprint', 4, 'speed', 'to run as fast as you can', 'Arjun had to sprint to the gate before it closed.', 'to walk slowly', 'to crawl on hands and knees', 'to hop on one foot'),
  wvItem('shiver', 4, 'body', 'to shake because of cold or fear', 'The wet puppy began to shiver, so we wrapped it in a warm towel.', 'to jump for joy', 'to sleep deeply', 'to eat greedily'),
  wvItem('weary', 4, 'body', 'tired after hard work or a long journey', 'After walking all day, the weary travellers sat down to rest their feet.', 'ready to start a race', 'lost in a new town', 'happy to meet friends'),
  wvItem('frequently', 4, 'time', 'often', 'It rains frequently in December, so I carry an umbrella every day.', 'hardly ever', 'only once', 'very lightly'),
  wvItem('tremble', 4, 'body', 'to shake slightly', 'His hands began to tremble as he carried the full bowl of hot soup.', 'to grow stronger', 'to become clean', 'to move quickly'),
  wvItem('downpour', 4, 'weather', 'very heavy rain', 'The sudden downpour flooded the drain and soaked everyone at the bus stop.', 'a light breeze', 'a hot afternoon', 'a bright rainbow'),

  // ----- Level 5: stretch words -----
  wvItem('resilient', 5, 'effort', 'able to recover quickly from difficulty', 'The resilient plant was flattened by the storm, but it stood straight again in a few days.', 'easy to break', 'slow to grow', 'pretty to look at'),
  wvItem('persevere', 5, 'effort', 'to keep trying even when it is hard', 'Xin Yi fell off her bicycle many times, but she chose to persevere until she could ride.', 'to give up quickly', 'to ask for a reward', 'to blame someone else'),
  wvItem('magnificent', 5, 'look', 'very grand and beautiful', 'From the top of the hill, we had a magnificent view of the whole city.', 'small and plain', 'dark and frightening', 'noisy and crowded'),
  wvItem('anxious', 5, 'feeling', 'worried and nervous', 'Irfan felt anxious before his first swimming test, and his hands would not keep still.', 'calm and relaxed', 'proud and happy', 'bored and sleepy'),
  wvItem('bewildered', 5, 'feeling', 'very confused', 'Wei Jie was bewildered by the map and did not know which way to turn.', 'very pleased', 'very angry', 'very sleepy'),
  wvItem('scarce', 5, 'amount', 'hard to find because there is very little', 'Water was scarce during the dry season, so every drop was saved.', 'easy to find everywhere', 'too dirty to use', 'too hot to touch'),
  wvItem('abundant', 5, 'amount', 'more than enough', 'Mangoes were abundant that year, and every stall had baskets full of them.', 'very hard to find', 'too sour to eat', 'too costly to buy'),
  wvItem('hesitate', 5, 'pause', 'to pause because you are not sure', 'Farah began to hesitate at the top of the tall slide because she was not sure it was safe.', 'to cheer loudly', 'to climb quickly', 'to fall asleep'),
  wvItem('conceal', 5, 'hide', 'to hide', 'Mei Ling tried to conceal the present behind her back so that her mother would not see it.', 'to show', 'to break', 'to open'),
  wvItem('demolish', 5, 'destroy', 'to knock down completely', 'The workers will demolish the old building so that a new library can be built there.', 'to paint brightly', 'to clean carefully', 'to visit often'),
  wvItem('exclaim', 5, 'sound', 'to say something suddenly and loudly', 'When the lights went out, we heard Devi exclaim in surprise.', 'to whisper a secret', 'to hum a tune', 'to keep silent'),
  wvItem('essential', 5, 'need', 'needed and very important', 'Water is essential for plants, for they cannot live without it.', 'harmful and dangerous', 'nice but not needed', 'hard to find'),
  wvItem('temporary', 5, 'time', 'lasting for only a short time', 'The tent was a temporary shelter until the rain stopped.', 'lasting for ever', 'very expensive', 'very large'),
  wvItem('gradually', 5, 'speed', 'slowly, little by little', 'The sky gradually turned from blue to orange as the sun went down.', 'all at once', 'not at all', 'with a loud noise'),
  wvItem('mischievous', 5, 'character', 'fond of playing tricks', 'The mischievous monkey snatched the cap and ran up the tree with it.', 'shy and afraid of people', 'slow and sleepy', 'kind and helpful'),
  wvItem('devour', 5, 'eat', 'to eat quickly and hungrily', 'The hungry boys began to devour the pizza, and it was gone in two minutes.', 'to cook slowly', 'to share fairly', 'to throw away')
];

// ------------------------------------
//  6b. Synonyms and antonyms
//  The target word is shown in its sentence. One choice is right; the
//  rest are neither a synonym nor (for antonyms) the true opposite.
// ------------------------------------
function wrItem(kind, level, word, sentence, answer, w1, w2, w3) {
  return { kind: kind, level: level, word: word, sentence: sentence, answer: answer, options: [answer, w1, w2, w3] };
}

const VOCAB_RELATE = [
  // ----- Synonyms -----
  wrItem('synonym', 1, 'big', 'The big dog barked at the postman.', 'large', 'small', 'thin', 'quiet'),
  wrItem('synonym', 1, 'happy', 'Kai was happy to see his cousins.', 'glad', 'sad', 'angry', 'sleepy'),
  wrItem('synonym', 1, 'begin', 'The show will begin at noon.', 'start', 'end', 'stop', 'wait'),
  wrItem('synonym', 1, 'fast', 'The fast runner won the race.', 'quick', 'slow', 'tall', 'kind'),
  wrItem('synonym', 1, 'sad', 'Mei Ling felt sad when her friend moved away.', 'unhappy', 'glad', 'brave', 'sleepy'),
  wrItem('synonym', 2, 'shout', 'Please do not shout in the library.', 'yell', 'whisper', 'listen', 'read'),
  wrItem('synonym', 2, 'small', 'A small bird sat on the fence.', 'little', 'huge', 'heavy', 'tall'),
  wrItem('synonym', 2, 'gift', 'Aisha wrapped the gift in shiny paper.', 'present', 'letter', 'ribbon', 'party'),
  wrItem('synonym', 2, 'hard', 'The last sum was too hard for me.', 'difficult', 'easy', 'soft', 'short'),
  wrItem('synonym', 3, 'reply', 'Please reply to my question.', 'answer', 'ask', 'forget', 'repeat'),
  wrItem('synonym', 3, 'silent', 'The hall was silent during the test.', 'quiet', 'noisy', 'empty', 'dark'),
  wrItem('synonym', 3, 'rush', 'We had to rush to catch the bus.', 'hurry', 'wait', 'rest', 'stop'),
  wrItem('synonym', 3, 'frightened', 'The frightened puppy hid under the table.', 'scared', 'excited', 'tired', 'pleased'),
  wrItem('synonym', 4, 'collect', 'We will collect dry leaves for our art project.', 'gather', 'scatter', 'throw', 'lose'),
  wrItem('synonym', 4, 'enormous', 'An enormous wave crashed onto the beach.', 'gigantic', 'tiny', 'narrow', 'ancient'),
  wrItem('synonym', 4, 'repair', 'Papa will repair the broken chair.', 'mend', 'break', 'sell', 'hide'),
  wrItem('synonym', 4, 'wealthy', 'The wealthy man gave money to the hospital.', 'rich', 'poor', 'kind', 'famous'),
  wrItem('synonym', 5, 'courageous', 'The courageous girl spoke up for her friend.', 'brave', 'fearful', 'careless', 'clumsy'),
  wrItem('synonym', 5, 'commence', 'The concert will commence at seven in the evening.', 'begin', 'finish', 'pause', 'continue'),
  wrItem('synonym', 5, 'swiftly', 'The deer ran swiftly into the forest.', 'quickly', 'slowly', 'sadly', 'loudly'),
  wrItem('synonym', 5, 'error', 'Ravi found an error in his sum and corrected it.', 'mistake', 'answer', 'lesson', 'success'),

  // ----- Antonyms -----
  wrItem('antonym', 1, 'hot', 'The soup is hot.', 'cold', 'warm', 'wet', 'big'),
  wrItem('antonym', 1, 'open', 'The shop is open today.', 'closed', 'busy', 'new', 'near'),
  wrItem('antonym', 1, 'early', 'Siti came to school early.', 'late', 'soon', 'fast', 'first'),
  wrItem('antonym', 1, 'big', 'An elephant is a big animal.', 'small', 'large', 'tall', 'heavy'),
  wrItem('antonym', 1, 'day', 'Owls sleep in the day.', 'night', 'morning', 'sun', 'week'),
  wrItem('antonym', 2, 'full', 'My water bottle is full.', 'empty', 'heavy', 'big', 'wet'),
  wrItem('antonym', 2, 'noisy', 'The noisy class made Mrs Tan frown.', 'quiet', 'loud', 'busy', 'fast'),
  wrItem('antonym', 2, 'remember', 'I always remember to bring my library book.', 'forget', 'think', 'learn', 'know'),
  wrItem('antonym', 2, 'heavy', 'This box of books is heavy.', 'light', 'large', 'strong', 'thick'),
  wrItem('antonym', 3, 'arrive', 'The guests will arrive at six.', 'leave', 'reach', 'come', 'enter'),
  wrItem('antonym', 3, 'smooth', 'The table top feels smooth.', 'rough', 'soft', 'flat', 'shiny'),
  wrItem('antonym', 3, 'polite', 'The polite boy thanked the bus driver.', 'rude', 'kind', 'quiet', 'helpful'),
  wrItem('antonym', 3, 'dangerous', 'It is dangerous to play near the road.', 'safe', 'risky', 'scary', 'wild'),
  wrItem('antonym', 3, 'whisper', 'Hakim had to whisper so that the baby would not wake.', 'shout', 'murmur', 'talk', 'sing'),
  wrItem('antonym', 4, 'ancient', 'We saw an ancient map in the museum.', 'modern', 'old', 'huge', 'broken'),
  wrItem('antonym', 4, 'generous', 'The generous girl shared her crayons with everyone.', 'selfish', 'kind', 'cheerful', 'wealthy'),
  wrItem('antonym', 4, 'shallow', 'The baby pool is shallow.', 'deep', 'wide', 'narrow', 'wet'),
  wrItem('antonym', 4, 'victory', 'The team cheered after their victory.', 'defeat', 'prize', 'match', 'success'),
  wrItem('antonym', 5, 'scarce', 'Rain was scarce that month, and the grass turned brown.', 'plentiful', 'rare', 'costly', 'tiny'),
  wrItem('antonym', 5, 'reluctant', 'Devi was reluctant to try the bitter gourd.', 'eager', 'unwilling', 'afraid', 'slow'),
  wrItem('antonym', 5, 'permanent', 'The marker left a permanent stain on the desk.', 'temporary', 'lasting', 'strong', 'final'),
  wrItem('antonym', 5, 'expand', 'A balloon will expand when you blow air into it.', 'shrink', 'grow', 'stretch', 'burst')
];

// ------------------------------------
//  3. Sentence work
//
//  3a. Rearranging. Real sentences, not ones assembled from word
//  banks, so nothing reads as nonsense. tiles is the answer in order.
//  also lists every other order that is good English, and all of them
//  are marked right.
//
//  How these were kept honest: the subject is nearly always I, he,
//  she, we or they, because "The cat chased the dog" can be flipped
//  into another real sentence and "She fed the cat" cannot. Where a
//  when or where phrase can move to the front, that order is in also.
//  Where two clauses can swap around a joining word, both are in.
// ------------------------------------
function wsItem(level, tiles, also) {
  return { level: level, tiles: tiles, answer: tiles.join(' ') + '.', also: also || [] };
}

const SENTENCE_ITEMS = [
  // ----- Level 1: three to five tiles, one possible order -----
  wsItem(1, ['I', 'like', 'mangoes']),
  wsItem(1, ['We', 'play', 'football']),
  wsItem(1, ['He', 'has', 'a', 'red', 'kite']),
  wsItem(1, ['She', 'drinks', 'milk']),
  wsItem(1, ['They', 'ride', 'the', 'bus']),
  wsItem(1, ['I', 'love', 'my', 'family']),
  wsItem(1, ['She', 'feeds', 'her', 'cat']),
  wsItem(1, ['We', 'wash', 'our', 'hands']),
  wsItem(1, ['He', 'likes', 'durian']),
  wsItem(1, ['I', 'see', 'a', 'bird']),
  wsItem(1, ['We', 'love', 'our', 'school']),
  wsItem(1, ['She', 'has', 'two', 'brothers']),
  wsItem(1, ['They', 'eat', 'noodles']),
  wsItem(1, ['I', 'drink', 'water']),

  // ----- Level 2 -----
  wsItem(2, ['He', 'kicked', 'the', 'ball', 'hard'], ['He kicked the hard ball.']),
  wsItem(2, ['I', 'eat', 'an', 'egg', 'every morning'], ['Every morning I eat an egg.']),
  wsItem(2, ['She', 'reads', 'a book', 'every night'], ['Every night she reads a book.']),
  wsItem(2, ['They', 'went', 'to', 'the zoo'], ['To the zoo they went.']),
  wsItem(2, ['We', 'saw', 'two', 'monkeys']),
  wsItem(2, ['He', 'drives', 'a', 'blue', 'taxi']),
  wsItem(2, ['I', 'lost', 'my', 'new', 'pencil']),
  wsItem(2, ['She', 'gave', 'me', 'a', 'sticker']),
  wsItem(2, ['We', 'borrowed', 'three', 'library', 'books']),

  // ----- Level 3: a when or where phrase that can also come first -----
  wsItem(3, ['He', 'ate', 'two', 'plates', 'of', 'noodles']),
  wsItem(3, ['She', 'put', 'her', 'shoes', 'on', 'the rack'], ['On the rack she put her shoes.']),
  wsItem(3, ['I', 'brush', 'my teeth', 'before', 'bed'], ['Before bed I brush my teeth.']),
  wsItem(3, ['They', 'played', 'catching', 'after', 'school'], ['After school they played catching.']),
  wsItem(3, ['We', 'bought', 'some', 'bread', 'at', 'the bakery'], ['At the bakery we bought some bread.']),
  wsItem(3, ['He', 'drew', 'a', 'picture', 'of', 'a tiger']),
  wsItem(3, ['She', 'wears', 'a', 'yellow', 'raincoat', 'on rainy days'], ['On rainy days she wears a yellow raincoat.']),
  wsItem(3, ['I', 'made', 'a', 'birthday', 'card', 'for my friend'], ['For my friend I made a birthday card.']),
  wsItem(3, ['We', 'visited', 'our', 'grandparents', 'in Malacca'], ['In Malacca we visited our grandparents.']),

  // ----- Level 4: adverbs and a first joining word -----
  wsItem(4, ['He', 'quickly', 'packed', 'his', 'school', 'bag'], ['He packed his school bag quickly.', 'Quickly he packed his school bag.']),
  wsItem(4, ['They', 'always', 'share', 'their', 'snacks', 'at recess'], ['At recess they always share their snacks.']),
  wsItem(4, ['I', 'found', 'a', 'shiny', 'coin', 'under', 'my bed'], ['Under my bed I found a shiny coin.']),
  wsItem(4, ['She', 'carefully', 'carried', 'the', 'hot', 'soup'], ['She carried the hot soup carefully.', 'Carefully she carried the hot soup.']),
  wsItem(4, ['We', 'took', 'the', 'MRT', 'to', 'Jurong East'], ['To Jurong East we took the MRT.']),
  wsItem(4, ['He', 'never', 'forgets', 'to', 'feed', 'his fish']),
  wsItem(4, ['She', 'was late', 'because', 'she', 'missed', 'the bus'],
         ['Because she missed the bus she was late.', 'She missed the bus because she was late.', 'Because she was late she missed the bus.']),
  wsItem(4, ['We', 'stayed', 'indoors', 'because', 'it', 'was raining'],
         ['Because it was raining we stayed indoors.']),

  // ----- Level 5: two clauses -----
  wsItem(5, ['I', 'wanted to play', 'but', 'I', 'had', 'homework'], ['I had homework but I wanted to play.']),
  wsItem(5, ['They', 'clap', 'when', 'he', 'finishes', 'his', 'song'],
         ['When he finishes his song they clap.', 'He finishes his song when they clap.', 'When they clap he finishes his song.']),
  wsItem(5, ['They', 'were tired', 'so', 'they', 'went', 'to bed early']),
  wsItem(5, ['He', 'did not', 'eat', 'his', 'vegetables', 'at', 'dinner'], ['At dinner he did not eat his vegetables.']),
  wsItem(5, ['She', 'hugged', 'her', 'little', 'brother', 'tightly'], ['She tightly hugged her little brother.']),
  wsItem(5, ['I will', 'water', 'the', 'plants', 'when', 'I', 'come', 'home'], ['When I come home I will water the plants.']),
  wsItem(5, ['She', 'smiled', 'when', 'she', 'saw', 'her', 'grandmother'],
         ['When she saw her grandmother she smiled.', 'She saw her grandmother when she smiled.', 'When she smiled she saw her grandmother.']),
  wsItem(5, ['We', 'ran', 'home', 'because', 'we', 'were hungry'],
         ['Because we were hungry we ran home.', 'We were hungry because we ran home.', 'Because we ran home we were hungry.']),
  wsItem(5, ['He', 'wore', 'his', 'cap', 'because', 'the sun', 'was very bright'],
         ['Because the sun was very bright he wore his cap.', 'The sun was very bright because he wore his cap.', 'Because he wore his cap the sun was very bright.'])
];

// ------------------------------------
//  3b. Joining two sentences with a given conjunction
//  Four full sentences are offered. One keeps the meaning of the two
//  short sentences. The others either break the grammar or turn the
//  meaning round (the reason becomes the result, and so on), which is
//  why the question asks her to keep the meaning.
// ------------------------------------
function wjItem(level, conj, a, b, answer, w1, w2, w3, why) {
  return { level: level, conj: conj, a: a, b: b, answer: answer, options: [answer, w1, w2, w3], why: why };
}

const JOIN_ITEMS = [
  // ----- Level 2: and, but -----
  wjItem(2, 'and', 'Siti has a cat.', 'Siti has a rabbit.',
    'Siti has a cat and a rabbit.',
    'Siti has and a cat a rabbit.', 'Siti has a cat and rabbit has.', 'And Siti has a cat a rabbit.',
    'And joins the two things Siti has. We do not need to say Siti has twice.'),
  wjItem(2, 'but', 'Hakim can swim.', 'Hakim cannot dive.',
    'Hakim can swim but he cannot dive.',
    'Hakim can swim but he can dive.', 'But Hakim can swim he cannot dive.', 'Hakim can swim he but cannot dive.',
    'But joins two ideas that are different. He stands for Hakim the second time.'),
  wjItem(2, 'and', 'Mei Ling washed the cups.', 'Mei Ling dried the cups.',
    'Mei Ling washed and dried the cups.',
    'Mei Ling washed dried and the cups.', 'Mei Ling and washed the cups dried the cups.', 'Mei Ling washed the cups and she the cups.',
    'And joins the two actions. We do not need to say Mei Ling or the cups twice.'),
  wjItem(2, 'but', 'I like papaya.', 'My sister does not like papaya.',
    'I like papaya but my sister does not.',
    'I like papaya but my sister likes.', 'I but like papaya my sister does not.', 'But I like papaya my sister does not like.',
    'But joins two ideas that are different. It goes between the two parts.'),
  wjItem(2, 'and', 'The sky turned dark.', 'It started to rain.',
    'The sky turned dark and it started to rain.',
    'The sky and turned dark it started to rain.', 'The sky turned dark it and started to rain.', 'And the sky turned dark it started to rain.',
    'And joins two things that happened. It goes between the two parts.'),

  // ----- Level 3: because, so, or -----
  wjItem(3, 'because', 'Arjun took an umbrella.', 'It was raining.',
    'Arjun took an umbrella because it was raining.',
    'It was raining because Arjun took an umbrella.', 'Because Arjun took an umbrella it was raining.', 'Arjun took an umbrella it was raining because.',
    'Because comes before the reason. The rain is the reason for the umbrella.'),
  wjItem(3, 'so', 'The floor was wet.', 'Ravi slipped.',
    'The floor was wet, so Ravi slipped.',
    'Ravi slipped, so the floor was wet.', 'So the floor was wet, Ravi slipped.', 'The floor so was wet Ravi slipped.',
    'So comes before the result. Slipping is the result of the wet floor.'),
  wjItem(3, 'or', 'We can take the bus.', 'We can walk.',
    'We can take the bus or walk.',
    'We or can take the bus walk.', 'Or we can take the bus we can walk.', 'We can take or the bus walk.',
    'Or joins two choices. We do not need to say we can twice.'),
  wjItem(3, 'so', 'Priya was hungry.', 'Priya ate a bun.',
    'Priya was hungry, so she ate a bun.',
    'Priya ate a bun, so she was hungry.', 'Priya was hungry she so ate a bun.', 'So Priya was hungry, she ate a bun.',
    'So comes before the result. Eating is the result of being hungry.'),
  wjItem(3, 'because', 'Kai stayed in bed.', 'Kai had a fever.',
    'Kai stayed in bed because he had a fever.',
    'Kai had a fever because he stayed in bed.', 'Kai stayed because in bed he had a fever.', 'Because Kai stayed in bed he had a fever.',
    'Because comes before the reason. The fever is the reason for staying in bed.'),
  wjItem(3, 'or', 'You may have an apple.', 'You may have a pear.',
    'You may have an apple or a pear.',
    'You may have or an apple a pear.', 'You may or have an apple a pear.', 'Or you may have an apple a pear.',
    'Or joins two choices. We do not need to say you may have twice.'),

  // ----- Level 4 -----
  wjItem(4, 'but', 'Farah wanted to buy the book.', 'She did not have enough money.',
    'Farah wanted to buy the book but she did not have enough money.',
    'Farah wanted to buy the book but she had enough money.', 'Farah did not have enough money but she did not want to buy the book.', 'But Farah wanted to buy the book she did not have enough money.',
    'But joins two ideas that pull in different ways. Both ideas must stay the same.'),
  wjItem(4, 'because', 'Jun Hao missed the bus.', 'He woke up late.',
    'Jun Hao missed the bus because he woke up late.',
    'Jun Hao woke up late because he missed the bus.', 'Jun Hao missed the bus because woke up late.', 'Because Jun Hao missed the bus he woke up late.',
    'Because comes before the reason. Waking up late is the reason for missing the bus.'),
  wjItem(4, 'so', 'Aisha forgot her water bottle.', 'She was thirsty at recess.',
    'Aisha forgot her water bottle, so she was thirsty at recess.',
    'Aisha was thirsty at recess, so she forgot her water bottle.', 'Aisha forgot her water bottle, so thirsty she was at recess.', 'So Aisha forgot her water bottle, she was thirsty at recess.',
    'So comes before the result. Being thirsty is the result of forgetting the bottle.'),
  wjItem(4, 'and', 'Devi sang a song.', 'Xin Yi played the piano.',
    'Devi sang a song and Xin Yi played the piano.',
    'Devi sang a song Xin Yi and played the piano.', 'Devi and sang a song Xin Yi played the piano.', 'Devi sang a song and played Xin Yi the piano.',
    'And goes between the two sentences. Each girl keeps her own action.'),
  wjItem(4, 'or', 'Hurry up.', 'We will be late.',
    'Hurry up, or we will be late.',
    'Hurry up, or we will not be late.', 'We will be late, or hurry up.', 'Or hurry up, we will be late.',
    'Or can warn what will happen if we do not do something.'),
  wjItem(4, 'but', 'The durian smelled strong.', 'It tasted sweet.',
    'The durian smelled strong but it tasted sweet.',
    'The durian but smelled strong it tasted sweet.', 'But the durian smelled strong it tasted sweet.', 'The durian smelled strong it tasted but sweet.',
    'But joins two ideas that are different. It goes between the two parts.'),

  // ----- Level 5 -----
  wjItem(5, 'so', 'Wei Jie practised every day.', 'He won the race.',
    'Wei Jie practised every day, so he won the race.',
    'Wei Jie won the race, so he practised every day.', 'Wei Jie practised every day, so won the race he.', 'So Wei Jie practised every day, he won the race.',
    'So comes before the result. Winning is the result of practising.'),
  wjItem(5, 'because', 'The children could not play outside.', 'The field was flooded.',
    'The children could not play outside because the field was flooded.',
    'The field was flooded because the children could not play outside.', 'The children could not play outside because the field was not flooded.', 'The children because could not play outside the field was flooded.',
    'Because comes before the reason. The flooded field is the reason.'),
  wjItem(5, 'but', 'Irfan looked everywhere for his cap.', 'He could not find it.',
    'Irfan looked everywhere for his cap but he could not find it.',
    'Irfan looked everywhere for his cap but he could find it.', 'But Irfan looked everywhere for his cap he could not find it.', 'Irfan looked everywhere but for his cap he could not find it.',
    'But shows that the second part is not what we expect. Both ideas must stay the same.'),
  wjItem(5, 'or', 'You can finish your homework now.', 'You can finish it after dinner.',
    'You can finish your homework now or after dinner.',
    'You can finish your homework or now after dinner.', 'You can or finish your homework now after dinner.', 'Or you can finish your homework now after dinner.',
    'Or joins the two choices of time. We do not need to say you can finish it twice.'),
  wjItem(5, 'because', 'Ravi did not eat his lunch.', 'He was not hungry.',
    'Ravi did not eat his lunch because he was not hungry.',
    'Ravi did not eat his lunch because he was hungry.', 'Ravi was not hungry because he did not eat his lunch.', 'Because Ravi did not eat his lunch he was not hungry.',
    'Because comes before the reason. Not being hungry is the reason.')
];

// ------------------------------------
//  7. Comprehension Passages (12 short passages, level 1)
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
//  7b. P2 reading passages (levels 2 to 5)
//
//  The twelve short passages above are level 1. These are the P2
//  ladder: 60 to 120 words, Singapore settings, four or five questions
//  each, asked together in one sitting so she reads a passage once and
//  then works through it.
//
//  kind says what a question is testing, and is the sub-skill key:
//    literal    the answer is written in the passage
//    sequence   what happened first, next, after
//    vocab      a word's meaning, worked out from the sentence around it
//    inference  the answer is not written; the clues point to it
// ------------------------------------
function wpQ(kind, question, answer, w1, w2, w3, why) {
  return { kind: kind, question: question, answer: answer, options: [answer, w1, w2, w3], why: why || '' };
}

const READING_PASSAGES = [
  {
    level: 2, title: 'The Wet Market',
    text: 'On Saturday morning, Mei Ling went to the wet market with her grandmother. The floor was wet and slippery, so she walked slowly. First, they bought fish from Uncle Lim. Next, they chose some spinach and a bag of tomatoes. Mei Ling carried the vegetables because the fish was too heavy for her. Before going home, Grandmother bought her a cup of warm soya bean milk. Mei Ling sipped it happily all the way to the bus stop.',
    questions: [
      wpQ('literal', 'Who went to the wet market with Mei Ling?', 'Her grandmother', 'Her mother', 'Uncle Lim', 'Her teacher'),
      wpQ('sequence', 'What did they buy first?', 'Fish', 'Spinach', 'Tomatoes', 'Soya bean milk', 'The word first tells us. First, they bought fish from Uncle Lim.'),
      wpQ('literal', 'Why did Mei Ling walk slowly?', 'The floor was wet and slippery', 'Her bag was heavy', 'She was tired', 'The market was crowded'),
      wpQ('vocab', 'In the passage, what does "sipped" mean?', 'Drank a little at a time', 'Spilled on the floor', 'Poured into a cup', 'Threw away', 'She sipped the milk all the way to the bus stop, so she drank it slowly, a little at a time.'),
      wpQ('inference', 'Who carried the fish?', 'Grandmother', 'Mei Ling', 'Uncle Lim', 'Nobody', 'The fish was too heavy for Mei Ling, and only Grandmother was with her.')
    ]
  },
  {
    level: 2, title: 'The Kite at Marina Barrage',
    text: 'Arjun and his father took a red kite to Marina Barrage on Sunday evening. The wind was strong, and the kite climbed high into the sky. Arjun held the string tightly with both hands. Suddenly, the string snapped. The kite drifted away and landed in a tall tree. Arjun felt like crying. His father found a long stick and gently shook the branch. The kite fell into Arjun\'s arms. He grinned and thanked his father.',
    questions: [
      wpQ('literal', 'Where did Arjun fly his kite?', 'At Marina Barrage', 'At East Coast Park', 'At his school field', 'At the void deck'),
      wpQ('sequence', 'What happened right after the string snapped?', 'The kite drifted away', 'Arjun grinned', 'His father found a stick', 'The wind grew strong', 'The sentence after the string snapped says the kite drifted away.'),
      wpQ('vocab', 'In the passage, what does "snapped" mean?', 'Broke suddenly', 'Grew longer', 'Turned red', 'Became wet', 'The kite drifted away straight after, so the string must have broken.'),
      wpQ('inference', 'How did Arjun feel when the kite landed in the tree?', 'Upset', 'Excited', 'Sleepy', 'Proud', 'He felt like crying, which shows that he was upset.'),
      wpQ('literal', 'How did his father get the kite down?', 'He shook the branch with a long stick', 'He climbed the tree', 'He pulled the string', 'He called for help')
    ]
  },
  {
    level: 2, title: 'Saturday at East Coast Park',
    text: 'Every Saturday, Kai cycles at East Coast Park with his mother. Kai rides a blue bicycle, and his mother rides a green one. Last Saturday, they stopped near the jetty to rest. Kai watched the ships far out at sea while he ate a banana. A boy nearby was learning to skate and kept falling down. Each time, the boy stood up and tried again. On the ride home, Kai told his mother that he wanted to learn skating too.',
    questions: [
      wpQ('literal', 'What colour is Kai\'s bicycle?', 'Blue', 'Green', 'Red', 'Yellow'),
      wpQ('literal', 'Where did they stop to rest?', 'Near the jetty', 'At a food centre', 'Under a bridge', 'At the playground'),
      wpQ('sequence', 'What did Kai do while he watched the ships?', 'He ate a banana', 'He cycled home', 'He learnt to skate', 'He fell down', 'The word while joins two things that happen at the same time.'),
      wpQ('inference', 'What does the passage tell us about the skating boy?', 'He does not give up easily', 'He is a very good skater', 'He is afraid of the sea', 'He does not like cycling', 'He kept falling, yet each time he stood up and tried again.')
    ]
  },
  {
    level: 3, title: 'Recess Rescue',
    text: 'At recess, Hakim bought a bowl of fishball noodles from the canteen. As he walked to his table, a boy running past bumped into him. The hot soup spilled all over the floor. Hakim stared at his empty bowl. He had no more money. His classmate Wei Jie saw what had happened. First, Wei Jie told the cleaner about the spill so that nobody would slip. Then he broke his own sandwich in two and gave Hakim the bigger half. Hakim smiled and promised to share his snack with Wei Jie the next day.',
    questions: [
      wpQ('literal', 'What did Hakim buy at recess?', 'A bowl of fishball noodles', 'A sandwich', 'A plate of chicken rice', 'A packet of milk'),
      wpQ('literal', 'Why did the soup spill?', 'A boy bumped into Hakim', 'Hakim tripped over a bag', 'The bowl was too hot to hold', 'Hakim was running'),
      wpQ('sequence', 'What did Wei Jie do first?', 'He told the cleaner about the spill', 'He shared his sandwich', 'He bought Hakim more noodles', 'He smiled at Hakim', 'The word first tells us. First, Wei Jie told the cleaner about the spill.'),
      wpQ('vocab', 'In the passage, what does "stared" mean?', 'Looked for a long time', 'Shouted loudly', 'Walked away', 'Laughed softly', 'Hakim could only look at his empty bowl. To stare is to look for a long time.'),
      wpQ('inference', 'What does the passage show about Wei Jie?', 'He is thoughtful and generous', 'He is hungry and impatient', 'He is afraid of the cleaner', 'He does not like sandwiches', 'He thought of other people slipping, and he gave away the bigger half of his sandwich.')
    ]
  },
  {
    level: 3, title: 'The Library Card',
    text: 'Siti loves the public library near her block in Tampines. Every Friday after school, she borrows four books with her library card. Last Friday, she could not find the card anywhere. She searched her bag, then her desk and, last of all, under her bed. Siti was worried because she wanted the next book about a girl detective. Then her little brother walked in, waving the card. He had been using it as a bookmark. Siti laughed and gave him a real bookmark instead.',
    questions: [
      wpQ('literal', 'How many books does Siti borrow every Friday?', 'Four', 'Two', 'Three', 'Five'),
      wpQ('literal', 'Where is the library?', 'Near her block in Tampines', 'Inside her school', 'Next to the wet market', 'In a shopping centre'),
      wpQ('sequence', 'Where did Siti look last?', 'Under her bed', 'In her bag', 'On her desk', 'In the library', 'The words last of all come just before under her bed.'),
      wpQ('vocab', 'In the passage, what does "searched" mean?', 'Looked carefully for something', 'Cleaned something well', 'Packed something neatly', 'Hid something away', 'She could not find the card, so she looked carefully in each place.'),
      wpQ('inference', 'Why did Siti give her brother a real bookmark?', 'So that he would stop using her library card', 'Because he had lost his book', 'Because it was his birthday', 'Because the library asked her to', 'He had been using her card to mark his page, and she needed the card back.')
    ]
  },
  {
    level: 3, title: 'Rain at the Playground',
    text: 'Dark clouds gathered above the playground. Priya and Farah were on the swings when the first drops fell. Farah pointed to the void deck. The girls grabbed their water bottles and dashed across the grass. Seconds later, the rain poured down. From the void deck, they watched the slide turn into a little waterfall. An old man sitting nearby offered them two stools. They thanked him and played five stones until the rain stopped.',
    questions: [
      wpQ('literal', 'What were the girls doing when the rain began?', 'Playing on the swings', 'Going down the slide', 'Playing five stones', 'Drinking water'),
      wpQ('vocab', 'In the passage, what does "dashed" mean?', 'Ran quickly', 'Walked slowly', 'Fell down', 'Looked around', 'The rain was starting and they reached shelter in seconds, so they ran quickly.'),
      wpQ('sequence', 'What did the girls do after the old man gave them stools?', 'They played five stones', 'They ran to the void deck', 'They grabbed their water bottles', 'They went on the swings', 'The last sentence comes after the stools. They thanked him and played five stones.'),
      wpQ('inference', 'Why did the slide look like a little waterfall?', 'Rainwater was running down it', 'Someone had left a tap on', 'A pipe had burst', 'The girls had poured water on it', 'The rain was pouring down, so the water ran down the slide.'),
      wpQ('inference', 'What does the passage show about the old man?', 'He is kind', 'He is impatient', 'He is forgetful', 'He is afraid of rain', 'He offered his stools to two children he did not know.')
    ]
  },
  {
    level: 4, title: 'The Class Hamster',
    text: 'Class 2 Honesty has a hamster named Biscuit. Each week, two pupils take care of him. This week, it was the turn of Ravi and Xin Yi. Every morning, Ravi filled the water bottle while Xin Yi put fresh seeds in the dish. On Wednesday, Xin Yi noticed that Biscuit had not touched his food. He lay curled up in a corner. The children told Mrs Tan at once. She moved the cage to a quiet corner of the room and covered half of it with a cloth. By Friday, Biscuit was running on his wheel again. Mrs Tan praised the two children for being observant.',
    questions: [
      wpQ('literal', 'What was Ravi\'s job every morning?', 'Filling the water bottle', 'Putting seeds in the dish', 'Cleaning the cage', 'Covering the cage'),
      wpQ('sequence', 'What did the children do as soon as they saw that Biscuit was not eating?', 'They told Mrs Tan', 'They moved the cage', 'They covered the cage', 'They gave him more seeds', 'The words at once tell us. The children told Mrs Tan at once.'),
      wpQ('inference', 'Why did Mrs Tan move the cage to a quiet corner?', 'She thought Biscuit needed rest', 'She wanted to hide him from the class', 'The cage was in her way', 'She wanted the pupils to forget him', 'A quiet corner and a cloth over the cage help a small animal to rest.'),
      wpQ('vocab', 'In the passage, what does "observant" mean?', 'Quick to notice things', 'Good at running', 'Very quiet', 'Always on time', 'The children were praised because Xin Yi noticed that Biscuit was not eating.'),
      wpQ('inference', 'How do we know that Biscuit was better by Friday?', 'He was running on his wheel again', 'He had a new cage', 'Mrs Tan bought more seeds', 'He was lying in a corner', 'A hamster that runs on its wheel is active and well.')
    ]
  },
  {
    level: 4, title: 'The Wrong Bus',
    text: 'Jun Hao usually takes bus 21 home from school. One afternoon, he was reading a comic at the bus stop. A bus arrived, and he hopped on without looking up. A few minutes later, nothing outside the window seemed familiar. He had boarded bus 12 by mistake. Jun Hao felt his heart beat faster, but he remembered what his mother had taught him. He walked to the front and calmly explained the problem to the driver. The driver told him to get off at the next stop and cross the overhead bridge. Jun Hao did so, and bus 21 soon came along. From then on, he kept his comic in his bag until he was on the right bus.',
    questions: [
      wpQ('literal', 'Which bus does Jun Hao usually take home?', 'Bus 21', 'Bus 12', 'Bus 10', 'Bus 2'),
      wpQ('inference', 'Why did Jun Hao board the wrong bus?', 'He was reading and did not check the number', 'The driver called him', 'Bus 21 did not come', 'His friend told him to', 'He hopped on without looking up from his comic.'),
      wpQ('vocab', 'In the passage, what does "familiar" mean?', 'Known from before', 'Far away', 'Very tall', 'Brightly coloured', 'He was on the wrong road, so he saw nothing that he knew.'),
      wpQ('sequence', 'What did Jun Hao do after he got off at the next stop?', 'He crossed the overhead bridge', 'He spoke to the driver', 'He read his comic', 'He walked to the front of the bus', 'The driver said to get off and then cross the bridge, and Jun Hao did so.'),
      wpQ('inference', 'What did Jun Hao learn that day?', 'To pay attention when boarding a bus', 'Never to take a bus again', 'Not to talk to bus drivers', 'To read his comics faster', 'Afterwards he kept his comic in his bag until he was on the right bus.')
    ]
  },
  {
    level: 4, title: 'Planting Chilli Seeds',
    text: 'Aisha wanted to grow chillies on the corridor outside her flat. Her father gave her a pot, some soil and a few seeds. First, Aisha filled the pot with soil. Next, she pressed the seeds gently into the soil and covered them. Then she watered the pot and placed it where the morning sun could reach it. For a week, nothing happened, and Aisha grew impatient. Her father reminded her that seeds need time. On the ninth day, two tiny green shoots appeared. Aisha was so thrilled that she measured them with her ruler every morning.',
    questions: [
      wpQ('literal', 'Where did Aisha grow her chillies?', 'On the corridor outside her flat', 'In the school garden', 'On the kitchen table', 'At a park'),
      wpQ('sequence', 'What did Aisha do right after filling the pot with soil?', 'She pressed the seeds into the soil', 'She watered the pot', 'She put the pot in the sun', 'She measured the shoots', 'The order words are first, next and then. Next, she pressed the seeds into the soil.'),
      wpQ('literal', 'When did the shoots appear?', 'On the ninth day', 'After one day', 'On the seventh day', 'After a month'),
      wpQ('vocab', 'In the passage, what does "impatient" mean?', 'Not happy to wait', 'Very sleepy', 'Full of joy', 'Afraid of the dark', 'Nothing happened for a week, and her father had to remind her that seeds need time.'),
      wpQ('inference', 'Why did Aisha put the pot where the morning sun could reach it?', 'Plants need sunlight to grow', 'She wanted to dry up the soil', 'The corridor was too dark to walk in', 'Her father told her to hide it', 'Seeds and young plants need light, and she wanted hers to grow.')
    ]
  },
  {
    level: 5, title: 'The Night Before the Concert',
    text: 'Devi had practised her recorder piece for three weeks. On the night before the school concert, she could not sleep. What if she forgot the notes? What if everyone laughed? Her grandfather heard her tossing and turning. He sat on the edge of her bed and told her about the first time he had sung on stage. His knees had knocked together, yet he had sung every word. He said that being nervous only meant that she cared. The next day, Devi\'s fingers trembled as she walked on stage. She took a deep breath, thought of her grandfather\'s knees and smiled. Then she played the whole piece without a single mistake.',
    questions: [
      wpQ('literal', 'How long had Devi practised her piece?', 'Three weeks', 'Three days', 'Two weeks', 'One month'),
      wpQ('inference', 'Why could Devi not sleep?', 'She was worried about making mistakes at the concert', 'Her room was too noisy', 'She was excited about a holiday', 'She had forgotten to do her homework', 'Her two questions show her fear of forgetting the notes and of being laughed at.'),
      wpQ('vocab', 'In the passage, what does "trembled" mean?', 'Shook slightly', 'Moved quickly', 'Hurt badly', 'Felt sticky', 'She was nervous, and nervous hands shake a little.'),
      wpQ('inference', 'Why did Grandfather tell Devi his story?', 'To show her that a nervous person can still do well', 'To tell her that singing is easier than playing', 'To stop her from going to the concert', 'To teach her a new song', 'His knees knocked, yet he sang every word. He wanted her to see that she could do the same.'),
      wpQ('sequence', 'What did Devi do just before she started playing?', 'She took a deep breath and smiled', 'She spoke to her grandfather', 'She practised the piece again', 'She walked off the stage', 'She took a deep breath and smiled. Then she played.')
    ]
  },
  {
    level: 5, title: 'Otters in the City',
    text: 'Smooth-coated otters live along some of Singapore\'s rivers and canals. They are excellent swimmers, with webbed feet and thick fur that keeps them warm. A family of otters hunts together, mostly for fish. After a meal, the otters roll on grass or sand to dry their fur. Many people enjoy watching them, but otters are wild animals. If you see them, keep your distance and do not feed them. Human food can make otters ill, and otters that are fed may stop hunting for themselves. Pet dogs should be kept on a leash nearby, as otters will defend their pups fiercely.',
    questions: [
      wpQ('literal', 'What do otters mostly hunt for?', 'Fish', 'Birds', 'Insects', 'Fruit'),
      wpQ('literal', 'Why do otters roll on grass or sand?', 'To dry their fur', 'To hide from people', 'To find food', 'To keep warm at night'),
      wpQ('vocab', 'In the passage, what does "defend" mean?', 'Protect', 'Feed', 'Leave', 'Wash', 'Otters guard their pups from danger. To defend is to protect.'),
      wpQ('literal', 'Why should people not feed otters?', 'It can make them ill and stop them hunting', 'Otters do not like food', 'Otters only eat at night', 'Feeding them costs too much'),
      wpQ('inference', 'Why should a dog be kept on a leash near otters?', 'The otters may attack it to protect their pups', 'The dog may eat the otters\' fish', 'Otters are afraid of leashes', 'Dogs cannot swim', 'Otters defend their pups fiercely, so a dog that runs up to them may be attacked.')
    ]
  },
  {
    level: 5, title: 'The Missing Kueh',
    text: 'Madam Rosnah made twelve pieces of kueh lapis for Hari Raya and left them on the kitchen table to cool. When she returned, only nine were left. She looked at her three children. Irfan had been doing his homework, and his fingers were stained with ink. Farah had just come back from the playground with sand on her shoes. Little Hakim sat very still, with crumbs on his chin and a guilty smile. Madam Rosnah did not scold him. Instead, she asked him to help her arrange the rest of the kueh on a tray. Hakim worked carefully and did not eat even one more.',
    questions: [
      wpQ('literal', 'How many pieces of kueh did Madam Rosnah make?', 'Twelve', 'Nine', 'Three', 'Ten'),
      wpQ('inference', 'How many pieces were missing?', 'Three', 'Nine', 'Twelve', 'Two', 'She made twelve and nine were left. Twelve take away nine is three.'),
      wpQ('inference', 'Who most likely ate the missing kueh?', 'Hakim', 'Irfan', 'Farah', 'Madam Rosnah', 'Only Hakim had crumbs on his chin and a guilty smile.'),
      wpQ('inference', 'Which clue points to the child who ate the kueh?', 'Crumbs on his chin', 'Ink on his fingers', 'Sand on her shoes', 'A tray on the table', 'Crumbs come from eating. Ink and sand come from homework and the playground.'),
      wpQ('vocab', 'In the passage, what does "guilty" mean?', 'Feeling bad about doing something wrong', 'Feeling proud of good work', 'Feeling sleepy after a meal', 'Feeling excited about a party', 'Hakim knew that he should not have eaten the kueh, and his smile showed it.')
    ]
  }
];

// ------------------------------------
//  8. Grammar ladder (P2 core, MOE EL Syllabus 2020)
//
//  Every item is hand-written and carries:
//    type   the grammar point, also used as the sub-skill key
//    level  1 (first meeting) to 5 (stretch, early P3)
//    why    one line shown after she answers, stating the rule
//
//  Writing rule for anyone adding items: each wrong choice must be
//  wrong for a reason a teacher would accept. "The" is almost always
//  grammatical, so a/an items never offer it; a second tense is never
//  offered unless a time word in the sentence rules it out.
// ------------------------------------
const GRAMMAR_INSTRUCTIONS = {
  'identify-noun': 'Which word is a noun?',
  'identify-verb': 'Which word is a verb?',
  'identify-adj':  'Which word is an adjective?',
  'past-reg':      'Choose the correct verb.',
  'past-irr':      'Choose the correct verb.',
  'sv':            'Choose the correct verb.',
  'pronoun':       'Choose the correct pronoun.',
  'prep':          'Choose the correct preposition.',
  'conj':          'Choose the best joining word.',
  'adj':           'Choose the correct describing word.',
  'article':       'Choose the correct word.',
  'qword':         'Choose the correct question word.',
  'contraction':   'Choose the short form of the words in bold.'
};

const GRAMMAR_HINTS = {
  'identify-noun': 'A noun is a person, place, animal, or thing.',
  'identify-verb': 'A verb is an action word, something you can do.',
  'identify-adj':  'An adjective describes what something is like.',
  'past-reg':      'Look for a time word such as yesterday or last night. Is the action over?',
  'past-irr':      'Some verbs do not take -ed in the past. Say each choice aloud.',
  'sv':            'Find who or what the sentence is about. Is it one, or more than one?',
  'pronoun':       'Who does the missing word stand for? Is that person doing the action or receiving it?',
  'prep':          'Think about where or when. Try each choice in the blank.',
  'conj':          'Does the second part add an idea, show a difference, give a reason, give a result or give a choice?',
  'adj':           'Are you describing one thing, comparing two things, or comparing three or more?',
  'article':       'Say the next word aloud. Listen to its first sound.',
  'qword':         'Read the reply that follows. What kind of information does it give?',
  'contraction':   'The apostrophe sits where letters have been left out.'
};

// The P2 grammar core. The test suite checks each of these is well stocked.
const GRAMMAR_CORE_TYPES = ['past-reg', 'past-irr', 'sv', 'pronoun', 'prep', 'conj', 'adj', 'article', 'qword', 'contraction'];

function wgItem(type, level, sentence, answer, w1, w2, w3, why, instruction) {
  return {
    type: type, level: level, sentence: sentence, answer: answer,
    options: [answer, w1, w2, w3], why: why,
    instruction: instruction || GRAMMAR_INSTRUCTIONS[type]
  };
}

const GRAMMAR_ITEMS = [
  // ---------- Naming, doing and describing words (level 1) ----------
  wgItem('identify-noun', 1, 'The happy dog runs fast.', 'dog', 'happy', 'runs', 'fast', 'A noun names a person, animal, place or thing. Dog names an animal.'),
  wgItem('identify-noun', 1, 'A bright star shines at night.', 'star', 'bright', 'shines', 'at', 'A noun names a person, animal, place or thing. Star names a thing.'),
  wgItem('identify-noun', 1, 'My little sister likes cake.', 'cake', 'little', 'likes', 'My', 'A noun names a person, animal, place or thing. Cake names a thing.'),
  wgItem('identify-noun', 1, 'The red ball rolled away.', 'ball', 'red', 'rolled', 'away', 'A noun names a person, animal, place or thing. Ball names a thing.'),
  wgItem('identify-noun', 1, 'We saw a beautiful rainbow.', 'rainbow', 'beautiful', 'saw', 'We', 'A noun names a person, animal, place or thing. Rainbow names a thing.'),
  wgItem('identify-verb', 1, 'She reads a big book.', 'reads', 'She', 'big', 'book', 'A verb tells us what someone does. Reads is the action.'),
  wgItem('identify-verb', 1, 'The children play in the park.', 'play', 'children', 'park', 'the', 'A verb tells us what someone does. Play is the action.'),
  wgItem('identify-verb', 1, 'He draws a pretty picture.', 'draws', 'pretty', 'picture', 'He', 'A verb tells us what someone does. Draws is the action.'),
  wgItem('identify-verb', 1, 'The bird sings a sweet song.', 'sings', 'bird', 'sweet', 'song', 'A verb tells us what someone does. Sings is the action.'),
  wgItem('identify-verb', 1, 'My brother eats his lunch quickly.', 'eats', 'brother', 'lunch', 'quickly', 'A verb tells us what someone does. Eats is the action.'),
  wgItem('identify-adj', 1, 'The tall tree has green leaves.', 'tall', 'tree', 'has', 'leaves', 'An adjective describes a noun. Tall describes the tree.'),
  wgItem('identify-adj', 1, 'She wore a pretty dress.', 'pretty', 'wore', 'dress', 'She', 'An adjective describes a noun. Pretty describes the dress.'),
  wgItem('identify-adj', 1, 'The cold wind blew hard.', 'cold', 'wind', 'blew', 'hard', 'An adjective describes a noun. Cold describes the wind.'),
  wgItem('identify-adj', 1, 'I found a shiny coin on the floor.', 'shiny', 'coin', 'floor', 'found', 'An adjective describes a noun. Shiny describes the coin.'),

  // ---------- Simple past tense, regular verbs ----------
  wgItem('past-reg', 1, 'Yesterday, Mei Ling ___ her room.', 'cleaned', 'clean', 'cleans', 'cleaning', 'Yesterday tells us the action is over, so the verb takes -ed: cleaned.'),
  wgItem('past-reg', 1, 'Last night, we ___ a film at home.', 'watched', 'watch', 'watches', 'watching', 'Last night tells us the action is over, so the verb takes -ed: watched.'),
  wgItem('past-reg', 1, 'Last Sunday, Hakim ___ the car with Papa.', 'washed', 'wash', 'washes', 'washing', 'Last Sunday tells us the action is over, so the verb takes -ed: washed.'),
  wgItem('past-reg', 2, 'Siti ___ her school bag last night.', 'packed', 'pack', 'packs', 'packing', 'Last night tells us the action is over, so the verb takes -ed: packed.'),
  wgItem('past-reg', 2, 'The baby ___ all night long, so nobody slept.', 'cried', 'cry', 'cryed', 'crying', 'When a verb ends in a consonant and y, change the y to i and add -ed: cried.'),
  wgItem('past-reg', 2, 'Arjun ___ the ball and it flew into the net.', 'kicked', 'kick', 'kicks', 'kicking', 'Flew is in the past, so the other verb must be in the past too: kicked.'),
  wgItem('past-reg', 2, 'Priya ___ at the joke and could not stop.', 'laughed', 'laugh', 'laughing', 'laught', 'Could not stop is in the past, so the verb takes -ed: laughed.'),
  wgItem('past-reg', 3, 'The bus ___ at the traffic light a minute ago.', 'stopped', 'stoped', 'stop', 'stops', 'Stop has a short vowel and ends in one consonant, so double the p before -ed: stopped.'),
  wgItem('past-reg', 3, 'Ah Ma ___ the eggs in a hot pan last night.', 'fried', 'fryed', 'fry', 'fries', 'When a verb ends in a consonant and y, change the y to i and add -ed: fried.'),
  wgItem('past-reg', 3, 'We ___ to the library after school yesterday.', 'hurried', 'hurryed', 'hurry', 'hurries', 'When a verb ends in a consonant and y, change the y to i and add -ed: hurried.'),
  wgItem('past-reg', 3, 'The cat ___ off the sofa when the doorbell rang.', 'jumped', 'jumps', 'jump', 'jumping', 'Rang is in the past, so the other verb must be in the past too: jumped.'),
  wgItem('past-reg', 4, 'Kai ___ the plants before he left for school.', 'watered', 'waters', 'water', 'watering', 'Left is in the past, so the other verb must be in the past too: watered.'),
  wgItem('past-reg', 4, 'Mrs Tan smiled and ___ at the class.', 'waved', 'waves', 'wave', 'waving', 'Smiled is in the past, so the verb joined to it by and is in the past too: waved.'),
  wgItem('past-reg', 4, 'When the bell rang, the children ___ their books.', 'closed', 'close', 'closes', 'closing', 'Rang is in the past, so the other verb must be in the past too: closed.'),
  wgItem('past-reg', 4, 'Did Farah ___ the door?', 'lock', 'locked', 'locks', 'locking', 'After did, use the plain form of the verb. Did already shows the past: did lock.'),
  wgItem('past-reg', 4, 'Ravi did not ___ the bus this morning.', 'miss', 'missed', 'misses', 'missing', 'After did not, use the plain form of the verb: did not miss.'),
  wgItem('past-reg', 4, 'The rain ___ just as we reached the void deck.', 'started', 'start', 'starts', 'starting', 'Reached is in the past, so the other verb must be in the past too: started.'),
  wgItem('past-reg', 5, 'Aisha ___ the heavy box up the stairs and then rested.', 'carried', 'carryed', 'carries', 'carry', 'Rested is in the past, and carry changes y to i before -ed: carried.'),
  wgItem('past-reg', 5, 'Wei Jie ___ to finish the puzzle, but it was too hard.', 'tried', 'tryed', 'tries', 'trying', 'Was is in the past, and try changes y to i before -ed: tried.'),
  wgItem('past-reg', 5, 'We ___ for the bus for twenty minutes before it came.', 'waited', 'wait', 'waits', 'waiting', 'Came is in the past, so the other verb must be in the past too: waited.'),
  wgItem('past-reg', 5, 'Irfan ___ and fell near the canteen, but he was not hurt.', 'tripped', 'triped', 'trips', 'trip', 'Fell is in the past, and trip doubles the p before -ed: tripped.'),

  // ---------- Simple past tense, irregular verbs ----------
  wgItem('past-irr', 1, 'Yesterday, I ___ to the park with Papa.', 'went', 'go', 'goes', 'goed', 'The past tense of go is went. It does not take -ed.'),
  wgItem('past-irr', 1, 'Last night, Siti ___ fried rice for dinner.', 'ate', 'eat', 'eats', 'eated', 'The past tense of eat is ate. It does not take -ed.'),
  wgItem('past-irr', 1, 'We ___ a rainbow after the rain yesterday.', 'saw', 'see', 'sees', 'seeing', 'The past tense of see is saw. It does not take -ed.'),
  wgItem('past-irr', 2, 'Arjun ___ very fast in the race last Friday.', 'ran', 'run', 'runs', 'runned', 'The past tense of run is ran. It does not take -ed.'),
  wgItem('past-irr', 2, 'Mei Ling ___ her water bottle to school yesterday.', 'took', 'take', 'takes', 'taked', 'The past tense of take is took. It does not take -ed.'),
  wgItem('past-irr', 2, 'Last Sunday, Ah Gong ___ us a funny story.', 'told', 'tell', 'tells', 'telled', 'The past tense of tell is told. It does not take -ed.'),
  wgItem('past-irr', 2, 'I ___ my homework before dinner last night.', 'did', 'do', 'done', 'does', 'The past tense of do is did. Done needs a helping verb such as have.'),
  wgItem('past-irr', 3, 'Mama ___ a big fish at the wet market last Saturday.', 'bought', 'buyed', 'buy', 'buys', 'The past tense of buy is bought. It does not take -ed.'),
  wgItem('past-irr', 3, 'Hakim ___ the ball with both hands during the match yesterday.', 'caught', 'catched', 'catch', 'catches', 'The past tense of catch is caught. It does not take -ed.'),
  wgItem('past-irr', 3, 'Mr Lim ___ us a new song last week.', 'taught', 'teached', 'teach', 'teaches', 'The past tense of teach is taught. It does not take -ed.'),
  wgItem('past-irr', 3, 'The little bird ___ out of its nest a moment ago.', 'flew', 'flied', 'fly', 'flies', 'The past tense of fly is flew. It does not take -ed.'),
  wgItem('past-irr', 3, 'Priya ___ a letter to her cousin in Penang last month.', 'wrote', 'writed', 'write', 'written', 'The past tense of write is wrote. Written needs a helping verb such as has.'),
  wgItem('past-irr', 4, 'Farah ___ her old shoes because the new ones were too tight.', 'wore', 'weared', 'wear', 'worn', 'The past tense of wear is wore. Worn needs a helping verb such as has.'),
  wgItem('past-irr', 4, 'The glass ___ when it fell off the table.', 'broke', 'breaked', 'break', 'broken', 'The past tense of break is broke. Broken needs a helping verb such as was.'),
  wgItem('past-irr', 4, 'Jun Hao ___ a picture of the Merlion in art class yesterday.', 'drew', 'drawed', 'draw', 'drawn', 'The past tense of draw is drew. Drawn needs a helping verb such as has.'),
  wgItem('past-irr', 4, 'I ___ my umbrella on the bus last week and never found it.', 'left', 'leaved', 'leave', 'leaves', 'The past tense of leave is left. It does not take -ed.'),
  wgItem('past-irr', 4, 'Ravi ___ his bicycle to East Coast Park last weekend.', 'rode', 'rided', 'ride', 'ridden', 'The past tense of ride is rode. Ridden needs a helping verb such as has.'),
  wgItem('past-irr', 4, 'Did you ___ the moon last night?', 'see', 'saw', 'seen', 'sees', 'After did, use the plain form of the verb. Did already shows the past: did see.'),
  wgItem('past-irr', 4, 'Devi ___ the answer, so she put up her hand.', 'knew', 'knowed', 'know', 'known', 'The past tense of know is knew. It does not take -ed.'),
  wgItem('past-irr', 5, 'The wind ___ so hard that the clothes fell off the pole.', 'blew', 'blowed', 'blow', 'blown', 'The past tense of blow is blew. Blown needs a helping verb such as has.'),
  wgItem('past-irr', 5, 'Xin Yi ___ behind the door and waited for her brother.', 'hid', 'hided', 'hide', 'hidden', 'The past tense of hide is hid. Hidden needs a helping verb such as was.'),
  wgItem('past-irr', 5, 'Aisha ___ the bell twice, but nobody came to the door.', 'rang', 'ringed', 'rung', 'ring', 'The past tense of ring is rang. Rung needs a helping verb such as has.'),
  wgItem('past-irr', 5, 'We ___ in the sea at Sentosa until the sun went down.', 'swam', 'swimmed', 'swum', 'swim', 'The past tense of swim is swam. Swum needs a helping verb such as have.'),
  wgItem('past-irr', 5, 'The children ___ their lunch boxes to the picnic and shared the food.', 'brought', 'bringed', 'bring', 'brang', 'The past tense of bring is brought. It does not take -ed.'),

  // ---------- Subject-verb agreement ----------
  wgItem('sv', 1, 'The cat ___ on the mat every afternoon.', 'sits', 'sit', 'sitting', 'sitted', 'The cat is one animal, so the verb takes -s: sits.'),
  wgItem('sv', 1, 'The birds ___ in the sky.', 'fly', 'flies', 'flying', 'flyed', 'Birds is more than one, so the verb has no -s: fly.'),
  wgItem('sv', 1, 'She ___ to school every day.', 'walks', 'walk', 'walking', 'walkes', 'With he, she or it, the verb takes -s: walks.'),
  wgItem('sv', 1, 'They ___ playing in the garden.', 'are', 'is', 'am', 'be', 'They is more than one, so use are.'),
  wgItem('sv', 1, 'I ___ seven years old.', 'am', 'is', 'are', 'be', 'With I, always use am.'),
  wgItem('sv', 1, 'My brother ___ a red bicycle.', 'has', 'have', 'having', 'haves', 'My brother is one person, so use has.'),
  wgItem('sv', 2, 'Mei Ling and Siti ___ best friends.', 'are', 'is', 'am', 'be', 'Two people joined by and are more than one, so use are.'),
  wgItem('sv', 2, 'My grandparents ___ in Tampines.', 'live', 'lives', 'living', 'is living', 'Grandparents is more than one, so the verb has no -s: live.'),
  wgItem('sv', 2, 'Hakim ___ his teeth every night.', 'brushes', 'brush', 'brushing', 'brushs', 'Hakim is one person, and a verb ending in sh takes -es: brushes.'),
  wgItem('sv', 2, 'The children ___ their hands before recess.', 'wash', 'washes', 'washing', 'washs', 'Children is more than one, so the verb has no ending: wash.'),
  wgItem('sv', 2, 'Arjun ___ not like spicy food.', 'does', 'do', 'doing', 'done', 'Arjun is one person, so use does.'),
  wgItem('sv', 2, '___ you have a pencil?', 'Do', 'Does', 'Is', 'Are', 'With you, use do. Does is for he, she and it.'),
  wgItem('sv', 3, 'There ___ three eggs in the basket.', 'are', 'is', 'am', 'be', 'Three eggs is more than one, so use there are.'),
  wgItem('sv', 3, 'There ___ a lizard on the ceiling.', 'is', 'are', 'am', 'be', 'A lizard is one thing, so use there is.'),
  wgItem('sv', 3, 'Yesterday, the boys ___ late for assembly.', 'were', 'was', 'is', 'are', 'Yesterday shows the past, and boys is more than one, so use were.'),
  wgItem('sv', 3, 'Last night, I ___ very tired after swimming.', 'was', 'were', 'is', 'am', 'Last night shows the past, and with I the past form is was.'),
  wgItem('sv', 3, 'My sister ___ her lunch to school every day.', 'carries', 'carry', 'carrys', 'carrying', 'My sister is one person. Carry changes y to i and adds -es: carries.'),
  wgItem('sv', 3, 'My father and I ___ to the market every Sunday.', 'go', 'goes', 'going', 'am going', 'My father and I are two people, so the verb has no -es: go.'),
  wgItem('sv', 3, '___ your mother work in a hospital?', 'Does', 'Do', 'Is', 'Are', 'Your mother is one person, so the question begins with does.'),
  wgItem('sv', 4, 'Everyone in my class ___ a library card.', 'has', 'have', 'having', 'are', 'Everyone takes a singular verb, so use has.'),
  wgItem('sv', 4, 'The box of crayons ___ on the top shelf.', 'is', 'are', 'am', 'be', 'The subject is the box, which is one thing, so use is.'),
  wgItem('sv', 4, 'One of my friends ___ in Jurong.', 'lives', 'live', 'living', 'are living', 'The subject is one friend, so the verb takes -s: lives.'),
  wgItem('sv', 4, 'Each child ___ a bottle of water for the trip.', 'needs', 'need', 'needing', 'are needing', 'Each means one at a time, so the verb takes -s: needs.'),
  wgItem('sv', 4, 'The stripes on the tiger ___ black.', 'are', 'is', 'am', 'was', 'The subject is the stripes, which is more than one, so use are.'),
  wgItem('sv', 5, 'The bunch of bananas on the table ___ ripe.', 'is', 'are', 'am', 'be', 'The subject is the bunch, which is one thing, so use is.'),
  wgItem('sv', 5, 'The pupils in the school choir ___ on stage every Friday.', 'sing', 'sings', 'singing', 'is singing', 'The subject is the pupils, which is more than one, so the verb has no -s: sing.'),
  wgItem('sv', 5, 'Nobody ___ where the class hamster is hiding.', 'knows', 'know', 'knowing', 'known', 'Nobody takes a singular verb, so the verb takes -s: knows.'),
  wgItem('sv', 5, 'A few of the mangoes ___ still green.', 'are', 'is', 'am', 'be', 'A few means more than one, so use are.'),
  wgItem('sv', 5, 'Both of my cousins ___ how to swim.', 'know', 'knows', 'knowing', 'known', 'Both means two, so the verb has no -s: know.'),
  wgItem('sv', 5, 'The list of spelling words ___ on the board.', 'is', 'are', 'were', 'am', 'The subject is the list, which is one thing, so use is.'),

  // ---------- Pronouns ----------
  wgItem('pronoun', 1, 'Siti is my friend. ___ sits beside me.', 'She', 'He', 'It', 'They', 'Siti is one girl, so the pronoun is she.'),
  wgItem('pronoun', 1, 'The boys are in the hall. ___ are singing.', 'They', 'He', 'It', 'She', 'The boys are more than one, so the pronoun is they.'),
  wgItem('pronoun', 1, 'This is my bag. ___ is blue.', 'It', 'He', 'She', 'They', 'A bag is one thing, so the pronoun is it.'),
  wgItem('pronoun', 1, 'Hakim and I are hungry. ___ want to eat.', 'We', 'They', 'He', 'It', 'Hakim and I together are we.'),
  wgItem('pronoun', 2, 'Mr Lim is our teacher. We like ___ very much.', 'him', 'he', 'his', 'she', 'After a verb such as like, use him, not he.'),
  wgItem('pronoun', 2, 'Mama called Mei Ling and gave ___ a hug.', 'her', 'she', 'hers', 'he', 'After a verb such as gave, use her, not she.'),
  wgItem('pronoun', 2, 'The puppies are thirsty. Please give ___ some water.', 'them', 'they', 'their', 'theirs', 'After a verb such as give, use them, not they.'),
  wgItem('pronoun', 2, 'This pencil belongs to me. It is ___ pencil.', 'my', 'me', 'I', 'mine', 'Before a noun, use my to show that it belongs to me.'),
  wgItem('pronoun', 2, 'Can you help ___ carry these books?', 'me', 'I', 'my', 'mine', 'After a verb such as help, use me, not I.'),
  wgItem('pronoun', 3, 'Arjun forgot ___ water bottle at home.', 'his', 'he', 'him', "he's", 'Before a noun, use his to show that it belongs to a boy.'),
  wgItem('pronoun', 3, 'The children put on ___ shoes and ran outside.', 'their', 'they', 'them', 'there', 'Their shows that the shoes belong to them. There names a place.'),
  wgItem('pronoun', 3, 'Priya and I baked a cake. Mama helped ___.', 'us', 'we', 'our', 'ours', 'After a verb such as helped, use us, not we.'),
  wgItem('pronoun', 3, 'That red bag is not yours. It is ___.', 'mine', 'my', 'me', 'I', 'Mine stands alone, with no noun after it. My needs a noun after it.'),
  wgItem('pronoun', 3, 'I have a little brother. ___ name is Irfan.', 'His', 'He', 'Him', "He's", 'Before a noun, use his to show that it belongs to a boy.'),
  wgItem('pronoun', 3, 'Xin Yi dropped her eraser, so I picked ___ up for her.', 'it', 'its', 'them', 'they', 'An eraser is one thing, so the pronoun is it.'),
  wgItem('pronoun', 4, 'The cat licked ___ paws after eating.', 'its', 'it', "it's", 'them', "Its, with no apostrophe, shows belonging. It's means it is."),
  wgItem('pronoun', 4, 'Ah Ma gave Ravi and ___ some pineapple tarts.', 'me', 'I', 'my', 'mine', 'After a verb such as gave, use me. Try the sentence without Ravi and.'),
  wgItem('pronoun', 4, 'These books belong to Farah and Devi. The books are ___.', 'theirs', 'their', 'them', 'they', 'Theirs stands alone, with no noun after it. Their needs a noun after it.'),
  wgItem('pronoun', 4, 'We painted this poster. The poster is ___.', 'ours', 'our', 'us', 'we', 'Ours stands alone, with no noun after it. Our needs a noun after it.'),
  wgItem('pronoun', 4, '___ and Wei Jie are in the same class.', 'He', 'Him', 'His', 'Them', 'The pronoun is doing the action, so use he, not him.'),
  wgItem('pronoun', 4, 'My sister and ___ share a bedroom.', 'I', 'me', 'my', 'mine', 'The pronoun is doing the action, so use I. Try the sentence without my sister and.'),
  wgItem('pronoun', 4, 'Is this umbrella ___, Hakim?', 'yours', 'your', 'you', "you're", 'Yours stands alone, with no noun after it. Your needs a noun after it.'),
  wgItem('pronoun', 5, 'Aisha was proud of ___ when she finished the race.', 'herself', 'himself', 'itself', 'themselves', 'When the doer and the receiver are the same girl, use herself.'),
  wgItem('pronoun', 5, 'The boys cleaned the classroom by ___.', 'themselves', 'himself', 'ourselves', 'theirselves', 'For more than one person, the form is themselves.'),
  wgItem('pronoun', 5, 'The teacher asked Xin Yi and ___ to hand out the books.', 'me', 'I', 'my', 'myself', 'After a verb such as asked, use me. Try the sentence without Xin Yi and.'),
  wgItem('pronoun', 5, 'Mei Ling made this card by ___.', 'herself', 'himself', 'itself', 'myself', 'By herself means that Mei Ling did it alone. The pronoun must match Mei Ling.'),
  wgItem('pronoun', 5, 'Ravi and Kai forgot their caps, so Mr Lim lent ___ two spare ones.', 'them', 'they', 'their', 'theirs', 'After a verb such as lent, use them, not they.'),

  // ---------- Prepositions ----------
  wgItem('prep', 1, 'The book is ___ the table.', 'on', 'into', 'of', 'to', 'On tells us that something rests on top of a surface.'),
  wgItem('prep', 1, 'I put my shoes ___ the shoe rack.', 'on', 'of', 'from', 'off', 'On tells us that something rests on top of a surface.'),
  wgItem('prep', 1, 'The fish swim ___ the pond.', 'in', 'of', 'off', 'onto', 'In tells us that something is inside a space.'),
  wgItem('prep', 1, 'Mei Ling goes ___ school by bus.', 'to', 'on', 'of', 'in', 'To shows the place someone is going towards.'),
  wgItem('prep', 2, 'The cat crawled ___ the bed to hide from the thunder.', 'under', 'between', 'of', 'at', 'Under means below something. Between needs two things.'),
  wgItem('prep', 2, "We have recess ___ ten o'clock.", 'at', 'on', 'in', 'of', 'Use at for a clock time.'),
  wgItem('prep', 2, 'My birthday is ___ March.', 'in', 'on', 'at', 'to', 'Use in for a month.'),
  wgItem('prep', 2, 'We do not go to school ___ Sunday.', 'on', 'in', 'at', 'of', 'Use on for a day of the week.'),
  wgItem('prep', 2, 'Arjun sits ___ Siti and Hakim.', 'between', 'into', 'of', 'from', 'Between means in the middle of two people or things.'),
  wgItem('prep', 3, 'The MRT train went ___ the tunnel.', 'through', 'between', 'at', 'of', 'Through means in one end and out the other.'),
  wgItem('prep', 3, 'Kai jumped ___ the pool with a big splash.', 'into', 'at', 'of', 'between', 'Into shows movement from outside to inside.'),
  wgItem('prep', 3, 'The clock hangs ___ the whiteboard.', 'above', 'into', 'of', 'between', 'Above means higher than something.'),
  wgItem('prep', 3, 'Farah shared her sweets ___ her friends.', 'with', 'to', 'at', 'of', 'We share something with someone.'),
  wgItem('prep', 3, 'This present is ___ you.', 'for', 'at', 'of', 'into', 'For shows who is meant to receive something.'),
  wgItem('prep', 3, 'I am waiting ___ the bus.', 'for', 'to', 'of', 'off', 'We wait for something or someone.'),
  wgItem('prep', 4, 'Priya is good ___ drawing animals.', 'at', 'in', 'on', 'of', 'We say good at an activity.'),
  wgItem('prep', 4, 'Ravi is afraid ___ the dark.', 'of', 'from', 'at', 'with', 'We say afraid of something.'),
  wgItem('prep', 4, 'We stayed indoors ___ the heavy rain.', 'during', 'among', 'between', 'into', 'During means all through the time that something is happening.'),
  wgItem('prep', 4, "The library is open ___ nine o'clock to five o'clock.", 'from', 'at', 'in', 'on', 'From marks the start of a time and to marks the end.'),
  wgItem('prep', 4, 'She poured the milk ___ the jug into a glass.', 'from', 'of', 'at', 'to', 'From shows where something starts.'),
  wgItem('prep', 4, 'Thank you ___ helping me.', 'for', 'to', 'of', 'at', 'We thank someone for something.'),
  wgItem('prep', 4, 'Hakim arrived ___ school early today.', 'at', 'to', 'on', 'of', 'We arrive at a place. We do not say arrive to.'),
  wgItem('prep', 5, 'Jun Hao leaned ___ the wall to rest.', 'against', 'among', 'between', 'during', 'Against means touching and pressing on something.'),
  wgItem('prep', 5, 'The bird flew ___ the open window and landed on my desk.', 'through', 'among', 'between', 'during', 'Through means passing from one side to the other.'),
  wgItem('prep', 5, 'We walked ___ the river until we reached the bridge.', 'along', 'among', 'between', 'during', 'Along means following the length of something.'),
  wgItem('prep', 5, 'I have not seen my cousin ___ last year.', 'since', 'for', 'from', 'during', 'Since is used with the point in time when something began.'),
  wgItem('prep', 5, 'Aisha has lived in Bedok ___ five years.', 'for', 'since', 'during', 'from', 'For is used with a length of time, such as five years.'),
  wgItem('prep', 5, 'Devi was absent ___ school yesterday.', 'from', 'of', 'to', 'off', 'We say absent from a place.'),

  // ---------- Conjunctions ----------
  wgItem('conj', 1, 'I have a pencil ___ an eraser.', 'and', 'but', 'because', 'so', 'And joins two things that go together.'),
  wgItem('conj', 1, 'Siti likes apples ___ oranges.', 'and', 'but', 'so', 'because', 'And joins two things that go together.'),
  wgItem('conj', 1, 'Do you want milk ___ juice?', 'or', 'but', 'because', 'so', 'Or joins two choices.'),
  wgItem('conj', 1, 'Papa ___ Mama are at home.', 'and', 'but', 'so', 'because', 'And joins two people who are doing the same thing.'),
  wgItem('conj', 2, 'I am small ___ I am strong.', 'but', 'because', 'so', 'or', 'But joins two ideas that are different from each other.'),
  wgItem('conj', 2, 'Hakim wore a raincoat ___ it was raining.', 'because', 'but', 'so', 'or', 'Because comes before the reason.'),
  wgItem('conj', 2, 'It was raining, ___ we stayed indoors.', 'so', 'but', 'because', 'or', 'So comes before the result.'),
  wgItem('conj', 2, 'Mei Ling wanted to play, ___ she had to finish her homework first.', 'but', 'so', 'because', 'or', 'But joins two ideas that are different from each other.'),
  wgItem('conj', 2, 'I like durian, ___ my brother does not.', 'but', 'so', 'because', 'or', 'But joins two ideas that are different from each other.'),
  wgItem('conj', 3, 'Arjun was thirsty, ___ he drank some water.', 'so', 'but', 'because', 'or', 'So comes before the result. Drinking is the result of being thirsty.'),
  wgItem('conj', 3, 'Arjun drank some water ___ he was thirsty.', 'because', 'so', 'but', 'or', 'Because comes before the reason. Being thirsty is the reason for drinking.'),
  wgItem('conj', 3, 'The shop was closed, ___ we could not buy bread.', 'so', 'because', 'but', 'or', 'So comes before the result.'),
  wgItem('conj', 3, 'Kai ran fast, ___ he did not win the race.', 'but', 'so', 'because', 'or', 'But shows that the second part is not what we expect.'),
  wgItem('conj', 3, 'Would you like to walk ___ take the bus?', 'or', 'but', 'so', 'because', 'Or joins two choices.'),
  wgItem('conj', 3, 'Xin Yi studied hard, ___ she did well in her spelling test.', 'so', 'but', 'or', 'because', 'So comes before the result.'),
  wgItem('conj', 4, 'We must hurry, ___ we will miss the bus.', 'or', 'and', 'so', 'because', 'Or can warn us what will happen if we do not do something.'),
  wgItem('conj', 4, 'Priya could not sleep ___ the room was too hot.', 'because', 'so', 'but', 'or', 'Because comes before the reason.'),
  wgItem('conj', 4, 'The floor was wet, ___ Ravi walked slowly.', 'so', 'because', 'or', 'but', 'So comes before the result.'),
  wgItem('conj', 4, 'Ah Gong is old, ___ he still cycles every morning.', 'but', 'so', 'because', 'or', 'But shows that the second part is not what we expect.'),
  wgItem('conj', 4, 'Farah put on her cap ___ the sun was very bright.', 'because', 'but', 'or', 'so', 'Because comes before the reason.'),
  wgItem('conj', 4, 'Jun Hao was tired, ___ he finished his homework anyway.', 'but', 'so', 'because', 'or', 'But shows that the second part is not what we expect.'),
  wgItem('conj', 4, 'Devi did not eat the cake ___ she was full.', 'because', 'so', 'or', 'but', 'Because comes before the reason.'),
  wgItem('conj', 5, '___ it was raining, the boys still played football.', 'Although', 'Because', 'So', 'Or', 'Although shows that the second part is not what we expect.'),
  wgItem('conj', 5, 'We will go to the zoo ___ it does not rain tomorrow.', 'if', 'but', 'so', 'or', 'If tells us what must be true for something to happen.'),
  wgItem('conj', 5, 'Wait here ___ I come back.', 'until', 'but', 'or', 'so', 'Until means up to the time that something happens.'),
  wgItem('conj', 5, 'Wash your hands ___ you eat.', 'before', 'but', 'or', 'so', 'Before tells us which action comes first.'),
  wgItem('conj', 5, 'I was reading ___ the lights went out.', 'when', 'so', 'or', 'if', 'When tells us the moment that something happened.'),

  // ---------- Adjectives and comparison ----------
  wgItem('adj', 1, 'An elephant is ___ than a mouse.', 'bigger', 'big', 'biggest', 'more big', 'To compare two things, add -er and use than: bigger than.'),
  wgItem('adj', 1, 'The ___ balloon floated away.', 'red', 'quickly', 'jump', 'softly', 'A describing word goes before the noun. Red describes the balloon.'),
  wgItem('adj', 1, 'Ice is very ___.', 'cold', 'freeze', 'coldly', 'colder', 'After very, use the plain describing word: cold.'),
  wgItem('adj', 1, 'A giraffe is ___ than a goat.', 'taller', 'tall', 'tallest', 'more tall', 'To compare two things, add -er and use than: taller than.'),
  wgItem('adj', 2, 'Hakim is the ___ boy in our class.', 'tallest', 'tall', 'taller', 'most tall', 'To compare three or more, add -est and use the: the tallest.'),
  wgItem('adj', 2, 'This bag is ___ than that one.', 'heavier', 'heavy', 'heaviest', 'heavyer', 'Heavy ends in y, so change the y to i and add -er: heavier.'),
  wgItem('adj', 2, 'Today is ___ than yesterday.', 'hotter', 'hot', 'hottest', 'hoter', 'Hot has a short vowel and ends in one consonant, so double the t: hotter.'),
  wgItem('adj', 2, 'A snail is ___ than a rabbit.', 'slower', 'slow', 'slowest', 'more slow', 'To compare two things, add -er and use than: slower than.'),
  wgItem('adj', 2, 'My kitten has ___ fur.', 'soft', 'softly', 'softness', 'soften', 'A describing word goes before the noun. Soft describes the fur.'),
  wgItem('adj', 3, 'That was the ___ day of my life.', 'happiest', 'happy', 'happier', 'most happy', 'To compare three or more, change the y to i and add -est: the happiest.'),
  wgItem('adj', 3, 'This puzzle is ___ than the last one.', 'easier', 'easy', 'easiest', 'more easy', 'Easy ends in y, so change the y to i and add -er: easier.'),
  wgItem('adj', 3, 'The blue whale is the ___ animal in the world.', 'largest', 'large', 'larger', 'most large', 'To compare three or more, add -est and use the: the largest.'),
  wgItem('adj', 3, 'This book is ___ than that one.', 'more interesting', 'interestinger', 'most interesting', 'interesting', 'Long describing words use more, not -er: more interesting.'),
  wgItem('adj', 4, "My drawing is good, but Siti's drawing is ___.", 'better', 'gooder', 'best', 'more good', 'Good does not take -er. Good, better, best.'),
  wgItem('adj', 4, 'This is the ___ durian I have ever tasted.', 'best', 'better', 'goodest', 'most good', 'Good does not take -est. Good, better, best.'),
  wgItem('adj', 4, 'My cough is ___ today than it was yesterday.', 'worse', 'badder', 'worst', 'more bad', 'Bad does not take -er. Bad, worse, worst.'),
  wgItem('adj', 4, 'The orchid is the ___ flower in the garden.', 'most beautiful', 'beautifullest', 'more beautiful', 'beautifuller', 'Long describing words use most, not -est: the most beautiful.'),
  wgItem('adj', 4, 'Of the three boxes, the green one is the ___.', 'lightest', 'light', 'lighter', 'most light', 'To compare three or more, add -est and use the: the lightest.'),
  wgItem('adj', 4, 'A cheetah runs ___ than a horse.', 'faster', 'fast', 'fastest', 'more fast', 'To compare two things, add -er and use than: faster than.'),
  wgItem('adj', 5, 'Arjun is as ___ as his father.', 'tall', 'taller', 'tallest', 'more tall', 'Between as and as, use the plain describing word: as tall as.'),
  wgItem('adj', 5, 'Monday was the ___ day of the whole week.', 'worst', 'worse', 'baddest', 'most bad', 'Bad does not take -est. Bad, worse, worst.'),
  wgItem('adj', 5, 'The second question was ___ difficult than the first.', 'more', 'most', 'much', 'very', 'To compare two things with a long describing word, use more and than.'),
  wgItem('adj', 5, 'She has ___ stickers than I have.', 'more', 'most', 'many', 'much', 'To compare two amounts, use more and than.'),
  wgItem('adj', 5, 'Ravi is the ___ careful pupil in the class.', 'most', 'more', 'much', 'many', 'To compare three or more with a long describing word, use the most.'),
  wgItem('adj', 5, 'I have ___ money than my brother, so I cannot buy the toy.', 'less', 'least', 'little', 'fewer', 'Use less with things we cannot count, such as money. Fewer is for things we can count.'),

  // ---------- Articles ----------
  wgItem('article', 1, 'I ate ___ apple.', 'an', 'a', 'two', 'many', 'Use an before a vowel sound. Apple begins with a vowel sound.'),
  wgItem('article', 1, 'She has ___ umbrella.', 'an', 'a', 'two', 'many', 'Use an before a vowel sound. Umbrella begins with a vowel sound.'),
  wgItem('article', 1, 'I see ___ dog.', 'a', 'an', 'two', 'many', 'Use a before a consonant sound. Dog begins with a consonant sound.'),
  wgItem('article', 1, 'Papa is reading ___ book.', 'a', 'an', 'many', 'two', 'Use a before a consonant sound. Book begins with a consonant sound.'),
  wgItem('article', 1, 'I need ___ eraser and a ruler.', 'an', 'a', 'two', 'many', 'Use an before a vowel sound. Eraser begins with a vowel sound.'),
  wgItem('article', 2, 'Mei Ling saw ___ owl in the tree.', 'an', 'a', 'two', 'many', 'Use an before a vowel sound. Owl begins with a vowel sound.'),
  wgItem('article', 2, 'Siti has ___ orange pencil case.', 'an', 'a', 'two', 'many', 'Listen to the very next word. Orange begins with a vowel sound, so use an.'),
  wgItem('article', 2, '___ sun rises in the east.', 'The', 'A', 'An', 'Some', 'There is only one sun, so we say the sun.'),
  wgItem('article', 2, 'Please close ___ door behind you.', 'the', 'an', 'many', 'two', 'Use the when both people know which door is meant.'),
  wgItem('article', 2, 'Ah Ma gave me ___ egg tart.', 'an', 'a', 'two', 'many', 'Listen to the very next word. Egg begins with a vowel sound, so use an.'),
  wgItem('article', 3, 'We waited for ___ hour.', 'an', 'a', 'two', 'many', 'The h in hour is silent, so the word begins with a vowel sound. Use an.'),
  wgItem('article', 3, 'I saw a cat. ___ cat was black.', 'The', 'An', 'Two', 'Many', 'Use the when the cat has already been mentioned.'),
  wgItem('article', 3, 'Singapore is ___ island.', 'an', 'a', 'two', 'many', 'Use an before a vowel sound. Island begins with a vowel sound.'),
  wgItem('article', 3, 'Ravi wants to be ___ engineer.', 'an', 'a', 'two', 'many', 'Use an before a vowel sound. Engineer begins with a vowel sound.'),
  wgItem('article', 3, 'Mount Faber is ___ hill, not a mountain.', 'a', 'an', 'two', 'many', 'The h in hill is sounded, so the word begins with a consonant sound. Use a.'),
  wgItem('article', 4, 'He wore ___ uniform.', 'a', 'an', 'two', 'many', 'Uniform begins with a y sound, which is a consonant sound. Use a.'),
  wgItem('article', 4, 'He is ___ honest boy.', 'an', 'a', 'two', 'many', 'The h in honest is silent, so the word begins with a vowel sound. Use an.'),
  wgItem('article', 4, 'Farah plays ___ piano every evening.', 'the', 'an', 'two', 'many', 'We say play the piano. Use the before a musical instrument.'),
  wgItem('article', 4, 'Kai is ___ tallest boy in his class.', 'the', 'a', 'an', 'some', 'Use the before a word such as tallest, biggest or best.'),
  wgItem('article', 4, 'We sat in ___ first row.', 'the', 'a', 'an', 'many', 'Use the before first, second, third and last.'),
  wgItem('article', 5, 'There is ___ MRT station near my home.', 'an', 'a', 'two', 'many', 'We say the letter M as em, which begins with a vowel sound. Use an.'),
  wgItem('article', 5, 'She bought ___ one-dollar notebook.', 'a', 'an', 'two', 'many', 'One begins with a w sound, which is a consonant sound. Use a.'),
  wgItem('article', 5, 'My uncle works at ___ university.', 'a', 'an', 'two', 'many', 'University begins with a y sound, which is a consonant sound. Use a.'),
  wgItem('article', 5, 'What ___ exciting game that was.', 'an', 'a', 'the', 'some', 'Exciting begins with a vowel sound, so use an.'),
  wgItem('article', 5, 'It took half ___ hour to reach Changi.', 'an', 'a', 'two', 'many', 'The h in hour is silent, so we say half an hour.'),

  // ---------- Question words ----------
  wgItem('qword', 1, '___ is your name? My name is Siti.', 'What', 'Where', 'When', 'Why', 'What asks about a thing. The reply gives a name.'),
  wgItem('qword', 1, '___ do you live? I live in Bedok.', 'Where', 'What', 'When', 'Who', 'Where asks about a place. The reply gives a place.'),
  wgItem('qword', 1, '___ is that boy? He is my cousin.', 'Who', 'Where', 'When', 'Why', 'Who asks about a person. The reply tells us who he is.'),
  wgItem('qword', 1, '___ is your birthday? It is in May.', 'When', 'Who', 'Why', 'Where', 'When asks about a time. The reply gives a month.'),
  wgItem('qword', 2, '___ are you crying? I lost my pencil case.', 'Why', 'When', 'Where', 'Who', 'Why asks for a reason. The reply gives a reason.'),
  wgItem('qword', 2, '___ do you go to school? I go by bus.', 'How', 'When', 'Where', 'Who', 'How asks about the way something is done. The reply gives the way.'),
  wgItem('qword', 2, '___ old are you? I am seven.', 'How', 'What', 'When', 'Who', 'We ask how old to find out an age.'),
  wgItem('qword', 2, '___ is in the box? There is a toy car in it.', 'What', 'When', 'Why', 'Where', 'What asks about a thing. The reply names a thing.'),
  wgItem('qword', 2, '___ did you put my book? I put it on your desk.', 'Where', 'When', 'Why', 'Who', 'Where asks about a place. The reply gives a place.'),
  wgItem('qword', 3, "___ bag is this? It is Hakim's bag.", 'Whose', 'Who', 'When', 'Where', 'Whose asks who something belongs to.'),
  wgItem('qword', 3, '___ one do you want, the red cap or the blue cap?', 'Which', 'Who', 'When', 'Where', 'Which asks someone to choose from a small set.'),
  wgItem('qword', 3, '___ many marbles do you have? I have twelve.', 'How', 'What', 'Which', 'Who', 'We ask how many to find out a number.'),
  wgItem('qword', 3, "___ did the film start? It started at two o'clock.", 'When', 'Where', 'Why', 'Who', 'When asks about a time. The reply gives a time.'),
  wgItem('qword', 3, '___ did Mei Ling stay at home? She had a fever.', 'Why', 'When', 'Where', 'Who', 'Why asks for a reason. The reply gives a reason.'),
  wgItem('qword', 4, '___ much is this notebook? It costs two dollars.', 'How', 'What', 'Which', 'When', 'We ask how much to find out a price.'),
  wgItem('qword', 4, '___ long does the bus ride take? It takes ten minutes.', 'How', 'When', 'What', 'Which', 'We ask how long to find out a length of time.'),
  wgItem('qword', 4, '___ of these pencils is yours? The short one is mine.', 'Which', 'Who', 'Whose', 'When', 'Which asks someone to choose from a small set.'),
  wgItem('qword', 4, '___ pencil is longer, yours or mine?', 'Which', 'Who', 'When', 'Why', 'Which asks someone to choose between the two.'),
  wgItem('qword', 4, '___ gave you this card? Aunty Rosnah gave it to me.', 'Who', 'Whose', 'Which', 'When', 'Who asks about a person. The reply names a person.'),
  wgItem('qword', 4, '___ does this word mean? It means very big.', 'What', 'How', 'Why', 'Who', 'We ask what a word means.'),
  wgItem('qword', 5, '___ often do you visit your grandparents? We visit them every week.', 'How', 'When', 'What', 'Which', 'We ask how often to find out how many times something happens.'),
  wgItem('qword', 5, '___ far is the park from here? It is about one kilometre away.', 'How', 'Where', 'What', 'Which', 'We ask how far to find out a distance.'),
  wgItem('qword', 5, '___ did you go to the market with? I went with my mother.', 'Who', 'Whose', 'Which', 'When', 'Who asks about a person. The reply names a person.'),
  wgItem('qword', 5, "___ shoes are these by the door? They are Papa's.", 'Whose', 'Who', "Who's", 'Whom', "Whose asks who something belongs to. Who's means who is."),
  wgItem('qword', 5, '___ does your new teacher look like? She is tall and wears glasses.', 'What', 'How', 'Who', 'Which', 'We ask what someone looks like, not how someone looks like.'),
  wgItem('qword', 5, '___ is the weather today? It is hot and sunny.', 'How', 'Who', 'Whose', 'Which', 'How asks what something is like. The reply describes the weather.'),

  // ---------- Contractions ----------
  wgItem('contraction', 2, '<b>I am</b> hungry.', "I'm", 'Im', "I'am", "Ia'm", 'The apostrophe takes the place of the letter a in am.'),
  wgItem('contraction', 2, '<b>It is</b> raining.', "It's", 'Its', "Its'", "It'is", 'The apostrophe takes the place of the letter i in is.'),
  wgItem('contraction', 2, '<b>Do not</b> run in the corridor.', "Don't", 'Dont', "Do'nt", "Dont'", 'The apostrophe takes the place of the letter o in not.'),
  wgItem('contraction', 2, 'She <b>is not</b> at home.', "isn't", 'isnt', "is'nt", "isnt'", 'The apostrophe takes the place of the letter o in not.'),
  wgItem('contraction', 2, '<b>We are</b> going to the zoo.', "We're", 'Were', "Wer'e", "We'are", 'The apostrophe takes the place of the letter a in are.'),
  wgItem('contraction', 3, 'I <b>cannot</b> find my socks.', "can't", 'cant', "ca'nt", "cann't", 'The apostrophe takes the place of the letters n and o in cannot.'),
  wgItem('contraction', 3, '<b>He is</b> my brother.', "He's", 'Hes', 'His', "He'is", "The apostrophe takes the place of the letter i in is. His shows belonging."),
  wgItem('contraction', 3, '<b>They are</b> late.', "They're", 'Their', 'There', 'Theyre', "They're means they are. Their shows belonging and there names a place."),
  wgItem('contraction', 3, 'I <b>did not</b> see the sign.', "didn't", 'didnt', "did'nt", "din't", 'The apostrophe takes the place of the letter o in not.'),
  wgItem('contraction', 3, '<b>You are</b> my best friend.', "You're", 'Your', 'Youre', "You'r", "You're means you are. Your shows belonging."),
  wgItem('contraction', 3, '<b>That is</b> my pencil.', "That's", 'Thats', "That'is", "Thats'", 'The apostrophe takes the place of the letter i in is.'),
  wgItem('contraction', 3, "<b>I'll</b> help you carry the bags.", 'I will', 'I all', 'I still', 'I ill', "In I'll, the apostrophe takes the place of the letters w and i in will.", 'Choose the full form of the word in bold.'),
  wgItem('contraction', 4, 'I <b>will not</b> be late again.', "won't", "willn't", 'wont', "wo'nt", "Will not has a special short form: won't."),
  wgItem('contraction', 4, "<b>She's</b> reading a book.", 'She is', 'She has', 'She was', 'She does', "Before a verb ending in -ing, she's means she is.", 'Choose the full form of the word in bold.'),
  wgItem('contraction', 4, '___ very hot today.', "It's", 'Its', "Its'", 'It', "It's, with an apostrophe, means it is.", 'Choose the correct word.'),
  wgItem('contraction', 4, '___ book is on the floor.', 'Your', "You're", 'Youre', "Your's", "Your shows that the book belongs to you. You're means you are.", 'Choose the correct word.'),
  wgItem('contraction', 4, 'We <b>have not</b> eaten yet.', "haven't", 'havent', "have'nt", "hasn't", "The apostrophe takes the place of the letter o in not. Hasn't means has not."),
  wgItem('contraction', 4, 'He <b>does not</b> like carrots.', "doesn't", 'doesnt', "does'nt", "don't", "The apostrophe takes the place of the letter o in not. Don't means do not."),
  wgItem('contraction', 4, '<b>There is</b> a gecko on the wall.', "There's", 'Theres', "Their's", "There'is", 'The apostrophe takes the place of the letter i in is.'),
  wgItem('contraction', 5, 'You <b>should not</b> talk with your mouth full.', "shouldn't", 'shouldnt', "should'nt", "shoudn't", 'Keep all of should, then let the apostrophe take the place of the o in not.'),
  wgItem('contraction', 5, "<b>They've</b> finished their work.", 'They have', 'They are', 'They will', 'They is', "In they've, the apostrophe takes the place of the letters h and a in have.", 'Choose the full form of the word in bold.'),
  wgItem('contraction', 5, "The door <b>won't</b> open.", 'will not', 'would not', 'want not', 'was not', "Won't is the short form of will not.", 'Choose the full form of the word in bold.'),
  wgItem('contraction', 5, '___ going to win the race?', "Who's", 'Whose', 'Whos', "Who'is", "Who's means who is. Whose asks who something belongs to.", 'Choose the correct word.'),
  wgItem('contraction', 5, 'The children left ___ bags in the hall.', 'their', "they're", 'there', 'theyre', "Their shows that the bags belong to them. They're means they are.", 'Choose the correct word.'),
  wgItem('contraction', 5, '<b>Let us</b> go to the playground.', "Let's", 'Lets', "Let'us", "Lets'", 'The apostrophe takes the place of the letter u in us.'),
  wgItem('contraction', 5, '<b>I would</b> like some water, please.', "I'd", 'Id', "I'ld", "I'wd", 'The apostrophe takes the place of the letters w, o, u and l in would.')
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
