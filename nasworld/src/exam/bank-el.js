// ============================================================
//  EXAM PREP — English (P1 end of year)
// ============================================================
//
//  Hand-written, because language cannot be computed. Each multiple-
//  choice item has been written so that exactly one option is correct
//  IN CONTEXT, and every other option is wrong, not merely less likely.
//
//  That rule shapes the distractors more than anything else:
//    - "My father ___ to work every day" never offers "went". "My father
//      went to work every day" is perfectly good English (a past habit),
//      so a thoughtful child would be marked wrong for being right.
//    - "Look at ___ birds" offers "those" but never "these" as well.
//    - "The opposite of loud" offers "quiet" but never "soft" too.
//    - A pronoun item always says who someone is ("my brother Ben"), so
//      the answer never rests on guessing from a name.
//
//  British spelling throughout (colour, favourite, aeroplane), and
//  Singapore settings (void deck, canteen, recess, Tampines).
//
//  Scope is the P1 core: a/an, plurals, am/is/are, was/were, has/have,
//  simple present and past, present continuous, pronouns, possessives,
//  this/these, prepositions of place and time, and/but/or/because/so,
//  question words, capital letters and end punctuation. Items marked
//  level 3 (an hour, its, commas in a list, leaves, sheep) are stretch,
//  and labelled "Stretch" on screen.
// ============================================================

var EL_ITEMS = [];

function elAdd(section, list) {
  list.forEach(function (it) {
    // Writing a plural is a spelling: the word must not be printed
    // elsewhere on the same paper (see examGiveaways).
    var spell = it.skill === 'plural-spell';
    EL_ITEMS.push(Object.assign({ section: section, level: 1, type: 'mcq' }, spell ? { spell: true } : {}, it, { id: 'el-' + it.id }));
  });
}

// ---- GRAMMAR -----------------------------------------------------------------

var EL_AAN = ['a', 'an', 'two', 'many'];
var EL_AAN_WHY = {
  two: 'Two means more than one, but the word after the gap is about one thing.',
  many: 'Many means more than one, but the word after the gap is about one thing.'
};
function elAn(id, prompt, answer, word, level) {
  var why = Object.assign({}, EL_AAN_WHY);
  if (answer === 'an') why.a = 'We use **a** before a word that starts with a consonant sound, like **a dog**. **' + word + '** starts with a vowel sound.';
  else why.an = 'We use **an** before a word that starts with a vowel sound, like **an egg**. **' + word + '** starts with a consonant sound.';
  return { id: id, skill: 'article', prompt: prompt, options: EL_AAN, answer: answer, why: why, level: level || 1,
    explain: answer === 'an'
      ? 'The word after the gap is **' + word + '**, which starts with a vowel sound (a, e, i, o, u). So we use **an**.'
      : 'The word after the gap is **' + word + '**, which starts with a consonant sound. So we use **a**.' };
}

