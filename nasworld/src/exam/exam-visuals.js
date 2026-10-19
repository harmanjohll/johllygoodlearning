// ============================================================
//  EXAM PREP — pictures
// ============================================================
//
//  Every picture a question needs is drawn here from a small spec, as
//  inline SVG or plain HTML, so nothing depends on an image file.
//
//  Two rules hold throughout, because a wrong picture teaches the wrong
//  thing as surely as a wrong answer key:
//
//    - Anything a question asks about is DERIVED from the same data the
//      picture is drawn from. A figure's shape counts come from its own
//      parts list; a graph's bars come from its own numbers. The picture
//      and the answer cannot disagree.
//
//    - Labels never give the answer away. A clock is labelled "clock",
//      never "clock showing 7.25".
// ============================================================

function examVisual(v, opts) {
  if (!v) return '';
  opts = opts || {};
  switch (v.kind) {
    case 'clock':  return examClockSVG(v.h, v.m, opts.small ? 120 : 190);
    case 'ruler':  return examRulerSVG(v, opts);
    case 'shape':  return examShapeSVG(v.name, opts.small ? 76 : 120, v.color);
    case 'figure': return examFigureSVG(v.name, opts.small ? 140 : 220);
    case 'pgraph': return examPictureGraph(v);
    case 'groups': return examGroups(v);
    case 'array':  return examArray(v);
    case 'share':  return examShare(v);
    case 'blocks': return examBlocks(v.tens, v.ones);
    case 'row':    return examRow(v);
    case 'bond':   return examBond(v);
    case 'scene':  return examScene(v);
    case 'emoji':  return '<div class="exam-emoji" aria-hidden="true">' + v.text + '</div>';
  }
  return '';
}

// ---- Clock --------------------------------------------------------------
// The hour hand moves with the minutes: at 7.25 it sits a little under
// halfway from 7 to 8, as on a real clock. Pointing it straight at the 7
// would teach children to read the hour hand wrongly.

function examClockAngles(h, m) {
  return { hour: ((h % 12) + m / 60) * 30, minute: m * 6 };
}

function examClockSVG(h, m, size) {
  var cx = 100, cy = 100, r = 92;
  var a = examClockAngles(h, m);
  var pt = function (deg, len) {
    var rad = deg * Math.PI / 180;
    return { x: cx + len * Math.sin(rad), y: cy - len * Math.cos(rad) };
  };
  var s = '<svg class="exam-clock" viewBox="0 0 200 200" width="' + size + '" height="' + size +
          '" role="img" aria-label="clock">';
  s += '<circle cx="100" cy="100" r="' + r + '" fill="#fffdf5" stroke="#3b2f6b" stroke-width="5"/>';
  for (var i = 0; i < 60; i++) {
    var big = i % 5 === 0;
    var p1 = pt(i * 6, r - 4), p2 = pt(i * 6, r - (big ? 15 : 9));
    s += '<line x1="' + p1.x.toFixed(2) + '" y1="' + p1.y.toFixed(2) + '" x2="' + p2.x.toFixed(2) +
         '" y2="' + p2.y.toFixed(2) + '" stroke="#3b2f6b" stroke-width="' + (big ? 3 : 1.2) + '"/>';
  }
  for (var n = 1; n <= 12; n++) {
    var p = pt(n * 30, 68);
    s += '<text x="' + p.x.toFixed(2) + '" y="' + (p.y + 7).toFixed(2) +
         '" text-anchor="middle" font-size="20" font-weight="700" fill="#2a1f55" font-family="Fredoka, sans-serif">' + n + '</text>';
  }
  var hp = pt(a.hour, 47), mp = pt(a.minute, 74);
  s += '<line x1="100" y1="100" x2="' + hp.x.toFixed(2) + '" y2="' + hp.y.toFixed(2) +
       '" stroke="#2a1f55" stroke-width="8" stroke-linecap="round"/>';
  s += '<line x1="100" y1="100" x2="' + mp.x.toFixed(2) + '" y2="' + mp.y.toFixed(2) +
       '" stroke="#e0483e" stroke-width="4.5" stroke-linecap="round"/>';
  s += '<circle cx="100" cy="100" r="6" fill="#2a1f55"/></svg>';
  return s;
}

// ---- Ruler --------------------------------------------------------------
// The object sits exactly between two whole-centimetre marks, with guide
// lines dropped to the ruler, so "to the nearest cm" never needs a guess.

