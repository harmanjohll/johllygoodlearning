// ============================================================
//  MATH DRILL — Targeted practice configuration.
//
//  The gap this closes: before this, tapping a skill gave you 8
//  random questions and no say in the matter. You could not drill
//  "just the 7 times table", could not choose how many questions,
//  could not ask for word problems only.
//
//  Now every math skill can open a Drill Setup screen first.
//  What you can choose is declared per-skill in DRILL_OPTIONS.
// ============================================================

// ---- Sub-skill mastery --------------------------------------------------
//  Tracks performance at a finer grain than the skill. For 'mul' the
//  sub-key is the times table ("7"); for 'add' it is the number band
//  ("1-10"). This is what makes "your weakest table is 8" possible.

function getSubSkills(skillId) {
  var s = getSkillState(skillId);
  if (!s.sub) s.sub = {};
  return s.sub;
}

function getSubSkill(skillId, subKey) {
  var sub = getSubSkills(skillId);
  var k = String(subKey);
  if (!sub[k]) {
    sub[k] = { attempts: 0, correct: 0, streak: 0, bestStreak: 0, lastSeen: 0, totalMs: 0 };
  }
  return sub[k];
}

function recordSubSkill(skillId, subKey, correct, elapsedMs) {
  if (subKey === undefined || subKey === null || subKey === '') return;
  var ss = getSubSkill(skillId, subKey);
  ss.attempts++;
  if (correct) {
    ss.correct++;
    ss.streak++;
    if (ss.streak > ss.bestStreak) ss.bestStreak = ss.streak;
  } else {
    ss.streak = 0;
  }
  ss.lastSeen = Date.now();
  if (elapsedMs && elapsedMs > 0 && elapsedMs < 60000) ss.totalMs += elapsedMs;
  saveState();
}

/** 0-100. Unattempted returns null so the UI can show "not tried yet". */
function subSkillMastery(skillId, subKey) {
  var ss = getSubSkills(skillId)[String(subKey)];
  if (!ss || ss.attempts === 0) return null;
  var acc = ss.correct / ss.attempts;
  // Confidence grows with attempts so 1/1 isn't "mastered".
  var confidence = Math.min(1, ss.attempts / 8);
  var speedBonus = 0;
  if (ss.correct > 0 && ss.totalMs > 0) {
    var avgMs = ss.totalMs / ss.correct;
    if (avgMs < 4000) speedBonus = 10;
    else if (avgMs < 7000) speedBonus = 5;
  }
  return Math.min(100, Math.round(acc * 85 * confidence + (ss.bestStreak >= 5 ? 10 : 0) + speedBonus));
}

/** Ordered weakest-first. Untried tables count as weak (they need attention). */
function weakestSubSkills(skillId, candidates, n) {
  var scored = candidates.map(function(c) {
    var m = subSkillMastery(skillId, c);
    return { key: c, mastery: m === null ? -1 : m };
  });
  scored.sort(function(a, b) {
    // Untried (-1) sits just above genuinely weak, so we revisit known
    // weaknesses before exploring brand new ground.
    var am = a.mastery === -1 ? 35 : a.mastery;
    var bm = b.mastery === -1 ? 35 : b.mastery;
    return am - bm;
  });
  return scored.slice(0, n || 3).map(function(s) { return s.key; });
}

// ---- What each skill lets you configure --------------------------------

