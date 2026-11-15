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
  { malay: 'kepala',   english: 'head',     emoji: '👤' },   // was a brain, which is otak
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
  // "angin" is the noun, wind. The weather word for windy is "berangin":
  // Hari ini berangin. (It is windy today.)
  { malay: 'berangin', english: 'windy',   emoji: '💨' },
  { malay: 'panas',  english: 'hot',       emoji: '🔥' },
  { malay: 'sejuk',  english: 'cold',      emoji: '❄️' }
];

// Simple sentence frames (P1 Ayat Mudah)
//
// `example` is what a child actually sees. The flashcards used to print
// the raw template, braces and all ("Saya ada {number} {food}."), and that
// one frame also implied a number goes straight before a noun. It does
// not: counting needs a penjodoh bilangan, so it is "dua biji epal", and
// uncountables like air, nasi and susu cannot be counted this way at all.
const MALAY_SENTENCE_FRAMES = [
  { template: 'Saya suka {food}.',        gloss: 'I like {food}.',        slot: 'food',
    example: 'Saya suka nasi.',           exampleGloss: 'I like rice.' },
  { template: 'Ini ialah {animal}.',      gloss: 'This is a {animal}.',   slot: 'animal',
    example: 'Ini ialah kucing.',         exampleGloss: 'This is a cat.' },
  { template: '{family} saya baik.',      gloss: 'My {family} is kind.',  slot: 'family',
    example: 'Ibu saya baik.',            exampleGloss: 'My mother is kind.' },
  { template: 'Warna {colour} cantik.',   gloss: 'The colour {colour} is pretty.', slot: 'colour',
    example: 'Warna merah cantik.',       exampleGloss: 'The colour red is pretty.' },
  { template: 'Saya ada {number} {classifier} {fruit}.', gloss: 'I have {number} {fruit}.', slot: 'number+classifier+fruit',
    example: 'Saya ada dua biji epal.',   exampleGloss: 'I have two apples.' },
  { template: 'Selamat {greeting}!',      gloss: 'Good {greeting}!',      slot: 'time',
    example: 'Selamat pagi!',             exampleGloss: 'Good morning!' }
];

// ============================================================
//  PRIMARY 2 LAYER — data for the ten P2 skills
//
//  STATUS: AWAITING HUMAN REVIEW BY A MALAY SPEAKER.
//  Every word and sentence below is listed, with its English
//  gloss, in src/malay/P2_REVIEW.md (rebuilt from this file by
//  `node test/make-p2-review.js`). Nothing here is copied from a
//  book or past paper.
//
//  House rules for anything added here:
//   - Standard Bahasa Melayu as taught in Singapore schools.
//   - Every sentence starts with a capital and ends with . or ?
//   - Every question has exactly one defensible answer. Where a
//     second word could be argued, it is kept out of the choices
//     (see the `not` and `avoid` lists) rather than marked wrong.
//   - If in doubt, leave it out.
// ============================================================

// ---------- 1. IMBUHAN AWALAN ----------
// meN- forms. test/malay-p2.test.js recomputes every `form` from the
// root with its own copy of the assimilation rules.
const MALAY_P2_MEN = [
  // me- before l, m, n, ny, r
  { root: 'lukis',   form: 'melukis',    en: 'draw' },
  { root: 'lompat',  form: 'melompat',   en: 'jump' },
  { root: 'lawat',   form: 'melawat',    en: 'visit' },
  { root: 'lihat',   form: 'melihat',    en: 'see' },
  { root: 'masak',   form: 'memasak',    en: 'cook' },
  { root: 'nanti',   form: 'menanti',    en: 'wait' },
  { root: 'nyanyi',  form: 'menyanyi',   en: 'sing' },
  { root: 'rangkak', form: 'merangkak',  en: 'crawl' },
  { root: 'rasa',    form: 'merasa',     en: 'taste' },
  // mem- before b
  { root: 'baca',    form: 'membaca',    en: 'read' },
  { root: 'beli',    form: 'membeli',    en: 'buy' },
  { root: 'buat',    form: 'membuat',    en: 'make' },
  { root: 'bawa',    form: 'membawa',    en: 'bring' },
  { root: 'buka',    form: 'membuka',    en: 'open' },
  { root: 'basuh',   form: 'membasuh',   en: 'wash' },
  { root: 'bantu',   form: 'membantu',   en: 'help' },
  { root: 'buang',   form: 'membuang',   en: 'throw away' },
  { root: 'beri',    form: 'memberi',    en: 'give' },
  // mem- before p, and the p drops
  { root: 'pukul',   form: 'memukul',    en: 'hit' },
  { root: 'pakai',   form: 'memakai',    en: 'wear' },
  { root: 'potong',  form: 'memotong',   en: 'cut' },
  { root: 'pegang',  form: 'memegang',   en: 'hold' },
  { root: 'pilih',   form: 'memilih',    en: 'choose' },
  { root: 'panjat',  form: 'memanjat',   en: 'climb' },
  { root: 'pinjam',  form: 'meminjam',   en: 'borrow' },
  { root: 'padam',   form: 'memadam',    en: 'erase' },
  // men- before c, d, j
  { root: 'cari',    form: 'mencari',    en: 'look for' },
  { root: 'cuci',    form: 'mencuci',    en: 'wash' },
  { root: 'curi',    form: 'mencuri',    en: 'steal' },
  { root: 'cabut',   form: 'mencabut',   en: 'pull out' },
  { root: 'dengar',  form: 'mendengar',  en: 'listen' },
  { root: 'dapat',   form: 'mendapat',   en: 'get' },
  { root: 'jual',    form: 'menjual',    en: 'sell' },
  { root: 'jaga',    form: 'menjaga',    en: 'look after' },
  { root: 'jawab',   form: 'menjawab',   en: 'answer' },
  { root: 'jahit',   form: 'menjahit',   en: 'sew' },
  { root: 'jemur',   form: 'menjemur',   en: 'dry in the sun' },
  // men- before t, and the t drops
  { root: 'tulis',   form: 'menulis',    en: 'write' },
  { root: 'tolong',  form: 'menolong',   en: 'help' },
  { root: 'tanam',   form: 'menanam',    en: 'plant' },
  { root: 'tutup',   form: 'menutup',    en: 'close' },
  { root: 'tendang', form: 'menendang',  en: 'kick' },
  { root: 'tangkap', form: 'menangkap',  en: 'catch' },
  { root: 'tunggu',  form: 'menunggu',   en: 'wait for' },
  { root: 'tarik',   form: 'menarik',    en: 'pull' },
  { root: 'tolak',   form: 'menolak',    en: 'push' },
  { root: 'tiup',    form: 'meniup',     en: 'blow' },
  { root: 'tonton',  form: 'menonton',   en: 'watch' },
  { root: 'tangis',  form: 'menangis',   en: 'cry' },
  { root: 'tari',    form: 'menari',     en: 'dance' },
  // meng- before a vowel, g or h
  { root: 'ambil',   form: 'mengambil',  en: 'take' },
  { root: 'ajar',    form: 'mengajar',   en: 'teach' },
  { root: 'angkat',  form: 'mengangkat', en: 'lift' },
  { root: 'ikat',    form: 'mengikat',   en: 'tie' },
  { root: 'isi',     form: 'mengisi',    en: 'fill' },
  { root: 'ikut',    form: 'mengikut',   en: 'follow' },
  { root: 'ukur',    form: 'mengukur',   en: 'measure' },
  { root: 'usik',    form: 'mengusik',   en: 'tease' },
  { root: 'gosok',   form: 'menggosok',  en: 'brush' },
  { root: 'gali',    form: 'menggali',   en: 'dig' },
  { root: 'gunting', form: 'menggunting', en: 'cut with scissors' },
  { root: 'goreng',  form: 'menggoreng', en: 'fry' },
  { root: 'gantung', form: 'menggantung', en: 'hang up' },
  { root: 'hantar',  form: 'menghantar', en: 'send' },
  { root: 'hias',    form: 'menghias',   en: 'decorate' },
  { root: 'hidang',  form: 'menghidang', en: 'serve food' },
  { root: 'hitung',  form: 'menghitung', en: 'count' },
  // meng- before k, and the k drops
  { root: 'kira',    form: 'mengira',    en: 'count' },
  { root: 'kutip',   form: 'mengutip',   en: 'pick up' },
  { root: 'kejar',   form: 'mengejar',   en: 'chase' },
  { root: 'kupas',   form: 'mengupas',   en: 'peel' },
  { root: 'kayuh',   form: 'mengayuh',   en: 'pedal' },
  { root: 'kunyah',  form: 'mengunyah',  en: 'chew' },
  { root: 'kemas',   form: 'mengemas',   en: 'tidy up' },
  { root: 'kunci',   form: 'mengunci',   en: 'lock' },
  // meny- before s, and the s drops
  { root: 'sapu',    form: 'menyapu',    en: 'sweep' },
  { root: 'siram',   form: 'menyiram',   en: 'water (plants)' },
  { root: 'sikat',   form: 'menyikat',   en: 'comb' },
  { root: 'simpan',  form: 'menyimpan',  en: 'keep' },
  { root: 'susun',   form: 'menyusun',   en: 'arrange' },
  { root: 'sambut',  form: 'menyambut',  en: 'welcome' },
  { root: 'sepak',   form: 'menyepak',   en: 'kick' },
  { root: 'salin',   form: 'menyalin',   en: 'copy' },
  { root: 'sidai',   form: 'menyidai',   en: 'hang out to dry' },
  { root: 'sentuh',  form: 'menyentuh',  en: 'touch' },
  // menge- before a root of one syllable
  { root: 'cat',     form: 'mengecat',   en: 'paint' },
  { root: 'lap',     form: 'mengelap',   en: 'wipe' },
  { root: 'pam',     form: 'mengepam',   en: 'pump' }
];

// Wrong choices are built by gluing the other prefixes onto the root
// ("mentulis", "memtulis"). A few of those accidents are real words
// (men + tari is mentari, the sun; men + gali is mengali, to multiply),
// or are spellings some people do use (melap, mencat), so they are
// never offered.
const MALAY_P2_MEN_REAL_WORDS = [
  'mentari', 'mengali', 'memikat', 'menyikat', 'menyisi', 'menyambil',
  'menyukur', 'menyikut', 'mengantung', 'melap', 'mencat', 'mempam'
];

// ber- forms. Before r the prefix is be- (berenang, berehat), and
// kerja takes be- too (bekerja).
const MALAY_P2_BER = [
  { root: 'main',    form: 'bermain',    en: 'play' },
  { root: 'lari',    form: 'berlari',    en: 'run' },
  { root: 'jalan',   form: 'berjalan',   en: 'walk' },
  { root: 'cakap',   form: 'bercakap',   en: 'speak' },
  { root: 'diri',    form: 'berdiri',    en: 'stand' },
  { root: 'senam',   form: 'bersenam',   en: 'exercise' },
  { root: 'baris',   form: 'berbaris',   en: 'line up' },
  { root: 'kumpul',  form: 'berkumpul',  en: 'gather' },
  { root: 'basikal', form: 'berbasikal', en: 'cycle' },
  { root: 'kawan',   form: 'berkawan',   en: 'be friends' },
  { root: 'tanya',   form: 'bertanya',   en: 'ask' },
  { root: 'cerita',  form: 'bercerita',  en: 'tell a story' },
  { root: 'kerja',   form: 'bekerja',    en: 'work' },
  { root: 'renang',  form: 'berenang',   en: 'swim' },
  { root: 'rehat',   form: 'berehat',    en: 'rest' }
];

