# public.twilio_call_sessions

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
| 2 | `owner_id` | `uuid` | não |  |  |  |
| 3 | `sale_id` | `uuid` | sim |  |  |  |
| 4 | `queue_item_id` | `uuid` | sim |  |  |  |
| 5 | `call_sid` | `text` | sim |  |  |  |
| 6 | `from_number` | `text` | sim |  |  |  |
| 7 | `to_number` | `text` | não |  |  |  |
| 8 | `status` | `text` | não | `'initiated'::text` |  |  |
| 9 | `duration_seconds` | `integer` | sim |  |  |  |
| 10 | `recording_url` | `text` | sim |  |  |  |
| 11 | `recording_sid` | `text` | sim |  |  |  |
| 12 | `price` | `numeric` | sim |  |  |  |
| 13 | `started_at` | `timestamp with time zone` | sim |  |  |  |
| 14 | `ended_at` | `timestamp with time zone` | sim |  |  |  |
| 15 | `created_at` | `timestamp with time zone` | não | `now()` |  |  |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| twilio_call_sessions_call_sid_key | UNIQUE | `UNIQUE (call_sid)` |  |  | sim |
| twilio_call_sessions_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| twilio_call_sessions_queue_item_id_fkey | FOREIGN KEY | `FOREIGN KEY (queue_item_id) REFERENCES dialer_queue_items(id) ON DELETE SET NULL` | SET NULL | NO ACTION | sim |
| twilio_call_sessions_sale_id_fkey | FOREIGN KEY | `FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE SET NULL` | SET NULL | NO ACTION | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| idx_twilio_call_sessions_queue_item_id | btree | queue_item_id | não | sim |  | `CREATE INDEX idx_twilio_call_sessions_queue_item_id ON public.twilio_call_sessions USING btree (queue_item_id)` |
| idx_twilio_sessions_call_sid | btree | call_sid | não | sim |  | `CREATE INDEX idx_twilio_sessions_call_sid ON public.twilio_call_sessions USING btree (call_sid)` |
| idx_twilio_sessions_owner_created | btree | owner_id, created_at | não | sim |  | `CREATE INDEX idx_twilio_sessions_owner_created ON public.twilio_call_sessions USING btree (owner_id, created_at DESC)` |
| idx_twilio_sessions_sale | btree | sale_id | não | sim |  | `CREATE INDEX idx_twilio_sessions_sale ON public.twilio_call_sessions USING btree (sale_id)` |
| twilio_call_sessions_call_sid_key | btree | call_sid | sim | sim |  | `CREATE UNIQUE INDEX twilio_call_sessions_call_sid_key ON public.twilio_call_sessions USING btree (call_sid)` |
| twilio_call_sessions_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX twilio_call_sessions_pkey ON public.twilio_call_sessions USING btree (id)` |


## Policies (RLS)

### `Owners can insert own twilio sessions`

| campo | valor |
|---|---|
| comando | INSERT |
| tipo | PERMISSIVE |
| roles | public |
| USING |  |
| WITH CHECK | `(auth.uid() = owner_id)` |

### `Owners can update own twilio sessions`

| campo | valor |
|---|---|
| comando | UPDATE |
| tipo | PERMISSIVE |
| roles | public |
| USING | `((auth.uid() = owner_id) OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` |
| WITH CHECK |  |

### `Owners can view own twilio sessions`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | public |
| USING | `((auth.uid() = owner_id) OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` |
| WITH CHECK |  |


## Triggers

_nenhum_


## Grants

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
