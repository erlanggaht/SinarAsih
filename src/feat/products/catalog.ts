import "server-only";
import { createClient } from "@supabase/supabase-js";
import { cache } from "react";
import { CATEGORY_COLUMNS, type Category } from "@/feat/categories/schema";
import { PRODUCT_COLUMNS, type Product } from "./schema";

function createPublicClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}

export const getPublicCategories = cache(async (): Promise<Category[]> => {
  const supabase = createPublicClient();
  const categories: Category[] = [];
  for (let offset = 0; ; offset += 500) {
    const result = await supabase
      .from("categories")
      .select(CATEGORY_COLUMNS)
      .eq("is_active", true)
      .order("id")
      .range(offset, offset + 499)
      .abortSignal(AbortSignal.timeout(8000));
    if (result.error) throw new Error("Kategori gagal dimuat.");
    categories.push(...(result.data as Category[]));
    if (result.data.length < 500) break;
  }
  return categories.sort((a, b) => a.name.localeCompare(b.name, "id"));
});

export async function getCatalogData() {
  const supabase = createPublicClient();
  const categories = await getPublicCategories();
  const products: Product[] = [];
  for (let offset = 0; ; offset += 500) {
    const result = await supabase
      .from("products")
      .select(PRODUCT_COLUMNS)
      .eq("is_active", true)
      .order("id")
      .range(offset, offset + 499);
    if (result.error) throw new Error("Produk gagal dimuat.");
    products.push(...(result.data as unknown as Product[]));
    if (result.data.length < 500) break;
  }
  const activeIds = new Set(categories.map((category) => category.id));
  return {
    categories,
    products: products.filter((product) => activeIds.has(product.category_id)),
  };
}
