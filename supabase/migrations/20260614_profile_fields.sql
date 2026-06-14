-- Add birth_date and description to profiles
alter table public.profiles
  add column if not exists birth_date date,
  add column if not exists description text;
