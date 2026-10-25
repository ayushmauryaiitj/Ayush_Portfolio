"""Build the transparent, gaze-calibrated frame set used by CharacterCanvas.

Usage: python scripts/process_frames.py
Inputs : assets_source/character.mp4, assets_source/gaze_track.json (from gaze_track.py)
Outputs: public/character/{lg,sm}/{center,rNN}.webp, public/character/meta.json

The original video and public/frames/ are left untouched as backups.
"""
import json
import math
import os
import sys

import cv2
import numpy as np
from PIL import Image

sys.path.insert(0, os.path.dirname(__file__))
from matte import matte  # noqa: E402

N_RING = 48
SIZES = {'lg': 960, 'sm': 540}
OUT = 'public/character'
# Head-turn amplitude measured from gaze_track.json (pixels in the 1080p source)
RX_POS, RX_NEG, RY_NEG, RY_POS = 175.0, 200.0, 68.0, 42.0


def norm(dx, dy):
    return dx / (RX_POS if dx > 0 else RX_NEG), dy / (RY_NEG if dy < 0 else RY_POS)


track = json.load(open('assets_source/gaze_track.json'))
cap = cv2.VideoCapture('assets_source/character.mp4')
video = []
while True:
    ok, f = cap.read()
    if not ok:
        break
    video.append(cv2.cvtColor(f, cv2.COLOR_BGR2RGB))

# Candidate ring frames: head clearly turned. Fully turned frames are preferred;
# the clip only reaches the up-left sector on its way back to centre, so
# partially turned frames are accepted there rather than leaving a gap.
cands = []
for t in track:
    nx, ny = norm(t['dx'], t['dy'])
    r = math.hypot(nx, ny)
    if r >= 0.3 and t['videoFrame'] >= 24:
        cands.append((t['videoFrame'], math.degrees(math.atan2(ny, nx)) % 360, r, t['dx'], t['dy']))


def angdist(a, b):
    d = abs(a - b) % 360
    return min(d, 360 - d)


picked = []
for k in range(N_RING):
    target = k * 360 / N_RING
    best = min(cands, key=lambda c: angdist(c[1], target) + 8.0 * max(0.0, 0.95 - c[2]))
    if best not in picked:
        picked.append(best)
picked.sort(key=lambda c: c[1])
print('ring frames:', len(picked))

entries = [{'key': 'center', 'videoFrame': 0, 'angle': None, 'dx': 0.0, 'dy': 0.0}]
for i, c in enumerate(picked):
    entries.append({'key': f'r{i:02d}', 'videoFrame': c[0], 'angle': round(c[1], 2),
                    'dx': round(c[3], 1), 'dy': round(c[4], 1)})

mattes = {}
for e in entries:
    rgba, _ = matte(video[e['videoFrame']])
    mattes[e['key']] = rgba
    print('matted', e['key'], e['videoFrame'])

# union crop over every frame so all frames share one coordinate system
union = np.zeros(video[0].shape[:2], bool)
for rgba in mattes.values():
    union |= rgba[..., 3] > 8
ys, xs = np.nonzero(union)
x0, x1 = max(xs.min() - 8, 0), min(xs.max() + 9, union.shape[1])
y0, y1 = max(ys.min() - 8, 0), union.shape[0]
cw, ch = x1 - x0, y1 - y0
print('crop', x0, y0, x1, y1)

for size, h in SIZES.items():
    os.makedirs(f'{OUT}/{size}', exist_ok=True)
    w = round(cw * h / ch)
    for e in entries:
        im = Image.fromarray(mattes[e['key']][y0:y1, x0:x1]).resize((w, h), Image.LANCZOS)
        im.save(f'{OUT}/{size}/{e["key"]}.webp', 'WEBP', quality=86, method=6, exact=True)
    print(size, w, h)

# Face anchor (point between the eyes in frame 0) in normalised crop coords
EYE_X, EYE_Y = 960, 440
meta = {
    'source': 'assets_source/character.mp4',
    'aspect': cw / ch,
    'sizes': {k: [round(cw * v / ch), v] for k, v in SIZES.items()},
    'faceAnchor': {'x': (EYE_X - x0) / cw, 'y': (EYE_Y - y0) / ch},
    'angleConvention': 'degrees, screen space: 0=right, 90=down, 180=left, 270=up',
    'frames': entries,
}
json.dump(meta, open(f'{OUT}/meta.json', 'w'), indent=1)
print(json.dumps({k: meta[k] for k in ('aspect', 'sizes', 'faceAnchor')}))
