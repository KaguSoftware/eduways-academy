"use client";

import { useTranslations } from "next-intl";
import { Check, GitCompareArrows } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCompare } from "./compare-context";

export function CompareToggle({ slug }: { slug: string }) {
  const t = useTranslations("universities");
  const { has, toggle } = useCompare();
  const on = has(slug);
  return (
    <Button variant={on ? "secondary" : "outline"} onClick={() => toggle(slug)} aria-pressed={on}>
      {on ? <Check className="size-4" /> : <GitCompareArrows className="size-4" />}
      {on ? t("compareRemove") : t("compareAdd")}
    </Button>
  );
}
