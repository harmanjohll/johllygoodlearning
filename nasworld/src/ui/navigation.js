// ============================================================
//  NAVIGATION — Screen management, game engine, init
// ============================================================

// === GAME SESSION STATE ===
let currentGame = {
  skillId: '',
  worldType: '',
  questions: [],
  currentIndex: 0,
  totalQuestions: 8,
  results: [],
  currentConfidence: -1,
  hintShown: false,
  attempts: 0
};

// === SCREEN MANAGEMENT ===
function showScreen(screenId) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const screen = document.getElementById('screen-' + screenId);
  if (screen) screen.classList.add('active');

  if (screenId === 'home') updateHomeUI();
  if (screenId === 'achievements' && typeof renderAchievementsScreen === 'function') {
    renderAchievementsScreen();
  }
  if (screenId === 'math-world' && typeof MATH_TREE !== 'undefined') {
    renderActivityCards(MATH_TREE, 'math-activities', 'math');
  }
  if (screenId === 'word-world' && typeof WORD_TREE !== 'undefined') {
    renderActivityCards(WORD_TREE, 'word-activities', 'word');
  }
  if (screenId === 'stem-world' && typeof STEM_TREE !== 'undefined') {
    renderActivityCards(STEM_TREE, 'stem-activities', 'stem');
  }
  if (screenId === 'garden') renderGarden();
}

