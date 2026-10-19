// ============================================================
//  EXAM PREP — printable answer keys and the Malay review sheet
// ============================================================
//
//  examSheetHTML(subject) returns a complete, standalone HTML document:
//  every item in the bank, the answer, the reason, and for Malay the
//  English gloss, with a column for a reviewer to tick or flag each one.
//  It ends with every distinct Malay word used, so spelling can be
//  checked in one pass rather than item by item.
//
//  Maths is generated rather than banked, so its sheet shows each
//  generator's scope and three worked examples drawn from a fixed seed,
//  then the answer key to each practice paper. Printing the sheet twice
//  gives the same examples.
//
//  English and Malay rows say which practice paper each item is in.
// ============================================================

function sheetEsc(s) {
  return String(s === undefined || s === null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function sheetText(s) {
  return sheetEsc(s)
    .replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>')
    .replace(/_{3,}/g, '______')
    .replace(/\n/g, '<br>');
}

var SHEET_CSS =
  '*{box-sizing:border-box}body{font:13px/1.45 "Helvetica Neue",Arial,sans-serif;color:#1d1d1f;margin:24px;background:#fff}' +
  'h1{font-size:22px;margin:0 0 4px}h2{font-size:17px;margin:26px 0 8px;padding-bottom:4px;border-bottom:2px solid #1d1d1f;break-after:avoid}' +
  'h3{font-size:14px;margin:18px 0 6px;break-after:avoid}.meta{color:#555;margin-bottom:12px}' +
  '.how{background:#f4f4f6;border-radius:8px;padding:10px 14px;margin:10px 0 18px}.how li{margin:2px 0}' +
  'table{width:100%;border-collapse:collapse;margin:6px 0 14px}th,td{border:1px solid #c9c9cf;padding:6px 7px;vertical-align:top;text-align:left}' +
  'th{background:#ececf0;font-size:12px}tr{break-inside:avoid}.id{font:11px Menlo,monospace;color:#666;white-space:nowrap}' +
  '.pp{width:40px;text-align:center;font-weight:700}' +
  '.opts span{display:inline-block;margin:1px 6px 1px 0;padding:0 5px;border-radius:4px;background:#f1f1f4}' +
  '.opts span.ok{background:#d9f5df;font-weight:700}.ans{font-weight:700;color:#0a6b2b}.gloss{color:#444;font-style:italic}' +
  '.why{color:#333}.box{width:34px;text-align:center}.note{width:22%}.passage{border:1px solid #c9c9cf;border-radius:8px;padding:10px 14px;margin:8px 0;break-inside:avoid}' +
  '.passage p{margin:4px 0}.words{columns:4;column-gap:24px;font-size:12px}.words div{break-inside:avoid}.lvl{font-size:11px;color:#8a5a00}' +
  '.steps{margin:4px 0 0 18px;padding:0}.print{position:fixed;top:12px;right:12px;padding:8px 14px;border-radius:8px;border:1px solid #888;background:#fff;cursor:pointer}' +
  '@media print{.print{display:none}body{margin:12mm}a{color:inherit}}' +
  '@page{size:A4;margin:12mm}';

function sheetDoc(title, body) {
  return '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">' +
    '<title>' + sheetEsc(title) + '</title><style>' + SHEET_CSS + '</style></head><body>' +
    '<button class="print" onclick="window.print()">Print</button>' + body + '</body></html>';
}

function sheetMeta(def) {
  var v = (typeof APP_VERSION !== 'undefined') ? 'Nasworld v' + APP_VERSION.number + ' · ' : '';
  var d = new Date();
  return '<div class="meta">' + v + 'printed ' + d.getDate() + '/' + (d.getMonth() + 1) + '/' + d.getFullYear() +
         ' · P1 end-of-year level · ' + def.name + '</div>';
}

function sheetLevel(q) {
  return q.level === 3 ? ' <span class="lvl">stretch</span>' : q.level === 2 ? ' <span class="lvl">harder</span>' : '';
}

/** Which practice paper each item and passage is in: { id: paperNo }. */
function sheetPaperMap(subjectId) {
  var map = {};
  (examPaperPlan(subjectId) || []).forEach(function (paper) {
    Object.keys(paper.sections).forEach(function (s) {
      paper.sections[s].forEach(function (it) {
        map[it.id] = paper.no;
        if (it.passage) map[it.passage] = paper.no;
      });
    });
  });
  return map;
}

/** One row: the item, its answer and reason, and empty review boxes. */
function sheetRow(q, withGloss, paperNo) {
  var item = '<div>' + sheetText(q.prompt || '') + sheetLevel(q) + '</div>';
  if (q.visual && q.visual.kind === 'emoji') item += '<div style="font-size:28px">' + q.visual.text + '</div>';
  if (q.visual && q.visual.kind === 'scene') item += '<div class="why">[picture: the ' + sheetEsc(q.visual.who) + ' is ' + sheetEsc(q.visual.relation) + ' the object]</div>';
  if (q.type === 'mcq') {
    item += '<div class="opts">' + q.options.map(function (o) {
      return '<span class="' + (o === q.answer ? 'ok' : '') + '">' + sheetText(o) + (o === q.answer ? ' ✓' : '') + '</span>';
    }).join('') + '</div>';
  }
  if (q.type === 'arrange') item += '<div class="opts">' + q.tiles.map(function (t) { return '<span>' + sheetEsc(t) + '</span>'; }).join('') + '</div>';
  if (q.type === 'select') item += '<div class="opts">' + q.tokens.map(function (t, i) {
    return '<span class="' + (q.answer.indexOf(i) !== -1 ? 'ok' : '') + '">' + sheetEsc(t) + '</span>';
  }).join('') + '</div>';

  var ans = '';
  if (q.type === 'arrange') {
    var orders = [q.answer].concat(q.accept || []).map(function (a) { return (Array.isArray(a) ? a.join(' ') : a) + (q.end || ''); });
    ans = orders.map(function (o, i) { return (i ? 'also accepted: ' : '') + '<span class="ans">' + sheetEsc(o) + '</span>'; }).join('<br>');
  } else if (q.type === 'select') {
    ans = '<span class="ans">' + q.answer.map(function (i) { return sheetEsc(q.tokens[i]); }).join(', ') + '</span>';
  } else {
    ans = '<span class="ans">' + sheetEsc(q.answer) + '</span>';
    if (q.accept && q.accept.length) ans += '<br>also accepted: ' + q.accept.map(sheetEsc).join(', ');
  }
  var why = '<div class="why">' + sheetText(q.explain || '') + '</div>';
  if (withGloss && q.gloss) why = '<div class="gloss">' + sheetText(q.gloss) + '</div>' + why;

  return '<tr><td class="id">' + sheetEsc(q.id.replace(/^(el|ml)-/, '')) + '</td><td class="pp">' + (paperNo || '–') + '</td><td>' + item +
         '</td><td>' + ans + '</td><td>' + why + '</td><td class="box">☐</td><td class="box">☐</td><td class="note"></td></tr>';
}

function sheetTable(rows) {
  return '<table><thead><tr><th>ID</th><th class="pp">Paper</th><th>Item</th><th>Answer</th><th>' + 'Meaning and reason' +
         '</th><th class="box">OK</th><th class="box">Fix</th><th class="note">Note</th></tr></thead><tbody>' + rows + '</tbody></table>';
}

var SHEET_PAPER_NOTE = 'The <b>Paper</b> column says which of the ' + EXAM_PAPER_COUNT + ' practice papers each question is in; ' +
  'a dash means it appears only in mixed papers and section practice.';

function sheetBanked(def, withGloss) {
  var papers = sheetPaperMap(def.id);
  var h = '';
  def.sections.forEach(function (sec) {
    h += '<h2>' + sheetEsc(sec.name) + '</h2>';
    if (sec.instructions) h += '<div class="why">Instruction on the paper: <i>' + sheetEsc(sec.instructions) + '</i></div>';
    if (sec.passages) {
      (def.passages || []).filter(function (p) { return p.section === sec.id; }).forEach(function (p) {
        h += '<h3>' + sheetEsc(p.title) + ' <span class="id">' + sheetEsc(p.id) +
             (papers[p.id] ? ' · Practice Paper ' + papers[p.id] : '') + '</span></h3><div class="passage">';
        p.paras.forEach(function (para) {
          h += '<p>' + sheetText(para).replace(/\{(\d+)\}/g, '<b>($1)</b> ______') + '</p>';
        });
        if (withGloss && p.gloss) h += '<p class="gloss">' + sheetText(p.gloss) + '</p>';
        h += '</div>' + sheetTable(p.items.map(function (q) { return sheetRow(q, withGloss, papers[q.id]); }).join(''));
      });
    } else {
      var items = def.items.filter(function (q) { return q.section === sec.id; });
      h += sheetTable(items.map(function (q) { return sheetRow(q, withGloss, papers[q.id]); }).join(''));
    }
  });
  return h;
}

/** Every distinct Malay word in the bank, for a single spelling pass. */
function sheetWordList(def) {
  var words = {};
  var add = function (t) {
    String(t || '').replace(/\*\*|\{\d+\}|_{3,}/g, ' ').split(/[^A-Za-z-]+/).forEach(function (w) {
      w = w.replace(/^-+|-+$/g, '').toLowerCase();
      if (w) words[w] = true;
    });
  };
  def.items.forEach(function (q) {
    add(q.prompt); (q.options || []).forEach(add); (q.tiles || []).forEach(add);
    if (q.type === 'word') add(q.answer);
  });
  (def.passages || []).forEach(function (p) {
    add(p.title); p.paras.forEach(add);
    p.items.forEach(function (q) { add(q.prompt); q.options.forEach(add); });
  });
  var list = Object.keys(words).sort();
  return '<h2>Every word used (' + list.length + ')</h2>' +
    '<div class="why">All the words that appear in the Malay questions, passages and options, in alphabetical order. ' +
    'Please circle any that are misspelt or not standard Singapore Malay. (A few English instruction words and names appear too.)</div>' +
    '<div class="words">' + list.map(function (w) { return '<div>' + sheetEsc(w) + '</div>'; }).join('') + '</div>';
}

/** A maths picture, said in words. */
function sheetVisualNote(v) {
  if (!v) return '';
  return '<div class="why">[picture: ' + sheetEsc(v.kind === 'clock' ? 'clock at ' + examFormatTime(v.h, v.m)
      : v.kind === 'ruler' ? 'ruler, object from ' + v.from + ' cm to ' + v.to + ' cm'
      : v.kind === 'groups' ? v.groups + ' groups of ' + v.each
      : v.kind === 'array' ? v.rows + ' rows of ' + v.cols
      : v.kind === 'share' ? v.total + ' things' + (v.people ? ', ' + v.people + ' children' : '')
      : v.kind === 'blocks' ? v.tens + ' tens and ' + v.ones + ' ones'
      : v.kind === 'bond' ? 'number bond, whole ' + (v.whole === null ? '?' : v.whole) + ', parts ' + v.parts.map(function (x) { return x === null ? '?' : x; }).join(' and ')
      : v.kind === 'pgraph' ? 'picture graph: ' + v.rows.map(function (r) { return r.label + ' ' + r.count; }).join(', ')
      : v.kind === 'figure' ? v.name + ' made of ' + JSON.stringify(examFigureCounts(v.name)).replace(/[{}"]/g, '').replace(/,/g, ', ')
      : v.kind === 'row' ? 'row, left to right: ' + v.items.join(' ')
      : v.kind) + ']</div>';
}

function sheetMathsAnswer(q) {
  return q.type === 'time' ? examFormatTime(q.answer.h, q.answer.m)
       : q.type === 'mcq' ? ((q.optionText && q.optionText[q.answer]) || q.answer)
       : (q.type === 'arrange' ? (Array.isArray(q.answer) ? q.answer.join(' ') : q.answer) : q.answer);
}

/** The fixed practice papers: every question and its answer, paper by paper. */
function sheetMathsPapers(def) {
  var h = '<h2>The ' + EXAM_PAPER_COUNT + ' practice papers</h2>' +
          '<div class="why">Each practice paper always has these questions, in this order; only the order of the answer choices ' +
          'changes from one sitting to the next. No question is in two papers.</div>';
  (examPaperPlan(def.id) || []).forEach(function (paper) {
    h += '<h3>Practice Paper ' + paper.no + '</h3><table><tbody>';
    var n = 0;
    def.sections.forEach(function (sec) {
      h += '<tr><th colspan="3">' + sheetEsc(sec.name) + '</th></tr>';
      (paper.sections[sec.id] || []).forEach(function (q) {
        n++;
        h += '<tr><td class="id" style="width:4%">' + n + '</td><td>' + sheetText(q.prompt) + sheetVisualNote(q.visual) +
             '</td><td style="width:18%"><span class="ans">' + sheetEsc(sheetMathsAnswer(q)) + (q.unit ? ' ' + sheetEsc(q.unit) : '') + '</span></td></tr>';
      });
    });
    h += '</tbody></table>';
  });
  return h;
}

function sheetMaths(def) {
  var h = '<div class="how"><b>Maths questions are generated, not stored.</b> Each generator below makes a new question every time, ' +
          'within the limits shown. Every answer and every step of working is computed, and checked automatically against ' +
          'tens of thousands of examples. Below are three examples of each, always the same three. The answer keys for the ' +
          EXAM_PAPER_COUNT + ' practice papers come after them.</div>';
  var topics = {};
  (def.practice || []).forEach(function (t) { topics[t.id] = t.name; });
  var byTopic = {};
  def.gens.forEach(function (g) { (byTopic[g.topic] = byTopic[g.topic] || []).push(g); });
  Object.keys(byTopic).forEach(function (topic) {
    h += '<h2>' + sheetEsc(topics[topic] || topic) + '</h2>';
    byTopic[topic].forEach(function (g) {
      var rng = examRng(20261019 + g.id.length * 131);
      h += '<h3>' + sheetEsc(g.id) + ' <span class="id">' + ({ mcq: 'multiple choice', short: 'short answer', wp: 'word problem' }[g.fmt] || g.fmt) + '</span></h3><table><tbody>';
      for (var i = 0; i < 3; i++) {
        var q = g.make(rng);
        var ans = sheetMathsAnswer(q);
        var vis = sheetVisualNote(q.visual);
        var opts = (q.type === 'mcq' && !q.optionVisuals) ? '<div class="opts">' + q.options.map(function (o) {
          return '<span class="' + (o === q.answer ? 'ok' : '') + '">' + sheetText(o) + '</span>';
        }).join('') + '</div>' : '';
        h += '<tr><td style="width:46%">' + sheetText(q.prompt) + vis + opts + '</td><td style="width:12%"><span class="ans">' +
             sheetEsc(ans) + (q.unit ? ' ' + sheetEsc(q.unit) : '') + '</span></td><td><ol class="steps">' +
             (q.steps || []).map(function (st) { return '<li>' + sheetText(st) + '</li>'; }).join('') + '</ol></td></tr>';
      }
      h += '</tbody></table>';
    });
  });
  return h;
}

function examSheetHTML(subjectId) {
  var def = EXAM_SUBJECTS[subjectId];
  if (!def) return sheetDoc('Not found', '<p>No such subject.</p>');
  var count = def.items ? def.items.length + (def.passages || []).reduce(function (n, p) { return n + p.items.length; }, 0) : 0;

  if (subjectId === 'ml') {
    var body = '<h1>Bahasa Melayu: review sheet</h1>' + sheetMeta(def) +
      '<div class="how"><b>For the reviewer.</b> Thank you for checking these. Every item Nas can be given is listed below with its ' +
      'answer, an English meaning, and the reason shown to her after marking.<ul>' +
      '<li>Tick <b>OK</b> if the item, its answer and every wrong option are right.</li>' +
      '<li>Tick <b>Fix</b> and write a note if anything is wrong: a spelling, a word that is not standard Singapore Malay, ' +
      'a second option that could also be correct, or an unclear sentence.</li>' +
      '<li>Wrong options should be clearly wrong in the sentence. If you could defend one as correct, please flag it.</li>' +
      '<li>Question words appear in plain form in Kosa Kata (Bila, Di mana) and with -kah in the comprehension questions ' +
      '(Bilakah, Di manakah), as in school papers.</li></ul>' +
      count + ' items in total. The full word list for a spelling check is at the end. ' + SHEET_PAPER_NOTE + '</div>' +
      sheetBanked(def, true) + sheetWordList(def);
    return sheetDoc('Bahasa Melayu review sheet', body);
  }
  if (subjectId === 'el') {
    return sheetDoc('English answer key', '<h1>English: answer key</h1>' + sheetMeta(def) +
      '<div class="how">Every item in the English bank, ' + count + ' in all, with its answer and the reason shown after marking. ' +
      'The OK and Fix columns are there if you want to check them. ' + SHEET_PAPER_NOTE + '</div>' + sheetBanked(def, false));
  }
  return sheetDoc('Maths worked examples and answer keys', '<h1>Maths: worked examples and answer keys</h1>' + sheetMeta(def) + sheetMaths(def) + sheetMathsPapers(def));
}

if (typeof window !== 'undefined') window.examSheetHTML = examSheetHTML;
