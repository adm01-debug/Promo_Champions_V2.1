# public.automation_workflows

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
| 2 | `name` | `text` | não |  |  |  |
| 3 | `description` | `text` | sim |  |  |  |
| 4 | `trigger_type` | `text` | não |  |  |  |
| 5 | `trigger_config` | `jsonb` | não | `'{}'::jsonb` |  |  |
| 6 | `conditions` | `jsonb` | não | `'[]'::jsonb` |  |  |
| 7 | `actions` | `jsonb` | não | `'[]'::jsonb` |  |  |
| 8 | `is_active` | `boolean` | não | `true` |  |  |
| 9 | `created_by` | `uuid` | sim |  |  |  |
| 10 | `run_count` | `integer` | não | `0` |  |  |
| 11 | `last_run_at` | `timestamp with time zone` | sim |  |  |  |
| 12 | `created_at` | `timestamp with time zone` | não | `now()` |  |  |
| 13 | `updated_at` | `timestamp with time zone` | não | `now()` |  |  |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| automation_workflows_created_by_fkey | FOREIGN KEY | `FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL` | SET NULL | NO ACTION | sim |
| automation_workflows_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| automation_workflows_trigger_type_check | CHECK | `CHECK (trigger_type = ANY (ARRAY['deal_created'::text, 'stage_changed'::text, 'activity_logged'::text, 'scheduled'::text, 'manual'::text, 'no_activity_days'::text, 'proposal_opened'::text, 'price_clicked'::text]))` |  |  | sim |


## Referenciada por (FKs de outras tabelas)

| tabela | constraint | colunas | on delete |
|---|---|---|---|
| public.automation_runs | automation_runs_workflow_id_fkey | workflow_id | CASCADE |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| automation_workflows_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX automation_workflows_pkey ON public.automation_workflows USING btree (id)` |
| idx_automation_workflows_created_by | btree | created_by | não | sim |  | `CREATE INDEX idx_automation_workflows_created_by ON public.automation_workflows USING btree (created_by)` |
| idx_automation_workflows_trigger | btree | trigger_type | não | sim | `(is_active = true)` | `CREATE INDEX idx_automation_workflows_trigger ON public.automation_workflows USING btree (trigger_type) WHERE (is_active = true)` |


## Policies (RLS)

### `Admins/managers manage workflows`

| campo | valor |
|---|---|
| comando | ALL |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `is_admin_or_manager(auth.uid())` |
| WITH CHECK | `is_admin_or_manager(auth.uid())` |

### `Authenticated users can view active workflows`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | public |
| USING | `(auth.uid() IS NOT NULL)` |
| WITH CHECK |  |


## Triggers

| nome | timing | eventos | nível | status | função |
|---|---|---|---|---|---|
| set_updated_at | BEFORE | UPDATE | ROW | enabled | public.handle_updated_at |
| trg_automation_workflows_updated_at | BEFORE | UPDATE | ROW | enabled | public.update_updated_at_column |


## Grants

_nenhum_
