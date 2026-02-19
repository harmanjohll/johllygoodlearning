// ============================================================
//  ESCAPE ROOMS — Timed multi-puzzle challenge rooms
// ============================================================

var ESCAPE_ROOMS = [
  {
    id: 'escape-treasure',
    name: 'Treasure Island',
    icon: '\uD83C\uDFDD\uFE0F',
    desc: 'Solve puzzles to find the hidden treasure!',
    unlockFlowers: 5,
    timeLimit: 300,
    rooms: [
      { type: 'math', skills: ['add','sub'], count: 2 },
      { type: 'word', skills: ['phonics','sight'], count: 2 },
      { type: 'riddle', riddle: 'I have keys but no locks. I have space but no room. You can enter but can\'t go inside. What am I?', answer: 'keyboard', options: ['keyboard','piano','door','house'] }
    ]
  },
  {
    id: 'escape-space',
    name: 'Space Station',
    icon: '\uD83D\uDE80',
    desc: 'Fix the spaceship before time runs out!',
    unlockFlowers: 10,
    timeLimit: 300,
    rooms: [
      { type: 'math', skills: ['mul','add100'], count: 2 },
      { type: 'stem', skills: ['material','forces'], count: 2 },
      { type: 'riddle', riddle: 'I orbit the Earth but I am not a satellite. I shine at night but I make no light of my own. What am I?', answer: 'The Moon', options: ['The Moon','A star','The Sun','A comet'] }
    ]
  },
  {
    id: 'escape-castle',
    name: 'Enchanted Castle',
    icon: '\uD83C\uDFF0',
    desc: 'Unlock rooms in the magical castle!',
    unlockFlowers: 12,
    timeLimit: 360,
    rooms: [
      { type: 'word', skills: ['vocab','grammar'], count: 2 },
      { type: 'math', skills: ['frac1','mul'], count: 2 },
      { type: 'stem', skills: ['living','earth'], count: 1 },
      { type: 'riddle', riddle: 'The more you take, the more you leave behind. What am I?', answer: 'Footsteps', options: ['Footsteps','Shadows','Memories','Time'] }
    ]
  },
  {
    id: 'escape-jungle',
    name: 'Jungle Expedition',
    icon: '\uD83C\uDF34',
    desc: 'Navigate through the dense jungle!',
    unlockFlowers: 15,
    timeLimit: 360,
    rooms: [
      { type: 'stem', skills: ['living','body'], count: 2 },
      { type: 'word', skills: ['comprehension','sentence'], count: 2 },
      { type: 'math', skills: ['area','advmul'], count: 2 },
      { type: 'riddle', riddle: 'I can fly without wings. I can cry without eyes. Wherever I go, darkness follows me. What am I?', answer: 'A cloud', options: ['A cloud','A bird','The wind','A ghost'] }
    ]
  },
  {
    id: 'escape-deepsea',
    name: 'Deep Sea Discovery',
    icon: '\uD83C\uDF0A',
    desc: 'Explore the ocean depths and surface!',
    unlockFlowers: 20,
    timeLimit: 360,
    rooms: [
      { type: 'stem', skills: ['earth','material'], count: 2 },
      { type: 'math', skills: ['sub','div'], count: 2 },
      { type: 'word', skills: ['vocab','spell'], count: 2 },
      { type: 'cipher', cipher: { text: 'XBUFS', shift: 1, answer: 'WATER' } },
      { type: 'riddle', riddle: 'I have a heart that doesn\'t beat. I have a mouth but don\'t eat. I have a bed but don\'t sleep. What am I?', answer: 'A river', options: ['A river','A mountain','A tree','A cave'] }
    ]
  },
  {
    id: 'escape-volcano',
    name: 'Volcano Escape',
    icon: '\uD83C\uDF0B',
    desc: 'Escape before the volcano erupts!',
    unlockFlowers: 25,
    timeLimit: 300,
    rooms: [
      { type: 'math', skills: ['add10k','sub10k'], count: 2 },
      { type: 'stem', skills: ['forces','earth'], count: 2 },
      { type: 'lock', lock: { q1: { text: 'What is 7 + 8?', answer: 15 }, q2: { text: 'What is 6 x 4?', answer: 24 }, q3: { text: 'What is 50 - 17?', answer: 33 } } },
      { type: 'riddle', riddle: 'I am not alive, but I grow. I don\'t have lungs, but I need air. I don\'t have a mouth, but water kills me. What am I?', answer: 'Fire', options: ['Fire','A plant','A cloud','A rock'] }
    ]
  }
];

