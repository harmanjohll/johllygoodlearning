// ============================================================
//  ACHIEVEMENTS — Badge system with unlock logic & toast UI
// ============================================================

// Achievement definitions grouped by category
var ACHIEVEMENTS = [
  // === CONSISTENCY ===
  { id: 'streak3',    cat: 'consistency', icon: '\uD83D\uDD25', name: 'Warming Up',       desc: 'Get 3 correct in a row',         secret: false },
  { id: 'streak10',   cat: 'consistency', icon: '\uD83D\uDD25', name: 'On Fire',           desc: 'Get 10 correct in a row',        secret: false },
  { id: 'streak25',   cat: 'consistency', icon: '\u2604\uFE0F', name: 'Unstoppable',       desc: 'Get 25 correct in a row',        secret: false },
  { id: 'day3',       cat: 'consistency', icon: '\uD83D\uDCC5', name: '3-Day Learner',     desc: 'Visit 3 days in a row',          secret: false },
  { id: 'day7',       cat: 'consistency', icon: '\uD83D\uDCC5', name: 'Week Warrior',      desc: 'Visit 7 days in a row',          secret: false },
  { id: 'day14',      cat: 'consistency', icon: '\uD83C\uDFC6', name: 'Fortnight Champion', desc: 'Visit 14 days in a row',        secret: false },
  { id: 'day30',      cat: 'consistency', icon: '\uD83D\uDC8E', name: 'Monthly Legend',    desc: 'Visit 30 days in a row',         secret: false },
  { id: 'sessions5',  cat: 'consistency', icon: '\uD83C\uDFAF', name: 'Getting Started',   desc: 'Complete 5 quiz sessions',       secret: false },
  { id: 'sessions25', cat: 'consistency', icon: '\uD83C\uDFAF', name: 'Quiz Regular',      desc: 'Complete 25 quiz sessions',      secret: false },
  { id: 'sessions100',cat: 'consistency', icon: '\uD83C\uDFAF', name: 'Quiz Master',       desc: 'Complete 100 quiz sessions',     secret: false },

  // === MASTERY ===
  { id: 'first80',    cat: 'mastery', icon: '\u2B50',           name: 'First Star',        desc: 'Get any skill to 80% mastery',   secret: false },
  { id: 'first100',   cat: 'mastery', icon: '\uD83C\uDF1F',    name: 'Perfection',        desc: 'Get any skill to 100% mastery',  secret: false },
  { id: 'master5',    cat: 'mastery', icon: '\uD83C\uDF1F',    name: 'Five Stars',        desc: 'Master 5 skills (80%+)',         secret: false },
  { id: 'master10',   cat: 'mastery', icon: '\uD83D\uDCAB',    name: 'Ten Star Galaxy',   desc: 'Master 10 skills (80%+)',        secret: false },
  { id: 'levelUp',    cat: 'mastery', icon: '\uD83C\uDF31',    name: 'Level Up!',         desc: 'Reach the Pictorial CPA level',  secret: false },
  { id: 'abstract',   cat: 'mastery', icon: '\uD83E\uDDE0',    name: 'Abstract Thinker',  desc: 'Reach Abstract level in any skill', secret: false },
  { id: 'challenge',  cat: 'mastery', icon: '\uD83D\uDE80',    name: 'Challenge Accepted', desc: 'Reach Challenge level in any skill', secret: false },
  { id: 'perfect8',   cat: 'mastery', icon: '\uD83D\uDCAF',    name: 'Perfect Quiz',      desc: 'Score 8/8 on any quiz',          secret: false },

  // === EXPLORER ===
  { id: 'tryMath',    cat: 'explorer', icon: '\uD83D\uDD22',   name: 'Number Explorer',   desc: 'Try a skill in Number World',    secret: false },
  { id: 'tryWord',    cat: 'explorer', icon: '\uD83D\uDCD6',   name: 'Word Explorer',     desc: 'Try a skill in Word World',      secret: false },
  { id: 'tryStem',    cat: 'explorer', icon: '\uD83D\uDD2C',   name: 'STEM Explorer',     desc: 'Try a skill in STEM World',      secret: false },
  { id: 'allWorlds',  cat: 'explorer', icon: '\uD83C\uDF0D',   name: 'World Traveller',   desc: 'Try skills in all 3 worlds',     secret: false },
  { id: 'try10',      cat: 'explorer', icon: '\uD83D\uDDFA\uFE0F', name: 'Curious Mind',  desc: 'Try 10 different skills',        secret: false },
  { id: 'lesson5',    cat: 'explorer', icon: '\uD83D\uDCDA',   name: 'Lesson Lover',      desc: 'Complete 5 lessons',             secret: false },
  { id: 'lesson15',   cat: 'explorer', icon: '\uD83D\uDCDA',   name: 'Knowledge Seeker',  desc: 'Complete 15 lessons',            secret: false },
  { id: 'flash5',     cat: 'explorer', icon: '\uD83C\uDCCF',   name: 'Card Flipper',      desc: 'Complete 5 flashcard sessions',  secret: false },

  // === COLLECTOR ===
  { id: 'flower5',    cat: 'collector', icon: '\uD83C\uDF38',   name: 'Budding Garden',    desc: 'Grow 5 flowers in your garden',  secret: false },
  { id: 'flower15',   cat: 'collector', icon: '\uD83C\uDF3A',   name: 'Blooming Garden',   desc: 'Grow 15 flowers in your garden', secret: false },
  { id: 'flower30',   cat: 'collector', icon: '\uD83C\uDF3B',   name: 'Flower Paradise',   desc: 'Grow 30 flowers in your garden', secret: false },
  { id: 'tokens100',  cat: 'collector', icon: '\u2B50',         name: 'Star Saver',        desc: 'Earn 100 stars',                 secret: false },
  { id: 'tokens500',  cat: 'collector', icon: '\u2B50',         name: 'Star Hoarder',      desc: 'Earn 500 stars',                 secret: false },
  { id: 'tokens2500', cat: 'collector', icon: '\uD83C\uDF0C',   name: 'Galaxy of Stars',   desc: 'Earn 2500 stars',                secret: false },
  { id: 'wotd7',      cat: 'collector', icon: '\uD83D\uDCD6',   name: 'Word Collector',    desc: 'Claim 7 Words of the Day',       secret: false },
  { id: 'wotd30',     cat: 'collector', icon: '\uD83D\uDCD6',   name: 'Dictionary Builder', desc: 'Claim 30 Words of the Day',     secret: false },

  // === CHALLENGE ===
  { id: 'escape1',    cat: 'challenge', icon: '\uD83D\uDD13',   name: 'First Escape',      desc: 'Complete an escape room',        secret: false },
  { id: 'escape3',    cat: 'challenge', icon: '\uD83D\uDD13',   name: 'Escape Artist',     desc: 'Complete 3 escape rooms',        secret: false },
  { id: 'escapeAll',  cat: 'challenge', icon: '\uD83D\uDD13',   name: 'Escape Legend',     desc: 'Complete all escape rooms',      secret: false },
  { id: 'trial1',     cat: 'challenge', icon: '\u2B50',         name: 'Trial Taker',       desc: 'Complete a Star Trial',          secret: false },
  { id: 'trialAce',   cat: 'challenge', icon: '\uD83C\uDFC6',   name: 'Trial Ace',         desc: 'Score 100% on any Star Trial',   secret: false },
  { id: 'quest7',     cat: 'challenge', icon: '\uD83D\uDCDC',   name: 'Quest Streak',      desc: 'Complete daily quests 7 days running', secret: false },

  // === SECRET ===
  { id: 'lumiTap',    cat: 'secret', icon: '\u2728',            name: 'Lumi\'s Best Friend', desc: 'Tap Lumi 10 times',           secret: true },
  { id: 'midnight',   cat: 'secret', icon: '\uD83C\uDF19',     name: 'Night Owl',          desc: 'Study after 9 PM',              secret: true },
  { id: 'earlybird',  cat: 'secret', icon: '\uD83C\uDF05',     name: 'Early Bird',         desc: 'Study before 7 AM',             secret: true },
  { id: 'speedrun',   cat: 'secret', icon: '\u26A1',            name: 'Speed Demon',        desc: 'Finish a quiz in under 30 seconds', secret: true },
  { id: 'comeback',   cat: 'secret', icon: '\uD83D\uDCAA',     name: 'Comeback Kid',       desc: 'Get the last 5 right after getting the first 3 wrong', secret: true }
];

