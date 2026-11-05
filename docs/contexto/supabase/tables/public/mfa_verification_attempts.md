# public.mfa_verification_attempts

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
| 2 | `user_id` | `uuid` | sim |  |  |  |
| 3 | `method` | `text` | não |  |  |  |
| 4 | `success` | `boolean` | sim | `false` |  |  |
| 5 | `ip_address` | `text` | sim |  |  |  |
| 6 | `user_agent` | `text` | sim |  |  |  |
| 7 | `created_at` | `timestamp with time zone` | sim | `now()` |  |  |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| mfa_verification_attempts_method_check | CHECK | `CHECK (method = ANY (ARRAY['totp'::text, 'sms'::text, 'backup_code'::text]))` |  |  | sim |
| mfa_verification_attempts_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| mfa_verification_attempts_user_id_fkey | FOREIGN KEY | `FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| idx_mfa_attempts_user | btree | user_id, created_at | não | sim |  | `CREATE INDEX idx_mfa_attempts_user ON public.mfa_verification_attempts USING btree (user_id, created_at DESC)` |
| mfa_verification_attempts_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX mfa_verification_attempts_pkey ON public.mfa_verification_attempts USING btree (id)` |


## Policies (RLS)

### `Users can view own MFA attempts`

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