// === SKILL VIEW — Tabbed Learn / Explore / Quiz ===
function openSkillView(skillId, worldType) {
  playSound('click');

  // Record activity
  if (typeof recordSkillActivity === 'function') {
    recordSkillActivity(skillId, 'visit');
  }

  // Look up skill name/icon
  var allTrees = Object.assign({},
    typeof MATH_TREE !== 'undefined' ? MATH_TREE : {},
    typeof WORD_TREE !== 'undefined' ? WORD_TREE : {},
    typeof STEM_TREE !== 'undefined' ? STEM_TREE : {}
  );
  var skill = allTrees[skillId];
  var skillName = skill ? skill.icon + ' ' + skill.name : skillId;

  // Get lesson, flashcards
  var lesson = null;
  var flashcards = null;

  if (worldType === 'math') {
    if (typeof getMathLesson === 'function') lesson = getMathLesson(skillId);
    if (typeof getMathFlashcards === 'function') flashcards = getMathFlashcards(skillId);
  } else if (worldType === 'word') {
    if (typeof getWordLesson === 'function') lesson = getWordLesson(skillId);
    if (typeof getWordFlashcards === 'function') flashcards = getWordFlashcards(skillId);
  } else if (worldType === 'stem') {
    if (typeof getStemLesson === 'function') lesson = getStemLesson(skillId);
    if (typeof getStemFlashcards === 'function') flashcards = getStemFlashcards(skillId);
  }

  var hasLesson = !!lesson;
  var hasFlashcards = flashcards && flashcards.length > 0;
  var s = getSkillState(skillId);
  var lessonDone = s.lessonViewed && s.lessonViewed[skillId];

  // If no lesson and no flashcards, go straight to quiz
  if (!hasLesson && !hasFlashcards) {
    startGame(skillId, worldType);
    return;
  }

  // Build the skill view screen
  showScreen('skill-view');

  var container = document.getElementById('skill-view-content');
  if (!container) return;

  // Render tab header
  var html = '';
  html += '<div class="skill-view-header">';
  html += '<button class="back-btn" id="skill-view-back">&#8592; Back</button>';
  html += '<div class="skill-view-title">' + skillName + '</div>';
  html += '</div>';

  // Tabs
  html += '<div class="skill-tabs">';
  if (hasLesson) {
    html += '<button class="skill-tab active" data-tab="learn">';
    html += '<span class="skill-tab-icon">📖</span>';
    html += '<span>Learn</span>';
    if (lessonDone) html += '<span class="skill-tab-check">✓</span>';
    html += '</button>';
  }
  if (hasFlashcards) {
    html += '<button class="skill-tab' + (!hasLesson ? ' active' : '') + '" data-tab="flashcards">';
    html += '<span class="skill-tab-icon">🃏</span>';
    html += '<span>Cards</span>';
    html += '</button>';
  }
  html += '<button class="skill-tab' + (!hasLesson && !hasFlashcards ? ' active' : '') + '" data-tab="quiz">';
  html += '<span class="skill-tab-icon">⚡</span>';
  html += '<span>Quiz</span>';
  html += '</button>';
  html += '</div>';

  // Tab content area
  html += '<div class="skill-tab-content" id="skill-tab-content"></div>';

  container.innerHTML = html;

  // Back button
  document.getElementById('skill-view-back').onclick = function() {
    var worldMap = { math: 'math-world', word: 'word-world', stem: 'stem-world' };
    showScreen(worldMap[worldType] || 'home');
  };

  // Tab switching
  var tabs = container.querySelectorAll('.skill-tab');
  tabs.forEach(function(tab) {
    tab.onclick = function() {
      tabs.forEach(function(t) { t.classList.remove('active'); });
      tab.classList.add('active');
      showTabContent(tab.dataset.tab);
    };
  });

  function showTabContent(tabName) {
    var content = document.getElementById('skill-tab-content');
    content.innerHTML = '';

    if (tabName === 'learn' && hasLesson) {
      renderLesson(content, lesson, skillId, function() {
        // After lesson, switch to explore or quiz
        var nextTab = hasFlashcards ? 'flashcards' : 'quiz';
        tabs.forEach(function(t) { t.classList.remove('active'); });
        container.querySelector('[data-tab="' + nextTab + '"]').classList.add('active');
        // Update learn tab checkmark
        var learnTab = container.querySelector('[data-tab="learn"]');
        if (learnTab && !learnTab.querySelector('.skill-tab-check')) {
          learnTab.insertAdjacentHTML('beforeend', '<span class="skill-tab-check">✓</span>');
        }
        showTabContent(nextTab);
      });
      if (typeof recordSkillActivity === 'function') {
        recordSkillActivity(skillId, 'learn');
      }
    } else if (tabName === 'flashcards' && hasFlashcards) {
      renderFlashcards(content, flashcards, skillId, function() {
        tabs.forEach(function(t) { t.classList.remove('active'); });
        container.querySelector('[data-tab="quiz"]').classList.add('active');
        showTabContent('quiz');
      });
      if (typeof recordSkillActivity === 'function') {
        recordSkillActivity(skillId, 'explore');
      }
    } else if (tabName === 'quiz') {
      // Show quiz in the tab content area
      content.innerHTML = '<div class="skill-quiz-start">' +
        '<div class="skill-quiz-icon">⚡</div>' +
        '<div class="skill-quiz-title">Ready for the quiz?</div>' +
        '<div class="skill-quiz-desc">8 questions to test your understanding</div>' +
        '<button class="lesson-btn lesson-btn-done" id="start-quiz-btn">Start Quiz →</button>' +
        '</div>';
      document.getElementById('start-quiz-btn').onclick = function() {
        startGame(skillId, worldType);
      };
    }
  }

  // Show initial tab
  var initialTab = hasLesson ? 'learn' : (hasFlashcards ? 'flashcards' : 'quiz');
  showTabContent(initialTab);
}

// === GAME ENGINE ===
function startGame(skillId, worldType) {
  playSound('click');
  currentGame = {
    skillId,
    worldType: worldType || 'math',
    questions: [],
    currentIndex: 0,
    totalQuestions: 8,
    results: [],
    currentConfidence: -1,
    hintShown: false,
    attempts: 0,
    _startTime: Date.now()
  };

  // Generate questions
  for (let i = 0; i < currentGame.totalQuestions; i++) {
    currentGame.questions.push(generateQuestion(skillId, worldType));
  }

  // Set title
  const allTrees = Object.assign({},
    typeof MATH_TREE !== 'undefined' ? MATH_TREE : {},
    typeof WORD_TREE !== 'undefined' ? WORD_TREE : {},
    typeof STEM_TREE !== 'undefined' ? STEM_TREE : {}
  );
  const skill = allTrees[skillId];
  document.getElementById('game-title').textContent = skill ? skill.icon + ' ' + skill.name : skillId;

  showScreen('game');
  renderGameDots();
  renderCurrentQuestion();
}

