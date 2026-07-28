// ============================================================
//  MALAY DATA — Vocabulary banks for Bahasa Melayu (P1)
// ============================================================

// Huruf vokal (vowels) and suku kata (syllables)
const MALAY_VOWELS = ['a','e','i','o','u'];
const MALAY_SUKU_KATA = [
  { syllable: 'ba', word: 'bapa', meaning: 'father', emoji: '👨' },
  { syllable: 'bu', word: 'buku', meaning: 'book',   emoji: '📖' },
  { syllable: 'ka', word: 'kaki', meaning: 'leg',    emoji: '🦵' },
  { syllable: 'ki', word: 'kita', meaning: 'us',     emoji: '👥' },
  { syllable: 'la', word: 'lampu', meaning: 'lamp',   emoji: '💡' },
  { syllable: 'ma', word: 'mata', meaning: 'eye',    emoji: '👁️' },
  { syllable: 'me', word: 'meja', meaning: 'table',  emoji: '🪑' },
  { syllable: 'na', word: 'nasi', meaning: 'rice',   emoji: '🍚' },
  { syllable: 'pi', word: 'pisang', meaning: 'banana',emoji: '🍌' },
  { syllable: 'ru', word: 'rumah', meaning: 'house', emoji: '🏠' },
  { syllable: 'sa', word: 'sapu', meaning: 'sweep',  emoji: '🧹' },
  { syllable: 'ti', word: 'tikus', meaning: 'mouse', emoji: '🐭' },
  { syllable: 'tu', word: 'tunjuk',meaning: 'point', emoji: '👉' }
];

// Nombor satu hingga dua puluh (1-20)
const MALAY_NUMBERS = [
  { n: 1,  word: 'satu',           shortWord: 'satu' },
  { n: 2,  word: 'dua',            shortWord: 'dua' },
  { n: 3,  word: 'tiga',           shortWord: 'tiga' },
  { n: 4,  word: 'empat',          shortWord: 'empat' },
  { n: 5,  word: 'lima',           shortWord: 'lima' },
  { n: 6,  word: 'enam',           shortWord: 'enam' },
  { n: 7,  word: 'tujuh',          shortWord: 'tujuh' },
  { n: 8,  word: 'lapan',          shortWord: 'lapan' },
  { n: 9,  word: 'sembilan',       shortWord: 'sembilan' },
  { n: 10, word: 'sepuluh',        shortWord: 'sepuluh' },
  { n: 11, word: 'sebelas',        shortWord: 'sebelas' },
  { n: 12, word: 'dua belas',      shortWord: 'dua belas' },
  { n: 13, word: 'tiga belas',     shortWord: 'tiga belas' },
  { n: 14, word: 'empat belas',    shortWord: 'empat belas' },
  { n: 15, word: 'lima belas',     shortWord: 'lima belas' },
  { n: 16, word: 'enam belas',     shortWord: 'enam belas' },
  { n: 17, word: 'tujuh belas',    shortWord: 'tujuh belas' },
  { n: 18, word: 'lapan belas',    shortWord: 'lapan belas' },
  { n: 19, word: 'sembilan belas', shortWord: 'sembilan belas' },
  { n: 20, word: 'dua puluh',      shortWord: 'dua puluh' }
];

// Salam (greetings) and polite words
const MALAY_GREETINGS = [
  { malay: 'Selamat pagi',  english: 'Good morning',   emoji: '🌅', context: 'when you wake up' },
  { malay: 'Selamat petang',english: 'Good afternoon', emoji: '☀️',  context: 'in the late afternoon' },
  { malay: 'Selamat malam', english: 'Good night',     emoji: '🌙', context: 'at night, before sleep' },
  { malay: 'Apa khabar?',   english: 'How are you?',   emoji: '😊', context: 'asking how someone is' },
  { malay: 'Khabar baik',   english: 'I am well',      emoji: '👍', context: 'replying you are fine' },
  { malay: 'Terima kasih',  english: 'Thank you',      emoji: '🙏', context: 'when someone helps you' },
  { malay: 'Sama-sama',     english: "You're welcome", emoji: '🤗', context: 'after someone thanks you' },
  { malay: 'Maaf',          english: 'Sorry / excuse me', emoji: '🙅', context: 'when you make a mistake' },
  { malay: 'Tolong',        english: 'Please / help',  emoji: '🤲', context: 'when you ask for something' },
  { malay: 'Selamat tinggal',english: 'Goodbye',       emoji: '👋', context: 'when you leave' }
];

// Warna (colours)
const MALAY_COLOURS = [
  { malay: 'merah',  english: 'red',     hex: '#ff5252', emoji: '❤️' },
  { malay: 'biru',   english: 'blue',    hex: '#4a90e2', emoji: '💙' },
  { malay: 'kuning', english: 'yellow',  hex: '#ffd700', emoji: '💛' },
  { malay: 'hijau',  english: 'green',   hex: '#4caf50', emoji: '💚' },
  { malay: 'hitam',  english: 'black',   hex: '#222222', emoji: '🖤' },
  { malay: 'putih',  english: 'white',   hex: '#f5f5f5', emoji: '🤍' },
  { malay: 'ungu',   english: 'purple',  hex: '#9c27b0', emoji: '💜' },
  { malay: 'jingga', english: 'orange',  hex: '#ff9800', emoji: '🧡' },
  { malay: 'merah jambu', english: 'pink', hex: '#ff7bdb', emoji: '🌸' },
  { malay: 'coklat', english: 'brown',   hex: '#795548', emoji: '🤎' }
];