// === ESCAPE ROOM STATE ===
var escapeState = {
  roomId: null,
  questions: [],
  currentIndex: 0,
  results: [],
  timer: null,
  timeLeft: 0,
  startTime: 0
};

// Render escape room cards for the home screen
function renderEscapeRoomCards(flowerCount) {
  var html = '';
  ESCAPE_ROOMS.forEach(function(room) {
    var unlocked = flowerCount >= room.unlockFlowers;
    var completed = state.escapeRooms && state.escapeRooms[room.id];
    var bestTime = completed ? state.escapeRooms[room.id].bestTime : null;

    html += '<div class="activity-card ' + (unlocked ? '' : 'locked') + '" ' +
      (unlocked ? 'onclick="startEscapeRoom(\'' + room.id + '\')"' : '') + '>';
    html += '<span class="activity-card-icon">' + room.icon + '</span>';
    html += '<div class="activity-card-name">' + room.name + '</div>';
    if (unlocked) {
      if (completed) {
        html += '<div class="activity-card-level" style="color:var(--gold)">Best: ' + formatTime(bestTime) + '</div>';
      } else {
        html += '<div class="activity-card-level">' + room.desc + '</div>';
      }
      html += '<div style="font-size:12px;color:var(--text-dim)">\u23F1 ' + Math.floor(room.timeLimit / 60) + ' min</div>';
    } else {
      html += '<div class="activity-card-level">\uD83D\uDD12 ' + room.unlockFlowers + ' flowers needed</div>';
    }
    html += '</div>';
  });
  return html;
}

function formatTime(seconds) {
  if (!seconds && seconds !== 0) return '--:--';
  var m = Math.floor(seconds / 60);
  var s = seconds % 60;
  return m + ':' + (s < 10 ? '0' : '') + s;
}

// Start an escape room
function startEscapeRoom(roomId) {
  var room = ESCAPE_ROOMS.find(function(r) { return r.id === roomId; });
  if (!room) return;

  playSound('click');

  // Generate all questions
  var questions = [];
  room.rooms.forEach(function(section) {
    if (section.type === 'riddle') {
      questions.push({
        type: 'escape-riddle',
        text: section.riddle,
        options: shuffle(section.options),
        answer: section.answer,
        hint: 'Think about it carefully. Read each word of the riddle.'
      });
    } else if (section.type === 'cipher') {
      questions.push({
        type: 'escape-cipher',
        cipherText: section.cipher.text,
        shift: section.cipher.shift,
        answer: section.cipher.answer,
        hint: 'Each letter is shifted by ' + section.cipher.shift + '. A becomes B, B becomes C, etc.'
      });
    } else if (section.type === 'lock') {
      questions.push({
        type: 'escape-lock',
        q1: section.lock.q1,
        q2: section.lock.q2,
        q3: section.lock.q3,
        answer: '' + section.lock.q1.answer + section.lock.q2.answer + section.lock.q3.answer,
        hint: 'Solve each mini-problem to get a digit of the code.'
      });
    } else {
      for (var i = 0; i < section.count; i++) {
        var skillId = pick(section.skills);
        var q = generateQuestion(skillId, section.type);
        questions.push(q);
      }
    }
  });

  escapeState = {
    roomId: roomId,
    questions: questions,
    currentIndex: 0,
    results: [],
    timer: null,
    timeLeft: room.timeLimit,
    startTime: Date.now()
  };

  document.getElementById('escape-title').textContent = room.icon + ' ' + room.name;
  showScreen('escape-room');
  renderEscapeProgress();
  startEscapeTimer();
  renderEscapeQuestion();
}

function startEscapeTimer() {
  updateTimerDisplay();
  escapeState.timer = setInterval(function() {
    escapeState.timeLeft--;
    updateTimerDisplay();
    if (escapeState.timeLeft <= 0) {
      clearInterval(escapeState.timer);
      endEscapeRoom(true);
    }
  }, 1000);
}

function updateTimerDisplay() {
  var el = document.getElementById('escape-timer');
  if (el) {
    el.textContent = formatTime(escapeState.timeLeft);
    if (escapeState.timeLeft <= 30) {
      el.style.color = 'var(--error)';
      el.style.animation = 'pulse-glow 0.5s ease-in-out infinite';
    } else if (escapeState.timeLeft <= 60) {
      el.style.color = 'var(--warning)';
    } else {
      el.style.color = 'var(--text-primary)';
      el.style.animation = '';
    }
  }
}

