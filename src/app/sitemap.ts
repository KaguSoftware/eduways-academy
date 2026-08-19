import type { MetadataRoute } from "next";
import { getRepo } from "@/lib/repo";
import { siteUrl } from "@/lib/utils";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const repo = await getRepo();
  const [unis, districts, services, stories, posts, categories] = await Promise.all([
    repo.listUniversities(), repo.listDistricts(), repo.listServices(), repo.listStories(), repo.listPosts(), repo.listCategories(),
  ]);
  const staticPaths = ["", "/universities", "/universities/compare", "/programs", "/rankings", "/districts", "/services", "/calculator", "/stories", "/blog", "/about", "/contact", "/consultation", "/faq", "/privacy", "/terms"];
  const rankingPaths = ["overall", "best-value", "cheapest", "english-taught", "public", "private", ...categories.map((c) => `field-${c.slug}`)].map((k) => `/rankings/${k}`);
  const dynamicPaths = [
    ...unis.map((u) => `/universities/${u.slug}`),
    ...districts.map((d) => `/districts/${d.slug}`),
    ...services.map((s) => `/services/${s.slug}`),
    ...stories.map((s) => `/stories/${s.slug}`),
    ...posts.map((p) => `/blog/${p.slug}`),
  ];
  const all = [...staticPaths, ...rankingPaths, ...dynamicPaths];
  const now = new Date();
  return all.map((p) => ({
    url: `${siteUrl}${p || "/"}`,
    lastModified: now,
    changeFrequency: p.startsWith("/blog") ? "monthly" : "weekly",
    priority: p === "" ? 1 : p.startsWith("/universities/") ? 0.9 : 0.7,
    alternates: { languages: { fa: `${siteUrl}${p || "/"}`, en: `${siteUrl}/en${p}` } },
  }));
}
