
Admin Task Console entregue (Fase 12). Próximo bloco rumo à perfeição: **Squad Assignment & Bulk Operations** — escalar atribuição de tarefas para grupos (squads/equipes) e operações em lote, eliminando o gargalo de atribuir 1-a-1.

## Squad-Based Task Assignment & Bulk Ops (Fase 13)

### Conceito
Admin atribui tarefas para squads inteiros (SDRs, Closers, ou grupos customizados) com 1 clique, programa recorrência (diária/semanal), aplica filtros (top 10 ranking, vendedores em risco), e executa ações em massa na fila de aprovações.

### Backend
**Migration**:
- Tabela `squads`: `id`, `name`, `description`, `color`, `created_by`, timestamps
- Tabela `squad_members`: `squad_id` FK, `user_id`, `added_at`, PK composta
- Coluna em `task_assignments`: `squad_id` (nullable, FK) + `recurrence_rule` (text: `daily|weekly|monthly|null`) + `parent_recurrence_id`
- RLS: squads CRUD admin only; SELECT autenticados
- RPC `assign_task_to_squad(catalog_id, squad_id, due_date, recurrence)`: SECURITY DEFINER, cria N assignments em batch
- RPC `bulk_approve_assignments(ids[], xp_overrides jsonb)`: aprova múltiplas submissões com XP individual

### Frontend
- `SquadManager.tsx` (nova tab no TaskConsoleHub): CRUD de squads + drag-drop de membros
- Atualizar `TaskAssignmentDialog`: toggle "Por squad" vs "Por vendedor", seletor de recorrência
- Atualizar `PendingApprovalsQueue`: checkboxes + barra de ações em lote (aprovar/rejeitar N)
- `BulkActionBar.tsx`: barra flutuante com contagem e CTAs
- Hook `useSquads.ts`, `useBulkApprovals.ts`

### Arquivos
- Migration: `squads`, `squad_members`, alter `task_assignments`, 2 RPCs
- Hooks: 2 novos em `src/hooks/admin-tasks/`
- Componentes: `SquadManager.tsx`, `BulkActionBar.tsx` + edits em 2 existentes
- Editar: `TaskConsoleHub.tsx` (nova tab "Squads"), `taskConsoleHelpers.ts` (recurrence labels)

Padrões: ≤300L, semantic tokens, framer-motion, RPC SECURITY DEFINER, RLS via `has_role`.
