-- Public access is limited to public team columns and active profiles.
revoke select on public.admin_profiles from anon;
grant select (full_name, image_path, role, whatsapp, instagram, is_active)
  on public.admin_profiles to anon;
create policy "Public reads active team fields" on public.admin_profiles
  for select to anon using (is_active);

create or replace function public.get_public_team()
returns table(full_name text, image_path text, role text, whatsapp text, instagram text)
language sql stable security invoker set search_path = '' as $$
  select p.full_name, p.image_path, p.role, p.whatsapp, p.instagram
  from public.admin_profiles p where p.is_active
  order by case when p.role = 'owner' then 0 else 1 end, p.full_name;
$$;

-- Keep the privileged implementation outside the exposed API schema.
alter function public.save_admin_profile(uuid,text,text,text,text,text,text,boolean,timestamptz)
  set schema private;
create function public.save_admin_profile(
  p_user_id uuid, p_full_name text, p_username text, p_image_path text,
  p_whatsapp text, p_instagram text, p_role text, p_is_active boolean, p_updated_at timestamptz
)
returns public.admin_profiles language sql security invoker set search_path = '' as $$
  select private.save_admin_profile(p_user_id, p_full_name, p_username, p_image_path,
    p_whatsapp, p_instagram, p_role, p_is_active, p_updated_at);
$$;
revoke all on function public.save_admin_profile(uuid,text,text,text,text,text,text,boolean,timestamptz) from public, anon;
grant execute on function public.save_admin_profile(uuid,text,text,text,text,text,text,boolean,timestamptz) to authenticated;
