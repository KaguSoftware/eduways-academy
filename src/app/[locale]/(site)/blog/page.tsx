import type { Metadata } from "next";
import { getLocale, getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getRepo } from "@/lib/repo";
import { formatDate, tx } from "@/lib/utils";
import { PageHeader, CtaBanner } from "@/components/layout/page";
import { Badge } from "@/components/ui/primitives";
import { Reveal } from "@/components/ui/reveal";
import { Pager } from "@/components/ui/pager";

export const revalidate = 3600;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "blog" });
  return { title: t("title"), description: t("subtitle") };
}

export default async function BlogPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();
  const loc = await getLocale();
  const repo = await getRepo();
  const posts = await repo.listPosts();
  return (
    <>
      <PageHeader title={t("blog.title")} subtitle={t("blog.subtitle")} />
      <section className="container-x py-12">
        <Pager perPage={6}>
          {posts.map((p, i) => (
            <Reveal key={p.id} delay={(i % 6) * 0.05}>
              <Link href={`/blog/${p.slug}`} className="group flex h-full flex-col card overflow-hidden transition-all hover:-translate-y-1 hover:shadow-lg focus-ring">
                <div className="h-1.5 bg-brand-gradient" />
                <div className="flex flex-1 flex-col p-6">
                  <div className="flex flex-wrap gap-1.5">{p.tags.slice(0, 2).map((tag) => <Badge key={tag} variant="brand" className="font-en">{tag}</Badge>)}</div>
                  <h3 className="mt-3 text-lg font-bold leading-snug group-hover:text-brand-800">{tx(p.title, loc)}</h3>
                  <p className="mt-2 line-clamp-3 flex-1 text-sm leading-7 text-muted">{tx(p.excerpt, loc)}</p>
                  <p className="mt-4 text-xs text-muted">{formatDate(p.published_at, loc)} · {t("blog.readingTime", { minutes: p.reading_minutes ?? 5 })}</p>
                </div>
              </Link>
            </Reveal>
          ))}
        </Pager>
      </section>
      <CtaBanner compact />
    </>
  );
}
