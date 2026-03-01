// ============================================================
//  LUMI — Personality engine, story arcs, emotional responses
// ============================================================

// Lumi's mood affects expressions and dialogue
var lumiState = {
  mood: 'happy',       // happy, excited, proud, concerned, sleepy
  tapCount: 0,
  lastMoodChange: 0,
  storyChapter: 0,     // 0 = not started, 1-5 = chapters
  storyShownToday: false
};

// === MOOD SYSTEM ===
var LUMI_MOODS = {
  happy:     { mouth: 'smile',  eyes: 'normal',  sparkle: true,  color: '' },
  excited:   { mouth: 'grin',   eyes: 'wide',    sparkle: true,  color: 'excited' },
  proud:     { mouth: 'smile',  eyes: 'happy',   sparkle: true,  color: 'proud' },
  concerned: { mouth: 'worry',  eyes: 'normal',  sparkle: false, color: 'concerned' },
  sleepy:    { mouth: 'sleep',  eyes: 'sleepy',  sparkle: false, color: 'sleepy' }
};

function setLumiMood(mood) {
  if (!LUMI_MOODS[mood]) return;
  lumiState.mood = mood;
  lumiState.lastMoodChange = Date.now();
  applyLumiMood();
}

function applyLumiMood() {
  var body = document.querySelector('.lumi-body');
  if (!body) return;
  var mood = LUMI_MOODS[lumiState.mood] || LUMI_MOODS.happy;

  // Remove old mood classes
  body.className = 'lumi-body';
  if (mood.color) body.classList.add('lumi-mood-' + mood.color);

  // Mouth expression
  var mouth = body.querySelector('.lumi-mouth');
  if (mouth) {
    mouth.className = 'lumi-mouth';
    mouth.classList.add('lumi-mouth-' + mood.mouth);
  }

  // Eyes
  var eyes = body.querySelectorAll('.lumi-eye');
  eyes.forEach(function(eye) {
    eye.className = eye.className.replace(/lumi-eye-\w+/g, '').trim();
    if (mood.eyes !== 'normal') eye.classList.add('lumi-eye-' + mood.eyes);
  });

  // Sparkles
  var sparkles = document.querySelectorAll('.lumi-sparkle');
  sparkles.forEach(function(s) {
    s.style.display = mood.sparkle ? '' : 'none';
  });
}

// === CONTEXT-AWARE DIALOGUE ===

// Lumi responds to what just happened
function lumiReactTo(event, data) {
  var msg = '';
  var mood = 'happy';

  switch (event) {
    case 'correct':
      mood = 'excited';
      if (state.streak >= 10) {
        msg = pick(LUMI_REACTIONS.bigStreak);
      } else if (state.streak >= 5) {
        msg = pick(LUMI_REACTIONS.streak);
      } else {
        msg = pick(LUMI_REACTIONS.correct);
      }
      break;

    case 'wrong':
      mood = 'concerned';
      msg = pick(LUMI_REACTIONS.wrong);
      break;

    case 'levelUp':
      mood = 'excited';
      msg = pick(LUMI_REACTIONS.levelUp).replace('{level}', LEVEL_NAMES[state.level] || 'a new level');
      break;

    case 'quizComplete':
      var pct = data && data.pct || 0;
      if (pct >= 90) {
        mood = 'proud';
        msg = pick(LUMI_REACTIONS.quizAmazing);
      } else if (pct >= 70) {
        mood = 'happy';
        msg = pick(LUMI_REACTIONS.quizGood);
      } else {
        mood = 'concerned';
        msg = pick(LUMI_REACTIONS.quizTryAgain);
      }
      break;

    case 'lessonComplete':
      mood = 'proud';
      msg = pick(LUMI_REACTIONS.lessonDone);
      break;

    case 'achievementUnlocked':
      mood = 'excited';
      msg = pick(LUMI_REACTIONS.achievement).replace('{name}', data && data.name || 'something special');
      break;

    case 'returnVisit':
      mood = 'happy';
      var hour = new Date().getHours();
      if (hour < 7) {
        mood = 'sleepy';
        msg = pick(LUMI_REACTIONS.earlyMorning);
      } else if (hour < 12) {
        msg = pick(LUMI_REACTIONS.morning);
      } else if (hour < 17) {
        msg = pick(LUMI_REACTIONS.afternoon);
      } else if (hour < 21) {
        msg = pick(LUMI_REACTIONS.evening);
      } else {
        mood = 'sleepy';
        msg = pick(LUMI_REACTIONS.lateNight);
      }
      break;

    case 'comeBack':
      mood = 'excited';
      msg = pick(LUMI_REACTIONS.comeBack);
      break;

    case 'firstVisitToday':
      mood = 'happy';
      msg = pick(LUMI_REACTIONS.firstToday);
      break;

    case 'questComplete':
      mood = 'excited';
      msg = pick(LUMI_REACTIONS.questDone);
      break;

    case 'gardenGrow':
      mood = 'proud';
      msg = pick(LUMI_REACTIONS.gardenGrow);
      break;
  }

  if (msg) {
    setLumiMood(mood);
    lumiSay(msg);
    // Mood fades back to happy after 8 seconds
    setTimeout(function() { setLumiMood('happy'); }, 8000);
  }
}

