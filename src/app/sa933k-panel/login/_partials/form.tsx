"use client";

import { useForm } from "@tanstack/react-form";
import { loginAction, type LoginState } from "@/feat/sa933k-panel/actions";
import { startTransition, useActionState } from "react";
import { EmailField, PasswordField } from "@/components/forms/custom-fields";
import { ErlangForm } from "@/components/forms/schema-form";
import { loginSchema, type LoginValues } from "@/feat/sa933k-panel/schema";

const initialState: LoginState = {
  error: null,
};

export function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, initialState);
  const form = useForm({
    defaultValues: { email: "", password: "" } satisfies LoginValues,
    validators: { onBlur: loginSchema, onSubmit: loginSchema },
    onSubmit: ({ value }) => {
      const data = new FormData();
      data.set("email", value.email.trim());
      data.set("password", value.password);
      startTransition(() => formAction(data));
    },
  });

  return (
    <ErlangForm<LoginValues>
      form={form}
      schema={loginSchema}
      className="mt-8"
      label="Login pengelola"
      disabled={pending}
      fieldConfig={{
        email: { label: "Email", component: EmailField },
        password: { label: "Password", component: PasswordField },
      }}
    >
      {state.error && (
        <p
          role="alert"
          aria-live="polite"
          className="border border-error bg-error/10 px-4 py-3 text-sm text-error"
        >
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="min-h-11 w-full bg-primary px-4 py-3 font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Memeriksa akun..." : "Masuk sebagai pengelola"}
      </button>
    </ErlangForm>
  );
}
