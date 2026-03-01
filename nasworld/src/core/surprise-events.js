// ============================================================
//  SURPRISE & DELIGHT — Random fun events that keep Anastasia
//  coming back. Unpredictable rewards, mini-games, and moments.
// ============================================================

// === RANDOM EVENT ENGINE ===
// After each quiz answer there's a small chance of a surprise event

var SURPRISE_COOLDOWN = 0; // Timestamp of last surprise

var SURPRISE_EVENTS = [
  {
    id: 'shooting-star',
    name: 'Shooting Star!',
    chance: 0.06,          // 6% per correct answer
    minStreak: 0,
    fn: triggerShootingStar
  },
  {
    id: 'bonus-rain',
    name: 'Star Rain!',
    chance: 0.04,
    minStreak: 3,
    fn: triggerBonusRain
  },
  {
    id: 'lumi-dance',
    name: 'Lumi Dance Party!',
    chance: 0.05,
    minStreak: 5,
    fn: triggerLumiDance
  },
  {
    id: 'mystery-box',
    name: 'Mystery Box!',
    chance: 0.04,
    minStreak: 0,
    fn: triggerMysteryBox
  },
  {
    id: 'fireworks',
    name: 'Fireworks!',
    chance: 0.03,
    minStreak: 8,
    fn: triggerFireworks
  },
  {
    id: 'lucky-streak',
    name: 'Lucky Streak!',
    chance: 0.05,
    minStreak: 0,
    fn: triggerLuckyStreak
  },
  {
    id: 'confetti-burst',
    name: 'Confetti Party!',
    chance: 0.06,
    minStreak: 2,
    fn: triggerConfettiBurst
  },
  {
    id: 'lumi-riddle',
    name: 'Lumi\'s Riddle!',
    chance: 0.03,
    minStreak: 0,
    fn: triggerLumiRiddle
  },
  {
    id: 'golden-question',
    name: 'Golden Question!',
    chance: 0.03,
    minStreak: 3,
    fn: triggerGoldenQuestion
  },
  {
    id: 'time-warp',
    name: 'Time Warp!',
    chance: 0.04,
    minStreak: 0,
    fn: triggerTimeWarp
  }
];

// Roll for a surprise after correct answer
function rollForSurprise() {
  // Cooldown: at least 60 seconds between surprises
  if (Date.now() - SURPRISE_COOLDOWN < 60000) return;

  var streak = state.streak || 0;
  var eligible = SURPRISE_EVENTS.filter(function(e) {
    return streak >= e.minStreak;
  });

  for (var i = 0; i < eligible.length; i++) {
    if (Math.random() < eligible[i].chance) {
      SURPRISE_COOLDOWN = Date.now();
      // Delay so it doesn't overlap with answer feedback
      var evt = eligible[i];
      setTimeout(function() { evt.fn(); }, 1800);
      return;
    }
  }
}

// === SURPRISE IMPLEMENTATIONS ===

function triggerShootingStar() {
  showSurpriseOverlay('\uD83C\uDF20', 'Shooting Star!', 'You caught a shooting star! +5 bonus stars!', 5);

  // Animate a star across the screen
  var star = document.createElement('div');
  star.className = 'surprise-shooting-star';
  star.textContent = '\u2B50';
  document.body.appendChild(star);
  setTimeout(function() { star.remove(); }, 2000);
}

function triggerBonusRain() {
  var bonus = rand(3, 8);
  showSurpriseOverlay('\uD83C\uDF27\uFE0F', 'Star Rain!', 'Stars are raining down! +' + bonus + ' bonus stars!', bonus);

  // Rain particles
  for (var i = 0; i < 20; i++) {
    (function(idx) {
      setTimeout(function() {
        var drop = document.createElement('div');
        drop.className = 'surprise-rain-drop';
        drop.textContent = '\u2B50';
        drop.style.left = (10 + Math.random() * 80) + '%';
        drop.style.animationDuration = (0.8 + Math.random() * 0.6) + 's';
        document.body.appendChild(drop);
        setTimeout(function() { drop.remove(); }, 1500);
      }, idx * 100);
    })(i);
  }
}

function triggerLumiDance() {
  showSurpriseOverlay('\uD83D\uDD7A', 'Lumi Dance Party!', 'Lumi is so happy, they\'re dancing! +3 stars!', 3);

  // Make Lumi wobble
  var lumi = document.querySelector('.lumi-body');
  if (lumi) {
    lumi.classList.add('lumi-dancing');
    setTimeout(function() { lumi.classList.remove('lumi-dancing'); }, 4000);
  }
}