var DRILL_OPTIONS = {
  count: {
    title: 'Counting & Numbers',
    icon: '🔟',
    ranges: [
      { key: 'to-10',   label: 'Up to 10',   range: [1, 10] },
      { key: 'to-20',   label: 'Up to 20',   range: [1, 20] },
      { key: 'to-50',   label: 'Up to 50',   range: [1, 50] },
      { key: 'to-100',  label: 'Up to 100',  range: [1, 100] },
      { key: 'words',   label: 'Numbers in words', range: [1, 100], flag: 'words' },
      { key: 'ordinal', label: 'First, second, third…', range: [1, 10], flag: 'ordinal' }
    ],
    modes: ['practice', 'speed'],
    counts: [5, 10, 20],
    blurb: 'Count to ten, then twenty, then all the way to a hundred.'
  },
  mul: {
    title: 'Times Tables',
    icon: '✖️',
    tables: { label: 'Which times tables?', values: [1,2,3,4,5,6,7,8,9,10,11,12], subLabel: function(t){ return t + '×'; } },
    modes: ['practice', 'speed', 'word'],
    counts: [5, 10, 20],
    blurb: 'Pick the tables you want to practise. Tap a few, or let me choose your trickiest.'
  },
  div: {
    title: 'Division',
    icon: '➗',
    tables: { label: 'Divide by which number?', values: [2,3,4,5,6,7,8,9,10], subLabel: function(t){ return '÷' + t; } },
    modes: ['practice', 'speed', 'word'],
    counts: [5, 10, 20],
    blurb: 'Choose which numbers to divide by.'
  },
  add: {
    title: 'Addition',
    icon: '➕',
    ranges: [
      { key: '1-5',   label: 'Up to 5',   range: [1, 5] },
      { key: '1-10',  label: 'Up to 10',  range: [1, 10] },
      { key: '1-20',  label: 'Up to 20',  range: [1, 20] },
      { key: '1-100', label: 'Up to 100', range: [1, 100] }
    ],
    modes: ['practice', 'speed', 'word'],
    counts: [5, 10, 20],
    blurb: 'How big should the numbers be?'
  },
  sub: {
    title: 'Subtraction',
    icon: '➖',
    ranges: [
      { key: '1-5',   label: 'Up to 5',   range: [1, 5] },
      { key: '1-10',  label: 'Up to 10',  range: [1, 10] },
      { key: '1-20',  label: 'Up to 20',  range: [1, 20] },
      { key: '1-100', label: 'Up to 100', range: [1, 100] }
    ],
    modes: ['practice', 'speed', 'word'],
    counts: [5, 10, 20],
    blurb: 'How big should the numbers be?'
  },
  add100: {
    title: 'Addition to 100', icon: '➕',
    ranges: [
      { key: 'no-regroup', label: 'Easy (no carrying)', range: [1, 99], flag: 'noRegroup' },
      { key: 'regroup',    label: 'With carrying',      range: [1, 99], flag: 'regroup' },
      { key: 'mixed',      label: 'Mixed',              range: [1, 99] }
    ],
    modes: ['practice', 'speed', 'word'], counts: [5, 10, 20],
    blurb: 'Carrying is the tricky bit. Practise it on its own.'
  },
  sub100: {
    title: 'Subtraction to 100', icon: '➖',
    ranges: [
      { key: 'no-regroup', label: 'Easy (no borrowing)', range: [1, 99], flag: 'noRegroup' },
      { key: 'regroup',    label: 'With borrowing',      range: [1, 99], flag: 'regroup' },
      { key: 'mixed',      label: 'Mixed',               range: [1, 99] }
    ],
    modes: ['practice', 'speed', 'word'], counts: [5, 10, 20],
    blurb: 'Borrowing is the tricky bit. Practise it on its own.'
  },
  nbond: {
    title: 'Number Bonds', icon: '🔗',
    ranges: [
      { key: 'to-5',  label: 'Bonds to 5',  range: [1, 5] },
      { key: 'to-10', label: 'Bonds to 10', range: [1, 10] },
      { key: 'to-20', label: 'Bonds to 20', range: [1, 20] }
    ],
    modes: ['practice', 'speed'], counts: [5, 10, 20],
    blurb: 'Bonds to 10 are the foundation of everything. Get these automatic.'
  },
  time1: {
    title: 'Telling Time', icon: '🕐',
    ranges: [
      { key: 'oclock',   label: "O'clock only",     range: [0, 0],  flag: 'oclock' },
      { key: 'half',     label: "O'clock + half past", range: [0, 30], flag: 'half' },
      { key: 'quarter',  label: 'Add quarter past/to', range: [0, 45], flag: 'quarter' },
      { key: 'fivemin',  label: 'Five minute steps',   range: [0, 55], flag: 'fivemin' }
    ],
    modes: ['practice'], counts: [5, 10],
    blurb: 'Start with o\'clock. Add half past when that feels easy.'
  },
  money: {
    title: 'Money', icon: '💰',
    ranges: [
      { key: 'coins',  label: 'Counting coins',  range: [1, 100], flag: 'coins' },
      { key: 'add',    label: 'Adding money',    range: [1, 20],  flag: 'add' },
      { key: 'change', label: 'Giving change',   range: [1, 20],  flag: 'change' }
    ],
    modes: ['practice', 'word'], counts: [5, 10],
    blurb: 'Singapore dollars and cents.'
  },
  wp1: {
    title: 'Story Problems', icon: '📝',
    structures: [
      { key: 'part-whole', label: 'Part & Whole', hint: 'Two parts make a whole' },
      { key: 'change',     label: 'Change',       hint: 'Something is added or taken away' },
      { key: 'comparison', label: 'Compare',      hint: 'How many more or fewer' },
      { key: 'mixed',      label: 'Mixed',        hint: 'A bit of everything' }
    ],
    modes: ['word'], counts: [5, 10],
    blurb: 'Word problems in the Singapore style. Draw a bar model if it helps!'
  },
  multiwp: {
    title: 'Two-Step Problems', icon: '🧩',
    structures: [
      { key: 'mixed', label: 'Mixed', hint: 'Two steps, any operation' }
    ],
    modes: ['word'], counts: [5, 10],
    blurb: 'Two steps. Find the hidden middle number first.'
  }
};

