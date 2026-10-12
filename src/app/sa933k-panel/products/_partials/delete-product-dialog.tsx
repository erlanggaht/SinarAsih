"use client";

import { useForm } from "@tanstack/react-form";
import { useState } from "react";
import { z } from "zod";
import { ConfirmationDialog } from "@/components/confirmation-dialog";
import { ErlangForm } from "@/components/forms/schema-form";
import { deleteProductAction } from "@/feat/products/actions";
import type { Product } from "@/feat/products/schema";

const schema = z.object({
  confirmed: z.boolean().refine((value) => value, "Centang konfirmasi sebelum menghapus produk."),
});

export function DeleteProductDialog({
  product,
  onClose,
  onDeleted,
}: {
  product: Product;
  onClose: () => void;
  onDeleted: (id: number) => void;
}) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const form = useForm({
    defaultValues: { confirmed: false },
    validators: { onChange: schema, onSubmit: schema },
    onSubmit: async ({ value }) => {
      setPending(true);
      setError(null);
      try {
        const result = await deleteProductAction({
          id: product.id,
          updated_at: product.updated_at,
          confirmed: value.confirmed,
        });
        if (!result.success) {
          setError(result.error);
          return;
        }
        onDeleted(result.deletedId);
      } catch {
        setError("Produk gagal dihapus. Periksa data lalu coba lagi.");
      } finally {
        setPending(false);
      }
    },
  });

  return (
    <ConfirmationDialog title={`Hapus produk "${product.name}"?`} busy={pending} onClose={onClose}>
      <p className="text-sm leading-6 text-muted-foreground">
        Produk dengan SKU <span className="font-medium text-foreground">{product.sku}</span> akan
        dihapus permanen, termasuk data stok {product.current_stock} unit. Tindakan ini tidak dapat
        dibatalkan.
      </p>
      <ErlangForm<z.infer<typeof schema>>
        form={form}
        schema={schema}
        label="Konfirmasi hapus produk"
        className="mt-5"
        disabled={pending}
        fieldConfig={{ confirmed: { label: "Saya memahami dan ingin menghapus produk ini." } }}
      >
        {error && (
          <p role="alert" className="border border-error bg-error/10 p-3 text-sm text-error">
            {error}
          </p>
        )}
        <div className="flex flex-wrap justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={pending}
            className="min-h-11 border border-border px-4 py-3 text-sm font-medium hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={pending}
            className="min-h-11 bg-error px-4 py-3 text-sm font-medium text-error-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:opacity-60"
          >
            {pending ? "Menghapus..." : "Hapus permanen"}
          </button>
        </div>
      </ErlangForm>
    </ConfirmationDialog>
  );
}
