"use client";

import { useForm } from "@tanstack/react-form";
import { useState } from "react";
import type { FieldComponentProps } from "erlangform";
import { ErlangForm } from "@/components/forms/schema-form";
import { TextField } from "@/components/forms/custom-fields";
import { saveCategoryAction } from "@/feat/categories/actions";
import {
  categorySchema,
  categorySlug,
  type Category,
  type CategoryValues,
} from "@/feat/categories/schema";

function SlugField(props: FieldComponentProps<string, CategoryValues>) {
  return (
    <div>
      <TextField {...props} />
      <button
        type="button"
        className="mt-2 min-h-11 text-sm font-medium text-primary hover:underline focus-visible:outline-2 focus-visible:outline-ring"
        onClick={() => {
          const name = props.field.form.getFieldValue("name");
          const slug = categorySlug(name);
          props.field.handleChange(slug);
        }}
      >
        Buat slug dari nama
      </button>
    </div>
  );
}

export function CategoryForm({
  category,
  onSaved,
  onCancel,
  onPendingChange,
}: {
  category: Category | null;
  onSaved: (category: Category) => void;
  onCancel: () => void;
  onPendingChange: (pending: boolean) => void;
}) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const form = useForm({
    defaultValues: {
      name: category?.name ?? "",
      slug: category?.slug ?? "",
      description: category?.description ?? "",
      is_active: category?.is_active ?? true,
    } satisfies CategoryValues,
    validators: { onBlur: categorySchema, onSubmit: categorySchema },
    onSubmit: async ({ value }) => {
      setError(null);
      setPending(true);
      onPendingChange(true);
      try {
        const result = await saveCategoryAction(value, category?.id);
        if (!result.success) {
          setError(result.error);
          return;
        }
        form.reset();
        onSaved(result.category);
      } catch {
        setError("Kategori gagal disimpan. Silakan coba lagi.");
      } finally {
        setPending(false);
        onPendingChange(false);
      }
    },
  });

  return (
    <section
      aria-labelledby="category-form-title"
      className="border border-border bg-card p-5 text-card-foreground sm:p-6"
    >
      <h2 id="category-form-title" className="text-xl font-semibold">
        {category ? "Edit kategori" : "Tambah kategori"}
      </h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Lengkapi informasi kategori. Nama dan slug wajib diisi.
      </p>
      <ErlangForm<CategoryValues>
        form={form}
        schema={categorySchema}
        className="mt-6"
        label={category ? "Edit kategori" : "Tambah kategori"}
        disabled={pending}
        fieldConfig={{
          name: {
            label: "Nama kategori",
            placeholder: "Misalnya Laptop & Komputer",
            requiredIf: () => true,
          },
          slug: {
            label: "Slug",
            placeholder: "laptop-komputer",
            description: "Identitas unik kategori; gunakan huruf kecil, angka, dan tanda hubung.",
            requiredIf: () => true,
            component: SlugField,
          },
          description: {
            label: "Deskripsi (opsional)",
            type: "textarea",
            placeholder: "Jelaskan produk dalam kategori ini.",
          },
          is_active: {
            label: "Kategori aktif",
            description:
              "Kategori nonaktif disembunyikan dari katalog publik, termasuk produk di dalamnya.",
          },
        }}
      >
        {error && (
          <p role="alert" className="border border-error bg-error/10 px-4 py-3 text-sm text-error">
            {error}
          </p>
        )}
        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={pending}
            className="min-h-11 bg-primary px-5 py-3 text-sm font-medium text-primary-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-60"
          >
            {pending ? "Menyimpan..." : category ? "Simpan perubahan" : "Tambah kategori"}
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={onCancel}
            className="min-h-11 border border-border px-5 py-3 text-sm font-medium hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring"
          >
            Batal
          </button>
        </div>
      </ErlangForm>
    </section>
  );
}
