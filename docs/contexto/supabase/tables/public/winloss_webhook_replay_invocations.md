# public.winloss_webhook_replay_invocations

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
| 2 | `request_id` | `text` | não |  |  |  |
| 3 | `actor_user_id` | `uuid` | não |  |  |  |
| 4 | `actor_email` | `text` | sim |  |  |  |
| 5 | `source` | `text` | não |  |  |  |
| 6 | `item_count` | `integer` | não | `0` |  |  |
| 7 | `succeeded_count` | `integer` | não | `0` |  |  |
| 8 | `failed_count` | `integer` | não | `0` |  |  |
| 9 | `skipped_count` | `integer` | não | `0` |  |  |
| 10 | `duration_ms` | `integer` | sim |  |  |  |
| 11 | `ids` | `uuid[]` | não | `'{}'::uuid[]` |  |  |
| 12 | `created_at` | `timestamp with time zone` | não | `now()` |  |  |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| winloss_webhook_replay_invocations_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| winloss_webhook_replay_invocations_source_check | CHECK | `CHECK (source = ANY (ARRAY['dlq'::text, 'delivery'::text]))` |  |  | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| idx_wh_replay_inv_actor | btree | actor_user_id, created_at | não | sim |  | `CREATE INDEX idx_wh_replay_inv_actor ON public.winloss_webhook_replay_invocations USING btree (actor_user_id, created_at DESC)` |
| idx_wh_replay_inv_created | btree | created_at | não | sim |  | `CREATE INDEX idx_wh_replay_inv_created ON public.winloss_webhook_replay_invocations USING btree (created_at DESC)` |
| idx_wh_replay_inv_request | btree | request_id | não | sim |  | `CREATE INDEX idx_wh_replay_inv_request ON public.winloss_webhook_replay_invocations USING btree (request_id)` |
| winloss_webhook_replay_invocations_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX winloss_webhook_replay_invocations_pkey ON public.winloss_webhook_replay_invocations USING btree (id)` |


## Policies (RLS)

### `Admins/Managers can view replay invocations`

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
