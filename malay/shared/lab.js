/* =========================================================
   /studio/shared/lab.js
   Glue + tiny router for /studio/. Re-exposes the Gemini
   Settings modal behind window.JglLab.openSettings so any
   page can open it without duplicating markup.
   Also adds a common "Settings" header button on pages that
   declare <[data-studio-settings-slot]>.
   Requires storage.js, gemini.js, and /studio/shared.js to be
   loaded first (shared.js still owns showAISetup()).
   ========================================================= */

(function (global) {
  function openSettings() {
    if (typeof global.showAISetup === 'function') {
      global.showAISetup();
    } else {
      console.warn('Studio: Gemini settings modal unavailable (shared.js not loaded).');
    }
  }

  function topicUrl(topicId)    { return 'topics/' + topicId + '/'; }
  function modeUrl(modeId)      { return modeId + '/'; }
  function hubUrl()             { return 'index.html'; }

  function mountSettingsButton() {
    document.querySelectorAll('[data-studio-settings-slot]').forEach(slot => {
      if (slot.dataset.studioSettingsMounted) return;
      slot.dataset.studioSettingsMounted = '1';
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'studio-settings-btn';
      btn.setAttribute('aria-label', 'Open AI settings');
      btn.textContent = 'Settings';
      btn.addEventListener('click', openSettings);
      slot.appendChild(btn);
    });
  }

  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn, { once: true });
    } else {
      fn();
    }
  }

  ready(mountSettingsButton);

  global.JglLab = {
    openSettings,
    topicUrl,
    modeUrl,
    hubUrl,
  };
})(typeof window !== 'undefined' ? window : globalThis);
