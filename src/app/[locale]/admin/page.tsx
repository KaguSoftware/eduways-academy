import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Inbox, GraduationCap, BookOpen, Quote, Newspaper, ArrowUpRight, BadgePercent, HelpCircle, Plus } from "lucide-react";
import { requireStaff } from "@/lib/admin/auth";
import { getRepo } from "@/lib/repo";
import { formatNumber, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/primitives";
import { Button } from "@/components/ui/button";
import { TABLES } from "@/lib/admin/specs";
import { tx } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminHome({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const staff = await requireStaff(locale);
  const t = await getTranslations("admin");
  const tc = await getTranslations("consultation");
  const repo = await getRepo();
  const [leads, unis, programs, stories, posts, scholarships, faqs] = await Promise.all([repo.listLeads(), repo.listUniversities(), repo.listPrograms(), repo.listStories(), repo.listPosts(), repo.listScholarships(), repo.listFaqs()]);
  const newLeads = leads.filter((l) => l.status === "new").length;
  const cards = [
    { href: "/admin/leads", icon: Inbox, label: t("leads"), value: leads.length, sub: newLeads ? `${formatNumber(newLeads, locale)} ${t("newLeads")}` : undefined, accent: true },
    { href: "/admin/universities", icon: GraduationCap, label: t("universities"), value: unis.length },
    { href: "/admin/programs", icon: BookOpen, label: t("programs"), value: programs.length },
    { href: "/admin/scholarships", icon: BadgePercent, label: t("scholarships"), value: scholarships.length },
    { href: "/admin/stories", icon: Quote, label: t("stories"), value: stories.length },
    { href: "/admin/posts", icon: Newspaper, label: t("posts"), value: posts.length },
    { href: "/admin/faqs", icon: HelpCircle, label: t("faqs"), value: faqs.length },
  ];
  const statusTone = (s?: string) => (s === "new" ? "accent" : s === "contacted" ? "brand" : "outline");
  const statusLabel = (s?: string) => (s === "new" ? t("statusNew") : s === "contacted" ? t("statusContacted") : t("statusClosed"));

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm text-muted">{t("welcome")}</p>
          <h1 className="text-2xl font-extrabold">{t("dashboard")}</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild size="sm" variant="secondary"><Link href="/admin/posts/new"><Plus className="size-4" />{t("newRecord", { name: tx(TABLES.posts.singular, locale) })}</Link></Button>
          <Button asChild size="sm" variant="secondary"><Link href="/admin/universities/new"><Plus className="size-4" />{t("newRecord", { name: tx(TABLES.universities.singular, locale) })}</Link></Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map(({ href, icon: Icon, label, value, sub, accent }) => (
          <Link key={href} href={href as never} className={`group card p-5 transition-all hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-md ${accent ? "bg-brand-gradient text-white border-transparent" : ""}`}>
            <div className="flex items-center justify-between">
              <span className={`flex size-10 items-center justify-center rounded-xl ${accent ? "bg-white/15" : "bg-brand-50 text-brand-700"}`}><Icon className="size-5" /></span>
              <ArrowUpRight className={`size-4 opacity-0 transition-opacity group-hover:opacity-100 rtl:-scale-x-100 ${accent ? "text-white" : "text-muted"}`} />
            </div>
            <p className="mt-4 text-3xl font-extrabold tabular">{formatNumber(value, locale)}</p>
            <p className={`text-sm ${accent ? "text-white/85" : "text-muted"}`}>{label}{sub ? ` · ${sub}` : ""}</p>
          </Link>
        ))}
      </div>

      <section className="card overflow-hidden">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="font-bold">{t("recentLeads")}</h2>
          <Link href="/admin/leads" className="text-xs font-semibold text-brand-700 hover:underline">{t("leads")} →</Link>
        </div>
        {leads.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-muted">{t("empty")}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-surface text-xs text-muted">
                <tr><th className="px-5 py-2.5 text-start font-semibold">{tc("name")}</th><th className="px-5 py-2.5 text-start font-semibold">{tc("phone")}</th><th className="px-5 py-2.5 text-start font-semibold">{tc("major")}</th><th className="px-5 py-2.5 text-start font-semibold">{t("status")}</th><th className="px-5 py-2.5 text-end font-semibold">{t("createdAt")}</th></tr>
              </thead>
              <tbody>
                {leads.slice(0, 8).map((l) => (
                  <tr key={l.id} className="border-t border-border">
                    <td className="px-5 py-3 font-semibold">{l.name}</td>
                    <td className="px-5 py-3 font-en" dir="ltr">{l.phone}</td>
                    <td className="px-5 py-3 text-muted">{l.desired_major ?? "—"}</td>
                    <td className="px-5 py-3"><Badge variant={statusTone(l.status)}>{statusLabel(l.status)}</Badge></td>
                    <td className="px-5 py-3 text-end text-xs text-muted">{l.created_at ? formatDate(l.created_at, locale) : ""}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
      <p className="text-xs text-muted">{t("signedInAs")} <span className="font-en" dir="ltr">{staff.email}</span> · {staff.role}</p>
    </div>
  );
}
