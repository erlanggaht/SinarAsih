import type { Metadata } from "next";
import { Suspense } from "react";
import { getCatalogData } from "@/feat/products/catalog";
import { Catalog } from "@/components/Catalog";

export const metadata: Metadata = {
  title: "Katalog Produk | Sinar Asih",
  description:
    "Temukan produk Sinar Asih berdasarkan kategori, merek, harga, dan ketersediaan stok.",
};
export const dynamic = "force-dynamic";

export default async function CatalogPage() {
  const data = await getCatalogData();
  return (
    <Suspense fallback={<p className="p-12">Memuat katalog…</p>}>
      <Catalog {...data} />
    </Suspense>
  );
}
