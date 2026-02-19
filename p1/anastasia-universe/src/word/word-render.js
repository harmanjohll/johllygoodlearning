// ============================================================
//  WORD RENDER — Interactive renderers for all word question types
// ============================================================

function renderWordQuestion(card, q) {
  switch (q.type) {
    case 'phonics-family':    renderPhonicsFamily(card, q); return true;
    case 'phonics-initial':   renderPhonicsInitial(card, q); return true;
    case 'sight-pick':        renderSightPick(card, q); return true;
    case 'sight-flash':       renderSightFlash(card, q); return true;
    case 'spell-missing':     renderSpellMissing(card, q); return true;
    case 'spell-full':        renderSpellFull(card, q); return true;
    case 'grammar-mcq':       renderGrammarMCQ(card, q); return true;
    case 'vocab-meaning':     renderVocabMeaning(card, q); return true;
    case 'vocab-word':        renderVocabWord(card, q); return true;
    case 'sentence-build':    renderSentenceBuild(card, q); return true;
    case 'comprehension-mcq': renderComprehensionMCQ(card, q); return true;
    case 'poetry-rhyme':      renderPoetryRhyme(card, q); return true;
    case 'poetry-syllable':   renderPoetySyllable(card, q); return true;
    case 'poetry-couplet':    renderPoetryCouplet(card, q); return true;
    case 'story-write':       renderStoryWrite(card, q); return true;
    case 'paragraph-write':   renderParagraphWrite(card, q); return true;
    default: return false;
  }
}

// ===================== P1 RENDERERS =====================

function renderPhonicsFamily(card, q) {
  var html = '<div class="question-text">Which word belongs to the <strong>-' + q.family + '</strong> family?</div>';
  html += '<div style="font-size:48px;margin:12px 0;letter-spacing:4px;color:var(--gold)">-' + q.family + '</div>';
  html += '<div class="answer-options">' + q.options.map(function(o) {
    return '<button class="answer-btn" onclick="checkAnswer(\'' + o + '\', \'' + q.answer + '\', this)" style="font-size:22px;letter-spacing:2px">' + o + '</button>';
  }).join('') + '</div>';
  html += renderHintBtn(q.hint);
  card.innerHTML = html;
}

function renderPhonicsInitial(card, q) {
  var html = '<div class="question-text">What letter does this word start with?</div>';
  html += '<div style="font-size:42px;margin:16px 0;font-family:var(--font-display);color:var(--sky)">' + q.word + '</div>';
  html += '<div class="answer-options">' + q.options.map(function(o) {
    return '<button class="answer-btn" onclick="checkAnswer(\'' + o + '\', \'' + q.answer + '\', this)" style="font-size:28px;font-weight:700">' + o + '</button>';
  }).join('') + '</div>';
  html += renderHintBtn(q.hint);
  card.innerHTML = html;
}

function renderSightPick(card, q) {
  var html = '<div class="question-text">Find the word:</div>';
  html += '<div style="font-size:42px;margin:16px 0;font-family:var(--font-display);color:var(--gold)">' + q.targetWord + '</div>';
  html += '<div class="answer-options">' + q.options.map(function(o) {
    return '<button class="answer-btn" onclick="checkAnswer(\'' + o + '\', \'' + q.answer + '\', this)" style="font-size:24px">' + o + '</button>';
  }).join('') + '</div>';
  html += renderHintBtn(q.hint);
  card.innerHTML = html;
}

function renderSightFlash(card, q) {
  var html = '<div class="question-text">Remember this word!</div>';
  html += '<div id="flash-word" style="font-size:48px;margin:16px 0;font-family:var(--font-display);color:var(--gold);transition:opacity 0.5s">' + q.targetWord + '</div>';
  html += '<div id="flash-options" style="display:none">';
  html += '<div class="question-text" style="font-size:20px">Which word did you see?</div>';
  html += '<div class="answer-options">' + q.options.map(function(o) {
    return '<button class="answer-btn" onclick="checkAnswer(\'' + o + '\', \'' + q.answer + '\', this)" style="font-size:24px">' + o + '</button>';
  }).join('') + '</div>';
  html += '</div>';
  html += renderHintBtn(q.hint);
  card.innerHTML = html;

  // Flash: show word for 2 seconds, then hide and show options
  setTimeout(function() {
    var wordEl = document.getElementById('flash-word');
    var optEl = document.getElementById('flash-options');
    if (wordEl) wordEl.style.opacity = '0';
    setTimeout(function() {
      if (wordEl) wordEl.style.display = 'none';
      if (optEl) optEl.style.display = 'block';
    }, 500);
  }, 2000);
}

