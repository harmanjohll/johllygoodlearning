/* =========================================================
   /studio/shared/topic-render.js
   Generic Phase-1 renderer for topic pages. Derives the topic
   id from the URL (/studio/topics/<id>/) or window.STUDIO_TOPIC_ID,
   loads the topic from the shared content module, and swaps the
   inline Key Questions + Glossary inside the Learn tab for
   data-driven nodes. Fails silently if the JSON is missing so
   the inline HTML remains the fallback.
   ========================================================= */

(function () {
  function resolveTopicId() {
    if (typeof window.STUDIO_TOPIC_ID === 'string' && window.STUDIO_TOPIC_ID) {
      return window.STUDIO_TOPIC_ID;
    }
    const m = location.pathname.match(/\/topics\/([^\/]+)\/?/);
    return m ? m[1] : null;
  }

  function ensureSlot(cue, labelText) {
    const labels = cue.querySelectorAll('.cornell-cue-label');
    for (const l of labels) {
      if (l.textContent.trim().toLowerCase() === labelText.toLowerCase()) return l;
    }
    return null;
  }

  function renderKeyQuestions(cue, keyQuestions) {
    if (!Array.isArray(keyQuestions) || !keyQuestions.length) return;
    const label = cue.querySelector('.cornell-cue-label');
    if (!label) return;
    let node = label.nextElementSibling;
    while (node && node.classList.contains('cue-question')) {
      const next = node.nextElementSibling;
      node.remove();
      node = next;
    }
    let anchor = label;
    keyQuestions.forEach(q => {
      const div = document.createElement('div');
      div.className = 'cue-question';
      div.textContent = q;
      anchor.insertAdjacentElement('afterend', div);
      anchor = div;
    });
  }

  function renderGlossary(cue, glossary) {
    if (!Array.isArray(glossary) || !glossary.length) return;
    const label = ensureSlot(cue, 'Glossary');
    if (!label) return;
    cue.querySelectorAll('.glossary-term').forEach(el => el.remove());
    const frag = document.createDocumentFragment();
    glossary.forEach(item => {
      const wrap = document.createElement('div');
      wrap.className = 'glossary-term';
      const name = document.createElement('div');
      name.className = 'term-name';
      name.textContent = item.term;
      const def = document.createElement('div');
      def.className = 'term-def';
      def.textContent = item.definition;
      wrap.appendChild(name);
      wrap.appendChild(def);
      frag.appendChild(wrap);
    });
    cue.appendChild(frag);
    if (typeof window.initGlossary === 'function') window.initGlossary();
  }

  async function run() {
    if (!window.JglContent) return;
    const topicId = resolveTopicId();
    if (!topicId) return;
    let topic;
    try { topic = await window.JglContent.loadTopic(topicId); } catch { return; }
    if (!topic) return;

    const learn = document.querySelector('#tab-learn');
    const cue = (learn || document).querySelector('.cornell-cue');
    if (!cue) return;

    renderKeyQuestions(cue, topic.keyQuestions);
    renderGlossary(cue, topic.glossary);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run, { once: true });
  } else {
    run();
  }
})();
