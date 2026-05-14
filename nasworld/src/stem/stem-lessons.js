// ============================================================
//  STEM LESSONS — Visual step-by-step lessons for science + coding
//  Adapted for P1 learner (simple, visual, discovery-based)
// ============================================================

var STEM_LESSONS = {
  // ── SCIENCE ──
  living: {
    title: 'Living & Non-Living Things',
    icon: '🌱',
    lumiSays: 'Let\'s discover what is alive and what is not!',
    steps: [
      { visual: '<div style="font-size:48px">🐕 🌷 🪨 🧸</div>', text: 'Some things are <b>alive</b> and some are <b>not alive</b>.', lumiTip: 'Living things do special things!' },
      { text: '<b>Living things can:</b><br>🌱 Grow bigger<br>🍽️ Need food and water<br>🏃 Move on their own<br>👶 Have babies (reproduce)<br>💨 Breathe', lumiTip: 'Remember: grow, eat, move, reproduce, breathe!' },
      { text: '<b>Non-living things:</b><br>🪨 Rock — does not grow<br>🧸 Teddy bear — does not eat<br>📱 Phone — does not breathe<br>They were never alive!', lumiTip: 'Non-living things don\'t do any of those things.' },
      { type: 'sort', text: 'Sort these into Living and Non-Living!', categories: [
        { name: 'Living', items: ['🐱 Cat', '🌻 Flower', '🐛 Worm'] },
        { name: 'Non-Living', items: ['🪨 Rock', '✏️ Pencil', '🧱 Brick'] }
      ]},
      { type: 'try', prompt: 'Which is a living thing?', options: ['A car', 'A fish', 'A table'], answer: 'A fish', successMsg: 'A fish grows, eats, moves, and breathes!' }
    ]
  },

  material: {
    title: 'Materials & Properties',
    icon: '🧱',
    lumiSays: 'Everything is made of different materials!',
    steps: [
      { text: '<b>Materials</b> are what things are made of:<br>🪵 Wood — tables, doors, pencils<br>🪨 Metal — spoons, scissors, coins<br>🧶 Fabric — clothes, curtains<br>🧊 Plastic — bottles, toys', lumiTip: 'Look around you — what materials can you see?' },
      { text: '<b>Properties</b> describe what materials are like:<br>Hard or soft? 🪨 vs 🧸<br>Rough or smooth? 🪵 vs 🧊<br>Waterproof or absorbent? ☔ vs 🧽<br>See-through or opaque? 🪟 vs 🧱', lumiTip: 'Touch things and think about how they feel!' },
      { type: 'sort', text: 'Sort by property: Hard or Soft?', categories: [
        { name: 'Hard', items: ['🪨 Rock', '🪙 Coin', '🧊 Ice'] },
        { name: 'Soft', items: ['🧸 Teddy', '🧽 Sponge', '🧶 Wool'] }
      ]},
      { type: 'try', prompt: 'Which material is waterproof?', options: ['Paper', 'Plastic', 'Fabric'], answer: 'Plastic', successMsg: 'Plastic keeps water out!' }
    ]
  },

  forces: {
    title: 'Forces — Push & Pull',
    icon: '💪',
    lumiSays: 'Forces make things move!',
    steps: [
      { visual: '<div style="font-size:48px">👋 ➡️ 📦</div>', text: 'A <b>push</b> moves something away from you.', lumiTip: 'Pushing a door, kicking a ball — those are pushes!' },
      { visual: '<div style="font-size:48px">📦 ⬅️ 🤲</div>', text: 'A <b>pull</b> moves something towards you.', lumiTip: 'Opening a drawer, pulling a wagon — those are pulls!' },
      { text: '<b>Forces can:</b><br>🚀 Make things <b>start moving</b><br>🛑 Make things <b>stop</b><br>↗️ Change <b>direction</b><br>🏎️ Make things go <b>faster</b> or <b>slower</b>', lumiTip: 'Everything that moves uses forces!' },
      { type: 'sort', text: 'Is it a push or a pull?', categories: [
        { name: 'Push', items: ['Kick a ball', 'Press a button', 'Close a door'] },
        { name: 'Pull', items: ['Tug of war', 'Open a drawer', 'Fish with a rod'] }
      ]},
      { type: 'try', prompt: 'What happens when you push a toy car?', options: ['It stays still', 'It moves away', 'It disappears'], answer: 'It moves away', successMsg: 'A push makes things move away from you!' }
    ]
  },

  earth: {
    title: 'Earth & Weather',
    icon: '🌍',
    lumiSays: 'Let\'s learn about our amazing planet!',
    steps: [
      { visual: '<div style="font-size:60px">☀️ 🌧️ ⛈️ 🌈</div>', text: 'Weather changes every day! Sun, rain, storms, rainbows!', lumiTip: 'Look outside — what\'s the weather today?' },
      { text: '<b>The Water Cycle:</b><br>☀️ Sun heats water → it goes UP as vapour<br>☁️ Vapour cools → becomes clouds<br>🌧️ Clouds get heavy → rain falls<br>💧 Water collects → rivers, lakes, sea<br>🔄 Then it starts again!', lumiTip: 'Water goes round and round forever!' },
      { text: '<b>Singapore\'s weather:</b><br>🌡️ Hot and warm all year<br>🌧️ Rainy season (Nov–Jan)<br>☀️ Dry season (Feb–Apr)<br>🌤️ About 25–31°C', lumiTip: 'Singapore is near the equator — it\'s always warm!' },
      { type: 'try', prompt: 'What makes clouds?', options: ['Wind blowing dust', 'Water vapour cooling', 'Stars falling'], answer: 'Water vapour cooling', successMsg: 'When water vapour cools, it makes tiny droplets = clouds!' }
    ]
  },

  body: {
    title: 'My Body',
    icon: '🫀',
    lumiSays: 'Your body is amazing! Let\'s explore it!',
    steps: [
      { text: '<b>Your 5 senses:</b><br>👀 Eyes — see<br>👂 Ears — hear<br>👃 Nose — smell<br>👅 Tongue — taste<br>✋ Skin — touch', lumiTip: 'We use our senses to learn about the world!' },
      { text: '<b>Important body parts:</b><br>🧠 Brain — thinks and controls everything<br>🫀 Heart — pumps blood around your body<br>🫁 Lungs — help you breathe<br>🦴 Bones — hold your body up<br>💪 Muscles — help you move', lumiTip: 'Your heart beats about 100,000 times a day!' },
      { type: 'match', text: 'Match the sense to its body part!', pairs: [
        { left: '👀 See', right: 'Eyes' },
        { left: '👂 Hear', right: 'Ears' },
        { left: '👃 Smell', right: 'Nose' },
        { left: '👅 Taste', right: 'Tongue' }
      ]},
      { type: 'try', prompt: 'What does the heart do?', options: ['Helps you think', 'Pumps blood', 'Helps you breathe'], answer: 'Pumps blood', successMsg: 'Your heart pumps blood to every part of your body!' }
    ]
  },

  // ── CODING ──
  cseq: {
    title: 'Coding — Sequences',
    icon: '📋',
    lumiSays: 'A sequence is a list of steps in order!',
    steps: [
      { text: '<b>A sequence is steps done in order:</b><br>1️⃣ Wake up<br>2️⃣ Brush teeth<br>3️⃣ Eat breakfast<br>4️⃣ Go to school', lumiTip: 'Order matters! You brush teeth BEFORE eating!' },
      { visual: '<div class="code-demo"><span class="code-block">→ Move right</span><span class="code-block">→ Move right</span><span class="code-block">↓ Move down</span></div>', text: 'In coding, we give the computer a sequence of <b>commands</b>.', lumiTip: 'The computer does exactly what you tell it — in order!' },
      { text: '<b>Commands for the robot:</b><br>→ Move right<br>← Move left<br>↑ Move up<br>↓ Move down<br>The robot follows each step one by one!', lumiTip: 'Plan your path before writing commands!' },
      { type: 'try', prompt: 'To go right 2 spaces, how many "→" commands do you need?', options: ['1', '2', '3'], answer: '2', successMsg: 'One → for each space!' }
    ]
  },

  cloop: {
    title: 'Coding — Loops',
    icon: '🔁',
    lumiSays: 'Loops repeat things without writing them again!',
    steps: [
      { text: '<b>Without a loop:</b><br>→ Move right<br>→ Move right<br>→ Move right<br>→ Move right<br>That\'s 4 commands!', lumiTip: 'Writing the same thing over and over is boring!' },
      { visual: '<div class="code-demo"><span class="code-block loop">🔁 Repeat 4 times:<span class="code-block nested">→ Move right</span></span></div>', text: '<b>With a loop:</b> Repeat 4 times → move right. Same result, less writing!', lumiTip: 'Loops save time and make code shorter!' },
      { text: '<b>When to use loops:</b><br>• Moving in a straight line<br>• Doing the same thing many times<br>• Any repeating pattern!', lumiTip: 'If you see a pattern, you can probably use a loop!' },
      { type: 'try', prompt: '"Repeat 3 times: jump" — How many jumps?', options: ['1', '3', '6'], answer: '3', successMsg: 'The robot jumps 3 times!' }
    ]
  },

  ccond: {
    title: 'Coding — Conditionals',
    icon: '🔀',
    lumiSays: 'Conditionals let the computer make decisions!',
    steps: [
      { text: '<b>IF it is raining ☔</b><br>→ Take an umbrella<br><b>ELSE</b><br>→ Wear sunglasses 😎', lumiTip: 'We make "if" decisions every day!' },
      { visual: '<div class="code-demo"><span class="code-block cond">IF on red tile:<span class="code-block nested">↰ Turn left</span></span><span class="code-block cond">IF on blue tile:<span class="code-block nested">↱ Turn right</span></span></div>', text: 'The robot checks the colour and decides what to do!', lumiTip: 'The robot looks before it acts!' },
      { type: 'try', prompt: '"IF hungry → eat. ELSE → play." You are hungry. What do you do?', options: ['Play', 'Eat', 'Sleep'], answer: 'Eat', successMsg: 'The condition is true, so you eat!' }
    ]
  },

  cvar: {
    title: 'Coding — Variables',
    icon: '📦',
    lumiSays: 'Variables are like labelled boxes that hold values!',
    steps: [
      { visual: '<div class="var-demo"><div class="var-box"><div class="var-label">score</div><div class="var-value">0</div></div></div>', text: 'A <b>variable</b> is a box with a name. This one is called "score" and holds 0.', lumiTip: 'Think of it as a container with a label!' },
      { visual: '<div class="var-demo"><div class="var-box"><div class="var-label">score</div><div class="var-value">0 → 5</div></div></div>', text: 'When you collect a gem: <b>score = score + 5</b>. Now it holds 5!', lumiTip: 'Variables can change — that\'s why they\'re called variables!' },
      { type: 'try', prompt: 'score = 3. You collect 2 gems worth 1 each. What is score now?', options: ['3', '5', '6'], answer: '5', successMsg: '3 + 1 + 1 = 5!' }
    ]
  },

  cdebug: {
    title: 'Coding — Debugging',
    icon: '🐛',
    lumiSays: 'Debugging means finding and fixing mistakes in code!',
    steps: [
      { text: '<b>A bug</b> is a mistake in code.<br><b>Debugging</b> is finding and fixing it!<br><br>Even the best coders make bugs. The skill is <b>finding</b> them!', lumiTip: 'The word "bug" comes from a real moth found in a computer in 1947!' },
      { visual: '<div class="code-demo"><span class="code-block">Goal: Go right 3 steps</span><span class="code-block bug">→ Move right</span><span class="code-block bug">→ Move right</span><span class="code-block bug">↓ Move down ← BUG!</span></div>', text: 'Spot the bug! The third command should be → not ↓.', lumiTip: 'Compare what the code DOES vs what it SHOULD do.' },
      { type: 'try', prompt: '"→ → ↓ →" should go right 4 times. Which step is the bug?', options: ['Step 1', 'Step 2', 'Step 3'], answer: 'Step 3', successMsg: 'Step 3 goes down instead of right — that\'s the bug!' }
    ]
  }
};