function renderSpellMissing(card, q) {
  var html = '<div class="question-text">What letter is missing?</div>';
  html += '<div style="font-size:64px;margin:12px 0">' + q.emoji + '</div>';
  html += '<div style="font-size:36px;font-family:var(--font-display);letter-spacing:8px;margin:12px 0;color:var(--sky)">' + q.blank + '</div>';
  html += '<div class="answer-options">' + q.options.map(function(o) {
    return '<button class="answer-btn" onclick="checkAnswer(\'' + o + '\', \'' + q.answer + '\', this)" style="font-size:28px;font-weight:700">' + o + '</button>';
  }).join('') + '</div>';
  html += renderHintBtn(q.hint);
  card.innerHTML = html;
}

function renderSpellFull(card, q) {
  var html = '<div class="question-text">Spell the word!</div>';
  html += '<div style="font-size:72px;margin:16px 0">' + q.emoji + '</div>';
  html += '<div class="text-input-area">';
  html += '<input class="text-input" type="text" id="answer-input" placeholder="Type the word..." maxlength="10" autocomplete="off" autocapitalize="off" style="font-size:24px;letter-spacing:4px;text-align:center" onkeydown="if(event.key===\'Enter\')submitSpelling(\'' + q.answer + '\')">';
  html += '<button class="submit-btn" onclick="submitSpelling(\'' + q.answer + '\')">Check \u2713</button>';
  html += '</div>';
  html += renderHintBtn(q.hint);
  card.innerHTML = html;
  setTimeout(function() { var el = document.getElementById('answer-input'); if (el) el.focus(); }, 100);
}

// ===================== P2 RENDERERS =====================

function renderGrammarMCQ(card, q) {
  var html = '<div class="question-text">' + q.instruction + '</div>';
  // Highlight the sentence
  html += '<div class="story-prompt" style="font-size:20px;margin:16px 0">' + q.sentence + '</div>';
  html += '<div class="answer-options">' + q.options.map(function(o) {
    return '<button class="answer-btn" onclick="checkAnswer(\'' + o + '\', \'' + q.answer + '\', this)" style="font-size:20px">' + o + '</button>';
  }).join('') + '</div>';
  html += renderHintBtn(q.hint);
  card.innerHTML = html;
}

function renderVocabMeaning(card, q) {
  var html = '<div class="question-text">What does <strong style="color:var(--gold)">' + q.word + '</strong> mean?</div>';
  html += '<div class="story-prompt" style="font-size:18px;margin:12px 0">"' + q.sentence + '"</div>';
  html += '<div class="answer-options">' + q.options.map(function(o) {
    return '<button class="answer-btn" onclick="checkAnswer(\'' + escapeQuote(o) + '\', \'' + escapeQuote(q.answer) + '\', this)" style="font-size:16px">' + o + '</button>';
  }).join('') + '</div>';
  html += renderHintBtn(q.hint);
  card.innerHTML = html;
}

function renderVocabWord(card, q) {
  var html = '<div class="question-text">Which word means:</div>';
  html += '<div style="font-size:20px;color:var(--mint);margin:12px 0;font-style:italic">"' + q.meaning + '"</div>';
  html += '<div class="answer-options">' + q.options.map(function(o) {
    return '<button class="answer-btn" onclick="checkAnswer(\'' + o + '\', \'' + q.answer + '\', this)" style="font-size:20px">' + o + '</button>';
  }).join('') + '</div>';
  html += renderHintBtn(q.hint);
  card.innerHTML = html;
}

