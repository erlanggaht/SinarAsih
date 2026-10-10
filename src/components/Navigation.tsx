"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useRef, useState } from "react";

const links = [
  { label: "Beranda", href: "/" },
  { label: "Tim Kami", href: "/team" },
];

export function Navigation() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const menuButton = useRef<HTMLButtonElement>(null);

  return (
    <header
      className="fixed inset-x-0 top-0 z-40 bg-navigation text-navigation-foreground shadow-md"
      onKeyDown={(event) => {
        if (event.key === "Escape" && open) {
          setOpen(false);
          menuButton.current?.focus();
        }
      }}
    >
      <nav aria-label="Navigasi utama" className="px-10 sm:px-10">
        <div className="flex h-20 items-center justify-between gap-6">
          <Link
            href="/"
            aria-label="Sinar Asih Sumedang — beranda"
            onClick={() => setOpen(false)}
            className="group shrink-0 text-5xl font-bold tracking-tight text-navigation-muted transition-colors hover:text-navigation-foreground focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-navigation-foreground"
          >
            S<span className="text-navigation-foreground group-hover:text-navigation-muted">A</span>
            S
          </Link>
          <button
            ref={menuButton}
            type="button"
            aria-label={open ? "Tutup menu navigasi" : "Buka menu navigasi"}
            aria-expanded={open}
            aria-controls="navigation-links"
            onClick={() => setOpen(!open)}
            className="flex size-12 items-center justify-center hover:bg-navigation-action focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navigation-foreground lg:hidden"
          >
            {open ? (
              <X className="size-7" aria-hidden="true" />
            ) : (
              <Menu className="size-7" aria-hidden="true" />
            )}
          </button>
          <div
            id="navigation-links"
            className={`${open ? "flex" : "hidden"} absolute inset-x-0 top-20 max-h-[calc(100dvh-5rem)] flex-col gap-1 overflow-y-auto bg-navigation p-4 shadow-lg lg:static lg:flex lg:max-h-none lg:flex-row lg:items-center lg:gap-1 lg:overflow-visible lg:p-0 lg:shadow-none`}
          >
            {links.map(({ label, href }) => (
              <Link
                key={label}
                href={href}
                aria-current={pathname === href ? "page" : undefined}
                onClick={() => setOpen(false)}
                className="px-4 py-3 text-lg transition-colors hover:bg-navigation-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navigation-foreground aria-[current=page]:bg-navigation-hover"
              >
                {label}
              </Link>
            ))}
            <Link
              href="/gallery"
              aria-current={pathname === "/gallery" ? "page" : undefined}
              onClick={() => setOpen(false)}
              className="mt-2 bg-navigation-action px-5 py-3 text-center text-navigation-action-foreground transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navigation-foreground lg:mt-0 lg:ml-2"
            >
              Galeri Perusahaan
            </Link>
          </div>
        </div>
      </nav>
      <div aria-hidden="true" className="h-1 bg-brand-accent" />
    </header>
  );
}
