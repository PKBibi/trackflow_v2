-- Track webhook delivery attempts for monitoring and debugging
create table if not exists public.webhook_delivery_logs (
  id uuid primary key default uuid_generate_v4(),
  subscription_id uuid not null references public.webhook_subscriptions(id) on delete cascade,
  status text not null check (status in ('success', 'failure')),
  response_status integer,
  response_body text,
  error_message text,
  duration_ms integer,
  attempted_at timestamptz not null default now()
);

create index if not exists idx_webhook_delivery_logs_subscription on public.webhook_delivery_logs(subscription_id);
create index if not exists idx_webhook_delivery_logs_attempted_at on public.webhook_delivery_logs(attempted_at desc);

alter table public.webhook_delivery_logs enable row level security;

create policy "Users can view own webhook logs" on public.webhook_delivery_logs
  for select using (
    exists (
      select 1 from public.webhook_subscriptions
      where webhook_subscriptions.id = subscription_id
        and webhook_subscriptions.user_id = auth.uid()
    )
  );

create policy "System can insert webhook logs" on public.webhook_delivery_logs
  for insert with check (true);