// Pick the right word for the sentence. `o` holds the wrong choices.
// No ter- form of a verb that takes an object is ever a wrong choice,
// because "Ali tertendang bola" (kicked it by accident) is good Malay.
const MALAY_P2_IMBUHAN_AYAT = [
  { p: 'me',  s: 'Ali ____ buku cerita di perpustakaan.', a: 'membaca', o: ['dibaca', 'berbaca'], en: 'Ali reads a storybook in the library.' },
  { p: 'me',  s: 'Ibu sedang ____ sayur di dapur.', a: 'memotong', o: ['dipotong', 'berpotong'], en: 'Mother is cutting vegetables in the kitchen.' },
  { p: 'me',  s: 'Kakak ____ lantai setiap pagi.', a: 'menyapu', o: ['disapu', 'bersapu'], en: 'My elder sister sweeps the floor every morning.' },
  { p: 'me',  s: 'Cikgu Rahim ____ kami Matematik.', a: 'mengajar', o: ['diajar', 'belajar'], en: 'Cikgu Rahim teaches us Mathematics.' },
  { p: 'me',  s: 'Adik ____ gambar seekor kucing.', a: 'melukis', o: ['dilukis', 'berlukis'], en: 'My little brother or sister draws a picture of a cat.' },
  { p: 'me',  s: 'Ayah ____ kereta pada hari Ahad.', a: 'mencuci', o: ['dicuci', 'bercuci'], en: 'Father washes the car on Sunday.' },
  { p: 'ber', s: 'Kami ____ bola sepak di padang.', a: 'bermain', o: ['dimain', 'memain'], en: 'We play football on the field.' },
  { p: 'ber', s: 'Murid-murid ____ di kolam renang sekolah.', a: 'berenang', o: ['direnang', 'merenang'], en: 'The pupils swim in the school swimming pool.' },
  { p: 'ber', s: 'Datuk ____ kaki di taman setiap pagi.', a: 'berjalan', o: ['dijalan', 'menjalan'], en: 'Grandfather walks in the park every morning.' },
  { p: 'ber', s: 'Bapa saya ____ di sebuah hospital.', a: 'bekerja', o: ['dikerja', 'mengerja'], en: 'My father works at a hospital.' },
  { p: 'ber', s: 'Nenek suka ____ tentang zaman dahulu.', a: 'bercerita', o: ['dicerita', 'mencerita'], en: 'Grandmother likes to tell stories about the old days.' },
  { p: 'di',  s: 'Buku itu ____ oleh Ali.', a: 'dibaca', o: ['membaca', 'berbaca'], en: 'The book is read by Ali.' },
  { p: 'di',  s: 'Bola itu ____ oleh Ahmad.', a: 'ditendang', o: ['menendang', 'bertendang'], en: 'The ball is kicked by Ahmad.' },
  { p: 'di',  s: 'Kek itu ____ oleh ibu.', a: 'dibuat', o: ['membuat', 'berbuat'], en: 'The cake is made by Mother.' },
  { p: 'di',  s: 'Lantai itu ____ oleh kakak.', a: 'disapu', o: ['menyapu', 'bersapu'], en: 'The floor is swept by my elder sister.' },
  { p: 'di',  s: 'Pokok bunga itu ____ oleh datuk setiap petang.', a: 'disiram', o: ['menyiram', 'bersiram'], en: 'The flowering plant is watered by Grandfather every evening.' },
  { p: 'di',  s: 'Surat itu ____ oleh Siti.', a: 'ditulis', o: ['menulis', 'penulis'], en: 'The letter is written by Siti.' },
  { p: 'di',  s: 'Ikan itu ____ oleh kucing.', a: 'dimakan', o: ['memakan', 'bermakan'], en: 'The fish is eaten by the cat.' },
  { p: 'ter', s: 'Adik ____ di atas sofa kerana terlalu penat.', a: 'tertidur', o: ['menidur', 'ditidur'], en: 'My little brother or sister fell asleep on the sofa from being too tired.' },
  { p: 'ter', s: 'Nenek ____ di bilik air yang licin.', a: 'terjatuh', o: ['menjatuh', 'dijatuh'], en: 'Grandmother fell down in the slippery bathroom.' },
  { p: 'ter', s: 'Saya ____ membawa buku latihan hari ini.', a: 'terlupa', o: ['melupa', 'dilupa'], en: 'I forgot to bring my exercise book today.' },
  { p: 'ter', s: 'Bayi itu ____ apabila melihat ibunya.', a: 'tersenyum', o: ['menyenyum', 'disenyum'], en: 'The baby smiled when it saw its mother.' },
  { p: 'ter', s: 'Saya ____ apabila mendengar bunyi guruh yang kuat.', a: 'terkejut', o: ['mengejut', 'dikejut'], en: 'I was startled when I heard the loud thunder.' },
  { p: 'ter', s: 'Payung saya ____ di dalam bas.', a: 'tertinggal', o: ['meninggal', 'bertinggal'], en: 'My umbrella was left behind on the bus.' }
];

// ---------- 2. KATA GANDA ----------
// Plain doubling for "more than one". Words whose doubled form means
// something else (orang-orang, kuda-kuda, mata-mata) are kept out.
const MALAY_P2_GANDA_PLURAL = [
  { w: 'buku',    one: 'a book',    many: 'books' },
  { w: 'murid',   one: 'a pupil',   many: 'pupils' },
  { w: 'kucing',  one: 'a cat',     many: 'cats' },
  { w: 'rumah',   one: 'a house',   many: 'houses' },
  { w: 'pokok',   one: 'a tree',    many: 'trees' },
  { w: 'bunga',   one: 'a flower',  many: 'flowers' },
  { w: 'kereta',  one: 'a car',     many: 'cars' },
  { w: 'guru',    one: 'a teacher', many: 'teachers' },
  { w: 'kawan',   one: 'a friend',  many: 'friends' },
  { w: 'burung',  one: 'a bird',    many: 'birds' },
  { w: 'meja',    one: 'a table',   many: 'tables' },
  { w: 'kerusi',  one: 'a chair',   many: 'chairs' },
  { w: 'beg',     one: 'a bag',     many: 'bags' },
  { w: 'pensel',  one: 'a pencil',  many: 'pencils' },
  { w: 'kasut',   one: 'a shoe',    many: 'shoes' },
  { w: 'pinggan', one: 'a plate',   many: 'plates' },
  { w: 'ikan',    one: 'a fish',    many: 'many fish' },
  { w: 'anak',    one: 'a child',   many: 'children' },
  { w: 'kedai',   one: 'a shop',    many: 'shops' },
  { w: 'basikal', one: 'a bicycle', many: 'bicycles' }
];

// Doubled words that are simply the name of one thing.
const MALAY_P2_GANDA_SEMU = [
  { w: 'rama-rama',     en: 'butterfly' },
  { w: 'kura-kura',     en: 'tortoise' },
  { w: 'labah-labah',   en: 'spider' },
  { w: 'lumba-lumba',   en: 'dolphin' },
  { w: 'biri-biri',     en: 'sheep' },
  { w: 'kunang-kunang', en: 'firefly' },
  { w: 'anai-anai',     en: 'termite' },
  { w: 'layang-layang', en: 'kite' },
  { w: 'gula-gula',     en: 'sweets' }
];

// Number + penjodoh bilangan + noun: the noun is never doubled.
const MALAY_P2_GANDA_FRASA = [
  { num: 'dua',     pb: 'buah',   n: 'buku',    en: 'two books' },
  { num: 'tiga',    pb: 'ekor',   n: 'kucing',  en: 'three cats' },
  { num: 'lima',    pb: 'orang',  n: 'murid',   en: 'five pupils' },
  { num: 'empat',   pb: 'batang', n: 'pensel',  en: 'four pencils' },
  { num: 'dua',     pb: 'helai',  n: 'baju',    en: 'two shirts' },
  { num: 'enam',    pb: 'biji',   n: 'telur',   en: 'six eggs' },
  { num: 'tiga',    pb: 'buah',   n: 'kereta',  en: 'three cars' },
  { num: 'dua',     pb: 'ekor',   n: 'burung',  en: 'two birds' },
  { num: 'sepuluh', pb: 'orang',  n: 'kawan',   en: 'ten friends' },
  { num: 'lapan',   pb: 'buah',   n: 'kerusi',  en: 'eight chairs' },
  { num: 'tujuh',   pb: 'ekor',   n: 'ikan',    en: 'seven fish' },
  { num: 'empat',   pb: 'orang',  n: 'guru',    en: 'four teachers' }
];

// After a number, or after semua, banyak, beberapa, para, setiap and
// kedua-dua, the noun stays single. Both wrong choices are doubled, so
// both break the same rule.
const MALAY_P2_GANDA_AYAT = [
  { s: 'Semua ____ sudah pulang ke rumah.', a: 'murid', o: ['murid-murid', 'guru-guru'], en: 'All the pupils have gone home.' },
  { s: 'Ayah membeli tiga ekor ____ di pasar.', a: 'ikan', o: ['ikan-ikan', 'ayam-ayam'], en: 'Father bought three fish at the market.' },
  { s: 'Banyak ____ hinggap di atas pokok itu.', a: 'burung', o: ['burung-burung', 'kucing-kucing'], en: 'Many birds perched on that tree.' },
  { s: 'Para ____ sedang bermesyuarat di bilik guru.', a: 'guru', o: ['guru-guru', 'murid-murid'], en: 'The teachers are having a meeting in the staff room.' },
  { s: 'Beberapa orang ____ sedang membaca di perpustakaan.', a: 'murid', o: ['murid-murid', 'kawan-kawan'], en: 'Several pupils are reading in the library.' },
  { s: 'Semua ____ di taman itu berwarna merah.', a: 'bunga', o: ['bunga-bunga', 'pokok-pokok'], en: 'All the flowers in that garden are red.' },
  { s: 'Saya ada dua orang ____ baik.', a: 'kawan', o: ['kawan-kawan', 'guru-guru'], en: 'I have two good friends.' },
  { s: 'Ibu membasuh lima helai ____.', a: 'baju', o: ['baju-baju', 'seluar-seluar'], en: 'Mother washed five shirts.' },
  { s: 'Banyak ____ diletakkan di tepi jalan.', a: 'kereta', o: ['kereta-kereta', 'bas-bas'], en: 'Many cars are parked by the roadside.' },
  { s: 'Setiap ____ mesti membawa botol air.', a: 'murid', o: ['murid-murid', 'guru-guru'], en: 'Every pupil must bring a water bottle.' },
  { s: 'Datuk menanam sepuluh batang ____ pisang.', a: 'pokok', o: ['pokok-pokok', 'bunga-bunga'], en: 'Grandfather planted ten banana trees.' },
  { s: 'Kedua-dua ____ itu milik abang saya.', a: 'basikal', o: ['basikal-basikal', 'kereta-kereta'], en: 'Both of those bicycles belong to my elder brother.' }
];

