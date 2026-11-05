# public.winloss_webhook_subscriptions

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
| 2 | `url` | `text` | não |  |  |  |
| 3 | `events` | `text[]` | não | `ARRAY['critical_pattern'::text, 'anomaly'::text, 'perf_drop'::text]` |  |  |
| 4 | `active` | `boolean` | não | `true` |  |  |
| 5 | `secret` | `text` | sim |  |  |  |
| 6 | `last_dispatch_at` | `timestamp with time zone` | sim |  |  |  |
| 7 | `last_status` | `integer` | sim |  |  |  |
| 8 | `created_by` | `uuid` | não |  |  |  |
| 9 | `created_at` | `timestamp with time zone` | não | `now()` |  |  |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| winloss_webhook_subscriptions_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |


## Referenciada por (FKs de outras tabelas)

| tabela | constraint | colunas | on delete |
|---|---|---|---|
| public.winloss_webhook_alerts | winloss_webhook_alerts_subscription_id_fkey | subscription_id | CASCADE |
| public.winloss_webhook_dead_letters | winloss_webhook_dead_letters_subscription_id_fkey | subscription_id | CASCADE |
| public.winloss_webhook_deliveries | winloss_webhook_deliveries_subscription_id_fkey | subscription_id | CASCADE |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| idx_winloss_webhook_active | btree | active | não | sim | `(active = true)` | `CREATE INDEX idx_winloss_webhook_active ON public.winloss_webhook_subscriptions USING btree (active) WHERE (active = true)` |
| winloss_webhook_subscriptions_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX winloss_webhook_subscriptions_pkey ON public.winloss_webhook_subscriptions USING btree (id)` |


## Policies (RLS)

### `admin manage webhooks`

| campo | valor |
|---|---|
| comando | ALL |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `has_role(auth.uid(), 'admin'::app_role)` |
| WITH CHECK | `has_role(auth.uid(), 'admin'::app_role)` |


## Triggers

_nenhum_


## Grants

_nenhum_
