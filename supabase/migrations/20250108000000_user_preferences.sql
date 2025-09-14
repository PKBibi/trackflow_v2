-- User preferences table for storing per-user branding and related settings
-- Safe to run multiple times due to IF NOT EXISTS guards

create table if not exists public.user_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  branding_company text,
  branding_logo_url text,
  branding_contact_email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Ensure RLS is enabled
alter table public.user_preferences enable row level security;

-- Upsert helper function to maintain updated_at
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_user_prefs_updated_at on public.user_preferences;
create trigger set_user_prefs_updated_at
before update on public.user_preferences
for each row execute function public.set_updated_at();

-- Policies: users can manage only their own preferences
drop policy if exists "user can read own prefs" on public.user_preferences;
create policy "user can read own prefs"
  on public.user_preferences for select
  using (auth.uid() = user_id);

drop policy if exists "user can upsert own prefs" on public.user_preferences;
create policy "user can upsert own prefs"
  on public.user_preferences for insert
  with check (auth.uid() = user_id);

drop policy if exists "user can update own prefs" on public.user_preferences;
create policy "user can update own prefs"
  on public.user_preferences for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Helpful index
create index if not exists idx_user_preferences_user_id on public.user_preferences(user_id);

