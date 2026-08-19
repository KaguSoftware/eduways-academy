import type { Metadata } from "next";
import { getLocale, getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getRepo } from "@/lib/repo";
import { formatDate, tx } from "@/lib/utils";
import { PageHeader, CtaBanner } from "@/components/layout/page";
import { Badge } from "@/components/ui/primitives";
import { Reveal } from "@/components/ui/reveal";

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
  const [first, ...rest] = posts;
  return (
    <>
      <PageHeader title={t("blog.title")} subtitle={t("blog.subtitle")} />
      <section className="container-x py-12">
        {first && (
          <Link href={`/blog/${first.slug}`} className="group mb-8 grid gap-6 overflow-hidden rounded-3xl bg-brand-gradient p-8 text-white shadow-lg transition-shadow hover:shadow-xl md:grid-cols-[1.3fr_1fr] md:p-12 focus-ring">
            <div>
              <div className="flex gap-1.5">{first.tags.map((tag) => <Badge key={tag} className="bg-white/15 text-white font-en">{tag}</Badge>)}</div>
              <h2 className="mt-4 text-2xl font-extrabold leading-tight md:text-4xl">{tx(first.title, loc)}</h2>
              <p className="mt-3 text-sm leading-7 text-white/85 md:text-base">{tx(first.excerpt, loc)}</p>
              <p className="mt-5 text-xs text-white/70">{formatDate(first.published_at, loc)} · {t("blog.readingTime", { minutes: first.reading_minutes ?? 5 })}</p>
            </div>
          </Link>
        )}
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {rest.map((p, i) => (
            <Reveal key={p.id} delay={i * 0.05}>
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
        </div>
      </section>
      <CtaBanner compact />
    </>
  );
}
