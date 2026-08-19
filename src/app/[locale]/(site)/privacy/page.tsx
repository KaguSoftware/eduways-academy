import { getLocale, getTranslations, setRequestLocale } from "next-intl/server";
import { PageHeader } from "@/components/layout/page";

export default async function PrivacyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("footer");
  const loc = await getLocale();
  return (
    <>
      <PageHeader title={t("privacy")} />
      <section className="container-x max-w-3xl py-12 text-base leading-8 text-muted">
        {loc === "fa" ? (
          <>
            <p>اطلاعاتی که در فرم مشاوره وارد می‌کنید (نام، شماره تماس، ایمیل، کشور، رشته و بودجه) فقط برای تماس با شما درباره تحصیل در ترکیه استفاده می‌شود و با هیچ شخص ثالثی به اشتراک گذاشته نمی‌شود.</p>
            <p className="mt-4">می‌توانید هر زمان با پیام به واتساپ یا ایمیل ما درخواست حذف اطلاعات خود را بدهید.</p>
            {/* SCOPE(v1): placeholder policy text — replace with lawyer-reviewed text. GROWS LATER → full policy */}
          </>
        ) : (
          <>
            <p>The details you submit in the consultation form (name, phone, email, country, major and budget) are used only to contact you about studying in Türkiye and are never shared with third parties.</p>
            <p className="mt-4">You may request deletion of your data at any time via WhatsApp or email.</p>
          </>
        )}
      </section>
    </>
  );
}
