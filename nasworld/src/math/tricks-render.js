// ============================================================
//  TRICKS UI — the hub, the detail page, and the visual models.
//
//  Design rule: a trick page must SHOW before it TELLS. Every step
//  carries a drawn model, because "8 + 5 = 13" is a fact but a
//  ten-frame filling up and spilling over is an explanation.
// ============================================================

// ---- Visual models ------------------------------------------------------
//
//  Each returns HTML. They are deliberately plain CSS/SVG so they work
//  offline and scale on a phone.

function trickVisual(v) {
  if (!v) return '';
  switch (v.type) {
    case 'tenframe':   return _vTenFrame(v.filled, 10, v.highlightEmpty);
    case 'tenframe2':  return _vTenFrame(v.filled, 20, v.highlightEmpty);
    case 'bond':       return _vBond(v.whole, v.parts);
    case 'numberline': return _vNumberLine(v);
    case 'doublebar':  return _vDoubleBar(v);
    case 'pvslide':    return _vPlaceValueSlide(v);
    case 'bar':        return _vBar(v.value, v.label);
    case 'barhalf':    return _vBarHalf(v.value);
    case 'barminus':   return _vBarMinus(v.value, v.minus);
    case 'chain':      return _vChain(v.values);
    case 'fingers':    return _vFingers(v.fold, v.showCount);
    case 'array':      return _vArray(v.rows, v.cols, v.total);
    case 'neighbour':  return _vNeighbour(v.n, v.stage);
    case 'sq5':        return _vSquareFive(v.n, v.stage);
    case 'cast':       return _vCast(v.n, v.root, v.match);
    default: return '';
  }
}

function _vTenFrame(filled, capacity, highlightEmpty) {
  var frames = Math.ceil(capacity / 10);
  var html = '<div class="tv-frames">';
  for (var f = 0; f < frames; f++) {
    html += '<div class="tv-tenframe">';
    for (var i = 0; i < 10; i++) {
      var idx = f * 10 + i;
      var on = idx < filled;
      var cls = 'tv-cell' + (on ? ' on' : '') + (!on && highlightEmpty && idx < 10 ? ' want' : '');
      html += '<div class="' + cls + '"></div>';
    }
    html += '</div>';
  }
  html += '</div><div class="tv-caption">' + filled + '</div>';
  return html;
}

function _vBond(whole, parts) {
  var html = '<div class="tv-bond">';
  html += '<div class="tv-bond-whole">' + whole + '</div>';
  html += '<svg class="tv-bond-legs" viewBox="0 0 120 34"><path d="M60 2 L22 30" /><path d="M60 2 L98 30" /></svg>';
  html += '<div class="tv-bond-parts">';
  parts.forEach(function (p) { html += '<div class="tv-bond-part">' + p + '</div>'; });
  html += '</div></div>';
  return html;
}

function _vNumberLine(v) {
  var max = v.max || 20;
  var start = v.start;
  var hops = v.hops || 0;
  var end = start + hops;
  var W = 300, pad = 14;
  var x = function (n) { return pad + (n / max) * (W - pad * 2); };
  var html = '<svg class="tv-line" viewBox="0 0 ' + W + ' 74">';
  html += '<line x1="' + pad + '" y1="52" x2="' + (W - pad) + '" y2="52" class="tv-axis"/>';
  for (var t = 0; t <= max; t++) {
    var isLabel = (max <= 20) || (t % 5 === 0);
    html += '<line x1="' + x(t) + '" y1="48" x2="' + x(t) + '" y2="56" class="tv-tick"/>';
    if (isLabel) html += '<text x="' + x(t) + '" y="70" class="tv-tick-label">' + t + '</text>';
  }
  // hop arc
  if (hops !== 0) {
    var from = Math.min(start, end), to = Math.max(start, end);
    html += '<path d="M ' + x(from) + ' 48 Q ' + x((from + to) / 2) + ' ' +
            (v.big ? 6 : 18) + ' ' + x(to) + ' 48" class="tv-hop"/>';
    html += '<text x="' + x((from + to) / 2) + '" y="' + (v.big ? 4 : 14) +
            '" class="tv-hop-label">' + (hops > 0 ? '+' : '') + hops + '</text>';
  }
  html += '<circle cx="' + x(start) + '" cy="52" r="5" class="tv-dot start"/>';
  if (hops !== 0) html += '<circle cx="' + x(end) + '" cy="52" r="5" class="tv-dot end"/>';
  html += '</svg>';
  return html;
}

