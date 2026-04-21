/* =========================================================
   Singapore Primary Science Lab — Shared Utilities
   Progress · Tabs · Glossary · Toast · Quiz · MindMap · AI
   ========================================================= */

// ── Progress (localStorage) ────────────────────────────────
const Progress = {
  KEY: 'sciLab_progress',

  all() {
    try { return JSON.parse(localStorage.getItem(this.KEY)) || {}; }
    catch { return {}; }
  },

  get(topicId) {
    return this.all()[topicId] || { quizScore: 0, quizTotal: 0, simUsed: false, mindMapSaved: false, visitCount: 0, lastQuizDate: null, flashcardCounts: {} };
  },

  set(topicId, data) {
    const all = this.all();
    all[topicId] = { ...this.get(topicId), ...data };
    localStorage.setItem(this.KEY, JSON.stringify(all));
  },

  masteryPct(topicId) {
    const p = this.get(topicId);
    let score = 0;
    if (p.visitCount  > 0)   score += 10;
    if (p.simUsed)            score += 30;
    if (p.mindMapSaved)       score += 20;
    if (p.quizTotal > 0)      score += Math.round((p.quizScore / p.quizTotal) * 40);
    return Math.min(score, 100);
  },

  recordVisit(topicId) {
    const p = this.get(topicId);
    this.set(topicId, { visitCount: (p.visitCount || 0) + 1 });
  },

  recordSimUsed(topicId) {
    this.set(topicId, { simUsed: true });
  },

  recordMindMap(topicId) {
    this.set(topicId, { mindMapSaved: true });
  },

  recordQuiz(topicId, score, total) {
    const p = this.get(topicId);
    const update = { lastQuizDate: new Date().toISOString().slice(0, 10) };
    if (score >= (p.quizScore || 0)) {
      update.quizScore = score;
      update.quizTotal = total;
    }
    this.set(topicId, update);
  },

  isDue(topicId, daysThreshold = 3) {
    const p = this.get(topicId);
    if (!p.lastQuizDate) return false;
    const daysDiff = (Date.now() - new Date(p.lastQuizDate)) / 86400000;
    return daysDiff >= daysThreshold;
  },

  recordFlashcard(topicId, termId, correct) {
    const p      = this.get(topicId);
    const counts = p.flashcardCounts || {};
    const entry  = counts[termId] || { correct: 0, attempts: 0 };
    entry.attempts += 1;
    if (correct) entry.correct += 1;
    counts[termId] = entry;
    this.set(topicId, { flashcardCounts: counts });
  }
};

// ── Streak & Activity Tracking ─────────────────────────────
const Streak = {
  META_KEY: 'sciLab_meta',

  _getMeta() {
    try { return JSON.parse(localStorage.getItem(this.META_KEY)) || {}; }
    catch { return {}; }
  },

  _setMeta(m) { localStorage.setItem(this.META_KEY, JSON.stringify(m)); },

  record() {
    const today     = new Date().toISOString().slice(0, 10);
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    const m = this._getMeta();
    if (m.lastActivity === today) return; // already counted today

    m.streak = (m.lastActivity === yesterday) ? (m.streak || 0) + 1 : 1;
    m.longestStreak = Math.max(m.longestStreak || 0, m.streak);
    m.lastActivity  = today;
    const days = m.activeDays || [];
    if (!days.includes(today)) days.push(today);
    m.activeDays = days.slice(-14); // keep last 14 days
    this._setMeta(m);

    const milestones = [3, 7, 14, 21, 30, 50, 100];
    if (milestones.includes(m.streak)) {
      setTimeout(() => showToast(`🔥 ${m.streak}-day streak! Outstanding dedication!`), 400);
    }
  },

  get() {
    const m = this._getMeta();
    const today     = new Date().toISOString().slice(0, 10);
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    const active = m.lastActivity === today || m.lastActivity === yesterday;
    return {
      current:      active ? (m.streak || 0) : 0,
      longest:      m.longestStreak || 0,
      lastActivity: m.lastActivity || null,
      activeDays:   m.activeDays || []
    };
  }
};

// ── AI Configuration ───────────────────────────────────────
// Uses Google Gemini API (gemini-2.5-flash) — supports browser CORS.
// Get a free API key at: https://aistudio.google.com/app/apikey
const AIConfig = {
  GEMINI_KEY: 'sciLab_gemini_key',
  LEVEL_KEY:  'sciLab_levels',

  // Delegates to JglStorage when available so the key lives in one
  // canonical place (jgl.geminiKey) while sciLab_gemini_key stays in
  // sync for any legacy reader. Any save triggers a
  // jgl:gemini-key-changed event that the Coach, Jarvis, and the
  // quiz-toggle listen for, so the UI updates without a reload.
  getKey() {
    if (window.JglStorage && typeof window.JglStorage.getGeminiKey === 'function') {
      return window.JglStorage.getGeminiKey();
    }
    return localStorage.getItem(this.GEMINI_KEY) || '';
  },
  setKey(k) {
    const trimmed = (k || '').trim();
    if (!trimmed) return;
    if (window.JglStorage && typeof window.JglStorage.setGeminiKey === 'function') {
      window.JglStorage.setGeminiKey(trimmed);
      return;
    }
    localStorage.setItem(this.GEMINI_KEY, trimmed);
    try { document.dispatchEvent(new CustomEvent('jgl:gemini-key-changed', { detail: { key: trimmed } })); } catch {}
  },
  hasKey()  { return !!this.getKey(); },

  getLevels() {
    try { return JSON.parse(localStorage.getItem(this.LEVEL_KEY)) || {}; }
    catch { return {}; }
  },

  // Per-topic adaptive level (3–6). Defaults to the topic's primary year.
  getLevel(topicId, defaultLevel = 4) {
    return this.getLevels()[topicId] || defaultLevel;
  },

  setLevel(topicId, level) {
    const levels = this.getLevels();
    levels[topicId] = Math.max(3, Math.min(6, level));
    localStorage.setItem(this.LEVEL_KEY, JSON.stringify(levels));
  }
};

