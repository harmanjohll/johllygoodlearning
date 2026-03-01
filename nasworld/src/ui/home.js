// ============================================================
//  HOME — Home screen, Lumi companion, daily quest, WotD
// ============================================================

const LUMI_GREETINGS = [
  "Let's learn something awesome today!",
  "Your garden is waiting to grow!",
  "I believe in you, Anastasia!",
  "Every challenge makes you stronger!",
  "Ready for an adventure? Let's go!",
  "You're getting so smart! Keep it up!",
  "What shall we explore today?",
  "The stars are cheering for you!",
  "Today is going to be amazing!",
  "Let's make your brain sparkle!"
];

function lumiSpeak() {
  // Use upgraded Lumi tap system if available
  if (typeof lumiTapped === 'function') {
    lumiTapped();
    return;
  }
  lumiSay(pick(LUMI_GREETINGS));
  playSound('click');
}

function lumiSay(text) {
  const el = document.getElementById('lumi-speech');
  if (!el) return;
  el.style.animation = 'none';
  el.offsetHeight;
  el.style.animation = 'pop-in 0.5s ease-out';
  el.textContent = text;
}

function updateHomeUI() {
  updateUI();

  // World progress bars
  if (typeof MATH_TREE !== 'undefined') {
    const mathIds = Object.keys(MATH_TREE);
    const mathAvg = calculateWorldProgress(mathIds);
    document.getElementById('math-progress').style.width = mathAvg + '%';
  }
  if (typeof WORD_TREE !== 'undefined') {
    const wordIds = Object.keys(WORD_TREE);
    const wordAvg = calculateWorldProgress(wordIds);
    document.getElementById('word-progress').style.width = wordAvg + '%';
  }
  if (typeof STEM_TREE !== 'undefined') {
    const stemIds = Object.keys(STEM_TREE);
    const stemAvg = calculateWorldProgress(stemIds);
    document.getElementById('stem-progress').style.width = stemAvg + '%';
  }

  const gardenPct = Math.min(100, (state.garden.length / 50) * 100);
  document.getElementById('garden-progress').style.width = gardenPct + '%';

  // Dynamic quest banners
  var questArea = document.getElementById('dynamic-quest-area');
  if (questArea && typeof renderDynamicQuestBanner === 'function') {
    questArea.innerHTML = renderDynamicQuestBanner();
  }

  // Story progress
  var storyArea = document.getElementById('story-progress-area');
  if (storyArea && typeof renderStoryProgress === 'function') {
    storyArea.innerHTML = renderStoryProgress();
  }

  // Achievement showcase (latest 3)
  var achArea = document.getElementById('achievement-showcase');
  if (achArea && typeof ACHIEVEMENTS !== 'undefined') {
    var earned = state.achievements || [];
    if (earned.length > 0) {
      var recent = earned.slice(-3).reverse();
      var html = '<div class="achievement-showcase-row">';
      recent.forEach(function(id) {
        var def = ACHIEVEMENTS.find(function(a) { return a.id === id; });
        if (def) {
          html += '<div class="achievement-mini">' +
            '<span class="achievement-mini-icon">' + def.icon + '</span>' +
            '<span class="achievement-mini-name">' + def.name + '</span>' +
            '</div>';
        }
      });
      html += '<div class="achievement-mini see-all" onclick="showScreen(\'achievements\')">' +
        '<span class="achievement-mini-icon">\u2192</span>' +
        '<span class="achievement-mini-name">See all (' + earned.length + ')</span>' +
        '</div>';
      html += '</div>';
      achArea.innerHTML = html;
      achArea.classList.remove('hidden');
    } else {
      achArea.classList.add('hidden');
    }
  }

  // Streak calendar
  var streakEl = document.getElementById('streak-calendar-area');
  if (streakEl && typeof renderStreakCalendar === 'function') {
    streakEl.innerHTML = renderStreakCalendar();
  }

  // Review-due count
  if (typeof getSkillsDueForReview === 'function') {
    var due = getSkillsDueForReview();
    var reviewEl = document.getElementById('review-due-banner');
    if (reviewEl) {
      if (due.length > 0) {
        reviewEl.innerHTML = '<span class="review-banner-icon">\uD83D\uDD14</span> ' +
          due.length + ' skill' + (due.length > 1 ? 's' : '') + ' due for review!';
        reviewEl.classList.remove('hidden');
      } else {
        reviewEl.classList.add('hidden');
      }
    }
  }

  updateWotd();
  updateChallengesSection();
}

// === WORD OF THE DAY ===
function updateWotd() {
  const banner = document.getElementById('wotd-banner');
  if (!banner) return;

  const wotd = getWordOfTheDay();
  const today = new Date().toDateString();
  const alreadyClaimed = state.wotdHistory && state.wotdHistory.includes(today);

  document.getElementById('wotd-word').textContent = wotd.word;
  document.getElementById('wotd-def').textContent = wotd.def;

  if (alreadyClaimed) {
    document.getElementById('wotd-status').textContent = '\u2705 Learned!';
  } else {
    document.getElementById('wotd-status').textContent = '+3 \u2B50';
  }

  banner.classList.remove('hidden');
}

function claimWotd() {
  const today = new Date().toDateString();
  if (state.wotdHistory && state.wotdHistory.includes(today)) {
    const wotd = getWordOfTheDay();
    lumiSay('"' + wotd.word + '" means ' + wotd.def + '. Example: ' + wotd.sentence);
    return;
  }

  if (!state.wotdHistory) state.wotdHistory = [];
  state.wotdHistory.push(today);
  state.tokens += 3;
  playSound('token');
  spawnParticles(window.innerWidth / 2, window.innerHeight / 2, 6, '\u2B50');

  const wotd = getWordOfTheDay();
  lumiSay('New word: "' + wotd.word + '" means ' + wotd.def + '! +3 stars!');

  if (typeof checkAchievementsAfterWotd === 'function') checkAchievementsAfterWotd();

  updateUI();
  updateWotd();
  saveState();
}

// === CHALLENGES SECTION ===
function updateChallengesSection() {
  const grid = document.getElementById('challenges-grid');
  const section = document.getElementById('challenges-section');
  if (!grid || !section) return;

  const flowerCount = getGardenFlowerCount();
  let html = '';

  // Star Trials
  if (typeof renderStarTrialCards === 'function') {
    html += renderStarTrialCards(flowerCount);
  }

  // Escape Rooms
  if (typeof renderEscapeRoomCards === 'function') {
    html += renderEscapeRoomCards(flowerCount);
  }

  if (html) {
    grid.innerHTML = html;
    section.classList.remove('hidden');
  } else {
    section.classList.add('hidden');
  }
}
