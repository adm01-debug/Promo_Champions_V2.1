# public.supplier_order_items

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
| 2 | `order_id` | `uuid` | sim |  |  |  |
| 3 | `product_id` | `uuid` | sim |  |  |  |
| 4 | `quantity` | `integer` | não |  |  |  |
| 5 | `unit_price` | `numeric(12,2)` | não |  |  |  |
| 6 | `total_price` | `numeric(12,2)` | não |  |  |  |
| 7 | `created_at` | `timestamp with time zone` | não | `now()` |  |  |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| supplier_order_items_order_id_fkey | FOREIGN KEY | `FOREIGN KEY (order_id) REFERENCES supplier_orders(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |
| supplier_order_items_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| supplier_order_items_product_id_fkey | FOREIGN KEY | `FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL` | SET NULL | NO ACTION | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| idx_supplier_order_items_order_id | btree | order_id | não | sim |  | `CREATE INDEX idx_supplier_order_items_order_id ON public.supplier_order_items USING btree (order_id)` |
| idx_supplier_order_items_product_id | btree | product_id | não | sim |  | `CREATE INDEX idx_supplier_order_items_product_id ON public.supplier_order_items USING btree (product_id)` |
| supplier_order_items_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX supplier_order_items_pkey ON public.supplier_order_items USING btree (id)` |


## Policies (RLS)

### `Admin/manager can view supplier_order_items`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `is_admin_or_manager(auth.uid())` |
| WITH CHECK |  |

### `Admins and managers can insert supplier_order_items`

| campo | valor |
|---|---|
| comando | INSERT |
| tipo | PERMISSIVE |
| roles | public |
| USING |  |
| WITH CHECK | `is_admin_or_manager(auth.uid())` |


## Triggers

_nenhum_


## Grants

_nenhum_