var LUMI_REACTIONS = {
  correct: [
    "That's right! You're so clever!",
    "YES! Your brain is amazing!",
    "Nailed it! Keep going!",
    "Woohoo! I knew you could do it!",
    "Brilliant thinking, Anastasia!"
  ],
  streak: [
    "You're on a ROLL! " + state.streak + " in a row!",
    "Wow, nothing can stop you!",
    "Your brain is ON FIRE today!",
    "Look at that streak! Incredible!"
  ],
  bigStreak: [
    "TEN IN A ROW?! You're a LEGEND!",
    "I can barely keep up with you!",
    "Stop — you're making me dizzy with excitement!",
    "This is the best streak I've EVER seen!"
  ],
  wrong: [
    "Hmm, not quite — but that's how brains grow!",
    "Mistakes are brain food! Let's try another!",
    "Oops! But I love that you tried!",
    "Your brain just got a tiny bit stronger!",
    "That's okay! Even stars wobble sometimes!"
  ],
  levelUp: [
    "OH WOW! You reached {level}! I'm so proud!",
    "LEVEL UP! {level}! You're shining brighter!",
    "{level}! This calls for a celebration!"
  ],
  quizAmazing: [
    "INCREDIBLE! That was almost perfect!",
    "I am SO proud of you right now!",
    "You absolutely CRUSHED that quiz!",
    "Is there anything you CAN'T do?!"
  ],
  quizGood: [
    "Great job! You really know your stuff!",
    "Solid work! Your brain is getting stronger!",
    "Nice! You're improving every time!"
  ],
  quizTryAgain: [
    "That was tough! But every try makes you better!",
    "Don't worry — even I get tricky ones wrong!",
    "Practice makes progress! Want to try again?"
  ],
  lessonDone: [
    "You just learned something new! How cool is that?",
    "Another lesson done! Your brain is growing!",
    "Look at you, learning like a superstar!",
    "Knowledge unlocked! I love watching you learn!"
  ],
  achievement: [
    "ACHIEVEMENT UNLOCKED: {name}! You're amazing!",
    "Wow! You earned {name}! I'm so impressed!",
    "Look what you did! {name}! Incredible!"
  ],
  earlyMorning: [
    "*yawn* You're up early, Anastasia! Let's learn while the world sleeps!",
    "Wow, you're an early bird! I'm still waking up...",
    "Good moooorning! *stretches* Ready for some brain warmups?"
  ],
  morning: [
    "Good morning, Anastasia! Your brain is fresh and ready!",
    "Rise and shine! What shall we learn today?",
    "Morning! I've been waiting for you! Let's go!",
    "Hello sunshine! Ready for an adventure?"
  ],
  afternoon: [
    "Good afternoon! Perfect time for some learning!",
    "Hey Anastasia! How about a brain workout?",
    "Afternoon brain boost! Let's do this!",
    "Welcome back! Your garden missed you!"
  ],
  evening: [
    "Good evening! Time for some relaxed learning!",
    "Evening study session! My favourite time!",
    "Hi Anastasia! Let's end the day with some fun learning!",
    "The stars are coming out — just like YOUR star potential!"
  ],
  lateNight: [
    "*yawn* Isn't it past your bedtime? Just a quick session then!",
    "A night owl! Just like me! Let's do something fun!",
    "Shh... quiet learning time! Our little secret!"
  ],
  comeBack: [
    "You're BACK! I missed you so much!",
    "Anastasia! It's been a while — I saved your place!",
    "Welcome back! Your garden has been waiting!",
    "I'm so happy to see you again! Let's pick up where we left off!"
  ],
  firstToday: [
    "Welcome back today! Ready for an awesome session?",
    "Hey! Great to see you again today!",
    "Back for more? I love your dedication!"
  ],
  questDone: [
    "QUEST COMPLETE! You're on a mission today!",
    "Done already?! You're AMAZING!",
    "Quest conquered! What's next, champion?"
  ],
  gardenGrow: [
    "A new flower! Your garden is getting so beautiful!",
    "Look! Your garden is growing! Just like your brain!",
    "Another bloom! Keep it up — paradise incoming!"
  ]
};

