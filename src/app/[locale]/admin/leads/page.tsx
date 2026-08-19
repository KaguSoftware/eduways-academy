import { getTranslations, setRequestLocale } from "next-intl/server";
import { requireStaff } from "@/lib/admin/auth";
import { getRepo } from "@/lib/repo";
import { LeadsTable } from "@/components/admin/leads-table";

export const metadata = { robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function AdminLeads({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requireStaff(locale);
  const t = await getTranslations("admin");
  const repo = await getRepo();
  const leads = await repo.listLeads();
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold">{t("leads")} <span className="text-base font-normal text-muted">({leads.length})</span></h1>
      <LeadsTable leads={leads} />
    </div>
  );
}
