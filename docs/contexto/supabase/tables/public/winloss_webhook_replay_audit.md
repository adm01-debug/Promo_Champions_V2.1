# public.winloss_webhook_replay_audit

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
| 2 | `dead_letter_id` | `uuid` | sim |  |  |  |
| 3 | `delivery_id` | `uuid` | sim |  |  |  |
| 4 | `source` | `text` | não |  |  |  |
| 5 | `request_id` | `uuid` | não |  |  |  |
| 6 | `actor_user_id` | `uuid` | não |  |  |  |
| 7 | `actor_email` | `text` | sim |  |  |  |
| 8 | `succeeded` | `boolean` | não |  |  |  |
| 9 | `status_label` | `text` | não |  |  |  |
| 10 | `http_status` | `integer` | não | `0` |  |  |
| 11 | `error` | `text` | sim |  |  |  |
| 12 | `attempts` | `integer` | sim |  |  |  |
| 13 | `created_at` | `timestamp with time zone` | não | `now()` |  |  |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| winloss_webhook_replay_audit_dead_letter_id_fkey | FOREIGN KEY | `FOREIGN KEY (dead_letter_id) REFERENCES winloss_webhook_dead_letters(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |
| winloss_webhook_replay_audit_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| winloss_webhook_replay_audit_source_check | CHECK | `CHECK (source = ANY (ARRAY['dlq'::text, 'delivery'::text]))` |  |  | sim |
| winloss_webhook_replay_audit_status_label_check | CHECK | `CHECK (status_label = ANY (ARRAY['succeeded'::text, 'failed'::text, 'skipped'::text]))` |  |  | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| idx_wh_replay_audit_created | btree | created_at | não | sim |  | `CREATE INDEX idx_wh_replay_audit_created ON public.winloss_webhook_replay_audit USING btree (created_at DESC)` |
| idx_wh_replay_audit_dead_letter | btree | dead_letter_id, created_at | não | sim |  | `CREATE INDEX idx_wh_replay_audit_dead_letter ON public.winloss_webhook_replay_audit USING btree (dead_letter_id, created_at DESC)` |
| idx_wh_replay_audit_delivery | btree | delivery_id, created_at | não | sim |  | `CREATE INDEX idx_wh_replay_audit_delivery ON public.winloss_webhook_replay_audit USING btree (delivery_id, created_at DESC)` |
| idx_wh_replay_audit_request | btree | request_id | não | sim |  | `CREATE INDEX idx_wh_replay_audit_request ON public.winloss_webhook_replay_audit USING btree (request_id)` |
| winloss_webhook_replay_audit_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX winloss_webhook_replay_audit_pkey ON public.winloss_webhook_replay_audit USING btree (id)` |


## Policies (RLS)

### `Admins/Managers can view replay audit`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `(has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` |
| WITH CHECK |  |


## Triggers

_nenhum_


## Grants

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
