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

  // Daily quest
  const today = new Date().toDateString();
  if (state.dailyQuest.date === today) {
    state.dailyQuest.completed++;
  }

  spawnParticles(window.innerWidth / 2, window.innerHeight / 3, 8, '\u2B50');

  const showMeta = Math.random() < 0.3;
  showFeedback(true, tokens, isStory, showMeta);

  updateUI();
  saveState();
}

function handleWrong(correct) {
  playSound('wrong');
  state.streak = 0;
  state.totalAttempts++;
  currentGame.results[currentGame.currentIndex] = false;
  currentGame.attempts++;

  updateSkillState(currentGame.skillId, false, currentGame.currentConfidence);

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
  const escaped = hintText.replace(/'/g, "\\'");
  return '<div class="mt-2"><button class="hint-btn" onclick="showHint(this, \'' + escaped + '\')">\uD83D\uDCA1 Need a hint?</button></div>';
}

function showHint(btn, text) {
  if (currentGame.hintShown) return;
  currentGame.hintShown = true;
  const hintDiv = document.createElement('div');
  hintDiv.className = 'hint-text';
  hintDiv.textContent = '\uD83D\uDCA1 ' + text;
  btn.parentElement.replaceWith(hintDiv);
  playSound('click');
}
