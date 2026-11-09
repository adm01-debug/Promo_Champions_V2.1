# public.winloss_webhook_dispatch_metrics

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
| 2 | `metric` | `text` | não |  |  |  |
| 3 | `event` | `text` | não |  |  |  |
| 4 | `request_id` | `text` | sim |  |  |  |
| 5 | `active_subscriptions_count` | `integer` | não | `0` |  |  |
| 6 | `matching_subscriptions_count` | `integer` | não | `0` |  |  |
| 7 | `metadata` | `jsonb` | não | `'{}'::jsonb` |  |  |
| 8 | `created_at` | `timestamp with time zone` | não | `now()` |  |  |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| winloss_webhook_dispatch_metrics_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| idx_winloss_webhook_dispatch_metrics_event_created | btree | event, created_at | não | sim |  | `CREATE INDEX idx_winloss_webhook_dispatch_metrics_event_created ON public.winloss_webhook_dispatch_metrics USING btree (event, created_at DESC)` |
| idx_winloss_webhook_dispatch_metrics_metric_created | btree | metric, created_at | não | sim |  | `CREATE INDEX idx_winloss_webhook_dispatch_metrics_metric_created ON public.winloss_webhook_dispatch_metrics USING btree (metric, created_at DESC)` |
| winloss_webhook_dispatch_metrics_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX winloss_webhook_dispatch_metrics_pkey ON public.winloss_webhook_dispatch_metrics USING btree (id)` |


## Policies (RLS)

### `Admins can view dispatch metrics`

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
