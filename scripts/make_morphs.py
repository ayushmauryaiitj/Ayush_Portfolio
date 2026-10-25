"""In-between frames for the eye-contact <-> turned transition.

The source clip has no frames between direct eye contact and most turned
poses, and a plain cross-dissolve shows two faces at once. For a few "gateway"
frames whose pose is close enough for optical flow to track (head tilted up or
down; large left/right turns are not), this script renders flow-based morphs
from the centre frame to the gateway. At runtime the head morphs to the
nearest gateway and then turns through the ring frames to the target.

Usage: python scripts/make_morphs.py   (after process_frames.py)
"""
import json
import os

import cv2
import numpy as np
from PIL import Image

OUT = 'public/character'
GATEWAYS = ['r07', 'r11', 'r15', 'r31', 'r35', 'r38']  # checked visually: clean morphs
STEPS = [0.25, 0.5, 0.75]
BG = np.array([176, 22, 17], np.float32)


def load(size, key):
    return np.array(Image.open(f'{OUT}/{size}/{key}.webp').convert('RGBA')).astype(np.float32)


def gray(a):
    al = a[..., 3:] / 255
    return cv2.cvtColor((a[..., :3] * al + BG * (1 - al)).astype(np.uint8), cv2.COLOR_RGB2GRAY)


def warp(img, flow):
    h, w = flow.shape[:2]
    gx, gy = np.meshgrid(np.arange(w, dtype=np.float32), np.arange(h, dtype=np.float32))
    return cv2.remap(img, gx + flow[..., 0], gy + flow[..., 1], cv2.INTER_LINEAR, borderMode=cv2.BORDER_REPLICATE)


def premul(a):
    b = a.copy()
    b[..., :3] *= a[..., 3:] / 255
    return b


def unpremul(a):
    b = a.copy()
    b[..., :3] /= np.maximum(a[..., 3:], 1e-3) / 255
    return np.clip(b, 0, 255)


meta = json.load(open(f'{OUT}/meta.json'))
dis = cv2.DISOpticalFlow_create(cv2.DISOPTICAL_FLOW_PRESET_MEDIUM)
transitions = {}
for size in meta['sizes']:
    C = load(size, 'center')
    for g in GATEWAYS:
        R = load(size, g)
        f_cr = dis.calc(gray(C), gray(R), None)  # C(p) ~ R(p + f_cr)
        f_rc = dis.calc(gray(R), gray(C), None)
        keys = []
        for i, t in enumerate(STEPS, 1):
            m = unpremul((1 - t) * warp(premul(C), t * f_rc) + t * warp(premul(R), (1 - t) * f_cr))
            key = f'm_{g}_{i}'
            Image.fromarray(m.round().astype(np.uint8)).save(f'{OUT}/{size}/{key}.webp', 'WEBP', quality=86, method=6, exact=True)
            keys.append(key)
        transitions[g] = keys
    print(size, 'done')

meta['transitions'] = transitions
json.dump(meta, open(f'{OUT}/meta.json', 'w'), indent=1)
print(json.dumps(transitions))
