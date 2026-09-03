-- CASPER GROUP BOH least-privilege hardening.
-- Scope is strictly public.cg_* tables in the dedicated Casper Group database.
-- Preserve existing CRUD grants and row-level security behavior while removing
-- table-level capabilities that browser roles do not need for normal app flows.

DO $$
DECLARE
  target_table record;
BEGIN
  FOR target_table IN
    SELECT schemaname, tablename
    FROM pg_tables
    WHERE schemaname = 'public'
      AND tablename ~ '^cg_'
    ORDER BY tablename
  LOOP
    EXECUTE format(
      'REVOKE TRUNCATE, REFERENCES, TRIGGER ON TABLE %I.%I FROM anon, authenticated',
      target_table.schemaname,
      target_table.tablename
    );
  END LOOP;
END
$$;
