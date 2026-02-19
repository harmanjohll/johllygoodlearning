// ============================================================
//  MATH RENDER — Interactive renderers for all math question types
// ============================================================

// Returns true if it handled the question type, false otherwise
function renderMathQuestion(card, q) {
  switch (q.type) {
    case 'ten-frame-count':     renderTenFrameCount(card, q); return true;
    case 'number-bond':         renderNumberBond(card, q); return true;
    case 'addition-concrete':   renderAdditionConcrete(card, q); return true;
    case 'addition-pictorial':  renderAdditionPictorial(card, q); return true;
    case 'addition-abstract':   renderAdditionAbstract(card, q); return true;
    case 'subtraction-concrete':renderSubtractionConcrete(card, q); return true;
    case 'subtraction-abstract':renderSubtractionAbstract(card, q); return true;
    case 'comparing':           renderComparing(card, q); return true;
    case 'pattern-number':      renderPatternNumber(card, q); return true;
    case 'pattern-shape':       renderPatternShape(card, q); return true;
    case 'word-problem':        renderWordProblem(card, q); return true;
    case 'shape-identify':      renderShapeIdentify(card, q); return true;
    case 'shape-properties':    renderShapeProperties(card, q); return true;
    case 'addition-100':        renderAddition100(card, q); return true;
    case 'subtraction-100':     renderSubtraction100(card, q); return true;
    case 'multiplication':      renderMultiplication(card, q); return true;
    case 'division':            renderDivision(card, q); return true;
    case 'fraction-identify':   renderFractionIdentify(card, q); return true;
    case 'fraction-shade':      renderFractionShade(card, q); return true;
    case 'money-add':           renderMoneyAdd(card, q); return true;
    case 'money-change':        renderMoneyChange(card, q); return true;
    case 'time-read':           renderTimeRead(card, q); return true;
    case 'time-set':            renderTimeRead(card, q); return true;
    case 'picture-graph':       renderPictureGraph(card, q); return true;
    case 'length-compare':      renderLengthCompare(card, q); return true;
    case 'length-difference':   renderLengthDiff(card, q); return true;
    case 'column-add':          renderColumnOp(card, q, '+'); return true;
    case 'column-sub':          renderColumnOp(card, q, '-'); return true;
    case 'multi-digit-mul':     renderColumnOp(card, q, 'x'); return true;
    case 'division-remainder':  renderDivisionRemainder(card, q); return true;
    case 'fraction-operation':  renderFractionOp(card, q); return true;
    case 'area-count':          renderAreaGrid(card, q, 'area'); return true;
    case 'perimeter-count':     renderAreaGrid(card, q, 'perimeter'); return true;
    case 'angle-identify':      renderAngle(card, q); return true;
    case 'bar-graph':           renderBarGraphQ(card, q); return true;
    case 'big-number-pv':       renderBigNumberPV(card, q); return true;
    case 'big-number-round':    renderBigNumberRound(card, q); return true;
    case 'long-multiplication': renderColumnOp(card, q, 'x'); return true;
    case 'long-division':       renderLongDivision(card, q); return true;
    case 'find-factors':        renderFactors(card, q); return true;
    case 'find-lcm':            renderLCM(card, q); return true;
    case 'mixed-to-improper':   renderMixedFrac(card, q); return true;
    case 'improper-to-mixed':   renderMixedFrac(card, q); return true;
    case 'decimal-identify':    renderDecimalId(card, q); return true;
    case 'decimal-add':         renderDecimalAdd(card, q); return true;
    case 'symmetry':            renderSymmetry(card, q); return true;
    case 'data-analysis':       renderDataAnalysis(card, q); return true;
    case 'multi-step-wp':       renderMultiStepWP(card, q); return true;
    default: return false;
  }
}

// ===================== P1 RENDERERS =====================

function renderTenFrameCount(card, q) {
  var n = q.number;
  var html = '<div class="question-text">How many dots are there?</div>';
  var frames = Math.ceil(n / 10);
  for (var f = 0; f < Math.min(frames, 2); f++) {
    html += '<div class="ten-frame">';
    for (var i = 0; i < 10; i++) {
      var idx = f * 10 + i;
      html += '<div class="ten-frame-cell ' + (idx < n ? 'filled' : '') + '"></div>';
    }
    html += '</div>';
  }
  var options = generateMCQOptions(n, 1, 20, 4);
  html += '<div class="answer-options">' + options.map(function(o) {
    return '<button class="answer-btn" onclick="checkAnswer(' + o + ', ' + n + ', this)">' + o + '</button>';
  }).join('') + '</div>';
  html += renderHintBtn(q.hint);
  card.innerHTML = html;
}

function renderNumberBond(card, q) {
  var html = '<div class="question-text">Find the missing number!</div>';
  html += '<div class="number-bond">';
  html += '<div class="nb-line left-line"></div><div class="nb-line right-line"></div>';
  html += '<div class="nb-circle top">' + q.whole + '</div>';
  html += '<div class="nb-circle left ' + (q.missingPart === 'left' ? 'target' : '') + '">' + (q.missingPart === 'left' ? '?' : q.partA) + '</div>';
  html += '<div class="nb-circle right ' + (q.missingPart === 'right' ? 'target' : '') + '">' + (q.missingPart === 'right' ? '?' : q.partB) + '</div>';
  html += '</div>';
  if (q.isConcrete) {
    html += '<div class="picture-objects mt-2">';
    var emoji = pick(OBJECT_EMOJIS);
    for (var i = 0; i < q.whole; i++) html += '<span class="picture-object" style="animation-delay:' + (i*0.05) + 's">' + emoji + '</span>';
    html += '</div>';
  }
  var options = generateMCQOptions(q.answer, 0, q.whole, 4);
  html += '<div class="answer-options mt-2">' + options.map(function(o) {
    return '<button class="answer-btn" onclick="checkAnswer(' + o + ', ' + q.answer + ', this)">' + o + '</button>';
  }).join('') + '</div>';
  html += renderHintBtn(q.hint);
  card.innerHTML = html;
}

