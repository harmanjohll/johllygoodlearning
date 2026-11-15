// ============================================================
//  MALAY TREE — Bahasa Melayu: 10 P1 skills and 10 P2 skills
// ============================================================

const MALAY_TREE = {
  // === P1 Foundation (Bahasa Melayu) ===
  huruf:     { id:'huruf',     name:'Huruf & Bunyi',       icon:'🔤', grade:'P1 Foundation', deps:[],            desc:'Vowels, consonants, suku kata' },
  nombor:    { id:'nombor',    name:'Nombor 1-20',          icon:'🔢', grade:'P1 Foundation', deps:[],            desc:'Count in Malay: satu, dua, tiga...' },
  salam:     { id:'salam',     name:'Salam & Sopan',         icon:'👋', grade:'P1 Foundation', deps:[],            desc:'Greetings and polite words' },
  warna:     { id:'warna',     name:'Warna-warni',           icon:'🎨', grade:'P1 Foundation', deps:[],            desc:'Colours in Malay' },

  // === P1 Everyday (Bahasa Melayu) ===
  keluarga:  { id:'keluarga',  name:'Keluarga Saya',         icon:'👪', grade:'P1 Everyday',  deps:[],     desc:'Family members and relations' },
  haiwan:    { id:'haiwan',    name:'Haiwan Kesayangan',     icon:'🐱', grade:'P1 Everyday',  deps:[],     desc:'Animals and their colours' },
  badan:     { id:'badan',     name:'Anggota Badan',         icon:'👐', grade:'P1 Everyday',  deps:[],     desc:'Body parts in Malay' },
  makanan:   { id:'makanan',   name:'Makanan Sedap',         icon:'🍛', grade:'P1 Everyday',  deps:[],     desc:'Food and drinks' },

  // === P1 Stretch (Bahasa Melayu) ===
  hari:      { id:'hari',      name:'Hari & Cuaca',          icon:'☀️',  grade:'P1 Stretch',   deps:[],     desc:'Days of the week and weather' },
  ayat:      { id:'ayat',      name:'Ayat Mudah',            icon:'✍️', grade:'P1 Stretch',   deps:[],     desc:'Build simple Malay sentences' },

  // === P2 Expansion (Bahasa Melayu) ===
  // Aligned to the Singapore MOE Malay Language syllabus for primary
  // schools (2015). AWAITING HUMAN REVIEW by a Malay speaker: every item
  // is listed in src/malay/P2_REVIEW.md.
  penjodoh:  { id:'penjodoh',  name:'Penjodoh Bilangan',     icon:'🧮', grade:'P2 Expansion', deps:['nombor','haiwan'], desc:'Counting words: orang, ekor, buah, biji' },
  ganda:     { id:'ganda',     name:'Kata Ganda',            icon:'👯', grade:'P2 Expansion', deps:['nombor'],          desc:'Doubled words, and when not to double' },
  tanya:     { id:'tanya',     name:'Kata Tanya',            icon:'❓', grade:'P2 Expansion', deps:['salam'],           desc:'Question words: apa, siapa, bila, di mana' },
  adjektif:  { id:'adjektif',  name:'Kata Adjektif',         icon:'🎭', grade:'P2 Expansion', deps:['warna'],           desc:'Describing words, opposites and synonyms' },
  imbuhan:   { id:'imbuhan',   name:'Imbuhan Awalan',        icon:'🧩', grade:'P2 Expansion', deps:['ayat'],            desc:'Prefixes me-, ber-, di- and ter-' },
  sendi:     { id:'sendi',     name:'Kata Sendi Nama',       icon:'📍', grade:'P2 Expansion', deps:['ayat'],            desc:'di, ke, dari, pada, kepada, daripada' },
  hubung:    { id:'hubung',    name:'Kata Hubung',           icon:'🔗', grade:'P2 Expansion', deps:['ayat'],            desc:'Joining words: dan, tetapi, kerana, atau' },
  peribahasa:{ id:'peribahasa',name:'Peribahasa Mudah',      icon:'💬', grade:'P2 Expansion', deps:['badan'],           desc:'Simpulan bahasa and what they mean' },
  binaayat:  { id:'binaayat',  name:'Bina Ayat',             icon:'🧱', grade:'P2 Expansion', deps:['ayat'],            desc:'Put the words in order to build a sentence' },
  kefahaman: { id:'kefahaman', name:'Kefahaman',             icon:'📖', grade:'P2 Expansion', deps:['ayat','keluarga'], desc:'Read a short passage and answer questions' }
};

// ------------------------------------------------------------
//  REVIEW GATE
// ------------------------------------------------------------
//  The P2 skills above were written without a Malay speaker in the
//  room. An earlier round put three Malay errors in front of Nas, so
//  this layer stays closed to her until a Malay speaker has ticked the
//  sheet at src/malay/P2_REVIEW.md. Then set this to true. Nothing else
//  needs to change. While it is false the skills show as locked with a
//  "being checked" note, and Compass does not suggest them.
var DUNIA_P2_REVIEWED = false;

if (!DUNIA_P2_REVIEWED) {
  Object.keys(MALAY_TREE).forEach(function (id) {
    if (MALAY_TREE[id].grade === 'P2 Expansion') MALAY_TREE[id].awaitingReview = true;
  });
}
