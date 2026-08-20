import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { WhatsAppFab } from "@/components/layout/whatsapp-fab";
import { CompareProvider } from "@/components/university/compare-context";
import { CompareBar } from "@/components/university/compare-bar";
import { GradTrailProvider } from "@/components/grad-trail/grad-trail-context";
import { GradTrail } from "@/components/grad-trail/grad-trail";
import { getRepo } from "@/lib/repo";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const repo = await getRepo();
  const settings = await repo.getSettings();
  return (
    <CompareProvider>
      <GradTrailProvider>
        {/* `.site-shell` is the isolated stacking context the graduation trail lives in
            (see globals.css → "Graduation trail"). Keep Header/main/Footer as its direct
            children: the overlay measures them and the layering rule targets them. */}
        <div className="site-shell relative isolate flex flex-1 flex-col">
          <GradTrail />
          <Header />
          <main className="flex-1">{children}</main>
          <Footer settings={settings} />
        </div>
        <CompareBar />
        <WhatsAppFab number={settings.whatsapp_number} />
      </GradTrailProvider>
    </CompareProvider>
  );
}
