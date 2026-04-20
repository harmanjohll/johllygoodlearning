/* =========================================================
   /studio/map/vault.js
   Local notes: CRUD + editor + drag-to-link.
   Persists to jgl.progress.mega.notes (local-only).
   Depends on graph.js (window.MAP) being loaded first.
   ========================================================= */

(function () {
  const M = window.MAP;
  if (!M) { console.error('[vault] MAP state missing'); return; }

  const listHost    = document.getElementById('notes-list');
  const editorHost  = document.getElementById('editor-host');
  const newBtn      = document.getElementById('note-new');
  const exportBtn   = document.getElementById('note-export');
  const vaultTabBtn = document.getElementById('tab-vault');

  function readNotes() {
    try { return (window.JglStorage.getProgress().mega || {}).notes || []; }
    catch { return []; }
  }
  function writeNotes(notes) {
    if (!window.JglStorage) return;
    window.JglStorage.update(p => {
      p.mega = p.mega || {};
      p.mega.notes = notes;
      return p;
    });
  }
  function mkId() { return 'note:' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 7); }

  const V = {
    notes: [],
    editingId: null,
  };

  function refresh() {
    V.notes = readNotes();
    renderList();
    M.api.rebuildNotes(V.notes);
  }

  // ── Sidebar rendering ────────────────────────────────────
  function renderList() {
    listHost.innerHTML = '';
    if (!V.notes.length) {
      const p = document.createElement('p');
      p.className = 'empty';
      p.textContent = 'No notes yet. Double-click the map or press New note.';
      listHost.appendChild(p);
      return;
    }
    V.notes.forEach(n => {
      const card = document.createElement('div');
      card.className = 'note-card' + (n.id === M.focusId ? ' active' : '');
      const label = document.createElement('div');
      label.className = 'nc-label';
      label.textContent = n.label || 'Untitled note';
      label.addEventListener('click', () => M.api.focusNode(n.id));
      const body = document.createElement('div');
      body.className = 'nc-body';
      body.textContent = n.body || '';
      const meta = document.createElement('div');
      meta.className = 'nc-meta';
      const links = document.createElement('span');
      links.textContent = (n.links || []).length + ' link' + ((n.links || []).length === 1 ? '' : 's');
      const actions = document.createElement('span');
      actions.className = 'nc-actions';
      const editBtn = document.createElement('button');
      editBtn.textContent = 'edit';
      editBtn.addEventListener('click', () => openEditor(n.id));
      const linkBtn = document.createElement('button');
      linkBtn.textContent = 'link';
      linkBtn.addEventListener('click', () => startLinking(n.id));
      const delBtn = document.createElement('button');
      delBtn.textContent = 'delete';
      delBtn.addEventListener('click', () => deleteNote(n.id));
      actions.appendChild(editBtn); actions.appendChild(linkBtn); actions.appendChild(delBtn);
      meta.appendChild(links); meta.appendChild(actions);
      card.appendChild(label);
      if (n.body) card.appendChild(body);
      card.appendChild(meta);
      listHost.appendChild(card);
    });
  }

  // ── Editor ───────────────────────────────────────────────
  function openEditor(id) {
    V.editingId = id;
    const note = V.notes.find(n => n.id === id);
    if (!note) return;
    editorHost.innerHTML = '';
    const wrap = document.createElement('div');
    wrap.className = 'note-editor';

    const titleInput = document.createElement('input');
    titleInput.type = 'text';
    titleInput.placeholder = 'Note title';
    titleInput.value = note.label || '';

    const bodyInput = document.createElement('textarea');
    bodyInput.placeholder = 'Your note...';
    bodyInput.value = note.body || '';

    const chips = document.createElement('div');
    chips.className = 'chip-row';
    refreshChips(chips, note);

    const hint = document.createElement('div');
    hint.className = 'ne-hint';
    hint.textContent = 'Links: open this note, click "Link to node…", then click any node on the map.';

    const row = document.createElement('div');
    row.className = 'row';
    const linkBtn = document.createElement('button');
    linkBtn.type = 'button';
    linkBtn.className = 'btn btn-ghost';
    linkBtn.style.fontSize = '.72rem';
    linkBtn.textContent = '↗ Link to node...';
    linkBtn.addEventListener('click', () => startLinking(id));

    const saveBtn = document.createElement('button');
    saveBtn.type = 'button';
    saveBtn.className = 'btn btn-primary';
    saveBtn.style.fontSize = '.72rem';
    saveBtn.textContent = 'Save';
    saveBtn.addEventListener('click', () => {
      const patch = { label: titleInput.value.trim() || 'Untitled note', body: bodyInput.value };
      updateNote(id, patch);
      editorHost.innerHTML = '';
      V.editingId = null;
    });

    const closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.className = 'btn btn-ghost';
    closeBtn.style.fontSize = '.72rem';
    closeBtn.textContent = 'Close';
    closeBtn.addEventListener('click', () => {
      editorHost.innerHTML = '';
      V.editingId = null;
    });

    const spc = document.createElement('span'); spc.className = 'spc';
    row.appendChild(linkBtn); row.appendChild(spc); row.appendChild(closeBtn); row.appendChild(saveBtn);

    wrap.appendChild(titleInput);
    wrap.appendChild(bodyInput);
    wrap.appendChild(chips);
    wrap.appendChild(hint);
    wrap.appendChild(row);
    editorHost.appendChild(wrap);
    titleInput.focus();
    titleInput.select();

    // Jump the Vault tab into view
    vaultTabBtn.click();
  }

  function refreshChips(hostEl, note) {
    hostEl.innerHTML = '';
    (note.links || []).forEach(targetId => {
      const target = M.nodesById.get(targetId);
      const chip = document.createElement('span');
      chip.className = 'chip interactive';
      chip.textContent = target ? target.label : targetId;
      chip.addEventListener('click', () => M.api.focusNode(targetId));
      const rm = document.createElement('button');
      rm.innerHTML = '&times;';
      rm.setAttribute('aria-label', 'Remove link');
      rm.addEventListener('click', (ev) => {
        ev.stopPropagation();
        removeLink(note.id, targetId);
      });
      chip.appendChild(rm);
      hostEl.appendChild(chip);
    });
    if (!(note.links || []).length) {
      const empty = document.createElement('span');
      empty.className = 'chip';
      empty.textContent = 'no links yet';
      empty.style.opacity = '.6';
      hostEl.appendChild(empty);
    }
  }

  // ── Mutations ────────────────────────────────────────────
  function createNote(x, y) {
    const id = mkId();
    const note = {
      id,
      label: 'Untitled note',
      body: '',
      x, y,
      links: [],
      createdIso: new Date().toISOString(),
      updatedIso: new Date().toISOString(),
    };
    V.notes.push(note);
    writeNotes(V.notes);
    refresh();
    M.api.focusNode(id);
    openEditor(id);
  }
  function updateNote(id, patch) {
    const n = V.notes.find(n => n.id === id);
    if (!n) return;
    Object.assign(n, patch, { updatedIso: new Date().toISOString() });
    writeNotes(V.notes);
    refresh();
  }
  function deleteNote(id) {
    if (!confirm('Delete this note? This cannot be undone.')) return;
    V.notes = V.notes.filter(n => n.id !== id);
    writeNotes(V.notes);
    if (V.editingId === id) { editorHost.innerHTML = ''; V.editingId = null; }
    refresh();
    if (M.focusId === id) M.api.clearFocus();
  }
  function addLink(noteId, targetId) {
    const n = V.notes.find(n => n.id === noteId);
    if (!n) return;
    n.links = n.links || [];
    if (!n.links.includes(targetId) && targetId !== noteId) {
      n.links.push(targetId);
      n.updatedIso = new Date().toISOString();
      writeNotes(V.notes);
      refresh();
      if (V.editingId === noteId) openEditor(noteId);
    }
  }
  function removeLink(noteId, targetId) {
    const n = V.notes.find(n => n.id === noteId);
    if (!n) return;
    n.links = (n.links || []).filter(t => t !== targetId);
    n.updatedIso = new Date().toISOString();
    writeNotes(V.notes);
    refresh();
    if (V.editingId === noteId) openEditor(noteId);
  }

  // ── Link mode ────────────────────────────────────────────
  function startLinking(noteId) {
    M.api.enterLinking(noteId);
    vaultTabBtn.click();
  }
  M.hooks.onLinkPicked = (noteId, targetId) => addLink(noteId, targetId);

  // ── Double-click canvas → create note ────────────────────
  M.hooks.onDblClickCanvas = (x, y) => createNote(x, y);

  // ── Export ───────────────────────────────────────────────
  exportBtn.addEventListener('click', async () => {
    const payload = JSON.stringify({ exportedIso: new Date().toISOString(), notes: V.notes }, null, 2);
    try {
      await navigator.clipboard.writeText(payload);
      exportBtn.textContent = 'Copied';
      setTimeout(() => exportBtn.textContent = 'Export JSON', 1400);
    } catch {
      const w = window.open();
      if (w) { w.document.title = 'Studio vault export'; w.document.body.innerText = payload; }
    }
  });

  newBtn.addEventListener('click', () => {
    const cx = M.viewport.w / 2, cy = M.viewport.h / 2;
    createNote(cx + (Math.random() - .5) * 80, cy + (Math.random() - .5) * 80);
  });

  // ── Hydrate on graph init ───────────────────────────────
  M.api.hydrateVault = refresh;
})();
