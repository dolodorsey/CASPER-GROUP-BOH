# Casper Control™ — Billion‑Dollar App Roadmap

This is the **execution blueprint** to take Casper Control from “working portal” → **the operating system for a national food empire.**

It’s split into:
- **Go‑Live (Now)**: non‑negotiable production stability
- **Scale (30–90 days)**: multi‑location mastery
- **Domination (90–180 days)**: automation + forecasting + real-time control
- **Empire (6–18 months)**: standardized rollouts + franchise-grade tooling

---

## Phase 0 — Go‑Live Foundation (DONE in this fix pack)

### ✅ Authentication & Sessions
- Google OAuth completes with PKCE exchange
- Deep link callback works across platforms

### ✅ RBAC (role-based access control)
- Admin/Employee/Partner portals are protected with `AccessGate`

### ✅ Secure API design
- Airtable + n8n keys moved server-side
- Backend proxy validates Supabase tokens before forwarding

### ✅ Backend route alignment
- `/api/trpc/*` mounted correctly

---

## Phase 1 — Premium Product Feel (7–14 days)

Goal: make the app feel like **a luxury control room**, not a basic admin tool.

### Build a Casper Design System
Create a unified UI kit and enforce it everywhere:
- `ui/Button` (primary/secondary/ghost/destructive/loading)
- `ui/Card` (base + pressable + glass + image)
- `ui/Tag + ui/Pill`
- `ui/Input` (search, masked, password, form)
- `ui/BottomSheet` (filters, picker, sort)
- `ui/Skeleton` (loading states)
- `ui/Toast + AlertBanner`
- `ui/Avatar + Badge` (Verified, Trending, Hot, Low Stock)

**Deliverable:** every screen looks like the same premium OS.

### Animation & Interaction Layer
- micro haptics (success/warning/error)
- animated tab transitions
- “live” status indicators
- skeleton shimmer for data load

---

## Phase 2 — Command Dashboard (14–30 days)

Goal: one screen that tells you “what matters right now” across all brands.

### KPIs that pay bills
- Revenue today / last 7 / last 30
- Tickets/hour, average ticket
- Labor vs sales %
- Waste (food + time)
- Inventory risk (low stock)
- Delivery partner health (UberEats/Doordash spikes)

### Real-time alerts (SEV system)
- “Line down” / “printer dead” / “Uber spike” / “inventory low”
- 1-tap escalation to group chat / SMS

### Multi-location switching
- home location
- “All Locations” rollups
- location-level performance ranking

---

## Phase 3 — The Automation Engine (30–90 days)

Goal: the app should not just **show data** — it should **move the business.**

### Automated playbooks
Trigger smart workflows when thresholds hit:
- low stock → create purchase order + notify manager
- high wait time → call in backup + re-route orders
- revenue dip → launch promo + retarget segment

### Internal AI Operator (Linda mode)
- “What should we do right now?”
- “Why did Houston drop 12%?”
- “Forecast tomorrow’s prep list by hour.”

---

## Phase 4 — Enterprise Security & Observability (30–120 days)

Goal: survive scale + protect money.

- Org-level RBAC (roles + permissions matrix)
- Location scoping for every table
- Audit trails for all actions
- Admin-only exports
- Rate limiting on proxy routes
- Error monitoring (Sentry)
- Analytics event pipeline (PostHog/Amplitude)

---

## Phase 5 — Franchise-Grade Rollout (90–180 days)

Goal: onboarding a new location should take **hours**, not weeks.

- “New Location Wizard”
- Employee onboarding + QR login
- Training curriculum locked to roles
- Compliance & inspections module
- Vendor & invoicing module

---

## Phase 6 — The Billion-Dollar Layer (6–18 months)

Goal: this becomes a product that could run other restaurant groups.

- Marketplace for SOPs/playbooks
- White-label portals
- Partner access for investors
- Data monetization (benchmarking)
- Smart pricing suggestions based on elasticity

---

## The 3 features that separate “nice app” from “empire OS”

1) **Forecasting** (tomorrow’s sales, labor, prep, inventory)
2) **Automation** (system takes actions without humans)
3) **Standardization** (every new location runs the same playbook)

When those 3 exist, you’re no longer managing restaurants —
you’re running a machine.
