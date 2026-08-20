# Eduways Academy — Handoff

> Read this first when starting a fresh chat. Companions: `CLAUDE.md` (Next.js 16 agent rules), `supabase/migrations/20260819000001_init.sql`, `src/lib/admin/specs.ts`.

## Working style
- **Collaborate**: propose with a recommendation before locking user-facing decisions; owner (Parsa) approves direction in plan mode.
- **Git**: commits authored only by Parsa — **no AI `Co-Authored-By` trailer**. Remote: `https://github.com/KaguSoftware/eduways-academy.git` (branch `main`). Push when a verified chunk is done.
- **HARD RULE — zero native/OS-default UI**: every select, combobox, date/time picker, calendar, scrollbar, checkbox, radio, switch, slider, number input, file input, tooltip, dialog, toast, pagination must be a branded component from `src/components/ui/` (Radix via `radix-ui` + `react-day-picker`). Never `<select>`, never `<input type="date|time|number|range|file">` rendered natively, no default browser scrollbars (global CSS overrides them).
- **Frontend bar**: must visibly beat competitors rasastudy.com and edu.epid.co (Persian-only, program search, chatbot, no rankings/calculator/maps). Design: clean, premium, white + brand blue/cyan, Vazirmatn (fa) / Inter (en), motion reveals.
- Keep this file honest; absolute dates; mark untested things as untested.

## What this is
Bilingual (Persian RTL default, English under `/en`) marketing + catalogue site for **Eduways Academy**, an Istanbul study-abroad agency for Persian speakers. Every Istanbul university has a page (overview, programs, admission documents, discounts/scholarships, rankings, map), plus program search, rankings (official + value score), district guides with map, services, cost calculator, success stories, guides/blog, FAQ, and a consultation/lead funnel to WhatsApp. Staff edit content in `/admin`.

## Stack & environment (as of 2026-08-19)
- Next.js **16.3.1** (App Router, Turbopack, `proxy.ts` instead of middleware, `cacheComponents` OFF — classic ISR `revalidate = 3600`), React 19, TypeScript, Tailwind v4 (`@theme` tokens in `src/app/globals.css`), `next-intl` 4.13 (`localePrefix: "as-needed"`, `fa` default unprefixed), `radix-ui` meta-package, `motion`, `cmdk`, `react-day-picker` 10 + `date-fns-jalali` (Jalali calendar), `react-leaflet` 5 (OSM/Carto tiles, free), `react-markdown`, `zod` + `react-hook-form`.
- Supabase project ref `sofdxhwidezsugjnuhfj` (linked via `npx supabase link`; CLI 2.115 via npx; **Docker not installed** → no local DB; migrations pushed with `npx supabase db push --linked`). Env in `.env.local` (gitignored; template `.env.example`): `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` (server only), `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_WHATSAPP_NUMBER`, `NEXT_PUBLIC_INSTAGRAM_URL`. `scripts/write-env.mjs` regenerates `.env.local` from the linked project without printing secrets.
- Deploy target: Vercel (not yet connected). Dev OS: Windows 11, npm (no pnpm), Node 24.

## Conventions
- Data access only through `getRepo()` (`src/lib/repo/index.ts`): `supabaseRepo` when env vars exist, else `seedRepo` (reads `src/data/seed/*.ts`). Both share hydration/filter code (`compute.ts`, `seed.ts`), so behaviour is identical. Public reads use the cookie-less anon client (`lib/supabase/public.ts`) so `generateStaticParams` works; `loadCore()` is memoised 60s.
- All translatable DB text is JSONB `{fa, en}` (`I18nText`); render with `tx(value, locale)`. Numbers via `formatNumber/formatUSD/formatRange` (Persian digits in fa). Dates via `formatDate` (Jalali in fa).
- UI strings live in `src/messages/{fa,en}.json` (namespaces: nav, common, home, universities, programs, rankings, districts, services, calculator, stories, blog, about, contact, consultation, faq, footer, errors, form, admin).
- Routes live under `src/app/[locale]/(site)/…` (public, with Header/Footer) and `src/app/[locale]/admin/…` (own shell). Root html/body in `src/app/[locale]/layout.tsx` (sets `dir`, fonts, Radix `DirectionProvider`). Unknown paths → `[locale]/[...rest]` → localized 404.
- Use logical CSS (`ms/me/ps/pe/start/end`), `rtl:`/`ltr:` variants for icon mirroring. Client components that animate use `motion/react` `whileInView` (`<Reveal>`).
- Admin tables are spec-driven: add/adjust fields in `src/lib/admin/specs.ts` (bilingual labels, sections, types) — list + edit pages render from it; writes go through server actions in `src/lib/admin/actions.ts` (service role, staff check, `revalidatePath("/", "layout")`).
- Seed data is the source of truth for first content: edit `src/data/seed/*.ts`, then `npx tsx scripts/seed.ts` (writes `supabase/seed.sql` **and** upserts into the linked project). Re-running is idempotent (upsert on id).

