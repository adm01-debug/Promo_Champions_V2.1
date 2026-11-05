# public.workflows

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
| 4 | `trigger_type` | `text` | não | `'manual'::text` |  |  |
| 5 | `trigger_config` | `jsonb` | não | `'{}'::jsonb` |  |  |
| 6 | `nodes` | `jsonb` | não | `'[]'::jsonb` |  |  |
| 7 | `edges` | `jsonb` | não | `'[]'::jsonb` |  |  |
| 8 | `is_active` | `boolean` | não | `false` |  |  |
| 9 | `execution_count` | `integer` | não | `0` |  |  |
| 10 | `last_executed_at` | `timestamp with time zone` | sim |  |  |  |
| 11 | `created_by` | `uuid` | sim |  |  |  |
| 12 | `created_at` | `timestamp with time zone` | não | `now()` |  |  |
| 13 | `updated_at` | `timestamp with time zone` | não | `now()` |  |  |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| workflows_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |


## Referenciada por (FKs de outras tabelas)

| tabela | constraint | colunas | on delete |
|---|---|---|---|
| public.workflow_executions | workflow_executions_workflow_id_fkey | workflow_id | CASCADE |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| idx_workflows_active | btree | is_active | não | sim | `(is_active = true)` | `CREATE INDEX idx_workflows_active ON public.workflows USING btree (is_active) WHERE (is_active = true)` |
| idx_workflows_trigger | btree | trigger_type | não | sim |  | `CREATE INDEX idx_workflows_trigger ON public.workflows USING btree (trigger_type)` |
| workflows_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX workflows_pkey ON public.workflows USING btree (id)` |


## Policies (RLS)

### `Admins/managers can manage workflows`

| campo | valor |
|---|---|
| comando | ALL |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `(has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` |
| WITH CHECK | `(has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` |

### `Authenticated can view active workflows`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `((is_active = true) OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` |
| WITH CHECK |  |


## Triggers

| nome | timing | eventos | nível | status | função |
|---|---|---|---|---|---|
| set_updated_at | BEFORE | UPDATE | ROW | enabled | public.handle_updated_at |
| workflows_updated_at | BEFORE | UPDATE | ROW | enabled | public.update_updated_at_column |


## Grants

_nenhum_
