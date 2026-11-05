# public.products

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
| usada por views | public.v_active_products |


## Colunas

| # | coluna | tipo | nullable | default | identity/generated | comentário |
|---|---|---|---|---|---|---|
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  |  |
| 2 | `name` | `text` | não |  |  |  |
| 3 | `category` | `text` | não | `'subscription'::text` |  |  |
| 4 | `price` | `numeric` | não | `0` |  |  |
| 5 | `sales_count` | `integer` | não | `0` |  |  |
| 6 | `rating` | `numeric` | não | `0` |  |  |
| 7 | `status` | `text` | não | `'ativo'::text` |  |  |
| 8 | `created_at` | `timestamp with time zone` | não | `now()` |  |  |
| 9 | `updated_at` | `timestamp with time zone` | não | `now()` |  |  |
| 10 | `sku` | `text` | sim |  |  |  |
| 11 | `stock_quantity` | `integer` | sim | `0` |  |  |
| 12 | `min_stock_level` | `integer` | sim | `5` |  |  |
| 13 | `description` | `text` | sim |  |  |  |
| 14 | `default_cost` | `numeric(12,2)` | sim |  |  |  |
| 15 | `cost_synced_at` | `timestamp with time zone` | sim |  |  |  |
| 16 | `deleted_at` | `timestamp with time zone` | sim |  |  | Soft delete: preenchido marca o registro como excluído sem remoção física. |
| 17 | `deleted_by` | `uuid` | sim |  |  |  |
| 18 | `delete_reason` | `text` | sim |  |  |  |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| products_deleted_by_fkey | FOREIGN KEY | `FOREIGN KEY (deleted_by) REFERENCES auth.users(id)` | NO ACTION | NO ACTION | sim |
| products_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| products_price_positive | CHECK | `CHECK (price >= 0::numeric)` |  |  | sim |
| products_sku_key | UNIQUE | `UNIQUE (sku)` |  |  | sim |
| products_stock_positive | CHECK | `CHECK (stock_quantity >= 0)` |  |  | sim |


## Referenciada por (FKs de outras tabelas)

| tabela | constraint | colunas | on delete |
|---|---|---|---|
| public.competitors_pricing | competitors_pricing_product_id_fkey | product_id | CASCADE |
| public.demand_forecasts | demand_forecasts_product_id_fkey | product_id | CASCADE |
| public.inventory_levels | inventory_levels_product_id_fkey | product_id | CASCADE |
| public.price_alerts | price_alerts_product_id_fkey | product_id | CASCADE |
| public.price_history | price_history_product_id_fkey | product_id | CASCADE |
| public.price_protection_rules | price_protection_rules_product_id_fkey | product_id | CASCADE |
| public.pricing_rules | pricing_rules_product_id_fkey | product_id | CASCADE |
| public.product_stock_log | product_stock_log_product_id_fkey | product_id | CASCADE |
| public.quote_items | quote_items_product_id_fkey | product_id | SET NULL |
| public.sales | sales_product_id_fkey | product_id | SET NULL |
| public.stock_movements | stock_movements_product_id_fkey | product_id | CASCADE |
| public.supplier_order_items | supplier_order_items_product_id_fkey | product_id | SET NULL |
| public.supplier_products | supplier_products_product_id_fkey | product_id | CASCADE |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| idx_products_active | btree | id | não | sim | `(deleted_at IS NULL)` | `CREATE INDEX idx_products_active ON public.products USING btree (id) WHERE (deleted_at IS NULL)` |
| idx_products_category | btree | category | não | sim |  | `CREATE INDEX idx_products_category ON public.products USING btree (category)` |
| idx_products_category_trgm | gin | category | não | sim |  | `CREATE INDEX idx_products_category_trgm ON public.products USING gin (category gin_trgm_ops)` |
| idx_products_deleted | btree | deleted_at | não | sim | `(deleted_at IS NOT NULL)` | `CREATE INDEX idx_products_deleted ON public.products USING btree (deleted_at) WHERE (deleted_at IS NOT NULL)` |
| idx_products_deleted_at | btree | deleted_at | não | sim | `(deleted_at IS NOT NULL)` | `CREATE INDEX idx_products_deleted_at ON public.products USING btree (deleted_at) WHERE (deleted_at IS NOT NULL)` |
| idx_products_deleted_by_fk | btree | deleted_by | não | sim |  | `CREATE INDEX idx_products_deleted_by_fk ON public.products USING btree (deleted_by)` |
| idx_products_name | btree | name | não | sim |  | `CREATE INDEX idx_products_name ON public.products USING btree (name)` |
| idx_products_name_trgm | gin | name | não | sim |  | `CREATE INDEX idx_products_name_trgm ON public.products USING gin (name gin_trgm_ops)` |
| idx_products_sku | btree | sku | não | sim |  | `CREATE INDEX idx_products_sku ON public.products USING btree (sku)` |
| products_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX products_pkey ON public.products USING btree (id)` |
| products_sku_key | btree | sku | sim | sim |  | `CREATE UNIQUE INDEX products_sku_key ON public.products USING btree (sku)` |


## Policies (RLS)

### `Admins and managers can insert products`

| campo | valor |
|---|---|
| comando | INSERT |
| tipo | PERMISSIVE |
| roles | public |
| USING |  |
| WITH CHECK | `is_admin_or_manager(auth.uid())` |

### `Admins and managers can update products`

| campo | valor |
|---|---|
| comando | UPDATE |
| tipo | PERMISSIVE |
| roles | public |
| USING | `is_admin_or_manager(auth.uid())` |
| WITH CHECK |  |

### `Authenticated users can read products`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `true` |
| WITH CHECK |  |

### `admin_delete_products`

| campo | valor |
|---|---|
| comando | DELETE |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `is_admin_or_manager(auth.uid())` |
| WITH CHECK |  |


## Triggers

| nome | timing | eventos | nível | status | função |
|---|---|---|---|---|---|
| audit_soft_delete_products | AFTER | UPDATE | ROW | enabled | public.log_soft_delete |
| set_updated_at | BEFORE | UPDATE | ROW | enabled | public.handle_updated_at |
| update_products_updated_at | BEFORE | UPDATE | ROW | enabled | public.update_updated_at_column |


## Grants

_nenhum_