## Current status (2026-08-19)
**Done & verified (prod build passes, 283 static pages; smoke-tested with curl + Playwright screenshots in fa/en, desktop/mobile):**
- Public site: home (+ the site-wide graduation trail: cap rides an SVG path down every page and lands on the student in the footer; "Graduate" throws it and scrolls back to top — verified with Playwright on desktop/mobile, fa/en, incl. dialog scroll-lock, accordion height change, client navigation, reduced motion), universities list (client filters, URL-synced, compare), university detail (tabs: overview/programs/documents/scholarships/rankings/location with Leaflet map), compare (≤3), programs search (680 programs), rankings (overview, best-value, cheapest, english-taught, public, private, per-field), districts (map) + detail, services + detail, cost calculator, stories + detail, blog + markdown posts, about, contact, consultation form (zod → `/api/leads` → Supabase `leads` + WhatsApp deep link; honeypot + IP rate limit), FAQ (JSON-LD), privacy/terms, sitemap, robots, ⌘K command search (`/api/search`), sticky WhatsApp FAB, locale switcher, JSON-LD (Organization, CollegeOrUniversity, FAQ, Article, Breadcrumb), hreflang alternates.
- DB: migration applied to the linked project; **seed pushed: 14 categories, 27 districts, 52 universities, 680 programs, 156 requirement sets, 52 scholarships, 84 rankings, 8 services, 6 stories, 6 posts, 12 FAQs, settings.** RLS: public read of published content, leads insert-only for anon, staff (profiles row) read/write; `media` storage bucket public-read/staff-write. Trigger auto-creates `profiles` (role `editor`) on signup.
- Admin (`/admin`): Supabase email+password login, sidebar with active state, dashboard, leads (status select, CSV export, WhatsApp link), spec-driven CRUD for universities/programs/scholarships/rankings/districts/services/stories/posts/faqs/settings with bilingual fa/en tab inputs, Jalali date picker, delete confirm (admin role only), "view on site" link. Playwright run-through: all admin routes 200, no console errors, save + create + delete flows worked.
- Owner already created their own admin account (2 profiles existed on 2026-08-19). Promote/demote with `node scripts/make-admin.mjs <email> [admin|editor]`.

**Untested / not done:** Vercel deploy; real WhatsApp number/Instagram embed; Lighthouse pass; image uploads in admin (URLs only for now); Turkish locale.

## File map (key files)
- `src/proxy.ts` — next-intl routing + admin cookie gate (matcher excludes `api|_next|_vercel|files with a dot`).
- `src/i18n/{routing,request,navigation}.ts` — locales `fa`(default, no prefix) / `en`.
- `src/app/[locale]/layout.tsx` — html/body, fonts, providers. `(site)/layout.tsx` — Header/Footer/CompareBar/WhatsApp.
- `src/lib/types.ts` — domain types. `src/lib/utils.ts` — `tx`, number/date formatters, `whatsappLink`, `siteUrl`.
- `src/lib/repo/*` — data layer (see Conventions). `src/lib/supabase/{env,client,server,public,admin}.ts`.
- `src/data/seed/*.ts` — all seed content (universities, programs, requirements, scholarships+rankings, districts, categories, content=services/stories/posts/faqs/settings).
- `src/components/ui/primitives.tsx` — the branded control kit (Select, Checkbox, Radio, Segmented, Switch, Slider, NumberStepper, Tabs, Accordion, Dialog, Popover, Tooltip, ScrollArea, Badge, Input…); `ui/date-picker.tsx` (Jalali/Gregorian DatePicker + TimePicker); `ui/button.tsx`.
- `src/components/layout/*` — header (+ command-search), footer, page helpers (`PageHeader`, `SectionHeader`, `CtaBanner`), WhatsApp FAB, locale switcher.
- `src/components/grad-trail/*` — site-wide "graduation trail": `grad-trail.tsx` (overlay: SVG trail + cap riding it with scroll, the Graduate throw tween, all re-measure logic), `trail-geometry.ts` (pure path builder/sampler — unit-testable with tsx), `graduation-stage.tsx` (student figure + Graduate button in the footer), `grad-trail-context.tsx` (pose + throw handoff). Mounted in `(site)/layout.tsx` inside the `.site-shell` wrapper; assets in `public/assets/{grad-hat,student-before-throw,student-after-throw}.svg`.
- `src/components/university/*` — card, explorer (filters), detail tabs, compare context/bar/view/toggle. `components/programs/program-explorer.tsx`, `components/rankings/ranking-table.tsx`, `components/tools/cost-calculator.tsx`, `components/map/*` (Leaflet, dynamic import), `components/forms/consultation-form.tsx`, `components/home/*`, `components/seo/json-ld.tsx`.
- `src/lib/admin/{auth,specs,actions,data}.ts` + `src/components/admin/*` + `src/app/[locale]/admin/*` — admin panel.
- `supabase/migrations/20260819000001_init.sql` — schema/RLS; `supabase/seed.sql` — generated.
- `scripts/seed.ts` (sql|push), `scripts/write-env.mjs`, `scripts/make-admin.mjs`, `scripts/db.mjs` (ad-hoc count/delete), `scripts/shots.mjs` + `scripts/qa-admin.mjs` (Playwright screenshot/QA runs against `npm run start -- -p 3101`), `scripts/qa-trail.mjs <outDir> [baseUrl]` (graduation-trail QA sweep: layering contract, ride/landing desktop+mobile fa/en, dialog/menu scroll-lock, accordion, navigation, Graduate throw, reduced motion).

