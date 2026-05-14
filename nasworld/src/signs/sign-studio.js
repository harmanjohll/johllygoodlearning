// ============================================================
//  SIGN STUDIO v1 — Anastasia teaches Stasha to sign.
//
//  Lego-style sign builder. She picks the four real linguistic
//  parameters of any sign: handshape, location, movement, orientation.
//  Stasha "tries it back" by playing an animation built from those
//  parameters. Anastasia can refine, save, or share with a parent.
//
//  IMPORTANT: This is NOT a sign-language authority. Every sign links
//  to a verified reference (SADeaf SgSL Sign Bank or YouTube channel
//  flagged by parent). The app is a practice partner and memory
//  bank — what Anastasia and Stasha worked out together.
// ============================================================

var HANDSHAPES = [
  { id: 'flat',    name: 'Flat hand',  emoji: '✋', desc: 'All five fingers together, palm flat' },
  { id: 'fist',    name: 'Fist',       emoji: '✊', desc: 'Closed hand, fingers curled in' },
  { id: 'point',   name: 'Point',      emoji: '☝️', desc: 'Index finger out, others curled' },
  { id: 'peace',   name: 'Peace',      emoji: '✌️', desc: 'Two fingers in a V' },
  { id: 'ok',      name: 'OK / O',     emoji: '👌', desc: 'Thumb and finger forming a circle' },
  { id: 'open',    name: 'Open 5',     emoji: '🖐️', desc: 'Five fingers spread out' },
  { id: 'thumbsup',name: 'Thumbs up',  emoji: '👍', desc: 'Fist with thumb pointing up' },
  { id: 'claw',    name: 'Claw',       emoji: '🦅', desc: 'Curled fingers like a claw' },
  { id: 'L',       name: 'L-shape',    emoji: '🔫', desc: 'Thumb and index forming an L' },
  { id: 'babyO',   name: 'Baby O',     emoji: '🤏', desc: 'Small circle with thumb + index' }
];

var LOCATIONS = [
  { id: 'forehead', name: 'Forehead',  desc: 'Hand near the brow' },
  { id: 'temple',   name: 'Temple',    desc: 'Side of the head' },
  { id: 'mouth',    name: 'Mouth',     desc: 'In front of the lips' },
  { id: 'chin',     name: 'Chin',      desc: 'Below the mouth' },
  { id: 'chest',    name: 'Chest',     desc: 'Centre of the chest' },
  { id: 'shoulder', name: 'Shoulder',  desc: 'Top of the shoulder' },
  { id: 'neutral',  name: 'Neutral',   desc: 'In front of body, mid height' },
  { id: 'otherhand',name: 'Other hand',desc: 'Touching or near the other hand' }
];

var MOVEMENTS = [
  { id: 'still',   name: 'Still',         desc: 'Stay put' },
  { id: 'up',      name: 'Up',            desc: 'Move upward' },
  { id: 'down',    name: 'Down',          desc: 'Move downward' },
  { id: 'side',    name: 'Sideways',      desc: 'Move side to side' },
  { id: 'circle',  name: 'Circle',        desc: 'Small circle' },
  { id: 'tap',     name: 'Tap',           desc: 'Tap twice' },
  { id: 'wave',    name: 'Wave',          desc: 'Wave the hand' },
  { id: 'forward', name: 'Forward',       desc: 'Move away from body' },
  { id: 'inward',  name: 'Inward',        desc: 'Move toward body' }
];

var ORIENTATIONS = [
  { id: 'palm-up',     name: 'Palm up' },
  { id: 'palm-down',   name: 'Palm down' },
  { id: 'palm-in',     name: 'Palm inward' },
  { id: 'palm-out',    name: 'Palm outward (facing other person)' },
  { id: 'palm-side',   name: 'Palm sideways' }
];

