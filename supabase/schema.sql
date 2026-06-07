-- Smart Family Hub - Database Schema
-- Apply via Supabase Dashboard -> SQL Editor -> New query -> paste -> Run

-- ============ EXTENSIONS ============
create extension if not exists "pgcrypto";

-- ============ ENUMS ============
do $$ begin
  create type family_role as enum ('admin', 'member');
exception when duplicate_object then null; end $$;

do $$ begin
  create type task_status as enum ('belum_dimulai', 'sedang_dikerjakan', 'selesai');
exception when duplicate_object then null; end $$;

-- ============ TABLES ============

-- Profile mirrors auth.users (FR-01)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text not null,
  avatar_url text,
  created_at timestamptz not null default now()
);

-- Families (FR-03/05)
create table if not exists public.families (
  id uuid primary key default gen_random_uuid(),
  family_name text not null,
  description text,
  photo_url text,
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now()
);

-- Membership (one user = one family per SRS 2.3)
create table if not exists public.family_members (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role family_role not null default 'member',
  joined_at timestamptz not null default now(),
  unique (user_id)
);
create index if not exists family_members_family_idx on public.family_members(family_id);

-- Invitations (FR-04)
create table if not exists public.family_invitations (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  email text not null,
  invited_by uuid not null references auth.users(id) on delete cascade,
  token text not null unique default encode(gen_random_bytes(24), 'hex'),
  status text not null default 'pending' check (status in ('pending','accepted','revoked')),
  created_at timestamptz not null default now()
);
create index if not exists invitations_family_idx on public.family_invitations(family_id);
create index if not exists invitations_email_idx on public.family_invitations(lower(email));

-- Events (FR-06/07)
create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  title text not null,
  event_date date not null,
  event_time time,
  location text,
  description text,
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
create index if not exists events_family_date_idx on public.events(family_id, event_date);

-- Tasks (FR-08/09)
create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  task_name text not null,
  description text,
  assigned_to uuid references auth.users(id) on delete set null,
  status task_status not null default 'belum_dimulai',
  deadline date,
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists tasks_family_idx on public.tasks(family_id);
create index if not exists tasks_assignee_idx on public.tasks(assigned_to);

