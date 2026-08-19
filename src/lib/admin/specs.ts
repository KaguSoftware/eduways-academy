/**
 * Admin table specs: which tables are editable and how each field renders.
 * Labels are bilingual {fa,en}; field types map to branded controls in components/admin/record-form.tsx.
 */
import type { I18nText } from "@/lib/utils";

export type FieldType = "text" | "i18n" | "i18n-long" | "i18n-md" | "i18n-list" | "number" | "boolean" | "select" | "date" | "tags" | "json";

export interface FieldSpec {
  key: string;
  label: I18nText;
  type: FieldType;
  options?: { value: string; label: I18nText }[];
  required?: boolean;
  readOnly?: boolean;
  help?: I18nText;
  section?: "basic" | "content" | "numbers" | "meta";
  placeholder?: string;
}

export interface TableSpec {
  table: string;
  label: I18nText;
  singular: I18nText;
  idField: string;
  titleField: string;
  listFields: string[]; // keys from fields
  fields: FieldSpec[];
  orderBy?: string;
  orderAsc?: boolean;
  canCreate?: boolean;
  idPrefix?: string; // e.g. "uni-" — used to suggest ids on create
}

const L = (fa: string, en: string): I18nText => ({ fa, en });
const f = (key: string, fa: string, en: string, type: FieldType, extra: Partial<FieldSpec> = {}): FieldSpec => ({ key, label: L(fa, en), type, ...extra });
const STATUS = [{ value: "published", label: L("منتشرشده", "Published") }, { value: "draft", label: L("پیش‌نویس", "Draft") }];
const LEVELS = [{ value: "associate", label: L("کاردانی", "Associate") }, { value: "bachelor", label: L("کارشناسی", "Bachelor") }, { value: "master", label: L("کارشناسی ارشد", "Master") }, { value: "phd", label: L("دکتری", "PhD") }];
const LANGS = [{ value: "tr", label: L("ترکی", "Turkish") }, { value: "en", label: L("انگلیسی", "English") }, { value: "tr-en", label: L("ترکی و انگلیسی", "Turkish & English") }];

