"""Background matting for the character footage.

The source video has a smooth red studio gradient (not a flat colour), so each
frame's background is modelled with a low-order 2-D polynomial fitted to pixels
that are confidently background. Alpha comes from the colour distance to that
modelled background, and edge colours are decontaminated by un-mixing the
known background (I = aF + (1-a)B  =>  F = (I - (1-a)B) / a).
"""
import cv2
import numpy as np


def _poly_terms(x, y, deg=4):
    return np.stack([x**i * y**j for i in range(deg + 1) for j in range(deg + 1 - i)], -1)


def estimate_background(img):
    """img: HxWx3 float32 RGB. Returns HxWx3 smooth background estimate."""
    h, w, _ = img.shape
    r, g, b = img[..., 0], img[..., 1], img[..., 2]
    # Confident background: saturated red, very little green/blue.
    bg = (r > 120) & (g < 0.30 * r) & (b < 0.30 * r)
    bg = cv2.erode(bg.astype(np.uint8), np.ones((15, 15), np.uint8)) > 0
    ys, xs = np.nonzero(bg[::6, ::6])
    ys, xs = ys * 6, xs * 6
    A = _poly_terms(xs / w - 0.5, ys / h - 0.5)
    yy, xx = np.mgrid[0:h, 0:w]
    full = _poly_terms(xx.ravel() / w - 0.5, yy.ravel() / h - 0.5)
    out = np.empty_like(img)
    for c in range(3):
        v = img[ys, xs, c]
        coef, *_ = np.linalg.lstsq(A, v, rcond=None)
        # one robust re-fit pass drops outliers such as the small sparkle glyph
        res = np.abs(A @ coef - v)
        keep = res < np.percentile(res, 97)
        coef, *_ = np.linalg.lstsq(A[keep], v[keep], rcond=None)
        out[..., c] = (full @ coef).reshape(h, w)
    return out


def matte(img_rgb_u8, t_lo=28.0, t_hi=75.0):
    img = img_rgb_u8.astype(np.float32)
    B = estimate_background(img)
    diff = img - B
    # weight green/blue more: the background is almost pure red, so any real
    # green/blue content (skin, shirt, eye whites) is strong evidence of foreground
    d_rgb = np.sqrt(0.6 * diff[..., 0] ** 2 + 1.4 * diff[..., 1] ** 2 + 1.0 * diff[..., 2] ** 2)
    # Shadowed skin can sit close to the bright centre of the gradient in RGB
    # distance, but its green/red ratio is ~2x the background's. Darkening
    # relative to the background is a second cue (hair, beard, shadows).
    chroma = 400.0 * (img[..., 1] / (img[..., 0] + 5) - B[..., 1] / (B[..., 0] + 5))
    dark = 0.8 * (B[..., 0] - img[..., 0])
    d = np.maximum.reduce([d_rgb, chroma, dark])

    core = (d > t_hi).astype(np.uint8)
    core = cv2.morphologyEx(core, cv2.MORPH_OPEN, np.ones((3, 3), np.uint8))
    n, lab, stats, _ = cv2.connectedComponentsWithStats(core, 8)
    if n > 1:
        main = 1 + np.argmax(stats[1:, cv2.CC_STAT_AREA])
        body = lab == main
        # keep detached hair strands etc. that sit close to the main silhouette
        near = cv2.dilate(body.astype(np.uint8), np.ones((41, 41), np.uint8)) > 0
        for k in range(1, n):
            if k != main and stats[k, cv2.CC_STAT_AREA] >= 4 and near[lab == k].any():
                body |= lab == k
    else:
        body = core > 0
    # fill interior holes (eyes, mouth shadows, etc.)
    filled = body.astype(np.uint8) * 255
    ff = filled.copy()
    mask = np.zeros((ff.shape[0] + 2, ff.shape[1] + 2), np.uint8)
    cv2.floodFill(ff, mask, (0, 0), 255)
    holes = cv2.bitwise_not(ff)
    solid = (filled | holes) > 0

    soft = np.clip((d - t_lo) / (t_hi - t_lo), 0, 1)
    band = cv2.dilate(solid.astype(np.uint8), np.ones((7, 7), np.uint8)) > 0
    alpha = np.where(solid, 1.0, np.where(band, soft, 0.0)).astype(np.float32)
    # slight feather on the hard edge of the solid region only
    inner = cv2.erode(solid.astype(np.uint8), np.ones((3, 3), np.uint8)) > 0
    edge = solid & ~inner
    alpha[edge] = np.maximum(soft[edge], 0.85 * alpha[edge] + 0.0)
    alpha = np.where(inner, 1.0, alpha)

    a = np.clip(alpha, 1e-3, 1)[..., None]
    F = (img - (1 - a) * B) / a
    F = np.clip(F, 0, 255)
    F = np.where(alpha[..., None] > 0.995, img, F)
    F = despill(F)
    rgba = np.dstack([F, alpha * 255]).round().astype(np.uint8)
    return rgba, B


def despill(F):
    """Neutralise the red rim light the studio backdrop cast on his hair.

    Skin, lips and the shirt all have green/red ratios above ~0.45; the red
    spill on dark hair sits near 0.2. Pixels below 0.42 get their red pulled
    toward a neutral dark-brown balance, fading out as the ratio rises, so the
    character sits naturally on any page colour.
    """
    r, g, b = F[..., 0], F[..., 1], F[..., 2]
    ratio = g / (r + 1.0)
    w = np.clip((0.42 - ratio) / 0.17, 0, 1)
    neutral = np.minimum(r, 1.2 * np.maximum(g, b) + 6.0)
    out = F.copy()
    out[..., 0] = r * (1 - w) + neutral * w
    return out
