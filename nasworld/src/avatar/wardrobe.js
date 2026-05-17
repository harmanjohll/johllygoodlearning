// ============================================================
//  WARDROBE — Stasha's outfit catalogue, store, and try-on UI.
//  Gamified: most items require tokens, streaks, masteries, or
//  thread completion. A few are unlocked by reaching learning levels.
// ============================================================

function getWardrobeState() {
  if (!state.wardrobe) {
    state.wardrobe = {
      owned: ['bedroom', 'soft-sparkle'],
      equipped: { hair: null, outfit: null, pet: null, background: 'bedroom', aura: 'soft-sparkle' },
      hintsSeen: false
    };
  }
  if (!Array.isArray(state.wardrobe.owned)) state.wardrobe.owned = ['bedroom', 'soft-sparkle'];
  if (!state.wardrobe.equipped) state.wardrobe.equipped = { hair: null, outfit: null, pet: null, background: 'bedroom', aura: 'soft-sparkle' };
  return state.wardrobe;
}

function _wardrobeSkillsMasteredCount() {
  if (!state.skills) return 0;
  var n = 0;
  Object.keys(state.skills).forEach(function(id) {
    if ((state.skills[id].mastery || 0) >= 80) n++;
  });
  return n;
}

function _wardrobeSkillsMasteredInWorld(worldId) {
  var trees = {
    math: typeof MATH_TREE  !== 'undefined' ? MATH_TREE  : {},
    word: typeof WORD_TREE  !== 'undefined' ? WORD_TREE  : {},
    stem: typeof STEM_TREE  !== 'undefined' ? STEM_TREE  : {},
    malay: typeof MALAY_TREE !== 'undefined' ? MALAY_TREE : {}
  };
  var tree = trees[worldId] || {};
  var n = 0;
  Object.keys(tree).forEach(function(id) {
    var s = state.skills && state.skills[id];
    if (s && (s.mastery || 0) >= 80) n++;
  });
  return n;
}

function _wardrobeWorldsTouched() {
  var touched = {};
  Object.keys(state.skills || {}).forEach(function(id) {
    if ((state.skills[id].totalAttempts || 0) === 0) return;
    if (typeof MATH_TREE  !== 'undefined' && MATH_TREE[id])  touched.math = true;
    if (typeof WORD_TREE  !== 'undefined' && WORD_TREE[id])  touched.word = true;
    if (typeof STEM_TREE  !== 'undefined' && STEM_TREE[id])  touched.stem = true;
    if (typeof MALAY_TREE !== 'undefined' && MALAY_TREE[id]) touched.malay = true;
  });
  return Object.keys(touched).length;
}

function _wardrobeThreadDone(threadId) {
  if (!state.threads || !state.threads[threadId]) return false;
  var thread = (typeof THREADS !== 'undefined') ? THREADS[threadId] : null;
  if (!thread) return false;
  var done = state.threads[threadId].completedChapters || [];
  return done.length >= thread.chapters.length;
}

function wardrobeIsUnlocked(item) {
  if (!item) return false;
  if (state.wardrobe && state.wardrobe.owned.indexOf(item.id) !== -1) return true;
  var u = item.unlock || {};
  switch (u.type) {
    case 'free':              return true;
    case 'tokens':            return (state.tokens || 0) >= u.value;
    case 'streak':            return (state.bestStreak || 0) >= u.value || (state.streak || 0) >= u.value;
    case 'level':             return (state.level || 1) >= u.value;
    case 'achievementsCount': return ((state.achievements || []).length) >= u.value;
    case 'skillsMastered':    return _wardrobeSkillsMasteredCount() >= u.value;
    case 'skillsMasteredInWorld': return _wardrobeSkillsMasteredInWorld(u.value.world) >= u.value.n;
    case 'skillMastered': {
      var s = state.skills && state.skills[u.value];
      return !!(s && (s.mastery || 0) >= 80);
    }
    case 'worldsTouched':     return _wardrobeWorldsTouched() >= u.value;
    case 'threadDone':        return _wardrobeThreadDone(u.value);
    default: return false;
  }
}

