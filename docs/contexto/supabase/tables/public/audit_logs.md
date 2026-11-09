# public.audit_logs

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
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  |  |
| 2 | `actor_id` | `uuid` | sim |  |  |  |
| 3 | `actor_email` | `text` | sim |  |  |  |
| 4 | `action` | `text` | não |  |  |  |
| 5 | `entity_type` | `text` | não |  |  |  |
| 6 | `entity_id` | `text` | sim |  |  |  |
| 7 | `changes` | `jsonb` | sim | `'{}'::jsonb` |  |  |
| 8 | `ip_address` | `text` | sim |  |  |  |
| 9 | `user_agent` | `text` | sim |  |  |  |
| 10 | `metadata` | `jsonb` | sim | `'{}'::jsonb` |  |  |
| 11 | `created_at` | `timestamp with time zone` | não | `now()` |  |  |
| 12 | `table_name` | `text` | sim |  |  |  |
| 13 | `record_id` | `text` | sim |  |  |  |
| 14 | `old_data` | `jsonb` | sim |  |  |  |
| 15 | `new_data` | `jsonb` | sim |  |  |  |
| 16 | `request_id` | `text` | sim |  |  |  |


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
