"use server";

import { revalidatePath } from "next/cache";
import { getAdminContext } from "@/feat/sa933k-panel/admin-context";
import { ROUTES } from "@/lib/config";
import { stockActionSchema } from "./schema";

const errors: Record<string, string> = {
  active_admin_required: "Sesi pengelola tidak aktif. Silakan masuk kembali.",
  invalid_stock_input: "Jumlah stok tidak valid.",
  product_not_found: "Produk tidak ditemukan. Muat ulang halaman.",
  stock_changed: "Stok sudah berubah. Tutup form dan muat ulang halaman sebelum mencoba lagi.",
  product_inactive: "Aktifkan produk terlebih dahulu melalui halaman Produk.",
  insufficient_stock: "Jumlah stok tidak boleh negatif.",
  stock_overflow: "Jumlah stok terlalu besar.",
  stock_unchanged: "Jumlah stok masih sama. Tidak ada perubahan yang perlu disimpan.",
  stock_request_conflict: "Tutup form dan muat ulang halaman sebelum mencoba lagi.",
};

export async function saveStockAction(
  input: unknown,
): Promise<{ success: true; stock: number } | { success: false; error: string }> {
  const parsed = stockActionSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };
  try {
    const { supabase, profile } = await getAdminContext();
    if (!profile) return { success: false, error: errors.active_admin_required };
    const value = parsed.data;
    const { data, error } = await supabase.rpc("record_stock_movement", {
      p_product_id: value.product_id,
      p_kind: "adjust",
      p_quantity: value.quantity,
      p_reason: "Perubahan jumlah stok",
      p_note: "",
      p_expected_stock: value.expected_stock,
      p_expected_updated_at: value.expected_updated_at,
      p_request_id: value.request_id,
      p_reversal_of: null,
    });
    if (error || !data)
      return {
        success: false,
        error:
          errors[error?.message ?? ""] ??
          "Stok belum dapat disimpan. Muat ulang halaman untuk memeriksa jumlah terbaru.",
      };
    for (const path of [ROUTES.panel.stock, ROUTES.panel.products, ROUTES.catalog, ROUTES.home])
      revalidatePath(path);
    return { success: true, stock: Number(data.stock_after) };
  } catch {
    return {
      success: false,
      error:
        "Koneksi terputus. Coba simpan kembali dari form ini atau muat ulang untuk memeriksa stok terbaru.",
    };
  }
}
