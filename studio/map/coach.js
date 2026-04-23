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
  const stemBtn  = document.getElementById('stem-btn');
  const backlinksEl = document.getElementById('backlinks');
  document.getElementById('settings-btn').addEventListener('click', () => window.JglLab && window.JglLab.openSettings());
  document.getElementById('foot-link').addEventListener('click', (e) => { e.preventDefault(); window.JglLab && window.JglLab.openSettings(); });
  regenBtn.addEventListener('click', () => { if (M.focusId) renderProbe(M.nodesById.get(M.focusId), true); });
  if (stemBtn) stemBtn.addEventListener('click', () => { if (M.focusId) renderStemDecode(M.nodesById.get(M.focusId)); });

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
          3. Tap <strong>Another probe</strong> for a different angle, or <strong>🔍 Decode a stem</strong> to see the command words and trigger phrases a PSLE question about this would use.<br>
          4. Click a chip under <strong>Connections</strong> to jump to a related node. Click the same node again, click empty canvas, or press <kbd>Esc</kbd> to deselect.
        </div>
        <div class="ft" style="margin-top:.45rem;color:var(--muted);opacity:.85">
          Tip: drag nodes to rearrange them, press <kbd>/</kbd> to search, and use the Vault tab to drop your own notes and link them to any node.
        </div>`;
      probeEl.innerHTML = '<span class="probe-label">Coach probe</span><span class="probe-empty">Pick a node to see a probing question.</span>';
      regenBtn.disabled = true;
      if (stemBtn) stemBtn.disabled = true;
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
    if (stemBtn) stemBtn.disabled = node.kind === 'note';
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
    const isComplete = s => typeof s === 'string' && s.length >= 20 && /\?\s*$/.test(s);
    try {
      // thinkingBudget:0 keeps gemini-2.5-flash from eating most of the
      // token budget on internal thinking and returning a truncated reply.
      let text = await window.askGemini({
        system, prompt,
        temperature: regen ? 0.85 : 0.55,
        maxTokens: 512,
        thinkingBudget: 0,
      });
      text = (text || '').trim();
      if (!isComplete(text)) {
        const retry = await window.askGemini({
          system,
          prompt: prompt + '\n\nYour previous reply was incomplete. Reply again with ONE complete sentence ending in "?". No preamble.',
          temperature: 0.55,
          maxTokens: 512,
          thinkingBudget: 0,
        });
        const t2 = (retry || '').trim();
        if (isComplete(t2)) text = t2;
      }
      // If neither attempt gave a complete question, prefer the
      // deterministic scaffold over a fragment.
      if (!isComplete(text)) text = base;
      setProbeText(text);
    } catch (err) {
      probeEl.innerHTML = '';
      const label = document.createElement('span'); label.className = 'probe-label'; label.textContent = 'Coach probe';
      const body = document.createElement('span'); body.style.cssText = 'display:block;white-space:pre-line'; body.textContent = base;
      const errSpan = document.createElement('span'); errSpan.className = 'probe-err'; errSpan.textContent = (err && err.message) || 'AI unavailable';
      probeEl.appendChild(label); probeEl.appendChild(body); probeEl.appendChild(errSpan);
    }
  }

  function setProbeText(text, labelText) {
    probeEl.innerHTML = '';
    const label = document.createElement('span');
    label.className = 'probe-label';
    label.textContent = labelText || 'Coach probe';
    const body = document.createElement('span');
    body.className = 'probe-body';
    body.style.cssText = 'display:block;white-space:pre-line';
    body.textContent = text;
    probeEl.appendChild(label);
    probeEl.appendChild(body);
  }

  // ── Stem decoder ─────────────────────────────────────────
  // Teaches Alexey the examiner's eye: what command word to expect,
  // which trigger phrases flag what kind of answer, and the 2-3
  // processes he should walk through before writing a single word.
  function fallbackStemDecode(node) {
    const lines = [];
    lines.push(`Question stems about "${node.label}" usually start with one of these command words:`);
    lines.push(`• "Explain why..." → give a causal chain (because A, so B, so C).`);
    lines.push(`• "Describe..."   → observations only; no reasons.`);
    lines.push(`• "Suggest..."    → propose a reason or method; more than one answer can score.`);
    lines.push(`• "Infer..."      → use the data given to draw a conclusion; do not add new facts.`);
    lines.push(`• "Predict..."    → state what happens next; then say why.`);
    lines.push(`• "Compare..."    → name the variable, then give both sides.`);
    lines.push('');
    lines.push(`Before you write, think through: (1) what process is happening, (2) what substance or energy is moving or changing, (3) what the final effect on the question's subject is.`);
    return lines.join('\n');
  }

  async function renderStemDecode(node) {
    const base = fallbackStemDecode(node);
    setProbeText(base, 'Stem decoder');
    if (!window.askGemini) return;
    const key = (window.JglStorage && window.JglStorage.getGeminiKey && window.JglStorage.getGeminiKey()) || '';
    if (!key) return;

    const voice = (window.JglCoach && window.JglCoach.VOICE) || '';
    const themeLabel = node.kind === 'topic' && node.theme
      ? (M.nodesById.get(node.theme)?.label || node.theme) : '';
    const context = [
      `Focus node kind: ${node.kind}`,
      `Focus node label: ${node.label}`,
      themeLabel ? `Theme: ${themeLabel}` : '',
      node.kind === 'phenomenon' ? `Observed in: ${(node.topics || []).map(id => M.nodesById.get(id)?.label).filter(Boolean).join(', ')}` : '',
    ].filter(Boolean).join('\n');

    const system = [
      voice,
      'Role: PSLE examiner coach. You teach a Primary 6 student HOW to read a question stem, not how to answer.',
      'Output EXACTLY this structure, in plain text, no markdown, no emoji, no hyphens or em dashes:',
      '',
      'Line 1: "Likely command words: <2-3 words, comma separated>"',
      'Line 2: "Trigger phrases to watch for: <2-3 short phrases, comma separated>"',
      'Lines 3-5: three short bullets, each starting with a dash and a space ("- "). Each bullet names ONE thing Alexey should identify or process in the stem before writing (e.g. "- Identify the energy source the stem gives you.").',
      'Line 6: "One-sentence self-check: <a single question he should ask himself once his answer is drafted, ending with a question mark>"',
      'Total output under 90 words. Do not number lines. Do not add any other preamble or closing text.',
    ].join('\n');

    const prompt = `${context}\n\nProduce the stem-decoder block now. Follow the structure exactly.`;

    setProbeText('Thinking...', 'Stem decoder');
    try {
      let text = await window.askGemini({ system, prompt, temperature: 0.4, maxTokens: 512, thinkingBudget: 0 });
      text = (text || '').trim();
      if (!text || text.length < 40) text = base;
      setProbeText(text, 'Stem decoder');
    } catch (err) {
      probeEl.innerHTML = '';
      const label = document.createElement('span'); label.className = 'probe-label'; label.textContent = 'Stem decoder';
      const body = document.createElement('span'); body.style.cssText = 'display:block;white-space:pre-line'; body.textContent = base;
      const errSpan = document.createElement('span'); errSpan.className = 'probe-err'; errSpan.textContent = (err && err.message) || 'AI unavailable';
      probeEl.appendChild(label); probeEl.appendChild(body); probeEl.appendChild(errSpan);
    }
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
