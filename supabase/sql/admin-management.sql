alter table public.admin_profiles
  add column if not exists image_path text,
  add column if not exists whatsapp text,
  add column if not exists instagram text;

create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to authenticated;

create or replace function private.is_active_owner()
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.admin_profiles
    where user_id = (select auth.uid()) and is_active and role = 'owner');
$$;
revoke all on function private.is_active_owner() from public, anon;
grant execute on function private.is_active_owner() to authenticated;

create policy "Owners read admin profiles" on public.admin_profiles
for select to authenticated using ((select private.is_active_owner()));

-- Only explicitly public team fields are returned. Emails, usernames and user IDs stay private.
create or replace function public.get_public_team()
returns table(full_name text, image_path text, role text, whatsapp text, instagram text)
language sql stable security definer set search_path = '' as $$
  select p.full_name, p.image_path, p.role, p.whatsapp, p.instagram
  from public.admin_profiles p where p.is_active
  order by case when p.role = 'owner' then 0 else 1 end, p.full_name, p.user_id;
$$;
revoke all on function public.get_public_team() from public;
grant execute on function public.get_public_team() to anon, authenticated;

create or replace function public.save_admin_profile(
  p_user_id uuid, p_full_name text, p_username text, p_image_path text,
  p_whatsapp text, p_instagram text, p_role text, p_is_active boolean, p_updated_at timestamptz
)
returns public.admin_profiles
language plpgsql security definer set search_path = '' as $$
declare actor public.admin_profiles; target public.admin_profiles; saved public.admin_profiles;
begin
  select * into actor from public.admin_profiles where user_id = (select auth.uid()) for update;
  if actor.user_id is null or not actor.is_active then
    raise exception 'Sesi pengelola tidak aktif.' using errcode = '42501';
  end if;
  if actor.role <> 'owner' and p_user_id <> actor.user_id then
    raise exception 'Hanya pemilik yang dapat mengelola akun lain.' using errcode = '42501';
  end if;
  select * into target from public.admin_profiles where user_id = p_user_id for update;
  if target.user_id is null or target.updated_at is distinct from p_updated_at then
    raise exception 'Profil sudah berubah. Muat ulang halaman.' using errcode = '40001';
  end if;
  if p_role not in ('owner', 'staff') or p_role is null or p_is_active is null then
    raise exception 'Peran atau status tidak valid.' using errcode = '22023';
  end if;
  if p_user_id = actor.user_id and (p_role <> actor.role or p_is_active <> actor.is_active) then
    raise exception 'Peran dan status akun sendiri tidak dapat diubah.' using errcode = '42501';
  end if;
  if length(trim(p_full_name)) not between 1 and 200
    or length(coalesce(p_username, '')) > 100
    or (nullif(p_username, '') is not null and p_username !~ '^[a-zA-Z0-9_.-]+$')
    or length(coalesce(p_image_path, '')) > 2000
    or (nullif(p_image_path, '') is not null and p_image_path !~ '^(https://[^[:space:]]+|/[^/\\][^[:space:]\\]*)$')
    or (nullif(p_whatsapp, '') is not null and p_whatsapp !~ '^62[0-9]{8,13}$')
    or (nullif(p_instagram, '') is not null and (length(p_instagram) > 200 or p_instagram !~ '^https://(www\.)?instagram\.com/[A-Za-z0-9_.]+/?$')) then
    raise exception 'Data profil tidak valid.' using errcode = '22023';
  end if;
  update public.admin_profiles set full_name = trim(p_full_name),
    username = nullif(trim(p_username), ''), image_path = nullif(p_image_path, ''),
    whatsapp = nullif(p_whatsapp, ''), instagram = nullif(p_instagram, ''),
    role = p_role, is_active = p_is_active, updated_at = clock_timestamp()
    where user_id = p_user_id returning * into saved;
  return saved;
end;
$$;
revoke all on function public.save_admin_profile(uuid,text,text,text,text,text,text,boolean,timestamptz) from public, anon;
grant execute on function public.save_admin_profile(uuid,text,text,text,text,text,text,boolean,timestamptz) to authenticated;

insert into storage.buckets(id, name, public, file_size_limit, allowed_mime_types)
values ('admin-profile-images', 'admin-profile-images', true, 5242880, array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

create policy "Active admins upload own profile images" on storage.objects
for insert to authenticated with check (
  bucket_id = 'admin-profile-images'
  and array_length(storage.foldername(name), 1) = 1
  and (storage.foldername(name))[1] = (select auth.uid())::text
  and storage.filename(name) ~ '^[0-9a-f-]{36}\.(jpg|png|webp)$'
  and exists (select 1 from public.admin_profiles where user_id = (select auth.uid()) and is_active)
);
