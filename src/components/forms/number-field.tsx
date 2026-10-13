"use client";

import { useId } from "react";
import type { FieldComponentProps } from "erlangform";

export function createNumberField({
  step = "any",
  min = 0,
}: { step?: number | "any"; min?: number } = {}) {
  return function CustomNumberField<TValue extends number | undefined, TValues>({
    field,
    config,
  }: FieldComponentProps<TValue, TValues>) {
    const id = useId();
    const errors = field.state.meta.errors;
    const error = errors[0];
    const message =
      typeof error === "string"
        ? error
        : error && typeof error === "object" && "message" in error
          ? String(error.message)
          : "Periksa nilai kolom ini.";
    const values = field.form.state.values as TValues;
    return (
      <div>
        {config?.label && (
          <label htmlFor={id} className="sinar-form-label">
            {config.label}
          </label>
        )}
        <input
          id={id}
          name={field.name}
          type="number"
          min={min}
          step={step}
          value={field.state.value ?? ""}
          onChange={(event) =>
            field.handleChange(
              (event.target.value === "" ? undefined : event.target.valueAsNumber) as TValue,
            )
          }
          onBlur={() => field.handleBlur()}
          required={config?.requiredIf?.(values)}
          disabled={config?.disableIf?.(values)}
          readOnly={config?.readOnlyIf?.(values)}
          placeholder={config?.placeholder}
          aria-invalid={errors.length > 0}
          aria-describedby={
            [config?.description && `${id}-hint`, errors.length > 0 && `${id}-error`]
              .filter(Boolean)
              .join(" ") || undefined
          }
          className={`sinar-form-control ${config?.className ?? ""}`}
        />
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
  };
}

export const NumberField = createNumberField();
export { MoneyField } from "./money-field";
export const StockField = createNumberField({ step: 1 });
