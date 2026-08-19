import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { WhatsAppFab } from "@/components/layout/whatsapp-fab";
import { CompareProvider } from "@/components/university/compare-context";
import { CompareBar } from "@/components/university/compare-bar";
import { getRepo } from "@/lib/repo";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const repo = await getRepo();
  const settings = await repo.getSettings();
  return (
    <CompareProvider>
      <Header />
      <main className="flex-1">{children}</main>
      <Footer settings={settings} />
      <CompareBar />
      <WhatsAppFab number={settings.whatsapp_number} />
    </CompareProvider>
  );
}
