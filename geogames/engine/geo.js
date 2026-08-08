/* ===========================================================================
   GeoGames - Geometry engine

   Everything spatial lives here: decoding the packed shape data, the two map
   projections, the rotation maths for the globe, hit testing and distance.
   Nothing in this file touches the DOM, so it can be reasoned about (and
   broken) on its own.

   Coordinate conventions used throughout:
     - lon/lat are degrees, lon east-positive, lat north-positive
     - sphere space is a unit sphere with
           x = cos(lat) sin(lon)      (east)
           y = sin(lat)               (north)
           z = cos(lat) cos(lon)      (towards the viewer at lon 0, lat 0)
       so a point is on the near face of the globe exactly when z > 0
     - screen space is canvas pixels, y down
   =========================================================================== */

const DEG = Math.PI / 180;
export const EARTH_RADIUS_KM = 6371.0088;

/* ── decoding ─────────────────────────────────────────────────────────────
   shapes.json stores rings as flat integer arrays of lon*100, lat*100. We
   expand each ring once into two parallel typed arrays: the lon/lat pairs (for
   hit tests and the flat map) and the unit-sphere xyz triples (for the globe).
   Doing this up front means a globe frame is just a matrix multiply per point.
*/
export function prepareShapes(raw) {
  const countries = {};
  for (const iso in raw) {
    const src = raw[iso];
    const rings = src.r.map(flat => {
      const n = flat.length / 2;
      const ll = new Float64Array(flat.length);
      const xyz = new Float64Array(n * 3);
      let minLon = Infinity, minLat = Infinity, maxLon = -Infinity, maxLat = -Infinity;
      for (let i = 0; i < n; i++) {
        const lon = flat[i * 2] / 100;
        const lat = flat[i * 2 + 1] / 100;
        ll[i * 2] = lon; ll[i * 2 + 1] = lat;
        const cl = Math.cos(lat * DEG);
        xyz[i * 3] = cl * Math.sin(lon * DEG);
        xyz[i * 3 + 1] = Math.sin(lat * DEG);
        xyz[i * 3 + 2] = cl * Math.cos(lon * DEG);
        if (lon < minLon) minLon = lon;
        if (lon > maxLon) maxLon = lon;
        if (lat < minLat) minLat = lat;
        if (lat > maxLat) maxLat = lat;
      }
      return { n, ll, xyz, bbox: [minLon, minLat, maxLon, maxLat] };
    });
    // Biggest ring first: the outline game and the label placement both want
    // the mainland, not whichever island happened to be listed first.
    rings.sort((a, b) => ringSpan(b) - ringSpan(a));

    // Angular radius: the furthest any point of the country sits from its own
    // centre, as an angle at the Earth's core. The globe uses it to reject far
    // side countries without touching their points. A bounding box cannot do
    // this job, because Russia, Fiji, Kiribati and New Zealand all have boxes
    // that span the whole planet once they cross the antimeridian.
    const cl = Math.cos(src.c[1] * DEG);
    const c0 = cl * Math.sin(src.c[0] * DEG);
    const c1 = Math.sin(src.c[1] * DEG);
    const c2 = cl * Math.cos(src.c[0] * DEG);
    let minDot = 1;
    for (const r of rings) {
      for (let i = 0; i < r.n; i++) {
        const d = c0 * r.xyz[i * 3] + c1 * r.xyz[i * 3 + 1] + c2 * r.xyz[i * 3 + 2];
        if (d < minDot) minDot = d;
      }
    }
    const angularRadius = Math.acos(Math.max(-1, Math.min(1, minDot)));

    countries[iso] = {
      iso, rings, bbox: src.b, centre: src.c, area: src.a,
      angularRadius,
      sinRadius: Math.sin(Math.min(Math.PI / 2, angularRadius)),
      unit: [c0, c1, c2],
    };
  }
  return countries;
}

function ringSpan(r) {
  return (r.bbox[2] - r.bbox[0]) * (r.bbox[3] - r.bbox[1]);
}

/* ── great-circle distance ──────────────────────────────────────────────── */
export function haversineKm(lon1, lat1, lon2, lat2) {
  const dLat = (lat2 - lat1) * DEG;
  const dLon = (lon2 - lon1) * DEG;
  const a = Math.sin(dLat / 2) ** 2 +
            Math.cos(lat1 * DEG) * Math.cos(lat2 * DEG) * Math.sin(dLon / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.min(1, Math.sqrt(a)));
}

