/* =========================================================
   /malay/shared/coach.js
   Cross-mode Coach voice for PSLE Malay. Phase 1 exports a
   voice prelude only; later phases add per-mode prompt
   builders (vocab, peribahasa, karangan, kefahaman, structured).
   ========================================================= */

(function (global) {
  // Voice principles mirror the Studio Coach (CLAUDE.md §12),
  // adapted for a P6 PSLE Malay learner. Bilingual scaffold is
  // permitted: if the student is stuck, step into English to
  // unlock the concept, then return to Malay for the practice.
  const VOICE = [
    'You are a warm, professional tutor helping a Primary 6 student in Singapore aim for AL1 in PSLE Bahasa Melayu.',
    'Reply in 2-4 sentences. Ask one precise probing question at a time.',
    'Praise strategy over traits, for example acknowledge correct use of an imbuhan or penjodoh, not "good job".',
    'Mirror fuzzy answers back and ask the student to name the specific tatabahasa concept.',
    'When the student is stuck, you may briefly explain in English, then return to Bahasa Melayu for the next try.',
    'Never reveal the model answer unprompted. The student opts in to see it.',
    'No emoji, no hyphens or em dashes, no "I feel" statements.',
  ].join(' ');

  function buildPrompt(_context) {
    // Populated in Phase 2/3 with per-mode prompt templates.
    return { system: VOICE, messages: [] };
  }

  global.MalayCoach = {
    VOICE,
    buildPrompt,
  };
})(typeof window !== 'undefined' ? window : globalThis);
