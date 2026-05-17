// ============================================================
//  THREADS — Cross-world story arcs that pull skills together.
//  Each thread has chapters. Each chapter has a tiny activity
//  card that opens one or more relevant skills.
// ============================================================

var THREADS = {
  lemonade: {
    id: 'lemonade',
    title: 'Run a Lemonade Stand',
    emoji: '🍋',
    blurb: 'You are the boss! Set up shop, count the coins, get the word out.',
    colour: '#ffd700',
    chapters: [
      {
        id: 1, title: 'Make the Sign',
        scene: 'Every shop needs a name. Pick one and write it big!',
        action: 'Visit Word World → Sight Words to grab the words you need.',
        skill: 'sight', worldType: 'word'
      },
      {
        id: 2, title: 'Set the Prices',
        scene: 'How much per cup? 50 cents? $1? Decide and lay out the coins.',
        action: 'Open Number World → Money to practise Singapore coins.',
        skill: 'money', worldType: 'math'
      },
      {
        id: 3, title: 'Test the Lemonade',
        scene: 'Sweet? Sour? Cold? Words are how you tell the customer.',
        action: 'Try Word World → Grammar Garden to find adjectives.',
        skill: 'grammar', worldType: 'word'
      },
      {
        id: 4, title: 'Greet Your Customers',
        scene: '“Selamat petang! Mahu lemonade?” Sales go up when you say hello.',
        action: 'Try Dunia Melayu → Salam to learn polite Malay openers.',
        skill: 'salam', worldType: 'malay'
      },
      {
        id: 5, title: 'Count the Day’s Takings',
        scene: 'End of day. Pile up the coins and add them up.',
        action: 'Back to Number World → Addition to count the takings.',
        skill: 'add', worldType: 'math'
      },
      {
        id: 6, title: 'Make a Big Poster',
        scene: 'A poster has to be loud. Cold! Sweet! Best on the street!',
        action: 'Open Word World → Vocabulary Vault for describing words.',
        skill: 'vocab', worldType: 'word'
      },
      {
        id: 7, title: 'The Rainy Day Plan',
        scene: 'Uh oh, it is raining. Lemonade in the rain? Or hot tea instead?',
        action: 'Open STEM World → Earth & Weather to think it through.',
        skill: 'earth', worldType: 'stem'
      }
    ]
  },

  garden: {
    id: 'garden',
    title: 'Plant a Garden',
    emoji: '🌱',
    blurb: 'Tiny seeds, big plants. You will measure, label, and look after them.',
    colour: '#7bffb5',
    chapters: [
      {
        id: 1, title: 'Pick Your Seeds',
        scene: 'Sunflowers? Basil? Cherry tomatoes? Every seed needs the right pot.',
        action: 'Open STEM World → Living Things to see what plants need.',
        skill: 'living', worldType: 'stem'
      },
      {
        id: 2, title: 'Measure the Pot',
        scene: 'Will the plant fit? Pull out a ruler and measure.',
        action: 'Try Number World → Length & Mass.',
        skill: 'lenmass', worldType: 'math'
      },
      {
        id: 3, title: 'Label in Two Languages',
        scene: 'Make a tag: green plant = pokok hijau. Both languages, one tag.',
        action: 'Visit Dunia Melayu → Warna for colours in Malay.',
        skill: 'warna', worldType: 'malay'
      },
      {
        id: 4, title: 'Watch the Weather',
        scene: 'Rain today or sun? Plants need the right mix.',
        action: 'Open STEM World → Earth & Weather.',
        skill: 'earth', worldType: 'stem'
      },
      {
        id: 5, title: 'Write the Plant Diary',
        scene: 'How tall today? How many leaves? Use describing words.',
        action: 'Word World → Grammar Garden for adjectives that paint pictures.',
        skill: 'grammar', worldType: 'word'
      },
      {
        id: 6, title: 'Harvest Day',
        scene: 'Tomatoes! Beans! Time to pick and count what you grew.',
        action: 'Open Number World → Counting & Ten Frames.',
        skill: 'count', worldType: 'math'
      },
      {
        id: 7, title: 'Share the Flowers',
        scene: 'You have flowers for Mum, Nenek, and your friend. How many each?',
        action: 'Number World → Comparing Numbers.',
        skill: 'cmp', worldType: 'math'
      }
    ]
  },

  robot: {
    id: 'robot',
    title: 'Build a Robot Helper',
    emoji: '🤖',
    blurb: 'Tell the robot what to do — step by step. Find the bugs.',
    colour: '#7bb3ff',
    chapters: [
      {
        id: 1, title: 'Step-by-Step',
        scene: 'A robot only does exactly what you say. So say it carefully.',
        action: 'Open STEM World → Code: Sequences.',
        skill: 'cseq', worldType: 'stem'
      },
      {
        id: 2, title: 'Repeat Yourself',
        scene: 'Why say "step" ten times when you can say "ten steps"?',
        action: 'Open STEM World → Code: Loops.',
        skill: 'cloop', worldType: 'stem'
      },
      {
        id: 3, title: 'If This, Then That',
        scene: 'If the floor is wet, dry it. If it is dry, skip. Choices!',
        action: 'Open STEM World → Code: Conditionals.',
        skill: 'ccond', worldType: 'stem'
      },
      {
        id: 4, title: 'Push and Pull',
        scene: 'The robot needs to push a box. How hard? Which way?',
        action: 'Try STEM World → Forces & Energy.',
        skill: 'forces', worldType: 'stem'
      },
      {
        id: 5, title: 'Find the Bug',
        scene: 'The robot is spinning in circles. Something is wrong!',
        action: 'Open STEM World → Code: Debugging.',
        skill: 'cdebug', worldType: 'stem'
      },
      {
        id: 6, title: 'Give the Robot a Name',
        scene: 'Bolt? Beepboo? Pixel? Pick a name and write it down.',
        action: 'Word World → Spelling Bee for tricky letters.',
        skill: 'spell', worldType: 'word'
      },
      {
        id: 7, title: 'Make it Dance',
        scene: 'Music! Loud. Soft. Fast. Slow. Program the moves to the beat.',
        action: 'Open STEM World → Sound.',
        skill: 'sound', worldType: 'stem'
      }
    ]
  },

  stories: {
    id: 'stories',
    title: 'Stories From Many Homes',
    emoji: '📚',
    blurb: 'Bedtime tales from all kinds of families. Spot the kind heart inside each one.',
    colour: '#b57bff',
    chapters: [
      {
        id: 1, title: 'The Clever Mousedeer (Sang Kancil)',
        scene: 'A tiny Malay mousedeer outwits a crocodile by counting it. Cheeky and clever.',
        action: 'Dunia Melayu → Haiwan and Nombor — animals and counting.',
        skill: 'haiwan', worldType: 'malay'
      },
      {
        id: 2, title: 'The Moon Cake Sister',
        scene: 'A Chinese tale of a sister who jumps to the moon. Look up tonight!',
        action: 'Word World → Vocabulary Vault for new picture-words.',
        skill: 'vocab', worldType: 'word'
      },
      {
        id: 3, title: 'Rama and Sita',
        scene: 'An Indian story about courage, kindness, and a magic bow. Read together.',
        action: 'Word World → Reading Comprehension.',
        skill: 'comprehension', worldType: 'word'
      },
      {
        id: 4, title: 'The Star and the Manger',
        scene: 'A Christmas story of a baby born in a barn, and the gifts brought by strangers.',
        action: 'Dunia Melayu → Keluarga — family words like ibu and bapa.',
        skill: 'keluarga', worldType: 'malay'
      },
      {
        id: 5, title: 'Snegurochka, the Snow Maiden',
        scene: 'A Russian winter tale. A girl made of snow learns about being loved — and what melts in the spring.',
        action: 'Word World → Reading Comprehension for a slow, careful read.',
        skill: 'comprehension', worldType: 'word'
      },
      {
        id: 6, title: 'Your Own Story',
        scene: 'Now you. Tell a kindness story from your family.',
        action: 'Word World → Story Garden, or Dunia Melayu → Ayat Mudah for a Malay version.',
        skill: 'story', worldType: 'word'
      }
    ]
  },

  hawker: {
    id: 'hawker',
    title: 'Hawker Centre Hunt',
    emoji: '🍜',
    blurb: 'Lunch on a budget. Order in Malay, count the change, read the board.',
    colour: '#ff7b7b',
    chapters: [
      {
        id: 1, title: 'Read the Board',
        scene: 'The price board is full of words. Spot the food words.',
        action: 'Dunia Melayu → Makanan to learn nasi, ayam, sayur.',
        skill: 'makanan', worldType: 'malay'
      },
      {
        id: 2, title: 'Order Politely',
        scene: '"Selamat tengah hari! Boleh saya order nasi ayam, tolong?"',
        action: 'Dunia Melayu → Salam for the polite words.',
        skill: 'salam', worldType: 'malay'
      },
      {
        id: 3, title: 'Pay the Auntie',
        scene: 'Lunch is $4.20. You have a $5 note. How much change?',
        action: 'Number World → Money.',
        skill: 'money', worldType: 'math'
      },
      {
        id: 4, title: 'Tell Mum What You Ate',
        scene: 'Now describe it. Was it sedap (yummy)? Pedas (spicy)?',
        action: 'Word World → Vocabulary Vault for describing words.',
        skill: 'vocab', worldType: 'word'
      },
      {
        id: 5, title: 'Ask for the Bill',
        scene: '"Kak, boleh saya minta bill, tolong?" Then count the coins back.',
        action: 'Number World → Money to count the change.',
        skill: 'money', worldType: 'math'
      },
      {
        id: 6, title: 'What is Halal?',
        scene: 'Some friends only eat halal food. What does that mean?',
        action: 'Dunia Melayu → Makanan to spot the words.',
        skill: 'makanan', worldType: 'malay'
      }
    ]
  }
};

