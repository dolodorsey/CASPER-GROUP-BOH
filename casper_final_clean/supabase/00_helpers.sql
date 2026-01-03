-- Casper Control Center helpers
-- Required tables:
--   public.profiles(id uuid pk references auth.users(id), role text, partner_id uuid null, ...)
--   public.user_location_access(user_id uuid, location_id text, ...)
--   public.user_brand_access(user_id uuid, brand_id text, ...)

create or replace function public.current_role()
returns text
language sql
stable
as $$
  select coalesce((select role from public.profiles where id = auth.uid()), 'authenticated')
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
as $$
  select public.current_role() = 'admin'
$$;

create or replace function public.current_partner_id()
returns uuid
language sql
stable
as $$
  select (select partner_id from public.profiles where id = auth.uid())
$$;

create or replace function public.has_location(loc_id text)
returns boolean
language sql
stable
as $$
  -- Hard block: partners never have ops access
  select public.current_role() <> 'partner'
     and exists (
       select 1 from public.user_location_access ula
       where ula.user_id = auth.uid()
         and ula.location_id = loc_id
     )
$$;

create or replace function public.has_brand(b_id text)
returns boolean
language sql
stable
as $$
  select public.current_role() <> 'partner'
     and exists (
       select 1 from public.user_brand_access uba
       where uba.user_id = auth.uid()
         and uba.brand_id = b_id
     )
$$;

create or replace function public.has_brand_via_locations(b_id text)
returns boolean
language sql
stable
as $$
  select public.current_role() <> 'partner'
     and exists (
       select 1
       from public.user_location_access ula
       join public.cg_brand_locations bl on bl.location_id = ula.location_id
       where ula.user_id = auth.uid()
         and bl.brand_id = b_id
     )
$$;
