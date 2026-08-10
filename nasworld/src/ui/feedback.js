// ============================================================
//  FEEDBACK — Correct/wrong overlays, particles, answer checking
// ============================================================

// === PARTICLES ===
function spawnParticles(x, y, count, emoji) {
  for (let i = 0; i < count; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    p.textContent = emoji || '⭐';
    p.style.left = (x + (Math.random() - 0.5) * 60) + 'px';
    p.style.top = (y + (Math.random() - 0.5) * 30) + 'px';
    p.style.fontSize = (16 + Math.random() * 16) + 'px';
    p.style.animationDuration = (0.6 + Math.random() * 0.6) + 's';
    document.body.appendChild(p);
    setTimeout(() => p.remove(), 1200);
  }
}

// === ANSWER CHECKING ===
function checkAnswer(given, correct, btnEl) {
  if (btnEl && btnEl.dataset.checked) return;
  const allBtns = btnEl?.parentElement?.querySelectorAll('.answer-btn') || [];
  allBtns.forEach(b => b.dataset.checked = 'true');

  const isCorrect = String(given) === String(correct);

  if (isCorrect) {
    if (btnEl) btnEl.classList.add('correct');
    handleCorrect();
  } else {
    if (btnEl) btnEl.classList.add('wrong');
    allBtns.forEach(b => {
      if (b.textContent.trim() == correct || b.textContent.includes(correct + ' ')) {
        setTimeout(() => b.classList.add('correct'), 500);
      }
    });
    handleWrong(correct);
  }
}

function submitTextAnswer(correct) {
  const input = document.getElementById('answer-input');
  if (!input) return;
  const val = parseInt(input.value);
  if (isNaN(val)) return;
  if (val === correct) {
    input.style.borderColor = 'var(--success)';
    handleCorrect();
  } else {
    input.style.borderColor = 'var(--error)';
    input.style.animation = 'shake-wrong 0.5s';
    handleWrong(correct);
  }
}

function submitSpelling(correct) {
  const input = document.getElementById('answer-input');
  if (!input) return;
  const val = input.value.trim().toLowerCase();
  if (!val) return;
  if (val === correct.toLowerCase()) {
    handleCorrect();
  } else {
    handleWrong(correct);
  }
}

// === CORRECT / WRONG HANDLERS ===
function handleCorrect(isStory) {
  playSound('correct');
  const tokens = currentGame.hintShown ? 2 : (currentGame.attempts === 0 ? 5 : 3);
  state.tokens += tokens;
  state.streak++;
  if (state.streak > state.bestStreak) state.bestStreak = state.streak;
  state.totalCorrect++;
  state.totalAttempts++;
  currentGame.results[currentGame.currentIndex] = true;

  updateSkillState(currentGame.skillId, true, currentGame.currentConfidence);

  // Sub-skill tracking — this is what makes "your 8 times table is
  // shaky" possible, rather than just "multiplication is shaky".
  const _q = currentGame.questions && currentGame.questions[currentGame.currentIndex];
  if (_q && _q.subKey && typeof recordSubSkill === 'function') {
    recordSubSkill(currentGame.skillId, _q.subKey, true, Date.now() - (currentGame._questionStart || Date.now()));
  }

  // Daily quest (legacy counter)
  const today = new Date().toDateString();
  if (state.dailyQuest.date === today) {
    state.dailyQuest.completed++;
  }

  // Dynamic quest tracking
  if (typeof questRecordQuiz === 'function') {
    questRecordQuiz(currentGame.worldType);
  }
  if (typeof questRecordSkillPlayed === 'function') {
    questRecordSkillPlayed(currentGame.skillId);
  }

  spawnParticles(window.innerWidth / 2, window.innerHeight / 3, 8, '⭐');

  const showMeta = Math.random() < 0.3;
  showFeedback(true, tokens, isStory, showMeta);

  // Achievement checks
  if (typeof checkAchievementsAfterAnswer === 'function') checkAchievementsAfterAnswer();
  if (typeof checkAchievementsAfterMastery === 'function') checkAchievementsAfterMastery();
  if (typeof checkAchievementsAfterGarden === 'function') checkAchievementsAfterGarden();

  // Surprise event modifiers (lucky streak, golden question)
  if (typeof applySurpriseModifiers === 'function') applySurpriseModifiers();

  // Roll for surprise event
  if (typeof rollForSurprise === 'function') rollForSurprise();

  // Milestone celebrations (50, 100, 250... correct)
  if (typeof checkMilestoneCelebration === 'function') checkMilestoneCelebration();

  // Lumi reacts
  if (typeof lumiReactTo === 'function') lumiReactTo('correct');

  updateUI();
  saveState();
}