var EXAM_RULER_OBJECTS = {
  pencil:  { fill: '#ffcf3f', tip: true },
  crayon:  { fill: '#ff6b6b', tip: true },
  ribbon:  { fill: '#b57bff', tip: false },
  stick:   { fill: '#a0703c', tip: false },
  straw:   { fill: '#4fc3f7', tip: false },
  worm:    { fill: '#f48fb1', tip: false }
};

function examRulerSVG(v, opts) {
  var max = v.max || 15;
  var unit = opts && opts.small ? 16 : 24;
  // Extra room on the right so the "cm" label sits clear of the last number.
  var left = 16, w = left * 2 + max * unit + 22, h = 112;
  var x = function (cm) { return left + cm * unit; };
  var obj = EXAM_RULER_OBJECTS[v.object] || EXAM_RULER_OBJECTS.ribbon;
  var y0 = 18, bh = 22;
  var s = '<svg class="exam-ruler" viewBox="0 0 ' + w + ' ' + h + '" width="' + w + '" height="' + h +
          '" role="img" aria-label="ruler">';
  // the object
  var x1 = x(v.from), x2 = x(v.to);
  if (obj.tip) {
    s += '<rect x="' + x1 + '" y="' + y0 + '" width="' + Math.max(0, x2 - x1 - 14) + '" height="' + bh +
         '" rx="3" fill="' + obj.fill + '" stroke="#5b4a1c" stroke-width="1.5"/>';
    s += '<polygon points="' + (x2 - 14) + ',' + y0 + ' ' + x2 + ',' + (y0 + bh / 2) + ' ' + (x2 - 14) + ',' +
         (y0 + bh) + '" fill="#f3d9a4" stroke="#5b4a1c" stroke-width="1.5"/>';
  } else {
    s += '<rect x="' + x1 + '" y="' + y0 + '" width="' + (x2 - x1) + '" height="' + bh +
         '" rx="6" fill="' + obj.fill + '" stroke="#3b2f6b" stroke-width="1.5"/>';
  }
  // guide lines
  [x1, x2].forEach(function (gx) {
    s += '<line x1="' + gx + '" y1="' + (y0 - 4) + '" x2="' + gx + '" y2="60" stroke="#7a6b9a" stroke-width="1" stroke-dasharray="3 3"/>';
  });
  // the ruler
  s += '<rect x="4" y="60" width="' + (w - 8) + '" height="44" rx="4" fill="#fff6c8" stroke="#8a7a3c" stroke-width="1.5"/>';
  for (var c = 0; c <= max; c++) {
    s += '<line x1="' + x(c) + '" y1="60" x2="' + x(c) + '" y2="78" stroke="#3b2f1c" stroke-width="1.6"/>';
    s += '<text x="' + x(c) + '" y="96" text-anchor="middle" font-size="12" font-weight="700" fill="#3b2f1c" font-family="Quicksand, sans-serif">' + c + '</text>';
    if (c < max) {
      s += '<line x1="' + (x(c) + unit / 2) + '" y1="60" x2="' + (x(c) + unit / 2) + '" y2="70" stroke="#3b2f1c" stroke-width="1"/>';
    }
  }
  s += '<text x="' + (w - 8) + '" y="96" text-anchor="end" font-size="11" font-weight="700" fill="#3b2f1c">cm</text>';
  s += '</svg>';
  return s;
}

// ---- Shapes -------------------------------------------------------------
// The six P1 shapes, drawn upright. A square is never offered where a
// child might fairly call it a rectangle; see the maths generators.

var EXAM_SHAPE_COLORS = {
  'rectangle': '#7bb3ff', 'square': '#7bffb5', 'triangle': '#ffb36b',
  'circle': '#ff7bdb', 'half circle': '#ffd54f', 'quarter circle': '#b57bff'
};

