// ============================================================
//  INTERACTIVE SIMS — Rich canvas-like simulations for learning
// ============================================================
// Upgrades the emoji-based illustrations to proper interactive
// visual simulations using HTML/CSS (no canvas dependency)

// === FRACTION VISUALISER ===
// Renders an interactive fraction bar or pie that can be manipulated

function renderFractionVisual(container, numerator, denominator, type) {
  type = type || 'bar';
  var html = '<div class="sim-fraction-visual">';

  if (type === 'bar') {
    html += '<div class="sim-fraction-bar">';
    for (var i = 0; i < denominator; i++) {
      var filled = i < numerator;
      html += '<div class="sim-fraction-piece' + (filled ? ' filled' : '') + '" ' +
        'style="width:' + (100 / denominator) + '%" ' +
        'onclick="simFractionToggle(this)">' +
        '<span>' + (i + 1) + '</span>' +
        '</div>';
    }
    html += '</div>';
    html += '<div class="sim-fraction-label" id="sim-frac-label">' + numerator + '/' + denominator + '</div>';
  } else {
    // Pie chart using conic-gradient
    var deg = (numerator / denominator) * 360;
    html += '<div class="sim-fraction-pie" style="background:conic-gradient(var(--gold) 0deg ' + deg + 'deg, rgba(255,255,255,0.1) ' + deg + 'deg 360deg)">';
    html += '<div class="sim-fraction-pie-inner">' + numerator + '/' + denominator + '</div>';
    html += '</div>';
    // Denominator lines
    html += '<div class="sim-fraction-pie-lines">';
    for (var j = 0; j < denominator; j++) {
      var angle = (j / denominator) * 360;
      html += '<div class="sim-pie-line" style="transform:rotate(' + angle + 'deg)"></div>';
    }
    html += '</div>';
  }

  html += '</div>';
  container.innerHTML += html;
}

function simFractionToggle(el) {
  el.classList.toggle('filled');
  // Update label
  var bar = el.parentElement;
  var filled = bar.querySelectorAll('.filled').length;
  var total = bar.children.length;
  var label = document.getElementById('sim-frac-label');
  if (label) label.textContent = filled + '/' + total;
}

// === NUMBER LINE ===
// Interactive number line with draggable marker

function renderNumberLine(container, min, max, targetValue, label) {
  var range = max - min;
  var steps = Math.min(range, 20);
  var stepSize = range / steps;

  var html = '<div class="sim-numberline-wrap">';
  if (label) html += '<div class="sim-numberline-label">' + label + '</div>';
  html += '<div class="sim-numberline" id="sim-numberline">';

  // Track
  html += '<div class="sim-nl-track">';
  for (var i = 0; i <= steps; i++) {
    var val = min + Math.round(i * stepSize);
    var pct = (i / steps) * 100;
    var isMajor = i === 0 || i === steps || i % 5 === 0;
    html += '<div class="sim-nl-tick' + (isMajor ? ' major' : '') + '" style="left:' + pct + '%">';
    if (isMajor) html += '<span>' + val + '</span>';
    html += '</div>';
  }
  html += '</div>';

  // Draggable marker
  var targetPct = ((targetValue - min) / range) * 100;
  html += '<div class="sim-nl-marker" id="sim-nl-marker" style="left:' + targetPct + '%">';
  html += '<div class="sim-nl-marker-head">\u25BC</div>';
  html += '<div class="sim-nl-marker-value" id="sim-nl-value">' + targetValue + '</div>';
  html += '</div>';

  html += '</div>';
  html += '</div>';
  container.innerHTML += html;
}

// === PLACE VALUE BLOCKS ===
// Visual hundreds/tens/ones blocks

