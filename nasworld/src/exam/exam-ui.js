// ============================================================
//  EXAM PREP — screens
// ============================================================
//
//  Hub -> intro -> paper -> hand in -> results (with review) -> history.
//  Plus a grown-ups' page for answer keys and the Malay review sheet.
//
//  Every control carries data-act and friends, and one delegated
//  listener on #exam-content does the work. No question text is ever
//  spliced into an onclick string, so an option like "Mum's" or a Malay
//  sentence with quotes cannot break the page.
//
//  Bank text is plain text. examText() escapes it, then honours exactly
//  two marks: **bold** and ___ for a blank.
// ============================================================

var _examView = { name: 'hub' };
var _examTimer = null;
var _examSaveSoon = null;
var _examBound = false;

// ---- Text helpers -----------------------------------------------------

function examEsc(s) {
  return String(s === undefined || s === null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function examText(s) {
  return examEsc(s)
    .replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>')
    .replace(/_{3,}/g, '<span class="exam-blank-line">&nbsp;</span>')
    .replace(/\n/g, '<br>');
}

function examMins(ms) {
  var t = Math.floor((ms || 0) / 1000);
  var m = Math.floor(t / 60), s = t % 60;
  return m + ':' + (s < 10 ? '0' : '') + s;
}

function examDate(ts) {
  var d = new Date(ts);
  var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return d.getDate() + ' ' + months[d.getMonth()];
}

function examModeLabel(att) {
  var def = EXAM_SUBJECTS[att.subject];
  if (att.mode === 'full') return 'Full paper';
  if (att.mode === 'redo') return 'Mistakes redo';
  var sec = def && examSectionDef(def, att.sectionId);
  return (sec ? sec.name : 'Section') + ' practice';
}

// ---- Entry and routing --------------------------------------------------

function renderExamHub() {
  examBind();
  _examView = { name: 'hub' };
  examRender();
}

function examGo(view) {
  _examView = view;
  examRender();
  var c = document.getElementById('exam-content');
  if (c && c.scrollIntoView) { try { window.scrollTo(0, 0); } catch (e) {} }
}

function examRender() {
  var c = document.getElementById('exam-content');
  if (!c) return;
  examStopTimer();
  var v = _examView;
  var html = '';
  if (v.name === 'hub') html = examHubHTML();
  else if (v.name === 'intro') html = examIntroHTML(v);
  else if (v.name === 'paper') html = examPaperHTML(v);
  else if (v.name === 'results') html = examResultsHTML(v);
  else if (v.name === 'history') html = examHistoryHTML();
  else if (v.name === 'gate') html = examGateHTML(v);
  else if (v.name === 'keys') html = examKeysHTML();
  c.innerHTML = html;
  if (v.name === 'paper') {
    examStartTimer();
    var inp = c.querySelector('.exam-input');
    if (inp && !v.noFocus) { try { inp.focus(); } catch (e) {} }
  }
}

// ---- Hub ------------------------------------------------------------------

function examHubHTML() {
  var store = examStore();
  var h = '<button class="back-btn" data-act="home">← Back to Home</button>';
  h += '<div class="exam-head"><div class="exam-head-icon">📝</div>' +
       '<h2 class="exam-title">Exam Prep</h2>' +
       '<p class="exam-sub">Practise like the real thing. Answer the whole paper, then hand it in to see your marks.</p></div>';

  var p = store.inProgress;
  if (p && EXAM_SUBJECTS[p.subject]) {
    var done = p.items.length - examUnanswered(p).length;
    h += '<div class="exam-resume"><div><b>You have a paper in progress.</b><br>' +
         examEsc(EXAM_SUBJECTS[p.subject].name) + ' · ' + examEsc(examModeLabel(p)) + ' · ' +
         done + ' of ' + p.items.length + ' answered</div>' +
         '<div class="exam-resume-btns"><button class="lesson-btn lesson-btn-done" data-act="resume">Carry on</button>' +
         '<button class="lesson-btn" data-act="discard">Throw it away</button></div></div>';
  }

  h += '<div class="exam-subjects">';
  examSubjectList().forEach(function (def) {
    var atts = examAttemptsFor(def.id).filter(function (a) { return a.mode === 'full'; });
    var best = examBest(def.id, 'full', null);
    var count = examPaperSize(def);
    h += '<div class="exam-subject exam-subject-' + def.id + '">';
    h += '<div class="exam-subject-top"><span class="exam-subject-icon">' + def.icon + '</span>' +
         '<div><div class="exam-subject-name">' + examEsc(def.name) + '</div>' +
         '<div class="exam-subject-secs">' + def.sections.map(function (s) { return examEsc(s.name); }).join(' · ') + '</div></div></div>';
    h += '<div class="exam-subject-stats">' +
         (best === null ? 'No full paper yet' : ('Best ' + Math.round(best * 100) + '% · ' + atts.length + ' full paper' + (atts.length === 1 ? '' : 's'))) +
         '</div>';
    h += '<div class="exam-subject-btns">' +
         '<button class="lesson-btn lesson-btn-done" data-act="intro" data-subject="' + def.id + '" data-mode="full">Full paper · ' + count + ' questions</button>' +
         '<button class="lesson-btn" data-act="intro" data-subject="' + def.id + '" data-mode="section">One section</button></div>';
    h += '</div>';
  });
  h += '</div>';

  h += '<div class="exam-hub-foot">';
  if (store.attempts.length) h += '<button class="lesson-btn" data-act="history">📚 Past papers (' + store.attempts.length + ')</button>';
  h += '<button class="lesson-btn" data-act="gate">🔒 For grown-ups: answer keys</button></div>';
  return h;
}

function examPaperSize(def) {
  return def.sections.reduce(function (n, s) {
    if (s.passages) return n + s.passages * (s.perPassage || 5);
    return n + s.count;
  }, 0);
}

// ---- Intro ------------------------------------------------------------------

function examIntroHTML(v) {
  var def = EXAM_SUBJECTS[v.subject];
  var h = '<button class="back-btn" data-act="hub">← Exam Prep</button>';
  h += '<div class="exam-card exam-intro"><div class="exam-intro-icon">' + def.icon + '</div>';

  if (v.mode === 'section' && !v.section) {
    h += '<h2 class="exam-title">' + examEsc(def.name) + ': one ' + (def.practice ? 'topic' : 'section') + '</h2>' +
         '<p class="exam-sub">Pick the part you want to practise.</p><div class="exam-section-pick">';
    examPracticeSections(def).forEach(function (s) {
      var best = examBest(def.id, 'section', s.id);
      h += '<button class="exam-section-btn" data-act="intro" data-subject="' + def.id + '" data-mode="section" data-section="' + s.id + '">' +
           '<b>' + examEsc(s.name) + '</b><span>' + examEsc(s.blurb || '') + '</span>' +
           (best === null ? '' : '<em>Best ' + Math.round(best * 100) + '%</em>') + '</button>';
    });
    return h + '</div></div>';
  }

  var secs = v.mode === 'section'
    ? examPracticeSections(def).filter(function (s) { return s.id === v.section; })
    : def.sections;
  h += '<h2 class="exam-title">' + examEsc(def.name) + (v.mode === 'section' ? ': ' + examEsc(secs[0].name) : ': full paper') + '</h2>';
  h += '<ol class="exam-intro-secs">';
  secs.forEach(function (s) {
    var n = s.passages ? ((v.mode === 'section' ? (s.practicePassages || 2) : s.passages) + ' passage' +
              (((v.mode === 'section' ? (s.practicePassages || 2) : s.passages) > 1) ? 's' : ''))
            : ((v.mode === 'section' ? (s.practiceCount || s.count) : s.count) + ' questions');
    h += '<li><b>' + examEsc(s.name) + '</b> · ' + n + '</li>';
  });
  h += '</ol>';
  if (v.mode !== 'section' && def.minutes) {
    h += '<p class="exam-intro-time">About ' + def.minutes + ' minutes. Take your time; there is no timer to beat.</p>';
  }
  h += '<ul class="exam-rules"><li>You can go back and change any answer.</li>' +
       '<li>Nothing is marked until you hand in.</li>' +
       '<li>Tap 🚩 on a question you want to check again later.</li></ul>';
  var store = examStore();
  if (store.inProgress) {
    h += '<p class="exam-warn">Starting this will throw away the paper you have in progress.</p>';
  }
  h += '<button class="lesson-btn lesson-btn-done exam-big" data-act="begin" data-subject="' + def.id +
       '" data-mode="' + v.mode + '" data-section="' + (v.section || '') + '">Start</button></div>';
  return h;
}

// ---- The paper ----------------------------------------------------------------

function examPaperHTML(v) {
  var p = examCurrent();
  if (!p) { _examView = { name: 'hub' }; return examHubHTML(); }
  var def = EXAM_SUBJECTS[p.subject];
  var idx = Math.max(0, Math.min(p.items.length - 1, v.index || 0));
  v.index = idx;
  var q = p.items[idx];
  var sec = examSectionOf(p, idx);

  var h = '<div class="exam-paper-top">';
  h += '<button class="back-btn" data-act="hub">← Exam Prep</button>';
  h += '<button class="lesson-btn lesson-btn-done" data-act="handin">Hand in ✓</button></div>';
  h += '<div class="exam-paper-meta"><span>' + def.icon + ' ' + examEsc(def.name) + ' · ' + examEsc(examModeLabel(p)) + '</span>' +
       '<span class="exam-clock-txt" id="exam-clock">⏱ ' + examMins(p.activeMs) + '</span>' +
       '<span>Question ' + (idx + 1) + ' of ' + p.items.length + '</span></div>';

  if (sec) {
    h += '<div class="exam-section-bar"><b>' + examEsc(sec.name) + '</b>';
    if (sec.instructions) {
      h += ' · <span>' + examText(sec.instructions) + '</span>';
      if (typeof ttsButton === 'function') h += ' ' + ttsButton(sec.instructions, def.lang || 'en-GB', 'Read it to me');
    }
    h += '</div>';
  }

  if (q.passage) h += examPassageHTML(p, q, 'answer');

  h += '<div class="exam-card exam-q">';
  h += '<div class="exam-q-num">' + (idx + 1) + '.' + (q.level === 3 ? ' <span class="exam-stretch">Stretch ⭐</span>' : '') + '</div>';
  h += examItemHTML(q, p.answers[q.uid], 'answer');
  h += '<button class="exam-flag' + (p.flags[q.uid] ? ' on' : '') + '" data-act="flag" data-uid="' + q.uid + '">🚩 ' +
       (p.flags[q.uid] ? 'Marked to check' : 'Check this later') + '</button>';
  h += '</div>';

  h += '<div class="exam-nav">';
  h += '<button class="lesson-btn" data-act="go" data-i="' + (idx - 1) + '"' + (idx === 0 ? ' disabled' : '') + '>◀ Back</button>';
  h += idx < p.items.length - 1
    ? '<button class="lesson-btn lesson-btn-done" data-act="go" data-i="' + (idx + 1) + '">Next ▶</button>'
    : '<button class="lesson-btn lesson-btn-done" data-act="handin">Hand in ✓</button>';
  h += '</div>';

  h += examPaletteHTML(p, idx);
  if (v.confirm) h += examConfirmHTML(p);
  return h;
}

function examSectionOf(p, idx) {
  for (var i = 0; i < p.sections.length; i++) {
    if (idx >= p.sections[i].from && idx < p.sections[i].to) return p.sections[i];
  }
  return null;
}

function examPaletteHTML(p, cur) {
  var h = '<div class="exam-palette">';
  p.sections.forEach(function (s) {
    h += '<div class="exam-pal-sec"><div class="exam-pal-name">' + examEsc(s.name) + '</div><div class="exam-pal-dots">';
    for (var i = s.from; i < s.to; i++) {
      var q = p.items[i];
      var cls = 'exam-dot';
      if (examIsAnswered(q, p.answers[q.uid])) cls += ' done';
      if (p.flags[q.uid]) cls += ' flag';
      if (i === cur) cls += ' cur';
      h += '<button class="' + cls + '" data-act="go" data-i="' + i + '" aria-label="Question ' + (i + 1) + '">' + (i + 1) + '</button>';
    }
    h += '</div></div>';
  });
  return h + '</div>';
}

function examConfirmHTML(p) {
  var left = examUnanswered(p);
  var flagged = p.items.filter(function (q) { return p.flags[q.uid]; });
  var h = '<div class="exam-modal-back"><div class="exam-modal">';
  h += '<div class="exam-modal-icon">' + (left.length ? '🤔' : '🙌') + '</div>';
  if (left.length) {
    h += '<p><b>You have ' + left.length + ' question' + (left.length === 1 ? '' : 's') + ' still to answer.</b></p><div class="exam-modal-list">';
    left.forEach(function (q) {
      var i = p.items.indexOf(q);
      h += '<button class="exam-dot" data-act="go" data-i="' + i + '">' + (i + 1) + '</button>';
    });
    h += '</div><p>Questions left empty will be marked wrong.</p>';
  } else {
    h += '<p><b>Every question has an answer.</b></p>';
  }
  if (flagged.length) {
    h += '<p>You marked ' + flagged.length + ' to check again:</p><div class="exam-modal-list">';
    flagged.forEach(function (q) {
      var i = p.items.indexOf(q);
      h += '<button class="exam-dot flag" data-act="go" data-i="' + i + '">' + (i + 1) + '</button>';
    });
    h += '</div>';
  }
  h += '<div class="exam-modal-btns"><button class="lesson-btn" data-act="confirm-no">Keep working</button>' +
       '<button class="lesson-btn lesson-btn-done" data-act="confirm-yes">Hand in now</button></div>';
  return h + '</div></div>';
}

// ---- Passages ---------------------------------------------------------------

function examPassageHTML(p, q, mode) {
  var pas = examPassageById(p.subject, q.passage);
  if (!pas) return '';
  var h = '<div class="exam-passage">';
  if (pas.title) h += '<div class="exam-passage-title">' + examText(pas.title) + '</div>';
  if (pas.kind === 'kloz') {
    // Fill each numbered blank with whatever she has chosen for it.
    var byBlank = {};
    p.items.forEach(function (it) {
      if (it.passage === q.passage && it.blank) byBlank[it.blank] = it;
    });
    pas.paras.forEach(function (para) {
      var txt = examText(para).replace(/\{(\d+)\}/g, function (_, n) {
        var it = byBlank[n];
        var chosen = it && p.answers[it.uid];
        var cls = 'exam-kloz-blank' + (it && it.uid === q.uid ? ' cur' : '') + (chosen ? ' filled' : '');
        return '<span class="' + cls + '">(' + n + ') ' + (chosen ? examEsc(chosen) : '________') + '</span>';
      });
      h += '<p>' + txt + '</p>';
    });
  } else {
    pas.paras.forEach(function (para) { h += '<p>' + examText(para) + '</p>'; });
  }
  // The English meaning of a Malay passage is shown once, with the passage,
  // and only after marking: during the paper it would give answers away.
  if (mode === 'review' && pas.gloss) h += '<div class="exam-gloss"><b>In English:</b> ' + examText(pas.gloss) + '</div>';
  return h + '</div>';
}

// ---- Items --------------------------------------------------------------------
// mode 'answer' is live and clickable; mode 'review' shows the marking.

function examItemHTML(q, r, mode) {
  var h = '';
  if (q.prompt) h += '<div class="exam-prompt">' + examText(q.prompt) + '</div>';
  if (q.visual) h += '<div class="exam-visual">' + examVisual(q.visual) + '</div>';

  if (q.type === 'mcq') h += examMcqHTML(q, r, mode);
  else if (q.type === 'number' || q.type === 'word') h += examTypedHTML(q, r, mode);
  else if (q.type === 'arrange') h += examArrangeHTML(q, r, mode);
  else if (q.type === 'select') h += examSelectHTML(q, r, mode);
  else if (q.type === 'time') h += examTimeHTML(q, r, mode);
  return h;
}

function examMcqHTML(q, r, mode) {
  var pics = !!q.optionVisuals;
  var wide = pics && !!q.optionsWide;
  var h = '<div class="exam-options' + (pics ? ' pics' : '') + (wide ? ' wide' : '') + '">';
  q.options.forEach(function (o, i) {
    var cls = 'exam-opt';
    if (r === o) cls += ' chosen';
    if (mode === 'review') {
      if (o === q.answer) cls += ' right';
      else if (r === o) cls += ' wrong';
    }
    var label = '<span class="exam-opt-key">' + String.fromCharCode(65 + i) + '</span>';
    var body = pics ? examVisual(q.optionVisuals[o], { small: !wide }) : '<span class="exam-opt-txt">' + examText(o) + '</span>';
    h += mode === 'answer'
      ? '<button class="' + cls + '" data-act="pick" data-uid="' + q.uid + '" data-i="' + i + '">' + label + body + '</button>'
      : '<div class="' + cls + '">' + label + body + '</div>';
  });
  return h + '</div>';
}

function examTypedHTML(q, r, mode) {
  if (mode === 'review') return '';
  var num = q.type === 'number';
  return '<div class="exam-typed"><label>Answer:</label>' +
         '<input class="exam-input text-input" data-uid="' + q.uid + '" type="text" ' +
         (num ? 'inputmode="numeric" pattern="[0-9]*" maxlength="4" ' : 'maxlength="30" ') +
         'autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" value="' +
         examEsc(r === undefined ? '' : r) + '">' +
         (q.unit ? '<span class="exam-unit">' + examEsc(q.unit) + '</span>' : '') + '</div>';
}

function examArrangeHTML(q, r, mode) {
  var order = Array.isArray(r) ? r : [];
  var end = q.end || '';
  var h = '';
  // q.list: putting events or stages in order, shown as a numbered list
  // rather than words building a sentence.
  var lst = q.list ? ' list' : '';
  if (mode === 'answer') {
    h += '<div class="exam-built' + lst + '">';
    if (!order.length) h += '<span class="exam-built-hint">' + (q.list ? 'Tap them below in the right order: first one first.' : 'Tap the words below in the right order.') + '</span>';
    order.forEach(function (ti, pos) {
      h += '<button class="exam-tile placed" data-act="untile" data-uid="' + q.uid + '" data-pos="' + pos + '">' + examEsc(q.tiles[ti]) + '</button>';
    });
    h += '</div>';
    // Once every word is placed, show the sentence written out properly.
    // A full stop drawn as its own tile would sit apart from the last word
    // ("tinggi ."), and a P1 child should only ever see it written right.
    if (!q.list && order.length === q.tiles.length) {
      h += '<div class="exam-sentence">' + examEsc(examOrderText(q, order)) + examEsc(end) + '</div>';
    }
    h += '<div class="exam-tiles' + lst + '">';
    (q.tileOrder || q.tiles.map(function (_, i) { return i; })).forEach(function (ti) {
      var used = order.indexOf(ti) !== -1;
      h += '<button class="exam-tile' + (used ? ' used' : '') + '" data-act="tile" data-uid="' + q.uid + '" data-t="' + ti + '"' +
           (used ? ' disabled' : '') + '>' + examEsc(q.tiles[ti]) + '</button>';
    });
    h += '</div>';
    if (order.length) h += '<button class="exam-mini" data-act="untile-all" data-uid="' + q.uid + '">↺ Start again</button>';
  } else {
    h += '<div class="exam-tiles">' + (q.tileOrder || []).map(function (ti) {
      return '<span class="exam-tile">' + examEsc(q.tiles[ti]) + '</span>';
    }).join('') + '</div>';
  }
  return h;
}

function examSelectHTML(q, r, mode) {
  var chosen = Array.isArray(r) ? r : [];
  var h = '<div class="exam-tokens">';
  q.tokens.forEach(function (t, i) {
    var cls = 'exam-token';
    var on = chosen.indexOf(i) !== -1;
    if (on) cls += ' on';
    if (mode === 'review') {
      var need = q.answer.indexOf(i) !== -1;
      if (need && on) cls += ' right';
      else if (need && !on) cls += ' missed';
      else if (!need && on) cls += ' wrong';
    }
    h += mode === 'answer'
      ? '<button class="' + cls + '" data-act="tok" data-uid="' + q.uid + '" data-t="' + i + '">' + examEsc(t) + '</button>'
      : '<span class="' + cls + '">' + examEsc(t) + '</span>';
  });
  return h + '</div>';
}

function examTimeHTML(q, r, mode) {
  if (mode === 'review') return '';
  var cur = r || {};
  var h = '<div class="exam-time"><div class="exam-time-show">' +
          (typeof cur.h === 'number' ? cur.h : '_') + EXAM_TIME_SEP +
          (typeof cur.m === 'number' ? (cur.m < 10 ? '0' : '') + cur.m : '__') + '</div>';
  h += '<div class="exam-time-label">Hour</div><div class="exam-time-grid">';
  for (var hh = 1; hh <= 12; hh++) {
    h += '<button class="exam-time-btn' + (cur.h === hh ? ' on' : '') + '" data-act="th" data-uid="' + q.uid + '" data-v="' + hh + '">' + hh + '</button>';
  }
  h += '</div><div class="exam-time-label">Minutes</div><div class="exam-time-grid">';
  for (var mm = 0; mm < 60; mm += 5) {
    h += '<button class="exam-time-btn' + (cur.m === mm ? ' on' : '') + '" data-act="tm" data-uid="' + q.uid + '" data-v="' + mm + '">' +
         (mm < 10 ? '0' : '') + mm + '</button>';
  }
  return h + '</div></div>';
}

// ---- Results ------------------------------------------------------------------

function examVerdict(pct) {
  if (pct === 100) return 'Every mark. You read each question carefully.';
  if (pct >= 85) return 'Excellent work. Only a few slipped through; look at those below.';
  if (pct >= 70) return 'Good work. The questions below show exactly what to practise.';
  if (pct >= 50) return 'You are getting there. Go through the mistakes one at a time; each one comes with a reason.';
  return 'This was a hard paper, and that is how we find what to practise. Go through it with a grown-up, one question at a time.';
}

function examResultsHTML(v) {
  var att = examAttemptById(v.attemptId);
  if (!att) return examHubHTML();
  var def = EXAM_SUBJECTS[att.subject];
  var pct = att.total ? Math.round(att.score / att.total * 100) : 0;
  var wrong = att.items.filter(function (q) { return !att.marks[q.uid]; });
  var filter = v.filter || (wrong.length ? 'wrong' : 'all');

  var h = '<button class="back-btn" data-act="hub">← Exam Prep</button>';
  h += '<div class="exam-card exam-score">';
  h += '<div class="exam-score-sub">' + def.icon + ' ' + examEsc(def.name) + ' · ' + examEsc(examModeLabel(att)) + ' · ' + examDate(att.finishedAt) +
       (att.activeMs ? ' · ' + examMins(att.activeMs) : '') + '</div>';
  h += '<div class="exam-score-big">' + att.score + ' <span>/ ' + att.total + '</span></div>';
  h += '<div class="exam-score-pct">' + pct + '%' + (att.stars ? ' · +' + att.stars + ' ⭐' : '') +
       (att.isBest ? ' · <b>new best</b>' : '') + '</div>';
  h += '<p class="exam-verdict">' + examVerdict(pct) + '</p>';

  h += '<div class="exam-bars">';
  att.sections.forEach(function (s) {
    var r = att.bySection[s.id];
    if (!r) return;
    var f = r.total ? r.score / r.total : 0;
    h += '<div class="exam-bar-row"><span class="exam-bar-name">' + examEsc(s.name) + '</span>' +
         '<span class="exam-bar"><i style="width:' + Math.round(f * 100) + '%"></i></span>' +
         '<span class="exam-bar-n">' + r.score + '/' + r.total + '</span></div>';
  });
  h += '</div>';

  var weak = examWeakest(att);
  h += '<div class="exam-next">';
  if (wrong.length) {
    h += '<button class="lesson-btn lesson-btn-done" data-act="redo" data-id="' + att.id + '">Redo my ' + wrong.length +
         ' mistake' + (wrong.length === 1 ? '' : 's') + '</button>';
  }
  if (weak && att.mode !== 'section') {
    var wsec = examSectionDef(def, weak.id);
    if (wsec) {
      h += '<button class="lesson-btn" data-act="begin" data-subject="' + att.subject + '" data-mode="section" data-section="' +
           wsec.id + '">Practise ' + examEsc(wsec.name) + '</button>';
    }
  }
  h += '</div></div>';

  h += '<div class="exam-filter">';
  h += '<button class="exam-chip' + (filter === 'wrong' ? ' on' : '') + '" data-act="filter" data-f="wrong" data-id="' + att.id + '">To fix (' + wrong.length + ')</button>';
  h += '<button class="exam-chip' + (filter === 'all' ? ' on' : '') + '" data-act="filter" data-f="all" data-id="' + att.id + '">All (' + att.total + ')</button>';
  h += '</div>';

  var shownPassages = {};
  att.items.forEach(function (q, i) {
    var ok = att.marks[q.uid];
    if (filter === 'wrong' && ok) return;
    h += examReviewCardHTML(att, q, i, ok, shownPassages);
  });
  if (filter === 'wrong' && !wrong.length) {
    h += '<div class="exam-card exam-allright">🌟 Nothing to fix on this paper.</div>';
  }
  return h;
}

function examReviewCardHTML(att, q, i, ok, shownPassages) {
  var r = att.answers[q.uid];
  var h = '<div class="exam-card exam-review ' + (ok ? 'ok' : 'no') + '">';
  h += '<div class="exam-review-head"><span class="exam-review-mark">' + (ok ? '✓' : '✗') + '</span>' +
       '<span class="exam-q-num">' + (i + 1) + '.</span><span class="exam-review-sec">' +
       examEsc((examSectionOf(att, i) || {}).name || '') + '</span></div>';

  if (q.passage) {
    var pas = examPassageById(att.subject, q.passage);
    if (pas) {
      h += '<details class="exam-passage-fold"><summary>Read the passage again: ' +
           examText(pas.title || 'passage') + '</summary>' + examPassageHTML(att, q, 'review') + '</details>';
      shownPassages[q.passage] = true;
    }
  }

  h += examItemHTML(q, r, 'review');

  var mine = examDescribe(q, r);
  if (q.type !== 'mcq' || !ok) {
    h += '<div class="exam-answers">';
    if (q.type !== 'mcq') {
      h += '<div><span>Your answer:</span> ' + (mine === null ? '<em>left empty</em>' : '<b class="' + (ok ? 'good' : 'bad') + '">' + examEsc(mine) + (q.end && q.type === 'arrange' ? examEsc(q.end) : '') + '</b>') + '</div>';
    } else if (mine === null) {
      h += '<div><span>Your answer:</span> <em>left empty</em></div>';
    }
    if (!ok) {
      h += '<div><span>Correct answer:</span> <b class="good">' + examEsc(examDescribeAnswer(q)) + (q.end && q.type === 'arrange' ? examEsc(q.end) : '') + '</b></div>';
    }
    h += '</div>';
  }

  if (!ok && q.why && r !== undefined && q.why[r]) {
    h += '<div class="exam-why-wrong">' + examText(q.why[r]) + '</div>';
  }
  if (q.explain) h += '<div class="exam-explain"><b>Why:</b> ' + examText(q.explain) + '</div>';
  if (q.gloss) h += '<div class="exam-gloss"><b>In English:</b> ' + examText(q.gloss) + '</div>';
  if (q.steps && q.steps.length) {
    h += '<div class="exam-steps"><b>How to work it out</b><ol>';
    q.steps.forEach(function (s) { h += '<li>' + examText(s) + '</li>'; });
    h += '</ol></div>';
  }
  return h + '</div>';
}

// ---- History ------------------------------------------------------------------

function examHistoryHTML() {
  var list = examStore().attempts.slice().reverse();
  var h = '<button class="back-btn" data-act="hub">← Exam Prep</button>';
  h += '<h2 class="exam-title">Past papers</h2>';
  if (!list.length) return h + '<p class="exam-sub">No papers yet.</p>';
  h += '<div class="exam-history">';
  list.forEach(function (a) {
    var def = EXAM_SUBJECTS[a.subject];
    if (!def) return;
    var pct = a.total ? Math.round(a.score / a.total * 100) : 0;
    h += '<button class="exam-hist-row" data-act="results" data-id="' + a.id + '">' +
         '<span class="exam-hist-icon">' + def.icon + '</span>' +
         '<span class="exam-hist-main"><b>' + examEsc(def.name) + '</b> · ' + examEsc(examModeLabel(a)) +
         '<small>' + examDate(a.finishedAt) + (a.activeMs ? ' · ' + examMins(a.activeMs) : '') + '</small></span>' +
         '<span class="exam-hist-score">' + a.score + '/' + a.total + '<small>' + pct + '%</small></span></button>';
  });
  return h + '</div>';
}

// ---- Grown-ups ------------------------------------------------------------------
// A light gate so the answer keys are not one tap away for a six year
// old: a two-digit times two-digit sum, well past P1.

function examGateHTML(v) {
  if (!v.a) { v.a = 12 + Math.floor(Math.random() * 18); v.b = 13 + Math.floor(Math.random() * 17); }
  var h = '<button class="back-btn" data-act="hub">← Exam Prep</button>';
  h += '<div class="exam-card exam-gate"><div class="exam-intro-icon">🔒</div>' +
       '<h2 class="exam-title">For grown-ups</h2>' +
       '<p class="exam-sub">The answer keys and the Malay review sheet are behind this question.</p>' +
       '<p class="exam-gate-q">What is ' + v.a + ' × ' + v.b + '?</p>' +
       '<div class="exam-typed"><input class="exam-input text-input" id="exam-gate-in" inputmode="numeric" autocomplete="off"></div>' +
       (v.bad ? '<p class="exam-warn">Not quite. Try again.</p>' : '') +
       '<button class="lesson-btn lesson-btn-done" data-act="gate-try">Open</button></div>';
  return h;
}

function examKeysHTML() {
  var h = '<button class="back-btn" data-act="hub">← Exam Prep</button>';
  h += '<div class="exam-card exam-keys"><h2 class="exam-title">Answer keys and review sheets</h2>' +
       '<p class="exam-sub">Each opens as a printable page: every question in the bank, its answer, and why. ' +
       'The Malay sheet has a column for your reviewer to tick or flag each item.</p>';
  examSubjectList().forEach(function (def) {
    h += '<button class="lesson-btn" data-act="sheet" data-subject="' + def.id + '">' + def.icon + ' ' + examEsc(def.name) +
         (def.id === 'ml' ? ' review sheet' : def.id === 'ma' ? ' worked examples' : ' answer key') + '</button>';
  });
  return h + '</div>';
}

// ---- Timer -------------------------------------------------------------------------

function examStartTimer() {
  examStopTimer();
  _examTimer = setInterval(function () {
    var scr = document.getElementById('screen-exam');
    var p = examCurrent();
    if (!p || _examView.name !== 'paper' || (scr && !scr.classList.contains('active'))) { examStopTimer(); return; }
    p.activeMs = (p.activeMs || 0) + 1000;
    var el = document.getElementById('exam-clock');
    if (el) el.textContent = '⏱ ' + examMins(p.activeMs);
    if (p.activeMs % 15000 === 0) examSave();
  }, 1000);
}

function examStopTimer() {
  if (_examTimer) { clearInterval(_examTimer); _examTimer = null; }
}

// ---- Events --------------------------------------------------------------------------

function examBind() {
  if (_examBound) return;
  var c = document.getElementById('exam-content');
  if (!c || !c.addEventListener) return;
  _examBound = true;
  c.addEventListener('click', examOnClick);
  c.addEventListener('input', examOnInput);
  c.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && e.target && e.target.id === 'exam-gate-in') { examTryGate(); return; }
    if (e.key === 'Enter' && e.target && e.target.classList && e.target.classList.contains('exam-input') && _examView.name === 'paper') {
      examSave();
      var p = examCurrent();
      if (p && _examView.index < p.items.length - 1) examGo({ name: 'paper', index: _examView.index + 1 });
    }
  });
  if (typeof document !== 'undefined' && document.addEventListener) {
    document.addEventListener('keydown', examOnKey);
  }
}

