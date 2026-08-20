/**
 * Pure geometry for the graduation trail — no DOM access, so it can be unit-tested
 * with `tsx`. Coordinates are document pixels relative to the `.site-shell` box.
 */

export type Point = { x: number; y: number };

export type TrailInput = {
  /** Shell (document) size in px. */
  width: number;
  /** Viewport height used to pace the sway — deliberately held steady while the
   *  mobile URL bar shows/hides (see GradTrail) so the path never jitters mid-scroll. */
  vh: number;
  /** Where the hat rests at scroll 0 (just under the sticky header). */
  start: Point;
  /** Where the hat lands (the student's head) — `null` when there is no stage. */
  end: Point | null;
  /** Fallback bottom when there is no stage (the shell's height). */
  height: number;
  rtl: boolean;
};

export type TrailPath = {
  d: string;
  start: Point;
  end: Point;
  /** Bézier control points — exposed for the sampler + tests. */
  segments: { p0: Point; c1: Point; c2: Point; p1: Point }[];
};

/**
 * Sway amplitude. Phones get a wider swing so the start point tucks into the free margin
 * beside the hero headline; ultra-wide screens are capped so the hat never flings.
 */
export function swayAmplitude(width: number) {
  return clamp(width * (width < 640 ? 0.36 : 0.28), 72, 380);
}

/**
 * Builds a vertical "snake" of cubic Béziers with vertical tangents at every waypoint,
 * so y is strictly monotonic (the lookup table can binary-search by y) and the hat
 * always travels downwards. The last leg drops straight onto the student's head.
 */
