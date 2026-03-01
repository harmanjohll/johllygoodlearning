// ============================================================
//  STATE — State management, localStorage, v1 migration
// ============================================================

const Store = {
  _mem: {},
  async get(key) {
    try {
      if (window.storage) {
        const r = await window.storage.get(key);
        return r ? JSON.parse(r.value) : null;
      }
    } catch(e) {}
    try {
      const v = localStorage.getItem('anas_' + key);
      return v ? JSON.parse(v) : null;
    } catch(e) {}
    return this._mem[key] || null;
  },
  async set(key, value) {
    this._mem[key] = value;
    try {
      if (window.storage) {
        await window.storage.set(key, JSON.stringify(value));
        return;
      }
    } catch(e) {}
    try {
      localStorage.setItem('anas_' + key, JSON.stringify(value));
    } catch(e) {}
  }
};

// Default state structure (v2)
let state = {
  version: 2,
  name: 'Anastasia',
  tokens: 0,
  streak: 0,
  bestStreak: 0,
  totalCorrect: 0,
  totalAttempts: 0,
  sessionsCompleted: 0,
  level: 1,  // 1=Sprout, 2=Seedling, 3=Bloom, 4=Star, 5=Supernova, 6=Galaxy
  garden: [],       // [{type, skill, emoji, date, golden?}]
  dailyQuest: { date: '', completed: 0, target: 5, claimed: false },
  skills: {},
  lastVisit: '',
  stories: [],
  achievements: [],
  wotdHistory: [],  // dates of claimed WotDs
  escapeRooms: {},  // { roomId: { completed, bestTime, attempts } }
  starTrials: {},   // { worldType: { completed, bestScore } }
  visitHistory: [], // date strings for visit streak tracking
  questHistory: [], // date strings for quest completion streak
  dynamicQuest: null,  // current daily quest state
  weeklyQuest: null,   // current weekly quest state
  lumiStory: { chapter: 0, shownChapters: [] },
  settings: { language: 'en' }
};

const LEVEL_NAMES = ['', 'Sprout \uD83C\uDF31', 'Seedling \uD83C\uDF3F', 'Bloom \uD83C\uDF38', 'Star \u2B50', 'Supernova \uD83D\uDCAB', 'Galaxy \uD83C\uDF0C'];
const LEVEL_THRESHOLDS = [0, 0, 50, 150, 400, 1000, 2500];

// === V1 → V2 MIGRATION ===
const V1_TO_V2_SKILL_MAP = {
  'counting': 'count',
  'number-bonds': 'nbond',
  'addition': 'add',
  'subtraction': 'sub',
  'comparing': 'cmp',
  'patterns': 'pat',
  'word-problems': 'wp1',
  'shapes': 'shp',
  'phonics': 'phon',
  'sight-words': 'sight',
  'spelling': 'spell',
  'sentence-building': 'sent',
  'vocabulary': 'vocab',
  'story-garden': 'story'
};

function migrateFromV1(oldState) {
  const migrated = {
    version: 2,
    name: oldState.name || 'Anastasia',
    tokens: oldState.tokens || 0,
    streak: oldState.streak || 0,
    bestStreak: oldState.bestStreak || 0,
    totalCorrect: oldState.totalCorrect || 0,
    totalAttempts: oldState.totalAttempts || 0,
    sessionsCompleted: oldState.sessionsCompleted || 0,
    level: oldState.level || 1,
    garden: [],
    dailyQuest: oldState.dailyQuest || { date: '', completed: 0, target: 5, claimed: false },
    skills: {},
    lastVisit: oldState.lastVisit || '',
    stories: oldState.stories || [],
    achievements: oldState.achievements || [],
    wotdHistory: [],
    escapeRooms: {},
    starTrials: {},
    settings: { language: 'en' }
  };

  // Migrate garden entries
  if (Array.isArray(oldState.garden)) {
    migrated.garden = oldState.garden.map(g => ({
      type: g.type || 'flower',
      skill: V1_TO_V2_SKILL_MAP[g.skill] || g.skill,
      emoji: g.emoji,
      date: g.date
    }));
  }

  // Migrate per-skill data
  if (oldState.skills) {
    for (const [oldId, skillData] of Object.entries(oldState.skills)) {
      const newId = V1_TO_V2_SKILL_MAP[oldId] || oldId;
      migrated.skills[newId] = {
        level: skillData.level || 0,
        recentResults: skillData.recentResults || [],
        totalCorrect: skillData.totalCorrect || 0,
        totalAttempts: skillData.totalAttempts || 0,
        streak: skillData.streak || 0,
        bestStreak: skillData.bestStreak || 0,
        mastery: skillData.mastery || 0
      };
    }
  }

  return migrated;
}

// === SKILL STATE ===
function getSkillState(skillId) {
  if (!state.skills[skillId]) {
    state.skills[skillId] = {
      level: 0,
      recentResults: [],
      totalCorrect: 0,
      totalAttempts: 0,
      streak: 0,
      bestStreak: 0,
      mastery: 0,
      lessonViewed: {},
      flashcardProgress: {},
      activity: {}
    };
  }
  // Ensure new fields on existing skills
  var s = state.skills[skillId];
  if (!s.lessonViewed) s.lessonViewed = {};
  if (!s.flashcardProgress) s.flashcardProgress = {};
  if (!s.activity) s.activity = {};
  return s;
}

// === PERSISTENCE ===
async function saveState() {
  await Store.set('gameState', state);
}

async function loadState() {
  const saved = await Store.get('gameState');
  if (saved) {
    // Check if migration needed (v1 has no version field)
    if (!saved.version || saved.version < 2) {
      state = migrateFromV1(saved);
      await saveState();
    } else {
      state = { ...state, ...saved };
    }
    // Ensure new v2 properties exist on loaded state
    if (!state.stories) state.stories = [];
    if (!state.achievements) state.achievements = [];
    if (!state.dailyQuest) state.dailyQuest = { date: '', completed: 0, target: 5, claimed: false };
    if (!state.wotdHistory) state.wotdHistory = [];
    if (!state.escapeRooms) state.escapeRooms = {};
    if (!state.starTrials) state.starTrials = {};
    if (!state.visitHistory) state.visitHistory = [];
    if (!state.questHistory) state.questHistory = [];
    if (!state.dynamicQuest) state.dynamicQuest = null;
    if (!state.weeklyQuest) state.weeklyQuest = null;
    if (!state.lumiStory) state.lumiStory = { chapter: 0, shownChapters: [] };
    if (!state.settings) state.settings = { language: 'en' };
    state.version = 2;
  }
}
