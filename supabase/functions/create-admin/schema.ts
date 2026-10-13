import { z } from "zod";

export const adminProfileSchema = z.object({
  full_name: z.string().trim().min(1, "Nama wajib diisi.").max(200, "Nama maksimal 200 karakter."),
  position: z.string().trim().max(120, "Posisi maksimal 120 karakter.").default(""),
  username: z
    .string()
    .trim()
    .max(100)
    .refine(
      (value) => !value || /^[a-zA-Z0-9_.-]+$/.test(value),
      "Username hanya boleh berisi huruf, angka, titik, garis bawah, dan tanda hubung.",
    ),
  image_path: z
    .string()
    .trim()
    .max(2000)
    .refine((value) => {
      if (!value) return true;
      if (value.startsWith("/") && !value.startsWith("//") && !value.includes("\\")) return true;
      try {
        return new URL(value).protocol === "https:";
      } catch {
        return false;
      }
    }, "Gunakan URL HTTPS atau path gambar lokal."),
  whatsapp: z
    .string()
    .trim()
    .refine(
      (value) => !value || /^62\d{8,13}$/.test(value),
      "Gunakan nomor WhatsApp dengan kode negara, misalnya 6281234567890.",
    ),
  instagram: z
    .string()
    .trim()
    .max(200)
    .refine(
      (value) => !value || /^https:\/\/(www\.)?instagram\.com\/[A-Za-z0-9_.]+\/?$/.test(value),
      "Gunakan URL profil Instagram, misalnya https://www.instagram.com/namaakun/ .",
    ),
  role: z.enum(["owner", "staff"]),
  is_active: z.boolean(),
});

export const createAdminSchema = adminProfileSchema.extend({
  email: z
    .email("Masukkan email yang valid.")
    .max(254)
    .transform((value) => value.toLowerCase()),
  password: z
    .string()
    .min(8, "Password minimal 8 karakter.")
    .max(72, "Password maksimal 72 karakter."),
});
export const profileIdentitySchema = z.object({
  user_id: z.uuid(),
  updated_at: z.iso.datetime({ offset: true }),
});
export type AdminProfileValues = z.infer<typeof adminProfileSchema>;
export type AdminProfile = Omit<
  AdminProfileValues,
  "username" | "image_path" | "whatsapp" | "instagram" | "position"
> & {
  position: string | null;
  user_id: string;
  email: string;
  username: string | null;
  image_path: string | null;
  whatsapp: string | null;
  instagram: string | null;
  created_at: string;
  updated_at: string;
};
export type PublicTeamMember = Pick<
  AdminProfile,
  "full_name" | "image_path" | "position" | "whatsapp" | "instagram"
>;
export const ADMIN_PROFILE_COLUMNS =
  "user_id, full_name, position, email, username, image_path, whatsapp, instagram, role, is_active, created_at, updated_at";
export const PROFILE_IMAGE_BUCKET = "admin-profile-images";
