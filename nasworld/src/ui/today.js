// ============================================================
//  TODAY — three small things, chosen for her, first on the screen.
// ============================================================
//
//  Home used to open on fifteen equal tiles. A seven year old facing
//  fifteen doors picks the one she likes, which is rarely the one she
//  needs. Most people take the path in front of them (Thaler and
//  Sunstein), so the path in front of her is now the right one: three
//  short steps, from different worlds (interleaving, Bjork), starting
//  with something due for review (spacing) and ending on something new.
//
//  The plan is fixed for the day once made, so it does not shuffle each
//  time she comes home. A step is done when she finishes a session on
//  that skill. Everything else is still one tap away below it.

function _todayKey() { return new Date().toDateString(); }

function _todayTrees() {
  return [
    ['math',  typeof MATH_TREE  !== 'undefined' ? MATH_TREE  : {}],
    ['word',  typeof WORD_TREE  !== 'undefined' ? WORD_TREE  : {}],
    ['malay', typeof MALAY_TREE !== 'undefined' ? MALAY_TREE : {}],
    ['stem',  typeof STEM_TREE  !== 'undefined' ? STEM_TREE  : {}]
  ];
}

function _todaySkill(id) {
  var trees = _todayTrees();
  for (var i = 0; i < trees.length; i++) if (trees[i][1][id]) return { def: trees[i][1][id], world: trees[i][0] };
  return null;
}

/** Open skills in one world, as {id, world, mastery, attempts, due}. */
function _todayCandidates(world, tree) {
  var out = [];
  Object.keys(tree).forEach(function (id) {
    var def = tree[id];
    if (typeof isSkillUnlocked === 'function' && !isSkillUnlocked(def)) return;
    var s = (state.skills && state.skills[id]) || {};
    out.push({
      id: id, world: world,
      mastery: s.mastery || 0, attempts: s.totalAttempts || 0,
      due: typeof isSkillDueForReview === 'function' ? !!isSkillDueForReview(id) : false
    });
  });
  return out;
}

/**
 * Pick three steps. One per world where possible, in this order of need:
 * due for review, then started but not secure, then brand new.
 */
function buildTodayPlan() {
  var perWorld = _todayTrees().map(function (t) { return _todayCandidates(t[0], t[1]); }).filter(function (c) { return c.length; });
  function need(c) { return c.due ? 0 : (c.attempts > 0 && c.mastery < 80) ? 1 : c.attempts === 0 ? 2 : 3; }
  var picks = perWorld.map(function (cands) {
    return cands.slice().sort(function (a, b) { return need(a) - need(b) || a.mastery - b.mastery; })[0];
  });
  // Worlds whose best candidate is most needed come first; keep three.
  picks.sort(function (a, b) { return need(a) - need(b); });
  picks = picks.slice(0, 3);
  // End on the newest thing: review first while she is fresh on recall.
  picks.sort(function (a, b) { return need(a) - need(b); });
  return picks.map(function (c) {
    return { id: c.id, world: c.world, kind: c.due ? 'review' : c.attempts === 0 ? 'new' : 'practice', done: false };
  });
}

function getTodayPlan() {
  var t = state.today;
  if (!t || t.date !== _todayKey() || !t.steps || !t.steps.length) {
    t = state.today = { date: _todayKey(), steps: buildTodayPlan() };
  }
  // Drop steps whose skill no longer exists (a renamed or removed skill).
  t.steps = t.steps.filter(function (s) { return !!_todaySkill(s.id); });
  return t;
}

/** Called when she finishes a session on a skill. */
function todayMarkDone(skillId) {
  if (!state.today || state.today.date !== _todayKey()) return;
  state.today.steps.forEach(function (s) { if (s.id === skillId) s.done = true; });
}

function todayStart(i) {
  var plan = getTodayPlan(), step = plan.steps[i];
  if (!step || typeof startGame !== 'function') return;
  startGame(step.id, step.world);
}

var _TODAY_WORLD = { math: 'Number World', word: 'Word World', malay: 'Dunia Melayu', stem: 'STEM World' };
var _TODAY_KIND = { review: 'a quick review', practice: 'keep going', 'new': 'new today' };

function renderToday() {
  var area = document.getElementById('today-area');
  if (!area) return;
  var plan = getTodayPlan(), steps = plan.steps;
  var lumi = ''; // Lumi sits just above this card, with her speech bubble.
  if (!steps.length) { area.innerHTML = ''; return; }

  var next = -1;
  for (var i = 0; i < steps.length; i++) if (!steps[i].done) { next = i; break; }
  var allDone = next === -1;
  var doneCount = steps.filter(function (s) { return s.done; }).length;

  var html = '<section class="today-card" aria-label="Today">' +
    '<div class="today-head">' + lumi + '<div>' +
      '<h2 class="today-title">' + (allDone ? 'All three done' : steps.length === 3 ? 'Three small things today' : 'Today') + '</h2>' +
      '<div class="today-sub">' + (allDone ? 'That is today finished. Anything else is a bonus' : doneCount ? doneCount + ' of ' + steps.length + ' done' : 'About 15 minutes') + '</div>' +
    '</div></div><ol class="today-steps">';
  steps.forEach(function (s, i) {
    var sk = _todaySkill(s.id);
    var cls = s.done ? 'done' : i === next ? 'now' : '';
    html += '<li class="' + cls + '"><span class="today-stone">' + (s.done && typeof icon === 'function' ? icon('check') : (i + 1)) + '</span>' +
      '<button type="button" class="today-step" onclick="todayStart(' + i + ')">' +
        '<span class="today-step-name">' + sk.def.name + '</span>' +
        '<span class="today-step-meta">' + _TODAY_WORLD[s.world] + ', ' + (s.done ? 'done' : _TODAY_KIND[s.kind]) + '</span>' +
      '</button></li>';
  });
  html += '</ol>';
  if (!allDone) html += '<button type="button" class="today-go" onclick="todayStart(' + next + ')">Start step ' + (next + 1) + '</button>';
  html += '</section>';
  area.innerHTML = html;
}

/** "Next: ..." line under each world door. */
function renderDoorHints() {
  _todayTrees().forEach(function (t) {
    var el = document.getElementById('door-next-' + t[0]);
    if (!el || typeof getRecommendedSkill !== 'function') return;
    var rec = getRecommendedSkill(t[1]);
    el.textContent = rec ? 'Next: ' + rec.name : '';
  });
}

if (typeof window !== 'undefined') {
  window.buildTodayPlan = buildTodayPlan; window.getTodayPlan = getTodayPlan; window.todayMarkDone = todayMarkDone;
  window.todayStart = todayStart; window.renderToday = renderToday; window.renderDoorHints = renderDoorHints;
}
