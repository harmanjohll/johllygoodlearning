// ============================================================
//  FEEDBACK — Correct/wrong overlays, particles, answer checking
// ============================================================

// === PARTICLES ===
function spawnParticles(x, y, count, emoji) {
  for (let i = 0; i < count; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    p.textContent = emoji || '\u2B50';
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

  spawnParticles(window.innerWidth / 2, window.innerHeight / 3, 8, '\u2B50');

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
    if (typeof spawnParticles === 'function') spawnParticles(window.innerWidth / 2, window.innerHeight / 3, 5, '\uD83D\uDEE1\uFE0F');
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
function showFeedback(correct, tokens, isStory, showMeta, correctAnswer) {
  const overlay = document.getElementById('feedback-overlay');
  const card = document.getElementById('feedback-card');

  let html = '';
  if (correct) {
    html += '<div class="feedback-icon">\uD83C\uDF89</div>';
    html += '<div class="feedback-title" style="color:var(--success)">' + pick(ENCOURAGEMENTS) + '</div>';
    if (isStory) {
      html += '<div class="feedback-message">Beautiful story, Anastasia! Your imagination is incredible!</div>';
    }
    html += '<div class="feedback-tokens">+' + tokens + ' \u2B50</div>';
    if (state.streak >= 3) {
      html += '<div class="feedback-message" style="color:var(--coral)">\uD83D\uDD25 ' + state.streak + ' in a row!</div>';
    }
    if (showMeta) {
      html += '<div class="feedback-reflect">\uD83E\uDD14 ' + pick(METACOGNITIVE_PROMPTS) + '</div>';
    }
  } else {
    html += '<div class="feedback-icon">\uD83E\uDD14</div>';
    html += '<div class="feedback-title" style="color:var(--warning)">' + pick(TRY_AGAINS) + '</div>';
    if (correctAnswer !== undefined) {
      html += '<div class="feedback-message">The answer was: <strong style="color:var(--gold);font-size:20px">' + correctAnswer + '</strong></div>';
    }
    html += '<div class="feedback-message" style="font-size:14px">Mistakes are how your brain grows stronger! \uD83D\uDCAA</div>';
  }

  html += '<button class="feedback-btn" onclick="nextQuestion()">Continue \u2192</button>';
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
  // the button and could inject markup \u2014 a real risk now that hints can
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
         '" onclick="showHint(this)">\uD83D\uDCA1 Need a hint?</button></div>';
}

function showHint(btn, text) {
  if (currentGame.hintShown) return;
  currentGame.hintShown = true;
  // Text now travels on the button's data attribute; the second
  // argument is kept so any older call sites still work.
  const hint = (btn && btn.dataset && btn.dataset.hint) || text || '';
  const hintDiv = document.createElement('div');
  hintDiv.className = 'hint-text';
  hintDiv.textContent = '\uD83D\uDCA1 ' + hint;   // textContent, so never parsed as HTML
  btn.parentElement.replaceWith(hintDiv);
  playSound('click');
}
