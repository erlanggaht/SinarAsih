begin;

do $$
declare owner_id uuid := gen_random_uuid(); staff_id uuid := gen_random_uuid(); inactive_id uuid := gen_random_uuid();
  category_id bigint; product_id bigint; token text := replace(gen_random_uuid()::text,'-','');
begin
  insert into auth.users(id,email) values (owner_id,owner_id::text||'@example.invalid'),
    (staff_id,staff_id::text||'@example.invalid'),(inactive_id,inactive_id::text||'@example.invalid');
  insert into public.admin_profiles(user_id,full_name,email,role,is_active) values
    (owner_id,'Stock owner fixture',owner_id::text||'@example.invalid','owner',true),
    (staff_id,'Stock staff fixture',staff_id::text||'@example.invalid','staff',true),
    (inactive_id,'Stock inactive fixture',inactive_id::text||'@example.invalid','staff',false);
  perform set_config('stocktest.owner',owner_id::text,true);
  perform set_config('stocktest.staff',staff_id::text,true);
  perform set_config('stocktest.inactive',inactive_id::text,true);
  perform set_config('request.jwt.claims',json_build_object('sub',owner_id,'role','authenticated')::text,true);
  insert into public.categories(name,slug) values('Stock fixture','stock-'||token) returning id into category_id;
  insert into public.products(category_id,name,sku,slug,current_stock,minimum_stock)
  values(category_id,'Stock fixture','STOCK-'||upper(token),'stock-'||token,5,2) returning id into product_id;
  perform set_config('stocktest.product',product_id::text,true);
end $$;

set local role authenticated;
do $$
declare
  pid bigint := current_setting('stocktest.product')::bigint;
  stamp timestamptz; initial_stamp timestamptz;
  request uuid := gen_random_uuid(); result jsonb; original_id bigint; out_id bigint; balance integer; entries integer;
