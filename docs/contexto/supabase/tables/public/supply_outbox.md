# public.supply_outbox

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
| 2 | `order_id` | `uuid` | não |  |  |  |
| 3 | `order_item_id` | `uuid` | não |  |  |  |
| 4 | `event` | `text` | não | `'pedido.criado'::text` |  |  |
| 5 | `payload` | `jsonb` | não |  |  |  |
| 6 | `status` | `text` | não | `'pending'::text` |  |  |
| 7 | `attempts` | `integer` | não | `0` |  |  |
| 8 | `last_error` | `text` | sim |  |  |  |
| 9 | `next_attempt_at` | `timestamp with time zone` | não | `now()` |  |  |
| 10 | `delivered_at` | `timestamp with time zone` | sim |  |  |  |
| 11 | `created_at` | `timestamp with time zone` | não | `now()` |  |  |
| 12 | `updated_at` | `timestamp with time zone` | não | `now()` |  |  |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| supply_outbox_item_event_key | UNIQUE | `UNIQUE (order_item_id, event)` |  |  | sim |
| supply_outbox_order_id_fkey | FOREIGN KEY | `FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |
| supply_outbox_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| supply_outbox_status_check | CHECK | `CHECK (status = ANY (ARRAY['pending'::text, 'processing'::text, 'delivered'::text, 'dead'::text]))` |  |  | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| idx_supply_outbox_due | btree | next_attempt_at | não | sim | `(status = 'pending'::text)` | `CREATE INDEX idx_supply_outbox_due ON public.supply_outbox USING btree (next_attempt_at) WHERE (status = 'pending'::text)` |
| idx_supply_outbox_order | btree | order_id | não | sim |  | `CREATE INDEX idx_supply_outbox_order ON public.supply_outbox USING btree (order_id)` |
| supply_outbox_item_event_key | btree | order_item_id, event | sim | sim |  | `CREATE UNIQUE INDEX supply_outbox_item_event_key ON public.supply_outbox USING btree (order_item_id, event)` |
| supply_outbox_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX supply_outbox_pkey ON public.supply_outbox USING btree (id)` |


## Policies (RLS)

### `supply_outbox_admin_read`

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

| role | privilégios |
|---|---|
| authenticated | SELECT |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
