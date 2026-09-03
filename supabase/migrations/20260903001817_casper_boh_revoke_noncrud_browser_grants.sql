-- CASPER GROUP BOH least-privilege hardening.
-- Scope is strictly public.cg_* relations in the dedicated Casper Group database.
-- Preserve existing CRUD/SELECT grants and row-level security behavior while
-- removing table-level capabilities browser roles do not need for normal flows.

DO $$
DECLARE
  target_relation record;
BEGIN
  FOR target_relation IN
    SELECT DISTINCT table_schema, table_name
    FROM information_schema.role_table_grants
    WHERE table_schema = 'public'
      AND table_name ~ '^cg_'
      AND grantee IN ('anon', 'authenticated')
      AND privilege_type IN ('TRUNCATE', 'REFERENCES', 'TRIGGER')
    ORDER BY table_name
  LOOP
    EXECUTE format(
      'REVOKE TRUNCATE, REFERENCES, TRIGGER ON TABLE %I.%I FROM anon, authenticated',
      target_relation.table_schema,
      target_relation.table_name
    );
  END LOOP;
END
$$;
