import vtracer, os, re, cv2
D = r'C:\Users\abuhu\AppData\Local\Temp\claude\D--Mohamed-Abdo-Perfumes-2--claude-worktrees-suspicious-villani-16a28f\b16114af-0049-4c51-b375-a239bcc0ee78\scratchpad\logo' + '\\'
big = cv2.imread(D + 'cut_big.png')
# crop to the logo (original px x 235..790, y 170..790) so no empty canvas is traced
S = 3
crop = big[165 * S:795 * S, 232 * S:795 * S]
cv2.imwrite(D + 'crop3.png', crop)
cv2.imwrite(D + 'crop2.png', cv2.resize(crop, None, fx=2 / 3, fy=2 / 3, interpolation=cv2.INTER_AREA))
runs = {
    'c': ('crop3.png', dict(color_precision=6, layer_difference=20, filter_speckle=10, corner_threshold=60, length_threshold=5.0, splice_threshold=45, path_precision=0)),
    'd': ('crop2.png', dict(color_precision=6, layer_difference=16, filter_speckle=6, corner_threshold=60, length_threshold=4.0, splice_threshold=45, path_precision=0)),
    'e': ('crop2.png', dict(color_precision=6, layer_difference=22, filter_speckle=8, corner_threshold=60, length_threshold=5.0, splice_threshold=45, path_precision=0)),
}
for k, (src, p) in runs.items():
    out = D + 'trace_%s.svg' % k
    vtracer.convert_image_to_svg_py(D + src, out, colormode='color', hierarchical='cutout', mode='spline', **p)
    s = open(out, encoding='utf-8').read()
    print(k, os.path.getsize(out) // 1024, 'KB', s.count('<path'), 'paths')