function examOnKey(e) {
  if (_examView.name !== 'paper') return;
  var scr = document.getElementById('screen-exam');
  if (scr && !scr.classList.contains('active')) return;
  var t = e.target;
  if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA')) return;
  var p = examCurrent();
  if (!p || _examView.confirm) return;
  var q = p.items[_examView.index];
  if (e.key === 'ArrowRight' && _examView.index < p.items.length - 1) examGo({ name: 'paper', index: _examView.index + 1 });
  else if (e.key === 'ArrowLeft' && _examView.index > 0) examGo({ name: 'paper', index: _examView.index - 1 });
  else if (q && q.type === 'mcq' && /^[1-9]$/.test(e.key)) {
    var i = parseInt(e.key, 10) - 1;
    if (i < q.options.length) { examSetAnswer(q.uid, q.options[i]); examGo({ name: 'paper', index: _examView.index, noFocus: true }); }
  }
}

function examOnInput(e) {
  var t = e.target;
  if (!t || !t.getAttribute) return;
  var uid = t.getAttribute('data-uid');
  if (!uid) return;
  var p = examCurrent();
  if (!p) return;
  var v = t.value;
  if (v === '') delete p.answers[uid]; else p.answers[uid] = v;
  // Save shortly after typing stops, not on every keystroke.
  if (_examSaveSoon) clearTimeout(_examSaveSoon);
  _examSaveSoon = setTimeout(examSave, 500);
  examRefreshPalette();
}