// === LUMI TAP INTERACTIONS ===
var LUMI_TAP_RESPONSES = [
  { maxTaps: 1, responses: ["Hi! Tap me again!", "Hey there! What's up?", "Let's learn something cool!"] },
  { maxTaps: 3, responses: ["Hehe, that tickles!", "Again! Again!", "You're funny!"] },
  { maxTaps: 5, responses: ["Okay okay, I'm awake!", "So many taps! My sparkles are going crazy!", "You really like tapping me, huh?"] },
  { maxTaps: 8, responses: ["I'm getting dizzy!", "Please... my sparkles need a break!", "Are you trying to break my tap record?!"] },
  { maxTaps: 15, responses: ["OKAY that's a LOT of taps!", "My sparkle meter is OVERLOADING!", "You've discovered my secret tickle spot!"] }
];

function lumiTapped() {
  lumiState.tapCount++;

  if (typeof checkLumiTapAchievement === 'function') {
    checkLumiTapAchievement();
  }

  // Find response tier
  var tier = LUMI_TAP_RESPONSES[0];
  for (var i = LUMI_TAP_RESPONSES.length - 1; i >= 0; i--) {
    if (lumiState.tapCount >= LUMI_TAP_RESPONSES[i].maxTaps) {
      tier = LUMI_TAP_RESPONSES[i];
      break;
    }
  }

  var msg = pick(tier.responses);
  setLumiMood(lumiState.tapCount > 8 ? 'excited' : 'happy');
  lumiSay(msg);
  if (typeof playSound === 'function') playSound('click');

  // Reset tap counter after 5 seconds of no taps
  clearTimeout(lumiState._tapTimer);
  lumiState._tapTimer = setTimeout(function() {
    lumiState.tapCount = 0;
    setLumiMood('happy');
  }, 5000);
}

// === STORY ARC: "Help Lumi Build the Star Bridge" ===
var LUMI_STORY = [
  {
    chapter: 1,
    title: "The Broken Star Bridge",
    unlockFlowers: 0,
    intro: "Anastasia, I need your help! The Star Bridge that connects all the learning worlds is broken! " +
           "Long ago, it shimmered with the light of knowledge... but its stars scattered across the worlds. " +
           "Every time you learn something new, you help me find a star to rebuild it!",
    milestone: "You found the first star! The bridge glimmers faintly...",
    icon: "\uD83C\uDF09"
  },
  {
    chapter: 2,
    title: "The Number Stars",
    unlockFlowers: 5,
    intro: "Look! The Number World stars are beginning to glow! " +
           "The bridge needs stars from all three worlds to be complete. " +
           "Keep learning in Number World and the math stars will light the way!",
    milestone: "The Number World section of the bridge is shining!",
    icon: "\uD83D\uDD22"
  },
  {
    chapter: 3,
    title: "The Word Stars",
    unlockFlowers: 12,
    intro: "The Word Stars are calling! Every word you learn, every story you read, " +
           "sends a new light up to the bridge. I can almost see the words dancing across it!",
    milestone: "Beautiful! The Word Stars illuminate the bridge with stories!",
    icon: "\uD83D\uDCDA"
  },
  {
    chapter: 4,
    title: "The STEM Stars",
    unlockFlowers: 20,
    intro: "We're getting close! The STEM Stars are the trickiest — they need experiments " +
           "and discoveries to shine. But I believe in you, Anastasia. You're the brightest " +
           "learner I've ever met!",
    milestone: "The STEM Stars flash like lightning! The bridge is almost complete!",
    icon: "\uD83D\uDD2C"
  },
  {
    chapter: 5,
    title: "The Complete Star Bridge",
    unlockFlowers: 30,
    intro: "ANASTASIA! LOOK! The Star Bridge is COMPLETE! All three worlds are connected " +
           "by YOUR knowledge and YOUR hard work! Every lesson, every quiz, every discovery " +
           "— they all led to this moment. I am SO proud of you!",
    milestone: "The Star Bridge shines forever, powered by everything you've learned!",
    icon: "\uD83C\uDF1F"
  }
];

function checkStoryProgress() {
  var flowers = state.garden ? state.garden.length : 0;

  // Find current chapter
  var currentChapter = 0;
  for (var i = LUMI_STORY.length - 1; i >= 0; i--) {
    if (flowers >= LUMI_STORY[i].unlockFlowers) {
      currentChapter = i + 1;
      break;
    }
  }

  // Check if new chapter unlocked
  if (!state.lumiStory) state.lumiStory = { chapter: 0, shownChapters: [] };

  if (currentChapter > state.lumiStory.chapter) {
    state.lumiStory.chapter = currentChapter;
    saveState();
    return currentChapter; // New chapter!
  }
  return 0; // No new chapter
}

