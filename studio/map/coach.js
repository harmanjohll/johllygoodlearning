/* =========================================================
   /studio/map/coach.js
   Coach sidebar: focus card, probing question, backlinks.
   Depends on window.MAP from graph.js being loaded.
   ========================================================= */

(function () {
  const M = window.MAP;
  if (!M) { console.error('[coach] MAP state missing'); return; }

  const focusCard = document.getElementById('focus-card');
  const probeEl = document.getElementById('probe');
  const regenBtn = document.getElementById('regen-btn');
  const backlinksEl = document.getElementById('backlinks');
  document.getElementById('settings-btn').addEventListener('click', () => window.JglLab && window.JglLab.openSettings());
  document.getElementById('foot-link').addEventListener('click', (e) => { e.preventDefault(); window.JglLab && window.JglLab.openSettings(); });
  regenBtn.addEventListener('click', () => { if (M.focusId) renderProbe(M.nodesById.get(M.focusId), true); });

  function escapeHtml(s) {
    return String(s || '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }

  function setFocusCard(node) {
    if (!node) {
      focusCard.innerHTML = `
        <div class="fk">How the Coach works</div>
        <div class="fl">Click any node. I ask one question.</div>
        <div class="ft">
          1. <strong>Click a node</strong> on the map (a theme, topic, phenomenon, or one of your notes).<br>
          2. I drop a single probing question in the box below. Read it, then answer it <em>in your head</em> (or out loud) in one full sentence, using the precise term.<br>
          3. Tap <strong>Another probe</strong> for a different angle on the same idea. Tap a chip under <strong>Connections</strong> to jump to a related node.<br>
          4. Click the same node again, click the empty canvas, or press <kbd>Esc</kbd> to deselect.
        </div>
        <div class="ft" style="margin-top:.45rem;color:var(--muted);opacity:.85">
          Tip: drag nodes to rearrange them, press <kbd>/</kbd> to search, and use the Vault tab to drop your own notes and link them to any node.
        </div>`;
      probeEl.innerHTML = '<span class="probe-label">Coach probe</span><span class="probe-empty">Pick a node to see a probing question.</span>';
      regenBtn.disabled = true;
      backlinksEl.innerHTML = '';
      return;
    }
    const themeId = nodeTheme(node);
    const themeLabel = themeId ? (M.nodesById.get(themeId)?.label || themeId) : '';
    const tag = node.kind === 'theme' ? (node.tagline || '')
      : node.kind === 'topic' ? `Under ${themeLabel}`
      : node.kind === 'note' ? 'Your note'
      : `Observed in ${(node.topics || []).map(t => M.nodesById.get(t)?.label).filter(Boolean).join(', ') || 'multiple topics'}`;
    const deepHref = node.kind === 'topic' ? `../topics/${node.id}/index.html` : '';
    focusCard.innerHTML = `
      <div class="fk">${node.kind}</div>
      <div class="fl">${escapeHtml(node.label)}</div>
      <div class="ft">${escapeHtml(tag)}</div>
      ${deepHref ? `<a class="deeplink" href="${deepHref}">Open →</a>` : ''}
      ${node.body ? `<div style="margin-top:.5rem;font-size:.74rem;color:var(--text);line-height:1.5">${escapeHtml(node.body)}</div>` : ''}
      <div class="ft" style="margin-top:.45rem;color:var(--muted);opacity:.85">
        Click the node again, click empty canvas, or press <kbd>Esc</kbd> to deselect.
      </div>
    `;
    regenBtn.disabled = false;
    renderBacklinks(node);
    renderProbe(node, false);
  }

  function nodeTheme(n) {
    if (!n) return null;
    if (n.kind === 'theme')  return n.id;
    if (n.kind === 'topic')  return n.theme;
    if (n.kind === 'phenomenon') {
      const first = (n.topics || [])[0];
      const t = M.nodesById.get(first);
      return t ? t.theme : null;
    }
    return null;
  }

  function renderBacklinks(node) {
    const seen = new Set();
    const edges = [];
    (M.links || []).forEach(l => {
      const s = typeof l.source === 'object' ? l.source.id : l.source;
      const t = typeof l.target === 'object' ? l.target.id : l.target;
      if (s !== node.id && t !== node.id) return;
      const other = s === node.id ? t : s;
      const type  = l.type || (l.kind === 'note-link' ? 'note' : 'hier');
      const key = other + ':' + type;
      if (seen.has(key)) return;
      seen.add(key);
      edges.push({ other, type });
    });
    if (!edges.length) { backlinksEl.innerHTML = ''; return; }
    backlinksEl.innerHTML = '<div class="bl-head">Connections</div>';
    edges.slice(0, 20).forEach(e => {
      const other = M.nodesById.get(e.other);
      if (!other) return;
      const row = document.createElement('div');
      row.className = 'bl';
      row.innerHTML = `<span>${escapeHtml(other.label)}</span><span class="bl-t">${escapeHtml(e.type)}</span>`;
      row.addEventListener('click', () => M.api.focusNode(other.id));
      backlinksEl.appendChild(row);
    });
  }

  function fallbackProbe(node) {
    if (node.kind === 'theme') {
      return `You have opened ${node.label}. Pick one topic under it. In one sentence, why does it belong to ${node.label} rather than another theme?`;
    }
    if (node.kind === 'topic') {
      const themeId = nodeTheme(node);
      const themeLabel = themeId ? (M.nodesById.get(themeId)?.label || themeId) : 'its theme';
      return `${node.label} sits under ${themeLabel}. Think of one phenomenon you have observed. In one sentence, what makes it an example of ${node.label}?`;
    }
    if (node.kind === 'note') {
      return `This is your own note. In one sentence, what scientific idea does it anchor to, and why is it worth remembering?`;
    }
    const topicLabels = (node.topics || []).map(id => M.nodesById.get(id)?.label).filter(Boolean);
    const first = topicLabels[0] || 'its topic';
    return `You picked: "${node.label}". Which idea from ${first} explains why this happens? Start your sentence with the key term.`;
  }

  async function renderProbe(node, regen) {
    const base = fallbackProbe(node);
    setProbeText(base);
    if (!window.askGemini) return;
    const key = (window.JglStorage && window.JglStorage.getGeminiKey && window.JglStorage.getGeminiKey()) || '';
    if (!key) return; // fallback only

    const voice = (window.JglCoach && window.JglCoach.VOICE) || '';
    const context = [
      `Node kind: ${node.kind}`,
      `Node label: ${node.label}`,
      node.tagline ? `Tagline: ${node.tagline}` : '',
      node.kind === 'topic' ? `Theme: ${M.nodesById.get(node.theme)?.label}` : '',
      node.kind === 'phenomenon' ? `Related topics: ${(node.topics || []).map(id => M.nodesById.get(id)?.label).filter(Boolean).join(', ')}` : '',
      node.kind === 'note' ? `Student note body: ${(node.body || '').slice(0, 600)}` : '',
    ].filter(Boolean).join('\n');

    const system = [
      voice,
      'You are probing a Primary 6 student studying for PSLE Science.',
      'Output: ONE complete question (one or two sentences) that MUST end with a question mark.',
      'No preamble ("You mentioned..." / "Great, so..."). No bullet points. No emoji. No hyphens or em dashes.',
      'Prefer causal probes ("What does X need that Y provides?", "Why does the pitch change when ...?") over recall ("What is X?").',
    ].join('\n');
    const prompt = `${context}\n\nWrite your probing question now.${regen ? ' Vary it from previous questions on this node.' : ''} Remember: one complete sentence, ending with "?".`;

    probeEl.innerHTML = '<span class="probe-label">Coach probe</span><span style="opacity:.6;font-style:italic">Thinking...</span>';
    try {
      let text = await window.askGemini({ system, prompt, temperature: regen ? 0.85 : 0.6, maxTokens: 220 });
      text = (text || '').trim();
      // Retry once if the model returned a fragment (no question mark) — that's what
      // produced the "You mentioned plants make food" UX bug.
      if (text && !/\?\s*$/.test(text)) {
        const retry = await window.askGemini({
          system,
          prompt: prompt + '\n\nYour previous reply was incomplete. Reply again with ONE complete sentence ending in "?".',
          temperature: 0.6,
          maxTokens: 220,
        });
        if (retry && /\?\s*$/.test(retry.trim())) text = retry.trim();
      }
      setProbeText((text || base).trim());
    } catch (err) {
      probeEl.innerHTML =
        '<span class="probe-label">Coach probe</span>' + escapeHtml(base) +
        '<span class="probe-err">' + escapeHtml((err && err.message) || 'AI unavailable') + '</span>';
    }
  }

  function setProbeText(text) {
    probeEl.innerHTML = '';
    const label = document.createElement('span');
    label.className = 'probe-label';
    label.textContent = 'Coach probe';
    const body = document.createElement('span');
    body.className = 'probe-body';
    body.style.cssText = 'display:block;white-space:pre-line';
    body.textContent = text;
    probeEl.appendChild(label);
    probeEl.appendChild(body);
  }

  // Hook into focus events from graph.js
  M.hooks.onFocus = setFocusCard;

  // If the student sets a Gemini key while the Coach is open,
  // re-render the probe immediately so they do not have to click
  // anything extra.
  document.addEventListener('jgl:gemini-key-changed', () => {
    if (M.focusId) {
      const node = M.nodesById.get(M.focusId);
      if (node) renderProbe(node, false);
    }
  });

  // Hydrate callback after init
  M.api.hydrateCoach = () => setFocusCard(null);
})();
