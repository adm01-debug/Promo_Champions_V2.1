# public.winloss_webhook_alerts

> Tabela public.winloss_webhook_alerts. Estrutura registrada no catálogo do PostgreSQL: id uuid NOT NULL DEFAULT gen_random_uuid(), subscription_id uuid NOT NULL, kind text NOT NULL, details jsonb NOT NULL DEFAULT '{}'::jsonb, fired_at timestamp with time zone NOT NULL DEFAULT now(), request_id uuid NULLABLE, suppressed boolean NOT NULL DEFAULT false, suppress_reason text NULLABLE. Relacionamentos FK: subscription_id → public.winloss_webhook_subscriptions(id).

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
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  | Coluna id da tabela public.winloss_webhook_alerts. Tipo PostgreSQL: uuid. Participa da chave primária. Não aceita NULL. Valor padrão: gen_random_uuid(). |
| 2 | `subscription_id` | `uuid` | não |  |  | Coluna subscription_id da tabela public.winloss_webhook_alerts. Tipo PostgreSQL: uuid. Não aceita NULL. Referência FK: public.winloss_webhook_subscriptions(id). |
| 3 | `kind` | `text` | não |  |  | Coluna kind da tabela public.winloss_webhook_alerts. Tipo PostgreSQL: text. Não aceita NULL. Validação CHECK: CHECK (kind = ANY (ARRAY['consecutive_failures'::text, 'high_retry_rate'::text, 'attempts_exhausted'::text])). |
| 4 | `details` | `jsonb` | não | `'{}'::jsonb` |  | Coluna details da tabela public.winloss_webhook_alerts. Tipo PostgreSQL: jsonb. Não aceita NULL. Valor padrão: '{}'::jsonb. |
| 5 | `fired_at` | `timestamp with time zone` | não | `now()` |  | Coluna fired_at da tabela public.winloss_webhook_alerts. Tipo PostgreSQL: timestamp with time zone. Não aceita NULL. Valor padrão: now(). |
| 6 | `request_id` | `uuid` | sim |  |  | Coluna request_id da tabela public.winloss_webhook_alerts. Tipo PostgreSQL: uuid. Aceita NULL. |
| 7 | `suppressed` | `boolean` | não | `false` |  | Coluna suppressed da tabela public.winloss_webhook_alerts. Tipo PostgreSQL: boolean. Não aceita NULL. Valor padrão: false. |
| 8 | `suppress_reason` | `text` | sim |  |  | Coluna suppress_reason da tabela public.winloss_webhook_alerts. Tipo PostgreSQL: text. Aceita NULL. |


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

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
