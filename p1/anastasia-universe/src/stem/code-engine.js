// ============================================================
//  CODE ENGINE — Coding question generators & renderer
// ============================================================

function generateCodeQuestion(skillId) {
  var diff = getSkillDifficulty(skillId);
  switch (skillId) {
    case 'cseq':   return genCodeSeq(diff);
    case 'cloop':  return genCodeLoop(diff);
    case 'ccond':  return genCodeCond(diff);
    case 'cvar':   return genCodeVar(diff);
    case 'cdebug': return genCodeDebug(diff);
    default:       return null;
  }
}

// ===================== DATA =====================

var CODE_GRID_ICONS = {
  robot: '\uD83E\uDD16',
  star:  '\u2B50',
  gem:   '\uD83D\uDC8E',
  flag:  '\uD83C\uDFC1',
  tree:  '\uD83C\uDF33',
  wall:  '\uD83E\uDDF1',
  empty: '\u2B1C'
};

var CODE_DIRECTIONS = ['right', 'right', 'down', 'right', 'down'];

// ===================== GENERATORS =====================

function genCodeSeq(diff) {
  // Put steps in the correct order
  var tasks = [
    { steps: ['Pick up the brush', 'Dip it in paint', 'Paint the wall', 'Clean the brush'], task: 'Paint a wall' },
    { steps: ['Get the bread', 'Spread the butter', 'Add the jam', 'Eat the sandwich'], task: 'Make a sandwich' },
    { steps: ['Wake up', 'Brush your teeth', 'Eat breakfast', 'Go to school'], task: 'Morning routine' },
    { steps: ['Get a pot', 'Fill with water', 'Put on the stove', 'Wait for it to boil'], task: 'Boil water' },
    { steps: ['Open the book', 'Read the story', 'Close the book', 'Tell a friend about it'], task: 'Read a book' },
    { steps: ['Get the seeds', 'Dig a hole', 'Plant the seeds', 'Water the soil'], task: 'Plant seeds' }
  ];
  var task = pick(tasks);
  var scrambled = shuffle([].concat(task.steps));
  var safety = 0;
  while (scrambled.join(',') === task.steps.join(',') && safety < 10) {
    scrambled = shuffle([].concat(task.steps));
    safety++;
  }

  return {
    type: 'code-sequence',
    task: task.task,
    correctOrder: task.steps,
    scrambled: scrambled,
    answer: task.steps.join(' \u2192 '),
    hint: 'Think about what has to happen first, second, third, and last.'
  };
}

function genCodeLoop(diff) {
  var n = rand(2, diff.level >= 2 ? 5 : 3);
  var actions = [
    { action: 'clap', emoji: '\uD83D\uDC4F' },
    { action: 'jump', emoji: '\uD83E\uDD38' },
    { action: 'step forward', emoji: '\u27A1\uFE0F' },
    { action: 'spin', emoji: '\uD83C\uDF00' },
    { action: 'wave', emoji: '\uD83D\uDC4B' }
  ];
  var act = pick(actions);

  return {
    type: 'code-loop',
    action: act.action,
    emoji: act.emoji,
    repeat: n,
    answer: n,
    hint: 'A loop repeats an action. Count how many times ' + act.emoji + ' appears.'
  };
}

function genCodeCond(diff) {
  var scenarios = [
    { condition: 'it is raining', ifTrue: 'Take an umbrella', ifFalse: 'Wear sunglasses', question: 'It IS raining. What should you do?', answer: 'Take an umbrella' },
    { condition: 'the light is red', ifTrue: 'Stop and wait', ifFalse: 'Cross the road', question: 'The light IS red. What should you do?', answer: 'Stop and wait' },
    { condition: 'you are hungry', ifTrue: 'Eat a snack', ifFalse: 'Keep playing', question: 'You ARE hungry. What should you do?', answer: 'Eat a snack' },
    { condition: 'the door is locked', ifTrue: 'Use the key', ifFalse: 'Push the door open', question: 'The door IS locked. What should you do?', answer: 'Use the key' },
    { condition: 'it is bedtime', ifTrue: 'Go to sleep', ifFalse: 'Keep reading', question: 'It IS bedtime. What should you do?', answer: 'Go to sleep' },
    { condition: 'the water is hot', ifTrue: 'Wait for it to cool', ifFalse: 'Drink it now', question: 'The water IS hot. What should you do?', answer: 'Wait for it to cool' }
  ];
  var s = pick(scenarios);

  return {
    type: 'code-conditional',
    condition: s.condition,
    ifTrue: s.ifTrue,
    ifFalse: s.ifFalse,
    questionText: s.question,
    options: shuffle([s.ifTrue, s.ifFalse]),
    answer: s.answer,
    hint: 'Read the IF condition. Is it true or false? Follow the correct path.'
  };
}