// === New P1/P2 science lessons ===

STEM_LESSONS.senses = {
  title: 'My Five Senses',
  icon: '👀',
  lumiSays: 'Your senses are your superpowers for exploring the world!',
  steps: [
    { visual: '<div style="font-size:38px">👀 👂 👃 👅 ✋</div>', text: 'Five superpowers: <b>see</b>, <b>hear</b>, <b>smell</b>, <b>taste</b>, <b>touch</b>.', lumiTip: 'Each sense uses a different part of your body.' },
    { text: '<b>👀 Sight</b> uses your <b>eyes</b>. You see colours, shapes, your own reflection.<br><b>👂 Hearing</b> uses your <b>ears</b>. You hear music, voices, the rain.<br><b>👃 Smell</b> uses your <b>nose</b>. You smell food, flowers, freshly baked bread.', lumiTip: 'Eyes / ears / nose — all live on your head, neat little neighbours.' },
    { text: '<b>👅 Taste</b> uses your <b>tongue</b>. Sweet, salty, sour, bitter.<br><b>✋ Touch</b> uses your <b>skin</b> all over your body. Soft, rough, hot, cold.', lumiTip: 'Your skin is the biggest sense organ. It is your whole self-wrapping.' },
    { type: 'try', prompt: 'You hear a bell. Which sense are you using?', options: ['Sight','Hearing','Smell'], answer: 'Hearing', successMsg: 'Ears + bell = hearing!' },
    { type: 'try', prompt: 'You feel a fluffy cat. Which sense?', options: ['Taste','Touch','Sight'], answer: 'Touch', successMsg: 'Touch — your skin notices fluffiness.' }
  ]
};

