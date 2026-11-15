// ============================================================
//  ICONS — one drawn line set, in place of emoji in the chrome.
// ============================================================
//
//  Nas is an early reader, so a picture stays beside every word. But
//  emoji come from the phone, not from Nasworld: they change between
//  devices and each has its own colours, so nothing matched. These are
//  drawn to one grid (32), one stroke, and take the text colour.
//
//  Usage: icon('math') returns an <svg> string. Unknown names return ''.

var ICON_PATHS = {
  math:    '<rect x="5" y="5" width="22" height="22" rx="4"/><path d="M11 10.5v6M8 13.5h6M18.5 13.5h5.5M9.5 20.5l4 4M13.5 20.5l-4 4M18.5 21h5.5M18.5 24.5h5.5"/>',
  word:    '<path d="M16 9c-3-2.5-7-3-11-2v17c4-1 8-.5 11 2 3-2.5 7-3 11-2V7c-4-1-8-.5-11 2zM16 9v17"/>',
  malay:   '<circle cx="16" cy="16" r="3"/><path d="M16 13c-3-8 9-8 4-1M19 16c8-3 8 9 1 4M16 19c3 8-9 8-4 1M13 16c-8 3-8-9-1-4"/>',
  stem:    '<path d="M16 27V14M16 18c-6 0-9-4-9-9 6 0 9 4 9 9zM16 14c0-4 3-8 9-8 0 5-3 8-9 8z"/>',
  exam:    '<path d="M9 4h10l5 5v19H9zM19 4v5h5M13 15h7M13 19h7M13 23h4"/>',
  practice:'<circle cx="16" cy="16" r="11"/><circle cx="16" cy="16" r="6"/><circle cx="16" cy="16" r="1.4"/>',
  play:    '<path d="M6 12h6a3 3 0 1 1 6 0h8v6a3 3 0 1 0 0 6v3H6v-5a3 3 0 1 1 0-6z"/>',
  lab:     '<path d="M12 4h8M13 4v8l-7 12a2 2 0 0 0 2 3h16a2 2 0 0 0 2-3l-7-12V4M10 20h12"/>',
  garden:  '<circle cx="16" cy="11" r="3"/><path d="M16 8c0-5 6-4 4 0M19 11c5 0 4 6 0 4M16 14c0 5-6 4-4 0M13 11c-5 0-4-6 0-4M16 14v14M16 22c-4 0-6-2-6-5M16 25c4 0 6-2 6-5"/>',
  map:     '<circle cx="8" cy="9" r="3"/><circle cx="24" cy="8" r="3"/><circle cx="16" cy="18" r="3"/><circle cx="9" cy="25" r="2.5"/><circle cx="25" cy="24" r="2.5"/><path d="M10.5 11l3.5 5M21.5 10l-3.5 6M14 20l-3.5 3.5M18.5 19.5l4.5 3"/>',
  mirror:  '<ellipse cx="16" cy="13" rx="8" ry="10"/><path d="M16 23v5M11 28h10M12 10c1-2 3-3 5-3"/>',
  compass: '<circle cx="16" cy="16" r="11"/><path d="M20.5 11.5l-2.5 7-7 2.5 2.5-7z"/>',
  tricks:  '<path d="M11 20c-3-2-4-5-4-8a9 9 0 0 1 18 0c0 3-1 6-4 8v3H11zM12 27h8"/>',
  stasha:  '<circle cx="16" cy="9" r="4"/><path d="M8 28c0-7 3-11 8-11s8 4 8 11"/>',
  settings:'<path d="M5 9h12M23 9h4M5 16h4M15 16h12M5 23h14M25 23h2"/><circle cx="20" cy="9" r="3"/><circle cx="12" cy="16" r="3"/><circle cx="22" cy="23" r="3"/>',
  trophy:  '<path d="M10 5h12v6a6 6 0 0 1-12 0zM10 7H6c0 4 2 6 5 6M22 7h4c0 4-2 6-5 6M16 17v5M11 27h10M12 22h8v5h-8z"/>',
  star:    '<path d="M16 4l3.6 7.6 8.4 1-6.2 5.7 1.7 8.2L16 22.400l-7.5 4.1 1.7-8.200L4 12.600l8.4-1z"/>',
  sun:     '<circle cx="16" cy="16" r="5"/><path d="M16 4v3M16 25v3M4 16h3M25 16h3M7.5 7.500l2 2M22.5 22.500l2 2M7.5 24.500l2-2M22.5 9.500l2-2"/>',
  home:    '<path d="M5 15L16 5l11 10M8 13v14h16V13M13 27v-7h6v7"/>',
  seed:    '<path d="M16 28V17M16 17c0-6 4-10 10-10 0 6-4 10-10 10zM16 21c-5 0-8-3-8-8 5 0 8 3 8 8z"/>',
  check:   '<path d="M6 17l6 6L26 9"/>',
  timer:   '<circle cx="16" cy="18" r="10"/><path d="M16 12v6l4 3M13 4h6"/>',
  family:  '<path d="M16 27S5 20 5 12a6 6 0 0 1 11-3 6 6 0 0 1 11 3c0 8-11 15-11 15z"/>',
  lock:    '<rect x="7" y="14" width="18" height="13" rx="3"/><path d="M11 14v-4a5 5 0 0 1 10 0v4"/>',
  arrow:   '<path d="M6 16h20M19 9l7 7-7 7"/>'
};

function icon(name, cls) {
  var p = ICON_PATHS[name];
  if (!p) return '';
  return '<svg class="ico' + (cls ? ' ' + cls : '') + '" viewBox="0 0 32 32" aria-hidden="true" focusable="false">' + p + '</svg>';
}

/** Lumi, flat: the one bright thing on a screen. */
function lumiSvg(size) {
  var s = size || 64;
  return '<svg class="lumi-flat" width="' + s + '" height="' + s + '" viewBox="0 0 64 64" aria-hidden="true">' +
    '<circle cx="32" cy="32" r="28" fill="var(--lumi)"/>' +
    '<circle cx="23" cy="29" r="3.2" fill="#2a2622"/><circle cx="41" cy="29" r="3.2" fill="#2a2622"/>' +
    '<path d="M24 40c4 4.5 12 4.5 16 0" fill="none" stroke="#2a2622" stroke-width="2.4" stroke-linecap="round"/></svg>';
}

/** Fill every <span data-icon="name"> in the static page. */
function paintStaticIcons(root) {
  (root || document).querySelectorAll('[data-icon]').forEach(function (el) {
    if (!el.firstChild) el.innerHTML = icon(el.getAttribute('data-icon'));
  });
}

if (typeof window !== 'undefined') {
  window.icon = icon; window.lumiSvg = lumiSvg; window.paintStaticIcons = paintStaticIcons;
}
