# public.reauthentication_requests

| propriedade | valor |
|---|---|
| tipo | table |
| owner | postgres |
| RLS habilitado | sim |
| RLS forçado (owner) | não |
| policies | 3 |
| realtime (publication) | não |
| replica identity | default |
| vem de extensão | não |


## Colunas

| # | coluna | tipo | nullable | default | identity/generated | comentário |
|---|---|---|---|---|---|---|
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  |  |
| 2 | `user_id` | `uuid` | não |  |  |  |
| 3 | `action_type` | `text` | não |  |  |  |
| 4 | `verified` | `boolean` | sim | `false` |  |  |
| 5 | `verified_at` | `timestamp with time zone` | sim |  |  |  |
| 6 | `expires_at` | `timestamp with time zone` | não |  |  |  |
| 7 | `ip_address` | `text` | sim |  |  |  |
| 8 | `user_agent` | `text` | sim |  |  |  |
| 9 | `created_at` | `timestamp with time zone` | sim | `now()` |  |  |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| reauthentication_requests_action_type_check | CHECK | `CHECK (action_type = ANY (ARRAY['password_change'::text, 'email_change'::text, 'mfa_config'::text, 'admin_action'::text, 'delete_account'::text]))` |  |  | sim |
| reauthentication_requests_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| reauthentication_requests_user_id_fkey | FOREIGN KEY | `FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| idx_reauth_user | btree | user_id, expires_at | não | sim |  | `CREATE INDEX idx_reauth_user ON public.reauthentication_requests USING btree (user_id, expires_at)` |
| reauthentication_requests_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX reauthentication_requests_pkey ON public.reauthentication_requests USING btree (id)` |


## Policies (RLS)

### `Users can delete own reauth requests`

| campo | valor |
|---|---|
| comando | DELETE |
| tipo | PERMISSIVE |
| roles | public |
| USING | `(auth.uid() = user_id)` |
| WITH CHECK |  |

### `Users can insert own reauth requests`

| campo | valor |
|---|---|
| comando | INSERT |
| tipo | PERMISSIVE |
| roles | public |
| USING |  |
| WITH CHECK | `(auth.uid() = user_id)` |

### `Users can view own reauth requests`

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

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
