"use client";

import { ProductImage } from "@/components/ProductImage";
import { ProductDetailDialog } from "@/components/ProductDetailDialog";
import { Pencil } from "lucide-react";
import { useState } from "react";
import { useSession } from "@/hooks/use-session";
import Link from "next/link";
import { demoProductCategories, demoProducts } from "@/data/products";
import { type Product } from "@/feat/products/schema";
import { ROUTES } from "@/lib/config";
import { ProductWhatsAppLink } from "@/components/ProductWhatsAppLink";

export function ProductCard({ product, categoryName }: { product: Product; categoryName: string }) {
  const { isAuthenticated } = useSession();
  const [detailsOpen, setDetailsOpen] = useState(false);
  return (
    <article className="flex h-full flex-col border border-border bg-card text-card-foreground">
      <div className="relative m-3 aspect-4/3 bg-white">
        <ProductImage src={product.image_path} name={product.name} />
        {isAuthenticated && (
          <Link
            href={`${ROUTES.panel.products}?edit=${product.id}`}
            aria-label={`Edit produk ${product.name}`}
            title="Edit produk"
            className="absolute top-2 right-2 flex size-11 items-center justify-center border border-border bg-card text-primary shadow-sm hover:bg-accent focus-visible:outline-2 focus-visible:outline-ring"
          >
            <Pencil className="size-5" aria-hidden="true" />
          </Link>
        )}
      </div>
      <div className="flex flex-1 flex-col px-5 pt-2 pb-5">
        <p className="text-xs text-muted-foreground">{categoryName}</p>
        <h3 className="mt-2 text-lg font-semibold wrap-anywhere">{product.name}</h3>
        <p className="mt-2 line-clamp-3 text-sm leading-6 wrap-anywhere text-muted-foreground">
          {product.description}
        </p>
        <div className="mt-auto pt-5">
          <p
            className={`mt-2 text-sm ${product.current_stock > 0 ? "text-success" : "text-muted-foreground"}`}
          >
            {product.current_stock > 0
              ? `Stok tersedia: ${new Intl.NumberFormat("id-ID").format(product.current_stock)} unit`
              : "Stok habis: 0 unit"}
          </p>
          <ProductWhatsAppLink product={product} className="mt-5" />
          <button
            type="button"
            onClick={() => setDetailsOpen(true)}
            aria-label={`Lihat detail ${product.name}`}
            className="mt-3 min-h-11 w-full border border-border px-3 py-3 text-sm font-medium hover:bg-accent focus-visible:outline-2 focus-visible:outline-ring"
          >
            Lihat detail
          </button>
        </div>
      </div>
      {detailsOpen && (
        <ProductDetailDialog
          product={product}
          categoryName={categoryName}
          onClose={() => setDetailsOpen(false)}
        />
      )}
    </article>
  );
}

export function ProductSection() {
  const categories = new Map(demoProductCategories.map((category) => [category.id, category]));
  const products = demoProducts.filter(
    (product) => product.is_active && categories.get(product.category_id)?.is_active,
  );

  return (
    <section
      id="products"
      aria-labelledby="products-title"
      className="px-6 py-12 sm:px-12 lg:px-24 lg:py-20"
    >
      <header className="mb-8">
        <h2 id="products-title" className="text-2xl font-bold tracking-tight sm:text-3xl">
          Pilihan produk
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
          Temukan perangkat dan aksesori yang sesuai dengan kebutuhanmu.
        </p>
        <p className="mt-3 border-l-2 border-info pl-3 text-xs leading-5 text-info">
          Data contoh: produk, harga, dan stok di bawah ini hanya untuk demo tampilan.
        </p>
      </header>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            categoryName={categories.get(product.category_id)?.name ?? "Produk"}
          />
        ))}
      </div>
    </section>
  );
}