// Default thread state — { unlocked: bool, currentChapter: number, completedChapters: number[] }
function getThreadState(threadId) {
  if (!state.threads) state.threads = {};
  if (!state.threads[threadId]) {
    state.threads[threadId] = { unlocked: false, currentChapter: 1, completedChapters: [] };
  }
  return state.threads[threadId];
}

// Try to unlock a thread: requires at least one attempt in 2 different worlds.
function maybeUnlockThreads() {
  if (typeof MEGA_PHENOMENA === 'undefined') return;
  if (!state.threads) state.threads = {};

  // Unique threadIds across all phenomena (1:1 with THREADS keys)
  Object.keys(THREADS).forEach(function(threadId) {
    // Reuse phenomenon test if there is a matching phenomenon, else fallback to a worlds-touched check.
    var related = MEGA_PHENOMENA.filter(function(p) { return p.threadId === threadId; });
    var worldsTouched = {};
    related.forEach(function(p) {
      p.skills.forEach(function(skillId) {
        var sk = state.skills && state.skills[skillId];
        if (sk && sk.totalAttempts > 0) {
          var w = (typeof getSkillWorld === 'function') ? getSkillWorld(skillId) : null;
          if (w) worldsTouched[w] = true;
        }
      });
    });
    var st = getThreadState(threadId);
    var nowUnlocked = Object.keys(worldsTouched).length >= 2;
    if (nowUnlocked && !st.unlocked) {
      st.unlocked = true;
      if (typeof lumiSay === 'function') {
        var t = THREADS[threadId];
        lumiSay('New adventure unlocked: ' + t.emoji + ' ' + t.title + '! Find it on the Mega Map.');
      }
    }
  });
  saveState();
}

// Mark current chapter complete and advance to next
function completeThreadChapter(threadId) {
  var thread = THREADS[threadId];
  if (!thread) return;
  var st = getThreadState(threadId);
  var ch = st.currentChapter;
  if (st.completedChapters.indexOf(ch) === -1) {
    st.completedChapters.push(ch);
  }
  if (ch < thread.chapters.length) {
    st.currentChapter = ch + 1;
  }
  state.tokens += 5;
  if (typeof questRecordThreadChapter === 'function') questRecordThreadChapter();
  saveState();
}

function getActiveThreadChapter(threadId) {
  var thread = THREADS[threadId];
  if (!thread) return null;
  var st = getThreadState(threadId);
  var idx = Math.min(st.currentChapter - 1, thread.chapters.length - 1);
  return thread.chapters[idx];
}
