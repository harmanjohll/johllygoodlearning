// ============================================================
//  CODE LEVELS — Theme descriptions + 60 grid puzzle levels
// ============================================================

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

function getCodeLevelTheme(skillId) {
  var skill = getSkillState(skillId);
  var theme = CODE_LEVEL_THEMES.find(function(t) {
    return t.skill === skillId && t.level === skill.level;
  });
  return theme || { title: 'Code Challenge', desc: 'Solve the coding puzzle!' };
}

// ============================================================
//  GRID PUZZLE LEVELS — 60 levels for the visual robot coding
// ============================================================
// Grid: 0=empty, 1=wall, 2=gem, 3=goal
// start: [row, col], goal: [row, col], gems: [[row,col],...]

var CODE_GRID_LEVELS = [
  // ============ SEQUENCE LEVELS (12) ============
  // S1: straight line right (3x3)
  { skill:'cseq', title:'Walk the Path', grid:[[4,0,0],[0,0,0],[0,0,3]], start:[0,0], goal:[2,2], gems:[], maxBlocks:4, hint:'Go right, then down, then right, then down.' },
  // S2: L-shape (3x3)
  { skill:'cseq', title:'Turn the Corner', grid:[[4,0,1],[0,0,1],[0,0,3]], start:[0,0], goal:[2,2], gems:[], maxBlocks:5, hint:'Go down first to avoid the walls, then right.' },
  // S3: collect a gem (3x3)
  { skill:'cseq', title:'Gem Collector', grid:[[4,2,0],[0,0,0],[0,0,3]], start:[0,0], goal:[2,2], gems:[[0,1]], maxBlocks:5, hint:'Pick up the gem on your way!' },
  // S4: zigzag (3x4)
  { skill:'cseq', title:'Zigzag Path', grid:[[4,0,0,0],[1,1,0,1],[0,0,0,3]], start:[0,0], goal:[2,3], gems:[], maxBlocks:7, hint:'Find a path around the walls.' },
  // S5: 4x4 with walls
  { skill:'cseq', title:'Maze Runner', grid:[[4,0,1,0],[0,0,1,0],[0,0,0,0],[1,1,0,3]], start:[0,0], goal:[3,3], gems:[], maxBlocks:8, hint:'Navigate around both wall sections.' },
  // S6: gems on path (4x4)
  { skill:'cseq', title:'Treasure Trail', grid:[[4,2,0,0],[0,0,0,1],[1,0,2,0],[0,0,0,3]], start:[0,0], goal:[3,3], gems:[[0,1],[2,2]], maxBlocks:8, hint:'Collect both gems on your way.' },
  // S7: 4x4 longer path
  { skill:'cseq', title:'The Long Way', grid:[[4,0,0,0],[1,1,1,0],[0,0,0,0],[0,1,1,3]], start:[0,0], goal:[3,3], gems:[], maxBlocks:10, hint:'You\'ll need to go around the long way.' },
  // S8: 5x5 intro
  { skill:'cseq', title:'Big Grid', grid:[[4,0,0,0,0],[0,1,1,1,0],[0,0,0,0,0],[0,1,1,0,1],[0,0,0,0,3]], start:[0,0], goal:[4,4], gems:[], maxBlocks:12, hint:'Plan your route before starting!' },
  // S9: 5x5 with gems
  { skill:'cseq', title:'Gem Hunt', grid:[[4,0,2,0,0],[0,1,0,1,0],[0,0,0,0,2],[0,1,1,0,0],[0,0,0,0,3]], start:[0,0], goal:[4,4], gems:[[0,2],[2,4]], maxBlocks:12, hint:'Can you collect both gems and reach the flag?' },
  // S10: snake path
  { skill:'cseq', title:'Snake Path', grid:[[4,0,0,0,0],[1,1,1,1,0],[0,0,0,0,0],[0,1,1,1,1],[0,0,0,0,3]], start:[0,0], goal:[4,4], gems:[], maxBlocks:16, hint:'Follow the snake-like path.' },
  // S11: 5x5 complex
  { skill:'cseq', title:'Expert Navigator', grid:[[0,0,4,0,0],[0,1,0,1,0],[0,0,0,0,0],[0,1,0,1,0],[0,0,3,0,0]], start:[0,2], goal:[4,2], gems:[], maxBlocks:10, hint:'Straight down won\'t work \u2014 find a path around.' },
  // S12: 6x6 finale
  { skill:'cseq', title:'Master Sequence', grid:[[4,0,1,0,0,0],[0,0,1,0,1,0],[0,0,0,0,1,0],[1,1,0,1,0,0],[0,0,0,1,0,1],[0,0,0,0,0,3]], start:[0,0], goal:[5,5], gems:[], maxBlocks:14, hint:'This is a tricky one! Plan ahead.' },

  // ============ LOOP LEVELS (12) ============
  // L1: straight line (needs repeat right)
  { skill:'cloop', title:'Repeat Right', grid:[[4,0,0,0,3]], start:[0,0], goal:[0,4], gems:[], maxBlocks:4, hint:'Use 4 rights. A loop would be: repeat 4 \u2192.' },
  // L2: straight down
  { skill:'cloop', title:'Repeat Down', grid:[[4],[0],[0],[0],[3]], start:[0,0], goal:[4,0], gems:[], maxBlocks:4, hint:'Go down 4 times.' },
  // L3: L-shape repeated
  { skill:'cloop', title:'Staircase', grid:[[4,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,3]], start:[0,0], goal:[4,4], gems:[], maxBlocks:8, hint:'Right then down, repeat that pattern.' },
  // L4: gems in a line
  { skill:'cloop', title:'Gem Line', grid:[[4,2,2,2,3]], start:[0,0], goal:[0,4], gems:[[0,1],[0,2],[0,3]], maxBlocks:4, hint:'Collect all 3 gems by going right 4 times.' },
  // L5: border walk
  { skill:'cloop', title:'Border Patrol', grid:[[4,0,0,3],[0,0,0,0],[0,0,0,0]], start:[0,0], goal:[0,3], gems:[], maxBlocks:3, hint:'Go right 3 times.' },
  // L6: zigzag loop
  { skill:'cloop', title:'Zigzag Loop', grid:[[4,0,0],[1,1,0],[0,0,0],[0,1,1],[0,0,3]], start:[0,0], goal:[4,2], gems:[], maxBlocks:10, hint:'Right-right-down, then left-left-down. Repeat pattern!' },
  // L7: spiral inward
  { skill:'cloop', title:'Spiral In', grid:[[4,0,0,0],[1,1,1,0],[0,0,0,0],[0,1,1,3]], start:[0,0], goal:[3,3], gems:[], maxBlocks:10, hint:'Go right, then down, then left, then down, then right.' },
  // L8: gem collection loop
  { skill:'cloop', title:'Collect & Repeat', grid:[[4,0,2,0,2,0,3]], start:[0,0], goal:[0,6], gems:[[0,2],[0,4]], maxBlocks:6, hint:'6 rights — and you\'ll collect 2 gems along the way.' },
  // L9: 4x4 loop pattern
  { skill:'cloop', title:'Pattern Walk', grid:[[4,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,3]], start:[0,0], goal:[3,3], gems:[], maxBlocks:6, hint:'3 rights, then 3 downs. Or alternate right-down.' },
  // L10: long collection
  { skill:'cloop', title:'Long Loop', grid:[[4,2,0,2,0,2,0,3]], start:[0,0], goal:[0,7], gems:[[0,1],[0,3],[0,5]], maxBlocks:7, hint:'Just keep going right! 7 times.' },
  // L11: staircase with gems
  { skill:'cloop', title:'Gem Stairs', grid:[[4,0,0,0,0],[0,2,0,0,0],[0,0,2,0,0],[0,0,0,2,0],[0,0,0,0,3]], start:[0,0], goal:[4,4], gems:[[1,1],[2,2],[3,3]], maxBlocks:8, hint:'Right-down repeating pattern collects all gems.' },
  // L12: border circuit
  { skill:'cloop', title:'Full Circuit', grid:[[4,0,0,3],[0,0,0,0],[0,0,0,0],[0,0,0,0]], start:[0,0], goal:[0,3], gems:[], maxBlocks:3, hint:'Three rights gets you there.' },

  // ============ CONDITIONAL LEVELS (12) ============
  // C1-C12: simple to complex paths with decision points
  { skill:'ccond', title:'Fork in the Road', grid:[[0,4,0],[0,0,0],[3,1,0]], start:[0,1], goal:[2,0], gems:[], maxBlocks:4, hint:'Go down and left to avoid the wall.' },
  { skill:'ccond', title:'Which Way?', grid:[[4,1,0],[0,1,0],[0,0,3]], start:[0,0], goal:[2,2], gems:[], maxBlocks:4, hint:'Can\'t go right at start. Go down first.' },
  { skill:'ccond', title:'Wall Dodge', grid:[[4,0,0,0],[1,1,1,0],[0,0,0,0],[0,0,0,3]], start:[0,0], goal:[3,3], gems:[], maxBlocks:8, hint:'Go right to the end, then down, then navigate around.' },
  { skill:'ccond', title:'Two Paths', grid:[[4,0,0],[0,1,0],[0,1,0],[0,0,3]], start:[0,0], goal:[3,2], gems:[], maxBlocks:6, hint:'Both paths work \u2014 but one is shorter.' },
  { skill:'ccond', title:'Gem or Speed?', grid:[[4,0,0,0],[0,1,2,0],[0,0,1,0],[0,0,0,3]], start:[0,0], goal:[3,3], gems:[[1,2]], maxBlocks:8, hint:'Choose: straight to goal, or detour for the gem?' },
  { skill:'ccond', title:'Dead End Detector', grid:[[4,0,1],[0,1,0],[0,0,3]], start:[0,0], goal:[2,2], gems:[], maxBlocks:5, hint:'Going right hits a dead end. Go down first!' },
  { skill:'ccond', title:'Maze Choice', grid:[[4,0,0,0,0],[1,1,0,1,0],[0,0,0,1,0],[0,1,0,0,0],[0,0,0,1,3]], start:[0,0], goal:[4,4], gems:[], maxBlocks:12, hint:'Find the one path through the maze.' },
  { skill:'ccond', title:'Triple Fork', grid:[[0,4,0,0,0],[0,0,0,0,0],[1,0,1,0,1],[0,0,0,0,0],[0,0,3,0,0]], start:[0,1], goal:[4,2], gems:[], maxBlocks:6, hint:'Go down, pick the right gap in the wall.' },
  { skill:'ccond', title:'Barrier Maze', grid:[[4,0,0,0],[1,0,1,0],[0,0,0,0],[0,1,0,1],[0,0,3,0]], start:[0,0], goal:[4,2], gems:[], maxBlocks:8, hint:'Zigzag through the barriers.' },
  { skill:'ccond', title:'Island Hop', grid:[[4,0,1,0,0],[0,0,1,0,0],[1,0,0,0,1],[0,0,1,0,0],[0,0,1,0,3]], start:[0,0], goal:[4,4], gems:[], maxBlocks:10, hint:'Find the gaps between the wall islands.' },
  { skill:'ccond', title:'Decision Maze', grid:[[4,0,0,0,0],[0,1,0,1,0],[0,0,0,0,0],[0,1,0,1,0],[0,0,0,0,3]], start:[0,0], goal:[4,4], gems:[], maxBlocks:8, hint:'Multiple correct paths exist!' },
  { skill:'ccond', title:'The Gauntlet', grid:[[4,0,1,0,0,0],[1,0,1,0,1,0],[0,0,0,0,1,0],[0,1,1,0,0,0],[0,0,0,1,0,1],[0,0,0,0,0,3]], start:[0,0], goal:[5,5], gems:[], maxBlocks:14, hint:'Navigate carefully through this challenging maze.' },

  // ============ VARIABLE LEVELS (12) ============
  // V1-V12: paths with gem counting
  { skill:'cvar', title:'Count the Gems', grid:[[4,2,2,3]], start:[0,0], goal:[0,3], gems:[[0,1],[0,2]], maxBlocks:3, hint:'How many gems will the robot collect? Go right 3 times.' },
  { skill:'cvar', title:'Gem Path', grid:[[4,2,0],[0,2,0],[0,2,3]], start:[0,0], goal:[2,2], gems:[[0,1],[1,1],[2,1]], maxBlocks:5, hint:'Collect all 3 gems on your path.' },
  { skill:'cvar', title:'Corner Gems', grid:[[4,0,2],[0,0,0],[2,0,3]], start:[0,0], goal:[2,2], gems:[[0,2],[2,0]], maxBlocks:6, hint:'You can only reach one corner gem. Which path to choose?' },
  { skill:'cvar', title:'Max Collection', grid:[[4,2,0,0],[0,2,2,0],[0,0,2,0],[0,0,0,3]], start:[0,0], goal:[3,3], gems:[[0,1],[1,1],[1,2],[2,2]], maxBlocks:7, hint:'Try to collect as many gems as possible.' },
  { skill:'cvar', title:'Gem Maze', grid:[[4,0,2,0],[1,0,1,0],[0,2,0,0],[0,0,2,3]], start:[0,0], goal:[3,3], gems:[[0,2],[2,1],[3,2]], maxBlocks:8, hint:'Navigate the maze and collect gems!' },
  { skill:'cvar', title:'Rich Path', grid:[[4,2,2,2,3]], start:[0,0], goal:[0,4], gems:[[0,1],[0,2],[0,3]], maxBlocks:4, hint:'Go right 4 times to collect all 3 gems.' },
  { skill:'cvar', title:'Diagonal Gems', grid:[[4,0,0,0],[0,2,0,0],[0,0,2,0],[0,0,0,3]], start:[0,0], goal:[3,3], gems:[[1,1],[2,2]], maxBlocks:6, hint:'The gems are on the diagonal!' },
  { skill:'cvar', title:'Scattered Treasure', grid:[[4,0,2,0,0],[0,0,0,0,2],[2,0,0,0,0],[0,0,2,0,0],[0,0,0,0,3]], start:[0,0], goal:[4,4], gems:[[0,2],[1,4],[2,0],[3,2]], maxBlocks:10, hint:'Not all gems are reachable. Prioritize your path!' },
  { skill:'cvar', title:'Gem Collector Pro', grid:[[4,2,0,2],[0,0,0,0],[2,0,0,2],[0,0,0,3]], start:[0,0], goal:[3,3], gems:[[0,1],[0,3],[2,0],[2,3]], maxBlocks:8, hint:'Plan a route that maximizes gem collection.' },
  { skill:'cvar', title:'Hidden Gems', grid:[[4,0,0,0,0],[0,1,2,1,0],[0,0,0,0,0],[0,1,2,1,0],[0,0,0,0,3]], start:[0,0], goal:[4,4], gems:[[1,2],[3,2]], maxBlocks:10, hint:'The gems are hidden behind walls. Find the gaps!' },
  { skill:'cvar', title:'Double Diamond', grid:[[4,0,0,0],[0,2,0,0],[0,0,0,0],[0,0,2,0],[0,0,0,3]], start:[0,0], goal:[4,3], gems:[[1,1],[3,2]], maxBlocks:8, hint:'Both gems are along a staircase path.' },
  { skill:'cvar', title:'Treasure Vault', grid:[[4,2,2,0,0],[0,0,0,0,0],[0,2,0,2,0],[0,0,0,0,0],[0,0,2,2,3]], start:[0,0], goal:[4,4], gems:[[0,1],[0,2],[2,1],[2,3],[4,2],[4,3]], maxBlocks:10, hint:'So many gems! Find the path that grabs the most.' },

  // ============ DEBUG LEVELS (12) ============
  // D1-D12: paths where you need to find the right route
  { skill:'cdebug', title:'Wrong Turn', grid:[[4,0,0],[1,0,0],[0,0,3]], start:[0,0], goal:[2,2], gems:[], maxBlocks:4, hint:'Going down first hits a wall!' },
  { skill:'cdebug', title:'Blocked Path', grid:[[4,0,1,0],[0,0,1,0],[0,0,0,3]], start:[0,0], goal:[2,3], gems:[], maxBlocks:6, hint:'The middle wall blocks a direct path.' },
  { skill:'cdebug', title:'Trap Avoidance', grid:[[4,0,0,0],[1,1,0,0],[0,0,0,1],[0,0,0,3]], start:[0,0], goal:[3,3], gems:[], maxBlocks:8, hint:'Watch for walls that trap you in corners.' },
  { skill:'cdebug', title:'Hidden Wall', grid:[[4,0,0,0],[0,0,1,0],[0,0,0,0],[0,1,0,3]], start:[0,0], goal:[3,3], gems:[], maxBlocks:7, hint:'The walls aren\'t where you expect.' },
  { skill:'cdebug', title:'One Way Out', grid:[[0,4,0],[1,0,1],[0,0,0],[0,1,0],[0,3,0]], start:[0,1], goal:[4,1], gems:[], maxBlocks:6, hint:'Only one path leads down through the gaps.' },
  { skill:'cdebug', title:'False Start', grid:[[4,1,0,0],[0,1,0,0],[0,0,0,1],[0,0,0,3]], start:[0,0], goal:[3,3], gems:[], maxBlocks:8, hint:'The obvious path right is blocked!' },
  { skill:'cdebug', title:'Maze Debug', grid:[[4,0,0,0,0],[1,1,0,1,0],[0,0,0,1,0],[0,1,0,0,0],[0,0,0,1,3]], start:[0,0], goal:[4,4], gems:[], maxBlocks:12, hint:'Trace the path carefully before coding.' },
  { skill:'cdebug', title:'Corner Trap', grid:[[4,0,0],[0,1,0],[0,0,3]], start:[0,0], goal:[2,2], gems:[], maxBlocks:4, hint:'The wall in the middle forces a specific path.' },
  { skill:'cdebug', title:'Double Wall', grid:[[4,0,0,0],[0,1,0,0],[0,1,0,0],[0,0,0,3]], start:[0,0], goal:[3,3], gems:[], maxBlocks:7, hint:'Two walls in a column \u2014 go around both.' },
  { skill:'cdebug', title:'Tricky Turns', grid:[[4,0,0,0,0],[0,0,1,1,0],[0,0,0,0,0],[0,1,1,0,0],[0,0,0,0,3]], start:[0,0], goal:[4,4], gems:[], maxBlocks:10, hint:'Plan your turns to avoid both wall sections.' },
  { skill:'cdebug', title:'Bug in the Walls', grid:[[4,0,1,0,0],[0,0,1,0,0],[0,0,0,0,1],[1,0,0,0,0],[0,0,0,0,3]], start:[0,0], goal:[4,4], gems:[], maxBlocks:10, hint:'The walls create a winding path.' },
  { skill:'cdebug', title:'Final Debug', grid:[[4,0,0,0,0,0],[1,1,0,1,1,0],[0,0,0,0,0,0],[0,1,1,0,1,1],[0,0,0,0,0,0],[0,0,1,0,0,3]], start:[0,0], goal:[5,5], gems:[], maxBlocks:14, hint:'This is the hardest maze. Plan every move!' }
];
