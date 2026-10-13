import { createClient } from "@/lib/supabase/client";
import { PRODUCT_IMAGE_TYPES, validateProductImage } from "@/feat/products/image-upload";

export const CATEGORY_IMAGE_BUCKET = "category-images";

export async function uploadCategoryImage(file: File) {
  const invalid = validateProductImage(file);
  if (invalid) throw new Error(invalid);
  const supabase = createClient();
  const { data: auth, error: authError } = await supabase.auth.getUser();
  if (authError || !auth.user) throw new Error("Sesi telah berakhir. Silakan masuk kembali.");
  const path = `${auth.user.id}/${crypto.randomUUID()}.${PRODUCT_IMAGE_TYPES[file.type]}`;
  const { error } = await supabase.storage.from(CATEGORY_IMAGE_BUCKET).upload(path, file, {
    upsert: false,
    contentType: file.type,
    cacheControl: "3600",
  });
  if (error) throw new Error("Gambar kategori gagal diunggah. Periksa koneksi lalu coba kembali.");
  return supabase.storage.from(CATEGORY_IMAGE_BUCKET).getPublicUrl(path).data.publicUrl;
}
