"use client";

import * as React from "react";

export type StudentPose = "before" | "after";

type ThrowHandler = (opts: { trigger?: HTMLElement | null }) => void;

type GradTrailContextValue = {
  pose: StudentPose;
  setPose: (pose: StudentPose) => void;
  /** Called by the footer button. Falls back to a plain scroll-to-top when the overlay isn't mounted. */
  throwHat: (trigger?: HTMLElement | null) => void;
  /** The overlay registers its throw implementation here; returns an unregister fn. */
  registerThrow: (handler: ThrowHandler) => () => void;
};

const GradTrailContext = React.createContext<GradTrailContextValue | null>(null);

export function GradTrailProvider({ children }: { children: React.ReactNode }) {
  const [pose, setPose] = React.useState<StudentPose>("before");
  const handlerRef = React.useRef<ThrowHandler | null>(null);

  const registerThrow = React.useCallback((handler: ThrowHandler) => {
    handlerRef.current = handler;
    return () => {
      if (handlerRef.current === handler) handlerRef.current = null;
    };
  }, []);

  const throwHat = React.useCallback((trigger?: HTMLElement | null) => {
    if (handlerRef.current) {
      handlerRef.current({ trigger });
      return;
    }
    // No overlay (e.g. JS partially loaded): still honour the promise of "back to top".
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const value = React.useMemo(() => ({ pose, setPose, throwHat, registerThrow }), [pose, throwHat, registerThrow]);
  return <GradTrailContext.Provider value={value}>{children}</GradTrailContext.Provider>;
}

export function useGradTrail() {
  const ctx = React.useContext(GradTrailContext);
  if (!ctx) throw new Error("useGradTrail must be used inside <GradTrailProvider>");
  return ctx;
}

/** Same hook, but tolerant — for components that may render outside the site shell. */
export function useOptionalGradTrail() {
  return React.useContext(GradTrailContext);
}
