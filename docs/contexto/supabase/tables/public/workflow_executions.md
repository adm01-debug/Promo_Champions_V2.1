# public.workflow_executions

> Execuções individuais de workflows, incluindo estado, entrada, etapas e duração.

| propriedade | valor |
|---|---|
| tipo | table |
| owner | postgres |
| RLS habilitado | sim |
| RLS forçado (owner) | não |
| policies | 3 |
| realtime (publication) | não |
| replica identity | default |
| vem de extensão | não |


## Colunas

| # | coluna | tipo | nullable | default | identity/generated | comentário |
|---|---|---|---|---|---|---|
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  | Identificador único da execução. |
| 2 | `workflow_id` | `uuid` | não |  |  | Workflow executado. |
| 3 | `triggered_by` | `uuid` | sim |  |  | Usuário que iniciou a execução, quando identificado. |
| 4 | `status` | `text` | não | `'pending'::text` |  | Estado da execução, conforme utilizado pela aplicação. |
| 5 | `input_payload` | `jsonb` | sim | `'{}'::jsonb` |  | Dados de entrada da execução em formato JSON. |
| 6 | `step_log` | `jsonb` | não | `'[]'::jsonb` |  | Registro das etapas da execução em formato JSON. |
| 7 | `error_message` | `text` | sim |  |  | Mensagem de erro, quando a execução falhou. |
| 8 | `duration_ms` | `integer` | sim |  |  | Duração da execução em milissegundos. |
| 9 | `started_at` | `timestamp with time zone` | não | `now()` |  | Data e hora de início da execução. |
| 10 | `finished_at` | `timestamp with time zone` | sim |  |  | Data e hora de término da execução. |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| workflow_executions_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| workflow_executions_workflow_id_fkey | FOREIGN KEY | `FOREIGN KEY (workflow_id) REFERENCES workflows(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| idx_wf_exec_status | btree | status | não | sim |  | `CREATE INDEX idx_wf_exec_status ON public.workflow_executions USING btree (status)` |
| idx_wf_exec_workflow | btree | workflow_id, started_at | não | sim |  | `CREATE INDEX idx_wf_exec_workflow ON public.workflow_executions USING btree (workflow_id, started_at DESC)` |
| workflow_executions_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX workflow_executions_pkey ON public.workflow_executions USING btree (id)` |


## Policies (RLS)

### `Admins update executions`

| campo | valor |
|---|---|
| comando | UPDATE |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `(has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` |
| WITH CHECK |  |

### `Admins view all executions`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `(has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role) OR (triggered_by = auth.uid()))` |
| WITH CHECK |  |

### `Users insert own executions`

| campo | valor |
|---|---|
| comando | INSERT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING |  |
| WITH CHECK | `((triggered_by = auth.uid()) OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` |


## Triggers

_nenhum_


## Grants

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
