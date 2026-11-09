# public.channel_interactions

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
| 2 | `salesperson_id` | `uuid` | não |  |  |  |
| 3 | `channel` | `text` | não | `'whatsapp'::text` |  |  |
| 4 | `direction` | `text` | não | `'outbound'::text` |  |  |
| 5 | `contact_name` | `text` | não |  |  |  |
| 6 | `contact_info` | `text` | sim |  |  |  |
| 7 | `message_preview` | `text` | sim |  |  |  |
| 8 | `status` | `text` | sim | `'sent'::text` |  |  |
| 9 | `template_id` | `uuid` | sim |  |  |  |
| 10 | `deal_id` | `uuid` | sim |  |  |  |
| 11 | `metadata` | `jsonb` | sim | `'{}'::jsonb` |  |  |
| 12 | `created_at` | `timestamp with time zone` | não | `now()` |  |  |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| channel_interactions_channel_check | CHECK | `CHECK (channel = ANY (ARRAY['whatsapp'::text, 'email'::text, 'linkedin'::text, 'sms'::text, 'phone'::text]))` |  |  | sim |
| channel_interactions_deal_id_fkey | FOREIGN KEY | `FOREIGN KEY (deal_id) REFERENCES sales(id) ON DELETE SET NULL` | SET NULL | NO ACTION | sim |
| channel_interactions_direction_check | CHECK | `CHECK (direction = ANY (ARRAY['inbound'::text, 'outbound'::text]))` |  |  | sim |
| channel_interactions_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| channel_interactions_salesperson_id_fkey | FOREIGN KEY | `FOREIGN KEY (salesperson_id) REFERENCES salespeople(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |
| channel_interactions_status_check | CHECK | `CHECK (status = ANY (ARRAY['sent'::text, 'delivered'::text, 'read'::text, 'replied'::text, 'failed'::text, 'scheduled'::text]))` |  |  | sim |
| channel_interactions_template_id_fkey | FOREIGN KEY | `FOREIGN KEY (template_id) REFERENCES message_templates(id) ON DELETE SET NULL` | SET NULL | NO ACTION | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| channel_interactions_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX channel_interactions_pkey ON public.channel_interactions USING btree (id)` |
| idx_channel_interactions_channel | btree | channel | não | sim |  | `CREATE INDEX idx_channel_interactions_channel ON public.channel_interactions USING btree (channel)` |
| idx_channel_interactions_created | btree | created_at | não | sim |  | `CREATE INDEX idx_channel_interactions_created ON public.channel_interactions USING btree (created_at DESC)` |
| idx_channel_interactions_deal | btree | deal_id | não | sim | `(deal_id IS NOT NULL)` | `CREATE INDEX idx_channel_interactions_deal ON public.channel_interactions USING btree (deal_id) WHERE (deal_id IS NOT NULL)` |
| idx_channel_interactions_salesperson | btree | salesperson_id | não | sim |  | `CREATE INDEX idx_channel_interactions_salesperson ON public.channel_interactions USING btree (salesperson_id)` |
| idx_channel_interactions_template_id | btree | template_id | não | sim |  | `CREATE INDEX idx_channel_interactions_template_id ON public.channel_interactions USING btree (template_id)` |


## Policies (RLS)

### `Users can create own interactions`

| campo | valor |
|---|---|
| comando | INSERT |
| tipo | PERMISSIVE |
| roles | public |
| USING |  |
| WITH CHECK | `(salesperson_id = get_current_salesperson_id())` |

### `Users can delete own interactions`

| campo | valor |
|---|---|
| comando | DELETE |
| tipo | PERMISSIVE |
| roles | public |
| USING | `(salesperson_id = get_current_salesperson_id())` |
| WITH CHECK |  |

### `Users can update own interactions`

| campo | valor |
|---|---|
| comando | UPDATE |
| tipo | PERMISSIVE |
| roles | public |
| USING | `(salesperson_id = get_current_salesperson_id())` |
| WITH CHECK |  |

### `Users can view own interactions`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | public |
| USING | `(salesperson_id = get_current_salesperson_id())` |
| WITH CHECK |  |


## Triggers

| nome | timing | eventos | nível | status | função |
|---|---|---|---|---|---|
| trg_auto_pause_cadence_on_response | AFTER | INSERT | ROW | enabled | private.auto_pause_cadence_on_response |


## Grants

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
