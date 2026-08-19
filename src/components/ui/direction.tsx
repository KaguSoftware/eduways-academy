"use client";

import { Direction } from "radix-ui";

/** Propagates document direction to all Radix primitives (sliders, selects, tabs…). */
export function DirectionProvider({ dir, children }: { dir: "rtl" | "ltr"; children: React.ReactNode }) {
  return <Direction.Provider dir={dir}>{children}</Direction.Provider>;
}