function handleWrong(correct) {
  playSound('wrong');

  // Streak shield from mystery box
  if (typeof applyStreakShield === 'function' && applyStreakShield()) {
    // Shield used — streak preserved!
    if (typeof lumiSay === 'function') lumiSay('Streak shield activated! Your streak is safe!');
    if (typeof spawnParticles === 'function') spawnParticles(window.innerWidth / 2, window.innerHeight / 3, 5, '🛡️');
  } else {
    state.streak = 0;
  }
  state.totalAttempts++;
  currentGame.results[currentGame.currentIndex] = false;
  currentGame.attempts++;

  updateSkillState(currentGame.skillId, false, currentGame.currentConfidence);

  const _wq = currentGame.questions && currentGame.questions[currentGame.currentIndex];
  if (_wq && _wq.subKey && typeof recordSubSkill === 'function') {
    recordSubSkill(currentGame.skillId, _wq.subKey, false, Date.now() - (currentGame._questionStart || Date.now()));
  }

  // Keep a log so the end-of-session screen can show exactly what
  // tripped her up, instead of a bare score.
  if (_wq && currentGame.wrongLog) {
    currentGame.wrongLog.push({
      index: currentGame.currentIndex,
      question: _wq,
      given: undefined,
      correct: correct
    });
  }

  setTimeout(() => {
    showFeedback(false, 0, false, false, correct);
  }, 600);

  updateUI();
  saveState();
}

// === FEEDBACK OVERLAY ===
// ============================================================
//  PER-QUESTION FEEDBACK
//
//  This used to throw a full-screen overlay after EVERY answer, with
//  a "Continue" button to dismiss. On a twenty-question drill that is
//  twenty interruptions, and it destroys any sense of flow - the
//  child spends as long dismissing dialogs as answering.
//
//  Now: a slim bar under the question, and the quiz moves on by
//  itself. Correct answers barely pause. Wrong answers pause longer,
//  because she genuinely needs a moment to read what the answer was,
//  and can tap to move on sooner.
//
//  The big overlay is kept for the end of a session, which is a real
//  stopping point rather than an interruption.
// ============================================================

var FEEDBACK_PACE = { correctMs: 700, wrongMs: 2600 };

function showFeedback(correct, tokens, isStory, showMeta, correctAnswer) {
  // Respect an explicit preference for the old tap-to-continue style.
  var manual = state.preferences && state.preferences.manualAdvance;
  if (!manual) {
    showInlineFeedback(correct, tokens, correctAnswer, isStory);
    return;
  }
  showOverlayFeedback(correct, tokens, isStory, showMeta, correctAnswer);
}

