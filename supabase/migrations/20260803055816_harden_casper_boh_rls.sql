-- CASPER BOH is an authenticated back-office system. Remove anonymous reads.
alter policy alerts_read on public.cg_alerts to authenticated;
alter policy brands_read on public.cg_brands to authenticated;
alter policy channels_read on public.cg_channels to authenticated;
alter policy equipment_read on public.cg_equipment to authenticated;
alter policy incidents_read on public.cg_incidents to authenticated;
alter policy kpis_read on public.cg_kpis to authenticated;
alter policy locations_read on public.cg_locations to authenticated;
alter policy menu_read on public.cg_menu_items to authenticated;
alter policy sops_read on public.cg_sops to authenticated;
alter policy tasks_read on public.cg_tasks to authenticated;
alter policy tickets_read on public.cg_tickets to authenticated;
alter policy ta_read on public.cg_training_assignments to authenticated;
alter policy training_read on public.cg_training_modules to authenticated;
alter policy vendor_read on public.cg_vendors to authenticated;

-- A user's own profile policy must not allow self-promotion to admin.
revoke update on public.profiles from authenticated;
grant update (full_name) on public.profiles to authenticated;
alter policy profiles_update_safe_own on public.profiles
  using (id = auth.uid()) with check (id = auth.uid());

-- Operational child records must never be universally writable.
drop policy if exists "auth all alert_esc" on public.cg_alert_escalations;
create policy alert_escalations_admin_all on public.cg_alert_escalations
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "auth all incident_updates" on public.cg_incident_updates;
create policy incident_updates_read on public.cg_incident_updates
  for select to authenticated using (true);
create policy incident_updates_insert_own on public.cg_incident_updates
  for insert to authenticated with check (author_id = auth.uid());
create policy incident_updates_admin_update on public.cg_incident_updates
  for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy incident_updates_admin_delete on public.cg_incident_updates
  for delete to authenticated using (public.is_admin());

drop policy if exists "auth all notifications" on public.cg_notifications;
create policy notifications_read_own on public.cg_notifications
  for select to authenticated using (recipient_id = auth.uid() or public.is_admin());
create policy notifications_update_own on public.cg_notifications
  for update to authenticated using (recipient_id = auth.uid() or public.is_admin())
  with check (recipient_id = auth.uid() or public.is_admin());
create policy notifications_admin_insert on public.cg_notifications
  for insert to authenticated with check (public.is_admin());
create policy notifications_admin_delete on public.cg_notifications
  for delete to authenticated using (public.is_admin());

drop policy if exists "auth all po_items" on public.cg_purchase_order_items;
create policy po_items_admin_all on public.cg_purchase_order_items
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "auth all cg_staff" on public.cg_staff;
create policy staff_read_scoped on public.cg_staff
  for select to authenticated using (profile_id = auth.uid() or public.is_admin());
create policy staff_admin_write on public.cg_staff
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "auth all time_clock" on public.cg_time_clock;
create policy time_clock_read_own on public.cg_time_clock
  for select to authenticated using (profile_id = auth.uid() or public.is_admin());
create policy time_clock_insert_own on public.cg_time_clock
  for insert to authenticated with check (profile_id = auth.uid() or public.is_admin());
create policy time_clock_update_own on public.cg_time_clock
  for update to authenticated using (profile_id = auth.uid() or public.is_admin())
  with check (profile_id = auth.uid() or public.is_admin());
create policy time_clock_admin_delete on public.cg_time_clock
  for delete to authenticated using (public.is_admin());

drop policy if exists tasks_write on public.cg_tasks;
alter policy tasks_read on public.cg_tasks using (
  public.is_admin() or created_by = auth.uid() or assigned_to = auth.uid()
);
create policy tasks_insert_scoped on public.cg_tasks
  for insert to authenticated with check (
    public.is_admin() or created_by = auth.uid() or assigned_to = auth.uid()
  );
create policy tasks_update_scoped on public.cg_tasks
  for update to authenticated using (
    public.is_admin() or created_by = auth.uid() or assigned_to = auth.uid()
  ) with check (
    public.is_admin() or created_by = auth.uid() or assigned_to = auth.uid()
  );
create policy tasks_delete_admin on public.cg_tasks
  for delete to authenticated using (public.is_admin());

drop policy if exists ta_write on public.cg_training_assignments;
alter policy ta_read on public.cg_training_assignments using (
  public.is_admin() or user_id = auth.uid()
);
create policy training_assignments_admin_write on public.cg_training_assignments
  for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy training_assignments_update_own on public.cg_training_assignments
  for update to authenticated using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists sops_write on public.cg_sops;
create policy sops_admin_write on public.cg_sops
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- Users can acknowledge only for themselves; administrators can audit all rows.
drop policy if exists ack_read on public.cg_sop_acknowledgements;
create policy acknowledgements_read_scoped on public.cg_sop_acknowledgements
  for select to authenticated using (user_id = auth.uid() or public.is_admin());
create policy acknowledgements_insert_own on public.cg_sop_acknowledgements
  for insert to authenticated with check (user_id = auth.uid());

-- Audit rows must identify the authenticated actor and cannot be edited by clients.
drop policy if exists audit_write on public.cg_audit_log;
create policy audit_insert_own_actor on public.cg_audit_log
  for insert to authenticated with check (actor_id = auth.uid());
