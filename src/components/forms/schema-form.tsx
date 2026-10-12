"use client";

import { ErlForm } from "erlangform";
import type { ComponentProps, ReactNode } from "react";
import { CheckboxField, TextField } from "./custom-fields";
import { NumberField } from "./number-field";

type SchemaFormProps<TValues> = ComponentProps<typeof ErlForm<TValues>> & {
  children?: ReactNode;
  className?: string;
  label?: string;
  disabled?: boolean;
};

export function ErlangForm<TValues = Record<string, unknown>>({
  form,
  children,
  className = "",
  label,
  disabled = false,
  fieldComponent,
  ...props
}: SchemaFormProps<TValues>) {
  return (
    <form
      aria-label={label}
      aria-busy={disabled}
      noValidate
      className={`sinar-form ${className}`}
      onSubmit={async (event) => {
        event.preventDefault();
        if (disabled || form.state.isSubmitting) return;
        const element = event.currentTarget;
        await form.handleSubmit();
        element.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
      }}
    >
      <fieldset disabled={disabled} className="min-w-0 space-y-5">
        <ErlForm<TValues>
          {...props}
          form={form}
          fieldComponent={{
            string: TextField,
            boolean: CheckboxField,
            number: NumberField,
            ...fieldComponent,
          }}
        />
        {children}
      </fieldset>
    </form>
  );
}
