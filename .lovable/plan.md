
**Continuar execução autônoma das melhorias #4 a #10** do módulo Cadência de Orçamentos. Status: #1, #2 e #3 concluídas. Restam 7.

### #4 — Filtros avançados
- Componente `QuoteCadenceFilters.tsx` (painel colapsável) com: busca cliente (input), vendedor (Select), dias sem resposta (Slider 0–30), valor min/max.
- Persistência via `useSavedFilters('quote_cadences')` + barra `SavedFiltersBar`.
- Botão "Limpar filtros" + chip com contagem de filtros ativos.
- Integração na `QuoteCadencesPage.tsx` (estado + filtragem client-side sobre `rows`).

### #5 — Gráfico de conversão pós-cadência
- `QuoteCadenceConversionChart.tsx` com Recharts AreaChart.
- Toggle 30/60/90 dias; séries: enviados vs aprovados.
- Hook `useQuoteCadenceConversion(days)` agregando dados de `prospect_cadences` + `quotes`.
- Tipagem via `src/types/recharts.ts`. Inserido após `QuoteCadenceMetrics`.

### #6 — XP/Gamificação
- Migration: trigger `award_xp_on_quote_cadence_task_complete` em `cadence_tasks` — `status='completed'` + enrollment com `quote_id` → `increment_user_xp(15)`.
- Trigger `award_xp_on_quote_approved` em `quotes` — `status='approved'` + cadência ativa → +50 XP.
- Toast "+15 XP" no frontend ao completar tarefa via drawer (otimista).

### #7 — Notificação de tarefa do dia
- Hook `useTodaysQuoteCadenceTasks` (filtro `auth.uid()` + `scheduled_date = today` + `status='pending'`).
- Badge no `NotificationsBell` (topbar) com contagem.
- Click → `/cadencias-orcamentos?filter=today`.
- Página lê query param e aplica filtro inicial.

### #8 — SEO + a11y
- Helmet enriquecido (canonical, OG title/description/image).
- ARIA: `role="status"` nas métricas, `aria-label` nos botões de ação, `aria-live` em toasts críticos.
- Skip link, foco visível (ring), navegação por teclado nos cards (Enter/Space).

### #9 — Skeletons + transições premium
- Substituir `<Skeleton>` básico por `<Shimmer>` (SkeletonPrimitives).
- Framer Motion stagger 30ms nos cards (variantes container/item).
- Empty state com SVG ilustrado inline (envelope + setas circulares).

### #10 — Documentação + memória
- Criar `mem://features/quote-cadence-module` (arquitetura, RPCs, triggers, RLS, hooks, componentes).
- Atualizar `mem://follow-up/intelligent-reactivation-and-cadence` mencionando extensão para quotes.
- Atualizar `mem://index.md` com referência nova.

---

**Padrões obrigatórios em cada passo:**
- Tokens semânticos (zero hex hardcoded), Sora títulos / Inter corpo.
- Arquivos ≤400 linhas, TS strict (zero `any`), zero warnings.
- React Query + Framer Motion + skeletons shimmer.
- RLS rigorosa (vendedor vê só suas; admin/gestor vê tudo).

**Modo:** sequencial, 1 melhoria por mensagem assistente, sem perguntas. Relatório consolidado ao fim da #10.

**Sem impacto em:** prospect cadences, race arena, demais módulos.

**Resultado:** Cadência de Orçamentos 10/10 — filtros persistentes, gráfico de conversão, XP integrado, notificações, SEO/a11y, animações premium, documentação atualizada.