elAdd('grammar', [
  elAn('gr-art-1', 'I saw ___ elephant at the zoo.', 'an', 'elephant'),
  elAn('gr-art-2', 'Mum bought ___ umbrella for me.', 'an', 'umbrella'),
  elAn('gr-art-3', 'There is ___ owl in the tree.', 'an', 'owl'),
  elAn('gr-art-4', 'Mei has ___ new bicycle.', 'a', 'new'),
  elAn('gr-art-5', 'Ali ate ___ egg for breakfast.', 'an', 'egg'),
  elAn('gr-art-6', 'Grandma has ___ big garden.', 'a', 'big'),
  elAn('gr-art-7', 'It is ___ old house.', 'an', 'old'),
  elAn('gr-art-8', 'Ravi drew ___ picture of a cat.', 'a', 'picture'),
  { id: 'gr-art-9', skill: 'article', level: 3, prompt: 'We waited for ___ hour.', options: EL_AAN, answer: 'an',
    explain: 'In **hour**, the h is silent, so the word starts with a vowel sound. We say **an hour**.',
    why: { a: 'The h in hour is silent, so hour starts with a vowel sound and takes **an**.' } },

  { id: 'gr-pl-1', skill: 'plural', prompt: 'There are three ___ on the shelf.', options: ['books', 'book', 'a book', 'the book'], answer: 'books',
    explain: '**Three** means more than one, so we need the plural: **books**.' },
  { id: 'gr-pl-2', skill: 'plural', prompt: 'The ___ are playing in the field.', options: ['children', 'child', 'a child', 'the child'], answer: 'children',
    explain: '**Are** tells us there is more than one. The plural of **child** is **children**.' },
  { id: 'gr-pl-3', skill: 'plural', prompt: 'Mum put four ___ on the table.', options: ['boxes', 'box', 'a box', 'the box'], answer: 'boxes',
    explain: '**Four** means more than one. Words ending in **x** add **es**: box, **boxes**.' },

  { id: 'gr-plt-1', skill: 'plural-spell', type: 'word', prompt: 'Write the plural.\nOne **fox**, two ___.', answer: 'foxes',
    explain: 'Words ending in **x** add **es**: fox, **foxes**.' },
  { id: 'gr-plt-2', skill: 'plural-spell', type: 'word', prompt: 'Write the plural.\nOne **mouse**, three ___.', answer: 'mice',
    explain: '**Mouse** does not add s. Its plural is **mice**.' },
  { id: 'gr-plt-3', skill: 'plural-spell', type: 'word', prompt: 'Write the plural.\nOne **foot**, two ___.', answer: 'feet',
    explain: '**Foot** does not add s. Its plural is **feet**.' },
  { id: 'gr-plt-4', skill: 'plural-spell', type: 'word', prompt: 'Write the plural.\nOne **tooth**, many ___.', answer: 'teeth',
    explain: '**Tooth** does not add s. Its plural is **teeth**.' },
  { id: 'gr-plt-5', skill: 'plural-spell', type: 'word', prompt: 'Write the plural.\nOne **man**, two ___.', answer: 'men',
    explain: '**Man** does not add s. Its plural is **men**.' },
  { id: 'gr-plt-6', skill: 'plural-spell', type: 'word', prompt: 'Write the plural.\nOne **bus**, two ___.', answer: 'buses',
    explain: 'Words ending in **s** add **es**: bus, **buses**.' },
  { id: 'gr-plt-7', skill: 'plural-spell', type: 'word', level: 2, prompt: 'Write the plural.\nOne **baby**, two ___.', answer: 'babies',
    explain: 'When a word ends in a consonant and then **y**, change the y to **i** and add **es**: baby, **babies**.' },
  { id: 'gr-plt-8', skill: 'plural-spell', type: 'word', prompt: 'Write the plural.\nOne **watch**, two ___.', answer: 'watches',
    explain: 'Words ending in **ch** add **es**: watch, **watches**.' },
  { id: 'gr-plt-9', skill: 'plural-spell', type: 'word', prompt: 'Write the plural.\nOne **child**, two ___.', answer: 'children',
    explain: '**Child** does not add s. Its plural is **children**.' },
  { id: 'gr-plt-10', skill: 'plural-spell', type: 'word', level: 3, prompt: 'Write the plural.\nOne **leaf**, many ___.', answer: 'leaves',
    explain: 'Some words ending in **f** change the f to **v** and add **es**: leaf, **leaves**.' },
  { id: 'gr-plt-11', skill: 'plural-spell', type: 'word', level: 3, prompt: 'Write the plural.\nOne **sheep**, ten ___.', answer: 'sheep',
    explain: 'A few words stay the same: one **sheep**, ten **sheep**.' },

  { id: 'gr-be-1', skill: 'be-present', prompt: 'I ___ six years old.', options: ['am', 'is', 'are', 'be'], answer: 'am',
    explain: 'We always say **I am**.' },
  { id: 'gr-be-2', skill: 'be-present', prompt: 'My sister ___ in Primary 3.', options: ['am', 'is', 'are', 'be'], answer: 'is',
    explain: '**My sister** is one person, so we use **is**.' },
  { id: 'gr-be-3', skill: 'be-present', prompt: 'Ben and Ravi ___ good friends.', options: ['am', 'is', 'are', 'be'], answer: 'are',
    explain: '**Ben and Ravi** are two people, so we use **are**.' },
  { id: 'gr-be-4', skill: 'be-present', prompt: 'The flowers ___ very pretty.', options: ['am', 'is', 'are', 'be'], answer: 'are',
    explain: '**The flowers** is more than one, so we use **are**.' },
  { id: 'gr-be-5', skill: 'be-present', prompt: 'You ___ my best friend.', options: ['am', 'is', 'are', 'be'], answer: 'are',
    explain: 'We always say **you are**, even when we mean one person.' },
  { id: 'gr-be-6', skill: 'be-present', prompt: 'It ___ a sunny day today.', options: ['am', 'is', 'are', 'be'], answer: 'is',
    explain: '**It** is one thing, and **today** is now, so we use **is**.' },
  { id: 'gr-be-7', skill: 'be-present', prompt: 'We ___ in the same class.', options: ['am', 'is', 'are', 'be'], answer: 'are',
    explain: 'We always say **we are**.' },

  { id: 'gr-was-1', skill: 'be-past', prompt: 'Yesterday, it ___ very hot.', options: ['was', 'were', 'is', 'are'], answer: 'was',
    explain: '**Yesterday** is in the past, and **it** is one thing, so we use **was**.' },
  { id: 'gr-was-2', skill: 'be-past', prompt: 'The children ___ at the beach last Sunday.', options: ['was', 'were', 'is', 'are'], answer: 'were',
    explain: '**Last Sunday** is in the past, and **the children** is more than one, so we use **were**.' },
  { id: 'gr-was-3', skill: 'be-past', prompt: 'Last night, I ___ very tired.', options: ['was', 'were', 'am', 'are'], answer: 'was',
    explain: 'In the past, we say **I was**.' },
  { id: 'gr-was-4', skill: 'be-past', prompt: 'My friends ___ at my party yesterday.', options: ['was', 'were', 'is', 'are'], answer: 'were',
    explain: '**Yesterday** is in the past, and **my friends** is more than one, so we use **were**.' },
  { id: 'gr-was-5', skill: 'be-past', prompt: 'The shop ___ closed last Monday.', options: ['was', 'were', 'is', 'are'], answer: 'was',
    explain: '**Last Monday** is in the past, and **the shop** is one thing, so we use **was**.' },

  { id: 'gr-has-1', skill: 'has-have', prompt: 'Tom ___ a red bicycle.', options: ['has', 'have', 'having', 'are'], answer: 'has',
    explain: 'For one person or thing, like **Tom**, we use **has**.' },
  { id: 'gr-has-2', skill: 'has-have', prompt: 'I ___ two pet fish.', options: ['has', 'have', 'is', 'having'], answer: 'have',
    explain: 'With **I**, **you**, **we** and **they**, we use **have**.' },
  { id: 'gr-has-3', skill: 'has-have', prompt: 'The cat ___ a long tail.', options: ['has', 'have', 'having', 'are'], answer: 'has',
    explain: '**The cat** is one animal, so we use **has**.' },
  { id: 'gr-has-4', skill: 'has-have', prompt: 'We ___ art lessons on Fridays.', options: ['has', 'have', 'is', 'having'], answer: 'have',
    explain: 'With **we**, we use **have**.' },
  { id: 'gr-has-5', skill: 'has-have', prompt: 'My grandparents ___ a big garden.', options: ['has', 'have', 'is', 'having'], answer: 'have',
    explain: '**My grandparents** is more than one person, so we use **have**.' },

  { id: 'gr-sva-1', skill: 'present', prompt: 'My father ___ to work by bus every day.', options: ['go', 'goes', 'going', 'gone'], answer: 'goes',
    explain: '**Every day** means it happens again and again. For one person, like **my father**, the action word adds **s** or **es**: **goes**.',
    why: { going: 'We would need **is going**, and that means right now, not every day.', gone: 'We would need **has gone**.' } },
  { id: 'gr-sva-2', skill: 'present', prompt: 'Birds ___ in the sky.', options: ['fly', 'flies', 'flying', 'flown'], answer: 'fly',
    explain: '**Birds** is more than one, so the action word does not add s: **fly**.' },
  { id: 'gr-sva-3', skill: 'present', prompt: 'Mei ___ her teeth every morning.', options: ['brush', 'brushes', 'brushing', 'to brush'], answer: 'brushes',
    explain: '**Every morning** means it happens again and again. For one person, the action word adds **es** after **sh**: **brushes**.' },
  { id: 'gr-sva-4', skill: 'present', prompt: 'The sun ___ in the east.', options: ['rise', 'rises', 'rising', 'to rise'], answer: 'rises',
    explain: 'This is always true. For one thing, like **the sun**, the action word adds **s**: **rises**.' },
  { id: 'gr-sva-5', skill: 'present', prompt: 'My brothers ___ football after school.', options: ['play', 'plays', 'playing', 'to play'], answer: 'play',
    explain: '**My brothers** is more than one person, so the action word does not add s: **play**.' },
  { id: 'gr-sva-6', skill: 'present', prompt: 'Ali ___ the plants every evening.', options: ['water', 'waters', 'watering', 'to water'], answer: 'waters',
    explain: 'For one person, like **Ali**, the action word adds **s**: **waters**.' },
  { id: 'gr-sva-7', skill: 'present', prompt: 'They ___ milk every morning.', options: ['drink', 'drinks', 'drinking', 'to drink'], answer: 'drink',
    explain: 'With **they**, the action word does not add s: **drink**.' },

  { id: 'gr-past-1', skill: 'past', prompt: 'Last Sunday, we ___ to the zoo.', options: ['go', 'goes', 'went', 'going'], answer: 'went',
    explain: '**Last Sunday** is in the past. The past of **go** is **went**.' },
  { id: 'gr-past-2', skill: 'past', prompt: 'Yesterday, Mum ___ a chocolate cake.', options: ['bake', 'bakes', 'baked', 'baking'], answer: 'baked',
    explain: '**Yesterday** is in the past. Many action words add **ed**: bake, **baked**.' },
  { id: 'gr-past-3', skill: 'past', prompt: 'Last night, I ___ a funny dream.', options: ['have', 'has', 'had', 'having'], answer: 'had',
    explain: '**Last night** is in the past. The past of **have** is **had**.' },
  { id: 'gr-past-4', skill: 'past', prompt: 'The boy ___ the ball over the fence yesterday.', options: ['kick', 'kicks', 'kicked', 'kicking'], answer: 'kicked',
    explain: '**Yesterday** is in the past: kick, **kicked**.' },
  { id: 'gr-past-5', skill: 'past', prompt: 'Ravi ___ a kite in the park last Saturday.', options: ['fly', 'flies', 'flew', 'flying'], answer: 'flew',
    explain: '**Last Saturday** is in the past. The past of **fly** is **flew**.' },
  { id: 'gr-past-6', skill: 'past', prompt: 'We ___ ice cream after dinner yesterday.', options: ['eat', 'eats', 'ate', 'eating'], answer: 'ate',
    explain: '**Yesterday** is in the past. The past of **eat** is **ate**.' },
  { id: 'gr-past-7', skill: 'past', prompt: 'Mei ___ a letter to Grandma last week.', options: ['write', 'writes', 'wrote', 'writing'], answer: 'wrote',
    explain: '**Last week** is in the past. The past of **write** is **wrote**.' },
  { id: 'gr-past-8', skill: 'past', prompt: 'Last week, Dad ___ me a new storybook.', options: ['buy', 'buys', 'bought', 'buying'], answer: 'bought',
    explain: '**Last week** is in the past. The past of **buy** is **bought**.' },
  { id: 'gr-past-9', skill: 'past', prompt: 'Yesterday, the baby ___ for a long time.', options: ['cry', 'cries', 'cried', 'crying'], answer: 'cried',
    explain: '**Yesterday** is in the past. For **cry**, change the y to i and add **ed**: **cried**.' },

  { id: 'gr-cont-1', skill: 'continuous', prompt: 'Look! The baby ___.', options: ['is sleeping', 'are sleeping', 'slept', 'sleep'], answer: 'is sleeping',
    explain: '**Look!** tells us it is happening right now. One baby, so **is sleeping**.' },
  { id: 'gr-cont-2', skill: 'continuous', prompt: 'Listen! The birds ___.', options: ['are singing', 'is singing', 'sang', 'singing'], answer: 'are singing',
    explain: '**Listen!** tells us it is happening right now. More than one bird, so **are singing**.' },
  { id: 'gr-cont-3', skill: 'continuous', prompt: 'Be quiet! Grandpa ___ a nap now.', options: ['is taking', 'are taking', 'took', 'take'], answer: 'is taking',
    explain: '**Now** tells us it is happening at this moment. One person, so **is taking**.' },
  { id: 'gr-cont-4', skill: 'continuous', prompt: 'Right now, we ___ our lunch.', options: ['are eating', 'is eating', 'ate', 'eats'], answer: 'are eating',
    explain: '**Right now** tells us it is happening at this moment. With **we**, use **are eating**.' },
  { id: 'gr-cont-5', skill: 'continuous', prompt: 'Look! Ali ___ up the tree.', options: ['is climbing', 'are climbing', 'climbed', 'climb'], answer: 'is climbing',
    explain: '**Look!** tells us it is happening now. One person, so **is climbing**.' },

  { id: 'gr-ps-1', skill: 'pronoun', prompt: 'My brother Ben is nine. ___ likes football.', options: ['He', 'She', 'It', 'They'], answer: 'He',
    explain: '**My brother Ben** is a boy, so we use **He**.' },
  { id: 'gr-ps-2', skill: 'pronoun', prompt: 'My sister Mei is kind. ___ helps me with my homework.', options: ['She', 'He', 'It', 'They'], answer: 'She',
    explain: '**My sister Mei** is a girl, so we use **She**.' },
  { id: 'gr-ps-3', skill: 'pronoun', prompt: 'Ravi and I are friends. ___ play together every day.', options: ['We', 'They', 'He', 'She'], answer: 'We',
    explain: '**Ravi and I** includes me, so we use **We**.' },
  { id: 'gr-ps-4', skill: 'pronoun', prompt: 'This table is broken. ___ has only three legs.', options: ['It', 'He', 'She', 'They'], answer: 'It',
    explain: 'A table is a thing, so we use **It**.' },
  { id: 'gr-ps-5', skill: 'pronoun', prompt: 'The children are in the hall. ___ are singing a song.', options: ['They', 'He', 'She', 'It'], answer: 'They',
    explain: '**The children** is more than one person, so we use **They**.' },
  { id: 'gr-po-1', skill: 'pronoun', prompt: 'Grandma gave ___ a big hug.', options: ['me', 'I', 'my', 'mine'], answer: 'me',
    explain: 'After an action word like **gave**, we use **me**, not I.' },
  { id: 'gr-po-2', skill: 'pronoun', prompt: 'Our uncle visited ___ last Sunday.', options: ['us', 'we', 'our', 'ours'], answer: 'us',
    explain: 'After an action word like **visited**, we use **us**, not we.' },
  { id: 'gr-po-3', skill: 'pronoun', prompt: 'This present is for my mother. I will give it to ___.', options: ['her', 'she', 'hers', 'his'], answer: 'her',
    explain: 'My mother is a woman, and after **to** we use **her**.' },
  { id: 'gr-po-4', skill: 'pronoun', prompt: 'Those are my friends. I play with ___ every day.', options: ['them', 'they', 'their', 'theirs'], answer: 'them',
    explain: 'After **with**, we use **them**, not they.' },
  { id: 'gr-po-5', skill: 'pronoun', prompt: 'My father is tall. I have to look up at ___.', options: ['him', 'he', 'his', 'her'], answer: 'him',
    explain: 'My father is a man, and after **at** we use **him**.' },

  { id: 'gr-pos-1', skill: 'possessive', prompt: 'My sister has a new bag. ___ bag is blue.', options: ['Her', 'She', 'Hers', 'His'], answer: 'Her',
    explain: 'The bag belongs to my sister, so it is **her** bag.' },
  { id: 'gr-pos-2', skill: 'possessive', prompt: 'Ben and Ali have a dog. ___ dog is called Max.', options: ['Their', 'They', 'Them', 'Theirs'], answer: 'Their',
    explain: 'The dog belongs to Ben and Ali, so it is **their** dog.' },
  { id: 'gr-pos-3', skill: 'possessive', prompt: 'I love ___ new shoes.', options: ['my', 'me', 'I', 'mine'], answer: 'my',
    explain: 'The shoes belong to me, so they are **my** shoes.' },
  { id: 'gr-pos-4', skill: 'possessive', prompt: 'We cleaned ___ classroom.', options: ['our', 'us', 'we', 'ours'], answer: 'our',
    explain: 'The classroom belongs to us, so it is **our** classroom.' },
  { id: 'gr-pos-5', skill: 'possessive', prompt: 'My brother lost ___ cap.', options: ['his', 'he', 'him', 'her'], answer: 'his',
    explain: 'The cap belongs to my brother, so it is **his** cap.' },
  { id: 'gr-pos-6', skill: 'possessive', level: 3, prompt: 'The bird is building ___ nest.', options: ['its', 'it', "it's", 'they'], answer: 'its',
    explain: '**Its** (no apostrophe) means belonging to it. **It\'s** is short for **it is**.',
    why: { "it's": "**It's** means **it is**: \"The bird is building it is nest\" does not make sense." } },

  { id: 'gr-dem-1', skill: 'this-these', prompt: '___ apples are very sweet.', options: ['These', 'This', 'That', 'A'], answer: 'These',
    explain: '**Apples** is more than one, so we use **these**. **This** and **that** are for one thing.' },
  { id: 'gr-dem-2', skill: 'this-these', prompt: '___ is my school bag.', options: ['This', 'These', 'Those', 'They'], answer: 'This',
    explain: 'One bag, so we use **this**. **These** and **those** are for more than one.' },
  { id: 'gr-dem-3', skill: 'this-these', prompt: 'Look at ___ birds in the sky!', options: ['those', 'that', 'this', 'a'], answer: 'those',
    explain: '**Birds** is more than one, so we use **those**.' },
  { id: 'gr-dem-4', skill: 'this-these', prompt: '___ shoes are too small for me.', options: ['These', 'This', 'That', 'A'], answer: 'These',
    explain: '**Shoes** is more than one, so we use **these**.' },

  { id: 'gr-pp-1', skill: 'prep-place', order: 'keep', prompt: 'Look at the picture. The cat is ___.', visual: { kind: 'scene', relation: 'on', who: '🐱' },
    options: ['on the table', 'under the table', 'next to the table'], answer: 'on the table', explain: 'The cat is sitting on top of the table: **on** the table.' },
  { id: 'gr-pp-2', skill: 'prep-place', order: 'keep', prompt: 'Look at the picture. The dog is ___.', visual: { kind: 'scene', relation: 'under', who: '🐶' },
    options: ['on the table', 'under the table', 'next to the table'], answer: 'under the table', explain: 'The table is above the dog: the dog is **under** the table.' },
  { id: 'gr-pp-3', skill: 'prep-place', order: 'keep', prompt: 'Look at the picture. The rabbit is ___.', visual: { kind: 'scene', relation: 'next to', who: '🐰' },
    options: ['on the table', 'under the table', 'next to the table'], answer: 'next to the table', explain: 'The rabbit is at the side of the table: **next to** the table.' },
  { id: 'gr-pp-4', skill: 'prep-place', order: 'keep', prompt: 'Look at the picture. The cat is ___.', visual: { kind: 'scene', relation: 'in', who: '🐱' },
    options: ['in the box', 'on the box', 'under the box'], answer: 'in the box', explain: 'The cat is inside the box: **in** the box.' },
  { id: 'gr-pp-5', skill: 'prep-place', order: 'keep', prompt: 'Look at the picture. The dog is ___.', visual: { kind: 'scene', relation: 'between', who: '🐶' },
    options: ['between the boxes', 'on the boxes', 'in the boxes'], answer: 'between the boxes', explain: 'There is a box on each side of the dog: the dog is **between** the boxes.' },

  { id: 'gr-pt-1', skill: 'prep-time', prompt: 'My birthday is ___ June.', options: ['in', 'on', 'at', 'to'], answer: 'in',
    explain: 'We use **in** for months: **in** June.' },
  { id: 'gr-pt-2', skill: 'prep-time', prompt: 'We have swimming lessons ___ Saturday.', options: ['on', 'in', 'at', 'to'], answer: 'on',
    explain: 'We use **on** for days: **on** Saturday.' },
  { id: 'gr-pt-3', skill: 'prep-time', prompt: 'School starts ___ 7.30 am.', options: ['at', 'on', 'in', 'to'], answer: 'at',
    explain: 'We use **at** for a time on the clock: **at** 7.30 am.' },
  { id: 'gr-pt-4', skill: 'prep-time', prompt: 'We visit our grandparents ___ Sundays.', options: ['on', 'in', 'at', 'to'], answer: 'on',
    explain: 'We use **on** for days: **on** Sundays.' },
  { id: 'gr-pt-5', skill: 'prep-time', prompt: 'It is very hot ___ the afternoon.', options: ['in', 'on', 'at', 'to'], answer: 'in',
    explain: 'We say **in** the morning, **in** the afternoon and **in** the evening.' },
  { id: 'gr-pt-6', skill: 'prep-time', prompt: 'I go to bed ___ 9 o\'clock.', options: ['at', 'on', 'in', 'to'], answer: 'at',
    explain: 'We use **at** for a time on the clock: **at** 9 o\'clock.' },

  { id: 'gr-conj-1', skill: 'joining', prompt: 'I like apples ___ I do not like pears.', options: ['but', 'because', 'or', 'so'], answer: 'but',
    explain: '**But** joins two ideas that are different: I like apples, **but** I do not like pears.' },
  { id: 'gr-conj-2', skill: 'joining', prompt: 'The puppy was wet ___ it was raining.', options: ['because', 'but', 'or', 'so'], answer: 'because',
    explain: '**Because** tells us why: the rain is the reason the puppy was wet.',
    why: { so: '**So** would mean the puppy being wet made it rain, which is the wrong way round.' } },
  { id: 'gr-conj-3', skill: 'joining', prompt: 'Do you want milk ___ juice?', options: ['or', 'but', 'because', 'so'], answer: 'or',
    explain: '**Or** gives a choice: milk **or** juice.' },
  { id: 'gr-conj-4', skill: 'joining', prompt: 'I have a cat ___ a dog.', options: ['and', 'because', 'so', 'but'], answer: 'and',
    explain: '**And** joins two things that go together: a cat **and** a dog.' },
  { id: 'gr-conj-5', skill: 'joining', prompt: 'It was raining, ___ we stayed at home.', options: ['so', 'but', 'or', 'because'], answer: 'so',
    explain: '**So** tells us what happened because of something: it rained, **so** we stayed at home.',
    why: { because: '**Because** would mean staying at home made it rain, which is the wrong way round.' } },
  { id: 'gr-conj-6', skill: 'joining', prompt: 'We wanted to go swimming ___ it started to rain.', options: ['but', 'because', 'so', 'or'], answer: 'but',
    explain: '**But** shows something went against what we wanted: we wanted to swim, **but** it rained.' },

  { id: 'gr-qw-1', skill: 'question-word', prompt: 'Question: ___ is your name?\nAnswer: My name is Mei.', options: ['What', 'Who', 'Where', 'When'], answer: 'What',
    explain: 'We ask **What** to find out a thing, like a name.' },
  { id: 'gr-qw-2', skill: 'question-word', prompt: 'Question: ___ do you live?\nAnswer: I live in Tampines.', options: ['Where', 'What', 'Who', 'When'], answer: 'Where',
    explain: 'The answer is a place, so we ask **Where**.' },
  { id: 'gr-qw-3', skill: 'question-word', prompt: 'Question: ___ is your birthday?\nAnswer: It is on 5 May.', options: ['When', 'Where', 'Who', 'Why'], answer: 'When',
    explain: 'The answer is a date, so we ask **When**.' },
  { id: 'gr-qw-4', skill: 'question-word', prompt: 'Question: ___ is that man?\nAnswer: He is my uncle.', options: ['Who', 'What', 'Where', 'When'], answer: 'Who',
    explain: 'The answer tells us which person, so we ask **Who**.' },
  { id: 'gr-qw-5', skill: 'question-word', prompt: 'Question: ___ are you crying?\nAnswer: I fell down and hurt my knee.', options: ['Why', 'What', 'Who', 'Where'], answer: 'Why',
    explain: 'The answer gives a reason, so we ask **Why**.' },
  { id: 'gr-qw-6', skill: 'question-word', level: 2, prompt: 'Question: ___ apples do you have?\nAnswer: I have five apples.', options: ['How many', 'How much', 'What', 'Who'], answer: 'How many',
    explain: 'We can count apples, so we ask **How many**.' },
  { id: 'gr-qw-7', skill: 'question-word', prompt: 'Question: ___ old are you?\nAnswer: I am seven years old.', options: ['How', 'What', 'Who', 'Which'], answer: 'How',
    explain: 'We ask **How old** to find out someone\'s age.' },

  { id: 'gr-there-1', skill: 'be-present', prompt: 'There ___ five ducks in the pond.', options: ['are', 'is', 'am', 'be'], answer: 'are',
    explain: '**Five ducks** is more than one, so **there are**.' },
  { id: 'gr-there-2', skill: 'be-present', prompt: 'There ___ a cat under the car.', options: ['is', 'are', 'am', 'be'], answer: 'is',
    explain: '**A cat** is one, so **there is**.' },
  { id: 'gr-there-3', skill: 'be-present', prompt: 'There ___ many books in the library.', options: ['are', 'is', 'am', 'was'], answer: 'are',
    explain: '**Many books** is more than one, so **there are**.' }
]);

