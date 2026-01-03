begin;

-- Brand hours table (optional)
create table if not exists public.cg_brand_hours (
  brand_id text not null references public.cg_brands(id) on delete cascade,
  day_of_week int not null check (day_of_week between 0 and 6), -- 0=Sun
  open_time time not null,
  close_time time not null,
  crosses_midnight boolean not null default false,
  primary key (brand_id, day_of_week)
);

alter table public.cg_brand_hours enable row level security;

-- Admin can manage; employees can read
drop policy if exists cg_brand_hours_admin_all on public.cg_brand_hours;
create policy cg_brand_hours_admin_all
on public.cg_brand_hours for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists cg_brand_hours_employee_read on public.cg_brand_hours;
create policy cg_brand_hours_employee_read
on public.cg_brand_hours for select
to authenticated
using (public.current_role() in ('admin','employee'));

-- Seed defaults:
-- Tha Morning After: 05:00 - 17:00
-- All others: 13:00 - 01:00 (crosses midnight)
-- Days: 0-6
do $$
declare d int;
begin
  for d in 0..6 loop
    insert into public.cg_brand_hours (brand_id, day_of_week, open_time, close_time, crosses_midnight)
    values ('tha-morning-after', d, '05:00', '17:00', false)
    on conflict (brand_id, day_of_week) do update
      set open_time = excluded.open_time,
          close_time = excluded.close_time,
          crosses_midnight = excluded.crosses_midnight;

    insert into public.cg_brand_hours (brand_id, day_of_week, open_time, close_time, crosses_midnight)
    values ('angel-wings', d, '13:00', '01:00', true)
    on conflict (brand_id, day_of_week) do update
      set open_time = excluded.open_time,
          close_time = excluded.close_time,
          crosses_midnight = excluded.crosses_midnight;

    insert into public.cg_brand_hours (brand_id, day_of_week, open_time, close_time, crosses_midnight)
    values ('espresso-co', d, '13:00', '01:00', true)
    on conflict (brand_id, day_of_week) do update
      set open_time = excluded.open_time,
          close_time = excluded.close_time,
          crosses_midnight = excluded.crosses_midnight;

    insert into public.cg_brand_hours (brand_id, day_of_week, open_time, close_time, crosses_midnight)
    values ('mojo-juice', d, '13:00', '01:00', true)
    on conflict (brand_id, day_of_week) do update
      set open_time = excluded.open_time,
          close_time = excluded.close_time,
          crosses_midnight = excluded.crosses_midnight;

    insert into public.cg_brand_hours (brand_id, day_of_week, open_time, close_time, crosses_midnight)
    values ('taco-yaki', d, '13:00', '01:00', true)
    on conflict (brand_id, day_of_week) do update
      set open_time = excluded.open_time,
          close_time = excluded.close_time,
          crosses_midnight = excluded.crosses_midnight;

    insert into public.cg_brand_hours (brand_id, day_of_week, open_time, close_time, crosses_midnight)
    values ('sweet-tooth', d, '13:00', '01:00', true)
    on conflict (brand_id, day_of_week) do update
      set open_time = excluded.open_time,
          close_time = excluded.close_time,
          crosses_midnight = excluded.crosses_midnight;

    insert into public.cg_brand_hours (brand_id, day_of_week, open_time, close_time, crosses_midnight)
    values ('mr-oyster', d, '13:00', '01:00', true)
    on conflict (brand_id, day_of_week) do update
      set open_time = excluded.open_time,
          close_time = excluded.close_time,
          crosses_midnight = excluded.crosses_midnight;

    insert into public.cg_brand_hours (brand_id, day_of_week, open_time, close_time, crosses_midnight)
    values ('patty-daddy', d, '13:00', '01:00', true)
    on conflict (brand_id, day_of_week) do update
      set open_time = excluded.open_time,
          close_time = excluded.close_time,
          crosses_midnight = excluded.crosses_midnight;

    insert into public.cg_brand_hours (brand_id, day_of_week, open_time, close_time, crosses_midnight)
    values ('tossed', d, '13:00', '01:00', true)
    on conflict (brand_id, day_of_week) do update
      set open_time = excluded.open_time,
          close_time = excluded.close_time,
          crosses_midnight = excluded.crosses_midnight;

    insert into public.cg_brand_hours (brand_id, day_of_week, open_time, close_time, crosses_midnight)
    values ('pasta-bish', d, '13:00', '01:00', true)
    on conflict (brand_id, day_of_week) do update
      set open_time = excluded.open_time,
          close_time = excluded.close_time,
          crosses_midnight = excluded.crosses_midnight;
  end loop;
end $$;

commit;
