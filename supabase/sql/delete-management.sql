grant delete on public.products to authenticated;

create policy "Pemilik aktif dapat menghapus produk"
on public.products for delete to authenticated
using (
  exists (
    select 1 from public.admin_profiles as admin
    where admin.user_id = (select auth.uid())
      and admin.is_active = true
      and admin.role = 'owner'
  )
);

create or replace function public.delete_category_and_move_products(
  p_category_id bigint,
  p_target_category_id bigint,
  p_expected_updated_at timestamptz
)
returns jsonb
language plpgsql
security invoker
set search_path = ''
as $function$
declare
  v_updated_at timestamptz;
  v_has_products boolean;
  v_moved integer := 0;
  v_deleted integer;
begin
  if not exists (
    select 1 from public.admin_profiles
    where user_id = (select auth.uid())
      and is_active = true and role = 'owner'
  ) then
    raise exception using errcode = '42501', message = 'owner_required';
  end if;
  if p_category_id is null or p_expected_updated_at is null then
    raise exception using errcode = '22023', message = 'invalid_category';
  end if;
  if p_target_category_id = p_category_id then
    raise exception using errcode = '22023', message = 'invalid_target_category';
  end if;

  -- Parent locks also block new foreign-key references during the move/delete.
  perform id from public.categories
  where id = p_category_id or id = p_target_category_id
  order by id for update;

  select updated_at into v_updated_at from public.categories where id = p_category_id;
  if not found then
    raise exception using errcode = 'P0001', message = 'category_not_found';
  end if;
  if v_updated_at is distinct from p_expected_updated_at then
    raise exception using errcode = 'P0001', message = 'category_changed';
  end if;
  if p_target_category_id is not null and not exists (
    select 1 from public.categories where id = p_target_category_id and is_active = true
  ) then
    raise exception using errcode = 'P0001', message = 'target_category_unavailable';
  end if;

  select exists(select 1 from public.products where category_id = p_category_id) into v_has_products;
  if v_has_products and p_target_category_id is null then
    raise exception using errcode = 'P0001', message = 'category_requires_target';
  end if;
  if p_target_category_id is not null then
    update public.products set category_id = p_target_category_id where category_id = p_category_id;
    get diagnostics v_moved = row_count;
  end if;

  delete from public.categories where id = p_category_id;
  get diagnostics v_deleted = row_count;
  if v_deleted <> 1 then
    raise exception using errcode = 'P0001', message = 'category_not_found';
  end if;
  return jsonb_build_object('deleted_id', p_category_id, 'moved_count', v_moved, 'target_id', p_target_category_id);
end;
$function$;

revoke all on function public.delete_category_and_move_products(bigint, bigint, timestamptz) from public, anon, authenticated;
grant execute on function public.delete_category_and_move_products(bigint, bigint, timestamptz) to authenticated;
