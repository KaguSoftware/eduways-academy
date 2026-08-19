"use client";

import * as React from "react";
import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { Menu, Search, ChevronDown, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger, Popover, PopoverContent, PopoverTrigger } from "@/components/ui/primitives";
import { LocaleSwitcher } from "./locale-switcher";
import { CommandSearch } from "./command-search";

const NAV = [
  { key: "universities", href: "/universities" },
  { key: "programs", href: "/programs" },
  { key: "rankings", href: "/rankings" },
  { key: "services", href: "/services" },
] as const;

const MORE = [
  { key: "districts", href: "/districts" },
  { key: "calculator", href: "/calculator" },
  { key: "compare", href: "/universities/compare" },
  { key: "stories", href: "/stories" },
  { key: "blog", href: "/blog" },
  { key: "faq", href: "/faq" },
  { key: "about", href: "/about" },
  { key: "contact", href: "/contact" },
] as const;

export function Header() {
  const t = useTranslations("nav");
  const locale = useLocale();
  const pathname = usePathname();
  const [scrolled, setScrolled] = React.useState(false);
  const [searchOpen, setSearchOpen] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <header className={cn("sticky top-0 z-50 w-full transition-all duration-300", scrolled ? "glass border-b border-border/70 shadow-sm" : "bg-transparent")}>
      <div className="container-x flex h-16 items-center justify-between gap-4 md:h-[4.5rem]">
        <Link href="/" className="flex shrink-0 items-center gap-2.5 focus-ring rounded-full" aria-label="Eduways Academy">
          <Image src="/brand/logo.jpg" alt="Eduways Academy" width={40} height={40} className="size-10 rounded-full shadow-sm" priority />
          <span className="hidden flex-col leading-none sm:flex">
            <span className="text-[15px] font-extrabold tracking-tight text-brand-900">EDUWAYS</span>
            <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted">Academy · Istanbul</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary">
          {NAV.map((n) => (
            <Link
              key={n.key}
              href={n.href}
              className={cn(
                "rounded-full px-3.5 py-2 text-sm font-medium transition-colors focus-ring",
                isActive(n.href) ? "bg-brand-50 text-brand-800" : "text-foreground/80 hover:bg-surface hover:text-foreground",
              )}
            >
              {t(n.key)}
            </Link>
          ))}
          <Popover>
            <PopoverTrigger asChild>
              <button className="inline-flex items-center gap-1 rounded-full px-3.5 py-2 text-sm font-medium text-foreground/80 transition-colors hover:bg-surface hover:text-foreground focus-ring data-[state=open]:bg-surface">
                {t("explore")} <ChevronDown className="size-4" />
              </button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-64 p-2">
              <ul className="grid">
                {MORE.map((m) => (
                  <li key={m.key}>
                    <Link href={m.href} className="block rounded-xl px-3 py-2 text-sm font-medium hover:bg-brand-50 hover:text-brand-800">
                      {t(m.key)}
                    </Link>
                  </li>
                ))}
              </ul>
            </PopoverContent>
          </Popover>
        </nav>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            onClick={() => setSearchOpen(true)}
            className="hidden h-10 items-center gap-2 rounded-full border border-border bg-background/70 px-3.5 text-sm text-muted transition-colors hover:border-brand-300 hover:text-foreground focus-ring md:inline-flex"
            aria-label={t("search")}
          >
            <Search className="size-4" />
            <span className="max-w-40 truncate">{t("search")}</span>
            <kbd className="ms-2 hidden rounded-md border border-border bg-surface px-1.5 py-0.5 font-en text-[10px] text-muted lg:inline">⌘K</kbd>
          </button>
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setSearchOpen(true)} aria-label={t("search")}>
            <Search />
          </Button>
          <LocaleSwitcher />
          <Button asChild size="md" className="hidden sm:inline-flex">
            <Link href="/consultation">
              <Sparkles className="size-4" />
              {t("consultation")}
            </Link>
          </Button>
          <MobileMenu />
        </div>
      </div>
      <CommandSearch open={searchOpen} onOpenChange={setSearchOpen} locale={locale} />
    </header>
  );
}

function MobileMenu() {
  const t = useTranslations("nav");
  const [open, setOpen] = React.useState(false);
  const pathname = usePathname();
  React.useEffect(() => setOpen(false), [pathname]);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden" aria-label={t("menu")}>
          <Menu />
        </Button>
      </DialogTrigger>
      <DialogContent side="end" heading={<span className="text-brand-900">EDUWAYS</span>} className="flex flex-col">
        <nav className="flex flex-col gap-1" aria-label="Mobile">
          {[...NAV, ...MORE].map((n) => (
            <Link key={n.key} href={n.href} className="rounded-xl px-3 py-2.5 text-base font-medium hover:bg-brand-50 hover:text-brand-800">
              {t(n.key)}
            </Link>
          ))}
        </nav>
        <Button asChild size="lg" className="mt-6">
          <Link href="/consultation">{t("consultation")}</Link>
        </Button>
      </DialogContent>
    </Dialog>
  );
}