function triggerMysteryBox() {
  // Show a box that reveals a random reward when clicked
  var overlay = getSurpriseOverlay();

  var rewards = [
    { emoji: '\u2B50', text: '5 bonus stars!', stars: 5 },
    { emoji: '\uD83C\uDF38', text: 'A rare flower for your garden!', stars: 0, flower: true },
    { emoji: '\u2728', text: '8 bonus stars!', stars: 8 },
    { emoji: '\uD83D\uDD25', text: 'Streak shield! (Your next wrong answer won\'t break your streak!)', stars: 0, shield: true },
    { emoji: '\uD83C\uDF1F', text: '10 bonus stars!', stars: 10 }
  ];

  overlay.innerHTML =
    '<div class="surprise-card mystery-box-card">' +
      '<div class="surprise-icon surprise-bounce">\uD83C\uDF81</div>' +
      '<div class="surprise-title">Mystery Box!</div>' +
      '<div class="surprise-desc">Tap to open!</div>' +
      '<button class="surprise-btn surprise-pulse" onclick="openMysteryBox()">Open \uD83C\uDF81</button>' +
    '</div>';

  overlay.classList.add('show');
  overlay.dataset.mysteryReward = JSON.stringify(pick(rewards));
}

function openMysteryBox() {
  var overlay = getSurpriseOverlay();
  var reward = JSON.parse(overlay.dataset.mysteryReward || '{}');

  if (reward.stars) {
    state.tokens += reward.stars;
  }
  if (reward.flower && typeof addGardenFlower === 'function') {
    addGardenFlower('surprise', false);
  }
  if (reward.shield) {
    state._streakShield = true;
  }

  overlay.innerHTML =
    '<div class="surprise-card">' +
      '<div class="surprise-icon">' + (reward.emoji || '\u2728') + '</div>' +
      '<div class="surprise-title">You got:</div>' +
      '<div class="surprise-desc">' + (reward.text || 'Something special!') + '</div>' +
      '<button class="surprise-btn" onclick="closeSurpriseOverlay()">Awesome!</button>' +
    '</div>';

  if (typeof playSound === 'function') playSound('unlock');
  if (typeof spawnParticles === 'function') {
    spawnParticles(window.innerWidth / 2, window.innerHeight / 2, 15, reward.emoji || '\u2728');
  }
  if (typeof updateUI === 'function') updateUI();
  saveState();
}

function triggerFireworks() {
  showSurpriseOverlay('\uD83C\uDF86', 'Fireworks!', 'What an amazing streak! +7 bonus stars!', 7);

  // Firework particles in waves
  var emojis = ['\uD83C\uDF86', '\uD83C\uDF87', '\u2728', '\uD83C\uDF1F', '\u2B50'];
  for (var wave = 0; wave < 3; wave++) {
    (function(w) {
      setTimeout(function() {
        var x = window.innerWidth * (0.2 + w * 0.3);
        var y = window.innerHeight * (0.2 + Math.random() * 0.2);
        if (typeof spawnParticles === 'function') {
          spawnParticles(x, y, 10, pick(emojis));
        }
        if (typeof playSound === 'function') playSound('token');
      }, w * 500);
    })(wave);
  }
}

function triggerLuckyStreak() {
  // Next 3 correct answers are worth double
  state._luckyMultiplier = 3; // 3 questions remaining with double
  showSurpriseOverlay('\uD83C\uDF40', 'Lucky Streak!', 'Your next 3 correct answers earn DOUBLE stars!', 0);
}

function triggerConfettiBurst() {
  showSurpriseOverlay('\uD83C\uDF8A', 'Confetti Party!', 'You\'re doing so well! +4 bonus stars!', 4);

  // Confetti shower
  var confettiColors = ['#ff6b6b', '#ffd93d', '#6bcb77', '#4d96ff', '#b57bff', '#ff7bdb'];
  for (var i = 0; i < 40; i++) {
    (function(idx) {
      setTimeout(function() {
        var c = document.createElement('div');
        c.className = 'surprise-confetti';
        c.style.left = Math.random() * 100 + '%';
        c.style.background = confettiColors[idx % confettiColors.length];
        c.style.animationDuration = (1 + Math.random()) + 's';
        c.style.animationDelay = (Math.random() * 0.3) + 's';
        document.body.appendChild(c);
        setTimeout(function() { c.remove(); }, 2500);
      }, idx * 50);
    })(i);
  }
}

