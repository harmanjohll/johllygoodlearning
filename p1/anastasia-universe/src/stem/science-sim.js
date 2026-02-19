// ============================================================
//  SCIENCE RENDER — Interactive renderers + simulations
// ============================================================

function renderScienceQuestion(card, q) {
  switch (q.type) {
    case 'science-mcq':        renderScienceMCQ(card, q); return true;
    case 'science-sort':       renderScienceSort(card, q); return true;
    case 'science-experiment': renderScienceExperiment(card, q); return true;
    case 'sim-water-cycle':    renderWaterCycleSim(card, q); return true;
    case 'sim-body-explorer':  renderBodyExplorer(card, q); return true;
    case 'sim-magnet':         renderMagnetSim(card, q); return true;
    case 'sim-plant-growth':   renderPlantGrowthSim(card, q); return true;
    case 'sim-circuit':        renderCircuitSim(card, q); return true;
    default: return false;
  }
}

// ===================== BASIC RENDERERS =====================

function renderScienceMCQ(card, q) {
  var html = '<div style="font-size:36px;margin-bottom:8px">\uD83E\uDD14</div>';
  html += '<div class="question-text" style="font-size:20px">' + q.text + '</div>';
  html += '<div class="answer-options" style="flex-direction:column;margin-top:16px">' + q.options.map(function(o) {
    return '<button class="answer-btn" onclick="checkAnswer(\'' + escSci(o) + '\', \'' + escSci(q.answer) + '\', this)" style="font-size:16px;text-align:left;width:100%">' + o + '</button>';
  }).join('') + '</div>';
  html += renderHintBtn(q.hint);
  card.innerHTML = html;
}

function renderScienceSort(card, q) {
  var html = '<div class="question-text" style="font-size:20px">' + q.text + '</div>';
  html += '<div style="display:flex;gap:16px;justify-content:center;margin:16px 0">';
  q.categories.forEach(function(cat) {
    html += '<div style="flex:1;min-width:100px">';
    html += '<div style="font-weight:700;font-size:16px;color:var(--gold);margin-bottom:8px;padding:6px;background:rgba(255,255,255,0.05);border-radius:8px">' + cat + '</div>';
    html += '<div class="sort-zone" id="sort-' + cat.replace(/\s/g,'') + '" style="min-height:80px;padding:8px;background:rgba(255,255,255,0.03);border-radius:8px;border:2px dashed rgba(255,255,255,0.1)"></div>';
    html += '</div>';
  });
  html += '</div>';
  html += '<div id="sort-bank" style="display:flex;flex-wrap:wrap;gap:6px;justify-content:center;margin:12px 0">';
  q.items.forEach(function(item) {
    html += '<button class="answer-btn" style="font-size:14px;padding:6px 12px" onclick="sciSortClick(this,\'' + escSci(item.name) + '\',\'' + escSci(item.category) + '\')">' + item.name + '</button>';
  });
  html += '</div>';
  html += '<button class="submit-btn mt-2" onclick="checkSciSort()">Check \u2713</button>';
  html += renderHintBtn(q.hint);
  card.innerHTML = html;
  card.dataset.sortAnswer = JSON.stringify(q.items.map(function(i) { return { n: i.name, c: i.category }; }));
}

function renderScienceExperiment(card, q) {
  var html = '<div style="font-size:36px;margin-bottom:8px">\uD83E\uDDEA</div>';
  html += '<div class="question-text" style="font-size:18px">Experiment:</div>';
  html += '<div class="story-prompt" style="font-size:16px;margin:12px 0;text-align:left">' + q.scenario + '</div>';
  html += '<div class="question-text" style="font-size:18px">' + q.text + '</div>';
  html += '<div class="answer-options" style="flex-direction:column;margin-top:12px">' + q.options.map(function(o) {
    return '<button class="answer-btn" onclick="checkAnswer(\'' + escSci(o) + '\', \'' + escSci(q.answer) + '\', this)" style="font-size:16px;text-align:left;width:100%">' + o + '</button>';
  }).join('') + '</div>';
  html += renderHintBtn(q.hint);
  card.innerHTML = html;
}

// ===================== SORT HELPERS =====================

