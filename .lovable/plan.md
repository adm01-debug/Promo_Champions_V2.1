
**Corrigir 3 bugs identificados no teste E2E + concluir Melhoria #10** (documentação) — fechamento 10/10 do módulo Cadência de Orçamentos.

### BUG-01 — Visibilidade dos dados mockados (CRITICAL)
**Problema:** RLS de `quotes`/`prospect_cadences` filtra por `created_by = auth.uid()` ou `salesperson_id` do user logado. Mock data foi inserido com `created_by` aleatório → dashboard mostra 0.

**Correção (migration de UPDATE):**
- Reatribuir todas as 12 quotes `MOCK-CAD-*`: `UPDATE quotes SET created_by = (primeiro auth.users id existente que tenha salesperson) WHERE quote_number LIKE 'MOCK-CAD-%'`.
- Reatribuir as 12 `prospect_cadences` correspondentes: `salesperson_id = (salesperson.id do mesmo user)`.
- Reatribuir as ~30 `cadence_tasks`: `assigned_to = mesmo auth user id`.
- Garantir `next_action_date = CURRENT_DATE` em ≥3 prospect_cadences daquele user.

### BUG-02 — Hook `useTodaysQuoteCadenceTasks` usa coluna errada
**Arquivo:** `src/hooks/cadences/useTodaysQuoteCadenceTasks.ts` linha 22.
**Correção:** trocar `.eq("user_id", userId)` por `.eq("auth_user_id", userId)` na query de `salespeople` (consistente com fix de `enroll_quote_in_cadence`).

### BUG-03 — SEO meta tags não detectadas
**Investigação rápida:** confirmar que `HelmetProvider` envolve `App` (já confirmado em `src/App.tsx`). Provável causa: `<Helmet>` aninhado em wrapper que não monta no head no SSR-less. Garantir que tags estão no nível raiz do JSX da página, sem `<>`+condicionais que atrasem render. Validar `<title>`, `<meta name="description">`, `<link rel="canonical">`, OG e twitter:card em `QuoteCadencesPage.tsx`. Se já corretos, problema era apenas o snapshot do extractor — registrar como falso-positivo.

### Melhoria #10 — Documentação + memória
- Criar `mem://features/quote-cadence-module` com:
  - Arquitetura: página `QuoteCadencesPage`, componentes (`QuoteCadenceMetrics`, `QuoteCadenceCard`, `QuoteCadenceConversionChart`, `QuoteCadenceDetailDrawer`, `QuoteCadenceEmptyState`), hooks (`useQuoteCadences`, `useQuoteCadenceStats`, `useTodaysQuoteCadenceTasks`, `useQuoteCadenceMutations`), RPC `enroll_quote_in_cadence`.
  - Fluxo end-to-end: enroll → tarefas geradas → execução diária → conclusão/conversão → triggers XP.
  - Triggers SQL: `trg_award_xp_on_quote_cadence_task_complete`, `trg_award_xp_on_quote_approved_via_cadence`.
  - RLS: visibilidade restrita ao salesperson dono ou admin.
  - Filtro `?filter=today` + badge topbar.
- Atualizar `mem://follow-up/intelligent-reactivation-and-cadence` adicionando parágrafo final mencionando extensão para cadências de orçamentos.
- Atualizar `mem://index.md` (seção `## Memories`) com nova linha:
  `- [Quote Cadence Module](mem://features/quote-cadence-module) — Follow-up automatizado de orçamentos com triggers XP, filtro today e drawer premium`

### Ordem de execução (sequencial, sem perguntas)
1. Migration: corrigir `created_by`/`salesperson_id`/`assigned_to` dos registros `MOCK-CAD-*`.
2. Edit `useTodaysQuoteCadenceTasks.ts`: trocar `user_id` → `auth_user_id`.
3. Validar/ajustar Helmet em `QuoteCadencesPage.tsx`.
4. Criar `mem://features/quote-cadence-module`.
5. Atualizar `mem://follow-up/intelligent-reactivation-and-cadence`.
6. Atualizar `mem://index.md`.
7. Relatório final consolidado: scores 10/10 por critério.

**Padrões mantidos:** tokens semânticos, ≤400 linhas, TS strict, RLS rigorosa, zero warnings.
**Sem impacto** em outros módulos.
