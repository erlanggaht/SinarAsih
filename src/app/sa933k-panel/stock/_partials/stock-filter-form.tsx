"use client";

import { useForm } from "@tanstack/react-form";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTransition } from "react";
import { ErlangForm } from "@/components/forms/schema-form";
import { createStringField } from "@/components/forms/custom-fields";
import { stockFilterSchema, type StockFilters } from "@/feat/stock/filters";
import { ROUTES } from "@/lib/config";

const SearchField = createStringField({ type: "search" });
export function StockFilterForm({ filters }: { filters: StockFilters }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const form = useForm({
    defaultValues: filters,
    validators: { onSubmit: stockFilterSchema },
    onSubmit: ({ value }) => {
      const params = new URLSearchParams();
      if (value.q.trim()) params.set("q", value.q.trim());
      startTransition(() => router.push(`${ROUTES.panel.stock}?${params}`));
    },
  });
  return (
    <ErlangForm<StockFilters>
      form={form}
      schema={stockFilterSchema}
      label="Cari produk"
      disabled={pending}
      className="mt-6 max-w-xl [&>fieldset]:grid [&>fieldset]:grid-cols-[minmax(0,1fr)_auto] [&>fieldset]:items-start [&>fieldset]:space-y-0 [&>fieldset]:gap-x-3 [&>fieldset]:gap-y-2"
      fieldConfig={{
        q: { label: "Cari produk", placeholder: "Nama produk atau SKU", component: SearchField },
      }}
    >
      <div className="pt-7">
        <button
          disabled={pending}
          type="submit"
          className="min-h-11 bg-brand-accent px-5 py-2 text-sm font-medium text-white hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:opacity-60"
        >
          {pending ? "Mencari..." : "Cari"}
        </button>
      </div>
      {filters.q && (
        <Link
          href={ROUTES.panel.stock}
          className="col-span-2 inline-flex min-h-11 items-center justify-self-start text-sm underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          Hapus pencarian
        </Link>
      )}
    </ErlangForm>
  );
}
