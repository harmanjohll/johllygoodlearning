/* =============================================================================
   The Playbook: app
   Hash routes, one localStorage key (jgl.playbook), no build step.
   ========================================================================== */
(function () {
  'use strict';

  var C = window.PLAYBOOK;
  var KEY = 'jgl.playbook';
  var main = document.getElementById('main');

  /* ---------- State -------------------------------------------------------- */
  function blank() {
    return { v: 1, tasks: {}, scen: {}, journal: [], draft: { nightly: {}, weekly: {} }, pact: { player: null, parent: null, review: '' } };
  }
  var S = (function load() {
    try {
      var raw = localStorage.getItem(KEY);
      if (!raw) return blank();
      var s = JSON.parse(raw), b = blank();
      for (var k in b) if (!(k in s)) s[k] = b[k];
      if (!s.draft.nightly) s.draft.nightly = {};
      if (!s.draft.weekly) s.draft.weekly = {};
      return s;
    } catch (e) { return blank(); }
  })();
  function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} }

  /* ---------- Helpers ------------------------------------------------------ */
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function steps(s) { return esc(s).replace(/ › /g, ' <span class="mono" aria-hidden="true">›</span><span class="sr">, then</span> '); }
  function day(iso) { return new Date(iso).toLocaleDateString('en-SG', { day: 'numeric', month: 'short' }); }
  function dayLong(iso) { return new Date(iso).toLocaleDateString('en-SG', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }); }
  function uniq(a) { return a.filter(function (x, i) { return a.indexOf(x) === i; }); }

  var P = {
    check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
    right: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    left: '<path d="M19 12H5M11 6l-6 6 6 6"/>',
    chev: '<path d="M9 6l6 6-6 6"/>',
    menu: '<path d="M4 7h16M4 12h16M4 17h10"/>',
    close: '<path d="M6 6l12 12M18 6L6 18"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4"/>',
    moon: '<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/>',
    folder: '<path d="M3 7.5a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2V17a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
    lock: '<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
    printer: '<path d="M7 9V4h10v5"/><rect x="4" y="9" width="16" height="7" rx="1.5"/><path d="M7 14h10v6H7z"/>',
    alert: '<path d="M12 4l9 16H3z"/><path d="M12 10v4M12 17.5v.01"/>',
    calendar: '<rect x="4" y="5" width="16" height="15" rx="2"/><path d="M4 10h16M9 3v4M15 3v4"/>',
    undo: '<path d="M9 7L4 12l5 5"/><path d="M4 12h10a6 6 0 0 1 0 12"/>',
  };
  function ic(name, cls) { return '<svg class="i' + (cls ? ' ' + cls : '') + '" viewBox="0 0 24 24" aria-hidden="true">' + P[name] + '</svg>'; }

  /* ---------- Section task lists ------------------------------------------- */
  var SECTION_TASKS = {
    pitch: [].concat.apply([], C.pitch.groups.map(function (g) { return g.tasks; })),
    squad: uniq([].concat.apply([], C.squad.xi.map(function (p) { return p.tasks; }))),
    fixtures: C.fixtures.tasks,
    off: uniq([].concat.apply([], C.off.pillars.map(function (p) { return p.tasks; }))),
    post: C.post.tasks,
  };
  var ALL_TASKS = uniq([].concat(SECTION_TASKS.pitch, SECTION_TASKS.squad, SECTION_TASKS.fixtures, SECTION_TASKS.off, SECTION_TASKS.post));

  function tstate(id) { return S.tasks[id] || {}; }
  function countDone(ids) { return ids.filter(function (id) { return tstate(id).done; }).length; }
  function countChecked(ids) { return ids.filter(function (id) { return tstate(id).checked; }).length; }
  function played() { return C.game.scenarios.filter(function (s) { return s.id in S.scen; }).length; }

  function progressLabel(id) {
    if (SECTION_TASKS[id]) {
      var ids = SECTION_TASKS[id], d = countChecked(ids);
      return { text: d + ' of ' + ids.length + ' checked', done: d === ids.length };
    }
    if (id === 'game') { var p = played(); return { text: p + ' of ' + C.game.scenarios.length + ' played', done: p === C.game.scenarios.length }; }
    if (id === 'cards') return { text: '22 rules', done: false };
    if (id === 'pact') {
      var n = (S.pact.player ? 1 : 0) + (S.pact.parent ? 1 : 0);
      return { text: n === 2 ? 'Signed' : n + ' of 2 signed', done: n === 2 };
    }
    return { text: '', done: false };
  }

  /* ---------- Task card ---------------------------------------------------- */
  function taskHTML(id) {
    var t = C.tasks[id]; if (!t) return '';
    var st = tstate(id);
    var cls = 'task' + (st.done ? ' is-done' : '') + (st.checked ? ' is-checked' : '');
    var h = '<article class="' + cls + '" data-task="' + id + '" aria-labelledby="t-' + id + '">';
    h += '<div class="task-top"><h3 id="t-' + id + '">' + esc(t.title) + '</h3><span class="who">' + (t.who === 'together' ? 'With a parent' : 'You') + '</span></div>';
    h += '<p class="why">' + esc(t.why) + '</p>';
    h += '<details' + (st.done ? '' : ' open') + '><summary>' + ic('chev') + 'How to do it</summary><ol class="steps">';
    t.steps.forEach(function (s) { h += '<li><span>' + steps(s) + '</span></li>'; });
    h += '</ol></details><div class="task-actions">';
    if (st.checked) {
      h += '<span class="stamp">' + ic('check') + 'Checked by ' + esc(st.checked.by) + ', ' + day(st.checked.iso) + '</span>';
      h += '<button class="btn quiet" data-act="uncheck" type="button">Undo</button>';
    } else if (st.checking) {
      h += '<form class="check-form" data-act="check-form"><label for="ini-' + id + '">Parent\'s initials</label>';
      h += '<input id="ini-' + id + '" name="ini" maxlength="4" autocomplete="off" required>';
      h += '<button class="btn primary" type="submit">' + ic('check') + 'Confirm</button>';
      h += '<button class="btn quiet" data-act="check-cancel" type="button">Cancel</button></form>';
    } else {
      h += '<button class="btn' + (st.done ? ' on' : '') + '" data-act="done" type="button" aria-pressed="' + (st.done ? 'true' : 'false') + '">' + ic('check') + (st.done ? 'Done' : 'I have done it') + '</button>';
      h += '<button class="btn" data-act="check-open" type="button"' + (st.done ? '' : ' disabled') + '>Parent check</button>';
    }
    h += '</div></article>';
    return h;
  }
  function tasksHTML(ids) { return '<div class="tasks">' + ids.map(taskHTML).join('') + '</div>'; }

  function refreshTask(id, focusSel) {
    document.querySelectorAll('[data-task="' + id + '"]').forEach(function (el) {
      var wrap = document.createElement('div'); wrap.innerHTML = taskHTML(id);
      el.replaceWith(wrap.firstChild);
    });
    renderRail();
    if (focusSel) { var f = document.querySelector('[data-task="' + id + '"] ' + focusSel); if (f) f.focus(); }
  }

  main.addEventListener('click', function (e) {
    var b = e.target.closest('[data-act]'); if (!b) return;
    var card = b.closest('[data-task]'); if (!card) return;
    var id = card.getAttribute('data-task'), st = S.tasks[id] || (S.tasks[id] = {});
    var act = b.getAttribute('data-act');
    if (act === 'done') { if (st.done) delete st.done; else st.done = new Date().toISOString(); save(); refreshTask(id, '[data-act="done"]'); }
    else if (act === 'check-open') { st.checking = true; refreshTask(id, 'input'); }
    else if (act === 'check-cancel') { delete st.checking; refreshTask(id, '[data-act="check-open"]'); }
    else if (act === 'uncheck') { delete st.checked; save(); refreshTask(id, '[data-act="check-open"]'); }
  });
  main.addEventListener('submit', function (e) {
    var f = e.target.closest('[data-act="check-form"]'); if (!f) return;
    e.preventDefault();
    var card = f.closest('[data-task]'), id = card.getAttribute('data-task'), st = S.tasks[id];
    var ini = f.ini.value.trim().toUpperCase(); if (!ini) return;
    delete st.checking; st.checked = { by: ini, iso: new Date().toISOString() };
    if (!st.done) st.done = st.checked.iso;
    save(); refreshTask(id, '[data-act="uncheck"]');
  });

  /* ---------- Shared bits -------------------------------------------------- */
  function head(sec, title, lede) {
    return '<header class="sec-head"><div class="kicker"><span class="dot"></span>' + sec.num + ' of 09</div><h1>' + title + '</h1>' + (lede ? '<p class="lede">' + esc(lede) + '</p>' : '') + '</header>';
  }
  function pager(i) {
    var prev = C.sections[i - 1], next = C.sections[i + 1], h = '<nav class="pager no-print" aria-label="Next and previous">';
    if (prev) h += '<a href="#/' + prev.id + '"><span class="dir">' + ic('left') + 'Previous</span><span class="ttl">' + esc(prev.title) + '</span></a>';
    if (next) h += '<a class="next" href="#/' + next.id + '"><span class="dir">Next' + ic('right') + '</span><span class="ttl">' + esc(next.title) + '</span></a>';
    return h + '</nav>';
  }

  /* ---------- 01 Kick off ---------------------------------------------------- */
  function vKickoff() {
    var k = C.kickoff, h = '<section class="hero"><div class="kicker"><span class="dot"></span>' + esc(C.family.player) + '\'s first phone</div>';
    h += '<h1>' + esc(k.headline) + '<br><em>' + esc(k.sub) + '</em></h1>';
    h += '<div class="manifesto">' + k.paras.map(function (p) { return '<p>' + esc(p) + '</p>'; }).join('') + '</div>';
    h += '<blockquote class="verse">' + esc(k.verse.text) + '<cite>' + esc(k.verse.ref) + '</cite></blockquote></section>';
    h += '<div class="scoreline" role="list">';
    h += '<div class="score" role="listitem"><b>' + countDone(ALL_TASKS) + '<small class="muted"> of ' + ALL_TASKS.length + '</small></b><span>steps you have done</span></div>';
    h += '<div class="score" role="listitem"><b>' + countChecked(ALL_TASKS) + '</b><span>checked by a parent</span></div>';
    h += '<div class="score" role="listitem"><b>' + played() + '<small class="muted"> of ' + C.game.scenarios.length + '</small></b><span>situations played</span></div></div>';
    h += '<h2>The programme</h2>' + programme();
    return h;
  }
  function programme() {
    return '<ol class="programme">' + C.sections.slice(1).map(function (s) {
      var p = progressLabel(s.id);
      return '<li><a href="#/' + s.id + '"><span class="n">' + s.num + '</span><span class="t">' + esc(s.title) + '<span class="l">' + esc(s.line) + '</span></span><span class="p' + (p.done ? ' done' : '') + '">' + esc(p.text) + '</span></a></li>';
    }).join('') + '</ol>';
  }

  /* ---------- 02 Pitch ------------------------------------------------------ */
  function vPitch(sec) {
    var c = C.pitch, h = head(sec, 'Set up your pitch', c.intro);
    h += '<div class="diagrams">';
    h += '<figure class="figure"><figcaption>One home screen</figcaption><div class="phone" role="img" aria-label="Home screen with six folders: ' + c.homeMock.folders.join(', ') + '. Dock: ' + c.homeMock.dock.join(', ') + '."><div class="grid">';
    c.homeMock.folders.forEach(function (f) { h += '<div class="fold"><i><b></b><b></b><b></b><b></b><b></b><b></b></i><span>' + esc(f) + '</span></div>'; });
    h += '</div><div class="dock">';
    c.homeMock.dock.forEach(function (d) { h += '<div><i></i><span>' + esc(d) + '</span></div>'; });
    h += '</div></div></figure>';
    h += '<figure class="figure"><figcaption>Photos: folders, then albums</figcaption><ul class="tree">';
    c.photoTree.forEach(function (f) {
      h += '<li><span>' + ic('folder') + esc(f.name) + '</span><ul>' + f.albums.map(function (a) { return '<li>' + esc(a) + '</li>'; }).join('') + '</ul></li>';
    });
    h += '</ul></figure></div>';
    c.groups.forEach(function (g) {
      h += '<h2 class="group-title">' + esc(g.title) + '</h2>' + tasksHTML(g.tasks);
    });
    return h;
  }

  /* ---------- 03 Cards ------------------------------------------------------ */
  function vCards(sec) {
    var c = C.cards, h = head(sec, 'The Cards', c.intro);
    ['green', 'yellow', 'red'].forEach(function (k) {
      var set = c[k];
      h += '<section class="cardset ' + k + '" aria-labelledby="cs-' + k + '"><div class="cardset-head"><span class="ref-card ' + k + '" aria-hidden="true"></span><div><h2 id="cs-' + k + '">' + esc(set.label) + '</h2><p>' + esc(set.sub) + '</p></div></div>';
      h += '<ol class="rules">' + set.items.map(function (r) { return '<li><div><p class="rule">' + esc(r.rule) + '</p><p class="why">' + esc(r.why) + '</p></div></li>'; }).join('') + '</ol></section>';
    });
    return h;
  }

  /* ---------- 04 Squad ------------------------------------------------------ */
  var picked = 1;
  function vSquad(sec) {
    var c = C.squad, h = head(sec, 'Your Starting XI', c.intro);
    h += '<div class="squad"><div class="field" role="group" aria-label="Starting eleven on a pitch. Choose a player.">';
    h += '<svg class="lines" viewBox="0 0 68 96" preserveAspectRatio="none" aria-hidden="true"><rect x="3" y="3" width="62" height="90"/><path d="M3 48h62"/><circle cx="34" cy="48" r="8"/><rect x="18" y="3" width="32" height="14"/><rect x="26" y="3" width="16" height="5"/><rect x="18" y="79" width="32" height="14"/><rect x="26" y="88" width="16" height="5"/></svg>';
    c.xi.forEach(function (p) {
      h += '<button type="button" class="player' + (p.no === 1 ? ' keeper' : '') + '" data-no="' + p.no + '" style="left:' + p.x + '%;top:' + p.y + '%" aria-pressed="' + (p.no === picked ? 'true' : 'false') + '" aria-controls="playerDetail"><span class="shirt">' + p.no + '</span><span class="nm">' + esc(p.name) + '</span></button>';
    });
    h += '</div><div id="playerDetail" aria-live="polite">' + playerDetail() + '</div></div>';
    h += '<div class="flag" role="note">' + ic('alert') + '<p>WhatsApp\'s minimum age is 13. Until your birthday, Messages (iMessage) is your striker. Add WhatsApp together with your parents after that.</p></div>';
    h += '<div class="two-col"><section><h2>' + esc(c.bench.title) + '</h2><p class="muted">' + esc(c.bench.sub) + '</p><ul class="squadlist">' + c.bench.items.map(li).join('') + '</ul></section>';
    h += '<section><h2>' + esc(c.notYet.title) + '</h2><p class="muted">' + esc(c.notYet.sub) + '</p><ul class="squadlist">' + c.notYet.items.map(li).join('') + '</ul></section></div>';
    return h;
    function li(x) { return '<li><b>' + esc(x.name) + '</b><span>' + esc(x.note) + '</span></li>'; }
  }
  function playerDetail() {
    var p = C.squad.xi.filter(function (x) { return x.no === picked; })[0];
    var h = '<div class="player-detail"><div class="pos">No. ' + p.no + ', ' + esc(p.pos) + '</div><h3>' + esc(p.name) + '</h3><div class="role">' + esc(p.role) + '</div><p>' + esc(p.what) + '</p>';
    if (p.tasks.length) h += tasksHTML(p.tasks);
    return h + '</div>';
  }
  main.addEventListener('click', function (e) {
    var b = e.target.closest('.player'); if (!b) return;
    picked = +b.getAttribute('data-no');
    document.querySelectorAll('.player').forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
    document.getElementById('playerDetail').innerHTML = playerDetail();
    if (window.matchMedia('(max-width: 759px)').matches) document.getElementById('playerDetail').scrollIntoView({ behavior: reduced() ? 'auto' : 'smooth', block: 'start' });
  });
  function reduced() { return window.matchMedia('(prefers-reduced-motion: reduce)').matches; }

  /* ---------- 05 Fixtures --------------------------------------------------- */
  function vFixtures(sec) {
    var c = C.fixtures, w = c.week, h = head(sec, 'The Fixture List', c.intro);
    h += '<div class="principles">' + c.principles.map(function (p) { return '<div class="principle"><h3>' + esc(p.title) + '</h3><p>' + esc(p.body) + '</p></div>'; }).join('') + '</div>';
    h += '<h2>A week, at a glance</h2><figure class="week"><div class="week-grid" role="table" aria-label="Sample week">';
    w.days.forEach(function (d, i) {
      h += '<div class="week-day" role="row"><span role="rowheader">' + d + '</span>' + w.blocks[i].map(function (k) { return '<div class="blk k-' + k + '" role="cell" aria-label="' + esc(w.kinds[k].label) + '" title="' + esc(w.kinds[k].label) + '"></div>'; }).join('') + '</div>';
    });
    h += '</div><ul class="legend">' + Object.keys(w.kinds).map(function (k) { return '<li><i class="k-' + k + '"></i>' + esc(w.kinds[k].label) + '</li>'; }).join('') + '</ul>';
    h += '<figcaption class="note">' + esc(w.note) + '</figcaption></figure>';
    h += '<h2>Set it up</h2>' + tasksHTML(c.tasks);
    h += '<a class="studio-link" href="' + c.studio.href + '">' + ic('calendar') + '<span>' + esc(c.studio.text) + '</span></a>';
    return h;
  }

  /* ---------- 06 Read the game --------------------------------------------- */
  var scIndex = -1;
  function vGame(sec) {
    var g = C.game, h = head(sec, 'Read the Game', g.intro);
    h += '<div class="toolkit">' + g.tools.map(function (t, i) { return '<div class="tool"><div class="no">Tool ' + (i + 1) + '</div><h3>' + esc(t.name) + '</h3><p>' + esc(t.body) + '</p></div>'; }).join('') + '</div>';
    h += '<div class="filter"><p>' + esc(g.filter.text) + '</p><cite>' + esc(g.filter.ref) + '</cite><ul aria-label="Before you watch, share or send">' + g.filter.test.map(function (t) { return '<li>' + esc(t) + '</li>'; }).join('') + '</ul></div>';
    if (scIndex < 0) { scIndex = g.scenarios.findIndex(function (s) { return !(s.id in S.scen); }); if (scIndex < 0) scIndex = 0; }
    h += '<h2 id="matchday">Matchday</h2><div class="fixtures-strip" id="strip" aria-label="Situations">' + strip() + '</div>';
    h += '<div id="scenario">' + scenarioHTML() + '</div>';
    return h;
  }
  function strip() {
    return C.game.scenarios.map(function (s, i) {
      var a = S.scen[s.id], v = a != null ? s.choices[a].v : null;
      return '<button type="button" data-sc="' + i + '" aria-current="' + (i === scIndex ? 'true' : 'false') + '" aria-label="Situation ' + (i + 1) + ': ' + esc(s.title) + (v ? ', played' : '') + '">' + (i + 1) + (v ? '<span class="mk ' + v + '" aria-hidden="true"></span>' : '') + '</button>';
    }).join('');
  }
  function scenarioHTML() {
    var g = C.game, s = g.scenarios[scIndex], a = S.scen[s.id], answered = a != null;
    var h = '<div class="scenario"><div class="screen" role="img" aria-label="' + esc(s.app + ', ' + s.chat + '. ' + s.msgs.map(function (m) { return m.from + ': ' + m.text; }).join(' ')) + '">';
    h += '<div class="screen-head"><span class="app">' + esc(s.app) + '</span><span class="who">' + esc(s.chat) + '</span></div><div class="bubbles">';
    s.msgs.forEach(function (m) {
      var media = /^\[.*\]$/.test(m.text);
      h += '<div class="bubble' + (media ? ' media' : '') + '"><small>' + esc(m.from) + '</small>' + esc(media ? m.text.slice(1, -1) : m.text) + '</div>';
    });
    h += '</div></div><div class="ask"><div class="sc-title">' + (scIndex + 1) + ' of ' + g.scenarios.length + ': ' + esc(s.title) + '</div><h3>' + esc(s.ask) + '</h3>';
    h += '<div class="choices" role="group" aria-label="Your call">';
    s.choices.forEach(function (c, i) {
      var cls = 'choice v-' + c.v + (answered ? ' revealed' : '') + (a === i ? ' picked' : '');
      h += '<button type="button" class="' + cls + '" data-choice="' + i + '"' + (answered ? ' disabled' : '') + '><span class="letter">' + 'ABC'[i] + '</span><span>' + esc(c.text) + '</span>';
      h += '<span class="verdict"><i aria-hidden="true"></i>' + esc(g.verdicts[c.v]) + (a === i ? ', your call' : '') + '</span><span class="because">' + esc(c.why) + '</span></button>';
    });
    h += '</div>';
    if (answered) {
      var tool = g.tools.filter(function (t) { return t.id === s.tool; })[0];
      h += '<div class="takeaway" tabindex="-1" id="takeaway"><span class="lbl">The principle</span><p>' + esc(s.principle) + '</p><span class="tool-tag">Tool: ' + esc(tool.name) + '</span></div>';
      h += '<div class="sc-nav"><button class="btn quiet" type="button" data-replay>' + ic('undo') + 'Play again</button>';
      if (scIndex < g.scenarios.length - 1) h += '<button class="btn primary" type="button" data-next>Next situation' + ic('right') + '</button>';
      else h += '<a class="btn primary" href="#/off">On to Off the Pitch' + ic('right') + '</a>';
      h += '</div>';
    }
    return h + '</div></div>';
  }
  function redrawScenario(focusSel) {
    document.getElementById('scenario').innerHTML = scenarioHTML();
    document.getElementById('strip').innerHTML = strip();
    renderRail();
    if (focusSel) { var f = document.querySelector(focusSel); if (f) f.focus({ preventScroll: false }); }
  }
  main.addEventListener('click', function (e) {
    var t;
    if ((t = e.target.closest('[data-choice]')) && !t.disabled) {
      S.scen[C.game.scenarios[scIndex].id] = +t.getAttribute('data-choice'); save(); redrawScenario('#takeaway');
    } else if ((t = e.target.closest('[data-sc]'))) {
      scIndex = +t.getAttribute('data-sc'); redrawScenario('#scenario .ask h3');
      document.getElementById('matchday').scrollIntoView({ behavior: reduced() ? 'auto' : 'smooth' });
    } else if (e.target.closest('[data-next]')) {
      scIndex++; redrawScenario();
      document.getElementById('matchday').scrollIntoView({ behavior: reduced() ? 'auto' : 'smooth' });
      var c0 = document.querySelector('[data-choice="0"]'); if (c0) c0.focus({ preventScroll: true });
    } else if (e.target.closest('[data-replay]')) {
      delete S.scen[C.game.scenarios[scIndex].id]; save(); redrawScenario('[data-choice="0"]');
    }
  });
  document.querySelector('.ask h3') && document.querySelector('.ask h3').setAttribute('tabindex', '-1');

  /* ---------- 07 Off the pitch ---------------------------------------------- */
  function vOff(sec) {
    var c = C.off, h = head(sec, 'Off the Pitch', c.intro);
    c.pillars.forEach(function (p) {
      h += '<section class="pillar" aria-labelledby="pl-' + p.id + '"><div class="pillar-head"><h2 id="pl-' + p.id + '">' + esc(p.name) + '</h2><div class="stat"><b>' + esc(p.stat) + '</b><span>' + esc(p.unit) + '</span></div></div>';
      h += '<p class="rule">' + esc(p.rule) + '</p><p class="why">' + esc(p.why) + '</p>' + tasksHTML(p.tasks) + '</section>';
    });
    h += '<h2>A school day, the Playbook way</h2><ol class="day">' + c.day.map(function (d) { return '<li><span class="t">' + esc(d.t) + '</span><span class="w">' + esc(d.what) + '</span></li>'; }).join('') + '</ol>';
    return h;
  }

  /* ---------- 08 Post match -------------------------------------------------- */
  var jMode = 'nightly';
  function vPost(sec) {
    var c = C.post, h = head(sec, 'Post Match', c.intro);
    h += '<div class="journal"><div class="seg" role="group" aria-label="Kind of review">';
    h += '<button type="button" data-jmode="nightly" aria-pressed="' + (jMode === 'nightly') + '">Tonight</button>';
    h += '<button type="button" data-jmode="weekly" aria-pressed="' + (jMode === 'weekly') + '">Sunday match report</button></div>';
    h += '<form id="jform">' + journalFields() + '<div class="journal-foot"><p class="privacy">' + ic('lock') + esc(c.privacy) + '</p>';
    h += '<span><span class="saved-msg" id="savedMsg" role="status"></span> <button class="btn primary" type="submit">' + ic('check') + 'Save entry</button></span></div></form></div>';
    h += '<h2>Your footage</h2><div id="entries">' + entriesHTML() + '</div>';
    h += '<h2>Prefer the iPhone Journal app?</h2>' + tasksHTML(c.tasks);
    return h;
  }
  function journalFields() {
    var qs = jMode === 'nightly' ? C.post.nightly : C.post.weekly.qs, d = S.draft[jMode], h = '';
    if (jMode === 'weekly') h += '<p class="muted" style="margin-bottom:14px">' + esc(C.post.weekly.intro) + '</p>';
    qs.forEach(function (q) {
      h += '<div class="q"><label for="jq-' + q.id + '">' + esc(q.q) + '</label>' + (q.hint ? '<span class="hint" id="jh-' + q.id + '">' + esc(q.hint) + '</span>' : '');
      h += '<textarea id="jq-' + q.id + '" name="' + q.id + '" rows="2" maxlength="600"' + (q.hint ? ' aria-describedby="jh-' + q.id + '"' : '') + '>' + esc(d[q.id] || '') + '</textarea></div>';
    });
    return h;
  }
  function entriesHTML() {
    if (!S.journal.length) return '<p class="muted">Nothing yet. Your first entry will appear here. Reading back over a month of these is how you see yourself improve.</p>';
    var month = S.journal.filter(function (e) { return Date.now() - new Date(e.iso) < 30 * 864e5; }).length;
    var h = '<p class="muted">' + month + ' ' + (month === 1 ? 'entry' : 'entries') + ' in the last 30 days.</p><ul class="entries">';
    S.journal.slice().reverse().forEach(function (e) {
      var qs = e.kind === 'nightly' ? C.post.nightly : C.post.weekly.qs;
      h += '<li><details><summary><span class="d">' + dayLong(e.iso) + '</span><span class="k">' + (e.kind === 'nightly' ? 'Tonight' : 'Match report') + '</span></summary><dl>';
      qs.forEach(function (q) { if (e.a[q.id]) h += '<dt>' + esc(q.q) + '</dt><dd>' + esc(e.a[q.id]) + '</dd>'; });
      h += '</dl><button class="btn quiet" type="button" data-jdel="' + e.iso + '">Delete entry</button></details></li>';
    });
    return h + '</ul>';
  }
  var draftTimer;
  main.addEventListener('input', function (e) {
    if (!e.target.closest('#jform')) return;
    S.draft[jMode][e.target.name] = e.target.value;
    clearTimeout(draftTimer); draftTimer = setTimeout(save, 400);
  });
  main.addEventListener('submit', function (e) {
    if (e.target.id !== 'jform') return;
    e.preventDefault();
    var a = {}, any = false;
    Array.prototype.forEach.call(e.target.querySelectorAll('textarea'), function (t) { var v = t.value.trim(); if (v) { a[t.name] = v; any = true; } });
    var msg = document.getElementById('savedMsg');
    if (!any) { msg.textContent = 'Write at least one answer first.'; return; }
    S.journal.push({ iso: new Date().toISOString(), kind: jMode, a: a });
    S.draft[jMode] = {}; save();
    e.target.querySelectorAll('textarea').forEach(function (t) { t.value = ''; });
    document.getElementById('entries').innerHTML = entriesHTML();
    msg.textContent = 'Saved.';
    setTimeout(function () { if (msg) msg.textContent = ''; }, 3000);
  });
  main.addEventListener('click', function (e) {
    var b = e.target.closest('[data-jmode]');
    if (b) {
      jMode = b.getAttribute('data-jmode');
      document.querySelectorAll('[data-jmode]').forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
      var form = document.getElementById('jform'); form.removeChild(form.firstChild);
      while (form.firstChild && !(form.firstChild.classList && form.firstChild.classList.contains('journal-foot'))) form.removeChild(form.firstChild);
      form.insertAdjacentHTML('afterbegin', journalFields());
      return;
    }
    var d = e.target.closest('[data-jdel]');
    if (d && window.confirm('Delete this entry? This cannot be undone.')) {
      var iso = d.getAttribute('data-jdel');
      S.journal = S.journal.filter(function (x) { return x.iso !== iso; }); save();
      document.getElementById('entries').innerHTML = entriesHTML();
    }
  });

  /* ---------- 09 Pact -------------------------------------------------------- */
  function vPact(sec) {
    var c = C.pact, h = head(sec, 'The Pact', c.intro);
    var done = countChecked(ALL_TASKS);
    h += '<div class="pact-sheet"><p class="kicker">The Playbook, ' + esc(C.family.player) + '\'s first phone</p>';
    h += '<div class="pact-cols"><section><h2>' + esc(C.family.player) + ' promises</h2><ol class="pledges">' + c.player.map(function (p) { return '<li>' + esc(p) + '</li>'; }).join('') + '</ol></section>';
    h += '<section><h2>Mum and Dad promise</h2><ol class="pledges">' + c.parents.map(function (p) { return '<li>' + esc(p) + '</li>'; }).join('') + '</ol></section></div>';
    h += '<h2 style="margin-top:30px">Setup, checked together</h2><p class="muted">' + done + ' of ' + ALL_TASKS.length + ' checked by a parent.</p><ul class="ledger">';
    ALL_TASKS.forEach(function (id) {
      var st = tstate(id), sec2 = sectionOf(id);
      h += '<li><span class="st' + (st.checked ? ' checked' : st.done ? ' done' : '') + '" aria-hidden="true">' + (st.done || st.checked ? ic('check') : '') + '</span>';
      h += '<a href="#/' + sec2 + '">' + esc(C.tasks[id].title) + '</a><span class="meta">' + (st.checked ? esc(st.checked.by) + ', ' + day(st.checked.iso) : st.done ? 'Done, needs check' : 'To do') + '</span></li>';
    });
    h += '</ul><div class="signs">' + signHTML('player', C.family.player) + signHTML('parent', 'Parent') + '</div>';
    h += '<div class="review"><label for="reviewDate">We review this Pact together on</label><input type="date" id="reviewDate" value="' + esc(S.pact.review || '') + '"></div></div>';
    h += '<div class="actions-row no-print"><button class="btn primary" type="button" id="printBtn">' + ic('printer') + 'Print or save as PDF</button></div>';
    h += '<aside class="help" aria-labelledby="helpT"><h3 id="helpT">' + esc(c.help.title) + '</h3><ul>' + c.help.lines.map(function (l) { return '<li><b>' + esc(l.name) + '</b><a class="num" href="tel:' + l.num.replace(/\s/g, '') + '">' + esc(l.num) + '</a><span class="note">' + esc(l.note) + '</span></li>'; }).join('') + '</ul></aside>';
    h += '<section class="sources"><h3>For parents: sources</h3><p>Menu names can move between iOS versions. If one does not match, search Settings for the feature name.</p><ul>' + C.sources.map(function (s) { return '<li><a href="' + s.href + '" target="_blank" rel="noopener">' + esc(s.label) + '</a></li>'; }).join('') + '</ul></section>';
    return h;
  }
  function signHTML(who, label) {
    var s = S.pact[who];
    if (s) return '<div class="sign"><label>' + esc(label) + '</label><span class="signed">' + esc(s.name) + '</span><span class="when">Signed ' + dayLong(s.iso) + '</span><button class="btn quiet no-print" type="button" data-unsign="' + who + '">Undo signature</button></div>';
    return '<form class="sign" data-sign="' + who + '"><label for="sg-' + who + '">' + esc(label) + ', type your name to sign</label><input id="sg-' + who + '" name="nm" autocomplete="name" required><button class="btn" type="submit">Sign</button></form>';
  }
  function sectionOf(id) {
    for (var k in SECTION_TASKS) if (SECTION_TASKS[k].indexOf(id) > -1) return k;
    return 'kickoff';
  }
  main.addEventListener('submit', function (e) {
    var f = e.target.closest('[data-sign]'); if (!f) return;
    e.preventDefault();
    var nm = f.nm.value.trim(); if (!nm) return;
    S.pact[f.getAttribute('data-sign')] = { name: nm, iso: new Date().toISOString() }; save(); route();
  });
  main.addEventListener('click', function (e) {
    var u = e.target.closest('[data-unsign]');
    if (u) { S.pact[u.getAttribute('data-unsign')] = null; save(); route(); return; }
    if (e.target.closest('#printBtn')) window.print();
  });
  main.addEventListener('change', function (e) {
    if (e.target.id === 'reviewDate') { S.pact.review = e.target.value; save(); }
  });

  /* ---------- Router, rail, sheet, theme ----------------------------------- */
  var VIEWS = { kickoff: vKickoff, pitch: vPitch, cards: vCards, squad: vSquad, fixtures: vFixtures, game: vGame, off: vOff, post: vPost, pact: vPact };
  var current = null;

  function renderRail() {
    var items = C.sections.map(function (s) {
      var p = progressLabel(s.id);
      return '<li><a href="#/' + s.id + '"' + (s.id === current ? ' aria-current="page"' : '') + '><span class="n">' + s.num + '</span><span>' + esc(s.title) + '</span><span class="p">' + (p.done ? ic('check') : '') + '</span></a></li>';
    }).join('');
    document.getElementById('rail').innerHTML = items;
    document.getElementById('sheetList').innerHTML = C.sections.map(function (s) {
      var p = progressLabel(s.id);
      return '<li><a href="#/' + s.id + '"' + (s.id === current ? ' aria-current="page"' : '') + '><span class="n">' + s.num + '</span><span class="t">' + esc(s.title) + '<span class="l">' + esc(s.line) + '</span></span><span class="p' + (p.done ? ' done' : '') + '">' + esc(p.text) + '</span></a></li>';
    }).join('');
  }

  function route() {
    var id = (location.hash.replace(/^#\/?/, '').split('/')[0]) || 'kickoff';
    if (!VIEWS[id]) id = 'kickoff';
    var changed = id !== current;
    current = id;
    var i = C.sections.findIndex(function (s) { return s.id === id; });
    main.innerHTML = VIEWS[id](C.sections[i]) + (id === 'kickoff' ? '' : pager(i));
    var ask = main.querySelector('.ask h3'); if (ask) ask.setAttribute('tabindex', '-1');
    document.title = (id === 'kickoff' ? '' : C.sections[i].title + ' | ') + 'The Playbook';
    renderRail();
    closeSheet(false);
    if (changed) { window.scrollTo(0, 0); main.focus({ preventScroll: true }); }
  }

  var sheet = document.getElementById('sheet'), backdrop = document.getElementById('backdrop'), menuBtn = document.getElementById('menuBtn');
  function openSheet() {
    sheet.hidden = false; backdrop.hidden = false;
    requestAnimationFrame(function () { sheet.classList.add('open'); backdrop.classList.add('open'); });
    menuBtn.setAttribute('aria-expanded', 'true');
    document.getElementById('sheetClose').focus();
  }
  function closeSheet(restore) {
    if (sheet.hidden) return;
    sheet.classList.remove('open'); backdrop.classList.remove('open');
    menuBtn.setAttribute('aria-expanded', 'false');
    setTimeout(function () { sheet.hidden = true; backdrop.hidden = true; }, reduced() ? 0 : 260);
    if (restore !== false) menuBtn.focus();
  }
  menuBtn.innerHTML = ic('menu');
  document.getElementById('sheetClose').innerHTML = ic('close');
  menuBtn.addEventListener('click', openSheet);
  document.getElementById('sheetClose').addEventListener('click', function () { closeSheet(); });
  backdrop.addEventListener('click', function () { closeSheet(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !sheet.hidden) closeSheet(); });

  var themeBtn = document.getElementById('themeBtn');
  function isDark() {
    var t = document.documentElement.getAttribute('data-theme');
    return t ? t === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
  }
  function paintTheme() {
    themeBtn.innerHTML = ic(isDark() ? 'sun' : 'moon');
    themeBtn.setAttribute('aria-label', isDark() ? 'Switch to light' : 'Switch to dark');
  }
  themeBtn.addEventListener('click', function () {
    var next = isDark() ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    try { localStorage.setItem('jgl.playbook.theme', next); } catch (e) {}
    paintTheme();
  });

  document.getElementById('brandFor').textContent = 'for ' + C.family.player;
  paintTheme();
  window.addEventListener('hashchange', route);
  route();
})();
