"use client";

import { useForm } from "@tanstack/react-form";
import { useState } from "react";
import type { FieldComponentProps } from "erlangform";
import { ErlangForm } from "@/components/forms/schema-form";
import { TextField } from "@/components/forms/custom-fields";
import { MoneyField, StockField } from "@/components/forms/number-field";
import {
  ProductImageField,
  ProductImageUploadContext,
} from "@/components/forms/product-image-field";
import { createClient } from "@/lib/supabase/client";
import {
  PRODUCT_IMAGE_BUCKET,
  PRODUCT_IMAGE_TYPES,
  validateProductImage,
} from "@/feat/products/image-upload";
import { saveProductAction } from "@/feat/products/actions";
import {
  productSchema,
  productSlug,
  type Product,
  type ProductCategory,
  type ProductValues,
} from "@/feat/products/schema";

function SlugField(props: FieldComponentProps<string, ProductValues>) {
  return (
    <div>
      <TextField {...props} />
      <button
        type="button"
        onClick={() =>
          props.field.handleChange(productSlug(props.field.form.getFieldValue("name")))
        }
        className="mt-2 min-h-11 text-sm font-medium text-primary hover:underline focus-visible:outline-2 focus-visible:outline-ring"
      >
        Buat slug dari nama
      </button>
    </div>
  );
}

