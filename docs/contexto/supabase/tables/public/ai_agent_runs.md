# public.ai_agent_runs

| propriedade | valor |
|---|---|
| tipo | table |
| owner | postgres |
| RLS habilitado | sim |
| RLS forçado (owner) | não |
| policies | 2 |
| realtime (publication) | sim |
| replica identity | full |
| vem de extensão | não |


## Colunas

| # | coluna | tipo | nullable | default | identity/generated | comentário |
|---|---|---|---|---|---|---|
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  |  |
| 2 | `salesperson_id` | `uuid` | não |  |  |  |
| 3 | `agent_type` | `text` | não |  |  |  |
| 4 | `goal` | `text` | sim |  |  |  |
| 5 | `target_entity_type` | `text` | sim |  |  |  |
| 6 | `target_entity_id` | `uuid` | sim |  |  |  |
| 7 | `status` | `text` | não | `'pending'::text` |  |  |
| 8 | `steps` | `jsonb` | não | `'[]'::jsonb` |  |  |
| 9 | `result` | `jsonb` | sim |  |  |  |
| 10 | `requires_approval` | `boolean` | não | `true` |  |  |
| 11 | `approved_by` | `uuid` | sim |  |  |  |
| 12 | `error_message` | `text` | sim |  |  |  |
| 13 | `created_at` | `timestamp with time zone` | não | `now()` |  |  |
| 14 | `updated_at` | `timestamp with time zone` | não | `now()` |  |  |
| 15 | `completed_at` | `timestamp with time zone` | sim |  |  |  |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| ai_agent_runs_agent_type_check | CHECK | `CHECK (agent_type = ANY (ARRAY['qualify_lead'::text, 'build_proposal'::text, 'schedule_followup'::text, 'enrich_client'::text, 'recover_cold_lead'::text]))` |  |  | sim |
| ai_agent_runs_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| ai_agent_runs_status_check | CHECK | `CHECK (status = ANY (ARRAY['pending'::text, 'running'::text, 'awaiting_approval'::text, 'completed'::text, 'failed'::text, 'cancelled'::text]))` |  |  | sim |
| ai_agent_runs_target_entity_type_check | CHECK | `CHECK (target_entity_type = ANY (ARRAY['lead'::text, 'client'::text, 'deal'::text, 'activity'::text]))` |  |  | sim |


## Referenciada por (FKs de outras tabelas)

| tabela | constraint | colunas | on delete |
|---|---|---|---|
| public.ai_agent_actions | ai_agent_actions_run_id_fkey | run_id | CASCADE |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| ai_agent_runs_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX ai_agent_runs_pkey ON public.ai_agent_runs USING btree (id)` |
| idx_ai_agent_runs_salesperson | btree | salesperson_id, created_at | não | sim |  | `CREATE INDEX idx_ai_agent_runs_salesperson ON public.ai_agent_runs USING btree (salesperson_id, created_at DESC)` |
| idx_ai_agent_runs_status | btree | status | não | sim |  | `CREATE INDEX idx_ai_agent_runs_status ON public.ai_agent_runs USING btree (status)` |
| idx_ai_agent_runs_target | btree | target_entity_type, target_entity_id | não | sim |  | `CREATE INDEX idx_ai_agent_runs_target ON public.ai_agent_runs USING btree (target_entity_type, target_entity_id)` |


## Policies (RLS)

### `Salespeople view own agent runs`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `((salesperson_id = get_current_salesperson_id()) OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` |
| WITH CHECK |  |

### `System manages agent runs`

| campo | valor |
|---|---|
| comando | ALL |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `((salesperson_id = get_current_salesperson_id()) OR has_role(auth.uid(), 'admin'::app_role))` |
| WITH CHECK | `((salesperson_id = get_current_salesperson_id()) OR has_role(auth.uid(), 'admin'::app_role))` |


## Triggers

| nome | timing | eventos | nível | status | função |
|---|---|---|---|---|---|
| set_updated_at | BEFORE | UPDATE | ROW | enabled | public.handle_updated_at |
| trg_ai_agent_runs_updated_at | BEFORE | UPDATE | ROW | enabled | public.update_updated_at_column |


## Grants

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
