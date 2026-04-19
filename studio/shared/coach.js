/* =========================================================
   /studio/shared/coach.js
   Scaffold for the cross-mode Coach (CLAUDE.md §12). Phase 1
   exports empty builders so later phases can drop prompt
   templates in without touching pages. No behaviour yet.
   ========================================================= */

(function (global) {
  const VOICE = [
    'You are a warm, professional tutor helping a Primary 6 student in Singapore aim for AL1 in PSLE Science.',
    'Reply in 2-4 sentences. Ask one precise probing question at a time.',
    'Praise strategy over traits. Say what is missing when it is missing.',
    'Mirror fuzzy words back and ask for the scientific term.',
    'Never reveal the model answer unprompted.',
    'No emoji, no hyphens or em dashes, no "I feel" statements.',
  ].join(' ');

  function buildPrompt(_context) {
    // Populated in Phase 2/3. For now, return only the voice prelude
    // so any early callers still receive a valid system prompt.
    return { system: VOICE, messages: [] };
  }

  global.JglCoach = {
    VOICE,
    buildPrompt,
  };
})(typeof window !== 'undefined' ? window : globalThis);
