-- Helper role functions (safe for RLS)
create or replace function public.cg_role()
returns text
language sql
stable
as $$
  select p.role::text
  from public.profiles p
  where p.id = auth.uid()
$$;

create or replace function public.cg_is_admin()
returns boolean
language sql
stable
as $$
  select coalesce((select (p.role = 'admin') from public.profiles p where p.id = auth.uid()), false)
$$;

create or replace function public.cg_is_employee()
returns boolean
language sql
stable
as $$
  select coalesce((select (p.role = 'employee') from public.profiles p where p.id = auth.uid()), false)
$$;

create or replace function public.cg_is_partner()
returns boolean
language sql
stable
as $$
  select coalesce((select (p.role = 'partner') from public.profiles p where p.id = auth.uid()), false)
$$;
