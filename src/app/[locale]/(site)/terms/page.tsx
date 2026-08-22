import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHeader } from "@/components/layout/page";

export default async function TermsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("footer");
  // SCOPE(v1): placeholder terms — replace with lawyer-reviewed text. GROWS LATER → full terms.
  // Paragraphs are numbered keys in `legal.terms`; adding p3, p4… in messages/*.json is enough.
  const tp = await getTranslations("legal.terms");
  const paragraphs = ["p1", "p2", "p3", "p4", "p5"].filter((k) => tp.has(k));
  return (
    <>
      <PageHeader title={t("terms")} />
      <section className="container-x max-w-3xl py-12 text-base leading-8 text-muted">
        {paragraphs.map((k, i) => <p key={k} className={i ? "mt-4" : undefined}>{tp(k)}</p>)}
      </section>
    </>
  );
}