function examShapeSVG(name, size, color) {
  var f = color || EXAM_SHAPE_COLORS[name] || '#7bb3ff';
  var st = ' fill="' + f + '" stroke="#2a1f55" stroke-width="3" stroke-linejoin="round"';
  var body = '';
  switch (name) {
    case 'rectangle':      body = '<rect x="10" y="30" width="100" height="56"' + st + '/>'; break;
    case 'square':         body = '<rect x="22" y="18" width="76" height="76"' + st + '/>'; break;
    case 'triangle':       body = '<polygon points="60,14 108,98 12,98"' + st + '/>'; break;
    case 'circle':         body = '<circle cx="60" cy="58" r="44"' + st + '/>'; break;
    case 'half circle':    body = '<path d="M14,84 A46,46 0 0 1 106,84 Z"' + st + '/>'; break;
    case 'quarter circle': body = '<path d="M24,98 L24,22 A76,76 0 0 1 100,98 Z"' + st + '/>'; break;
  }
  return '<svg class="exam-shape" viewBox="0 0 120 116" width="' + size + '" height="' + Math.round(size * 116 / 120) +
         '" role="img" aria-label="shape">' + body + '</svg>';
}

// ---- Figures made of shapes ---------------------------------------------
// Each figure is a list of primitives. examFigureCounts() counts straight
// from that list, so the answer to "how many triangles?" is whatever is
// actually drawn. No figure overlaps two shapes in a way that makes a
// third shape appear.

var EXAM_FIGURES = {
  house: [
    { s: 'triangle', pts: '20,70 100,14 180,70' },
    { s: 'square', x: 40, y: 70, w: 120, h: 120 },
    { s: 'rectangle', x: 86, y: 130, w: 28, h: 60 },
    { s: 'square', x: 52, y: 86, w: 26, h: 26 },
    { s: 'square', x: 122, y: 86, w: 26, h: 26 }
  ],
  rocket: [
    { s: 'triangle', pts: '100,10 136,64 64,64' },
    { s: 'rectangle', x: 64, y: 64, w: 72, h: 110 },
    { s: 'circle', cx: 100, cy: 104, r: 16 },
    { s: 'triangle', pts: '64,128 64,174 34,174' },
    { s: 'triangle', pts: '136,128 166,174 136,174' }
  ],
  boat: [
    { s: 'rectangle', x: 96, y: 26, w: 8, h: 102 },
    { s: 'triangle', pts: '104,32 160,110 104,110' },
    { s: 'half circle-down', cx: 100, cy: 128, r: 64 }
  ],
  tree: [
    { s: 'triangle', pts: '100,12 156,84 44,84' },
    { s: 'triangle', pts: '100,54 168,140 32,140' },
    { s: 'rectangle', x: 86, y: 140, w: 28, h: 50 }
  ],
  robot: [
    { s: 'square', x: 72, y: 12, w: 56, h: 56 },
    { s: 'circle', cx: 88, cy: 36, r: 7 },
    { s: 'circle', cx: 112, cy: 36, r: 7 },
    { s: 'rectangle', x: 60, y: 74, w: 80, h: 64 },
    { s: 'rectangle', x: 30, y: 78, w: 24, h: 52 },
    { s: 'rectangle', x: 146, y: 78, w: 24, h: 52 },
    { s: 'rectangle', x: 68, y: 144, w: 24, h: 48 },
    { s: 'rectangle', x: 108, y: 144, w: 24, h: 48 }
  ],
  // The four petals are pushed apart and the centre circle kept clear of
  // their corners. Touching, they would read as one circle cut into four,
  // and "how many circles?" would have two honest answers.
  flower: [
    { s: 'quarter circle', cx: 100, cy: 100, r: 56, rot: 0,   gap: 14 },
    { s: 'quarter circle', cx: 100, cy: 100, r: 56, rot: 90,  gap: 14 },
    { s: 'quarter circle', cx: 100, cy: 100, r: 56, rot: 180, gap: 14 },
    { s: 'quarter circle', cx: 100, cy: 100, r: 56, rot: 270, gap: 14 },
    { s: 'circle', cx: 100, cy: 100, r: 12 }
  ],
  umbrella: [
    { s: 'half circle-up', cx: 100, cy: 92, r: 76 },
    { s: 'rectangle', x: 95, y: 92, w: 10, h: 92 }
  ],
  icecream: [
    { s: 'circle', cx: 100, cy: 52, r: 34 },
    { s: 'circle', cx: 100, cy: 104, r: 34 },
    { s: 'triangle', pts: '62,124 138,124 100,196' }
  ]
};

// Primitive name -> the P1 shape name a child would give it.
function examPrimName(p) {
  if (p.s.indexOf('half circle') === 0) return 'half circle';
  return p.s;
}

