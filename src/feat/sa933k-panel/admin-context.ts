import "server-only";
import { createClient } from "@/lib/supabase/server";
import { getServerSession } from "@/lib/auth/get-server-session";

export async function getAdminContext() {
  const supabase = await createClient();
  const session = await getServerSession();
  if (!session) return { supabase, profile: null };

  const { data: profile } = await supabase
    .from("admin_profiles")
    .select("user_id, role, is_active")
    .eq("user_id", session.user.id)
    .maybeSingle();

  return { supabase, profile: profile?.is_active ? profile : null };
}