var DRILL_MODE_META = {
  practice: { label: 'Practice',   icon: '🎯', desc: 'Take your time. Hints available.' },
  speed:    { label: 'Speed Drill',icon: '⚡', desc: 'Beat the clock. Builds fluency.' },
  word:     { label: 'Story Problems', icon: '📖', desc: 'Real-life word problems.' }
};

function skillHasDrill(skillId) {
  return !!DRILL_OPTIONS[skillId];
}

// ---- Saved config -------------------------------------------------------

function getDrillConfig(skillId) {
  if (!state.drillConfigs) state.drillConfigs = {};
  if (!state.drillConfigs[skillId]) {
    var opt = DRILL_OPTIONS[skillId] || {};
    state.drillConfigs[skillId] = {
      tables: opt.tables ? opt.tables.values.slice() : null,
      rangeKey: opt.ranges ? opt.ranges[Math.min(1, opt.ranges.length - 1)].key : null,
      structure: opt.structures ? 'mixed' : null,
      mode: (opt.modes && opt.modes[0]) || 'practice',
      count: 10,
      theme: 'mixed',
      useAI: false
    };
  }
  return state.drillConfigs[skillId];
}

function setDrillConfig(skillId, patch) {
  var cfg = getDrillConfig(skillId);
  Object.keys(patch).forEach(function(k) { cfg[k] = patch[k]; });
  saveState();
  return cfg;
}

/** Turn the saved UI config into the shape the generators consume. */
function resolveDrillConfig(skillId) {
  var opt = DRILL_OPTIONS[skillId] || {};
  var cfg = getDrillConfig(skillId);
  var resolved = {
    mode: cfg.mode,
    count: cfg.count,
    theme: cfg.theme,
    useAI: cfg.useAI && typeof aiEnabled === 'function' && aiEnabled()
  };
  if (opt.tables) {
    resolved.tables = (cfg.tables && cfg.tables.length) ? cfg.tables.slice() : opt.tables.values.slice();
  }
  if (opt.ranges) {
    var r = opt.ranges.find(function(x) { return x.key === cfg.rangeKey; }) || opt.ranges[0];
    resolved.numberRange = r.range.slice();
    resolved.rangeKey = r.key;
    if (r.flag) resolved.flag = r.flag;
  }
  if (opt.structures) {
    resolved.structure = cfg.structure || 'mixed';
  }
  return resolved;
}