// Keluarga (family)
const MALAY_FAMILY = [
  { malay: 'ibu',     english: 'mother',     emoji: '👩' },
  { malay: 'bapa',    english: 'father',     emoji: '👨' },
  { malay: 'abang',   english: 'older brother', emoji: '👦' },
  { malay: 'kakak',   english: 'older sister',  emoji: '👧' },
  { malay: 'adik',    english: 'younger sibling', emoji: '👶' },
  { malay: 'nenek',   english: 'grandmother', emoji: '👵' },
  { malay: 'datuk',   english: 'grandfather', emoji: '👴' },
  { malay: 'pak cik', english: 'uncle',      emoji: '🧔' },
  { malay: 'mak cik', english: 'aunty',      emoji: '💃' },
  { malay: 'sepupu',  english: 'cousin',     emoji: '👥' }
];

// Haiwan (animals)
const MALAY_ANIMALS = [
  { malay: 'kucing',  english: 'cat',     emoji: '🐱' },
  { malay: 'anjing',  english: 'dog',     emoji: '🐶' },
  { malay: 'ikan',    english: 'fish',    emoji: '🐟' },
  { malay: 'ayam',    english: 'chicken', emoji: '🐔' },
  { malay: 'burung',  english: 'bird',    emoji: '🐦' },
  { malay: 'lembu',   english: 'cow',     emoji: '🐄' },
  { malay: 'kambing', english: 'goat',    emoji: '🐐' },
  { malay: 'arnab',   english: 'rabbit',  emoji: '🐇' },
  { malay: 'tikus',   english: 'mouse',   emoji: '🐭' },
  { malay: 'kupu-kupu', english: 'butterfly', emoji: '🦋' },
  { malay: 'gajah',   english: 'elephant', emoji: '🐘' },
  { malay: 'singa',   english: 'lion',    emoji: '🦁' }
];

// Anggota badan (body parts)
const MALAY_BODY = [
  { malay: 'kepala',   english: 'head',     emoji: '🧠' },
  { malay: 'rambut',   english: 'hair',     emoji: '💇' },
  { malay: 'mata',     english: 'eye',      emoji: '👁️' },
  { malay: 'hidung',   english: 'nose',     emoji: '👃' },
  { malay: 'mulut',    english: 'mouth',    emoji: '👄' },
  { malay: 'telinga',  english: 'ear',      emoji: '👂' },
  { malay: 'tangan',   english: 'hand',     emoji: '✋' },
  { malay: 'kaki',     english: 'foot/leg', emoji: '🦶' },
  { malay: 'jari',     english: 'finger',   emoji: '👆' },
  { malay: 'perut',    english: 'tummy',    emoji: '🤲' }
];

// Makanan (food and drink)
const MALAY_FOOD = [
  { malay: 'nasi',     english: 'rice',     emoji: '🍚' },
  { malay: 'roti',     english: 'bread',    emoji: '🍞' },
  { malay: 'ayam',     english: 'chicken',  emoji: '🍗' },
  { malay: 'ikan',     english: 'fish',     emoji: '🐟' },
  { malay: 'sayur',    english: 'vegetable', emoji: '🥦' },
  { malay: 'buah',     english: 'fruit',    emoji: '🍎' },
  { malay: 'pisang',   english: 'banana',   emoji: '🍌' },
  { malay: 'epal',     english: 'apple',    emoji: '🍏' },
  { malay: 'air',      english: 'water',    emoji: '💧' },
  { malay: 'susu',     english: 'milk',     emoji: '🥛' },
  { malay: 'gula-gula',english: 'sweets',   emoji: '🍬' },
  { malay: 'kuih',     english: 'kueh',     emoji: '🍰' }
];

// Hari & cuaca (days and weather)
const MALAY_DAYS = [
  { malay: 'Isnin',   english: 'Monday' },
  { malay: 'Selasa',  english: 'Tuesday' },
  { malay: 'Rabu',    english: 'Wednesday' },
  { malay: 'Khamis',  english: 'Thursday' },
  { malay: 'Jumaat',  english: 'Friday' },
  { malay: 'Sabtu',   english: 'Saturday' },
  { malay: 'Ahad',    english: 'Sunday' }
];

const MALAY_WEATHER = [
  { malay: 'cerah',  english: 'sunny',     emoji: '☀️' },
  { malay: 'hujan',  english: 'rainy',     emoji: '🌧️' },
  { malay: 'mendung',english: 'cloudy',    emoji: '☁️' },
  { malay: 'angin',  english: 'windy',     emoji: '💨' },
  { malay: 'panas',  english: 'hot',       emoji: '🔥' },
  { malay: 'sejuk',  english: 'cold',      emoji: '❄️' }
];

// Simple sentence frames (P1 Ayat Mudah)
const MALAY_SENTENCE_FRAMES = [
  { template: 'Saya suka {food}.',        gloss: 'I like {food}.',        slot: 'food' },
  { template: 'Ini ialah {animal}.',      gloss: 'This is a {animal}.',   slot: 'animal' },
  { template: '{family} saya baik.',      gloss: 'My {family} is kind.',  slot: 'family' },
  { template: 'Warna {colour} cantik.',   gloss: 'The colour {colour} is pretty.', slot: 'colour' },
  { template: 'Saya ada {number} {food}.',gloss: 'I have {number} {food}.', slot: 'number+food' },
  { template: 'Selamat {greeting}!',      gloss: 'Good {greeting}!',      slot: 'time' }
];
