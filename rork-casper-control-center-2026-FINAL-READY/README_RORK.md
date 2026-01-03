# Casper Group x Rork Setup (GitHub + Supabase)

This repo is ready to run as a Rork app **with Supabase as the backend**.

## 1) Connect Rork to this GitHub Repo
- In Rork, create/open your project.
- Choose **Import from GitHub** (or connect repo).
- Select the branch you want Rork to build from (recommended: `main` or a `supabase-live` branch).

## 2) Set Environment Variables in Rork
Add these env vars in Rork project settings:

- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- `EXPO_PUBLIC_DATA_SOURCE` = `supabase`

> Do not add the Supabase `service_role` key to the client app. Keep it for server-only functions.

## 3) Supabase Database + RLS
In Supabase SQL editor, run (in this order):
1. `supabase/schema.sql`
2. `supabase/rls_roles_update.sql`

## 4) Create Users + Profiles
For each user in Supabase Auth, insert a matching row into `public.profiles`:
- `id` = `auth.users.id`
- `role` = `admin` OR `employee` OR `partner`
- `location_id` = a location string you use in the app (ex: `washington_parq`)
- `brand_id` = optional (used for alert scoping)

## 5) App Routing / Portal Access
- Users must sign in first.
- Each role can only open its matching portal:
  - admin -> `/admin`
  - employee -> `/employee`
  - partner -> `/partner`

If a user tries to open a different portal, they get redirected to the correct one.

## 6) Data Source Behavior
- If Supabase env vars are set, the app defaults to **Supabase**.
- If env vars are missing, the app falls back to **mock** so it can still run in demo mode.

## 7) Next (Optional): Rork Backend Functions
Once Rork backend functions are enabled, store secrets there (Twilio, service_role key, etc.) and create:
- `invite_user` (create auth user + profiles row)
- `send_alert_sms`
- `export_reports`

## Supabase (Required SQL scripts)
Run in Supabase SQL Editor in this order:
1) `supabase/schema.sql`
2) `supabase/rls_roles_update.sql`
3) `supabase/cg_catalog_seed.sql`  (adds canonical Casper brand + location IDs + optional FKs)
4) `supabase/migration_add_brand_to_tickets.sql` (optional but recommended)

## Canonical IDs (use these in profiles / alerts / tickets)
- Locations: `public.cg_locations` (seeded by cg_catalog_seed.sql)
- Brands: `public.cg_brands` (seeded by cg_catalog_seed.sql)

## Multi-location roles (recommended)
If you have managers, staff, or partners covering multiple locations/brands, run these scripts:

Run in Supabase SQL Editor in this order:
1) `supabase/schema.sql`
2) `supabase/rls_roles_update.sql` (legacy) OR skip if moving to multi-location
3) `supabase/cg_catalog_seed.sql`
4) `supabase/migration_add_brand_to_tickets.sql` (recommended)
5) `supabase/migration_multilocation_access.sql`
6) `supabase/rls_multilocation_roles.sql`  ✅ (use this instead of legacy RLS)

### Assign access (examples)
After creating a user in Supabase Auth, insert their role into `public.profiles`, then grant access:

```sql
-- grant a user access to multiple locations
insert into public.user_location_access (user_id, location_id) values
  ('<USER_UUID>', 'atl-43-decatur'),
  ('<USER_UUID>', 'atl-1650-virginia');

-- grant a user access to multiple brands (optional; mainly for partners)
insert into public.user_brand_access (user_id, brand_id) values
  ('<USER_UUID>', 'angel-wings'),
  ('<USER_UUID>', 'espresso-co');
```