function renderPlaceValueBlocks(container, number) {
  var hundreds = Math.floor(number / 100);
  var tens = Math.floor((number % 100) / 10);
  var ones = number % 10;

  var html = '<div class="sim-pv-blocks">';

  // Hundreds
  if (hundreds > 0) {
    html += '<div class="sim-pv-group">';
    html += '<div class="sim-pv-group-label">Hundreds</div>';
    for (var h = 0; h < hundreds; h++) {
      html += '<div class="sim-pv-block hundred" title="100">';
      // 10x10 grid
      for (var r = 0; r < 10; r++) {
        for (var c = 0; c < 10; c++) {
          html += '<div class="sim-pv-unit"></div>';
        }
      }
      html += '</div>';
    }
    html += '</div>';
  }

  // Tens
  if (tens > 0) {
    html += '<div class="sim-pv-group">';
    html += '<div class="sim-pv-group-label">Tens</div>';
    for (var t = 0; t < tens; t++) {
      html += '<div class="sim-pv-block ten" title="10">';
      for (var u = 0; u < 10; u++) {
        html += '<div class="sim-pv-unit"></div>';
      }
      html += '</div>';
    }
    html += '</div>';
  }

  // Ones
  if (ones > 0) {
    html += '<div class="sim-pv-group">';
    html += '<div class="sim-pv-group-label">Ones</div>';
    for (var o = 0; o < ones; o++) {
      html += '<div class="sim-pv-block one" title="1"><div class="sim-pv-unit"></div></div>';
    }
    html += '</div>';
  }

  html += '<div class="sim-pv-total">' + number + '</div>';
  html += '</div>';
  container.innerHTML += html;
}

// === BALANCE SCALE ===
// Visual balance for equation solving

function renderBalanceScale(container, leftVal, rightVal, leftLabel, rightLabel) {
  var diff = leftVal - rightVal;
  var tilt = clamp(diff * 3, -15, 15); // degrees

  var html = '<div class="sim-balance">';
  html += '<div class="sim-balance-base">';
  html += '<div class="sim-balance-pillar"></div>';
  html += '<div class="sim-balance-beam" style="transform:rotate(' + tilt + 'deg)">';

  // Left pan
  html += '<div class="sim-balance-pan left">';
  html += '<div class="sim-balance-pan-label">' + (leftLabel || leftVal) + '</div>';
  html += '<div class="sim-balance-pan-val">' + leftVal + '</div>';
  html += '</div>';

  // Right pan
  html += '<div class="sim-balance-pan right">';
  html += '<div class="sim-balance-pan-label">' + (rightLabel || rightVal) + '</div>';
  html += '<div class="sim-balance-pan-val">' + rightVal + '</div>';
  html += '</div>';

  html += '</div>'; // beam
  html += '</div>'; // base

  var status = diff === 0 ? 'Balanced! \u2696\uFE0F' : (diff > 0 ? 'Left is heavier' : 'Right is heavier');
  html += '<div class="sim-balance-status">' + status + '</div>';
  html += '</div>';
  container.innerHTML += html;
}

// === CLOCK FACE ===
// SVG clock face for time-telling

function renderClockFace(container, hours, minutes, interactive) {
  var hourAngle = ((hours % 12) + minutes / 60) * 30; // 360/12 = 30 per hour
  var minAngle = minutes * 6; // 360/60 = 6 per minute

  var html = '<div class="sim-clock-wrap">';
  html += '<svg class="sim-clock" viewBox="0 0 200 200" width="180" height="180">';

  // Face
  html += '<circle cx="100" cy="100" r="95" fill="#1a1a3e" stroke="var(--gold)" stroke-width="3"/>';

  // Hour marks
  for (var i = 1; i <= 12; i++) {
    var a = (i * 30 - 90) * Math.PI / 180;
    var x = 100 + 78 * Math.cos(a);
    var y = 100 + 78 * Math.sin(a);
    html += '<text x="' + x + '" y="' + (y + 5) + '" text-anchor="middle" fill="var(--text-primary)" font-size="14" font-weight="700">' + i + '</text>';
  }

  // Minute ticks
  for (var m = 0; m < 60; m++) {
    var am = (m * 6 - 90) * Math.PI / 180;
    var inner = m % 5 === 0 ? 82 : 88;
    var x1 = 100 + inner * Math.cos(am);
    var y1 = 100 + inner * Math.sin(am);
    var x2 = 100 + 92 * Math.cos(am);
    var y2 = 100 + 92 * Math.sin(am);
    html += '<line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '" stroke="rgba(255,255,255,0.3)" stroke-width="' + (m % 5 === 0 ? 2 : 1) + '"/>';
  }

  // Hour hand
  var ha = (hourAngle - 90) * Math.PI / 180;
  var hx = 100 + 50 * Math.cos(ha);
  var hy = 100 + 50 * Math.sin(ha);
  html += '<line x1="100" y1="100" x2="' + hx + '" y2="' + hy + '" stroke="var(--gold)" stroke-width="5" stroke-linecap="round"/>';

  // Minute hand
  var ma = (minAngle - 90) * Math.PI / 180;
  var mx = 100 + 70 * Math.cos(ma);
  var my = 100 + 70 * Math.sin(ma);
  html += '<line x1="100" y1="100" x2="' + mx + '" y2="' + my + '" stroke="var(--mint)" stroke-width="3" stroke-linecap="round"/>';

  // Center dot
  html += '<circle cx="100" cy="100" r="5" fill="var(--gold)"/>';

  html += '</svg>';

  // Time display
  var hStr = hours < 10 ? '0' + hours : hours;
  var mStr = minutes < 10 ? '0' + minutes : minutes;
  html += '<div class="sim-clock-time">' + hStr + ':' + mStr + '</div>';

  html += '</div>';
  container.innerHTML += html;
}