function renderSentenceBuild(card, q) {
  var html = '<div class="question-text">Put the words in order to make a sentence!</div>';
  html += '<div id="sentence-result" style="min-height:48px;padding:12px;background:rgba(255,255,255,0.05);border-radius:12px;margin:12px 0;font-size:22px;display:flex;flex-wrap:wrap;gap:8px;align-items:center;justify-content:center"></div>';
  html += '<div id="sentence-bank" style="display:flex;flex-wrap:wrap;gap:8px;justify-content:center;margin:12px 0">';
  q.words.forEach(function(w) {
    html += '<button class="answer-btn" style="font-size:20px;cursor:grab" onclick="sentenceWordClick(this, \'' + escapeQuote(w) + '\')">' + w + '</button>';
  });
  html += '</div>';
  html += '<button class="submit-btn mt-2" onclick="checkSentenceOrder()">Check \u2713</button>';
  html += renderHintBtn(q.hint);
  card.innerHTML = html;

  // Store correct answer on the card for checking
  card.dataset.sentenceAnswer = q.answer;
}

// ===================== P3 RENDERERS =====================

function renderComprehensionMCQ(card, q) {
  var html = '<div style="font-size:16px;font-weight:700;color:var(--gold);margin-bottom:8px">\uD83D\uDCD6 ' + q.title + '</div>';
  html += '<div class="story-prompt" style="font-size:16px;line-height:1.6;max-height:140px;overflow-y:auto;text-align:left;padding:12px 16px">' + q.text + '</div>';
  html += '<div class="question-text" style="font-size:18px;margin-top:16px">' + q.question + '</div>';
  html += '<div class="answer-options" style="flex-direction:column">' + q.options.map(function(o) {
    return '<button class="answer-btn" onclick="checkAnswer(\'' + escapeQuote(o) + '\', \'' + escapeQuote(q.answer) + '\', this)" style="font-size:16px;text-align:left;width:100%">' + o + '</button>';
  }).join('') + '</div>';
  html += renderHintBtn(q.hint);
  card.innerHTML = html;
}

function renderPoetryRhyme(card, q) {
  var html = '<div class="question-text">Which word rhymes with <strong style="color:var(--gold)">' + q.targetWord + '</strong>?</div>';
  html += '<div style="font-size:48px;margin:12px 0">\uD83C\uDFB5</div>';
  html += '<div class="answer-options">' + q.options.map(function(o) {
    return '<button class="answer-btn" onclick="checkAnswer(\'' + o + '\', \'' + q.answer + '\', this)" style="font-size:22px">' + o + '</button>';
  }).join('') + '</div>';
  html += renderHintBtn(q.hint);
  card.innerHTML = html;
}

function renderPoetySyllable(card, q) {
  var html = '<div class="question-text">How many syllables (beats) does this word have?</div>';
  html += '<div style="font-size:36px;margin:16px 0;font-family:var(--font-display);color:var(--sky)">' + q.word + '</div>';
  html += '<div style="font-size:14px;color:var(--text-secondary);margin-bottom:12px">\uD83D\uDC4F Clap it out!</div>';
  html += '<div class="answer-options">' + q.options.map(function(o) {
    return '<button class="answer-btn" onclick="checkAnswer(' + o + ', ' + q.answer + ', this)" style="font-size:24px">' + o + '</button>';
  }).join('') + '</div>';
  html += renderHintBtn(q.hint);
  card.innerHTML = html;
}

function renderPoetryCouplet(card, q) {
  var html = '<div class="question-text">Pick a word to complete the rhyme!</div>';
  html += '<div style="font-size:20px;margin:16px 0;font-style:italic;color:var(--lavender)">';
  html += 'Line 1 ends with: <strong style="color:var(--gold)">' + q.line1End + '</strong>';
  html += '</div>';
  html += '<div style="font-size:18px;color:var(--text-secondary);margin-bottom:12px">Line 2 should end with...</div>';
  html += '<div class="answer-options">' + q.options.map(function(o) {
    return '<button class="answer-btn" onclick="checkAnswer(\'' + o + '\', \'' + q.answer + '\', this)" style="font-size:22px">' + o + '</button>';
  }).join('') + '</div>';
  html += renderHintBtn(q.hint);
  card.innerHTML = html;
}

// ===================== P4 RENDERERS =====================

