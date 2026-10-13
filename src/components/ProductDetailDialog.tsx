"use client";

import Link from "next/link";
import { useEffect, useId, useRef } from "react";
import { X } from "lucide-react";
import { ProductImage } from "@/components/ProductImage";
import { formatProductPrice, type Product } from "@/feat/products/schema";
import { getWhatsAppUrl } from "@/lib/config";

export function ProductDetailDialog({
  product,
  categoryName,
  onClose,
}: {
  product: Product;
  categoryName: string;
  onClose: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  useEffect(() => {
    const element = dialog.current;
    const trigger = document.activeElement;
    element?.showModal();
    return () => {
      element?.close();
      if (trigger instanceof HTMLElement && trigger.isConnected) trigger.focus();
    };
  }, []);

  return (
    <dialog
      ref={dialog}
      aria-labelledby={titleId}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      className="m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-2xl overflow-y-auto border border-border bg-card p-0 text-card-foreground shadow-xl backdrop:bg-black/50"
    >
      <header className="flex items-center justify-between gap-4 border-b border-border p-5">
        <h2 id={titleId} className="text-xl font-semibold wrap-anywhere">
          {product.name}
        </h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Tutup detail produk"
          className="flex size-11 shrink-0 items-center justify-center hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring"
        >
          <X className="size-5" aria-hidden="true" />
        </button>
      </header>
      <div className="p-5 sm:p-6">
        <div className="relative aspect-4/3 overflow-hidden bg-white">
          <ProductImage src={product.image_path} name={product.name} />
        </div>
        <p className="mt-5 text-2xl font-semibold text-primary">
          {product.price === null ? "Hubungi untuk harga" : formatProductPrice(product.price)}
        </p>
        <dl className="mt-5 grid grid-cols-[auto_minmax(0,1fr)] gap-x-5 gap-y-3 text-sm">
          <dt className="text-muted-foreground">Kategori</dt>
          <dd className="wrap-anywhere">{categoryName}</dd>
          <dt className="text-muted-foreground">Merek</dt>
          <dd className="wrap-anywhere">{product.brand || "Tidak dicantumkan"}</dd>
          <dt className="text-muted-foreground">SKU</dt>
          <dd className="wrap-anywhere">{product.sku}</dd>
          <dt className="text-muted-foreground">Stok</dt>
          <dd className={product.current_stock > 0 ? "text-success" : "text-muted-foreground"}>
            {new Intl.NumberFormat("id-ID").format(product.current_stock)} unit
            {product.current_stock === 0 && " (habis)"}
          </dd>
        </dl>
        <h3 className="mt-6 font-semibold">Deskripsi produk</h3>
        <p className="mt-3 text-sm leading-7 wrap-anywhere whitespace-pre-wrap text-muted-foreground">
          {product.description || "Belum ada deskripsi produk."}
        </p>
        <Link
          href={getWhatsAppUrl(
            `Halo Sinar Asih, saya ingin bertanya tentang ${product.name} (SKU: ${product.sku}).`,
          )}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 flex min-h-11 items-center justify-center bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90 focus-visible:outline-2 focus-visible:outline-ring"
        >
          Tanya produk<span className="sr-only"> melalui WhatsApp (buka tab baru)</span>
        </Link>
      </div>
    </dialog>
  );
}
