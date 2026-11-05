# public.price_history

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
| 2 | `supplier_product_id` | `uuid` | sim |  |  |  |
| 3 | `product_id` | `uuid` | sim |  |  |  |
| 4 | `supplier_id` | `uuid` | sim |  |  |  |
| 5 | `old_price` | `numeric` | não |  |  |  |
| 6 | `new_price` | `numeric` | não |  |  |  |
| 7 | `price_change_percent` | `numeric` | sim | ` CASE     WHEN (old_price > (0)::numeric) THEN (((new_price - old_price) / old_price) * (100)::numeric)     ELSE (0)::numeric END` | s |  |
| 8 | `recorded_at` | `timestamp with time zone` | não | `now()` |  |  |
| 9 | `created_at` | `timestamp with time zone` | não | `now()` |  |  |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| price_history_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| price_history_product_id_fkey | FOREIGN KEY | `FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |
| price_history_supplier_id_fkey | FOREIGN KEY | `FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |
| price_history_supplier_product_id_fkey | FOREIGN KEY | `FOREIGN KEY (supplier_product_id) REFERENCES supplier_products(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| idx_price_history_product | btree | product_id | não | sim |  | `CREATE INDEX idx_price_history_product ON public.price_history USING btree (product_id)` |
| idx_price_history_recorded_at | btree | recorded_at | não | sim |  | `CREATE INDEX idx_price_history_recorded_at ON public.price_history USING btree (recorded_at)` |
| idx_price_history_supplier_id | btree | supplier_id | não | sim |  | `CREATE INDEX idx_price_history_supplier_id ON public.price_history USING btree (supplier_id)` |
| idx_price_history_supplier_product | btree | supplier_product_id | não | sim |  | `CREATE INDEX idx_price_history_supplier_product ON public.price_history USING btree (supplier_product_id)` |
| price_history_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX price_history_pkey ON public.price_history USING btree (id)` |


## Policies (RLS)

### `Admin and managers can insert price_history`

| campo | valor |
|---|---|
| comando | INSERT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING |  |
| WITH CHECK | `is_admin_or_manager(auth.uid())` |

### `Admin/manager can view price_history`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `is_admin_or_manager(auth.uid())` |
| WITH CHECK |  |


## Triggers

_nenhum_


## Grants

_nenhum_
