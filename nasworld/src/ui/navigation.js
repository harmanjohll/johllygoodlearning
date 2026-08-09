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
  if (screenId === 'malay-world' && typeof MALAY_TREE !== 'undefined') {
    renderActivityCards(MALAY_TREE, 'malay-activities', 'malay');
  }
  if (screenId === 'mega-map' && typeof renderMegaMap === 'function') {
    renderMegaMap();
  }
  if (screenId === 'compass' && typeof renderCompass === 'function') {
    renderCompass();
  }
  if (screenId === 'mirror' && typeof renderMirror === 'function') {
    renderMirror();
  }
  if (screenId === 'strategies' && typeof renderStrategyLibrary === 'function') {
    renderStrategyLibrary();
  }
  if (screenId === 'parent-digest' && typeof renderParentDigest === 'function') {
    renderParentDigest();
  }
  if (screenId === 'stasha' && typeof renderStashaScreen === 'function') {
    renderStashaScreen();
  }
  if (screenId === 'wardrobe' && typeof renderWardrobe === 'function') {
    renderWardrobe();
  }
  if (screenId === 'sim-hub' && typeof renderSimHub === 'function') {
    renderSimHub();
  }
  if (screenId === 'practice' && typeof renderPracticeHub === 'function') {
    renderPracticeHub();
  }
  if (screenId === 'tricks' && typeof renderTricksHub === 'function') {
    renderTricksHub();
  }
  if (screenId === 'trick-detail' && typeof renderTrickDetail === 'function') {
    renderTrickDetail();
  }
  if (screenId === 'drill-setup' && typeof renderDrillSetup === 'function') {
    renderDrillSetup();
  }
  if (screenId === 'settings' && typeof renderSettings === 'function') {
    renderSettings();
  }
  if (screenId === 'garden') {
    if (typeof renderGardenIsland === 'function') renderGardenIsland();
    renderGarden();
  }
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
    typeof MATH_TREE  !== 'undefined' ? MATH_TREE  : {},
    typeof WORD_TREE  !== 'undefined' ? WORD_TREE  : {},
    typeof STEM_TREE  !== 'undefined' ? STEM_TREE  : {},
    typeof MALAY_TREE !== 'undefined' ? MALAY_TREE : {}
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
  } else if (worldType === 'malay') {
    if (typeof getMalayLesson === 'function') lesson = getMalayLesson(skillId);
    if (typeof getMalayFlashcards === 'function') flashcards = getMalayFlashcards(skillId);
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
  // Tricks live next to the topic they help with, not in a separate
  // corner of the app — that is the whole point of scaffolding.
  var skillTricks = (typeof tricksForSkill === 'function') ? tricksForSkill(skillId) : [];
  if (skillTricks.length > 0) {
    html += '<button class="skill-tab" data-tab="tricks">';
    html += '<span class="skill-tab-icon">🧠</span>';
    html += '<span>Tricks</span>';
    html += '<span class="skill-tab-count">' + skillTricks.length + '</span>';
    html += '</button>';
  }
  html += '</div>';

  // Tab content area
  html += '<div class="skill-tab-content" id="skill-tab-content"></div>';

  container.innerHTML = html;

  // Back button
  document.getElementById('skill-view-back').onclick = function() {
    var worldMap = { math: 'math-world', word: 'word-world', stem: 'stem-world', malay: 'malay-world' };
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
      // Skills with drill options get a "choose your practice" route
      // as well as the plain quick quiz.
      var canDrill = (worldType === 'math') &&
                     typeof skillHasDrill === 'function' && skillHasDrill(skillId);

      var quizHtml = '<div class="skill-quiz-start">';
      quizHtml += '<div class="skill-quiz-icon">⚡</div>';
      quizHtml += '<div class="skill-quiz-title">Ready to practise?</div>';

      if (canDrill) {
        var _cfg = getDrillConfig(skillId);
        var _opt = DRILL_OPTIONS[skillId];
        var _sum = [];
        if (_opt.tables && _cfg.tables && _cfg.tables.length) {
          _sum.push(_cfg.tables.length === _opt.tables.values.length
            ? 'all tables'
            : _cfg.tables.join(', ') + '×');
        }
        if (_opt.ranges && _cfg.rangeKey) {
          var _r = _opt.ranges.find(function(x) { return x.key === _cfg.rangeKey; });
          if (_r) _sum.push(_r.label.toLowerCase());
        }
        _sum.push(_cfg.count + ' questions');
        quizHtml += '<div class="skill-quiz-desc">Last time: ' + _sum.join(' · ') + '</div>';
        quizHtml += '<button class="lesson-btn lesson-btn-done" id="start-quiz-btn">Start ⚡</button>';
        quizHtml += '<button class="lesson-btn" id="drill-setup-btn">🎯 Choose what to practise</button>';
      } else {
        quizHtml += '<div class="skill-quiz-desc">8 questions to test your understanding</div>';
        quizHtml += '<button class="lesson-btn lesson-btn-done" id="start-quiz-btn">Start Quiz →</button>';
      }
      quizHtml += '</div>';
      content.innerHTML = quizHtml;

      document.getElementById('start-quiz-btn').onclick = function() {
        var cfg = canDrill && typeof resolveDrillConfig === 'function'
          ? resolveDrillConfig(skillId) : null;
        if (typeof metaConfidenceBefore === 'function') {
          metaConfidenceBefore(skillId, function() {
            startGame(skillId, worldType, cfg);
          });
        } else {
          startGame(skillId, worldType, cfg);
        }
      };
      var dsBtn = document.getElementById('drill-setup-btn');
      if (dsBtn) dsBtn.onclick = function() { openDrillSetup(skillId, worldType); };

    } else if (tabName === 'tricks') {
      var list = tricksForSkill(skillId);
      var th = '<div class="skill-tricks-intro">Clever ways to do this faster. Tap one to see it work.</div>';
      th += '<div class="tricks-grid">';
      list.forEach(function(t) {
        var st = getTrickState(t.id);
        th += '<button class="trick-card' + (st.seen ? ' seen' : '') + '" onclick="openTrick(\'' + t.id + '\')">';
        th += '<div class="trick-card-icon">' + t.icon + '</div>';
        th += '<div class="trick-card-body">';
        th += '<div class="trick-card-name">' + t.name +
              (t.trachtenberg ? ' <span class="trick-tag">Trachtenberg</span>' : '') + '</div>';
        th += '<div class="trick-card-line">' + t.oneLiner + '</div>';
        th += '</div>';
        th += '<div class="trick-card-tick">' + (st.seen ? '✓' : '›') + '</div>';
        th += '</button>';
      });
      th += '</div>';
      content.innerHTML = th;
    }
  }

  // Show initial tab
  var initialTab = hasLesson ? 'learn' : (hasFlashcards ? 'flashcards' : 'quiz');
  showTabContent(initialTab);
}