var ACHIEVEMENT_CATEGORIES = {
  consistency: { label: 'Consistency', icon: '\uD83D\uDD25', color: '#ff7b7b' },
  mastery:     { label: 'Mastery',     icon: '\u2B50',       color: '#ffd700' },
  explorer:    { label: 'Explorer',    icon: '\uD83C\uDF0D', color: '#7bb3ff' },
  collector:   { label: 'Collector',   icon: '\uD83C\uDF38', color: '#ff7bdb' },
  challenge:   { label: 'Challenge',   icon: '\uD83C\uDFC6', color: '#7bffb5' },
  secret:      { label: 'Secret',      icon: '\u2728',       color: '#b57bff' }
};

// Toast queue
var _achievementToastQueue = [];
var _achievementToastShowing = false;

// Check & unlock an achievement (idempotent)
function unlockAchievement(achievementId) {
  if (!state.achievements) state.achievements = [];
  if (state.achievements.indexOf(achievementId) !== -1) return false; // Already earned

  var def = ACHIEVEMENTS.find(function(a) { return a.id === achievementId; });
  if (!def) return false;

  state.achievements.push(achievementId);
  state.tokens += 10; // Bonus for every achievement
  saveState();

  // Queue toast
  _achievementToastQueue.push(def);
  if (!_achievementToastShowing) showNextAchievementToast();

  if (typeof playSound === 'function') playSound('unlock');
  return true;
}