function genCodeVar(diff) {
  var varName = pick(['score', 'apples', 'stars', 'coins', 'lives']);
  var startVal = rand(1, 10);
  var ops = [];
  var steps = rand(2, diff.level >= 2 ? 4 : 3);
  var current = startVal;

  for (var i = 0; i < steps; i++) {
    if (Math.random() < 0.6 || current <= 1) {
      var add = rand(1, 5);
      ops.push({ op: 'add', val: add, text: varName + ' = ' + varName + ' + ' + add });
      current += add;
    } else {
      var sub = rand(1, Math.min(current - 1, 5));
      ops.push({ op: 'sub', val: sub, text: varName + ' = ' + varName + ' - ' + sub });
      current -= sub;
    }
  }

  return {
    type: 'code-variable',
    varName: varName,
    startVal: startVal,
    operations: ops,
    answer: current,
    hint: 'Start with ' + varName + ' = ' + startVal + '. Follow each step one by one.'
  };
}

function genCodeDebug(diff) {
  var bugs = [
    {
      code: ['1. Get a cup', '2. Pour milk', '3. Drink from the plate', '4. Put cup away'],
      bugLine: 2,
      bugText: 'Drink from the plate',
      fixText: 'Drink from the cup',
      task: 'Pour and drink milk'
    },
    {
      code: ['1. Put on socks', '2. Put on shoes', '3. Put on shirt', '4. Go outside'],
      bugLine: 2,
      bugText: 'Put on shirt',
      fixText: 'Tie shoelaces',
      task: 'Get dressed for shoes'
    },
    {
      code: ['1. Open the fridge', '2. Take out an egg', '3. Throw egg on floor', '4. Eat breakfast'],
      bugLine: 2,
      bugText: 'Throw egg on floor',
      fixText: 'Cook the egg',
      task: 'Make breakfast'
    },
    {
      code: ['1. Pick up toothbrush', '2. Squeeze shampoo on it', '3. Brush teeth', '4. Rinse mouth'],
      bugLine: 1,
      bugText: 'Squeeze shampoo on it',
      fixText: 'Squeeze toothpaste on it',
      task: 'Brush your teeth'
    },
    {
      code: ['1. Fill kettle with sand', '2. Turn on the kettle', '3. Wait for it to boil', '4. Pour hot water'],
      bugLine: 0,
      bugText: 'Fill kettle with sand',
      fixText: 'Fill kettle with water',
      task: 'Boil water'
    }
  ];
  var bug = pick(bugs);

  return {
    type: 'code-debug',
    task: bug.task,
    code: bug.code,
    bugLine: bug.bugLine,
    bugText: bug.bugText,
    fixText: bug.fixText,
    options: shuffle(bug.code.map(function(line) { return line; })),
    answer: bug.code[bug.bugLine],
    hint: 'Read each step carefully. Which one does NOT make sense for the task?'
  };
}

// ===================== RENDERER =====================

function renderCodeQuestion(card, q) {
  switch (q.type) {
    case 'code-sequence':    renderCodeSequence(card, q); return true;
    case 'code-loop':        renderCodeLoop(card, q); return true;
    case 'code-conditional': renderCodeConditional(card, q); return true;
    case 'code-variable':    renderCodeVariable(card, q); return true;
    case 'code-debug':       renderCodeDebug(card, q); return true;
    default: return false;
  }
}

function renderCodeSequence(card, q) {
  var html = '<div class="question-text">\uD83E\uDD16 Task: ' + q.task + '</div>';
  html += '<div style="font-size:15px;color:var(--text-secondary);margin-bottom:12px">Put these steps in order!</div>';
  html += '<div id="code-result" style="min-height:48px;padding:12px;background:rgba(255,255,255,0.05);border-radius:12px;margin:8px 0;display:flex;flex-direction:column;gap:6px"></div>';
  html += '<div id="code-bank" style="display:flex;flex-direction:column;gap:6px;margin:8px 0">';
  q.scrambled.forEach(function(step, i) {
    html += '<button class="answer-btn" style="font-size:16px;text-align:left;width:100%" onclick="codeStepClick(this)">' + step + '</button>';
  });
  html += '</div>';
  html += '<button class="submit-btn mt-2" onclick="checkCodeSequence()">Run Code \u25B6</button>';
  html += renderHintBtn(q.hint);
  card.innerHTML = html;
  card.dataset.codeAnswer = q.correctOrder.join(' \u2192 ');
}

function renderCodeLoop(card, q) {
  var html = '<div class="question-text">\uD83D\uDD01 What does this loop do?</div>';
  html += '<div style="background:rgba(0,0,0,0.3);border-radius:12px;padding:16px;margin:12px 0;font-family:monospace;font-size:18px;text-align:left">';
  html += '<div style="color:var(--sky)">repeat ' + q.repeat + ' times:</div>';
  html += '<div style="margin-left:20px;color:var(--mint)">' + q.emoji + ' ' + q.action + '</div>';
  html += '</div>';
  html += '<div style="font-size:18px;margin:12px 0">How many times will the robot <strong>' + q.action + '</strong>?</div>';
  var options = generateMCQOptions(q.answer, 1, q.answer + 3, 4);
  html += '<div class="answer-options">' + options.map(function(o) {
    return '<button class="answer-btn" onclick="checkAnswer(' + o + ', ' + q.answer + ', this)" style="font-size:22px">' + o + '</button>';
  }).join('') + '</div>';
  html += renderHintBtn(q.hint);
  card.innerHTML = html;
}

