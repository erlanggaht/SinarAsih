import "server-only";
import { createClient } from "@/lib/supabase/server";

export async function getAdminContext() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) return { supabase, profile: null };

  const { data: profile } = await supabase
    .from("admin_profiles")
    .select("user_id, role, is_active")
    .eq("user_id", user.id)
    .maybeSingle();

  return { supabase, profile: profile?.is_active ? profile : null };
}
