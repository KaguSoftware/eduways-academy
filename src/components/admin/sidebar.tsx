"use client";

import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { LayoutDashboard, Inbox, GraduationCap, BookOpen, BadgePercent, Trophy, MapPin, Briefcase, Quote, Newspaper, HelpCircle, Settings, ExternalLink, Database } from "lucide-react";
import { cn } from "@/lib/utils";
import { ADMIN_NAV } from "@/lib/admin/specs";
import { SignOutButton } from "./sign-out";
import { LocaleSwitcher } from "@/components/layout/locale-switcher";

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  leads: Inbox, universities: GraduationCap, programs: BookOpen, scholarships: BadgePercent, rankings: Trophy, districts: MapPin, services: Briefcase, stories: Quote, posts: Newspaper, faqs: HelpCircle, site_settings: Settings,
};

export function AdminSidebar({ email, role, hasDb }: { email: string; role: string; hasDb: boolean }) {
  const t = useTranslations("admin");
  const locale = useLocale();
  const pathname = usePathname();
  const isActive = (href: string) => (href === "/admin" ? pathname === "/admin" : pathname.startsWith(href));
  const items = [{ key: "dashboard", href: "/admin", Icon: LayoutDashboard, label: t("dashboard") }, ...ADMIN_NAV.map((k) => ({ key: k, href: `/admin/${k}`, Icon: ICONS[k], label: t(k === "site_settings" ? "settings" : (k as never)) }))];

  return (
    <>
      <aside className="hidden w-64 shrink-0 flex-col border-e border-border bg-background lg:flex">
        <div className="flex items-center gap-3 border-b border-border px-5 py-4">
          <Image src="/brand/logo.jpg" alt="" width={36} height={36} className="size-9 rounded-full" />
          <div className="leading-tight"><p className="text-sm font-extrabold text-brand-900">EDUWAYS</p><p className="text-[10px] text-muted">{t("title")}</p></div>
        </div>
        <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
          {items.map(({ key, href, Icon, label }) => (
            <Link key={key} href={href as never} className={cn("flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors", isActive(href) ? "bg-brand-gradient text-white shadow-sm" : "text-foreground/80 hover:bg-brand-50 hover:text-brand-800")}>
              <Icon className="size-4" />{label}
            </Link>
          ))}
        </nav>
        <div className="space-y-2 border-t border-border p-4 text-xs text-muted">
          <p className="truncate"><span className="me-1">{t("signedInAs")}</span><span className="font-en font-semibold text-foreground" dir="ltr">{email}</span> · {role}</p>
          <p className="flex items-center gap-1.5"><Database className="size-3.5" />{t("dataSource")}: {hasDb ? "Supabase" : "seed"}</p>
          <div className="flex items-center justify-between gap-2 pt-1">
            <Link href="/" className="inline-flex items-center gap-1 hover:text-foreground"><ExternalLink className="size-3.5" />{t("backToSite")}</Link>
            <SignOutButton label={t("signOut")} />
          </div>
          <div className="pt-1"><LocaleSwitcher /></div>
        </div>
      </aside>
      <header className="flex items-center gap-2 overflow-x-auto border-b border-border bg-background px-3 py-2 scrollbar-none lg:hidden">
        {items.map(({ key, href, label }) => (
          <Link key={key} href={href as never} className={cn("shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold", isActive(href) ? "bg-brand-gradient text-white" : "bg-surface text-foreground/80")}>{label}</Link>
        ))}
        <span className="ms-auto shrink-0"><LocaleSwitcher /></span>
      </header>
      <span className="hidden">{locale}</span>
    </>
  );
}
