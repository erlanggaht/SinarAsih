begin;

do $$
declare
  owner_id uuid := gen_random_uuid();
  staff_id uuid := gen_random_uuid();
  inactive_id uuid := gen_random_uuid();
  staff_version timestamptz;
  owner_version timestamptz;
  saved public.admin_profiles;
begin
  perform set_config('test.owner_id', owner_id::text, true);
  perform set_config('test.staff_id', staff_id::text, true);
  insert into auth.users (id, email) values
    (owner_id, owner_id::text || '@example.invalid'),
    (staff_id, staff_id::text || '@example.invalid'),
    (inactive_id, inactive_id::text || '@example.invalid');
  insert into public.admin_profiles(user_id, full_name, email, role, is_active) values
    (owner_id, 'Owner fixture', owner_id::text || '@example.invalid', 'owner', true),
    (staff_id, 'Staff fixture', staff_id::text || '@example.invalid', 'staff', true),
    (inactive_id, 'Inactive fixture', inactive_id::text || '@example.invalid', 'staff', false);
  select updated_at into staff_version from public.admin_profiles where user_id = staff_id;
  select updated_at into owner_version from public.admin_profiles where user_id = owner_id;

  perform set_config('request.jwt.claims', json_build_object('sub', staff_id, 'role', 'authenticated')::text, true);
  saved := public.save_admin_profile(staff_id, 'Updated staff', '', '/team/erlangga.webp', '6281234567890', '', 'staff', true, staff_version, 'Sales Xiaomi');
  assert saved.full_name = 'Updated staff' and saved.updated_at <> staff_version, 'Self profile edit must persist and advance the version';
  assert saved.position = 'Sales Xiaomi', 'Position did not persist';
  staff_version := saved.updated_at;
  begin
    perform public.save_admin_profile(staff_id, 'Updated staff', '', '', '', '', 'owner', true, staff_version);
    raise exception 'Staff privilege escalation was allowed';
  exception when insufficient_privilege then null;
  end;
  begin
    perform public.save_admin_profile(owner_id, 'Changed owner', '', '', '', '', 'owner', true, owner_version);
    raise exception 'Staff edited another account';
  exception when insufficient_privilege then null;
  end;

  perform set_config('request.jwt.claims', json_build_object('sub', owner_id, 'role', 'authenticated')::text, true);
  assert private.is_active_owner(), 'Active owner lookup failed';
  saved := public.save_admin_profile(staff_id, 'Updated staff', '', '', '', '', 'staff', false, staff_version);
  assert saved.position = 'Sales Xiaomi', 'Legacy update cleared position';
  assert not saved.is_active, 'Owner could not deactivate a staff account';
  begin
    perform public.save_admin_profile(staff_id, 'Stale write', '', '', '', '', 'staff', true, staff_version);
    raise exception 'Stale profile update was allowed';
  exception when serialization_failure then null;
  end;
  begin
    perform public.save_admin_profile(owner_id, 'Owner fixture', '', '', '', '', 'staff', false, owner_version);
    raise exception 'Owner removed own access';
  exception when insufficient_privilege then null;
  end;

  perform set_config('request.jwt.claims', json_build_object('sub', staff_id, 'role', 'authenticated')::text, true);
  begin
    perform public.save_admin_profile(staff_id, 'Inactive write', '', '', '', '', 'staff', false, saved.updated_at);
    raise exception 'Inactive account edited a profile';
  exception when insufficient_privilege then null;
  end;
  assert not has_function_privilege('anon', 'public.save_admin_profile(uuid,text,text,text,text,text,text,boolean,timestamptz,text)', 'EXECUTE'), 'Anonymous users can write profiles';
  assert not has_column_privilege('anon', 'public.admin_profiles', 'email', 'SELECT'), 'Public email exposure';
  assert not has_column_privilege('anon', 'public.admin_profiles', 'username', 'SELECT'), 'Public username exposure';
  assert not has_column_privilege('anon', 'public.admin_profiles', 'user_id', 'SELECT'), 'Public user ID exposure';
  assert has_column_privilege('anon', 'public.admin_profiles', 'position', 'SELECT'), 'Public position unavailable';
  assert has_column_privilege('anon', 'public.admin_profiles', 'image_path', 'SELECT'), 'Public photo unavailable';
  assert not exists (select 1 from public.get_public_team() where full_name = 'Inactive fixture'), 'Inactive profile exposed on team page';
end;
$$;

select set_config('request.jwt.claims', json_build_object('sub', current_setting('test.owner_id'), 'role', 'authenticated')::text, true);
set local role authenticated;
do $$ begin
  assert (select count(*) from public.admin_profiles where full_name in ('Owner fixture','Updated staff','Inactive fixture')) = 3, 'Owner cannot list all profiles';
end $$;
reset role;

select set_config('request.jwt.claims', json_build_object('sub', current_setting('test.staff_id'), 'role', 'authenticated')::text, true);
set local role authenticated;
do $$ begin
  assert (select count(*) from public.admin_profiles where full_name in ('Owner fixture','Updated staff','Inactive fixture')) = 1, 'Staff can read other profiles';
end $$;
reset role;

-- This proves the public RPC runs under actual anonymous permissions and RLS.
set local role anon;
select full_name, image_path, "position" from public.get_public_team();
reset role;

rollback;
