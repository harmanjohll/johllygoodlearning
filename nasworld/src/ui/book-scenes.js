// ============================================================
//  BOOK SCENES — the pictures in the Book of Nasworld.
// ============================================================
//
//  Each chapter opens on a place. These are drawn in code so the book
//  works today, offline, on any device. They are meant to be replaced:
//  drop a painted picture at assets/book/<id>.jpg and list its id in
//  BOOK_PAINTED below, and the book uses that instead.
//
//  The pictures are the one place colour is allowed to be rich. The
//  page around them stays quiet so they read at once.

var BOOK_PAINTED = {};   // e.g. { math: true, cover: true } once painted art exists

function _scn(inner, sky) {
  return '<svg class="book-scene-svg" viewBox="0 0 400 640" preserveAspectRatio="xMidYMid slice" aria-hidden="true">' +
    '<rect width="400" height="640" fill="' + sky + '"/>' + inner + '</svg>';
}
function _cloud(x, y, s) {
  return '<g fill="#ffffff" opacity="0.85" transform="translate(' + x + ' ' + y + ') scale(' + s + ')"><ellipse cx="0" cy="0" rx="34" ry="13"/><ellipse cx="-16" cy="-9" rx="18" ry="13"/><ellipse cx="12" cy="-13" rx="22" ry="16"/></g>';
}
function _palm(x, y, s) {
  return '<g transform="translate(' + x + ' ' + y + ') scale(' + s + ')"><path d="M0 0c4-30 2-62-6-92" fill="none" stroke="#8a6a45" stroke-width="7" stroke-linecap="round"/>' +
    '<g fill="#3f8a4d"><path d="M-6-92c-22-16-48-12-60 2 22-8 40-6 60-2z"/><path d="M-6-92c22-18 50-14 62 0-22-8-42-6-62 0z"/><path d="M-6-92c-10-26-34-36-52-30 22 2 38 12 52 30z"/><path d="M-6-92c12-26 36-34 54-28-22 2-40 12-54 28z"/><path d="M-6-92c-2-22-2-40 6-52 4 18 2 34-6 52z"/></g>' +
    '<circle cx="-4" cy="-88" r="4" fill="#6b4f2e"/><circle cx="-11" cy="-86" r="4" fill="#6b4f2e"/></g>';
}
function _tree(x, y, s, c) {
  return '<g transform="translate(' + x + ' ' + y + ') scale(' + s + ')"><rect x="-5" y="-30" width="10" height="34" rx="3" fill="#7a5a3a"/>' +
    '<circle cx="0" cy="-52" r="30" fill="' + c + '"/><circle cx="-22" cy="-36" r="20" fill="' + c + '"/><circle cx="22" cy="-36" r="20" fill="' + c + '"/></g>';
}
function _boat(x, y, s, hull, sail) {
  return '<g transform="translate(' + x + ' ' + y + ') scale(' + s + ')"><path d="M-30 0h60l-10 16h-40z" fill="' + hull + '"/><path d="M0-2v-44" stroke="#6b4f2e" stroke-width="3"/><path d="M3-44l24 36H3z" fill="' + sail + '"/><path d="M-3-38l-18 30h18z" fill="#fff6e3"/></g>';
}
function _waves(y, c) {
  var d = '';
  for (var i = 0; i < 4; i++) { var yy = y + i * 26, x0 = (i % 2) * 30 - 20; d += 'M' + x0 + ' ' + yy; for (var x = x0; x < 420; x += 60) d += 'q15-9 30 0t30 0'; }
  return '<path d="' + d + '" fill="none" stroke="' + c + '" stroke-width="3" stroke-linecap="round" opacity="0.55"/>';
}
function _stilt(x, y, s, wall, roof) {
  return '<g transform="translate(' + x + ' ' + y + ') scale(' + s + ')"><g stroke="#6b4f2e" stroke-width="5" stroke-linecap="round"><path d="M-34 0v26M-12 0v26M12 0v26M34 0v26"/></g>' +
    '<rect x="-42" y="-44" width="84" height="46" rx="3" fill="' + wall + '"/><path d="M-56-42L0-84l56 42z" fill="' + roof + '"/>' +
    '<rect x="-8" y="-28" width="16" height="30" rx="2" fill="#6b4f2e"/><rect x="-32" y="-30" width="14" height="14" rx="2" fill="#fff6e3"/><rect x="18" y="-30" width="14" height="14" rx="2" fill="#fff6e3"/>' +
    '<path d="M0 2l-14 24M0 2l14 24M-9 14h18" stroke="#8a6a45" stroke-width="3" fill="none"/></g>';
}
function _flower(x, y, c) {
  return '<g transform="translate(' + x + ' ' + y + ')"><circle r="16" fill="#3f8a4d"/><g fill="' + c + '"><circle cx="-6" cy="-4" r="5"/><circle cx="6" cy="-5" r="5"/><circle cx="0" cy="5" r="5"/></g><circle r="2.5" fill="#f4c542"/></g>';
}

