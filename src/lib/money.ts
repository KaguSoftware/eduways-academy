/**
 * USD formatting. The affixes ("… دلار" vs "$…") are copy, so they live in the message
 * catalogue (`common.money` / `common.moneyRange`) rather than in a sync helper — which is why
 * this takes a translator instead of only a locale.
 */
import { useLocale, useTranslations } from "next-intl";
import { formatNumber } from "./utils";
import type { Msg } from "./admin/labels";

export type Money = {
  usd(n: number | null | undefined): string;
  range(min?: number | null, max?: number | null): string;
};

/** Pure — works in Server Components, route handlers and on the client. */
export function createMoney(t: Msg, locale: string): Money {
  const num = (n: number) => formatNumber(n, locale, { maximumFractionDigits: 0 });
  const usd: Money["usd"] = (n) => (n === null || n === undefined ? "—" : t("common.money", { value: num(n) }));
  return {
    usd,
    range: (min, max) =>
      min == null && max == null
        ? "—"
        : min != null && max != null && min !== max
          ? t("common.moneyRange", { min: num(min), max: num(max) })
          : usd(min ?? max),
  };
}

/** Client convenience — same contract as `createMoney`. */
export function useMoney(): Money {
  return createMoney(useTranslations() as unknown as Msg, useLocale());
}
