# public.activity_audit_logs

> Tabela public.activity_audit_logs. Estrutura registrada no catálogo do PostgreSQL: id uuid NOT NULL DEFAULT gen_random_uuid(), activity_id uuid NOT NULL, changed_by uuid NULLABLE, old_data jsonb NULLABLE, new_data jsonb NULLABLE, action text NOT NULL, created_at timestamp with time zone NOT NULL DEFAULT now(). Relacionamentos FK: activity_id → public.activities(id); changed_by → auth.users(id).

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
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  | Coluna id da tabela public.activity_audit_logs. Tipo PostgreSQL: uuid. Participa da chave primária. Não aceita NULL. Valor padrão: gen_random_uuid(). |
| 2 | `activity_id` | `uuid` | não |  |  | Coluna activity_id da tabela public.activity_audit_logs. Tipo PostgreSQL: uuid. Não aceita NULL. Referência FK: public.activities(id). |
| 3 | `changed_by` | `uuid` | sim |  |  | Coluna changed_by da tabela public.activity_audit_logs. Tipo PostgreSQL: uuid. Aceita NULL. Referência FK: auth.users(id). |
| 4 | `old_data` | `jsonb` | sim |  |  | Coluna old_data da tabela public.activity_audit_logs. Tipo PostgreSQL: jsonb. Aceita NULL. |
| 5 | `new_data` | `jsonb` | sim |  |  | Coluna new_data da tabela public.activity_audit_logs. Tipo PostgreSQL: jsonb. Aceita NULL. |
| 6 | `action` | `text` | não |  |  | Coluna action da tabela public.activity_audit_logs. Tipo PostgreSQL: text. Não aceita NULL. |
| 7 | `created_at` | `timestamp with time zone` | não | `now()` |  | Coluna created_at da tabela public.activity_audit_logs. Tipo PostgreSQL: timestamp with time zone. Não aceita NULL. Valor padrão: now(). |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| activity_audit_logs_activity_id_fkey | FOREIGN KEY | `FOREIGN KEY (activity_id) REFERENCES activities(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |
| activity_audit_logs_changed_by_fkey | FOREIGN KEY | `FOREIGN KEY (changed_by) REFERENCES auth.users(id) ON DELETE SET NULL` | SET NULL | NO ACTION | sim |
| activity_audit_logs_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| activity_audit_logs_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX activity_audit_logs_pkey ON public.activity_audit_logs USING btree (id)` |
| idx_activity_audit_logs_activity_id | btree | activity_id | não | sim |  | `CREATE INDEX idx_activity_audit_logs_activity_id ON public.activity_audit_logs USING btree (activity_id)` |
| idx_activity_audit_logs_changed_by | btree | changed_by | não | sim |  | `CREATE INDEX idx_activity_audit_logs_changed_by ON public.activity_audit_logs USING btree (changed_by)` |


## Policies (RLS)

### `Users can view audit logs for their activities`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `((EXISTS ( SELECT 1    FROM activities a   WHERE ((a.id = activity_audit_logs.activity_id) AND (a.salesperson_id = get_current_salesperson_id())))) OR is_admin_or_manager(auth.uid()))` |
| WITH CHECK |  |


## Triggers

_nenhum_


## Grants

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
