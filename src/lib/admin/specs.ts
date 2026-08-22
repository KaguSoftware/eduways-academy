/**
 * Admin table specs: which tables are editable and how each field renders.
 *
 * Structure only — no copy. Labels, hints, option labels and section headings all resolve from
 * `src/messages/{fa,en}.json` through `adminText()` in ./labels.ts, keyed by table + column name.
 * Field types map to branded controls in components/admin/record-form.tsx.
 */

export type FieldType = "text" | "i18n" | "i18n-long" | "i18n-md" | "i18n-list" | "number" | "boolean" | "select" | "ref" | "date" | "tags" | "steps" | "json";

/** Tables a `ref` field can point at — the picker lists their rows so foreign keys stay valid. */
export type RefSource = "districts" | "universities" | "categories";

export interface RefOption { value: string; label: string }

export const SECTIONS = ["basic", "content", "numbers", "meta"] as const;
export type SectionKey = (typeof SECTIONS)[number];

export interface FieldSpec {
  key: string;
  type: FieldType;
  /** Message-key suffix, when the column name is not the label identity. Defaults to `key`. */
  labelKey?: string;
  /** Option *values*; their labels come from `admin.options.<field>.<value>` or `common.<value>`. */
  options?: string[];
  /** A hint for this field exists in the catalogue (`admin.fieldHelp.*` / `admin.tableFieldHelp.*`). */
  help?: boolean;
  ref?: RefSource; // for type "ref": which table to pick an existing row from
  wordsOnly?: boolean; // for type "tags": only letters, digits, spaces and the "," separator can be typed
  required?: boolean;
  readOnly?: boolean;
  section?: SectionKey;
  placeholder?: string;
}

export interface TableSpec {
  table: string;
  idField: string;
  titleField: string;
  listFields: string[]; // keys from fields
  fields: FieldSpec[];
  orderBy?: string;
  orderAsc?: boolean;
  canCreate?: boolean;
  idPrefix?: string; // e.g. "uni-" — used to suggest ids on create
}

const f = (key: string, type: FieldType, extra: Partial<FieldSpec> = {}): FieldSpec => ({ key, type, ...extra });
const STATUS = ["published", "draft"];
const LEVELS = ["associate", "bachelor", "master", "phd"];
const LANGS = ["tr", "en", "tr-en"];

