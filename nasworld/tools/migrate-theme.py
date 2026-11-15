#!/usr/bin/env python3
"""One-off migration: turn Nasworld's hard-coded dark purple styling into
theme tokens, so a tone can be swapped by redefining a few variables.

Run once from nasworld/. Kept in the repo as a record of what was changed
mechanically and why; it is not part of the build.
"""
import re, glob, sys

INK, ACC, GOOD, BAD, BG = 'var(--ink-rgb)', 'var(--accent-rgb)', 'var(--good-rgb)', 'var(--bad-rgb)', 'var(--bg-rgb)'
RGB = {
 (255,255,255): INK, (188,198,204): INK, (100,100,100): INK,
 (255,215,0): ACC, (255,209,102): ACC, (255,200,0): ACC, (255,255,0): ACC, (255,180,80): ACC, (255,157,123): ACC,
 (181,123,255): ACC, (123,179,255): ACC, (100,200,255): ACC, (30,144,255): ACC, (123,255,224): ACC, (255,123,219): ACC,
 (123,255,181): GOOD, (74,222,128): GOOD, (0,255,100): GOOD, (200,255,200): GOOD,
 (255,123,123): BAD, (248,113,113): BAD, (255,107,107): BAD,
 (37,27,94): BG, (15,11,46): BG, (20,12,50): BG, (47,35,112): BG, (26,17,71): BG, (20,14,48): BG, (10,6,30): BG,
}
HEX = {
 '#ffd700':'var(--accent)','#ffd166':'var(--accent)','#ffb84d':'var(--accent)','#ffd93d':'var(--accent)',
 '#b57bff':'var(--accent)','#7bb3ff':'var(--accent)','#ff7bdb':'var(--accent)','#d9c2ff':'var(--accent)',
 '#7bffb5':'var(--good)','#4ade80':'var(--good)','#6bcb77':'var(--good)',
 '#ff7b7b':'var(--bad)','#ff6b6b':'var(--bad)','#f87171':'var(--bad)','#ff9d7b':'var(--bad)','#ff9d9d':'var(--bad)',
 '#1a1147':'var(--bg-deep)','#0f0b2e':'var(--bg-deep)','#1a1a2e':'var(--bg-deep)','#1a1a3e':'var(--bg-deep)',
 '#251b5e':'var(--bg-card)','#2a1f55':'var(--bg-card)','#2d1f6b':'var(--bg-card)','#2f2370':'var(--bg-card-hover)',
 '#b8a9d4':'var(--text-secondary)','#7a6b9a':'var(--text-dim)','#2a1f00':'var(--on-accent)',
}
BRIGHT = re.compile(r'var\(--(gold|mint|coral|lavender|sky|pink|teal|accent|good|success)(-soft)?\)|#(ffd|ff[b9]|b57|7bb|7bf|ff7|4ad|6bc|ffe)', re.I)
DARKVAL = re.compile(r'^\s*(var\(--bg-(deep|mid|card)\)|#1a1147|#0f0b2e|#2a1f00|#1a1a2e|#000|#000000|#333)\s*(!important)?\s*$', re.I)

def map_rgba(s):
    def f(m):
        t = (int(m.group(1)), int(m.group(2)), int(m.group(3)))
        return 'rgba(' + RGB[t] + ',' if t in RGB else m.group(0)
    return re.sub(r'rgba\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,', f, s)

def map_hex(s):
    return re.sub(r'#[0-9a-fA-F]{6}\b', lambda m: HEX.get(m.group(0).lower(), m.group(0)), s)

def strip_gradients(val):
    """Return (new value, was_accent). Replaces every *-gradient(...) call."""
    out, i, accent = '', 0, False
    while True:
        m = re.search(r'(repeating-)?(linear|radial|conic)-gradient\(', val[i:])
        if not m: out += val[i:]; break
        start = i + m.start(); j = i + m.end(); depth = 1
        while j < len(val) and depth:
            depth += (val[j] == '(') - (val[j] == ')'); j += 1
        body = val[start:j]
        # A fill is "bright" when it uses a solid palette colour, not a faint wash.
        solid = re.sub(r'rgba\([^)]*\)', '', body)
        if BRIGHT.search(solid): accent = True; rep = 'var(--accent)'
        else: rep = 'var(--bg-card)'
        out += val[i:start] + rep; i = j
    return out, accent

def fix_decls(block_text):
    """block_text is the inside of one { } with only declarations."""
    decls = [d for d in re.split(r';(?![^()]*\))', block_text)]
    res, made_accent, has_clip = [], False, 'background-clip: text' in block_text or 'background-clip:text' in block_text
    for d in decls:
        if ':' not in d: res.append(d); continue
        prop, val = d.split(':', 1); p = prop.strip().lower()
        if has_clip and p in ('-webkit-background-clip','background-clip','-webkit-text-fill-color','background','background-image'):
            continue
        if p in ('text-shadow','backdrop-filter','-webkit-backdrop-filter'): continue
        if p == 'filter' and 'drop-shadow' in val: continue
        if p == 'animation' and 'infinite' in val and re.search(r'float|pulse-glow|twinkle|surprise-|\bbob\b|banner-shine|lumi-happy', val): continue
        if p == 'box-shadow' and (re.search(r'\b0 0 \d', val) or 'glow' in val): d = prop + ': none'; res.append(d); continue
        if p == 'transition' and re.search(r'\ball\b', val):
            d = prop + ': background-color .15s, border-color .15s, color .15s, opacity .15s, transform .15s'; res.append(d); continue
        if 'gradient(' in val and p in ('background','background-image'):
            nv, acc = strip_gradients(val)
            # several layered washes collapse to one flat surface
            if p == 'background' or p == 'background-image':
                parts = [x.strip() for x in re.split(r',(?![^()]*\))', nv)]
                nv = ' ' + (('var(--accent)') if acc else parts[-1])
                prop = prop.replace('background-image', 'background')
            made_accent = made_accent or acc
            d = prop + ':' + nv
        res.append(d)
    if made_accent:
        res2, seen = [], False
        for d in res:
            if ':' in d and d.split(':',1)[0].strip().lower() == 'color':
                res2.append(d.split(':',1)[0] + ': var(--on-accent)'); seen = True
            else: res2.append(d)
        if not seen: res2.insert(len(res2) - (1 if res2 and not res2[-1].strip() else 0), ' color: var(--on-accent)')
        res = res2
    else:
        res = [ (d.split(':',1)[0] + ': var(--on-accent)') if (':' in d and d.split(':',1)[0].strip().lower()=='color' and DARKVAL.match(d.split(':',1)[1])) else d for d in res ]
    if has_clip: res.insert(0, ' color: var(--text-primary)')
    return ';'.join(res)

def do_css(text):
    # innermost blocks only: { ... } with no nested braces
    text = re.sub(r'\{([^{}]*)\}', lambda m: '{' + fix_decls(m.group(1)) + '}' if ':' in m.group(1) and '%' not in m.group(1)[:0] else m.group(0), text)
    return map_hex(map_rgba(text))

def do_js(text):
    # Scripts build pictures with gradients (fraction pies, jigsaw scenes,
    # the water cycle sky), so only the chrome tints are mapped here.
    return map_rgba(text)

if __name__ == '__main__':
    for f in sorted(glob.glob('styles/app-[1-6].css')):
        s = open(f).read(); n = do_css(s)
        if n != s: open(f, 'w').write(n); print('css', f)
    for f in sorted(glob.glob('src/**/*.js', recursive=True)):
        s = open(f).read(); n = do_js(s)
        if n != s: open(f, 'w').write(n); print('js ', f)
