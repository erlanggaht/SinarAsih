"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { ProductCategory } from "@/feat/products/schema";
import type { StockProduct } from "@/feat/stock/schema";
import { StockForm } from "./stock-form";

export function StockManager({
  products,
  categories,
  filtered,
}: {
  products: StockProduct[];
  categories: ProductCategory[];
  filtered: boolean;
}) {
  const router = useRouter();
  const [selection, setSelection] = useState<StockProduct | null>(null);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [refreshing, startRefresh] = useTransition();
  const lastTrigger = useRef<HTMLButtonElement | null>(null);
  useEffect(() => {
    if (!selection && !saving && !refreshing) lastTrigger.current?.focus();
  }, [selection, saving, refreshing]);
  const close = () => {
    setSelection(null);
    requestAnimationFrame(() => lastTrigger.current?.focus());
  };
  return (
    <section className="mt-6" aria-label="Daftar stok produk" aria-busy={refreshing}>
      {message && (
        <p
          role="status"
          className="mb-4 border border-success bg-success/10 p-4 text-sm text-success"
        >
          {message}
        </p>
      )}
      {products.length === 0 ? (
        <div className="border border-border bg-card p-8 text-center">
          <h2 className="font-semibold">
            {filtered ? "Produk tidak ditemukan" : "Belum ada produk"}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {filtered
              ? "Coba nama atau SKU lain, atau hapus pencarian."
              : "Tambahkan produk melalui menu Produk terlebih dahulu."}
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-border border border-border bg-card">
          {products.map((product) => (
            <li
              key={product.id}
              className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 p-5 sm:grid-cols-[minmax(0,1fr)_7rem_auto] sm:px-6"
            >
              <div className="min-w-0">
                <h2 className="font-semibold wrap-anywhere">{product.name}</h2>
                <p className="mt-1 text-sm wrap-anywhere text-muted-foreground">
                  {categories.find((category) => category.id === product.category_id)?.name ??
                    "Tanpa kategori"}{" "}
                  · {product.sku}
                </p>
                {!product.is_active && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    Produk nonaktif. Aktifkan melalui menu Produk untuk mengubah stok.
                  </p>
                )}
              </div>
              <p className="text-right text-lg font-semibold tabular-nums sm:text-left">
                {product.current_stock}
                <span className="ml-1 text-sm font-normal text-muted-foreground">unit</span>
              </p>
              <button
                type="button"
                disabled={!product.is_active || saving || refreshing}
                aria-label={`Ubah stok ${product.name}`}
                onClick={(event) => {
                  lastTrigger.current = event.currentTarget;
                  setMessage("");
                  setSelection(product);
                }}
                className="col-span-2 min-h-11 border border-input px-4 py-2 text-sm font-medium hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-60 sm:col-span-1"
              >
                Ubah stok
              </button>
            </li>
          ))}
        </ul>
      )}
      {selection && (
        <StockForm
          key={selection.id}
          product={selection}
          onPendingChange={setSaving}
          onCancel={close}
          onSaved={(stock) => {
            setMessage(`Stok ${selection.name} berhasil diubah menjadi ${stock} unit.`);
            close();
            startRefresh(() => router.refresh());
          }}
        />
      )}
    </section>
  );
}
