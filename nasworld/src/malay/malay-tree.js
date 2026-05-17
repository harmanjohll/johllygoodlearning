// ============================================================
//  MALAY TREE — 10-skill tree for Bahasa Melayu (P1 foundation)
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
  ayat:      { id:'ayat',      name:'Ayat Mudah',            icon:'✍️', grade:'P1 Stretch',   deps:[],     desc:'Build simple Malay sentences' }
};