function sciSortClick(btn, name, correctCat) {
  // Move between bank and sort zones
  var bank = document.getElementById('sort-bank');
  if (btn.parentElement.id === 'sort-bank') {
    // Move to first available zone — let user place it
    var zones = document.querySelectorAll('.sort-zone');
    if (zones.length > 0) {
      // Cycle through zones on subsequent clicks
      var currentZone = btn.dataset.zone || '';
      var zoneArr = Array.from(zones);
      var nextIdx = 0;
      if (currentZone) {
        var curIdx = zoneArr.findIndex(function(z) { return z.id === currentZone; });
        nextIdx = (curIdx + 1) % zoneArr.length;
      }
      btn.remove();
      var clone = document.createElement('button');
      clone.className = 'answer-btn';
      clone.style.cssText = 'font-size:14px;padding:6px 12px';
      clone.textContent = name;
      clone.dataset.zone = zoneArr[nextIdx].id;
      clone.setAttribute('onclick', "sciSortReturn(this,'" + escSci(name) + "','" + escSci(correctCat) + "')");
      zoneArr[nextIdx].appendChild(clone);
    }
  }
}

function sciSortReturn(btn, name, correctCat) {
  btn.remove();
  var bank = document.getElementById('sort-bank');
  if (bank) {
    var newBtn = document.createElement('button');
    newBtn.className = 'answer-btn';
    newBtn.style.cssText = 'font-size:14px;padding:6px 12px';
    newBtn.textContent = name;
    newBtn.setAttribute('onclick', "sciSortClick(this,'" + escSci(name) + "','" + escSci(correctCat) + "')");
    bank.appendChild(newBtn);
  }
}

function checkSciSort() {
  var card = document.getElementById('question-card');
  var data = JSON.parse(card.dataset.sortAnswer || '[]');
  var allCorrect = true;

  data.forEach(function(item) {
    var zoneId = 'sort-' + item.c.replace(/\s/g,'');
    var zone = document.getElementById(zoneId);
    if (!zone) { allCorrect = false; return; }
    var found = false;
    zone.querySelectorAll('.answer-btn').forEach(function(btn) {
      if (btn.textContent === item.n) found = true;
    });
    if (!found) allCorrect = false;
  });

  if (allCorrect) handleCorrect();
  else handleWrong('Sort all items to the correct group');
}

// ===================== WATER CYCLE SIM =====================

function renderWaterCycleSim(card, q) {
  var html = '<div class="question-text">\uD83C\uDF0A Water Cycle</div>';
  html += '<div style="position:relative;width:100%;max-width:340px;height:240px;margin:12px auto;background:linear-gradient(to bottom, #87CEEB 0%, #87CEEB 50%, #8B6914 50%, #228B22 100%);border-radius:16px;overflow:hidden" id="water-cycle-sim">';

  // Sun
  html += '<div style="position:absolute;top:12px;right:20px;font-size:32px">\u2600\uFE0F</div>';

  // Cloud
  html += '<div id="wc-cloud" style="position:absolute;top:20px;left:40px;font-size:36px;transition:all 0.5s">\u2601\uFE0F</div>';

  // Water body
  html += '<div style="position:absolute;bottom:0;left:0;right:0;height:40px;background:rgba(30,144,255,0.6);border-radius:0 0 16px 16px"></div>';

  // Arrows (hidden initially, shown as stages advance)
  html += '<div id="wc-evap" class="wc-arrow" style="position:absolute;bottom:50px;right:60px;color:#ADD8E6;font-size:24px;opacity:0;transition:opacity 0.5s">\u2B06\uFE0F</div>';
  html += '<div id="wc-cond" class="wc-arrow" style="position:absolute;top:60px;left:70px;color:#9999CC;font-size:20px;opacity:0;transition:opacity 0.5s">\uD83D\uDCA7</div>';
  html += '<div id="wc-rain" class="wc-arrow" style="position:absolute;top:65px;left:50px;color:#4169E1;font-size:20px;opacity:0;transition:opacity 0.5s">\uD83C\uDF27\uFE0F</div>';
  html += '<div id="wc-collect" class="wc-arrow" style="position:absolute;bottom:25px;left:30px;color:#1E90FF;font-size:18px;opacity:0;transition:opacity 0.5s">\u27A1\uFE0F</div>';

  // Labels
  html += '<div id="wc-label" style="position:absolute;bottom:50%;left:50%;transform:translate(-50%,50%);background:rgba(0,0,0,0.7);color:white;padding:6px 14px;border-radius:20px;font-size:14px;font-weight:600;transition:all 0.3s">Tap \u25B6 to start</div>';

  html += '</div>';

  // Stage controls
  html += '<div style="display:flex;gap:8px;justify-content:center;margin:12px 0">';
  html += '<button class="answer-btn" style="font-size:14px" onclick="wcAdvance()" id="wc-next-btn">\u25B6 Next Stage</button>';
  html += '</div>';

  // Stage counter
  html += '<div id="wc-stage-info" style="font-size:14px;color:var(--text-secondary);margin:8px 0">Stage 0 of 4</div>';

  // Quiz appears after all stages shown
  html += '<div id="wc-quiz" style="display:none">';
  html += '<div class="question-text" style="font-size:18px;margin-top:12px">' + q.text + '</div>';
  html += '<div class="answer-options" style="flex-direction:column;margin-top:8px">' + q.options.map(function(o) {
    return '<button class="answer-btn" onclick="checkAnswer(\'' + escSci(o) + '\', \'' + escSci(q.answer) + '\', this)" style="font-size:16px;text-align:left;width:100%">' + o + '</button>';
  }).join('') + '</div>';
  html += '</div>';
  html += renderHintBtn(q.hint);
  card.innerHTML = html;
  card.dataset.wcStage = '0';
}

