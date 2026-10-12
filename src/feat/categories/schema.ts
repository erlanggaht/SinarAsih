import { z } from "zod";

export const categorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Nama kategori wajib diisi.")
    .max(120, "Nama maksimal 120 karakter."),
  slug: z
    .string()
    .trim()
    .min(1, "Slug wajib diisi.")
    .max(160, "Slug maksimal 160 karakter.")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Gunakan huruf kecil, angka, dan tanda hubung, misalnya laptop-komputer.",
    ),
  description: z.string().trim().max(2000, "Deskripsi maksimal 2.000 karakter."),
  is_active: z.boolean(),
});

export type CategoryValues = z.infer<typeof categorySchema>;
export type Category = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  is_active: boolean;
};

export function categorySlug(name: string) {
  return name
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
