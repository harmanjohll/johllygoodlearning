"""Provenance for the net counts in nets.json (otherSolids.counts).

A net of a solid is a spanning tree of its face-adjacency graph. This script
builds that graph for each solid, enumerates every spanning tree, then removes
the ones that are the same net rotated or reflected, and prints the count.

Run with `python3 solids-verify.py`. Standard library only.

Result, all matching the published figures:
  triangular pyramid 2, square pyramid 8, triangular prism 9, cube 11,
  cuboid with three different edge lengths 54.

Note the cube and the cuboid share the same graph and the same 384 spanning
trees. They differ only in symmetry: a cube has 48, a cuboid with three
different edge lengths has 8, which is why the same arrangements give 11 nets
in one case and 54 in the other.
"""

from itertools import combinations, permutations
import itertools

def spanning_trees(nodes, edges):
    """all spanning trees as frozensets of edges (brute force, small graphs)"""
    n=len(nodes); out=[]
    for comb in combinations(edges, n-1):
        # connected?
        parent={v:v for v in nodes}
        def find(a):
            while parent[a]!=a: parent[a]=parent[parent[a]]; a=parent[a]
            return a
        ok=True
        for u,v in comb:
            ru,rv=find(u),find(v)
            if ru==rv: ok=False; break
            parent[ru]=rv
        if ok: out.append(frozenset(frozenset(e) for e in comb))
    return out

def orbits(trees, group):
    """count distinct trees up to the face-permutation group"""
    seen=set(); n=0
    for t in trees:
        if t in seen: continue
        n+=1
        for g in group:
            seen.add(frozenset(frozenset(g[x] for x in e) for e in t))
    return n

def perms_from_gens(gens, elems):
    """close a set of generator permutations (dicts) into a group"""
    ident={e:e for e in elems}
    G={tuple(sorted(ident.items()))}
    frontier=[ident]
    while frontier:
        nf=[]
        for g in frontier:
            for h in gens:
                c={e: h[g[e]] for e in elems}
                k=tuple(sorted(c.items()))
                if k not in G: G.add(k); nf.append(c)
        frontier=nf
    return [dict(k) for k in G]

results={}

# ---------- TETRAHEDRON: 4 faces, all mutually adjacent ----------
F=[0,1,2,3]
E=[(a,b) for a,b in combinations(F,2)]
T=spanning_trees(F,E)
G=[dict(zip(F,p)) for p in permutations(F)]          # S4, order 24
results['Tetrahedron']=(len(F),len(E),len(T),len(G),orbits(T,G))

# ---------- CUBE / CUBOID: dual = octahedron graph ----------
# faces 0..5 with opposite pairs (0,1),(2,3),(4,5); adjacent unless opposite
F=[0,1,2,3,4,5]; OPP={0:1,1:0,2:3,3:2,4:5,5:4}
E=[(a,b) for a,b in combinations(F,2) if OPP[a]!=b]
T=spanning_trees(F,E)
# cube symmetry on faces: order 48. generators: rotate about two axes + reflection
rotX={0:4,4:1,1:5,5:0,2:2,3:3}       # D->E->U->W->D
rotY={0:2,2:1,1:3,3:0,4:4,5:5}
refl={0:0,1:1,2:2,3:3,4:5,5:4}
Gcube=perms_from_gens([rotX,rotY,refl],F)
results['Cube']=(6,len(E),len(T),len(Gcube),orbits(T,Gcube))
# cuboid with three different edge lengths: only the 3 axis half-turns + reflections, order 8
half1={0:1,1:0,2:3,3:2,4:4,5:5}
half2={0:1,1:0,2:2,3:3,4:5,5:4}
r1={0:1,1:0,2:2,3:3,4:4,5:5}
Gcub=perms_from_gens([half1,half2,r1],F)
results['Cuboid (3 different edges)']=(6,len(E),len(T),len(Gcub),orbits(T,Gcub))

# ---------- SQUARE PYRAMID: base B=0, triangles 1..4 in a cycle ----------
F=[0,1,2,3,4]
E=[(0,i) for i in (1,2,3,4)]+[(1,2),(2,3),(3,4),(1,4)]
T=spanning_trees(F,E)
rot={0:0,1:2,2:3,3:4,4:1}
ref={0:0,1:1,2:4,3:3,4:2}
G=perms_from_gens([rot,ref],F)                        # D4, order 8
results['Square pyramid']=(5,len(E),len(T),len(G),orbits(T,G))

# ---------- TRIANGULAR PRISM: triangles 0,1 ; rectangles 2,3,4 ----------
F=[0,1,2,3,4]
E=[(0,2),(0,3),(0,4),(1,2),(1,3),(1,4),(2,3),(3,4),(2,4)]
T=spanning_trees(F,E)
rot={0:0,1:1,2:3,3:4,4:2}          # rotate the three rectangles
swap={0:1,1:0,2:2,3:3,4:4}         # flip end to end
mir={0:0,1:1,2:2,3:4,4:3}          # mirror
G=perms_from_gens([rot,swap,mir],F)                   # order 12
results['Triangular prism']=(5,len(E),len(T),len(G),orbits(T,G))

print(f"{'solid':<28} {'faces':>5} {'adj':>4} {'spanning trees':>15} {'symmetries':>11} {'distinct nets':>14}")
for k,(f,e,t,g,o) in results.items():
    print(f'{k:<28} {f:>5} {e:>4} {t:>15} {g:>11} {o:>14}')
print()
known={'Tetrahedron':2,'Cube':11,'Cuboid (3 different edges)':54,'Square pyramid':8,'Triangular prism':9}
for k,v in known.items():
    got=results[k][4]
    print(f'  {k:<28} computed {got:<4} published {v:<4} {"MATCH" if got==v else "*** MISMATCH ***"}')
