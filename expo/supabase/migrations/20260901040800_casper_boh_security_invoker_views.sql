-- CASPER GROUP BOH ONLY
-- Harden operational intelligence views so they execute with the querying
-- operator's privileges and underlying RLS policies instead of the view owner.

alter view public.cg_inventory_intelligence
  set (security_invoker = true);

alter view public.cg_menu_integrity
  set (security_invoker = true);

comment on view public.cg_inventory_intelligence is
  'CASPER BOH daily inventory priority layer. SECURITY INVOKER preserves caller-context RLS on cg_inventory.';

comment on view public.cg_menu_integrity is
  'CASPER BOH menu integrity layer. SECURITY INVOKER preserves caller-context RLS on cg_menu_items.';
