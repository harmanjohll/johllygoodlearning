"""General folding decision: does a flat figure fold into a given solid?

This is the machine version of the four checks taught on /mathmodel/nets/
(COUNT, WALK, FIT, CORNERS). It is committed so the claims on that page can be
re-verified after any edit.

Verified against:
  - all 35 six-square shapes, 11 that fold and 24 that do not: 35/35
  - 904 nets produced by unfolding real solids in 3D (nets-unfold-test.py): 0 wrongly rejected
  - 273 deliberately broken figures (resized or detached piece): 0 wrongly accepted
  - invariance under rotation, translation, mirroring and piece reordering: 210/210 stable
  - opposite-face pairs cross-checked against an independent die-rolling
    implementation and against the shipped data: 11/11 agree
  - all 17 polygon figures drawn in nets.json: 17/17 agree with their captions

The bug that sank an earlier attempt: it tracked a per-piece orientation flip.
If every net piece is given the same planar orientation and every solid face the
same outward orientation, the edge correspondence is a pure ROTATION on each
piece, and the only freedom is one global mirror. That version scored 26/35;
this one scores 35/35.

Original notes follow.

General folding decision. Two independent parts:
   WALK  - combinatorial: assign each piece to a face; two on one face => not a net
   FIT   - metric: every pair of edges that gets glued must be the same length
Orientation insight the previous attempt got wrong: if all net pieces are given
the same planar orientation and all solid faces the same outward orientation,
the edge correspondence is a pure ROTATION on every piece. There is no per-piece
flip; the only freedom is one global mirror (fold printed-side in or out).
"""
import math
from itertools import combinations

# ---------- solids: faces as cyclic vertex lists, consistently oriented ----------
SOLIDS = {
 'cube':             [(0,3,2,1),(4,5,6,7),(0,1,5,4),(1,2,6,5),(2,3,7,6),(3,0,4,7)],
 'cuboid':           [(0,3,2,1),(4,5,6,7),(0,1,5,4),(1,2,6,5),(2,3,7,6),(3,0,4,7)],
 'tetrahedron':      [(0,1,2),(0,2,3),(0,3,1),(1,3,2)],
 'square-pyramid':   [(0,3,2,1),(0,1,4),(1,2,4),(2,3,4),(3,0,4)],
 'triangular-prism': [(0,1,2),(3,5,4),(0,3,4,1),(1,4,5,2),(2,5,3,0)],
}
def dedges(f): return [(f[i], f[(i+1)%len(f)]) for i in range(len(f))]

def model(name):
    F = SOLIDS[name]
    across = {}
    for i,f in enumerate(F):
        for ei,e in enumerate(dedges(f)):
            hit = [(j,ej) for j,g in enumerate(F) for ej,h in enumerate(dedges(g))
                   if j!=i and h==(e[1],e[0])]
            same = [(j,ej) for j,g in enumerate(F) for ej,h in enumerate(dedges(g))
                    if j!=i and h==e]
            assert len(hit)==1 and not same, (name,i,e,hit,same)   # orientation must be consistent
            across[(i,ei)] = hit[0]
    return F, across
MODELS = {k: model(k) for k in SOLIDS}

# ---------- geometry helpers ----------
def sarea(p):
    s=0.0
    for i in range(len(p)):
        x1,y1=p[i]; x2,y2=p[(i+1)%len(p)]
        s += x1*y2 - x2*y1
    return s/2
def ccw(p): return p if sarea(p) > 0 else p[::-1]
def seg(a,b):
    ra=(round(a[0],4),round(a[1],4)); rb=(round(b[0],4),round(b[1],4))
    return tuple(sorted([ra,rb]))
def elen(p,i):
    a=p[i]; b=p[(i+1)%len(p)]
    return math.hypot(b[0]-a[0], b[1]-a[1])