// ── AI Setup Modal ─────────────────────────────────────────
function showAISetup() {
  let overlay = document.getElementById('ai-setup-overlay');
  if (overlay) { overlay.style.display = 'flex'; return; }

  overlay = document.createElement('div');
  overlay.id = 'ai-setup-overlay';
  overlay.className = 'ai-overlay';
  overlay.innerHTML = `
    <div class="ai-modal">

      <!-- Header -->
      <div class="ai-modal-header">
        <div class="ai-modal-icon">🤖</div>
        <div class="ai-modal-title-block">
          <h3>Set Up AI Quizzes</h3>
          <p>Google Gemini · Free · Stored only in your browser</p>
        </div>
        <button id="ai-key-close" class="ai-modal-close" title="Close">✕</button>
      </div>

      <!-- Step-by-step guide -->
      <div class="ai-guide-box">
        <div class="ai-guide-title">📋 How to get your free API key (2 minutes)</div>
        <ol class="ai-guide-steps">
          <li>
            Go to <a href="https://aistudio.google.com/app/apikey" target="_blank" class="ai-link">Google AI Studio ↗</a>
            and sign in with any Google account — it's completely free.
          </li>
          <li>
            Click <strong>"Get API key"</strong> in the sidebar, then
            <strong>"Create API key"</strong> → choose <em>"Create API key in new project"</em>.
          </li>
          <li>
            Copy the key shown — it will start with <code>AIza</code>.
          </li>
          <li>Paste it into the box below, click <strong>Test Key</strong>, then <strong>Save</strong>.</li>
        </ol>
        <p class="ai-guide-note">
          The free tier gives you hundreds of quiz generations per day. No credit card is needed.
        </p>
      </div>

      <!-- Key input -->
      <div class="ai-key-field-wrap">
        <label class="ai-key-label">Your Gemini API Key</label>
        <div class="ai-key-row">
          <input id="ai-key-input" type="password" placeholder="Paste your key here — starts with AIza…"
            class="ai-key-input" value="${AIConfig.getKey()}">
          <button id="ai-key-toggle" class="btn btn-ghost ai-toggle-btn" title="Show/hide key">👁</button>
        </div>
      </div>

      <!-- Status line -->
      <div id="ai-key-status" class="ai-key-status"></div>

      <!-- Actions -->
      <div class="ai-modal-actions">
        <button id="ai-key-test" class="btn btn-ghost">🔍 Test Key</button>
        <button id="ai-key-save" class="btn btn-primary">💾 Save Key</button>
      </div>

      <p class="ai-privacy-note">🔒 Your key never leaves this device — it is not sent to our servers.</p>
    </div>
  `;
  document.body.appendChild(overlay);

  overlay.addEventListener('click', e => { if (e.target === overlay) overlay.style.display = 'none'; });
  document.getElementById('ai-key-close').addEventListener('click', () => { overlay.style.display = 'none'; });

  // Show / hide key toggle
  document.getElementById('ai-key-toggle').addEventListener('click', () => {
    const input = document.getElementById('ai-key-input');
    const btn   = document.getElementById('ai-key-toggle');
    if (input.type === 'password') { input.type = 'text';     btn.textContent = '🙈'; }
    else                           { input.type = 'password'; btn.textContent = '👁';  }
  });

  // Save
  document.getElementById('ai-key-save').addEventListener('click', () => {
    const key      = document.getElementById('ai-key-input').value.trim();
    const statusEl = document.getElementById('ai-key-status');
    if (!key) { statusEl.innerHTML = '<span class="ai-status-error">Please enter a key before saving.</span>'; return; }
    AIConfig.setKey(key);
    statusEl.innerHTML = '<span class="ai-status-ok">✅ Key saved! AI quizzes are now active.</span>';
    setTimeout(() => { overlay.style.display = 'none'; }, 1500);
  });

  // Test
  document.getElementById('ai-key-test').addEventListener('click', async () => {
    const key      = document.getElementById('ai-key-input').value.trim();
    const statusEl = document.getElementById('ai-key-status');
    if (!key) { statusEl.innerHTML = '<span class="ai-status-error">Paste your key first, then test it.</span>'; return; }
    statusEl.innerHTML = '<span class="ai-status-info">⏳ Testing your key with Google…</span>';
    try {
      const r = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(key)}`,
        { method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts: [{ text: 'Reply with the single word: OK' }] }] }) }
      );
      if (r.ok) {
        statusEl.innerHTML = '<span class="ai-status-ok">✅ Key works! Click Save to activate AI quizzes.</span>';
      } else {
        const err = await r.json().catch(() => ({}));
        const msg = err.error?.message || '';
        if (msg.toLowerCase().includes('api key') || msg.toLowerCase().includes('invalid')) {
          statusEl.innerHTML = '<span class="ai-status-error">❌ Key not recognised — check you copied it fully from Google AI Studio (step 3 above).</span>';
        } else if (msg.toLowerCase().includes('quota')) {
          statusEl.innerHTML = '<span class="ai-status-error">❌ Daily quota exceeded on this key. Try again tomorrow, or create a new key.</span>';
        } else {
          statusEl.innerHTML = `<span class="ai-status-error">❌ ${msg || 'Unknown error — try again.'}</span>`;
        }
      }
    } catch {
      statusEl.innerHTML = '<span class="ai-status-error">❌ Could not reach Google — check your internet connection.</span>';
    }
  });
}

// ── Tabs ──────────────────────────────────────────────────
function initTabs(containerSelector) {
  const container = document.querySelector(containerSelector || '.tabs-root');
  if (!container) return;
  const btns = container.querySelectorAll('.tab-btn');

  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      btns.forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      const target = document.getElementById(btn.dataset.tab);
      if (target) target.classList.add('active');
    });
  });
}

// ── Glossary accordion ─────────────────────────────────────
function initGlossary() {
  document.querySelectorAll('.glossary-term').forEach(el => {
    el.addEventListener('click', () => el.classList.toggle('open'));
  });
}

// ── Toast notification ─────────────────────────────────────
function showToast(msg, durationMs = 3000) {
  let toast = document.getElementById('global-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'global-toast';
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), durationMs);
}

// ── Quiz engine ────────────────────────────────────────────
class QuizEngine {
  constructor(questions, topicId, containerId, poolSize = 0) {
    const shuffled = [...questions].sort(() => Math.random() - 0.5);
    const pool = poolSize > 0 ? shuffled.slice(0, Math.min(poolSize, shuffled.length)) : shuffled;

    this.questions = pool.map(q => {
      const indices = q.options.map((_, i) => i).sort(() => Math.random() - 0.5);
      return {
        ...q,
        options: indices.map(i => q.options[i]),
        correct: indices.indexOf(q.correct)
      };
    });

    this.topicId   = topicId;
    this.container = typeof containerId === 'string' ? document.getElementById(containerId) : containerId;
    this.current   = 0;
    this.score     = 0;
    this.answered  = false;
    this.wrong     = []; // { q, chosen } for each incorrect answer
    this.render();
  }

  render() {
    if (this.current >= this.questions.length) { this.showResult(); return; }
    const q = this.questions[this.current];
    this.answered = false;
    this.container.innerHTML = `
      <div style="margin-bottom:.5rem">
        <span style="font-size:.75rem;color:var(--muted)">Question ${this.current + 1} of ${this.questions.length}</span>
      </div>
      <p style="font-size:.95rem;color:var(--text);margin-bottom:1rem;font-weight:600">${q.question}</p>
      <div class="quiz-options" style="display:flex;flex-direction:column;gap:.5rem">
        ${q.options.map((opt, i) => `<button class="quiz-option" data-index="${i}">${opt}</button>`).join('')}
      </div>
      <div class="feedback-box" id="qfeedback"></div>
      ${q.image ? `<div style="margin-top:1rem;text-align:center">${q.image}</div>` : ''}
    `;
    this.container.querySelectorAll('.quiz-option').forEach(btn => {
      btn.addEventListener('click', () => this.answer(parseInt(btn.dataset.index)));
    });
  }

  answer(index) {
    if (this.answered) return;
    this.answered = true;
    const q    = this.questions[this.current];
    const opts = this.container.querySelectorAll('.quiz-option');
    const fb   = this.container.querySelector('#qfeedback');
    opts.forEach(b => b.disabled = true);

    if (index === q.correct) {
      this.score++;
      opts[index].classList.add('correct');
      fb.className = 'feedback-box show feedback-correct';
      fb.innerHTML = `✅ <strong>Correct!</strong> ${q.explanation}`;
    } else {
      this.wrong.push({ q, chosen: index });
      opts[index].classList.add('wrong');
      opts[q.correct].classList.add('correct');
      fb.className = 'feedback-box show feedback-wrong';
      fb.innerHTML = `❌ <strong>Not quite.</strong> ${q.explanation}`;
    }

    const nextBtn = document.createElement('button');
    nextBtn.className = 'btn btn-primary';
    nextBtn.style.cssText = 'margin-top:.85rem;width:100%';
    nextBtn.textContent = this.current + 1 < this.questions.length ? 'Next →' : 'See Results →';
    nextBtn.addEventListener('click', () => { this.current++; this.render(); });
    fb.after(nextBtn);
  }

  _buildReviewHtml() {
    return `
      <div style="margin-top:1.5rem;text-align:left">
        <h4 style="margin-bottom:.75rem;font-size:.9rem;color:var(--text)">📋 Questions to review (${this.wrong.length})</h4>
        ${this.wrong.map(({ q, chosen }) => `
          <div style="margin-bottom:1.1rem;padding:.85rem;background:var(--surface2);border-radius:8px;border-left:3px solid var(--interactions)">
            <p style="font-size:.875rem;font-weight:600;margin-bottom:.55rem">${q.question}</p>
            <p style="font-size:.8rem;color:#f87171;margin-bottom:.25rem">✗ Your answer: ${q.options[chosen]}</p>
            <p style="font-size:.8rem;color:#34d399;margin-bottom:.45rem">✓ Correct: ${q.options[q.correct]}</p>
            <p style="font-size:.78rem;color:var(--muted);font-style:italic">${q.explanation}</p>
          </div>`).join('')}
      </div>`;
  }

  showResult() {
    const pct     = Math.round((this.score / this.questions.length) * 100);
    const prev    = Progress.get(this.topicId);
    const prevBest = prev.quizTotal > 0 ? Math.round((prev.quizScore / prev.quizTotal) * 100) : null;
    Progress.recordQuiz(this.topicId, this.score, this.questions.length);
    Streak.record();
    const isNewPB = prevBest !== null && pct > prevBest;

    let msg, colour;
    if (pct === 100) { msg = '🏆 Perfect! You have mastered this topic!'; colour = 'var(--diversity)'; }
    else if (pct >= 70) { msg = '🎉 Great work! Review the questions you missed.'; colour = 'var(--energy)'; }
    else { msg = '📚 Keep practising! Review the simulations and notes.'; colour = 'var(--interactions)'; }

    const hasWrong = this.wrong.length > 0;
    const pbHtml = isNewPB
      ? `<div style="color:#fcd34d;font-weight:700;font-size:.88rem;margin-bottom:.75rem">🌟 New Personal Best! (was ${prevBest}%)</div>`
      : prevBest !== null
        ? `<div style="color:var(--muted);font-size:.8rem;margin-bottom:.75rem">Previous best: ${prevBest}%</div>`
        : '';

    this.container.innerHTML = `
      <div style="text-align:center;padding:2rem 1rem 1rem">
        <div style="font-size:3rem;margin-bottom:.75rem">${pct === 100 ? '🏆' : pct >= 70 ? '⭐' : '📖'}</div>
        <h3 style="margin-bottom:.5rem">${this.score} / ${this.questions.length} correct · ${pct}%</h3>
        <div class="progress-bar-wrap" style="max-width:260px;margin:.75rem auto 1rem">
          <div class="progress-bar-fill" style="width:${pct}%;background:${colour}"></div>
        </div>
        ${pbHtml}
        <p style="margin-bottom:1.5rem">${msg}</p>
        <div style="display:flex;gap:.75rem;justify-content:center;flex-wrap:wrap">
          <button class="btn btn-ghost" onclick="location.reload()">↺ Try Again</button>
          ${hasWrong ? `<button class="btn btn-primary" id="retry-wrong-btn">🎯 Practise ${this.wrong.length} Missed</button>` : ''}
        </div>
      </div>
      ${hasWrong ? this._buildReviewHtml() : ''}
    `;

    if (hasWrong) {
      const wrongSnapshot = this.wrong.map(({ q }) => ({
        question: q.question, options: q.options, correct: q.correct, explanation: q.explanation
      }));
      document.getElementById('retry-wrong-btn')?.addEventListener('click', () => {
        new QuizEngine(wrongSnapshot, this.topicId, this.container);
      });
    }
  }
}

// ── LLM Quiz Engine (Gemini-powered, adaptive difficulty) ──
class LLMQuizEngine {
  /**
   * @param {string}   topicId       - e.g. 'forces'
   * @param {string}   topicName     - e.g. 'Forces'
   * @param {number}   defaultLevel  - Primary level 3–6
   * @param {string|HTMLElement} container - container id or element
   * @param {Array}    staticFallback - static questions for when AI unavailable
   */
  constructor(topicId, topicName, defaultLevel, container, staticFallback = []) {
    this.topicId       = topicId;
    this.topicName     = topicName;
    this.defaultLevel  = defaultLevel;
    this.container     = typeof container === 'string' ? document.getElementById(container) : container;
    this.staticFallback = staticFallback;
    this.questions     = [];
    this.current       = 0;
    this.score         = 0;
    this.answered      = false;
    this.wrong         = []; // { q, chosen } for each incorrect answer
  }

  get level() { return AIConfig.getLevel(this.topicId, this.defaultLevel); }

  async start(count = 6) {
    this.score = 0; this.current = 0; this.wrong = [];
    this.container.innerHTML = `
      <div style="text-align:center;padding:3rem 1rem">
        <div style="font-size:2.5rem;margin-bottom:.75rem;animation:spin 1.5s linear infinite;display:inline-block">⚙️</div>
        <p style="color:var(--text);font-weight:600">Generating P${this.level} questions…</p>
        <p style="font-size:.78rem;color:var(--muted);margin-top:.5rem">Powered by Google Gemini AI</p>
      </div>
      <style>@keyframes spin{to{transform:rotate(360deg)}}</style>
    `;
    try {
      this.questions = await this._generate(count);
      this._render();
    } catch (err) {
      if (this.staticFallback.length) {
        this.container.innerHTML = `
          <div class="feedback-box show" style="background:#1a2a1a;border-color:#34d399;margin-bottom:.75rem;font-size:.8rem">
            ⚠️ AI unavailable — using built-in questions instead.
            <button onclick="showAISetup()" style="margin-left:.5rem;background:none;border:none;color:var(--accent);cursor:pointer;font-size:.78rem">Configure API key ↗</button>
          </div>
        `;
        new QuizEngine(this.staticFallback, this.topicId, this.container, 6);
      } else {
        this.container.innerHTML = `
          <div class="feedback-box show feedback-wrong">
            ❌ Could not generate questions: ${err.message}
            <br><button class="btn btn-ghost" onclick="showAISetup()" style="margin-top:.75rem;font-size:.8rem">⚙️ Set up AI key</button>
          </div>
        `;
      }
    }
  }

  async _generate(count) {
    const key = AIConfig.getKey();
    if (!key) throw new Error('No Gemini API key configured.');

    const levelDesc = {
      3: 'Primary 3 (age 9) — simple recall and basic understanding',
      4: 'Primary 4 (age 10) — apply concepts to familiar situations',
      5: 'Primary 5 (age 11) — analyse data, explain processes',
      6: 'Primary 6 (age 12) — evaluate, compare, synthesise across topics'
    }[this.level] || 'Primary 5';

    const prompt = `You are an experienced Singapore MOE Primary Science teacher.
Generate exactly ${count} multiple-choice questions about "${this.topicName}" for ${levelDesc} students.

Rules:
- Each question has exactly 4 options, with exactly 1 correct answer (index 0–3)
- Align with Singapore Primary Science syllabus and vocabulary
- Vary question style: some recall, some application, some diagram-description
- Include a clear, precise explanation (1–2 sentences)

Respond with ONLY a JSON array — no markdown, no code fences, no extra text:
[{"question":"…","options":["A","B","C","D"],"correct":0,"explanation":"…"}]`;

    const resp = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(key)}`,
      { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.75, maxOutputTokens: 2048, responseMimeType: 'application/json' }
        }) }
    );

    if (!resp.ok) {
      const e = await resp.json().catch(() => ({}));
      throw new Error(e.error?.message || `API error ${resp.status}`);
    }

    const data = await resp.json();
    // gemini-2.5-flash returns thought parts first; filter them out to get the actual response
    const parts = data.candidates?.[0]?.content?.parts || [];
    const text = parts.filter(p => !p.thought).map(p => p.text || '').join('');
    let qs;
    try { qs = JSON.parse(text); }
    catch {
      const match = text.match(/\[[\s\S]*\]/);
      if (!match) throw new Error('Unexpected response format from AI.');
      qs = JSON.parse(match[0]);
    }
    if (!Array.isArray(qs) || !qs.length) throw new Error('No questions in AI response.');
    return qs;
  }

  _render() {
    if (this.current >= this.questions.length) { this._showResult(); return; }
    const q = this.questions[this.current];
    this.answered = false;
    this.container.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:.5rem">
        <span style="font-size:.75rem;color:var(--muted)">Question ${this.current + 1} of ${this.questions.length}</span>
        <span class="ai-badge">🤖 AI · P${this.level}</span>
      </div>
      <p style="font-size:.95rem;color:var(--text);margin-bottom:1rem;font-weight:600">${q.question}</p>
      <div style="display:flex;flex-direction:column;gap:.5rem">
        ${q.options.map((opt, i) => `<button class="quiz-option" data-index="${i}">${opt}</button>`).join('')}
      </div>
      <div class="feedback-box" id="qfeedback"></div>
    `;
    this.container.querySelectorAll('.quiz-option').forEach(btn => {
      btn.addEventListener('click', () => this._answer(parseInt(btn.dataset.index)));
    });
  }

  _answer(index) {
    if (this.answered) return;
    this.answered = true;
    const q    = this.questions[this.current];
    const opts = this.container.querySelectorAll('.quiz-option');
    const fb   = this.container.querySelector('#qfeedback');
    opts.forEach(b => b.disabled = true);

    if (index === q.correct) {
      this.score++;
      opts[index].classList.add('correct');
      fb.className = 'feedback-box show feedback-correct';
      fb.innerHTML = `✅ <strong>Correct!</strong> ${q.explanation}`;
    } else {
      this.wrong.push({ q, chosen: index });
      opts[index].classList.add('wrong');
      if (opts[q.correct]) opts[q.correct].classList.add('correct');
      fb.className = 'feedback-box show feedback-wrong';
      fb.innerHTML = `❌ <strong>Not quite.</strong> ${q.explanation}`;
    }

    const nextBtn = document.createElement('button');
    nextBtn.className = 'btn btn-primary';
    nextBtn.style.cssText = 'margin-top:.85rem;width:100%';
    nextBtn.textContent = this.current + 1 < this.questions.length ? 'Next →' : 'See Results →';
    nextBtn.addEventListener('click', () => { this.current++; this._render(); });
    fb.after(nextBtn);
  }

  _showResult() {
    const pct      = Math.round((this.score / this.questions.length) * 100);
    const prev     = Progress.get(this.topicId);
    const prevBest = prev.quizTotal > 0 ? Math.round((prev.quizScore / prev.quizTotal) * 100) : null;
    Progress.recordQuiz(this.topicId, this.score, this.questions.length);
    Streak.record();
    const isNewPB = prevBest !== null && pct > prevBest;

    // Adaptive level adjustment
    const lv = this.level;
    if (pct >= 80 && lv < 6) {
      AIConfig.setLevel(this.topicId, lv + 1);
      setTimeout(() => showToast(`⬆️ Next AI quiz will step up to P${lv + 1} level!`), 600);
    } else if (pct < 45 && lv > 3) {
      AIConfig.setLevel(this.topicId, lv - 1);
      setTimeout(() => showToast(`📖 Next AI quiz will be pitched at P${lv - 1} — keep practising!`), 600);
    }

    let msg, colour;
    if (pct === 100) { msg = '🏆 Perfect score! Outstanding work!'; colour = 'var(--diversity)'; }
    else if (pct >= 70) { msg = '🎉 Great work! A few more to go.'; colour = 'var(--energy)'; }
    else { msg = '📚 Keep going — use the Learn and Simulate tabs for help.'; colour = 'var(--interactions)'; }

    const pbHtml = isNewPB
      ? `<div style="color:#fcd34d;font-weight:700;font-size:.88rem;margin-bottom:.75rem">🌟 New Personal Best! (was ${prevBest}%)</div>`
      : prevBest !== null
        ? `<div style="color:var(--muted);font-size:.8rem;margin-bottom:.75rem">Previous best: ${prevBest}%</div>`
        : '';

    const hasWrong = this.wrong.length > 0;
    const reviewHtml = hasWrong ? `
      <div style="margin-top:1.5rem;text-align:left">
        <h4 style="margin-bottom:.75rem;font-size:.9rem;color:var(--text)">📋 Questions to review (${this.wrong.length})</h4>
        ${this.wrong.map(({ q, chosen }) => `
          <div style="margin-bottom:1.1rem;padding:.85rem;background:var(--surface2);border-radius:8px;border-left:3px solid var(--interactions)">
            <p style="font-size:.875rem;font-weight:600;margin-bottom:.55rem">${q.question}</p>
            <p style="font-size:.8rem;color:#f87171;margin-bottom:.25rem">✗ Your answer: ${q.options[chosen]}</p>
            <p style="font-size:.8rem;color:#34d399;margin-bottom:.45rem">✓ Correct: ${q.options[q.correct]}</p>
            <p style="font-size:.78rem;color:var(--muted);font-style:italic">${q.explanation}</p>
          </div>`).join('')}
      </div>` : '';

    this.container.innerHTML = `
      <div style="text-align:center;padding:2rem 1rem 1rem">
        <div style="font-size:3rem;margin-bottom:.75rem">${pct === 100 ? '🏆' : pct >= 70 ? '⭐' : '📖'}</div>
        <h3 style="margin-bottom:.5rem">${this.score} / ${this.questions.length} correct · ${pct}%</h3>
        <div class="progress-bar-wrap" style="max-width:260px;margin:.75rem auto 1rem">
          <div class="progress-bar-fill" style="width:${pct}%;background:${colour}"></div>
        </div>
        ${pbHtml}
        <p style="margin-bottom:1.5rem">${msg}</p>
        <div style="display:flex;gap:.75rem;justify-content:center;flex-wrap:wrap">
          <button class="btn btn-primary" id="retry-ai-btn">🔄 New AI Questions</button>
          ${hasWrong ? `<button class="btn btn-primary" id="retry-wrong-ai-btn">🎯 Practise ${this.wrong.length} Missed</button>` : ''}
          <button class="btn btn-ghost" onclick="location.reload()">↺ Reset</button>
        </div>
        <p style="font-size:.72rem;color:var(--muted);margin-top:1rem">Next quiz: P${this.level} difficulty</p>
      </div>
      ${reviewHtml}
    `;
    document.getElementById('retry-ai-btn')?.addEventListener('click', () => this.start(this.questions.length));

    if (hasWrong) {
      const wrongSnapshot = this.wrong.map(({ q }) => ({
        question: q.question, options: q.options, correct: q.correct, explanation: q.explanation
      }));
      document.getElementById('retry-wrong-ai-btn')?.addEventListener('click', () => {
        new QuizEngine(wrongSnapshot, this.topicId, this.container);
      });
    }
  }
}

// ── AI Quiz Toggle (auto-injects into topic pages) ─────────
// Call this after DOMContentLoaded on any topic page.
// The quiz container must have data-topic-id, data-topic-name, data-topic-level.
function initAIQuizToggle(staticQuestions = []) {
  const container = document.getElementById('quiz-container');
  if (!container) return;

  const topicId   = container.dataset.topicId;
  const topicName = container.dataset.topicName;
  const level     = parseInt(container.dataset.topicLevel) || 4;
  if (!topicId) return;

  // Build the toggle bar above the quiz area
  const wrapper = document.createElement('div');
  wrapper.id = 'quiz-mode-wrapper';

  const toggleBar = document.createElement('div');
  toggleBar.className = 'quiz-mode-bar';
  toggleBar.innerHTML = `
    <button class="quiz-mode-btn active" data-mode="static">📋 Standard Quiz</button>
    <button class="quiz-mode-btn" data-mode="ai">🤖 AI Quiz${AIConfig.hasKey() ? '' : ' <span class="ai-setup-hint">— set up key</span>'}</button>
  `;

  const quizArea = document.createElement('div');
  quizArea.id = 'quiz-area';

  // Move container's existing children into quizArea
  while (container.firstChild) quizArea.appendChild(container.firstChild);

  wrapper.appendChild(toggleBar);
  wrapper.appendChild(quizArea);
  container.appendChild(wrapper);

  // Keep the "set up key" hint in sync when a key arrives via any
  // route (Settings modal, Coach sidebar, Jarvis, etc.).
  document.addEventListener('jgl:gemini-key-changed', () => {
    const aiBtn = toggleBar.querySelector('[data-mode="ai"]');
    if (!aiBtn) return;
    aiBtn.innerHTML = '🤖 AI Quiz' + (AIConfig.hasKey() ? '' : ' <span class="ai-setup-hint">— set up key</span>');
  });

  // Lazy instances
  let staticEngine = null;
  let aiEngine     = null;

  function showStatic() {
    quizArea.innerHTML = '';
    quizArea.id = 'quiz-inner-static';
    if (staticQuestions.length) {
      staticEngine = new QuizEngine(staticQuestions, topicId, quizArea, 0);
    } else {
      quizArea.innerHTML = '<p style="color:var(--muted)">No static questions available for this topic.</p>';
    }
  }

  function showAI() {
    if (!AIConfig.hasKey()) {
      quizArea.innerHTML = `
        <div style="text-align:center;padding:2.5rem 1rem">
          <div style="font-size:2.5rem;margin-bottom:.75rem">🤖</div>
          <h3 style="margin-bottom:.5rem">AI Quizzes</h3>
          <p style="font-size:.85rem;color:var(--muted);margin-bottom:1.25rem">
            Get fresh, adaptive questions generated by Google Gemini AI.<br>
            A free API key takes under 1 minute to set up.
          </p>
          <button class="btn btn-primary" onclick="showAISetup()">⚙️ Set Up AI Key</button>
        </div>
      `;
      return;
    }
    quizArea.innerHTML = '';
    aiEngine = new LLMQuizEngine(topicId, topicName, level, quizArea, staticQuestions);
    aiEngine.start(6);
  }

  // Default: show static
  showStatic();

  toggleBar.querySelectorAll('.quiz-mode-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      toggleBar.querySelectorAll('.quiz-mode-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      if (btn.dataset.mode === 'static') showStatic();
      else showAI();
    });
  });
}

// ── Mind Map (d3-force, Obsidian-style) ───────────────────
// Same public API as before (addNode/addEdge/deleteSelected/reset/
// togglePhysics/save/load/check) so every topic page keeps working.
// Requires d3 v7 (injected by the topic HTML). If d3 is unavailable
// we fall back to vis-network via the old code path guarded below.
class ScienceMindMap {
  constructor(containerId, topicId, template) {
    this.containerId = containerId;
    this.topicId     = topicId;
    this.template    = template;
    this.nodes = [];
    this.links = [];
    this.sim   = null;
    this.focusId = null;
    this.linkingFrom = null;
    this.nodeIdCounter = 1000;
    this.transform = (typeof d3 !== 'undefined') ? d3.zoomIdentity : { x:0, y:0, k:1 };
    this._pendingSize = null;
    this._initD3();
  }

  _initD3() {
    const container = document.getElementById(this.containerId);
    if (!container) return;
    if (typeof d3 === 'undefined') {
      container.innerHTML = '<div style="color:#94a3b8;padding:1rem;font-size:.85rem">Mind map unavailable (d3 did not load).</div>';
      return;
    }

    // Create SVG scaffold inside the container
    container.innerHTML = '';
    container.style.position = 'relative';
    container.style.overflow = 'hidden';
    this.svg = d3.select(container).append('svg')
      .attr('class', 'sci-mm-svg')
      .attr('width', '100%')
      .attr('height', '100%')
      .style('display', 'block')
      .style('touch-action', 'none')
      .style('cursor', 'default');
    this.root = this.svg.append('g').attr('class', 'sci-mm-root');
    this.edgeG = this.root.append('g').attr('class', 'sci-mm-edges');
    this.nodeG = this.root.append('g').attr('class', 'sci-mm-nodes');

    // Styles scoped to mind maps
    if (!document.getElementById('sci-mm-style')) {
      const s = document.createElement('style');
      s.id = 'sci-mm-style';
      s.textContent = `
        .sci-mm-svg .node text {
          pointer-events: none; fill: #cfd3df;
          font-family: 'Inter Tight','Inter',system-ui,sans-serif;
          font-weight: 600; paint-order: stroke;
          stroke: #0d1a2e; stroke-width: 3.5; stroke-linejoin: round;
        }
        .sci-mm-svg .node.root text { fill: #ffffff; font-weight: 800; }
        .sci-mm-svg .node circle { cursor: pointer; transition: stroke-width .12s, opacity .15s; }
        .sci-mm-svg .node.focus circle { stroke-width: 3.5; filter: drop-shadow(0 0 6px currentColor); }
        .sci-mm-svg .node.dim circle { opacity: .22; }
        .sci-mm-svg .node.dim text   { opacity: .28; }
        .sci-mm-svg .edge { fill: none; stroke: #64748b; stroke-width: .9; opacity: .45; }
        .sci-mm-svg .edge.active { stroke: #a78bfa; opacity: 1; stroke-width: 1.6; }
        .sci-mm-svg .edge.dim { opacity: .1; }
        .sci-mm-svg .edge-label { font-size: 9px; fill: #94a3b8; pointer-events: none; }
        .sci-mm-svg.linking { cursor: crosshair; }
      `;
      document.head.appendChild(s);
    }

    // Seed from template
    this._loadFromTemplate();
    this._layoutSeed();
    this._initSim();
    this._initZoom();
    this._initDblClick();
    this._render();

    // Observe container resize + visibility so the layout re-centres
    // when the tab becomes visible (fixes the "stuck off-screen" bug
    // caused by vis-network being initialised while display:none).
    const ro = new ResizeObserver(() => this._onResize());
    ro.observe(container);
    // Also trigger on tab clicks — topic pages drive tab switches via
    // the shared initTabs() handler; we re-centre any time our own
    // container becomes measurable.
    this._checkSizeSoon();
  }

  _checkSizeSoon() {
    const container = document.getElementById(this.containerId);
    if (!container) return;
    const poll = () => {
      const r = container.getBoundingClientRect();
      if (r.width > 10 && r.height > 10) {
        this._onResize();
        this.sim && this.sim.alpha(0.7).restart();
        setTimeout(() => this.svg && this._centreView(), 60);
        return;
      }
      setTimeout(poll, 200);
    };
    poll();
  }

  _loadFromTemplate() {
    this.nodes = (this.template.nodes || []).map(n => ({
      id: n.id, label: n.label || 'Node', _root: !!n.color, _colour: (n.color && n.color.border) || '#a78bfa',
    }));
    this.links = (this.template.edges || []).map(e => ({ source: e.from, target: e.to, label: e.label || '' }));
  }

  _layoutSeed() {
    const container = document.getElementById(this.containerId);
    const r = container.getBoundingClientRect();
    const cx = (r.width || 800) / 2, cy = (r.height || 420) / 2;
    const radius = Math.min(r.width || 800, r.height || 420) * 0.30 || 160;
    const n = this.nodes.length || 1;
    this.nodes.forEach((node, i) => {
      if (node._root || i === 0) { node.x = cx; node.y = cy; return; }
      const a = ((i - 1) / Math.max(1, n - 1)) * Math.PI * 2 - Math.PI / 2;
      node.x = cx + radius * Math.cos(a);
      node.y = cy + radius * Math.sin(a);
    });
  }

  _initSim() {
    const container = document.getElementById(this.containerId);
    const r = container.getBoundingClientRect();
    const cx = (r.width || 800) / 2, cy = (r.height || 420) / 2;
    this.sim = d3.forceSimulation(this.nodes)
      .alphaDecay(0.03)
      .velocityDecay(0.5)
      .force('link', d3.forceLink(this.links).id(d => d.id).distance(110).strength(0.55))
      .force('charge', d3.forceManyBody().strength(d => d._root ? -900 : -380))
      .force('collide', d3.forceCollide().radius(28).strength(0.9))
      .force('x', d3.forceX(cx).strength(0.04))
      .force('y', d3.forceY(cy).strength(0.04))
      .on('tick', () => this._tick());
  }

  _initZoom() {
    const zoom = d3.zoom()
      .scaleExtent([0.3, 3])
      .filter(ev => {
        if (ev.type === 'dblclick') return false;
        return !ev.target.closest('g.node');
      })
      .on('zoom', (ev) => { this.transform = ev.transform; this.root.attr('transform', ev.transform); });
    this.svg.call(zoom).on('dblclick.zoom', null);
    this._zoom = zoom;
  }

  _initDblClick() {
    this.svg.on('dblclick', (ev) => {
      if (ev.target.closest('g.node')) return;
      const [x, y] = this.transform.invert(d3.pointer(ev));
      const lbl = prompt('New node label:');
      if (lbl && lbl.trim()) this._addNodeAt(lbl.trim(), x, y);
    });
  }

  _centreView() {
    if (!this._zoom) return;
    this.svg.transition().duration(300).call(this._zoom.transform, d3.zoomIdentity);
  }

  _onResize() {
    const container = document.getElementById(this.containerId);
    if (!container || !this.sim) return;
    const r = container.getBoundingClientRect();
    if (r.width < 10) return;
    const cx = r.width / 2, cy = r.height / 2;
    this.sim.force('x').x(cx);
    this.sim.force('y').y(cy);
    this.sim.alpha(0.3).restart();
  }

  _tick() {
    this.edgeG.selectAll('path.edge')
      .attr('d', d => {
        const a = typeof d.source === 'object' ? d.source : this._byId(d.source);
        const b = typeof d.target === 'object' ? d.target : this._byId(d.target);
        if (!a || !b) return '';
        return `M${a.x},${a.y} L${b.x},${b.y}`;
      });
    this.nodeG.selectAll('g.node').attr('transform', d => `translate(${d.x||0},${d.y||0})`);
  }

  _byId(id) { return this.nodes.find(n => n.id === id); }

  _render() {
    // Edges
    const edgeKey = d => {
      const s = typeof d.source === 'object' ? d.source.id : d.source;
      const t = typeof d.target === 'object' ? d.target.id : d.target;
      return s + '→' + t;
    };
    const esel = this.edgeG.selectAll('path.edge').data(this.links, edgeKey);
    esel.exit().remove();
    esel.enter().append('path').attr('class', 'edge');

    // Nodes
    const nsel = this.nodeG.selectAll('g.node').data(this.nodes, d => d.id);
    nsel.exit().remove();
    const enter = nsel.enter().append('g').attr('class', d => 'node' + (d._root ? ' root' : ''));
    enter.append('circle')
      .attr('r', d => d._root ? 14 : 8)
      .attr('fill', '#0d1a2e')
      .attr('stroke-width', d => d._root ? 2 : 1.5);
    enter.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', d => d._root ? 30 : 22)
      .attr('font-size', d => d._root ? 13 : 11);

    const all = enter.merge(nsel);
    all.select('circle').attr('stroke', d => d._colour || '#a78bfa');
    all.select('text').text(d => d.label);

    all.on('click', (ev, d) => this._onClickNode(ev, d))
       .call(this._dragBehavior());

    // Sim refresh
    if (this.sim) {
      this.sim.nodes(this.nodes);
      this.sim.force('link').links(this.links);
      this.sim.alpha(0.6).restart();
    }
  }

  _dragBehavior() {
    const self = this;
    return d3.drag()
      .on('start', (ev, d) => {
        if (!ev.active) self.sim.alphaTarget(0.3).restart();
        d.fx = d.x; d.fy = d.y;
      })
      .on('drag', (ev, d) => { d.fx = ev.x; d.fy = ev.y; })
      .on('end', (ev, d) => {
        if (!ev.active) self.sim.alphaTarget(0);
        // Keep pinned so user-positioned nodes stay put
      });
  }

  _onClickNode(ev, d) {
    if (this.linkingFrom) {
      if (d.id !== this.linkingFrom) {
        this.links.push({ source: this.linkingFrom, target: d.id });
        this._render();
        if (typeof showToast === 'function') showToast('Connected.');
      }
      this.linkingFrom = null;
      this.svg.classed('linking', false);
      return;
    }
    this.focusId = this.focusId === d.id ? null : d.id;
    this._applyFocus();
  }

  _applyFocus() {
    const id = this.focusId;
    const adj = new Set(id ? [id] : []);
    if (id) this.links.forEach(l => {
      const s = typeof l.source === 'object' ? l.source.id : l.source;
      const t = typeof l.target === 'object' ? l.target.id : l.target;
      if (s === id) adj.add(t);
      if (t === id) adj.add(s);
    });
    this.nodeG.selectAll('g.node')
      .classed('dim',   d => id && !adj.has(d.id))
      .classed('focus', d => d.id === id);
    this.edgeG.selectAll('path.edge').each(function (l) {
      const s = typeof l.source === 'object' ? l.source.id : l.source;
      const t = typeof l.target === 'object' ? l.target.id : l.target;
      const active = id && (s === id || t === id);
      d3.select(this).classed('active', !!active).classed('dim', id && !active);
    });
  }

  _addNodeAt(label, x, y) {
    const id = ++this.nodeIdCounter;
    this.nodes.push({ id, label, x, y, _colour: '#10b981' });
    this._render();
    return id;
  }

  // ═══════ Public API (preserved) ═══════
  addNode(label) {
    const container = document.getElementById(this.containerId);
    const r = container.getBoundingClientRect();
    const id = ++this.nodeIdCounter;
    this.nodes.push({
      id, label: label || 'New Idea',
      x: r.width / 2 + (Math.random() - .5) * 60,
      y: r.height / 2 + (Math.random() - .5) * 60,
      _colour: '#10b981',
    });
    this._render();
    return id;
  }

  addEdge() {
    if (this.nodes.length < 2) { if (typeof showToast === 'function') showToast('Add more nodes first.'); return; }
    if (typeof showToast === 'function') showToast('Click the first node, then the second node, to connect.');
    this.linkingFrom = null;
    this.svg.classed('linking', true);
    // First click sets linkingFrom, second click draws the edge.
    const handler = (ev, d) => {
      if (!this.linkingFrom) {
        this.linkingFrom = d.id;
        return;
      }
    };
    // Override one-time: temporarily intercept the click via _onClickNode's
    // existing linkingFrom flow. We just need to arm the flag.
    // Wait for first click to arm linkingFrom via a one-shot listener.
    const once = (ev) => {
      const target = ev.target.closest('g.node');
      if (!target) return;
      const dat = d3.select(target).datum();
      if (!this.linkingFrom) { this.linkingFrom = dat.id; }
      this.svg.node().removeEventListener('click', once, true);
    };
    this.svg.node().addEventListener('click', once, true);
  }

  deleteSelected() {
    if (!this.focusId) { if (typeof showToast === 'function') showToast('Click a node to select it, then Delete.'); return; }
    const id = this.focusId;
    this.nodes = this.nodes.filter(n => n.id !== id);
    this.links = this.links.filter(l => {
      const s = typeof l.source === 'object' ? l.source.id : l.source;
      const t = typeof l.target === 'object' ? l.target.id : l.target;
      return s !== id && t !== id;
    });
    this.focusId = null;
    this._render();
    this._applyFocus();
  }

  togglePhysics() {
    // In d3 we don't "stop" physics; we simply unpin all nodes so the
    // layout settles, or pin them in place. Toggle semantics:
    const anyPinned = this.nodes.some(n => n.fx != null);
    if (anyPinned) {
      this.nodes.forEach(n => { delete n.fx; delete n.fy; });
      this.sim.alpha(0.7).restart();
      this._updatePhysicsBtn(true);
      if (typeof showToast === 'function') showToast('Auto-layout ON — drag to pin.');
    } else {
      this.nodes.forEach(n => { n.fx = n.x; n.fy = n.y; });
      this.sim.alphaTarget(0).alpha(0);
      this._updatePhysicsBtn(false);
      if (typeof showToast === 'function') showToast('Pinned. Drag to rearrange freely.');
    }
  }

  _updatePhysicsBtn(on) {
    const btn = document.getElementById('mm-physics-btn');
    if (btn) btn.textContent = on ? '⏹ Pin all' : '🌀 Re-layout';
  }

  save() {
    const data = {
      nodes: this.nodes.map(n => ({ id: n.id, label: n.label, _root: n._root, _colour: n._colour, fx: n.fx, fy: n.fy })),
      edges: this.links.map(l => ({
        from: typeof l.source === 'object' ? l.source.id : l.source,
        to:   typeof l.target === 'object' ? l.target.id : l.target,
        label: l.label || ''
      }))
    };
    try { localStorage.setItem(`sciLab_mindmap_${this.topicId}`, JSON.stringify(data)); } catch {}
    if (typeof Progress !== 'undefined') Progress.recordMindMap(this.topicId);
    return data;
  }

  load() {
    try {
      const raw = localStorage.getItem(`sciLab_mindmap_${this.topicId}`);
      if (!raw) { if (typeof showToast === 'function') showToast('No saved mind map found.'); return; }
      const saved = JSON.parse(raw);
      this.nodes = (saved.nodes || []).map(n => ({ ...n }));
      this.links = (saved.edges || []).map(e => ({ source: e.from, target: e.to, label: e.label || '' }));
      this._render();
      if (typeof showToast === 'function') showToast('Mind map loaded.');
    } catch { if (typeof showToast === 'function') showToast('Could not load mind map.'); }
  }

  check() {
    const required  = this.template.required || [];
    const allLabels = this.nodes.map(n => (n.label || '').toLowerCase());
    const missing   = required.filter(r => !allLabels.some(l => l.includes(r.toLowerCase())));
    const found     = required.filter(r =>  allLabels.some(l => l.includes(r.toLowerCase())));
    let fb = `<strong>Mind Map Check</strong><br><br>`;
    fb += `✅ Found (${found.length}/${required.length}): ${found.join(', ') || 'none'}<br>`;
    if (missing.length) fb += `💡 Consider adding: <em>${missing.join(', ')}</em>`;
    else                fb += `🏆 Excellent. Your map covers all the required ideas.`;
    const box = document.getElementById('mindmap-feedback');
    if (box) { box.innerHTML = fb; box.style.display = 'block'; }
    return missing;
  }

  reset() {
    this._loadFromTemplate();
    this._layoutSeed();
    this.focusId = null;
    this._render();
    this.sim && this.sim.alpha(0.8).restart();
    this._centreView();
  }
}

// ── Back-navigation helper ─────────────────────────────────
function initBackBtn() {
  const btn = document.getElementById('back-btn');
  if (btn) btn.addEventListener('click', () => { window.location.href = '../../index.html'; });
}

// ── DOMContentLoaded bootstrap ─────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initTabs();
  initGlossary();
  initBackBtn();
  // Auto-inject AI quiz toggle if quiz container has data-topic-id
  const qc = document.getElementById('quiz-container');
  if (qc && qc.dataset.topicId) {
    // initAIQuizToggle() is called explicitly by each topic page with its static questions
    // so we don't call it here automatically
  }
});
