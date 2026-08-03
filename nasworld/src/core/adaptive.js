// ============================================================
//  ADAPTIVE ENGINE — ZPD, skill tracking, difficulty, unlocks
// ============================================================

// CPA Level names
const CPA_LEVELS = ['Concrete', 'Pictorial', 'Abstract', 'Fluency', 'Challenge'];

function updateSkillState(skillId, correct, confidence) {
  const skill = getSkillState(skillId);
  skill.recentResults.push({ correct, confidence, timestamp: Date.now() });
  if (skill.recentResults.length > 10) skill.recentResults.shift();
  skill.totalAttempts++;

  if (correct) {
    skill.totalCorrect++;
    skill.streak++;
    if (skill.streak > skill.bestStreak) skill.bestStreak = skill.streak;
  } else {
    skill.streak = 0;
  }

  // Calculate accuracy over recent window (last 8)
  const recent = skill.recentResults.slice(-8);
  const accuracy = recent.length > 0 ? recent.filter(r => r.correct).length / recent.length : 0;

  // ZPD Adaptation — advance or scaffold
  if (recent.length >= 5) {
    if (accuracy >= 0.85 && skill.level < 4) {
      skill.level++;
      addGardenFlower(skillId);
    } else if (accuracy < 0.4 && skill.level > 0) {
      skill.level--;
    }
  }

  // Multi-factor mastery if spaced-review is loaded, else simple
  if (typeof computeMultiFactorMastery === 'function') {
    skill.mastery = computeMultiFactorMastery(skillId);
  } else {
    const totalAcc = skill.totalAttempts > 0 ? skill.totalCorrect / skill.totalAttempts : 0;
    skill.mastery = Math.min(100, Math.round(
      accuracy * 50 + totalAcc * 30 + Math.min(skill.level / 4, 1) * 20
    ));
  }

  return skill;
}

function getSkillDifficulty(skillId) {
  const skill = getSkillState(skillId);
  return {
    level: skill.level,
    isConcrete: skill.level === 0,
    isPictorial: skill.level === 1,
    isAbstract: skill.level >= 2,
    isFluency: skill.level === 3,
    isChallenge: skill.level === 4,
    numberRange: [
      [1, 10],    // concrete
      [1, 10],    // pictorial
      [1, 20],    // abstract
      [1, 50],    // fluency
      [1, 100]    // challenge
    ][skill.level] || [1, 10]
  };
}

// Check if a skill's dependencies are met (>=40% mastery on all deps)
function isSkillUnlocked(skillDef) {
  if (!skillDef.deps || skillDef.deps.length === 0) return true;
  return skillDef.deps.every(depId => {
    const dep = getSkillState(depId);
    return dep.mastery >= 40;
  });
}

// Get unlocked skills from a tree
function getUnlockedSkills(tree) {
  const result = { unlocked: [], locked: [] };
  for (const skill of Object.values(tree)) {
    if (isSkillUnlocked(skill)) {
      result.unlocked.push(skill);
    } else {
      result.locked.push(skill);
    }
  }
  return result;
}

// Calculate average mastery for a set of skill IDs
function calculateWorldProgress(skillIds) {
  if (skillIds.length === 0) return 0;
  const masteries = skillIds.map(id => getSkillState(id).mastery);
  return Math.round(masteries.reduce((a, b) => a + b, 0) / masteries.length);
}

// Suggest next skill based on ZPD (moderate mastery, not too easy/hard)
function getRecommendedSkill(tree) {
  const { unlocked } = getUnlockedSkills(tree);
  if (unlocked.length === 0) return null;

  // Prefer skills with 20-60% mastery (in the learning zone)
  const zpd = unlocked.filter(s => {
    const m = getSkillState(s.id).mastery;
    return m >= 20 && m <= 60;
  });
  if (zpd.length > 0) return pick(zpd);

  // Fallback: lowest mastery that's unlocked
  return unlocked.reduce((best, s) => {
    const m = getSkillState(s.id).mastery;
    const bestM = getSkillState(best.id).mastery;
    return m < bestM ? s : best;
  });
}

// Render activity cards for a skill tree (used by math, word, stem worlds)
function renderActivityCards(tree, containerId, worldType) {
  const container = document.getElementById(containerId);
  if (!container) return;

  // Group by grade if applicable
  const grades = {};
  for (const skill of Object.values(tree)) {
    const group = skill.grade || skill.group || skill.type || 'General';
    if (!grades[group]) grades[group] = [];
    grades[group].push(skill);
  }

  let html = '';
  for (const [grade, skills] of Object.entries(grades)) {
    html += `<div class="grade-section">`;
    html += `<div class="grade-label">${grade}</div>`;
    html += `<div class="activity-grid">`;

    for (const skill of skills) {
      const s = getSkillState(skill.id);
      const unlocked = isSkillUnlocked(skill);
      const stars = Array.from({ length: 5 }, (_, i) =>
        `<span class="mastery-star ${i < Math.ceil(s.mastery / 20) ? 'filled' : ''}">\u2B50</span>`
      ).join('');

      const lockText = unlocked ? '' :
        `<div class="activity-card-lock">Master ${skill.deps.join(' & ')} first</div>`;

      // Review-due badge
      let reviewBadge = '';
      if (unlocked && typeof isSkillDueForReview === 'function' && isSkillDueForReview(skill.id)) {
        reviewBadge = '<div class="review-due-badge">Review due</div>';
      }

      // Lesson-viewed indicator
      let learnBadge = '';
      if (unlocked && s.lessonViewed && s.lessonViewed[skill.id]) {
        learnBadge = '<span class="learn-done-dot" title="Lesson completed">📖</span>';
      }

      html += `<div class="activity-card ${unlocked ? '' : 'locked'}"
        onclick="${unlocked ? `openSkillView('${skill.id}','${worldType}')` : ''}"
        ${unlocked ? '' : 'title="Locked"'}>
        ${reviewBadge}
        <span class="activity-card-icon">${skill.icon}</span>
        <div class="activity-card-name">${skill.name} ${learnBadge}</div>
        <div class="activity-card-level">${unlocked ? `Level ${s.level + 1} \u00B7 ${CPA_LEVELS[s.level] || 'Concrete'}` : '\uD83D\uDD12 Locked'}</div>
        ${lockText}
        <div class="mastery-stars">${stars}</div>
      </div>`;
    }

    html += `</div></div>`;
  }

  container.innerHTML = html;
}
