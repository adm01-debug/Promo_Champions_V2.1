
**Continuar execução autônoma das melhorias #7 a #10** do módulo Cadência de Orçamentos. Status: #1–#6 concluídas. Restam 4.

### #7 — Notificação de tarefa do dia
- **Hook** `src/hooks/cadences/useTodaysQuoteCadenceTasks.ts`: query em `cadence_tasks` filtrando `assigned_to = auth.uid()`, `scheduled_date = today`, `status = 'pending'`, com inner join em `prospect_cadences` onde `quote_id IS NOT NULL`. Retorna `{ count, tasks }`.
- **Badge no NotificationsBell** (topbar): adicionar contagem dedicada de tarefas de cadência de orçamento. Click navega para `/cadencias-orcamentos?filter=today`.
- **QuoteCadencesPage**: ler `useSearchParams`; se `filter=today`, pré-aplicar filtro mostrando apenas cards cuja `next_action_date` é hoje.

### #8 — SEO + a11y
- **Helmet** enriquecido em `QuoteCadencesPage`: `<title>`, `<meta description>`, canonical absoluto (`https://championgifts.lovable.app/cadencias-orcamentos`), OG title/description/image, twitter:card.
- **ARIA**:
  - `role="region"` + `aria-label="Métricas de cadência"` em `QuoteCadenceMetrics`; `role="status"` + `aria-live="polite"` nos números.
  - `aria-label` em todos botões de ação (DropdownMenu trigger, ações do drawer, toggle do chart).
  - `aria-describedby` no `QuoteCadenceDetailDrawer`.
- **Foco visível** (`focus-visible:ring-2 focus-visible:ring-ring`) nos cards e botões.

### #9 — Skeletons + transições premium
- Substituir `<Skeleton>` por `<Shimmer>` (de `SkeletonPrimitives`) em `QuoteCadenceMetrics` e nos placeholders de cards (loading state).
- **Framer Motion stagger 30ms** nos cards via variantes container/item em `QuoteCadencesPage`.
- **Empty state premium**: SVG inline ilustrado (envelope + setas circulares animadas) substituindo o placeholder atual.

### #10 — Documentação + memória
- Criar `mem://features/quote-cadence-module` com: arquitetura (página, componentes, hooks, mutations), fluxo end-to-end (enroll → tarefas → conversão → XP), triggers SQL (`award_xp_on_quote_cadence_task_complete`, `award_xp_on_quote_approved_via_cadence`), RLS, integração com `prospect_cadences`/`quotes`.
- Atualizar `mem://follow-up/intelligent-reactivation-and-cadence` mencionando extensão para cadências de orçamentos.
- Atualizar `mem://index.md` (seção `## Memories`) adicionando referência `[Quote Cadence Module](mem://features/quote-cadence-module)`.

---

**Padrões obrigatórios em cada passo:**
- Tokens semânticos (zero hex hardcoded), Sora títulos / Inter corpo.
- Arquivos ≤400 linhas, TS strict (zero `any`), zero warnings de console.
- React Query + Framer Motion + skeletons shimmer.
- RLS rigorosa; triggers `SECURITY DEFINER` com `search_path = public`.

**Modo:** sequencial, 1 melhoria por mensagem assistente, sem perguntas. Relatório consolidado ao fim da #10.

**Sem impacto em:** prospect cadences, race arena, demais módulos.

**Resultado:** Cadência de Orçamentos 10/10 — notificações de tarefas do dia, SEO/a11y completos, animações premium, documentação atualizada.