/* Shortest signed difference between two longitudes, in degrees. */
export function lonDelta(a, b) {
  let d = (b - a) % 360;
  if (d > 180) d -= 360;
  if (d < -180) d += 360;
  return d;
}

/* ── point in ring, in lon/lat space ─────────────────────────────────────
   Safe here because Natural Earth splits every polygon at the antimeridian, so
   no single ring spans more than 180 degrees of longitude (asserted at build
   time). Rings are tested against their own bbox first, which rejects almost
   everything for almost every click.
*/
export function pointInRing(lon, lat, ring) {
  const b = ring.bbox;
  if (lat < b[1] || lat > b[3] || lon < b[0] || lon > b[2]) return false;
  const { ll, n } = ring;
  let inside = false;
  for (let i = 0, j = n - 1; i < n; j = i++) {
    const yi = ll[i * 2 + 1], yj = ll[j * 2 + 1];
    if ((yi > lat) !== (yj > lat)) {
      const xi = ll[i * 2], xj = ll[j * 2];
      if (lon < (xj - xi) * (lat - yi) / (yj - yi) + xi) inside = !inside;
    }
  }
  return inside;
}

export function countryAt(countries, lon, lat, only) {
  const list = only || Object.keys(countries);
  for (const iso of list) {
    const c = countries[iso];
    if (!c) continue;
    for (const ring of c.rings) if (pointInRing(lon, lat, ring)) return iso;
  }
  return null;
}

/* Nearest country centre, used when a tap lands in the sea so that "close but
   in the water" still reads as an attempt rather than a dead click. */
export function nearestCountry(countries, lon, lat, only) {
  const list = only || Object.keys(countries);
  let best = null, bestKm = Infinity;
  for (const iso of list) {
    const c = countries[iso];
    if (!c) continue;
    const km = haversineKm(lon, lat, c.centre[0], c.centre[1]);
    if (km < bestKm) { bestKm = km; best = iso; }
  }
  return { iso: best, km: bestKm };
}

/* ═══════════════════════════════════════════════════════════════════════════
   ORTHOGRAPHIC GLOBE
   ═══════════════════════════════════════════════════════════════════════════ */

export class Globe {
  constructor() {
    this.lambda = 10;   // centre longitude, degrees
    this.phi = 20;      // centre latitude, degrees
    this.radius = 200;  // px
    this.cx = 0;
    this.cy = 0;
    this.m = new Float64Array(9);
    this.updateMatrix();
  }

  /* M = Rx(phi) . Ry(-lambda), so that (lambda, phi) lands at the centre of
     the disc facing the viewer. Stored row-major. */
  updateMatrix() {
    const a = -this.lambda * DEG, b = this.phi * DEG;
    const ca = Math.cos(a), sa = Math.sin(a);
    const cb = Math.cos(b), sb = Math.sin(b);
    const m = this.m;
    m[0] = ca;       m[1] = 0;   m[2] = sa;
    m[3] = sb * sa;  m[4] = cb;  m[5] = -sb * ca;
    m[6] = -cb * sa; m[7] = sb;  m[8] = cb * ca;
  }

  set(lambda, phi) {
    this.lambda = ((lambda + 180) % 360 + 360) % 360 - 180;
    this.phi = Math.max(-89.9, Math.min(89.9, phi));
    this.updateMatrix();
  }

  /* Project a lon/lat straight to screen. Returns null when it is round the
     back, so callers can skip markers rather than drawing them mirrored. */
  project(lon, lat) {
    const cl = Math.cos(lat * DEG);
    const x = cl * Math.sin(lon * DEG);
    const y = Math.sin(lat * DEG);
    const z = cl * Math.cos(lon * DEG);
    const m = this.m;
    const rz = m[6] * x + m[7] * y + m[8] * z;
    if (rz <= 0) return null;
    const rx = m[0] * x + m[1] * y + m[2] * z;
    const ry = m[3] * x + m[4] * y + m[5] * z;
    return [this.cx + this.radius * rx, this.cy - this.radius * ry, rz];
  }