STEM_LESSONS.plants = {
  title: 'Plant Life Cycle',
  icon: '🌻',
  lumiSays: 'A whole sunflower starts as a teeny seed. Let me show you.',
  steps: [
    { visual: '<div style="font-size:36px">🌰 → 🌱 → 🌿 → 🌻 → 🌰</div>', text: 'Seed → sprout → young plant → flower → new seeds. Round and round.', lumiTip: 'Plants make new seeds so the cycle keeps going.' },
    { text: '<b>What a plant needs:</b><br>☀️ Sun (for light)<br>💧 Water (the engine)<br>🌫️ Air (for breathing)<br>🟤 Soil (for food and grip)', lumiTip: 'Take away any one and the plant gets sad.' },
    { text: '<b>Parts of a plant:</b><br>🌱 Roots — drink water from soil<br>🌿 Stem — holds plant up and moves water<br>🍃 Leaves — make food using sunlight (called photosynthesis)<br>🌸 Flower — makes seeds for new plants', lumiTip: 'Leaves are tiny chefs. Sunlight is their oven.' },
    { type: 'try', prompt: 'What comes after a sprout?', options: ['A seed','A young plant','A rainbow'], answer: 'A young plant', successMsg: 'Yes — the sprout grows into a young plant!' },
    { type: 'try', prompt: 'Which part drinks water from the soil?', options: ['Leaves','Roots','Petals'], answer: 'Roots', successMsg: 'Roots! They are the plant\'s drinking straws.' }
  ]
};

