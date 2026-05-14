// ============================================================
//  COMPASS — Session opener.
//  Reads mood, proposes a session length, suggests focus,
//  invites an implementation intention.
// ============================================================
//
//  Why: a P1 learner needs a soft start, not a feature wall.
//  The Compass takes 30 seconds and routes her to the right
//  thing for today's energy level.

var MOODS = [
  { id: 'drained', face: '😴', label: 'Drained',  minutes: 8,  flavour: 'gentle' },
  { id: 'low',     face: '🙁', label: 'Low',      minutes: 10, flavour: 'gentle' },
  { id: 'okay',    face: '🙂', label: 'Okay',     minutes: 12, flavour: 'balanced' },
  { id: 'good',    face: '😊', label: 'Good',     minutes: 15, flavour: 'balanced' },
  { id: 'strong',  face: '🤩', label: 'Strong',   minutes: 18, flavour: 'stretch' }
];

var COMPASS_INTROS = [
  "Right then, princess. How are we today?",
  "Tap your mood. No wrong answers.",
  "Quick check: what kind of brain do we have right now?",
  "Tell me your mood first. Then I'll plan."
];

function getCompassState() {
  if (!state.compass) {
    state.compass = {
      lastOpenedDate: '',
      lastMood: '',
      currentSession: null,
      moodHistory: []   // [{date, mood}]
    };
  }
  return state.compass;
}

function compassRecordMood(moodId) {
  var c = getCompassState();
  var today = new Date().toDateString();
  c.lastMood = moodId;
  c.lastOpenedDate = today;
  if (!Array.isArray(c.moodHistory)) c.moodHistory = [];
  c.moodHistory.push({ date: today, mood: moodId });
  if (c.moodHistory.length > 60) c.moodHistory = c.moodHistory.slice(-60);
  saveState();
}

function compassRecordPlan(plan) {
  var c = getCompassState();
  c.currentSession = {
    started: Date.now(),
    minutes: plan.minutes,
    intention: plan.intention || '',
    suggestedSkill: plan.suggestedSkill || null,
    mood: c.lastMood
  };
  saveState();
}

function compassFindWeakSkill() {
  var weakest = null;
  if (!state.skills) return null;
  Object.keys(state.skills).forEach(function(id) {
    var s = state.skills[id];
    if ((s.totalAttempts || 0) < 2) return;
    if (!weakest || (s.mastery || 0) < (weakest.mastery || 0)) {
      weakest = { id: id, mastery: s.mastery || 0 };
    }
  });
  return weakest;
}

function compassFindFreshSkill() {
  // A skill that has zero attempts and no missing deps
  var allTrees = Object.assign({},
    typeof MATH_TREE  !== 'undefined' ? MATH_TREE  : {},
    typeof WORD_TREE  !== 'undefined' ? WORD_TREE  : {},
    typeof STEM_TREE  !== 'undefined' ? STEM_TREE  : {},
    typeof MALAY_TREE !== 'undefined' ? MALAY_TREE : {}
  );
  var ids = Object.keys(allTrees);
  for (var i = 0; i < ids.length; i++) {
    var id = ids[i];
    var s = state.skills && state.skills[id];
    if (!s || (s.totalAttempts || 0) === 0) {
      // Check deps mastered enough
      var deps = allTrees[id].deps || [];
      var depsOk = deps.every(function(d) {
        var ds = state.skills && state.skills[d];
        return !!(ds && (ds.totalAttempts || 0) > 0);
      });
      if (depsOk) {
        return { id: id, name: allTrees[id].name, world: _skillToWorld(id) };
      }
    }
  }
  return null;
}

function _skillToWorld(skillId) {
  if (typeof MATH_TREE  !== 'undefined' && MATH_TREE[skillId])  return 'math';
  if (typeof WORD_TREE  !== 'undefined' && WORD_TREE[skillId])  return 'word';
  if (typeof STEM_TREE  !== 'undefined' && STEM_TREE[skillId])  return 'stem';
  if (typeof MALAY_TREE !== 'undefined' && MALAY_TREE[skillId]) return 'malay';
  return null;
}