  /* Screen point to lon/lat. Returns null outside the disc. */
  invert(sx, sy) {
    const x = (sx - this.cx) / this.radius;
    const y = (this.cy - sy) / this.radius;
    const r2 = x * x + y * y;
    if (r2 > 1) return null;
    const z = Math.sqrt(1 - r2);
    const m = this.m;                     // rotation, so inverse == transpose
    const ux = m[0] * x + m[3] * y + m[6] * z;
    const uy = m[1] * x + m[4] * y + m[7] * z;
    const uz = m[2] * x + m[5] * y + m[8] * z;
    return [Math.atan2(ux, uz) / DEG, Math.asin(Math.max(-1, Math.min(1, uy))) / DEG];
  }

  /* Is this lon/lat on the near face at all? Cheaper than project(). */
  visible(lon, lat) {
    const cl = Math.cos(lat * DEG);
    const m = this.m;
    return m[6] * cl * Math.sin(lon * DEG) +
           m[7] * Math.sin(lat * DEG) +
           m[8] * cl * Math.cos(lon * DEG) > 0;
  }

  /* Conservative rejection test, so we skip whole countries on the far side
     without touching their points. The country's centre sits at angle acos(rz)
     from the point facing us; nothing of it can reach the near face unless
     that angle is within 90 degrees plus the country's own angular radius. */
  mayBeVisible(country) {
    const m = this.m, u = country.unit;
    const rz = m[6] * u[0] + m[7] * u[1] + m[8] * u[2];
    return rz > -country.sinRadius - 1e-9;
  }

  /* ── the interesting bit: filling a ring that runs off the edge ──────────
     Points on the near face project into the disc; points round the back must
     be dropped. Cutting a ring leaves it open, and closing it with a straight
     chord would slice a visible flat edge across a curved horizon. So each gap
     is closed along the limb itself, which in this projection is exactly a
     circle on screen, i.e. one ctx.arc call.

     Choosing which way round the limb to travel is the subtle part. Both arcs
     connect the same two points; only one of them traces where the hidden part
     of the country actually went. We pick by unprojecting the midpoint of the
     candidate arc and asking whether that spot on the far side lies inside the
     ring. */
  traceRing(ctx, ring) {
    const { n, xyz, ll } = ring;
    const m = this.m, R = this.radius, cx = this.cx, cy = this.cy;

    // First pass: rotated coordinates, and how many points face us.
    let visibleCount = 0;
    const rx = this._bufX = growTo(this._bufX, n);
    const ry = this._bufY = growTo(this._bufY, n);
    const rz = this._bufZ = growTo(this._bufZ, n);
    for (let i = 0; i < n; i++) {
      const x = xyz[i * 3], y = xyz[i * 3 + 1], z = xyz[i * 3 + 2];
      rx[i] = m[0] * x + m[1] * y + m[2] * z;
      ry[i] = m[3] * x + m[4] * y + m[5] * z;
      rz[i] = m[6] * x + m[7] * y + m[8] * z;
      if (rz[i] > 0) visibleCount++;
    }
    if (visibleCount === 0) return false;

    if (visibleCount === n) {
      ctx.moveTo(cx + R * rx[0], cy - R * ry[0]);
      for (let i = 1; i < n; i++) ctx.lineTo(cx + R * rx[i], cy - R * ry[i]);
      ctx.closePath();
      return true;
    }

    // Walk the ring, emitting each run of visible points and stitching the
    // gaps along the limb. Start on a hidden point so the first run we meet is
    // a genuine entry, not the tail of a run we already missed.
    let start = 0;
    while (start < n && rz[start] > 0) start++;
    let open = false, firstAngle = 0, lastAngle = 0;
    for (let k = 0; k <= n; k++) {
      const i = (start + k) % n;
      const prev = (start + k - 1 + n) % n;
      const vis = rz[i] > 0;
      const wasVis = k > 0 && rz[prev] > 0;

      if (vis && !wasVis) {
        const p = limbCross(rx, ry, rz, prev, i, R, cx, cy);
        if (!open) { ctx.moveTo(p.sx, p.sy); firstAngle = p.angle; open = true; }
        else { this._limbArc(ctx, lastAngle, p.angle, ring); ctx.lineTo(p.sx, p.sy); }
        ctx.lineTo(cx + R * rx[i], cy - R * ry[i]);
      } else if (vis) {
        ctx.lineTo(cx + R * rx[i], cy - R * ry[i]);
      } else if (!vis && wasVis) {
        const p = limbCross(rx, ry, rz, i, prev, R, cx, cy);
        ctx.lineTo(p.sx, p.sy);
        lastAngle = p.angle;
      }
    }
    if (open) {
      this._limbArc(ctx, lastAngle, firstAngle, ring);
      ctx.closePath();
    }
    return true;
  }