/** Repaint only the palette, so typing does not lose focus. */
function examRefreshPalette() {
  var p = examCurrent();
  var c = document.getElementById('exam-content');
  if (!p || !c || !c.querySelector) return;
  var old = c.querySelector('.exam-palette');
  if (!old) return;
  var wrap = document.createElement('div');
  wrap.innerHTML = examPaletteHTML(p, _examView.index);
  if (wrap.firstChild && old.parentNode) old.parentNode.replaceChild(wrap.firstChild, old);
}

function examOnClick(e) {
  var el = e.target;
  while (el && el !== e.currentTarget && !(el.getAttribute && el.getAttribute('data-act'))) el = el.parentNode;
  if (!el || !el.getAttribute || !el.getAttribute('data-act')) return;
  if (el.disabled) return;
  examAction(el.getAttribute('data-act'), function (k) { return el.getAttribute('data-' + k); });
}

function examAction(act, d) {
  var p = examCurrent();
  var uid = d('uid');
  var q = p && uid ? p.items.filter(function (it) { return it.uid === uid; })[0] : null;
  var stay = function () { examGo({ name: 'paper', index: _examView.index, noFocus: true }); };

  switch (act) {
    case 'home':
      examStopTimer();
      if (typeof showScreen === 'function') showScreen('home');
      return;
    case 'hub': examSave(); return examGo({ name: 'hub' });
    case 'history': return examGo({ name: 'history' });
    case 'intro': return examGo({ name: 'intro', subject: d('subject'), mode: d('mode'), section: d('section') || null });
    case 'begin': {
      var np = examStart(d('subject'), d('mode'), d('section') || null);
      if (np) examGo({ name: 'paper', index: 0 });
      return;
    }
    case 'resume': {
      var first = p ? examUnanswered(p)[0] : null;
      return examGo({ name: 'paper', index: first ? p.items.indexOf(first) : 0 });
    }
    case 'discard':
      if (typeof confirm === 'function' && !confirm('Throw away this paper? Your answers will be lost.')) return;
      examDiscard(); return examGo({ name: 'hub' });
    case 'go': {
      examSave();
      var i = parseInt(d('i'), 10);
      if (!isNaN(i)) examGo({ name: 'paper', index: i });
      return;
    }
    case 'pick':
      if (!q) return;
      examSetAnswer(uid, q.options[parseInt(d('i'), 10)]);
      if (typeof playSound === 'function') { try { playSound('click'); } catch (e) {} }
      return stay();
    case 'tile': {
      if (!q) return;
      var cur = (p.answers[uid] || []).slice();
      var t = parseInt(d('t'), 10);
      if (cur.indexOf(t) === -1) cur.push(t);
      examSetAnswer(uid, cur);
      return stay();
    }
    case 'untile': {
      if (!q) return;
      var cur2 = (p.answers[uid] || []).slice();
      cur2.splice(parseInt(d('pos'), 10), 1);
      examSetAnswer(uid, cur2);
      return stay();
    }
    case 'untile-all': examSetAnswer(uid, null); return stay();
    case 'tok': {
      if (!q) return;
      var sel = (p.answers[uid] || []).slice();
      var ti = parseInt(d('t'), 10);
      var at = sel.indexOf(ti);
      if (at === -1) sel.push(ti); else sel.splice(at, 1);
      examSetAnswer(uid, sel);
      return stay();
    }
    case 'th': case 'tm': {
      if (!q) return;
      var tv = Object.assign({ h: null, m: null }, p.answers[uid] || {});
      if (act === 'th') tv.h = parseInt(d('v'), 10); else tv.m = parseInt(d('v'), 10);
      examSetAnswer(uid, tv);
      return stay();
    }
    case 'flag': examToggleFlag(uid); return stay();
    case 'handin': examSave(); _examView.confirm = true; return examRender();
    case 'confirm-no': _examView.confirm = false; return examRender();
    case 'confirm-yes': {
      var att = examHandIn();
      if (!att) return examGo({ name: 'hub' });
      if (typeof playSound === 'function') { try { playSound(att.isBest ? 'levelup' : 'correct'); } catch (e) {} }
      if (typeof spawnParticles === 'function' && att.score / att.total >= 0.7) {
        try { spawnParticles(window.innerWidth / 2, window.innerHeight / 3, 10, '⭐'); } catch (e) {}
      }
      return examGo({ name: 'results', attemptId: att.id });
    }
    case 'results': return examGo({ name: 'results', attemptId: d('id') });
    case 'filter': return examGo({ name: 'results', attemptId: d('id'), filter: d('f') });
    case 'redo': {
      var rp = examStartRedo(d('id'));
      if (rp) examGo({ name: 'paper', index: 0 });
      return;
    }
    case 'gate': return examGo({ name: 'gate' });
    case 'gate-try': return examTryGate();
    case 'sheet': return examOpenSheet(d('subject'));
  }
}