export const TABLES: Record<string, TableSpec> = {
  universities: {
    table: "universities", label: L("دانشگاه‌ها", "Universities"), singular: L("دانشگاه", "University"), idField: "id", titleField: "name", idPrefix: "uni-",
    listFields: ["type", "avg_tuition_min", "avg_tuition_max", "is_featured", "status"], orderBy: "editorial_score", canCreate: true,
    fields: [
      f("id", "شناسه", "ID", "text", { required: true, help: L("مثلاً uni-koc-university", "e.g. uni-koc-university"), section: "basic" }),
      f("slug", "اسلاگ (آدرس)", "Slug", "text", { required: true, section: "basic" }),
      f("name", "نام", "Name", "i18n", { required: true, section: "basic" }),
      f("short_name", "نام کوتاه", "Short name", "text", { section: "basic" }),
      f("type", "نوع", "Type", "select", { options: [{ value: "public", label: L("دولتی", "Public") }, { value: "foundation", label: L("خصوصی", "Private (foundation)") }], required: true, section: "basic" }),
      f("district_id", "شناسه منطقه", "District ID", "text", { help: L("مثلاً dist-besiktas", "e.g. dist-besiktas"), section: "basic" }),
      f("status", "وضعیت", "Status", "select", { options: STATUS, section: "basic" }),
      f("is_featured", "منتخب", "Featured", "boolean", { section: "basic" }),
      f("description", "معرفی", "Description", "i18n-long", { section: "content" }),
      f("highlights", "نکات برجسته", "Highlights", "i18n-list", { help: L("هر نکته در یک خط", "One highlight per line"), section: "content" }),
      f("website", "وب‌سایت", "Website", "text", { section: "content" }),
      f("logo_url", "آدرس لوگو", "Logo URL", "text", { section: "content" }),
      f("cover_url", "آدرس تصویر کاور", "Cover URL", "text", { section: "content" }),
      f("languages", "زبان‌های تدریس", "Languages", "tags", { help: L("با کاما جدا کنید: tr, en", "comma separated: tr, en"), section: "numbers" }),
      f("avg_tuition_min", "حداقل شهریه (دلار)", "Tuition min (USD)", "number", { section: "numbers" }),
      f("avg_tuition_max", "حداکثر شهریه (دلار)", "Tuition max (USD)", "number", { section: "numbers" }),
      f("eduways_discount_pct", "درصد تخفیف ادیوویز", "Eduways discount %", "number", { section: "numbers" }),
      f("founded", "سال تأسیس", "Founded", "number", { section: "numbers" }),
      f("student_count", "تعداد دانشجو", "Students", "number", { section: "numbers" }),
      f("intl_student_pct", "درصد دانشجوی بین‌المللی", "International %", "number", { section: "numbers" }),
      f("has_dorm", "خوابگاه دارد", "Has dorm", "boolean", { section: "numbers" }),
      f("lat", "عرض جغرافیایی", "Latitude", "number", { section: "meta" }),
      f("lng", "طول جغرافیایی", "Longitude", "number", { section: "meta" }),
    ],
  },
  programs: {
    table: "programs", label: L("رشته‌ها", "Programs"), singular: L("رشته", "Program"), idField: "id", titleField: "name", idPrefix: "prog-",
    listFields: ["university_id", "level", "language", "tuition_usd"], orderBy: "university_id", orderAsc: true, canCreate: true,
    fields: [
      f("id", "شناسه", "ID", "text", { required: true, section: "basic" }),
      f("university_id", "شناسه دانشگاه", "University ID", "text", { required: true, section: "basic", help: L("مثلاً uni-koc-university", "e.g. uni-koc-university") }),
      f("slug", "اسلاگ", "Slug", "text", { required: true, section: "basic" }),
      f("name", "نام رشته", "Name", "i18n", { required: true, section: "basic" }),
      f("level", "مقطع", "Level", "select", { options: LEVELS, section: "basic" }),
      f("language", "زبان", "Language", "select", { options: LANGS, section: "basic" }),
      f("category_id", "شناسه حوزه", "Category ID", "text", { help: L("مثلاً cat-engineering", "e.g. cat-engineering"), section: "basic" }),
      f("faculty", "دانشکده", "Faculty", "i18n", { section: "content" }),
      f("tuition_note", "توضیح شهریه", "Tuition note", "i18n", { section: "content" }),
      f("duration_years", "مدت (سال)", "Duration (years)", "number", { section: "numbers" }),
      f("tuition_usd", "شهریه سالانه (دلار)", "Tuition (USD)", "number", { section: "numbers" }),
    ],
  },
  scholarships: {
    table: "scholarships", label: L("بورسیه‌ها و تخفیف‌ها", "Scholarships"), singular: L("بورسیه", "Scholarship"), idField: "id", titleField: "title", idPrefix: "sch-",
    listFields: ["university_id", "discount_pct", "type", "valid_until"], canCreate: true,
    fields: [
      f("id", "شناسه", "ID", "text", { required: true, section: "basic" }),
      f("university_id", "شناسه دانشگاه (خالی = عمومی)", "University ID (empty = global)", "text", { section: "basic" }),
      f("title", "عنوان", "Title", "i18n", { required: true, section: "basic" }),
      f("type", "نوع", "Type", "select", { options: [{ value: "university", label: L("دانشگاه", "University") }, { value: "eduways", label: L("ادیوویز", "Eduways") }, { value: "government", label: L("دولتی", "Government") }], section: "basic" }),
      f("discount_pct", "درصد تخفیف", "Discount %", "number", { section: "numbers" }),
      f("valid_until", "اعتبار تا", "Valid until", "date", { section: "numbers" }),
      f("conditions", "شرایط", "Conditions", "i18n-long", { section: "content" }),
    ],
  },
  rankings: {
    table: "rankings", label: L("رتبه‌بندی‌ها", "Rankings"), singular: L("رتبه", "Ranking"), idField: "id", titleField: "university_id", idPrefix: "rk-",
    listFields: ["source", "year", "rank_national", "rank_world"], canCreate: true,
    fields: [
      f("id", "شناسه", "ID", "text", { required: true, section: "basic" }),
      f("university_id", "شناسه دانشگاه", "University ID", "text", { required: true, section: "basic" }),
      f("source", "منبع", "Source", "select", { options: ["urap", "the", "qs", "eduways"].map((v) => ({ value: v, label: L(v.toUpperCase(), v.toUpperCase()) })), section: "basic" }),
      f("year", "سال", "Year", "number", { section: "numbers" }),
      f("rank_national", "رتبه ملی", "National rank", "number", { section: "numbers" }),
      f("rank_world", "رتبه جهانی", "World rank", "number", { section: "numbers" }),
      f("source_url", "لینک منبع", "Source URL", "text", { section: "content" }),
    ],
  },
  districts: {
    table: "districts", label: L("مناطق", "Districts"), singular: L("منطقه", "District"), idField: "id", titleField: "name", idPrefix: "dist-",
    listFields: ["side", "avg_rent_usd"], canCreate: true,
    fields: [
      f("id", "شناسه", "ID", "text", { required: true, section: "basic" }),
      f("slug", "اسلاگ", "Slug", "text", { required: true, section: "basic" }),
      f("name", "نام", "Name", "i18n", { required: true, section: "basic" }),
      f("side", "سمت", "Side", "select", { options: [{ value: "european", label: L("اروپایی", "European") }, { value: "asian", label: L("آسیایی", "Asian") }], section: "basic" }),
      f("description", "توضیحات", "Description", "i18n-long", { section: "content" }),
      f("highlights", "نکات برجسته", "Highlights", "i18n-list", { help: L("هر نکته در یک خط", "One highlight per line"), section: "content" }),
      f("avg_rent_usd", "میانگین اجاره (دلار/ماه)", "Avg rent (USD/month)", "number", { section: "numbers" }),
      f("lat", "عرض جغرافیایی", "Latitude", "number", { section: "meta" }),
      f("lng", "طول جغرافیایی", "Longitude", "number", { section: "meta" }),
    ],
  },
  services: {
    table: "services", label: L("خدمات", "Services"), singular: L("خدمت", "Service"), idField: "id", titleField: "title", idPrefix: "svc-",
    listFields: ["icon", "order"], orderBy: "order", orderAsc: true, canCreate: true,
    fields: [
      f("id", "شناسه", "ID", "text", { required: true, section: "basic" }),
      f("slug", "اسلاگ", "Slug", "text", { required: true, section: "basic" }),
      f("title", "عنوان", "Title", "i18n", { required: true, section: "basic" }),
      f("icon", "نام آیکون (Lucide)", "Lucide icon name", "text", { section: "basic", help: L("مثلاً GraduationCap", "e.g. GraduationCap") }),
      f("order", "ترتیب", "Order", "number", { section: "basic" }),
      f("summary", "خلاصه", "Summary", "i18n-long", { section: "content" }),
      f("body", "متن", "Body", "i18n-long", { section: "content" }),
      f("price_note", "توضیح هزینه", "Price note", "i18n", { section: "content" }),
      f("steps", "مراحل", "Steps", "json", { help: L("آرایه JSON از {title:{fa,en}, body:{fa,en}}", "JSON array of {title:{fa,en}, body:{fa,en}}"), section: "content" }),
    ],
  },
  stories: {
    table: "stories", label: L("داستان‌های موفقیت", "Stories"), singular: L("داستان", "Story"), idField: "id", titleField: "student_name", idPrefix: "story-",
    listFields: ["university_id", "year_enrolled", "published_at", "status"], orderBy: "published_at", canCreate: true,
    fields: [
      f("id", "شناسه", "ID", "text", { required: true, section: "basic" }),
      f("slug", "اسلاگ", "Slug", "text", { required: true, section: "basic" }),
      f("student_name", "نام دانشجو", "Student name", "text", { required: true, section: "basic" }),
      f("university_id", "شناسه دانشگاه", "University ID", "text", { section: "basic" }),
      f("country", "کد کشور", "Country code", "text", { section: "basic", help: L("IR, AF, TJ…", "IR, AF, TJ…") }),
      f("status", "وضعیت", "Status", "select", { options: STATUS, section: "basic" }),
      f("program", "رشته", "Program", "i18n", { section: "content" }),
      f("quote", "نقل‌قول", "Quote", "i18n-long", { section: "content" }),
      f("body", "متن", "Body", "i18n-md", { section: "content" }),
      f("photo_url", "آدرس عکس", "Photo URL", "text", { section: "content" }),
      f("year_enrolled", "سال ورود", "Year enrolled", "number", { section: "numbers" }),
      f("published_at", "تاریخ انتشار", "Published at", "date", { section: "numbers" }),
    ],
  },
  posts: {
    table: "posts", label: L("مقالات و راهنماها", "Posts"), singular: L("مقاله", "Post"), idField: "id", titleField: "title", idPrefix: "post-",
    listFields: ["tags", "published_at", "status"], orderBy: "published_at", canCreate: true,
    fields: [
      f("id", "شناسه", "ID", "text", { required: true, section: "basic" }),
      f("slug", "اسلاگ", "Slug", "text", { required: true, section: "basic" }),
      f("title", "عنوان", "Title", "i18n", { required: true, section: "basic" }),
      f("status", "وضعیت", "Status", "select", { options: STATUS, section: "basic" }),
      f("tags", "برچسب‌ها", "Tags", "tags", { help: L("با کاما جدا کنید", "comma separated"), section: "basic" }),
      f("excerpt", "خلاصه", "Excerpt", "i18n-long", { section: "content" }),
      f("body", "متن (Markdown)", "Body (markdown)", "i18n-md", { section: "content" }),
      f("cover_url", "آدرس تصویر کاور", "Cover URL", "text", { section: "content" }),
      f("author", "نویسنده", "Author", "text", { section: "meta" }),
      f("reading_minutes", "زمان مطالعه (دقیقه)", "Reading minutes", "number", { section: "meta" }),
      f("published_at", "تاریخ انتشار", "Published at", "date", { section: "meta" }),
    ],
  },
  faqs: {
    table: "faqs", label: L("سوالات متداول", "FAQs"), singular: L("سوال", "FAQ"), idField: "id", titleField: "question", idPrefix: "faq-",
    listFields: ["category", "order"], orderBy: "order", orderAsc: true, canCreate: true,
    fields: [
      f("id", "شناسه", "ID", "text", { required: true, section: "basic" }),
      f("category", "دسته", "Category", "select", { options: [{ value: "general", label: L("عمومی", "General") }, { value: "admission", label: L("پذیرش", "Admission") }, { value: "costs", label: L("هزینه و بورسیه", "Costs") }, { value: "visa", label: L("ویزا و اقامت", "Visa") }, { value: "life", label: L("زندگی در استانبول", "Life") }], section: "basic" }),
      f("order", "ترتیب", "Order", "number", { section: "basic" }),
      f("question", "سوال", "Question", "i18n", { required: true, section: "content" }),
      f("answer", "پاسخ", "Answer", "i18n-long", { section: "content" }),
    ],
  },
  site_settings: {
    table: "site_settings", label: L("تنظیمات سایت", "Settings"), singular: L("تنظیم", "Setting"), idField: "key", titleField: "key",
    listFields: ["value"], canCreate: false,
    fields: [
      f("key", "کلید", "Key", "text", { readOnly: true, section: "basic" }),
      f("value", "مقدار (JSON)", "Value (JSON)", "json", { section: "content" }),
    ],
  },
};

export const ADMIN_NAV = ["leads", "universities", "programs", "scholarships", "rankings", "districts", "services", "stories", "posts", "faqs", "site_settings"] as const;

export const SECTION_LABELS: Record<NonNullable<FieldSpec["section"]>, I18nText> = {
  basic: L("اطلاعات پایه", "Basics"),
  content: L("محتوا", "Content"),
  numbers: L("اعداد و ارقام", "Numbers"),
  meta: L("سایر", "Other"),
};