// Which whole sentence is right? Built two ways from each row:
//   "Murid-murid sedang beratur."            (no number, so doubled)
//   "Tiga orang murid sedang beratur."       (number, so single)
// The wrong sentences double the noun after Semua or after the number.
const MALAY_P2_GANDA_PILIH = [
  { n: 'murid',  pred: 'sedang beratur', num: 'Tiga orang', en: 'The pupils are lining up.', enNum: 'Three pupils are lining up.' },
  { n: 'kucing', pred: 'sedang tidur', num: 'Dua ekor', en: 'The cats are sleeping.', enNum: 'Two cats are sleeping.' },
  { n: 'burung', pred: 'terbang di langit', num: 'Lima ekor', en: 'The birds are flying in the sky.', enNum: 'Five birds are flying in the sky.' },
  { n: 'bunga',  pred: 'sudah kembang', num: 'Empat kuntum', en: 'The flowers have bloomed.', enNum: 'Four flowers have bloomed.' },
  { n: 'kereta', pred: 'berhenti di lampu isyarat', num: 'Tiga buah', en: 'The cars stopped at the traffic light.', enNum: 'Three cars stopped at the traffic light.' },
  { n: 'guru',   pred: 'sedang makan di kantin', num: 'Dua orang', en: 'The teachers are eating in the canteen.', enNum: 'Two teachers are eating in the canteen.' },
  { n: 'buku',   pred: 'tersusun di atas rak', num: 'Enam buah', en: 'The books are arranged on the shelf.', enNum: 'Six books are arranged on the shelf.' },
  { n: 'kawan',  pred: 'datang ke rumah saya', num: 'Lima orang', en: 'Friends came to my house.', enNum: 'Five friends came to my house.' }
];

// ---------- 3. PENJODOH BILANGAN ----------
// The nine core classifiers. A wrong choice is only ever drawn from
// this list, minus anything in the noun's `not` list (a classifier that
// some speakers also accept for that noun, so it must not be marked
// wrong).
const MALAY_P2_PB_CORE = ['orang', 'ekor', 'buah', 'biji', 'batang', 'helai', 'keping', 'kuntum', 'pasang'];
const MALAY_P2_PB_EXTRA = ['bilah', 'pucuk', 'utas', 'ketul', 'bentuk', 'kaki'];

const MALAY_P2_PB = [
  // orang: people
  { pb: 'orang', n: 'murid',     one: 'pupil',     many: 'pupils' },
  { pb: 'orang', n: 'guru',      one: 'teacher',   many: 'teachers' },
  { pb: 'orang', n: 'doktor',    one: 'doctor',    many: 'doctors' },
  { pb: 'orang', n: 'kawan',     one: 'friend',    many: 'friends' },
  { pb: 'orang', n: 'budak',     one: 'child',     many: 'children' },
  { pb: 'orang', n: 'jururawat', one: 'nurse',     many: 'nurses' },
  { pb: 'orang', n: 'nelayan',   one: 'fisherman', many: 'fishermen' },
  { pb: 'orang', n: 'petani',    one: 'farmer',    many: 'farmers' },
  // ekor: animals
  { pb: 'ekor', n: 'kucing',  one: 'cat',     many: 'cats' },
  { pb: 'ekor', n: 'ayam',    one: 'chicken', many: 'chickens' },
  { pb: 'ekor', n: 'ikan',    one: 'fish',    many: 'fish' },
  { pb: 'ekor', n: 'burung',  one: 'bird',    many: 'birds' },
  { pb: 'ekor', n: 'lembu',   one: 'cow',     many: 'cows' },
  { pb: 'ekor', n: 'arnab',   one: 'rabbit',  many: 'rabbits' },
  { pb: 'ekor', n: 'gajah',   one: 'elephant', many: 'elephants' },
  { pb: 'ekor', n: 'semut',   one: 'ant',     many: 'ants' },
  { pb: 'ekor', n: 'harimau', one: 'tiger',   many: 'tigers' },
  // buah: big or solid things
  { pb: 'buah', n: 'rumah',    one: 'house',    many: 'houses' },
  { pb: 'buah', n: 'kereta',   one: 'car',      many: 'cars' },
  { pb: 'buah', n: 'buku',     one: 'book',     many: 'books' },
  { pb: 'buah', n: 'meja',     one: 'table',    many: 'tables' },
  { pb: 'buah', n: 'kerusi',   one: 'chair',    many: 'chairs' },
  { pb: 'buah', n: 'bas',      one: 'bus',      many: 'buses' },
  { pb: 'buah', n: 'basikal',  one: 'bicycle',  many: 'bicycles' },
  { pb: 'buah', n: 'beg',      one: 'bag',      many: 'bags' },
  { pb: 'buah', n: 'sekolah',  one: 'school',   many: 'schools' },
  { pb: 'buah', n: 'komputer', one: 'computer', many: 'computers' },
  { pb: 'buah', n: 'almari',   one: 'cupboard', many: 'cupboards' },
  { pb: 'buah', n: 'katil',    one: 'bed',      many: 'beds' },
  // biji: small round things and fruit ("sebuah epal" is also heard,
  // so buah is never offered as a wrong choice for these)
  { pb: 'biji', n: 'telur',    one: 'egg',        many: 'eggs',        not: ['buah'] },
  { pb: 'biji', n: 'epal',     one: 'apple',      many: 'apples',      not: ['buah'] },
  { pb: 'biji', n: 'limau',    one: 'orange',     many: 'oranges',     not: ['buah'] },
  { pb: 'biji', n: 'guli',     one: 'marble',     many: 'marbles',     not: ['buah'] },
  { pb: 'biji', n: 'bola',     one: 'ball',       many: 'balls',       not: ['buah'] },
  { pb: 'biji', n: 'kelapa',   one: 'coconut',    many: 'coconuts',    not: ['buah'] },
  { pb: 'biji', n: 'tembikai', one: 'watermelon', many: 'watermelons', not: ['buah'] },
  { pb: 'biji', n: 'manggis',  one: 'mangosteen', many: 'mangosteens', not: ['buah'] },
  // batang: long, stick-like things
  { pb: 'batang', n: 'pensel',     one: 'pencil',     many: 'pencils' },
  { pb: 'batang', n: 'pen',        one: 'pen',        many: 'pens' },
  { pb: 'batang', n: 'pembaris',   one: 'ruler',      many: 'rulers',  not: ['keping'] },
  { pb: 'batang', n: 'pokok',      one: 'tree',       many: 'trees' },
  { pb: 'batang', n: 'sungai',     one: 'river',      many: 'rivers',  not: ['buah'] },
  { pb: 'batang', n: 'jalan',      one: 'road',       many: 'roads',   not: ['buah'] },
  { pb: 'batang', n: 'lilin',      one: 'candle',     many: 'candles' },
  { pb: 'batang', n: 'tiang',      one: 'pole',       many: 'poles' },
  { pb: 'batang', n: 'berus gigi', one: 'toothbrush', many: 'toothbrushes' },
  { pb: 'batang', n: 'penyapu',    one: 'broom',      many: 'brooms',  not: ['buah'] },
  // helai: thin, soft, flat things
  { pb: 'helai', n: 'baju',        one: 'shirt',        many: 'shirts',        not: ['pasang'] },
  { pb: 'helai', n: 'kertas',      one: 'sheet of paper', many: 'sheets of paper', not: ['keping'] },
  { pb: 'helai', n: 'tuala',       one: 'towel',        many: 'towels' },
  { pb: 'helai', n: 'daun',        one: 'leaf',         many: 'leaves',        not: ['keping'] },
  { pb: 'helai', n: 'seluar',      one: 'pair of trousers', many: 'pairs of trousers', not: ['pasang'] },
  { pb: 'helai', n: 'tudung',      one: 'headscarf',    many: 'headscarves' },
  { pb: 'helai', n: 'sapu tangan', one: 'handkerchief', many: 'handkerchiefs' },
  { pb: 'helai', n: 'selimut',     one: 'blanket',      many: 'blankets' },
  // keping: thin, stiff, flat things
  { pb: 'keping', n: 'roti',    one: 'slice of bread', many: 'slices of bread', not: ['biji', 'buah'] },
  { pb: 'keping', n: 'biskut',  one: 'biscuit',        many: 'biscuits',        not: ['biji'] },
  { pb: 'keping', n: 'gambar',  one: 'picture',        many: 'pictures',        not: ['helai', 'buah'] },
  { pb: 'keping', n: 'papan',   one: 'plank',          many: 'planks',          not: ['batang'] },
  { pb: 'keping', n: 'setem',   one: 'stamp',          many: 'stamps',          not: ['helai'] },
  { pb: 'keping', n: 'kad',     one: 'card',           many: 'cards',           not: ['helai'] },
  // kuntum: flowers
  { pb: 'kuntum', n: 'bunga',        one: 'flower',   many: 'flowers',   not: ['batang'] },
  { pb: 'kuntum', n: 'bunga ros',    one: 'rose',     many: 'roses',     not: ['batang'] },
  { pb: 'kuntum', n: 'bunga raya',   one: 'hibiscus', many: 'hibiscus flowers', not: ['batang'] },
  { pb: 'kuntum', n: 'bunga orkid',  one: 'orchid',   many: 'orchids',   not: ['batang'] },
  // pasang: things that come in twos
  { pb: 'pasang', n: 'kasut',         one: 'pair of shoes',    many: 'pairs of shoes',    not: ['buah'] },
  { pb: 'pasang', n: 'stoking',       one: 'pair of socks',    many: 'pairs of socks',    not: ['helai'] },
  { pb: 'pasang', n: 'selipar',       one: 'pair of slippers', many: 'pairs of slippers', not: ['buah'] },
  { pb: 'pasang', n: 'sarung tangan', one: 'pair of gloves',   many: 'pairs of gloves',   not: ['helai'] },
  // A few more, met at the top of the ladder only
  { pb: 'bilah',  n: 'pisau',   one: 'knife',  many: 'knives',  extra: true, not: ['batang', 'buah'] },
  { pb: 'bilah',  n: 'pedang',  one: 'sword',  many: 'swords',  extra: true, not: ['batang', 'buah'] },
  { pb: 'pucuk',  n: 'surat',   one: 'letter', many: 'letters', extra: true, not: ['keping', 'helai'] },
  { pb: 'utas',   n: 'tali',    one: 'rope',   many: 'ropes',   extra: true, not: ['batang', 'helai'] },
  { pb: 'utas',   n: 'rantai',  one: 'chain',  many: 'chains',  extra: true, not: ['batang', 'helai'] },
  { pb: 'ketul',  n: 'batu',    one: 'stone',  many: 'stones',  extra: true, not: ['biji', 'buah'] },
  { pb: 'ketul',  n: 'ais',     one: 'ice cube', many: 'ice cubes', extra: true, not: ['biji', 'keping'] },
  { pb: 'bentuk', n: 'cincin',  one: 'ring',   many: 'rings',   extra: true, not: ['biji', 'buah'] },
  { pb: 'kaki',   n: 'payung',  one: 'umbrella', many: 'umbrellas', extra: true, not: ['buah', 'batang'] }
];

const MALAY_P2_NUM_EN = { dua: 'two', tiga: 'three', empat: 'four', lima: 'five', enam: 'six', tujuh: 'seven', lapan: 'eight', sembilan: 'nine', sepuluh: 'ten' };

