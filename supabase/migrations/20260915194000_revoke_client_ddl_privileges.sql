-- CASPER GROUP shared-infrastructure security floor.
-- Preserve brand/entity data isolation while preventing browser/API roles from
-- receiving DDL-adjacent privileges they do not require for application use.

revoke truncate, references, trigger on all tables in schema public
  from anon, authenticated;

-- Keep future public tables on the same least-privilege baseline when they are
-- created by the postgres migration owner.
alter default privileges for role postgres in schema public
  revoke truncate, references, trigger on tables from anon, authenticated;
