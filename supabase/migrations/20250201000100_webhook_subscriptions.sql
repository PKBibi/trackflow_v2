-- Create table for webhook subscriptions managed per user
create table if not exists public.webhook_subscriptions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users (id) on delete cascade,
  url text not null,
  events text[] not null,
  secret_ciphertext text not null,
  secret_preview text not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_failure_at timestamptz,
  failure_count integer not null default 0
);

-- Maintain updated_at automatically
create trigger set_webhook_subscriptions_updated_at
  before update on public.webhook_subscriptions
  for each row
  execute function public.set_updated_at();

-- Indexes to support lookups
create index if not exists idx_webhook_subscriptions_user_id on public.webhook_subscriptions (user_id);
create index if not exists idx_webhook_subscriptions_active on public.webhook_subscriptions (active);

alter table public.webhook_subscriptions enable row level security;

-- Users can view their own subscriptions
create policy "Users can view own webhook subscriptions" on public.webhook_subscriptions
  for select using (auth.uid() = user_id);

-- Users can manage their own subscriptions
create policy "Users can manage own webhook subscriptions" on public.webhook_subscriptions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