function renderCodeConditional(card, q) {
  var html = '<div class="question-text">\uD83D\uDD00 Follow the code!</div>';
  html += '<div style="background:rgba(0,0,0,0.3);border-radius:12px;padding:16px;margin:12px 0;font-family:monospace;font-size:16px;text-align:left">';
  html += '<div style="color:var(--sky)">IF ' + q.condition + ':</div>';
  html += '<div style="margin-left:20px;color:var(--mint)">\u2192 ' + q.ifTrue + '</div>';
  html += '<div style="color:var(--coral)">ELSE:</div>';
  html += '<div style="margin-left:20px;color:var(--mint)">\u2192 ' + q.ifFalse + '</div>';
  html += '</div>';
  html += '<div class="question-text" style="font-size:18px">' + q.questionText + '</div>';
  html += '<div class="answer-options">' + q.options.map(function(o) {
    var escaped = String(o).replace(/'/g, "\\'");
    var ansEscaped = String(q.answer).replace(/'/g, "\\'");
    return '<button class="answer-btn" onclick="checkAnswer(\'' + escaped + '\', \'' + ansEscaped + '\', this)" style="font-size:18px">' + o + '</button>';
  }).join('') + '</div>';
  html += renderHintBtn(q.hint);
  card.innerHTML = html;
}

function renderCodeVariable(card, q) {
  var html = '<div class="question-text">\uD83D\uDCE6 Trace the code!</div>';
  html += '<div style="background:rgba(0,0,0,0.3);border-radius:12px;padding:16px;margin:12px 0;font-family:monospace;font-size:16px;text-align:left">';
  html += '<div style="color:var(--gold)">' + q.varName + ' = ' + q.startVal + '</div>';
  q.operations.forEach(function(op) {
    html += '<div style="color:var(--mint)">' + op.text + '</div>';
  });
  html += '</div>';
  html += '<div class="question-text" style="font-size:18px">What is <strong>' + q.varName + '</strong> at the end?</div>';
  var options = generateMCQOptions(q.answer, Math.max(0, q.answer - 3), q.answer + 4, 4);
  html += '<div class="answer-options">' + options.map(function(o) {
    return '<button class="answer-btn" onclick="checkAnswer(' + o + ', ' + q.answer + ', this)" style="font-size:24px">' + o + '</button>';
  }).join('') + '</div>';
  html += renderHintBtn(q.hint);
  card.innerHTML = html;
}

function renderCodeDebug(card, q) {
  var html = '<div class="question-text">\uD83D\uDC1B Find the bug!</div>';
  html += '<div style="font-size:16px;color:var(--text-secondary);margin-bottom:8px">Task: ' + q.task + '</div>';
  html += '<div style="background:rgba(0,0,0,0.3);border-radius:12px;padding:16px;margin:12px 0;font-family:monospace;font-size:16px;text-align:left">';
  q.code.forEach(function(line) {
    html += '<div style="color:var(--mint);padding:4px 0">' + line + '</div>';
  });
  html += '</div>';
  html += '<div style="font-size:16px;margin:8px 0">Which step has the bug?</div>';
  html += '<div class="answer-options" style="flex-direction:column">' + q.options.map(function(o) {
    var escaped = String(o).replace(/'/g, "\\'");
    var ansEscaped = String(q.answer).replace(/'/g, "\\'");
    return '<button class="answer-btn" onclick="checkAnswer(\'' + escaped + '\', \'' + ansEscaped + '\', this)" style="font-size:14px;text-align:left;width:100%">' + o + '</button>';
  }).join('') + '</div>';
  html += renderHintBtn(q.hint);
  card.innerHTML = html;
}

// ===================== CODE HELPERS =====================

function codeStepClick(btn) {
  var result = document.getElementById('code-result');
  var bank = document.getElementById('code-bank');
  if (!result || !bank) return;

  if (btn.parentElement.id === 'code-bank') {
    btn.remove();
    var tag = document.createElement('button');
    tag.className = 'answer-btn';
    tag.style.cssText = 'font-size:16px;text-align:left;width:100%;cursor:pointer';
    tag.textContent = btn.textContent;
    tag.setAttribute('onclick', 'codeStepReturn(this)');
    result.appendChild(tag);
  }
}

function codeStepReturn(btn) {
  var bank = document.getElementById('code-bank');
  if (!bank) return;
  btn.remove();
  var tag = document.createElement('button');
  tag.className = 'answer-btn';
  tag.style.cssText = 'font-size:16px;text-align:left;width:100%;cursor:grab';
  tag.textContent = btn.textContent;
  tag.setAttribute('onclick', 'codeStepClick(this)');
  bank.appendChild(tag);
}

function checkCodeSequence() {
  var result = document.getElementById('code-result');
  var card = document.getElementById('question-card');
  if (!result || !card) return;
  var steps = [];
  result.querySelectorAll('.answer-btn').forEach(function(b) { steps.push(b.textContent); });
  var built = steps.join(' \u2192 ');
  var expected = card.dataset.codeAnswer;
  if (built === expected) {
    handleCorrect();
  } else {
    handleWrong(expected);
  }
}
