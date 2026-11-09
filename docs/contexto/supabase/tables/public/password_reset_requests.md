# public.password_reset_requests

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
| 2 | `user_email` | `text` | não |  |  |  |
| 3 | `user_id` | `uuid` | sim |  |  |  |
| 4 | `status` | `text` | não | `'pending'::text` |  |  |
| 5 | `requested_at` | `timestamp with time zone` | não | `now()` |  |  |
| 6 | `reviewed_at` | `timestamp with time zone` | sim |  |  |  |
| 7 | `reviewed_by` | `uuid` | sim |  |  |  |
| 8 | `rejection_reason` | `text` | sim |  |  |  |
| 9 | `expires_at` | `timestamp with time zone` | não | `(now() + '24:00:00'::interval)` |  |  |
| 10 | `ip_address` | `text` | sim |  |  |  |
| 11 | `user_agent` | `text` | sim |  |  |  |
| 12 | `created_at` | `timestamp with time zone` | não | `now()` |  |  |
| 13 | `updated_at` | `timestamp with time zone` | não | `now()` |  |  |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| password_reset_requests_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| password_reset_requests_status_check | CHECK | `CHECK (status = ANY (ARRAY['pending'::text, 'approved'::text, 'rejected'::text, 'completed'::text, 'expired'::text]))` |  |  | sim |
| password_reset_requests_user_id_fkey | FOREIGN KEY | `FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL` | SET NULL | NO ACTION | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| idx_password_reset_requests_status | btree | status, created_at | não | sim |  | `CREATE INDEX idx_password_reset_requests_status ON public.password_reset_requests USING btree (status, created_at DESC)` |
| idx_password_reset_requests_user_id | btree | user_id | não | sim |  | `CREATE INDEX idx_password_reset_requests_user_id ON public.password_reset_requests USING btree (user_id)` |
| password_reset_requests_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX password_reset_requests_pkey ON public.password_reset_requests USING btree (id)` |


## Policies (RLS)

### `Admins can manage password_reset_requests`

| campo | valor |
|---|---|
| comando | ALL |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `has_role(auth.uid(), 'admin'::app_role)` |
| WITH CHECK | `has_role(auth.uid(), 'admin'::app_role)` |

### `Users can insert own reset requests`

| campo | valor |
|---|---|
| comando | INSERT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING |  |
| WITH CHECK | `((user_id = auth.uid()) AND (user_email = get_current_user_email()) AND (status = 'pending'::text))` |

### `Users can view their own reset requests`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `((auth.uid() IS NOT NULL) AND (user_email = get_current_user_email()))` |
| WITH CHECK |  |


## Triggers

| nome | timing | eventos | nível | status | função |
|---|---|---|---|---|---|
| set_updated_at | BEFORE | UPDATE | ROW | enabled | public.handle_updated_at |
| update_password_reset_requests_updated_at | BEFORE | UPDATE | ROW | enabled | public.update_updated_at_column |


## Grants

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
