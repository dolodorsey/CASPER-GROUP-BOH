-- Partner financials tables (partners see ONLY their own financials)
create extension if not exists pgcrypto;

create table if not exists public.partners (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.partner_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  partner_id uuid not null references public.partners(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.partner_agreements (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid not null references public.partners(id) on delete cascade,
  brand_id uuid null references public.cg_brands(id) on delete set null,
  location_id uuid null references public.cg_locations(id) on delete set null,
  brand_label text null,
  location_label text null,
  status text not null default 'active',
  payout_frequency text not null default 'weekly',
  revenue_share_bps int not null default 0, -- e.g. 1500 = 15.00%
  notes text null,
  created_at timestamptz not null default now()
);

create table if not exists public.partner_statements (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid not null references public.partners(id) on delete cascade,
  period_start date not null,
  period_end date not null,
  gross_sales_cents bigint not null default 0,
  net_sales_cents bigint not null default 0,
  partner_share_cents bigint not null default 0,
  adjustments_cents bigint not null default 0,
  net_due_partner_cents bigint not null default 0,
  status text not null default 'draft', -- draft|issued|paid
  created_at timestamptz not null default now()
);

create table if not exists public.partner_payouts (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid not null references public.partners(id) on delete cascade,
  statement_id uuid null references public.partner_statements(id) on delete set null,
  amount_cents bigint not null default 0,
  method text null, -- ach|wire|zelle|check
  status text not null default 'pending', -- pending|sent|paid|failed
  paid_at timestamptz null,
  created_at timestamptz not null default now()
);

create table if not exists public.partner_invoices (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid not null references public.partners(id) on delete cascade,
  invoice_number text null,
  direction text not null default 'casper_to_partner', -- casper_to_partner | partner_to_casper
  total_cents bigint not null default 0,
  status text not null default 'open', -- open|paid|void
  due_date date null,
  created_at timestamptz not null default now()
);

create unique index if not exists partner_invoices_invoice_number_uq on public.partner_invoices(invoice_number) where invoice_number is not null;
create index if not exists partner_statements_partner_idx on public.partner_statements(partner_id, period_start desc);
create index if not exists partner_payouts_partner_idx on public.partner_payouts(partner_id, created_at desc);
