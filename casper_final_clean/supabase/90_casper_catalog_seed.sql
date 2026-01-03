begin;

-- ====== LOCATIONS (7) ======
insert into public.cg_locations (id, name, address)
values
  ('atl-43-decatur','Atlanta – 43 Decatur St SE','43 Decatur St SE, Atlanta, GA 30303'),
  ('atl-1650-virginia','Atlanta – 1650 Virginia Ave','1650 Virginia Ave, Atlanta, GA'),
  ('atl-69-11th','Atlanta – 69 11th Street NW','69 11th Street NW, Atlanta, GA'),
  ('atl-199-mitchell','Atlanta – 199 Mitchell St SW','199 Mitchell St SW, Atlanta, GA'),
  ('dc-1355-u','Washington, DC – 1355 U St NW','1355 U St NW, Washington, DC 20009'),
  ('hou-2811-washington','Houston – 2811 Washington Ave','2811 Washington Ave, Houston, TX'),
  ('atl-171-auburn','Atlanta – 171 Auburn Ave NE, Suite P','171 Auburn Ave NE, Suite P, Atlanta, GA 30303')
on conflict (id) do update
set name = excluded.name,
    address = excluded.address;

-- ====== BRANDS (10) ======
insert into public.cg_brands (id, name)
values
  ('angel-wings','Angel Wings'),
  ('tha-morning-after','Tha Morning After'),
  ('espresso-co','Espresso Co.'),
  ('mojo-juice','Mojo Juice'),
  ('taco-yaki','Taco Yaki'),
  ('sweet-tooth','Sweet Tooth'),
  ('mr-oyster','Mr. Oyster'),
  ('patty-daddy','Patty Daddy'),
  ('tossed','Tossed'),
  ('pasta-bish','Pasta Bish')
on conflict (id) do update
set name = excluded.name;

-- ====== BRAND <-> LOCATION MAPPING ======
-- Angel Wings
insert into public.cg_brand_locations (brand_id, location_id)
values
  ('angel-wings','atl-43-decatur'),
  ('angel-wings','atl-1650-virginia'),
  ('angel-wings','atl-69-11th'),
  ('angel-wings','dc-1355-u'),
  ('angel-wings','hou-2811-washington')
on conflict do nothing;

-- Tha Morning After
insert into public.cg_brand_locations (brand_id, location_id)
values
  ('tha-morning-after','atl-199-mitchell'),
  ('tha-morning-after','dc-1355-u'),
  ('tha-morning-after','hou-2811-washington')
on conflict do nothing;

-- Espresso Co.
insert into public.cg_brand_locations (brand_id, location_id)
values
  ('espresso-co','atl-43-decatur'),
  ('espresso-co','atl-1650-virginia'),
  ('espresso-co','hou-2811-washington'),
  ('espresso-co','atl-69-11th')
on conflict do nothing;

-- Mojo Juice
insert into public.cg_brand_locations (brand_id, location_id)
values
  ('mojo-juice','atl-43-decatur'),
  ('mojo-juice','hou-2811-washington'),
  ('mojo-juice','atl-69-11th')
on conflict do nothing;

-- Taco Yaki
insert into public.cg_brand_locations (brand_id, location_id)
values
  ('taco-yaki','atl-199-mitchell'),
  ('taco-yaki','hou-2811-washington'),
  ('taco-yaki','atl-69-11th')
on conflict do nothing;

-- Sweet Tooth
insert into public.cg_brand_locations (brand_id, location_id)
values
  ('sweet-tooth','hou-2811-washington'),
  ('sweet-tooth','atl-171-auburn'),
  ('sweet-tooth','atl-69-11th')
on conflict do nothing;

-- Mr. Oyster
insert into public.cg_brand_locations (brand_id, location_id)
values
  ('mr-oyster','hou-2811-washington')
on conflict do nothing;

-- Patty Daddy
insert into public.cg_brand_locations (brand_id, location_id)
values
  ('patty-daddy','atl-199-mitchell'),
  ('patty-daddy','atl-1650-virginia'),
  ('patty-daddy','dc-1355-u'),
  ('patty-daddy','hou-2811-washington')
on conflict do nothing;

-- Tossed
insert into public.cg_brand_locations (brand_id, location_id)
values
  ('tossed','hou-2811-washington')
on conflict do nothing;

-- Pasta Bish
insert into public.cg_brand_locations (brand_id, location_id)
values
  ('pasta-bish','atl-171-auburn'),
  ('pasta-bish','hou-2811-washington')
on conflict do nothing;

commit;
