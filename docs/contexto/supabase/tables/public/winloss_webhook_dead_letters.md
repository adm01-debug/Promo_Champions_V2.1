# public.winloss_webhook_dead_letters

> Tabela public.winloss_webhook_dead_letters. Estrutura registrada no catálogo do PostgreSQL: id uuid NOT NULL DEFAULT gen_random_uuid(), subscription_id uuid NOT NULL, event text NOT NULL, payload jsonb NOT NULL, last_status smallint NOT NULL, last_error text NULLABLE, attempts smallint NOT NULL, total_latency_ms integer NOT NULL, request_id uuid NULLABLE, status text NOT NULL DEFAULT 'pending'::text, replay_count smallint NOT NULL DEFAULT 0, last_replay_at timestamp with time zone NULLABLE, last_replay_status smallint NULLABLE, last_replay_error text NULLABLE, created_at timestamp with time zone NOT NULL DEFAULT now(), updated_at timestamp with time zone NOT NULL DEFAULT now(), last_replay_request_id uuid NULLABLE. Relacionamentos FK: subscription_id → public.winloss_webhook_subscriptions(id).

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
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  | Coluna id da tabela public.winloss_webhook_dead_letters. Tipo PostgreSQL: uuid. Participa da chave primária. Não aceita NULL. Valor padrão: gen_random_uuid(). |
| 2 | `subscription_id` | `uuid` | não |  |  | Coluna subscription_id da tabela public.winloss_webhook_dead_letters. Tipo PostgreSQL: uuid. Não aceita NULL. Referência FK: public.winloss_webhook_subscriptions(id). |
| 3 | `event` | `text` | não |  |  | Coluna event da tabela public.winloss_webhook_dead_letters. Tipo PostgreSQL: text. Não aceita NULL. |
| 4 | `payload` | `jsonb` | não |  |  | Coluna payload da tabela public.winloss_webhook_dead_letters. Tipo PostgreSQL: jsonb. Não aceita NULL. |
| 5 | `last_status` | `smallint` | não |  |  | Coluna last_status da tabela public.winloss_webhook_dead_letters. Tipo PostgreSQL: smallint. Não aceita NULL. |
| 6 | `last_error` | `text` | sim |  |  | Coluna last_error da tabela public.winloss_webhook_dead_letters. Tipo PostgreSQL: text. Aceita NULL. |
| 7 | `attempts` | `smallint` | não |  |  | Coluna attempts da tabela public.winloss_webhook_dead_letters. Tipo PostgreSQL: smallint. Não aceita NULL. |
| 8 | `total_latency_ms` | `integer` | não |  |  | Coluna total_latency_ms da tabela public.winloss_webhook_dead_letters. Tipo PostgreSQL: integer. Não aceita NULL. |
| 9 | `request_id` | `uuid` | sim |  |  | Coluna request_id da tabela public.winloss_webhook_dead_letters. Tipo PostgreSQL: uuid. Aceita NULL. |
| 10 | `status` | `text` | não | `'pending'::text` |  | Coluna status da tabela public.winloss_webhook_dead_letters. Tipo PostgreSQL: text. Não aceita NULL. Valor padrão: 'pending'::text. Validação CHECK: CHECK (status = ANY (ARRAY['pending'::text, 'replaying'::text, 'replayed'::text, 'archived'::text])). |
| 11 | `replay_count` | `smallint` | não | `0` |  | Coluna replay_count da tabela public.winloss_webhook_dead_letters. Tipo PostgreSQL: smallint. Não aceita NULL. Valor padrão: 0. |
| 12 | `last_replay_at` | `timestamp with time zone` | sim |  |  | Coluna last_replay_at da tabela public.winloss_webhook_dead_letters. Tipo PostgreSQL: timestamp with time zone. Aceita NULL. |
| 13 | `last_replay_status` | `smallint` | sim |  |  | Coluna last_replay_status da tabela public.winloss_webhook_dead_letters. Tipo PostgreSQL: smallint. Aceita NULL. |
| 14 | `last_replay_error` | `text` | sim |  |  | Coluna last_replay_error da tabela public.winloss_webhook_dead_letters. Tipo PostgreSQL: text. Aceita NULL. |
| 15 | `created_at` | `timestamp with time zone` | não | `now()` |  | Coluna created_at da tabela public.winloss_webhook_dead_letters. Tipo PostgreSQL: timestamp with time zone. Não aceita NULL. Valor padrão: now(). |
| 16 | `updated_at` | `timestamp with time zone` | não | `now()` |  | Coluna updated_at da tabela public.winloss_webhook_dead_letters. Tipo PostgreSQL: timestamp with time zone. Não aceita NULL. Valor padrão: now(). |
| 17 | `last_replay_request_id` | `uuid` | sim |  |  | Coluna last_replay_request_id da tabela public.winloss_webhook_dead_letters. Tipo PostgreSQL: uuid. Aceita NULL. |


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