// In a sentence. `o` holds the wrong choices, all from the core list.
const MALAY_P2_PB_AYAT = [
  { s: 'Ibu membeli sepuluh ____ telur di pasar.', a: 'biji', o: ['ekor', 'helai', 'orang'], en: 'Mother bought ten eggs at the market.' },
  { s: 'Ada tiga ____ kucing di bawah meja.', a: 'ekor', o: ['orang', 'biji', 'helai'], en: 'There are three cats under the table.' },
  { s: 'Dua ____ murid sedang membaca buku.', a: 'orang', o: ['ekor', 'buah', 'batang'], en: 'Two pupils are reading books.' },
  { s: 'Ayah membeli sebuah meja dan empat ____ kerusi.', a: 'buah', o: ['ekor', 'helai', 'orang'], en: 'Father bought a table and four chairs.' },
  { s: 'Saya ada lima ____ pensel warna.', a: 'batang', o: ['ekor', 'orang', 'kuntum'], en: 'I have five colour pencils.' },
  { s: 'Kakak menjemur enam ____ tuala.', a: 'helai', o: ['ekor', 'biji', 'orang'], en: 'My elder sister hung out six towels to dry.' },
  { s: 'Adik makan dua ____ biskut.', a: 'keping', o: ['ekor', 'orang', 'batang'], en: 'My little brother or sister ate two biscuits.' },
  { s: 'Nenek memetik tiga ____ bunga raya.', a: 'kuntum', o: ['ekor', 'orang', 'buah'], en: 'Grandmother picked three hibiscus flowers.' },
  { s: 'Bapa membelikan saya dua ____ kasut.', a: 'pasang', o: ['ekor', 'orang', 'kuntum'], en: 'Father bought me two pairs of shoes.' },
  { s: 'Di zoo itu ada empat ____ gajah.', a: 'ekor', o: ['orang', 'buah', 'helai'], en: 'There are four elephants at that zoo.' },
  { s: 'Tujuh ____ kereta berhenti di tepi jalan.', a: 'buah', o: ['ekor', 'orang', 'helai'], en: 'Seven cars stopped by the roadside.' },
  { s: 'Cikgu memberi kami sepuluh ____ kertas.', a: 'helai', o: ['ekor', 'orang', 'biji'], en: 'Teacher gave us ten sheets of paper.' },
  { s: 'Datuk menanam lapan ____ pokok kelapa.', a: 'batang', o: ['ekor', 'orang', 'helai'], en: 'Grandfather planted eight coconut trees.' },
  { s: 'Lima ____ doktor bekerja di klinik itu.', a: 'orang', o: ['ekor', 'buah', 'biji'], en: 'Five doctors work at that clinic.' }
];

// ---------- 4. KATA TANYA ----------
const MALAY_P2_TANYA = [
  { w: 'apa',       kah: 'Apakah',       en: 'what' },
  { w: 'siapa',     kah: 'Siapakah',     en: 'who' },
  { w: 'bila',      kah: 'Bilakah',      en: 'when' },
  { w: 'di mana',   kah: 'Di manakah',   en: 'where' },
  { w: 'mengapa',   kah: 'Mengapakah',   en: 'why' },
  { w: 'bagaimana', kah: 'Bagaimanakah', en: 'how' },
  { w: 'berapa',    kah: 'Berapakah',    en: 'how many or how much' }
];

// A question with its question word missing, and the reply that fixes
// which word it must be. `w` is the bare word; the sentence uses the
// -kah form at the front unless `bare` is set. `not` lists question
// words kept out of the choices because some speakers use them here.
const MALAY_P2_TANYA_AYAT = [
  { w: 'apa', q: '____ yang kamu makan?', r: 'Saya makan nasi goreng.', en: 'What are you eating? I am eating fried rice.' },
  { w: 'apa', q: '____ yang ada di dalam beg itu?', r: 'Ada buku dan pensel.', en: 'What is in that bag? There are books and pencils.' },
  { w: 'apa', q: '____ warna baju kamu?', r: 'Baju saya berwarna biru.', en: 'What colour is your shirt? My shirt is blue.' },
  { w: 'apa', q: '____ yang ibu masak?', r: 'Ibu memasak sup ayam.', en: 'What is Mother cooking? Mother is cooking chicken soup.' },
  { w: 'siapa', q: '____ guru kelas kamu?', r: 'Guru kelas saya ialah Cikgu Salmah.', en: 'Who is your class teacher? My class teacher is Cikgu Salmah.' },
  { w: 'siapa', q: '____ yang menyapu lantai?', r: 'Kakak yang menyapu lantai.', en: 'Who swept the floor? My elder sister swept the floor.' },
  { w: 'siapa', q: '____ yang datang ke rumah kita?', r: 'Nenek yang datang.', en: 'Who came to our house? Grandmother came.' },
  { w: 'siapa', q: '____ kawan baik kamu?', r: 'Kawan baik saya ialah Mei Ling.', en: 'Who is your best friend? My best friend is Mei Ling.' },
  { w: 'bila', q: '____ kamu bangun tidur?', r: 'Saya bangun pada pukul enam pagi.', en: 'When do you wake up? I wake up at six in the morning.' },
  { w: 'bila', q: '____ hari jadi kamu?', r: 'Hari jadi saya pada bulan Mac.', en: 'When is your birthday? My birthday is in March.' },
  { w: 'bila', q: '____ kita akan ke zoo?', r: 'Kita akan ke zoo pada hari Sabtu.', en: 'When will we go to the zoo? We will go to the zoo on Saturday.' },
  { w: 'bila', q: '____ sekolah bermula?', r: 'Sekolah bermula pada bulan Januari.', en: 'When does school start? School starts in January.' },
  { w: 'di mana', q: '____ kamu tinggal?', r: 'Saya tinggal di Tampines.', en: 'Where do you live? I live in Tampines.' },
  { w: 'di mana', q: '____ kucing itu tidur?', r: 'Kucing itu tidur di bawah meja.', en: 'Where is the cat sleeping? The cat is sleeping under the table.' },
  { w: 'di mana', q: '____ ibu membeli sayur?', r: 'Ibu membeli sayur di pasar.', en: 'Where does Mother buy vegetables? Mother buys vegetables at the market.' },
  { w: 'di mana', q: '____ buku saya?', r: 'Buku kamu ada di atas meja.', en: 'Where is my book? Your book is on the table.' },
  { w: 'mengapa', q: '____ adik menangis?', r: 'Adik menangis kerana dia terjatuh.', en: 'Why is the little one crying? He or she is crying because of a fall.' },
  { w: 'mengapa', q: '____ kamu lewat?', r: 'Saya lewat kerana bas rosak.', en: 'Why are you late? I am late because the bus broke down.' },
  { w: 'mengapa', q: '____ Ali tidak hadir?', r: 'Ali tidak hadir kerana dia demam.', en: 'Why is Ali absent? Ali is absent because he has a fever.' },
  { w: 'mengapa', q: '____ kamu membawa payung?', r: 'Saya membawa payung kerana hari hendak hujan.', en: 'Why are you carrying an umbrella? I am carrying an umbrella because it is about to rain.' },
  { w: 'bagaimana', q: '____ kamu pergi ke sekolah?', r: 'Saya pergi ke sekolah dengan bas.', en: 'How do you go to school? I go to school by bus.' },
  { w: 'bagaimana', not: ['apa'], q: '____ keadaan nenek?', r: 'Nenek sudah sihat.', en: 'How is Grandmother? Grandmother is well again.' },
  { w: 'bagaimana', q: '____ ayah pergi ke tempat kerja?', r: 'Ayah pergi dengan kereta.', en: 'How does Father go to work? Father goes by car.' },
  { w: 'bagaimana', q: '____ mereka pergi ke pulau itu?', r: 'Mereka pergi dengan bot.', en: 'How did they go to that island? They went by boat.' },
  { w: 'berapa', not: ['apa'], q: '____ umur kamu?', r: 'Umur saya lapan tahun.', en: 'How old are you? I am eight years old.' },
  { w: 'berapa', not: ['apa'], q: '____ harga buku ini?', r: 'Harganya dua dolar.', en: 'How much is this book? It costs two dollars.' },
  { w: 'berapa', bare: true, q: '____ ekor kucing yang kamu ada?', r: 'Saya ada dua ekor kucing.', en: 'How many cats do you have? I have two cats.' },
  { w: 'berapa', bare: true, q: '____ orang murid di dalam kelas kamu?', r: 'Ada tiga puluh orang murid.', en: 'How many pupils are in your class? There are thirty pupils.' }
];

// ---------- 5. KATA ADJEKTIF: ANTONIM DAN SINONIM ----------
// `avoid` lists words that must never sit beside this pair as a wrong
// choice, because they could be argued to be right as well
// (tinggi can be the opposite of rendah or of pendek).
const MALAY_P2_ANTONIM = [
  { a: 'besar',   b: 'kecil',  ea: 'big',     eb: 'small',  avoid: ['luas', 'sempit', 'gemuk', 'kurus'] },
  { a: 'tinggi',  b: 'rendah', ea: 'tall or high', eb: 'low or short', avoid: ['pendek', 'panjang'] },
  { a: 'panjang', b: 'pendek', ea: 'long',    eb: 'short',  avoid: ['tinggi', 'rendah'] },
  { a: 'rajin',   b: 'malas',  ea: 'hardworking', eb: 'lazy', avoid: [] },
  { a: 'panas',   b: 'sejuk',  ea: 'hot',     eb: 'cold',   avoid: [] },
  { a: 'bersih',  b: 'kotor',  ea: 'clean',   eb: 'dirty',  avoid: [] },
  { a: 'cepat',   b: 'lambat', ea: 'fast',    eb: 'slow',   avoid: ['awal', 'lewat'] },
  { a: 'awal',    b: 'lewat',  ea: 'early',   eb: 'late',   avoid: ['cepat', 'lambat'] },
  { a: 'baharu',  b: 'lama',   ea: 'new',     eb: 'old (of things)', avoid: ['tua', 'muda'] },
  { a: 'tua',     b: 'muda',   ea: 'old (of people)', eb: 'young', avoid: ['baharu', 'lama'] },
  { a: 'kaya',    b: 'miskin', ea: 'rich',    eb: 'poor',   avoid: ['senang', 'susah'] },
  { a: 'senang',  b: 'susah',  ea: 'easy',    eb: 'difficult', avoid: ['kaya', 'miskin', 'gembira', 'sedih', 'berat', 'ringan'] },
  { a: 'berat',   b: 'ringan', ea: 'heavy',   eb: 'light',  avoid: ['senang', 'susah'] },
  { a: 'gelap',   b: 'terang', ea: 'dark',    eb: 'bright', avoid: [] },
  { a: 'kuat',    b: 'lemah',  ea: 'strong',  eb: 'weak',   avoid: ['keras', 'lembut'] },
  { a: 'keras',   b: 'lembut', ea: 'hard',    eb: 'soft',   avoid: ['kuat', 'lemah'] },
  { a: 'tebal',   b: 'nipis',  ea: 'thick',   eb: 'thin (of things)', avoid: ['gemuk', 'kurus'] },
  { a: 'gemuk',   b: 'kurus',  ea: 'fat',     eb: 'thin (of people)', avoid: ['tebal', 'nipis', 'besar', 'kecil'] },
  { a: 'basah',   b: 'kering', ea: 'wet',     eb: 'dry',    avoid: [] },
  { a: 'jauh',    b: 'dekat',  ea: 'far',     eb: 'near',   avoid: [] },
  { a: 'penuh',   b: 'kosong', ea: 'full',    eb: 'empty',  avoid: [] },
  { a: 'tajam',   b: 'tumpul', ea: 'sharp',   eb: 'blunt',  avoid: [] },
  { a: 'mahal',   b: 'murah',  ea: 'expensive', eb: 'cheap', avoid: [] },
  { a: 'gembira', b: 'sedih',  ea: 'happy',   eb: 'sad',    avoid: ['senang', 'susah'] },
  { a: 'betul',   b: 'salah',  ea: 'right',   eb: 'wrong',  avoid: [] },
  { a: 'luas',    b: 'sempit', ea: 'wide',    eb: 'narrow', avoid: ['besar', 'kecil'] },
  { a: 'bising',  b: 'senyap', ea: 'noisy',   eb: 'quiet',  avoid: [] },
  { a: 'cantik',  b: 'hodoh',  ea: 'beautiful', eb: 'ugly', avoid: [] }
];

