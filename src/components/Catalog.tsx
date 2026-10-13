"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, SlidersHorizontal } from "lucide-react";
import type { Category } from "@/feat/categories/schema";
import type { Product } from "@/feat/products/schema";
import { ProductCard } from "@/components/ProductSection";
import { ROUTES } from "@/lib/config";
import { useTransition } from "react";
import { ProductCardSkeleton } from "@/components/LoadingSkeletons";

const fieldClass =
  "mt-2 min-h-11 w-full border border-border bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-2 focus-visible:outline-ring";
const pageSize = 12;

export function Catalog({ products, categories }: { products: Product[]; categories: Category[] }) {
  const params = useSearchParams();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const query = params.get("q")?.trim().slice(0, 200) ?? "";
  const category = params.get("category") ?? "";
  const brand = params.get("brand") ?? "";
  const stock = params.get("stock") ?? "";
  const sort = params.get("sort") ?? "name";
  const price = (key: string) => {
    const value = params.get(key);
    return value && Number.isFinite(Number(value)) && Number(value) >= 0 ? Number(value) : null;
  };
  const min = price("min");
  const max = price("max");
  const categoryMap = new Map(categories.map((item) => [item.id, item]));
  const brands = [...new Set(products.flatMap((item) => (item.brand ? [item.brand] : [])))].sort(
    (a, b) => a.localeCompare(b, "id"),
  );
  const filtered = products
    .filter((product) => {
      const productCategory = categoryMap.get(product.category_id);
      return (
        (!query ||
          `${product.name} ${product.brand ?? ""} ${product.sku} ${product.description ?? ""} ${productCategory?.name ?? ""}`
            .toLowerCase()
            .includes(query.toLowerCase())) &&
        (!category || productCategory?.slug === category) &&
        (!brand || product.brand === brand) &&
        (stock !== "available" || product.current_stock > 0) &&
        (stock !== "empty" || product.current_stock === 0) &&
        (min === null || (product.price !== null && product.price >= min)) &&
        (max === null || (product.price !== null && product.price <= max))
      );
    })
    .sort((a, b) => {
      let result = 0;
      if (sort === "price-asc" || sort === "price-desc") {
        if (a.price === null && b.price !== null) return 1;
        if (b.price === null && a.price !== null) return -1;
        result = ((a.price ?? 0) - (b.price ?? 0)) * (sort === "price-desc" ? -1 : 1);
      } else if (sort === "updated") result = b.updated_at.localeCompare(a.updated_at);
      else result = a.name.localeCompare(b.name, "id") * (sort === "name-desc" ? -1 : 1);
      return result || a.id - b.id;
    });
  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const requestedPage = Number(params.get("page"));
  const page =
    Number.isSafeInteger(requestedPage) && requestedPage > 0 ? Math.min(requestedPage, pages) : 1;
  const visible = filtered.slice((page - 1) * pageSize, page * pageSize);
  const pageUrl = (number: number) => {
    const next = new URLSearchParams(params.toString());
    next.set("page", String(number));
    return `${ROUTES.catalog}?${next}`;
  };
  const activeCategory = categories.find((item) => item.slug === category);

  return (
    <section className="px-6 py-12 sm:px-12 lg:px-24 lg:py-16">
      <p className="text-sm text-muted-foreground">
        <Link href={ROUTES.home} className="hover:text-primary">
          Beranda
        </Link>{" "}
        / Katalog Produk
      </p>
      <header className="mt-5 mb-8">
        <h1 className="mt-3 text-3xl font-bold sm:text-4xl">
          {activeCategory?.name ?? "Katalog Produk"}
        </h1>
        <p className="mt-4 max-w-2xl text-muted-foreground">
          Jelajahi perangkat dan aksesori kami. Temukan produk yang tepat, lalu tanyakan langsung
          kepada tim Sinar Asih.
        </p>
      </header>
      <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
        <aside>
          <form
            key={params.toString()}
            action={ROUTES.catalog}
            onSubmit={(event) => {
              event.preventDefault();
              const next = new URLSearchParams();
              for (const [key, value] of new FormData(event.currentTarget))
                if (typeof value === "string" && value.trim()) next.set(key, value.trim());
              startTransition(() => router.push(`${ROUTES.catalog}?${next}`));
            }}
            className="grid gap-4 border border-border bg-card p-5"
          >
            <h2 className="flex items-center gap-2 font-semibold">
              <SlidersHorizontal className="size-4" aria-hidden="true" /> Cari & filter
            </h2>
            <label className="text-sm">
              Cari produk
              <input
                type="search"
                name="q"
                defaultValue={query}
                maxLength={200}
                placeholder="Nama, merek, atau SKU"
                className={fieldClass}
              />
            </label>
            <label className="text-sm">
              Kategori
              <select name="category" defaultValue={category} className={fieldClass}>
                <option value="">Semua kategori</option>
                {categories.map((item) => (
                  <option key={item.id} value={item.slug}>
                    {item.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm">
              Merek
              <select name="brand" defaultValue={brand} className={fieldClass}>
                <option value="">Semua merek</option>
                {brands.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </label>
            <label className="text-sm">
              Ketersediaan
              <select name="stock" defaultValue={stock} className={fieldClass}>
                <option value="">Semua stok</option>
                <option value="available">Stok tersedia</option>
                <option value="empty">Stok habis</option>
              </select>
            </label>
            <label className="text-sm">
              Harga minimum (Rp)
              <input
                type="number"
                name="min"
                min="0"
                step="0.01"
                defaultValue={min ?? ""}
                placeholder="0"
                className={fieldClass}
              />
            </label>
            <label className="text-sm">
              Harga maksimum (Rp)
              <input
                type="number"
                name="max"
                min="0"
                step="0.01"
                defaultValue={max ?? ""}
                placeholder="Tanpa batas"
                className={fieldClass}
              />
            </label>
            <label className="text-sm">
              Urutkan
              <select name="sort" defaultValue={sort} className={fieldClass}>
                <option value="name">Nama A–Z</option>
                <option value="name-desc">Nama Z–A</option>
                <option value="price-asc">Harga terendah</option>
                <option value="price-desc">Harga tertinggi</option>
                <option value="updated">Terakhir diperbarui</option>
              </select>
            </label>
            <button className="flex min-h-11 items-center justify-center gap-2 bg-primary px-3 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90">
              <Search className="size-4" aria-hidden="true" />
              Tampilkan produk
            </button>
            <Link
              href={ROUTES.catalog}
              className="py-2 text-center text-sm text-primary hover:underline"
            >
              Reset semua filter
            </Link>
          </form>
        </aside>
        <div aria-busy={isPending}>
          <p role="status" className="mb-5 text-sm text-muted-foreground">
            {isPending ? (
              "Memuat produk…"
            ) : (
              <>
                {filtered.length
                  ? `Menampilkan ${(page - 1) * pageSize + 1}–${Math.min(page * pageSize, filtered.length)} dari ${filtered.length} produk`
                  : "0 produk ditemukan"}
                {query && ` untuk “${query}”`}
              </>
            )}
          </p>
          {min !== null && max !== null && min > max && (
            <p role="alert" className="text-destructive mb-5 text-sm">
              Harga minimum harus lebih kecil atau sama dengan harga maksimum.
            </p>
          )}
          {isPending ? (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }, (_, index) => (
                <ProductCardSkeleton key={index} />
              ))}
            </div>
          ) : visible.length ? (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {visible.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  categoryName={categoryMap.get(product.category_id)?.name ?? "Produk"}
                />
              ))}
            </div>
          ) : (
            <div className="border border-dashed border-border px-6 py-16 text-center">
              <Search className="mx-auto size-10 text-muted-foreground" aria-hidden="true" />
              <h2 className="mt-4 text-xl font-semibold">
                {products.length ? "Produk tidak ditemukan" : "Belum ada produk tersedia"}
              </h2>
              <p className="mt-3 text-sm text-muted-foreground">
                {products.length
                  ? "Coba kata pencarian lain atau sesuaikan filter."
                  : "Silakan kunjungi katalog kembali untuk melihat produk terbaru."}
              </p>
              <Link
                href={ROUTES.catalog}
                className="mt-6 inline-block text-sm font-semibold text-primary hover:underline"
              >
                Lihat semua produk
              </Link>
            </div>
          )}
          {pages > 1 && (
            <nav
              aria-label="Halaman katalog"
              className="mt-8 flex flex-wrap items-center justify-center gap-5"
            >
              {page > 1 && (
                <Link
                  href={pageUrl(page - 1)}
                  className="border border-border px-4 py-3 text-sm hover:bg-accent"
                >
                  ← Sebelumnya
                </Link>
              )}
              <span className="text-sm">
                Halaman {page} dari {pages}
              </span>
              {page < pages && (
                <Link
                  href={pageUrl(page + 1)}
                  className="border border-border px-4 py-3 text-sm hover:bg-accent"
                >
                  Berikutnya →
                </Link>
              )}
            </nav>
          )}
        </div>
      </div>
    </section>
  );
}
