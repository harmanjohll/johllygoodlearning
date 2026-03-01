// ============================================================
//  MATH LESSONS — Visual step-by-step lessons for every math skill
//  Each lesson teaches the concept BEFORE quizzing
// ============================================================

var MATH_LESSONS = {
  // ── P1 FOUNDATION ──
  count: {
    title: 'Counting & Ten Frames',
    icon: '🔢',
    lumiSays: 'Let\'s count together! Counting is the start of all maths!',
    steps: [
      { visual: '🍎🍎🍎', text: 'Count the apples. Point and count: 1... 2... 3!', lumiTip: 'Always point at each thing as you count!' },
      { visual: '<div class="ten-frame-demo"><div class="tf-dot filled"></div><div class="tf-dot filled"></div><div class="tf-dot filled"></div><div class="tf-dot filled"></div><div class="tf-dot"></div><div class="tf-dot"></div><div class="tf-dot"></div><div class="tf-dot"></div><div class="tf-dot"></div><div class="tf-dot"></div></div>', text: 'This is a <b>ten frame</b>. It has 10 boxes. We filled 4!', lumiTip: 'A ten frame helps us see numbers up to 10.' },
      { visual: '<div class="ten-frame-demo"><div class="tf-dot filled"></div><div class="tf-dot filled"></div><div class="tf-dot filled"></div><div class="tf-dot filled"></div><div class="tf-dot filled"></div><div class="tf-dot filled"></div><div class="tf-dot filled"></div><div class="tf-dot"></div><div class="tf-dot"></div><div class="tf-dot"></div></div>', text: 'How many empty boxes? 3 empty means 7 are filled!', lumiTip: 'We can count what\'s missing too!' },
      { type: 'try', visual: '🌟🌟🌟🌟🌟', prompt: 'How many stars are there?', options: ['4', '5', '6'], answer: '5', successMsg: 'You counted perfectly!' }
    ]
  },

  nbond: {
    title: 'Number Bonds',
    icon: '🔗',
    lumiSays: 'Number bonds show how numbers fit together!',
    steps: [
      { visual: '<div class="bond-demo"><div class="bond-whole">5</div><div class="bond-line"></div><div class="bond-parts"><span class="bond-part">3</span><span class="bond-part">2</span></div></div>', text: '<b>5</b> can be split into <b>3</b> and <b>2</b>.', lumiTip: 'The parts always add up to the whole!' },
      { visual: '<div class="bond-demo"><div class="bond-whole">7</div><div class="bond-line"></div><div class="bond-parts"><span class="bond-part">4</span><span class="bond-part">3</span></div></div>', text: '<b>7</b> = <b>4</b> + <b>3</b>. The whole is on top!', lumiTip: 'If you know one part, you can find the other.' },
      { visual: '🍎🍎🍎 + 🍎🍎 = 🍎🍎🍎🍎🍎', text: 'See? 3 apples and 2 apples make 5 apples!', lumiTip: 'Number bonds help with adding and subtracting.' },
      { type: 'try', visual: '<div class="bond-demo"><div class="bond-whole">6</div><div class="bond-line"></div><div class="bond-parts"><span class="bond-part">4</span><span class="bond-part">?</span></div></div>', prompt: 'What is the missing part?', options: ['1', '2', '3'], answer: '2', successMsg: '4 + 2 = 6. You found it!' }
    ]
  },

  add: {
    title: 'Addition',
    icon: '➕',
    lumiSays: 'Adding means putting things together!',
    steps: [
      { visual: '🐱🐱 + 🐱🐱🐱', text: 'We have 2 cats and 3 more cats join them.', lumiTip: 'Addition puts groups together.' },
      { visual: '🐱🐱🐱🐱🐱', text: '2 + 3 = <b>5</b> cats altogether!', lumiTip: 'Count them all to find the answer.' },
      { visual: '<div class="bar-demo"><div class="bar-part" style="flex:3;background:var(--sky)">3</div><div class="bar-part" style="flex:4;background:var(--coral)">4</div></div><div class="bar-total">3 + 4 = 7</div>', text: 'A <b>bar model</b> shows how parts make a whole.', lumiTip: 'Bar models are super useful for word problems!' },
      { type: 'try', visual: '🌸🌸🌸🌸 + 🌸🌸', prompt: 'How many flowers altogether?', options: ['5', '6', '7'], answer: '6', successMsg: '4 + 2 = 6. Wonderful!' }
    ]
  },

  sub: {
    title: 'Subtraction',
    icon: '➖',
    lumiSays: 'Subtracting means taking away!',
    steps: [
      { visual: '🍪🍪🍪🍪🍪', text: 'We have 5 cookies.', lumiTip: 'We start with the bigger number.' },
      { visual: '🍪🍪🍪<span class="crossed">🍪🍪</span>', text: 'We eat 2 cookies. Cross them out!', lumiTip: 'Crossing out helps us see what\'s left.' },
      { visual: '🍪🍪🍪', text: '5 − 2 = <b>3</b> cookies left!', lumiTip: 'Subtraction finds how many are left.' },
      { type: 'try', visual: '⭐⭐⭐⭐⭐⭐ take away ⭐⭐', prompt: '6 − 2 = ?', options: ['3', '4', '5'], answer: '4', successMsg: '6 − 2 = 4. Brilliant!' }
    ]
  },

  cmp: {
    title: 'Comparing Numbers',
    icon: '⚖️',
    lumiSays: 'Let\'s learn which numbers are bigger or smaller!',
    steps: [
      { visual: '<div class="cmp-demo"><div class="cmp-group"><div class="cmp-count">3</div>🐸🐸🐸</div><div class="cmp-sign">&lt;</div><div class="cmp-group"><div class="cmp-count">5</div>🐸🐸🐸🐸🐸</div></div>', text: '3 is <b>less than</b> 5. We write 3 &lt; 5.', lumiTip: 'The pointy side faces the smaller number!' },
      { visual: '<div class="cmp-demo"><div class="cmp-group"><div class="cmp-count">7</div>🌺🌺🌺🌺🌺🌺🌺</div><div class="cmp-sign">&gt;</div><div class="cmp-group"><div class="cmp-count">4</div>🌺🌺🌺🌺</div></div>', text: '7 is <b>greater than</b> 4. We write 7 &gt; 4.', lumiTip: 'The open side faces the bigger number — like a hungry crocodile!' },
      { visual: '<div class="cmp-demo"><div class="cmp-group"><div class="cmp-count">5</div>🎈🎈🎈🎈🎈</div><div class="cmp-sign">=</div><div class="cmp-group"><div class="cmp-count">5</div>🎈🎈🎈🎈🎈</div></div>', text: '5 is <b>equal to</b> 5. Same amount!', lumiTip: 'Equal means exactly the same!' },
      { type: 'try', prompt: 'Which is correct? 8 __ 3', options: ['8 < 3', '8 > 3', '8 = 3'], answer: '8 > 3', successMsg: '8 is greater than 3!' }
    ]
  },

  pat: {
    title: 'Patterns',
    icon: '🔄',
    lumiSays: 'Patterns repeat! Let\'s find the rule!',
    steps: [
      { visual: '🔴🔵🔴🔵🔴🔵', text: 'Red, blue, red, blue... the pattern repeats!', lumiTip: 'Look for what comes over and over.' },
      { visual: '🔺🔺⬜🔺🔺⬜🔺🔺❓', text: 'Triangle, triangle, square... what comes next?', lumiTip: 'Find the repeating group first.' },
      { visual: '2, 4, 6, 8, __', text: 'Number patterns! We add 2 each time. Next is <b>10</b>!', lumiTip: 'Ask: what is the rule? +1? +2? +3?' },
      { type: 'try', prompt: 'What comes next? 🌟🌙🌟🌙🌟 __', options: ['🌟', '🌙', '☀️'], answer: '🌙', successMsg: 'The pattern is star, moon, star, moon!' }
    ]
  },

  wp1: {
    title: 'Word Problems',
    icon: '📝',
    lumiSays: 'Word problems are stories with numbers!',
    steps: [
      { visual: '🧸🧸🧸 ➕ 🧸🧸', text: 'Anastasia has 3 toys. She gets 2 more. How many now?', lumiTip: '"Gets more" means we ADD!' },
      { visual: '<div class="bar-demo"><div class="bar-part" style="flex:3;background:var(--sky)">3</div><div class="bar-part" style="flex:2;background:var(--mint)">2</div></div><div class="bar-total">3 + 2 = 5 toys!</div>', text: 'Draw a bar model to help! The parts make the whole.', lumiTip: 'Bar models make word problems easier!' },
      { text: '<b>Key words to look for:</b><br>"altogether" → add<br>"left" or "remaining" → subtract<br>"more than" → add or compare<br>"fewer" → subtract or compare', lumiTip: 'Circle the key words in the question!' },
      { type: 'try', prompt: 'Lumi has 7 stars. She gives 3 away. How many are left?', options: ['3', '4', '10'], answer: '4', successMsg: '7 − 3 = 4. You used the key word "left"!' }
    ]
  },

  shp: {
    title: 'Shapes',
    icon: '🔷',
    lumiSays: 'Shapes are everywhere! Let\'s learn their names!',
    steps: [
      { visual: '<div style="font-size:60px">⬜ ⬟ 🔺 ⭕</div>', text: 'Square, pentagon, triangle, circle!', lumiTip: 'Count the sides and corners!' },
      { text: '<b>Sides and Corners:</b><br>🔺 Triangle = 3 sides, 3 corners<br>⬜ Square = 4 equal sides, 4 corners<br>⬟ Rectangle = 4 sides, 4 corners<br>⭕ Circle = 0 sides, 0 corners', lumiTip: 'A square is a special rectangle!' },
      { type: 'match', text: 'Match the shape to its number of sides!', pairs: [
        { left: '🔺 Triangle', right: '3 sides' },
        { left: '⬜ Square', right: '4 sides' },
        { left: '⭕ Circle', right: '0 sides' },
        { left: '⬟ Pentagon', right: '5 sides' }
      ]},
      { type: 'try', prompt: 'How many corners does a triangle have?', options: ['2', '3', '4'], answer: '3', successMsg: 'A triangle has 3 corners and 3 sides!' }
    ]
  },

  // ── P2 EXPANSION ──
  add100: {
    title: 'Addition to 100',
    icon: '🧮',
    lumiSays: 'Let\'s add bigger numbers!',
    steps: [
      { visual: '<div class="place-val-demo"><div class="pv-col"><div class="pv-label">Tens</div><div class="pv-blocks">🟦🟦🟦</div><div>30</div></div><div class="pv-col"><div class="pv-label">Ones</div><div class="pv-blocks">🟩🟩🟩🟩</div><div>4</div></div></div>', text: '34 = 3 tens and 4 ones!', lumiTip: 'Break numbers into tens and ones.' },
      { text: '<b>Adding with regrouping:</b><br>27 + 15<br>= 20 + 7 + 10 + 5<br>= 30 + 12<br>= 30 + 10 + 2<br>= <b>42</b>', lumiTip: 'When ones add up to more than 10, we regroup!' },
      { type: 'try', prompt: '36 + 22 = ?', options: ['56', '58', '54'], answer: '58', successMsg: '36 + 22 = 58. Great adding!' }
    ]
  },

  sub100: {
    title: 'Subtraction to 100',
    icon: '📐',
    lumiSays: 'Subtracting bigger numbers is the same idea!',
    steps: [
      { text: '<b>Subtracting step by step:</b><br>53 − 21<br>= 50 − 20 and 3 − 1<br>= 30 + 2<br>= <b>32</b>', lumiTip: 'Subtract tens from tens, ones from ones.' },
      { text: '<b>With regrouping:</b><br>42 − 17<br>Ones: 2 − 7? Not enough!<br>Borrow 1 ten: 12 − 7 = 5<br>Tens: 3 − 1 = 2<br>= <b>25</b>', lumiTip: 'Borrow from the tens when ones aren\'t enough.' },
      { type: 'try', prompt: '65 − 23 = ?', options: ['42', '43', '44'], answer: '42', successMsg: '65 − 23 = 42. Well done!' }
    ]
  },

  mul: {
    title: 'Multiplication',
    icon: '✖️',
    lumiSays: 'Multiplication is fast adding!',
    steps: [
      { visual: '<div class="array-demo"><div class="array-row">🍎🍎🍎</div><div class="array-row">🍎🍎🍎</div><div class="array-row">🍎🍎🍎</div><div class="array-row">🍎🍎🍎</div></div>', text: '4 rows of 3 apples = 4 × 3 = <b>12</b>!', lumiTip: 'An array shows multiplication as rows and columns.' },
      { text: '<b>Times tables trick:</b><br>2× = doubles (2,4,6,8,10...)<br>5× = ends in 0 or 5<br>10× = add a zero!', lumiTip: 'Learn 2s, 5s, and 10s first — they\'re the easiest!' },
      { type: 'try', prompt: '3 × 5 = ?', options: ['12', '15', '18'], answer: '15', successMsg: '3 groups of 5 = 15!' }
    ]
  },

  div: {
    title: 'Division',
    icon: '➗',
    lumiSays: 'Division is sharing equally!',
    steps: [
      { visual: '🍬🍬🍬🍬🍬🍬 → 👧👧👧', text: '6 sweets shared among 3 friends. Each gets <b>2</b>!', lumiTip: 'Division is the opposite of multiplication.' },
      { text: '<b>Two ways to think about division:</b><br>12 ÷ 3 = 4<br>• Sharing: 12 sweets in 3 groups = 4 each<br>• Grouping: How many 3s in 12? → 4 groups', lumiTip: 'If you know your times tables, division is easy!' },
      { type: 'try', prompt: '10 ÷ 2 = ?', options: ['4', '5', '6'], answer: '5', successMsg: '10 shared between 2 = 5 each!' }
    ]
  },

  frac1: {
    title: 'Fractions',
    icon: '🥧',
    lumiSays: 'Fractions are parts of a whole!',
    steps: [
      { visual: '<div style="display:flex;gap:4px"><div style="width:50px;height:50px;background:var(--sky);border-radius:4px"></div><div style="width:50px;height:50px;background:var(--bg-mid);border:2px dashed var(--text-dim);border-radius:4px"></div></div>', text: 'This shape is cut into 2 equal parts. 1 is shaded = <b>½</b> (one half)', lumiTip: 'The bottom number tells how many equal parts. The top tells how many are shaded.' },
      { visual: '<div style="display:flex;gap:4px"><div style="width:40px;height:40px;background:var(--coral);border-radius:4px"></div><div style="width:40px;height:40px;background:var(--bg-mid);border:2px dashed var(--text-dim);border-radius:4px"></div><div style="width:40px;height:40px;background:var(--bg-mid);border:2px dashed var(--text-dim);border-radius:4px"></div><div style="width:40px;height:40px;background:var(--bg-mid);border:2px dashed var(--text-dim);border-radius:4px"></div></div>', text: '1 out of 4 parts = <b>¼</b> (one quarter)', lumiTip: 'Equal parts means each piece is the same size!' },
      { type: 'try', prompt: 'A pizza is cut into 4 slices. You eat 2. What fraction did you eat?', options: ['¼', '½', '¾'], answer: '½', successMsg: '2 out of 4 = ½. Half the pizza!' }
    ]
  },

  money: {
    title: 'Money',
    icon: '💰',
    lumiSays: 'Let\'s learn about Singapore money!',
    steps: [
      { text: '<b>Singapore Coins:</b><br>🪙 5¢, 10¢, 20¢, 50¢<br><b>Singapore Notes:</b><br>💵 $2, $5, $10, $50', lumiTip: '100 cents = 1 dollar!' },
      { text: '<b>Adding money:</b><br>A pencil costs $2.<br>An eraser costs $1.<br>Total = $2 + $1 = <b>$3</b>', lumiTip: 'Adding prices is just like regular addition!' },
      { type: 'try', prompt: 'A book costs $5. You pay with $10. What is your change?', options: ['$3', '$5', '$15'], answer: '$5', successMsg: '$10 − $5 = $5 change!' }
    ]
  },

  time1: {
    title: 'Telling Time',
    icon: '🕐',
    lumiSays: 'Let\'s read the clock!',
    steps: [
      { text: '<b>The clock has 2 hands:</b><br>🔵 Short hand = <b>hour</b><br>🔴 Long hand = <b>minutes</b><br>When the long hand points to 12, it\'s "o\'clock"!', lumiTip: 'The short hand moves slowly, the long hand moves fast!' },
      { text: '<b>Half past:</b><br>When the long hand points to 6, it\'s "half past".<br>🕧 = half past 12<br>🕐 = 1 o\'clock', lumiTip: 'Half past means 30 minutes past the hour.' },
      { type: 'try', prompt: 'The short hand is on 3, the long hand is on 12. What time is it?', options: ['12 o\'clock', '3 o\'clock', 'Half past 3'], answer: '3 o\'clock', successMsg: 'Long hand on 12 = o\'clock!' }
    ]
  },

  pgraph: {
    title: 'Picture Graphs',
    icon: '📊',
    lumiSays: 'Graphs help us compare information!',
    steps: [
      { text: '<b>Favourite Fruit:</b><br>🍎🍎🍎🍎 = 4 children<br>🍌🍌🍌 = 3 children<br>🍇🍇🍇🍇🍇 = 5 children', lumiTip: 'Count the pictures to find the number!' },
      { text: '<b>What can we learn?</b><br>Most popular = Grapes (5)<br>Least popular = Banana (3)<br>Difference = 5 − 3 = 2', lumiTip: 'Graphs help us answer questions about data.' },
      { type: 'try', prompt: 'In the graph above, how many more children like grapes than bananas?', options: ['1', '2', '3'], answer: '2', successMsg: '5 − 3 = 2 more children!' }
    ]
  },

  lenmass: {
    title: 'Length & Mass',
    icon: '📏',
    lumiSays: 'Let\'s measure things!',
    steps: [
      { text: '<b>Length</b> tells how long something is.<br>We use <b>cm</b> (centimetres) and <b>m</b> (metres).<br>100 cm = 1 m', lumiTip: 'A ruler measures centimetres. Your arm is about 1 metre!' },
      { text: '<b>Mass</b> tells how heavy something is.<br>We use <b>g</b> (grams) and <b>kg</b> (kilograms).<br>1000 g = 1 kg', lumiTip: 'A bag of rice is about 1 kg!' },
      { type: 'try', prompt: 'Which is longer: 50 cm or 1 m?', options: ['50 cm', '1 m', 'Same'], answer: '1 m', successMsg: '1 m = 100 cm, so 1 m is longer!' }
    ]
  }
};

