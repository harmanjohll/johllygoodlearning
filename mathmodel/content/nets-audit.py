"""Structural audit of the hand-drawn net diagrams in nets.json (otherSolids).

For each drawn figure it checks: the number of pieces against the solid's face
count, that the pieces are joined edge to edge rather than only at a corner,
that the number of joins is exactly pieces minus one (what a net requires), and
that no two pieces overlap.

Run with `python3 nets-audit.py` from this directory. Standard library only.

Every flag it still raises is the intended failure of that diagram: a piece
count that is deliberately wrong, or edges that deliberately do not match. A
clean run means every picture shows what its caption says it shows.
"""

import json, math, os
from itertools import combinations
d=json.load(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'nets.json')))
FACES={'cuboid':6,'triangular-prism':5,'square-pyramid':5,'tetrahedron':4,'cylinder':3,'cone':2}

def segs(pts):
    out=[]
    for i in range(len(pts)):
        a=tuple(round(v,3) for v in pts[i]); b=tuple(round(v,3) for v in pts[(i+1)%len(pts)])
        out.append(tuple(sorted([a,b])))
    return out

def area(pts):
    s=0
    for i in range(len(pts)):
        x1,y1=pts[i]; x2,y2=pts[(i+1)%len(pts)]
        s+=x1*y2-x2*y1
    return abs(s)/2

def centroid(pts):
    return (sum(p[0] for p in pts)/len(pts), sum(p[1] for p in pts)/len(pts))

def inside(pt, poly):
    x,y=pt; n=len(poly); c=False; j=n-1
    for i in range(n):
        xi,yi=poly[i]; xj,yj=poly[j]
        if ((yi>y)!=(yj>y)) and (x < (xj-xi)*(y-yi)/(yj-yi+1e-15)+xi): c=not c
        j=i
    return c

print('AUDIT of the 23 hand-drawn net diagrams\n' + '='*74)
issues=[]
for sd in d['otherSolids']['solids']:
    sid=sd['id']; exp=FACES[sid]
    for tag,items in (('NET',sd['nets']),('FAKE',sd['fakes'])):
        for idx,n in enumerate(items):
            polys=[s for s in n['shapes'] if s['t']=='poly']
            others=[s for s in n['shapes'] if s['t']!='poly']
            npieces=len(n['shapes'])
            # edge-sharing adjacency among polygons
            E=[]
            for i,j in combinations(range(len(polys)),2):
                if set(segs(polys[i]['pts'])) & set(segs(polys[j]['pts'])): E.append((i,j))
            # connectivity of polygons
            if polys:
                seen={0}; stack=[0]
                while stack:
                    c=stack.pop()
                    for a,b in E:
                        for u,v in ((a,b),(b,a)):
                            if u==c and v not in seen: seen.add(v); stack.append(v)
                conn=len(seen)==len(polys)
            else: conn=True
            # overlap: centroid of one strictly inside another
            ov=[]
            for i,j in combinations(range(len(polys)),2):
                if inside(centroid(polys[i]['pts']), polys[j]['pts']) or inside(centroid(polys[j]['pts']), polys[i]['pts']):
                    ov.append((i,j))
            name = n.get('name', 'fake %d'%(idx+1))
            flags=[]
            if npieces!=exp: flags.append('PIECES=%d (solid has %d faces)'%(npieces,exp))
            if polys and not conn: flags.append('NOT EDGE-CONNECTED (a piece touches only at a corner, or floats)')
            if polys and len(E)!=len(polys)-1 and conn: flags.append('adjacency has %d joins, a tree needs %d'%(len(E),len(polys)-1))
            if ov: flags.append('OVERLAPPING PIECES %s'%ov)
            status='ok' if not flags else 'FLAGS'
            print(f'{sid:<17} {tag:<4} {name[:30]:<31} pieces={npieces:<2} joins={len(E):<2} {status}')
            for f in flags: print(f'{"":>23}  -> {f}')
            if flags: issues.append((sid,tag,name,flags,n.get('why','')))
print('\n' + '='*74)
print('flagged:', len(issues))
for sid,tag,name,flags,why in issues:
    print(f'\n  {sid} / {tag} / {name}')
    for f in flags: print('    ', f)
    if why: print('     stated reason:', why[:110])
