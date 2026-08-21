"use client";
/**
 * Branded UI primitives. HARD RULE: no native/OS-default controls anywhere in the app.
 * Everything here wraps Radix (via the `radix-ui` meta-package) or is hand-built, styled with brand tokens.
 */
import * as React from "react";
import {
  Accordion as RxAccordion,
  Checkbox as RxCheckbox,
  Collapsible as RxCollapsible,
  Dialog as RxDialog,
  Popover as RxPopover,
  RadioGroup as RxRadio,
  ScrollArea as RxScroll,
  Select as RxSelect,
  Slider as RxSlider,
  Switch as RxSwitch,
  Tabs as RxTabs,
  Tooltip as RxTooltip,
  Label as RxLabel,
} from "radix-ui";
import { Check, ChevronDown, X, Minus, Plus, Search } from "lucide-react";
import { cn } from "@/lib/utils";

/* ───────────────────────── Label / Field ───────────────────────── */
export function Label({ className, ...props }: React.ComponentProps<typeof RxLabel.Root>) {
  return <RxLabel.Root className={cn("text-sm font-semibold text-foreground", className)} {...props} />;
}

export function Field({ label, hint, error, required, children, className }: { label?: React.ReactNode; hint?: React.ReactNode; error?: React.ReactNode; required?: boolean; children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {label && (
        <Label>
          {label}
          {required && <span className="ms-1 text-danger">*</span>}
        </Label>
      )}
      {children}
      {error ? <p className="text-xs font-medium text-danger">{error}</p> : hint ? <p className="text-xs text-muted">{hint}</p> : null}
    </div>
  );
}

/* ───────────────────────── Input / Textarea ───────────────────────── */
export const inputClass =
  "flex h-11 w-full rounded-xl border border-border bg-background px-4 text-sm text-foreground placeholder:text-muted/70 transition-colors focus-ring focus-visible:border-brand-400 disabled:opacity-50 aria-[invalid=true]:border-danger";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement> & { startIcon?: React.ReactNode; endIcon?: React.ReactNode }>(
  ({ className, startIcon, endIcon, type, ...props }, ref) => {
    const safeType = type === "number" || type === "date" || type === "time" || type === "range" || type === "file" ? "text" : type; // never native pickers
    if (!startIcon && !endIcon) return <input ref={ref} type={safeType} className={cn(inputClass, className)} {...props} />;
    return (
      <div className="relative">
        {startIcon && <span className="pointer-events-none absolute inset-y-0 start-3.5 flex items-center text-muted [&_svg]:size-4">{startIcon}</span>}
        <input ref={ref} type={safeType} className={cn(inputClass, startIcon && "ps-10", endIcon && "pe-10", className)} {...props} />
        {endIcon && <span className="absolute inset-y-0 end-3.5 flex items-center text-muted [&_svg]:size-4">{endIcon}</span>}
      </div>
    );
  },
);
Input.displayName = "Input";

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(({ className, ...props }, ref) => (
  <textarea ref={ref} className={cn(inputClass, "h-auto min-h-28 resize-none py-3", className)} {...props} />
));
Textarea.displayName = "Textarea";

/* Always-visible scrollbar for the Select menu.
   Radix's own ScrollUpButton/ScrollDownButton arrows and native overlay
   scrollbars (macOS/Chromium draw those at zero width until you actually
   scroll) both leave a long option list looking like it ends at the fold.
   So the viewport keeps native scrolling and we paint a track + thumb over it. */
