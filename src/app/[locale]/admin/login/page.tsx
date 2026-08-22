import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getStaff } from "@/lib/admin/auth";
import { LoginForm } from "@/components/admin/login-form";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "admin" });
  return { title: t("loginTitle"), robots: { index: false } };
}

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
