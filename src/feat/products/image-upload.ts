export const PRODUCT_IMAGE_BUCKET = "sinar asih";
export const PRODUCT_IMAGE_MAX_BYTES = 5 * 1024 * 1024;
export const PRODUCT_IMAGE_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export function validateProductImage(file: { type: string; size: number }) {
  if (!PRODUCT_IMAGE_TYPES[file.type]) return "Gunakan gambar JPG, PNG, atau WebP.";
  if (file.size <= 0) return "File gambar kosong. Pilih gambar lain.";
  if (file.size > PRODUCT_IMAGE_MAX_BYTES) return "Ukuran gambar maksimal 5 MB.";
  return null;
}