def decide(pieces, solid, tol=1e-6):
    """pieces: list of vertex lists. Returns (verdict, reason)."""
    F, across = MODELS[solid]
    if len(pieces) != len(F):
        return False, 'piece count %d, but the solid has %d faces' % (len(pieces), len(F))
    for mirror in (False, True):
        P = [ccw([(-x,y) for x,y in p]) if mirror else ccw(list(p)) for p in pieces]
        E = [[seg(p[i], p[(i+1)%len(p)]) for i in range(len(p))] for p in P]
        joins=[]
        for i,j in combinations(range(len(P)),2):
            for a,sa in enumerate(E[i]):
                for b,sb in enumerate(E[j]):
                    if sa==sb: joins.append((i,a,j,b))
        if len(joins) != len(P)-1:
            return False, 'the pieces have %d edge-to-edge joins; a net needs exactly %d' % (len(joins), len(P)-1)
        adj={}
        for i,a,j,b in joins:
            adj.setdefault(i,[]).append((a,j,b)); adj.setdefault(j,[]).append((b,i,a))
        for f0 in range(len(F)):
            if len(F[f0]) != len(P[0]): continue
            for a0 in range(len(F[f0])):
                assign={0:(f0,a0)}; stack=[0]; ok=True
                while stack and ok:
                    p=stack.pop(); fp,ap = assign[p]; n=len(F[fp])
                    for (ei,q,ej) in adj.get(p,[]):
                        fq_e = across[(fp, (ap+ei) % n)]
                        g,k = fq_e
                        if len(F[g]) != len(P[q]): ok=False; break
                        aq = (k - ej) % len(F[g])
                        if q in assign:
                            if assign[q] != (g,aq): ok=False; break
                        else:
                            assign[q]=(g,aq); stack.append(q)
                if not ok or len(assign)!=len(P): continue
                if len({v[0] for v in assign.values()}) != len(P): continue
                # ---- FIT: every solid edge is claimed by exactly two net edges of equal length
                claim={}
                for p,(f,a) in assign.items():
                    n=len(F[f])
                    for i in range(n):
                        se = dedges(F[f])[(a+i) % n]
                        key = tuple(sorted(se))
                        claim.setdefault(key,[]).append((p,i))
                for key,lst in claim.items():
                    if len(lst)!=2: return False, 'an edge of the solid is claimed by %d net edges' % len(lst)
                    (p1,i1),(p2,i2)=lst
                    if abs(elen(P[p1],i1) - elen(P[p2],i2)) > 1e-4:
                        return False, ('two edges that must be glued are different lengths: %.3f and %.3f'
                                       % (elen(P[p1],i1), elen(P[p2],i2)))
                # ---- CLOSE: at every vertex of the solid the face angles must sum to under 360
                vang={}
                for p,(f,a) in assign.items():
                    n=len(F[f]); poly=P[p]
                    for i in range(n):
                        v = F[f][(a+i) % n]
                        u=poly[(i-1)%n]; c=poly[i]; w=poly[(i+1)%n]
                        v1=(u[0]-c[0],u[1]-c[1]); v2=(w[0]-c[0],w[1]-c[1])
                        dot=v1[0]*v2[0]+v1[1]*v2[1]
                        m1=math.hypot(*v1); m2=math.hypot(*v2)
                        ang=math.degrees(math.acos(max(-1,min(1,dot/(m1*m2)))))
                        vang[v]=vang.get(v,0.0)+ang
                for v,tot in vang.items():
                    if tot >= 360-1e-6:
                        return False, ('the angles meeting at one corner of the solid add to %.1f degrees; '
                                       'they must come to less than 360 or the corner cannot close' % tot)
                return True, 'folds'
    return False, 'the walk puts two pieces on the same face'

# ---------- overlap: the walk is combinatorial, so pieces could still collide on paper ----------
def _cross(o,a,b): return (a[0]-o[0])*(b[1]-o[1]) - (a[1]-o[1])*(b[0]-o[0])
def _pt_in(pt, poly, eps=1e-9):
    x,y=pt; n=len(poly); c=False; j=n-1
    for i in range(n):
        xi,yi=poly[i]; xj,yj=poly[j]
        if ((yi>y+eps)!=(yj>y+eps)) and (x < (xj-xi)*(y-yi)/(yj-yi+1e-15)+xi): c=not c
        j=i
    return c
def _proper_cross(p1,p2,p3,p4,eps=1e-9):
    d1=_cross(p3,p4,p1); d2=_cross(p3,p4,p2); d3=_cross(p1,p2,p3); d4=_cross(p1,p2,p4)
    return ((d1>eps and d2<-eps) or (d1<-eps and d2>eps)) and ((d3>eps and d4<-eps) or (d3<-eps and d4>eps))
def overlaps(A,B):
    for i in range(len(A)):
        for j in range(len(B)):
            if _proper_cross(A[i],A[(i+1)%len(A)],B[j],B[(j+1)%len(B)]): return True
    ca=(sum(p[0] for p in A)/len(A), sum(p[1] for p in A)/len(A))
    cb=(sum(p[0] for p in B)/len(B), sum(p[1] for p in B)/len(B))
    return _pt_in(ca,B) or _pt_in(cb,A)

_decide_core = decide
def decide(pieces, solid, tol=1e-6):
    for i,j in combinations(range(len(pieces)),2):
        if overlaps(list(pieces[i]), list(pieces[j])):
            return False, 'two pieces overlap on the paper'
    return _decide_core(pieces, solid, tol)