function examFigureCounts(name) {
  var counts = {};
  (EXAM_FIGURES[name] || []).forEach(function (p) {
    var k = examPrimName(p);
    counts[k] = (counts[k] || 0) + 1;
  });
  return counts;
}

function examFigureSVG(name, size) {
  var parts = EXAM_FIGURES[name] || [];
  var s = '<svg class="exam-figure" viewBox="0 0 200 200" width="' + size + '" height="' + size +
          '" role="img" aria-label="figure made of shapes">';
  parts.forEach(function (p) {
    var k = examPrimName(p);
    var st = ' fill="' + (EXAM_SHAPE_COLORS[k] || '#ccc') + '" stroke="#2a1f55" stroke-width="2.5" stroke-linejoin="round"';
    if (p.s === 'triangle') s += '<polygon points="' + p.pts + '"' + st + '/>';
    else if (p.s === 'square' || p.s === 'rectangle') s += '<rect x="' + p.x + '" y="' + p.y + '" width="' + p.w + '" height="' + p.h + '"' + st + '/>';
    else if (p.s === 'circle') s += '<circle cx="' + p.cx + '" cy="' + p.cy + '" r="' + p.r + '"' + st + '/>';
    else if (p.s === 'half circle-up') s += '<path d="M' + (p.cx - p.r) + ',' + p.cy + ' A' + p.r + ',' + p.r + ' 0 0 1 ' + (p.cx + p.r) + ',' + p.cy + ' Z"' + st + '/>';
    else if (p.s === 'half circle-down') s += '<path d="M' + (p.cx - p.r) + ',' + p.cy + ' A' + p.r + ',' + p.r + ' 0 0 0 ' + (p.cx + p.r) + ',' + p.cy + ' Z"' + st + '/>';
    else if (p.s === 'quarter circle') {
      // translate runs first, in the unrotated frame, so each petal moves
      // out along its own diagonal before being turned into place.
      var g = p.gap || 0;
      s += '<path transform="rotate(' + p.rot + ' ' + p.cx + ' ' + p.cy + ') translate(' + g + ',' + (-g) + ')" d="M' + p.cx + ',' + p.cy +
           ' L' + p.cx + ',' + (p.cy - p.r) + ' A' + p.r + ',' + p.r + ' 0 0 1 ' + (p.cx + p.r) + ',' + p.cy + ' Z"' + st + '/>';
    }
  });
  return s + '</svg>';
}

// ---- Picture graph ------------------------------------------------------
// One picture stands for one thing: P1 picture graphs do not use scales.

function examPictureGraph(v) {
  var max = Math.max.apply(null, v.rows.map(function (r) { return r.count; }));
  var h = '<div class="exam-pgraph" role="img" aria-label="picture graph">';
  if (v.title) h += '<div class="exam-pgraph-title">' + v.title + '</div>';
  h += '<div class="exam-pgraph-cols">';
  v.rows.forEach(function (r) {
    h += '<div class="exam-pgraph-col"><div class="exam-pgraph-stack" style="min-height:' + (max * 26) + 'px">';
    for (var i = 0; i < r.count; i++) h += '<span>' + v.symbol + '</span>';
    h += '</div><div class="exam-pgraph-label">' + r.label + '</div></div>';
  });
  h += '</div><div class="exam-pgraph-key">Each ' + v.symbol + ' stands for 1 ' + v.unitWord + '.</div></div>';
  return h;
}

// ---- Groups, arrays and sharing -----------------------------------------

function examGroups(v) {
  var h = '<div class="exam-groups" role="img" aria-label="groups">';
  for (var g = 0; g < v.groups; g++) {
    h += '<div class="exam-group">';
    for (var i = 0; i < v.each; i++) h += '<span>' + v.icon + '</span>';
    h += '</div>';
  }
  return h + '</div>';
}

function examArray(v) {
  var h = '<div class="exam-array" role="img" aria-label="rows of objects">';
  for (var r = 0; r < v.rows; r++) {
    h += '<div class="exam-array-row">';
    for (var c = 0; c < v.cols; c++) h += '<span>' + v.icon + '</span>';
    h += '</div>';
  }
  return h + '</div>';
}