function _vDoubleBar(v) {
  var html = '<div class="tv-dbl">';
  [v.a, v.b].forEach(function (n, i) {
    html += '<div class="tv-dbl-row"><span class="tv-dbl-label">' + n + '</span><div class="tv-dbl-bar">';
    for (var k = 0; k < n; k++) {
      var isExtra = v.extra && i === 1 && k === n - 1;
      html += '<span class="tv-blk' + (isExtra ? ' extra' : '') + '"></span>';
    }
    html += '</div></div>';
  });
  html += '</div>';
  if (v.extra) html += '<div class="tv-caption">the gold block is the "and one more"</div>';
  return html;
}

function _vPlaceValueSlide(v) {
  var cols = [['Hundreds', 'H'], ['Tens', 'T'], ['Ones', 'O']];
  var str = String(v.n);
  var html = '<div class="tv-pv">';
  cols.forEach(function (c, i) {
    // right-align the digits into the columns
    var digitIdx = str.length - (cols.length - i);
    var d = digitIdx >= 0 ? str[digitIdx] : '';
    var isZero = v.showZero && d === '0';
    html += '<div class="tv-pv-col">';
    html += '<div class="tv-pv-head">' + c[0] + '</div>';
    html += '<div class="tv-pv-cell' + (d ? ' filled' : '') + (isZero ? ' zero' : '') +
            (v.shifted && d && !isZero ? ' moved' : '') + '">' + (d || '') + '</div>';
    html += '</div>';
  });
  html += '</div>';
  if (v.shifted) html += '<div class="tv-caption">' + (v.showZero ? 'the 0 holds the empty ones column' : 'everything slid one column left') + '</div>';
  return html;
}

function _vBar(value, label) {
  var pct = Math.min(100, (value / 100) * 100);
  return '<div class="tv-barwrap"><div class="tv-bar" style="width:' + Math.max(12, pct) + '%">' + value + '</div></div>' +
         (label ? '<div class="tv-caption">' + label + '</div>' : '');
}
function _vBarHalf(value) {
  return '<div class="tv-barwrap"><div class="tv-bar half-a" style="width:' + Math.max(8, (value / 200) * 100) + '%">' + (value / 2) + '</div>' +
         '<div class="tv-bar half-b" style="width:' + Math.max(8, (value / 200) * 100) + '%">' + (value / 2) + '</div></div>' +
         '<div class="tv-caption">cut it in half</div>';
}
function _vBarMinus(value, minus) {
  var keepPct = ((value - minus) / value) * 100;
  return '<div class="tv-barwrap"><div class="tv-bar" style="width:' + keepPct + '%">' + (value - minus) + '</div>' +
         '<div class="tv-bar minus" style="width:' + (100 - keepPct) + '%">−' + minus + '</div></div>' +
         '<div class="tv-caption">take one lot away</div>';
}

function _vChain(values) {
  var html = '<div class="tv-chain">';
  values.forEach(function (v, i) {
    if (i > 0) html += '<span class="tv-chain-arrow">×2 →</span>';
    html += '<span class="tv-chain-node' + (i === values.length - 1 ? ' last' : '') + '">' + v + '</span>';
  });
  html += '</div>';
  return html;
}

