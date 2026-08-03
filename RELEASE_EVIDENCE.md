# CASPER GROUP BOH Release Evidence

Updated: 2026-08-03

## Scope

This record applies only to the CASPER GROUP BOH brand and deployment. It does not combine CASPER Customer or any other brand.

## Completed

- Removed anonymous access from CASPER BOH operational tables.
- Replaced universally writable operational policies with admin- or owner-scoped policies.
- Prevented authenticated users from changing their own profile role or access assignments.
- Restricted audit logs, notifications, staff, time clock, tasks, training assignments, SOP acknowledgements, incidents, and privileged database functions.
- Disabled the legacy location-sync function for browser and ordinary authenticated callers because it contained a static shared-secret design.
- Stopped the client from assigning every signed-in user a synthetic super-admin identity.
- Removed browser-side Airtable credentials and n8n bearer-token support; private integrations must run server-side.
- Removed fabricated revenue, growth, and top-seller fallback values from the UI.
- Applied production migrations `harden_casper_boh_rls` and `lock_down_privileged_functions` to Supabase project `qhgmukwoennurwuvmbhy`.
- Applied `restrict_legacy_rpc_surface`: five unused legacy `SECURITY DEFINER` helpers are now service-only. The only remaining signed-in privileged helper is `is_admin()`, which is intentionally required by the live RLS policies and has no caller-controlled arguments.
- Verified TypeScript compilation and Expo web export.
- Upgraded the complete application foundation from Expo 54 / React Native 0.79 to Expo 57 / React Native 0.86 / React 19.2, with compatible Router, Supabase, TanStack Query, tRPC, and native modules.
- Removed the obsolete Rork toolkit, Rork Metro transformer, Rork start commands, and Bun lockfile. BOH now builds independently with standard Expo tooling and a single npm dependency lock.
- Updated all React Native fill styles and moved splash configuration to the Expo 57 plugin schema.
- Expo Doctor passes all 20 compatibility checks and the production dependency audit reports zero vulnerabilities.
- Production Hermes bundles export successfully for both iOS (`entry-541ca94029314f88eaeb1f4002cf7b0b.hbc`) and Android (`entry-ef840194d1f98b4f6fbd12f59438140a.hbc`).
- EAS release profiles now require current tooling, use remote version sources, auto-increment production releases, and generate an Android App Bundle for the store.

## Verification commands

From `expo/`:

```sh
npm run verify
npm audit --omit=dev
```

The dependency modernization reduces the original 31 findings, including one critical finding, to zero production findings.

## Production checks

- Confirm login redirects unauthenticated users to `/auth/login`.
- Confirm admin, employee, and partner accounts land only in their assigned portal.
- Confirm employee-owned tasks, notifications, time clock records, training assignments, and acknowledgements cannot be read or modified by another employee.
- Confirm financial screens show an em dash or empty state when live data is absent, never invented business results.

## Live platform verification

- Vercel production deployment `dpl_AcaJVzhPPzrQgwYzTmLh4Z3cHXW9` is READY at `https://casper-group-boh.vercel.app` and contains the Expo 57 release from commit `4408c40`.
- Live browser verification confirms the authorized-personnel login screen renders and direct anonymous access to `/admin` redirects to `/auth/login`.
- Vercel reported no runtime error clusters during the seven-day production check.
- Supabase security advisors fell from seven notices to two: the intentional `is_admin()` RLS helper and the dashboard-level leaked-password-protection setting.
