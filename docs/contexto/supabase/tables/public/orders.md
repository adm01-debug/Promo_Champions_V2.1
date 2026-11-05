# public.orders

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
| usada por views | public.v_quote_to_sale_invariants |


## Colunas

| # | coluna | tipo | nullable | default | identity/generated | comentário |
|---|---|---|---|---|---|---|
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  |  |
| 2 | `user_id` | `uuid` | sim |  |  |  |
| 3 | `order_number` | `text` | não |  |  |  |
| 4 | `status` | `text` | não | `'pending'::text` |  |  |
| 5 | `subtotal` | `numeric(12,2)` | não | `0` |  |  |
| 6 | `shipping` | `numeric(12,2)` | não | `0` |  |  |
| 7 | `total` | `numeric(12,2)` | não | `0` |  |  |
| 8 | `cancellation_reason` | `text` | sim |  |  |  |
| 9 | `created_at` | `timestamp with time zone` | não | `now()` |  |  |
| 10 | `updated_at` | `timestamp with time zone` | não | `now()` |  |  |
| 11 | `quote_id` | `uuid` | sim |  |  |  |
| 12 | `client_id` | `uuid` | sim |  |  |  |
| 13 | `salesperson_id` | `uuid` | sim |  |  |  |
| 14 | `notes` | `text` | sim |  |  |  |
| 15 | `metadata` | `jsonb` | sim | `'{}'::jsonb` |  |  |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| orders_client_id_fkey | FOREIGN KEY | `FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE SET NULL` | SET NULL | NO ACTION | sim |
| orders_order_number_key | UNIQUE | `UNIQUE (order_number)` |  |  | sim |
| orders_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| orders_quote_id_fkey | FOREIGN KEY | `FOREIGN KEY (quote_id) REFERENCES quotes(id) ON DELETE SET NULL` | SET NULL | NO ACTION | sim |
| orders_salesperson_id_fkey | FOREIGN KEY | `FOREIGN KEY (salesperson_id) REFERENCES salespeople(id) ON DELETE SET NULL` | SET NULL | NO ACTION | sim |
| orders_status_check | CHECK | `CHECK (status = ANY (ARRAY['pending'::text, 'confirmed'::text, 'preparing'::text, 'shipped'::text, 'delivered'::text, 'cancelled'::text]))` |  |  | sim |


## Referenciada por (FKs de outras tabelas)

| tabela | constraint | colunas | on delete |
|---|---|---|---|
| public.order_items | order_items_order_id_fkey | order_id | CASCADE |
| public.order_status_events | order_status_events_order_id_fkey | order_id | CASCADE |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| idx_orders_client_id | btree | client_id | não | sim |  | `CREATE INDEX idx_orders_client_id ON public.orders USING btree (client_id)` |
| idx_orders_salesperson_id | btree | salesperson_id | não | sim |  | `CREATE INDEX idx_orders_salesperson_id ON public.orders USING btree (salesperson_id)` |
| idx_orders_status_created | btree | status, created_at | não | sim |  | `CREATE INDEX idx_orders_status_created ON public.orders USING btree (status, created_at DESC)` |
| idx_orders_user | btree | user_id | não | sim |  | `CREATE INDEX idx_orders_user ON public.orders USING btree (user_id)` |
| orders_order_number_key | btree | order_number | sim | sim |  | `CREATE UNIQUE INDEX orders_order_number_key ON public.orders USING btree (order_number)` |
| orders_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX orders_pkey ON public.orders USING btree (id)` |
| ux_orders_quote_id | btree | quote_id | sim | sim | `(quote_id IS NOT NULL)` | `CREATE UNIQUE INDEX ux_orders_quote_id ON public.orders USING btree (quote_id) WHERE (quote_id IS NOT NULL)` |


## Policies (RLS)

### `Admins and managers manage orders`

| campo | valor |
|---|---|
| comando | ALL |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `is_admin_or_manager(auth.uid())` |
| WITH CHECK | `is_admin_or_manager(auth.uid())` |

### `Salespeople view assigned orders`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `((salesperson_id IS NOT NULL) AND (salesperson_id = get_current_salesperson_id()))` |
| WITH CHECK |  |

### `Users insert own orders`

| campo | valor |
|---|---|
| comando | INSERT |
| tipo | PERMISSIVE |
| roles | public |
| USING |  |
| WITH CHECK | `(auth.uid() = user_id)` |

### `Users view own orders`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `(auth.uid() = user_id)` |
| WITH CHECK |  |


## Triggers

| nome | timing | eventos | nível | status | função |
|---|---|---|---|---|---|
| audit_business_changes | AFTER | DELETE OR UPDATE | ROW | enabled | public.audit_log_row_change |
| set_updated_at | BEFORE | UPDATE | ROW | enabled | public.handle_updated_at |
| trg_log_order_creation | AFTER | INSERT | ROW | enabled | private.log_order_creation |
| trg_log_order_status_change | BEFORE | UPDATE | ROW | enabled | private.log_order_status_change |


## Grants

_nenhum_
