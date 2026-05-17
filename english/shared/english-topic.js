/* =========================================================
   /english/shared/english-topic.js
   Generic topic-page renderer for /english/.
   - Learn tab: key questions, glossary, learnHTML, common traps,
     mastery checkpoints, summary, PSLE tips, plus a Quick Recap
     pulled from /shared/content/cheatcards.json.
   - Quiz tab: AI quiz toggle from /shared.js, seeded with the
     topic's `questions` array.
   - Drill tab: window.EnglishDrill engine, seeded with the
     topic's `drillItems` array.
   - Mind Map tab: per-topic concept builder seeded from
     /shared/content/mega.json. Saves notes per topic and
     records mindMapSaved (+20 mastery) when ≥3 concepts noted.

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
    if (!items.length) { host.innerHTML = '<p style="color:var(--muted);font-size:.85rem;">No glossary registered for this topic. The shared Cheat Card has the must-knows.</p>'; return; }
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
      host.innerHTML = '<div class="note-section"><p>No lesson content for this topic. Open the Cheat Card or the Mega Map for the framework.</p></div>';
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
    setTopicHeader({ title: 'Topic not found', blurb: 'This topic id was not registered in the shared content module.' }, 'placeholder');
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

    // Quiz tab — uses the AI-quiz toggle from /shared.js with the
    // topic's curated questions as the seed bank.
    const quizContainer = el('quiz-container');
    if (quizContainer && Array.isArray(topic.questions) && topic.questions.length && typeof global.initAIQuizToggle === 'function') {
      quizContainer.dataset.topicId = topicId;
      quizContainer.dataset.topicName = topic.title || topicId;
      quizContainer.dataset.topicLevel = String(topic.defaultLevel || 5);
      global.initAIQuizToggle(topic.questions);
    } else if (quizContainer) {
      quizContainer.innerHTML = '<p style="color:var(--muted);font-size:.85rem;padding:1rem;">No quiz items registered for this topic. Try the topic-specific sprint linked from the hub instead.</p>';
    }

    const drillContainer = el('drill-container');
    if (drillContainer) {
      if (typeof global.EnglishDrill !== 'undefined' && global.EnglishDrill.mount) {
        global.EnglishDrill.mount(topicId, topic.title || topicId, Array.isArray(topic.drillItems) ? topic.drillItems : []);
      } else {
        drillContainer.innerHTML = '<p style="color:var(--muted);font-size:.85rem;padding:1rem;">Drill engine unavailable. Reload the page to retry.</p>';
      }
    }

    const mindmapHost = el('mindmap-host');
    if (mindmapHost) renderMindMap(mindmapHost, topicId, topic);
  }

  // Per-topic concept builder. Seeds from mega.json phenomena that mention
  // this topic, lets the student write a one-line "in my own words" note
  // against each, save (records mindMapSaved + 20 mastery points), and
  // re-open later to revise. Also exposes a deep-link into the full
  // Mega Map filtered to this topic.
  async function renderMindMap(host, topicId, topic) {
    host.innerHTML = '<p style="color:var(--muted);font-size:.85rem;padding:1rem;">Loading concept seeds…</p>';
    let mega = null;
    try {
      const r = await fetch('../../shared/content/mega.json', { cache: 'no-cache' });
      mega = await r.json();
    } catch {}
    if (!mega) {
      host.innerHTML = '<p style="color:var(--muted);font-size:.85rem;padding:1rem;">Could not load the concept seed data. Refresh to retry.</p>';
      return;
    }
    const phenomena = (mega.phenomena || []).filter(p => (p.topics || []).includes(topicId));
    if (!phenomena.length) {
      host.innerHTML = '<p style="color:var(--muted);font-size:.85rem;padding:1rem;">No concepts seeded for this topic yet.</p>';
      return;
    }

    const NOTE_KEY  = 'jgl.english.mindmap.' + topicId;
    const readNotes  = () => { try { return JSON.parse(localStorage.getItem(NOTE_KEY) || '{}'); } catch { return {}; } };
    const writeNotes = (n) => { try { localStorage.setItem(NOTE_KEY, JSON.stringify(n)); } catch {} };
    let notes = readNotes();

    const TOPIC_TO_PAPER = {
      composition: 'P1', situational: 'P1',
      grammar: 'P2', vocab: 'P2', 'visual-text': 'P2', cloze: 'P2',
      editing: 'P2', synthesis: 'P2', comprehension: 'P2',
      listening: 'P3',
      'oral-reading': 'P4', 'oral-sbc': 'P4',
    };
    const PAPER_COLOUR = { P1: '#fb7185', P2: '#60a5fa', P3: '#e879f9', P4: '#fbbf24' };

    const PHEN_HEADLINE = {
      // A few hand-tuned headlines — fall back to the blurb when missing.
      'p-fast':       'How F.A.S.T. is your most reliable AL1 craft tool',
      'p-ref':        'Why R.E.F. beats a moral sentence at the end',
      'p-race':       'The four moves of every OE answer',
      'p-banned':     'The phrases that flag you as AL2 immediately',
      'p-idioms':     'Idiom + anchor = earned use',
    };

    function safe(s)  { return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
    function safeAttr(s) { return String(s == null ? '' : s).replace(/["'<>]/g, ''); }

    function bridgePapersFor(p) {
      const arr = Array.from(new Set((p.topics || []).map(t => TOPIC_TO_PAPER[t]).filter(Boolean))).sort();
      return arr;
    }

    function paint() {
      const filled = phenomena.filter(p => (notes[p.id] || '').trim().length > 0).length;
      const total  = phenomena.length;
      const pct    = Math.round((filled / total) * 100);
      const ready  = filled >= 3;

      host.innerHTML = `
        <div style="background:var(--card);border:1px solid var(--border);border-radius:12px;padding:1.1rem 1.4rem;margin-bottom:1rem;">
          <div style="display:flex;align-items:baseline;gap:.55rem;flex-wrap:wrap;margin-bottom:.45rem;">
            <h4 style="margin:0;font-size:.95rem;">🗺 Build your own ${safe(topic.title || topicId)} mind map</h4>
            <span style="font-size:.74rem;color:var(--muted);">${filled} of ${total} concepts noted · ${pct}%</span>
            <span style="flex:1;"></span>
            <a href="../../map/#focus=${safeAttr(topicId)}" style="font-size:.74rem;color:var(--accent);text-decoration:none;">→ Open in Mega Map</a>
          </div>
          <p style="font-size:.85rem;color:var(--muted);line-height:1.6;margin-bottom:.75rem;">
            For each concept below, write ONE sentence in <em>your own words</em>. The act of explaining is how the map gets built in your head. Save once you have at least three. ${ready ? 'Save threshold reached.' : 'You can save once 3+ notes are written.'}
          </p>
          <div style="display:flex;gap:.55rem;align-items:center;flex-wrap:wrap;">
            <button class="btn btn-primary" id="mm-save-btn" style="font-size:.82rem;padding:.4rem .85rem;" ${ready ? '' : 'disabled'}>📌 Save my mind map (+20 mastery)</button>
            <button class="btn btn-secondary" id="mm-clear-btn" style="font-size:.82rem;padding:.4rem .85rem;">Clear my notes</button>
            <span id="mm-save-status" style="font-size:.78rem;color:var(--muted);"></span>
          </div>
        </div>

        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:.85rem;">
          ${phenomena.map(p => {
            const papers = bridgePapersFor(p);
            const isBridge = papers.length >= 2;
            const chips = papers.map(pp => `<span style="font-size:.62rem;padding:.1rem .45rem;border-radius:99px;border:1px solid ${PAPER_COLOUR[pp]||'var(--border)'};color:${PAPER_COLOUR[pp]||'var(--muted)'};font-weight:700;margin-right:.2rem;">${pp}</span>`).join('');
            return `
              <div style="background:var(--surface);border:1px solid ${isBridge ? 'var(--accent)' : 'var(--border)'};border-radius:10px;padding:.7rem .9rem;">
                <div style="display:flex;gap:.4rem;align-items:baseline;flex-wrap:wrap;margin-bottom:.3rem;">
                  <strong style="font-size:.88rem;color:var(--text);">${safe(p.label)}</strong>
                  ${chips}
                  ${isBridge ? '<span style="font-size:.62rem;color:var(--accent);font-weight:700;">🌉</span>' : ''}
                </div>
                <div style="font-size:.78rem;color:var(--muted);line-height:1.5;margin-bottom:.5rem;">
                  ${safe(PHEN_HEADLINE[p.id] || p.blurb || '')}
                </div>
                <textarea data-pid="${safeAttr(p.id)}" placeholder="In your own words, why does this matter?" style="width:100%;min-height:48px;background:var(--card);color:var(--text);border:1px solid var(--border);border-radius:6px;padding:.4rem .55rem;font-family:inherit;font-size:.83rem;line-height:1.5;resize:vertical;">${safe(notes[p.id] || '')}</textarea>
              </div>
            `;
          }).join('')}
        </div>
      `;

      // Bind textareas
      host.querySelectorAll('textarea[data-pid]').forEach(ta => {
        ta.addEventListener('input', () => {
          notes[ta.dataset.pid] = ta.value;
          writeNotes(notes);
          // Re-evaluate save threshold without re-painting
          const filled = phenomena.filter(p => (notes[p.id] || '').trim().length > 0).length;
          const saveBtn = host.querySelector('#mm-save-btn');
          if (saveBtn) saveBtn.disabled = filled < 3;
          const meta = host.querySelector('h4');
          if (meta && meta.nextElementSibling) {
            meta.nextElementSibling.textContent = `${filled} of ${phenomena.length} concepts noted · ${Math.round((filled / phenomena.length) * 100)}%`;
          }
        });
      });

      // Save button
      const saveBtn = host.querySelector('#mm-save-btn');
      if (saveBtn) saveBtn.addEventListener('click', () => {
        if (typeof Progress !== 'undefined' && Progress.recordMindMap) Progress.recordMindMap(topicId);
        const status = host.querySelector('#mm-save-status');
        if (status) status.textContent = '✓ Mind map saved · +20 mastery on this topic.';
      });

      // Clear button
      const clearBtn = host.querySelector('#mm-clear-btn');
      if (clearBtn) clearBtn.addEventListener('click', () => {
        if (!confirm('Clear ALL your notes for this topic?')) return;
        notes = {};
        writeNotes(notes);
        paint();
      });
    }

    paint();
  }

  ready(hydrate);
  global.EnglishTopic = { hydrate };
})(typeof window !== 'undefined' ? window : globalThis);
