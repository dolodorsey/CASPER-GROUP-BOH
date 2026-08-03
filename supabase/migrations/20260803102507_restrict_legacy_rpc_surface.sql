-- These legacy helpers are not called by the current BOH client. Keep them
-- available to service-side workflows only instead of exposing privileged
-- SECURITY DEFINER entry points through the Data API.
revoke execute on function public.cg_complete_signup(text,text,text,text,text) from public, anon, authenticated;
revoke execute on function public.cg_validate_invite_code(text) from public, anon, authenticated;
revoke execute on function public."current_role"() from public, anon, authenticated;
revoke execute on function public.my_role() from public, anon, authenticated;
revoke execute on function public.log_activity(text,text,text,text,jsonb) from public, anon, authenticated;

grant execute on function public.cg_complete_signup(text,text,text,text,text) to service_role;
grant execute on function public.cg_validate_invite_code(text) to service_role;
grant execute on function public."current_role"() to service_role;
grant execute on function public.my_role() to service_role;
grant execute on function public.log_activity(text,text,text,text,jsonb) to service_role;
