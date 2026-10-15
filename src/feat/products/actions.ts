"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { ROUTES } from "@/lib/config";
import { getAdminContext } from "@/feat/sa933k-panel/admin-context";
import { PRODUCT_COLUMNS, productGallerySchema, type Product } from "./schema";

const identitySchema = z.object({
  id: z.number().int().positive().safe(),
  updated_at: z.iso.datetime({ offset: true }),
});
type SaveResult = { success: true; product: Product } | { success: false; error: string };

export async function saveProductAction(input: unknown, identity?: unknown): Promise<SaveResult> {
  const parsed = productGallerySchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };
  const original = identity === undefined ? undefined : identitySchema.safeParse(identity);
  if (original && !original.success)
    return { success: false, error: "Identitas produk tidak valid. Muat ulang halaman." };

  try {
    const { supabase, profile } = await getAdminContext();
    if (!profile)
      return { success: false, error: "Sesi pengelola tidak aktif. Silakan masuk kembali." };
    const categoryId = Number(parsed.data.category_id);
    const { data: category, error: categoryError } = await supabase
      .from("categories")
      .select("id, is_active")
      .eq("id", categoryId)
      .maybeSingle();
    if (categoryError || !category)
      return {
        success: false,
        error: "Kategori tidak tersedia. Muat ulang halaman dan pilih kategori lain.",
      };
    if (!category.is_active) {
      const existing = original?.success
        ? await supabase
            .from("products")
            .select("category_id")
            .eq("id", original.data.id)
            .maybeSingle()
        : null;
      if (!existing?.data || existing.data.category_id !== categoryId)
        return { success: false, error: "Pilih kategori yang masih aktif." };
    }

    const values = {
      ...parsed.data,
      category_id: categoryId,
      brand: parsed.data.brand || null,
      description: parsed.data.description || null,
      price: parsed.data.price ?? null,
      image_path: parsed.data.image_path || null,
      image_path_2: parsed.data.image_path_2 || null,
      image_path_3: parsed.data.image_path_3 || null,
    };
    const query = original?.success
      ? supabase
          .from("products")
          .update(
            Object.fromEntries(Object.entries(values).filter(([key]) => key !== "current_stock")),
          )
          .eq("id", original.data.id)
          .eq("updated_at", original.data.updated_at)
      : supabase.from("products").insert(values);
    const { data, error } = await query.select(PRODUCT_COLUMNS).single();
    if (error || !data) {
      const message =
        error?.code === "23505"
          ? "SKU atau slug sudah digunakan produk lain. Pilih nilai yang berbeda."
          : error?.code === "23503"
            ? "Kategori sudah tidak tersedia. Pilih kategori lain."
            : original?.success && error?.code === "PGRST116"
              ? "Produk sudah berubah atau tidak tersedia. Muat ulang halaman sebelum mengedit lagi."
              : "Produk gagal disimpan. Periksa data atau coba lagi.";
      return { success: false, error: message };
    }
    revalidatePath(ROUTES.panel.products);
    revalidatePath(ROUTES.catalog);
    revalidatePath(ROUTES.home);
    return { success: true, product: data as unknown as Product };
  } catch {
    return { success: false, error: "Tidak dapat menghubungi server. Silakan coba lagi." };
  }
}

export async function deleteProductAction(
  input: unknown,
): Promise<{ success: true; deletedId: number } | { success: false; error: string }> {
  const parsed = identitySchema.extend({ confirmed: z.literal(true) }).safeParse(input);
  if (!parsed.success)
    return { success: false, error: "Konfirmasi atau identitas produk tidak valid." };
  try {
    const { supabase, profile } = await getAdminContext();
    if (profile?.role !== "owner")
      return { success: false, error: "Hanya pemilik aktif yang dapat menghapus produk." };
    const { data, error } = await supabase
      .from("products")
      .delete()
      .eq("id", parsed.data.id)
      .eq("updated_at", parsed.data.updated_at)
      .select("id")
      .single();
    if (error || !data)
      return {
        success: false,
        error:
          error?.code === "23503"
            ? "Produk memiliki riwayat stok atau data terkait dan tidak dapat dihapus. Gunakan Edit produk lalu nonaktifkan agar riwayat tetap tersimpan."
            : "Produk telah berubah atau gagal dihapus. Muat ulang halaman dan coba lagi.",
      };
    revalidatePath(ROUTES.panel.products);
    revalidatePath(ROUTES.panel.categories);
    return { success: true, deletedId: data.id };
  } catch {
    return {
      success: false,
      error: "Tidak dapat menghubungi server. Periksa data sebelum mencoba lagi.",
    };
  }
}
