import type { Scholarship, Ranking } from "@/lib/types";
import { universities } from "./universities";

const s = (
  uniSlug: string | null,
  id: string,
  fa: string,
  en: string,
  discount_pct: number,
  type: Scholarship["type"],
  condFa: string,
  condEn: string,
  valid_until: string | null = null,
): Scholarship => ({
  id: `sch-${id}`,
  university_id: uniSlug ? `uni-${uniSlug}` : null,
  title: { fa, en },
  discount_pct,
  type,
  conditions: { fa: condFa, en: condEn },
  valid_until,
});

const explicit: Scholarship[] = [
  s(null, "turkiye-burslari", "بورسیه دولتی ترکیه (Türkiye Bursları)", "Türkiye Scholarships (government)", 100, "government",
    "شهریه کامل + حقوق ماهانه + خوابگاه + بیمه + بلیت. ثبت‌نام ژانویه–فوریه هر سال؛ رقابتی (معدل ۱۷+/۷۰٪+). ادیوویز پرونده شما را آماده می‌کند.",
    "Full tuition + monthly stipend + dorm + insurance + flight. Applications every January–February; competitive (GPA 70%+). Eduways prepares your file.", "2027-02-20"),
  s("koc-university", "koc-merit", "بورسیه شایستگی کوچ", "Koç Merit Scholarship", 100, "university",
    "بر اساس SAT/دیپلم: ۲۵٪، ۵۰٪ یا ۱۰۰٪ شهریه. SAT 1450+ معمولاً بورسیه کامل.", "Based on SAT/diploma: 25%, 50% or 100% tuition. SAT 1450+ typically full."),
  s("sabanci-university", "sabanci-merit", "بورسیه شایستگی سابانجی", "Sabancı Merit Scholarship", 100, "university",
    "تا ۱۰۰٪ شهریه + کمک‌هزینه برای نمرات SAT بالا؛ تمدید با معدل ۳/۴.", "Up to 100% tuition + stipend for high SAT; renewed with GPA 3/4."),
  s("ozyegin-university", "ozu-intl", "بورسیه بین‌المللی اوزیگین", "Özyeğin International Scholarship", 50, "university",
    "۲۵–۵۰٪ بر اساس معدل دیپلم؛ ۱۰۰٪ برای SAT 1400+.", "25–50% on diploma GPA; 100% for SAT 1400+."),
  s("bilgi-university", "bilgi-intl", "تخفیف بین‌المللی بیلگی", "Bilgi International Discount", 50, "university",
    "۵۰٪ تخفیف استاندارد برای همه دانشجویان بین‌المللی غیر از پزشکی.", "Standard 50% discount for all international students outside medicine."),
  s("bahcesehir-university", "bau-intl", "بورسیه بین‌المللی BAU", "BAU International Scholarship", 50, "university",
    "۲۵–۵۰٪ بر اساس معدل؛ تا ۷۵٪ با SAT 1300+.", "25–50% on GPA; up to 75% with SAT 1300+."),
  s("medipol-university", "medipol-intl", "تخفیف بین‌المللی مدیپول", "Medipol International Discount", 30, "university",
    "تخفیف‌های پایه ۲۰–۳۰٪ برای مهندسی و علوم سلامت؛ پزشکی/دندانپزشکی محدودتر.", "Base 20–30% on engineering and health sciences; medicine/dentistry more limited."),
  s("istanbul-aydin-university", "aydin-intl", "بورسیه بین‌المللی آیدین", "Aydın International Scholarship", 50, "university",
    "۵۰٪ برای اکثر رشته‌ها؛ ۲۵٪ پزشکی و دندانپزشکی.", "50% on most programs; 25% on medicine and dentistry."),
  s("kadir-has-university", "khas-merit", "بورسیه کادیر هاس", "Kadir Has Scholarship", 50, "university",
    "۲۵–۵۰٪ بر اساس معدل؛ ۱۰۰٪ برای برترین‌ها.", "25–50% on GPA; 100% for top applicants."),
  s("ibn-haldun-university", "ihu-full", "بورسیه کامل ابن‌خلدون", "Ibn Haldun Full Scholarship", 100, "university",
    "بورسیه کامل با خوابگاه برای دانشجویان علوم اجتماعی با معدل بالا.", "Full scholarship with dorm for high-GPA social sciences applicants."),
];

/** Every university with an eduways_discount_pct gets an Eduways deal entry. */
const eduwaysDeals: Scholarship[] = universities
  .filter((u) => u.eduways_discount_pct)
  .map((u) =>
    s(u.slug, `edu-${u.slug}`, "تخفیف اختصاصی ادیوویز", "Eduways exclusive discount", u.eduways_discount_pct!, "eduways",
      `از طریق قرارداد مستقیم ادیوویز با ${u.name.fa}: تا ${u.eduways_discount_pct}٪ تخفیف شهریه روی قیمت رسمی. قابل جمع با برخی بورسیه‌های دانشگاه.`,
      `Through Eduways’ direct agreement with ${u.name.en}: up to ${u.eduways_discount_pct}% off list tuition. Stackable with some university scholarships.`),
  );

