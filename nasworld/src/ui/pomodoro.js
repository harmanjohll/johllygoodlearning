// ============================================================
//  POMODORO — Tiny session timer.
//  Defaults to 10 minutes on, 3 minutes off (P1-appropriate).
//  Soft chime warning at -60 seconds. Auto-advance.
// ============================================================

var POMO_DEFAULT_ON = 10;
var POMO_DEFAULT_OFF = 3;
var POMO_BREAK_TIPS = [
  'Stand up. Wiggle your fingers. Touch your toes.',
  'Take a sip of water. Big sip.',
  'Look out the window for 20 seconds. Count three things you can see.',
  'Stretch like a cat. Then like a snake.',
  'Do 5 jumping jacks. Or 10 if you are feeling extra.',
  'Tell someone in the house something you learned today.',
  'Blink slowly five times. Eye yoga.',
  'Take three big slow breaths in through the nose, out through the mouth.'
];

var pomoState = {
  running: false,
  mode: 'on',          // 'on' or 'break'
  remaining: 0,
  total: 0,
  intervalId: null,
  warned: false
};

function _ensurePomoUI() {
  if (document.getElementById('pomo-widget')) return;
  var w = document.createElement('div');
  w.id = 'pomo-widget';
  w.className = 'pomo-widget hidden';
  w.innerHTML =
    '<div class="pomo-ring"><div class="pomo-time" id="pomo-time">10:00</div></div>' +
    '<div class="pomo-mode" id="pomo-mode">Focus</div>' +
    '<div class="pomo-controls">' +
      '<button class="pomo-btn" id="pomo-toggle">⏸</button>' +
      '<button class="pomo-btn" id="pomo-close">✕</button>' +
    '</div>';
  document.body.appendChild(w);
  document.getElementById('pomo-toggle').onclick = togglePomodoro;
  document.getElementById('pomo-close').onclick = stopPomodoro;
}

function _format(sec) {
  var m = Math.floor(sec / 60);
  var s = sec % 60;
  return m + ':' + (s < 10 ? '0' + s : s);
}

function _tickPomodoro() {
  if (!pomoState.running) return;
  pomoState.remaining--;
  document.getElementById('pomo-time').textContent = _format(pomoState.remaining);

  if (pomoState.remaining === 60 && !pomoState.warned && pomoState.mode === 'on') {
    pomoState.warned = true;
    if (typeof lumiSay === 'function') lumiSay('One minute left. Wrapping up time.');
    if (typeof playSound === 'function') playSound('click');
  }
  if (pomoState.remaining <= 0) {
    _advancePomodoro();
  }
}

function _advancePomodoro() {
  if (pomoState.mode === 'on') {
    pomoState.mode = 'break';
    pomoState.remaining = POMO_DEFAULT_OFF * 60;
    pomoState.total = pomoState.remaining;
    pomoState.warned = false;
    document.getElementById('pomo-mode').textContent = 'Break';
    document.getElementById('pomo-widget').classList.add('break');
    var tip = (typeof pick === 'function') ? pick(POMO_BREAK_TIPS) : POMO_BREAK_TIPS[0];
    if (typeof lumiSay === 'function') lumiSay('Break! ' + tip);
    if (typeof playSound === 'function') playSound('levelup');
  } else {
    pomoState.mode = 'on';
    pomoState.remaining = POMO_DEFAULT_ON * 60;
    pomoState.total = pomoState.remaining;
    pomoState.warned = false;
    document.getElementById('pomo-mode').textContent = 'Focus';
    document.getElementById('pomo-widget').classList.remove('break');
    if (typeof lumiSay === 'function') lumiSay('Back to it. You can do this.');
  }
}

function startPomodoro(minutes) {
  _ensurePomoUI();
  pomoState.running = true;
  pomoState.mode = 'on';
  pomoState.warned = false;
  pomoState.remaining = (minutes || POMO_DEFAULT_ON) * 60;
  pomoState.total = pomoState.remaining;
  document.getElementById('pomo-mode').textContent = 'Focus';
  document.getElementById('pomo-time').textContent = _format(pomoState.remaining);
  document.getElementById('pomo-widget').classList.remove('hidden');
  document.getElementById('pomo-widget').classList.remove('break');
  document.getElementById('pomo-toggle').textContent = '⏸';
  if (pomoState.intervalId) clearInterval(pomoState.intervalId);
  pomoState.intervalId = setInterval(_tickPomodoro, 1000);
}

function togglePomodoro() {
  pomoState.running = !pomoState.running;
  var btn = document.getElementById('pomo-toggle');
  if (btn) btn.textContent = pomoState.running ? '⏸' : '▶';
}

function stopPomodoro() {
  pomoState.running = false;
  if (pomoState.intervalId) clearInterval(pomoState.intervalId);
  pomoState.intervalId = null;
  var w = document.getElementById('pomo-widget');
  if (w) w.classList.add('hidden');
}

function startPomodoroForCompass(minutes) {
  startPomodoro(minutes || POMO_DEFAULT_ON);
}

window.startPomodoro = startPomodoro;
window.startPomodoroForCompass = startPomodoroForCompass;
window.togglePomodoro = togglePomodoro;
window.stopPomodoro = stopPomodoro;
