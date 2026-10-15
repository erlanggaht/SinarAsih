begin;
select set_config('request.jwt.claims',jsonb_build_object('sub',user_id,'role','authenticated')::text,true)
from public.admin_profiles where is_active and role='owner' limit 1;
set local role authenticated;
do $test$
declare src bigint; dst bigint; inactive bigint; empty_cat bigint; prod bigint; stamp timestamptz; empty_stamp timestamptz; result jsonb; deleted integer; token text:=replace(gen_random_uuid()::text,'-','');
begin
insert into public.categories(name,slug) values('Delete test source '||token,'delete-test-source-'||token) returning id,updated_at into src,stamp;
insert into public.categories(name,slug) values('Delete test target '||token,'delete-test-target-'||token) returning id into dst;
insert into public.categories(name,slug,is_active) values('Delete test inactive '||token,'delete-test-inactive-'||token,false) returning id into inactive;
insert into public.categories(name,slug) values('Delete test empty '||token,'delete-test-empty-'||token) returning id,updated_at into empty_cat,empty_stamp;
insert into public.products(category_id,name,sku,slug,current_stock,price) values(src,'Temporary deletion test','DEL-'||upper(token),'del-'||token,7,12500) returning id into prod;
begin perform public.delete_category_and_move_products(src,null,stamp); raise exception 'missing target accepted';
exception when raise_exception then if sqlerrm<>'category_requires_target' then raise; end if; end;
begin perform public.delete_category_and_move_products(src,inactive,stamp); raise exception 'inactive target accepted';
exception when raise_exception then if sqlerrm<>'target_category_unavailable' then raise; end if; end;
begin perform public.delete_category_and_move_products(src,dst,stamp-interval '1 minute'); raise exception 'stale category accepted';
exception when raise_exception then if sqlerrm<>'category_changed' then raise; end if; end;
begin perform public.delete_category_and_move_products(src,src,stamp); raise exception 'same target accepted';
exception when invalid_parameter_value then null; end;
if not exists(select 1 from public.products where id=prod and category_id=src) then raise exception 'failed operation changed products'; end if;
result:=public.delete_category_and_move_products(src,dst,stamp);
if (result->>'moved_count')::integer<>1 or exists(select 1 from public.categories where id=src) then raise exception 'move/delete failed'; end if;
if not exists(select 1 from public.products where id=prod and category_id=dst and current_stock=7 and price=12500) then raise exception 'product data lost'; end if;
result:=public.delete_category_and_move_products(empty_cat,null,empty_stamp);
if exists(select 1 from public.categories where id=empty_cat) then raise exception 'empty category delete failed'; end if;
begin
delete from public.products where id=prod;
raise exception 'product with stock history was deleted';
exception when foreign_key_violation then null; end;
update public.products set is_active=false where id=prod;
if not exists(select 1 from public.products where id=prod and not is_active)
  or not exists(select 1 from public.stock_movements where product_id=prod and kind='opening')
then raise exception 'product deactivation lost stock history'; end if;
insert into public.products(category_id,name,sku,slug) values(dst,'Permission test','PERM-'||upper(token),'perm-'||token) returning id into prod;
perform set_config('test.product_id',prod::text,true);
perform set_config('test.category_id',dst::text,true);
end;$test$;
select set_config('request.jwt.claims','{}',true);
do $test$ declare affected integer; begin
delete from public.products where id=current_setting('test.product_id')::bigint;
get diagnostics affected=row_count;
if affected<>0 then raise exception 'unauthenticated delete accepted'; end if;
begin perform public.delete_category_and_move_products(current_setting('test.category_id')::bigint,null,now()); raise exception 'unauthenticated RPC accepted';
exception when insufficient_privilege then null; end;
end;$test$;
rollback;