STEM_LESSONS.animals = {
  title: 'Animal Life Cycles',
  icon: '🐛',
  lumiSays: 'Most animals look very different when they are born. Wait until you see this.',
  steps: [
    { visual: '<div style="font-size:30px">🥚 → 🐛 → 🛌 → 🦋</div>', text: 'Butterfly life cycle: <b>egg → caterpillar → pupa (chrysalis) → butterfly</b>.', lumiTip: 'A caterpillar literally rearranges itself inside the chrysalis. Wild.' },
    { visual: '<div style="font-size:30px">🥚 → 🐟 → 🐸</div>', text: 'Frog life cycle: <b>egg → tadpole → froglet → frog</b>. Tadpoles have tails and live in water!', lumiTip: 'A frog used to be a fish-ish swimmer. Imagine.' },
    { visual: '<div style="font-size:30px">🥚 → 🐥 → 🐔</div>', text: 'Chicken life cycle: <b>egg → chick → hen/rooster</b>. Mums lay the eggs.', lumiTip: 'Some lay eggs, some give birth, some do a weird mix. Animals!' },
    { type: 'try', prompt: 'What is between caterpillar and butterfly?', options: ['Egg','Pupa','Chick'], answer: 'Pupa', successMsg: 'Yes! Caterpillars build a pupa first.' },
    { type: 'try', prompt: 'A tadpole grows into a...', options: ['Fish','Frog','Bird'], answer: 'Frog', successMsg: 'Tadpole → frog. Big body change!' }
  ]
};