var WC_STAGES = [
  { id: 'wc-evap', label: '1. Evaporation \u2014 Sun heats water, it rises as vapour' },
  { id: 'wc-cond', label: '2. Condensation \u2014 Vapour cools and forms clouds' },
  { id: 'wc-rain', label: '3. Precipitation \u2014 Water falls as rain or snow' },
  { id: 'wc-collect', label: '4. Collection \u2014 Water gathers in rivers, lakes, oceans' }
];

function wcAdvance() {
  var card = document.getElementById('question-card');
  var stage = parseInt(card.dataset.wcStage || '0');

  if (stage < WC_STAGES.length) {
    var s = WC_STAGES[stage];
    var el = document.getElementById(s.id);
    if (el) el.style.opacity = '1';
    var label = document.getElementById('wc-label');
    if (label) label.textContent = s.label;
    stage++;
    card.dataset.wcStage = String(stage);
    var info = document.getElementById('wc-stage-info');
    if (info) info.textContent = 'Stage ' + stage + ' of 4';

    if (stage >= WC_STAGES.length) {
      var btn = document.getElementById('wc-next-btn');
      if (btn) btn.style.display = 'none';
      var quiz = document.getElementById('wc-quiz');
      if (quiz) quiz.style.display = 'block';
      if (info) info.textContent = 'Now answer the question!';
    }
  }
}

// ===================== HUMAN BODY EXPLORER =====================

function renderBodyExplorer(card, q) {
  var html = '<div class="question-text">\uD83E\uDEC0 Body Explorer</div>';
  html += '<div style="position:relative;width:180px;height:260px;margin:12px auto">';

  // Simple body outline using positioned emoji organs
  html += '<div style="position:absolute;top:0;left:50%;transform:translateX(-50%);font-size:32px">\uD83D\uDDE3\uFE0F</div>'; // head

  var organs = [
    { id: 'brain',   emoji: '\uD83E\uDDE0', top: 5,   left: 72, label: 'Brain', desc: 'Controls thinking, memory, and body functions' },
    { id: 'lungs',   emoji: '\uD83E\uDEC1', top: 70,  left: 30, label: 'Lungs', desc: 'Breathe in oxygen, breathe out carbon dioxide' },
    { id: 'heart',   emoji: '\u2764\uFE0F', top: 75,  left: 95, label: 'Heart', desc: 'Pumps blood to every part of your body' },
    { id: 'stomach', emoji: '\uD83E\uDE78', top: 120, left: 60, label: 'Stomach', desc: 'Breaks down food with acids and enzymes' },
    { id: 'bones',   emoji: '\uD83E\uDDB4', top: 170, left: 70, label: 'Bones', desc: 'Support your body and protect organs' }
  ];

  organs.forEach(function(org) {
    html += '<button class="body-organ-btn" style="position:absolute;top:' + org.top + 'px;left:' + org.left + 'px;font-size:28px;background:none;border:2px solid transparent;border-radius:50%;padding:4px;cursor:pointer;transition:all 0.3s" ';
    html += 'onclick="bodyOrganClick(\'' + org.id + '\',\'' + escSci(org.label) + '\',\'' + escSci(org.desc) + '\')" ';
    html += 'title="' + org.label + '">' + org.emoji + '</button>';
  });

  html += '</div>';

  // Info panel
  html += '<div id="body-info" style="min-height:50px;padding:10px;background:rgba(255,255,255,0.05);border-radius:12px;margin:8px 0;font-size:14px;color:var(--text-secondary)">Tap an organ to learn about it!</div>';

  // Count explored organs
  html += '<div id="body-explored" style="font-size:12px;color:var(--text-dim);margin:4px 0">Explored: 0/' + organs.length + '</div>';

  // Quiz (appears after exploring at least 3 organs)
  html += '<div id="body-quiz" style="display:none">';
  html += '<div class="question-text" style="font-size:18px;margin-top:12px">' + q.text + '</div>';
  html += '<div class="answer-options" style="flex-direction:column;margin-top:8px">' + q.options.map(function(o) {
    return '<button class="answer-btn" onclick="checkAnswer(\'' + escSci(o) + '\', \'' + escSci(q.answer) + '\', this)" style="font-size:16px;text-align:left;width:100%">' + o + '</button>';
  }).join('') + '</div>';
  html += '</div>';
  html += renderHintBtn(q.hint);
  card.innerHTML = html;
  card.dataset.bodyExplored = '';
}

