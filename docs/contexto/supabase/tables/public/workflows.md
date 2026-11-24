# public.workflows

> Definições de workflows com gatilhos, nós e conexões de execução.

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
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  | Identificador único do workflow. |
| 2 | `name` | `text` | não |  |  | Nome do workflow. |
| 3 | `description` | `text` | sim |  |  | Descrição do workflow. |
| 4 | `trigger_type` | `text` | não | `'manual'::text` |  | Tipo de gatilho do workflow. |
| 5 | `trigger_config` | `jsonb` | não | `'{}'::jsonb` |  | Configuração do gatilho em JSON. |
| 6 | `nodes` | `jsonb` | não | `'[]'::jsonb` |  | Nós que compõem o fluxo, armazenados em JSON. |
| 7 | `edges` | `jsonb` | não | `'[]'::jsonb` |  | Conexões entre os nós do fluxo, armazenadas em JSON. |
| 8 | `is_active` | `boolean` | não | `false` |  | Indica se o workflow está habilitado. |
| 9 | `execution_count` | `integer` | não | `0` |  | Quantidade de execuções registradas para o workflow. |
| 10 | `last_executed_at` | `timestamp with time zone` | sim |  |  | Data e hora da execução mais recente. |
| 11 | `created_by` | `uuid` | sim |  |  | Usuário que criou o workflow, quando identificado. |
| 12 | `created_at` | `timestamp with time zone` | não | `now()` |  | Data e hora de criação do workflow. |
| 13 | `updated_at` | `timestamp with time zone` | não | `now()` |  | Data e hora da última atualização do workflow. |


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

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
