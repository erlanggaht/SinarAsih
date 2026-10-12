"use client";

import { useForm } from "@tanstack/react-form";
import { useState } from "react";
import { z } from "zod";
import { logoutAction } from "@/feat/sa933k-panel/actions";
import { ErlangForm } from "./schema-form";

const logoutSchema = z.object({});

export function LogoutForm({
  className,
  buttonClassName,
  children,
}: {
  className?: string;
  buttonClassName: string;
  children: string;
}) {
  const [error, setError] = useState<string | null>(null);
  const form = useForm({
    defaultValues: {},
    onSubmit: async () => {
      setError(null);
      try {
        await logoutAction();
      } catch {
        setError("Gagal keluar dari akun. Silakan coba lagi.");
      }
    },
  });

  return (
    <ErlangForm form={form} schema={logoutSchema} className={className} label="Keluar dari akun">
      {error && (
        <p role="alert" className="text-sm text-error">
          {error}
        </p>
      )}
      <form.Subscribe selector={(state) => state.isSubmitting}>
        {(pending) => (
          <button
            type="submit"
            disabled={pending}
            className={`${buttonClassName} disabled:cursor-not-allowed disabled:opacity-60`}
          >
            {pending ? "Keluar..." : children}
          </button>
        )}
      </form.Subscribe>
    </ErlangForm>
  );
}