// ---- VOCABULARY ----------------------------------------------------------------

elAdd('vocab', [
  { id: 'vo-ctx-1', skill: 'context', prompt: 'It is raining. Please take an ___ with you.', options: ['umbrella', 'apple', 'eraser', 'octopus'], answer: 'umbrella',
    explain: 'An **umbrella** keeps you dry in the rain.' },
  { id: 'vo-ctx-2', skill: 'context', prompt: 'Shh! The baby is ___ in the cot.', options: ['sleeping', 'singing', 'swimming', 'skipping'], answer: 'sleeping',
    explain: '**Shh!** tells us to be quiet, because the baby is **sleeping**.' },
  { id: 'vo-ctx-3', skill: 'context', prompt: 'I am ___. May I have a glass of water?', options: ['thirsty', 'sleepy', 'cold', 'happy'], answer: 'thirsty',
    explain: '**Thirsty** means you need a drink.' },
  { id: 'vo-ctx-4', skill: 'context', prompt: 'Mum uses a ___ to cut the vegetables.', options: ['knife', 'spoon', 'cup', 'plate'], answer: 'knife',
    explain: 'We cut food with a **knife**.' },
  { id: 'vo-ctx-5', skill: 'context', prompt: 'We borrow books from the ___.', options: ['library', 'canteen', 'toilet', 'field'], answer: 'library',
    explain: 'A **library** is where we borrow books.' },
  { id: 'vo-ctx-6', skill: 'context', prompt: 'Dad drives the ___ to work.', options: ['car', 'bicycle', 'kite', 'ladder'], answer: 'car',
    explain: 'We **drive** a car. We **ride** a bicycle.' },
  { id: 'vo-ctx-7', skill: 'context', prompt: 'The ice cream ___ in the hot sun.', options: ['melted', 'froze', 'grew', 'cooked'], answer: 'melted',
    explain: 'Heat makes ice cream turn into liquid: it **melted**.' },
  { id: 'vo-ctx-8', skill: 'context', prompt: 'I wear my ___ on my feet.', options: ['shoes', 'gloves', 'hat', 'scarf'], answer: 'shoes',
    explain: 'We wear **shoes** on our feet.' },
  { id: 'vo-ctx-9', skill: 'context', prompt: 'A ___ helps sick people to get well.', options: ['doctor', 'baker', 'pilot', 'farmer'], answer: 'doctor',
    explain: 'A **doctor** looks after sick people.' },
  { id: 'vo-ctx-10', skill: 'context', prompt: 'We use our ___ to smell.', options: ['nose', 'ears', 'eyes', 'hands'], answer: 'nose',
    explain: 'We smell with our **nose**.' },
  { id: 'vo-ctx-11', skill: 'context', prompt: 'It is raining. Please ___ the window.', options: ['close', 'open', 'eat', 'draw'], answer: 'close',
    explain: '**Close** the window to keep the rain out.' },
  { id: 'vo-ctx-12', skill: 'context', prompt: 'Mei ___ a picture of a flower.', options: ['drew', 'drank', 'slept', 'swam'], answer: 'drew',
    explain: 'We **draw** a picture. In the past, it is **drew**.' },
  { id: 'vo-ctx-13', skill: 'context', prompt: 'The kitten is ___. It is only two weeks old.', options: ['tiny', 'huge', 'old', 'tall'], answer: 'tiny',
    explain: 'A two-week-old kitten is very small: **tiny**.' },
  { id: 'vo-ctx-14', skill: 'context', prompt: 'I brush my teeth with a ___.', options: ['toothbrush', 'comb', 'spoon', 'pencil'], answer: 'toothbrush',
    explain: 'We brush our teeth with a **toothbrush**.' },
  { id: 'vo-ctx-15', skill: 'context', prompt: 'We keep the milk cold in the ___.', options: ['fridge', 'oven', 'cupboard', 'drawer'], answer: 'fridge',
    explain: 'A **fridge** keeps food cold.' },
  { id: 'vo-ctx-16', skill: 'context', prompt: 'The farmer grows ___ on the farm.', options: ['vegetables', 'cars', 'books', 'phones'], answer: 'vegetables',
    explain: 'Farmers grow plants like **vegetables**.' },

  { id: 'vo-opp-1', skill: 'opposite', prompt: 'The opposite of **big** is ___.', options: ['small', 'tall', 'long', 'fat'], answer: 'small', explain: 'Big and **small** are opposites.' },
  { id: 'vo-opp-2', skill: 'opposite', prompt: 'The opposite of **hot** is ___.', options: ['cold', 'warm', 'dry', 'wet'], answer: 'cold', explain: 'Hot and **cold** are opposites.' },
  { id: 'vo-opp-3', skill: 'opposite', prompt: 'The opposite of **happy** is ___.', options: ['sad', 'angry', 'tired', 'hungry'], answer: 'sad', explain: 'Happy and **sad** are opposites.' },
  { id: 'vo-opp-4', skill: 'opposite', prompt: 'The opposite of **full** is ___.', options: ['empty', 'heavy', 'dirty', 'short'], answer: 'empty', explain: 'Full and **empty** are opposites.' },
  { id: 'vo-opp-5', skill: 'opposite', prompt: 'The opposite of **early** is ___.', options: ['late', 'slow', 'soon', 'fast'], answer: 'late', explain: 'Early and **late** are opposites.' },
  { id: 'vo-opp-6', skill: 'opposite', prompt: 'The opposite of **open** is ___.', options: ['closed', 'empty', 'under', 'dark'], answer: 'closed', explain: 'Open and **closed** are opposites.' },
  { id: 'vo-opp-7', skill: 'opposite', prompt: 'The opposite of **up** is ___.', options: ['down', 'in', 'on', 'out'], answer: 'down', explain: 'Up and **down** are opposites.' },
  { id: 'vo-opp-8', skill: 'opposite', prompt: 'The opposite of **clean** is ___.', options: ['dirty', 'empty', 'broken', 'quiet'], answer: 'dirty', explain: 'Clean and **dirty** are opposites.' },
  { id: 'vo-opp-9', skill: 'opposite', prompt: 'The opposite of **fast** is ___.', options: ['slow', 'late', 'soft', 'short'], answer: 'slow', explain: 'Fast and **slow** are opposites.' },
  { id: 'vo-opp-10', skill: 'opposite', prompt: 'The opposite of **loud** is ___.', options: ['quiet', 'slow', 'short', 'cold'], answer: 'quiet', explain: 'Loud and **quiet** are opposites.' },

  { id: 'vo-cat-1', skill: 'group', prompt: 'Which one is a fruit?', options: ['mango', 'carrot', 'potato', 'onion'], answer: 'mango',
    explain: 'A **mango** is a fruit. Carrots, potatoes and onions are vegetables.' },
  { id: 'vo-cat-2', skill: 'group', prompt: 'Which one is NOT an animal?', options: ['table', 'tiger', 'horse', 'duck'], answer: 'table',
    explain: 'A **table** is a thing, not an animal.' },
  { id: 'vo-cat-3', skill: 'group', prompt: 'Which one is a colour?', options: ['purple', 'Monday', 'seven', 'round'], answer: 'purple',
    explain: '**Purple** is a colour.' },
  { id: 'vo-cat-4', skill: 'group', prompt: 'Which one is a day of the week?', options: ['Tuesday', 'January', 'morning', 'summer'], answer: 'Tuesday',
    explain: '**Tuesday** is a day. January is a month.' },
  { id: 'vo-cat-5', skill: 'group', prompt: 'Which one is NOT a part of the body?', options: ['chair', 'knee', 'elbow', 'shoulder'], answer: 'chair',
    explain: 'A **chair** is a thing to sit on, not a part of the body.' },
  { id: 'vo-cat-6', skill: 'group', prompt: 'Which animal can fly?', options: ['eagle', 'cat', 'fish', 'snail'], answer: 'eagle',
    explain: 'An **eagle** is a bird, and it can fly.' },
  { id: 'vo-cat-7', skill: 'group', prompt: 'Which one is a month?', options: ['March', 'Monday', 'monkey', 'morning'], answer: 'March',
    explain: '**March** is a month. Monday is a day.' },
  { id: 'vo-cat-8', skill: 'group', prompt: 'Which one do we wear?', options: ['jacket', 'carrot', 'pencil', 'bowl'], answer: 'jacket',
    explain: 'We wear a **jacket**.' },

  { id: 'vo-pic-1', skill: 'picture', prompt: 'Which word matches the picture?', visual: { kind: 'emoji', text: '🦒' }, options: ['giraffe', 'zebra', 'camel', 'horse'], answer: 'giraffe', explain: 'This is a **giraffe**.' },
  { id: 'vo-pic-2', skill: 'picture', prompt: 'Which word matches the picture?', visual: { kind: 'emoji', text: '🐘' }, options: ['elephant', 'hippo', 'mouse', 'lion'], answer: 'elephant', explain: 'This is an **elephant**.' },
  { id: 'vo-pic-3', skill: 'picture', prompt: 'Which word matches the picture?', visual: { kind: 'emoji', text: '🦋' }, options: ['butterfly', 'bee', 'bird', 'beetle'], answer: 'butterfly', explain: 'This is a **butterfly**.' },
  { id: 'vo-pic-4', skill: 'picture', prompt: 'Which word matches the picture?', visual: { kind: 'emoji', text: '☂️' }, options: ['umbrella', 'raincoat', 'hat', 'bag'], answer: 'umbrella', explain: 'This is an **umbrella**.' },
  { id: 'vo-pic-5', skill: 'picture', prompt: 'Which word matches the picture?', visual: { kind: 'emoji', text: '🚲' }, options: ['bicycle', 'motorcycle', 'car', 'bus'], answer: 'bicycle', explain: 'This is a **bicycle**.' },
  { id: 'vo-pic-6', skill: 'picture', prompt: 'Which word matches the picture?', visual: { kind: 'emoji', text: '✏️' }, options: ['pencil', 'pen', 'crayon', 'ruler'], answer: 'pencil', explain: 'This is a **pencil**.' },
  { id: 'vo-pic-7', skill: 'picture', prompt: 'Which word matches the picture?', visual: { kind: 'emoji', text: '🎂' }, options: ['cake', 'bread', 'pizza', 'biscuit'], answer: 'cake', explain: 'This is a **cake**.' },
  { id: 'vo-pic-8', skill: 'picture', prompt: 'Which word matches the picture?', visual: { kind: 'emoji', text: '🌙' }, options: ['moon', 'sun', 'star', 'cloud'], answer: 'moon', explain: 'This is the **moon**.' },
  { id: 'vo-pic-9', skill: 'picture', prompt: 'Which word matches the picture?', visual: { kind: 'emoji', text: '🍉' }, options: ['watermelon', 'durian', 'papaya', 'pineapple'], answer: 'watermelon', explain: 'This is a **watermelon**.' },
  { id: 'vo-pic-10', skill: 'picture', prompt: 'Which word matches the picture?', visual: { kind: 'emoji', text: '🐙' }, options: ['octopus', 'jellyfish', 'crab', 'starfish'], answer: 'octopus', explain: 'This is an **octopus**.' },
  { id: 'vo-pic-11', skill: 'picture', prompt: 'Which word matches the picture?', visual: { kind: 'emoji', text: '🔑' }, options: ['key', 'lock', 'door', 'coin'], answer: 'key', explain: 'This is a **key**.' },
  { id: 'vo-pic-12', skill: 'picture', prompt: 'Which word matches the picture?', visual: { kind: 'emoji', text: '🎒' }, options: ['school bag', 'suitcase', 'basket', 'box'], answer: 'school bag', explain: 'This is a **school bag**.' },

  { id: 'vo-verb-1', skill: 'action', prompt: 'Please ___ your teeth before you go to bed.', options: ['brush', 'wash', 'comb', 'cut'], answer: 'brush',
    explain: 'We **brush** our teeth.' },
  { id: 'vo-verb-2', skill: 'action', prompt: 'I use a comb to ___ my hair.', options: ['comb', 'cut', 'wash', 'dry'], answer: 'comb',
    explain: 'We use a comb to **comb** our hair.' },
  { id: 'vo-verb-3', skill: 'action', prompt: 'Mum ___ the clothes in the washing machine.', options: ['washes', 'cooks', 'sweeps', 'reads'], answer: 'washes',
    explain: 'A washing machine **washes** clothes.' },
  { id: 'vo-verb-4', skill: 'action', prompt: 'We ___ our hands before we eat.', options: ['wash', 'brush', 'cut', 'comb'], answer: 'wash',
    explain: 'We **wash** our hands before we eat.' },
  { id: 'vo-verb-5', skill: 'action', prompt: 'Dad ___ the plants every evening.', options: ['waters', 'eats', 'drinks', 'wears'], answer: 'waters',
    explain: 'We **water** plants to help them grow.' },
  { id: 'vo-verb-6', skill: 'action', prompt: 'The children ___ the bus to school.', options: ['take', 'eat', 'wear', 'read'], answer: 'take',
    explain: 'We **take** a bus.' },

  { id: 'vo-job-1', skill: 'people-places', prompt: 'A ___ flies an aeroplane.', options: ['pilot', 'driver', 'cook', 'nurse'], answer: 'pilot', explain: 'A **pilot** flies an aeroplane.' },
  { id: 'vo-job-2', skill: 'people-places', prompt: 'A ___ puts out fires.', options: ['firefighter', 'baker', 'teacher', 'postman'], answer: 'firefighter', explain: 'A **firefighter** puts out fires.' },
  { id: 'vo-job-3', skill: 'people-places', prompt: 'We buy bread from the ___.', options: ['bakery', 'library', 'clinic', 'zoo'], answer: 'bakery', explain: 'A **bakery** sells bread.' },
  { id: 'vo-job-4', skill: 'people-places', prompt: 'We see many animals at the ___.', options: ['zoo', 'bank', 'library', 'post office'], answer: 'zoo', explain: 'We see animals at the **zoo**.' },
  { id: 'vo-job-5', skill: 'people-places', prompt: 'We go to the ___ to see a doctor.', options: ['clinic', 'bakery', 'cinema', 'beach'], answer: 'clinic', explain: 'Doctors work at a **clinic**.' },
  { id: 'vo-job-6', skill: 'people-places', prompt: 'A ___ cooks food in a restaurant.', options: ['chef', 'pilot', 'dentist', 'farmer'], answer: 'chef', explain: 'A **chef** cooks food in a restaurant.' },

  { id: 'vo-ani-1', skill: 'animals', prompt: 'A bird lives in a ___.', options: ['nest', 'hive', 'kennel', 'burrow'], answer: 'nest', explain: 'A bird lives in a **nest**.' },
  { id: 'vo-ani-2', skill: 'animals', prompt: 'Bees live in a ___.', options: ['hive', 'kennel', 'stable', 'pond'], answer: 'hive', explain: 'Bees live in a **hive**.' },
  { id: 'vo-ani-3', skill: 'animals', prompt: 'A baby cat is called a ___.', options: ['kitten', 'puppy', 'calf', 'cub'], answer: 'kitten', explain: 'A baby cat is a **kitten**.' },
  { id: 'vo-ani-4', skill: 'animals', prompt: 'A baby dog is called a ___.', options: ['puppy', 'kitten', 'chick', 'lamb'], answer: 'puppy', explain: 'A baby dog is a **puppy**.' },
  { id: 'vo-ani-5', skill: 'animals', prompt: 'A baby hen is called a ___.', options: ['chick', 'kitten', 'puppy', 'lamb'], answer: 'chick', explain: 'A baby hen is a **chick**.' },
  { id: 'vo-ani-6', skill: 'animals', prompt: 'A small house for a dog is called a ___.', options: ['kennel', 'nest', 'hive', 'pond'], answer: 'kennel', explain: 'A dog\'s little house is a **kennel**.' }
]);

