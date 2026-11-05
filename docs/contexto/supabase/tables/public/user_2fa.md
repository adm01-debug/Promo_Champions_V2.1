# public.user_2fa

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
| 2 | `user_id` | `uuid` | sim |  |  |  |
| 3 | `secret` | `text` | não |  |  |  |
| 4 | `enabled` | `boolean` | sim | `false` |  |  |
| 5 | `backup_codes` | `jsonb` | sim | `'[]'::jsonb` |  |  |
| 6 | `created_at` | `timestamp with time zone` | sim | `now()` |  |  |
| 7 | `updated_at` | `timestamp with time zone` | sim | `now()` |  |  |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| user_2fa_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| user_2fa_user_id_fkey | FOREIGN KEY | `FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |
| user_2fa_user_id_key | UNIQUE | `UNIQUE (user_id)` |  |  | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| idx_user_2fa_enabled | btree | enabled | não | sim |  | `CREATE INDEX idx_user_2fa_enabled ON public.user_2fa USING btree (enabled)` |
| idx_user_2fa_user_id | btree | user_id | não | sim |  | `CREATE INDEX idx_user_2fa_user_id ON public.user_2fa USING btree (user_id)` |
| user_2fa_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX user_2fa_pkey ON public.user_2fa USING btree (id)` |
| user_2fa_user_id_key | btree | user_id | sim | sim |  | `CREATE UNIQUE INDEX user_2fa_user_id_key ON public.user_2fa USING btree (user_id)` |


## Policies (RLS)

### `Users can insert own 2FA settings`

| campo | valor |
|---|---|
| comando | INSERT |
| tipo | PERMISSIVE |
| roles | public |
| USING |  |
| WITH CHECK | `(auth.uid() = user_id)` |

### `Users can update own 2FA settings`

| campo | valor |
|---|---|
| comando | ALL |
| tipo | PERMISSIVE |
| roles | public |
| USING | `(auth.uid() = user_id)` |
| WITH CHECK |  |

### `Users can view own 2FA settings`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | public |
| USING | `(auth.uid() = user_id)` |
| WITH CHECK |  |


## Triggers

| nome | timing | eventos | nível | status | função |
|---|---|---|---|---|---|
| set_updated_at | BEFORE | UPDATE | ROW | enabled | public.handle_updated_at |
| user_2fa_updated_at | BEFORE | UPDATE | ROW | enabled | public.update_2fa_updated_at |


## Grants

_nenhum_