function _vFingers(fold, showCount) {
  var html = '<div class="tv-hands">';
  for (var i = 1; i <= 10; i++) {
    var down = (fold && i === fold);
    var side = fold ? (i < fold ? 'left' : (i > fold ? 'right' : '')) : '';
    html += '<span class="tv-finger' + (down ? ' down' : '') + (showCount && side ? ' ' + side : '') + '">' +
            (down ? '👇' : '☝️') + '</span>';
    if (i === 5) html += '<span class="tv-hand-gap"></span>';
  }
  html += '</div>';
  if (showCount && fold) {
    html += '<div class="tv-finger-count"><span class="tv-fc left">' + (fold - 1) + ' tens</span>' +
            '<span class="tv-fc right">' + (10 - fold) + ' ones</span>' +
            '<span class="tv-fc ans">= ' + (9 * fold) + '</span></div>';
  }
  return html;
}

function _vArray(rows, cols, total) {
  var html = '<div class="tv-array" style="grid-template-columns:repeat(' + cols + ',1fr);max-width:' + Math.min(260, cols * 26) + 'px">';
  for (var i = 0; i < rows * cols; i++) html += '<span class="tv-adot"></span>';
  html += '</div>';
  html += '<div class="tv-caption">' + rows + ' rows of ' + cols + (total ? ' = ' + total : '') + '</div>';
  return html;
}

function _vNeighbour(n, stage) {
  var s = String(n), t = Number(s[0]), u = Number(s[1]), mid = t + u;
  var html = '<div class="tv-neigh">';
  if (stage === 'ends') {
    html += '<span class="tv-nd">' + t + '</span><span class="tv-nd gap">?</span><span class="tv-nd">' + u + '</span>';
  } else if (stage === 'sum') {
    html += '<span class="tv-nd">' + t + '</span><span class="tv-nd mid">' + t + '+' + u + '</span><span class="tv-nd">' + u + '</span>';
  } else if (stage === 'carry') {
    html += '<span class="tv-nd carry">' + (t + 1) + '</span><span class="tv-nd mid">' + (mid - 10) + '</span><span class="tv-nd">' + u + '</span>';
    html += '<div class="tv-caption">' + t + '+' + u + ' = ' + mid + ', so the 1 carries into the ' + t + '</div>';
  } else {
    html += '<span class="tv-nd done">' + (n * 11) + '</span>';
  }
  html += '</div>';
  return html;
}

function _vSquareFive(n, stage) {
  var t = Math.floor(n / 10);
  var html = '<div class="tv-sq5">';
  if (stage === 'tens') {
    html += '<span class="tv-sq-num">' + n + '</span><span class="tv-sq-note">tens digit is <b>' + t + '</b></span>';
  } else if (stage === 'product') {
    html += '<span class="tv-sq-calc">' + t + ' × ' + (t + 1) + ' = <b>' + (t * (t + 1)) + '</b></span>';
  } else {
    html += '<span class="tv-sq-final"><b>' + (t * (t + 1)) + '</b><span class="tv-sq-25">25</span></span>';
    html += '<div class="tv-caption">' + n + ' × ' + n + ' = ' + (n * n) + '</div>';
  }
  html += '</div>';
  return html;
}

function _vCast(n, root, match) {
  var digits = String(n).split('');
  var html = '<div class="tv-cast">';
  html += '<span class="tv-cast-n">' + n + '</span><span class="tv-cast-arrow">→</span>';
  html += '<span class="tv-cast-sum">' + digits.join(' + ') + '</span>';
  html += '<span class="tv-cast-arrow">→</span><span class="tv-cast-root' + (match ? ' match' : '') + '">' + root + '</span>';
  html += '</div>';
  return html;
}

