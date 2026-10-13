import Link from "next/link";
import { redirect } from "next/navigation";
import { ROUTES } from "@/lib/config";
import { getPrivateMetadata } from "@/lib/seo";
import { getAdminContext } from "@/feat/sa933k-panel/admin-context";
import { PRODUCT_COLUMNS, type Product, type ProductCategory } from "@/feat/products/schema";
import { ProductManager } from "./_partials/product-manager";

export const metadata = getPrivateMetadata("Kelola Produk");

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string }>;
}) {
  const { edit } = await searchParams;
  const { supabase, profile } = await getAdminContext();
  if (!profile) redirect(ROUTES.panel.dashboard);
  const [products, categories] = await Promise.all([
    supabase.from("products").select(PRODUCT_COLUMNS).order("name"),
    supabase.from("categories").select("id, name, is_active").order("name"),
  ]);
  if (products.error || categories.error)
    throw new Error("Data produk atau kategori gagal dimuat.");
  return (
    <section className="mx-auto max-w-6xl px-6 py-12">
      <Link
        href={ROUTES.panel.dashboard}
        className="inline-flex min-h-11 items-center text-sm font-medium text-primary hover:underline focus-visible:outline-2 focus-visible:outline-ring"
      >
        Kembali ke panel
      </Link>
      <header className="mt-3 border-b border-border pb-6">
        <h1 className="text-3xl font-bold">Kelola produk</h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          Atur informasi produk, hubungkan dengan kategori, dan pantau stok toko.
        </p>
      </header>
      <ProductManager
        key={edit ?? "list"}
        initialEditId={edit && /^[1-9]\d*$/.test(edit) ? Number(edit) : undefined}
        canDelete={profile.role === "owner"}
        initialProducts={(products.data ?? []) as unknown as Product[]}
        categories={(categories.data ?? []) as ProductCategory[]}
      />
    </section>
  );
}
