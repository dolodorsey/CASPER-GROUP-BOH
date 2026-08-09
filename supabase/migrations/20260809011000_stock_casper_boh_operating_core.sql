-- Stock CASPER BOH with truthful operating reference data. No fabricated
-- revenue, orders, alerts, incidents, or staff records are created.

with brand_seed(name, slug, tagline, mascot, icon, color_primary, color_secondary, concept_descr, food_category, positioning) as (
  values
    ('Angel Wings', 'angel-wings', 'Wings. Shrimps. Fries. Respect the Basket.', 'Loudini the Wing Wizard', '🍗', '#F97316', '#2A1005', 'Wing-first quick service', 'Wings', 'Bold basket-led comfort food'),
    ('Pasta Bish', 'pasta-bish', 'Fresh Pasta. Bold Flavor.', 'Noodle Queen', '🍝', '#C9473E', '#270C09', 'Pasta with attitude', 'Pasta', 'Comfort food with personality'),
    ('Taco Yaki', 'taco-yaki', 'Fire Meets Flavor', 'Baby Panda Chef', '🌮', '#EF4444', '#2A0909', 'Fusion taco concept', 'Tacos', 'High-energy fusion and crunch'),
    ('Patty Daddy', 'patty-daddy', 'The Sauce Is a Secret, The Flavor Is Not.', 'Paddy Daddy', '🍔', '#D7B46A', '#24190B', 'Bold burger concept', 'Burgers', 'Larger-than-life flavor'),
    ('Espresso Co.', 'espresso-co', 'Precision Brewed', 'Beanzo the Barista', '☕', '#8A6A3A', '#1D160D', 'Precision coffee concept', 'Coffee', 'Fast ritual and craft'),
    ('Tha Morning After', 'tha-morning-after', 'Brunch All Day', 'Eggavier & Scrambalina', '🍳', '#D89A2B', '#2B1A07', 'All-day brunch concept', 'Breakfast', 'Brunch and recovery'),
    ('Toss''d', 'tossd', 'Fresh Tossed. Always.', 'Leaf Boss', '🥗', '#61A146', '#10220D', 'Fresh salad concept', 'Salads', 'Wellness and speed'),
    ('Sweet Tooth', 'sweet-tooth', 'Sugar Rush Central', 'Sweetness', '🧁', '#D74B9B', '#2A0D20', 'Dessert concept', 'Desserts', 'Indulgence and celebration'),
    ('Mojo Juice', 'mojo-juice', 'Tropical Energy', 'Mojo the Mango', '🥤', '#63A647', '#10240D', 'Functional juice concept', 'Juice', 'Fresh everyday momentum'),
    ('Mr. Oyster', 'mr-oyster', 'Pearl of the Sea', 'Sir Shellington', '🦪', '#4C86A8', '#0D1E29', 'Seafood concept', 'Seafood', 'Ocean-led occasion'),
    ('Peace Pizza', 'peace-pizza', 'A Slice of Peace.', 'Peace the Pizza', '🍕', '#F28C28', '#2B1305', 'Community pizza concept', 'Pizza', 'Sharing and good energy'),
    ('American Dragon', 'american-dragon', 'Fire-Forged Flavor.', 'The American Dragon', '🐉', '#D9A52E', '#251A05', 'Fire-forged takeout concept', 'American Fusion', 'Gold-toned night-market energy')
)
insert into public.cg_brands (
  name, slug, tagline, mascot, icon, color_primary, color_secondary,
  status, concept_descr, food_category, positioning
)
select name, slug, tagline, mascot, icon, color_primary, color_secondary,
  'active', concept_descr, food_category, positioning
from brand_seed seed
where not exists (select 1 from public.cg_brands existing where existing.slug = seed.slug);

insert into public.cg_locations (name, city, state, access_enabled, status, notes)
select 'Atlanta HQ', 'Atlanta', 'GA', true, 'closed', 'Headquarters operating scope; publish venue-specific details only after verification.'
where not exists (select 1 from public.cg_locations where name = 'Atlanta HQ');

with section_seed(section, category, title_suffix, content, requires_ack) as (
  values
    ('open', 'operations', 'Opening Readiness', 'Confirm team readiness, equipment condition, sanitation, stocked stations, active systems, and opening exceptions. Record any unresolved exception before service.', true),
    ('recipes', 'production', 'Recipe and Build Control', 'Use only the current approved recipe, portion, allergen, packaging, and presentation standard. Escalate missing or conflicting build documentation.', true),
    ('service', 'service', 'Service and Handoff', 'Confirm order accuracy, timing, packaging integrity, guest communication, delivery handoff, and exception ownership before closing the ticket.', true),
    ('close', 'operations', 'Closing Control', 'Complete waste, inventory, sanitation, equipment shutdown, cash-control, security, and manager handoff checks before final lockup.', true),
    ('compliance', 'compliance', 'Safety and Compliance', 'Follow current food-safety, allergen, temperature, incident, fire, occupancy, and local regulatory requirements. Escalate uncertainty immediately.', true),
    ('brand_voice', 'brand', 'Brand Voice Guardrails', 'Use the approved name, visual system, guest tone, packaging, photography, and offers for this brand only. Do not merge language or assets across CASPER brands.', false)
)
insert into public.cg_sops (brand_id, title, category, content, version, status, requires_ack, section)
select brand.id::text, brand.name || ' — ' || section.title_suffix, section.category,
  section.content, '1.0', 'active', section.requires_ack, section.section
from public.cg_brands brand cross join section_seed section
where brand.status = 'active'
and not exists (
  select 1 from public.cg_sops existing
  where existing.brand_id = brand.id::text and existing.section = section.section
);

with training_seed(title, description, minutes, roles, required) as (
  values
    ('CASPER Brand Separation', 'Operate every CASPER entity with its own approved identity, assets, voice, menu, and reporting scope.', 20, array['admin','employee','partner']::text[], true),
    ('Food Safety and Allergen Escalation', 'Required baseline for safe production, allergen communication, incident documentation, and escalation.', 35, array['admin','employee']::text[], true),
    ('Opening and Closing Control', 'How to complete, verify, and hand off the daily operating control checklist.', 30, array['admin','employee']::text[], true),
    ('Incident and Alert Response', 'How to document, assign, escalate, acknowledge, and resolve operational exceptions.', 25, array['admin','employee','partner']::text[], true)
)
insert into public.cg_training_modules (title, description, estimated_minutes, role_required, is_required, version)
select title, description, minutes, roles, required, '1.0'
from training_seed seed
where not exists (select 1 from public.cg_training_modules existing where existing.title = seed.title);

with channel_seed(name, type, scope, min_role) as (
  values
    ('CASPER Operations', 'global', 'global', 'employee'),
    ('CASPER Leadership', 'global', 'global', 'admin'),
    ('Safety and Compliance', 'global', 'global', 'employee')
)
insert into public.cg_channels (name, type, scope, min_role, is_archived)
select name, type, scope, min_role, false
from channel_seed seed
where not exists (select 1 from public.cg_channels existing where existing.name = seed.name);

grant select on public.cg_brands, public.cg_locations, public.cg_sops,
  public.cg_training_modules, public.cg_channels to authenticated;
