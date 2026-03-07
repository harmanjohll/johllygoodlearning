/* =========================================================
   Math Model — Shared Utilities
   Progress · Tabs · Glossary · Toast · Quiz · AI
   ========================================================= */

// ── Progress (localStorage) ────────────────────────────
const Progress = {
  KEY: 'mathModel_progress',

  all() {
    try { return JSON.parse(localStorage.getItem(this.KEY)) || {}; }
    catch { return {}; }
  },

  get(topicId) {
    return this.all()[topicId] || {
      quizScore: 0, quizTotal: 0,
      buildCompleted: false, guidedCompleted: false,
      visitCount: 0, lastQuizDate: null,
      scaffoldLevel: 1
    };
  },

  set(topicId, data) {
    const all = this.all();
    all[topicId] = { ...this.get(topicId), ...data };
    localStorage.setItem(this.KEY, JSON.stringify(all));
  },

  masteryPct(topicId) {
    const p = this.get(topicId);
    let score = 0;
    if (p.visitCount > 0) score += 10;
    if (p.guidedCompleted) score += 25;
    if (p.buildCompleted) score += 25;
    if (p.quizTotal > 0) score += Math.round((p.quizScore / p.quizTotal) * 40);
    return Math.min(score, 100);
  },

  recordVisit(topicId) {
    const p = this.get(topicId);
    this.set(topicId, { visitCount: (p.visitCount || 0) + 1 });
  },

  recordGuidedComplete(topicId) {
    this.set(topicId, { guidedCompleted: true });
  },

  recordBuildComplete(topicId) {
    this.set(topicId, { buildCompleted: true });
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
  }
};

// ── Streak & Activity Tracking ─────────────────────────
const Streak = {
  META_KEY: 'mathModel_meta',

  _getMeta() {
    try { return JSON.parse(localStorage.getItem(this.META_KEY)) || {}; }
    catch { return {}; }
  },

  _setMeta(m) { localStorage.setItem(this.META_KEY, JSON.stringify(m)); },

  record() {
    const today = new Date().toISOString().slice(0, 10);
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    const m = this._getMeta();
    if (m.lastActivity === today) return;

    m.streak = (m.lastActivity === yesterday) ? (m.streak || 0) + 1 : 1;
    m.longestStreak = Math.max(m.longestStreak || 0, m.streak);
    m.lastActivity = today;
    const days = m.activeDays || [];
    if (!days.includes(today)) days.push(today);
    m.activeDays = days.slice(-14);
    this._setMeta(m);

    const milestones = [3, 7, 14, 21, 30, 50, 100];
    if (milestones.includes(m.streak)) {
      Toast.show(`${m.streak}-day streak! Keep it up!`, 'success');
    }
  },

  get() {
    const m = this._getMeta();
    const today = new Date().toISOString().slice(0, 10);
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    if (m.lastActivity !== today && m.lastActivity !== yesterday) {
      return { streak: 0, longestStreak: m.longestStreak || 0, activeDays: m.activeDays || [] };
    }
    return { streak: m.streak || 0, longestStreak: m.longestStreak || 0, activeDays: m.activeDays || [] };
  }
};

// ── Toast Notifications ────────────────────────────────
const Toast = {
  _container: null,

  _ensure() {
    if (!this._container) {
      this._container = document.createElement('div');
      this._container.className = 'toast-container';
      document.body.appendChild(this._container);
    }
  },

  show(msg, type = 'info', duration = 3000) {
    this._ensure();
    const el = document.createElement('div');
    el.className = `toast toast-${type}`;
    el.textContent = msg;
    this._container.appendChild(el);
    setTimeout(() => { el.style.opacity = '0'; setTimeout(() => el.remove(), 300); }, duration);
  }
};

// ── Tab System ─────────────────────────────────────────
function initTabs(root = document) {
  root.querySelectorAll('.tabs').forEach(tabBar => {
    const paneParent = tabBar.parentElement;
    tabBar.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        tabBar.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const target = btn.dataset.tab;
        paneParent.querySelectorAll(':scope > .tab-pane').forEach(p => p.classList.remove('active'));
        const pane = document.getElementById(target);
        if (pane) pane.classList.add('active');
      });
    });
  });
}

