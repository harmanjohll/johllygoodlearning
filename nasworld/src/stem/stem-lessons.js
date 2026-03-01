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
