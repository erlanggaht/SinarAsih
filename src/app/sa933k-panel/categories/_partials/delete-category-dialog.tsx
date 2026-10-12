"use client";

import { useEffect, useState } from "react";
import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import { ConfirmationDialog } from "@/components/confirmation-dialog";
import { ErlangForm } from "@/components/forms/schema-form";
import { deleteCategoryAction, getCategoryDeletePreviewAction } from "@/feat/categories/actions";
import {
  categoryDeleteFormSchema,
  type CategoryDeletePreview,
} from "@/feat/categories/delete-schema";
import type { Category } from "@/feat/categories/schema";

export function CategoryDeleteForm({
  preview,
  onClose,
  onDeleted,
  onBusyChange,
  onRetry,
}: {
  preview: CategoryDeletePreview;
  onClose: () => void;
  onDeleted: (id: number, movedCount: number) => void;
  onBusyChange: (busy: boolean) => void;
  onRetry: () => void;
}) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const schema = categoryDeleteFormSchema(preview.category.id, preview.productCount > 0);
  const form = useForm({
    defaultValues: { target_category_id: "", confirmed: false },
    validators: { onChange: schema, onSubmit: schema },
    onSubmit: async ({ value }) => {
      setPending(true);
      onBusyChange(true);
      setError(null);
      try {
        const result = await deleteCategoryAction({
          id: preview.category.id,
          updated_at: preview.category.updated_at,
          target_category_id: value.target_category_id ? Number(value.target_category_id) : null,
          confirmed: value.confirmed,
        });
        if (!result.success) {
          setError(result.error);
          return;
        }
        onDeleted(result.deletedId, result.movedCount);
      } catch {
        setError("Kategori gagal dihapus. Periksa data lalu coba lagi.");
      } finally {
        setPending(false);
        onBusyChange(false);
      }
    },
  });

  return (
    <>
      <p className="text-sm leading-6 text-muted-foreground">
        {preview.productCount > 0
          ? `Kategori ini memiliki ${preview.productCount} produk. Semua produk tersebut akan dipindahkan ke kategori tujuan sebelum kategori ini dihapus.`
          : "Kategori ini belum memiliki produk, sehingga tidak ada produk yang perlu dipindahkan."}
      </p>
      <p className="mt-3 text-sm font-medium text-error">
        Kategori akan dihapus permanen. Tindakan ini tidak dapat dibatalkan.
      </p>
      <ErlangForm<z.infer<typeof schema>>
        form={form}
        schema={schema}
        label="Pindahkan produk dan hapus kategori"
        className="mt-5"
        disabled={pending}
        fieldConfig={{
          target_category_id: {
            label: "Pindahkan produk ke kategori",
            description: "Produk tetap tersimpan; hanya kategori produknya yang berubah.",
            requiredIf: () => preview.productCount > 0,
            showIf: () => preview.productCount > 0,
            options: [
              { value: "", label: "Pilih kategori tujuan" },
              ...preview.targets.map((target) => ({
                value: String(target.id),
                label: target.name,
              })),
            ],
          },
          confirmed: { label: "Saya memahami dan ingin menghapus kategori ini." },
        }}
      >
        {error && (
          <div role="alert" className="border border-error bg-error/10 p-3 text-sm text-error">
            <p>{error}</p>
            <button type="button" onClick={onRetry} className="mt-2 min-h-11 font-medium underline">
              Periksa lagi
            </button>
          </div>
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
            {pending
              ? "Memproses..."
              : preview.productCount > 0
                ? "Pindahkan dan hapus"
                : "Hapus kategori"}
          </button>
        </div>
      </ErlangForm>
    </>
  );
}

export function DeleteCategoryDialog({
  category,
  onClose,
  onDeleted,
}: {
  category: Category;
  onClose: () => void;
  onDeleted: (id: number, movedCount: number) => void;
}) {
  const [preview, setPreview] = useState<CategoryDeletePreview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let cancelled = false;
    getCategoryDeletePreviewAction(category.id)
      .then((result) => {
        if (cancelled) return;
        if (result.success) setPreview(result.preview);
        else setError(result.error);
      })
      .catch(() => {
        if (!cancelled) setError("Data kategori gagal dimuat. Silakan coba lagi.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [category.id, attempt]);
  function retry() {
    setLoading(true);
    setError(null);
    setPreview(null);
    setAttempt((value) => value + 1);
  }

  return (
    <ConfirmationDialog
      title={`Hapus kategori "${preview?.category.name ?? category.name}"?`}
      busy={busy}
      onClose={onClose}
    >
      {loading ? (
        <p role="status" className="text-sm text-muted-foreground">
          Memeriksa produk dan kategori tujuan...
        </p>
      ) : error ? (
        <div role="alert">
          <p className="text-sm text-error">{error}</p>
          <button
            type="button"
            onClick={retry}
            className="mt-3 min-h-11 text-sm font-medium text-primary underline"
          >
            Coba lagi
          </button>
        </div>
      ) : (
        preview &&
        (preview.productCount > 0 && preview.targets.length === 0 ? (
          <>
            <p role="alert" className="text-sm leading-6 text-warning">
              Ada {preview.productCount} produk di kategori ini, tetapi belum ada kategori tujuan
              yang aktif. Batalkan dialog, lalu buat atau aktifkan kategori lain terlebih dahulu.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-4 min-h-11 border border-border px-4 py-3 text-sm font-medium"
            >
              Batal
            </button>
          </>
        ) : (
          <CategoryDeleteForm
            key={`${attempt}-${preview.category.updated_at}-${preview.productCount}`}
            preview={preview}
            onClose={onClose}
            onDeleted={onDeleted}
            onBusyChange={setBusy}
            onRetry={retry}
          />
        ))
      )}
    </ConfirmationDialog>
  );
}