// === ARRAY VISUALISER ===
// For multiplication — shows rows x columns of dots

function renderArrayVisual(container, rows, cols, label) {
  var html = '<div class="sim-array-wrap">';
  if (label) html += '<div class="sim-array-label">' + label + '</div>';
  html += '<div class="sim-array-grid" style="grid-template-columns:repeat(' + cols + ', 1fr)">';

  for (var r = 0; r < rows; r++) {
    for (var c = 0; c < cols; c++) {
      html += '<div class="sim-array-dot" style="animation-delay:' + ((r * cols + c) * 0.03) + 's"></div>';
    }
  }

  html += '</div>';
  html += '<div class="sim-array-equation">' + rows + ' \u00D7 ' + cols + ' = ' + (rows * cols) + '</div>';
  html += '</div>';
  container.innerHTML += html;
}

// === BAR MODEL (enhanced) ===
// Proper bar model for word problems

function renderEnhancedBarModel(container, parts, whole, unknownIndex) {
  var html = '<div class="sim-barmodel">';

  // Whole bar
  html += '<div class="sim-barmodel-whole">';
  html += '<div class="sim-barmodel-whole-label">' + (whole !== null ? whole : '?') + '</div>';
  html += '</div>';

  // Parts
  html += '<div class="sim-barmodel-parts">';
  parts.forEach(function(p, i) {
    var widthPct = whole ? (p.value / whole * 100) : (100 / parts.length);
    var isUnknown = (i === unknownIndex);
    html += '<div class="sim-barmodel-part' + (isUnknown ? ' unknown' : '') + '" style="width:' + widthPct + '%">';
    html += '<span>' + (isUnknown ? '?' : p.value) + '</span>';
    if (p.label) html += '<div class="sim-barmodel-part-label">' + p.label + '</div>';
    html += '</div>';
  });
  html += '</div>';

  html += '</div>';
  container.innerHTML += html;
}

// === RAMP / FORCES SIMULATOR (enhanced) ===
// Proper sliding object with angle and friction controls