-- Notes (FR-10)
create table if not exists public.notes (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  title text not null,
  content text not null,
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists notes_family_idx on public.notes(family_id);

-- Activity log (FR-13)
create table if not exists public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  actor_id uuid references auth.users(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  metadata jsonb,
  created_at timestamptz not null default now()
);
create index if not exists activity_family_idx on public.activity_logs(family_id, created_at desc);

-- ============ TRIGGERS ============

-- Auto-create profile when auth.users row appears
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.email
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- updated_at trigger
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

drop trigger if exists tasks_set_updated_at on public.tasks;
create trigger tasks_set_updated_at before update on public.tasks
for each row execute function public.set_updated_at();

drop trigger if exists notes_set_updated_at on public.notes;
create trigger notes_set_updated_at before update on public.notes
for each row execute function public.set_updated_at();

-- ============ HELPERS ============
-- Note: defined as SECURITY DEFINER to avoid RLS recursion when policies query the same table.
create or replace function public.current_user_family_id()
returns uuid
language sql
stable
security definer set search_path = public
as $$
  select family_id from public.family_members where user_id = auth.uid() limit 1;
$$;

create or replace function public.is_family_admin(fid uuid)
returns boolean
language sql
stable
security definer set search_path = public
as $$
  select exists (
    select 1 from public.family_members
    where user_id = auth.uid() and family_id = fid and role = 'admin'
  );
$$;

-- ============ RLS ============
alter table public.profiles enable row level security;
alter table public.families enable row level security;
alter table public.family_members enable row level security;
alter table public.family_invitations enable row level security;
alter table public.events enable row level security;
alter table public.tasks enable row level security;
alter table public.notes enable row level security;
alter table public.activity_logs enable row level security;

-- profiles: self read, member-of-same-family read, self update
drop policy if exists profiles_self_select on public.profiles;
create policy profiles_self_select on public.profiles for select
using (
  id = auth.uid()
  or id in (
    select user_id from public.family_members
    where family_id = public.current_user_family_id()
  )
);

drop policy if exists profiles_self_update on public.profiles;
create policy profiles_self_update on public.profiles for update
using (id = auth.uid()) with check (id = auth.uid());

-- families
drop policy if exists families_member_select on public.families;
create policy families_member_select on public.families for select
using (id = public.current_user_family_id());

drop policy if exists families_creator_insert on public.families;
create policy families_creator_insert on public.families for insert
with check (created_by = auth.uid());

drop policy if exists families_admin_update on public.families;
create policy families_admin_update on public.families for update
using (public.is_family_admin(id)) with check (public.is_family_admin(id));

drop policy if exists families_admin_delete on public.families;
create policy families_admin_delete on public.families for delete
using (public.is_family_admin(id));

-- family_members
drop policy if exists members_same_family_select on public.family_members;
create policy members_same_family_select on public.family_members for select
using (family_id = public.current_user_family_id() or user_id = auth.uid());

drop policy if exists members_self_insert on public.family_members;
create policy members_self_insert on public.family_members for insert
with check (user_id = auth.uid());

drop policy if exists members_admin_delete on public.family_members;
create policy members_admin_delete on public.family_members for delete
using (public.is_family_admin(family_id) or user_id = auth.uid());

-- invitations
drop policy if exists invites_family_select on public.family_invitations;
create policy invites_family_select on public.family_invitations for select
using (family_id = public.current_user_family_id());

drop policy if exists invites_admin_insert on public.family_invitations;
create policy invites_admin_insert on public.family_invitations for insert
with check (public.is_family_admin(family_id) and invited_by = auth.uid());

drop policy if exists invites_admin_update on public.family_invitations;
create policy invites_admin_update on public.family_invitations for update
using (public.is_family_admin(family_id)) with check (public.is_family_admin(family_id));

-- events
drop policy if exists events_family_select on public.events;
create policy events_family_select on public.events for select
using (family_id = public.current_user_family_id());

drop policy if exists events_member_insert on public.events;
create policy events_member_insert on public.events for insert
with check (family_id = public.current_user_family_id() and created_by = auth.uid());

drop policy if exists events_creator_or_admin_update on public.events;
create policy events_creator_or_admin_update on public.events for update
using (created_by = auth.uid() or public.is_family_admin(family_id))
with check (family_id = public.current_user_family_id());

drop policy if exists events_creator_or_admin_delete on public.events;
create policy events_creator_or_admin_delete on public.events for delete
using (created_by = auth.uid() or public.is_family_admin(family_id));

-- tasks
drop policy if exists tasks_family_select on public.tasks;
create policy tasks_family_select on public.tasks for select
using (family_id = public.current_user_family_id());

drop policy if exists tasks_admin_insert on public.tasks;
create policy tasks_admin_insert on public.tasks for insert
with check (public.is_family_admin(family_id) and created_by = auth.uid());

drop policy if exists tasks_member_update on public.tasks;
create policy tasks_member_update on public.tasks for update
using (
  family_id = public.current_user_family_id()
  and (assigned_to = auth.uid() or public.is_family_admin(family_id))
) with check (family_id = public.current_user_family_id());

drop policy if exists tasks_admin_delete on public.tasks;
create policy tasks_admin_delete on public.tasks for delete
using (public.is_family_admin(family_id));

-- notes
drop policy if exists notes_family_select on public.notes;
create policy notes_family_select on public.notes for select
using (family_id = public.current_user_family_id());

drop policy if exists notes_member_insert on public.notes;
create policy notes_member_insert on public.notes for insert
with check (family_id = public.current_user_family_id() and created_by = auth.uid());

drop policy if exists notes_creator_or_admin_update on public.notes;
create policy notes_creator_or_admin_update on public.notes for update
using (created_by = auth.uid() or public.is_family_admin(family_id))
with check (family_id = public.current_user_family_id());

drop policy if exists notes_creator_or_admin_delete on public.notes;
create policy notes_creator_or_admin_delete on public.notes for delete
using (created_by = auth.uid() or public.is_family_admin(family_id));

-- activity logs (read-only via UI; inserts go through server actions with service key OR member context)
drop policy if exists logs_family_select on public.activity_logs;
create policy logs_family_select on public.activity_logs for select
using (family_id = public.current_user_family_id());

drop policy if exists logs_member_insert on public.activity_logs;
create policy logs_member_insert on public.activity_logs for insert
with check (family_id = public.current_user_family_id() and (actor_id = auth.uid() or actor_id is null));