function renderEscapeProgress() {
  var el = document.getElementById('escape-progress');
  if (!el) return;
  var total = escapeState.questions.length;
  var html = '';
  for (var i = 0; i < total; i++) {
    var cls = 'game-dot';
    if (i < escapeState.currentIndex) cls += escapeState.results[i] ? ' done' : ' wrong';
    else if (i === escapeState.currentIndex) cls += ' current';
    html += '<div class="' + cls + '"></div>';
  }
  el.innerHTML = html;
}

function renderEscapeQuestion() {
  if (escapeState.currentIndex >= escapeState.questions.length) {
    endEscapeRoom(false);
    return;
  }

  var q = escapeState.questions[escapeState.currentIndex];
  var card = document.getElementById('escape-card');

  card.innerHTML = '';
  card.style.animation = 'none';
  card.offsetHeight;
  card.style.animation = 'slide-up 0.4s ease-out';

  if (q.type === 'escape-riddle') { renderEscapeRiddle(card, q); return; }
  if (q.type === 'escape-cipher') { renderEscapeCipher(card, q); return; }
  if (q.type === 'escape-lock') { renderEscapeLock(card, q); return; }

  // Use standard renderers
  if (typeof renderMathQuestion === 'function' && renderMathQuestion(card, q)) return;
  if (typeof renderWordQuestion === 'function' && renderWordQuestion(card, q)) return;
  if (typeof renderScienceQuestion === 'function' && renderScienceQuestion(card, q)) return;
  if (typeof renderCodeQuestion === 'function' && renderCodeQuestion(card, q)) return;

  // Fallback
  var html = '<div class="question-text">' + (q.text || 'Solve this!') + '</div>';
  if (q.options) {
    html += '<div class="answer-options">' + q.options.map(function(o) {
      return '<button class="answer-btn" onclick="escapeCheckAnswer(\'' + String(o).replace(/'/g, "\\'") + '\', \'' + String(q.answer).replace(/'/g, "\\'") + '\', this)">' + o + '</button>';
    }).join('') + '</div>';
  }
  card.innerHTML = html;
}

function renderEscapeRiddle(card, q) {
  var html = '<div style="font-size:36px;margin-bottom:8px">\uD83E\uDD14</div>';
  html += '<div class="question-text" style="font-size:18px">Riddle:</div>';
  html += '<div class="story-prompt" style="font-size:18px;font-style:italic;margin:12px 0">' + q.text + '</div>';
  html += '<div class="answer-options" style="flex-direction:column">' + q.options.map(function(o) {
    return '<button class="answer-btn" onclick="escapeCheckAnswer(\'' + String(o).replace(/'/g, "\\'") + '\', \'' + String(q.answer).replace(/'/g, "\\'") + '\', this)" style="font-size:18px;width:100%">' + o + '</button>';
  }).join('') + '</div>';
  html += renderHintBtn(q.hint);
  card.innerHTML = html;
}

// === CIPHER PUZZLE RENDERER ===
function renderEscapeCipher(card, q) {
  var html = '<div style="font-size:36px;margin-bottom:8px">\uD83D\uDD10</div>';
  html += '<div class="question-text" style="font-size:18px">Crack the Code!</div>';
  html += '<div style="font-size:14px;color:var(--text-secondary);margin:8px 0">Each letter has been shifted forward by ' + q.shift + '. Decode the secret word!</div>';

  // Show cipher text as letter tiles
  html += '<div style="display:flex;gap:6px;justify-content:center;margin:16px 0">';
  for (var i = 0; i < q.cipherText.length; i++) {
    html += '<div style="width:42px;height:48px;background:rgba(255,255,255,0.1);border:2px solid var(--gold);border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:24px;font-weight:700;color:var(--gold)">' + q.cipherText[i] + '</div>';
  }
  html += '</div>';

  // Alphabet reference
  html += '<div style="font-size:12px;color:var(--text-dim);margin:8px 0">A B C D E F G H I J K L M N O P Q R S T U V W X Y Z</div>';

  // Input
  html += '<div class="text-input-area">';
  html += '<input class="text-input" type="text" id="cipher-input" placeholder="Type the decoded word..." maxlength="' + q.cipherText.length + '" autocomplete="off" autocapitalize="characters" style="font-size:22px;letter-spacing:6px;text-align:center;text-transform:uppercase" onkeydown="if(event.key===\'Enter\')checkCipher()">';
  html += '<button class="submit-btn" onclick="checkCipher()">Decode \u2713</button>';
  html += '</div>';
  html += renderHintBtn(q.hint);
  card.innerHTML = html;
  card.dataset.cipherAnswer = q.answer;
  setTimeout(function() { var el = document.getElementById('cipher-input'); if (el) el.focus(); }, 100);
}

function checkCipher() {
  var input = document.getElementById('cipher-input');
  var card = document.getElementById('escape-card');
  if (!input || !card) return;
  var val = input.value.trim().toUpperCase();
  var expected = card.dataset.cipherAnswer;
  if (val === expected) {
    input.style.borderColor = 'var(--success)';
    escapeCheckAnswer(val, expected, null);
  } else {
    input.style.borderColor = 'var(--error)';
    input.style.animation = 'shake-wrong 0.5s';
    if (val.length === expected.length) {
      escapeCheckAnswer(val, expected, null);
    }
  }
}

// === LOCK COMBINATION PUZZLE RENDERER ===
function renderEscapeLock(card, q) {
  var html = '<div style="font-size:36px;margin-bottom:8px">\uD83D\uDD12</div>';
  html += '<div class="question-text" style="font-size:18px">Crack the Lock!</div>';
  html += '<div style="font-size:14px;color:var(--text-secondary);margin:8px 0">Solve each problem to find the combination!</div>';

  // Three combination slots
  html += '<div style="display:flex;gap:12px;justify-content:center;margin:16px 0;align-items:flex-end">';

  var questions = [q.q1, q.q2, q.q3];
  questions.forEach(function(sub, idx) {
    html += '<div style="text-align:center">';
    html += '<div style="font-size:13px;color:var(--text-secondary);margin-bottom:6px">' + sub.text + '</div>';
    html += '<input type="number" id="lock-input-' + idx + '" class="text-input" style="width:60px;font-size:24px;text-align:center;padding:8px" maxlength="4">';
    html += '</div>';
  });

  html += '</div>';

  html += '<button class="submit-btn mt-2" onclick="checkLock()">Unlock \uD83D\uDD13</button>';
  html += renderHintBtn(q.hint);
  card.innerHTML = html;
  card.dataset.lockAnswer = q.answer;
  setTimeout(function() { var el = document.getElementById('lock-input-0'); if (el) el.focus(); }, 100);
}

function checkLock() {
  var card = document.getElementById('escape-card');
  if (!card) return;
  var val = '';
  for (var i = 0; i < 3; i++) {
    var input = document.getElementById('lock-input-' + i);
    val += (input ? input.value.trim() : '');
  }
  var expected = card.dataset.lockAnswer;
  if (val === expected) {
    escapeCheckAnswer(val, expected, null);
  } else {
    // Shake all inputs
    for (var j = 0; j < 3; j++) {
      var inp = document.getElementById('lock-input-' + j);
      if (inp) {
        inp.style.borderColor = 'var(--error)';
        inp.style.animation = 'shake-wrong 0.5s';
      }
    }
    escapeCheckAnswer(val, expected, null);
  }
}

// Override answer checking for escape rooms
var _origCheckAnswer = typeof checkAnswer === 'function' ? checkAnswer : null;
var _origSubmitText = typeof submitTextAnswer === 'function' ? submitTextAnswer : null;

function escapeCheckAnswer(given, correct, btnEl) {
  if (btnEl && btnEl.dataset.checked) return;
  var allBtns = btnEl ? btnEl.parentElement.querySelectorAll('.answer-btn') : [];
  allBtns.forEach(function(b) { b.dataset.checked = 'true'; });

  var isCorrect = String(given) === String(correct);
  escapeState.results[escapeState.currentIndex] = isCorrect;

  if (isCorrect) {
    if (btnEl) btnEl.classList.add('correct');
    playSound('correct');
    spawnParticles(window.innerWidth / 2, window.innerHeight / 3, 5, '\u2B50');
  } else {
    if (btnEl) btnEl.classList.add('wrong');
    playSound('wrong');
  }

  setTimeout(function() {
    escapeState.currentIndex++;
    renderEscapeProgress();
    renderEscapeQuestion();
  }, isCorrect ? 800 : 1200);
}

function endEscapeRoom(timedOut) {
  if (escapeState.timer) clearInterval(escapeState.timer);

  var correct = escapeState.results.filter(function(r) { return r; }).length;
  var total = escapeState.questions.length;
  var pct = total > 0 ? Math.round(correct / total * 100) : 0;
  var elapsed = Math.round((Date.now() - escapeState.startTime) / 1000);

  // Save best time
  if (!state.escapeRooms) state.escapeRooms = {};
  if (pct >= 70) {
    var prev = state.escapeRooms[escapeState.roomId];
    if (!prev || elapsed < prev.bestTime) {
      state.escapeRooms[escapeState.roomId] = { bestTime: elapsed, best: pct, date: Date.now() };
    }
  }

  // Award tokens
  var reward = 0;
  if (!timedOut && pct >= 70) {
    reward = 25 + Math.round((pct - 70) / 10) * 5;
    state.tokens += reward;
  }

  var overlay = document.getElementById('feedback-overlay');
  var card = document.getElementById('feedback-card');

  var html = '';
  if (timedOut) {
    html += '<div class="feedback-icon">\u23F0</div>';
    html += '<div class="feedback-title" style="color:var(--warning)">Time\'s Up!</div>';
  } else if (pct >= 80) {
    html += '<div class="feedback-icon">\uD83D\uDD13</div>';
    html += '<div class="feedback-title" style="color:var(--gold)">Escaped!</div>';
    playSound('levelup');
    spawnParticles(window.innerWidth / 2, window.innerHeight / 3, 15, '\uD83C\uDF89');
  } else if (pct >= 50) {
    html += '<div class="feedback-icon">\uD83D\uDE4C</div>';
    html += '<div class="feedback-title" style="color:var(--mint)">Almost there!</div>';
  } else {
    html += '<div class="feedback-icon">\uD83D\uDD12</div>';
    html += '<div class="feedback-title" style="color:var(--lavender)">Try again!</div>';
  }

  html += '<div class="feedback-message">' + correct + '/' + total + ' puzzles solved';
  if (!timedOut) html += ' in ' + formatTime(elapsed);
  html += '</div>';

  if (reward > 0) {
    html += '<div class="feedback-tokens">\u2B50 +' + reward + ' stars!</div>';
  }

  html += '<div style="display:flex;gap:12px;justify-content:center;margin-top:16px">';
  html += '<button class="feedback-btn" onclick="startEscapeRoom(\'' + escapeState.roomId + '\')" style="background:linear-gradient(135deg,var(--mint),var(--sky))">Retry</button>';
  html += '<button class="feedback-btn" onclick="document.getElementById(\'feedback-overlay\').classList.add(\'hidden\');showScreen(\'home\')">Home</button>';
  html += '</div>';

  card.innerHTML = html;
  overlay.classList.remove('hidden');
  saveState();
}

// Patch the global checkAnswer/submitTextAnswer to handle escape rooms
(function() {
  var origCheck = typeof checkAnswer === 'function' ? checkAnswer : function() {};
  var origSubmit = typeof submitTextAnswer === 'function' ? submitTextAnswer : function() {};

  // Only intercept when in escape room screen
  var _prevCheckAnswer = window.checkAnswer;
  var _prevSubmitText = window.submitTextAnswer;

  window.checkAnswer = function(given, correct, btnEl) {
    var escScreen = document.getElementById('screen-escape-room');
    if (escScreen && escScreen.classList.contains('active')) {
      escapeCheckAnswer(String(given), String(correct), btnEl);
    } else {
      _prevCheckAnswer(given, correct, btnEl);
    }
  };

  window.submitTextAnswer = function(correct) {
    var escScreen = document.getElementById('screen-escape-room');
    if (escScreen && escScreen.classList.contains('active')) {
      var input = document.getElementById('answer-input');
      if (!input) return;
      var val = parseInt(input.value);
      if (isNaN(val)) return;
      escapeCheckAnswer(String(val), String(correct), null);
      if (String(val) === String(correct)) {
        input.style.borderColor = 'var(--success)';
      } else {
        input.style.borderColor = 'var(--error)';
        input.style.animation = 'shake-wrong 0.5s';
      }
    } else {
      _prevSubmitText(correct);
    }
  };
})();
