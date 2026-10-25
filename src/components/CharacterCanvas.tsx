import React, { useEffect, useRef, useState } from 'react';

/**
 * Cursor-following character.
 *
 * Frames are transparent WebPs produced by scripts/process_frames.py. Each
 * ring frame carries the screen-space direction the character is looking in
 * (measured by tracking his facial features through public/character.mp4), so
 * the renderer simply picks the frame whose measured direction is closest to
 * the direction from his face to the pointer. Nothing is assumed about frame
 * order.
 *
 * Angles: degrees in screen space, 0 = right, 90 = down (browser y grows
 * downward), 180 = left, 270 = up.
 */

interface FrameEntry {
  key: string;
  videoFrame: number;
  angle: number | null;
}

interface CharacterMeta {
  aspect: number;
  sizes: Record<'lg' | 'sm', [number, number]>;
  faceAnchor: { x: number; y: number };
  frames: FrameEntry[];
  /** gateway ring key -> morph frame keys from centre toward that gateway */
  transitions?: Record<string, string[]>;
}

interface RingFrame {
  angle: number;
  image: CanvasImageSource;
  key: string;
}

export interface FaceAnchor {
  /** 0..1 across the drawn image */
  x: number;
  /** 0..1 down the drawn image */
  y: number;
}

interface CharacterCanvasProps {
  /** Element whose area accepts touch input. Mouse/pen input is tracked across the whole window. */
  trackingRef?: React.RefObject<HTMLElement>;
  /** Override the face anchor from meta.json (normalised image coordinates). */
  faceAnchor?: FaceAnchor;
  className?: string;
}

const BASE = '/character';
const FACE_WIDTH = 0.26; // face width as a fraction of the image width
// Eye contact when the pointer rests within this radius of the face anchor
// (multiples of the drawn face width); he turns away again beyond LEAVE.
const EYE_CONTACT_RADIUS = 0.6;
const LEAVE_EYE_CONTACT_RADIUS = 0.85;
// The pointer must rest near the face this long before he looks back at the
// visitor, so sweeping across the face turns the head instead of flashing
// through the eye-contact frame.
const EYE_CONTACT_DWELL_MS = 160;
// The head turns by stepping through neighbouring ring frames (hard cuts,
// like playing the source clip), never by blending distant poses.
// STEP_MS sets the top turning speed: ~7.5 deg per step.
const STEP_MS = 16;
// The source clip has no frames between eye contact and most turned poses.
// scripts/make_morphs.py renders flow-based in-betweens to a few "gateway"
// poses (head tilted up or down); the head morphs to the nearest gateway and
// then turns through ring frames. MORPH_MS is the time per in-between frame.
const MORPH_MS = 24;
// Fallback only, if morph frames are missing: a short cross-dissolve.
const CENTER_FADE_MS = 140;

const angDist = (a: number, b: number) => {
  const d = Math.abs(a - b) % 360;
  return d > 180 ? 360 - d : d;
};

async function loadBitmap(src: string): Promise<CanvasImageSource> {
  const img = new Image();
  img.decoding = 'async';
  img.src = src;
  await img.decode();
  if ('createImageBitmap' in window) {
    try {
      return await createImageBitmap(img);
    } catch {
      /* fall back to the decoded <img> */
    }
  }
  return img;
}

