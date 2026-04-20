
**Continuar execução autônoma das melhorias #3 a #10** do módulo Cadência de Orçamentos. Status: #1 e #2 concluídas. Restam 8.

### #3 — Controles no card (pausar/retomar/cancelar)
- `DropdownMenu` no `QuoteCadenceCard` (canto sup. dir.) com 3 ações condicionais ao status.
- Reutilizar mutations já existentes em `useQuoteCadenceMutations.ts`.
- `stopPropagation` para não abrir o drawer ao clicar.

### #4 — Filtros avançados
- Painel colapsável com: busca cliente (input), vendedor (Select), dias sem resposta (Slider 0–30), valor mínimo/máximo (range).
- Persistência via `useSavedFilters('quote_cadences')`.
- Botão "Limpar filtros" + chip count de filtros ativos.

### #5 — Gráfico de conversão pós-cadência
- `QuoteCadenceConversionChart.tsx` com Recharts AreaChart.
- Toggle 30/60/90 dias; séries: enviados vs aprovados.
- Tipagem via `src/types/recharts.ts`. Inserido na `QuoteCadenceMetrics`.

### #6 — XP/Gamificação
- Migration: trigger `award_xp_on_quote_cadence_task_complete` em `cadence_tasks` — quando `status` vai para `completed` e enrollment tem `quote_id`, chama `increment_user_xp(15)`.
- Trigger `award_xp_on_quote_approved` em `quotes` — `status='approved'` + cadência ativa → +50 XP.
- Toast "+15 XP" no frontend ao completar tarefa via drawer.

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
- Substituir `<Skeleton>` básico por `<Shimmer>` de `SkeletonPrimitives`.
- Framer Motion stagger 30ms nos cards (variantes container/item).
- Empty state com SVG ilustrado inline (envelope + setas circulares).

### #10 — Documentação + memória
- Criar `mem://features/quote-cadence-module` (arquitetura, RPCs, trigger, RLS, hooks, componentes).
- Atualizar `mem://follow-up/intelligent-reactivation-and-cadence` mencionando extensão para quotes.
- Atualizar `mem://index.md` com referência nova.

---

**Padrões obrigatórios em cada passo:**
- Tokens semânticos (zero hex hardcoded).
- Sora títulos / Inter corpo.
- Arquivos ≤400 linhas.
- TS strict (zero `any`), zero warnings.
- React Query + Framer Motion + skeletons shimmer.
- RLS rigorosa (vendedor vê só suas; admin/gestor vê tudo).

**Modo:** sequencial, 1 melhoria por mensagem assistente, sem perguntas. Relatório consolidado ao fim da #10.

**Sem impacto em:** prospect cadences, race arena, demais módulos.

**Resultado:** Cadência de Orçamentos 10/10 — controles completos, filtros persistentes, gráfico de conversão, XP integrado, notificações, SEO/a11y, animações premium, documentação atualizada.
