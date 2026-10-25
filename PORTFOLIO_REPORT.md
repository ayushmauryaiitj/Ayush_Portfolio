# Portfolio overhaul: report

## Needs your input

1. **Resume file.** Confirmed: the attached `ayush_maurya_resume.pdf` is byte-identical (same MD5) to the Desktop copy all content was taken from.
2. **Phone number.** Added to the Contact section at your request (+91 81123 27192, tap-to-call).
3. **Degree year.** The resume's education row reads "8.50 / Aug 2026", which reads like an admission or semester date rather than graduation, so I show the CGPA without a year.

## Bugs found and fixed

**A. Rectangular red background.** The old `transparent_frames` had been keyed on "reddish" pixels, which erased most of the face, neck and beard, so the site fell back to the opaque frames inside a box. The backdrop is a gradient (about #af1310 at the edges to #e53727 behind the head), not a flat colour. New pipeline (`scripts/matte.py`) models that gradient per frame, builds alpha from colour distance plus chroma and darkness cues, fills interior holes, and un-mixes edge colours so there is no red fringe. Checked on green, crimson and white backgrounds, and at 1:1 on hair, ears, beard and collar edges.

**B. Wrong gaze direction.** The old `frames_meta` angles came from a nose tracker that barely moved: frames 0–7 and the "up" frames were labelled as 0° (right), and many labels were clipped at ±80 px. I re-measured gaze by tracking 120+ facial feature points through all 240 video frames and validated the result by eye on a labelled contact sheet. The renderer now picks the frame whose measured angle is closest to the face-to-pointer angle. There is no assumed frame order and no inversion.

**C. Small, boxed character.** He is now drawn bottom-anchored straight on the page background, about 90% of viewport height on desktop (806 px at 1440×900), centred at 66% of the width. There is no card, border, panel or container background.

## Verification actually run

- `npm run build` (tsc + vite build) passes with no errors. The `tsc --noEmit` type-check is clean.
- **Gaze, 16 cursor directions** at 22.5° steps (includes all 8 required) in the running app. Every one selected a frame within 5° of the cursor angle, except 22.5°, where the nearest frame the clip offers is 17.6°. Spot-checked visually in the browser: up-right, down-left and left.
- **Eye contact:** cursor on the face shows `center`, and moving off it fades to a turned frame.
- **Touch:** touching the left of the hero turns him left; releasing returns him to eye contact after about 1 s.
- **Responsive:** 1440×900, 1024×700 and 390×844. No horizontal scroll and no text/character overlap. The mobile menu opens and closes.
- **Console:** no errors.
- **Links:** every external URL returned 200, or a Streamlit/LinkedIn redirect. All local image paths resolve.
- **Render cost:** a full-canvas cross-fade draw measured 0.45 ms. I could not measure real FPS because the preview browser throttles animation frames while it is in the background.

## Content integrated

From the resume: name, programme, IIT Jodhpur, CGPA 8.50, Class 10 (94.6%, 2022) and 12 (71.2%, 2024), skills, key coursework, the three projects (PolarEMS, Monsoon & Drought Analytics, Aastha Medico), the four achievements with their exact standing (Winner team in the internal round, 1st, 3rd, Top 10 finalist), email, GitHub and LinkedIn.

From public GitHub READMEs: PolarEMS team name and its "prototype, not hardware control" note; the Monsoon dataset size; two extra repos shown as smaller cards, the LSTM rainfall forecaster (R² 0.64) and Crop Yield Prediction (R² 0.98).

KrishiMitra appears only as the hackathon entry, as on the resume. Its repo README brands it "FarmGenius" and doesn't show your individual part, so I didn't present it as your project.

**LinkedIn:** the profile needs sign-in, so nothing from it was verified or used beyond the link itself.

All placeholder content was removed, including "Creative Director", "10+ years", "40+ awards", "$100M+ impact", the Unsplash images, the fake availability badge and the non-functional sound toggle.

## Files

- New: `src/data/profile.ts`, `src/data/projects.ts`, `src/components/{AboutSection,ProjectsSection,AchievementsSection,SkillsSection,ContactSection,SectionHeading}.tsx`, `scripts/{matte,gaze_track,process_frames}.py`, `public/character/**`, `public/projects/*.webp`, `public/favicon.svg`, `README.md`.
- Rewritten: `CharacterCanvas.tsx`, `HeroSection.tsx`, `Navbar.tsx`, `Footer.tsx`, `App.tsx`, `index.css`, `tailwind.config.js`, `index.html`.
- Moved, not deleted: the source video and original frames are in `assets_source/`. The old components, broken transparent frames and duplicate assets are in `assets_archive/`. Moving them out of `public/` cut the built site from about 28 MB to 5.7 MB.
- Removed unused dependencies: `framer-motion`, `clsx`, `tailwind-merge`.

## Known limitations

- **Coverage between angles.** The source clip covers the up-left sector only on its way back to centre, so those frames are partly turned (an honest direction, smaller turn). The angle between neighbouring frames is at most about 11°.
- **Shirt movement.** The source video's shirt shifts very slightly between frames. The cross-fade hides it, but the body is not pixel-identical across directions.
- **Memory.** The 49 decoded desktop frames use about 200 MB of image memory. Phones get the 540 px set, about 65 MB. If that is too heavy, `N_RING` in `process_frames.py` can drop to 36.
- **Sleeping demos.** The Streamlit demos sleep when idle and show a wake button on first visit.
- **No version control.** The project is not a git repository, so there is no commit or PR. I'd suggest `git init` before further changes.

## Update: smoother transitions (after your screen recording)

The double faces in your recording came from cross-fading between very different poses, especially when the cursor crossed his face. Now:

- Turning steps through neighbouring frames one at a time (no blending), so a sweep plays like the source clip.
- Eye contact only starts after the cursor rests on his face for 0.16 s, so passing over the face doesn't flash the front-facing frame.
- Going into and out of eye contact plays optical-flow in-between frames to the nearest up/down pose, then turns around to the target. No two faces are ever drawn at once.
- The cursor is tracked over the whole window (it was lost over the navbar before).

Tested in headless Edge at real frame rate (145 rAF/s): a fast sweep through the face, a full circle (48 consecutive frames) and entering/leaving eye contact all produced continuous frame sequences. All 8 directions plus 3 in-between angles land within 5° of the cursor. Screenshots during the sweep showed no ghosting.

## Update: formal colour palette

The red theme was replaced with deep navy (#0f1b2d / #0b1524), ivory text and a muted brass accent (#c8a96a). The character frames were regenerated with a despill step (`despill()` in `scripts/matte.py`) that removes the red rim light the original backdrop left on his hair, so he sits naturally on navy. The dev server now restarts itself when `tailwind.config.js` changes (the old server had kept serving a stale theme).
