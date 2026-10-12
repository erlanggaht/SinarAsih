import type { User } from "@supabase/supabase-js";

export type SessionUser = {
  id: string;
  email: string | null;
  created_at: string;
};

export type AppSession = { user: SessionUser };
export type SessionStatus = "loading" | "authenticated" | "unauthenticated";

export function toAppSession(user: User | null): AppSession | null {
  return user
    ? { user: { id: user.id, email: user.email ?? null, created_at: user.created_at } }
    : null;
}
