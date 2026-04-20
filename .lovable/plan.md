
**Objetivo:** Elevar o módulo de Cadência de Orçamentos a 10/10 com execução autônoma e sequencial de melhorias, uma por vez, sem pausas até a conclusão.

**Backlog priorizado (ordem de execução):**

### 1. Corrigir warning de ref no `RaceCar` (débito técnico aberto)
- Envolver `RaceCarInner` em `forwardRef` antes do `memo` em `src/components/race/RaceCar.tsx`.
- Eliminar warning "Function components cannot be given refs".

### 2. Detalhamento de cadência de orçamento (drill-down)
- Criar `QuoteCadenceDetailDrawer.tsx` — abre ao clicar no `QuoteCadenceCard`.
- Mostra timeline dos 5 steps, status de cada tarefa, botão "Concluir/Pular/Reagendar", notas do vendedor.
- Hook `useCadenceTasksByEnrollment(enrollmentId)`.

### 3. Ações de controle no card (pausar/retomar/cancelar)
- Botões com `DropdownMenu` no `QuoteCadenceCard`.
- Mutations `usePauseCadence`, `useResumeCadence`, `useCancelCadence` (já parcialmente existem em `useProspectCadenceMutations` — reutilizar).
- Toast de feedback + invalidação de queries.

### 4. Filtros avançados na página
- Filtro por vendedor (dropdown), por dias sem resposta (slider), por valor do orçamento (range), busca por cliente.
- Persistir via `useSavedFilters` (padrão do projeto).
- Botão "Limpar filtros".

### 5. Gráfico de conversão pós-cadência
- Novo componente `QuoteCadenceConversionChart.tsx` com Recharts.
- Linha temporal: orçamentos enviados vs aprovados nos últimos 30/60/90 dias.
- Tipagem estrita via `src/types/recharts.ts`.

### 6. Integração XP/Gamificação
- Trigger no banco: ao completar `cadence_task` de quote, chamar RPC `increment_user_xp` (+15 XP por tarefa, +50 XP se quote vira `approved`).
- Toast "+15 XP" no frontend ao concluir tarefa.

### 7. Notificação in-app de tarefa do dia
- Bell icon no topbar destaca quantidade de tarefas de cadência de quote pendentes hoje.
- Hook `useTodaysQuoteCadenceTasks` (filtro por `salesperson_id = auth.uid()`).
- Click → navega para `/cadencias-orcamentos?filter=today`.

### 8. SEO + acessibilidade da página
- Helmet com canonical, OpenGraph, description rica.
- ARIA labels nos botões de ação, `role="status"` nas métricas.
- Skip link, foco visível, navegação por teclado nos cards.

### 9. Skeleton + transições premium
- Substituir skeletons básicos por versão com shimmer.
- Framer Motion stagger nos cards (delay 30ms cada).
- Empty state ilustrado (atualmente texto puro).

### 10. Documentação + memória
- Atualizar `mem://follow-up/intelligent-reactivation-and-cadence` com a extensão para quotes.
- Criar `mem://features/quote-cadence-module` descrevendo arquitetura, RPCs, trigger, RLS.

---

**Padrões obrigatórios em cada passo:**
- Tokens semânticos (zero hex hardcoded).
- Sora títulos / Inter corpo.
- Arquivos ≤400 linhas (extrair `*Helpers.ts`).
- React Query + Framer Motion + skeletons.
- RLS rigorosa (vendedor vê apenas suas; admin/gestor vê tudo).
- Zero console errors/warnings.
- TypeScript strict (sem `any`).
- Validação Zod em edge functions novas (se houver).

**Modo de execução:** sequencial, 1 melhoria por mensagem, sem pausas para perguntas. Após cada implementação, sigo automaticamente para a próxima até concluir as 10. Ao final, relatório consolidado.

**Sem impacto em:** cadências de prospect, race arena, demais módulos.

**Resultado final:** módulo de Cadência de Orçamentos 10/10 — drill-down funcional, controles completos, filtros avançados, gráficos, XP integrado, notificações, SEO, a11y, animações premium, documentação atualizada.