function renderAdditionConcrete(card, q) {
  var html = '<div class="question-text">' + q.a + ' + ' + q.b + ' = ?</div>';
  html += '<div style="display:flex;gap:20px;align-items:center;justify-content:center;flex-wrap:wrap">';
  html += '<div class="picture-objects">';
  for (var i = 0; i < q.a; i++) html += '<span class="picture-object" style="animation-delay:' + (i*0.06) + 's">' + q.emoji + '</span>';
  html += '</div><span style="font-size:32px;color:var(--gold)">+</span><div class="picture-objects">';
  for (var j = 0; j < q.b; j++) html += '<span class="picture-object" style="animation-delay:' + ((q.a+j)*0.06) + 's">' + q.emoji + '</span>';
  html += '</div></div>';
  var options = generateMCQOptions(q.answer, 1, q.answer + 5, 4);
  html += '<div class="answer-options mt-2">' + options.map(function(o) {
    return '<button class="answer-btn" onclick="checkAnswer(' + o + ', ' + q.answer + ', this)">' + o + '</button>';
  }).join('') + '</div>';
  html += renderHintBtn(q.hint);
  card.innerHTML = html;
}

function renderAdditionPictorial(card, q) {
  var html = '<div class="question-text">' + q.a + ' + ' + q.b + ' = ?</div>';
  html += '<div class="bar-model"><div class="bar-row">';
  html += '<div class="bar-segment part-a" style="flex:' + q.a + '">' + q.a + '</div>';
  html += '<div class="bar-segment part-b" style="flex:' + q.b + '">' + q.b + '</div>';
  html += '</div><div class="bar-row">';
  html += '<div class="bar-segment unknown" style="flex:1">?</div>';
  html += '</div></div>';
  var options = generateMCQOptions(q.answer, 1, q.answer + 6, 4);
  html += '<div class="answer-options mt-2">' + options.map(function(o) {
    return '<button class="answer-btn" onclick="checkAnswer(' + o + ', ' + q.answer + ', this)">' + o + '</button>';
  }).join('') + '</div>';
  html += renderHintBtn(q.hint);
  card.innerHTML = html;
}

function renderAdditionAbstract(card, q) {
  var html = '<div class="question-text large">' + q.a + ' + ' + q.b + ' = ?</div>';
  html += '<div class="text-input-area">';
  html += '<input class="text-input" type="number" id="answer-input" placeholder="?" maxlength="4" onkeydown="if(event.key===\'Enter\')submitTextAnswer(' + q.answer + ')">';
  html += '<button class="submit-btn" onclick="submitTextAnswer(' + q.answer + ')">Check \u2713</button>';
  html += '</div>';
  html += renderHintBtn(q.hint);
  card.innerHTML = html;
  setTimeout(function() { var el = document.getElementById('answer-input'); if (el) el.focus(); }, 100);
}

function renderSubtractionConcrete(card, q) {
  var html = '<div class="question-text">' + q.a + ' \u2212 ' + q.b + ' = ?</div>';
  html += '<div class="picture-objects">';
  for (var i = 0; i < q.a; i++) {
    var crossed = i >= q.answer;
    html += '<span class="picture-object" style="animation-delay:' + (i*0.06) + 's;' + (crossed ? 'opacity:0.3;text-decoration:line-through' : '') + '">' + q.emoji + '</span>';
  }
  html += '</div>';
  html += '<div style="font-family:var(--font-hand);font-size:18px;color:var(--text-secondary);margin-top:8px">Take away ' + q.b + '. How many are left?</div>';
  var options = generateMCQOptions(q.answer, 0, q.a, 4);
  html += '<div class="answer-options mt-2">' + options.map(function(o) {
    return '<button class="answer-btn" onclick="checkAnswer(' + o + ', ' + q.answer + ', this)">' + o + '</button>';
  }).join('') + '</div>';
  html += renderHintBtn(q.hint);
  card.innerHTML = html;
}

function renderSubtractionAbstract(card, q) {
  var html = '<div class="question-text large">' + q.a + ' \u2212 ' + q.b + ' = ?</div>';
  html += '<div class="text-input-area">';
  html += '<input class="text-input" type="number" id="answer-input" placeholder="?" maxlength="4" onkeydown="if(event.key===\'Enter\')submitTextAnswer(' + q.answer + ')">';
  html += '<button class="submit-btn" onclick="submitTextAnswer(' + q.answer + ')">Check \u2713</button>';
  html += '</div>';
  html += renderHintBtn(q.hint);
  card.innerHTML = html;
  setTimeout(function() { var el = document.getElementById('answer-input'); if (el) el.focus(); }, 100);
}

function renderComparing(card, q) {
  var html = '<div class="question-text">Which is correct?</div>';
  if (q.isConcrete && q.a <= 20 && q.b <= 20) {
    html += '<div style="display:flex;gap:40px;align-items:flex-end;justify-content:center;margin:16px 0">';
    var eA = pick(OBJECT_EMOJIS), eB = pick(OBJECT_EMOJIS);
    html += '<div style="text-align:center"><div class="picture-objects" style="flex-direction:column">';
    for (var i = 0; i < q.a; i++) html += '<span class="picture-object">' + eA + '</span>';
    html += '</div><div style="font-size:24px;font-weight:700;margin-top:8px">' + q.a + '</div></div>';
    html += '<div style="text-align:center"><div class="picture-objects" style="flex-direction:column">';
    for (var j = 0; j < q.b; j++) html += '<span class="picture-object">' + eB + '</span>';
    html += '</div><div style="font-size:24px;font-weight:700;margin-top:8px">' + q.b + '</div></div></div>';
  } else {
    html += '<div class="question-text large">' + q.a + '  \u2610  ' + q.b + '</div>';
  }
  html += '<div class="answer-options">';
  html += '<button class="answer-btn" onclick="checkAnswer(\'>\', \'' + q.answer + '\', this)" style="font-size:32px">' + q.a + ' > ' + q.b + '</button>';
  html += '<button class="answer-btn" onclick="checkAnswer(\'<\', \'' + q.answer + '\', this)" style="font-size:32px">' + q.a + ' < ' + q.b + '</button>';
  html += '</div>';
  html += renderHintBtn(q.hint);
  card.innerHTML = html;
}

