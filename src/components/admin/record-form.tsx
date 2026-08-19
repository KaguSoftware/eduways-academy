"use client";

import * as React from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Loader2, Save, Trash2, CheckCircle2, AlertCircle } from "lucide-react";
import type { FieldSpec, TableSpec } from "@/lib/admin/specs";
import { SECTION_LABELS } from "@/lib/admin/specs";
import { saveRecord, deleteRecord } from "@/lib/admin/actions";
import { cn, tx, toEnglishDigits } from "@/lib/utils";
import { Field, Input, Textarea, Select, Switch, Tabs, TabsList, TabsTrigger, TabsContent, Dialog, DialogContent, DialogTrigger, inputClass } from "@/components/ui/primitives";
import { DatePicker } from "@/components/ui/date-picker";
import { Button } from "@/components/ui/button";

type Row = Record<string, unknown>;
const SECTIONS = ["basic", "content", "numbers", "meta"] as const;

export function RecordForm({ table, spec, initial, isNew, canDelete, readOnly }: { table: string; spec: TableSpec; initial: Row; isNew: boolean; canDelete: boolean; readOnly: boolean }) {
  const t = useTranslations("admin");
  const locale = useLocale();
  const router = useRouter();
  const [row, setRow] = React.useState<Row>(initial);
  const [saving, setSaving] = React.useState(false);
  const [msg, setMsg] = React.useState<{ ok: boolean; text: string } | null>(null);
  const [dirty, setDirty] = React.useState(false);
  const set = (k: string, v: unknown) => { setRow((r) => ({ ...r, [k]: v })); setDirty(true); setMsg(null); };

  // Auto-suggest id from slug on create
  React.useEffect(() => {
    if (!isNew || !spec.idPrefix) return;
    const slug = row.slug;
    if (typeof slug === "string" && slug && (!row[spec.idField] || String(row[spec.idField]).startsWith(spec.idPrefix))) setRow((r) => ({ ...r, [spec.idField]: `${spec.idPrefix}${slug}` }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [row.slug]);

  const missing = spec.fields.filter((f) => f.required && (row[f.key] === null || row[f.key] === undefined || row[f.key] === "" || (f.type === "i18n" && !((row[f.key] as Record<string, string>)?.fa || (row[f.key] as Record<string, string>)?.en))));

  const save = async () => {
    if (missing.length) { setMsg({ ok: false, text: `${t("error")}: ${missing.map((f) => tx(f.label, locale)).join("، ")}` }); return; }
    setSaving(true);
    setMsg(null);
    const res = await saveRecord(table, row);
    setSaving(false);
    if (res.ok) {
      setMsg({ ok: true, text: t("saved") });
      setDirty(false);
      if (isNew) router.push(`/admin/${table}/${encodeURIComponent(String(row[spec.idField]))}`);
      router.refresh();
    } else setMsg({ ok: false, text: `${t("error")}: ${res.error}` });
  };
  const del = async () => {
    const res = await deleteRecord(table, String(row[spec.idField]));
    if (res.ok) router.push(`/admin/${table}`);
    else setMsg({ ok: false, text: `${t("error")}: ${res.error}` });
  };

  return (
    <div className="space-y-8">
      {SECTIONS.map((section) => {
        const fields = spec.fields.filter((f) => (f.section ?? "basic") === section);
        if (!fields.length) return null;
        return (
          <section key={section} className="card p-5 md:p-6">
            <h2 className="mb-5 text-sm font-bold uppercase tracking-wide text-brand-800">{tx(SECTION_LABELS[section], locale)}</h2>
            <div className="grid gap-5 md:grid-cols-2">
              {fields.map((f) => (
                <div key={f.key} className={cn(["i18n-long", "i18n-md", "json"].includes(f.type) && "md:col-span-2")}>
                  <FieldControl f={f} value={row[f.key]} onChange={(v) => set(f.key, v)} disabled={readOnly || (f.readOnly && !isNew) || (f.key === spec.idField && !isNew)} locale={locale} />
                </div>
              ))}
            </div>
          </section>
        );
      })}

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/90 backdrop-blur lg:start-64">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-4 py-3 md:px-8">
          <Button onClick={save} disabled={saving || readOnly}>{saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}{saving ? t("saving") : t("save")}</Button>
          {!isNew && canDelete && !readOnly && (
            <Dialog>
              <DialogTrigger asChild><Button variant="outline" className="text-danger hover:border-danger/40"><Trash2 className="size-4" />{t("delete")}</Button></DialogTrigger>
              <DialogContent heading={t("deleteTitle")} description={t("deleteBody")}>
                <div className="flex justify-end gap-2"><Button variant="danger" onClick={del}><Trash2 className="size-4" />{t("delete")}</Button></div>
              </DialogContent>
            </Dialog>
          )}
          {msg ? (
            <p className={cn("flex items-center gap-1.5 text-sm font-medium", msg.ok ? "text-success" : "text-danger")}>{msg.ok ? <CheckCircle2 className="size-4" /> : <AlertCircle className="size-4" />}{msg.text}</p>
          ) : dirty ? <p className="text-xs text-muted">•</p> : null}
          {readOnly && <p className="text-xs text-muted">{t("readOnly")}</p>}
        </div>
      </div>
    </div>
  );
}

/* ───────────── controls ───────────── */

function NumberInput({ value, onChange, disabled, placeholder }: { value: unknown; onChange: (v: number | null) => void; disabled?: boolean; placeholder?: string }) {
  const [text, setText] = React.useState(value === null || value === undefined ? "" : String(value));
  React.useEffect(() => { setText(value === null || value === undefined ? "" : String(value)); }, [value]);
  return (
    <input
      inputMode="decimal"
      dir="ltr"
      className={cn(inputClass, "font-en tabular text-start")}
      value={text}
      placeholder={placeholder}
      disabled={disabled}
      onChange={(e) => {
        const raw = toEnglishDigits(e.target.value).replace(/[^\d.\-]/g, "");
        setText(raw);
        if (raw === "" || raw === "-" || raw === ".") onChange(null);
        else { const n = Number(raw); if (!Number.isNaN(n)) onChange(n); }
      }}
    />
  );
}

function I18nInput({ value, onChange, long, disabled }: { value: unknown; onChange: (v: unknown) => void; long?: "long" | "md"; disabled?: boolean }) {
  const v = (value && typeof value === "object" ? value : { fa: "", en: "" }) as Record<string, string>;
  const setLang = (lang: string, s: string) => onChange({ ...v, [lang]: s });
  const filled = (lang: string) => Boolean(v[lang]?.trim());
  return (
    <Tabs defaultValue="fa">
      <TabsList className="mb-2 inline-flex">
        {(["fa", "en"] as const).map((lang) => (
          <TabsTrigger key={lang} value={lang} className="inline-flex items-center gap-1.5">
            <span className={cn("size-1.5 rounded-full", filled(lang) ? "bg-success" : "bg-border")} />
            {lang === "fa" ? "فارسی" : "English"}
          </TabsTrigger>
        ))}
      </TabsList>
      {(["fa", "en"] as const).map((lang) => (
        <TabsContent key={lang} value={lang} className="mt-0">
          {long ? (
            <Textarea value={v[lang] ?? ""} onChange={(e) => setLang(lang, e.target.value)} dir={lang === "fa" ? "rtl" : "ltr"} className={cn(long === "md" ? "min-h-80 text-[13px] leading-7" : "min-h-28", lang === "fa" ? "font-fa" : "font-en")} disabled={disabled} />
          ) : (
            <Input value={v[lang] ?? ""} onChange={(e) => setLang(lang, e.target.value)} dir={lang === "fa" ? "rtl" : "ltr"} className={lang === "fa" ? "font-fa" : "font-en"} disabled={disabled} />
          )}
        </TabsContent>
      ))}
    </Tabs>
  );
}

function FieldControl({ f, value, onChange, disabled, locale }: { f: FieldSpec; value: unknown; onChange: (v: unknown) => void; disabled?: boolean; locale: string }) {
  const t = useTranslations("admin");
  const label = <span>{tx(f.label, locale)}{f.required && <span className="ms-1 text-danger">*</span>}</span>;
  const hint = f.help ? tx(f.help, locale) : f.key === "id" ? t("idHint") : undefined;
  switch (f.type) {
    case "text":
      return <Field label={label} hint={hint}><Input value={(value as string) ?? ""} onChange={(e) => onChange(e.target.value || null)} disabled={disabled} dir="ltr" className="font-en" placeholder={f.placeholder} /></Field>;
    case "number":
      return <Field label={label} hint={hint}><NumberInput value={value} onChange={onChange} disabled={disabled} /></Field>;
    case "boolean":
      return (
        <Field label={label} hint={hint}>
          <label className="flex h-11 cursor-pointer items-center gap-3 rounded-xl border border-border px-4">
            <Switch checked={Boolean(value)} onCheckedChange={(v) => onChange(v)} disabled={disabled} />
            <span className="text-sm text-muted">{value ? t("yes") : t("no")}</span>
          </label>
        </Field>
      );
    case "select":
      return <Field label={label} hint={hint}><Select value={(value as string) ?? undefined} onValueChange={onChange} options={(f.options ?? []).map((o) => ({ value: o.value, label: tx(o.label, locale) }))} disabled={disabled} placeholder="—" /></Field>;
    case "date":
      return <Field label={label} hint={hint}><DatePicker value={(value as string) ?? null} onChange={onChange} /></Field>;
    case "tags":
      return <Field label={label} hint={hint}><Input value={Array.isArray(value) ? (value as string[]).join(", ") : ""} onChange={(e) => onChange(e.target.value.split(/[,،]/).map((s) => s.trim()).filter(Boolean))} disabled={disabled} dir="ltr" className="font-en" /></Field>;
    case "i18n":
      return <Field label={label} hint={hint}><I18nInput value={value} onChange={onChange} disabled={disabled} /></Field>;
    case "i18n-long":
      return <Field label={label} hint={hint}><I18nInput value={value} onChange={onChange} long="long" disabled={disabled} /></Field>;
    case "i18n-md":
      return <Field label={label} hint={hint ?? "Markdown"}><I18nInput value={value} onChange={onChange} long="md" disabled={disabled} /></Field>;
    case "json":
      return <JsonField label={label} value={value} onChange={onChange} disabled={disabled} help={hint} />;
  }
}

function JsonField({ label, value, onChange, disabled, help }: { label: React.ReactNode; value: unknown; onChange: (v: unknown) => void; disabled?: boolean; help?: string }) {
  const [text, setText] = React.useState(JSON.stringify(value ?? null, null, 2));
  const [err, setErr] = React.useState<string | null>(null);
  return (
    <Field label={label} hint={help} error={err}>
      <Textarea value={text} dir="ltr" className="min-h-40 font-en text-xs leading-6" disabled={disabled} onChange={(e) => {
        setText(e.target.value);
        try { onChange(JSON.parse(e.target.value)); setErr(null); } catch { setErr("Invalid JSON"); }
      }} />
    </Field>
  );
}
