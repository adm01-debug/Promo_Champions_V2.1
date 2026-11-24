# public.audit_logs

> Tabela public.audit_logs. Estrutura registrada no catálogo do PostgreSQL: id uuid NOT NULL DEFAULT gen_random_uuid(), actor_id uuid NULLABLE, actor_email text NULLABLE, action text NOT NULL, entity_type text NOT NULL, entity_id text NULLABLE, changes jsonb NULLABLE DEFAULT '{}'::jsonb, ip_address text NULLABLE, user_agent text NULLABLE, metadata jsonb NULLABLE DEFAULT '{}'::jsonb, created_at timestamp with time zone NOT NULL DEFAULT now(), table_name text NULLABLE, record_id text NULLABLE, old_data jsonb NULLABLE, new_data jsonb NULLABLE, request_id text NULLABLE.

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
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  | Coluna id da tabela public.audit_logs. Tipo PostgreSQL: uuid. Participa da chave primária. Não aceita NULL. Valor padrão: gen_random_uuid(). |
| 2 | `actor_id` | `uuid` | sim |  |  | Coluna actor_id da tabela public.audit_logs. Tipo PostgreSQL: uuid. Aceita NULL. |
| 3 | `actor_email` | `text` | sim |  |  | Coluna actor_email da tabela public.audit_logs. Tipo PostgreSQL: text. Aceita NULL. |
| 4 | `action` | `text` | não |  |  | Coluna action da tabela public.audit_logs. Tipo PostgreSQL: text. Não aceita NULL. |
| 5 | `entity_type` | `text` | não |  |  | Coluna entity_type da tabela public.audit_logs. Tipo PostgreSQL: text. Não aceita NULL. |
| 6 | `entity_id` | `text` | sim |  |  | Coluna entity_id da tabela public.audit_logs. Tipo PostgreSQL: text. Aceita NULL. |
| 7 | `changes` | `jsonb` | sim | `'{}'::jsonb` |  | Coluna changes da tabela public.audit_logs. Tipo PostgreSQL: jsonb. Aceita NULL. Valor padrão: '{}'::jsonb. |
| 8 | `ip_address` | `text` | sim |  |  | Coluna ip_address da tabela public.audit_logs. Tipo PostgreSQL: text. Aceita NULL. |
| 9 | `user_agent` | `text` | sim |  |  | Coluna user_agent da tabela public.audit_logs. Tipo PostgreSQL: text. Aceita NULL. |
| 10 | `metadata` | `jsonb` | sim | `'{}'::jsonb` |  | Coluna metadata da tabela public.audit_logs. Tipo PostgreSQL: jsonb. Aceita NULL. Valor padrão: '{}'::jsonb. |
| 11 | `created_at` | `timestamp with time zone` | não | `now()` |  | Coluna created_at da tabela public.audit_logs. Tipo PostgreSQL: timestamp with time zone. Não aceita NULL. Valor padrão: now(). |
| 12 | `table_name` | `text` | sim |  |  | Coluna table_name da tabela public.audit_logs. Tipo PostgreSQL: text. Aceita NULL. |
| 13 | `record_id` | `text` | sim |  |  | Coluna record_id da tabela public.audit_logs. Tipo PostgreSQL: text. Aceita NULL. |
| 14 | `old_data` | `jsonb` | sim |  |  | Coluna old_data da tabela public.audit_logs. Tipo PostgreSQL: jsonb. Aceita NULL. |
| 15 | `new_data` | `jsonb` | sim |  |  | Coluna new_data da tabela public.audit_logs. Tipo PostgreSQL: jsonb. Aceita NULL. |
| 16 | `request_id` | `text` | sim |  |  | Coluna request_id da tabela public.audit_logs. Tipo PostgreSQL: text. Aceita NULL. |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| audit_logs_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| audit_logs_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX audit_logs_pkey ON public.audit_logs USING btree (id)` |
| idx_audit_logs_action | btree | action | não | sim |  | `CREATE INDEX idx_audit_logs_action ON public.audit_logs USING btree (action)` |
| idx_audit_logs_actor_id | btree | actor_id | não | sim |  | `CREATE INDEX idx_audit_logs_actor_id ON public.audit_logs USING btree (actor_id)` |
| idx_audit_logs_changed_by_changed | btree | actor_id, created_at | não | sim |  | `CREATE INDEX idx_audit_logs_changed_by_changed ON public.audit_logs USING btree (actor_id, created_at DESC)` |
| idx_audit_logs_created_at | btree | created_at | não | sim |  | `CREATE INDEX idx_audit_logs_created_at ON public.audit_logs USING btree (created_at DESC)` |
| idx_audit_logs_entity | btree | entity_type, entity_id | não | sim |  | `CREATE INDEX idx_audit_logs_entity ON public.audit_logs USING btree (entity_type, entity_id)` |
| idx_audit_logs_record_id | btree | record_id | não | sim |  | `CREATE INDEX idx_audit_logs_record_id ON public.audit_logs USING btree (record_id)` |
| idx_audit_logs_table_changed | btree | entity_type, created_at | não | sim |  | `CREATE INDEX idx_audit_logs_table_changed ON public.audit_logs USING btree (entity_type, created_at DESC)` |
| idx_audit_logs_table_name | btree | table_name, created_at | não | sim |  | `CREATE INDEX idx_audit_logs_table_name ON public.audit_logs USING btree (table_name, created_at DESC)` |


## Policies (RLS)

### `Admins can view audit logs`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `has_role(auth.uid(), 'admin'::app_role)` |
| WITH CHECK |  |

### `Users can insert own audit entries`

| campo | valor |
|---|---|
| comando | INSERT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING |  |
| WITH CHECK | `(auth.uid() = actor_id)` |


## Triggers

_nenhum_


## Grants

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
