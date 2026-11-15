// ============================================================
//  TOPBAR — Token/streak/level display and updates
// ============================================================

/** The level name without its emoji: "Sprout", "Seedling", ... */
function levelLabel(i) {
  return String(LEVEL_NAMES[i] || 'Sprout').replace(/[^A-Za-z ]/g, '').trim();
}

function updateUI() {
  document.getElementById('token-count').textContent = state.tokens;
  document.getElementById('streak-count').textContent = state.streak;
  const lvl = clamp(state.level, 1, LEVEL_NAMES.length - 1);
  document.getElementById('level-text').textContent = levelLabel(lvl);

  // Achievement count badge
  var achBadge = document.getElementById('achievement-badge-count');
  if (achBadge && typeof getAchievementCount === 'function') {
    achBadge.textContent = getAchievementCount();
  }

  // Check level up
  for (let i = LEVEL_THRESHOLDS.length - 1; i > 0; i--) {
    if (state.tokens >= LEVEL_THRESHOLDS[i] && state.level < i) {
      state.level = i;
      playSound('levelup');
      document.getElementById('level-text').textContent = levelLabel(i);
      spawnParticles(window.innerWidth / 2, 50, 12, '\u2728');
      if (typeof lumiReactTo === 'function') {
        lumiReactTo('levelUp');
      } else {
        lumiSay('Amazing! You reached ' + LEVEL_NAMES[i] + '!');
      }
      break;
    }
  }

  // Streak celebrations
  if (state.streak === 5 || state.streak === 10 || state.streak === 20) {
    playSound('streak');
    spawnParticles(window.innerWidth / 2, window.innerHeight / 3, 10, '\uD83D\uDD25');
  }

  // Streak for quest tracking
  if (typeof questRecordStreak === 'function') {
    questRecordStreak(state.streak);
  }
}
