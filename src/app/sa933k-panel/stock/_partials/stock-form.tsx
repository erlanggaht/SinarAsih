"use client";

import { useForm } from "@tanstack/react-form";
import { useEffect, useRef, useState } from "react";
import { ConfirmationDialog } from "@/components/confirmation-dialog";
import { ErlangForm } from "@/components/forms/schema-form";
import { StockField } from "@/components/forms/number-field";
import { saveStockAction } from "@/feat/stock/actions";
import { stockFormSchema, type StockFormValues, type StockProduct } from "@/feat/stock/schema";

export function StockForm({
  product,
  onSaved,
  onCancel,
  onPendingChange,
}: {
  product: StockProduct;
  onSaved: (stock: number) => void;
  onCancel: () => void;
  onPendingChange: (pending: boolean) => void;
}) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [requestId] = useState(() => crypto.randomUUID());
  const container = useRef<HTMLDivElement>(null);
  useEffect(() => {
    container.current?.querySelector<HTMLInputElement>('input[type="number"]')?.select();
  }, []);
  const form = useForm({
    defaultValues: { quantity: product.current_stock } satisfies StockFormValues,
    validators: { onBlur: stockFormSchema, onSubmit: stockFormSchema },
    onSubmit: async ({ value }) => {
      if (pending) return;
      if (value.quantity === product.current_stock) {
        onCancel();
        return;
      }
      setError(null);
      setPending(true);
      onPendingChange(true);
      try {
        const result = await saveStockAction({
          ...value,
          product_id: product.id,
          expected_stock: product.current_stock,
          expected_updated_at: product.updated_at,
          request_id: requestId,
        });
        if (!result.success) {
          setError(result.error);
          return;
        }
        onSaved(result.stock);
      } catch {
        setError("Stok belum dapat disimpan. Periksa koneksi lalu coba lagi.");
      } finally {
        setPending(false);
        onPendingChange(false);
      }
    },
  });
  return (
    <ConfirmationDialog
      title="Ubah stok"
      busy={pending}
      onClose={onCancel}
      closeLabel="Tutup ubah stok"
    >
      <div ref={container}>
        <p className="font-semibold wrap-anywhere">{product.name}</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Stok sekarang: {product.current_stock} unit.
        </p>
        <ErlangForm<StockFormValues>
          form={form}
          schema={stockFormSchema}
          disabled={pending}
          label="Ubah jumlah stok"
          className="mt-5"
          fieldConfig={{
            quantity: {
              label: "Jumlah stok",
              component: StockField,
              requiredIf: () => true,
              description: "Isi jumlah barang yang tersedia sekarang. Isi 0 jika habis.",
            },
          }}
        >
          {error && (
            <p role="alert" className="text-sm text-error">
              {error}
            </p>
          )}
          <div className="flex flex-wrap justify-end gap-3 border-t border-border pt-4">
            <button
              type="button"
              disabled={pending}
              onClick={onCancel}
              className="min-h-11 border border-input px-5 py-3 text-sm font-medium hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:opacity-60"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={pending}
              className="min-h-11 bg-brand-accent px-5 py-3 text-sm font-medium text-white hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:opacity-60"
            >
              {pending ? "Menyimpan..." : "Simpan stok"}
            </button>
          </div>
        </ErlangForm>
      </div>
    </ConfirmationDialog>
  );
}