function renderRampSim(container, questionData) {
  var html = '<div class="sim-ramp-wrap" id="sim-ramp">';

  // Controls
  html += '<div class="sim-ramp-controls">';
  html += '<div class="sim-ramp-control">';
  html += '<label>Angle: <span id="ramp-angle-val">30</span>\u00B0</label>';
  html += '<input type="range" min="5" max="60" value="30" oninput="simRampUpdate()" id="ramp-angle-slider" class="sim-slider">';
  html += '</div>';
  html += '<div class="sim-ramp-control">';
  html += '<label>Push force: <span id="ramp-push-val">0</span></label>';
  html += '<input type="range" min="0" max="10" value="0" oninput="simRampUpdate()" id="ramp-push-slider" class="sim-slider">';
  html += '</div>';
  html += '<div class="sim-ramp-control">';
  html += '<label>Surface:</label>';
  html += '<select id="ramp-surface" onchange="simRampUpdate()" class="sim-select">';
  html += '<option value="0.1">Ice (slippery)</option>';
  html += '<option value="0.3" selected>Wood (medium)</option>';
  html += '<option value="0.6">Carpet (rough)</option>';
  html += '<option value="0.9">Sandpaper (very rough)</option>';
  html += '</select>';
  html += '</div>';
  html += '</div>';

  // Visual ramp
  html += '<div class="sim-ramp-scene">';
  html += '<svg viewBox="0 0 300 180" class="sim-ramp-svg" id="ramp-svg">';

  // Ground
  html += '<line x1="0" y1="170" x2="300" y2="170" stroke="rgba(255,255,255,0.2)" stroke-width="2"/>';

  // Ramp (recalculated on update)
  html += '<polygon id="ramp-triangle" points="30,170 250,170 250,50" fill="rgba(255,255,255,0.08)" stroke="var(--text-dim)" stroke-width="2"/>';

  // Object on ramp
  html += '<rect id="ramp-object" x="120" y="90" width="24" height="24" rx="4" fill="var(--gold)" stroke="rgba(255,215,0,0.5)" stroke-width="1"/>';

  // Force arrows
  html += '<line id="ramp-arrow-push" x1="100" y1="102" x2="120" y2="102" stroke="var(--mint)" stroke-width="3" marker-end="url(#arrowhead)" opacity="0"/>';
  html += '<line id="ramp-arrow-gravity" x1="132" y1="114" x2="132" y2="140" stroke="var(--coral)" stroke-width="2" marker-end="url(#arrowhead-red)"/>';
  html += '<line id="ramp-arrow-friction" x1="144" y1="102" x2="160" y2="102" stroke="var(--warning)" stroke-width="2" opacity="0.5"/>';

  // Arrow markers
  html += '<defs>';
  html += '<marker id="arrowhead" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto"><polygon points="0 0, 8 3, 0 6" fill="var(--mint)"/></marker>';
  html += '<marker id="arrowhead-red" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto"><polygon points="0 0, 8 3, 0 6" fill="var(--coral)"/></marker>';
  html += '</defs>';

  html += '</svg>';
  html += '</div>';

  // Result
  html += '<div class="sim-ramp-result" id="ramp-result">Adjust the controls and watch the forces!</div>';
  html += '<button class="answer-btn" style="margin:8px auto;display:block" onclick="simRampGo()">Push! \u25B6</button>';

  html += '</div>';
  container.innerHTML += html;
}

function simRampUpdate() {
  var angle = parseInt(document.getElementById('ramp-angle-slider').value);
  var push = parseInt(document.getElementById('ramp-push-slider').value);
  document.getElementById('ramp-angle-val').textContent = angle;
  document.getElementById('ramp-push-val').textContent = push;

  // Update triangle shape
  var rampHeight = 170 - (120 * Math.sin(angle * Math.PI / 180));
  var tri = document.getElementById('ramp-triangle');
  if (tri) tri.setAttribute('points', '30,170 250,170 250,' + Math.round(rampHeight));

  // Show push arrow if force > 0
  var pushArrow = document.getElementById('ramp-arrow-push');
  if (pushArrow) pushArrow.style.opacity = push > 0 ? '1' : '0';
}

