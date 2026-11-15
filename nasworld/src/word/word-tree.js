// ============================================================
//  WORD TREE — 11-skill tree with dependencies (P1-P4 EL)
// ============================================================
//
//  Reading Comprehension sits in P2, not P3. P2 children do read short
//  passages and answer literal and simple inferential questions (MOE EL
//  Syllabus 2020), and the passages here are written for that. It opens
//  once Vocabulary Vault is under way, so it no longer waits behind
//  Sentence Builder, Grammar Garden and Punctuation Power as well. The
//  skill id is unchanged, so progress already saved against it carries
//  over.

const WORD_TREE = {
  // === P1 Foundation (EL) ===
  phonics:  { id:'phonics',  name:'Phonics & CVC',      icon:'🔤', grade:'P1 Foundation', deps:[],           desc:'Sound out CVC words' },
  sight:    { id:'sight',    name:'Sight Words',         icon:'👁️', grade:'P1 Foundation', deps:[],           desc:'Read high-frequency words' },
  spell:    { id:'spell',    name:'Spelling Bee',        icon:'🐝', grade:'P1 Foundation', deps:[],  desc:'Spell CVC words with pictures' },
  punct:    { id:'punct',    name:'Punctuation Power',   icon:'❕',       grade:'P1 Foundation', deps:[],            desc:'Full stops, question marks, commas, more' },

  // === P2 Expansion (EL) ===
  grammar:  { id:'grammar',  name:'Grammar Garden',      icon:'🌻', grade:'P2 Expansion',  deps:['sight'],           desc:'Tenses, pronouns, prepositions, joining words and more' },
  vocab:    { id:'vocab',    name:'Vocabulary Vault',     icon:'📚', grade:'P2 Expansion',  deps:['sight'],           desc:'Word meanings, synonyms and opposites' },
  sentence: { id:'sentence', name:'Sentence Builder',     icon:'🔨', grade:'P2 Expansion',  deps:['grammar','punct'], desc:'Rearrange and join sentences' },
  comprehension: { id:'comprehension', name:'Reading Comprehension', icon:'📖', grade:'P2 Expansion', deps:['vocab'], desc:'Read short passages and answer questions' },

  // === P3 Deepening (EL) ===
  poetry:        { id:'poetry',        name:'Poetry Playground',     icon:'🎶', grade:'P3 Deepening', deps:['spell'],             desc:'Rhymes, syllables, and poems' },

  // === P4 Mastery (EL) ===
  story:     { id:'story',     name:'Story Garden',       icon:'✍️', grade:'P4 Mastery', deps:['sentence','comprehension'], desc:'Write creative stories' },
  paragraph: { id:'paragraph', name:'Paragraph Power',    icon:'📝', grade:'P4 Mastery', deps:['comprehension'],            desc:'Write structured paragraphs' }
};
