/* =========================================================
   /studio/shared/topic-render.js
   Generic Phase-1 renderer for topic pages.
   - Populates the Learn tab's Key Questions + Glossary from
     /studio/shared/content/<theme>.json.
   - Populates the Key Ideas tab if it exists on the page
     (B3). Each idea has a "I said it" self-check and an
     AI-graded "Say it back" recall flow. Check state
     persists under jgl.progress.topics[id].keyIdeaState.
   - Falls back to a calm inline error on fetch failure.
   ========================================================= */

(function () {
  function resolveTopicId() {
    if (typeof window.STUDIO_TOPIC_ID === 'string' && window.STUDIO_TOPIC_ID) {
      return window.STUDIO_TOPIC_ID;
    }
    const m = location.pathname.match(/\/topics\/([^\/]+)\/?/);
    return m ? m[1] : null;
  }

  function labelByText(cue, text) {
    const labels = cue.querySelectorAll('.cornell-cue-label');
    for (const l of labels) {
      if (l.textContent.trim().toLowerCase() === text.toLowerCase()) return l;
    }
    return null;
  }

  function clearAfter(anchor, predicate) {
    let n = anchor.nextElementSibling;
    while (n && predicate(n)) {
      const next = n.nextElementSibling;
      n.remove();
      n = next;
    }
  }

  function setPlaceholder(cue, text) {
    const ph = document.createElement('div');
    ph.className = 'topic-render-placeholder';
    ph.setAttribute('role', 'status');
    ph.style.cssText = 'font-size:.75rem;color:var(--muted);font-style:italic;margin:.35rem 0 .6rem .05rem';
    ph.textContent = text;
    cue.appendChild(ph);
    return ph;
  }

  function showError(cue, message) {
    const el = document.createElement('div');
    el.className = 'topic-render-error';
    el.setAttribute('role', 'alert');
    el.style.cssText = 'font-size:.78rem;color:#fca5a5;background:#2a0f10;border:1px solid #5b2020;border-radius:7px;padding:.5rem .7rem;margin:.4rem 0';
    el.textContent = message;
    cue.appendChild(el);
  }

  function renderKeyQuestions(cue, keyQuestions) {
    const label = labelByText(cue, 'Key Questions') || cue.querySelector('.cornell-cue-label');
    if (!label) return;
    clearAfter(label, n => n.classList.contains('cue-question'));
    if (!Array.isArray(keyQuestions) || !keyQuestions.length) return;
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
    const label = labelByText(cue, 'Glossary');
    if (!label) return;
    clearAfter(label, n => n.classList.contains('glossary-term'));
    if (!Array.isArray(glossary) || !glossary.length) return;
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
    label.insertAdjacentElement('afterend', frag.firstChild);
    let cursor = label.nextElementSibling;
    while (frag.firstChild) {
      cursor.insertAdjacentElement('afterend', frag.firstChild);
      cursor = cursor.nextElementSibling;
    }
    if (typeof window.initGlossary === 'function') window.initGlossary();
  }

  // ── Key Ideas state ────────────────────────────────────
  function keyIdeaState(topicId) {
    try {
      if (window.JglStorage) {
        const p = window.JglStorage.getProgress();
        const t = p.topics[topicId] || {};
        return Array.isArray(t.keyIdeaState) ? t.keyIdeaState : [];
      }
    } catch {}
    return [];
  }

  function persistKeyIdea(topicId, idx, value) {
    if (!window.JglStorage) return;
    window.JglStorage.update(p => {
      const t = p.topics[topicId] || (p.topics[topicId] = {});
      const arr = Array.isArray(t.keyIdeaState) ? t.keyIdeaState.slice() : [];
      while (arr.length <= idx) arr.push(false);
      arr[idx] = !!value;
      t.keyIdeaState = arr;
      return p;
    });
  }

  function renderKeyIdeas(topic) {
    const pane = document.getElementById('tab-keyideas');
    const slot = pane && pane.querySelector('[data-key-ideas-root]');
    if (!slot) return;
    const ideas = Array.isArray(topic.keyIdeas) ? topic.keyIdeas : [];
    slot.innerHTML = '';
    if (!ideas.length) {
      slot.innerHTML = '<p class="summary-text" style="color:var(--muted);font-style:italic">Key Ideas for this topic are not available yet.</p>';
      return;
    }
    const state = keyIdeaState(topic.id);
    const list = document.createElement('ol');
    list.className = 'key-ideas-list';
    ideas.forEach((idea, i) => {
      const li = document.createElement('li');
      li.className = 'key-idea' + (state[i] ? ' done' : '');
      li.dataset.index = String(i);

      const num = document.createElement('span');
      num.className = 'key-idea-num';
      num.textContent = (i + 1).toString().padStart(2, '0');

      const body = document.createElement('div');
      body.className = 'key-idea-body';
      body.textContent = idea;

      const actions = document.createElement('div');
      actions.style.cssText = 'display:flex;flex-direction:column;gap:.35rem;align-items:stretch';

      const check = document.createElement('button');
      check.type = 'button';
      check.className = 'key-idea-check';
      check.setAttribute('aria-pressed', state[i] ? 'true' : 'false');
      check.textContent = state[i] ? '✓ I said it' : '✓ I said it';
      check.addEventListener('click', () => {
        const on = li.classList.toggle('done');
        check.setAttribute('aria-pressed', on ? 'true' : 'false');
        persistKeyIdea(topic.id, i, on);
      });

      const recall = document.createElement('button');
      recall.type = 'button';
      recall.className = 'key-idea-check';
      recall.textContent = '📝 Say it back';
      recall.addEventListener('click', () => {
        li.classList.toggle('recalling');
      });

      actions.appendChild(check);
      actions.appendChild(recall);

      const recallPanel = document.createElement('div');
      recallPanel.className = 'key-idea-recall';
      const ta = document.createElement('textarea');
      ta.placeholder = 'Say this idea back in your own words...';
      ta.setAttribute('aria-label', `Say idea ${i + 1} back in your own words`);
      const act = document.createElement('div');
      act.className = 'key-idea-recall-actions';
      const go = document.createElement('button');
      go.type = 'button';
      go.className = 'btn btn-primary';
      go.style.cssText = 'font-size:.78rem;padding:.35rem .85rem';
      go.textContent = 'Check';
      const fb = document.createElement('div');
      fb.className = 'key-idea-recall-feedback';
      go.addEventListener('click', () => checkRecall(idea, ta.value, fb, () => {
        li.classList.add('done');
        check.setAttribute('aria-pressed', 'true');
        persistKeyIdea(topic.id, i, true);
      }));
      act.appendChild(go);
      recallPanel.appendChild(ta);
      recallPanel.appendChild(act);
      recallPanel.appendChild(fb);

      li.appendChild(num);
      li.appendChild(body);
      li.appendChild(actions);
      li.appendChild(recallPanel);
      list.appendChild(li);
    });
    slot.appendChild(list);
  }

  async function checkRecall(idea, studentText, feedbackEl, onPass) {
    const trimmed = (studentText || '').trim();
    feedbackEl.classList.remove('pass', 'miss');
    if (trimmed.length < 10) {
      feedbackEl.textContent = 'Write a full sentence. 10+ characters.';
      feedbackEl.classList.add('miss');
      return;
    }
    if (!window.askGemini) {
      // No AI available: accept and move on.
      feedbackEl.textContent = 'Looks good. (Self-check mode.)';
      feedbackEl.classList.add('pass');
      onPass();
      return;
    }
    const key = (window.JglStorage && window.JglStorage.getGeminiKey && window.JglStorage.getGeminiKey()) || '';
    if (!key) {
      feedbackEl.textContent = 'Looks good. (No AI key; self-check mode.)';
      feedbackEl.classList.add('pass');
      onPass();
      return;
    }
    feedbackEl.textContent = 'Checking...';
    const system = (window.JglCoach && window.JglCoach.VOICE) || '';
    const prompt = `A Primary 6 student is trying to say this AL1 Key Idea back in their own words.\n\nOriginal: "${idea}"\n\nStudent: "${trimmed}"\n\nReturn ONLY a JSON object {"pass": true|false, "feedback": "one short sentence; if missing, name the key term missed"}. Pass if the student's version captures the same causal structure and uses at least one of the precise terms.`;
    try {
      const out = await window.askGemini({ system, prompt, temperature: 0.2, maxTokens: 160, responseMimeType: 'application/json', asJson: true });
      const pass = !!(out && out.pass);
      const fb = (out && out.feedback) || (pass ? 'Good.' : 'Close. Try again and keep the precise term.');
      feedbackEl.textContent = fb;
      feedbackEl.classList.add(pass ? 'pass' : 'miss');
      if (pass) onPass();
    } catch (err) {
      feedbackEl.textContent = 'Self-check mode: AI unavailable. ' + (err.message || '');
      feedbackEl.classList.add('pass');
      onPass();
    }
  }

  // ── Bootstrap ────────────────────────────────────────
  async function run() {
    const topicId = resolveTopicId();
    const learn = document.querySelector('#tab-learn');
    const cue = (learn || document).querySelector('.cornell-cue');

    if (!window.JglContent || !topicId || !cue) return;

    const ph = setPlaceholder(cue, 'Loading topic content...');

    let topic = null;
    try {
      topic = await window.JglContent.loadTopic(topicId);
    } catch {
      ph.remove();
      showError(cue, 'Could not load topic content. Check your connection and reload.');
      return;
    }
    ph.remove();

    if (!topic) {
      showError(cue, 'This topic is not yet in the shared content module.');
      return;
    }

    topic.id = topic.id || topicId;
    renderKeyQuestions(cue, topic.keyQuestions);
    renderGlossary(cue, topic.glossary);
    renderKeyIdeas(topic);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run, { once: true });
  } else {
    run();
  }
})();