function wardrobeUnlockText(item) {
  var u = item.unlock || {};
  switch (u.type) {
    case 'free':              return 'Free!';
    case 'tokens':            return '⭐ ' + u.value + ' stars';
    case 'streak':            return '🔥 ' + u.value + '-answer streak (current or best)';
    case 'level':             return '🌟 Reach level ' + (typeof LEVEL_NAMES !== 'undefined' ? (LEVEL_NAMES[u.value] || ('lvl ' + u.value)) : ('lvl ' + u.value));
    case 'achievementsCount': return '🏆 ' + u.value + ' achievements';
    case 'skillsMastered':    return '⭐ Master ' + u.value + ' skills';
    case 'skillsMasteredInWorld': return '⭐ Master ' + u.value.n + ' skills in ' + u.value.world.toUpperCase() + ' World';
    case 'skillMastered':     return '⭐ Master "' + u.value + '"';
    case 'worldsTouched':     return '🌍 Touch all 4 worlds';
    case 'threadDone':        return '🌟 Finish the "' + u.value + '" adventure';
    default: return 'Locked';
  }
}

function wardrobeOwnedSet() {
  return new Set((state.wardrobe && state.wardrobe.owned) || []);
}

function wardrobeBuy(itemId) {
  var item = WARDROBE_ITEMS.find(function(x) { return x.id === itemId; });
  if (!item) return false;
  var w = getWardrobeState();
  if (w.owned.indexOf(itemId) !== -1) {
    // Already owned: just equip
    wardrobeEquip(itemId);
    return true;
  }
  if (!wardrobeIsUnlocked(item)) return false;

  var cost = item.cost || 0;
  if (cost > 0 && (state.tokens || 0) < cost) {
    if (typeof lumiSay === 'function') lumiSay('Need ' + (cost - (state.tokens||0)) + ' more stars for that. So close!');
    return false;
  }
  if (cost > 0) state.tokens -= cost;
  w.owned.push(itemId);
  saveState();
  wardrobeEquip(itemId);

  if (typeof playSound === 'function') playSound('unlock');
  if (typeof spawnParticles === 'function') spawnParticles(window.innerWidth/2, window.innerHeight/3, 10, item.emoji);
  if (typeof lumiSay === 'function') lumiSay('Stasha got the ' + item.name + '! Looking good.');
  return true;
}

function wardrobeEquip(itemId) {
  var item = WARDROBE_ITEMS.find(function(x) { return x.id === itemId; });
  if (!item) return;
  var w = getWardrobeState();
  if (w.owned.indexOf(itemId) === -1) return;
  if (w.equipped[item.cat] === itemId) {
    // Toggle off if already equipped (clothing items only)
    if (['hair','outfit','pet'].indexOf(item.cat) !== -1) w.equipped[item.cat] = null;
  } else {
    w.equipped[item.cat] = itemId;
  }
  saveState();
  if (typeof renderStashaOverlays === 'function') renderStashaOverlays();
  renderWardrobe(); // re-render shop to reflect new equipped state
}

function isTryOnMode() { return window._tryOnMode === true; }
function toggleTryOnMode() {
  var w = getWardrobeState();
  if (!isTryOnMode()) {
    // Entering try-on: save real equipped
    w.equippedReal = Object.assign({}, w.equipped);
    window._tryOnMode = true;
    if (typeof lumiSay === 'function') lumiSay('Try-On Mode! Tap anything to see Stasha wear it. No stars used.');
  } else {
    // Exiting: restore real
    if (w.equippedReal) {
      w.equipped = Object.assign({}, w.equippedReal);
      delete w.equippedReal;
    }
    window._tryOnMode = false;
    if (typeof lumiSay === 'function') lumiSay('Back to your real outfit!');
  }
  saveState();
  if (typeof renderStashaOverlays === 'function') renderStashaOverlays();
  renderWardrobe();
}
function resetTryOnPreview() {
  var w = getWardrobeState();
  if (!isTryOnMode() || !w.equippedReal) return;
  w.equipped = Object.assign({}, w.equippedReal);
  saveState();
  if (typeof renderStashaOverlays === 'function') renderStashaOverlays();
  renderWardrobe();
}