STEM_LESSONS.seasons = {
  title: 'Day, Night & Seasons',
  icon: '🌗',
  lumiSays: 'The Sun does not move much. Earth does the moving. We just sit on it!',
  steps: [
    { visual: '<div style="font-size:40px">🌎 🔄 ☀️</div>', text: 'Earth spins! One full spin = 24 hours = <b>one day</b>. The side facing the Sun has daytime; the other has night.', lumiTip: 'You are spinning right now and not even getting dizzy. Lucky.' },
    { visual: '<div style="font-size:36px">☀️ 🌎 ↻ ↻ ↻ 🌎</div>', text: 'Earth also <b>orbits</b> the Sun once a year. The tilt of Earth gives us seasons in many countries.', lumiTip: 'Singapore is near the equator, so it skips most seasons. Lucky-not-lucky.' },
    { text: '<b>Singapore weather pattern:</b><br>🌤️ <b>Dry months</b> — less rain (Feb–Apr, mid-year)<br>🌧️ <b>Monsoon months</b> — heavier rain (Nov–Jan, May–Sep)<br>Year round: panas + hujan.', lumiTip: 'Bring an umbrella. Always. Forever. (Singapore Rule #1.)' },
    { type: 'try', prompt: 'What causes day and night?', options: ['Earth spinning on its axis','The Sun moving around Earth','Clouds blocking the Sun'], answer: 'Earth spinning on its axis', successMsg: 'Earth spins once a day!' },
    { type: 'try', prompt: 'How long does Earth take to orbit the Sun?', options: ['One day','One month','One year'], answer: 'One year', successMsg: 'A whole year per lap!' }
  ]
};

STEM_LESSONS.sound = {
  title: 'Sound',
  icon: '🔊',
  lumiSays: 'Sound is wiggly air bumping into your ears. Honest.',
  steps: [
    { text: '<b>Sound = vibration.</b><br>When something shakes (vibrates), it pushes the air around it. That wiggling air reaches your ear and your brain says: "Sound!"', lumiTip: 'Touch your throat while you hum. Feel the wiggle? That is sound being made.' },
    { text: '<b>Loud vs soft:</b><br>Big vibrations = loud sounds (drum, shout)<br>Tiny vibrations = soft sounds (whisper, falling leaf)', lumiTip: 'Loud or soft is about how big the wiggles are.' },
    { text: '<b>High vs low pitch:</b><br>Fast wiggles = high pitch (squeak, whistle)<br>Slow wiggles = low pitch (rumble, foghorn)', lumiTip: 'Mum\'s voice = lower pitch than yours, usually!' },
    { type: 'try', prompt: 'What makes sound happen?', options: ['Light','Vibration','Wind only'], answer: 'Vibration', successMsg: 'Yes — anything that vibrates makes sound.' },
    { type: 'try', prompt: 'A drum hit hard makes a... ?', options: ['Loud sound','Soft sound','No sound'], answer: 'Loud sound', successMsg: 'Bigger hit = bigger vibration = louder sound.' }
  ]
};

STEM_LESSONS.light = {
  title: 'Light & Shadows',
  icon: '🔦',
  lumiSays: 'Where there is light there is a shadow nearby. Always.',
  steps: [
    { text: '<b>Light comes from:</b><br>☀️ The Sun (the biggest light)<br>💡 Light bulbs, torches, screens<br>🔥 Fire<br>✨ Some animals (fireflies, glow-worms)', lumiTip: 'The Moon is NOT a light. It just reflects the Sun\'s light back at us.' },
    { text: '<b>How shadows form:</b><br>When light hits something it cannot pass through, a <b>shadow</b> appears on the opposite side.', lumiTip: 'Stand in the sun, your shadow points away from the sun. Try it!' },
    { text: '<b>Transparent / Translucent / Opaque:</b><br>🪟 Transparent — light passes through (clear glass)<br>🟫 Translucent — some light passes (tracing paper)<br>🧱 Opaque — no light passes (wall, book)', lumiTip: 'Your hand is opaque. That is why it makes a shadow.' },
    { type: 'try', prompt: 'What makes a shadow appear?', options: ['Light hitting an opaque object','Wind blowing','Heat'], answer: 'Light hitting an opaque object', successMsg: 'Exactly — block the light, get a shadow.' },
    { type: 'try', prompt: 'Which gives off its own light?', options: ['Moon','Mirror','Torch'], answer: 'Torch', successMsg: 'A torch glows by itself. The moon and mirror just reflect.' }
  ]
};

// === New P2 coding lessons ===

