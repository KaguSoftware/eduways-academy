"use client";

import * as React from "react";
import Image from "next/image";
import { useLocale } from "next-intl";
import { usePathname } from "@/i18n/navigation";
import { isRtl } from "@/i18n/routing";
import { useGradTrail, type StudentPose } from "./grad-trail-context";
import {
  buildTrail, sampleTrail, sampleAtY, totalLength, chunkTrail, swayAmplitude,
  clamp, lerp, easeOutCubic, easeOutQuart, easeInOutCubic, smoothstep,
  type Point, type Sample, type Chunk,
} from "./trail-geometry";

/* ────────────────────────── tuning ──────────────────────────
 * Fractions are of the stage box (the student image, 420×600) and of the hat box
 * (260×190). The hat's anchor is inside its crown band (CSS: translate(-50%, -64%), i.e.
 * viewBox y≈122 — the trail's tip and its end-cap stay hidden under the band); it meets
 * the head a little below the hair line so the cap wraps the head instead of perching. */
const HEAD_POINT = { x: 0.5, y: 0.15 };
/** Hat width as a fraction of the stage width — makes the cap ≈ 1.1× the head. */
const HAT_TO_STAGE = 0.62;
/** Scale of the hat while riding the trail (it grows to 1 as it nears the student). */
const TRAVEL_SCALE = 0.62;
/** Progress at which the hat starts growing to landing size. */
const GROW_FROM = 0.86;
/** The hat may lean at most this much into the direction of travel (degrees). */
const MAX_TILT = 14;
/** Viewport-space smoothing — short enough to feel glued to the scroll, long enough to hide jumps. */
const SMOOTH_TAU = 0.085;
/** How long after a route change every target change snaps instead of gliding (ms). */
const SNAP_WINDOW = 600;
/** Wheel ticks this soon after the Graduate click are treated as trackpad inertia, not intent. */
const WHEEL_GRACE_MS = 180;
/** Accumulated wheel travel (px) after the grace period that cancels the throw. */
const WHEEL_CANCEL_PX = 48;
/** Scroll offset (px) the stage bottom keeps from the viewport bottom when the hat lands. */
const LAND_MARGIN = 28;
/** On short pages the hat still rides for at least this share of the scroll range before landing. */
const MIN_LAND_FRACTION = 0.6;
/** Hat image intrinsic size (viewBox of /assets/grad-hat.svg). */
const HAT_INTRINSIC = { w: 260, h: 190 };
/** Dot rhythm of the base trail — must equal the sum of `.grad-trail__base`'s stroke-dasharray. */
const DOT_PERIOD = 9.1;

type Geometry = {
  /** Shell size in px. */
  w: number;
  h: number;
  /** Shell origin in absolute document px (usually 0,0). */
  sx: number;
  sy: number;
  d: string;
  start: Point;
  end: Point;
  hasStage: boolean;
  /** Absolute document y of the stage's top / bottom edges. */
  stageTopAbs: number;
  stageBottomAbs: number;
  headerH: number;
  hatW: number;
  samples: Sample[];
  chunks: Chunk[];
  length: number;
  key: string;
};

/** The rider's state. `vy` is viewport-space so fast scrolling never lags the hat in document space. */
type Cursor = { x: number; vy: number; tilt: number; scale: number; s: number };

type Tween = { t0: number; D: number; scroll0: number; from: Cursor; to: { x: number; vy: number }; arc: number; spin: number };

type Controller = {
  measure: () => void;
  retarget: () => void;
  afterCommit: () => void;
  onRouteChange: () => void;
  startThrow: (opts: { trigger?: HTMLElement | null }) => void;
  destroy: () => void;
};

const NAV_KEYS = new Set(["ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End", " ", "Spacebar"]);
const INSTANT = "instant" as ScrollBehavior;

/** Live prefers-reduced-motion (motion's useReducedMotion reads the media query once). */
const RM_QUERY = "(prefers-reduced-motion: reduce)";
const subscribeReducedMotion = (cb: () => void) => {
  const mq = window.matchMedia(RM_QUERY);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
};
const useReducedMotionLive = () =>
  React.useSyncExternalStore(subscribeReducedMotion, () => window.matchMedia(RM_QUERY).matches, () => false);

