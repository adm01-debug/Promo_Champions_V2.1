

## Win/Loss Intelligence — Fase 7: Inteligência preditiva avançada e personalização (10 melhorias)

Módulo já em 10/10 técnico (performance, a11y AAA, mobile, E2E, colaboração). Esta fase adiciona **personalização por usuário, IA preditiva profunda e integração com o ecossistema CRM**.

---

### #1 — Dashboard personalizado por usuário
Cada usuário escolhe quais widgets vê e em qual ordem (drag-and-drop). Persistência em `user_winloss_preferences` (jsonb `layout`). Botão "Personalizar" abre modo de edição com `dnd-kit`.

### #2 — Forecast IA com cenários (otimista/realista/pessimista)
Hook `useWinLossScenarios.ts` projeta 3 curvas baseadas em desvio padrão histórico. Chart com bandas sombreadas (Recharts `Area` com gradiente). Toggle entre cenários.

### #3 — Detecção automática de "deal em risco" cruzando padrões
Edge `detect-at-risk-deals` cruza deals abertos com padrões de loss (`win_loss_patterns`). Score 0-100 por similaridade. Painel `AtRiskDealsFromPatterns.tsx` lista os 10 mais críticos com razão e ação sugerida.

### #4 — Correlação ICP × Win Rate
Novo `ICPCorrelationMatrix.tsx`: matriz de atributos do ICP (segmento, tamanho, ramo) × win rate. Identifica perfil ideal real vs. perfil declarado. Heatmap interativo.

### #5 — Análise de sentimento agregada por trimestre
Hook `useSentimentTrend.ts` agrega `sentiment_score` das `call_recordings` por trimestre, cruzado com win rate. Chart dual-axis mostra correlação direta entre tom da conversa e fechamento.

### #6 — Recomendação de upsell baseada em wins similares
Quando deal é marcado como Won, sistema busca deals Won similares (mesmo segmento/produto) e sugere produtos comprados em sequência. Card `UpsellSuggestionCard.tsx` no drawer do deal.

### #7 — Coaching automático ao marcar Lost
Trigger DB: ao inserir win_loss_analysis com outcome=lost, chama edge `generate-loss-coaching` que gera 3 lições personalizadas via Lovable AI (gemini-2.5-flash). Salva em `coaching_sessions` linkada ao vendedor.

### #8 — Comparativo entre temporadas/safras de vendedores
`SeasonComparisonPanel.tsx`: compara performance Q-atual vs. Q-anterior do mesmo vendedor. Identifica regressão e progressão. Útil para 1:1s e feedback formal.

### #9 — Export executivo em PDF (não só impressão)
Edge `export-winloss-pdf` usa `pdf-lib` para gerar PDF profissional com gráficos renderizados server-side (via `chart-svg`). Inclui logo, branding, capa, sumário executivo, gráficos e tabelas. Download direto.

### #10 — Webhook de eventos críticos para integração externa
Tabela `winloss_webhook_subscriptions` (URL + events). Edge `winloss-webhook-dispatcher` envia POST quando: novo padrão crítico detectado, anomalia de win rate, vendedor cai 30% vs. mês anterior. Retries com backoff.

---

### Detalhes técnicos

**Migrations**
```sql
create table public.user_winloss_preferences (
  user_id uuid primary key,
  layout jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);
alter table public.user_winloss_preferences enable row level security;
create policy "own prefs read" on public.user_winloss_preferences for select to authenticated using (user_id = auth.uid());
create policy "own prefs upsert" on public.user_winloss_preferences for insert to authenticated with check (user_id = auth.uid());
create policy "own prefs update" on public.user_winloss_preferences for update to authenticated using (user_id = auth.uid());

create table public.winloss_webhook_subscriptions (
  id uuid primary key default gen_random_uuid(),
  url text not null,
  events text[] not null default array['critical_pattern','anomaly','perf_drop'],
  active boolean not null default true,
  created_by uuid not null,
  created_at timestamptz not null default now()
);
alter table public.winloss_webhook_subscriptions enable row level security;
create policy "admin manage" on public.winloss_webhook_subscriptions for all to authenticated
  using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

-- Trigger coaching automático
create or replace function public.generate_loss_coaching_trigger()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if NEW.outcome = 'lost' then
    perform net.http_post(
      url := current_setting('app.functions_url', true) || '/generate-loss-coaching',
      headers := jsonb_build_object('content-type','application/json'),
      body := jsonb_build_object('analysis_id', NEW.id, 'salesperson_id', NEW.salesperson_id)
    );
  end if;
  return NEW;
end; $$;
create trigger trg_loss_coaching after insert on public.win_loss_analyses
for each row execute function public.generate_loss_coaching_trigger();
```

**Hooks novos**
```
src/hooks/win-loss/useUserDashboardLayout.ts
src/hooks/win-loss/useWinLossScenarios.ts
src/hooks/win-loss/useAtRiskFromPatterns.ts
src/hooks/win-loss/useICPCorrelation.ts
src/hooks/win-loss/useSentimentTrend.ts
src/hooks/win-loss/useUpsellSuggestions.ts
src/hooks/win-loss/useSeasonComparison.ts
src/hooks/win-loss/useWebhookSubscriptions.ts
```

**Componentes novos**
```
src/components/win-loss/DashboardLayoutEditor.tsx
src/components/win-loss/ScenarioForecastChart.tsx
src/components/win-loss/AtRiskDealsFromPatterns.tsx
src/components/win-loss/ICPCorrelationMatrix.tsx
src/components/win-loss/SentimentTrendChart.tsx
src/components/win-loss/UpsellSuggestionCard.tsx
src/components/win-loss/SeasonComparisonPanel.tsx
src/components/win-loss/WebhookSubscriptionsPanel.tsx
src/components/win-loss/ExportPdfButton.tsx
```

**Edge functions novas**
```
supabase/functions/detect-at-risk-deals/index.ts
supabase/functions/generate-loss-coaching/index.ts
supabase/functions/export-winloss-pdf/index.ts
supabase/functions/winloss-webhook-dispatcher/index.ts
```

**Arquivos modificados**
- `WinLossIntelligence.tsx` — orquestra novos painéis (Scenario, AtRisk, ICP, Sentiment, Season, Webhooks).
- `WinLossDealsDrawer.tsx` — integra `UpsellSuggestionCard` em deals Won.
- `WinLossPageHeader.tsx` — botão "Personalizar" + "Export PDF".

**Dependências novas**
- `@dnd-kit/core` + `@dnd-kit/sortable` (~12kb) — drag-and-drop do dashboard.
- `pdf-lib` (server-side, edge function) — geração de PDF.

**Padrões mantidos**: tokens semânticos · Sora/Inter · ≤400 linhas · TS strict · Framer Motion + `useReducedMotion` · zero warnings · RLS preservada · Lovable AI (gemini-2.5-flash) sem chave externa.

### Ordem de execução (sequencial, sem pausas)
1. Migrations (preferences + webhooks + trigger coaching)
2. #1 Dashboard personalizado (dnd-kit)
3. #2 Forecast cenários
4. #3 At-risk deals (edge + painel)
5. #4 ICP correlation matrix
6. #5 Sentiment trend
7. #6 Upsell suggestions
8. #7 Coaching automático (edge + trigger)
9. #8 Season comparison
10. #9 Export PDF (edge + button)
11. #10 Webhooks (edge + admin panel)
12. Build check (`tsc --noEmit`) + atualização de memória + relatório 10/10