function exitGame() {
  const worldMap = {
    math: 'math-world',
    word: 'word-world',
    stem: 'stem-world'
  };
  showScreen(worldMap[currentGame.worldType] || 'home');
  saveState();
}

function renderGameDots() {
  const dots = document.getElementById('game-dots');
  if (!dots) return;
  dots.innerHTML = '';
  for (let i = 0; i < currentGame.totalQuestions; i++) {
    const dot = document.createElement('div');
    dot.className = 'game-dot';
    if (i < currentGame.currentIndex) {
      dot.className += currentGame.results[i] ? ' done' : ' wrong';
    } else if (i === currentGame.currentIndex) {
      dot.className += ' current';
    }
    dots.appendChild(dot);
  }
}

function renderCurrentQuestion() {
  if (currentGame.currentIndex >= currentGame.totalQuestions) {
    endGame();
    return;
  }

  currentGame.currentConfidence = -1;
  currentGame.hintShown = false;
  currentGame.attempts = 0;

  const q = currentGame.questions[currentGame.currentIndex];
  const card = document.getElementById('question-card');

  card.innerHTML = '';
  card.style.animation = 'none';
  card.offsetHeight;
  card.style.animation = 'slide-up 0.4s ease-out';

  // Route to appropriate renderer
  if (typeof renderMathQuestion === 'function' && renderMathQuestion(card, q)) return;
  if (typeof renderWordQuestion === 'function' && renderWordQuestion(card, q)) return;
  if (typeof renderScienceQuestion === 'function' && renderScienceQuestion(card, q)) return;
  if (typeof renderCodeQuestion === 'function' && renderCodeQuestion(card, q)) return;

  // Fallback generic MCQ
  renderGenericMCQ(card, q);
}

function renderGenericMCQ(card, q) {
  let html = '<div class="question-text">' + (q.text || 'Question') + '</div>';
  if (q.options) {
    html += '<div class="answer-options mt-2">' + q.options.map(function(o) {
      return '<button class="answer-btn" onclick="checkAnswer(\'' + o + '\', \'' + q.answer + '\', this)">' + o + '</button>';
    }).join('') + '</div>';
  }
  card.innerHTML = html;
}

function nextQuestion() {
  document.getElementById('feedback-overlay').classList.add('hidden');
  currentGame.currentIndex++;
  renderGameDots();
  renderCurrentQuestion();
}