// Each synonym pair carries its own three wrong choices, chosen by hand
// so that none of them is a near-synonym as well.
const MALAY_P2_SINONIM = [
  { a: 'cantik',  b: 'indah',   en: 'beautiful',   o: ['kotor', 'lambat', 'nipis'] },
  { a: 'gembira', b: 'riang',   en: 'happy',       o: ['sedih', 'penat', 'tajam'] },
  { a: 'pandai',  b: 'bijak',   en: 'clever',      o: ['malas', 'tinggi', 'basah'] },
  { a: 'cepat',   b: 'pantas',  en: 'fast',        o: ['lambat', 'berat', 'kosong'] },
  { a: 'senang',  b: 'mudah',   en: 'easy',        o: ['susah', 'tebal', 'jauh'] },
  { a: 'susah',   b: 'sukar',   en: 'difficult',   o: ['mudah', 'bersih', 'terang'] },
  { a: 'sejuk',   b: 'dingin',  en: 'cold',        o: ['panas', 'kering', 'tumpul'] },
  { a: 'sunyi',   b: 'sepi',    en: 'quiet and lonely', o: ['bising', 'penuh', 'mahal'] },
  { a: 'wangi',   b: 'harum',   en: 'fragrant',    o: ['busuk', 'gelap', 'pendek'] },
  { a: 'penat',   b: 'letih',   en: 'tired',       o: ['segar', 'kaya', 'tajam'] },
  { a: 'betul',   b: 'benar',   en: 'right or true', o: ['salah', 'jauh', 'nipis'] },
  { a: 'suka',    b: 'gemar',   en: 'to like',     o: ['benci', 'takut', 'lupa'] },
  { a: 'kawan',   b: 'sahabat', en: 'friend',      o: ['musuh', 'jiran', 'guru'] },
  { a: 'gelap',   b: 'kelam',   en: 'dark',        o: ['terang', 'bersih', 'ringan'] },
  { a: 'garang',  b: 'bengis',  en: 'fierce',      o: ['lembut', 'rajin', 'murah'] },
  { a: 'kuat',    b: 'gagah',   en: 'strong',      o: ['lemah', 'kotor', 'lewat'] }
];

// The missing describing word. The contrast after "tetapi" fixes it,
// and the other choices do not fit the thing being described.
const MALAY_P2_ADJ_AYAT = [
  { s: 'Abang saya tinggi tetapi adik saya ____.', a: 'rendah', o: ['tinggi', 'tumpul', 'kosong'], en: 'My elder brother is tall but my younger sibling is short.' },
  { s: 'Bilik Ali bersih tetapi bilik Abu ____.', a: 'kotor', o: ['bersih', 'kurus', 'tajam'], en: 'Ali\'s room is clean but Abu\'s room is dirty.' },
  { s: 'Kura-kura berjalan lambat tetapi arnab berlari ____.', a: 'cepat', o: ['lambat', 'kosong', 'nipis'], en: 'The tortoise walks slowly but the rabbit runs fast.' },
  { s: 'Gajah itu besar tetapi semut itu ____.', a: 'kecil', o: ['besar', 'mahal', 'rajin'], en: 'The elephant is big but the ant is small.' },
  { s: 'Air teh itu panas tetapi air sirap itu ____.', a: 'sejuk', o: ['panas', 'tumpul', 'rajin'], en: 'The tea is hot but the syrup drink is cold.' },
  { s: 'Beg ayah berat tetapi beg saya ____.', a: 'ringan', o: ['berat', 'malas', 'gelap'], en: 'Father\'s bag is heavy but my bag is light.' },
  { s: 'Siti rajin tetapi adiknya ____.', a: 'malas', o: ['rajin', 'kosong', 'tumpul'], en: 'Siti is hardworking but her younger sibling is lazy.' },
  { s: 'Baju ini mahal tetapi baju itu ____.', a: 'murah', o: ['mahal', 'rajin', 'tajam'], en: 'This shirt is expensive but that shirt is cheap.' },
  { s: 'Botol saya penuh tetapi botol kamu ____.', a: 'kosong', o: ['penuh', 'rajin', 'tajam'], en: 'My bottle is full but your bottle is empty.' },
  { s: 'Pisau ini tajam tetapi pisau itu ____.', a: 'tumpul', o: ['tajam', 'malas', 'sedih'], en: 'This knife is sharp but that knife is blunt.' },
  { s: 'Rambut kakak panjang tetapi rambut saya ____.', a: 'pendek', o: ['panjang', 'mahal', 'bising'], en: 'My elder sister\'s hair is long but my hair is short.' },
  { s: 'Tuala ini basah tetapi tuala itu ____.', a: 'kering', o: ['basah', 'rajin', 'bising'], en: 'This towel is wet but that towel is dry.' },
  { s: 'Rumah saya dekat tetapi rumah Mei Ling ____.', a: 'jauh', o: ['dekat', 'malas', 'tajam'], en: 'My house is near but Mei Ling\'s house is far.' },
  { s: 'Kelas kami senyap tetapi kelas sebelah ____.', a: 'bising', o: ['senyap', 'tumpul', 'kurus'], en: 'Our class is quiet but the class next door is noisy.' }
];

// ---------- 6. KATA SENDI NAMA ----------
// Every row carries its own wrong choices. Where two words could both
// stand ("pergi ke pejabat" and "pergi dari pejabat" are both good
// Malay) the second one is simply not offered.
const MALAY_P2_SENDI = [
  // di: where something is (a place)
  { a: 'di', s: 'Ibu memasak ____ dapur.', o: ['ke', 'pada', 'kepada'], en: 'Mother is cooking in the kitchen.' },
  { a: 'di', s: 'Adik tidur ____ bilik.', o: ['ke', 'pada', 'kepada'], en: 'The little one is sleeping in the bedroom.' },
  { a: 'di', s: 'Kami belajar ____ sekolah.', o: ['pada', 'kepada', 'daripada'], en: 'We study at school.' },
  { a: 'di', s: 'Burung itu hinggap ____ atas dahan.', o: ['pada', 'kepada', 'daripada'], en: 'The bird perched on the branch.' },
  { a: 'di', s: 'Ayah bekerja ____ pejabat.', o: ['ke', 'pada', 'kepada'], en: 'Father works at the office.' },
  { a: 'di', s: 'Kucing itu duduk ____ bawah meja.', o: ['pada', 'kepada', 'daripada'], en: 'The cat is sitting under the table.' },
  // ke: going to a place
  { a: 'ke', s: 'Kami akan pergi ____ zoo esok.', o: ['kepada', 'pada', 'daripada'], en: 'We will go to the zoo tomorrow.' },
  { a: 'ke', s: 'Ayah pergi ____ pejabat pada waktu pagi.', o: ['kepada', 'pada', 'daripada'], en: 'Father goes to the office in the morning.' },
  { a: 'ke', s: 'Ibu berjalan ____ pasar.', o: ['kepada', 'pada', 'daripada'], en: 'Mother walks to the market.' },
  { a: 'ke', s: 'Murid-murid masuk ____ dalam kelas.', o: ['kepada', 'pada', 'daripada'], en: 'The pupils go into the classroom.' },
  { a: 'ke', s: 'Ali menendang bola itu ____ arah gol.', o: ['kepada', 'pada', 'daripada'], en: 'Ali kicked the ball towards the goal.' },
  { a: 'ke', s: 'Nenek balik ____ kampung semalam.', o: ['kepada', 'pada', 'daripada'], en: 'Grandmother went back to the village yesterday.' },
  // dari: from a place, or from a time
  { a: 'dari', s: 'Kereta api itu datang ____ Johor.', o: ['daripada', 'kepada', 'pada'], en: 'The train came from Johor.' },
  { a: 'dari', s: 'Ayah baru pulang ____ pejabat.', o: ['daripada', 'kepada', 'pada'], en: 'Father has just come home from the office.' },
  { a: 'dari', s: 'Saya berjalan kaki ____ rumah ke sekolah.', o: ['di', 'daripada', 'kepada'], en: 'I walk from home to school.' },
  { a: 'dari', s: 'Kedai itu dibuka ____ pagi hingga malam.', o: ['daripada', 'kepada', 'ke'], en: 'The shop is open from morning until night.' },
  { a: 'dari', s: 'Kami bertolak ____ Singapura pada pukul lapan.', o: ['daripada', 'kepada', 'pada'], en: 'We set off from Singapore at eight o\'clock.' },
  { a: 'dari', s: 'Bas itu bergerak ____ Tampines ke Bedok.', o: ['di', 'daripada', 'pada'], en: 'The bus travels from Tampines to Bedok.' },
  // pada: a time, or with a person
  { a: 'pada', s: 'Kami bersenam ____ waktu pagi.', o: ['di', 'ke', 'kepada'], en: 'We exercise in the morning.' },
  { a: 'pada', s: 'Sekolah bermula ____ pukul tujuh setengah pagi.', o: ['di', 'ke', 'kepada'], en: 'School starts at half past seven in the morning.' },
  { a: 'pada', s: 'Kami pergi berkelah ____ hari Ahad.', o: ['di', 'kepada', 'daripada'], en: 'We went for a picnic on Sunday.' },
  { a: 'pada', s: 'Buku itu ada ____ Cikgu Aminah.', o: ['di', 'ke', 'dari'], en: 'The book is with Cikgu Aminah.' },
  { a: 'pada', s: 'Hari jadi saya jatuh ____ bulan Jun.', o: ['di', 'ke', 'kepada'], en: 'My birthday falls in June.' },
  { a: 'pada', s: 'Kunci rumah ada ____ ayah.', o: ['di', 'ke', 'dari'], en: 'The house key is with Father.' },
  { a: 'Pada', s: '____ hari Sabtu, kami melawat nenek.', o: ['Di', 'Ke', 'Kepada'], en: 'On Saturday, we visited Grandmother.' },
  // kepada: to a person
  { a: 'kepada', s: 'Saya memberikan hadiah itu ____ ibu.', o: ['ke', 'di', 'dari'], en: 'I gave the present to Mother.' },
  { a: 'kepada', s: 'Ali menulis surat ____ datuknya.', o: ['ke', 'di'], en: 'Ali wrote a letter to his grandfather.' },
  { a: 'kepada', s: 'Murid-murid mengucapkan terima kasih ____ guru mereka.', o: ['ke', 'di'], en: 'The pupils said thank you to their teacher.' },
  { a: 'kepada', s: 'Aminah menghantar kad ucapan ____ kawannya.', o: ['ke', 'di'], en: 'Aminah sent a greeting card to her friend.' },
  { a: 'kepada', s: 'Cikgu memberikan buku latihan ____ Siti.', o: ['ke', 'di'], en: 'Teacher gave the exercise book to Siti.' },
  { a: 'kepada', s: 'Saya meminta maaf ____ ibu.', o: ['ke', 'di'], en: 'I said sorry to Mother.' },
  // daripada: from a person, comparing, or what something is made of
  { a: 'daripada', s: 'Saya menerima hadiah ____ nenek.', o: ['dari', 'ke', 'di'], en: 'I received a present from Grandmother.' },
  { a: 'daripada', s: 'Ali meminjam pensel ____ kawannya.', o: ['dari', 'ke', 'di'], en: 'Ali borrowed a pencil from his friend.' },
  { a: 'daripada', s: 'Siti mendapat buku cerita ____ gurunya.', o: ['dari', 'ke', 'di'], en: 'Siti got a storybook from her teacher.' },
  { a: 'daripada', s: 'Abang lebih tinggi ____ saya.', o: ['dari', 'kepada', 'pada'], en: 'My elder brother is taller than me.' },
  { a: 'daripada', s: 'Gajah lebih besar ____ kucing.', o: ['dari', 'kepada', 'pada'], en: 'An elephant is bigger than a cat.' },
  { a: 'daripada', s: 'Kerusi itu dibuat ____ kayu.', o: ['dari', 'kepada', 'pada'], en: 'The chair is made of wood.' }
];