function bodyOrganClick(id, label, desc) {
  var info = document.getElementById('body-info');
  if (info) {
    info.innerHTML = '<strong style="color:var(--gold)">' + label + '</strong>: ' + desc;
    info.style.animation = 'none';
    info.offsetHeight;
    info.style.animation = 'pop-in 0.3s ease-out';
  }

  // Highlight the clicked organ
  document.querySelectorAll('.body-organ-btn').forEach(function(b) {
    b.style.borderColor = 'transparent';
  });
  var btns = document.querySelectorAll('.body-organ-btn');
  btns.forEach(function(b) {
    if (b.getAttribute('onclick').indexOf(id) >= 0) {
      b.style.borderColor = 'var(--gold)';
    }
  });

  // Track explored organs
  var card = document.getElementById('question-card');
  var explored = (card.dataset.bodyExplored || '').split(',').filter(function(s) { return s; });
  if (explored.indexOf(id) < 0) explored.push(id);
  card.dataset.bodyExplored = explored.join(',');

  var counter = document.getElementById('body-explored');
  if (counter) counter.textContent = 'Explored: ' + explored.length + '/5';

  // Show quiz after exploring 3+ organs
  if (explored.length >= 3) {
    var quiz = document.getElementById('body-quiz');
    if (quiz) quiz.style.display = 'block';
  }
}

// ===================== MAGNET SIMULATOR =====================

function renderMagnetSim(card, q) {
  var html = '<div class="question-text">\uD83E\uDDF2 Magnet Lab</div>';

  html += '<div style="position:relative;width:100%;max-width:320px;height:120px;margin:16px auto;background:rgba(255,255,255,0.03);border-radius:16px;overflow:hidden" id="magnet-sim">';

  // Left magnet
  html += '<div id="mag-left" style="position:absolute;left:40px;top:35px;width:80px;height:50px;border-radius:8px;display:flex;cursor:pointer;user-select:none" onclick="magFlipLeft()">';
  html += '<div style="flex:1;background:var(--error);border-radius:8px 0 0 8px;display:flex;align-items:center;justify-content:center;font-weight:700;color:white;font-size:20px" id="mag-l-pole">N</div>';
  html += '<div style="flex:1;background:var(--sky);border-radius:0 8px 8px 0;display:flex;align-items:center;justify-content:center;font-weight:700;color:white;font-size:20px">S</div>';
  html += '</div>';

  // Right magnet
  html += '<div id="mag-right" style="position:absolute;right:40px;top:35px;width:80px;height:50px;border-radius:8px;display:flex;cursor:pointer;user-select:none" onclick="magFlipRight()">';
  html += '<div style="flex:1;background:var(--error);border-radius:8px 0 0 8px;display:flex;align-items:center;justify-content:center;font-weight:700;color:white;font-size:20px">N</div>';
  html += '<div style="flex:1;background:var(--sky);border-radius:0 8px 8px 0;display:flex;align-items:center;justify-content:center;font-weight:700;color:white;font-size:20px" id="mag-r-pole">S</div>';
  html += '</div>';

  // Force indicator in the middle
  html += '<div id="mag-force" style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);font-size:24px;transition:all 0.3s">\u2B05\uFE0F\u27A1\uFE0F</div>';

  html += '</div>';

  html += '<div style="font-size:14px;color:var(--text-secondary);margin:8px 0">Tap a magnet to flip it. Watch what happens!</div>';
  html += '<div id="mag-result" style="font-size:16px;color:var(--mint);font-weight:600;min-height:24px;margin:4px 0">N meets S \u2192 ATTRACT! \uD83E\uDDF2</div>';

  // Quiz
  html += '<div class="question-text" style="font-size:18px;margin-top:16px">' + q.text + '</div>';
  html += '<div class="answer-options" style="flex-direction:column;margin-top:8px">' + q.options.map(function(o) {
    return '<button class="answer-btn" onclick="checkAnswer(\'' + escSci(o) + '\', \'' + escSci(q.answer) + '\', this)" style="font-size:16px;text-align:left;width:100%">' + o + '</button>';
  }).join('') + '</div>';
  html += renderHintBtn(q.hint);
  card.innerHTML = html;
  card.dataset.magLeftFlipped = 'false';
  card.dataset.magRightFlipped = 'false';
}

