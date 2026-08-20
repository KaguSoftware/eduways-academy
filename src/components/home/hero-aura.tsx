"use client";

import * as React from "react";
import { useLocale } from "next-intl";
import { useReducedMotion } from "motion/react";
import { isRtl } from "@/i18n/routing";

type Orb = {
  /** Centre of the orb as a fraction of the hero box; x is mirrored in RTL. */
  x: number;
  y: number;
  /** Size in rem (ellipses allowed — the top halo is a wide one). */
  w: number;
  h: number;
  /** Fill: any CSS colour, faded to transparent by a closest-side radial gradient. */
  tint: string;
  blur: number;
  opacity: number;
  /** Idle drift: amplitude in px and period in seconds, per axis. */
  ax: number;
  ay: number;
  tx: number;
  ty: number;
  /** Phase offset in seconds, so the orbs never swim in lockstep. */
  phase: number;
  /** How far the orb leans toward the cursor (px) — small values read as depth. */
  depth: number;
  /** How hard the cursor pushes it aside when the pointer is on top of it (px). */
  push: number;
  /** How much a fast cursor sweep drags the orb along with it (px per px/s). */
  stir: number;
  /** Peak squash-and-stretch along the direction of travel, 0–1. */
  squash: number;
};

/**
 * Periods are deliberately non-multiples of each other, so each orb's path is a
 * Lissajous curve long enough that the loop never becomes visible.
 */
const ORBS: Orb[] = [
  // Brand halo behind the headline — the anchor; moves least and barely deforms.
  { x: 0.5, y: 0.0, w: 56, h: 34, tint: "color-mix(in oklab, var(--brand-200) 68%, transparent)", blur: 44, opacity: 0.8, ax: 28, ay: 16, tx: 29, ty: 41, phase: 0, depth: 14, push: 40, stir: 0.012, squash: 0.05 },
  // Cyan orb, trailing edge — the one the stats column sits against.
  { x: 0.92, y: 0.18, w: 27, h: 27, tint: "color-mix(in oklab, var(--accent-400) 58%, transparent)", blur: 54, opacity: 0.6, ax: 44, ay: 32, tx: 23, ty: 31, phase: 5.5, depth: 30, push: 96, stir: 0.03, squash: 0.18 },
  // Deeper blue, leading edge low — balances the composition.
  { x: 0.05, y: 0.84, w: 30, h: 30, tint: "color-mix(in oklab, var(--brand-300) 60%, transparent)", blur: 58, opacity: 0.56, ax: 36, ay: 28, tx: 37, ty: 19, phase: 11, depth: 26, push: 88, stir: 0.028, squash: 0.16 },
  // Small, fast, most reactive — the one you notice chasing the cursor.
  { x: 0.64, y: 0.66, w: 19, h: 19, tint: "color-mix(in oklab, var(--accent-300) 72%, transparent)", blur: 44, opacity: 0.52, ax: 56, ay: 40, tx: 17, ty: 13, phase: 3, depth: 42, push: 132, stir: 0.045, squash: 0.24 },
];

const TAU = Math.PI * 2;
/**
 * Under-damped on purpose: critical damping here would be ~2·√62 ≈ 15.7, so at 10
 * the orbs overshoot slightly and wobble back — that momentum is what makes the
 * field read as liquid rather than as four divs following the cursor.
 */
const SPRING_K = 62;
const SPRING_D = 10;
/** Seconds for the proximity glow to catch up, and for interaction to fade in/out. */
const GLOW_TAU = 0.22;
const ENGAGE_TAU = 0.4;
/** Extra reach beyond an orb's own radius where the cursor still affects it. */
const REACH = 170;
/** Cursor speed (px/s) that produces the full stir effect. */
const STIR_CAP = 1800;
/** Nothing may travel further than this from its home position. */
const MAX_OFFSET = 190;

