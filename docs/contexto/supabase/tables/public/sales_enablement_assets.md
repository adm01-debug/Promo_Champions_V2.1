# public.sales_enablement_assets

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
| 2 | `title` | `text` | não |  |  |  |
| 3 | `description` | `text` | sim |  |  |  |
| 4 | `category` | `text` | não | `'general'::text` |  |  |
| 5 | `asset_type` | `text` | não | `'document'::text` |  |  |
| 6 | `file_url` | `text` | sim |  |  |  |
| 7 | `thumbnail_url` | `text` | sim |  |  |  |
| 8 | `tags` | `text[]` | sim | `ARRAY[]::text[]` |  |  |
| 9 | `funnel_stage` | `text` | sim |  |  |  |
| 10 | `is_active` | `boolean` | não | `true` |  |  |
| 11 | `view_count` | `integer` | não | `0` |  |  |
| 12 | `created_by` | `uuid` | sim |  |  |  |
| 13 | `created_at` | `timestamp with time zone` | não | `now()` |  |  |
| 14 | `updated_at` | `timestamp with time zone` | não | `now()` |  |  |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| sales_enablement_assets_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |


## Referenciada por (FKs de outras tabelas)

| tabela | constraint | colunas | on delete |
|---|---|---|---|
| public.asset_usage_logs | asset_usage_logs_asset_id_fkey | asset_id | CASCADE |
| public.call_intelligence_triggers | call_intelligence_triggers_target_asset_id_fkey | target_asset_id | SET NULL |
| public.playbook_items | playbook_items_asset_id_fkey | asset_id | SET NULL |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| idx_sea_category | btree | category | não | sim | `(is_active = true)` | `CREATE INDEX idx_sea_category ON public.sales_enablement_assets USING btree (category) WHERE (is_active = true)` |
| idx_sea_funnel_stage | btree | funnel_stage | não | sim | `(is_active = true)` | `CREATE INDEX idx_sea_funnel_stage ON public.sales_enablement_assets USING btree (funnel_stage) WHERE (is_active = true)` |
| sales_enablement_assets_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX sales_enablement_assets_pkey ON public.sales_enablement_assets USING btree (id)` |


## Policies (RLS)

### `Authenticated users can view active assets`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `((is_active = true) OR is_admin_or_manager(auth.uid()))` |
| WITH CHECK |  |

### `Managers can manage assets`

| campo | valor |
|---|---|
| comando | ALL |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `is_admin_or_manager(auth.uid())` |
| WITH CHECK | `is_admin_or_manager(auth.uid())` |


## Triggers

| nome | timing | eventos | nível | status | função |
|---|---|---|---|---|---|
| on_asset_ai_activation | AFTER | UPDATE | ROW | enabled | public.notify_asset_ai_status |
| set_updated_at | BEFORE | UPDATE | ROW | enabled | public.handle_updated_at |
| trg_sea_updated_at | BEFORE | UPDATE | ROW | enabled | public.update_updated_at_column |


## Grants

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