function renderWardrobe() {
  var container = document.getElementById('wardrobe-content');
  if (!container) return;
  var w = getWardrobeState();
  var owned = wardrobeOwnedSet();

  // Build category tabs
  var tabBar = '<div class="wardrobe-tabs">';
  WARDROBE_CATEGORIES.forEach(function(c, i) {
    var active = (window._wardrobeActiveCat || 'hair') === c.id;
    tabBar += '<button class="wardrobe-tab' + (active ? ' active' : '') + '" data-cat="' + c.id + '">' +
      c.emoji + ' ' + c.label + '</button>';
  });
  tabBar += '</div>';

  // Body for active category
  var activeCat = window._wardrobeActiveCat || 'hair';
  var items = WARDROBE_ITEMS.filter(function(it) { return it.cat === activeCat; });
  var body = '<div class="wardrobe-grid">';
  items.forEach(function(it) {
    var unlocked = wardrobeIsUnlocked(it) || owned.has(it.id);
    var isOwned = owned.has(it.id);
    var isEquipped = w.equipped[it.cat] === it.id;
    var cls = ['wardrobe-item'];
    if (!unlocked) cls.push('locked');
    if (isOwned) cls.push('owned');
    if (isEquipped) cls.push('equipped');

    body += '<div class="' + cls.join(' ') + '" data-id="' + it.id + '">';
    body += '<div class="wardrobe-emoji">' + it.emoji + '</div>';
    body += '<div class="wardrobe-name">' + it.name + '</div>';
    body += '<div class="wardrobe-desc">' + (it.desc || '') + '</div>';
    if (isEquipped) {
      body += '<div class="wardrobe-badge equipped">Equipped ✓</div>';
    } else if (isOwned) {
      body += '<button class="wardrobe-btn equip">Wear it →</button>';
    } else if (unlocked) {
      body += '<button class="wardrobe-btn buy">' +
        (it.cost > 0 ? 'Get for ⭐ ' + it.cost : 'Unlock now') + '</button>';
    } else {
      body += '<div class="wardrobe-badge locked">🔒 ' + wardrobeUnlockText(it) + '</div>';
    }
    body += '</div>';
  });
  body += '</div>';

  // Header with token balance
  var header = '<button class="back-btn" onclick="showScreen(\'stasha\')">← Back to Stasha</button>';
  header += '<div class="wardrobe-header">';
  header += '<h2>Stasha\'s Wardrobe</h2>';
  header += '<div class="wardrobe-balance">⭐ ' + (state.tokens || 0) + '</div>';
  header += '</div>';
  header += '<div class="wardrobe-intro">Earn stars and finish adventures to unlock new looks. Tap a tab to browse.</div>';

  // Try-On Mode banner
  var tryOnBtn = isTryOnMode()
    ? '<button class="lesson-btn lesson-btn-done" onclick="toggleTryOnMode()">✅ Exit Try-On (keep my real outfit)</button>' +
      '<button class="lesson-btn" onclick="resetTryOnPreview()">↺ Reset preview</button>'
    : '<button class="lesson-btn" onclick="toggleTryOnMode()">🎀 Enter Try-On Mode (preview any item)</button>';
  header += '<div class="tryon-row' + (isTryOnMode() ? ' active' : '') + '">';
  header += (isTryOnMode()
    ? '<div class="tryon-note">🎀 <strong>Try-On Mode is on.</strong> Tap anything to preview. Stars and unlocks are off. Your real outfit is saved.</div>'
    : '<div class="tryon-note">Want to see how things look before earning them?</div>');
  header += '<div class="tryon-buttons">' + tryOnBtn + '</div>';
  header += '</div>';

  container.innerHTML = header + tabBar + body;

  // Wire tab clicks
  container.querySelectorAll('.wardrobe-tab').forEach(function(t) {
    t.onclick = function() {
      window._wardrobeActiveCat = t.dataset.cat;
      renderWardrobe();
    };
  });

  // Wire item clicks (buy or equip, or preview in try-on mode)
  container.querySelectorAll('.wardrobe-item').forEach(function(el) {
    var id = el.dataset.id;
    var item = WARDROBE_ITEMS.find(function(x) { return x.id === id; });
    if (!item) return;
    var unlocked = wardrobeIsUnlocked(item);
    var isOwned = owned.has(id);
    el.onclick = function() {
      if (isTryOnMode()) {
        // Preview-equip without earning or spending
        var ws = getWardrobeState();
        if (ws.equipped[item.cat] === id) {
          if (['hair','outfit','pet'].indexOf(item.cat) !== -1) ws.equipped[item.cat] = null;
        } else {
          ws.equipped[item.cat] = id;
        }
        saveState();
        if (typeof renderStashaOverlays === 'function') renderStashaOverlays();
        renderWardrobe();
        return;
      }
      if (!unlocked && !isOwned) {
        if (typeof lumiSay === 'function') lumiSay('Locked! Hint: ' + wardrobeUnlockText(item));
        return;
      }
      if (isOwned) {
        wardrobeEquip(id);
      } else {
        wardrobeBuy(id);
      }
    };
  });
}

