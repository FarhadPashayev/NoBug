"use client";

import * as Tabs from "@radix-ui/react-tabs";
import { useState } from "react";
import { Controller, type Control, type FieldPath, type FieldValues } from "react-hook-form";
import { cn } from "@/lib/utils";
import { LOCALES, type Locale } from "@/lib/i18n/config";
import type { Localized } from "@/lib/i18n/localized";
import { Input, Label, Textarea } from "./ui/field";

const NAMES: Record<Locale, string> = { az: "AZ", en: "EN", ru: "RU" };

/**
 * One translatable field: AZ | EN | RU tabs over a single input. A tab shows
 * a dot when that language is empty; AZ is required and turns the dot red
 * once validation has run. The value is the whole { az, en, ru } object, so
 * the schema's `localizedString()` validates it as a unit.
 */
export function LocalizedField<T extends FieldValues>({
  control,
  name,
  label,
  hint,
  kind = "input",
  rows = 4,
  placeholder,
  error,
  className,
  renderEditor,
}: {
  control: Control<T>;
  name: FieldPath<T>;
  label: string;
  hint?: string;
  kind?: "input" | "textarea" | "custom";
  rows?: number;
  placeholder?: string;
  /** message for the az key (or the object) from react-hook-form */
  error?: string;
  className?: string;
  /** kind="custom": render your own editor for the active language */
  renderEditor?: (props: { value: string; onChange: (v: string) => void; locale: Locale }) => React.ReactNode;
}) {
  const [active, setActive] = useState<Locale>("az");
  const id = `lf-${String(name).replace(/\./g, "-")}`;

  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => {
        const value: Localized = { az: "", en: "", ru: "", ...(field.value as Partial<Localized> | undefined) };
        const set = (locale: Locale, text: string) => field.onChange({ ...value, [locale]: text });

        return (
          <div className={cn("space-y-1.5", className)} data-localized={String(name)}>
            <div className="flex flex-wrap items-end justify-between gap-2">
              <Label htmlFor={`${id}-${active}`}>{label}</Label>
              <Tabs.Root value={active} onValueChange={(v) => setActive(v as Locale)}>
                <Tabs.List className="inline-flex rounded-md border border-ad-border bg-ad-bg p-0.5" aria-label="Dil">
                  {LOCALES.map((l) => {
                    const empty = !value[l]?.trim();
                    return (
                      <Tabs.Trigger
                        key={l}
                        value={l}
                        className="relative rounded px-2.5 py-1 text-xs font-medium text-ad-muted-fg transition-colors data-[state=active]:bg-ad-muted data-[state=active]:text-ad-fg"
                      >
                        {NAMES[l]}
                        {empty && (
                          <span
                            className={cn("absolute right-0.5 top-0.5 size-1.5 rounded-full", l === "az" && error ? "bg-ad-danger" : "bg-amber-400")}
                            title={l === "az" ? "Boşdur — tələb olunur" : "Tərcümə boşdur (AZ göstəriləcək)"}
                          />
                        )}
                      </Tabs.Trigger>
                    );
                  })}
                </Tabs.List>
              </Tabs.Root>
            </div>

            {kind === "input" && (
              <Input
                id={`${id}-${active}`}
                value={value[active] ?? ""}
                placeholder={placeholder}
                aria-invalid={active === "az" && !!error}
                onChange={(e) => set(active, e.target.value)}
                onBlur={field.onBlur}
              />
            )}
            {kind === "textarea" && (
              <Textarea
                id={`${id}-${active}`}
                rows={rows}
                value={value[active] ?? ""}
                placeholder={placeholder}
                aria-invalid={active === "az" && !!error}
                onChange={(e) => set(active, e.target.value)}
                onBlur={field.onBlur}
              />
            )}
            {kind === "custom" && renderEditor?.({ value: value[active] ?? "", onChange: (v) => set(active, v), locale: active })}

            <div className="flex items-baseline justify-between gap-3">
              {error ? (
                <p className="text-xs text-ad-danger" role="alert">
                  {error}
                </p>
              ) : (
                <span />
              )}
              {hint && <span className="text-xs text-ad-muted-fg">{hint}</span>}
            </div>
          </div>
        );
      }}
    />
  );
}

/** Pull the message for a localized field out of react-hook-form's nested errors. */
export function localizedError(err: unknown): string | undefined {
  if (!err || typeof err !== "object") return undefined;
  const e = err as { message?: string; az?: { message?: string } };
  return e.az?.message ?? e.message;
}