function renderPatternNumber(card, q) {
  var html = '<div class="question-text">What comes next?</div><div class="pattern-row">';
  q.pattern.forEach(function(n) { html += '<div class="pattern-item">' + n + '</div>'; });
  html += '<div class="pattern-item mystery">?</div></div>';
  var options = generateMCQOptions(q.answer, Math.max(1, q.answer - 5), q.answer + 5, 4);
  html += '<div class="answer-options mt-2">' + options.map(function(o) {
    return '<button class="answer-btn" onclick="checkAnswer(' + o + ', ' + q.answer + ', this)">' + o + '</button>';
  }).join('') + '</div>';
  html += renderHintBtn(q.hint);
  card.innerHTML = html;
}

function renderPatternShape(card, q) {
  var html = '<div class="question-text">What comes next in the pattern?</div><div class="pattern-row">';
  q.pattern.forEach(function(e) { html += '<div class="pattern-item">' + e + '</div>'; });
  html += '<div class="pattern-item mystery">?</div></div>';
  html += '<div class="answer-options mt-2">' + q.options.map(function(o) {
    return '<button class="answer-btn" onclick="checkAnswer(\'' + o + '\', \'' + q.answer + '\', this)" style="font-size:28px">' + o + '</button>';
  }).join('') + '</div>';
  html += renderHintBtn(q.hint);
  card.innerHTML = html;
}

function renderWordProblem(card, q) {
  var html = '<div class="story-prompt" style="font-size:19px">' + q.text + '</div>';
  if (q.isConcrete) {
    html += '<div class="bar-model"><div class="bar-row">';
    if (q.op === '+') {
      html += '<div class="bar-segment part-a" style="flex:' + q.a + '">' + q.a + '</div>';
      html += '<div class="bar-segment part-b" style="flex:' + q.b + '">' + q.b + '</div>';
    } else {
      html += '<div class="bar-segment whole" style="flex:' + q.a + '">' + q.a + '</div>';
    }
    html += '</div>';
    if (q.op === '-') {
      html += '<div class="bar-row"><div class="bar-segment part-a" style="flex:' + q.b + '">' + q.b + '</div>';
      html += '<div class="bar-segment unknown" style="flex:' + q.answer + '">?</div></div>';
    } else {
      html += '<div class="bar-row"><div class="bar-segment unknown" style="flex:1">?</div></div>';
    }
    html += '</div>';
  }
  var options = generateMCQOptions(q.answer, Math.max(0, q.answer - 3), q.answer + 5, 4);
  html += '<div class="answer-options mt-2">' + options.map(function(o) {
    return '<button class="answer-btn" onclick="checkAnswer(' + o + ', ' + q.answer + ', this)">' + o + '</button>';
  }).join('') + '</div>';
  html += renderHintBtn(q.hint);
  card.innerHTML = html;
}

function renderShapeIdentify(card, q) {
  var html = '<div class="question-text">Which shape is a <strong>' + q.shape.name + '</strong>?</div>';
  html += '<div style="font-size:16px;color:var(--text-secondary);margin-bottom:12px">' + q.shape.desc + '</div>';
  html += '<div class="answer-options">' + q.options.map(function(o) {
    return '<button class="answer-btn" onclick="checkAnswer(\'' + o.name + '\', \'' + q.shape.name + '\', this)" style="font-size:36px" title="' + o.name + '">' + o.emoji + '</button>';
  }).join('') + '</div>';
  html += renderHintBtn(q.hint);
  card.innerHTML = html;
}

function renderShapeProperties(card, q) {
  var html = '<div style="font-size:72px;margin-bottom:8px">' + q.shape.emoji + '</div>';
  html += '<div class="question-text">How many sides does a ' + q.shape.name + ' have?</div>';
  var opts = q.shape.sides === 0 ? shuffle([0, 1, 2, 3]) : generateMCQOptions(q.shape.sides, Math.max(0, q.shape.sides - 2), q.shape.sides + 3, 4);
  html += '<div class="answer-options mt-2">' + opts.map(function(o) {
    return '<button class="answer-btn" onclick="checkAnswer(' + o + ', ' + q.answer + ', this)">' + (o === 0 ? 'None (round!)' : o) + '</button>';
  }).join('') + '</div>';
  html += renderHintBtn(q.hint);
  card.innerHTML = html;
}

// ===================== P2 RENDERERS =====================

function renderAddition100(card, q) {
  var html = '<div class="question-text large">' + q.a + ' + ' + q.b + ' = ?</div>';
  if (q.isConcrete) {
    html += '<div style="display:flex;gap:16px;justify-content:center;flex-wrap:wrap;margin:12px 0">';
    html += renderPlaceValueBlocks(q.a) + '<span style="font-size:28px;color:var(--gold)">+</span>' + renderPlaceValueBlocks(q.b);
    html += '</div>';
  }
  html += '<div class="text-input-area"><input class="text-input" type="number" id="answer-input" placeholder="?" onkeydown="if(event.key===\'Enter\')submitTextAnswer(' + q.answer + ')">';
  html += '<button class="submit-btn" onclick="submitTextAnswer(' + q.answer + ')">Check \u2713</button></div>';
  html += renderHintBtn(q.hint);
  card.innerHTML = html;
  setTimeout(function() { var el = document.getElementById('answer-input'); if (el) el.focus(); }, 100);
}

