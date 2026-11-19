// ============================================================
//  LOOK — tone and typeface, chosen in Settings.
// ============================================================
//
//  The layout is the original Nasworld. What changes here is the canvas:
//  four soft colour schemes and four faces for each of titles and
//  reading. A choice is one attribute on <html> (data-tone) and two CSS
//  variables; every rule in the stylesheets draws from tokens, so
//  nothing else has to change. The schemes are defined in app-7.css.

var LOOK_TONES = [
  { id: 'oat',   name: 'Oat and indigo',  note: 'Japandi: warm paper, charcoal ink' },
  { id: 'birch', name: 'Birch and fjord', note: 'Norwegian: pale, cool and clear' },
  { id: 'sage',  name: 'Sage and stone',  note: 'Soft grey green, moss and sand' },
  { id: 'blush', name: 'Blush and clay',  note: 'Warm pale pink, terracotta and plum' }
];
var LOOK_TITLE_FONTS = [
  { id: 'Fredoka',         note: 'Round and friendly, the original' },
  { id: 'Zen Maru Gothic', note: 'Rounded and calm' },
  { id: 'Baloo 2',         note: 'Soft and chunky' },
  { id: 'Fraunces',        note: 'Storybook serif' }
];
var LOOK_READ_FONTS = [
  { id: 'Andika',                note: 'Made for new readers' },
  { id: 'Lexend',                note: 'Wide and open' },
  { id: 'Atkinson Hyperlegible', note: 'Every letter distinct' },
  { id: 'Nunito',                note: 'Rounded and familiar' }
];
var LOOK_DEFAULT = { tone: 'oat', titleFont: 'Fredoka', readFont: 'Andika' };

function _lookHas(list, id) { return list.some(function (x) { return x.id === id; }); }

function getLook() {
  var s = (typeof state !== 'undefined' && state.settings) || {};
  return {
    tone:      _lookHas(LOOK_TONES, s.tone) ? s.tone : LOOK_DEFAULT.tone,
    titleFont: _lookHas(LOOK_TITLE_FONTS, s.titleFont) ? s.titleFont : LOOK_DEFAULT.titleFont,
    readFont:  _lookHas(LOOK_READ_FONTS, s.readFont) ? s.readFont : LOOK_DEFAULT.readFont
  };
}

function applyLook() {
  if (typeof document === 'undefined' || !document.documentElement) return;
  var look = getLook(), root = document.documentElement;
  root.setAttribute('data-tone', look.tone);
  if (root.style && root.style.setProperty) {
    root.style.setProperty('--font-display', "'" + look.titleFont + "', 'Nunito', system-ui, sans-serif");
    root.style.setProperty('--font-body', "'" + look.readFont + "', 'Nunito', system-ui, sans-serif");
  }
}

function setLook(key, value) {
  if (!state.settings) state.settings = { language: 'en' };
  state.settings[key] = value;
  applyLook();
  if (typeof saveState === 'function') saveState();
  if (typeof renderSettings === 'function') renderSettings();
}

function _lookChoices(key, list, current, sampleFont) {
  return '<div class="look-choices">' + list.map(function (o) {
    var on = o.id === current;
    var sample = sampleFont ? '<span class="look-sample" style="font-family:\'' + o.id + '\',sans-serif">' + (key === 'readFont' ? 'ag7' : 'Nas') + '</span>'
                            : '<span class="look-swatch" data-tone="' + o.id + '"><i></i><i></i><i></i><i></i></span>';
    return '<button type="button" class="look-choice' + (on ? ' on' : '') + '" aria-pressed="' + on + '" onclick="setLook(\'' + key + '\',\'' + o.id + '\')">' +
      sample + '<span class="look-text"><span class="look-name">' + (o.name || o.id) + '</span><span class="look-note">' + o.note + '</span></span></button>';
  }).join('') + '</div>';
}

/** The "Look" card for the Settings screen. */
function renderLookSettings() {
  var look = getLook();
  return '<div class="settings-card">' +
    '<div class="settings-card-title">Look</div>' +
    '<p class="settings-help">Choose the colours and the lettering. It changes straight away and is remembered on this device.</p>' +
    '<label class="settings-label">Colours</label>' + _lookChoices('tone', LOOK_TONES, look.tone, false) +
    '<label class="settings-label">Titles</label>' + _lookChoices('titleFont', LOOK_TITLE_FONTS, look.titleFont, true) +
    '<label class="settings-label">Reading</label>' + _lookChoices('readFont', LOOK_READ_FONTS, look.readFont, true) +
    '</div>';
}

if (typeof window !== 'undefined') {
  window.getLook = getLook; window.applyLook = applyLook; window.setLook = setLook; window.renderLookSettings = renderLookSettings;
}
