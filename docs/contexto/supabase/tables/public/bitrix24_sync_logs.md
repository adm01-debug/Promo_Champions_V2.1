# public.bitrix24_sync_logs

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
| 2 | `sync_type` | `text` | não | `'sync-all'::text` |  |  |
| 3 | `status` | `text` | não | `'success'::text` |  |  |
| 4 | `companies_from_bitrix` | `integer` | sim | `0` |  |  |
| 5 | `companies_to_bitrix` | `integer` | sim | `0` |  |  |
| 6 | `deals_from_bitrix` | `integer` | sim | `0` |  |  |
| 7 | `deals_to_bitrix` | `integer` | sim | `0` |  |  |
| 8 | `error_message` | `text` | sim |  |  |  |
| 9 | `duration_ms` | `integer` | sim |  |  |  |
| 10 | `triggered_by` | `text` | sim | `'manual'::text` |  |  |
| 11 | `created_at` | `timestamp with time zone` | não | `now()` |  |  |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| bitrix24_sync_logs_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| bitrix24_sync_logs_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX bitrix24_sync_logs_pkey ON public.bitrix24_sync_logs USING btree (id)` |
| idx_bitrix24_sync_logs_created_at | btree | created_at | não | sim |  | `CREATE INDEX idx_bitrix24_sync_logs_created_at ON public.bitrix24_sync_logs USING btree (created_at DESC)` |


## Policies (RLS)

### `Admins and managers can view sync logs`

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
