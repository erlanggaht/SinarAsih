"use client";

import { useId, useState } from "react";
import type { FieldComponentProps } from "erlangform";
import {
  formatRupiahInput,
  formatRupiahValue,
  parseRupiahInput,
  rupiahCaretPosition,
} from "@/lib/rupiah";

export function MoneyField<TValue extends number | undefined, TValues>({
  field,
  config,
}: FieldComponentProps<TValue, TValues>) {
  const id = useId();
  const [editing, setEditing] = useState<{ value: number | undefined; text: string } | null>(null);
  const value =
    editing && editing.value === field.state.value
      ? editing.text
      : formatRupiahValue(field.state.value);
  const values = field.form.state.values as TValues;
  const errors = field.state.meta.errors;
  const error = errors[0];
  const message =
    typeof error === "string"
      ? error
      : error && typeof error === "object" && "message" in error
        ? String(error.message)
        : "Periksa harga yang diisi.";

  return (
    <div>
      {config?.label && (
        <label htmlFor={id} className="sinar-form-label">
          {config.label}
        </label>
      )}
      <div className="relative">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm text-muted-foreground"
        >
          Rp
        </span>
        <input
          id={id}
          name={field.name}
          type="text"
          inputMode="decimal"
          maxLength={20}
          value={value}
          placeholder={config?.placeholder}
          required={config?.requiredIf?.(values)}
          disabled={config?.disableIf?.(values)}
          readOnly={config?.readOnlyIf?.(values)}
          aria-invalid={errors.length > 0}
          aria-describedby={
            [config?.description && `${id}-hint`, errors.length > 0 && `${id}-error`]
              .filter(Boolean)
              .join(" ") || undefined
          }
          className={`sinar-form-control sinar-form-control--money ${config?.className ?? ""}`}
          onChange={(event) => {
            const input = event.currentTarget;
            const logicalPosition = input.value
              .slice(0, input.selectionStart ?? input.value.length)
              .replace(/[^0-9,]/g, "").length;
            const text = formatRupiahInput(input.value);
            const number = parseRupiahInput(text);
            setEditing({ value: number, text });
            field.handleChange(number as TValue);
            requestAnimationFrame(() => {
              if (document.activeElement === input) {
                const position = rupiahCaretPosition(text, logicalPosition);
                input.setSelectionRange(position, position);
              }
            });
          }}
          onBlur={() => {
            setEditing(null);
            field.handleBlur();
          }}
        />
      </div>
      {config?.description && (
        <p id={`${id}-hint`} className="sinar-form-hint">
          {config.description}
        </p>
      )}
      {errors.length > 0 && (
        <p id={`${id}-error`} role="alert" className="sinar-form-error">
          {message}
        </p>
      )}
    </div>
  );
}
