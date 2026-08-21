"use client";

import * as React from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Loader2, Save, Trash2, CheckCircle2, AlertCircle } from "lucide-react";
import type { FieldSpec, RefOption, TableSpec } from "@/lib/admin/specs";
import { SECTION_LABELS } from "@/lib/admin/specs";
import { saveRecord, deleteRecord } from "@/lib/admin/actions";
import { cn, tx, toEnglishDigits, slugify } from "@/lib/utils";
import { Field, Input, Textarea, Select, Switch, Tabs, TabsList, TabsTrigger, TabsContent, Dialog, DialogContent, DialogTrigger, inputClass } from "@/components/ui/primitives";
import { DatePicker } from "@/components/ui/date-picker";
import { Button } from "@/components/ui/button";

type Row = Record<string, unknown>;
const SECTIONS = ["basic", "content", "numbers", "meta"] as const;

export function RecordForm({ table, spec, initial, refOptions, isNew, canDelete, readOnly }: { table: string; spec: TableSpec; initial: Row; refOptions?: Record<string, RefOption[]>; isNew: boolean; canDelete: boolean; readOnly: boolean }) {
  const t = useTranslations("admin");
  const locale = useLocale();
  const router = useRouter();
  const [row, setRow] = React.useState<Row>(initial);
  const [saving, setSaving] = React.useState(false);
  const [msg, setMsg] = React.useState<{ ok: boolean; text: string } | null>(null);
  const [dirty, setDirty] = React.useState(false);
  const has = (key: string) => spec.fields.some((f) => f.key === key);
  // Once a field is typed in directly it stops being auto-filled from the id/slug.
  const edited = React.useRef(new Set<string>());

  const set = (k: string, v: unknown) => {
    edited.current.add(k);
    setRow((r) => {
      const next = { ...r, [k]: v };
      if (!isNew) return next;
      // id → slug: drop the prefix and make the rest url-safe
      if (k === spec.idField && has("slug") && !edited.current.has("slug")) {
        const raw = typeof v === "string" ? v : "";
        const body = spec.idPrefix && raw.startsWith(spec.idPrefix) ? raw.slice(spec.idPrefix.length) : raw;
        next.slug = slugify(body) || null;
      }
      // slug → id: keep suggesting an id while the id hasn't been typed in
      if (k === "slug" && spec.idPrefix && !edited.current.has(spec.idField)) {
        const slug = typeof v === "string" ? slugify(v) : "";
        next[spec.idField] = slug ? `${spec.idPrefix}${slug}` : "";
      }
      return next;
    });
    setDirty(true);
    setMsg(null);
  };

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
                <div key={f.key} className={cn(["i18n-long", "i18n-md", "i18n-list", "json"].includes(f.type) && "md:col-span-2")}>
                  <FieldControl f={f} value={row[f.key]} refOptions={refOptions?.[f.key]} onChange={(v) => set(f.key, v)} disabled={readOnly || (f.readOnly && !isNew) || (f.key === spec.idField && !isNew)} locale={locale} />
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

/** Bilingual bullet list stored as I18nText[] — edited as plain text, one item per line. */
function I18nListInput({ value, onChange, disabled }: { value: unknown; onChange: (v: unknown) => void; disabled?: boolean }) {
  const toText = (v: unknown, lang: "fa" | "en") => (Array.isArray(v) ? (v as Record<string, string>[]) : []).map((it) => it?.[lang] ?? "").join("\n");
  // Kept as raw text so blank lines and trailing spaces survive while typing; the array is rebuilt on every change.
  const [draft, setDraft] = React.useState(() => ({ fa: toText(value, "fa"), en: toText(value, "en") }));
  const emitted = React.useRef<string>(JSON.stringify(value ?? null));
  React.useEffect(() => {
    const json = JSON.stringify(value ?? null);
    if (json === emitted.current) return;
    emitted.current = json;
    setDraft({ fa: toText(value, "fa"), en: toText(value, "en") });
  }, [value]);

  const setLang = (lang: "fa" | "en", text: string) => {
    const next = { ...draft, [lang]: text };
    setDraft(next);
    const fa = next.fa.split("\n");
    const en = next.en.split("\n");
    const items = Array.from({ length: Math.max(fa.length, en.length) }, (_, i) => ({ fa: (fa[i] ?? "").trim(), en: (en[i] ?? "").trim() })).filter((it) => it.fa || it.en);
    emitted.current = JSON.stringify(items.length ? items : null);
    onChange(items.length ? items : null);
  };

  return (
    <Tabs defaultValue="fa">
      <TabsList className="mb-2 inline-flex">
        {(["fa", "en"] as const).map((lang) => (
          <TabsTrigger key={lang} value={lang} className="inline-flex items-center gap-1.5">
            <span className={cn("size-1.5 rounded-full", draft[lang].trim() ? "bg-success" : "bg-border")} />
            {lang === "fa" ? "فارسی" : "English"}
          </TabsTrigger>
        ))}
      </TabsList>
      {(["fa", "en"] as const).map((lang) => (
        <TabsContent key={lang} value={lang} className="mt-0">
          <Textarea value={draft[lang]} onChange={(e) => setLang(lang, e.target.value)} dir={lang === "fa" ? "rtl" : "ltr"} className={cn("min-h-28 leading-8", lang === "fa" ? "font-fa" : "font-en")} disabled={disabled} />
        </TabsContent>
      ))}
    </Tabs>
  );
}

function FieldControl({ f, value, refOptions, onChange, disabled, locale }: { f: FieldSpec; value: unknown; refOptions?: RefOption[]; onChange: (v: unknown) => void; disabled?: boolean; locale: string }) {
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
    case "ref":
      return <Field label={label} hint={hint}><RefSelect value={value} onChange={onChange} options={refOptions ?? []} required={f.required} disabled={disabled} placeholder="—" /></Field>;
    case "date":
      return <Field label={label} hint={hint}><DatePicker value={(value as string) ?? null} onChange={onChange} /></Field>;
    case "tags":
      return <Field label={label} hint={hint}><TagsInput value={value} onChange={onChange} disabled={disabled} wordsOnly={f.wordsOnly} /></Field>;
    case "i18n":
      return <Field label={label} hint={hint}><I18nInput value={value} onChange={onChange} disabled={disabled} /></Field>;
    case "i18n-long":
      return <Field label={label} hint={hint}><I18nInput value={value} onChange={onChange} long="long" disabled={disabled} /></Field>;
    case "i18n-list":
      return <Field label={label} hint={hint}><I18nListInput value={value} onChange={onChange} disabled={disabled} /></Field>;
    case "i18n-md":
      return <Field label={label} hint={hint ?? "Markdown"}><I18nInput value={value} onChange={onChange} long="md" disabled={disabled} /></Field>;
    case "json":
      return <JsonField label={label} value={value} onChange={onChange} disabled={disabled} help={hint} />;
  }
}

