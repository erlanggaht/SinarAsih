import { Suspense } from "react";
import { getCatalogData } from "@/feat/products/catalog";
import { Catalog } from "@/components/Catalog";
import { getPageMetadata } from "@/lib/seo";

export const metadata = getPageMetadata("catalog");
export const dynamic = "force-dynamic";

export default async function CatalogPage() {
  const data = await getCatalogData();
  return (
    <Suspense fallback={<p className="p-12">Memuat katalog…</p>}>
      <Catalog {...data} />
    </Suspense>
  );
}