/** Slim inline bar + automatic advance. The default. */
function showInlineFeedback(correct, tokens, correctAnswer, isStory) {
  var card = document.getElementById('question-card');
  if (!card) { nextQuestion(); return; }

  // Guard against advancing twice (timer firing after a manual tap).
  if (currentGame) currentGame._advancing = true;

  var old = document.getElementById('inline-fb');
  if (old) old.remove();

  var bar = document.createElement('div');
  bar.id = 'inline-fb';
  bar.className = 'inline-fb ' + (correct ? 'good' : 'oops');

  var html = '';
  if (correct) {
    html += '<span class="ifb-icon">✓</span>';
    html += '<span class="ifb-text">' + pick(ENCOURAGEMENTS) + '</span>';
    html += '<span class="ifb-stars">+' + tokens + ' ⭐</span>';
    if (state.streak >= 3) html += '<span class="ifb-streak">🔥 ' + state.streak + '</span>';
  } else {
    html += '<span class="ifb-icon">→</span>';
    html += '<span class="ifb-text">The answer was <b>' + correctAnswer + '</b></span>';
    html += '<span class="ifb-skip">tap to carry on</span>';
  }
  bar.innerHTML = html;
  card.appendChild(bar);

  if (isStory && typeof lumiSay === 'function') {
    lumiSay('Beautiful story, Anastasia. Your imagination is something else.');
  }

  var delay = correct ? FEEDBACK_PACE.correctMs : FEEDBACK_PACE.wrongMs;
  var advanced = false;
  function go() {
    if (advanced) return;
    advanced = true;
    clearTimeout(t);
    document.removeEventListener('pointerdown', onTap, true);
    var b = document.getElementById('inline-fb');
    if (b) b.remove();
    if (currentGame) currentGame._advancing = false;
    nextQuestion();
  }
  // A wrong answer waits for her; tapping anywhere moves on early.
  function onTap() { if (!correct) go(); }
  var t = setTimeout(go, delay);
  if (!correct) {
    setTimeout(function () { document.addEventListener('pointerdown', onTap, true); }, 350);
  }
}

/** The original full-screen version, kept behind a preference. */
function showOverlayFeedback(correct, tokens, isStory, showMeta, correctAnswer) {
  const overlay = document.getElementById('feedback-overlay');
  const card = document.getElementById('feedback-card');

  let html = '';
  if (correct) {
    html += '<div class="feedback-icon">🎉</div>';
    html += '<div class="feedback-title" style="color:var(--success)">' + pick(ENCOURAGEMENTS) + '</div>';
    if (isStory) {
      html += '<div class="feedback-message">Beautiful story, Anastasia! Your imagination is incredible!</div>';
    }
    html += '<div class="feedback-tokens">+' + tokens + ' ⭐</div>';
    if (state.streak >= 3) {
      html += '<div class="feedback-message" style="color:var(--coral)">🔥 ' + state.streak + ' in a row!</div>';
    }
    if (showMeta) {
      html += '<div class="feedback-reflect">🤔 ' + pick(METACOGNITIVE_PROMPTS) + '</div>';
    }
  } else {
    html += '<div class="feedback-icon">🤔</div>';
    html += '<div class="feedback-title" style="color:var(--warning)">' + pick(TRY_AGAINS) + '</div>';
    if (correctAnswer !== undefined) {
      html += '<div class="feedback-message">The answer was: <strong style="color:var(--gold);font-size:20px">' + correctAnswer + '</strong></div>';
    }
    html += '<div class="feedback-message" style="font-size:14px">Mistakes are how your brain grows stronger! 💪</div>';
  }

  html += '<button class="feedback-btn" onclick="nextQuestion()">Continue →</button>';
  card.innerHTML = html;
  overlay.classList.remove('hidden');
}

function closeFeedback(e) {
  if (e.target === document.getElementById('feedback-overlay')) {
    nextQuestion();
  }
}

// === HINT SYSTEM ===
function renderHintBtn(hintText) {
  // The hint used to be interpolated into an onclick="" attribute with
  // only single quotes escaped. Any hint containing a double quote broke
  // the button and could inject markup — a real risk now that hints can
  // come from an AI model. Carry it in a data attribute instead, HTML
  // escaped, and read it back with dataset.
  if (!hintText) return '';
  const esc = String(hintText)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
  return '<div class="mt-2"><button class="hint-btn" data-hint="' + esc +
         '" onclick="showHint(this)">💡 Need a hint?</button></div>';
}

function showHint(btn, text) {
  if (currentGame.hintShown) return;
  currentGame.hintShown = true;
  // Text now travels on the button's data attribute; the second
  // argument is kept so any older call sites still work.
  const hint = (btn && btn.dataset && btn.dataset.hint) || text || '';
  const hintDiv = document.createElement('div');
  hintDiv.className = 'hint-text';
  hintDiv.textContent = '💡 ' + hint;   // textContent, so never parsed as HTML
  btn.parentElement.replaceWith(hintDiv);
  playSound('click');
}
