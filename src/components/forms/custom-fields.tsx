"use client";

import type { FieldComponentProps } from "erlangform";
import { useId, type HTMLInputAutoCompleteAttribute, type ReactNode } from "react";

type StringFieldOptions = {
  type?: "text" | "email" | "password" | "search" | "tel" | "url";
  autoComplete?: HTMLInputAutoCompleteAttribute;
  required?: boolean;
  variant?: "default" | "search" | "theme";
  icon?: ReactNode;
};

function errorMessage(error: unknown): string {
  if (typeof error === "string") return error;
  if (error && typeof error === "object" && "message" in error) {
    return String(error.message);
  }
  return "Periksa kembali nilai kolom ini.";
}

export function createStringField<TValue extends string = string>(
  options: StringFieldOptions = {},
) {
  return function CustomStringField<TValues>({
    field,
    config,
  }: FieldComponentProps<TValue, TValues>) {
    const id = useId();
    const errors = field.state.meta.errors;
    const values = field.form.state.values as TValues;
    const describedBy = [config?.description && `${id}-hint`, errors.length && `${id}-error`]
      .filter(Boolean)
      .join(" ");
    const controlProps = {
      id,
      name: field.name,
      value: field.state.value ?? "",
      onChange: (
        event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
      ) => field.handleChange(event.target.value as TValue),
      onBlur: () => field.handleBlur(),
      required: options.required || config?.requiredIf?.(values),
      disabled: config?.disableIf?.(values),
      "aria-invalid": errors.length > 0,
      "aria-describedby": describedBy || undefined,
      className: `sinar-form-control sinar-form-control--${options.variant ?? "default"} ${config?.className ?? ""}`,
    };

    return (
      <div className={options.variant === "theme" ? "flex items-center gap-3" : undefined}>
        {config?.label && (
          <label htmlFor={id} className={`sinar-form-label ${config.labelClassName ?? ""}`}>
            {config.label}
          </label>
        )}
        <div className={options.icon ? "relative" : undefined}>
          {options.icon}
          {config?.options ? (
            <select {...controlProps}>
              {config.options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          ) : config?.type === "textarea" ? (
            <textarea
              {...controlProps}
              placeholder={config.placeholder}
              readOnly={config.readOnlyIf?.(values)}
            />
          ) : (
            <input
              {...controlProps}
              type={options.type ?? (config?.type === "password" ? "password" : "text")}
              autoComplete={options.autoComplete}
              placeholder={config?.placeholder}
              readOnly={config?.readOnlyIf?.(values)}
            />
          )}
        </div>
        {config?.description && (
          <p id={`${id}-hint`} className="sinar-form-hint">
            {config.description}
          </p>
        )}
        {errors.length > 0 && (
          <p id={`${id}-error`} role="alert" className="sinar-form-error">
            {errorMessage(errors[0])}
          </p>
        )}
      </div>
    );
  };
}

export const TextField = createStringField();
export const EmailField = createStringField({
  type: "email",
  autoComplete: "email",
  required: true,
});
export const PasswordField = createStringField({
  type: "password",
  autoComplete: "current-password",
  required: true,
});
export const SelectField = createStringField();