// Sign suggestions (small starter set — Anastasia picks one or invents her own).
// Each suggestion provides a reference URL placeholder (parent fills in) and
// optionally a "preset" that pre-fills the builder.
var SIGN_SUGGESTIONS = [
  {
    id: 'hello',
    label: 'HELLO',
    emoji: '👋',
    why: 'Greet Stasha when you open the app.',
    refUrl: 'https://signbank.sg',
    preset: { handshape: 'flat', location: 'temple', movement: 'side', orientation: 'palm-out' },
    note: 'Many signs for HELLO exist. Check signbank.sg or ask a deaf friend which feels right for you.'
  },
  {
    id: 'thank-you',
    label: 'THANK YOU',
    emoji: '🙏',
    why: 'Use after a streak of correct answers.',
    refUrl: 'https://signbank.sg',
    preset: { handshape: 'flat', location: 'chin', movement: 'forward', orientation: 'palm-in' }
  },
  {
    id: 'good',
    label: 'GOOD / WELL DONE',
    emoji: '👍',
    why: 'A small milestone reward.',
    refUrl: 'https://signbank.sg',
    preset: { handshape: 'thumbsup', location: 'neutral', movement: 'still', orientation: 'palm-side' }
  },
  {
    id: 'more',
    label: 'MORE',
    emoji: '➕',
    why: 'Between questions when she wants another go.',
    refUrl: 'https://signbank.sg',
    preset: { handshape: 'babyO', location: 'neutral', movement: 'tap', orientation: 'palm-in' }
  },
  {
    id: 'try-again',
    label: 'TRY AGAIN',
    emoji: '🔄',
    why: 'Gentle reminder after a wrong answer.',
    refUrl: 'https://signbank.sg',
    preset: { handshape: 'point', location: 'neutral', movement: 'circle', orientation: 'palm-side' }
  },
  {
    id: 'i-love-you',
    label: 'I LOVE YOU',
    emoji: '💖',
    why: 'For rest days and end of long sessions.',
    refUrl: 'https://signbank.sg',
    preset: { handshape: 'L', location: 'neutral', movement: 'still', orientation: 'palm-out' },
    note: 'Universal Sign Language ILY: thumb + index + pinky out.'
  },
  {
    id: 'one', label: 'ONE', emoji: '1️⃣', why: 'Numbers for Math World.', refUrl: 'https://signbank.sg',
    preset: { handshape: 'point', location: 'neutral', movement: 'still', orientation: 'palm-out' }
  },
  {
    id: 'two', label: 'TWO', emoji: '2️⃣', why: 'Numbers for Math World.', refUrl: 'https://signbank.sg',
    preset: { handshape: 'peace', location: 'neutral', movement: 'still', orientation: 'palm-out' }
  }
];

function getSignsState() {
  if (!state.signs) {
    state.signs = {
      // taught[suggestionId] = { handshape, location, movement, orientation, signedAt, note }
      taught: {},
      parentVerified: {}
    };
  }
  return state.signs;
}

function renderSignStudio() {
  var c = document.getElementById('sign-studio-content');
  if (!c) return;
  var signs = getSignsState();
  var taughtCount = Object.keys(signs.taught || {}).length;
  var total = SIGN_SUGGESTIONS.length;

  var html = '<button class="back-btn" onclick="showScreen(\'home\')">← Back to Home</button>';
  html += '<h2 class="sign-title">🤟 Sign Studio</h2>';
  html += '<p class="sign-blurb">Teach Stasha to sign! Watch a real sign first, then build it together. <strong>Stasha learns from you.</strong></p>';
  html += '<div class="sign-honest">⚠️ This is a practice partner, not a sign-language teacher. Always watch the real sign first. If you\'re unsure, ask a deaf friend or a parent.</div>';
  html += '<div class="sign-progress">Signs taught: <strong>' + taughtCount + ' / ' + total + '</strong></div>';

  html += '<div class="sign-grid">';
  SIGN_SUGGESTIONS.forEach(function(s) {
    var taught = !!signs.taught[s.id];
    var verified = !!signs.parentVerified[s.id];
    html += '<div class="sign-card' + (taught ? ' taught' : '') + '" onclick="openSignBuilder(\'' + s.id + '\')">' +
      '<div class="sign-card-emoji">' + s.emoji + '</div>' +
      '<div class="sign-card-label">' + s.label + '</div>' +
      '<div class="sign-card-why">' + s.why + '</div>' +
      '<div class="sign-card-status">' +
        (taught ? (verified ? '✅ Verified by parent' : '🎓 Taught') : '✨ Tap to teach') +
      '</div>' +
    '</div>';
  });
  html += '</div>';

  c.innerHTML = html;
}