function simRampGo() {
  var angle = parseInt(document.getElementById('ramp-angle-slider').value);
  var push = parseInt(document.getElementById('ramp-push-slider').value);
  var friction = parseFloat(document.getElementById('ramp-surface').value);

  var gravity = Math.sin(angle * Math.PI / 180) * 10;
  var frictionForce = Math.cos(angle * Math.PI / 180) * friction * 10;
  var net = gravity + push - frictionForce;

  var result = document.getElementById('ramp-result');
  var obj = document.getElementById('ramp-object');

  if (net > 1) {
    result.textContent = 'The object slides DOWN! (gravity + push > friction)';
    result.style.color = 'var(--mint)';
    if (obj) {
      obj.style.transition = 'transform 1s ease-in';
      obj.style.transform = 'translate(60px, 40px)';
    }
  } else if (net < -1) {
    result.textContent = 'Friction holds! The object stays put.';
    result.style.color = 'var(--warning)';
    if (obj) { obj.style.transition = 'transform 0.3s'; obj.style.transform = 'translate(0,0)'; }
  } else {
    result.textContent = 'Just barely balanced! The forces are almost equal.';
    result.style.color = 'var(--gold)';
    if (obj) {
      obj.style.transition = 'transform 0.5s';
      obj.style.transform = 'translate(3px, 2px)';
      setTimeout(function() { obj.style.transform = 'translate(0,0)'; }, 500);
    }
  }

  if (typeof playSound === 'function') playSound('click');
}

// === LIFECYCLE DRAG-AND-DROP ===
// Renders lifecycle stages to be ordered

