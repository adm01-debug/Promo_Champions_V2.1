# public.asset_usage_logs

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
| 2 | `asset_id` | `uuid` | não |  |  |  |
| 3 | `salesperson_id` | `uuid` | sim |  |  |  |
| 4 | `user_id` | `uuid` | não |  |  |  |
| 5 | `action` | `text` | não | `'view'::text` |  |  |
| 6 | `deal_id` | `uuid` | sim |  |  |  |
| 7 | `metadata` | `jsonb` | sim | `'{}'::jsonb` |  |  |
| 8 | `created_at` | `timestamp with time zone` | não | `now()` |  |  |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| asset_usage_logs_asset_id_fkey | FOREIGN KEY | `FOREIGN KEY (asset_id) REFERENCES sales_enablement_assets(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |
| asset_usage_logs_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| asset_usage_logs_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX asset_usage_logs_pkey ON public.asset_usage_logs USING btree (id)` |
| idx_aul_asset | btree | asset_id, created_at | não | sim |  | `CREATE INDEX idx_aul_asset ON public.asset_usage_logs USING btree (asset_id, created_at DESC)` |
| idx_aul_user | btree | user_id, created_at | não | sim |  | `CREATE INDEX idx_aul_user ON public.asset_usage_logs USING btree (user_id, created_at DESC)` |


## Policies (RLS)

### `Users insert own usage logs`

| campo | valor |
|---|---|
| comando | INSERT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING |  |
| WITH CHECK | `(user_id = auth.uid())` |

### `Users see own logs, managers see all`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `((user_id = auth.uid()) OR is_admin_or_manager(auth.uid()))` |
| WITH CHECK |  |


## Triggers

| nome | timing | eventos | nível | status | função |
|---|---|---|---|---|---|
| on_asset_influence_boost | AFTER | INSERT | ROW | enabled | public.notify_asset_influence_boost |
| trg_asset_view_increment | AFTER | INSERT | ROW | enabled | public.increment_asset_view_count |


## Grants

_nenhum_