// ---------- 7. KATA HUBUNG ----------
const MALAY_P2_HUBUNG_KATA = [
  { w: 'dan',    en: 'and' },
  { w: 'tetapi', en: 'but' },
  { w: 'kerana', en: 'because' },
  { w: 'atau',   en: 'or' },
  { w: 'lalu',   en: 'and then' },
  { w: 'sambil', en: 'while (doing two things at once)' }
];

// Wrong choices are picked by hand for each sentence. "dan" is never a
// wrong choice where it would also read naturally, and so on.
const MALAY_P2_HUBUNG = [
  { a: 'dan', s: 'Saya suka makan epal ____ pisang.', o: ['tetapi', 'kerana'], en: 'I like eating apples and bananas.' },
  { a: 'dan', s: 'Ibu membeli ikan ____ sayur di pasar.', o: ['kerana', 'lalu'], en: 'Mother bought fish and vegetables at the market.' },
  { a: 'dan', s: 'Ali ____ Ahmad bermain bola di padang.', o: ['tetapi', 'kerana'], en: 'Ali and Ahmad are playing ball on the field.' },
  { a: 'dan', s: 'Bapa saya tinggi ____ kuat.', o: ['kerana', 'lalu'], en: 'My father is tall and strong.' },
  { a: 'dan', s: 'Saya ada seekor kucing ____ dua ekor arnab.', o: ['kerana', 'lalu'], en: 'I have a cat and two rabbits.' },
  { a: 'dan', s: 'Kakak ____ abang sedang membuat kerja sekolah.', o: ['tetapi', 'kerana'], en: 'My elder sister and elder brother are doing homework.' },
  { a: 'tetapi', s: 'Adik sudah makan ____ masih lapar.', o: ['kerana', 'atau'], en: 'The little one has eaten but is still hungry.' },
  { a: 'tetapi', s: 'Rumah itu kecil ____ cantik.', o: ['kerana', 'atau'], en: 'The house is small but pretty.' },
  { a: 'tetapi', s: 'Ali rajin ____ adiknya malas.', o: ['kerana', 'atau'], en: 'Ali is hardworking but his younger sibling is lazy.' },
  { a: 'tetapi', s: 'Saya mahu bermain di luar ____ hari hujan.', o: ['atau', 'sambil'], en: 'I want to play outside but it is raining.' },
  { a: 'tetapi', s: 'Kasut itu cantik ____ mahal.', o: ['atau', 'lalu'], en: 'The shoes are pretty but expensive.' },
  { a: 'tetapi', s: 'Nenek sudah tua ____ masih kuat.', o: ['kerana', 'atau'], en: 'Grandmother is old but still strong.' },
  { a: 'kerana', s: 'Adik menangis ____ dia terjatuh.', o: ['tetapi', 'atau'], en: 'The little one is crying because of a fall.' },
  { a: 'kerana', s: 'Ali tidak ke sekolah ____ dia demam.', o: ['tetapi', 'atau'], en: 'Ali did not go to school because he has a fever.' },
  { a: 'kerana', s: 'Kami tidak bermain di padang ____ hari hujan.', o: ['tetapi', 'atau'], en: 'We did not play on the field because it was raining.' },
  { a: 'kerana', s: 'Ibu gembira ____ saya membantunya.', o: ['tetapi', 'atau'], en: 'Mother is happy because I helped her.' },
  { a: 'kerana', s: 'Saya minum air ____ saya dahaga.', o: ['tetapi', 'atau'], en: 'I drank water because I was thirsty.' },
  { a: 'kerana', s: 'Siti lulus ujian ____ dia rajin belajar.', o: ['tetapi', 'atau'], en: 'Siti passed the test because she studied hard.' },
  { a: 'atau', s: 'Kamu mahu minum susu ____ teh?', o: ['kerana', 'lalu', 'tetapi'], en: 'Do you want to drink milk or tea?' },
  { a: 'atau', s: 'Adakah itu kucing ____ arnab?', o: ['kerana', 'lalu'], en: 'Is that a cat or a rabbit?' },
  { a: 'atau', s: 'Kita boleh pergi dengan bas ____ teksi.', o: ['kerana', 'tetapi'], en: 'We can go by bus or taxi.' },
  { a: 'atau', s: 'Kamu hendak membaca buku ____ melukis gambar?', o: ['kerana', 'tetapi'], en: 'Do you want to read a book or draw a picture?' },
  { a: 'atau', s: 'Baju itu berwarna merah ____ biru?', o: ['kerana', 'lalu'], en: 'Is that shirt red or blue?' },
  { a: 'atau', s: 'Pilih satu sahaja, epal ____ oren.', o: ['dan', 'tetapi'], en: 'Choose only one, an apple or an orange.' },
  { a: 'lalu', s: 'Ali bangun dari tidur ____ mandi.', o: ['atau', 'tetapi'], en: 'Ali woke up and then took a bath.' },
  { a: 'lalu', s: 'Ibu membuka pintu ____ masuk ke dalam rumah.', o: ['atau', 'tetapi'], en: 'Mother opened the door and then went into the house.' },
  { a: 'lalu', s: 'Kucing itu melompat ke atas meja ____ makan ikan.', o: ['atau', 'tetapi'], en: 'The cat jumped onto the table and then ate the fish.' },
  { a: 'lalu', s: 'Siti mengambil pensel ____ menulis namanya.', o: ['atau', 'tetapi'], en: 'Siti took a pencil and then wrote her name.' },
  { a: 'lalu', s: 'Ayah memberhentikan kereta ____ turun.', o: ['atau', 'tetapi'], en: 'Father stopped the car and then got out.' },
  { a: 'lalu', s: 'Adik mencuci tangan ____ makan.', o: ['atau', 'tetapi'], en: 'The little one washed hands and then ate.' },
  { a: 'sambil', s: 'Kakak menyapu lantai ____ menyanyi.', o: ['kerana', 'tetapi'], en: 'My elder sister sweeps the floor while singing.' },
  { a: 'sambil', s: 'Ayah minum kopi ____ membaca surat khabar.', o: ['kerana', 'tetapi'], en: 'Father drinks coffee while reading the newspaper.' },
  { a: 'sambil', s: 'Adik berjalan ____ makan aiskrim.', o: ['kerana', 'tetapi'], en: 'The little one walks while eating ice cream.' },
  { a: 'sambil', s: 'Ibu memasak ____ mendengar radio.', o: ['kerana', 'tetapi'], en: 'Mother cooks while listening to the radio.' },
  { a: 'sambil', s: 'Abang bersiul ____ membasuh kereta.', o: ['kerana', 'tetapi'], en: 'My elder brother whistles while washing the car.' },
  { a: 'sambil', s: 'Nenek bercerita ____ menjahit baju.', o: ['kerana', 'tetapi'], en: 'Grandmother tells stories while sewing clothes.' }
];