export function buildTrail(input: TrailInput): TrailPath {
  const { width, vh, start, rtl } = input;
  const A = swayAmplitude(width);
  const cx = width / 2;
  const dir = rtl ? -1 : 1;
  let end = input.end ?? { x: cx, y: Math.max(start.y + vh * 0.5, input.height - vh * 0.25) };
  // Degenerate guard (stage above the start point can't happen with a header + footer,
  // but never emit a path that climbs): keep the end strictly below the start.
  if (end.y <= start.y + 1) end = { x: end.x, y: start.y + 1 };
  const span = end.y - start.y;

  // One half-sway per ~0.85 viewport of scroll; the final straight drop is ~0.45 vh
  // (never more than half the available span, so short pages still read top→down).
  const step = Math.max(220, vh * 0.85);
  const drop = input.end ? Math.min(Math.max(140, vh * 0.45), span * 0.5) : 0;
  const funnelY = end.y - drop;

  const pts: Point[] = [start];
  // Sway waypoints, alternating sides, starting opposite to the start side.
  let side = -dir;
  let y = start.y + step;
  // Leave at least 0.6·step for the approach curve into the funnel point.
  while (y < funnelY - step * 0.6) {
    pts.push({ x: cx + side * A, y });
    side = -side;
    y += step;
  }
  if (input.end) {
    pts.push({ x: end.x, y: funnelY });
    pts.push(end);
  } else {
    pts.push(end);
  }

  // Cubic chain with vertical tangents: C (x0, y0+kΔy) (x1, y1-kΔy) (x1, y1)
  const k = 0.5;
  const segments: TrailPath["segments"] = [];
  let d = `M${fmt(start.x)},${fmt(start.y)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i];
    const p1 = pts[i + 1];
    const dy = p1.y - p0.y;
    const c1 = { x: p0.x, y: p0.y + dy * k };
    const c2 = { x: p1.x, y: p1.y - dy * k };
    segments.push({ p0, c1, c2, p1 });
    d += ` C${fmt(c1.x)},${fmt(c1.y)} ${fmt(c2.x)},${fmt(c2.y)} ${fmt(p1.x)},${fmt(p1.y)}`;
  }
  return { d, start, end, segments };
}

export type Sample = { x: number; y: number; /** arc length from the start */ s: number; /** tangent angle in degrees, 0 = straight down, +ve leans to +x */ tilt: number };

/**
 * Samples the Bézier chain at roughly `spacing` px of arc length. y is monotonic, so
 * the table can be searched by y. Pure JS (no getPointAtLength) so it is deterministic
 * across browsers and cheap to rebuild on resize.
 */
export function sampleTrail(path: TrailPath, spacing = 6): Sample[] {
  const out: Sample[] = [];
  let s = 0;
  let prev: Point | null = null;
  const push = (p: Point, tangent: Point) => {
    if (prev) s += Math.hypot(p.x - prev.x, p.y - prev.y);
    prev = p;
    // angle from the downward vertical, in degrees
    const tilt = (Math.atan2(tangent.x, tangent.y) * 180) / Math.PI;
    out.push({ x: p.x, y: p.y, s, tilt });
  };
  for (const seg of path.segments) {
    const len = approxLength(seg);
    const n = Math.max(4, Math.ceil(len / spacing));
    const from = out.length === 0 ? 0 : 1; // avoid duplicating the shared endpoint
    for (let i = from; i <= n; i++) {
      const t = i / n;
      push(bezierPoint(seg, t), bezierTangent(seg, t));
    }
  }
  return out;
}

/** Point on the trail whose y equals `targetY` (clamped), interpolated between samples. */
export function sampleAtY(samples: Sample[], targetY: number): Sample {
  const first = samples[0];
  const last = samples[samples.length - 1];
  if (targetY <= first.y) return first;
  if (targetY >= last.y) return last;
  let lo = 0;
  let hi = samples.length - 1;
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if (samples[mid].y <= targetY) lo = mid;
    else hi = mid;
  }
  const a = samples[lo];
  const b = samples[hi];
  const span = b.y - a.y;
  const t = span > 1e-6 ? (targetY - a.y) / span : 0;
  return { x: lerp(a.x, b.x, t), y: targetY, s: lerp(a.s, b.s, t), tilt: lerp(a.tilt, b.tilt, t) };
}

export function totalLength(samples: Sample[]) {
  return samples.length ? samples[samples.length - 1].s : 0;
}

export type Chunk = { d: string; s0: number; s1: number; len: number };

/**
 * Splits the sampled trail into short polyline chunks (~`chunkLen` px of arc length each).
 * The "drawn so far" line is rendered as one <path> per chunk so that animating the tip
 * only invalidates a small bbox instead of the document-tall path. At 6px sampling the
 * polylines are visually identical to the Bézier source.
 */
export function chunkTrail(samples: Sample[], chunkLen = 360): Chunk[] {
  const chunks: Chunk[] = [];
  if (samples.length < 2) return chunks;
  let startIdx = 0;
  for (let i = 1; i < samples.length; i++) {
    const last = i === samples.length - 1;
    if (samples[i].s - samples[startIdx].s >= chunkLen || last) {
      let d = `M${fmt(samples[startIdx].x)},${fmt(samples[startIdx].y)}`;
      for (let j = startIdx + 1; j <= i; j++) d += ` L${fmt(samples[j].x)},${fmt(samples[j].y)}`;
      const s0 = samples[startIdx].s;
      const s1 = samples[i].s;
      chunks.push({ d, s0, s1, len: s1 - s0 });
      startIdx = i;
    }
  }
  return chunks;
}

/* ---------- easing & math helpers (shared with the overlay) ---------- */
export const clamp = (v: number, min: number, max: number) => (v < min ? min : v > max ? max : v);
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
export const easeOutQuart = (t: number) => 1 - Math.pow(1 - t, 4);
export const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
export const smoothstep = (t: number) => t * t * (3 - 2 * t);

function bezierPoint(seg: TrailPath["segments"][number], t: number): Point {
  const mt = 1 - t;
  const a = mt * mt * mt;
  const b = 3 * mt * mt * t;
  const c = 3 * mt * t * t;
  const d = t * t * t;
  return {
    x: a * seg.p0.x + b * seg.c1.x + c * seg.c2.x + d * seg.p1.x,
    y: a * seg.p0.y + b * seg.c1.y + c * seg.c2.y + d * seg.p1.y,
  };
}

function bezierTangent(seg: TrailPath["segments"][number], t: number): Point {
  const mt = 1 - t;
  const a = 3 * mt * mt;
  const b = 6 * mt * t;
  const c = 3 * t * t;
  return {
    x: a * (seg.c1.x - seg.p0.x) + b * (seg.c2.x - seg.c1.x) + c * (seg.p1.x - seg.c2.x),
    y: a * (seg.c1.y - seg.p0.y) + b * (seg.c2.y - seg.c1.y) + c * (seg.p1.y - seg.c2.y),
  };
}

function approxLength(seg: TrailPath["segments"][number]) {
  const chord = Math.hypot(seg.p1.x - seg.p0.x, seg.p1.y - seg.p0.y);
  const poly = Math.hypot(seg.c1.x - seg.p0.x, seg.c1.y - seg.p0.y) + Math.hypot(seg.c2.x - seg.c1.x, seg.c2.y - seg.c1.y) + Math.hypot(seg.p1.x - seg.c2.x, seg.p1.y - seg.c2.y);
  return (chord + poly) / 2;
}

const fmt = (n: number) => (Math.round(n * 10) / 10).toString();
