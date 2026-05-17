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