function endGame() {
  const correct = currentGame.results.filter(r => r).length;
  const total = currentGame.results.length;
  const pct = Math.round(correct / total * 100);
  state.sessionsCompleted++;

  // Achievement & quest hooks
  if (typeof checkAchievementsAfterQuiz === 'function') {
    checkAchievementsAfterQuiz(currentGame.results, currentGame.skillId, currentGame.worldType);
  }
  if (correct === total && total >= 8 && typeof questRecordPerfect === 'function') {
    questRecordPerfect();
  }
  if (typeof lumiReactTo === 'function') {
    lumiReactTo('quizComplete', { pct: pct });
  }

  const overlay = document.getElementById('feedback-overlay');
  const card = document.getElementById('feedback-card');

  let html = '';
  if (pct >= 80) {
    html += '<div class="feedback-icon">\uD83C\uDFC6</div>';
    html += '<div class="feedback-title" style="color:var(--gold)">Amazing, Anastasia!</div>';
    playSound('levelup');
    spawnParticles(window.innerWidth / 2, window.innerHeight / 3, 20, '\u2728');
  } else if (pct >= 50) {
    html += '<div class="feedback-icon">\uD83C\uDF1F</div>';
    html += '<div class="feedback-title" style="color:var(--mint)">Great effort!</div>';
  } else {
    html += '<div class="feedback-icon">\uD83C\uDF31</div>';
    html += '<div class="feedback-title" style="color:var(--lavender)">Keep growing!</div>';
  }

  html += '<div class="feedback-message">' + correct + ' out of ' + total + ' correct (' + pct + '%)</div>';

  const skill = getSkillState(currentGame.skillId);
  html += '<div style="margin:16px 0">';
  html += '<div style="font-size:14px;color:var(--text-secondary);margin-bottom:6px">Mastery Level</div>';
  html += '<div class="skill-bar" style="width:200px;margin:0 auto;height:12px">';
  html += '<div class="skill-bar-fill" style="width:' + skill.mastery + '%"></div>';
  html += '</div>';
  html += '<div style="font-size:12px;color:var(--text-dim);margin-top:4px">' + skill.mastery + '%</div>';
  html += '</div>';

  if (pct === 100) {
    const bonus = 10;
    state.tokens += bonus;
    html += '<div class="feedback-tokens">\uD83C\uDF1F Perfect bonus: +' + bonus + ' \u2B50</div>';
  }

  html += '<div style="display:flex;gap:12px;justify-content:center;margin-top:16px">';
  html += '<button class="feedback-btn" onclick="startGame(\'' + currentGame.skillId + '\',\'' + currentGame.worldType + '\')" style="background:linear-gradient(135deg,var(--mint),var(--sky))">Play Again</button>';
  html += '<button class="feedback-btn" onclick="exitFromEnd()">Back to World</button>';
  html += '</div>';

  card.innerHTML = html;
  overlay.classList.remove('hidden');
  saveState();
}

function exitFromEnd() {
  document.getElementById('feedback-overlay').classList.add('hidden');
  exitGame();
}

function exitEscapeRoom() {
  if (typeof endEscapeRoom === 'function') endEscapeRoom();
  showScreen('home');
}

// === QUESTION GENERATOR DISPATCHER ===
function generateQuestion(skillId, worldType) {
  if (worldType === 'math' && typeof generateMathQuestion === 'function') {
    return generateMathQuestion(skillId);
  }
  if (worldType === 'word' && typeof generateWordQuestion === 'function') {
    return generateWordQuestion(skillId);
  }
  if (worldType === 'stem') {
    if (typeof generateScienceQuestion === 'function') {
      const sciResult = generateScienceQuestion(skillId);
      if (sciResult) return sciResult;
    }
    if (typeof generateCodeQuestion === 'function') {
      const codeResult = generateCodeQuestion(skillId);
      if (codeResult) return codeResult;
    }
  }
  // Fallback
  return { type: 'generic', text: 'Coming soon!', options: ['OK'], answer: 'OK' };
}

// === INIT ===
async function init() {
  await loadState();
  updateUI();

  // Visit streak tracking for achievements
  if (typeof checkVisitStreakAchievements === 'function') {
    checkVisitStreakAchievements();
  }

  // Initialize dynamic quests for today
  if (typeof getDailyQuest === 'function') getDailyQuest();
  if (typeof getWeeklyQuest === 'function') getWeeklyQuest();

  // Initialize Lumi with personality
  if (typeof initLumi === 'function') {
    initLumi();
  } else {
    // Fallback: basic greeting
    const hour = new Date().getHours();
    let greeting;
    if (hour < 12) greeting = 'Good morning, Anastasia! Ready to learn?';
    else if (hour < 17) greeting = 'Good afternoon, Anastasia! Let\'s have some fun!';
    else greeting = 'Good evening, Anastasia! Time for a brain workout!';

    const today = new Date().toDateString();
    if (state.lastVisit === today) {
      greeting = pick([
        'Welcome back, Anastasia! Your garden missed you!',
        'Hey Anastasia! Let\'s pick up where you left off!',
        'You\'re back! Lumi is so happy to see you!'
      ]);
    } else if (state.lastVisit) {
      greeting = 'Welcome back, Anastasia! I\'ve been waiting for you!';
    }
    lumiSay(greeting);
  }

  state.lastVisit = new Date().toDateString();
  saveState();

  showScreen('home');
}

// Run!
init();
