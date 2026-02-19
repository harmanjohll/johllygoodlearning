// ============================================================
//  STAR TRIALS — Multi-skill challenge assessments
// ============================================================

var STAR_TRIALS = [
  {
    id: 'trial-math-p1',
    name: 'Math Foundations Trial',
    icon: '\u2795',
    desc: 'Prove your P1 Math mastery!',
    skills: ['count','add','sub','cmp'],
    questionsPerSkill: 2,
    unlockFlowers: 3,
    reward: 30
  },
  {
    id: 'trial-math-p2',
    name: 'Math Explorer Trial',
    icon: '\u2716\uFE0F',
    desc: 'Take on P2 multiplication and more!',
    skills: ['mul','div','frac1','money'],
    questionsPerSkill: 2,
    unlockFlowers: 8,
    reward: 50
  },
  {
    id: 'trial-word-p1',
    name: 'Word Foundations Trial',
    icon: '\uD83D\uDD24',
    desc: 'Show your phonics and spelling skills!',
    skills: ['phonics','sight','spell'],
    questionsPerSkill: 3,
    unlockFlowers: 3,
    reward: 30
  },
  {
    id: 'trial-word-p2',
    name: 'Word Explorer Trial',
    icon: '\uD83D\uDCDA',
    desc: 'Grammar, vocabulary, and reading!',
    skills: ['grammar','vocab','comprehension'],
    questionsPerSkill: 2,
    unlockFlowers: 8,
    reward: 50
  },
  {
    id: 'trial-stem',
    name: 'STEM Challenger Trial',
    icon: '\uD83E\uDDEA',
    desc: 'Science and coding combined!',
    skills: ['living','material','cseq','cloop'],
    questionsPerSkill: 2,
    unlockFlowers: 6,
    reward: 50
  },
  {
    id: 'trial-ultimate',
    name: 'Ultimate Star Trial',
    icon: '\uD83C\uDFC6',
    desc: 'The ultimate test across all worlds!',
    skills: ['add','mul','vocab','comprehension','living','cseq'],
    questionsPerSkill: 2,
    unlockFlowers: 15,
    reward: 100
  }
];

// Render trial cards for the home screen challenges section
function renderStarTrialCards(flowerCount) {
  var html = '';
  STAR_TRIALS.forEach(function(trial) {
    var unlocked = flowerCount >= trial.unlockFlowers;
    var completed = state.starTrials && state.starTrials[trial.id];
    var bestScore = completed ? state.starTrials[trial.id].best : 0;

    html += '<div class="activity-card ' + (unlocked ? '' : 'locked') + '" ' +
      (unlocked ? 'onclick="startStarTrial(\'' + trial.id + '\')"' : '') + '>';
    html += '<span class="activity-card-icon">' + trial.icon + '</span>';
    html += '<div class="activity-card-name">' + trial.name + '</div>';
    if (unlocked) {
      if (completed) {
        html += '<div class="activity-card-level" style="color:var(--gold)">Best: ' + bestScore + '%</div>';
      } else {
        html += '<div class="activity-card-level">' + trial.desc + '</div>';
      }
      html += '<div style="font-size:12px;color:var(--mint)">Reward: ' + trial.reward + ' \u2B50</div>';
    } else {
      html += '<div class="activity-card-level">\uD83D\uDD12 ' + trial.unlockFlowers + ' flowers needed</div>';
    }
    html += '</div>';
  });
  return html;
}

// Start a Star Trial
function startStarTrial(trialId) {
  var trial = STAR_TRIALS.find(function(t) { return t.id === trialId; });
  if (!trial) return;

  playSound('click');

  // Generate questions across all skills
  var questions = [];
  trial.skills.forEach(function(skillId) {
    for (var i = 0; i < trial.questionsPerSkill; i++) {
      // Determine world type
      var worldType = 'math';
      if (typeof WORD_TREE !== 'undefined' && WORD_TREE[skillId]) worldType = 'word';
      if (typeof STEM_TREE !== 'undefined' && STEM_TREE[skillId]) worldType = 'stem';

      var q = generateQuestion(skillId, worldType);
      q._trialSkillId = skillId;
      q._trialWorldType = worldType;
      questions.push(q);
    }
  });

  questions = shuffle(questions);

  // Use the standard game engine
  currentGame = {
    skillId: trial.skills[0],
    worldType: 'math',
    questions: questions,
    currentIndex: 0,
    totalQuestions: questions.length,
    results: [],
    currentConfidence: -1,
    hintShown: false,
    attempts: 0,
    isStarTrial: true,
    trialId: trialId,
    trialReward: trial.reward
  };

  document.getElementById('game-title').textContent = trial.icon + ' ' + trial.name;
  showScreen('game');
  renderGameDots();
  renderCurrentQuestion();
}

// Override endGame to handle Star Trial completion (called from navigation.js)
var _originalEndGame = typeof endGame === 'function' ? endGame : null;

function endGameWithTrialCheck() {
  if (currentGame.isStarTrial) {
    endStarTrial();
  } else if (_originalEndGame) {
    _originalEndGame();
  }
}

function endStarTrial() {
  var correct = currentGame.results.filter(function(r) { return r; }).length;
  var total = currentGame.results.length;
  var pct = Math.round(correct / total * 100);

  if (!state.starTrials) state.starTrials = {};
  var prev = state.starTrials[currentGame.trialId];

  if (!prev || pct > prev.best) {
    state.starTrials[currentGame.trialId] = { best: pct, date: Date.now() };
  }

  // Award tokens for first-time or new record
  if (pct >= 70) {
    var bonus = (!prev) ? currentGame.trialReward : (pct > (prev ? prev.best : 0) ? Math.round(currentGame.trialReward / 2) : 0);
    state.tokens += bonus;
  }

  state.sessionsCompleted++;

  var overlay = document.getElementById('feedback-overlay');
  var card = document.getElementById('feedback-card');

  var html = '';
  if (pct >= 80) {
    html += '<div class="feedback-icon">\uD83C\uDFC6</div>';
    html += '<div class="feedback-title" style="color:var(--gold)">Star Trial Complete!</div>';
    playSound('levelup');
    spawnParticles(window.innerWidth / 2, window.innerHeight / 3, 20, '\u2B50');
  } else if (pct >= 50) {
    html += '<div class="feedback-icon">\uD83C\uDF1F</div>';
    html += '<div class="feedback-title" style="color:var(--mint)">Good effort!</div>';
  } else {
    html += '<div class="feedback-icon">\uD83C\uDF31</div>';
    html += '<div class="feedback-title" style="color:var(--lavender)">Keep practising!</div>';
  }

  html += '<div class="feedback-message">' + correct + ' out of ' + total + ' correct (' + pct + '%)</div>';

  if (pct >= 70 && currentGame.trialReward > 0) {
    html += '<div class="feedback-tokens">\u2B50 +' + currentGame.trialReward + ' stars!</div>';
  }

  html += '<div style="display:flex;gap:12px;justify-content:center;margin-top:16px">';
  html += '<button class="feedback-btn" onclick="startStarTrial(\'' + currentGame.trialId + '\')" style="background:linear-gradient(135deg,var(--mint),var(--sky))">Try Again</button>';
  html += '<button class="feedback-btn" onclick="document.getElementById(\'feedback-overlay\').classList.add(\'hidden\');showScreen(\'home\')">Home</button>';
  html += '</div>';

  card.innerHTML = html;
  overlay.classList.remove('hidden');
  saveState();
}