/** Live Trachtenberg working, computed by the verified engine. */
function _vTrachtenbergTable(n, multiplier) {
  if (typeof trachtenberg !== 'function') return '';
  var r = trachtenberg(n, multiplier);
  if (!r) return '';
  var html = '<div class="tv-trach">';
  html += '<div class="tv-trach-head">' + n + ' × ' + multiplier + ', working right to left. Padded: <b>' + r.padded + '</b></div>';
  html += '<table class="tv-trach-table"><tr><th>digit</th><th>neighbour</th><th>rule</th><th>+carry</th><th>write</th></tr>';
  r.steps.forEach(function (s) {
    html += '<tr>';
    html += '<td class="tv-t-d">' + s.digit + '</td>';
    html += '<td>' + s.neighbour + '</td>';
    html += '<td class="tv-t-expr">' + s.expression + '</td>';
    html += '<td>' + (s.carryIn ? '+' + s.carryIn : '·') + '</td>';
    html += '<td class="tv-t-w">' + s.written + (s.carryOut ? ' <span class="tv-t-carry">carry ' + s.carryOut + '</span>' : '') + '</td>';
    html += '</tr>';
  });
  html += '</table>';
  html += '<div class="tv-trach-answer">Reading the written column back up: <b>' + r.answer + '</b>' +
          (r.correct ? ' ✓' : ' — MISMATCH') + '</div>';
  html += '</div>';
  return html;
}

// ---- Tricks hub ---------------------------------------------------------

function renderTricksHub() {
  var c = document.getElementById('tricks-content');
  if (!c) return;
  var filterSkill = window._tricksFilterSkill || null;

  var html = '<button class="back-btn" onclick="showScreen(\'' + (filterSkill ? 'practice' : 'home') + '\')">← Back</button>';
  html += '<div class="tricks-head">';
  html += '<div class="tricks-head-icon">🧠</div>';
  html += '<h2 class="tricks-title">Maths Tricks</h2>';
  html += '<p class="tricks-sub">' + (filterSkill
    ? 'Tricks that help with this topic.'
    : 'Clever ways to get the answer faster. Learn one, then use it forever.') + '</p>';
  html += '</div>';

  var pool = filterSkill ? tricksForSkill(filterSkill) : MATH_TRICKS;

  ['starter', 'builder', 'master'].forEach(function (tier) {
    var list = pool.filter(function (t) { return t.tier === tier; });
    if (list.length === 0) return;
    var meta = TRICK_TIERS[tier];
    html += '<div class="tricks-tier">';
    html += '<div class="tricks-tier-head" style="border-color:' + meta.colour + '44">';
    html += '<span class="tricks-tier-icon">' + meta.icon + '</span>';
    html += '<div><div class="tricks-tier-label">' + meta.label + '</div>';
    html += '<div class="tricks-tier-blurb">' + meta.blurb + '</div></div>';
    html += '</div>';
    html += '<div class="tricks-grid">';
    list.forEach(function (t) {
      var st = getTrickState(t.id);
      html += '<button class="trick-card' + (st.seen ? ' seen' : '') + '" onclick="openTrick(\'' + t.id + '\')">';
      html += '<div class="trick-card-icon">' + t.icon + '</div>';
      html += '<div class="trick-card-body">';
      html += '<div class="trick-card-name">' + t.name +
              (t.trachtenberg ? ' <span class="trick-tag">Trachtenberg</span>' : '') + '</div>';
      html += '<div class="trick-card-line">' + t.oneLiner + '</div>';
      html += '</div>';
      html += '<div class="trick-card-tick">' + (st.seen ? '✓' : '›') + '</div>';
      html += '</button>';
    });
    html += '</div></div>';
  });

  c.innerHTML = html;
}

// ---- Trick detail -------------------------------------------------------

function openTrick(id) {
  window._openTrickId = id;
  showScreen('trick-detail');
  renderTrickDetail();
  markTrickSeen(id);
}