// ---- PUNCTUATION ----------------------------------------------------------------

var EL_END = ['full stop ( . )', 'question mark ( ? )', 'exclamation mark ( ! )'];
var EL_END_EXPLAIN = {
  'full stop ( . )': 'It tells us something, so it ends with a **full stop**.',
  'question mark ( ? )': 'It asks something, so it ends with a **question mark**.',
  'exclamation mark ( ! )': 'It shows a strong feeling, like "What a ...!" or "How ...!", so it ends with an **exclamation mark**.'
};
function elEnd(id, sentence, answer, level) {
  return { id: id, skill: 'end-mark', order: 'keep', level: level || 1, prompt: 'Which mark should end this sentence?\n' + sentence + '___',
    options: EL_END, answer: answer, explain: EL_END_EXPLAIN[answer] };
}
var EL_END_Q = EL_END[1], EL_END_S = EL_END[0], EL_END_X = EL_END[2];

/** A tap-the-capitals item. The tokens are the sentence split on spaces. */
function elCaps(id, sentence, need, explain, level) {
  var tokens = sentence.split(' ');
  return { id: id, skill: 'capitals', type: 'select', level: level || 1, prompt: 'Tap every word that should start with a capital letter.',
    tokens: tokens, answer: need.map(function (w) {
      var i = tokens.indexOf(w);
      if (i === -1) throw new Error('elCaps ' + id + ': no token ' + w);
      return i;
    }), explain: explain };
}