// ---------- 8. PERIBAHASA MUDAH (simpulan bahasa) ----------
// `avoid` lists other idioms close enough in meaning that they must
// not appear beside this one as a wrong choice.
// `s`/`o` give one sentence that uses the idiom, with its wrong choices.
const MALAY_P2_SIMPULAN = [
  { id: 'ringan tulang', en: 'hardworking', avoid: ['baik hati', 'murah hati'],
    s: 'Siti selalu membantu ibunya di dapur. Dia seorang yang ____.', o: ['berat tulang', 'panjang tangan', 'keras kepala'],
    sen: 'Siti always helps her mother in the kitchen. She is a hardworking person.' },
  { id: 'berat tulang', en: 'lazy', avoid: [],
    s: 'Abu tidak mahu membantu ibunya mengemas rumah. Dia memang ____.', o: ['ringan tulang', 'murah hati', 'ulat buku'],
    sen: 'Abu does not want to help his mother tidy the house. He really is lazy.' },
  { id: 'buah tangan', en: 'a gift you bring when you visit someone', avoid: [],
    s: 'Mak Cik Rohani membawa ____ untuk kami ketika datang ke rumah.', o: ['buah hati', 'campur tangan', 'kaki ayam'],
    sen: 'Aunt Rohani brought a gift for us when she came to our house.' },
  { id: 'anak emas', en: 'the favourite child', avoid: ['buah hati', 'cahaya mata', 'anak angkat'],
    s: 'Adik bongsu ialah ____ dalam keluarga kami. Semua orang menyayanginya.', o: ['kaki bangku', 'ulat buku', 'tangkai jering'],
    sen: 'The youngest is the favourite child in our family. Everyone loves him or her.' },
  { id: 'kaki bangku', en: 'someone who is not good at playing football', avoid: [],
    s: 'Ali tidak pandai bermain bola sepak. Kawan-kawannya memanggilnya ____.', o: ['ulat buku', 'anak emas', 'mulut murai'],
    sen: 'Ali is not good at football. His friends call him a kaki bangku.' },
  { id: 'kaki ayam', en: 'barefoot, not wearing shoes', avoid: [] },
  { id: 'panjang tangan', en: 'someone who likes to steal', avoid: [],
    s: 'Jangan ambil barang orang lain. Orang yang ____ tidak disukai.', o: ['ringan tulang', 'besar hati', 'murah hati'],
    sen: 'Do not take other people\'s things. People who steal are not liked.' },
  { id: 'besar hati', en: 'glad and proud', avoid: ['langkah kanan'],
    s: 'Ibu berasa ____ apabila saya mendapat markah penuh.', o: ['kecil hati', 'berat tulang', 'kaki bangku'],
    sen: 'Mother felt glad and proud when I got full marks.' },
  { id: 'ada hati', en: 'to wish or hope to do something', avoid: [],
    s: 'Hakim ____ hendak menjadi juruterbang apabila besar nanti.', o: ['panjang tangan', 'campur tangan', 'kaki ayam'],
    sen: 'Hakim hopes to become a pilot when he grows up.' },
  { id: 'cahaya mata', en: 'a child, a son or daughter', avoid: ['anak emas', 'buah hati', 'anak angkat'],
    s: 'Pak Cik Salleh dan isterinya gembira menyambut ____ mereka yang pertama.', o: ['buah tangan', 'kaki bangku', 'tin kosong'],
    sen: 'Uncle Salleh and his wife were happy to welcome their first child.' },
  { id: 'buah hati', en: 'someone who is dearly loved', avoid: ['anak emas', 'cahaya mata', 'anak angkat'],
    s: 'Cucu itu ____ neneknya. Nenek sangat sayang akan dia.', o: ['buah tangan', 'kaki bangku', 'cakar ayam'],
    sen: 'That grandchild is dearly loved by the grandmother. Grandmother loves him or her very much.' },
  { id: 'campur tangan', en: 'to interfere in other people\'s business', avoid: [],
    s: 'Itu hal mereka. Kita jangan ____.', o: ['buah tangan', 'besar hati', 'ringan tulang'],
    sen: 'That is their matter. We should not interfere.' },
  { id: 'ulat buku', en: 'someone who loves reading', avoid: [],
    s: 'Mei Ling suka membaca di perpustakaan. Dia seorang ____.', o: ['kaki bangku', 'tin kosong', 'tangkai jering'],
    sen: 'Mei Ling likes to read in the library. She is a bookworm.' },
  { id: 'mulut murai', en: 'someone who talks a lot', avoid: ['tin kosong'],
    s: 'Rina suka bercakap tanpa henti. Dia digelar ____.', o: ['kaki bangku', 'ulat buku', 'anak emas'],
    sen: 'Rina likes to talk without stopping. She is called a chatterbox.' },
  { id: 'keras kepala', en: 'stubborn', avoid: [],
    s: 'Adik tidak mahu mendengar nasihat ibu. Dia sungguh ____.', o: ['ringan tulang', 'murah hati', 'besar hati'],
    sen: 'The little one will not listen to Mother\'s advice. He or she is really stubborn.' },
  { id: 'murah hati', en: 'generous', avoid: ['baik hati', 'ringan tulang'],
    s: 'Datuk suka menderma kepada orang miskin. Datuk seorang yang ____.', o: ['tangkai jering', 'panjang tangan', 'keras kepala'],
    sen: 'Grandfather likes to donate to the poor. Grandfather is a generous person.' },
  { id: 'baik hati', en: 'kind', avoid: ['murah hati', 'ringan tulang'],
    s: 'Kak Lina menolong seorang nenek melintas jalan. Dia sungguh ____.', o: ['panjang tangan', 'berat tulang', 'keras kepala'],
    sen: 'Lina helped an old lady cross the road. She is really kind.' },
  { id: 'cakar ayam', en: 'very messy handwriting', avoid: [],
    s: 'Tulisan Amir seperti ____. Cikgu tidak dapat membacanya.', o: ['kaki ayam', 'ulat buku', 'buah tangan'],
    sen: 'Amir\'s handwriting is very messy. Teacher cannot read it.' },
  { id: 'kecil hati', en: 'feeling hurt or offended', avoid: ['naik angin', 'iri hati'],
    s: 'Siti berasa ____ kerana kawannya tidak menjemputnya ke majlis hari jadi.', o: ['besar hati', 'murah hati', 'ringan tulang'],
    sen: 'Siti felt hurt because her friend did not invite her to the birthday party.' },
  { id: 'naik angin', en: 'to become angry', avoid: ['kecil hati', 'iri hati'],
    s: 'Ayah ____ apabila melihat bilik kami bersepah.', o: ['campur tangan', 'kaki bangku', 'ringan tulang'],
    sen: 'Father became angry when he saw our messy room.' },
  { id: 'tin kosong', en: 'someone who talks big but knows little', avoid: ['mulut murai'],
    s: 'Dia banyak bercakap tetapi tidak tahu apa-apa. Dia seperti ____.', o: ['ulat buku', 'anak emas', 'buah tangan'],
    sen: 'He talks a lot but knows nothing. He is like an empty tin.' },
  { id: 'anak angkat', en: 'an adopted child', avoid: ['anak emas', 'buah hati', 'cahaya mata'],
    s: 'Pak Cik Rahim menjaga Amin seperti anaknya sendiri. Amin ialah ____ Pak Cik Rahim.', o: ['buah tangan', 'kaki bangku', 'tin kosong'],
    sen: 'Uncle Rahim looks after Amin like his own child. Amin is Uncle Rahim\'s adopted child.' },
  { id: 'tangkai jering', en: 'stingy', avoid: [],
    s: 'Pak Man tidak suka berbelanja atau menderma. Dia seorang yang ____.', o: ['murah hati', 'ringan tulang', 'ulat buku'],
    sen: 'Pak Man does not like to spend or donate. He is a stingy person.' },
  { id: 'iri hati', en: 'jealous', avoid: ['kecil hati', 'naik angin'],
    s: 'Farah berasa ____ apabila melihat mainan baharu kawannya.', o: ['murah hati', 'ringan tulang', 'kaki bangku'],
    sen: 'Farah felt jealous when she saw her friend\'s new toy.' },
  { id: 'buah mulut', en: 'something that everyone is talking about', avoid: ['mulut murai'],
    s: 'Kejayaan Aiman memenangi pertandingan itu menjadi ____ murid-murid di sekolah.', o: ['buah tangan', 'kaki ayam', 'cakar ayam'],
    sen: 'Aiman\'s success in winning the competition became the talk of the pupils at school.' },
  { id: 'langkah kanan', en: 'lucky, arriving at just the right time', avoid: ['besar hati'],
    s: 'Kami sampai ketika nenek baru siap memasak. Sungguh ____ kami hari ini.', o: ['kaki bangku', 'panjang tangan', 'berat tulang'],
    sen: 'We arrived just as Grandmother finished cooking. We were really lucky today.' }
];