function renderStoryWrite(card, q) {
  var html = '<div class="question-text">\u270D\uFE0F Write a story!</div>';
  html += '<div class="story-prompt" style="font-size:18px;margin:12px 0">' + q.prompt + '</div>';
  html += '<textarea id="story-textarea" class="text-input" style="width:100%;height:140px;font-size:16px;line-height:1.6;resize:none;font-family:var(--font-hand)" placeholder="Continue the story..."></textarea>';
  html += '<div style="display:flex;gap:8px;margin-top:8px;flex-wrap:wrap;justify-content:center" id="word-suggestions">';
  var suggestions = shuffle(WORD_BANKS.adjectives.concat(WORD_BANKS.nouns)).slice(0, 6);
  suggestions.forEach(function(w) {
    html += '<button style="font-size:13px;padding:4px 10px;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.15);border-radius:20px;color:var(--text-secondary);cursor:pointer" onclick="insertWordSuggestion(\'' + w + '\')">' + w + '</button>';
  });
  html += '</div>';
  html += '<button class="submit-btn mt-2" onclick="submitStory()">Done \u2713</button>';
  html += renderHintBtn(q.hint);
  card.innerHTML = html;
  setTimeout(function() { var el = document.getElementById('story-textarea'); if (el) el.focus(); }, 100);
}

function renderParagraphWrite(card, q) {
  var html = '<div class="question-text">\uD83D\uDCDD ' + q.topic + '</div>';
  html += '<div style="font-size:16px;color:var(--text-secondary);margin:8px 0">Start with: <em>"' + q.starter + '..."</em></div>';
  html += '<div style="display:flex;flex-direction:column;gap:4px;margin:12px 0">';
  q.hints.forEach(function(h) {
    html += '<div style="font-size:14px;color:var(--mint)">\uD83D\uDCA1 ' + h + '</div>';
  });
  html += '</div>';
  html += '<textarea id="story-textarea" class="text-input" style="width:100%;height:120px;font-size:16px;line-height:1.6;resize:none;font-family:var(--font-hand)" placeholder="' + q.starter + '...">' + q.starter + ' </textarea>';
  html += '<button class="submit-btn mt-2" onclick="submitStory()">Done \u2713</button>';
  html += renderHintBtn(q.hint);
  card.innerHTML = html;
  setTimeout(function() {
    var el = document.getElementById('story-textarea');
    if (el) { el.focus(); el.setSelectionRange(el.value.length, el.value.length); }
  }, 100);
}

// ===================== WORD HELPER FUNCTIONS =====================

