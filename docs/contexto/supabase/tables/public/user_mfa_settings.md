# public.user_mfa_settings

> Configurações de autenticação multifator associadas a cada usuário.

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
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  | Identificador único das configurações de MFA. |
| 2 | `user_id` | `uuid` | não |  |  | Usuário do Supabase Auth dono das configurações de MFA. |
| 3 | `totp_enabled` | `boolean` | sim | `false` |  | Indica se a autenticação TOTP está habilitada. |
| 4 | `totp_secret` | `text` | sim |  |  | Segredo TOTP do usuário; dado de autenticação altamente sensível, não expor a clientes. |
| 5 | `totp_verified_at` | `timestamp with time zone` | sim |  |  | Data e hora em que o segredo TOTP foi verificado. |
| 6 | `sms_enabled` | `boolean` | sim | `false` |  | Indica se a verificação por SMS está habilitada. |
| 7 | `phone_number` | `text` | sim |  |  | Número de telefone associado à verificação por SMS. |
| 8 | `phone_verified_at` | `timestamp with time zone` | sim |  |  | Data e hora em que o telefone foi verificado. |
| 9 | `backup_codes` | `text[]` | sim |  |  | Códigos de recuperação MFA; credenciais sensíveis que não devem ser expostas a terceiros. |
| 10 | `backup_codes_generated_at` | `timestamp with time zone` | sim |  |  | Data e hora da geração mais recente dos códigos de recuperação. |
| 11 | `preferred_method` | `text` | sim | `'totp'::text` |  | Método MFA preferido: totp ou sms. |
| 12 | `created_at` | `timestamp with time zone` | sim | `now()` |  | Data e hora de criação das configurações. |
| 13 | `updated_at` | `timestamp with time zone` | sim | `now()` |  | Data e hora da última atualização das configurações. |
| 14 | `migrated_to_native_mfa` | `boolean` | não | `false` |  | Indica se o usuário concluiu a migração do TOTP para o MFA nativo do Supabase. |


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

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
