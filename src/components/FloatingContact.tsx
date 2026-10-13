"use client";

import { usePathname } from "next/navigation";
import { WhatsAppIcon } from "@/components/icons/SocialIcons";
import { BRAND_NAME, ROUTES, getWhatsAppUrl } from "@/lib/config";

export function FloatingContact() {
  const pathname = usePathname();

  if (pathname === ROUTES.panel.dashboard || pathname.startsWith(`${ROUTES.panel.dashboard}/`)) {
    return null;
  }

  return (
    <a
      href={getWhatsAppUrl(
        `Halo ${BRAND_NAME}, saya ingin bertanya tentang produk atau layanan servis.`,
      )}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat layanan melalui WhatsApp (buka tab baru)"
      title="Chat layanan melalui WhatsApp"
      className="fixed right-[max(1rem,env(safe-area-inset-right))] bottom-[max(1rem,env(safe-area-inset-bottom))] z-30 flex min-h-14 min-w-14 items-center justify-center gap-3 rounded-full border border-navigation-foreground/20 bg-navigation p-3 text-navigation-foreground shadow-lg transition-colors hover:bg-navigation-hover focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring sm:right-[max(1.5rem,env(safe-area-inset-right))] sm:bottom-[max(1.5rem,env(safe-area-inset-bottom))] sm:px-5"
    >
      <WhatsAppIcon className="size-7 shrink-0" />
      <span className="hidden text-sm font-semibold sm:inline">Chat layanan</span>
    </a>
  );
}
