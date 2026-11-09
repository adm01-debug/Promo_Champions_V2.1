# public.quote_sync_inbound_log

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
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  |  |
| 2 | `correlation_key` | `text` | sim |  |  |  |
| 3 | `event` | `text` | sim |  |  |  |
| 4 | `status` | `text` | não |  |  |  |
| 5 | `http_status` | `integer` | não |  |  |  |
| 6 | `error_message` | `text` | sim |  |  |  |
| 7 | `external_quote_id` | `text` | sim |  |  |  |
| 8 | `quote_id` | `uuid` | sim |  |  |  |
| 9 | `payload` | `jsonb` | não | `'{}'::jsonb` |  |  |
| 10 | `source` | `text` | não | `'v4'::text` |  |  |
| 11 | `received_at` | `timestamp with time zone` | não | `now()` |  |  |
| 12 | `created_at` | `timestamp with time zone` | não | `now()` |  |  |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| chk_qs_inbound_log_http_status_range | CHECK | `CHECK (http_status >= 100 AND http_status <= 599)` |  |  | sim |
| chk_qs_inbound_log_payload_size | CHECK | `CHECK (pg_column_size(payload) <= 262144)` |  |  | sim |
| chk_qs_inbound_log_source_allowed | CHECK | `CHECK (source = ANY (ARRAY['gift_store'::text, 'promogifts'::text, 'bitrix24'::text, 'manual'::text, 'api'::text, 'webhook'::text, 'n8n'::text, 'v4'::text]))` |  |  | sim |
| chk_qs_inbound_log_status_allowed | CHECK | `CHECK (status = ANY (ARRAY['accepted'::text, 'duplicate'::text, 'rejected'::text, 'error'::text, 'ignored'::text, 'processed'::text, 'method_not_allowed'::text, 'unauthorized'::text, 'not_found'::text, 'bad_request'::text]))` |  |  | sim |
| quote_sync_inbound_log_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| idx_qs_inbound_log_correlation | btree | correlation_key | não | sim |  | `CREATE INDEX idx_qs_inbound_log_correlation ON public.quote_sync_inbound_log USING btree (correlation_key)` |
| idx_qs_inbound_log_received_at | btree | received_at | não | sim |  | `CREATE INDEX idx_qs_inbound_log_received_at ON public.quote_sync_inbound_log USING btree (received_at DESC)` |
| idx_qs_inbound_log_source_status_time | btree | source, status, received_at | não | sim |  | `CREATE INDEX idx_qs_inbound_log_source_status_time ON public.quote_sync_inbound_log USING btree (source, status, received_at DESC)` |
| idx_qs_inbound_log_status | btree | status | não | sim |  | `CREATE INDEX idx_qs_inbound_log_status ON public.quote_sync_inbound_log USING btree (status)` |
| quote_sync_inbound_log_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX quote_sync_inbound_log_pkey ON public.quote_sync_inbound_log USING btree (id)` |


## Policies (RLS)

### `Admins can read quote sync inbound log`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `has_role(auth.uid(), 'admin'::app_role)` |
| WITH CHECK |  |


## Triggers

_nenhum_


## Grants

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
