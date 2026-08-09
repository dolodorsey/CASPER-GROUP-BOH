# CASPER GROUP BOH

Authenticated operations application for the CASPER Group portfolio. This repository is separate from CASPER Customer / Casper Universe.

## Working surfaces

- Admin command center
- Employee operations and training
- Partner reporting
- Brand and location scope controls
- Alerts, incidents, tickets, inventory, schedules, channels, and messages
- Brand-specific SOP library
- Financial reporting backed only by live production data

## Production systems

- Expo 57 / React Native 0.86 / React 19
- Supabase Auth, PostgreSQL, and row-level security
- TanStack Query
- Vercel web deployment
- EAS build profiles for native releases

## Environment

```sh
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
```

`EXPO_PUBLIC_SUPABASE_ANON_KEY` remains temporarily supported during the publishable-key migration. Never place a Supabase secret key or service-role key in an Expo public variable.

## Install and verify

```sh
npm ci --ignore-scripts
npm run verify
```

The quality gate runs backend contract checks, automated tests, TypeScript, Expo web export, and a critical dependency audit.

## Database migrations

Migrations are stored in the repository-level `supabase/migrations` directory. The August 9 operating-core migration stocks only reference data:

- 12 active CASPER brands
- lifecycle SOPs
- training modules
- operating channels
- non-fabricated location references

Revenue, orders, KPIs, alerts, incidents, staff, and financial records are live operating data and must never be seeded for presentation.

## Mobile release policy

Do not deploy iOS manually. Complete EAS project linking and store credentials, then run a non-interactive automated build and submission workflow.

See `PROJECT_STATUS.md` and the repository-level `RELEASE_EVIDENCE.md` for verified status.