export const TABLES: Record<string, TableSpec> = {
  universities: {
    table: "universities", idField: "id", titleField: "name", idPrefix: "uni-",
    listFields: ["type", "avg_tuition_min", "avg_tuition_max", "is_featured", "status"], orderBy: "editorial_score", canCreate: true,
    fields: [
      f("id", "text", { required: true, help: true, section: "basic" }),
      f("slug", "text", { required: true, section: "basic" }),
      f("name", "i18n", { required: true, section: "basic" }),
      f("short_name", "text", { section: "basic" }),
      f("type", "select", { options: ["public", "foundation"], required: true, section: "basic" }),
      f("district_id", "ref", { ref: "districts", help: true, section: "basic" }),
      f("status", "select", { options: STATUS, section: "basic" }),
      f("is_featured", "boolean", { section: "basic" }),
      f("description", "i18n-long", { section: "content" }),
      f("highlights", "i18n-list", { help: true, section: "content" }),
      f("website", "text", { section: "content" }),
      f("logo_url", "text", { section: "content" }),
      f("cover_url", "text", { section: "content" }),
      f("languages", "tags", { wordsOnly: true, help: true, section: "numbers" }),
      f("avg_tuition_min", "number", { section: "numbers" }),
      f("avg_tuition_max", "number", { section: "numbers" }),
      f("eduways_discount_pct", "number", { section: "numbers" }),
      f("founded", "number", { section: "numbers" }),
      f("student_count", "number", { section: "numbers" }),
      f("intl_student_pct", "number", { section: "numbers" }),
      f("has_dorm", "boolean", { section: "numbers" }),
      f("lat", "number", { section: "meta" }),
      f("lng", "number", { section: "meta" }),
    ],
  },
  programs: {
    table: "programs", idField: "id", titleField: "name", idPrefix: "prog-",
    listFields: ["university_id", "level", "language", "tuition_usd"], orderBy: "university_id", orderAsc: true, canCreate: true,
    fields: [
      f("id", "text", { required: true, section: "basic" }),
      f("university_id", "ref", { ref: "universities", required: true, section: "basic" }),
      f("slug", "text", { required: true, section: "basic" }),
      f("name", "i18n", { required: true, section: "basic" }),
      f("level", "select", { options: LEVELS, section: "basic" }),
      f("language", "select", { options: LANGS, section: "basic" }),
      f("category_id", "ref", { ref: "categories", section: "basic" }),
      f("faculty", "i18n", { section: "content" }),
      f("tuition_note", "i18n", { section: "content" }),
      f("duration_years", "number", { section: "numbers" }),
      f("tuition_usd", "number", { section: "numbers" }),
    ],
  },
  scholarships: {
    table: "scholarships", idField: "id", titleField: "title", idPrefix: "sch-",
    listFields: ["university_id", "discount_pct", "type", "valid_until"], canCreate: true,
    fields: [
      f("id", "text", { required: true, section: "basic" }),
      f("university_id", "ref", { ref: "universities", section: "basic" }),
      f("title", "i18n", { required: true, section: "basic" }),
      f("type", "select", { options: ["university", "eduways", "government"], section: "basic" }),
      f("discount_pct", "number", { section: "numbers" }),
      f("valid_until", "date", { section: "numbers" }),
      f("conditions", "i18n-long", { section: "content" }),
    ],
  },
  rankings: {
    table: "rankings", idField: "id", titleField: "university_id", idPrefix: "rk-",
    listFields: ["source", "year", "rank_national", "rank_world"], canCreate: true,
    fields: [
      f("id", "text", { required: true, section: "basic" }),
      f("university_id", "ref", { ref: "universities", required: true, section: "basic" }),
      f("source", "select", { options: ["urap", "the", "qs", "eduways"], section: "basic" }),
      f("year", "number", { section: "numbers" }),
      f("rank_national", "number", { section: "numbers" }),
      f("rank_world", "number", { section: "numbers" }),
      f("source_url", "text", { section: "content" }),
    ],
  },
  districts: {
    table: "districts", idField: "id", titleField: "name", idPrefix: "dist-",
    listFields: ["side", "avg_rent_usd"], canCreate: true,
    fields: [
      f("id", "text", { required: true, section: "basic" }),
      f("slug", "text", { required: true, section: "basic" }),
      f("name", "i18n", { required: true, section: "basic" }),
      f("side", "select", { options: ["european", "asian"], section: "basic" }),
      f("description", "i18n-long", { section: "content" }),
      f("highlights", "i18n-list", { help: true, section: "content" }),
      f("avg_rent_usd", "number", { section: "numbers" }),
      f("lat", "number", { section: "meta" }),
      f("lng", "number", { section: "meta" }),
    ],
  },
  services: {
    table: "services", idField: "id", titleField: "title", idPrefix: "svc-",
    listFields: ["icon", "order"], orderBy: "order", orderAsc: true, canCreate: true,
    fields: [
      f("id", "text", { required: true, section: "basic" }),
      f("slug", "text", { required: true, section: "basic" }),
      f("title", "i18n", { required: true, section: "basic" }),
      f("icon", "text", { section: "basic", help: true }),
      f("order", "number", { section: "basic" }),
      f("summary", "i18n-long", { section: "content" }),
      f("body", "i18n-long", { section: "content" }),
      f("price_note", "i18n", { section: "content" }),
      f("steps", "steps", { help: true, section: "content" }),
    ],
  },
  stories: {
    table: "stories", idField: "id", titleField: "student_name", idPrefix: "story-",
    listFields: ["university_id", "year_enrolled", "published_at", "status"], orderBy: "published_at", canCreate: true,
    fields: [
      f("id", "text", { required: true, section: "basic" }),
      f("slug", "text", { required: true, section: "basic" }),
      f("student_name", "text", { required: true, section: "basic" }),
      f("university_id", "ref", { ref: "universities", section: "basic" }),
      f("country", "text", { section: "basic", help: true }),
      f("status", "select", { options: STATUS, section: "basic" }),
      f("program", "i18n", { section: "content" }),
      f("quote", "i18n-long", { section: "content" }),
      f("body", "i18n-md", { section: "content" }),
      f("photo_url", "text", { section: "content" }),
      f("year_enrolled", "number", { section: "numbers" }),
      f("published_at", "date", { section: "numbers" }),
    ],
  },
  posts: {
    table: "posts", idField: "id", titleField: "title", idPrefix: "post-",
    listFields: ["tags", "published_at", "status"], orderBy: "published_at", canCreate: true,
    fields: [
      f("id", "text", { required: true, section: "basic" }),
      f("slug", "text", { required: true, section: "basic" }),
      f("title", "i18n", { required: true, section: "basic" }),
      f("status", "select", { options: STATUS, section: "basic" }),
      f("tags", "tags", { help: true, section: "basic" }),
      f("excerpt", "i18n-long", { section: "content" }),
      f("body", "i18n-md", { section: "content" }),
      f("cover_url", "text", { section: "content" }),
      f("author", "text", { section: "meta" }),
      f("reading_minutes", "number", { section: "meta" }),
      f("published_at", "date", { section: "meta" }),
    ],
  },
  faqs: {
    table: "faqs", idField: "id", titleField: "question", idPrefix: "faq-",
    listFields: ["category", "order"], orderBy: "order", orderAsc: true, canCreate: true,
    fields: [
      f("id", "text", { required: true, section: "basic" }),
      f("category", "select", { options: ["general", "admission", "costs", "visa", "life"], section: "basic" }),
      f("order", "number", { section: "basic" }),
      f("question", "i18n", { required: true, section: "content" }),
      f("answer", "i18n-long", { section: "content" }),
    ],
  },
  site_settings: {
    table: "site_settings", idField: "key", titleField: "key",
    listFields: ["value"], canCreate: false,
    fields: [
      f("key", "text", { readOnly: true, section: "basic" }),
      f("value", "json", { section: "content" }),
    ],
  },
};

export const ADMIN_NAV = ["leads", "universities", "programs", "scholarships", "rankings", "districts", "services", "stories", "posts", "faqs", "site_settings"] as const;