export const scholarships: Scholarship[] = [...explicit, ...eduwaysDeals];

/* ───────────────────────────── RANKINGS ─────────────────────────────
 * Approximate national ranks (Türkiye) from URAP 2024-25, THE 2025 and QS 2026 public tables.
 * Values are indicative and must be verified/updated yearly by Eduways staff (see HANDOFF.md).
 */
type R = [slug: string, urap?: number | null, the?: number | null, qs?: number | null, qsWorld?: number | null];
const ROWS: R[] = [
  ["istanbul-technical-university", 3, 6, 3, 404],
  ["bogazici-university", 8, 4, 4, 500],
  ["istanbul-university", 4, 7, 7, 650],
  ["istanbul-university-cerrahpasa", 10, 12, null, null],
  ["marmara-university", 11, 15, 14, null],
  ["yildiz-technical-university", 14, 16, 12, null],
  ["galatasaray-university", 40, null, null, null],
  ["mimar-sinan-fine-arts-university", 70, null, null, null],
  ["istanbul-medeniyet-university", 45, 30, null, null],
  ["turkish-german-university", 90, null, null, null],
  ["koc-university", 9, 1, 2, 400],
  ["sabanci-university", 18, 2, 5, 520],
  ["ozyegin-university", 38, 22, 20, null],
  ["bilgi-university", 48, 34, 22, null],
  ["bahcesehir-university", 42, 28, 18, null],
  ["medipol-university", 30, 26, 30, null],
  ["istanbul-aydin-university", 55, 45, 35, null],
  ["istanbul-kultur-university", 65, null, null, null],
  ["istanbul-okan-university", 62, null, null, null],
  ["altinbas-university", 68, null, null, null],
  ["istinye-university", 35, 20, null, null],
  ["kadir-has-university", 44, 27, null, null],
  ["yeditepe-university", 33, 29, 26, null],
  ["acibadem-university", 28, 19, null, null],
  ["uskudar-university", 58, null, null, null],
  ["beykent-university", 85, null, null, null],
  ["maltepe-university", 80, null, null, null],
  ["isik-university", 88, null, null, null],
  ["nisantasi-university", 95, null, null, null],
  ["halic-university", 92, null, null, null],
  ["fatih-sultan-mehmet-vakif-university", 98, null, null, null],
  ["istanbul-gelisim-university", 75, null, null, null],
  ["istanbul-arel-university", 100, null, null, null],
  ["bezmialem-vakif-university", 37, 31, null, null],
  ["biruni-university", 72, null, null, null],
  ["dogus-university", 96, null, null, null],
  ["istanbul-ticaret-university", 78, null, null, null],
  ["istanbul-sabahattin-zaim-university", 94, null, null, null],
  ["piri-reis-university", 105, null, null, null],
  ["istanbul-yeni-yuzyil-university", 102, null, null, null],
  ["istanbul-atlas-university", 110, null, null, null],
  ["istanbul-kent-university", 120, null, null, null],
  ["istanbul-topkapi-university", 125, null, null, null],
  ["istanbul-esenyurt-university", 118, null, null, null],
  ["ibn-haldun-university", 99, null, null, null],
  ["istanbul-29-mayis-university", 108, null, null, null],
  ["demiroglu-bilim-university", 60, null, null, null],
  ["fenerbahce-university", 130, null, null, null],
  ["beykoz-university", 135, null, null, null],
  ["istanbul-galata-university", 150, null, null, null],
  ["istanbul-rumeli-university", 145, null, null, null],
  ["istanbul-health-and-technology-university", 140, null, null, null],
];

export const rankings: Ranking[] = ROWS.flatMap(([slug, urap, the, qs, qsWorld]) => {
  const out: Ranking[] = [];
  const uni = `uni-${slug}`;
  if (urap) out.push({ id: `rk-${slug}-urap`, university_id: uni, source: "urap", year: 2024, rank_national: urap, source_url: "https://newtr.urapcenter.org/Rankings" });
  if (the) out.push({ id: `rk-${slug}-the`, university_id: uni, source: "the", year: 2025, rank_national: the, source_url: "https://www.timeshighereducation.com/world-university-rankings" });
  if (qs) out.push({ id: `rk-${slug}-qs`, university_id: uni, source: "qs", year: 2026, rank_national: qs, rank_world: qsWorld ?? null, source_url: "https://www.topuniversities.com/university-rankings" });
  return out;
});
