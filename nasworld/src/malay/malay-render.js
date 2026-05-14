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
  var html = '<div class="question-text">How do you say <b>' + q.number + '</b> in Malay?</div>';
  html += '<div style="font-size:56px;margin:12px 0;color:var(--gold);font-weight:700">' + q.number + '</div>';
  html += _malayOptions(q, 'font-size:22px');
  html += renderHintBtn(q.hint);
  card.innerHTML = html;
}

function renderMalayGreet(card, q) {
  var html = '<div class="question-text">What does <b>"' + q.prompt + '"</b> mean?</div>';
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
