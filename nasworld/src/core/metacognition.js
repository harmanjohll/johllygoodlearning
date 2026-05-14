// ============================================================
//  METACOGNITION — Confidence ratings + one-sentence reflection.
//  Tiny prompts that ask the learner to think about their own thinking.
// ============================================================

function metaConfidenceBefore(skillId, onPicked) {
  // Modal: 1 (unsure) to 5 (super sure)
  var overlay = document.createElement('div');
  overlay.className = 'meta-overlay';
  overlay.innerHTML =
    '<div class="meta-card">' +
      '<div class="meta-label">Before we start...</div>' +
      '<div class="meta-q">How sure are you about this skill right now?</div>' +
      '<div class="meta-row">' +
        '<button class="meta-face" data-c="1">😵 not sure</button>' +
        '<button class="meta-face" data-c="2">🙃 a bit</button>' +
        '<button class="meta-face" data-c="3">🙂 okay</button>' +
        '<button class="meta-face" data-c="4">😊 pretty sure</button>' +
        '<button class="meta-face" data-c="5">🤩 super sure</button>' +
      '</div>' +
    '</div>';
  document.body.appendChild(overlay);
  overlay.querySelectorAll('.meta-face').forEach(function(b) {
    b.onclick = function() {
      var c = Number(b.dataset.c);
      if (!state.meta) state.meta = { confidence: {}, reflections: [] };
      if (!state.meta.confidence[skillId]) state.meta.confidence[skillId] = [];
      state.meta.confidence[skillId].push({ ts: Date.now(), before: c });
      saveState();
      overlay.remove();
      if (typeof onPicked === 'function') onPicked(c);
    };
  });
}

var META_REFLECTION_PROMPTS = [
  'What did your brain just figure out?',
  'Say one sentence about what you learned.',
  'What is the trickiest bit you cracked?',
  'In one sentence: what would you tell a friend about this?'
];
var META_REFLECTION_OPTIONS = [
  '🌟 I nailed it',
  '🙂 I got most of it',
  '🤔 Some bits still wobbly',
  '😅 Need more practice',
  '😴 My brain is tired'
];

function metaReflectAfter(skillId, onDone) {
  var prompt = META_REFLECTION_PROMPTS[Math.floor(Math.random() * META_REFLECTION_PROMPTS.length)];
  var overlay = document.createElement('div');
  overlay.className = 'meta-overlay';
  var optHtml = META_REFLECTION_OPTIONS.map(function(o, i) {
    return '<button class="meta-reflect" data-r="' + i + '">' + o + '</button>';
  }).join('');
  overlay.innerHTML =
    '<div class="meta-card">' +
      '<div class="meta-label">One last thing...</div>' +
      '<div class="meta-q">' + prompt + '</div>' +
      '<div class="meta-row">' + optHtml + '</div>' +
      '<button class="meta-skip" onclick="this.closest(\'.meta-overlay\').remove()">Skip</button>' +
    '</div>';
  document.body.appendChild(overlay);
  overlay.querySelectorAll('.meta-reflect').forEach(function(b) {
    b.onclick = function() {
      var r = Number(b.dataset.r);
      if (!state.meta) state.meta = { confidence: {}, reflections: [] };
      state.meta.reflections.push({ ts: Date.now(), skillId: skillId, reflection: r });
      if (state.meta.reflections.length > 100) state.meta.reflections = state.meta.reflections.slice(-100);
      saveState();
      overlay.remove();
      if (typeof onDone === 'function') onDone(r);
    };
  });
}

window.metaConfidenceBefore = metaConfidenceBefore;
window.metaReflectAfter = metaReflectAfter;
