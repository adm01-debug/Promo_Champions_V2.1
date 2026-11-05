# public.user_2fa_backup_codes

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
| 1 | `id` | `uuid` | não | `uuid_generate_v4()` |  |  |
| 2 | `user_id` | `uuid` | não |  |  |  |
| 3 | `code` | `text` | não |  |  |  |
| 4 | `used` | `boolean` | sim | `false` |  |  |
| 5 | `used_at` | `timestamp with time zone` | sim |  |  |  |
| 6 | `created_at` | `timestamp with time zone` | sim | `now()` |  |  |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| user_2fa_backup_codes_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| user_2fa_backup_codes_user_id_fkey | FOREIGN KEY | `FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| idx_backup_codes_used | btree | used, user_id | não | sim |  | `CREATE INDEX idx_backup_codes_used ON public.user_2fa_backup_codes USING btree (used, user_id)` |
| idx_backup_codes_user | btree | user_id | não | sim |  | `CREATE INDEX idx_backup_codes_user ON public.user_2fa_backup_codes USING btree (user_id)` |
| user_2fa_backup_codes_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX user_2fa_backup_codes_pkey ON public.user_2fa_backup_codes USING btree (id)` |


## Policies (RLS)

### `Users can update own backup codes`

| campo | valor |
|---|---|
| comando | UPDATE |
| tipo | PERMISSIVE |
| roles | public |
| USING | `(auth.uid() = user_id)` |
| WITH CHECK |  |

### `Users can view own backup codes`

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
