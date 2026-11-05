# public.price_alerts

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
| 2 | `product_id` | `uuid` | sim |  |  |  |
| 3 | `supplier_id` | `uuid` | sim |  |  |  |
| 4 | `alert_type` | `text` | não |  |  |  |
| 5 | `old_price` | `numeric` | sim |  |  |  |
| 6 | `new_price` | `numeric` | não |  |  |  |
| 7 | `price_change_percent` | `numeric` | sim |  |  |  |
| 8 | `is_read` | `boolean` | não | `false` |  |  |
| 9 | `created_at` | `timestamp with time zone` | não | `now()` |  |  |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| price_alerts_alert_type_check | CHECK | `CHECK (alert_type = ANY (ARRAY['price_drop'::text, 'price_increase'::text, 'new_best_price'::text]))` |  |  | sim |
| price_alerts_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| price_alerts_product_id_fkey | FOREIGN KEY | `FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |
| price_alerts_supplier_id_fkey | FOREIGN KEY | `FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| idx_price_alerts_product | btree | product_id | não | sim |  | `CREATE INDEX idx_price_alerts_product ON public.price_alerts USING btree (product_id)` |
| idx_price_alerts_supplier_id | btree | supplier_id | não | sim |  | `CREATE INDEX idx_price_alerts_supplier_id ON public.price_alerts USING btree (supplier_id)` |
| idx_price_alerts_unread | btree | is_read | não | sim | `(is_read = false)` | `CREATE INDEX idx_price_alerts_unread ON public.price_alerts USING btree (is_read) WHERE (is_read = false)` |
| price_alerts_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX price_alerts_pkey ON public.price_alerts USING btree (id)` |


## Policies (RLS)

### `Admin and managers can update price_alerts`

| campo | valor |
|---|---|
| comando | UPDATE |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `is_admin_or_manager(auth.uid())` |
| WITH CHECK |  |

### `Admin/manager can insert price_alerts`

| campo | valor |
|---|---|
| comando | INSERT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING |  |
| WITH CHECK | `is_admin_or_manager(auth.uid())` |

### `Admin/manager can view price_alerts`

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