function SelectScrollbar({ viewportRef }: { viewportRef: React.RefObject<HTMLDivElement | null> }) {
  const [bar, setBar] = React.useState<{ height: number; top: number } | null>(null);

  React.useEffect(() => {
    const vp = viewportRef.current;
    if (!vp) return;
    const measure = () => {
      const { scrollHeight, clientHeight, scrollTop } = vp;
      if (scrollHeight <= clientHeight + 1) return setBar(null);
      const track = clientHeight - PAD * 2;
      const height = Math.max(MIN_THUMB, (clientHeight / scrollHeight) * track);
      const top = PAD + (scrollTop / (scrollHeight - clientHeight)) * (track - height);
      setBar({ height, top });
    };
    measure();
    vp.addEventListener("scroll", measure, { passive: true });
    const ro = new ResizeObserver(measure);
    ro.observe(vp);
    for (const c of Array.from(vp.children)) ro.observe(c);
    return () => { vp.removeEventListener("scroll", measure); ro.disconnect(); };
  }, [viewportRef]);

  if (!bar) return null;
  return (
    <div aria-hidden className="pointer-events-none absolute inset-y-0 end-1 w-1.5">
      <div className="absolute inset-y-1.5 w-full rounded-full bg-border/50" />
      <div className="absolute w-full rounded-full bg-brand-300" style={{ height: bar.height, top: bar.top }} />
    </div>
  );
}
const PAD = 6;
const MIN_THUMB = 24;

/* ───────────────────────── Select ───────────────────────── */
export interface SelectOption { value: string; label: React.ReactNode; disabled?: boolean }
export function Select({ value, onValueChange, options, placeholder, className, size = "md", ariaLabel, name, disabled }: {
  value?: string; onValueChange?: (v: string) => void; options: SelectOption[]; placeholder?: React.ReactNode; className?: string; size?: "sm" | "md"; ariaLabel?: string; name?: string; disabled?: boolean;
}) {
  const viewportRef = React.useRef<HTMLDivElement>(null);
  return (
    <RxSelect.Root value={value} onValueChange={onValueChange} name={name} disabled={disabled}>
      <RxSelect.Trigger
        aria-label={ariaLabel}
        className={cn(
          inputClass,
          "items-center justify-between gap-2 text-start data-[placeholder]:text-muted/70 [&>span]:truncate",
          size === "sm" && "h-9 rounded-lg px-3 text-xs",
          className,
        )}
      >
        <RxSelect.Value placeholder={placeholder} />
        <RxSelect.Icon className="shrink-0 text-muted"><ChevronDown className="size-4" /></RxSelect.Icon>
      </RxSelect.Trigger>
      <RxSelect.Portal>
        <RxSelect.Content position="popper" sideOffset={6} className="relative z-[100] max-h-80 min-w-[var(--radix-select-trigger-width)] overflow-hidden rounded-2xl border border-border bg-background shadow-lg data-[state=open]:animate-in data-[state=open]:fade-in data-[state=open]:zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out data-[state=closed]:zoom-out-95 data-[state=closed]:duration-150">
          <RxSelect.Viewport ref={viewportRef} className="scrollbar-none max-h-[inherit] overflow-y-auto overscroll-contain p-1.5 pe-3">
            {options.map((o) => (
              <RxSelect.Item key={o.value} value={o.value} disabled={o.disabled} className="relative flex cursor-pointer select-none items-center rounded-xl py-2.5 pe-3 ps-9 text-sm outline-none data-[highlighted]:bg-brand-50 data-[highlighted]:text-brand-800 data-[state=checked]:font-semibold data-[disabled]:opacity-40">
                <span className="absolute start-3 flex size-4 items-center justify-center"><RxSelect.ItemIndicator><Check className="size-4 text-brand-600" /></RxSelect.ItemIndicator></span>
                <RxSelect.ItemText>{o.label}</RxSelect.ItemText>
              </RxSelect.Item>
            ))}
          </RxSelect.Viewport>
          <SelectScrollbar viewportRef={viewportRef} />
        </RxSelect.Content>
      </RxSelect.Portal>
    </RxSelect.Root>
  );
}

/* ───────────────────────── Checkbox / Radio / Switch ───────────────────────── */
export function Checkbox({ className, label, ...props }: React.ComponentProps<typeof RxCheckbox.Root> & { label?: React.ReactNode }) {
  const box = (
    <RxCheckbox.Root className={cn("peer flex size-5 shrink-0 items-center justify-center rounded-md border border-border bg-background transition-colors focus-ring data-[state=checked]:border-brand-600 data-[state=checked]:bg-brand-600 data-[state=checked]:text-white", className)} {...props}>
      <RxCheckbox.Indicator><Check className="size-3.5" strokeWidth={3} /></RxCheckbox.Indicator>
    </RxCheckbox.Root>
  );
  if (!label) return box;
  return (
    <label className="flex cursor-pointer items-center gap-2.5 text-sm">
      {box}
      <span>{label}</span>
    </label>
  );
}

