# public.winloss_webhook_alerts

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
| 2 | `subscription_id` | `uuid` | não |  |  |  |
| 3 | `kind` | `text` | não |  |  |  |
| 4 | `details` | `jsonb` | não | `'{}'::jsonb` |  |  |
| 5 | `fired_at` | `timestamp with time zone` | não | `now()` |  |  |
| 6 | `request_id` | `uuid` | sim |  |  |  |
| 7 | `suppressed` | `boolean` | não | `false` |  |  |
| 8 | `suppress_reason` | `text` | sim |  |  |  |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| winloss_webhook_alerts_kind_check | CHECK | `CHECK (kind = ANY (ARRAY['consecutive_failures'::text, 'high_retry_rate'::text, 'attempts_exhausted'::text]))` |  |  | sim |
| winloss_webhook_alerts_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| winloss_webhook_alerts_subscription_id_fkey | FOREIGN KEY | `FOREIGN KEY (subscription_id) REFERENCES winloss_webhook_subscriptions(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| idx_winloss_webhook_alerts_fired_at | btree | fired_at | não | sim |  | `CREATE INDEX idx_winloss_webhook_alerts_fired_at ON public.winloss_webhook_alerts USING btree (fired_at DESC)` |
| idx_winloss_webhook_alerts_request_id | btree | request_id | não | sim |  | `CREATE INDEX idx_winloss_webhook_alerts_request_id ON public.winloss_webhook_alerts USING btree (request_id)` |
| idx_winloss_webhook_alerts_sub | btree | subscription_id, fired_at | não | sim |  | `CREATE INDEX idx_winloss_webhook_alerts_sub ON public.winloss_webhook_alerts USING btree (subscription_id, fired_at DESC)` |
| idx_winloss_webhook_alerts_sub_kind_fired | btree | subscription_id, kind, fired_at | não | sim |  | `CREATE INDEX idx_winloss_webhook_alerts_sub_kind_fired ON public.winloss_webhook_alerts USING btree (subscription_id, kind, fired_at DESC)` |
| winloss_webhook_alerts_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX winloss_webhook_alerts_pkey ON public.winloss_webhook_alerts USING btree (id)` |


## Policies (RLS)

### `admin read webhook alerts`

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

_nenhum_