function renderSubtraction100(card, q) {
  var html = '<div class="question-text large">' + q.a + ' \u2212 ' + q.b + ' = ?</div>';
  html += '<div class="text-input-area"><input class="text-input" type="number" id="answer-input" placeholder="?" onkeydown="if(event.key===\'Enter\')submitTextAnswer(' + q.answer + ')">';
  html += '<button class="submit-btn" onclick="submitTextAnswer(' + q.answer + ')">Check \u2713</button></div>';
  html += renderHintBtn(q.hint);
  card.innerHTML = html;
  setTimeout(function() { var el = document.getElementById('answer-input'); if (el) el.focus(); }, 100);
}

function renderPlaceValueBlocks(n) {
  var tens = Math.floor(n / 10);
  var ones = n % 10;
  var html = '<div style="display:flex;gap:4px;align-items:flex-end">';
  for (var i = 0; i < tens; i++) html += '<div style="width:12px;height:40px;background:var(--sky);border-radius:3px" title="10"></div>';
  for (var j = 0; j < ones; j++) html += '<div style="width:12px;height:12px;background:var(--mint);border-radius:3px" title="1"></div>';
  html += '</div>';
  return html;
}

function renderMultiplication(card, q) {
  var html = '<div class="question-text">' + q.table + ' \u00D7 ' + q.n + ' = ?</div>';
  if (q.isConcrete) {
    html += '<div style="display:flex;gap:16px;justify-content:center;flex-wrap:wrap;margin:12px 0">';
    var emoji = pick(OBJECT_EMOJIS);
    for (var g = 0; g < q.n; g++) {
      html += '<div style="display:flex;gap:4px;padding:8px;background:rgba(255,255,255,0.05);border-radius:8px">';
      for (var i = 0; i < q.table; i++) html += '<span style="font-size:20px">' + emoji + '</span>';
      html += '</div>';
    }
    html += '</div>';
  } else if (q.isPictorial) {
    html += '<div class="area-grid" style="grid-template-columns:repeat(' + q.table + ', 36px);margin:12px auto;width:fit-content">';
    for (var r = 0; r < q.n; r++) for (var c = 0; c < q.table; c++) {
      html += '<div class="area-cell selected"></div>';
    }
    html += '</div>';
    html += '<div style="font-size:14px;color:var(--text-secondary)">' + q.n + ' rows of ' + q.table + '</div>';
  }
  var options = generateMCQOptions(q.answer, Math.max(1, q.answer - 10), q.answer + 10, 4);
  html += '<div class="answer-options mt-2">' + options.map(function(o) {
    return '<button class="answer-btn" onclick="checkAnswer(' + o + ', ' + q.answer + ', this)">' + o + '</button>';
  }).join('') + '</div>';
  html += renderHintBtn(q.hint);
  card.innerHTML = html;
}

function renderDivision(card, q) {
  var html = '<div class="question-text">' + q.dividend + ' \u00F7 ' + q.divisor + ' = ?</div>';
  if (q.isConcrete) {
    html += '<div style="display:flex;gap:16px;justify-content:center;flex-wrap:wrap;margin:12px 0">';
    var emoji = pick(OBJECT_EMOJIS);
    for (var g = 0; g < q.answer; g++) {
      html += '<div style="padding:8px;background:rgba(255,255,255,0.05);border-radius:8px;text-align:center">';
      for (var i = 0; i < q.divisor; i++) html += '<span style="font-size:20px">' + emoji + '</span>';
      html += '<div style="font-size:12px;color:var(--text-dim);margin-top:4px">Group ' + (g+1) + '</div></div>';
    }
    html += '</div>';
  }
  var options = generateMCQOptions(q.answer, 1, q.answer + 5, 4);
  html += '<div class="answer-options mt-2">' + options.map(function(o) {
    return '<button class="answer-btn" onclick="checkAnswer(' + o + ', ' + q.answer + ', this)">' + o + '</button>';
  }).join('') + '</div>';
  html += renderHintBtn(q.hint);
  card.innerHTML = html;
}

function renderFractionIdentify(card, q) {
  var html = '<div class="question-text">What fraction is shaded?</div>';
  html += '<div class="fraction-bar-container"><div class="fraction-bar">';
  for (var i = 0; i < q.denominator; i++) {
    html += '<div class="fraction-part ' + (i < q.numerator ? 'shaded' : 'unshaded') + '" style="flex:1">' + (i < q.numerator ? '' : '') + '</div>';
  }
  html += '</div></div>';
  var options = [];
  for (var n = 1; n < q.denominator; n++) options.push(n + '/' + q.denominator);
  options = shuffle(options).slice(0, 3);
  if (!options.includes(q.answer)) options.push(q.answer);
  options = shuffle(options);
  html += '<div class="answer-options mt-2">' + options.map(function(o) {
    return '<button class="answer-btn" onclick="checkAnswer(\'' + o + '\', \'' + q.answer + '\', this)" style="font-size:20px">' + o + '</button>';
  }).join('') + '</div>';
  html += renderHintBtn(q.hint);
  card.innerHTML = html;
}

function renderFractionShade(card, q) {
  var html = '<div class="question-text">Shade ' + q.numerator + '/' + q.denominator + '</div>';
  html += '<div class="fraction-bar-container"><div class="fraction-bar" id="frac-bar">';
  for (var i = 0; i < q.denominator; i++) {
    html += '<div class="fraction-part unshaded" style="flex:1" onclick="toggleFracPart(this)" data-idx="' + i + '"></div>';
  }
  html += '</div></div>';
  html += '<button class="submit-btn mt-2" onclick="checkFractionShade(' + q.answer + ')">Check \u2713</button>';
  html += renderHintBtn(q.hint);
  card.innerHTML = html;
}