// === Stasha overlay layer ===
// 2D items rendered on top of the canvas: hair, accessories, outfits as sprites,
// pets as DOM elements, backgrounds as CSS gradients, auras as CSS shadows.

function renderStashaOverlays() {
  var host = document.getElementById('stasha-overlay');
  if (!host) return;
  var w = getWardrobeState();

  var bgItem = WARDROBE_ITEMS.find(function(x) { return x.id === w.equipped.background; });
  var auraItem = WARDROBE_ITEMS.find(function(x) { return x.id === w.equipped.aura; });
  var hairItem = WARDROBE_ITEMS.find(function(x) { return x.id === w.equipped.hair; });
  var outfitItem = WARDROBE_ITEMS.find(function(x) { return x.id === w.equipped.outfit; });
  var petItem = WARDROBE_ITEMS.find(function(x) { return x.id === w.equipped.pet; });

  var stage = document.getElementById('stasha-stage');
  if (stage) {
    stage.className = 'stasha-stage bg-' + (bgItem ? bgItem.id : 'bedroom');
  }

  var aura = document.getElementById('stasha-aura');
  if (aura) aura.className = 'stasha-aura aura-' + (auraItem ? auraItem.id : 'soft-sparkle');

  var hairEl = document.getElementById('stasha-hair');
  if (hairEl) hairEl.textContent = hairItem ? hairItem.emoji : '';

  var outfitEl = document.getElementById('stasha-outfit');
  if (outfitEl) outfitEl.textContent = outfitItem ? outfitItem.emoji : '';

  var petEl = document.getElementById('stasha-pet');
  if (petEl) petEl.textContent = petItem ? petItem.emoji : '';
}

// ===== Stasha screen renderer =====

