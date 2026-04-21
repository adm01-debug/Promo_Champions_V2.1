

## Gatilho de alerta: falhas consecutivas + taxa de retry alta

### Objetivo
Detectar automaticamente assinaturas de webhook com saúde degradada e disparar um alerta (email + entrada no histórico) **antes** que o problema escale, sem precisar abrir o painel.

### Quando dispara (por subscription, janela de 30 min)
Um alerta é emitido se **qualquer** das condições for verdadeira:

1. **Falhas consecutivas**: as últimas **N=5** entregas (ordenadas por `created_at DESC`) têm `succeeded=false` — endpoint provavelmente fora do ar.
2. **Taxa de retry alta**: na janela, `(tentativas com attempt > 1) / (total de entregas) > 50%` **e** `total ≥ 10` — endpoint instável, recuperando após retries demais.

Limites configuráveis via env vars (`ALERT_CONSECUTIVE_FAILURES`, `ALERT_RETRY_RATE_THRESHOLD`, `ALERT_WINDOW_MINUTES`, `ALERT_MIN_DELIVERIES`) com defaults seguros.

### Anti-spam
Tabela nova `winloss_webhook_alerts` com `(subscription_id, kind, fired_at)`. Antes de emitir, checar se já houve alerta do mesmo `kind` para a mesma subscription nos últimos **60 min** — se sim, suprimir (apenas log).

### Edge function nova: `winloss-webhook-health-monitor`
- Roda em loop por todas as subscriptions ativas.
- Para cada uma, executa as duas regras acima.
- Quando dispara: insere em `winloss_webhook_alerts`, envia email via Resend (se `RESEND_API_KEY` + `ADMIN_NOTIFICATION_EMAIL` configurados — mesmo padrão de `notify-critical-pattern`), e loga estruturado.
- Resposta JSON: `{ checked, fired, suppressed, alerts: [...] }`.

### Agendamento
Cron a cada 5 min via `supabase/config.toml` no bloco da função (`schedule = "*/5 * * * *"`), seguindo o padrão de outras funções agendadas do projeto.

### UI: faixa de status no painel de webhooks
- Novo hook `useWebhookAlerts(subscriptionId?)` — lê `winloss_webhook_alerts` das últimas 24h.
- Em `WebhookSubscriptionsPanel`: badge "⚠ Degradado" ao lado da subscription quando há alerta ativo (<60 min). Tooltip mostra: tipo (`consecutive_failures` / `high_retry_rate`), quando disparou, e contadores.
- Em `WebhookHealthPanel` (KPIs já existentes): banner vermelho dismissível "N assinatura(s) com alerta ativo" quando há alertas <60 min.

### Schema (migração)
```sql
create table public.winloss_webhook_alerts (
  id uuid primary key default gen_random_uuid(),
  subscription_id uuid not null references winloss_webhook_subscriptions(id) on delete cascade,
  kind text not null check (kind in ('consecutive_failures','high_retry_rate')),
  details jsonb not null default '{}',
  fired_at timestamptz not null default now()
);
create index on winloss_webhook_alerts (subscription_id, fired_at desc);
create index on winloss_webhook_alerts (fired_at desc);
alter table public.winloss_webhook_alerts enable row level security;
create policy "admin read webhook alerts" on public.winloss_webhook_alerts
  for select to authenticated using (has_role(auth.uid(),'admin'::app_role));
-- inserts via service role apenas (sem policy de insert)
```

### Logs estruturados (mesmo padrão do dispatcher)
- `monitor_start`, `subscription_evaluated` (com `subscriptionId`, contadores), `alert_fired` (com `kind`, `details`), `alert_suppressed`, `email_skipped`, `email_failed`, `monitor_complete`.
- Inclui `requestId` (UUID v4) e `error_name`/`error`/`error_stack` em catches (consistente com o padrão recém-implantado).

### Arquivos
- **Migração**: tabela `winloss_webhook_alerts` + RLS.
- **Criar**: `supabase/functions/winloss-webhook-health-monitor/index.ts`.
- **Modificar**: `supabase/config.toml` (bloco schedule da nova função).
- **Criar**: `src/hooks/win-loss/useWebhookAlerts.ts`.
- **Modificar**: `src/components/win-loss/WebhookSubscriptionsPanel.tsx` (badge degradado + tooltip).
- **Modificar**: `src/components/win-loss/WebhookHealthPanel.tsx` (banner de alertas ativos).

### Verificação
1. Migração aplica e RLS confere admin-only.
2. `supabase--curl_edge_functions` em `winloss-webhook-health-monitor` retorna `{ checked, fired, suppressed }`.
3. Forçar 5 falhas consecutivas em uma subscription → próxima execução insere alerta e (se Resend configurado) envia email.
4. Re-executar imediatamente → alerta suprimido (`alert_suppressed` no log).
5. UI mostra badge "Degradado" na subscription.

