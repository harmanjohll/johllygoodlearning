// ============================================================
//  DYNAMIC QUESTS — Varied daily + weekly challenges
// ============================================================

// Quest templates — each defines a type and how to check completion
var QUEST_TEMPLATES = [
  { id: 'do5',       type: 'daily', label: 'Complete 5 challenges',           icon: '\u26A1', target: 5,  check: 'quizzes' },
  { id: 'streak5',   type: 'daily', label: 'Get a 5-answer streak',           icon: '\uD83D\uDD25', target: 5,  check: 'streak' },
  { id: 'learn2',    type: 'daily', label: 'Complete 2 lessons',              icon: '\uD83D\uDCD6', target: 2,  check: 'lessons' },
  { id: 'flash3',    type: 'daily', label: 'Flip through 3 flashcard sets',   icon: '\uD83C\uDCCF', target: 3,  check: 'flashcards' },
  { id: 'review2',   type: 'daily', label: 'Review 2 skills due for review',  icon: '\uD83D\uDD14', target: 2,  check: 'reviews' },
  { id: 'math3',     type: 'daily', label: 'Answer 3 Number World questions', icon: '\uD83D\uDD22', target: 3,  check: 'mathQs' },
  { id: 'word3',     type: 'daily', label: 'Answer 3 Word World questions',   icon: '\uD83D\uDCDA', target: 3,  check: 'wordQs' },
  { id: 'stem3',     type: 'daily', label: 'Answer 3 STEM World questions',   icon: '\uD83D\uDD2C', target: 3,  check: 'stemQs' },
  { id: 'perfect1',  type: 'daily', label: 'Get a perfect score on any quiz', icon: '\uD83D\uDCAF', target: 1,  check: 'perfectQuiz' },
  { id: 'explore2',  type: 'daily', label: 'Try 2 different skills',          icon: '\uD83D\uDDFA\uFE0F', target: 2,  check: 'uniqueSkills' }
];

var WEEKLY_TEMPLATES = [
  { id: 'wk_master',  type: 'weekly', label: 'Master a new skill to 80%',           icon: '\uD83C\uDF1F', target: 1, check: 'newMastery',  reward: 50 },
  { id: 'wk_all3',    type: 'weekly', label: 'Play in all 3 worlds',                icon: '\uD83C\uDF0D', target: 3, check: 'worldsPlayed', reward: 40 },
  { id: 'wk_escape',  type: 'weekly', label: 'Complete an escape room',             icon: '\uD83D\uDD13', target: 1, check: 'escapesDone',  reward: 50 },
  { id: 'wk_streak7', type: 'weekly', label: 'Get a 7-answer streak',               icon: '\uD83D\uDD25', target: 7, check: 'bestStreak',   reward: 40 },
  { id: 'wk_15q',     type: 'weekly', label: 'Answer 15 questions correctly',        icon: '\u2705',       target: 15, check: 'weekCorrect', reward: 40 },
  { id: 'wk_learn5',  type: 'weekly', label: 'Complete 5 lessons',                   icon: '\uD83D\uDCDA', target: 5, check: 'weekLessons',  reward: 50 }
];

// Daily quest tracking counters (reset each day)
var questCounters = {
  quizzes: 0,
  lessons: 0,
  flashcards: 0,
  reviews: 0,
  mathQs: 0,
  wordQs: 0,
  stemQs: 0,
  perfectQuiz: 0,
  uniqueSkills: [],
  streak: 0
};

// Weekly quest tracking
var weeklyCounters = {
  newMastery: 0,
  worldsPlayed: [],
  escapesDone: 0,
  bestStreak: 0,
  weekCorrect: 0,
  weekLessons: 0
};

// Pick today's quest (seeded by date for consistency)
function getDailyQuest() {
  var today = new Date().toDateString();

  // If already generated today, return it
  if (state.dynamicQuest && state.dynamicQuest.date === today) {
    return state.dynamicQuest;
  }

  // Seed from date string for deterministic pick
  var seed = 0;
  for (var i = 0; i < today.length; i++) seed += today.charCodeAt(i);
  var idx = seed % QUEST_TEMPLATES.length;
  var template = QUEST_TEMPLATES[idx];

  state.dynamicQuest = {
    date: today,
    templateId: template.id,
    label: template.label,
    icon: template.icon,
    target: template.target,
    check: template.check,
    progress: 0,
    completed: false,
    claimed: false,
    reward: 20
  };

  saveState();
  return state.dynamicQuest;
}

