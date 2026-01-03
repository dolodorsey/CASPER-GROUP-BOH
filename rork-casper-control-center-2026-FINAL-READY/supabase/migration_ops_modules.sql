-- Casper Group Ops Modules (Needs/Requests, SOP Library, Scheduling, Chat, Onboarding, Training)
-- This migration assumes multilocation roles are already installed:
--  - user_location_access, user_brand_access, helper functions: is_admin(), current_role(), has_location(), has_brand()
--  - cg_locations, cg_brands, cg_brand_locations

-- Extra profile fields for directory display
alter table public.profiles
  add column if not exists full_name text,
  add column if not exists phone text,
  add column if not exists title text,
  add column if not exists status text default 'active';

-- Helper: allow employees to access SOPs by brands present at their allowed locations
create or replace function public.has_brand_via_locations(target_brand_id text)
returns boolean
language sql
stable
as $$
  select
    public.is_admin()
    or exists (
      select 1
      from public.user_location_access ula
      join public.cg_brand_locations cbl
        on cbl.location_id = ula.location_id
      where ula.user_id = auth.uid()
        and ula.is_active = true
        and cbl.brand_id = target_brand_id
    );
$$;

-- 1) Needs / Requests
create table if not exists public.supply_needs (
  id uuid primary key default gen_random_uuid(),
  created_by uuid not null references auth.users(id) on delete cascade,
  location_id text not null references public.cg_locations(id) on delete cascade,
  brand_id text references public.cg_brands(id) on delete set null,
  item_name text not null,
  quantity text,
  urgency text not null default 'normal' check (urgency in ('low','normal','high')),
  status text not null default 'pending' check (status in ('pending','approved','ordered','fulfilled')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists supply_needs_location_idx on public.supply_needs(location_id);
create index if not exists supply_needs_status_idx on public.supply_needs(status);
create index if not exists supply_needs_created_at_idx on public.supply_needs(created_at desc);

-- 2) SOP Library (no file uploads yet; store file_url for later)
create table if not exists public.sop_documents (
  id uuid primary key default gen_random_uuid(),
  brand_id text not null references public.cg_brands(id) on delete cascade,
  title text not null,
  version text,
  file_url text,
  is_active boolean not null default true,
  published_at timestamptz not null default now(),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.sop_acknowledgements (
  id uuid primary key default gen_random_uuid(),
  sop_id uuid not null references public.sop_documents(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  acknowledged_at timestamptz not null default now(),
  unique (sop_id, user_id)
);

create index if not exists sop_documents_brand_idx on public.sop_documents(brand_id);
create index if not exists sop_ack_user_idx on public.sop_acknowledgements(user_id);

-- 3) Scheduling
create table if not exists public.shifts (
  id uuid primary key default gen_random_uuid(),
  location_id text not null references public.cg_locations(id) on delete cascade,
  brand_id text references public.cg_brands(id) on delete set null,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text,
  start_at timestamptz not null,
  end_at timestamptz not null,
  status text not null default 'scheduled' check (status in ('scheduled','confirmed','completed','cancelled')),
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists shifts_location_idx on public.shifts(location_id);
create index if not exists shifts_user_idx on public.shifts(user_id);
create index if not exists shifts_start_idx on public.shifts(start_at);

-- 4) Location Chat
create table if not exists public.chat_rooms (
  id uuid primary key default gen_random_uuid(),
  location_id text not null references public.cg_locations(id) on delete cascade,
  name text not null,
  type text not null default 'location',
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (location_id, type)
);

create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.chat_rooms(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);

create index if not exists chat_messages_room_idx on public.chat_messages(room_id, created_at);

-- Seed a default "location" room for each location (safe to re-run)
insert into public.chat_rooms (location_id, name, type)
select l.id, l.name || ' Team Chat', 'location'
from public.cg_locations l
on conflict (location_id, type) do nothing;

-- 5) Onboarding
create table if not exists public.onboarding_templates (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.onboarding_runs (
  id uuid primary key default gen_random_uuid(),
  template_id uuid not null references public.onboarding_templates(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  location_id text not null references public.cg_locations(id) on delete cascade,
  status text not null default 'active' check (status in ('active','completed','cancelled')),
  started_at timestamptz not null default now(),
  completed_at timestamptz
);

create index if not exists onboarding_runs_location_idx on public.onboarding_runs(location_id);
create index if not exists onboarding_runs_user_idx on public.onboarding_runs(user_id);

-- 6) Training
create table if not exists public.training_modules (
  id uuid primary key default gen_random_uuid(),
  brand_id text not null references public.cg_brands(id) on delete cascade,
  title text not null,
  description text,
  is_active boolean not null default true,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.training_lessons (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references public.training_modules(id) on delete cascade,
  title text not null,
  content text,
  order_index int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.training_questions (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references public.training_lessons(id) on delete cascade,
  question text not null,
  choices jsonb not null default '[]'::jsonb,
  correct_index int,
  explanation text,
  created_at timestamptz not null default now()
);

create table if not exists public.training_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  lesson_id uuid not null references public.training_lessons(id) on delete cascade,
  answers jsonb not null default '{}'::jsonb,
  score int,
  passed boolean,
  completed_at timestamptz not null default now()
);

create index if not exists training_modules_brand_idx on public.training_modules(brand_id);
create index if not exists training_attempts_user_idx on public.training_attempts(user_id);

-- Directory view: show users by location access
-- Note: relies on profiles rows for display info; profiles should be created on signup by existing trigger.
create or replace view public.v_directory as
select
  ula.user_id,
  ula.role,
  p.full_name,
  p.email,
  p.title,
  ula.location_id,
  l.name as location_name
from public.user_location_access ula
join public.cg_locations l on l.id = ula.location_id
left join public.profiles p on p.id = ula.user_id
where ula.is_active = true;
