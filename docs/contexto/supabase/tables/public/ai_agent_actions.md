# public.ai_agent_actions

> Tabela public.ai_agent_actions. Estrutura registrada no catálogo do PostgreSQL: id uuid NOT NULL DEFAULT gen_random_uuid(), run_id uuid NOT NULL, step_index integer NOT NULL, tool_name text NOT NULL, tool_input jsonb NOT NULL DEFAULT '{}'::jsonb, tool_output jsonb NULLABLE, status text NOT NULL DEFAULT 'success'::text, executed_by text NOT NULL DEFAULT 'ai'::text, executed_at timestamp with time zone NOT NULL DEFAULT now(). Relacionamentos FK: run_id → public.ai_agent_runs(id).

| propriedade | valor |
|---|---|
| tipo | table |
| owner | postgres |
| RLS habilitado | sim |
| RLS forçado (owner) | não |
| policies | 1 |
| realtime (publication) | não |
| replica identity | default |
| vem de extensão | não |


## Colunas

| # | coluna | tipo | nullable | default | identity/generated | comentário |
|---|---|---|---|---|---|---|
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  | Coluna id da tabela public.ai_agent_actions. Tipo PostgreSQL: uuid. Participa da chave primária. Não aceita NULL. Valor padrão: gen_random_uuid(). |
| 2 | `run_id` | `uuid` | não |  |  | Coluna run_id da tabela public.ai_agent_actions. Tipo PostgreSQL: uuid. Não aceita NULL. Referência FK: public.ai_agent_runs(id). |
| 3 | `step_index` | `integer` | não |  |  | Coluna step_index da tabela public.ai_agent_actions. Tipo PostgreSQL: integer. Não aceita NULL. |
| 4 | `tool_name` | `text` | não |  |  | Coluna tool_name da tabela public.ai_agent_actions. Tipo PostgreSQL: text. Não aceita NULL. |
| 5 | `tool_input` | `jsonb` | não | `'{}'::jsonb` |  | Coluna tool_input da tabela public.ai_agent_actions. Tipo PostgreSQL: jsonb. Não aceita NULL. Valor padrão: '{}'::jsonb. |
| 6 | `tool_output` | `jsonb` | sim |  |  | Coluna tool_output da tabela public.ai_agent_actions. Tipo PostgreSQL: jsonb. Aceita NULL. |
| 7 | `status` | `text` | não | `'success'::text` |  | Coluna status da tabela public.ai_agent_actions. Tipo PostgreSQL: text. Não aceita NULL. Valor padrão: 'success'::text. Validação CHECK: CHECK (status = ANY (ARRAY['success'::text, 'error'::text, 'pending_approval'::text, 'skipped'::text, 'executing'::text])). |
| 8 | `executed_by` | `text` | não | `'ai'::text` |  | Coluna executed_by da tabela public.ai_agent_actions. Tipo PostgreSQL: text. Não aceita NULL. Valor padrão: 'ai'::text. Validação CHECK: CHECK (executed_by = ANY (ARRAY['ai'::text, 'user'::text, 'system'::text])). |
| 9 | `executed_at` | `timestamp with time zone` | não | `now()` |  | Coluna executed_at da tabela public.ai_agent_actions. Tipo PostgreSQL: timestamp with time zone. Não aceita NULL. Valor padrão: now(). |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| ai_agent_actions_executed_by_check | CHECK | `CHECK (executed_by = ANY (ARRAY['ai'::text, 'user'::text, 'system'::text]))` |  |  | sim |
| ai_agent_actions_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| ai_agent_actions_run_id_fkey | FOREIGN KEY | `FOREIGN KEY (run_id) REFERENCES ai_agent_runs(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |
| ai_agent_actions_status_check | CHECK | `CHECK (status = ANY (ARRAY['success'::text, 'error'::text, 'pending_approval'::text, 'skipped'::text, 'executing'::text]))` |  |  | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| ai_agent_actions_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX ai_agent_actions_pkey ON public.ai_agent_actions USING btree (id)` |
| idx_ai_agent_actions_run | btree | run_id, step_index | não | sim |  | `CREATE INDEX idx_ai_agent_actions_run ON public.ai_agent_actions USING btree (run_id, step_index)` |


## Policies (RLS)

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

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
