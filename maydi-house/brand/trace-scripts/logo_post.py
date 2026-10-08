import re, sys, os
D = r'C:\Users\abuhu\AppData\Local\Temp\claude\D--Mohamed-Abdo-Perfumes-2--claude-worktrees-suspicious-villani-16a28f\b16114af-0049-4c51-b375-a239bcc0ee78\scratchpad\logo' + '\\'


def clean(src, dst, title='Maydi House'):
    s = open(D + src, encoding='utf-8').read()
    w, h = re.search(r'width="(\d+)" height="(\d+)"', s).groups()
    kept, dropped = [], 0
    for m in re.finditer(r'<path d="([^"]+)" fill="#([0-9A-Fa-f]{6})" transform="translate\(([^)]*)\)"/>', s):
        d, fill, t = m.groups()
        r, g, b = int(fill[0:2], 16), int(fill[2:4], 16), int(fill[4:6], 16)
        if r >= 0xF6 and g >= 0xF6 and b >= 0xF6:  # the white page the trace starts from
            dropped += 1
            continue
        kept.append('<path d="%s" fill="#%s" transform="translate(%s)"/>' % (d, fill.lower(), t))
    svg = ('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 %s %s" role="img" aria-label="%s"><title>%s</title>' % (w, h, title, title)
           + ''.join(kept) + '</svg>')
    open(D + dst, 'w', encoding='utf-8').write(svg)
    print(dst, '%dx%d' % (int(w), int(h)), len(svg) // 1024, 'KB', len(kept), 'paths kept,', dropped, 'white dropped')


for k in sys.argv[1:]:
    clean('trace_%s.svg' % k, 'clean_%s.svg' % k)
