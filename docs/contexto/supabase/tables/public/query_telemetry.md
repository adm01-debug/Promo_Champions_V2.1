# public.query_telemetry

> Tabela public.query_telemetry. Estrutura registrada no catálogo do PostgreSQL: id uuid NOT NULL DEFAULT gen_random_uuid(), operation text NOT NULL DEFAULT 'select'::text, table_name text NULLABLE, rpc_name text NULLABLE, duration_ms integer NOT NULL DEFAULT 0, record_count integer NULLABLE, query_limit integer NULLABLE, query_offset integer NULLABLE, count_mode text NULLABLE, severity text NOT NULL DEFAULT 'normal'::text, error_message text NULLABLE, user_id uuid NULLABLE, created_at timestamp with time zone NOT NULL DEFAULT now().

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
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  | Coluna id da tabela public.query_telemetry. Tipo PostgreSQL: uuid. Participa da chave primária. Não aceita NULL. Valor padrão: gen_random_uuid(). |
| 2 | `operation` | `text` | não | `'select'::text` |  | Coluna operation da tabela public.query_telemetry. Tipo PostgreSQL: text. Não aceita NULL. Valor padrão: 'select'::text. |
| 3 | `table_name` | `text` | sim |  |  | Coluna table_name da tabela public.query_telemetry. Tipo PostgreSQL: text. Aceita NULL. |
| 4 | `rpc_name` | `text` | sim |  |  | Coluna rpc_name da tabela public.query_telemetry. Tipo PostgreSQL: text. Aceita NULL. |
| 5 | `duration_ms` | `integer` | não | `0` |  | Coluna duration_ms da tabela public.query_telemetry. Tipo PostgreSQL: integer. Não aceita NULL. Valor padrão: 0. |
| 6 | `record_count` | `integer` | sim |  |  | Coluna record_count da tabela public.query_telemetry. Tipo PostgreSQL: integer. Aceita NULL. |
| 7 | `query_limit` | `integer` | sim |  |  | Coluna query_limit da tabela public.query_telemetry. Tipo PostgreSQL: integer. Aceita NULL. |
| 8 | `query_offset` | `integer` | sim |  |  | Coluna query_offset da tabela public.query_telemetry. Tipo PostgreSQL: integer. Aceita NULL. |
| 9 | `count_mode` | `text` | sim |  |  | Coluna count_mode da tabela public.query_telemetry. Tipo PostgreSQL: text. Aceita NULL. |
| 10 | `severity` | `text` | não | `'normal'::text` |  | Coluna severity da tabela public.query_telemetry. Tipo PostgreSQL: text. Não aceita NULL. Valor padrão: 'normal'::text. |
| 11 | `error_message` | `text` | sim |  |  | Coluna error_message da tabela public.query_telemetry. Tipo PostgreSQL: text. Aceita NULL. |
| 12 | `user_id` | `uuid` | sim |  |  | Coluna user_id da tabela public.query_telemetry. Tipo PostgreSQL: uuid. Aceita NULL. |
| 13 | `created_at` | `timestamp with time zone` | não | `now()` |  | Coluna created_at da tabela public.query_telemetry. Tipo PostgreSQL: timestamp with time zone. Não aceita NULL. Valor padrão: now(). |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| query_telemetry_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| idx_query_telemetry_created_at | btree | created_at | não | sim |  | `CREATE INDEX idx_query_telemetry_created_at ON public.query_telemetry USING btree (created_at DESC)` |
| idx_query_telemetry_severity | btree | severity | não | sim |  | `CREATE INDEX idx_query_telemetry_severity ON public.query_telemetry USING btree (severity)` |
| idx_query_telemetry_table | btree | table_name | não | sim |  | `CREATE INDEX idx_query_telemetry_table ON public.query_telemetry USING btree (table_name)` |
| idx_query_telemetry_table_created | btree | table_name, created_at | não | sim |  | `CREATE INDEX idx_query_telemetry_table_created ON public.query_telemetry USING btree (table_name, created_at DESC)` |
| idx_query_telemetry_user_created | btree | user_id, created_at | não | sim |  | `CREATE INDEX idx_query_telemetry_user_created ON public.query_telemetry USING btree (user_id, created_at DESC)` |
| query_telemetry_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX query_telemetry_pkey ON public.query_telemetry USING btree (id)` |


## Policies (RLS)

### `Admins can delete telemetry`

| campo | valor |
|---|---|
| comando | DELETE |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `is_admin_or_manager(auth.uid())` |
| WITH CHECK |  |

### `Admins can view telemetry`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `is_admin_or_manager(auth.uid())` |
| WITH CHECK |  |

### `Authenticated users can insert own telemetry`

| campo | valor |
|---|---|
| comando | INSERT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING |  |
| WITH CHECK | `(auth.uid() IS NOT NULL)` |


## Triggers

_nenhum_


## Grants

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
