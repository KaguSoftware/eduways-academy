import type {
  AdmissionRequirement, Category, District, Faq, Lead, Post, Program, Ranking, Scholarship, Service,
  SiteSettings, Story, University, UniversityWithRelations,
} from "@/lib/types";

export interface UniversityFilters {
  type?: University["type"];
  side?: District["side"];
  language?: string;
  district?: string;
  maxTuition?: number;
  category?: string;
  q?: string;
  featured?: boolean;
}

export interface ProgramFilters {
  q?: string;
  level?: Program["level"];
  language?: Program["language"];
  category?: string;
  university?: string;
  maxTuition?: number;
}

export interface Repo {
  // content
  getSettings(): Promise<SiteSettings>;
  listCategories(): Promise<Category[]>;
  listDistricts(): Promise<District[]>;
  getDistrict(slug: string): Promise<District | null>;
  listUniversities(filters?: UniversityFilters): Promise<UniversityWithRelations[]>;
  getUniversity(slug: string): Promise<UniversityWithRelations | null>;
  getUniversitiesByIds(ids: string[]): Promise<UniversityWithRelations[]>;
  listPrograms(filters?: ProgramFilters): Promise<(Program & { university: University })[]>;
  listScholarships(): Promise<Scholarship[]>;
  listRankings(): Promise<Ranking[]>;
  listRequirements(universityId: string): Promise<AdmissionRequirement[]>;
  listServices(): Promise<Service[]>;
  getService(slug: string): Promise<Service | null>;
  listStories(): Promise<(Story & { university?: University })[]>;
  getStory(slug: string): Promise<(Story & { university?: University }) | null>;
  listPosts(): Promise<Post[]>;
  getPost(slug: string): Promise<Post | null>;
  listFaqs(): Promise<Faq[]>;
  // leads
  createLead(lead: Lead): Promise<{ id: string } | null>;
  listLeads(): Promise<Lead[]>;
}