// ---- Practice hub -------------------------------------------------------
//
//  The skill tree is the guided journey: it gates, it unlocks, it tells
//  a child where to go next. That is the right model for exploring.
//
//  It is the wrong model for "I want to drill the 7 times table tonight".
//  This screen is the other door — you already know what you want, so
//  everything drillable is here, ungated, one tap from Home. Locked
//  skills still show as "new" so the tree's pacing is visible, but a
//  parent is never blocked from practising something deliberately.

var PRACTICE_GROUPS = [
  { title: 'Times Tables & Sharing', skills: ['mul', 'div'] },
  { title: 'Adding & Taking Away',   skills: ['add', 'sub', 'add100', 'sub100', 'nbond'] },
  { title: 'Numbers',                skills: ['count'] },
  { title: 'Time & Money',           skills: ['time1', 'money'] },
  { title: 'Story Problems',         skills: ['wp1', 'multiwp'] }
];

function renderPracticeHub() {
  var c = document.getElementById('practice-content');
  if (!c) return;

  var html = '<button class="back-btn" onclick="showScreen(\'home\')">← Back to Home</button>';
  html += '<div class="practice-head">';
  html += '<div class="practice-head-icon">🎯</div>';
  html += '<h2 class="practice-title">Practice</h2>';
  html += '<p class="practice-sub">Pick exactly what you want to work on.</p>';
  html += '</div>';

  // Tricks first: knowing a method beats grinding through questions
  // without one.
  var trickCount = (typeof MATH_TRICKS !== 'undefined') ? MATH_TRICKS.length : 0;
  if (trickCount) {
    var seenCount = 0;
    MATH_TRICKS.forEach(function(t) { if (getTrickState(t.id).seen) seenCount++; });
    html += '<button class="practice-tricks-banner" onclick="window._tricksFilterSkill=null;showScreen(\'tricks\')">';
    html += '<span class="ptb-icon">🧠</span>';
    html += '<span class="ptb-body"><b>Maths Tricks</b><br>' +
            '<span class="ptb-sub">' + seenCount + ' of ' + trickCount + ' learned · includes the Trachtenberg system</span></span>';
    html += '<span class="ptb-arrow">›</span>';
    html += '</button>';
  }

  PRACTICE_GROUPS.forEach(function(group) {
    var available = group.skills.filter(function(id) {
      return DRILL_OPTIONS[id] && (typeof MATH_TREE === 'undefined' || MATH_TREE[id]);
    });
    if (available.length === 0) return;

    html += '<div class="practice-group">';
    html += '<div class="practice-group-title">' + group.title + '</div>';
    html += '<div class="practice-cards">';

    available.forEach(function(id) {
      var opt = DRILL_OPTIONS[id];
      var st = (typeof getSkillState === 'function') ? getSkillState(id) : { mastery: 0 };
      var m = st.mastery || 0;
      var tone = m >= 80 ? 'strong' : (m >= 40 ? 'ok' : 'new');

      // A one-line summary of the weakest bit, so the card tells her
      // something she does not already know.
      var detail = '';
      if (opt.tables && typeof weakestSubSkills === 'function') {
        var tried = opt.tables.values.filter(function(t) { return subSkillMastery(id, t) !== null; });
        if (tried.length > 0) {
          var weak = weakestSubSkills(id, tried, 1)[0];
          detail = 'Trickiest right now: ' + weak + (id === 'div' ? '÷' : '×');
        } else {
          detail = opt.tables.values.length + ' tables to choose from';
        }
      } else if (opt.ranges) {
        detail = opt.ranges.length + ' levels to choose from';
      } else if (opt.structures) {
        detail = 'Singapore bar model problems';
      }

      html += '<button class="practice-card ' + tone + '" onclick="openDrillSetup(\'' + id + '\',\'math\')">';
      html += '<div class="practice-card-icon">' + opt.icon + '</div>';
      html += '<div class="practice-card-body">';
      html += '<div class="practice-card-name">' + opt.title + '</div>';
      html += '<div class="practice-card-detail">' + detail + '</div>';
      html += '<div class="practice-card-bar"><span style="width:' + m + '%"></span></div>';
      html += '</div>';
      html += '<div class="practice-card-pct">' + m + '%</div>';
      html += '</button>';
    });

    html += '</div></div>';
  });

  c.innerHTML = html;
}

