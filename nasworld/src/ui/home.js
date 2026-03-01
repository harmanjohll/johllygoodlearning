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

  updateDailyQuest();
  updateWotd();
  updateChallengesSection();
}

// === DAILY QUEST ===
function updateDailyQuest() {
  const today = new Date().toDateString();
  if (state.dailyQuest.date !== today) {
    state.dailyQuest = { date: today, completed: 0, target: 5, claimed: false };
  }
  const el = document.getElementById('quest-progress');
  if (el) el.textContent = state.dailyQuest.completed + '/' + state.dailyQuest.target;

  if (state.dailyQuest.completed >= state.dailyQuest.target && !state.dailyQuest.claimed) {
    const titleEl = document.getElementById('quest-title');
    const descEl = document.getElementById('quest-desc');
    if (titleEl) titleEl.textContent = '\uD83C\uDF89 Quest Complete!';
    if (descEl) descEl.textContent = 'Tap to claim 20 bonus stars!';
  }
}

function startDailyQuest() {
  if (state.dailyQuest.completed >= state.dailyQuest.target && !state.dailyQuest.claimed) {
    state.dailyQuest.claimed = true;
    state.tokens += 20;
    playSound('levelup');
    spawnParticles(window.innerWidth / 2, window.innerHeight / 2, 15, '\u2B50');
    updateUI();
    saveState();
    lumiSay('Wow! 20 bonus stars! You completed today\'s quest!');
    updateDailyQuest();
  }
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
