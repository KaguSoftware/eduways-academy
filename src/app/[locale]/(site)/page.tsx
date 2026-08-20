import { setRequestLocale } from "next-intl/server";
import { getRepo } from "@/lib/repo";
import { Hero } from "@/components/home/hero";
import { CtaBanner } from "@/components/layout/page";
import {
  TrustMarquee, WhySection, FeaturedUniversities, ProcessSection, RankingsPreview, ServicesSection, StoriesSection, DistrictsSection, BlogSection, FaqSection, InstagramSection,
} from "@/components/home/sections";
import { OrganizationJsonLd } from "@/components/seo/json-ld";

export const revalidate = 3600;

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const repo = await getRepo();
  const [settings, universities, services, stories, districts, posts, faqs] = await Promise.all([
    repo.getSettings(),
    repo.listUniversities(),
    repo.listServices(),
    repo.listStories(),
    repo.listDistricts(),
    repo.listPosts(),
    repo.listFaqs(),
  ]);

  const featured = universities.filter((u) => u.is_featured).slice(0, 6);
  const top = [...universities].filter((u) => u.best_rank).sort((a, b) => (a.best_rank ?? 999) - (b.best_rank ?? 999)).slice(0, 5);
  const bestValue = [...universities].sort((a, b) => (b.value_score ?? 0) - (a.value_score ?? 0)).slice(0, 5);
  const counts = universities.reduce<Record<string, number>>((acc, u) => ((acc[u.district_id] = (acc[u.district_id] ?? 0) + 1), acc), {});
  const topDistricts = [...districts].sort((a, b) => (counts[b.id] ?? 0) - (counts[a.id] ?? 0)).slice(0, 8);

  return (
    <>
      <OrganizationJsonLd settings={settings} />
      {/* Hero + marquee span 80% of the viewport below the sticky header. */}
      <div className="flex min-h-[calc(80svh-3.2rem)] flex-col md:min-h-[calc(80svh-3.6rem)]">
        <Hero stats={settings.stats} />
        <TrustMarquee universities={universities.filter((u) => u.is_featured || u.editorial_score >= 80).slice(0, 14)} />
      </div>
      <WhySection />
      <FeaturedUniversities universities={featured} />
      <ProcessSection />
      <RankingsPreview top={top} bestValue={bestValue} />
      <ServicesSection services={services} />
      <StoriesSection stories={stories} />
      <DistrictsSection districts={topDistricts} counts={counts} />
      <BlogSection posts={posts} />
      <FaqSection faqs={faqs.slice(0, 6)} />
      <CtaBanner />
      <InstagramSection url={settings.instagram_url} />
    </>
  );
}
