# public.edge_retry_events

> Tabela public.edge_retry_events. Estrutura registrada no catálogo do PostgreSQL: id uuid NOT NULL DEFAULT gen_random_uuid(), function_name text NOT NULL, operation text NOT NULL, attempt integer NOT NULL, total_attempts integer NULLABLE, outcome text NOT NULL, status_code integer NULLABLE, error_name text NULLABLE, error_message text NULLABLE, delay_ms integer NULLABLE, request_id text NULLABLE, created_at timestamp with time zone NOT NULL DEFAULT now().

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
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  | Coluna id da tabela public.edge_retry_events. Tipo PostgreSQL: uuid. Participa da chave primária. Não aceita NULL. Valor padrão: gen_random_uuid(). |
| 2 | `function_name` | `text` | não |  |  | Coluna function_name da tabela public.edge_retry_events. Tipo PostgreSQL: text. Não aceita NULL. |
| 3 | `operation` | `text` | não |  |  | Coluna operation da tabela public.edge_retry_events. Tipo PostgreSQL: text. Não aceita NULL. |
| 4 | `attempt` | `integer` | não |  |  | Coluna attempt da tabela public.edge_retry_events. Tipo PostgreSQL: integer. Não aceita NULL. Validação CHECK: CHECK (attempt >= 1). |
| 5 | `total_attempts` | `integer` | sim |  |  | Coluna total_attempts da tabela public.edge_retry_events. Tipo PostgreSQL: integer. Aceita NULL. |
| 6 | `outcome` | `text` | não |  |  | Coluna outcome da tabela public.edge_retry_events. Tipo PostgreSQL: text. Não aceita NULL. Validação CHECK: CHECK (outcome = ANY (ARRAY['retry'::text, 'success_after_retry'::text, 'exhausted'::text, 'non_retryable'::text])). |
| 7 | `status_code` | `integer` | sim |  |  | Coluna status_code da tabela public.edge_retry_events. Tipo PostgreSQL: integer. Aceita NULL. |
| 8 | `error_name` | `text` | sim |  |  | Coluna error_name da tabela public.edge_retry_events. Tipo PostgreSQL: text. Aceita NULL. |
| 9 | `error_message` | `text` | sim |  |  | Coluna error_message da tabela public.edge_retry_events. Tipo PostgreSQL: text. Aceita NULL. |
| 10 | `delay_ms` | `integer` | sim |  |  | Coluna delay_ms da tabela public.edge_retry_events. Tipo PostgreSQL: integer. Aceita NULL. |
| 11 | `request_id` | `text` | sim |  |  | Coluna request_id da tabela public.edge_retry_events. Tipo PostgreSQL: text. Aceita NULL. |
| 12 | `created_at` | `timestamp with time zone` | não | `now()` |  | Coluna created_at da tabela public.edge_retry_events. Tipo PostgreSQL: timestamp with time zone. Não aceita NULL. Valor padrão: now(). |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| edge_retry_events_attempt_check | CHECK | `CHECK (attempt >= 1)` |  |  | sim |
| edge_retry_events_outcome_check | CHECK | `CHECK (outcome = ANY (ARRAY['retry'::text, 'success_after_retry'::text, 'exhausted'::text, 'non_retryable'::text]))` |  |  | sim |
| edge_retry_events_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| edge_retry_events_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX edge_retry_events_pkey ON public.edge_retry_events USING btree (id)` |
| idx_edge_retry_events_fn_created | btree | function_name, created_at | não | sim |  | `CREATE INDEX idx_edge_retry_events_fn_created ON public.edge_retry_events USING btree (function_name, created_at DESC)` |
| idx_edge_retry_events_outcome_created | btree | outcome, created_at | não | sim |  | `CREATE INDEX idx_edge_retry_events_outcome_created ON public.edge_retry_events USING btree (outcome, created_at DESC)` |


## Policies (RLS)

### `admins_can_read_edge_retry_events`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `has_role(auth.uid(), 'admin'::app_role)` |
| WITH CHECK |  |

### `service_role_can_insert_edge_retry_events`

| campo | valor |
|---|---|
| comando | INSERT |
| tipo | PERMISSIVE |
| roles | service_role |
| USING |  |
| WITH CHECK | `true` |


## Triggers

_nenhum_


## Grants

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
