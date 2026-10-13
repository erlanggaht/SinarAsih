"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search } from "lucide-react";
import type { Category } from "@/feat/categories/schema";
import { ROUTES } from "@/lib/config";

export function HomeCategorySearch({
  categories,
  error,
}: {
  categories: Category[];
  error: boolean;
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const router = useRouter();
  const matches = categories.filter((category) =>
    category.name.toLowerCase().includes(query.trim().toLowerCase()),
  );
  const visible = open && Boolean(query.trim());
  const href = (category: Category) =>
    `${ROUTES.catalog}?category=${encodeURIComponent(category.slug)}`;

  return (
    <form
      className="relative z-30 min-w-0 flex-1"
      role="search"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
      }}
      onSubmit={(event) => {
        event.preventDefault();
        const category = matches[active] ?? matches[0];
        if (category && query.trim()) router.push(href(category));
      }}
    >
      <label htmlFor="home-category-search" className="sr-only">
        Cari kategori
      </label>
      <Search
        className="pointer-events-none absolute top-3 left-4 size-5 text-muted-foreground"
        aria-hidden="true"
      />
      <input
        id="home-category-search"
        type="search"
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={visible}
        aria-controls="home-category-results"
        aria-activedescendant={
          visible && active >= 0 ? `home-category-${matches[active]?.id}` : undefined
        }
        autoComplete="off"
        maxLength={200}
        value={query}
        placeholder="Cari kategori: laptop, smartphone, printer…"
        className="min-h-11 w-full border border-border bg-card py-3 pr-4 pl-12 text-sm focus-visible:outline-2 focus-visible:outline-ring"
        onFocus={() => setOpen(true)}
        onChange={(event) => {
          setQuery(event.target.value);
          setOpen(true);
          setActive(-1);
        }}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            setOpen(false);
            setActive(-1);
          }
          if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            event.preventDefault();
            setOpen(true);
            setActive((current) =>
              matches.length
                ? (current + (event.key === "ArrowDown" ? 1 : -1) + matches.length) % matches.length
                : -1,
            );
          }
        }}
      />
      {visible && (
        <div className="absolute top-full right-0 left-0 mt-2 max-h-72 overflow-auto border border-border bg-card shadow-lg">
          <ul id="home-category-results" role="listbox" aria-label="Hasil pencarian kategori">
            {matches.map((category, index) => (
              <li
                key={category.id}
                id={`home-category-${category.id}`}
                role="option"
                aria-selected={active === index}
              >
                <Link
                  href={href(category)}
                  className={`block px-4 py-3 text-sm hover:bg-accent focus-visible:bg-accent ${active === index ? "bg-accent" : ""}`}
                  onClick={() => setOpen(false)}
                >
                  {category.name}
                </Link>
              </li>
            ))}
          </ul>
          {matches.length === 0 && (
            <p role="status" className="px-4 py-3 text-sm text-muted-foreground">
              {error
                ? "Kategori belum dapat dimuat. Silakan coba kembali."
                : "Kategori tidak ditemukan."}
            </p>
          )}
        </div>
      )}
    </form>
  );
}
