from itertools import combinations
# Cube orientation: dict dir->face label. Opposite pairs (0,1),(2,3),(4,5)
OPP = {0:1,1:0,2:3,3:2,4:5,5:4}
START = {'D':0,'U':1,'N':2,'S':3,'E':4,'W':5}

def roll(s, d):
    o = dict(s)
    if d == (1,0):   # east
        o['D'],o['E'],o['U'],o['W'] = s['E'],s['U'],s['W'],s['D']
    elif d == (-1,0):
        o['D'],o['W'],o['U'],o['E'] = s['W'],s['U'],s['E'],s['D']
    elif d == (0,1):  # north
        o['D'],o['N'],o['U'],o['S'] = s['N'],s['U'],s['S'],s['D']
    elif d == (0,-1):
        o['D'],o['S'],o['U'],o['N'] = s['S'],s['U'],s['N'],s['D']
    return o

def folds(cells):
    cells = set(cells)
    start = next(iter(sorted(cells)))
    seen = {start: START}
    stack = [start]
    while stack:
        c = stack.pop()
        for d in [(1,0),(-1,0),(0,1),(0,-1)]:
            n = (c[0]+d[0], c[1]+d[1])
            if n in cells and n not in seen:
                seen[n] = roll(seen[c], d)
                stack.append(n)
    if len(seen) != len(cells): return None          # not edge-connected
    faces = [seen[c]['D'] for c in cells]
    if len(set(faces)) != 6: return None             # overlap
    return {c: seen[c]['D'] for c in cells}

# enumerate fixed hexominoes by growth
def grow(shapes):
    out = set()
    for s in shapes:
        for c in s:
            for d in [(1,0),(-1,0),(0,1),(0,-1)]:
                n = (c[0]+d[0], c[1]+d[1])
                if n not in s:
                    t = tuple(sorted(s + (n,)))
                    mx = min(x for x,y in t); my = min(y for x,y in t)
                    out.add(tuple(sorted((x-mx, y-my) for x,y in t)))
    return out

shapes = {((0,0),)}
for _ in range(5): shapes = grow(shapes)
print('fixed hexominoes:', len(shapes))

def norm(cells):
    mx = min(x for x,y in cells); my = min(y for x,y in cells)
    return tuple(sorted((x-mx, y-my) for x,y in cells))
def variants(cells):
    v = []
    cur = list(cells)
    for _ in range(4):
        cur = [(-y, x) for x,y in cur]
        v.append(norm(cur)); v.append(norm([(-x, y) for x,y in cur]))
    return set(v)

free, seen_forms = [], set()
for s in shapes:
    if s in seen_forms: continue
    vs = variants(s)
    seen_forms |= vs
    free.append(s)
print('free hexominoes:', len(free))

valid = [s for s in free if folds(s)]
print('free hexominoes that fold into a cube:', len(valid))

def family(cells):
    cols = {}
    for x,y in cells: cols.setdefault(x, []).append(y)
    rows = {}
    for x,y in cells: rows.setdefault(y, []).append(x)
    def runs(groups):
        # only count as a "row description" if each group is contiguous
        ks = sorted(groups)
        if ks != list(range(min(ks), max(ks)+1)): return None
        out = []
        for k in ks:
            v = sorted(groups[k])
            if v != list(range(min(v), max(v)+1)): return None
            out.append(len(v))
        return out
    for g in (rows, cols):
        r = runs(g)
        if r and len(r) in (2,3):
            return '-'.join(str(n) for n in r)
    return '?'

from collections import Counter
fams = Counter()
print()
for s in sorted(valid, key=lambda c: (family(c), c)):
    m = folds(s)
    pairs = []
    for a,b in combinations(sorted(s),2):
        if m[a] == OPP[m[b]]: pairs.append((a,b))
    f = family(s)
    fams[f] += 1
    print(f'{f:<8}', sorted(s), '| opposite cell pairs:', pairs)
print()
print('families:', dict(fams))

