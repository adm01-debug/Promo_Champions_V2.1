
**Continuar execução autônoma das melhorias #6 a #10** do módulo Cadência de Orçamentos. Status: #1–#5 concluídas. Restam 5.

### #6 — XP/Gamificação (Triggers + Toast)
- **Migration**: criar 2 triggers SQL com `SECURITY DEFINER`:
  - `award_xp_on_quote_cadence_task_complete` em `cadence_tasks` (AFTER UPDATE) — quando `OLD.status != 'completed'` e `NEW.status = 'completed'`, verifica se o enrollment (`prospect_cadences`) tem `quote_id IS NOT NULL` e chama `increment_user_xp(NEW.assigned_to, 15, 'quote_cadence_task')`.
  - `award_xp_on_quote_approved` em `quotes` (AFTER UPDATE) — quando `OLD.status != 'approved'` e `NEW.status = 'approved'`, verifica se existe `prospect_cadences` ativa para o quote e chama `increment_user_xp(NEW.seller_id, 50, 'quote_approved_via_cadence')`.
- **Frontend**: toast otimista "+15 XP" no `QuoteCadenceDetailDrawer` ao completar tarefa, usando `useGamification().rewardXP(15, 'Tarefa de cadência concluída')`.

### #7 — Notificação de tarefa do dia
- **Hook** `useTodaysQuoteCadenceTasks` em `src/hooks/cadences/`: filtra `cadence_tasks` por `assigned_to = auth.uid()`, `scheduled_date = today`, `status = 'pending'`, com inner join em `prospect_cadences` onde `quote_id IS NOT NULL`. Retorna count + lista.
- **Badge no NotificationsBell** (topbar): adicionar contagem dedicada com ícone próprio (FileText) ou somar à contagem existente. Click navega para `/cadencias-orcamentos?filter=today`.
- **QuoteCadencesPage** lê `useSearchParams` — se `filter=today`, pré-aplica filtro mostrando apenas cards cuja `next_action_date` é hoje.

### #8 — SEO + a11y
- **Helmet** enriquecido em `QuoteCadencesPage`: `<title>`, `<meta description>`, canonical absoluto, OG title/description/image, twitter:card.
- **ARIA**:
  - `role="region"` + `aria-label="Métricas de cadência"` em `QuoteCadenceMetrics`; `role="status"` + `aria-live="polite"` nos números.
  - `aria-label` em todos botões de ação (DropdownMenu trigger, ações do drawer).
  - `aria-describedby` no `QuoteCadenceDetailDrawer`.
- **Foco visível** (`focus-visible:ring-2 focus-visible:ring-ring`) nos cards e botões; navegação por teclado (Enter/Space) já funcional.

### #9 — Skeletons + transições premium
- Substituir `<Skeleton>` por `<Shimmer>` (de `SkeletonPrimitives`) em `QuoteCadenceMetrics` e nos placeholders de cards (loading state da página).
- **Framer Motion stagger 30ms** nos cards via `variants` container/item em `QuoteCadencesPage`:
  ```ts
  const container = { animate: { transition: { staggerChildren: 0.03 } } };
  const item = { initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 } };
  ```
- **Empty state premium**: SVG inline ilustrado (envelope + setas circulares animadas) substituindo o placeholder atual.

### #10 — Documentação + memória
- Criar `mem://features/quote-cadence-module` com: arquitetura (página, componentes, hooks, mutations), fluxo end-to-end (enroll → tarefas → conversão), triggers SQL XP, RLS, integração com `prospect_cadences`/`quotes`.
- Atualizar `mem://follow-up/intelligent-reactivation-and-cadence` mencionando extensão para cadências de orçamentos.
- Atualizar `mem://index.md` (seção `## Memories`) adicionando referência `[Quote Cadence Module](mem://features/quote-cadence-module)`.

---

**Padrões obrigatórios em cada passo:**
- Tokens semânticos (zero hex hardcoded), Sora títulos / Inter corpo.
- Arquivos ≤400 linhas, TS strict (zero `any`), zero warnings de console.
- React Query + Framer Motion + skeletons shimmer.
- RLS rigorosa em novas migrations; triggers `SECURITY DEFINER` com `search_path = public`.

**Modo:** sequencial, 1 melhoria por mensagem assistente, sem perguntas. Relatório consolidado ao fim da #10.

**Sem impacto em:** prospect cadences, race arena, demais módulos.

**Resultado:** Cadência de Orçamentos 10/10 — XP integrado, notificações de tarefas do dia, SEO/a11y completos, animações premium, documentação atualizada.
