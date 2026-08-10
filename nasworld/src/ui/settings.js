// ============================================================
//  SETTINGS — Grown-up controls. AI key, sound, data.
//
//  Deliberately plain and slightly boring so it does not invite a
//  six year old to fiddle. The AI section is honest about what a
//  browser-stored key does and does not protect.
// ============================================================

function renderSettings() {
  var c = document.getElementById('settings-content');
  if (!c) return;

  var hasKey = typeof aiGetKey === 'function' && !!aiGetKey();
  var model = typeof aiGetModel === 'function' ? aiGetModel() : 'gemini-2.5-flash';

  var html = '<button class="back-btn" onclick="showScreen(\'home\')">← Back to Home</button>';
  html += '<div class="settings-shell">';
  html += '<h2 class="settings-title">Settings</h2>';
  html += '<p class="settings-sub">For grown-ups.</p>';

  // ---- AI section ----
  html += '<div class="settings-card">';
  html += '<div class="settings-card-title">✨ AI Question Writer <span class="settings-badge ' + (hasKey ? 'on' : 'off') + '">' + (hasKey ? 'Connected' : 'Not set up') + '</span></div>';
  html += '<p class="settings-help">Nasworld works fully without this. Adding a Google Gemini key lets it write <strong>fresh word problems</strong> on demand, themed to whatever Anastasia is into that week, and explain wrong answers in kid-friendly language.</p>';

  html += '<label class="settings-label">Gemini API key</label>';
  html += '<div class="settings-keyrow">';
  html += '<input id="settings-key-input" class="settings-input" type="password" placeholder="AIza..." value="' + (hasKey ? '••••••••••••••••' : '') + '" autocomplete="off" spellcheck="false">';
  html += '<button class="settings-btn" onclick="settingsToggleKeyVisible()" id="settings-eye">👁</button>';
  html += '</div>';
  html += '<div class="settings-row">';
  html += '<button class="settings-btn primary" onclick="settingsSaveKey()">Save key</button>';
  html += '<button class="settings-btn" onclick="settingsTestKey()">Test connection</button>';
  if (hasKey) html += '<button class="settings-btn danger" onclick="settingsClearKey()">Remove</button>';
  html += '</div>';
  html += '<div id="settings-key-status" class="settings-status"></div>';

  html += '<label class="settings-label">Model</label>';
  html += '<div class="settings-row">';
  [['gemini-2.5-flash', 'Flash — fast & cheap (recommended)'],
   ['gemini-2.5-pro',   'Pro — slower, higher quality']].forEach(function(m) {
    html += '<button class="settings-chip' + (model === m[0] ? ' on' : '') + '" onclick="settingsSetModel(\'' + m[0] + '\')">' + m[1] + '</button>';
  });
  html += '</div>';

  // The honest bit.
  html += '<div class="settings-warn">';
  html += '<strong>Please read before adding a key.</strong><br>';
  html += 'The key is stored in this browser only (localStorage) and is sent straight to Google from this device. It is never sent to me or to GitHub.<br><br>';
  html += 'But this is a <em>client-side</em> app, so anyone with access to this device and its browser tools can read the key out of storage. Use a key with billing limits set, and treat it as disposable. Do not reuse a key you rely on elsewhere. You can revoke it any time in Google AI Studio.';
  html += '</div>';
  html += '</div>';

  // ---- Sound ----
  html += '<div class="settings-card">';
  html += '<div class="settings-card-title">🔊 Sound & Voice</div>';
  var soundOff = state.preferences && state.preferences.soundOff;
  var stashaMuted = state.preferences && state.preferences.stashaMuted;
  html += '<label class="settings-toggle"><input type="checkbox" ' + (soundOff ? '' : 'checked') + ' onchange="settingsToggleSound(this.checked)"> Sound effects</label>';
  html += '<label class="settings-toggle"><input type="checkbox" ' + (stashaMuted ? '' : 'checked') + ' onchange="settingsToggleStasha(this.checked)"> Stasha can talk</label>';
  html += '</div>';

  // ---- Quiz pacing ----
  html += '<div class="settings-card">';
  html += '<div class="settings-card-title">⚡ Quiz pacing</div>';
  var manual = state.preferences && state.preferences.manualAdvance;
  html += '<p class="settings-help">By default the quiz moves on by itself after each answer, so Anastasia keeps her flow. Switch this on if she would rather tap Continue every time.</p>';
  html += '<label class="settings-toggle"><input type="checkbox" ' + (manual ? 'checked' : '') + ' onchange="settingsToggleManualAdvance(this.checked)"> Wait for a tap after every question</label>';
  html += '</div>';

  // ---- Data ----
  html += '<div class="settings-card">';
  html += '<div class="settings-card-title">💾 Progress</div>';
  var totalAttempts = 0, skillCount = 0;
  Object.keys(state.skills || {}).forEach(function(k) {
    totalAttempts += state.skills[k].totalAttempts || 0;
    if ((state.skills[k].totalAttempts || 0) > 0) skillCount++;
  });
  html += '<p class="settings-help">' + totalAttempts + ' questions answered across ' + skillCount + ' skills. ' +
          (state.tokens || 0) + ' stars earned.</p>';
  html += '<div class="settings-row">';
  html += '<button class="settings-btn" onclick="settingsExport()">Export a backup</button>';
  html += '</div>';
  html += '<div id="settings-export-out"></div>';
  html += '</div>';

  html += '</div>';
  c.innerHTML = html;
}

