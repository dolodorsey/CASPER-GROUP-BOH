# Supabase Setup (Casper Group)

## 1) Add env vars
Copy `.env.example` to `.env` and fill in:
- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`

## 2) Create tables + RLS
Run the SQL in `supabase/schema.sql` inside Supabase SQL Editor.

## 3) Create user profiles
After creating users in Supabase Auth, insert a matching row into `profiles`:
- `id = auth.users.id`
- `role = admin | employee | partner`
- `location_id = loc_washington_parq` (or your real location id)

## 4) Turn on Supabase data mode
Set:
`EXPO_PUBLIC_DATA_SOURCE="supabase"`

Now the Admin dashboard will pull Alerts + Tickets from Supabase (other panels still use mock data until migrated).


## Role-Based RLS (admin / employee / partner)

After your initial `supabase/schema.sql` is running, execute:

- `supabase/rls_roles_update.sql`

This upgrades policies so:
- **admin**: full read/write
- **employee**: read/write within their assigned `location_id` (and alerts can also scope to `brand_id` if set)
- **partner**: read-only within their assigned `location_id` (and alerts can also scope to `brand_id` if set)

> Important: In `profiles`, only **admin** can change `role`, `location_id`, or `brand_id`.