function examTryGate() {
  var v = _examView;
  var inp = document.getElementById('exam-gate-in');
  var n = inp ? parseInt(String(inp.value).trim(), 10) : NaN;
  if (n === v.a * v.b) return examGo({ name: 'keys' });
  v.bad = true;
  v.a = null;
  examRender();
}

// ---- Printable answer keys / review sheet -----------------------------------------

function examOpenSheet(subjectId) {
  var html = examSheetHTML(subjectId);
  var w = null;
  try { w = window.open('', '_blank'); } catch (e) { w = null; }
  if (w && w.document) {
    w.document.open();
    w.document.write(html);
    w.document.close();
    return;
  }
  // Pop-ups blocked: show it in place, with a print button.
  var c = document.getElementById('exam-content');
  if (c) {
    c.innerHTML = '<button class="back-btn" data-act="hub">← Exam Prep</button>' +
      '<p class="exam-sub">Your browser blocked the new tab, so the sheet is shown here. Use your browser\'s Print to print it.</p>' +
      '<iframe class="exam-sheet-frame" title="Answer sheet"></iframe>';
    var f = c.querySelector('iframe');
    if (f && f.contentWindow) {
      f.contentWindow.document.open(); f.contentWindow.document.write(html); f.contentWindow.document.close();
    }
  }
}

if (typeof window !== 'undefined') {
  window.renderExamHub = renderExamHub;
  window.examAction = examAction;
}
