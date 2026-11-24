# public.winloss_webhook_dispatch_metrics

> Tabela public.winloss_webhook_dispatch_metrics. Estrutura registrada no catálogo do PostgreSQL: id uuid NOT NULL DEFAULT gen_random_uuid(), metric text NOT NULL, event text NOT NULL, request_id text NULLABLE, active_subscriptions_count integer NOT NULL DEFAULT 0, matching_subscriptions_count integer NOT NULL DEFAULT 0, metadata jsonb NOT NULL DEFAULT '{}'::jsonb, created_at timestamp with time zone NOT NULL DEFAULT now().

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
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  | Coluna id da tabela public.winloss_webhook_dispatch_metrics. Tipo PostgreSQL: uuid. Participa da chave primária. Não aceita NULL. Valor padrão: gen_random_uuid(). |
| 2 | `metric` | `text` | não |  |  | Coluna metric da tabela public.winloss_webhook_dispatch_metrics. Tipo PostgreSQL: text. Não aceita NULL. |
| 3 | `event` | `text` | não |  |  | Coluna event da tabela public.winloss_webhook_dispatch_metrics. Tipo PostgreSQL: text. Não aceita NULL. |
| 4 | `request_id` | `text` | sim |  |  | Coluna request_id da tabela public.winloss_webhook_dispatch_metrics. Tipo PostgreSQL: text. Aceita NULL. |
| 5 | `active_subscriptions_count` | `integer` | não | `0` |  | Coluna active_subscriptions_count da tabela public.winloss_webhook_dispatch_metrics. Tipo PostgreSQL: integer. Não aceita NULL. Valor padrão: 0. |
| 6 | `matching_subscriptions_count` | `integer` | não | `0` |  | Coluna matching_subscriptions_count da tabela public.winloss_webhook_dispatch_metrics. Tipo PostgreSQL: integer. Não aceita NULL. Valor padrão: 0. |
| 7 | `metadata` | `jsonb` | não | `'{}'::jsonb` |  | Coluna metadata da tabela public.winloss_webhook_dispatch_metrics. Tipo PostgreSQL: jsonb. Não aceita NULL. Valor padrão: '{}'::jsonb. |
| 8 | `created_at` | `timestamp with time zone` | não | `now()` |  | Coluna created_at da tabela public.winloss_webhook_dispatch_metrics. Tipo PostgreSQL: timestamp with time zone. Não aceita NULL. Valor padrão: now(). |


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
