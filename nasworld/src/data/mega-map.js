// ============================================================
//  MEGA MAP — Cross-world concept graph
//  Nodes: 4 worlds, ~63 skills, ~24 phenomena (real-world hooks)
//  Edges: every skill belongs-to a world; phenomena link to skills
//  across multiple worlds (the "cross-world" tissue).
// ============================================================

// Node kinds:
//   "world"      — top-level domain (math / word / stem / malay)
//   "skill"      — an individual skill (id matches MATH_TREE etc.)
//   "phenomenon" — a real-world hook that connects skills

var MEGA_WORLDS = [
  { id: 'math',  label: 'Number World', emoji: '🔢', colour: '#7bb3ff', desc: 'Counting, shape, money, time.' },
  { id: 'word',  label: 'Word World',   emoji: '📖', colour: '#ff7b7b', desc: 'Reading, spelling, stories.' },
  { id: 'stem',  label: 'STEM World',   emoji: '🔬', colour: '#7bffb5', desc: 'Science, coding, discovery.' },
  { id: 'malay', label: 'Dunia Melayu', emoji: '🌺', colour: '#ff7bdb', desc: 'Bahasa Melayu — words you hear every day.' }
];

// Phenomena = real-world things that pull skills together across worlds.
// Each phenomenon names the worlds it touches AND the specific skills.
var MEGA_PHENOMENA = [
  {
    id: 'lemonade-stand', label: 'Lemonade Stand', emoji: '🍋', threadId: 'lemonade',
    blurb: 'Run a tiny shop. Count coins, make a sign, taste-test, write a price list.',
    skills: ['count','add','money','sight','sentence','material','salam']
  },
  {
    id: 'plant-garden', label: 'Plant a Garden', emoji: '🌱', threadId: 'garden',
    blurb: 'Seed to sprout: measure pots, label plants, watch them grow.',
    skills: ['count','lenmass','grammar','living','earth','warna']
  },
  {
    id: 'build-robot', label: 'Build a Robot', emoji: '🤖', threadId: 'robot',
    blurb: 'Give a robot instructions. Sequence steps. Find bugs.',
    skills: ['cseq','cloop','ccond','cdebug','sentence','forces']
  },
  {
    id: 'world-stories', label: 'Stories From Many Homes', emoji: '📚', threadId: 'stories',
    blurb: 'Bedtime tales from Malay, Chinese, Indian and Western traditions. Spot the kindness inside each.',
    skills: ['sight','comprehension','vocab','keluarga','salam','ayat']
  },
  {
    id: 'hawker-centre', label: 'Hawker Centre Hunt', emoji: '🍜', threadId: 'hawker',
    blurb: 'Order lunch in Malay. Count change. Read the price board.',
    skills: ['salam','makanan','nombor','money','add','vocab']
  },
  {
    id: 'mooncake-festival', label: 'Festivals & Light', emoji: '🏮', threadId: 'stories',
    blurb: 'Lantern festivals, Hari Raya, Deepavali, Christmas — how families light up the year.',
    skills: ['warna','keluarga','sight','comprehension','earth']
  },
  {
    id: 'weather-watch', label: 'Weather Watcher', emoji: '🌦️', threadId: 'garden',
    blurb: 'Track Singapore weather. Hot? Rainy? Plot it on a graph.',
    skills: ['earth','pgraph','count','hari','warna']
  },
  {
    id: 'body-detective', label: 'Body Detective', emoji: '🩺', threadId: 'garden',
    blurb: 'Name body parts in two languages. Spot the bones and the heart.',
    skills: ['body','badan','sight','vocab','count']
  },
  {
    id: 'magnet-mystery', label: 'Magnet Mystery', emoji: '🧲', threadId: 'robot',
    blurb: 'Test which things a magnet pulls. Why? Materials!',
    skills: ['forces','material','count','grammar']
  },
  {
    id: 'family-tree', label: 'Family Tree', emoji: '🌳', threadId: 'stories',
    blurb: 'Draw your family tree. Name each person in Malay and English.',
    skills: ['keluarga','vocab','grammar','count','sentence']
  }
];

