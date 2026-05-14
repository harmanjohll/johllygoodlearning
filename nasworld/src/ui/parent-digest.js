// ============================================================
//  PARENT DIGEST — Weekly summary, opt-in.
//  Anastasia sees it first. Designed to spark a chat, not surveil.
// ============================================================

function _parentDigestAllSkills() {
  return Object.assign({},
    typeof MATH_TREE  !== 'undefined' ? MATH_TREE  : {},
    typeof WORD_TREE  !== 'undefined' ? WORD_TREE  : {},
    typeof STEM_TREE  !== 'undefined' ? STEM_TREE  : {},
    typeof MALAY_TREE !== 'undefined' ? MALAY_TREE : {}
  );
}

function _parentDigestCompose() {
  var trees = _parentDigestAllSkills();
  var consolidated = [];
  var stillHard = [];
  Object.keys(trees).forEach(function(id) {
    var s = state.skills && state.skills[id];
    if (!s || (s.totalAttempts || 0) === 0) return;
    if ((s.mastery || 0) >= 80) consolidated.push(trees[id]);
    if ((s.mastery || 0) < 40 && (s.totalAttempts || 0) >= 3) stillHard.push(trees[id]);
  });

  var click = consolidated[Math.floor(Math.random() * consolidated.length)];
  var hard  = stillHard[Math.floor(Math.random() * stillHard.length)];

  var minutes = 0;
  var moodHist = (state.compass && state.compass.moodHistory) ? state.compass.moodHistory : [];
  var weekStart = new Date(); weekStart.setDate(weekStart.getDate() - 7);
  moodHist.forEach(function(entry) {
    if (new Date(entry.date) >= weekStart) minutes += 10;
  });
  minutes += (state.visitHistory || []).filter(function(d) {
    return new Date(d) >= weekStart;
  }).length * 5;

  var threadsDone = 0;
  if (state.threads) {
    Object.keys(state.threads).forEach(function(t) {
      threadsDone += (state.threads[t].completedChapters || []).length;
    });
  }

  return {
    name: state.name || 'Anastasia',
    minutes: minutes,
    consolidatedCount: consolidated.length,
    clicked: click ? (click.icon + ' ' + click.name) : null,
    stillHard: hard ? (hard.icon + ' ' + hard.name) : null,
    threadsDoneThisWeek: threadsDone,
    starter: hard ? ('Ask: "Show me what you do when ' + hard.name.toLowerCase() + ' feels tricky?"') :
                    click ? ('Ask: "What did you find out about ' + click.name.toLowerCase() + '?"') :
                            'Ask: "What was the best part of Nasworld this week?"'
  };
}

function renderParentDigest() {
  var container = document.getElementById('parent-digest-content');
  if (!container) return;

  if (!state.parentDigest) state.parentDigest = { optIn: false, lastGenerated: '' };
  var optIn = state.parentDigest.optIn;

  var html = '<button class="back-btn" onclick="showScreen(\'home\')">← Back to Home</button>';
  html += '<div class="digest-shell">';
  html += '<h2 class="digest-title">Family Digest</h2>';
  html += '<div class="digest-intro">A short weekly note for whoever helps Anastasia learn. Anastasia sees it first. She can choose not to share — and that is fine.</div>';

  if (!optIn) {
    html += '<div class="digest-optin">';
    html += '<div class="digest-optin-q">Anastasia, do you want to share a weekly note with the grown-ups?</div>';
    html += '<button class="lesson-btn lesson-btn-done" onclick="parentDigestOptIn(true)">Yes — share it</button>';
    html += '<button class="lesson-btn" onclick="parentDigestOptIn(false)">Not right now</button>';
    html += '</div>';
  } else {
    var d = _parentDigestCompose();
    var weekLabel = (function() {
      var end = new Date();
      var start = new Date(); start.setDate(start.getDate() - 6);
      var opts = { month: 'short', day: 'numeric' };
      return start.toLocaleDateString(undefined, opts) + ' – ' + end.toLocaleDateString(undefined, opts);
    })();

    var bodyText =
      'Anastasia\'s Nasworld week (' + weekLabel + ')\n\n' +
      '• Minutes practised: ' + d.minutes + '\n' +
      '• Skills consolidated: ' + d.consolidatedCount + '\n' +
      (d.clicked ? '• One thing that clicked: ' + d.clicked + '\n' : '') +
      (d.stillHard ? '• One thing still hard: ' + d.stillHard + '\n' : '') +
      (d.threadsDoneThisWeek ? '• Real-world adventure chapters finished: ' + d.threadsDoneThisWeek + '\n' : '') +
      '\nConversation starter: ' + d.starter + '\n\n' +
      '(Anastasia chose to share this. Please celebrate effort, not just answers.)';

    html += '<div class="digest-card"><pre id="digest-text">' + bodyText.replace(/</g, '&lt;') + '</pre></div>';
    html += '<div class="digest-actions">';
    html += '<button class="lesson-btn lesson-btn-done" onclick="parentDigestCopy()">📋 Copy to clipboard</button>';
    html += '<button class="lesson-btn" onclick="window.print()">🖨️ Print this</button>';
    html += '<button class="digest-tertiary" onclick="parentDigestOptIn(false)">Turn off the digest</button>';
    html += '</div>';
  }

  html += '</div>';
  container.innerHTML = html;
}

function parentDigestOptIn(yes) {
  if (!state.parentDigest) state.parentDigest = {};
  state.parentDigest.optIn = !!yes;
  saveState();
  renderParentDigest();
  if (yes && typeof lumiSay === 'function') {
    lumiSay('Locked in. You will always see it first — promise.');
  }
}

function parentDigestCopy() {
  var pre = document.getElementById('digest-text');
  if (!pre) return;
  var text = pre.textContent;
  try {
    navigator.clipboard.writeText(text).then(function() {
      if (typeof lumiSay === 'function') lumiSay('Copied! Paste it wherever.');
    });
  } catch (e) {
    // Fallback: select and prompt user to copy manually
    var range = document.createRange();
    range.selectNode(pre);
    window.getSelection().removeAllRanges();
    window.getSelection().addRange(range);
    if (typeof lumiSay === 'function') lumiSay('Selected — press Ctrl+C (or Cmd+C) to copy.');
  }
}

window.renderParentDigest = renderParentDigest;
window.parentDigestOptIn = parentDigestOptIn;
window.parentDigestCopy = parentDigestCopy;
