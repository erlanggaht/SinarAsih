"use client";

import Image from "next/image";
import { createContext, useContext, useEffect, useId, useState } from "react";
import type { FieldComponentProps } from "erlangform";
import type { ProductValues } from "@/feat/products/schema";
import { validateProductImage } from "@/feat/products/image-upload";
import { ProductImage } from "@/components/ProductImage";
import { TextField } from "./custom-fields";

export const ProductImageUploadContext = createContext<{
  file: File | null;
  setFile: (file: File | null) => void;
} | null>(null);

export function ProductImageField(props: FieldComponentProps<string, ProductValues>) {
  const upload = useContext(ProductImageUploadContext);
  const id = useId();
  const [preview, setPreview] = useState<{ file: File; url: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const file = upload?.file;
  useEffect(() => {
    if (!preview) return;
    return () => URL.revokeObjectURL(preview.url);
  }, [preview, file]);
  if (!upload) throw new Error("ProductImageField membutuhkan upload context.");
  return (
    <div className="space-y-4">
      <div className="relative aspect-4/3 max-w-sm overflow-hidden border border-border bg-white">
        {preview && preview.file === file ? (
          <Image
            src={preview.url}
            alt="Preview gambar yang dipilih"
            fill
            unoptimized
            className="object-contain p-4"
          />
        ) : (
          <ProductImage src={props.field.state.value || null} name="produk" />
        )}
      </div>
      <div>
        <label htmlFor={id} className="sinar-form-label">
          Upload gambar produk
        </label>
        <input
          id={id}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          aria-describedby={`${id}-hint`}
          className="sinar-form-control file:mr-3 file:border-0 file:bg-primary file:px-3 file:py-2 file:text-primary-foreground"
          onChange={async (event) => {
            const input = event.currentTarget;
            const selected = input.files?.[0];
            if (!selected) return;
            setError(null);
            const validation = validateProductImage(selected);
            if (validation) {
              setError(validation);
              input.value = "";
              return;
            }
            try {
              const bitmap = await createImageBitmap(selected);
              bitmap.close();
              setPreview({ file: selected, url: URL.createObjectURL(selected) });
              upload.setFile(selected);
            } catch {
              setError("File tidak dapat dibaca sebagai gambar. Pilih gambar lain.");
            }
            input.value = "";
          }}
        />
        <p id={`${id}-hint`} className="sinar-form-hint">
          JPG, PNG, atau WebP, maksimal 5 MB. Gambar diunggah saat produk disimpan.
        </p>
        {error && (
          <p role="alert" className="sinar-form-error">
            {error}
          </p>
        )}
        {file && (
          <div className="mt-2 flex flex-wrap items-center gap-3 text-sm">
            <span className="wrap-anywhere">{file.name}</span>
            <button
              type="button"
              onClick={() => {
                upload.setFile(null);
                setPreview(null);
                setError(null);
              }}
              className="min-h-11 text-primary hover:underline"
            >
              Batalkan pilihan gambar
            </button>
          </div>
        )}
      </div>
      <fieldset disabled={Boolean(file)} className="min-w-0 disabled:opacity-60">
        <TextField {...props} />
      </fieldset>
    </div>
  );
}
