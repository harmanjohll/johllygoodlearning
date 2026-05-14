/* =========================================================
   /english/shared/english-topic.js
   Generic topic-page renderer for /english/. Phase 1 renders
   the Learn tab from JSON (key questions, glossary, learnHTML,
   summary, PSLE tips). Quiz tab uses initAIQuizToggle from
   shared.js. Mind Map and Drill tabs are stubs (filled in
   later phases — mirroring the Malay rollout pattern).

   Reads window.ENGLISH_TOPIC_ID set by each topic page.
   ========================================================= */

(function (global) {
  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn, { once: true });
    } else {
      fn();
    }
  }

  function el(id) { return document.getElementById(id); }
  function html(tpl) { const d = document.createElement('div'); d.innerHTML = tpl; return d; }

  function renderKeyQuestions(topic) {
    const host = el('key-questions');
    if (!host || !Array.isArray(topic.keyQuestions) || !topic.keyQuestions.length) return;
    host.innerHTML = `
      <h4>🤔 Key questions</h4>
      <ul style="padding-left:1.2rem;">
        ${topic.keyQuestions.map(q => `<li style="margin-bottom:.35rem;color:var(--muted);">${q}</li>`).join('')}
      </ul>
    `;
  }

  function renderGlossary(topic) {
    const host = el('glossary');
    if (!host) return;
    const items = Array.isArray(topic.glossary) ? topic.glossary : [];
    if (!items.length) { host.innerHTML = '<p style="color:var(--muted);font-size:.85rem;">Glossary lands in a later phase.</p>'; return; }
    host.innerHTML = `
      <div class="cornell-cue-label">Glossary</div>
      ${items.map(g => `
        <div class="glossary-term">
          <div class="term-name">${g.term}</div>
          <div class="term-def">
            ${g.definition || ''}
            ${g.template ? `<div style="margin-top:.3rem;font-style:italic;opacity:.85;">Template: ${g.template}</div>` : ''}
          </div>
        </div>
      `).join('')}
    `;
  }

  function renderLearn(topic) {
    const host = el('learn-content');
    if (!host) return;
    if (topic.learnHTML) {
      host.innerHTML = topic.learnHTML;
    } else {
      host.innerHTML = '<div class="note-section"><p>Lesson content for this topic is being curated. The Learn tab will be populated in the next phase.</p></div>';
    }
  }

  function renderSummary(topic) {
    const host = el('summary');
    if (!host) return;
    if (topic.summaryHTML) {
      host.innerHTML = `<div class="cornell-summary"><strong style="color:var(--accent);">Summary.</strong> ${topic.summaryHTML}</div>`;
    }
  }

  function renderPSLEPrompts(topic) {
    const host = el('psle-prompts');
    if (!host) return;
    const prompts = Array.isArray(topic.pslePrompts) ? topic.pslePrompts : [];
    if (!prompts.length) return;
    host.innerHTML = `
      <h4 style="color:var(--composition);">📝 PSLE Tips</h4>
      <ul style="padding-left:1.2rem;">
        ${prompts.map(p => `<li style="margin-bottom:.4rem;font-size:.88rem;">${p}</li>`).join('')}
      </ul>
    `;
  }

  // Common traps — each item is {wrong, fix, why}. Renders as
  // amber-flagged before/after pairs so the trap is visible at a
  // glance. Used when a topic's JSON includes a `commonTraps` array.
  function renderCommonTraps(topic) {
    const host = el('common-traps');
    if (!host) return;
    const traps = Array.isArray(topic.commonTraps) ? topic.commonTraps : [];
    if (!traps.length) { host.innerHTML = ''; return; }
    host.innerHTML = `
      <h4 style="color:#fbbf24;margin-top:1.5rem;">⚠ Common traps</h4>
      <div style="display:flex;flex-direction:column;gap:.7rem;">
        ${traps.map(t => `
          <div style="background:rgba(251,191,36,.06);border-left:3px solid rgba(251,191,36,.55);border-radius:0 8px 8px 0;padding:.65rem .9rem;">
            <div style="font-size:.78rem;color:#fbbf24;font-style:italic;font-weight:600;line-height:1.45;">Wrong: ${t.wrong}</div>
            <div style="font-size:.85rem;color:var(--text);margin-top:.3rem;line-height:1.5;"><strong>Fix:</strong> ${t.fix}</div>
            ${t.why ? `<div style="font-size:.78rem;color:var(--muted);margin-top:.25rem;line-height:1.45;">${t.why}</div>` : ''}
          </div>
        `).join('')}
      </div>
    `;
  }

  // Mastery checkpoints — concrete signs the student has nailed the
  // topic. Builds confidence by showing the destination, not just
  // the journey. Renders as a green-tinted checklist.
  function renderMasteryCheckpoints(topic) {
    const host = el('mastery-checkpoints');
    if (!host) return;
    const items = Array.isArray(topic.masteryCheckpoints) ? topic.masteryCheckpoints : [];
    if (!items.length) { host.innerHTML = ''; return; }
    host.innerHTML = `
      <h4 style="color:var(--grammar);margin-top:1.5rem;">✓ Mastery checkpoints</h4>
      <p style="font-size:.82rem;color:var(--muted);margin-bottom:.6rem;line-height:1.5;">When you can do all of these without thinking, this topic is locked in.</p>
      <ul style="padding-left:1.2rem;list-style:none;">
        ${items.map(m => `<li style="margin-bottom:.45rem;font-size:.88rem;line-height:1.55;position:relative;padding-left:1.2rem;">
          <span style="position:absolute;left:0;color:var(--grammar);font-weight:700;">□</span>${m}
        </li>`).join('')}
      </ul>
    `;
  }

  // Quick recap — pulls the matching Cheat Card from shared/content/cheatcards.json
  // and inserts a compact recap block ABOVE the Learn content. Built dynamically so
  // we do not have to touch all 12 topic page templates.
  async function renderQuickRecap(topicId) {
    const learnHost = el('learn-content');
    if (!learnHost) return;
    let cards;
    try {
      const r = await fetch('../../shared/content/cheatcards.json', { cache: 'no-cache' });
      cards = (await r.json()).cards || [];
    } catch (_) { return; }
    const card = cards.find(c => c.id === topicId);
    if (!card) return;

    const wrap = document.createElement('details');
    wrap.id = 'quick-recap';
    wrap.open = true;
    wrap.style.cssText = 'background:var(--card);border:1px solid var(--border);border-radius:11px;padding:1rem 1.25rem;margin-bottom:1.25rem;';
    wrap.innerHTML = `
      <summary style="cursor:pointer;display:flex;align-items:center;gap:.55rem;list-style:none;">
        <span style="font-size:.66rem;color:var(--accent);text-transform:uppercase;letter-spacing:.07em;font-weight:800;">⚡ Quick recap</span>
        <span style="font-size:.74rem;color:var(--muted);">From the Cheat Card · click to fold</span>
        <span style="flex:1;"></span>
        <a href="../../cards/#card-${card.id}" style="font-size:.72rem;color:var(--accent);text-decoration:none;">→ Open full card</a>
      </summary>
      <div style="margin-top:.75rem;">
        <div style="font-size:.86rem;color:var(--muted);line-height:1.55;margin-bottom:.75rem;font-style:italic;">${card.subtitle}</div>
        <ol style="padding-left:1.4rem;margin:0 0 .85rem;color:var(--text);font-size:.88rem;line-height:1.55;">
          ${card.musts.map(m => `<li style="margin-bottom:.35rem;">${m}</li>`).join('')}
        </ol>
        <div style="background:var(--surface);border-left:3px solid var(--accent);border-radius:6px;padding:.6rem .85rem;margin-bottom:.55rem;font-size:.84rem;line-height:1.55;">
          <span style="font-size:.65rem;color:var(--accent);text-transform:uppercase;letter-spacing:.07em;font-weight:800;">Worked example</span><br>
          <span style="color:#f87171;">${card.worked.before}</span><br>
          <span style="color:var(--muted);">↓</span> <span style="color:#4ade80;font-weight:600;">${card.worked.after}</span>
        </div>
        <div style="font-size:.82rem;color:var(--text);line-height:1.55;">${card.mnemonic}</div>
      </div>
    `;
    learnHost.parentNode.insertBefore(wrap, learnHost);
  }

  function setTopicHeader(topic, topicId) {
    const titleEl = el('topic-title');
    const blurbEl = el('topic-blurb');
    const themeEl = el('topic-theme-badge');
    if (titleEl && topic.title) titleEl.textContent = topic.title;
    if (blurbEl && topic.blurb) blurbEl.textContent = topic.blurb;
    if (themeEl && topic._theme) {
      themeEl.textContent = topic._theme;
      themeEl.className = `badge badge-${topic._theme}`;
    }
    document.title = `${topic.title || topicId} — PSLE English`;
  }

  function markVisit(topicId) {
    if (typeof Progress !== 'undefined' && Progress.recordVisit) {
      Progress.recordVisit(topicId);
    }
  }

  function renderStub(topic) {
    setTopicHeader({ title: 'Coming soon', blurb: 'This topic page is a placeholder. The Learn / Quiz / Drill / Mind Map tabs land in subsequent phases per docs/english-architecture.md.' }, 'placeholder');
  }

  async function hydrate() {
    const topicId = global.ENGLISH_TOPIC_ID;
    if (!topicId) return;
    markVisit(topicId);

    if (!global.EnglishContent) { renderStub({}); return; }

    let topic = null;
    try { topic = await global.EnglishContent.loadTopic(topicId); } catch (_) {}
    if (!topic) { renderStub({}); return; }

    setTopicHeader(topic, topicId);
    renderKeyQuestions(topic);
    renderGlossary(topic);
    renderLearn(topic);
    renderQuickRecap(topicId);
    renderCommonTraps(topic);
    renderMasteryCheckpoints(topic);
    renderSummary(topic);
    renderPSLEPrompts(topic);

    // Phase 1 stubs for the Quiz/Drill/Mind Map tabs — wire-up
    // happens when the first topic with full content lands.
    const quizContainer = el('quiz-container');
    if (quizContainer && Array.isArray(topic.questions) && topic.questions.length && typeof global.initAIQuizToggle === 'function') {
      quizContainer.dataset.topicId = topicId;
      quizContainer.dataset.topicName = topic.title || topicId;
      quizContainer.dataset.topicLevel = String(topic.defaultLevel || 5);
      global.initAIQuizToggle(topic.questions);
    } else if (quizContainer) {
      quizContainer.innerHTML = '<p style="color:var(--muted);font-size:.85rem;padding:1rem;">Quiz items for this topic land in a later phase.</p>';
    }

    const drillContainer = el('drill-container');
    if (drillContainer) {
      if (typeof global.EnglishDrill !== 'undefined' && global.EnglishDrill.mount) {
        global.EnglishDrill.mount(topicId, topic.title || topicId, Array.isArray(topic.drillItems) ? topic.drillItems : []);
      } else {
        drillContainer.innerHTML = '<p style="color:var(--muted);font-size:.85rem;padding:1rem;">Drills for this topic land in a later phase.</p>';
      }
    }

    const mindmapHost = el('mindmap-host');
    if (mindmapHost) {
      mindmapHost.innerHTML = '<p style="color:var(--muted);font-size:.85rem;padding:1rem;">Mind-map for this topic lands in a later phase (Phase 2 mega map).</p>';
    }
  }

  ready(hydrate);
  global.EnglishTopic = { hydrate };
})(typeof window !== 'undefined' ? window : globalThis);
