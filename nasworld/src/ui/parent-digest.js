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

function _parentDigestWorldOf(skillId) {
  if (typeof MATH_TREE  !== 'undefined' && MATH_TREE[skillId])  return 'math';
  if (typeof WORD_TREE  !== 'undefined' && WORD_TREE[skillId])  return 'word';
  if (typeof STEM_TREE  !== 'undefined' && STEM_TREE[skillId])  return 'stem';
  if (typeof MALAY_TREE !== 'undefined' && MALAY_TREE[skillId]) return 'malay';
  return null;
}

function _parentDigestCompose() {
  var trees = _parentDigestAllSkills();
  var consolidated = [];
  var stillHard = [];
  var growing = [];   // 40-79% mastery, attempted at least twice — "on her way"
  var attemptsByWorld = { math: 0, word: 0, stem: 0, malay: 0 };
  var masteredByWorld = { math: 0, word: 0, stem: 0, malay: 0 };
  var totalAttempts = 0;

  Object.keys(trees).forEach(function(id) {
    var s = state.skills && state.skills[id];
    if (!s || (s.totalAttempts || 0) === 0) return;
    var w = _parentDigestWorldOf(id);
    if (w) attemptsByWorld[w] += s.totalAttempts || 0;
    totalAttempts += s.totalAttempts || 0;
    if ((s.mastery || 0) >= 80) { consolidated.push(trees[id]); if (w) masteredByWorld[w]++; }
    else if ((s.mastery || 0) >= 40) growing.push(trees[id]);
    else if ((s.totalAttempts || 0) >= 3) stillHard.push(trees[id]);
  });

  var click = consolidated[Math.floor(Math.random() * consolidated.length)];
  var grow  = growing[Math.floor(Math.random() * growing.length)];
  var hard  = stillHard[Math.floor(Math.random() * stillHard.length)];

  // Better minutes estimate: ~25 seconds per question attempt + 2 min per sim play.
  var simPlays = 0;
  if (state.simPlays) Object.keys(state.simPlays).forEach(function(k){ simPlays += state.simPlays[k]; });
  var minutes = Math.round((totalAttempts * 25 + simPlays * 120) / 60);

  var threadsDone = 0;
  if (state.threads) {
    Object.keys(state.threads).forEach(function(t) {
      threadsDone += (state.threads[t].completedChapters || []).length;
    });
  }

  // Mood summary (last 7 mood entries)
  var moods = ((state.compass && state.compass.moodHistory) || []).slice(-7);
  var moodCounts = {};
  moods.forEach(function(m) { moodCounts[m.mood] = (moodCounts[m.mood] || 0) + 1; });
  var topMood = Object.keys(moodCounts).sort(function(a,b){return moodCounts[b]-moodCounts[a];})[0];

  return {
    name: state.name || 'Anastasia',
    minutes: minutes,
    totalAttempts: totalAttempts,
    simPlays: simPlays,
    consolidatedCount: consolidated.length,
    growingCount: growing.length,
    attemptsByWorld: attemptsByWorld,
    masteredByWorld: masteredByWorld,
    clicked: click ? (click.icon + ' ' + click.name) : null,
    growing: grow ? (grow.icon + ' ' + grow.name) : null,
    stillHard: hard ? (hard.icon + ' ' + hard.name) : null,
    threadsDoneThisWeek: threadsDone,
    topMood: topMood || null,
    moodCount: moods.length,
    starter:
      hard  ? ('Ask: "Show me what you do when ' + hard.name.toLowerCase() + ' feels tricky?"') :
      grow  ? ('Ask: "Tell me what you learned about ' + grow.name.toLowerCase() + '."') :
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

    var worldLabels = { math: 'Number World', word: 'Word World', stem: 'STEM World', malay: 'Dunia Melayu' };
    var worldLine = '';
    var worldsActive = [];
    Object.keys(d.attemptsByWorld).forEach(function(w) {
      if (d.attemptsByWorld[w] > 0) {
        worldsActive.push('  · ' + worldLabels[w] + ': ' + d.attemptsByWorld[w] + ' questions, ' + d.masteredByWorld[w] + ' skill' + (d.masteredByWorld[w] === 1 ? '' : 's') + ' mastered');
      }
    });
    if (worldsActive.length) worldLine = '• Activity by world:\n' + worldsActive.join('\n') + '\n';

    var moodLine = '';
    if (d.topMood && d.moodCount >= 3) {
      var moodEmoji = { drained: '🪫', low: '😕', okay: '🙂', good: '😄', strong: '💪' }[d.topMood] || '🙂';
      moodLine = '• How she felt most often: ' + moodEmoji + ' ' + d.topMood + ' (out of ' + d.moodCount + ' check-ins)\n';
    }

    var bodyText =
      'Anastasia\'s Nasworld week (' + weekLabel + ')\n\n' +
      '• Minutes practised: ~' + d.minutes + '\n' +
      '• Questions answered: ' + d.totalAttempts + '\n' +
      (d.simPlays > 0 ? '• Hands-on experiments played: ' + d.simPlays + '\n' : '') +
      '• Skills mastered: ' + d.consolidatedCount + '   |   Skills growing: ' + d.growingCount + '\n' +
      worldLine +
      moodLine +
      (d.clicked ? '• One thing that clicked: ' + d.clicked + '\n' : '') +
      (d.growing ? '• On her way: ' + d.growing + '\n' : '') +
      (d.stillHard ? '• One thing still hard: ' + d.stillHard + '\n' : '') +
      (d.threadsDoneThisWeek ? '• Real-world adventure chapters finished: ' + d.threadsDoneThisWeek + '\n' : '') +
      '\nConversation starter: ' + d.starter + '\n\n' +
      '(Anastasia chose to share this. Please celebrate effort, not just answers.)';

    html += '<div class="digest-card"><pre id="digest-text">' + bodyText.replace(/</g, '&lt;') + '</pre></div>';
    // Small bar chart of activity by world
    var maxAtt = Math.max.apply(null, Object.keys(d.attemptsByWorld).map(function(k){return d.attemptsByWorld[k];}).concat([1]));
    if (maxAtt > 0) {
      html += '<div class="digest-chart">';
      html += '<div class="digest-chart-title">Where her time went this week</div>';
      Object.keys(d.attemptsByWorld).forEach(function(w) {
        var n = d.attemptsByWorld[w];
        if (n === 0) return;
        var pct = Math.round(n / maxAtt * 100);
        html += '<div class="digest-bar-row">' +
          '<div class="digest-bar-label">' + worldLabels[w] + '</div>' +
          '<div class="digest-bar-track"><div class="digest-bar-fill digest-bar-' + w + '" style="width:' + pct + '%"></div></div>' +
          '<div class="digest-bar-num">' + n + '</div>' +
        '</div>';
      });
      html += '</div>';
    }
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
