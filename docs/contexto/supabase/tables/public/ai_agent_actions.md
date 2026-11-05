# public.ai_agent_actions

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
| 2 | `run_id` | `uuid` | não |  |  |  |
| 3 | `step_index` | `integer` | não |  |  |  |
| 4 | `tool_name` | `text` | não |  |  |  |
| 5 | `tool_input` | `jsonb` | não | `'{}'::jsonb` |  |  |
| 6 | `tool_output` | `jsonb` | sim |  |  |  |
| 7 | `status` | `text` | não | `'success'::text` |  |  |
| 8 | `executed_by` | `text` | não | `'ai'::text` |  |  |
| 9 | `executed_at` | `timestamp with time zone` | não | `now()` |  |  |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| ai_agent_actions_executed_by_check | CHECK | `CHECK (executed_by = ANY (ARRAY['ai'::text, 'user'::text, 'system'::text]))` |  |  | sim |
| ai_agent_actions_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| ai_agent_actions_run_id_fkey | FOREIGN KEY | `FOREIGN KEY (run_id) REFERENCES ai_agent_runs(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |
| ai_agent_actions_status_check | CHECK | `CHECK (status = ANY (ARRAY['success'::text, 'error'::text, 'pending_approval'::text, 'skipped'::text]))` |  |  | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| ai_agent_actions_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX ai_agent_actions_pkey ON public.ai_agent_actions USING btree (id)` |
| idx_ai_agent_actions_run | btree | run_id, step_index | não | sim |  | `CREATE INDEX idx_ai_agent_actions_run ON public.ai_agent_actions USING btree (run_id, step_index)` |


## Policies (RLS)

### `Insert actions of own runs`

| campo | valor |
|---|---|
| comando | INSERT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING |  |
| WITH CHECK | `(EXISTS ( SELECT 1    FROM ai_agent_runs r   WHERE ((r.id = ai_agent_actions.run_id) AND ((r.salesperson_id = get_current_salesperson_id()) OR has_role(auth.uid(), 'admin'::app_role)))))` |

### `View actions of accessible runs`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `(EXISTS ( SELECT 1    FROM ai_agent_runs r   WHERE ((r.id = ai_agent_actions.run_id) AND ((r.salesperson_id = get_current_salesperson_id()) OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role)))))` |
| WITH CHECK |  |


## Triggers

_nenhum_


## Grants

_nenhum_