function settingsToggleKeyVisible() {
  var input = document.getElementById('settings-key-input');
  if (!input) return;
  input.type = input.type === 'password' ? 'text' : 'password';
}

function _settingsStatus(msg, kind) {
  var el = document.getElementById('settings-key-status');
  if (el) el.innerHTML = '<span class="settings-status-' + (kind || 'info') + '">' + msg + '</span>';
}

function settingsSaveKey() {
  var input = document.getElementById('settings-key-input');
  if (!input) return;
  var v = input.value.trim();
  if (!v || v.indexOf('•') === 0) { _settingsStatus('Paste a key first.', 'warn'); return; }
  if (v.length < 20) { _settingsStatus('That does not look like a Gemini key.', 'warn'); return; }
  aiSetKey(v);
  _settingsStatus('Saved. Tap "Test connection" to check it works.', 'ok');
  renderSettings();
}

function settingsClearKey() {
  aiSetKey('');
  _settingsStatus('Key removed. Nasworld still works exactly as before.', 'ok');
  renderSettings();
}

function settingsSetModel(m) {
  aiSetModel(m);
  renderSettings();
}

function settingsTestKey() {
  if (typeof aiTestConnection !== 'function') return;
  _settingsStatus('Testing…', 'info');
  aiTestConnection().then(function(r) {
    _settingsStatus('✅ Working. Gemini said: "' + (r.greeting || 'hello') + '"', 'ok');
  }).catch(function(e) {
    var msg = String(e.message || e);
    if (msg.indexOf('no-key') !== -1)       _settingsStatus('No key saved yet.', 'warn');
    else if (msg.indexOf('400') !== -1)     _settingsStatus('❌ Key rejected. Check you copied all of it.', 'err');
    else if (msg.indexOf('403') !== -1)     _settingsStatus('❌ Key not authorised. Enable the Generative Language API in Google AI Studio.', 'err');
    else if (msg.indexOf('429') !== -1)     _settingsStatus('⏳ Rate limited. Wait a minute and try again.', 'warn');
    else                                     _settingsStatus('❌ ' + msg.slice(0, 160), 'err');
  });
}

function settingsToggleSound(on) {
  if (!state.preferences) state.preferences = {};
  state.preferences.soundOff = !on;
  saveState();
}
function settingsToggleManualAdvance(on) {
  if (!state.preferences) state.preferences = {};
  state.preferences.manualAdvance = !!on;
  saveState();
}

function settingsToggleStasha(on) {
  if (!state.preferences) state.preferences = {};
  state.preferences.stashaMuted = !on;
  saveState();
}

function settingsExport() {
  var out = document.getElementById('settings-export-out');
  if (!out) return;
  var data = JSON.stringify(state);
  out.innerHTML = '<textarea class="settings-export" readonly onclick="this.select()">' +
    data.replace(/</g, '&lt;') + '</textarea>' +
    '<p class="settings-help">Tap the box to select all, then copy. Paste it somewhere safe.</p>';
}

window.renderSettings = renderSettings;
window.settingsSaveKey = settingsSaveKey;
window.settingsClearKey = settingsClearKey;
window.settingsTestKey = settingsTestKey;
window.settingsSetModel = settingsSetModel;
window.settingsToggleKeyVisible = settingsToggleKeyVisible;
window.settingsToggleSound = settingsToggleSound;
window.settingsToggleStasha = settingsToggleStasha;
window.settingsToggleManualAdvance = settingsToggleManualAdvance;
window.settingsExport = settingsExport;
