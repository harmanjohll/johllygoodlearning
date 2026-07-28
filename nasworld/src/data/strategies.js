// ============================================================
//  STRATEGY LIBRARY — Study strategies for a P1 learner.
//  Each strategy has a "try this now" action.
// ============================================================

var STRATEGIES = [
  {
    id: 'feynman',
    title: 'Teach it back',
    emoji: '🧑‍🏫',
    blurb: 'If you can explain it to Lumi in your own words, you really know it. If you stumble, that is the bit to relearn.',
    tryAction: 'lumi-tap',
    tryLabel: 'Tell Lumi what you just learned'
  },
  {
    id: 'retrieve',
    title: 'Cover it up',
    emoji: '🙈',
    blurb: 'Close your eyes. What do you remember? Then peek. Recalling is much better for memory than re-reading.',
    tryAction: 'flashcards',
    tryLabel: 'Try the flashcards instead of the lesson'
  },
  {
    id: 'interleave',
    title: 'Mix it up',
    emoji: '🧩',
    blurb: 'Do not spend a whole session on one topic. Mix two or three. Your brain learns more when it has to switch.',
    tryAction: 'mega-map',
    tryLabel: 'Pick two worlds today on the Mega Map'
  },
  {
    id: 'space',
    title: 'Sprinkle, do not pour',
    emoji: '💧',
    blurb: 'Five short sessions across the week beats one long one. Your brain glues things together overnight.',
    tryAction: 'compass',
    tryLabel: 'Open Compass for a tiny session'
  },
  {
    id: 'sleep',
    title: 'Sleep on it',
    emoji: '💤',
    blurb: 'Eight hours tonight does more for tomorrow than one extra hour now. Reading before bed locks in the new word.',
    tryAction: 'home',
    tryLabel: 'Tuck in early tonight — promise?'
  },
  {
    id: 'two-minute',
    title: 'The two-minute trick',
    emoji: '⏱️',
    blurb: 'If starting feels hard, promise yourself just two minutes. You can always stop after. (Spoiler: you usually do not stop.)',
    tryAction: 'pomodoro',
    tryLabel: 'Start a 2-minute timer'
  },
  {
    id: 'mistakes',
    title: 'Hug your mistakes',
    emoji: '🤗',
    blurb: 'Wrong answers grow your brain faster than easy right ones. When you get one wrong, that is the bit your brain is growing.',
    tryAction: 'home',
    tryLabel: 'Pick a tricky skill on purpose'
  },
  {
    id: 'why',
    title: 'Find the why',
    emoji: '🔎',
    blurb: 'When you learn something new, ask: where would I use this? At the hawker centre? In a game? In a story?',
    tryAction: 'mega-map',
    tryLabel: 'See where today\'s skill fits on the Mega Map'
  },
  {
    id: 'wiggle',
    title: 'Wiggle then think',
    emoji: '🤸',
    blurb: 'Stuck on a question? Stand up. Wiggle for 10 seconds. Sit down. Try again. The brain loves a tiny break.',
    tryAction: 'pomodoro',
    tryLabel: 'Set a Pomodoro — built-in wiggle breaks'
  },
  {
    id: 'one-sentence',
    title: 'One-sentence summary',
    emoji: '📝',
    blurb: 'After every lesson, say one sentence out loud about what you learned. Trim until it fits. That trimming is learning.',
    tryAction: 'home',
    tryLabel: 'Try this after your next lesson'
  }
];

function renderStrategyLibrary() {
  var container = document.getElementById('strategies-content');
  if (!container) return;

  var html = '<button class="back-btn" onclick="showScreen(\'home\')">← Back to Home</button>';
  html += '<div class="strategies-shell">';
  html += '<div class="strategies-intro">Tricks the cleverest learners use. Pick one a week — they get easier with practice.</div>';
  html += '<div class="strategies-grid">';
  STRATEGIES.forEach(function(s) {
    html += '<div class="strategy-card">';
    html += '<div class="strategy-card-emoji">' + s.emoji + '</div>';
    html += '<div class="strategy-card-title">' + s.title + '</div>';
    html += '<div class="strategy-card-blurb">' + s.blurb + '</div>';
    html += '<button class="strategy-card-try" onclick="strategyTry(\'' + s.id + '\')">Try this now →</button>';
    html += '</div>';
  });
  html += '</div></div>';
  container.innerHTML = html;
}

function strategyTry(id) {
  var s = STRATEGIES.find(function(x) { return x.id === id; });
  if (!s) return;
  switch (s.tryAction) {
    case 'lumi-tap':
      showScreen('home');
      setTimeout(function() { if (typeof lumiSpeak === 'function') lumiSpeak(); }, 300);
      break;
    case 'flashcards':
    case 'home':
      showScreen('home');
      break;
    case 'mega-map':
      showScreen('mega-map');
      break;
    case 'compass':
      showScreen('compass');
      break;
    case 'pomodoro':
      if (typeof startPomodoro === 'function') startPomodoro(id === 'two-minute' ? 2 : 10);
      break;
  }
}

window.renderStrategyLibrary = renderStrategyLibrary;
window.strategyTry = strategyTry;
