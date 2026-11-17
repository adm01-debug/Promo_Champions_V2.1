# public.activity_audit_logs

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
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  |  |
| 2 | `activity_id` | `uuid` | não |  |  |  |
| 3 | `changed_by` | `uuid` | sim |  |  |  |
| 4 | `old_data` | `jsonb` | sim |  |  |  |
| 5 | `new_data` | `jsonb` | sim |  |  |  |
| 6 | `action` | `text` | não |  |  |  |
| 7 | `created_at` | `timestamp with time zone` | não | `now()` |  |  |


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