export function HeroAura({ className }: { className?: string }) {
  const reduced = useReducedMotion();
  const rtl = isRtl(useLocale());
  const hostRef = React.useRef<HTMLDivElement>(null);
  const orbRefs = React.useRef<(HTMLDivElement | null)[]>([]);

  React.useEffect(() => {
    // Reduced motion keeps the composition, drops every moving part.
    if (reduced) return;
    const host = hostRef.current;
    if (!host) return;

    const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const pointer = { x: 0, y: 0, vx: 0, vy: 0, t: 0, primed: false, inside: false };
    // Each orb is a spring-mass: offset from home, its velocity, and the proximity glow.
    const state = ORBS.map(() => ({ x: 0, y: 0, vx: 0, vy: 0, glow: 0 }));
    let engage = 0;
    let elapsed = 0;
    let last = 0;
    let raf = 0;
    let running = false;

    const onPointerMove = (e: PointerEvent) => {
      const now = e.timeStamp || performance.now();
      const dt = (now - pointer.t) / 1000;
      if (pointer.primed && dt > 0.001) {
        pointer.vx = (e.clientX - pointer.x) / dt;
        pointer.vy = (e.clientY - pointer.y) / dt;
      }
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      pointer.t = now;
      pointer.primed = true;
    };

    // A click sends a shockwave through the field — the springs already handle the rest.
    const onPointerDown = (e: PointerEvent) => {
      const rect = host.getBoundingClientRect();
      const px = e.clientX - rect.left;
      const py = e.clientY - rect.top;
      if (px < 0 || py < 0 || px > rect.width || py > rect.height) return;
      for (let i = 0; i < ORBS.length; i++) {
        const o = ORBS[i];
        const dx = (rtl ? 1 - o.x : o.x) * rect.width + state[i].x - px;
        const dy = o.y * rect.height + state[i].y - py;
        const dist = Math.hypot(dx, dy) || 1;
        const falloff = Math.max(0, 1 - dist / (rect.width * 0.75));
        const impulse = falloff * falloff * 900 * (o.push / 132);
        state[i].vx += (dx / dist) * impulse;
        state[i].vy += (dy / dist) * impulse;
      }
    };

    const frame = (now: number) => {
      const dt = Math.min(0.033, (now - last) / 1000) || 0;
      last = now;
      elapsed += dt;

      const rect = host.getBoundingClientRect();
      pointer.inside =
        canHover &&
        pointer.primed &&
        pointer.x >= rect.left - 40 &&
        pointer.x <= rect.right + 40 &&
        pointer.y >= rect.top - 40 &&
        pointer.y <= rect.bottom + 40;

      // The cursor stops firing events when it stops moving, so bleed its speed off here.
      const decay = Math.exp(-dt / 0.12);
      pointer.vx *= decay;
      pointer.vy *= decay;

      engage += ((pointer.inside ? 1 : 0) - engage) * (1 - Math.exp(-dt / ENGAGE_TAU));
      const glowK = 1 - Math.exp(-dt / GLOW_TAU);

      const px = pointer.x - rect.left;
      const py = pointer.y - rect.top;
      const rem = 16;

      for (let i = 0; i < ORBS.length; i++) {
        const el = orbRefs.current[i];
        if (!el) continue;
        const o = ORBS[i];
        const s = state[i];

        // Idle swim: two out-of-phase sines per axis so the path curls instead of ovalling.
        const driftX =
          o.ax * Math.sin((TAU * elapsed) / o.tx + o.phase) +
          o.ax * 0.4 * Math.sin((TAU * elapsed) / (o.tx * 0.61) + o.phase * 1.7);
        const driftY =
          o.ay * Math.sin((TAU * elapsed) / o.ty + o.phase * 1.3) +
          o.ay * 0.4 * Math.sin((TAU * elapsed) / (o.ty * 0.57) + o.phase);

        let targetX = 0;
        let targetY = 0;
        let near = 0;

        if (engage > 0.001) {
          const cx = (rtl ? 1 - o.x : o.x) * rect.width;
          const cy = o.y * rect.height;
          const dx = cx - px;
          const dy = cy - py;
          const dist = Math.hypot(dx, dy) || 1;
          const reach = (Math.max(o.w, o.h) * rem) / 2 + REACH;
          // Squared falloff: the push builds up as the cursor closes in, rather than snapping on.
          near = Math.max(0, 1 - dist / reach) ** 2;

          // The whole field leans toward the cursor by depth…
          const leanX = (px / rect.width - 0.5) * 2 * o.depth;
          const leanY = (py / rect.height - 0.5) * 2 * o.depth;
          // …the orb under it is displaced along the cursor→orb vector…
          const pushX = (dx / dist) * near * o.push;
          const pushY = (dy / dist) * near * o.push;
          // …and a fast sweep drags it along, the way stirring drags liquid.
          const stirX = clamp(pointer.vx, -STIR_CAP, STIR_CAP) * near * o.stir;
          const stirY = clamp(pointer.vy, -STIR_CAP, STIR_CAP) * near * o.stir;

          targetX = clamp(leanX + pushX + stirX, -MAX_OFFSET, MAX_OFFSET) * engage;
          targetY = clamp(leanY + pushY + stirY, -MAX_OFFSET, MAX_OFFSET) * engage;
        }

        // Semi-implicit Euler — stable at the dt values a rAF loop actually sees.
        s.vx += ((targetX - s.x) * SPRING_K - s.vx * SPRING_D) * dt;
        s.vy += ((targetY - s.y) * SPRING_K - s.vy * SPRING_D) * dt;
        s.x += s.vx * dt;
        s.y += s.vy * dt;
        s.glow += (near * engage - s.glow) * glowK;

        // Breathing: scale and opacity swell on separate periods, so they never peak together.
        const bt = o.tx * 0.42;
        const breatheS = 1 + 0.075 * Math.sin((TAU * elapsed) / bt + o.phase);
        const breatheO = 1 + 0.16 * Math.sin((TAU * elapsed) / (bt * 1.37) + o.phase * 0.7);
        const scale = breatheS + s.glow * 0.14;

        // Squash and stretch along the direction of travel — the orb elongates as it moves.
        const speed = Math.hypot(s.vx, s.vy);
        const stretch = Math.min(o.squash, speed / 2600);
        const angle = stretch > 0.002 ? (Math.atan2(s.vy, s.vx) * 180) / Math.PI : 0;

        el.style.transform =
          `translate3d(${(driftX + s.x).toFixed(2)}px, ${(driftY + s.y).toFixed(2)}px, 0)` +
          (angle ? ` rotate(${angle.toFixed(1)}deg)` : "") +
          ` scale(${(scale * (1 + stretch)).toFixed(4)}, ${(scale * (1 - stretch * 0.55)).toFixed(4)})` +
          (angle ? ` rotate(${(-angle).toFixed(1)}deg)` : "");
        el.style.opacity = Math.min(1, o.opacity * breatheO * (1 + s.glow * 0.6)).toFixed(3);
      }

      raf = requestAnimationFrame(frame);
    };

    const start = () => {
      if (running) return;
      running = true;
      last = performance.now();
      raf = requestAnimationFrame(frame);
    };
    const stop = () => {
      if (!running) return;
      running = false;
      cancelAnimationFrame(raf);
    };

    // Only animate while the hero is on screen and the tab is in front.
    let visible = false;
    const sync = () => (visible && !document.hidden ? start() : stop());
    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        sync();
      },
      { threshold: 0 },
    );
    io.observe(host);
    document.addEventListener("visibilitychange", sync);
    if (canHover) {
      window.addEventListener("pointermove", onPointerMove, { passive: true });
      window.addEventListener("pointerdown", onPointerDown, { passive: true });
    }

    return () => {
      stop();
      io.disconnect();
      document.removeEventListener("visibilitychange", sync);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerdown", onPointerDown);
    };
  }, [reduced, rtl]);

  return (
    <div ref={hostRef} aria-hidden className={className}>
      {ORBS.map((o, i) => (
        <div
          key={i}
          ref={(el) => {
            orbRefs.current[i] = el;
          }}
          className="absolute rounded-full"
          style={{
            left: `calc(${(rtl ? 1 - o.x : o.x) * 100}% - ${o.w / 2}rem)`,
            top: `calc(${o.y * 100}% - ${o.h / 2}rem)`,
            width: `${o.w}rem`,
            height: `${o.h}rem`,
            background: `radial-gradient(closest-side, ${o.tint}, transparent)`,
            filter: `blur(${o.blur}px)`,
            opacity: o.opacity,
            willChange: reduced ? undefined : "transform, opacity",
          }}
        />
      ))}
    </div>
  );
}

const clamp = (v: number, min: number, max: number) => (v < min ? min : v > max ? max : v);