function initSubTabs(container) {
  container.querySelectorAll('.sub-tabs').forEach(bar => {
    bar.querySelectorAll('.sub-tab').forEach(btn => {
      btn.addEventListener('click', () => {
        bar.querySelectorAll('.sub-tab').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const parent = bar.parentElement;
        parent.querySelectorAll(':scope > .sub-pane').forEach(p => p.classList.remove('active'));
        const pane = parent.querySelector('#' + btn.dataset.pane);
        if (pane) pane.classList.add('active');
      });
    });
  });
}

// ── Glossary Accordions ────────────────────────────────
function initGlossary(root = document) {
  root.querySelectorAll('.term-name').forEach(t => {
    t.addEventListener('click', () => {
      t.classList.toggle('open');
      const def = t.nextElementSibling;
      if (def) def.classList.toggle('open');
    });
  });
}

// ── AI Configuration (Gemini) ──────────────────────────
const AIConfig = {
  KEY_STORE: 'mathModel_gemini_key',
  LEVEL_KEY: 'mathModel_levels',

  getKey() { return localStorage.getItem(this.KEY_STORE) || ''; },
  setKey(k) { localStorage.setItem(this.KEY_STORE, k); },
  hasKey() { return !!this.getKey(); },

  getLevel(topicId) {
    try {
      const levels = JSON.parse(localStorage.getItem(this.LEVEL_KEY)) || {};
      return levels[topicId] || 'P4';
    } catch { return 'P4'; }
  },
  setLevel(topicId, level) {
    try {
      const levels = JSON.parse(localStorage.getItem(this.LEVEL_KEY)) || {};
      levels[topicId] = level;
      localStorage.setItem(this.LEVEL_KEY, JSON.stringify(levels));
    } catch { /* ignore */ }
  }
};

// ── AI Setup Modal ─────────────────────────────────────
function showAISetup() {
  const existing = document.querySelector('.modal-backdrop');
  if (existing) existing.remove();

  const backdrop = document.createElement('div');
  backdrop.className = 'modal-backdrop';
  backdrop.innerHTML = `
    <div class="modal">
      <h3>Set Up AI-Powered Questions</h3>
      <p style="color:var(--muted);font-size:.84rem;margin-bottom:1rem">
        We use Google Gemini to generate adaptive maths word problems. You need a free API key.
      </p>
      <ol style="font-size:.82rem;margin-bottom:1rem;color:var(--muted)">
        <li>Go to <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener">Google AI Studio</a></li>
        <li>Sign in with a Google account</li>
        <li>Click <strong>Create API Key</strong></li>
        <li>Copy the key and paste it below</li>
      </ol>
      <div style="display:flex;gap:.5rem;margin-bottom:.75rem">
        <input type="password" id="ai-key-input" placeholder="Paste your API key"
          value="${AIConfig.getKey()}"
          style="flex:1;background:var(--surface);border:1px solid var(--border);color:var(--text);
                 padding:.5rem .7rem;border-radius:7px;font-size:.85rem;font-family:inherit">
        <button class="btn btn-ghost btn-sm" id="ai-key-toggle" title="Show/hide">Show</button>
      </div>
      <div id="ai-key-status" style="font-size:.8rem;margin-bottom:.75rem;min-height:1.2rem"></div>
      <p style="font-size:.72rem;color:var(--muted)">Your key is stored locally on this device only and never sent anywhere except directly to Google's API.</p>
      <div class="modal-actions">
        <button class="btn btn-ghost btn-sm" id="ai-key-cancel">Cancel</button>
        <button class="btn btn-primary btn-sm" id="ai-key-test">Test & Save</button>
      </div>
    </div>`;
  document.body.appendChild(backdrop);

  const input = backdrop.querySelector('#ai-key-input');
  const status = backdrop.querySelector('#ai-key-status');
  const toggleBtn = backdrop.querySelector('#ai-key-toggle');

  toggleBtn.addEventListener('click', () => {
    input.type = input.type === 'password' ? 'text' : 'password';
    toggleBtn.textContent = input.type === 'password' ? 'Show' : 'Hide';
  });

  backdrop.querySelector('#ai-key-cancel').addEventListener('click', () => backdrop.remove());
  backdrop.addEventListener('click', e => { if (e.target === backdrop) backdrop.remove(); });

  backdrop.querySelector('#ai-key-test').addEventListener('click', async () => {
    const key = input.value.trim();
    if (!key) { status.innerHTML = '<span style="color:var(--wrong)">Please enter an API key.</span>'; return; }
    status.innerHTML = '<span style="color:var(--accent)">Testing...</span>';
    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: 'Reply with just the word OK' }] }] })
      });
      if (res.ok) {
        AIConfig.setKey(key);
        status.innerHTML = '<span style="color:var(--correct)">Key works! Saved.</span>';
        setTimeout(() => backdrop.remove(), 1000);
      } else {
        const err = await res.json().catch(() => ({}));
        status.innerHTML = `<span style="color:var(--wrong)">Error: ${err.error?.message || res.statusText}</span>`;
      }
    } catch (e) {
      status.innerHTML = `<span style="color:var(--wrong)">Network error. Check your connection.</span>`;
    }
  });
}

