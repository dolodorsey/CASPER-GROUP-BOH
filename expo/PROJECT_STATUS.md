# CASPER GROUP BOH Project Status

Updated: 2026-08-09

## Current state

- Web production: deployed and verified
- Supabase: live authenticated operating core with 12 active CASPER brands
- GitHub: automated backend, test, TypeScript, web export, and dependency quality gate
- Native builds: Expo configuration present; EAS project linking and store credentials still required

## Completed

- Removed mock Washington Parq data and unused template backends.
- Removed the hard-coded legacy Supabase JWT from source.
- Stocked truthful brand, SOP, training, channel, and location reference data.
- Preserved live KPIs, reports, financials, staffing, incidents, and alerts without fabrication.
- Removed false deployment/completion documents and the invalid EAS project identifier.

## Remaining release gates

1. Link this repository to the correct EAS project.
2. Configure `EXPO_TOKEN` plus non-interactive iOS signing and App Store Connect credentials.
3. Add and run an automated production build/submission workflow. Manual iOS deployment is prohibited.

See `README.md` and the repository-level `RELEASE_EVIDENCE.md` for the verified commands and production evidence.
