# public.supplier_orders

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
| 3 | `order_number` | `text` | sim |  |  |  |
| 4 | `status` | `text` | sim | `'pending'::text` |  |  |
| 5 | `total_amount` | `numeric(12,2)` | não | `0` |  |  |
| 6 | `order_date` | `timestamp with time zone` | sim | `now()` |  |  |
| 7 | `expected_delivery` | `timestamp with time zone` | sim |  |  |  |
| 8 | `actual_delivery` | `timestamp with time zone` | sim |  |  |  |
| 9 | `notes` | `text` | sim |  |  |  |
| 10 | `created_by` | `uuid` | sim |  |  |  |
| 11 | `created_at` | `timestamp with time zone` | não | `now()` |  |  |
| 12 | `updated_at` | `timestamp with time zone` | não | `now()` |  |  |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| supplier_orders_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| supplier_orders_status_check | CHECK | `CHECK (status = ANY (ARRAY['pending'::text, 'confirmed'::text, 'shipped'::text, 'delivered'::text, 'cancelled'::text]))` |  |  | sim |
| supplier_orders_supplier_id_fkey | FOREIGN KEY | `FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |


## Referenciada por (FKs de outras tabelas)

| tabela | constraint | colunas | on delete |
|---|---|---|---|
| public.supplier_order_items | supplier_order_items_order_id_fkey | order_id | CASCADE |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| idx_supplier_orders_status | btree | status | não | sim |  | `CREATE INDEX idx_supplier_orders_status ON public.supplier_orders USING btree (status)` |
| idx_supplier_orders_supplier | btree | supplier_id | não | sim |  | `CREATE INDEX idx_supplier_orders_supplier ON public.supplier_orders USING btree (supplier_id)` |
| supplier_orders_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX supplier_orders_pkey ON public.supplier_orders USING btree (id)` |


## Policies (RLS)

### `Admin/manager can view supplier_orders`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `is_admin_or_manager(auth.uid())` |
| WITH CHECK |  |

### `Admins and managers can delete supplier_orders`

| campo | valor |
|---|---|
| comando | DELETE |
| tipo | PERMISSIVE |
| roles | public |
| USING | `is_admin_or_manager(auth.uid())` |
| WITH CHECK |  |

### `Admins and managers can insert supplier_orders`

| campo | valor |
|---|---|
| comando | INSERT |
| tipo | PERMISSIVE |
| roles | public |
| USING |  |
| WITH CHECK | `is_admin_or_manager(auth.uid())` |

### `Admins and managers can update supplier_orders`

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
| update_supplier_orders_updated_at | BEFORE | UPDATE | ROW | enabled | public.update_updated_at_column |


## Grants

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
