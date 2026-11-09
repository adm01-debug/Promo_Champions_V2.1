# public.access_denied_logs

| propriedade | valor |
|---|---|
| tipo | table |
| owner | postgres |
| RLS habilitado | sim |
| RLS forçado (owner) | não |
| policies | 4 |
| realtime (publication) | não |
| replica identity | default |
| vem de extensão | não |


## Colunas

| # | coluna | tipo | nullable | default | identity/generated | comentário |
|---|---|---|---|---|---|---|
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  |  |
| 2 | `user_id` | `uuid` | não |  |  |  |
| 3 | `user_email` | `text` | sim |  |  |  |
| 4 | `attempted_path` | `text` | não |  |  |  |
| 5 | `user_role` | `text` | sim |  |  |  |
| 6 | `required_role` | `text` | sim |  |  |  |
| 7 | `ip_address` | `text` | sim |  |  |  |
| 8 | `user_agent` | `text` | sim |  |  |  |
| 9 | `created_at` | `timestamp with time zone` | não | `now()` |  |  |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| access_denied_logs_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| access_denied_logs_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX access_denied_logs_pkey ON public.access_denied_logs USING btree (id)` |
| idx_access_denied_created_at | btree | created_at | não | sim |  | `CREATE INDEX idx_access_denied_created_at ON public.access_denied_logs USING btree (created_at DESC)` |
| idx_access_denied_logs_user_id | btree | user_id | não | sim |  | `CREATE INDEX idx_access_denied_logs_user_id ON public.access_denied_logs USING btree (user_id)` |


## Policies (RLS)

### `Admins can view access logs`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | public |
| USING | `(EXISTS ( SELECT 1    FROM user_roles   WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = 'admin'::app_role))))` |
| WITH CHECK |  |

### `Authenticated users can log access denied`

| campo | valor |
|---|---|
| comando | INSERT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING |  |
| WITH CHECK | `(user_id = auth.uid())` |

### `Authenticated users can log access denied events`

| campo | valor |
|---|---|
| comando | INSERT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING |  |
| WITH CHECK | `(auth.uid() = user_id)` |

### `Users can insert their own access logs`

| campo | valor |
|---|---|
| comando | INSERT |
| tipo | PERMISSIVE |
| roles | public |
| USING |  |
| WITH CHECK | `(auth.uid() = user_id)` |


## Triggers

_nenhum_


## Grants

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
