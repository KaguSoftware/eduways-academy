"use client";

import * as React from "react";
import { Command } from "cmdk";
import { Dialog as RxDialog } from "radix-ui";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { GraduationCap, BookOpen, MapPin, Search, Loader2, ArrowRight, Calculator, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SearchHit {
  type: "university" | "program" | "district";
  title: string;
  subtitle?: string;
  href: string;
}

export function CommandSearch({ open, onOpenChange, locale }: { open: boolean; onOpenChange: (o: boolean) => void; locale: string }) {
  const t = useTranslations();
  const router = useRouter();
  const [query, setQuery] = React.useState("");
  const [hits, setHits] = React.useState<SearchHit[]>([]);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (!open) return;
    const q = query.trim();
    if (q.length < 2) {
      setHits([]);
      return;
    }
    const ctrl = new AbortController();
    const id = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}&locale=${locale}`, { signal: ctrl.signal });
        setHits(await res.json());
      } catch {
        /* aborted */
      } finally {
        setLoading(false);
      }
    }, 180);
    return () => {
      clearTimeout(id);
      ctrl.abort();
    };
  }, [query, open, locale]);

  const go = (href: string) => {
    onOpenChange(false);
    setQuery("");
    router.push(href as never);
  };

  const groups = {
    university: hits.filter((h) => h.type === "university"),
    program: hits.filter((h) => h.type === "program"),
    district: hits.filter((h) => h.type === "district"),
  };

  return (
    <RxDialog.Root open={open} onOpenChange={onOpenChange}>
      <RxDialog.Portal>
        <RxDialog.Overlay className="fixed inset-0 z-[90] bg-brand-950/40 backdrop-blur-sm data-[state=open]:animate-in data-[state=open]:fade-in" />
        <RxDialog.Content className="fixed start-1/2 top-[12vh] z-[95] w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 rtl:translate-x-1/2 overflow-hidden rounded-3xl border border-border bg-background shadow-lg focus:outline-none data-[state=open]:animate-in data-[state=open]:fade-in data-[state=open]:zoom-in-95">
          <RxDialog.Title className="sr-only">{t("nav.search")}</RxDialog.Title>
          <Command shouldFilter={false} label={t("nav.search")} className="flex flex-col">
            <div className="flex items-center gap-3 border-b border-border px-4">
              {loading ? <Loader2 className="size-5 animate-spin text-brand-600" /> : <Search className="size-5 text-muted" />}
              <Command.Input
                autoFocus
                value={query}
                onValueChange={setQuery}
                placeholder={t("home.searchPlaceholder")}
                className="h-14 flex-1 bg-transparent text-base outline-none placeholder:text-muted/70"
              />
              <kbd className="hidden rounded-md border border-border bg-surface px-1.5 py-0.5 font-en text-[10px] text-muted sm:inline">ESC</kbd>
            </div>
            <Command.List className="max-h-[60vh] overflow-y-auto p-2">
              {query.trim().length < 2 && (
                <Command.Group heading={<GroupHeading>{t("nav.tools")}</GroupHeading>}>
                  <Item icon={<GraduationCap />} title={t("nav.universities")} onSelect={() => go("/universities")} />
                  <Item icon={<BookOpen />} title={t("nav.programs")} onSelect={() => go("/programs")} />
                  <Item icon={<Trophy />} title={t("nav.rankings")} onSelect={() => go("/rankings")} />
                  <Item icon={<Calculator />} title={t("nav.calculator")} onSelect={() => go("/calculator")} />
                  <Item icon={<MapPin />} title={t("nav.districts")} onSelect={() => go("/districts")} />
                </Command.Group>
              )}
              {query.trim().length >= 2 && !loading && hits.length === 0 && (
                <Command.Empty className="px-4 py-10 text-center text-sm text-muted">{t("common.noResults")}</Command.Empty>
              )}
              {groups.university.length > 0 && (
                <Command.Group heading={<GroupHeading>{t("nav.universities")}</GroupHeading>}>
                  {groups.university.map((h) => <Item key={h.href} icon={<GraduationCap />} title={h.title} subtitle={h.subtitle} onSelect={() => go(h.href)} />)}
                </Command.Group>
              )}
              {groups.program.length > 0 && (
                <Command.Group heading={<GroupHeading>{t("nav.programs")}</GroupHeading>}>
                  {groups.program.map((h, i) => <Item key={h.href + i} icon={<BookOpen />} title={h.title} subtitle={h.subtitle} onSelect={() => go(h.href)} />)}
                </Command.Group>
              )}
              {groups.district.length > 0 && (
                <Command.Group heading={<GroupHeading>{t("nav.districts")}</GroupHeading>}>
                  {groups.district.map((h) => <Item key={h.href} icon={<MapPin />} title={h.title} subtitle={h.subtitle} onSelect={() => go(h.href)} />)}
                </Command.Group>
              )}
            </Command.List>
          </Command>
        </RxDialog.Content>
      </RxDialog.Portal>
    </RxDialog.Root>
  );
}

function GroupHeading({ children }: { children: React.ReactNode }) {
  return <div className="px-3 pb-1 pt-3 text-[11px] font-semibold uppercase tracking-wider text-muted">{children}</div>;
}

function Item({ icon, title, subtitle, onSelect }: { icon: React.ReactNode; title: string; subtitle?: string; onSelect: () => void }) {
  return (
    <Command.Item
      value={title + (subtitle ?? "")}
      onSelect={onSelect}
      className={cn("group flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm outline-none data-[selected=true]:bg-brand-50 data-[selected=true]:text-brand-900")}
    >
      <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-surface text-brand-700 group-data-[selected=true]:bg-white [&_svg]:size-4">{icon}</span>
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="truncate font-medium">{title}</span>
        {subtitle && <span className="truncate text-xs text-muted">{subtitle}</span>}
      </span>
      <ArrowRight className="size-4 text-muted opacity-0 transition-opacity group-data-[selected=true]:opacity-100 rtl:rotate-180" />
    </Command.Item>
  );
}
