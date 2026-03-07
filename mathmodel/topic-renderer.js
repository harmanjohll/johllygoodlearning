/* =========================================================
   Math Model — Topic Page Renderer
   Reads TOPIC global and renders the full topic page
   including Learn, Build, Practice tabs.
   ========================================================= */

(function () {
  if (typeof TOPIC === 'undefined') return;

  const T = TOPIC;
  const chapterColors = {
    'whole-numbers': '#38bdf8',
    'fractions': '#8b5cf6',
    'decimals': '#f97316',
    'ratio': '#10b981',
    'percentage': '#f59e0b'
  };
  const themeColor = chapterColors[T.chapter] || '#38bdf8';

  // Record visit
  Progress.recordVisit(T.id);
  Streak.record();

  // ── Build page HTML ────────────────────────────────
  document.title = `${T.title} | Math Model`;

  const mastery = Progress.masteryPct(T.id);
  const pathPrefix = getPathPrefix();

  document.body.innerHTML = `
    <div class="page-header" style="background:var(--surface);border-bottom:1px solid var(--border);padding:.9rem 1.5rem;display:flex;align-items:center;gap:1rem;flex-wrap:wrap">
      <div style="width:4px;height:36px;border-radius:3px;background:${themeColor};flex-shrink:0"></div>
      <div style="flex:1">
        <h1 style="font-size:1.2rem">${T.title}</h1>
        <div style="font-size:.78rem;color:var(--muted)">
          <span class="badge badge-${T.chapter}">${T.chapterName}</span>&nbsp;
          Mastery: <strong style="color:${themeColor}" id="mastery-pct">${mastery}%</strong>
        </div>
      </div>
      <a href="${pathPrefix}index.html" class="btn btn-ghost" style="font-size:.82rem;text-decoration:none">← All Topics</a>
    </div>

    <main style="max-width:1100px;margin:0 auto;padding:1.5rem 1.25rem 3rem">
      <div class="tabs tabs-root">
        <button class="tab-btn active" data-tab="tab-learn">Learn</button>
        <button class="tab-btn" data-tab="tab-build">Build</button>
        <button class="tab-btn" data-tab="tab-practice">Practice</button>
      </div>

      <div class="tab-pane active" id="tab-learn">
        ${renderLearnTab()}
      </div>

      <div class="tab-pane" id="tab-build">
        ${renderBuildTab()}
      </div>

      <div class="tab-pane" id="tab-practice">
        ${renderPracticeTab()}
      </div>
    </main>
  `;

  // ── Initialize components ──────────────────────────
  initTabs();
  initGlossary();

  // Render worked example models
  if (T.workedExamples) {
    T.workedExamples.forEach((ex, i) => {
      if (ex.model) {
        setTimeout(() => {
          renderStaticModel(`worked-model-${i}`, ex.model, {
            width: 620,
            height: ex.model.height || 200,
            beforeAfter: ex.model.beforeAfter || false
          });
        }, 50);
      }
    });
  }

  // Initialize Build tab
  setTimeout(() => initBuildTab(), 100);

  // Initialize Practice tab
  setTimeout(() => initPracticeTab(), 100);

  // ── Render Functions ───────────────────────────────
  function getPathPrefix() {
    // Calculate relative path to mathmodel root
    const depth = T._depth || 3; // topics/whole-numbers/comparison = 3 levels
    return '../'.repeat(depth);
  }

  function renderLearnTab() {
    const keyQuestions = (T.keyQuestions || [])
      .map(q => `<div class="cue-question">${q}</div>`).join('');

    const glossary = (T.glossary || [])
      .map(g => `<div class="glossary-term"><div class="term-name">${g.term}</div><div class="term-def">${g.def}</div></div>`).join('');

    const notes = (T.notes || []).map(n => {
      let html = `<div class="note-section"><h4>${n.heading}</h4>${n.content}`;
      if (n.highlights) {
        n.highlights.forEach(h => { html += `<div class="highlight">${h}</div>`; });
      }
      if (n.equations) {
        n.equations.forEach(eq => { html += `<div class="equation">${eq}</div>`; });
      }
      html += '</div>';
      return html;
    }).join('');

    const examples = (T.workedExamples || []).map((ex, i) => `
      <div class="worked-example">
        <div class="worked-example-label">Worked Example ${i + 1}</div>
        <div class="problem">${ex.problem}</div>
        <div id="worked-model-${i}" style="margin:.6rem 0"></div>
        <div class="steps">
          <ol>${ex.steps.map(s => `<li>${s}</li>`).join('')}</ol>
        </div>
        <div class="answer">Answer: ${ex.answer}</div>
      </div>
    `).join('');

    const summary = T.summary || '';

    return `
      <div class="cornell-wrapper">
        <div class="cornell-cue">
          <div class="cornell-cue-label">Key Questions</div>
          ${keyQuestions}
          ${glossary ? `<div class="cornell-cue-label" style="margin-top:1.25rem">Glossary</div>${glossary}` : ''}
        </div>
        <div class="cornell-main">
          ${notes}
          ${examples ? `<div class="note-section"><h4>Worked Examples</h4>${examples}</div>` : ''}
        </div>
        <div class="cornell-summary">
          <div class="cornell-summary-label">Summary</div>
          <div style="font-size:.85rem;color:var(--muted);line-height:1.6">${summary}</div>
        </div>
      </div>
    `;
  }

  function renderBuildTab() {
    return `
      <div class="sub-tabs">
        <button class="sub-tab active" data-pane="build-guided">Guided</button>
        <button class="sub-tab" data-pane="build-free">Free Build</button>
      </div>

      <div class="sub-pane active" id="build-guided">
        <p style="font-size:.85rem;color:var(--muted);margin-bottom:.75rem">
          Follow the step-by-step instructions to build the bar model for this problem:
        </p>
        ${T.guidedBuild ? `<div class="worked-example" style="margin-bottom:1rem"><div class="problem">${T.guidedBuild.problem}</div></div>` : ''}
        <div id="guided-builder"></div>
      </div>

      <div class="sub-pane" id="build-free">
        <p style="font-size:.85rem;color:var(--muted);margin-bottom:.75rem">
          Build your own bar model. Use the toolbar to add bars, brackets, and labels.
        </p>
        <div id="free-builder"></div>
      </div>
    `;
  }

  function renderPracticeTab() {
    return `
      <div class="quiz-toggle">
        <button class="btn btn-sm active" id="quiz-mode-static">Standard Quiz</button>
        <button class="btn btn-sm btn-ghost" id="quiz-mode-ai">AI Quiz</button>
        <button class="btn btn-sm btn-ghost" id="quiz-ai-setup" style="margin-left:auto">API Key</button>
      </div>
      <div id="quiz-container" class="quiz-container">
        <div style="text-align:center;padding:1.5rem">
          <button class="btn btn-primary" id="quiz-start">Start Quiz</button>
        </div>
      </div>
    `;
  }

  // ── Build Tab Init ─────────────────────────────────
  function initBuildTab() {
    // Guided builder
    if (T.guidedBuild && T.guidedBuild.steps) {
      const gb = new ModelBuilder('guided-builder', {
        mode: 'guided',
        width: Math.min(740, window.innerWidth - 60),
        height: T.guidedBuild.height || 300,
        beforeAfter: T.guidedBuild.beforeAfter || false,
        showToolbar: false,
        onGuidedComplete: () => {
          Progress.recordGuidedComplete(T.id);
          Toast.show('Guided build complete!', 'success');
          updateMastery();
        }
      });
      gb.startGuided(T.guidedBuild.steps);
    }

    // Free builder
    new ModelBuilder('free-builder', {
      mode: 'free',
      width: Math.min(740, window.innerWidth - 60),
      height: 360,
      beforeAfter: T.freeBuilder?.beforeAfter || false,
      onModelChange: (model) => {
        if (model.bars.length >= 2) {
          Progress.recordBuildComplete(T.id);
          updateMastery();
        }
      }
    });

    // Init sub-tabs
    initSubTabs(document.getElementById('tab-build'));
  }

  // ── Practice Tab Init ──────────────────────────────
  function initPracticeTab() {
    const container = document.getElementById('quiz-container');
    const staticBtn = document.getElementById('quiz-mode-static');
    const aiBtn = document.getElementById('quiz-mode-ai');
    const setupBtn = document.getElementById('quiz-ai-setup');
    let quizMode = 'static';

    staticBtn.addEventListener('click', () => {
      quizMode = 'static';
      staticBtn.classList.add('active');
      staticBtn.classList.remove('btn-ghost');
      aiBtn.classList.remove('active');
      aiBtn.classList.add('btn-ghost');
      resetQuiz();
    });

    aiBtn.addEventListener('click', () => {
      if (!AIConfig.hasKey()) { showAISetup(); return; }
      quizMode = 'ai';
      aiBtn.classList.add('active');
      aiBtn.classList.remove('btn-ghost');
      staticBtn.classList.remove('active');
      staticBtn.classList.add('btn-ghost');
      resetQuiz();
    });

    setupBtn.addEventListener('click', () => showAISetup());

    function resetQuiz() {
      container.innerHTML = `<div style="text-align:center;padding:1.5rem">
        <button class="btn btn-primary" id="quiz-start">Start Quiz</button></div>`;
      container.querySelector('#quiz-start').addEventListener('click', startQuiz);
    }

    function startQuiz() {
      if (quizMode === 'ai' && AIConfig.hasKey()) {
        const llm = new LLMQuizEngine(
          container, T.id, T.title,
          T.aiPromptContext || '',
          T.staticQuestions || [],
          (score, total) => { updateMastery(); }
        );
        llm.start();
      } else {
        if (!T.staticQuestions || T.staticQuestions.length === 0) {
          container.innerHTML = '<p style="color:var(--muted);padding:1rem">No questions available yet. Try AI Quiz mode.</p>';
          return;
        }
        const qe = new QuizEngine(container, T.staticQuestions, T.id, (score, total) => { updateMastery(); });
        qe.start();
      }
    }

    container.querySelector('#quiz-start').addEventListener('click', startQuiz);
  }

  function updateMastery() {
    const pct = Progress.masteryPct(T.id);
    const el = document.getElementById('mastery-pct');
    if (el) el.textContent = pct + '%';
  }
})();
