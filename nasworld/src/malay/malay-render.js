// ============================================================
//  MALAY RENDER — Render Malay question types
// ============================================================

function renderMalayQuestion(card, q) {
  switch (q.type) {
    case 'malay-vowel':         renderMalayVowel(card, q); return true;
    case 'malay-suku-word':     renderMalaySukuWord(card, q); return true;
    case 'malay-number':        renderMalayNumber(card, q); return true;
    case 'malay-number-word':   renderMalayNumberWord(card, q); return true;
    case 'malay-greet':         renderMalayGreet(card, q); return true;
    case 'malay-greet-context': renderMalayGreetContext(card, q); return true;
    case 'malay-colour-swatch': renderMalayColourSwatch(card, q); return true;
    case 'malay-colour-word':   renderMalayColourWord(card, q); return true;
    case 'malay-family':        renderMalayFamily(card, q); return true;
    case 'malay-animal':        renderMalayAnimal(card, q); return true;
    case 'malay-animal-emoji':  renderMalayAnimalEmoji(card, q); return true;
    case 'malay-body':          renderMalayBody(card, q); return true;
    case 'malay-food':          renderMalayFood(card, q); return true;
    case 'malay-food-emoji':    renderMalayFoodEmoji(card, q); return true;
    case 'malay-day':           renderMalayDay(card, q); return true;
    case 'malay-weather':       renderMalayWeather(card, q); return true;
    case 'malay-sentence':      renderMalaySentence(card, q); return true;
    // Primary 2 layer
    case 'malay-p2-mcq':        renderMalayP2Mcq(card, q); return true;
    case 'malay-p2-passage':    renderMalayP2Mcq(card, q); return true;
    case 'malay-p2-order':      renderMalayP2Order(card, q); return true;
    default: return false;
  }
}