  _limbArc(ctx, from, to, ring) {
    // Candidate A: anticlockwise in screen terms (canvas angles run clockwise
    // because y is flipped, hence the inverted flag below).
    let delta = to - from;
    while (delta <= -Math.PI) delta += 2 * Math.PI;
    while (delta > Math.PI) delta -= 2 * Math.PI;
    const mid = from + delta / 2;
    const ll = this.invert(this.cx + this.radius * Math.cos(mid) * 0.9999,
                           this.cy + this.radius * Math.sin(mid) * 0.9999);
    // The limb midpoint sits on the terminator; nudge it a hair round the back
    // by testing the ring itself. If the short way does not pass through the
    // country, take the long way.
    let counter = delta < 0;
    if (ll && !pointInRing(ll[0], ll[1], ring)) {
      const other = mid + Math.PI;
      const ll2 = this.invert(this.cx + this.radius * Math.cos(other) * 0.9999,
                              this.cy + this.radius * Math.sin(other) * 0.9999);
      if (ll2 && pointInRing(ll2[0], ll2[1], ring)) counter = !counter;
    }
    ctx.arc(this.cx, this.cy, this.radius, from, to, counter);
  }
}

function growTo(buf, n) {
  return buf && buf.length >= n ? buf : new Float64Array(Math.max(n, 1024));
}

/* Where the segment a->b crosses the horizon plane z = 0, snapped onto the
   limb circle so consecutive stitches meet exactly. */
function limbCross(rx, ry, rz, a, b, R, cx, cy) {
  const t = rz[a] / (rz[a] - rz[b]);
  let x = rx[a] + (rx[b] - rx[a]) * t;
  let y = ry[a] + (ry[b] - ry[a]) * t;
  const len = Math.hypot(x, y) || 1;
  x /= len; y /= len;
  return { sx: cx + R * x, sy: cy - R * y, angle: Math.atan2(-y, x) };
}

/* ═══════════════════════════════════════════════════════════════════════════
   EQUAL EARTH - the flat map
   Savric, Patterson & Jenny (2018). Equal-area, so no Greenland problem, and
   closed-form so it is cheap to evaluate per point.
   ═══════════════════════════════════════════════════════════════════════════ */

const A1 = 1.340264, A2 = -0.081106, A3 = 0.000893, A4 = 0.003796;
const M_SQRT3_2 = Math.sqrt(3) / 2;

export function equalEarth(lon, lat) {
  const th = Math.asin(M_SQRT3_2 * Math.sin(lat * DEG));
  const t2 = th * th, t6 = t2 * t2 * t2;
  return [
    (lon * DEG) * Math.cos(th) / (M_SQRT3_2 * (A1 + 3 * A2 * t2 + t6 * (7 * A3 + 9 * A4 * t2))),
    th * (A1 + A2 * t2 + t6 * (A3 + A4 * t2)),
  ];
}

/* Extent of the projection in its own units, used to fit the map to a canvas. */
export const EQUAL_EARTH_EXTENT = (() => {
  const [x] = equalEarth(180, 0);
  const [, y] = equalEarth(0, 90);
  return { x, y };
})();

export class FlatMap {
  constructor() {
    this.scale = 1;      // px per projection unit
    this.cx = 0;
    this.cy = 0;
    this.zoom = 1;
    this.panX = 0;
    this.panY = 0;
  }

  fit(width, height, pad = 8) {
    // Guarded the same way as the globe: a container measured before layout is
    // 0x0, and a negative scale mirrors the whole world.
    this.scale = Math.max(0.5, Math.min((width - pad * 2) / (EQUAL_EARTH_EXTENT.x * 2),
                                        (height - pad * 2) / (EQUAL_EARTH_EXTENT.y * 2)));
    this.cx = width / 2;
    this.cy = height / 2;
  }