function openSignBuilder(suggestionId) {
  var sug = SIGN_SUGGESTIONS.find(function(s) { return s.id === suggestionId; });
  if (!sug) return;
  var signs = getSignsState();
  var current = signs.taught[suggestionId] || sug.preset || {
    handshape: 'flat', location: 'neutral', movement: 'still', orientation: 'palm-out'
  };
  window._signBuilderState = { suggestionId: suggestionId, current: Object.assign({}, current) };
  showScreen('sign-builder');
  renderSignBuilder();
}

function renderSignBuilder() {
  var c = document.getElementById('sign-builder-content');
  if (!c || !window._signBuilderState) return;
  var st = window._signBuilderState;
  var sug = SIGN_SUGGESTIONS.find(function(s) { return s.id === st.suggestionId; });
  if (!sug) return;
  var cur = st.current;

  var html = '<button class="back-btn" onclick="showScreen(\'sign-studio\')">← Back to Sign Studio</button>';
  html += '<h2 class="sign-title">' + sug.emoji + ' Teach Stasha: ' + sug.label + '</h2>';
  html += '<p class="sign-blurb">' + sug.why + '</p>';
  html += '<div class="sign-ref">📺 <strong>Step 1: Watch the real sign.</strong> <a href="' + sug.refUrl + '" target="_blank" rel="noopener">Open signbank.sg in a new tab →</a></div>';
  if (sug.note) html += '<div class="sign-note">💡 ' + sug.note + '</div>';

  // Live preview of Stasha
  html += '<div class="sign-preview">';
  html += '<div class="sign-preview-label">Step 2: Watch Stasha sign it</div>';
  html += '<div class="sign-stasha">';
  html += '<div class="sign-stasha-body">👧</div>';
  html += '<div class="sign-stasha-hand" id="sign-hand">' + (HANDSHAPES.find(function(h){return h.id === cur.handshape;}) || HANDSHAPES[0]).emoji + '</div>';
  html += '</div>';
  html += '<button class="lesson-btn sign-play-btn" onclick="playSignPreview()">▶ Stasha, try it!</button>';
  html += '</div>';

  // Builder
  html += '<div class="sign-builder">';
  html += '<div class="sign-builder-label">Step 3: Build it (the four parts of any sign)</div>';

  html += _buildPicker('Handshape', 'handshape', HANDSHAPES, cur.handshape, true);
  html += _buildPicker('Location', 'location', LOCATIONS, cur.location, false);
  html += _buildPicker('Movement', 'movement', MOVEMENTS, cur.movement, false);
  html += _buildPicker('Orientation', 'orientation', ORIENTATIONS, cur.orientation, false);

  html += '</div>';

  // Save + verify actions
  html += '<div class="sign-save-row">';
  html += '<button class="lesson-btn lesson-btn-done" onclick="saveTaughtSign()">💾 Save — Stasha remembers this!</button>';
  html += '<button class="lesson-btn" onclick="markParentVerified()">👩‍👧 Parent-verify</button>';
  html += '</div>';

  c.innerHTML = html;
}

