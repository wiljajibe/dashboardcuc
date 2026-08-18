-- Base de datos segura para usuarios, permisos y múltiples dashboards.
-- Ejecutar una sola vez en el SQL Editor de un proyecto Supabase nuevo.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  role text not null default 'viewer' check (role in ('viewer', 'admin')),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.dashboards (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.dashboard_permissions (
  user_id uuid not null references public.profiles(id) on delete cascade,
  dashboard_id uuid not null references public.dashboards(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, dashboard_id)
);

create table if not exists public.dashboard_datasets (
  id uuid primary key default gen_random_uuid(),
  dashboard_id uuid not null references public.dashboards(id) on delete cascade,
  payload jsonb not null,
  source_date date,
  active boolean not null default true,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

create index if not exists dashboard_datasets_lookup_idx
  on public.dashboard_datasets (dashboard_id, active, created_at desc);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
      and active = true
  );
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.dashboards enable row level security;
alter table public.dashboard_permissions enable row level security;
alter table public.dashboard_datasets enable row level security;

drop policy if exists profiles_read_own_or_admin on public.profiles;
create policy profiles_read_own_or_admin
  on public.profiles for select to authenticated
  using (id = auth.uid() or public.is_admin());

drop policy if exists profiles_admin_write on public.profiles;
create policy profiles_admin_write
  on public.profiles for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists dashboards_read_permitted on public.dashboards;
create policy dashboards_read_permitted
  on public.dashboards for select to authenticated
  using (
    active = true
    and (
      public.is_admin()
      or exists (
        select 1
        from public.dashboard_permissions permission
        where permission.dashboard_id = dashboards.id
          and permission.user_id = auth.uid()
      )
    )
  );

drop policy if exists dashboards_admin_write on public.dashboards;
create policy dashboards_admin_write
  on public.dashboards for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists permissions_read_own_or_admin on public.dashboard_permissions;
create policy permissions_read_own_or_admin
  on public.dashboard_permissions for select to authenticated
  using (user_id = auth.uid() or public.is_admin());

drop policy if exists permissions_admin_write on public.dashboard_permissions;
create policy permissions_admin_write
  on public.dashboard_permissions for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists datasets_read_permitted on public.dashboard_datasets;
create policy datasets_read_permitted
  on public.dashboard_datasets for select to authenticated
  using (
    active = true
    and (
      public.is_admin()
      or exists (
        select 1
        from public.dashboard_permissions permission
        where permission.dashboard_id = dashboard_datasets.dashboard_id
          and permission.user_id = auth.uid()
      )
    )
  );

drop policy if exists datasets_admin_write on public.dashboard_datasets;
create policy datasets_admin_write
  on public.dashboard_datasets for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

revoke all on public.profiles from anon;
revoke all on public.dashboards from anon;
revoke all on public.dashboard_permissions from anon;
revoke all on public.dashboard_datasets from anon;

grant select, insert, update, delete on public.profiles to authenticated;
grant select, insert, update, delete on public.dashboards to authenticated;
grant select, insert, update, delete on public.dashboard_permissions to authenticated;
grant select, insert, update, delete on public.dashboard_datasets to authenticated;
grant execute on function public.is_admin() to authenticated;

insert into public.dashboards (slug, title, description)
values ('matriculas', 'Matrículas', 'Matrículas y admisiones de la CUC')
on conflict (slug) do update
set title = excluded.title,
    description = excluded.description;

