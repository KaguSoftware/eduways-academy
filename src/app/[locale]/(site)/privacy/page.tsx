import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHeader } from "@/components/layout/page";

export default async function PrivacyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("footer");
  // SCOPE(v1): placeholder policy text — replace with lawyer-reviewed text. GROWS LATER → full policy.
  // Paragraphs are numbered keys in `legal.privacy`; adding p3, p4… in messages/*.json is enough.
  const tp = await getTranslations("legal.privacy");
  const paragraphs = ["p1", "p2", "p3", "p4", "p5"].filter((k) => tp.has(k));
  return (
    <>
      <PageHeader title={t("privacy")} />
      <section className="container-x max-w-3xl py-12 text-base leading-8 text-muted">
        {paragraphs.map((k, i) => <p key={k} className={i ? "mt-4" : undefined}>{tp(k)}</p>)}
      </section>
    </>
  );
}
