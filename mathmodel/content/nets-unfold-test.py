"""Independent generator: unfold each solid along every spanning tree of its face
graph, in real 3D, and check `decide` accepts the resulting flat figure.
These figures are produced by geometry, not authored by hand, so they are an
independent test of the walk."""
import math, itertools
from itertools import combinations
exec(open('/tmp/fold2.py').read())

R3=math.sqrt(3)
V3 = {
 'cube': [(0,0,0),(1,0,0),(1,1,0),(0,1,0),(0,0,1),(1,0,1),(1,1,1),(0,1,1)],
 'cuboid': [(0,0,0),(2.6,0,0),(2.6,1.7,0),(0,1.7,0),(0,0,1.1),(2.6,0,1.1),(2.6,1.7,1.1),(0,1.7,1.1)],
 'tetrahedron': [(1,1,1),(1,-1,-1),(-1,1,-1),(-1,-1,1)],
 'square-pyramid': [(0,0,0),(2,0,0),(2,2,0),(0,2,0),(1,1,1.25)],
 'triangular-prism': [(0,0,0),(2,0,0),(1,R3,0),(0,0,2.4),(2,0,2.4),(1,R3,2.4)],
}
def d3(a,b): return math.dist(a,b)

def place_first(solid):
    F,_=MODELS[solid]; V=V3[solid]; f=F[0]
    o=V[f[0]]; e1=V[f[1]]
    ax=[e1[i]-o[i] for i in range(3)]; L=math.hypot(*ax); ax=[c/L for c in ax]
    tmp=[V[f[2]][i]-o[i] for i in range(3)]
    d=sum(tmp[i]*ax[i] for i in range(3))
    ay=[tmp[i]-d*ax[i] for i in range(3)]; L2=math.hypot(*ay); ay=[c/L2 for c in ay]
    pts=[]
    for vi in f:
        w=[V[vi][i]-o[i] for i in range(3)]
        pts.append((sum(w[i]*ax[i] for i in range(3)), sum(w[i]*ay[i] for i in range(3))))
    return pts

def trilaterate(A,B,dA,dB,avoid):
    ax,ay=A; bx,by=B
    d=math.hypot(bx-ax,by-ay)
    if d<1e-9: return None
    a=(dA*dA-dB*dB+d*d)/(2*d)
    h2=dA*dA-a*a
    if h2<-1e-7: return None
    h=math.sqrt(max(h2,0))
    mx,my=ax+a*(bx-ax)/d, ay+a*(by-ay)/d
    c1=(mx+h*(by-ay)/d, my-h*(bx-ax)/d)
    c2=(mx-h*(by-ay)/d, my+h*(bx-ax)/d)
    return c1 if math.dist(c1,avoid) > math.dist(c2,avoid) else c2

def unfold(solid, tree):
    """tree: set of frozenset({i,j}) face pairs forming a spanning tree"""
    F,_=MODELS[solid]; V=V3[solid]
    pos2={}                       # vertex id -> 2D, per placement
    placed={0: dict(zip(F[0], place_first(solid)))}
    order=[0]; seen={0}
    while len(seen)<len(F):
        progress=False
        for e in tree:
            i,j=tuple(e)
            for a,b in ((i,j),(j,i)):
                if a in seen and b not in seen:
                    shared=[v for v in F[b] if v in F[a]]
                    if len(shared)!=2: return None
                    u,v=shared
                    P=dict((k,placed[a][k]) for k in shared)
                    interior=tuple(sum(placed[a][k][c] for k in F[a])/len(F[a]) for c in (0,1))
                    newp=dict(P)
                    for w in F[b]:
                        if w in P: continue
                        q=trilaterate(P[u],P[v],d3(V[w],V[u]),d3(V[w],V[v]),interior)
                        if q is None: return None
                        newp[w]=q
                    placed[b]=newp; seen.add(b); order.append(b); progress=True
        if not progress: return None
    return [[placed[i][v] for v in F[i]] for i in range(len(F))]

def spanning_trees(n, edges):
    out=[]
    for comb in combinations(edges, n-1):
        par=list(range(n))
        def find(a):
            while par[a]!=a: par[a]=par[par[a]]; a=par[a]
            return a
        ok=True
        for u,v in comb:
            ru,rv=find(u),find(v)
            if ru==rv: ok=False; break
            par[ru]=rv
        if ok: out.append(set(frozenset(e) for e in comb))
    return out

print('GATE 2 - unfold every spanning tree in 3D, feed the flat figure back in')
print('%-19s %7s %8s %8s %8s' % ('solid','trees','unfolded','accepted','rejected'))
tot_a=tot_r=0
rejects={}
for name in ['tetrahedron','square-pyramid','triangular-prism','cube','cuboid']:
    F,across=MODELS[name]
    fe=sorted({tuple(sorted((i, across[(i,ei)][0]))) for i in range(len(F)) for ei in range(len(F[i]))})
    trees=spanning_trees(len(F), fe)
    okc=rj=un=0
    for t in trees:
        net=unfold(name,t)
        if net is None: continue
        un+=1
        got,why=decide(net,name)
        if got: okc+=1
        else: rj+=1; rejects.setdefault(name,[]).append(why)
    tot_a+=okc; tot_r+=rj
    print('%-19s %7d %8d %8d %8d' % (name,len(trees),un,okc,rj))
print()
print('total accepted %d, rejected %d' % (tot_a,tot_r))
for k,v in rejects.items():
    from collections import Counter
    print('  rejected in %s: %s' % (k, dict(Counter(v))))
