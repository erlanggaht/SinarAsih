"use server";

import { revalidatePath } from "next/cache";
import { getAdminContext } from "@/feat/sa933k-panel/admin-context";
import { ROUTES } from "@/lib/config";
import {
  adminProfileSchema,
  createAdminSchema,
  profileIdentitySchema,
  type AdminProfile,
} from "./schema";

type SaveResult = { success: true; profile: AdminProfile } | { success: false; error: string };

function refreshProfiles() {
  for (const path of [
    ROUTES.panel.admins,
    ROUTES.panel.profile,
    ROUTES.panel.dashboard,
    ROUTES.team,
  ])
    revalidatePath(path);
}

export async function saveAdminProfileAction(
  input: unknown,
  identity: unknown,
): Promise<SaveResult> {
  const parsed = adminProfileSchema.safeParse(input);
  const original = profileIdentitySchema.safeParse(identity);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };
  if (!original.success)
    return { success: false, error: "Profil tidak valid. Muat ulang halaman." };
  try {
    const { supabase, profile } = await getAdminContext();
    if (!profile || (profile.user_id !== original.data.user_id && profile.role !== "owner"))
      return { success: false, error: "Anda tidak memiliki akses mengubah profil ini." };
    const values = parsed.data;
    const { data, error } = await supabase
      .rpc("save_admin_profile", {
        p_user_id: original.data.user_id,
        p_updated_at: original.data.updated_at,
        p_full_name: values.full_name,
        p_position: values.position,
        p_username: values.username,
        p_image_path: values.image_path,
        p_whatsapp: values.whatsapp,
        p_instagram: values.instagram,
        p_role: values.role,
        p_is_active: values.is_active,
      })
      .single();
    if (error || !data)
      return {
        success: false,
        error:
          error?.code === "23505"
            ? "Username sudah digunakan akun lain."
            : error?.code === "40001"
              ? "Profil sudah berubah. Muat ulang halaman sebelum mengedit kembali."
              : "Profil gagal disimpan. Periksa data dan hak akses Anda.",
      };
    refreshProfiles();
    return { success: true, profile: data as AdminProfile };
  } catch {
    return { success: false, error: "Server belum dapat dihubungi. Silakan coba kembali." };
  }
}

export async function createAdminAction(input: unknown): Promise<SaveResult> {
  const parsed = createAdminSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };
  try {
    const { supabase, profile } = await getAdminContext();
    if (profile?.role !== "owner")
      return { success: false, error: "Hanya pemilik aktif yang dapat menambah pengelola." };
    const { data, error } = await supabase.functions.invoke("create-admin", { body: parsed.data });
    if (error || !data?.success) {
      let message = data?.error;
      if (error && "context" in error && error.context instanceof Response) {
        const response = await error.context.json().catch(() => null);
        message = response?.error;
      }
      return {
        success: false,
        error:
          typeof message === "string"
            ? message
            : "Akun gagal dibuat. Periksa email, username, dan password.",
      };
    }
    refreshProfiles();
    return { success: true, profile: data.profile as AdminProfile };
  } catch {
    return { success: false, error: "Server belum dapat dihubungi. Silakan coba kembali." };
  }
}
