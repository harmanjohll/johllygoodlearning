// ============================================================
//  MATH TREE — 28-skill tree with dependencies (P1-P4)
// ============================================================

const MATH_TREE = {
  // === P1 Foundation ===
  count:  { id:'count',  name:'Counting & Ten Frames', icon:'\uD83D\uDD1F', grade:'P1 Foundation', deps:[], desc:'Count objects and use ten frames' },
  nbond:  { id:'nbond',  name:'Number Bonds',          icon:'\uD83D\uDD17', grade:'P1 Foundation', deps:['count'], desc:'Break numbers into parts' },
  add:    { id:'add',    name:'Addition',               icon:'\u2795',       grade:'P1 Foundation', deps:['count'], desc:'Put numbers together' },
  sub:    { id:'sub',    name:'Subtraction',            icon:'\u2796',       grade:'P1 Foundation', deps:['count'], desc:'Take numbers apart' },
  cmp:    { id:'cmp',    name:'Comparing Numbers',      icon:'\u2696\uFE0F', grade:'P1 Foundation', deps:['count'], desc:'Which is bigger or smaller?' },
  pat:    { id:'pat',    name:'Patterns',               icon:'\uD83D\uDD36', grade:'P1 Foundation', deps:['count'], desc:'Find and complete patterns' },
  wp1:    { id:'wp1',    name:'Story Problems',         icon:'\uD83D\uDCDD', grade:'P1 Foundation', deps:['add','sub'], desc:'Solve real-world puzzles' },
  shp:    { id:'shp',    name:'Shape Explorer',         icon:'\uD83D\uDD37', grade:'P1 Foundation', deps:[], desc:'Discover 2D shapes' },

  // === P2 Expansion ===
  add100: { id:'add100', name:'Addition to 100',        icon:'\u2795',       grade:'P2 Expansion', deps:['add','nbond'], desc:'Add bigger numbers with regrouping' },
  sub100: { id:'sub100', name:'Subtraction to 100',     icon:'\u2796',       grade:'P2 Expansion', deps:['sub','nbond'], desc:'Subtract bigger numbers' },
  mul:    { id:'mul',    name:'Multiplication',         icon:'\u2716\uFE0F', grade:'P2 Expansion', deps:['add'], desc:'Times tables 2,3,4,5,10' },
  div:    { id:'div',    name:'Division',               icon:'\u2797',       grade:'P2 Expansion', deps:['mul'], desc:'Equal sharing and grouping' },
  frac1:  { id:'frac1',  name:'Fractions Basics',       icon:'\uD83E\uDD67', grade:'P2 Expansion', deps:['div'], desc:'Halves, thirds, quarters' },
  money:  { id:'money',  name:'Money',                  icon:'\uD83D\uDCB0', grade:'P2 Expansion', deps:['add100','sub100'], desc:'Singapore dollars and cents' },
  time1:  { id:'time1',  name:'Time',                   icon:'\uD83D\uDD50', grade:'P2 Expansion', deps:['count'], desc:'Read clocks and tell time' },
  pgraph: { id:'pgraph', name:'Picture Graphs',         icon:'\uD83D\uDCCA', grade:'P2 Expansion', deps:['count','add'], desc:'Read and make graphs' },
  lenmass:{ id:'lenmass',name:'Length & Mass',           icon:'\uD83D\uDCCF', grade:'P2 Expansion', deps:['cmp'], desc:'Comparing and measuring' },

  // === P3 Deepening ===
  add10k: { id:'add10k', name:'Addition to 10,000',     icon:'\u2795',       grade:'P3 Deepening', deps:['add100'], desc:'Column method with regrouping' },
  sub10k: { id:'sub10k', name:'Subtraction to 10,000',  icon:'\u2796',       grade:'P3 Deepening', deps:['sub100'], desc:'Column subtraction' },
  advmul: { id:'advmul', name:'Advanced Multiplication', icon:'\u2716\uFE0F', grade:'P3 Deepening', deps:['mul'], desc:'Times tables 6-9, multi-digit' },
  divrem: { id:'divrem', name:'Division with Remainder', icon:'\u2797',       grade:'P3 Deepening', deps:['div'], desc:'Division with leftovers' },
  fracadd:{ id:'fracadd',name:'Fraction Add/Subtract',  icon:'\uD83E\uDD67', grade:'P3 Deepening', deps:['frac1'], desc:'Adding fractions (same denominator)' },
  area:   { id:'area',   name:'Area & Perimeter',       icon:'\u2B1C',       grade:'P3 Deepening', deps:['mul','lenmass'], desc:'Count squares and trace edges' },
  angle:  { id:'angle',  name:'Angles',                 icon:'\uD83D\uDCD0', grade:'P3 Deepening', deps:['shp'], desc:'Right, acute, and obtuse angles' },
  bargraph:{ id:'bargraph',name:'Bar Graphs',           icon:'\uD83D\uDCCA', grade:'P3 Deepening', deps:['pgraph'], desc:'Read and interpret bar graphs' },

  // === P4 Mastery ===
  bignum: { id:'bignum', name:'Big Numbers',            icon:'\uD83D\uDD22', grade:'P4 Mastery', deps:['add10k'], desc:'Place value to 100,000' },
  multiop:{ id:'multiop',name:'Long Multiply/Divide',   icon:'\uD83E\uDDEE', grade:'P4 Mastery', deps:['advmul','divrem'], desc:'Multi-digit operations' },
  factor: { id:'factor', name:'Factors & Multiples',    icon:'\uD83C\uDF33', grade:'P4 Mastery', deps:['advmul'], desc:'Factor trees and LCM' },
  mixfrac:{ id:'mixfrac',name:'Mixed Fractions',        icon:'\uD83E\uDD67', grade:'P4 Mastery', deps:['fracadd'], desc:'Improper and mixed fractions' },
  decimal:{ id:'decimal',name:'Decimals',               icon:'\u2024',       grade:'P4 Mastery', deps:['frac1'], desc:'Tenths and hundredths' },
  symm:   { id:'symm',   name:'Symmetry',               icon:'\uD83E\uDE9E', grade:'P4 Mastery', deps:['shp'], desc:'Lines of symmetry' },
  dataan: { id:'dataan', name:'Data Analysis',          icon:'\uD83D\uDCC8', grade:'P4 Mastery', deps:['bargraph'], desc:'Tables, line graphs, averages' },
  multiwp:{ id:'multiwp',name:'Multi-step Problems',    icon:'\uD83E\uDDE9', grade:'P4 Mastery', deps:['wp1','mul'], desc:'Complex word problems' }
};
