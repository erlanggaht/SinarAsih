"use client";

import { createContext, useContext } from "react";
import type { AppSession, SessionStatus, SessionUser } from "@/lib/auth/session";

export type SessionContextValue = {
  session: AppSession | null;
  user: SessionUser | null;
  status: SessionStatus;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
};

export const SessionContext = createContext<SessionContextValue | undefined>(undefined);

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) throw new Error("useSession harus digunakan di dalam SessionProvider.");
  return context;
}
