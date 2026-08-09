-- The active source roster names this brand "Tha Morning After". Pause the
-- legacy duplicate without deleting its historical operating references.
update public.cg_brands
set status = 'paused', updated_at = now()
where slug = 'morning-after';
