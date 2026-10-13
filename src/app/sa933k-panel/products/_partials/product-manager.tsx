"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Pencil, Plus, Trash2 } from "lucide-react";
import { ROUTES } from "@/lib/config";
import { formatProductPrice, type Product, type ProductCategory } from "@/feat/products/schema";
import { ProductForm } from "./product-form";
import { ProductFilterForm, type ProductFilters } from "./product-filters";
import { DeleteProductDialog } from "./delete-product-dialog";

type Status = "all" | "active" | "inactive" | "low";

export function ProductManager({
  initialProducts,
  categories,
  canDelete = false,
  initialEditId,
}: {
  initialProducts: Product[];
  categories: ProductCategory[];
  canDelete?: boolean;
  initialEditId?: number;
}) {
  const [products, setProducts] = useState(initialProducts);
  const initialProduct = initialProducts.find((product) => product.id === initialEditId) ?? null;
  const [selected, setSelected] = useState<Product | null>(initialProduct);
  const [editing, setEditing] = useState(Boolean(initialProduct));
  const [pending, setPending] = useState(false);
  const [filters, setFilters] = useState<ProductFilters>({ query: "", category: "" });
  const [status, setStatus] = useState<Status>("all");
  const [notice, setNotice] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<Product | null>(null);
  const editor = useRef<HTMLDivElement>(null);
  const listHeading = useRef<HTMLHeadingElement>(null);
  const lastTrigger = useRef<HTMLButtonElement | null>(null);
  useEffect(() => {
    if (editing) editor.current?.querySelector<HTMLInputElement>("input")?.focus();
  }, [editing]);
  const activeCount = products.filter((product) => product.is_active).length;
  const statuses: { id: Status; label: string; count: number }[] = [
    { id: "all", label: "Semua", count: products.length },
    { id: "active", label: "Aktif", count: activeCount },
    { id: "inactive", label: "Nonaktif", count: products.length - activeCount },
    {
      id: "low",
      label: "Stok menipis",
      count: products.filter((product) => product.current_stock <= product.minimum_stock).length,
    },
  ];
  const categoryMap = new Map(categories.map((category) => [category.id, category]));
  const filtered = products.filter((product) => {
    const search = `${product.name} ${product.sku} ${product.brand ?? ""} ${categoryMap.get(product.category_id)?.name ?? ""}`;
    return (
      search.toLowerCase().includes(filters.query.trim().toLowerCase()) &&
      (!filters.category || product.category_id === Number(filters.category)) &&
      (status === "all" ||
        (status === "low"
          ? product.current_stock <= product.minimum_stock
          : status === "active"
            ? product.is_active
            : !product.is_active))
    );
  });

  function openEditor(product: Product | null, trigger: HTMLButtonElement) {
    lastTrigger.current = trigger;
    setSelected(product);
    setNotice(null);
    setEditing(true);
  }
  function closeEditor() {
    setEditing(false);
    requestAnimationFrame(() => lastTrigger.current?.focus());
  }

  return (
    <div className="mt-8">
      {notice && (
        <p
          role="status"
          className="mb-5 border border-success bg-success/10 px-4 py-3 text-sm text-success"
        >
          {notice}
        </p>
      )}
      <section
        hidden={editing}
        aria-labelledby="product-list-title"
        className="border border-border bg-card text-card-foreground"
      >
        <div className="flex flex-col gap-4 border-b border-border p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div>
            <h2
              ref={listHeading}
              tabIndex={-1}
              id="product-list-title"
              className="text-xl font-semibold outline-none"
            >
              Daftar produk
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Lihat kategori, harga, dan stok. Pilih Edit untuk mengubah produk.
            </p>
          </div>
          <button
            type="button"
            disabled={!categories.some((category) => category.is_active)}
            onClick={(event) => openEditor(null, event.currentTarget)}
            className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 bg-primary px-4 py-3 text-sm font-medium text-primary-foreground hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Plus className="size-4" aria-hidden="true" /> Tambah produk
          </button>
        </div>
        {!categories.some((category) => category.is_active) && (
          <p className="border-b border-border px-6 py-4 text-sm text-warning">
            Aktifkan atau buat kategori terlebih dahulu.{" "}
            <Link href={ROUTES.panel.categories} className="font-medium underline">
              Kelola kategori
            </Link>
          </p>
        )}
        <div className="space-y-4 border-b border-border p-5 sm:p-6">
          <ProductFilterForm categories={categories} onChange={setFilters} />
          <div
            role="group"
            aria-label="Filter status dan stok produk"
            className="flex flex-wrap gap-2"
          >
            {statuses.map((filter) => (
              <button
                key={filter.id}
                type="button"
                aria-pressed={status === filter.id}
                onClick={() => setStatus(filter.id)}
                className={`inline-flex min-h-11 items-center gap-2 border px-4 py-2 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${status === filter.id ? "border-primary bg-accent text-accent-foreground" : "border-border hover:bg-muted"}`}
              >
                {filter.label}
                <span className="text-xs tabular-nums">({filter.count})</span>
              </button>
            ))}
          </div>
          <p role="status" className="text-sm text-muted-foreground">
            Menampilkan {filtered.length} dari {products.length} produk
          </p>
        </div>
        {filtered.length > 0 ? (
          <>
            <div
              aria-hidden="true"
              className="hidden grid-cols-[minmax(0,1fr)_9rem_7rem_13rem] gap-5 border-b border-border bg-muted/50 px-6 py-3 text-xs font-semibold text-muted-foreground lg:grid"
            >
              <span>Produk</span>
              <span>Harga</span>
              <span>Stok</span>
              <span className="text-right">Tindakan</span>
            </div>
            <ul className="divide-y divide-border">
              {filtered.map((product) => {
                const category = categoryMap.get(product.category_id);
                return (
                  <li
                    key={product.id}
                    className="grid grid-cols-2 items-start gap-4 p-5 lg:grid-cols-[minmax(0,1fr)_9rem_7rem_13rem] lg:items-center lg:gap-5 lg:px-6"
                  >
                    <div className="col-span-2 min-w-0 lg:col-span-1">
                      <h3 className="font-semibold wrap-anywhere">{product.name}</h3>
                      <p className="mt-1 text-sm wrap-anywhere text-muted-foreground">
                        {category?.name ?? "Kategori tidak tersedia"}
                        {product.brand ? ` · ${product.brand}` : ""}
                      </p>
                      <p className="mt-2 text-xs wrap-anywhere text-muted-foreground">
                        SKU: {product.sku}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <span
                          className={`px-2 py-1 text-xs font-medium ${product.is_active ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"}`}
                        >
                          {product.is_active ? "Aktif" : "Nonaktif"}
                        </span>
                        {!category?.is_active && (
                          <span className="px-2 py-1 text-xs text-warning">Kategori nonaktif</span>
                        )}
                      </div>
                    </div>
                    <div className="min-w-0 text-sm">
                      <span className="mb-1 block text-xs text-muted-foreground lg:hidden">
                        Harga
                      </span>
                      <span className="wrap-anywhere tabular-nums">
                        {formatProductPrice(product.price)}
                      </span>
                    </div>
                    <div className="text-sm">
                      <span className="mb-1 block text-xs text-muted-foreground lg:hidden">
                        Stok
                      </span>
                      <p className="font-medium tabular-nums">{product.current_stock} unit</p>
                      <p
                        className={`mt-1 text-xs ${product.current_stock <= product.minimum_stock ? "text-warning" : "text-muted-foreground"}`}
                      >
                        {product.current_stock === 0
                          ? "Stok habis"
                          : product.current_stock <= product.minimum_stock
                            ? "Perlu ditambah"
                            : "Stok cukup"}
                      </p>
                    </div>
                    <div className="col-span-2 flex flex-wrap gap-2 justify-self-start lg:col-span-1 lg:justify-self-end">
                      <button
                        type="button"
                        aria-label={`Edit produk ${product.name}`}
                        onClick={(event) => openEditor(product, event.currentTarget)}
                        className="inline-flex min-h-11 items-center justify-center gap-2 border border-border px-4 py-2 text-sm font-medium hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                      >
                        <Pencil className="size-4" aria-hidden="true" /> Edit
                      </button>
                      {canDelete && (
                        <button
                          type="button"
                          aria-label={`Hapus produk ${product.name}`}
                          onClick={(event) => {
                            lastTrigger.current = event.currentTarget;
                            setNotice(null);
                            setDeleting(product);
                          }}
                          className="inline-flex min-h-11 items-center justify-center gap-2 border border-error/40 px-3 py-2 text-sm font-medium text-error hover:bg-error/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                        >
                          <Trash2 className="size-4" aria-hidden="true" /> Hapus
                        </button>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </>
        ) : (
          <div className="px-6 py-12 text-center">
            <h3 className="font-semibold">
              {products.length === 0 ? "Belum ada produk" : "Tidak ada produk yang cocok"}
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {products.length === 0
                ? "Tambahkan produk pertama dan hubungkan dengan kategorinya."
                : "Coba pencarian atau filter lain."}
            </p>
          </div>
        )}
      </section>
      {deleting && (
        <DeleteProductDialog
          product={deleting}
          onClose={() => {
            setDeleting(null);
            requestAnimationFrame(() => lastTrigger.current?.focus());
          }}
          onDeleted={(id) => {
            setProducts((current) => current.filter((product) => product.id !== id));
            setNotice(`Produk "${deleting.name}" berhasil dihapus.`);
            setDeleting(null);
            requestAnimationFrame(() => listHeading.current?.focus());
          }}
        />
      )}
      {editing && (
        <div ref={editor} className="mx-auto max-w-4xl">
          <button
            type="button"
            disabled={pending}
            onClick={closeEditor}
            className="mb-4 inline-flex min-h-11 items-center gap-2 text-sm font-medium text-primary hover:underline focus-visible:outline-2 focus-visible:outline-ring disabled:opacity-60"
          >
            <ArrowLeft className="size-4" aria-hidden="true" /> Kembali ke daftar produk
          </button>
          <ProductForm
            key={selected?.id ?? "new"}
            product={selected}
            categories={categories}
            onPendingChange={setPending}
            onCancel={closeEditor}
            onSaved={(saved) => {
              setProducts((current) =>
                [...current.filter((product) => product.id !== saved.id), saved].sort((a, b) =>
                  a.name.localeCompare(b.name, "id"),
                ),
              );
              setNotice(
                selected
                  ? `Produk "${saved.name}" berhasil diperbarui.`
                  : `Produk "${saved.name}" berhasil ditambahkan.`,
              );
              setSelected(null);
              setEditing(false);
              requestAnimationFrame(() => listHeading.current?.focus());
            }}
          />
        </div>
      )}
    </div>
  );
}
