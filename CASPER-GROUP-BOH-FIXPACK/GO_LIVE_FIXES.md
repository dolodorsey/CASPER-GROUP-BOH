# Casper Control™ — Go‑Live Fix Pack (January 2026)

This repo shipped with the main UI screens, but there were several **hard blockers** preventing true production go‑live.

This fix pack closes those blockers so you can:

✅ Log in with Google (OAuth) on iOS/Android/Web
✅ Route users to the right portal based on role (admin/employee/partner)
✅ Remove API keys from the mobile app (Airtable/n8n)
✅ Align backend routes so the app stops returning 404s

---

## 1) AUTH FIXES — OAuth that actually completes

### What was broken
Supabase `signInWithOAuth()` was started correctly, but **the session never got created** because the app wasn’t exchanging the PKCE code returned from the browser.

### What was fixed
- `app/login.tsx` now uses `expo-web-browser` (`openAuthSessionAsync`) and exchanges the redirect URL into a real session.
- `app/auth/callback.tsx` now handles both:
  - the initial deep link
  - subsequent url events

### What you must have set
In Supabase Dashboard → Authentication → URL Configuration:
- **Site URL**: your app/web origin
- **Additional Redirect URLs** (add ALL):
  - `caspercontrol://auth/callback`
  - `exp://127.0.0.1:19000/--/auth/callback` (local)
  - your Rork web preview callback (if using web)

---

## 2) ROLE‑BASED ACCESS — no more “anyone can open anything”

### What was broken
The UI had separate portals, but **no enforcement**, meaning anyone could open admin/partner/employee screens if they knew the route.

### What was fixed
- Global `AuthProvider` is now mounted in `app/_layout.tsx`
- `app/admin/_layout.tsx` already gates admin
- `app/employee.tsx` is now gated (`employee | admin`)
- `app/partner.tsx` is now gated (`partner | admin`)

---

## 3) BACKEND ROUTING — stop the /api/trpc 404s

### What was broken
The backend was mounted at `/trpc/*` while the client requests were going to `/api/trpc`.

### What was fixed
- Backend now mounts tRPC at:
  - `GET/POST /api/trpc/*`

---

## 4) SECURITY FIX — remove Airtable/n8n keys from the app

### What was broken
`lib/api.ts` used `EXPO_PUBLIC_AIRTABLE_API_KEY` and `EXPO_PUBLIC_N8N_WEBHOOK_TOKEN`.

That means:
- keys live inside the installed app
- anyone can extract them
- unlimited misuse risk

### What was fixed
New secure backend proxy:
- `backend/brain.ts`
- routes:
  - `POST /api/brain/airtable/query`
  - `POST /api/brain/airtable/create`
  - `POST /api/brain/n8n/execute`

The backend validates the Supabase access token before forwarding the call.

Mobile client now calls:
- `lib/brainClient.ts`
and `lib/api.ts` is now a compatibility wrapper using the secure proxy.

---

## 5) ENVIRONMENT VARIABLES (critical)

### Mobile / Expo Public
Set in Rork:
- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- `EXPO_PUBLIC_RORK_API_BASE_URL`

### Backend / Server‑only
Set wherever your backend runs:
- `SUPABASE_SERVICE_ROLE_KEY`
- `AIRTABLE_API_KEY`
- `AIRTABLE_BASE_ID`
- `N8N_BASE_URL`
- `N8N_WEBHOOK_TOKEN` (optional)

See `.env.example` for the full list.

---

## 6) FINAL GO‑LIVE CHECKLIST

### Authentication
- [ ] Google OAuth enabled in Supabase
- [ ] Redirect URLs added
- [ ] `caspercontrol://auth/callback` tested

### Roles
- [ ] `profiles.role` is one of: `admin | employee | partner`
- [ ] RLS policies exist for `profiles` and role‑based tables

### Backend
- [ ] `/` returns `{ status: "ok" }`
- [ ] `/api/trpc` responds (no 404)
- [ ] `/api/brain/health` responds

### Security
- [ ] No Airtable key stored in Expo public env
- [ ] No n8n token stored in Expo public env

---

## If you want the “billion dollar” build path
Open: **BILLION_DOLLAR_APP_ROADMAP.md**