// Edge types used for visualisation.
//   "belongs-to"  — skill in a world
//   "depends-on"  — skill prerequisite (within a world)
//   "phenomenon"  — phenomenon to skill (cross-world tissue)
function buildMegaEdges() {
  var edges = [];

  // World ↔ skill (belongs-to)
  function addWorld(world, tree) {
    if (typeof tree === 'undefined' || tree === null) return;
    Object.keys(tree).forEach(function(skillId) {
      edges.push({ from: world, to: skillId, type: 'belongs-to' });
      var deps = tree[skillId].deps || [];
      deps.forEach(function(depId) {
        edges.push({ from: depId, to: skillId, type: 'depends-on' });
      });
    });
  }
  addWorld('math',  typeof MATH_TREE  !== 'undefined' ? MATH_TREE  : null);
  addWorld('word',  typeof WORD_TREE  !== 'undefined' ? WORD_TREE  : null);
  addWorld('stem',  typeof STEM_TREE  !== 'undefined' ? STEM_TREE  : null);
  addWorld('malay', typeof MALAY_TREE !== 'undefined' ? MALAY_TREE : null);

  // Phenomenon ↔ skills (cross-world)
  MEGA_PHENOMENA.forEach(function(p) {
    p.skills.forEach(function(skillId) {
      edges.push({ from: p.id, to: skillId, type: 'phenomenon' });
    });
  });

  return edges;
}

function getMegaNodes() {
  var nodes = [];

  MEGA_WORLDS.forEach(function(w) {
    nodes.push({ id: w.id, kind: 'world', label: w.label, emoji: w.emoji, colour: w.colour, desc: w.desc });
  });

  function pushSkills(tree, worldId) {
    if (typeof tree === 'undefined' || tree === null) return;
    Object.keys(tree).forEach(function(skillId) {
      var s = tree[skillId];
      var skillState = (typeof state !== 'undefined' && state.skills && state.skills[skillId]) || {};
      nodes.push({
        id:      skillId,
        kind:    'skill',
        label:   s.name,
        emoji:   s.icon,
        world:   worldId,
        grade:   s.grade,
        mastery: skillState.mastery || 0,
        attempts: skillState.totalAttempts || 0,
        desc:    s.desc || ''
      });
    });
  }
  pushSkills(typeof MATH_TREE  !== 'undefined' ? MATH_TREE  : null, 'math');
  pushSkills(typeof WORD_TREE  !== 'undefined' ? WORD_TREE  : null, 'word');
  pushSkills(typeof STEM_TREE  !== 'undefined' ? STEM_TREE  : null, 'stem');
  pushSkills(typeof MALAY_TREE !== 'undefined' ? MALAY_TREE : null, 'malay');

  MEGA_PHENOMENA.forEach(function(p) {
    var unlocked = (typeof state !== 'undefined' && state.threads && state.threads[p.threadId]) ? !!state.threads[p.threadId].unlocked : false;
    nodes.push({
      id:       p.id,
      kind:     'phenomenon',
      label:    p.label,
      emoji:    p.emoji,
      desc:     p.blurb,
      threadId: p.threadId,
      unlocked: unlocked
    });
  });

  return nodes;
}

// Map skillId -> [phenomenon ids]
function skillToPhenomena(skillId) {
  return MEGA_PHENOMENA.filter(function(p) {
    return p.skills.indexOf(skillId) !== -1;
  });
}

// Resolve a skillId to its worldType
function getSkillWorld(skillId) {
  if (typeof MATH_TREE  !== 'undefined' && MATH_TREE[skillId])  return 'math';
  if (typeof WORD_TREE  !== 'undefined' && WORD_TREE[skillId])  return 'word';
  if (typeof STEM_TREE  !== 'undefined' && STEM_TREE[skillId])  return 'stem';
  if (typeof MALAY_TREE !== 'undefined' && MALAY_TREE[skillId]) return 'malay';
  return null;
}

function getWorldColour(worldId) {
  var w = MEGA_WORLDS.find(function(x) { return x.id === worldId; });
  return w ? w.colour : '#b57bff';
}

// Phenomenon unlock: needs at least one engaged skill from at least two worlds
function getPhenomenonUnlock(phenomenonId) {
  var p = MEGA_PHENOMENA.find(function(x) { return x.id === phenomenonId; });
  if (!p) return { unlocked: false, progress: 0, required: 0, worldsTouched: [] };

  var touched = {};
  var anyEngaged = 0;
  p.skills.forEach(function(skillId) {
    var w = getSkillWorld(skillId);
    var sk = (typeof state !== 'undefined' && state.skills && state.skills[skillId]) || {};
    if ((sk.totalAttempts || 0) > 0) {
      anyEngaged++;
      if (w) touched[w] = true;
    }
  });
  var worldsTouched = Object.keys(touched);
  return {
    unlocked: worldsTouched.length >= 2,
    progress: anyEngaged,
    required: Math.min(2, p.skills.length),
    worldsTouched: worldsTouched
  };
}
