
**Continuar execução autônoma das melhorias #5 a #10** do módulo Cadência de Orçamentos. Status: #1–#4 concluídas. Restam 6.

### #5 — Gráfico de conversão pós-cadência
- `useQuoteCadenceConversion(days)` — agrega `prospect_cadences` (com `quote_id`) join `quotes` por dia: enviados vs aprovados.
- `QuoteCadenceConversionChart.tsx` (Recharts AreaChart, gradients via tokens semânticos).
- Toggle 30/60/90 dias (ToggleGroup). Tipagem via `src/types/recharts.ts`.
- Inserido em `QuoteCadencesPage` logo após `QuoteCadenceMetrics`.

### #6 — XP/Gamificação
- Migration: trigger `award_xp_on_quote_cadence_task_complete` em `cadence_tasks` (AFTER UPDATE) — quando `status` vira `completed` e enrollment.quote_id IS NOT NULL → `increment_user_xp(assigned_to, 15, 'quote_cadence_task')`.
- Trigger `award_xp_on_quote_approved` em `quotes` (AFTER UPDATE) — `status='approved'` + cadência ativa para o quote → +50 XP para `seller_id`.
- Toast otimista "+15 XP" no `QuoteCadenceDetailDrawer` ao completar tarefa.

### #7 — Notificação de tarefa do dia
- Hook `useTodaysQuoteCadenceTasks` — filtra `cadence_tasks` por `assigned_to = auth.uid()`, `scheduled_date = today`, `status='pending'`, com join enrollment.quote_id IS NOT NULL.
- Badge no `NotificationsBell` (topbar) com contagem.
- Click → `/cadencias-orcamentos?filter=today`. `QuoteCadencesPage` lê `useSearchParams` e aplica filtro inicial (mostra só cards com tarefa hoje).

### #8 — SEO + a11y
- Helmet enriquecido em `QuoteCadencesPage`: canonical absoluto, OG title/description/image, twitter card.
- ARIA: `role="status"` + `aria-live="polite"` em `QuoteCadenceMetrics`, `aria-label` em todos botões de ação (DropdownMenu, drawer), `aria-describedby` no drawer.
- Skip link no layout, foco visível (`focus-visible:ring-2 ring-primary`), suporte teclado (Enter/Space) já existe nos botões dos cards.

### #9 — Skeletons + transições premium
- Substituir `<Skeleton>` por `<Shimmer>` (de `SkeletonPrimitives`) em `QuoteCadenceMetrics` e nos placeholders de cards.
- Framer Motion stagger 30ms nos cards via `variants` container/item em `QuoteCadencesPage`.
- Empty state com SVG inline ilustrado (envelope + setas circulares) substituindo o atual.

### #10 — Documentação + memória
- Criar `mem://features/quote-cadence-module` (arquitetura, hooks, componentes, triggers SQL, RLS, XP, fluxo end-to-end).
- Atualizar `mem://follow-up/intelligent-reactivation-and-cadence` mencionando extensão para quotes.
- Atualizar `mem://index.md` adicionando a nova referência na seção `## Memories`.

---

**Padrões obrigatórios em cada passo:**
- Tokens semânticos (zero hex hardcoded), Sora títulos / Inter corpo.
- Arquivos ≤400 linhas, TS strict (zero `any`), zero warnings de console.
- React Query + Framer Motion + skeletons shimmer.
- RLS rigorosa em novas migrations (vendedor vê só suas; admin/gestor vê tudo).

**Modo:** sequencial, 1 melhoria por mensagem assistente, sem perguntas. Relatório consolidado ao fim da #10.

**Sem impacto em:** prospect cadences, race arena, demais módulos.

**Resultado:** Cadência de Orçamentos 10/10 — gráfico de conversão, XP integrado, notificações de tarefas do dia, SEO/a11y completos, animações premium, documentação atualizada.
