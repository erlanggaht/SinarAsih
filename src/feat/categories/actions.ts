"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { ROUTES } from "@/lib/config";
import { getAdminContext } from "@/feat/sa933k-panel/admin-context";
import { CATEGORY_COLUMNS, categorySchema, type Category } from "./schema";
import { categoryDeleteRequestSchema, type CategoryDeletePreview } from "./delete-schema";

type SaveResult = { success: true; category: Category } | { success: false; error: string };

export async function saveCategoryAction(input: unknown, id?: unknown): Promise<SaveResult> {
  const parsed = categorySchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

  const categoryId =
    id === undefined ? undefined : z.number().int().positive().safe().safeParse(id);
  if (categoryId && !categoryId.success)
    return { success: false, error: "ID kategori tidak valid." };

  try {
    const { supabase, profile } = await getAdminContext();
    if (!profile)
      return { success: false, error: "Sesi pengelola tidak aktif. Silakan masuk kembali." };

    const values = {
      ...parsed.data,
      description: parsed.data.description || null,
      image_path: parsed.data.image_path || null,
    };
    const query = categoryId?.success
      ? supabase
          .from("categories")
          .update({ ...values, updated_at: new Date().toISOString() })
          .eq("id", categoryId.data)
      : supabase.from("categories").insert(values);
    const { data, error } = await query.select(CATEGORY_COLUMNS).single();

    if (error || !data) {
      const message =
        error?.code === "23505"
          ? "Nama atau slug kategori sudah digunakan. Pilih nilai lain."
          : "Kategori gagal disimpan. Periksa akses akun atau coba lagi.";
      return { success: false, error: message };
    }

    revalidatePath(ROUTES.panel.categories);
    revalidatePath(ROUTES.home);
    revalidatePath(ROUTES.catalog);
    return { success: true, category: data as Category };
  } catch {
    return { success: false, error: "Tidak dapat menghubungi server. Silakan coba lagi." };
  }
}

export async function getCategoryDeletePreviewAction(
  id: unknown,
): Promise<{ success: true; preview: CategoryDeletePreview } | { success: false; error: string }> {
  const parsed = z.number().int().positive().safe().safeParse(id);
  if (!parsed.success) return { success: false, error: "ID kategori tidak valid." };
  try {
    const { supabase, profile } = await getAdminContext();
    if (profile?.role !== "owner")
      return { success: false, error: "Hanya pemilik aktif yang dapat menghapus kategori." };
    const [category, products, targets] = await Promise.all([
      supabase
        .from("categories")
        .select("id, name, updated_at")
        .eq("id", parsed.data)
        .maybeSingle(),
      supabase
        .from("products")
        .select("id", { count: "exact", head: true })
        .eq("category_id", parsed.data),
      supabase
        .from("categories")
        .select("id, name")
        .eq("is_active", true)
        .neq("id", parsed.data)
        .order("name"),
    ]);
    if (category.error || !category.data)
      return { success: false, error: "Kategori tidak tersedia. Muat ulang halaman." };
    if (products.error || targets.error || products.count === null)
      return { success: false, error: "Data pemindahan produk gagal dimuat. Silakan coba lagi." };
    return {
      success: true,
      preview: {
        category: category.data,
        productCount: products.count,
        targets: targets.data ?? [],
      },
    };
  } catch {
    return { success: false, error: "Tidak dapat menghubungi server. Silakan coba lagi." };
  }
}

export async function deleteCategoryAction(
  input: unknown,
): Promise<
  { success: true; deletedId: number; movedCount: number } | { success: false; error: string }
> {
  const parsed = categoryDeleteRequestSchema.safeParse(input);
  if (!parsed.success)
    return { success: false, error: "Konfirmasi atau kategori tujuan tidak valid." };
  try {
    const { supabase, profile } = await getAdminContext();
    if (profile?.role !== "owner")
      return { success: false, error: "Hanya pemilik aktif yang dapat menghapus kategori." };
    const { data, error } = await supabase.rpc("delete_category_and_move_products", {
      p_category_id: parsed.data.id,
      p_target_category_id: parsed.data.target_category_id,
      p_expected_updated_at: parsed.data.updated_at,
    });
    if (error) {
      const messages: Record<string, string> = {
        category_requires_target:
          "Kategori masih memiliki produk. Periksa lagi dan pilih kategori tujuan.",
        target_category_unavailable:
          "Kategori tujuan sudah tidak aktif atau tidak tersedia. Periksa lagi.",
        category_changed: "Kategori telah diubah pengelola lain. Periksa lagi sebelum menghapus.",
        category_not_found: "Kategori sudah tidak tersedia. Muat ulang halaman.",
      };
      return {
        success: false,
        error:
          messages[error.message] ??
          "Penghapusan belum dapat dipastikan. Muat ulang halaman untuk memeriksa data.",
      };
    }
    const result = z.object({ deleted_id: z.number(), moved_count: z.number() }).safeParse(data);
    if (!result.success)
      return {
        success: false,
        error: "Hasil penghapusan belum dapat dipastikan. Muat ulang halaman.",
      };
    revalidatePath(ROUTES.panel.categories);
    revalidatePath(ROUTES.panel.products);
    return {
      success: true,
      deletedId: result.data.deleted_id,
      movedCount: result.data.moved_count,
    };
  } catch {
    return {
      success: false,
      error: "Tidak dapat menghubungi server. Periksa data sebelum mencoba lagi.",
    };
  }
}
