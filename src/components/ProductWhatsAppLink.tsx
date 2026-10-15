import type { Product } from "@/feat/products/schema";
import { BRAND_NAME, getWhatsAppUrl } from "@/lib/config";

export function ProductWhatsAppLink({
  product,
  className,
}: {
  product: Pick<Product, "name" | "sku" | "current_stock">;
  className?: string;
}) {
  const question =
    product.current_stock > 0
      ? "Apakah stoknya masih tersedia? Boleh dibantu informasi produk dan harga terbarunya?"
      : "Kapan produk ini tersedia kembali? Apakah ada rekomendasi produk serupa?";
  const message = `Halo ${BRAND_NAME}, saya tertarik dengan ${product.name} (SKU: ${product.sku}). ${question}`;

  return (
    <a
      href={getWhatsAppUrl(message)}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex min-h-11 w-full items-center justify-center gap-2 bg-primary px-3 py-3 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${className ?? ""}`}
    >
      <span>
        Tanya Produk
        <span className="sr-only"> tentang {product.name} (buka tab baru)</span>
      </span>
    </a>
  );
}