// Pick this week's quest
function getWeeklyQuest() {
  var now = new Date();
  var weekStart = new Date(now);
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  weekStart.setHours(0, 0, 0, 0);
  var weekKey = weekStart.toDateString();

  if (state.weeklyQuest && state.weeklyQuest.weekKey === weekKey) {
    return state.weeklyQuest;
  }

  var seed = 0;
  for (var i = 0; i < weekKey.length; i++) seed += weekKey.charCodeAt(i);
  var idx = seed % WEEKLY_TEMPLATES.length;
  var template = WEEKLY_TEMPLATES[idx];

  state.weeklyQuest = {
    weekKey: weekKey,
    templateId: template.id,
    label: template.label,
    icon: template.icon,
    target: template.target,
    check: template.check,
    progress: 0,
    completed: false,
    claimed: false,
    reward: template.reward
  };

  saveState();
  return state.weeklyQuest;
}

// Increment quest counters (called from various hooks)
function questRecordQuiz(worldType) {
  questCounters.quizzes++;
  if (worldType === 'math') questCounters.mathQs++;
  if (worldType === 'word') questCounters.wordQs++;
  if (worldType === 'stem') questCounters.stemQs++;
  weeklyCounters.weekCorrect++;
  if (worldType && weeklyCounters.worldsPlayed.indexOf(worldType) === -1) {
    weeklyCounters.worldsPlayed.push(worldType);
  }
  updateQuestProgress();
}

function questRecordPerfect() {
  questCounters.perfectQuiz++;
  updateQuestProgress();
}

function questRecordLesson() {
  questCounters.lessons++;
  weeklyCounters.weekLessons++;
  updateQuestProgress();
}

function questRecordFlashcards() {
  questCounters.flashcards++;
  updateQuestProgress();
}

function questRecordReview() {
  questCounters.reviews++;
  updateQuestProgress();
}

function questRecordSkillPlayed(skillId) {
  if (questCounters.uniqueSkills.indexOf(skillId) === -1) {
    questCounters.uniqueSkills.push(skillId);
  }
  updateQuestProgress();
}

function questRecordStreak(streakVal) {
  questCounters.streak = Math.max(questCounters.streak, streakVal);
  weeklyCounters.bestStreak = Math.max(weeklyCounters.bestStreak, streakVal);
  updateQuestProgress();
}

function questRecordEscape() {
  weeklyCounters.escapesDone++;
  updateQuestProgress();
}

function questRecordNewMastery() {
  weeklyCounters.newMastery++;
  updateQuestProgress();
}

// Update quest progress from counters
function updateQuestProgress() {
  var dq = getDailyQuest();
  if (dq && !dq.completed) {
    var val = 0;
    switch (dq.check) {
      case 'quizzes':      val = questCounters.quizzes; break;
      case 'streak':       val = questCounters.streak; break;
      case 'lessons':      val = questCounters.lessons; break;
      case 'flashcards':   val = questCounters.flashcards; break;
      case 'reviews':      val = questCounters.reviews; break;
      case 'mathQs':       val = questCounters.mathQs; break;
      case 'wordQs':       val = questCounters.wordQs; break;
      case 'stemQs':       val = questCounters.stemQs; break;
      case 'perfectQuiz':  val = questCounters.perfectQuiz; break;
      case 'uniqueSkills': val = questCounters.uniqueSkills.length; break;
    }
    dq.progress = Math.min(val, dq.target);
    if (dq.progress >= dq.target) dq.completed = true;
    saveState();
  }

  var wq = getWeeklyQuest();
  if (wq && !wq.completed) {
    var wval = 0;
    switch (wq.check) {
      case 'newMastery':   wval = weeklyCounters.newMastery; break;
      case 'worldsPlayed': wval = weeklyCounters.worldsPlayed.length; break;
      case 'escapesDone':  wval = weeklyCounters.escapesDone; break;
      case 'bestStreak':   wval = weeklyCounters.bestStreak; break;
      case 'weekCorrect':  wval = weeklyCounters.weekCorrect; break;
      case 'weekLessons':  wval = weeklyCounters.weekLessons; break;
    }
    wq.progress = Math.min(wval, wq.target);
    if (wq.progress >= wq.target) wq.completed = true;
    saveState();
  }
}

