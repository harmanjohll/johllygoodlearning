/* =========================================================
   /malay/shared/bilingual.js
   Glossary hover popovers for non-native learners.

   Walks every glossary entry across all themes once on load and
   builds a term → entry index. Then attaches a single delegated
   listener to document.body — on hover of any `.term-name` (or
   any element marked `[data-bm-term="…"]`) it shows a small
   floating popover with the term's definition + template +
   topic location.

   No DOM mutation outside the popover element. No per-term
   listener setup. Works on every page that loads this script,
   for any glossary term anywhere in the page.

   Exposes window.MalayBilingual.
   ========================================================= */

(function (global) {
  const TERM_INDEX = new Map();  // lowercased term → entry
  let popoverEl = null;
  let loaded = false;

  function injectStyles() {
    if (document.getElementById('malay-bilingual-styles')) return;
    const s = document.createElement('style');
    s.id = 'malay-bilingual-styles';
    s.textContent = `
      .malay-bm-popover {
        position: fixed;
        z-index: 2000;
        background: #0b1320f5;
        border: 1px solid #38bdf8aa;
        color: #e2e8f0;
        border-radius: 10px;
        padding: .6rem .8rem;
        font-size: .78rem;
        line-height: 1.5;
        max-width: 300px;
        box-shadow: 0 8px 28px rgba(0,0,0,.5);
        pointer-events: none;
        opacity: 0;
        transition: opacity .15s;
        font-family: 'Inter', system-ui, sans-serif;
      }
      .malay-bm-popover.show { opacity: 1; }
      .malay-bm-popover .bm-meta {
        font-size: .62rem; color: #94a3b8;
        text-transform: uppercase; letter-spacing: .05em;
        font-weight: 700; margin-bottom: .25rem;
      }
      .malay-bm-popover .bm-term {
        font-weight: 800; color: #38bdf8; margin-bottom: .3rem;
        font-size: .88rem; line-height: 1.3;
      }
      .malay-bm-popover .bm-def { color: #cbd5e1; margin-bottom: .35rem; }
      .malay-bm-popover .bm-tmpl {
        color: #94a3b8; font-style: italic;
        font-size: .74rem;
        background: #1e293b66; padding: .35rem .5rem;
        border-radius: 5px; line-height: 1.45;
      }
      /* Highlight glossary terms slightly when bilingual is active so
         the student knows they can hover. */
      .term-name, [data-bm-term] {
        border-bottom: 1px dotted #38bdf855;
        cursor: help;
      }
    `;
    document.head.appendChild(s);
  }

  function ensurePopover() {
    if (popoverEl) return popoverEl;
    popoverEl = document.createElement('div');
    popoverEl.className = 'malay-bm-popover';
    popoverEl.setAttribute('role', 'tooltip');
    popoverEl.setAttribute('aria-hidden', 'true');
    document.body.appendChild(popoverEl);
    return popoverEl;
  }

  function escapeHtml(s) {
    return String(s || '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  async function loadIndex() {
    if (loaded || !global.MalayContent) return;
    loaded = true;
    const themes = global.MalayContent.THEMES || [];
    for (const themeId of themes) {
      try {
        const data = await global.MalayContent.loadTheme(themeId);
        for (const [topicId, topic] of Object.entries(data.topics || {})) {
          (topic.glossary || []).forEach(g => {
            if (!g.term) return;
            const key = g.term.toLowerCase().trim();
            if (TERM_INDEX.has(key)) return; // first occurrence wins
            TERM_INDEX.set(key, {
              term: g.term,
              definition: g.definition || '',
              template: g.template || '',
              topicId,
              topicTitle: topic.title || topicId,
              themeId,
            });
          });
        }
      } catch {}
    }
  }

  function showFor(event, sourceEl) {
    const pop = ensurePopover();
    const dataTerm = sourceEl.getAttribute('data-bm-term');
    const visibleTerm = dataTerm || (sourceEl.textContent || '').trim();
    if (!visibleTerm) return;

    const entry = TERM_INDEX.get(visibleTerm.toLowerCase().trim());

    // Fallback: use sibling .term-def if we're inside a .glossary-term row
    if (!entry) {
      const row = sourceEl.closest('.glossary-term');
      if (!row) return;
      const def = row.querySelector('.term-def');
      const tmpl = row.querySelector('.term-template');
      if (!def) return;
      pop.innerHTML = `
        <div class="bm-term">${escapeHtml(visibleTerm)}</div>
        <div class="bm-def">${escapeHtml(def.textContent || '')}</div>
        ${tmpl ? `<div class="bm-tmpl">${escapeHtml(tmpl.textContent || '')}</div>` : ''}
      `;
    } else {
      pop.innerHTML = `
        <div class="bm-meta">${escapeHtml(entry.topicTitle)} · ${escapeHtml(entry.themeId)}</div>
        <div class="bm-term">${escapeHtml(entry.term)}</div>
        <div class="bm-def">${escapeHtml(entry.definition)}</div>
        ${entry.template ? `<div class="bm-tmpl">${escapeHtml(entry.template)}</div>` : ''}
      `;
    }
    positionFor(event, pop);
    pop.classList.add('show');
    pop.setAttribute('aria-hidden', 'false');
  }

  function positionFor(event, pop) {
    const padding = 12;
    const rect = pop.getBoundingClientRect();
    const vw = window.innerWidth, vh = window.innerHeight;
    let x = event.clientX + padding;
    let y = event.clientY + padding;
    // Use a fixed estimate if the popover hasn't been measured yet
    const w = rect.width || 300, h = rect.height || 90;
    if (x + w > vw - 8) x = event.clientX - w - padding;
    if (y + h > vh - 8) y = event.clientY - h - padding;
    if (x < 8) x = 8;
    if (y < 8) y = 8;
    pop.style.left = x + 'px';
    pop.style.top  = y + 'px';
  }

  function hide() {
    if (!popoverEl) return;
    popoverEl.classList.remove('show');
    popoverEl.setAttribute('aria-hidden', 'true');
  }

  function bindListeners() {
    document.body.addEventListener('mouseover', (e) => {
      const t = e.target;
      if (!t || !t.closest) return;
      const src = t.closest('.term-name, [data-bm-term]');
      if (!src) return;
      showFor(e, src);
    });
    document.body.addEventListener('mouseout', (e) => {
      const t = e.target;
      if (!t || !t.closest) return;
      const src = t.closest('.term-name, [data-bm-term]');
      if (!src) return;
      hide();
    });
    document.body.addEventListener('mousemove', (e) => {
      if (popoverEl && popoverEl.classList.contains('show')) {
        positionFor(e, popoverEl);
      }
    });
    document.addEventListener('scroll', hide, true);
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') hide(); });
  }

  function init() {
    injectStyles();
    bindListeners();
    loadIndex();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }

  global.MalayBilingual = {
    showFor,
    hide,
    indexSize: () => TERM_INDEX.size,
    reload: () => { loaded = false; TERM_INDEX.clear(); return loadIndex(); },
  };
})(typeof window !== 'undefined' ? window : globalThis);