// Get lesson data for a skill, returns null if not available
function getMathLesson(skillId) {
  return MATH_LESSONS[skillId] || null;
}

// Get flashcard data for math facts
function getMathFlashcards(skillId) {
  var cards = [];

  if (skillId === 'nbond') {
    for (var whole = 3; whole <= 10; whole++) {
      var part1 = Math.floor(Math.random() * (whole - 1)) + 1;
      cards.push({ front: whole + ' = ' + part1 + ' + ?', back: String(whole - part1), image: '🔗' });
    }
  }

  if (skillId === 'add') {
    [[2,3],[4,5],[3,6],[7,2],[5,5],[8,1],[6,4],[3,7],[9,1],[4,4]].forEach(function(pair) {
      cards.push({ front: pair[0] + ' + ' + pair[1], back: String(pair[0] + pair[1]), image: '➕' });
    });
  }

  if (skillId === 'sub') {
    [[5,2],[7,3],[9,4],[8,5],[6,1],[10,3],[7,4],[9,6],[8,3],[10,7]].forEach(function(pair) {
      cards.push({ front: pair[0] + ' − ' + pair[1], back: String(pair[0] - pair[1]), image: '➖' });
    });
  }

  if (skillId === 'mul') {
    [2,3,4,5,10].forEach(function(times) {
      for (var i = 1; i <= 5; i++) {
        cards.push({ front: i + ' × ' + times, back: String(i * times), image: '✖️' });
      }
    });
  }

  return cards.length > 0 ? cards : null;
}