function magFlipLeft() {
  var card = document.getElementById('question-card');
  var flipped = card.dataset.magLeftFlipped === 'true';
  card.dataset.magLeftFlipped = String(!flipped);
  var mag = document.getElementById('mag-left');
  mag.style.transform = !flipped ? 'scaleX(-1)' : '';
  magUpdateForce();
}

function magFlipRight() {
  var card = document.getElementById('question-card');
  var flipped = card.dataset.magRightFlipped === 'true';
  card.dataset.magRightFlipped = String(!flipped);
  var mag = document.getElementById('mag-right');
  mag.style.transform = !flipped ? 'scaleX(-1)' : '';
  magUpdateForce();
}

function magUpdateForce() {
  var card = document.getElementById('question-card');
  var lFlip = card.dataset.magLeftFlipped === 'true';
  var rFlip = card.dataset.magRightFlipped === 'true';

  // Determine facing poles: left magnet's right side meets right magnet's left side
  var leftFacing = lFlip ? 'N' : 'S';  // right side of left magnet
  var rightFacing = rFlip ? 'S' : 'N'; // left side of right magnet

  var force = document.getElementById('mag-force');
  var result = document.getElementById('mag-result');

  if (leftFacing !== rightFacing) {
    // Attract (opposites)
    force.textContent = '\u27A1\uFE0F\u2B05\uFE0F';
    force.style.color = 'var(--success)';
    result.textContent = leftFacing + ' meets ' + rightFacing + ' \u2192 ATTRACT! \uD83E\uDDF2';
    result.style.color = 'var(--mint)';
  } else {
    // Repel (same)
    force.textContent = '\u2B05\uFE0F\u27A1\uFE0F';
    force.style.color = 'var(--error)';
    result.textContent = leftFacing + ' meets ' + rightFacing + ' \u2192 REPEL! \u274C';
    result.style.color = 'var(--coral)';
  }
}

// ===================== PLANT GROWTH SIM =====================

