// ============================================================
//  STEM TREE — 10-skill tree: Science (5) + Coding (5)
// ============================================================

const STEM_TREE = {
  // === Science — P1 Foundation ===
  living:   { id:'living',   name:'Living Things',        icon:'\uD83C\uDF31', grade:'P1 Science',  deps:[],          desc:'Plants, animals, and habitats' },
  material: { id:'material', name:'Materials & Matter',    icon:'\uD83E\uDDEA', grade:'P1 Science',  deps:[],          desc:'Solids, liquids, and properties' },

  // === Science — P2 Expansion ===
  forces:   { id:'forces',   name:'Forces & Energy',      icon:'\u26A1',       grade:'P2 Science',  deps:['material'], desc:'Push, pull, magnets, and energy' },
  earth:    { id:'earth',    name:'Earth & Weather',      icon:'\uD83C\uDF0D', grade:'P2 Science',  deps:['living'],   desc:'Weather, water cycle, and Earth' },
  body:     { id:'body',     name:'Human Body',           icon:'\uD83E\uDEC0', grade:'P2 Science',  deps:['living'],   desc:'Body systems and staying healthy' },

  // === Coding — P1 Foundation ===
  cseq:     { id:'cseq',     name:'Code: Sequences',      icon:'\u27A1\uFE0F', grade:'P1 Coding',   deps:[],           desc:'Step-by-step instructions' },
  cloop:    { id:'cloop',    name:'Code: Loops',           icon:'\uD83D\uDD01', grade:'P1 Coding',   deps:['cseq'],     desc:'Repeat actions with loops' },

  // === Coding — P2 Expansion ===
  ccond:    { id:'ccond',    name:'Code: Conditionals',    icon:'\uD83D\uDD00', grade:'P2 Coding',   deps:['cloop'],    desc:'If-then decisions' },
  cvar:     { id:'cvar',     name:'Code: Variables',       icon:'\uD83D\uDCE6', grade:'P2 Coding',   deps:['ccond'],    desc:'Store and change values' },
  cdebug:   { id:'cdebug',   name:'Code: Debugging',       icon:'\uD83D\uDC1B', grade:'P2 Coding',   deps:['cvar'],     desc:'Find and fix bugs' }
};