/** Foreign-key picker: only ids that actually exist, so a save can't break an FK constraint. */
const REF_NONE = "__none__";
function RefSelect({ value, onChange, options, required, disabled, placeholder }: { value: unknown; onChange: (v: unknown) => void; options: RefOption[]; required?: boolean; disabled?: boolean; placeholder?: string }) {
  const current = typeof value === "string" && value ? value : null;
  // Keep an unknown legacy id selectable so opening an old row never silently drops it.
  const all = current && !options.some((o) => o.value === current) ? [{ value: current, label: current }, ...options] : options;
  const items = required ? all : [{ value: REF_NONE, label: "—" }, ...all];
  return (
    <Select
      value={current ?? (required ? undefined : REF_NONE)}
      onValueChange={(v) => onChange(v === REF_NONE ? null : v)}
      options={items}
      disabled={disabled}
      placeholder={placeholder}
    />
  );
}

// wordsOnly fields accept letters, digits and spaces; "," is the one punctuation that gets through.
const NOT_A_WORD_CHAR = /[^\p{L}\p{N},\s]/gu;

/**
 * Comma-separated list. Keeps the raw text while typing (so the comma the user just typed
 * survives re-render) and treats *only* "," as the separator. With `wordsOnly`, every other
 * symbol (".", "-", "/", "،"…) is dropped as it is typed or pasted.
 */
function TagsInput({ value, onChange, disabled, wordsOnly }: { value: unknown; onChange: (v: string[] | null) => void; disabled?: boolean; wordsOnly?: boolean }) {
  const asText = (v: unknown) => (Array.isArray(v) ? (v as string[]).join(", ") : typeof v === "string" ? v : "");
  const [text, setText] = React.useState(() => asText(value));
  const emitted = React.useRef(asText(value));
  React.useEffect(() => {
    const next = asText(value);
    if (next !== emitted.current) { setText(next); emitted.current = next; }
  }, [value]);
  return (
    <Input
      value={text}
      dir="ltr"
      className="font-en"
      disabled={disabled}
      onChange={(e) => {
        const raw = wordsOnly ? e.target.value.replace(NOT_A_WORD_CHAR, "") : e.target.value;
        setText(raw);
        const items = raw.split(",").map((s) => s.trim()).filter(Boolean);
        emitted.current = items.join(", ");
        onChange(items.length ? items : null);
      }}
    />
  );
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
