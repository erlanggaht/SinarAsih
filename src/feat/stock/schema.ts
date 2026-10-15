import { z } from "zod";

export const MAX_STOCK = 2147483647;
export const stockFormSchema = z.object({
  quantity: z
    .number({ error: "Masukkan jumlah stok." })
    .int("Jumlah stok harus bulat.")
    .min(0, "Jumlah stok tidak boleh negatif.")
    .max(MAX_STOCK, "Jumlah stok terlalu besar."),
});
export type StockFormValues = z.infer<typeof stockFormSchema>;
export const stockActionSchema = stockFormSchema.extend({
  product_id: z.number().int().positive().safe(),
  expected_stock: z.number().int().min(0).max(MAX_STOCK),
  expected_updated_at: z.iso.datetime({ offset: true }),
  request_id: z.uuid(),
});
export type StockProduct = {
  id: number;
  name: string;
  sku: string;
  category_id: number;
  current_stock: number;
  is_active: boolean;
  updated_at: string;
};
export const STOCK_PRODUCT_COLUMNS =
  "id, name, sku, category_id, current_stock, is_active, updated_at";