print('\n=== RULE CHECKS ===')
# Rule A: same row/col with exactly one cell between -> opposite?  and converse
fp = fn = ok = 0
for s in valid:
    m = folds(s); cs = set(s)
    for a,b in combinations(sorted(s),2):
        inline = (a[0]==b[0] and abs(a[1]-b[1])==2 and (a[0],(a[1]+b[1])//2) in cs) or \
                 (a[1]==b[1] and abs(a[0]-b[0])==2 and ((a[0]+b[0])//2,a[1]) in cs)
        opp = m[a]==OPP[m[b]]
        if inline and opp: ok += 1
        elif inline and not opp: fp += 1
        elif opp and not inline: fn += 1
print(f'Rule A "skip one in a straight line = opposite": {ok} confirmed, {fp} false positives, {fn} opposite pairs NOT caught by it')

# characterise the ones Rule A misses
print('\nPairs Rule A misses (the staircase case), as (dx,dy) offsets:')
from collections import Counter
miss = Counter()
for s in valid:
    m = folds(s); cs = set(s)
    for a,b in combinations(sorted(s),2):
        inline = (a[0]==b[0] and abs(a[1]-b[1])==2 and (a[0],(a[1]+b[1])//2) in cs) or \
                 (a[1]==b[1] and abs(a[0]-b[0])==2 and ((a[0]+b[0])//2,a[1]) in cs)
        if m[a]==OPP[m[b]] and not inline:
            miss[(abs(a[0]-b[0]), abs(a[1]-b[1]))] += 1
print(' ', dict(miss), ' (all are one-across-one-along staircases)')

# Rule: any 2x2 block -> invalid?
blk_valid = [s for s in valid if any((x,y) in set(s) and (x+1,y) in set(s) and (x,y+1) in set(s) and (x+1,y+1) in set(s) for x,y in s)]
blk_all   = [s for s in free  if any((x,y) in set(s) and (x+1,y) in set(s) and (x,y+1) in set(s) and (x+1,y+1) in set(s) for x,y in s)]
print(f'\n2x2 block: {len(blk_all)} of the 35 hexominoes contain one; {len(blk_valid)} of those fold into a cube')

# Rule: 5 or more in a straight line -> invalid?
def maxrun(cells):
    best = 0
    for axis in (0,1):
        g = {}
        for c in cells: g.setdefault(c[axis], []).append(c[1-axis])
        for k,v in g.items():
            v = sorted(v); run = 1
            for i in range(1,len(v)):
                run = run+1 if v[i]==v[i-1]+1 else 1
                best = max(best, run)
            best = max(best, run, 1)
    return best
run5_all   = [s for s in free  if maxrun(s) >= 5]
run5_valid = [s for s in valid if maxrun(s) >= 5]
print(f'5+ in a straight line: {len(run5_all)} of the 35 have one; {len(run5_valid)} of those fold')
print(f'longest straight run among the 11 valid nets: {max(maxrun(s) for s in valid)}')

# Rule: opposite faces never edge-adjacent
adj_opp = 0
for s in valid:
    m = folds(s)
    for a,b in combinations(sorted(s),2):
        if abs(a[0]-b[0])+abs(a[1]-b[1])==1 and m[a]==OPP[m[b]]: adj_opp += 1
print(f'\nopposite pairs that are edge-adjacent in a net: {adj_opp} (should be 0)')

# Rule: a square with all 4 neighbours present -> invalid?
sur_all   = [s for s in free  if any(all((x+dx,y+dy) in set(s) for dx,dy in [(1,0),(-1,0),(0,1),(0,-1)]) for x,y in s)]
sur_valid = [s for s in valid if any(all((x+dx,y+dy) in set(s) for dx,dy in [(1,0),(-1,0),(0,1),(0,-1)]) for x,y in s)]
print(f'square surrounded on all 4 sides: {len(sur_all)} of the 35 have one; {len(sur_valid)} of those fold')

# how many of the 24 invalid hexominoes are caught by (2x2 block) OR (run>=5) OR (surrounded)?
invalid = [s for s in free if not folds(s)]
def caught(s):
    cs=set(s)
    b = any((x,y) in cs and (x+1,y) in cs and (x,y+1) in cs and (x+1,y+1) in cs for x,y in s)
    r = maxrun(s) >= 5
    u = any(all((x+dx,y+dy) in cs for dx,dy in [(1,0),(-1,0),(0,1),(0,-1)]) for x,y in s)
    return b or r or u
print(f'\ninvalid hexominoes: {len(invalid)}; caught by the three quick tests: {sum(1 for s in invalid if caught(s))}')
print(f'valid nets wrongly flagged by the three tests: {sum(1 for s in valid if caught(s))}')
