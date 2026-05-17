// ============================================================
//  STASHA BRIDGE — Classic-script glue that talks to the 3D module.
//  The actual Three.js loader lives in an <script type="module"> in
//  index.html and exposes window.__stasha3D = { init, react, dispose }.
//  This module provides the public stashaInit / stashaReact API.
// ============================================================

(function() {

  var loadingPromise = null;
  var currentCanvasId = null;

  function ensureFallback(canvasId) {
    var fb = document.getElementById('stasha-fallback');
    if (fb) fb.classList.remove('hidden');
    var canvas = document.getElementById(canvasId);
    if (canvas) canvas.style.display = 'none';
  }

  function hideFallback(canvasId) {
    var fb = document.getElementById('stasha-fallback');
    if (fb) fb.classList.add('hidden');
    var canvas = document.getElementById(canvasId);
    if (canvas) canvas.style.display = '';
  }

  window.stashaInit = function(canvasId) {
    currentCanvasId = canvasId;
    var canvas = document.getElementById(canvasId);
    if (!canvas) return;

    if (!window.__stasha3D) {
      // 3D module hasn't loaded (no internet, CDN blocked, etc).
      ensureFallback(canvasId);
      // Try again in 2 seconds in case the module is still loading
      setTimeout(function() {
        if (window.__stasha3D) {
          window.stashaInit(canvasId);
        }
      }, 2000);
      return;
    }

    hideFallback(canvasId);
    try {
      window.__stasha3D.init(canvas).catch(function(err) {
        console.warn('Stasha 3D init failed', err);
        ensureFallback(canvasId);
      });
    } catch (e) {
      console.warn('Stasha 3D init threw', e);
      ensureFallback(canvasId);
    }
  };

  window.stashaReact = function(kind) {
    if (window.__stasha3D && typeof window.__stasha3D.react === 'function') {
      try { window.__stasha3D.react(kind); } catch (e) { /* silent */ }
    }
  };

  window.stashaZoom = function(mode) {
    if (window.__stasha3D && typeof window.__stasha3D.setZoom === 'function') {
      try { window.__stasha3D.setZoom(mode); } catch (e) {}
    }
    document.querySelectorAll('.stasha-zoom-btn').forEach(function(b) {
      b.classList.toggle('active', b.dataset.zoom === mode);
    });
  };

  // Stasha-flavoured TTS — higher pitch and slightly faster so she
  // sounds younger than the default. Picks an en-GB or en-US voice
  // if one is available.
  window.stashaSpeak = function(text, opts) {
    if (state && state.preferences && state.preferences.stashaMuted) return;
    if (typeof ttsSpeak !== 'function') return;
    opts = opts || {};
    ttsSpeak(text, {
      lang: opts.lang || 'en-GB',
      rate: opts.rate != null ? opts.rate : 1.05,
      pitch: opts.pitch != null ? opts.pitch : 1.45,
      volume: 0.95
    });
  };

  // Stasha's small phrase bank.
  var STASHA_PHRASES = {
    greet:   ['Hi! I am Stasha!', 'Halooo! Look at me!', 'You came back! Yay!', 'Hi friend!', 'Selamat datang! That means welcome!'],
    wave:    ['Hi! Hi! Hi!', 'Look at me wave!', 'Helloooo!', 'Hi, princess!'],
    pretty:  ['I love this outfit!', 'Do I look pretty?', 'Sparkly! Sparkly!', 'Wow, fancy!'],
    correct: ['Yes! You got it!', 'Good job, friend!', 'Hooray!', 'You\'re so smart!'],
    bye:     ['See you soon!', 'Bye-bye for now!', 'Come back tomorrow!']
  };
  window.stashaSayRandom = function(kind) {
    var pool = STASHA_PHRASES[kind] || STASHA_PHRASES.greet;
    window.stashaSpeak(pool[Math.floor(Math.random() * pool.length)]);
  };

  window.toggleStashaMute = function() {
    if (!state.preferences) state.preferences = {};
    state.preferences.stashaMuted = !state.preferences.stashaMuted;
    if (typeof saveState === 'function') saveState();
    var btn = document.getElementById('stasha-mute-btn');
    if (btn) btn.textContent = state.preferences.stashaMuted ? '🔇 Stasha muted' : '🔊 Stasha can talk';
    if (state.preferences.stashaMuted && typeof ttsStop === 'function') ttsStop();
    if (typeof lumiSay === 'function') lumiSay(state.preferences.stashaMuted ? 'Stasha\'s mic is off.' : 'Stasha can talk again!');
  };

  // Mirror Lumi mood events onto Stasha when she is on screen.
  var origLumiReactTo = window.lumiReactTo;
  if (typeof origLumiReactTo === 'function') {
    window.lumiReactTo = function(event, data) {
      try { origLumiReactTo.call(this, event, data); } catch(e) {}
      var stashaKind = {
        correct:      'happy',
        wrong:        'sad',
        levelUp:      'celebrate',
        quizComplete: data && data.pct >= 90 ? 'celebrate' : (data && data.pct >= 70 ? 'happy' : 'sad'),
        achievementUnlocked: 'celebrate',
        gardenGrow:   'happy',
        questDone:    'celebrate'
      }[event];
      if (stashaKind) window.stashaReact(stashaKind);
    };
  }
})();
