"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { BookOpen, GraduationCap, Layers } from "lucide-react";
import { cn } from "@/lib/utils";
import { SearchInput } from "@/components/ui/primitives";

export interface Suggestion {
  /** what goes into the query box */
  value: string;
  label: string;
  subtitle?: string;
  kind: "program" | "university" | "field";
  /** extra filters applied when picked */
  university?: string;
  category?: string;
}

const ICON = {
  program: BookOpen,
  university: GraduationCap,
  field: Layers,
} as const;

/** Search box with an inline, keyboard-navigable suggestion list (no native controls). */
export function ProgramSearch({
  value,
  onChange,
  onPick,
  suggestions,
  placeholder,
  count,
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  onPick: (s: Suggestion) => void;
  suggestions: Suggestion[];
  placeholder?: string;
  /** result count, shown as a pill inside the trailing edge of the box */
  count?: React.ReactNode;
  className?: string;
}) {
  const t = useTranslations();
  const [open, setOpen] = React.useState(false);
  const [active, setActive] = React.useState(-1);
  // reset the highlight during render whenever the suggestion list changes
  const [lastList, setLastList] = React.useState(suggestions);
  if (lastList !== suggestions) {
    setLastList(suggestions);
    setActive(-1);
  }
  const boxRef = React.useRef<HTMLDivElement>(null);
  const listRef = React.useRef<HTMLUListElement>(null);
  const id = React.useId();

  React.useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!boxRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  React.useEffect(() => {
    if (active < 0) return;
    listRef.current?.children[active]?.scrollIntoView({ block: "nearest" });
  }, [active]);

  const show = open && suggestions.length > 0;

  const pick = (s: Suggestion) => {
    onPick(s);
    setOpen(false);
    setActive(-1);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      setOpen(false);
      setActive(-1);
      return;
    }
    if (!suggestions.length) return;
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      if (!open) {
        setOpen(true);
        return;
      }
      // cycle through options plus a "nothing selected" slot at index -1
      const n = suggestions.length + 1;
      const dir = e.key === "ArrowDown" ? 1 : -1;
      setActive((i) => ((i + 1 + dir + n) % n) - 1);
      return;
    }
    if (e.key === "Enter" && show && active >= 0) {
      e.preventDefault();
      pick(suggestions[active]);
    }
  };

  return (
    <div ref={boxRef} className={cn("relative", className)}>
      <SearchInput
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        role="combobox"
        aria-expanded={show}
        aria-controls={`${id}-list`}
        aria-autocomplete="list"
        aria-activedescendant={show && active >= 0 ? `${id}-opt-${active}` : undefined}
        autoComplete="off"
        endIcon={
          count != null ? (
            <span className="pointer-events-none flex items-center gap-3">
              <span aria-hidden className="h-5 w-px bg-border" />
              <span className="whitespace-nowrap text-xs text-muted">{count}</span>
            </span>
          ) : undefined
        }
        // the count is wider than the icon-sized slot `endIcon` pads for
        className={count != null ? "pe-32" : undefined}
      />
      {show && (
        <ul
          ref={listRef}
          id={`${id}-list`}
          role="listbox"
          aria-label={t("programs.suggestions")}
          className="absolute inset-x-0 top-[calc(100%+0.5rem)] z-40 max-h-80 overflow-y-auto rounded-2xl border border-border bg-background p-1.5 shadow-lg"
        >
          {suggestions.map((s, i) => {
            const Icon = ICON[s.kind];
            return (
              <li
                key={`${s.kind}-${s.value}-${s.university ?? ""}-${s.category ?? ""}`}
                id={`${id}-opt-${i}`}
                role="option"
                aria-selected={i === active}
                onMouseEnter={() => setActive(i)}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => pick(s)}
                className={cn(
                  "flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm",
                  i === active ? "bg-brand-50 text-brand-900" : "text-foreground",
                )}
              >
                <span className={cn("flex size-8 shrink-0 items-center justify-center rounded-lg text-brand-700 [&_svg]:size-4", i === active ? "bg-white" : "bg-surface")}>
                  <Icon />
                </span>
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate font-medium">{s.label}</span>
                  {s.subtitle && <span className="truncate text-xs text-muted">{s.subtitle}</span>}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
