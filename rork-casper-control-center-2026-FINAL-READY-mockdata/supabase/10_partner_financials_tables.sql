-- Partner financials tables
-- Partners are FINANCIAL-ONLY. No ops tables are readable for partners (enforced in helpers + RLS).
-- This is a minimal schema you can extend later.

-- Ensure profiles has partner_id
alter table public.profiles
  add column if not exists partner_id uuid;

create table if not exists public.partners (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.partner_locations (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid not null references public.partners(id) on delete cascade,
  location_id text not null,
  brand_id text null,
  created_at timestamptz not null default now(),
  unique (partner_id, location_id, brand_id)
);

create table if not exists public.partner_statements (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid not null references public.partners(id) on delete cascade,
  location_id text null,
  brand_id text null,
  period_start date not null,
  period_end date not null,
  status text not null default 'draft', -- draft|final|paid
  gross_sales_cents bigint not null default 0,
  fees_cents bigint not null default 0,
  adjustments_cents bigint not null default 0,
  net_due_partner_cents bigint not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists partner_statements_partner_id_idx on public.partner_statements(partner_id);
create index if not exists partner_statements_period_idx on public.partner_statements(period_start, period_end);

create table if not exists public.partner_payouts (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid not null references public.partners(id) on delete cascade,
  statement_id uuid null references public.partner_statements(id) on delete set null,
  amount_cents bigint not null default 0,
  status text not null default 'scheduled', -- scheduled|paid|failed
  paid_at timestamptz null,
  created_at timestamptz not null default now()
);

create index if not exists partner_payouts_partner_id_idx on public.partner_payouts(partner_id);

create table if not exists public.partner_invoices (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid not null references public.partners(id) on delete cascade,
  statement_id uuid null references public.partner_statements(id) on delete set null,
  invoice_number text null,
  direction text not null default 'charge', -- charge|credit
  status text not null default 'open', -- open|paid|void
  total_cents bigint not null default 0,
  due_date date null,
  created_at timestamptz not null default now()
);

create index if not exists partner_invoices_partner_id_idx on public.partner_invoices(partner_id);
