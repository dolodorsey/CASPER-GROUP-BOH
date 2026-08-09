-- The legacy casper_boh schema remains brand-specific and needs the same
-- statement-level auth evaluation as the public BOH operating tables.
alter policy insert_activity_own_actor on casper_boh.activity_logs
  with check (actor_id = (select auth.uid()));

-- Remove policies with identical commands, roles, and predicates.
drop policy if exists acknowledgements_insert_own on public.cg_sop_acknowledgements;
drop policy if exists users_insert_own_acks on public.cg_sop_acknowledgements;
drop policy if exists vendors_read on public.cg_vendors;

-- Remove non-unique indexes that duplicate the retained cg-prefixed indexes.
drop index if exists public.idx_assets_brand;
drop index if exists public.idx_assets_type;
drop index if exists public.idx_sops_brand;
