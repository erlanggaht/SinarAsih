"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { SessionContext } from "@/hooks/use-session";
import { createClient } from "@/lib/supabase/client";
import { toAppSession, type AppSession, type SessionStatus } from "@/lib/auth/session";

type SessionState = { session: AppSession | null; status: SessionStatus; error: string | null };

export function SessionProvider({
  children,
  initialSession,
}: {
  children: ReactNode;
  initialSession?: AppSession | null;
}) {
  const pathname = usePathname();
  const requestId = useRef(0);
  const invalidateRequests = useCallback(() => {
    ++requestId.current;
  }, []);
  const [state, setState] = useState<SessionState>({
    session: initialSession ?? null,
    status:
      initialSession === undefined
        ? "loading"
        : initialSession
          ? "authenticated"
          : "unauthenticated",
    error: null,
  });

  const refresh = useCallback(async () => {
    const current = ++requestId.current;
    setState((previous) => ({ ...previous, status: "loading", error: null }));
    try {
      const {
        data: { user },
        error,
      } = await createClient().auth.getUser();
      if (current !== requestId.current) return;
      const session = error ? null : toAppSession(user);
      const missingSession = error?.name === "AuthSessionMissingError" || error?.status === 401;
      setState({
        session,
        status: session ? "authenticated" : "unauthenticated",
        error: error && !missingSession ? "Tidak dapat memeriksa sesi. Silakan coba lagi." : null,
      });
    } catch {
      if (current === requestId.current)
        setState({
          session: null,
          status: "unauthenticated",
          error: "Tidak dapat memeriksa sesi. Silakan coba lagi.",
        });
    }
  }, []);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const {
      data: { subscription },
    } = createClient().auth.onAuthStateChange((event) => {
      if (event === "INITIAL_SESSION") return;
      clearTimeout(timer);
      invalidateRequests();
      if (event === "SIGNED_OUT") {
        setState({ session: null, status: "unauthenticated", error: null });
      } else {
        // Verifikasi di luar callback auth agar tidak menunggu lock Supabase yang sama.
        timer = setTimeout(() => {
          void refresh();
        }, 0);
      }
    });
    return () => {
      clearTimeout(timer);
      invalidateRequests();
      subscription.unsubscribe();
    };
  }, [refresh, invalidateRequests]);

  useEffect(() => {
    // Navigasi juga memeriksa cookie yang diubah oleh server action login/logout.
    const timer = setTimeout(() => {
      void refresh();
    }, 0);
    return () => {
      clearTimeout(timer);
      invalidateRequests();
    };
  }, [pathname, initialSession?.user.id, refresh, invalidateRequests]);

  const value = useMemo(
    () => ({
      ...state,
      user: state.session?.user ?? null,
      isAuthenticated: state.session !== null,
      isLoading: state.status === "loading",
      refresh,
    }),
    [state, refresh],
  );
  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}
