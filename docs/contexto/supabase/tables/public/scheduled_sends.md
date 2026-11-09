# public.scheduled_sends

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
| 3 | `sale_id` | `uuid` | não |  |  |  |
| 4 | `channel` | `text` | não |  |  |  |
| 5 | `payload` | `jsonb` | não | `'{}'::jsonb` |  |  |
| 6 | `scheduled_for` | `timestamp with time zone` | não |  |  |  |
| 7 | `status` | `text` | não | `'pending'::text` |  |  |
| 8 | `optimization_source` | `text` | não | `'manual'::text` |  |  |
| 9 | `sent_at` | `timestamp with time zone` | sim |  |  |  |
| 10 | `error` | `text` | sim |  |  |  |
| 11 | `created_at` | `timestamp with time zone` | não | `now()` |  |  |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| scheduled_sends_channel_check | CHECK | `CHECK (channel = ANY (ARRAY['email'::text, 'whatsapp'::text, 'linkedin'::text, 'sms'::text]))` |  |  | sim |
| scheduled_sends_optimization_source_check | CHECK | `CHECK (optimization_source = ANY (ARRAY['profile'::text, 'global'::text, 'manual'::text]))` |  |  | sim |
| scheduled_sends_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| scheduled_sends_sale_id_fkey | FOREIGN KEY | `FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |
| scheduled_sends_status_check | CHECK | `CHECK (status = ANY (ARRAY['pending'::text, 'sent'::text, 'failed'::text, 'cancelled'::text]))` |  |  | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| idx_scheduled_sends_owner | btree | owner_id, created_at | não | sim |  | `CREATE INDEX idx_scheduled_sends_owner ON public.scheduled_sends USING btree (owner_id, created_at DESC)` |
| idx_scheduled_sends_pending | btree | status, scheduled_for | não | sim | `(status = 'pending'::text)` | `CREATE INDEX idx_scheduled_sends_pending ON public.scheduled_sends USING btree (status, scheduled_for) WHERE (status = 'pending'::text)` |
| idx_scheduled_sends_sale_id | btree | sale_id | não | sim |  | `CREATE INDEX idx_scheduled_sends_sale_id ON public.scheduled_sends USING btree (sale_id)` |
| scheduled_sends_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX scheduled_sends_pkey ON public.scheduled_sends USING btree (id)` |


## Policies (RLS)

### `owners insert scheduled_sends`

| campo | valor |
|---|---|
| comando | INSERT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING |  |
| WITH CHECK | `(owner_id = auth.uid())` |

### `owners read own scheduled_sends`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `((owner_id = auth.uid()) OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` |
| WITH CHECK |  |

### `owners update own scheduled_sends`

| campo | valor |
|---|---|
| comando | UPDATE |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `((owner_id = auth.uid()) OR has_role(auth.uid(), 'admin'::app_role))` |
| WITH CHECK | `((owner_id = auth.uid()) OR has_role(auth.uid(), 'admin'::app_role))` |


## Triggers

_nenhum_


## Grants

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