elAdd('punct', [
  elEnd('pu-end-1', 'What is your favourite colour', EL_END_Q),
  elEnd('pu-end-2', 'My cat likes to sleep on the sofa', EL_END_S),
  elEnd('pu-end-3', 'What a beautiful rainbow', EL_END_X),
  elEnd('pu-end-4', 'Where are my shoes', EL_END_Q),
  elEnd('pu-end-5', 'Can you help me', EL_END_Q),
  elEnd('pu-end-6', 'We are going to the park', EL_END_S),
  elEnd('pu-end-7', 'What a big cake', EL_END_X),
  elEnd('pu-end-8', 'Do you like durians', EL_END_Q),
  elEnd('pu-end-9', 'The sun rises in the morning', EL_END_S),
  elEnd('pu-end-10', 'How tall that giraffe is', EL_END_X, 2),
  elEnd('pu-end-11', 'Who is your teacher', EL_END_Q),
  elEnd('pu-end-12', 'I have two sisters', EL_END_S),
  elEnd('pu-end-13', 'There are seven days in a week', EL_END_S),
  elEnd('pu-end-14', 'Are you ready for school', EL_END_Q),
  elEnd('pu-end-15', 'What a hot day it is', EL_END_X),
  Object.assign(elEnd('pu-end-16', 'How many pencils do you have', EL_END_Q, 2), { why: {
    'exclamation mark ( ! )': '**How many** asks a question, so it needs a question mark. A sentence starting with **How** ends with an exclamation mark only when it shows a strong feeling and asks nothing, like **How tall that giraffe is!**' } }),

  elCaps('pu-cap-1', 'my friend sara lives in singapore.', ['my', 'sara', 'singapore.'],
    '**My** starts the sentence. **Sara** is a person\'s name. **Singapore** is the name of a place.'),
  elCaps('pu-cap-2', 'on monday, ben and i went swimming.', ['on', 'monday,', 'ben', 'i'],
    '**On** starts the sentence. **Monday** is a day. **Ben** is a name. **I** is always a capital letter.'),
  elCaps('pu-cap-3', 'we visited the zoo in june.', ['we', 'june.'],
    '**We** starts the sentence. **June** is a month.'),
  elCaps('pu-cap-4', 'my birthday is in december.', ['my', 'december.'],
    '**My** starts the sentence. **December** is a month.'),
  elCaps('pu-cap-5', 'mrs tan is our teacher.', ['mrs', 'tan'],
    '**Mrs Tan** is a person\'s name, so both words start with a capital letter.'),
  elCaps('pu-cap-6', 'is tom coming to the party on friday?', ['is', 'tom', 'friday?'],
    '**Is** starts the sentence. **Tom** is a name. **Friday** is a day.'),
  elCaps('pu-cap-7', 'i like to read books.', ['i'],
    '**I** starts the sentence, and **I** is always a capital letter anyway.'),
  elCaps('pu-cap-8', 'we went to sentosa last sunday.', ['we', 'sentosa', 'sunday.'],
    '**We** starts the sentence. **Sentosa** is the name of a place. **Sunday** is a day.'),
  elCaps('pu-cap-9', 'my cat is called fluffy.', ['my', 'fluffy.'],
    '**My** starts the sentence. **Fluffy** is the cat\'s name.'),
  elCaps('pu-cap-10', 'ali and mei live in bedok.', ['ali', 'mei', 'bedok.'],
    '**Ali** and **Mei** are names. **Bedok** is the name of a place.'),
  elCaps('pu-cap-11', 'my uncle lives in malaysia.', ['my', 'malaysia.'],
    '**My** starts the sentence. **Malaysia** is the name of a country.'),
  elCaps('pu-cap-12', 'priya lights oil lamps at deepavali.', ['priya', 'deepavali.'],
    '**Priya** is a name, and it starts the sentence. **Deepavali** is the name of a festival.'),
  elCaps('pu-cap-13', 'did you see ali at the park on sunday?', ['did', 'ali', 'sunday?'],
    '**Did** starts the sentence. **Ali** is a name. **Sunday** is a day. **Park** is not a name, so it stays small.'),
  elCaps('pu-cap-14', 'school starts again in january.', ['school', 'january.'],
    '**School** starts the sentence, so it needs a capital letter here. **January** is a month.'),
  elCaps('pu-cap-15', 'mr lee drives a taxi in tampines.', ['mr', 'lee', 'tampines.'],
    '**Mr Lee** is a person\'s name, so both words start with a capital letter. **Tampines** is the name of a place.'),
  elCaps('pu-cap-16', 'we visit our relatives during chinese new year.', ['we', 'chinese', 'new', 'year.'],
    '**We** starts the sentence. **Chinese New Year** is the name of a festival, so every word in it starts with a capital letter.', 2),

  { id: 'pu-cs-1', skill: 'correct-sentence', prompt: 'Which sentence is written correctly?',
    options: ['My brother is eight years old.', 'my brother is eight years old.', 'My brother is eight years old', 'My Brother is eight years old.'],
    answer: 'My brother is eight years old.',
    explain: 'A sentence starts with a capital letter and ends with a full stop. **Brother** is not a name, so it does not need a capital letter.' },
  { id: 'pu-cs-2', skill: 'correct-sentence', prompt: 'Which sentence is written correctly?',
    options: ['Where is the library?', 'where is the library?', 'Where is the library.', 'Where is the Library?'],
    answer: 'Where is the library?',
    explain: 'It is a question, so it ends with a question mark, and it starts with a capital letter. **Library** is not a name.' },
  { id: 'pu-cs-3', skill: 'correct-sentence', prompt: 'Which sentence is written correctly?',
    options: ['Sam and I like to play.', 'Sam and i like to play.', 'sam and I like to play.', 'Sam and I like to play'],
    answer: 'Sam and I like to play.',
    explain: '**Sam** is a name and **I** is always a capital letter. The sentence ends with a full stop.' },
  { id: 'pu-cs-4', skill: 'correct-sentence', prompt: 'Which sentence is written correctly?',
    options: ['We go swimming on Saturdays.', 'We go swimming on saturdays.', 'we go swimming on Saturdays.', 'We go swimming on Saturdays'],
    answer: 'We go swimming on Saturdays.',
    explain: 'Days of the week start with a capital letter: **Saturdays**. The sentence starts with a capital and ends with a full stop.' },
  { id: 'pu-cs-5', skill: 'correct-sentence', prompt: 'Which sentence is written correctly?',
    options: ['What a pretty dress!', 'what a pretty dress!', 'What a pretty dress?', 'What a Pretty dress!'],
    answer: 'What a pretty dress!',
    explain: '"What a ...!" shows strong feeling, so it ends with an exclamation mark. Only the first word needs a capital letter.' },
  { id: 'pu-cs-6', skill: 'correct-sentence', prompt: 'Which sentence is written correctly?',
    options: ['Mr Lim lives in Bedok.', 'Mr lim lives in Bedok.', 'Mr Lim lives in bedok.', 'mr Lim lives in Bedok.'],
    answer: 'Mr Lim lives in Bedok.',
    explain: '**Mr Lim** is a person\'s name and **Bedok** is a place, so they start with capital letters.' },
  { id: 'pu-cs-7', skill: 'correct-sentence', prompt: 'Which sentence is written correctly?',
    options: ['Is it your birthday today?', 'Is it your birthday today.', 'is it your birthday today?', 'Is it your Birthday today?'],
    answer: 'Is it your birthday today?',
    explain: 'It asks something, so it ends with a question mark. **Birthday** is not a name.' },
  { id: 'pu-cs-8', skill: 'correct-sentence', prompt: 'Which sentence is written correctly?',
    options: ['I have a pet rabbit.', 'i have a pet rabbit.', 'I have a pet rabbit?', 'I have a Pet rabbit.'],
    answer: 'I have a pet rabbit.',
    explain: '**I** is always a capital letter. The sentence tells us something, so it ends with a full stop. **Pet** is not a name.' },
  { id: 'pu-cs-9', skill: 'correct-sentence', prompt: 'Which sentence is written correctly?',
    options: ['Can we go to the beach?', 'Can we go to the beach.', 'can we go to the beach?', 'Can we go to the Beach?'],
    answer: 'Can we go to the beach?',
    explain: 'It asks something, so it ends with a question mark, and it starts with a capital letter. **Beach** is not a name.' },
  { id: 'pu-cs-10', skill: 'correct-sentence', prompt: 'Which sentence is written correctly?',
    options: ['My birthday is in April.', 'My birthday is in april.', 'my birthday is in April.', 'My Birthday is in April.'],
    answer: 'My birthday is in April.',
    explain: 'Months start with a capital letter: **April**. **Birthday** is not a name, so it stays small.' },
  { id: 'pu-cs-11', skill: 'correct-sentence', level: 2, prompt: 'Which sentence is written correctly?',
    options: ['How beautiful the flowers are!', 'How beautiful the flowers are?', 'how beautiful the flowers are!', 'How beautiful the Flowers are!'],
    answer: 'How beautiful the flowers are!',
    explain: '"How ...!" shows a strong feeling and asks nothing, so it ends with an exclamation mark. Only the first word needs a capital letter.' },
  { id: 'pu-cs-12', skill: 'correct-sentence', prompt: 'Which sentence is written correctly?',
    options: ['Siti and I live in Woodlands.', 'Siti and i live in Woodlands.', 'Siti and I live in woodlands.', 'siti and I live in Woodlands.'],
    answer: 'Siti and I live in Woodlands.',
    explain: '**Siti** is a name, **I** is always a capital letter, and **Woodlands** is the name of a place.' },
  { id: 'pu-cs-13', skill: 'correct-sentence', prompt: 'Which sentence is written correctly?',
    options: ['We went to the zoo on Friday.', 'We went to the zoo on friday.', 'We went to the Zoo on Friday.', 'We went to the zoo on Friday'],
    answer: 'We went to the zoo on Friday.',
    explain: 'Days start with a capital letter: **Friday**. **Zoo** is not a name here. The sentence ends with a full stop.' },

  { id: 'pu-com-1', skill: 'commas', level: 3, prompt: 'Which sentence uses commas correctly?',
    options: ['I bought apples, pears and bananas.', 'I bought apples pears and bananas.', 'I bought, apples pears and bananas.', 'I bought apples pears, and bananas.'],
    answer: 'I bought apples, pears and bananas.',
    explain: 'In a list, put a comma between the things, and use **and** before the last one.' },
  { id: 'pu-com-2', skill: 'commas', level: 3, prompt: 'Which sentence uses commas correctly?',
    options: ['We saw lions, tigers and zebras at the zoo.', 'We saw lions tigers and zebras at the zoo.', 'We saw, lions tigers and zebras at the zoo.', 'We saw lions tigers, and zebras at the zoo.'],
    answer: 'We saw lions, tigers and zebras at the zoo.',
    explain: 'In a list, put a comma between the things, and use **and** before the last one.' },
  { id: 'pu-com-3', skill: 'commas', level: 3, prompt: 'Which sentence uses commas correctly?',
    options: ['Mum bought eggs, milk and bread.', 'Mum bought eggs milk and bread.', 'Mum bought, eggs milk and bread.', 'Mum bought eggs milk, and bread.'],
    answer: 'Mum bought eggs, milk and bread.',
    explain: 'In a list, put a comma between the things, and use **and** before the last one.' },
  { id: 'pu-com-4', skill: 'commas', level: 3, prompt: 'Which sentence uses commas correctly?',
    options: ['My favourite colours are red, blue and green.', 'My favourite colours are red blue and green.', 'My favourite colours are, red blue and green.', 'My favourite colours are red blue, and green.'],
    answer: 'My favourite colours are red, blue and green.',
    explain: 'In a list, put a comma between the things, and use **and** before the last one.' }
]);

