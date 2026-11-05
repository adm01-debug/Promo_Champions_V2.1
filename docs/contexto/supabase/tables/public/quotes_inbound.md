# public.quotes_inbound

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
| 2 | `quote_id` | `uuid` | não |  |  |  |
| 3 | `quote_number` | `text` | sim |  |  |  |
| 4 | `status` | `text` | sim |  |  |  |
| 5 | `client_id` | `text` | sim |  |  |  |
| 6 | `client_name` | `text` | sim |  |  |  |
| 7 | `total` | `numeric(14,2)` | sim |  |  |  |
| 8 | `seller_email` | `text` | sim |  |  |  |
| 9 | `source` | `text` | não | `'promogifts'::text` |  |  |
| 10 | `source_updated_at` | `timestamp with time zone` | sim |  |  |  |
| 11 | `last_event` | `text` | sim |  |  |  |
| 12 | `last_correlation_key` | `text` | sim |  |  |  |
| 13 | `raw_payload` | `jsonb` | não | `'{}'::jsonb` |  |  |
| 14 | `received_at` | `timestamp with time zone` | não | `now()` |  |  |
| 15 | `created_at` | `timestamp with time zone` | não | `now()` |  |  |
| 16 | `updated_at` | `timestamp with time zone` | não | `now()` |  |  |
| 17 | `event_at` | `timestamp with time zone` | sim |  |  |  |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| chk_quotes_inbound_client_name_len | CHECK | `CHECK (client_name IS NULL OR char_length(client_name) <= 512)` |  |  | sim |
| chk_quotes_inbound_quote_number_len | CHECK | `CHECK (quote_number IS NULL OR char_length(quote_number) <= 128)` |  |  | sim |
| chk_quotes_inbound_raw_payload_size | CHECK | `CHECK (pg_column_size(raw_payload) <= 262144)` |  |  | sim |
| chk_quotes_inbound_seller_email_format | CHECK | `CHECK (seller_email IS NULL OR seller_email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'::text)` |  |  | sim |
| chk_quotes_inbound_source_allowed | CHECK | `CHECK (source = ANY (ARRAY['gift_store'::text, 'bitrix24'::text, 'manual'::text, 'api'::text, 'webhook'::text, 'promogifts'::text]))` |  |  | sim |
| chk_quotes_inbound_status_allowed | CHECK | `CHECK (status IS NULL OR (status = ANY (ARRAY['draft'::text, 'pending'::text, 'sent'::text, 'approved'::text, 'rejected'::text, 'expired'::text, 'converted'::text, 'cancelled'::text, 'won'::text, 'lost'::text, 'open'::text, 'created'::text, 'updated'::text])))` |  |  | sim |
| quotes_inbound_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| quotes_inbound_quote_id_key | UNIQUE | `UNIQUE (quote_id)` |  |  | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| idx_quotes_inbound_client_id | btree | client_id | não | sim |  | `CREATE INDEX idx_quotes_inbound_client_id ON public.quotes_inbound USING btree (client_id)` |
| idx_quotes_inbound_event_at | btree | event_at | não | sim |  | `CREATE INDEX idx_quotes_inbound_event_at ON public.quotes_inbound USING btree (event_at DESC NULLS LAST)` |
| idx_quotes_inbound_last_event | btree | last_event | não | sim | `(last_event IS NOT NULL)` | `CREATE INDEX idx_quotes_inbound_last_event ON public.quotes_inbound USING btree (last_event) WHERE (last_event IS NOT NULL)` |
| idx_quotes_inbound_received_at | btree | received_at | não | sim |  | `CREATE INDEX idx_quotes_inbound_received_at ON public.quotes_inbound USING btree (received_at DESC)` |
| idx_quotes_inbound_seller_email | btree | seller_email | não | sim | `(seller_email IS NOT NULL)` | `CREATE INDEX idx_quotes_inbound_seller_email ON public.quotes_inbound USING btree (seller_email) WHERE (seller_email IS NOT NULL)` |
| idx_quotes_inbound_source_status | btree | source, status | não | sim |  | `CREATE INDEX idx_quotes_inbound_source_status ON public.quotes_inbound USING btree (source, status)` |
| idx_quotes_inbound_status | btree | status | não | sim |  | `CREATE INDEX idx_quotes_inbound_status ON public.quotes_inbound USING btree (status)` |
| quotes_inbound_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX quotes_inbound_pkey ON public.quotes_inbound USING btree (id)` |
| quotes_inbound_quote_id_key | btree | quote_id | sim | sim |  | `CREATE UNIQUE INDEX quotes_inbound_quote_id_key ON public.quotes_inbound USING btree (quote_id)` |


## Policies (RLS)

### `Admins e managers podem ler quotes_inbound`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `(has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` |
| WITH CHECK |  |

### `Vendedores podem ver seus próprios orçamentos inbound`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `(seller_email = ( SELECT salespeople.email    FROM salespeople   WHERE ((salespeople.auth_user_id = auth.uid()) AND (salespeople.is_active = true))  LIMIT 1))` |
| WITH CHECK |  |


## Triggers

| nome | timing | eventos | nível | status | função |
|---|---|---|---|---|---|
| trg_auto_map_inbound_seller | AFTER | INSERT OR UPDATE | ROW | enabled | public.fn_auto_map_inbound_seller |
| trg_normalize_quotes_inbound | BEFORE | INSERT OR UPDATE | ROW | enabled | public.fn_normalize_quotes_inbound |
| trg_quotes_inbound_ordering_guard | BEFORE | INSERT OR UPDATE | ROW | enabled | public.fn_quotes_inbound_ordering_guard |
| trg_quotes_inbound_updated_at | BEFORE | UPDATE | ROW | enabled | public.set_quotes_inbound_updated_at |


## Grants

_nenhum_
