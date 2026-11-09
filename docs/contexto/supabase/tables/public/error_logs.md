# public.error_logs

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
| usada por views | public.v_platform_slo |


## Colunas

| # | coluna | tipo | nullable | default | identity/generated | comentário |
|---|---|---|---|---|---|---|
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  |  |
| 2 | `message` | `text` | não |  |  |  |
| 3 | `stack_trace` | `text` | sim |  |  |  |
| 4 | `severity` | `text` | não | `'medium'::text` |  |  |
| 5 | `category` | `text` | não | `'unknown'::text` |  |  |
| 6 | `component` | `text` | sim |  |  |  |
| 7 | `metadata` | `jsonb` | sim | `'{}'::jsonb` |  |  |
| 8 | `url` | `text` | sim |  |  |  |
| 9 | `user_agent` | `text` | sim |  |  |  |
| 10 | `user_id` | `uuid` | sim | `auth.uid()` |  |  |
| 11 | `created_at` | `timestamp with time zone` | não | `now()` |  |  |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| error_logs_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| error_logs_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX error_logs_pkey ON public.error_logs USING btree (id)` |
| idx_error_logs_created | btree | created_at | não | sim |  | `CREATE INDEX idx_error_logs_created ON public.error_logs USING btree (created_at DESC)` |
| idx_error_logs_created_at | btree | created_at | não | sim |  | `CREATE INDEX idx_error_logs_created_at ON public.error_logs USING btree (created_at DESC)` |
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


## Triggers

_nenhum_


## Grants

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
