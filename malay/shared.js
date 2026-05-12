/* =========================================================
   PSLE Malay Studio — Shared Utilities
   Progress · Streak · Tabs · Glossary · Toast · Quiz · MindMap · AI
   Ported from /studio/shared.js with the malay_* namespace and
   a Bahasa Melayu LLM prompt. No Supabase. All state local.
   ========================================================= */

// ── Progress (localStorage) ────────────────────────────────
const Progress = {
  KEY: 'malay_progress',

  all() {
    try { return JSON.parse(localStorage.getItem(this.KEY)) || {}; }
    catch { return {}; }
  },

  get(topicId) {
    return this.all()[topicId] || { quizScore: 0, quizTotal: 0, drillUsed: false, mindMapSaved: false, visitCount: 0, lastQuizDate: null, flashcardCounts: {} };
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
    if (p.drillUsed)         score += 30;
    if (p.mindMapSaved)      score += 20;
    if (p.quizTotal > 0)     score += Math.round((p.quizScore / p.quizTotal) * 40);
    return Math.min(score, 100);
  },

  recordVisit(topicId) {
    const p = this.get(topicId);
    this.set(topicId, { visitCount: (p.visitCount || 0) + 1 });
  },

  recordDrillUsed(topicId) {
    this.set(topicId, { drillUsed: true });
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
// Legacy 14-day streak widget shape. Coexists with the newer
// MalayStreak (shared/streak.js) which uses jgl.progress and
// honours rest days. The hub reads this one.
const Streak = {
  META_KEY: 'malay_meta',

  _getMeta() {
    try { return JSON.parse(localStorage.getItem(this.META_KEY)) || {}; }
    catch { return {}; }
  },

  _setMeta(m) { localStorage.setItem(this.META_KEY, JSON.stringify(m)); },

  record() {
    const today     = new Date().toISOString().slice(0, 10);
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    const m = this._getMeta();
    if (m.lastActivity === today) return;

    m.streak = (m.lastActivity === yesterday) ? (m.streak || 0) + 1 : 1;
    m.longestStreak = Math.max(m.longestStreak || 0, m.streak);
    m.lastActivity  = today;
    const days = m.activeDays || [];
    if (!days.includes(today)) days.push(today);
    m.activeDays = days.slice(-14);
    this._setMeta(m);

    const milestones = [3, 7, 14, 21, 30, 50, 100];
    if (milestones.includes(m.streak)) {
      setTimeout(() => showToast(`🔥 ${m.streak} hari berturut-turut! Syabas!`), 400);
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
// Uses Google Gemini API (gemini-2.5-flash). The student's key
// lives in jgl.geminiKey so a single setup unlocks both Studio
// (Science) and Malay sites. Get a free key at
// https://aistudio.google.com/app/apikey.
const AIConfig = {
  KEY_NAME:  'jgl.geminiKey',
  LEVEL_KEY: 'malay_levels',

  getKey() {
    if (window.JglStorage && typeof window.JglStorage.getGeminiKey === 'function') {
      return window.JglStorage.getGeminiKey();
    }
    return localStorage.getItem(this.KEY_NAME) || localStorage.getItem('sciLab_gemini_key') || '';
  },
  setKey(k) {
    const trimmed = (k || '').trim();
    if (!trimmed) return;
    if (window.JglStorage && typeof window.JglStorage.setGeminiKey === 'function') {
      window.JglStorage.setGeminiKey(trimmed);
      return;
    }
    localStorage.setItem(this.KEY_NAME, trimmed);
    try { document.dispatchEvent(new CustomEvent('jgl:gemini-key-changed', { detail: { key: trimmed } })); } catch {}
  },
  hasKey()  { return !!this.getKey(); },

  getLevels() {
    try { return JSON.parse(localStorage.getItem(this.LEVEL_KEY)) || {}; }
    catch { return {}; }
  },

  // Per-topic adaptive level (4–6 for PSLE Malay; 4 is foundational, 6 is exam-pitch).
  getLevel(topicId, defaultLevel = 5) {
    return this.getLevels()[topicId] || defaultLevel;
  },

  setLevel(topicId, level) {
    const levels = this.getLevels();
    levels[topicId] = Math.max(4, Math.min(6, level));
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
      <div class="ai-modal-header">
        <div class="ai-modal-icon">🤖</div>
        <div class="ai-modal-title-block">
          <h3>Set Up AI Quizzes</h3>
          <p>Google Gemini · Free · Stored only in your browser · Shared with Science Studio</p>
        </div>
        <button id="ai-key-close" class="ai-modal-close" title="Close">✕</button>
      </div>

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

      <div class="ai-key-field-wrap">
        <label class="ai-key-label">Your Gemini API Key</label>
        <div class="ai-key-row">
          <input id="ai-key-input" type="password" placeholder="Paste your key here — starts with AIza…"
            class="ai-key-input" value="${AIConfig.getKey()}">
          <button id="ai-key-toggle" class="btn btn-ghost ai-toggle-btn" title="Show/hide key">👁</button>
        </div>
      </div>

      <div id="ai-key-status" class="ai-key-status"></div>

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

  document.getElementById('ai-key-toggle').addEventListener('click', () => {
    const input = document.getElementById('ai-key-input');
    const btn   = document.getElementById('ai-key-toggle');
    if (input.type === 'password') { input.type = 'text';     btn.textContent = '🙈'; }
    else                           { input.type = 'password'; btn.textContent = '👁';  }
  });

  document.getElementById('ai-key-save').addEventListener('click', () => {
    const key      = document.getElementById('ai-key-input').value.trim();
    const statusEl = document.getElementById('ai-key-status');
    if (!key) { statusEl.innerHTML = '<span class="ai-status-error">Please enter a key before saving.</span>'; return; }
    AIConfig.setKey(key);
    statusEl.innerHTML = '<span class="ai-status-ok">✅ Key saved! AI quizzes are now active.</span>';
    setTimeout(() => { overlay.style.display = 'none'; }, 1500);
  });

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

// ── Quiz engine (static MCQ) ───────────────────────────────
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
    this.wrong     = [];
    this.render();
  }

  render() {
    if (this.current >= this.questions.length) { this.showResult(); return; }
    const q = this.questions[this.current];
    this.answered = false;
    this.container.innerHTML = `
      <div style="margin-bottom:.5rem">
        <span style="font-size:.75rem;color:var(--muted)">Soalan ${this.current + 1} daripada ${this.questions.length}</span>
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
      fb.innerHTML = `✅ <strong>Betul!</strong> ${q.explanation}`;
    } else {
      this.wrong.push({ q, chosen: index });
      opts[index].classList.add('wrong');
      opts[q.correct].classList.add('correct');
      fb.className = 'feedback-box show feedback-wrong';
      fb.innerHTML = `❌ <strong>Belum tepat.</strong> ${q.explanation}`;
    }

    const nextBtn = document.createElement('button');
    nextBtn.className = 'btn btn-primary';
    nextBtn.style.cssText = 'margin-top:.85rem;width:100%';
    nextBtn.textContent = this.current + 1 < this.questions.length ? 'Seterusnya →' : 'Lihat Keputusan →';
    nextBtn.addEventListener('click', () => { this.current++; this.render(); });
    fb.after(nextBtn);
  }

  _buildReviewHtml() {
    return `
      <div style="margin-top:1.5rem;text-align:left">
        <h4 style="margin-bottom:.75rem;font-size:.9rem;color:var(--text)">📋 Soalan untuk diulang kaji (${this.wrong.length})</h4>
        ${this.wrong.map(({ q, chosen }) => `
          <div style="margin-bottom:1.1rem;padding:.85rem;background:var(--surface2);border-radius:8px;border-left:3px solid var(--peribahasa)">
            <p style="font-size:.875rem;font-weight:600;margin-bottom:.55rem">${q.question}</p>
            <p style="font-size:.8rem;color:#f87171;margin-bottom:.25rem">✗ Jawapan anda: ${q.options[chosen]}</p>
            <p style="font-size:.8rem;color:#34d399;margin-bottom:.45rem">✓ Jawapan betul: ${q.options[q.correct]}</p>
            <p style="font-size:.78rem;color:var(--muted);font-style:italic">${q.explanation}</p>
          </div>`).join('')}
      </div>`;
  }

  showResult() {
    const pct      = Math.round((this.score / this.questions.length) * 100);
    const prev     = Progress.get(this.topicId);
    const prevBest = prev.quizTotal > 0 ? Math.round((prev.quizScore / prev.quizTotal) * 100) : null;
    Progress.recordQuiz(this.topicId, this.score, this.questions.length);
    Streak.record();
    const isNewPB = prevBest !== null && pct > prevBest;

    let msg, colour;
    if (pct === 100) { msg = '🏆 Sempurna! Anda menguasai topik ini.'; colour = 'var(--tatabahasa)'; }
    else if (pct >= 70) { msg = '🎉 Bagus! Ulang kaji soalan yang terlepas.'; colour = 'var(--penulisan)'; }
    else { msg = '📚 Teruskan berlatih. Buka semula Pelajaran dan Latihan Mudah.'; colour = 'var(--peribahasa)'; }

    const hasWrong = this.wrong.length > 0;
    const pbHtml = isNewPB
      ? `<div style="color:#fcd34d;font-weight:700;font-size:.88rem;margin-bottom:.75rem">🌟 Pencapaian terbaik baharu! (sebelumnya ${prevBest}%)</div>`
      : prevBest !== null
        ? `<div style="color:var(--muted);font-size:.8rem;margin-bottom:.75rem">Pencapaian terbaik sebelumnya: ${prevBest}%</div>`
        : '';

    this.container.innerHTML = `
      <div style="text-align:center;padding:2rem 1rem 1rem">
        <div style="font-size:3rem;margin-bottom:.75rem">${pct === 100 ? '🏆' : pct >= 70 ? '⭐' : '📖'}</div>
        <h3 style="margin-bottom:.5rem">${this.score} / ${this.questions.length} betul · ${pct}%</h3>
        <div class="progress-bar-wrap" style="max-width:260px;margin:.75rem auto 1rem">
          <div class="progress-bar-fill" style="width:${pct}%;background:${colour}"></div>
        </div>
        ${pbHtml}
        <p style="margin-bottom:1.5rem">${msg}</p>
        <div style="display:flex;gap:.75rem;justify-content:center;flex-wrap:wrap">
          <button class="btn btn-ghost" onclick="location.reload()">↺ Cuba Lagi</button>
          ${hasWrong ? `<button class="btn btn-primary" id="retry-wrong-btn">🎯 Latih ${this.wrong.length} Soalan Terlepas</button>` : ''}
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
   * @param {string}   topicId       - e.g. 'imbuhan'
   * @param {string}   topicName     - e.g. 'Imbuhan meN-'
   * @param {number}   defaultLevel  - 4 (foundational) to 6 (PSLE-pitch)
   * @param {string|HTMLElement} container
   * @param {Array}    staticFallback
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
    this.wrong         = [];
  }

  get level() { return AIConfig.getLevel(this.topicId, this.defaultLevel); }

  async start(count = 6) {
    this.score = 0; this.current = 0; this.wrong = [];
    this.container.innerHTML = `
      <div style="text-align:center;padding:3rem 1rem">
        <div style="font-size:2.5rem;margin-bottom:.75rem;animation:spin 1.5s linear infinite;display:inline-block">⚙️</div>
        <p style="color:var(--text);font-weight:600">Menjana soalan paras P${this.level}…</p>
        <p style="font-size:.78rem;color:var(--muted);margin-top:.5rem">Dikuasakan oleh Google Gemini AI</p>
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
            ⚠️ AI tidak tersedia — menggunakan soalan terbina dalam.
            <button onclick="showAISetup()" style="margin-left:.5rem;background:none;border:none;color:var(--accent);cursor:pointer;font-size:.78rem">Tetapkan API key ↗</button>
          </div>
        `;
        new QuizEngine(this.staticFallback, this.topicId, this.container, 6);
      } else {
        this.container.innerHTML = `
          <div class="feedback-box show feedback-wrong">
            ❌ Tidak dapat menjana soalan: ${err.message}
            <br><button class="btn btn-ghost" onclick="showAISetup()" style="margin-top:.75rem;font-size:.8rem">⚙️ Tetapkan API key</button>
          </div>
        `;
      }
    }
  }

  async _generate(count) {
    const key = AIConfig.getKey();
    if (!key) throw new Error('No Gemini API key configured.');

    const levelDesc = {
      4: 'Darjah 4 (umur 10) — ingat semula konsep mudah dan contoh asas',
      5: 'Darjah 5 (umur 11) — terapkan tatabahasa pada situasi yang biasa',
      6: 'Darjah 6 PSLE (umur 12) — soalan beraras PSLE: analisis, banding-beza, gunakan kosa kata yang tepat'
    }[this.level] || 'Darjah 5';

    const prompt = `Anda seorang guru Bahasa Melayu MOE Singapura yang berpengalaman dan menyediakan pelajar untuk PSLE.
Hasilkan tepat ${count} soalan aneka pilihan tentang "${this.topicName}" untuk pelajar ${levelDesc}.

Peraturan:
- Setiap soalan mesti mempunyai tepat 4 pilihan, dengan tepat 1 jawapan yang betul (indeks 0–3).
- Sejajar dengan sukatan Bahasa Melayu Sekolah Rendah MOE dan format kertas PSLE.
- Variasikan jenis soalan: ingatan, aplikasi, melengkapkan ayat, banding-beza penggunaan.
- Sertakan penjelasan ringkas dan tepat (1–2 ayat) dalam Bahasa Melayu. Penjelasan boleh menyebut istilah tatabahasa.

Balas dengan HANYA tatasusunan JSON — tiada markdown, tiada kod pagar, tiada teks tambahan:
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
        <span style="font-size:.75rem;color:var(--muted)">Soalan ${this.current + 1} daripada ${this.questions.length}</span>
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
      fb.innerHTML = `✅ <strong>Betul!</strong> ${q.explanation}`;
    } else {
      this.wrong.push({ q, chosen: index });
      opts[index].classList.add('wrong');
      if (opts[q.correct]) opts[q.correct].classList.add('correct');
      fb.className = 'feedback-box show feedback-wrong';
      fb.innerHTML = `❌ <strong>Belum tepat.</strong> ${q.explanation}`;
    }

    const nextBtn = document.createElement('button');
    nextBtn.className = 'btn btn-primary';
    nextBtn.style.cssText = 'margin-top:.85rem;width:100%';
    nextBtn.textContent = this.current + 1 < this.questions.length ? 'Seterusnya →' : 'Lihat Keputusan →';
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

    const lv = this.level;
    if (pct >= 80 && lv < 6) {
      AIConfig.setLevel(this.topicId, lv + 1);
      setTimeout(() => showToast(`⬆️ Soalan AI berikutnya akan naik ke paras P${lv + 1}!`), 600);
    } else if (pct < 45 && lv > 4) {
      AIConfig.setLevel(this.topicId, lv - 1);
      setTimeout(() => showToast(`📖 Soalan AI berikutnya pada paras P${lv - 1} — teruskan berlatih.`), 600);
    }

    let msg, colour;
    if (pct === 100) { msg = '🏆 Sempurna! Syabas.'; colour = 'var(--tatabahasa)'; }
    else if (pct >= 70) { msg = '🎉 Bagus. Sedikit lagi sebelum sempurna.'; colour = 'var(--penulisan)'; }
    else { msg = '📚 Teruskan. Lihat tab Pelajaran dan Latihan Mudah untuk bantuan.'; colour = 'var(--peribahasa)'; }

    const pbHtml = isNewPB
      ? `<div style="color:#fcd34d;font-weight:700;font-size:.88rem;margin-bottom:.75rem">🌟 Pencapaian terbaik baharu! (sebelumnya ${prevBest}%)</div>`
      : prevBest !== null
        ? `<div style="color:var(--muted);font-size:.8rem;margin-bottom:.75rem">Pencapaian terbaik sebelumnya: ${prevBest}%</div>`
        : '';

    const hasWrong = this.wrong.length > 0;
    const reviewHtml = hasWrong ? `
      <div style="margin-top:1.5rem;text-align:left">
        <h4 style="margin-bottom:.75rem;font-size:.9rem;color:var(--text)">📋 Soalan untuk diulang kaji (${this.wrong.length})</h4>
        ${this.wrong.map(({ q, chosen }) => `
          <div style="margin-bottom:1.1rem;padding:.85rem;background:var(--surface2);border-radius:8px;border-left:3px solid var(--peribahasa)">
            <p style="font-size:.875rem;font-weight:600;margin-bottom:.55rem">${q.question}</p>
            <p style="font-size:.8rem;color:#f87171;margin-bottom:.25rem">✗ Jawapan anda: ${q.options[chosen]}</p>
            <p style="font-size:.8rem;color:#34d399;margin-bottom:.45rem">✓ Jawapan betul: ${q.options[q.correct]}</p>
            <p style="font-size:.78rem;color:var(--muted);font-style:italic">${q.explanation}</p>
          </div>`).join('')}
      </div>` : '';

    this.container.innerHTML = `
      <div style="text-align:center;padding:2rem 1rem 1rem">
        <div style="font-size:3rem;margin-bottom:.75rem">${pct === 100 ? '🏆' : pct >= 70 ? '⭐' : '📖'}</div>
        <h3 style="margin-bottom:.5rem">${this.score} / ${this.questions.length} betul · ${pct}%</h3>
        <div class="progress-bar-wrap" style="max-width:260px;margin:.75rem auto 1rem">
          <div class="progress-bar-fill" style="width:${pct}%;background:${colour}"></div>
        </div>
        ${pbHtml}
        <p style="margin-bottom:1.5rem">${msg}</p>
        <div style="display:flex;gap:.75rem;justify-content:center;flex-wrap:wrap">
          <button class="btn btn-primary" id="retry-ai-btn">🔄 Soalan AI Baharu</button>
          ${hasWrong ? `<button class="btn btn-primary" id="retry-wrong-ai-btn">🎯 Latih ${this.wrong.length} Soalan Terlepas</button>` : ''}
          <button class="btn btn-ghost" onclick="location.reload()">↺ Set Semula</button>
        </div>
        <p style="font-size:.72rem;color:var(--muted);margin-top:1rem">Soalan seterusnya: paras P${this.level}</p>
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
function initAIQuizToggle(staticQuestions = []) {
  const container = document.getElementById('quiz-container');
  if (!container) return;

  const topicId   = container.dataset.topicId;
  const topicName = container.dataset.topicName;
  const level     = parseInt(container.dataset.topicLevel) || 5;
  if (!topicId) return;

  const wrapper = document.createElement('div');
  wrapper.id = 'quiz-mode-wrapper';

  const toggleBar = document.createElement('div');
  toggleBar.className = 'quiz-mode-bar';
  toggleBar.innerHTML = `
    <button class="quiz-mode-btn active" data-mode="static">📋 Kuiz Biasa</button>
    <button class="quiz-mode-btn" data-mode="ai">🤖 Kuiz AI${AIConfig.hasKey() ? '' : ' <span class="ai-setup-hint">— sediakan API key</span>'}</button>
  `;

  const quizArea = document.createElement('div');
  quizArea.id = 'quiz-area';

  while (container.firstChild) quizArea.appendChild(container.firstChild);

  wrapper.appendChild(toggleBar);
  wrapper.appendChild(quizArea);
  container.appendChild(wrapper);

  document.addEventListener('jgl:gemini-key-changed', () => {
    const aiBtn = toggleBar.querySelector('[data-mode="ai"]');
    if (!aiBtn) return;
    aiBtn.innerHTML = '🤖 Kuiz AI' + (AIConfig.hasKey() ? '' : ' <span class="ai-setup-hint">— sediakan API key</span>');
  });

  let staticEngine = null;
  let aiEngine     = null;

  function showStatic() {
    quizArea.innerHTML = '';
    quizArea.id = 'quiz-inner-static';
    if (staticQuestions.length) {
      staticEngine = new QuizEngine(staticQuestions, topicId, quizArea, 0);
    } else {
      quizArea.innerHTML = '<p style="color:var(--muted)">Tiada soalan terbina dalam untuk topik ini.</p>';
    }
  }

  function showAI() {
    if (!AIConfig.hasKey()) {
      quizArea.innerHTML = `
        <div style="text-align:center;padding:2.5rem 1rem">
          <div style="font-size:2.5rem;margin-bottom:.75rem">🤖</div>
          <h3 style="margin-bottom:.5rem">Kuiz AI</h3>
          <p style="font-size:.85rem;color:var(--muted);margin-bottom:1.25rem">
            Dapatkan soalan baharu dan adaptif yang dijana oleh Google Gemini AI.<br>
            API key percuma — kurang daripada 1 minit untuk disediakan.
          </p>
          <button class="btn btn-primary" onclick="showAISetup()">⚙️ Sediakan API Key</button>
        </div>
      `;
      return;
    }
    quizArea.innerHTML = '';
    aiEngine = new LLMQuizEngine(topicId, topicName, level, quizArea, staticQuestions);
    aiEngine.start(6);
  }

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

// ── Mind Map (D3-based, ported from Studio) ────────────────
// Phase 1: stub class with the same public API so topic pages
// added in Phase 2 work without re-importing. The full D3
// implementation is folded in alongside the first topic page
// that needs it.
class MalayMindMap {
  constructor(containerId, topicId, template) {
    this.containerId = containerId;
    this.topicId     = topicId;
    this.template    = template || { nodes: [], edges: [], required: [] };
    this.nodes = [];
    this.links = [];
    const el = document.getElementById(containerId);
    if (el) {
      el.innerHTML = '<div style="color:var(--muted);padding:1rem;font-size:.85rem">Peta minda tersedia dalam Fasa 2.</div>';
    }
  }
  addNode(_label)      {}
  addEdge()            {}
  deleteSelected()     {}
  togglePhysics()      {}
  save()               { if (typeof Progress !== 'undefined') Progress.recordMindMap(this.topicId); return null; }
  load()               {}
  check()              { return []; }
  reset()              {}
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
});