// ── Quiz Engine (Static) ──────────────────────────────
class QuizEngine {
  constructor(container, questions, topicId, onComplete) {
    this.container = container;
    this.topicId = topicId;
    this.onComplete = onComplete;
    this.originalQuestions = [...questions];
    this.questions = [];
    this.current = 0;
    this.score = 0;
    this.wrongOnes = [];
    this.isRetry = false;
  }

  start(questionsToUse = null) {
    const pool = questionsToUse || [...this.originalQuestions];
    // Shuffle
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    this.questions = pool.slice(0, 6);
    // Shuffle options within each question
    this.questions.forEach(q => {
      const correctAns = q.options[q.correct];
      const shuffled = [...q.options];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      q._shuffled = shuffled;
      q._correctIdx = shuffled.indexOf(correctAns);
    });
    this.current = 0;
    this.score = 0;
    this.wrongOnes = [];
    this._render();
  }

  _render() {
    if (this.current >= this.questions.length) {
      this._showScore();
      return;
    }
    const q = this.questions[this.current];
    const pct = ((this.current) / this.questions.length * 100).toFixed(0);
    this.container.innerHTML = `
      <div class="quiz-header">
        <span style="font-size:.82rem;color:var(--muted)">Question ${this.current + 1} of ${this.questions.length}</span>
        <span style="font-size:.82rem;color:var(--accent);font-weight:700">Score: ${this.score}</span>
      </div>
      <div class="quiz-progress-bar"><div class="quiz-progress-fill" style="width:${pct}%"></div></div>
      <div class="quiz-question">${q.question}</div>
      <div class="quiz-options">
        ${q._shuffled.map((opt, i) => `<button class="quiz-opt" data-idx="${i}">${opt}</button>`).join('')}
      </div>
      <div id="quiz-feedback"></div>`;

    this.container.querySelectorAll('.quiz-opt').forEach(btn => {
      btn.addEventListener('click', () => this._answer(parseInt(btn.dataset.idx)));
    });
  }

  _answer(idx) {
    const q = this.questions[this.current];
    const btns = this.container.querySelectorAll('.quiz-opt');
    btns.forEach(b => b.disabled = true);

    if (idx === q._correctIdx) {
      this.score++;
      btns[idx].classList.add('correct');
    } else {
      btns[idx].classList.add('wrong');
      btns[q._correctIdx].classList.add('correct');
      this.wrongOnes.push(q);
    }

    const fb = this.container.querySelector('#quiz-feedback');
    fb.innerHTML = `<div class="quiz-explanation">${q.explanation || ''}</div>
      <button class="btn btn-primary btn-sm" style="margin-top:.75rem" id="quiz-next">
        ${this.current + 1 < this.questions.length ? 'Next' : 'See Results'}
      </button>`;
    fb.querySelector('#quiz-next').addEventListener('click', () => {
      this.current++;
      this._render();
    });
  }

