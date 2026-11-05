# public.rate_limit_logs

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
| usada por views | public.v_rate_limit_blocked_sellers |


## Colunas

| # | coluna | tipo | nullable | default | identity/generated | comentário |
|---|---|---|---|---|---|---|
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  |  |
| 2 | `identifier` | `text` | não |  |  |  |
| 3 | `identifier_type` | `text` | não | `'ip'::text` |  |  |
| 4 | `action` | `text` | não |  |  |  |
| 5 | `request_count` | `integer` | sim | `1` |  |  |
| 6 | `window_start` | `timestamp with time zone` | sim | `now()` |  |  |
| 7 | `window_end` | `timestamp with time zone` | sim |  |  |  |
| 8 | `blocked` | `boolean` | sim | `false` |  |  |
| 9 | `created_at` | `timestamp with time zone` | sim | `now()` |  |  |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| rate_limit_logs_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| idx_rate_limit_identifier | btree | identifier, action | não | sim |  | `CREATE INDEX idx_rate_limit_identifier ON public.rate_limit_logs USING btree (identifier, action)` |
| idx_rate_limit_window | btree | window_start, window_end | não | sim |  | `CREATE INDEX idx_rate_limit_window ON public.rate_limit_logs USING btree (window_start, window_end)` |
| rate_limit_logs_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX rate_limit_logs_pkey ON public.rate_limit_logs USING btree (id)` |


## Policies (RLS)

### `Admins can read rate_limit_logs`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `is_admin_or_manager(auth.uid())` |
| WITH CHECK |  |

### `Admins can view rate_limit_logs`

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

_nenhum_
