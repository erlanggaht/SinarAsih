"use client";

import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import { Search } from "lucide-react";
import { createStringField } from "@/components/forms/custom-fields";
import { ErlangForm } from "@/components/forms/schema-form";
import type { ProductCategory } from "@/feat/products/schema";

const schema = z.object({ query: z.string(), category: z.string() });
export type ProductFilters = z.infer<typeof schema>;
const SearchField = createStringField({
  type: "search",
  variant: "search",
  icon: (
    <Search
      className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-muted-foreground"
      aria-hidden="true"
    />
  ),
});

export function ProductFilterForm({
  categories,
  onChange,
}: {
  categories: ProductCategory[];
  onChange: (filters: ProductFilters) => void;
}) {
  const form = useForm({
    defaultValues: { query: "", category: "" },
    listeners: { onChange: ({ formApi }) => onChange(formApi.state.values) },
  });
  return (
    <ErlangForm<ProductFilters>
      form={form}
      schema={schema}
      label="Filter produk"
      fieldConfig={{
        query: {
          label: "Cari produk",
          placeholder: "Cari nama, SKU, atau merek...",
          component: SearchField,
          layout: { sm: 8 },
        },
        category: {
          label: "Kategori",
          options: [
            { value: "", label: "Semua kategori" },
            ...categories.map((category) => ({
              value: String(category.id),
              label: `${category.name}${category.is_active ? "" : " (nonaktif)"}`,
            })),
          ],
          layout: { sm: 4 },
        },
      }}
    />
  );
}