STEM_LESSONS.cevent = {
  title: 'Coding — Events',
  icon: '⚡',
  lumiSays: 'Events are "when X happens, do Y" rules. Your remote control runs on these.',
  steps: [
    { text: '<b>An event</b> is something that happens.<br>Button pressed. Bell rung. Door opened. Time reached.<br>Code can <b>listen</b> for events and react.', lumiTip: 'Doorbell. Press → ding. The button pressed is the event!' },
    { visual: '<div style="font-size:18px;font-family:monospace">WHEN button is pressed<br>&nbsp;&nbsp;PLAY sound</div>', text: 'In code we write: <b>WHEN X DO Y</b>. Two halves: the event and the action.', lumiTip: 'WHEN is the trigger, DO is the reaction.' },
    { visual: '<div style="font-size:18px;font-family:monospace">WHEN the timer rings<br>&nbsp;&nbsp;TURN OFF the oven</div>', text: 'Real-world examples: timers, alarms, smart lights. All running on events.', lumiTip: 'Your alarm clock is just an event listener with a buzzer attached.' },
    { type: 'try', prompt: 'Which is an event?', options: ['Light bulb glows','Button pressed','Day of the week'], answer: 'Button pressed', successMsg: 'Yes! Buttons being pressed is an event.' },
    { type: 'try', prompt: 'WHEN __ DO play music. Fill the blank.', options: ['the song ends','the alarm rings','the music plays'], answer: 'the alarm rings', successMsg: 'Alarm rings = event!' }
  ]
};

STEM_LESSONS.cfunc = {
  title: 'Coding — Mini-Programs',
  icon: '🧩',
  lumiSays: 'A mini-program is a chunk of code with a name. You write it once, then use it again and again.',
  steps: [
    { visual: '<div style="font-size:18px;font-family:monospace">MAKE wave_hello:<br>&nbsp;&nbsp;raise hand<br>&nbsp;&nbsp;wiggle fingers<br>&nbsp;&nbsp;lower hand</div>', text: 'We bundled three instructions into one new word: <b>wave_hello</b>.', lumiTip: 'Anywhere we say wave_hello, all three happen.' },
    { visual: '<div style="font-size:18px;font-family:monospace">wave_hello<br>wave_hello<br>wave_hello</div>', text: 'Reuse it! Three waves with three lines instead of nine.', lumiTip: 'Mini-programs save writing — and your brain space.' },
    { text: '<b>Why bother?</b><br>1. Less code = fewer mistakes<br>2. If you change it once, every use changes<br>3. Code reads like a book', lumiTip: 'Real coders write little reusable blocks all the time.' },
    { type: 'try', prompt: 'You need to draw a square three times. What helps?', options: ['Write the square steps 3 times','Make a draw_square mini-program','Skip squares'], answer: 'Make a draw_square mini-program', successMsg: 'One block, used three times!' }
  ]
};

function getStemLesson(skillId) {
  return STEM_LESSONS[skillId] || null;
}

function getStemFlashcards(skillId) {
  if (skillId === 'living') {
    return [
      { front: 'Living things can...', back: 'Grow, eat, move, breathe, reproduce', image: '🌱' },
      { front: 'Is a flower living?', back: 'Yes! It grows and needs water.', image: '🌷' },
      { front: 'Is a rock living?', back: 'No! It cannot grow or move.', image: '🪨' },
      { front: 'Is a fish living?', back: 'Yes! It breathes, eats, and grows.', image: '🐟' },
      { front: 'Is a toy car living?', back: 'No! It was never alive.', image: '🚗' }
    ];
  }

  if (skillId === 'body') {
    return [
      { front: '🧠 Brain', back: 'Thinks and controls your body', image: '🫀' },
      { front: '🫀 Heart', back: 'Pumps blood around your body', image: '🫀' },
      { front: '🫁 Lungs', back: 'Help you breathe', image: '🫀' },
      { front: '👀 Eyes', back: 'Let you see', image: '🫀' },
      { front: '👂 Ears', back: 'Let you hear', image: '🫀' }
    ];
  }

  if (skillId === 'forces') {
    return [
      { front: 'Push', back: 'A force that moves things AWAY from you', image: '💪' },
      { front: 'Pull', back: 'A force that moves things TOWARDS you', image: '💪' },
      { front: 'Gravity', back: 'A pull that keeps us on the ground', image: '💪' },
      { front: 'Friction', back: 'A force that slows things down', image: '💪' }
    ];
  }

  return null;
}
