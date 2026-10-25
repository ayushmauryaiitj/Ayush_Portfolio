# Ayush Maurya · Portfolio

React + TypeScript + Vite + Tailwind. One page: hero with an interactive character, About, Projects, Achievements, Skills, Contact.

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # type-check + production build into dist/
```

## Content

All personal content lives in two files so it can be edited without touching components:

- `src/data/profile.ts`: intro, education, coursework, achievements, skills, contact links (source: resume, Oct 2026).
- `src/data/projects.ts`: featured and secondary projects (source: resume, plus each repo's public README for extra detail and figures).

Project images in `public/projects/` are screenshots of the live demos (PolarEMS, Aastha Medico, Crop Yield) or charts committed to the public repos (Monsoon, LSTM).

## Character pipeline

Runtime assets are in `public/character/`:

- `lg/` (960 px tall) and `sm/` (540 px tall): `center.webp` (eye contact) and `r00`…`r47.webp`, one per gaze direction, with alpha.
- `meta.json`: each frame's measured gaze angle, the source video frame, the image aspect ratio and the face anchor.

They are generated from `assets_source/character.mp4` (the original video; `assets_source/frames/` holds the original 64 extracted frames as a backup):

```bash
python scripts/gaze_track.py     # writes assets_source/gaze_track.json
python scripts/process_frames.py # writes public/character/
python scripts/make_morphs.py    # in-between frames for eye contact <-> turned
```

- `scripts/matte.py` removes the background. The backdrop is a red gradient (about #af1310 at the edges, #e53727 behind the head), so it is modelled per frame with a smooth 2-D polynomial; alpha comes from colour distance, green/red chroma and darkening relative to that model, and edge colours are un-mixed from the background so no red fringe remains.
- `scripts/gaze_track.py` tracks facial feature points from frame 0 (eye contact) through the clip. Their median displacement is the direction he is looking, in screen space (y down).
- `scripts/process_frames.py` picks 48 frames that cover 360° as evenly as the clip allows, mattes them, crops all to one shared box and writes the WebPs and metadata.

- `scripts/make_morphs.py` renders optical-flow in-betweens from the eye-contact frame to six "gateway" poses (head tilted up or down), where flow tracks cleanly.

`src/components/CharacterCanvas.tsx` never blends two different poses. The head turns by stepping through neighbouring ring frames toward the frame whose measured angle matches the pointer direction. Eye contact (pointer resting on the face) and leaving it play the morph frames to the nearest gateway, then continue around the ring. Tunables (eye-contact radius, smoothing, fade times) are constants at the top of the file; the face anchor can be overridden with the `faceAnchor` prop.

## Archived files

`assets_archive/` holds files from the earlier version that are no longer used: the old components with placeholder content, the broken transparent frames and their metadata, and duplicate assets. Nothing there is loaded by the site.
