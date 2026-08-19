"use client";

import { motion, type HTMLMotionProps } from "motion/react";

/** Scroll-reveal wrapper (fade + rise). Respects prefers-reduced-motion via motion defaults. */
export function Reveal({ children, delay = 0, className, ...rest }: { children: React.ReactNode; delay?: number; className?: string } & HTMLMotionProps<"div">) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
      {...rest}
    >
      {children}
    </motion.div>
  );
}