function renderLifecycleSim(container, organism, stages, correctOrder) {
  var shuffled = shuffle(stages.slice());

  var html = '<div class="sim-lifecycle-wrap">';
  html += '<div class="sim-lifecycle-title">Lifecycle of a ' + organism + '</div>';

  // Drop zones (numbered slots)
  html += '<div class="sim-lifecycle-slots" id="lifecycle-slots">';
  for (var i = 0; i < correctOrder.length; i++) {
    html += '<div class="sim-lifecycle-slot" data-index="' + i + '">';
    html += '<div class="sim-slot-number">' + (i + 1) + '</div>';
    html += '<div class="sim-slot-label" id="slot-label-' + i + '">?</div>';
    html += '</div>';
    if (i < correctOrder.length - 1) {
      html += '<div class="sim-lifecycle-arrow">\u27A1\uFE0F</div>';
    }
  }
  html += '</div>';

  // Draggable stages
  html += '<div class="sim-lifecycle-bank" id="lifecycle-bank">';
  shuffled.forEach(function(stage) {
    html += '<button class="sim-lifecycle-item" onclick="lifecyclePlace(this, \'' + stage.id + '\', \'' + stage.label.replace(/'/g, "\\'") + '\')">';
    html += '<div style="font-size:28px">' + stage.emoji + '</div>';
    html += '<div style="font-size:12px">' + stage.label + '</div>';
    html += '</button>';
  });
  html += '</div>';

  html += '<button class="submit-btn mt-2" onclick="checkLifecycle()" style="margin:12px auto;display:block">Check Order \u2713</button>';
  html += '</div>';

  container.innerHTML += html;
  container.dataset.lifecycleOrder = JSON.stringify(correctOrder);
  container.dataset.lifecyclePlaced = JSON.stringify([]);
}

var _lifecycleCurrent = 0;
function lifecyclePlace(btn, id, label) {
  var placed = JSON.parse(document.getElementById('question-card').dataset.lifecyclePlaced || '[]');
  if (placed.length >= parseInt(document.getElementById('question-card').dataset.lifecycleOrder ? JSON.parse(document.getElementById('question-card').dataset.lifecycleOrder).length : 4)) return;

  placed.push(id);
  document.getElementById('question-card').dataset.lifecyclePlaced = JSON.stringify(placed);

  var slotLabel = document.getElementById('slot-label-' + (placed.length - 1));
  if (slotLabel) {
    slotLabel.textContent = label;
    slotLabel.style.color = 'var(--text-primary)';
  }

  btn.style.opacity = '0.3';
  btn.style.pointerEvents = 'none';
  if (typeof playSound === 'function') playSound('click');
}

function checkLifecycle() {
  var card = document.getElementById('question-card');
  var correct = JSON.parse(card.dataset.lifecycleOrder || '[]');
  var placed = JSON.parse(card.dataset.lifecyclePlaced || '[]');

  if (placed.length < correct.length) {
    if (typeof lumiSay === 'function') lumiSay('Place all the stages first!');
    return;
  }

  var allRight = true;
  for (var i = 0; i < correct.length; i++) {
    if (placed[i] !== correct[i]) { allRight = false; break; }
  }

  if (allRight) {
    if (typeof handleCorrect === 'function') handleCorrect();
  } else {
    if (typeof handleWrong === 'function') handleWrong('Try again — think about what comes first!');
    // Reset
    card.dataset.lifecyclePlaced = JSON.stringify([]);
    for (var j = 0; j < correct.length; j++) {
      var sl = document.getElementById('slot-label-' + j);
      if (sl) { sl.textContent = '?'; sl.style.color = ''; }
    }
    var bank = document.getElementById('lifecycle-bank');
    if (bank) {
      bank.querySelectorAll('.sim-lifecycle-item').forEach(function(b) {
        b.style.opacity = '1';
        b.style.pointerEvents = '';
      });
    }
  }
}

// === ENERGY CHAIN BUILDER ===
// Connect energy transformations

function renderEnergyChain(container, steps, correctChain) {
  var shuffled = shuffle(steps.slice());

  var html = '<div class="sim-energy-wrap">';
  html += '<div class="sim-energy-title">\u26A1 Energy Transformation Chain</div>';
  html += '<div class="sim-energy-chain" id="energy-chain">';
  for (var i = 0; i < correctChain.length; i++) {
    html += '<div class="sim-energy-slot" id="energy-slot-' + i + '">';
    html += '<div class="sim-energy-slot-label">Step ' + (i + 1) + '</div>';
    html += '<div class="sim-energy-slot-val" id="energy-val-' + i + '">?</div>';
    html += '</div>';
    if (i < correctChain.length - 1) {
      html += '<div class="sim-energy-arrow">\u27A1\uFE0F</div>';
    }
  }
  html += '</div>';

  html += '<div class="sim-energy-bank" id="energy-bank">';
  shuffled.forEach(function(step) {
    html += '<button class="sim-energy-item" onclick="energyPlace(this, \'' + step.id + '\', \'' + step.label.replace(/'/g, "\\'") + '\')">';
    html += step.emoji + ' ' + step.label;
    html += '</button>';
  });
  html += '</div>';

  html += '<button class="submit-btn mt-2" onclick="checkEnergyChain()" style="margin:12px auto;display:block">Check Chain \u2713</button>';
  html += '</div>';

  container.innerHTML += html;
  container.dataset.energyCorrect = JSON.stringify(correctChain);
  container.dataset.energyPlaced = JSON.stringify([]);
}

function energyPlace(btn, id, label) {
  var card = document.getElementById('question-card');
  var placed = JSON.parse(card.dataset.energyPlaced || '[]');
  var correct = JSON.parse(card.dataset.energyCorrect || '[]');
  if (placed.length >= correct.length) return;

  placed.push(id);
  card.dataset.energyPlaced = JSON.stringify(placed);

  var valEl = document.getElementById('energy-val-' + (placed.length - 1));
  if (valEl) valEl.textContent = label;

  btn.style.opacity = '0.3';
  btn.style.pointerEvents = 'none';
  if (typeof playSound === 'function') playSound('click');
}

function checkEnergyChain() {
  var card = document.getElementById('question-card');
  var correct = JSON.parse(card.dataset.energyCorrect || '[]');
  var placed = JSON.parse(card.dataset.energyPlaced || '[]');

  if (placed.length < correct.length) {
    if (typeof lumiSay === 'function') lumiSay('Connect all the steps!');
    return;
  }

  var allRight = placed.every(function(id, i) { return id === correct[i]; });
  if (allRight) {
    if (typeof handleCorrect === 'function') handleCorrect();
  } else {
    if (typeof handleWrong === 'function') handleWrong('Think about how energy changes form!');
    card.dataset.energyPlaced = JSON.stringify([]);
    for (var j = 0; j < correct.length; j++) {
      var v = document.getElementById('energy-val-' + j);
      if (v) v.textContent = '?';
    }
    var bank = document.getElementById('energy-bank');
    if (bank) {
      bank.querySelectorAll('.sim-energy-item').forEach(function(b) {
        b.style.opacity = '1'; b.style.pointerEvents = '';
      });
    }
  }
}