function triggerLumiRiddle() {
  var riddles = [
    { q: 'I have hands but can\'t clap. What am I?', a: 'A clock!' },
    { q: 'What has a head and a tail but no body?', a: 'A coin!' },
    { q: 'What gets wetter the more it dries?', a: 'A towel!' },
    { q: 'I\'m full of holes but I hold water. What am I?', a: 'A sponge!' },
    { q: 'What has legs but doesn\'t walk?', a: 'A table!' },
    { q: 'What has teeth but can\'t bite?', a: 'A comb!' },
    { q: 'What can you catch but not throw?', a: 'A cold!' },
    { q: 'What goes up but never comes down?', a: 'Your age!' }
  ];

  var riddle = pick(riddles);
  var overlay = getSurpriseOverlay();

  overlay.innerHTML =
    '<div class="surprise-card">' +
      '<div class="surprise-icon">\uD83E\uDD14</div>' +
      '<div class="surprise-title">Lumi\'s Riddle!</div>' +
      '<div class="surprise-desc" style="font-size:18px;margin:16px 0">' + riddle.q + '</div>' +
      '<button class="surprise-btn" onclick="revealRiddle(\'' + riddle.a.replace(/'/g, "\\'") + '\')">Reveal Answer</button>' +
    '</div>';

  overlay.classList.add('show');
}

function revealRiddle(answer) {
  var overlay = getSurpriseOverlay();
  overlay.innerHTML =
    '<div class="surprise-card">' +
      '<div class="surprise-icon">\uD83D\uDCA1</div>' +
      '<div class="surprise-title">' + answer + '</div>' +
      '<div class="surprise-desc">+3 stars for thinking about it!</div>' +
      '<button class="surprise-btn" onclick="closeSurpriseOverlay()">Cool!</button>' +
    '</div>';

  state.tokens += 3;
  if (typeof playSound === 'function') playSound('token');
  if (typeof updateUI === 'function') updateUI();
  saveState();
}

function triggerGoldenQuestion() {
  // The current question's rewards are tripled
  state._goldenActive = true;
  showSurpriseOverlay('\uD83C\uDFC5', 'Golden Question!', 'Your NEXT correct answer is worth TRIPLE stars!', 0);

  // Add golden glow to the question card
  var qCard = document.getElementById('question-card');
  if (qCard) qCard.classList.add('golden-glow');
}

function triggerTimeWarp() {
  // Show a fun "time warp" visual then give bonus
  var overlay = getSurpriseOverlay();

  overlay.innerHTML =
    '<div class="surprise-card">' +
      '<div class="surprise-icon surprise-spin">\u231B</div>' +
      '<div class="surprise-title">Time Warp!</div>' +
      '<div class="surprise-desc">Whoooosh! You just time-travelled!</div>' +
      '<div class="surprise-desc" style="font-size:14px">Future-Anastasia says: "Keep going, you\'re amazing!" +5 stars!</div>' +
      '<button class="surprise-btn" onclick="closeSurpriseOverlay()">Wow!</button>' +
    '</div>';

  overlay.classList.add('show');
  state.tokens += 5;
  if (typeof playSound === 'function') playSound('escape');
  if (typeof updateUI === 'function') updateUI();
  saveState();
}

// === MILESTONE CELEBRATIONS ===
// Big celebrations at key milestones

function checkMilestoneCelebration() {
  var milestones = [
    { count: 50,   emoji: '\uD83C\uDF89', msg: '50 correct answers! You\'re a learning machine!' },
    { count: 100,  emoji: '\uD83C\uDFC6', msg: '100 correct answers! A true champion!' },
    { count: 250,  emoji: '\uD83C\uDF1F', msg: '250 correct answers! You\'re a STAR!' },
    { count: 500,  emoji: '\uD83D\uDE80', msg: '500 correct answers! You\'re out of this world!' },
    { count: 1000, emoji: '\uD83C\uDF0C', msg: '1000 correct answers! You\'re a GALAXY of knowledge!' }
  ];

  for (var i = 0; i < milestones.length; i++) {
    var m = milestones[i];
    if (state.totalCorrect === m.count) {
      showSurpriseOverlay(m.emoji, m.count + ' Correct Answers!', m.msg, 15);
      return true;
    }
  }
  return false;
}

// === DAILY LUCKY SPIN (once per day on home screen) ===

function checkDailyLuckySpin() {
  var today = new Date().toDateString();
  if (state._lastLuckySpin === today) return false;
  return true;
}

function triggerDailyLuckySpin() {
  var today = new Date().toDateString();
  if (state._lastLuckySpin === today) return;
  state._lastLuckySpin = today;
  saveState();

  var prizes = [
    { emoji: '\u2B50', text: '3 bonus stars!', stars: 3 },
    { emoji: '\u2B50', text: '5 bonus stars!', stars: 5 },
    { emoji: '\u2B50', text: '8 bonus stars!', stars: 8 },
    { emoji: '\uD83D\uDD25', text: 'Start with a 3-streak!', streak: 3 },
    { emoji: '\uD83C\uDF40', text: 'Lucky boost! Double stars for 3 questions!', lucky: 3 },
    { emoji: '\uD83C\uDF38', text: 'A bonus flower for your garden!', flower: true }
  ];

  var prize = pick(prizes);

  var overlay = getSurpriseOverlay();
  overlay.innerHTML =
    '<div class="surprise-card">' +
      '<div class="surprise-icon surprise-spin">\uD83C\uDFA1</div>' +
      '<div class="surprise-title">Daily Spin!</div>' +
      '<div class="surprise-desc">Tap to see today\'s bonus!</div>' +
      '<button class="surprise-btn surprise-pulse" onclick="revealDailySpin()">Spin! \uD83C\uDFA1</button>' +
    '</div>';

  overlay.classList.add('show');
  overlay.dataset.spinPrize = JSON.stringify(prize);
}

function revealDailySpin() {
  var overlay = getSurpriseOverlay();
  var prize = JSON.parse(overlay.dataset.spinPrize || '{}');

  if (prize.stars) state.tokens += prize.stars;
  if (prize.streak) state.streak = Math.max(state.streak, prize.streak);
  if (prize.lucky) state._luckyMultiplier = prize.lucky;
  if (prize.flower && typeof addGardenFlower === 'function') addGardenFlower('lucky-spin', false);

  overlay.innerHTML =
    '<div class="surprise-card">' +
      '<div class="surprise-icon">' + (prize.emoji || '\u2B50') + '</div>' +
      '<div class="surprise-title">You won!</div>' +
      '<div class="surprise-desc" style="font-size:18px">' + (prize.text || 'Something special!') + '</div>' +
      '<button class="surprise-btn" onclick="closeSurpriseOverlay()">Yay!</button>' +
    '</div>';

  if (typeof playSound === 'function') playSound('unlock');
  if (typeof spawnParticles === 'function') {
    spawnParticles(window.innerWidth / 2, window.innerHeight / 2, 12, prize.emoji || '\u2B50');
  }
  if (typeof updateUI === 'function') updateUI();
  saveState();
}

// === SURPRISE OVERLAY HELPERS ===

function getSurpriseOverlay() {
  var overlay = document.getElementById('surprise-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'surprise-overlay';
    overlay.className = 'surprise-overlay';
    document.body.appendChild(overlay);
  }
  return overlay;
}

function showSurpriseOverlay(emoji, title, desc, stars) {
  var overlay = getSurpriseOverlay();

  if (stars > 0) {
    state.tokens += stars;
    if (typeof updateUI === 'function') updateUI();
    saveState();
  }

  overlay.innerHTML =
    '<div class="surprise-card">' +
      '<div class="surprise-icon">' + emoji + '</div>' +
      '<div class="surprise-title">' + title + '</div>' +
      '<div class="surprise-desc">' + desc + '</div>' +
      (stars > 0 ? '<div class="surprise-stars">+' + stars + ' \u2B50</div>' : '') +
      '<button class="surprise-btn" onclick="closeSurpriseOverlay()">Awesome!</button>' +
    '</div>';

  overlay.classList.add('show');
  if (typeof playSound === 'function') playSound('token');
}

function closeSurpriseOverlay() {
  var overlay = document.getElementById('surprise-overlay');
  if (overlay) overlay.classList.remove('show');

  // Remove golden glow if active
  var qCard = document.getElementById('question-card');
  if (qCard) qCard.classList.remove('golden-glow');
}

// === HOOK INTO FEEDBACK SYSTEM ===
// Called from handleCorrect — checks lucky multiplier, golden, streak shield

function applySurpriseModifiers() {
  // Lucky streak multiplier
  if (state._luckyMultiplier && state._luckyMultiplier > 0) {
    state.tokens += 5; // extra 5 stars for lucky
    state._luckyMultiplier--;
    if (state._luckyMultiplier <= 0) delete state._luckyMultiplier;
  }

  // Golden question
  if (state._goldenActive) {
    state.tokens += 10; // triple effect (normal 5 + extra 10)
    delete state._goldenActive;
  }
}

function applyStreakShield() {
  if (state._streakShield) {
    delete state._streakShield;
    return true; // Don't break streak
  }
  return false;
}