/**
 * Site-wide graduation trail: an SVG path down the whole document with a graduation
 * cap riding it as the user scrolls, landing on the student in the footer. All
 * per-frame work writes straight to the DOM (transform / stroke-dashoffset) — React
 * state only changes when the geometry (route, size, layout) changes.
 */
export function GradTrail() {
  const rtl = isRtl(useLocale());
  const reduced = useReducedMotionLive();
  const pathname = usePathname();
  const { setPose, registerThrow } = useGradTrail();

  const layerRef = React.useRef<HTMLDivElement>(null);
  const hatRef = React.useRef<HTMLDivElement>(null);
  const progressRef = React.useRef<SVGSVGElement>(null);
  const ctrl = React.useRef<Controller | null>(null);

  const [geo, setGeo] = React.useState<Geometry | null>(null);

  // Values the imperative controller reads without re-subscribing (kept fresh every commit).
  const env = React.useRef({ rtl, reduced, setPose });
  React.useLayoutEffect(() => {
    env.current = { rtl, reduced, setPose };
  });

  // Build the controller once; it owns every listener, observer and the rAF loop.
  React.useEffect(() => {
    const layer = layerRef.current;
    const shell = layer?.parentElement;
    if (!layer || !shell) return;

    const c = createController({
      shell,
      hat: () => hatRef.current,
      progress: () => progressRef.current,
      env: () => env.current,
      publish: (g) => setGeo((old) => (old && old.key === g.key ? old : g)),
    });
    ctrl.current = c;
    return () => {
      c.destroy();
      ctrl.current = null;
    };
  }, []);

  React.useEffect(() => registerThrow((o) => ctrl.current?.startThrow(o)), [registerThrow]);

  // Route change: new page, new height, Next scrolls to top → re-measure a few times
  // while content settles, and snap the hat instead of gliding across the old page.
  React.useEffect(() => {
    const c = ctrl.current;
    if (!c) return;
    c.onRouteChange();
    const timers = [60, 300, 900].map((ms) => window.setTimeout(c.measure, ms));
    return () => timers.forEach((id) => window.clearTimeout(id));
  }, [pathname, rtl]);

  // Direction / reduced-motion changes → rebuild and snap.
  React.useEffect(() => {
    ctrl.current?.onRouteChange();
  }, [reduced, rtl]);

  // After the geometry commits (new `d`), realign the rider immediately — no stale frame.
  React.useLayoutEffect(() => {
    if (geo) ctrl.current?.afterCommit();
  }, [geo]);

  const hatW = geo?.hatW ?? 80;
  const hatH = (hatW * HAT_INTRINSIC.h) / HAT_INTRINSIC.w;

  return (
    <div ref={layerRef} aria-hidden className="grad-trail" data-ready={geo ? "true" : "false"}>
      {geo && (
        <>
          {/* Static dotted trail: lives in the page layer, rasterised once per tile. Also
              chunked — dashing a document-long path is re-walked for every tile, short chunks
              outside a tile are rejected early. The per-chunk dash offset keeps the dot rhythm
              continuous across chunk boundaries. */}
          <svg className="grad-trail__svg" width="100%" height="100%" focusable="false">
            {geo.chunks.map((c, i) => (
              <path key={i} className="grad-trail__base" d={c.d} pathLength={c.len} style={{ strokeDashoffset: c.s0 % DOT_PERIOD }} />
            ))}
          </svg>
          {/* The drawn-so-far line changes every frame; it gets its own compositor layer
              (see CSS) so the per-frame stroke-dashoffset change re-rasterises only this
              transparent layer, not the page content underneath. pathLength pins the dash
              units to our own sampled length, so the line always ends exactly under the hat. */}
          <svg className="grad-trail__svg grad-trail__svg--progress" width="100%" height="100%" focusable="false">
            <defs>
              <linearGradient id="grad-trail-stroke" gradientUnits="userSpaceOnUse" x1="0" y1={geo.start.y} x2="0" y2={geo.end.y}>
                <stop offset="0" stopColor="var(--brand-600)" />
                <stop offset="1" stopColor="var(--accent-500)" />
              </linearGradient>
            </defs>
            <g ref={progressRef}>
              {geo.chunks.map((c, i) => (
                <path key={i} className="grad-trail__progress" d={c.d} pathLength={c.len} style={{ strokeDasharray: c.len, strokeDashoffset: c.len }} />
              ))}
            </g>
          </svg>
        </>
      )}
      <div ref={hatRef} className="grad-trail__hat" style={{ width: hatW, height: hatH }}>
        <Image src="/assets/grad-hat.svg" alt="" width={HAT_INTRINSIC.w} height={HAT_INTRINSIC.h} unoptimized loading="eager" draggable={false} />
      </div>
    </div>
  );
}