// ---- Drill setup screen -------------------------------------------------

function openDrillSetup(skillId, worldType) {
  window._drillSkillId = skillId;
  window._drillWorldType = worldType || 'math';
  showScreen('drill-setup');
  renderDrillSetup();
}

function renderDrillSetup() {
  var skillId = window._drillSkillId;
  var container = document.getElementById('drill-setup-content');
  if (!container || !skillId) return;
  var opt = DRILL_OPTIONS[skillId];
  if (!opt) { startGame(skillId, window._drillWorldType); return; }
  var cfg = getDrillConfig(skillId);

  var html = '';
  html += '<button class="back-btn" onclick="showScreen(\'practice\')">← Back to Practice</button>';
  html += '<div class="drill-head">';
  html += '<div class="drill-head-icon">' + opt.icon + '</div>';
  html += '<h2 class="drill-title">' + opt.title + '</h2>';
  html += '<p class="drill-blurb">' + opt.blurb + '</p>';
  html += '</div>';
  // Everything sits above a sticky start bar, so the scroll area needs
  // room to clear it.
  html += '<div class="drill-scroll">';

  // --- Times tables / divisor picker ---
  if (opt.tables) {
    var selected = cfg.tables || [];
    html += '<div class="drill-section">';
    html += '<div class="drill-section-title">' + opt.tables.label + '</div>';
    html += '<div class="drill-quickrow">';
    html += '<button class="drill-quick" onclick="drillSelectAll()">All</button>';
    html += '<button class="drill-quick drill-quick-weak" onclick="drillSelectWeakest()">⚠️ My trickiest 3</button>';
    html += '<button class="drill-quick" onclick="drillSelectNone()">Clear</button>';
    html += '</div>';
    html += '<div class="drill-tables">';
    opt.tables.values.forEach(function(t) {
      var m = subSkillMastery(skillId, t);
      var isOn = selected.indexOf(t) !== -1;
      var cls = 'drill-table' + (isOn ? ' on' : '');
      if (m !== null) {
        if (m >= 80) cls += ' mastered';
        else if (m >= 50) cls += ' learning';
        else cls += ' weak';
      }
      html += '<button class="' + cls + '" onclick="drillToggleTable(' + t + ')">';
      html += '<span class="drill-table-num">' + opt.tables.subLabel(t) + '</span>';
      html += '<span class="drill-table-bar"><span class="drill-table-fill" style="width:' + (m === null ? 0 : m) + '%"></span></span>';
      html += '<span class="drill-table-pct">' + (m === null ? 'new' : m + '%') + '</span>';
      html += '</button>';
    });
    html += '</div>';
    html += '<div class="drill-legend"><span class="dl weak"></span>Needs work <span class="dl learning"></span>Getting there <span class="dl mastered"></span>Mastered</div>';
    html += '</div>';
  }

  // --- Number range / variant picker ---
  if (opt.ranges) {
    html += '<div class="drill-section">';
    html += '<div class="drill-section-title">How hard?</div>';
    html += '<div class="drill-chiprow">';
    opt.ranges.forEach(function(r) {
      var on = cfg.rangeKey === r.key;
      var m = subSkillMastery(skillId, r.key);
      html += '<button class="drill-chip' + (on ? ' on' : '') + '" onclick="drillSetRange(\'' + r.key + '\')">' +
        r.label + (m !== null ? ' <span class="drill-chip-pct">' + m + '%</span>' : '') + '</button>';
    });
    html += '</div></div>';
  }

  // --- Word problem structure picker ---
  if (opt.structures) {
    html += '<div class="drill-section">';
    html += '<div class="drill-section-title">What kind of story?</div>';
    html += '<div class="drill-chiprow">';
    opt.structures.forEach(function(s) {
      var on = cfg.structure === s.key;
      html += '<button class="drill-chip' + (on ? ' on' : '') + '" onclick="drillSetStructure(\'' + s.key + '\')" title="' + s.hint + '">' + s.label + '</button>';
    });
    html += '</div></div>';
  }

  // --- Mode picker ---
  if (opt.modes && opt.modes.length > 1) {
    html += '<div class="drill-section">';
    html += '<div class="drill-section-title">How do you want to practise?</div>';
    html += '<div class="drill-modes">';
    opt.modes.forEach(function(m) {
      var meta = DRILL_MODE_META[m];
      var on = cfg.mode === m;
      html += '<button class="drill-mode' + (on ? ' on' : '') + '" onclick="drillSetMode(\'' + m + '\')">';
      html += '<div class="drill-mode-icon">' + meta.icon + '</div>';
      html += '<div class="drill-mode-label">' + meta.label + '</div>';
      html += '<div class="drill-mode-desc">' + meta.desc + '</div>';
      html += '</button>';
    });
    html += '</div></div>';
  }

  // --- Question count ---
  html += '<div class="drill-section">';
  html += '<div class="drill-section-title">How many questions?</div>';
  html += '<div class="drill-chiprow">';
  (opt.counts || [5, 10, 20]).forEach(function(c) {
    html += '<button class="drill-chip' + (cfg.count === c ? ' on' : '') + '" onclick="drillSetCount(' + c + ')">' + c + '</button>';
  });
  html += '</div></div>';

  // --- AI toggle (only if a key is set) ---
  if (typeof aiEnabled === 'function' && aiEnabled()) {
    html += '<div class="drill-section drill-ai">';
    html += '<label class="drill-ai-row">';
    html += '<input type="checkbox" ' + (cfg.useAI ? 'checked' : '') + ' onchange="drillToggleAI(this.checked)">';
    html += '<span><strong>✨ Fresh AI story problems</strong><br><span class="drill-ai-sub">Brand new problems written just for you. Needs internet.</span></span>';
    html += '</label>';
    if (cfg.useAI) {
      html += '<div class="drill-themes">';
      ['mixed', 'animals', 'space', 'football', 'baking', 'flowers', 'Singapore hawker centre'].forEach(function(t) {
        html += '<button class="drill-chip small' + (cfg.theme === t ? ' on' : '') + '" onclick="drillSetTheme(\'' + t + '\')">' + t + '</button>';
      });
      html += '</div>';
    }
    html += '</div>';
  }

  html += '</div>'; // .drill-scroll

  // --- Sticky start bar ---
  // The start button used to sit at the very bottom of a long scrolling
  // form, so on a phone you had to scroll past every option to begin.
  // It now stays on screen and states exactly what is about to happen.
  var summary = [];
  if (opt.tables) {
    var sel = cfg.tables || [];
    if (sel.length === 0) summary.push('nothing picked yet');
    else if (sel.length === opt.tables.values.length) summary.push('all tables');
    else summary.push(sel.map(function(t) { return opt.tables.subLabel(t); }).join(' '));
  }
  if (opt.ranges && cfg.rangeKey) {
    var rr = opt.ranges.find(function(x) { return x.key === cfg.rangeKey; });
    if (rr) summary.push(rr.label.toLowerCase());
  }
  if (opt.structures && cfg.structure) summary.push(cfg.structure.replace('-', ' '));
  summary.push(cfg.count + ' questions');

  var ready = !(opt.tables && (!cfg.tables || cfg.tables.length === 0));
  html += '<div class="drill-bar">';
  html += '<div class="drill-bar-summary">' + summary.join(' · ') + '</div>';
  html += '<button class="drill-start' + (ready ? '' : ' disabled') + '" onclick="drillStart()">' +
          (DRILL_MODE_META[cfg.mode] || {}).icon + ' Start</button>';
  html += '</div>';

  container.innerHTML = html;
}

