# public.quote_sync_logs

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
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  |  |
| 2 | `external_quote_id` | `text` | sim |  |  |  |
| 3 | `quote_number` | `text` | sim |  |  |  |
| 4 | `action` | `text` | não |  |  |  |
| 5 | `status` | `text` | não | `'success'::text` |  |  |
| 6 | `details` | `jsonb` | sim |  |  |  |
| 7 | `error_message` | `text` | sim |  |  |  |
| 8 | `created_at` | `timestamp with time zone` | não | `now()` |  |  |
| 9 | `source` | `text` | sim | `'gift_store'::text` |  |  |


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

_nenhum_
