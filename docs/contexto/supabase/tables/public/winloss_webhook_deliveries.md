# public.winloss_webhook_deliveries

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
| usada por views | public.v_platform_slo |


## Colunas

| # | coluna | tipo | nullable | default | identity/generated | comentário |
|---|---|---|---|---|---|---|
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  |  |
| 2 | `subscription_id` | `uuid` | não |  |  |  |
| 3 | `event` | `text` | não |  |  |  |
| 4 | `payload` | `jsonb` | não | `'{}'::jsonb` |  |  |
| 5 | `attempt` | `smallint` | não |  |  |  |
| 6 | `status` | `smallint` | não | `0` |  |  |
| 7 | `error_message` | `text` | sim |  |  |  |
| 8 | `duration_ms` | `integer` | não | `0` |  |  |
| 9 | `succeeded` | `boolean` | não | `false` |  |  |
| 10 | `created_at` | `timestamp with time zone` | não | `now()` |  |  |
| 11 | `request_id` | `uuid` | sim |  |  |  |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| winloss_webhook_deliveries_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| winloss_webhook_deliveries_subscription_id_fkey | FOREIGN KEY | `FOREIGN KEY (subscription_id) REFERENCES winloss_webhook_subscriptions(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| idx_winloss_webhook_deliveries_event | btree | event, created_at | não | sim |  | `CREATE INDEX idx_winloss_webhook_deliveries_event ON public.winloss_webhook_deliveries USING btree (event, created_at DESC)` |
| idx_winloss_webhook_deliveries_request_id | btree | request_id | não | sim | `(request_id IS NOT NULL)` | `CREATE INDEX idx_winloss_webhook_deliveries_request_id ON public.winloss_webhook_deliveries USING btree (request_id) WHERE (request_id IS NOT NULL)` |
| idx_winloss_webhook_deliveries_sub | btree | subscription_id, created_at | não | sim |  | `CREATE INDEX idx_winloss_webhook_deliveries_sub ON public.winloss_webhook_deliveries USING btree (subscription_id, created_at DESC)` |
| winloss_webhook_deliveries_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX winloss_webhook_deliveries_pkey ON public.winloss_webhook_deliveries USING btree (id)` |


## Policies (RLS)

### `Admins read webhook deliveries`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `has_role(auth.uid(), 'admin'::app_role)` |
| WITH CHECK |  |


## Triggers

_nenhum_


## Grants

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
