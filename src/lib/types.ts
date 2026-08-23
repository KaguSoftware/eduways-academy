import type { I18nText } from "./utils";

export type UniversityType = "public" | "foundation";
export type ProgramLevel = "associate" | "bachelor" | "master" | "phd";
export type Side = "european" | "asian";
export type RankingSource = "urap" | "the" | "qs" | "eduways";
export type ScholarshipType = "university" | "eduways" | "government";

export interface Category {
  id: string;
  slug: string;
  name: I18nText;
  icon?: string;
}

export interface District {
  id: string;
  slug: string;
  name: I18nText;
  side: Side;
  description: I18nText;
  avg_rent_usd: number;
  lat: number;
  lng: number;
  cover_url?: string | null;
  highlights?: I18nText[];
}

export interface University {
  id: string;
  slug: string;
  name: I18nText;
  short_name?: string;
  type: UniversityType;
  city: string;
  district_id: string;
  founded: number;
  website: string;
  logo_url?: string | null;
  cover_url?: string | null;
  description: I18nText;
  languages: string[]; // "tr" | "en"
  avg_tuition_min: number;
  avg_tuition_max: number;
  currency: "USD";
  student_count?: number | null;
  intl_student_pct?: number | null;
  has_dorm: boolean;
  lat: number;
  lng: number;
  editorial_score: number; // 0-100 Eduways score
  is_featured: boolean;
  status: "published" | "draft";
  highlights?: I18nText[];
  eduways_discount_pct?: number | null;
}

export interface Program {
  id: string;
  university_id: string;
  slug: string;
  name: I18nText;
  level: ProgramLevel;
  faculty: I18nText;
  language: "tr" | "en" | "tr-en";
  duration_years: number;
  tuition_usd: number;
  tuition_note?: I18nText | null;
  category_id: string;
}

export interface AdmissionDocument {
  name: I18nText;
  note?: I18nText;
  required: boolean;
}

export interface AdmissionRequirement {
  id: string;
  university_id: string;
  level: ProgramLevel;
  documents: AdmissionDocument[];
  exams: { name: I18nText; min?: I18nText; note?: I18nText }[];
  deadlines: { term: I18nText; date: string }[];
  notes?: I18nText | null;
}

export interface Scholarship {
  id: string;
  university_id: string | null;
  title: I18nText;
  discount_pct: number;
  type: ScholarshipType;
  conditions: I18nText;
  valid_until?: string | null;
}

export interface Ranking {
  id: string;
  university_id: string;
  source: RankingSource;
  year: number;
  rank_world?: number | null;
  rank_national?: number | null;
  score?: number | null;
  category_id?: string | null;
  source_url?: string | null;
}

export interface Service {
  id: string;
  slug: string;
  title: I18nText;
  summary: I18nText;
  body: I18nText;
  icon: string;
  price_note?: I18nText | null;
  order: number;
  steps?: { title: I18nText; body: I18nText }[];
}

export interface Story {
  id: string;
  slug: string;
  student_name: string;
  university_id: string;
  program: I18nText;
  photo_url?: string | null;
  quote: I18nText;
  body: I18nText;
  published_at: string;
  country?: string;
  year_enrolled?: number;
}

export interface Post {
  id: string;
  slug: string;
  title: I18nText;
  excerpt: I18nText;
  body: I18nText; // markdown
  cover_url?: string | null;
  tags: string[];
  published_at: string;
  author: string;
  reading_minutes?: number;
}

export interface Faq {
  id: string;
  question: I18nText;
  answer: I18nText;
  category: string;
  order: number;
}

export interface Lead {
  id?: string;
  name: string;
  phone: string;
  email?: string | null;
  country?: string | null;
  interest_level?: ProgramLevel | null;
  desired_major?: string | null;
  budget_usd?: number | null;
  message?: string | null;
  source_page?: string | null;
  locale?: string | null;
  status?: "new" | "contacted" | "closed";
  created_at?: string;
}

export interface SiteSettings {
  whatsapp_number: string;
  instagram_url: string;
  address: I18nText;
  stats: { students_placed: number; partner_universities: number; years_active: number; satisfaction_pct: number };
  email?: string;
  phone?: string;
}

/** Denormalised shapes used by pages */
export interface UniversityWithRelations extends University {
  district?: District;
  programs: Program[];
  requirements: AdmissionRequirement[];
  scholarships: Scholarship[];
  rankings: Ranking[];
  best_rank?: number | null; // best national rank across sources
  value_score?: number | null;
}
