# public.ai_agent_runs

> Tabela public.ai_agent_runs. Estrutura registrada no catálogo do PostgreSQL: id uuid NOT NULL DEFAULT gen_random_uuid(), salesperson_id uuid NOT NULL, agent_type text NOT NULL, goal text NULLABLE, target_entity_type text NULLABLE, target_entity_id uuid NULLABLE, status text NOT NULL DEFAULT 'pending'::text, steps jsonb NOT NULL DEFAULT '[]'::jsonb, result jsonb NULLABLE, requires_approval boolean NOT NULL DEFAULT true, approved_by uuid NULLABLE, error_message text NULLABLE, created_at timestamp with time zone NOT NULL DEFAULT now(), updated_at timestamp with time zone NOT NULL DEFAULT now(), completed_at timestamp with time zone NULLABLE.

| propriedade | valor |
|---|---|
| tipo | table |
| owner | postgres |
| RLS habilitado | sim |
| RLS forçado (owner) | não |
| policies | 3 |
| realtime (publication) | sim |
| replica identity | full |
| vem de extensão | não |


## Colunas

| # | coluna | tipo | nullable | default | identity/generated | comentário |
|---|---|---|---|---|---|---|
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  | Coluna id da tabela public.ai_agent_runs. Tipo PostgreSQL: uuid. Participa da chave primária. Não aceita NULL. Valor padrão: gen_random_uuid(). |
| 2 | `salesperson_id` | `uuid` | não |  |  | Coluna salesperson_id da tabela public.ai_agent_runs. Tipo PostgreSQL: uuid. Não aceita NULL. |
| 3 | `agent_type` | `text` | não |  |  | Coluna agent_type da tabela public.ai_agent_runs. Tipo PostgreSQL: text. Não aceita NULL. Validação CHECK: CHECK (agent_type = ANY (ARRAY['qualify_lead'::text, 'build_proposal'::text, 'schedule_followup'::text, 'enrich_client'::text, 'recover_cold_lead'::text])). |
| 4 | `goal` | `text` | sim |  |  | Coluna goal da tabela public.ai_agent_runs. Tipo PostgreSQL: text. Aceita NULL. |
| 5 | `target_entity_type` | `text` | sim |  |  | Coluna target_entity_type da tabela public.ai_agent_runs. Tipo PostgreSQL: text. Aceita NULL. Validação CHECK: CHECK (target_entity_type = ANY (ARRAY['lead'::text, 'client'::text, 'deal'::text, 'activity'::text])). |
| 6 | `target_entity_id` | `uuid` | sim |  |  | Coluna target_entity_id da tabela public.ai_agent_runs. Tipo PostgreSQL: uuid. Aceita NULL. |
| 7 | `status` | `text` | não | `'pending'::text` |  | Coluna status da tabela public.ai_agent_runs. Tipo PostgreSQL: text. Não aceita NULL. Valor padrão: 'pending'::text. Validação CHECK: CHECK (status = ANY (ARRAY['pending'::text, 'running'::text, 'awaiting_approval'::text, 'completed'::text, 'failed'::text, 'cancelled'::text])). |
| 8 | `steps` | `jsonb` | não | `'[]'::jsonb` |  | Coluna steps da tabela public.ai_agent_runs. Tipo PostgreSQL: jsonb. Não aceita NULL. Valor padrão: '[]'::jsonb. |
| 9 | `result` | `jsonb` | sim |  |  | Coluna result da tabela public.ai_agent_runs. Tipo PostgreSQL: jsonb. Aceita NULL. |
| 10 | `requires_approval` | `boolean` | não | `true` |  | Coluna requires_approval da tabela public.ai_agent_runs. Tipo PostgreSQL: boolean. Não aceita NULL. Valor padrão: true. |
| 11 | `approved_by` | `uuid` | sim |  |  | Coluna approved_by da tabela public.ai_agent_runs. Tipo PostgreSQL: uuid. Aceita NULL. |
| 12 | `error_message` | `text` | sim |  |  | Coluna error_message da tabela public.ai_agent_runs. Tipo PostgreSQL: text. Aceita NULL. |
| 13 | `created_at` | `timestamp with time zone` | não | `now()` |  | Coluna created_at da tabela public.ai_agent_runs. Tipo PostgreSQL: timestamp with time zone. Não aceita NULL. Valor padrão: now(). |
| 14 | `updated_at` | `timestamp with time zone` | não | `now()` |  | Coluna updated_at da tabela public.ai_agent_runs. Tipo PostgreSQL: timestamp with time zone. Não aceita NULL. Valor padrão: now(). |
| 15 | `completed_at` | `timestamp with time zone` | sim |  |  | Coluna completed_at da tabela public.ai_agent_runs. Tipo PostgreSQL: timestamp with time zone. Aceita NULL. |


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

### `Cancel own agent runs`

| campo | valor |
|---|---|
| comando | UPDATE |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `((salesperson_id = get_current_salesperson_id()) OR has_role(auth.uid(), 'admin'::app_role))` |
| WITH CHECK | `(((salesperson_id = get_current_salesperson_id()) OR has_role(auth.uid(), 'admin'::app_role)) AND (status = 'cancelled'::text) AND (result IS NULL) AND (completed_at IS NULL) AND ((approved_by IS NULL) OR (approved_by = auth.uid())))` |

### `Insert own pending agent runs`

| campo | valor |
|---|---|
| comando | INSERT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING |  |
| WITH CHECK | `(((salesperson_id = get_current_salesperson_id()) OR has_role(auth.uid(), 'admin'::app_role)) AND (status = 'pending'::text) AND (approved_by IS NULL) AND (result IS NULL) AND (completed_at IS NULL) AND (steps = '[]'::jsonb))` |

### `Salespeople view own agent runs`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `((salesperson_id = get_current_salesperson_id()) OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` |
| WITH CHECK |  |


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
