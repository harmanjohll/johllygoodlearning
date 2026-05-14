// ============================================================
//  QUOTE OF THE DAY — 50 P1-friendly inspiring + cheeky quotes
// ============================================================

const QOTD_BANK = [
  { quote: "You are braver than you believe, stronger than you seem, and smarter than you think.", who: "A.A. Milne" },
  { quote: "Be the rainbow in someone's cloud.",                                                   who: "Maya Angelou" },
  { quote: "Mistakes are proof that you are trying.",                                              who: "Anon" },
  { quote: "If at first you don't succeed, try, try again.",                                       who: "Thomas H. Palmer" },
  { quote: "Do small things with great love.",                                                     who: "Mother Teresa" },
  { quote: "Stars can't shine without darkness.",                                                  who: "Anon" },
  { quote: "Be kind whenever possible. It is always possible.",                                    who: "The Dalai Lama" },
  { quote: "Believe you can and you're halfway there.",                                            who: "Theodore Roosevelt" },
  { quote: "The expert in anything was once a beginner.",                                          who: "Helen Hayes" },
  { quote: "A jug fills drop by drop.",                                                            who: "Buddha" },
  { quote: "Never stop being curious.",                                                            who: "Anon" },
  { quote: "Today you are you, that is truer than true.",                                          who: "Dr. Seuss" },
  { quote: "There is no friend as loyal as a book.",                                               who: "Ernest Hemingway" },
  { quote: "The more that you read, the more things you will know.",                               who: "Dr. Seuss" },
  { quote: "It always seems impossible until it's done.",                                          who: "Nelson Mandela" },
  { quote: "You can't go back and change the beginning, but you can start where you are.",         who: "C.S. Lewis" },
  { quote: "Falling down is part of life. Getting back up is living.",                             who: "Anon" },
  { quote: "Why fit in when you were born to stand out?",                                          who: "Dr. Seuss" },
  { quote: "Do or do not. There is no try.",                                                       who: "Yoda" },
  { quote: "I have not failed. I've just found 10,000 ways that won't work.",                      who: "Thomas Edison" },
  { quote: "Every story has an end, but in life every ending is just a new beginning.",            who: "Anon" },
  { quote: "Kindness is a language everyone understands.",                                         who: "Anon" },
  { quote: "Even the longest journey begins with a single step.",                                  who: "Lao Tzu" },
  { quote: "A dream you don't act on is just a wish.",                                             who: "Anon" },
  { quote: "Don't let anyone dull your sparkle.",                                                  who: "Anon" },
  { quote: "Smile, it's free therapy.",                                                            who: "Doug Horton" },
  { quote: "Imagination is more important than knowledge.",                                        who: "Albert Einstein" },
  { quote: "She believed she could, so she did.",                                                  who: "R.S. Grey" },
  { quote: "Be a flamingo in a flock of pigeons.",                                                 who: "Anon" },
  { quote: "Practice makes progress.",                                                             who: "Anon" },
  { quote: "Don't compare your beginning to someone else's middle.",                               who: "Tim Hiller" },
  { quote: "Today's reader is tomorrow's leader.",                                                 who: "Margaret Fuller" },
  { quote: "Throw kindness around like confetti.",                                                 who: "Anon" },
  { quote: "Tough times don't last. Tough kids do.",                                               who: "Anon" },
  { quote: "You miss 100% of the shots you don't take.",                                           who: "Wayne Gretzky" },
  { quote: "Hard work beats talent when talent doesn't work hard.",                                who: "Tim Notke" },
  { quote: "Where there's a will, there's a way.",                                                 who: "Anon" },
  { quote: "Plant kindness, gather love.",                                                         who: "Proverb" },
  { quote: "The best way to predict the future is to create it.",                                  who: "Peter Drucker" },
  { quote: "What you do today can improve all your tomorrows.",                                    who: "Ralph Marston" },
  { quote: "Don't be afraid to give up the good to go for the great.",                             who: "John D. Rockefeller" },
  { quote: "Try to be a rainbow in someone else's cloud.",                                         who: "Maya Angelou" },
  { quote: "Strong people don't put others down. They lift them up.",                              who: "Michael P. Watson" },
  { quote: "Yesterday I was clever, so I wanted to change the world. Today I am wise, so I am changing myself.", who: "Rumi" },
  { quote: "A book is a dream that you hold in your hand.",                                        who: "Neil Gaiman" },
  { quote: "I am still learning.",                                                                 who: "Michelangelo" },
  { quote: "Be soft. Don't let the world make you hard.",                                          who: "Iain Thomas" },
  { quote: "If you can dream it, you can do it.",                                                  who: "Walt Disney" },
  { quote: "Little progress is still progress.",                                                   who: "Anon" },
  { quote: "Whatever you are, be a good one.",                                                     who: "Abraham Lincoln" }
];

function getQuoteOfTheDay() {
  const today = new Date();
  const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 86400000);
  // Offset by 14 so QotD rotates independently
  return QOTD_BANK[(dayOfYear + 14) % QOTD_BANK.length];
}