begin
  select updated_at into stamp from public.products where id=pid;
  initial_stamp := stamp;
  assert (select count(*)=1 from public.stock_movements where product_id=pid and kind='opening' and stock_after=5), 'Opening entry missing';
  assert (select stock_status='available' from public.stock_inventory where id=pid), 'Inventory status incorrect';
  result := public.record_stock_movement(pid,'in',3,'Pembelian supplier','Test',5,stamp,request);
  original_id := (result->>'movement_id')::bigint;
  assert (select current_stock=8 from public.products where id=pid), 'Stock in failed';
  select updated_at into stamp from public.products where id=pid;
  result := public.record_stock_movement(pid,'out',2,'Penjualan','',8,stamp,gen_random_uuid());
  out_id := (result->>'movement_id')::bigint;
  assert (select current_stock=6 from public.products where id=pid), 'Stock out failed';
  select count(*) into entries from public.stock_movements where product_id=pid;
  result := public.record_stock_movement(pid,'in',3,'Pembelian supplier','Test',5,initial_stamp,request);
  assert (result->>'replayed')::boolean and (result->>'movement_id')::bigint=original_id, 'Retry not idempotent';
  assert (select count(*)=entries from public.stock_movements where product_id=pid), 'Duplicate history';
  assert (select current_stock=6 from public.products where id=pid), 'Retry changed stock';
  begin
    perform public.record_stock_movement(pid,'in',4,'Pembelian supplier','Test',5,initial_stamp,request);
    raise exception 'Reused request with altered payload accepted';
  exception when invalid_parameter_value then assert sqlerrm='stock_request_conflict'; end;
  select updated_at into stamp from public.products where id=pid;
  begin
    perform public.record_stock_movement(pid,'out',7,'Penjualan','',6,stamp,gen_random_uuid());
    raise exception 'Oversell accepted';
  exception when raise_exception then assert sqlerrm='insufficient_stock'; end;
  begin
    perform public.record_stock_movement(pid,'in',2147483647,'Pembelian supplier','',6,stamp,gen_random_uuid());
    raise exception 'Overflow accepted';
  exception when numeric_value_out_of_range then assert sqlerrm='stock_overflow'; end;
  begin
    perform public.record_stock_movement(pid,'out',1,'Penjualan','',5,initial_stamp,gen_random_uuid());
    raise exception 'Stale snapshot accepted';
  exception when serialization_failure then null; end;
  begin
    perform public.record_stock_movement(pid,'out',0,'Penjualan','',6,stamp,gen_random_uuid());
    raise exception 'Zero outgoing accepted';
  exception when invalid_parameter_value then null; end;
  begin
    perform public.record_stock_movement(pid,'adjust',4,'','',6,stamp,gen_random_uuid());
    raise exception 'Missing reason accepted';
  exception when invalid_parameter_value then null; end;
  assert (select current_stock=6 from public.products where id=pid), 'Failed calls changed stock';
  assert (select count(*)=entries from public.stock_movements where product_id=pid), 'Failed calls changed history';
  result := public.record_stock_movement(pid,'adjust',4,'Hitung fisik','',6,stamp,gen_random_uuid());
  assert (select current_stock=4 from public.products where id=pid), 'Adjustment target incorrect';
  select updated_at into stamp from public.products where id=pid;
  begin
    perform public.record_stock_movement(pid,'adjust',4,'Hitung fisik','',4,stamp,gen_random_uuid());
    raise exception 'Unchanged adjustment accepted';
  exception when invalid_parameter_value then assert sqlerrm='stock_unchanged'; end;
  result := public.record_stock_movement(pid,'reverse',null,'Koreksi penjualan','',4,stamp,gen_random_uuid(),out_id);
  assert (select current_stock=6 from public.products where id=pid), 'Reversal did not apply inverse delta';
  select updated_at into stamp from public.products where id=pid;
  begin
    perform public.record_stock_movement(pid,'reverse',null,'Koreksi penjualan','',6,stamp,gen_random_uuid(),out_id);
    raise exception 'Double reversal accepted';
  exception when raise_exception then assert sqlerrm='already_reversed'; end;
  begin
    perform public.record_stock_movement(pid,'reverse',null,'Koreksi pembalik','',6,stamp,gen_random_uuid(),(result->>'movement_id')::bigint);
    raise exception 'Reversal of reversal accepted';
  exception when invalid_parameter_value then null; end;
  begin
    update public.products set current_stock=90 where id=pid;
    raise exception 'Direct stock mutation accepted';
  exception when insufficient_privilege then assert sqlerrm='use_stock_menu'; end;
  update public.products set name='Stock fixture renamed',current_stock=current_stock where id=pid;
  assert (select product_name='Stock fixture' from public.stock_movements where id=original_id), 'Historical name changed';
  begin
    update public.stock_movements set reason='Changed history' where id=original_id;
    raise exception 'History edit allowed';
  exception when insufficient_privilege then null; end;
  begin
    delete from public.stock_movements where id=original_id;
    raise exception 'History deletion allowed';
  exception when insufficient_privilege then null; end;
  begin
    insert into public.stock_movements(product_id,product_name,product_sku,kind,delta,stock_before,stock_after,reason,actor_name)
    values(pid,'Forged','FORGED','opening',100,0,100,'Forged opening','Forged actor');
    raise exception 'History fabrication allowed';
  exception when insufficient_privilege then null; end;
  begin
    delete from public.products where id=pid;
    raise exception 'Product history was deleted';
  exception when foreign_key_violation then null; end;
  perform set_config('stocktest.out',out_id::text,true);
  perform set_config('request.jwt.claims',json_build_object('sub',current_setting('stocktest.staff'),'role','authenticated')::text,true);
  select updated_at into stamp from public.products where id=pid;
  result := public.record_stock_movement(pid,'in',1,'Pembelian supplier','',6,stamp,gen_random_uuid());
  assert (select current_stock=7 from public.products where id=pid), 'Active staff cannot record stock';
  assert (select actor_name='Stock staff fixture' from public.stock_movements where id=(result->>'movement_id')::bigint), 'Actor snapshot incorrect';
  select updated_at into stamp from public.products where id=pid;
  begin
    perform public.record_stock_movement(pid,'reverse',null,'Koreksi penjualan','',7,stamp,gen_random_uuid(),out_id);
    raise exception 'Staff reversal accepted';
  exception when insufficient_privilege then null; end;
  perform set_config('request.jwt.claims',json_build_object('sub',current_setting('stocktest.inactive'),'role','authenticated')::text,true);
  assert (select count(*)=0 from public.stock_movements), 'Inactive user can read ledger';
  assert (select count(*)=0 from public.stock_inventory), 'Inactive user can read inventory';
  begin
    perform public.record_stock_movement(pid,'in',1,'Pembelian supplier','',7,stamp,gen_random_uuid());
    raise exception 'Inactive user changed stock';
  exception when insufficient_privilege then null; end;
  perform set_config('request.jwt.claims','{}',true);
  begin
    perform public.record_stock_movement(pid,'in',1,'Pembelian supplier','',7,stamp,gen_random_uuid());
    raise exception 'Missing session accepted';
  exception when insufficient_privilege then null; end;
end $$;
reset role;
set local role anon;
do $$ begin
  begin perform id from public.stock_movements; raise exception 'Public ledger exposed'; exception when insufficient_privilege then null; end;
  begin perform id from public.stock_inventory; raise exception 'Public inventory exposed'; exception when insufficient_privilege then null; end;
  begin perform public.record_stock_movement(1,'in',1,'Forged','',0,now(),gen_random_uuid()); raise exception 'Public RPC allowed'; exception when insufficient_privilege then null; end;
end $$;
reset role;
select 'stock-management: all transaction, retry, stale-write, balance, reversal and permission assertions passed; fixtures rolled back' as result;
rollback;