function renderMoneyAdd(card, q) {
  var html = '<div class="question-text">' + q.item1.name + ' (' + q.item1.price + '\u00A2) + ' + q.item2.name + ' (' + q.item2.price + '\u00A2) = ?</div>';
  html += '<div style="display:flex;gap:20px;justify-content:center;font-size:40px;margin:12px 0">\uD83D\uDCB0</div>';
  var options = generateMCQOptions(q.answer, q.answer - 30, q.answer + 30, 4);
  html += '<div class="answer-options mt-2">' + options.map(function(o) {
    return '<button class="answer-btn" onclick="checkAnswer(' + o + ', ' + q.answer + ', this)">' + o + '\u00A2</button>';
  }).join('') + '</div>';
  html += renderHintBtn(q.hint);
  card.innerHTML = html;
}

function renderMoneyChange(card, q) {
  var html = '<div class="question-text">Buy ' + q.item.name + ' for ' + q.item.price + '\u00A2. Pay ' + q.paid + '\u00A2. Change?</div>';
  var options = generateMCQOptions(q.answer, 0, q.answer + 20, 4);
  html += '<div class="answer-options mt-2">' + options.map(function(o) {
    return '<button class="answer-btn" onclick="checkAnswer(' + o + ', ' + q.answer + ', this)">' + o + '\u00A2</button>';
  }).join('') + '</div>';
  html += renderHintBtn(q.hint);
  card.innerHTML = html;
}

function renderTimeRead(card, q) {
  var html = '<div class="question-text">What time does the clock show?</div>';
  html += renderClockSVG(q.hour, q.minutes, 180);
  var options = [];
  options.push(q.answer);
  while (options.length < 4) {
    var h = rand(1, 12);
    var m = pick([0, 15, 30, 45]);
    var opt = h + ':' + (m < 10 ? '0' : '') + m;
    if (!options.includes(opt)) options.push(opt);
  }
  options = shuffle(options);
  html += '<div class="answer-options mt-2">' + options.map(function(o) {
    return '<button class="answer-btn" onclick="checkAnswer(\'' + o + '\', \'' + q.answer + '\', this)" style="font-size:20px">' + o + '</button>';
  }).join('') + '</div>';
  html += renderHintBtn(q.hint);
  card.innerHTML = html;
}

function renderClockSVG(hour, minutes, size) {
  var cx = size / 2, cy = size / 2, r = size / 2 - 10;
  var svg = '<svg width="' + size + '" height="' + size + '" style="margin:12px auto;display:block">';
  svg += '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.3)" stroke-width="3"/>';
  for (var i = 1; i <= 12; i++) {
    var angle = (i * 30 - 90) * Math.PI / 180;
    var tx = cx + (r - 20) * Math.cos(angle);
    var ty = cy + (r - 20) * Math.sin(angle);
    svg += '<text x="' + tx + '" y="' + ty + '" fill="var(--text-primary)" font-size="14" font-family="var(--font-display)" text-anchor="middle" dominant-baseline="central">' + i + '</text>';
  }
  // Hour hand
  var hAngle = ((hour % 12) * 30 + minutes * 0.5 - 90) * Math.PI / 180;
  var hx = cx + (r * 0.5) * Math.cos(hAngle);
  var hy = cy + (r * 0.5) * Math.sin(hAngle);
  svg += '<line x1="' + cx + '" y1="' + cy + '" x2="' + hx + '" y2="' + hy + '" stroke="var(--coral)" stroke-width="4" stroke-linecap="round"/>';
  // Minute hand
  var mAngle = (minutes * 6 - 90) * Math.PI / 180;
  var mx = cx + (r * 0.7) * Math.cos(mAngle);
  var my = cy + (r * 0.7) * Math.sin(mAngle);
  svg += '<line x1="' + cx + '" y1="' + cy + '" x2="' + mx + '" y2="' + my + '" stroke="var(--sky)" stroke-width="3" stroke-linecap="round"/>';
  svg += '<circle cx="' + cx + '" cy="' + cy + '" r="5" fill="var(--gold)"/>';
  svg += '</svg>';
  return svg;
}

function renderPictureGraph(card, q) {
  var html = '<div class="question-text">Look at the graph</div>';
  html += '<div style="display:flex;gap:12px;align-items:flex-end;justify-content:center;margin:16px 0;height:150px">';
  var maxVal = Math.max(...q.values);
  q.categories.forEach(function(cat, i) {
    var h = (q.values[i] / maxVal) * 120;
    html += '<div style="text-align:center"><div style="width:40px;height:' + h + 'px;background:linear-gradient(to top,var(--sky),var(--lavender));border-radius:4px 4px 0 0"></div>';
    html += '<div style="font-size:12px;color:var(--text-secondary);margin-top:4px">' + cat + '</div>';
    html += '<div style="font-size:14px;font-weight:600">' + q.values[i] + '</div></div>';
  });
  html += '</div>';
  var qText;
  if (q.qType === 'most') qText = 'Which has the most?';
  else if (q.qType === 'least') qText = 'Which has the least?';
  else if (q.qType === 'total') qText = 'What is the total?';
  else qText = 'How many ' + q.categories[parseInt(q.qType.split('_')[1])] + '?';
  html += '<div class="question-text" style="font-size:20px">' + qText + '</div>';
  if (typeof q.answer === 'string') {
    html += '<div class="answer-options mt-2">' + shuffle(q.categories).map(function(c) {
      return '<button class="answer-btn" onclick="checkAnswer(\'' + c + '\', \'' + q.answer + '\', this)" style="font-size:16px">' + c + '</button>';
    }).join('') + '</div>';
  } else {
    var options = generateMCQOptions(q.answer, Math.max(0, q.answer - 5), q.answer + 5, 4);
    html += '<div class="answer-options mt-2">' + options.map(function(o) {
      return '<button class="answer-btn" onclick="checkAnswer(' + o + ', ' + q.answer + ', this)">' + o + '</button>';
    }).join('') + '</div>';
  }
  html += renderHintBtn(q.hint);
  card.innerHTML = html;
}

