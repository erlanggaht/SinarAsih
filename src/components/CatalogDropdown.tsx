"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { ProductImage } from "@/components/ProductImage";
import type { Category } from "@/feat/categories/schema";
import { ROUTES } from "@/lib/config";

const MAX_VISIBLE_CATEGORIES = 8;

export function CatalogDropdown({
  categories,
  error,
  active,
  onNavigate,
}: {
  categories: Category[];
  error: boolean;
  active: boolean;
  onNavigate: () => void;
}) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const id = useId();
  const visibleCategories = categories
    .filter((category) => category.is_active)
    .slice(0, MAX_VISIBLE_CATEGORIES);
  const closeAndNavigate = () => {
    setOpen(false);
    onNavigate();
  };

  useEffect(() => {
    if (!open) return;
    const closeOutside = (event: PointerEvent) => {
      if (event.target instanceof Node && !root.current?.contains(event.target)) setOpen(false);
    };
    const breakpoint = window.matchMedia("(min-width: 1024px)");
    const close = () => setOpen(false);
    document.addEventListener("pointerdown", closeOutside);
    breakpoint.addEventListener("change", close);
    return () => {
      document.removeEventListener("pointerdown", closeOutside);
      breakpoint.removeEventListener("change", close);
    };
  }, [open]);

  return (
    <div
      ref={root}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape" && open) {
          event.preventDefault();
          event.stopPropagation();
          setOpen(false);
          trigger.current?.focus();
        }
      }}
    >
      <button
        ref={trigger}
        type="button"
        aria-expanded={open}
        aria-controls={id}
        aria-current={active ? "page" : undefined}
        onClick={() => setOpen(!open)}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown") {
            event.preventDefault();
            setOpen(true);
            requestAnimationFrame(() =>
              root.current?.querySelector<HTMLAnchorElement>("a")?.focus(),
            );
          }
        }}
        className={`flex min-h-12 w-full items-center justify-between gap-2 px-4 py-3 text-lg transition-colors hover:bg-navigation-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navigation-foreground ${open || active ? "bg-navigation-hover" : ""}`}
      >
        Katalog
        <ChevronDown
          className={`size-4 transition-transform motion-reduce:transition-none ${open ? "rotate-180" : ""}`}
          aria-hidden="true"
        />
      </button>
      <div
        id={id}
        hidden={!open}
        className="mt-2 overflow-hidden  border border-border bg-card text-card-foreground shadow-xl lg:absolute lg:inset-x-10 lg:top-full lg:mt-3"
      >
        <div className="flex items-center justify-between gap-4 border-b border-border px-5 py-2 lg:px-7">
          <p className="text-sm font-semibold">Kategori produk</p>
          <Link
            href={ROUTES.catalog}
            onClick={closeAndNavigate}
            className="inline-flex min-h-11 shrink-0 items-center px-2 text-sm font-semibold text-accent-foreground underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            Semua<span className="sr-only"> kategori produk</span>
          </Link>
        </div>
        {error ? (
          <p role="status" className="p-5 text-sm text-muted-foreground lg:p-7">
            Kategori belum dapat dimuat. Silakan muat ulang halaman.
          </p>
        ) : visibleCategories.length === 0 ? (
          <p className="p-5 text-sm text-muted-foreground lg:p-7">Belum ada kategori tersedia.</p>
        ) : (
          <ul className="grid gap-1 p-2 sm:grid-cols-2 lg:max-h-[min(60dvh,32rem)] lg:grid-cols-4 lg:gap-2 lg:overflow-y-auto lg:p-4">
            {visibleCategories.map((category) => (
              <li key={category.id}>
                <Link
                  href={`${ROUTES.catalog}?category=${encodeURIComponent(category.slug)}`}
                  onClick={closeAndNavigate}
                  className="group flex min-h-18 items-center gap-4  px-3 py-3 transition-colors  hover:text-accent-foreground focus-visible:bg-accent focus-visible:text-accent-foreground focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring lg:px-4"
                >
                  <span
                    className="relative block size-14 shrink-0 overflow-hidden  bg-white"
                    aria-hidden="true"
                  >
                    <ProductImage
                      src={category.image_path}
                      name={category.name}
                      sizes="56px"
                      imageClassName="object-contain p-1.5"
                      compact
                    />
                  </span>
                  <span className="min-w-0 text-sm leading-6 font-medium wrap-anywhere lg:text-base">
                    {category.name}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
