#!/usr/bin/env python3
"""
Build geogames/data/shapes.json from Natural Earth 1:50m admin-0 countries.

Natural Earth is public domain. We keep only the 194 UN member states the app
knows about, simplify each ring with Douglas-Peucker, drop specks that would
never render, and quantise coordinates to 1/100 of a degree (~1.1 km) stored as
integers. That is far finer than a 900px globe can show and roughly halves the
file against plain floats.

Output shape, keyed by ISO 3166-1 alpha-2:

    { "SG": { "r": [[lon*100, lat*100, ...], ...],   # rings, flat pairs
              "b": [minLon, minLat, maxLon, maxLat], # bbox, degrees
              "c": [lon, lat],                       # visual centre
              "a": 710.0 } }                         # spherical area, 1e3 km2

Usage:  python3 tools/build-shapes.py SRC.geojson ISO_LIST.json OUT.json
"""
import json
import math
import sys

SCALE = 100          # coordinate quantisation: 1/100 degree
TOLERANCE = 0.035    # Douglas-Peucker tolerance in degrees (~4 km)
MIN_RING_FRAC = 0.0016   # drop rings smaller than this fraction of the biggest
MAX_RINGS = 60       # hard cap per country (Philippines, Indonesia, Maldives...)


# ── geometry helpers ────────────────────────────────────────────────────────
def perp_distance(p, a, b):
    """Distance from p to segment ab, in degrees (planar is fine at this scale)."""
    (px, py), (ax, ay), (bx, by) = p, a, b
    dx, dy = bx - ax, by - ay
    if dx == 0 and dy == 0:
        return math.hypot(px - ax, py - ay)
    t = max(0.0, min(1.0, ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy)))
    return math.hypot(px - (ax + t * dx), py - (ay + t * dy))


def simplify(points, tol):
    """Iterative Douglas-Peucker. Keeps first and last point."""
    if len(points) < 3:
        return points
    keep = [False] * len(points)
    keep[0] = keep[-1] = True
    stack = [(0, len(points) - 1)]
    while stack:
        lo, hi = stack.pop()
        if hi - lo < 2:
            continue
        worst, worst_i = -1.0, -1
        a, b = points[lo], points[hi]
        for i in range(lo + 1, hi):
            d = perp_distance(points[i], a, b)
            if d > worst:
                worst, worst_i = d, i
        if worst > tol:
            keep[worst_i] = True
            stack.append((lo, worst_i))
            stack.append((worst_i, hi))
    return [p for p, k in zip(points, keep) if k]


def ring_area(points):
    """Signed planar area in square degrees (only used to rank rings)."""
    s = 0.0
    n = len(points)
    for i in range(n):
        x1, y1 = points[i]
        x2, y2 = points[(i + 1) % n]
        s += x1 * y2 - x2 * y1
    return abs(s) / 2


def spherical_area(rings):
    """Approximate area in km^2 using the spherical excess of each ring."""
    R = 6371.0088
    total = 0.0
    for pts in rings:
        s = 0.0
        n = len(pts)
        for i in range(n):
            lon1, lat1 = math.radians(pts[i][0]), math.radians(pts[i][1])
            lon2, lat2 = math.radians(pts[(i + 1) % n][0]), math.radians(pts[(i + 1) % n][1])
            s += (lon2 - lon1) * (2 + math.sin(lat1) + math.sin(lat2))
        total += abs(s * R * R / 2)
    return total


def pole_of_inaccessibility(pts, steps=14):
    """
    Cheap visual centre: the point inside the ring furthest from its edges,
    found by sampling a grid over the bbox. Used for labels and camera fly-to,
    where a naive centroid lands in the sea for crescent-shaped countries.
    """
    xs = [p[0] for p in pts]
    ys = [p[1] for p in pts]
    x0, x1, y0, y1 = min(xs), max(xs), min(ys), max(ys)
    best, best_d = ((x0 + x1) / 2, (y0 + y1) / 2), -1.0
    for i in range(steps):
        for j in range(steps):
            px = x0 + (x1 - x0) * (i + 0.5) / steps
            py = y0 + (y1 - y0) * (j + 0.5) / steps
            if not point_in_ring(px, py, pts):
                continue
            d = min(perp_distance((px, py), pts[k], pts[(k + 1) % len(pts)])
                    for k in range(len(pts)))
            if d > best_d:
                best, best_d = (px, py), d
    return best


def point_in_ring(x, y, pts):
    inside = False
    n = len(pts)
    j = n - 1
    for i in range(n):
        xi, yi = pts[i]
        xj, yj = pts[j]
        if (yi > y) != (yj > y) and x < (xj - xi) * (y - yi) / (yj - yi) + xi:
            inside = not inside
        j = i
    return inside


def rings_of(geom):
    """Outer rings only. Holes (Lesotho in South Africa) are rare enough at this
    resolution that dropping them costs less than the code to render them."""
    t = geom["type"]
    if t == "Polygon":
        return [geom["coordinates"][0]]
    if t == "MultiPolygon":
        return [poly[0] for poly in geom["coordinates"]]
    return []


# ── main ────────────────────────────────────────────────────────────────────
def main():
    src, iso_list_path, out_path = sys.argv[1], sys.argv[2], sys.argv[3]
    wanted = set(json.load(open(iso_list_path)))
    data = json.load(open(src))

    by_iso = {}
    pop = {}
    for feat in data["features"]:
        props = feat["properties"]
        iso = props.get("ISO_A2_EH") or props.get("ISO_A2")
        if iso not in wanted:
            continue
        by_iso.setdefault(iso, []).extend(rings_of(feat["geometry"]))
        if props.get("POP_EST"):
            pop[iso] = int(props["POP_EST"])

    out = {}
    for iso in sorted(by_iso):
        raw = by_iso[iso]
        ranked = sorted(raw, key=ring_area, reverse=True)
        biggest = ring_area(ranked[0]) or 1e-9
        kept = [r for r in ranked[:MAX_RINGS]
                if ring_area(r) >= biggest * MIN_RING_FRAC] or ranked[:1]

        simplified = []
        for ring in kept:
            pts = [(float(x), float(y)) for x, y in ring]
            if pts[0] == pts[-1]:
                pts = pts[:-1]
            # Scale the tolerance down for small countries so Malta and
            # Singapore keep a recognisable outline.
            tol = TOLERANCE * min(1.0, max(0.12, ring_area(ring) ** 0.5 / 3))
            s = simplify(pts + [pts[0]], tol)[:-1]
            if len(s) >= 3:
                simplified.append(s)
        if not simplified:
            continue

        flat = [[int(round(v * SCALE)) for p in ring for v in p] for ring in simplified]
        xs = [p[0] for ring in simplified for p in ring]
        ys = [p[1] for ring in simplified for p in ring]
        centre = pole_of_inaccessibility(max(simplified, key=ring_area))
        out[iso] = {
            "r": flat,
            "b": [round(min(xs), 2), round(min(ys), 2), round(max(xs), 2), round(max(ys), 2)],
            "c": [round(centre[0], 2), round(centre[1], 2)],
            "a": round(spherical_area(simplified) / 1000, 1),
        }
        if iso in pop:
            out[iso]["p"] = pop[iso]

    missing = sorted(wanted - set(out))
    if missing:
        print("WARNING missing geometry:", missing, file=sys.stderr)

    with open(out_path, "w") as f:
        json.dump(out, f, separators=(",", ":"))

    pts = sum(len(r) for c in out.values() for r in c["r"]) // 2
    print(f"{len(out)} countries, {pts} points -> {out_path}")


if __name__ == "__main__":
    main()
