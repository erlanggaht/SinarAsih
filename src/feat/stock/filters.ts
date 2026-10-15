import { z } from "zod";

export const stockFilterSchema = z.object({
  q: z.string().trim().max(120),
});
export type StockFilters = z.infer<typeof stockFilterSchema>;

export function pageNumber(value: string | undefined): number {
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed > 0 ? Math.min(parsed, 100000) : 1;
}