/** Collapses the per-fragment client rects of a text range into one rect per visual line. */
function mergeLineRects(rects: DOMRect[]) {
  const lines: { top: number; bottom: number; left: number; right: number }[] = [];
  for (const r of rects) {
    if (r.width === 0 || r.height === 0) continue;
    const line = lines.find((l) => Math.abs(l.top - r.top) < r.height * 0.5);
    if (line) {
      line.top = Math.min(line.top, r.top);
      line.bottom = Math.max(line.bottom, r.bottom);
      line.left = Math.min(line.left, r.left);
      line.right = Math.max(line.right, r.right);
    } else lines.push({ top: r.top, bottom: r.bottom, left: r.left, right: r.right });
  }
  return lines.sort((a, b) => a.top - b.top);
}

/* ═══════════════════════════ controller ═══════════════════════════ */

function createController(opts: {
  shell: HTMLElement;
  hat: () => HTMLDivElement | null;
  progress: () => SVGSVGElement | null;
  env: () => { rtl: boolean; reduced: boolean; setPose: (p: StudentPose) => void };
  publish: (g: Geometry) => void;
}): Controller {
  const { shell, env, publish } = opts;

  let geo: Geometry | null = null;
  let vh = 0;
  const target: Cursor = { x: 0, vy: 0, tilt: 0, scale: TRAVEL_SCALE, s: 0 };
  const cur: Cursor = { x: 0, vy: 0, tilt: 0, scale: TRAVEL_SCALE, s: 0 };
  let snapUntil = Infinity; // snap every frame until the first geometry lands
  let tween: Tween | null = null;
  let raf = 0;
  let running = false;
  let lastFrame = 0;
  let poseTimer = 0;
  let destroyed = false;
  let tweenWritten = -1;
  let tweenArmed = false;
  let detachInterrupts: () => void = () => {};

  /** Keyboard focus goes to the top of the page (no ring for pointer users, no scroll jump). */
  const focusTop = () => shell.querySelector<HTMLElement>(":scope > header a, :scope > header button")?.focus({ preventScroll: true });

  /* ───────────── measuring ───────────── */

  const measure = () => {
    const rect = shell.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    const scrollX = window.scrollX;
    const scrollY = window.scrollY;
    const sx = rect.left + scrollX;
    const sy = rect.top + scrollY;
    const innerH = window.innerHeight;
    // Keep the sway pacing steady through the mobile URL-bar show/hide (≈10% height
    // change); only re-pace on real resizes / orientation changes.
    if (!vh || Math.abs(innerH - vh) / vh > 0.2 || !geo || Math.abs(geo.w - rect.width) > 1) vh = innerH;

    const header = shell.querySelector<HTMLElement>(":scope > header");
    const headerH = header ? header.getBoundingClientRect().height : 72;
    const A = swayAmplitude(rect.width);
    const rtl = env().rtl;
    const start: Point = { x: rect.width / 2 + (rtl ? -1 : 1) * A, y: headerH + vh * 0.12 };

    const stage = document.querySelector<HTMLElement>("[data-grad-stage]");
    let end: Point | null = null;
    let hatW = clamp(rect.width * 0.07, 64, 104);
    let stageTopAbs = sy + rect.height;
    let stageBottomAbs = sy + rect.height;
    if (stage) {
      const r = stage.getBoundingClientRect();
      const left = r.left + scrollX - sx;
      const top = r.top + scrollY - sy;
      end = { x: left + r.width * HEAD_POINT.x, y: top + r.height * HEAD_POINT.y };
      hatW = r.width * HAT_TO_STAGE;
      stageTopAbs = r.top + scrollY;
      stageBottomAbs = r.bottom + scrollY;
    }

    // Phones have no free gutter: the default start lands on the hero headline. Park the cap
    // beside the first headline line that leaves room for it at the inline end; failing
    // that, just under the headline.
    if (rect.width < 640) {
      const h1 = shell.querySelector<HTMLElement>("main h1");
      if (h1) {
        const capW = hatW * TRAVEL_SCALE;
        const capH = (capW * HAT_INTRINSIC.h) / HAT_INTRINSIC.w;
        const range = document.createRange();
        range.selectNodeContents(h1);
        const lines = mergeLineRects(Array.from(range.getClientRects()));
        const h1Rect = h1.getBoundingClientRect();
        const capTop = start.y - capH * 0.64;
        const capBottom = start.y + capH * 0.36;
        const overlaps = lines.some((l) => l.top + scrollY - sy < capBottom && l.bottom + scrollY - sy > capTop && l.left - sx < start.x + capW / 2 + 8 && l.right - sx > start.x - capW / 2 - 8);
        if (overlaps) {
          const free = lines.find((l) => (rtl ? l.left - sx >= start.x + capW / 2 + 8 : l.right - sx <= start.x - capW / 2 - 8) && l.bottom - l.top >= capH * 0.8);
          start.y = free ? (free.top + free.bottom) / 2 + scrollY - sy : h1Rect.bottom + scrollY - sy + capH * 0.64 + 12;
        }
      }
    }

    const path = buildTrail({ width: rect.width, height: rect.height, vh, start, end, rtl });
    const samples = sampleTrail(path, 6);
    const next: Geometry = {
      w: rect.width, h: rect.height, sx, sy, d: path.d, start: path.start, end: path.end,
      hasStage: !!end, stageTopAbs, stageBottomAbs, headerH, hatW, samples, chunks: chunkTrail(samples), length: totalLength(samples),
      key: `${path.d}|${rect.width}|${rect.height}|${sx}|${sy}|${hatW}|${stageTopAbs}|${stageBottomAbs}|${headerH}`,
    };
    const changed = !geo || geo.key !== next.key;
    geo = next;
    if (changed) publish(next);
    else afterCommit();
  };

  /* ───────────── scroll → target ───────────── */

  const retarget = () => {
    if (!geo) return;
    const g = geo;
    const scrollY = window.scrollY;
    const innerH = window.innerHeight;
    const scroller = document.scrollingElement ?? document.documentElement;
    const maxScroll = Math.max(0, scroller.scrollHeight - innerH);
    // Where (in scroll px) the hat lands. Normally: when the stage is comfortably inside the
    // viewport — not at the very end of the page, or tall footers (mobile) would scroll the
    // landing away. On short pages keep the ride going for a fair share of the scroll range,
    // as long as the stage is still on screen when the cap arrives.
    let landAt = maxScroll;
    if (g.hasStage) {
      const inViewFromBelow = g.stageBottomAbs + LAND_MARGIN - innerH;
      // …and still fully visible under the sticky header (the cap overhangs the head point).
      const stillBelowHeader = g.stageTopAbs - g.headerH - (g.hatW * HAT_INTRINSIC.h) / HAT_INTRINSIC.w * 0.7 - 12;
      landAt = Math.max(inViewFromBelow, maxScroll * MIN_LAND_FRACTION);
      landAt = Math.min(landAt, stillBelowHeader, maxScroll);
      landAt = Math.max(landAt, Math.min(inViewFromBelow, maxScroll));
    }
    const p = landAt > 1 ? clamp(scrollY / landAt, 0, 1) : 1;

    if (env().reduced) {
      // Static: the cap already sits on the student; the whole trail is drawn.
      target.x = g.end.x;
      target.vy = g.end.y + g.sy - scrollY;
      target.tilt = 0;
      target.scale = 1;
      target.s = g.length;
      return;
    }
    const y = lerp(g.start.y, g.end.y, p);
    const smp = sampleAtY(g.samples, y);
    target.x = smp.x;
    target.vy = y + g.sy - scrollY;
    target.tilt = clamp(smp.tilt * 0.35, -MAX_TILT, MAX_TILT);
    const grow = p <= GROW_FROM ? 0 : smoothstep((p - GROW_FROM) / (1 - GROW_FROM));
    target.scale = g.hasStage ? lerp(TRAVEL_SCALE, 1, grow) : TRAVEL_SCALE;
    target.s = smp.s;
  };

  /* ───────────── painting ───────────── */

  // Per-chunk draw state so only the chunk under the tip is touched each frame
  // (-1 = hidden, 1 = fully drawn, 0 = partial). Reset whenever the chunk list changes.
  let chunkState: number[] = [];
  let chunkStateFor: Chunk[] | null = null;
  let lastTransform = "";

  const paint = () => {
    const hat = opts.hat();
    if (!geo || !hat) return;
    const docY = cur.vy + window.scrollY - geo.sy;
    const transform = `translate3d(${cur.x.toFixed(2)}px, ${docY.toFixed(2)}px, 0) rotate(${cur.tilt.toFixed(2)}deg) scale(${cur.scale.toFixed(4)})`;
    if (transform !== lastTransform) {
      hat.style.transform = transform;
      lastTransform = transform;
    }
    const group = opts.progress();
    if (!group) return;
    const paths = group.children;
    const chunks = geo.chunks;
    if (chunkStateFor !== chunks || paths.length !== chunks.length) {
      chunkStateFor = chunks;
      chunkState = new Array(chunks.length).fill(NaN);
    }
    // Keep the tip a hair behind the hat so its round cap never peeks out under the crown.
    const s = cur.s - 3;
    for (let i = 0; i < chunks.length; i++) {
      const c = chunks[i];
      const el = paths[i] as SVGPathElement | undefined;
      if (!el) continue;
      if (s >= c.s1) {
        if (chunkState[i] !== 1) { el.style.strokeDashoffset = "0"; chunkState[i] = 1; }
      } else if (s <= c.s0) {
        if (chunkState[i] !== -1) { el.style.strokeDashoffset = `${c.len}`; chunkState[i] = -1; }
      } else {
        // Half-pixel steps are invisible under the cap and save a style write most frames.
        const off = Math.round((c.s1 - s) * 2) / 2;
        if (chunkState[i] !== -off - 2) { // encode the partial offset so unchanged values are skipped
          el.style.strokeDashoffset = `${off}`;
          chunkState[i] = -off - 2;
        }
      }
    }
  };

  const frame = (now: number) => {
    if (!running) return;
    // rAF timestamps mark the frame start, which can precede the performance.now() taken in
    // ensureLoop — clamp at 0 or the first smoothing step would push the hat *away* from target.
    const dt = clamp((now - lastFrame) / 1000, 0, 0.05) || 0;
    lastFrame = now;
    let settled = false;

    if (tween) {
      stepTween(tween, now);
    } else if (now < snapUntil || env().reduced) {
      Object.assign(cur, target);
      settled = true;
    } else {
      const k = 1 - Math.exp(-dt / SMOOTH_TAU);
      cur.x += (target.x - cur.x) * k;
      cur.vy += (target.vy - cur.vy) * k;
      cur.tilt += (target.tilt - cur.tilt) * k;
      cur.scale += (target.scale - cur.scale) * k;
      cur.s += (target.s - cur.s) * k;
      if (
        Math.abs(target.x - cur.x) < 0.25 && Math.abs(target.vy - cur.vy) < 0.25 && Math.abs(target.tilt - cur.tilt) < 0.1 &&
        Math.abs(target.scale - cur.scale) < 0.002 && Math.abs(target.s - cur.s) < 1
      ) {
        Object.assign(cur, target);
        settled = true;
      }
    }
    paint();
    if (settled && !tween) {
      running = false;
      return;
    }
    raf = requestAnimationFrame(frame);
  };

  const ensureLoop = () => {
    if (running || destroyed) return;
    running = true;
    lastFrame = performance.now();
    raf = requestAnimationFrame(frame);
  };

  const stopLoop = () => {
    running = false;
    cancelAnimationFrame(raf);
  };

  /* ───────────── the throw ───────────── */

  const endTween = (how: "finish" | "cancel") => {
    if (!tween) return;
    tween = null;
    detachInterrupts();
    document.documentElement.style.scrollBehavior = "";
    lastScrollY = window.scrollY;
    if (how === "finish") {
      window.scrollTo({ top: 0, behavior: INSTANT });
      lastScrollY = 0;
      retarget();
      // On a page that cannot scroll the target is still the student's head: glide back
      // down (a toss-and-catch) instead of teleporting; otherwise we're already there.
      if (Math.abs(target.x - cur.x) < 2 && Math.abs(target.vy - cur.vy) < 2) Object.assign(cur, target);
      focusTop();
    } else {
      retarget();
    }
    ensureLoop();
  };

  const stepTween = (tw: Tween, now: number) => {
    const t = clamp((now - tw.t0) / tw.D, 0, 1);
    const es = easeInOutCubic(t);
    window.scrollTo({ top: tw.scroll0 * (1 - es), behavior: INSTANT });
    tweenWritten = window.scrollY;
    const eh = easeOutCubic(t);
    cur.x = lerp(tw.from.x, tw.to.x, smoothstep(t));
    cur.vy = lerp(tw.from.vy, tw.to.vy, eh) - tw.arc * Math.sin(Math.PI * t);
    cur.tilt = tw.spin * (1 - easeOutQuart(t));
    cur.scale = lerp(tw.from.scale, TRAVEL_SCALE, smoothstep(t));
    cur.s = (geo?.length ?? 0) * (1 - es);
    if (t >= 1) endTween("finish");
  };

  const startThrow = ({ trigger }: { trigger?: HTMLElement | null }) => {
    trigger?.blur();
    window.clearTimeout(poseTimer);
    env().setPose("after");

    // Reduced motion, nothing measured yet, or the page is scroll-locked under a modal
    // (react-remove-scroll marks <body>): the cap swap is the whole celebration; jump to top.
    if (!geo || env().reduced || document.body.hasAttribute("data-scroll-locked")) {
      window.scrollTo({ top: 0, behavior: INSTANT });
      poseTimer = window.setTimeout(() => env().setPose("before"), 700);
      retarget();
      Object.assign(cur, target);
      paint();
      focusTop();
      return;
    }
    endTween("cancel");
    const scroll0 = window.scrollY;
    const D = clamp(820 + scroll0 * 0.07, 950, 1700);
    const to = { x: geo.start.x, vy: geo.start.y + geo.sy };
    tween = {
      t0: performance.now(),
      D,
      scroll0,
      from: { ...cur },
      to,
      arc: Math.min(64, to.vy * 0.3, window.innerHeight * 0.08),
      spin: (env().rtl ? 1 : -1) * 720,
    };
    // Arms go up now and come down once the cap has landed back at the top.
    poseTimer = window.setTimeout(() => env().setPose("before"), D + 120);
    document.documentElement.style.scrollBehavior = "auto";

    // Any scroll intent from the user hands control straight back — attached a frame
    // later so the click/tap that started the throw can't cancel it. Wheel needs a little
    // judgement: trackpads keep emitting inertia ticks after the fingers lift, so ignore the
    // first moments and only cancel once the wheel travel says "I mean it".
    const cancel = () => endTween("cancel");
    const t0 = performance.now();
    let wheelTravel = 0;
    const onWheel = (e: WheelEvent) => {
      if (performance.now() - t0 < WHEEL_GRACE_MS) return;
      wheelTravel += Math.abs(e.deltaY) + Math.abs(e.deltaX);
      if (wheelTravel > WHEEL_CANCEL_PX) cancel();
    };
    const onKey = (e: KeyboardEvent) => { if (NAV_KEYS.has(e.key)) cancel(); };
    const onVisibility = () => { if (document.hidden) endTween("finish"); };
    tweenWritten = window.scrollY;
    tweenArmed = false;
    const id = requestAnimationFrame(() => {
      tweenArmed = true;
      window.addEventListener("wheel", onWheel, { passive: true, capture: true });
      window.addEventListener("touchstart", cancel, { passive: true, capture: true });
      window.addEventListener("pointerdown", cancel, { passive: true, capture: true });
      window.addEventListener("keydown", onKey, { capture: true });
      document.addEventListener("visibilitychange", onVisibility);
    });
    detachInterrupts = () => {
      tweenArmed = false;
      cancelAnimationFrame(id);
      window.removeEventListener("wheel", onWheel, { capture: true });
      window.removeEventListener("touchstart", cancel, { capture: true });
      window.removeEventListener("pointerdown", cancel, { capture: true });
      window.removeEventListener("keydown", onKey, { capture: true });
      document.removeEventListener("visibilitychange", onVisibility);
      detachInterrupts = () => {};
    };
    ensureLoop();
  };

  /* ───────────── lifecycle ───────────── */

  const afterCommit = () => {
    lastScrollY = window.scrollY;
    retarget();
    if (performance.now() < snapUntil) Object.assign(cur, target);
    paint();
    ensureLoop();
  };

  const onRouteChange = () => {
    endTween("cancel");
    snapUntil = performance.now() + SNAP_WINDOW;
    lastScrollY = window.scrollY;
    measure();
    retarget();
    ensureLoop();
  };

  let measureRaf = 0;
  const scheduleMeasure = () => {
    if (destroyed) return; // e.g. document.fonts.ready resolving after unmount
    cancelAnimationFrame(measureRaf);
    measureRaf = requestAnimationFrame(() => {
      measure();
      retarget();
      ensureLoop();
    });
  };

  // The cap is a page object: carry it with the document on every scroll so the viewport-
  // space smoothing only has to absorb its drift along the trail (and never lets a landed
  // cap sink off the head while the footer scrolls). A scroll the throw didn't write —
  // scrollbar drag, find-in-page, focus jumps — means the user took over: cancel.
  let lastScrollY = window.scrollY;
  const onScroll = () => {
    const y = window.scrollY;
    if (tween) {
      if (tweenArmed && Math.abs(y - tweenWritten) > 2) endTween("cancel");
    } else {
      const dy = y - lastScrollY;
      // Wheel, keys and smooth scrolls arrive as many small steps; a single giant step is a
      // teleport (hash jump, scroll restoration) — appear in place rather than streak across.
      if (Math.abs(dy) > window.innerHeight * 1.5) snapUntil = performance.now() + 50;
      else cur.vy -= dy;
    }
    lastScrollY = y;
    retarget();
    ensureLoop();
  };

  // Belt and braces: after the user stops scrolling, confirm the stage hasn't moved
  // (layout shifts that keep the shell height — rare, but cheap to check).
  let idle = 0;
  const onScrollIdle = () => {
    window.clearTimeout(idle);
    idle = window.setTimeout(() => {
      const st = document.querySelector<HTMLElement>("[data-grad-stage]");
      if (!geo || !st) return;
      const bottom = st.getBoundingClientRect().bottom + window.scrollY;
      if (Math.abs(bottom - geo.stageBottomAbs) > 1) scheduleMeasure();
    }, 180);
  };

  // Shell height tracks the document (accordions, tabs, route content, fonts, images);
  // the stage size changes with breakpoints. Either one → rebuild the path.
  const ro = new ResizeObserver(scheduleMeasure);
  ro.observe(shell);
  const stage = document.querySelector<HTMLElement>("[data-grad-stage]");
  if (stage) ro.observe(stage);

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("scroll", onScrollIdle, { passive: true });
  window.addEventListener("resize", scheduleMeasure);
  window.addEventListener("orientationchange", scheduleMeasure);
  window.addEventListener("load", scheduleMeasure);
  document.fonts?.ready.then(scheduleMeasure).catch(() => {});

  // First geometry: snap for a moment so the hat appears in place, then start gliding.
  snapUntil = performance.now() + SNAP_WINDOW;
  measure();
  retarget();
  ensureLoop();

  const destroy = () => {
    destroyed = true;
    ro.disconnect();
    cancelAnimationFrame(measureRaf);
    window.clearTimeout(idle);
    window.clearTimeout(poseTimer);
    window.removeEventListener("scroll", onScroll);
    window.removeEventListener("scroll", onScrollIdle);
    window.removeEventListener("resize", scheduleMeasure);
    window.removeEventListener("orientationchange", scheduleMeasure);
    window.removeEventListener("load", scheduleMeasure);
    stopLoop();
    tween = null;
    detachInterrupts();
    document.documentElement.style.scrollBehavior = "";
  };

  return { measure, retarget, afterCommit, onRouteChange, startThrow, destroy };
}
