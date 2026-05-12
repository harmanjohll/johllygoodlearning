/* =========================================================
   /malay/shared/malay-topic.js
   Generic topic-page renderer. Each /malay/topics/<id>/index.html
   is a thin shell that sets window.MALAY_TOPIC_ID and loads
   this script. The renderer pulls topic data from
   shared/content/tatabahasa.json (via MalayContent), then:

   - Fills in the header (title, theme + level badges, mastery)
   - Renders the Pelajaran tab (key questions, glossary, learn,
     summary, PSLE tips)
   - Mounts the Latih widget (MalayLatih.mount)
   - Wires the Kuiz container for initAIQuizToggle
   - Instantiates MalayMindMap on the Peta Minda tab

   Calls Progress.recordVisit on first load.
   ========================================================= */

(function (global) {
  // Map of topic-id → light mind-map seed. Each seed has 1 root +
  // 4-6 child concepts. The student extends from there.
  const MIND_MAP_TEMPLATES = {
    'imbuhan': {
      nodes: [
        { id: 'r', label: 'Imbuhan', color: { border: '#34d399' } },
        { id: 'meN', label: 'meN- (aktif)' },
        { id: 'beR', label: 'beR- (tak transitif)' },
        { id: 'peN', label: 'peN- (pelaku/alat)' },
        { id: 'di',  label: 'di- (pasif)' },
        { id: 'ter', label: 'ter- (tidak sengaja)' },
        { id: 'kean', label: 'ke-…-an (mujarad)' },
      ],
      edges: [
        { from: 'r', to: 'meN' }, { from: 'r', to: 'beR' }, { from: 'r', to: 'peN' },
        { from: 'r', to: 'di' },  { from: 'r', to: 'ter' }, { from: 'r', to: 'kean' },
      ],
      required: ['meN', 'beR', 'di', 'ter', 'ke-…-an'],
    },
    'kata-nama': {
      nodes: [
        { id: 'r', label: 'Kata Nama', color: { border: '#34d399' } },
        { id: 'am', label: 'Am' },
        { id: 'khas', label: 'Khas' },
        { id: 'muj', label: 'Mujarad' },
        { id: 'gp', label: 'Ganda Penuh' },
        { id: 'gb', label: 'Ganda Berentak' },
      ],
      edges: [
        { from: 'r', to: 'am' }, { from: 'r', to: 'khas' }, { from: 'r', to: 'muj' },
        { from: 'r', to: 'gp' }, { from: 'r', to: 'gb' },
      ],
      required: ['Am', 'Khas', 'Mujarad', 'Ganda'],
    },
    'kata-kerja': {
      nodes: [
        { id: 'r', label: 'Kata Kerja', color: { border: '#34d399' } },
        { id: 'tr', label: 'Transitif' },
        { id: 'tt', label: 'Tak Transitif' },
        { id: 'sd', label: 'sedang' },
        { id: 'tl', label: 'telah / sudah' },
        { id: 'ak', label: 'akan' },
        { id: 'be', label: 'belum' },
      ],
      edges: [
        { from: 'r', to: 'tr' }, { from: 'r', to: 'tt' }, { from: 'r', to: 'sd' },
        { from: 'r', to: 'tl' }, { from: 'r', to: 'ak' }, { from: 'r', to: 'be' },
      ],
      required: ['Transitif', 'Tak Transitif', 'sedang', 'telah'],
    },
    'kata-adjektif': {
      nodes: [
        { id: 'r', label: 'Kata Adjektif', color: { border: '#34d399' } },
        { id: 'bi', label: 'Biasa' },
        { id: 'ba', label: 'Bandingan (lebih … daripada)' },
        { id: 'pe', label: 'Penghabisan (paling / ter-)' },
        { id: 'pn', label: 'Penegas (sangat, amat)' },
        { id: 'pl', label: 'Pelemah (agak, kurang)' },
      ],
      edges: [
        { from: 'r', to: 'bi' }, { from: 'r', to: 'ba' }, { from: 'r', to: 'pe' },
        { from: 'r', to: 'pn' }, { from: 'r', to: 'pl' },
      ],
      required: ['Bandingan', 'Penghabisan', 'Penegas'],
    },
    'kata-hubung': {
      nodes: [
        { id: 'r', label: 'Kata Hubung', color: { border: '#34d399' } },
        { id: 'g', label: 'Gabungan (dan, serta)' },
        { id: 'p', label: 'Pertentangan (tetapi, namun)' },
        { id: 's', label: 'Sebab (kerana, oleh itu)' },
        { id: 'y', label: 'Syarat (jika, sekiranya)' },
        { id: 't', label: 'Tujuan (supaya, agar)' },
        { id: 'u', label: 'Urutan (apabila, selepas)' },
      ],
      edges: [
        { from: 'r', to: 'g' }, { from: 'r', to: 'p' }, { from: 'r', to: 's' },
        { from: 'r', to: 'y' }, { from: 'r', to: 't' }, { from: 'r', to: 'u' },
      ],
      required: ['Gabungan', 'Pertentangan', 'Sebab', 'Syarat', 'Tujuan', 'Urutan'],
    },
    'kata-sendi': {
      nodes: [
        { id: 'r', label: 'Kata Sendi Nama', color: { border: '#34d399' } },
        { id: 'di', label: 'di (tempat, jarak)' },
        { id: 'ke', label: 'ke / kepada' },
        { id: 'da', label: 'dari / daripada' },
        { id: 'pa', label: 'pada (masa)' },
        { id: 'ol', label: 'oleh (pasif)' },
        { id: 'de', label: 'dengan (alat/cara)' },
      ],
      edges: [
        { from: 'r', to: 'di' }, { from: 'r', to: 'ke' }, { from: 'r', to: 'da' },
        { from: 'r', to: 'pa' }, { from: 'r', to: 'ol' }, { from: 'r', to: 'de' },
      ],
      required: ['di', 'kepada', 'daripada', 'pada', 'oleh'],
    },
    'kata-ganti-nama': {
      nodes: [
        { id: 'r', label: 'Kata Ganti Nama', color: { border: '#34d399' } },
        { id: 'd1', label: 'Diri Pertama (saya, kami, kita)' },
        { id: 'd2', label: 'Diri Kedua (anda, kamu)' },
        { id: 'd3', label: 'Diri Ketiga (dia, beliau, mereka)' },
        { id: 'tu', label: 'Tunjuk (ini, itu)' },
        { id: 'ta', label: 'Tanya (apa, siapa, mengapa)' },
      ],
      edges: [
        { from: 'r', to: 'd1' }, { from: 'r', to: 'd2' }, { from: 'r', to: 'd3' },
        { from: 'r', to: 'tu' }, { from: 'r', to: 'ta' },
      ],
      required: ['saya', 'anda', 'beliau', 'kami', 'kita'],
    },
    'penjodoh-bilangan': {
      nodes: [
        { id: 'r', label: 'Penjodoh Bilangan', color: { border: '#34d399' } },
        { id: 'or', label: 'seorang (manusia)' },
        { id: 'ek', label: 'seekor (haiwan)' },
        { id: 'bh', label: 'sebuah (objek besar)' },
        { id: 'he', label: 'sehelai (kain/nipis)' },
        { id: 'bt', label: 'sebatang (panjang/kurus)' },
        { id: 'bi', label: 'sebiji (bulat/kecil)' },
        { id: 'ps', label: 'sepasang (pasangan)' },
      ],
      edges: [
        { from: 'r', to: 'or' }, { from: 'r', to: 'ek' }, { from: 'r', to: 'bh' },
        { from: 'r', to: 'he' }, { from: 'r', to: 'bt' }, { from: 'r', to: 'bi' },
        { from: 'r', to: 'ps' },
      ],
      required: ['seorang', 'seekor', 'sebuah', 'sehelai'],
    },
  };

  // ── Helpers ────────────────────────────────────────────
  function topicId() { return global.MALAY_TOPIC_ID || null; }

  function ringSvg(pct, color) {
    const r = 14, circ = 2 * Math.PI * r;
    const dash = (pct / 100) * circ;
    return `
      <svg width="40" height="40" viewBox="0 0 40 40">
        <circle cx="20" cy="20" r="${r}" fill="none" stroke="var(--border)" stroke-width="3"/>
        <circle cx="20" cy="20" r="${r}" fill="none" stroke="${color}" stroke-width="3"
                stroke-dasharray="${dash.toFixed(1)} ${circ.toFixed(1)}"
                stroke-linecap="round"
                transform="rotate(-90 20 20)"/>
        <text x="20" y="24" text-anchor="middle" fill="${color}" font-size="9" font-weight="700">${pct}%</text>
      </svg>`;
  }

  function buildHeader(topic) {
    const el = document.getElementById('topic-header');
    if (!el) return;
    const theme = topic._theme || 'tatabahasa';
    const themeColor = `var(--${theme})`;
    const pct = (typeof Progress !== 'undefined') ? Progress.masteryPct(topicId()) : 0;
    const levels = (topic.levels || []).map(l => `<span class="badge badge-${'p' + l.slice(1).toLowerCase()}">${l}</span>`).join('');
    el.innerHTML = `
      <button class="back-link" onclick="window.location.href='../../index.html'">← Kembali ke Hub</button>
      <div class="topic-color-bar" style="background:${themeColor}"></div>
      <div class="topic-title-wrap">
        <h1>${topic.title}</h1>
        <div class="topic-meta-pills">
          <span class="badge badge-${theme}">${theme}</span>
          ${levels}
        </div>
      </div>
      <div class="topic-mastery">${ringSvg(pct, themeColor)}<span class="mastery-label">Penguasaan</span></div>
    `;
  }

  function renderPelajaran(topic) {
    const pane = document.getElementById('tab-pelajaran');
    if (!pane) return;
    const themeColor = `var(--${topic._theme || 'tatabahasa'})`;
    const keyQs = (topic.keyQuestions || []).map(q => `<li>${q}</li>`).join('');
    const gloss = (topic.glossary || []).map(g => `
      <div class="glossary-term">
        <div class="term-name">${g.term}</div>
        <div class="term-def">${g.definition}</div>
        ${g.template ? `<div class="term-template" style="font-size:.78rem;color:var(--muted);margin-top:.25rem;font-style:italic">${g.template}</div>` : ''}
      </div>
    `).join('');
    const psle = (topic.pslePrompts || []).map(p => `<li>${p}</li>`).join('');

    pane.innerHTML = `
      <section class="pel-section">
        <h3>Soalan Kunci</h3>
        <ul class="key-questions">${keyQs || '<li style="color:var(--muted)">Tiada soalan kunci.</li>'}</ul>
      </section>
      <section class="pel-section">
        <h3>Pelajaran</h3>
        <div class="learn-body">${topic.learnHTML || ''}</div>
      </section>
      <section class="pel-section">
        <h3>Glosari</h3>
        <div class="glossary">${gloss || '<p style="color:var(--muted)">Tiada istilah.</p>'}</div>
      </section>
      <section class="pel-section">
        <h3>Ringkasan</h3>
        <div class="summary-body">${topic.summaryHTML || ''}</div>
      </section>
      <section class="pel-section psle-tips-section" style="border-left:3px solid ${themeColor}">
        <h3>📝 Petua PSLE</h3>
        <ul class="psle-tips">${psle || '<li style="color:var(--muted)">Tiada petua.</li>'}</ul>
      </section>
    `;
  }

  function wireLatih(topic) {
    const container = document.getElementById('tab-latih');
    if (!container) return;
    container.innerHTML = '<div id="latih-mount"></div>';
    if (global.MalayLatih && typeof global.MalayLatih.mount === 'function') {
      global.MalayLatih.mount(topic.id, document.getElementById('latih-mount'));
    } else {
      container.innerHTML = '<p style="color:var(--muted);font-style:italic">Modul Latih tidak dimuat.</p>';
    }
  }

  function wireKuiz(topic) {
    const tab = document.getElementById('tab-kuiz');
    if (!tab) return;
    const lv = (topic.levels && topic.levels.length) ? parseInt(topic.levels[topic.levels.length - 1].slice(1), 10) || 5 : 5;
    tab.innerHTML = `
      <div id="quiz-container" data-topic-id="${topic.id}" data-topic-name="${topic.title}" data-topic-level="${lv}">
        <p style="color:var(--muted)">Memuat soalan…</p>
      </div>
    `;
    if (typeof global.initAIQuizToggle === 'function') {
      global.initAIQuizToggle(topic.questions || []);
    }
  }

  function wireMindMap(topic) {
    const tab = document.getElementById('tab-peta-minda');
    if (!tab) return;
    const template = MIND_MAP_TEMPLATES[topic.id] || { nodes: [{ id: 'r', label: topic.title, color: { border: '#34d399' } }], edges: [], required: [] };
    tab.innerHTML = `
      <div class="mm-toolbar">
        <button class="btn btn-ghost btn-sm" id="mm-add">＋ Nod</button>
        <button class="btn btn-ghost btn-sm" id="mm-link">🔗 Sambung</button>
        <button class="btn btn-ghost btn-sm" id="mm-delete">🗑 Padam</button>
        <button class="btn btn-ghost btn-sm" id="mm-physics">🌀 Susun Semula</button>
        <button class="btn btn-ghost btn-sm" id="mm-reset">↺ Set Semula</button>
        <button class="btn btn-ghost btn-sm" id="mm-load">⬇ Muat</button>
        <button class="btn btn-primary btn-sm" id="mm-save">💾 Simpan</button>
        <button class="btn btn-primary btn-sm" id="mm-check">🔍 Semak</button>
      </div>
      <div id="mindmap-container" class="mm-container"></div>
      <div id="mindmap-feedback" class="mm-feedback" style="display:none"></div>
    `;
    if (typeof global.MalayMindMap === 'function') {
      const mm = new global.MalayMindMap('mindmap-container', topic.id, template);
      document.getElementById('mm-add').addEventListener('click', () => {
        const label = prompt('Label nod baharu:');
        if (label && label.trim()) mm.addNode(label.trim());
      });
      document.getElementById('mm-link').addEventListener('click', () => mm.addEdge());
      document.getElementById('mm-delete').addEventListener('click', () => mm.deleteSelected());
      document.getElementById('mm-physics').addEventListener('click', () => mm.togglePhysics());
      document.getElementById('mm-reset').addEventListener('click', () => mm.reset());
      document.getElementById('mm-load').addEventListener('click', () => mm.load());
      document.getElementById('mm-save').addEventListener('click', () => mm.save());
      document.getElementById('mm-check').addEventListener('click', () => mm.check());
    }
  }

  function wireTabs() {
    const btns = document.querySelectorAll('.tab-btn');
    const panes = document.querySelectorAll('.tab-pane');
    btns.forEach(btn => {
      btn.addEventListener('click', () => {
        btns.forEach(b => b.classList.remove('active'));
        panes.forEach(p => p.classList.remove('active'));
        btn.classList.add('active');
        const target = document.getElementById(btn.dataset.tab);
        if (target) target.classList.add('active');
      });
    });
  }

  async function run() {
    const id = topicId();
    if (!id) return;

    // Record visit immediately (counts toward mastery)
    if (typeof Progress !== 'undefined') Progress.recordVisit(id);

    let topic;
    try {
      topic = global.MalayContent ? await global.MalayContent.loadTopic(id) : null;
    } catch (err) {
      console.warn('Topic load failed', err);
    }
    if (!topic) {
      const err = document.getElementById('topic-error');
      if (err) { err.style.display = 'block'; err.textContent = `Tidak dapat memuat topik "${id}".`; }
      return;
    }

    buildHeader(topic);
    renderPelajaran(topic);
    wireLatih(topic);
    wireKuiz(topic);
    wireMindMap(topic);
    wireTabs();

    document.title = `${topic.title} | PSLE Bahasa Melayu Studio`;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run, { once: true });
  } else {
    run();
  }
})(typeof window !== 'undefined' ? window : globalThis);
