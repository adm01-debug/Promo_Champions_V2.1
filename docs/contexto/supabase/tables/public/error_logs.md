# public.error_logs

> Tabela public.error_logs. Estrutura registrada no catálogo do PostgreSQL: id uuid NOT NULL DEFAULT gen_random_uuid(), message text NOT NULL, stack_trace text NULLABLE, severity text NOT NULL DEFAULT 'medium'::text, category text NOT NULL DEFAULT 'unknown'::text, component text NULLABLE, metadata jsonb NULLABLE DEFAULT '{}'::jsonb, url text NULLABLE, user_agent text NULLABLE, user_id uuid NULLABLE DEFAULT auth.uid(), created_at timestamp with time zone NOT NULL DEFAULT now().

| propriedade | valor |
|---|---|
| tipo | table |
| owner | postgres |
| RLS habilitado | sim |
| RLS forçado (owner) | não |
| policies | 4 |
| realtime (publication) | não |
| replica identity | default |
| vem de extensão | não |
| usada por views | public.v_platform_slo |


## Colunas

| # | coluna | tipo | nullable | default | identity/generated | comentário |
|---|---|---|---|---|---|---|
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  | Coluna id da tabela public.error_logs. Tipo PostgreSQL: uuid. Participa da chave primária. Não aceita NULL. Valor padrão: gen_random_uuid(). |
| 2 | `message` | `text` | não |  |  | Coluna message da tabela public.error_logs. Tipo PostgreSQL: text. Não aceita NULL. |
| 3 | `stack_trace` | `text` | sim |  |  | Coluna stack_trace da tabela public.error_logs. Tipo PostgreSQL: text. Aceita NULL. |
| 4 | `severity` | `text` | não | `'medium'::text` |  | Coluna severity da tabela public.error_logs. Tipo PostgreSQL: text. Não aceita NULL. Valor padrão: 'medium'::text. |
| 5 | `category` | `text` | não | `'unknown'::text` |  | Coluna category da tabela public.error_logs. Tipo PostgreSQL: text. Não aceita NULL. Valor padrão: 'unknown'::text. |
| 6 | `component` | `text` | sim |  |  | Coluna component da tabela public.error_logs. Tipo PostgreSQL: text. Aceita NULL. |
| 7 | `metadata` | `jsonb` | sim | `'{}'::jsonb` |  | Coluna metadata da tabela public.error_logs. Tipo PostgreSQL: jsonb. Aceita NULL. Valor padrão: '{}'::jsonb. |
| 8 | `url` | `text` | sim |  |  | Coluna url da tabela public.error_logs. Tipo PostgreSQL: text. Aceita NULL. |
| 9 | `user_agent` | `text` | sim |  |  | Coluna user_agent da tabela public.error_logs. Tipo PostgreSQL: text. Aceita NULL. |
| 10 | `user_id` | `uuid` | sim | `auth.uid()` |  | Coluna user_id da tabela public.error_logs. Tipo PostgreSQL: uuid. Aceita NULL. Valor padrão: auth.uid(). |
| 11 | `created_at` | `timestamp with time zone` | não | `now()` |  | Coluna created_at da tabela public.error_logs. Tipo PostgreSQL: timestamp with time zone. Não aceita NULL. Valor padrão: now(). |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| error_logs_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| error_logs_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX error_logs_pkey ON public.error_logs USING btree (id)` |
| idx_error_logs_created | btree | created_at | não | sim |  | `CREATE INDEX idx_error_logs_created ON public.error_logs USING btree (created_at DESC)` |
| idx_error_logs_severity_created_at | btree | severity, created_at | não | sim |  | `CREATE INDEX idx_error_logs_severity_created_at ON public.error_logs USING btree (severity, created_at DESC)` |
| idx_error_logs_user_created | btree | user_id, created_at | não | sim |  | `CREATE INDEX idx_error_logs_user_created ON public.error_logs USING btree (user_id, created_at DESC)` |


## Policies (RLS)

### `Admins can view error logs`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `is_admin_or_manager(auth.uid())` |
| WITH CHECK |  |

### `Only admins can view error logs`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `has_role(auth.uid(), 'admin'::app_role)` |
| WITH CHECK |  |

### `anon can insert error logs`

| campo | valor |
|---|---|
| comando | INSERT |
| tipo | PERMISSIVE |
| roles | anon |
| USING |  |
| WITH CHECK | `((user_id IS NULL) OR (user_id = auth.uid()))` |

### `authenticated can insert error logs`

| campo | valor |
|---|---|
| comando | INSERT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING |  |
| WITH CHECK | `((user_id IS NULL) OR (user_id = auth.uid()))` |


## Triggers

_nenhum_


## Grants

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
