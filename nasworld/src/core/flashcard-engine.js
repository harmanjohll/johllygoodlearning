// ============================================================
//  FLASHCARD ENGINE — Flip-card system with tracking
//  Supports sight words, math facts, vocab, science terms
// ============================================================

// Flashcard data format:
// [{ front: 'the', back: 'a common sight word', category: 'sight-l1', image: '📖' }]

function renderFlashcards(container, cards, skillId, onComplete) {
  if (!cards || cards.length === 0) {
    container.innerHTML = '<div class="lesson-empty">No flashcards available yet!</div>';
    return;
  }

  var deck = shuffle([...cards]);
  var idx = 0;
  var correct = 0;
  var total = deck.length;
  var isFlipped = false;

  function renderCard() {
    if (idx >= total) {
      showResults();
      return;
    }

    isFlipped = false;
    var card = deck[idx];
    container.innerHTML = '';
    container.style.animation = 'none';
    container.offsetHeight;
    container.style.animation = 'slide-up 0.3s ease-out';

    var html = '';

    // Progress
    html += '<div class="fc-progress">';
    html += '<span class="fc-count">' + (idx + 1) + ' / ' + total + '</span>';
    html += '<div class="fc-bar"><div class="fc-bar-fill" style="width:' + Math.round((idx / total) * 100) + '%"></div></div>';
    html += '</div>';

    // The card
    html += '<div class="fc-card" id="fc-card">';
    html += '<div class="fc-front">';
    if (card.image) html += '<div class="fc-image">' + card.image + '</div>';
    html += '<div class="fc-front-text">' + card.front + '</div>';
    html += '<div class="fc-tap-hint">Tap to reveal</div>';
    html += '</div>';
    html += '<div class="fc-back">';
    html += '<div class="fc-back-text">' + card.back + '</div>';
    if (card.example) html += '<div class="fc-example">' + card.example + '</div>';
    html += '</div>';
    html += '</div>';

    // Rating buttons (shown after flip)
    html += '<div class="fc-rating hidden" id="fc-rating">';
    html += '<div class="fc-rating-label">Did you know it?</div>';
    html += '<div class="fc-rating-btns">';
    html += '<button class="fc-rate-btn fc-rate-no" id="fc-no">Not yet 🤔</button>';
    html += '<button class="fc-rate-btn fc-rate-yes" id="fc-yes">Got it! ⭐</button>';
    html += '</div>';
    html += '</div>';

    container.innerHTML = html;

    // Bind flip
    document.getElementById('fc-card').onclick = function() {
      if (isFlipped) return;
      isFlipped = true;
      this.classList.add('flipped');
      document.getElementById('fc-rating').classList.remove('hidden');
    };

    // Bind rating
    document.getElementById('fc-yes').onclick = function() {
      correct++;
      recordFlashcard(skillId, deck[idx], true);
      idx++;
      renderCard();
    };
    document.getElementById('fc-no').onclick = function() {
      recordFlashcard(skillId, deck[idx], false);
      // Put it back near the end for another try
      if (total - idx > 2) {
        var missed = deck[idx];
        deck.splice(idx, 1);
        var insertAt = Math.min(idx + 3 + Math.floor(Math.random() * 3), deck.length);
        deck.splice(insertAt, 0, missed);
        total = deck.length;
      } else {
        idx++;
      }
      renderCard();
    };
  }

  function recordFlashcard(sid, card, wasCorrect) {
    var skill = getSkillState(sid);
    if (!skill.flashcardProgress) skill.flashcardProgress = {};
    var key = card.front;
    if (!skill.flashcardProgress[key]) {
      skill.flashcardProgress[key] = { correct: 0, attempts: 0, lastSeen: 0 };
    }
    skill.flashcardProgress[key].attempts++;
    if (wasCorrect) skill.flashcardProgress[key].correct++;
    skill.flashcardProgress[key].lastSeen = Date.now();
    saveState();
  }

  function showResults() {
    var pct = Math.round((correct / cards.length) * 100);
    var icon = pct >= 80 ? '🏆' : pct >= 50 ? '⭐' : '📚';
    var msg = pct >= 80 ? 'Amazing recall!' : pct >= 50 ? 'Good progress!' : 'Keep practising!';

    container.innerHTML = '<div class="fc-results">' +
      '<div class="fc-results-icon">' + icon + '</div>' +
      '<div class="fc-results-title">' + correct + ' / ' + cards.length + ' cards mastered</div>' +
      '<div class="fc-results-pct">' + pct + '%</div>' +
      '<div class="fc-results-msg">' + msg + '</div>' +
      '<div class="fc-results-btns">' +
        '<button class="lesson-btn lesson-btn-next" id="fc-retry">Try Again</button>' +
        '<button class="lesson-btn lesson-btn-done" id="fc-done">Continue →</button>' +
      '</div>' +
    '</div>';

    document.getElementById('fc-retry').onclick = function() {
      idx = 0; correct = 0; deck = shuffle([...cards]); total = deck.length;
      renderCard();
    };
    document.getElementById('fc-done').onclick = function() {
      if (typeof onComplete === 'function') onComplete();
    };
  }

  renderCard();
}
