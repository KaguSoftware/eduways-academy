"use client";

import * as React from "react";
import { DayPicker } from "react-day-picker";
import * as jalali from "date-fns-jalali";
import { faIR } from "date-fns-jalali/locale";
import { format as fmtGregorian } from "date-fns";
import { useLocale } from "next-intl";
import { CalendarDays, ChevronLeft, ChevronRight, X } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger, inputClass } from "./primitives";
import { cn, formatDate } from "@/lib/utils";
import "react-day-picker/style.css";

/** Jalali date math for react-day-picker (same approach as the library's own persian preset). */
const jalaliDateLib = {
  addDays: jalali.addDays, addMonths: jalali.addMonths, addWeeks: jalali.addWeeks, addYears: jalali.addYears,
  differenceInCalendarDays: jalali.differenceInCalendarDays, differenceInCalendarMonths: jalali.differenceInCalendarMonths,
  eachMonthOfInterval: jalali.eachMonthOfInterval, endOfISOWeek: jalali.endOfISOWeek, endOfMonth: jalali.endOfMonth, endOfWeek: jalali.endOfWeek, endOfYear: jalali.endOfYear,
  format: jalali.format, getISOWeek: jalali.getISOWeek, getMonth: jalali.getMonth, getWeek: jalali.getWeek, getYear: jalali.getYear,
  isAfter: jalali.isAfter, isBefore: jalali.isBefore, isSameDay: jalali.isSameDay, isSameMonth: jalali.isSameMonth, isSameYear: jalali.isSameYear,
  max: jalali.max, min: jalali.min, setMonth: jalali.setMonth, setYear: jalali.setYear,
  startOfDay: jalali.startOfDay, startOfISOWeek: jalali.startOfISOWeek, startOfMonth: jalali.startOfMonth, startOfWeek: jalali.startOfWeek, startOfYear: jalali.startOfYear,
} as const;

export interface DatePickerProps {
  value?: string | null; // ISO yyyy-MM-dd
  onChange: (iso: string | null) => void;
  placeholder?: string;
  className?: string;
  clearable?: boolean;
  calendar?: "auto" | "jalali" | "gregorian";
}

export function DatePicker({ value, onChange, placeholder = "—", className, clearable = true, calendar = "auto" }: DatePickerProps) {
  const locale = useLocale();
  const useJalali = calendar === "jalali" || (calendar === "auto" && locale === "fa");
  const selected = value ? new Date(value + "T00:00:00") : undefined;
  const [open, setOpen] = React.useState(false);
  const label = selected ? formatDate(selected, useJalali ? "fa" : "en") : "";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button type="button" className={cn(inputClass, "items-center justify-between gap-2 text-start", !label && "text-muted/70", className)}>
          <span className="flex items-center gap-2"><CalendarDays className="size-4 text-muted" />{label || placeholder}</span>
          {clearable && label && <span role="button" aria-label="clear" onClick={(e) => { e.stopPropagation(); onChange(null); }} className="rounded-full p-0.5 text-muted hover:bg-surface hover:text-foreground"><X className="size-3.5" /></span>}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-3" align="start">
        <DayPicker
          mode="single"
          selected={selected}
          defaultMonth={selected}
          onSelect={(d) => { onChange(d ? fmtGregorian(d, "yyyy-MM-dd") : null); setOpen(false); }}
          dir={useJalali ? "rtl" : "ltr"}
          locale={useJalali ? faIR : undefined}
          numerals={useJalali ? "arabext" : "latn"}
          weekStartsOn={useJalali ? 6 : 1}
          dateLib={useJalali ? (jalaliDateLib as never) : undefined}
          showOutsideDays
          components={{
            Chevron: ({ orientation }) => (orientation === "left" ? <ChevronLeft className="size-4" /> : <ChevronRight className="size-4" />),
          }}
          classNames={{
            root: "rdp-root text-sm [--rdp-accent-color:var(--brand-600)] [--rdp-accent-background-color:var(--brand-50)] [--rdp-day-width:2.25rem] [--rdp-day-height:2.25rem] [--rdp-day_button-width:2.25rem] [--rdp-day_button-height:2.25rem] [--rdp-nav_button-width:2rem] [--rdp-nav_button-height:2rem]",
            month_caption: "flex h-9 items-center justify-center px-9 font-bold",
            nav: "absolute inset-x-0 top-0 flex h-9 items-center justify-between",
            button_previous: "flex size-8 items-center justify-center rounded-full hover:bg-brand-50 focus-ring",
            button_next: "flex size-8 items-center justify-center rounded-full hover:bg-brand-50 focus-ring",
            weekday: "text-[11px] font-semibold uppercase text-muted",
            day_button: "rounded-full font-medium hover:bg-brand-50 focus-ring",
            selected: "[&>button]:bg-brand-600 [&>button]:text-white [&>button]:hover:bg-brand-700",
            today: "font-extrabold text-brand-700",
            outside: "opacity-40",
          }}
        />
      </PopoverContent>
    </Popover>
  );
}

/** Branded 24h time picker (hour/minute wheels), no native input[type=time]. */
export function TimePicker({ value, onChange, className }: { value?: string | null; onChange: (v: string | null) => void; className?: string }) {
  const [h, m] = (value ?? "09:00").split(":").map(Number);
  const set = (hh: number, mm: number) => onChange(`${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`);
  const col = (n: number, step: number, cur: number, pick: (v: number) => void) => (
    <div className="h-48 w-16 overflow-y-auto rounded-xl border border-border p-1">
      {Array.from({ length: n / step }).map((_, i) => {
        const v = i * step;
        return <button key={v} type="button" onClick={() => pick(v)} className={cn("block w-full rounded-lg px-2 py-1.5 font-en text-sm tabular hover:bg-brand-50", v === cur && "bg-brand-600 text-white hover:bg-brand-700")}>{String(v).padStart(2, "0")}</button>;
      })}
    </div>
  );
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button type="button" className={cn(inputClass, "items-center justify-between gap-2 font-en", className)} dir="ltr">{value ?? "--:--"}</button>
      </PopoverTrigger>
      <PopoverContent className="flex w-auto gap-2 p-3" align="start">{col(24, 1, h, (v) => set(v, m))}{col(60, 5, m, (v) => set(h, v))}</PopoverContent>
    </Popover>
  );
}