function _malayOptions(q, btnStyle) {
  btnStyle = btnStyle || '';
  return '<div class="answer-options">' + q.options.map(function(o) {
    var safe = String(o).replace(/'/g, "\\'");
    return '<button class="answer-btn" style="' + btnStyle + '" onclick="checkAnswer(\'' + safe + '\', \'' + String(q.answer).replace(/'/g, "\\'") + '\', this)">' + o + '</button>';
  }).join('') + '</div>';
}

function renderMalayVowel(card, q) {
  var html = '<div class="question-text">Which vowel is hiding in <b>' + q.syllable + '</b>?</div>';
  html += '<div style="font-size:48px;margin:14px 0;letter-spacing:4px;color:var(--gold)">' + q.syllable + '</div>';
  html += _malayOptions(q, 'font-size:28px;font-weight:700');
  html += renderHintBtn(q.hint);
  card.innerHTML = html;
}

function renderMalaySukuWord(card, q) {
  var html = '<div class="question-text">What word do these syllables make?</div>';
  html += '<div style="font-size:32px;margin:14px 0;letter-spacing:8px;color:var(--mint)">' + (q.syllables || []).join(' · ') + '</div>';
  if (q.emoji) html += '<div style="font-size:36px;margin:6px 0">' + q.emoji + '</div>';
  html += _malayOptions(q, 'font-size:22px');
  html += renderHintBtn(q.hint);
  card.innerHTML = html;
}

function renderMalayNumber(card, q) {
  var html = '<div class="question-text">What number is <b>' + q.prompt + '</b>?</div>';
  html += '<div style="font-size:42px;margin:12px 0;color:var(--gold)">' + q.prompt + '</div>';
  html += _malayOptions(q, 'font-size:28px;font-weight:700');
  html += renderHintBtn(q.hint);
  card.innerHTML = html;
}

function renderMalayNumberWord(card, q) {
  var tts = (typeof ttsButton === 'function') ? ttsButton(String(q.answer || ''), 'ms-MY', 'Hear in Malay') : '';
  var html = '<div class="question-text">How do you say <b>' + q.number + '</b> in Malay? ' + tts + '</div>';
  html += '<div style="font-size:56px;margin:12px 0;color:var(--gold);font-weight:700">' + q.number + '</div>';
  html += _malayOptions(q, 'font-size:22px');
  html += renderHintBtn(q.hint);
  card.innerHTML = html;
}

function renderMalayGreet(card, q) {
  var tts = (typeof ttsButton === 'function') ? ttsButton(q.prompt, 'ms-MY', 'Hear in Malay') : '';
  var html = '<div class="question-text">What does <b>"' + q.prompt + '"</b> mean? ' + tts + '</div>';
  if (q.emoji) html += '<div style="font-size:40px;margin:8px 0">' + q.emoji + '</div>';
  html += _malayOptions(q, 'font-size:18px');
  html += renderHintBtn(q.hint);
  card.innerHTML = html;
}

function renderMalayGreetContext(card, q) {
  var html = '<div class="question-text">' + q.prompt + '</div>';
  html += '<div style="font-size:13px;color:var(--text-dim);margin-bottom:8px">Context: ' + (q.context || '') + '</div>';
  html += _malayOptions(q, 'font-size:18px');
  html += renderHintBtn(q.hint);
  card.innerHTML = html;
}

function renderMalayColourSwatch(card, q) {
  var html = '<div class="question-text">What is this colour in Malay?</div>';
  html += '<div style="width:80px;height:80px;border-radius:16px;background:' + q.hex + ';margin:16px auto;box-shadow:0 0 24px ' + q.hex + '44"></div>';
  html += _malayOptions(q, 'font-size:22px');
  html += renderHintBtn(q.hint);
  card.innerHTML = html;
}

function renderMalayColourWord(card, q) {
  var html = '<div class="question-text">What colour is <b>' + q.prompt + '</b>?</div>';
  if (q.emoji) html += '<div style="font-size:42px;margin:8px 0">' + q.emoji + '</div>';
  html += _malayOptions(q, 'font-size:22px');
  html += renderHintBtn(q.hint);
  card.innerHTML = html;
}

function renderMalayFamily(card, q) {
  var html = '<div class="question-text">Who is <b>' + q.prompt + '</b>?</div>';
  html += '<div style="font-size:46px;margin:10px 0">' + (q.emoji || '👪') + '</div>';
  html += _malayOptions(q, 'font-size:20px');
  html += renderHintBtn(q.hint);
  card.innerHTML = html;
}

function renderMalayAnimal(card, q) {
  var html = '<div class="question-text">What is a <b>' + q.prompt + '</b>?</div>';
  html += '<div style="font-size:46px;margin:10px 0">' + (q.emoji || '🐾') + '</div>';
  html += _malayOptions(q, 'font-size:22px');
  html += renderHintBtn(q.hint);
  card.innerHTML = html;
}

function renderMalayAnimalEmoji(card, q) {
  var html = '<div class="question-text">What is this animal in Malay?</div>';
  html += '<div style="font-size:64px;margin:14px 0">' + q.emoji + '</div>';
  html += _malayOptions(q, 'font-size:22px');
  html += renderHintBtn(q.hint);
  card.innerHTML = html;
}

function renderMalayBody(card, q) {
  var html = '<div class="question-text">What is <b>' + q.prompt + '</b>?</div>';
  html += '<div style="font-size:46px;margin:10px 0">' + (q.emoji || '👐') + '</div>';
  html += _malayOptions(q, 'font-size:20px');
  html += renderHintBtn(q.hint);
  card.innerHTML = html;
}

function renderMalayFood(card, q) {
  var html = '<div class="question-text">What is <b>' + q.prompt + '</b>?</div>';
  html += '<div style="font-size:46px;margin:10px 0">' + (q.emoji || '🍽️') + '</div>';
  html += _malayOptions(q, 'font-size:20px');
  html += renderHintBtn(q.hint);
  card.innerHTML = html;
}

function renderMalayFoodEmoji(card, q) {
  var html = '<div class="question-text">What is this in Malay?</div>';
  html += '<div style="font-size:64px;margin:14px 0">' + q.emoji + '</div>';
  html += _malayOptions(q, 'font-size:22px');
  html += renderHintBtn(q.hint);
  card.innerHTML = html;
}

function renderMalayDay(card, q) {
  var html = '<div class="question-text">Which day is <b>' + q.prompt + '</b>?</div>';
  html += '<div style="font-size:34px;margin:10px 0;color:var(--lavender)">📅 ' + q.prompt + '</div>';
  html += _malayOptions(q, 'font-size:18px');
  html += renderHintBtn(q.hint);
  card.innerHTML = html;
}

function renderMalayWeather(card, q) {
  var html = '<div class="question-text">What weather is <b>' + q.prompt + '</b>?</div>';
  html += '<div style="font-size:50px;margin:10px 0">' + q.emoji + '</div>';
  html += _malayOptions(q, 'font-size:22px');
  html += renderHintBtn(q.hint);
  card.innerHTML = html;
}

function renderMalaySentence(card, q) {
  var html = '<div class="question-text">Translate this sentence to Malay:</div>';
  html += '<div style="font-size:22px;margin:10px 0;color:var(--gold)">' + q.prompt + '</div>';
  if (q.emoji) html += '<div style="font-size:36px;margin:6px 0">' + q.emoji + '</div>';
  html += _malayOptions(q, 'font-size:16px;line-height:1.3');
  html += renderHintBtn(q.hint);
  card.innerHTML = html;
}

// ============================================================
//  PRIMARY 2 LAYER — rendering
//
//  The P1 cards hand straight over to checkAnswer(), which moves on
//  within a second. The P2 cards stop first: once she has answered,
//  the finished Malay sentence and its English meaning appear, and
//  she taps Next when she has read them. Only then is the answer
//  scored, through the same handleCorrect / handleWrong as every
//  other question.
// ============================================================

var _malayP2Q = null;

function _malayP2Esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/** A sentence with its blank drawn as a visible gap. */
function _malayP2Blank(s) {
  return _malayP2Esc(s).replace('____', '<span style="display:inline-block;min-width:64px;border-bottom:3px solid var(--gold)">&nbsp;</span>');
}

function renderMalayP2Mcq(card, q) {
  _malayP2Q = q;
  q._done = false;
  var html = '';

  if (q.passage) {
    html += '<div style="text-align:left;background:rgba(var(--ink-rgb),0.06);border-radius:12px;padding:12px 14px;margin-bottom:12px">';
    html += '<div style="font-weight:700;color:var(--gold);margin-bottom:6px">' + _malayP2Esc(q.passage.title) + '</div>';
    html += '<div lang="ms" style="font-size:17px;line-height:1.6">' + _malayP2Esc(q.passage.text) + '</div>';
    html += '</div>';
  }

  // instruction is written in this file's own generators and may carry <b>.
  html += '<div class="question-text">' + q.instruction + '</div>';

  if (q.stem) {
    var big = q.stem.indexOf(' ') === -1 || q.stem.length < 16;
    html += '<div lang="ms" style="font-size:' + (big ? 30 : 21) + 'px;margin:12px 0 4px;color:var(--gold);line-height:1.4">' + _malayP2Blank(q.stem) + '</div>';
  }
  if (q.stemNote) html += '<div style="font-size:14px;color:var(--text-dim);margin-bottom:6px">' + _malayP2Esc(q.stemNote) + '</div>';
  if (q.stemReply) html += '<div lang="ms" style="font-size:19px;margin:2px 0 8px;line-height:1.4">' + _malayP2Esc(q.stemReply) + '</div>';

  var longest = q.options.reduce(function (m, o) { return Math.max(m, String(o).length); }, 0);
  var size = longest > 28 ? 16 : (longest > 14 ? 18 : 22);
  html += '<div class="answer-options">' + q.options.map(function (o, i) {
    return '<button class="answer-btn" lang="ms" style="font-size:' + size + 'px;line-height:1.3" onclick="malayP2Pick(this, ' + i + ')">' + _malayP2Esc(o) + '</button>';
  }).join('') + '</div>';

  html += renderHintBtn(q.hint);
  card.innerHTML = html;
}

/** What appears once she has answered: the Malay, then the English. */
function malayP2RevealHTML(q, ok) {
  var edge = ok ? 'var(--mint)' : 'var(--gold)';
  var html = '<div id="malay-p2-reveal" style="text-align:left;margin-top:14px;padding:12px 14px;border-radius:12px;background:rgba(var(--ink-rgb),0.06);border-left:4px solid ' + edge + '">';
  html += '<div style="font-weight:700;margin-bottom:6px">' +
          (ok ? 'Correct.' : 'The answer is <span lang="ms" style="color:var(--gold)">' + _malayP2Esc(q.answer) + '</span>.') + '</div>';
  if (q.full) {
    var tts = (typeof ttsButton === 'function') ? ' ' + ttsButton(q.full, 'ms-MY', 'Hear in Malay') : '';
    html += '<div lang="ms" style="font-size:18px;line-height:1.5">' + _malayP2Esc(q.full) + tts + '</div>';
  }
  html += '<div style="font-size:16px;line-height:1.5;margin-top:4px"><span style="color:var(--text-dim)">In English:</span> ' + _malayP2Esc(q.gloss) + '</div>';
  if (q.note) html += '<div style="font-size:14px;color:var(--text-dim);margin-top:6px">' + _malayP2Esc(q.note) + '</div>';
  if (q.passageEn) {
    html += '<details style="margin-top:8px;font-size:14px"><summary style="cursor:pointer;color:var(--text-dim)">The passage in English</summary>' +
            '<div style="margin-top:6px;line-height:1.5">' + _malayP2Esc(q.passageEn) + '</div></details>';
  }
  html += '<div style="text-align:center;margin-top:12px"><button class="submit-btn" id="malay-p2-next" onclick="malayP2Next(' + (ok ? 'true' : 'false') + ')">Next</button></div>';
  html += '</div>';
  return html;
}

function _malayP2Show(q, ok) {
  var card = document.getElementById('question-card');
  if (!card) return;
  var old = document.getElementById('malay-p2-reveal');
  if (old && old.remove) old.remove();
  card.insertAdjacentHTML('beforeend', malayP2RevealHTML(q, ok));
  if (typeof playSound === 'function') playSound('click');
}

function malayP2Pick(btn, index) {
  var q = _malayP2Q;
  if (!q || q._done) return;
  q._done = true;
  var ok = String(q.options[index]) === String(q.answer);
  var all = (btn && btn.parentElement && btn.parentElement.querySelectorAll('.answer-btn')) || [];
  Array.prototype.forEach.call(all, function (b, i) {
    b.dataset.checked = 'true';
    if (String(q.options[i]) === String(q.answer)) b.classList.add('correct');
  });
  if (!ok && btn) btn.classList.add('wrong');
  _malayP2Show(q, ok);
}

/** Next was tapped: now score it, and let the usual flow move on. */
function malayP2Next(ok) {
  var q = _malayP2Q;
  if (!q || q._scored) return;
  q._scored = true;
  var next = document.getElementById('malay-p2-next');
  if (next) next.disabled = true;
  if (ok) handleCorrect();
  else handleWrong(q.answer);
}

// ---------- Bina ayat: tap the tiles into order ----------

function renderMalayP2Order(card, q) {
  _malayP2Q = q;
  q._done = false;
  var html = '<div class="question-text">' + q.instruction + '</div>';
  html += '<div id="malay-order-result" lang="ms" style="min-height:56px;padding:12px;background:rgba(var(--ink-rgb),0.05);border-radius:12px;margin:12px 0;display:flex;flex-wrap:wrap;gap:8px;align-items:center;justify-content:center;border:2px dashed rgba(var(--ink-rgb),0.15)"></div>';
  html += '<div id="malay-order-bank" lang="ms" style="display:flex;flex-wrap:wrap;gap:8px;justify-content:center;margin:12px 0;min-height:48px">';
  q.words.forEach(function (w) {
    html += '<button class="answer-btn word-tile" style="font-size:19px;min-width:56px" onclick="malayP2Tile(this)">' + _malayP2Esc(w) + '</button>';
  });
  html += '</div>';
  html += '<div id="malay-order-msg" style="font-size:14px;color:var(--text-dim);min-height:20px"></div>';
  html += '<div id="malay-order-actions" style="display:flex;gap:8px;justify-content:center">';
  html += '<button class="submit-btn" onclick="malayP2CheckOrder()">Check</button>';
  html += '<button class="answer-btn" style="font-size:14px;padding:8px 14px" onclick="malayP2ResetOrder()">Start again</button>';
  html += '</div>';
  html += renderHintBtn(q.hint);
  card.innerHTML = html;
}

/** A tile hops between the bank and the sentence each time it is tapped. */
function malayP2Tile(btn) {
  var q = _malayP2Q;
  if (!q || q._done || !btn || !btn.parentElement) return;
  var result = document.getElementById('malay-order-result');
  var bank = document.getElementById('malay-order-bank');
  if (!result || !bank) return;
  var target = btn.parentElement.id === 'malay-order-bank' ? result : bank;
  target.appendChild(btn);
  var msg = document.getElementById('malay-order-msg');
  if (msg) msg.textContent = '';
}

function malayP2ResetOrder() {
  var q = _malayP2Q;
  if (!q || q._done) return;
  var result = document.getElementById('malay-order-result');
  var bank = document.getElementById('malay-order-bank');
  if (!result || !bank) return;
  Array.prototype.slice.call(result.querySelectorAll('.answer-btn')).forEach(function (b) { bank.appendChild(b); });
}

/** True when the sentence she built is the answer, or a listed alternative. */
function malayP2OrderIsRight(q, built) {
  var norm = function (s) { return String(s).replace(/\s+/g, ' ').trim(); };
  return (q.accept || [q.answer]).some(function (a) { return norm(a) === norm(built); });
}

function malayP2CheckOrder() {
  var q = _malayP2Q;
  if (!q || q._done) return;
  var result = document.getElementById('malay-order-result');
  var bank = document.getElementById('malay-order-bank');
  if (!result || !bank) return;
  if (bank.querySelectorAll('.answer-btn').length > 0) {
    var msg = document.getElementById('malay-order-msg');
    if (msg) msg.textContent = 'Use every word first.';
    return;
  }
  var words = [];
  Array.prototype.forEach.call(result.querySelectorAll('.answer-btn'), function (b) { words.push(b.textContent); });
  var built = words.join(' ');
  var ok = malayP2OrderIsRight(q, built);
  q._done = true;
  q.full = ok ? built : q.answer;
  var actions = document.getElementById('malay-order-actions');
  if (actions && actions.remove) actions.remove();
  _malayP2Show(q, ok);
}