  _showScore() {
    const total = this.questions.length;
    const pct = Math.round((this.score / total) * 100);
    const prev = Progress.get(this.topicId);
    const prevPct = prev.quizTotal > 0 ? Math.round((prev.quizScore / prev.quizTotal) * 100) : 0;
    const isNewBest = pct > prevPct;

    Progress.recordQuiz(this.topicId, this.score, total);
    Streak.record();

    this.container.innerHTML = `
      <div class="quiz-score">
        <div class="score-num">${this.score}/${total}</div>
        <div style="font-size:1rem;margin:.5rem 0;color:${pct >= 80 ? 'var(--correct)' : pct >= 50 ? 'var(--warning)' : 'var(--wrong)'}">
          ${pct}%
        </div>
        ${isNewBest ? '<div style="color:var(--warning);font-weight:700;margin:.5rem 0">New Personal Best!</div>' : ''}
        ${prevPct > 0 && !isNewBest ? `<div style="color:var(--muted);font-size:.82rem">Previous best: ${prevPct}%</div>` : ''}
        <div style="margin-top:1.25rem;display:flex;gap:.5rem;justify-content:center;flex-wrap:wrap">
          <button class="btn btn-primary btn-sm" id="quiz-restart">Try Again</button>
          ${this.wrongOnes.length > 0 ? '<button class="btn btn-ghost btn-sm" id="quiz-retry-wrong">Retry Wrong</button>' : ''}
        </div>
      </div>`;

    this.container.querySelector('#quiz-restart').addEventListener('click', () => this.start());
    const retryBtn = this.container.querySelector('#quiz-retry-wrong');
    if (retryBtn) {
      retryBtn.addEventListener('click', () => {
        this.isRetry = true;
        this.start(this.wrongOnes);
      });
    }
    if (this.onComplete) this.onComplete(this.score, total);
  }
}

// ── LLM Quiz Engine (Gemini) ──────────────────────────
class LLMQuizEngine {
  constructor(container, topicId, topicName, aiPromptContext, fallbackQuestions, onComplete) {
    this.container = container;
    this.topicId = topicId;
    this.topicName = topicName;
    this.aiPromptContext = aiPromptContext;
    this.fallbackQuestions = fallbackQuestions;
    this.onComplete = onComplete;
    this.questions = [];
    this.current = 0;
    this.score = 0;
    this.wrongOnes = [];
    this.count = 6;
  }

