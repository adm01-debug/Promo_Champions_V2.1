# public.sale_notifications_audit

> Tabela public.sale_notifications_audit. Estrutura registrada no catálogo do PostgreSQL: id uuid NOT NULL DEFAULT gen_random_uuid(), sale_id uuid NULLABLE, seller_id uuid NULLABLE, seller_name text NULLABLE, sale_amount numeric NULLABLE, seller_rank_at_time integer NULLABLE, recipient_id uuid NULLABLE, recipient_rank_at_time integer NULLABLE, notification_type text NULLABLE DEFAULT 'in-app'::text, status text NULLABLE DEFAULT 'sent'::text, created_at timestamp with time zone NULLABLE DEFAULT now(), message_sent text NULLABLE, channel text NULLABLE, error_log text NULLABLE. Relacionamentos FK: recipient_id → public.salespeople(id); sale_id → public.sales(id); seller_id → public.salespeople(id).

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
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  | Coluna id da tabela public.sale_notifications_audit. Tipo PostgreSQL: uuid. Participa da chave primária. Não aceita NULL. Valor padrão: gen_random_uuid(). |
| 2 | `sale_id` | `uuid` | sim |  |  | Coluna sale_id da tabela public.sale_notifications_audit. Tipo PostgreSQL: uuid. Aceita NULL. Referência FK: public.sales(id). |
| 3 | `seller_id` | `uuid` | sim |  |  | Coluna seller_id da tabela public.sale_notifications_audit. Tipo PostgreSQL: uuid. Aceita NULL. Referência FK: public.salespeople(id). |
| 4 | `seller_name` | `text` | sim |  |  | Coluna seller_name da tabela public.sale_notifications_audit. Tipo PostgreSQL: text. Aceita NULL. |
| 5 | `sale_amount` | `numeric` | sim |  |  | Coluna sale_amount da tabela public.sale_notifications_audit. Tipo PostgreSQL: numeric. Aceita NULL. |
| 6 | `seller_rank_at_time` | `integer` | sim |  |  | Coluna seller_rank_at_time da tabela public.sale_notifications_audit. Tipo PostgreSQL: integer. Aceita NULL. |
| 7 | `recipient_id` | `uuid` | sim |  |  | Coluna recipient_id da tabela public.sale_notifications_audit. Tipo PostgreSQL: uuid. Aceita NULL. Referência FK: public.salespeople(id). |
| 8 | `recipient_rank_at_time` | `integer` | sim |  |  | Coluna recipient_rank_at_time da tabela public.sale_notifications_audit. Tipo PostgreSQL: integer. Aceita NULL. |
| 9 | `notification_type` | `text` | sim | `'in-app'::text` |  | Coluna notification_type da tabela public.sale_notifications_audit. Tipo PostgreSQL: text. Aceita NULL. Valor padrão: 'in-app'::text. |
| 10 | `status` | `text` | sim | `'sent'::text` |  | Coluna status da tabela public.sale_notifications_audit. Tipo PostgreSQL: text. Aceita NULL. Valor padrão: 'sent'::text. |
| 11 | `created_at` | `timestamp with time zone` | sim | `now()` |  | Coluna created_at da tabela public.sale_notifications_audit. Tipo PostgreSQL: timestamp with time zone. Aceita NULL. Valor padrão: now(). |
| 12 | `message_sent` | `text` | sim |  |  | Coluna message_sent da tabela public.sale_notifications_audit. Tipo PostgreSQL: text. Aceita NULL. |
| 13 | `channel` | `text` | sim |  |  | Coluna channel da tabela public.sale_notifications_audit. Tipo PostgreSQL: text. Aceita NULL. |
| 14 | `error_log` | `text` | sim |  |  | Coluna error_log da tabela public.sale_notifications_audit. Tipo PostgreSQL: text. Aceita NULL. |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| sale_notifications_audit_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| sale_notifications_audit_recipient_id_fkey | FOREIGN KEY | `FOREIGN KEY (recipient_id) REFERENCES salespeople(id) ON DELETE SET NULL` | SET NULL | NO ACTION | sim |
| sale_notifications_audit_sale_id_fkey | FOREIGN KEY | `FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE SET NULL` | SET NULL | NO ACTION | sim |
| sale_notifications_audit_seller_id_fkey | FOREIGN KEY | `FOREIGN KEY (seller_id) REFERENCES salespeople(id) ON DELETE SET NULL` | SET NULL | NO ACTION | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| idx_sale_notifications_audit_recipient_id | btree | recipient_id | não | sim |  | `CREATE INDEX idx_sale_notifications_audit_recipient_id ON public.sale_notifications_audit USING btree (recipient_id)` |
| idx_sale_notifications_audit_sale_id | btree | sale_id | não | sim |  | `CREATE INDEX idx_sale_notifications_audit_sale_id ON public.sale_notifications_audit USING btree (sale_id)` |
| idx_sale_notifications_audit_seller_id | btree | seller_id | não | sim |  | `CREATE INDEX idx_sale_notifications_audit_seller_id ON public.sale_notifications_audit USING btree (seller_id)` |
| sale_notifications_audit_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX sale_notifications_audit_pkey ON public.sale_notifications_audit USING btree (id)` |


## Policies (RLS)

### `Managers can view sale notification audits`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | public |
| USING | `(EXISTS ( SELECT 1    FROM user_roles   WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = ANY (ARRAY['admin'::app_role, 'manager'::app_role])))))` |
| WITH CHECK |  |


## Triggers

_nenhum_


## Grants

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
