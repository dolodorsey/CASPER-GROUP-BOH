-- CASPER GROUP BOH least-privilege hardening for public cg_* views.
-- Complements the cg_* table privilege migration and leaves SELECT behavior intact.

DO $$
DECLARE
  target_view record;
BEGIN
  FOR target_view IN
    SELECT n.nspname AS schemaname, c.relname AS viewname
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
      AND c.relkind IN ('v', 'm')
      AND c.relname ~ '^cg_'
    ORDER BY c.relname
  LOOP
    EXECUTE format(
      'REVOKE TRUNCATE, REFERENCES, TRIGGER ON TABLE %I.%I FROM anon, authenticated',
      target_view.schemaname,
      target_view.viewname
    );
  END LOOP;
END
$$;
