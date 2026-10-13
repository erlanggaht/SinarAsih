-- Public bucket: sinar asih. Path: category-name/product-slug-SKU/uuid.ext.
-- Category names are normalized to lowercase words separated by hyphens.
-- Unique uploads do not overwrite existing images.
create policy "Active admins upload product images"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'sinar asih'
  and array_length(storage.foldername(name), 1) = 2
  and (storage.foldername(name))[1] ~ '^[a-z0-9]+(-[a-z0-9]+)*$'
  and (storage.foldername(name))[2] ~ '^[a-z0-9]+(-[a-z0-9]+)*-[A-Z0-9]+(-[A-Z0-9]+)*$'
  and storage.filename(name) ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(jpg|png|webp)$'
  and exists (
    select 1 from public.admin_profiles as admin
    where admin.user_id = (select auth.uid()) and admin.is_active = true
  )
);