function _skillName(skillId) {
  var allTrees = Object.assign({},
    typeof MATH_TREE  !== 'undefined' ? MATH_TREE  : {},
    typeof WORD_TREE  !== 'undefined' ? WORD_TREE  : {},
    typeof STEM_TREE  !== 'undefined' ? STEM_TREE  : {},
    typeof MALAY_TREE !== 'undefined' ? MALAY_TREE : {}
  );
  var s = allTrees[skillId];
  return s ? (s.icon + ' ' + s.name) : skillId;
}

function _greetingByTime() {
  var h = new Date().getHours();
  if (h < 7)  return 'Up bright and early!';
  if (h < 12) return 'Good morning, princess!';
  if (h < 17) return 'Selamat petang, Anastasia!';
  if (h < 21) return 'Evening, sparkles!';
  return 'Bedtime brain is the cosiest brain.';
}

function renderCompass() {
  var container = document.getElementById('compass-content');
  if (!container) return;

  var c = getCompassState();
  var greet = _greetingByTime();

  // Step 1: mood check
  var moodCards = MOODS.map(function(m) {
    var selected = c.lastMood === m.id && c.lastOpenedDate === new Date().toDateString();
    return '<button class="compass-mood' + (selected ? ' selected' : '') + '" data-mood="' + m.id + '">' +
      '<span class="compass-face">' + m.face + '</span>' +
      '<span class="compass-mood-label">' + m.label + '</span>' +
    '</button>';
  }).join('');

  var html = '<button class="back-btn" onclick="showScreen(\'home\')">← Back to Home</button>';
  html += '<div class="compass-shell">';
  html += '<div class="compass-greet">' + greet + '</div>';
  html += '<div class="compass-intro">' + (typeof pick === 'function' ? pick(COMPASS_INTROS) : COMPASS_INTROS[0]) + '</div>';
  html += '<div class="compass-moods">' + moodCards + '</div>';
  html += '<div class="compass-plan" id="compass-plan"></div>';
  html += '</div>';
  container.innerHTML = html;

  container.querySelectorAll('.compass-mood').forEach(function(btn) {
    btn.addEventListener('click', function() {
      var moodId = btn.dataset.mood;
      compassRecordMood(moodId);
      renderCompassPlan(moodId);
      container.querySelectorAll('.compass-mood').forEach(function(b) { b.classList.toggle('selected', b === btn); });
    });
  });

  // If mood already chosen today, show plan immediately
  if (c.lastMood && c.lastOpenedDate === new Date().toDateString()) {
    renderCompassPlan(c.lastMood);
  }
}