  async start() {
    this.container.innerHTML = '<div style="text-align:center;padding:2rem;color:var(--muted)">Generating questions...</div>';

    const level = AIConfig.getLevel(this.topicId);
    const levelDescriptions = {
      'P3': 'Primary 3 — simple recall, basic understanding, small whole numbers',
      'P4': 'Primary 4 — apply concepts to familiar situations, moderate numbers',
      'P5': 'Primary 5 — analyse, explain processes, larger numbers and multi-step',
      'P6': 'Primary 6 — evaluate, compare, synthesise, challenging multi-step'
    };
    const levelDesc = levelDescriptions[level] || levelDescriptions['P4'];

    const prompt = `You are an experienced Singapore MOE primary school maths teacher specialising in the bar model method.
Generate exactly ${this.count} multiple-choice word problems about "${this.topicName}" for ${levelDesc} students.
Context: ${this.aiPromptContext}
Rules:
- Each question must be a realistic word problem solvable using the Singapore bar model method
- Each question has exactly 4 options with exactly 1 correct answer
- Vary the context (food, money, marbles, stickers, etc.)
- Include a clear 1-2 sentence explanation referencing the model method
- Use whole numbers only
- Align with Singapore primary maths curriculum
Respond with ONLY a JSON array — no markdown, no code fences:
[{"question":"...","options":["A","B","C","D"],"correct":0,"explanation":"..."}]`;

    try {
      const key = AIConfig.getKey();
      if (!key) throw new Error('No API key');

      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.75, maxOutputTokens: 2048, responseMimeType: 'application/json' }
        })
      });

      if (!res.ok) throw new Error(`API error: ${res.status}`);
      const data = await res.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      this.questions = JSON.parse(text);

      if (!Array.isArray(this.questions) || this.questions.length === 0) throw new Error('Invalid response');
    } catch (e) {
      console.warn('AI quiz failed, using fallback:', e.message);
      Toast.show('AI unavailable — using built-in questions', 'info');
      this.questions = [...this.fallbackQuestions];
      for (let i = this.questions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [this.questions[i], this.questions[j]] = [this.questions[j], this.questions[i]];
      }
      this.questions = this.questions.slice(0, this.count);
    }

    // Shuffle options
    this.questions.forEach(q => {
      const correctAns = q.options[q.correct];
      const shuffled = [...q.options];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      q._shuffled = shuffled;
      q._correctIdx = shuffled.indexOf(correctAns);
    });

    this.current = 0;
    this.score = 0;
    this.wrongOnes = [];
    this._render();
  }

  _render() {
    if (this.current >= this.questions.length) { this._showScore(); return; }
    const q = this.questions[this.current];
    const pct = ((this.current) / this.questions.length * 100).toFixed(0);
    const level = AIConfig.getLevel(this.topicId);

    this.container.innerHTML = `
      <div class="quiz-header">
        <span style="font-size:.82rem;color:var(--muted)">Question ${this.current + 1} of ${this.questions.length}</span>
        <span style="font-size:.75rem;padding:.2rem .6rem;border-radius:99px;background:rgba(56,189,248,.12);color:var(--accent);font-weight:700">AI · ${level}</span>
      </div>
      <div class="quiz-progress-bar"><div class="quiz-progress-fill" style="width:${pct}%"></div></div>
      <div class="quiz-question">${q.question}</div>
      <div class="quiz-options">
        ${q._shuffled.map((opt, i) => `<button class="quiz-opt" data-idx="${i}">${opt}</button>`).join('')}
      </div>
      <div id="quiz-feedback"></div>`;

    this.container.querySelectorAll('.quiz-opt').forEach(btn => {
      btn.addEventListener('click', () => this._answer(parseInt(btn.dataset.idx)));
    });
  }

  _answer(idx) {
    const q = this.questions[this.current];
    const btns = this.container.querySelectorAll('.quiz-opt');
    btns.forEach(b => b.disabled = true);

    if (idx === q._correctIdx) { this.score++; btns[idx].classList.add('correct'); }
    else { btns[idx].classList.add('wrong'); btns[q._correctIdx].classList.add('correct'); this.wrongOnes.push(q); }

    const fb = this.container.querySelector('#quiz-feedback');
    fb.innerHTML = `<div class="quiz-explanation">${q.explanation || ''}</div>
      <button class="btn btn-primary btn-sm" style="margin-top:.75rem" id="quiz-next">
        ${this.current + 1 < this.questions.length ? 'Next' : 'See Results'}</button>`;
    fb.querySelector('#quiz-next').addEventListener('click', () => { this.current++; this._render(); });
  }

  _showScore() {
    const total = this.questions.length;
    const pct = Math.round((this.score / total) * 100);
    Progress.recordQuiz(this.topicId, this.score, total);
    Streak.record();

    // Adaptive difficulty
    const level = AIConfig.getLevel(this.topicId);
    const levels = ['P3', 'P4', 'P5', 'P6'];
    const idx = levels.indexOf(level);
    if (pct >= 80 && idx < levels.length - 1) {
      AIConfig.setLevel(this.topicId, levels[idx + 1]);
      Toast.show(`Level up! Now at ${levels[idx + 1]}`, 'success');
    } else if (pct < 45 && idx > 0) {
      AIConfig.setLevel(this.topicId, levels[idx - 1]);
      Toast.show(`Adjusting to ${levels[idx - 1]} for more practice`, 'info');
    }

    this.container.innerHTML = `
      <div class="quiz-score">
        <div class="score-num">${this.score}/${total}</div>
        <div style="font-size:1rem;margin:.5rem 0;color:${pct >= 80 ? 'var(--correct)' : pct >= 50 ? 'var(--warning)' : 'var(--wrong)'}">${pct}%</div>
        <div style="margin-top:1.25rem;display:flex;gap:.5rem;justify-content:center;flex-wrap:wrap">
          <button class="btn btn-primary btn-sm" id="quiz-restart">New Questions</button>
          ${this.wrongOnes.length > 0 ? '<button class="btn btn-ghost btn-sm" id="quiz-retry-wrong">Retry Wrong</button>' : ''}
        </div>
      </div>`;

    this.container.querySelector('#quiz-restart').addEventListener('click', () => this.start());
    const retryBtn = this.container.querySelector('#quiz-retry-wrong');
    if (retryBtn) {
      retryBtn.addEventListener('click', () => {
        this.questions = this.wrongOnes;
        this.questions.forEach(q => {
          const correctAns = q.options[q.correct];
          const shuffled = [...q.options];
          for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
          }
          q._shuffled = shuffled;
          q._correctIdx = shuffled.indexOf(correctAns);
        });
        this.current = 0;
        this.score = 0;
        this.wrongOnes = [];
        this._render();
      });
    }
    if (this.onComplete) this.onComplete(this.score, total);
  }
}
