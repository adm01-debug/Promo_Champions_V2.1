create table public.winloss_webhook_alerts (
  id uuid primary key default gen_random_uuid(),
  subscription_id uuid not null references public.winloss_webhook_subscriptions(id) on delete cascade,
  kind text not null check (kind in ('consecutive_failures','high_retry_rate')),
  details jsonb not null default '{}'::jsonb,
  fired_at timestamptz not null default now()
);

create index idx_winloss_webhook_alerts_sub on public.winloss_webhook_alerts (subscription_id, fired_at desc);
create index idx_winloss_webhook_alerts_fired_at on public.winloss_webhook_alerts (fired_at desc);

alter table public.winloss_webhook_alerts enable row level security;

create policy "admin read webhook alerts"
  on public.winloss_webhook_alerts
  for select
  to authenticated
  using (has_role(auth.uid(), 'admin'::app_role));