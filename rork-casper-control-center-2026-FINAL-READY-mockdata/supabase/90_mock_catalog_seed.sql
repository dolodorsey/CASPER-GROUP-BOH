-- Casper Control Center — Mock Catalog Seed (Brands, Locations, Brand↔Location)
-- Includes opening hours rule of thumb:
--  - Tha Morning After: 05:00–17:00
--  - All other entities: 13:00–01:00 (next day)
-- Safe to run multiple times (UPSERT / ON CONFLICT DO NOTHING).

begin;

-- -------------------------
-- Locations
-- -------------------------
insert into public.cg_locations (id, name, address) values
  ('atl-43-decatur',        'Atlanta – 43 Decatur St SE',                 '43 Decatur St. SE, Atlanta, GA 30303'),
  ('atl-1650-virginia',     'Atlanta – 1650 Virginia Ave',                '1650 Virginia Ave, Atlanta, GA'),
  ('atl-69-11th',           'Atlanta – 69 11th Street NW',                '69 11th Street NW, Atlanta, GA'),
  ('atl-199-mitchell',      'Atlanta – 199 Mitchell St SW',               '199 Mitchell St SW, Atlanta, GA'),
  ('atl-171-auburn',        'Atlanta – 171 Auburn Ave NE (Suite P)',      '171 Auburn Ave NE, Suite P, Atlanta, GA 30303'),
  ('dc-1355-u',             'Washington, DC – 1355 U St NW',              '1355 U St NW, Washington, DC 20009'),
  ('hou-2811-washington',   'Houston – 2811 Washington Ave',              '2811 Washington Ave, Houston, TX')
on conflict (id) do update
set name = excluded.name,
    address = excluded.address;

-- -------------------------
-- Brands
-- -------------------------
insert into public.cg_brands (id, name) values
  ('angel-wings',        'Angel Wings'),
  ('tha-morning-after',  'Tha Morning After'),
  ('espresso-co',        'Espresso Co.'),
  ('mojo-juice',         'Mojo Juice'),
  ('taco-yaki',          'Taco Yaki'),
  ('sweet-tooth',        'Sweet Tooth'),
  ('mr-oyster',          'Mr. Oyster'),
  ('patty-daddy',        'Patty Daddy'),
  ('tossed',             'Tossed'),
  ('pasta-bish',         'Pasta Bish')
on conflict (id) do update
set name = excluded.name;

-- -------------------------
-- Brand ↔ Location Links
-- -------------------------
-- NOTE: assumes a unique constraint exists on (brand_id, location_id).
-- If not, you can add one:
--   alter table public.cg_brand_locations add constraint cg_brand_locations_unique unique (brand_id, location_id);

insert into public.cg_brand_locations (brand_id, location_id) values
  -- Angel Wings
  ('angel-wings', 'atl-43-decatur'),
  ('angel-wings', 'atl-1650-virginia'),
  ('angel-wings', 'atl-69-11th'),
  ('angel-wings', 'dc-1355-u'),
  ('angel-wings', 'hou-2811-washington'),

  -- Tha Morning After
  ('tha-morning-after', 'atl-199-mitchell'),
  ('tha-morning-after', 'dc-1355-u'),
  ('tha-morning-after', 'hou-2811-washington'),

  -- Espresso Co.
  ('espresso-co', 'atl-43-decatur'),
  ('espresso-co', 'atl-1650-virginia'),
  ('espresso-co', 'atl-69-11th'),
  ('espresso-co', 'hou-2811-washington'),

  -- Mojo Juice
  ('mojo-juice', 'atl-43-decatur'),
  ('mojo-juice', 'atl-69-11th'),
  ('mojo-juice', 'hou-2811-washington'),

  -- Taco Yaki
  ('taco-yaki', 'atl-199-mitchell'),
  ('taco-yaki', 'atl-69-11th'),
  ('taco-yaki', 'hou-2811-washington'),

  -- Sweet Tooth
  ('sweet-tooth', 'atl-171-auburn'),
  ('sweet-tooth', 'atl-69-11th'),
  ('sweet-tooth', 'hou-2811-washington'),

  -- Mr. Oyster
  ('mr-oyster', 'hou-2811-washington'),

  -- Patty Daddy
  ('patty-daddy', 'atl-199-mitchell'),
  ('patty-daddy', 'atl-1650-virginia'),
  ('patty-daddy', 'dc-1355-u'),
  ('patty-daddy', 'hou-2811-washington'),

  -- Tossed
  ('tossed', 'hou-2811-washington'),

  -- Pasta Bish
  ('pasta-bish', 'atl-171-auburn'),
  ('pasta-bish', 'hou-2811-washington')
on conflict do nothing;

commit;
