create table public.stock_movements (
  id bigint generated always as identity primary key,
  product_id bigint not null references public.products(id) on delete restrict,
  product_name text not null,
  product_sku text not null,
  kind text not null check (kind in ('opening', 'in', 'out', 'adjust', 'reverse')),
  delta integer not null,
  stock_before integer not null check (stock_before >= 0),
  stock_after integer not null check (stock_after >= 0),
  reason text not null check (length(btrim(reason)) between 3 and 200),
  note text check (length(note) <= 1000),
  actor_id uuid references public.admin_profiles(user_id) on delete set null,
  actor_name text not null,
  request_id uuid unique,
  requested_quantity integer,
  expected_stock integer,
  expected_updated_at timestamptz,
  reversal_of bigint unique references public.stock_movements(id) on delete restrict,
  created_at timestamptz not null default clock_timestamp(),
  check (stock_after::bigint - stock_before::bigint = delta::bigint),
  check ((kind = 'reverse') = (reversal_of is not null)),
  check (kind = 'opening' or request_id is not null)
);

create index stock_movements_product_created_idx on public.stock_movements(product_id, created_at desc, id desc);
create index stock_movements_created_idx on public.stock_movements(created_at desc, id desc);
create index stock_movements_actor_idx on public.stock_movements(actor_id);

alter table public.stock_movements enable row level security;
revoke all on public.stock_movements from public, anon, authenticated;
grant select on public.stock_movements to authenticated;
create policy "Active admins read stock history" on public.stock_movements
for select to authenticated using (
  exists (select 1 from public.admin_profiles where user_id = (select auth.uid()) and is_active)
);

create view public.stock_inventory with (security_invoker = true) as
select id, name, sku, category_id, current_stock, minimum_stock, is_active, updated_at,
  case when current_stock = 0 then 'empty'
    when current_stock <= minimum_stock then 'low' else 'available' end as stock_status
from public.products;
revoke all on public.stock_inventory from public, anon, authenticated;
grant select on public.stock_inventory to authenticated;

-- Unchanged balances remain compatible with existing product edit clients.
create or replace function private.guard_product_stock_update()
returns trigger language plpgsql security invoker set search_path = '' as $$
begin
  if new.current_stock is distinct from old.current_stock
    and current_user not in ('postgres', 'service_role', 'supabase_admin') then
    raise exception 'use_stock_menu' using errcode = '42501';
  end if;
  return new;
end; $$;
revoke all on function private.guard_product_stock_update() from public, anon, authenticated;
create trigger products_guard_stock_update before update of current_stock on public.products
for each row execute function private.guard_product_stock_update();

create or replace function private.record_product_opening_stock()
returns trigger language plpgsql security definer set search_path = '' as $$
declare v_actor uuid := (select auth.uid()); v_name text;
begin
  if v_actor is not null then
    select full_name into v_name from public.admin_profiles
    where user_id = v_actor and is_active for share;
    if not found then raise exception 'active_admin_required' using errcode = '42501'; end if;
  end if;
  insert into public.stock_movements(product_id, product_name, product_sku, kind,
    delta, stock_before, stock_after, reason, actor_id, actor_name)
  values(new.id, new.name, new.sku, 'opening', new.current_stock, 0, new.current_stock,
    'Stok awal produk baru', v_actor, coalesce(v_name, 'Sistem'));
  return new;
end; $$;
revoke all on function private.record_product_opening_stock() from public, anon, authenticated;
create trigger products_record_opening_stock after insert on public.products
for each row execute function private.record_product_opening_stock();

insert into public.stock_movements(product_id, product_name, product_sku, kind,
  delta, stock_before, stock_after, reason, actor_name)
select id, name, sku, 'opening', current_stock, 0, current_stock,
  'Saldo awal saat fitur stok diaktifkan', 'Sistem' from public.products;

create or replace function private.record_stock_movement(
  p_product_id bigint, p_kind text, p_quantity integer, p_reason text, p_note text,
  p_expected_stock integer, p_expected_updated_at timestamptz, p_request_id uuid,
  p_reversal_of bigint default null
) returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  v_actor public.admin_profiles;
  v_product public.products;
  v_original public.stock_movements;
  v_existing public.stock_movements;
  v_after bigint;
  v_delta integer;
  v_id bigint;
  v_reason text := btrim(p_reason);
  v_note text := nullif(btrim(coalesce(p_note, '')), '');