function _buildPicker(label, key, options, currentValue, showEmoji) {
  var html = '<div class="sign-picker">';
  html += '<div class="sign-picker-label">' + label + '</div>';
  html += '<div class="sign-picker-options">';
  options.forEach(function(o) {
    var sel = (o.id === currentValue) ? ' selected' : '';
    html += '<button class="sign-opt' + sel + '" onclick="pickSign(\'' + key + '\', \'' + o.id + '\')">';
    if (showEmoji && o.emoji) html += '<span class="sign-opt-emoji">' + o.emoji + '</span> ';
    html += o.name;
    if (o.desc) html += '<span class="sign-opt-desc">' + o.desc + '</span>';
    html += '</button>';
  });
  html += '</div></div>';
  return html;
}

function pickSign(key, value) {
  if (!window._signBuilderState) return;
  window._signBuilderState.current[key] = value;
  renderSignBuilder();
}

function playSignPreview() {
  if (!window._signBuilderState) return;
  var cur = window._signBuilderState.current;
  var hand = document.getElementById('sign-hand');
  if (!hand) return;
  // Set handshape emoji
  var hs = HANDSHAPES.find(function(h) { return h.id === cur.handshape; });
  hand.textContent = hs ? hs.emoji : '✋';

  // Position based on location
  var positions = {
    forehead:  { top: '8%',  left: '50%' },
    temple:    { top: '14%', left: '72%' },
    mouth:     { top: '36%', left: '50%' },
    chin:      { top: '44%', left: '50%' },
    chest:     { top: '54%', left: '50%' },
    shoulder:  { top: '40%', left: '74%' },
    neutral:   { top: '60%', left: '50%' },
    otherhand: { top: '60%', left: '30%' }
  };
  var pos = positions[cur.location] || positions.neutral;
  hand.style.top = pos.top;
  hand.style.left = pos.left;
  hand.style.transition = 'none';
  // Force reflow then animate movement
  hand.offsetHeight; // eslint-disable-line
  hand.style.transition = 'transform 1.2s ease-in-out';
  hand.className = 'sign-stasha-hand move-' + cur.movement;
  // Re-trigger animation
  hand.classList.remove('move-' + cur.movement);
  void hand.offsetWidth;
  hand.classList.add('move-' + cur.movement);

  if (typeof stashaReact === 'function') stashaReact('happy');
  if (typeof lumiSay === 'function') lumiSay('Stasha is signing!');
}

function saveTaughtSign() {
  if (!window._signBuilderState) return;
  var st = window._signBuilderState;
  var signs = getSignsState();
  var firstTime = !signs.taught[st.suggestionId];
  signs.taught[st.suggestionId] = Object.assign({}, st.current, { savedAt: new Date().toISOString() });
  saveState();
  if (firstTime) {
    state.tokens = (state.tokens || 0) + 12;
    if (typeof lumiReactTo === 'function') lumiReactTo('correct');
    if (typeof spawnParticles === 'function') spawnParticles(window.innerWidth/2, window.innerHeight/3, 10, '🌟');
    if (typeof lumiSay === 'function') lumiSay('Stasha learned a new sign from you! +12 stars.');
    saveState();
    if (typeof updateTokenDisplay === 'function') updateTokenDisplay();
  } else {
    if (typeof lumiSay === 'function') lumiSay('Stasha\'s sign updated!');
  }
}

function markParentVerified() {
  if (!window._signBuilderState) return;
  if (!confirm('Has a parent or deaf friend confirmed this sign matches the reference? Click OK if yes.')) return;
  var signs = getSignsState();
  signs.parentVerified[window._signBuilderState.suggestionId] = new Date().toISOString();
  saveState();
  if (typeof lumiSay === 'function') lumiSay('Verified! Stasha will use this sign confidently.');
  renderSignBuilder();
}

window.renderSignStudio = renderSignStudio;
window.renderSignBuilder = renderSignBuilder;
window.openSignBuilder = openSignBuilder;
window.pickSign = pickSign;
window.playSignPreview = playSignPreview;
window.saveTaughtSign = saveTaughtSign;
window.markParentVerified = markParentVerified;
