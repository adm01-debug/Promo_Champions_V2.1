# public.login_alerts

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
| 2 | `user_id` | `uuid` | não |  |  |  |
| 3 | `device_fingerprint` | `text` | não |  |  |  |
| 4 | `ip_address` | `text` | sim |  |  |  |
| 5 | `browser` | `text` | sim |  |  |  |
| 6 | `os` | `text` | sim |  |  |  |
| 7 | `location` | `text` | sim |  |  |  |
| 8 | `alert_type` | `text` | sim | `'new_device'::text` |  |  |
| 9 | `email_sent` | `boolean` | sim | `false` |  |  |
| 10 | `email_sent_at` | `timestamp with time zone` | sim |  |  |  |
| 11 | `acknowledged` | `boolean` | sim | `false` |  |  |
| 12 | `acknowledged_at` | `timestamp with time zone` | sim |  |  |  |
| 13 | `created_at` | `timestamp with time zone` | sim | `now()` |  |  |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| login_alerts_alert_type_check | CHECK | `CHECK (alert_type = ANY (ARRAY['new_device'::text, 'new_ip'::text, 'new_location'::text, 'suspicious'::text]))` |  |  | sim |
| login_alerts_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| login_alerts_user_id_fkey | FOREIGN KEY | `FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| idx_login_alerts_user | btree | user_id, created_at | não | sim |  | `CREATE INDEX idx_login_alerts_user ON public.login_alerts USING btree (user_id, created_at DESC)` |
| login_alerts_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX login_alerts_pkey ON public.login_alerts USING btree (id)` |


## Policies (RLS)

### `Users can update own alerts`

| campo | valor |
|---|---|
| comando | UPDATE |
| tipo | PERMISSIVE |
| roles | public |
| USING | `(auth.uid() = user_id)` |
| WITH CHECK |  |

### `Users can view own alerts`

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
