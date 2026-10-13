-- Preserve existing public photos only when a matching admin profile already exists.
update public.admin_profiles p
set image_path = coalesce(p.image_path, legacy.image_path),
    instagram = coalesce(p.instagram, legacy.instagram),
    updated_at = clock_timestamp()
from (values
  ('Yusuf Saeful Rizkie', '/team/yusuf.jpg', 'https://www.instagram.com/inidiaucup_/'),
  ('Dede Kusnandar', '/team/dede.jpeg', 'https://www.instagram.com/dsadiprja_/'),
  ('Erlangga Hidayatullah', '/team/erlangga.webp', 'https://www.instagram.com/erlanggaht93')
) as legacy(full_name, image_path, instagram)
where p.full_name = legacy.full_name and (p.image_path is null or p.instagram is null);