function renderTrickDetail() {
  var c = document.getElementById('trick-detail-content');
  var t = getTrick(window._openTrickId);
  if (!c || !t) return;

  var html = '<button class="back-btn" onclick="showScreen(\'tricks\')">← All tricks</button>';
  html += '<div class="trick-hero">';
  html += '<div class="trick-hero-icon">' + t.icon + '</div>';
  html += '<h2 class="trick-hero-name">' + t.name + '</h2>';
  html += '<p class="trick-hero-line">' + t.oneLiner + '</p>';
  if (t.trachtenberg) html += '<div class="trick-hero-tag">🎩 From the Trachtenberg system</div>';
  html += '</div>';

  // Worked steps with models
  if (t.steps && t.steps.length) {
    html += '<div class="trick-section"><div class="trick-section-title">Watch it work</div>';
    t.steps.forEach(function (s, i) {
      html += '<div class="trick-step">';
      html += '<div class="trick-step-n">' + (i + 1) + '</div>';
      html += '<div class="trick-step-body">';
      html += '<div class="trick-step-text">' + s.text + '</div>';
      if (s.visual) html += '<div class="trick-step-visual">' + trickVisual(s.visual) + '</div>';
      html += '</div></div>';
    });
    html += '</div>';
  }

  // Live Trachtenberg working table
  if (t.trachtenberg && t.demo && t.demo.multiplier) {
    html += '<div class="trick-section"><div class="trick-section-title">The full working</div>';
    html += _vTrachtenbergTable(t.demo.n, t.demo.multiplier);
    html += '<div class="trick-try-own">';
    html += '<label>Try your own number: </label>';
    html += '<input id="trach-input" class="trick-input" type="number" min="1" max="99999" value="' + t.demo.n + '" ' +
            'oninput="trickRecomputeTrach(' + t.demo.multiplier + ')">';
    html += '<div id="trach-live"></div>';
    html += '</div></div>';
  }

  // Why it works
  html += '<div class="trick-section why"><div class="trick-section-title">Why it works</div>';
  html += '<p class="trick-why">' + t.why + '</p></div>';

  // Examples
  if (t.examples && t.examples.length) {
    html += '<div class="trick-section"><div class="trick-section-title">More examples</div>';
    html += '<div class="trick-examples">';
    t.examples.forEach(function (e) { html += '<div class="trick-example">' + e + '</div>'; });
    html += '</div></div>';
  }

  // Fun fact
  if (t.funFact) {
    html += '<div class="trick-fact"><span class="trick-fact-icon">💡</span><span>' + t.funFact + '</span></div>';
  }

  // Practise it
  if (t.tryIt && typeof DRILL_OPTIONS !== 'undefined' && DRILL_OPTIONS[t.tryIt.skillId]) {
    html += '<button class="trick-practise" onclick="practiseTrick(\'' + t.id + '\')">🎯 Practise this now</button>';
  }

  c.innerHTML = html;
}

function trickRecomputeTrach(multiplier) {
  var input = document.getElementById('trach-input');
  var out = document.getElementById('trach-live');
  if (!input || !out) return;
  var n = parseInt(input.value, 10);
  if (!n || n < 1 || n > 99999) { out.innerHTML = ''; return; }
  out.innerHTML = _vTrachtenbergTable(n, multiplier);
}

function practiseTrick(id) {
  var t = getTrick(id);
  if (!t || !t.tryIt) return;
  var st = getTrickState(id);
  st.practised = (st.practised || 0) + 1;
  saveState();
  if (t.tryIt.config && typeof setDrillConfig === 'function') {
    setDrillConfig(t.tryIt.skillId, t.tryIt.config);
  }
  if (typeof openDrillSetup === 'function') openDrillSetup(t.tryIt.skillId, 'math');
}

if (typeof window !== 'undefined') {
  window.renderTricksHub = renderTricksHub;
  window.renderTrickDetail = renderTrickDetail;
  window.openTrick = openTrick;
  window.practiseTrick = practiseTrick;
  window.trickVisual = trickVisual;
  window.trickRecomputeTrach = trickRecomputeTrach;
}
