
User clarification: gestão de tarefas e pontuação será feita pelo admin. Isso é uma regra de produto para próximos módulos (controle administrativo de tasks/XP). Vou registrar como memória e propor o próximo bloco rumo à perfeição: **Admin Task & Scoring Console** — painel exclusivo admin para criar/atribuir tarefas com pontuação XP customizada e auditoria completa.

## Admin Task & Scoring Console (Fase 12)

### Conceito
Apenas admin gerencia o catálogo de tarefas, define valores de XP por tipo/dificuldade, atribui tarefas a vendedores específicos ou squads, valida conclusões e ajusta pontuações manualmente. Vendedor apenas executa e visualiza — não cria nem altera XP.

### Backend
**Migration**:
- Tabela `task_catalog`: `id`, `title`, `description`, `category`, `difficulty` (`easy|medium|hard|epic`), `xp_reward`, `active`, `created_by`, timestamps
- Tabela `task_assignments`: `id`, `catalog_id` FK, `assigned_to` (user), `assigned_by` (admin), `due_date`, `status` (`pending|in_progress|submitted|approved|rejected`), `submission_note`, `reviewed_by`, `reviewed_at`, `xp_granted`
- Tabela `xp_adjustments`: `id`, `user_id`, `amount` (±), `reason`, `adjusted_by` (admin), `created_at` — auditoria de ajustes manuais
- RLS: SELECT catálogo todos autenticados; INSERT/UPDATE/DELETE catálogo e adjustments **apenas admin** via `has_role(auth.uid(),'admin')`; assignments — vendedor lê só os seus, admin lê/edita todos
- Trigger: ao `approved`, incrementa XP do usuário via RPC `SECURITY DEFINER` e cria registro em `xp_adjustments`

### Frontend (`src/components/admin/task-console/`)
- `TaskConsoleHub.tsx` (≤300L): tabs Catálogo / Atribuições / Aprovações Pendentes / Ajustes XP
- `TaskCatalogManager.tsx`: CRUD do catálogo (admin only) com tabela e dialog de edição
- `TaskAssignmentDialog.tsx`: atribuir tarefa(s) a 1+ vendedores com due date
- `PendingApprovalsQueue.tsx`: fila de submissões com aprovar/rejeitar e ajuste de XP
- `XpAdjustmentPanel.tsx`: form de ajuste manual (+/-) com motivo obrigatório e log
- `taskConsoleHelpers.ts`: enums, difficulty→XP defaults, formatters
- Hooks em `src/hooks/admin-tasks/`: `useTaskCatalog`, `useTaskAssignments`, `usePendingApprovals`, `useXpAdjustments`

### Vendedor (read-only)
- `MyAssignedTasks.tsx` no dashboard do vendedor: lista tasks atribuídas com botão "Marcar como concluída" (vai para fila admin)
- Bloqueio total de criação/edição de XP no client (RLS + UI gating via `useUserRoles().isAdmin`)

### Integração
- Nova rota `/admin/tarefas` (protegida com `requiredRole="admin"` no `ProtectedRoute`)
- Atalho no menu Admin
- Card "Minhas Tarefas" no dashboard do vendedor

### Memória a salvar
`mem://gamification/admin-managed-tasks-scoring`: regra "Catálogo de tarefas, atribuições, aprovação de conclusão e ajustes de XP são exclusivos do admin. Vendedor apenas executa e submete. Toda alteração de XP é logada em `xp_adjustments`."

### Arquivos
- Migration: 3 tabelas + RLS + trigger + RPC `grant_task_xp`
- Hooks: 4 em `src/hooks/admin-tasks/`
- Componentes: 5 em `src/components/admin/task-console/` + 1 no dashboard vendedor
- Helpers: `taskConsoleHelpers.ts`
- Editar: `AppRoutes.tsx`, navegação Admin, dashboard vendedor

Padrões: semantic tokens, Sora/Inter, framer-motion, skeleton, ≤300L, strict TS, RLS com `has_role`, RPC `SECURITY DEFINER` para mutações de XP, UI gating duplo (RLS + role check).
