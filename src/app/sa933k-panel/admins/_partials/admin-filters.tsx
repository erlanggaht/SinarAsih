"use client";

import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import { Search } from "lucide-react";
import { createStringField } from "@/components/forms/custom-fields";
import { ErlangForm } from "@/components/forms/schema-form";

const schema = z.object({ query: z.string(), role: z.string() });
export type AdminFilters = z.infer<typeof schema>;
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

export function AdminFilterForm({ onChange }: { onChange: (filters: AdminFilters) => void }) {
  const form = useForm({
    defaultValues: { query: "", role: "" },
    listeners: { onChange: ({ formApi }) => onChange(formApi.state.values) },
  });
  return (
    <ErlangForm<AdminFilters>
      form={form}
      schema={schema}
      label="Filter pengelola"
      fieldConfig={{
        query: {
          label: "Cari pengelola",
          placeholder: "Cari nama, posisi, username, atau email...",
          component: SearchField,
          layout: { sm: 8 },
        },
        role: {
          label: "Peran",
          options: [
            { value: "", label: "Semua peran" },
            { value: "owner", label: "Pemilik" },
            { value: "staff", label: "Staf" },
          ],
          layout: { sm: 4 },
        },
      }}
    />
  );
}
