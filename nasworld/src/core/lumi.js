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
    "Yes! Lock that one in.",
    "You. Just. Solved. That. Show off.",
    "Bingo. Next one, please.",
    "Your brain just flexed. I felt it from here.",
    "Brilliant. Slightly suspicious how easy you made that look.",
    "Tepat sekali! (That's Malay for spot on.)"
  ],
  streak: [
    "Five in a row. I'm officially impressed and slightly nervous.",
    "On fire. Should I get the fire extinguisher?",
    "Look at you, casually being a genius again.",
    "Streak alert! Streak alert! This is not a drill!"
  ],
  bigStreak: [
    "Ten in a row?! I'm filing for early retirement, you've got this.",
    "I asked you for clever, not LEGENDARY. Show off.",
    "My sparkles need a lie-down. You broke them.",
    "I have run out of compliments. Please slow down."
  ],
  wrong: [
    "Close-ish! Brain wrinkles forming as we speak.",
    "Wrong answer, right effort. Try again, princess.",
    "Plot twist. Let's reroute!",
    "I would have got that one wrong too, if I had a brain. But you have one. Try again!",
    "Oops! That counts as a free hint for next time."
  ],
  levelUp: [
    "{level}! Roll out the sparkle carpet!",
    "Levelled up to {level}! You unlocked extra cleverness.",
    "{level}! Quick, take a bow — I'm clapping with both sparkles."
  ],
  quizAmazing: [
    "That was suspicious. Are you the actual quiz writer?",
    "Near perfect. I have no notes. Just admiration.",
    "Sliced it. Diced it. Plated it. Chef's kiss.",
    "I'm putting that quiz in a frame. Where would you like it hung?"
  ],
  quizGood: [
    "Solid run. Brain is officially in good shape today.",
    "Nice work. Two more like that and I'll bake you a (virtual) cake.",
    "You did the thing! And you did it well. Onwards."
  ],
  quizTryAgain: [
    "That one fought back. Tough questions, tougher Anastasia.",
    "We'll get it next time. Brain warm-up, that's all that was.",
    "Even the smartest stars miss a few. Try again or pick something fresh?"
  ],
  lessonDone: [
    "Lesson absorbed. Brain visibly bigger. Probably.",
    "Done! Now go show off this fact at dinner.",
    "Knowledge unlocked. Achievement: Slightly Wiser Anastasia.",
    "Plug that in your memory bank. Earning interest already."
  ],
  achievement: [
    "{name}! Stick it on the wall. Loudly.",
    "Achievement unlocked: {name}. Pure show-off energy.",
    "You earned {name}. That's brag-worthy. Brag away."
  ],
  earlyMorning: [
    "Up before me? Bold. Pass the imaginary coffee.",
    "Sunrise scholar mode. I respect it.",
    "Brain says morning, eyes say maybe. Let's start gentle."
  ],
  morning: [
    "Good morning, brain boss. Pick a world.",
    "Selamat pagi, Anastasia! Let's see what trouble we make today.",
    "Morning! Brain is freshly defragmented. Use it.",
    "Hello sunshine. Today's mission: smarter than yesterday."
  ],
  afternoon: [
    "Selamat petang! After-school brain unlocked.",
    "Afternoon power-up time. Quick session?",
    "Brain naps are for amateurs. Quizzing time.",
    "Hi! Garden still missing flowers. Just a friendly reminder."
  ],
  evening: [
    "Evening session, my favourite kind. Cosy clever time.",
    "Selamat malam! One quick quest before bed?",
    "Brain works extra well after dinner. Science. (Probably.)",
    "Stars are out. Yours is the brightest. Obviously."
  ],
  lateNight: [
    "Late night brain? Five minutes max, then bed. Deal?",
    "Past bedtime detective at work. I'll keep your secret.",
    "Tiny session, then sleep. Memory consolidates while you snooze!"
  ],
  comeBack: [
    "You're back! The garden looks slightly less sad already.",
    "I almost emailed you. (I can't email. But I almost.)",
    "There you are! Saved your spot. Mostly.",
    "Missed you. Three jokes saved. Possibly four."
  ],
  firstToday: [
    "Round two of the day! Showing off now, are we?",
    "Back again? Officially a learning machine.",
    "Twice in one day. Brain agrees, this is excellent."
  ],
  questDone: [
    "Quest done! Stars rain incoming. Brace.",
    "Done. Done. Done. Take the win.",
    "Quest squished. Pick another?"
  ],
  gardenGrow: [
    "Fresh flower! The garden gasps in delight.",
    "Another bloom. Your garden could rival a museum.",
    "New flower! I'm watering my eyes in pride."
  ]
};

