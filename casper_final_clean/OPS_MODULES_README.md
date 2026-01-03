# Casper Ops Modules Update (Patch)

This patch adds the following modules to Casper Control™:
- Needs/Requests
- SOP Library (links + acknowledgement)
- Scheduling
- Location Chat
- Directory
- Onboarding (scaffold)
- Training (scaffold)

## 1) Apply Supabase SQL
Run these in Supabase SQL Editor (in order):

1) `supabase/migration_ops_modules.sql`
2) `supabase/rls_ops_modules.sql`

> Notes
- This assumes the prior "multilocation roles" install already exists (user_location_access, helper functions like `is_admin()`, etc).
- Chat rooms are auto-seeded (1 per location).

## 2) App UI
Admin Dashboard now has tabs for:
Inventory, Needs, SOPs, Scheduling, Onboarding, Training, Directory, Chat

Employee Portal now has tabs for:
Dashboard, Schedule, Needs, SOPs, Training, Onboarding, Chat

Partner Portal now has tabs for:
Dashboard, Locations, Needs, SOPs, Schedule, Chat, Payouts, Opportunities

## 3) SOP Uploads
SOPs are currently referenced by `file_url` in `sop_documents`.
When you upload PDFs later, add their public URL into `file_url`.
(Next upgrade: Supabase Storage + signed URLs + upload UI.)

## 4) Known MVP Constraints (by design)
- Scheduling "Assign user" currently uses `user_id` UUID input (next: dropdown directory picker).
- Training & onboarding are scaffolded; full task lists/quizzes come after SOP ingestion.