function showNextAchievementToast() {
  if (_achievementToastQueue.length === 0) {
    _achievementToastShowing = false;
    return;
  }
  _achievementToastShowing = true;
  var def = _achievementToastQueue.shift();

  var toast = document.getElementById('achievement-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'achievement-toast';
    toast.className = 'achievement-toast';
    document.body.appendChild(toast);
  }

  toast.innerHTML =
    '<div class="achievement-toast-icon">' + def.icon + '</div>' +
    '<div class="achievement-toast-body">' +
      '<div class="achievement-toast-label">Achievement Unlocked!</div>' +
      '<div class="achievement-toast-name">' + def.name + '</div>' +
      '<div class="achievement-toast-desc">' + def.desc + ' (+10 \u2B50)</div>' +
    '</div>';

  toast.classList.remove('hide');
  toast.classList.add('show');

  if (typeof spawnParticles === 'function') {
    spawnParticles(window.innerWidth / 2, 70, 8, def.icon);
  }

  setTimeout(function() {
    toast.classList.remove('show');
    toast.classList.add('hide');
    setTimeout(function() { showNextAchievementToast(); }, 400);
  }, 3000);
}

// === ACHIEVEMENT CHECKERS ===
// Called after various events; each checks relevant conditions

function checkAchievementsAfterAnswer() {
  var s = state;

  // Streak achievements
  if (s.streak >= 3)  unlockAchievement('streak3');
  if (s.streak >= 10) unlockAchievement('streak10');
  if (s.streak >= 25) unlockAchievement('streak25');

  // Token milestones
  if (s.tokens >= 100)  unlockAchievement('tokens100');
  if (s.tokens >= 500)  unlockAchievement('tokens500');
  if (s.tokens >= 2500) unlockAchievement('tokens2500');

  // Time-based secrets
  var hour = new Date().getHours();
  if (hour >= 21 || hour < 5) unlockAchievement('midnight');
  if (hour >= 5 && hour < 7) unlockAchievement('earlybird');
}

