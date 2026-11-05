# public.automation_runs

| propriedade | valor |
|---|---|
| tipo | table |
| owner | postgres |
| RLS habilitado | sim |
| RLS forçado (owner) | não |
| policies | 2 |
| realtime (publication) | não |
| replica identity | default |
| vem de extensão | não |


## Colunas

| # | coluna | tipo | nullable | default | identity/generated | comentário |
|---|---|---|---|---|---|---|
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  |  |
| 2 | `workflow_id` | `uuid` | não |  |  |  |
| 3 | `status` | `text` | não | `'success'::text` |  |  |
| 4 | `trigger_payload` | `jsonb` | sim | `'{}'::jsonb` |  |  |
| 5 | `actions_executed` | `jsonb` | sim | `'[]'::jsonb` |  |  |
| 6 | `error_message` | `text` | sim |  |  |  |
| 7 | `duration_ms` | `integer` | sim |  |  |  |
| 8 | `started_at` | `timestamp with time zone` | não | `now()` |  |  |
| 9 | `completed_at` | `timestamp with time zone` | sim |  |  |  |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| automation_runs_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| automation_runs_status_check | CHECK | `CHECK (status = ANY (ARRAY['success'::text, 'failed'::text, 'skipped'::text, 'partial'::text]))` |  |  | sim |
| automation_runs_workflow_id_fkey | FOREIGN KEY | `FOREIGN KEY (workflow_id) REFERENCES automation_workflows(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| automation_runs_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX automation_runs_pkey ON public.automation_runs USING btree (id)` |
| idx_automation_runs_status | btree | status, started_at | não | sim |  | `CREATE INDEX idx_automation_runs_status ON public.automation_runs USING btree (status, started_at DESC)` |
| idx_automation_runs_workflow | btree | workflow_id, started_at | não | sim |  | `CREATE INDEX idx_automation_runs_workflow ON public.automation_runs USING btree (workflow_id, started_at DESC)` |


## Policies (RLS)

### `Authenticated users can view runs`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `true` |
| WITH CHECK |  |

### `automation_runs_select_admin_manager`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `is_admin_or_manager(auth.uid())` |
| WITH CHECK |  |


## Triggers

_nenhum_


## Grants

_nenhum_
