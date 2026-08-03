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

## Verification commands

From `expo/`:

```sh
npm run verify
npm audit --omit=dev
```

Compatible dependency updates reduced the audit from 31 findings, including one critical finding, to 19 transitive findings with no critical finding. The remaining items require breaking Expo/toolkit upgrades and are not silently forced into this release.

## Production checks

- Confirm login redirects unauthenticated users to `/auth/login`.
- Confirm admin, employee, and partner accounts land only in their assigned portal.
- Confirm employee-owned tasks, notifications, time clock records, training assignments, and acknowledgements cannot be read or modified by another employee.
- Confirm financial screens show an em dash or empty state when live data is absent, never invented business results.

## Live platform verification

- Latest Vercel production deployment is ready and matches commit `4fdbba8`.
- Vercel reported no runtime error clusters during the seven-day production check.
- Supabase security advisors fell from seven notices to two: the intentional `is_admin()` RLS helper and the dashboard-level leaked-password-protection setting.