function checkAchievementsAfterQuiz(results, skillId, worldType) {
  var correct = results.filter(function(r) { return r; }).length;
  var total = results.length;
  var pct = total > 0 ? Math.round(correct / total * 100) : 0;

  // Perfect quiz
  if (correct === total && total >= 8) unlockAchievement('perfect8');

  // Session count
  if (state.sessionsCompleted >= 5)   unlockAchievement('sessions5');
  if (state.sessionsCompleted >= 25)  unlockAchievement('sessions25');
  if (state.sessionsCompleted >= 100) unlockAchievement('sessions100');

  // World exploration
  if (worldType === 'math') unlockAchievement('tryMath');
  if (worldType === 'word') unlockAchievement('tryWord');
  if (worldType === 'stem') unlockAchievement('tryStem');

  // All worlds
  var a = state.achievements || [];
  if (a.indexOf('tryMath') !== -1 && a.indexOf('tryWord') !== -1 && a.indexOf('tryStem') !== -1) {
    unlockAchievement('allWorlds');
  }

  // Tried N different skills
  var triedSkills = {};
  if (state.skills) {
    for (var sid in state.skills) {
      if (state.skills[sid].totalAttempts > 0) triedSkills[sid] = true;
    }
  }
  if (Object.keys(triedSkills).length >= 10) unlockAchievement('try10');

  // Speedrun (quiz under 30 seconds) — checked via currentGame.startTime if available
  if (typeof currentGame !== 'undefined' && currentGame._startTime) {
    var elapsed = (Date.now() - currentGame._startTime) / 1000;
    if (elapsed < 30 && correct >= 6) unlockAchievement('speedrun');
  }

  // Comeback kid: first 3 wrong, last 5 right
  if (results.length >= 8) {
    var first3 = results.slice(0, 3).every(function(r) { return !r; });
    var last5 = results.slice(-5).every(function(r) { return r; });
    if (first3 && last5) unlockAchievement('comeback');
  }
}

function checkAchievementsAfterMastery() {
  if (!state.skills) return;
  var masteredCount = 0;
  var hasAbstract = false;
  var hasChallenge = false;
  var has80 = false;
  var has100 = false;
  var hasPictorial = false;

  for (var sid in state.skills) {
    var sk = state.skills[sid];
    if (sk.mastery >= 80) { masteredCount++; has80 = true; }
    if (sk.mastery >= 100) has100 = true;
    if (sk.level >= 1) hasPictorial = true;
    if (sk.level >= 2) hasAbstract = true;
    if (sk.level >= 4) hasChallenge = true;
  }

  if (has80)            unlockAchievement('first80');
  if (has100)           unlockAchievement('first100');
  if (masteredCount >= 5)  unlockAchievement('master5');
  if (masteredCount >= 10) unlockAchievement('master10');
  if (hasPictorial)     unlockAchievement('levelUp');
  if (hasAbstract)      unlockAchievement('abstract');
  if (hasChallenge)     unlockAchievement('challenge');
}

function checkAchievementsAfterGarden() {
  var count = state.garden ? state.garden.length : 0;
  if (count >= 5)  unlockAchievement('flower5');
  if (count >= 15) unlockAchievement('flower15');
  if (count >= 30) unlockAchievement('flower30');
}

function checkAchievementsAfterLesson() {
  if (!state.skills) return;
  var lessonCount = 0;
  for (var sid in state.skills) {
    var sk = state.skills[sid];
    if (sk.lessonViewed) {
      for (var lid in sk.lessonViewed) { if (sk.lessonViewed[lid]) lessonCount++; }
    }
  }
  if (lessonCount >= 5)  unlockAchievement('lesson5');
  if (lessonCount >= 15) unlockAchievement('lesson15');
}

function checkAchievementsAfterFlashcards() {
  if (!state.skills) return;
  var fcSessions = 0;
  for (var sid in state.skills) {
    var sk = state.skills[sid];
    if (sk.flashcardProgress) {
      for (var cid in sk.flashcardProgress) {
        if (sk.flashcardProgress[cid] && sk.flashcardProgress[cid].correct > 0) fcSessions++;
      }
    }
  }
  if (fcSessions >= 5) unlockAchievement('flash5');
}

function checkAchievementsAfterEscape() {
  if (!state.escapeRooms) return;
  var completed = Object.keys(state.escapeRooms).length;
  if (completed >= 1) unlockAchievement('escape1');
  if (completed >= 3) unlockAchievement('escape3');
  if (completed >= 6) unlockAchievement('escapeAll');
}

function checkAchievementsAfterTrial(pct) {
  unlockAchievement('trial1');
  if (pct >= 100) unlockAchievement('trialAce');
}

function checkAchievementsAfterWotd() {
  var count = state.wotdHistory ? state.wotdHistory.length : 0;
  if (count >= 7)  unlockAchievement('wotd7');
  if (count >= 30) unlockAchievement('wotd30');
}

