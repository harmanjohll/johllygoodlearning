// ============================================================
//  IDIOM OF THE DAY — 50 P1-friendly English idioms with kid-safe meanings
// ============================================================

const IOTD_BANK = [
  { idiom: "Piece of cake",            meaning: "very easy",                                  example: "That puzzle was a piece of cake!" },
  { idiom: "Raining cats and dogs",    meaning: "raining very heavily",                       example: "Bring an umbrella, it's raining cats and dogs!" },
  { idiom: "Bookworm",                 meaning: "someone who loves reading",                  example: "Anastasia is a real bookworm." },
  { idiom: "Cool as a cucumber",       meaning: "very calm",                                  example: "Even before the test, she was cool as a cucumber." },
  { idiom: "Apple of my eye",          meaning: "favourite person",                           example: "Grandma calls me the apple of her eye." },
  { idiom: "Spill the beans",          meaning: "tell a secret",                              example: "Don't spill the beans about the surprise party!" },
  { idiom: "Couch potato",             meaning: "someone who sits around a lot",              example: "I was being a couch potato all afternoon." },
  { idiom: "Once in a blue moon",      meaning: "very rarely",                                example: "We only have ice cream once in a blue moon." },
  { idiom: "Hit the books",            meaning: "to study hard",                              example: "Time to hit the books for the spelling test!" },
  { idiom: "Hold your horses",         meaning: "wait, slow down",                            example: "Hold your horses, I'm coming!" },
  { idiom: "Under the weather",        meaning: "feeling a little sick",                      example: "I'm staying home, I feel under the weather." },
  { idiom: "Two peas in a pod",        meaning: "very similar, often best friends",           example: "Those twins are like two peas in a pod." },
  { idiom: "On cloud nine",            meaning: "very happy",                                 example: "She was on cloud nine when she won." },
  { idiom: "When pigs fly",            meaning: "never going to happen",                      example: "He'll eat broccoli when pigs fly." },
  { idiom: "Easy as pie",              meaning: "very easy",                                  example: "Riding a bike is easy as pie once you learn." },
  { idiom: "Lend a hand",              meaning: "to help",                                    example: "Can you lend a hand with the washing?" },
  { idiom: "All ears",                 meaning: "listening very carefully",                   example: "Tell me about it — I'm all ears!" },
  { idiom: "Costs an arm and a leg",   meaning: "very expensive",                             example: "That toy costs an arm and a leg." },
  { idiom: "Break the ice",            meaning: "start a conversation with new people",       example: "He told a joke to break the ice." },
  { idiom: "Butterflies in my tummy",  meaning: "feeling nervous and excited",                example: "I had butterflies in my tummy before the show." },
  { idiom: "Don't cry over spilled milk", meaning: "don't be upset about something small",    example: "I dropped my biscuit, but don't cry over spilled milk." },
  { idiom: "A bit fishy",              meaning: "something seems suspicious",                 example: "His story sounds a bit fishy." },
  { idiom: "Bite off more than you can chew", meaning: "take on too much",                    example: "Don't bite off more than you can chew today." },
  { idiom: "In hot water",             meaning: "in trouble",                                 example: "He got in hot water for drawing on the wall." },
  { idiom: "Crocodile tears",          meaning: "fake crying",                                example: "She cried crocodile tears to get ice cream." },
  { idiom: "Let the cat out of the bag", meaning: "reveal a secret by accident",              example: "Oops, I let the cat out of the bag." },
  { idiom: "Get cold feet",            meaning: "feel nervous about something",               example: "She got cold feet right before her performance." },
  { idiom: "Bee in your bonnet",       meaning: "something you keep talking about",           example: "She has a bee in her bonnet about birds today." },
  { idiom: "Like a fish out of water", meaning: "feeling out of place",                       example: "He felt like a fish out of water on his first day." },
  { idiom: "Storm in a teacup",        meaning: "big fuss over something small",              example: "It was just a storm in a teacup, really." },
  { idiom: "A whole new ball game",    meaning: "a totally new situation",                    example: "P1 is a whole new ball game!" },
  { idiom: "Hit the nail on the head", meaning: "get exactly the right answer",               example: "You hit the nail on the head with that guess!" },
  { idiom: "The early bird catches the worm", meaning: "those who start early do best",      example: "She got there first because the early bird catches the worm." },
  { idiom: "A piece of the puzzle",    meaning: "part of a bigger thing",                     example: "Practising every day is a piece of the puzzle." },
  { idiom: "Time flies",               meaning: "time passes very quickly",                   example: "Wow, time flies when you're having fun!" },
  { idiom: "Walking on sunshine",      meaning: "feeling super happy",                        example: "After winning, I was walking on sunshine." },
  { idiom: "A bird in the hand",       meaning: "what you already have is better than what you might get", example: "A bird in the hand is worth two in the bush." },
  { idiom: "Curiosity killed the cat", meaning: "being too curious can get you in trouble",    example: "Don't peek, curiosity killed the cat!" },
  { idiom: "The ball is in your court", meaning: "now it's your turn to decide",              example: "I've given you the choice — the ball is in your court." },
  { idiom: "Smell a rat",              meaning: "feel something is wrong",                    example: "I smell a rat — those cookies were here yesterday!" },
  { idiom: "Fit as a fiddle",          meaning: "very healthy",                               example: "Grandpa is 80 and fit as a fiddle!" },
  { idiom: "Quick as a flash",         meaning: "extremely fast",                             example: "The cat was up the tree quick as a flash." },
  { idiom: "A little bird told me",    meaning: "I heard a secret",                           example: "A little bird told me it's your birthday!" },
  { idiom: "Look before you leap",     meaning: "think before you do something",              example: "Look before you leap — check the puddle first!" },
  { idiom: "Best of both worlds",      meaning: "you get good things from two choices",       example: "Living near the park is the best of both worlds." },
  { idiom: "Costs a pretty penny",     meaning: "very expensive",                             example: "That sparkly dress cost a pretty penny." },
  { idiom: "Cry your eyes out",        meaning: "cry a lot",                                  example: "She cried her eyes out when she lost her teddy." },
  { idiom: "Have a heart of gold",     meaning: "be very kind",                               example: "Auntie Mei has a heart of gold." },
  { idiom: "Take it with a grain of salt", meaning: "don't believe it completely",            example: "His fishing story? Take it with a grain of salt." },
  { idiom: "Better late than never",   meaning: "doing it late is still good",                example: "I finished the book — better late than never!" }
];

function getIdiomOfTheDay() {
  const today = new Date();
  const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 86400000);
  // Offset by 7 so IotD doesn't always rotate in step with WotD
  return IOTD_BANK[(dayOfYear + 7) % IOTD_BANK.length];
}