// === GAME ENGINE ===
function startGame(skillId, worldType, config) {
  playSound('click');
  const count = (config && config.count) || 8;
  currentGame = {
    skillId,
    worldType: worldType || 'math',
    config: config || null,
    questions: [],
    currentIndex: 0,
    totalQuestions: count,
    results: [],
    wrongLog: [],
    currentConfidence: -1,
    hintShown: false,
    attempts: 0,
    _startTime: Date.now(),
    _questionStart: Date.now(),
    isSpeed: !!(config && config.mode === 'speed')
  };

  // Generate questions
  for (let i = 0; i < currentGame.totalQuestions; i++) {
    currentGame.questions.push(generateQuestion(skillId, worldType, config));
  }

  // Set title
  const allTrees = Object.assign({},
    typeof MATH_TREE  !== 'undefined' ? MATH_TREE  : {},
    typeof WORD_TREE  !== 'undefined' ? WORD_TREE  : {},
    typeof STEM_TREE  !== 'undefined' ? STEM_TREE  : {},
    typeof MALAY_TREE !== 'undefined' ? MALAY_TREE : {}
  );
  const skill = allTrees[skillId];
  document.getElementById('game-title').textContent = skill ? skill.icon + ' ' + skill.name : skillId;

  showScreen('game');
  renderGameDots();
  renderCurrentQuestion();
  if (currentGame.isSpeed) startSpeedTimer();
}

// === SPEED DRILL ===
// A gentle clock. It never cuts her off mid-question and it never
// punishes; it just records the time so fluency can be measured.
var _speedTimerId = null;
function startSpeedTimer() {
  stopSpeedTimer();
  var host = document.getElementById('game-title');
  if (host && host.parentElement && !document.getElementById('speed-timer')) {
    var pill = document.createElement('div');
    pill.id = 'speed-timer';
    pill.className = 'speed-timer';
    pill.textContent = '0.0s';
    host.parentElement.appendChild(pill);
  }
  _speedTimerId = setInterval(function() {
    var pill = document.getElementById('speed-timer');
    if (!pill || !currentGame) return;
    var secs = (Date.now() - currentGame._startTime) / 1000;
    pill.textContent = secs.toFixed(1) + 's';
  }, 100);
}
function stopSpeedTimer() {
  if (_speedTimerId) { clearInterval(_speedTimerId); _speedTimerId = null; }
  var pill = document.getElementById('speed-timer');
  if (pill) pill.remove();
}

