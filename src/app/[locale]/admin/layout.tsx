import { getTranslations, setRequestLocale } from "next-intl/server";
import { getStaff } from "@/lib/admin/auth";
import { hasSupabase } from "@/lib/supabase/env";
import { AdminSidebar } from "@/components/admin/sidebar";

export const metadata = { robots: { index: false, follow: false } };

export default async function AdminLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("admin");
  const staff = await getStaff();

  // Unauthenticated → only the login page is reachable (proxy + requireStaff enforce this); render without chrome.
  if (!staff) return <div className="min-h-screen bg-surface">{children}</div>;

  return (
    <div className="flex min-h-screen flex-col bg-surface lg:flex-row">
      <AdminSidebar email={staff.email} role={staff.role} hasDb={hasSupabase} />
      <div className="min-w-0 flex-1">
        {!hasSupabase && <p className="m-4 rounded-2xl border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-warning">{t("noDb")}</p>}
        <main className="mx-auto max-w-6xl p-4 pb-32 md:p-8 md:pb-32">{children}</main>
      </div>
    </div>
  );
}
