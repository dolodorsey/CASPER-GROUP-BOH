-- RLS: Partners can only SELECT their own data. Admin can do all.
alter table public.partners enable row level security;
alter table public.partner_users enable row level security;
alter table public.partner_agreements enable row level security;
alter table public.partner_statements enable row level security;
alter table public.partner_payouts enable row level security;
alter table public.partner_invoices enable row level security;

-- partners
drop policy if exists partners_select on public.partners;
create policy partners_select on public.partners
for select
using (
  cg_is_admin()
  or exists(select 1 from public.partner_users pu where pu.user_id = auth.uid() and pu.partner_id = partners.id)
);

drop policy if exists partners_write_admin on public.partners;
create policy partners_write_admin on public.partners
for all
using (cg_is_admin())
with check (cg_is_admin());

-- partner_users
drop policy if exists partner_users_select on public.partner_users;
create policy partner_users_select on public.partner_users
for select
using (
  cg_is_admin()
  or (cg_is_partner() and user_id = auth.uid())
);

drop policy if exists partner_users_write_admin on public.partner_users;
create policy partner_users_write_admin on public.partner_users
for all
using (cg_is_admin())
with check (cg_is_admin());

-- agreements
drop policy if exists partner_agreements_select on public.partner_agreements;
create policy partner_agreements_select on public.partner_agreements
for select
using (
  cg_is_admin()
  or exists(select 1 from public.partner_users pu where pu.user_id = auth.uid() and pu.partner_id = partner_agreements.partner_id)
);

drop policy if exists partner_agreements_write_admin on public.partner_agreements;
create policy partner_agreements_write_admin on public.partner_agreements
for all
using (cg_is_admin())
with check (cg_is_admin());

-- statements
drop policy if exists partner_statements_select on public.partner_statements;
create policy partner_statements_select on public.partner_statements
for select
using (
  cg_is_admin()
  or exists(select 1 from public.partner_users pu where pu.user_id = auth.uid() and pu.partner_id = partner_statements.partner_id)
);

drop policy if exists partner_statements_write_admin on public.partner_statements;
create policy partner_statements_write_admin on public.partner_statements
for all
using (cg_is_admin())
with check (cg_is_admin());

-- payouts
drop policy if exists partner_payouts_select on public.partner_payouts;
create policy partner_payouts_select on public.partner_payouts
for select
using (
  cg_is_admin()
  or exists(select 1 from public.partner_users pu where pu.user_id = auth.uid() and pu.partner_id = partner_payouts.partner_id)
);

drop policy if exists partner_payouts_write_admin on public.partner_payouts;
create policy partner_payouts_write_admin on public.partner_payouts
for all
using (cg_is_admin())
with check (cg_is_admin());

-- invoices
drop policy if exists partner_invoices_select on public.partner_invoices;
create policy partner_invoices_select on public.partner_invoices
for select
using (
  cg_is_admin()
  or exists(select 1 from public.partner_users pu where pu.user_id = auth.uid() and pu.partner_id = partner_invoices.partner_id)
);

drop policy if exists partner_invoices_write_admin on public.partner_invoices;
create policy partner_invoices_write_admin on public.partner_invoices
for all
using (cg_is_admin())
with check (cg_is_admin());
