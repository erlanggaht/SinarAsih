import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { ROUTES } from "@/lib/config";

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });

          response = NextResponse.next({ request });

          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  const { data: claimsData } = await supabase.auth.getClaims();
  const claims = claimsData?.claims;

  const pathname = request.nextUrl.pathname;
  const isAdminRoute = pathname.startsWith(ROUTES.panel.dashboard);
  const isLoginRoute = pathname === ROUTES.panel.login;

  if (isAdminRoute && !isLoginRoute && !claims) {
    const url = request.nextUrl.clone();
    url.pathname = ROUTES.panel.login;

    const redirectResponse = NextResponse.redirect(url);
    response.cookies.getAll().forEach((cookie) => redirectResponse.cookies.set(cookie));
    return redirectResponse;
  }

  return response;
}
