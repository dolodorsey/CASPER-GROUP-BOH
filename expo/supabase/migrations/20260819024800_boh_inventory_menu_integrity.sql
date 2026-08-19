create or replace view public.cg_inventory_intelligence as
select i.*,
  extract(epoch from (now()-coalesce(i.last_counted,i.created_at)))/3600.0 as count_age_hours,
  case when i.last_counted is null then 'never_counted'
       when i.last_counted<now()-interval '24 hours' then 'stale'
       else 'current' end as count_freshness,
  case when coalesce(i.on_hand,0)<=0 then 'out'
       when coalesce(i.on_hand,0)<coalesce(i.par,0) then 'below_par'
       else 'at_or_above_par' end as stock_status,
  case when coalesce(i.on_hand,0)<=0 then 100
       when i.last_counted is null then 98
       when i.last_counted<now()-interval '24 hours' then 95
       when coalesce(i.on_hand,0)<coalesce(i.par,0) then 80
       when coalesce(i.on_hand,0)<coalesce(i.par,0)*1.25 then 50
       else 10 end::integer as attention_score
from public.cg_inventory i;

create or replace view public.cg_menu_integrity as
select m.*,
  m.is_available as operator_available,
  case when jsonb_typeof(coalesce(m.ingredients,'[]'::jsonb))='array' and jsonb_array_length(coalesce(m.ingredients,'[]'::jsonb))>0 then true else false end as has_inventory_mapping,
  case when not m.is_available then 'operator_unavailable'
       when not (jsonb_typeof(coalesce(m.ingredients,'[]'::jsonb))='array' and jsonb_array_length(coalesce(m.ingredients,'[]'::jsonb))>0) then 'inventory_unverified'
       else 'mapping_present_requires_stock_check' end as availability_integrity_status,
  case when not m.is_available then 100
       when not (jsonb_typeof(coalesce(m.ingredients,'[]'::jsonb))='array' and jsonb_array_length(coalesce(m.ingredients,'[]'::jsonb))>0) then 90
       else 20 end::integer as inventory_integrity_score
from public.cg_menu_items m;

comment on view public.cg_inventory_intelligence is 'CASPER BOH daily inventory priority layer. Out-of-stock, never-counted, stale-over-24h and below-par items outrank alphabetical display.';
comment on view public.cg_menu_integrity is 'CASPER BOH menu integrity layer. Operator availability is distinct from inventory-verified availability; empty ingredient mappings are high-risk and fail closed as unverified.';