function checkAchievementsAfterDailyQuest() {
  // Quest streak — check consecutive days of quest completion
  if (!state.questHistory) state.questHistory = [];
  var consecutive = 0;
  var today = new Date();
  today.setHours(0, 0, 0, 0);
  for (var i = 0; i < 30; i++) {
    var d = new Date(today);
    d.setDate(d.getDate() - i);
    var ds = d.toDateString();
    if (state.questHistory.indexOf(ds) !== -1) {
      consecutive++;
    } else {
      break;
    }
  }
  if (consecutive >= 7) unlockAchievement('quest7');
}

// Lumi tap counter for secret achievement
var _lumiTapCount = 0;
function checkLumiTapAchievement() {
  _lumiTapCount++;
  if (_lumiTapCount >= 10) unlockAchievement('lumiTap');
}

// Visit streak checker (called on init)
function checkVisitStreakAchievements() {
  if (!state.visitHistory) state.visitHistory = [];
  var today = new Date();
  today.setHours(0, 0, 0, 0);
  var todayStr = today.toDateString();

  // Add today if not present
  if (state.visitHistory.indexOf(todayStr) === -1) {
    state.visitHistory.push(todayStr);
    // Keep last 60 entries
    if (state.visitHistory.length > 60) state.visitHistory = state.visitHistory.slice(-60);
    saveState();
  }

  // Count consecutive days ending today
  var consecutive = 0;
  for (var i = 0; i < 60; i++) {
    var d = new Date(today);
    d.setDate(d.getDate() - i);
    if (state.visitHistory.indexOf(d.toDateString()) !== -1) {
      consecutive++;
    } else {
      break;
    }
  }

  if (consecutive >= 3)  unlockAchievement('day3');
  if (consecutive >= 7)  unlockAchievement('day7');
  if (consecutive >= 14) unlockAchievement('day14');
  if (consecutive >= 30) unlockAchievement('day30');
}

// Get count of earned achievements
function getAchievementCount() {
  return state.achievements ? state.achievements.length : 0;
}

// Render achievements screen
function renderAchievementsScreen() {
  var container = document.getElementById('achievements-content');
  if (!container) return;

  var earned = state.achievements || [];
  var total = ACHIEVEMENTS.length;
  var earnedCount = earned.length;

  var html = '<div class="achievements-summary">';
  html += '<div class="achievements-count">' + earnedCount + ' / ' + total + '</div>';
  html += '<div class="achievements-bar"><div class="achievements-bar-fill" style="width:' + Math.round(earnedCount / total * 100) + '%"></div></div>';
  html += '</div>';

  // By category
  for (var catId in ACHIEVEMENT_CATEGORIES) {
    var cat = ACHIEVEMENT_CATEGORIES[catId];
    var catAchievements = ACHIEVEMENTS.filter(function(a) { return a.cat === catId; });

    html += '<div class="achievement-category">';
    html += '<div class="achievement-category-header" style="border-left:3px solid ' + cat.color + '">';
    html += cat.icon + ' ' + cat.label;
    html += '<span class="achievement-category-count">' +
      catAchievements.filter(function(a) { return earned.indexOf(a.id) !== -1; }).length +
      '/' + catAchievements.length + '</span>';
    html += '</div>';
    html += '<div class="achievement-grid">';

    catAchievements.forEach(function(ach) {
      var isEarned = earned.indexOf(ach.id) !== -1;
      var isSecret = ach.secret && !isEarned;

      html += '<div class="achievement-badge ' + (isEarned ? 'earned' : 'locked') + '">';
      html += '<div class="achievement-badge-icon">' + (isSecret ? '\uD83D\uDD12' : ach.icon) + '</div>';
      html += '<div class="achievement-badge-name">' + (isSecret ? '???' : ach.name) + '</div>';
      html += '<div class="achievement-badge-desc">' + (isSecret ? 'Keep exploring to discover!' : ach.desc) + '</div>';
      if (isEarned) html += '<div class="achievement-badge-check">\u2713</div>';
      html += '</div>';
    });

    html += '</div></div>';
  }

  container.innerHTML = html;
}
