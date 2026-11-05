# public.tasks

| propriedade | valor |
|---|---|
| tipo | table |
| owner | postgres |
| RLS habilitado | sim |
| RLS forçado (owner) | não |
| policies | 4 |
| realtime (publication) | não |
| replica identity | default |
| vem de extensão | não |
| usada por views | public.tasks_active |


## Colunas

| # | coluna | tipo | nullable | default | identity/generated | comentário |
|---|---|---|---|---|---|---|
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  |  |
| 2 | `title` | `text` | não |  |  |  |
| 3 | `description` | `text` | sim |  |  |  |
| 4 | `salesperson_id` | `uuid` | sim |  |  |  |
| 5 | `sale_id` | `uuid` | sim |  |  |  |
| 6 | `priority` | `task_priority` | não | `'medium'::task_priority` |  |  |
| 7 | `status` | `task_status` | não | `'pending'::task_status` |  |  |
| 8 | `task_type` | `task_type` | não | `'other'::task_type` |  |  |
| 9 | `due_date` | `date` | não | `CURRENT_DATE` |  |  |
| 10 | `due_time` | `time without time zone` | sim |  |  |  |
| 11 | `completed_at` | `timestamp with time zone` | sim |  |  |  |
| 12 | `created_at` | `timestamp with time zone` | não | `now()` |  |  |
| 13 | `updated_at` | `timestamp with time zone` | não | `now()` |  |  |
| 14 | `source_insight_id` | `uuid` | sim |  |  |  |
| 15 | `client_id` | `uuid` | sim |  |  |  |
| 16 | `deleted_at` | `timestamp with time zone` | sim |  |  | Soft delete: preenchido marca o registro como excluído sem remoção física. |
| 17 | `deleted_by` | `uuid` | sim |  |  |  |
| 18 | `delete_reason` | `text` | sim |  |  |  |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| tasks_client_id_fkey | FOREIGN KEY | `FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |
| tasks_due_date_check | CHECK | `CHECK (due_date >= '2020-01-01'::date)` |  |  | sim |
| tasks_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| tasks_sale_id_fkey | FOREIGN KEY | `FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE SET NULL` | SET NULL | NO ACTION | sim |
| tasks_salesperson_id_fkey | FOREIGN KEY | `FOREIGN KEY (salesperson_id) REFERENCES salespeople(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |
| tasks_source_insight_id_fkey | FOREIGN KEY | `FOREIGN KEY (source_insight_id) REFERENCES win_loss_insights(id) ON DELETE SET NULL` | SET NULL | NO ACTION | sim |


## Referenciada por (FKs de outras tabelas)

| tabela | constraint | colunas | on delete |
|---|---|---|---|
| public.client_churn_alerts_state | client_churn_alerts_state_last_task_id_fkey | last_task_id | SET NULL |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| idx_tasks_client_id | btree | client_id | não | sim |  | `CREATE INDEX idx_tasks_client_id ON public.tasks USING btree (client_id)` |
| idx_tasks_created_at | btree | created_at | não | sim |  | `CREATE INDEX idx_tasks_created_at ON public.tasks USING btree (created_at DESC)` |
| idx_tasks_deleted_at | btree | deleted_at | não | sim | `(deleted_at IS NOT NULL)` | `CREATE INDEX idx_tasks_deleted_at ON public.tasks USING btree (deleted_at) WHERE (deleted_at IS NOT NULL)` |
| idx_tasks_due_date | btree | due_date | não | sim |  | `CREATE INDEX idx_tasks_due_date ON public.tasks USING btree (due_date)` |
| idx_tasks_priority | btree | priority | não | sim |  | `CREATE INDEX idx_tasks_priority ON public.tasks USING btree (priority)` |
| idx_tasks_sale_id | btree | sale_id | não | sim |  | `CREATE INDEX idx_tasks_sale_id ON public.tasks USING btree (sale_id)` |
| idx_tasks_salesperson_created_at | btree | salesperson_id, created_at | não | sim |  | `CREATE INDEX idx_tasks_salesperson_created_at ON public.tasks USING btree (salesperson_id, created_at DESC)` |
| idx_tasks_salesperson_status | btree | salesperson_id, status, due_date | não | sim |  | `CREATE INDEX idx_tasks_salesperson_status ON public.tasks USING btree (salesperson_id, status, due_date)` |
| idx_tasks_salesperson_type | btree | salesperson_id, task_type | não | sim |  | `CREATE INDEX idx_tasks_salesperson_type ON public.tasks USING btree (salesperson_id, task_type)` |
| idx_tasks_source_insight_id | btree | source_insight_id | não | sim |  | `CREATE INDEX idx_tasks_source_insight_id ON public.tasks USING btree (source_insight_id)` |
| idx_tasks_status | btree | status | não | sim |  | `CREATE INDEX idx_tasks_status ON public.tasks USING btree (status)` |
| idx_tasks_status_priority | btree | status, priority | não | sim |  | `CREATE INDEX idx_tasks_status_priority ON public.tasks USING btree (status, priority DESC)` |
| tasks_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX tasks_pkey ON public.tasks USING btree (id)` |


## Policies (RLS)

### `Users can insert own tasks`

| campo | valor |
|---|---|
| comando | INSERT |
| tipo | PERMISSIVE |
| roles | public |
| USING |  |
| WITH CHECK | `((salesperson_id = get_current_salesperson_id()) OR is_admin_or_manager(auth.uid()))` |

### `Users can read own tasks or admins all`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | public |
| USING | `((salesperson_id = get_current_salesperson_id()) OR is_admin_or_manager(auth.uid()))` |
| WITH CHECK |  |

### `Users can update own tasks`

| campo | valor |
|---|---|
| comando | UPDATE |
| tipo | PERMISSIVE |
| roles | public |
| USING | `((salesperson_id = get_current_salesperson_id()) OR is_admin_or_manager(auth.uid()))` |
| WITH CHECK |  |

### `admin_delete_tasks`

| campo | valor |
|---|---|
| comando | DELETE |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `is_admin_or_manager(auth.uid())` |
| WITH CHECK |  |


## Triggers

| nome | timing | eventos | nível | status | função |
|---|---|---|---|---|---|
| audit_tasks_changes | AFTER | UPDATE | ROW | enabled | private.handle_audit_logging |
| set_updated_at | BEFORE | UPDATE | ROW | enabled | public.handle_updated_at |
| update_tasks_updated_at | BEFORE | UPDATE | ROW | enabled | public.update_updated_at_column |


## Grants

_nenhum_
