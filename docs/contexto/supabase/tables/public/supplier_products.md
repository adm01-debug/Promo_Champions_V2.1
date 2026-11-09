# public.supplier_products

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


## Colunas

| # | coluna | tipo | nullable | default | identity/generated | comentário |
|---|---|---|---|---|---|---|
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  |  |
| 2 | `supplier_id` | `uuid` | sim |  |  |  |
| 3 | `product_id` | `uuid` | sim |  |  |  |
| 4 | `unit_price` | `numeric(12,2)` | não |  |  |  |
| 5 | `min_order_quantity` | `integer` | sim | `1` |  |  |
| 6 | `currency` | `text` | sim | `'BRL'::text` |  |  |
| 7 | `last_price_update` | `timestamp with time zone` | sim | `now()` |  |  |
| 8 | `is_preferred` | `boolean` | sim | `false` |  |  |
| 9 | `created_at` | `timestamp with time zone` | não | `now()` |  |  |
| 10 | `updated_at` | `timestamp with time zone` | não | `now()` |  |  |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| supplier_products_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| supplier_products_product_id_fkey | FOREIGN KEY | `FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |
| supplier_products_supplier_id_fkey | FOREIGN KEY | `FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |
| supplier_products_supplier_id_product_id_key | UNIQUE | `UNIQUE (supplier_id, product_id)` |  |  | sim |


## Referenciada por (FKs de outras tabelas)

| tabela | constraint | colunas | on delete |
|---|---|---|---|
| public.price_history | price_history_supplier_product_id_fkey | supplier_product_id | CASCADE |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| idx_supplier_products_product | btree | product_id | não | sim |  | `CREATE INDEX idx_supplier_products_product ON public.supplier_products USING btree (product_id)` |
| idx_supplier_products_supplier | btree | supplier_id | não | sim |  | `CREATE INDEX idx_supplier_products_supplier ON public.supplier_products USING btree (supplier_id)` |
| supplier_products_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX supplier_products_pkey ON public.supplier_products USING btree (id)` |
| supplier_products_supplier_id_product_id_key | btree | supplier_id, product_id | sim | sim |  | `CREATE UNIQUE INDEX supplier_products_supplier_id_product_id_key ON public.supplier_products USING btree (supplier_id, product_id)` |


## Policies (RLS)

### `Admin/manager can view supplier_products`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `is_admin_or_manager(auth.uid())` |
| WITH CHECK |  |

### `Admins and managers can delete supplier_products`

| campo | valor |
|---|---|
| comando | DELETE |
| tipo | PERMISSIVE |
| roles | public |
| USING | `is_admin_or_manager(auth.uid())` |
| WITH CHECK |  |

### `Admins and managers can insert supplier_products`

| campo | valor |
|---|---|
| comando | INSERT |
| tipo | PERMISSIVE |
| roles | public |
| USING |  |
| WITH CHECK | `is_admin_or_manager(auth.uid())` |

### `Admins and managers can update supplier_products`

| campo | valor |
|---|---|
| comando | UPDATE |
| tipo | PERMISSIVE |
| roles | public |
| USING | `is_admin_or_manager(auth.uid())` |
| WITH CHECK |  |


## Triggers

| nome | timing | eventos | nível | status | função |
|---|---|---|---|---|---|
| set_updated_at | BEFORE | UPDATE | ROW | enabled | public.handle_updated_at |
| trigger_record_price_history | AFTER | UPDATE | ROW | enabled | public.record_price_history |
| update_supplier_products_updated_at | BEFORE | UPDATE | ROW | enabled | public.update_updated_at_column |


## Grants

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
