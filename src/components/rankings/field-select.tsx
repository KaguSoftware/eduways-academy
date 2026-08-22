"use client";

import { useRouter } from "@/i18n/navigation";
import { Select } from "@/components/ui/primitives";
import { DynamicIcon } from "@/components/home/sections";
import { tx } from "@/lib/utils";
import type { Category } from "@/lib/types";

const ALL_VALUE = "all";

export function FieldSelect({ categories, locale, value, placeholder, allLabel, ariaLabel, className }: {
  categories: Category[];
  locale: string;
  value?: string;
  placeholder?: string;
  allLabel: string;
  ariaLabel?: string;
  className?: string;
}) {
  const router = useRouter();
  return (
    <Select
      value={value}
      onValueChange={(slug) => router.push(`/rankings/field-${slug}`)}
      ariaLabel={ariaLabel}
      placeholder={placeholder}
      className={className}
      options={[
        {
          value: ALL_VALUE,
          label: (
            <span className="flex items-center gap-2">
              <DynamicIcon name="LayoutGrid" className="size-4 text-brand-600" />
              {allLabel}
            </span>
          ),
        },
        ...categories.map((c) => ({
          value: c.slug,
          label: (
            <span className="flex items-center gap-2">
              <DynamicIcon name={c.icon ?? "Sparkles"} className="size-4 text-brand-600" />
              {tx(c.name, locale)}
            </span>
          ),
        })),
      ]}
    />
  );
}