function exitGame() {
  const worldMap = {
    math: 'math-world',
    word: 'word-world',
    stem: 'stem-world',
    malay: 'malay-world'
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
  if (typeof renderMalayQuestion === 'function' && renderMalayQuestion(card, q)) return;

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
  currentGame._questionStart = Date.now();
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
  if (typeof metaReflectAfter === 'function') {
    metaReflectAfter(currentGame.skillId);
  }

  const overlay = document.getElementById('feedback-overlay');
  const card = document.getElementById('feedback-card');

  let html = '';
  if (pct >= 80) {
    html += '<div class="feedback-icon">🏆</div>';
    html += '<div class="feedback-title" style="color:var(--gold)">Amazing, Anastasia!</div>';
    playSound('levelup');
    spawnParticles(window.innerWidth / 2, window.innerHeight / 3, 20, '✨');
  } else if (pct >= 50) {
    html += '<div class="feedback-icon">🌟</div>';
    html += '<div class="feedback-title" style="color:var(--mint)">Great effort!</div>';
  } else {
    html += '<div class="feedback-icon">🌱</div>';
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
    html += '<div class="feedback-tokens">🌟 Perfect bonus: +' + bonus + ' ⭐</div>';
  }

  // Speed drill result
  if (currentGame.isSpeed) {
    stopSpeedTimer();
    var totalSecs = (Date.now() - currentGame._startTime) / 1000;
    var perQ = totalSecs / Math.max(1, total);
    html += '<div class="end-speed">⚡ ' + totalSecs.toFixed(1) + 's total · ' + perQ.toFixed(1) + 's per question</div>';
    var best = state.speedBests && state.speedBests[currentGame.skillId];
    if (correct === total && (!best || totalSecs < best)) {
      if (!state.speedBests) state.speedBests = {};
      state.speedBests[currentGame.skillId] = totalSecs;
      html += '<div class="end-speed-best">🏆 New personal best!</div>';
    } else if (best) {
      html += '<div class="end-speed-best">Your best: ' + best.toFixed(1) + 's</div>';
    }
  }

  // What tripped her up — far more useful than a bare score.
  if (currentGame.wrongLog && currentGame.wrongLog.length > 0) {
    html += '<div class="end-review">';
    html += '<div class="end-review-title">Worth another look</div>';
    currentGame.wrongLog.slice(0, 5).forEach(function(w) {
      var q = w.question;
      var label = q.text ? q.text
        : (q.table != null && q.n != null) ? (q.table + ' × ' + q.n)
        : (q.dividend != null) ? (q.dividend + ' ÷ ' + q.divisor)
        : (q.a != null && q.b != null) ? (q.a + ' ? ' + q.b)
        : 'Question ' + (w.index + 1);
      html += '<div class="end-review-row">';
      html += '<div class="end-review-q">' + label + '</div>';
      html += '<div class="end-review-a">= ' + w.correct + '</div>';
      if (q.working) html += '<div class="end-review-w">' + q.working + '</div>';
      html += '</div>';
    });
    html += '</div>';
  }

  // Per-sub-skill breakdown, e.g. which times tables were shaky.
  if (currentGame.config && currentGame.config.tables && typeof subSkillMastery === 'function') {
    var rows = currentGame.config.tables.map(function(t) {
      return { t: t, m: subSkillMastery(currentGame.skillId, t) };
    }).filter(function(r) { return r.m !== null; });
    if (rows.length > 0) {
      rows.sort(function(a, b) { return a.m - b.m; });
      html += '<div class="end-sub">';
      html += '<div class="end-review-title">Where you stand</div>';
      rows.slice(0, 6).forEach(function(r) {
        html += '<div class="end-sub-row"><span class="end-sub-key">' + r.t + '×</span>' +
          '<span class="end-sub-bar"><span class="end-sub-fill" style="width:' + r.m + '%"></span></span>' +
          '<span class="end-sub-pct">' + r.m + '%</span></div>';
      });
      html += '</div>';
    }
  }

  var _cfgArg = currentGame.config ? ', ' + JSON.stringify(currentGame.config) : '';
  html += '<div style="display:flex;gap:12px;justify-content:center;margin-top:16px;flex-wrap:wrap">';
  html += '<button class="feedback-btn" onclick=\'startGame("' + currentGame.skillId + '","' + currentGame.worldType + '"' + _cfgArg + ')\' style="background:linear-gradient(135deg,var(--mint),var(--sky))">Play Again</button>';
  if (currentGame.worldType === 'math' && typeof skillHasDrill === 'function' && skillHasDrill(currentGame.skillId)) {
    html += '<button class="feedback-btn" onclick="openDrillSetup(\'' + currentGame.skillId + '\',\'math\')">Change Settings</button>';
  }
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
function generateQuestion(skillId, worldType, config) {
  if (worldType === 'math' && typeof generateMathQuestion === 'function') {
    return generateMathQuestion(skillId, config);
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
  if (worldType === 'malay' && typeof generateMalayQuestion === 'function') {
    return generateMalayQuestion(skillId);
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
