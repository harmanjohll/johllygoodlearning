// ============================================================
//  WORD TREE — 10-skill tree with dependencies (P1-P4 EL)
// ============================================================

const WORD_TREE = {
  // === P1 Foundation (EL) ===
  phonics:  { id:'phonics',  name:'Phonics & CVC',      icon:'\uD83D\uDD24', grade:'P1 Foundation', deps:[],           desc:'Sound out CVC words' },
  sight:    { id:'sight',    name:'Sight Words',         icon:'\uD83D\uDC41\uFE0F', grade:'P1 Foundation', deps:[],           desc:'Read high-frequency words' },
  spell:    { id:'spell',    name:'Spelling Bee',        icon:'\uD83D\uDC1D', grade:'P1 Foundation', deps:['phonics'],  desc:'Spell CVC words with pictures' },

  // === P2 Expansion (EL) ===
  grammar:  { id:'grammar',  name:'Grammar Garden',      icon:'\uD83C\uDF3B', grade:'P2 Expansion',  deps:['sight'],           desc:'Nouns, verbs, adjectives' },
  vocab:    { id:'vocab',    name:'Vocabulary Vault',     icon:'\uD83D\uDCDA', grade:'P2 Expansion',  deps:['sight'],           desc:'Learn new word meanings' },
  sentence: { id:'sentence', name:'Sentence Builder',     icon:'\uD83D\uDD28', grade:'P2 Expansion',  deps:['grammar'],         desc:'Build correct sentences' },

  // === P3 Deepening (EL) ===
  comprehension: { id:'comprehension', name:'Reading Comprehension', icon:'\uD83D\uDCD6', grade:'P3 Deepening', deps:['vocab','sentence'], desc:'Read passages and answer questions' },
  poetry:        { id:'poetry',        name:'Poetry Playground',     icon:'\uD83C\uDFB6', grade:'P3 Deepening', deps:['spell'],             desc:'Rhymes, syllables, and poems' },

  // === P4 Mastery (EL) ===
  story:     { id:'story',     name:'Story Garden',       icon:'\u270D\uFE0F', grade:'P4 Mastery', deps:['sentence','comprehension'], desc:'Write creative stories' },
  paragraph: { id:'paragraph', name:'Paragraph Power',    icon:'\uD83D\uDCDD', grade:'P4 Mastery', deps:['comprehension'],            desc:'Write structured paragraphs' }
};
