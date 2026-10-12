import "server-only";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { toAppSession } from "./session";

export const getServerSession = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  return error ? null : toAppSession(user);
});
