import { z } from "zod";

const stock = z
  .number({ error: "Masukkan jumlah stok." })
  .int("Stok harus bilangan bulat.")
  .min(0, "Stok tidak boleh negatif.")
  .max(2147483647, "Jumlah stok terlalu besar.");

export const productSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Nama produk wajib diisi.")
    .max(200, "Nama maksimal 200 karakter."),
  sku: z
    .string()
    .trim()
    .min(1, "SKU wajib diisi.")
    .max(100, "SKU maksimal 100 karakter.")
    .regex(
      /^[A-Z0-9]+(?:-[A-Z0-9]+)*$/,
      "Gunakan huruf besar, angka, dan tanda hubung, misalnya LAP-ASUS-001.",
    ),
  slug: z
    .string()
    .trim()
    .min(1, "Slug wajib diisi.")
    .max(220, "Slug maksimal 220 karakter.")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Gunakan huruf kecil, angka, dan tanda hubung."),
  category_id: z
    .string()
    .regex(/^[1-9]\d*$/, "Pilih kategori produk.")
    .refine((value) => Number.isSafeInteger(Number(value)), "Kategori tidak valid."),
  brand: z.string().trim().max(120, "Merek maksimal 120 karakter."),
  description: z.string().trim().max(5000, "Deskripsi maksimal 5.000 karakter."),
  price: z
    .number({ error: "Masukkan harga yang valid." })
    .min(0, "Harga tidak boleh negatif.")
    .max(9999999999.99, "Harga terlalu besar.")
    .refine(
      (value) => Math.abs(value * 100 - Math.round(value * 100)) < 0.0001,
      "Harga maksimal dua angka desimal.",
    )
    .optional(),
  current_stock: stock,
  minimum_stock: stock,
  image_path: z
    .string()
    .trim()
    .max(2000, "Alamat gambar terlalu panjang.")
    .refine((value) => {
      if (!value) return true;
      if (value.startsWith("/") && !value.startsWith("//") && !value.includes("\\")) return true;
      try {
        return new URL(value).protocol === "https:";
      } catch {
        return false;
      }
    }, "Gunakan URL HTTPS atau path lokal yang diawali /, misalnya /products/asusLaptop.png."),
  is_active: z.boolean(),
});

export type ProductValues = z.infer<typeof productSchema>;
export type Product = Omit<
  ProductValues,
  "category_id" | "brand" | "description" | "price" | "image_path"
> & {
  id: number;
  category_id: number;
  brand: string | null;
  description: string | null;
  price: number | null;
  image_path: string | null;
  updated_at: string;
};
export type ProductCategory = { id: number; name: string; is_active: boolean };

export const PRODUCT_COLUMNS =
  "id, category_id, sku, name, slug, brand, description, price, current_stock, minimum_stock, image_path, is_active, updated_at";

export function productSlug(name: string) {
  return name
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function formatProductPrice(price: number | null) {
  return price === null
    ? "Belum diisi"
    : new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }).format(price);
}
