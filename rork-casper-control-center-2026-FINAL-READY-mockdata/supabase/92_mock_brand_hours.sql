-- Optional: Brand Hours (for scheduling defaults / UI hints)
-- Morning After: 05:00–17:00
-- Others: 13:00–01:00
begin;

create table if not exists public.cg_brand_hours (
  brand_id text primary key references public.cg_brands(id) on delete cascade,
  open_time time not null,
  close_time time not null,
  close_next_day boolean not null default false,
  timezone text not null default 'America/New_York',
  updated_at timestamptz not null default now()
);

alter table public.cg_brand_hours enable row level security;

-- Admin full access
drop policy if exists cg_brand_hours_admin_all on public.cg_brand_hours;
create policy cg_brand_hours_admin_all
on public.cg_brand_hours for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

-- Employee read
drop policy if exists cg_brand_hours_select_emp_admin on public.cg_brand_hours;
create policy cg_brand_hours_select_emp_admin
on public.cg_brand_hours for select
to authenticated
using (public.is_admin() or public.current_role() = 'employee');

insert into public.cg_brand_hours (brand_id, open_time, close_time, close_next_day, timezone) values
  ('tha-morning-after', '05:00', '17:00', false, 'America/New_York'),

  ('angel-wings',       '13:00', '01:00', true,  'America/New_York'),
  ('espresso-co',       '13:00', '01:00', true,  'America/New_York'),
  ('mojo-juice',        '13:00', '01:00', true,  'America/New_York'),
  ('taco-yaki',         '13:00', '01:00', true,  'America/New_York'),
  ('sweet-tooth',       '13:00', '01:00', true,  'America/New_York'),
  ('mr-oyster',         '13:00', '01:00', true,  'America/New_York'),
  ('patty-daddy',       '13:00', '01:00', true,  'America/New_York'),
  ('tossed',            '13:00', '01:00', true,  'America/New_York'),
  ('pasta-bish',        '13:00', '01:00', true,  'America/New_York')
on conflict (brand_id) do update
set open_time = excluded.open_time,
    close_time = excluded.close_time,
    close_next_day = excluded.close_next_day,
    timezone = excluded.timezone,
    updated_at = now();

commit;
