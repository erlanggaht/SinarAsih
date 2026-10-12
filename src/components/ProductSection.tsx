import Image from "next/image";
import Link from "next/link";
import { demoProductCategories, demoProducts } from "@/data/products";
import { formatProductPrice, type Product } from "@/feat/products/schema";
import { getWhatsAppUrl } from "@/lib/config";

export function ProductCard({ product, categoryName }: { product: Product; categoryName: string }) {
  return (
    <article className="flex h-full flex-col border border-border bg-card text-card-foreground">
      <div className="relative m-3 aspect-4/3 bg-white">
        {product.image_path && (
          <Image
            src={product.image_path}
            alt={product.name}
            fill
            sizes="(min-width: 1024px) 28vw, (min-width: 640px) 42vw, 90vw"
            className="object-contain p-5"
          />
        )}
      </div>
      <div className="flex flex-1 flex-col px-5 pt-2 pb-5">
        <p className="text-xs text-muted-foreground">{categoryName}</p>
        <h3 className="mt-2 text-lg font-semibold wrap-anywhere">{product.name}</h3>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">{product.description}</p>
        <div className="mt-auto pt-5">
          <p className="text-xl font-semibold text-primary tabular-nums">
            {formatProductPrice(product.price)}
          </p>
          <p
            className={`mt-2 text-sm ${product.current_stock > 0 ? "text-success" : "text-muted-foreground"}`}
          >
            {product.current_stock > 0 ? "Stok tersedia" : "Stok habis"}
          </p>
          <Link
            href={getWhatsAppUrl(`Halo Sinar Asih, saya ingin bertanya tentang ${product.name}.`)}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex items-center justify-center gap-2 bg-primary px-3 py-3 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring w-full"

          >
            Tanya produk
            <span className="sr-only">{product.name} melalui WhatsApp (buka tab baru)</span>
          </Link>
        </div>
      </div>
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
