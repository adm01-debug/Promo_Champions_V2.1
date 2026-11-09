# public.security_events

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
| 1 | `id` | `uuid` | não | `uuid_generate_v4()` |  |  |
| 2 | `user_id` | `uuid` | sim |  |  |  |
| 3 | `event_type` | `text` | não |  |  |  |
| 4 | `severity` | `text` | não |  |  |  |
| 5 | `description` | `text` | não |  |  |  |
| 6 | `ip_address` | `inet` | sim |  |  |  |
| 7 | `user_agent` | `text` | sim |  |  |  |
| 8 | `metadata` | `jsonb` | sim |  |  |  |
| 9 | `created_at` | `timestamp with time zone` | sim | `now()` |  |  |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| security_events_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| security_events_severity_check | CHECK | `CHECK (severity = ANY (ARRAY['low'::text, 'medium'::text, 'high'::text, 'critical'::text]))` |  |  | sim |
| security_events_user_id_fkey | FOREIGN KEY | `FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL` | SET NULL | NO ACTION | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| idx_security_events_severity | btree | severity, created_at | não | sim |  | `CREATE INDEX idx_security_events_severity ON public.security_events USING btree (severity, created_at DESC)` |
| idx_security_events_type | btree | event_type | não | sim |  | `CREATE INDEX idx_security_events_type ON public.security_events USING btree (event_type)` |
| idx_security_events_type_created | btree | event_type, created_at | não | sim |  | `CREATE INDEX idx_security_events_type_created ON public.security_events USING btree (event_type, created_at DESC)` |
| idx_security_events_user | btree | user_id, created_at | não | sim |  | `CREATE INDEX idx_security_events_user ON public.security_events USING btree (user_id, created_at DESC)` |
| idx_security_events_user_created | btree | user_id, created_at | não | sim |  | `CREATE INDEX idx_security_events_user_created ON public.security_events USING btree (user_id, created_at DESC)` |
| security_events_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX security_events_pkey ON public.security_events USING btree (id)` |


## Policies (RLS)

### `Admins and managers can read security_events`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | public |
| USING | `is_admin_or_manager(auth.uid())` |
| WITH CHECK |  |


## Triggers

_nenhum_


## Grants

| role | privilégios |
|---|---|
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