function renderPlantGrowthSim(card, q) {
  var html = '<div class="question-text">\uD83C\uDF31 Plant Growth Lab</div>';

  // Plant display
  html += '<div style="width:100%;max-width:280px;height:160px;margin:12px auto;position:relative;background:linear-gradient(to bottom, #87CEEB 0%, #87CEEB 60%, #8B4513 60%, #654321 100%);border-radius:16px;overflow:hidden" id="plant-sim">';

  // Sun toggle
  html += '<div id="plant-sun" style="position:absolute;top:10px;right:15px;font-size:28px;opacity:0.3;transition:opacity 0.3s;cursor:pointer" onclick="plantToggle(\'sun\')">\u2600\uFE0F</div>';

  // Rain toggle
  html += '<div id="plant-rain" style="position:absolute;top:10px;left:15px;font-size:28px;opacity:0.3;transition:opacity 0.3s;cursor:pointer" onclick="plantToggle(\'rain\')">\uD83D\uDCA7</div>';

  // Plant stages
  html += '<div id="plant-stage" style="position:absolute;bottom:35%;left:50%;transform:translateX(-50%);font-size:28px;transition:all 0.5s">\uD83C\uDF31</div>';

  // Soil indicator
  html += '<div id="plant-soil" style="position:absolute;bottom:8px;left:50%;transform:translateX(-50%);font-size:12px;color:rgba(255,255,255,0.6)">Soil \u2713</div>';

  html += '</div>';

  // Controls
  html += '<div style="display:flex;gap:10px;justify-content:center;margin:10px 0">';
  html += '<button class="answer-btn" style="font-size:14px;padding:8px 16px" onclick="plantToggle(\'sun\')">\u2600\uFE0F Sun</button>';
  html += '<button class="answer-btn" style="font-size:14px;padding:8px 16px" onclick="plantToggle(\'rain\')">\uD83D\uDCA7 Water</button>';
  html += '<button class="answer-btn" style="font-size:14px;padding:8px 16px" onclick="plantGrow()">\uD83C\uDF31 Grow!</button>';
  html += '</div>';

  html += '<div id="plant-message" style="font-size:14px;color:var(--text-secondary);min-height:24px;margin:4px 0">Toggle sun and water, then tap Grow!</div>';

  // Quiz
  html += '<div class="question-text" style="font-size:18px;margin-top:12px">' + q.text + '</div>';
  html += '<div class="answer-options" style="flex-direction:column;margin-top:8px">' + q.options.map(function(o) {
    return '<button class="answer-btn" onclick="checkAnswer(\'' + escSci(o) + '\', \'' + escSci(q.answer) + '\', this)" style="font-size:16px;text-align:left;width:100%">' + o + '</button>';
  }).join('') + '</div>';
  html += renderHintBtn(q.hint);
  card.innerHTML = html;
  card.dataset.plantSun = 'false';
  card.dataset.plantRain = 'false';
  card.dataset.plantStage = '0';
}

var PLANT_STAGES = ['\uD83C\uDF31', '\uD83C\uDF3F', '\uD83C\uDF3E', '\uD83C\uDF3B', '\uD83C\uDF38'];

function plantToggle(type) {
  var card = document.getElementById('question-card');
  if (type === 'sun') {
    var on = card.dataset.plantSun !== 'true';
    card.dataset.plantSun = String(on);
    var sunEl = document.getElementById('plant-sun');
    if (sunEl) sunEl.style.opacity = on ? '1' : '0.3';
  } else {
    var on2 = card.dataset.plantRain !== 'true';
    card.dataset.plantRain = String(on2);
    var rainEl = document.getElementById('plant-rain');
    if (rainEl) rainEl.style.opacity = on2 ? '1' : '0.3';
  }
}

function plantGrow() {
  var card = document.getElementById('question-card');
  var sun = card.dataset.plantSun === 'true';
  var rain = card.dataset.plantRain === 'true';
  var stage = parseInt(card.dataset.plantStage || '0');
  var msg = document.getElementById('plant-message');

  if (sun && rain) {
    if (stage < PLANT_STAGES.length - 1) {
      stage++;
      card.dataset.plantStage = String(stage);
      var plantEl = document.getElementById('plant-stage');
      if (plantEl) {
        plantEl.textContent = PLANT_STAGES[stage];
        plantEl.style.fontSize = (28 + stage * 6) + 'px';
      }
      if (msg) msg.textContent = 'Growing! Stage ' + (stage + 1) + ' of ' + PLANT_STAGES.length;
      if (stage >= PLANT_STAGES.length - 1 && msg) msg.textContent = '\uD83C\uDF89 Fully grown! Plants need sun + water + soil!';
    }
  } else if (!sun && !rain) {
    if (msg) msg.textContent = 'Nothing happened! The plant needs sun AND water.';
  } else if (!sun) {
    if (msg) msg.textContent = 'The plant has water but no sunlight. Turn on the sun!';
  } else {
    if (msg) msg.textContent = 'The plant has sunlight but no water. Add water!';
  }
}

// ===================== CIRCUIT BUILDER SIM =====================