// ---- Setup screen handlers ---------------------------------------------

function drillToggleTable(t) {
  var skillId = window._drillSkillId;
  var cfg = getDrillConfig(skillId);
  if (!cfg.tables) cfg.tables = [];
  var i = cfg.tables.indexOf(t);
  if (i === -1) cfg.tables.push(t); else cfg.tables.splice(i, 1);
  cfg.tables.sort(function(a, b) { return a - b; });
  saveState();
  renderDrillSetup();
  if (typeof playSound === 'function') playSound('click');
}
function drillSelectAll() {
  var skillId = window._drillSkillId;
  setDrillConfig(skillId, { tables: DRILL_OPTIONS[skillId].tables.values.slice() });
  renderDrillSetup();
}
function drillSelectNone() {
  setDrillConfig(window._drillSkillId, { tables: [] });
  renderDrillSetup();
}
function drillSelectWeakest() {
  var skillId = window._drillSkillId;
  var vals = DRILL_OPTIONS[skillId].tables.values;
  var weak = weakestSubSkills(skillId, vals, 3);
  setDrillConfig(skillId, { tables: weak });
  renderDrillSetup();
  if (typeof lumiSay === 'function') {
    lumiSay('Picked your trickiest: ' + weak.join(', ') + '. Let\'s make them easy!');
  }
}
function drillSetRange(k)     { setDrillConfig(window._drillSkillId, { rangeKey: k });  renderDrillSetup(); }
function drillSetStructure(k) { setDrillConfig(window._drillSkillId, { structure: k }); renderDrillSetup(); }
function drillSetMode(m)      { setDrillConfig(window._drillSkillId, { mode: m });      renderDrillSetup(); }
function drillSetCount(c)     { setDrillConfig(window._drillSkillId, { count: c });     renderDrillSetup(); }
function drillSetTheme(t)     { setDrillConfig(window._drillSkillId, { theme: t });     renderDrillSetup(); }
function drillToggleAI(on) {
  var skillId = window._drillSkillId;
  setDrillConfig(skillId, { useAI: !!on });
  renderDrillSetup();
  if (on && typeof aiPrefetch === 'function') {
    // Warm the queue while she is still choosing, so question 1 is instant.
    aiPrefetch(skillId, resolveDrillConfig(skillId));
  }
}