function escapeQuote(str) {
  return String(str).replace(/'/g, "\\'");
}

function sentenceWordClick(btn, word) {
  var result = document.getElementById('sentence-result');
  if (!result) return;

  if (btn.parentElement.id === 'sentence-bank') {
    // Move from bank to result
    btn.remove();
    var tag = document.createElement('button');
    tag.className = 'answer-btn';
    tag.style.cssText = 'font-size:20px;cursor:pointer';
    tag.textContent = word;
    tag.setAttribute('onclick', "sentenceWordReturn(this, '" + escapeQuote(word) + "')");
    result.appendChild(tag);
  }
}

function sentenceWordReturn(btn, word) {
  var bank = document.getElementById('sentence-bank');
  if (!bank) return;
  btn.remove();
  var tag = document.createElement('button');
  tag.className = 'answer-btn';
  tag.style.cssText = 'font-size:20px;cursor:grab';
  tag.textContent = word;
  tag.setAttribute('onclick', "sentenceWordClick(this, '" + escapeQuote(word) + "')");
  bank.appendChild(tag);
}

function checkSentenceOrder() {
  var result = document.getElementById('sentence-result');
  var card = document.getElementById('question-card');
  if (!result || !card) return;
  var words = [];
  result.querySelectorAll('.answer-btn').forEach(function(b) { words.push(b.textContent); });
  var built = words.join(' ') + '.';
  var expected = card.dataset.sentenceAnswer;
  if (built.toLowerCase().replace(/\s+/g, ' ') === expected.toLowerCase().replace(/\s+/g, ' ')) {
    handleCorrect();
  } else {
    handleWrong(expected);
  }
}

function insertWordSuggestion(word) {
  var textarea = document.getElementById('story-textarea');
  if (!textarea) return;
  var pos = textarea.selectionStart;
  var before = textarea.value.substring(0, pos);
  var after = textarea.value.substring(pos);
  textarea.value = before + word + ' ' + after;
  textarea.focus();
  textarea.setSelectionRange(pos + word.length + 1, pos + word.length + 1);
}

function submitStory() {
  var textarea = document.getElementById('story-textarea');
  if (!textarea) return;
  var text = textarea.value.trim();
  if (text.length < 10) {
    textarea.style.borderColor = 'var(--error)';
    textarea.style.animation = 'shake-wrong 0.5s';
    textarea.setAttribute('placeholder', 'Write a bit more! At least 2 sentences.');
    return;
  }
  // Store the story
  state.stories = state.stories || [];
  state.stories.push({ text: text, date: Date.now(), skill: currentGame.skillId });
  handleCorrect(true);
}

// ===================== ENHANCED RENDERERS =====================

// Override phonics family to use animated letter tiles
var _origRenderPhonicsFamily = renderPhonicsFamily;
renderPhonicsFamily = function(card, q) {
  var html = '<div class="question-text">Which word belongs to the <strong>-' + q.family + '</strong> family?</div>';
  html += '<div style="font-size:48px;margin:12px 0;letter-spacing:4px;color:var(--gold)">-' + q.family + '</div>';

  // Animated letter tiles for each option
  html += '<div class="answer-options">' + q.options.map(function(o, idx) {
    var tiles = '';
    for (var i = 0; i < o.length; i++) {
      var isFamily = i >= o.length - q.family.length;
      tiles += '<span class="letter-tile' + (isFamily ? ' family-highlight' : '') + '" style="display:inline-block;padding:4px 8px;margin:2px;background:' + (isFamily ? 'rgba(255,215,0,0.2)' : 'rgba(255,255,255,0.1)') + ';border-radius:6px;font-size:22px;font-weight:700;letter-spacing:1px;animation:pop-in 0.3s ease-out ' + (idx * 0.1 + i * 0.05) + 's both">' + o[i] + '</span>';
    }
    return '<button class="answer-btn" onclick="checkAnswer(\'' + o + '\', \'' + q.answer + '\', this)" style="font-size:22px;letter-spacing:0;display:flex;align-items:center;justify-content:center;gap:0">' + tiles + '</button>';
  }).join('') + '</div>';
  html += renderHintBtn(q.hint);
  card.innerHTML = html;
};

// Override sentence build to support touch drag reordering
var _origRenderSentenceBuild = renderSentenceBuild;
renderSentenceBuild = function(card, q) {
  var html = '<div class="question-text">Put the words in order to make a sentence!</div>';

  // Result area with drop zone styling
  html += '<div id="sentence-result" style="min-height:52px;padding:12px;background:rgba(255,255,255,0.05);border-radius:12px;margin:12px 0;font-size:20px;display:flex;flex-wrap:wrap;gap:8px;align-items:center;justify-content:center;border:2px dashed rgba(255,255,255,0.15);transition:border-color 0.3s">';
  html += '<span style="color:var(--text-dim);font-size:14px" id="sentence-placeholder">Tap words below to build your sentence</span>';
  html += '</div>';

  // Word bank with touch-friendly sizing
  html += '<div id="sentence-bank" style="display:flex;flex-wrap:wrap;gap:8px;justify-content:center;margin:12px 0">';
  q.words.forEach(function(w, idx) {
    html += '<button class="answer-btn word-tile" style="font-size:20px;cursor:grab;min-width:60px;animation:pop-in 0.3s ease-out ' + (idx * 0.08) + 's both" onclick="sentenceWordClick(this, \'' + escapeQuote(w) + '\')">' + w + '</button>';
  });
  html += '</div>';

  html += '<div style="display:flex;gap:8px;justify-content:center">';
  html += '<button class="submit-btn" onclick="checkSentenceOrder()">Check \u2713</button>';
  html += '<button class="answer-btn" style="font-size:14px;padding:8px 14px;color:var(--coral)" onclick="resetSentenceBuilder()">Reset</button>';
  html += '</div>';
  html += renderHintBtn(q.hint);
  card.innerHTML = html;
  card.dataset.sentenceAnswer = q.answer;
};

function resetSentenceBuilder() {
  // Move all words back to bank
  var result = document.getElementById('sentence-result');
  var bank = document.getElementById('sentence-bank');
  if (!result || !bank) return;

  var btns = Array.from(result.querySelectorAll('.answer-btn'));
  btns.forEach(function(btn) {
    btn.remove();
    var word = btn.textContent;
    var newBtn = document.createElement('button');
    newBtn.className = 'answer-btn word-tile';
    newBtn.style.cssText = 'font-size:20px;cursor:grab;min-width:60px';
    newBtn.textContent = word;
    newBtn.setAttribute('onclick', "sentenceWordClick(this, '" + escapeQuote(word) + "')");
    bank.appendChild(newBtn);
  });

  // Restore placeholder
  var placeholder = document.getElementById('sentence-placeholder');
  if (!placeholder) {
    var span = document.createElement('span');
    span.style.cssText = 'color:var(--text-dim);font-size:14px';
    span.id = 'sentence-placeholder';
    span.textContent = 'Tap words below to build your sentence';
    result.appendChild(span);
  }
}

// Override grammar MCQ to highlight parts of speech with colours
var _origRenderGrammarMCQ = renderGrammarMCQ;
renderGrammarMCQ = function(card, q) {
  var html = '<div class="question-text">' + q.instruction + '</div>';

  // Parse sentence for POS colouring based on grammar type
  var styledSentence = q.sentence;
  if (q.grammarType && q.grammarType.indexOf('identify') >= 0 && q.answer) {
    // Bold the answer word in the sentence for visual emphasis after answer
    styledSentence = q.sentence.replace(new RegExp('\\b' + q.answer + '\\b', 'i'), '<u>' + q.answer + '</u>');
  }

  html += '<div class="story-prompt" style="font-size:20px;margin:16px 0">' + styledSentence + '</div>';

  // Colour-coded legend
  html += '<div style="display:flex;gap:12px;justify-content:center;margin:8px 0;font-size:12px">';
  html += '<span style="color:#64B5F6">\u25CF Noun</span>';
  html += '<span style="color:#EF5350">\u25CF Verb</span>';
  html += '<span style="color:#81C784">\u25CF Adjective</span>';
  html += '</div>';

  html += '<div class="answer-options">' + q.options.map(function(o) {
    return '<button class="answer-btn" onclick="checkAnswer(\'' + o + '\', \'' + q.answer + '\', this)" style="font-size:20px">' + o + '</button>';
  }).join('') + '</div>';
  html += renderHintBtn(q.hint);
  card.innerHTML = html;
};

// Enhanced sight word flash — bigger, more dramatic reveal
var _origRenderSightFlash = renderSightFlash;
renderSightFlash = function(card, q) {
  var html = '<div class="question-text">Remember this word!</div>';
  html += '<div id="flash-word" style="font-size:56px;margin:20px 0;font-family:var(--font-display);color:var(--gold);transition:all 0.5s;text-shadow:0 0 20px rgba(255,215,0,0.3)">' + q.targetWord + '</div>';
  html += '<div id="flash-countdown" style="font-size:14px;color:var(--text-dim)">Memorize it...</div>';
  html += '<div id="flash-options" style="display:none">';
  html += '<div class="question-text" style="font-size:20px;animation:pop-in 0.4s ease-out">Which word did you see?</div>';
  html += '<div class="answer-options">' + q.options.map(function(o) {
    return '<button class="answer-btn" onclick="checkAnswer(\'' + o + '\', \'' + q.answer + '\', this)" style="font-size:24px">' + o + '</button>';
  }).join('') + '</div>';
  html += '</div>';
  html += renderHintBtn(q.hint);
  card.innerHTML = html;

  // Countdown: 3 seconds
  var countdown = document.getElementById('flash-countdown');
  var timeLeft = 3;
  var timer = setInterval(function() {
    timeLeft--;
    if (countdown) countdown.textContent = timeLeft + '...';
    if (timeLeft <= 0) {
      clearInterval(timer);
      var wordEl = document.getElementById('flash-word');
      if (wordEl) {
        wordEl.style.opacity = '0';
        wordEl.style.transform = 'scale(0.5)';
      }
      setTimeout(function() {
        if (wordEl) wordEl.style.display = 'none';
        if (countdown) countdown.style.display = 'none';
        var optEl = document.getElementById('flash-options');
        if (optEl) optEl.style.display = 'block';
      }, 400);
    }
  }, 1000);
};
