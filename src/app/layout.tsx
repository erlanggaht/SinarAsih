import { Roboto } from "next/font/google";
import type { ReactNode } from "react";
import { ThemeProvider } from "@/components/theme-provider";
import AppContainer from "@/components/AppContainer";
import { SessionProvider } from "@/components/session-provider";
import { getServerSession } from "@/lib/auth/get-server-session";
import "./globals.css";
import { getPageMetadata } from "@/lib/seo";

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
  display: "swap",
  fallback: ["Arial", "sans-serif"],
});

export const metadata = getPageMetadata("home");

export default async function RootLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession();
  return (
    <html lang="id" suppressHydrationWarning>
      <body className={`${roboto.variable} bg-background font-sans text-foreground antialiased`}>
        <ThemeProvider>
          <SessionProvider initialSession={session}>
            <AppContainer>{children}</AppContainer>
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