export function ProductForm({
  product,
  categories,
  onSaved,
  onCancel,
  onPendingChange,
}: {
  product: Product | null;
  categories: ProductCategory[];
  onSaved: (product: Product) => void;
  onCancel: () => void;
  onPendingChange: (pending: boolean) => void;
}) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const categoryOptions = [
    { value: "", label: "Pilih kategori" },
    ...categories
      .filter((category) => category.is_active || category.id === product?.category_id)
      .map((category) => ({
        value: String(category.id),
        label: `${category.name}${category.is_active ? "" : " (nonaktif)"}`,
      })),
  ];
  const form = useForm({
    defaultValues: {
      name: product?.name ?? "",
      sku: product?.sku ?? "",
      slug: product?.slug ?? "",
      category_id: product ? String(product.category_id) : "",
      brand: product?.brand ?? "",
      description: product?.description ?? "",
      price: product?.price ?? undefined,
      current_stock: product?.current_stock ?? 0,
      minimum_stock: product?.minimum_stock ?? 0,
      image_path: product?.image_path ?? "",
      is_active: product?.is_active ?? true,
    } as ProductValues,
    validators: { onBlur: productSchema, onSubmit: productSchema },
    onSubmit: async ({ value }) => {
      setError(null);
      setPending(true);
      onPendingChange(true);
      try {
        let imagePath = value.image_path;
        if (imageFile) {
          const invalid = validateProductImage(imageFile);
          if (invalid) {
            setError(invalid);
            return;
          }
          setUploading(true);
          const supabase = createClient();
          const { data: userData, error: userError } = await supabase.auth.getUser();
          if (userError || !userData.user) {
            setError("Sesi telah berakhir. Silakan masuk kembali sebelum upload.");
            return;
          }
          const category = categories.find((item) => item.id === Number(value.category_id));
          const categoryFolder = category ? productSlug(category.name) : "";
          if (!categoryFolder) {
            setError("Kategori tidak tersedia. Pilih kategori produk yang valid sebelum upload.");
            return;
          }
          const path = `${categoryFolder}/${value.slug.trim()}-${value.sku.trim()}/${crypto.randomUUID()}.${PRODUCT_IMAGE_TYPES[imageFile.type]}`;
          const { error: uploadError } = await supabase.storage
            .from(PRODUCT_IMAGE_BUCKET)
            .upload(path, imageFile, {
              upsert: false,
              contentType: imageFile.type,
              cacheControl: "3600",
            });
          if (uploadError) {
            setError("Gambar gagal diunggah. Periksa koneksi dan akses Storage, lalu coba lagi.");
            return;
          }
          imagePath = supabase.storage.from(PRODUCT_IMAGE_BUCKET).getPublicUrl(path).data.publicUrl;
          form.setFieldValue("image_path", imagePath);
          setImageFile(null);
          setUploading(false);
        }
        const result = await saveProductAction(
          { ...value, image_path: imagePath },
          product ? { id: product.id, updated_at: product.updated_at } : undefined,
        );
        if (!result.success) {
          setError(result.error);
          return;
        }
        onSaved(result.product);
      } catch {
        setError("Produk gagal disimpan. Silakan coba lagi.");
      } finally {
        setUploading(false);
        setPending(false);
        onPendingChange(false);
      }
    },
  });

  return (
    <section
      aria-labelledby="product-form-title"
      className="border border-border bg-card p-5 text-card-foreground sm:p-8"
    >
      <h2 id="product-form-title" className="text-2xl font-semibold">
        {product ? "Edit produk" : "Tambah produk"}
      </h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Isi informasi produk dan pilih kategori yang sesuai. Nama, SKU, slug, dan kategori wajib
        diisi.
      </p>
      {product &&
        !categories.find((category) => category.id === product.category_id)?.is_active && (
          <p className="mt-4 border border-warning bg-warning/10 p-3 text-sm text-warning">
            Kategori produk ini nonaktif sehingga produk tidak terlihat di katalog publik. Pilih
            kategori aktif jika ingin menampilkannya.
          </p>
        )}
      <ProductImageUploadContext.Provider value={{ file: imageFile, setFile: setImageFile }}>
        <ErlangForm<ProductValues>
          form={form}
          schema={productSchema}
          className="mt-8"
          label={product ? "Edit produk" : "Tambah produk"}
          disabled={pending}
          sectionConfig={{
            information: { title: "Informasi produk", collapsible: false },
            inventory: { title: "Harga dan stok", collapsible: false },
            catalog: { title: "Tampilan katalog", collapsible: false },
          }}
          fieldConfig={{
            name: {
              label: "Nama produk",
              placeholder: "Misalnya ASUS Vivobook 14",
              requiredIf: () => true,
              section: "information",
              layout: { sm: 6 },
            },
            sku: {
              label: "SKU",
              placeholder: "LAP-ASUS-001",
              description: "Kode unik produk: huruf besar, angka, dan tanda hubung.",
              requiredIf: () => true,
              section: "information",
              layout: { sm: 6 },
            },
            slug: {
              label: "Slug",
              placeholder: "asus-vivobook-14",
              description: "Identitas produk yang unik, dengan huruf kecil dan tanda hubung.",
              requiredIf: () => true,
              component: SlugField,
              section: "information",
              layout: { sm: 6 },
            },
            category_id: {
              label: "Kategori",
              options: categoryOptions,
              requiredIf: () => true,
              section: "information",
              layout: { sm: 6 },
            },
            brand: { label: "Merek (opsional)", placeholder: "ASUS", section: "information" },
            description: {
              label: "Deskripsi (opsional)",
              type: "textarea",
              placeholder: "Spesifikasi, kondisi, atau informasi penting produk.",
              section: "information",
            },
            price: {
              label: "Harga (Rp, opsional)",
              placeholder: "6500000",
              description: "Kosongkan jika harga belum ditentukan. Angka 0 berarti harga nol.",
              component: MoneyField,
              section: "inventory",
              layout: { sm: 12 },
            },
            current_stock: {
              label: product ? "Stok saat ini" : "Stok awal",
              description: "Jumlah unit yang tersedia.",
              component: StockField,
              requiredIf: () => true,
              section: "inventory",
              layout: { sm: 6 },
            },
            minimum_stock: {
              label: "Batas stok minimum",
              description: "Stok pada batas ini atau di bawahnya ditandai perlu ditambah.",
              component: StockField,
              requiredIf: () => true,
              section: "inventory",
              layout: { sm: 6 },
            },
            image_path: {
              component: ProductImageField,
              label: "URL/path gambar (opsional)",
              placeholder: "/products/asusLaptop.png",
              description: "Masukkan path gambar lokal atau URL HTTPS gambar yang sudah tersedia.",
              section: "catalog",
            },
            is_active: {
              label: "Produk aktif",
              description:
                "Produk tampil di katalog publik jika produk dan kategorinya sama-sama aktif.",
              section: "catalog",
            },
          }}
        >
          {error && (
            <p
              role="alert"
              className="border border-error bg-error/10 px-4 py-3 text-sm text-error"
            >
              {error}
            </p>
          )}
          <div className="flex flex-wrap gap-3 border-t border-border pt-5">
            <button
              type="submit"
              disabled={pending}
              className="min-h-11 bg-primary px-5 py-3 text-sm font-medium text-primary-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-60"
            >
              {uploading
                ? "Mengunggah gambar..."
                : pending
                  ? "Menyimpan..."
                  : product
                    ? "Simpan perubahan"
                    : "Tambah produk"}
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
      </ProductImageUploadContext.Provider>
    </section>
  );
}
