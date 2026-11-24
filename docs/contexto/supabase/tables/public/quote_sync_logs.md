# public.quote_sync_logs

> Tabela public.quote_sync_logs. Estrutura registrada no catálogo do PostgreSQL: id uuid NOT NULL DEFAULT gen_random_uuid(), external_quote_id text NULLABLE, quote_number text NULLABLE, action text NOT NULL, status text NOT NULL DEFAULT 'success'::text, details jsonb NULLABLE, error_message text NULLABLE, created_at timestamp with time zone NOT NULL DEFAULT now(), source text NULLABLE DEFAULT 'gift_store'::text.

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
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  | Coluna id da tabela public.quote_sync_logs. Tipo PostgreSQL: uuid. Participa da chave primária. Não aceita NULL. Valor padrão: gen_random_uuid(). |
| 2 | `external_quote_id` | `text` | sim |  |  | Coluna external_quote_id da tabela public.quote_sync_logs. Tipo PostgreSQL: text. Aceita NULL. |
| 3 | `quote_number` | `text` | sim |  |  | Coluna quote_number da tabela public.quote_sync_logs. Tipo PostgreSQL: text. Aceita NULL. |
| 4 | `action` | `text` | não |  |  | Coluna action da tabela public.quote_sync_logs. Tipo PostgreSQL: text. Não aceita NULL. |
| 5 | `status` | `text` | não | `'success'::text` |  | Coluna status da tabela public.quote_sync_logs. Tipo PostgreSQL: text. Não aceita NULL. Valor padrão: 'success'::text. |
| 6 | `details` | `jsonb` | sim |  |  | Coluna details da tabela public.quote_sync_logs. Tipo PostgreSQL: jsonb. Aceita NULL. |
| 7 | `error_message` | `text` | sim |  |  | Coluna error_message da tabela public.quote_sync_logs. Tipo PostgreSQL: text. Aceita NULL. |
| 8 | `created_at` | `timestamp with time zone` | não | `now()` |  | Coluna created_at da tabela public.quote_sync_logs. Tipo PostgreSQL: timestamp with time zone. Não aceita NULL. Valor padrão: now(). |
| 9 | `source` | `text` | sim | `'gift_store'::text` |  | Coluna source da tabela public.quote_sync_logs. Tipo PostgreSQL: text. Aceita NULL. Valor padrão: 'gift_store'::text. |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| quote_sync_logs_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| idx_quote_sync_logs_created_at | btree | created_at | não | sim |  | `CREATE INDEX idx_quote_sync_logs_created_at ON public.quote_sync_logs USING btree (created_at DESC)` |
| idx_quote_sync_logs_external_id | btree | external_quote_id | não | sim |  | `CREATE INDEX idx_quote_sync_logs_external_id ON public.quote_sync_logs USING btree (external_quote_id)` |
| idx_quote_sync_logs_source | btree | source | não | sim |  | `CREATE INDEX idx_quote_sync_logs_source ON public.quote_sync_logs USING btree (source)` |
| quote_sync_logs_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX quote_sync_logs_pkey ON public.quote_sync_logs USING btree (id)` |


## Policies (RLS)

### `Admins can insert quote_sync_logs`

| campo | valor |
|---|---|
| comando | INSERT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING |  |
| WITH CHECK | `is_admin_or_manager(auth.uid())` |

### `Admins can view quote sync logs`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `has_role(auth.uid(), 'admin'::app_role)` |
| WITH CHECK |  |

### `Admins can view sync logs`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | public |
| USING | `is_admin_or_manager(auth.uid())` |
| WITH CHECK |  |


## Triggers

_nenhum_


## Grants

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