## Roadmap / next steps
1. **Deploy to Vercel** (env vars from `.env.local` minus nothing; set `NEXT_PUBLIC_SITE_URL` to the real domain) and set the real `NEXT_PUBLIC_WHATSAPP_NUMBER` + office address in `site_settings`. ← **active**
2. Content verification by Eduways staff: tuition figures, discounts, rankings, document lists were seeded from public knowledge and marked indicative — verify before marketing. Add logos/cover images (upload to `media` bucket, paste URLs) and real student photos/names for stories.
3. Polish pass with `/impeccable` (Lighthouse ≥95, a11y audit, Persian typography review), OG image generation per university.
4. Admin: image upload widget (Supabase Storage), markdown preview, rich editor for `admission_requirements` (currently only via seed), Telegram/email lead notifications.
5. Deepen programs per university (currently ~13 each), add remaining Istanbul universities' detail (highlights), Turkish locale.

## Deliberately partial — grows later (scope ledger)
| Area | What shipped now | Intended full shape | Grows in |
|---|---|---|---|
| Locales | fa, en | + tr | later |
| Universities | 52 Istanbul unis, 6 featured deep | all Istanbul deep + other cities (schema is Turkey-wide via `city`) | phase 7 |
| Admission requirements | per-uni, generated template per level | uni-specific lists edited in admin | needs admin editor |
| Lead notifications | DB + WhatsApp deep link | Telegram bot, email (Resend) | later |
| Admin media | URL fields only | Storage upload | later |
| Student portal | none | application tracker | later |
| Rankings | stored URAP/THE/QS (approx) + editorial + value score | yearly verified import | yearly |
| Privacy/terms | placeholder paragraphs | lawyer-reviewed text | before launch |

## Gotchas / open issues
- **Graduation trail layering contract** (`globals.css` → "Graduation trail"): `.site-shell` is an isolated stacking context; the trail/cap layer is `z-index: 1`; every `.container-x` inside `<main>`/`<footer>` is lifted to `position: relative; z-index: 2` (cards/text above the cap), while section backgrounds (non-positioned blocks or `relative` wrappers with z-index auto) stay below it. Consequences: put page content inside a `.container-x` (or lift it with `relative z-[2]`, as TrustMarquee does); keep backgrounds on the section itself or on z-auto wrappers; never give a background a positive z-index (the old marquee edge fades were replaced by a CSS mask for this reason); never set `overflow: hidden` on `.site-shell` (sticky bars). The student figure deliberately sits *outside* the footer's `.container-x` so the cap lands on top of the head.
- `<html data-scroll-behavior="smooth">` (root layout) is required with `html { scroll-behavior: smooth }` on Next 16 — without it every client navigation *animates* the scroll to top under the new page (Next warns `missing-data-scroll-behavior`); the trail relies on navigations landing at the top instantly.
- Known pre-existing: under `prefers-reduced-motion: reduce` the hero `Counter` hydrates with a text mismatch (server renders `0`, client renders the final number) — surfaces as a React hydration error in dev; unrelated to the trail.
- **Bash heredocs in this Windows/Git-Bash setup eat single backslashes and break on unbalanced `'`** — use the Write tool for files with regexes/apostrophes (caused the proxy matcher bug once).
- Persian digits: pass through `formatNumber`; Vazirmatn renders `۰` like a dot at small sizes — fine.
- `loadCore()` fetches 6 tables per request in Supabase mode (memoised 60s per instance) — fine at this size; switch to per-slug queries if data grows 10×.
- `revalidatePath("/", "layout")` after admin saves; public pages otherwise ISR 1h.
- Motion `whileInView` sections render transparent until scrolled into view — OK for users/crawlers, but full-page screenshots need scrolling (`scripts/shots.mjs` does it).
- Playwright + chromium installed as devDependency for QA only (not used in build).
- Verified 2026-08-19: Supabase API keys present (legacy anon/service_role and new publishable/secret); `.env.local` uses the legacy anon + service_role. Storage bucket `media` created by migration. Not verified: Auth email settings (confirmations), SMTP.

## Running it
```bash
npm install
npm run dev                # http://localhost:3000 (fa) / /en
npm run build && npm run start -- -p 3101
npx tsc --noEmit           # type-check
npx tsx scripts/seed.ts    # regenerate supabase/seed.sql + upsert to linked project
npx supabase db push --linked   # apply new migrations
node scripts/make-admin.mjs you@example.com admin
node scripts/shots.mjs <outDir>  # screenshot sweep (server on :3101)
```
