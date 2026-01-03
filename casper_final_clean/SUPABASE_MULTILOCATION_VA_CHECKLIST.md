# Supabase Multi-Location Roles - VA Checklist

## Goal
Enable multi-location and multi-brand access for users (admins, employees, partners) using mapping tables + RLS policies.

## Run these Supabase scripts (SQL Editor) in order
1. `supabase/schema.sql` (only if not already done)
2. `supabase/cg_catalog_seed.sql`
3. `supabase/migration_add_brand_to_tickets.sql` (recommended)
4. `supabase/migration_multilocation_access.sql`
5. `supabase/rls_multilocation_roles.sql`

## User setup steps
1. Create the user in Supabase Auth (email/password or magic link).
2. Insert into `public.profiles` with role: `admin | employee | partner`.
3. Insert rows into `public.user_location_access` for every location they should access.
4. For partners, also insert rows into `public.user_brand_access` to restrict to specific brands (optional but recommended).

## Validation
- Admin user can read/write all tickets + alerts.
- Employee user can read/write only within their allowed locations.
- Partner user can read only within allowed locations and (if brand_id present) only their allowed brands.

## Deliverables to report back
- Screenshots: mapping rows (user_location_access / user_brand_access), and a successful app login + data view per role.
