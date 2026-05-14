// ============================================================
//  STEM TREE — 18-skill tree: Science (11) + Coding (7)
// ============================================================

const STEM_TREE = {
  // === Science — P1 Foundation ===
  living:   { id:'living',   name:'Living Things',        icon:'🌱', grade:'P1 Science',  deps:[],          desc:'Plants, animals, and habitats' },
  material: { id:'material', name:'Materials & Matter',    icon:'🧪', grade:'P1 Science',  deps:[],          desc:'Solids, liquids, and properties' },
  senses:   { id:'senses',   name:'My Five Senses',         icon:'👀', grade:'P1 Science',  deps:[],            desc:'See, hear, smell, taste, touch' },
  plants:   { id:'plants',   name:'Plant Life Cycle',       icon:'🌻', grade:'P1 Science',  deps:['living'],    desc:'Seed, sprout, flower, seed' },

  // === Science — P2 Expansion ===
  forces:   { id:'forces',   name:'Forces & Energy',      icon:'⚡',       grade:'P2 Science',  deps:['material'], desc:'Push, pull, magnets, and energy' },
  earth:    { id:'earth',    name:'Earth & Weather',      icon:'🌍', grade:'P2 Science',  deps:['living'],   desc:'Weather, water cycle, and Earth' },
  body:     { id:'body',     name:'Human Body',           icon:'🫀', grade:'P2 Science',  deps:['living'],   desc:'Body systems and staying healthy' },
  animals:  { id:'animals',  name:'Animal Life Cycles',     icon:'🐛', grade:'P2 Science',  deps:['living'],    desc:'Butterflies, frogs, chickens, more' },
  seasons:  { id:'seasons',  name:'Day, Night, Seasons',    icon:'🌗', grade:'P2 Science',  deps:['earth'],     desc:'Why day and night, why seasons change' },
  sound:    { id:'sound',    name:'Sound',                  icon:'🔊', grade:'P2 Science',  deps:['forces'],    desc:'Vibrations, loud and soft, high and low' },
  light:    { id:'light',    name:'Light & Shadows',        icon:'🔦', grade:'P2 Science',  deps:['forces'],    desc:'Where light comes from, how shadows form' },

  // === Coding — P1 Foundation ===
  cseq:     { id:'cseq',     name:'Code: Sequences',      icon:'➡️', grade:'P1 Coding',   deps:[],           desc:'Step-by-step instructions' },
  cloop:    { id:'cloop',    name:'Code: Loops',           icon:'🔁', grade:'P1 Coding',   deps:['cseq'],     desc:'Repeat actions with loops' },

  // === Coding — P2 Expansion ===
  ccond:    { id:'ccond',    name:'Code: Conditionals',    icon:'🔀', grade:'P2 Coding',   deps:['cloop'],    desc:'If-then decisions' },
  cvar:     { id:'cvar',     name:'Code: Variables',       icon:'📦', grade:'P2 Coding',   deps:['ccond'],    desc:'Store and change values' },
  cevent:   { id:'cevent',   name:'Code: Events',           icon:'⚡',       grade:'P2 Coding',   deps:['ccond'],     desc:'When X happens, do Y' },
  cfunc:    { id:'cfunc',    name:'Code: Mini-Programs',    icon:'🧩', grade:'P2 Coding',   deps:['cvar'],      desc:'Reusable blocks of code' },
  cdebug:   { id:'cdebug',   name:'Code: Debugging',       icon:'🐛', grade:'P2 Coding',   deps:['cvar'],     desc:'Find and fix bugs' }
};