function renderCircuitSim(card, q) {
  var html = '<div class="question-text">\u26A1 Circuit Lab</div>';

  html += '<div style="position:relative;width:100%;max-width:300px;height:200px;margin:12px auto;background:rgba(0,0,0,0.3);border-radius:16px;padding:16px" id="circuit-sim">';

  // Circuit path (visual representation)
  html += '<div style="display:flex;align-items:center;justify-content:center;gap:4px;flex-wrap:wrap">';

  // Battery
  html += '<div style="padding:8px 12px;background:rgba(255,200,0,0.2);border:2px solid var(--gold);border-radius:8px;font-size:24px;text-align:center">\uD83D\uDD0B<div style="font-size:10px;color:var(--gold)">Battery</div></div>';

  // Wire segment 1
  html += '<div style="width:30px;height:4px;background:var(--text-dim);margin:0 2px" id="circuit-wire1"></div>';

  // Switch
  html += '<div style="padding:8px 12px;background:rgba(255,255,255,0.05);border:2px solid var(--text-dim);border-radius:8px;font-size:20px;cursor:pointer;text-align:center;transition:all 0.3s" id="circuit-switch" onclick="circuitToggleSwitch()">';
  html += '<span id="circuit-switch-icon">\uD83D\uDD34</span>';
  html += '<div style="font-size:10px;color:var(--text-secondary)">Switch</div></div>';

  // Wire segment 2
  html += '<div style="width:30px;height:4px;background:var(--text-dim);margin:0 2px" id="circuit-wire2"></div>';

  // Bulb
  html += '<div style="padding:8px 12px;background:rgba(255,255,255,0.05);border:2px solid var(--text-dim);border-radius:8px;font-size:24px;text-align:center;transition:all 0.3s" id="circuit-bulb">';
  html += '<span id="circuit-bulb-icon">\uD83D\uDCA1</span>';
  html += '<div style="font-size:10px;color:var(--text-secondary)">Bulb</div></div>';

  html += '</div>';

  // Status
  html += '<div id="circuit-status" style="position:absolute;bottom:12px;left:50%;transform:translateX(-50%);font-size:14px;color:var(--text-secondary);white-space:nowrap">Circuit is OPEN \u2014 bulb is OFF</div>';

  html += '</div>';

  html += '<div style="font-size:14px;color:var(--text-secondary);margin:8px 0">Tap the switch to close/open the circuit!</div>';

  // Quiz
  html += '<div class="question-text" style="font-size:18px;margin-top:12px">' + q.text + '</div>';
  html += '<div class="answer-options" style="flex-direction:column;margin-top:8px">' + q.options.map(function(o) {
    return '<button class="answer-btn" onclick="checkAnswer(\'' + escSci(o) + '\', \'' + escSci(q.answer) + '\', this)" style="font-size:16px;text-align:left;width:100%">' + o + '</button>';
  }).join('') + '</div>';
  html += renderHintBtn(q.hint);
  card.innerHTML = html;
  card.dataset.circuitClosed = 'false';
}

function circuitToggleSwitch() {
  var card = document.getElementById('question-card');
  var closed = card.dataset.circuitClosed !== 'true';
  card.dataset.circuitClosed = String(closed);

  var switchEl = document.getElementById('circuit-switch');
  var switchIcon = document.getElementById('circuit-switch-icon');
  var bulb = document.getElementById('circuit-bulb');
  var bulbIcon = document.getElementById('circuit-bulb-icon');
  var wire1 = document.getElementById('circuit-wire1');
  var wire2 = document.getElementById('circuit-wire2');
  var status = document.getElementById('circuit-status');

  if (closed) {
    switchIcon.textContent = '\uD83D\uDFE2';
    switchEl.style.borderColor = 'var(--success)';
    bulb.style.borderColor = 'var(--gold)';
    bulb.style.background = 'rgba(255,255,0,0.2)';
    bulbIcon.textContent = '\uD83D\uDCA1';
    bulb.style.boxShadow = '0 0 20px rgba(255,255,0,0.4)';
    wire1.style.background = 'var(--gold)';
    wire2.style.background = 'var(--gold)';
    if (status) status.textContent = 'Circuit is CLOSED \u2014 bulb is ON! \u2728';
    status.style.color = 'var(--gold)';
  } else {
    switchIcon.textContent = '\uD83D\uDD34';
    switchEl.style.borderColor = 'var(--text-dim)';
    bulb.style.borderColor = 'var(--text-dim)';
    bulb.style.background = 'rgba(255,255,255,0.05)';
    bulbIcon.textContent = '\uD83D\uDCA1';
    bulb.style.boxShadow = 'none';
    wire1.style.background = 'var(--text-dim)';
    wire2.style.background = 'var(--text-dim)';
    if (status) status.textContent = 'Circuit is OPEN \u2014 bulb is OFF';
    status.style.color = 'var(--text-secondary)';
  }
}

// ===================== UTILITY =====================

function escSci(str) {
  return String(str).replace(/'/g, "\\'");
}
