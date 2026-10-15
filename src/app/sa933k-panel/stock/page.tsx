import Link from "next/link";
import { redirect } from "next/navigation";
import { getAdminContext } from "@/feat/sa933k-panel/admin-context";
import { stockFilterSchema, pageNumber } from "@/feat/stock/filters";
import { STOCK_PRODUCT_COLUMNS, type StockProduct } from "@/feat/stock/schema";
import { ROUTES } from "@/lib/config";
import { getPrivateMetadata } from "@/lib/seo";
import { StockFilterForm } from "./_partials/stock-filter-form";
import { StockManager } from "./_partials/stock-manager";
import { PanelStatCard } from "@/components/panel/stat-card";
import { getStockSummary } from "@/feat/stock/summary";

export const metadata = getPrivateMetadata("Kelola Stok");
const PAGE_SIZE = 20;

export default async function StockPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const { supabase, profile } = await getAdminContext();
  if (!profile) redirect(ROUTES.panel.dashboard);
  const filters = stockFilterSchema.parse({
    q: typeof params.q === "string" ? params.q.slice(0, 120) : "",
  });
  const requestedPage = pageNumber(typeof params.page === "string" ? params.page : "");
  const queryText = filters.q.replace(/[^\p{L}\p{N}\s-]/gu, " ").trim();
  const productsQuery = () => {
    let query = supabase.from("products").select(STOCK_PRODUCT_COLUMNS, { count: "exact" });
    if (queryText) query = query.or(`name.ilike.%${queryText}%,sku.ilike.%${queryText}%`);
    return query.order("name").order("id");
  };
  const [initialResult, summary] = await Promise.all([
    productsQuery().range((requestedPage - 1) * PAGE_SIZE, requestedPage * PAGE_SIZE - 1),
    getStockSummary((afterId) =>
      supabase.from("products").select("id,current_stock").gt("id", afterId).order("id").limit(500),
    ),
  ]);
  let result = initialResult;
  if (result.error) throw new Error("Data stok gagal dimuat.");
  const total = result.count ?? 0;
  const lastPage = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const page = Math.min(requestedPage, lastPage);
  if (page !== requestedPage) {
    result = await productsQuery().range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);
    if (result.error) throw new Error("Data stok gagal dimuat.");
  }
  const products = (result.data ?? []) as StockProduct[];
  const ids = [...new Set(products.map((product) => product.category_id))];
  const categories = ids.length
    ? await supabase.from("categories").select("id,name,is_active").in("id", ids)
    : { data: [], error: null };
  if (categories.error) throw new Error("Kategori produk gagal dimuat.");
  const pageUrl = (value: number) => {
    const query = new URLSearchParams();
    if (filters.q) query.set("q", filters.q);
    if (value > 1) query.set("page", String(value));
    return `${ROUTES.panel.stock}?${query}`;
  };
  return (
    <section className="mx-auto max-w-6xl px-6 py-12">
      <Link
        href={ROUTES.panel.dashboard}
        className="inline-flex min-h-11 items-center text-sm font-medium underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      >
        Kembali ke panel
      </Link>
      <header className="mt-3 border-b border-border pb-6">
        <h1 className="text-3xl font-bold">Stok produk</h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          Lihat jumlah barang yang tersedia. Pilih Ubah stok untuk memperbarui jumlahnya.
        </p>
      </header>
      <section className="mt-6" aria-label="Ringkasan stok semua produk">
        <dl className="grid grid-cols-1 gap-3 min-[400px]:grid-cols-2 md:grid-cols-3">
          <PanelStatCard label="Total produk" value={summary.products} unit="produk" />
          <PanelStatCard label="Total stok" value={summary.units} unit="unit" />
          <PanelStatCard label="Produk habis" value={summary.empty} unit="produk" />
        </dl>
        <p className="mt-3 text-xs leading-5 text-muted-foreground">
          Ringkasan seluruh produk, termasuk produk nonaktif. Tidak mengikuti pencarian.
        </p>
      </section>
      <StockFilterForm key={filters.q} filters={filters} />
      <StockManager products={products} categories={categories.data ?? []} filtered={!!filters.q} />
      {lastPage > 1 && (
        <nav className="mt-5 flex flex-wrap items-center gap-4" aria-label="Halaman stok">
          <p className="text-sm text-muted-foreground">
            Halaman {page} dari {lastPage}
          </p>
          {page > 1 && (
            <Link
              className="inline-flex min-h-11 items-center text-sm underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              href={pageUrl(page - 1)}
            >
              Sebelumnya
            </Link>
          )}
          {page < lastPage && (
            <Link
              className="inline-flex min-h-11 items-center text-sm underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              href={pageUrl(page + 1)}
            >
              Berikutnya
            </Link>
          )}
        </nav>
      )}
    </section>
  );
}
