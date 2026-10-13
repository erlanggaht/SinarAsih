import "server-only";
import { createClient } from "@supabase/supabase-js";
import type { PublicTeamMember } from "./schema";

export async function getPublicTeam() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
  const { data, error } = await supabase.rpc("get_public_team");
  if (error) throw new Error("Data tim gagal dimuat.");
  return (data ?? []) as PublicTeamMember[];
}