  project(lon, lat) {
    const [x, y] = equalEarth(lon, lat);
    return [
      this.cx + (x * this.scale * this.zoom) + this.panX,
      this.cy - (y * this.scale * this.zoom) + this.panY,
    ];
  }

  /* Newton's method on the forward projection. Six iterations is plenty at any
     zoom a screen can show, and this only runs on click, never per frame. */
  invert(sx, sy) {
    const x = (sx - this.cx - this.panX) / (this.scale * this.zoom);
    const y = (this.cy - sy + this.panY) / (this.scale * this.zoom);
    let th = y;
    for (let i = 0; i < 12; i++) {
      const t2 = th * th, t6 = t2 * t2 * t2;
      const f = th * (A1 + A2 * t2 + t6 * (A3 + A4 * t2)) - y;
      const fp = A1 + 3 * A2 * t2 + t6 * (7 * A3 + 9 * A4 * t2);
      const d = f / fp;
      th -= d;
      if (Math.abs(d) < 1e-12) break;
    }
    const t2 = th * th, t6 = t2 * t2 * t2;
    const lon = M_SQRT3_2 * x * (A1 + 3 * A2 * t2 + t6 * (7 * A3 + 9 * A4 * t2)) / Math.cos(th);
    const s = Math.sin(th) / M_SQRT3_2;
    if (Math.abs(s) > 1) return null;
    const lat = Math.asin(s) / DEG;
    const lonDeg = lon / DEG;
    if (lonDeg < -181 || lonDeg > 181) return null;
    return [Math.max(-180, Math.min(180, lonDeg)), lat];
  }

  traceRing(ctx, ring) {
    const { n, ll } = ring;
    let p = this.project(ll[0], ll[1]);
    ctx.moveTo(p[0], p[1]);
    for (let i = 1; i < n; i++) {
      p = this.project(ll[i * 2], ll[i * 2 + 1]);
      ctx.lineTo(p[0], p[1]);
    }
    ctx.closePath();
    return true;
  }
}

/* ═══════════════════════════════════════════════════════════════════════════
   SILHOUETTE - one country, fitted to a box, for the outline game
   ═══════════════════════════════════════════════════════════════════════════ */

/* Countries are drawn on a gnomonic-ish local tangent plane centred on the
   country itself, which keeps Chile from bending and Russia from smearing the
   way an equirectangular crop would. Rings come back in unit box coordinates
   so the caller can scale, rotate and mirror them freely. */
export function silhouettePaths(country, { rotate = 0, mirror = false } = {}) {
  const [clon, clat] = country.centre;
  const cosC = Math.cos(clat * DEG), sinC = Math.sin(clat * DEG);
  const rings = [];
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

  for (const ring of country.rings) {
    const pts = new Float64Array(ring.n * 2);
    for (let i = 0; i < ring.n; i++) {
      const lon = ring.ll[i * 2], lat = ring.ll[i * 2 + 1];
      const dl = lonDelta(clon, lon) * DEG;
      const la = lat * DEG;
      // Azimuthal equidistant about the country's own centre.
      const cosc = sinC * Math.sin(la) + cosC * Math.cos(la) * Math.cos(dl);
      const c = Math.acos(Math.max(-1, Math.min(1, cosc)));
      const k = c === 0 ? 1 : c / Math.sin(c);
      const x = k * Math.cos(la) * Math.sin(dl);
      const y = k * (cosC * Math.sin(la) - sinC * Math.cos(la) * Math.cos(dl));
      pts[i * 2] = x; pts[i * 2 + 1] = -y;
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (-y < minY) minY = -y;
      if (-y > maxY) maxY = -y;
    }
    rings.push(pts);
  }

  const w = maxX - minX || 1, h = maxY - minY || 1;
  const s = 1 / Math.max(w, h);
  const ox = (1 - w * s) / 2 - minX * s;
  const oy = (1 - h * s) / 2 - minY * s;
  const cosR = Math.cos(rotate), sinR = Math.sin(rotate);

  for (const pts of rings) {
    for (let i = 0; i < pts.length; i += 2) {
      let x = pts[i] * s + ox - 0.5;
      let y = pts[i + 1] * s + oy - 0.5;
      if (mirror) x = -x;
      pts[i] = (x * cosR - y * sinR) + 0.5;
      pts[i + 1] = (x * sinR + y * cosR) + 0.5;
    }
  }
  return rings;
}