// Claim daily quest reward
function claimDailyQuest() {
  var dq = getDailyQuest();
  if (!dq || !dq.completed || dq.claimed) return;
  dq.claimed = true;
  state.tokens += dq.reward;

  // Track quest completion history for achievements
  if (!state.questHistory) state.questHistory = [];
  var today = new Date().toDateString();
  if (state.questHistory.indexOf(today) === -1) {
    state.questHistory.push(today);
    if (state.questHistory.length > 60) state.questHistory = state.questHistory.slice(-60);
  }

  if (typeof playSound === 'function') playSound('levelup');
  if (typeof spawnParticles === 'function') {
    spawnParticles(window.innerWidth / 2, window.innerHeight / 2, 12, '\u2B50');
  }
  if (typeof lumiSay === 'function') {
    lumiSay('Quest complete! +' + dq.reward + ' stars! You\'re incredible!');
  }
  if (typeof checkAchievementsAfterDailyQuest === 'function') {
    checkAchievementsAfterDailyQuest();
  }
  saveState();
  if (typeof updateHomeUI === 'function') updateHomeUI();
}

// Claim weekly quest reward
function claimWeeklyQuest() {
  var wq = getWeeklyQuest();
  if (!wq || !wq.completed || wq.claimed) return;
  wq.claimed = true;
  state.tokens += wq.reward;

  if (typeof playSound === 'function') playSound('escape');
  if (typeof spawnParticles === 'function') {
    spawnParticles(window.innerWidth / 2, window.innerHeight / 2, 20, '\uD83C\uDF1F');
  }
  if (typeof lumiSay === 'function') {
    lumiSay('WEEKLY QUEST DONE! +' + wq.reward + ' stars! You\'re a superstar!');
  }
  saveState();
  if (typeof updateHomeUI === 'function') updateHomeUI();
}

// Render quest banners (called from home.js)
function renderDynamicQuestBanner() {
  var dq = getDailyQuest();
  var html = '';

  // Daily Quest
  html += '<div class="quest-banner dynamic-quest" onclick="' +
    (dq.completed && !dq.claimed ? 'claimDailyQuest()' : '') + '">';
  html += '<div class="quest-icon">' + dq.icon + '</div>';
  html += '<div class="quest-text">';
  html += '<div class="quest-title">' + (dq.completed && !dq.claimed ? '\uD83C\uDF89 Quest Complete!' : 'Daily Quest') + '</div>';
  html += '<div class="quest-desc">' + (dq.completed && !dq.claimed ? 'Tap to claim +' + dq.reward + ' stars!' : dq.label) + '</div>';
  html += '</div>';
  html += '<div class="quest-progress-ring">';
  html += '<span>' + dq.progress + '/' + dq.target + '</span>';
  if (dq.completed && dq.claimed) html += '<span class="quest-done-check">\u2713</span>';
  html += '</div>';
  html += '</div>';

  // Weekly Quest
  var wq = getWeeklyQuest();
  html += '<div class="quest-banner weekly-quest" onclick="' +
    (wq.completed && !wq.claimed ? 'claimWeeklyQuest()' : '') + '">';
  html += '<div class="quest-icon">\uD83C\uDFC6</div>';
  html += '<div class="quest-text">';
  html += '<div class="quest-title">' + (wq.completed && !wq.claimed ? '\uD83C\uDF89 Weekly Boss Done!' : 'Weekly Challenge') + '</div>';
  html += '<div class="quest-desc">' + (wq.completed && !wq.claimed ? 'Tap to claim +' + wq.reward + ' stars!' : wq.label) + '</div>';
  html += '</div>';
  html += '<div class="quest-progress-ring weekly">';
  html += '<span>' + wq.progress + '/' + wq.target + '</span>';
  if (wq.completed && wq.claimed) html += '<span class="quest-done-check">\u2713</span>';
  html += '</div>';
  html += '</div>';

  return html;
}
