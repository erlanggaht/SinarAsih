"use client";

import { useForm } from "@tanstack/react-form";
import { Search } from "lucide-react";
import { z } from "zod";
import { createStringField } from "./custom-fields";
import { ErlangForm } from "./schema-form";

const searchSchema = z.object({ query: z.string() });
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

export function CategorySearchForm({ onQueryChange }: { onQueryChange: (query: string) => void }) {
  const form = useForm({
    defaultValues: { query: "" },
    listeners: {
      onChange: ({ formApi }) => onQueryChange(formApi.state.values.query),
    },
  });

  return (
    <ErlangForm<z.infer<typeof searchSchema>>
      form={form}
      schema={searchSchema}
      label="Pencarian kategori"
      className="flex-1"
      fieldConfig={{
        query: {
          label: "Cari kategori perangkat",
          labelClassName: "sr-only",
          placeholder: "Cari kategori: laptop, smartphone, printer…",
          component: SearchField,
        },
      }}
    />
  );
}