function renderStashaScreen() {
  var container = document.getElementById('stasha-content');
  if (!container) return;

  var w = getWardrobeState();
  var ownedCount = w.owned.length;
  var totalCount = WARDROBE_ITEMS.length;

  var html = '<button class="back-btn" onclick="showScreen(\'home\')">← Back to Home</button>';
  html += '<div class="stasha-shell">';
  html += '<div id="stasha-stage" class="stasha-stage bg-' + (w.equipped.background || 'bedroom') + '">';
  html +=   '<div id="stasha-aura" class="stasha-aura aura-' + (w.equipped.aura || 'soft-sparkle') + '"></div>';
  html +=   '<canvas id="stasha-canvas"></canvas>';
  html +=   '<div id="stasha-fallback" class="stasha-fallback hidden">';
  html +=     '<div class="stasha-fallback-emoji">👧</div>';
  html +=     '<div class="stasha-fallback-name">Stasha</div>';
  html +=     '<div class="stasha-fallback-note">3D loader busy — Stasha is here in spirit. Wardrobe still works!</div>';
  html +=   '</div>';
  html +=   '<div id="stasha-hair" class="stasha-overlay-item stasha-hair"></div>';
  html +=   '<div id="stasha-outfit" class="stasha-overlay-item stasha-outfit"></div>';
  html +=   '<div id="stasha-pet" class="stasha-overlay-item stasha-pet"></div>';
  html += '</div>';

  html += '<div class="stasha-name">Stasha 💖</div>';
  html += '<div class="stasha-bio">Anastasia\'s avatar. The better you do, the more she gets to wear.</div>';

  html += '<div class="stasha-zoom-row">';
  html += '<button class="stasha-zoom-btn" data-zoom="face" onclick="stashaZoom(\'face\')">😊 Face</button>';
  html += '<button class="stasha-zoom-btn active" data-zoom="chest" onclick="stashaZoom(\'chest\')">👕 Chest-up</button>';
  html += '<button class="stasha-zoom-btn" data-zoom="full" onclick="stashaZoom(\'full\')">🧍 Full body</button>';
  html += '</div>';

  html += '<div class="stasha-actions">';
  html += '<button class="lesson-btn lesson-btn-done" onclick="showScreen(\'wardrobe\')">👗 Open Wardrobe (' + ownedCount + '/' + totalCount + ')</button>';
  html += '<button class="lesson-btn" onclick="stashaWave()">👋 Say Hi</button>';
  html += '</div>';

  // Inventory peek
  html += '<div class="stasha-inv">';
  html += '<div class="stasha-inv-title">What you have:</div>';
  html += '<div class="stasha-inv-chips">';
  WARDROBE_CATEGORIES.forEach(function(c) {
    var ownedInCat = WARDROBE_ITEMS.filter(function(it) {
      return it.cat === c.id && w.owned.indexOf(it.id) !== -1;
    });
    html += '<div class="stasha-inv-chip">' + c.emoji + ' ' + c.label + ': ' + ownedInCat.length + '</div>';
  });
  html += '</div>';

  // Hints (next few unlocks)
  var nextUnlocks = WARDROBE_ITEMS
    .filter(function(it) {
      var u = it.unlock || {};
      if (u.type === 'free') return false;
      if (w.owned.indexOf(it.id) !== -1) return false;
      return !wardrobeIsUnlocked(it);
    })
    .slice(0, 4);
  if (nextUnlocks.length > 0) {
    html += '<div class="stasha-inv-title" style="margin-top:14px">Almost yours:</div>';
    html += '<div class="stasha-inv-chips">';
    nextUnlocks.forEach(function(it) {
      html += '<div class="stasha-inv-chip locked">' + it.emoji + ' ' + it.name + ' — ' + wardrobeUnlockText(it) + '</div>';
    });
    html += '</div>';
  }
  html += '</div>';
  html += '</div>';

  container.innerHTML = html;

  // Trigger Stasha load (3D); if Three.js not present, fallback portrait shows
  if (typeof stashaInit === 'function') {
    stashaInit('stasha-canvas');
  } else {
    var fb = document.getElementById('stasha-fallback');
    if (fb) fb.classList.remove('hidden');
  }
  renderStashaOverlays();
}

function stashaWave() {
  if (typeof stashaReact === 'function') stashaReact('wave');
  if (typeof lumiSay === 'function') {
    var greetings = ['Halooo!', 'Hi friend!', 'Selamat datang, princess!', 'Look at me, look at me!', 'Knock knock — Stasha here!'];
    lumiSay(greetings[Math.floor(Math.random() * greetings.length)]);
  }
}

window.toggleTryOnMode = toggleTryOnMode;
window.resetTryOnPreview = resetTryOnPreview;
window.renderWardrobe = renderWardrobe;
window.renderStashaScreen = renderStashaScreen;
window.renderStashaOverlays = renderStashaOverlays;
window.stashaWave = stashaWave;
window.wardrobeBuy = wardrobeBuy;
window.wardrobeEquip = wardrobeEquip;
