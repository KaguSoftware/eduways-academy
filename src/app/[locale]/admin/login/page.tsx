import { Suspense } from "react";
import { redirect } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { getStaff } from "@/lib/admin/auth";
import { LoginForm } from "@/components/admin/login-form";

export const metadata = { title: "Admin login", robots: { index: false } };

export default async function AdminLoginPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const staff = await getStaff();
  if (staff) redirect(`${locale === "fa" ? "" : `/${locale}`}/admin`);
  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <Suspense><LoginForm /></Suspense>
    </div>
  );
}
