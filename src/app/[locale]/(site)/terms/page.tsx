import { getLocale, getTranslations, setRequestLocale } from "next-intl/server";
import { PageHeader } from "@/components/layout/page";

export default async function TermsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("footer");
  const loc = await getLocale();
  return (
    <>
      <PageHeader title={t("terms")} />
      <section className="container-x max-w-3xl py-12 text-base leading-8 text-muted">
        {loc === "fa" ? (
          <p>اطلاعات دانشگاه‌ها، شهریه‌ها و رتبه‌ها در این سایت جنبه اطلاع‌رسانی دارد و ممکن است تغییر کند. شهریه و شرایط نهایی هنگام ثبت درخواست توسط دانشگاه تأیید می‌شود. خدمات ادیوویز بر اساس قرارداد کتبی ارائه می‌شود.</p>
        ) : (
          <p>University, tuition and ranking information on this site is provided for guidance and may change. Final tuition and conditions are confirmed by the university at application time. Eduways services are provided under a written agreement.</p>
        )}
      </section>
    </>
  );
}
