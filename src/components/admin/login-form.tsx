"use client";

import * as React from "react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { Loader2, LogIn } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Field, Input } from "@/components/ui/primitives";
import { Button } from "@/components/ui/button";

export function LoginForm() {
  const t = useTranslations("admin");
  const locale = useLocale();
  const sp = useSearchParams();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const sb = createClient();
    const { error } = await sb.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) return setError(t("loginError"));
    const next = sp.get("next");
    const target = next && next.startsWith("/") && !next.includes("/admin/login") ? next : `${locale === "fa" ? "" : `/${locale}`}/admin`;
    // Full navigation so the server sees the fresh auth cookies immediately.
    window.location.assign(target);
  };

  return (
    <form onSubmit={submit} className="card w-full max-w-sm space-y-5 p-8">
      <div className="flex flex-col items-center gap-2 text-center">
        <Image src="/brand/logo.jpg" alt="Eduways" width={56} height={56} className="size-14 rounded-full" />
        <h1 className="text-xl font-extrabold">{t("title")}</h1>
      </div>
      <Field label={t("email")}><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} dir="ltr" className="font-en" autoComplete="email" required /></Field>
      <Field label={t("password")} error={error}><Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} dir="ltr" className="font-en" autoComplete="current-password" required /></Field>
      <Button type="submit" className="w-full" disabled={loading}>{loading ? <Loader2 className="size-4 animate-spin" /> : <LogIn className="size-4" />}{t("signIn")}</Button>
    </form>
  );
}
