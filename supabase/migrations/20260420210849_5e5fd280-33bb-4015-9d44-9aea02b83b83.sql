-- Comentários colaborativos por insight
create table if not exists public.win_loss_insight_comments (
  id uuid primary key default gen_random_uuid(),
  insight_id uuid not null references public.win_loss_insights(id) on delete cascade,
  author_id uuid not null,
  body text not null,
  created_at timestamptz not null default now()
);

alter table public.win_loss_insight_comments enable row level security;

drop policy if exists "auth read comments" on public.win_loss_insight_comments;
create policy "auth read comments"
  on public.win_loss_insight_comments
  for select
  to authenticated
  using (true);

drop policy if exists "auth insert own comment" on public.win_loss_insight_comments;
create policy "auth insert own comment"
  on public.win_loss_insight_comments
  for insert
  to authenticated
  with check (author_id = auth.uid());

drop policy if exists "owner delete comment" on public.win_loss_insight_comments;
create policy "owner delete comment"
  on public.win_loss_insight_comments
  for delete
  to authenticated
  using (author_id = auth.uid());

create index if not exists idx_wl_insight_comments_insight on public.win_loss_insight_comments(insight_id, created_at desc);

-- Realtime
do $$
begin
  begin
    execute 'alter publication supabase_realtime add table public.win_loss_insight_comments';
  exception when duplicate_object then null;
  end;
end $$;

-- Atribuição em win_loss_insights
alter table public.win_loss_insights add column if not exists assigned_to uuid;
alter table public.win_loss_insights add column if not exists assigned_at timestamptz;

-- Linkagem de tarefa criada a partir de um insight
alter table public.tasks add column if not exists source_insight_id uuid references public.win_loss_insights(id) on delete set null;

-- Variante de script usada no deal (para A/B)
alter table public.sales add column if not exists script_variant text;

-- Trigger de notificação para padrões críticos
create or replace function public.notify_critical_winloss_pattern()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  fn_url text;
begin
  if NEW.confidence is not null and NEW.confidence > 0.85 then
    begin
      fn_url := current_setting('app.functions_url', true);
      if fn_url is not null and length(fn_url) > 0 then
        perform net.http_post(
          url := fn_url || '/notify-critical-pattern',
          headers := jsonb_build_object('content-type','application/json'),
          body := jsonb_build_object(
            'pattern_id', NEW.id,
            'name', NEW.name,
            'confidence', NEW.confidence
          )
        );
      end if;
    exception when others then
      -- Não bloqueia insert em caso de falha de rede / extensão indisponível
      null;
    end;
  end if;
  return NEW;
end;
$$;

drop trigger if exists trg_notify_critical_winloss on public.win_loss_patterns;
create trigger trg_notify_critical_winloss
  after insert on public.win_loss_patterns
  for each row execute function public.notify_critical_winloss_pattern();