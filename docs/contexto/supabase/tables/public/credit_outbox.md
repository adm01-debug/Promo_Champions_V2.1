# public.credit_outbox

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
| 3 | `event` | `text` | não | `'credito.solicitado'::text` |  |  |
| 4 | `payload` | `jsonb` | não |  |  |  |
| 5 | `status` | `text` | não | `'pending'::text` |  |  |
| 6 | `attempts` | `integer` | não | `0` |  |  |
| 7 | `last_error` | `text` | sim |  |  |  |
| 8 | `next_attempt_at` | `timestamp with time zone` | não | `now()` |  |  |
| 9 | `delivered_at` | `timestamp with time zone` | sim |  |  |  |
| 10 | `created_at` | `timestamp with time zone` | não | `now()` |  |  |
| 11 | `updated_at` | `timestamp with time zone` | não | `now()` |  |  |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| credit_outbox_order_event_key | UNIQUE | `UNIQUE (order_id, event)` |  |  | sim |
| credit_outbox_order_id_fkey | FOREIGN KEY | `FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |
| credit_outbox_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| credit_outbox_status_check | CHECK | `CHECK (status = ANY (ARRAY['pending'::text, 'processing'::text, 'delivered'::text, 'dead'::text]))` |  |  | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| credit_outbox_order_event_key | btree | order_id, event | sim | sim |  | `CREATE UNIQUE INDEX credit_outbox_order_event_key ON public.credit_outbox USING btree (order_id, event)` |
| credit_outbox_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX credit_outbox_pkey ON public.credit_outbox USING btree (id)` |
| idx_credit_outbox_due | btree | next_attempt_at | não | sim | `(status = 'pending'::text)` | `CREATE INDEX idx_credit_outbox_due ON public.credit_outbox USING btree (next_attempt_at) WHERE (status = 'pending'::text)` |


## Policies (RLS)

### `credit_outbox_admin_read`

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
