"use client";

import { motion, MotionConfig, type Variants } from "motion/react";

/* Sequenced "how it works" reveal: items rise in quickly, then the connector
   draws across and each node lights the moment the line front reaches it.
   The line scales with LINEAR easing on purpose — node i sits at i/(n-1) of
   the track, so its delay is LINE_DELAY + (i/(n-1)) * LINE_DURATION; any
   easing on the line would desync the front from the node activations. */
const LINE_DELAY = 0.5;
const LINE_DURATION = 1.4;
const EASE = [0.22, 1, 0.36, 1] as const;

export function ProcessSteps({ steps }: { steps: { title: string; body: string }[] }) {
  const last = Math.max(1, steps.length - 1);
  const lightAt = (i: number) => LINE_DELAY + (i / last) * LINE_DURATION;

  const item: Variants = {
    hidden: { opacity: 0, y: 18 },
    show: (i: number) => ({ opacity: 1, y: 0, transition: { duration: 0.5, delay: i * 0.08, ease: EASE } }),
  };
  const node: Variants = {
    hidden: { scale: 1 },
    show: (i: number) => ({ scale: [1, 1.12, 1], transition: { delay: lightAt(i), duration: 0.45, ease: EASE } }),
  };
  const nodeFill: Variants = {
    hidden: { opacity: 0 },
    show: (i: number) => ({ opacity: 1, transition: { delay: lightAt(i), duration: 0.3, ease: "easeOut" } }),
  };
  const line: Variants = {
    hidden: { scaleX: 0 },
    show: { scaleX: 1, transition: { delay: LINE_DELAY, duration: LINE_DURATION, ease: "linear" } },
  };

  return (
    <MotionConfig reducedMotion="user">
      <motion.ol
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-80px" }}
        className="relative grid gap-6 md:grid-cols-5"
      >
        <div aria-hidden className="pointer-events-none absolute inset-x-[10%] top-7 hidden h-0.5 bg-border md:block" />
        <motion.div
          aria-hidden
          variants={line}
          className="pointer-events-none absolute inset-x-[10%] top-7 hidden h-0.5 origin-left bg-gradient-to-r from-brand-200 via-brand-400 to-accent-400 md:block rtl:origin-right"
        />
        {steps.map((s, i) => (
          <motion.li key={s.title} custom={i} variants={item} className="relative flex flex-col items-center text-center">
            <motion.span
              custom={i}
              variants={node}
              className="relative z-10 flex size-14 items-center justify-center rounded-full border-4 border-background bg-surface font-en text-lg font-extrabold text-muted"
            >
              {i + 1}
              {/* Active face fades in over the muted one — the gradient itself
                  can't be transitioned, so it rides on its own layer. */}
              <motion.span
                custom={i}
                variants={nodeFill}
                className="absolute inset-0 flex items-center justify-center rounded-full bg-brand-gradient text-white shadow-md"
              >
                {i + 1}
              </motion.span>
            </motion.span>
            <h3 className="mt-4 font-bold">{s.title}</h3>
            <p className="mt-1.5 text-sm leading-6 text-muted">{s.body}</p>
          </motion.li>
        ))}
      </motion.ol>
    </MotionConfig>
  );
}
