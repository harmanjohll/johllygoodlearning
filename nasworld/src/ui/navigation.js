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
    attempts: 0
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

  // Time-based greeting
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
  state.lastVisit = today;
  saveState();

  lumiSay(greeting);
  showScreen('home');
}

// Run!
init();