begin
  select * into v_actor from public.admin_profiles
  where user_id = (select auth.uid()) and is_active for share;
  if not found then raise exception 'active_admin_required' using errcode = '42501'; end if;
  if p_kind is null or p_kind not in ('in','out','adjust','reverse')
    or p_request_id is null or p_expected_stock is null or p_expected_updated_at is null
    or v_reason is null or length(v_reason) not between 3 and 200
    or length(coalesce(v_note, '')) > 1000 then
    raise exception 'invalid_stock_input' using errcode = '22023';
  end if;
  if p_kind = 'reverse' and v_actor.role <> 'owner' then
    raise exception 'owner_required' using errcode = '42501';
  end if;
  if (p_kind = 'reverse') <> (p_reversal_of is not null)
    or (p_kind = 'reverse' and p_quantity is not null)
    or (p_kind <> 'reverse' and (p_quantity is null or p_quantity < 0))
    or (p_kind in ('in','out') and p_quantity = 0) then
    raise exception 'invalid_stock_input' using errcode = '22023';
  end if;

  select * into v_product from public.products where id = p_product_id for update;
  if not found then raise exception 'product_not_found' using errcode = 'P0001'; end if;

  select * into v_existing from public.stock_movements where request_id = p_request_id;
  if found then
    if v_existing.product_id <> p_product_id or v_existing.actor_id is distinct from v_actor.user_id
      or v_existing.kind <> p_kind or v_existing.requested_quantity is distinct from p_quantity
      or v_existing.reason <> v_reason or v_existing.note is distinct from v_note
      or v_existing.expected_stock is distinct from p_expected_stock
      or v_existing.expected_updated_at is distinct from p_expected_updated_at
      or v_existing.reversal_of is distinct from p_reversal_of then
      raise exception 'stock_request_conflict' using errcode = '22023';
    end if;
    return jsonb_build_object('movement_id', v_existing.id, 'stock_after', v_product.current_stock, 'replayed', true);
  end if;

  if v_product.current_stock <> p_expected_stock
    or v_product.updated_at is distinct from p_expected_updated_at then
    raise exception 'stock_changed' using errcode = '40001';
  end if;
  if not v_product.is_active then raise exception 'product_inactive' using errcode = 'P0001'; end if;

  if p_kind = 'reverse' then
    select * into v_original from public.stock_movements where id = p_reversal_of;
    if not found or v_original.product_id <> p_product_id or v_original.kind in ('opening','reverse') then
      raise exception 'invalid_reversal' using errcode = '22023';
    end if;
    if exists(select 1 from public.stock_movements where reversal_of = p_reversal_of) then
      raise exception 'already_reversed' using errcode = 'P0001';
    end if;
    v_after := v_product.current_stock::bigint - v_original.delta::bigint;
  elsif p_kind = 'adjust' then v_after := p_quantity;
  elsif p_kind = 'in' then v_after := v_product.current_stock::bigint + p_quantity::bigint;
  else v_after := v_product.current_stock::bigint - p_quantity::bigint;
  end if;
  if v_after < 0 then raise exception 'insufficient_stock' using errcode = 'P0001'; end if;
  if v_after > 2147483647 then raise exception 'stock_overflow' using errcode = '22003'; end if;
  v_delta := v_after - v_product.current_stock::bigint;
  if v_delta = 0 then raise exception 'stock_unchanged' using errcode = '22023'; end if;

  update public.products set current_stock = v_after::integer where id = p_product_id;
  insert into public.stock_movements(product_id, product_name, product_sku, kind, delta,
    stock_before, stock_after, reason, note, actor_id, actor_name, request_id,
    requested_quantity, expected_stock, expected_updated_at, reversal_of)
  values(v_product.id, v_product.name, v_product.sku, p_kind, v_delta, v_product.current_stock,
    v_after::integer, v_reason, v_note, v_actor.user_id, v_actor.full_name, p_request_id,
    p_quantity, p_expected_stock, p_expected_updated_at, p_reversal_of) returning id into v_id;
  return jsonb_build_object('movement_id', v_id, 'stock_after', v_after, 'replayed', false);
end; $$;

revoke all on function private.record_stock_movement(bigint,text,integer,text,text,integer,timestamptz,uuid,bigint) from public, anon, authenticated;
grant usage on schema private to authenticated;
grant execute on function private.record_stock_movement(bigint,text,integer,text,text,integer,timestamptz,uuid,bigint) to authenticated;

create or replace function public.record_stock_movement(
  p_product_id bigint, p_kind text, p_quantity integer, p_reason text, p_note text,
  p_expected_stock integer, p_expected_updated_at timestamptz, p_request_id uuid,
  p_reversal_of bigint default null
) returns jsonb language sql security invoker set search_path = '' as $$
  select private.record_stock_movement(p_product_id, p_kind, p_quantity, p_reason, p_note,
    p_expected_stock, p_expected_updated_at, p_request_id, p_reversal_of);
$$;
revoke all on function public.record_stock_movement(bigint,text,integer,text,text,integer,timestamptz,uuid,bigint) from public, anon, authenticated;
grant execute on function public.record_stock_movement(bigint,text,integer,text,text,integer,timestamptz,uuid,bigint) to authenticated;
