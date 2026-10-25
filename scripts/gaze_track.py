"""Measure the head/gaze direction of every video frame.

Facial feature points (eyes, nose, mouth, beard) are tracked with pyramidal
Lucas-Kanade from frame 0 (direct eye contact) through the whole clip. When the
head turns, these points move in the image in the direction the character is
looking (turn to screen-right -> features shift right; look up -> shift up), so
the median displacement relative to frame 0 is the gaze vector in screen space
(y grows downward, matching browser coordinates).
"""
import json
import sys
import cv2
import numpy as np

src = sys.argv[1] if len(sys.argv) > 1 else 'assets_source/character.mp4'
cap = cv2.VideoCapture(src)
frames = []
while True:
    ok, f = cap.read()
    if not ok:
        break
    frames.append(cv2.cvtColor(f, cv2.COLOR_BGR2GRAY))

g0 = frames[0]
# face interior (eyes..chin) in frame 0; found by inspecting the frame
x0, y0, x1, y1 = 830, 330, 1090, 640
mask = np.zeros_like(g0)
mask[y0:y1, x0:x1] = 255
p0 = cv2.goodFeaturesToTrack(g0, 300, 0.01, 6, mask=mask)
lk = dict(winSize=(31, 31), maxLevel=4,
          criteria=(cv2.TERM_CRITERIA_EPS | cv2.TERM_CRITERIA_COUNT, 30, 0.01))

pts = p0.copy()
alive = np.ones(len(pts), bool)
out = [{'videoFrame': 0, 'dx': 0.0, 'dy': 0.0, 'n': int(alive.sum())}]
for i in range(1, len(frames)):
    p1, st, _ = cv2.calcOpticalFlowPyrLK(frames[i - 1], frames[i], pts, None, **lk)
    pb, stb, _ = cv2.calcOpticalFlowPyrLK(frames[i], frames[i - 1], p1, None, **lk)
    fb = np.linalg.norm((pb - pts).reshape(-1, 2), axis=1)
    alive &= (st.ravel() == 1) & (stb.ravel() == 1) & (fb < 1.0)
    pts = p1
    d = (pts - p0).reshape(-1, 2)[alive]
    dx, dy = np.median(d, axis=0) if len(d) else (np.nan, np.nan)
    out.append({'videoFrame': i, 'dx': float(dx), 'dy': float(dy), 'n': int(alive.sum())})

json.dump(out, open(sys.argv[2] if len(sys.argv) > 2 else 'assets_source/gaze_track.json', 'w'), indent=1)
for o in out[::4]:
    print(o['videoFrame'], round(o['dx'], 1), round(o['dy'], 1), o['n'])
