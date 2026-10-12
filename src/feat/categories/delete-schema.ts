import { z } from "zod";

export function categoryDeleteFormSchema(sourceId: number, requiresTarget: boolean) {
  return z.object({
    target_category_id: z.string().refine((value) => {
      if (!value) return !requiresTarget;
      return (
        /^[1-9]\d*$/.test(value) &&
        Number.isSafeInteger(Number(value)) &&
        Number(value) !== sourceId
      );
    }, "Pilih kategori tujuan yang berbeda dari kategori yang dihapus."),
    confirmed: z
      .boolean()
      .refine((value) => value, "Centang persetujuan sebelum menghapus kategori."),
  });
}

export const categoryDeleteRequestSchema = z
  .object({
    id: z.number().int().positive().safe(),
    updated_at: z.iso.datetime({ offset: true }),
    target_category_id: z.number().int().positive().safe().nullable(),
    confirmed: z.literal(true),
  })
  .refine((value) => value.target_category_id !== value.id, "Kategori tujuan harus berbeda.");

export type CategoryDeletePreview = {
  category: { id: number; name: string; updated_at: string };
  productCount: number;
  targets: { id: number; name: string }[];
};
