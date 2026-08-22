"use client";

import * as React from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocale, useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { CheckCircle2, Loader2, MessageCircle, Send, ShieldCheck } from "lucide-react";
import { leadSchema, type LeadInput } from "@/lib/lead-schema";
import { toEnglishDigits, whatsappLink } from "@/lib/utils";
import { useMoney } from "@/lib/money";
import { Field, Input, Textarea, Select, Segmented, Slider } from "@/components/ui/primitives";
import { Button } from "@/components/ui/button";

const COUNTRIES = ["IR", "AF", "TJ", "TR", "IQ", "AZ", "DE", "GB", "CA", "US", "AE", "OTHER"] as const;
const LEVELS = ["bachelor", "master", "phd", "associate"] as const;

export function ConsultationForm({ universityName }: { universityName?: string }) {
  const t = useTranslations();
  const locale = useLocale();
  const money = useMoney();
  const sp = useSearchParams();
  const [done, setDone] = React.useState<{ wa: string; name: string } | null>(null);
  const [serverError, setServerError] = React.useState<string | null>(null);

  const form = useForm<LeadInput>({
    resolver: zodResolver(leadSchema),
    defaultValues: { name: "", phone: "", email: "", country: "IR", interest_level: "bachelor", desired_major: "", budget_usd: 8000, message: universityName ? t("consultation.prefillUniversity", { name: universityName }) : "", website: "" },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    setServerError(null);
    const payload = { ...values, phone: toEnglishDigits(values.phone), source_page: typeof window !== "undefined" ? window.location.pathname + window.location.search : undefined, locale };
    try {
      const res = await fetch("/api/leads", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) });
      if (!res.ok) throw new Error(String(res.status));
      const level = t(`common.${values.interest_level ?? "bachelor"}` as never);
      const country = t(`consultation.countries.${values.country ?? "OTHER"}` as never);
      const msg = t("consultation.waPrefill", { name: values.name, level, major: values.desired_major || "—", budget: String(values.budget_usd ?? ""), country });
      const wa = whatsappLink(msg);
      setDone({ wa, name: values.name });
      setTimeout(() => window.open(wa, "_blank", "noopener"), 900);
    } catch {
      setServerError(t("consultation.errorGeneric"));
    }
  });

  const err = (k: keyof LeadInput) => (form.formState.errors[k] ? t(k === "email" ? "form.invalidEmail" : k === "phone" ? "form.invalidPhone" : "form.required") : undefined);

  return (
    <AnimatePresence mode="wait">
      {done ? (
        <motion.div key="done" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="card flex flex-col items-center gap-4 p-10 text-center">
          <span className="flex size-16 items-center justify-center rounded-full bg-success/10 text-success"><CheckCircle2 className="size-9" /></span>
          <h2 className="text-2xl font-extrabold">{t("consultation.successTitle", { name: done.name })}</h2>
          <p className="max-w-md text-sm leading-7 text-muted">{t("consultation.successBody")}</p>
          <Button asChild variant="whatsapp" size="lg"><a href={done.wa} target="_blank" rel="noopener"><MessageCircle className="size-5" />{t("consultation.openWhatsapp")}</a></Button>
        </motion.div>
      ) : (
        <motion.form key="form" onSubmit={onSubmit} noValidate className="card grid gap-5 p-6 md:p-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <input type="text" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden {...form.register("website")} />
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label={t("consultation.name")} required error={err("name")}>
              <Input {...form.register("name")} autoComplete="name" aria-invalid={!!form.formState.errors.name} />
            </Field>
            <Field label={t("consultation.phone")} required hint={t("consultation.phoneHint")} error={err("phone")}>
              <Input {...form.register("phone")} inputMode="tel" autoComplete="tel" dir="ltr" className="font-en text-start" placeholder="+98 912 000 0000" aria-invalid={!!form.formState.errors.phone} />
            </Field>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label={t("consultation.email")} error={err("email")}>
              <Input {...form.register("email")} type="email" inputMode="email" autoComplete="email" dir="ltr" className="font-en text-start" aria-invalid={!!form.formState.errors.email} />
            </Field>
            <Field label={t("consultation.country")}>
              <Controller control={form.control} name="country" render={({ field }) => <Select value={field.value} onValueChange={field.onChange} options={COUNTRIES.map((c) => ({ value: c, label: t(`consultation.countries.${c}`) }))} />} />
            </Field>
          </div>
          <Field label={t("consultation.level")}>
            <Controller control={form.control} name="interest_level" render={({ field }) => <Segmented value={field.value ?? "bachelor"} onChange={field.onChange} options={LEVELS.map((l) => ({ value: l, label: t(`common.${l}`) }))} className="w-full [&>button]:flex-1" />} />
          </Field>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label={t("consultation.major")}>
              <Input {...form.register("desired_major")} placeholder={t("programs.placeholder")} />
            </Field>
            <Field label={<span className="flex items-center justify-between"><span>{t("consultation.budget")}</span><Controller control={form.control} name="budget_usd" render={({ field }) => <span className="font-bold tabular text-brand-800">{money.usd(field.value ?? 0)}</span>} /></span>}>
              <Controller control={form.control} name="budget_usd" render={({ field }) => <div className="flex h-11 items-center"><Slider value={[field.value ?? 0]} onValueChange={([v]) => field.onChange(v)} min={1000} max={40000} step={500} /></div>} />
            </Field>
          </div>
          <Field label={t("consultation.message")}>
            <Textarea {...form.register("message")} />
          </Field>
          {serverError && <p className="rounded-xl bg-danger/10 px-4 py-3 text-sm font-medium text-danger">{serverError}</p>}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="flex items-center gap-1.5 text-xs text-muted"><ShieldCheck className="size-4 text-success" />{t("consultation.privacy")}</p>
            <Button type="submit" size="lg" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? <Loader2 className="size-5 animate-spin" /> : <Send className="size-5 rtl:-scale-x-100" />}
              {form.formState.isSubmitting ? t("consultation.submitting") : t("consultation.submit")}
            </Button>
          </div>
          {sp.get("university") && <input type="hidden" value={sp.get("university") ?? ""} readOnly />}
        </motion.form>
      )}
    </AnimatePresence>
  );
}
