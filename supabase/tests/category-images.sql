begin;

do $$
declare active_id uuid := gen_random_uuid(); inactive_id uuid := gen_random_uuid(); other_id uuid := gen_random_uuid();
begin
  perform set_config('test.active_id', active_id::text, true);
  perform set_config('test.inactive_id', inactive_id::text, true);
  perform set_config('test.other_id', other_id::text, true);
  insert into auth.users(id, email) values
    (active_id, active_id::text || '@example.invalid'),
    (inactive_id, inactive_id::text || '@example.invalid');
  insert into public.admin_profiles(user_id, full_name, email, role, is_active) values
    (active_id, 'Category image active fixture', active_id::text || '@example.invalid', 'staff', true),
    (inactive_id, 'Category image inactive fixture', inactive_id::text || '@example.invalid', 'staff', false);
end $$;

select set_config('request.jwt.claims', json_build_object('sub', current_setting('test.active_id'), 'role', 'authenticated')::text, true);
set local role authenticated;
do $$
declare saved_image text;
begin
  insert into public.categories(name, slug, image_path, is_active)
    values ('Category image fixture', 'image-fixture-' || current_setting('test.active_id'), 'https://example.invalid/image.png', true);
  select image_path into saved_image from public.categories where slug = 'image-fixture-' || current_setting('test.active_id');
  assert saved_image = 'https://example.invalid/image.png', 'Category image was not saved';
  update public.categories set image_path = null where slug = 'image-fixture-' || current_setting('test.active_id');
  assert (select image_path is null from public.categories where slug = 'image-fixture-' || current_setting('test.active_id')), 'Category image could not be cleared';
  update public.categories set image_path = '/categories/asusLaptop.png' where slug = 'image-fixture-' || current_setting('test.active_id');
  insert into storage.objects(bucket_id, name) values ('category-images', current_setting('test.active_id') || '/' || gen_random_uuid()::text || '.png');
  begin
    insert into storage.objects(bucket_id, name) values ('category-images', current_setting('test.other_id') || '/' || gen_random_uuid()::text || '.png');
    raise exception 'Upload into another user folder was allowed';
  exception when insufficient_privilege then null;
  end;
  begin
    insert into storage.objects(bucket_id, name) values ('category-images', current_setting('test.active_id') || '/' || gen_random_uuid()::text || '.svg');
    raise exception 'SVG upload was allowed';
  exception when insufficient_privilege then null;
  end;
end $$;
reset role;

select set_config('request.jwt.claims', json_build_object('sub', current_setting('test.inactive_id'), 'role', 'authenticated')::text, true);
set local role authenticated;
do $$
declare updated_count integer;
begin
  update public.categories set image_path = '/categories/miband.png' where slug = 'image-fixture-' || current_setting('test.active_id');
  get diagnostics updated_count = row_count;
  assert updated_count = 0, 'Inactive admin edited category images';
  begin
    insert into storage.objects(bucket_id, name) values ('category-images', current_setting('test.inactive_id') || '/' || gen_random_uuid()::text || '.png');
    raise exception 'Inactive admin uploaded a category image';
  exception when insufficient_privilege then null;
  end;
end $$;
reset role;

select set_config('request.jwt.claims', '{}', true);
set local role anon;
do $$ begin
  assert (select image_path = '/categories/asusLaptop.png' from public.categories where slug = 'image-fixture-' || current_setting('test.active_id')), 'Public category image unavailable';
  begin
    insert into storage.objects(bucket_id, name) values ('category-images', current_setting('test.active_id') || '/' || gen_random_uuid()::text || '.png');
    raise exception 'Anonymous upload was allowed';
  exception when insufficient_privilege then null;
  end;
end $$;
reset role;

rollback;
