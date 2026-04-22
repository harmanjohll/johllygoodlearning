/* =========================================================
   /studio/shared/jarvis.js
   Voice-first tutor overlay. Floating button opens a panel
   with Web Speech API STT + SpeechSynthesis TTS + Gemini.
   Aware of the current page's topic id and active tab so
   questions are grounded in what the student is looking at.
   Auto-mounts on any page loading this script; suppress with
   <body data-studio-no-jarvis>. Keyboard shortcut: Cmd/Ctrl+J.
   ========================================================= */

(function (global) {
  const SR = global.SpeechRecognition || global.webkitSpeechRecognition;
  const TTS = global.speechSynthesis;

  const CSS = `
  .jarvis-fab {
    position: fixed; left: 18px; bottom: 18px; z-index: 9100;
    background: linear-gradient(135deg, #1a2a3a 0%, #1e1835 100%);
    color: #e9d5ff;
    border: 1px solid #a78bfa;
    border-radius: 999px;
    padding: .55rem .85rem .5rem;
    font: 700 .78rem/1 'Inter Tight', 'Inter', system-ui, sans-serif;
    letter-spacing: .04em;
    cursor: pointer;
    box-shadow: 0 6px 22px rgba(0,0,0,.4);
    display: inline-flex; align-items: center; gap: .45rem;
    user-select: none;
  }
  .jarvis-fab:hover { filter: brightness(1.15); }
  .jarvis-fab .dot { width: 7px; height: 7px; border-radius: 50%; background: #a78bfa; box-shadow: 0 0 6px #a78bfa; }
  .jarvis-fab.hidden { display: none; }

  .jarvis-panel {
    position: fixed; left: 18px; bottom: 60px; z-index: 9100;
    width: 360px; max-width: calc(100vw - 36px);
    height: min(520px, calc(100vh - 100px));
    background: #0b1320f2;
    color: #e5e7eb;
    border: 1px solid #2a3b55;
    border-radius: 14px;
    box-shadow: 0 20px 50px rgba(0,0,0,.55);
    display: none;
    flex-direction: column;
    overflow: hidden;
    backdrop-filter: blur(6px);
    font: 500 .82rem/1.5 'Inter Tight', 'Inter', system-ui, sans-serif;
  }
  .jarvis-panel.open { display: flex; }

  .jv-head {
    display: flex; align-items: center; gap: .5rem;
    padding: .6rem .7rem .55rem;
    border-bottom: 1px solid #1a2233;
    font-size: .72rem; text-transform: uppercase; letter-spacing: .1em;
    color: #a78bfa; font-weight: 800;
  }
  .jv-head .jv-title { flex: 1; }
  .jv-head .jv-sub { color: #64748b; font-size: .64rem; font-weight: 600; text-transform: none; letter-spacing: 0; }
  .jv-head button {
    background: none; border: none; color: #94a3b8; cursor: pointer;
    font-size: .95rem; padding: 0 .2rem; line-height: 1;
  }
  .jv-head button:hover { color: #e5e7eb; }

  .jv-thread {
    flex: 1; overflow-y: auto;
    padding: .7rem .8rem .5rem;
    display: flex; flex-direction: column; gap: .5rem;
  }
  .jv-bubble {
    max-width: 92%;
    padding: .55rem .75rem;
    border-radius: 11px;
    font-size: .84rem; line-height: 1.5;
  }
  .jv-bubble.student {
    align-self: flex-end;
    background: rgba(56,189,248,.1); border: 1px solid rgba(56,189,248,.4);
    color: #f1f5f9;
    border-bottom-right-radius: 3px;
  }
  .jv-bubble.jarvis {
    align-self: flex-start;
    background: linear-gradient(135deg, #1a2a3a 0%, #1e1835 100%);
    border: 1px solid rgba(167,139,250,.55);
    color: #f1f5f9;
    border-bottom-left-radius: 3px;
  }
  .jv-bubble.thinking { opacity: .7; font-style: italic; }

  .jv-ctx {
    font-size: .64rem; color: #64748b; padding: 0 .75rem .35rem;
    display: flex; gap: .35rem; align-items: center; flex-wrap: wrap;
  }
  .jv-ctx span.chip {
    background: #111a2d; border: 1px solid #233047;
    border-radius: 999px; padding: .08rem .45rem;
    font-weight: 600;
  }

  .jv-input-row {
    display: flex; gap: .35rem; padding: .5rem .6rem .65rem;
    border-top: 1px solid #1a2233;
    background: #0a0f1d;
    align-items: center;
  }
  .jv-input-row input {
    flex: 1;
    background: #111a2d;
    border: 1px solid #233047;
    border-radius: 8px;
    color: #e5e7eb;
    padding: .45rem .6rem;
    font: 500 .82rem/1.4 'Inter Tight', 'Inter', system-ui, sans-serif;
    outline: none;
  }
  .jv-input-row input:focus { border-color: #a78bfa; }
  .jv-input-row button {
    background: #1a2233; border: 1px solid #2a3b55;
    color: #e5e7eb; border-radius: 8px;
    padding: .42rem .6rem;
    font-size: .72rem; font-weight: 700;
    cursor: pointer;
  }
  .jv-input-row button:hover { border-color: #a78bfa; }
  .jv-mic.listening {
    background: #4a1e3a; border-color: #fb7185; color: #ffe4e6;
    animation: jv-pulse 1.15s ease-in-out infinite;
  }
  @keyframes jv-pulse {
    0%,100% { box-shadow: 0 0 0 0 rgba(251,113,133,.45); }
    50%     { box-shadow: 0 0 0 7px rgba(251,113,133,0); }
  }

  .jv-hint { font-size: .64rem; color: #64748b; padding: 0 .75rem .55rem; }
  .jv-hint.err { color: #fca5a5; }
  `;
  const style = document.createElement('style');
  style.textContent = CSS;
  document.head.appendChild(style);

  const STATE = {
    mounted: false,
    open: false,
    turns: [],            // { role: 'student' | 'jarvis', text }
    listening: false,
    rec: null,
    speakingUtter: null,
  };

  // ── Page context ────────────────────────────────────────
  function pageContext() {
    const url = location.pathname;
    const topicMatch = url.match(/\/topics\/([^/]+)\//);
    const topicId = topicMatch ? topicMatch[1] : null;
    // Surface-level clue of which tab the student is on
    const activeTab = document.querySelector('.tab-pane.active');
    const modeMatch = url.match(/\/studio\/([^/]+)\//);
    const mode = modeMatch ? modeMatch[1] : (url.endsWith('/studio/') || url.endsWith('/studio/index.html') ? 'hub' : null);
    return { path: url, topicId, title: document.title, tab: activeTab ? activeTab.id : null, mode };
  }

  async function topicSnapshot(topicId) {
    if (!topicId || !window.JglContent) return null;
    try {
      const t = await window.JglContent.loadTopic(topicId);
      if (!t) return null;
      return {
        title: t.title,
        keyIdeas: (t.keyIdeas || []).slice(0, 6),
        glossary: (t.glossary || []).slice(0, 10).map(g => ({ term: g.term, definition: g.definition })),
      };
    } catch { return null; }
  }

  function studentName() {
    try {
      const s = window.JglStorage && window.JglStorage.getProgress().student;
      return s && s.id ? s.id : 'Alexey';
    } catch { return 'Alexey'; }
  }

  // ── Speech ──────────────────────────────────────────────
  function canListen() { return !!SR; }
  function canSpeak()  { return !!TTS; }

  function startListening(onFinal) {
    if (!SR) return false;
    if (STATE.rec) { try { STATE.rec.abort(); } catch {} }
    const r = new SR();
    // en-SG support is spotty; use the browser's preferred English if it is English,
    // otherwise fall back to en-GB.
    const navLang = (navigator.language || '').toLowerCase();
    r.lang = navLang.startsWith('en') ? navLang : 'en-GB';
    r.interimResults = true;
    r.continuous = false;
    let finalText = '';
    r.onresult = (ev) => {
      for (let i = ev.resultIndex; i < ev.results.length; i++) {
        if (ev.results[i].isFinal) finalText += ev.results[i][0].transcript + ' ';
      }
      const partial = Array.from(ev.results).map(x => x[0].transcript).join(' ');
      const input = document.getElementById('jv-input');
      if (input) input.value = partial.trim();
    };
    r.onerror = (ev) => { setHint('Speech error: ' + (ev.error || 'unknown'), true); stopListening(); };
    r.onend = () => {
      STATE.listening = false;
      updateMic();
      const text = finalText.trim();
      const input = document.getElementById('jv-input');
      if (input) input.value = text || (input.value || '');
      if (text) onFinal(text);
    };
    STATE.rec = r;
    try { r.start(); STATE.listening = true; updateMic(); setHint('Listening... speak now.', false); return true; }
    catch (err) { setHint('Could not start microphone: ' + err.message, true); return false; }
  }
  function stopListening() {
    if (STATE.rec) try { STATE.rec.stop(); } catch {}
    STATE.listening = false; updateMic();
  }
  function updateMic() {
    const b = document.querySelector('.jv-mic');
    if (!b) return;
    b.classList.toggle('listening', STATE.listening);
    b.textContent = STATE.listening ? 'Listening...' : (canListen() ? 'Speak' : 'Mic N/A');
  }

  function speak(text) {
    if (!canSpeak()) return;
    const go = () => {
      try {
        TTS.cancel();
        const u = new SpeechSynthesisUtterance(text);
        u.rate = 1.0; u.pitch = 1.0;
        const voices = TTS.getVoices();
        const pref = voices.find(v => /en[-_]GB/i.test(v.lang))
                  || voices.find(v => /en[-_]SG/i.test(v.lang))
                  || voices.find(v => /en[-_]AU/i.test(v.lang))
                  || voices.find(v => /^en/i.test(v.lang))
                  || voices[0];
        if (pref) u.voice = pref;
        STATE.speakingUtter = u;
        TTS.speak(u);
      } catch {}
    };
    // Some browsers return [] until the voiceschanged event fires.
    if (TTS.getVoices().length) go();
    else {
      const once = () => { TTS.removeEventListener('voiceschanged', once); go(); };
      TTS.addEventListener('voiceschanged', once);
      // Safety fallback: speak anyway if voiceschanged never fires within 400ms.
      setTimeout(go, 400);
    }
  }

  // ── Conversation ────────────────────────────────────────
  function bubble(role, text) {
    const b = document.createElement('div');
    b.className = 'jv-bubble ' + role;
    b.textContent = text;
    return b;
  }
  function appendTurn(role, text, thinking) {
    STATE.turns.push({ role, text });
    const thread = document.querySelector('.jv-thread');
    const b = bubble(role, text);
    if (thinking) b.classList.add('thinking');
    thread.appendChild(b);
    thread.scrollTop = thread.scrollHeight;
    return b;
  }

  async function ask(text) {
    if (!text) return;
    appendTurn('student', text);
    const thinkingEl = appendTurn('jarvis', 'Thinking...', true);

    const ctx = pageContext();
    const topic = await topicSnapshot(ctx.topicId);
    const voice = (window.JglCoach && window.JglCoach.VOICE) || '';
    const system = [
      voice,
      `You are ${studentName()}'s tutor working alongside him through the Singapore Primary Science Studio.`,
      'Tone: warm, professional, specific. One or two paragraphs at most. No emoji. No markdown lists. Plain prose because the reply will be read aloud.',
      'If the student asks a conceptual question, answer it at P6 level with precise science terms. If the student asks to be quizzed, ask one question and wait. If the student answers a quiz question, mark it briefly then probe the next gap.',
    ].join('\n');
    const grounding = [
      `Page: ${ctx.title}`,
      ctx.topicId ? `Topic: ${ctx.topicId}` : '',
      ctx.tab ? `Active tab: ${ctx.tab}` : '',
      topic ? `Key ideas in scope:\n- ${topic.keyIdeas.join('\n- ')}` : '',
      topic && topic.glossary.length ? `Glossary (first 10): ${topic.glossary.map(g => g.term + ' = ' + g.definition).join(' | ')}` : '',
    ].filter(Boolean).join('\n');
    const history = STATE.turns.slice(-8, -1).map(t => (t.role === 'student' ? 'Student' : 'Jarvis') + ': ' + t.text).join('\n');
    const prompt = `Context:\n${grounding}\n\nDialogue so far:\n${history}\n\nStudent just said: "${text}"\n\nReply as Jarvis.`;

    let replyText = '';
    let needsKey = false;
    try {
      if (!window.askGemini) throw new Error('Gemini wrapper missing.');
      const key = (window.JglStorage && window.JglStorage.getGeminiKey && window.JglStorage.getGeminiKey()) || '';
      if (!key) throw { code: 'NO_KEY', message: 'No Gemini key.' };
      replyText = await window.askGemini({
        system, prompt,
        temperature: 0.5,
        maxTokens: 1024,
        thinkingBudget: 0,   // keep replies snappy; no hidden thinking budget.
      });
    } catch (err) {
      if (err && err.code === 'NO_KEY') {
        needsKey = true;
        replyText = 'I need a Gemini API key to reply. Tap "Set up key" below, paste one in, then ask me again.';
      } else {
        replyText = 'Something broke. ' + ((err && err.message) || 'Please try again.');
      }
    }

    thinkingEl.classList.remove('thinking');
    thinkingEl.textContent = (replyText || 'No reply.').trim();
    STATE.turns[STATE.turns.length - 1].text = thinkingEl.textContent;
    if (needsKey) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'jv-setup-key';
      btn.style.cssText = 'margin-top:.5rem;background:rgba(167,139,250,.18);border:1px solid #a78bfa;color:#e9d5ff;padding:.3rem .7rem;border-radius:7px;font-size:.72rem;font-weight:700;cursor:pointer';
      btn.textContent = 'Set up key';
      btn.addEventListener('click', () => window.JglLab && window.JglLab.openSettings());
      thinkingEl.appendChild(document.createElement('br'));
      thinkingEl.appendChild(btn);
    }
    speak(thinkingEl.textContent);
  }

  function setHint(text, isErr) {
    const h = document.querySelector('.jv-hint');
    if (!h) return;
    h.textContent = text || '';
    h.classList.toggle('err', !!isErr);
  }

  // ── UI ──────────────────────────────────────────────────
  function open() {
    STATE.open = true;
    document.querySelector('.jarvis-panel').classList.add('open');
    document.getElementById('jv-input').focus();
    refreshContextChips();
  }
  function close() {
    STATE.open = false;
    document.querySelector('.jarvis-panel').classList.remove('open');
    stopListening();
    try { TTS && TTS.cancel(); } catch {}
  }
  function toggle() { STATE.open ? close() : open(); }

  function refreshContextChips() {
    const ctx = pageContext();
    const el = document.querySelector('.jv-ctx');
    if (!el) return;
    el.innerHTML = '';
    const chips = [];
    if (ctx.topicId) chips.push('topic: ' + ctx.topicId);
    if (ctx.tab)     chips.push('tab: ' + ctx.tab.replace(/^tab-/, ''));
    if (!chips.length && ctx.mode) chips.push(ctx.mode);
    chips.forEach(c => {
      const span = document.createElement('span');
      span.className = 'chip';
      span.textContent = c;
      el.appendChild(span);
    });
  }

  function mount() {
    if (STATE.mounted) return;
    if (document.body && document.body.hasAttribute('data-studio-no-jarvis')) return;

    const fab = document.createElement('button');
    fab.type = 'button';
    fab.className = 'jarvis-fab';
    fab.setAttribute('aria-label', 'Open Jarvis');
    fab.innerHTML = '<span class="dot"></span>Jarvis';
    fab.addEventListener('click', toggle);
    document.body.appendChild(fab);

    const panel = document.createElement('div');
    panel.className = 'jarvis-panel';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', 'Jarvis voice tutor');
    panel.innerHTML = `
      <div class="jv-head">
        <span class="jv-title">Jarvis</span>
        <span class="jv-sub">voice or type</span>
        <button type="button" class="jv-close" aria-label="Close Jarvis">&times;</button>
      </div>
      <div class="jv-thread" aria-live="polite"></div>
      <div class="jv-ctx"></div>
      <div class="jv-hint"></div>
      <div class="jv-input-row">
        <button type="button" class="jv-mic" aria-label="Talk to Jarvis">${canListen() ? 'Speak' : 'Mic N/A'}</button>
        <input id="jv-input" type="text" placeholder="Type, or hit Speak..." autocomplete="off">
        <button type="button" class="jv-send" aria-label="Send">Send</button>
      </div>
    `;
    document.body.appendChild(panel);

    panel.querySelector('.jv-close').addEventListener('click', close);
    panel.querySelector('.jv-send').addEventListener('click', sendFromInput);
    panel.querySelector('.jv-mic').addEventListener('click', () => {
      if (STATE.listening) { stopListening(); return; }
      if (!canListen()) { setHint('Speech recognition is not supported in this browser. Type instead.', true); return; }
      const ok = startListening((finalText) => { ask(finalText); });
      if (!ok) setHint('Microphone permission was refused.', true);
    });
    const input = panel.querySelector('#jv-input');
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') { e.preventDefault(); sendFromInput(); }
    });

    function sendFromInput() {
      const v = input.value.trim();
      if (!v) return;
      input.value = '';
      ask(v);
    }

    // Greeting
    const ctx = pageContext();
    const hello = ctx.topicId
      ? `Hi ${studentName()}. You are on ${ctx.topicId}. Ask me anything, or say "quiz me" to test yourself.`
      : `Hi ${studentName()}. Ask me anything about a topic, or say "quiz me on" a topic to test yourself.`;
    setTimeout(() => appendTurn('jarvis', hello), 40);

    // Keyboard shortcut: Cmd/Ctrl+J
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'j') {
        e.preventDefault(); toggle();
      } else if (e.key === 'Escape' && STATE.open) {
        close();
      }
    });

    // React to a key arriving via any other route (the Settings
    // modal, Coach sidebar, vocab Coach check, etc.): if Jarvis
    // was blocking on "no key", let the student know they can go.
    document.addEventListener('jgl:gemini-key-changed', () => {
      if (STATE.open) setHint('Gemini key set. Ready to go.', false);
    });

    STATE.mounted = true;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount, { once: true });
  } else {
    mount();
  }

  global.JglJarvis = {
    open, close, toggle, ask, mount,
    isSupported: () => ({ stt: canListen(), tts: canSpeak() }),
  };
})(typeof window !== 'undefined' ? window : globalThis);
