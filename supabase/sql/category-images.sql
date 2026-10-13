alter table public.categories add column if not exists image_path text;
alter table public.categories add constraint categories_image_path_length
  check (length(image_path) <= 2000);

insert into storage.buckets(id, name, public, file_size_limit, allowed_mime_types)
values ('category-images', 'category-images', true, 5242880, array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

create policy "Active admins upload category images" on storage.objects
for insert to authenticated with check (
  bucket_id = 'category-images'
  and array_length(storage.foldername(name), 1) = 1
  and (storage.foldername(name))[1] = (select auth.uid())::text
  and storage.filename(name) ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(jpg|png|webp)$'
  and exists (select 1 from public.admin_profiles where user_id = (select auth.uid()) and is_active)
);

-- Preserve the existing category artwork as initial database values.
update public.categories c set image_path = artwork.image_path
from (values
  ('smart-wearable', '/categories/miband.png'),
  ('laptop-komputer', '/categories/asusLaptop.png'),
  ('perangkat-gaming', '/categories/joystick.png'),
  ('smartphone', '/categories/realme10.png'),
  ('smart-tv', '/categories/smartMiTv.png'),
  ('printer-scanner', '/categories/printer_l220.png'),
  ('penyimpanan', '/categories/storage.png'),
  ('aksesori', '/categories/tg.png')
) as artwork(slug, image_path)
where c.slug = artwork.slug and c.image_path is null;
