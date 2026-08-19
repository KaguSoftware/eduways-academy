import type { Metadata } from "next";
import { getLocale, getTranslations, setRequestLocale } from "next-intl/server";
import { getRepo } from "@/lib/repo";
import { tx } from "@/lib/utils";
import { PageHeader, CtaBanner } from "@/components/layout/page";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/primitives";
import { FaqJsonLd } from "@/components/seo/json-ld";

export const revalidate = 3600;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "faq" });
  return { title: t("title"), description: t("subtitle") };
}

export default async function FaqPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("faq");
  const loc = await getLocale();
  const repo = await getRepo();
  const faqs = await repo.listFaqs();
  const cats = ["general", "admission", "costs", "visa", "life"].filter((c) => faqs.some((f) => f.category === c));
  return (
    <>
      <FaqJsonLd faqs={faqs} locale={loc} />
      <PageHeader title={t("title")} subtitle={t("subtitle")} />
      <section className="container-x max-w-4xl space-y-12 py-12">
        {cats.map((c) => (
          <div key={c}>
            <h2 className="mb-4 text-xl font-bold">{t(`categories.${c}` as never)}</h2>
            <Accordion type="single" collapsible className="grid gap-3">
              {faqs.filter((f) => f.category === c).map((f) => (
                <AccordionItem key={f.id} value={f.id}><AccordionTrigger>{tx(f.question, loc)}</AccordionTrigger><AccordionContent>{tx(f.answer, loc)}</AccordionContent></AccordionItem>
              ))}
            </Accordion>
          </div>
        ))}
      </section>
      <CtaBanner compact />
    </>
  );
}
