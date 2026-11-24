# public.winloss_webhook_replay_audit

> Tabela public.winloss_webhook_replay_audit. Estrutura registrada no catálogo do PostgreSQL: id uuid NOT NULL DEFAULT gen_random_uuid(), dead_letter_id uuid NULLABLE, delivery_id uuid NULLABLE, source text NOT NULL, request_id uuid NOT NULL, actor_user_id uuid NOT NULL, actor_email text NULLABLE, succeeded boolean NOT NULL, status_label text NOT NULL, http_status integer NOT NULL DEFAULT 0, error text NULLABLE, attempts integer NULLABLE, created_at timestamp with time zone NOT NULL DEFAULT now(). Relacionamentos FK: dead_letter_id → public.winloss_webhook_dead_letters(id).

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
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  | Coluna id da tabela public.winloss_webhook_replay_audit. Tipo PostgreSQL: uuid. Participa da chave primária. Não aceita NULL. Valor padrão: gen_random_uuid(). |
| 2 | `dead_letter_id` | `uuid` | sim |  |  | Coluna dead_letter_id da tabela public.winloss_webhook_replay_audit. Tipo PostgreSQL: uuid. Aceita NULL. Referência FK: public.winloss_webhook_dead_letters(id). |
| 3 | `delivery_id` | `uuid` | sim |  |  | Coluna delivery_id da tabela public.winloss_webhook_replay_audit. Tipo PostgreSQL: uuid. Aceita NULL. |
| 4 | `source` | `text` | não |  |  | Coluna source da tabela public.winloss_webhook_replay_audit. Tipo PostgreSQL: text. Não aceita NULL. Validação CHECK: CHECK (source = ANY (ARRAY['dlq'::text, 'delivery'::text])). |
| 5 | `request_id` | `uuid` | não |  |  | Coluna request_id da tabela public.winloss_webhook_replay_audit. Tipo PostgreSQL: uuid. Não aceita NULL. |
| 6 | `actor_user_id` | `uuid` | não |  |  | Coluna actor_user_id da tabela public.winloss_webhook_replay_audit. Tipo PostgreSQL: uuid. Não aceita NULL. |
| 7 | `actor_email` | `text` | sim |  |  | Coluna actor_email da tabela public.winloss_webhook_replay_audit. Tipo PostgreSQL: text. Aceita NULL. |
| 8 | `succeeded` | `boolean` | não |  |  | Coluna succeeded da tabela public.winloss_webhook_replay_audit. Tipo PostgreSQL: boolean. Não aceita NULL. |
| 9 | `status_label` | `text` | não |  |  | Coluna status_label da tabela public.winloss_webhook_replay_audit. Tipo PostgreSQL: text. Não aceita NULL. Validação CHECK: CHECK (status_label = ANY (ARRAY['succeeded'::text, 'failed'::text, 'skipped'::text])). |
| 10 | `http_status` | `integer` | não | `0` |  | Coluna http_status da tabela public.winloss_webhook_replay_audit. Tipo PostgreSQL: integer. Não aceita NULL. Valor padrão: 0. |
| 11 | `error` | `text` | sim |  |  | Coluna error da tabela public.winloss_webhook_replay_audit. Tipo PostgreSQL: text. Aceita NULL. |
| 12 | `attempts` | `integer` | sim |  |  | Coluna attempts da tabela public.winloss_webhook_replay_audit. Tipo PostgreSQL: integer. Aceita NULL. |
| 13 | `created_at` | `timestamp with time zone` | não | `now()` |  | Coluna created_at da tabela public.winloss_webhook_replay_audit. Tipo PostgreSQL: timestamp with time zone. Não aceita NULL. Valor padrão: now(). |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| winloss_webhook_replay_audit_dead_letter_id_fkey | FOREIGN KEY | `FOREIGN KEY (dead_letter_id) REFERENCES winloss_webhook_dead_letters(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |
| winloss_webhook_replay_audit_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| winloss_webhook_replay_audit_source_check | CHECK | `CHECK (source = ANY (ARRAY['dlq'::text, 'delivery'::text]))` |  |  | sim |
| winloss_webhook_replay_audit_status_label_check | CHECK | `CHECK (status_label = ANY (ARRAY['succeeded'::text, 'failed'::text, 'skipped'::text]))` |  |  | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| idx_wh_replay_audit_created | btree | created_at | não | sim |  | `CREATE INDEX idx_wh_replay_audit_created ON public.winloss_webhook_replay_audit USING btree (created_at DESC)` |
| idx_wh_replay_audit_dead_letter | btree | dead_letter_id, created_at | não | sim |  | `CREATE INDEX idx_wh_replay_audit_dead_letter ON public.winloss_webhook_replay_audit USING btree (dead_letter_id, created_at DESC)` |
| idx_wh_replay_audit_delivery | btree | delivery_id, created_at | não | sim |  | `CREATE INDEX idx_wh_replay_audit_delivery ON public.winloss_webhook_replay_audit USING btree (delivery_id, created_at DESC)` |
| idx_wh_replay_audit_request | btree | request_id | não | sim |  | `CREATE INDEX idx_wh_replay_audit_request ON public.winloss_webhook_replay_audit USING btree (request_id)` |
| winloss_webhook_replay_audit_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX winloss_webhook_replay_audit_pkey ON public.winloss_webhook_replay_audit USING btree (id)` |


## Policies (RLS)

### `Admins/Managers can view replay audit`

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
