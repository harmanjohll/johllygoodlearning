// ============================================================
//  TTS — Browser-native text-to-speech.
//  Tap a 🔊 button anywhere and the matching text reads itself.
//  Helpful for a P1 reader who can't yet sound out every word.
// ============================================================

(function() {
  var ttsSupported = !!(window.speechSynthesis && window.SpeechSynthesisUtterance);
  var voicesCache = [];

  function loadVoices() {
    if (!ttsSupported) return;
    voicesCache = window.speechSynthesis.getVoices() || [];
  }

  function ensureVoices(cb) {
    if (!ttsSupported) { cb(); return; }
    loadVoices();
    if (voicesCache.length > 0) { cb(); return; }
    window.speechSynthesis.addEventListener('voiceschanged', function once() {
      window.speechSynthesis.removeEventListener('voiceschanged', once);
      loadVoices();
      cb();
    });
    // Kick the engine on browsers that need it.
    window.speechSynthesis.getVoices();
    // Fallback in case the event never fires
    setTimeout(function() { loadVoices(); cb(); }, 400);
  }

  function pickVoice(lang) {
    if (voicesCache.length === 0) return null;
    var exact = voicesCache.find(function(v) { return v.lang === lang; });
    if (exact) return exact;
    var prefix = lang.split('-')[0];
    var prefixMatch = voicesCache.find(function(v) { return v.lang.indexOf(prefix) === 0; });
    if (prefixMatch) return prefixMatch;
    return voicesCache[0];
  }

  function speak(text, opts) {
    if (!ttsSupported || !text) {
      if (typeof lumiSay === 'function') lumiSay('Sorry — this browser can\'t read aloud.');
      return;
    }
    opts = opts || {};
    window.speechSynthesis.cancel();
    ensureVoices(function() {
      var utt = new SpeechSynthesisUtterance(text);
      utt.lang  = opts.lang  || 'en-US';
      utt.rate  = opts.rate  || 0.85;
      utt.pitch = opts.pitch || 1.05;
      utt.volume = opts.volume != null ? opts.volume : 1;
      var v = pickVoice(utt.lang);
      if (v) utt.voice = v;
      window.speechSynthesis.speak(utt);
    });
  }

  function stop() {
    if (ttsSupported) window.speechSynthesis.cancel();
  }

  // Small helper: build a tappable speaker button. Sanitises the text.
  function ttsButton(text, lang, label) {
    if (!ttsSupported) return '';
    var safe = String(text).replace(/'/g, "\\'").replace(/\n/g, ' ');
    return '<button class="tts-btn" title="' + (label || 'Read aloud') + '" ' +
      'onclick="event.stopPropagation(); ttsSpeak(\'' + safe + '\', \'' + (lang || 'en-US') + '\')">🔊</button>';
  }

  window.ttsSpeak = speak;
  window.ttsStop  = stop;
  window.ttsButton = ttsButton;
  window.ttsSupported = ttsSupported;

  // Pre-warm on page load
  if (ttsSupported) {
    setTimeout(loadVoices, 50);
    setTimeout(loadVoices, 800);
  }
})();