var BOOK_SCENES = {
  // Chapter 1: a harbour, where things are counted, weighed and measured.
  math: function () {
    return _scn(
      _cloud(90, 70, 1) + _cloud(300, 110, 0.8) +
      '<path d="M0 230c60-40 120-46 180-22s130 16 220-18v60H0z" fill="#9ccbb0"/>' +
      '<rect y="250" width="400" height="390" fill="#5fb3c9"/><rect y="250" width="400" height="60" fill="#7cc4d6"/>' + _waves(300, '#e9f7fa') + _waves(430, '#e9f7fa') +
      // lighthouse on a rock
      '<path d="M270 262c14-22 70-22 88 0z" fill="#8f8a80"/><path d="M302 256l8-96h18l8 96z" fill="#fff6e3"/><path d="M308 190h22l1 18h-24zM305 226h28l1 16h-30z" fill="#d1553f"/>' +
      '<rect x="304" y="142" width="30" height="18" rx="3" fill="#3d4a55"/><rect x="310" y="146" width="18" height="12" fill="#f4c542"/><path d="M300 142l19-18 19 18z" fill="#d1553f"/>' +
      _boat(96, 318, 1, '#d1553f', '#f4c542') + _boat(232, 372, 0.850, '#2f6b8a', '#fff6e3') + _boat(330, 452, 0.9, '#3f8a4d', '#f2a06b') +
      // jetty and beach
      '<path d="M0 640V520c70-34 150-30 230-10s120 14 170-6v136z" fill="#ecd9a8"/>' +
      '<g fill="#a07a4f"><rect x="40" y="470" width="150" height="14" rx="3"/><rect x="52" y="484" width="8" height="40"/><rect x="100" y="484" width="8" height="46"/><rect x="150" y="484" width="8" height="40"/></g>' +
      '<g><rect x="250" y="560" width="34" height="30" rx="3" fill="#c79a5b"/><path d="M250 575h34M267 560v30" stroke="#8a6a45" stroke-width="2"/><rect x="290" y="570" width="26" height="22" rx="3" fill="#b5854a"/></g>' +
      '<g fill="none" stroke="#3d4a55" stroke-width="2.5" stroke-linecap="round"><path d="M150 150q8-8 16 0q8-8 16 0"/><path d="M200 190q6-6 12 0q6-6 12 0"/></g>',
      '#cfe9f3');
  },
  // Chapter 2: a forest, where words grow.
  word: function () {
    return _scn(
      _cloud(80, 60, 0.9) + _cloud(310, 90, 0.7) +
      '<path d="M0 220c50-30 110-40 200-20s140 10 200-20v460H0z" fill="#a9d6a0"/>' +
      _tree(60, 250, 1.3, '#5aa565') + _tree(170, 232, 1.1, '#4b9458') + _tree(330, 250, 1.4, '#5aa565') + _tree(250, 240, 1, '#6bb673') +
      '<path d="M0 300c80-24 170-20 250 0s110 10 150-10v350H0z" fill="#86c183"/>' +
      // the big tree and its house
      '<path d="M186 470c4-70 0-140-10-210h56c-10 70-12 140-8 210z" fill="#7a5a3a"/>' +
      '<circle cx="204" cy="212" r="74" fill="#3f8a4d"/><circle cx="140" cy="250" r="50" fill="#4b9458"/><circle cx="270" cy="250" r="52" fill="#4b9458"/>' +
      '<g><rect x="168" y="262" width="76" height="48" rx="4" fill="#e9c98a"/><path d="M158 264l48-36 48 36z" fill="#d1553f"/><rect x="198" y="282" width="16" height="28" rx="2" fill="#7a5a3a"/><circle cx="182" cy="284" r="7" fill="#fff6e3"/><circle cx="230" cy="284" r="7" fill="#fff6e3"/>' +
      '<path d="M192 310v150M220 310v150" stroke="#8a6a45" stroke-width="4"/><path d="M192 332h28M192 356h28M192 380h28M192 404h28M192 428h28" stroke="#8a6a45" stroke-width="4"/></g>' +
      // stream and ground
      '<path d="M0 520c70-20 120 20 200 0s130-24 200 0v120H0z" fill="#74b877"/>' +
      '<path d="M400 500c-70 6-110 40-160 60s-90 30-110 80h90c20-40 60-56 100-74s60-26 80-30z" fill="#7cc4d6"/>' +
      '<g><path d="M60 560v-14" stroke="#fff6e3" stroke-width="7" stroke-linecap="round"/><path d="M44 548a16 12 0 0 1 32 0z" fill="#d1553f"/><path d="M96 590v-10" stroke="#fff6e3" stroke-width="6" stroke-linecap="round"/><path d="M84 582a12 9 0 0 1 24 0z" fill="#d1553f"/></g>' +
      _flower(320, 470, '#f2a06b') + _flower(350, 600, '#f4c542'),
      '#d7efe6');
  },
  // Chapter 3: a kampung, where Bahasa Melayu lives.
  malay: function () {
    return _scn(
      _cloud(110, 70, 1) + _cloud(320, 60, 0.7) +
      '<path d="M0 240c70-30 150-34 220-14s120 12 180-14v430H0z" fill="#b8dba0"/>' +
      _palm(50, 300, 1.2) + _palm(350, 290, 1.3) + _palm(210, 250, 0.9) +
      _stilt(130, 330, 1.3, '#e9c98a', '#9a5b3a') + _stilt(300, 430, 1.1, '#f0d9a6', '#b5653f') +
      '<path d="M0 480c60-20 130-16 200 4s140 12 200-10v170H0z" fill="#9bcb86"/>' +
      // padi rows
      '<g stroke="#6aa85c" stroke-width="4" stroke-linecap="round">' + (function () { var d = ''; for (var r = 0; r < 4; r++) for (var c = 0; c < 9; c++) { var x = 20 + c * 20 + r * 6, y = 540 + r * 24; d += '<path d="M' + x + ' ' + y + 'v-12"/>'; } return d; })() + '</g>' +
      _flower(240, 540, '#d1553f') + _flower(280, 580, '#d1553f') + _flower(350, 550, '#e56a7a') +
      // a hen
      '<g transform="translate(330 610)"><ellipse rx="14" ry="10" fill="#fff6e3"/><circle cx="12" cy="-10" r="7" fill="#fff6e3"/><path d="M18-10l8 2-8 3z" fill="#f2a06b"/><path d="M10-17q3-6 6 0z" fill="#d1553f"/></g>',
      '#fbe9c8');
  },
  // Chapter 4: a peak, where you look closely at the world.
  stem: function () {
    return _scn(
      _cloud(70, 120, 0.9) + _cloud(330, 170, 1) + _cloud(210, 60, 0.6) +
      '<path d="M0 380l110-150 70 80 60-110 160 180v260H0z" fill="#9bbfb2"/>' +
      '<path d="M90 640l110-420 110 420z" fill="#7ca894"/><path d="M200 220l-34 130 22-16 14 24 16-22 22 20z" fill="#eef6f2"/>' +
      // observatory
      '<g><rect x="176" y="186" width="48" height="38" rx="3" fill="#fff6e3"/><path d="M172 188a28 28 0 0 1 56 0z" fill="#3d6f8a"/><path d="M200 162l22-26" stroke="#3d4a55" stroke-width="7" stroke-linecap="round"/><rect x="194" y="202" width="12" height="22" rx="2" fill="#6b4f2e"/></g>' +
      '<path d="M0 470c70-30 140-24 210 0s120 16 190-12v182H0z" fill="#86c183"/>' +
      _tree(50, 500, 1.1, '#4b9458') + _tree(350, 510, 1.2, '#5aa565') + _tree(110, 470, 0.8, '#6bb673') +
      // a pond and a weather vane
      '<ellipse cx="270" cy="570" rx="70" ry="22" fill="#7cc4d6"/><ellipse cx="250" cy="566" rx="14" ry="5" fill="#86c183"/>' +
      '<g transform="translate(120 560)"><path d="M0 0v-70" stroke="#3d4a55" stroke-width="4"/><path d="M-22-70h44M0-92v44" stroke="#3d4a55" stroke-width="3"/><path d="M22-70l-12-7v14z" fill="#d1553f"/></g>' +
      '<g fill="#f4c542"><circle cx="330" cy="70" r="3"/><circle cx="60" cy="50" r="2.5"/><circle cx="150" cy="96" r="2"/></g>',
      '#cfe0ee');
  },
  // The cover: the whole island at once.
  cover: function () {
    return _scn(
      _cloud(80, 90, 1) + _cloud(320, 130, 0.8) +
      '<rect y="330" width="400" height="310" fill="#5fb3c9"/>' + _waves(380, '#e9f7fa') + _waves(520, '#e9f7fa') +
      '<path d="M30 400c20-90 110-150 170-150s150 60 170 150c-60 30-280 30-340 0z" fill="#9bcb86"/>' +
      '<path d="M20 404c60 34 300 34 360 0 4 14-40 34-180 34S16 418 20 404z" fill="#ecd9a8"/>' +
      '<path d="M150 400l50-150 50 150z" fill="#7ca894"/><g transform="translate(200 250) scale(0.6)"><rect x="-24" y="-38" width="48" height="38" rx="3" fill="#fff6e3"/><path d="M-28-36a28 28 0 0 1 56 0z" fill="#3d6f8a"/></g>' +
      _tree(120, 380, 0.7, '#4b9458') + _tree(150, 396, 0.6, '#5aa565') + _palm(300, 400, 0.6) + _stilt(270, 388, 0.450, '#e9c98a', '#9a5b3a') +
      '<g transform="translate(70 396) scale(0.5)"><path d="M-10 0l6-70h14l6 70z" fill="#fff6e3"/><path d="M-6-40h18l1 14h-20z" fill="#d1553f"/><path d="M-10-70l13-14 13 14z" fill="#d1553f"/></g>' +
      _boat(60, 470, 0.8, '#d1553f', '#f4c542') + _boat(330, 540, 0.9, '#2f6b8a', '#fff6e3') +
      '<path d="M90 398c40-20 60 10 100-6s50-30 90-8" fill="none" stroke="#ecd9a8" stroke-width="5" stroke-linecap="round" stroke-dasharray="2 9"/>' +
      '<g transform="translate(318 214)"><circle r="30" fill="#f4c542"/><circle cx="-11" cy="-4" r="4" fill="#2a2622"/><circle cx="11" cy="-4" r="4" fill="#2a2622"/><path d="M-10 9c5 6 15 6 20 0" fill="none" stroke="#2a2622" stroke-width="3" stroke-linecap="round"/></g>',
      '#cfe9f3');
  }
};

function bookScene(id) {
  if (BOOK_PAINTED[id]) return '<img class="book-scene-img" src="assets/book/' + id + '.jpg" alt="">';
  var f = BOOK_SCENES[id];
  return f ? f() : '';
}

if (typeof window !== 'undefined') { window.bookScene = bookScene; window.BOOK_SCENES = BOOK_SCENES; window.BOOK_PAINTED = BOOK_PAINTED; }
