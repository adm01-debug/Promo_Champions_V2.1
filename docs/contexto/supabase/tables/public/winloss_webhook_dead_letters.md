# public.winloss_webhook_dead_letters

| propriedade | valor |
|---|---|
| tipo | table |
| owner | postgres |
| RLS habilitado | sim |
| RLS forçado (owner) | não |
| policies | 2 |
| realtime (publication) | não |
| replica identity | default |
| vem de extensão | não |


## Colunas

| # | coluna | tipo | nullable | default | identity/generated | comentário |
|---|---|---|---|---|---|---|
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  |  |
| 2 | `subscription_id` | `uuid` | não |  |  |  |
| 3 | `event` | `text` | não |  |  |  |
| 4 | `payload` | `jsonb` | não |  |  |  |
| 5 | `last_status` | `smallint` | não |  |  |  |
| 6 | `last_error` | `text` | sim |  |  |  |
| 7 | `attempts` | `smallint` | não |  |  |  |
| 8 | `total_latency_ms` | `integer` | não |  |  |  |
| 9 | `request_id` | `uuid` | sim |  |  |  |
| 10 | `status` | `text` | não | `'pending'::text` |  |  |
| 11 | `replay_count` | `smallint` | não | `0` |  |  |
| 12 | `last_replay_at` | `timestamp with time zone` | sim |  |  |  |
| 13 | `last_replay_status` | `smallint` | sim |  |  |  |
| 14 | `last_replay_error` | `text` | sim |  |  |  |
| 15 | `created_at` | `timestamp with time zone` | não | `now()` |  |  |
| 16 | `updated_at` | `timestamp with time zone` | não | `now()` |  |  |
| 17 | `last_replay_request_id` | `uuid` | sim |  |  |  |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| winloss_webhook_dead_letters_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| winloss_webhook_dead_letters_status_check | CHECK | `CHECK (status = ANY (ARRAY['pending'::text, 'replaying'::text, 'replayed'::text, 'archived'::text]))` |  |  | sim |
| winloss_webhook_dead_letters_subscription_id_fkey | FOREIGN KEY | `FOREIGN KEY (subscription_id) REFERENCES winloss_webhook_subscriptions(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |


## Referenciada por (FKs de outras tabelas)

| tabela | constraint | colunas | on delete |
|---|---|---|---|
| public.winloss_webhook_replay_audit | winloss_webhook_replay_audit_dead_letter_id_fkey | dead_letter_id | CASCADE |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| idx_winloss_dlq_status_created | btree | status, created_at | não | sim |  | `CREATE INDEX idx_winloss_dlq_status_created ON public.winloss_webhook_dead_letters USING btree (status, created_at DESC)` |
| idx_winloss_dlq_subscription | btree | subscription_id | não | sim |  | `CREATE INDEX idx_winloss_dlq_subscription ON public.winloss_webhook_dead_letters USING btree (subscription_id)` |
| idx_winloss_webhook_dlq_last_replay_request_id | btree | last_replay_request_id | não | sim |  | `CREATE INDEX idx_winloss_webhook_dlq_last_replay_request_id ON public.winloss_webhook_dead_letters USING btree (last_replay_request_id)` |
| winloss_webhook_dead_letters_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX winloss_webhook_dead_letters_pkey ON public.winloss_webhook_dead_letters USING btree (id)` |


## Policies (RLS)

### `Admins can update dead letters`

| campo | valor |
|---|---|
| comando | UPDATE |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `has_role(auth.uid(), 'admin'::app_role)` |
| WITH CHECK | `has_role(auth.uid(), 'admin'::app_role)` |

### `Admins can view dead letters`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `has_role(auth.uid(), 'admin'::app_role)` |
| WITH CHECK |  |


## Triggers

| nome | timing | eventos | nível | status | função |
|---|---|---|---|---|---|
| set_updated_at | BEFORE | UPDATE | ROW | enabled | public.handle_updated_at |
| update_winloss_dlq_updated_at | BEFORE | UPDATE | ROW | enabled | public.update_updated_at_column |


## Grants

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
