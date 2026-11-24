# public.winloss_webhook_subscriptions

> Tabela public.winloss_webhook_subscriptions. Estrutura registrada no catálogo do PostgreSQL: id uuid NOT NULL DEFAULT gen_random_uuid(), url text NOT NULL, events text[] NOT NULL DEFAULT ARRAY['critical_pattern'::text, 'anomaly'::text, 'perf_drop'::text], active boolean NOT NULL DEFAULT true, secret text NULLABLE, last_dispatch_at timestamp with time zone NULLABLE, last_status integer NULLABLE, created_by uuid NOT NULL, created_at timestamp with time zone NOT NULL DEFAULT now(), rate_limit_per_minute integer NOT NULL DEFAULT 60, rate_limit_window_seconds integer NOT NULL DEFAULT 60.

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
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  | Coluna id da tabela public.winloss_webhook_subscriptions. Tipo PostgreSQL: uuid. Participa da chave primária. Não aceita NULL. Valor padrão: gen_random_uuid(). |
| 2 | `url` | `text` | não |  |  | Coluna url da tabela public.winloss_webhook_subscriptions. Tipo PostgreSQL: text. Não aceita NULL. |
| 3 | `events` | `text[]` | não | `ARRAY['critical_pattern'::text, 'anomaly'::text, 'perf_drop'::text]` |  | Coluna events da tabela public.winloss_webhook_subscriptions. Tipo PostgreSQL: text[]. Não aceita NULL. Valor padrão: ARRAY['critical_pattern'::text, 'anomaly'::text, 'perf_drop'::text]. |
| 4 | `active` | `boolean` | não | `true` |  | Coluna active da tabela public.winloss_webhook_subscriptions. Tipo PostgreSQL: boolean. Não aceita NULL. Valor padrão: true. |
| 5 | `secret` | `text` | sim |  |  | Coluna secret da tabela public.winloss_webhook_subscriptions. Tipo PostgreSQL: text. Aceita NULL. |
| 6 | `last_dispatch_at` | `timestamp with time zone` | sim |  |  | Coluna last_dispatch_at da tabela public.winloss_webhook_subscriptions. Tipo PostgreSQL: timestamp with time zone. Aceita NULL. |
| 7 | `last_status` | `integer` | sim |  |  | Coluna last_status da tabela public.winloss_webhook_subscriptions. Tipo PostgreSQL: integer. Aceita NULL. |
| 8 | `created_by` | `uuid` | não |  |  | Coluna created_by da tabela public.winloss_webhook_subscriptions. Tipo PostgreSQL: uuid. Não aceita NULL. |
| 9 | `created_at` | `timestamp with time zone` | não | `now()` |  | Coluna created_at da tabela public.winloss_webhook_subscriptions. Tipo PostgreSQL: timestamp with time zone. Não aceita NULL. Valor padrão: now(). |
| 10 | `rate_limit_per_minute` | `integer` | não | `60` |  | Coluna rate_limit_per_minute da tabela public.winloss_webhook_subscriptions. Tipo PostgreSQL: integer. Não aceita NULL. Valor padrão: 60. Validação CHECK: CHECK (rate_limit_per_minute > 0 AND rate_limit_window_seconds > 0). |
| 11 | `rate_limit_window_seconds` | `integer` | não | `60` |  | Coluna rate_limit_window_seconds da tabela public.winloss_webhook_subscriptions. Tipo PostgreSQL: integer. Não aceita NULL. Valor padrão: 60. Validação CHECK: CHECK (rate_limit_per_minute > 0 AND rate_limit_window_seconds > 0). |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| winloss_webhook_subscriptions_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| winloss_webhook_subscriptions_rate_limit_valido | CHECK | `CHECK (rate_limit_per_minute > 0 AND rate_limit_window_seconds > 0)` |  |  | sim |


## Referenciada por (FKs de outras tabelas)

| tabela | constraint | colunas | on delete |
|---|---|---|---|
| public.webhook_dispatch_rate | webhook_dispatch_rate_subscription_id_fkey | subscription_id | CASCADE |
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

| nome | timing | eventos | nível | status | função |
|---|---|---|---|---|---|
| audit_business_changes | AFTER | INSERT OR DELETE OR UPDATE | ROW | enabled | public.audit_log_row_change |


## Grants

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
