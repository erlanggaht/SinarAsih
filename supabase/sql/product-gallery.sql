-- Applied to Sinar Asih: add_product_gallery_slots
alter table public.products
  add column if not exists image_path_2 text,
  add column if not exists image_path_3 text;
