type StockSummaryRow = { id: number; current_stock: number };
export type StockSummary = { products: number; units: number; empty: number };

export async function getStockSummary(
  fetchBatch: (afterId: number) => PromiseLike<{
    data: StockSummaryRow[] | null;
    error: unknown;
  }>,
): Promise<StockSummary> {
  const summary: StockSummary = { products: 0, units: 0, empty: 0 };
  let afterId = 0;
  for (;;) {
    const { data, error } = await fetchBatch(afterId);
    if (error || !data) throw new Error("Ringkasan stok gagal dimuat.");
    if (data.length === 0) return summary;
    for (const product of data) {
      summary.products += 1;
      summary.units += product.current_stock;
      if (product.current_stock === 0) summary.empty += 1;
    }
    const nextId = data[data.length - 1].id;
    if (nextId <= afterId) throw new Error("Ringkasan stok gagal dimuat.");
    afterId = nextId;
  }
}