export const CharacterCanvas: React.FC<CharacterCanvasProps> = ({ trackingRef, faceAnchor, className = '' }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const anchorOverride = useRef<FaceAnchor | undefined>(faceAnchor);
  anchorOverride.current = faceAnchor;
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let disposed = false;
    let meta: CharacterMeta | null = null;
    let center: CanvasImageSource | null = null;
    const ring: RingFrame[] = [];

    // --- layout ---------------------------------------------------------
    let rect = canvas.getBoundingClientRect();
    let dpr = 1;
    // drawn image box in CSS pixels, relative to the canvas
    const box = { x: 0, y: 0, w: 0, h: 0 };

    const layout = () => {
      rect = canvas.getBoundingClientRect();
      if (!meta) return;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.max(1, Math.round(rect.width * dpr));
      const h = Math.max(1, Math.round(rect.height * dpr));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
      // contain, anchored to the bottom so the shoulders sit on the section edge
      const scale = Math.min(rect.width / meta.aspect, rect.height);
      box.h = scale;
      box.w = scale * meta.aspect;
      box.x = (rect.width - box.w) / 2;
      box.y = rect.height - box.h;
      dirty = true;
    };

    // --- pointer --------------------------------------------------------
    const pointer = { x: 0, y: 0, active: false };
    let touchTimer = 0;

    const onPointerMove = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return;
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      pointer.active = true;
    };
    const onTouch = (e: PointerEvent) => {
      if (e.pointerType !== 'touch') return;
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      pointer.active = true;
      window.clearTimeout(touchTimer);
    };
    const onTouchEnd = (e: PointerEvent) => {
      if (e.pointerType !== 'touch') return;
      window.clearTimeout(touchTimer);
      touchTimer = window.setTimeout(() => (pointer.active = false), 900);
    };
    const onLeave = () => (pointer.active = false);

    const area: HTMLElement | Window = trackingRef?.current ?? window;
    // Mouse follows the cursor anywhere in the window (the fixed navbar sits
    // over the hero, so element-scoped listeners would lose it there).
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    area.addEventListener('pointerdown', onTouch as EventListener, { passive: true });
    area.addEventListener('pointermove', onTouch as EventListener, { passive: true });
    area.addEventListener('pointerup', onTouchEnd as EventListener, { passive: true });
    area.addEventListener('pointercancel', onTouchEnd as EventListener, { passive: true });
    document.documentElement.addEventListener('mouseleave', onLeave);

    // --- render state ---------------------------------------------------
    // ringIdx < 0 means eye contact (centre frame)
    let ringIdx = -1;
    let currentImg: CanvasImageSource | null = null;
    let previous: CanvasImageSource | null = null;
    let fadeStart = 0;
    let stepClock = 0;
    let nearSince = -1;
    // morph playback: frames still to show, then the state to land in
    let queue: { img: CanvasImageSource; key: string }[] = [];
    let landIdx = -1;
    let queueClock = 0;
    // gateway ring indices and their centre->gateway morph frames
    const gateways: { idx: number; frames: { img: CanvasImageSource; key: string }[] }[] = [];
    let dirty = true;
    let raf = 0;
    let visible = true;

    const nearestRing = (angle: number) => {
      let best = 0;
      let bestD = Infinity;
      ring.forEach((f, i) => {
        const d = angDist(angle, f.angle);
        if (d < bestD) {
          bestD = d;
          best = i;
        }
      });
      return best;
    };

    const show = (idx: number, now: number, dissolve: boolean) => {
      const img = idx < 0 ? center : ring[idx].image;
      if (!img) return;
      previous = dissolve ? currentImg : null;
      fadeStart = now;
      currentImg = img;
      ringIdx = idx;
      canvas.dataset.frame = idx < 0 ? 'center' : ring[idx].key;
      dirty = true;
    };

    const showRaw = (img: CanvasImageSource, key: string) => {
      previous = null;
      currentImg = img;
      canvas.dataset.frame = key;
      dirty = true;
    };

    /** gateway whose path (morph + ring steps) to `angle` is shortest */
    const gatewayFor = (angle: number) => {
      let best = gateways[0];
      let bestD = Infinity;
      for (const g of gateways) {
        const d = angDist(angle, ring[g.idx].angle);
        if (d < bestD) {
          bestD = d;
          best = g;
        }
      }
      return best;
    };

    const leaveCenter = (angle: number, now: number) => {
      if (!gateways.length) {
        show(nearestRing(angle), now, true);
        return;
      }
      const g = gatewayFor(angle);
      queue = [...g.frames, { img: ring[g.idx].image, key: ring[g.idx].key }];
      landIdx = g.idx;
      queueClock = now - MORPH_MS;
    };

    const enterCenter = (now: number) => {
      const g = gateways.find((x) => x.idx === ringIdx);
      if (!g) {
        show(-1, now, true);
        return;
      }
      queue = [...g.frames].reverse();
      if (center) queue.push({ img: center, key: 'center' });
      landIdx = -1;
      queueClock = now - MORPH_MS;
    };

    /** step one ring neighbour toward `target`; returns true if it moved */
    const stepToward = (target: number, now: number) => {
      const steps = Math.min(3, Math.floor((now - stepClock) / STEP_MS));
      if (target === ringIdx) {
        stepClock = now;
        return false;
      }
      if (steps <= 0) return false;
      const n = ring.length;
      let cur = ringIdx;
      for (let s = 0; s < steps && cur !== target; s++) {
        const fwd = (target - cur + n) % n;
        cur = (cur + (fwd <= n / 2 ? 1 : n - 1)) % n;
      }
      show(cur, now, false);
      stepClock = now;
      return true;
    };

    const draw = (now: number) => {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (!currentImg) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      const lin = previous ? Math.min(1, (now - fadeStart) / CENTER_FADE_MS) : 1;
      const t = lin * lin * (3 - 2 * lin);
      if (previous && t < 1) {
        // Additive blend of premultiplied colours = a true cross-dissolve: the
        // static body stays fully opaque while only the head changes.
        ctx.globalCompositeOperation = 'lighter';
        ctx.globalAlpha = 1 - t;
        ctx.drawImage(previous, box.x, box.y, box.w, box.h);
        ctx.globalAlpha = t;
        ctx.drawImage(currentImg, box.x, box.y, box.w, box.h);
        ctx.globalAlpha = 1;
        ctx.globalCompositeOperation = 'source-over';
      } else {
        previous = null;
        ctx.drawImage(currentImg, box.x, box.y, box.w, box.h);
      }
    };

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      if (!visible || !meta || !center) return;

      // where is the pointer relative to his face?
      let dist = 0;
      let angle = 0;
      let face = 1;
      if (pointer.active) {
        const anchor = anchorOverride.current ?? meta.faceAnchor;
        const dx = pointer.x - (rect.left + box.x + anchor.x * box.w);
        const dy = pointer.y - (rect.top + box.y + anchor.y * box.h);
        dist = Math.hypot(dx, dy);
        angle = ((Math.atan2(dy, dx) * 180) / Math.PI + 360) % 360;
        face = box.w * FACE_WIDTH;
      }
      const fading = previous !== null && now - fadeStart < CENTER_FADE_MS;

      if (queue.length) {
        // playing a morph: one in-between per MORPH_MS
        if (now - queueClock >= MORPH_MS) {
          const f = queue.shift()!;
          showRaw(f.img, f.key);
          queueClock = now;
          if (!queue.length) {
            ringIdx = landIdx;
            stepClock = now;
          }
        }
      } else if (!fading && ring.length) {
        if (ringIdx < 0) {
          // eye contact: turn away once the pointer leaves the face
          if (pointer.active && dist > face * LEAVE_EYE_CONTACT_RADIUS) leaveCenter(angle, now);
        } else {
          const near = !pointer.active || dist < face * EYE_CONTACT_RADIUS;
          if (near) {
            if (nearSince < 0) nearSince = now;
          } else {
            nearSince = -1;
          }
          if (near && now - nearSince >= EYE_CONTACT_DWELL_MS) {
            // head back to the nearest gateway pose, then morph to eye contact
            const g = gateways.length ? gatewayFor(ring[ringIdx].angle) : null;
            if (!g || g.idx === ringIdx) {
              nearSince = -1;
              enterCenter(now);
            } else {
              stepToward(g.idx, now);
            }
          } else if (!near) {
            // small hysteresis so a pointer resting between two frames does not flicker
            const target = angDist(angle, ring[ringIdx].angle) <= 5 ? ringIdx : nearestRing(angle);
            stepToward(target, now);
          }
        }
      }
      if (dirty || previous) {
        draw(now);
        dirty = false;
      }
    };

    // --- visibility -----------------------------------------------------
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) layout();
    });
    io.observe(canvas);
    const ro = new ResizeObserver(layout);
    ro.observe(canvas);
    const onScroll = () => {
      rect = canvas.getBoundingClientRect();
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', layout);

    // --- loading --------------------------------------------------------
    (async () => {
      try {
        const res = await fetch(`${BASE}/meta.json`);
        if (!res.ok) throw new Error(`meta.json ${res.status}`);
        const m = (await res.json()) as CharacterMeta;
        if (disposed) return;
        meta = m;
        layout();
        const size = rect.height * Math.min(window.devicePixelRatio || 1, 2) > 620 ? 'lg' : 'sm';
        const centerEntry = m.frames.find((f) => f.key === 'center');
        center = await loadBitmap(`${BASE}/${size}/${centerEntry?.key ?? 'center'}.webp`);
        if (disposed) return;
        currentImg = center;
        ringIdx = -1;
        canvas.dataset.frame = 'center';
        dirty = true;
        setReady(true);
        // ring frames load in the background; gaze tracking starts once all are in
        const entries = m.frames.filter((f) => f.angle !== null);
        const loaded = await Promise.all(
          entries.map(async (f) => ({ key: f.key, angle: f.angle as number, image: await loadBitmap(`${BASE}/${size}/${f.key}.webp`) })),
        );
        if (disposed) return;
        ring.push(...loaded);
        // morph in-betweens toward each gateway pose
        const trans = Object.entries(m.transitions ?? {});
        const morphs = await Promise.all(
          trans.map(async ([gKey, keys]) => ({
            idx: ring.findIndex((f) => f.key === gKey),
            frames: await Promise.all(keys.map(async (k) => ({ key: k, img: await loadBitmap(`${BASE}/${size}/${k}.webp`) }))),
          })),
        ).catch((err) => {
          console.warn('Morph frames unavailable; using cross-dissolve', err);
          return [];
        });
        if (disposed) return;
        gateways.push(...morphs.filter((g) => g.idx >= 0));
        canvas.dataset.ready = 'true';
      } catch (err) {
        console.error('Character frames failed to load', err);
        if (!disposed) setFailed(true);
      }
    })();

    raf = requestAnimationFrame(tick);

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      window.clearTimeout(touchTimer);
      io.disconnect();
      ro.disconnect();
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', layout);
      window.removeEventListener('pointermove', onPointerMove);
      area.removeEventListener('pointerdown', onTouch as EventListener);
      area.removeEventListener('pointermove', onTouch as EventListener);
      area.removeEventListener('pointerup', onTouchEnd as EventListener);
      area.removeEventListener('pointercancel', onTouchEnd as EventListener);
      document.documentElement.removeEventListener('mouseleave', onLeave);
      for (const f of ring) if ('close' in f.image) (f.image as ImageBitmap).close();
      for (const g of gateways) for (const f of g.frames) if ('close' in f.img) (f.img as ImageBitmap).close();
      if (center && 'close' in center) (center as ImageBitmap).close();
    };
  }, [trackingRef]);

  return (
    <div className={`relative ${className}`}>
      {failed ? (
        <img
          src="/character/sm/center.webp"
          alt="Illustrated portrait of Ayush Maurya"
          className="absolute inset-0 h-full w-full object-contain object-bottom"
        />
      ) : (
        <canvas
          ref={canvasRef}
          role="img"
          aria-label="Illustrated portrait of Ayush Maurya that turns to follow your cursor"
          className="absolute inset-0 h-full w-full select-none transition-opacity duration-700"
          style={{ opacity: ready ? 1 : 0 }}
        />
      )}
    </div>
  );
};
