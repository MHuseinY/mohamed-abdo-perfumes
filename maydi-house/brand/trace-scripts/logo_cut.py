import cv2, numpy as np, sys
SRC = r'D:\Mohamed Abdo Perfumes 2\Resources\Maydi House Logo.jpeg'
OUT = r'C:\Users\abuhu\AppData\Local\Temp\claude\D--Mohamed-Abdo-Perfumes-2--claude-worktrees-suspicious-villani-16a28f\b16114af-0049-4c51-b375-a239bcc0ee78\scratchpad\logo' + '\\'
S = 3
T_DC = float(sys.argv[1]) if len(sys.argv) > 1 else 7.5
T_DL = float(sys.argv[2]) if len(sys.argv) > 2 else 28.0
SH_DC = float(sys.argv[3]) if len(sys.argv) > 3 else 15.0
SH_L = float(sys.argv[4]) if len(sys.argv) > 4 else 64.0
SH_G = float(sys.argv[5]) if len(sys.argv) > 5 else 0.9

img = cv2.imread(SRC)
big = cv2.resize(img, None, fx=S, fy=S, interpolation=cv2.INTER_CUBIC)
lab = cv2.cvtColor(big.astype(np.float32) / 255, cv2.COLOR_BGR2Lab)
c = 120 * S
corner = np.concatenate([lab[:c, :c].reshape(-1, 3), lab[:c, -c:].reshape(-1, 3), lab[-c:, :c].reshape(-1, 3), lab[-c:, -c:].reshape(-1, 3)])
bg = np.median(corner, axis=0)
sm = cv2.GaussianBlur(lab, (0, 0), 1.6)
dL = sm[..., 0] - bg[0]
dc = np.hypot(sm[..., 1] - bg[1], sm[..., 2] - bg[2])
# the soft cast shadow is a smooth, nearly colourless darkening; the object is more coloured or much darker
mask = ((dc > T_DC) | (dL < -T_DL)).astype(np.uint8) * 255
roi = np.zeros_like(mask); roi[150 * S:810 * S, 220 * S:820 * S] = 255
mask = cv2.bitwise_and(mask, roi)
mask = cv2.morphologyEx(mask, cv2.MORPH_OPEN, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5)))
n, lbl, stats, _ = cv2.connectedComponentsWithStats(mask, connectivity=8)
keep = np.zeros_like(mask)
for i in range(1, n):
    if stats[i, cv2.CC_STAT_AREA] >= 300:
        keep[lbl == i] = 255
mask = keep
# cast shadow on the paper: light, almost colourless and smooth (the object has edges or more colour)
L0 = cv2.GaussianBlur(lab[..., 0], (0, 0), 2.0)
gx = cv2.Sobel(L0, cv2.CV_32F, 1, 0, ksize=3); gy = cv2.Sobel(L0, cv2.CV_32F, 0, 1, ksize=3)
grad = cv2.GaussianBlur(np.hypot(gx, gy) / 8.0, (0, 0), 3.0)
shadow = ((dc < SH_DC) & (sm[..., 0] > SH_L) & (grad < SH_G)).astype(np.uint8) * 255
shadow = cv2.morphologyEx(shadow, cv2.MORPH_OPEN, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (9, 9)))
cv2.imwrite(OUT + 'shadow_mask.png', shadow)
mask = cv2.bitwise_and(mask, cv2.bitwise_not(shadow))
mask = cv2.morphologyEx(mask, cv2.MORPH_OPEN, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5)))
# the amber glow the gem casts on the paper is light, not part of the logo
# inside the box around the drop keep only the drop itself (its outline measured on the original), not the amber glow it casts
pts = np.array([(496, 455), (528, 455), (532, 468), (540, 488), (547, 508), (549, 526), (546, 543), (538, 554), (526, 561), (512, 564), (498, 561), (486, 553), (478, 540), (475, 522), (478, 505), (487, 487), (494, 468)], np.float32) * S
drop_region = np.zeros_like(mask); cv2.fillPoly(drop_region, [pts.astype(np.int32)], 255)
drop_region = cv2.dilate(drop_region, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (2 * 2 * S + 1, 2 * 2 * S + 1)))
box = np.zeros_like(mask); box[455 * S:584 * S, 462 * S:585 * S] = 255
mask[(box > 0) & (drop_region == 0)] = 0
# the gem's pale facets are as light as the paper: fill the drop solid, inside its copper rim, so they keep their own colours
drop_in = np.zeros_like(mask); cv2.fillPoly(drop_in, [pts.astype(np.int32)], 255)
drop_in = cv2.erode(drop_in, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (2 * 2 * S + 1, 2 * 2 * S + 1)))
mask[drop_in > 0] = 255
# shave the soft rim that is left where the shadow meets the object
ER = int(sys.argv[6]) if len(sys.argv) > 6 else 3
if ER:
    mask = cv2.erode(mask, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (2 * ER + 1, 2 * ER + 1)))
cut = big.copy(); cut[mask == 0] = (255, 255, 255)
cv2.imwrite(OUT + 'cut_big.png', cut)
cv2.imwrite(OUT + 'cut_mask.png', mask)
sm_cut = cv2.resize(cut, None, fx=1 / S, fy=1 / S, interpolation=cv2.INTER_AREA)
cv2.imwrite(OUT + 'cut_preview.png', sm_cut)
print('kept %.2f%%' % (100 * (mask > 0).mean()))