function renderLengthCompare(card, q) {
  var html = '<div class="question-text">Which is longer?</div>';
  html += '<div style="display:flex;flex-direction:column;gap:12px;align-items:center;margin:16px 0">';
  html += '<div style="width:' + (q.itemA.length * 5) + 'px;height:16px;background:var(--sky);border-radius:4px"></div>';
  html += '<div style="font-size:14px">' + q.itemA.name + ' (' + q.itemA.length + ' cm)</div>';
  html += '<div style="width:' + (q.itemB.length * 5) + 'px;height:16px;background:var(--mint);border-radius:4px"></div>';
  html += '<div style="font-size:14px">' + q.itemB.name + ' (' + q.itemB.length + ' cm)</div>';
  html += '</div>';
  html += '<div class="answer-options">';
  html += '<button class="answer-btn" onclick="checkAnswer(\'' + q.itemA.name + '\', \'' + q.answer + '\', this)">' + q.itemA.name + '</button>';
  html += '<button class="answer-btn" onclick="checkAnswer(\'' + q.itemB.name + '\', \'' + q.answer + '\', this)">' + q.itemB.name + '</button>';
  html += '</div>';
  html += renderHintBtn(q.hint);
  card.innerHTML = html;
}

function renderLengthDiff(card, q) {
  var html = '<div class="question-text">' + q.itemA.name + ' is ' + q.itemA.length + ' cm. ' + q.itemB.name + ' is ' + q.itemB.length + ' cm. What is the difference?</div>';
  var options = generateMCQOptions(q.answer, 0, q.answer + 10, 4);
  html += '<div class="answer-options mt-2">' + options.map(function(o) {
    return '<button class="answer-btn" onclick="checkAnswer(' + o + ', ' + q.answer + ', this)">' + o + ' cm</button>';
  }).join('') + '</div>';
  html += renderHintBtn(q.hint);
  card.innerHTML = html;
}

// ===================== P3-P4 RENDERERS =====================

function renderColumnOp(card, q, op) {
  var symbol = op === 'x' ? '\u00D7' : op === '-' ? '\u2212' : '+';
  var html = '<div class="question-text">' + q.a + ' ' + symbol + ' ' + q.b + ' = ?</div>';
  html += '<div class="text-input-area"><input class="text-input" type="number" id="answer-input" placeholder="?" onkeydown="if(event.key===\'Enter\')submitTextAnswer(' + q.answer + ')">';
  html += '<button class="submit-btn" onclick="submitTextAnswer(' + q.answer + ')">Check \u2713</button></div>';
  html += renderHintBtn(q.hint);
  card.innerHTML = html;
  setTimeout(function() { var el = document.getElementById('answer-input'); if (el) el.focus(); }, 100);
}

function renderDivisionRemainder(card, q) {
  var html = '<div class="question-text">' + q.dividend + ' \u00F7 ' + q.divisor + ' = ?</div>';
  html += '<div style="font-size:16px;color:var(--text-secondary);margin-bottom:12px">Include the remainder if there is one</div>';
  var options = [];
  options.push(q.answer);
  options.push(q.quotient + ' R ' + (q.remainder + 1 > q.divisor - 1 ? 0 : q.remainder + 1));
  options.push((q.quotient + 1) + ' R 0');
  options.push((q.quotient - 1) + ' R ' + (q.remainder + q.divisor));
  options = shuffle(options.filter(function(v, i, a) { return a.indexOf(v) === i; })).slice(0, 4);
  html += '<div class="answer-options mt-2">' + options.map(function(o) {
    return '<button class="answer-btn" onclick="checkAnswer(\'' + o + '\', \'' + q.answer + '\', this)" style="font-size:18px">' + o + '</button>';
  }).join('') + '</div>';
  html += renderHintBtn(q.hint);
  card.innerHTML = html;
}

function renderFractionOp(card, q) {
  var html = '<div class="question-text">' + q.a + '/' + q.denom + ' ' + q.op + ' ' + q.b + '/' + q.denom + ' = ?</div>';
  html += '<div class="fraction-bar-container" style="margin:12px 0"><div class="fraction-bar">';
  for (var i = 0; i < q.denom; i++) {
    var shaded = q.op === '+' ? (i < q.a ? 'part-a' : i < q.a + q.b ? 'part-b' : '') : (i < q.answerNum ? 'part-a' : i < q.a ? 'part-b' : '');
    html += '<div class="fraction-part ' + (shaded ? 'shaded' : 'unshaded') + '" style="flex:1;' + (shaded === 'part-b' ? 'background:linear-gradient(135deg,var(--mint),var(--teal))' : '') + '"></div>';
  }
  html += '</div></div>';
  var options = [];
  for (var n = Math.max(0, q.answerNum - 2); n <= Math.min(q.denom, q.answerNum + 2); n++) {
    if (n >= 0) options.push(n + '/' + q.denom);
  }
  if (!options.includes(q.answer)) options.push(q.answer);
  options = shuffle(options).slice(0, 4);
  html += '<div class="answer-options mt-2">' + options.map(function(o) {
    return '<button class="answer-btn" onclick="checkAnswer(\'' + o + '\', \'' + q.answer + '\', this)" style="font-size:20px">' + o + '</button>';
  }).join('') + '</div>';
  html += renderHintBtn(q.hint);
  card.innerHTML = html;
}

function renderAreaGrid(card, q, mode) {
  var html = '<div class="question-text">' + (mode === 'area' ? 'What is the area?' : 'What is the perimeter?') + '</div>';
  html += '<div class="area-grid" style="grid-template-columns:repeat(' + q.width + ', 36px);margin:12px auto;width:fit-content">';
  for (var r = 0; r < q.height; r++) for (var c = 0; c < q.width; c++) {
    var isEdge = r === 0 || r === q.height - 1 || c === 0 || c === q.width - 1;
    html += '<div class="area-cell ' + (mode === 'area' ? 'selected' : (isEdge ? 'perimeter' : 'selected')) + '"></div>';
  }
  html += '</div>';
  html += '<div style="font-size:14px;color:var(--text-secondary)">' + q.width + ' \u00D7 ' + q.height + '</div>';
  var options = generateMCQOptions(q.answer, Math.max(1, q.answer - 5), q.answer + 5, 4);
  html += '<div class="answer-options mt-2">' + options.map(function(o) {
    return '<button class="answer-btn" onclick="checkAnswer(' + o + ', ' + q.answer + ', this)">' + o + (mode === 'area' ? ' sq units' : ' units') + '</button>';
  }).join('') + '</div>';
  html += renderHintBtn(q.hint);
  card.innerHTML = html;
}

