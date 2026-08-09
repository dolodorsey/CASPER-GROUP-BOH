-- Evaluate Supabase auth helpers once per statement instead of once per row.
-- Existing policy commands, roles, USING expressions, and WITH CHECK expressions
-- are preserved.
do $migration$
declare
  policy_row record;
  using_expression text;
  check_expression text;
begin
  for policy_row in
    select p.oid,
           p.polname,
           n.nspname as schema_name,
           c.relname as table_name,
           pg_get_expr(p.polqual, p.polrelid) as using_expression,
           pg_get_expr(p.polwithcheck, p.polrelid) as check_expression
    from pg_policy p
    join pg_class c on c.oid = p.polrelid
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public'
      and (
        (
          coalesce(pg_get_expr(p.polqual, p.polrelid), '') ~ 'auth\.(uid|jwt)\(\)'
          and coalesce(pg_get_expr(p.polqual, p.polrelid), '') !~ 'SELECT auth\.(uid|jwt)\(\)'
        )
        or (
          coalesce(pg_get_expr(p.polwithcheck, p.polrelid), '') ~ 'auth\.(uid|jwt)\(\)'
          and coalesce(pg_get_expr(p.polwithcheck, p.polrelid), '') !~ 'SELECT auth\.(uid|jwt)\(\)'
        )
      )
  loop
    using_expression := policy_row.using_expression;
    check_expression := policy_row.check_expression;

    if using_expression is not null then
      using_expression := replace(using_expression, 'auth.uid()', '(select auth.uid())');
      using_expression := replace(using_expression, 'auth.jwt()', '(select auth.jwt())');
    end if;

    if check_expression is not null then
      check_expression := replace(check_expression, 'auth.uid()', '(select auth.uid())');
      check_expression := replace(check_expression, 'auth.jwt()', '(select auth.jwt())');
    end if;

    execute format(
      'alter policy %I on %I.%I%s%s',
      policy_row.polname,
      policy_row.schema_name,
      policy_row.table_name,
      case when using_expression is not null
        then format(' using (%s)', using_expression)
        else ''
      end,
      case when check_expression is not null
        then format(' with check (%s)', check_expression)
        else ''
      end
    );
  end loop;
end
$migration$;

-- PostgreSQL does not automatically index the referencing side of foreign keys.
-- Create a deterministic covering index for every currently unindexed public FK.
do $migration$
declare
  foreign_key record;
begin
  for foreign_key in
    with foreign_keys as (
      select c.conrelid,
             c.conkey,
             n.nspname as schema_name,
             t.relname as table_name,
             array_agg(a.attname order by key_column.ordinality) as columns,
             string_agg(format('%I', a.attname), ', ' order by key_column.ordinality) as column_list
      from pg_constraint c
      join pg_class t on t.oid = c.conrelid
      join pg_namespace n on n.oid = t.relnamespace
      join unnest(c.conkey) with ordinality as key_column(attnum, ordinality) on true
      join pg_attribute a on a.attrelid = c.conrelid and a.attnum = key_column.attnum
      where c.contype = 'f'
        and n.nspname = 'public'
      group by c.conrelid, c.conkey, n.nspname, t.relname
    )
    select *
    from foreign_keys fk
    where not exists (
      select 1
      from pg_index i
      where i.indrelid = fk.conrelid
        and i.indisvalid
        and (i.indkey::smallint[])[0:cardinality(fk.conkey) - 1] = fk.conkey
    )
  loop
    execute format(
      'create index if not exists %I on %I.%I (%s)',
      left(foreign_key.table_name || '_' || array_to_string(foreign_key.columns, '_') || '_idx', 63),
      foreign_key.schema_name,
      foreign_key.table_name,
      foreign_key.column_list
    );
  end loop;
end
$migration$;