// Lumi's joke bank — pulled on taps and idle moments. Cheeky, P1-friendly.
var LUMI_JOKES = [
  "Why did the math book look sad? Too many problems!",
  "What did zero say to eight? Nice belt!",
  "What do you call a cat who's good at sums? A purr-fect mathematician!",
  "Why did the cookie go to the doctor? It was feeling crummy!",
  "Knock knock. Who's there? Lettuce. Lettuce who? Lettuce in, it's raining!",
  "Why don't eggs tell jokes? They'd crack up!",
  "What did the kucing say at the laptop? I'm watching the mouse!",
  "What's brown and sticky? A stick!",
  "Why did the banana go to the doctor? It wasn't peeling well!",
  "What do you call a fish wearing a crown? Your Royal Hi-ness!",
  "Why did Tigger look in the toilet? Looking for Pooh!",
  "What's a vampire's favourite fruit? A neck-tarine!",
  "Where do hamburgers dance? At the meat-ball!",
  "Why did the teddy say no to dessert? She was stuffed!",
  "What did one ocean say to the other? Nothing, they just waved!"
];

// Random cheeky banter for idle moments and easter eggs
var LUMI_BANTER = [
  "Psst. Did you know nasi means rice? Now you do. You're welcome.",
  "Fun fact: my sparkles run on correct answers. Hint hint.",
  "If you whisper 'Selamat pagi' to a teacher tomorrow they will love you.",
  "Sang Kancil the mousedeer outsmarted a crocodile by counting. Counting is power!",
  "Brain rule: it's okay to be wrong. It's not okay to be bored.",
  "Singapore weather only has two settings: panas (hot) and hujan (rain). Discuss.",
  "Did you brush your teeth today? Asking for a friend. The friend is your mouth.",
  "Bonus level unlocks when you make me laugh. (Joking. Or am I?)"
];

// === LUMI TAP INTERACTIONS ===
var LUMI_TAP_RESPONSES = [
  { maxTaps: 1, responses: ["Hi! Was that a poke?", "Boop yourself back!", "Want a joke? Tap me twice.", "Hello hello!"] },
  { maxTaps: 3, responses: ["Stop, that tickles! (Don't stop.)", "Joke incoming. Brace yourself.", "Three taps = secret handshake unlocked.", "Hey, save some taps for later!"] },
  { maxTaps: 5, responses: ["My sparkles are spinning!", "Tap five complete. Energy: 110 percent.", "Five taps? You like me, you really like me!", "Okay okay, I'm awake. Mostly."] },
  { maxTaps: 8, responses: ["Calling tap-tap emergency!", "I might levitate if you keep going.", "Eight! Eight! I have a headache and a star bridge to build!", "Are you trying to break me, princess?"] },
  { maxTaps: 15, responses: ["FIFTEEN. I'm officially tickled to bits.", "You found my favourite tap spot. Achievement coming.", "I demand a snack break.", "If I had hands I would high-five you. Then beg you to stop."] }
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

  // Every 3rd tap from tap 4 onwards, drop a joke or banter instead.
  var msg;
  if (lumiState.tapCount >= 4 && lumiState.tapCount % 3 === 0) {
    msg = pick(Math.random() < 0.6 ? LUMI_JOKES : LUMI_BANTER);
  } else {
    msg = pick(tier.responses);
  }
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
    title: "Lumi's Tiny Disaster",
    unlockFlowers: 0,
    intro: "Anastasia, slight problem. The Star Bridge that ties Number, Word, STEM and Dunia Melayu together... fell apart. " +
           "Stars scattered everywhere. Good news: every time you learn something, one star floats back. " +
           "Help me fix the bridge? You are cheaper than a contractor.",
    milestone: "First star recovered. Bridge glimmers like a sleepy fairy light.",
    icon: "\uD83C\uDF09"
  },
  {
    chapter: 2,
    title: "Number Stars Switch On",
    unlockFlowers: 5,
    intro: "Counting, adding, sharing \u2014 every math puzzle wakes up a Number Star. " +
           "Keep going! The bridge needs maths to hold itself up. Literally. It is all geometry.",
    milestone: "Number World section glowing. Architects impressed.",
    icon: "\uD83D\uDD22"
  },
  {
    chapter: 3,
    title: "Word Stars Whisper",
    unlockFlowers: 12,
    intro: "Words make the bridge magical. Every sight word, every sentence, every silly story lights it up like a fairy lantern. " +
           "Read me one, would you? I do enjoy a bedtime story.",
    milestone: "Word Stars singing in soft, story-shaped lights.",
    icon: "\uD83D\uDCDA"
  },
  {
    chapter: 4,
    title: "STEM Stars Spark",
    unlockFlowers: 20,
    intro: "Science and code are the engine. Live wires, tiny gears, robot toes. " +
           "You poke at them, they spark. You explain how plants grow, they hum.",
    milestone: "STEM Stars zinging electric blue. The bridge purrs.",
    icon: "\uD83D\uDD2C"
  },
  {
    chapter: 5,
    title: "Dunia Melayu Lights Up",
    unlockFlowers: 30,
    intro: "Selamat datang, master builder. The Malay stars are the warmest of the lot. " +
           "Greetings, family words, hawker menus add golden lanterns. " +
           "All four worlds, all yours, all connected. Tepuk tangan!",
    milestone: "The Star Bridge shines across every world. Lumi wipes a sparkly tear.",
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
