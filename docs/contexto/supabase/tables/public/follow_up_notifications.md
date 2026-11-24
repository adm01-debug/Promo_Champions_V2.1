# public.follow_up_notifications

> Tabela public.follow_up_notifications. Estrutura registrada no catálogo do PostgreSQL: id uuid NOT NULL DEFAULT gen_random_uuid(), user_id uuid NULLABLE, sale_id uuid NULLABLE, audit_log_id uuid NULLABLE, type text NOT NULL, status text NULLABLE DEFAULT 'unread'::text, message text NULLABLE, created_at timestamp with time zone NULLABLE DEFAULT now(). Relacionamentos FK: audit_log_id → public.follow_up_audit_logs(id); sale_id → public.sales(id); user_id → auth.users(id).

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
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  | Coluna id da tabela public.follow_up_notifications. Tipo PostgreSQL: uuid. Participa da chave primária. Não aceita NULL. Valor padrão: gen_random_uuid(). |
| 2 | `user_id` | `uuid` | sim |  |  | Coluna user_id da tabela public.follow_up_notifications. Tipo PostgreSQL: uuid. Aceita NULL. Referência FK: auth.users(id). |
| 3 | `sale_id` | `uuid` | sim |  |  | Coluna sale_id da tabela public.follow_up_notifications. Tipo PostgreSQL: uuid. Aceita NULL. Referência FK: public.sales(id). |
| 4 | `audit_log_id` | `uuid` | sim |  |  | Coluna audit_log_id da tabela public.follow_up_notifications. Tipo PostgreSQL: uuid. Aceita NULL. Referência FK: public.follow_up_audit_logs(id). |
| 5 | `type` | `text` | não |  |  | Coluna type da tabela public.follow_up_notifications. Tipo PostgreSQL: text. Não aceita NULL. |
| 6 | `status` | `text` | sim | `'unread'::text` |  | Coluna status da tabela public.follow_up_notifications. Tipo PostgreSQL: text. Aceita NULL. Valor padrão: 'unread'::text. |
| 7 | `message` | `text` | sim |  |  | Coluna message da tabela public.follow_up_notifications. Tipo PostgreSQL: text. Aceita NULL. |
| 8 | `created_at` | `timestamp with time zone` | sim | `now()` |  | Coluna created_at da tabela public.follow_up_notifications. Tipo PostgreSQL: timestamp with time zone. Aceita NULL. Valor padrão: now(). |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| follow_up_notifications_audit_log_id_fkey | FOREIGN KEY | `FOREIGN KEY (audit_log_id) REFERENCES follow_up_audit_logs(id) ON DELETE SET NULL` | SET NULL | NO ACTION | sim |
| follow_up_notifications_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| follow_up_notifications_sale_id_fkey | FOREIGN KEY | `FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE SET NULL` | SET NULL | NO ACTION | sim |
| follow_up_notifications_user_id_fkey | FOREIGN KEY | `FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL` | SET NULL | NO ACTION | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| follow_up_notifications_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX follow_up_notifications_pkey ON public.follow_up_notifications USING btree (id)` |
| idx_follow_up_notifications_audit_log_id | btree | audit_log_id | não | sim |  | `CREATE INDEX idx_follow_up_notifications_audit_log_id ON public.follow_up_notifications USING btree (audit_log_id)` |
| idx_follow_up_notifications_sale_id | btree | sale_id | não | sim |  | `CREATE INDEX idx_follow_up_notifications_sale_id ON public.follow_up_notifications USING btree (sale_id)` |
| idx_follow_up_notifications_user_id | btree | user_id | não | sim |  | `CREATE INDEX idx_follow_up_notifications_user_id ON public.follow_up_notifications USING btree (user_id)` |


## Policies (RLS)

### `Users can manage their own notifications`

| campo | valor |
|---|---|
| comando | ALL |
| tipo | PERMISSIVE |
| roles | public |
| USING | `(user_id = auth.uid())` |
| WITH CHECK |  |


## Triggers

_nenhum_


## Grants

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
