-- IMPORTANT: ensure partners cannot access ops modules
-- Apply these only if you have the ops modules tables (supply_needs, shifts, chat_*, training_*).
-- If you already have RLS, this hardens it by explicitly limiting to admin/employee.

do $$
begin
  if to_regclass('public.supply_needs') is not null then
    alter table public.supply_needs enable row level security;
    drop policy if exists supply_needs_select_employee_admin on public.supply_needs;
    create policy supply_needs_select_employee_admin on public.supply_needs for select
      using (cg_is_admin() or cg_is_employee());
    drop policy if exists supply_needs_write_employee_admin on public.supply_needs;
    create policy supply_needs_write_employee_admin on public.supply_needs for insert with check (cg_is_admin() or cg_is_employee());
    drop policy if exists supply_needs_update_employee_admin on public.supply_needs;
    create policy supply_needs_update_employee_admin on public.supply_needs for update using (cg_is_admin() or cg_is_employee()) with check (cg_is_admin() or cg_is_employee());
  end if;

  if to_regclass('public.shifts') is not null then
    alter table public.shifts enable row level security;
    drop policy if exists shifts_select_employee_admin on public.shifts;
    create policy shifts_select_employee_admin on public.shifts for select
      using (cg_is_admin() or cg_is_employee());
    drop policy if exists shifts_write_admin on public.shifts;
    create policy shifts_write_admin on public.shifts for insert with check (cg_is_admin());
    drop policy if exists shifts_update_admin on public.shifts;
    create policy shifts_update_admin on public.shifts for update using (cg_is_admin()) with check (cg_is_admin());
  end if;

  if to_regclass('public.chat_rooms') is not null then
    alter table public.chat_rooms enable row level security;
    drop policy if exists chat_rooms_select_employee_admin on public.chat_rooms;
    create policy chat_rooms_select_employee_admin on public.chat_rooms for select
      using (cg_is_admin() or cg_is_employee());
    drop policy if exists chat_rooms_write_employee_admin on public.chat_rooms;
    create policy chat_rooms_write_employee_admin on public.chat_rooms for insert with check (cg_is_admin() or cg_is_employee());
  end if;

  if to_regclass('public.chat_messages') is not null then
    alter table public.chat_messages enable row level security;
    drop policy if exists chat_messages_select_employee_admin on public.chat_messages;
    create policy chat_messages_select_employee_admin on public.chat_messages for select
      using (cg_is_admin() or cg_is_employee());
    drop policy if exists chat_messages_write_employee_admin on public.chat_messages;
    create policy chat_messages_write_employee_admin on public.chat_messages for insert with check (cg_is_admin() or cg_is_employee());
  end if;

  if to_regclass('public.sop_documents') is not null then
    alter table public.sop_documents enable row level security;
    drop policy if exists sop_documents_select_employee_admin on public.sop_documents;
    create policy sop_documents_select_employee_admin on public.sop_documents for select
      using (cg_is_admin() or cg_is_employee());
    drop policy if exists sop_documents_write_admin on public.sop_documents;
    create policy sop_documents_write_admin on public.sop_documents for insert with check (cg_is_admin());
    drop policy if exists sop_documents_update_admin on public.sop_documents;
    create policy sop_documents_update_admin on public.sop_documents for update using (cg_is_admin()) with check (cg_is_admin());
  end if;

  if to_regclass('public.sop_acknowledgements') is not null then
    alter table public.sop_acknowledgements enable row level security;
    drop policy if exists sop_ack_select_self_employee_admin on public.sop_acknowledgements;
    create policy sop_ack_select_self_employee_admin on public.sop_acknowledgements for select
      using (cg_is_admin() or (cg_is_employee() and user_id = auth.uid()));
    drop policy if exists sop_ack_insert_self_employee_admin on public.sop_acknowledgements;
    create policy sop_ack_insert_self_employee_admin on public.sop_acknowledgements for insert
      with check (cg_is_admin() or (cg_is_employee() and user_id = auth.uid()));
  end if;
end $$;
