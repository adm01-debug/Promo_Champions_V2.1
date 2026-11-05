# public.session_activity

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
| 2 | `user_id` | `uuid` | não |  |  |  |
| 3 | `action` | `text` | não |  |  |  |
| 4 | `ip_address` | `inet` | sim |  |  |  |
| 5 | `user_agent` | `text` | sim |  |  |  |
| 6 | `metadata` | `jsonb` | sim |  |  |  |
| 7 | `created_at` | `timestamp with time zone` | sim | `now()` |  |  |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| session_activity_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| session_activity_user_id_fkey | FOREIGN KEY | `FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| idx_session_activity_user | btree | user_id, created_at | não | sim |  | `CREATE INDEX idx_session_activity_user ON public.session_activity USING btree (user_id, created_at)` |
| idx_session_activity_user_created | btree | user_id, created_at | não | sim |  | `CREATE INDEX idx_session_activity_user_created ON public.session_activity USING btree (user_id, created_at DESC)` |
| session_activity_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX session_activity_pkey ON public.session_activity USING btree (id)` |


## Policies (RLS)

### `Users can view own session activity`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | public |
| USING | `(auth.uid() = user_id)` |
| WITH CHECK |  |


## Triggers

_nenhum_


## Grants

_nenhum_