export function RadioGroup({ className, ...props }: React.ComponentProps<typeof RxRadio.Root>) {
  return <RxRadio.Root className={cn("grid gap-2", className)} {...props} />;
}
export function RadioItem({ className, label, description, ...props }: React.ComponentProps<typeof RxRadio.Item> & { label: React.ReactNode; description?: React.ReactNode }) {
  return (
    <label className={cn("flex cursor-pointer items-start gap-3 rounded-xl border border-border p-3 transition-colors has-[[data-state=checked]]:border-brand-400 has-[[data-state=checked]]:bg-brand-50/60", className)}>
      <RxRadio.Item className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border border-border bg-background focus-ring data-[state=checked]:border-brand-600" {...props}>
        <RxRadio.Indicator className="size-2.5 rounded-full bg-brand-600" />
      </RxRadio.Item>
      <span className="flex flex-col gap-0.5">
        <span className="text-sm font-medium">{label}</span>
        {description && <span className="text-xs text-muted">{description}</span>}
      </span>
    </label>
  );
}

/** Segmented control: branded alternative to radio buttons for 2–4 options. */
export function Segmented<T extends string>({ value, onChange, options, className, size = "md", ariaLabel, animated = false }: { value: T; onChange: (v: T) => void; options: { value: T; label: React.ReactNode }[]; className?: string; size?: "sm" | "md"; ariaLabel?: string; animated?: boolean }) {
  const listRef = React.useRef<HTMLDivElement>(null);
  const [thumb, setThumb] = React.useState<{ left: number; width: number } | null>(null);

  // Measure the active button so one shared pill can slide between options.
  React.useLayoutEffect(() => {
    if (!animated) return;
    const list = listRef.current;
    if (!list) return;
    const measure = () => {
      const active = list.querySelector<HTMLButtonElement>('[data-active="true"]');
      if (active) setThumb({ left: active.offsetLeft, width: active.offsetWidth });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(list);
    return () => ro.disconnect();
  }, [animated, value, options]);

  return (
    <div ref={listRef} role="radiogroup" aria-label={ariaLabel} className={cn("relative inline-flex rounded-full border border-border bg-surface p-1", className)}>
      {animated && thumb && (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-y-1 left-0 rounded-full bg-background shadow-sm transition-[transform,width] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none"
          style={{ width: thumb.width, transform: `translateX(${thumb.left}px)` }}
        />
      )}
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={value === o.value}
          data-active={value === o.value}
          onClick={() => onChange(o.value)}
          className={cn(
            "relative z-10 rounded-full font-medium focus-ring",
            animated ? "transition-colors duration-200" : "transition-all",
            size === "sm" ? "px-3 py-1 text-xs" : "px-4 py-1.5 text-sm",
            value === o.value ? (animated ? "text-brand-800" : "bg-background text-brand-800 shadow-sm") : "text-muted hover:text-foreground",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function Switch({ className, ...props }: React.ComponentProps<typeof RxSwitch.Root>) {
  return (
    <RxSwitch.Root className={cn("relative h-6 w-11 shrink-0 rounded-full border border-border bg-surface-2 transition-colors focus-ring data-[state=checked]:border-brand-600 data-[state=checked]:bg-brand-600", className)} {...props}>
      <RxSwitch.Thumb className="block size-5 translate-x-0.5 rounded-full bg-white shadow transition-transform rtl:-translate-x-0.5 data-[state=checked]:translate-x-[22px] rtl:data-[state=checked]:-translate-x-[22px]" />
    </RxSwitch.Root>
  );
}

/* ───────────────────────── Slider ───────────────────────── */
export function Slider({ className, ...props }: React.ComponentProps<typeof RxSlider.Root>) {
  const thumbs = Array.isArray(props.value ?? props.defaultValue) ? (props.value ?? props.defaultValue)!.length : 1;
  return (
    <RxSlider.Root className={cn("relative flex h-6 w-full touch-none select-none items-center", className)} {...props}>
      <RxSlider.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-surface-2">
        <RxSlider.Range className="absolute h-full bg-brand-gradient" />
      </RxSlider.Track>
      {Array.from({ length: thumbs }).map((_, i) => (
        <RxSlider.Thumb key={i} className="block size-5 rounded-full border-2 border-brand-600 bg-white shadow-md transition-transform focus-ring hover:scale-110" />
      ))}
    </RxSlider.Root>
  );
}

/* ───────────────────────── Number stepper (no native spinners) ───────────────────────── */
export function NumberStepper({ value, onChange, min = 0, max = Infinity, step = 1, format, className }: { value: number; onChange: (v: number) => void; min?: number; max?: number; step?: number; format?: (v: number) => string; className?: string }) {
  const clamp = (v: number) => Math.min(max, Math.max(min, v));
  return (
    <div className={cn("inline-flex h-11 items-stretch overflow-hidden rounded-xl border border-border bg-background", className)}>
      <button type="button" aria-label="decrease" onClick={() => onChange(clamp(value - step))} className="flex w-11 items-center justify-center text-muted hover:bg-surface hover:text-foreground focus-ring"><Minus className="size-4" /></button>
      <input
        inputMode="numeric"
        value={format ? format(value) : String(value)}
        onChange={(e) => {
          const n = Number(e.target.value.replace(/[^\d.-]/g, ""));
          if (!Number.isNaN(n)) onChange(clamp(n));
        }}
        className="w-24 border-x border-border bg-transparent text-center text-sm font-semibold tabular outline-none"
      />
      <button type="button" aria-label="increase" onClick={() => onChange(clamp(value + step))} className="flex w-11 items-center justify-center text-muted hover:bg-surface hover:text-foreground focus-ring"><Plus className="size-4" /></button>
    </div>
  );
}

/* ───────────────────────── Tabs ───────────────────────── */
export const Tabs = RxTabs.Root;
export function TabsList({ className, ...props }: React.ComponentProps<typeof RxTabs.List>) {
  return <RxTabs.List className={cn("scrollbar-none flex gap-1 overflow-x-auto rounded-full border border-border bg-surface p-1", className)} {...props} />;
}
export function TabsTrigger({ className, ...props }: React.ComponentProps<typeof RxTabs.Trigger>) {
  return <RxTabs.Trigger className={cn("shrink-0 rounded-full px-4 py-2 text-sm font-medium text-muted transition-all focus-ring hover:text-foreground data-[state=active]:bg-background data-[state=active]:text-brand-800 data-[state=active]:shadow-sm", className)} {...props} />;
}
export function TabsContent({ className, ...props }: React.ComponentProps<typeof RxTabs.Content>) {
  return <RxTabs.Content className={cn("mt-6 outline-none animate-fade-up", className)} {...props} />;
}

/* ───────────────────────── Accordion ───────────────────────── */
export const Accordion = RxAccordion.Root;
export function AccordionItem({ className, ...props }: React.ComponentProps<typeof RxAccordion.Item>) {
  return <RxAccordion.Item className={cn("card overflow-hidden", className)} {...props} />;
}
export function AccordionTrigger({ className, children, ...props }: React.ComponentProps<typeof RxAccordion.Trigger>) {
  return (
    <RxAccordion.Header className="flex">
      <RxAccordion.Trigger className={cn("group flex flex-1 items-center justify-between gap-4 px-5 py-4 text-start text-base font-semibold transition-colors hover:text-brand-700 focus-ring [&[data-state=open]>svg]:rotate-180", className)} {...props}>
        {children}
        <ChevronDown className="size-5 shrink-0 text-muted transition-transform duration-300" />
      </RxAccordion.Trigger>
    </RxAccordion.Header>
  );
}
export function AccordionContent({ className, children, ...props }: React.ComponentProps<typeof RxAccordion.Content>) {
  return (
    <RxAccordion.Content className="overflow-hidden text-sm data-[state=closed]:animate-[accordion-up_0.25s_ease-out] data-[state=open]:animate-[accordion-down_0.25s_ease-out]" {...props}>
      <div className={cn("px-5 pb-5 leading-7 text-muted", className)}>{children}</div>
    </RxAccordion.Content>
  );
}

/* ───────────────────────── Dialog / Sheet ───────────────────────── */
export const Dialog = RxDialog.Root;
export const DialogTrigger = RxDialog.Trigger;
export const DialogClose = RxDialog.Close;
export function DialogContent({ className, children, heading, description, side, ...props }: React.ComponentProps<typeof RxDialog.Content> & { heading: React.ReactNode; description?: React.ReactNode; side?: "center" | "end" | "bottom" }) {
  return (
    <RxDialog.Portal>
      <RxDialog.Overlay className="fixed inset-0 z-[90] bg-brand-950/40 backdrop-blur-sm data-[state=open]:animate-in data-[state=open]:fade-in" />
      <RxDialog.Content
        className={cn(
          "fixed z-[95] bg-background shadow-lg focus:outline-none",
          side === "end" && "inset-y-0 end-0 h-full w-full max-w-sm overflow-y-auto p-6 data-[state=open]:animate-in data-[state=open]:slide-in-from-end",
          side === "bottom" && "inset-x-0 bottom-0 max-h-[90dvh] overflow-y-auto rounded-t-3xl p-6",
          (!side || side === "center") && "start-1/2 top-1/2 w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-3xl p-6 rtl:translate-x-1/2",
          className,
        )}
        {...props}
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <RxDialog.Title className="text-lg font-bold">{heading}</RxDialog.Title>
            {description && <RxDialog.Description className="mt-1 text-sm text-muted">{description}</RxDialog.Description>}
          </div>
          <RxDialog.Close className="rounded-full p-2 text-muted hover:bg-surface hover:text-foreground focus-ring" aria-label="Close"><X className="size-5" /></RxDialog.Close>
        </div>
        {children}
      </RxDialog.Content>
    </RxDialog.Portal>
  );
}

/* ───────────────────────── Popover / Tooltip ───────────────────────── */
export const Popover = RxPopover.Root;
export const PopoverTrigger = RxPopover.Trigger;
export function PopoverContent({ className, ...props }: React.ComponentProps<typeof RxPopover.Content>) {
  return (
    <RxPopover.Portal>
      <RxPopover.Content sideOffset={8} className={cn("z-[100] w-72 rounded-2xl border border-border bg-background p-4 shadow-lg outline-none animate-in fade-in zoom-in-95", className)} {...props} />
    </RxPopover.Portal>
  );
}

export function TooltipProvider(props: React.ComponentProps<typeof RxTooltip.Provider>) {
  return <RxTooltip.Provider delayDuration={200} {...props} />;
}
export function Tooltip({ content, children, side }: { content: React.ReactNode; children: React.ReactNode; side?: "top" | "bottom" | "left" | "right" }) {
  return (
    <RxTooltip.Root>
      <RxTooltip.Trigger asChild>{children}</RxTooltip.Trigger>
      <RxTooltip.Portal>
        <RxTooltip.Content side={side} sideOffset={6} className="z-[100] max-w-xs rounded-xl bg-brand-900 px-3 py-2 text-xs font-medium text-white shadow-lg animate-in fade-in zoom-in-95">
          {content}
          <RxTooltip.Arrow className="fill-brand-900" />
        </RxTooltip.Content>
      </RxTooltip.Portal>
    </RxTooltip.Root>
  );
}

/* ───────────────────────── ScrollArea ───────────────────────── */
export function ScrollArea({ className, children, orientation = "vertical", ...props }: React.ComponentProps<typeof RxScroll.Root> & { orientation?: "vertical" | "horizontal" | "both" }) {
  return (
    <RxScroll.Root className={cn("relative overflow-hidden", className)} {...props}>
      <RxScroll.Viewport className="size-full rounded-[inherit] [&>div]:!block">{children}</RxScroll.Viewport>
      {(orientation === "vertical" || orientation === "both") && (
        <RxScroll.Scrollbar orientation="vertical" className="flex w-2.5 touch-none select-none p-0.5">
          <RxScroll.Thumb className="relative flex-1 rounded-full bg-brand-300 hover:bg-brand-400" />
        </RxScroll.Scrollbar>
      )}
      {(orientation === "horizontal" || orientation === "both") && (
        <RxScroll.Scrollbar orientation="horizontal" className="flex h-2.5 touch-none select-none flex-col p-0.5">
          <RxScroll.Thumb className="relative flex-1 rounded-full bg-brand-300 hover:bg-brand-400" />
        </RxScroll.Scrollbar>
      )}
      <RxScroll.Corner />
    </RxScroll.Root>
  );
}

/* ───────────────────────── Misc ───────────────────────── */
export function Badge({ className, variant = "default", ...props }: React.HTMLAttributes<HTMLSpanElement> & { variant?: "default" | "brand" | "accent" | "success" | "warning" | "outline" | "dark" }) {
  const v = {
    default: "bg-surface-2 text-foreground",
    brand: "bg-brand-50 text-brand-800",
    accent: "bg-accent-500/15 text-accent-600",
    success: "bg-success/10 text-success",
    warning: "bg-warning/15 text-warning",
    outline: "border border-border text-muted",
    dark: "bg-brand-900 text-white",
  }[variant];
  return <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold leading-none", v, className)} {...props} />;
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-xl bg-surface-2", className)} />;
}

export function SearchInput(props: React.InputHTMLAttributes<HTMLInputElement> & { endIcon?: React.ReactNode }) {
  return <Input startIcon={<Search />} type="search" {...props} />;
}

/** Empty-state block */
export function Empty({ title, body, action }: { title: React.ReactNode; body?: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="card flex flex-col items-center gap-3 px-6 py-14 text-center">
      <div className="flex size-14 items-center justify-center rounded-full bg-brand-50 text-brand-600"><Search className="size-6" /></div>
      <p className="text-lg font-semibold">{title}</p>
      {body && <p className="max-w-md text-sm text-muted">{body}</p>}
      {action}
    </div>
  );
}

/* ───────────────────────── Filter panel pieces ───────────────────────── */
/** Removable pill used to show an applied filter above the results. */
export function FilterPill({ label, onRemove }: { label: React.ReactNode; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-brand-200 bg-brand-50 py-1 pe-1 ps-2.5 text-xs font-semibold text-brand-800">
      {label}
      <button type="button" onClick={onRemove} aria-label="remove filter" className="flex size-4 items-center justify-center rounded-full text-brand-600 transition-colors hover:bg-brand-200/70 hover:text-brand-900 focus-ring">
        <X className="size-3" strokeWidth={3} />
      </button>
    </span>
  );
}

/** Collapsible titled block for a filter sidebar. */
export function FilterGroup({ title, action, children, defaultOpen = true }: { title: React.ReactNode; action?: React.ReactNode; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = React.useState(defaultOpen);
  return (
    <RxCollapsible.Root open={open} onOpenChange={setOpen} className="border-b border-border/70 pb-4 last:border-0 last:pb-0">
      <div className="flex items-center justify-between gap-2">
        <RxCollapsible.Trigger className="-mx-1 flex flex-1 items-center gap-1.5 rounded-lg px-1 py-1 text-start text-xs font-semibold uppercase tracking-wide text-muted transition-colors hover:text-foreground focus-ring">
          <ChevronDown className={cn("size-3.5 transition-transform duration-200", !open && "-rotate-90 rtl:rotate-90")} />
          {title}
        </RxCollapsible.Trigger>
        {action}
      </div>
      <RxCollapsible.Content className="overflow-hidden data-[state=closed]:animate-[collapsible-up_0.22s_ease-out] data-[state=open]:animate-[collapsible-down_0.22s_ease-out] motion-reduce:animate-none">
        <div className="mt-2.5">{children}</div>
      </RxCollapsible.Content>
    </RxCollapsible.Root>
  );
}
