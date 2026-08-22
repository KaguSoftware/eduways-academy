import type { Repo, UniversityFilters, ProgramFilters } from "./types";
import type { Lead, University, Program, District, Scholarship, Ranking, AdmissionRequirement, SiteSettings, UniversityWithRelations } from "@/lib/types";
import { createClient } from "@/lib/supabase/server";
import { publicClient } from "@/lib/supabase/public";
import { createAdminClient } from "@/lib/supabase/admin";
import { hydrate } from "./compute";
import { byId } from "@/lib/utils";
import { applyUniversityFilters, applyProgramFilters } from "./seed";
import { siteSettings as defaultSettings } from "@/data/seed/content";

/**
 * Supabase-backed repository. Public reads use a cookie-less anon client (RLS published policies apply),
 * then reuses the same in-memory hydration/filter code as seed mode so both modes behave identically.
 * Tables are small (≈60 universities, ≈1k programs) so a full fetch per request + ISR is fine.
 */
let coreCache: { at: number; value: Promise<Awaited<ReturnType<typeof loadCoreUncached>>> } | null = null;
const CORE_TTL_MS = 60_000;

/** Memoised for 60s per server instance — build-time static generation and ISR hit this hundreds of times. */
function loadCore() {
  const now = Date.now();
  if (!coreCache || now - coreCache.at > CORE_TTL_MS) coreCache = { at: now, value: loadCoreUncached() };
  return coreCache.value;
}

async function loadCoreUncached() {
  const sb = publicClient();
  const [u, d, p, r, s, k] = await Promise.all([
    sb.from("universities").select("*").eq("status", "published"),
    sb.from("districts").select("*"),
    sb.from("programs").select("*"),
    sb.from("admission_requirements").select("*"),
    sb.from("scholarships").select("*"),
    sb.from("rankings").select("*"),
  ]);
  const ctx = {
    districts: (d.data ?? []) as District[],
    programs: (p.data ?? []) as Program[],
    requirements: (r.data ?? []) as AdmissionRequirement[],
    scholarships: (s.data ?? []) as Scholarship[],
    rankings: (k.data ?? []) as Ranking[],
  };
  const universities = (u.data ?? []) as University[];
  return { universities, ctx, hydrated: universities.map((x) => hydrate(x, ctx)) };
}

export const supabaseRepo: Repo = {
  async getSettings() {
    const sb = publicClient();
    const { data } = await sb.from("site_settings").select("key,value");
    if (!data?.length) return defaultSettings;
    const obj = Object.fromEntries(data.map((r) => [r.key, r.value])) as Partial<SiteSettings>;
    return { ...defaultSettings, ...obj };
  },
  async listCategories() {
    const sb = publicClient();
    return (await sb.from("categories").select("*")).data ?? [];
  },
  async listDistricts() {
    const sb = publicClient();
    return ((await sb.from("districts").select("*")).data ?? []) as District[];
  },
  async getDistrict(slug) {
    const sb = publicClient();
    return ((await sb.from("districts").select("*").eq("slug", slug).maybeSingle()).data ?? null) as District | null;
  },
  async listUniversities(filters: UniversityFilters = {}) {
    const { hydrated } = await loadCore();
    return applyUniversityFilters(hydrated, filters);
  },
  async getUniversity(slug) {
    const { hydrated } = await loadCore();
    return hydrated.find((u) => u.slug === slug) ?? null;
  },
  async getUniversitiesByIds(ids) {
    const { hydrated } = await loadCore();
    return ids.map((id) => hydrated.find((u) => u.id === id || u.slug === id)).filter((u): u is UniversityWithRelations => !!u);
  },
  async listPrograms(f: ProgramFilters = {}) {
    const { universities, ctx } = await loadCore();
    return applyProgramFilters(ctx.programs, universities, f);
  },
  async listScholarships() {
    const sb = publicClient();
    return ((await sb.from("scholarships").select("*")).data ?? []) as Scholarship[];
  },
  async listRankings() {
    const sb = publicClient();
    return ((await sb.from("rankings").select("*")).data ?? []) as Ranking[];
  },
  async listRequirements(universityId) {
    const sb = publicClient();
    return ((await sb.from("admission_requirements").select("*").eq("university_id", universityId)).data ?? []) as AdmissionRequirement[];
  },
  async listServices() {
    const sb = publicClient();
    return (await sb.from("services").select("*").order("order")).data ?? [];
  },
  async getService(slug) {
    const sb = publicClient();
    return (await sb.from("services").select("*").eq("slug", slug).maybeSingle()).data ?? null;
  },
  async listStories() {
    const sb = publicClient();
    // Ordered by id like posts, so the list reads story-1, story-2, … regardless of publish dates.
    const { data } = await sb.from("stories").select("*, university:universities(*)");
    return (data ?? []).sort(byId) as never;
  },
  async getStory(slug) {
    const sb = publicClient();
    const { data } = await sb.from("stories").select("*, university:universities(*)").eq("slug", slug).maybeSingle();
    return (data ?? null) as never;
  },
  async listPosts() {
    const sb = publicClient();
    return ((await sb.from("posts").select("*")).data ?? []).sort(byId);
  },
  async getPost(slug) {
    const sb = publicClient();
    return (await sb.from("posts").select("*").eq("slug", slug).maybeSingle()).data ?? null;
  },
  async listFaqs() {
    const sb = publicClient();
    return (await sb.from("faqs").select("*").order("order")).data ?? [];
  },
  async createLead(lead: Lead) {
    const admin = createAdminClient();
    if (!admin) return null;
    const { data, error } = await admin.from("leads").insert(lead).select("id").single();
    if (error) {
      console.error("[leads] insert failed", error);
      return null;
    }
    return data;
  },
  async listLeads() {
    const sb = await createClient();
    return ((await sb.from("leads").select("*").order("created_at", { ascending: false })).data ?? []) as Lead[];
  },
};
