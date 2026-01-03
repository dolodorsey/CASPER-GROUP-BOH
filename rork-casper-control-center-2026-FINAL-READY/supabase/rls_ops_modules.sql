-- RLS for Ops Modules (Needs/SOP/Scheduling/Chat/Onboarding/Training/Directory view)
-- Assumes multilocation role helpers exist:
--   is_admin(), current_role(), has_location(location_id), has_brand(brand_id), has_brand_via_locations(brand_id)

-- Needs
alter table public.supply_needs enable row level security;

drop policy if exists "needs_select" on public.supply_needs;
create policy "needs_select"
on public.supply_needs
for select
to authenticated
using (
  public.is_admin()
  or public.has_location(location_id)
);

drop policy if exists "needs_insert_employee" on public.supply_needs;
create policy "needs_insert_employee"
on public.supply_needs
for insert
to authenticated
with check (
  public.is_admin()
  or (
    public.current_role() in ('employee','partner')
    and public.has_location(location_id)
  )
);

drop policy if exists "needs_update_admin" on public.supply_needs;
create policy "needs_update_admin"
on public.supply_needs
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "needs_delete_admin" on public.supply_needs;
create policy "needs_delete_admin"
on public.supply_needs
for delete
to authenticated
using (public.is_admin());

-- SOPs
alter table public.sop_documents enable row level security;
alter table public.sop_acknowledgements enable row level security;

drop policy if exists "sop_select" on public.sop_documents;
create policy "sop_select"
on public.sop_documents
for select
to authenticated
using (
  public.is_admin()
  or (public.current_role() = 'employee' and public.has_brand_via_locations(brand_id))
  or (public.current_role() = 'partner' and public.has_brand(brand_id))
);

drop policy if exists "sop_admin_write" on public.sop_documents;
create policy "sop_admin_write"
on public.sop_documents
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "sop_ack_select" on public.sop_acknowledgements;
create policy "sop_ack_select"
on public.sop_acknowledgements
for select
to authenticated
using (
  public.is_admin()
  or user_id = auth.uid()
);

drop policy if exists "sop_ack_insert" on public.sop_acknowledgements;
create policy "sop_ack_insert"
on public.sop_acknowledgements
for insert
to authenticated
with check (
  user_id = auth.uid()
  and exists (
    select 1
    from public.sop_documents d
    where d.id = sop_id
      and (
        public.is_admin()
        or (public.current_role() = 'employee' and public.has_brand_via_locations(d.brand_id))
        or (public.current_role() = 'partner' and public.has_brand(d.brand_id))
      )
  )
);

-- Scheduling
alter table public.shifts enable row level security;

drop policy if exists "shifts_select" on public.shifts;
create policy "shifts_select"
on public.shifts
for select
to authenticated
using (
  public.is_admin()
  or public.has_location(location_id)
);

drop policy if exists "shifts_admin_write" on public.shifts;
create policy "shifts_admin_write"
on public.shifts
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

-- Chat
alter table public.chat_rooms enable row level security;
alter table public.chat_messages enable row level security;

drop policy if exists "chat_rooms_select" on public.chat_rooms;
create policy "chat_rooms_select"
on public.chat_rooms
for select
to authenticated
using (
  public.is_admin()
  or public.has_location(location_id)
);

drop policy if exists "chat_rooms_admin_write" on public.chat_rooms;
create policy "chat_rooms_admin_write"
on public.chat_rooms
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "chat_messages_select" on public.chat_messages;
create policy "chat_messages_select"
on public.chat_messages
for select
to authenticated
using (
  public.is_admin()
  or exists (
    select 1
    from public.chat_rooms r
    where r.id = room_id
      and public.has_location(r.location_id)
  )
);

drop policy if exists "chat_messages_insert" on public.chat_messages;
create policy "chat_messages_insert"
on public.chat_messages
for insert
to authenticated
with check (
  user_id = auth.uid()
  and (
    public.is_admin()
    or exists (
      select 1
      from public.chat_rooms r
      where r.id = room_id
        and public.has_location(r.location_id)
    )
  )
);

-- Onboarding
alter table public.onboarding_templates enable row level security;
alter table public.onboarding_runs enable row level security;

drop policy if exists "onboarding_templates_select" on public.onboarding_templates;
create policy "onboarding_templates_select"
on public.onboarding_templates
for select
to authenticated
using (public.is_admin());

drop policy if exists "onboarding_templates_admin_write" on public.onboarding_templates;
create policy "onboarding_templates_admin_write"
on public.onboarding_templates
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "onboarding_runs_select" on public.onboarding_runs;
create policy "onboarding_runs_select"
on public.onboarding_runs
for select
to authenticated
using (
  public.is_admin()
  or (user_id = auth.uid())
);

drop policy if exists "onboarding_runs_admin_write" on public.onboarding_runs;
create policy "onboarding_runs_admin_write"
on public.onboarding_runs
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

-- Training
alter table public.training_modules enable row level security;
alter table public.training_lessons enable row level security;
alter table public.training_questions enable row level security;
alter table public.training_attempts enable row level security;

drop policy if exists "training_modules_select" on public.training_modules;
create policy "training_modules_select"
on public.training_modules
for select
to authenticated
using (
  public.is_admin()
  or (public.current_role() = 'employee' and public.has_brand_via_locations(brand_id))
  or (public.current_role() = 'partner' and public.has_brand(brand_id))
);

drop policy if exists "training_modules_admin_write" on public.training_modules;
create policy "training_modules_admin_write"
on public.training_modules
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "training_lessons_select" on public.training_lessons;
create policy "training_lessons_select"
on public.training_lessons
for select
to authenticated
using (
  public.is_admin()
  or exists (
    select 1 from public.training_modules m
    where m.id = module_id
      and (
        public.is_admin()
        or (public.current_role() = 'employee' and public.has_brand_via_locations(m.brand_id))
        or (public.current_role() = 'partner' and public.has_brand(m.brand_id))
      )
  )
);

drop policy if exists "training_lessons_admin_write" on public.training_lessons;
create policy "training_lessons_admin_write"
on public.training_lessons
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "training_questions_select" on public.training_questions;
create policy "training_questions_select"
on public.training_questions
for select
to authenticated
using (
  public.is_admin()
  or exists (
    select 1
    from public.training_lessons l
    join public.training_modules m on m.id = l.module_id
    where l.id = lesson_id
      and (
        public.is_admin()
        or (public.current_role() = 'employee' and public.has_brand_via_locations(m.brand_id))
        or (public.current_role() = 'partner' and public.has_brand(m.brand_id))
      )
  )
);

drop policy if exists "training_questions_admin_write" on public.training_questions;
create policy "training_questions_admin_write"
on public.training_questions
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "training_attempts_select" on public.training_attempts;
create policy "training_attempts_select"
on public.training_attempts
for select
to authenticated
using (
  public.is_admin()
  or user_id = auth.uid()
);

drop policy if exists "training_attempts_insert" on public.training_attempts;
create policy "training_attempts_insert"
on public.training_attempts
for insert
to authenticated
with check (
  user_id = auth.uid()
);

-- Directory view is restricted by RLS on underlying tables (user_location_access + profiles).
-- No RLS on views; keep user_location_access RLS enabled (from multilocation install).