// ---- COMPREHENSION ------------------------------------------------------------------
// Every answer can be pointed to in the passage, and each explanation
// quotes the sentence that holds it.

var EL_TF = ['True', 'False'];

var EL_PASSAGES = [
  { id: 'el-p-zoo', section: 'comp', title: 'A Day at the Zoo', paras: [
      'Last Saturday, Mei went to the zoo with her parents. It was a sunny day.',
      'First, they saw the elephants. A baby elephant was spraying water with its trunk. Mei laughed when some water landed on her dad.',
      'Next, they watched the orangutans. One orangutan was eating a banana high up in a tree.',
      'At noon, they had lunch at the food court. Mei ate fried rice and drank apple juice.',
      'Before they went home, Mei bought a small toy giraffe at the gift shop. She was tired but very happy.'],
    items: [
      // Not "yesterday" as a wrong option: if today were Sunday, yesterday
      // would be last Saturday, and the option would be right.
      { id: 'el-c-zoo-1', skill: 'literal', type: 'mcq', prompt: 'When did Mei go to the zoo?', options: ['last Saturday', 'last Sunday', 'last Monday', 'last Friday'],
        answer: 'last Saturday', explain: 'The passage says: "**Last Saturday**, Mei went to the zoo with her parents."' },
      { id: 'el-c-zoo-2', skill: 'literal', type: 'mcq', prompt: 'What was the baby elephant doing?',
        options: ['spraying water with its trunk', 'eating a banana in a tree', 'sleeping in the sun', 'drinking apple juice'],
        answer: 'spraying water with its trunk', explain: 'The passage says: "A baby elephant was **spraying water with its trunk**."' },
      { id: 'el-c-zoo-3', skill: 'sequence', type: 'arrange', list: true, prompt: 'Put these in the order they happened.',
        tiles: ['Mei saw the elephants.', 'Mei had lunch.', 'Mei bought a toy giraffe.'],
        answer: ['Mei saw the elephants.', 'Mei had lunch.', 'Mei bought a toy giraffe.'],
        explain: 'Look for the order words: **First** the elephants, **At noon** lunch, **Before they went home** the toy giraffe.' },
      { id: 'el-c-zoo-4', skill: 'true-false', type: 'mcq', order: 'keep', prompt: 'True or false? It was raining on the day Mei went to the zoo.',
        options: EL_TF, answer: 'False', explain: 'The passage says: "It was a **sunny** day."' },
      { id: 'el-c-zoo-5', skill: 'literal', type: 'word', prompt: 'What did Mei buy at the gift shop? A small toy ___.',
        answer: 'giraffe', accept: ['toy giraffe', 'small toy giraffe', 'a small toy giraffe'],
        explain: 'The passage says: "Mei bought a small toy **giraffe** at the gift shop."' }
    ] },

  { id: 'el-p-hamster', section: 'comp', title: 'My Pet Hamster', paras: [
      'I have a pet hamster called Peanut. Peanut is small and has soft brown fur.',
      'Peanut lives in a cage in my bedroom. Every morning, I give Peanut fresh water and some seeds. Peanut likes sunflower seeds best.',
      'At night, Peanut runs on a wheel. The wheel squeaks, so it is a little noisy!',
      'On Saturdays, my mother and I clean the cage together. I like to hold Peanut gently in my hands. Peanut\'s whiskers tickle my fingers.'],
    items: [
      { id: 'el-c-ham-1', skill: 'literal', type: 'word', prompt: 'What is the hamster\'s name?', answer: 'Peanut',
        explain: 'The passage says: "I have a pet hamster called **Peanut**."' },
      { id: 'el-c-ham-2', skill: 'literal', type: 'mcq', prompt: 'Where does Peanut live?',
        options: ['in a cage in the bedroom', 'in the garden', 'in the kitchen', 'in a box at school'],
        answer: 'in a cage in the bedroom', explain: 'The passage says: "Peanut lives **in a cage in my bedroom**."' },
      { id: 'el-c-ham-3', skill: 'literal', type: 'mcq', prompt: 'What food does Peanut like best?', options: ['sunflower seeds', 'carrots', 'bananas', 'bread'],
        answer: 'sunflower seeds', explain: 'The passage says: "Peanut likes **sunflower seeds** best."' },
      { id: 'el-c-ham-4', skill: 'inference', type: 'mcq', prompt: 'Why is it a little noisy at night?',
        options: ['The wheel squeaks.', 'Peanut barks.', 'The writer sings.', 'The door bangs.'],
        answer: 'The wheel squeaks.', explain: 'The passage says: "**The wheel squeaks**, so it is a little noisy!"' },
      { id: 'el-c-ham-5', skill: 'true-false', type: 'mcq', order: 'keep', prompt: 'True or false? The writer cleans the cage alone.',
        options: EL_TF, answer: 'False', explain: 'The passage says: "**My mother and I** clean the cage together."' }
    ] },

  { id: 'el-p-sports', section: 'comp', title: 'Sports Day', paras: [
      'Today was Sports Day at Ravi\'s school. All the pupils wore the colours of their houses. Ravi was in Blue House.',
      'Ravi ran in a race. At first, he was in fourth place. Then he ran faster and faster. Just before the finishing line, he passed two runners. Ravi came in second!',
      'His teacher, Mrs Lim, gave him a silver medal. Ravi\'s friends cheered loudly. Ravi felt very proud.'],
    items: [
      { id: 'el-c-spo-1', skill: 'literal', type: 'mcq', prompt: 'Which house was Ravi in?', options: ['Blue House', 'Red House', 'Green House', 'Yellow House'],
        answer: 'Blue House', explain: 'The passage says: "Ravi was in **Blue House**."' },
      { id: 'el-c-spo-2', skill: 'literal', type: 'mcq', prompt: 'At first, which place was Ravi in?', options: ['fourth', 'first', 'second', 'third'],
        answer: 'fourth', explain: 'The passage says: "At first, he was in **fourth** place."' },
      { id: 'el-c-spo-3', skill: 'literal', type: 'mcq', prompt: 'What did Mrs Lim give Ravi?', options: ['a silver medal', 'a gold medal', 'a trophy', 'a book'],
        answer: 'a silver medal', explain: 'The passage says: "His teacher, Mrs Lim, gave him **a silver medal**."' },
      { id: 'el-c-spo-4', skill: 'inference', type: 'mcq', prompt: 'How did Ravi feel at the end?', options: ['proud', 'angry', 'sleepy', 'scared'],
        answer: 'proud', explain: 'The passage says: "Ravi felt very **proud**."' },
      { id: 'el-c-spo-5', skill: 'word-meaning', type: 'mcq', level: 2, prompt: 'Which word in the passage means "shouted happily"?', options: ['cheered', 'passed', 'wore', 'ran'],
        answer: 'cheered', explain: '"Ravi\'s friends **cheered** loudly." To cheer is to shout happily for someone.' }
    ] },

  { id: 'el-p-butterfly', section: 'comp', title: 'From Egg to Butterfly', paras: [
      'A butterfly begins its life as a tiny egg on a leaf.',
      'A caterpillar hatches from the egg. The caterpillar is very hungry. It eats leaves all day and grows bigger and bigger.',
      'Then the caterpillar makes a hard case around itself. This case is called a pupa.',
      'Inside the pupa, the caterpillar changes. After about two weeks, a butterfly comes out. Its wings are wet at first. Soon they are dry, and the butterfly flies away.'],
    items: [
      { id: 'el-c-but-1', skill: 'literal', type: 'mcq', prompt: 'Where is the butterfly\'s egg?', options: ['on a leaf', 'in a nest', 'under a rock', 'in the water'],
        answer: 'on a leaf', explain: 'The passage says: "A butterfly begins its life as a tiny egg **on a leaf**."' },
      { id: 'el-c-but-2', skill: 'literal', type: 'mcq', prompt: 'What hatches from the egg?', options: ['a caterpillar', 'a butterfly', 'a pupa', 'a bird'],
        answer: 'a caterpillar', explain: 'The passage says: "**A caterpillar** hatches from the egg."' },
      { id: 'el-c-but-3', skill: 'literal', type: 'word', prompt: 'What does the caterpillar eat all day?', answer: 'leaves',
        explain: 'The passage says: "It eats **leaves** all day."' },
      { id: 'el-c-but-4', skill: 'sequence', type: 'arrange', list: true, prompt: 'Put the stages in order, starting with the first.',
        tiles: ['egg', 'caterpillar', 'pupa', 'butterfly'], answer: ['egg', 'caterpillar', 'pupa', 'butterfly'],
        explain: 'Egg, then the caterpillar hatches, then it makes a pupa, then the butterfly comes out.' },
      // True, where most true-or-false items are false, so that "false"
      // is never a safe guess.
      { id: 'el-c-but-5', skill: 'true-false', type: 'mcq', order: 'keep', prompt: 'True or false? The butterfly\'s wings are wet when it first comes out.',
        options: EL_TF, answer: 'True', explain: 'The passage says: "Its wings are **wet** at first."' }
    ] },

  { id: 'el-p-puppy', section: 'comp', title: 'The Lost Puppy', paras: [
      'After school, Hana saw a small brown puppy at the void deck. It was shaking and looked very hungry. The puppy had a red collar with a bell on it.',
      'Hana gave the puppy some water. Then she saw a notice on the wall. It said: "LOST! Small brown puppy with a red collar. Please call the number below."',
      'Hana\'s mother called the number. Soon, a boy came running. "Coco!" he shouted. The puppy wagged its tail and jumped into his arms.',
      'The boy thanked Hana again and again.'],
    items: [
      { id: 'el-c-pup-1', skill: 'literal', type: 'mcq', prompt: 'Where did Hana see the puppy?', options: ['at the void deck', 'in the school canteen', 'at the beach', 'in a shop'],
        answer: 'at the void deck', explain: 'The passage says: "Hana saw a small brown puppy **at the void deck**."' },
      { id: 'el-c-pup-2', skill: 'inference', type: 'mcq', prompt: 'How did Hana find out that the puppy was lost?',
        options: ['She saw a notice on the wall.', 'A teacher told her.', 'The puppy was barking.', 'She heard it on the radio.'],
        answer: 'She saw a notice on the wall.', explain: 'The passage says: "Then she **saw a notice on the wall**. It said: LOST!"' },
      { id: 'el-c-pup-3', skill: 'literal', type: 'word', prompt: 'What was the puppy\'s name?', answer: 'Coco',
        explain: 'The boy shouted "**Coco!**" and the puppy jumped into his arms, so its name is Coco.' },
      { id: 'el-c-pup-4', skill: 'inference', type: 'mcq', prompt: 'How do you think the boy felt when he saw Coco?', options: ['happy', 'angry', 'bored', 'sleepy'],
        answer: 'happy', explain: 'He came running, shouted Coco\'s name, and thanked Hana again and again. He was **happy** to find his puppy.' },
      { id: 'el-c-pup-5', skill: 'literal', type: 'mcq', prompt: 'What colour was the puppy\'s collar?', options: ['red', 'brown', 'blue', 'black'],
        answer: 'red', explain: 'The passage says: "The puppy had a **red** collar." (The puppy itself was brown.)' }
    ] },

  { id: 'el-p-salad', section: 'comp', title: 'How to Make a Fruit Salad', paras: [
      'You will need: a banana, an apple, some grapes, a bowl and a spoon.',
      'Step 1: Wash your hands and the fruit.',
      'Step 2: Ask an adult to help you cut the apple and the banana into small pieces.',
      'Step 3: Put all the fruit into the bowl.',
      'Step 4: Mix the fruit gently with the spoon.',
      'Step 5: Eat your fruit salad and enjoy!'],
    items: [
      { id: 'el-c-sal-1', skill: 'literal', type: 'mcq', prompt: 'What must you do first?',
        options: ['Wash your hands and the fruit.', 'Cut the apple.', 'Mix the fruit.', 'Eat the salad.'],
        answer: 'Wash your hands and the fruit.', explain: 'Step 1 says: "**Wash your hands and the fruit.**"' },
      { id: 'el-c-sal-2', skill: 'literal', type: 'mcq', prompt: 'Who should help you to cut the fruit?', options: ['an adult', 'a baby', 'a classmate', 'nobody'],
        answer: 'an adult', explain: 'Step 2 says: "Ask **an adult** to help you cut the apple and the banana."' },
      { id: 'el-c-sal-3', skill: 'literal', type: 'mcq', prompt: 'Which fruit is NOT in this fruit salad?', options: ['mango', 'banana', 'apple', 'grapes'],
        answer: 'mango', explain: 'You need a banana, an apple and some grapes. There is no **mango**.' },
      { id: 'el-c-sal-4', skill: 'literal', type: 'word', prompt: 'What do you use to mix the fruit? A ___.', answer: 'spoon', accept: ['the spoon', 'a spoon'],
        explain: 'Step 4 says: "Mix the fruit gently with the **spoon**."' },
      { id: 'el-c-sal-5', skill: 'true-false', type: 'mcq', order: 'keep', prompt: 'True or false? You put the fruit into the bowl before you cut it.',
        options: EL_TF, answer: 'False', explain: 'You cut the fruit in **Step 2**, and put it into the bowl in **Step 3**, so the cutting comes first.' }
    ] },

  { id: 'el-p-garden', section: 'comp', title: 'Grandpa\'s Garden', paras: [
      'Last Sunday, Amy helped Grandpa in his garden. Grandpa grows tomatoes, chillies and long beans.',
      'First, Amy watered the plants with a green watering can. Then, she pulled out the weeds.',
      'Suddenly, Amy saw a big caterpillar on a tomato leaf. It was eating the leaf! Grandpa picked it up gently and put it on a tree, far away from his plants.',
      'Before Amy went home, Grandpa gave her a basket of red tomatoes. "Thank you, Grandpa!" said Amy.'],
    items: [
      { id: 'el-c-gar-1', skill: 'literal', type: 'mcq', prompt: 'When did Amy help Grandpa in his garden?', options: ['last Sunday', 'last Saturday', 'last Monday', 'last Friday'],
        answer: 'last Sunday', explain: 'The passage says: "**Last Sunday**, Amy helped Grandpa in his garden."' },
      { id: 'el-c-gar-2', skill: 'literal', type: 'word', prompt: 'What colour was the watering can?', answer: 'green',
        explain: 'The passage says: "Amy watered the plants with a **green** watering can."' },
      { id: 'el-c-gar-3', skill: 'sequence', type: 'arrange', list: true, prompt: 'Put these in the order they happened.',
        tiles: ['Amy watered the plants.', 'Amy saw a caterpillar.', 'Grandpa gave Amy some tomatoes.'],
        answer: ['Amy watered the plants.', 'Amy saw a caterpillar.', 'Grandpa gave Amy some tomatoes.'],
        explain: 'Look for the order words: **First**, Amy watered the plants. Then she saw the caterpillar. **Before Amy went home**, Grandpa gave her the tomatoes.' },
      { id: 'el-c-gar-4', skill: 'inference', type: 'mcq', prompt: 'Why did Grandpa move the caterpillar?',
        options: ['It was eating a tomato leaf.', 'It was very small.', 'Amy wanted to keep it.', 'It was raining.'],
        answer: 'It was eating a tomato leaf.', explain: 'The caterpillar "was eating the leaf!" Grandpa moved it "far away from his plants", so it could not eat them.' },
      { id: 'el-c-gar-5', skill: 'true-false', type: 'mcq', order: 'keep', prompt: 'True or false? Grandpa grows long beans in his garden.',
        options: EL_TF, answer: 'True', explain: 'The passage says: "Grandpa grows tomatoes, chillies and **long beans**."' }
    ] },

  { id: 'el-p-reading', section: 'comp', title: 'Our Reading Corner', paras: [
      'Class 1B has a new reading corner. It has a shelf with forty storybooks and two soft beanbags to sit on.',
      'These are the rules for our reading corner:',
      '1. Take one book at a time.',
      '2. Speak softly, because others are reading.',
      '3. When you finish, put the book back on the shelf.',
      'On Fridays, you may borrow a book to take home. Please bring it back on Monday.'],
    items: [
      { id: 'el-c-rea-1', skill: 'literal', type: 'mcq', prompt: 'Which class has the new reading corner?', options: ['Class 1B', 'Class 1A', 'Class 2B', 'Class 2A'],
        answer: 'Class 1B', explain: 'The passage says: "**Class 1B** has a new reading corner."' },
      { id: 'el-c-rea-2', skill: 'literal', type: 'mcq', prompt: 'How many storybooks are on the shelf?', options: ['forty', 'fourteen', 'four', 'two'],
        answer: 'forty', explain: 'The passage says: "It has a shelf with **forty** storybooks." (Two is the number of beanbags.)' },
      { id: 'el-c-rea-3', skill: 'inference', type: 'mcq', prompt: 'Lin has finished reading a book in the reading corner. What should Lin do?',
        options: ['put the book back on the shelf', 'leave the book on a beanbag', 'take two more books', 'read the book aloud'],
        answer: 'put the book back on the shelf', explain: 'Rule 3 says: "When you finish, **put the book back on the shelf**."' },
      { id: 'el-c-rea-4', skill: 'literal', type: 'word', prompt: 'On which day may you borrow a book to take home? On ___.', answer: 'Friday', accept: ['Fridays'],
        explain: 'The passage says: "On **Fridays**, you may borrow a book to take home."' },
      { id: 'el-c-rea-5', skill: 'true-false', type: 'mcq', order: 'keep', prompt: 'True or false? You can sit on a beanbag in the reading corner.',
        options: EL_TF, answer: 'True', explain: 'The passage says the corner has "two soft **beanbags to sit on**."' }
    ] }
];

registerExamSubject({
  id: 'el', name: 'English', icon: '📖', lang: 'en-GB', minutes: 45,
  sections: [
    { id: 'grammar', name: 'Grammar', count: 10, practiceCount: 12, instructions: 'Choose the correct answer.',
      blurb: 'a/an, is/are, was/were, has/have, tenses, pronouns, prepositions, joining words' },
    { id: 'vocab', name: 'Vocabulary', count: 8, practiceCount: 10, instructions: 'Choose the best answer.',
      blurb: 'Words in sentences, opposites, groups, pictures' },
    { id: 'punct', name: 'Punctuation', count: 6, practiceCount: 8, instructions: 'Follow the instruction in each question.',
      blurb: 'Capital letters, full stops, question marks, exclamation marks' },
    { id: 'comp', name: 'Comprehension', passages: 1, perPassage: 5, practicePassages: 2,
      instructions: 'Read the passage carefully. Then answer the questions.', blurb: 'Read a passage and answer questions about it' }
  ],
  items: EL_ITEMS,
  passages: EL_PASSAGES
});
