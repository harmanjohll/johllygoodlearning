// ============================================================
//  LEARN ENGINE — Visual step-by-step lesson renderer for P1
//  Renders structured lesson data into interactive visual pages
// ============================================================

// Lesson data format:
// {
//   title: 'Adding Numbers',
//   icon: '➕',
//   lumiSays: 'Let me show you how to add!',
//   steps: [
//     { visual: '🍎🍎🍎', text: 'We have 3 apples.', highlight: 'count' },
//     { visual: '🍎🍎',   text: 'And 2 more apples!', highlight: 'add' },
//     { visual: '🍎🍎🍎🍎🍎', text: '3 + 2 = 5 altogether!', highlight: 'result' },
//     { type: 'try', prompt: 'How many altogether?', visual: '⭐⭐ + ⭐⭐⭐', answer: '5' }
//   ]
// }

function renderLesson(container, lessonData, skillId, onComplete) {
  if (!lessonData || !lessonData.steps || lessonData.steps.length === 0) {
    container.innerHTML = '<div class="lesson-empty">No lesson available yet!</div>';
    return;
  }

  let currentStep = 0;
  const totalSteps = lessonData.steps.length;

  function renderStep() {
    const step = lessonData.steps[currentStep];
    container.innerHTML = '';
    container.style.animation = 'none';
    container.offsetHeight;
    container.style.animation = 'slide-up 0.4s ease-out';

    // Progress dots
    let dotsHtml = '<div class="lesson-dots">';
    for (let i = 0; i < totalSteps; i++) {
      const cls = i < currentStep ? 'done' : i === currentStep ? 'current' : '';
      dotsHtml += '<div class="lesson-dot ' + cls + '"></div>';
    }
    dotsHtml += '</div>';

    // Check if this is a "try it" interactive step
    if (step.type === 'try') {
      renderTryStep(container, step, dotsHtml);
      return;
    }

    // Check if this is a "sort" interactive step
    if (step.type === 'sort') {
      renderSortStep(container, step, dotsHtml);
      return;
    }

    // Check if this is a "match" interactive step
    if (step.type === 'match') {
      renderMatchStep(container, step, dotsHtml);
      return;
    }

    // Regular visual step
    let html = dotsHtml;

    // Visual area
    if (step.visual) {
      html += '<div class="lesson-visual ' + (step.highlight || '') + '">';
      html += step.visual;
      html += '</div>';
    }

    // Image (emoji-based illustration)
    if (step.image) {
      html += '<div class="lesson-image">' + step.image + '</div>';
    }

    // Text explanation
    if (step.text) {
      html += '<div class="lesson-text">' + step.text + '</div>';
    }

    // Lumi tip
    if (step.lumiTip) {
      html += '<div class="lesson-lumi-tip">';
      html += '<span class="lesson-lumi-icon">⭐</span>';
      html += '<span>' + step.lumiTip + '</span>';
      html += '</div>';
    }

    // Navigation
    html += '<div class="lesson-nav">';
    if (currentStep > 0) {
      html += '<button class="lesson-btn lesson-btn-back" id="lesson-prev">← Back</button>';
    }
    if (currentStep < totalSteps - 1) {
      html += '<button class="lesson-btn lesson-btn-next" id="lesson-next">Next →</button>';
    } else {
      html += '<button class="lesson-btn lesson-btn-done" id="lesson-done">Got it! ✓</button>';
    }
    html += '</div>';

    container.innerHTML = html;

    // Bind events
    const prevBtn = document.getElementById('lesson-prev');
    const nextBtn = document.getElementById('lesson-next');
    const doneBtn = document.getElementById('lesson-done');

    if (prevBtn) prevBtn.onclick = function() { currentStep--; renderStep(); };
    if (nextBtn) nextBtn.onclick = function() { currentStep++; renderStep(); };
    if (doneBtn) doneBtn.onclick = function() { completeLesson(); };
  }

  function renderTryStep(cont, step, dotsHtml) {
    let html = dotsHtml;
    html += '<div class="lesson-try-badge">Your Turn!</div>';

    if (step.visual) {
      html += '<div class="lesson-visual try">' + step.visual + '</div>';
    }

    if (step.prompt) {
      html += '<div class="lesson-text">' + step.prompt + '</div>';
    }

    if (step.options) {
      // MCQ try
      html += '<div class="lesson-try-options">';
      step.options.forEach(function(opt) {
        html += '<button class="lesson-try-btn" data-val="' + opt + '">' + opt + '</button>';
      });
      html += '</div>';
    } else {
      // Type-in try
      html += '<div class="lesson-try-input-wrap">';
      html += '<input type="text" class="lesson-try-input" id="lesson-try-answer" inputmode="numeric" autocomplete="off" placeholder="?">';
      html += '<button class="lesson-btn lesson-btn-next" id="lesson-try-check">Check ✓</button>';
      html += '</div>';
    }

    html += '<div class="lesson-try-feedback" id="lesson-try-fb"></div>';

    html += '<div class="lesson-nav">';
    if (currentStep > 0) {
      html += '<button class="lesson-btn lesson-btn-back" id="lesson-prev">← Back</button>';
    }
    html += '</div>';

    cont.innerHTML = html;

    // Bind option buttons
    cont.querySelectorAll('.lesson-try-btn').forEach(function(btn) {
      btn.onclick = function() {
        const val = btn.dataset.val;
        const correct = String(val).trim() === String(step.answer).trim();
        const fb = document.getElementById('lesson-try-fb');
        cont.querySelectorAll('.lesson-try-btn').forEach(function(b) { b.disabled = true; });

        if (correct) {
          btn.classList.add('correct');
          fb.innerHTML = '🎉 ' + (step.successMsg || 'That\'s right!');
          fb.className = 'lesson-try-feedback correct show';
          if (typeof playSound === 'function') playSound('correct');
        } else {
          btn.classList.add('wrong');
          fb.innerHTML = '💡 The answer is ' + step.answer + '. ' + (step.explanation || '');
          fb.className = 'lesson-try-feedback wrong show';
        }

        setTimeout(function() {
          if (currentStep < totalSteps - 1) {
            currentStep++;
            renderStep();
          } else {
            completeLesson();
          }
        }, correct ? 1200 : 2200);
      };
    });

    // Bind type-in check
    var checkBtn = document.getElementById('lesson-try-check');
    var ansInput = document.getElementById('lesson-try-answer');
    if (checkBtn && ansInput) {
      checkBtn.onclick = function() {
        var val = ansInput.value.trim();
        if (!val) return;
        var correct = val === String(step.answer).trim();
        var fb = document.getElementById('lesson-try-fb');
        ansInput.disabled = true;
        checkBtn.disabled = true;

        if (correct) {
          fb.innerHTML = '🎉 ' + (step.successMsg || 'That\'s right!');
          fb.className = 'lesson-try-feedback correct show';
          if (typeof playSound === 'function') playSound('correct');
        } else {
          fb.innerHTML = '💡 The answer is ' + step.answer + '. ' + (step.explanation || '');
          fb.className = 'lesson-try-feedback wrong show';
        }

        setTimeout(function() {
          if (currentStep < totalSteps - 1) {
            currentStep++;
            renderStep();
          } else {
            completeLesson();
          }
        }, correct ? 1200 : 2200);
      };
      ansInput.onkeydown = function(e) { if (e.key === 'Enter') checkBtn.click(); };
    }

    var prevBtn = document.getElementById('lesson-prev');
    if (prevBtn) prevBtn.onclick = function() { currentStep--; renderStep(); };
  }

  function renderSortStep(cont, step, dotsHtml) {
    // Sort items into categories by tapping
    var html = dotsHtml;
    html += '<div class="lesson-try-badge">Sort These!</div>';
    if (step.text) html += '<div class="lesson-text">' + step.text + '</div>';

    var categories = step.categories; // [{name, items, color}]
    var allItems = [];
    categories.forEach(function(cat) {
      cat.items.forEach(function(item) {
        allItems.push({ item: item, category: cat.name });
      });
    });
    allItems = shuffle(allItems);

    html += '<div class="lesson-sort-items" id="sort-items">';
    allItems.forEach(function(entry, i) {
      html += '<span class="lesson-sort-chip" data-idx="' + i + '" data-cat="' + entry.category + '">' + entry.item + '</span>';
    });
    html += '</div>';

    html += '<div class="lesson-sort-zones">';
    categories.forEach(function(cat) {
      html += '<div class="lesson-sort-zone" data-zone="' + cat.name + '">';
      html += '<div class="lesson-sort-zone-label">' + cat.name + '</div>';
      html += '<div class="lesson-sort-zone-items" id="zone-' + cat.name.replace(/\s/g, '') + '"></div>';
      html += '</div>';
    });
    html += '</div>';

    html += '<div class="lesson-try-feedback" id="lesson-try-fb"></div>';
    html += '<div class="lesson-nav">';
    if (currentStep > 0) html += '<button class="lesson-btn lesson-btn-back" id="lesson-prev">← Back</button>';
    html += '</div>';

    cont.innerHTML = html;

    var selected = null;
    var sorted = 0;
    var total = allItems.length;

    cont.querySelectorAll('.lesson-sort-chip').forEach(function(chip) {
      chip.onclick = function() {
        cont.querySelectorAll('.lesson-sort-chip').forEach(function(c) { c.classList.remove('selected'); });
        chip.classList.add('selected');
        selected = chip;
      };
    });

    cont.querySelectorAll('.lesson-sort-zone').forEach(function(zone) {
      zone.onclick = function() {
        if (!selected) return;
        var correctCat = selected.dataset.cat;
        var zoneCat = zone.dataset.zone;
        if (correctCat === zoneCat) {
          zone.querySelector('.lesson-sort-zone-items').appendChild(selected);
          selected.classList.remove('selected');
          selected.classList.add('placed');
          selected.onclick = null;
          selected = null;
          sorted++;
          if (sorted >= total) {
            var fb = document.getElementById('lesson-try-fb');
            fb.innerHTML = '🎉 Great sorting!';
            fb.className = 'lesson-try-feedback correct show';
            if (typeof playSound === 'function') playSound('correct');
            setTimeout(function() {
              if (currentStep < totalSteps - 1) { currentStep++; renderStep(); }
              else completeLesson();
            }, 1500);
          }
        } else {
          selected.classList.add('shake');
          setTimeout(function() { selected.classList.remove('shake'); }, 500);
        }
      };
    });

    var prevBtn = document.getElementById('lesson-prev');
    if (prevBtn) prevBtn.onclick = function() { currentStep--; renderStep(); };
  }

  function renderMatchStep(cont, step, dotsHtml) {
    // Match pairs by tapping two items
    var html = dotsHtml;
    html += '<div class="lesson-try-badge">Match the Pairs!</div>';
    if (step.text) html += '<div class="lesson-text">' + step.text + '</div>';

    var pairs = step.pairs; // [{left, right}]
    var leftItems = shuffle(pairs.map(function(p) { return p.left; }));
    var rightItems = shuffle(pairs.map(function(p) { return p.right; }));

    html += '<div class="lesson-match-grid">';
    html += '<div class="lesson-match-col">';
    leftItems.forEach(function(item, i) {
      html += '<div class="lesson-match-item left" data-val="' + item + '">' + item + '</div>';
    });
    html += '</div>';
    html += '<div class="lesson-match-col">';
    rightItems.forEach(function(item, i) {
      html += '<div class="lesson-match-item right" data-val="' + item + '">' + item + '</div>';
    });
    html += '</div>';
    html += '</div>';

    html += '<div class="lesson-try-feedback" id="lesson-try-fb"></div>';
    html += '<div class="lesson-nav">';
    if (currentStep > 0) html += '<button class="lesson-btn lesson-btn-back" id="lesson-prev">← Back</button>';
    html += '</div>';

    cont.innerHTML = html;

    var pairMap = {};
    pairs.forEach(function(p) { pairMap[p.left] = p.right; });

    var selectedLeft = null;
    var matched = 0;

    cont.querySelectorAll('.lesson-match-item.left').forEach(function(item) {
      item.onclick = function() {
        cont.querySelectorAll('.lesson-match-item.left').forEach(function(i) { i.classList.remove('selected'); });
        item.classList.add('selected');
        selectedLeft = item.dataset.val;
      };
    });

    cont.querySelectorAll('.lesson-match-item.right').forEach(function(item) {
      item.onclick = function() {
        if (!selectedLeft) return;
        if (pairMap[selectedLeft] === item.dataset.val) {
          // Correct match
          item.classList.add('matched');
          cont.querySelector('.lesson-match-item.left[data-val="' + selectedLeft + '"]').classList.add('matched');
          cont.querySelector('.lesson-match-item.left[data-val="' + selectedLeft + '"]').classList.remove('selected');
          cont.querySelector('.lesson-match-item.left[data-val="' + selectedLeft + '"]').onclick = null;
          item.onclick = null;
          selectedLeft = null;
          matched++;
          if (matched >= pairs.length) {
            var fb = document.getElementById('lesson-try-fb');
            fb.innerHTML = '🎉 All matched!';
            fb.className = 'lesson-try-feedback correct show';
            if (typeof playSound === 'function') playSound('correct');
            setTimeout(function() {
              if (currentStep < totalSteps - 1) { currentStep++; renderStep(); }
              else completeLesson();
            }, 1500);
          }
        } else {
          item.classList.add('shake');
          setTimeout(function() { item.classList.remove('shake'); }, 500);
        }
      };
    });

    var prevBtn = document.getElementById('lesson-prev');
    if (prevBtn) prevBtn.onclick = function() { currentStep--; renderStep(); };
  }

  function completeLesson() {
    // Mark lesson as viewed in skill state
    var skill = getSkillState(skillId);
    if (!skill.lessonViewed) skill.lessonViewed = {};
    skill.lessonViewed[skillId] = Date.now();
    saveState();

    container.innerHTML = '<div class="lesson-complete">' +
      '<div class="lesson-complete-icon">🌟</div>' +
      '<div class="lesson-complete-title">Lesson Complete!</div>' +
      '<div class="lesson-complete-msg">Great learning, ' + (state.name || 'Anastasia') + '!</div>' +
      '<button class="lesson-btn lesson-btn-done" id="lesson-finish">Continue →</button>' +
      '</div>';

    if (typeof playSound === 'function') playSound('levelup');

    document.getElementById('lesson-finish').onclick = function() {
      if (typeof onComplete === 'function') onComplete();
    };
  }

  // Start
  renderStep();
}
