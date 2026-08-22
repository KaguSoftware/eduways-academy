/**
 * Resolves admin CMS copy out of the next-intl catalogue.
 *
 * `specs.ts` carries no copy at all — only column keys — so every label, hint, option and
 * section heading is looked up here against `src/messages/{fa,en}.json`. Lookups walk a
 * fallback chain (per-table override → shared default → `common.*`) so a column key that
 * repeats across ten tables is translated once.
 */
import type { FieldSpec, SectionKey } from "./specs";

/**
 * Structurally satisfied by both `useTranslations()` and `await getTranslations()` called with
 * no namespace. It must be the ROOT translator: the option chain crosses `admin.*` into `common.*`.
 */
export type Msg = {
  (key: string, values?: Record<string, string | number | Date>): string;
  has(key: string): boolean;
};

/** Binds a root translator to one table. Create once per render, then reuse for every field. */
export function adminText(t: Msg, table: string) {
  // A missing translation renders as its own key path — loud in QA, harmless in production,
  // and caught before that by scripts/i18n-check.mjs.
  const pick = (...keys: string[]) => {
    for (const k of keys) if (t.has(k)) return t(k);
    return keys[keys.length - 1];
  };
  const suffix = (f: FieldSpec) => f.labelKey ?? f.key;

  return {
    label: () => pick(`admin.tables.${table}.label`),
    singular: () => pick(`admin.tables.${table}.singular`),
    section: (s: SectionKey) => pick(`admin.sections.${s}`),
    field: (f: FieldSpec) => pick(`admin.tableFields.${table}.${suffix(f)}`, `admin.fields.${suffix(f)}`),
    help: (f: FieldSpec): string | undefined => {
      const k = suffix(f);
      if (f.help) return pick(`admin.tableFieldHelp.${table}.${k}`, `admin.fieldHelp.${k}`);
      if (f.key === "id") return t("admin.idHint");
      if (f.type === "i18n-md") return t("admin.markdownHint");
      return undefined;
    },
    option: (f: FieldSpec, value: string) => pick(`admin.options.${suffix(f)}.${value}`, `common.${value}`, value),
  };
}

export type AdminText = ReturnType<typeof adminText>;
