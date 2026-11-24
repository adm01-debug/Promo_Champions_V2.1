# public.webhook_inbound_log

> Tabela public.webhook_inbound_log. Estrutura registrada no catálogo do PostgreSQL: id uuid NOT NULL DEFAULT gen_random_uuid(), received_at timestamp with time zone NOT NULL DEFAULT now(), source text NOT NULL DEFAULT 'promogifts'::text, event text NULLABLE, correlation_key text NULLABLE, outcome text NOT NULL, http_status integer NOT NULL, request_id text NULLABLE, error_message text NULLABLE, payload_size integer NULLABLE.

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
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  | Coluna id da tabela public.webhook_inbound_log. Tipo PostgreSQL: uuid. Participa da chave primária. Não aceita NULL. Valor padrão: gen_random_uuid(). |
| 2 | `received_at` | `timestamp with time zone` | não | `now()` |  | Coluna received_at da tabela public.webhook_inbound_log. Tipo PostgreSQL: timestamp with time zone. Não aceita NULL. Valor padrão: now(). |
| 3 | `source` | `text` | não | `'promogifts'::text` |  | Coluna source da tabela public.webhook_inbound_log. Tipo PostgreSQL: text. Não aceita NULL. Valor padrão: 'promogifts'::text. |
| 4 | `event` | `text` | sim |  |  | Coluna event da tabela public.webhook_inbound_log. Tipo PostgreSQL: text. Aceita NULL. |
| 5 | `correlation_key` | `text` | sim |  |  | Coluna correlation_key da tabela public.webhook_inbound_log. Tipo PostgreSQL: text. Aceita NULL. |
| 6 | `outcome` | `text` | não |  |  | Coluna outcome da tabela public.webhook_inbound_log. Tipo PostgreSQL: text. Não aceita NULL. Validação CHECK: CHECK (outcome = ANY (ARRAY['accepted'::text, 'duplicate'::text, 'rejected'::text, 'error'::text, 'ignored'::text])). |
| 7 | `http_status` | `integer` | não |  |  | Coluna http_status da tabela public.webhook_inbound_log. Tipo PostgreSQL: integer. Não aceita NULL. Validação CHECK: CHECK (http_status >= 100 AND http_status <= 599). |
| 8 | `request_id` | `text` | sim |  |  | Coluna request_id da tabela public.webhook_inbound_log. Tipo PostgreSQL: text. Aceita NULL. |
| 9 | `error_message` | `text` | sim |  |  | Coluna error_message da tabela public.webhook_inbound_log. Tipo PostgreSQL: text. Aceita NULL. |
| 10 | `payload_size` | `integer` | sim |  |  | Coluna payload_size da tabela public.webhook_inbound_log. Tipo PostgreSQL: integer. Aceita NULL. Validação CHECK: CHECK (payload_size IS NULL OR payload_size >= 0). |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| chk_webhook_inbound_log_http_status_range | CHECK | `CHECK (http_status >= 100 AND http_status <= 599)` |  |  | sim |
| chk_webhook_inbound_log_outcome_allowed | CHECK | `CHECK (outcome = ANY (ARRAY['accepted'::text, 'duplicate'::text, 'rejected'::text, 'error'::text, 'ignored'::text]))` |  |  | sim |
| chk_webhook_inbound_log_payload_size_non_negative | CHECK | `CHECK (payload_size IS NULL OR payload_size >= 0)` |  |  | sim |
| webhook_inbound_log_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| idx_webhook_inbound_log_correlation_key | btree | correlation_key | não | sim | `(correlation_key IS NOT NULL)` | `CREATE INDEX idx_webhook_inbound_log_correlation_key ON public.webhook_inbound_log USING btree (correlation_key) WHERE (correlation_key IS NOT NULL)` |
| idx_webhook_inbound_log_received_at | btree | received_at | não | sim |  | `CREATE INDEX idx_webhook_inbound_log_received_at ON public.webhook_inbound_log USING btree (received_at DESC)` |
| idx_webhook_inbound_log_source_outcome_time | btree | source, outcome, received_at | não | sim |  | `CREATE INDEX idx_webhook_inbound_log_source_outcome_time ON public.webhook_inbound_log USING btree (source, outcome, received_at DESC)` |
| idx_webhook_inbound_log_source_received | btree | source, received_at | não | sim |  | `CREATE INDEX idx_webhook_inbound_log_source_received ON public.webhook_inbound_log USING btree (source, received_at DESC)` |
| webhook_inbound_log_outcome_idx | btree | outcome, received_at | não | sim |  | `CREATE INDEX webhook_inbound_log_outcome_idx ON public.webhook_inbound_log USING btree (outcome, received_at DESC)` |
| webhook_inbound_log_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX webhook_inbound_log_pkey ON public.webhook_inbound_log USING btree (id)` |


## Policies (RLS)

### `webhook_inbound_log_authenticated_read`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `true` |
| WITH CHECK |  |

### `webhook_inbound_log_service_all`

| campo | valor |
|---|---|
| comando | ALL |
| tipo | PERMISSIVE |
| roles | service_role |
| USING | `true` |
| WITH CHECK | `true` |


## Triggers

_nenhum_


## Grants

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
