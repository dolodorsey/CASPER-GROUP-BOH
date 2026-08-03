drop policy if exists insert_activity_authed on casper_boh.activity_logs;
create policy insert_activity_own_actor on casper_boh.activity_logs
  for insert to authenticated with check (actor_id = auth.uid());

create policy brand_bibles_admin_read on public.cg_brand_bibles
  for select to authenticated using (public.is_admin());
