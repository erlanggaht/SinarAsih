"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ROUTES } from "@/lib/config";

export type LoginState = {
  error: string | null;
};

export async function loginAction(
  _previousState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return {
      error: "Email dan password wajib diisi.",
    };
  }

  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !user) {
    return {
      error: "Email atau password tidak sesuai.",
    };
  }

  const { data: profile, error: profileError } = await supabase
    .from("admin_profiles")
    .select("user_id, is_active")
    .eq("user_id", user.id)
    .single();

  console.log("Dashboard user ID:", user.id);
  console.log("Dashboard profile:", profile);
  console.error("Dashboard profile error:", error);

  if (profileError || !profile) {
    await supabase.auth.signOut();

    return {
      error: "Akun ini belum terdaftar sebagai pengelola.",
    };
  }

  if (!profile.is_active) {
    await supabase.auth.signOut();

    return {
      error: "Akun pengelola ini sudah dinonaktifkan.",
    };
  }

  redirect(ROUTES.panel.dashboard);
}

export async function logoutAction() {
  const supabase = await createClient();

  await supabase.auth.signOut();

  redirect(ROUTES.panel.login);
}
