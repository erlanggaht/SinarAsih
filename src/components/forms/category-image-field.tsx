"use client";

import Image from "next/image";
import { createContext, useContext, useEffect, useId, useState } from "react";
import type { FieldComponentProps } from "erlangform";
import { ProductImage } from "@/components/ProductImage";
import { validateProductImage } from "@/feat/products/image-upload";
import type { CategoryValues } from "@/feat/categories/schema";
import { TextField } from "./custom-fields";

export const CategoryImageUploadContext = createContext<{
  file: File | null;
  setFile: (file: File | null) => void;
} | null>(null);

export function CategoryImageField(props: FieldComponentProps<string, CategoryValues>) {
  const upload = useContext(CategoryImageUploadContext);
  const id = useId();
  const [preview, setPreview] = useState<{ file: File; url: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    if (!preview) return;
    return () => URL.revokeObjectURL(preview.url);
  }, [preview]);
  if (!upload) throw new Error("CategoryImageField membutuhkan upload context.");
  const clearSelection = () => {
    upload.setFile(null);
    setPreview(null);
    setError(null);
  };
  return (
    <div className="space-y-4">
      <div className="relative aspect-4/3 max-w-sm overflow-hidden border border-border bg-white">
        {preview && preview.file === upload.file ? (
          <Image
            src={preview.url}
            alt="Preview gambar kategori"
            fill
            unoptimized
            className="object-contain p-5"
          />
        ) : (
          <ProductImage
            src={props.field.state.value || null}
            name={props.field.form.getFieldValue("name") || "kategori"}
          />
        )}
      </div>
      <div>
        <label htmlFor={id} className="sinar-form-label">
          Upload gambar kategori
        </label>
        <input
          id={id}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          aria-describedby={`${id}-hint`}
          className="sinar-form-control file:mr-3 file:border-0 file:bg-primary file:px-3 file:py-2 file:text-primary-foreground"
          onChange={async (event) => {
            const selected = event.currentTarget.files?.[0];
            event.currentTarget.value = "";
            if (!selected) return;
            const invalid = validateProductImage(selected);
            if (invalid) {
              setError(invalid);
              return;
            }
            try {
              const bitmap = await createImageBitmap(selected);
              bitmap.close();
              setPreview({ file: selected, url: URL.createObjectURL(selected) });
              upload.setFile(selected);
              setError(null);
            } catch {
              setError("File tidak dapat dibaca sebagai gambar. Pilih gambar lain.");
            }
          }}
        />
        <p id={`${id}-hint`} className="sinar-form-hint">
          JPG, PNG, atau WebP, maksimal 5 MB. Gambar diunggah saat kategori disimpan.
        </p>
        {error && (
          <p role="alert" className="sinar-form-error">
            {error}
          </p>
        )}
        {(upload.file || props.field.state.value) && (
          <div className="flex flex-wrap items-center gap-3 text-sm">
            {upload.file && (
              <>
                <span className="wrap-anywhere">{upload.file.name}</span>
                <button
                  type="button"
                  onClick={clearSelection}
                  className="min-h-11 text-primary hover:underline"
                >
                  Batalkan pilihan gambar
                </button>
              </>
            )}
            <button
              type="button"
              onClick={() => {
                clearSelection();
                props.field.handleChange("");
              }}
              className="min-h-11 text-primary hover:underline"
            >
              Hapus gambar kategori
            </button>
          </div>
        )}
      </div>
      <fieldset disabled={Boolean(upload.file)} className="min-w-0 disabled:opacity-60">
        <TextField {...props} />
      </fieldset>
    </div>
  );
}
