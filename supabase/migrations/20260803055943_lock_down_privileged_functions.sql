-- Audit data is private and append-only for the signed-in actor.
alter table public.activity_logs enable row level security;
create policy activity_logs_read_scoped on public.activity_logs
  for select to authenticated using (user_id = auth.uid() or public.is_admin());
create policy activity_logs_insert_own on public.activity_logs
  for insert to authenticated with check (user_id = auth.uid());

-- Incident creation must preserve the authenticated reporter identity.
drop policy if exists incidents_create on public.cg_incidents;
create policy incidents_create_own_reporter on public.cg_incidents
  for insert to authenticated with check (reported_by = auth.uid() or public.is_admin());

-- SECURITY DEFINER functions are private unless deliberately granted below.
revoke execute on function public.is_admin() from public, anon;
revoke execute on function public.my_role() from public, anon;
revoke execute on function public."current_role"() from public, anon;
revoke execute on function public.cg_validate_invite_code(text) from public, anon;
revoke execute on function public.cg_complete_signup(text,text,text,text,text) from public, anon;
revoke execute on function public.log_activity(text,text,text,text,jsonb) from public, anon;
revoke execute on function public.get_recent_activity(integer) from public, anon, authenticated;
revoke execute on function public.calculate_network_kpis() from public, anon, authenticated;
revoke execute on function public.cg_sync_location_from_khg(text,uuid,integer,text,text,text,text,text,text,text,text[]) from public, anon, authenticated;
revoke execute on function public.cg_recompute_onboarding() from public, anon, authenticated;
revoke execute on function casper_boh.rpc_command_summary(text,text) from public, anon, authenticated;

grant execute on function public.is_admin() to authenticated;
grant execute on function public.my_role() to authenticated;
grant execute on function public."current_role"() to authenticated;
grant execute on function public.cg_validate_invite_code(text) to authenticated;
grant execute on function public.cg_complete_signup(text,text,text,text,text) to authenticated;
grant execute on function public.log_activity(text,text,text,text,jsonb) to authenticated;
