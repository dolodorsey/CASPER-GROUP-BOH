-- RLS for Partner Financials
-- Admins can see/manage all. Partners can only select rows belonging to their partner_id.

alter table public.partners enable row level security;
alter table public.partner_locations enable row level security;
alter table public.partner_statements enable row level security;
alter table public.partner_payouts enable row level security;
alter table public.partner_invoices enable row level security;

-- partners table
drop policy if exists "partners_admin_all" on public.partners;
create policy "partners_admin_all" on public.partners
for all to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "partners_partner_select_self" on public.partners;
create policy "partners_partner_select_self" on public.partners
for select to authenticated
using (public.current_role() = 'partner' and id = public.current_partner_id());

-- partner_locations
drop policy if exists "partner_locations_admin_all" on public.partner_locations;
create policy "partner_locations_admin_all" on public.partner_locations
for all to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "partner_locations_partner_select_self" on public.partner_locations;
create policy "partner_locations_partner_select_self" on public.partner_locations
for select to authenticated
using (public.current_role() = 'partner' and partner_id = public.current_partner_id());

-- statements
drop policy if exists "partner_statements_admin_all" on public.partner_statements;
create policy "partner_statements_admin_all" on public.partner_statements
for all to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "partner_statements_partner_select_self" on public.partner_statements;
create policy "partner_statements_partner_select_self" on public.partner_statements
for select to authenticated
using (public.current_role() = 'partner' and partner_id = public.current_partner_id());

-- payouts
drop policy if exists "partner_payouts_admin_all" on public.partner_payouts;
create policy "partner_payouts_admin_all" on public.partner_payouts
for all to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "partner_payouts_partner_select_self" on public.partner_payouts;
create policy "partner_payouts_partner_select_self" on public.partner_payouts
for select to authenticated
using (public.current_role() = 'partner' and partner_id = public.current_partner_id());

-- invoices
drop policy if exists "partner_invoices_admin_all" on public.partner_invoices;
create policy "partner_invoices_admin_all" on public.partner_invoices
for all to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "partner_invoices_partner_select_self" on public.partner_invoices;
create policy "partner_invoices_partner_select_self" on public.partner_invoices
for select to authenticated
using (public.current_role() = 'partner' and partner_id = public.current_partner_id());
