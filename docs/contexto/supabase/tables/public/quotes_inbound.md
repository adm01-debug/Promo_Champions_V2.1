# public.quotes_inbound

> Tabela public.quotes_inbound. Estrutura registrada no catálogo do PostgreSQL: id uuid NOT NULL DEFAULT gen_random_uuid(), quote_id uuid NOT NULL, quote_number text NULLABLE, status text NULLABLE, client_id text NULLABLE, client_name text NULLABLE, total numeric(14,2) NULLABLE, seller_email text NULLABLE, source text NOT NULL DEFAULT 'promogifts'::text, source_updated_at timestamp with time zone NULLABLE, last_event text NULLABLE, last_correlation_key text NULLABLE, raw_payload jsonb NOT NULL DEFAULT '{}'::jsonb, received_at timestamp with time zone NOT NULL DEFAULT now(), created_at timestamp with time zone NOT NULL DEFAULT now(), updated_at timestamp with time zone NOT NULL DEFAULT now(), event_at timestamp with time zone NULLABLE.

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
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  | Coluna id da tabela public.quotes_inbound. Tipo PostgreSQL: uuid. Participa da chave primária. Não aceita NULL. Valor padrão: gen_random_uuid(). |
| 2 | `quote_id` | `uuid` | não |  |  | Coluna quote_id da tabela public.quotes_inbound. Tipo PostgreSQL: uuid. Não aceita NULL. |
| 3 | `quote_number` | `text` | sim |  |  | Coluna quote_number da tabela public.quotes_inbound. Tipo PostgreSQL: text. Aceita NULL. Validação CHECK: CHECK (quote_number IS NULL OR char_length(quote_number) <= 128). |
| 4 | `status` | `text` | sim |  |  | Coluna status da tabela public.quotes_inbound. Tipo PostgreSQL: text. Aceita NULL. Validação CHECK: CHECK (status IS NULL OR (status = ANY (ARRAY['draft'::text, 'pending'::text, 'sent'::text, 'approved'::text, 'rejected'::text, 'expired'::text, 'converted'::text, 'cancelled'::text, 'won'::text, 'lost'::text, 'open'::text, 'created'::text, 'updated'::text]))). |
| 5 | `client_id` | `text` | sim |  |  | Coluna client_id da tabela public.quotes_inbound. Tipo PostgreSQL: text. Aceita NULL. |
| 6 | `client_name` | `text` | sim |  |  | Coluna client_name da tabela public.quotes_inbound. Tipo PostgreSQL: text. Aceita NULL. Validação CHECK: CHECK (client_name IS NULL OR char_length(client_name) <= 512). |
| 7 | `total` | `numeric(14,2)` | sim |  |  | Coluna total da tabela public.quotes_inbound. Tipo PostgreSQL: numeric(14,2). Aceita NULL. |
| 8 | `seller_email` | `text` | sim |  |  | Coluna seller_email da tabela public.quotes_inbound. Tipo PostgreSQL: text. Aceita NULL. Validação CHECK: CHECK (seller_email IS NULL OR seller_email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'::text). |
| 9 | `source` | `text` | não | `'promogifts'::text` |  | Coluna source da tabela public.quotes_inbound. Tipo PostgreSQL: text. Não aceita NULL. Valor padrão: 'promogifts'::text. Validação CHECK: CHECK (source = ANY (ARRAY['gift_store'::text, 'bitrix24'::text, 'manual'::text, 'api'::text, 'webhook'::text, 'promogifts'::text])). |
| 10 | `source_updated_at` | `timestamp with time zone` | sim |  |  | Coluna source_updated_at da tabela public.quotes_inbound. Tipo PostgreSQL: timestamp with time zone. Aceita NULL. |
| 11 | `last_event` | `text` | sim |  |  | Coluna last_event da tabela public.quotes_inbound. Tipo PostgreSQL: text. Aceita NULL. |
| 12 | `last_correlation_key` | `text` | sim |  |  | Coluna last_correlation_key da tabela public.quotes_inbound. Tipo PostgreSQL: text. Aceita NULL. |
| 13 | `raw_payload` | `jsonb` | não | `'{}'::jsonb` |  | Coluna raw_payload da tabela public.quotes_inbound. Tipo PostgreSQL: jsonb. Não aceita NULL. Valor padrão: '{}'::jsonb. Validação CHECK: CHECK (pg_column_size(raw_payload) <= 262144). |
| 14 | `received_at` | `timestamp with time zone` | não | `now()` |  | Coluna received_at da tabela public.quotes_inbound. Tipo PostgreSQL: timestamp with time zone. Não aceita NULL. Valor padrão: now(). |
| 15 | `created_at` | `timestamp with time zone` | não | `now()` |  | Coluna created_at da tabela public.quotes_inbound. Tipo PostgreSQL: timestamp with time zone. Não aceita NULL. Valor padrão: now(). |
| 16 | `updated_at` | `timestamp with time zone` | não | `now()` |  | Coluna updated_at da tabela public.quotes_inbound. Tipo PostgreSQL: timestamp with time zone. Não aceita NULL. Valor padrão: now(). |
| 17 | `event_at` | `timestamp with time zone` | sim |  |  | Coluna event_at da tabela public.quotes_inbound. Tipo PostgreSQL: timestamp with time zone. Aceita NULL. |


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

| role | privilégios |
|---|---|
| anon | DELETE, REFERENCES, SELECT, TRIGGER |
| authenticated | DELETE, REFERENCES, SELECT, TRIGGER |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