function renderAngle(card, q) {
  var deg = q.angle.degrees;
  var html = '<div class="question-text">What type of angle is this?</div>';
  var size = 150;
  var svg = '<svg width="' + size + '" height="' + size + '" style="margin:12px auto;display:block">';
  var cx = 20, cy = size - 20;
  svg += '<line x1="' + cx + '" y1="' + cy + '" x2="' + (size - 20) + '" y2="' + cy + '" stroke="var(--sky)" stroke-width="3"/>';
  var rad = (-deg) * Math.PI / 180;
  var lx = cx + (size - 40) * Math.cos(rad);
  var ly = cy + (size - 40) * Math.sin(rad);
  svg += '<line x1="' + cx + '" y1="' + cy + '" x2="' + lx + '" y2="' + ly + '" stroke="var(--coral)" stroke-width="3"/>';
  svg += '<text x="' + (cx + 35) + '" y="' + (cy - 10) + '" fill="var(--text-secondary)" font-size="14">' + deg + '\u00B0</text>';
  svg += '</svg>';
  html += svg;
  html += '<div class="answer-options mt-2">' + q.options.map(function(o) {
    return '<button class="answer-btn" onclick="checkAnswer(\'' + o + '\', \'' + q.answer + '\', this)" style="font-size:18px">' + o + '</button>';
  }).join('') + '</div>';
  html += renderHintBtn(q.hint);
  card.innerHTML = html;
}

function renderBarGraphQ(card, q) {
  return renderPictureGraph(card, q);
}

function renderBigNumberPV(card, q) {
  var html = '<div class="question-text">What digit is in the ' + q.place + ' place?</div>';
  html += '<div class="question-text large" style="color:var(--gold)">' + formatNumber(q.number) + '</div>';
  var options = generateMCQOptions(q.answer, 0, 9, 4);
  html += '<div class="answer-options mt-2">' + options.map(function(o) {
    return '<button class="answer-btn" onclick="checkAnswer(' + o + ', ' + q.answer + ', this)">' + o + '</button>';
  }).join('') + '</div>';
  html += renderHintBtn(q.hint);
  card.innerHTML = html;
}

function renderBigNumberRound(card, q) {
  var html = '<div class="question-text">Round ' + formatNumber(q.number) + ' to the nearest ' + q.roundTo + '</div>';
  var options = generateMCQOptions(q.answer, q.answer - q.roundTo * 2, q.answer + q.roundTo * 2, 4);
  html += '<div class="answer-options mt-2">' + options.map(function(o) {
    return '<button class="answer-btn" onclick="checkAnswer(' + o + ', ' + q.answer + ', this)">' + formatNumber(o) + '</button>';
  }).join('') + '</div>';
  html += renderHintBtn(q.hint);
  card.innerHTML = html;
}

function renderLongDivision(card, q) {
  var html = '<div class="question-text">' + q.dividend + ' \u00F7 ' + q.divisor + ' = ?</div>';
  html += '<div class="text-input-area"><input class="text-input" type="number" id="answer-input" placeholder="?" onkeydown="if(event.key===\'Enter\')submitTextAnswer(' + q.answer + ')">';
  html += '<button class="submit-btn" onclick="submitTextAnswer(' + q.answer + ')">Check \u2713</button></div>';
  html += renderHintBtn(q.hint);
  card.innerHTML = html;
  setTimeout(function() { var el = document.getElementById('answer-input'); if (el) el.focus(); }, 100);
}

function renderFactors(card, q) {
  var html = '<div class="question-text">Find all factors of ' + q.number + '</div>';
  html += '<div style="display:flex;flex-wrap:wrap;gap:8px;justify-content:center;margin:12px 0" id="factor-picks">';
  var candidates = [];
  for (var i = 1; i <= q.number; i++) candidates.push(i);
  candidates = candidates.filter(function(n) { return n <= 20 || q.factors.includes(n); });
  if (candidates.length > 16) candidates = shuffle(candidates).slice(0, 12).concat(q.factors);
  candidates = [...new Set(candidates)].sort(function(a,b) { return a - b; });
  candidates.forEach(function(n) {
    html += '<button class="answer-btn" style="font-size:16px;padding:8px 14px;min-width:50px" onclick="toggleFactorBtn(this)" data-val="' + n + '">' + n + '</button>';
  });
  html += '</div>';
  html += '<button class="submit-btn mt-2" onclick="checkFactors([' + q.factors.join(',') + '])">Check \u2713</button>';
  html += renderHintBtn(q.hint);
  card.innerHTML = html;
}

function renderLCM(card, q) {
  var html = '<div class="question-text">What is the LCM of ' + q.a + ' and ' + q.b + '?</div>';
  html += '<div style="font-size:14px;color:var(--text-secondary);margin-bottom:8px">Lowest Common Multiple</div>';
  var options = generateMCQOptions(q.answer, q.answer - 10, q.answer + 15, 4);
  html += '<div class="answer-options mt-2">' + options.map(function(o) {
    return '<button class="answer-btn" onclick="checkAnswer(' + o + ', ' + q.answer + ', this)">' + o + '</button>';
  }).join('') + '</div>';
  html += renderHintBtn(q.hint);
  card.innerHTML = html;
}

