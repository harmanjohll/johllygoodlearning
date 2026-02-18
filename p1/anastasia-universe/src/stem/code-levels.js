// ============================================================
//  CODE LEVELS — Additional coding level data & progression
// ============================================================
// This module extends the code engine with level-based progression data.
// Levels are handled via the adaptive engine (getSkillDifficulty)
// and the code-engine generators. This file provides supplementary
// themed level descriptions shown during coding activities.

var CODE_LEVEL_THEMES = [
  // Sequence levels
  { skill: 'cseq', level: 0, title: 'Robot\u2019s First Steps',    desc: 'Help the robot follow simple instructions!' },
  { skill: 'cseq', level: 1, title: 'Kitchen Helper',              desc: 'Put cooking steps in the right order.' },
  { skill: 'cseq', level: 2, title: 'Garden Planner',              desc: 'Sequence the steps to grow a plant.' },
  { skill: 'cseq', level: 3, title: 'Adventure Guide',             desc: 'Plan a treasure hunt step by step.' },
  { skill: 'cseq', level: 4, title: 'Space Commander',             desc: 'Launch a rocket with perfect sequencing!' },

  // Loop levels
  { skill: 'cloop', level: 0, title: 'Clap Along',                 desc: 'Count how many times the robot claps.' },
  { skill: 'cloop', level: 1, title: 'Dance Repeat',               desc: 'How many dance moves in the loop?' },
  { skill: 'cloop', level: 2, title: 'Pattern Maker',              desc: 'Loops can create beautiful patterns!' },
  { skill: 'cloop', level: 3, title: 'Music Maestro',              desc: 'Repeat musical notes with loops.' },
  { skill: 'cloop', level: 4, title: 'Loop Master',                desc: 'Nested loops and complex repetitions.' },

  // Conditional levels
  { skill: 'ccond', level: 0, title: 'Weather Checker',            desc: 'IF it rains, THEN take an umbrella!' },
  { skill: 'ccond', level: 1, title: 'Traffic Light',              desc: 'Stop or go? Follow the signals.' },
  { skill: 'ccond', level: 2, title: 'Animal Sorter',              desc: 'Sort animals by their features.' },
  { skill: 'ccond', level: 3, title: 'Decision Tree',              desc: 'Multiple conditions, multiple paths.' },
  { skill: 'ccond', level: 4, title: 'Logic Gate',                 desc: 'AND, OR, NOT \u2014 become a logic expert!' },

  // Variable levels
  { skill: 'cvar', level: 0, title: 'Score Keeper',                desc: 'Track the score as it changes.' },
  { skill: 'cvar', level: 1, title: 'Piggy Bank',                  desc: 'Add and remove coins from your bank.' },
  { skill: 'cvar', level: 2, title: 'Health Bar',                  desc: 'Track a character\u2019s health points.' },
  { skill: 'cvar', level: 3, title: 'Inventory Manager',           desc: 'Keep track of items collected.' },
  { skill: 'cvar', level: 4, title: 'Variable Wizard',             desc: 'Multiple variables working together!' },

  // Debug levels
  { skill: 'cdebug', level: 0, title: 'Spot the Mistake',          desc: 'Something silly is in the instructions!' },
  { skill: 'cdebug', level: 1, title: 'Fix the Recipe',            desc: 'The recipe has a wrong step.' },
  { skill: 'cdebug', level: 2, title: 'Code Doctor',               desc: 'Diagnose and fix the broken code.' },
  { skill: 'cdebug', level: 3, title: 'Bug Detective',             desc: 'Find the sneaky bug hiding in the code.' },
  { skill: 'cdebug', level: 4, title: 'Debug Champion',            desc: 'Fix tricky multi-step bugs!' }
];

// Get the current level theme for a coding skill
function getCodeLevelTheme(skillId) {
  var skill = getSkillState(skillId);
  var theme = CODE_LEVEL_THEMES.find(function(t) {
    return t.skill === skillId && t.level === skill.level;
  });
  return theme || { title: 'Code Challenge', desc: 'Solve the coding puzzle!' };
}
