# public.call_logs

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
| 2 | `owner_id` | `uuid` | não |  |  |  |
| 3 | `sale_id` | `uuid` | sim |  |  |  |
| 4 | `queue_item_id` | `uuid` | sim |  |  |  |
| 5 | `disposition` | `text` | não |  |  |  |
| 6 | `outcome` | `text` | sim |  |  |  |
| 7 | `duration_seconds` | `integer` | sim | `0` |  |  |
| 8 | `notes` | `text` | sim |  |  |  |
| 9 | `next_action_at` | `timestamp with time zone` | sim |  |  |  |
| 10 | `created_at` | `timestamp with time zone` | não | `now()` |  |  |
| 11 | `call_sid` | `text` | sim |  |  |  |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| call_logs_disposition_check | CHECK | `CHECK (disposition = ANY (ARRAY['connected'::text, 'voicemail'::text, 'no_answer'::text, 'busy'::text, 'wrong_number'::text, 'do_not_call'::text]))` |  |  | sim |
| call_logs_outcome_check | CHECK | `CHECK (outcome = ANY (ARRAY['meeting_set'::text, 'interested'::text, 'not_interested'::text, 'callback'::text, 'nurture'::text]))` |  |  | sim |
| call_logs_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| call_logs_queue_item_id_fkey | FOREIGN KEY | `FOREIGN KEY (queue_item_id) REFERENCES dialer_queue_items(id) ON DELETE SET NULL` | SET NULL | NO ACTION | sim |
| call_logs_sale_id_fkey | FOREIGN KEY | `FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE SET NULL` | SET NULL | NO ACTION | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| call_logs_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX call_logs_pkey ON public.call_logs USING btree (id)` |
| idx_call_logs_call_sid | btree | call_sid | não | sim |  | `CREATE INDEX idx_call_logs_call_sid ON public.call_logs USING btree (call_sid)` |
| idx_call_logs_owner_created | btree | owner_id, created_at | não | sim |  | `CREATE INDEX idx_call_logs_owner_created ON public.call_logs USING btree (owner_id, created_at DESC)` |
| idx_call_logs_queue_item_id | btree | queue_item_id | não | sim |  | `CREATE INDEX idx_call_logs_queue_item_id ON public.call_logs USING btree (queue_item_id)` |
| idx_call_logs_sale | btree | sale_id, created_at | não | sim |  | `CREATE INDEX idx_call_logs_sale ON public.call_logs USING btree (sale_id, created_at DESC)` |


## Policies (RLS)

### `Delete own call logs`

| campo | valor |
|---|---|
| comando | DELETE |
| tipo | PERMISSIVE |
| roles | public |
| USING | `((owner_id = auth.uid()) OR has_role(auth.uid(), 'admin'::app_role))` |
| WITH CHECK |  |

### `Insert own call logs`

| campo | valor |
|---|---|
| comando | INSERT |
| tipo | PERMISSIVE |
| roles | public |
| USING |  |
| WITH CHECK | `(owner_id = auth.uid())` |

### `Update own call logs`

| campo | valor |
|---|---|
| comando | UPDATE |
| tipo | PERMISSIVE |
| roles | public |
| USING | `((owner_id = auth.uid()) OR has_role(auth.uid(), 'admin'::app_role))` |
| WITH CHECK |  |

### `View call logs`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | public |
| USING | `((owner_id = auth.uid()) OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` |
| WITH CHECK |  |


## Triggers

_nenhum_


## Grants

_nenhum_
