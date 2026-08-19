import type { SiteSettings, UniversityWithRelations, Faq, Post } from "@/lib/types";
import { siteUrl, tx } from "@/lib/utils";

function JsonLd({ data }: { data: Record<string, unknown> }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

export function OrganizationJsonLd({ settings }: { settings: SiteSettings }) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "EducationalOrganization",
        name: "Eduways Academy",
        url: siteUrl,
        logo: `${siteUrl}/brand/logo.jpg`,
        sameAs: [settings.instagram_url],
        address: { "@type": "PostalAddress", addressLocality: "Istanbul", addressCountry: "TR" },
        contactPoint: [{ "@type": "ContactPoint", telephone: `+${settings.whatsapp_number}`, contactType: "customer service", availableLanguage: ["fa", "en", "tr"] }],
      }}
    />
  );
}

export function UniversityJsonLd({ u, locale }: { u: UniversityWithRelations; locale: string }) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "CollegeOrUniversity",
        name: tx(u.name, locale),
        url: u.website,
        foundingDate: String(u.founded),
        address: { "@type": "PostalAddress", addressLocality: u.district ? tx(u.district.name, "en") : "Istanbul", addressRegion: "Istanbul", addressCountry: "TR" },
        geo: { "@type": "GeoCoordinates", latitude: u.lat, longitude: u.lng },
        description: tx(u.description, locale),
      }}
    />
  );
}

export function FaqJsonLd({ faqs, locale }: { faqs: Faq[]; locale: string }) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faqs.map((f) => ({ "@type": "Question", name: tx(f.question, locale), acceptedAnswer: { "@type": "Answer", text: tx(f.answer, locale) } })),
      }}
    />
  );
}

export function ArticleJsonLd({ post, locale }: { post: Post; locale: string }) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "Article",
        headline: tx(post.title, locale),
        description: tx(post.excerpt, locale),
        datePublished: post.published_at,
        author: { "@type": "Organization", name: post.author || "Eduways Academy" },
        publisher: { "@type": "Organization", name: "Eduways Academy", logo: { "@type": "ImageObject", url: `${siteUrl}/brand/logo.jpg` } },
      }}
    />
  );
}

export function BreadcrumbJsonLd({ items }: { items: { name: string; url: string }[] }) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: items.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.name, item: `${siteUrl}${it.url}` })),
      }}
    />
  );
}