function drillStart() {
  var skillId = window._drillSkillId;
  var opt = DRILL_OPTIONS[skillId];
  var cfg = getDrillConfig(skillId);
  if (opt.tables && (!cfg.tables || cfg.tables.length === 0)) {
    if (typeof lumiSay === 'function') lumiSay('Pick at least one to practise!');
    return;
  }
  var resolved = resolveDrillConfig(skillId);
  startGame(skillId, window._drillWorldType || 'math', resolved);
}

window.getSubSkill = getSubSkill;
window.recordSubSkill = recordSubSkill;
window.subSkillMastery = subSkillMastery;
window.weakestSubSkills = weakestSubSkills;
window.skillHasDrill = skillHasDrill;
window.getDrillConfig = getDrillConfig;
window.resolveDrillConfig = resolveDrillConfig;
window.openDrillSetup = openDrillSetup;
window.renderDrillSetup = renderDrillSetup;
window.renderPracticeHub = renderPracticeHub;
window.drillToggleTable = drillToggleTable;
window.drillSelectAll = drillSelectAll;
window.drillSelectNone = drillSelectNone;
window.drillSelectWeakest = drillSelectWeakest;
window.drillSetRange = drillSetRange;
window.drillSetStructure = drillSetStructure;
window.drillSetMode = drillSetMode;
window.drillSetCount = drillSetCount;
window.drillSetTheme = drillSetTheme;
window.drillToggleAI = drillToggleAI;
window.drillStart = drillStart;
window.DRILL_OPTIONS = DRILL_OPTIONS;
