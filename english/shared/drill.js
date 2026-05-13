/* =========================================================
   /english/shared/drill.js
   Generic rapid-fire drill engine for topic Drill tabs.

   Reads `topic.drillItems` (array of {prompt, options, correct, explanation, ...})
   from the topic JSON. Renders into the Drill tab on each topic page.

   Features:
   - Sequential items, one at a time.
   - Click-to-answer with instant feedback (correct/wrong colour ring).
   - Running score in the header.
   - Optional 60-second timer mode (toggle).
   - End-of-drill summary with retry-wrong + retry-all buttons.
   - Records visit + drillUsed in Progress.

   Exposes window.EnglishDrill.mount(topicId, topicTitle, items).
   ========================================================= */

(function (global) {

  function shuffle(arr) {
    const out = arr.slice();
    for (let i = out.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
  }

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, c => (
      { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
    ));
  }

  function fmtTime(secs) {
    const m = Math.max(0, Math.floor(secs / 60));
    const s = Math.max(0, secs % 60);
    return `${m}:${String(s).padStart(2, '0')}`;
  }

  class Drill {
    constructor(opts) {
      this.topicId    = opts.topicId;
      this.topicTitle = opts.topicTitle || opts.topicId;
      this.items      = (opts.items || []).filter(it => it && it.prompt);
      this.container  = opts.container;
      this.timed      = false;
      this.timeLeft   = 60;
      this.timerId    = null;
      this.score      = 0;
      this.idx        = 0;
      this.answered   = false;
      this.wrong      = [];
      this.order      = shuffle(this.items.map((_, i) => i));
    }

    mount() {
      if (!this.items.length) {
        this.container.innerHTML = `
          <div style="text-align:center;padding:2.5rem 1rem;">
            <div style="font-size:2.5rem;margin-bottom:.75rem;">🎯</div>
            <h3 style="margin-bottom:.5rem;">Drills land in a later phase</h3>
            <p style="color:var(--muted);font-size:.88rem;line-height:1.55;max-width:36ch;margin:0 auto;">
              For now, use the <strong>Quiz tab</strong> (Static or AI) or the <strong>Idioms SRS</strong> for rapid-fire practice on this topic.
            </p>
          </div>
        `;
        return;
      }
      this.renderIntro();
    }

    renderIntro() {
      const n = this.items.length;
      this.container.innerHTML = `
        <div style="text-align:center;padding:1.5rem 1rem;">
          <div style="font-size:2rem;margin-bottom:.4rem;">🎯</div>
          <h3 style="margin-bottom:.3rem;">${esc(this.topicTitle)} drill</h3>
          <p style="color:var(--muted);font-size:.88rem;margin-bottom:1rem;line-height:1.55;">
            ${n} rapid-fire item${n === 1 ? '' : 's'}. Pick the right option for each prompt; instant feedback after every answer.
          </p>
          <div style="display:flex;gap:.5rem;justify-content:center;flex-wrap:wrap;margin-bottom:.75rem;">
            <label style="display:inline-flex;align-items:center;gap:.45rem;background:var(--surface);border:1px solid var(--border);border-radius:8px;padding:.45rem .85rem;font-size:.82rem;cursor:pointer;">
              <input type="checkbox" id="drill-timed-toggle" style="accent-color:var(--accent);">
              ⏱ Time me (60 sec)
            </label>
          </div>
          <button class="btn btn-primary" id="drill-start-btn">▶ Start drill</button>
        </div>
      `;
      this.container.querySelector('#drill-start-btn').addEventListener('click', () => {
        this.timed = this.container.querySelector('#drill-timed-toggle').checked;
        this.start();
      });
    }

    start() {
      this.score = 0; this.idx = 0; this.wrong = [];
      this.order = shuffle(this.items.map((_, i) => i));
      if (this.timed) {
        this.timeLeft = 60;
        this.timerId = setInterval(() => {
          this.timeLeft -= 1;
          this.renderTimer();
          if (this.timeLeft <= 0) {
            clearInterval(this.timerId); this.timerId = null;
            this.finish();
          }
        }, 1000);
      }
      this.renderItem();
    }

    renderTimer() {
      const tEl = this.container.querySelector('#drill-time');
      if (tEl) tEl.textContent = fmtTime(this.timeLeft);
    }

    currentItem() {
      const realIdx = this.order[this.idx];
      return this.items[realIdx];
    }

    renderItem() {
      if (this.idx >= this.order.length) { this.finish(); return; }
      const it = this.currentItem();
      this.answered = false;
      const total = this.order.length;
      this.container.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:.85rem;font-size:.78rem;color:var(--muted);">
          <span>Item ${this.idx + 1} of ${total}</span>
          <span>
            <strong style="color:var(--grammar);">Score: ${this.score}</strong>
            ${this.timed ? `· ⏱ <span id="drill-time" style="color:var(--accent);font-family:var(--font-mono);">${fmtTime(this.timeLeft)}</span>` : ''}
          </span>
        </div>
        <div style="background:var(--surface);border-left:3px solid var(--accent);padding:.85rem 1.05rem;border-radius:8px;margin-bottom:1rem;">
          <p style="font-size:.95rem;font-weight:600;line-height:1.55;color:var(--text);margin:0;">${esc(it.prompt)}</p>
          ${it.hint ? `<p style="font-size:.78rem;color:var(--muted);margin-top:.45rem;font-style:italic;">${esc(it.hint)}</p>` : ''}
        </div>
        <div class="drill-options" style="display:flex;flex-direction:column;gap:.45rem;">
          ${(it.options || []).map((opt, i) => `
            <button class="quiz-option drill-opt" data-index="${i}" style="width:100%;text-align:left;">${esc(opt)}</button>
          `).join('')}
        </div>
        <div id="drill-feedback" class="feedback-box" style="margin-top:.75rem;"></div>
      `;
      this.container.querySelectorAll('.drill-opt').forEach(btn => {
        btn.addEventListener('click', () => this.answer(parseInt(btn.dataset.index, 10)));
      });
    }

    answer(idx) {
      if (this.answered) return;
      this.answered = true;
      const it = this.currentItem();
      const opts = this.container.querySelectorAll('.drill-opt');
      const fb   = this.container.querySelector('#drill-feedback');
      opts.forEach(b => b.disabled = true);
      const correct = (idx === it.correct);
      if (correct) {
        this.score++;
        opts[idx].classList.add('correct');
        fb.className = 'feedback-box show feedback-correct';
        fb.innerHTML = `✅ <strong>Correct.</strong> ${esc(it.explanation || '')}`;
      } else {
        this.wrong.push(it);
        opts[idx].classList.add('wrong');
        if (opts[it.correct]) opts[it.correct].classList.add('correct');
        fb.className = 'feedback-box show feedback-wrong';
        fb.innerHTML = `❌ <strong>Not quite.</strong> ${esc(it.explanation || '')}`;
      }
      const next = document.createElement('button');
      next.className = 'btn btn-primary';
      next.style.cssText = 'margin-top:.85rem;width:100%';
      next.textContent = this.idx + 1 < this.order.length ? 'Next →' : 'See result →';
      next.addEventListener('click', () => { this.idx++; this.renderItem(); });
      fb.after(next);
    }

    finish() {
      if (this.timerId) { clearInterval(this.timerId); this.timerId = null; }
      const total = Math.min(this.idx + (this.answered ? 1 : 0), this.order.length);
      const attempted = total;
      const pct = attempted ? Math.round((this.score / attempted) * 100) : 0;
      let msg, colour;
      if (pct === 100) { msg = '🏆 Perfect run.'; colour = 'var(--grammar)'; }
      else if (pct >= 70) { msg = '🎉 Strong. Retry the missed items to lock them in.'; colour = 'var(--comprehension)'; }
      else { msg = '📚 Open the Learn tab, then come back for another pass.'; colour = 'var(--composition)'; }

      // Record drill use
      if (typeof Progress !== 'undefined' && Progress.recordDrillUsed) Progress.recordDrillUsed(this.topicId);
      if (typeof Streak !== 'undefined' && Streak.record) Streak.record();
      if (global.EnglishStreak && typeof global.EnglishStreak.record === 'function') { try { global.EnglishStreak.record(); } catch {} }

      const hasWrong = this.wrong.length > 0;
      this.container.innerHTML = `
        <div style="text-align:center;padding:1.75rem 1rem;">
          <div style="font-size:2.6rem;margin-bottom:.5rem;">${pct === 100 ? '🏆' : pct >= 70 ? '⭐' : '📖'}</div>
          <h3 style="margin-bottom:.35rem;">${this.score} / ${attempted} · ${pct}%</h3>
          ${this.timed && this.timeLeft <= 0 ? '<p style="color:#fbbf24;font-size:.82rem;margin-bottom:.5rem;">⏱ Time up at this item.</p>' : ''}
          <div class="progress-bar-wrap" style="max-width:260px;margin:.5rem auto .85rem;">
            <div class="progress-bar-fill" style="width:${pct}%;background:${colour}"></div>
          </div>
          <p style="margin-bottom:1.25rem;">${msg}</p>
          <div style="display:flex;gap:.55rem;justify-content:center;flex-wrap:wrap;">
            <button class="btn btn-primary" id="drill-retry-all">↺ Retry all</button>
            ${hasWrong ? `<button class="btn btn-primary" id="drill-retry-wrong">🎯 Retry ${this.wrong.length} missed</button>` : ''}
            <button class="btn btn-ghost" id="drill-back">← Back</button>
          </div>
        </div>
      `;
      this.container.querySelector('#drill-retry-all').addEventListener('click', () => this.renderIntro());
      this.container.querySelector('#drill-back').addEventListener('click', () => this.renderIntro());
      const rw = this.container.querySelector('#drill-retry-wrong');
      if (rw) {
        rw.addEventListener('click', () => {
          // Build a fresh drill from the wrong items
          this.items = this.wrong.slice();
          this.order = shuffle(this.items.map((_, i) => i));
          this.wrong = [];
          this.idx = 0;
          this.score = 0;
          this.timed = false;
          if (this.timerId) { clearInterval(this.timerId); this.timerId = null; }
          this.renderItem();
        });
      }
    }
  }

  function mount(topicId, topicTitle, items) {
    const container = document.getElementById('drill-container');
    if (!container) return;
    const d = new Drill({ topicId, topicTitle, items, container });
    d.mount();
  }

  global.EnglishDrill = { mount };
})(typeof window !== 'undefined' ? window : globalThis);
