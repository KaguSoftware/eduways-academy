import type { AdmissionRequirement, AdmissionDocument, ProgramLevel } from "@/lib/types";
import { universities } from "./universities";

const doc = (fa: string, en: string, required = true, noteFa?: string, noteEn?: string): AdmissionDocument => ({
  name: { fa, en },
  required,
  ...(noteFa && noteEn ? { note: { fa: noteFa, en: noteEn } } : {}),
});

const BACHELOR_COMMON: AdmissionDocument[] = [
  doc("دیپلم دبیرستان (یا پیش‌دانشگاهی)", "High-school diploma", true, "ترجمه رسمی ترکی یا انگلیسی + تأیید نوتر/کنسولگری", "Official Turkish/English translation + notary/consulate attestation"),
  doc("ریزنمرات سه سال آخر دبیرستان", "High-school transcript (last 3 years)", true, "ترجمه رسمی", "Official translation"),
  doc("پاسپورت معتبر", "Valid passport", true, "حداقل ۱۸ ماه اعتبار", "At least 18 months validity"),
  doc("عکس بیومتریک", "Biometric photo", true, "۶ قطعه ۳.۵×۴.۵ زمینه سفید", "6 copies, 3.5×4.5 cm, white background"),
  doc("مدرک زبان (TOEFL/IELTS یا YDS)", "Language certificate (TOEFL/IELTS or YDS)", false, "در نبود مدرک، آزمون تعیین سطح دانشگاه + سال آمادگی زبان", "Without it: university placement test + preparatory year"),
  doc("دنکلیک (معادل‌سازی دیپلم)", "Denklik (diploma equivalence)", true, "پس از پذیرش، از کنسولگری ترکیه یا اداره آموزش استانی", "After acceptance, from the Turkish consulate or provincial education office"),
  doc("فرم درخواست آنلاین و فیش پرداخت", "Online application form + fee receipt", true),
];

const MASTER_COMMON: AdmissionDocument[] = [
  doc("دانشنامه کارشناسی", "Bachelor diploma", true, "ترجمه رسمی و تأیید", "Official translation and attestation"),
  doc("ریزنمرات کارشناسی", "Bachelor transcript", true, "معدل بالای ۲.۵/۴ یا ۱۴/۲۰ توصیه می‌شود", "GPA above 2.5/4 (≈14/20) recommended"),
  doc("پاسپورت معتبر", "Valid passport", true),
  doc("انگیزه‌نامه (SOP)", "Statement of purpose", true),
  doc("دو توصیه‌نامه", "Two reference letters", true),
  doc("رزومه (CV)", "CV", true),
  doc("مدرک زبان انگلیسی", "English certificate", false, "برای برنامه‌های انگلیسی؛ در نبود آن آزمون دانشگاه", "For English programs; otherwise a university exam"),
  doc("نمره GRE/GMAT یا ALES", "GRE/GMAT or ALES", false, "برخی دانشگاه‌ها برای رشته‌های مهندسی/MBA", "Some universities for engineering/MBA"),
  doc("عکس بیومتریک", "Biometric photo", true),
];

const PHD_COMMON: AdmissionDocument[] = [
  doc("دانشنامه و ریزنمرات ارشد و کارشناسی", "Master + bachelor diplomas and transcripts", true),
  doc("پروپوزال پژوهشی", "Research proposal", true),
  doc("پذیرش اولیه از استاد راهنما", "Supervisor pre-acceptance (email)", false, "شانس پذیرش و بورسیه را بسیار بالا می‌برد", "Greatly increases admission and funding chances"),
  doc("مدرک زبان انگلیسی (حداقل B2)", "English certificate (min. B2)", true),
  doc("ALES/GRE", "ALES/GRE", false),
  doc("دو توصیه‌نامه آکادمیک", "Two academic references", true),
  doc("پاسپورت و عکس", "Passport and photos", true),
];

const examsPublic = [
  { name: "YÖS (دانشگاه‌های دولتی / TR-YÖS)", min: "۶۰+/۱۰۰ برای مهندسی، ۸۰+ برای پزشکی", note: { fa: "آزمون استعداد ریاضی/هندسه؛ ایرانی‌ها معمولاً نتایج عالی می‌گیرند", en: "Math/geometry aptitude test; Iranian students typically score very well" } },
  { name: "SAT", min: "1100+ (1300+ medicine)", note: { fa: "بیشتر دولتی‌ها SAT را هم می‌پذیرند", en: "Most public universities also accept SAT" } },
  { name: "دیپلم / کنکور ایران", min: "معدل ۱۷+ برای رشته‌های رقابتی", note: { fa: "برخی دانشگاه‌ها رتبه کنکور را هم قبول می‌کنند", en: "Some accept the Iranian Konkur rank" } },
];
const examsPrivate = [
  { name: "معدل دیپلم", min: "اغلب بدون حداقل؛ برای پزشکی/دندانپزشکی ۱۷+ و برای بورسیه بالاتر", note: { fa: "اکثر دانشگاه‌های خصوصی فقط با دیپلم پذیرش می‌دهند", en: "Most private universities admit on diploma alone" } },
  { name: "SAT / YÖS (برای بورسیه)", min: "SAT 1200+ → 25–100% بورسیه", note: { fa: "اختیاری اما برای تخفیف بیشتر مؤثر", en: "Optional but boosts scholarships" } },
];

const deadlines = [
  { term: { fa: "ترم پاییز (شروع سپتامبر)", en: "Fall term (starts September)" }, date: "2026-08-15" },
  { term: { fa: "ترم بهار (شروع فوریه)", en: "Spring term (starts February)" }, date: "2027-01-15" },
];

function reqs(slug: string, type: "public" | "foundation"): AdmissionRequirement[] {
  const uni = `uni-${slug}`;
  const levels: ProgramLevel[] = ["bachelor", "master", "phd"];
  return levels.map((level) => ({
    id: `req-${slug}-${level}`,
    university_id: uni,
    level,
    documents: level === "bachelor" ? BACHELOR_COMMON : level === "master" ? MASTER_COMMON : PHD_COMMON,
    exams: level === "bachelor" ? (type === "public" ? examsPublic : examsPrivate) : [],
    deadlines: type === "public" && level === "bachelor"
      ? [{ term: { fa: "آزمون YÖS و ثبت‌نام بین‌المللی", en: "YÖS exam + international application window" }, date: "2026-07-01" }]
      : deadlines,
    notes:
      type === "public"
        ? { fa: "دانشگاه‌های دولتی ظرفیت محدود بین‌المللی دارند؛ ثبت‌نام زودهنگام و نمره YÖS/SAT بالا کلید پذیرش است. ادیوویز شما را برای آزمون آماده و پرونده را پیگیری می‌کند.", en: "Public universities have limited international quotas; early application and a strong YÖS/SAT score are key. Eduways prepares you for the exam and tracks your file." }
        : { fa: "پذیرش اولیه معمولاً ظرف ۱–۲ هفته صادر می‌شود. پس از پرداخت پیش‌شهریه، نامه پذیرش نهایی برای ویزا ارسال می‌شود. تخفیف ادیوویز پیش از پرداخت اعمال می‌گردد.", en: "Conditional acceptance usually within 1–2 weeks. After the deposit, the final acceptance letter is issued for the visa. The Eduways discount applies before payment." },
  }));
}

export const requirements: AdmissionRequirement[] = universities.flatMap((u) => reqs(u.slug, u.type));
