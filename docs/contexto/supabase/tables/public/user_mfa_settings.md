# public.user_mfa_settings

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
| 3 | `totp_enabled` | `boolean` | sim | `false` |  |  |
| 4 | `totp_secret` | `text` | sim |  |  |  |
| 5 | `totp_verified_at` | `timestamp with time zone` | sim |  |  |  |
| 6 | `sms_enabled` | `boolean` | sim | `false` |  |  |
| 7 | `phone_number` | `text` | sim |  |  |  |
| 8 | `phone_verified_at` | `timestamp with time zone` | sim |  |  |  |
| 9 | `backup_codes` | `text[]` | sim |  |  |  |
| 10 | `backup_codes_generated_at` | `timestamp with time zone` | sim |  |  |  |
| 11 | `preferred_method` | `text` | sim | `'totp'::text` |  |  |
| 12 | `created_at` | `timestamp with time zone` | sim | `now()` |  |  |
| 13 | `updated_at` | `timestamp with time zone` | sim | `now()` |  |  |
| 14 | `migrated_to_native_mfa` | `boolean` | não | `false` |  | true quando o usuário concluiu o enroll TOTP no MFA nativo do Supabase (auth.mfa) |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| user_mfa_settings_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| user_mfa_settings_preferred_method_check | CHECK | `CHECK (preferred_method = ANY (ARRAY['totp'::text, 'sms'::text]))` |  |  | sim |
| user_mfa_settings_user_id_fkey | FOREIGN KEY | `FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |
| user_mfa_settings_user_id_key | UNIQUE | `UNIQUE (user_id)` |  |  | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| idx_mfa_settings_user | btree | user_id | não | sim |  | `CREATE INDEX idx_mfa_settings_user ON public.user_mfa_settings USING btree (user_id)` |
| user_mfa_settings_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX user_mfa_settings_pkey ON public.user_mfa_settings USING btree (id)` |
| user_mfa_settings_user_id_key | btree | user_id | sim | sim |  | `CREATE UNIQUE INDEX user_mfa_settings_user_id_key ON public.user_mfa_settings USING btree (user_id)` |


## Policies (RLS)

### `Authenticated users can insert their own MFA settings`

| campo | valor |
|---|---|
| comando | INSERT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING |  |
| WITH CHECK | `(auth.uid() = user_id)` |

### `Deny direct SELECT - use RPCs`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `false` |
| WITH CHECK |  |

### `Users can update their own MFA settings`

| campo | valor |
|---|---|
| comando | UPDATE |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `(auth.uid() = user_id)` |
| WITH CHECK | `(auth.uid() = user_id)` |


## Triggers

| nome | timing | eventos | nível | status | função |
|---|---|---|---|---|---|
| set_updated_at | BEFORE | UPDATE | ROW | enabled | public.handle_updated_at |
| update_mfa_settings_updated_at | BEFORE | UPDATE | ROW | enabled | public.update_updated_at_column |


## Grants

_nenhum_
