
**Objetivo:** Criar módulo de **Cadência de Orçamentos** — fluxo automatizado de follow-up para vendedores acompanharem propostas/orçamentos enviados, com tarefas programadas, lembretes e métricas de conversão.

**Contexto encontrado:** Já existe infraestrutura robusta de cadências (`cadences`, `cadence_steps`, `prospect_cadences`, `cadence_tasks`, edge function `auto-enroll-cadence`, hooks em `src/hooks/cadences/`, componentes em `src/components/cadences/`). Hoje cadências rodam em `sales` (prospects). Vamos **estender** para suportar tipo "quote" (orçamento) sem duplicar código.

---

## Camada 1 — Banco de Dados

1. **Nova coluna em `cadences`:** `cadence_type` enum (`'prospecting' | 'quote_followup'`) — default `'prospecting'`.
2. **Nova coluna em `prospect_cadences`:** `quote_id uuid` (nullable, FK → `quotes.id`) — alternativa a `sale_id`.
3. **Trigger `auto_enroll_quote_cadence`** em `quotes`: quando `status` muda para `'sent'`, dispara enroll automático na cadência padrão de quote followup do vendedor.
4. **RLS:** mesma política dos prospects (vendedor vê apenas suas cadências; admin/gestor vê tudo).
5. **Seed:** 1 cadência padrão "Follow-up de Orçamento" com 5 steps:
   - Dia 1: WhatsApp confirmação de recebimento
   - Dia 3: Ligação de feedback
   - Dia 7: Email com case de sucesso
   - Dia 14: Última tentativa + oferta de desconto
   - Dia 21: Marcar como perdido se sem resposta

## Camada 2 — Backend (Edge Function)

- **Estender `auto-enroll-cadence`** para aceitar `quote_ids` além de `sale_ids`, e usar a RPC `find_matching_cadence_rule` com filtro por `cadence_type='quote_followup'`.
- Nova RPC `enroll_quote_in_cadence(_quote_id, _cadence_id)` — chamada manual pelo vendedor.

## Camada 3 — Hooks

Em `src/hooks/cadences/`:
- `useQuoteCadences(quoteId)` — lista cadências ativas do orçamento.
- `useEnrollQuoteInCadence()` — mutation manual.
- Reutilizar `useCadenceSteps`, `useCadenceTasks` (já genéricos).

## Camada 4 — UI

1. **Nova rota:** `/cadencias-orcamentos` (lazy-loaded em `AppRoutes.tsx`).
2. **Página `QuoteCadencesPage.tsx`:**
   - KPIs no topo: orçamentos em follow-up, taxa de conversão pós-cadência, tarefas hoje.
   - Lista de orçamentos com cadência ativa (cliente, valor, vendedor, próximo passo, dias decorridos).
   - Filtros: vendedor, status, dias sem resposta.
3. **Componentes novos** em `src/components/cadences/quote/`:
   - `QuoteCadenceCard.tsx` — card do orçamento com progresso da cadência.
   - `EnrollQuoteCadenceDialog.tsx` — variante de `EnrollCadenceDialog` para quotes.
   - `QuoteCadenceMetrics.tsx` — gráficos de conversão.
4. **Integração na tela de orçamentos existente:** botão "Iniciar Follow-up" em cada quote enviado.
5. **Sidebar:** novo item "Cadências de Orçamento" sob CRM (progressive disclosure).
6. **Topbar chip semântico:** "Cadências de Orçamento" quando na rota.

## Camada 5 — Notificações & Gamificação

- Tarefas de cadência de quote contam **XP** ao serem completadas (integrar com `admin-managed-tasks-scoring`).
- Notificação push/in-app no dia da tarefa.

---

**Padrões respeitados:**
- Tokens semânticos (sem cores hardcoded).
- Sora títulos / Inter corpo.
- Arquivos ≤400 linhas (extrair helpers).
- RLS rigorosa por vendedor.
- React Query, Framer Motion, skeletons.
- Lazy load da rota.

**Arquivos novos:** ~8 (1 página, 3 componentes, 1 hook, 1 migration, 1 seed, 1 edge function update).
**Arquivos editados:** `AppRoutes.tsx`, sidebar config, página de orçamentos existente, `auto-enroll-cadence/index.ts`.

**Sem impacto em:** cadências de prospect existentes (extensão aditiva, retrocompatível).

**Resultado:** vendedor envia orçamento → sistema agenda automaticamente sequência de follow-up → tarefas aparecem no dashboard diário → gestor acompanha taxa de conversão pós-cadência em painel dedicado.
