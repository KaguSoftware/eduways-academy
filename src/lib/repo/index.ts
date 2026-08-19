import { hasSupabase } from "@/lib/supabase/env";
import { seedRepo } from "./seed";
import type { Repo } from "./types";

/**
 * Data access entry point. Supabase when configured, otherwise the in-repo seed.
 * Lazy import keeps `next/headers` out of the seed path (so seed mode also works in scripts).
 */
export async function getRepo(): Promise<Repo> {
  if (hasSupabase) {
    const mod = await import("./supabase");
    return mod.supabaseRepo;
  }
  return seedRepo;
}

export { hasSupabase };
export type { Repo, UniversityFilters, ProgramFilters } from "./types";
