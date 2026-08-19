import type { Repo, UniversityFilters, ProgramFilters } from "./types";
import type { Lead, Program, University, UniversityWithRelations } from "@/lib/types";
import { hydrate } from "./compute";
import { categories } from "@/data/seed/categories";
import { districts } from "@/data/seed/districts";
import { universities } from "@/data/seed/universities";
import { programs } from "@/data/seed/programs";
import { requirements } from "@/data/seed/requirements";
import { scholarships, rankings } from "@/data/seed/scholarships";
import { services, stories, posts, faqs, siteSettings } from "@/data/seed/content";

const ctx = { districts, programs, requirements, scholarships, rankings };
const hydrated = universities.filter((u) => u.status === "published").map((u) => hydrate(u, ctx));
const norm = (s: string) => s.toLowerCase().normalize("NFKD");

export function applyUniversityFilters(list: UniversityWithRelations[], f: UniversityFilters = {}) {
  return list.filter((u) => {
    if (f.type && u.type !== f.type) return false;
    if (f.side && u.district?.side !== f.side) return false;
    if (f.language && !u.languages.includes(f.language)) return false;
    if (f.district && u.district?.slug !== f.district) return false;
    if (f.maxTuition && u.avg_tuition_min > f.maxTuition) return false;
    if (f.featured && !u.is_featured) return false;
    if (f.category && !u.programs.some((p) => p.category_id === `cat-${f.category}` || p.category_id === f.category)) return false;
    if (f.q) {
      const q = norm(f.q);
      const hay = norm([u.name.fa, u.name.en, u.short_name ?? "", u.slug, u.district?.name.fa ?? "", u.district?.name.en ?? ""].join(" "));
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

export function applyProgramFilters(list: Program[], unis: University[], f: ProgramFilters = {}) {
  return list
    .filter((p) => {
      if (f.level && p.level !== f.level) return false;
      if (f.language && p.language !== f.language && !(f.language === "en" && p.language === "tr-en")) return false;
      if (f.category && p.category_id !== f.category && p.category_id !== `cat-${f.category}`) return false;
      if (f.university && p.university_id !== f.university && p.university_id !== `uni-${f.university}`) return false;
      if (f.maxTuition && p.tuition_usd > f.maxTuition) return false;
      if (f.q) {
        const q = norm(f.q);
        const uni = unis.find((u) => u.id === p.university_id);
        const hay = norm([p.name.fa, p.name.en, p.slug, uni?.name.fa ?? "", uni?.name.en ?? "", uni?.short_name ?? ""].join(" "));
        if (!hay.includes(q)) return false;
      }
      return true;
    })
    .map((p) => ({ ...p, university: unis.find((u) => u.id === p.university_id)! }))
    .filter((p) => p.university);
}

export const seedRepo: Repo = {
  async getSettings() { return siteSettings; },
  async listCategories() { return categories; },
  async listDistricts() { return districts; },
  async getDistrict(slug) { return districts.find((d) => d.slug === slug) ?? null; },
  async listUniversities(filters) { return applyUniversityFilters(hydrated, filters); },
  async getUniversity(slug) { return hydrated.find((u) => u.slug === slug) ?? null; },
  async getUniversitiesByIds(ids) {
    return ids.map((id) => hydrated.find((u) => u.id === id || u.slug === id)).filter((u): u is UniversityWithRelations => !!u);
  },
  async listPrograms(f) { return applyProgramFilters(programs, universities, f); },
  async listScholarships() { return scholarships; },
  async listRankings() { return rankings; },
  async listRequirements(universityId) { return requirements.filter((r) => r.university_id === universityId); },
  async listServices() { return [...services].sort((a, b) => a.order - b.order); },
  async getService(slug) { return services.find((s) => s.slug === slug) ?? null; },
  async listStories() { return stories.map((s) => ({ ...s, university: universities.find((u) => u.id === s.university_id) })); },
  async getStory(slug) {
    const s = stories.find((x) => x.slug === slug);
    return s ? { ...s, university: universities.find((u) => u.id === s.university_id) } : null;
  },
  async listPosts() { return [...posts].sort((a, b) => b.published_at.localeCompare(a.published_at)); },
  async getPost(slug) { return posts.find((p) => p.slug === slug) ?? null; },
  async listFaqs() { return [...faqs].sort((a, b) => a.order - b.order); },
  async createLead(lead: Lead) {
    console.info("[leads] (no-DB mode) new lead:", JSON.stringify(lead));
    return { id: `local-${Math.random().toString(36).slice(2, 10)}` };
  },
  async listLeads() { return []; },
};
