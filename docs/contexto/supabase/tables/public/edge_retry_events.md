# public.edge_retry_events

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
| 2 | `function_name` | `text` | não |  |  |  |
| 3 | `operation` | `text` | não |  |  |  |
| 4 | `attempt` | `integer` | não |  |  |  |
| 5 | `total_attempts` | `integer` | sim |  |  |  |
| 6 | `outcome` | `text` | não |  |  |  |
| 7 | `status_code` | `integer` | sim |  |  |  |
| 8 | `error_name` | `text` | sim |  |  |  |
| 9 | `error_message` | `text` | sim |  |  |  |
| 10 | `delay_ms` | `integer` | sim |  |  |  |
| 11 | `request_id` | `text` | sim |  |  |  |
| 12 | `created_at` | `timestamp with time zone` | não | `now()` |  |  |


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
