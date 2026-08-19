"use client";

import * as React from "react";

const KEY = "eduways.compare";
const MAX = 3;

interface CompareCtx {
  slugs: string[];
  toggle: (slug: string) => void;
  remove: (slug: string) => void;
  clear: () => void;
  has: (slug: string) => boolean;
  full: boolean;
}

const Ctx = React.createContext<CompareCtx | null>(null);

export function CompareProvider({ children }: { children: React.ReactNode }) {
  const [slugs, setSlugs] = React.useState<string[]>([]);
  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setSlugs(JSON.parse(raw));
    } catch {}
  }, []);
  const persist = (next: string[]) => {
    setSlugs(next);
    try { localStorage.setItem(KEY, JSON.stringify(next)); } catch {}
  };
  const value: CompareCtx = {
    slugs,
    has: (s) => slugs.includes(s),
    full: slugs.length >= MAX,
    toggle: (s) => persist(slugs.includes(s) ? slugs.filter((x) => x !== s) : slugs.length >= MAX ? [...slugs.slice(1), s] : [...slugs, s]),
    remove: (s) => persist(slugs.filter((x) => x !== s)),
    clear: () => persist([]),
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCompare() {
  const c = React.useContext(Ctx);
  if (!c) throw new Error("useCompare outside CompareProvider");
  return c;
}
