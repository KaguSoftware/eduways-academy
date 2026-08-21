"use client";

import * as React from "react";
import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { Search, ChevronDown, Speech, ArrowRight } from "lucide-react";
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
  const [menuOpen, setMenuOpen] = React.useState(false);

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

  React.useEffect(() => setMenuOpen(false), [pathname]);

  // The panel owns the viewport while open; stop the page behind it from scrolling.
  React.useEffect(() => {
    if (!menuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [menuOpen]);

  React.useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenuOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <header className={cn("sticky top-0 z-50 w-full transition-all duration-300", scrolled || menuOpen ? "glass border-b border-border/70 shadow-sm" : "bg-transparent")}>
      <div className="container-x relative z-10 flex h-16 items-center justify-between gap-4 md:h-[4.5rem]">
        <Link href="/" className="flex shrink-0 items-center gap-2.5 focus-ring rounded-full" aria-label="Eduways Academy">
          <Image src="/brand/logo.jpg" alt="Eduways Academy" width={40} height={40} className="size-10 rounded-full shadow-sm" priority />
          <span className="flex min-w-0 flex-col leading-none">
            <span className="truncate text-[15px] font-extrabold tracking-tight text-brand-900">EDUWAYS</span>
            <span className="hidden text-[10px] font-medium uppercase tracking-[0.18em] text-muted sm:block">Academy · Istanbul</span>
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
            <Link href="/consultation" className="rtl:flex-row-reverse">
              <Speech className="size-4" />
              {t("consultation")}
            </Link>
          </Button>
          <MobileMenuButton open={menuOpen} onToggle={() => setMenuOpen((o) => !o)} label={t("menu")} />
        </div>
      </div>
      <MobilePanel open={menuOpen} onNavigate={() => setMenuOpen(false)} isActive={isActive} />
      <CommandSearch open={searchOpen} onOpenChange={setSearchOpen} locale={locale} />
    </header>
  );
}

function MobileMenuButton({ open, onToggle, label }: { open: boolean; onToggle: () => void; label: string }) {
  return (
    <Button variant="ghost" size="icon" className="lg:hidden" aria-label={label} aria-expanded={open} onClick={onToggle}>
      {/* Three bars that morph into an X: the outer two rotate onto the centre line,
          the middle one fades. Driven by `open` so it animates both ways. */}
      <span className="relative block size-5" aria-hidden>
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className={cn(
              "absolute inset-x-0 mx-auto block h-0.5 w-5 rounded-full bg-current transition-all duration-300 ease-out",
              i === 0 && (open ? "top-1/2 -translate-y-1/2 rotate-45" : "top-1"),
              i === 1 && (open ? "top-1/2 -translate-y-1/2 opacity-0" : "top-1/2 -translate-y-1/2 opacity-100"),
              i === 2 && (open ? "top-1/2 -translate-y-1/2 -rotate-45" : "bottom-1 top-auto"),
            )}
          />
        ))}
      </span>
    </Button>
  );
}

/* Slides in from the right and fills everything below the header bar, which stays
   visible and interactive above it. */
function MobilePanel({ open, onNavigate, isActive }: { open: boolean; onNavigate: () => void; isActive: (href: string) => boolean }) {
  const t = useTranslations("nav");
  return (
    <div
      id="mobile-menu"
      aria-hidden={!open}
      className="fixed inset-x-0 bottom-0 top-16 z-40 bg-background md:top-[4.5rem] lg:hidden"
      style={{
        /* Physical transform, not a `translate-x-*` utility: Tailwind flips those under
           `dir="rtl"`, which would slide the panel in from the left in Persian. */
        transform: open ? "translateX(0)" : "translateX(100%)",
        /* Not `display:none` — that cannot animate. Visibility is delayed on close so the
           slide-out plays out first, then the panel drops out of hit-testing. */
        visibility: open ? "visible" : "hidden",
        transition: "transform 300ms ease-out, visibility 0s linear " + (open ? "0s" : "300ms"),
      }}
    >
      <div className="flex h-full flex-col">
        {/* Only the links scroll; the CTA below stays pinned to the bottom of the panel. */}
        <nav className="flex flex-1 flex-col overflow-y-auto overscroll-contain" aria-label="Mobile">
          {[...NAV, ...MORE].map((n) => {
            const active = isActive(n.href);
            return (
              <Link
                key={n.key}
                href={n.href}
                onClick={onNavigate}
                tabIndex={open ? undefined : -1}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "group flex items-center justify-between gap-4 border-b border-border/70 px-6 py-5 text-2xl font-bold tracking-tight transition-colors",
                  active ? "text-brand-700" : "text-foreground hover:text-brand-700",
                )}
              >
                <span>{t(n.key)}</span>
                {/* Points the way the reader travels: flipped in RTL. */}
                <ArrowRight className="size-5 shrink-0 text-muted transition-transform group-hover:translate-x-1 rtl:-scale-x-100 rtl:group-hover:-translate-x-1" />
              </Link>
            );
          })}
        </nav>
        <div className="shrink-0 border-t border-border bg-background ps-6 pt-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] pe-[5.5rem]">
          <Button asChild size="lg" className="w-full">
            <Link href="/consultation" onClick={onNavigate} tabIndex={open ? undefined : -1} className="rtl:flex-row-reverse">
              <Speech className="size-4" />
              {t("consultation")}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