function renderMixedFrac(card, q) {
  var html;
  if (q.type === 'mixed-to-improper') {
    html = '<div class="question-text">Convert ' + q.whole + ' ' + q.numer + '/' + q.denom + ' to an improper fraction</div>';
  } else {
    html = '<div class="question-text">Convert ' + q.improper + '/' + q.denom + ' to a mixed number</div>';
  }
  html += '<div class="text-input-area"><input class="text-input" type="text" id="answer-input" placeholder="?" onkeydown="if(event.key===\'Enter\')checkMixedFrac(\'' + q.answer.replace(/'/g, "\\'") + '\')">';
  html += '<button class="submit-btn" onclick="checkMixedFrac(\'' + q.answer.replace(/'/g, "\\'") + '\')">Check \u2713</button></div>';
  html += '<div style="font-size:13px;color:var(--text-dim);margin-top:8px">Format: ' + (q.type === 'mixed-to-improper' ? '7/4' : '1 3/4') + '</div>';
  html += renderHintBtn(q.hint);
  card.innerHTML = html;
  setTimeout(function() { var el = document.getElementById('answer-input'); if (el) el.focus(); }, 100);
}

function renderDecimalId(card, q) {
  var html = '<div class="question-text">Convert ' + q.fraction + ' to a decimal</div>';
  var options = [];
  options.push(q.answer);
  while (options.length < 4) {
    var fake = (rand(1, 99) / 10).toFixed(1);
    if (!options.includes(fake)) options.push(fake);
  }
  options = shuffle(options);
  html += '<div class="answer-options mt-2">' + options.map(function(o) {
    return '<button class="answer-btn" onclick="checkAnswer(\'' + o + '\', \'' + q.answer + '\', this)">' + o + '</button>';
  }).join('') + '</div>';
  html += renderHintBtn(q.hint);
  card.innerHTML = html;
}

function renderDecimalAdd(card, q) {
  var html = '<div class="question-text large">' + q.a + ' + ' + q.b + ' = ?</div>';
  html += '<div class="text-input-area"><input class="text-input" type="text" id="answer-input" placeholder="?" onkeydown="if(event.key===\'Enter\')checkDecimalAnswer(\'' + q.answer + '\')">';
  html += '<button class="submit-btn" onclick="checkDecimalAnswer(\'' + q.answer + '\')">Check \u2713</button></div>';
  html += renderHintBtn(q.hint);
  card.innerHTML = html;
  setTimeout(function() { var el = document.getElementById('answer-input'); if (el) el.focus(); }, 100);
}

function renderSymmetry(card, q) {
  var html = '<div class="question-text">How many lines of symmetry does a ' + q.shape.name + ' have?</div>';
  html += '<div style="font-size:64px;margin:12px 0">\u2B1C</div>';
  html += '<div class="answer-options mt-2">' + q.options.map(function(o) {
    return '<button class="answer-btn" onclick="checkAnswer(' + (typeof q.answer === 'string' ? '\'' + o + '\', \'' + q.answer + '\'' : o + ', ' + q.answer) + ', this)">' + (o === 'infinite' ? '\u221E' : o) + '</button>';
  }).join('') + '</div>';
  html += renderHintBtn(q.hint);
  card.innerHTML = html;
}

function renderDataAnalysis(card, q) {
  var html = '<div class="question-text">Data: ' + q.data.join(', ') + '</div>';
  var qText = q.qType === 'average' ? 'What is the average (mean)?' :
              q.qType === 'total' ? 'What is the total?' : 'What is the range?';
  html += '<div class="question-text" style="font-size:20px;margin-top:8px">' + qText + '</div>';
  var options = generateMCQOptions(q.answer, Math.max(0, q.answer - 5), q.answer + 5, 4);
  html += '<div class="answer-options mt-2">' + options.map(function(o) {
    return '<button class="answer-btn" onclick="checkAnswer(' + o + ', ' + q.answer + ', this)">' + o + '</button>';
  }).join('') + '</div>';
  html += renderHintBtn(q.hint);
  card.innerHTML = html;
}

function renderMultiStepWP(card, q) {
  var html = '<div class="story-prompt" style="font-size:18px">' + q.text + '</div>';
  html += '<div class="text-input-area mt-2"><input class="text-input" type="number" id="answer-input" placeholder="?" onkeydown="if(event.key===\'Enter\')submitTextAnswer(' + q.answer + ')">';
  html += '<button class="submit-btn" onclick="submitTextAnswer(' + q.answer + ')">Check \u2713</button></div>';
  html += renderHintBtn(q.hint);
  card.innerHTML = html;
  setTimeout(function() { var el = document.getElementById('answer-input'); if (el) el.focus(); }, 100);
}

// ===================== HELPER FUNCTIONS =====================

function toggleFracPart(el) {
  el.classList.toggle('shaded');
  el.classList.toggle('unshaded');
}

function checkFractionShade(expected) {
  var parts = document.querySelectorAll('#frac-bar .fraction-part.shaded');
  if (parts.length === expected) handleCorrect();
  else handleWrong(expected + ' parts');
}

function toggleFactorBtn(btn) {
  btn.classList.toggle('correct');
}

function checkFactors(correct) {
  var picked = [];
  document.querySelectorAll('#factor-picks .answer-btn.correct').forEach(function(b) {
    picked.push(parseInt(b.dataset.val));
  });
  picked.sort(function(a,b) { return a - b; });
  correct.sort(function(a,b) { return a - b; });
  if (JSON.stringify(picked) === JSON.stringify(correct)) handleCorrect();
  else handleWrong(correct.join(', '));
}

function checkMixedFrac(expected) {
  var input = document.getElementById('answer-input');
  if (!input) return;
  var val = input.value.trim().replace(/\s+/g, ' ');
  if (val === expected) handleCorrect();
  else handleWrong(expected);
}

function checkDecimalAnswer(expected) {
  var input = document.getElementById('answer-input');
  if (!input) return;
  var val = parseFloat(input.value.trim());
  if (!isNaN(val) && val.toFixed(1) === expected) handleCorrect();
  else handleWrong(expected);
}
