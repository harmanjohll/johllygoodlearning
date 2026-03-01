// ============================================================
//  SPACED REVIEW — Tracks when skills are due for review
//  Multi-factor mastery computation
// ============================================================

// Review intervals in days: 1, 3, 7, 14, 30
var REVIEW_INTERVALS = [1, 3, 7, 14, 30];

// Mark that a skill was actively practised (lesson, explore, or quiz)
function recordSkillActivity(skillId, activityType) {
  var skill = getSkillState(skillId);
  if (!skill.activity) skill.activity = {};
  skill.activity[activityType] = Date.now();
  skill.activity.lastAny = Date.now();

  // Track visit count
  if (!skill.activity.visits) skill.activity.visits = 0;
  skill.activity.visits++;

  saveState();
}

// Check if a skill is due for review
function isSkillDueForReview(skillId) {
  var skill = getSkillState(skillId);
  if (!skill.activity || !skill.activity.lastAny) return false;
  if (skill.totalAttempts === 0) return false; // Never quizzed

  var daysSince = (Date.now() - skill.activity.lastAny) / (1000 * 60 * 60 * 24);

  // Determine review interval based on mastery
  var intervalIdx;
  if (skill.mastery >= 80) intervalIdx = 4;      // 30 days
  else if (skill.mastery >= 60) intervalIdx = 3;  // 14 days
  else if (skill.mastery >= 40) intervalIdx = 2;  // 7 days
  else if (skill.mastery >= 20) intervalIdx = 1;  // 3 days
  else intervalIdx = 0;                            // 1 day

  return daysSince >= REVIEW_INTERVALS[intervalIdx];
}

// Get all skills due for review across all trees
function getSkillsDueForReview() {
  var due = [];
  var allTrees = {};
  if (typeof MATH_TREE !== 'undefined') Object.assign(allTrees, MATH_TREE);
  if (typeof WORD_TREE !== 'undefined') Object.assign(allTrees, WORD_TREE);
  if (typeof STEM_TREE !== 'undefined') Object.assign(allTrees, STEM_TREE);

  for (var id in allTrees) {
    if (isSkillDueForReview(id)) {
      due.push({ id: id, skill: allTrees[id] });
    }
  }
  return due;
}

// Compute multi-factor mastery (replaces the simple accuracy-based mastery)
// Factors: lesson viewed (20%), exploration done (30%), quiz accuracy (50%)
function computeMultiFactorMastery(skillId) {
  var skill = getSkillState(skillId);
  var activity = skill.activity || {};

  // Factor 1: Lesson viewed (0 or 1) — 20%
  var lessonScore = 0;
  if (skill.lessonViewed && skill.lessonViewed[skillId]) {
    lessonScore = 1;
  }

  // Factor 2: Exploration done (0 or 1) — 30%
  var exploreScore = 0;
  if (activity.explore) {
    exploreScore = 1;
  }

  // Factor 3: Quiz accuracy — 50%
  var quizScore = 0;
  if (skill.totalAttempts > 0) {
    var recent = skill.recentResults || [];
    var recentAcc = recent.length > 0
      ? recent.filter(function(r) { return r.correct; }).length / recent.length
      : 0;
    var totalAcc = skill.totalCorrect / skill.totalAttempts;
    // Blend recent and total, weighting recent more
    quizScore = recentAcc * 0.7 + totalAcc * 0.3;
  }

  // Weighted sum
  var mastery = Math.min(100, Math.round(
    lessonScore * 20 + exploreScore * 30 + quizScore * 50
  ));

  return mastery;
}

// Get a 7-day streak calendar (like Lab's streak dots)
function getStreakCalendar() {
  var calendar = [];
  var today = new Date();
  today.setHours(0, 0, 0, 0);

  for (var i = 6; i >= 0; i--) {
    var d = new Date(today);
    d.setDate(d.getDate() - i);
    var dateStr = d.toDateString();

    // Check if any activity happened on this day
    var active = false;
    if (state.skills) {
      for (var sid in state.skills) {
        var s = state.skills[sid];
        if (s.activity && s.activity.lastAny) {
          var actDate = new Date(s.activity.lastAny);
          actDate.setHours(0, 0, 0, 0);
          if (actDate.getTime() === d.getTime()) {
            active = true;
            break;
          }
        }
      }
    }

    // Also check if lastVisit matches
    if (state.lastVisit === dateStr) active = true;

    var dayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    calendar.push({
      date: dateStr,
      dayLabel: dayNames[d.getDay()],
      active: active,
      isToday: i === 0
    });
  }

  return calendar;
}

// Render streak calendar as HTML
function renderStreakCalendar() {
  var cal = getStreakCalendar();
  var activeDays = cal.filter(function(d) { return d.active; }).length;

  var html = '<div class="streak-calendar">';
  html += '<div class="streak-cal-label">This Week</div>';
  html += '<div class="streak-cal-dots">';
  cal.forEach(function(day) {
    var cls = 'streak-cal-dot';
    if (day.active) cls += ' active';
    if (day.isToday) cls += ' today';
    html += '<div class="' + cls + '">';
    html += '<div class="streak-cal-day">' + day.dayLabel + '</div>';
    html += '<div class="streak-cal-circle"></div>';
    html += '</div>';
  });
  html += '</div>';
  html += '<div class="streak-cal-count">' + activeDays + '/7 days active</div>';
  html += '</div>';

  return html;
}