/** The things to share, and who shares them. Never pre-sorted into piles. */
function examShare(v) {
  var h = '<div class="exam-share" role="img" aria-label="things to share">';
  h += '<div class="exam-share-items">';
  for (var i = 0; i < v.total; i++) h += '<span>' + v.icon + '</span>';
  h += '</div>';
  if (v.people) {
    h += '<div class="exam-share-people">';
    for (var p = 0; p < v.people; p++) h += '<span>' + (v.personIcon || '🧒') + '</span>';
    h += '</div>';
  }
  return h + '</div>';
}

// ---- Tens and ones --------------------------------------------------------

function examBlocks(tens, ones) {
  var h = '<div class="exam-blocks" role="img" aria-label="tens and ones">';
  for (var t = 0; t < tens; t++) {
    h += '<div class="exam-rod">';
    for (var i = 0; i < 10; i++) h += '<i></i>';
    h += '</div>';
  }
  if (ones) {
    h += '<div class="exam-ones">';
    for (var o = 0; o < ones; o++) h += '<i></i>';
    h += '</div>';
  }
  return h + '</div>';
}

// ---- A row of things, for first, second, third ----------------------------

function examRow(v) {
  var h = '<div class="exam-row-wrap"><div class="exam-row-end">Left</div><div class="exam-row" role="img" aria-label="a row">';
  v.items.forEach(function (it) { h += '<span>' + it + '</span>'; });
  return h + '</div><div class="exam-row-end">Right</div></div>';
}

// ---- Number bond ------------------------------------------------------------

function examBond(v) {
  var c = function (val, x, y) {
    var txt = (val === null || val === undefined) ? '?' : val;
    return '<circle cx="' + x + '" cy="' + y + '" r="26" fill="' + (txt === '?' ? '#fff6c8' : '#fffdf5') +
           '" stroke="#3b2f6b" stroke-width="3"/><text x="' + x + '" y="' + (y + 8) +
           '" text-anchor="middle" font-size="22" font-weight="700" fill="#2a1f55" font-family="Fredoka, sans-serif">' + txt + '</text>';
  };
  return '<svg class="exam-bond" viewBox="0 0 200 150" width="200" height="150" role="img" aria-label="number bond">' +
         '<line x1="100" y1="40" x2="50" y2="110" stroke="#3b2f6b" stroke-width="3"/>' +
         '<line x1="100" y1="40" x2="150" y2="110" stroke="#3b2f6b" stroke-width="3"/>' +
         c(v.whole, 100, 34) + c(v.parts[0], 50, 112) + c(v.parts[1], 150, 112) + '</svg>';
}

// ---- Where is it? (prepositions) ----------------------------------------------
// One relation per picture, drawn so that only one preposition describes it.

function examScene(v) {
  var who = v.who || '🐱';
  var s = '<svg class="exam-scene" viewBox="0 0 240 170" width="240" height="170" role="img" aria-label="picture">';
  s += '<line x1="6" y1="150" x2="234" y2="150" stroke="#7a6b9a" stroke-width="2"/>';
  var table = '<rect x="70" y="70" width="100" height="12" rx="3" fill="#a0703c"/>' +
              '<rect x="78" y="82" width="9" height="68" fill="#8a5a2c"/><rect x="153" y="82" width="9" height="68" fill="#8a5a2c"/>';
  var box = function (x) { return '<rect x="' + x + '" y="96" width="62" height="54" fill="#d9a066" stroke="#7a4f22" stroke-width="2"/>'; };
  var emoji = function (x, y, size) {
    return '<text x="' + x + '" y="' + y + '" text-anchor="middle" font-size="' + (size || 40) + '">' + who + '</text>';
  };
  switch (v.relation) {
    case 'on':      s += table + emoji(120, 64); break;
    case 'under':   s += table + emoji(120, 140); break;
    case 'next to': s += table + emoji(206, 146); break;
    case 'in':
      s += '<rect x="86" y="92" width="68" height="58" fill="#d9a066" stroke="#7a4f22" stroke-width="2"/>' +
           emoji(120, 112, 34) +
           '<rect x="86" y="112" width="68" height="38" fill="#d9a066" stroke="#7a4f22" stroke-width="2"/>';
      break;
    case 'between': s += box(20) + box(158) + emoji(120, 146); break;
  }
  return s + '</svg>';
}

if (typeof window !== 'undefined') {
  window.examVisual = examVisual;
  window.examFigureCounts = examFigureCounts;
  window.examClockAngles = examClockAngles;
}
