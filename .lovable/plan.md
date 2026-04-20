
**Objetivo:** Executar autonomamente as 9 melhorias restantes (#2 a #10) do backlog do módulo de Cadência de Orçamentos, sequencialmente, sem pausas, até alcançar 10/10.

**Status atual:** Melhoria #1 (warning ref no `RaceCar`) já concluída. Restam 9 melhorias.

---

### Sequência de execução (1 por mensagem, automática):

**#2 — Drill-down de cadência**
- `QuoteCadenceDetailDrawer.tsx` (Vaul drawer) acionado ao clicar no card.
- Hook `useCadenceTasksByEnrollment(enrollmentId)`.
- Timeline dos 5 steps com status, botões Concluir/Pular/Reagendar, campo notas.

**#3 — Controles no card (pausar/retomar/cancelar)**
- `DropdownMenu` no `QuoteCadenceCard` com 3 ações.
- Reutilizar mutations de `useProspectCadenceMutations` (já existem).
- Toast + invalidação de queries.

**#4 — Filtros avançados**
- Dropdown vendedor, slider dias sem resposta, range valor, busca cliente.
- Persistência via `useSavedFilters('quote_cadences')`.
- Botão "Limpar filtros".

**#5 — Gráfico de conversão**
- `QuoteCadenceConversionChart.tsx` (Recharts LineChart).
- 30/60/90 dias: enviados vs aprovados.
- Tipagem via `src/types/recharts.ts`.

**#6 — XP/Gamificação**
- Trigger SQL: ao completar `cadence_task` de quote → +15 XP; quote vira `approved` → +50 XP via `increment_user_xp`.
- Toast "+15 XP" no frontend.

**#7 — Notificação tarefa do dia**
- Hook `useTodaysQuoteCadenceTasks` (filtrado por `auth.uid()`).
- Badge no bell icon do topbar com contagem.
- Click → `/cadencias-orcamentos?filter=today`.

**#8 — SEO + a11y**
- Helmet com canonical, OpenGraph, description rica.
- ARIA labels, `role="status"` nas métricas, skip link, foco visível.

**#9 — Skeletons + animações premium**
- Shimmer skeletons (substituir básicos).
- Framer stagger 30ms nos cards.
- Empty state ilustrado (SVG inline).

**#10 — Documentação + memória**
- Atualizar `mem://follow-up/intelligent-reactivation-and-cadence`.
- Criar `mem://features/quote-cadence-module`.

---

**Fix paralelo (silencioso):** Erro runtime atual `Failed to fetch dynamically imported module: Vendedores.tsx` — investigar e corrigir antes de prosseguir, pois bloqueia preview.

**Padrões obrigatórios (todos os passos):**
- Tokens semânticos, Sora/Inter, ≤400 linhas/arquivo, RLS rigorosa, TS strict, zero warnings, React Query + Framer Motion + skeletons.

**Modo:** sequencial, 1 melhoria por mensagem, sem perguntas. Relatório consolidado ao final.

**Sem impacto em:** prospect cadences, race arena, demais módulos.

**Resultado:** Cadência de Orçamentos 10/10 — drill-down, controles, filtros, gráficos, XP, notificações, SEO, a11y, animações, docs.
