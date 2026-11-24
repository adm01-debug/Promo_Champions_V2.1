# public.quote_conversion_audit

> Tabela public.quote_conversion_audit. Estrutura registrada no catálogo do PostgreSQL: id uuid NOT NULL DEFAULT gen_random_uuid(), quote_id uuid NOT NULL, sale_id uuid NULLABLE, order_id uuid NULLABLE, order_number text NULLABLE, previous_status text NULLABLE, new_status text NULLABLE, reused_order boolean NOT NULL DEFAULT false, idempotent boolean NOT NULL DEFAULT false, success boolean NOT NULL, error_code text NULLABLE, error_message text NULLABLE, latency_ms integer NULLABLE, request_id text NULLABLE, actor_user_id uuid NULLABLE, created_at timestamp with time zone NOT NULL DEFAULT now().

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
| usada por views | public.v_quote_conversion_history, public.v_quote_conversion_metrics_daily |


## Colunas

| # | coluna | tipo | nullable | default | identity/generated | comentário |
|---|---|---|---|---|---|---|
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  | Coluna id da tabela public.quote_conversion_audit. Tipo PostgreSQL: uuid. Participa da chave primária. Não aceita NULL. Valor padrão: gen_random_uuid(). |
| 2 | `quote_id` | `uuid` | não |  |  | Coluna quote_id da tabela public.quote_conversion_audit. Tipo PostgreSQL: uuid. Não aceita NULL. |
| 3 | `sale_id` | `uuid` | sim |  |  | Coluna sale_id da tabela public.quote_conversion_audit. Tipo PostgreSQL: uuid. Aceita NULL. |
| 4 | `order_id` | `uuid` | sim |  |  | Coluna order_id da tabela public.quote_conversion_audit. Tipo PostgreSQL: uuid. Aceita NULL. |
| 5 | `order_number` | `text` | sim |  |  | Coluna order_number da tabela public.quote_conversion_audit. Tipo PostgreSQL: text. Aceita NULL. |
| 6 | `previous_status` | `text` | sim |  |  | Coluna previous_status da tabela public.quote_conversion_audit. Tipo PostgreSQL: text. Aceita NULL. |
| 7 | `new_status` | `text` | sim |  |  | Coluna new_status da tabela public.quote_conversion_audit. Tipo PostgreSQL: text. Aceita NULL. |
| 8 | `reused_order` | `boolean` | não | `false` |  | Coluna reused_order da tabela public.quote_conversion_audit. Tipo PostgreSQL: boolean. Não aceita NULL. Valor padrão: false. |
| 9 | `idempotent` | `boolean` | não | `false` |  | Coluna idempotent da tabela public.quote_conversion_audit. Tipo PostgreSQL: boolean. Não aceita NULL. Valor padrão: false. |
| 10 | `success` | `boolean` | não |  |  | Coluna success da tabela public.quote_conversion_audit. Tipo PostgreSQL: boolean. Não aceita NULL. |
| 11 | `error_code` | `text` | sim |  |  | Coluna error_code da tabela public.quote_conversion_audit. Tipo PostgreSQL: text. Aceita NULL. |
| 12 | `error_message` | `text` | sim |  |  | Coluna error_message da tabela public.quote_conversion_audit. Tipo PostgreSQL: text. Aceita NULL. |
| 13 | `latency_ms` | `integer` | sim |  |  | Coluna latency_ms da tabela public.quote_conversion_audit. Tipo PostgreSQL: integer. Aceita NULL. |
| 14 | `request_id` | `text` | sim |  |  | Coluna request_id da tabela public.quote_conversion_audit. Tipo PostgreSQL: text. Aceita NULL. |
| 15 | `actor_user_id` | `uuid` | sim |  |  | Coluna actor_user_id da tabela public.quote_conversion_audit. Tipo PostgreSQL: uuid. Aceita NULL. |
| 16 | `created_at` | `timestamp with time zone` | não | `now()` |  | Coluna created_at da tabela public.quote_conversion_audit. Tipo PostgreSQL: timestamp with time zone. Não aceita NULL. Valor padrão: now(). |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| quote_conversion_audit_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| idx_quote_conversion_audit_created | btree | created_at | não | sim |  | `CREATE INDEX idx_quote_conversion_audit_created ON public.quote_conversion_audit USING btree (created_at DESC)` |
| idx_quote_conversion_audit_quote | btree | quote_id | não | sim |  | `CREATE INDEX idx_quote_conversion_audit_quote ON public.quote_conversion_audit USING btree (quote_id)` |
| idx_quote_conversion_audit_request | btree | request_id | não | sim |  | `CREATE INDEX idx_quote_conversion_audit_request ON public.quote_conversion_audit USING btree (request_id)` |
| idx_quote_conversion_audit_sale | btree | sale_id | não | sim |  | `CREATE INDEX idx_quote_conversion_audit_sale ON public.quote_conversion_audit USING btree (sale_id)` |
| quote_conversion_audit_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX quote_conversion_audit_pkey ON public.quote_conversion_audit USING btree (id)` |


## Policies (RLS)

### `admins can read conversion audit`

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