function renderCompassPlan(moodId) {
  var planEl = document.getElementById('compass-plan');
  if (!planEl) return;
  var mood = MOODS.find(function(m) { return m.id === moodId; }) || MOODS[2];

  // Build suggestions
  var dueIds = (typeof getSkillsDueForReview === 'function') ? getSkillsDueForReview() : [];
  var weak = compassFindWeakSkill();
  var fresh = compassFindFreshSkill();

  var suggestions = [];
  if (mood.flavour === 'gentle') {
    // Soft mode: review + nothing too new
    if (dueIds.length > 0) {
      suggestions.push({ kind: 'review', label: 'A quick review of ' + _skillName(dueIds[0]), skillId: dueIds[0] });
    } else if (weak) {
      suggestions.push({ kind: 'review', label: 'A friendly redo: ' + _skillName(weak.id), skillId: weak.id });
    }
    suggestions.push({ kind: 'companion', label: 'Tap Lumi for a joke', action: 'lumi' });
  } else if (mood.flavour === 'balanced') {
    if (dueIds.length > 0) {
      suggestions.push({ kind: 'review', label: 'Review: ' + _skillName(dueIds[0]), skillId: dueIds[0] });
    }
    if (weak && (!dueIds.length || dueIds[0] !== weak.id)) {
      suggestions.push({ kind: 'practice', label: 'Practise: ' + _skillName(weak.id), skillId: weak.id });
    }
    suggestions.push({ kind: 'adventure', label: 'Pop into the Mega Map', action: 'mega-map' });
  } else { // stretch
    if (fresh) {
      suggestions.push({ kind: 'new', label: 'Try something new: ' + _skillName(fresh.id), skillId: fresh.id, worldType: fresh.world });
    }
    if (weak) {
      suggestions.push({ kind: 'practice', label: 'Push: ' + _skillName(weak.id), skillId: weak.id });
    }
    suggestions.push({ kind: 'adventure', label: 'Crack an adventure on the Mega Map', action: 'mega-map' });
  }

  var html = '<div class="compass-plan-card">';
  html += '<div class="compass-plan-title">' + mood.face + ' Plan for a <b>' + mood.label.toLowerCase() + '</b> brain</div>';
  html += '<div class="compass-plan-len">~ ' + mood.minutes + ' minutes today</div>';
  html += '<div class="compass-suggestions">';
  suggestions.forEach(function(s) {
    if (s.action === 'lumi') {
      html += '<button class="compass-suggest" onclick="showScreen(\'home\');setTimeout(lumiSpeak,300)">✨ ' + s.label + '</button>';
    } else if (s.action === 'mega-map') {
      html += '<button class="compass-suggest" onclick="showScreen(\'mega-map\')">✨ ' + s.label + '</button>';
    } else if (s.skillId) {
      var world = s.worldType || _skillToWorld(s.skillId) || 'math';
      html += '<button class="compass-suggest" onclick="openSkillView(\'' + s.skillId + '\',\'' + world + '\')">▶ ' + s.label + '</button>';
    }
  });
  html += '</div>';

  // Implementation intention
  html += '<div class="compass-intention">';
  html += '<div class="compass-intention-label">Tiny promise to yourself (optional):</div>';
  html += '<div class="compass-intention-text">In the next ' + mood.minutes + ' minutes I will <input type="text" id="compass-intention-input" placeholder="e.g. nail two punctuation questions" maxlength="80" /></div>';
  html += '<button class="lesson-btn lesson-btn-done" onclick="compassCommit()">Lock it in →</button>';
  html += '</div>';

  // Pomodoro link
  if (typeof startPomodoroForCompass === 'function') {
    html += '<button class="compass-tertiary" onclick="startPomodoroForCompass(' + mood.minutes + ')">Start the ' + mood.minutes + '-minute Pomodoro</button>';
  }

  // Rest-day nudge
  var streakDays = (state.visitHistory || []).length;
  if (streakDays >= 5) {
    html += '<div class="compass-rest">';
    html += '5 days in a row — your brain has been working hard. ';
    html += 'Want a soft day? Just tap Lumi, browse the Mega Map, or pick one flashcard set. Your streak is safe.';
    html += '</div>';
  }
  html += '</div>';
  planEl.innerHTML = html;
}

function compassCommit() {
  var input = document.getElementById('compass-intention-input');
  var intention = input ? input.value.trim() : '';
  var mood = (state.compass && state.compass.lastMood) || 'okay';
  var moodMeta = MOODS.find(function(m) { return m.id === mood; }) || MOODS[2];
  compassRecordPlan({ minutes: moodMeta.minutes, intention: intention });
  if (typeof lumiReactTo === 'function') lumiReactTo('correct');
  if (typeof spawnParticles === 'function') spawnParticles(window.innerWidth/2, 120, 6, '✨');
  if (typeof lumiSay === 'function') {
    lumiSay(intention ? 'Locked it in: ' + intention : 'Plan locked in. Let\'s go!');
  }
  setTimeout(function() { showScreen('home'); }, 700);
}

window.renderCompass = renderCompass;
window.compassCommit = compassCommit;
