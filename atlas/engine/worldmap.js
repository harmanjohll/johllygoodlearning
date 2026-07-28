/* ===========================================================================
   Family Atlas — World map (Phase 2)
   The single place that touches the world SVG. Loads it once into an offscreen
   measuring container (so getBBox works), then hands games:
     - hasCountry(iso)                which countries the map can show
     - cloneCountry(iso)             a normalised silhouette  (Name the Shape)
     - buildLocateMap({...})         a zoomed, tappable map    (Map Locate)
   Everything joins on ISO 3166-1 alpha-2 (lowercase in the SVG).
   Degrades: if the fetch fails, failed() is true and the map games stand down.
   =========================================================================== */

const SVG_NS = 'http://www.w3.org/2000/svg';
const IS_ISO = /^[a-z]{2}$/;

let _promise = null;
let _master = null;         // the parsed <svg>, kept offscreen for measuring
let _measure = null;
let _baseViewBox = null;
let _available = new Set(); // lowercase isos present in the map
let _failed = false;

export function loadWorldMap() {
  if (_promise) return _promise;
  _promise = fetch('assets/world/world.svg')
    .then(r => { if (!r.ok) throw new Error('map http ' + r.status); return r.text(); })
    .then(txt => {
      const doc = new DOMParser().parseFromString(txt, 'image/svg+xml');
      const svg = doc.querySelector('svg');
      if (!svg || doc.querySelector('parsererror')) throw new Error('map parse failed');
      _master = document.importNode(svg, true);
      _baseViewBox = _master.getAttribute('viewBox') || '0 0 1000 500';
      _measure = document.createElement('div');
      _measure.setAttribute('style', 'position:absolute;left:-99999px;top:0;width:0;height:0;overflow:hidden;');
      _measure.appendChild(_master);
      document.body.appendChild(_measure);
      _master.querySelectorAll('[id]').forEach(n => {
        const id = n.getAttribute('id');
        if (IS_ISO.test(id)) _available.add(id);
      });
    })
    .catch(e => { _failed = true; console.warn('World map unavailable:', e.message); });
  return _promise;
}

export function ready() { return loadWorldMap(); }
export function isReady() { return !!_master && !_failed; }
export function failed() { return _failed; }
export function hasCountry(iso) { return _available.has(String(iso).toLowerCase()); }
export function availableIsos() { return _available; }

function elFor(iso) {
  return _master ? _master.querySelector('[id="' + String(iso).toLowerCase() + '"]') : null;
}

/** Union bounding box (in SVG units) of the given countries, or null. */
export function unionBBox(isos) {
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity, any = false;
  isos.forEach(iso => {
    const el = elFor(iso);
    if (!el) return;
    let b; try { b = el.getBBox(); } catch { return; }
    if (!b || (!b.width && !b.height)) return;
    any = true;
    x0 = Math.min(x0, b.x); y0 = Math.min(y0, b.y);
    x1 = Math.max(x1, b.x + b.width); y1 = Math.max(y1, b.y + b.height);
  });
  return any ? { x: x0, y: y0, w: x1 - x0, h: y1 - y0 } : null;
}

function paddedViewBox(bb, ratio) {
  const p = Math.max(bb.w, bb.h) * ratio;
  return `${bb.x - p} ${bb.y - p} ${bb.w + 2 * p} ${bb.h + 2 * p}`;
}

/**
 * A viewBox that frames a region nicely. Uses only the "normal-sized" countries
 * to set the frame, so a single sprawling member (Russia across Asia, or a
 * country carrying distant overseas territories like French Guiana / Svalbard /
 * the Canaries) doesn't blow the zoom out to the whole world. Outliers are still
 * drawn and tappable; they just don't dictate the frame.
 */
export function regionViewBox(isos, pad = 0.16) {
  const boxes = [];
  isos.forEach(iso => {
    const el = elFor(iso);
    if (!el) return;
    let b; try { b = el.getBBox(); } catch { return; }
    if (b && (b.width || b.height)) boxes.push(b);
  });
  if (!boxes.length) return null;
  const dims = boxes.map(b => Math.max(b.width, b.height)).sort((a, b) => a - b);
  const median = dims[Math.floor(dims.length / 2)];
  let keep = boxes.filter(b => Math.max(b.width, b.height) <= 2.5 * median);
  if (keep.length < 3) keep = boxes;
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  keep.forEach(b => { x0 = Math.min(x0, b.x); y0 = Math.min(y0, b.y); x1 = Math.max(x1, b.x + b.width); y1 = Math.max(y1, b.y + b.height); });
  return paddedViewBox({ x: x0, y: y0, w: x1 - x0, h: y1 - y0 }, pad);
}

/** A normalised silhouette <svg> for one country (or null if not on the map). */
export function cloneCountry(iso) {
  const el = elFor(iso);
  if (!el) return null;
  let bb; try { bb = el.getBBox(); } catch { return null; }
  if (!bb || (!bb.width && !bb.height)) return null;
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('class', 'silhouette');
  svg.setAttribute('data-iso', String(iso).toUpperCase());
  svg.setAttribute('viewBox', paddedViewBox({ x: bb.x, y: bb.y, w: bb.width, h: bb.height }, 0.14));
  svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
  const clone = el.cloneNode(true);
  clone.removeAttribute('id');
  clone.setAttribute('class', 'silhouette-shape');
  svg.appendChild(clone);
  return svg;
}

/**
 * A map <svg>, optionally zoomed to a set of countries and made tappable.
 * @param {object} o
 * @param {string[]} [o.focusIsos]   zoom the viewBox to these (else whole world)
 * @param {string[]} [o.interactive] isos that respond to hover/tap
 * @param {object}  [o.paint]        { iso: cssColor } fixed fills (passport map)
 * @param {function}[o.onPick]       called with the tapped iso (lowercase)
 */
export function buildLocateMap({ focusIsos, interactive, paint, onPick } = {}) {
  if (!_master) return null;
  const svg = _master.cloneNode(true);
  svg.setAttribute('class', 'wm');
  svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
  // The source SVG carries width/height attributes; they'd dictate layout aspect
  // and defeat a zoomed viewBox, so strip them and let the viewBox govern.
  svg.removeAttribute('width');
  svg.removeAttribute('height');
  let vb = _baseViewBox;
  if (focusIsos && focusIsos.length) {
    const zoom = regionViewBox(focusIsos, 0.16);
    if (zoom) vb = zoom;
  }
  svg.setAttribute('viewBox', vb);

  const interSet = new Set((interactive || []).map(s => s.toLowerCase()));
  const paintMap = paint || {};
  svg.querySelectorAll('[id]').forEach(n => {
    const id = n.getAttribute('id');
    if (!IS_ISO.test(id)) { n.setAttribute('class', 'wm-land wm-other'); return; }
    let cls = 'wm-land';
    if (interSet.has(id)) cls += ' wm-interactive';
    if (paintMap[id]) { n.style.fill = paintMap[id]; cls += ' wm-painted'; }
    n.setAttribute('class', cls);
  });

  if (onPick) {
    svg.addEventListener('click', (e) => {
      const t = e.target.closest ? e.target.closest('[id]') : null;
      if (!t) return;
      const id = t.getAttribute('id');
      if (IS_ISO.test(id) && interSet.has(id)) onPick(id);
    });
  }
  return svg;
}

/** Add a state class (is-correct / is-wrong / wm-hint) to a country on a built map. */
export function markCountry(svg, iso, cls) {
  const el = svg.querySelector('[id="' + String(iso).toLowerCase() + '"]');
  if (el) el.classList.add(cls);
  return el;
}