function showStoryChapter(chapterNum) {
  if (chapterNum < 1 || chapterNum > LUMI_STORY.length) return;

  var ch = LUMI_STORY[chapterNum - 1];
  if (!state.lumiStory) state.lumiStory = { chapter: 0, shownChapters: [] };

  // Mark as shown
  if (state.lumiStory.shownChapters.indexOf(chapterNum) === -1) {
    state.lumiStory.shownChapters.push(chapterNum);
    saveState();
  }

  // Show story overlay
  var overlay = document.getElementById('story-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'story-overlay';
    overlay.className = 'story-overlay';
    document.body.appendChild(overlay);
  }

  overlay.innerHTML =
    '<div class="story-card">' +
      '<div class="story-chapter-badge">Chapter ' + chapterNum + '</div>' +
      '<div class="story-icon">' + ch.icon + '</div>' +
      '<div class="story-title">' + ch.title + '</div>' +
      '<div class="story-text">' + ch.intro + '</div>' +
      '<div class="story-bridge">' + renderStoryBridge(chapterNum) + '</div>' +
      '<button class="lesson-btn lesson-btn-done" onclick="closeStoryOverlay()">Continue \u2192</button>' +
    '</div>';

  overlay.classList.add('show');
  setLumiMood('excited');

  if (typeof playSound === 'function') playSound('escape');
}

function closeStoryOverlay() {
  var overlay = document.getElementById('story-overlay');
  if (overlay) overlay.classList.remove('show');
}

// Render a mini star bridge progress visual
function renderStoryBridge(currentChapter) {
  var html = '<div class="story-bridge-row">';
  for (var i = 1; i <= 5; i++) {
    var lit = i <= currentChapter;
    html += '<div class="story-bridge-star ' + (lit ? 'lit' : '') + '">' +
      (lit ? '\u2B50' : '\u2606') + '</div>';
    if (i < 5) html += '<div class="story-bridge-link ' + (lit ? 'lit' : '') + '"></div>';
  }
  html += '</div>';
  return html;
}

// Render story progress bar for home screen
function renderStoryProgress() {
  if (!state.lumiStory) state.lumiStory = { chapter: 0, shownChapters: [] };
  var ch = state.lumiStory.chapter || 0;
  if (ch === 0) ch = 1; // Show chapter 1 by default

  var story = LUMI_STORY[Math.min(ch, LUMI_STORY.length) - 1];
  var nextStory = ch < LUMI_STORY.length ? LUMI_STORY[ch] : null;
  var flowers = state.garden ? state.garden.length : 0;

  var html = '<div class="story-progress-card" onclick="showStoryChapter(' + ch + ')">';
  html += '<div class="story-progress-header">';
  html += '<span class="story-progress-icon">' + story.icon + '</span>';
  html += '<span class="story-progress-title">Star Bridge: ' + story.title + '</span>';
  html += '</div>';
  html += '<div class="story-progress-bridge">' + renderStoryBridge(ch) + '</div>';
  if (nextStory) {
    var needed = nextStory.unlockFlowers - flowers;
    if (needed > 0) {
      html += '<div class="story-progress-next">' + needed + ' more flower' + (needed > 1 ? 's' : '') + ' to unlock Chapter ' + (ch + 1) + '</div>';
    }
  } else if (ch >= LUMI_STORY.length) {
    html += '<div class="story-progress-next" style="color:var(--gold)">Star Bridge Complete!</div>';
  }
  html += '</div>';

  return html;
}

// Called on app init to set Lumi's initial mood and trigger story
function initLumi() {
  var hour = new Date().getHours();
  if (hour < 7 || hour >= 22) {
    setLumiMood('sleepy');
  } else {
    setLumiMood('happy');
  }

  // Check for new story chapter
  var newChapter = checkStoryProgress();
  if (newChapter > 0) {
    // Show new chapter after a short delay
    if (!state.lumiStory.shownChapters || state.lumiStory.shownChapters.indexOf(newChapter) === -1) {
      setTimeout(function() { showStoryChapter(newChapter); }, 1500);
    }
  }

  // React based on visit context
  var today = new Date().toDateString();
  if (state.lastVisit === today) {
    lumiReactTo('firstVisitToday');
  } else if (state.lastVisit) {
    // Calculate days since last visit
    var last = new Date(state.lastVisit);
    var now = new Date();
    var daysDiff = Math.floor((now - last) / (1000 * 60 * 60 * 24));
    if (daysDiff > 3) {
      lumiReactTo('comeBack');
    } else {
      lumiReactTo('returnVisit');
    }
  } else {
    lumiReactTo('returnVisit');
  }
}
