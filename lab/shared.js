/* =========================================================
   Singapore Primary Science Lab — Shared Utilities
   Progress tracking · Tabs · Glossary · Toast · Cornell
   ========================================================= */

// ── Progress (localStorage) ────────────────────────────────
const Progress = {
  KEY: 'sciLab_progress',

  all() {
    try { return JSON.parse(localStorage.getItem(this.KEY)) || {}; }
    catch { return {}; }
  },

  get(topicId) {
    return this.all()[topicId] || { quizScore: 0, quizTotal: 0, simUsed: false, mindMapSaved: false, visitCount: 0 };
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
    // Keep the best score
    if (score >= (p.quizScore || 0)) {
      this.set(topicId, { quizScore: score, quizTotal: total });
    }
  }
};

// ── Tabs ──────────────────────────────────────────────────
// NOTE: .tab-pane elements are siblings of .tabs-root, NOT children,
// so we must query the document (not the container) to find them.
function initTabs(containerSelector) {
  const container = document.querySelector(containerSelector || '.tabs-root');
  if (!container) return;
  const btns = container.querySelectorAll('.tab-btn');

  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Deactivate every button in this bar
      btns.forEach(b => b.classList.remove('active'));
      // Hide every .tab-pane anywhere on the page
      document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
      // Activate clicked button and show its pane
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
  // poolSize: how many questions to pick (0 = all). Questions & options are
  // always shuffled so every attempt is a fresh draw.
  constructor(questions, topicId, containerId, poolSize = 0) {
    // Shuffle questions
    const shuffled = [...questions].sort(() => Math.random() - 0.5);
    const pool = poolSize > 0 ? shuffled.slice(0, Math.min(poolSize, shuffled.length)) : shuffled;

    // Shuffle options within each question, keeping correct pointer valid
    this.questions = pool.map(q => {
      const indices = q.options.map((_, i) => i).sort(() => Math.random() - 0.5);
      return {
        ...q,
        options: indices.map(i => q.options[i]),
        correct: indices.indexOf(q.correct)
      };
    });

    this.topicId   = topicId;
    this.container = document.getElementById(containerId);
    this.current   = 0;
    this.score     = 0;
    this.answered  = false;
    this.render();
  }

  render() {
    if (this.current >= this.questions.length) {
      this.showResult();
      return;
    }
    const q = this.questions[this.current];
    this.answered = false;
    this.container.innerHTML = `
      <div style="margin-bottom:.5rem">
        <span style="font-size:.75rem;color:var(--muted)">Question ${this.current + 1} of ${this.questions.length}</span>
      </div>
      <p style="font-size:.95rem;color:var(--text);margin-bottom:1rem;font-weight:600">${q.question}</p>
      <div class="quiz-options" style="display:flex;flex-direction:column;gap:.5rem">
        ${q.options.map((opt, i) => `
          <button class="quiz-option" data-index="${i}">${opt}</button>
        `).join('')}
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
      opts[index].classList.add('wrong');
      opts[q.correct].classList.add('correct');
      fb.className = 'feedback-box show feedback-wrong';
      fb.innerHTML = `❌ <strong>Not quite.</strong> ${q.explanation}`;
    }

    setTimeout(() => {
      this.current++;
      this.render();
    }, 3200);
  }

  showResult() {
    const pct = Math.round((this.score / this.questions.length) * 100);
    Progress.recordQuiz(this.topicId, this.score, this.questions.length);

    let msg, colour;
    if (pct === 100) { msg = '🏆 Perfect! You have mastered this topic!'; colour = 'var(--diversity)'; }
    else if (pct >= 70) { msg = '🎉 Great work! Review the questions you missed.'; colour = 'var(--energy)'; }
    else { msg = '📚 Keep practising! Review the simulations and notes.'; colour = 'var(--interactions)'; }

    this.container.innerHTML = `
      <div style="text-align:center;padding:2rem 1rem">
        <div style="font-size:3rem;margin-bottom:.75rem">${pct === 100 ? '🏆' : pct >= 70 ? '⭐' : '📖'}</div>
        <h3 style="margin-bottom:.5rem">${this.score} / ${this.questions.length} correct</h3>
        <div class="progress-bar-wrap" style="max-width:260px;margin:.75rem auto 1rem">
          <div class="progress-bar-fill" style="width:${pct}%;background:${colour}"></div>
        </div>
        <p style="margin-bottom:1.5rem">${msg}</p>
        <button class="btn btn-primary" onclick="location.reload()">Try Again</button>
      </div>
    `;
  }
}

// ── Mind Map (vis-network wrapper) ─────────────────────────
class ScienceMindMap {
  constructor(containerId, topicId, template) {
    this.containerId = containerId;
    this.topicId     = topicId;
    this.template    = template;  // { nodes: [], edges: [], required: [] }
    this.nodes = new vis.DataSet(template.nodes.map(n => ({ ...n })));
    this.edges = new vis.DataSet(template.edges.map(e => ({ ...e })));
    this.network = null;
    this.nodeIdCounter = 1000;
    this.init();
  }

  init() {
    const container = document.getElementById(this.containerId);
    const options = {
      nodes: {
        shape: 'box', borderWidth: 2,
        color: { background: '#1e293b', border: '#38bdf8', highlight: { background: '#1a3a5a', border: '#7dd3fc' } },
        font: { color: '#e2e8f0', size: 14, face: 'Inter, system-ui' },
        margin: 8, widthConstraint: { minimum: 80, maximum: 180 }
      },
      edges: {
        color: { color: '#475569', highlight: '#38bdf8' },
        width: 1.5, smooth: { type: 'cubicBezier', roundness: 0.4 },
        arrows: { to: { enabled: true, scaleFactor: 0.5 } }
      },
      // Physics on only for the initial auto-layout; disabled once stable
      // so nodes stay exactly where the student places them.
      physics: {
        enabled: true,
        solver: 'forceAtlas2Based',
        forceAtlas2Based: { gravitationalConstant: -60, springLength: 130, springConstant: 0.06 },
        stabilization: { iterations: 150, fit: true }
      },
      interaction: {
        hover: true,
        tooltipDelay: 200,
        navigationButtons: true,   // zoom/pan buttons
        keyboard: false,
        dragNodes: true,           // free drag at all times
        dragView: true,
        zoomView: true
      },
      manipulation: { enabled: false }
    };
    this.network = new vis.Network(container, { nodes: this.nodes, edges: this.edges }, options);

    // After the initial spring-layout settles, turn physics OFF so nodes
    // stay wherever the student drags them.
    this.network.once('stabilizationIterationsDone', () => {
      this.network.setOptions({ physics: { enabled: false } });
      this.network.fit();
      this._updatePhysicsBtn(false);
    });

    // Double-click a node to rename it
    this.network.on('doubleClick', params => {
      if (params.nodes.length) {
        const id  = params.nodes[0];
        const cur = this.nodes.get(id).label;
        const lbl = prompt('Edit node label:', cur);
        if (lbl !== null && lbl.trim()) this.nodes.update({ id, label: lbl.trim() });
      } else if (params.edges.length === 0) {
        // Double-click empty space → quick-add node
        const lbl = prompt('New node label:');
        if (lbl && lbl.trim()) {
          const id = ++this.nodeIdCounter;
          this.nodes.add({ id, label: lbl.trim(),
            x: params.pointer.canvas.x, y: params.pointer.canvas.y,
            color: { background: '#1e3a2a', border: '#10b981' } });
        }
      }
    });
  }

  // Toggle physics on/off (called by the Re-layout button)
  togglePhysics() {
    const on = !this.network.physics.physicsEnabled;
    this.network.setOptions({ physics: { enabled: on } });
    if (!on) this.network.fit();
    this._updatePhysicsBtn(on);
    showToast(on ? '🌀 Auto-layout ON — drag to pin nodes, then click again to stop.' : '📌 Physics OFF — drag nodes freely.');
  }

  _updatePhysicsBtn(on) {
    const btn = document.getElementById('mm-physics-btn');
    if (btn) btn.textContent = on ? '⏹ Stop Auto-layout' : '🌀 Re-layout';
  }

  addNode(label) {
    const id = ++this.nodeIdCounter;
    this.nodes.add({ id, label: label || 'New Idea', color: { background: '#1e3a2a', border: '#10b981' } });
    return id;
  }

  addEdge() {
    // Enable vis built-in edge adding mode
    this.network.addEdgeMode();
    showToast('Click a node, then drag to another to connect them. Press Esc to cancel.');
  }

  deleteSelected() {
    const sel = this.network.getSelectedNodes();
    const edgeSel = this.network.getSelectedEdges();
    if (sel.length) this.nodes.remove(sel);
    if (edgeSel.length) this.edges.remove(edgeSel);
  }

  save() {
    const data = { nodes: this.nodes.get(), edges: this.edges.get() };
    localStorage.setItem(`sciLab_mindmap_${this.topicId}`, JSON.stringify(data));
    Progress.recordMindMap(this.topicId);
    return data;
  }

  load() {
    try {
      const saved = JSON.parse(localStorage.getItem(`sciLab_mindmap_${this.topicId}`));
      if (saved) {
        this.nodes.clear(); this.edges.clear();
        this.nodes.add(saved.nodes);
        this.edges.add(saved.edges);
        showToast('Mind map loaded!');
      }
    } catch { showToast('No saved mind map found.'); }
  }

  check() {
    const required  = this.template.required || [];
    const allLabels = this.nodes.get().map(n => n.label.toLowerCase());
    const missing   = required.filter(r => !allLabels.some(l => l.includes(r.toLowerCase())));
    const found     = required.filter(r =>  allLabels.some(l => l.includes(r.toLowerCase())));

    let fb = `<strong>Mind Map Check</strong><br><br>`;
    fb += `✅ Found (${found.length}/${required.length}): ${found.join(', ') || 'none'}<br>`;
    if (missing.length) fb += `💡 Consider adding: <em>${missing.join(', ')}</em>`;
    else fb += `🏆 Excellent! Your map includes all the key ideas.`;

    const box = document.getElementById('mindmap-feedback');
    if (box) { box.innerHTML = fb; box.style.display = 'block'; }
    return missing;
  }

  reset() {
    this.nodes.clear(); this.edges.clear();
    this.nodes.add(this.template.nodes.map(n => ({ ...n })));
    this.edges.add(this.template.edges.map(e => ({ ...e })));
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
});
