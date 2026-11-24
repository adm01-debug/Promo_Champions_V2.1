# public.webhook_deliveries

> Tabela public.webhook_deliveries. Estrutura registrada no catálogo do PostgreSQL: id uuid NOT NULL DEFAULT gen_random_uuid(), webhook_id uuid NOT NULL, event_type text NOT NULL, payload jsonb NOT NULL, response_status integer NULLABLE, response_body text NULLABLE, error_message text NULLABLE, attempts integer NOT NULL DEFAULT 1, success boolean NOT NULL DEFAULT false, duration_ms integer NULLABLE, created_at timestamp with time zone NOT NULL DEFAULT now(). Relacionamentos FK: webhook_id → public.webhooks(id).

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
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  | Coluna id da tabela public.webhook_deliveries. Tipo PostgreSQL: uuid. Participa da chave primária. Não aceita NULL. Valor padrão: gen_random_uuid(). |
| 2 | `webhook_id` | `uuid` | não |  |  | Coluna webhook_id da tabela public.webhook_deliveries. Tipo PostgreSQL: uuid. Não aceita NULL. Referência FK: public.webhooks(id). |
| 3 | `event_type` | `text` | não |  |  | Coluna event_type da tabela public.webhook_deliveries. Tipo PostgreSQL: text. Não aceita NULL. |
| 4 | `payload` | `jsonb` | não |  |  | Coluna payload da tabela public.webhook_deliveries. Tipo PostgreSQL: jsonb. Não aceita NULL. |
| 5 | `response_status` | `integer` | sim |  |  | Coluna response_status da tabela public.webhook_deliveries. Tipo PostgreSQL: integer. Aceita NULL. |
| 6 | `response_body` | `text` | sim |  |  | Coluna response_body da tabela public.webhook_deliveries. Tipo PostgreSQL: text. Aceita NULL. |
| 7 | `error_message` | `text` | sim |  |  | Coluna error_message da tabela public.webhook_deliveries. Tipo PostgreSQL: text. Aceita NULL. |
| 8 | `attempts` | `integer` | não | `1` |  | Coluna attempts da tabela public.webhook_deliveries. Tipo PostgreSQL: integer. Não aceita NULL. Valor padrão: 1. |
| 9 | `success` | `boolean` | não | `false` |  | Coluna success da tabela public.webhook_deliveries. Tipo PostgreSQL: boolean. Não aceita NULL. Valor padrão: false. |
| 10 | `duration_ms` | `integer` | sim |  |  | Coluna duration_ms da tabela public.webhook_deliveries. Tipo PostgreSQL: integer. Aceita NULL. |
| 11 | `created_at` | `timestamp with time zone` | não | `now()` |  | Coluna created_at da tabela public.webhook_deliveries. Tipo PostgreSQL: timestamp with time zone. Não aceita NULL. Valor padrão: now(). |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| webhook_deliveries_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| webhook_deliveries_webhook_id_fkey | FOREIGN KEY | `FOREIGN KEY (webhook_id) REFERENCES webhooks(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| idx_webhook_deliveries_created_at | btree | created_at | não | sim |  | `CREATE INDEX idx_webhook_deliveries_created_at ON public.webhook_deliveries USING btree (created_at DESC)` |
| idx_webhook_deliveries_webhook_id | btree | webhook_id | não | sim |  | `CREATE INDEX idx_webhook_deliveries_webhook_id ON public.webhook_deliveries USING btree (webhook_id)` |
| webhook_deliveries_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX webhook_deliveries_pkey ON public.webhook_deliveries USING btree (id)` |


## Policies (RLS)

### `Admins and managers can view deliveries`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `is_admin_or_manager(auth.uid())` |
| WITH CHECK |  |


## Triggers

_nenhum_


## Grants

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
