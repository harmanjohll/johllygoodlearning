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
  html += '<button class="back-btn" onclick="showScreen(\'math-world\')">← Back</button>';
  html += '<div class="drill-head">';
  html += '<div class="drill-head-icon">' + opt.icon + '</div>';
  html += '<h2 class="drill-title">' + opt.title + '</h2>';
  html += '<p class="drill-blurb">' + opt.blurb + '</p>';
  html += '</div>';

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

  // --- Start ---
  html += '<button class="drill-start" onclick="drillStart()">Start ' + (DRILL_MODE_META[cfg.mode] || {}).label + ' →</button>';

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
