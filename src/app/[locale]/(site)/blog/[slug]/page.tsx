import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getLocale, getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Clock, CalendarDays } from "lucide-react";
import { getRepo } from "@/lib/repo";
import { routing } from "@/i18n/routing";
import { formatDate, tx } from "@/lib/utils";
import { CtaBanner } from "@/components/layout/page";
import { Markdown } from "@/components/blog/markdown";
import { ArticleJsonLd } from "@/components/seo/json-ld";
import { Badge } from "@/components/ui/primitives";

export const revalidate = 3600;

export async function generateStaticParams() {
  const repo = await getRepo();
  const posts = await repo.listPosts();
  return routing.locales.flatMap((locale) => posts.map((p) => ({ locale, slug: p.slug })));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  const { locale, slug } = await params;
  const repo = await getRepo();
  const p = await repo.getPost(slug);
  return p ? { title: tx(p.title, locale), description: tx(p.excerpt, locale), openGraph: { type: "article", publishedTime: p.published_at } } : {};
}

export default async function PostPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();
  const loc = await getLocale();
  const repo = await getRepo();
  const [p, all] = await Promise.all([repo.getPost(slug), repo.listPosts()]);
  if (!p) notFound();
  const related = all.filter((x) => x.slug !== p.slug && x.tags.some((tg) => p.tags.includes(tg))).slice(0, 3);

  return (
    <>
      <ArticleJsonLd post={p} locale={loc} />
      <section className="relative overflow-hidden border-b border-border bg-surface">
        <div className="pointer-events-none absolute inset-0 bg-grid opacity-60 [mask-image:radial-gradient(70%_60%_at_50%_0%,black,transparent)]" />
        <div className="container-x relative max-w-4xl py-12 md:py-16">
          <nav className="mb-5 flex items-center gap-1.5 text-xs text-muted"><Link href="/" className="hover:text-brand-700">{t("nav.home")}</Link><span>/</span><Link href="/blog" className="hover:text-brand-700">{t("nav.blog")}</Link></nav>
          <div className="flex flex-wrap gap-1.5">{p.tags.map((tag) => <Badge key={tag} variant="brand" className="font-en">{tag}</Badge>)}</div>
          <h1 className="mt-4 text-3xl font-extrabold leading-tight tracking-tight text-brand-950 md:text-5xl">{tx(p.title, loc)}</h1>
          <p className="mt-4 text-base leading-8 text-muted md:text-lg">{tx(p.excerpt, loc)}</p>
          <p className="mt-5 flex flex-wrap items-center gap-4 text-xs text-muted"><span className="inline-flex items-center gap-1"><CalendarDays className="size-3.5" />{formatDate(p.published_at, loc)}</span><span className="inline-flex items-center gap-1"><Clock className="size-3.5" />{t("blog.readingTime", { minutes: p.reading_minutes ?? 5 })}</span><span>{p.author}</span></p>
        </div>
      </section>
      <article className="container-x max-w-4xl py-12"><Markdown>{tx(p.body, loc)}</Markdown></article>
      {related.length > 0 && (
        <section className="container-x max-w-4xl pb-8">
          <h2 className="mb-4 text-xl font-bold">{t("blog.related")}</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {related.map((r) => <Link key={r.id} href={`/blog/${r.slug}`} className="card p-5 text-sm font-semibold transition-colors hover:border-brand-300 hover:text-brand-800">{tx(r.title, loc)}</Link>)}
          </div>
        </section>
      )}
      <CtaBanner compact />
    </>
  );
}
