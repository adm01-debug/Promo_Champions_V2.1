

## Win/Loss Intelligence — Fase 5: Inteligência colaborativa e ações automatizadas (10 melhorias)

Módulo já em nível "referência de mercado". Esta fase fecha o ciclo: do **insight à ação**, com colaboração, automação e métricas de impacto real no negócio.

---

### #1 — Comentários colaborativos por insight
Cada insight aceita thread de comentários (tabela nova `win_loss_insight_comments`). Avatar do autor, timestamp relativo, markdown-lite. Realtime via Supabase channel.

### #2 — Atribuir insight a um responsável
Botão "Atribuir" no card do insight → seletor de salesperson. Grava `assigned_to`/`assigned_at` (colunas novas). Badge no avatar do responsável + filtro "Meus insights".

### #3 — Criar tarefa direto do insight
Botão "Criar tarefa" → modal com título pré-preenchido (do insight), prazo sugerido (7d), prioridade (deriva da severidade). Insere em `tasks` e linka via `source_insight_id`.

### #4 — Win/Loss Score por vendedor (gamificação)
Hook `useWinLossSalespersonScore.ts`: combina win rate + ciclo + ticket + adoção de insights aplicados → score 0-100. Badge no `SalespersonWinLossTable` (Bronze/Prata/Ouro/Diamante).

### #5 — Painel "Impacto dos Insights aplicados"
Novo `InsightsImpactPanel.tsx`: mostra deals fechados após aplicar insight X vs. antes. Calcula uplift de win rate por insight aplicado (group by `applied_at` window).

### #6 — Sugestão de próximo deal a trabalhar (IA)
Card no topo "Próximo melhor movimento": chama edge `next-best-action` com contexto win/loss → retorna 1 deal específico + razão + script sugerido. Botão "Abrir deal".

### #7 — Notificação por e-mail/Slack de novo padrão crítico
Trigger DB: ao inserir `win_loss_patterns` com `confidence > 0.85`, chama edge `notify-critical-pattern` que envia via Resend (e-mail) ao admin. Toggle on/off em settings.

### #8 — Heatmap de horário ótimo de fechamento
Novo `WinByHourHeatmap.tsx`: matriz dia-da-semana × hora, célula = win rate. Identifica janelas quentes para priorizar follow-ups. Click → drawer.

### #9 — A/B comparison de scripts/abordagens
`ScriptABPanel.tsx`: agrupa deals por tag de script usado (campo `script_variant` em `sales`), mostra win rate de cada variante com significância estatística (chi-square). Identifica vencedor.

### #10 — Histórico completo do deal no drawer (timeline)
No `WinLossDealsDrawer`, expandir cada deal para mostrar timeline cronológica: criação, mudanças de estágio, atividades, conversas, decisão final. Reusa componente `ClientTimeline`.

---

### Detalhes técnicos

**Arquivos novos**
```
src/hooks/win-loss/useInsightComments.ts
src/hooks/win-loss/useInsightAssignment.ts
src/hooks/win-loss/useInsightTaskCreation.ts
src/hooks/win-loss/useWinLossSalespersonScore.ts
src/hooks/win-loss/useInsightsImpact.ts
src/hooks/win-loss/useNextBestWinLossDeal.ts
src/hooks/win-loss/useWinByHourMatrix.ts
src/hooks/win-loss/useScriptABTest.ts
src/components/win-loss/InsightCommentsThread.tsx
src/components/win-loss/InsightAssignPopover.tsx
src/components/win-loss/InsightCreateTaskModal.tsx
src/components/win-loss/SalespersonScoreBadge.tsx
src/components/win-loss/InsightsImpactPanel.tsx
src/components/win-loss/NextBestWinLossCard.tsx
src/components/win-loss/WinByHourHeatmap.tsx
src/components/win-loss/ScriptABPanel.tsx
src/components/win-loss/DealTimelineExpand.tsx
supabase/functions/notify-critical-pattern/index.ts
```

**Migration única**
```sql
-- comentários
create table public.win_loss_insight_comments (
  id uuid primary key default gen_random_uuid(),
  insight_id uuid not null references public.win_loss_insights(id) on delete cascade,
  author_id uuid not null,
  body text not null,
  created_at timestamptz not null default now()
);
alter table public.win_loss_insight_comments enable row level security;
create policy "auth read" on public.win_loss_insight_comments for select to authenticated using (true);
create policy "auth insert own" on public.win_loss_insight_comments for insert to authenticated with check (author_id = auth.uid());
create policy "owner delete" on public.win_loss_insight_comments for delete to authenticated using (author_id = auth.uid());
alter publication supabase_realtime add table public.win_loss_insight_comments;

-- atribuição
alter table public.win_loss_insights add column if not exists assigned_to uuid;
alter table public.win_loss_insights add column if not exists assigned_at timestamptz;

-- linkagem tarefa
alter table public.tasks add column if not exists source_insight_id uuid references public.win_loss_insights(id) on delete set null;

-- script variant
alter table public.sales add column if not exists script_variant text;

-- trigger de notificação crítica
create or replace function public.notify_critical_winloss_pattern()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if NEW.confidence > 0.85 then
    perform net.http_post(
      url := current_setting('app.functions_url', true) || '/notify-critical-pattern',
      headers := jsonb_build_object('content-type','application/json'),
      body := jsonb_build_object('pattern_id', NEW.id, 'name', NEW.name, 'confidence', NEW.confidence)
    );
  end if;
  return NEW;
end; $$;
create trigger trg_notify_critical_winloss
after insert on public.win_loss_patterns
for each row execute function public.notify_critical_winloss_pattern();
```

**Arquivos modificados**
- `ActionableInsightsPanel.tsx` — integra comentários, atribuição, criar tarefa.
- `SalespersonWinLossTable.tsx` — coluna Score com badge.
- `WinLossDealsDrawer.tsx` — expansão de timeline por deal.
- `WinLossIntelligence.tsx` — orquestra `NextBestWinLossCard`, `InsightsImpactPanel`, `WinByHourHeatmap`, `ScriptABPanel`.

**Edge function nova**
`notify-critical-pattern` — usa secret `RESEND_API_KEY` (já existe no projeto se notificações estiverem ativas; senão pedir via add_secret).

**Padrões mantidos**
Tokens semânticos · Sora/Inter · ≤400 linhas/arquivo · TS strict · Framer Motion + `useReducedMotion` · zero warnings · RLS preservada · react-helmet-async · realtime via channel dedicado.

### Ordem de execução (sequencial, sem perguntas)
1. Migration (comentários + colunas + trigger)
2. #1 Comentários
3. #2 Atribuição
4. #3 Criar tarefa
5. #4 Score do vendedor
6. #5 Impact panel
7. #6 Next best deal
8. #7 Edge notify-critical-pattern + secret
9. #8 Win by hour heatmap
10. #9 Script A/B
11. #10 Timeline expand no drawer
12. Build check + relatório 10/10

