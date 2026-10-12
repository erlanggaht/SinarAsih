"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { ROUTES } from "@/lib/config";
import { getAdminContext } from "@/feat/sa933k-panel/admin-context";
import { categorySchema, type Category } from "./schema";

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

    const values = { ...parsed.data, description: parsed.data.description || null };
    const query = categoryId?.success
      ? supabase
          .from("categories")
          .update({ ...values, updated_at: new Date().toISOString() })
          .eq("id", categoryId.data)
      : supabase.from("categories").insert(values);
    const { data, error } = await query.select("id, name, slug, description, is_active").single();

    if (error || !data) {
      const message =
        error?.code === "23505"
          ? "Nama atau slug kategori sudah digunakan. Pilih nilai lain."
          : "Kategori gagal disimpan. Periksa akses akun atau coba lagi.";
      return { success: false, error: message };
    }

    revalidatePath(ROUTES.panel.categories);
    return { success: true, category: data as Category };
  } catch {
    return { success: false, error: "Tidak dapat menghubungi server. Silakan coba lagi." };
  }
}
