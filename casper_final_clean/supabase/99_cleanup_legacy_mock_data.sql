begin;

-- Remove legacy mock catalog rows (safe: targets known legacy ids/names/addresses)
-- 1) Legacy mock location id
delete from public.cg_brand_locations where location_id = 'loc_washington_parq';
delete from public.cg_locations where id = 'loc_washington_parq';

-- 2) Legacy mock location name/address patterns
delete from public.cg_brand_locations
where location_id in (
  select id from public.cg_locations
  where name ilike '%washington parq%'
     or address ilike '%Capitol Ave%'
);

delete from public.cg_locations
where name ilike '%washington parq%'
   or address ilike '%Capitol Ave%';

-- 3) Legacy brand ids (underscore variants)
delete from public.cg_brand_locations where brand_id in (
  'lemon_pepper_lous','taco_yaki','tha_morning_after','espresso_co','mojo_juice','mr_oyster','sweet_tooth','patty_daddy'
);

delete from public.cg_brands where id in (
  'lemon_pepper_lous','taco_yaki','tha_morning_after','espresso_co','mojo_juice','mr_oyster','sweet_tooth','patty_daddy'
);

commit;