// ---------- 9. KEFAHAMAN ----------
// Original passages of 40 to 80 words. `lvl` 0 is a fact stated in the
// text, 1 needs two parts put together, 2 is a "why" or a "which is not".
const MALAY_P2_KEFAHAMAN = [
  { id: 'comel', title: 'Kucing Saya',
    text: 'Saya ada seekor kucing. Namanya Comel. Bulu Comel berwarna putih dan lembut. Setiap pagi, saya memberi Comel makan ikan. Comel suka bermain dengan bola kecil. Pada waktu malam, Comel tidur di dalam bakul di tepi katil saya. Saya sayang akan Comel.',
    en: 'I have a cat. Its name is Comel. Comel\'s fur is white and soft. Every morning, I feed Comel fish. Comel likes to play with a small ball. At night, Comel sleeps in a basket beside my bed. I love Comel.',
    qs: [
      { lvl: 0, q: 'Apakah nama kucing itu?', a: 'Comel', o: ['Putih', 'Manja'], en: 'What is the cat\'s name? Comel.' },
      { lvl: 0, q: 'Apakah warna bulu Comel?', a: 'putih', o: ['hitam', 'kelabu'], en: 'What colour is Comel\'s fur? White.' },
      { lvl: 0, q: 'Apakah yang Comel makan setiap pagi?', a: 'ikan', o: ['nasi', 'roti'], en: 'What does Comel eat every morning? Fish.' },
      { lvl: 1, q: 'Di manakah Comel tidur?', a: 'di dalam bakul', o: ['di atas katil', 'di bawah meja'], en: 'Where does Comel sleep? In a basket.' },
      { lvl: 1, q: 'Comel suka bermain dengan apa?', a: 'bola kecil', o: ['tali', 'kotak'], en: 'What does Comel like to play with? A small ball.' },
      { lvl: 2, q: 'Yang manakah tidak benar tentang Comel?', a: 'Comel berbulu hitam.', o: ['Comel suka bermain bola.', 'Comel tidur di dalam bakul.'], en: 'Which one is not true about Comel? Comel has black fur.' }
    ] },
  { id: 'pasar', title: 'Ke Pasar',
    text: 'Pada hari Sabtu, Aminah mengikut ibunya ke pasar. Mereka pergi ke sana dengan bas. Di pasar, ibu membeli ikan, sayur dan sepuluh biji telur. Aminah menolong ibu membawa bakul. Selepas itu, mereka minum teh di kedai kopi. Aminah berasa gembira kerana dapat menolong ibunya.',
    en: 'On Saturday, Aminah followed her mother to the market. They went there by bus. At the market, Mother bought fish, vegetables and ten eggs. Aminah helped Mother carry the basket. After that, they drank tea at the coffee shop. Aminah felt happy because she could help her mother.',
    qs: [
      { lvl: 0, q: 'Bilakah Aminah pergi ke pasar?', a: 'pada hari Sabtu', o: ['pada hari Ahad', 'pada hari Isnin'], en: 'When did Aminah go to the market? On Saturday.' },
      { lvl: 0, q: 'Bagaimanakah mereka pergi ke pasar?', a: 'dengan bas', o: ['dengan kereta', 'dengan teksi'], en: 'How did they go to the market? By bus.' },
      { lvl: 0, q: 'Berapa biji telur yang ibu beli?', a: 'sepuluh biji', o: ['lima biji', 'dua biji'], en: 'How many eggs did Mother buy? Ten.' },
      { lvl: 1, q: 'Apakah yang Aminah bawa?', a: 'bakul', o: ['payung', 'beg sekolah'], en: 'What did Aminah carry? The basket.' },
      { lvl: 2, q: 'Mengapakah Aminah berasa gembira?', a: 'kerana dapat menolong ibunya', o: ['kerana dapat membeli mainan', 'kerana dapat menaiki teksi'], en: 'Why did Aminah feel happy? Because she could help her mother.' }
    ] },
  { id: 'sukan', title: 'Hari Sukan',
    text: 'Hari ini ialah Hari Sukan di sekolah Haziq. Murid-murid berkumpul di padang pada pukul lapan pagi. Haziq menyertai acara lumba lari. Dia berlari dengan sangat pantas dan mendapat tempat pertama. Guru besar memberikan sebuah piala kepada Haziq. Ibu dan bapa Haziq bertepuk tangan. Mereka bangga akan Haziq.',
    en: 'Today is Sports Day at Haziq\'s school. The pupils gathered on the field at eight in the morning. Haziq took part in the running race. He ran very fast and came first. The principal gave Haziq a trophy. Haziq\'s mother and father clapped. They are proud of Haziq.',
    qs: [
      { lvl: 0, q: 'Di manakah murid-murid berkumpul?', a: 'di padang', o: ['di dewan', 'di kantin'], en: 'Where did the pupils gather? On the field.' },
      { lvl: 0, q: 'Pada pukul berapakah murid-murid berkumpul?', a: 'pukul lapan pagi', o: ['pukul sepuluh pagi', 'pukul dua petang'], en: 'At what time did the pupils gather? At eight in the morning.' },
      { lvl: 0, q: 'Haziq menyertai acara apa?', a: 'lumba lari', o: ['lompat jauh', 'bola sepak'], en: 'Which event did Haziq take part in? The running race.' },
      { lvl: 1, q: 'Apakah yang Haziq dapat daripada guru besar?', a: 'sebuah piala', o: ['sebuah buku', 'sebiji bola'], en: 'What did Haziq get from the principal? A trophy.' },
      { lvl: 2, q: 'Mengapakah ibu dan bapa Haziq bangga?', a: 'kerana Haziq mendapat tempat pertama', o: ['kerana Haziq bangun awal', 'kerana Haziq membawa bola'], en: 'Why are Haziq\'s mother and father proud? Because Haziq came first.' }
    ] },
  { id: 'kebun', title: 'Kebun Datuk',
    text: 'Datuk saya ada sebuah kebun kecil di belakang rumah. Di kebun itu ada pokok pisang, pokok betik dan pokok cili. Setiap petang, datuk menyiram semua pokok itu. Saya suka menolong datuk mencabut rumput. Apabila buah betik sudah masak, nenek memotongnya untuk kami sekeluarga. Buah betik itu sungguh manis.',
    en: 'My grandfather has a small garden behind the house. In the garden there are banana trees, papaya trees and chilli plants. Every evening, Grandfather waters all the plants. I like to help Grandfather pull out the weeds. When the papayas are ripe, Grandmother cuts them for our whole family. The papaya is really sweet.',
    qs: [
      { lvl: 0, q: 'Di manakah kebun datuk?', a: 'di belakang rumah', o: ['di hadapan rumah', 'di tepi sungai'], en: 'Where is Grandfather\'s garden? Behind the house.' },
      { lvl: 0, q: 'Bilakah datuk menyiram pokok?', a: 'setiap petang', o: ['setiap pagi', 'setiap malam'], en: 'When does Grandfather water the plants? Every evening.' },
      { lvl: 1, q: 'Siapakah yang memotong buah betik?', a: 'nenek', o: ['datuk', 'ibu'], en: 'Who cuts the papaya? Grandmother.' },
      { lvl: 1, q: 'Apakah rasa buah betik itu?', a: 'manis', o: ['masam', 'pahit'], en: 'How does the papaya taste? Sweet.' },
      { lvl: 2, q: 'Pokok apakah yang tidak ada di kebun datuk?', a: 'pokok rambutan', o: ['pokok pisang', 'pokok cili'], en: 'Which tree is not in Grandfather\'s garden? The rambutan tree.' }
    ] },
  { id: 'hujan', title: 'Hari Hujan',
    text: 'Pada suatu petang, hujan turun dengan lebat. Farid tidak dapat bermain bola di padang. Dia duduk di tepi tingkap sambil melihat hujan. Kakaknya mengajak Farid bermain catur. Mereka bermain bersama-sama sehingga hujan berhenti. Selepas itu, ibu menghidangkan pisang goreng yang panas. Farid tidak berasa bosan lagi.',
    en: 'One afternoon, it rained heavily. Farid could not play ball on the field. He sat by the window watching the rain. His elder sister invited Farid to play chess. They played together until the rain stopped. After that, Mother served hot banana fritters. Farid did not feel bored any more.',
    qs: [
      { lvl: 0, q: 'Bilakah hujan turun?', a: 'pada waktu petang', o: ['pada waktu pagi', 'pada waktu malam'], en: 'When did it rain? In the afternoon.' },
      { lvl: 0, q: 'Di manakah Farid duduk?', a: 'di tepi tingkap', o: ['di atas katil', 'di bawah pokok'], en: 'Where did Farid sit? By the window.' },
      { lvl: 1, q: 'Siapakah yang mengajak Farid bermain catur?', a: 'kakaknya', o: ['ibunya', 'kawannya'], en: 'Who invited Farid to play chess? His elder sister.' },
      { lvl: 1, q: 'Apakah yang ibu hidangkan?', a: 'pisang goreng', o: ['nasi goreng', 'kuih lapis'], en: 'What did Mother serve? Banana fritters.' },
      { lvl: 2, q: 'Mengapakah Farid tidak dapat bermain bola?', a: 'kerana hujan lebat', o: ['kerana dia sakit', 'kerana bolanya hilang'], en: 'Why could Farid not play ball? Because it was raining heavily.' }
    ] },
  { id: 'pustaka', title: 'Di Perpustakaan',
    text: 'Setiap hari Rabu, kelas Mei Ling pergi ke perpustakaan sekolah. Cikgu Zainab meminta murid-murid memilih sebuah buku cerita. Mei Ling memilih buku tentang seekor arnab yang bijak. Dia membaca buku itu dengan senyap. Murid-murid tidak boleh bising di dalam perpustakaan. Mei Ling meminjam buku itu selama dua minggu.',
    en: 'Every Wednesday, Mei Ling\'s class goes to the school library. Cikgu Zainab asks the pupils to choose a storybook. Mei Ling chose a book about a clever rabbit. She read the book quietly. Pupils must not be noisy in the library. Mei Ling borrowed the book for two weeks.',
    qs: [
      { lvl: 0, q: 'Pada hari apakah kelas Mei Ling pergi ke perpustakaan?', a: 'hari Rabu', o: ['hari Isnin', 'hari Jumaat'], en: 'On which day does Mei Ling\'s class go to the library? Wednesday.' },
      { lvl: 0, q: 'Siapakah yang meminta murid-murid memilih buku?', a: 'Cikgu Zainab', o: ['Mei Ling', 'guru besar'], en: 'Who asked the pupils to choose a book? Cikgu Zainab.' },
      { lvl: 1, q: 'Mei Ling memilih buku tentang haiwan apa?', a: 'arnab', o: ['kucing', 'kura-kura'], en: 'Mei Ling chose a book about which animal? A rabbit.' },
      { lvl: 1, q: 'Berapa lamakah Mei Ling meminjam buku itu?', a: 'dua minggu', o: ['dua hari', 'satu bulan'], en: 'For how long did Mei Ling borrow the book? Two weeks.' },
      { lvl: 2, q: 'Apakah yang murid-murid tidak boleh lakukan di dalam perpustakaan?', a: 'membuat bising', o: ['membaca buku', 'meminjam buku'], en: 'What must pupils not do in the library? Make noise.' }
    ] }
];

// ---------- 10. BINA AYAT (susun perkataan) ----------
// One tile per word. The first tile keeps its capital and the last
// keeps its full stop, which pins both ends. Each sentence was checked
// for a second grammatical order of the middle tiles; any that had one
// was dropped rather than half-marked. `also` is there for the day one
// slips through: list the other full sentence and it will be accepted.
const MALAY_P2_BINA = [
  { s: 'Ibu membeli sayur di pasar.', en: 'Mother buys vegetables at the market.' },
  { s: 'Saya suka membaca buku cerita.', en: 'I like reading storybooks.' },
  { s: 'Adik minum susu setiap pagi.', en: 'The little one drinks milk every morning.' },
  { s: 'Kami bermain bola di padang.', en: 'We play ball on the field.' },
  { s: 'Kami melawat nenek di kampung.', en: 'We visited Grandmother in the village.' },
  { s: 'Kakak menyapu lantai dengan penyapu.', en: 'My elder sister sweeps the floor with a broom.' },
  { s: 'Siti menulis surat kepada neneknya.', en: 'Siti wrote a letter to her grandmother.' },
  { s: 'Hari ini cuaca sangat panas.', en: 'The weather is very hot today.' },
  { s: 'Abang saya pandai bermain badminton.', en: 'My elder brother is good at playing badminton.' },
  { s: 'Saya menggosok gigi sebelum tidur.', en: 'I brush my teeth before sleeping.' },
  { s: 'Bunga ros itu sangat harum.', en: 'That rose is very fragrant.' },
  { s: 'Doktor memeriksa pesakit di klinik.', en: 'The doctor examines patients at the clinic.' },
  { s: 'Rumah saya dekat dengan sekolah.', en: 'My house is near the school.' },
  { s: 'Dia ialah kawan baik saya.', en: 'He or she is my best friend.' },
  { s: 'Saya hendak menjadi seorang guru.', en: 'I want to become a teacher.' },
  { s: 'Polis itu menangkap seorang pencuri.', en: 'The policeman caught a thief.' },
  { s: 'Emak menggoreng ikan di dapur.', en: 'Mother fries fish in the kitchen.' },
  { s: 'Abang menunggang basikal ke taman.', en: 'My elder brother rides a bicycle to the park.' },
  { s: 'Datuk bercerita tentang zaman dahulu.', en: 'Grandfather tells stories about the old days.' },
  { s: 'Murid-murid beratur di tapak perhimpunan.', en: 'The pupils line up at the assembly area.' },
  { s: 'Ayah membasuh kereta pada hari Ahad.', en: 'Father washes the car on Sunday.' },
  { s: 'Kucing saya tidur di bawah meja.', en: 'My cat sleeps under the table.' },
  { s: 'Nenek suka menanam bunga di taman.', en: 'Grandmother likes planting flowers in the garden.' },
  { s: 'Burung terbang ke atas pokok itu.', en: 'The bird flew up onto that tree.' },
  { s: 'Ali pergi ke sekolah dengan bas.', en: 'Ali goes to school by bus.' },
  { s: 'Ayah saya bekerja di sebuah hospital.', en: 'My father works at a hospital.' },
  { s: 'Kami makan nasi lemak di kantin.', en: 'We eat nasi lemak in the canteen.' },
  { s: 'Ibu memasak sup ayam untuk kami.', en: 'Mother cooks chicken soup for us.' },
  { s: 'Kami menyanyikan lagu kebangsaan setiap pagi.', en: 'We sing the national anthem every morning.' },
  { s: 'Ayah dan ibu pergi ke pejabat.', en: 'Father and Mother go to the office.' },
  { s: 'Kereta merah itu milik ayah saya.', en: 'That red car belongs to my father.' },
  { s: 'Semua murid mesti memakai kasut putih.', en: 'All pupils must wear white shoes.' },
  { s: 'Tolong tutup pintu itu dengan perlahan-lahan.', en: 'Please close that door slowly.' },
  { s: 'Jangan buang sampah di merata-rata tempat.', en: 'Do not throw rubbish all over the place.' },
  { s: 'Sila beratur sebelum menaiki bas sekolah.', en: 'Please line up before boarding the school bus.' },
  { s: 'Pokok rambutan itu sudah berbuah lebat.', en: 'That rambutan tree is heavy with fruit.' },
  { s: 'Ikan emas berenang di dalam akuarium.', en: 'The goldfish swims in the aquarium.' },
  { s: 'Nenek menjahit baju kurung untuk saya.', en: 'Grandmother sews a baju kurung for me.' },
  { s: 'Saya menyimpan wang di dalam tabung.', en: 'I keep money in the money box.' },
  { s: 'Kita mesti mencuci tangan sebelum makan.', en: 'We must wash our hands before eating.' },
  { s: 'Bapa membaca surat khabar di ruang tamu.', en: 'Father reads the newspaper in the living room.' },
  { s: 'Saya dan adik bermain di taman permainan.', en: 'My younger sibling and I play at the playground.' },
  { s: 'Kakak sedang menyiram pokok bunga di halaman.', en: 'My elder sister is watering the flowering plants in the yard.' },
  { s: 'Kami pergi ke zoo dengan menaiki bas.', en: 'We went to the zoo by bus.' }
];
